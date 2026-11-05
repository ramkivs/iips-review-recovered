/** AMEND-02 client: frozen snapshot POST, then existing A-9 GET. No automatic retries. */
import type { EvidenceSubmission } from './brokerEvidenceSubmission';
export type RetentionState = 'SUBMITTING' | 'VERIFYING' | 'VERIFIED' | 'UNCONFIRMED' | 'ACKNOWLEDGED_UNVERIFIED' | 'CONFLICT' | 'NOT_RETAINED';
export interface RetentionResult { state: RetentionState; importId?: string; recordDigest?: string }
const hex = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const plain = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
}
function matchesSnapshot(record: Record<string, unknown>, dto: EvidenceSubmission): boolean {
  const p = dto.preview;
  const rows = p.holdings.map((r, index) => ({ rowIndex: index + 1, symbol: r.symbol, isin: r.isin, exchange: r.exchange,
    quantity: r.quantity, averagePrice: r.averagePrice, currentPrice: r.currentPrice, identityStatus: r.identityStatus,
    identityBasis: r.identityBasis, identityRefusalCode: r.identityRefusalCode }));
  if (!Array.isArray(record.rows) || record.rows.some(r => !plain(r))) return false;
  const actualRows = record.rows.map(r => {
    const { quarantineIds: _ids, ...stable } = r as Record<string, unknown>;
    return stable;
  });
  return canonical(actualRows) === canonical(rows) && canonical(record.counts) === canonical(p.counts)
    && canonical(record.warnings) === canonical(p.warnings) && record.status === p.status
    && canonical(record.identityAuthority) === canonical(p.identityAuthority)
    && canonical(record.pipelineRefusals) === canonical(p.rejections.map(({ reason, details, stage }) => ({ reason, details, stage })));
}
export async function evidenceImportId(dto: EvidenceSubmission): Promise<string> {
  const bytes = new TextEncoder().encode(`${dto.preview.broker}\u0000${dto.preview.contentDigest}\u0000${dto.preview.asOf}`);
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
}
export async function retainAndVerifyEvidence(
  portfolio: string, dto: EvidenceSubmission, lookupOnly = false,
  fetcher: typeof fetch = fetch,
  progress: (state: RetentionState) => void = () => undefined,
): Promise<RetentionResult> {
  let importId: string;
  try { importId = await evidenceImportId(dto); } catch { return { state: 'NOT_RETAINED' }; }
  const path = `/api/broker-import/${encodeURIComponent(portfolio)}/evidence`;
  let digest: string | undefined;
  let acknowledged = false;
  if (!lookupOnly) {
    progress('SUBMITTING');
    try {
      const response = await fetcher(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto), credentials: 'same-origin' });
      if (response.status === 409) return { state: 'CONFLICT', importId };
      if (response.status !== 200 && response.status !== 201) return { state: 'UNCONFIRMED', importId };
      const ack: unknown = await response.json();
      if (!plain(ack) || ack.outcome !== 'EVIDENCE_RETAINED' || ack.importId !== importId || !hex(ack.recordDigest)
        || ack.provenance !== 'BROWSER_PIPELINE_SNAPSHOT' || ack.holdingsSaved !== false
        || ack.retrievalPath !== `${path}/${importId}` || ack.duplicate !== (response.status === 200)
        || Object.keys(ack).sort().join(',') !== 'duplicate,holdingsSaved,importId,outcome,provenance,recordDigest,retrievalPath') return { state: 'UNCONFIRMED', importId };
      digest = ack.recordDigest;
      acknowledged = true;
    } catch { return { state: 'UNCONFIRMED', importId }; }
  }
  progress('VERIFYING');
  try {
    const response = await fetcher(`${path}/${importId}`, { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('retrieval unavailable');
    const record: unknown = await response.json();
    // A-9 re-verifies the complete stored digest server-side; scope keys are intentionally withheld.
    // This projection cannot be rehashed locally. Compare to the original POST acknowledgement.
    if (!plain(record) || record.schema !== 'IIPS_BROKER_IMPORT_EVIDENCE_V1' || record.importId !== importId
      || record.contentDigest !== dto.preview.contentDigest || record.readAt !== dto.preview.asOf
      || record.portfolioSlot !== portfolio || record.fileName !== dto.fileName || !hex(record.recordDigest)
      || !matchesSnapshot(record, dto)
      || (digest !== undefined && record.recordDigest !== digest)) throw new Error('read-back mismatch');
    return { state: 'VERIFIED', importId, recordDigest: record.recordDigest };
  } catch { return { state: acknowledged ? 'ACKNOWLEDGED_UNVERIFIED' : 'UNCONFIRMED', importId }; }
}
