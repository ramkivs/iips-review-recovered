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

type FetchCall = { input: RequestInfo | URL; init?: RequestInit };
let requests: FetchCall[] = [];

beforeEach(() => {
  requests = [];
  globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ input, init });
    const url = String(input);
    const body = url.startsWith('/api/collaboration')
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
    for (const name of ['Executive', 'Watchlists', 'Collaboration', 'User Portfolios', 'Settings']) {
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
    for (const name of ['Company', 'Sector', 'Holdings', 'Replay', 'Snapshots']) {
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
});
