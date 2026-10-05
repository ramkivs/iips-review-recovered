/**
 * Program v3.0 — NP-08 / D08 MACRO: `/api/macro` route tests.
 *
 * Mocked upstream only — no live network call (D08 implementation gate §15).
 * Fixtures are synthetic; no live enumeration or observation is embedded.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, expect, it } from 'vitest';

import { handleMacroRequest } from './macro-transport';

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
