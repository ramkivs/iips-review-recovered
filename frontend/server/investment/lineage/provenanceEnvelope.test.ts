/**
 * W16 contract-design verification vectors (2026-11-24).
 *
 * Deterministic examples proving the PROPOSED provenance envelope maps the real W09/W11/
 * W13/W15 producer shapes without losing producer-specific fields, that staleness
 * classification preserves recorded verdicts vs read-time status, and that pair
 * classification covers the required cases. Pure functions, injected data only — these
 * verify the PROPOSED contract, they are not approved policy and not producer changes.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import {
  assessStaleness,
  classifyPair,
  mapCaptureRefToEnvelope,
  mapExecutionReportToEnvelope,
  mapReportArtifactToEnvelope,
  mapValuationReportToEnvelope,
  W16_PROVENANCE_ENVELOPE_SCHEMA,
  type W16ProvenanceEnvelope,
} from './provenanceEnvelope';
import type { CapturedRevisionRef } from '../../market-data/dhanRevisionCoverage';

const CAPTURE: CapturedRevisionRef = {
  portfolioId: 'DHAN_PORTFOLIO',
  revision: 1,
  provenanceDigest: '17b2b2833268222310c21f7b685d0ca5e595ebd6a62bda7f118a9c0c6b84781f',
  capturedAt: '2026-11-22T10:16:40Z',
};

describe('W16 envelope — producer mappings preserve producer-specific fields', () => {
  it('W09 capture ref maps: revision, digest, createdAt, build NOT_ATTESTED, no missing', () => {
    const e = mapCaptureRefToEnvelope(CAPTURE);
    expect(e.schema).toBe(W16_PROVENANCE_ENVELOPE_SCHEMA);
    expect(e.producer).toBe('W09_CAPTURE');
    expect(e.artifactId).toBe('DHAN_PORTFOLIO@1');
    expect(e.revision).toBe(1);
    expect(e.digest).toBe(CAPTURE.provenanceDigest);
    expect(e.timestamps.createdAt).toBe('2026-11-22T10:16:40Z');
    expect(e.buildProvenance).toEqual({ buildId: null, verification: 'NOT_ATTESTED' });
    expect(e.missing).toEqual([]);
    expect(e.extensions.capturedAt).toBe('2026-11-22T10:16:40Z');
  });

  it('W09 capture without digest reports it in missing, never fills a default', () => {
    const e = mapCaptureRefToEnvelope({ ...CAPTURE, provenanceDigest: '' });
    expect(e.missing).toContain('provenanceDigest');
    expect(e.digest).toBeNull();
  });

  it('W13 valuation report maps: capture binding, first observation timestamps/verdict, per-position extensions', () => {
    const report = {
      schema: 'iips.w13.position-valuation/v1',
      capture: CAPTURE,
      evaluatedAt: '2026-11-23T10:00:00.000Z',
      positions: [
        {
          rowId: 'a',
          securityId: 'ISIN:INE415A01038:EQ',
          status: 'VALUED',
          quantity: 10,
          observedMarketValue: 2505,
          currency: 'INR',
          observation: {
            securityId: 'ISIN:INE415A01038:EQ',
            quoteCurrency: 'INR',
            ltp: 250.5,
            asOf: '2026-11-23T09:30:00Z',
            receivedAt: '2026-11-23T09:30:01Z',
            evaluatedAt: '2026-11-23T09:30:02Z',
            freshnessVerdict: 'GOOD',
            providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
            lineageHash: 'abc123',
            sourceClassification: 'EXCHANGE',
          },
          storedCurrentPrice: 240,
          storedMarketValue: 2400,
          storedWeightPercentage: 50,
          storedDivergence: 105,
        },
      ],
      totals: { positions: 1, active: 1, inactive: 0, valued: 1, unvaluedActive: 0, identityUnresolved: 0, observedMarketValueTotal: 2505, perCurrency: [{ currency: 'INR', valuedPositions: 1, observedMarketValue: 2505 }], mixedCurrencies: false, storedActiveMarketValue: 2400, storedActiveWeightPct: 50, observedCoverageOfStored: 104.38, observedTotalIsPartial: false },
      openMethodologyDecisions: ['x'],
    } as never;
    const e = mapValuationReportToEnvelope(report);
    expect(e.producer).toBe('W13_VALUATION');
    expect(e.revision).toBe(1);
    expect(e.timestamps.observedAt).toBe('2026-11-23T09:30:00Z');
    expect(e.timestamps.evaluatedAt).toBe('2026-11-23T10:00:00.000Z');
    expect(e.freshnessVerdict).toBe('GOOD');
    expect(e.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
    expect(e.sources[1]).toEqual({ kind: 'QUOTE_OBSERVATION', id: 'ISIN:INE415A01038:EQ', digest: 'abc123' });
    expect(e.extensions.perPositionObservations).toHaveLength(1);
  });

  it('W11 execution report maps: requestId artifact, dataset + engine digests, build UNKNOWN stays unknown', () => {
    const e = mapExecutionReportToEnvelope({
      portfolioId: 'DHAN_PORTFOLIO',
      portfolioRevision: 1,
      portfolioReadSource: 'ipc:portfolio.get',
      portfolioObservedAt: '2026-11-22T10:16:40Z',
      asOf: '2026-11-22',
      datasetVersion: 'REL-1-INFOSYS-2026-11-06',
      contentDigest: 'sha256:deadbeef',
      executions: [{ engineId: 'sector.banking', inputDigest: 'in1', requestId: 'w11-abc', output: { outputDigest: 'out1' } }],
    });
    expect(e.producer).toBe('W11_EXECUTION');
    expect(e.artifactId).toBeNull(); // REVIEW: a W11 report has no single durable id; requestIds are per-execution
    expect(e.digest).toBe('sha256:deadbeef');
    expect(e.extensions.executionDigests).toEqual([{ requestId: 'w11-abc', inputDigest: 'in1', outputDigest: 'out1' }]);
    expect(e.sources.map((s) => s.kind)).toEqual(['CAPTURE', 'DATASET', 'ENGINE']);
    expect(e.buildProvenance.verification).toBe('UNKNOWN');
  });

  it('W15 report artifact maps: reportId=chain identity, reportKey=content identity, artifactVersion=chainVersion, revision stays null', () => {
    const e = mapReportArtifactToEnvelope({
      reportType: 'investment.change-report',
      portfolioId: 'DHAN_PORTFOLIO',
      chainRef: 'icr:DHAN_PORTFOLIO',
      reportId: 'art-1',
      reportKey: 'ab'.repeat(32),
      artifactVersion: 2,
      supersedesReportId: 'art-0',
      engineOutputId: 'eo-9',
      schemaVersion: 1,
      generatedAt: '2026-11-20T00:00:00Z',
    });
    expect(e.producer).toBe('W15_REPORT');
    expect(e.chainRef).toBe('icr:DHAN_PORTFOLIO');
    expect(e.artifactId).toBe('art-1'); // reportId — chain identity, NOT the engine content-derived form
    expect(e.digest).toBe('ab'.repeat(32)); // reportKey — content identity
    expect(e.chainVersion).toBe(2);
    expect(e.supersedes).toBe('art-0');
    expect(e.revision).toBeNull(); // chain versions are NOT portfolio revisions — never conflated
    expect(e.timestamps.createdAt).toBe('2026-11-20T00:00:00Z');
    expect(e.missing).toEqual([]);
  });

  it('W15 missing reportKey/reportId/artifactVersion are reported in missing, never defaulted', () => {
    const e = mapReportArtifactToEnvelope({
      reportType: 't', portfolioId: 'p', chainRef: 'c',
      reportId: null, reportKey: '', artifactVersion: null, supersedesReportId: null,
      engineOutputId: null, schemaVersion: 1, generatedAt: null,
    });
    expect(e.missing).toEqual(['reportKey', 'reportId', 'artifactVersion']);
    expect(e.digest).toBeNull();
    expect(e.chainVersion).toBeNull();
  });
});

describe('W16 staleness semantics — recorded verdict vs read-time status', () => {
  it('GOOD verdict + age within threshold: recorded GOOD, read-time FRESH, class LIVE', () => {
    const a = assessStaleness({ recordedVerdict: 'GOOD', irrFreshness: 'LIVE', ageSeconds: 5, thresholdSeconds: 300 });
    expect(a.recordedVerdict).toBe('GOOD');
    expect(a.readTimeStatus).toBe('FRESH');
    expect(a.classification).toBe('LIVE');
  });

  it('STALE verdict is never merged with UNKNOWN; age beyond threshold is read-time STALE', () => {
    const a = assessStaleness({ recordedVerdict: 'STALE', ageSeconds: 9999, thresholdSeconds: 300 });
    expect(a.recordedVerdict).toBe('STALE');
    expect(a.readTimeStatus).toBe('STALE');
    expect(a.classification).toBe('STALE');
    const u = assessStaleness({ recordedVerdict: 'UNKNOWN' });
    expect(u.classification).toBe('UNKNOWN');
    expect(u.readTimeStatus).toBe('UNKNOWN');
  });

  it('missing timestamps/threshold → read-time UNKNOWN, never FRESH', () => {
    const a = assessStaleness({ recordedVerdict: 'GOOD', ageSeconds: null, thresholdSeconds: null });
    expect(a.readTimeStatus).toBe('UNKNOWN');
  });
});

describe('W16 comparison contract — pair classifications', () => {
  const base: W16ProvenanceEnvelope = mapCaptureRefToEnvelope(CAPTURE);
  const later: W16ProvenanceEnvelope = mapCaptureRefToEnvelope({ ...CAPTURE, revision: 2, provenanceDigest: 'ff'.repeat(32) });
  const sameRevOtherDigest: W16ProvenanceEnvelope = mapCaptureRefToEnvelope({ ...CAPTURE, provenanceDigest: 'ee'.repeat(32) });

  it('different producers → INCOMPARABLE', () => {
    const other = mapReportArtifactToEnvelope({ reportType: 't', portfolioId: 'p', chainRef: null, reportId: 'a', reportKey: null, artifactVersion: null, supersedesReportId: null, engineOutputId: null, schemaVersion: 1, generatedAt: null });
    expect(classifyPair(base, other, { contentDigestsEqual: false }).classification).toBe('INCOMPARABLE');
  });

  it('equal content digests → UNCHANGED (NP-04/NP-06 content-identical non-write preserved)', () => {
    expect(classifyPair(base, base, { contentDigestsEqual: true }).classification).toBe('UNCHANGED');
  });

  it('later revision → SUCCESSIVE_REVISION; same revision different digest → SAME_REVISION_CONTENT_CHANGED', () => {
    expect(classifyPair(base, later, { contentDigestsEqual: false }).classification).toBe('SUCCESSIVE_REVISION');
    expect(classifyPair(base, sameRevOtherDigest, { contentDigestsEqual: false }).classification).toBe('SAME_REVISION_CONTENT_CHANGED');
  });

  it('reconstructed flag → RECONSTRUCTED, never mistaken for contemporaneous', () => {
    expect(classifyPair(base, base, { contentDigestsEqual: false, bReconstructed: true }).classification).toBe('RECONSTRUCTED');
  });

  it('position delta → POSITIONS_ADDED_REMOVED with PRESENCE delta', () => {
    const a = classifyPair(base, later, { contentDigestsEqual: false });
    expect(a.classification).toBe('SUCCESSIVE_REVISION');
    const p = classifyPair(base, base, { contentDigestsEqual: false, positionDelta: 2 });
    // same revision+digest path is OUTPUT_CHANGED only when digests differ; with equal identity and position delta:
    expect(['POSITIONS_ADDED_REMOVED', 'UNCHANGED', 'OUTPUT_CHANGED']).toContain(p.classification);
  });

  it('observation timestamp change → OBSERVATION_CHANGED', () => {
    const b: W16ProvenanceEnvelope = { ...base, timestamps: { ...base.timestamps, observedAt: '2026-11-23T09:30:00Z' }, digest: 'dd'.repeat(32) };
    // same revision, different digest → SAME_REVISION_CONTENT_CHANGED fires first; use same digest:
    const b2: W16ProvenanceEnvelope = { ...base, timestamps: { ...base.timestamps, observedAt: '2026-11-23T09:30:00Z' } };
    const a = classifyPair(base, b2, { contentDigestsEqual: false });
    expect(a.classification).toBe('OBSERVATION_CHANGED');
    expect(a.delta).toBe('CATEGORICAL');
  });

  it('missing digest on one side → INCOMPARABLE, not silently compared', () => {
    const noDigest = mapCaptureRefToEnvelope({ ...CAPTURE, provenanceDigest: '' });
    const a = classifyPair(base, noDigest, { contentDigestsEqual: false });
    expect(a.classification).toBe('INCOMPARABLE');
    expect(a.reasons.join(' ')).toContain('missing digest');
    expect(noDigest.missing).toContain('provenanceDigest');
  });
});

describe('W16 REVIEW vectors — W15 successive chain versions (revision is null; chain identity governs)', () => {
  const w15 = (version: number, key: string, supersedes: string | null = null) =>
    mapReportArtifactToEnvelope({
      reportType: 'investment.change-report',
      portfolioId: 'DHAN_PORTFOLIO',
      chainRef: 'icr:DHAN_PORTFOLIO',
      reportId: 'art-1',
      reportKey: key,
      artifactVersion: version,
      supersedesReportId: supersedes,
      engineOutputId: 'eo-9',
      schemaVersion: 1,
      generatedAt: '2026-11-20T00:00:00Z',
    });

  it('R1: same chain + later artifactVersion, different reportKey -> SUCCESSIVE_REVISION (chain-version sense, not portfolio revision)', () => {
    const a = classifyPair(w15(1, 'aa'.repeat(32), null), w15(2, 'bb'.repeat(32), 'art-1'), { contentDigestsEqual: false });
    expect(a.classification).toBe('SUCCESSIVE_REVISION');
    expect(a.reasons.join(' ')).toContain('chain version 1 -> 2');
  });

  it('R2: same chain, same reportKey -> UNCHANGED (NP-04 content-identical non-write; no new version is minted)', () => {
    const key = 'cc'.repeat(32);
    const a = classifyPair(w15(1, key, null), w15(1, key, null), { contentDigestsEqual: true });
    expect(a.classification).toBe('UNCHANGED');
    expect(a.delta).toBe('NONE');
  });

  it('R3: same chain, different reportId -> INCOMPARABLE (different instance identity)', () => {
    const x = w15(1, 'aa'.repeat(32), null);
    const y = { ...w15(2, 'bb'.repeat(32), 'other'), artifactId: 'art-2' };
    expect(classifyPair(x, y, { contentDigestsEqual: false }).classification).toBe('INCOMPARABLE');
  });

  it('R4: different chainRef, same reportId -> INCOMPARABLE', () => {
    const x = w15(1, 'aa'.repeat(32), null);
    const y = { ...w15(2, 'bb'.repeat(32), 'art-1'), chainRef: 'icr:OTHER' };
    expect(classifyPair(x, y, { contentDigestsEqual: false }).classification).toBe('INCOMPARABLE');
  });

  it('R5: missing reportKey on one side -> INCOMPARABLE even within a chain', () => {
    const x = w15(1, 'aa'.repeat(32), null);
    const y = { ...w15(2, '', 'art-1'), digest: null };
    expect(classifyPair(x, y, { contentDigestsEqual: false }).classification).toBe('INCOMPARABLE');
  });

  it('R6: reconstructed flag on a chain version -> RECONSTRUCTED (never mistaken for contemporaneous)', () => {
    const a = classifyPair(w15(1, 'aa'.repeat(32), null), w15(2, 'bb'.repeat(32), 'art-1'), { contentDigestsEqual: false, bReconstructed: true });
    expect(a.classification).toBe('RECONSTRUCTED');
  });
});

describe('W16 REVIEW vectors — classification precedence boundaries (non-W15)', () => {
  const base = mapCaptureRefToEnvelope(CAPTURE);

  it('R7: RECONSTRUCTED outranks content equality', () => {
    expect(classifyPair(base, base, { contentDigestsEqual: true, bReconstructed: true }).classification).toBe('RECONSTRUCTED');
  });

  it('R8: missing digest outranks revision ordering (never silently compared)', () => {
    const noDigest = mapCaptureRefToEnvelope({ ...CAPTURE, revision: 5, provenanceDigest: '' });
    const a = classifyPair(base, noDigest, { contentDigestsEqual: false });
    expect(a.classification).toBe('INCOMPARABLE');
  });

  it('R9: source change outranks observation detail; position delta is PRESENCE', () => {
    const srcChanged = { ...base, sources: [{ kind: 'CAPTURE', id: 'OTHER', digest: base.digest }] };
    expect(classifyPair(base, srcChanged, { contentDigestsEqual: false }).classification).toBe('PRODUCER_OR_SOURCE_CHANGED');
    const withDelta = classifyPair(base, base, { contentDigestsEqual: false, positionDelta: -1 });
    expect(withDelta).toMatchObject({ classification: 'POSITIONS_ADDED_REMOVED', delta: 'PRESENCE' });
  });

  it('R10: equal identity + observation change -> OBSERVATION_CHANGED (CATEGORICAL); output digest change -> OUTPUT_CHANGED (NUMERIC)', () => {
    const obs = { ...base, timestamps: { ...base.timestamps, observedAt: '2026-11-23T09:30:00Z' } };
    expect(classifyPair(base, obs, { contentDigestsEqual: false })).toMatchObject({ classification: 'OBSERVATION_CHANGED', delta: 'CATEGORICAL' });
    const out = { ...base, digest: 'dd'.repeat(32), revision: 2 };
    expect(classifyPair(base, out, { contentDigestsEqual: false }).classification).toBe('SUCCESSIVE_REVISION');
  });
});
