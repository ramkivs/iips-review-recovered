/** Browser-side projection and HTTP transport for IPD's published Stage 4 IPC contract.
 * The browser never sends an owner or a canonical identity. IPD repeats qualification
 * and authorization independently after IRR forwards the request over same-host IPC.
 *
 * IPD PR #177/#178 additively wire the daily-snapshot / partial-acceptance outcome onto this
 * SAME operation (see `server/broker-import/brokerImportStage4.ts` for the full two-generation
 * explanation). This module's ordinary `prepareBrokerImport` / `commitBrokerImport` pair is
 * UNCHANGED for the all-or-nothing request shape; the additive pieces below only ever activate
 * for a request that explicitly opts into the daily-snapshot shape (see
 * `brokerFullSnapshotImport.ts`, which is the only place that sets `fullSnapshot: true`).
 */
import type {
  BrokerIngressResult,
  BrokerImportHolding,
  BrokerImportRequest,
  BrokerImportSuccess,
} from 'iips-production-market-data/portfolio-ui';
// IPD PR #177/#178 additive types, hand-declared locally — see
// `../../server/broker-import/brokerPartialAcceptanceContract.ts` for why these cannot be
// imported from the newly-pinned `iips-broker-import` alias in the same compilation unit as
// `iips-production-market-data` above (a TypeScript Package ID collision between the two
// same-named npm aliases of the same upstream repository at different pinned commits).
import type {
  BrokerImportSuccessWithSnapshot,
  BrokerPartialAcceptanceApproval,
  BrokerPartialAcceptanceSummary,
  BrokerSnapshotReconciliation,
  BrokerSnapshotUnresolvedRow,
} from '../../server/broker-import/brokerPartialAcceptanceContract.js';
import { noAuthFetch } from '../core/network/noAuthFetch';

export type PreparedBrokerImport = Omit<BrokerImportRequest, 'portfolioId' | 'expectedRevision'>;

/** A success result, optionally carrying the additive daily-snapshot fields when present. */
export type Stage4SuccessResult = BrokerImportSuccess & BrokerImportSuccessWithSnapshot;

/**
 * `BrokerImportRequest` (from the pinned `iips-production-market-data` package) extended with
 * the PR #177/#178 additive request fields, all optional: their absence is the unchanged
 * ordinary all-or-nothing shape. `commitBrokerImport` accepts this wider type because a
 * daily-snapshot submission (see `brokerFullSnapshotImport.ts`) legitimately sets `fullSnapshot`/
 * `importId`, and a resubmission after `PARTIAL_ACCEPTANCE_REQUIRED` legitimately attaches
 * `partialAcceptance` — both are shape-checked independently server-side before anything is sent.
 */
export type Stage4Request = BrokerImportRequest & {
  readonly importId?: string;
  readonly fullSnapshot?: boolean;
  readonly partialAcceptance?: BrokerPartialAcceptanceApproval;
};

/**
 * Project the one IPD ingress result already used for preview/evidence. This follows
 * IPD's brokerImportRequestFromIngress selection: no canonical identity claims, no
 * inferred identifiers, and no substitution of filenames, digests or timestamps.
 * The snapshot used for evidence remains unchanged and is never recreated on retry.
 */
export function prepareBrokerImport(result: BrokerIngressResult): PreparedBrokerImport | null {
  if (!result.success || result.disposition !== 'READY_FOR_PORTFOLIO_SAVE'
      || result.identitySummary?.saveable !== true || result.userHoldings.length === 0
      || result.rejections.length !== 0) return null;
  const holdings: BrokerImportHolding[] = result.userHoldings.map(h => ({
    symbol: h.symbol,
    ...(h.isin ? { isin: h.isin } : {}),
    ...(h.exchange ? { exchange: h.exchange } : {}),
    quantity: h.quantity,
    averageBuyPrice: h.averageBuyPrice,
    currentPrice: h.currentPrice,
    marketValue: h.marketValue,
    weightPercentage: h.weightPercentage,
    active: h.active,
    sourceBroker: String(h.sourceBroker),
    lineageDigest: h.lineageDigest,
  }));
  return {
    holdings,
    contentDigest: result.provenance.contentDigest,
    fileName: result.provenance.fileName,
    sourceBroker: String(result.provenance.sourceBroker),
    importedAt: result.provenance.asOf,
    mode: 'MERGE',
  };
}

