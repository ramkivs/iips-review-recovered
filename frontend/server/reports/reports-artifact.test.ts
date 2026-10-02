/**
 * Program v3.0 — NP-06 Reports: canonical artifact + §5.3 validation contract + composition.
 *
 * The composition tests drive the REAL frozen CSIP `ReportingEngine` (read-only). It has no runtime
 * imports — its only import is type-only — so it can be executed directly, which lets this suite
 * pin the engine's ACTUAL identifier form against the mirror used to detect and reject that form
 * as durable instance identity.
 */
import { describe, it, expect } from 'vitest';
import { ReportingEngine } from '../../../iips-platform/src/sector-engines/cross-sector/reporting/ReportingEngine';
import {
  ReportValidationError,
  engineContentId,
  validateArtifact,
  validateArtifactChain,
  validateGeneratedAt,
  validateOwnership,
  validateProvenance,
  validateReportKey,
} from './artifact';
import { canonicalizePayload, deriveReportKey } from './canonical';
import { composeReportContent, ownershipFor } from './composition';

const OWNER = { tenantId: 'tenant-A', userId: 'user-a' };
const GENERATED_AT = '2026-10-02T09:00:00.000Z';

/**
 * Minimal input satisfying the frozen engine's read surface. Only fields the engine actually reads
 * are supplied; the engine is not modified and no engine behaviour is asserted here.
 */
function engineInput(scenario = 'Base') {
  return {
    intelligence: {
      scenario,
      sectorExposure: { Technology: 0.4, Energy: 0.2 },
      concentration: { hhi: 0.31 },
      diversificationScore: 0.72,
      avgConviction: 0.66,
      avgQuality: 0.71,
      avgRisk: 0.22,
    },
    ranking: [{ companyId: 'TECH-1', sector: 'Technology', conviction: 0.8 }],
    allocation: { recommendation: { Technology: 0.4 }, rulesApplied: ['cap-40'] },
    diversification: { diversificationBand: 'MODERATE', flags: [] },
    opportunity: { top: [{ companyId: 'TECH-1', sector: 'Technology', conviction: 0.8 }], rationale: 'reasons' },
    correlation: { flags: [] },
  } as never;
}

type BuildArgs = Parameters<ReportingEngine['build']>;

function realEngineOutput(
  reportType: BuildArgs[0] = 'Portfolio Summary',
  portfolioId = 'P-1',
  scenario = 'Base',
) {
  const input = engineInput(scenario) as unknown as {
    intelligence: BuildArgs[2];
    ranking: BuildArgs[3];
    allocation: BuildArgs[4];
    diversification: BuildArgs[5];
    opportunity: BuildArgs[6];
    correlation: BuildArgs[7];
  };
  return new ReportingEngine().build(
    reportType,
    portfolioId,
    input.intelligence,
    input.ranking,
    input.allocation,
    input.diversification,
    input.opportunity,
    input.correlation,
  );
}

function contentFor(overrides: Record<string, unknown> = {}) {
  const output = realEngineOutput();
  const content = composeReportContent({
    engineOutput: output,
    generatedAt: GENERATED_AT,
    parameters: { horizon: '12m' },
  });
  return { ...content, ...overrides };
}

function validArtifact(overrides: Record<string, unknown> = {}) {
  const content = contentFor(overrides.content as Record<string, unknown> | undefined);
  return {
    reportKey: content.reportKey,
    reportId: '5f1c2f0e-6a1a-4a1f-9f0e-1d2c3b4a5e6f',
    reportType: content.reportType,
    portfolioId: content.portfolioId,
    scenario: content.scenario,
    parameters: content.parameters,
    schemaVersion: content.schemaVersion,
    artifactVersion: 1,
    supersedesReportId: null,
    generatedAt: content.generatedAt,
    canonicalPayload: content.canonicalPayload,
    ownership: OWNER,
    provenance: content.provenance,
    ...overrides,
  };
}

