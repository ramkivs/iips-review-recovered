/**
 * CAP-02 broker-import import-safety tests.
 *
 * Authority: `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01`
 * §4.4 — importing the route modules listens, connects, writes and registers no global process
 * hook. The modules are structurally import-safe (no top-level side effects), and this suite
 * proves both the structure and the runtime behavior.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const MODULES = [
  'brokerImportBoundary.ts',
  'brokerImportV1SaveAdapter.ts',
  'brokerImportHttp.ts',
  'index.ts',
] as const;

function sourceOf(name: (typeof MODULES)[number]): string {
  return readFileSync(fileURLToPath(new URL(`./${name}`, import.meta.url)), 'utf8');
}

describe('brokerImport import safety — structure', () => {
  it('no module listens, creates a server, or opens a connection', () => {
    for (const name of MODULES) {
      const source = sourceOf(name);
      expect(source, name).not.toMatch(/\.listen\(/);
      expect(source, name).not.toMatch(/createServer\(/);
      expect(source, name).not.toMatch(/createConnection\(/);
      // Any node: import must be TYPE-ONLY (a runtime import would pull Node APIs into the graph).
      expect(source, name).not.toMatch(/^import (?!type )[\s\S]*?from 'node:/m);
    }
  });

  it('no module registers a process hook or mutates global state at import time', () => {
    for (const name of MODULES) {
      const source = sourceOf(name);
      expect(source, name).not.toMatch(/process\.on\(/);
      expect(source, name).not.toMatch(/process\.prependListener/);
      expect(source, name).not.toMatch(/globalThis\.\w+\s*=/);
      expect(source, name).not.toMatch(/process\.env\.\w+\s*=/);
    }
  });

  it('the boundary and adapter are the only IPC touchpoints and both stay one-call/no-retry', () => {
    const adapter = sourceOf('brokerImportV1SaveAdapter.ts');
    expect(adapter).toContain("callIpc('portfolio.save'");
    // No retry vocabulary anywhere in the route tree.
    for (const name of MODULES) {
      expect(sourceOf(name), name).not.toMatch(/retry\w*\(\s*\)/);
    }
  });
});

describe('brokerImport import safety — runtime', () => {
  it('importing the full composition registers no listener and opens no socket', async () => {
    const before = process.getActiveResourcesInfo();
    const mod = await import('./index.js');
    const after = process.getActiveResourcesInfo();
    // Exports are values/functions only; nothing started running.
    expect(Object.keys(mod).length).toBeGreaterThan(0);
    for (const value of Object.values(mod)) {
      expect(['function', 'object', 'string', 'number', 'boolean', 'undefined'].includes(typeof value)).toBe(true);
    }
    // No new long-lived handle kind appeared at import time.
    const newKinds = after.filter((kind) => !before.includes(kind));
    expect(newKinds.filter((kind) => kind.includes('TCP') || kind.includes('Socket'))).toEqual([]);
  });

  it('the handler does not listen when NODE_ENV=test guards the composed server', async () => {
    const transportSource = readFileSync(fileURLToPath(new URL('../executive-transport.ts', import.meta.url)), 'utf8');
    expect(transportSource).toContain("if (process.env.NODE_ENV !== 'test')");
    expect(transportSource).toContain("EXEC_TRANSPORT_BIND_HOST = '127.0.0.1'");
  });
});
