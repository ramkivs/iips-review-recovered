/**
 * W-24 — IRR trace correlation and bounded diagnostic ring (D-7 §4.5–§4.10).
 *
 * One action, one identifier:
 *   IRR mints a lowercase UUIDv4 `actionId` at the application boundary, passes it to IPD's
 *   own client as the approved `X-IIPS-Trace-Version` / `X-IIPS-Action-Id` headers, and
 *   correlates the same value across IRR's ring, IPD's ring and D01 quote provenance.
 *
 * This module is SERVER-SIDE ONLY. It never imports a browser module, never reads a credential
 * value, never inspects secret material for identifiers, and never writes a trace header to
 * a log line. The ring is process-lifetime memory only: 512 events, oldest-first eviction,
 * monotonic sequence, 1 KiB ceiling, no persistence and no external sink. The ring
 * implementation and the event validator are IPD's own published W-24 contract, instantiated
 * with IRR's approved capacity; IRR does not maintain a second event schema.
 */

import {
  DhanDiagnosticRing,
  TRACE_HEADER_ACTION,
  TRACE_HEADER_VERSION,
  TRACE_VERSION_VALUE,
  W24_EVENT_SCHEMA_VERSION,
  W24_MAX_EVENT_BYTES,
  W24_RING_CAPACITY_IPD,
  W24_RING_CAPACITY_IRR,
  W24_TRACE_CONTRACT_VERSION,
  generateTraceId,
  isLowercaseUuidV4,
  mapDhanFailureToW24Category,
  validateDhanDiagnosticEvent,
} from 'iips-production-market-data/dhan-server';
import {
  readIpdTraceRing,
  type IpdMarketDataTransportConfig,
  type IpdTraceContext,
  type IpdTraceRingOptions,
} from './dhanMarketDataTransport';

/** The shared W-24 event, derived from IPD's published ring rather than restated. */
export type IrrW24Event = ReturnType<DhanDiagnosticRing['list']>[number];
export type IrrW24EventInput = Parameters<DhanDiagnosticRing['record']>[0];
export type IrrW24Stats = ReturnType<DhanDiagnosticRing['getStats']>;
export type IrrW24FailureCategory = NonNullable<IrrW24EventInput['failureCategory']>;

/**
 * The owner-approved closed failure enum, mirrored here so an already-categorical value is
 * never passed through IPD's raw-code mapper (which would wrongly turn `PROVIDER_ERROR` into
 * `INTERNAL_ERROR`). Unknown raw codes still go through IPD's mapper, whose unknown result is
 * the approved `INTERNAL_ERROR`.
 */
export const IRR_W24_FAILURE_CATEGORIES: readonly IrrW24FailureCategory[] = [
  'VALIDATION_ERROR',
  'AUTHENTICATION_FAILED',
  'AUTHORIZATION_FAILED',
  'CONFIGURATION_ERROR',
  'READINESS_FAILED',
  'IDENTITY_REJECTED',
  'RATE_LIMITED',
  'CACHE_ERROR',
  'TRANSPORT_ERROR',
  'PROVIDER_ERROR',
  'TIMEOUT',
  'CONTRACT_MISMATCH',
  'INTERNAL_ERROR',
] as const;

const IRR_W24_FAILURE_CATEGORY_SET: ReadonlySet<string> = new Set(IRR_W24_FAILURE_CATEGORIES);

function normaliseFailureCategory(value: string | null | undefined): IrrW24FailureCategory | null {
  if (value == null) return null;
  return IRR_W24_FAILURE_CATEGORY_SET.has(value)
    ? (value as IrrW24FailureCategory)
    : mapDhanFailureToW24Category(value);
}

/** Server-side correlation view attached to a consumption entry. Never sent to the browser. */
export interface IrrActionTrace {
  /** The IRR-minted action id that spans IRR, IPD and D01. */
  readonly actionId: string;
  /** D01 `provenance.traceId` for a served quote; null for a failed operation. */
  readonly d01TraceId: string | null;
  /** D01 `provenance.correlationId` (original producer action) when IPD published one. */
  readonly d01CorrelationId: string | null;
  /** Distinct IPD work ids from ring events carrying this action id. */
  readonly ipdWorkIds: readonly string[];
  /** Distinct IPD attempt ids from ring events carrying this action id. */
  readonly ipdAttemptIds: readonly string[];
  /** First closed failure category found on a matching IPD event, if any. */
  readonly ipdFailureCategory: IrrW24FailureCategory | null;
  /** Deterministic failure code when the supplementary IPD ring read could not be made. */
  readonly ringReadFailureCode: string | null;
  /** True only when every published identifier that exists agrees with `actionId`. */
  readonly identifierConsistent: boolean;
}

/** The single IRR ring instance for this process. */
const IRR_RING = new DhanDiagnosticRing(W24_RING_CAPACITY_IRR);

/** Read-only access to the IRR ring, for the authenticated operator reader. */
export function getIrrDiagnosticRing(): DhanDiagnosticRing {
  return IRR_RING;
}

/** Test-only reset. Never called from a request path. */
export function clearIrrDiagnosticRingForTest(): void {
  IRR_RING.clearForTest();
}

/** Mints a fresh lowercase UUIDv4 action context using IPD's published generator. */
export function createIrrActionContext(): IpdTraceContext {
  return { traceVersion: TRACE_VERSION_VALUE, actionId: generateTraceId() };
}

/** Validates an untrusted action context before it can occupy an event or a request. */
export function isIrrActionContext(value: unknown): value is IpdTraceContext {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as { traceVersion?: unknown; actionId?: unknown };
  return candidate.traceVersion === TRACE_VERSION_VALUE && isLowercaseUuidV4(candidate.actionId);
}

