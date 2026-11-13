/**
 * W11 acceptance dependency 1 — owner-bound persisted-portfolio capture (core).
 *
 * WHAT THIS IS
 *   The executable form of the operator read sequence for W11 acceptance dependency 1:
 *   a READ-ONLY capture of the actual owner-bound persisted portfolio from an
 *   ALREADY-RUNNING IPD service, taken through the EXISTING IRR IPC consumer path
 *   (`IpcUserPortfolioPort` over `callIpc`). Nothing here is a new protocol, a new
 *   framing, a new endpoint rule or a second persistence path.
 *
 * HOW THE EXISTING CONSUMER IS USED
 *   - Requests are built by `IpcUserPortfolioPort.listPortfolios / getPortfolio /
 *     revisionHistory` — the same adapter methods the IRR transport uses. This module
 *     constructs no request payload and no frame.
 *   - The adapter's fail-closed owner-context precondition, its scope-never-transmitted
 *     assertions and its v1 result validation all run unchanged.
 *   - The adapter's `transport` seam is given a thin RECORDING wrapper whose default
 *     inner call is exactly the adapter's own default: `callIpc(op, payload, { target:
 *     resolveIpcEndpoint(env) })`. The wrapper adds two things only: it refuses any
 *     operation outside `IPC_READ_OPERATIONS` before any I/O, and it keeps the raw
 *     `IpcCallResult` so the outcome classes the adapter collapses into one `G2Error`
 *     (Class P, Class A, timeout, transport fault) stay distinguishable.
 *   - The per-call timeout is the consumer's own fixed `IPC_TIMEOUT_MS`. `callIpc` never
 *     retries, and neither does this module within an attempt.
 *
 * THE SEQUENCE (one attempt)
 *   1. consumer UTC timestamp before the first read
 *   2. `portfolio.list` — the portfolio is identified from the ACTUAL response
 *   3. `portfolio.get`
 *   4. `portfolio.revisions`
 *   5. `portfolio.get` again
 *   6. consumer UTC timestamp after the final read
 *
 * WHAT IS ACCEPTED
 *   Only an attempt in which both gets name the same portfolio, the same revision and
 *   the same `provenanceDigest`; exactly one history entry carries that revision and the
 *   same `provenanceDigest`; that entry's `holdingsCount` equals the holdings array
 *   length; and the holdings, their identity fields and the whole detail are identical
 *   across both gets. Anything else is DISCARDED WHOLE and the full sequence is repeated,
 *   a bounded number of times. Reads from different attempts are never combined.
 *
 * WHAT THIS IS NOT
 *   - Not atomicity. Four sequential reads that agree are read CONSISTENCY across the
 *     observation window, not a cross-service transaction.
 *   - Not an IPD persistence timestamp. Every `...AtUtc` value produced here is read
 *     from the CONSUMER host clock. IPD's own stored instants (`lastUpdated`,
 *     `committedAt`) are carried verbatim and labelled as IPD-reported.
 *   - Not a binding identification. IPD resolves its owner binding server-side on every
 *     request and discloses nothing about it; the response does not identify a binding,
 *     and this module claims none. `G2PortfolioView` is an IRR-side mirror, not an IPD
 *     wire type; the wire result is `PortfolioDetail` or `LocalPortfolioDetail`.
 *   - Not an identity resolver. Holding identity is reported only from the actual
 *     `securityIdentity` object on each holding. Nothing is derived from a symbol.
 *   - Not a service controller. It never starts, stops, configures or migrates IPD,
 *     opens no database, and sends no write operation.
 *
 * DATA PROTECTION
 *   `buildExactCaptureDocument` produces the LOCAL-ONLY exact capture (portfolio
 *   contents). `buildSanitizedSummary` produces the publishable summary: counts,
 *   consistency results, timestamps, protocol/build metadata and the outcome — never a
 *   portfolio id, a name, a symbol, an identifier, a digest value or an amount. Progress
 *   lines are drawn from a fixed vocabulary and carry no portfolio content.
 */
import { createHash, randomUUID } from 'node:crypto';

import {
  callIpc,
  IPC_ENDPOINT_SETTING,
  IPC_PROTOCOL_VERSION,
  IPC_READ_OPERATIONS,
  IPC_RESPONSE_MAX_BYTES,
  IPC_STATE_DIR_SETTING,
  IPC_TIMEOUT_MS,
  IpcClientError,
  isWriteOperation,
  resolveIpcEndpoint,
  type IpcCallResult,
  type IpcEndpointTarget,
  type IpcOperation,
} from '../ipcClient.js';
import { IpcUserPortfolioPort } from '../ipcPortAdapter.js';
import {
  BINDING_PRECONDITION_SETTING,
  isOwnerContextEstablished,
  ownerContextFromBinding,
  readBindingPrecondition,
} from '../ownerContextFromBinding.js';
import {
  G2Error,
  type G2PortfolioSummary,
  type G2PortfolioView,
  type G2RevisionEntry,
} from '../userPortfolioContract.js';

/* ------------------------------------------------------------------ *
 * Vocabulary
 * ------------------------------------------------------------------ */

export const EXACT_CAPTURE_SCHEMA = 'iips.w11-dep1.owner-bound-portfolio-capture.exact/v1';
export const SANITIZED_SUMMARY_SCHEMA = 'iips.w11-dep1.owner-bound-portfolio-capture.summary/v1';

/** The fixed order of IPC operations in one attempt. */
export const CAPTURE_REQUEST_SEQUENCE: readonly IpcOperation[] = Object.freeze([
  'portfolio.list',
  'portfolio.get',
  'portfolio.revisions',
  'portfolio.get',
] as const);

export const DEFAULT_MAX_ATTEMPTS = 3;
export const MAX_ATTEMPTS_LIMIT = 5;
export const DEFAULT_RETRY_DELAY_MS = 500;
export const RETRY_DELAY_LIMIT_MS = 10_000;

/**
 * Identifier prefix used ONLY by the repository's synthetic test peer. A capture whose
 * portfolio carries it came from a test fixture and is never evidence.
 */
export const SYNTHETIC_FIXTURE_PORTFOLIO_PREFIX = 'SYNTHETIC-W11-DEP1-FIXTURE';

export type CaptureOutcome =
  /** All gating checks passed in one attempt. */
  | 'CONSISTENT_CAPTURE'
  /** Local configuration is invalid; no IPC call was made. */
  | 'CONFIGURATION_INVALID'
  /** Timeout or transport fault on the existing IPC client. */
  | 'IPC_CONNECTION_FAILURE'
  /** Zero-byte close from IPD (Class P), or the IRR-local binding precondition refused. */
  | 'BINDING_OR_AUTHORIZATION_REFUSAL'
  /** The portfolio could not be identified from the actual list response. */
  | 'AMBIGUOUS_OR_MISSING_PORTFOLIO'
  /** Every bounded attempt failed a consistency check; nothing was kept. */
  | 'INCONSISTENT_READ'
  /** A typed refusal, or a response the existing consumer does not admit. */
  | 'PROTOCOL_CAPABILITY_UNAVAILABLE'
  /** A defect in this utility. Never a capture. */
  | 'INTERNAL_ERROR';

/** Process exit code per outcome. Only `CONSISTENT_CAPTURE` is zero. */
export const CAPTURE_EXIT_CODES: Readonly<Record<CaptureOutcome | 'OUTPUT_WRITE_FAILURE', number>> =
  Object.freeze({
    CONSISTENT_CAPTURE: 0,
    CONFIGURATION_INVALID: 2,
    IPC_CONNECTION_FAILURE: 10,
    BINDING_OR_AUTHORIZATION_REFUSAL: 11,
    AMBIGUOUS_OR_MISSING_PORTFOLIO: 12,
    INCONSISTENT_READ: 13,
    PROTOCOL_CAPABILITY_UNAVAILABLE: 14,
    OUTPUT_WRITE_FAILURE: 15,
    INTERNAL_ERROR: 70,
  });

export type CaptureTransport = (
  op: IpcOperation,
  payload: Record<string, unknown> | undefined,
) => Promise<IpcCallResult>;

