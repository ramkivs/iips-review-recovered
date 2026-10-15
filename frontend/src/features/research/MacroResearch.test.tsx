/**
 * Macro Research surface — mounted-view tests for the CV-53 / D89 disclosure integration.
 *
 * These cover the acceptance criteria of
 * `CV-53-D89-MACRO-UI-DISCLOSURE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01` §6: the DT-1 label is
 * visible adjacent to the data on the mounted Macro view (DT-4), the dataset name and granularity
 * are shown (DT-2), the source block is distinct from any IIPS interpretation (DT-6), no
 * endorsement is implied and no MoSPI branding is used (DT-7), no provenance is invented (DT-8),
 * and no licensing or rights language appears (DT-12/DT-13). Upstream transport status reaches
 * the screen verbatim, and no dataset outside NAS / CPI / IIP is addressable.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { MacroResearch } from './MacroResearch';

/** Test-only fixtures standing in for the governed `/api/macro` envelope. */
const NAS_BODY = {
  dataset: 'NAS',
  source: 'MoSPI',
  records: [
    {
      base_year: '2011-12',
      series: 'Current Prices',
      year: '2023-24',
      indicator: 'GVA',
      current_price: '18587647',
      unit: '₹ lakh',
    },
  ],
  pagination: {
    pagesFetched: 1,
    expectedPages: 1,
    expectedRecords: 1,
    actualRecords: 1,
    duplicatesSuppressed: 0,
  },
  provenance: { apiContractVersion: 'test', retrievalCompleteness: 'COMPLETE' },
};

const CPI_BODY = {
  dataset: 'CPI',
  source: 'MoSPI',
  records: [
    {
      base_year: '2012',
      year: '2026',
      month: 'January',
      group: 'General',
      sub_group: 'Cereals and products',
      index: '192.5',
    },
  ],
  pagination: {
    pagesFetched: 1,
    expectedPages: 1,
    expectedRecords: 1,
    actualRecords: 1,
    duplicatesSuppressed: 0,
  },
  provenance: { apiContractVersion: 'test', retrievalCompleteness: 'COMPLETE' },
};

const IIP_BODY = {
  dataset: 'IIP',
  source: 'MoSPI',
  selection: {
    baseYear: '2011-12',
    frequency: 'Monthly',
    type: 'Sectoral',
    categoryCode: 20,
    categoryName: 'Manufacturing',
    subcategoryCodes: ['2100-01'],
  },
  records: [
    { base_year: '2011-12', year: '2025', sub_category: '2100-01', index: '118.4' },
  ],
};

type FetchCall = { input: RequestInfo | URL; init?: RequestInit };
let requests: FetchCall[] = [];

function macroResponse(url: string): { ok: boolean; status: number; json: () => Promise<unknown> } {
  const body = url.startsWith('/api/macro/nas')
    ? NAS_BODY
    : url.startsWith('/api/macro/cpi')
      ? CPI_BODY
      : IIP_BODY;
  return { ok: true, status: 200, json: async () => body };
}

function stubFetch(
  responder: (url: string) => { ok: boolean; status: number; json: () => Promise<unknown> },
) {
  globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ input, init });
    return Promise.resolve(responder(String(input)) as unknown as Response);
  }) as typeof fetch;
}

