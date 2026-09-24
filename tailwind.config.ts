import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

// Palette from the developer brief (website design choices, not brand standards).
const palette = {
  surface: '#F7F9FC',
  white: '#FFFFFF',
  ink: '#142235',
  muted: '#526173',
  primary: '#175CD3',
  teal: '#087F8C',
  line: '#DCE3EC',
};

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem' }, screens: { '2xl': '1264px' } },
    extend: {
      colors: {
        surface: palette.surface,
        ink: palette.ink,
        teal: { DEFAULT: palette.teal, foreground: '#FFFFFF', soft: '#E6F4F5' },
        line: palette.line,
        border: palette.line,
        input: palette.line,
        ring: palette.primary,
        background: palette.white,
        foreground: palette.ink,
        primary: { DEFAULT: palette.primary, foreground: '#FFFFFF', soft: '#E8F0FC', deep: '#124AA8' },
        secondary: { DEFAULT: '#EEF2F7', foreground: palette.ink },
        muted: { DEFAULT: palette.surface, foreground: palette.muted },
        accent: { DEFAULT: '#E6F4F5', foreground: palette.teal },
        destructive: { DEFAULT: '#B42318', foreground: '#FFFFFF' },
        card: { DEFAULT: '#FFFFFF', foreground: palette.ink },
        popover: { DEFAULT: '#FFFFFF', foreground: palette.ink },
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
        card: '0 1px 2px rgba(20,34,53,0.04), 0 8px 24px -12px rgba(20,34,53,0.12)',
        screen: '0 24px 60px -24px rgba(20,34,53,0.35)',
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