/* ------------------------------------------------------------------ *
 * Configuration validation (before any connection)
 * ------------------------------------------------------------------ */

export interface ConfigurationProblem {
  readonly setting: string;
  readonly code:
    | 'BINDING_PRECONDITION_NOT_AFFIRMED'
    | 'ENDPOINT_NOT_CONFIGURED'
    | 'ENDPOINT_NOT_A_WINDOWS_NAMED_PIPE';
  /** Operator-facing text. Carries setting NAMES only, never a value. */
  readonly message: string;
}

export interface ConfigurationAssessment {
  readonly ok: boolean;
  readonly problems: readonly ConfigurationProblem[];
  /** Kind and source only. The path itself is never reported. */
  readonly endpoint: { readonly kind: IpcEndpointTarget['kind']; readonly source: IpcEndpointTarget['source'] } | null;
}

/**
 * Validates the IRR server-owned configuration with the consumer's OWN rules
 * (`readBindingPrecondition`, `resolveIpcEndpoint`). Pure: opens nothing, connects to
 * nothing, changes nothing. It sets no value on the operator's behalf — an unset
 * binding precondition is reported, never supplied.
 */
export function validateCaptureConfiguration(
  env: NodeJS.ProcessEnv,
  platform: NodeJS.Platform = process.platform,
): ConfigurationAssessment {
  const problems: ConfigurationProblem[] = [];

  const context = ownerContextFromBinding(readBindingPrecondition(env), env);
  if (!isOwnerContextEstablished(context)) {
    problems.push({
      setting: BINDING_PRECONDITION_SETTING,
      code: 'BINDING_PRECONDITION_NOT_AFFIRMED',
      message:
        `${BINDING_PRECONDITION_SETTING} is not affirmatively set (true, 1 or yes). It is the IRR-local ` +
        'record that the operator provisioned the IPD owner binding. This utility never sets it: use the ' +
        'same server-owned configuration the IRR transport runs with.',
    });
  }

  let endpoint: ConfigurationAssessment['endpoint'] = null;
  try {
    const target = resolveIpcEndpoint(env, platform);
    endpoint = { kind: target.kind, source: target.source };
    if (platform === 'win32' && target.kind !== 'windows-named-pipe') {
      problems.push({
        setting: IPC_ENDPOINT_SETTING,
        code: 'ENDPOINT_NOT_A_WINDOWS_NAMED_PIPE',
        message: `${IPC_ENDPOINT_SETTING} did not resolve to a Windows named pipe.`,
      });
    }
  } catch (error) {
    const detail = error instanceof IpcClientError ? error.message : 'the endpoint could not be resolved';
    problems.push({
      setting: IPC_ENDPOINT_SETTING,
      code: 'ENDPOINT_NOT_CONFIGURED',
      message:
        `${IPC_ENDPOINT_SETTING} is not usable: ${detail}. On Windows it must be \\\\.\\pipe\\<name>, or a bare ` +
        `name together with an absolute ${IPC_STATE_DIR_SETTING}.`,
    });
  }

  return { ok: problems.length === 0, problems, endpoint };
}

/* ------------------------------------------------------------------ *
 * Recording, read-only transport over the existing client
 * ------------------------------------------------------------------ */

/** Thrown before any I/O when anything other than an admitted read is attempted. */
export class CaptureReadOnlyViolation extends Error {
  constructor(readonly op: string) {
    super(`the capture utility is read-only and refused to send ${op}`);
    this.name = 'CaptureReadOnlyViolation';
  }
}

export interface RecordedCall {
  readonly sequence: number;
  readonly op: IpcOperation;
  /** The payload the EXISTING adapter built. `null` when the operation has none. */
  readonly requestPayload: Record<string, unknown> | null;
  /** Consumer host clock, UTC. Not an IPD timestamp. */
  readonly requestedAtUtc: string;
  /** Consumer host clock, UTC. Not an IPD timestamp. */
  readonly respondedAtUtc: string;
  readonly result: IpcCallResult | null;
  readonly thrown: unknown;
}

export interface RecordingTransport {
  readonly transport: CaptureTransport;
  readonly calls: RecordedCall[];
}

/**
 * Wraps a transport so that (a) nothing but `portfolio.list`, `portfolio.get` and
 * `portfolio.revisions` can be sent, and (b) the raw result of each call is retained.
 */
export function createRecordingReadOnlyTransport(inner: CaptureTransport, now: () => Date): RecordingTransport {
  const calls: RecordedCall[] = [];
  const transport: CaptureTransport = async (op, payload) => {
    if (isWriteOperation(op) || !IPC_READ_OPERATIONS.includes(op)) {
      throw new CaptureReadOnlyViolation(String(op));
    }
    const requestedAtUtc = now().toISOString();
    const base = { sequence: calls.length + 1, op, requestPayload: payload ?? null, requestedAtUtc };
    try {
      const result = await inner(op, payload);
      calls.push({ ...base, respondedAtUtc: now().toISOString(), result, thrown: undefined });
      return result;
    } catch (error) {
      calls.push({ ...base, respondedAtUtc: now().toISOString(), result: null, thrown: error });
      throw error;
    }
  };
  return { transport, calls };
}

/**
 * The production inner transport: the existing client, with the endpoint resolved from
 * the server-owned environment per call — the same expression `IpcUserPortfolioPort`
 * uses when no transport is injected.
 */
export function existingIpcClientTransport(env: NodeJS.ProcessEnv): CaptureTransport {
  return (op, payload) => callIpc(op, payload, { target: resolveIpcEndpoint(env) });
}

/* ------------------------------------------------------------------ *
 * Canonical comparison helpers
 * ------------------------------------------------------------------ */

/** Deterministic JSON: object keys sorted at every depth; arrays keep their order. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).filter((key) => record[key] !== undefined).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

function sortedCanonical(items: readonly unknown[]): string[] {
  return items.map((item) => canonicalJson(item)).sort();
}

function sameMultiset(left: readonly unknown[], right: readonly unknown[]): boolean {
  if (left.length !== right.length) return false;
  const a = sortedCanonical(left);
  const b = sortedCanonical(right);
  return a.every((entry, index) => entry === b[index]);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

/** The identity-bearing fields of one wire holding, taken verbatim. Nothing is derived. */
function identityProjection(holding: unknown): unknown {
  const record = asRecord(holding);
  if (record === null) return { nonObjectHolding: true };
  return {
    symbol: record.symbol,
    companyId: record.companyId,
    identityStatus: record.identityStatus,
    resolutionDisposition: record.resolutionDisposition,
    lineageDigest: record.lineageDigest,
    securityIdentityPresent: hasOwn(record, 'securityIdentity'),
    securityIdentity: record.securityIdentity ?? null,
  };
}

/** The detail with its holdings put in a canonical order, for whole-detail comparison. */
function orderNormalizedDetail(detail: Record<string, unknown>): string {
  const holdings = Array.isArray(detail.holdings) ? sortedCanonical(detail.holdings) : [];
  return canonicalJson({ ...detail, holdings });
}

/* ------------------------------------------------------------------ *
 * Identity aggregate — from the actual `securityIdentity` object only
 * ------------------------------------------------------------------ */

const KNOWN_IDENTITY_STATUSES: readonly string[] = ['RESOLVED', 'UNRESOLVED'];
const KNOWN_RESOLUTION_DISPOSITIONS: readonly string[] = [
  'CANONICAL_P04',
  'NON_PRODUCTION_OPERATOR_BYPASS',
  'MANUAL_PERSONAL_ENTRY',
];

export interface IdentityAggregate {
  readonly holdings: number;
  /** `securityIdentity` is an object carrying string `securityId`, `isin` and `series`. */
  readonly securityIdentityObjectPresent: number;
  /** `securityIdentity` is explicitly `null`: EXPLICITLY UNRESOLVED upstream. */
  readonly securityIdentityNull: number;
  /** The holding carries no `securityIdentity` property at all. */
  readonly securityIdentityAbsent: number;
  /** A `securityIdentity` value is present but is not the expected object shape. */
  readonly securityIdentityMalformed: number;
  /** Closed vocabulary; any other wire value is counted as `OTHER`, never echoed. */
  readonly identityStatus: Readonly<Record<string, number>>;
  readonly resolutionDisposition: Readonly<Record<string, number>>;
  readonly basis: string;
}