describe('NP-06 composition — from the frozen ReportingEngine output (read-only)', () => {
  it('pins the engine\'s ACTUAL identifier form against the mirror used to reject it', () => {
    for (const [type, portfolio, expected] of [
      ['Portfolio Summary', 'P-1', 'report-portfolio-summary-P-1'],
      ['Executive', 'P-2', 'report-executive-P-2'],
      ['Investment Committee', 'P-3', 'report-investment-committee-P-3'],
    ] as const) {
      const out = realEngineOutput(type, portfolio);
      expect(out.reportId).toBe(expected);
      expect(out.reportId).toBe(engineContentId(type, portfolio));
    }
  });

  it('composes canonical content from the real engine output', () => {
    const output = realEngineOutput();
    const content = composeReportContent({ engineOutput: output, generatedAt: GENERATED_AT });

    expect(content.reportType).toBe('Portfolio Summary');
    expect(content.portfolioId).toBe('P-1');
    // Scenario is read from the engine payload, not invented.
    expect(content.scenario).toBe('Base');
    expect(content.schemaVersion).toBe(1);
    expect(content.generatedAt).toBe(GENERATED_AT);
    expect(content.canonicalPayload).toBe(canonicalizePayload(output.payload));
    expect(content.reportKey).toMatch(/^[0-9a-f]{64}$/);
    expect(content.reportKey).toBe(
      deriveReportKey({ reportType: 'Portfolio Summary', portfolioId: 'P-1', scenario: 'Base', parameters: null }),
    );
  });

  it('records the engine output as provenance, never as instance identity', () => {
    const output = realEngineOutput();
    const content = composeReportContent({ engineOutput: output, generatedAt: GENERATED_AT });
    expect(content.provenance.engineOutputId).toBe(output.reportId);
    // The write-path content carries NO durable reportId at all — createInstance assigns it.
    expect('reportId' in content).toBe(false);
    expect('artifactVersion' in content).toBe(false);
  });

  it('composes content and then validates it as a durable artifact', () => {
    const artifact = { ...validArtifact(), reportId: 'a0b1c2d3-0000-4000-8000-000000000001' };
    const validated = validateArtifact(artifact, { expectedOwner: OWNER });
    expect(validated.reportType).toBe('Portfolio Summary');
    expect(validated.ownership).toEqual(OWNER);
  });

  it('does not mutate the engine output it consumes', () => {
    const output = realEngineOutput();
    const snapshot = JSON.stringify(output);
    composeReportContent({ engineOutput: output, generatedAt: GENERATED_AT, parameters: { z: 1, a: 2 } });
    expect(JSON.stringify(output)).toBe(snapshot);
  });

  it('is deterministic for identical engine output', () => {
    const a = composeReportContent({ engineOutput: realEngineOutput(), generatedAt: GENERATED_AT });
    const b = composeReportContent({ engineOutput: realEngineOutput(), generatedAt: GENERATED_AT });
    expect(a.reportKey).toBe(b.reportKey);
    expect(a.canonicalPayload).toBe(b.canonicalPayload);
  });

  it('separates content identity from instance identity: identical content, different reportId', () => {
    const one = { ...validArtifact(), reportId: 'a0b1c2d3-0000-4000-8000-000000000001' };
    const two = { ...validArtifact(), reportId: 'a0b1c2d3-0000-4000-8000-000000000002' };
    expect(validateArtifact(one).reportKey).toBe(validateArtifact(two).reportKey);
    expect(one.reportId).not.toBe(two.reportId);
  });

  it('rejects an engine output whose reportId is not the frozen engine form', () => {
    const output = { ...realEngineOutput(), reportId: 'report-made-up-P-1' };
    expect(() => composeReportContent({ engineOutput: output, generatedAt: GENERATED_AT })).toThrow(ReportValidationError);
  });

  it('rejects a malformed engine output rather than coercing it', () => {
    expect(() => composeReportContent({ engineOutput: null as never, generatedAt: GENERATED_AT })).toThrow(/engineOutput must be an object/);
    expect(() => composeReportContent({ engineOutput: { reportId: 'x' } as never, generatedAt: GENERATED_AT })).toThrow(/reportType/);
  });

  it('rejects a non-canonicalizable engine payload', () => {
    const output = { ...realEngineOutput(), payload: { bad: Infinity } };
    expect(() => composeReportContent({ engineOutput: output, generatedAt: GENERATED_AT })).toThrow(/finite/);
  });
});

