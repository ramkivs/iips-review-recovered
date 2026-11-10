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
    // A transport fault leaves the retention outcome unknown: the request may have
    // reached the store and committed, or it may not have. Neither retention nor absence
    // is claimed, and the operator must re-check by lookup. It is distinct from a server
    // refusal and from a server-reported absence.
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
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', dto(), true, lookup)).state).toBe('UNAVAILABLE');
    expect(lookup.mock.calls[0][1]?.method).toBe('GET');
  });
});

/* ------------------------------------------------------------------ *
 * Distinct retention outcomes.
 *
 * The operator must be able to tell apart the five situations that look alike
 * on the wire but demand different actions:
 *
 *   1. retained and verified          — VERIFIED
 *   2. not retained (absent)          — NOT_RETAINED
 *   3. retained but failed integrity  — TAMPERED
 *   4. acknowledged, read not verified — ACKNOWLEDGED_UNVERIFIED
 *   5. refused / unavailable          — REFUSED / UNAVAILABLE
 *
 * Collapsing these into a single "unconfirmed" state is what made a retention
 * attempt indistinguishable from a dead end.
 * ------------------------------------------------------------------ */
describe('AMEND-02 distinct retention outcomes', () => {
  const frozen = dto();

  it('reports NOT_RETAINED when the server states the import is absent', async () => {
    const lookup = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ outcome: 'RESOURCE_UNAVAILABLE' }), { status: 404 }),
    );
    const result = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, true, lookup);
    expect(result.state).toBe('NOT_RETAINED');
    expect(result.importId).toBe(await evidenceImportId(frozen));
  });

  it('reports TAMPERED — never absent — when the server fails the record integrity check', async () => {
    const lookup = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ outcome: 'EVIDENCE_TAMPERED' }), { status: 503 }),
    );
    const result = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, true, lookup);
    expect(result.state).toBe('TAMPERED');
    expect(result.state).not.toBe('NOT_RETAINED');
  });

  it('reports TAMPERED even when the POST had already been acknowledged', async () => {
    const id = await evidenceImportId(frozen);
    const digest = 'b'.repeat(64);
    const ack = {
      outcome: 'EVIDENCE_RETAINED', importId: id, recordDigest: digest, duplicate: false,
      retrievalPath: `/api/broker-import/DEFAULT_PORTFOLIO/evidence/${id}`,
      provenance: 'BROWSER_PIPELINE_SNAPSHOT', holdingsSaved: false,
    };
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(ack), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ outcome: 'EVIDENCE_TAMPERED' }), { status: 503 }));
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher)).state).toBe('TAMPERED');
  });

  it('reports REFUSED when the server refuses the request and retains nothing', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: 'cross-site-request-refused' }), { status: 403 }),
    );
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher)).state).toBe('REFUSED');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('reports UNAVAILABLE when the server reports storage unavailable', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ outcome: 'UNAVAILABLE' }), { status: 503 }),
    );
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher)).state).toBe('UNAVAILABLE');
  });

  it('never reports VERIFIED for a refused or unavailable store', async () => {
    for (const [status, body] of [
      [403, { error: 'cross-site-request-refused' }],
      [503, { outcome: 'UNAVAILABLE' }],
      [404, { outcome: 'RESOURCE_UNAVAILABLE' }],
    ] as const) {
      const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify(body), { status }),
      );
      const state = (await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher)).state;
      expect(state).not.toBe('VERIFIED');
    }
  });

  it('keeps the acknowledged write distinguishable from a server-reported absence', async () => {
    const id = await evidenceImportId(frozen);
    const digest = 'b'.repeat(64);
    const ack = {
      outcome: 'EVIDENCE_RETAINED', importId: id, recordDigest: digest, duplicate: false,
      retrievalPath: `/api/broker-import/DEFAULT_PORTFOLIO/evidence/${id}`,
      provenance: 'BROWSER_PIPELINE_SNAPSHOT', holdingsSaved: false,
    };
    // The store acknowledged the write, then the read reports the record absent. The
    // browser must not claim absence (the store said it wrote) and must not claim
    // verified retention (the read did not confirm it).
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(ack), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ outcome: 'RESOURCE_UNAVAILABLE' }), { status: 404 }));
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher)).state)
      .toBe('ACKNOWLEDGED_UNVERIFIED');
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

