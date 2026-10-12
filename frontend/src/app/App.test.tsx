/**
 * Program v3.0 — Phase 3: AppShell / routing / navigation tests.
 * Verifies: shell renders, navigation is role-aware, routes resolve, shell states render.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../core/session/SessionContext';
import { App } from './App';

const FIXTURE = {
  portfolio: { portfolioId: 'PF-T', scenario: 'Balanced', holdings: 1, sectorExposure: { A: 100 }, concentration: 100, diversificationScore: 50, avgConviction: 60, avgQuality: 70, avgRisk: 40 },
  diversification: { band: 'High', flags: [] },
  ranking: [], opportunity: [], correlation: { flags: [], concentrationSectors: [] },
  decisions: [{ sector: 'A', verdict: 'Buy', composite: 70, confidence: 0.8 }],
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

// Phase 12.1 Administration overview DTO (test-only fixture). The shell test seeds every
// surface it mounts with the payload that surface actually consumes, so no surface is fed a
// foreign shape (a foreign payload makes AdminOverview throw instead of rendering state).
const ADMIN_OVERVIEW_FIXTURE = {
  platform: {
    state: 'OPERATIONAL',
    nodesHealthy: 1,
    nodesTotal: 1,
    enginesRegistered: 13,
    enginesCertified: 13,
    liveDataQuality: null,
    recentAuditCount: 0,
  },
  provenance: {
    dataSource: 'fixture (test-only)',
    freshness: 'SNAPSHOT',
    authority: 'PLATFORM',
    transportSemantics: 'test',
  },
};

beforeEach(() => {
  // URL-aware stub: each mounted surface receives its own governed envelope — the executive
  // fixture for the executive surfaces, the authoritative (empty) UI10 envelope for
  // /collaboration, and the Phase 12.1 overview DTO for Administration.
  globalThis.fetch = vi.fn((url: string) => {
    const u = String(url);
    const body = u.startsWith('/api/collaboration')
      ? { data: [], provenance: { dataSource: 'test', asOf: '2026-08-01T00:00:00.000Z', dataVersion: 'v1.1-replay-baseline', mode: 'SNAPSHOT', freshness: 'SNAPSHOT', authority: 'PLATFORM', transportSemantics: 'test' } }
      : u.startsWith('/api/admin/overview')
        ? ADMIN_OVERVIEW_FIXTURE
        : FIXTURE;
    return Promise.resolve({ ok: true, status: 200, json: async () => body });
  }) as never;
});

function renderAt(path: string, role: 'viewer' | 'analyst' | 'admin' = 'analyst') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider session={{ userId: 'u1', tenantId: 'tenant-X', role, authenticated: true }}>
        <App />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('Application Shell', () => {
  it('renders the topbar with tenant and role', () => {
    renderAt('/executive');
    expect(screen.getByTestId('topbar-tenant')).toHaveTextContent('tenant-X');
    expect(screen.getByTestId('topbar-role')).toHaveTextContent('analyst');
  });

  it('redirects / to /executive (renders the Executive Dashboard)', async () => {
    renderAt('/');
    // / redirects to /executive which now renders the Executive Dashboard.
    expect(await screen.findByTestId('decision-list')).toBeInTheDocument();
  });

  it('renders a navigation link for a role-visible surface', () => {
    renderAt('/executive', 'analyst');
    expect(screen.getByRole('link', { name: 'Executive' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Watchlists' })).toBeInTheDocument();
    // NP-10 UI10 — Collaboration is a viewer-visible surface.
    expect(screen.getByRole('link', { name: 'Collaboration' })).toBeInTheDocument();
  });

  it('resolves the /collaboration route to the UI10 surface', async () => {
    renderAt('/collaboration', 'analyst');
    expect(await screen.findByTestId('collaboration-surface')).toBeInTheDocument();
    // The generic placeholder must NOT be rendered for an authorized route.
    expect(screen.queryByTestId('shell-not-authorized')).not.toBeInTheDocument();
  });

  it('renders the available Research child destinations and navigates to Cross-Sector', async () => {
    const user = userEvent.setup();
    renderAt('/executive', 'analyst');
    // Available children are discoverable from global navigation (previously unreachable by click).
    expect(screen.getByRole('link', { name: 'Cross-Sector' })).toHaveAttribute(
      'href',
      '/research/cross-sector',
    );
    expect(screen.getByRole('link', { name: 'Engines' })).toHaveAttribute(
      'href',
      '/research/engines',
    );
    // Child navigation reaches the implemented Cross-Sector workspace.
    await user.click(screen.getByRole('link', { name: 'Cross-Sector' }));
    expect(await screen.findByRole('heading', { name: 'Cross-Sector Intelligence' })).toBeInTheDocument();
  });

  it('renders the available Intelligence child destination', () => {
    renderAt('/executive', 'analyst');
    expect(screen.getByRole('link', { name: 'Decision Matrix' })).toHaveAttribute(
      'href',
      '/intelligence/decision-matrix',
    );
  });

  it('does not render parameterised or placeholder children as global links', () => {
    renderAt('/executive', 'analyst');
    // Parameterised destinations require a selection and are reached contextually.
    for (const name of ['Company', 'Sector', 'Holdings', 'Replay', 'Snapshots']) {
      expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
    }
    // No navigation href may carry an unsubstituted route parameter.
    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toContain(':');
    }
    // Administration sections stay owned by the Administration surface (its own tablist).
    for (const name of ['Users', 'Roles', 'Tenants', 'Audit']) {
      expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
    }
  });

  it('hides Administration for non-admin roles', () => {
    renderAt('/executive', 'analyst');
    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
  });

  it('shows the Administration surface for admin role (Phase 12.1)', () => {
    renderAt('/admin', 'admin');
    expect(screen.getByRole('link', { name: 'Administration' })).toBeInTheDocument();
    // Phase 12.1 wires the real read-only Administration surface, not the placeholder.
    expect(screen.queryByTestId('shell-not-authorized')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Administration' })).toBeInTheDocument();
  });

  it('renders the unknown-route placeholder for an unmatched route', () => {
    renderAt('/nonsense', 'analyst');
    expect(screen.getByTestId('shell-not-authorized')).toBeInTheDocument();
  });
});