function bucket(value: unknown, known: readonly string[]): string {
  if (value === undefined) return 'ABSENT';
  if (typeof value === 'string' && known.includes(value)) return value;
  return 'OTHER';
}

function isNonBlankString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function summarizeHoldingIdentity(holdings: readonly unknown[]): IdentityAggregate {
  let objectPresent = 0;
  let explicitNull = 0;
  let absent = 0;
  let malformed = 0;
  const status: Record<string, number> = {};
  const disposition: Record<string, number> = {};

  for (const holding of holdings) {
    const record = asRecord(holding) ?? {};
    if (!hasOwn(record, 'securityIdentity') || record.securityIdentity === undefined) {
      absent += 1;
    } else if (record.securityIdentity === null) {
      explicitNull += 1;
    } else {
      const identity = asRecord(record.securityIdentity);
      const wellFormed =
        identity !== null &&
        isNonBlankString(identity.securityId) &&
        isNonBlankString(identity.isin) &&
        isNonBlankString(identity.series);
      if (wellFormed) objectPresent += 1;
      else malformed += 1;
    }
    const statusKey = bucket(record.identityStatus, KNOWN_IDENTITY_STATUSES);
    status[statusKey] = (status[statusKey] ?? 0) + 1;
    const dispositionKey = bucket(record.resolutionDisposition, KNOWN_RESOLUTION_DISPOSITIONS);
    disposition[dispositionKey] = (disposition[dispositionKey] ?? 0) + 1;
  }

  return {
    holdings: holdings.length,
    securityIdentityObjectPresent: objectPresent,
    securityIdentityNull: explicitNull,
    securityIdentityAbsent: absent,
    securityIdentityMalformed: malformed,
    identityStatus: status,
    resolutionDisposition: disposition,
    basis:
      'Counted from the actual securityIdentity object on each wire holding. Nothing is derived from a ' +
      'symbol, a company name or an exchange. Null or absent means explicitly unresolved upstream.',
  };
}

/* ------------------------------------------------------------------ *
 * Consistency evaluation
 * ------------------------------------------------------------------ */

export type ConsistencyCheckId =
  | 'GETS_NAME_THE_IDENTIFIED_PORTFOLIO'
  | 'GETS_SAME_REVISION'
  | 'GETS_SAME_PROVENANCE_DIGEST'
  | 'HISTORY_HAS_EXACTLY_ONE_ENTRY_FOR_REVISION'
  | 'HISTORY_ENTRY_SAME_PROVENANCE_DIGEST'
  | 'HISTORY_HOLDINGS_COUNT_EQUALS_HOLDINGS_LENGTH'
  | 'DETAIL_HOLDINGS_COUNT_EQUALS_HOLDINGS_LENGTH'
  | 'HOLDINGS_IDENTICAL_ACROSS_GETS'
  | 'HOLDING_IDENTITY_IDENTICAL_ACROSS_GETS'
  | 'DETAIL_IDENTICAL_ACROSS_GETS';

export interface ConsistencyCheck {
  readonly id: ConsistencyCheckId;
  readonly passed: boolean;
  /** Counts and revision numbers only. Never an identifier, a digest value or an amount. */
  readonly detail: string;
}

export type ObservationId =
  | 'LIST_SUMMARY_AGREES_WITH_DETAIL'
  | 'HOLDINGS_ORDER_IDENTICAL_ACROSS_GETS'
  | 'PROVENANCE_DIGEST_NON_EMPTY'
  | 'CAPTURED_REVISION_IS_LATEST_IN_HISTORY';

/** Reported, never gating. A `false` here is a caveat the reviewer must read. */
export interface ConsistencyObservation {
  readonly id: ObservationId;
  readonly value: boolean;
  readonly detail: string;
}

export interface ConsistencyReport {
  readonly consistent: boolean;
  readonly checks: readonly ConsistencyCheck[];
  readonly observations: readonly ConsistencyObservation[];
  readonly failedCheckIds: readonly ConsistencyCheckId[];
}

export interface ConsistencyInput {
  readonly identifiedPortfolioId: string;
  readonly listedSummary: G2PortfolioSummary;
  readonly firstView: G2PortfolioView;
  readonly firstWireDetail: Record<string, unknown>;
  readonly history: readonly G2RevisionEntry[];
  readonly secondView: G2PortfolioView;
  readonly secondWireDetail: Record<string, unknown>;
}

export function evaluateConsistency(input: ConsistencyInput): ConsistencyReport {
  const { firstView, secondView, history, listedSummary } = input;
  const firstHoldings = firstView.holdings as readonly unknown[];
  const secondHoldings = secondView.holdings as readonly unknown[];
  const matching = history.filter((entry) => entry.revision === firstView.revision);
  const entry = matching.length === 1 ? matching[0] : null;
  const checks: ConsistencyCheck[] = [];
  const add = (id: ConsistencyCheckId, passed: boolean, detail: string): void => {
    checks.push({ id, passed, detail });
  };

  add(
    'GETS_NAME_THE_IDENTIFIED_PORTFOLIO',
    firstView.portfolioId === input.identifiedPortfolioId && secondView.portfolioId === input.identifiedPortfolioId,
    'both portfolio.get results must carry the portfolio id identified from portfolio.list',
  );
  add(
    'GETS_SAME_REVISION',
    firstView.revision === secondView.revision,
    `first get revision ${firstView.revision}; second get revision ${secondView.revision}`,
  );
  add(
    'GETS_SAME_PROVENANCE_DIGEST',
    firstView.provenanceDigest === secondView.provenanceDigest,
    'provenanceDigest compared by exact string equality across both gets',
  );
  add(
    'HISTORY_HAS_EXACTLY_ONE_ENTRY_FOR_REVISION',
    matching.length === 1,
    `history entries: ${history.length}; entries for revision ${firstView.revision}: ${matching.length}`,
  );
  add(
    'HISTORY_ENTRY_SAME_PROVENANCE_DIGEST',
    entry !== null &&
      entry.provenanceDigest === firstView.provenanceDigest &&
      entry.provenanceDigest === secondView.provenanceDigest,
    entry === null
      ? 'no single matching history entry to compare'
      : 'history entry provenanceDigest compared by exact string equality with both gets',
  );
  add(
    'HISTORY_HOLDINGS_COUNT_EQUALS_HOLDINGS_LENGTH',
    entry !== null && entry.holdingsCount === firstHoldings.length && entry.holdingsCount === secondHoldings.length,
    entry === null
      ? 'no single matching history entry to compare'
      : `history holdingsCount ${entry.holdingsCount}; holdings array lengths ${firstHoldings.length} and ${secondHoldings.length}`,
  );
  add(
    'DETAIL_HOLDINGS_COUNT_EQUALS_HOLDINGS_LENGTH',
    firstView.totalHoldingsCount === firstHoldings.length && secondView.totalHoldingsCount === secondHoldings.length,
    `detail holdingsCount ${firstView.totalHoldingsCount} and ${secondView.totalHoldingsCount}; ` +
      `holdings array lengths ${firstHoldings.length} and ${secondHoldings.length}`,
  );
  add(
    'HOLDINGS_IDENTICAL_ACROSS_GETS',
    sameMultiset(firstHoldings, secondHoldings),
    'every holding of the first get must equal a holding of the second get, field for field',
  );
  add(
    'HOLDING_IDENTITY_IDENTICAL_ACROSS_GETS',
    sameMultiset(firstHoldings.map(identityProjection), secondHoldings.map(identityProjection)),
    'symbol, companyId, identityStatus, resolutionDisposition, lineageDigest and the securityIdentity object, verbatim',
  );
  add(
    'DETAIL_IDENTICAL_ACROSS_GETS',
    orderNormalizedDetail(input.firstWireDetail) === orderNormalizedDetail(input.secondWireDetail),
    'the two wire details must be identical in every field (holdings compared order-insensitively)',
  );

  const latest = history.reduce((max, item) => (item.revision > max ? item.revision : max), -1);
  const observations: ConsistencyObservation[] = [
    {
      id: 'LIST_SUMMARY_AGREES_WITH_DETAIL',
      value:
        listedSummary.revision === firstView.revision &&
        listedSummary.provenanceDigest === firstView.provenanceDigest &&
        listedSummary.totalHoldingsCount === firstView.totalHoldingsCount,
      detail: 'revision, provenanceDigest and holdingsCount of the listed summary against the first get',
    },
    {
      id: 'HOLDINGS_ORDER_IDENTICAL_ACROSS_GETS',
      value: canonicalJson(firstHoldings) === canonicalJson(secondHoldings),
      detail: 'whether both gets returned the holdings in the same order',
    },
    {
      id: 'PROVENANCE_DIGEST_NON_EMPTY',
      value: firstView.provenanceDigest.length > 0,
      detail:
        'an empty stored provenanceDigest is a valid stored fact, but then the digest comparisons above ' +
        'compare empty strings and discriminate nothing',
    },
    {
      id: 'CAPTURED_REVISION_IS_LATEST_IN_HISTORY',
      value: latest === firstView.revision,
      detail: `highest revision in history ${latest}; captured revision ${firstView.revision}`,
    },
  ];

  const failedCheckIds = checks.filter((check) => !check.passed).map((check) => check.id);
  return { consistent: failedCheckIds.length === 0, checks, observations, failedCheckIds };
}

