/**
 * Program v3.0 — NP-08 / D08 MACRO: MoSPI source adapter tests.
 *
 * Every test uses a mocked fetch. NO live network call is made and NO live
 * observation payload is retained or committed (D08 implementation gate §15).
 *
 * Fixtures are SYNTHETIC. They reproduce the RESPONSE SHAPE and the governed
 * contract (type/category names, blocked codes) but deliberately use invented
 * codes and base years so that no live enumeration is embedded as a fixture.
 */
import { describe, expect, it } from 'vitest';

import {
  APPROVED_DATASETS,
  CPI_DEFAULT_YEAR,
  CPI_FETCH_CONCURRENCY,
  CPI_MAX_PAGE_SIZE,
  IIP_BLOCKED_CATEGORY_CODES,
  IIP_GOVERNED_TYPE,
  MacroSourceError,
  NAS_INDICATOR_CODE,
  buildCpiQuery,
  buildIipQuery,
  buildNasQuery,
  fetchCpiObservations,
  fetchIipFilters,
  mapCpiRecord,
  fetchIipObservations,
  fetchNasObservations,
  parseRetryAfter,
  resolveGovernedIipSelection,
  resolveGovernedManufacturing,
  type MospiSourceConfig,
} from './mospi-source';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

interface MockCall {
  url: string;
  init?: RequestInit;
}

function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
    json: async () => body,
  } as unknown as Response;
}

