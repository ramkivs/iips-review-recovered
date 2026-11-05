/**
 * IID-4 — portfolio context built from the portfolio read model.
 *
 * The properties that matter, and why:
 *
 *   reuse        the weight comes from the published `weightPercentage`, not from a second calculation
 *   unmeasured   a shortfall is 100 % minus the published weight sum — never 0, never dropped
 *   coverage     a sector exposure over part of the portfolio says which part
 *   no fiction   no conviction/quality/risk score, no diversification band, no correlation coefficient
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import { buildPortfolioContext, candidatePortfolioFacts } from './portfolioContext';
import { holdingOf, portfolioView } from './dispositionTestFixtures';

const SUBJECT_SECURITY = 'IN:ISIN:IN0000000201';
const OTHER_SECURITY_SAME_ISSUER = 'IN:ISIN:IN0000000219';
const OTHER_ISSUER_SECURITY = 'IN:ISIN:IN0000000300';
const SUBJECT_ISSUER = 'IN:EQISIN:IN0000000201';

const identity = (holding: { isin?: string }) => {
  if (holding.isin === OTHER_ISSUER_SECURITY) return { issuerId: 'IN:CIN:L65110KA1981PLC013116', sector: 'Banking' };
  if (holding.isin === OTHER_SECURITY_SAME_ISSUER) return { issuerId: SUBJECT_ISSUER, sector: 'Technology' };
  if (holding.isin === SUBJECT_SECURITY) return { issuerId: SUBJECT_ISSUER, sector: 'Technology' };
  return { issuerId: null, sector: null };
};

describe('weights are reused from the read model', () => {
  it('reports the published weight for the subject', () => {
    const view = portfolioView([holdingOf(SUBJECT_SECURITY, { weightPercentage: 40 })]);
    const { block, facts } = buildPortfolioContext({
      view,
      subjectSecurityId: SUBJECT_SECURITY,
      subjectIssuerId: SUBJECT_ISSUER,
      subjectSector: 'Technology',
      asOf: '2026-11-06T05:00:00.000Z',
      resolveIdentity: identity,
    });
    expect(block.weightPct.value).toBe(40);
    expect(block.weightPct.source?.ref).toBe('user-portfolio:view');
    expect(facts.weightPct).toBe(40);
  });

  it('carries the read model revision so a stale context is visible', () => {
    const view = portfolioView([holdingOf(SUBJECT_SECURITY)], 42);
    const { block } = buildPortfolioContext({
      view,
      subjectSecurityId: SUBJECT_SECURITY,
      subjectIssuerId: SUBJECT_ISSUER,
      subjectSector: 'Technology',
      asOf: '2026-11-06T05:00:00.000Z',
      resolveIdentity: identity,
    });
    expect(block.portfolioRevision).toBe(42);
  });
});

describe('unmeasured weight is never zero-by-default', () => {
  it('reports the shortfall when the holdings do not cover the portfolio', () => {
    const view = portfolioView([
      holdingOf(SUBJECT_SECURITY, { weightPercentage: 40 }),
      holdingOf(OTHER_SECURITY_SAME_ISSUER, { weightPercentage: 20, identityStatus: 'UNRESOLVED' }),
    ]);
    const { block } = buildPortfolioContext({
      view,
      subjectSecurityId: SUBJECT_SECURITY,
      subjectIssuerId: SUBJECT_ISSUER,
      subjectSector: 'Technology',
      asOf: '2026-11-06T05:00:00.000Z',
      resolveIdentity: identity,
    });
    expect(block.holdingsUnresolved).toBe(1);
    expect(block.measuredWeightPct).toBe(40);
    expect(block.unmeasuredWeightPct.value).toBe(60);
    expect(block.unmeasuredWeightPct.presence).toBe('PRESENT');
    expect(block.notes.join(' ')).toMatch(/unresolved/i);
  });

  it('reports a measured zero when the read model accounts for everything', () => {
    const view = portfolioView([
      holdingOf(SUBJECT_SECURITY, { weightPercentage: 60 }),
      holdingOf(OTHER_SECURITY_SAME_ISSUER, { weightPercentage: 40 }),
    ]);
    const { block } = buildPortfolioContext({
      view,
      subjectSecurityId: SUBJECT_SECURITY,
      subjectIssuerId: SUBJECT_ISSUER,
      subjectSector: 'Technology',
      asOf: '2026-11-06T05:00:00.000Z',
      resolveIdentity: identity,
    });
    expect(block.unmeasuredWeightPct.value).toBe(0);
    expect(block.measuredWeightPct).toBe(100);
  });

  it('reports a MISSING weight — not a zero — when the subject is not an active holding', () => {
    const view = portfolioView([holdingOf(OTHER_ISSUER_SECURITY, { weightPercentage: 100 })]);
    const { block, facts } = buildPortfolioContext({
      view,
      subjectSecurityId: SUBJECT_SECURITY,
      subjectIssuerId: SUBJECT_ISSUER,
      subjectSector: 'Technology',
      asOf: '2026-11-06T05:00:00.000Z',
      resolveIdentity: identity,
    });
    expect(block.weightPct.presence).toBe('MISSING');
    expect(block.weightPct.value).toBeNull();
    expect(facts.weightPct).toBeNull();
  });
});

describe('issuer exposure spans every security of the issuer', () => {
  it('sums both securities of the same issuer', () => {
    const view = portfolioView([
      holdingOf(SUBJECT_SECURITY, { weightPercentage: 25 }),
      holdingOf(OTHER_SECURITY_SAME_ISSUER, { weightPercentage: 15 }),
      holdingOf(OTHER_ISSUER_SECURITY, { weightPercentage: 60 }),
    ]);
    const { block } = buildPortfolioContext({
      view,
      subjectSecurityId: SUBJECT_SECURITY,
      subjectIssuerId: SUBJECT_ISSUER,
      subjectSector: 'Technology',
      asOf: '2026-11-06T05:00:00.000Z',
      resolveIdentity: identity,
    });
    expect(block.companyExposurePct.value).toBe(40);
    expect(block.sectorExposurePct.value).toBe(40);
  });
});

describe('sector coverage is disclosed', () => {
  it('says how much of the measured weight carries a sector reference', () => {
    const view = portfolioView([
      holdingOf(SUBJECT_SECURITY, { weightPercentage: 40 }),
      holdingOf(OTHER_ISSUER_SECURITY, { weightPercentage: 30 }),
      // No identity resolution available for this one: it is measured weight with no sector.
      holdingOf('IN:ISIN:IN0000000409', { weightPercentage: 30 }),
    ]);
    const { block } = buildPortfolioContext({
      view,
      subjectSecurityId: SUBJECT_SECURITY,
      subjectIssuerId: SUBJECT_ISSUER,
      subjectSector: 'Technology',
      asOf: '2026-11-06T05:00:00.000Z',
      resolveIdentity: identity,
    });
    expect(block.measuredWeightPct).toBe(100);
    expect(block.sectorMeasuredWeightPct.value).toBe(70);
    expect(block.sectorExposurePct.value).toBe(40);
    expect(block.notes.join(' ')).toMatch(/sector references cover 70\.00% of 100\.00%/);
  });

  it('reports sector exposure as not computable when the subject has no sector', () => {
    const view = portfolioView([holdingOf(SUBJECT_SECURITY, { weightPercentage: 100 })]);
    const { block, facts } = buildPortfolioContext({
      view,
      subjectSecurityId: SUBJECT_SECURITY,
      subjectIssuerId: SUBJECT_ISSUER,
      subjectSector: null,
      asOf: '2026-11-06T05:00:00.000Z',
      resolveIdentity: identity,
    });
    expect(block.sectorExposurePct.presence).toBe('NOT_COMPUTABLE');
    expect(facts.sectorExposurePct).toBeNull();
    expect(block.notes.join(' ')).toMatch(/no sector reference/i);
  });
});

describe('nothing is fabricated', () => {
  it('carries no conviction, quality or risk score it was not given', () => {
    const view = portfolioView([holdingOf(SUBJECT_SECURITY)]);
    const { block } = buildPortfolioContext({
      view,
      subjectSecurityId: SUBJECT_SECURITY,
      subjectIssuerId: SUBJECT_ISSUER,
      subjectSector: 'Technology',
      asOf: '2026-11-06T05:00:00.000Z',
      resolveIdentity: identity,
    });
    expect(block.sectorReferenceContext.normalizedHolding).toBeNull();
    expect(block.sectorReferenceContext.evidenceClass).toBe('SECTOR_REFERENCE');
    expect(block.diversificationBand).toBeNull();
    expect(block.correlationFlags).toEqual([]);
    expect(block.concentrationBand.presence).toBe('NOT_COMPUTABLE');
    expect(block.notes.join(' ')).toMatch(/NOT computed/i);
  });

  it('labels count-based exposure as counts', () => {
    const view = portfolioView([
      holdingOf(SUBJECT_SECURITY, { weightPercentage: 50 }),
      holdingOf(OTHER_ISSUER_SECURITY, { weightPercentage: 50 }),
    ]);
    const { block } = buildPortfolioContext({
      view,
      subjectSecurityId: SUBJECT_SECURITY,
      subjectIssuerId: SUBJECT_ISSUER,
      subjectSector: 'Technology',
      asOf: '2026-11-06T05:00:00.000Z',
      resolveIdentity: identity,
    });
    expect(block.countBasedSectorExposure).toEqual({ Technology: 50, Banking: 50 });
    expect(block.countBasedConcentrationPct).toBe(50);
    expect(block.notes.join(' ')).toMatch(/holding COUNTS, not weights/);
  });
});

describe('candidate context', () => {
  it('a candidate holds nothing: weight 0 is a true zero, and sector exposure is still carried', () => {
    const view = portfolioView([holdingOf(OTHER_ISSUER_SECURITY, { weightPercentage: 100 })]);
    const facts = candidatePortfolioFacts({
      view,
      subjectSector: 'Banking',
      resolveIdentity: identity,
    });
    expect(facts.weightPct).toBe(0);
    expect(facts.companyExposurePct).toBe(0);
    expect(facts.sectorExposurePct).toBe(100);
    expect(facts.present).toBe(true);
  });
});
