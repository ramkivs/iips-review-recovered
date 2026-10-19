/**
 * G-3 IPC adapter onto the existing `UserPortfolioPort` contract (IRR side).
 *
 * Authority: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §5.1 item 3,
 * implementing accepted wire contract v1 and the IRR conformance set IRR-1…IRR-7
 * (fence first). Its test file also carries the C9 first-party-signal assertions
 * allocated by §5.4.
 *
 * THE FOUR PROPERTIES THIS ADAPTER MUST HAVE
 *   1. **Class P → zero bytes / close.** A pre-authorization refusal arrives as no
 *      bytes at all and a closed connection. It is mapped to a typed `G2Error` with
 *      **no reason invented**: IPD records the Class P reason only in its own bounded
 *      local sink, so IRR genuinely does not know which one applied (C6).
 *   2. **Class A → typed refusal.** Each post-authorization outcome maps onto the
 *      existing closed `G2FailureReason` vocabulary. No new member is invented,
 *      because that would change a frozen export (§5.2).
 *   3. **No mutation on refusal.** This adapter holds **no state at all** — no cache
 *      of record, no last-known portfolio, no retry counter, no pending-write queue.
 *      A refusal therefore cannot leave anything behind, because there is nothing to
 *      leave it in.
 *   4. **No fallback surface.** There is no session store behind it, no HTTP path, no
 *      default portfolio and no second store. When the IPC call does not succeed, the
 *      operation fails; it is not served from somewhere else.
 *
 * THE SCOPE PARAMETER IS ACCEPTED AND NEVER TRANSMITTED
 *   `UserPortfolioPort` requires a `G2Scope` on every call. That scope carries a
 *   `tenantHint`, and a tenant hint is IRR-local and **never** crosses the wire
 *   (contract v1 OC-3; G2-D4). This adapter therefore reads no field of `scope` onto
 *   the payload, and `assertHintNotOnWire` plus `encodeRequestFrame`'s C7 scan make
 *   transmission structurally impossible. Ownership is IPD's to resolve, per request,
 *   from its own single `ACTIVE` A-2 binding (OC-2).
 *
 * WRITES
 *   `createPortfolio`, `saveHoldings`, `resetPortfolio` and `deletePortfolio` are
 *   mapped and callable at the type level, but IPD refuses every one with zero store
 *   effect while the W-1 conjunction is unmet (§7). Nothing here authorizes a write.
 *   A write that times out is reported as **outcome-unknown** and is **never**
 *   retried, because resending could duplicate a commit that in fact landed.
 *
 * THE ROUTES STILL RETURN 503
 *   This adapter is not wired into any HTTP surface by this act. Every
 *   `/api/user-portfolios*` route still returns `503 owner-context-unavailable`
 *   without constructing a port (§5.6; `user-portfolio-transport.ts` and
 *   `owner-context-unavailable.ts` are byte-stable). Constructing this adapter
 *   admits nothing.
 */
import {
  G2Error,
  G2_UNRESOLVED_WRITE_MESSAGE,
  type G2DeleteResult,
  type G2FailureReason,
  type G2HoldingInput,
  type G2PortfolioSummary,
  type G2PortfolioView,
  type G2RevisionEntry,
  type G2SaveResult,
} from './userPortfolioContract.js';
import type {
  G2CreateParams,
  G2LifecycleParams,
  G2ListParams,
  G2ReadParams,
  G2SaveParams,
  UserPortfolioPort,
} from './userPortfolioPort.js';
import {
  assertHintNotOnWire,
  isOwnerContextEstablished,
  ownerContextFromBinding,
  readBindingPrecondition,
  type BindingPrecondition,
  type OwnerContext,
} from './ownerContextFromBinding.js';
import {
  callIpc,
  resolveIpcEndpoint,
  type IpcCallResult,
  type IpcClassAOutcome,
  type IpcEndpointTarget,
  type IpcOperation,
} from './ipcClient.js';

/* ------------------------------------------------------------------ *
 * Outcome mapping — Class A / Class P onto the frozen G2 vocabulary
 * ------------------------------------------------------------------ */

