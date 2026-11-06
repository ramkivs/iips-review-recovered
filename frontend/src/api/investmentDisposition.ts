/**
 * IID-6 — read-only client for the disposition read model (IID-4 transport).
 *
 * GET ONLY. Every route below is a GET on the existing IID-4 transport; there is no record, no recompute, no
 * generate and no "refresh disposition" call anywhere in this module, because the server exposes none. A
 * disposition is produced by the operator CLI against a stored assessment; the browser reads what was produced.
 *
 * ABSENT IS NOT EMPTY. A disposition that was never recorded, a chain that cannot be read and a withheld verb are
 * three different facts, and each is carried as its own reason so the view can say which one happened.
 *
 * FAILURE VOCABULARY IS CLOSED. The server sends fixed sanitized bodies; they are mapped onto local reasons and
 * rendered as fixed copy. No server prose reaches the DOM.
 */
export const INVESTMENT_DISPOSITION_ROUTES = Object.freeze({
  portfolio: (portfolioId: string): string =>
    `/api/investment/portfolio/${encodeURIComponent(portfolioId)}/dispositions`,
  holding: (portfolioId: string, securityId: string): string =>
    `/api/investment/portfolio/${encodeURIComponent(portfolioId)}/holding/${encodeURIComponent(securityId)}`,
  candidate: (securityId: string, contextPortfolioId?: string): string =>
    `/api/investment/candidate/${encodeURIComponent(securityId)}${
      contextPortfolioId === undefined ? '' : `?portfolio=${encodeURIComponent(contextPortfolioId)}`
    }`,
});

/* ------------------------------------------------------------------ value shapes */

export type DispositionSubjectKind = 'HELD' | 'CANDIDATE';

/** The same observation shape the assessment read model uses: a value is never absent by being zero. */
export interface ObservedNumber {
  readonly value: number | null;
  readonly presence: string;
  readonly reason?: string;
  readonly note?: string;
  readonly source?: { readonly kind: string; readonly ref: string };
}

export interface DispositionSubjectView {
  readonly kind: DispositionSubjectKind;
  readonly portfolioId?: string;
  readonly positionKey?: string;
  readonly contextPortfolioId?: string;
  readonly origin?: string;
  readonly securityId: string;
  readonly issuerId: string;
  readonly symbol: string;
  readonly exchange: string;
  readonly securityClass: string;
  readonly identityState: string;
  readonly securityState: string;
  readonly heldAsOf?: string;
  /** `NOT_APPLICABLE` for a candidate: it has no position, and that is a fact, not a zero. */
  readonly quantities: 'NOT_APPLICABLE' | Readonly<Record<string, ObservedNumber>>;
}

export interface DispositionView {
  readonly verb: string | null;
  readonly confidence: number | null;
  readonly horizon: string;
  readonly adequacy: string;
  readonly withheld: { readonly reasons: readonly string[]; readonly unmetInputs: readonly string[] } | null;
  readonly gates: readonly { readonly gateId: string; readonly outcome: string; readonly detail: string }[];
  readonly capsApplied: readonly { readonly capId: string; readonly detail?: string }[];
  readonly policyVersion: string;
  readonly definitionApplied: string;
}

export interface RationaleEntryView {
  readonly rationaleId: string;
  readonly claim: string;
  readonly direction: 'SUPPORTS' | 'COUNTERS' | 'NEUTRAL';
  readonly category: string;
  readonly weight: number;
  readonly evidenceIds: readonly string[];
  readonly observationRefs: readonly string[];
}

export interface FalsifierView {
  readonly statement: string;
  readonly trigger: string;
  readonly observation: string;
}

export interface LimitsInForceView {
  readonly policyVersion: string;
  readonly basis: string;
  readonly effectiveFrom: string;
  readonly singleNameMaxPct: number;
  readonly defaultSectorMaxPct: number;
  readonly digest: string;
  readonly applied: readonly {
    readonly limitId: string;
    readonly scope: string;
    readonly capPct: number;
    readonly basis: string;
    readonly measuredPct: number | null;
    readonly projectedPct: number | null;
    readonly breached: boolean;
  }[];
  readonly notes: readonly string[];
}

export interface PortfolioImplicationView {
  readonly kind: string;
  readonly currentWeightPct: ObservedNumber;
  readonly impliedTargetWeightBand: { readonly lowPct: number; readonly highPct: number } | null;
  readonly bandBasis: string;
  readonly projectedSectorExposurePct: ObservedNumber;
  readonly projectedSingleNamePct: ObservedNumber;
  readonly projectedTopHoldingPct: ObservedNumber;
  readonly deltaNotes: readonly string[];
}

