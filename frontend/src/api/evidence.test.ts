import { describe, it, expect, vi } from 'vitest';
import { fetchEvidenceData, type EvidenceData } from './evidence';
const reference: EvidenceData = {
  referenceOnly: true, decision: { verdict: 'Watch', composite: 47.1, confidence: null },
  evidence: { evidenceId: 'ev_Banking', engineId: 'sector.banking', recommendation: 'Watch', compositeScore: 47.1, confidence: 0.8,
    keyMetrics: [{ id: 'NIM', name: 'NIM', value: 3.2 }], supportingScores: [{ id: 'quality', name: 'Quality', value: 15 }],
    calibrationVersion: '1.0.0', decisionRulesApplied: ['fixture-rule'], replayReference: null,
    provenance: { frameworkVersion: '2.0', engineVersion: '1.0.0', methodologyVersion: 'IES-Banking', snapshotId: 'snap_Banking' }, generatedAt: '2026-08-09' },
  snapshot: { snapshotId: 'snap_Banking', engineId: 'sector.banking', schemaVersion: 'snapshot-1.0', generatedAt: '2026-08-09', verdict: 'Watch', scores: { quality: 15 } },
  replay: { state: 'NOT_PERFORMED', code: 'SECTOR_REFERENCE_NOT_CAPTURE', diagnostic: 'Reference only, not an archive.' },
  provenance: { dataSource: 'test-only reference fixture', freshness: 'SNAPSHOT', calibratedAt: '2026-08-09', transportSemantics: 'reference only' },
};
function reply(value: unknown, status = 200) { const fetch = vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => value }); globalThis.fetch = fetch; return fetch; }
describe('reference-only Evidence client', () => {
  it('preserves every reference decision/metric/provenance value and uses encoded credential-free requests', async () => {
    const fetch = reply(reference); const data = await fetchEvidenceData('Materials & Metals');
    expect(data).toEqual(reference); expect(data.decision.confidence).toBeNull(); expect(data.evidence.replayReference).toBeNull();
    expect(fetch.mock.calls[0][0]).toBe('/api/evidence/Materials%20%26%20Metals'); expect(fetch.mock.calls[0][1]).toMatchObject({ credentials: 'omit' });
    expect(new Headers(fetch.mock.calls[0][1].headers).has('authorization')).toBe(false);
  });
  it.each([null, [], { ...reference, referenceOnly: false }, { ...reference, referenceOnly: undefined },
    { ...reference, evidence: { ...reference.evidence, replayReference: 'snap_Banking' } }, { ...reference, evidence: null },
    { ...reference, replay: { reproduced: true, byteIdentical: true } },
    { ...reference, replay: { state: 'NOT_PERFORMED', reproduced: false } },
  ])('refuses an archive/replay implication or malformed legacy contract', async value => {
    reply(value); await expect(fetchEvidenceData('Banking')).rejects.toThrow();
  });
  it('preserves unknown-sector failures without substituting a current engine/evidence record', async () => {
    reply({ error: 'unknown sector' }, 404); await expect(fetchEvidenceData('Unknown')).rejects.toThrow('evidence transport returned 404');
  });
});