/**
 * Maps a Class A outcome onto the **existing** `G2FailureReason` union.
 *
 * `WRITE_NOT_AUTHORIZED` has no member in that frozen union, so it maps to
 * `UPSTREAM_UNAVAILABLE` — the least-disclosing available reason — exactly as IPD
 * maps it to `UNAVAILABLE` on its own frozen port union. Inventing a new reason
 * would change a frozen export, which §5.2 prohibits.
 */
export function mapClassAToG2Reason(outcome: IpcClassAOutcome): G2FailureReason {
  switch (outcome) {
    case 'RESOURCE_UNAVAILABLE':
      // Missing ≡ foreign ≡ tenant-mismatched ≡ tombstoned, all hidden (W-15).
      return 'NOT_FOUND';
    case 'INVALID_REQUEST':
      return 'INVALID_REQUEST';
    case 'REVISION_CONFLICT':
      return 'REVISION_CONFLICT';
    case 'REFUSED_UNRESOLVED_IDENTITY':
      // DP-2 Option 2F: IRR's existing vocabulary for an unresolved-identity save.
      return 'SAVE_GUARD_VIOLATION';
    case 'REFUSED_STORE_GUARD':
      return 'SAVE_GUARD_VIOLATION';
    case 'WRITE_NOT_AUTHORIZED':
      return 'UPSTREAM_UNAVAILABLE';
    case 'UNAVAILABLE':
      return 'UPSTREAM_UNAVAILABLE';
    default:
      // Fail closed on an outcome outside the contract vocabulary.
      return 'UPSTREAM_UNAVAILABLE';
  }
}

/** Class P and transport faults are indistinguishable from IRR's side, by design. */
export function mapClassPToG2Reason(): G2FailureReason {
  return 'UPSTREAM_UNAVAILABLE';
}

/** A non-disclosing message for a Class P refusal. Names no reason, no owner. */
export function classPMessage(): string {
  return 'The upstream refused the request before authorization and disclosed no reason.';
}

/** A non-disclosing message for an outcome-unknown call. Never claims a result. */
export function outcomeUnknownMessage(write: boolean, reason: 'TIMEOUT' | 'TRANSPORT_FAULT'): string {
  const what = reason === 'TIMEOUT' ? 'timed out' : 'could not be completed';
  return write
    ? `The write ${what}; its outcome is UNKNOWN and it was not retried.`
    : `The request ${what}; no result was observed and it was not retried.`;
}

/* ------------------------------------------------------------------ *
 * The v1 → G2 envelope gap (fail closed; nothing is fabricated)
 * ------------------------------------------------------------------ */

/**
 * Fields the frozen G2 result types require that accepted wire contract v1 does not
 * supply.
 *
 * This is a **genuine cross-repository reconciliation item**, recorded here rather
 * than papered over. IRR's `G2PortfolioSummary`, `G2RevisionEntry` and
 * `G2PortfolioView` describe the former G24 **HTTP** envelope; contract v1 §6 fixes
 * narrower result shapes for the IPC path. §5.2 forbids changing any existing IRR
 * type or interface, and fabricating a value IRR never received would violate the
 * platform's no-fabricated-values principle, so the adapter **refuses** instead.
 *
 * The refusal uses `UPSTREAM_UNAVAILABLE`, whose own frozen definition already
 * covers a "contract-envelope violation".
 *
 * Consequence today: none observable. No binding is provisioned (Gate A′ is NOT
 * EXECUTED), so every call is refused Class P before mapping is reached; and every
 * `/api/user-portfolios*` route is `503`-fenced and never constructs a port. The gap
 * must nonetheless be closed by a future act — either by extending the v1 result
 * shapes IPD-side, or by an additive Gate 5-era revision of the IRR types — before
 * any route is admitted.
 */