export interface PortfolioContextBlockView {
  readonly portfolioRevision: number;
  readonly asOf: string;
  readonly holdingsMeasured: number;
  readonly holdingsUnresolved: number;
  readonly holdingsOutOfScope: number;
  readonly measuredWeightPct: number;
  readonly unmeasuredWeightPct: ObservedNumber;
  readonly weightPct: ObservedNumber;
  readonly companyExposurePct: ObservedNumber;
  readonly sectorExposurePct: ObservedNumber;
  readonly concentrationBand: ObservedNumber;
}

export interface DispositionPayloadView {
  readonly schemaVersion: number;
  readonly artifact: {
    readonly kind: string;
    readonly subjectScope: string;
    readonly modelVersion: string;
    readonly policyVersion: string;
    readonly generatedAt: string;
  };
  readonly subject: DispositionSubjectView;
  readonly companyAssessmentRef: {
    readonly reportId: string;
    readonly reportKey: string;
    readonly artifactVersion: number;
    readonly generatedAt: string;
    readonly adequacy: string;
    readonly qualityVerdict: string;
    readonly dataAsOf: string;
    readonly knownAsOf: string;
    readonly modelVersion: string;
  };
  readonly portfolioContext: PortfolioContextBlockView | null;
  readonly disposition: DispositionView;
  readonly interpretation: {
    readonly nature: string;
    readonly notAnInstruction: string;
    readonly noExecutionPath: boolean;
  };
  readonly limits: LimitsInForceView;
  readonly rationale: readonly RationaleEntryView[];
  readonly falsifiers: readonly FalsifierView[];
  readonly portfolioImplication: PortfolioImplicationView;
  readonly review: {
    readonly nextReviewOn: string | null;
    readonly triggers: readonly {
      readonly triggerId: string;
      readonly condition: string;
      readonly armed: boolean;
    }[];
  };
  readonly evidence: readonly {
    readonly evidenceId: string;
    readonly claim: string;
    readonly source: { readonly kind: string; readonly ref: string };
  }[];
  readonly limitations: readonly string[];
  readonly disclosure: {
    readonly decisionSupportOnly: boolean;
    readonly noTradeExecution: boolean;
    readonly nonProduction: boolean;
    readonly notAnInstruction: string;
  };
}

export interface DispositionEnvelope {
  readonly status: 'OK';
  readonly reportType: string;
  readonly scope: {
    readonly scopeToken: string;
    readonly reportKey: string;
    readonly chainRootReportId: string;
    readonly versionCount: number;
  };
  readonly version: DispositionVersionView;
  readonly versions: readonly DispositionVersionView[];
  readonly disposition: DispositionPayloadView;
  readonly disclosures: Readonly<Record<string, unknown>>;
  readonly limitations: readonly string[];
}

export interface DispositionVersionView {
  readonly reportId: string;
  readonly artifactVersion: number;
  readonly generatedAt: string;
  readonly reportKey: string;
  readonly payloadDigest: string;
  readonly inputDigest: string;
  readonly substantiveDigest?: string | null;
  readonly substantiveInputDigest?: string | null;
  readonly modelVersion: string;
  readonly policyVersion: string;
  readonly dataAsOf: string;
  readonly knownAsOf: string;
  readonly datasetVersion: string;
  readonly adequacy: string;
  readonly confidence: number | null;
}

/** One row of the portfolio disposition list. Facts only; no verb is inferred from a missing one. */
export interface PortfolioDispositionEntry {
  readonly portfolioId: string;
  readonly securityId: string;
  readonly scopeToken: string;
  readonly reportKey: string;
  readonly chainRootReportId: string;
  readonly versionCount: number;
  readonly headReportId: string;
  readonly artifactVersion: number;
  readonly generatedAt: string;
  readonly verb: string | null;
  readonly confidence: number | null;
  readonly horizon: string | null;
  readonly withheld: boolean | null;
  readonly issuerId: string | null;
}

export interface PortfolioDispositionList {
  readonly status: 'OK';
  readonly portfolioId: string;
  readonly count: number;
  readonly dispositions: readonly PortfolioDispositionEntry[];
  readonly limitations: readonly string[];
}

/* --------------------------------------------------------------------- failures */

export type DispositionUnavailableReason =
  | 'request-invalid'
  | 'not-recorded'
  | 'owner-context-unavailable'
  | 'persistence-unavailable'
  | 'integrity-failure'
  | 'unrecognised';

