/**
 * IID WI-2 (P2) — company discovery from the Investment Intelligence landing page.
 *
 * What is proven here:
 *   • discovery is reachable from `/investment` and is not a second, competing route;
 *   • a name or identifier query renders the GOVERNED company the server returned, and selecting it opens the
 *     correct IID-01 assessment route, from which disposition and history remain reachable;
 *   • no match, a too-short query and an unavailable source each produce a distinct honest state;
 *   • a known company with NO assessment is distinguished from one whose availability is UNKNOWN;
 *   • discovery still works when the Investment Coverage API returns 503;
 *   • the browser sends the query verbatim and renders the server's issuer id — it never classifies.
 *
 * COMPONENT tests over synthetic fixtures. Not real-issuer end-to-end acceptance.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { App } from '../../app/App';
import { ROUTES } from '../../app/routes';
import InvestmentLandingPage from './InvestmentLandingPage';
import CompanyAssessmentPage from './CompanyAssessmentPage';
import { availabilityCopy } from './CompanyDiscoveryPanel';
import type { CompanyMatch } from '../../api/investmentDiscovery';
import { ASSESSMENT_ENVELOPE, CHANGES_ENVELOPE, BOUNDARIES_ENVELOPE } from './iid6Fixtures';

const ISSUER = 'IN:CIN:L00000AA0000AAA00000';
const NAME = 'Aarav Systems Limited';

function matchOf(overrides: Partial<CompanyMatch> = {}): CompanyMatch {
  return {
    issuerId: ISSUER,
    legalName: NAME,
    cin: 'L00000AA0000AAA00000',
    equityIsin: 'IN0000000201',
    sector: 'Technology',
    issuerKeyBasis: 'CIN',
    matchedBy: 'LEGAL_NAME',
    assessment: 'AVAILABLE',
    versionCount: 2,
    ...overrides,
  };
}

function directoryBody(matches: readonly CompanyMatch[], extra: Record<string, unknown> = {}) {
  return {
    status: 'OK',
    query: 'aarav',
    matches,
    totalMatched: matches.length,
    truncated: false,
    directory: {
      rosterVersion: 'roster-v1',
      rosterDigest: 'f'.repeat(64),
      rosterDataClass: 'OPERATOR_SUPPLIED',
      assessmentAvailabilityUnavailableReason: null,
    },
    ...extra,
  };
}

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

interface StubOptions {
  readonly discovery?: (url: string) => Response;
  /** Coverage is deliberately separate so its failure can be shown to be irrelevant. */
  readonly coverageStatus?: number;
}

function stub(options: StubOptions = {}) {
  const calls: string[] = [];
  const mock = vi.fn(async (input: string) => {
    const url = String(input);
    calls.push(url);
    if (url.startsWith('/api/investment/companies')) {
      return (options.discovery ?? (() => jsonOk(directoryBody([matchOf()]))))(url);
    }
    if (url.startsWith('/api/investment/coverage')) {
      return new Response(JSON.stringify({ error: 'identity-sources-unavailable' }), {
        status: options.coverageStatus ?? 503,
      });
    }
    if (url.includes('/changes/boundaries')) return jsonOk(BOUNDARIES_ENVELOPE);
    if (url.includes('/changes')) return jsonOk(CHANGES_ENVELOPE);
    if (url.includes('/api/investment/company/')) return jsonOk(ASSESSMENT_ENVELOPE);
    return new Response(JSON.stringify({ error: 'not-found' }), { status: 404 });
  });
  vi.stubGlobal('fetch', mock);
  return calls;
}

function LocationProbe(): JSX.Element {
  const { pathname, search, hash } = useLocation();
  return <output data-testid="location">{`${pathname}${search}${hash}`}</output>;
}

