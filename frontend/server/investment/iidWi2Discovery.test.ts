/**
 * IID WI-2 — server-side company discovery (P2) and holding identity (P3).
 *
 * Uses the EXISTING governed synthetic identity fixture, so matching is proven against the same roster and
 * listing map the resolver's own tests use. Nothing here is real-issuer evidence.
 *
 * What is proven:
 *   • name, ISIN, CIN, issuer-id and EXCHANGE:SYMBOL queries all reach the correct governed company;
 *   • an ambiguous symbol is NOT silently resolved to one issuer;
 *   • excluded issuers are not discoverable;
 *   • assessment availability distinguishes AVAILABLE / NONE / DAMAGED / UNKNOWN, and a store failure is
 *     never reported as "no assessment";
 *   • the discovery transport is GET/HEAD only, sanitizes failures, and never touches coverage providers;
 *   • holding identity resolves independently of any disposition, and an unresolvable holding is honest.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import type http from 'node:http';

import { loadFixtureSources, FIXTURE_AS_OF } from '../../../iips-platform/tests/investment/identityFixture';
import type { IdentitySources } from '../../../iips-platform/src/investment/identity/types';
import type { G2HoldingView } from '../user-portfolio/userPortfolioContract.js';
import {
  MAX_QUERY_LENGTH,
  availabilityFromInventory,
  directoryDisclosure,
  searchCompanies,
} from './companyDirectory';
import {
  DISCOVERY_TRANSPORT_SEMANTICS,
  handleDiscoveryRequest,
  isDiscoveryPath,
  readQuery,
} from './discovery-transport';
import {
  handleHoldingIdentityRequest,
  isHoldingIdentityPath,
  parsePortfolioIdOf,
  resolveHoldingIdentities,
} from './holding-identity-transport';

const sources: IdentitySources = loadFixtureSources();
const AARAV = 'IN:CIN:L72200KA1981PLC013115';
const AARAV_ISIN = 'IN0000000011';
const AARAV_CIN = 'L72200KA1981PLC013115';

function search(q: string, inventory: Parameters<typeof searchCompanies>[2]['inventory'] = null) {
  return searchCompanies(q, sources, { asOf: FIXTURE_AS_OF, inventory });
}

/* ------------------------------------------------------------------ P2 matching */

describe('P2 — governed matching', () => {
  it('finds a company by legal name and returns the roster record identity', () => {
    const result = search('Aarav');
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]!.issuerId).toBe(AARAV);
    expect(result.matches[0]!.matchedBy).toBe('LEGAL_NAME');
    expect(result.matches[0]!.legalName).toContain('Aarav Systems Limited');
  });

  it('matches a name case- and whitespace-insensitively', () => {
    const result = search('  aArAv   systems  ');
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches[0]!.issuerId).toBe(AARAV);
  });

  it('resolves an ISIN through the governed resolver', () => {
    const result = search(AARAV_ISIN);
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches[0]!.issuerId).toBe(AARAV);
    expect(result.matches[0]!.matchedBy).toBe('IDENTIFIER');
  });

  it('looks up a CIN on the roster without constructing an issuer id from it', () => {
    const result = search(AARAV_CIN);
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    // The fixture issuer is CIN-keyed, and the returned id is the roster's own.
    expect(result.matches[0]!.issuerId).toBe(AARAV);
    expect(result.matches[0]!.matchedBy).toBe('IDENTIFIER');
  });

  it('accepts an exact issuer id', () => {
    const result = search(AARAV);
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches[0]!.matchedBy).toBe('ISSUER_ID');
  });

  it('resolves EXCHANGE:SYMBOL through the governed listing map', () => {
    const result = search('NSE:AARAV');
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches[0]!.issuerId).toBe(AARAV);
    expect(result.matches[0]!.matchedBy).toBe('IDENTIFIER');
  });

  it('does not resolve an ambiguous active symbol to one issuer', () => {
    // NSE:TWINS is deliberately shared by two issuers in the governed fixture.
    const result = search('NSE:TWINS');
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches).toHaveLength(0);
  });

  it('does not resolve a symbol whose listing window has expired', () => {
    const result = search('NSE:OLDCO');
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches).toHaveLength(0);
  });

  it('never offers an EXCLUDED issuer', () => {
    const result = search('Fictional Infrastructure');
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches).toHaveLength(0);
  });

  it('returns no match for an unknown name rather than inventing a company', () => {
    const result = search('No Such Company Whatever');
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches).toHaveLength(0);
  });

  it('rejects a too-short and a too-long query as invalid, not as "no match"', () => {
    expect(search('a')).toEqual({ kind: 'invalid', reason: 'QUERY_TOO_SHORT' });
    expect(search('   ')).toEqual({ kind: 'invalid', reason: 'QUERY_TOO_SHORT' });
    expect(search('x'.repeat(MAX_QUERY_LENGTH + 1))).toEqual({ kind: 'invalid', reason: 'QUERY_TOO_LONG' });
  });

  it('discloses truncation and the true total instead of silently cutting the list', () => {
    const result = searchCompanies('Limited', sources, { asOf: FIXTURE_AS_OF, inventory: null, limit: 2 });
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches).toHaveLength(2);
    expect(result.totalMatched).toBeGreaterThan(2);
    expect(result.truncated).toBe(true);
  });
});

