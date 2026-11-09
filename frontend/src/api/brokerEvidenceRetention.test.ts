import { describe, it, expect, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { previewBrokerHoldings } from './brokerHoldingsPreview';
import { freezeEvidenceSubmission } from './brokerEvidenceSubmission';
import { evidenceImportId, retainAndVerifyEvidence } from './brokerEvidenceRetention';
import { computeImportId } from '../../server/broker-import/brokerImportEvidenceStore';
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

/* ------------------------------------------------------------------ *
 * WS-A / Item 7: the evidence reference and import identifier.
 *
 * The UI can only ever address retained evidence by an import identifier it
 * derives ITSELF, from the frozen snapshot it holds in memory. If the browser
 * and the server derived it differently, the UI would look up a reference that
 * was never written, and "Check retained evidence" would report UNCONFIRMED
 * for evidence that was in fact retained. These assertions pin the two
 * derivations to each other, and pin that the lookup targets exactly the
 * reference the POST acknowledged.
 *
 * Authority: docs/integration/WS-A-68-ROW-IDENTITY-ASSESSMENT-RECONCILIATION-2026-11-09.md
 * ------------------------------------------------------------------ */
describe('AMEND-02 evidence reference and import identifier', () => {
  it('derives the SAME import identifier on the browser and on the server', async () => {
    const frozen = dto();
    const clientId = await evidenceImportId(frozen);
    const serverId = computeImportId(
      frozen.preview.broker,
      frozen.preview.contentDigest,
      frozen.preview.asOf,
    );
    expect(clientId).toBe(serverId);
    // The documented definition: sha256(broker ‖ 0x00 ‖ contentDigest ‖ 0x00 ‖ readAt).
    const expected = createHash('sha256')
      .update(`${frozen.preview.broker}\u0000${frozen.preview.contentDigest}\u0000${frozen.preview.asOf}`, 'utf8')
      .digest('hex');
    expect(clientId).toBe(expected);
    expect(clientId).toMatch(/^[0-9a-f]{64}$/);
  });

  it('addresses the exact reference the POST acknowledged, and nothing else', async () => {
    const frozen = dto();
    const id = await evidenceImportId(frozen);
    const digest = 'c'.repeat(64);
    const ack = {
      outcome: 'EVIDENCE_RETAINED', importId: id, recordDigest: digest, duplicate: false,
      retrievalPath: `/api/broker-import/DEFAULT_PORTFOLIO/evidence/${id}`,
      provenance: 'BROWSER_PIPELINE_SNAPSHOT', holdingsSaved: false,
    };
    const record = {
      schema: 'IIPS_BROKER_IMPORT_EVIDENCE_V1', importId: id,
      contentDigest: frozen.preview.contentDigest, recordDigest: digest,
      readAt: frozen.preview.asOf, portfolioSlot: 'DEFAULT_PORTFOLIO', fileName: frozen.fileName,
      rows: frozen.preview.holdings.map((h, i) => ({
        rowIndex: i + 1, symbol: h.symbol, isin: h.isin, exchange: h.exchange,
        quantity: h.quantity, averagePrice: h.averagePrice, currentPrice: h.currentPrice,
        identityStatus: h.identityStatus, identityBasis: h.identityBasis,
        identityRefusalCode: h.identityRefusalCode,
      })),
      counts: frozen.preview.counts, warnings: frozen.preview.warnings,
      status: frozen.preview.status, identityAuthority: frozen.preview.identityAuthority,
      pipelineRefusals: frozen.preview.rejections.map(({ reason, details, stage }) => ({ reason, details, stage })),
    };
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(ack), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(record), { status: 200 }));
    const result = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher);
    expect(result.state).toBe('VERIFIED');
    expect(result.importId).toBe(id);
    expect(result.recordDigest).toBe(digest);
    // The retrieval targets the acknowledged reference, in the acknowledged scope.
    expect(fetcher.mock.calls[1][0]).toBe(`/api/broker-import/DEFAULT_PORTFOLIO/evidence/${id}`);
    expect(fetcher.mock.calls[1][1]?.method).toBe('GET');
    // A lookup-only recovery must address the SAME reference, without a POST.
    const lookup = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(record), { status: 200 }));
    const recovered = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, true, lookup);
    expect(recovered.state).toBe('VERIFIED');
    expect(recovered.importId).toBe(id);
    expect(lookup.mock.calls[0][0]).toBe(`/api/broker-import/DEFAULT_PORTFOLIO/evidence/${id}`);
  });

  it('never reports VERIFIED when the read-back digest differs from the acknowledgement', async () => {
    const frozen = dto();
    const id = await evidenceImportId(frozen);
    const ackDigest = 'd'.repeat(64);
    const ack = {
      outcome: 'EVIDENCE_RETAINED', importId: id, recordDigest: ackDigest, duplicate: false,
      retrievalPath: `/api/broker-import/DEFAULT_PORTFOLIO/evidence/${id}`,
      provenance: 'BROWSER_PIPELINE_SNAPSHOT', holdingsSaved: false,
    };
    const record = {
      schema: 'IIPS_BROKER_IMPORT_EVIDENCE_V1', importId: id,
      contentDigest: frozen.preview.contentDigest, recordDigest: 'e'.repeat(64),
      readAt: frozen.preview.asOf, portfolioSlot: 'DEFAULT_PORTFOLIO', fileName: frozen.fileName,
      rows: [], counts: frozen.preview.counts, warnings: frozen.preview.warnings,
      status: frozen.preview.status, identityAuthority: frozen.preview.identityAuthority,
      pipelineRefusals: [],
    };
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(ack), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(record), { status: 200 }));
    // A digest mismatch is NOT success: the acknowledgement was real, so the
    // truthful state is ACKNOWLEDGED_UNVERIFIED — never VERIFIED.
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher)).state)
      .toBe('ACKNOWLEDGED_UNVERIFIED');
  });
});