export const V1_TO_G2_ENVELOPE_GAP = Object.freeze({
  portfolioSummary: Object.freeze({
    missingFromV1: Object.freeze(['weightSumPercentage', 'provenanceDigest', 'isSaved'] as const),
    renamedInV1: Object.freeze({ holdingsCount: 'totalHoldingsCount' } as const),
  }),
  revisionEntry: Object.freeze({
    missingFromV1: Object.freeze(['totalMarketValue', 'provenanceDigest', 'holdingsCount'] as const),
    renamedInV1: Object.freeze({ committedAt: 'createdAt' } as const),
  }),
  portfolioView: Object.freeze({
    missingFromV1: Object.freeze(['isSaved'] as const),
    renamedInV1: Object.freeze({ holdingsCount: 'totalHoldingsCount' } as const),
  }),
} as const);

/** Thrown when a v1 result cannot be mapped without fabricating a field. */
export function envelopeGapError(shape: string, missing: readonly string[]): G2Error {
  return new G2Error(
    'UPSTREAM_UNAVAILABLE',
    `The wire contract v1 ${shape} result does not supply ${missing.join(', ')}; ` +
      'refusing rather than fabricating a value (contract-envelope violation).',
  );
}

/* ------------------------------------------------------------------ *
 * The adapter
 * ------------------------------------------------------------------ */

export interface IpcPortAdapterOptions {
  /** Overrides the endpoint target (tests only). Read per call otherwise (OC-5). */
  readonly target?: IpcEndpointTarget;
  /** Overrides the timeout (tests only). */
  readonly timeoutMs?: number;
  /** Overrides the IRR-local binding precondition (tests only). */
  readonly precondition?: BindingPrecondition;
  /** Injects the transport (tests only). Defaults to `callIpc`. */
  readonly transport?: (op: IpcOperation, payload?: Record<string, unknown>) => Promise<IpcCallResult>;
}

/**
 * `UserPortfolioPort` over the same-host IPC boundary.
 *
 * Holds **no** mutable state: every call reads its configuration fresh, opens one
 * connection, and returns or throws. There is no cache of record to invalidate, no
 * partial result to resume and nothing for a refusal to mutate.
 */
export class IpcUserPortfolioPort implements UserPortfolioPort {
  /**
   * Constant `false`. This adapter is not a durable store of record and caches
   * nothing; the declaration exists so a consumer cannot mistake it for one.
   */
  public readonly cachesRecord: false = false;

  /** Constant `false`: there is no session, HTTP or default-portfolio fallback. */
  public readonly hasFallbackSurface: false = false;

  constructor(private readonly options: IpcPortAdapterOptions = {}) {}

  /* ---------------- reads ---------------- */

  public async listPortfolios(params: G2ListParams): Promise<readonly G2PortfolioSummary[]> {
    this.assertScopeNotTransmitted(params.scope, undefined);
    const result = await this.call('portfolio.list', undefined, params.scope);
    const value = this.requireSuccess(result, 'portfolio.list');
    // Contract v1 returns an array of `PortfolioSummary`.
    const rows = Array.isArray(value) ? value : null;
    if (rows === null) throw envelopeGapError('portfolio.list', ['an array result']);
    // Each row must still be mapped onto the frozen G2 shape, which v1 does not fill.
    return rows.map((row) => this.toG2Summary(row));
  }

  public async getPortfolio(params: G2ReadParams): Promise<G2PortfolioView> {
    const payload = { portfolioId: params.portfolioId };
    this.assertScopeNotTransmitted(params.scope, payload);
    const result = await this.call('portfolio.get', payload, params.scope);
    return this.toG2View(this.requireSuccess(result, 'portfolio.get'));
  }

  public async revisionHistory(params: G2ReadParams): Promise<readonly G2RevisionEntry[]> {
    const payload = { portfolioId: params.portfolioId };
    this.assertScopeNotTransmitted(params.scope, payload);
    const result = await this.call('portfolio.revisions', payload, params.scope);
    const value = this.requireSuccess(result, 'portfolio.revisions');
    const rows = Array.isArray(value) ? value : null;
    if (rows === null) throw envelopeGapError('portfolio.revisions', ['an array result']);
    return rows.map((row) => this.toG2RevisionEntry(row));
  }