/* ------------------------------------------------------------------ *
 * One attempt
 * ------------------------------------------------------------------ */

export type SelectionMethod = 'SOLE_LISTED_PORTFOLIO' | 'OPERATOR_SELECTED_AND_LISTED';

/** A listed portfolio, for the LOCAL-ONLY candidates file. Never printed, never published. */
export interface PortfolioCandidate {
  readonly portfolioId: string;
  readonly portfolioName: string;
  readonly revision: number;
  readonly holdingsCount: number;
  readonly isSaved: boolean;
  readonly lastUpdated: string;
}

export interface AttemptFailure {
  readonly kind: 'FAILED';
  readonly outcome: Exclude<CaptureOutcome, 'CONSISTENT_CAPTURE'>;
  /** Machine-readable and free of portfolio content. */
  readonly reasonCode: string;
  /** Operator-facing and free of portfolio content. */
  readonly message: string;
  /** True only for a failed consistency check: the whole sequence may be repeated. */
  readonly recapturable: boolean;
  readonly failedOperation: IpcOperation | null;
  readonly failedCheckIds: readonly ConsistencyCheckId[];
  readonly listedPortfolioCount: number | null;
  /** LOCAL-ONLY. Present only when the operator must choose among listed portfolios. */
  readonly candidates: readonly PortfolioCandidate[] | null;
  readonly requestSequence: readonly IpcOperation[];
  readonly startedAtUtc: string;
  readonly completedAtUtc: string;
}

export interface AttemptSuccess {
  readonly kind: 'CONSISTENT';
  /** Step 1: consumer host clock (UTC) before the first read. */
  readonly startedAtUtc: string;
  /** Step 6: consumer host clock (UTC) after the final read. */
  readonly completedAtUtc: string;
  readonly selectionMethod: SelectionMethod;
  readonly listedPortfolioCount: number;
  readonly identifiedPortfolioId: string;
  readonly calls: readonly RecordedCall[];
  readonly requestSequence: readonly IpcOperation[];
  readonly firstView: G2PortfolioView;
  readonly history: readonly G2RevisionEntry[];
  readonly matchingHistoryEntry: G2RevisionEntry;
  readonly secondView: G2PortfolioView;
  readonly firstWireDetail: Record<string, unknown>;
  readonly secondWireDetail: Record<string, unknown>;
  readonly consistency: ConsistencyReport;
}

export type AttemptResult = AttemptSuccess | AttemptFailure;

export type ProgressSink = (line: string) => void;

interface AttemptContext {
  readonly env: NodeJS.ProcessEnv;
  readonly inner: CaptureTransport;
  readonly now: () => Date;
  readonly progress: ProgressSink;
  readonly operatorPortfolioId: string | undefined;
}

function classATreatment(
  outcome: string,
  op: IpcOperation,
): Pick<AttemptFailure, 'outcome' | 'reasonCode' | 'message' | 'recapturable'> {
  if (outcome === 'RESOURCE_UNAVAILABLE' && op !== 'portfolio.list') {
    return {
      outcome: 'INCONSISTENT_READ',
      reasonCode: 'PORTFOLIO_UNAVAILABLE_AFTER_LISTING',
      message:
        `IPD listed the portfolio and then answered ${op} with RESOURCE_UNAVAILABLE. The reads disagree; ` +
        'nothing from this attempt was kept.',
      recapturable: true,
    };
  }
  return {
    outcome: 'PROTOCOL_CAPABILITY_UNAVAILABLE',
    reasonCode: `CLASS_A_${outcome}`,
    message:
      `IPD answered ${op} with the typed refusal ${outcome}. The read capability needed for the capture ` +
      'is not available from this service build or state. Nothing was captured.',
    recapturable: false,
  };
}

function classifyCallFailure(
  op: IpcOperation,
  error: unknown,
  call: RecordedCall | undefined,
): Pick<AttemptFailure, 'outcome' | 'reasonCode' | 'message' | 'recapturable'> {
  if (error instanceof CaptureReadOnlyViolation) {
    return { outcome: 'INTERNAL_ERROR', reasonCode: 'READ_ONLY_GUARD_TRIPPED', message: error.message, recapturable: false };
  }

  const thrown = call === undefined ? error : call.thrown;
  if (call === undefined || call.result === null) {
    if (thrown instanceof IpcClientError) {
      if (thrown.kind === 'ENDPOINT_NOT_CONFIGURED') {
        return {
          outcome: 'CONFIGURATION_INVALID',
          reasonCode: 'ENDPOINT_NOT_CONFIGURED',
          message: `${IPC_ENDPOINT_SETTING} is not usable: ${thrown.message}. No IPC call was made.`,
          recapturable: false,
        };
      }
      return {
        outcome: 'PROTOCOL_CAPABILITY_UNAVAILABLE',
        reasonCode: `LOCAL_CLIENT_REFUSAL_${thrown.kind}`,
        message: `The existing IRR IPC client refused ${op} locally (${thrown.kind}); nothing was sent.`,
        recapturable: false,
      };
    }
    if (call === undefined && error instanceof G2Error) {
      return {
        outcome: 'BINDING_OR_AUTHORIZATION_REFUSAL',
        reasonCode: 'IRR_LOCAL_OWNER_CONTEXT_NOT_ESTABLISHED',
        message:
          `The existing IRR consumer refused ${op} before any I/O: no owner context is established from a ` +
          `binding (${BINDING_PRECONDITION_SETTING}). No IPC call was made.`,
        recapturable: false,
      };
    }
    return {
      outcome: 'INTERNAL_ERROR',
      reasonCode: 'UNEXPECTED_FAILURE_BEFORE_RESPONSE',
      message: `An unexpected failure occurred before ${op} produced a response.`,
      recapturable: false,
    };
  }

  const result = call.result;
  switch (result.kind) {
    case 'CLASS_P':
      return {
        outcome: 'BINDING_OR_AUTHORIZATION_REFUSAL',
        reasonCode: 'CLASS_P_ZERO_BYTE_CLOSE',
        message:
          `IPD accepted the connection for ${op} and closed it with zero bytes (Class P). That is a ` +
          'pre-authorization refusal, which includes an absent or invalid owner binding. IPD discloses no ' +
          'reason on the wire and none is assumed here; the reason is in the IPD Class P journal on this host.',
        recapturable: false,
      };
    case 'OUTCOME_UNKNOWN':
      if (result.reason === 'TIMEOUT') {
        return {
          outcome: 'IPC_CONNECTION_FAILURE',
          reasonCode: 'TIMEOUT',
          message:
            `${op} produced no response within ${IPC_TIMEOUT_MS} ms on the existing IPC client. ` +
            'Confirm the IPD IPC service is running and responsive. This utility never starts it.',
          recapturable: false,
        };
      }
      return {
        outcome: 'IPC_CONNECTION_FAILURE',
        reasonCode: 'TRANSPORT_FAULT',
        message:
          `${op} failed with a transport fault on the existing IPC client. The client reports one class for ` +
          'all of: nothing is serving the endpoint (IPD IPC service not running, or a different pipe name); ' +
          'the connection was reset; the response was malformed, disclosed a caller-identity field, used a ' +
          `different protocol version, or exceeded the ${IPC_RESPONSE_MAX_BYTES}-byte response cap. ` +
          'This utility never starts IPD.',
        recapturable: false,
      };
    case 'CLASS_A':
      return classATreatment(result.frame.outcome, op);
    case 'SUCCESS': {
      const detail = error instanceof G2Error ? error.message : 'the response was not usable';
      return {
        outcome: 'PROTOCOL_CAPABILITY_UNAVAILABLE',
        reasonCode: 'RESPONSE_NOT_ADMITTED_BY_IRR_CONSUMER',
        message:
          `IPD answered ${op}, but the existing IRR consumer does not admit the response: ${detail} ` +
          'The response was refused rather than repaired. Nothing was captured.',
        recapturable: false,
      };
    }
    default:
      return {
        outcome: 'INTERNAL_ERROR',
        reasonCode: 'UNCLASSIFIED_RESULT',
        message: `${op} produced a result this utility cannot classify.`,
        recapturable: false,
      };
  }
}

