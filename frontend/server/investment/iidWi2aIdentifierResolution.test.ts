/**
 * IID WI-2A — Correction A: identifier resolution evidence.
 *
 * INVESTIGATION OUTCOME: no product change was required for identifier resolution. This suite pins the
 * behaviour that already exists so the requirement is evidenced rather than re-implemented.
 *
 * Two distinct paths were investigated, and they are deliberately different:
 *
 *  1. DISCOVERY (`resolveIdentifierQuery`, WI-2 P2). The user types ONE string. It is attempted as an
 *     ISIN, then as `EXCHANGE:SYMBOL`, then as a roster CIN — three INDEPENDENT single-field attempts.
 *     A failed ISIN attempt therefore cannot block a valid alternative. Proven below.
 *
 *  2. HOLDING (`resolveHoldingIdentities`, WI-2 P3). A broker holding carries isin+symbol+exchange
 *     SIMULTANEOUSLY, and the governed resolver applies its documented ladder: a malformed or unknown
 *     ISIN yields REJECTED_MALFORMED_ISIN / UNMATCHED and does NOT fall back to the symbol.
 *     This is NOT a defect. It is IID-1 AC-1.2 ("ISIN integrity and no fallback"), documented in
 *     `iips-platform/src/investment/identity/resolver.ts` and enforced by
 *     `iips-platform/tests/investment/identity-resolver.test.ts` ("a valid but unknown ISIN does not fall
 *     back to the symbol, even when the symbol would resolve"). Overriding it in the navigation read
 *     would weaken identity governance, which this work item forbids. The tests below pin the refusal.
 *
 * Synthetic governed fixture only; nothing here is real-issuer evidence.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import { loadFixtureSources, FIXTURE_AS_OF } from '../../../iips-platform/tests/investment/identityFixture';
import { resolveIdentity } from '../../../iips-platform/src/investment/identity/resolver';
import type { IdentitySources } from '../../../iips-platform/src/investment/identity/types';
import type { G2HoldingView } from '../user-portfolio/userPortfolioContract.js';
import { searchCompanies } from './companyDirectory';
import { resolveHoldingIdentities } from './holding-identity-transport';

const sources: IdentitySources = loadFixtureSources();

const AARAV = 'IN:CIN:L72200KA1981PLC013115';
const AARAV_ISIN = 'IN0000000011';
const AARAV_CIN = 'L72200KA1981PLC013115';
const BODHI = 'IN:CIN:U72200TN2001PLC000005';
/** Well-formed ISIN that is absent from the roster (fixture observation B-03). */
const UNKNOWN_ISIN = 'IN0000000201';
/** Well-formed shape, failed check digit. */
const CORRUPT_ISIN = 'IN0000000012';

function search(query: string) {
  return searchCompanies(query, sources, { asOf: FIXTURE_AS_OF, inventory: null });
}

function ids(query: string): readonly string[] {
  const result = search(query);
  return result.kind === 'matches' ? result.matches.map((match) => match.issuerId) : [];
}

function bases(query: string): readonly string[] {
  const result = search(query);
  return result.kind === 'matches' ? result.matches.map((match) => match.matchedBy) : [];
}

function holdingOf(overrides: Partial<G2HoldingView> = {}): G2HoldingView {
  return {
    symbol: 'AARAV',
    companyId: 'AARAV',
    isin: AARAV_ISIN,
    exchange: 'NSE',
    quantity: 10,
    averageBuyPrice: 100,
    currentPrice: 110,
    marketValue: 1100,
    weightPercentage: 100,
    active: true,
    sourceBroker: 'GENERIC',
    lineageDigest: 'a'.repeat(64),
    identityStatus: 'RESOLVED',
    ...overrides,
  };
}

function identityOf(holding: G2HoldingView) {
  const [identity] = resolveHoldingIdentities('p-1', [holding], sources, FIXTURE_AS_OF);
  if (identity === undefined) throw new Error('expected one identity');
  return identity;
}

/* ---------------------------------------------------- supported types, each attempted independently */

