/**
 * IID-6 — read-only client for historical change intelligence (IID-5 transport).
 *
 * GET ONLY. `/changes` computes comparisons on read from stored versions; `/changes/boundaries` returns the stored
 * boundary reports and their coverage. Neither route can write, and neither does this module: the reconcile step
 * that fills a missing boundary is an OPERATOR CLI action (`reconcile-boundaries.ts`), and the UI represents it as
 * text an operator can act on — never as a button this surface could invoke.
 *
 * CLASSIFICATION IS RENDERED, NOT RE-DERIVED. `classification`, `materiality` and `direction` all come from the
 * server. The client does not decide which category a difference belongs to, because a UI that re-derives a
 * category can disagree with the report it is displaying.
 */
export const INVESTMENT_CHANGE_ROUTES = Object.freeze({
  changes: (issuerId: string, pair?: { readonly from?: string; readonly to?: string }): string => {
    const base = `/api/investment/company/${encodeURIComponent(issuerId)}/changes`;
    const query = new URLSearchParams();
    if (pair?.from !== undefined) query.set('from', pair.from);
    if (pair?.to !== undefined) query.set('to', pair.to);
    const text = query.toString();
    return text.length === 0 ? base : `${base}?${text}`;
  },
  boundaries: (issuerId: string): string => `/api/investment/company/${encodeURIComponent(issuerId)}/changes/boundaries`,
});

/* ------------------------------------------------------------------ value shapes */

export const CHANGE_CATEGORIES = Object.freeze([
  'FUNDAMENTAL',
  'MARKET_VALUATION',
  'RISK_QUALITY',
  'DISPOSITION',
  'PORTFOLIO',
  'DATA_CORRECTION_RESTATEMENT',
  'MODEL',
  'IDENTITY_MAPPING',
] as const);
export type ChangeCategory = (typeof CHANGE_CATEGORIES)[number];

export const MATERIALITY_LEVELS = Object.freeze(['IMMATERIAL', 'NOTABLE', 'MATERIAL', 'CRITICAL'] as const);
export type MaterialityLevel = (typeof MATERIALITY_LEVELS)[number];

export type ChangeDirection = 'IMPROVED' | 'WORSENED' | 'INDETERMINATE';
export type PairClassification = 'SUBSTANTIVE' | 'GENERATION_METADATA_ONLY' | 'FRESHNESS_TRANSITION';

export interface ChangeItemBaseView {
  readonly dimensionId: string;
  readonly path: string;
  readonly label: string;
  readonly category: ChangeCategory;
  readonly type: string;
  readonly materiality: MaterialityLevel;
  readonly direction: ChangeDirection;
}

export interface NumericChangeItemView extends ChangeItemBaseView {
  readonly kind: 'NUMERIC';
  readonly observed: {
    readonly from: number | null;
    readonly to: number | null;
    readonly absolute: number | null;
    readonly relativePct: number | null;
    readonly unit: string;
  };
}

export interface PresenceChangeItemView extends ChangeItemBaseView {
  readonly kind: 'PRESENCE';
  readonly from: string;
  readonly to: string;
  readonly note: string;
}

export interface CategoricalChangeItemView extends ChangeItemBaseView {
  readonly kind: 'CATEGORICAL';
  readonly from: string | null;
  readonly to: string | null;
  readonly equivalenceClass?: string;
}

export interface SetChangeItemView extends ChangeItemBaseView {
  readonly kind: 'SET';
  readonly added: readonly string[];
  readonly removed: readonly string[];
}

export type ChangeItemView =
  | NumericChangeItemView
  | PresenceChangeItemView
  | CategoricalChangeItemView
  | SetChangeItemView;

export interface VersionReferenceView {
  readonly reportId: string;
  readonly artifactVersion: number;
  readonly generatedAt: string;
  readonly payloadDigest: string;
  readonly substantiveDigest: string | null;
  readonly substantiveDigestSource: 'RECORDED' | 'DERIVED' | 'NOT_APPLICABLE';
  readonly substantiveIdentityGrammar: string | null;
  readonly modelVersion: string;
  readonly policyVersion: string;
  readonly datasetVersion: string;
  readonly contentDigest: string;
}

export interface AttributionView {
  readonly status: 'EXACT' | 'UNAVAILABLE' | 'NOT_APPLICABLE';
  readonly cause: 'DATA' | 'MODEL' | 'MIXED' | 'UNATTRIBUTED' | 'NONE';
  readonly additive: boolean;
  readonly reason: string | null;
  readonly legs: {
    readonly data: { readonly available: boolean; readonly requires: string; readonly reason: string | null };
    readonly model: { readonly available: boolean; readonly requires: string; readonly reason: string | null };
  };
  readonly reproducedFrom: { readonly from: string; readonly to: string };
}

export interface ReviewView {
  readonly required: boolean;
  readonly priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  readonly triggers: readonly { readonly triggerId: string; readonly fired: boolean; readonly reason: string }[];
  readonly suggestedFocus: readonly string[];
}

export interface MetadataChangeView {
  readonly member: string;
  readonly from: unknown;
  readonly to: unknown;
  readonly excluded: true;
}

export interface ComparisonView {
  readonly from: VersionReferenceView;
  readonly to: VersionReferenceView;
  readonly classification: PairClassification;
  readonly substantiveIdentityChanged: boolean;
  readonly payloadIdentityChanged: boolean;
  readonly summary: {
    readonly total: number;
    readonly byCategory: Readonly<Record<ChangeCategory, number>>;
    readonly byMateriality: Readonly<Record<MaterialityLevel, number>>;
    readonly highestMateriality: MaterialityLevel;
  };
  readonly changes: readonly ChangeItemView[];
  readonly metadata: readonly MetadataChangeView[];
  readonly attribution: AttributionView;
  readonly review: ReviewView;
  readonly reproduction: {
    readonly from: { readonly source: string };
    readonly to: { readonly source: string };
  };
  readonly persisted: false;
}