describe('NP-06 §5.3 — reportId must never be the engine content-derived identifier', () => {
  it('rejects the engine identifier as durable instance identity', () => {
    const engineId = engineContentId('Portfolio Summary', 'P-1');
    expect(engineId).toBe(realEngineOutput().reportId); // the real engine produces exactly this
    expect(() => validateArtifact({ ...validArtifact(), reportId: engineId })).toThrow(/content-derived/);
  });

  it('accepts a store-assigned opaque identifier', () => {
    expect(validateArtifact({ ...validArtifact(), reportId: '5f1c2f0e-6a1a-4a1f-9f0e-1d2c3b4a5e6f' }).reportId)
      .toBe('5f1c2f0e-6a1a-4a1f-9f0e-1d2c3b4a5e6f');
  });

  it('rejects an absent or empty reportId (instance identity is not optional)', () => {
    expect(() => validateArtifact({ ...validArtifact(), reportId: undefined })).toThrow(/reportId/);
    expect(() => validateArtifact({ ...validArtifact(), reportId: '' })).toThrow(/reportId/);
  });
});

describe('NP-06 §5.3 — validation contract, field by field (fail closed)', () => {
  it('accepts a conforming artifact and returns the normalized artifact', () => {
    const a = validateArtifact(validArtifact(), { expectedOwner: OWNER });
    expect(a.artifactVersion).toBe(1);
    expect(a.supersedesReportId).toBeNull();
    expect(a.parameters).toEqual({ horizon: '12m' });
  });

  it('rejects a reportKey that is not 64 lowercase hex', () => {
    expect(() => validateArtifact({ ...validArtifact(), reportKey: 'ABC' })).toThrow(/64 lowercase/);
    expect(() => validateArtifact({ ...validArtifact(), reportKey: 'A'.repeat(64) })).toThrow(/64 lowercase/);
  });

  it('rejects a reportKey that does not recompute from the canonical members', () => {
    const wrong = deriveReportKey({ reportType: 'Portfolio Summary', portfolioId: 'SOMETHING-ELSE' });
    expect(() => validateArtifact({ ...validArtifact(), reportKey: wrong })).toThrow(/does not recompute/);
  });

  it('detects tampering with a canonical member', () => {
    expect(() => validateArtifact({ ...validArtifact(), scenario: 'Tampered' })).toThrow(/does not recompute/);
  });

  it('rejects schemaVersion that is absent, non-integer, or < 1', () => {
    for (const v of [undefined, 0, -1, 1.5, '1']) {
      expect(() => validateArtifact({ ...validArtifact(), schemaVersion: v })).toThrow(/schemaVersion/);
    }
  });

  it('rejects artifactVersion that is absent, non-integer, or < 1', () => {
    for (const v of [undefined, 0, -1, 2.5, '1']) {
      expect(() => validateArtifact({ ...validArtifact(), artifactVersion: v })).toThrow(/artifactVersion/);
    }
  });

  it('enforces supersedesReportId null iff artifactVersion is 1', () => {
    expect(() => validateArtifact({ ...validArtifact(), artifactVersion: 1, supersedesReportId: 'x' }))
      .toThrow(/must be null when artifactVersion is 1/);
    expect(() => validateArtifact({ ...validArtifact(), artifactVersion: 2, supersedesReportId: null }))
      .toThrow(/must be a non-empty string when artifactVersion > 1/);
    expect(() => validateArtifact({ ...validArtifact(), artifactVersion: 2, supersedesReportId: '' }))
      .toThrow(/must be a non-empty string/);
  });

  it('rejects an artifact that supersedes itself', () => {
    const id = '5f1c2f0e-6a1a-4a1f-9f0e-1d2c3b4a5e6f';
    expect(() => validateArtifact({ ...validArtifact(), reportId: id, artifactVersion: 2, supersedesReportId: id }))
      .toThrow(/must not supersede itself/);
  });

  it('rejects a canonicalPayload that is not canonical text', () => {
    // Same content, wrong member order => not byte-canonical.
    expect(() => validateArtifact({ ...validArtifact(), canonicalPayload: '{"z":1,"a":2}' })).toThrow(/byte-identically/);
  });

  it('rejects a canonicalPayload that is not parseable JSON', () => {
    expect(() => validateArtifact({ ...validArtifact(), canonicalPayload: '{not json' })).toThrow(/parseable/);
  });

  it('rejects non-object payload/ownership/provenance', () => {
    expect(() => validateArtifact({ ...validArtifact(), canonicalPayload: 5 })).toThrow(/canonical UTF-8 JSON text/);
    expect(() => validateArtifact({ ...validArtifact(), ownership: null })).toThrow(/ownership/);
    expect(() => validateArtifact({ ...validArtifact(), provenance: [] })).toThrow(/provenance must be an object/);
  });

  it('rejects empty provenance and provenance without an engine reference', () => {
    expect(() => validateArtifact({ ...validArtifact(), provenance: {} })).toThrow(/must not be empty/);
    expect(() => validateArtifact({ ...validArtifact(), provenance: { note: 'x' } })).toThrow(/engineOutputId/);
  });

  it('does not mutate the artifact it validates', () => {
    const artifact = validArtifact();
    const snapshot = JSON.stringify(artifact);
    validateArtifact(artifact);
    expect(JSON.stringify(artifact)).toBe(snapshot);
  });
});