/** The real landing page plus the real assessment surface, so selection is followed rather than asserted. */
function renderWorkflow() {
  return render(
    <MemoryRouter initialEntries={['/investment']}>
      <Routes>
        <Route path={ROUTES.investmentIntelligence} element={<InvestmentLandingPage />} />
        <Route path={ROUTES.companyAssessment} element={<CompanyAssessmentPage />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

async function search(value = 'aarav') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Company name or identifier'), value);
  await user.click(screen.getByRole('button', { name: 'Find company' }));
  return user;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('P2 — discovery is available from the landing page', () => {
  it('offers company discovery on /investment without duplicating the landing surface', async () => {
    stub();
    render(<MemoryRouter initialEntries={['/investment']}><App /></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Investment Intelligence' })).toBeInTheDocument();
    expect(screen.getByLabelText('Company name or identifier')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Find company' })).toBeInTheDocument();
    // WI-1's three capabilities and the opaque-identifier option are both preserved.
    expect(screen.getByRole('heading', { name: 'IID-01 — Stock Intelligence' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IID-02 — Investment & Holding Decisions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IID-03 — Historical Change Intelligence' })).toBeInTheDocument();
    expect(screen.getByLabelText('Issuer id')).toBeInTheDocument();
  });

  it('issues no discovery request until the reader searches', async () => {
    const calls = stub();
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    expect(calls.filter((url) => url.startsWith('/api/investment/companies'))).toHaveLength(0);
  });

  it('sends the query verbatim and does not classify it in the browser', async () => {
    const calls = stub();
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search('NSE:AARAV');

    const request = calls.find((url) => url.startsWith('/api/investment/companies')) ?? '';
    expect(request).toBe(`/api/investment/companies?q=${encodeURIComponent('NSE:AARAV')}`);
  });
});

describe('P2 — a match is the governed company, and selection opens IID-01', () => {
  it('renders the server-supplied identity, name, sector and match basis', async () => {
    stub();
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search();

    expect(await screen.findByRole('cell', { name: /Technology/ })).toBeInTheDocument();
    expect(screen.getByText(ISSUER)).toBeInTheDocument();
    expect(screen.getByText('company name')).toBeInTheDocument();
    expect(screen.getByText(/Stored assessment available · 2 versions/)).toBeInTheDocument();
  });

  it('opens the correct company assessment route when the match is selected', async () => {
    stub();
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    const user = await search();

    const link = await screen.findByRole('link', { name: 'Stock Intelligence →' });
    expect(link).toHaveAttribute('href', `/investment/company/${encodeURIComponent(ISSUER)}`);
    await user.click(link);

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(`/investment/company/${encodeURIComponent(ISSUER)}`);
    });
    // The existing IID-01 surface renders, and the workflow onward to disposition/history is intact.
    expect(await screen.findByRole('heading', { name: /Aarav Systems Limited/ })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Investment workflow' });
    expect(within(nav).getByRole('link', { name: 'Disposition' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Historical changes' })).toBeInTheDocument();
  });

  it('offers change history for the same governed issuer', async () => {
    stub();
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search();

    expect(await screen.findByRole('link', { name: 'Change history →' })).toHaveAttribute(
      'href',
      `/investment/company/${encodeURIComponent(ISSUER)}#change-timeline`,
    );
  });

  it('uses the issuer id the server returned, not text derived from the query', async () => {
    // The server matches a name to a DIFFERENT issuer than the query string resembles. The href must follow
    // the server, which is what proves no client-side identity construction.
    const other = 'IN:EQISIN:IN0000000999';
    stub({ discovery: () => jsonOk(directoryBody([matchOf({ issuerId: other, legalName: 'Different Company' })])) });
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search('aarav');

    expect(await screen.findByRole('link', { name: 'Stock Intelligence →' })).toHaveAttribute(
      'href',
      `/investment/company/${encodeURIComponent(other)}`,
    );
  });
});

describe('P2 — honest states', () => {
  it('shows a loading state while the governed read is in flight', async () => {
    stub({ discovery: () => new Promise<Response>(() => {}) as unknown as Response });
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Company name or identifier'), 'aarav');
    await user.click(screen.getByRole('button', { name: 'Find company' }));

    // `ReadOnlyDisclosure` also uses role="status", so assert the specific text rather than the sole role.
    expect(await screen.findByText('Searching the governed roster…')).toBeInTheDocument();
  });

  it('states that nothing matched, and that no company was invented', async () => {
    stub({ discovery: () => jsonOk(directoryBody([])) });
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search('nosuchcompany');

    expect(await screen.findByText(/No governed company matched/)).toBeInTheDocument();
    expect(screen.getByText(/No company was invented and no identifier was constructed/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Stock Intelligence →' })).toBeNull();
  });

  it('reports an invalid query distinct from an unknown company', async () => {
    stub({
      discovery: () =>
        new Response(JSON.stringify({ error: 'discovery-query-too-long' }), { status: 400 }),
    });
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search();

    expect(await screen.findByRole('alert')).toHaveTextContent(/That query is too long/);
  });

  it('will not submit a query below the minimum length', async () => {
    const calls = stub();
    renderWorkflow();
    const input = await screen.findByLabelText('Company name or identifier');
    const user = userEvent.setup();
    await user.type(input, 'a');
    expect(screen.getByRole('button', { name: 'Find company' })).toBeDisabled();
    expect(calls.filter((url) => url.startsWith('/api/investment/companies'))).toHaveLength(0);
  });

  it('reports unavailable identity sources without substituting anything', async () => {
    stub({
      discovery: () =>
        new Response(JSON.stringify({ error: 'identity-sources-unavailable' }), { status: 503 }),
    });
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search();

    expect(await screen.findByRole('alert')).toHaveTextContent(/governed identity files are unavailable/);
    expect(screen.getByRole('alert')).toHaveTextContent(/Nothing was substituted/);
  });

  it('discloses truncation instead of silently hiding matches', async () => {
    stub({
      discovery: () =>
        jsonOk(directoryBody([matchOf()], { totalMatched: 40, truncated: true })),
    });
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search();

    expect(await screen.findByText(/Showing the first 1 of 40 matches/)).toBeInTheDocument();
  });

  it('discloses a synthetic roster so it is never mistaken for live coverage', async () => {
    stub({
      discovery: () =>
        jsonOk(
          directoryBody([matchOf()], {
            directory: {
              rosterVersion: 'roster-v1',
              rosterDigest: 'f'.repeat(64),
              rosterDataClass: 'SYNTHETIC_FIXTURE',
              assessmentAvailabilityUnavailableReason: null,
            },
          }),
        ),
    });
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search();

    expect(await screen.findByText(/synthetic fixture, not live market coverage/)).toBeInTheDocument();
  });
});

describe('P2 — a known company is distinguished from an unavailable assessment', () => {
  it('labels a known company with no recorded assessment as such, and still offers entry', async () => {
    stub({ discovery: () => jsonOk(directoryBody([matchOf({ assessment: 'NONE', versionCount: null })])) });
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search();

    expect(await screen.findByText('Known company — no assessment has been recorded yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Stock Intelligence →' })).toBeInTheDocument();
  });

  it('does not render UNKNOWN availability as "no assessment"', async () => {
    stub({
      discovery: () =>
        jsonOk(
          directoryBody([matchOf({ assessment: 'UNKNOWN', versionCount: null })], {
            directory: {
              rosterVersion: 'roster-v1',
              rosterDigest: 'f'.repeat(64),
              rosterDataClass: 'OPERATOR_SUPPLIED',
              assessmentAvailabilityUnavailableReason: 'The governed assessment store did not answer.',
            },
          }),
        ),
    });
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search();

    expect(await screen.findByText(/Assessment availability could not be checked/)).toBeInTheDocument();
    expect(screen.queryByText('Known company — no assessment has been recorded yet')).toBeNull();
    expect(screen.getByText('The governed assessment store did not answer.')).toBeInTheDocument();
  });

  it('keeps the four availability outcomes distinct in copy', () => {
    const copies = (['AVAILABLE', 'NONE', 'DAMAGED', 'UNKNOWN'] as const).map((assessment) =>
      availabilityCopy(matchOf({ assessment })),
    );
    expect(new Set(copies).size).toBe(4);
  });
});

describe('P2 — discovery is independent of Investment Coverage', () => {
  it('discovers companies while the Coverage API returns 503', async () => {
    const calls = stub({ coverageStatus: 503 });
    renderWorkflow();
    await screen.findByLabelText('Company name or identifier');
    await search();

    expect(await screen.findByRole('link', { name: 'Stock Intelligence →' })).toBeInTheDocument();
    // Discovery never called coverage at all, so coverage availability cannot affect it.
    expect(calls.some((url) => url.startsWith('/api/investment/coverage'))).toBe(false);
  });

  it('names all three capabilities even when discovery AND coverage both fail', async () => {
    stub({
      coverageStatus: 503,
      discovery: () => new Response(JSON.stringify({ error: 'identity-sources-unavailable' }), { status: 503 }),
    });
    render(<MemoryRouter initialEntries={['/investment']}><App /></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'IID-01 — Stock Intelligence' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IID-02 — Investment & Holding Decisions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IID-03 — Historical Change Intelligence' })).toBeInTheDocument();
    await search();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    // A failed discovery read does not remove the capabilities or the identifier entry option.
    expect(screen.getByLabelText('Issuer id')).toBeInTheDocument();
  });
});
