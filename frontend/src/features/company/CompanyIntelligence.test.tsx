/**
 * Program v3.0 — Phase 7: Company Intelligence tests (isolated fixtures, not bundled).
 * Verifies: certified decision shown; pillars unavailable where not exposed (no fabrication);
 * input metrics + evidence + replay link present; error state.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CompanyIntelligence } from './CompanyIntelligence';
import type { CompanyData } from '../../api/company';

const WITH_PILLARS: CompanyData = {
  companyId: 'Technology-H1', sector: 'Technology',
  decision: { verdict: 'Buy', composite: 76.3, confidence: 0.8 },
  overrides: [], pillars: { quality: 85, growth: 75, risk: 60, profitability: 82, valuation: 60 },
  resolvedSubsegment: 'software-saas', resolvedArchetype: 'subscription', calibrationVersion: '1.0.0',
  inputs: [{ key: 'revenueGrowth', value: 22 }, { key: 'debtEbitda', value: 1.5 }],
  evidence: { evidenceId: 'ev_Tech', engineId: 'sector.technology', recommendation: 'Buy', compositeScore: 76.3 },
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

const NO_PILLARS: CompanyData = {
  companyId: 'Banking-H1', sector: 'Banking',
  decision: { verdict: 'Watch', composite: 47.1, confidence: null },
  overrides: [], pillars: null,
  resolvedSubsegment: null, resolvedArchetype: null, calibrationVersion: null,
  inputs: [{ key: 'BM-001', value: 0.55 }],
  evidence: { evidenceId: 'ev_Bank', engineId: 'sector.banking', recommendation: 'Watch', compositeScore: 47.1 },
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

function renderCompany(data: CompanyData, id = 'Technology') {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => data }) as never;
  return render(
    <MemoryRouter initialEntries={[`/research/company/${id}`]}>
      <Routes>
        <Route path="/research/company/:id" element={<CompanyIntelligence />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('Company Intelligence', () => {
  it('shows the certified decision for a company with pillars', async () => {
    renderCompany(WITH_PILLARS);
    expect(await screen.findByTestId('company-header')).toBeInTheDocument();
    expect(screen.getByTestId('decision-badge-Buy')).toHaveTextContent('Buy');
    expect(screen.getByTestId('company-composite')).toHaveTextContent('76.3');
    expect(screen.getByTestId('badge-certified')).toHaveTextContent('CERTIFIED RESULT');
  });

  it('shows pillar scores only when the engine exposes them', async () => {
    renderCompany(WITH_PILLARS);
    await screen.findByTestId('company-header');
    expect(screen.queryByTestId('pillars-unavailable')).not.toBeInTheDocument();
    expect(screen.getByText('Business Quality / Growth / Valuation / Risk')).toBeInTheDocument();
  });

  it('shows pillars-unavailable (no fabrication) when the engine does not expose them', async () => {
    renderCompany(NO_PILLARS);
    await screen.findByTestId('company-header');
    expect(screen.getByTestId('pillars-unavailable')).toHaveTextContent('not exposed');
    // Confidence null -> shown as unavailable, never fabricated.
    expect(screen.getByText('Confidence unavailable')).toBeInTheDocument();
  });

  it('renders certified input metrics (SNAPSHOT) as a table', async () => {
    renderCompany(WITH_PILLARS);
    await screen.findByTestId('company-header');
    expect(screen.getByText('Company Inputs (SNAPSHOT)')).toBeInTheDocument();
    expect(screen.getByText('revenueGrowth')).toBeInTheDocument();
  });

  it('renders evidence + replay entry point', async () => {
    renderCompany(WITH_PILLARS);
    await screen.findByTestId('company-header');
    expect(screen.getByTestId('company-evidence')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open replay/ })).toBeInTheDocument();
  });

  it('renders error state on failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('down')) as never;
    render(<MemoryRouter initialEntries={['/research/company/X']}><Routes><Route path="/research/company/:id" element={<CompanyIntelligence />} /></Routes></MemoryRouter>);
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load company data');
  });
});
