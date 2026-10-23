import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Program v3.0 Phase 3 — Vite config for the application shell.
// Presentation-only. No platform/engine logic here.
export default defineConfig({
  plugins: [react()],
  server: {
    // C8 remediation (2026-10-19, G3-D7 / act §5.2): the dev server previously bound
    // every interface and admitted a wildcard external host suffix. It now binds
    // loopback only and admits loopback hostnames only. No other dev-server feature
    // is added and the proxy target is unchanged.
    host: '127.0.0.1',
    allowedHosts: ['localhost', '127.0.0.1'],
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
