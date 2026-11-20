/**
 * IRR adapter for IPD PR #148's v1 `portfolio.importBroker` operation.
 *
 * This is transport and untrusted-input validation only. It neither resolves identity
 * nor authorizes or persists holdings: IPD resolves the active binding and runs its
 * existing P04/Stage 4 consumer and independent durable write guard. The legacy
 * `portfolio.save` path remains separately fail-closed.
 *
 * IPD PR #178 pin (MERGED main 12a3d625d0ad603cb0bd9cea46bae314942ee40f; PR head was
 * 9d03a35b4d4d79972c466c2c8e45e8c9270524d4) additively
 * wires the already-accepted PR #177 daily-snapshot / partial-acceptance persistence through
 * this SAME operation. Two payload generations now share `portfolio.importBroker`:
 *
 *   - ORDINARY (unchanged). No `importId`, no `fullSnapshot`, no `partialAcceptance`: IPD's
 *     existing all-or-nothing `persistBrokerImport` decides. Nothing about this shape changes.
 *   - DAILY SNAPSHOT (additive). The request carries `fullSnapshot: true` (and/or `importId`
 *     and/or `partialAcceptance`). IPD independently re-assesses identity for EVERY holding
 *     through its own governed server-side resolver — this adapter never predicts, mirrors or
 *     relies on IRR's client-side identity assessment, and the wire holding shape has no
 *     identity field at all. When some rows are unresolved and no approval is attached, IPD
 *     returns `PARTIAL_ACCEPTANCE_REQUIRED` with the exact summary (and its digest) the
 *     operator must see and approve before anything is written; a resubmission carries that
 *     exact digest back as `partialAcceptance`, which IPD re-verifies against its own
 *     recomputed summary before committing. This adapter validates the SHAPE of these additive
 *     fields only; it confers no authority and verifies no digest itself.
 */
import type {
  BrokerImportHolding,
  BrokerImportOutcome,
  BrokerImportRequest,
  BrokerImportSuccess,
} from 'iips-production-market-data/portfolio-ui';
// IPD PR #177/#178 additive types. `iips-production-market-data` (above) remains pinned at an
// older, separately-governed commit that predates PR #178 and does not export these types; see
// `brokerPartialAcceptanceContract.ts` for why they are hand-declared locally rather than
// imported from the newly-pinned `iips-broker-import` alias (a TypeScript Package ID collision
// between the two same-named aliases, confirmed via `tsc --traceResolution`).
import type {
  BrokerPartialAcceptanceApproval,
  BrokerPartialAcceptanceSummary,
  BrokerSnapshotReconciliation,
  BrokerSnapshotState,
  BrokerSnapshotUnresolvedRow,
} from './brokerPartialAcceptanceContract.js';
import { callIpc, findRefusedWireKeys, type IpcCallResult } from '../user-portfolio/ipcClient.js';

export type BrokerImportStage4Body = Omit<BrokerImportRequest, 'portfolioId'>;

const REQUEST_KEYS = [
  'expectedRevision', 'holdings', 'contentDigest', 'fileName', 'sourceBroker', 'importedAt', 'mode',
  // PR #177/#178 additive daily-snapshot fields.
  'importId', 'fullSnapshot', 'partialAcceptance',
];
const HOLDING_KEYS = [
  'symbol', 'isin', 'exchange', 'series', 'quantity', 'averageBuyPrice', 'currentPrice', 'marketValue',
  'weightPercentage', 'active', 'sourceBroker', 'lineageDigest',
  // PR #177/#178 additive broker-reported daily fields, carried through verbatim.
  'dpQty', 'availableQty', 'profitLoss', 'pnlPercentage',
];
const APPROVAL_KEYS = ['approved', 'approvedAt', 'approvedBy', 'summaryDigest'];
const DIGEST = /^[a-f0-9]{64}$/;
const SYMBOL = /^[A-Za-z0-9][A-Za-z0-9._&-]{0,39}$/;
const PORTFOLIO_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const boundedString = (v: unknown, max: number): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max && !/[\u0000-\u001f\u007f]/.test(v);
const onlyKeys = (v: Record<string, unknown>, allowed: readonly string[]) => Object.keys(v).every(k => allowed.includes(k));
/** `undefined` and explicit `null` both mean "the broker did not report this field". */
const isOptionalFiniteOrNull = (v: unknown): boolean => v === undefined || v === null || (typeof v === 'number' && Number.isFinite(v));