export type Stage4ClientOutcome =
  | { readonly ok: true; readonly result: Stage4SuccessResult }
  | { readonly ok: false; readonly outcome: string; readonly status: number }
  /**
   * IPD independently re-assessed identity for this daily snapshot, found unresolved rows and
   * wrote NOTHING. `summary` (with its digest) is exactly what the operator must see before an
   * explicit approval can be attached and resubmitted. Distinct from `ok: false`: this is not a
   * refusal, it is a required confirmation step.
   */
  | { readonly ok: 'partial-acceptance-required'; readonly summary: BrokerPartialAcceptanceSummary; readonly status: number };

function isReconciliationShape(value: unknown): value is BrokerSnapshotReconciliation {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  for (const key of ['observed', 'exitedZeroQuantity', 'carriedForwardAbsent', 'unresolved']) {
    if (!Number.isSafeInteger(r[key]) || (r[key] as number) < 0) return false;
  }
  if (typeof r.stale !== 'boolean' || typeof r.complete !== 'boolean') return false;
  if (typeof r.totalMarketValue !== 'number' || !Number.isFinite(r.totalMarketValue)) return false;
  return Array.isArray(r.absent);
}

/** Never trust the HTTP body unchecked, including the PR #177/#178 additive success fields. */
function isSuccess(value: unknown): value is Stage4SuccessResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  if (r.ok !== true || !['SAVED_NEW_BATCH', 'MERGED_INTO_EXISTING', 'ALREADY_IMPORTED_NO_OP'].includes(String(r.disposition))
      || !Number.isSafeInteger(r.revision) || (r.revision as number) < 1
      || !Number.isSafeInteger(r.holdingsPersisted) || (r.holdingsPersisted as number) < 0
      || !Number.isSafeInteger(r.contributions) || (r.contributions as number) < 0
      || typeof r.totalMarketValue !== 'number' || !Number.isFinite(r.totalMarketValue)
      || typeof r.message !== 'string' || typeof r.noOp !== 'boolean') return false;
  if (r.noOp !== (r.disposition === 'ALREADY_IMPORTED_NO_OP')
      || r.storeEffect !== (r.noOp ? 'NONE' : 'REVISION_COMMITTED')
      || (!r.noOp && (r.holdingsPersisted as number) === 0)) return false;
  // PR #177/#178 additive success fields: present only for a daily-snapshot success. Shape is
  // checked when present; their absence is the unchanged ordinary success shape.
  if (r.snapshotState !== undefined && r.snapshotState !== 'ACCEPTED' && r.snapshotState !== 'PARTIALLY_ACCEPTED') return false;
  if (r.unresolvedCount !== undefined && (!Number.isSafeInteger(r.unresolvedCount) || (r.unresolvedCount as number) < 0)) return false;
  if (r.reconciliation !== undefined && !isReconciliationShape(r.reconciliation)) return false;
  if (r.snapshotState === 'PARTIALLY_ACCEPTED' && !((r.unresolvedCount as number) > 0)) return false;
  return true;
}

const DIGEST = /^[a-f0-9]{64}$/;

function isUnresolvedRow(value: unknown): value is BrokerSnapshotUnresolvedRow {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  return typeof r.symbol === 'string' && r.symbol.length > 0
    && typeof r.quantity === 'number' && Number.isFinite(r.quantity)
    && typeof r.averageBuyPrice === 'number' && Number.isFinite(r.averageBuyPrice)
    && typeof r.currentPrice === 'number' && Number.isFinite(r.currentPrice)
    && typeof r.marketValue === 'number' && Number.isFinite(r.marketValue)
    && typeof r.sourceBroker === 'string' && r.sourceBroker.length > 0
    && typeof r.lineageDigest === 'string' && r.lineageDigest.length > 0
    && typeof r.reason === 'string' && r.reason.length > 0;
}

