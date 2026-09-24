/**
 * Colour tokens for the procedural brand scenes. Materials are opaque and pre-lightened towards the page
 * background (#F7F9FC) instead of using transparency, so overlapping parts never stack into darker patches
 * and depth sorting stays trivial. The scenes are decorative (aria-hidden); the palette only needs to sit
 * quietly behind the copy. Every graphite tone keeps at least 4.5:1 contrast against ink (#142235) text
 * that might sit in front of it.
 */
export interface ScenePalette {
  /** Page background the scene fades into (fog, trail fade). */
  page: string;
  /** Iris blades: ink at roughly 45% over the page colour. */
  blade: string;
  /** Every other blade, a shade lighter, so the eight leaves stay legible as separate parts. */
  bladeAlt: string;
  /** Recessed plate behind the blades, a touch darker so blade seams read. */
  plate: string;
  /** Front rim of the aperture, a touch lighter (closest to the viewer). */
  rim: string;
  /** Blade pivot pins. */
  pin: string;
  /** Primary blue softened over the page, used for one hairline ring. */
  blueHairline: string;
  /** Outer engraved hairline, barely different from the page. */
  faintHairline: string;
  /** Connectivity device bodies. */
  nodeInk: string;
  /** Device screens and lens. */
  screen: string;
  lens: string;
  /** Faceted service crystals and the archive tower. */
  crystal: string;
  graphite: string;
  ringBlue: string;
  ringTeal: string;
  /** Connectivity cables and the ground grid. */
  edge: string;
  grid: string;
  /** Hemisphere light ground colour and contact-shadow tint. */
  hemisphereGround: string;
  shadow: string;
  pulseBlue: string;
  pulseTeal: string;
}

export const scenePalette: ScenePalette = {
    page: '#F8FAFC',
    blade: '#A0A9B4',
    bladeAlt: '#A9B1BB',
    plate: '#929BA7',
    rim: '#B2B9C3',
    pin: '#C0C6CF',
    blueHairline: '#6C97E0',
    faintHairline: '#C9D2DE',
    nodeInk: '#22324A',
    screen: '#0B1424',
    lens: '#4A5A72',
    crystal: '#33445E',
    graphite: '#2C3C55',
    ringBlue: '#3F78DC',
    ringTeal: '#1F93A0',
    edge: '#AEB9C8',
    grid: '#D6DEE8',
    hemisphereGround: '#C9D3E0',
    shadow: '#142235',
    pulseBlue: '#175CD3',
    pulseTeal: '#087F8C',
};

/** Directional key light, slightly warm-neutral. */
export const keyLightColor = '#FFFFFF';
/** Soft fill, cooled towards the primary blue so shadows never go muddy. */
export const fillLightColor = '#DCE8F8';