  /* ---------------- writes (refused upstream by W-1) ---------------- */

  public async createPortfolio(params: G2CreateParams): Promise<G2PortfolioView> {
    const payload: Record<string, unknown> = {};
    if (params.portfolioName !== undefined) payload.portfolioName = params.portfolioName;
    this.assertScopeNotTransmitted(params.scope, payload);
    const result = await this.call('portfolio.create', payload, params.scope);
    return this.toG2View(this.requireSuccess(result, 'portfolio.create'));
  }

  public async saveHoldings(params: G2SaveParams): Promise<G2SaveResult> {
    const payload: Record<string, unknown> = {
      portfolioId: params.portfolioId,
      // Wire holdings carry broker-observed fields only. `companyId`,
      // `identityStatus` and `resolutionDisposition` are stripped: canonical
      // identity is resolved IPD-side (Gate E W-6) and asserting it is refused C7.
      holdings: params.holdings.map((holding) => toWireHolding(holding)),
    };
    if (params.expectedRevision !== undefined) payload.expectedRevision = params.expectedRevision;
    if (params.options !== undefined) {
      const options: Record<string, unknown> = {};
      if (params.options.mode !== undefined) options.mode = params.options.mode;
      if (params.options.contentDigest !== undefined) options.contentDigest = params.options.contentDigest;
      if (params.options.fileName !== undefined) options.fileName = params.options.fileName;
      if (params.options.sourceBroker !== undefined) options.sourceBroker = params.options.sourceBroker;
      // `lineageDigest` is IPD-derived; it is not asserted from IRR.
      payload.options = options;
    }
    this.assertScopeNotTransmitted(params.scope, payload);
    const result = await this.call('portfolio.save', payload, params.scope);
    // A refusal is mapped and thrown here; only a success reaches the gap below.
    this.requireSuccess(result, 'portfolio.save');
    // `G2SaveResult` requires the full portfolio view plus per-save counters that
    // v1's save result (`disposition, revision, durability, durable`) does not carry.
    // Refuse rather than fabricate.
    throw envelopeGapError('portfolio.save', [
      'isSaved',
      'holdingsSavedCount',
      'totalMarketValue',
      'weightSumPercentage',
      'savedAt',
      'provenanceDigest',
      'portfolio',
    ]);
  }

  public async resetPortfolio(params: G2LifecycleParams): Promise<G2PortfolioView> {
    const payload: Record<string, unknown> = { portfolioId: params.portfolioId };
    if (params.expectedRevision !== undefined) payload.expectedRevision = params.expectedRevision;
    this.assertScopeNotTransmitted(params.scope, payload);
    const result = await this.call('portfolio.reset', payload, params.scope);
    return this.toG2View(this.requireSuccess(result, 'portfolio.reset'));
  }

  public async deletePortfolio(params: G2LifecycleParams): Promise<G2DeleteResult> {
    const payload: Record<string, unknown> = { portfolioId: params.portfolioId };
    if (params.expectedRevision !== undefined) payload.expectedRevision = params.expectedRevision;
    this.assertScopeNotTransmitted(params.scope, payload);
    const result = await this.call('portfolio.delete', payload, params.scope);
    const value = this.requireSuccess(result, 'portfolio.delete');
    return this.toG2DeleteResult(value);
  }

  /* ---------------- internals ---------------- */