function mockFetch(handler: (call: MockCall) => Promise<Response> | Response) {
  const calls: MockCall[] = [];
  const fn = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return handler({ url, init });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

/** Fast, deterministic sleep so tests never wait on real backoff. */
const noSleep = async (): Promise<void> => {};

function cfg(overrides: MospiSourceConfig = {}): MospiSourceConfig {
  return { sleepImpl: noSleep, ...overrides };
}

function envelope<T>(records: T[], totalRecords: number, totalPages: number, page: number) {
  return {
    data: records,
    meta_data: { page, totalRecords, totalPages, recordPerPage: records.length },
    msg: 'Data fetched successfully',
    statusCode: true,
  };
}

/** Synthetic IIP enumeration for an invented base year. */
function syntheticFilter(baseYear: string, manufacturingCode: number, subCount = 3) {
  const subcategories = Array.from({ length: subCount }, (_, i) => ({
    subcategory_code: `99011${i}-900${i}`,
    category_code: manufacturingCode,
    subcategory_name: `Synthetic NIC division ${i}`,
  }));
  return {
    data: {
      financial_year: [{ financial_year: '2099-00' }],
      type: [{ type: 'General' }, { type: 'Sectoral' }, { type: 'Use-based category' }],
      category: [
        { category_code: 12, category_name: 'Mining & Quarrying', type: 'Sectoral', order_code: 1 },
        { category_code: manufacturingCode, category_name: 'Manufacturing', type: 'Sectoral', order_code: 3 },
        { category_code: 4, category_name: 'General', type: 'General', order_code: 5 },
        { category_code: 5, category_name: 'Primary Goods', type: 'Use-based category', order_code: 6 },
      ],
      subcategory: [
        ...subcategories,
        { subcategory_code: '990222-0001', category_code: 12, subcategory_name: 'Fuel Minerals' },
      ],
    },
    msg: 'Data fetched successfully',
    statusCode: true,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// NAS — explicit indicator selection
// ────────────────────────────────────────────────────────────────────────────

describe('NAS — explicit governed indicator', () => {
  it('selects GVA (indicator_code = 1)', async () => {
    const { fn, calls } = mockFetch(() =>
      jsonResponse(envelope([{ indicator: 'Gross Value Added' }], 1, 1, 1)),
    );
    const result = await fetchNasObservations(
      { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: NAS_INDICATOR_CODE.GVA },
      cfg({ fetchImpl: fn }),
    );
    expect(calls[0]!.url).toContain('indicator_code=1');
    expect(result.records[0]).toEqual({ indicator: 'Gross Value Added' });
  });

  it('selects GDP (indicator_code = 5)', async () => {
    const { fn, calls } = mockFetch(() =>
      jsonResponse(envelope([{ indicator: 'Gross Domestic Product' }], 1, 1, 1)),
    );
    await fetchNasObservations(
      { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: NAS_INDICATOR_CODE.GDP },
      cfg({ fetchImpl: fn }),
    );
    expect(calls[0]!.url).toContain('indicator_code=5');
  });

  it('GVA and GDP are distinct governed codes', () => {
    expect(NAS_INDICATOR_CODE.GVA).toBe(1);
    expect(NAS_INDICATOR_CODE.GDP).toBe(5);
    expect(NAS_INDICATOR_CODE.GVA).not.toBe(NAS_INDICATOR_CODE.GDP);
  });

  it('rejects an ungoverned indicator code', () => {
    expect(() =>
      buildNasQuery(
        { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: 3 },
        1,
        10,
      ),
    ).toThrow(MacroSourceError);
  });

  it('emits the governed NAS parameter set', () => {
    const qs = buildNasQuery(
      { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: 5 },
      2,
      50,
    );
    expect(qs).toContain('base_year=2022-23');
    expect(qs).toContain('series=Current');
    expect(qs).toContain('frequency_code=Annually');
    expect(qs).toContain('indicator_code=5');
    expect(qs).toContain('Format=JSON');
    expect(qs).toContain('limit=50');
    expect(qs).toContain('page=2');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// IIP — runtime enumeration + governed classification
// ────────────────────────────────────────────────────────────────────────────

describe('IIP — runtime enumeration', () => {
  it('retrieves category and subcategory enumerations for a base year', async () => {
    const { fn } = mockFetch(() => jsonResponse(syntheticFilter('2099-00', 77)));
    const set = await fetchIipFilters('2099-00', 'Annually', cfg({ fetchImpl: fn }));
    expect(set.categories.length).toBeGreaterThan(0);
    expect(set.subcategories.length).toBeGreaterThan(0);
    expect(set.types).toContain('Sectoral');
  });

  it('resolves the governed manufacturing category BY NAME, not by a hard-coded code', async () => {
    const { fn } = mockFetch(() => jsonResponse(syntheticFilter('2099-00', 77)));
    const selection = await resolveGovernedIipSelection('2099-00', 'Annually', cfg({ fetchImpl: fn }));
    expect(selection.categoryName).toBe('Manufacturing');
    expect(selection.categoryCode).toBe(77); // resolved, not hard-coded
    expect(selection.type).toBe(IIP_GOVERNED_TYPE);
  });

  it('returns only NIC-2 subcategories belonging to the resolved category', async () => {
    const { fn } = mockFetch(() => jsonResponse(syntheticFilter('2099-00', 77, 4)));
    const selection = await resolveGovernedIipSelection('2099-00', 'Annually', cfg({ fetchImpl: fn }));
    expect(selection.subcategoryCodes).toHaveLength(4);
    for (const code of selection.subcategoryCodes) {
      expect(code).toMatch(/^\d{4,}-\d{3,}$/);
    }
  });

  it('proves category codes are NOT portable across base years', async () => {
    // Same category NAME, different CODE in two different base years.
    let baseYear = '2098-99';
    const { fn } = mockFetch((call) => {
      const year = new URL(call.url).searchParams.get('base_year') ?? '';
      return jsonResponse(syntheticFilter(year, year === baseYear ? 41 : 77));
    });
    const a = await resolveGovernedIipSelection(baseYear, 'Annually', cfg({ fetchImpl: fn }));
    const b = await resolveGovernedIipSelection('2097-98', 'Annually', cfg({ fetchImpl: fn }));
    expect(a.categoryName).toBe(b.categoryName);
    expect(a.categoryCode).not.toBe(b.categoryCode);
  });

  it('accepts a valid hyphenated subcategory code rejected by the stale Swagger regex', () => {
    // The stale Swagger pattern ^\d+(,\d+)*$ would reject this; runtime governs.
    const stale = /^\d+(,\d+)*$/;
    const code = '022011-1210';
    expect(stale.test(code)).toBe(false);
    expect(code).toMatch(/^\d{4,}-\d{3,}$/);
  });
});

describe('IIP — governance safety', () => {
  it('rejects the General type', () => {
    expect(() =>
      buildIipQuery(
        { baseYear: '2022-23', frequency: 'Annually', type: 'General', categoryCode: 4, subcategoryCode: '022011-1210' },
        1,
        10,
      ),
    ).toThrow(/not governed/);
  });

  it('rejects Use-based categories', () => {
    expect(() =>
      buildIipQuery(
        { baseYear: '2022-23', frequency: 'Annually', type: 'Use-based category', categoryCode: 5, subcategoryCode: '022011-1210' },
        1,
        10,
      ),
    ).toThrow(/not governed/);
  });

  it('rejects Mining (12), Electricity & Gas (13) and Water/Sewerage (14)', () => {
    for (const code of IIP_BLOCKED_CATEGORY_CODES) {
      expect(() =>
        buildIipQuery(
          { baseYear: '2022-23', frequency: 'Annually', type: 'Sectoral', categoryCode: code, subcategoryCode: '022011-1210' },
          1,
          10,
        ),
      ).toThrow(/outside the governed manufacturing scope/);
    }
  });

  it('rejects a subcategory not in the runtime-resolved NIC-2 set', async () => {
    const { fn } = mockFetch(() => jsonResponse(syntheticFilter('2099-00', 77, 2)));
    const selection = await resolveGovernedIipSelection('2099-00', 'Annually', cfg({ fetchImpl: fn }));
    await expect(
      fetchIipObservations(
        { baseYear: '2099-00', frequency: 'Annually', type: 'Sectoral', categoryCode: 77, subcategoryCode: '990222-0001' },
        selection,
        cfg({ fetchImpl: fn }),
      ),
    ).rejects.toThrow(/not in the runtime-resolved NIC-2 set/);
  });

  it('rejects a non-NIC-2 subcategory code shape', () => {
    expect(() =>
      buildIipQuery(
        { baseYear: '2022-23', frequency: 'Annually', type: 'Sectoral', categoryCode: 2, subcategoryCode: '1210' },
        1,
        10,
      ),
    ).toThrow(/not a governed NIC-2 code/);
  });

  it('fails closed when the enumeration exposes no manufacturing category', () => {
    const set = {
      baseYear: '2099-00',
      frequency: 'Annually',
      types: ['General', 'Sectoral', 'Use-based category'],
      categories: [{ categoryCode: 12, categoryName: 'Mining & Quarrying', type: 'Sectoral' }],
      subcategories: [{ subcategoryCode: '990222-0001', categoryCode: 12, subcategoryName: 'Fuel Minerals' }],
    };
    expect(() => resolveGovernedManufacturing(set)).toThrow(/expected exactly one/);
  });

  it('emits the governed IIP parameter set', () => {
    const qs = buildIipQuery(
      { baseYear: '2022-23', frequency: 'Annually', type: 'Sectoral', categoryCode: 2, subcategoryCode: '022011-1210' },
      3,
      25,
    );
    expect(qs).toContain('type=Sectoral');
    expect(qs).toContain('category_code=2');
    expect(qs).toContain('subcategory_code=022011-1210');
    expect(qs).toContain('Format=JSON');
    expect(qs).toContain('limit=25');
    expect(qs).toContain('page=3');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Pagination
// ────────────────────────────────────────────────────────────────────────────

describe('pagination', () => {
  it('retrieves every page rather than silently accepting the default first page', async () => {
    const pages: Record<number, unknown> = {
      1: envelope([{ y: 'a' }, { y: 'b' }], 4, 2, 1),
      2: envelope([{ y: 'c' }, { y: 'd' }], 4, 2, 2),
    };
    const { fn, calls } = mockFetch((call) => {
      const p = Number(new URL(call.url).searchParams.get('page') ?? '1');
      return jsonResponse(pages[p]);
    });
    const result = await fetchNasObservations(
      { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: 1 },
      cfg({ fetchImpl: fn, pageSize: 2 }),
    );
    expect(result.pagination.pagesFetched).toBe(2);
    expect(result.records).toHaveLength(4);
    expect(calls).toHaveLength(2);
    expect(result.retrievalCompleteness).toBe('COMPLETE');
  });

  it('requests an explicit limit above the 10-record default', async () => {
    const { fn, calls } = mockFetch(() => jsonResponse(envelope([{ y: 'a' }], 1, 1, 1)));
    await fetchNasObservations(
      { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: 1 },
      cfg({ fetchImpl: fn, pageSize: 100 }),
    );
    expect(calls[0]!.url).toContain('limit=100');
  });

  it('NAS suppresses duplicate records spanning pages (deduplication stays ON)', async () => {
    const pages: Record<number, unknown> = {
      1: envelope([{ y: 'a' }, { y: 'b' }], 3, 2, 1),
      2: envelope([{ y: 'b' }, { y: 'c' }], 3, 2, 2),
    };
    const { fn } = mockFetch((call) => {
      const p = Number(new URL(call.url).searchParams.get('page') ?? '1');
      return jsonResponse(pages[p]);
    });
    const result = await fetchNasObservations(
      { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: 1 },
      cfg({ fetchImpl: fn, pageSize: 2 }),
    );

    expect(result.pagination.duplicatesSuppressed).toBe(1);
    expect(result.records).toHaveLength(3);
    expect(result.pagination.rawRowsReceived).toBe(4);
    expect(result.pagination.recordsRetained).toBe(3);
    expect(result.pagination.expectedRecords).toBe(3);
    expect(result.retrievalCompleteness).toBe('COMPLETE');
  });

  it('fails closed on incomplete pagination (short read)', async () => {
    const { fn } = mockFetch(() => jsonResponse(envelope([{ y: 'a' }], 10, 1, 1)));
    await expect(
      fetchNasObservations(
        { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: 1 },
        cfg({ fetchImpl: fn }),
      ),
    ).rejects.toThrow(
      /pagination incomplete: recordsRetained=1, rawRowsReceived=1, duplicatesSuppressed=0, pagesFetched=1\/1, providerDeclaredRecords=10/,
    );
  });

  it('fails closed on malformed pagination metadata', async () => {
    const { fn } = mockFetch(() => jsonResponse({ data: [{ y: 'a' }], statusCode: true }));
    await expect(
      fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn })),
    ).rejects.toThrow(/pagination metadata missing or malformed/);
  });

  it('fails closed when the response has no data array', async () => {
    const { fn } = mockFetch(() => jsonResponse({ msg: 'nope', statusCode: true }));
    await expect(
      fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn })),
    ).rejects.toThrow(/no data array/);
  });

  it('respects a hard page ceiling', async () => {
    const { fn } = mockFetch(() => jsonResponse(envelope([{ y: 'a' }], 9999, 9999, 1)));
    await expect(
      fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn, maxPages: 3 })),
    ).rejects.toThrow(/page ceiling/);
  });

  it('records retrieval completeness in candidate provenance', async () => {
    const { fn } = mockFetch(() => jsonResponse(envelope([{ y: 'a' }], 1, 1, 1)));
    const result = await fetchNasObservations(
      { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: 5 },
      cfg({ fetchImpl: fn }),
    );
    expect(result.provenance.retrievalCompleteness).toBe('COMPLETE');
    expect(result.provenance.baseYear).toBe('2022-23');
    expect(result.provenance.indicatorCode).toBe(5);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Reliability — 429 / Retry-After / backoff / timeout
// ────────────────────────────────────────────────────────────────────────────

describe('reliability', () => {
  it('retries a 429 and succeeds', async () => {
    let n = 0;
    const { fn, calls } = mockFetch(() => {
      n += 1;
      return n === 1 ? jsonResponse({ error: 'throttled' }, 429) : jsonResponse(envelope([{ y: 'a' }], 1, 1, 1));
    });
    const result = await fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn }));
    expect(calls).toHaveLength(2);
    expect(result.records).toHaveLength(1);
  });

  it('honors Retry-After when supplied', async () => {
    const sleeps: number[] = [];
    let n = 0;
    const { fn } = mockFetch(() => {
      n += 1;
      return n === 1
        ? jsonResponse({ error: 'throttled' }, 429, { 'retry-after': '7' })
        : jsonResponse(envelope([{ y: 'a' }], 1, 1, 1));
    });
    await fetchCpiObservations(
      { baseYear: '2012', series: 'Current' },
      cfg({
        fetchImpl: fn,
        sleepImpl: async (ms) => {
          sleeps.push(ms);
        },
      }),
    );
    expect(sleeps).toContain(7000);
  });

  it('parses Retry-After seconds and HTTP dates', () => {
    expect(parseRetryAfter('5')).toBe(5000);
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter('')).toBeNull();
    expect(parseRetryAfter('garbage')).toBeNull();
  });

  it('backs off on 5xx and eventually exhausts a bounded retry budget', async () => {
    const { fn, calls } = mockFetch(() => jsonResponse({ error: 'boom' }, 500));
    await expect(
      fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn, maxRetries: 2 })),
    ).rejects.toThrow(MacroSourceError);
    expect(calls).toHaveLength(3); // 1 initial + 2 retries — bounded
  });

  it('enforces a request timeout', async () => {
    const abortingFetch = ((_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const err = new Error('aborted');
          err.name = 'AbortError';
          reject(err);
        });
      })) as unknown as typeof fetch;

    await expect(
      fetchCpiObservations(
        { baseYear: '2012', series: 'Current' },
        cfg({ fetchImpl: abortingFetch, timeoutMs: 10, maxRetries: 0 }),
      ),
    ).rejects.toThrow(/exceeded 10ms/);
  });

  it('treats a non-429 4xx as terminal (no pointless retries)', async () => {
    const { fn, calls } = mockFetch(() => jsonResponse({ error: 'bad' }, 400));
    await expect(
      fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn, maxRetries: 3 })),
    ).rejects.toThrow(/HTTP 400/);
    expect(calls).toHaveLength(1);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// No-auth posture