export const DISPOSITION_UNAVAILABLE_COPY: Readonly<Record<DispositionUnavailableReason, string>> = Object.freeze({
  'request-invalid': 'That portfolio or security identifier is not admissible, so nothing was read.',
  'not-recorded': 'No stored disposition exists for this holding or candidate. Dispositions are produced by the operator CLI.',
  'owner-context-unavailable': 'Ownership is not established on this server, so no disposition can be read.',
  'persistence-unavailable': 'The governed persistence boundary is unavailable. Nothing was read or written.',
  'integrity-failure':
    'Stored disposition artifacts failed validation and were withheld. A partially validated disposition is never shown.',
  unrecognised: 'The disposition could not be read because the response was not recognised.',
});

export class DispositionUnavailableError extends Error {
  constructor(
    readonly reason: DispositionUnavailableReason,
    readonly status: number,
  ) {
    super(DISPOSITION_UNAVAILABLE_COPY[reason]);
    this.name = 'DispositionUnavailableError';
  }
}

function reasonOf(status: number, payload: unknown): DispositionUnavailableReason {
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
  const code = typeof record.error === 'string' ? record.error : '';
  if (code === 'owner-context-unavailable') return 'owner-context-unavailable';
  if (code === 'investment-persistence-unavailable') return 'persistence-unavailable';
  if (code === 'disposition-integrity-failure') return 'integrity-failure';
  if (code === 'disposition-request-invalid') return 'request-invalid';
  if (code === 'disposition-not-found') return 'not-recorded';
  if (status === 400) return 'request-invalid';
  if (status === 404) return 'not-recorded';
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

/**
 * An envelope is only usable when it carries the sections the panel renders. A disposition without its subject,
 * its disposition block or its implication is refused rather than partially rendered: a hole in this panel is
 * indistinguishable from an honestly withheld value, and those must not look the same.
 */
function assertEnvelope(payload: unknown): DispositionEnvelope {
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : null;
  const disposition = record?.disposition as Record<string, unknown> | undefined;
  const subject = disposition?.subject as Record<string, unknown> | undefined;
  const block = disposition?.disposition as Record<string, unknown> | undefined;
  const shapeOk =
    record !== null &&
    record.status === 'OK' &&
    typeof record.scope === 'object' &&
    record.scope !== null &&
    typeof record.version === 'object' &&
    record.version !== null &&
    Array.isArray(record.versions) &&
    typeof disposition === 'object' &&
    disposition !== null &&
    typeof subject === 'object' &&
    subject !== null &&
    typeof block === 'object' &&
    block !== null &&
    typeof disposition.portfolioImplication === 'object' &&
    disposition.portfolioImplication !== null &&
    typeof disposition.limits === 'object' &&
    disposition.limits !== null;
  if (!shapeOk) throw new DispositionUnavailableError('unrecognised', 200);
  return payload as DispositionEnvelope;
}

async function readGet(url: string): Promise<Response> {
  return fetch(url, { method: 'GET', headers: { accept: 'application/json' }, credentials: 'same-origin' });
}

/** One held position's disposition chain (GET only). */
export async function fetchHeldDisposition(portfolioId: string, securityId: string): Promise<DispositionEnvelope> {
  const response = await readGet(INVESTMENT_DISPOSITION_ROUTES.holding(portfolioId, securityId));
  const payload = await readPayload(response);
  if (!response.ok) throw new DispositionUnavailableError(reasonOf(response.status, payload), response.status);
  return assertEnvelope(payload);
}

/** One candidate's disposition chain (GET only). Reachable without a portfolio; the context portfolio is optional. */
export async function fetchCandidateDisposition(
  securityId: string,
  contextPortfolioId?: string,
): Promise<DispositionEnvelope> {
  const response = await readGet(INVESTMENT_DISPOSITION_ROUTES.candidate(securityId, contextPortfolioId));
  const payload = await readPayload(response);
  if (!response.ok) throw new DispositionUnavailableError(reasonOf(response.status, payload), response.status);
  return assertEnvelope(payload);
}

/**
 * Every disposition recorded in one portfolio (GET only).
 *
 * An empty list is a FACT ("nothing has been recorded") and is returned as such; a failed read raises, because
 * "no dispositions" and "could not ask" must not render the same way on a portfolio page.
 */
export async function fetchPortfolioDispositions(portfolioId: string): Promise<PortfolioDispositionList> {
  const response = await readGet(INVESTMENT_DISPOSITION_ROUTES.portfolio(portfolioId));
  const payload = await readPayload(response);
  if (!response.ok) throw new DispositionUnavailableError(reasonOf(response.status, payload), response.status);
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : null;
  if (
    record === null ||
    record.status !== 'OK' ||
    !Array.isArray(record.dispositions) ||
    typeof record.count !== 'number'
  ) {
    throw new DispositionUnavailableError('unrecognised', 200);
  }
  return payload as PortfolioDispositionList;
}
