/**
 * IID-4 — AC-4.3: the subject union, and the two crossings that must be impossible.
 *
 * A candidate is not an empty holding. These tests pin that at the constructor level: no position key can
 * be attached, `quantities` cannot be a number, and a candidate can only be filed under an `hc:` chain.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  SubjectError,
  assertSubjectScopeAgreement,
  candidateSubject,
  heldSubject,
  subjectChainScope,
  subjectPayloadScope,
} from '../../src/investment/disposition/subject';
import { subjectScope } from '../../src/investment/contracts/disposition';
import { candidateFixture, heldFixture } from './dispositionFixtures';

describe('AC-4.3 — candidate subject', () => {
  test('a candidate carries quantities NOT_APPLICABLE and no position key', () => {
    const candidate = candidateFixture();
    assert.equal(candidate.quantities, 'NOT_APPLICABLE');
    assert.equal('positionKey' in candidate, false);
    assert.equal(candidate.kind, 'CANDIDATE');
  });

  test('a candidate with a position key is refused', () => {
    assert.throws(
      () => candidateSubject({ ...candidateInput(), positionKey: 'pf#IN:ISIN:IN0000000201' } as never),
      (error: unknown) => error instanceof SubjectError && error.reason === 'POSITION_FACTS_FORBIDDEN',
    );
  });

  test('a candidate whose quantities are a number is refused (0 included)', () => {
    for (const quantities of [0, 1, null]) {
      assert.throws(
        () => candidateSubject({ ...candidateInput(), quantities } as never),
        (error: unknown) => error instanceof SubjectError && error.reason === 'QUANTITIES_MUST_BE_NOT_APPLICABLE',
        `quantities=${String(quantities)} should be refused`,
      );
    }
  });

  test('a candidate may have no portfolio at all', () => {
    const candidate = candidateSubject({ ...candidateInput(), contextPortfolioId: null });
    assert.equal(candidate.contextPortfolioId, null);
    assert.equal(subjectChainScope(candidate), 'hc:none/IN:ISIN:IN0000000201');
  });

  test('the candidate chain scope is hc: and the payload label is not a chain identity', () => {
    const candidate = candidateFixture();
    assert.match(subjectChainScope(candidate), /^hc:/);
    assert.notEqual(subjectChainScope(candidate), subjectPayloadScope(candidate));
  });
});

describe('held subject', () => {
  test('the position key is derived from portfolio and security, never accepted', () => {
    const held = heldFixture();
    assert.equal(held.positionKey, 'pf-iid4-demo#IN:ISIN:IN0000000201');
    assert.match(subjectChainScope(held), /^hd:pf-iid4-demo\//);
  });

  test('a held subject without observations is refused rather than defaulted to zero', () => {
    assert.throws(
      () => heldSubject({ ...heldInput(), quantities: {} as never }),
      (error: unknown) => error instanceof SubjectError && error.reason === 'POSITION_FACTS_REQUIRED',
    );
  });

  test('the contract-level scope agrees with the disposition-level scope', () => {
    const held = heldFixture();
    assert.equal(subjectScope({ kind: 'HELD', portfolioId: held.portfolioId, positionKey: held.positionKey as never, securityId: held.securityId, issuerId: held.issuerId }), subjectChainScope(held));
  });
});

describe('scope agreement', () => {
  test('a candidate cannot be filed on an hd: chain', () => {
    const candidate = candidateFixture();
    assert.throws(
      () => assertSubjectScopeAgreement(candidate, 'hd:pf-iid4-demo/IN:ISIN:IN0000000201'),
      (error: unknown) => error instanceof SubjectError,
    );
  });

  test('a held subject cannot be filed on an hc: chain', () => {
    const held = heldFixture();
    assert.throws(
      () => assertSubjectScopeAgreement(held, 'hc:pf-iid4-demo/IN:ISIN:IN0000000201'),
      (error: unknown) => error instanceof SubjectError,
    );
  });

  test('a matching scope is accepted, and a different subject in the same prefix is not', () => {
    const held = heldFixture();
    assert.doesNotThrow(() => assertSubjectScopeAgreement(held, subjectChainScope(held)));
    assert.throws(
      () => assertSubjectScopeAgreement(held, 'hd:pf-other/IN:ISIN:IN0000000201'),
      (error: unknown) => error instanceof SubjectError && error.reason === 'SECURITY_ID_INVALID',
    );
  });
});

function candidateInput() {
  return {
    issuerId: 'IN:EQISIN:IN0000000201',
    securityId: 'IN:ISIN:IN0000000201',
    contextPortfolioId: 'pf-iid4-demo',
    origin: 'WATCHLIST' as const,
    symbol: 'AARAVSYN',
    exchange: 'NSE' as const,
    securityClass: 'EQUITY' as const,
    identityState: 'RESOLVED' as const,
  };
}

function heldInput() {
  return {
    portfolioId: 'pf-iid4-demo',
    securityId: 'IN:ISIN:IN0000000201',
    issuerId: 'IN:EQISIN:IN0000000201',
    symbol: 'AARAVSYN',
    exchange: 'NSE' as const,
    securityClass: 'EQUITY' as const,
    heldAsOf: '2026-11-06T06:00:00.000Z',
    identityState: 'RESOLVED' as const,
    quantities: heldFixture().quantities,
  };
}
