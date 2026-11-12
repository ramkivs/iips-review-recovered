/**
 * Dedicated Vitest config for the live Personal Portfolio lifecycle harness.
 *
 * Deliberately separate from the frontend's own config: this suite needs the compiled
 * IPD checkout and a real IPC server, so it must never be picked up by `npm run test:ci`.
 * Run it only through `run-live-lifecycle.sh`.
 *
 * `root` stays on `frontend/` so React, jsdom and the app's own tsconfig resolve exactly
 * as they do for the real suite; only the include glob points at this evidence file.
 * No `vite`/plugin import is used on purpose — this file lives outside `frontend/`, so
 * those modules are not resolvable from here.
 */
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const frontend = resolve(here, '../../../frontend');

/**
 * This file sits outside `frontend/`, so bare specifiers are not resolvable from the
 * importer's directory. Pin them at the frontend's own install so the harness renders
 * through the exact React instance the application uses.
 */
const nm = (pkg: string, sub = '') => join(frontend, 'node_modules', pkg, sub);
const alias: Record<string, string> = {
  react: nm('react'),
  'react/jsx-runtime': nm('react', 'jsx-runtime'),
  'react-dom': nm('react-dom'),
  'react-dom/client': nm('react-dom', 'client'),
  'react-dom/test-utils': nm('react-dom', 'test-utils'),
  'react-router-dom': nm('react-router-dom'),
  '@testing-library/react': nm('@testing-library', 'react'),
  '@testing-library/dom': nm('@testing-library', 'dom'),
  '@testing-library/user-event': nm('@testing-library', 'user-event'),
};

export default {
  root: frontend,
  resolve: { alias },
  // This file's includes live outside `frontend/`, so esbuild does not pick up the app's
  // tsconfig `jsx` setting; declare the automatic runtime explicitly.
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [join(frontend, 'src/test/setup.ts')],
    include: [join(here, process.env.PROBE ? '**/probe.e2e.test.tsx' : '**/liveLifecycle.e2e.test.tsx')],
    // `node:sqlite` (Node 22) is not in this Vite version's builtin list, so it would be
    // rewritten to a bare "sqlite" specifier and fail to resolve. Keep it native.
    server: { deps: { external: ['node:sqlite'] } },
    testTimeout: 180_000,
    hookTimeout: 180_000,
  },
};