export interface ChangeEnvelope {
  readonly status: 'OK';
  readonly reportType: string;
  readonly subjectScope: string;
  readonly pairCount: number;
  readonly returned: number;
  readonly truncated: boolean;
  readonly comparisons: readonly ComparisonView[];
  readonly limitations: readonly string[];
}

export interface BoundaryCoverageView {
  readonly subjectScope: string;
  readonly reportType: string;
  readonly versionCount: number;
  readonly boundaryCount: number;
  readonly pairCount: number;
  readonly explainedPairs: readonly { readonly fromReportId: string; readonly toReportId: string }[];
  readonly unexplainedPairs: readonly { readonly fromReportId: string; readonly toReportId: string }[];
  readonly complete: boolean;
}

export interface BoundarySummaryView {
  readonly changeReportId: string;
  readonly artifactVersion: number;
  readonly kind: string;
  readonly classification: PairClassification;
  readonly fromReportId: string;
  readonly toReportId: string;
  readonly fromArtifactVersion: number;
  readonly toArtifactVersion: number;
  readonly highestMateriality: MaterialityLevel;
  readonly reviewRequired: boolean;
  readonly reviewPriority: string;
  readonly attributionStatus: string;
  readonly generatedAt: string;
  readonly payloadDigest: string;
}

export interface BoundariesEnvelope {
  readonly status: 'OK';
  readonly changeReportType: string;
  readonly subjectScope: string;
  readonly coverage: BoundaryCoverageView;
  readonly count: number;
  readonly boundaries: readonly BoundarySummaryView[];
  readonly limitations: readonly string[];
}

/* --------------------------------------------------------------------- failures */

export type ChangeUnavailableReason =
  | 'request-invalid'
  | 'no-history'
  | 'owner-context-unavailable'
  | 'persistence-unavailable'
  | 'integrity-failure'
  | 'unrecognised';

export const CHANGE_UNAVAILABLE_COPY: Readonly<Record<ChangeUnavailableReason, string>> = Object.freeze({
  'request-invalid': 'That issuer or version selector is not admissible, so no history was read.',
  'no-history': 'No stored assessment history exists for this issuer, so there is nothing to compare.',
  'owner-context-unavailable': 'Ownership is not established on this server, so no history can be read.',
  'persistence-unavailable': 'The governed persistence boundary is unavailable. Nothing was read or written.',
  'integrity-failure':
    'Stored history failed validation and was withheld. A partially validated timeline is never shown.',
  unrecognised: 'The change history could not be read because the response was not recognised.',
});

export class ChangeUnavailableError extends Error {
  constructor(
    readonly reason: ChangeUnavailableReason,
    readonly status: number,
  ) {
    super(CHANGE_UNAVAILABLE_COPY[reason]);
    this.name = 'ChangeUnavailableError';
  }
}

function reasonOf(status: number, payload: unknown): ChangeUnavailableReason {
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
  const code = typeof record.error === 'string' ? record.error : '';
  if (code === 'owner-context-unavailable') return 'owner-context-unavailable';
  if (code === 'investment-persistence-unavailable') return 'persistence-unavailable';
  if (code === 'change-integrity-failure') return 'integrity-failure';
  if (code === 'change-request-invalid') return 'request-invalid';
  if (code === 'change-not-found') return 'no-history';
  if (status === 400) return 'request-invalid';
  if (status === 404) return 'no-history';
  if (status === 503) return 'persistence-unavailable';
  return 'unrecognised';
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

async function readGet(url: string): Promise<Response> {
  return fetch(url, { method: 'GET', headers: { accept: 'application/json' }, credentials: 'same-origin' });
}

function assertChangeEnvelope(payload: unknown): ChangeEnvelope {
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : null;
  if (
    record === null ||
    record.status !== 'OK' ||
    !Array.isArray(record.comparisons) ||
    typeof record.pairCount !== 'number'
  ) {
    throw new ChangeUnavailableError('unrecognised', 200);
  }
  return payload as ChangeEnvelope;
}

/** Adjacent comparisons for one issuer (or one explicit forward pair). GET only. */
export async function fetchCompanyChanges(
  issuerId: string,
  pair?: { readonly from?: string; readonly to?: string },
): Promise<ChangeEnvelope> {
  const response = await readGet(INVESTMENT_CHANGE_ROUTES.changes(issuerId, pair));
  const payload = await readPayload(response);
  if (!response.ok) throw new ChangeUnavailableError(reasonOf(response.status, payload), response.status);
  return assertChangeEnvelope(payload);
}

/** Stored boundary reports and their coverage for one issuer. GET only. */
export async function fetchChangeBoundaries(issuerId: string): Promise<BoundariesEnvelope> {
  const response = await readGet(INVESTMENT_CHANGE_ROUTES.boundaries(issuerId));
  const payload = await readPayload(response);
  if (!response.ok) throw new ChangeUnavailableError(reasonOf(response.status, payload), response.status);
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : null;
  if (
    record === null ||
    record.status !== 'OK' ||
    typeof record.coverage !== 'object' ||
    record.coverage === null ||
    !Array.isArray(record.boundaries)
  ) {
    throw new ChangeUnavailableError('unrecognised', 200);
  }
  return payload as BoundariesEnvelope;
}
