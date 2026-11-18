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
  /**
   * `S4-R3` — statement freshness for the issuer's assessed series, measured at the report clock.
   *
   * Optional in this projection because the page does not render it yet and older served reports predate it; the
   * server always sends it. `valuationBasis` is the period a valuation would rest on (the annual period) and
   * `latestReported` is the newest information the filer has published — two different facts, and `filedAt` is a
   * publication date, never a period end.
   */
  readonly freshness?: {
    readonly status: 'FRESH' | 'STALE' | 'UNKNOWN';
    readonly reasons: readonly string[];
    readonly valuationBasis: {
      readonly periodEnd: string;
      readonly periodType: 'ANNUAL' | 'QUARTER' | 'TTM';
      readonly filedAt: string;
      readonly daysSincePeriodEnd: number;
    } | null;
    readonly latestReported: {
      readonly periodEnd: string;
      readonly periodType: 'ANNUAL' | 'QUARTER' | 'TTM';
      readonly filedAt: string;
      readonly daysSincePeriodEnd: number;
    } | null;
    readonly windows: { readonly pnlDays: number; readonly balanceSheetDays: number };
    readonly policyVersion: string;
    readonly sequenceGapCount: number;
  };
  /**
   * `S4-R5` — HISTORICAL method availability versus LATEST-PERIOD qualification, for this issuer.
   *
   * Optional in this projection because older served reports predate it; the server always sends it. The three
   * lists answer different questions and must not be merged: `latestPeriodAvailable` qualifies at the newest
   * annual period, `earlierPeriodsOnly` is historically available but NOT latest-ready (the case the sector-level
   * `usableMethods` counter silently mixes in), and `neverAvailable` has no qualifying period at all. None of
   * them is a valuation statement.
   */
  readonly methodAvailability?: {
    readonly basis: 'SECTOR_METHODS' | 'NO_SECTOR_METHODS' | 'NO_ANNUAL_PERIODS';
    readonly latestPeriodEnd: string | null;
    readonly annualPeriodsConsidered: number;
    readonly primaryMethod: {
      readonly methodId: string;
      readonly historicallyAvailable: boolean;
      readonly availableAtLatestPeriod: boolean;
    } | null;
    readonly latestPeriodAvailable: readonly string[];
    readonly earlierPeriodsOnly: readonly string[];
    readonly neverAvailable: readonly string[];
  };
  readonly issueCodes: readonly string[];
  /**
   * `null` means "not evaluated" — the identity sources could not be loaded, so no binding could be
   * checked. It is never collapsed into `false`: "unknown" and "no dependency" are different.
   */
  readonly identityDependency: 'RESOLVED' | 'UNRESOLVED' | null;
  readonly identityDependencyDetail: string | null;
}

/**
 * One sector's measurement, as `GET /api/investment/coverage/investment` serves it.
 *
 * A PROJECTION of the server's `SectorMeasurement` (`iips-platform/src/investment/coverage/measure.ts`),
 * narrowed to the fields this surface renders. The per-method detail (`methods`, `usableMethods`,
 * `withheldMethods`) is served but is not consumed by the Investment Coverage page, so it is not
 * declared here.
 *
 * THE SECTOR'S ISSUER COUNT IS MEMBERSHIP, NOT A FIELD. The served contract carries no scalar
 * `issuerCount`: it carries `issuersConsidered`, the issuer ids the measurement considered for that
 * sector. A count is `issuersConsidered.length` and must be derived from it. Declaring an
 * `issuerCount` here — as this interface previously did — types a field the server never sends, so
 * the count rendered as `undefined` (an empty cell) on every sector row. The server's own HTML view
 * of the same report derives the count exactly this way (`investmentCoverageView.ts`).
 */
export interface InvestmentCoverageSectorRow {
  readonly sector: string;
  /** `G1_ENABLED` | `G2_PARTIAL` | `G3_WITHHELD` | `UNMEASURED`. */
  readonly stage: string;
  readonly measured: boolean;
  /** The issuer ids this sector's measurement considered — the authoritative membership list. */
  readonly issuersConsidered: readonly string[];
  readonly annualPeriodsConsidered: number;
  readonly statementCoveragePct: number;
  readonly operatingMetricCoveragePct: number;
}

export interface InvestmentCoverageReport {
  readonly reportVersion: 1;
  /**
   * `S4-R5` — which availability semantics the method states were measured under. Optional in this projection so a
   * report served before the field existed still types; the server always sends `EXISTENTIAL_ANNUAL_PERIOD`.
   */
  readonly availabilitySemantics?: 'EXISTENTIAL_ANNUAL_PERIOD';
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
    readonly datasetClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'UNKNOWN' | 'NONE';
    readonly sourceRights?: {
      readonly state: 'SYNTHETIC' | 'OPERATOR_ASSERTED' | 'UNKNOWN';
      readonly basis: string;
      readonly note: string;
      /**
       * `W05` — the operator's decision records the declaration cites. Absent for a dataset that cites none.
       * The server checks every reference against the record list and the manifest before it serves it; one
       * that does not check out is not served (the route answers 503). The three fixed members say what a
       * citation is: the operator's own declaration, no independent verification, no right to redistribute.
       */
      readonly authorizationReferences?: readonly {
        readonly decision: string;
        readonly decisionDate: string;
        readonly record: string;
        readonly recordSha256: string;
        readonly operativeText: string;
        readonly instrument: 'OPERATOR_DECLARATION';
        readonly independentSourceRightsVerification: 'NOT_CLAIMED';
        readonly redistribution: 'NOT_AUTHORISED';
        readonly restrictions: readonly string[];
        readonly inputDigests: readonly string[];
      }[];
    } | null;
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
    readonly datasetClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'UNKNOWN' | 'NONE';
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

const isStringList = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

/**
 * A sector row is only usable if it carries the authoritative membership list.
 *
 * This is the `G-11`-hardening precedent applied to a different contract: a row whose count source
 * is missing must fail loudly, not render an empty cell. The check is deliberately about
 * `issuersConsidered` and nothing else — a payload carrying a legacy scalar `issuerCount` instead is
 * exactly the shape that produced the blank counts, and it is refused.
 */
function isSectorRow(value: unknown): value is InvestmentCoverageSectorRow {
  return (
    plain(value) &&
    typeof value.sector === 'string' &&
    typeof value.stage === 'string' &&
    isStringList(value.issuersConsidered)
  );
}

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
  if (!(record.sectors as readonly unknown[]).every(isSectorRow)) {
    throw new Error('investment coverage sector rows do not carry issuersConsidered');
  }
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
