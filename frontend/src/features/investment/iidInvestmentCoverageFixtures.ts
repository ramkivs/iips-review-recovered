/**
 * IID — the INVESTMENT coverage fixtures.
 *
 * A synthetic investment-coverage report, in the shape the server returns. It describes a dataset
 * position — issuers, financials, sector measurement — and carries the identity disclosure that
 * tells the page whether an identity binding could be evaluated.
 *
 * SYNTHETIC. Every issuer here is fabricated for the test. Nothing here is an observation of a real
 * issuer, and the fixture says so through `datasetClass: 'SYNTHETIC_FIXTURE'`.
 */

export const INVESTMENT_ISSUER = 'IN:EQISIN:IN0000000201';
export const INVESTMENT_ISSUER_NAME = 'Example Industries Limited';

/** A fully populated investment-coverage report. */
export const INVESTMENT_COVERAGE_REPORT = {
  reportVersion: 1,
  asOf: '2026-11-10',
  generatedAt: '2026-11-10T00:00:00.000Z',
  dataset: {
    datasetVersion: 'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    contentDigest: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    provider: 'synthetic-test-fixture',
    licence: 'synthetic-test-fixture',
    dataAsOf: '2026-11-09',
    knownAsOf: '2026-11-09',
    lastImportAt: '2026-11-09T18:00:00.000Z',
    importRunId: 'run-synthetic-001',
    quality: 'good',
    completenessPct: 92,
    datasetClass: 'SYNTHETIC_FIXTURE',
    issuers: 2,
    securities: 2,
    listings: 2,
    annualPeriods: 4,
    quarterlyPeriods: 4,
    prices: 10,
    operatingMetricRecords: 6,
    corporateActions: 1,
    earliestPeriodEnd: '2023-03-31',
    latestPeriodEnd: '2026-03-31',
  },
  sectors: [
    { sector: 'BANKS', stage: 'G2_PARTIAL', issuerCount: 1 },
    { sector: 'INDUSTRIALS', stage: 'G1_ENABLED', issuerCount: 1 },
  ],
  measuredSectors: 2,
  totalSectors: 2,
  outstandingSectors: [],
  issuers: [
    {
      issuerId: INVESTMENT_ISSUER,
      legalName: INVESTMENT_ISSUER_NAME,
      sector: 'INDUSTRIALS',
      subSegment: 'Capital Goods',
      reportingCurrency: 'INR',
      fiscalYearEnd: '03-31',
      state: 'COVERED',
      annualPeriods: 2,
      quarterlyPeriods: 2,
      securities: 1,
      prices: 5,
      operatingMetrics: 3,
      latestPeriodEnd: '2026-03-31',
      earliestPeriodEnd: '2025-03-31',
      issueCodes: [],
      identityDependency: 'RESOLVED',
      identityDependencyDetail: null,
    },
    {
      issuerId: 'IN:EQISIN:IN0000000202',
      legalName: 'Example Bank Limited',
      sector: 'BANKS',
      subSegment: null,
      reportingCurrency: 'INR',
      fiscalYearEnd: '03-31',
      state: 'NO_FINANCIALS',
      annualPeriods: 0,
      quarterlyPeriods: 0,
      securities: 1,
      prices: 5,
      operatingMetrics: 3,
      latestPeriodEnd: null,
      earliestPeriodEnd: null,
      issueCodes: [],
      identityDependency: 'RESOLVED',
      identityDependencyDetail: null,
    },
  ],
  counts: {
    observed: 2,
    COVERED: 1,
    NO_FINANCIALS: 1,
    SECTOR_NOT_MEASURED: 0,
    ISSUED_DATA: 0,
  },
  issues: [],
  financialCoverage: {
    measuredSectors: 2,
    totalSectors: 2,
    outstandingSectors: [],
    usableMethods: 4,
    withheldMethods: 0,
    xbrlMappedTags: 120,
    derivationItems: 30,
    unmappedTagsObserved: [],
    datasetClass: 'SYNTHETIC_FIXTURE',
    note: 'Identity coverage says whether a row has a defensible issuer/security/listing. It says nothing about whether the issuer has usable fundamentals.',
  },
  statusLine: '1 of 2 issuer(s) covered; 1 without financials, 0 in an unmeasured sector, 0 carrying an ingestion issue. 2 of 2 sector(s) measured.',
  notes: [
    'Investment coverage describes what the served dataset holds. It is not identity coverage.',
    'Identity coverage is a separate read.',
  ],
  identitySourcesAvailable: true,
  identitySourceDetail: null,
};

/**
 * The same report, with the identity sources unavailable.
 *
 * This is the scenario the defect reported: the identity files are absent, so the identity binding
 * could not be evaluated for any issuer. The investment-coverage position is unchanged, and the
 * report says so.
 */
export const INVESTMENT_COVERAGE_REPORT_IDENTITY_UNAVAILABLE = {
  ...INVESTMENT_COVERAGE_REPORT,
  issuers: INVESTMENT_COVERAGE_REPORT.issuers.map((row) => ({
    ...row,
    identityDependency: null,
    identityDependencyDetail:
      'The identity sources could not be loaded, so no identity binding could be evaluated for this issuer.',
  })),
  notes: [
    ...INVESTMENT_COVERAGE_REPORT.notes,
    'The eligible roster, listing map and corporate-action table could not be loaded, so no identity binding could be evaluated for any issuer. The investment-coverage position above is the dataset\'s own and is unaffected.',
  ],
  identitySourcesAvailable: false,
  identitySourceDetail: 'eligible-roster.json: IDENTITY_SOURCE_MISSING',
};

/** A report with no dataset installed: a disclosed empty position, not a failure. */
export const INVESTMENT_COVERAGE_REPORT_EMPTY = {
  ...INVESTMENT_COVERAGE_REPORT,
  dataset: {
    ...INVESTMENT_COVERAGE_REPORT.dataset,
    datasetVersion: 'NONE',
    contentDigest: '',
    provider: 'none',
    licence: 'none',
    quality: 'unavailable',
    completenessPct: 0,
    datasetClass: 'NONE',
    issuers: 0,
    securities: 0,
    listings: 0,
    annualPeriods: 0,
    quarterlyPeriods: 0,
    prices: 0,
    operatingMetricRecords: 0,
    corporateActions: 0,
    earliestPeriodEnd: null,
    latestPeriodEnd: null,
  },
  sectors: [],
  measuredSectors: 0,
  totalSectors: 0,
  outstandingSectors: [],
  issuers: [],
  counts: { observed: 0, COVERED: 0, NO_FINANCIALS: 0, SECTOR_NOT_MEASURED: 0, ISSUED_DATA: 0 },
  financialCoverage: {
    ...INVESTMENT_COVERAGE_REPORT.financialCoverage,
    measuredSectors: 0,
    totalSectors: 0,
    datasetClass: 'NONE',
  },
  statusLine: 'No investment dataset is installed: no issuer is covered.',
  identitySourcesAvailable: true,
  identitySourceDetail: null,
};
