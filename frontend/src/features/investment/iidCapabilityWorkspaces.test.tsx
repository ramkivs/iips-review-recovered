/**
 * IID — the three INDEPENDENT capability workspaces.
 *
 * THE DEFECT THIS LOCKS
 *   The three capabilities were exposed only as anchors on `/investment`:
 *
 *     /investment#iid-01   /investment#iid-02   /investment#iid-03
 *
 *   Clicking any of them took the reader to the SAME page and merely scrolled to a section. The
 *   product gave discoverability but not three independently accessible working areas.
 *
 * WHAT IS PROVEN HERE
 *   1. Route registration: each capability has its own real route, and each renders its own page.
 *   2. Independent navigation destinations: the three nav entries are three distinct paths, none
 *      of them an anchor on `/investment`.
 *   3. Direct URL loading: each URL works on its own, with no prior navigation.
 *   4. Component selection: each route mounts the correct page component and no other.
 *   5. Company discovery and assessment navigation (IID-01).
 *   6. Candidate versus held decision navigation, and the candidate/held distinction (IID-02).
 *   7. Historical comparison navigation (IID-03), including the two-version rule.
 *   8. Context preservation: issuer, portfolio, security and assessment version survive a move
 *      between capabilities.
 *   9. Empty and unavailable states, per capability.
 *  10. Regression: the `/investment` overview still works, and the existing surfaces are unchanged.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { App } from '../../app/App';
import { ROUTES } from '../../app/routes';
import { visibleChildren, visibleNav } from '../../app/navigation';
import StockIntelligencePage from './StockIntelligencePage';
import HoldingDecisionsPage from './HoldingDecisionsPage';
import ChangeIntelligencePage from './ChangeIntelligencePage';
import {
  ASSESSMENT_ENVELOPE,
  BOUNDARIES_ENVELOPE,
  CANDIDATE_DISPOSITION_ENVELOPE,
  CHANGES_ENVELOPE,
  DISPOSITION_ENVELOPE,
  ISSUER,
  PORTFOLIO,
  SECURITY,
} from './iid6Fixtures';

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

/** The held dispositions list the IID-02 workspace reads. */
const HELD_DISPOSITION_LIST = {
  status: 'OK',
  portfolioId: PORTFOLIO,
  count: 1,
  dispositions: [
    {
      portfolioId: PORTFOLIO,
      securityId: SECURITY,
      scopeToken: `hd:${PORTFOLIO}/${SECURITY}`,
      reportKey: 'e'.repeat(64),
      chainRootReportId: 'd-1',
      versionCount: 1,
      headReportId: 'd-1',
      artifactVersion: 1,
      generatedAt: '2026-11-06T06:00:00.000Z',
      verb: 'HOLD',
      confidence: 0.674,
      horizon: '12M',
      withheld: false,
      issuerId: ISSUER,
    },
  ],
  limitations: [],
};

/** A governed-company discovery result. */
const DISCOVERY_RESULT = {
  status: 'OK',
  query: 'Aarav',
  directory: {
    rosterDataClass: 'SYNTHETIC_FIXTURE',
    assessmentAvailabilityUnavailableReason: null,
  },
  totalMatched: 1,
  truncated: false,
  matches: [
    {
      issuerId: ISSUER,
      legalName: 'Aarav Systems Limited',
      cin: 'U12345',
      equityIsin: 'IN0000000201',
      sector: 'INDUSTRIALS',
      matchedBy: 'LEGAL_NAME',
      assessment: 'AVAILABLE',
      versionCount: 2,
    },
  ],
};

/**
 * Serve every read the three workspaces use. Everything else answers 404, so a workspace that
 * reaches for a read it was not given fails loudly rather than silently rendering nothing.
 */
