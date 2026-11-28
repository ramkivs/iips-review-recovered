/**
 * W05 census capture contract v2 (2026-11-28) — SERVED-route proof.
 *
 * What this pins (the route side of the contract the W05 Step 1 capture consumes):
 *  1. `GET /api/investment/coverage` serves every holding row with the portfolio's real
 *     revision projected as `raw.portfolioRevision` (from `G2PortfolioView.revision` via
 *     `toHoldingObservation`), so the capture's fail-closed revision check has a served value
 *     to read — and a transport that does not project it is detectable by the capture's
 *     cross-check against `/api/user-portfolios/:id`.
 *  2. The stored identity is served under the flat dotted key `raw['securityIdentity.securityId']`
 *     INDEPENDENTLY of the resolver state: a row can carry a stored identity while the resolver
 *     reports `UNMATCHED` / `ISIN_NOT_IN_ROSTER` (the P04 EQISIN-keyed roster does exactly that
 *     for AGI). Stored identity availability and resolver eligibility are two different facts;
 *     the route serves both (`raw['securityIdentity.securityId']` and `item.state`/`item.reason`).
 *  3. The route NEVER serves `raw.category`: the five-category census disposition is a
 *     governance-side, separately versioned classification contract (the W04 census record /
 *     operator category map), not an API field. The API serves only the authoritative
 *     classification inputs (stored identity, resolver state/reason, portfolio revision, asOf).
 *  4. Rows of other portfolios (the PERSONAL default-portfolio item) are served with their own
 *     `portfolioId`, so the capture can scope to the census portfolio and record the exclusion.
 *  5. Fail-closed behaviour is unchanged: unavailable identity sources still answer 503 with
 *     file-level issues — never a partial classification.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { handleCoverageRequest } from '../../../iips-platform/src/investment/identity/coverageEndpoint';
import { loadIdentitySourcesFromDir } from '../../../iips-platform/src/investment/identity/sources';
import { toHoldingObservation } from './sources';
import type { G2HoldingView } from '../user-portfolio/userPortfolioContract.js';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..');
/** A real operator-supplied identity source set from the repo evidence tree. */
const SOURCES_DIR = join(REPO_ROOT, 'evidence', 'real-issuer', 'REL-1-INFOSYS-2026-11-06', 'identity');

function makeHolding(overrides: Partial<G2HoldingView> = {}): G2HoldingView {
  return {
    symbol: 'FIXTURE-SYM',
    companyId: 'EQ_FIXTURE_IN',
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

/** The live-shape fixture: 65 DHAN_PORTFOLIO holdings at portfolio revision 4 (all with a stored
 * identity, AGI first) + 1 PERSONAL default-portfolio item — mirroring the 2026-11-28 host capture. */
function liveShapeObservations() {
  const holdings: G2HoldingView[] = [];
  for (let index = 0; index < 65; index += 1) {
    const isin = index === 0 ? 'INE415A01038' : `INE00000000${String(index).padStart(2, '0')}`;
    holdings.push(
      makeHolding({
        symbol: index === 0 ? 'AGI' : `SYM${index}`,
        isin,
        exchange: 'NSE',
        identityStatus: 'RESOLVED',
        resolutionDisposition: 'CANONICAL_P04',
        securityIdentity: {
          securityId: `ISIN:${isin}:EQ`,
          isin,
          series: 'EQ',
          isinAuthority: 'NON_AUTHORITATIVE',
        },
      }),
    );
  }
  const dhan = holdings.map((holding, index) => toHoldingObservation('DHAN_PORTFOLIO', holding, index, 4));
  const personal = [toHoldingObservation('PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2', holdings[0], 0, 1)];
  return [...dhan, ...personal];
}

async function serve(observations: ReturnType<typeof liveShapeObservations>) {
  const loaded = loadIdentitySourcesFromDir(SOURCES_DIR);
  if (!loaded.available) throw new Error('fixture identity sources failed to load');
  const result = await handleCoverageRequest(
    { method: 'GET', url: '/api/investment/coverage?asOf=2026-11-28' },
    {
      loadSources: () => loaded,
      observations: async () => observations,
      financialCoverage: undefined,
      today: () => '2026-11-28',
    },
  );
  expect(result).not.toBeNull();
  return { status: result!.status, report: JSON.parse(result!.body) };
}

describe('W05 contract v2 — the served coverage route carries the census facts', () => {
  it('serves every holding row with raw.portfolioRevision equal to the portfolio view revision', async () => {
    const { status, report } = await serve(liveShapeObservations());
    expect(status).toBe(200);
    const dhan = report.items.filter((item: any) => item.portfolioId === 'DHAN_PORTFOLIO');
    expect(dhan).toHaveLength(65);
    for (const item of dhan) {
      expect(item.raw.portfolioRevision).toBe(4);
    }
  });

  it('serves the stored identity beside an UNMATCHED resolver state — two separate facts', async () => {
    const { report } = await serve(liveShapeObservations());
    const agi = report.items.find((item: any) => item.observationId === 'holding:DHAN_PORTFOLIO:0001');
    // stored identity is present (IPD stored it) ...
    expect(agi.raw['securityIdentity.securityId']).toBe('ISIN:INE415A01038:EQ');
    // ... while the resolver reports the ISIN is not in the eligible roster — not a contradiction:
    expect(agi.state).toBe('UNMATCHED');
    expect(agi.reason).toBe('ISIN_NOT_IN_ROSTER');
    // the upstream import flag is carried for reconciliation, never believed:
    expect(agi.upstreamStatus).toBe('RESOLVED');
    // the census extraction reads both fields verbatim:
    expect(agi.resolverState ?? agi.state).toBe('UNMATCHED');
  });

  it('never serves raw.category — the five categories are governance-side, not an API field', async () => {
    const { report } = await serve(liveShapeObservations());
    for (const item of report.items) {
      expect(item.raw.category).toBeUndefined();
      expect('category' in item.raw).toBe(false);
    }
  });

  it('serves other-portfolio rows with their own portfolioId so the capture can scope and record exclusions', async () => {
    const { report } = await serve(liveShapeObservations());
    expect(report.items).toHaveLength(66);
    const personal = report.items.filter((item: any) => item.portfolioId !== 'DHAN_PORTFOLIO');
    expect(personal).toHaveLength(1);
    expect(personal[0].portfolioId).toBe('PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2');
    expect(personal[0].raw.portfolioRevision).toBe(1);
  });

  it('still fails closed with 503 when the identity sources are unavailable', async () => {
    const result = await handleCoverageRequest(
      { method: 'GET', url: '/api/investment/coverage?asOf=2026-11-28' },
      {
        loadSources: () => ({ available: false, issues: [{ file: 'eligible-roster.json', code: 'MISSING', subject: 'roster', detail: 'fixture' }], sources: undefined as any }),
        observations: async () => [],
        financialCoverage: undefined,
        today: () => '2026-11-28',
      },
    );
    expect(result!.status).toBe(503);
    const body = JSON.parse(result!.body);
    expect(body.error).toBe('identity-sources-unavailable');
    expect(body.issues).toHaveLength(1);
  });
});
