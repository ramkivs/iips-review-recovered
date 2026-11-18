/**
 * W05-A/W05-E — the reusable issuer-level lifecycle and its reporting.
 *
 * Acceptance tests: 1 (reuse across holdings and portfolios), 2 (a missing dataset does not block
 * portfolio creation or use), 11 (coverage percentages use distinct issuers and identified
 * eligible-holding denominators), 12 (a portfolio beyond 200 holdings uses the same lifecycle
 * without requiring all datasets upfront) — plus negative tests for malformed manifests and
 * rights records that disagree with the dataset manifest.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildIssuerLifecycle,
  catalogEntryFromReadPort,
  tryCatalogEntryFromDatasetDir,
  type DatasetCatalogEntry,
  type IssuerLifecycleInput,
} from '../../src/investment/lifecycle/issuerLifecycle';
import { buildLifecycleReport, renderLifecycleSummary } from '../../src/investment/lifecycle/reporting';
import { buildRightsRecord } from '../../src/investment/lifecycle/rightsRecord';
import type { IdentityObservation } from '../../src/investment/identity/types';
import { openLocalSnapshot } from '../../src/investment/port/localSnapshotStore';
import { loadFixtureSources } from './identityFixture';
import { writeTempDataset } from './fixtures';
import {
  ISSUER_A,
  ISSUER_B,
  ISSUER_C,
  ISSUER_D,
  ISSUER_E,
  catalogEntry,
  operatorAssertedRightsRecord,
  suitableEntry,
  syntheticRightsRecord,
  threeCompleteAnnuals,
} from './w05LifecycleFixture';

const AS_OF = '2026-09-15';

const SYMBOLS: Readonly<Record<string, string>> = {
  [ISSUER_A]: 'AARAV',
  [ISSUER_B]: 'BODHI',
  [ISSUER_C]: 'CMBANK',
  [ISSUER_D]: 'DWARKA',
  [ISSUER_E]: 'EESHLIFE',
};
const ISINS: Readonly<Record<string, string>> = {
  [ISSUER_A]: 'IN0000000011',
  [ISSUER_B]: 'IN0000000029',
  [ISSUER_C]: 'IN0000000037',
  [ISSUER_D]: 'IN0000000045',
  [ISSUER_E]: 'IN0000000052',
};

function holding(observationId: string, portfolioId: string, issuerId: string, quantity = 10): IdentityObservation {
  return {
    observationId,
    source: 'HOLDING',
    portfolioId,
    isin: ISINS[issuerId],
    symbol: SYMBOLS[issuerId],
    exchange: 'NSE',
    series: 'EQ',
    cin: null,
    companyIdHint: null,
    displayName: null,
    quantity,
    upstreamStatus: null,
    raw: { isin: ISINS[issuerId], symbol: SYMBOLS[issuerId], quantity },
  };
}

function unresolvedHolding(observationId: string, portfolioId: string): IdentityObservation {
  return {
    observationId,
    source: 'HOLDING',
    portfolioId,
    isin: null,
    symbol: 'NOSUCH',
    exchange: 'NSE',
    series: null,
    cin: null,
    companyIdHint: null,
    displayName: null,
    quantity: 5,
    upstreamStatus: null,
    raw: { symbol: 'NOSUCH', quantity: 5 },
  };
}

function lifecycle(overrides: Partial<IssuerLifecycleInput> = {}) {
  return buildIssuerLifecycle({
    asOf: AS_OF,
    portfolios: [],
    observations: [],
    identitySources: loadFixtureSources(),
    datasets: [],
    ...overrides,
  });
}

describe('W05-A — test 1: holdings and portfolios reuse one suitable issuer dataset', () => {
  test('the same issuer across holdings and portfolios maps to a single reused dataset', () => {
    const observations = [
      holding('H-001', 'portfolio-primary', ISSUER_A),
      holding('H-002', 'portfolio-primary', ISSUER_A),
      holding('H-003', 'portfolio-secondary', ISSUER_A),
      holding('H-004', 'portfolio-secondary', ISSUER_B),
    ];
    const datasets: DatasetCatalogEntry[] = [
      suitableEntry([ISSUER_A], { datasetVersion: 'sha256:aaaa000000000000000000000000000000000000000000000000000000000000' }),
      suitableEntry([ISSUER_A], { datasetVersion: 'sha256:bbbb000000000000000000000000000000000000000000000000000000000000' }),
    ];

    const result = lifecycle({
      portfolios: [
        { portfolioId: 'portfolio-primary', portfolioRevision: 'rev-7' },
        { portfolioId: 'portfolio-secondary', portfolioRevision: 'rev-2' },
      ],
      observations,
      datasets,
    });

    assert.equal(result.distinctIssuers, 2, 'three Aarav holdings are ONE issuer');
    const rowA = result.issuers.find((row) => row.issuerId === ISSUER_A)!;
    assert.equal(rowA.holdings.length, 3);
    assert.equal(rowA.candidates.length, 2, 'both datasets are assessed…');
    // …and exactly one is REUSED: deterministic (lowest datasetVersion), never duplicated per holding.
    assert.equal(rowA.selectedDatasetVersion, 'sha256:aaaa000000000000000000000000000000000000000000000000000000000000');
    assert.deepEqual(
      rowA.holdings.map((reference) => reference.portfolioId).sort(),
      ['portfolio-primary', 'portfolio-primary', 'portfolio-secondary'],
    );
    assert.ok(rowA.states.includes('SUITABLE'));
    assert.equal(rowA.provisioning, null);

    // The reuse is linked back to each holding and portfolio revision.
    for (const reference of rowA.holdings) {
      assert.ok(reference.portfolioRevision === 'rev-7' || reference.portfolioRevision === 'rev-2');
    }

    const rowB = result.issuers.find((row) => row.issuerId === ISSUER_B)!;
    assert.deepEqual(rowB.states, ['MISSING']);
    assert.equal(rowB.selectedDatasetVersion, null);
    assert.ok(rowB.provisioning, 'the uncovered issuer gets a provisioning request, not a blocker');
    assert.equal(rowB.provisioning!.acquisitionProcess, 'AUTHORIZED_MANUAL_INGESTION');
  });
});

describe('W05-A — test 2: missing datasets never block portfolio creation or use', () => {
  test('a portfolio whose issuers all lack datasets is created, used and reported — not blocked', () => {
    const observations = [
      holding('H-001', 'portfolio-primary', ISSUER_A),
      holding('H-002', 'portfolio-primary', ISSUER_B),
      holding('H-003', 'portfolio-primary', ISSUER_C),
    ];

    // The lifecycle is REPORT-ONLY: running it with zero datasets must not throw and must not
    // mutate or gate the portfolio in any way.
    const result = lifecycle({
      portfolios: [{ portfolioId: 'portfolio-primary', portfolioRevision: 'rev-1' }],
      observations,
      datasets: [],
    });

    assert.equal(result.totalHoldings, 3);
    assert.equal(result.eligibleHoldings, 3);
    assert.equal(result.distinctIssuers, 3);
    for (const row of result.issuers) {
      assert.deepEqual(row.states, ['MISSING']);
      assert.equal(row.selectedDatasetVersion, null);
      assert.equal(row.provisioning?.status, 'REQUESTED');
      assert.equal(row.provisioning?.gap[0], 'MISSING');
    }
    assert.ok(result.notes.some((note) => /never blocks portfolio creation or ordinary portfolio use/.test(note)));

    const report = buildLifecycleReport(result, `${AS_OF}T00:00:00.000Z`);
    assert.equal(report.counts.missing, 3);
    assert.equal(report.counts.issuersNeedingProvisioning, 3);
    assert.equal(report.coveragePercentages[0]!.percent, 0);
    const rendered = renderLifecycleSummary(report);
    assert.match(rendered, /3 total, 3 eligible/);
    assert.match(rendered, /NO_DEFENSIBLE_VALUE_ASSERTED/);
    assert.match(rendered, /W20 gate: CLOSED/);
  });
});

describe('W05-E — test 11: coverage percentages use explicit, distinct denominators', () => {
  test('duplicate holdings never inflate issuer counts, and every denominator is named', () => {
    const observations = [
      holding('H-001', 'portfolio-one', ISSUER_A),
      holding('H-002', 'portfolio-one', ISSUER_A),
      holding('H-003', 'portfolio-one', ISSUER_B),
      holding('H-004', 'portfolio-two', ISSUER_B),
      holding('H-005', 'portfolio-two', ISSUER_C),
      unresolvedHolding('H-006', 'portfolio-one'),
    ];

    const result = lifecycle({
      portfolios: [
        { portfolioId: 'portfolio-one', portfolioRevision: 'rev-9' },
        { portfolioId: 'portfolio-two', portfolioRevision: 'rev-3' },
      ],
      observations,
      datasets: [suitableEntry([ISSUER_A], { datasetVersion: 'sha256:cccc000000000000000000000000000000000000000000000000000000000000' })],
    });

    const report = buildLifecycleReport(result, `${AS_OF}T00:00:00.000Z`);

    assert.equal(report.denominators.totalHoldings, 6);
    assert.equal(report.denominators.eligibleHoldings, 5, 'the unresolved holding is excluded and named');
    assert.equal(report.denominators.distinctIssuers, 3, 'five eligible holdings resolve to three issuers');
    assert.equal(report.denominators.unresolvedHoldings, 1);

    const [byIssuer, byQualified, byHolding] = report.coveragePercentages;
    assert.equal(byIssuer!.basis, 'DISTINCT_ISSUERS');
    assert.equal(byIssuer!.numerator, 1);
    assert.equal(byIssuer!.denominator, 3);
    assert.equal(byIssuer!.percent, 33.3);
    assert.match(byIssuer!.excludes, /unresolved holding/);

    assert.equal(byQualified!.basis, 'DISTINCT_ISSUERS');
    assert.equal(byQualified!.numerator, 1);
    assert.equal(byQualified!.denominator, 3);
    assert.match(byQualified!.excludes, /per-dataset technical mechanism/);

    assert.equal(byHolding!.basis, 'ELIGIBLE_HOLDINGS');
    assert.equal(byHolding!.numerator, 2, 'the two Aarav holdings share one suitable dataset');
    assert.equal(byHolding!.denominator, 5);
    assert.match(byHolding!.excludes, /1 unresolved holding/);

    // Per-portfolio: distinct issuers per portfolio, not per holding.
    const one = report.portfolioSummaries.find((summary) => summary.portfolioId === 'portfolio-one')!;
    assert.equal(one.totalHoldings, 4);
    assert.equal(one.eligibleHoldings, 3);
    assert.equal(one.unresolvedHoldings, 1);
    assert.equal(one.distinctIssuers, 2, 'Aarav counted once although held twice');
    assert.equal(one.issuersWithSuitableDataset, 1);
    const two = report.portfolioSummaries.find((summary) => summary.portfolioId === 'portfolio-two')!;
    assert.equal(two.distinctIssuers, 2);
    assert.equal(two.issuersNeedingProvisioning, 2);

    // The unresolved case is itemised, never hidden in an aggregate.
    assert.equal(report.unresolved.length, 1);
    assert.equal(report.unresolved[0]!.observationId, 'H-006');
    assert.notEqual(report.unresolved[0]!.state, 'RESOLVED');
    assert.ok(report.unresolved[0]!.reason !== null, 'the unresolved case names its reason');
    assert.equal(report.unresolved[0]!.portfolioRevision, 'rev-9');
  });

  test('coverage is reported by sector and by acquisition method alongside the by-issuer figures', () => {
    const observations = [
      holding('H-001', 'portfolio-one', ISSUER_A),
      holding('H-002', 'portfolio-one', ISSUER_A),
      holding('H-003', 'portfolio-one', ISSUER_B),
      unresolvedHolding('H-006', 'portfolio-one'),
    ];

    const result = lifecycle({
      portfolios: [{ portfolioId: 'portfolio-one', portfolioRevision: 'rev-9' }],
      observations,
      datasets: [suitableEntry([ISSUER_A], { datasetVersion: 'sha256:eeee000000000000000000000000000000000000000000000000000000000000' })],
    });
    const report = buildLifecycleReport(result, `${AS_OF}T00:00:00.000Z`);

    // By sector: the provisioned issuer's recorded sector; the unprovisioned issuer is UNSPECIFIED.
    const technology = report.coverageBySector.find((entry) => entry.key === 'Technology')!;
    assert.equal(technology.basis, 'SECTOR');
    assert.equal(technology.issuers, 1);
    assert.equal(technology.holdings, 2);
    assert.equal(technology.holdingsWithFinancialData, 2);
    assert.equal(technology.percent, 100);
    const unspecified = report.coverageBySector.find((entry) => entry.key === 'UNSPECIFIED')!;
    assert.equal(unspecified.issuers, 1);
    assert.equal(unspecified.holdingsWithFinancialData, 0);

    // By acquisition method: the recorded method of the provisioned dataset; NOT_PROVISIONED for the rest.
    const provisioned = report.coverageByAcquisitionMethod.find((entry) => entry.key === 'SYNTHETIC_GENERATION')!;
    assert.equal(provisioned.basis, 'ACQUISITION_METHOD');
    assert.equal(provisioned.holdings, 2);
    assert.equal(provisioned.holdingsWithFinancialData, 2);
    const notProvisioned = report.coverageByAcquisitionMethod.find((entry) => entry.key === 'NOT_PROVISIONED')!;
    assert.equal(notProvisioned.holdings, 1);
    assert.equal(notProvisioned.holdingsWithFinancialData, 0);

    // Dimension entries cover identity-passed holdings only — the unresolved holding is itemised.
    const dimensionHoldings = report.coverageBySector.reduce((total, entry) => total + entry.holdings, 0);
    assert.equal(dimensionHoldings, 3, 'the unresolved holding is outside every dimension entry and named under `unresolved`');
  });

  test('the financial ratio is identity-gated and θF rides on the report without a W05 condition', () => {
    const observations = [
      holding('H-001', 'portfolio-one', ISSUER_A),
      holding('H-002', 'portfolio-one', ISSUER_A),
      holding('H-003', 'portfolio-one', ISSUER_B),
      unresolvedHolding('H-006', 'portfolio-one'),
    ];

    const result = lifecycle({
      portfolios: [{ portfolioId: 'portfolio-one', portfolioRevision: 'rev-9' }],
      observations,
      datasets: [suitableEntry([ISSUER_A], { datasetVersion: 'sha256:eeee000000000000000000000000000000000000000000000000000000000000' })],
    });
    const report = buildLifecycleReport(result, `${AS_OF}T00:00:00.000Z`);

    assert.equal(report.financialRatio.numerator, 2, 'only identity-passed holdings served by a suitable dataset contribute');
    assert.equal(report.financialRatio.denominator, 4, 'the denominator is the portfolio holding count');
    assert.equal(report.financialRatio.identityPassedHoldings, 3);
    assert.equal(report.financialRatio.percent, 50);
    assert.match(report.financialRatio.numeratorRule, /only if its own identity passes/);

    assert.equal(report.thetaF.semantics, 'PORTFOLIO_WIDE_RATIO');
    assert.equal(report.thetaF.gates, 'W20');
    assert.equal(report.thetaF.isW05Condition, false, 'θF is not a W05 condition');
    assert.equal(report.thetaF.isPerDatasetQualificationThreshold, false);
    assert.equal(report.thetaF.assertionStatus, 'NO_DEFENSIBLE_VALUE_ASSERTED');
    assert.equal(report.thetaF.w20GateOpen, false, 'the W20 gate fails closed');
  });
});

describe('W05-A — test 12: portfolios beyond 200 holdings on the same lifecycle', () => {
  test('220 holdings with progressive provisioning — no requirement for all datasets upfront', () => {
    const issuers = [ISSUER_A, ISSUER_B, ISSUER_C, ISSUER_D, ISSUER_E];
    const observations: IdentityObservation[] = [];
    for (let index = 0; index < 220; index += 1) {
      const issuerId = issuers[index % issuers.length]!;
      const portfolioId = `portfolio-${(index % 3) + 1}`;
      observations.push(holding(`H-${String(index + 1).padStart(4, '0')}`, portfolioId, issuerId, (index % 7) + 1));
    }
    observations.push(unresolvedHolding('H-9001', 'portfolio-1'));

    const result = lifecycle({
      portfolios: [
        { portfolioId: 'portfolio-1', portfolioRevision: 'rev-40' },
        { portfolioId: 'portfolio-2', portfolioRevision: 'rev-12' },
        { portfolioId: 'portfolio-3', portfolioRevision: 'rev-5' },
      ],
      observations,
      // ONE dataset exists — for one issuer. The lifecycle runs anyway and says so.
      datasets: [suitableEntry([ISSUER_A], { datasetVersion: 'sha256:dddd000000000000000000000000000000000000000000000000000000000000' })],
    });

    assert.equal(result.totalHoldings, 221);
    assert.equal(result.eligibleHoldings, 220);
    assert.equal(result.distinctIssuers, 5);
    const rowA = result.issuers.find((row) => row.issuerId === ISSUER_A)!;
    assert.equal(rowA.holdings.length, 44, '44 Aarav holdings across three portfolios share one dataset');
    assert.equal(rowA.selectedDatasetVersion, 'sha256:dddd000000000000000000000000000000000000000000000000000000000000');
    assert.equal(result.issuers.filter((row) => row.provisioning !== null).length, 4);

    const report = buildLifecycleReport(result, `${AS_OF}T00:00:00.000Z`);
    assert.equal(report.denominators.distinctIssuers, 5);
    assert.equal(report.denominators.eligibleHoldings, 220);
    const byHolding = report.coveragePercentages.find((entry) => entry.id === 'eligible-holding-coverage')!;
    assert.equal(byHolding.numerator, 44);
    assert.equal(byHolding.denominator, 220);
    assert.equal(report.portfolioSummaries.length, 3);
    for (const summary of report.portfolioSummaries) {
      assert.ok(summary.totalHoldings >= 73, 'every portfolio is fully accounted');
    }
  });
});

describe('W05 — negative tests: malformed manifests and inconsistent rights evidence fail closed', () => {
  test('a tampered dataset file is refused at read time and never reaches the lifecycle', () => {
    const temp = writeTempDataset();
    try {
      // Corrupt one digested file. `readDataset` must refuse the whole dataset.
      const periodsPath = join(temp.dir, 'periods.json');
      const periods = JSON.parse(readFileSync(periodsPath, 'utf8')) as unknown[];
      writeFileSync(periodsPath, JSON.stringify([...periods, { tampered: true }]), 'utf8');

      const read = tryCatalogEntryFromDatasetDir(temp.dir);
      assert.equal(read.ok, false);
      assert.equal(read.ok === false && read.errorName, 'DatasetIntegrityError');
    } finally {
      temp.cleanup();
    }
  });

  test('an untouched dataset reads back verified and becomes a catalog entry', () => {
    const temp = writeTempDataset();
    try {
      const read = tryCatalogEntryFromDatasetDir(temp.dir);
      assert.equal(read.ok, true);
      if (!read.ok) return;
      assert.equal(read.entry.integrity.ok, true);
      assert.equal(read.entry.rights, undefined, 'no rights record is invented for the entry');

      const port = openLocalSnapshot({ dataDir: temp.dir });
      const fromPort = catalogEntryFromReadPort(port, 'temp-dataset');
      assert.equal(fromPort.integrity.ok, true);
      assert.equal(fromPort.dataset.datasetVersion, read.entry.dataset.datasetVersion);
      assert.ok(fromPort.issuers.length > 0);
    } finally {
      temp.cleanup();
    }
  });

  test('a malformed rights declaration in a manifest fails closed as RIGHTS_UNKNOWN', () => {
    const broken = catalogEntry([{ issuerId: ISSUER_A, periods: threeCompleteAnnuals(ISSUER_A) }], {
      // A malformed declaration: OPERATOR_ASSERTED with no basis.
      sourceRights: { state: 'OPERATOR_ASSERTED', basis: '', note: '' },
    });

    const result = lifecycle({ observations: [holding('H-001', 'portfolio-primary', ISSUER_A)], datasets: [broken] });
    const row = result.issuers[0]!;
    assert.equal(row.selectedDatasetVersion, null, 'a malformed declaration can never produce a suitable dataset');
    assert.ok(row.states.includes('RIGHTS_UNKNOWN'));
    assert.ok(row.provisioning, 'the gap is recorded as a provisioning request');
    const candidate = row.candidates[0]!;
    assert.ok(candidate.states.includes('RIGHTS_UNKNOWN'));
    assert.match(candidate.qualification.evidence.rights.statusReason, /fails closed/);
  });

  test('a rights record that disagrees with the dataset manifest fails closed', () => {
    const record = syntheticRightsRecord(AS_OF); // claims SYNTHETIC…
    const inconsistent = catalogEntry([{ issuerId: ISSUER_A, periods: threeCompleteAnnuals(ISSUER_A) }], {
      // …while the manifest declares OPERATOR_ASSERTED.
      sourceRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
      rights: record,
    });

    const result = lifecycle({ observations: [holding('H-001', 'portfolio-primary', ISSUER_A)], datasets: [inconsistent] });
    const row = result.issuers[0]!;
    assert.equal(row.selectedDatasetVersion, null);
    assert.ok(row.states.includes('RIGHTS_UNKNOWN'));
    assert.match(row.candidates[0]!.qualification.evidence.rights.statusReason, /inconsistent with the dataset manifest/);
  });

  test('an unknown-rights dataset (no declaration) never becomes suitable', () => {
    const noRights = catalogEntry([{ issuerId: ISSUER_A, periods: threeCompleteAnnuals(ISSUER_A) }], {
      sourceRights: { state: 'UNKNOWN', basis: '', note: '' },
    });
    const result = lifecycle({ observations: [holding('H-001', 'portfolio-primary', ISSUER_A)], datasets: [noRights] });
    const row = result.issuers[0]!;
    assert.equal(row.selectedDatasetVersion, null);
    assert.ok(row.states.includes('RIGHTS_UNKNOWN'));

    // With a full operator-asserted rights record attached to the SAME manifest state it stays
    // UNKNOWN too: the declaration decides the class, and an UNKNOWN declaration is not permission.
    const contradiction = catalogEntry([{ issuerId: ISSUER_A, periods: threeCompleteAnnuals(ISSUER_A) }], {
      sourceRights: { state: 'UNKNOWN', basis: '', note: '' },
      rights: operatorAssertedRightsRecord(AS_OF),
    });
    const second = lifecycle({ observations: [holding('H-002', 'portfolio-primary', ISSUER_A)], datasets: [contradiction] });
    assert.equal(second.issuers[0]!.selectedDatasetVersion, null);
    assert.ok(second.issuers[0]!.states.includes('RIGHTS_UNKNOWN'));
  });

  test('a stale dataset is reused only as STALE — never silently as suitable', () => {
    const stale = catalogEntry([{ issuerId: ISSUER_A, periods: threeCompleteAnnuals(ISSUER_A) }], {
      sourceRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
      rights: operatorAssertedRightsRecord('2026-11-17'),
    });
    // FY2026 ended 2026-03-31; by 2026-11-17 it is outside the 200-day P&L window.
    const result = buildIssuerLifecycle({
      asOf: '2026-11-17',
      portfolios: [{ portfolioId: 'portfolio-primary', portfolioRevision: 'rev-1' }],
      observations: [holding('H-001', 'portfolio-primary', ISSUER_A)],
      identitySources: loadFixtureSources(),
      datasets: [stale],
    });
    const row = result.issuers[0]!;
    assert.equal(row.selectedDatasetVersion, null);
    assert.ok(row.states.includes('STALE'));
    assert.ok(row.provisioning, 'stale coverage is insufficient coverage, and that is recorded');
    assert.ok(row.provisioning!.gap.includes('STALE'));
    assert.equal(row.candidates[0]!.qualification.freshness.status, 'STALE');
  });

  test('restricted rights are recorded as RESTRICTED, distinctly from UNKNOWN', () => {
    const restricted = catalogEntry([{ issuerId: ISSUER_A, periods: threeCompleteAnnuals(ISSUER_A) }], {
      sourceRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
      rights: buildRightsRecord(
        {
          manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
          evidence: {
            sourceIdentity: 'synthetic operator source',
            sourceType: 'OPERATOR_SUPPLIED_FILE',
            documentReference: 'SYNTHETIC-FILING-REF',
            acquisitionMethod: 'OPERATOR_SUPPLIED_FILE',
            acquisitionDate: AS_OF,
            evidenceRefs: ['sha256:synthetic-evidence-digest'],
          },
          permissions: {
            ACQUISITION: 'PERMITTED',
            LOCAL_STORAGE: 'PERMITTED',
            PROCESSING: 'PERMITTED',
            ANALYSIS: 'NOT_PERMITTED',
            DISPLAY: 'PERMITTED',
            RETENTION: 'PERMITTED',
            REDISTRIBUTION: 'NOT_PERMITTED',
          },
        },
        AS_OF,
      ),
    });
    const result = lifecycle({ observations: [holding('H-001', 'portfolio-primary', ISSUER_A)], datasets: [restricted] });
    const row = result.issuers[0]!;
    assert.ok(row.states.includes('RIGHTS_RESTRICTED'));
    assert.ok(!row.states.includes('RIGHTS_UNKNOWN'), 'restricted and unknown are distinct states');
    assert.equal(row.selectedDatasetVersion, null);
  });
});
