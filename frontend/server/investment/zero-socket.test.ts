/**
 * AC-X2 — the socket-level assertion the design asks for, as a test.
 *
 * design §6.8: "No network access at analysis or read time: a test asserts zero sockets opened during a full
 * assess→persist→read cycle." design §I.2 fixes the scope: "AC-X2 is 'zero external network connections' … Verified by
 * a static module-graph scan in IID-0 and by socket-level assertion once a transport exists."
 *
 * This file is that assertion. It runs the real cycle — dataset → assessment → governed persistence → read back through
 * both the service and the HTTP-shape transport handler — under the instrumentation in `demo/zeroSocketProbe.ts`, and
 * fails if any connection to a non-loopback destination was attempted or if the cycle did not complete. It also writes
 * the run record to `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/zero-socket-test.json` so the evidence bundle holds
 * the machine-produced numbers rather than a transcription of them. (The bundle's `zero-socket-run.json` and
 * `zero-socket-read.json` come from the two-process CLI run, which is the same cycle without the test runner in it.)
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runZeroSocketCycle, summarise } from './demo/zeroSocketProbe';

/**
 * Locate the repository root without relying on `import.meta.url`: under the test runner the module URL is not
 * necessarily a `file:` URL. Walking up from the working directory until the tree looks like this repository is
 * unambiguous and keeps the record's location stable whether the suite is run from `frontend/` or from the root.
 */
function findRepoRoot(start: string): string {
  let current = resolve(start);
  for (let depth = 0; depth < 6; depth += 1) {
    if (existsSync(join(current, 'docs', 'integration')) && existsSync(join(current, 'frontend', 'server'))) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error(`could not locate the repository root from ${start}`);
}

const REPO_ROOT = findRepoRoot(process.cwd());
const RECORD_PATH =
  process.env['AC_X2_RECORD_PATH'] ??
  join(REPO_ROOT, 'evidence', 'iid', 'IID-AC-X2-ZERO-SOCKET-2026-11-06', 'zero-socket-test.json');

describe('AC-X2 — zero external network connections over assess → persist → read', () => {
  it('runs the whole cycle and attempts no connection to a non-loopback destination', async () => {
    const report = await runZeroSocketCycle();

    // The numbers, so a failing assertion says what actually happened rather than just "expected true".
    // eslint-disable-next-line no-console
    console.log(`\n${summarise(report)}\n`);

    // Writing the record is best-effort: the assertion must not depend on a writable checkout (CI checks out the
    // repository into a workspace, and a reader may run the suite read-only).
    try {
      mkdirSync(dirname(RECORD_PATH), { recursive: true });
      writeFileSync(RECORD_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    } catch (cause) {
      // eslint-disable-next-line no-console
      console.warn(`AC-X2: could not write ${RECORD_PATH}: ${cause instanceof Error ? cause.message : String(cause)}`);
    }

    // The cycle must have genuinely run: four steps, all of them observing the expected product behaviour.
    expect(report.cycle.steps.map((step) => step.step)).toEqual([
      'analysis: assembleAssessment',
      'persistence: recordAssessment',
      'read: readChain + readVersionWithPayload',
      'read: handleInvestmentRequest (HTTP shape, no socket)',
    ]);
    expect(report.cycle.steps.every((step) => step.ok)).toBe(true);
    expect(report.cycle.versions).toBe(1);
    expect(report.cycle.payloadBytes).toBeGreaterThan(0);
    expect(report.cycle.transportStatus).toBe(200);
    expect(report.cycle.transportVersionHeader).toBe('1');
    expect(report.cycle.transportBodyVersion).toBe(1);
    expect(report.cycle.transportBodyBytes).toBeGreaterThan(1_000);

    // The gate itself.
    expect(report.observation.external).toBe(0);
    expect(report.observation.unresolved).toBe(0);
    expect(report.determination.externalDestinations).toEqual([]);
    expect(report.determination.pass).toBe(true);

    // Independent, process-scoped corroboration: no socket descriptor appeared while the cycle ran.
    if (report.socketFdCensus.before.available && report.socketFdCensus.after.available) {
      expect(report.socketFdCensus.newSocketFds).toEqual([]);
    }

    // The instrumentation must have actually covered the surface; an empty channel list would make the pass vacuous.
    expect(report.instrumentation.channels.length).toBeGreaterThanOrEqual(13);
    for (const required of ['net.connect', 'net.Socket.prototype.connect', 'tls.connect', 'http.request', 'https.request', 'dns.lookup', 'globalThis.fetch']) {
      expect(report.instrumentation.channels).toContain(required);
    }
  }, 60_000);
});
