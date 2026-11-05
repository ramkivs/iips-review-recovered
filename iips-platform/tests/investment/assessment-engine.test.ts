/**
 * IID-2 — the engine contract: determinism, evidence resolution, invariants, adequacy and the sector-
 * reference separation (AC-2.11, AC-2.12, INV-1 … INV-5, AC-A1/AC-A2).
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assessCompany, validatePayload } from '../../src/investment/assessment/engine';
import type { CompanyAssessmentPayload } from '../../src/investment/assessment/types';
import type { AssessCompanyInput } from '../../src/investment/assessment/engine';
import {
  annualPeriod,
  bankAssessmentInput,
  techAssessmentInput,
  techDataset,
  TECH_ISSUER,
  thinAssessmentInput,
} from './assessmentFixtures';

const here = dirname(fileURLToPath(import.meta.url));
const platformRoot = resolve(here, '../..');

const sha = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Resolve a payload path such as `valuation.methods[0].output.perShareMid`. */
function resolvePath(root: unknown, path: string): unknown {
  const tokens = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cursor: unknown = root;
  for (const token of tokens) {
    if (cursor === null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[token];
    if (cursor === undefined) return undefined;
  }
  return cursor;
}

/** Reorder every array in the dataset without changing its content. */
function reorder(input: AssessCompanyInput, mode: 'REVERSED' | 'ROTATED'): AssessCompanyInput {
  const arrange = <T,>(items: readonly T[]): readonly T[] => {
    if (items.length < 2) return items;
    if (mode === 'REVERSED') return [...items].reverse();
    const shift = items.length >> 1;
    return [...items.slice(shift), ...items.slice(0, shift)];
  };
  return {
    ...input,
    dataset: {
      ...input.dataset,
      periods: arrange(input.dataset.periods),
      prices: arrange(input.dataset.prices),
      corporateActions: arrange(input.dataset.corporateActions),
      operatingMetrics: arrange(input.dataset.operatingMetrics),
    },
    dividendDeclarations: input.dividendDeclarations === undefined ? undefined : arrange(input.dividendDeclarations),
  };
}

describe('AC-2.11 — the payload is a function of the inputs, byte for byte', () => {
  test('three dataset orderings produce an identical payload and digest', () => {
    for (const [name, input] of [
      ['TECH', techAssessmentInput()],
      ['BANK', bankAssessmentInput()],
      ['THIN', thinAssessmentInput()],
    ] as const) {
      const base = assessCompany(input);
      const reversed = assessCompany(reorder(input, 'REVERSED'));
      const rotated = assessCompany(reorder(input, 'ROTATED'));
      assert.equal(sha(reversed.payload), sha(base.payload), `${name}: reversed order changed the payload`);
      assert.equal(sha(rotated.payload), sha(base.payload), `${name}: rotated order changed the payload`);
      assert.equal(reversed.inputDigest, base.inputDigest);
      assert.equal(rotated.inputDigest, base.inputDigest);
      assert.equal(JSON.stringify(reversed.payload), JSON.stringify(base.payload));
    }
  });

  test('three fresh processes produce the byte-identical payload', () => {
    for (const which of ['tech', 'bank', 'thin'] as const) {
      const runs = [0, 1, 2].map(() =>
        execFileSync(process.execPath, ['--import', 'tsx', 'tests/investment/helpers/assessmentRestart.ts', which], {
          cwd: platformRoot,
          encoding: 'utf8',
        }).trim(),
      );
      assert.equal(new Set(runs).size, 1, `${which}: restarts disagree → ${runs.join(' / ')}`);
      const [name, digest, payloadHash, length] = runs[0]!.split(' ');
      assert.equal(name, which);
      assert.ok(digest!.startsWith('sha256:'));
      assert.ok(Number(length) > 1_000);
      const inProcess = assessCompany(
        which === 'tech' ? techAssessmentInput() : which === 'bank' ? bankAssessmentInput() : thinAssessmentInput(),
      );
      assert.equal(payloadHash, sha(inProcess.payload), `${which}: in-process payload differs from the restarted one`);
    }
  });

  test('the digest is input-sensitive', () => {
    const base = assessCompany(techAssessmentInput());
    const movedKnownAsOf = assessCompany(techAssessmentInput({ knownAsOf: '2026-07-24T10:00:00Z' }));
    const otherDatasetVersion = assessCompany(techAssessmentInput({ datasetVersion: 'content:fixture-assessment-2' }));
    assert.notEqual(base.inputDigest, movedKnownAsOf.inputDigest);
    assert.notEqual(base.inputDigest, otherDatasetVersion.inputDigest);
    assert.equal(base.inputDigest, assessCompany(techAssessmentInput()).inputDigest);
  });
});

describe('AC-2.12 — every claim resolves to a field that exists', () => {
  test('every evidence entry resolves, cites a published method, and carries a source', () => {
    for (const input of [techAssessmentInput(), bankAssessmentInput(), thinAssessmentInput()]) {
      const { payload } = assessCompany(input);
      assert.ok(payload.evidence.length > 0);
      const ids = new Set(payload.evidence.map((entry) => entry.evidenceId));
      for (const entry of payload.evidence) {
        assert.ok(entry.supports.length > 0, `${entry.evidenceId} supports nothing`);
        for (const path of entry.supports) {
          const resolved = resolvePath(payload, path);
          assert.ok(resolved !== undefined, `${entry.evidenceId}: ${path} does not resolve`);
        }
        assert.ok(entry.source !== undefined && typeof entry.source.kind === 'string');
        assert.ok(entry.claim.length > 0);
        assert.ok(entry.observationRefs.length > 0);
      }
      for (const method of payload.valuation.methods) {
        for (const cited of method.evidenceIds) {
          assert.ok(ids.has(cited), `${method.methodId} cites unpublished evidence ${cited}`);
        }
        if (method.applicable && method.output !== null) {
          assert.ok(method.evidenceIds.length > 0, `${method.methodId} publishes a value with no evidence`);
        }
      }
    }
  });

  test('the engine reports no invariant violation for any fixture, and a corrupted payload is caught', () => {
    for (const input of [techAssessmentInput(), bankAssessmentInput(), thinAssessmentInput()]) {
      const { payload, violations } = assessCompany(input);
      assert.deepEqual(violations, [], `${input.issuerId} produced violations`);
      assert.deepEqual(validatePayload(payload), []);
    }

    const { payload } = assessCompany(techAssessmentInput());
    const broken = JSON.parse(JSON.stringify(payload)) as CompanyAssessmentPayload;
    (broken.evidence[0] as { supports: string[] }).supports = ['valuation.methods[99].output.perShareMid'];
    const caught = validatePayload(broken);
    assert.ok(caught.some((violation) => /does not resolve/.test(violation.detail)));

    const zeroed = JSON.parse(JSON.stringify(payload)) as CompanyAssessmentPayload;
    (zeroed.completeness.requiredFieldCoveragePct as number) = 150;
    assert.ok(validatePayload(zeroed).length > 0, 'an out-of-range aggregate must be rejected');
  });

  test('INV-2 — every present number carries a provenance record', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const walk = (node: unknown, path: string): void => {
      if (Array.isArray(node)) {
        node.forEach((item, index) => walk(item, `${path}[${index}]`));
        return;
      }
      if (node === null || typeof node !== 'object') return;
      const record = node as Record<string, unknown>;
      if (typeof record.presence === 'string' && 'value' in record) {
        if (record.presence === 'PRESENT') {
          assert.ok(record.source !== undefined, `${path} is present with no source`);
        } else {
          assert.equal(record.value, null, `${path} is ${String(record.presence)} but carries a value`);
          assert.equal(typeof record.reason, 'string', `${path} is ${String(record.presence)} with no reason`);
        }
      }
      for (const [key, value] of Object.entries(record)) walk(value, `${path}.${key}`);
    };
    walk(payload, 'payload');
  });
});

