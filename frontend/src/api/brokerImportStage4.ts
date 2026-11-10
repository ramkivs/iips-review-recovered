/** Browser-side projection and HTTP transport for IPD's published Stage 4 IPC contract.
 * The browser never sends an owner or a canonical identity. IPD repeats qualification
 * and authorization independently after IRR forwards the request over same-host IPC.
 */
import type { BrokerIngressResult, BrokerImportHolding, BrokerImportRequest, BrokerImportSuccess } from 'iips-production-market-data/portfolio-ui';
import { noAuthFetch } from '../core/network/noAuthFetch';

export type PreparedBrokerImport = Omit<BrokerImportRequest, 'portfolioId' | 'expectedRevision'>;

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
  | { readonly ok: true; readonly result: BrokerImportSuccess }
  | { readonly ok: false; readonly outcome: string; readonly status: number };

function isSuccess(value: unknown): value is BrokerImportSuccess {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  if (r.ok !== true || !['SAVED_NEW_BATCH', 'MERGED_INTO_EXISTING', 'ALREADY_IMPORTED_NO_OP'].includes(String(r.disposition))
      || !Number.isSafeInteger(r.revision) || (r.revision as number) < 1
      || !Number.isSafeInteger(r.holdingsPersisted) || (r.holdingsPersisted as number) < 0
      || !Number.isSafeInteger(r.contributions) || (r.contributions as number) < 0
      || typeof r.totalMarketValue !== 'number' || !Number.isFinite(r.totalMarketValue)
      || typeof r.message !== 'string' || typeof r.noOp !== 'boolean') return false;
  return r.noOp === (r.disposition === 'ALREADY_IMPORTED_NO_OP')
    && r.storeEffect === (r.noOp ? 'NONE' : 'REVISION_COMMITTED')
    && (r.noOp || (r.holdingsPersisted as number) > 0);
}

/** One POST, no automatic retry. A lost or malformed acknowledgement stays unknown. */
export async function commitBrokerImport(request: BrokerImportRequest): Promise<Stage4ClientOutcome> {
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
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const data = parsed as Record<string, unknown>;
    if (typeof data.outcome === 'string') return { ok: false, outcome: data.outcome, status: response.status };
    if (data.error === 'owner-context-unavailable') return { ok: false, outcome: 'OWNER_CONTEXT_UNAVAILABLE', status: response.status };
    if (data.error === 'cross-site-request-refused') return { ok: false, outcome: 'REQUEST_REFUSED', status: response.status };
  }
  // A proxy/server failure after dispatch does not establish whether the write landed.
  return { ok: false, outcome: 'OUTCOME_UNKNOWN', status: response.status };
}