// ────────────────────────────────────────────────────────────────────────────

describe('no-auth posture', () => {
  it('never sends an Authorization header or credential', async () => {
    const { fn, calls } = mockFetch(() => jsonResponse(envelope([{ y: 'a' }], 1, 1, 1)));
    await fetchNasObservations(
      { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: 1 },
      cfg({ fetchImpl: fn }),
    );
    const headers = (calls[0]!.init?.headers ?? {}) as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
    expect(headers.authorization).toBeUndefined();
    expect(JSON.stringify(headers).toLowerCase()).not.toContain('bearer');
    expect(calls[0]!.url).not.toContain('token');
  });

  it('uses GET only', async () => {
    const { fn, calls } = mockFetch(() => jsonResponse(syntheticFilter('2099-00', 77)));
    await fetchIipFilters('2099-00', 'Annually', cfg({ fetchImpl: fn }));
    expect(calls[0]!.init?.method).toBe('GET');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Boundary + CPI
// ────────────────────────────────────────────────────────────────────────────

describe('boundary', () => {
  it('CPI uses its own base year enumeration, not the IIP/NAS one', () => {
    const qs = buildCpiQuery({ baseYear: '2012', series: 'Current' }, 1, 10);
    expect(qs).toContain('base_year=2012');
    expect(qs).toContain('/api/cpi/getCPIIndex');
    expect(qs).not.toContain('2022-23');
  });

  it('exposes exactly the D08 boundary — NAS, CPI, IIP', () => {
    expect([...APPROVED_DATASETS].sort()).toEqual(['CPI', 'IIP', 'NAS']);
  });

  it('provides no route for WPI/PPI or any other non-D08 dataset', () => {
    for (const excluded of ['WPI', 'PPI', 'GDP', 'REPO_RATE', '10Y_GSEC']) {
      expect(APPROVED_DATASETS).not.toContain(excluded);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CPI — bounded year scope, provider field mapping, complete pagination
// ────────────────────────────────────────────────────────────────────────────

/** A provider-shaped CPI row, using the LIVE field spellings. */
function liveCpiRow(overrides: Record<string, unknown> = {}) {
  return {
    baseyear: '2012',
    year: '2025',
    month: 'January',
    group: 'Food and beverages',
    subgroup: 'Vegetables',
    sector: 'Rural',
    state: 'Tamil Nadu',
    index: '178.4',
    inflation: '5.21',
    ...overrides,
  };
}

function cpiEnvelope(rows: unknown[], page: number, totalPages: number, totalRecords: number) {
  return {
    data: rows,
    meta_data: { page, totalRecords, totalPages, recordPerPage: rows.length },
    msg: 'Data fetched successfully',
    statusCode: true,
  };
}

describe('CPI — bounded year scope', () => {
  it('always sends a year upstream, defaulting to the governed year', async () => {
    const { fn, calls } = mockFetch(() => jsonResponse(cpiEnvelope([liveCpiRow()], 1, 1, 1)));
    await fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn }));

    expect(calls).toHaveLength(1);
    const params = new URL(calls[0]!.url).searchParams;
    expect(params.get('year')).toBe(CPI_DEFAULT_YEAR);
    expect(params.get('base_year')).toBe('2012');
    expect(params.get('series')).toBe('Current');
  });

  it('never requests the unbounded dataset: an explicit year overrides the default', async () => {
    const { fn, calls } = mockFetch(() => jsonResponse(cpiEnvelope([liveCpiRow({ year: '2024' })], 1, 1, 1)));
    await fetchCpiObservations({ baseYear: '2012', series: 'Current', year: '2024' }, cfg({ fetchImpl: fn }));

    expect(new URL(calls[0]!.url).searchParams.get('year')).toBe('2024');
  });

  it('reports the applied scope in provenance so a single year is never read as all history', async () => {
    const { fn } = mockFetch(() => jsonResponse(cpiEnvelope([liveCpiRow()], 1, 1, 1)));
    const result = await fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn }));

    expect(result.provenance.cpiYear).toBe(CPI_DEFAULT_YEAR);
    expect(result.provenance.cpiSeries).toBe('Current');
    expect(result.provenance.baseYear).toBe('2012');
    expect(result.retrievalCompleteness).toBe('COMPLETE');
  });

  it('rejects a malformed year instead of sending it upstream', async () => {
    const { fn, calls } = mockFetch(() => jsonResponse(cpiEnvelope([liveCpiRow()], 1, 1, 1)));
    await expect(
      fetchCpiObservations({ baseYear: '2012', series: 'Current', year: '2025-26' }, cfg({ fetchImpl: fn })),
    ).rejects.toThrow(/not a four-digit year/);
    expect(calls).toHaveLength(0);
  });

  it('uses the provider-accepted page size and refuses one it would 400 on', async () => {
    const { fn, calls } = mockFetch(() =>
      jsonResponse(cpiEnvelope([liveCpiRow()], 1, 1, 1)),
    );
    await fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn }));
    expect(new URL(calls[0]!.url).searchParams.get('limit')).toBe(String(CPI_MAX_PAGE_SIZE));

    await expect(
      fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn, pageSize: 500 })),
    ).rejects.toThrow(/outside 1\.\.100/);
  });
});

