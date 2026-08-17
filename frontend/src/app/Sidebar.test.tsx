/**
 * Program v3.0 — Milestone N: Sidebar honesty-badge tests.
 * Verifies status labels render outside the link (accessible name unchanged) and only
 * for non-implemented surfaces.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../core/session/SessionContext';
import { Sidebar } from './Sidebar';

function renderSidebar(role: 'viewer' | 'analyst' | 'admin') {
  return render(
    <MemoryRouter>
      <SessionProvider session={{ userId: 'u', tenantId: 'tenant-A', role, authenticated: true }}>
        <Sidebar />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('Sidebar — navigation honesty badges', () => {
  it('keeps link accessible names unchanged (badge is outside the link)', () => {
    renderSidebar('analyst');
    expect(screen.getByRole('link', { name: 'Executive' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Research' })).toBeInTheDocument();
  });

  it('shows a Partial badge for partial surfaces only', () => {
    renderSidebar('analyst');
    expect(screen.getByTestId('nav-status-Research')).toHaveTextContent('Partial');
    expect(screen.getByTestId('nav-status-Intelligence')).toHaveTextContent('Partial');
    expect(screen.getByTestId('nav-status-Evidence')).toHaveTextContent('Partial');
  });

  it('shows no badge for implemented surfaces', () => {
    renderSidebar('analyst');
    expect(screen.queryByTestId('nav-status-Executive')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-status-Portfolio')).not.toBeInTheDocument();
  });

  it('still hides Administration for non-admin roles', () => {
    renderSidebar('analyst');
    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
  });

  it('shows Administration (implemented, no badge) for admin', () => {
    renderSidebar('admin');
    expect(screen.getByRole('link', { name: 'Administration' })).toBeInTheDocument();
    expect(screen.queryByTestId('nav-status-Administration')).not.toBeInTheDocument();
  });
});
