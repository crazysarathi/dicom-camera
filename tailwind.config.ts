import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Colour tokens are CSS custom properties (RGB channels) declared in src/styles/globals.css. Referencing
 * them through rgb(var(--…) / <alpha-value>) keeps Tailwind's opacity modifiers (bg-ink/50,
 * text-band-foreground/80) working. Contrast-tested values live in globals.css, not here.
 */
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem' }, screens: { '2xl': '1264px' } },
    extend: {
      colors: {
        /** Page background. */
        surface: token('surface'),
        /** Cards, panels, the footer and the header sheet: the "white" surface of the light design. */
        card: { DEFAULT: token('card'), foreground: token('ink') },
        /** Elevated surface: dialogs, menus, toasts. */
        popover: { DEFAULT: token('popover'), foreground: token('ink') },
        /** Raised pill inside a segmented control (active tab, selected appearance). */
        pill: token('pill'),
        background: token('card'),
        foreground: token('ink'),
        /** Primary text, and the "inverted" fill (bg-ink + text-ink-foreground) used by diagram nodes. */
        ink: { DEFAULT: token('ink'), foreground: token('ink-foreground') },
        /** Secondary text (muted.foreground) and tertiary text (subtle). */
        muted: { DEFAULT: token('surface'), foreground: token('muted-foreground') },
        subtle: token('subtle'),
        line: token('line'),
        border: token('line'),
        input: token('line'),
        /** Focus ring. */
        ring: token('ring'),
        /** Accent: links, filled buttons (foreground is the tested text colour on the fill), hover (deep), tint/selected (soft). */
        primary: { DEFAULT: token('primary'), foreground: token('primary-foreground'), soft: token('primary-soft'), deep: token('primary-deep') },
        /** Subtle fill: chips, hover backgrounds, tab tracks. */
        secondary: { DEFAULT: token('secondary'), foreground: token('ink') },
        hover: token('secondary'),
        selected: token('primary-soft'),
        accent: { DEFAULT: token('teal-soft'), foreground: token('teal') },
        teal: { DEFAULT: token('teal'), foreground: token('teal-foreground'), soft: token('teal-soft') },
        /** Full-bleed ink closing bands. */
        band: { DEFAULT: token('band'), foreground: token('band-foreground'), accent: token('band-accent') },
        /** Dialog and sheet backdrop. */
        overlay: token('overlay'),
        destructive: { DEFAULT: token('destructive'), foreground: token('destructive-foreground') },
        success: { DEFAULT: token('success'), foreground: token('ink-foreground') },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        body: ['1.0625rem', { lineHeight: '1.65' }],
        'body-lg': ['1.125rem', { lineHeight: '1.65' }],
      },
      borderRadius: { lg: '0.75rem', md: '0.5rem', sm: '0.375rem', xl: '1rem', '2xl': '1.5rem' },
      boxShadow: {
        card: '0 1px 2px rgb(var(--c-shadow) / 0.04), 0 8px 24px -12px rgb(var(--c-shadow) / 0.12)',
        screen: '0 24px 60px -24px rgb(var(--c-shadow) / 0.35)',
        secondary: '0 1px 2px rgb(var(--c-shadow) / 0.06)',
        tab: '0 1px 2px rgb(var(--c-shadow) / 0.12), 0 0 0 1px rgb(var(--c-line))',
        button: 'inset 0 1px 0 0 rgb(255 255 255 / 0.18), 0 1px 2px rgb(var(--c-shadow) / 0.16), 0 10px 24px -12px rgb(var(--c-primary-glow) / 0.8)',
        'button-hover': 'inset 0 1px 0 0 rgb(255 255 255 / 0.18), 0 2px 4px rgb(var(--c-shadow) / 0.18), 0 14px 28px -12px rgb(var(--c-primary-glow) / 0.85)',
      },
      dropShadow: {
        hero: '0 28px 48px rgb(var(--c-shadow) / 0.22)',
        screen: '0 24px 40px rgb(var(--c-shadow) / 0.18)',
        gallery: '0 18px 30px rgb(var(--c-shadow) / 0.18)',
      },
      maxWidth: { measure: '68ch', content: '1200px' },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: { 'accordion-down': 'accordion-down 0.2s ease-out', 'accordion-up': 'accordion-up 0.2s ease-out' },
    },
  },
  plugins: [animate],
} satisfies Config;