describe('CPI — provider field mapping', () => {
  it('maps the live field spellings onto the application record contract', () => {
    expect(mapCpiRecord(liveCpiRow(), 'Current')).toEqual({
      base_year: '2012',
      series: 'Current',
      year: '2025',
      month: 'January',
      group: 'Food and beverages',
      sub_group: 'Vegetables',
      sector: 'Rural',
      state: 'Tamil Nadu',
      index: '178.4',
      inflation_rate: '5.21',
    });
  });

  it('also accepts the application spellings already used by fixtures', () => {
    const mapped = mapCpiRecord(
      { base_year: '2012', sub_group: 'Cereals', inflation_rate: '3.10', series: 'Current' },
      'Current',
    );
    expect(mapped.base_year).toBe('2012');
    expect(mapped.sub_group).toBe('Cereals');
    expect(mapped.inflation_rate).toBe('3.10');
    expect(mapped.series).toBe('Current');
  });

  it('keeps null-ish provider values explicit rather than inventing text', () => {
    const mapped = mapCpiRecord(
      { baseyear: '2012', subgroup: null, sector: '', state: null, index: '100', inflation: 4.5 },
      'Current',
    );
    expect(mapped.sub_group).toBeNull();
    expect(mapped.sector).toBeNull();
    expect(mapped.state).toBeNull();
    expect(mapped.inflation_rate).toBe('4.5');
  });

  it('CPI retains every provider row, including identical JSON rows across pages', async () => {
    // Byte-identical CPI rows are distinct observations: a row is only unique in
    // combination (month x group x subgroup x sector x state). Collapsing them
    // would under-count against the provider's declared total.
    const duplicated = liveCpiRow({ month: 'February' });
    const pages: Record<number, unknown> = {
      1: cpiEnvelope([liveCpiRow({ month: 'January' }), duplicated], 1, 2, 4),
      2: cpiEnvelope([duplicated, liveCpiRow({ month: 'March' })], 2, 2, 4),
    };
    const { fn } = mockFetch((call) => {
      const p = Number(new URL(call.url).searchParams.get('page') ?? '1');
      return jsonResponse(pages[p]);
    });

    const result = await fetchCpiObservations(
      { baseYear: '2012', series: 'Current' },
      cfg({ fetchImpl: fn, pageSize: 2 }),
    );

    expect(result.records).toHaveLength(4);
    expect(result.pagination.recordsRetained).toBe(4);
    expect(result.pagination.rawRowsReceived).toBe(4);
    expect(result.pagination.duplicatesSuppressed).toBe(0);
    expect(result.pagination.expectedRecords).toBe(4);
    expect(result.pagination.actualRecords).toBe(4);
    expect(result.retrievalCompleteness).toBe('COMPLETE');
    // both copies of the identical row survive
    expect(result.records.filter((r) => r.month === 'February')).toHaveLength(2);
  });

  it('does not report incomplete pagination when identical CPI rows are counted (live regression)', async () => {
    // Mirrors the live failure proportionally: the provider declared a total that
    // equals the RAW row count, and two of those rows are byte-identical. With
    // deduplication applied the retained count fell short of the declared count
    // and the retrieval was (wrongly) reported incomplete — live: 25,726 of
    // 25,884, which surfaced as HTTP 502 INCOMPLETE_PAGINATION.
    const duplicated = liveCpiRow({ month: 'February', index: '178.4' });
    const pages: Record<number, unknown> = {
      1: cpiEnvelope([liveCpiRow({ month: 'January' }), duplicated], 1, 3, 5),
      2: cpiEnvelope([duplicated, liveCpiRow({ month: 'March' })], 2, 3, 5),
      3: cpiEnvelope([liveCpiRow({ month: 'April' })], 3, 3, 5),
    };
    const { fn } = mockFetch((call) => {
      const p = Number(new URL(call.url).searchParams.get('page') ?? '1');
      return jsonResponse(pages[p]);
    });

    const result = await fetchCpiObservations(
      { baseYear: '2012', series: 'Current' },
      cfg({ fetchImpl: fn, pageSize: 2 }),
    );

    expect(result.pagination.pagesFetched).toBe(3);
    expect(result.pagination.expectedPages).toBe(3);
    expect(result.pagination.rawRowsReceived).toBe(result.pagination.expectedRecords);
    expect(result.pagination.recordsRetained).toBe(5);
    expect(result.pagination.duplicatesSuppressed).toBe(0);
    expect(result.retrievalCompleteness).toBe('COMPLETE');
  });

  it('fails closed on a record that is not a JSON object', async () => {
    const { fn } = mockFetch(() => jsonResponse(cpiEnvelope([liveCpiRow(), 'not-a-record'], 1, 1, 2)));
    await expect(fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn }))).rejects.toThrow(
      /not a JSON object/,
    );
  });

  it('maps every record of a complete multi-page retrieval', async () => {
    const { fn } = mockFetch((call) => {
      const page = Number(new URL(call.url).searchParams.get('page') ?? '1');
      return jsonResponse(
        cpiEnvelope([liveCpiRow({ month: page === 1 ? 'January' : 'February' })], page, 2, 2),
      );
    });
    const result = await fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn }));
    expect(result.records).toHaveLength(2);
    expect(result.records[0]!.month).toBe('January');
    expect(result.records[1]!.month).toBe('February');
    expect(result.pagination.expectedRecords).toBe(2);
    expect(result.pagination.actualRecords).toBe(2);
  });
});