describe('NP-06 §5.3 — generatedAt must be ISO-8601 UTC with an explicit offset', () => {
  it.each([
    '2026-10-02T09:00:00Z',
    '2026-10-02T09:00:00.000Z',
    '2026-10-02T09:00:00+00:00',
    '2026-10-02T09:00:00-00:00',
  ])('accepts %s', (value) => {
    expect(validateGeneratedAt(value)).toBe(value);
  });

  it.each([
    ['offset-less local time', '2026-10-02T09:00:00'],
    ['offset-less with millis', '2026-10-02T09:00:00.000'],
    ['non-UTC offset', '2026-10-02T09:00:00+05:30'],
    ['non-UTC negative offset', '2026-10-02T09:00:00-04:00'],
    ['date only', '2026-10-02'],
    ['out-of-range hour', '2026-10-02T24:00:00Z'],
    ['out-of-range minute', '2026-10-02T09:60:00Z'],
    ['impossible calendar date', '2026-02-30T00:00:00Z'],
    ['non-leap Feb 29', '2025-02-29T00:00:00Z'],
    ['non-string', 1759400000],
  ])('rejects %s', (_name, value) => {
    expect(() => validateGeneratedAt(value)).toThrow(ReportValidationError);
  });

  it('accepts a real leap day', () => {
    expect(validateGeneratedAt('2024-02-29T00:00:00Z')).toBe('2024-02-29T00:00:00Z');
  });
});

describe('NP-06 §5.3 — ownership equals the authenticated principal', () => {
  it('rejects ownership that differs from the creating principal', () => {
    expect(() => validateArtifact(validArtifact(), { expectedOwner: { tenantId: 'tenant-B', userId: 'user-a' } }))
      .toThrow(/must equal the creating principal/);
    expect(() => validateArtifact(validArtifact(), { expectedOwner: { tenantId: 'tenant-A', userId: 'user-b' } }))
      .toThrow(/must equal the creating principal/);
  });

  it('requires both ownership members to be non-empty', () => {
    expect(() => validateOwnership({ tenantId: '', userId: 'u' })).toThrow(/tenantId/);
    expect(() => validateOwnership({ tenantId: 't', userId: '' })).toThrow(/userId/);
    expect(() => validateOwnership({ tenantId: 't' })).toThrow(/userId/);
  });

  it('derives ownership from the principal only — there is no owner parameter', () => {
    expect(ownershipFor({ tenantId: 'tenant-A', userId: 'user-a' })).toEqual(OWNER);
    // The composer's input type has no ownership/owner field; supplying one cannot influence it.
    const content = composeReportContent({
      engineOutput: realEngineOutput(),
      generatedAt: GENERATED_AT,
      ownership: { tenantId: 'tenant-B', userId: 'attacker' },
    } as never);
    expect('ownership' in content).toBe(false);
  });

  it('rejects a principal that is absent or has empty members', () => {
    expect(() => ownershipFor(null as never)).toThrow(/principal is required/);
    expect(() => ownershipFor({ tenantId: '', userId: 'u' })).toThrow(/tenantId/);
    expect(() => ownershipFor({ tenantId: 't', userId: '' })).toThrow(/userId/);
  });

  it('requires provenance to reference the engine output', () => {
    expect(validateProvenance({ engineOutputId: 'report-x-P-1' }).engineOutputId).toBe('report-x-P-1');
    expect(() => validateProvenance({ engineOutputId: '' })).toThrow(/engineOutputId/);
  });

  it('validates reportKey in isolation', () => {
    const members = { reportType: 'Executive', portfolioId: 'P-1' };
    const key = deriveReportKey(members);
    expect(validateReportKey(key, members)).toBe(key);
    expect(() => validateReportKey('deadbeef', members)).toThrow(/64 lowercase/);
  });
});

