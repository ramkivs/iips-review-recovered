/**
 * IID WI-2A — Correction B: portfolio payload resilience.
 *
 * REPRODUCED DEFECT (before this change): `fetchUserPortfolio` validated only `body.portfolio` truthiness.
 * A payload whose `holdings` was absent or not an array, or that contained one malformed holding record,
 * reached the renderer and threw (`view.holdings.forEach` / `formatInr(undefined)` / `shortDigest`).
 * The whole detail surface was replaced by a React error, so ONE malformed record hid the portfolio
 * header, the metrics, the contributions AND every valid holding.
 *
 * The fix validates the read payload against the SAME field rules the governed server contract uses
 * (`validateHoldingShape` / `verifyPortfolioEnvelope`), excludes inadmissible records, and discloses them.
 * Schema validation is NOT weakened: no value is defaulted, coerced or invented, and an inadmissible
 * record is never rendered as a holding.
 *
 * Synthetic payloads only; no real portfolio data and no browser journey.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { UserPortfolioDetail } from './UserPortfolioDetail';
import {
  UserPortfolioApiError,
  fetchUserPortfolio,
  fetchUserPortfolioRead,
  type UserPortfolioHolding,
} from '../../api/userPortfolios';

const PORTFOLIO = 'pf-resilience';
const AARAV_ISSUER = 'IN:CIN:L72200KA1981PLC013115';
const BODHI_ISSUER = 'IN:CIN:U72200TN2001PLC000005';
const AARAV_ISIN = 'IN0000000011';
const BODHI_ISIN = 'IN0000000029';

function holdingOf(overrides: Partial<UserPortfolioHolding> = {}): UserPortfolioHolding {
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

const CONTRIBUTION = {
  sourceBroker: 'GENERIC',
  fileName: 'holdings.csv',
  contentDigest: 'f'.repeat(64),
  lineageDigest: '0'.repeat(64),
  importedAt: '2026-11-01T09:00:00.000Z',
  holdingsCount: 1,
  totalMarketValue: 1100,
};

function viewOf(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    portfolioId: PORTFOLIO,
    portfolioName: 'Resilience Portfolio',
    revision: 2,
    holdings: [holdingOf()],
    totalMarketValue: 1100,
    totalHoldingsCount: 1,
    weightSumPercentage: 100,
    lastUpdated: '2026-11-08T00:00:00.000Z',
    provenanceDigest: 'b'.repeat(64),
    isSaved: true,
    contributions: [CONTRIBUTION],
    ...overrides,
  };
}

/** Identities are keyed by the UPSTREAM holding index, exactly as the P3 transport returns them. */
function identityOf(holdingIndex: number, issuerId: string, isin: string) {
  return {
    holdingIndex,
    symbol: issuerId === AARAV_ISSUER ? 'AARAV' : 'BODHI',
    isin,
    state: 'RESOLVED',
    issuerId,
    securityId: `IN:ISIN:${isin}`,
    resolutionBasis: 'ISIN',
    reason: null,
    reasonText: null,
    assessable: true,
  };
}

let consoleErrors: string[] = [];

