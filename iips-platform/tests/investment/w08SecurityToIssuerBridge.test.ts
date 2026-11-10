/**
 * W08 — EXACT SECURITY-TO-ISSUER BRIDGE: the ISIN path and the series discriminator.
 *
 * WHAT THIS FILE GUARDS.
 *
 * W08 asks for a minimal compatible bridge between IPD's D114 security identity
 * (`ISIN:<isin>:<series>`) and IRR's own identity contract (`IN:ISIN:<isin>` /
 * `IN:EQISIN:<isin>`), implemented only where evidence shows a gap, and accepted against
 * "ISIN/series and separately evidenced exchange/listing→issuer, missing, ambiguous,
 * reused-symbol, multi-series and expired tests".
 *
 * THE GAP THIS FILE WAS WRITTEN FOR. The resolver consulted `input.series` ONLY on the symbol
 * path. On the ISIN path it never read the series at all, so the series an observation carried —
 * the very evidence IPD's D114 object supplies — was discarded, and the listing was chosen by a
 * preference rule (`EQ` first, then earliest effective date). Against the repository's own
 * fixture that produced a demonstrably wrong answer:
 *
 *     isin=IN0000000029, symbol=BODHI, exchange=NSE, series=BE
 *       -> RESOLVED, listing IN:NSE:BODHI:EQ:EQUITY      (the EQ listing, series ignored)
 *
 * and, once the series was honoured, a second wrong answer:
 *
 *     isin=IN0000000029, symbol=BODHI, exchange=NSE, series=BE
 *       -> RESOLVED, listing IN:NSE:TWINS:BE:EQUITY      (the wrong SYMBOL in the same series)
 *
 * because the security's listings were narrowed by series but NOT by the observed symbol and
 * exchange, and the tie-break then chose the earliest-dated listing in that series.
 *
 * Every test below FAILS against the pre-fix resolver. The fixture is the repository's own; no
 * fixture was changed to make a test pass.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { resolveIdentity } from '../../src/investment/identity/resolver';
import { loadFixtureSources, FIXTURE_AS_OF } from './identityFixture';

const sources = loadFixtureSources();
const context = { sources, asOf: FIXTURE_AS_OF };

/**
 * The multi-series security in the repository's own listing map:
 *
 *   IN:ISIN:IN0000000029
 *     IN:NSE:TWINS:BE:EQUITY  series BE  from 2021-01-01  (issuer B's duplicate active symbol)
 *     IN:NSE:BODHI:EQ:EQUITY  series EQ  from 2021-02-15
 *     IN:NSE:BODHI:BE:EQUITY  series BE  from 2022-03-01
 */
const MULTI_SERIES_ISIN = 'IN0000000029';

function resolveWith(overrides: {
  readonly isin?: string | null;
  readonly symbol?: string | null;
  readonly exchange?: string | null;
  readonly series?: string | null;
}) {
  return resolveIdentity(
    {
      observationId: 'w08-probe',
      source: 'HOLDING',
      isin: overrides.isin === undefined ? MULTI_SERIES_ISIN : overrides.isin,
      symbol: overrides.symbol === undefined ? 'BODHI' : overrides.symbol,
      exchange: overrides.exchange === undefined ? 'NSE' : overrides.exchange,
      series: overrides.series === undefined ? null : overrides.series,
      cin: null,
      companyIdHint: null,
    },
    context,
  );
}

describe('W08 — an explicitly supplied series is honoured on the ISIN path', () => {
  test('a BE observation resolves to the BE listing, not to the EQ listing', () => {
    const resolution = resolveWith({ series: 'BE' });

    assert.equal(resolution.state, 'RESOLVED');
    assert.equal(resolution.listingId, 'IN:NSE:BODHI:BE:EQUITY');
    assert.equal(resolution.resolutionBasis, 'ISIN');
    assert.equal(resolution.securityId, 'IN:ISIN:IN0000000029');
  });

  test('an EQ observation resolves to the EQ listing', () => {
    const resolution = resolveWith({ series: 'EQ' });

    assert.equal(resolution.state, 'RESOLVED');
    assert.equal(resolution.listingId, 'IN:NSE:BODHI:EQ:EQUITY');
  });

  test('the two series are genuinely distinguished — the same ISIN does not yield one listing', () => {
    // The defect's signature: both series returned the SAME listing, because the series was never
    // read. This test is the direct regression guard for that.
    const eq = resolveWith({ series: 'EQ' });
    const be = resolveWith({ series: 'BE' });

    assert.notEqual(eq.listingId, be.listingId);
    assert.equal(eq.listingId, 'IN:NSE:BODHI:EQ:EQUITY');
    assert.equal(be.listingId, 'IN:NSE:BODHI:BE:EQUITY');
  });

  test('without a series the ordinary equity listing is still chosen', () => {
    // The pre-existing behaviour must survive: an observation that carries no series still
    // resolves, and still gets the EQ listing of the security.
    const resolution = resolveWith({ series: null });

    assert.equal(resolution.state, 'RESOLVED');
    assert.equal(resolution.listingId, 'IN:NSE:BODHI:EQ:EQUITY');
  });
});

