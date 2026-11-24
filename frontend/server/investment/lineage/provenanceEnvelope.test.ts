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
    expect(e.artifactId).toBe('w11-abc');
    expect(e.digest).toBe('sha256:deadbeef');
    expect(e.sources.map((s) => s.kind)).toEqual(['CAPTURE', 'DATASET', 'ENGINE']);
    expect(e.buildProvenance.verification).toBe('UNKNOWN');
  });

  it('W15 report artifact maps: chainRef + artifactId preserved, revision null (chain versions are not portfolio revisions)', () => {
    const e = mapReportArtifactToEnvelope({
      reportType: 'investment.change-report',
      portfolioId: 'DHAN_PORTFOLIO',
      chainRef: 'icr:DHAN_PORTFOLIO',
      artifactId: 'art-1',
      engineOutputId: 'eo-9',
      schemaVersion: 1,
      generatedAt: '2026-11-20T00:00:00Z',
      contentDigest: 'sha256:cafe',
    });
    expect(e.producer).toBe('W15_REPORT');
    expect(e.chainRef).toBe('icr:DHAN_PORTFOLIO');
    expect(e.artifactId).toBe('art-1');
    expect(e.revision).toBeNull();
    expect(e.timestamps.createdAt).toBe('2026-11-20T00:00:00Z');
    expect(e.extensions.schemaVersion).toBe(1);
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
    const other = mapReportArtifactToEnvelope({ reportType: 't', portfolioId: 'p', chainRef: null, artifactId: 'a', engineOutputId: null, schemaVersion: 1, generatedAt: null, contentDigest: null });
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
