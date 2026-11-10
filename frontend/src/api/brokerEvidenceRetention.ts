/** AMEND-02 client: frozen snapshot POST, then existing A-9 GET. No automatic retries.
 *
 * OUTCOME VOCABULARY
 *   The retention state distinguishes the outcomes an operator must be able to act on.
 *   Collapsing distinct server outcomes into one "unconfirmed" state is a defect: a 404
 *   (this import was never retained) and a 503 `EVIDENCE_TAMPERED` (a retained record no
 *   longer verifies) demand different operator actions, and neither is "unknown".
 *
 *     VERIFIED                 — POST acknowledged AND the read-back matched every field
 *                               and the acknowledged record digest.
 *     ACKNOWLEDGED_UNVERIFIED  — the store acknowledged the write, but the read-back did not
 *                               match (digest or content). Retention is claimed by the store
 *                               only; the browser does not claim it verified.
 *     NOT_RETAINED             — the store reported this import id is absent (404). Nothing
 *                               was retained under this id. An explicit retry is the next step.
 *     TAMPERED                 — the store reported the retained record failed its own
 *                               digest re-verification (503 EVIDENCE_TAMPERED). The record is
 *                               never served and never reported as absent.
 *     CONFLICT                 — the store preserved an existing record and refused this
 *                               snapshot (409). The original record was not replaced.
 *     REFUSED                  — the store refused the request (403/400) or the route refused
 *                               it for a reason that is not an outcome code.
 *     UNAVAILABLE              — the store or the transport was unavailable (503 UNAVAILABLE,
 *                               or a transport fault). The outcome of the write is unknown and
 *                               is never claimed in either direction.
 */
import type { EvidenceSubmission } from './brokerEvidenceSubmission';
export type RetentionState =
  | 'SUBMITTING'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'UNCONFIRMED'
  | 'ACKNOWLEDGED_UNVERIFIED'
  | 'CONFLICT'
  | 'NOT_RETAINED'
  | 'TAMPERED'
  | 'REFUSED'
  | 'UNAVAILABLE';
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
/**
 * Reads the server's bounded outcome code from a response body, when it carries one.
 * The server emits `{ outcome: '<CODE>' }` on every non-2xx evidence response; an absent
 * or non-string `outcome` yields `null` rather than a guess.
 */
function outcomeCodeOf(body: unknown): string | null {
  if (!plain(body)) return null;
  return typeof body.outcome === 'string' ? body.outcome : null;
}
export async function evidenceImportId(dto: EvidenceSubmission): Promise<string> {
  const bytes = new TextEncoder().encode(`${dto.preview.broker}\u0000${dto.preview.contentDigest}\u0000${dto.preview.asOf}`);
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
}
/**
 * Maps one non-2xx evidence response onto a retention state.
 *
 * The mapping is by the server's own bounded outcome code first (it is the authoritative
 * distinction) and by status only as the fallback for a body that carries no code.
 */
export function retentionStateForResponse(status: number, body: unknown): RetentionState {
  const code = outcomeCodeOf(body);
  switch (code) {
    case 'RESOURCE_UNAVAILABLE':
      return 'NOT_RETAINED';
    case 'EVIDENCE_TAMPERED':
    case 'EVIDENCE_INVALID':
      return 'TAMPERED';
    case 'UNAVAILABLE':
      return 'UNAVAILABLE';
    default:
      break;
  }
  if (status === 404) return 'NOT_RETAINED';
  if (status === 409) return 'CONFLICT';
  if (status === 403 || status === 400) return 'REFUSED';
  if (status === 503) return 'UNAVAILABLE';
  return 'UNCONFIRMED';
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
      if (response.status !== 200 && response.status !== 201) {
        // The refusal code is read from the body when present, so a distinct server
        // refusal is never reported as an undifferentiated "unconfirmed".
        let body: unknown = null;
        try { body = await response.json(); } catch { body = null; }
        return { state: retentionStateForResponse(response.status, body), importId };
      }
      const ack: unknown = await response.json();
      if (!plain(ack) || ack.outcome !== 'EVIDENCE_RETAINED' || ack.importId !== importId || !hex(ack.recordDigest)
        || ack.provenance !== 'BROWSER_PIPELINE_SNAPSHOT' || ack.holdingsSaved !== false
        || ack.retrievalPath !== `${path}/${importId}` || ack.duplicate !== (response.status === 200)
        || Object.keys(ack).sort().join(',') !== 'duplicate,holdingsSaved,importId,outcome,provenance,recordDigest,retrievalPath') {
        return { state: 'UNCONFIRMED', importId };
      }
      digest = ack.recordDigest;
      acknowledged = true;
    } catch {
      // A transport fault on the POST leaves the WRITE's outcome genuinely unknown: the
      // request may have reached the store and committed, or it may not have. This is
      // different from the server reporting `UNAVAILABLE`, and it is different from the
      // server reporting the record absent. The operator must re-check by lookup rather
      // than assume either way, so the state is UNCONFIRMED and never VERIFIED.
      return { state: 'UNCONFIRMED', importId };
    }
  }
  progress('VERIFYING');
  try {
    const response = await fetcher(`${path}/${importId}`, { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) {
      let body: unknown = null;
      try { body = await response.json(); } catch { body = null; }
      const state = retentionStateForResponse(response.status, body);
      // A failed retrieval never claims retention. The distinction that matters to the
      // operator is preserved:
      //   - when NO write was acknowledged (a lookup-only check, or a refused POST), the
      //     server's own answer about absence/unavailability is the whole story;
      //   - when a write WAS acknowledged, a failing read must not be reported as
      //     "not retained": the store said it wrote the record, so the browser reports
      //     the write as acknowledged and the read as unverified, and never claims
      //     either verified retention or absence.
      if (acknowledged && state !== 'TAMPERED') return { state: 'ACKNOWLEDGED_UNVERIFIED', importId };
      return { state, importId };
    }
    const record: unknown = await response.json();
    // A-9 re-verifies the complete stored digest server-side; scope keys are intentionally withheld.
    // This projection cannot be rehashed locally. Compare to the original POST acknowledgement.
    if (!plain(record) || record.schema !== 'IIPS_BROKER_IMPORT_EVIDENCE_V1' || record.importId !== importId
      || record.contentDigest !== dto.preview.contentDigest || record.readAt !== dto.preview.asOf
      || record.portfolioSlot !== portfolio || record.fileName !== dto.fileName || !hex(record.recordDigest)
      || !matchesSnapshot(record, dto)
      || (digest !== undefined && record.recordDigest !== digest)) {
      // The store answered, but the record does not match the acknowledged snapshot.
      // Retention is not claimed as verified in either direction.
      return { state: acknowledged ? 'ACKNOWLEDGED_UNVERIFIED' : 'UNCONFIRMED', importId };
    }
    return { state: 'VERIFIED', importId, recordDigest: record.recordDigest };
  } catch {
    // A transport fault leaves the retrieval outcome unknown; the write, if it was
    // acknowledged, stays acknowledged and is never upgraded to VERIFIED. When nothing was
    // acknowledged, the outcome of the whole operation is unknown: the record may be
    // retained even though the read never reached the store, so absence is never claimed.
    return { state: acknowledged ? 'ACKNOWLEDGED_UNVERIFIED' : 'UNCONFIRMED', importId };
  }
}
