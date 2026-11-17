/**
 * L-041 — THE TWO CLASSIFIERS AGREE, AND THE READ MODEL CAN FAIL CLOSED.
 *
 * WHAT WAS RECORDED. On 2026-11-12 two classifiers disagreed on the same committed real-issuer manifests:
 * the assessment path (`fundamentals/datasetClass.ts`, the declared-rights rule, fail-closed) answered
 * `UNKNOWN`, while the investment-coverage read model answered `OPERATOR_SUPPLIED` from a substring test on
 * `provider` + `licence` — the exact rule `datasetClass.ts` documents under "WHAT WAS WRONG" and removes.
 *
 * WHAT THIS FILE GUARDS.
 *
 *   1. **The substring rule does not come back.** Not in the coverage report, and not in its second copy in
 *      `identity/coverage.ts`, which was the same removed rule and produced the same false attestation on the
 *      identity-coverage disclosure. Each case below sets the strings AGAINST the rights declaration, so a
 *      classifier that reads either string answers the other way and fails here.
 *   2. **`UNKNOWN` is answerable by the read model.** The recorded objection to a narrow fix was that the
 *      coverage vocabulary was `SYNTHETIC_FIXTURE | OPERATOR_SUPPLIED | NONE`, with `NONE` driving a "no
 *      dataset installed" UI state, so a manifest that IS installed but whose rights are not established had
 *      nowhere to go. It now has its own member, distinct from `NONE`.
 *   3. **The finding itself is not erased.** `L-041` stays visible: its recorded observation is committed and
 *      pinned elsewhere, and the generator proves the disagreement no longer reproduces rather than assuming it.
 *
 * NOT GUARDED HERE, DELIBERATELY: the limitation's status. `L-041` remains `OPEN` in the register. A code
 * correction removes a defect; closing a limitation is its owner's decision.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { classifyDataset } from '../../src/investment/fundamentals/datasetClass';
import { buildInvestmentCoverageReport } from '../../src/investment/coverage/investmentCoverage';
import { buildFinancialCoverageDisclosure } from '../../src/investment/identity/coverage';
import type { DatasetManifest } from '../../src/investment/fundamentals/manifest';

const EMPTY_INPUT = {
  asOf: '2026-11-12',
  generatedAt: '2026-11-12T00:00:00.000Z',
  issuers: [],
  securities: [],
  periods: [],
  prices: [],
  operatingMetrics: [],
  issues: [],
  identitySourcesAvailable: false,
  identitySourceDetail: null,
  issuerIdentityState: null,
} as const;

function manifest(provider: string, licence: string, sourceRights?: unknown): DatasetManifest {
  return {
    datasetSchema: 'IIPS_V3_FUNDAMENTALS_V1',
    datasetVersion: 'sha256:probe',
    contentDigest: 'probe',
    provider,
    licence,
    dataAsOf: '2026-11-12',
    knownAsOf: '2026-11-12',
    lastImportAt: '2026-11-12T00:00:00.000Z',
    importRunId: 'l041-probe',
    quality: 'good',
    completenessPct: 100,
    coverage: {
      issuers: 0,
      securities: 0,
      listings: 0,
      annualPeriods: 0,
      quarterlyPeriods: 0,
      operatingMetricRecords: 0,
      corporateActions: 0,
      prices: 0,
    },
    files: {},
    ...(sourceRights === undefined ? {} : { sourceRights }),
  } as unknown as DatasetManifest;
}

const SYNTHETIC = { state: 'SYNTHETIC', basis: '', note: 'synthetic reference mechanics' };
const OPERATOR = { state: 'OPERATOR_ASSERTED', basis: 'operator-supplied filing input', note: 'attestation only' };

describe('L-041 — the coverage read model derives its class from the rights declaration alone', () => {
  it('a non-synthetic provider string does NOT promote a dataset with no rights evidence', () => {
    // The exact shape of the three committed Infosys manifests: operator-looking strings, no declaration.
    const m = manifest('operator-file-input', 'operator-supplied; not redistributable');
    assert.equal(classifyDataset(m), 'UNKNOWN');
    const report = buildInvestmentCoverageReport({ ...EMPTY_INPUT, manifest: m });
    assert.equal(report.dataset.datasetClass, 'UNKNOWN');
    assert.equal(report.financialCoverage.datasetClass, 'UNKNOWN');
  });

  it('the identity-coverage disclosure agrees: the same manifest, the same class', () => {
    // The second copy of the removed rule lived here. It disclosed OPERATOR_SUPPLIED for this manifest.
    const m = manifest('operator-file-input', 'operator-supplied; not redistributable');
    assert.equal(buildFinancialCoverageDisclosure({ manifest: m }).datasetClass, 'UNKNOWN');
  });

  it('a synthetic-looking provider string does NOT demote a dataset that declares OPERATOR_ASSERTED', () => {
    // Symmetry: the strings are not consulted in either direction, so an operator attestation is not lost to a
    // fixture-shaped label. Rights evidence is the only input.
    const m = manifest('synthetic-test-fixture', 'synthetic-test-fixture', OPERATOR);
    assert.equal(classifyDataset(m), 'OPERATOR_SUPPLIED');
    const report = buildInvestmentCoverageReport({ ...EMPTY_INPUT, manifest: m });
    assert.equal(report.dataset.datasetClass, 'OPERATOR_SUPPLIED');
    assert.equal(buildFinancialCoverageDisclosure({ manifest: m }).datasetClass, 'OPERATOR_SUPPLIED');
  });

  it('a dataset that declares SYNTHETIC rights is a fixture even under an operator-looking label', () => {
    const m = manifest('NSE', 'operator', SYNTHETIC);
    assert.equal(classifyDataset(m), 'SYNTHETIC_REFERENCE');
    const report = buildInvestmentCoverageReport({ ...EMPTY_INPUT, manifest: m });
    assert.equal(report.dataset.datasetClass, 'SYNTHETIC_FIXTURE');
    assert.equal(buildFinancialCoverageDisclosure({ manifest: m }).datasetClass, 'SYNTHETIC_FIXTURE');
  });

  it('UNKNOWN is distinguishable from NONE: absent dataset vs unestablished rights are different facts', () => {
    const absent = buildInvestmentCoverageReport({ ...EMPTY_INPUT, manifest: null });
    assert.equal(absent.dataset.datasetClass, 'NONE');
    // `NONE` drives the "no dataset is installed" UI state. An installed-but-unestablished dataset must NOT
    // claim that state, or the reader is told nothing is installed when something is.
    assert.notEqual(absent.dataset.datasetClass, 'UNKNOWN');
    const unestablished = buildInvestmentCoverageReport({
      ...EMPTY_INPUT,
      manifest: manifest('operator-file-input', 'operator-supplied; not redistributable'),
    });
    assert.notEqual(unestablished.dataset.datasetClass, 'NONE');
  });

  it('UNKNOWN is disclosed in the report notes, so the class is never silently carried', () => {
    const report = buildInvestmentCoverageReport({
      ...EMPTY_INPUT,
      manifest: manifest('operator-file-input', 'operator-supplied; not redistributable'),
    });
    assert.equal(
      report.notes.some((note) => note.includes('UNKNOWN — no rights evidence was supplied')),
      true,
      'the fail-closed class states itself in the note list',
    );
  });
});