  /**
   * Proves the scope never reaches the wire.
   *
   * `UserPortfolioPort` requires a `G2Scope` on every call, and a scope *is* a
   * tenant hint — so the invariant cannot be "the scope contains no hint". It is
   * that **nothing from the scope is transmitted**. Two independent checks:
   *
   *   1. `assertHintNotOnWire` over the payload actually built, at any depth; and
   *   2. no *value* of the scope appears anywhere in the serialized payload, which
   *      catches a spread or a copy that used a different key name.
   *
   * `encodeRequestFrame` then refuses any authority key a third time, so a bug in any
   * one layer cannot leak a tenant hint or an owner claim.
   */
  private assertScopeNotTransmitted(
    scope: { readonly tenantHint?: string } | undefined,
    payload: Record<string, unknown> | undefined,
  ): void {
    assertHintNotOnWire(payload);
    const hint = scope?.tenantHint;
    if (typeof hint !== 'string' || hint.length === 0) return;
    const serialized = JSON.stringify(payload ?? {});
    if (serialized.includes(hint)) {
      throw new G2Error(
        'INVALID_REQUEST',
        'The IRR-local tenant hint must never be transmitted; the call was not made.',
      );
    }
  }

  private async call(
    op: IpcOperation,
    payload: Record<string, unknown> | undefined,
    scope: unknown,
  ): Promise<IpcCallResult> {
    // Fail closed before any I/O when IRR's local precondition is not established.
    const context: OwnerContext = ownerContextFromBinding(
      this.options.precondition ?? readBindingPrecondition(),
    );
    if (!isOwnerContextEstablished(context)) {
      throw new G2Error(
        'UPSTREAM_UNAVAILABLE',
        'No owner context is established from a binding; the call was not made.',
      );
    }
    if (payload !== undefined) assertHintNotOnWire(payload);
    void scope;

    const transport = this.options.transport;
    if (transport) return transport(op, payload);

    // Read the endpoint per call (OC-5); never cached.
    const target = this.options.target ?? resolveIpcEndpoint();
    return callIpc(op, payload, {
      target,
      ...(this.options.timeoutMs !== undefined ? { timeoutMs: this.options.timeoutMs } : {}),
    });
  }

  /**
   * Turns a call result into a success value or a typed `G2Error`.
   *
   * Class P, outcome-unknown and Class A all throw. Nothing is mutated on the way
   * out, because this adapter holds nothing to mutate.
   */
  private requireSuccess(result: IpcCallResult, op: IpcOperation): unknown {
    switch (result.kind) {
      case 'SUCCESS':
        return result.frame.result;
      case 'CLASS_A': {
        const outcome = result.frame.outcome;
        const reason = mapClassAToG2Reason(outcome);
        const message =
          outcome === 'REFUSED_UNRESOLVED_IDENTITY'
            ? G2_UNRESOLVED_WRITE_MESSAGE
            : `The upstream refused ${op} with outcome ${outcome}.`;
        throw new G2Error(reason, message);
      }
      case 'CLASS_P':
        // Zero bytes and a close. IRR knows no reason and invents none.
        throw new G2Error(mapClassPToG2Reason(), classPMessage());
      case 'OUTCOME_UNKNOWN':
        throw new G2Error(
          'UPSTREAM_UNAVAILABLE',
          outcomeUnknownMessage(result.write, result.reason),
        );
      default:
        throw new G2Error('UPSTREAM_UNAVAILABLE', `The upstream produced no usable result for ${op}.`);
    }
  }

  /* ---- v1 result → frozen G2 shape (fail closed on any gap) ---- */

  private toG2Summary(row: unknown): G2PortfolioSummary {
    // First distinguish a MALFORMED v1 result from a KNOWN GAP: the shape check
    // proves what v1 did send, so the refusal below names only what it did not.
    const record = asRecord(row);
    requireStrings(record, ['portfolioId', 'portfolioName', 'lastUpdated'], 'portfolio.list');
    requireNumbers(record, ['revision', 'holdingsCount', 'totalMarketValue'], 'portfolio.list');
    // v1's summary carries no weightSumPercentage, provenanceDigest or isSaved, and
    // §5.2 forbids changing the frozen G2 type. Refusing beats fabricating.
    throw envelopeGapError('portfolio.list', V1_TO_G2_ENVELOPE_GAP.portfolioSummary.missingFromV1);
  }

  private toG2RevisionEntry(row: unknown): G2RevisionEntry {
    const record = asRecord(row);
    requireNumbers(record, ['revision'], 'portfolio.revisions');
    requireStrings(record, ['operation', 'committedAt'], 'portfolio.revisions');
    throw envelopeGapError('portfolio.revisions', V1_TO_G2_ENVELOPE_GAP.revisionEntry.missingFromV1);
  }