function toCandidate(summary: G2PortfolioSummary): PortfolioCandidate {
  return {
    portfolioId: summary.portfolioId,
    portfolioName: summary.portfolioName,
    revision: summary.revision,
    holdingsCount: summary.totalHoldingsCount,
    isSaved: summary.isSaved,
    lastUpdated: summary.lastUpdated,
  };
}

/**
 * Runs the six-step sequence once. Either every gating check passes and the complete
 * attempt is returned, or a failure is returned and NOTHING read in this attempt is
 * carried forward.
 */
export async function runCaptureAttempt(context: AttemptContext): Promise<AttemptResult> {
  const { now, progress } = context;
  const recording = createRecordingReadOnlyTransport(context.inner, now);
  // The EXISTING adapter. Its precondition is read from the same server-owned
  // environment, so the endpoint and the precondition cannot disagree.
  const port = new IpcUserPortfolioPort({
    precondition: readBindingPrecondition(context.env),
    env: context.env,
    transport: recording.transport,
  });
  // Empty scope, exactly as the IRR transport passes: IPD resolves the owner itself.
  const scope = {};

  // Step 1 — consumer UTC timestamp before the first read.
  const startedAtUtc = now().toISOString();
  progress('  [1/6] consumer UTC timestamp recorded before the first read');

  let listedPortfolioCount: number | null = null;
  const fail = (
    part: Pick<AttemptFailure, 'outcome' | 'reasonCode' | 'message' | 'recapturable'>,
    extra: Partial<Pick<AttemptFailure, 'failedOperation' | 'failedCheckIds' | 'candidates'>> = {},
  ): AttemptFailure => ({
    kind: 'FAILED',
    ...part,
    failedOperation: extra.failedOperation ?? null,
    failedCheckIds: extra.failedCheckIds ?? [],
    listedPortfolioCount,
    candidates: extra.candidates ?? null,
    requestSequence: recording.calls.map((call) => call.op),
    startedAtUtc,
    completedAtUtc: now().toISOString(),
  });
  // The call the adapter made for this step, if it reached the transport at all.
  const callSince = (before: number): RecordedCall | undefined =>
    recording.calls.length > before ? recording.calls[recording.calls.length - 1] : undefined;
  const failedCall = (op: IpcOperation, error: unknown, before: number): AttemptFailure =>
    fail(classifyCallFailure(op, error, callSince(before)), { failedOperation: op });

  // Step 2 — portfolio.list; the portfolio is identified from the actual response.
  let summaries: readonly G2PortfolioSummary[];
  let before = recording.calls.length;
  try {
    summaries = await port.listPortfolios({ scope });
  } catch (error) {
    return failedCall('portfolio.list', error, before);
  }
  listedPortfolioCount = summaries.length;
  progress(`  [2/6] portfolio.list answered: ${summaries.length} owner-bound portfolio(s) listed`);

  let identified: G2PortfolioSummary;
  let selectionMethod: SelectionMethod;
  const requested = context.operatorPortfolioId;
  if (summaries.length === 0) {
    return fail({
      outcome: 'AMBIGUOUS_OR_MISSING_PORTFOLIO',
      reasonCode: 'NO_PORTFOLIO_LISTED',
      message:
        'IPD listed no portfolio for the owner it resolved. There is nothing to capture, and no portfolio ' +
        'id is guessed. Nothing was created.',
      recapturable: false,
    });
  }
  if (requested !== undefined) {
    const matches = summaries.filter((summary) => summary.portfolioId === requested);
    if (matches.length !== 1) {
      return fail(
        {
          outcome: 'AMBIGUOUS_OR_MISSING_PORTFOLIO',
          reasonCode: 'SELECTED_PORTFOLIO_NOT_LISTED',
          message:
            'The portfolio id supplied by the operator is not exactly one of the portfolios IPD listed. ' +
            'No read was attempted for it. The listed candidates are in the LOCAL-ONLY candidates file.',
          recapturable: false,
        },
        { candidates: summaries.map(toCandidate) },
      );
    }
    identified = matches[0];
    selectionMethod = 'OPERATOR_SELECTED_AND_LISTED';
  } else if (summaries.length === 1) {
    identified = summaries[0];
    selectionMethod = 'SOLE_LISTED_PORTFOLIO';
  } else {
    return fail(
      {
        outcome: 'AMBIGUOUS_OR_MISSING_PORTFOLIO',
        reasonCode: 'MULTIPLE_PORTFOLIOS_LISTED_NONE_SELECTED',
        message:
          `IPD listed ${summaries.length} portfolios and none was selected. No default is assumed. Read the ` +
          'LOCAL-ONLY candidates file on this host and run again with -PortfolioId <id>.',
        recapturable: false,
      },
      { candidates: summaries.map(toCandidate) },
    );
  }
  const portfolioId = identified.portfolioId;

  // Step 3 — first portfolio.get.
  let firstView: G2PortfolioView;
  before = recording.calls.length;
  try {
    firstView = await port.getPortfolio({ scope, portfolioId });
  } catch (error) {
    return failedCall('portfolio.get', error, before);
  }
  const firstCall = recording.calls[recording.calls.length - 1];
  progress('  [3/6] portfolio.get answered (first read)');

  // Step 4 — portfolio.revisions.
  let history: readonly G2RevisionEntry[];
  before = recording.calls.length;
  try {
    history = await port.revisionHistory({ scope, portfolioId });
  } catch (error) {
    return failedCall('portfolio.revisions', error, before);
  }
  progress(`  [4/6] portfolio.revisions answered: ${history.length} history entr(ies)`);

  // Step 5 — second portfolio.get.
  let secondView: G2PortfolioView;
  before = recording.calls.length;
  try {
    secondView = await port.getPortfolio({ scope, portfolioId });
  } catch (error) {
    return failedCall('portfolio.get', error, before);
  }
  const secondCall = recording.calls[recording.calls.length - 1];
  progress('  [5/6] portfolio.get answered (second read)');

  // Step 6 — consumer UTC timestamp after the final read.
  const completedAtUtc = now().toISOString();
  progress('  [6/6] consumer UTC timestamp recorded after the final read');

  const firstWireDetail = firstCall.result?.kind === 'SUCCESS' ? asRecord(firstCall.result.frame.result) : null;
  const secondWireDetail = secondCall.result?.kind === 'SUCCESS' ? asRecord(secondCall.result.frame.result) : null;
  if (firstWireDetail === null || secondWireDetail === null) {
    return fail({
      outcome: 'INTERNAL_ERROR',
      reasonCode: 'WIRE_DETAIL_NOT_RECORDED',
      message: 'The wire detail of a successful portfolio.get was not recorded; nothing was kept.',
      recapturable: false,
    });
  }

  const consistency = evaluateConsistency({
    identifiedPortfolioId: portfolioId,
    listedSummary: identified,
    firstView,
    firstWireDetail,
    history,
    secondView,
    secondWireDetail,
  });
  const matching = history.filter((entry) => entry.revision === firstView.revision);
  if (!consistency.consistent || matching.length !== 1) {
    return fail(
      {
        outcome: 'INCONSISTENT_READ',
        reasonCode: 'CONSISTENCY_CHECK_FAILED',
        message:
          `The reads of this attempt do not agree (${consistency.failedCheckIds.join(', ')}). ` +
          'The whole attempt was discarded; no part of it is combined with any other read.',
        recapturable: true,
      },
      { failedCheckIds: consistency.failedCheckIds },
    );
  }

  return {
    kind: 'CONSISTENT',
    startedAtUtc,
    completedAtUtc,
    selectionMethod,
    listedPortfolioCount: summaries.length,
    identifiedPortfolioId: portfolioId,
    calls: recording.calls.slice(),
    requestSequence: recording.calls.map((call) => call.op),
    firstView,
    history,
    matchingHistoryEntry: matching[0],
    secondView,
    firstWireDetail,
    secondWireDetail,
    consistency,
  };
}