beforeEach(() => {
  requests = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('MacroResearch (CV-53 mounted D89 disclosure)', () => {
  it('is reachable at the authorized route with a Research nav child', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    expect(await screen.findByTestId('macro-research')).toBeInTheDocument();
  });

  it('renders the DT-1 provider/platform label in the same content area as each dataset (DT-4)', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    await screen.findByTestId('macro-observations-NAS');
    for (const dataset of ['NAS', 'CPI', 'IIP'] as const) {
      const panel = screen.getByTestId(`macro-panel-${dataset}`);
      const disclosure = within(panel).getByTestId('macro-source-disclosure');
      expect(within(disclosure).getByTestId('macro-provider').textContent).toContain(
        'Provider: Ministry of Statistics and Programme Implementation (MoSPI) · Data platform:',
      );
      // Adjacent to the data: the disclosure holds the observation table, not a footer/tooltip.
      expect(within(disclosure).getByTestId(`macro-observations-${dataset}`)).toBeInTheDocument();
    }
  });

  it('names each dataset and its granularity (DT-2)', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    await screen.findByTestId('macro-observations-NAS');
    expect(screen.getAllByTestId('macro-dataset')[0].textContent).toBe(
      'Dataset: National Accounts Statistics (NAS)',
    );
    expect(screen.getAllByTestId('macro-dataset')[1].textContent).toBe(
      'Dataset: Consumer Price Index (CPI), governed published Group/Subgroup index view',
    );
    expect(screen.getAllByTestId('macro-dataset')[2].textContent).toBe(
      'Dataset: Index of Industrial Production (IIP), NIC 2-digit level only',
    );
  });

  it('renders returned observations honestly, without inventing provenance (DT-8)', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    const table = await screen.findByTestId('macro-observations-NAS');
    expect(within(table).getByText('GVA')).toBeInTheDocument();
    expect(within(table).getByText('2023-24')).toBeInTheDocument();
    expect(screen.getByTestId('macro-observations-count-NAS').textContent).toBe(
      'Observations returned: 1',
    );
    // DT-8: nothing is invented beyond what the governed read returned.
    const text = screen.getByTestId('macro-research').textContent ?? '';
    expect(text).not.toMatch(/last evaluated|as of|retrieved at|freshness|licence|licensed/i);
  });

  it('requests only the governed datasets NAS / CPI / IIP', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    await screen.findByTestId('macro-observations-NAS');
    const paths = [...new Set(requests.map((call) => String(call.input).split('?')[0]))].sort();
    expect(paths).toEqual(['/api/macro/cpi', '/api/macro/iip', '/api/macro/nas']);
  });

  it('refuses the read to the screen verbatim when the transport fails (502/400 reach the screen)', async () => {
    stubFetch(() => ({ ok: false, status: 502, json: async () => ({}) }));
    render(<MacroResearch />);
    const refusal = await screen.findByTestId('macro-refusal-NAS');
    expect(refusal.textContent).toContain('macro transport returned 502');
    expect(refusal.textContent).toContain('no cached, partial or synthetic value is substituted');
    expect(screen.queryByTestId('macro-observations-NAS')).not.toBeInTheDocument();
  });

  it('surfaces transport error code and dataset on 502 while preserving the status prefix (V-C6)', async () => {
    stubFetch(() => ({
      ok: false,
      status: 502,
      json: async () => ({
        error: 'macro upstream failure',
        code: 'RETRY_BUDGET_EXHAUSTED',
        message: 'upstream unreachable',
        dataset: 'NAS',
      }),
    }));
    render(<MacroResearch />);
    const refusal = await screen.findByTestId('macro-refusal-NAS');
    expect(refusal.textContent).toContain('macro transport returned 502');
    expect(refusal.textContent).toContain('RETRY_BUDGET_EXHAUSTED');
    expect(refusal.textContent).toContain('upstream unreachable');
  });

  it('shows an honest empty state when the governed selection returns zero observations', async () => {
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ ...NAS_BODY, records: [] }) }));
    render(<MacroResearch />);
    expect(await screen.findByTestId('macro-empty-NAS')).toBeInTheDocument();
    expect(screen.getByTestId('macro-observations-count-NAS').textContent).toBe(
      'Observations returned: 0',
    );
  });

  it('refuses an unreadable response instead of synthesizing observations', async () => {
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ unexpected: 'shape' }) }));
    render(<MacroResearch />);
    const refusal = await screen.findByTestId('macro-refusal-NAS');
    expect(refusal.textContent).toContain('did not carry a readable observation set');
  });

  it('shows no licensing, rights or endorsement language and no MoSPI branding (DT-7, DT-12, DT-13)', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    await screen.findByTestId('macro-observations-NAS');
    const text = screen.getByTestId('macro-research').textContent ?? '';
    expect(text).not.toMatch(
      /licensed|open-licensed|public domain|commercial use|redistribution permitted|retention permitted|GODL|required by law/i,
    );
    expect(text).not.toMatch(/endors|approved by|certified by|sponsored by|partner of MoSPI/i);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('keeps source disclosure distinct from any IIPS-generated interpretation (DT-6)', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    await screen.findByTestId('macro-observations-NAS');
    // No interpretation block is rendered at all, so nothing derived can be read as a MoSPI finding.
    expect(screen.queryByTestId('macro-analysis')).not.toBeInTheDocument();
    for (const dataset of ['NAS', 'CPI', 'IIP'] as const) {
      const disclosure = within(screen.getByTestId(`macro-panel-${dataset}`)).getByTestId(
        'macro-source-disclosure',
      );
      expect(within(disclosure).getByTestId('macro-provider').textContent).not.toMatch(
        /trend|score|recommendation/i,
      );
    }
  });
});

describe('MacroResearch D91 §1 data-mode notice (V-C5)', () => {
  it('renders the exact approved notice wording once', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    await screen.findByTestId('macro-observations-NAS');
    const notice = screen.getByTestId('macro-data-mode-notice');
    expect(notice.textContent).toBe(
      'This page retrieves data live from MoSPI. No user setting switches this view to snapshot or point-in-time data. If live retrieval fails, the page reports the failure rather than substituting snapshot or synthetic data.',
    );
    expect(screen.getAllByTestId('macro-data-mode-notice')).toHaveLength(1);
  });

  it('is visible on /research/macro in the loaded state', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    expect(await screen.findByTestId('macro-data-mode-notice')).toBeInTheDocument();
  });

  it('remains visible in the refusal state and is not duplicated per panel', async () => {
    stubFetch(() => ({ ok: false, status: 502, json: async () => ({}) }));
    render(<MacroResearch />);
    await screen.findByTestId('macro-refusal-NAS');
    expect(screen.getByTestId('macro-data-mode-notice')).toBeInTheDocument();
    expect(screen.getAllByTestId('macro-data-mode-notice')).toHaveLength(1);
    for (const dataset of ['NAS', 'CPI', 'IIP'] as const) {
      const panel = screen.getByTestId(`macro-panel-${dataset}`);
      expect(within(panel).queryByTestId('macro-data-mode-notice')).not.toBeInTheDocument();
    }
  });

  it('is adjacent to the dataset panels (rendered before them, not inside any panel)', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    await screen.findByTestId('macro-observations-NAS');
    const notice = screen.getByTestId('macro-data-mode-notice');
    // relative order: notice before first dataset panel
    const nodes = Array.from(
      screen.getByTestId('macro-research').querySelectorAll(
        '[data-testid="macro-data-mode-notice"], [data-testid^="macro-panel-"]',
      ),
    );
    expect(nodes[0]).toBe(notice);
  });

  it('introduces no user-selectable LIVE/SNAPSHOT/PIT control or mode setting', async () => {
    stubFetch(macroResponse);
    render(<MacroResearch />);
    await screen.findByTestId('macro-observations-NAS');
    const text = screen.getByTestId('macro-research').textContent ?? '';
    expect(text).not.toMatch(/LIVE|SNAPSHOT|PIT/);
    // no form controls at all on the surface
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mode|snapshot|live|pit/i })).not.toBeInTheDocument();
  });
});