/** Never trust the HTTP body unchecked: validate the published summary shape, including its digest. */
function isPartialAcceptanceSummary(value: unknown): value is BrokerPartialAcceptanceSummary {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  if (typeof r.importId !== 'string' || r.importId.length === 0) return false;
  for (const key of ['totalRows', 'resolvedCount', 'unresolvedCount']) {
    if (!Number.isSafeInteger(r[key]) || (r[key] as number) < 0) return false;
  }
  if (typeof r.resolvedMarketValue !== 'number' || !Number.isFinite(r.resolvedMarketValue)) return false;
  if (!Array.isArray(r.refusedHoldings) || !r.refusedHoldings.every(isUnresolvedRow)) return false;
  if ((r.refusedHoldings as unknown[]).length !== r.unresolvedCount) return false;
  if (!Array.isArray(r.duplicateSymbols) || !r.duplicateSymbols.every((d: unknown) =>
    !!d && typeof d === 'object' && typeof (d as Record<string, unknown>).symbol === 'string'
    && Number.isSafeInteger((d as Record<string, unknown>).occurrences))) return false;
  return typeof r.summaryDigest === 'string' && DIGEST.test(r.summaryDigest);
}

/**
 * Builds the explicit approval the operator must give to persist a partially-resolvable daily
 * snapshot. The approval is bound to the EXACT `summaryDigest` IPD computed and returned in
 * `PARTIAL_ACCEPTANCE_REQUIRED` — never a digest IRR computes itself, since the approval must
 * bind to the authoritative summary the operator was actually shown. `approvedBy` is a local,
 * non-authoritative display label: it confers no identity or authority, and IPD independently
 * resolves the actual owner from its own binding regardless of its value.
 */
export function buildPartialAcceptanceApproval(
  summary: BrokerPartialAcceptanceSummary,
  approvedBy: string,
  approvedAt: string = new Date().toISOString(),
): BrokerPartialAcceptanceApproval {
  return { approved: true, approvedAt, approvedBy, summaryDigest: summary.summaryDigest };
}

/** One POST, no automatic retry. A lost or malformed acknowledgement stays unknown. */
export async function commitBrokerImport(request: Stage4Request): Promise<Stage4ClientOutcome> {
  const { portfolioId, ...body } = request;
  let response: Response;
  try {
    response = await noAuthFetch(`/api/broker-import/${encodeURIComponent(portfolioId)}/holdings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, outcome: 'OUTCOME_UNKNOWN', status: 0 };
  }
  let parsed: unknown;
  try { parsed = await response.json(); } catch { parsed = null; }
  if (response.status === 200) {
    return isSuccess(parsed)
      ? { ok: true, result: parsed }
      : { ok: false, outcome: 'OUTCOME_UNKNOWN', status: 200 };
  }
  if (response.status === 428) {
    const data = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
    if (data?.outcome === 'PARTIAL_ACCEPTANCE_REQUIRED' && isPartialAcceptanceSummary(data.summary)) {
      return { ok: 'partial-acceptance-required', summary: data.summary, status: 428 };
    }
    return { ok: false, outcome: 'OUTCOME_UNKNOWN', status: 428 };
  }
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const data = parsed as Record<string, unknown>;
    if (typeof data.outcome === 'string') return { ok: false, outcome: data.outcome, status: response.status };
    if (data.error === 'owner-context-unavailable') return { ok: false, outcome: 'OWNER_CONTEXT_UNAVAILABLE', status: response.status };
    if (data.error === 'cross-site-request-refused') return { ok: false, outcome: 'REQUEST_REFUSED', status: response.status };
  }
  // A proxy/server failure after dispatch does not establish whether the write landed.
  return { ok: false, outcome: 'OUTCOME_UNKNOWN', status: response.status };
}
