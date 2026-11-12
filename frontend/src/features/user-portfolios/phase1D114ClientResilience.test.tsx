/**
 * Phase 1 — Client-side D114 `securityIdentity` validation & UI rendering resilience.
 *
 * Verifies:
 *   • `fetchUserPortfolioRead` admits holdings carrying valid nested D114 `securityIdentity`
 *     (no flat `isin`/`exchange`) AND holdings carrying `securityIdentity: null` (`UNRESOLVED`).
 *   • `fetchUserPortfolioRead` rejects holdings carrying malformed `securityIdentity` or conflicting
 *     flat `isin` vs `securityIdentity.isin` into `rejectedHoldings` without hiding valid sibling rows
 *     or shifting `holdingSourceIndices`.
 *   • `<UserPortfolioDetail />` displays `holding.securityIdentity.isin` in the ISIN column when flat
 *     `holding.isin` is absent, links resolved D114 holdings, and renders `not available — identity unresolved`
 *     with no links for `securityIdentity: null`.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { UserPortfolioDetail } from './UserPortfolioDetail';
import { fetchUserPortfolioRead, type UserPortfolioHolding } from '../../api/userPortfolios';

const PORTFOLIO = 'pf-d114';
const BODHI_ISSUER = 'IN:CIN:U72200TN2001PLC000005';
const BODHI_ISIN = 'IN0000000029';

function d114ClientHolding(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    symbol: 'BODHI',
    companyId: 'EQ_2002_IN',
    securityIdentity: {
      securityId: `ISIN:${BODHI_ISIN}:BE`,
      isin: BODHI_ISIN,
      series: 'BE',
      isinAuthority: 'NON_AUTHORITATIVE',
    },
    quantity: 20,
    averageBuyPrice: 500,
    currentPrice: 550,
    marketValue: 11_000,
    weightPercentage: 100,
    active: true,
    sourceBroker: 'DHAN',
    lineageDigest: 'a'.repeat(64),
    identityStatus: 'RESOLVED',
    ...overrides,
  };
}

function portfolioEnvelope(holdings: readonly unknown[]) {
  return {
    portfolio: {
      portfolioId: PORTFOLIO,
      portfolioName: 'D114 Portfolio',
      revision: 1,
      holdings,
      totalMarketValue: 11_000,
      totalHoldingsCount: holdings.length,
      weightSumPercentage: 100,
      lastUpdated: '2026-11-10T00:00:00.000Z',
      provenanceDigest: 'b'.repeat(64),
      isSaved: true,
      contributions: [],
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Phase 1 — client D114 securityIdentity validation and detail rendering', () => {
  it('admits valid D114 securityIdentity and securityIdentity: null while isolating malformed or conflicting rows', async () => {
    const body = portfolioEnvelope([
      // Index 0: malformed D114 securityIdentity -> excluded into rejectedHoldings
      d114ClientHolding({
        symbol: 'BAD1',
        securityIdentity: {
          securityId: 'ISIN:IN0000000011:EQ',
          isin: 'IN0000000011',
          series: '',
          isinAuthority: 'NON_AUTHORITATIVE',
        },
      }),
      // Index 1: valid D114 securityIdentity -> admitted with original source index 1
      d114ClientHolding(),
      // Index 2: explicitly unresolved D114 holding (securityIdentity: null) -> admitted with index 2
      d114ClientHolding({
        symbol: 'UNRES',
        companyId: 'MANUAL:UNRES',
        securityIdentity: null,
        identityStatus: 'UNRESOLVED',
      }),
      // Index 3: conflicting flat isin vs nested securityIdentity.isin -> excluded into rejectedHoldings
      d114ClientHolding({
        symbol: 'CONFLICT',
        isin: 'IN0000000011',
      }),
    ]);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    const read = await fetchUserPortfolioRead(PORTFOLIO);
    expect(read.rejectedHoldings).toBe(2);
    expect(read.holdingSourceIndices).toEqual([1, 2]);
    expect(read.portfolio.holdings.map((h: UserPortfolioHolding) => h.symbol)).toEqual(['BODHI', 'UNRES']);
    expect(read.portfolio.holdings[0]?.securityIdentity).toEqual({
      securityId: `ISIN:${BODHI_ISIN}:BE`,
      isin: BODHI_ISIN,
      series: 'BE',
      isinAuthority: 'NON_AUTHORITATIVE',
    });
    expect(read.portfolio.holdings[1]?.securityIdentity).toBeNull();
  });

  it('keys dispositions and links for nested D114 securityIdentity holdings while preserving unresolved row refusals', async () => {
    const body = portfolioEnvelope([
      d114ClientHolding(),
      d114ClientHolding({
        symbol: 'UNRES',
        companyId: 'MANUAL:UNRES',
        securityIdentity: null,
        identityStatus: 'UNRESOLVED',
      }),
    ]);

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        const url = String(input);
        if (url === `/api/user-portfolios/${PORTFOLIO}`) {
          return new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }
        if (url.endsWith('/revisions')) {
          return new Response(
            JSON.stringify({
              revisions: [
                {
                  revision: 1,
                  operation: 'INITIAL',
                  totalMarketValue: 11_000,
                  provenanceDigest: 'b'.repeat(64),
                  holdingsCount: 2,
                  createdAt: '2026-11-10T00:00:00.000Z',
                },
              ],
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          );
        }
        if (url.endsWith('/identities')) {
          return new Response(
            JSON.stringify({
              status: 'OK',
              portfolioId: PORTFOLIO,
              count: 2,
              identities: [
                {
                  holdingIndex: 0,
                  symbol: 'BODHI',
                  isin: BODHI_ISIN,
                  series: 'BE',
                  d114SecurityIdentity: {
                    securityId: `ISIN:${BODHI_ISIN}:BE`,
                    isin: BODHI_ISIN,
                    series: 'BE',
                    isinAuthority: 'NON_AUTHORITATIVE',
                  },
                  state: 'RESOLVED',
                  outcomeClass: 'RESOLVED',
                  issuerId: BODHI_ISSUER,
                  securityId: `IN:ISIN:${BODHI_ISIN}`,
                  listingId: 'IN:NSE:TWINS:BE:EQUITY',
                  resolutionBasis: 'ISIN',
                  reason: null,
                  reasonText: null,
                  assessable: true,
                },
                {
                  holdingIndex: 1,
                  symbol: 'UNRES',
                  isin: null,
                  series: null,
                  d114SecurityIdentity: null,
                  state: 'UNMATCHED',
                  outcomeClass: 'UNRESOLVED',
                  issuerId: null,
                  securityId: null,
                  listingId: null,
                  resolutionBasis: null,
                  reason: 'NO_IDENTIFIER_PROVIDED',
                  reasonText: 'Neither ISIN nor exchange + symbol was present on the observation.',
                  assessable: false,
                },
              ],
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          );
        }
        if (url.endsWith('/dispositions')) {
          return new Response(
            JSON.stringify({
              status: 'OK',
              portfolioId: PORTFOLIO,
              count: 1,
              dispositions: [
                {
                  securityId: `IN:ISIN:${BODHI_ISIN}`,
                  issuerId: BODHI_ISSUER,
                  verb: 'HOLD',
                  confidence: 0.8125,
                  withheld: false,
                },
              ],
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          );
        }
        return new Response('{}', { status: 404 });
      }),
    );

    render(
      <MemoryRouter initialEntries={[`/user-portfolios/${PORTFOLIO}`]}>
        <Routes>
          <Route path="/user-portfolios/:portfolioId" element={<UserPortfolioDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    // Wait for both holdings and async identity/disposition reads to settle.
    expect(await screen.findByRole('link', { name: /Company assessment/i })).toBeTruthy();

    const bodhiRow = screen.getByText('BODHI').closest('tr');
    const unresRow = screen.getByText('UNRES').closest('tr');
    expect(bodhiRow).toBeTruthy();
    expect(unresRow).toBeTruthy();

    if (bodhiRow) {
      // Disposition keyed via `holdingIsin(holding)` from nested D114 `securityIdentity.isin`!
      expect(within(bodhiRow).getByText('HOLD')).toBeTruthy();
      expect(within(bodhiRow).getByRole('link', { name: /Company assessment/i })).toBeTruthy();
      expect(within(bodhiRow).getByRole('link', { name: /Change history/i })).toBeTruthy();
      expect(within(bodhiRow).getByRole('link', { name: /Candidate view/i })).toBeTruthy();
    }
    if (unresRow) {
      expect(within(unresRow).getByText(/identity unresolved/i)).toBeTruthy();
      expect(within(unresRow).queryAllByRole('link')).toHaveLength(0);
    }
  });
});
