/**
 * W17 — mode semantics tests: ACTUAL / REFERENCE / DEGRADED selection matrix.
 * Pure function tests; no data is fabricated and no silent substitution is allowed.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import { MODE_PRESENTATION, selectPortfolioMode, type ModeCoverageInput } from './portfolioMode';

const base = { readPresent: true, revision: 1, provenanceDigest: 'ab'.repeat(32), observedAt: '2026-11-22T10:16:40Z' };

const fullCoverage: ModeCoverageInput = {
  activePositions: 3,
  valuedPositions: 3,
  unresolvedIdentity: 0,
  staleObservations: 0,
  unavailableObservations: 0,
  unknownObservations: 0,
  unreadableStatus: 0,
};

describe('W17 mode selection', () => {
  it('ACTUAL only when the read exists and every active position has a qualified observation', () => {
    const d = selectPortfolioMode({ ...base, coverage: fullCoverage });
    expect(d.mode).toBe('ACTUAL');
    expect(d.missing).toEqual([]);
  });

  it('REFERENCE when persisted revision data exists but no observation evidence exists — never ACTUAL', () => {
    const d = selectPortfolioMode({ ...base, coverage: null });
    expect(d.mode).toBe('REFERENCE');
    expect(d.missing).toContain('qualified observations');
    expect(d.reasons.join(' ')).toContain('not claimable');
  });

  it('DEGRADED when coverage is partial; the missing list names each gap', () => {
    const d = selectPortfolioMode({
      ...base,
      coverage: { ...fullCoverage, valuedPositions: 1, unresolvedIdentity: 1, staleObservations: 1 },
    });
    expect(d.mode).toBe('DEGRADED');
    expect(d.missing.join(' ')).toContain('2 active position(s) without a qualified observation');
    expect(d.missing.join(' ')).toContain('unresolved identit');
    expect(d.missing.join(' ')).toContain('stale');
  });

  it('DEGRADED distinguishes UNKNOWN (no observation) from STALE and UNAVAILABLE', () => {
    const d = selectPortfolioMode({ ...base, coverage: { ...fullCoverage, valuedPositions: 2, unknownObservations: 1 } });
    expect(d.mode).toBe('DEGRADED');
    expect(d.missing.join(' ')).toContain('UNKNOWN');
    const d2 = selectPortfolioMode({ ...base, coverage: { ...fullCoverage, valuedPositions: 2, unavailableObservations: 1 } });
    expect(d2.missing.join(' ')).toContain('unavailable');
    expect(d2.missing.join(' ')).not.toContain('UNKNOWN');
  });

  it('DEGRADED when the read itself is unavailable — never claims a mode it cannot support', () => {
    const d = selectPortfolioMode({ ...base, readPresent: false, revision: null });
    expect(d.mode).toBe('DEGRADED');
    expect(d.missing).toContain('portfolio read');
    expect(d.missing).toContain('revision identity');
  });

  it('missing digest / timestamp are named, and still allow REFERENCE (persisted) but block ACTUAL', () => {
    const d = selectPortfolioMode({ ...base, provenanceDigest: '', observedAt: null, coverage: fullCoverage });
    expect(d.mode).not.toBe('ACTUAL'); // digest missing -> not claimable as actual identity
    expect(d.missing).toContain('provenance digest');
    expect(d.missing).toContain('read/source timestamp');
    const r = selectPortfolioMode({ ...base, provenanceDigest: '', observedAt: null, coverage: null });
    expect(r.mode).toBe('REFERENCE');
  });

  it('zero active positions with a read is REFERENCE (nothing to observe), not ACTUAL', () => {
    const d = selectPortfolioMode({
      ...base,
      coverage: { activePositions: 0, valuedPositions: 0, unresolvedIdentity: 0, staleObservations: 0, unavailableObservations: 0, unknownObservations: 0, unreadableStatus: 0 },
    });
    expect(d.mode).toBe('REFERENCE');
  });

  it('mode presentation pairs symbol + label + semantic token for every mode (non-color-only)', () => {
    expect(Object.keys(MODE_PRESENTATION).sort()).toEqual(['ACTUAL', 'DEGRADED', 'REFERENCE']);
    for (const m of ['ACTUAL', 'REFERENCE', 'DEGRADED'] as const) {
      expect(MODE_PRESENTATION[m].label).toBe(m);
      expect(MODE_PRESENTATION[m].symbol.length).toBeGreaterThan(0);
      expect(MODE_PRESENTATION[m].colorVar).toContain('--color-status-');
    }
  });

  it('mode is a pure function of the input — transitions are explicit recomputations, no hidden state', () => {
    const a = selectPortfolioMode({ ...base, coverage: null });
    const b = selectPortfolioMode({ ...base, coverage: fullCoverage });
    const c = selectPortfolioMode({ ...base, coverage: { ...fullCoverage, valuedPositions: 1 } });
    expect([a.mode, b.mode, c.mode]).toEqual(['REFERENCE', 'ACTUAL', 'DEGRADED']);
  });
});
