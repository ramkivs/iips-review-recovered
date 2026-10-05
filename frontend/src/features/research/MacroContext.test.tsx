/**
 * Program v3.0 — NP-08 / D08 MACRO: MacroContext tests.
 *
 * Uses injected fetchers — no network, no live payload (gate §15).
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type {
  CpiRequest,
  IipRequest,
  MacroIipResponse,
  MacroResponse,
  NasRequest,
} from '../../api/macro';
import type { CpiRecord, NasRecord } from '../../../server/macro/mospi-source.js';
import { MacroProvider, useMacro } from './MacroContext';

const nasEnvelope = (indicator: string): MacroResponse<NasRecord> => ({
  dataset: 'NAS',
  source: 'MoSPI',
  records: [{ indicator }],
  pagination: {
    pagesFetched: 1,
    expectedPages: 1,
    expectedRecords: 1,
    actualRecords: 1,
    duplicatesSuppressed: 0,
  },
  provenance: {
    baseYear: '2022-23',
    indicatorCode: indicator === 'Gross Domestic Product' ? 5 : 1,
    apiContractVersion: 'test',
    retrievalCompleteness: 'COMPLETE',
  },
});

const iipEnvelope: MacroIipResponse = {
  dataset: 'IIP',
  source: 'MoSPI',
  selection: {
    baseYear: '2022-23',
    frequency: 'Annually',
    type: 'Sectoral',
    categoryCode: 2,
    categoryName: 'Manufacturing',
    subcategoryCodes: ['022011-1210'],
  },
  records: [{ sub_category: 'Synthetic' }],
};

const cpiEnvelope: MacroResponse<CpiRecord> = {
  dataset: 'CPI',
  source: 'MoSPI',
  records: [{ index: '180.0' }],
  pagination: {
    pagesFetched: 1,
    expectedPages: 1,
    expectedRecords: 1,
    actualRecords: 1,
    duplicatesSuppressed: 0,
  },
  provenance: { baseYear: '2012', apiContractVersion: 'test', retrievalCompleteness: 'COMPLETE' },
};

// Stable request identities (defined once, outside render).
const GVA_REQUEST: NasRequest = { indicator: 'GVA' };
const GDP_REQUEST: NasRequest = { indicator: 'GDP' };
const IIP_REQUEST: IipRequest = { baseYear: '2022-23' };
const CPI_REQUEST: CpiRequest = { baseYear: '2012' };

function Probe() {
  const { nas, iip, cpi } = useMacro();
  return (
    <div>
      <span data-testid="nas">{nas.data?.records[0]?.indicator ?? nas.error ?? 'pending'}</span>
      <span data-testid="nas-indicator">{String(nas.data?.provenance.indicatorCode ?? '')}</span>
      <span data-testid="iip-category">{iip.data?.selection.categoryName ?? iip.error ?? 'pending'}</span>
      <span data-testid="cpi">{cpi.data?.records[0]?.index ?? cpi.error ?? 'pending'}</span>
    </div>
  );
}

describe('MacroContext', () => {
  it('exposes NAS GVA (indicator_code 1)', async () => {
    const fetchers = {
      nas: async () => nasEnvelope('Gross Value Added'),
    };
    render(
      <MacroProvider nasRequest={GVA_REQUEST} fetchers={fetchers}>
        <Probe />
      </MacroProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('nas')).toHaveTextContent('Gross Value Added'));
    expect(screen.getByTestId('nas-indicator')).toHaveTextContent('1');
  });

  it('exposes NAS GDP (indicator_code 5) — distinct from GVA', async () => {
    const fetchers = { nas: async () => nasEnvelope('Gross Domestic Product') };
    render(
      <MacroProvider nasRequest={GDP_REQUEST} fetchers={fetchers}>
        <Probe />
      </MacroProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('nas')).toHaveTextContent('Gross Domestic Product'),
    );
    expect(screen.getByTestId('nas-indicator')).toHaveTextContent('5');
  });

  it('exposes the runtime-resolved IIP governed category', async () => {
    const fetchers = { iip: async () => iipEnvelope };
    render(
      <MacroProvider iipRequest={IIP_REQUEST} fetchers={fetchers}>
        <Probe />
      </MacroProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('iip-category')).toHaveTextContent('Manufacturing'));
  });

  it('exposes CPI on its own base year', async () => {
    const fetchers = { cpi: async () => cpiEnvelope };
    render(
      <MacroProvider cpiRequest={CPI_REQUEST} fetchers={fetchers}>
        <Probe />
      </MacroProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('cpi')).toHaveTextContent('180.0'));
  });

  it('fails closed — a failed retrieval leaves data null and surfaces the error', async () => {
    const fetchers = {
      nas: async () => {
        throw new Error('macro transport returned 502');
      },
    };
    render(
      <MacroProvider nasRequest={GVA_REQUEST} fetchers={fetchers}>
        <Probe />
      </MacroProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('nas')).toHaveTextContent('macro transport returned 502'));
  });

  it('throws when used outside a provider', () => {
    // Suppress the expected React error boundary noise for this assertion.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/must be used within a MacroProvider/);
    spy.mockRestore();
  });
});