describe('P2 — assessment availability is observed, never assumed', () => {
  it('reports UNKNOWN when the store did not answer, and says why', () => {
    const result = search('Aarav', null);
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches[0]!.assessment).toBe('UNKNOWN');
    expect(directoryDisclosure(sources, null).assessmentAvailabilityUnavailableReason).toMatch(/unavailable/);
  });

  it('reports NONE for a known company the inventory does not contain', () => {
    const result = search('Aarav', availabilityFromInventory([]));
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches[0]!.assessment).toBe('NONE');
    expect(result.matches[0]!.versionCount).toBeNull();
  });

  it('reports AVAILABLE with the observed version count', () => {
    const inventory = availabilityFromInventory([
      { scopeToken: `co:${AARAV}`, valid: true, versionCount: 3 },
    ]);
    const result = search('Aarav', inventory);
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches[0]!.assessment).toBe('AVAILABLE');
    expect(result.matches[0]!.versionCount).toBe(3);
  });

  it('reports DAMAGED rather than serving or counting an invalid chain', () => {
    const inventory = availabilityFromInventory([
      { scopeToken: `co:${AARAV}`, valid: false, versionCount: 1 },
    ]);
    const result = search('Aarav', inventory);
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    expect(result.matches[0]!.assessment).toBe('DAMAGED');
  });

  it('ignores a non-company scope and an unparseable issuer subject', () => {
    const inventory = availabilityFromInventory([
      { scopeToken: 'hd:portfolio/IN:ISIN:IN0000000011', valid: true, versionCount: 1 },
      { scopeToken: 'co:not-an-issuer-id', valid: true, versionCount: 1 },
    ]);
    expect(inventory.byIssuerId.size).toBe(0);
  });

  it('carries roster provenance and data class on every disclosure', () => {
    const disclosure = directoryDisclosure(sources, availabilityFromInventory([]));
    expect(disclosure.rosterDataClass).toBe('SYNTHETIC_FIXTURE');
    expect(disclosure.rosterVersion.length).toBeGreaterThan(0);
    expect(disclosure.rosterDigest.length).toBeGreaterThan(0);
    expect(disclosure.assessmentAvailabilityUnavailableReason).toBeNull();
  });
});

/* ------------------------------------------------------------------ transport harness */

interface Captured {
  status: number;
  body: string;
  headers: Record<string, unknown>;
}

function capture(): { res: http.ServerResponse; read: () => Captured } {
  const out: Captured = { status: 0, body: '', headers: {} };
  const res = {
    writeHead(status: number, headers: Record<string, unknown> = {}) {
      out.status = status;
      out.headers = headers;
      return res;
    },
    end(chunk?: string) {
      out.body = chunk ?? '';
      return res;
    },
  } as unknown as http.ServerResponse;
  return { res, read: () => out };
}

function request(url: string, method = 'GET'): http.IncomingMessage {
  return { url, method } as http.IncomingMessage;
}

const availableSources = () => ({ available: true as const, sources });