/* ------------------------------------------------------------------ *
 * The bounded capture
 * ------------------------------------------------------------------ */

export interface CaptureOptions {
  /** The server-owned environment. Read, never written. */
  readonly env: NodeJS.ProcessEnv;
  readonly platform?: NodeJS.Platform;
  /** Explicit operator selection. It must be exactly one of the listed portfolios. */
  readonly portfolioId?: string;
  readonly maxAttempts?: number;
  readonly retryDelayMs?: number;
  /** TESTS ONLY: a mocked IPC. Production uses the existing client. */
  readonly transport?: CaptureTransport;
  readonly now?: () => Date;
  readonly sleep?: (milliseconds: number) => Promise<void>;
  readonly onProgress?: ProgressSink;
  readonly captureId?: string;
}

export interface AttemptRecord {
  readonly attempt: number;
  readonly startedAtUtc: string | null;
  readonly completedAtUtc: string | null;
  readonly outcome: CaptureOutcome;
  readonly reasonCode: string;
  readonly failedOperation: IpcOperation | null;
  readonly failedCheckIds: readonly ConsistencyCheckId[];
  readonly requestSequence: readonly IpcOperation[];
}

export interface CaptureResult {
  readonly captureId: string;
  /** The platform the capture ran on. Only a Windows host run can be evidence. */
  readonly platform: NodeJS.Platform;
  readonly outcome: CaptureOutcome;
  readonly reasonCode: string;
  readonly message: string;
  readonly exitCode: number;
  readonly configuration: ConfigurationAssessment;
  readonly maxAttempts: number;
  readonly attempts: readonly AttemptRecord[];
  /** Present only for `CONSISTENT_CAPTURE`. The single accepted attempt, whole. */
  readonly accepted: AttemptSuccess | null;
  readonly listedPortfolioCount: number | null;
  /** LOCAL-ONLY. Present only when the operator must choose. */
  readonly candidates: readonly PortfolioCandidate[] | null;
  readonly operatorSuppliedPortfolioId: boolean;
}

function clampInteger(value: number | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined || !Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/**
 * Validates configuration, then runs the sequence at most `maxAttempts` times. Only a
 * failed consistency check is repeated; every other failure stops at once. Never
 * returns a partial or combined capture.
 */
export async function captureOwnerBoundPortfolio(options: CaptureOptions): Promise<CaptureResult> {
  const captureId = options.captureId ?? randomUUID();
  const now = options.now ?? (() => new Date());
  const sleep =
    options.sleep ?? ((milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));
  const progress: ProgressSink = options.onProgress ?? (() => undefined);
  const maxAttempts = clampInteger(options.maxAttempts, DEFAULT_MAX_ATTEMPTS, 1, MAX_ATTEMPTS_LIMIT);
  const retryDelayMs = clampInteger(options.retryDelayMs, DEFAULT_RETRY_DELAY_MS, 0, RETRY_DELAY_LIMIT_MS);
  const operatorSuppliedPortfolioId = options.portfolioId !== undefined;

  const platform = options.platform ?? process.platform;
  const configuration = validateCaptureConfiguration(options.env, platform);
  const base = { captureId, platform, configuration, maxAttempts, operatorSuppliedPortfolioId };
  if (!configuration.ok) {
    progress('Configuration is not valid. No IPC connection was attempted.');
    return {
      ...base,
      outcome: 'CONFIGURATION_INVALID',
      reasonCode: configuration.problems.map((problem) => problem.code).join('+'),
      message: configuration.problems.map((problem) => problem.message).join(' '),
      exitCode: CAPTURE_EXIT_CODES.CONFIGURATION_INVALID,
      attempts: [],
      accepted: null,
      listedPortfolioCount: null,
      candidates: null,
    };
  }

  const inner = options.transport ?? existingIpcClientTransport(options.env);
  const attempts: AttemptRecord[] = [];
  let last: AttemptFailure | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    progress(`Attempt ${attempt} of ${maxAttempts}: reading through the existing IRR IPC consumer`);
    let result: AttemptResult;
    try {
      result = await runCaptureAttempt({
        env: options.env,
        inner,
        now,
        progress,
        operatorPortfolioId: options.portfolioId,
      });
    } catch {
      // Defensive: runCaptureAttempt classifies its own failures. Anything that still
      // escapes is a defect here and is never converted into a capture.
      const at = now().toISOString();
      result = {
        kind: 'FAILED',
        outcome: 'INTERNAL_ERROR',
        reasonCode: 'UNEXPECTED_EXCEPTION',
        message: 'The capture utility failed unexpectedly. Nothing was captured.',
        recapturable: false,
        failedOperation: null,
        failedCheckIds: [],
        listedPortfolioCount: null,
        candidates: null,
        requestSequence: [],
        startedAtUtc: at,
        completedAtUtc: at,
      };
    }

    if (result.kind === 'CONSISTENT') {
      attempts.push({
        attempt,
        startedAtUtc: result.startedAtUtc,
        completedAtUtc: result.completedAtUtc,
        outcome: 'CONSISTENT_CAPTURE',
        reasonCode: 'ALL_GATING_CHECKS_PASSED',
        failedOperation: null,
        failedCheckIds: [],
        requestSequence: result.requestSequence,
      });
      progress(`Attempt ${attempt}: all ${result.consistency.checks.length} consistency checks passed`);
      return {
        ...base,
        outcome: 'CONSISTENT_CAPTURE',
        reasonCode: 'ALL_GATING_CHECKS_PASSED',
        message:
          'One attempt produced four reads that agree on portfolio, revision, provenanceDigest, history ' +
          'entry, holdings count, holdings and identity.',
        exitCode: CAPTURE_EXIT_CODES.CONSISTENT_CAPTURE,
        attempts,
        accepted: result,
        listedPortfolioCount: result.listedPortfolioCount,
        candidates: null,
      };
    }

    last = result;
    attempts.push({
      attempt,
      startedAtUtc: result.startedAtUtc,
      completedAtUtc: result.completedAtUtc,
      outcome: result.outcome,
      reasonCode: result.reasonCode,
      failedOperation: result.failedOperation,
      failedCheckIds: result.failedCheckIds,
      requestSequence: result.requestSequence,
    });
    progress(`Attempt ${attempt}: ${result.outcome} (${result.reasonCode}) - attempt discarded`);
    if (!result.recapturable) break;
    if (attempt < maxAttempts && retryDelayMs > 0) await sleep(retryDelayMs);
  }

  const failure = last as AttemptFailure;
  const exhausted = failure.recapturable;
  return {
    ...base,
    outcome: failure.outcome,
    reasonCode: failure.reasonCode,
    message: exhausted
      ? `${failure.message} All ${attempts.length} bounded attempt(s) were inconsistent; no capture was produced.`
      : failure.message,
    exitCode: CAPTURE_EXIT_CODES[failure.outcome],
    attempts,
    accepted: null,
    listedPortfolioCount: failure.listedPortfolioCount,
    candidates: failure.candidates,
  };
}