describe('A — every supported identifier type resolves independently (discovery)', () => {
  it('resolves a valid ISIN to the governed issuer', () => {
    expect(ids(AARAV_ISIN)).toEqual([AARAV]);
    expect(bases(AARAV_ISIN)).toEqual(['IDENTIFIER']);
  });

  it('resolves a valid EXCHANGE:SYMBOL alternative when no ISIN is supplied', () => {
    expect(ids('NSE:AARAV')).toEqual([AARAV]);
    expect(bases('NSE:AARAV')).toEqual(['IDENTIFIER']);
  });

  it('resolves a bare CIN alternative, which has no ISIN and no exchange', () => {
    expect(ids(AARAV_CIN)).toEqual([AARAV]);
    expect(bases(AARAV_CIN)).toEqual(['IDENTIFIER']);
  });

  it('resolves an exact governed issuer id', () => {
    expect(ids(AARAV)).toEqual([AARAV]);
    expect(bases(AARAV)).toEqual(['ISSUER_ID']);
  });

  it('accepts exchange/symbol case and surrounding space insensitively', () => {
    expect(ids('  nse:aarav  ')).toEqual([AARAV]);
  });

  it('proves the attempts are INDEPENDENT: a non-ISIN query is not blocked by the failed ISIN attempt', () => {
    // Each of these strings fails `isValidIsin`, so attempt 1 rejects. Attempts 2 and 3 still run.
    // If the resolver short-circuited on the ISIN failure, all three would return no match.
    expect(ids('NSE:AARAV')).toEqual([AARAV]); // succeeds via attempt 2
    expect(ids(AARAV_CIN)).toEqual([AARAV]); // succeeds via attempt 3
    expect(ids('Aarav')).toEqual([AARAV]); // succeeds via the legal-name stage
  });

  it('keeps each supported type addressing its own issuer, with no cross-talk', () => {
    expect(ids('NSE:BODHI')).toEqual([BODHI]);
    expect(ids('U72200TN2001PLC000005')).toEqual([BODHI]);
    expect(ids('IN0000000029')).toEqual([BODHI]);
    // AARAV's identifiers never surface BODHI, and vice versa.
    expect(ids(AARAV_ISIN)).not.toContain(BODHI);
    expect(ids('NSE:BODHI')).not.toContain(AARAV);
  });
});

/* ------------------------------------------------------------------ invalid / unknown / ambiguous */

describe('A — invalid, unknown and ambiguous identifiers stay honest (discovery)', () => {
  it('returns no match for a corrupt ISIN rather than guessing an issuer', () => {
    expect(ids(CORRUPT_ISIN)).toEqual([]);
  });

  it('returns no match for a well-formed but unknown ISIN', () => {
    expect(ids(UNKNOWN_ISIN)).toEqual([]);
  });

  it('never falls back from an unknown ISIN to an unrelated legal-name match', () => {
    // The unknown ISIN must not be treated as a name fragment that happens to match some roster record.
    const result = search(UNKNOWN_ISIN);
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.totalMatched).toBe(0);
  });

  it('does not silently classify an ambiguous symbol as one issuer', () => {
    // NSE:TWINS is active for two different issuers in the governed listing map.
    expect(ids('NSE:TWINS')).toEqual([]);
  });

  it('does not resolve an expired symbol', () => {
    expect(ids('NSE:OLDCO')).toEqual([]);
  });

  it('does not offer an EXCLUDED issuer as a way in', () => {
    expect(ids('U45200GJ2010PLC000006')).toEqual([]);
    expect(ids('Fictional Infrastructure')).toEqual([]);
  });

  it('never derives an identity from display text alone', () => {
    // A legal-name query returns the ROSTER record's id; the name itself is never parsed into an id.
    const result = search('Aarav Systems Limited (synthetic)');
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches[0]!.issuerId).toBe(AARAV);
    expect(result.matches[0]!.matchedBy).toBe('LEGAL_NAME');
    // An invented id shaped like a name is not admissible.
    expect(ids('IN:CIN:AARAV')).toEqual([]);
  });
});

/* --------------------------------------- P3 holding path: governed no-fallback is preserved, not bug */

