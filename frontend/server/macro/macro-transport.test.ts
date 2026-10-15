/**
 * Program v3.0 — NP-08 / D08 MACRO: `/api/macro` route tests.
 *
 * Mocked upstream only — no live network call (D08 implementation gate §15).
 * Fixtures are synthetic; no live enumeration or observation is embedded.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, expect, it } from 'vitest';

import { handleMacroRequest } from './macro-transport';
import { CPI_DEFAULT_YEAR } from './mospi-source';

interface FakeResponse extends ServerResponse {
  status: number;
  body: string;
}

function makeReq(url: string, method = 'GET'): IncomingMessage {
  return { url, method } as unknown as IncomingMessage;
}

function makeRes(): FakeResponse {
  const res = {
    status: 0,
    body: '',
    writeHead(status: number) {
      res.status = status;
      return res;
    },
    end(data?: string) {
      res.body = data ?? '';
      return res;
    },
  } as unknown as FakeResponse;
  return res;
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => body,
  } as unknown as Response;
}

function envelope(records: unknown[], totalRecords = records.length) {
  return {
    data: records,
    meta_data: { page: 1, totalRecords, totalPages: 1, recordPerPage: records.length },
    statusCode: true,
  };
}

const syntheticFilter = (manufacturingCode = 77) => ({
  data: {
    type: [{ type: 'General' }, { type: 'Sectoral' }, { type: 'Use-based category' }],
    category: [
      { category_code: 12, category_name: 'Mining & Quarrying', type: 'Sectoral' },
      { category_code: manufacturingCode, category_name: 'Manufacturing', type: 'Sectoral' },
    ],
    subcategory: [
      { subcategory_code: '990110-9000', category_code: manufacturingCode, subcategory_name: 'Synthetic A' },
      { subcategory_code: '990111-9001', category_code: manufacturingCode, subcategory_name: 'Synthetic B' },
    ],
  },
  statusCode: true,
});

const sleepOff = async (): Promise<void> => {};

// ────────────────────────────────────────────────────────────────────────────

describe('/api/macro — NAS', () => {
  it('serves GVA when indicatorCode=1', async () => {
    const fetchImpl = (async () => jsonResponse(envelope([{ indicator: 'Gross Value Added' }]))) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/nas?indicatorCode=1'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).records[0].indicator).toBe('Gross Value Added');
  });

  it('serves GDP when indicatorCode=5', async () => {
    const fetchImpl = (async () => jsonResponse(envelope([{ indicator: 'Gross Domestic Product' }]))) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/nas?indicatorCode=5'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).records[0].indicator).toBe('Gross Domestic Product');
  });

  it('accepts the symbolic form indicator=GDP', async () => {
    const fetchImpl = (async (url: string) => {
      expect(url).toContain('indicator_code=5');
      return jsonResponse(envelope([{ indicator: 'Gross Domestic Product' }]));
    }) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/nas?indicator=GDP'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });
    expect(res.status).toBe(200);
  });

  it('rejects a request with no explicit indicator', async () => {
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/nas'), res, {});
    expect(res.status).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/indicatorCode is required/);
  });

  it('rejects an ungoverned indicator code with 502 (fail-closed, no observations)', async () => {
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/nas?indicatorCode=3'), res, {
      config: { fetchImpl: (async () => jsonResponse(envelope([]))) as unknown as typeof fetch, sleepImpl: sleepOff },
    });
    expect(res.status).toBe(502);
    const body = JSON.parse(res.body);
    expect(body.code).toBe('INDICATOR_NOT_GOVERNED');
    expect(body.records).toBeUndefined();
  });
});

describe('/api/macro — IIP', () => {
  it('returns the runtime-resolved governed selection', async () => {
    const fetchImpl = (async () => jsonResponse(syntheticFilter())) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/iip?baseYear=2099-00'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.selection.type).toBe('Sectoral');
    expect(body.selection.categoryName).toBe('Manufacturing');
    expect(body.selection.categoryCode).toBe(77);
    expect(body.records).toEqual([]);
  });

  it('serves observations for a governed NIC-2 subcategory', async () => {
    const fetchImpl = (async (url: string) => {
      if (url.includes('getIipFilter')) return jsonResponse(syntheticFilter());
      return jsonResponse(envelope([{ sub_category: 'Synthetic A', index: '100.0' }]));
    }) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/iip?baseYear=2099-00&subcategoryCode=990110-9000'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).records).toHaveLength(1);
  });

  it('refuses a subcategory outside the runtime-resolved set', async () => {
    const fetchImpl = (async () => jsonResponse(syntheticFilter())) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/iip?baseYear=2099-00&subcategoryCode=990222-0001'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });
    expect(res.status).toBe(502);
    expect(JSON.parse(res.body).code).toBe('FILTER_CONTRACT_VIOLATION');
  });
});

describe('/api/macro — CPI', () => {
  it('serves CPI on its own base year enumeration', async () => {
    const fetchImpl = (async (url: string) => {
      expect(url).toContain('base_year=2012');
      return jsonResponse(envelope([{ index: '180.0' }]));
    }) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/cpi'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).records).toHaveLength(1);
  });

  it('scopes the default request to one governed year instead of the whole history', async () => {
    const urls: string[] = [];
    const fetchImpl = (async (url: string) => {
      urls.push(url);
      return jsonResponse(envelope([{ index: '180.0' }]));
    }) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/cpi'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });

    expect(res.status).toBe(200);
    expect(urls).toHaveLength(1);
    const params = new URL(urls[0]!).searchParams;
    expect(params.get('year')).toBe(CPI_DEFAULT_YEAR);
    expect(params.get('limit')).toBe('100');
    const body = JSON.parse(res.body);
    expect(body.provenance.cpiYear).toBe(CPI_DEFAULT_YEAR);
    expect(body.pagination.expectedRecords).toBe(body.pagination.actualRecords);
  });

  it('honours an explicit ?year= override', async () => {
    const urls: string[] = [];
    const fetchImpl = (async (url: string) => {
      urls.push(url);
      return jsonResponse(envelope([{ index: '180.0' }]));
    }) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/cpi?year=2024'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });

    expect(res.status).toBe(200);
    expect(new URL(urls[0]!).searchParams.get('year')).toBe('2024');
    expect(JSON.parse(res.body).provenance.cpiYear).toBe('2024');
  });

  it('400s a malformed year without calling the provider', async () => {
    let called = 0;
    const fetchImpl = (async () => {
      called += 1;
      return jsonResponse(envelope([{ index: '180.0' }]));
    }) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/cpi?year=2025-26'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });

    expect(res.status).toBe(400);
    expect(called).toBe(0);
  });

  it('retains identical CPI rows through the route instead of collapsing them', async () => {
    // The live defect: identical provider rows were collapsed, the retained count
    // fell short of the provider-declared count, and the route returned 502.
    const duplicated = {
      baseyear: '2012',
      year: '2025',
      month: 'February',
      group: 'Food and beverages',
      subgroup: 'Vegetables',
      sector: 'Rural',
      state: 'Tamil Nadu',
      index: '178.4',
      inflation: '5.21',
    };
    const fetchImpl = (async (url: string) => {
      const page = Number(new URL(url).searchParams.get('page') ?? '1');
      const rows = page === 1 ? [{ ...duplicated, month: 'January' }, duplicated] : [duplicated, { ...duplicated, month: 'March' }];
      return jsonResponse({
        data: rows,
        meta_data: { page, totalRecords: 4, totalPages: 2, recordPerPage: rows.length },
        statusCode: true,
      });
    }) as unknown as typeof fetch;

    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/cpi'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });

    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.records).toHaveLength(4);
    expect(body.pagination.recordsRetained).toBe(4);
    expect(body.pagination.rawRowsReceived).toBe(4);
    expect(body.pagination.duplicatesSuppressed).toBe(0);
    expect(body.pagination.expectedRecords).toBe(body.pagination.recordsRetained);
    expect(body.provenance.retrievalCompleteness).toBe('COMPLETE');
    expect(body.records.filter((r: { month: string }) => r.month === 'February')).toHaveLength(2);
  });

  it('leaves IIP retrieval sequential and free of the CPI year scope', async () => {
    const urls: string[] = [];
    let inFlight = 0;
    let maxInFlight = 0;
    const fetchImpl = (async (url: string) => {
      urls.push(url);
      if (url.includes('getIipFilter')) return jsonResponse(syntheticFilter());
      const page = Number(new URL(url).searchParams.get('page') ?? '1');
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return jsonResponse({
        data: [{ sub_category: `S${page}`, index: '100.0' }],
        meta_data: { page, totalRecords: 3, totalPages: 3, recordPerPage: 1 },
        statusCode: true,
      });
    }) as unknown as typeof fetch;

    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/iip?baseYear=2099-00&subcategoryCode=990110-9000'), res, {
      config: { fetchImpl, sleepImpl: sleepOff },
    });

    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.pagination.pagesFetched).toBe(3);
    expect(body.pagination.expectedRecords).toBe(body.pagination.actualRecords);
    expect(maxInFlight).toBe(1);
    // no CPI year scope on IIP: checked as a real query parameter, not a substring
    // (`base_year=…` would spuriously match a naive 'year=' search)
    const iipDataUrls = urls.filter((u) => u.includes('getIipData'));
    expect(iipDataUrls.length).toBeGreaterThan(0);
    for (const u of iipDataUrls) {
      expect(new URL(u).searchParams.has('year')).toBe(false);
    }
  });
});

describe('/api/macro — guarded read', () => {
  it('rejects non-GET methods', async () => {
    for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
      const res = makeRes();
      await handleMacroRequest(makeReq('/api/macro/nas?indicatorCode=1', method), res, {});
      expect(res.status).toBe(405);
    }
  });

  it('404s an unknown dataset', async () => {
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/wpi'), res, {});
    expect(res.status).toBe(404);
    expect(JSON.parse(res.body).approvedDatasets).toEqual(['NAS', 'CPI', 'IIP']);
  });

  it('404s a path that merely starts with an approved dataset', async () => {
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/nasEVIL?indicatorCode=1'), res, {});
    expect(res.status).toBe(404);
  });

  it('returns false for paths outside the macro namespace', async () => {
    const res = makeRes();
    const handled = await handleMacroRequest(makeReq('/api/company/Banking-H1'), res, {});
    expect(handled).toBe(false);
  });

  it('fails closed on upstream error — never returns observations', async () => {
    const fetchImpl = (async () => jsonResponse({ error: 'boom' }, 500)) as unknown as typeof fetch;
    const res = makeRes();
    await handleMacroRequest(makeReq('/api/macro/nas?indicatorCode=1'), res, {
      config: { fetchImpl, sleepImpl: sleepOff, maxRetries: 0 },
    });
    expect(res.status).toBe(502);
    const body = JSON.parse(res.body);
    expect(body.records).toBeUndefined();
    expect(body.error).toBe('macro upstream failure');
  });
});
