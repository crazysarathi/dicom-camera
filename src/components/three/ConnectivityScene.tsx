import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CubicBezierCurve3,
  CylinderGeometry,
  DodecahedronGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import type { SceneProps } from './index';
import { SceneCanvas, type SceneCameraOptions } from './SceneCanvas';
import { fillLightColor, keyLightColor, scenePalette, type ScenePalette } from './materials';

export type ConnectivitySceneProps = SceneProps;

/* ---------- Layout (world units; the whole graph is rescaled to fit the canvas) ---------- */

type Vec3 = [number, number, number];

/** Nodes are staggered in depth (z) so the graph reads as a volume rather than a diagram. */
const NODE = {
  phone: [-2.4, 0.68, -0.5] as Vec3,
  tablet: [-2.45, -0.6, 0.5] as Vec3,
  serviceTop: [-0.2, 0.9, -0.7] as Vec3,
  serviceMid: [0.2, 0.08, 0.5] as Vec3,
  serviceLow: [-0.1, -0.82, 0.05] as Vec3,
  archive: [2.4, -0.15, -0.1] as Vec3,
};

const GROUND_Y = -1.1;

/**
 * Where cables leave the devices: just inside each slab's right edge (accounting for its yaw), so the
 * tube exits through the edge instead of sprouting from the middle of the screen, and the endpoint
 * stays hidden inside the body while the device bobs.
 */
const PORT = {
  phone: [NODE.phone[0] + 0.14, NODE.phone[1], NODE.phone[2] - 0.09] as Vec3,
  tablet: [NODE.tablet[0] + 0.34, NODE.tablet[1], NODE.tablet[2] - 0.18] as Vec3,
};

/* Colours come from the scene palette (see materials.ts). */

type Tone = 'blue' | 'teal';
type TargetId = 'serviceTop' | 'serviceMid' | 'serviceLow' | 'archive';

interface EdgeDef {
  from: Vec3;
  to: Vec3;
  tone: Tone;
  target: TargetId;
  /** Seconds for one packet traversal. */
  period: number;
}

const TARGET_INDEX: Record<TargetId, number> = { serviceTop: 0, serviceMid: 1, serviceLow: 2, archive: 3 };

/** Devices fan out to the services (blue); services converge on the archive (teal). */
const EDGES: EdgeDef[] = [
  { from: PORT.phone, to: NODE.serviceTop, tone: 'blue', target: 'serviceTop', period: 7.2 },
  { from: PORT.phone, to: NODE.serviceMid, tone: 'blue', target: 'serviceMid', period: 8.6 },
  { from: PORT.phone, to: NODE.serviceLow, tone: 'blue', target: 'serviceLow', period: 9.4 },
  { from: PORT.tablet, to: NODE.serviceTop, tone: 'blue', target: 'serviceTop', period: 9.8 },
  { from: PORT.tablet, to: NODE.serviceMid, tone: 'blue', target: 'serviceMid', period: 7.8 },
  { from: PORT.tablet, to: NODE.serviceLow, tone: 'blue', target: 'serviceLow', period: 8.2 },
  { from: NODE.serviceTop, to: NODE.archive, tone: 'teal', target: 'archive', period: 8.9 },
  { from: NODE.serviceMid, to: NODE.archive, tone: 'teal', target: 'archive', period: 7.5 },
  { from: NODE.serviceLow, to: NODE.archive, tone: 'teal', target: 'archive', period: 9.1 },
];

/** Extent the graph needs (nodes, rings and ground), with a little breathing room. */
const FIT_WIDTH = 6.2;
const FIT_HEIGHT = 2.9;
const FIT_MAX = 1.35;

/* ---------- Motion constants ---------- */

