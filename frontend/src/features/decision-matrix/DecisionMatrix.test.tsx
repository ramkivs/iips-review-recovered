/**
 * Program v3.0 — Phase 9: Decision Matrix tests (isolated fixtures, not bundled).
 * Verifies presentational scatter of CERTIFIED axes only — no classification in React.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { DecisionMatrix } from './DecisionMatrix';
import type { DecisionMatrixData } from '../../api/decisionMatrix';

const FIXTURE: DecisionMatrixData = {
  matrixType: 'scatter',
  note: 'presentational scatter; no classification computed',
  companies: [
    { companyId: 'A-H1', sector: 'A', verdict: 'Buy', composite: 80, quality: 85, valuation: 60 },
    { companyId: 'B-H1', sector: 'B', verdict: 'Watch', composite: 40, quality: 30, valuation: 90 },
  ],
  universe: { avgConviction: 60, avgQuality: 57, holdings: 2 },
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }) as never;
});

describe('Decision Matrix', () => {
  it('renders universe overview and certified badge', async () => {
    render(<MemoryRouter><DecisionMatrix /></MemoryRouter>);
    expect(await screen.findByTestId('metric-group')).toBeInTheDocument();
    expect(screen.getByTestId('badge-certified')).toHaveTextContent('CERTIFIED RESULT');
  });

  it('positions certified matrix points (scatter, presentational)', async () => {
    render(<MemoryRouter><DecisionMatrix /></MemoryRouter>);
    expect(await screen.findByTestId('matrix-scatter')).toBeInTheDocument();
    expect(screen.getByTestId('matrix-point-A')).toBeInTheDocument();
    expect(screen.getByTestId('matrix-point-B')).toBeInTheDocument();
  });

  it('shows selected-company certified detail on click', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><DecisionMatrix /></MemoryRouter>);
    await screen.findByTestId('matrix-scatter');
    await user.click(screen.getByTestId('matrix-point-A'));
    expect(screen.getByTestId('matrix-selected')).toHaveTextContent('Buy');
    expect(screen.getByTestId('matrix-selected')).toHaveTextContent('Quality: 85');
    expect(screen.getByTestId('matrix-selected')).toHaveTextContent('Valuation: 60');
  });

  it('shows a hint before selection', async () => {
    render(<MemoryRouter><DecisionMatrix /></MemoryRouter>);
    expect(await screen.findByTestId('matrix-select-hint')).toHaveTextContent('Select a point');
  });

  it('does not compute quadrants/bands (note present, no classification)', async () => {
    render(<MemoryRouter><DecisionMatrix /></MemoryRouter>);
    expect(await screen.findByTestId('matrix-note')).toHaveTextContent('no classification computed');
  });

  it('renders error state on failure', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('down'));
    render(<MemoryRouter><DecisionMatrix /></MemoryRouter>);
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load decision matrix');
  });

  it('A4: scatter is a group of real buttons, not a role="img" wrapper', async () => {
    render(<MemoryRouter><DecisionMatrix /></MemoryRouter>);
    const scatter = await screen.findByTestId('matrix-scatter');
    expect(scatter.getAttribute('role')).toBe('group');
    expect(scatter.getAttribute('role')).not.toBe('img');
    expect(screen.getByRole('button', { name: /A, quality 85, valuation 60/ })).toBeInTheDocument();
  });
});