/* ------------------------------------------------------------------ *
 * Build / protocol metadata
 * ------------------------------------------------------------------ */

/**
 * Host-observed metadata supplied by the PowerShell entry point. None of it is attested
 * by the IPD service: wire contract v1 carries a protocol version and nothing about a
 * build.
 */
export interface HostBuildMetadata {
  readonly irrCommit?: string;
  readonly irrWorkingTreeDirty?: boolean;
  readonly ipdCheckoutCommit?: string;
  /** How the IPD checkout was located, e.g. `OPERATOR_SUPPLIED_PATH`. */
  readonly ipdCheckoutSource?: string;
  readonly ipdEntrypointLastWriteUtc?: string;
  readonly ipdIpcProcessCount?: number;
}

const COMMIT_PATTERN = /^[0-9a-f]{7,64}$/;
const SOURCE_PATTERN = /^[A-Z0-9_]{1,64}$/;
const UTC_INSTANT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,7})?Z$/;

function buildSection(build: HostBuildMetadata, responseProtocolVersions: readonly number[]) {
  const commit = (value: string | undefined): string | null =>
    typeof value === 'string' && COMMIT_PATTERN.test(value) ? value : null;
  return {
    protocol: {
      clientProtocolVersion: IPC_PROTOCOL_VERSION,
      responseProtocolVersionsObserved: responseProtocolVersions,
      negotiation: 'NONE (wire contract v1 fixes the version; the existing client refuses any other)',
      perCallTimeoutMs: IPC_TIMEOUT_MS,
      responseCapBytes: IPC_RESPONSE_MAX_BYTES,
      consumerPath: 'IpcUserPortfolioPort over callIpc (existing IRR IPC consumer); no new framing',
    },
    build: {
      ipdBuildOnWire:
        'NOT_AVAILABLE: wire contract v1 responses carry the protocol version only; the service attests no build',
      ipdHostObserved: {
        checkoutCommit: commit(build.ipdCheckoutCommit),
        checkoutSource:
          typeof build.ipdCheckoutSource === 'string' && SOURCE_PATTERN.test(build.ipdCheckoutSource)
            ? build.ipdCheckoutSource
            : null,
        entrypointLastWriteUtc:
          typeof build.ipdEntrypointLastWriteUtc === 'string' && UTC_INSTANT_PATTERN.test(build.ipdEntrypointLastWriteUtc)
            ? build.ipdEntrypointLastWriteUtc
            : null,
        ipcProcessCount:
          typeof build.ipdIpcProcessCount === 'number' && Number.isInteger(build.ipdIpcProcessCount)
            ? build.ipdIpcProcessCount
            : null,
        caveat:
          'Observed on the host by the PowerShell entry point (git HEAD of the IPD checkout, file time of ' +
          'its compiled IPC entrypoint, visible process count). It is NOT reported by the running service ' +
          'and does not prove which commit the running process was built from.',
      },
      irr: {
        commit: commit(build.irrCommit),
        workingTreeDirty: typeof build.irrWorkingTreeDirty === 'boolean' ? build.irrWorkingTreeDirty : null,
      },
      consumerRuntime: { node: process.version, platform: process.platform, arch: process.arch },
    },
  };
}

const OWNER_CONTEXT_STATEMENT = Object.freeze({
  source: 'IPD_A2_BINDING',
  irrLocalPreconditionAffirmed: true,
  bindingIdentifiedByResponse: false,
  note:
    'IPD resolves its owner binding server-side on every request and discloses nothing about it. No owner, ' +
    'tenant or binding identifier is sent or received, and the response does not identify the binding. ' +
    'The IRR-local precondition records that an operator provisioned a binding; it is not proof of one.',
});

const CONSUMER_CLOCK_NOTE =
  'Read from the CONSUMER host clock in UTC. These are observation timestamps. They are NOT IPD persistence ' +
  'timestamps and say nothing about when the data was written.';

const CONSISTENCY_SCOPE =
  'Read consistency across four sequential IPC reads within the observation window. It is not atomicity and ' +
  'not a cross-service transaction, and it does not prove that no write occurred and reverted between reads.';

/* ------------------------------------------------------------------ *
 * LOCAL-ONLY exact capture
 * ------------------------------------------------------------------ */

function detailWireShape(detail: Record<string, unknown>): 'LocalPortfolioDetail' | 'PortfolioDetail' {
  return Array.isArray(detail.importEvidence) ? 'LocalPortfolioDetail' : 'PortfolioDetail';
}

function isSyntheticFixture(portfolioId: string): boolean {
  return portfolioId.startsWith(SYNTHETIC_FIXTURE_PORTFOLIO_PREFIX);
}

export type EvidenceEligibility =
  /** No consistent capture exists. */
  | 'NO_CAPTURE'
  /** The repository's synthetic test peer answered. A utility test, never evidence. */
  | 'NOT_EVIDENCE_SYNTHETIC_TEST_PEER'
  /** The run was not on a Windows host. W11 dependency 1 needs the Windows host. */
  | 'NOT_EVIDENCE_NOT_A_WINDOWS_HOST'
  /** A consistent capture on a Windows host. Eligible for REVIEW; not accepted by this utility. */
  | 'HOST_CAPTURE_SUBJECT_TO_REVIEW';

/**
 * What a result may be offered as. This never says "accepted": acceptance is a review
 * decision, and the consumer cannot prove which process served the endpoint.
 */
export function evidenceEligibility(result: CaptureResult): EvidenceEligibility {
  if (result.outcome !== 'CONSISTENT_CAPTURE' || result.accepted === null) return 'NO_CAPTURE';
  if (isSyntheticFixture(result.accepted.identifiedPortfolioId)) return 'NOT_EVIDENCE_SYNTHETIC_TEST_PEER';
  if (result.platform !== 'win32') return 'NOT_EVIDENCE_NOT_A_WINDOWS_HOST';
  return 'HOST_CAPTURE_SUBJECT_TO_REVIEW';
}

/**
 * Builds the exact capture. It contains the portfolio contents verbatim and is
 * LOCAL-ONLY: it must stay on the Windows host and must never be committed or uploaded.
 */
export function buildExactCaptureDocument(result: CaptureResult, build: HostBuildMetadata): Record<string, unknown> {
  const accepted = result.accepted;
  if (result.outcome !== 'CONSISTENT_CAPTURE' || accepted === null) {
    throw new Error('an exact capture exists only for a consistent capture');
  }
  const versions = Array.from(
    new Set(accepted.calls.map((call) => (call.result?.kind === 'SUCCESS' ? call.result.frame.v : -1))),
  );
  return {
    schema: EXACT_CAPTURE_SCHEMA,
    classification:
      'LOCAL-ONLY - EXACT OWNER-BOUND PORTFOLIO CONTENTS - DO NOT PUBLISH, COMMIT OR UPLOAD',
    captureId: result.captureId,
    outcome: result.outcome,
    evidenceEligibility: evidenceEligibility(result),
    consumerObservation: {
      firstReadStartedAtUtc: accepted.startedAtUtc,
      finalReadCompletedAtUtc: accepted.completedAtUtc,
      note: CONSUMER_CLOCK_NOTE,
    },
    attempt: { accepted: result.attempts.length, maxAttempts: result.maxAttempts },
    ...buildSection(build, versions),
    ownerContext: OWNER_CONTEXT_STATEMENT,
    selection: {
      method: accepted.selectionMethod,
      listedPortfolioCount: accepted.listedPortfolioCount,
      portfolioId: accepted.identifiedPortfolioId,
    },
    reads: accepted.calls.map((call) => ({
      sequence: call.sequence,
      operation: call.op,
      requestPayload: call.requestPayload,
      consumerRequestedAtUtc: call.requestedAtUtc,
      consumerRespondedAtUtc: call.respondedAtUtc,
      responseProtocolVersion: call.result?.kind === 'SUCCESS' ? call.result.frame.v : null,
      responseBytes: call.result?.kind === 'SUCCESS' ? call.result.bytesReceived : null,
      wireResult: call.result?.kind === 'SUCCESS' ? call.result.frame.result : null,
    })),
    wireTypes: {
      'portfolio.list': 'PortfolioSummary[]',
      'portfolio.get': detailWireShape(accepted.firstWireDetail),
      'portfolio.revisions': 'RevisionEntry[]',
      note:
        'wireResult is the IPD wire result verbatim. Holding identity is the securityIdentity object on ' +
        'each holding exactly as received; null or absent means explicitly unresolved upstream.',
    },
    irrMirror: {
      note:
        'G2PortfolioView / G2RevisionEntry as produced by the existing IpcUserPortfolioPort mapping. This is ' +
        'an IRR-side mirror, not an IPD wire type, and adds no fact the wire result does not carry.',
      firstView: accepted.firstView,
      matchingRevisionEntry: accepted.matchingHistoryEntry,
      secondView: accepted.secondView,
    },
    consistency: { scope: CONSISTENCY_SCOPE, ...accepted.consistency },
  };
}