describe('P2 — discovery transport', () => {
  it('claims only its own path', () => {
    expect(isDiscoveryPath('/api/investment/companies?q=x')).toBe(true);
    expect(isDiscoveryPath('/api/investment/company/IN:CIN:X')).toBe(false);
    expect(isDiscoveryPath('/api/investment/coverage')).toBe(false);
  });

  it('decodes the query and tolerates a malformed escape', () => {
    expect(readQuery('/api/investment/companies?q=Aarav%20Systems')).toBe('Aarav Systems');
    expect(readQuery('/api/investment/companies?q=a+b')).toBe('a b');
    expect(readQuery('/api/investment/companies?q=%E0%A4%A')).toBe('');
    expect(readQuery('/api/investment/companies')).toBe('');
  });

  it('is structurally read-only', () => {
    expect(DISCOVERY_TRANSPORT_SEMANTICS.mutatingOperations).toHaveLength(0);
    expect(DISCOVERY_TRANSPORT_SEMANTICS.createsArtifacts).toBe(false);
    expect(DISCOVERY_TRANSPORT_SEMANTICS.constructsIdentifiers).toBe(false);
    expect(DISCOVERY_TRANSPORT_SEMANTICS.dependsOnCoverage).toBe(false);
  });

  it('answers 405 for a mutating method before reading any source', async () => {
    let read = false;
    const { res, read: out } = capture();
    const handled = await handleDiscoveryRequest(request('/api/investment/companies?q=Aarav', 'POST'), res, {
      loadSources: () => {
        read = true;
        return availableSources();
      },
    });
    expect(handled).toBe(true);
    expect(out().status).toBe(405);
    expect(read).toBe(false);
  });

  it('returns governed matches without consulting any coverage provider', async () => {
    const { res, read: out } = capture();
    await handleDiscoveryRequest(request('/api/investment/companies?q=Aarav'), res, {
      loadSources: availableSources,
      loadInventory: async () => availabilityFromInventory([]),
      today: () => FIXTURE_AS_OF,
    });
    expect(out().status).toBe(200);
    const body = JSON.parse(out().body) as { matches: Array<{ issuerId: string; assessment: string }> };
    expect(body.matches[0]!.issuerId).toBe(AARAV);
    expect(body.matches[0]!.assessment).toBe('NONE');
    expect(out().headers['Cache-Control']).toBe('no-store');
  });

  it('still answers 200 with UNKNOWN availability when the store is unavailable', async () => {
    const { res, read: out } = capture();
    await handleDiscoveryRequest(request('/api/investment/companies?q=Aarav'), res, {
      loadSources: availableSources,
      loadInventory: async () => null,
      today: () => FIXTURE_AS_OF,
    });
    expect(out().status).toBe(200);
    const body = JSON.parse(out().body) as {
      matches: Array<{ assessment: string }>;
      directory: { assessmentAvailabilityUnavailableReason: string | null };
    };
    expect(body.matches[0]!.assessment).toBe('UNKNOWN');
    expect(body.directory.assessmentAvailabilityUnavailableReason).not.toBeNull();
  });

  it('answers 400 for a too-short query', async () => {
    const { res, read: out } = capture();
    await handleDiscoveryRequest(request('/api/investment/companies?q=a'), res, {
      loadSources: availableSources,
    });
    expect(out().status).toBe(400);
    expect(JSON.parse(out().body)).toMatchObject({ error: 'discovery-query-too-short' });
  });

  it('answers 503 with file-level issues when the identity files cannot be loaded', async () => {
    const { res, read: out } = capture();
    await handleDiscoveryRequest(request('/api/investment/companies?q=Aarav'), res, {
      loadSources: () => ({
        available: false as const,
        issues: [
          { file: 'eligible-roster.json' as const, code: 'MISSING', subject: 'roster', detail: '/secret/path' },
        ],
      }),
    });
    expect(out().status).toBe(503);
    expect(out().body).not.toContain('/secret/path');
    expect(JSON.parse(out().body)).toMatchObject({ error: 'identity-sources-unavailable' });
  });

  it('serves HEAD with no body', async () => {
    const { res, read: out } = capture();
    await handleDiscoveryRequest(request('/api/investment/companies?q=Aarav', 'HEAD'), res, {
      loadSources: availableSources,
      loadInventory: async () => availabilityFromInventory([]),
      today: () => FIXTURE_AS_OF,
    });
    expect(out().status).toBe(200);
    expect(out().body).toBe('');
  });
});

/* ------------------------------------------------------------------ P3 */

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