/* ------------------------------------------------------------------ *
 * Retry, duplication and malformed responses.
 *
 * A retry must never silently rewrite what the operator already saw. The FIRST
 * acknowledged record digest is carried into the retry, so a store that answers
 * with a different record is reported as a mismatch rather than being adopted as
 * the new truth. A malformed body is a SERVER failure (the store answered), which
 * is a different operator situation from a transport fault (no usable response).
 * ------------------------------------------------------------------ */
describe('AMEND-02 retry, duplicate acknowledgement and malformed responses', () => {
  function ackBody(id: string, digest: string, duplicate: boolean) {
    return {
      outcome: 'EVIDENCE_RETAINED', importId: id, recordDigest: digest, duplicate,
      retrievalPath: `/api/broker-import/DEFAULT_PORTFOLIO/evidence/${id}`,
      provenance: 'BROWSER_PIPELINE_SNAPSHOT', holdingsSaved: false,
    };
  }
  function recordBody(frozen: ReturnType<typeof dto>, id: string, digest: string) {
    return {
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
  }

  it('keeps the first acknowledged digest on a verified duplicate retry and never reports a new record', async () => {
    const frozen = dto();
    const id = await evidenceImportId(frozen);
    const first = 'f'.repeat(64);
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(ackBody(id, first, false)), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(recordBody(frozen, id, first)), { status: 200 }));
    const firstResult = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher);
    expect(firstResult).toEqual({ state: 'VERIFIED', importId: id, recordDigest: first });

    // The retry re-submits the same snapshot; the store answers 200/duplicate with the
    // SAME record digest, and retrieval re-confirms it. Only then is preservation claimed.
    const retry = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(ackBody(id, first, true)), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(recordBody(frozen, id, first)), { status: 200 }));
    const retried = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, retry, () => undefined, firstResult.recordDigest);
    expect(retried).toEqual({ state: 'VERIFIED', importId: id, recordDigest: first, duplicate: true });
  });

  it('reports a changed record digest on retry as a mismatch rather than adopting it', async () => {
    const frozen = dto();
    const id = await evidenceImportId(frozen);
    const first = 'a'.repeat(64);
    const different = 'b'.repeat(64);
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(ackBody(id, different, true)), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(recordBody(frozen, id, different)), { status: 200 }));
    const result = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher, () => undefined, first);
    expect(result.state).toBe('ACKNOWLEDGED_UNVERIFIED');
    expect(result.reason).toBe('DIGEST_MISMATCH');
    expect(result.recordDigest).toBe(different);
    // The original digest is what the operator saw; it is not overwritten here.
    expect(first).not.toBe(different);
  });

  it('does not claim duplicate preservation before retrieval verifies it', async () => {
    const frozen = dto();
    const id = await evidenceImportId(frozen);
    const digest = 'c'.repeat(64);
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(ackBody(id, digest, true)), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ outcome: 'UNAVAILABLE' }), { status: 503 }));
    const result = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher, () => undefined, digest);
    expect(result.state).toBe('ACKNOWLEDGED_UNVERIFIED');
    expect(result.duplicate).toBe(true);
    expect(result.recordDigest).toBe(digest);
    // Nothing claims the original record was preserved: retrieval never verified it.
    expect(result.state).not.toBe('VERIFIED');
  });

  it('distinguishes a malformed acknowledgement body from a transport fault', async () => {
    const frozen = dto();
    // The store answered, but not with a usable body: a server-side failure, not a lost request.
    const malformedAck = vi.fn<typeof fetch>().mockResolvedValue(new Response('<html>oops</html>', { status: 201 }));
    const ackResult = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, malformedAck);
    expect(ackResult.state).toBe('UNCONFIRMED');
    expect(ackResult.reason).toBe('SERVER_FAILURE');

    // No usable response at all: the write's outcome is genuinely unknown.
    const transport = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('socket hang up'));
    const transportResult = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, transport);
    expect(transportResult.state).toBe('UNCONFIRMED');
    expect(transportResult.reason).toBe('TRANSPORT_FAILURE');
  });

  it('reports a malformed retrieval as unverified after an acknowledgement, not as verified retention', async () => {
    const frozen = dto();
    const id = await evidenceImportId(frozen);
    const digest = 'd'.repeat(64);
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(ackBody(id, digest, false)), { status: 201 }))
      .mockResolvedValueOnce(new Response('not-json', { status: 200 }));
    const result = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetcher);
    expect(result.state).toBe('ACKNOWLEDGED_UNVERIFIED');
    expect(result.reason).toBe('SERVER_FAILURE');
    expect(result.recordDigest).toBe(digest);
  });
});