describe('completeness and adequacy', () => {
  test('a complete issuer is SUFFICIENT and its coverage is a fraction, not a guess', () => {
    const { payload } = assessCompany(techAssessmentInput());
    assert.equal(payload.completeness.adequacy, 'SUFFICIENT');
    assert.ok(payload.completeness.requiredFieldCoveragePct > 0 && payload.completeness.requiredFieldCoveragePct <= 1);
    assert.equal(payload.completeness.adequacyBasis.length > 0, true);
    assert.equal(payload.completeness.statementCoverage.cashFlow.presence, 'PRESENT');
  });

  test('a bank with unmodelled line items is PARTIAL, and the missing fields are named', () => {
    const { payload } = assessCompany(bankAssessmentInput());
    assert.equal(payload.completeness.adequacy, 'PARTIAL');
    assert.ok(payload.completeness.requiredFieldCoveragePct < 0.8);
    assert.ok(payload.completeness.missingFields.length > 0);
    for (const field of payload.completeness.missingFields) {
      assert.equal(typeof field.field, 'string');
      assert.equal(typeof field.reason, 'string');
      assert.equal(typeof field.periodEnd, 'string');
    }
  });

  test('a two-period issuer with no cash flow is INSUFFICIENT and says which gate fired', () => {
    const { payload } = assessCompany(thinAssessmentInput());
    assert.equal(payload.completeness.adequacy, 'INSUFFICIENT');
    // Coverage is published as a ratio: zero cash-flow items is a present 0, not a missing figure.
    assert.equal(payload.completeness.statementCoverage.cashFlow.value, 0);
    assert.ok(payload.completeness.missingFields.some((field) => field.field.endsWith(':OPERATING_CASH_FLOW')));
    assert.ok(payload.completeness.adequacyBasis.some((line) => /period|cash flow|coverage/i.test(line)));
    assert.ok(['MATERIAL_CONCERNS', 'UNVERIFIED'].includes(payload.quality.verdict));
  });
});

