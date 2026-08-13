/**
 * Program v3.0 — Phase 13.2: AI Explanation UI tests (mocked transport).
 * Verifies read-only non-authoritative advisory rendering; governed fields only; no fabrication;
 * UNAVAILABLE fields listed; no decision authority.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AiAdvisory } from './AiAdvisory';
import type { AiAdvisoryDto } from '../../api/aiAdvisory';

const DTO: AiAdvisoryDto = {
  adviceId: 'adv-snap_Technology',
  engineResultId: 'Technology',
  kind: 'explanation',
  text: 'The certified engine produced composite 76.3 → Buy. This is advisory only.',
  grounded: true,
  nonAuthoritative: true,
  model: 'iips-advisor',
  modelVersion: '1.0.0',
  engineResultRef: 'snap_Technology',
  label: 'AI EXPLANATION ≠ CERTIFIED RESULT',
  freshness: 'SNAPSHOT',
  unavailable: ['timestamp', 'tenant', 'provider', 'confidence', 'citations', 'decision'],
};

beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => DTO }) as never;
});

describe('AI Explanation (read-only, non-authoritative)', () => {
  it('renders the mandatory non-authoritative label and AI badge', async () => {
    render(<MemoryRouter><AiAdvisory /></MemoryRouter>);
    expect(await screen.findByText('AI EXPLANATION ≠ CERTIFIED RESULT')).toBeInTheDocument();
    expect(screen.getByText('AI EXPLANATION')).toBeInTheDocument();
  });

  it('renders governed advisory fields (kind, text, grounded, model/version)', async () => {
    render(<MemoryRouter><AiAdvisory /></MemoryRouter>);
    expect(await screen.findByText(/composite 76.3/)).toBeInTheDocument();
    expect(screen.getByText('explanation')).toBeInTheDocument();
    expect(screen.getByText('GROUNDED')).toBeInTheDocument();
    expect(screen.getByText(/iips-advisor · 1.0.0/)).toBeInTheDocument();
  });

  it('lists UNAVAILABLE fields and never fabricates confidence/decision', async () => {
    render(<MemoryRouter><AiAdvisory /></MemoryRouter>);
    expect(await screen.findByTestId('ai-unavailable')).toBeInTheDocument();
    expect(screen.getByText(/timestamp, tenant, provider, confidence, citations, decision/)).toBeInTheDocument();
    expect(screen.queryByText('Confidence')).not.toBeInTheDocument();
    expect(screen.queryByText(/BUY|SELL|HOLD/)).not.toBeInTheDocument();
  });

  it('renders error state on failure', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('down'));
    render(<MemoryRouter><AiAdvisory /></MemoryRouter>);
    expect(await screen.findByTestId('state-error')).toBeInTheDocument();
  });
});
