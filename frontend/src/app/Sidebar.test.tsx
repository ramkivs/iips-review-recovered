/**
 * Program v3.0 — Milestone N (+N+1): Sidebar honesty-badge tests.
 * Verifies status labels render outside the link (accessible name unchanged), child
 * entries render with their own honest labels, and role filtering is preserved.
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

describe('Sidebar — navigation honesty badges (top level)', () => {
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
});

describe('Sidebar — Milestone N+1 child rendering', () => {
  it('shows Future badges on future-only children', () => {
    renderSidebar('analyst');
    expect(screen.getByTestId('nav-status-Opportunities')).toHaveTextContent('Future');
    expect(screen.getByTestId('nav-status-Risks')).toHaveTextContent('Future');
    expect(screen.getByTestId('nav-status-Holdings')).toHaveTextContent('Future');
  });

  it('renders child links for implemented children', () => {
    renderSidebar('analyst');
    expect(screen.getByRole('link', { name: 'Decision Matrix' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cross-Sector' })).toBeInTheDocument();
  });

  it('N+7: the Company link resolves to the concrete /research/company/Banking route', () => {
    renderSidebar('analyst');
    const company = screen.getByRole('link', { name: 'Company' });
    expect(company).toHaveAttribute('href', '/research/company/Banking');
    expect(company.getAttribute('href')).not.toContain(':id');
  });

  it('does not render the dead snapshots entry', () => {
    renderSidebar('analyst');
    expect(screen.queryByRole('link', { name: 'Snapshots' })).not.toBeInTheDocument();
  });

  it('hides Administration and its children for non-admin roles', () => {
    renderSidebar('analyst');
    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Engines & Certification' })).not.toBeInTheDocument();
  });

  it('renders Administration children (the 8 real tabs) for admin, deep-linkable', () => {
    renderSidebar('admin');
    expect(screen.getByRole('link', { name: 'Administration' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Engines & Certification' })).toHaveAttribute('href', '/admin/engines');
    expect(screen.getByRole('link', { name: 'Platform Operations' })).toHaveAttribute('href', '/admin/platform');
    expect(screen.getByRole('link', { name: 'Migration / Workflow / Marketplace' })).toHaveAttribute('href', '/admin/operations');
  });
});
