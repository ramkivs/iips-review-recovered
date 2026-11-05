import { describe, it, expect, vi } from 'vitest';
import { previewBrokerHoldings } from './brokerHoldingsPreview';
import { freezeEvidenceSubmission } from './brokerEvidenceSubmission';
import { evidenceImportId, retainAndVerifyEvidence } from './brokerEvidenceRetention';
const csv = 'Name,Quantity,Avg Price,Last Traded,Investment,Current Value,P&L,P&L %\nRELIANCE,2,100,120,200,240,40,20';
const dto = () => freezeEvidenceSubmission('dhan.csv', previewBrokerHoldings(csv, 'dhan.csv', '2026-11-05T07:50:49.090Z'));
describe('AMEND-02 client failure and explicit retry semantics', () => {
  it('freezes the snapshot and preserves byte-identical request/timestamp on explicit retry, no automatic resend', async () => {
    const frozen = dto();
    const calls: RequestInit[] = [];
    const failing: typeof fetch = async (_url, init) => { calls.push(init!); throw new Error('lost acknowledgement'); };
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, failing)).state).toBe('UNCONFIRMED');
    expect(calls).toHaveLength(1);
    await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, failing);
    expect(calls[0].body).toBe(calls[1].body);
    expect(frozen.preview.asOf).toBe('2026-11-05T07:50:49.090Z');
    expect(Object.isFrozen(frozen.preview)).toBe(true);
  });
  it.each(['missing', 'wrong-digest', 'wrong-content', 'wrong-time', 'wrong-owner-slot'])('does not report success on %s read-back after acknowledgement', async fault => {
    const frozen = dto(), id = await evidenceImportId(frozen), digest = 'b'.repeat(64);
    const ack = { outcome: 'EVIDENCE_RETAINED', importId: id, recordDigest: digest, duplicate: false, retrievalPath: `/api/broker-import/DEFAULT_PORTFOLIO/evidence/${id}`, provenance: 'BROWSER_PIPELINE_SNAPSHOT', holdingsSaved: false };
    const record = { schema: 'IIPS_BROKER_IMPORT_EVIDENCE_V1', importId: id, contentDigest: frozen.preview.contentDigest, recordDigest: digest, readAt: frozen.preview.asOf, portfolioSlot: 'DEFAULT_PORTFOLIO', fileName: frozen.fileName };
    if (fault === 'wrong-digest') record.recordDigest = 'a'.repeat(64);
    if (fault === 'wrong-content') record.contentDigest = 'a'.repeat(64);
    if (fault === 'wrong-time') record.readAt = '2020-01-01T00:00:00.000Z';
    if (fault === 'wrong-owner-slot') record.portfolioSlot = 'OTHER';
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(JSON.stringify(ack), { status: 201 })).mockResolvedValueOnce(new Response(JSON.stringify(record), { status: fault === 'missing' ? 404 : 200 }));
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher)).state).toBe('ACKNOWLEDGED_UNVERIFIED');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('exposes conflict without GET or retry and performs lookup-only recovery without POST', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 409 }));
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', dto(), false, fetcher)).state).toBe('CONFLICT');
    expect(fetcher).toHaveBeenCalledTimes(1);
    const lookup = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 503 }));
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', dto(), true, lookup)).state).toBe('UNCONFIRMED');
    expect(lookup.mock.calls[0][1]?.method).toBe('GET');
  });
});
