/**
 * IID — the investment-coverage read model.
 *
 * The read model answers a question about the DATA: which issuers does the served dataset hold,
 * what financials exist for each, which sectors have been measured, and what is outstanding.
 *
 * What it must never do is depend on the identity sources. The identity-source state is DISCLOSED
 * in the report and on each issuer row; it never suppresses the dataset position and never changes
 * a count.
 *
 * What is proven here:
 *   1. The report is computed with the identity sources unavailable, and the counts are unchanged.
 *   2. The identity dependency is `null` ("not evaluated") when the sources are absent — never
 *      `false` ("no dependency"), which would be a different and untrue statement.
 *   3. An issuer with no financials is reported as such, not as covered.
 *   4. An ingestion issue moves the issuer into `ISSUED_DATA`.
 *   5. An absent dataset is disclosed as `NONE` with zero issuers — an empty position, not a failure.
 *   6. Nothing is estimated: a number in the report is a number the dataset holds.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildInvestmentCoverageReport } from '../../src/investment/coverage/investmentCoverage';
import type { DatasetManifest } from '../../src/investment/fundamentals/manifest';
import type { IssuerRecord, NormalizedPeriod } from '../../src/investment/fundamentals/types';

const ASOF = '2026-11-10';

const ISSUER_A = 'IN:EQISIN:IN0000000201';
const ISSUER_B = 'IN:EQISIN:IN0000000202';

function issuer(issuerId: string, legalName: string, sector: string): IssuerRecord {
  return {
    issuerId,
    legalName,
    issuerKeyBasis: 'ISIN',
    sector,
    subSegment: null,
    reportingCurrency: 'INR',
    fiscalYearEnd: '03-31',
  } as IssuerRecord;
}

function period(issuerId: string, periodEnd: string, periodType: 'ANNUAL' | 'QUARTER'): NormalizedPeriod {
  return {
    issuerId,
    period: {
      fiscalYear: Number(periodEnd.slice(0, 4)),
      periodType,
      periodStart: `${periodEnd.slice(0, 4)}-04-01`,
      periodEnd,
      statementScope: 'CONSOLIDATED',
    },
    taxonomy: 'IFRS',
    normalizationVersion: '1',
    currency: 'INR',
    sourceScale: 'UNITS',
    scaleApplied: 'NONE',
    basis: 'AS_FILED',
  } as unknown as NormalizedPeriod;
}

const MANIFEST = {
  datasetSchema: 'IIPS_V3_FUNDAMENTALS_V1',
  datasetVersion: 'sha256:abc',
  contentDigest: 'abc',
  provider: 'synthetic-test-fixture',
  licence: 'synthetic-test-fixture',
  dataAsOf: '2026-11-09',
  knownAsOf: '2026-11-09',
  lastImportAt: '2026-11-09T18:00:00.000Z',
  importRunId: 'run-1',
  quality: 'good',
  completenessPct: 90,
  coverage: {
    issuers: 2,
    securities: 2,
    listings: 2,
    annualPeriods: 1,
    quarterlyPeriods: 0,
    earliestPeriodEnd: '2026-03-31',
    latestPeriodEnd: '2026-03-31',
    operatingMetricRecords: 0,
    corporateActions: 0,
    prices: 0,
  },
  digestScope: 'DATASET_V1',
  files: {},
} as unknown as DatasetManifest;

const ISSUERS = [issuer(ISSUER_A, 'Example Industries Limited', 'INDUSTRIALS'), issuer(ISSUER_B, 'Example Bank Limited', 'BANKS')];

describe('IID — the investment coverage report is independent of the identity sources', () => {
  const base = {
    asOf: ASOF,
    generatedAt: `${ASOF}T00:00:00.000Z`,
    manifest: MANIFEST,
    issuers: ISSUERS,
    securities: [],
    periods: [period(ISSUER_A, '2026-03-31', 'ANNUAL')],
    prices: [],
    operatingMetrics: [],
    issues: [],
  };

  it('computes the same counts whether or not the identity sources are available', () => {
    const withIdentity = buildInvestmentCoverageReport({ ...base, identitySourcesAvailable: true });
    const withoutIdentity = buildInvestmentCoverageReport({ ...base, identitySourcesAvailable: false });

    assert.deepEqual(withoutIdentity.counts, withIdentity.counts);
    assert.equal(withoutIdentity.issuers.length, withIdentity.issuers.length);
    assert.equal(withoutIdentity.issuers.length, 2);
    assert.equal(withoutIdentity.dataset.issuers, 2);
  });

  it('discloses the identity-source absence without changing the dataset position', () => {
    const report = buildInvestmentCoverageReport({
      ...base,
      identitySourcesAvailable: false,
      identitySourceDetail: 'eligible-roster.json: IDENTITY_SOURCE_MISSING',
    });

    assert.equal(report.identitySourcesAvailable, false);
    assert.match(report.identitySourceDetail ?? '', /IDENTITY_SOURCE_MISSING/);
    // The dataset position is still reported in full.
    assert.equal(report.counts.observed, 2);
    assert.match(report.statusLine, /issuer\(s\) covered/);
    // And the disclosure is stated in the notes, not only in a flag.
    assert.ok(report.notes.some((note) => /could not be loaded/.test(note)));
  });

  it('reports the identity dependency as "not evaluated" when the sources are absent', () => {
    const report = buildInvestmentCoverageReport({ ...base, identitySourcesAvailable: false });

    for (const row of report.issuers) {
      assert.equal(row.identityDependency, null, 'null means "not evaluated", never "no dependency"');
      assert.match(row.identityDependencyDetail ?? '', /could not be loaded/);
    }
  });

  it('reports the identity dependency as resolved when the caller evaluated it', () => {
    const report = buildInvestmentCoverageReport({
      ...base,
      identitySourcesAvailable: true,
      issuerIdentityState: new Map([[ISSUER_A, 'RESOLVED' as const]]),
    });

    const rowA = report.issuers.find((row) => row.issuerId === ISSUER_A);
    const rowB = report.issuers.find((row) => row.issuerId === ISSUER_B);
    assert.equal(rowA?.identityDependency, 'RESOLVED');
    // An issuer the map says nothing about is UNRESOLVED, not RESOLVED.
    assert.equal(rowB?.identityDependency, 'UNRESOLVED');
    assert.match(rowB?.identityDependencyDetail ?? '', /no resolved identity binding/);
  });

  it('reports an issuer with no financials as NO_FINANCIALS, not as covered', () => {
    const report = buildInvestmentCoverageReport({ ...base, identitySourcesAvailable: true });

    const rowA = report.issuers.find((row) => row.issuerId === ISSUER_A);
    const rowB = report.issuers.find((row) => row.issuerId === ISSUER_B);
    assert.equal(rowA?.annualPeriods, 1);
    assert.equal(rowB?.annualPeriods, 0);
    assert.equal(rowB?.state, 'NO_FINANCIALS');
    assert.equal(report.counts.NO_FINANCIALS, 1);
  });

  it('counts the contract token QUARTER in issuer rows, not the non-contract string QUARTERLY (S4-R3)', () => {
    const annual = period(ISSUER_A, '2026-03-31', 'ANNUAL');
    const quarterly: NormalizedPeriod = {
      ...period(ISSUER_A, '2026-09-30', 'QUARTER'),
      period: {
        ...period(ISSUER_A, '2026-09-30', 'QUARTER').period,
        periodStart: '2026-07-01',
        quarterForm: 'DISCRETE',
        quarterIndex: 2,
      },
    };
    const manifest = {
      ...MANIFEST,
      coverage: { ...MANIFEST.coverage, annualPeriods: 1, quarterlyPeriods: 1, latestPeriodEnd: '2026-09-30' },
    } as unknown as DatasetManifest;
    const report = buildInvestmentCoverageReport({
      ...base,
      manifest,
      periods: [annual, quarterly],
      identitySourcesAvailable: true,
    });

    const rowA = report.issuers.find((row) => row.issuerId === ISSUER_A);
    const rowB = report.issuers.find((row) => row.issuerId === ISSUER_B);
    assert.equal(rowA?.annualPeriods, 1);
    assert.equal(rowA?.quarterlyPeriods, 1, 'a valid QUARTER period must not be reported as zero quarterly coverage');
    assert.equal(rowA?.latestPeriodEnd, '2026-09-30');
    assert.notEqual(rowA?.state, 'NO_FINANCIALS');
    assert.equal(rowB?.quarterlyPeriods, 0);
    assert.equal(report.dataset.quarterlyPeriods, 1);
  });

  it('reports an issuer carrying an ingestion issue as ISSUED_DATA', () => {
    const report = buildInvestmentCoverageReport({
      ...base,
      identitySourcesAvailable: true,
      issues: [
        {
          severity: 'WARNING',
          code: 'MISSING_METRIC',
          subject: `period ${ISSUER_A}`,
          detail: 'a metric was absent',
        },
      ],
    });

    const rowA = report.issuers.find((row) => row.issuerId === ISSUER_A);
    assert.equal(rowA?.state, 'ISSUED_DATA');
    assert.deepEqual(rowA?.issueCodes, ['MISSING_METRIC']);
    assert.equal(report.counts.ISSUED_DATA, 1);
  });

  it('discloses an absent dataset as NONE with zero issuers — an empty position, not a failure', () => {
    const report = buildInvestmentCoverageReport({
      asOf: ASOF,
      generatedAt: `${ASOF}T00:00:00.000Z`,
      manifest: null,
      issuers: [],
      securities: [],
      periods: [],
      prices: [],
      operatingMetrics: [],
      issues: [],
      identitySourcesAvailable: true,
    });

    assert.equal(report.dataset.datasetClass, 'NONE');
    assert.equal(report.dataset.issuers, 0);
    assert.equal(report.counts.observed, 0);
    assert.equal(report.issuers.length, 0);
    assert.match(report.statusLine, /No investment dataset is installed/);
  });

  it('reports the dataset class honestly: a synthetic fixture is never called operator-supplied', () => {
    const synthetic = buildInvestmentCoverageReport({ ...base, identitySourcesAvailable: true });
    assert.equal(synthetic.dataset.datasetClass, 'SYNTHETIC_FIXTURE');

    const operator = buildInvestmentCoverageReport({
      ...base,
      identitySourcesAvailable: true,
      manifest: { ...MANIFEST, provider: 'NSE', licence: 'operator' } as unknown as DatasetManifest,
    });
    assert.equal(operator.dataset.datasetClass, 'OPERATOR_SUPPLIED');
  });

  it('states nothing it did not receive: the issuer count is the dataset count', () => {
    const report = buildInvestmentCoverageReport({ ...base, identitySourcesAvailable: true });
    assert.equal(report.dataset.issuers, ISSUERS.length);
    assert.equal(report.counts.observed, report.issuers.length);
  });
});
