/** Application routing and single-user shell tests. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

const EXECUTIVE_FIXTURE = {
  portfolio: {
    portfolioId: 'PF-T', scenario: 'Balanced', holdings: 1, sectorExposure: { A: 100 },
    concentration: 100, diversificationScore: 50, avgConviction: 60, avgQuality: 70, avgRisk: 40,
  },
  diversification: { band: 'High', flags: [] },
  ranking: [], opportunity: [], correlation: { flags: [], concentrationSectors: [] },
  decisions: [{ sector: 'A', verdict: 'Buy', composite: 70, confidence: 0.8 }],
  provenance: {
    dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT',
    calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1',
  },
};

const AI_ADVISORY_FIXTURE = {
  adviceId: 'adv-snap_Technology',
  engineResultId: 'Technology',
  kind: 'explanation',
  text: 'Certified engine produced composite 76.3 → Buy. Advisory only.',
  grounded: true,
  nonAuthoritative: true,
  model: 'iips-advisor',
  modelVersion: '1.0.0',
  engineResultRef: 'snap_Technology',
  label: 'AI EXPLANATION ≠ CERTIFIED RESULT',
  freshness: 'SNAPSHOT',
  unavailable: ['timestamp', 'tenant', 'provider', 'confidence', 'citations', 'decision'],
};

const REPORT_ID = '11111111-1111-4111-8111-111111111111';

const REPORT_ARTIFACT_FIXTURE = {
  reportKey: 'a'.repeat(64),
  reportId: REPORT_ID,
  reportType: 'Portfolio Summary',
  portfolioId: 'P-100',
  scenario: 'Balanced',
  parameters: { horizon: '12m' },
  schemaVersion: 1,
  artifactVersion: 1,
  supersedesReportId: null,
  generatedAt: '2026-10-25T00:00:00.000Z',
  canonicalPayload: JSON.stringify({ scenario: 'Balanced', value: 100 }),
  ownership: { tenantId: 'irr-reports-personal', userId: 'owner-irr-reports-personal' },
  provenance: { engineOutputId: 'report-portfolio-summary-P-100' },
};

type FetchCall = { input: RequestInfo | URL; init?: RequestInit };
let requests: FetchCall[] = [];

beforeEach(() => {
  requests = [];
  globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ input, init });
    const url = String(input);
    const body = url.startsWith('/api/reports/context')
      ? {
          data: {
            surfaceName: 'NP-06',
            disposition: 'ESTABLISHED',
            tenantId: 'irr-reports-personal',
            ownerUserId: 'owner-irr-reports-personal',
          },
        }
      : url.includes('/supersession')
        ? { data: { current: REPORT_ARTIFACT_FIXTURE, history: [] } }
        : url.startsWith('/api/reports/artifacts/')
          ? { data: REPORT_ARTIFACT_FIXTURE }
          : url.startsWith('/api/reports/artifacts')
            ? { data: [REPORT_ARTIFACT_FIXTURE], nextCursor: null }
            : url.startsWith('/api/collaboration')
      ? {
          data: [],
          provenance: {
            dataSource: 'test', asOf: '2026-08-01T00:00:00.000Z',
            dataVersion: 'v1.1-replay-baseline', mode: 'SNAPSHOT', freshness: 'SNAPSHOT',
            authority: 'PLATFORM', transportSemantics: 'test',
          },
        }
      : url.startsWith('/api/ai-advisory/')
        ? AI_ADVISORY_FIXTURE
        : EXECUTIVE_FIXTURE;
    return Promise.resolve({ ok: true, status: 200, json: async () => body } as Response);
  }) as typeof fetch;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('Application Shell', () => {
  it('renders the brand without login, role, tenant, or identity controls', () => {
    renderAt('/executive');
    expect(screen.getByText('IIPS — Enterprise Investment Intelligence')).toBeInTheDocument();
    expect(screen.queryByText(/sign in|sign out|tenant:|role:/i)).not.toBeInTheDocument();
  });

  it('redirects / to /executive and fetches executive data without credentials', async () => {
    renderAt('/');
    expect(await screen.findByTestId('decision-list')).toBeInTheDocument();
    const executiveCall = requests.find(call => String(call.input) === '/api/executive');
    expect(executiveCall).toBeDefined();
    expect(new Headers(executiveCall?.init?.headers).has('authorization')).toBe(false);
  });

  it('shows roleless navigation for the available product surfaces', () => {
    renderAt('/executive');
    for (const name of [
      'Executive', 'Watchlists', 'Collaboration', 'User Portfolios', 'Settings',
      // IID WI-1 P1: the capability group and all three capabilities are global navigation entries.
      'Investment Intelligence',
      'IID-01 — Stock Intelligence',
      'IID-02 — Investment & Holding Decisions',
      'IID-03 — Historical Change Intelligence',
    ]) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
  });

  it('resolves the Collaboration route directly without a session provider', async () => {
    renderAt('/collaboration');
    expect(await screen.findByTestId('collaboration-surface')).toBeInTheDocument();
    expect(screen.queryByTestId('shell-permission-denied')).not.toBeInTheDocument();
  });

  it('renders available Research destinations and navigates to Cross-Sector', async () => {
    const user = userEvent.setup();
    renderAt('/executive');
    expect(screen.getByRole('link', { name: 'Cross-Sector' })).toHaveAttribute('href', '/research/cross-sector');
    expect(screen.getByRole('link', { name: 'Engines' })).toHaveAttribute('href', '/research/engines');
    await user.click(screen.getByRole('link', { name: 'Cross-Sector' }));
    expect(await screen.findByRole('heading', { name: 'Cross-Sector Intelligence' })).toBeInTheDocument();
  });

  it('renders the available Intelligence child destination', () => {
    renderAt('/executive');
    expect(screen.getByRole('link', { name: 'Decision Matrix' })).toHaveAttribute(
      'href', '/intelligence/decision-matrix',
    );
  });

  it('does not render parameterised or placeholder children as global links', () => {
    renderAt('/executive');
    // 'Sector' is no longer in this list: PKG-08 Row 4 now mounts a real Sector surface and
    // the sidebar entry points at the concrete default `/research/sector/Banking`.
    for (const name of ['Company', 'Holdings', 'Replay', 'Snapshots']) {
      expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
    }
    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toContain(':');
    }
  });

  it('opens AI Explanation directly and sends no authorization header', async () => {
    const user = userEvent.setup();
    renderAt('/executive');
    const link = screen.getByRole('link', { name: 'AI Explanation' });
    expect(link).toHaveAttribute('href', '/ai-advisory');
    await user.click(link);
    expect(await screen.findByText('AI EXPLANATION ≠ CERTIFIED RESULT')).toBeInTheDocument();
    expect(screen.getByTestId('ai-advice')).toBeInTheDocument();
    const aiCall = requests.find(call => String(call.input) === '/api/ai-advisory/Technology');
    expect(aiCall).toBeDefined();
    expect(new Headers(aiCall?.init?.headers).has('authorization')).toBe(false);
  });

  it('renders group-only parents as headings, never as links to an unbuilt surface', () => {
    renderAt('/executive');
    for (const label of ['Research', 'Intelligence']) {
      expect(screen.getByTestId(`nav-group-${label}`)).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: label })).not.toBeInTheDocument();
    }
  });

  it('resolves every clickable nav destination to a built surface (no nav click lands on "not yet built")', () => {
    const first = renderAt('/executive');
    const hrefs = [...new Set(
      screen.getAllByRole('link')
        .map(link => link.getAttribute('href') ?? '')
        .filter(href => href.startsWith('/') && !href.includes(':')),
    )];
    first.unmount();
    // The nav must still offer the implemented destinations; the set is asserted, not assumed.
    expect(hrefs.length).toBeGreaterThanOrEqual(10);
    for (const href of hrefs) {
      const view = renderAt(href);
      expect(screen.queryByTestId('shell-feature-unavailable'), `${href} landed on a placeholder`).not.toBeInTheDocument();
      view.unmount();
    }
  });

  it('does not mount an administration route or expose an administration surface', () => {
    renderAt('/admin');
    expect(screen.queryByTestId('administration-retired')).not.toBeInTheDocument();
    expect(screen.getByTestId('shell-feature-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('shell-permission-denied')).not.toBeInTheDocument();
  });

  it('uses the feature-unavailable placeholder for an unmatched route', () => {
    renderAt('/nonsense');
    expect(screen.getByTestId('shell-feature-unavailable')).toBeInTheDocument();
  });

  /**
   * CAP-02 Broker Import — the committed Stage 4 capability must be REACHABLE.
   *
   * The governed commit control (Save / Commit Holdings) and the AMEND-02 evidence actions
   * live on the Broker Import surface, mounted at `/user-portfolios/import`. `Broker
   * Holdings` mounts the SAME preview component in preview-only mode, which by design
   * renders no commit control at all, so a navigation entry for this surface is the only
   * way the running application can reach the capability.
   */
  it('exposes a navigation entry for the Broker Import surface that carries the commit control', () => {
    renderAt('/executive');
    const link = screen.getByRole('link', { name: 'Broker Import' });
    expect(link).toHaveAttribute('href', '/user-portfolios/import');
  });

  it('resolves /user-portfolios/import to the CAP-02 surface, never to a portfolio detail read', async () => {
    renderAt('/user-portfolios/import');
    expect(await screen.findByTestId('cap02-broker-import-surface')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Broker Statement Import' })).toBeInTheDocument();
    // The static route must win over `/user-portfolios/:portfolioId`; a portfolio detail
    // read would render its own back-link and no import surface.
    expect(screen.queryByText('← All user portfolios')).not.toBeInTheDocument();
    expect(screen.queryByTestId('shell-feature-unavailable')).not.toBeInTheDocument();
  });

  it('keeps the Broker Holdings route preview-only and points it at the commit-capable surface', async () => {
    renderAt('/broker-holdings');
    expect(await screen.findByText(/Preview only — not saved/)).toBeInTheDocument();
    // No commit control on the preview-only instance: the placement decision is preserved.
    expect(screen.queryByTestId('broker-commit')).not.toBeInTheDocument();
    const preview = screen.getByLabelText('Broker Holdings preview');
    expect(preview.querySelector('a[href="/user-portfolios/import"]')).not.toBeNull();
  });

  for (const [path, title, marker] of [
    ['/intelligence/opportunities', 'Opportunities', 'opportunities-framing'],
    ['/intelligence/risks', 'Risks', 'risks-framing'],
    ['/intelligence/rankings', 'Rankings', 'rankings-framing'],
  ]) {
    it(`opens the R3 ${title} deep link without credentials or a session`, async () => {
      renderAt(path);
      expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
      expect(screen.getByTestId(marker)).toBeInTheDocument();
      expect(screen.queryByTestId('shell-feature-unavailable')).not.toBeInTheDocument();
      const call = requests.find(c => String(c.input) === '/api/cross-sector');
      expect(call).toBeDefined();
      expect(call?.init?.credentials).toBe('omit');
      expect(new Headers(call?.init?.headers).has('authorization')).toBe(false);
      expect(requests.every(c => String(c.input) === '/api/cross-sector')).toBe(true);
    });

    it(`navigates to the R3 ${title} child without replacing the group-only parent`, async () => {
      const user = userEvent.setup();
      renderAt('/executive');
      await screen.findByTestId('decision-list');
      expect(screen.getByTestId('nav-group-Intelligence')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Intelligence' })).not.toBeInTheDocument();
      // Opportunities/Rankings also cross-link within views; on Executive this is the nav link.
      const link = screen.getByRole('link', { name: title });
      expect(link).toHaveAttribute('href', path);
      await user.click(link);
      expect(await screen.findByTestId(marker)).toBeInTheDocument();
    });
  }

  it('shows the Reports L1 entry between Evidence and Settings without credentials', () => {
    renderAt('/executive');
    const reports = screen.getByRole('link', { name: 'Reports' });
    expect(reports).toHaveAttribute('href', '/reports');
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs.indexOf('/reports')).toBeGreaterThan(hrefs.indexOf('/evidence'));
    expect(hrefs.indexOf('/reports')).toBeLessThan(hrefs.indexOf('/settings'));
  });

  it('resolves the /reports deep link credential-free and renders the governed list', async () => {
    renderAt('/reports');
    expect(await screen.findByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    expect(await screen.findByTestId('reports-head-table')).toBeInTheDocument();
    expect(screen.queryByTestId('shell-feature-unavailable')).not.toBeInTheDocument();
    expect(screen.queryByTestId('shell-permission-denied')).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain('irr-reports-personal');
    expect(document.body.textContent).not.toContain('owner-irr-reports-personal');
    const reportCalls = requests.filter((call) => String(call.input).startsWith('/api/reports/'));
    expect(reportCalls.length).toBeGreaterThan(0);
    for (const call of reportCalls) {
      expect(call.init?.credentials).toBe('omit');
      expect(new Headers(call.init?.headers).has('authorization')).toBe(false);
      expect(String(call.input)).not.toMatch(/tenantId|ownerUserId|companyId|runtimeCompanyId/);
    }
  });

  it('resolves the /reports/:reportId deep link credential-free with ordered disclosure', async () => {
    renderAt(`/reports/${REPORT_ID}`);
    expect(await screen.findByTestId('report-section-summary')).toBeInTheDocument();
    expect(screen.getByTestId('report-section-detail')).toBeInTheDocument();
    expect(screen.getByTestId('report-section-provenance')).toBeInTheDocument();
    expect(screen.getByTestId('report-section-reference')).toBeInTheDocument();
    expect(screen.queryByTestId('shell-feature-unavailable')).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain('irr-reports-personal');
    const detailCall = requests.find((call) => String(call.input) === `/api/reports/artifacts/${REPORT_ID}`);
    expect(detailCall).toBeDefined();
    expect(detailCall?.init?.credentials).toBe('omit');
    expect(new Headers(detailCall?.init?.headers).has('authorization')).toBe(false);
  });

});
