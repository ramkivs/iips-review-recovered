/**
 * IID-1 — typed client for the read-only investment identity coverage endpoint.
 *
 * The types mirror the IRR report shape. They are declared here rather than imported so the browser
 * bundle carries no server code; the report itself is the single source of truth and any shape change is
 * a deliberate edit on both sides.
 */
export const INVESTMENT_COVERAGE_ROUTES = Object.freeze({
  json: '/api/investment/coverage',
  preview: '/api/investment/coverage/preview',
});

export type ResolutionState =
  | 'RESOLVED'
  | 'AMBIGUOUS'
  | 'UNMATCHED'
  | 'INELIGIBLE'
  | 'OUT_OF_SCOPE_SECURITY'
  | 'STALE_REFERENCE'
  | 'REJECTED_MALFORMED_ISIN'
  | 'ISSUER_KEY_CONFLICT'
  | 'AMBIGUOUS_LISTING';

export interface CoverageItemView {
  readonly observationId: string;
  readonly source: 'HOLDING' | 'BROKER_PREVIEW' | 'WATCHLIST';
  readonly portfolioId: string | null;
  readonly state: ResolutionState;
  readonly outcomeClass?: 'RESOLVED' | 'UNRESOLVED' | 'REJECTED';
  readonly reason: string | null;
  readonly reasonText: string | null;
  readonly detail: string | null;
  readonly candidates: readonly string[];
  readonly displayName: string | null;
  readonly upstreamStatus: string | null;
  readonly raw: Readonly<Record<string, string | number | boolean | null>>;
  readonly binding: {
    readonly bindingId: string;
    readonly issuerId: string | null;
    readonly securityId: string | null;
    readonly listingId: string | null;
    readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null;
    readonly effectiveFrom: string | null;
    readonly effectiveTo: string | null;
    readonly assessable: boolean;
  };
}

export interface SourceCountsView {
  readonly observed: number;
  readonly resolved: number;
  readonly unresolved: number;
  readonly assessable: number;
}

export interface SuccessorReconciliationView {
  readonly actionId: string;
  readonly type: string;
  readonly effectiveDate: string;
  readonly slices: readonly { readonly issuerId: string | null; readonly ratio: number; readonly mapped: boolean }[];
  readonly measuredWeight: number;
  readonly unmeasuredWeight: number;
  readonly reconciles: boolean;
}

export interface FinancialCoverageView {
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
}

export interface InvestmentCoverageReport {
  readonly reportVersion: 1;
  readonly asOf: string;
  readonly generatedAt: string;
  readonly counts: Readonly<Record<string, number>>;
  readonly bySource: Readonly<Record<'HOLDING' | 'BROKER_PREVIEW' | 'WATCHLIST', SourceCountsView>>;
  readonly items: readonly CoverageItemView[];
  readonly unresolved: readonly CoverageItemView[];
  readonly successorReconciliations: readonly SuccessorReconciliationView[];
  readonly financialCoverage: FinancialCoverageView;
  readonly statusLine: string;
  readonly notes: readonly string[];
  readonly identitySources: {
    readonly rosterVersion: string;
    readonly listingMapVersion: string;
    readonly corporateActionTableVersion: string;
    readonly rosterLabel: string;
    readonly rosterDataClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED';
    readonly issuerCount?: number;
    readonly securityCount?: number;
    readonly listingCount?: number;
    readonly corporateActionCount?: number;
    readonly corporateActionsEmpty?: boolean;
  };
}

export interface IdentitySourceIssue {
  readonly file: string;
  readonly code: string;
  readonly subject: string;
  readonly detail: string;
}

/** Fail-closed answer from the endpoint: no roster ⇒ no classification. */
export class CoverageUnavailableError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly issues: readonly IdentitySourceIssue[],
  ) {
    super(message);
    this.name = 'CoverageUnavailableError';
  }
}

/**
 * A report is only usable if it carries the sections the view needs. An unrecognised payload is an
 * error, never a partially-rendered report: a coverage page that silently drops a section would be
 * reporting a total it did not receive.
 */
function assertReport(payload: unknown): InvestmentCoverageReport {
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : null;
  const shapeOk =
    record !== null &&
    typeof record.counts === 'object' &&
    record.counts !== null &&
    typeof record.bySource === 'object' &&
    record.bySource !== null &&
    Array.isArray(record.items) &&
    Array.isArray(record.unresolved) &&
    typeof record.financialCoverage === 'object' &&
    record.financialCoverage !== null &&
    typeof record.statusLine === 'string' &&
    Array.isArray(record.notes);
  if (!shapeOk) throw new Error('coverage report shape not recognised');
  /*
   * IID-6 CORRECTION. This line was `return assertReport(payload)`, which recursed on every valid payload and blew
   * the stack: the coverage surface could therefore never render a report it had received, and the failure looked
   * like a client error rather than a defect. It was found while extending the page (the page had no test that fed it
   * a valid report), and the fix is the obvious one — validate, then return the payload. Nothing about the shape
   * gate changed.
   */
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

export async function fetchInvestmentCoverage(asOf?: string): Promise<InvestmentCoverageReport> {
  const query = asOf === undefined ? '' : `?asOf=${encodeURIComponent(asOf)}`;
  const response = await fetch(`${INVESTMENT_COVERAGE_ROUTES.json}${query}`, {
    headers: { accept: 'application/json' },
    credentials: 'same-origin',
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    const record = (payload ?? {}) as { detail?: string; issues?: readonly IdentitySourceIssue[] };
    throw new CoverageUnavailableError(
      record.detail ?? `coverage request failed with ${response.status}`,
      response.status,
      record.issues ?? [],
    );
  }
  /*
   * IID-6 CORRECTION. `assertReport` existed but was never called on the main read path, so a malformed body was
   * cast into `InvestmentCoverageReport` unchecked. It is now applied, which is what the doc comment above always
   * claimed happened.
   */
  return assertReport(payload);
}

export interface PreviewRowPayload {
  readonly symbol: string;
  readonly isin: string | null;
  readonly exchange: string | null;
  readonly quantity?: number;
  readonly identityStatus?: string;
}

/** Evaluate broker-preview rows. Read-only: the endpoint stores nothing and echoes no canonical identity. */
export async function evaluateBrokerPreview(
  broker: string,
  holdings: readonly PreviewRowPayload[],
  asOf?: string,
): Promise<InvestmentCoverageReport> {
  const query = asOf === undefined ? '' : `?asOf=${encodeURIComponent(asOf)}`;
  const response = await fetch(`${INVESTMENT_COVERAGE_ROUTES.preview}${query}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ broker, holdings }),
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    const record = (payload ?? {}) as { detail?: string; issues?: readonly IdentitySourceIssue[] };
    throw new CoverageUnavailableError(
      record.detail ?? `preview evaluation failed with ${response.status}`,
      response.status,
      record.issues ?? [],
    );
  }
  const envelope = (payload ?? {}) as { report?: unknown };
  return assertReport(envelope.report);
}
