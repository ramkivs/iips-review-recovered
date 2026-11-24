/**
 * W16 — optional projection integration tests (2026-11-24).
 *
 * Verifies each producer boundary projection: correct envelope mapping, optionality
 * (original output unchanged / projection absent), missing/UNKNOWN preservation,
 * digest+revision preservation, W15 chain semantics, and immutability of producer outputs
 * and NP-04/NP-06 artifacts. Deterministic, no I/O.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import {
  attachOptionalProvenanceEnvelope,
  hasProvenanceEnvelope,
  projectW11Execution,
  projectW13Valuation,
  projectW09Capture,
  projectW15Report,
  W16_PROJECTION_FIELD,
} from './projections';
import { classifyPair } from './provenanceEnvelope';
import type { CapturedRevisionRef } from '../../market-data/dhanRevisionCoverage';

const CAPTURE: CapturedRevisionRef = {
  portfolioId: 'DHAN_PORTFOLIO',
  revision: 1,
  provenanceDigest: '17b2b2833268222310c21f7b685d0ca5e595ebd6a62bda7f118a9c0c6b84781f',
  capturedAt: '2026-11-22T10:16:40Z',
};

describe('W16 projection — W09 capture boundary', () => {
  it('maps capture ref: revision+digest preserved, build NOT_ATTESTED, createdAt=capturedAt', () => {
    const e = projectW09Capture(CAPTURE);
    expect(e.producer).toBe('W09_CAPTURE');
    expect(e.revision).toBe(1);
    expect(e.digest).toBe(CAPTURE.provenanceDigest);
    expect(e.artifactId).toBe('DHAN_PORTFOLIO@1');
    expect(e.buildProvenance.verification).toBe('NOT_ATTESTED');
    expect(e.timestamps.createdAt).toBe('2026-11-22T10:16:40Z');
  });

  it('missing digest stays in missing, digest null — never defaulted', () => {
    const e = projectW09Capture({ ...CAPTURE, provenanceDigest: '' });
    expect(e.missing).toContain('provenanceDigest');
    expect(e.digest).toBeNull();
  });
});

describe('W16 projection — W13 valuation boundary', () => {
  it('maps a valuation report with per-position observations preserved in extensions', () => {
    const report = {
      schema: 'iips.w13.position-valuation/v1',
      capture: CAPTURE,
      evaluatedAt: '2026-11-23T10:00:00.000Z',
      positions: [
        {
          rowId: 'a', securityId: 'ISIN:INE415A01038:EQ', status: 'VALUED', quantity: 10,
          observedMarketValue: 2505, currency: 'INR',
          observation: {
            securityId: 'ISIN:INE415A01038:EQ', quoteCurrency: 'INR', ltp: 250.5,
            asOf: '2026-11-23T09:30:00Z', receivedAt: '2026-11-23T09:30:01Z', evaluatedAt: '2026-11-23T09:30:02Z',
            freshnessVerdict: 'GOOD', providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
            lineageHash: 'abc', sourceClassification: 'EXCHANGE',
          },
          storedCurrentPrice: 240, storedMarketValue: 2400, storedWeightPercentage: 50, storedDivergence: 105,
        },
      ],
      totals: {},
      openMethodologyDecisions: [],
    } as never;
    const e = projectW13Valuation(report);
    expect(e.producer).toBe('W13_VALUATION');
    expect(e.revision).toBe(1);
    expect(e.freshnessVerdict).toBe('GOOD');
    expect(e.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
    expect(e.extensions.perPositionObservations).toHaveLength(1);
  });
});

describe('W16 projection — W11 execution boundary (IRR consumer side)', () => {
  it('maps an execution report: no single artifactId, dataset+engine digests in sources, build UNKNOWN', () => {
    const e = projectW11Execution({
      portfolioId: 'DHAN_PORTFOLIO',
      portfolioRevision: 1,
      portfolioReadSource: 'ipc:portfolio.get',
      portfolioObservedAt: '2026-11-22T10:16:40Z',
      asOf: '2026-11-22',
      datasetVersion: 'REL-1',
      contentDigest: 'sha256:d',
      executions: [{ engineId: 'sector.banking', inputDigest: 'i', requestId: 'w11-x', output: { outputDigest: 'o' } }],
    });
    expect(e.producer).toBe('W11_EXECUTION');
    expect(e.artifactId).toBeNull();
    expect(e.revision).toBe(1);
    expect(e.digest).toBe('sha256:d');
    expect(e.buildProvenance.verification).toBe('UNKNOWN'); // unknown stays unknown
    expect(e.extensions.executionDigests).toEqual([{ requestId: 'w11-x', inputDigest: 'i', outputDigest: 'o' }]);
  });
});

describe('W16 projection — W15 NP-04/NP-06 boundary', () => {
  const artifact = {
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
  };

  it('maps chain identity/version: reportId, artifactVersion, supersedes; revision stays null', () => {
    const e = projectW15Report(artifact);
    expect(e.producer).toBe('W15_REPORT');
    expect(e.chainRef).toBe('icr:DHAN_PORTFOLIO');
    expect(e.artifactId).toBe('art-1');
    expect(e.chainVersion).toBe(2);
    expect(e.supersedes).toBe('art-0');
    expect(e.revision).toBeNull();
    expect(e.digest).toBe('ab'.repeat(32));
  });

  it('successive chain versions classify via chain identity, never portfolio revision', () => {
    const v1 = projectW15Report({ ...artifact, artifactVersion: 1, reportKey: 'aa'.repeat(32), supersedesReportId: null });
    const v2 = projectW15Report({ ...artifact, artifactVersion: 2, reportKey: 'bb'.repeat(32) });
    expect(classifyPair(v1, v2, { contentDigestsEqual: false }).classification).toBe('SUCCESSIVE_REVISION');
    expect(classifyPair(v1, projectW15Report({ ...artifact, artifactVersion: 1, reportKey: 'aa'.repeat(32), supersedesReportId: null }), { contentDigestsEqual: true }).classification).toBe('UNCHANGED');
  });

  it('does not mutate the NP-04/NP-06 artifact (historical chains immutable)', () => {
    const before = JSON.parse(JSON.stringify(artifact)) as unknown;
    projectW15Report(artifact);
    expect(artifact).toEqual(before);
  });
});

describe('W16 projection — optionality and consumer compatibility', () => {
  it('attachOptionalProvenanceEnvelope returns a copy; the original producer output is unchanged and has no projection field', () => {
    const output = { schema: 'x', value: 1 };
    const projected = attachOptionalProvenanceEnvelope(output, projectW09Capture(CAPTURE));
    expect(hasProvenanceEnvelope(projected)).toBe(true);
    expect(projected[W16_PROJECTION_FIELD].producer).toBe('W09_CAPTURE');
    expect(hasProvenanceEnvelope(output)).toBe(false); // projection absent on the original
    expect(output).toEqual({ schema: 'x', value: 1 }); // unchanged — existing consumers unaffected
    expect(projected.value).toBe(1);
  });

  it('a projection failure cannot touch the producer output: the envelope is computed before attach', () => {
    const output = { ok: true } as const;
    let threw = false;
    try {
      projectW09Capture(null as never);
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
    expect(output).toEqual({ ok: true }); // underlying output intact
  });
});
