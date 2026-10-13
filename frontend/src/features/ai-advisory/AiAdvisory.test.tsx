/**
 * Program v3.0 — Phase 13.2: AI Explanation UI tests (mocked transport).
 * Verifies read-only non-authoritative advisory rendering; governed fields only; no fabrication;
 * UNAVAILABLE fields listed; no decision authority.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AiAdvisory, CERTIFIED_AI_ADVISORY_SECTORS } from './AiAdvisory';
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

  it('REG-08: exposes all 13 canonical sectors in the Engine result selector with exact option values, no omissions, no duplicates, and no invented identifiers', async () => {
    const expectedSectors = [
      'Banking',
      'Insurance',
      'Capital Markets',
      'Healthcare',
      'Hospitality',
      'Energy',
      'Utilities',
      'Consumer',
      'Industrials',
      'Technology',
      'Telecommunications',
      'Automobile',
      'Materials & Metals',
    ];

    expect([...CERTIFIED_AI_ADVISORY_SECTORS]).toEqual(expectedSectors);

    render(<MemoryRouter><AiAdvisory /></MemoryRouter>);
    const select = (await screen.findByLabelText('Engine result')) as HTMLSelectElement;
    const options = Array.from(select.querySelectorAll('option'));

    expect(options).toHaveLength(13);
    const values = options.map((o) => o.value);
    const labels = options.map((o) => o.textContent);

    expect(values).toEqual(expectedSectors);
    expect(labels).toEqual(expectedSectors);
    expect(new Set(values).size).toBe(13);

    for (const forbidden of ['IT', 'Chemicals', 'Realty', 'Real Estate']) {
      expect(values).not.toContain(forbidden);
    }
  });

  it('REG-08: fetches governed advisory using canonical sector identifiers for newly exposed sectors', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    render(<MemoryRouter><AiAdvisory /></MemoryRouter>);
    await screen.findByLabelText('Engine result');

    for (const sector of [
      'Insurance',
      'Capital Markets',
      'Healthcare',
      'Hospitality',
      'Telecommunications',
      'Automobile',
      'Materials & Metals',
    ]) {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ...DTO, engineResultId: sector, engineResultRef: `snap_${sector}` }),
      });

      const select = (await screen.findByLabelText('Engine result')) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: sector } });

      await waitFor(() => {
        expect(fetchMock).toHaveBeenLastCalledWith(
          `/api/ai-advisory/${encodeURIComponent(sector)}`,
          expect.objectContaining({ credentials: 'omit' }),
        );
      });
      expect(await screen.findByText(`snap_${sector}`)).toBeInTheDocument();
    }
  });
});