/**
 * Shape-only check of the explicit partial-acceptance approval. `approved` must be the literal
 * `true`, matching the published `BrokerPartialAcceptanceApproval` type — a truthy string is not
 * an approval. This confers no authority: IPD independently re-verifies `summaryDigest` against
 * the summary it recomputes itself before anything commits.
 */
function isApprovalShape(value: unknown): value is BrokerPartialAcceptanceApproval {
  if (!isRecord(value) || !onlyKeys(value, APPROVAL_KEYS)) return false;
  if (value.approved !== true) return false;
  return ['approvedAt', 'approvedBy', 'summaryDigest'].every(k => boundedString(value[k], 256));
}

/** Distinguish the new complete provenance-bearing body from the still-blocked old DTO. */
export function isStage4Body(value: unknown): boolean {
  return isRecord(value) && ('fileName' in value || 'sourceBroker' in value || 'importedAt' in value);
}

/** Strictly validate before any socket is opened; never accept authority or canonical claims. */
export function validateStage4Request(portfolioId: string, value: unknown): BrokerImportRequest | null {
  if (!PORTFOLIO_ID.test(portfolioId) || !isRecord(value) || !onlyKeys(value, REQUEST_KEYS)
      || findRefusedWireKeys(value).length > 0) return null;
  if (!Number.isSafeInteger(value.expectedRevision) || (value.expectedRevision as number) < 0
      || !Array.isArray(value.holdings) || value.holdings.length === 0 || value.holdings.length > 5000
      || typeof value.contentDigest !== 'string' || !DIGEST.test(value.contentDigest)
      || !boundedString(value.fileName, 256) || /[\\/]/.test(value.fileName) || !boundedString(value.sourceBroker, 32)
      || typeof value.importedAt !== 'string' || !Number.isFinite(Date.parse(value.importedAt))
      || new Date(value.importedAt).toISOString() !== value.importedAt
      || (value.mode !== undefined && value.mode !== 'MERGE' && value.mode !== 'REPLACE')
      // PR #177/#178 additive fields: shape only, never authority. A malformed shape is refused
      // here exactly as IPD's own wire validator refuses it, so a shape defect never reaches IPC.
      || (value.importId !== undefined && !boundedString(value.importId, 256))
      || (value.fullSnapshot !== undefined && typeof value.fullSnapshot !== 'boolean')
      || (value.partialAcceptance !== undefined && !isApprovalShape(value.partialAcceptance))) return null;
  for (const raw of value.holdings) {
    if (!isRecord(raw) || !onlyKeys(raw, HOLDING_KEYS)
        || typeof raw.symbol !== 'string' || !SYMBOL.test(raw.symbol)
        || (raw.isin !== undefined && !boundedString(raw.isin, 24))
        || (raw.exchange !== undefined && raw.exchange !== 'NSE' && raw.exchange !== 'BSE')
        || (raw.series !== undefined && !boundedString(raw.series, 16))
        || raw.sourceBroker !== value.sourceBroker
        || typeof raw.lineageDigest !== 'string' || !DIGEST.test(raw.lineageDigest)
        || typeof raw.active !== 'boolean'
        || !isOptionalFiniteOrNull(raw.dpQty) || !isOptionalFiniteOrNull(raw.availableQty)
        || !isOptionalFiniteOrNull(raw.profitLoss) || !isOptionalFiniteOrNull(raw.pnlPercentage)) return null;
    for (const key of ['quantity', 'averageBuyPrice', 'currentPrice', 'marketValue', 'weightPercentage']) {
      if (typeof raw[key] !== 'number' || !Number.isFinite(raw[key]) || (raw[key] as number) < 0) return null;
    }
    if ((raw.quantity as number) <= 0 || (raw.weightPercentage as number) > 100) return null;
  }
  // All keys and their types have been checked; IPD repeats validation and P04 qualification.
  return { portfolioId, ...(value as unknown as BrokerImportStage4Body) };
}