describe('W08 — the observed symbol and exchange constrain the listing', () => {
  test('a series-only observation cannot be re-pointed to another symbol of the same series', () => {
    // The second defect: narrowing by series alone still allowed the TWINS listing (same series,
    // same security, earlier effective date) to win. The observed symbol must constrain it.
    const resolution = resolveWith({ symbol: 'BODHI', series: 'BE' });

    assert.equal(resolution.state, 'RESOLVED');
    assert.equal(resolution.listingId, 'IN:NSE:BODHI:BE:EQUITY');
    assert.notEqual(resolution.listingId, 'IN:NSE:TWINS:BE:EQUITY');
  });

  test('an observed symbol this security is not listed under is reported, not substituted', () => {
    // The security IS listed and active, but not under the observed symbol. The listing it does
    // have is not a substitute for the one that was observed.
    const resolution = resolveWith({ symbol: 'NOTALISTED', series: 'BE' });

    assert.equal(resolution.state, 'AMBIGUOUS_LISTING');
    assert.equal(resolution.failure?.reason, 'MULTIPLE_SECURITIES_SHARE_LISTING');
    assert.equal(resolution.issuerId, null);
    assert.equal(resolution.listingId, null);
  });

  test('a series this security does not have is reported, not ignored', () => {
    // The security is listed in EQ and BE. An observation declaring a third series must not be
    // silently resolved to one of the two it does have.
    const resolution = resolveWith({ series: 'XX' });

    assert.equal(resolution.state, 'AMBIGUOUS_LISTING');
    assert.equal(resolution.failure?.reason, 'MULTIPLE_SECURITIES_SHARE_LISTING');
    assert.equal(resolution.listingId, null);
  });
});

describe('W08 — the reused-symbol and expired diagnoses are preserved', () => {
  test('a symbol reused by another security is still AMBIGUOUS, not re-pointed', () => {
    // The specific diagnosis must survive the reordering: "this symbol now belongs to a different
    // security" is more specific than a generic listing mismatch and names a different remedy.
    const resolution = resolveWith({ isin: 'IN0000000037', symbol: 'AARAV' });

    assert.equal(resolution.state, 'AMBIGUOUS');
    assert.equal(resolution.failure?.reason, 'SYMBOL_REUSED_BY_OTHER_SECURITY');
  });

  test('a valid ISIN that is absent from the roster is still UNMATCHED with no symbol fallback', () => {
    // IN0000009004 is a well-formed ISIN that passes the check digit and is absent from the
    // fixture roster. It is found with the repository's own `isValidIsin`, not by guessing.
    const resolution = resolveWith({ isin: 'IN0000009004' });

    assert.equal(resolution.state, 'UNMATCHED');
    assert.equal(resolution.failure?.reason, 'ISIN_NOT_IN_ROSTER');
  });

  test('a malformed ISIN is still rejected before any listing is considered', () => {
    const resolution = resolveWith({ isin: 'NOT-AN-ISIN' });

    assert.equal(resolution.state, 'REJECTED_MALFORMED_ISIN');
    assert.equal(resolution.failure?.reason, 'ISIN_FORMAT_INVALID');
  });
});

describe('W08 — resolution stays deterministic', () => {
  test('the same input always yields the same listing', () => {
    for (const series of ['EQ', 'BE', null]) {
      const first = resolveWith({ series });
      const second = resolveWith({ series });

      assert.equal(first.state, second.state);
      assert.equal(first.listingId, second.listingId);
      assert.equal(first.resolutionBasis, second.resolutionBasis);
    }
  });
});
