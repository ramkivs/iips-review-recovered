/**
 * IID — typed client for the INVESTMENT coverage endpoint.
 *
 * This is a SEPARATE read from the identity coverage client (`investmentCoverage.ts`).
 *
 *   Identity Coverage    — `GET /api/investment/coverage`        → identity coverage report
 *   Investment Coverage  — `GET /api/investment/coverage/investment` → investment coverage report
 *
 * The two answer different questions and fail differently. The identity read fails closed with 503
 * when the eligible roster, listing map or corporate-action table cannot be loaded. The investment
 * read answers from the dataset and is unaffected by that: an identity-source problem is DISCLOSED
 * on the investment report (and per row), never rendered as an investment-coverage failure.
 *
 * The types mirror the server's read model. They are declared here rather than imported so the
 * browser bundle carries no server code.
 */

export const INVESTMENT_COVERAGE_INVESTMENT_ROUTES = Object.freeze({
  json: '/api/investment/coverage/investment',
});

/** The issuer's investment-coverage position. */
export type InvestmentCoverageState =
  | 'COVERED'
  | 'NO_FINANCIALS'
  | 'SECTOR_NOT_MEASURED'
  | 'ISSUED_DATA';

export interface InvestmentCoverageIssuerRow {
  readonly issuerId: string;
  readonly legalName: string;
  readonly sector: string;
  readonly subSegment: string | null;
  readonly reportingCurrency: string;
  readonly fiscalYearEnd: string;
  readonly state: InvestmentCoverageState;
  readonly annualPeriods: number;
  readonly quarterlyPeriods: number;
  readonly securities: number;
  readonly prices: number;
  readonly operatingMetrics: number;
  readonly latestPeriodEnd: string | null;
  readonly earliestPeriodEnd: string | null;
  readonly issueCodes: readonly string[];
  /**
   * `null` means "not evaluated" — the identity sources could not be loaded, so no binding could be
   * checked. It is never collapsed into `false`: "unknown" and "no dependency" are different.
   */
  readonly identityDependency: 'RESOLVED' | 'UNRESOLVED' | null;
  readonly identityDependencyDetail: string | null;
}

export interface InvestmentCoverageSectorRow {
  readonly sector: string;
  readonly stage: string;
  readonly issuerCount: number;
}

export interface InvestmentCoverageReport {
  readonly reportVersion: 1;
  readonly asOf: string;
  readonly generatedAt: string;
  readonly dataset: {
    readonly datasetVersion: string;
    readonly contentDigest: string;
    readonly provider: string;
    readonly licence: string;
    readonly dataAsOf: string | null;
    readonly knownAsOf: string | null;
    readonly lastImportAt: string;
    readonly importRunId: string;
    readonly quality: 'good' | 'stale' | 'partial' | 'unavailable';
    readonly completenessPct: number;
    readonly datasetClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'NONE';
    readonly issuers: number;
    readonly securities: number;
    readonly listings: number;
    readonly annualPeriods: number;
    readonly quarterlyPeriods: number;
    readonly prices: number;
    readonly operatingMetricRecords: number;
    readonly corporateActions: number;
    readonly earliestPeriodEnd: string | null;
    readonly latestPeriodEnd: string | null;
  };
  readonly sectors: readonly InvestmentCoverageSectorRow[];
  readonly measuredSectors: number;
  readonly totalSectors: number;
  readonly outstandingSectors: readonly string[];
  readonly issuers: readonly InvestmentCoverageIssuerRow[];
  readonly counts: Readonly<Record<InvestmentCoverageState | 'observed', number>>;
  readonly issues: readonly { readonly code: string; readonly subject: string; readonly detail: string }[];
  readonly financialCoverage: {
    readonly measuredSectors: number;
    readonly totalSectors: number;
    readonly outstandingSectors: readonly string[];
    readonly usableMethods: number;
    readonly withheldMethods: number;
    readonly xbrlMappedTags: number;
    readonly derivationItems: number;
    readonly unmappedTagsObserved: readonly string[];
    readonly datasetClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'NONE';
    readonly note: string;
  };
  readonly statusLine: string;
  readonly notes: readonly string[];
  readonly identitySourcesAvailable: boolean;
  readonly identitySourceDetail: string | null;
}

/**
 * The investment-coverage read failed. It is deliberately NOT the identity failure type: the two
 * surfaces must never render each other's message.
 */
export class InvestmentCoverageUnavailableError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly issues: readonly { readonly code: string; readonly subject: string; readonly detail: string }[],
  ) {
    super(message);
    this.name = 'InvestmentCoverageUnavailableError';
  }
}

const plain = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * A report is only usable if it carries the sections the view needs. An unrecognised payload is an
 * error, never a partially-rendered report.
 */
function assertReport(payload: unknown): InvestmentCoverageReport {
  const record = plain(payload) ? payload : null;
  const shapeOk =
    record !== null &&
    typeof record.counts === 'object' &&
    record.counts !== null &&
    Array.isArray(record.issuers) &&
    Array.isArray(record.sectors) &&
    typeof record.dataset === 'object' &&
    record.dataset !== null &&
    typeof record.statusLine === 'string' &&
    Array.isArray(record.notes) &&
    typeof record.identitySourcesAvailable === 'boolean';
  if (!shapeOk) throw new Error('investment coverage report shape not recognised');
  return payload as InvestmentCoverageReport;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim() === '') return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function fetchInvestmentCoverageInvestment(
  asOf?: string,
  fetcher: typeof fetch = fetch,
): Promise<InvestmentCoverageReport> {
  const query = asOf === undefined ? '' : `?asOf=${encodeURIComponent(asOf)}`;
  const response = await fetcher(`${INVESTMENT_COVERAGE_INVESTMENT_ROUTES.json}${query}`, {
    headers: { accept: 'application/json' },
    credentials: 'same-origin',
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    const record = (payload ?? {}) as {
      detail?: string;
      issues?: readonly { readonly code: string; readonly subject: string; readonly detail: string }[];
    };
    throw new InvestmentCoverageUnavailableError(
      record.detail ?? `investment coverage request failed with ${response.status}`,
      response.status,
      record.issues ?? [],
    );
  }
  return assertReport(payload);
}