describe('NP-06 §5.3 / C1 / C3 — chain contiguity, single-parent supersession, immutable ownership', () => {
  const ids = ['v1', 'v2', 'v3'];

  function chain(versions = 3) {
    return Array.from({ length: versions }, (_, i) => ({
      ...validArtifact(),
      reportId: ids[i]!,
      artifactVersion: i + 1,
      supersedesReportId: i === 0 ? null : ids[i - 1]!,
    }));
  }

  it('accepts a contiguous single-parent chain', () => {
    expect(validateArtifactChain(chain()).map((a) => a.artifactVersion)).toEqual([1, 2, 3]);
  });

  it('accepts a chain supplied out of order', () => {
    const c = chain();
    expect(validateArtifactChain([c[2]!, c[0]!, c[1]!]).map((a) => a.artifactVersion)).toEqual([1, 2, 3]);
  });

  it('rejects a gap in artifactVersion (contiguity)', () => {
    const c = chain();
    c[2] = { ...c[2]!, artifactVersion: 4 };
    expect(() => validateArtifactChain(c)).toThrow(/contiguous/);
  });

  it('rejects a chain that does not start at 1', () => {
    const c = chain();
    c[0] = { ...c[0]!, artifactVersion: 2, supersedesReportId: 'x' };
    expect(() => validateArtifactChain(c)).toThrow(/contiguous/);
  });

  it('rejects branching supersession (not single-parent)', () => {
    const c = chain();
    c[2] = { ...c[2]!, supersedesReportId: ids[0]! }; // points at v1, not v2
    expect(() => validateArtifactChain(c)).toThrow(/single-parent/);
  });

  it('rejects duplicate reportId across versions', () => {
    const c = chain();
    // Duplicate an EARLIER id (not this version's own supersedes target, which would trip the
    // self-supersession check first) so the duplicate-instance check is the one exercised.
    c[2] = { ...c[2]!, reportId: ids[0]! };
    expect(() => validateArtifactChain(c)).toThrow(/distinct durable reportId/);
  });

  it('rejects ownership changing across a chain (immutable ownership)', () => {
    const c = chain();
    c[2] = { ...c[2]!, ownership: { tenantId: 'tenant-B', userId: 'user-a' } };
    expect(() => validateArtifactChain(c)).toThrow(/ownership is immutable/);
  });

  it('rejects reportType or portfolioId changing across a chain', () => {
    // Recompute the content identity so the artifact is internally consistent; only then is the
    // chain-level identity check the thing being exercised.
    const movedKey = deriveReportKey({
      reportType: 'Portfolio Summary',
      portfolioId: 'P-OTHER',
      scenario: 'Base',
      parameters: { horizon: '12m' },
    });
    const c = chain();
    c[2] = { ...c[2]!, portfolioId: 'P-OTHER', reportKey: movedKey };
    expect(() => validateArtifactChain(c)).toThrow(/fixed across a chain/);
  });

  it('rejects an empty chain', () => {
    expect(() => validateArtifactChain([])).toThrow(/non-empty/);
  });
});
