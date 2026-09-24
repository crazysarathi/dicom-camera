import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line, RoundedBox } from '@react-three/drei';
import { Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three';
import type { SceneProps } from './index';
import { SceneCanvas, type SceneCameraOptions } from './SceneCanvas';
import { fillLightColor, keyLightColor, scenePalette } from './materials';

export type ConnectivitySceneProps = SceneProps;

/* ---------- Graph layout (world units; the group is rescaled to fit the canvas) ---------- */

type Vec3 = [number, number, number];

const NODE = {
  phone: [-2.15, 0.42, 0.15] as Vec3,
  tablet: [-2.15, -0.72, -0.2] as Vec3,
  serviceTop: [0, 0.82, -0.35] as Vec3,
  serviceMid: [0, 0, 0.4] as Vec3,
  serviceLow: [0, -0.82, -0.35] as Vec3,
  archive: [2.25, 0, 0] as Vec3,
};

interface Edge {
  from: Vec3;
  to: Vec3;
  tone: 'blue' | 'teal';
}

/** Devices fan out to the services (blue); services converge on the archive (teal). */
const EDGES: Edge[] = [
  { from: NODE.phone, to: NODE.serviceTop, tone: 'blue' },
  { from: NODE.phone, to: NODE.serviceMid, tone: 'blue' },
  { from: NODE.phone, to: NODE.serviceLow, tone: 'blue' },
  { from: NODE.tablet, to: NODE.serviceTop, tone: 'blue' },
  { from: NODE.tablet, to: NODE.serviceMid, tone: 'blue' },
  { from: NODE.tablet, to: NODE.serviceLow, tone: 'blue' },
  { from: NODE.serviceTop, to: NODE.archive, tone: 'teal' },
  { from: NODE.serviceMid, to: NODE.archive, tone: 'teal' },
  { from: NODE.serviceLow, to: NODE.archive, tone: 'teal' },
];

/** Width and height the graph needs, including node bodies. */
const GRAPH_WIDTH = 5.6;
const GRAPH_HEIGHT = 2.9;

/* ---------- Motion constants ---------- */

/** Seconds for one pulse to travel an edge. */
const PULSE_PERIOD = 3.4;
/** Slow sway of the whole diagram (radians, seconds). */
const ORBIT_AMPLITUDE_Y = 0.1;
const ORBIT_PERIOD_Y = 28;
const ORBIT_AMPLITUDE_X = 0.03;
const ORBIT_PERIOD_X = 19;
const BASE_TILT_X = -0.1;
/** Fixed pose used when motion is reduced. */
const STILL_TIME = 1.1;
const MAX_DELTA = 0.1;

const CAMERA: SceneCameraOptions = { position: [0, 0.9, 6.4], fov: 30, near: 0.1, far: 30 };

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function Graph({ animate }: { animate: boolean }) {
  const viewport = useThree((state) => state.viewport);
  const fit = Math.min(1, viewport.width / GRAPH_WIDTH, viewport.height / GRAPH_HEIGHT);

  const geometries = useMemo(
    () => ({
      service: new IcosahedronGeometry(0.19, 1),
      pulse: new SphereGeometry(0.042, 12, 10),
    }),
    [],
  );
  const materials = useMemo(
    () => ({
      node: new MeshStandardMaterial({ color: scenePalette.nodeInk, metalness: 0.15, roughness: 0.55 }),
      facet: new MeshStandardMaterial({
        color: scenePalette.nodeInk,
        metalness: 0.15,
        roughness: 0.55,
        flatShading: true,
      }),
      pulseBlue: new MeshBasicMaterial({ color: scenePalette.pulseBlue }),
      pulseTeal: new MeshBasicMaterial({ color: scenePalette.pulseTeal }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
    [geometries, materials],
  );

  const edgeVectors = useMemo(
    () =>
      EDGES.map((edge, index) => ({
        from: new Vector3(...edge.from),
        to: new Vector3(...edge.to),
        // Golden-ratio spacing keeps pulses from bunching up.
        phase: (index * 0.618033) % 1,
      })),
    [],
  );

  const groupRef = useRef<Group>(null);
  const pulseRefs = useRef<(Mesh | null)[]>([]);
  const time = useRef(STILL_TIME);
  const scratch = useMemo(() => new Vector3(), []);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, MAX_DELTA);
    if (animate) time.current += dt;
    const t = animate ? time.current : STILL_TIME;

    if (groupRef.current) {
      groupRef.current.rotation.y = ORBIT_AMPLITUDE_Y * Math.sin((2 * Math.PI * t) / ORBIT_PERIOD_Y);
      groupRef.current.rotation.x = BASE_TILT_X + ORBIT_AMPLITUDE_X * Math.sin((2 * Math.PI * t) / ORBIT_PERIOD_X);
    }

    for (let i = 0; i < edgeVectors.length; i++) {
      const pulse = pulseRefs.current[i];
      if (!pulse) continue;
      const { from, to, phase } = edgeVectors[i];
      const u = (t / PULSE_PERIOD + phase) % 1;
      scratch.copy(from).lerp(to, smoothstep(u));
      pulse.position.copy(scratch);
      // Fade in and out at the ends so pulses appear to emerge from and sink into nodes.
      const s = Math.max(0.001, Math.sin(Math.PI * u));
      pulse.scale.setScalar(s);
    }
  });

  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight position={[-2, 4, 5]} intensity={2} color={keyLightColor} />
      <directionalLight position={[3, 1, 2]} intensity={0.6} color={fillLightColor} />

      <group ref={groupRef} scale={fit} rotation={[BASE_TILT_X, 0, 0]}>
        {/* Devices */}
        <RoundedBox args={[0.36, 0.7, 0.05]} radius={0.05} smoothness={4} position={NODE.phone} rotation={[0, 0.5, 0]} material={materials.node} />
        <RoundedBox args={[0.62, 0.46, 0.05]} radius={0.05} smoothness={4} position={NODE.tablet} rotation={[0, 0.5, 0]} material={materials.node} />

        {/* Services */}
        <mesh geometry={geometries.service} material={materials.facet} position={NODE.serviceTop} rotation={[0.3, 0.2, 0]} />
        <mesh geometry={geometries.service} material={materials.facet} position={NODE.serviceMid} rotation={[0.1, 0.9, 0.2]} />
        <mesh geometry={geometries.service} material={materials.facet} position={NODE.serviceLow} rotation={[-0.2, 1.4, 0.1]} />

        {/* Archive */}
        <RoundedBox args={[0.62, 0.66, 0.62]} radius={0.07} smoothness={4} position={NODE.archive} rotation={[0, 0.6, 0]} material={materials.node} />

        {/* Edges */}
        {EDGES.map((edge, index) => (
          <Line
            key={index}
            points={[edge.from, edge.to]}
            color={scenePalette.edge}
            lineWidth={1.3}
            transparent
            opacity={0.9}
          />
        ))}

        {/* Travelling pulses */}
        {EDGES.map((edge, index) => (
          <mesh
            key={index}
            ref={(mesh) => {
              pulseRefs.current[index] = mesh;
            }}
            geometry={geometries.pulse}
            material={edge.tone === 'blue' ? materials.pulseBlue : materials.pulseTeal}
            position={edge.from}
          />
        ))}
      </group>
    </>
  );
}

/**
 * Abstract connectivity diagram: two device slabs on the left fan out to three faceted service
 * nodes, which converge on a single archive block on the right. Thin hairline edges carry small
 * blue and teal pulses in the direction of the data flow. The whole diagram sways very slowly.
 * No labels (they live in the surrounding HTML) and no external assets.
 */
function ConnectivityScene({ className }: ConnectivitySceneProps) {
  return (
    <SceneCanvas className={className} camera={CAMERA}>
      {({ animate }) => <Graph animate={animate} />}
    </SceneCanvas>
  );
}

export default memo(ConnectivityScene);
