/**
 * IID-4 / S6-1 — the disposition demonstration is the one disposition producer in IRR, so it is also the test
 * that the operator limits policy reaches a produced disposition.
 *
 *   · default run: no policy at the demonstration's own root → labelled system defaults, nine points hold,
 *     behaviour unchanged from before S6-1;
 *   · `limitsPolicyRoot` with a valid file → every recorded payload carries OPERATOR_CONFIG and the file's exact
 *     policyVersion, and the engine applied the file's caps;
 *   · `limitsPolicyRoot` with an invalid file → the run fails closed before any store is opened; no evidence file
 *     is written; the defaults are not substituted.
 *
 * @vitest-environment node
 */
import { afterAll, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { LimitsPolicyError } from '../../../../iips-platform/src/investment/disposition/limits';
import { LIMITS_POLICY_VERSION } from '../../../../iips-platform/src/investment/disposition/types';
import type { HoldingDispositionPayload } from '../../../../iips-platform/src/investment/disposition/types';
import { resolveLimitsPolicyPath } from '../limitsPolicySource';
import { runDemonstration } from './disposition-demonstration';

const scratch = mkdtempSync(join(tmpdir(), 'iid4-s6-1-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

function policyRoot(name: string, contents: string | null): string {
  const root = join(scratch, name);
  if (contents !== null) {
    const path = resolveLimitsPolicyPath(root, {});
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, contents, 'utf8');
  }
  return root;
}

const OPERATOR_POLICY = {
  policyVersion: 'limits-policy/s6-1-test',
  effectiveFrom: '2026-11-01',
  singleNameMaxPct: 7,
  sectorMaxPct: { DEFAULT: 22, Technology: 18 },
};

describe('IID-4 demonstration — limits policy source (S6-1)', () => {
  it('with no policy file: nine points hold, labelled system defaults, nothing claims operator configuration', async () => {
    const outDir = join(scratch, 'out-default');
    const { evidence } = await runDemonstration(outDir);

    for (const point of evidence.verification) {
      expect({ point: point.point, pass: point.pass, observed: point.observed }).toMatchObject({ pass: true });
    }
    expect(evidence.verification).toHaveLength(9);
    expect(evidence.limits.source.kind).toBe('ABSENT');
    expect(evidence.limits.basis).toBe('SYSTEM_DEFAULT');
    expect(evidence.limits.policyVersion).toBe(`${LIMITS_POLICY_VERSION}+system-default`);
    expect(evidence.limits.recordedHeld).toEqual({ basis: 'SYSTEM_DEFAULT', policyVersion: `${LIMITS_POLICY_VERSION}+system-default` });
    expect(evidence.limits.recordedCandidate).toEqual({ basis: 'SYSTEM_DEFAULT', policyVersion: `${LIMITS_POLICY_VERSION}+system-default` });
    // Unchanged outside this integration: the verbs, chain mechanics and read transport points are the same eight
    // that held before S6-1, and the written payload's limits block is the default one.
    const held = JSON.parse(readFileSync(join(outDir, 'held-payload.json'), 'utf8')) as HoldingDispositionPayload;
    expect(held.limits.basis).toBe('SYSTEM_DEFAULT');
    expect(held.limits.singleNameMaxPct).toBe(10);
    expect(held.interpretation.noExecutionPath).toBe(true);
  });

  it('with a valid operator policy at the documented path under the given root: OPERATOR_CONFIG and the exact policyVersion reach the recorded dispositions', async () => {
    const root = policyRoot('root-valid', JSON.stringify(OPERATOR_POLICY));
    const outDir = join(scratch, 'out-operator');
    const { evidence } = await runDemonstration(outDir, { limitsPolicyRoot: root });

    for (const point of evidence.verification) {
      expect({ point: point.point, pass: point.pass, observed: point.observed }).toMatchObject({ pass: true });
    }
    expect(evidence.limits.source).toEqual({ kind: 'OPERATOR_FILE', path: resolveLimitsPolicyPath(root, {}) });
    expect(evidence.limits.basis).toBe('OPERATOR_CONFIG');
    expect(evidence.limits.policyVersion).toBe('limits-policy/s6-1-test');
    expect(evidence.limits.effectiveFrom).toBe('2026-11-01T00:00:00.000Z');
    expect(evidence.limits.recordedHeld).toEqual({ basis: 'OPERATOR_CONFIG', policyVersion: 'limits-policy/s6-1-test' });
    expect(evidence.limits.recordedCandidate).toEqual({ basis: 'OPERATOR_CONFIG', policyVersion: 'limits-policy/s6-1-test' });

    const held = JSON.parse(readFileSync(join(outDir, 'held-payload.json'), 'utf8')) as HoldingDispositionPayload;
    expect(held.limits.basis).toBe('OPERATOR_CONFIG');
    expect(held.limits.policyVersion).toBe('limits-policy/s6-1-test');
    expect(held.limits.singleNameMaxPct).toBe(7);
    expect(held.limits.sectorMaxPct).toEqual({ DEFAULT: 22, Technology: 18 });
    // Every cap the engine actually applied names the operator basis and version (AC-4.9).
    for (const applied of held.limits.applied) {
      expect(applied.basis).toBe('OPERATOR_CONFIG');
      expect(applied.policyVersion).toBe('limits-policy/s6-1-test');
    }
    // Scoring, assessment and verb logic are untouched: the verbs are those of the default run on the same subject.
    const defaultEvidence = JSON.parse(
      readFileSync(join(scratch, 'out-default', 'iid4-disposition-demonstration.json'), 'utf8'),
    ) as { verbs: { held: string | null; candidate: string | null } };
    expect(evidence.verbs).toEqual(defaultEvidence.verbs);
  });

  it('with an invalid operator policy: fails closed before any store is opened; no evidence is written; defaults are not substituted', async () => {
    const root = policyRoot('root-invalid', JSON.stringify({ ...OPERATOR_POLICY, sectorMaxPcts: { DEFAULT: 22 } }));
    const outDir = join(scratch, 'out-invalid');

    await expect(runDemonstration(outDir, { limitsPolicyRoot: root })).rejects.toBeInstanceOf(LimitsPolicyError);
    await expect(runDemonstration(outDir, { limitsPolicyRoot: root })).rejects.toMatchObject({ reason: 'UNKNOWN_KEY' });
    expect(existsSync(join(outDir, 'iid4-disposition-demonstration.json'))).toBe(false);
  });
});
