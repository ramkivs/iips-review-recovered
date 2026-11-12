/**
 * Personal-portfolio identifier rules.
 *
 * The identifier is the whole basis of multi-portfolio support, so its rules are pinned
 * here: freshness, uniqueness, admissibility, the personal prefix that separates manual
 * portfolios from broker imports, and the retired default that must never come back.
 */
import { describe, it, expect } from 'vitest';
import {
  isAdmissiblePersonalPortfolioId,
  isPersonalPortfolioId,
  newPersonalPortfolioId,
  PERSONAL_PORTFOLIO_ID_PREFIX,
  RETIRED_DEFAULT_PORTFOLIO_ID,
} from './personalPortfolioIds';

/** The shape the provider enforces for a personal-use identifier. */
const PROVIDER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

describe('personal portfolio identifiers', () => {
  it('proposed identifiers satisfy the provider pattern', () => {
    for (let i = 0; i < 200; i += 1) {
      const id = newPersonalPortfolioId();
      expect(PROVIDER_PATTERN.test(id)).toBe(true);
      expect(id.length).toBeLessThanOrEqual(64);
    }
  });

  it('proposed identifiers are distinct', () => {
    const ids = new Set(Array.from({ length: 500 }, () => newPersonalPortfolioId()));
    expect(ids.size).toBe(500);
  });

  it('every proposed identifier carries the personal prefix', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(newPersonalPortfolioId().startsWith(PERSONAL_PORTFOLIO_ID_PREFIX)).toBe(true);
    }
  });

  it('a fresh identifier is never the retired default', () => {
    for (let i = 0; i < 200; i += 1) {
      expect(newPersonalPortfolioId()).not.toBe(RETIRED_DEFAULT_PORTFOLIO_ID);
    }
    // The retired default is also outside the personal population, so it can never be
    // listed, selected or edited by this surface.
    expect(isPersonalPortfolioId(RETIRED_DEFAULT_PORTFOLIO_ID)).toBe(false);
  });

  it('recognises the personal population and excludes everything else', () => {
    expect(isPersonalPortfolioId(newPersonalPortfolioId())).toBe(true);
    // Broker-import portfolios must never be manageed by this surface.
    expect(isPersonalPortfolioId('DHAN_PORTFOLIO')).toBe(false);
    expect(isPersonalPortfolioId('ZERODHA_PORTFOLIO')).toBe(false);
    expect(isPersonalPortfolioId(RETIRED_DEFAULT_PORTFOLIO_ID)).toBe(false);
    // A bare UUID (the provider's own generated id shape) is not personal either.
    expect(isPersonalPortfolioId('3f2a1b4c-5d6e-7f80-9a1b-2c3d4e5f6071')).toBe(false);
  });

  it('rejects malformed identifiers as inadmissible', () => {
    expect(isAdmissiblePersonalPortfolioId('')).toBe(false);
    expect(isAdmissiblePersonalPortfolioId('-leading')).toBe(false);
    expect(isAdmissiblePersonalPortfolioId('has space')).toBe(false);
    expect(isAdmissiblePersonalPortfolioId('has/slash')).toBe(false);
    expect(isAdmissiblePersonalPortfolioId('x'.repeat(65))).toBe(false);
    expect(isAdmissiblePersonalPortfolioId('PERSONAL-1')).toBe(true);
  });
});