export type Stage4TransportOutcome =
  | { readonly kind: 'SUCCESS'; readonly result: BrokerImportSuccess }
  | { readonly kind: 'REFUSAL'; readonly code: string; readonly refusedCount?: number }
  /** IPD found unresolved rows and wrote nothing; the operator must see and approve `summary`. */
  | { readonly kind: 'PARTIAL_ACCEPTANCE_REQUIRED'; readonly summary: BrokerPartialAcceptanceSummary }
  | { readonly kind: 'CLASS_P' }
  | { readonly kind: 'UNKNOWN' };

const REFUSAL_CODES = [
  'REFUSED_UNRESOLVED_IDENTITY', 'REFUSED_STORE_GUARD', 'WRITE_NOT_AUTHORIZED', 'INVALID_REQUEST',
  'REVISION_CONFLICT', 'RESOURCE_UNAVAILABLE',
  // PR #177/#178 additive daily-snapshot refusal codes.
  'REFUSED_DUPLICATE_ROWS', 'REFUSED_EMPTY_SNAPSHOT', 'REFUSED_INVALID_SOURCE_DIGEST', 'REFUSED_APPROVAL_MISMATCH',
];

/** Strict shape check of the published `BrokerSnapshotUnresolvedRow`. */
function isUnresolvedRowShape(value: unknown): value is BrokerSnapshotUnresolvedRow {
  if (!isRecord(value)) return false;
  return typeof value.symbol === 'string' && value.symbol.length > 0
    && typeof value.quantity === 'number' && Number.isFinite(value.quantity)
    && typeof value.averageBuyPrice === 'number' && Number.isFinite(value.averageBuyPrice)
    && typeof value.currentPrice === 'number' && Number.isFinite(value.currentPrice)
    && typeof value.marketValue === 'number' && Number.isFinite(value.marketValue)
    && typeof value.sourceBroker === 'string' && value.sourceBroker.length > 0
    && typeof value.lineageDigest === 'string' && value.lineageDigest.length > 0
    && typeof value.reason === 'string' && value.reason.length > 0;
}

/** Strict shape check of the published `BrokerPartialAcceptanceSummary`, including its digest. */
function isPartialAcceptanceSummaryShape(value: unknown): value is BrokerPartialAcceptanceSummary {
  if (!isRecord(value)) return false;
  if (typeof value.importId !== 'string' || value.importId.length === 0) return false;
  for (const key of ['totalRows', 'resolvedCount', 'unresolvedCount']) {
    if (!Number.isSafeInteger(value[key]) || (value[key] as number) < 0) return false;
  }
  if (typeof value.resolvedMarketValue !== 'number' || !Number.isFinite(value.resolvedMarketValue)) return false;
  if (!Array.isArray(value.refusedHoldings) || !value.refusedHoldings.every(isUnresolvedRowShape)) return false;
  if (!Array.isArray(value.duplicateSymbols) || !value.duplicateSymbols.every((d: unknown) =>
    isRecord(d) && typeof d.symbol === 'string' && d.symbol.length > 0
    && Number.isSafeInteger(d.occurrences) && (d.occurrences as number) > 0)) return false;
  if (typeof value.summaryDigest !== 'string' || !DIGEST.test(value.summaryDigest)) return false;
  return (value.refusedHoldings as unknown[]).length === value.unresolvedCount;
}

/** Shape check of the published `BrokerSnapshotReconciliation`, present only on a full-snapshot success. */
function isReconciliationShape(value: unknown): value is BrokerSnapshotReconciliation {
  if (!isRecord(value)) return false;
  for (const key of ['observed', 'exitedZeroQuantity', 'carriedForwardAbsent', 'unresolved']) {
    if (!Number.isSafeInteger(value[key]) || (value[key] as number) < 0) return false;
  }
  if (typeof value.stale !== 'boolean' || typeof value.complete !== 'boolean') return false;
  if (typeof value.totalMarketValue !== 'number' || !Number.isFinite(value.totalMarketValue)) return false;
  return Array.isArray(value.absent);
}

