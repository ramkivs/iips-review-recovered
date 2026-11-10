/**
 * IRR adapter for IPD PR #148's v1 `portfolio.importBroker` operation.
 *
 * This is transport and untrusted-input validation only. It neither resolves identity
 * nor authorizes or persists holdings: IPD resolves the active binding and runs its
 * existing P04/Stage 4 consumer and independent durable write guard. The legacy
 * `portfolio.save` path remains separately fail-closed.
 */
import type {
  BrokerImportHolding,
  BrokerImportOutcome,
  BrokerImportRequest,
  BrokerImportSuccess,
} from 'iips-production-market-data/portfolio-ui';
import { callIpc, findRefusedWireKeys, type IpcCallResult } from '../user-portfolio/ipcClient.js';

export type BrokerImportStage4Body = Omit<BrokerImportRequest, 'portfolioId'>;

const REQUEST_KEYS = ['expectedRevision', 'holdings', 'contentDigest', 'fileName', 'sourceBroker', 'importedAt', 'mode'];
const HOLDING_KEYS = ['symbol', 'isin', 'exchange', 'series', 'quantity', 'averageBuyPrice', 'currentPrice', 'marketValue', 'weightPercentage', 'active', 'sourceBroker', 'lineageDigest'];
const DIGEST = /^[a-f0-9]{64}$/;
const SYMBOL = /^[A-Za-z0-9][A-Za-z0-9._&-]{0,39}$/;
const PORTFOLIO_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const boundedString = (v: unknown, max: number): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max && !/[\u0000-\u001f\u007f]/.test(v);
const onlyKeys = (v: Record<string, unknown>, allowed: readonly string[]) => Object.keys(v).every(k => allowed.includes(k));

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
      || (value.mode !== undefined && value.mode !== 'MERGE' && value.mode !== 'REPLACE')) return null;
  for (const raw of value.holdings) {
    if (!isRecord(raw) || !onlyKeys(raw, HOLDING_KEYS)
        || typeof raw.symbol !== 'string' || !SYMBOL.test(raw.symbol)
        || (raw.isin !== undefined && !boundedString(raw.isin, 24))
        || (raw.exchange !== undefined && raw.exchange !== 'NSE' && raw.exchange !== 'BSE')
        || (raw.series !== undefined && !boundedString(raw.series, 16))
        || raw.sourceBroker !== value.sourceBroker
        || typeof raw.lineageDigest !== 'string' || !DIGEST.test(raw.lineageDigest)
        || typeof raw.active !== 'boolean') return null;
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
  | { readonly kind: 'CLASS_P' }
  | { readonly kind: 'UNKNOWN' };

/** Validate the published nested outcome, not just the IPC success envelope. */
export function interpretStage4Result(value: unknown): Stage4TransportOutcome {
  if (!isRecord(value)) return { kind: 'UNKNOWN' };
  if (value.ok === 'unknown' && value.code === 'OUTCOME_UNKNOWN' && value.storeEffect === 'OUTCOME_UNKNOWN') return { kind: 'UNKNOWN' };
  if (value.ok === false) {
    const codes = ['REFUSED_UNRESOLVED_IDENTITY', 'REFUSED_STORE_GUARD', 'WRITE_NOT_AUTHORIZED', 'INVALID_REQUEST', 'REVISION_CONFLICT', 'RESOURCE_UNAVAILABLE'];
    if (typeof value.code !== 'string' || !codes.includes(value.code) || value.storeEffect !== 'NONE' || !Array.isArray(value.refusedHoldings)) return { kind: 'UNKNOWN' };
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
