/**
 * Program v3.0 — Phase 3: AppShell / routing / navigation tests.
 * Verifies: shell renders, navigation is role-aware, routes resolve, shell states render.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

beforeEach(() => {
  // URL-aware stub: the executive fixture for the executive surfaces, and the authoritative
  // (empty) UI10 envelope for /collaboration, so the shell test never feeds a surface a
  // payload that does not belong to it.
  globalThis.fetch = vi.fn((url: string) =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () =>
        String(url).startsWith('/api/collaboration')
          ? { data: [], provenance: { dataSource: 'test', asOf: '2026-08-01T00:00:00.000Z', dataVersion: 'v1.1-replay-baseline', mode: 'SNAPSHOT', freshness: 'SNAPSHOT', authority: 'PLATFORM', transportSemantics: 'test' } }
          : FIXTURE,
    })) as never;
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
