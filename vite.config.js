// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Website/', // <-- CORRECTED THIS LINE
  build: {
    outDir: 'dist', // This is Vite's default, but good to be explicit
  },
});