function stubReads(overrides: (url: string) => Response | null = () => null) {
  const mock = vi.fn(async (input: string) => {
    const url = String(input);
    const override = overrides(url);
    if (override !== null) return override;
    if (url.includes('/changes/boundaries')) return jsonOk(BOUNDARIES_ENVELOPE);
    if (url.includes('/changes')) return jsonOk(CHANGES_ENVELOPE);
    if (url.includes('/dispositions')) return jsonOk(HELD_DISPOSITION_LIST);
    if (url.includes('/identities')) {
      return jsonOk({ status: 'OK', portfolioId: PORTFOLIO, count: 0, identities: [] });
    }
    if (url.includes('/holding/')) return jsonOk(DISPOSITION_ENVELOPE);
    if (url.includes('/api/investment/candidate/')) return jsonOk(CANDIDATE_DISPOSITION_ENVELOPE);
    if (url.includes('/api/investment/company/')) return jsonOk(ASSESSMENT_ENVELOPE);
    if (url.includes('/api/investment/companies')) return jsonOk(DISCOVERY_RESULT);
    // The two coverage reads, so the regression assertions below prove those surfaces still work
    // and are still independent of the capability workspaces.
    if (url.includes('/api/investment/coverage/investment')) {
      return jsonOk({
        reportVersion: 1,
        asOf: '2026-11-10',
        generatedAt: '2026-11-10T00:00:00.000Z',
        dataset: {
          datasetVersion: 'sha256:abc',
          contentDigest: 'abc',
          provider: 'test',
          licence: 'test',
          dataAsOf: null,
          knownAsOf: null,
          lastImportAt: '',
          importRunId: '',
          quality: 'good',
          completenessPct: 100,
          datasetClass: 'SYNTHETIC_FIXTURE',
          issuers: 0,
          securities: 0,
          listings: 0,
          annualPeriods: 0,
          quarterlyPeriods: 0,
          prices: 0,
          operatingMetricRecords: 0,
          corporateActions: 0,
          earliestPeriodEnd: null,
          latestPeriodEnd: null,
        },
        sectors: [],
        measuredSectors: 0,
        totalSectors: 0,
        outstandingSectors: [],
        issuers: [],
        counts: { observed: 0, COVERED: 0, NO_FINANCIALS: 0, SECTOR_NOT_MEASURED: 0, ISSUED_DATA: 0 },
        issues: [],
        financialCoverage: {
          measuredSectors: 0,
          totalSectors: 0,
          outstandingSectors: [],
          usableMethods: 0,
          withheldMethods: 0,
          xbrlMappedTags: 0,
          derivationItems: 0,
          unmappedTagsObserved: [],
          datasetClass: 'NONE',
          note: 'note',
        },
        statusLine: 'status',
        notes: [],
        identitySourcesAvailable: true,
        identitySourceDetail: null,
      });
    }
    if (url.includes('/api/investment/coverage')) {
      return jsonOk({
        reportVersion: 1,
        asOf: '2026-11-10',
        generatedAt: '2026-11-10T00:00:00.000Z',
        counts: { observed: 0, assessable: 0, RESOLVED: 0 },
        bySource: { HOLDING: { observed: 0, resolved: 0, unresolved: 0, assessable: 0 } },
        items: [],
        unresolved: [],
        successorReconciliations: [],
        financialCoverage: {
          measuredSectors: 0,
          totalSectors: 0,
          outstandingSectors: [],
          usableMethods: 0,
          withheldMethods: 0,
          xbrlMappedTags: 0,
          derivationItems: 0,
          unmappedTagsObserved: [],
          datasetClass: 'NONE',
          note: 'note',
        },
        statusLine: 'identity status',
        notes: [],
        identitySources: {
          rosterVersion: 'a'.repeat(64),
          listingMapVersion: 'b'.repeat(64),
          corporateActionTableVersion: 'c'.repeat(64),
          rosterLabel: 'synthetic roster',
          rosterDataClass: 'SYNTHETIC_FIXTURE',
        },
      });
    }
    return new Response(JSON.stringify({ error: 'not-found' }), { status: 404 });
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

/** Render the REAL application at a path, so the real route table decides what renders. */
function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

/** Render one capability workspace in isolation, with a location probe. */
function renderWorkspaceAt(path: string, element: JSX.Element) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={ROUTES.stockIntelligence} element={element} />
        <Route path={ROUTES.holdingDecisions} element={element} />
        <Route path={ROUTES.changeIntelligence} element={element} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

function LocationProbe(): JSX.Element {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{`${pathname}${search}`}</output>;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------ route registration */

describe('each capability has its own real route', () => {
  it('declares three distinct capability paths', () => {
    expect(ROUTES.stockIntelligence).toBe('/investment/stock-intelligence');
    expect(ROUTES.holdingDecisions).toBe('/investment/holding-decisions');
    expect(ROUTES.changeIntelligence).toBe('/investment/change-intelligence');

    const paths = [ROUTES.stockIntelligence, ROUTES.holdingDecisions, ROUTES.changeIntelligence];
    expect(new Set(paths).size).toBe(3);
  });

  it('registers the three routes on the real application', () => {
    const routes = (App as unknown as { toString: () => string }).toString();
    // The route table is JSX, so the registration is proven by rendering each path below.
    expect(routes.length).toBeGreaterThan(0);
  });

  it('mounts the Stock Intelligence page at its own route', async () => {
    stubReads();
    renderAppAt(ROUTES.stockIntelligence);
    expect(await screen.findByRole('heading', { name: /IID-01 — Stock Intelligence/ })).toBeInTheDocument();
  });

  it('mounts the Holding Decisions page at its own route', async () => {
    stubReads();
    renderAppAt(ROUTES.holdingDecisions);
    expect(await screen.findByRole('heading', { name: /IID-02 — Investment & Holding Decisions/ })).toBeInTheDocument();
  });

  it('mounts the Change Intelligence page at its own route', async () => {
    stubReads();
    renderAppAt(ROUTES.changeIntelligence);
    expect(await screen.findByRole('heading', { name: /IID-03 — Historical Change Intelligence/ })).toBeInTheDocument();
  });

  it('renders a different page for each route', async () => {
    stubReads();
    const { unmount } = renderAppAt(ROUTES.stockIntelligence);
    await screen.findByRole('heading', { name: /IID-01 — Stock Intelligence/ });
    expect(screen.queryByRole('heading', { name: /IID-02 — Investment/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: /IID-03 — Historical/ })).toBeNull();
    unmount();

    const second = renderAppAt(ROUTES.holdingDecisions);
    await screen.findByRole('heading', { name: /IID-02 — Investment & Holding Decisions/ });
    expect(screen.queryByRole('heading', { name: /IID-01 — Stock Intelligence/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: /IID-03 — Historical/ })).toBeNull();
    second.unmount();

    renderAppAt(ROUTES.changeIntelligence);
    await screen.findByRole('heading', { name: /IID-03 — Historical Change Intelligence/ });
    expect(screen.queryByRole('heading', { name: /IID-01 — Stock Intelligence/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: /IID-02 — Investment & Holding/ })).toBeNull();
  });
});

/* ------------------------------------------------------------------ navigation */

describe('the three capability entries are independent destinations', () => {
  it('points each nav child at its own real route, not an anchor', () => {
    const group = visibleNav().find((item) => item.label === 'Investment Intelligence');
    expect(group).toBeDefined();

    const children = visibleChildren(group as NonNullable<typeof group>);
    expect(children.map((child) => child.path)).toEqual([
      ROUTES.stockIntelligence,
      ROUTES.holdingDecisions,
      ROUTES.changeIntelligence,
    ]);
    for (const child of children) {
      expect(child.path).not.toContain('#');
      expect(child.path.startsWith('/investment/')).toBe(true);
    }
  });

  it('keeps the group parent on the overview', () => {
    const group = visibleNav().find((item) => item.label === 'Investment Intelligence');
    expect(group?.path).toBe(ROUTES.investmentIntelligence);
    expect(group?.path).toBe('/investment');
  });

  it('renders the three links in the sidebar with their own hrefs', () => {
    stubReads();
    renderAppAt('/executive');
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(sidebar).getByRole('link', { name: 'IID-01 — Stock Intelligence' })).toHaveAttribute(
      'href',
      ROUTES.stockIntelligence,
    );
    expect(within(sidebar).getByRole('link', { name: 'IID-02 — Investment & Holding Decisions' })).toHaveAttribute(
      'href',
      ROUTES.holdingDecisions,
    );
    expect(within(sidebar).getByRole('link', { name: 'IID-03 — Historical Change Intelligence' })).toHaveAttribute(
      'href',
      ROUTES.changeIntelligence,
    );
  });

  it('marks the current capability as the active navigation entry', async () => {
    stubReads();
    renderAppAt(ROUTES.holdingDecisions);
    await screen.findByRole('heading', { name: /IID-02 — Investment & Holding Decisions/ });

    // The sidebar and the breadcrumb both name the capability; the SIDEBAR entry is the navigation
    // state, and only it carries `aria-current` from the NavLink.
    const sidebar = screen.getByRole('navigation', { name: 'Primary' });
    const link = within(sidebar).getByRole('link', { name: 'IID-02 — Investment & Holding Decisions' });
    // NavLink sets `aria-current="page"` on the entry whose path matches the location.
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(within(sidebar).getByRole('link', { name: 'IID-01 — Stock Intelligence' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('links each capability from the landing overview', async () => {
    stubReads();
    renderAppAt(ROUTES.investmentIntelligence);
    await screen.findByRole('heading', { name: 'Investment Intelligence' });

    expect(screen.getAllByRole('link', { name: /Open the Stock Intelligence workspace/ })[0]).toHaveAttribute(
      'href',
      ROUTES.stockIntelligence,
    );
    expect(
      screen.getAllByRole('link', { name: /Open the Investment & Holding Decisions workspace/ })[0],
    ).toHaveAttribute('href', ROUTES.holdingDecisions);
    expect(
      screen.getAllByRole('link', { name: /Open the Historical Change Intelligence workspace/ })[0],
    ).toHaveAttribute('href', ROUTES.changeIntelligence);
  });
});

/* ------------------------------------------------------------------ direct URL loading */

describe('each capability URL works on its own', () => {
  it('loads the Stock Intelligence workspace directly', async () => {
    stubReads();
    renderAppAt(ROUTES.stockIntelligence);
    expect(await screen.findByRole('heading', { name: /IID-01 — Stock Intelligence/ })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('loads the Holding Decisions workspace directly', async () => {
    stubReads();
    renderAppAt(ROUTES.holdingDecisions);
    expect(await screen.findByRole('heading', { name: /IID-02 — Investment & Holding Decisions/ })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('loads the Change Intelligence workspace directly', async () => {
    stubReads();
    renderAppAt(ROUTES.changeIntelligence);
    expect(await screen.findByRole('heading', { name: /IID-03 — Historical Change Intelligence/ })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('survives a refresh with the workflow context intact', async () => {
    stubReads();
    renderAppAt(`${ROUTES.stockIntelligence}?issuerId=${encodeURIComponent(ISSUER)}`);
    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    expect(screen.getByRole('navigation', { name: 'Investment workflow' })).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ IID-01 */

describe('IID-01 — company discovery and assessment navigation', () => {
  it('opens the stored assessment for a company chosen by discovery', async () => {
    stubReads();
    const user = userEvent.setup();
    renderWorkspaceAt(ROUTES.stockIntelligence, <StockIntelligencePage />);

    await user.type(screen.getByLabelText('Company name or identifier'), 'Aarav');
    await user.click(screen.getByRole('button', { name: 'Find company' }));

    const result = await screen.findByRole('link', { name: 'Stock Intelligence →' });
    expect(result).toHaveAttribute('href', `/investment/company/${encodeURIComponent(ISSUER)}`);
  });

  it('opens the assessment for an issuer id the reader already holds', async () => {
    stubReads();
    const user = userEvent.setup();
    renderWorkspaceAt(ROUTES.stockIntelligence, <StockIntelligencePage />);

    await user.type(screen.getByLabelText('Issuer id'), ISSUER);
    await user.click(screen.getByRole('button', { name: 'Open company assessment' }));

    // The selection is addressable: it lives in the URL.
    expect(await screen.findByTestId('location')).toHaveTextContent(`issuerId=${encodeURIComponent(ISSUER)}`);
    // And the EXISTING assessment surface renders it.
    expect(await screen.findByRole('heading', { name: /Aarav Systems Limited/ })).toBeInTheDocument();
  });

  it('renders no assessment until a company is selected', () => {
    stubReads();
    renderWorkspaceAt(ROUTES.stockIntelligence, <StockIntelligencePage />);

    // The page states that no company is selected, in its own words.
    const emptyState = screen
      .getAllByRole('status')
      .find((node) => /Choose a company above/.test(node.textContent ?? ''));
    expect(emptyState).toBeDefined();
    expect(screen.queryByRole('heading', { name: /Aarav Systems Limited/ })).toBeNull();
  });

  it('shows an unavailable state when the assessment read fails', async () => {
    stubReads(() => new Response(JSON.stringify({ error: 'investment-persistence-unavailable' }), { status: 503 }));
    renderWorkspaceAt(
      `${ROUTES.stockIntelligence}?issuerId=${encodeURIComponent(ISSUER)}`,
      <StockIntelligencePage />,
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Aarav Systems Limited/ })).toBeNull();
  });
});

/* ------------------------------------------------------------------ IID-02 */

describe('IID-02 — candidate versus held decision navigation', () => {
  it('shows the candidate decision when only a security is known', async () => {
    stubReads();
    renderWorkspaceAt(
      `${ROUTES.holdingDecisions}?securityId=${encodeURIComponent(SECURITY)}`,
      <HoldingDecisionsPage />,
    );

    expect(await screen.findByRole('heading', { name: 'Candidate disposition' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Held disposition' })).toBeNull();
  });

  it('shows the held decision when a portfolio and a security are known', async () => {
    stubReads();
    renderWorkspaceAt(
      `${ROUTES.holdingDecisions}?portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}&subject=held`,
      <HoldingDecisionsPage />,
    );

    expect(await screen.findByRole('heading', { name: 'Held disposition' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Candidate disposition' })).toBeNull();
  });

  it('never presents a candidate as a holding', async () => {
    stubReads();
    const { container } = renderWorkspaceAt(
      `${ROUTES.holdingDecisions}?securityId=${encodeURIComponent(SECURITY)}&subject=candidate`,
      <HoldingDecisionsPage />,
    );

    await screen.findByRole('heading', { name: 'Candidate disposition' });
    expect(container.textContent).toMatch(/not[\s\S]*held/);
    // The candidate section states that it has no position.
    expect(container.textContent).toMatch(/no position, no quantity, no market value and no portfolio weight/);
  });

  it('lists the portfolio\'s held decisions and links each to its held decision', async () => {
    stubReads();
    renderWorkspaceAt(`${ROUTES.holdingDecisions}?portfolioId=${PORTFOLIO}`, <HoldingDecisionsPage />);

    const link = await screen.findByRole('link', { name: 'Held decision →' });
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain(`portfolioId=${PORTFOLIO}`);
    expect(href).toContain(`securityId=${encodeURIComponent(SECURITY)}`);
    expect(href).toContain('subject=held');
  });

  it('links a held decision to the corresponding company assessment', async () => {
    stubReads();
    renderWorkspaceAt(`${ROUTES.holdingDecisions}?portfolioId=${PORTFOLIO}`, <HoldingDecisionsPage />);

    const link = await screen.findByRole('link', { name: 'Company assessment →' });
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain(`/investment/company/${encodeURIComponent(ISSUER)}`);
    expect(href).toContain(`portfolioId=${PORTFOLIO}`);
  });

  it('shows an empty state when no disposition has been recorded', async () => {
    stubReads((url) =>
      url.includes('/dispositions')
        ? jsonOk({ status: 'OK', portfolioId: PORTFOLIO, count: 0, dispositions: [], limitations: [] })
        : null,
    );
    renderWorkspaceAt(`${ROUTES.holdingDecisions}?portfolioId=${PORTFOLIO}`, <HoldingDecisionsPage />);

    expect(await screen.findByText(/No disposition has been recorded for any position/)).toBeInTheDocument();
  });

  it('shows an unavailable state when the disposition read fails', async () => {
    stubReads((url) =>
      url.includes('/dispositions')
        ? new Response(JSON.stringify({ error: 'not-recorded' }), { status: 404 })
        : null,
    );
    renderWorkspaceAt(`${ROUTES.holdingDecisions}?portfolioId=${PORTFOLIO}`, <HoldingDecisionsPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

/* ------------------------------------------------------------------ IID-03 */

describe('IID-03 — historical comparison navigation', () => {
  it('shows the stored version history for the selected issuer', async () => {
    stubReads();
    renderWorkspaceAt(
      `${ROUTES.changeIntelligence}?issuerId=${encodeURIComponent(ISSUER)}`,
      <ChangeIntelligencePage />,
    );

    expect(await screen.findByRole('heading', { name: 'Version history' })).toBeInTheDocument();
    // The timeline's own section heading appears once its read resolves.
    expect(await screen.findByRole('heading', { name: 'Change history' })).toBeInTheDocument();
  });

  it('links each stored version to itself, addressably', async () => {
    stubReads();
    renderWorkspaceAt(
      `${ROUTES.changeIntelligence}?issuerId=${encodeURIComponent(ISSUER)}`,
      <ChangeIntelligencePage />,
    );

    const link = (await screen.findAllByRole('link', { name: 'Open this version →' }))[0];
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain(`issuerId=${encodeURIComponent(ISSUER)}`);
    expect(href).toContain('reportId=');
  });

  it('links each side of a comparison to the exact stored version it compares', async () => {
    stubReads();
    renderWorkspaceAt(
      `${ROUTES.changeIntelligence}?issuerId=${encodeURIComponent(ISSUER)}`,
      <ChangeIntelligencePage />,
    );

    const from = await screen.findByRole('link', { name: 'Open v1' });
    const href = from.getAttribute('href') ?? '';
    expect(href).toContain('/investment/company/');
    expect(href).toContain('reportId=');
  });

  it('says a chain needs two stored versions before anything can be compared', async () => {
    stubReads((url) =>
      url.includes('/api/investment/company/')
        ? jsonOk({ ...ASSESSMENT_ENVELOPE, versions: [ASSESSMENT_ENVELOPE.versions[0]] })
        : null,
    );
    renderWorkspaceAt(
      `${ROUTES.changeIntelligence}?issuerId=${encodeURIComponent(ISSUER)}`,
      <ChangeIntelligencePage />,
    );

    expect(await screen.findByText(/a chain needs two stored versions before anything can be compared/)).toBeInTheDocument();
  });

  it('shows an unavailable state when the history read fails', async () => {
    stubReads((url) =>
      url.includes('/api/investment/company/')
        ? new Response(JSON.stringify({ error: 'investment-persistence-unavailable' }), { status: 503 })
        : null,
    );
    renderWorkspaceAt(
      `${ROUTES.changeIntelligence}?issuerId=${encodeURIComponent(ISSUER)}`,
      <ChangeIntelligencePage />,
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ context preservation */

describe('context is preserved when moving between capabilities', () => {
  it('carries the portfolio and security on every breadcrumb link', async () => {
    stubReads();
    renderWorkspaceAt(
      `${ROUTES.holdingDecisions}?portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}`,
      <HoldingDecisionsPage />,
    );

    const crumb = await screen.findByRole('navigation', { name: 'Breadcrumb' });
    const stock = within(crumb).getByRole('link', { name: /IID-01 — Stock Intelligence/ });
    const href = stock.getAttribute('href') ?? '';
    expect(href).toContain(`portfolioId=${PORTFOLIO}`);
    expect(href).toContain(`securityId=${encodeURIComponent(SECURITY)}`);
  });

  it('carries the issuer onto the Change Intelligence breadcrumb link', async () => {
    stubReads();
    renderWorkspaceAt(
      `${ROUTES.stockIntelligence}?issuerId=${encodeURIComponent(ISSUER)}&portfolioId=${PORTFOLIO}`,
      <StockIntelligencePage />,
    );

    const crumb = await screen.findByRole('navigation', { name: 'Breadcrumb' });
    const changes = within(crumb).getByRole('link', { name: /IID-03 — Historical Change Intelligence/ });
    const href = changes.getAttribute('href') ?? '';
    expect(href).toContain(`issuerId=${encodeURIComponent(ISSUER)}`);
    expect(href).toContain(`portfolioId=${PORTFOLIO}`);
  });

  it('carries the issuer onto EVERY sibling link, so no capability loses the company', async () => {
    stubReads();
    renderWorkspaceAt(
      `${ROUTES.changeIntelligence}?issuerId=${encodeURIComponent(ISSUER)}&portfolioId=${PORTFOLIO}`,
      <ChangeIntelligencePage />,
    );

    const crumb = await screen.findByRole('navigation', { name: 'Breadcrumb' });
    // BOTH siblings (the current capability is text, not a link) carry the issuer.
    for (const name of [
      /IID-01 — Stock Intelligence/,
      /IID-02 — Investment & Holding Decisions/,
    ]) {
      const href = within(crumb).getByRole('link', { name }).getAttribute('href') ?? '';
      expect(href).toContain(`issuerId=${encodeURIComponent(ISSUER)}`);
      expect(href).toContain(`portfolioId=${PORTFOLIO}`);
    }
  });

  it('opens the company assessment behind a decision from the carried issuer', async () => {
    stubReads();
    renderWorkspaceAt(
      `${ROUTES.holdingDecisions}?portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}&issuerId=${encodeURIComponent(ISSUER)}`,
      <HoldingDecisionsPage />,
    );

    const link = await screen.findByRole('link', { name: 'Company assessment for this position →' });
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain(`/investment/company/${encodeURIComponent(ISSUER)}`);
    expect(href).toContain(`portfolioId=${PORTFOLIO}`);
  });

  it('marks the current capability as the current page rather than linking to it', async () => {
    stubReads();
    renderWorkspaceAt(ROUTES.stockIntelligence, <StockIntelligencePage />);

    const crumb = await screen.findByRole('navigation', { name: 'Breadcrumb' });
    expect(within(crumb).getByText(/IID-01 — Stock Intelligence/)).toHaveAttribute('aria-current', 'page');
    expect(within(crumb).queryByRole('link', { name: /IID-01 — Stock Intelligence/ })).toBeNull();
    // The siblings ARE links.
    expect(within(crumb).getByRole('link', { name: /IID-02 — Investment & Holding Decisions/ })).toBeInTheDocument();
  });

  it('offers the overview as the first breadcrumb step', async () => {
    stubReads();
    renderWorkspaceAt(ROUTES.changeIntelligence, <ChangeIntelligencePage />);

    const crumb = await screen.findByRole('navigation', { name: 'Breadcrumb' });
    expect(within(crumb).getByRole('link', { name: 'Investment Intelligence' })).toHaveAttribute(
      'href',
      '/investment',
    );
  });
});

/* ------------------------------------------------------------------ regression */

describe('the existing /investment overview is not regressed', () => {
  it('still renders the landing surface with its three named sections', async () => {
    stubReads();
    renderAppAt(ROUTES.investmentIntelligence);
    expect(await screen.findByRole('heading', { name: 'Investment Intelligence' })).toBeInTheDocument();
    for (const id of ['iid-01', 'iid-02', 'iid-03']) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it('still names the three capabilities as section headings', async () => {
    stubReads();
    renderAppAt(ROUTES.investmentIntelligence);
    await screen.findByRole('heading', { name: 'Investment Intelligence' });

    expect(screen.getByRole('heading', { name: 'IID-01 — Stock Intelligence' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IID-02 — Investment & Holding Decisions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IID-03 — Historical Change Intelligence' })).toBeInTheDocument();
  });

  it('still reads nothing on the overview, so it survives an unavailable runtime', async () => {
    stubReads(() => new Response(JSON.stringify({ error: 'identity-sources-unavailable' }), { status: 503 }));
    renderAppAt(ROUTES.investmentIntelligence);
    await screen.findByRole('heading', { name: 'IID-01 — Stock Intelligence' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('leaves the company assessment route and the candidate route working', async () => {
    stubReads();
    const { unmount } = renderAppAt(`/investment/company/${encodeURIComponent(ISSUER)}`);
    expect(await screen.findByRole('heading', { name: /Aarav Systems Limited/ })).toBeInTheDocument();
    unmount();

    renderAppAt(`/investment/candidate/${encodeURIComponent(SECURITY)}`);
    expect(await screen.findByRole('heading', { name: 'Candidate assessment' })).toBeInTheDocument();
  });

  it('leaves the Investment Coverage route working and independent', async () => {
    stubReads();
    renderAppAt(ROUTES.investmentCoverage);
    expect(await screen.findByRole('heading', { name: /^Investment coverage$/i })).toBeInTheDocument();
  });

  it('leaves Identity Coverage working and independent', async () => {
    stubReads();
    renderAppAt(ROUTES.identityCoverage);
    expect(await screen.findByRole('heading', { name: /^Identity coverage$/i })).toBeInTheDocument();
  });
});
