import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages serves project sites from https://<user>.github.io/<repo>/,
 * so the bundle must be built with a matching `base`.
 * The deploy workflow injects BASE_PATH=/<repo-name>/ automatically;
 * locally (npm run dev) we fall back to '/'.
 */
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