function stubTransport(options: {
  readonly body: unknown;
  readonly status?: number;
  readonly identities?: readonly unknown[];
  readonly identitiesStatus?: number;
  readonly rawBody?: string;
}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      const url = String(input);
      if (url === `/api/user-portfolios/${PORTFOLIO}`) {
        return new Response(
          options.rawBody ?? JSON.stringify(options.body),
          { status: options.status ?? 200, headers: { 'content-type': 'application/json' } },
        );
      }
      if (url.endsWith('/revisions')) {
        // Mirrors the detail body's revision facts so this suite keeps exercising the
        // WI-2A payload-resilience paths rather than the summary's own diagnosis.
        const body = (options.body ?? {}) as { portfolio?: Record<string, unknown> };
        const view = body.portfolio ?? {};
        const revision = typeof view.revision === 'number' ? view.revision : 1;
        const holdingsCount = typeof view.totalHoldingsCount === 'number' ? view.totalHoldingsCount : 0;
        return new Response(
          JSON.stringify({
            revisions: [{
              revision,
              operation: 'INITIAL',
              totalMarketValue: typeof view.totalMarketValue === 'number' ? view.totalMarketValue : 0,
              provenanceDigest: typeof view.provenanceDigest === 'string' ? view.provenanceDigest : '',
              holdingsCount,
              createdAt: typeof view.lastUpdated === 'string' ? view.lastUpdated : '2026-11-08T00:00:00.000Z',
            }],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }
      if (url.endsWith('/identities')) {
        return new Response(
          JSON.stringify({
            status: 'OK',
            portfolioId: PORTFOLIO,
            count: (options.identities ?? []).length,
            identities: options.identities ?? [],
          }),
          { status: options.identitiesStatus ?? 200 },
        );
      }
      if (url.endsWith('/dispositions')) {
        return new Response(
          JSON.stringify({ status: 'OK', portfolioId: PORTFOLIO, count: 0, dispositions: [] }),
          { status: 200 },
        );
      }
      return new Response('{}', { status: 404 });
    }),
  );
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={[`/user-portfolios/${PORTFOLIO}`]}>
      <Routes>
        <Route path="/user-portfolios/:portfolioId" element={<UserPortfolioDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  consoleErrors = [];
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    consoleErrors.push(args.map(String).join(' '));
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function crashes(): readonly string[] {
  return consoleErrors.filter((line) => /Uncaught|TypeError|not a function|Cannot read/.test(line));
}

/* --------------------------------------------------------------- valid, optional-absent, and empty */

describe('B — valid payloads are preserved', () => {
  it('renders a fully valid portfolio with its holdings and contributions', async () => {
    stubTransport({ body: { portfolio: viewOf() }, identities: [identityOf(0, AARAV_ISSUER, AARAV_ISIN)] });
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Resilience Portfolio' })).toBeInTheDocument();
    expect(screen.getByText('holdings.csv')).toBeInTheDocument();
    expect(screen.queryByTestId('malformed-holdings-notice')).toBeNull();
    expect(crashes()).toEqual([]);
  });

  it('accepts a holding whose OPTIONAL fields are absent (no isin/exchange/identityStatus)', async () => {
    const minimal: UserPortfolioHolding = {
      symbol: 'INFY',
      companyId: 'INFY',
      quantity: 5,
      averageBuyPrice: 1500,
      currentPrice: 1600,
      marketValue: 8000,
      weightPercentage: 100,
      active: true,
      sourceBroker: 'GENERIC',
      lineageDigest: 'c'.repeat(64),
    };
    stubTransport({ body: { portfolio: viewOf({ holdings: [minimal] }) } });
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Resilience Portfolio' })).toBeInTheDocument();
    // The symbol appears in both the Symbol and Company columns; assert presence, not uniqueness.
    expect(screen.getAllByText('INFY').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('malformed-holdings-notice')).toBeNull();
    expect(crashes()).toEqual([]);
  });

  it('renders an EMPTY portfolio as empty, not as malformed or unavailable', async () => {
    stubTransport({ body: { portfolio: viewOf({ holdings: [], contributions: [], totalHoldingsCount: 0 }) } });
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Resilience Portfolio' })).toBeInTheDocument();
    expect(screen.getByText('No holdings on this portfolio.')).toBeInTheDocument();
    expect(screen.queryByTestId('malformed-holdings-notice')).toBeNull();
    expect(screen.queryByTestId('state-error')).toBeNull();
    expect(crashes()).toEqual([]);
  });

  it('preserves upstream totals verbatim rather than recomputing them from the readable subset', async () => {
    const read = await (async () => {
      stubTransport({
        body: { portfolio: viewOf({ holdings: [holdingOf(), { symbol: 'BROKEN' }], totalMarketValue: 9999 }) },
      });
      return fetchUserPortfolioRead(PORTFOLIO);
    })();
    expect(read.portfolio.totalMarketValue).toBe(9999);
    expect(read.portfolio.totalHoldingsCount).toBe(1);
  });
});

/* ------------------------------------------------------------- malformed top-level and unavailable */

describe('B — malformed is distinguished from unavailable', () => {
  it('fails closed on a malformed top-level envelope without crashing', async () => {
    stubTransport({ body: { unexpected: 'shape' } });
    renderDetail();
    expect(await screen.findByTestId('state-error')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Resilience Portfolio' })).toBeNull();
    expect(crashes()).toEqual([]);
  });

  it('rejects a non-array holdings collection as MALFORMED (500), not as an empty portfolio', async () => {
    stubTransport({ body: { portfolio: viewOf({ holdings: { oops: true } }) } });
    await expect(fetchUserPortfolioRead(PORTFOLIO)).rejects.toMatchObject({ status: 500 });
    renderDetail();
    expect(await screen.findByTestId('state-error')).toBeInTheDocument();
    expect(screen.queryByText('No holdings on this portfolio.')).toBeNull();
    expect(crashes()).toEqual([]);
  });

  it('rejects an ABSENT holdings collection as malformed rather than rendering a crash', async () => {
    const withoutHoldings = viewOf();
    delete withoutHoldings.holdings;
    stubTransport({ body: { portfolio: withoutHoldings } });
    renderDetail();
    expect(await screen.findByTestId('state-error')).toBeInTheDocument();
    expect(crashes()).toEqual([]);
  });

  it('rejects a non-array contributions collection as malformed', async () => {
    stubTransport({ body: { portfolio: viewOf({ contributions: 'nope' }) } });
    await expect(fetchUserPortfolioRead(PORTFOLIO)).rejects.toMatchObject({ status: 500 });
  });

  it('handles a non-JSON body as a malformed envelope, not an unhandled rejection', async () => {
    stubTransport({ body: null, rawBody: '<html>gateway</html>' });
    await expect(fetchUserPortfolioRead(PORTFOLIO)).rejects.toBeInstanceOf(UserPortfolioApiError);
    renderDetail();
    expect(await screen.findByTestId('state-error')).toBeInTheDocument();
    expect(crashes()).toEqual([]);
  });

  it('renders an UNAVAILABLE response as unavailable, distinctly from malformed', async () => {
    stubTransport({ body: { error: 'upstream-unavailable' }, status: 503 });
    renderDetail();
    expect(await screen.findByTestId('state-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('state-error')).toBeNull();
    expect(crashes()).toEqual([]);
  });

  it('keeps 404 indistinguishable across missing and foreign portfolios', async () => {
    stubTransport({ body: { error: 'not-found' }, status: 404 });
    renderDetail();
    expect(await screen.findByTestId('state-not-found')).toBeInTheDocument();
    expect(crashes()).toEqual([]);
  });
});

/* ------------------------------------------------- malformed individual records / mixed payloads */

describe('B — one malformed record never hides the valid ones', () => {
  it('renders the valid holdings and hides the malformed record in a mixed payload', async () => {
    stubTransport({
      body: {
        portfolio: viewOf({
          holdings: [holdingOf(), { symbol: 'BROKEN' }, holdingOf({ symbol: 'BODHI', isin: BODHI_ISIN })],
          totalHoldingsCount: 3,
        }),
      },
      identities: [identityOf(0, AARAV_ISSUER, AARAV_ISIN), identityOf(2, BODHI_ISSUER, BODHI_ISIN)],
    });
    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Resilience Portfolio' })).toBeInTheDocument();
    // Valid records survive; the malformed one is never rendered as a holding.
    expect(screen.getByText('BODHI')).toBeInTheDocument();
    expect(screen.queryByText('BROKEN')).toBeNull();
    // Contributions and metrics are no longer suppressed by the bad holding.
    expect(screen.getByText('holdings.csv')).toBeInTheDocument();
    expect(screen.getByTestId('malformed-holdings-notice')).toHaveTextContent('1 holding record(s) could not be read');
    expect(crashes()).toEqual([]);
  });

  it('joins identities by the ORIGINAL upstream index after a record is excluded', async () => {
    stubTransport({
      body: {
        portfolio: viewOf({
          // Upstream index 0 is malformed; AARAV is index 1, BODHI is index 2.
          holdings: [{ symbol: 'BROKEN' }, holdingOf(), holdingOf({ symbol: 'BODHI', isin: BODHI_ISIN })],
        }),
      },
      identities: [identityOf(1, AARAV_ISSUER, AARAV_ISIN), identityOf(2, BODHI_ISSUER, BODHI_ISIN)],
    });
    renderDetail();
    await screen.findByRole('heading', { name: 'Resilience Portfolio' });

    // The first table is Holdings; the second is Import contributions.
    const holdingsTable = screen.getAllByRole('table')[0]!;
    const rows = within(holdingsTable).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    // Each surviving row must link to ITS OWN issuer — never the neighbour's.
    const aaravLinks = within(rows[0]!).getAllByRole('link', { name: /Company assessment/ });
    expect(aaravLinks[0]!.getAttribute('href')).toContain(encodeURIComponent(AARAV_ISSUER));
    const bodhiLinks = within(rows[1]!).getAllByRole('link', { name: /Company assessment/ });
    expect(bodhiLinks[0]!.getAttribute('href')).toContain(encodeURIComponent(BODHI_ISSUER));
    expect(crashes()).toEqual([]);
  });

  it('does not render an all-malformed portfolio as an empty one', async () => {
    stubTransport({ body: { portfolio: viewOf({ holdings: [{ symbol: 'BROKEN' }, null, 'text'] }) } });
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Resilience Portfolio' })).toBeInTheDocument();
    expect(screen.getByTestId('malformed-holdings-notice')).toHaveTextContent('3 holding record(s)');
    expect(screen.getByText(/No readable holding records/)).toBeInTheDocument();
    expect(screen.queryByText('No holdings on this portfolio.')).toBeNull();
    expect(crashes()).toEqual([]);
  });

  it('discloses a malformed contribution without hiding the holdings', async () => {
    stubTransport({
      body: { portfolio: viewOf({ contributions: [CONTRIBUTION, { fileName: 'bad.csv' }] }) },
    });
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Resilience Portfolio' })).toBeInTheDocument();
    expect(screen.getByText('holdings.csv')).toBeInTheDocument();
    expect(screen.queryByText('bad.csv')).toBeNull();
    expect(screen.getByTestId('malformed-contributions-notice')).toHaveTextContent('1 import contribution record(s)');
    expect(crashes()).toEqual([]);
  });

  it.each([
    ['a non-finite quantity', { quantity: Number.NaN }],
    ['a stringified number', { quantity: '10' }],
    ['a missing market value', { marketValue: undefined }],
    ['a non-boolean active flag', { active: 'yes' }],
    ['a missing lineage digest', { lineageDigest: undefined }],
    ['an inadmissible exchange', { exchange: 'NYSE' }],
    ['an inadmissible identity status', { identityStatus: 'MAYBE' }],
    ['a blank symbol', { symbol: '   ' }],
  ])('never coerces %s into a valid holding', async (_label, patch) => {
    stubTransport({ body: { portfolio: viewOf({ holdings: [{ ...holdingOf(), ...patch }] }) } });
    const read = await fetchUserPortfolioRead(PORTFOLIO);
    expect(read.portfolio.holdings).toHaveLength(0);
    expect(read.rejectedHoldings).toBe(1);
    expect(read.holdingSourceIndices).toEqual([]);
  });

  it('excludes malformed records without renumbering the retained source indices', async () => {
    stubTransport({
      body: { portfolio: viewOf({ holdings: [holdingOf(), { symbol: 'BAD' }, holdingOf({ symbol: 'BODHI' })] }) },
    });
    const read = await fetchUserPortfolioRead(PORTFOLIO);
    expect(read.portfolio.holdings.map((h) => h.symbol)).toEqual(['AARAV', 'BODHI']);
    expect(read.holdingSourceIndices).toEqual([0, 2]);
    expect(read.rejectedHoldings).toBe(1);
  });
});

/* ------------------------------------------------------ identity-read failure is still independent */

describe('B — payload resilience does not weaken the P3 identity contract', () => {
  it('still offers no company link when the identity read fails', async () => {
    stubTransport({ body: { portfolio: viewOf() }, identitiesStatus: 503 });
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Resilience Portfolio' })).toBeInTheDocument();
    expect(screen.getByText(/holding identity could not be read/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Company assessment/ })).toBeNull();
    expect(crashes()).toEqual([]);
  });

  it('renders no company link for an unresolved but structurally valid holding', async () => {
    stubTransport({
      body: { portfolio: viewOf() },
      identities: [
        {
          holdingIndex: 0,
          symbol: 'AARAV',
          isin: AARAV_ISIN,
          state: 'UNMATCHED',
          issuerId: null,
          securityId: null,
          resolutionBasis: null,
          reason: 'ISIN_NOT_IN_ROSTER',
          reasonText: 'the ISIN is not in the governed roster',
          assessable: false,
        },
      ],
    });
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Resilience Portfolio' })).toBeInTheDocument();
    expect(screen.getByText(/the ISIN is not in the governed roster/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Company assessment/ })).toBeNull();
    // A structurally valid holding is still shown; only its identity-derived links are withheld.
    expect(screen.queryByTestId('malformed-holdings-notice')).toBeNull();
    expect(crashes()).toEqual([]);
  });

  it('remains read-only on every degraded path', async () => {
    stubTransport({ body: { portfolio: viewOf({ holdings: [{ symbol: 'BROKEN' }, holdingOf()] }) } });
    renderDetail();
    await screen.findByRole('heading', { name: 'Resilience Portfolio' });
    // The only control on this surface is the summary's Refresh, which re-issues the
    // same read-only reads; no control changes data.
    const controls = screen.queryAllByRole('button');
    expect(controls.map((node) => node.getAttribute('data-testid'))).toEqual(['summary-refresh']);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
  });
});

/* --------------------------------------------- the original public signature must stay compatible */

describe('B — existing callers are not broken', () => {
  it('keeps fetchUserPortfolio returning the view directly for pre-existing callers', async () => {
    stubTransport({ body: { portfolio: viewOf() } });
    const view = await fetchUserPortfolio(PORTFOLIO);
    expect(view.portfolioName).toBe('Resilience Portfolio');
    expect(view.holdings).toHaveLength(1);
  });

  it('applies the same malformed-payload refusal through the original signature', async () => {
    stubTransport({ body: { portfolio: viewOf({ holdings: { oops: true } }) } });
    await expect(fetchUserPortfolio(PORTFOLIO)).rejects.toMatchObject({ status: 500 });
  });

  it('excludes an inadmissible record through the original signature too', async () => {
    stubTransport({ body: { portfolio: viewOf({ holdings: [holdingOf(), { symbol: 'BAD' }] }) } });
    const view = await fetchUserPortfolio(PORTFOLIO);
    expect(view.holdings.map((h) => h.symbol)).toEqual(['AARAV']);
  });
});

/** Kept honest about the mirror: the client never adds an identity field to the wire type. */
describe('B — wire mirror integrity', () => {
  it('does not introduce issuerId into the portfolio holding mirror', async () => {
    stubTransport({ body: { portfolio: viewOf() } });
    const read = await fetchUserPortfolioRead(PORTFOLIO);
    expect(Object.prototype.hasOwnProperty.call(read.portfolio.holdings[0]!, 'issuerId')).toBe(false);
  });
});
