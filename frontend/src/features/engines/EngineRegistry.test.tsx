/**
 * IIPS v3.0 — E2E-026 Engine UI Integration — Engine Registry tests
 * Verifies: loading → success (governed registry) → error, never fabricates
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EngineRegistry } from './EngineRegistry';
import type { EngineListData } from '../../api/engines';

const REGISTRY: EngineListData = {
  apiVersion: '1.0',
  engines: [
    { engineId: 'sector.banking', ies: 'IES-006', iesTitle: 'Banking Sector Engine', sectorFamily: 'Banking', engineVersion: '1.0.0', secVersion: '1.0', semcVersion: '1.0', calibrationProfile: 'banking-calibration-1.0.0', calibrationVersion: '1.0.0', capabilities: ['metrics','scoring','calibration','decision','evidence'] },
    { engineId: 'sector.technology', ies: 'IES-015', iesTitle: 'Technology Sector Engine', sectorFamily: 'Technology', engineVersion: '1.0.0', secVersion: '1.0', semcVersion: '1.0', calibrationProfile: 'technology-calibration-1.0.0', calibrationVersion: '1.0.0', capabilities: ['metrics','scoring','calibration','decision','evidence','ontology'] },
  ],
  provenance: { certifiedCount: 2, source: 'Program v1.1 LTS — 2 frozen sector engines', freshness: 'FROZEN', runtimeConfig: { clock: 'fixed', idProvider: 'deterministic' } },
};

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('Engine Registry (E2E-026)', () => {
  it('renders governed engine registry (no fabrication)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => REGISTRY }) as never;
    render(<MemoryRouter><EngineRegistry /></MemoryRouter>);
    expect(await screen.findByText('Certified Engine Registry')).toBeInTheDocument();
    expect(screen.getByText('sector.banking')).toBeInTheDocument();
    expect(screen.getByText('IES-006')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByTestId('badge-certified')).toHaveTextContent('CERTIFIED RESULT');
    expect(screen.getByTestId('freshness-snapshot')).toHaveTextContent('SNAPSHOT');
    expect(screen.getByTestId('engine-registry-provenance')).toHaveTextContent('deterministic');
  });

  it('renders provenance + API version', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => REGISTRY }) as never;
    render(<MemoryRouter><EngineRegistry /></MemoryRouter>);
    await screen.findByText('Certified Engine Registry');
    expect(screen.getByText(/API 1\.0/)).toBeInTheDocument();
    expect(screen.getByText(/2 engines/)).toBeInTheDocument();
  });

  it('renders links to certified company intelligence', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => REGISTRY }) as never;
    render(<MemoryRouter><EngineRegistry /></MemoryRouter>);
    await screen.findByText('Certified Engine Registry');
    expect(screen.getByRole('link', { name: /Banking →/ })).toHaveAttribute('href', '/research/company/Banking');
  });

  it('renders error state on failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('down')) as never;
    render(<MemoryRouter><EngineRegistry /></MemoryRouter>);
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load engine registry');
  });
});
