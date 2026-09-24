import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    // No manual chunks: Rollup keeps shared modules in the entry and emits Three.js only as a
    // dependency of the two lazily imported scene chunks (verified by scripts/check-content.mjs).
    chunkSizeWarningLimit: 900,
  },
  ssr: { noExternal: ['@fontsource-variable/inter'] },
});
