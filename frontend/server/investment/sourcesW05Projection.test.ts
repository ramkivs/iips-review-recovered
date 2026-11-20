/**
 * W05 census capture (2026-11-19) — the source projection of the portfolio revision.
 *
 * `toHoldingObservation` serves the raw fields the W05 Step 1 capture consumes. The census
 * records `portfolioRevision` per row exactly as stored, so the projection carries the
 * portfolio's real revision (`G2PortfolioView.revision`) when the caller supplies it - and
 * stays silent when it does not. It never invents or substitutes a value (the capture fails
 * closed on a missing revision). The stored identity is projected losslessly under the flat
 * dotted key 'securityIdentity.securityId'; explicit null identities stay null so the capture
 * can preserve them as unresolved.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import type { G2HoldingView } from '../user-portfolio/userPortfolioContract.js';
import { toHoldingObservation } from './sources';

function makeHolding(overrides: Partial<G2HoldingView> = {}): G2HoldingView {
  return {
    symbol: 'FIXTURE-SYM',
    companyId: '24',
    quantity: 2,
    averageBuyPrice: 100,
    currentPrice: 110,
    marketValue: 220,
    weightPercentage: 50,
    active: true,
    sourceBroker: 'dhan',
    lineageDigest: 'fixture-lineage',
    ...overrides,
  };
}

describe('W05 — portfolio revision projection (census portfolioRevision, never fabricated)', () => {
  it('projects the portfolio revision supplied by the caller exactly as raw portfolioRevision', () => {
    const observation = toHoldingObservation('DHAN_PORTFOLIO', makeHolding(), 0, 1);
    expect(observation.raw.portfolioRevision).toBe(1);
  });

  it('omits portfolioRevision when no portfolio revision is supplied - it is never invented', () => {
    const observation = toHoldingObservation('DHAN_PORTFOLIO', makeHolding(), 0);
    expect(observation.raw.portfolioRevision).toBeUndefined();
    const nullRevision = toHoldingObservation('DHAN_PORTFOLIO', makeHolding(), 0, null);
    expect(nullRevision.raw.portfolioRevision).toBeUndefined();
  });
});

describe('W05 — stored identity projection basis for the capture extraction', () => {
  it('projects the populated stored identity under the flat dotted securityIdentity.securityId key', () => {
    const observation = toHoldingObservation(
      'DHAN_PORTFOLIO',
      makeHolding({ securityIdentity: { securityId: 'ISIN:INE415A01038:EQ', isin: 'INE415A01038', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } }),
      0,
      1,
    );
    expect(observation.raw['securityIdentity.securityId']).toBe('ISIN:INE415A01038:EQ');
    expect(observation.raw['securityIdentity.series']).toBe('EQ');
  });

  it('projects an explicit null identity as raw securityIdentity null with no dotted key to read', () => {
    const observation = toHoldingObservation('DHAN_PORTFOLIO', makeHolding({ securityIdentity: null }), 1, 1);
    expect(observation.raw.securityIdentity).toBeNull();
    expect(observation.raw['securityIdentity.securityId']).toBeUndefined();
    expect(observation.raw['securityIdentity.isin']).toBeUndefined();
    expect(observation.raw['securityIdentity.series']).toBeUndefined();
    expect(observation.raw['securityIdentity.isinAuthority']).toBeUndefined();
  });

  it('never derives identity fields from symbol, companyId or identityStatus', () => {
    const observation = toHoldingObservation(
      'DHAN_PORTFOLIO',
      makeHolding({ securityIdentity: null, identityStatus: 'RESOLVED' }),
      2,
      1,
    );
    // The import flags pass through as raw data; nothing identity-shaped is derived from them.
    expect(observation.raw.identityStatus).toBe('RESOLVED');
    expect(observation.raw['securityIdentity.securityId']).toBeUndefined();
    expect(observation.securityIdentity).toBeNull();
  });
});
