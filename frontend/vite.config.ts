import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Program v3.0 Phase 3 — Vite config for the application shell.
// Presentation-only. No platform/engine logic here.
export default defineConfig({
  plugins: [react()],
  server: {
    // Personal single-user development only. Bind all sandbox interfaces so Arena's
    // isolated preview proxy can reach Vite; restrict Host validation to loopback and
    // Arena's preview domain. This is not a production/public-service deployment.
    host: '0.0.0.0',
    allowedHosts: ['localhost', '127.0.0.1', '.e2b.app'],
    port: 5173,
    proxy: {
      // Proxy the v3.0 executive transport (runs the certified platform in-process).
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
  build: { outDir: 'dist', sourcemap: true },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
} as Parameters<typeof defineConfig>[0]);
