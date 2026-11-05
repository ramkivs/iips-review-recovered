/**
 * IID-3 — M-1 demonstration test.
 *
 * The demonstration script is the milestone's evidence generator, so it is also a test: if any of its ten
 * verification points stops holding, this suite fails rather than quietly publishing stale evidence.
 *
 * @vitest-environment node
 */
import { afterAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';

import { runDemonstration } from './m1-demonstration';

const outDir = mkdtempSync(join(tmpdir(), 'iid3-m1-evidence-'));
afterAll(() => rmSync(outDir, { recursive: true, force: true }));

describe('M-1 — the ten verification points hold', () => {
  it('creates, reads independently, stays idempotent, versions, stays valid and fails closed', async () => {
    const { evidence } = await runDemonstration(outDir);

    for (const point of evidence.verification) {
      expect({ point: point.point, pass: point.pass, observed: point.observed }).toMatchObject({ pass: true });
    }
    expect(evidence.verification).toHaveLength(10);
    expect(evidence.sanitization.leaks).toEqual([]);
    expect(evidence.corruption.servedData).toBe(false);
    expect(evidence.boundaryUnavailable.httpStatus).toBe(503);
    expect(evidence.mutatingRoutes.every((route) => route.status === 405)).toBe(true);
    expect(evidence.independentReads.every((read) => read.process === 'SEPARATE_PROCESS')).toBe(true);
    expect(evidence.realIssuerAssessment).toContain('BLOCKED');

    // The evidence is written where an auditor can read it.
    expect(existsSync(join(outDir, 'm1-demonstration.json'))).toBe(true);
    const written = JSON.parse(readFileSync(join(outDir, 'm1-demonstration.json'), 'utf8')) as typeof evidence;
    expect(written.verification.every((point) => point.pass)).toBe(true);
    for (const run of ['create-v1.json', 'rerun-identical.json', 'changed-input-v2.json']) {
      expect(existsSync(join(outDir, 'runs', run))).toBe(true);
    }
  }, 120_000);
});