describe('AC-A1 / AC-A2 — sector behaviour is structural, not cosmetic', () => {
  test('the bank never receives an FCFF DCF, and its intrinsic is built from what remains', () => {
    const { payload } = assessCompany(bankAssessmentInput());
    assert.equal(payload.valuation.methods.some((entry) => entry.methodId === 'DCF_FCFF'), false);
    const intrinsic = payload.valuation.intrinsic;
    if (intrinsic !== null) {
      assert.equal(intrinsic.weighting.some((entry) => entry.methodId === 'DCF_FCFF'), false);
      const total = intrinsic.weighting.reduce((sum, entry) => sum + entry.weight, 0);
      assert.ok(Math.abs(total - 1) < 1e-9);
    }
    assert.equal(payload.valuation.sensitivity.length, 0);
  });

  test('the sector reference is labelled, separate, and cannot be cited as evidence', () => {
    const { payload } = assessCompany(techAssessmentInput());
    assert.equal(payload.sectorReferenceView.evidenceClass, 'SECTOR_REFERENCE');
    assert.ok(payload.sectorReferenceView.note.length > 0);
    for (const entry of payload.evidence) {
      for (const path of entry.supports) {
        assert.equal(path.startsWith('sectorReferenceView'), false, `evidence cites the sector reference: ${path}`);
      }
    }
    assert.equal(JSON.stringify(payload.valuation.methods).includes('sectorReferenceView'), false);
  });

  test('identity and version pins travel with the artifact', () => {
    const { payload } = assessCompany(techAssessmentInput());
    assert.equal(payload.schemaVersion, 1);
    assert.equal(payload.artifact.kind, 'CompanyAssessment');
    assert.equal(payload.artifact.modelVersion, 'assessment-engine/1.0.0');
    assert.equal(payload.artifact.policyVersion, 'valuation-policy/1.0.0');
    assert.equal(payload.artifact.subjectScope, 'hc:IN:ISIN:IN0000000201');
    assert.equal(payload.assumptions.policyVersion, 'valuation-policy/1.0.0');
    assert.deepEqual(payload.valuation.methodSelection.policyVersion, 'valuation-policy/1.0.0');
    for (const key of ['bindingRef', 'rosterVersion', 'listingMapVersion', 'corporateActionTableVersion'] as const) {
      assert.ok(payload.subject.identity[key].length > 0);
    }
  });

  test('the payload declares itself decision support in a non-production build', () => {
    const { payload } = assessCompany(techAssessmentInput());
    assert.equal(payload.disclosure.decisionSupportOnly, true);
    assert.equal(payload.disclosure.noTradeExecution, true);
    assert.equal(payload.disclosure.nonProduction, true);
    assert.ok(payload.limitations.length >= 3);
  });

  test('a synthetic dataset is disclosed as synthetic in prose', () => {
    const { payload } = assessCompany(thinAssessmentInput());
    assert.ok(payload.limitations.some((line) => /synthetic/i.test(line)));
  });
});

describe('quality flags and staleness', () => {
  test('statements beyond the freshness window raise STALE_STATEMENTS and cap confidence', () => {
    const { payload } = assessCompany(techAssessmentInput({ generatedAt: '2027-06-30' }));
    assert.equal(payload.asOf.staleBeyondPolicy, true);
    assert.ok(payload.quality.flags.some((flag) => flag.code === 'STALE_STATEMENTS'));
    assert.ok(payload.confidence.caps.includes('STALE_DATA'));
    assert.ok(payload.confidence.combined <= 0.9);
  });

  test('the freshness window is measured from the latest period end, not from the dataset version', () => {
    const { payload } = assessCompany(techAssessmentInput());
    assert.equal(payload.asOf.staleBeyondPolicy, false);
    assert.ok(payload.asOf.stalenessDays >= 0 && payload.asOf.stalenessDays <= 400);
    assert.equal(payload.asOf.dataAsOf, '2026-03-31');
    assert.equal(payload.asOf.knownAsOf, '2026-07-23T17:44:46Z');
  });

  test('the quality verdict is derived from the flags, not asserted', () => {
    const clean = assessCompany(techAssessmentInput()).payload;
    assert.equal(clean.quality.verdict, clean.quality.flags.length === 0 ? 'CLEAN' : clean.quality.verdict);
    const restated = assessCompany(
      techAssessmentInput({
        dataset: techDataset({
          periods: [
            ...techDataset().periods,
            annualFixtureRestatement(),
          ],
        }),
      }),
    ).payload;
    assert.ok(restated.quality.flags.some((flag) => flag.code === 'RESTATEMENT_PRESENT'));
    assert.notEqual(restated.quality.verdict, 'CLEAN');
  });
});

/** A restatement of FY2025 revenue, so the disclosure path is exercised end to end. */
function annualFixtureRestatement() {
  return annualPeriod(TECH_ISSUER, {
    periodEnd: '2025-03-31',
    periodStart: '2024-04-01',
    basis: 'RESTATED',
    filedAt: '2026-06-01T18:00:00Z',
    values: { REVENUE_FROM_OPERATIONS: 12_500_000_000, NET_PROFIT: 2_078_000_000 },
  });
}
