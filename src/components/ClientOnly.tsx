import { useEffect, useState, type ReactNode } from 'react';

/** Renders children only after hydration on the client (for WebGL, GSAP and browser-only APIs). */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children : fallback}</>;
}