/** Validate the published nested outcome, not just the IPC success envelope. */
export function interpretStage4Result(value: unknown): Stage4TransportOutcome {
  if (!isRecord(value)) return { kind: 'UNKNOWN' };
  if (value.ok === 'unknown' && value.code === 'OUTCOME_UNKNOWN' && value.storeEffect === 'OUTCOME_UNKNOWN') return { kind: 'UNKNOWN' };
  if (value.ok === false && value.code === 'PARTIAL_ACCEPTANCE_REQUIRED') {
    if (value.storeEffect !== 'NONE' || !isPartialAcceptanceSummaryShape(value.summary)) return { kind: 'UNKNOWN' };
    return { kind: 'PARTIAL_ACCEPTANCE_REQUIRED', summary: value.summary };
  }
  if (value.ok === false) {
    if (typeof value.code !== 'string' || !REFUSAL_CODES.includes(value.code) || value.storeEffect !== 'NONE' || !Array.isArray(value.refusedHoldings)) return { kind: 'UNKNOWN' };
    return { kind: 'REFUSAL', code: value.code, refusedCount: value.refusedHoldings.length };
  }
  if (value.ok !== true || !['SAVED_NEW_BATCH', 'MERGED_INTO_EXISTING', 'ALREADY_IMPORTED_NO_OP'].includes(String(value.disposition))
      || !Number.isSafeInteger(value.revision) || (value.revision as number) < 1
      || !Number.isSafeInteger(value.holdingsPersisted) || (value.holdingsPersisted as number) < 0
      || !Number.isSafeInteger(value.contributions) || (value.contributions as number) < 0
      || typeof value.totalMarketValue !== 'number' || !Number.isFinite(value.totalMarketValue)
      || typeof value.message !== 'string' || typeof value.noOp !== 'boolean') return { kind: 'UNKNOWN' };
  if (value.noOp !== (value.disposition === 'ALREADY_IMPORTED_NO_OP')
      || value.storeEffect !== (value.noOp ? 'NONE' : 'REVISION_COMMITTED')
      || (!value.noOp && (value.holdingsPersisted as number) === 0)) return { kind: 'UNKNOWN' };
  // PR #177/#178 additive success fields: present only on a daily-snapshot success. Shape is
  // checked when present; their absence (the ordinary path) is unchanged and still SUCCESS.
  if (value.snapshotState !== undefined
      && value.snapshotState !== 'ACCEPTED' as BrokerSnapshotState && value.snapshotState !== 'PARTIALLY_ACCEPTED' as BrokerSnapshotState) return { kind: 'UNKNOWN' };
  if (value.unresolvedCount !== undefined && (!Number.isSafeInteger(value.unresolvedCount) || (value.unresolvedCount as number) < 0)) return { kind: 'UNKNOWN' };
  if (value.reconciliation !== undefined && !isReconciliationShape(value.reconciliation)) return { kind: 'UNKNOWN' };
  if (value.snapshotState === 'PARTIALLY_ACCEPTED' && !((value.unresolvedCount as number) > 0)) return { kind: 'UNKNOWN' };
  return { kind: 'SUCCESS', result: value as unknown as BrokerImportSuccess };
}

/** One real IPC request; a lost or malformed acknowledgement is never retried or called success. */
export async function importBrokerViaIpc(
  request: BrokerImportRequest,
  invoke: typeof callIpc = callIpc,
): Promise<Stage4TransportOutcome> {
  // `satisfies` binds the payload shape to the published contract at compile time.
  const payload: BrokerImportRequest = request;
  const result: IpcCallResult = await invoke('portfolio.importBroker', payload as unknown as Record<string, unknown>, {});
  if (result.kind === 'SUCCESS') {
    if (result.frame.op !== 'portfolio.importBroker') return { kind: 'UNKNOWN' };
    return interpretStage4Result(result.frame.result as BrokerImportOutcome);
  }
  if (result.kind === 'CLASS_A') {
    if (result.frame.op !== 'portfolio.importBroker') return { kind: 'UNKNOWN' };
    return { kind: 'REFUSAL', code: result.frame.outcome };
  }
  if (result.kind === 'CLASS_P') return { kind: 'CLASS_P' };
  return { kind: 'UNKNOWN' };
}

// Compile-time assertion that the holdings are the published broker-observation type,
// not a local canonical-identity or owner contract.
export type Stage4Holding = BrokerImportHolding;