/* ------------------------------------------------------------------ *
 * Sanitized, publishable summary
 * ------------------------------------------------------------------ */

export interface ExactCaptureReference {
  readonly written: boolean;
  readonly fileName: string | null;
  readonly sha256: string | null;
  readonly bytes: number | null;
}

/**
 * Builds the sanitized summary — the only publishable artifact.
 *
 * It carries counts, revision numbers, boolean consistency results, timestamps,
 * protocol/build metadata and the outcome. It carries NO portfolio id, portfolio name,
 * symbol, security identifier, company id, digest value, price, quantity, amount, file
 * name, owner identifier, endpoint path or filesystem path. It is a summary and must
 * never be described as the complete capture evidence.
 */
export function buildSanitizedSummary(
  result: CaptureResult,
  build: HostBuildMetadata,
  exact: ExactCaptureReference,
): Record<string, unknown> {
  const accepted = result.accepted;
  const versions =
    accepted === null
      ? []
      : Array.from(new Set(accepted.calls.map((call) => (call.result?.kind === 'SUCCESS' ? call.result.frame.v : -1))));
  const eligibility = evidenceEligibility(result);

  let portfolio: Record<string, unknown> | null = null;
  let identity: IdentityAggregate | null = null;
  let consistency: Record<string, unknown> | null = null;
  if (accepted !== null) {
    const holdings = accepted.firstView.holdings as readonly unknown[];
    const importEvidence = accepted.firstWireDetail.importEvidence;
    portfolio = {
      revision: accepted.firstView.revision,
      holdingsCountReported: accepted.firstView.totalHoldingsCount,
      holdingsArrayLength: holdings.length,
      isSaved: accepted.firstView.isSaved,
      weightSumPercentage: accepted.firstView.weightSumPercentage,
      provenanceDigestPresent: accepted.firstView.provenanceDigest.length > 0,
      provenanceDigestLength: accepted.firstView.provenanceDigest.length,
      detailWireShape: detailWireShape(accepted.firstWireDetail),
      contributionsCount: accepted.firstView.contributions.length,
      importEvidenceCount: Array.isArray(importEvidence) ? importEvidence.length : null,
      historyEntryCount: accepted.history.length,
      matchingHistoryEntry: {
        revision: accepted.matchingHistoryEntry.revision,
        operation: accepted.matchingHistoryEntry.operation,
        holdingsCount: accepted.matchingHistoryEntry.holdingsCount,
      },
      ipdReportedStoredInstants: {
        lastUpdated: accepted.firstView.lastUpdated,
        matchingRevisionCommittedAt: accepted.matchingHistoryEntry.createdAt,
        note:
          'Reported by IPD from its stored rows and carried verbatim. These are distinct from the ' +
          'consumer observation timestamps and are not observation times.',
      },
    };
    identity = summarizeHoldingIdentity(holdings);
    consistency = {
      scope: CONSISTENCY_SCOPE,
      consistent: accepted.consistency.consistent,
      checks: accepted.consistency.checks,
      observations: accepted.consistency.observations,
    };
  }

  const caveats: string[] = [];
  if (eligibility === 'NOT_EVIDENCE_SYNTHETIC_TEST_PEER') {
    caveats.push('SYNTHETIC TEST PEER: this run read the repository test fixture. It is a utility test, not evidence.');
  }
  if (eligibility === 'NOT_EVIDENCE_NOT_A_WINDOWS_HOST') {
    caveats.push('NOT A WINDOWS HOST: this run was not made on the Windows host. It is not evidence for W11 dependency 1.');
  }
  if (accepted !== null) {
    for (const observation of accepted.consistency.observations) {
      if (!observation.value) caveats.push(`${observation.id} is false: ${observation.detail}`);
    }
  }

  return {
    schema: SANITIZED_SUMMARY_SCHEMA,
    artifactClass: 'SANITIZED_SUMMARY',
    notice:
      'Sanitized summary only. This is NOT the complete capture evidence and must not be described as such. ' +
      'The exact capture (portfolio contents) is a separate LOCAL-ONLY file that stays on the capturing host.',
    captureId: result.captureId,
    outcome: result.outcome,
    reasonCode: result.reasonCode,
    message: result.message,
    exitCode: result.exitCode,
    evidenceEligibility: eligibility,
    peerAuthenticity:
      'NOT_ATTESTED: the consumer cannot prove which process served the endpoint. That the peer was the ' +
      'operator-run IPD service is a host fact the operator attests separately.',
    consumerObservation: {
      firstReadStartedAtUtc: accepted?.startedAtUtc ?? null,
      finalReadCompletedAtUtc: accepted?.completedAtUtc ?? null,
      note: CONSUMER_CLOCK_NOTE,
    },
    attempts: {
      maxAttempts: result.maxAttempts,
      made: result.attempts.length,
      policy:
        'Only a failed consistency check is repeated, as a whole new sequence. A failed attempt is discarded ' +
        'entirely; reads from different attempts are never combined.',
      perAttempt: result.attempts,
    },
    requestSequence: accepted?.requestSequence ?? null,
    selection: {
      method: accepted?.selectionMethod ?? null,
      listedPortfolioCount: result.listedPortfolioCount,
      operatorSuppliedPortfolioId: result.operatorSuppliedPortfolioId,
      rule: 'Identified from the actual portfolio.list response. No default portfolio id is assumed.',
    },
    portfolio,
    identity,
    consistency,
    caveats,
    configuration: {
      valid: result.configuration.ok,
      problems: result.configuration.problems.map((problem) => ({ setting: problem.setting, code: problem.code })),
      endpoint: result.configuration.endpoint,
    },
    ...buildSection(build, versions),
    ownerContext: {
      ...OWNER_CONTEXT_STATEMENT,
      irrLocalPreconditionAffirmed: !result.configuration.problems.some(
        (problem) => problem.code === 'BINDING_PRECONDITION_NOT_AFFIRMED',
      ),
    },
    exactCapture: {
      location: 'LOCAL_ONLY_NOT_PUBLISHED',
      written: exact.written,
      fileName: exact.fileName,
      sha256: exact.sha256,
      bytes: exact.bytes,
      note: 'The SHA-256 binds this summary to the local exact capture file without disclosing its contents.',
    },
    readOnly: {
      operationsSent: 'portfolio.list, portfolio.get, portfolio.revisions only',
      statement:
        'No write operation was sent. The utility did not start, stop, configure or migrate IPD and opened no database.',
    },
    limitations: [
      'Windows named-pipe behaviour and ACLs are host facts; the existing IRR client verifies only the POSIX path in CI.',
      'The capture proves read consistency over the observation window, not atomicity.',
      'The service build is not attested on the wire; host-observed build facts are labelled as such.',
      'The response does not identify the IPD owner binding.',
    ],
  };
}

/** SHA-256 of the exact bytes written for the LOCAL-ONLY capture file. */
export function sha256Hex(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex');
}