const TRAIL_POINTS = 5;
/** Gap between trail points as a fraction of the edge. */
const TRAIL_SPACING = 0.022;
const RING_RATE = (2 * Math.PI) / 60; // 1 rpm
const ARCHIVE_RATE = (2 * Math.PI) / 75;
const ORBIT_PERIOD = 20;
const ORBIT_AMPLITUDE = 0.07; // radians (about 4 degrees)
const ELEVATION_PERIOD = 27;
const ELEVATION_AMPLITUDE = 0.02;
const PARALLAX_AZ = 0.045;
const PARALLAX_EL = 0.03;
const PULSE_DECAY = 2.4;
const STILL_TIME = 5.3;
const MAX_DELTA = 0.1;
/**
 * Render layer for cables, rings, packets and the grid. The main camera sees layers 0 and 1; the
 * contact-shadow camera only sees layer 0, so just the solid bodies cast shadows and the ground
 * stays clean instead of being streaked by every thin line.
 */
const NO_SHADOW_LAYER = 1;

/** Camera orbit: distance, azimuth (from the right) and elevation (looking down). */
const CAM_TARGET = new Vector3(0, 0.0, 0);
const CAM_RADIUS = 7.6;
const CAM_AZIMUTH = 0.24;
const CAM_ELEVATION = 0.3;

function orbitPosition(azimuth: number, elevation: number, out: Vector3): Vector3 {
  const c = Math.cos(elevation);
  return out.set(Math.sin(azimuth) * c, Math.sin(elevation), Math.cos(azimuth) * c).multiplyScalar(CAM_RADIUS).add(CAM_TARGET);
}

const CAMERA: SceneCameraOptions = {
  position: orbitPosition(CAM_AZIMUTH, CAM_ELEVATION, new Vector3()).toArray() as Vec3,
  fov: 35,
  near: 0.1,
  far: 40,
};

function easeInOut(t: number): number {
  return t * t * (3 - 2 * t);
}

/** 0 at both ends, 1 across the middle: packets emerge from and sink into the nodes. */
function endFade(u: number): number {
  const edge = 0.12;
  if (u < edge) return easeInOut(u / edge);
  if (u > 1 - edge) return easeInOut((1 - u) / edge);
  return 1;
}

/** S-curve between two nodes with horizontal tangents, so cables leave and enter sideways. */
function makeCurve(from: Vec3, to: Vec3): CubicBezierCurve3 {
  const a = new Vector3(...from);
  const b = new Vector3(...to);
  const pull = Math.abs(b.x - a.x) * 0.5;
  const c1 = new Vector3(a.x + pull, a.y, a.z + (b.z - a.z) * 0.15);
  const c2 = new Vector3(b.x - pull, b.y, b.z - (b.z - a.z) * 0.15);
  const curve = new CubicBezierCurve3(a, c1, c2, b);
  curve.arcLengthDivisions = 64;
  curve.getLengths(); // warm the arc-length cache so per-frame lookups never allocate
  return curve;
}

function buildGridGeometry(): BufferGeometry {
  const halfX = 4.5;
  const halfZ = 2.5;
  const step = 0.5;
  const verts: number[] = [];
  for (let x = -halfX; x <= halfX + 1e-6; x += step) verts.push(x, 0, -halfZ, x, 0, halfZ);
  for (let z = -halfZ; z <= halfZ + 1e-6; z += step) verts.push(-halfX, 0, z, halfX, 0, z);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(verts, 3));
  return geometry;
}

/* ---------- Camera rig: slow orbit sway plus pointer parallax ---------- */

function CameraRig({ animate, finePointer }: { animate: boolean; finePointer: boolean }) {
  const camera = useThree((state) => state.camera);
  const time = useRef(STILL_TIME);
  const pointer = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });
  const scratch = useMemo(() => new Vector3(), []);

  useEffect(() => {
    camera.layers.enable(NO_SHADOW_LAYER);
    camera.position.copy(orbitPosition(CAM_AZIMUTH, CAM_ELEVATION, scratch));
    camera.lookAt(CAM_TARGET);
  }, [camera, scratch]);

  useEffect(() => {
    if (!animate || !finePointer || typeof window === 'undefined') return;
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [animate, finePointer]);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, MAX_DELTA);
    if (animate) time.current += dt;
    const t = animate ? time.current : STILL_TIME;
    const k = 1 - Math.exp(-dt * 2.5);
    eased.current.x += (pointer.current.x - eased.current.x) * k;
    eased.current.y += (pointer.current.y - eased.current.y) * k;

    const azimuth =
      CAM_AZIMUTH + ORBIT_AMPLITUDE * Math.sin((2 * Math.PI * t) / ORBIT_PERIOD) + eased.current.x * PARALLAX_AZ;
    const elevation =
      CAM_ELEVATION + ELEVATION_AMPLITUDE * Math.sin((2 * Math.PI * t) / ELEVATION_PERIOD) - eased.current.y * PARALLAX_EL;
    camera.position.copy(orbitPosition(azimuth, elevation, scratch));
    camera.lookAt(CAM_TARGET);
  });

  return null;
}

