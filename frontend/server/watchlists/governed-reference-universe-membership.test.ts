/**
 * NP-09 / UI07 — membership of the served governed universe, pinned against the real
 * composition (`buildGovernedUniverseProvider` in `executive-transport.ts`).
 *
 * The reported security-addition failure (`TCS`, `ISIN:INE467B01029:EQ` → 404
 * `governed-row-not-found`) is fully explained by this membership: the served snapshot is the
 * certified-v2.0-reference-universe — the 13 certified SECTOR reference identifiers from
 * `PROGRAM_v1.1_REPLAY_BASELINE.json` — and it contains no issuer-level security at all.
 * These tests pin that fact so the absence can never be mistaken for a lookup defect, and so
 * any future change to the admitted membership is a deliberate, visible act.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { buildGovernedUniverseProvider } from '../executive-transport';

describe('certified-v2.0-reference-universe membership (as served to UI07)', () => {
  it('serves exactly the 13 certified sector reference identifiers — and no issuer securities', async () => {
    const provider = buildGovernedUniverseProvider();
    const rows = await provider.securities('tenant-not-used-by-this-provider');
    const ids = rows.map((row) => String(row.canonicalSecurityId));

    expect(ids).toContain('Technology'); // the certified member the UI copy points at
    expect(new Set(ids).size).toBe(ids.length); // K-3/D.3: unique membership
    expect([...ids].sort()).toEqual([
      'Automobile',
      'Banking',
      'Capital Markets',
      'Consumer',
      'Energy',
      'Healthcare',
      'Hospitality',
      'Industrials',
      'Insurance',
      'Materials & Metals',
      'Technology',
      'Telecommunications',
      'Utilities',
    ].sort());

    // The reported identifiers name an issuer, which is absent from this snapshot BY DESIGN
    // (sector-reference semantics). They must never silently become members.
    for (const absent of ['TCS', 'ISIN:INE467B01029:EQ', 'INE467B01029', 'tata consultancy services']) {
      expect(ids).not.toContain(absent);
    }
  });

  it('advertises the same snapshot it serves — provenance and rows come from one composition', async () => {
    const provider = buildGovernedUniverseProvider();
    const vintage = await provider.vintage('tenant-not-used-by-this-provider');
    expect(vintage.dataSource).toBe('governed:certified-v2.0-reference-universe');
    expect(vintage.mode).toBe('SNAPSHOT');
    expect(vintage.asOf).toBe('2026-08-09T00:00:00.000Z');
    expect(vintage.dataVersion).toBe('v1.1-replay-baseline');
  });
});