  private toG2View(value: unknown): G2PortfolioView {
    const record = asRecord(value);
    requireStrings(record, ['portfolioId', 'portfolioName', 'lastUpdated', 'provenanceDigest'], 'portfolio view');
    requireNumbers(record, ['revision', 'totalMarketValue', 'holdingsCount', 'weightSumPercentage'], 'portfolio view');
    requireArrays(record, ['holdings', 'contributions'], 'portfolio view');
    throw envelopeGapError('portfolio view', V1_TO_G2_ENVELOPE_GAP.portfolioView.missingFromV1);
  }

  private toG2DeleteResult(value: unknown): G2DeleteResult {
    const record = asRecord(value);
    requireStrings(record, ['portfolioId', 'deletedAt'], 'portfolio.delete');
    // The delete result maps cleanly: both fields exist in v1.
    return {
      portfolioId: String(record.portfolioId),
      deletedAt: String(record.deletedAt),
    };
  }
}

/* ------------------------------------------------------------------ *
 * Small pure helpers
 * ------------------------------------------------------------------ */

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'The upstream result is not an object (contract-envelope violation).');
  }
  return value as Record<string, unknown>;
}

function requireStrings(record: Record<string, unknown>, keys: readonly string[], shape: string): void {
  for (const key of keys) {
    if (typeof record[key] !== 'string') {
      throw new G2Error(
        'UPSTREAM_UNAVAILABLE',
        `The ${shape} result has no string ${key} (contract-envelope violation).`,
      );
    }
  }
}

function requireNumbers(record: Record<string, unknown>, keys: readonly string[], shape: string): void {
  for (const key of keys) {
    const value = record[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new G2Error(
        'UPSTREAM_UNAVAILABLE',
        `The ${shape} result has no finite number ${key} (contract-envelope violation).`,
      );
    }
  }
}

function requireArrays(record: Record<string, unknown>, keys: readonly string[], shape: string): void {
  for (const key of keys) {
    if (!Array.isArray(record[key])) {
      throw new G2Error(
        'UPSTREAM_UNAVAILABLE',
        `The ${shape} result has no array ${key} (contract-envelope violation).`,
      );
    }
  }
}

/**
 * Strips every canonical-identity and lineage field from a holding before it goes on
 * the wire.
 *
 * IPD resolves canonical identity itself (Gate E W-6); a caller-asserted `companyId`
 * or `identityStatus` is refused Class P (C7). Sending only broker-observed fields
 * makes that refusal unreachable rather than merely handled.
 */
export function toWireHolding(holding: G2HoldingInput): Record<string, unknown> {
  const wire: Record<string, unknown> = {};
  if (holding.symbol !== undefined) wire.symbol = holding.symbol;
  if (holding.isin !== undefined) wire.isin = holding.isin;
  if (holding.exchange !== undefined) wire.exchange = holding.exchange;
  if (holding.quantity !== undefined) wire.quantity = holding.quantity;
  if (holding.averageBuyPrice !== undefined) wire.averageBuyPrice = holding.averageBuyPrice;
  if (holding.currentPrice !== undefined) wire.currentPrice = holding.currentPrice;
  if (holding.marketValue !== undefined) wire.marketValue = holding.marketValue;
  if (holding.active !== undefined) wire.active = holding.active;
  if (holding.sourceBroker !== undefined) wire.sourceBroker = holding.sourceBroker;
  // Deliberately omitted: companyId, identityStatus, resolutionDisposition,
  // lineageDigest, rawIdentifier, weightPercentage (IPD normalizes weights).
  return wire;
}

/**
 * True when a `G2Error` is the adapter's honest report of an upstream refusal rather
 * than a local programming fault. Used by tests to assert no mutation on refusal.
 */
export function isUpstreamRefusal(error: unknown): boolean {
  return error instanceof G2Error;
}