/* ---------- Device slab: rounded body, darker screen inset, camera dot ---------- */

interface DeviceProps {
  size: [number, number];
  position: Vec3;
  rotation: Vec3;
  body: MeshStandardMaterial;
  screen: MeshStandardMaterial;
  lens: MeshBasicMaterial;
  groupRef: (group: Group | null) => void;
}

function Device({ size, position, rotation, body, screen, lens, groupRef }: DeviceProps) {
  const [w, h] = size;
  const depth = 0.07;
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <RoundedBox args={[w, h, depth]} radius={0.045} smoothness={4} material={body} />
      <mesh material={screen} position={[0, 0, depth / 2 + 0.002]}>
        <boxGeometry args={[w - 0.07, h - 0.1, 0.004]} />
      </mesh>
      <mesh material={lens} position={[0, h / 2 - 0.03, depth / 2 + 0.005]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.004, 12]} />
      </mesh>
    </group>
  );
}

/* ---------- The graph ---------- */

interface TargetRefs {
  /** Crystal meshes for the three services, the disc stack group for the archive. */
  meshes: (Object3D | null)[];
  materials: MeshStandardMaterial[];
}

/** Material set built from the scene palette. */
function buildMaterials(palette: ScenePalette) {
  const crystal = () =>
    new MeshStandardMaterial({ color: palette.crystal, metalness: 0.12, roughness: 0.6, flatShading: true, emissive: new Color(0x000000) });
  return {
    body: new MeshStandardMaterial({ color: palette.nodeInk, metalness: 0.25, roughness: 0.45 }),
    screen: new MeshStandardMaterial({ color: palette.screen, metalness: 0.4, roughness: 0.25 }),
    lens: new MeshBasicMaterial({ color: palette.lens }),
    targets: [crystal(), crystal(), crystal(), new MeshStandardMaterial({ color: palette.graphite, metalness: 0.3, roughness: 0.4, emissive: new Color(0x000000) })],
    ringBlue: new MeshBasicMaterial({ color: palette.ringBlue }),
    ringTeal: new MeshBasicMaterial({ color: palette.ringTeal }),
    discLine: new MeshBasicMaterial({ color: palette.ringBlue }),
    led: new MeshBasicMaterial({ color: palette.pulseBlue }),
    edge: new MeshBasicMaterial({ color: palette.edge, transparent: true, opacity: 0.55, depthWrite: false }),
    packetBlue: new MeshStandardMaterial({ color: palette.pulseBlue, emissive: new Color(palette.pulseBlue), emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.2 }),
    packetTeal: new MeshStandardMaterial({ color: palette.pulseTeal, emissive: new Color(palette.pulseTeal), emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.2 }),
    trail: new MeshBasicMaterial({ color: '#FFFFFF' }),
    grid: new LineBasicMaterial({ color: palette.grid, transparent: true, opacity: 0.55 }),
  };
}