describe('P3 — holding identity is resolved independently of dispositions', () => {
  it('resolves a holding to its governed issuer and security', () => {
    const identities = resolveHoldingIdentities('p-1', [holdingOf()], sources, FIXTURE_AS_OF);
    expect(identities).toHaveLength(1);
    expect(identities[0]!.issuerId).toBe(AARAV);
    expect(identities[0]!.securityId).toBe(`IN:ISIN:${AARAV_ISIN}`);
    expect(identities[0]!.state).toBe('RESOLVED');
    expect(identities[0]!.holdingIndex).toBe(0);
  });

  it('returns an honest unresolved state with a displayable reason', () => {
    const identities = resolveHoldingIdentities(
      'p-1',
      [holdingOf({ isin: undefined, symbol: 'NOSUCH', exchange: undefined })],
      sources,
      FIXTURE_AS_OF,
    );
    expect(identities[0]!.issuerId).toBeNull();
    expect(identities[0]!.state).not.toBe('RESOLVED');
    expect(identities[0]!.reasonText).not.toBeNull();
    expect(identities[0]!.assessable).toBe(false);
  });

  it('never treats IPD companyId as proof of identity', () => {
    // A hint that disagrees with the ISIN must not silently win.
    const identities = resolveHoldingIdentities(
      'p-1',
      [holdingOf({ companyId: 'IN:CIN:U72200TN2001PLC000005' })],
      sources,
      FIXTURE_AS_OF,
    );
    expect(identities[0]!.issuerId).not.toBe('IN:CIN:U72200TN2001PLC000005');
  });

  it('preserves row order so the UI can join by index', () => {
    const identities = resolveHoldingIdentities(
      'p-1',
      [holdingOf(), holdingOf({ isin: undefined, symbol: 'NOSUCH', exchange: undefined })],
      sources,
      FIXTURE_AS_OF,
    );
    expect(identities.map((item) => item.holdingIndex)).toEqual([0, 1]);
    expect(identities[0]!.issuerId).toBe(AARAV);
    expect(identities[1]!.issuerId).toBeNull();
  });
});

describe('P3 — holding identity transport', () => {
  it('claims only the identities path, not the disposition paths', () => {
    expect(isHoldingIdentityPath('/api/investment/portfolio/p-1/identities')).toBe(true);
    expect(isHoldingIdentityPath('/api/investment/portfolio/p-1/dispositions')).toBe(false);
    expect(isHoldingIdentityPath('/api/investment/portfolio/p-1/holding/IN:ISIN:X')).toBe(false);
    expect(parsePortfolioIdOf('/api/investment/portfolio/p%2D1/identities')).toBe('p-1');
    expect(parsePortfolioIdOf('/api/investment/portfolio//identities')).toBeNull();
  });

  it('returns identities without any disposition provider being available', async () => {
    const { res, read: out } = capture();
    await handleHoldingIdentityRequest(request('/api/investment/portfolio/p-1/identities'), res, {
      holdings: async () => [holdingOf()],
      loadSources: availableSources,
      today: () => FIXTURE_AS_OF,
    });
    expect(out().status).toBe(200);
    const body = JSON.parse(out().body) as {
      identities: Array<{ issuerId: string }>;
      disclosures: { independentOfDispositions: boolean };
    };
    expect(body.identities[0]!.issuerId).toBe(AARAV);
    expect(body.disclosures.independentOfDispositions).toBe(true);
  });

  it('answers 405 for a mutating method before reading holdings', async () => {
    let read = false;
    const { res, read: out } = capture();
    await handleHoldingIdentityRequest(request('/api/investment/portfolio/p-1/identities', 'PUT'), res, {
      holdings: async () => {
        read = true;
        return [];
      },
    });
    expect(out().status).toBe(405);
    expect(read).toBe(false);
  });

  it('sanitizes a holdings failure', async () => {
    const { res, read: out } = capture();
    await handleHoldingIdentityRequest(request('/api/investment/portfolio/p-1/identities'), res, {
      holdings: async () => {
        throw new Error('ipc socket /run/secret.sock refused');
      },
      loadSources: availableSources,
    });
    expect(out().status).toBe(503);
    expect(out().body).not.toContain('secret.sock');
    expect(JSON.parse(out().body)).toMatchObject({ error: 'holdings-unavailable' });
  });

  it('answers 503 when the identity files are unavailable, inferring nothing', async () => {
    const { res, read: out } = capture();
    await handleHoldingIdentityRequest(request('/api/investment/portfolio/p-1/identities'), res, {
      holdings: async () => [holdingOf()],
      loadSources: () => ({ available: false as const, issues: [] }),
    });
    expect(out().status).toBe(503);
    expect(JSON.parse(out().body)).toMatchObject({ error: 'identity-sources-unavailable' });
  });
});
