import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RingGeometry,
  Shape,
  TorusGeometry,
} from 'three';
import type { SceneProps } from './index';
import { SceneCanvas, type SceneCameraOptions } from './SceneCanvas';
import { fillLightColor, keyLightColor, scenePalette } from './materials';

export interface HeroSceneProps extends SceneProps {
  /**
   * Where the aperture sits inside the canvas.
   * 'auto' (default): off-centre top-right on wide (two-column) containers; low and to the right on
   * narrow single-column containers, where the headline and lede span the full width at the top,
   * so the iris sits behind the screenshot band instead of behind the copy. 'center' fills the
   * canvas evenly (for an aside column). 'right' forces the wide behaviour.
   */
  placement?: 'auto' | 'right' | 'center';
}

/* ---------- Geometry constants (world units; the whole iris is rescaled to fit the canvas) ---------- */

const BLADE_COUNT = 8;
/** Radius of the circle the blade pivots sit on. */
const R_PIVOT = 0.92;
/** Radius of the blade outer arc, tucked under the front rim. */
const R_BLADE_OUTER = 1.04;
/** Blade rotation about its pivot: PHI_MIN = widest opening, PHI_MAX = most closed. */
const PHI_MIN = 0.66;
const PHI_MAX = 1.0;
/** Overall radius used to fit the artwork into the canvas (outer hairline). */
const R_TOTAL = 1.3;
/**
 * Containers wider than this (width / height) use the two-column composition. Two-column heroes
 * sit around 1.3-1.5 at 1024px wide; single-column heroes are well below 1 because the copy,
 * actions and screenshot stack vertically.
 */
const WIDE_ASPECT = 1.15;

const BLADE_Z0 = 0.02;
const BLADE_Z_STEP = 0.007;
const BLADE_DEPTH = 0.012;
const PIN_Z = BLADE_Z0 + BLADE_COUNT * BLADE_Z_STEP + BLADE_DEPTH + 0.006;
const RIM_Z = 0.13;

/* ---------- Motion constants ---------- */

/** One full open -> close -> open breath. */
const BREATH_PERIOD = 12;
/** One revolution per minute. */
const SPIN_RATE = (2 * Math.PI) / 60;
/** Base tilt of the whole iris so it reads as a plate in space rather than a flat logo. */
const BASE_TILT_X = -0.3;
const BASE_TILT_Y = 0.38;
/** Pointer parallax amplitude in radians (about 4 and 3 degrees). */
const PARALLAX_Y = 0.07;
const PARALLAX_X = 0.05;
/** Fixed pose used when motion is reduced (mid-breath). */
const STILL_TIME = BREATH_PERIOD / 4;
/** Clamp delta so a paused loop never jumps on resume. */
const MAX_DELTA = 0.1;

const CAMERA: SceneCameraOptions = { position: [0, 0, 7], fov: 28, near: 0.1, far: 30 };

/**
 * Blade outline in blade-local space: the pivot is the origin and the blade's straight inner edge
 * runs along +x. The outer edge is an arc of the ring circle as seen at the widest pose, so as the
 * blade rotates inward (closing) every point moves towards the centre and stays under the rim.
 */