function Graph({ animate, finePointer }: { animate: boolean; finePointer: boolean }) {
  const palette = scenePalette;
  const viewport = useThree((state) => state.viewport);
  const fit = Math.min(FIT_MAX, (viewport.width * 0.96) / FIT_WIDTH, (viewport.height * 0.96) / FIT_HEIGHT);

  const curves = useMemo(() => EDGES.map((edge) => makeCurve(edge.from, edge.to)), []);

  const geometries = useMemo(
    () => ({
      crystalA: new IcosahedronGeometry(0.28, 0),
      crystalB: new DodecahedronGeometry(0.26, 0),
      ringLarge: new TorusGeometry(0.4, 0.008, 5, 48),
      ringSmall: new TorusGeometry(0.33, 0.007, 5, 40),
      disc: new CylinderGeometry(0.3, 0.3, 0.11, 40),
      discLine: new TorusGeometry(0.29, 0.005, 4, 48),
      led: new BoxGeometry(0.045, 0.01, 0.01),
      packet: new SphereGeometry(0.06, 12, 8),
      trail: new SphereGeometry(0.032, 6, 5),
      grid: buildGridGeometry(),
      tubes: curves.map((curve) => new TubeGeometry(curve, 28, 0.011, 5, false)),
    }),
    [curves],
  );

  const materials = useMemo(() => buildMaterials(palette), [palette]);

  useEffect(
    () => () => {
      const { tubes, ...single } = geometries;
      tubes.forEach((g) => g.dispose());
      Object.values(single).forEach((g) => g.dispose());
      const { targets, ...rest } = materials;
      targets.forEach((m) => m.dispose());
      Object.values(rest).forEach((m) => m.dispose());
    },
    [geometries, materials],
  );

  const edges = useMemo(
    () =>
      EDGES.map((edge, index) => ({
        curve: curves[index],
        phase: (index * 0.618033) % 1,
        period: edge.period,
        target: TARGET_INDEX[edge.target],
      })),
    [curves],
  );

  /** Per-instance trail colours fade from the packet tone toward the page colour. */
  const trailColors = useMemo(() => {
    const page = new Color(palette.page);
    return EDGES.flatMap((edge) => {
      const tone = new Color(edge.tone === 'blue' ? palette.pulseBlue : palette.pulseTeal);
      return Array.from({ length: TRAIL_POINTS }, (_, k) => tone.clone().lerp(page, 0.25 + (k / TRAIL_POINTS) * 0.65));
    });
  }, [palette]);

  const trailRef = useRef<InstancedMesh>(null);
  useEffect(() => {
    const mesh = trailRef.current;
    if (!mesh) return;
    mesh.layers.set(NO_SHADOW_LAYER);
    trailColors.forEach((color, i) => mesh.setColorAt(i, color));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [trailColors]);

  /** Ref callback that moves an object to the shadow-free layer. */
  const noShadow = useCallback((object: Object3D | null) => {
    object?.layers.set(NO_SHADOW_LAYER);
  }, []);
  const packetRefs = useRef<(Mesh | null)[]>([]);
  const ringRefs = useRef<(Group | null)[]>([]);
  const deviceRefs = useRef<(Group | null)[]>([]);
  const archiveRef = useRef<Group>(null);
  const targets = useRef<TargetRefs>({ meshes: [], materials: materials.targets });
  // Keep the frame loop's material handles current if the set is ever rebuilt.
  useEffect(() => {
    targets.current.materials = materials.targets;
  }, [materials]);
  const pulses = useMemo(() => new Float32Array(4), []);
  const lastU = useMemo(() => new Float32Array(EDGES.length).fill(-1), []);
  const time = useRef(STILL_TIME);
  const dummy = useMemo(() => new Object3D(), []);
  const scratch = useMemo(() => new Vector3(), []);
  const toneColors = useMemo(
    () => [new Color(palette.pulseBlue), new Color(palette.pulseBlue), new Color(palette.pulseBlue), new Color(palette.pulseTeal)],
    [palette],
  );

  useFrame((_state, delta) => {
    const dt = Math.min(delta, MAX_DELTA);
    if (animate) time.current += dt;
    const t = animate ? time.current : STILL_TIME;

    // Devices: slow bob and a whisper of roll.
    for (let i = 0; i < deviceRefs.current.length; i++) {
      const device = deviceRefs.current[i];
      if (!device) continue;
      const base = i === 0 ? NODE.phone : NODE.tablet;
      const phase = i * 1.9;
      device.position.y = base[1] + 0.06 * Math.sin((2 * Math.PI * t) / 6.5 + phase);
      device.rotation.z = (i === 0 ? -0.06 : 0.04) + 0.025 * Math.sin((2 * Math.PI * t) / 9 + phase);
    }

    // Rings precess around the vertical axis; the archive tower turns slowly.
    for (let i = 0; i < ringRefs.current.length; i++) {
      const ring = ringRefs.current[i];
      if (ring) ring.rotation.y = (i % 2 === 0 ? 1 : -1) * RING_RATE * t + i * 0.7;
    }
    if (archiveRef.current) archiveRef.current.rotation.y = ARCHIVE_RATE * t;

    // Packets and trails.
    const trail = trailRef.current;
    for (let i = 0; i < edges.length; i++) {
      const { curve, phase, period, target } = edges[i];
      const u = (t / period + phase) % 1;
      if (animate && lastU[i] >= 0 && u < lastU[i]) pulses[target] = 1;
      lastU[i] = u;

      const packet = packetRefs.current[i];
      if (packet) {
        curve.getPointAt(u, scratch);
        packet.position.copy(scratch);
        packet.scale.setScalar(Math.max(0.001, endFade(u)));
      }
      if (trail) {
        for (let k = 0; k < TRAIL_POINTS; k++) {
          const uk = u - (k + 1) * TRAIL_SPACING;
          const visible = uk > 0.01 ? endFade(uk) * (1 - k / (TRAIL_POINTS + 1)) : 0;
          if (visible > 0.001) {
            curve.getPointAt(uk, scratch);
            dummy.position.copy(scratch);
            dummy.scale.setScalar(visible);
          } else {
            dummy.position.set(0, -50, 0);
            dummy.scale.setScalar(0.001);
          }
          dummy.updateMatrix();
          trail.setMatrixAt(i * TRAIL_POINTS + k, dummy.matrix);
        }
      }
    }
    if (trail) trail.instanceMatrix.needsUpdate = true;

    // Arrival pulses: a soft swell and a brief tint on the node that just received a packet.
    const decay = Math.exp(-dt * PULSE_DECAY);
    for (let n = 0; n < 4; n++) {
      pulses[n] *= decay;
      const p = pulses[n];
      const archive = n === 3;
      const mesh = targets.current.meshes[n];
      if (mesh) mesh.scale.setScalar(1 + (archive ? 0.05 : 0.16) * p);
      const material = targets.current.materials[n];
      material.emissive.copy(toneColors[n]);
      material.emissiveIntensity = (archive ? 0.12 : 0.45) * p;
    }
  });

  const services: { key: TargetId; position: Vec3; geometry: BufferGeometry; rotation: Vec3; ringTilt: [Vec3, Vec3] }[] = [
    { key: 'serviceTop', position: NODE.serviceTop, geometry: geometries.crystalA, rotation: [0.3, 0.2, 0.1], ringTilt: [[0.42, 0, 0.18], [-0.35, 0, -0.5]] },
    { key: 'serviceMid', position: NODE.serviceMid, geometry: geometries.crystalB, rotation: [0.1, 0.9, 0.2], ringTilt: [[0.3, 0, -0.4], [-0.5, 0, 0.25]] },
    { key: 'serviceLow', position: NODE.serviceLow, geometry: geometries.crystalA, rotation: [-0.2, 1.4, 0.35], ringTilt: [[0.5, 0, 0.3], [-0.3, 0, -0.35]] },
  ];

  const discOffsets = [-0.3, -0.1, 0.1, 0.3];

  return (
    <>
      <fog attach="fog" args={[palette.page, 6.8, 13]} />
      <hemisphereLight args={['#FFFFFF', palette.hemisphereGround, 1.1]} />
      <directionalLight position={[-3, 5, 4]} intensity={2.1} color={keyLightColor} />
      <directionalLight position={[4, 2.5, -4]} intensity={1.1} color={fillLightColor} />
      <directionalLight position={[3, -1, 3]} intensity={0.35} color={fillLightColor} />

      <CameraRig animate={animate} finePointer={finePointer} />

      <group scale={fit}>
        {/* Ground: faint grid that recedes into the fog, plus soft contact shadows. */}
        <lineSegments ref={noShadow} geometry={geometries.grid} material={materials.grid} position={[0, GROUND_Y - 0.01, -0.2]} />
        <ContactShadows
          position={[0, GROUND_Y, -0.2]}
          scale={[9, 6]}
          blur={0.9}
          opacity={0.3}
          far={2.6}
          resolution={256}
          color={palette.shadow}
          frames={Infinity}
        />

        {/* Devices */}
        <Device
          size={[0.42, 0.84]}
          position={NODE.phone}
          rotation={[0.04, 0.58, -0.06]}
          body={materials.body}
          screen={materials.screen}
          lens={materials.lens}
          groupRef={(g) => { deviceRefs.current[0] = g; }}
        />
        <Device
          size={[0.9, 0.64]}
          position={NODE.tablet}
          rotation={[-0.1, 0.5, 0.04]}
          body={materials.body}
          screen={materials.screen}
          lens={materials.lens}
          groupRef={(g) => { deviceRefs.current[1] = g; }}
        />

        {/* Services: faceted crystals, each with two precessing rings */}
        {services.map((service, index) => (
          <group key={service.key} position={service.position}>
            <mesh
              ref={(mesh) => { targets.current.meshes[TARGET_INDEX[service.key]] = mesh; }}
              geometry={service.geometry}
              material={materials.targets[TARGET_INDEX[service.key]]}
              rotation={service.rotation}
            />
            <group ref={(g) => { ringRefs.current[index * 2] = g; }}>
              <mesh ref={noShadow} geometry={geometries.ringLarge} material={materials.ringBlue} rotation={[Math.PI / 2 + service.ringTilt[0][0], 0, service.ringTilt[0][2]]} />
            </group>
            <group ref={(g) => { ringRefs.current[index * 2 + 1] = g; }}>
              <mesh ref={noShadow} geometry={geometries.ringSmall} material={materials.ringTeal} rotation={[Math.PI / 2 + service.ringTilt[1][0], 0, service.ringTilt[1][2]]} />
            </group>
          </group>
        ))}

        {/* Archive: a tower of stacked discs with hairline blue seams and a status slit */}
        <group position={NODE.archive}>
          <group ref={archiveRef}>
            <group ref={(group) => { targets.current.meshes[3] = group; }}>
              {discOffsets.map((y, i) => (
                <group key={i} position={[0, y, 0]}>
                  <mesh geometry={geometries.disc} material={materials.targets[3]} />
                  {i > 0 && <mesh geometry={geometries.discLine} material={materials.discLine} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} />}
                  <mesh geometry={geometries.led} material={materials.led} position={[0.17, 0.005, 0.25]} />
                </group>
              ))}
            </group>
          </group>
        </group>

        {/* Connections: thin translucent tubes along smooth S-curves */}
        {geometries.tubes.map((tube, index) => (
          <mesh key={index} ref={noShadow} geometry={tube} material={materials.edge} />
        ))}

        {/* Packets and their comet trails */}
        {EDGES.map((edge, index) => (
          <mesh
            key={index}
            ref={(mesh) => { packetRefs.current[index] = mesh; noShadow(mesh); }}
            geometry={geometries.packet}
            material={edge.tone === 'blue' ? materials.packetBlue : materials.packetTeal}
            position={edge.from}
          />
        ))}
        <instancedMesh ref={trailRef} args={[geometries.trail, materials.trail, EDGES.length * TRAIL_POINTS]} frustumCulled={false} />
      </group>
    </>
  );
}

/**
 * Abstract connectivity picture: two floating device slabs on the left fan out through three faceted
 * service crystals (each with precessing accent rings) to a stacked archive tower on the right. Data
 * packets travel along smooth cables with short comet trails and make the receiving node swell for a
 * moment. A perspective camera sways slowly around the graph over a faint ground grid with soft
 * contact shadows, so the composition reads as a volume. No labels and no external assets.
 */
function ConnectivityScene({ className }: ConnectivitySceneProps) {
  return (
    <SceneCanvas className={className} camera={CAMERA}>
      {({ animate, finePointer }) => <Graph animate={animate} finePointer={finePointer} />}
    </SceneCanvas>
  );
}

export default memo(ConnectivityScene);
