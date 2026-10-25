/**
 * NP-06 Reports — read-only API client tests (CV-51).
 *
 * Verifies credential-free GET construction through `noAuthFetch`, strict envelope
 * validation, partition-literal stripping before view models exist, prohibited-key
 * absence, and the closed sanitized failure vocabulary (raw `detail`/`reason` discarded).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ReportsApiError,
  fetchReportArtifact,
  fetchReportArtifacts,
  fetchReportSupersession,
  fetchReportsContext,
} from './reports';

const REPORT_ID = '11111111-1111-4111-8111-111111111111';
const REPORT_ID_V1 = '22222222-2222-4222-8222-222222222222';

function wireArtifact(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    reportKey: 'a'.repeat(64),
    reportId: REPORT_ID,
    reportType: 'Portfolio Summary',
    portfolioId: 'P-100',
    scenario: 'Balanced',
    parameters: { horizon: '12m' },
    schemaVersion: 1,
    artifactVersion: 1,
    supersedesReportId: null,
    generatedAt: '2026-10-25T00:00:00.000Z',
    canonicalPayload: JSON.stringify({ scenario: 'Balanced', value: 100 }),
    ownership: { tenantId: 'irr-reports-personal', userId: 'owner-irr-reports-personal' },
    provenance: { engineOutputId: 'report-portfolio-summary-P-100' },
    ...overrides,
  };
}

type FetchCall = { input: RequestInfo | URL; init?: RequestInit };
let calls: FetchCall[] = [];

function mockFetch(impl: (url: string) => { ok: boolean; status: number; body: unknown }) {
  calls = [];
  globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ input, init });
    const result = impl(String(input));
    return Promise.resolve({
      ok: result.ok,
      status: result.status,
      json: async () => result.body,
    } as Response);
  }) as typeof fetch;
}

function mockOk(body: unknown) {
  mockFetch(() => ({ ok: true, status: 200, body }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function catchError(promise: Promise<unknown>): Promise<ReportsApiError> {
  try {
    await promise;
  } catch (e) {
    expect(e).toBeInstanceOf(ReportsApiError);
    return e as ReportsApiError;
  }
  throw new Error('expected the call to reject');
}

describe('api/reports read-only client (CV-51)', () => {
  it('fetches context credential-free and strips partition literals from the view', async () => {
    mockOk({
      data: {
        surfaceName: 'NP-06',
        disposition: 'ESTABLISHED',
        tenantId: 'irr-reports-personal',
        ownerUserId: 'owner-irr-reports-personal',
      },
    });
    const view = await fetchReportsContext();
    expect(view).toEqual({ surfaceName: 'NP-06', disposition: 'ESTABLISHED', scope: 'ESTABLISHED_SINGLE_OWNER' });
    expect(JSON.stringify(view)).not.toContain('irr-reports-personal');
    expect(String(calls[0]?.input)).toBe('/api/reports/context');
    expect(calls[0]?.init?.credentials).toBe('omit');
    expect(calls[0]?.init?.method ?? 'GET').toBe('GET');
    expect(new Headers(calls[0]?.init?.headers).has('authorization')).toBe(false);
  });

  it('lists artifacts with only limit/cursor parameters and sanitized view models', async () => {
    mockOk({ data: [wireArtifact()], nextCursor: 'cursor-2' });
    const page = await fetchReportArtifacts({ limit: 25, cursor: 'cur sor&x' });
    expect(String(calls[0]?.input)).toBe('/api/reports/artifacts?limit=25&cursor=cur+sor%26x');
    expect(page.nextCursor).toBe('cursor-2');
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.reportId).toBe(REPORT_ID);
    expect(page.items[0]?.payload).toEqual({ scenario: 'Balanced', value: 100 });
    expect(JSON.stringify(page)).not.toContain('irr-reports-personal');
    expect(JSON.stringify(page)).not.toContain('owner-irr-reports-personal');
    expect(calls[0]?.init?.credentials).toBe('omit');
  });

  it('encodes the report identifier as a single path segment for detail reads', async () => {
    mockOk({ data: wireArtifact() });
    const view = await fetchReportArtifact('id/with space');
    expect(String(calls[0]?.input)).toBe('/api/reports/artifacts/id%2Fwith%20space');
    expect(view.reportType).toBe('Portfolio Summary');
  });

  it('fetches the supersession chain with current head and history', async () => {
    mockOk({
      data: {
        current: wireArtifact({ artifactVersion: 2, supersedesReportId: REPORT_ID_V1 }),
        history: [wireArtifact({ reportId: REPORT_ID_V1, reportKey: 'b'.repeat(64) })],
      },
    });
    const chain = await fetchReportSupersession(REPORT_ID);
    expect(String(calls[0]?.input)).toBe(`/api/reports/artifacts/${REPORT_ID}/supersession`);
    expect(chain.current.artifactVersion).toBe(2);
    expect(chain.history[0]?.reportId).toBe(REPORT_ID_V1);
    expect(JSON.stringify(chain)).not.toContain('irr-reports-personal');
  });

  it('rejects an empty report identifier without issuing a request', async () => {
    mockOk({ data: wireArtifact() });
    const err = await catchError(fetchReportArtifact(''));
    expect(err.kind).toBe('invalid-request');
    expect(calls).toHaveLength(0);
  });

  it('maps 503 owner-context-unavailable and discards the raw reason detail', async () => {
    mockFetch(() => ({
      ok: false,
      status: 503,
      body: { error: 'owner-context-unavailable', detail: { reason: '/var/secret/reports-owner.json' } },
    }));
    const err = await catchError(fetchReportArtifacts());
    expect(err.kind).toBe('owner-context-unavailable');
    expect(err.status).toBe(503);
    expect(err.message).not.toContain('/secret/');
    expect(err.message).not.toContain('reports-owner');
  });

  it('maps 503 persistence-unavailable and discards the raw SQLite reason', async () => {
    mockFetch(() => ({
      ok: false,
      status: 503,
      body: { error: 'persistence-unavailable', reason: 'SQLITE_CANTOPEN /secret/path/reports.db' },
    }));
    const err = await catchError(fetchReportArtifacts());
    expect(err.kind).toBe('persistence-unavailable');
    expect(err.message).not.toContain('SQLITE');
    expect(err.message).not.toContain('/secret/');
  });

  it('maps other 503 responses to service-unavailable', async () => {
    mockFetch(() => ({ ok: false, status: 503, body: { error: 'upstream-down' } }));
    const err = await catchError(fetchReportsContext());
    expect(err.kind).toBe('service-unavailable');
    expect(err.status).toBe(503);
  });

  it('maps 404 report-not-found indistinguishably', async () => {
    mockFetch(() => ({ ok: false, status: 404, body: { error: 'report-not-found' } }));
    const err = await catchError(fetchReportArtifact(REPORT_ID));
    expect(err.kind).toBe('not-found');
    expect(err.status).toBe(404);
  });

  it('maps 400 to invalid-request and 500 to transport-error without leaking detail', async () => {
    mockFetch(() => ({ ok: false, status: 400, body: { error: 'invalid-report-content' } }));
    expect((await catchError(fetchReportArtifact('report-bad'))).kind).toBe('invalid-request');

    mockFetch(() => ({
      ok: false,
      status: 500,
      body: { error: 'reports transport error', detail: 'Error: boom at /var/secret/stack.ts:1' },
    }));
    const err = await catchError(fetchReportArtifacts());
    expect(err.kind).toBe('transport-error');
    expect(err.message).not.toContain('/secret/');
    expect(err.message).not.toContain('boom');
  });

  it('maps network failure to network-unavailable with status 0', async () => {
    globalThis.fetch = vi.fn(() => Promise.reject(new TypeError('fetch failed'))) as typeof fetch;
    const err = await catchError(fetchReportArtifacts());
    expect(err.kind).toBe('network-unavailable');
    expect(err.status).toBe(0);
  });

  it('fails closed as invalid-envelope on malformed 200 envelopes', async () => {
    mockOk({ data: [{ reportId: REPORT_ID }] }); // incomplete artifact
    expect((await catchError(fetchReportArtifacts())).kind).toBe('invalid-envelope');

    mockOk({ unexpected: true });
    expect((await catchError(fetchReportArtifacts())).kind).toBe('invalid-envelope');

    mockOk({ data: wireArtifact({ canonicalPayload: '{not-json' }) });
    expect((await catchError(fetchReportArtifact(REPORT_ID))).kind).toBe('invalid-envelope');

    mockOk({ data: wireArtifact({ ownership: { tenantId: 'irr-reports-personal' } }) });
    expect((await catchError(fetchReportArtifact(REPORT_ID))).kind).toBe('invalid-envelope');
  });

  it('never transmits prohibited identity, tenant, carrier, or durable-identity fields', async () => {
    mockFetch((url) => {
      if (url.endsWith('/context')) {
        return {
          ok: true,
          status: 200,
          body: { data: { surfaceName: 'NP-06', disposition: 'ESTABLISHED', tenantId: 'x', ownerUserId: 'y' } },
        };
      }
      if (url.includes('/supersession')) {
        return { ok: true, status: 200, body: { data: { current: wireArtifact(), history: [] } } };
      }
      if (url.includes('/artifacts/')) return { ok: true, status: 200, body: { data: wireArtifact() } };
      return { ok: true, status: 200, body: { data: [wireArtifact()], nextCursor: null } };
    });
    await fetchReportsContext();
    await fetchReportArtifacts({ limit: 10, cursor: 'opaque' });
    await fetchReportArtifact(REPORT_ID);
    await fetchReportSupersession(REPORT_ID);
    expect(calls).toHaveLength(4);
    for (const call of calls) {
      const url = String(call.input);
      expect(url).not.toMatch(/tenantId|tenant|userId|ownerUserId|authenticatedUser|principal|companyId|runtimeCompanyId|reportKey|supersedesReportId|schemaVersion/);
      expect(call.init?.method ?? 'GET').toBe('GET');
      expect(call.init?.body).toBeUndefined();
      expect(call.init?.credentials).toBe('omit');
      expect(new Headers(call.init?.headers).has('authorization')).toBe(false);
    }
  });
});
