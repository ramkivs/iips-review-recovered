/**
 * IID-1 — identity resolution ladder (AC-1.1 … AC-1.6, AC-1.10).
 *
 * The reference observations carry one deliberate case per resolution state. Each test states the state
 * and the reason, because "unresolved" without a reason is not an answer a user can act on.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildBinding,
  identityInputOf,
  resolveIdentity,
  type ResolveContext,
} from '../../src/investment/identity/resolver';
import { REASON_TEXT } from '../../src/investment/identity/types';
import { loadFixtureSources, fixtureObservations, FIXTURE_AS_OF } from './identityFixture';

const sources = loadFixtureSources();
const context: ResolveContext = { sources, asOf: FIXTURE_AS_OF };
const observations = fixtureObservations();
const byId = (id: string) => observations.find((observation) => observation.observationId === id)!;
const resolve = (id: string) => resolveIdentity(identityInputOf(byId(id)), context);

describe('AC-1.1 — sector references are not identity', () => {
  test('a sector reference in the company reference is rejected, not treated as a symbol', () => {
    const resolution = resolve('H-05');
    assert.equal(resolution.state, 'UNMATCHED');
    assert.equal(resolution.failure?.reason, 'SECTOR_REFERENCE_NOT_AN_IDENTITY');
    assert.equal(resolution.issuerId, null);
    assert.equal(resolution.securityId, null);
    assert.match(REASON_TEXT.SECTOR_REFERENCE_NOT_AN_IDENTITY, /sector reference/);
  });

  test('every sector-reference form is rejected wherever it appears', () => {
    for (const reference of ['Banking-H1', 'Technology-H3', 'Capital Markets-R2', 'Utilities-REF12']) {
      for (const field of ['isin', 'symbol', 'companyIdHint'] as const) {
        const resolution = resolveIdentity(
          {
            observationId: 'probe',
            source: 'HOLDING',
            isin: field === 'isin' ? reference : null,
            symbol: field === 'symbol' ? reference : null,
            exchange: 'NSE',
            series: null,
            cin: null,
            companyIdHint: field === 'companyIdHint' ? reference : null,
          },
          context,
        );
        assert.equal(resolution.state, 'UNMATCHED', `${reference} in ${field}`);
        assert.equal(resolution.failure?.reason, 'SECTOR_REFERENCE_NOT_AN_IDENTITY', `${reference} in ${field}`);
      }
    }
  });
});

describe('AC-1.2 — ISIN integrity and no fallback', () => {
  test('a single-character corruption fails the Luhn check and is refused', () => {
    const resolution = resolve('B-01');
    assert.equal(resolution.state, 'REJECTED_MALFORMED_ISIN');
    assert.equal(resolution.failure?.reason, 'ISIN_CHECK_DIGIT_FAILED');
    assert.equal(resolution.issuerId, null);
  });

  test('a structurally impossible ISIN is distinguished from a corrupt one', () => {
    const resolution = resolveIdentity(
      {
        observationId: 'probe',
        source: 'HOLDING',
        isin: 'IN00000000',
        symbol: 'AARAV',
        exchange: 'NSE',
        series: null,
        cin: null,
        companyIdHint: null,
      },
      context,
    );
    assert.equal(resolution.state, 'REJECTED_MALFORMED_ISIN');
    assert.equal(resolution.failure?.reason, 'ISIN_FORMAT_INVALID');
  });

  test('no single-character corruption of an eligible ISIN can resolve', () => {
    // Exhaustive over positions x substitutions: a corrupt ISIN is never accepted, and never quietly
    // falls through to the symbol. Some corruptions remain Luhn-valid, so the assertion is that none
    // RESOLVES — refusal by state, not by luck.
    const eligible = 'IN0000000011';
    let malformed = 0;
    let checked = 0;
    for (let position = 0; position < eligible.length; position += 1) {
      for (const replacement of ['0', '1', '4', '5', '7', '9', 'X']) {
        const corrupted = eligible.slice(0, position) + replacement + eligible.slice(position + 1);
        if (corrupted === eligible) continue;
        checked += 1;
        const resolution = resolveIdentity(
          {
            observationId: `corrupt-${position}-${replacement}`,
            source: 'HOLDING',
            isin: corrupted,
            symbol: 'AARAV',
            exchange: 'NSE',
            series: null,
            cin: null,
            companyIdHint: null,
          },
          context,
        );
        assert.notEqual(resolution.state, 'RESOLVED', `${corrupted} must never resolve`);
        assert.equal(resolution.issuerId, null, `${corrupted} must not produce an issuer`);
        if (resolution.state === 'REJECTED_MALFORMED_ISIN') malformed += 1;
      }
    }
    assert.ok(checked >= 70, `expected at least 70 corruption cases, ran ${checked}`);
    assert.ok(malformed >= 60, `expected most corruptions to be rejected as malformed, got ${malformed}`);
  });

  test('a valid but unknown ISIN does not fall back to the symbol, even when the symbol would resolve', () => {
    // B-03 carries a valid ISIN absent from the roster AND the symbol AARAV, which alone resolves.
    const resolution = resolve('B-03');
    assert.equal(resolution.state, 'UNMATCHED');
    assert.equal(resolution.failure?.reason, 'ISIN_NOT_IN_ROSTER');
    assert.equal(resolution.issuerId, null);
    assert.equal(resolution.resolutionBasis, null);

    // The same symbol without the ISIN does resolve — proving the fallback was deliberately withheld.
    const symbolOnly = resolveIdentity(
      {
        observationId: 'probe',
        source: 'BROKER_PREVIEW',
        isin: null,
        symbol: 'AARAV',
        exchange: 'NSE',
        series: null,
        cin: null,
        companyIdHint: null,
      },
      context,
    );
    assert.equal(symbolOnly.state, 'RESOLVED');
    assert.equal(symbolOnly.resolutionBasis, 'EXCHANGE_SYMBOL');
  });

  test('the resolution basis is recorded so a symbol match is never mistaken for an ISIN match', () => {
    assert.equal(resolve('H-01').resolutionBasis, 'ISIN');
    assert.equal(resolve('H-02').resolutionBasis, 'EXCHANGE_SYMBOL');
  });
});

describe('AC-1.3 — duplicate active symbol', () => {
  test('two active issuers sharing a symbol yield AMBIGUOUS with no issuer', () => {
    const resolution = resolve('H-04');
    assert.equal(resolution.state, 'AMBIGUOUS');
    assert.equal(resolution.failure?.reason, 'DUPLICATE_ACTIVE_SYMBOL');
    assert.equal(resolution.issuerId, null);
    assert.equal(resolution.securityId, null);
    assert.equal(resolution.failure?.candidates.length, 2);
  });

  test('no binding is assessable when the symbol is ambiguous', () => {
    const binding = buildBinding(byId('H-04'), resolve('H-04'), context);
    assert.equal(binding.assessable, false);
    assert.equal(binding.issuerId, null);
  });
});

describe('AC-1.4 — stale references', () => {
  test('a symbol matched only outside its effective window is STALE_REFERENCE', () => {
    const resolution = resolve('H-06');
    assert.equal(resolution.state, 'STALE_REFERENCE');
    assert.equal(resolution.failure?.reason, 'LISTING_WINDOW_EXPIRED');
    assert.match(String(resolution.failure?.detail), /2020-05-31/);
  });

  test('a listing whose window has not started is also stale, with its own reason', () => {
    const resolution = resolve('W-06');
    assert.equal(resolution.state, 'STALE_REFERENCE');
    assert.equal(resolution.failure?.reason, 'LISTING_NOT_YET_EFFECTIVE');
  });

  test('the currently effective window still resolves', () => {
    const resolution = resolve('H-01');
    assert.equal(resolution.state, 'RESOLVED');
    assert.equal(resolution.listingId, 'IN:NSE:AARAV:EQ:EQUITY');
  });
});

describe('AC-1.5 — CIN / ISIN disagreement', () => {
  test('an observation whose CIN disagrees with the ISIN issuer is a conflict, not a pick', () => {
    const resolution = resolve('H-03');
    assert.equal(resolution.state, 'ISSUER_KEY_CONFLICT');
    assert.equal(resolution.failure?.reason, 'ISSUER_KEY_CONFLICT');
    assert.equal(resolution.issuerId, null);
    assert.match(String(resolution.failure?.detail), /CIN/);
  });

  test('an agreeing CIN resolves normally', () => {
    const resolution = resolve('H-01');
    assert.equal(resolution.state, 'RESOLVED');
    assert.equal(resolution.issuerId, 'IN:CIN:L72200KA1981PLC013115');
  });

  test('a company reference pointing at a different issuer is also a conflict', () => {
    const resolution = resolveIdentity(
      {
        observationId: 'probe',
        source: 'HOLDING',
        isin: 'IN0000000037',
        symbol: 'CMBANK',
        exchange: 'NSE',
        series: null,
        cin: null,
        companyIdHint: 'IN:CIN:L72200KA1981PLC013115',
      },
      context,
    );
    assert.equal(resolution.state, 'ISSUER_KEY_CONFLICT');
    assert.equal(resolution.issuerId, null);
  });
});

describe('AC-1.6 — one issuer, many securities', () => {
  test('equity and preference under one issuer produce two bindings, only equity assessable', () => {
    const equity = resolve('W-01');
    const preference = resolve('W-02');
    assert.equal(equity.issuerId, preference.issuerId);
    assert.equal(equity.issuerId, 'IN:CIN:U66010MH2000PLC000004');
    assert.notEqual(equity.securityId, preference.securityId);
    assert.equal(equity.state, 'RESOLVED');
    assert.equal(preference.state, 'OUT_OF_SCOPE_SECURITY');
    assert.equal(preference.failure?.reason, 'INSTRUMENT_NOT_ASSESSABLE');

    const equityBinding = buildBinding(byId('W-01'), equity, context);
    const preferenceBinding = buildBinding(byId('W-02'), preference, context);
    assert.equal(equityBinding.assessable, true);
    assert.equal(preferenceBinding.assessable, false);
    assert.equal(preferenceBinding.issuerId, equityBinding.issuerId);
    assert.equal(preferenceBinding.issuerKeyBasis, 'CIN');
  });

  test('an equity-ISIN-keyed issuer records its key basis', () => {
    const binding = buildBinding(byId('B-02'), resolve('B-02'), context);
    assert.equal(binding.issuerKeyBasis, 'EQUITY_ISIN');
  });
});

describe('AC-1.10 — names cannot establish identity', () => {
  test('the resolver module reads no name field at all', () => {
    const source = readFileSync(join(__dirname, '..', '..', 'src', 'investment', 'identity', 'resolver.ts'), 'utf8');
    for (const forbidden of ['displayName', 'legalName', 'companyName']) {
      assert.equal(source.includes(forbidden), false, `resolver must not reference ${forbidden}`);
    }
  });

  test('the identity input carries no presentation fields', () => {
    const input = identityInputOf(byId('H-01')) as unknown as Record<string, unknown>;
    assert.deepEqual(Object.keys(input).sort(), [
      'cin',
      'companyIdHint',
      'exchange',
      'isin',
      'observationId',
      'series',
      'source',
      'symbol',
    ]);
    assert.equal('displayName' in input, false);
  });

  test('a perfect name match with a wrong identifier stays unresolved', () => {
    const resolution = resolveIdentity(
      {
        observationId: 'probe',
        source: 'HOLDING',
        isin: 'IN0000000201',
        symbol: null,
        exchange: null,
        series: null,
        cin: null,
        companyIdHint: null,
      },
      context,
    );
    assert.equal(resolution.state, 'UNMATCHED');
    assert.equal(resolution.issuerId, null);
  });
});

describe('listing identity (Revision 3 §E)', () => {
  test('distinct instruments sharing a symbol are AMBIGUOUS_LISTING, never merged', () => {
    const resolution = resolve('B-04');
    assert.equal(resolution.state, 'AMBIGUOUS_LISTING');
    assert.equal(resolution.failure?.reason, 'MULTIPLE_SECURITIES_SHARE_LISTING');
    assert.equal(resolution.issuerId, null);
    assert.equal(resolution.failure?.candidates.length, 2);
  });

  test('one security listed in two series resolves to the EQ series', () => {
    const resolution = resolveIdentity(
      {
        observationId: 'probe',
        source: 'BROKER_PREVIEW',
        isin: null,
        symbol: 'BODHI',
        exchange: 'NSE',
        series: null,
        cin: null,
        companyIdHint: null,
      },
      context,
    );
    assert.equal(resolution.state, 'RESOLVED');
    assert.equal(resolution.listingId, 'IN:NSE:BODHI:EQ:EQUITY');
  });

  test('an explicit series is honoured when supplied', () => {
    const resolution = resolveIdentity(
      {
        observationId: 'probe',
        source: 'BROKER_PREVIEW',
        isin: null,
        symbol: 'BODHI',
        exchange: 'NSE',
        series: 'BE',
        cin: null,
        companyIdHint: null,
      },
      context,
    );
    assert.equal(resolution.state, 'RESOLVED');
    assert.equal(resolution.listingId, 'IN:NSE:BODHI:BE:EQUITY');
  });

  test('an unsupported exchange is ineligible rather than guessed', () => {
    const resolution = resolveIdentity(
      {
        observationId: 'probe',
        source: 'HOLDING',
        isin: null,
        symbol: 'AARAV',
        exchange: 'NYSE',
        series: null,
        cin: null,
        companyIdHint: null,
      },
      context,
    );
    assert.equal(resolution.state, 'INELIGIBLE');
    assert.equal(resolution.failure?.reason, 'EXCHANGE_NOT_SUPPORTED');
  });

  test('a symbol reused by another security is ambiguous, not silently re-pointed', () => {
    const resolution = resolveIdentity(
      {
        observationId: 'probe',
        source: 'HOLDING',
        isin: 'IN0000000037',
        symbol: 'AARAV',
        exchange: 'NSE',
        series: null,
        cin: null,
        companyIdHint: null,
      },
      context,
    );
    assert.equal(resolution.state, 'AMBIGUOUS');
    assert.equal(resolution.failure?.reason, 'SYMBOL_REUSED_BY_OTHER_SECURITY');
  });

  test('a roster security with no listing is ineligible, with that exact reason', () => {
    const resolution = resolve('W-08');
    assert.equal(resolution.state, 'INELIGIBLE');
    assert.equal(resolution.failure?.reason, 'NO_LISTING_FOR_SECURITY');
  });

  test('a security the roster marks unlisted is ineligible for that reason, not a listing gap', () => {
    const resolution = resolve('W-07');
    assert.equal(resolution.state, 'INELIGIBLE');
    assert.equal(resolution.failure?.reason, 'SECURITY_NOT_LISTED');
  });
});

describe('binding records', () => {
  test('a binding references roster, listing map and corporate-action versions with digests', () => {
    const binding = buildBinding(byId('H-01'), resolve('H-01'), context);
    assert.equal(binding.rosterVersion, sources.versions.rosterVersion);
    assert.equal(binding.listingMapVersion, sources.versions.listingMapVersion);
    assert.equal(binding.corporateActionTableVersion, sources.versions.corporateActionTableVersion);
    assert.equal(binding.provenance.rosterDigest, sources.versions.rosterDigest);
    assert.equal(binding.provenance.resolutionBasis, 'IDENTITY_FIELDS_ONLY');
    assert.match(binding.bindingId, /^sha256:[0-9a-f]{64}$/);
    assert.equal(binding.effectiveFrom, '2020-06-01');
    assert.equal(binding.effectiveTo, null);
  });

  test('an unresolved binding still records provenance and status', () => {
    const binding = buildBinding(byId('H-05'), resolve('H-05'), context);
    assert.equal(binding.status, 'UNMATCHED');
    assert.equal(binding.reason, 'SECTOR_REFERENCE_NOT_AN_IDENTITY');
    assert.equal(binding.assessable, false);
    assert.equal(binding.rosterVersion, sources.versions.rosterVersion);
  });

  test('bindings are stable for identical inputs', () => {
    const first = buildBinding(byId('H-01'), resolve('H-01'), context);
    const second = buildBinding(byId('H-01'), resolve('H-01'), context);
    assert.deepEqual(first, second);
  });
});