/** Builds the approved wire headers. Never logs or returns a credential. */
export function buildIrrTraceHeaders(context: IpdTraceContext): Record<string, string> {
  return {
    [TRACE_HEADER_VERSION]: context.traceVersion,
    [TRACE_HEADER_ACTION]: context.actionId,
  };
}

/** Re-exports IPD's fail-closed validator for the operator-reader boundary. */
export function validateIrrDiagnosticEvent(input: unknown): IrrW24Event | null {
  return validateDhanDiagnosticEvent(input);
}

/**
 * Records an IRR-side event in the bounded ring.
 *
 * IPD owns `workId` and `attemptId`. Before IPD has allocated them, IRR does not invent a
 * fourth identifier: the action id occupies those two slots. Correlation with IPD is always
 * on `actionId`; the IPD-assigned values are filled from IPD's ring by `correlateIrrAction`.
 */
export function recordIrrEvent(input: {
  readonly operation: IrrW24EventInput['operation'];
  readonly event: IrrW24EventInput['event'];
  readonly actionId: string;
  readonly outcome: IrrW24EventInput['outcome'];
  readonly failureCategory?: string | null;
  readonly durationMs: number;
  readonly workId?: string;
  readonly attemptId?: string;
}): IrrW24Event | null {
  if (!isLowercaseUuidV4(input.actionId)) return null;
  const workId = input.workId ?? input.actionId;
  const attemptId = input.attemptId ?? input.actionId;
  if (!isLowercaseUuidV4(workId) || !isLowercaseUuidV4(attemptId)) return null;
  return IRR_RING.record({
    schemaVersion: W24_EVENT_SCHEMA_VERSION,
    timestampUtc: new Date().toISOString(),
    component: 'IRR',
    operation: input.operation,
    event: input.event,
    actionId: input.actionId,
    workId,
    attemptId,
    outcome: input.outcome,
    failureCategory: normaliseFailureCategory(input.failureCategory),
    durationMs: input.durationMs,
  });
}

/** Snapshot of the IRR ring through IPD's bounded, read-only list operation. */
export function readIrrTraceRing(options?: IpdTraceRingOptions): {
  readonly events: readonly IrrW24Event[];
  readonly stats: IrrW24Stats;
} {
  return { events: IRR_RING.list(options), stats: IRR_RING.getStats() };
}

/** Reads only the IPD ring events belonging to one action id. Supplementary and fail-closed. */
export async function readIpdTraceEventsForAction(
  config: IpdMarketDataTransportConfig,
  actionId: string,
  fetchImpl?: typeof fetch,
): Promise<
  | { readonly ok: true; readonly events: readonly IrrW24Event[]; readonly stats: IrrW24Stats }
  | { readonly ok: false; readonly code: string; readonly message: string }
> {
  if (!isLowercaseUuidV4(actionId)) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'invalid action identifier' };
  }
  const outcome = await readIpdTraceRing(config, {}, fetchImpl);
  if (!outcome.ok) {
    return { ok: false, code: outcome.failure.code, message: outcome.failure.message };
  }
  return {
    ok: true,
    events: outcome.events.filter((event) => event.actionId === actionId),
    stats: outcome.stats,
  };
}

/** Correlates IRR, IPD and D01 evidence for one action id. Pure; no network, no state change. */
export function correlateIrrAction(input: {
  readonly actionId: string;
  readonly d01TraceId?: string | null;
  readonly d01CorrelationId?: string | null;
  readonly ipdEvents?: readonly IrrW24Event[];
  readonly ringReadFailureCode?: string | null;
}): IrrActionTrace {
  const { actionId } = input;
  const events = input.ipdEvents ?? [];
  const workIds = new Set<string>();
  const attemptIds = new Set<string>();
  let failureCategory: IrrW24FailureCategory | null = null;
  for (const event of events) {
    if (event.actionId !== actionId) continue;
    workIds.add(event.workId);
    attemptIds.add(event.attemptId);
    if (failureCategory === null && event.failureCategory !== null) {
      failureCategory = event.failureCategory;
    }
  }
  const traceAgrees = input.d01TraceId == null || input.d01TraceId === actionId;
  const correlationValid =
    input.d01CorrelationId == null || isLowercaseUuidV4(input.d01CorrelationId);
  return {
    actionId,
    d01TraceId: input.d01TraceId ?? null,
    d01CorrelationId: input.d01CorrelationId ?? null,
    ipdWorkIds: [...workIds],
    ipdAttemptIds: [...attemptIds],
    ipdFailureCategory: failureCategory,
    ringReadFailureCode: input.ringReadFailureCode ?? null,
    identifierConsistent: traceAgrees && correlationValid && events.every((e) => e.actionId === actionId),
  };
}

/** Published contract constants, re-exported so IRR consumers address one authority. */
export const IRR_W24_CONTRACT = Object.freeze({
  contractVersion: W24_TRACE_CONTRACT_VERSION,
  eventSchemaVersion: W24_EVENT_SCHEMA_VERSION,
  irrRingCapacity: W24_RING_CAPACITY_IRR,
  ipdRingCapacity: W24_RING_CAPACITY_IPD,
  maxEventBytes: W24_MAX_EVENT_BYTES,
  traceHeaderVersion: TRACE_HEADER_VERSION,
  traceHeaderAction: TRACE_HEADER_ACTION,
  traceVersionValue: TRACE_VERSION_VALUE,
});
