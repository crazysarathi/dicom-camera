import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { WebGLRenderer, WebGLRendererParameters } from 'three';
import { useSceneActivity, type Frameloop, type SceneActivity } from './useSceneActivity';

export interface SceneCameraOptions {
  position: [number, number, number];
  fov: number;
  near: number;
  far: number;
}

interface SceneCanvasProps {
  className?: string;
  camera: SceneCameraOptions;
  /** Render prop so the scene contents can read the activity flags (reduced motion, pointer). */
  children: (activity: SceneActivity) => ReactNode;
}

const CONTAINER_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  overflow: 'hidden',
};

const CANVAS_STYLE: CSSProperties = { width: '100%', height: '100%', pointerEvents: 'none' };

const GL: Partial<WebGLRendererParameters> = {
  alpha: true,
  antialias: true,
  powerPreference: 'low-power',
  preserveDrawingBuffer: false,
};

const RESIZE = { scroll: false, debounce: { scroll: 50, resize: 50 } };

function onCreated({ gl }: { gl: WebGLRenderer }) {
  gl.setClearColor(0x000000, 0);
}

/**
 * R3F stops its requestAnimationFrame loop when the frameloop flips to 'demand'; switching back to
 * 'always' does not restart it on its own, so we invalidate once whenever the mode changes. In
 * 'demand' mode the same call produces exactly one still frame.
 */
function FrameloopSync({ frameloop }: { frameloop: Frameloop }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
  }, [frameloop, invalidate]);
  return null;
}

/**
 * Transparent, low-power canvas shell shared by the brand scenes. It fills its positioned parent,
 * ignores pointer input, and pauses the render loop when the tab is hidden, the canvas is scrolled
 * out of view, or the visitor prefers reduced motion.
 */
export function SceneCanvas({ className, camera, children }: SceneCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activity = useSceneActivity(containerRef);

  return (
    <div ref={containerRef} className={className} style={CONTAINER_STYLE}>
      <Canvas
        frameloop={activity.frameloop}
        dpr={[1, 1.5]}
        flat
        gl={GL}
        camera={camera}
        onCreated={onCreated}
        resize={RESIZE}
        style={CANVAS_STYLE}
      >
        <FrameloopSync frameloop={activity.frameloop} />
        {children(activity)}
      </Canvas>
    </div>
  );
}
