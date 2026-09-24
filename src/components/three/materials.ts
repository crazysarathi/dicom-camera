/**
 * Shared colour tokens for the procedural brand scenes. Materials are opaque and pre-lightened
 * towards the page background (#F7F9FC) instead of using transparency, so overlapping parts never
 * stack into darker patches and depth sorting stays trivial. Every graphite tone keeps at least
 * 4.5:1 contrast against ink (#142235) text that might sit in front of it.
 */
export const scenePalette = {
  /** Iris blades: ink at roughly 45% over the page colour. */
  blade: '#A0A9B4',
  /** Every other blade, a shade lighter, so the eight leaves stay legible as separate parts. */
  bladeAlt: '#A9B1BB',
  /** Recessed plate behind the blades, a touch darker so blade seams read. */
  plate: '#929BA7',
  /** Front rim of the aperture, a touch lighter (closest to the viewer). */
  rim: '#B2B9C3',
  /** Blade pivot pins. */
  pin: '#C0C6CF',
  /** Primary blue (#175CD3) softened over the page, used for one hairline ring and pulses. */
  blueHairline: '#6C97E0',
  /** Outer engraved hairline, barely darker than the page. */
  faintHairline: '#C9D2DE',
  /** Connectivity nodes: ink lifted slightly so lit facets stay readable. */
  nodeInk: '#22324A',
  /** Connectivity edges. */
  edge: '#A3AFBE',
  pulseBlue: '#175CD3',
  pulseTeal: '#087F8C',
} as const;

/** Directional key light, slightly warm-neutral. */
export const keyLightColor = '#FFFFFF';
/** Soft fill, cooled towards the primary blue so shadows never go muddy. */
export const fillLightColor = '#DCE8F8';