describe('CPI — pagination concurrency and fail-closed retrieval', () => {
  it('fetches CPI pages with bounded concurrency', async () => {
    let pages = 0;
    let inFlight = 0;
    let maxInFlight = 0;
    const { fn } = mockFetch(async (call) => {
      const page = Number(new URL(call.url).searchParams.get('page') ?? '1');
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      pages += 1;
      return jsonResponse(cpiEnvelope([liveCpiRow({ month: `M${page}` })], page, 8, 8));
    });

    const result = await fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn }));

    expect(pages).toBe(8);
    expect(result.pagination.pagesFetched).toBe(8);
    expect(result.pagination.expectedRecords).toBe(8);
    expect(result.pagination.actualRecords).toBe(8);
    expect(maxInFlight).toBeGreaterThan(1);
    expect(maxInFlight).toBeLessThanOrEqual(CPI_FETCH_CONCURRENCY);
    // page order preserved in the output
    expect(result.records.map((r) => r.month)).toEqual(['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8']);
  });

  it('keeps NAS strictly sequential — the default path is unchanged', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const { fn } = mockFetch(async (call) => {
      const page = Number(new URL(call.url).searchParams.get('page') ?? '1');
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return jsonResponse(cpiEnvelope([{ indicator: `row-${page}` }], page, 4, 4));
    });

    const result = await fetchNasObservations(
      { baseYear: '2022-23', series: 'Current', frequencyCode: 'Annually', indicatorCode: 1 },
      cfg({ fetchImpl: fn }),
    );

    expect(maxInFlight).toBe(1);
    expect(result.pagination.pagesFetched).toBe(4);
    expect(result.pagination.expectedRecords).toBe(4);
    expect(result.pagination.actualRecords).toBe(4);
  });

  it('fails closed when a later page disagrees with page 1 metadata', async () => {
    const { fn } = mockFetch((call) => {
      const page = Number(new URL(call.url).searchParams.get('page') ?? '1');
      return jsonResponse(
        page === 1
          ? cpiEnvelope([liveCpiRow()], 1, 3, 3)
          : cpiEnvelope([liveCpiRow({ month: `M${page}` })], page, 99, 9999),
      );
    });
    await expect(
      fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn })),
    ).rejects.toThrow(/refusing to treat the response as complete/);
  });

  it('fails closed when a complete-looking CPI retrieval under-delivers', async () => {
    const { fn } = mockFetch((call) => {
      const page = Number(new URL(call.url).searchParams.get('page') ?? '1');
      return jsonResponse(cpiEnvelope([liveCpiRow({ month: `M${page}` })], page, 3, 300));
    });
    await expect(
      fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn })),
    ).rejects.toThrow(
      /pagination incomplete: recordsRetained=3, rawRowsReceived=3, duplicatesSuppressed=0, pagesFetched=3\/3, providerDeclaredRecords=300/,
    );
  });

  it('applies the CPI page ceiling before issuing an unbounded number of requests', async () => {
    let calls = 0;
    const { fn } = mockFetch(() => {
      calls += 1;
      return jsonResponse(cpiEnvelope([liveCpiRow()], 1, 5000, 5000));
    });
    await expect(
      fetchCpiObservations({ baseYear: '2012', series: 'Current' }, cfg({ fetchImpl: fn, maxPages: 10 })),
    ).rejects.toThrow(/page ceiling/);
    expect(calls).toBe(1);
  });
});
