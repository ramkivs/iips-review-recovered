/**
 * Program v3.0 — N+5: Company Intelligence tests (three-call governed composition).
 *
 * Verifies the vertical slice: decision header + overrides + pillars + certified inputs +
 * inline governed Evidence chain + inline Replay result + provenance. No fabrication
 * (null confidence/pillars stay unavailable). Deterministic URL-aware fetch mocks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CompanyIntelligence } from './CompanyIntelligence';
import type { CompanyData } from '../../api/company';
import type { EvidenceData } from '../../api/evidence';
import type { ReplayData } from '../../api/replay';

const COMPANY_TECH: CompanyData = {
  companyId: 'Technology-H1', sector: 'Technology',
  decision: { verdict: 'Buy', composite: 76.3, confidence: 0.8 },
  overrides: [], pillars: { quality: 85, growth: 75, risk: 60, profitability: 82, valuation: 60 },
  resolvedSubsegment: 'software-saas', resolvedArchetype: 'subscription', calibrationVersion: '1.0.0',
  inputs: [{ key: 'revenueGrowth', value: 22 }, { key: 'debtEbitda', value: 1.5 }],
  evidence: { evidenceId: 'ev_Tech', engineId: 'sector.technology', recommendation: 'Buy', compositeScore: 76.3 },
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

const COMPANY_BANK: CompanyData = {
  companyId: 'Banking-H1', sector: 'Banking',
  decision: { verdict: 'Watch', composite: 47.1, confidence: null },
  overrides: [], pillars: null,
  resolvedSubsegment: null, resolvedArchetype: null, calibrationVersion: null,
  inputs: [{ key: 'BM-001', value: 0.55 }],
  evidence: { evidenceId: 'ev_Bank', engineId: 'sector.banking', recommendation: 'Watch', compositeScore: 47.1 },
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

function evidenceFor(sector: string, composite: number): EvidenceData {
  return {
    decision: { verdict: 'Buy', composite, confidence: 0.8 },
    evidence: {
      evidenceId: `ev_${sector}`, engineId: `sector.${sector.toLowerCase()}`, recommendation: 'Buy', compositeScore: composite,
      confidence: 0.55, keyMetrics: [],
      supportingScores: [{ id: 'asset-quality', name: 'Asset Quality', value: 62 }],
      calibrationVersion: '1.0.0', decisionRulesApplied: ['pillar-floor'], replayReference: `snap_${sector}`,
      provenance: { frameworkVersion: '1.0', engineVersion: '1.0.0', methodologyVersion: '1.0', snapshotId: `snap_${sector}` },
      generatedAt: '2026-08-01T00:00:00.000Z',
    },
    snapshot: { snapshotId: `snap_${sector}`, engineId: `sector.${sector.toLowerCase()}`, schemaVersion: '1.0', generatedAt: '2026-08-01T00:00:00.000Z', verdict: 'Buy', scores: {} },
    replay: { snapshotId: `snap_${sector}`, reproduced: true, byteIdentical: true, evidenceRefs: [`ev_${sector}`] },
    provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
  };
}

function replayFor(sector: string, byteIdentical: boolean): ReplayData {
  return {
    original: {
      snapshotId: `snap_${sector}`, engineId: `sector.${sector.toLowerCase()}`, schemaVersion: '1.0', calibrationVersion: '1.0.0',
      generatedAt: '2026-08-01T00:00:00.000Z', verdict: 'Buy', composite: 76.3, confidence: 0.8,
      provenance: { frameworkVersion: '1.0', engineVersion: '1.0.0', methodologyVersion: '1.0', snapshotId: `snap_${sector}` },
    },
    replay: { snapshotId: `snap_${sector}`, reproduced: true, byteIdentical, evidenceRefs: [`ev_${sector}`] },
    differenceAvailable: false,
    note: byteIdentical ? 'Replay reproduced successfully; byte-identical: MATCH' : 'Replay reproduced; outputs differ',
    evidenceRefs: [`ev_${sector}`],
    provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
  };
}

function renderCompany(company: CompanyData, id: string, byteIdentical = true) {
  globalThis.fetch = vi.fn((input: unknown) => {
    const url = String(input);
    if (url.includes('/api/company/')) return Promise.resolve({ ok: true, json: async () => company }) as never;
    if (url.includes('/api/evidence/')) return Promise.resolve({ ok: true, json: async () => evidenceFor(company.sector, company.decision.composite) }) as never;
    if (url.includes('/api/replay/')) return Promise.resolve({ ok: true, json: async () => replayFor(company.sector, byteIdentical) }) as never;
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) }) as never;
  }) as never;
  return render(
    <MemoryRouter initialEntries={[`/research/company/${id}`]}>
      <Routes>
        <Route path="/research/company/:id" element={<CompanyIntelligence />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('Company Intelligence — N+5 vertical slice', () => {
  it('keeps the decision header + certified badge intact', async () => {
    renderCompany(COMPANY_TECH, 'Technology');
    expect(await screen.findByTestId('company-header')).toBeInTheDocument();
    expect(screen.getByTestId('decision-badge-Buy')).toHaveTextContent('Buy');
    expect(screen.getByTestId('company-composite')).toHaveTextContent('76.3');
    expect(screen.getByTestId('badge-certified')).toHaveTextContent('CERTIFIED RESULT');
  });

  it('renders the inline governed Evidence payload (supporting metrics + evidence record + snapshot)', async () => {
    renderCompany(COMPANY_TECH, 'Technology');
    await screen.findByTestId('company-header');
    expect(screen.getByText('Evidence (governed)')).toBeInTheDocument();
    expect(screen.getByText('Asset Quality')).toBeInTheDocument();
    expect(screen.getByTestId('evidence-record-card')).toBeInTheDocument();
    expect(screen.getByText('Snapshot & Provenance')).toBeInTheDocument();
  });

  it('renders the inline governed Replay result (MATCH equivalence + refs)', async () => {
    renderCompany(COMPANY_TECH, 'Technology', true);
    await screen.findByTestId('company-header');
    expect(screen.getByText('Replay Verification (governed)')).toBeInTheDocument();
    expect(screen.getByTestId('company-replay-equivalence')).toHaveTextContent('MATCH — byte-identical');
    expect(screen.getByTestId('company-replay-refs')).toHaveTextContent('ev_Technology');
  });

  it('renders DIFFERENCE when the governed replay is not byte-identical', async () => {
    renderCompany(COMPANY_BANK, 'Banking', false);
    await screen.findByTestId('company-header');
    expect(screen.getByTestId('company-replay-equivalence')).toHaveTextContent('DIFFERENCE');
  });

  it('shows pillar scores only where the engine exposes them', async () => {
    renderCompany(COMPANY_TECH, 'Technology');
    await screen.findByTestId('company-header');
    expect(screen.queryByTestId('pillars-unavailable')).not.toBeInTheDocument();
    expect(screen.getByText('Business Quality / Growth / Valuation / Risk')).toBeInTheDocument();
  });

  it('shows pillars-unavailable and confidence-unavailable (no fabrication) for non-Technology', async () => {
    renderCompany(COMPANY_BANK, 'Banking');
    await screen.findByTestId('company-header');
    expect(screen.getByTestId('pillars-unavailable')).toHaveTextContent('not exposed');
    expect(screen.getByText('Confidence unavailable')).toBeInTheDocument();
  });

  it('renders certified input metrics (SNAPSHOT) table', async () => {
    renderCompany(COMPANY_TECH, 'Technology');
    await screen.findByTestId('company-header');
    expect(screen.getByText('Company Inputs (SNAPSHOT)')).toBeInTheDocument();
    expect(screen.getByText('revenueGrowth')).toBeInTheDocument();
  });

  it('provenance remains visible', async () => {
    renderCompany(COMPANY_TECH, 'Technology');
    await screen.findByTestId('company-header');
    expect(screen.getByTestId('company-provenance')).toBeInTheDocument();
  });

  it('renders error state when any governed call fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('down')) as never;
    render(
      <MemoryRouter initialEntries={['/research/company/X']}>
        <Routes><Route path="/research/company/:id" element={<CompanyIntelligence />} /></Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load company data');
  });

  it('N+7: requests the exact governed endpoints for the concrete Banking route', async () => {
    const called: string[] = [];
    globalThis.fetch = vi.fn((input: unknown) => {
      const url = String(input);
      called.push(url);
      if (url.includes('/api/company/')) return Promise.resolve({ ok: true, json: async () => COMPANY_BANK }) as never;
      if (url.includes('/api/evidence/')) return Promise.resolve({ ok: true, json: async () => evidenceFor('Banking', 47.1) }) as never;
      if (url.includes('/api/replay/')) return Promise.resolve({ ok: true, json: async () => replayFor('Banking', true) }) as never;
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) }) as never;
    }) as never;

    render(
      <MemoryRouter initialEntries={['/research/company/Banking']}>
        <Routes><Route path="/research/company/:id" element={<CompanyIntelligence />} /></Routes>
      </MemoryRouter>,
    );
    await screen.findByTestId('company-header');

    expect(called).toContain('/api/company/Banking');
    expect(called).toContain('/api/evidence/Banking');
    expect(called).toContain('/api/replay/Banking');
    expect(called).not.toContain('/api/company/%3Aid');
  });
});