function buildBladeShape(): Shape {
  const cx = R_PIVOT * Math.sin(PHI_MIN);
  const cy = R_PIVOT * Math.cos(PHI_MIN);
  const halfChord = Math.sqrt(R_BLADE_OUTER * R_BLADE_OUTER - cy * cy);
  const tipX = cx + halfChord;
  // Point on the outer circle closest to the pivot.
  const k = 1 - R_BLADE_OUTER / R_PIVOT;
  const qx = cx * k;
  const qy = cy * k;
  const angleTip = Math.atan2(-cy, halfChord);
  const angleQ = Math.atan2(qy - cy, qx - cx);

  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(tipX, 0);
  shape.absarc(cx, cy, R_BLADE_OUTER, angleTip, angleQ, true);
  shape.closePath();
  return shape;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

interface Placement {
  x: number;
  y: number;
  scale: number;
}

function computePlacement(vw: number, vh: number, mode: NonNullable<HeroSceneProps['placement']>): Placement {
  const wide = mode === 'right' || (mode === 'auto' && vw / vh > WIDE_ASPECT);
  if (wide) {
    const diameter = Math.min(0.96 * vh, 0.5 * vw);
    const r = diameter / 2;
    return { x: Math.min(0.3 * vw, vw / 2 - 0.78 * r), y: 0.04 * vh, scale: r / R_TOTAL };
  }
  if (mode === 'center') {
    const diameter = 0.86 * Math.min(vw, vh);
    return { x: 0, y: 0, scale: diameter / 2 / R_TOTAL };
  }
  // Narrow 'auto' (single-column layouts): the headline and lede span the full width at the top,
  // so the iris sits in the lower right, behind the screenshot band, partly cropped by the right
  // edge. Its centre is 30% of the height above the bottom edge, which keeps it clear of the
  // actions above the screenshot and the supporting line below it.
  const diameter = 0.78 * vw;
  return { x: 0.16 * vw, y: -0.2 * vh, scale: diameter / 2 / R_TOTAL };
}

interface IrisProps {
  animate: boolean;
  finePointer: boolean;
  placement: NonNullable<HeroSceneProps['placement']>;
}

function Iris({ animate, finePointer, placement }: IrisProps) {
  const viewport = useThree((state) => state.viewport);
  const place = computePlacement(viewport.width, viewport.height, placement);

  const geometries = useMemo(
    () => ({
      blade: new ExtrudeGeometry(buildBladeShape(), {
        depth: BLADE_DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.004,
        bevelSize: 0.005,
        bevelOffset: 0,
        bevelSegments: 2,
        curveSegments: 28,
      }),
      plate: new RingGeometry(0.8, 1.12, 96, 1),
      rim: new TorusGeometry(1.03, 0.05, 14, 128),
      blueHairline: new TorusGeometry(1.17, 0.0065, 6, 160),
      faintHairline: new TorusGeometry(R_TOTAL, 0.005, 6, 160),
      pin: new CylinderGeometry(0.022, 0.022, 0.012, 20),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      blade: new MeshStandardMaterial({ color: scenePalette.blade, metalness: 0.2, roughness: 0.5 }),
      bladeAlt: new MeshStandardMaterial({ color: scenePalette.bladeAlt, metalness: 0.2, roughness: 0.5 }),
      plate: new MeshStandardMaterial({ color: scenePalette.plate, metalness: 0.1, roughness: 0.7 }),
      rim: new MeshStandardMaterial({ color: scenePalette.rim, metalness: 0.3, roughness: 0.4 }),
      pin: new MeshStandardMaterial({ color: scenePalette.pin, metalness: 0.3, roughness: 0.4 }),
      blueHairline: new MeshBasicMaterial({ color: scenePalette.blueHairline }),
      faintHairline: new MeshBasicMaterial({ color: scenePalette.faintHairline }),
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

  const bladeAngles = useMemo(
    () => Array.from({ length: BLADE_COUNT }, (_, i) => (i / BLADE_COUNT) * Math.PI * 2),
    [],
  );

  const tiltRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
  const bladeRefs = useRef<(Mesh | null)[]>([]);
  const time = useRef(STILL_TIME);
  const pointerTarget = useRef({ x: 0, y: 0 });
  const tilt = useRef({ x: BASE_TILT_X, y: BASE_TILT_Y });

  useEffect(() => {
    if (!animate || !finePointer) {
      pointerTarget.current = { x: 0, y: 0 };
      return;
    }
    const onMove = (event: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      pointerTarget.current = {
        x: (event.clientX / w - 0.5) * 2,
        y: (event.clientY / h - 0.5) * 2,
      };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [animate, finePointer]);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, MAX_DELTA);
    if (animate) time.current += dt;
    const t = animate ? time.current : STILL_TIME;

    // Aperture breathing: eased cosine between the widest and most closed pose.
    const breath = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / BREATH_PERIOD);
    const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * smoothstep(breath);
    for (let i = 0; i < BLADE_COUNT; i++) {
      const blade = bladeRefs.current[i];
      if (blade) blade.rotation.z = bladeAngles[i] + Math.PI / 2 + phi;
    }

    if (spinRef.current) spinRef.current.rotation.z = t * SPIN_RATE;

    // Pointer parallax, exponentially smoothed.
    const targetX = BASE_TILT_X - pointerTarget.current.y * PARALLAX_X;
    const targetY = BASE_TILT_Y + pointerTarget.current.x * PARALLAX_Y;
    if (animate) {
      const k = 1 - Math.exp(-dt * 3);
      tilt.current.x += (targetX - tilt.current.x) * k;
      tilt.current.y += (targetY - tilt.current.y) * k;
    } else {
      tilt.current.x = BASE_TILT_X;
      tilt.current.y = BASE_TILT_Y;
    }
    if (tiltRef.current) {
      tiltRef.current.rotation.x = tilt.current.x;
      tiltRef.current.rotation.y = tilt.current.y;
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[-3, 4, 5]} intensity={2.1} color={keyLightColor} />
      <directionalLight position={[4, -2, 3]} intensity={0.7} color={fillLightColor} />

      <group position={[place.x, place.y, 0]} scale={place.scale}>
        <group ref={tiltRef} rotation={[BASE_TILT_X, BASE_TILT_Y, 0]}>
          <group ref={spinRef}>
            <mesh geometry={geometries.plate} material={materials.plate} />
            {bladeAngles.map((theta, i) => (
              <mesh
                key={theta}
                ref={(mesh) => {
                  bladeRefs.current[i] = mesh;
                }}
                geometry={geometries.blade}
                material={i % 2 ? materials.bladeAlt : materials.blade}
                position={[R_PIVOT * Math.cos(theta), R_PIVOT * Math.sin(theta), BLADE_Z0 + i * BLADE_Z_STEP]}
                rotation={[0, 0, theta + Math.PI / 2 + PHI_MIN]}
              />
            ))}
            {bladeAngles.map((theta) => (
              <mesh
                key={theta}
                geometry={geometries.pin}
                material={materials.pin}
                position={[R_PIVOT * Math.cos(theta), R_PIVOT * Math.sin(theta), PIN_Z]}
                rotation={[Math.PI / 2, 0, 0]}
              />
            ))}
          </group>
          <mesh geometry={geometries.rim} material={materials.rim} position={[0, 0, RIM_Z]} />
          <mesh geometry={geometries.blueHairline} material={materials.blueHairline} position={[0, 0, 0.05]} />
          <mesh geometry={geometries.faintHairline} material={materials.faintHairline} position={[0, 0, 0.05]} />
        </group>
      </group>
    </>
  );
}

/**
 * Procedural camera aperture: eight overlapping iris blades inside a thin rim, breathing slowly and
 * turning at one revolution per minute, with a gentle pointer parallax on precise-pointer devices.
 * Rendered as a soft graphite engraving behind the hero copy. No external assets are loaded.
 */
function HeroScene({ className, placement = 'auto' }: HeroSceneProps) {
  return (
    <SceneCanvas className={className} camera={CAMERA}>
      {({ animate, finePointer }) => <Iris animate={animate} finePointer={finePointer} placement={placement} />}
    </SceneCanvas>
  );
}

export default memo(HeroScene);