describe('A — P3 holding path preserves governed AC-1.2 no-fallback', () => {
  it('resolves a holding whose ISIN is valid and known', () => {
    const identity = identityOf(holdingOf());
    expect(identity.state).toBe('RESOLVED');
    expect(identity.issuerId).toBe(AARAV);
    expect(identity.resolutionBasis).toBe('ISIN');
    expect(identity.assessable).toBe(true);
  });

  it('resolves a holding that carries only a symbol and exchange', () => {
    const identity = identityOf(holdingOf({ isin: undefined }));
    expect(identity.state).toBe('RESOLVED');
    expect(identity.issuerId).toBe(AARAV);
    expect(identity.resolutionBasis).toBe('EXCHANGE_SYMBOL');
  });

  it('refuses a corrupt ISIN even though the symbol alone would resolve — deliberate AC-1.2 governance', () => {
    const identity = identityOf(holdingOf({ isin: CORRUPT_ISIN }));
    expect(identity.state).toBe('REJECTED_MALFORMED_ISIN');
    expect(identity.issuerId).toBeNull();
    expect(identity.assessable).toBe(false);
    expect(identity.reasonText).not.toBeNull();

    // The same symbol WITHOUT the ISIN does resolve — proving the refusal is the ISIN integrity rule,
    // not a broken symbol path. This mirrors the governed resolver's own AC-1.2 test.
    expect(identityOf(holdingOf({ isin: undefined })).issuerId).toBe(AARAV);
  });

  it('refuses an unknown ISIN without falling back to the symbol — deliberate AC-1.2 governance', () => {
    const identity = identityOf(holdingOf({ isin: UNKNOWN_ISIN }));
    expect(identity.state).toBe('UNMATCHED');
    expect(identity.reason).toBe('ISIN_NOT_IN_ROSTER');
    expect(identity.issuerId).toBeNull();
    expect(identity.resolutionBasis).toBeNull();
    expect(identity.assessable).toBe(false);
  });

  it('reports an ambiguous holding symbol as ambiguous, with no issuer', () => {
    const identity = identityOf(holdingOf({ isin: undefined, symbol: 'TWINS' }));
    expect(identity.state).toBe('AMBIGUOUS');
    expect(identity.issuerId).toBeNull();
    expect(identity.assessable).toBe(false);
  });

  it('never uses the broker companyId hint as proof of identity', () => {
    // companyId claims AARAV but the identifiers point at BODHI. The governed identifier wins.
    const identity = identityOf(holdingOf({ companyId: 'AARAV', isin: 'IN0000000029', symbol: 'BODHI' }));
    expect(identity.issuerId).toBe(BODHI);
    expect(identity.issuerId).not.toBe(AARAV);
  });

  it('keeps per-holding outcomes independent, so one bad ISIN cannot suppress a valid neighbour', () => {
    const identities = resolveHoldingIdentities(
      'p-1',
      [holdingOf({ isin: CORRUPT_ISIN }), holdingOf({ symbol: 'BODHI', isin: 'IN0000000029' })],
      sources,
      FIXTURE_AS_OF,
    );
    expect(identities).toHaveLength(2);
    expect(identities[0]!.holdingIndex).toBe(0);
    expect(identities[0]!.issuerId).toBeNull();
    expect(identities[1]!.holdingIndex).toBe(1);
    expect(identities[1]!.issuerId).toBe(BODHI);
    expect(identities[1]!.state).toBe('RESOLVED');
  });

  it('agrees with the governed resolver called directly, proving no duplicate identity model', () => {
    const holding = holdingOf({ isin: undefined, symbol: 'CMBANK' });
    const viaTransport = identityOf(holding);
    const direct = resolveIdentity(
      {
        observationId: 'probe',
        source: 'HOLDING',
        isin: null,
        symbol: 'CMBANK',
        exchange: 'NSE',
        series: null,
        cin: null,
        companyIdHint: holding.companyId,
      },
      { sources, asOf: FIXTURE_AS_OF },
    );
    expect(viaTransport.issuerId).toBe(direct.issuerId);
    expect(viaTransport.state).toBe(direct.state);
    expect(viaTransport.resolutionBasis).toBe(direct.resolutionBasis);
  });
});
