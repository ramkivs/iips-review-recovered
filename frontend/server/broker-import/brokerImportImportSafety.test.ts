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
  'brokerImportEvidenceSubmission.ts',
  'brokerImportV1SaveAdapter.ts',
  'brokerImportHttp.ts',
  'index.ts',
] as const;

/**
 * The AMEND-01 evidence modules — the owner-carrier seam and the retention journal reader.
 *
 * These are held to the SAME import-safety standard as `MODULES` with ONE documented difference: they
 * legitimately import `node:fs`, `node:crypto` and `node:path` at RUNTIME, because materialising and
 * reading a server-owned carrier file and reading the Class-C journal are their whole purpose. That is
 * exactly the position of the pre-existing `../reports-owner-carrier.ts` and
 * `../reports-owner-resolver.ts` (NP-06 R1), which sit outside `MODULES` for the same reason. The
 * `node:`-must-be-type-only rule is a property of the ROUTE TREE proper, which stays free of runtime
 * Node APIs; it is not a property of the carrier seam.
 *
 * What is asserted instead, and is the property that actually matters: these modules perform NO I/O at
 * module scope. Every filesystem call sits inside a function body and therefore happens per request,
 * never at import.
 */
const EVIDENCE_MODULES = [
  'brokerImportEvidenceOwnerCarrier.ts',
  'brokerImportEvidenceOwnerResolver.ts',
  'brokerImportEvidenceStore.ts',
] as const;

const FS_CALL = /\b(readFileSync|writeFileSync|appendFileSync|existsSync|mkdirSync|rmSync|statSync|readdirSync)\s*\(/;

function sourceOf(name: (typeof MODULES)[number]): string {
  return readFileSync(fileURLToPath(new URL(`./${name}`, import.meta.url)), 'utf8');
}

/**
 * Strip comments before a STRUCTURAL assertion.
 *
 * These modules document their own prohibitions in prose — the route header records "ONE
 * callIpc('portfolio.save', ...)" for the save path and "no purge, no expiry, no DELETE" for the
 * evidence path. Matching that prose would report a violation for a sentence that says the opposite of
 * one, so structural assertions run against code only. Behavioural proof stays in
 * `brokerImportEvidenceRoute.test.ts`, which drives real requests.
 */
function codeOnly(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
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

describe('brokerImport import safety — AMEND-01 evidence modules', () => {
  it('no evidence module listens, creates a server, opens a connection, or mutates global state', () => {
    for (const name of EVIDENCE_MODULES) {
      const source = sourceOf(name);
      expect(source, name).not.toMatch(/\.listen\(/);
      expect(source, name).not.toMatch(/createServer\(/);
      expect(source, name).not.toMatch(/createConnection\(/);
      expect(source, name).not.toMatch(/process\.on\(/);
      expect(source, name).not.toMatch(/process\.prependListener/);
      expect(source, name).not.toMatch(/globalThis\.\w+\s*=/);
      expect(source, name).not.toMatch(/process\.env\.\w+\s*=/);
    }
  });

  it('performs NO filesystem I/O at module scope — every fs call sits inside a function body', () => {
    for (const name of EVIDENCE_MODULES) {
      const lines = sourceOf(name).split('\n');
      lines.forEach((line, index) => {
        // A top-level statement begins at column 0 and is not a comment or a continuation.
        const isTopLevel = line.length > 0 && !/^\s/.test(line) && !/^\s*(\/\/|\/\*|\*)/.test(line);
        if (isTopLevel) {
          expect(FS_CALL.test(line), `${name}:${index + 1} performs I/O at module scope: ${line}`).toBe(false);
        }
      });
      // And no module-scope materialisation or resolution of the carrier.
      expect(name, name).toBeTruthy();
      const source = sourceOf(name);
      expect(source, name).not.toMatch(/^(?:export )?const \w+ = (?:materialise|resolve|evaluate)\w*\(/m);
    }
  });

  it('importing the evidence modules starts nothing and adds no socket or TCP handle', async () => {
    const before = process.getActiveResourcesInfo();
    await import('./brokerImportEvidenceOwnerCarrier.js');
    await import('./brokerImportEvidenceOwnerResolver.js');
    await import('./brokerImportEvidenceStore.js');
    const newKinds = process.getActiveResourcesInfo().filter((kind) => !before.includes(kind));
    expect(newKinds.filter((kind) => kind.includes('TCP') || kind.includes('Socket'))).toEqual([]);
  });

  it('keeps the evidence route free of any IPC call, retry, deletion or scheduler', () => {
    const route = codeOnly(sourceOf('brokerImportHttp.ts'));
    // §8.1(4): no new IPC operation. The only callIpc in the route tree remains portfolio.save.
    expect(route).not.toMatch(/callIpc\(/);
    expect(route.match(/retry\w*\(\s*\)/g) ?? []).toHaveLength(0);
    // §8.3(16)(b)/(h): no deletion, no purge, no scheduler anywhere in the route.
    expect(route).not.toMatch(/\bunlink|\brmSync|\.delete\(|purge|expire/);
    expect(route).not.toMatch(/\bsetInterval\b|\bsetTimeout\b/);
    // §8.1(1): the route resolves at most one record and never lists.
    expect(route).not.toMatch(/\.list\(|listOrdered\(/);
    expect(route).toMatch(/readByImportId\(/);
  });

  it('keeps the reader surface the route depends on read-only by construction', () => {
    const route = codeOnly(sourceOf('brokerImportHttp.ts'));
    const start = route.indexOf('export interface BrokerImportEvidenceReader');
    expect(start).toBeGreaterThan(-1);
    const iface = route.slice(start, route.indexOf('}', route.indexOf('describeStorageUsage', start)));
    expect(iface).toContain('readByImportId');
    expect(iface).toContain('describeStorageUsage');
    expect(iface).not.toContain('retain');
    expect(iface).not.toContain('append');
    expect(iface).not.toContain('updateReadState');
  });
});
