/**
 * Program v3.0 — NP-08 / D08 MACRO: `/api/macro` client tests (V-C6).
 *
 * Verifies that `fetchMacroNas` / `fetchMacroCpi` / `fetchMacroIip` parse and
 * surface JSON error fields (`code`, `message`, `dataset`) on non-2xx
 * responses while preserving the `macro transport returned <status>` message
 * prefix required by existing consumers and regression tests.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  MacroTransportError,
  fetchMacroCpi,
  fetchMacroIip,
  fetchMacroNas,
} from './macro';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('api/macro client error handling (V-C6)', () => {
  it('parses and surfaces code, message, and dataset on 502 while preserving the status prefix', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 502,
      json: async () => ({
        error: 'macro upstream failure',
        code: 'INDICATOR_NOT_GOVERNED',
        message: 'indicator 3 is outside governed NAS scope (1=GVA, 5=GDP)',
        dataset: 'NAS',
      }),
    })) as unknown as typeof fetch;

    let caught: unknown;
    try {
      await fetchMacroNas({ indicator: 3 });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(caught).toBeInstanceOf(MacroTransportError);
    const err = caught as MacroTransportError;
    expect(err.status).toBe(502);
    expect(err.code).toBe('INDICATOR_NOT_GOVERNED');
    expect(err.dataset).toBe('NAS');
    expect(err.errorMessage).toBe('indicator 3 is outside governed NAS scope (1=GVA, 5=GDP)');
    expect(err.message).toMatch(/^macro transport returned 502/);
    expect(err.message).toContain('INDICATOR_NOT_GOVERNED');
    expect(err.message).toContain('NAS');
    expect(err.message).toContain('indicator 3 is outside governed NAS scope');
  });

  it('distinguishes RETRY_BUDGET_EXHAUSTED from INDICATOR_NOT_GOVERNED across datasets', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 502,
      json: async () => ({
        error: 'macro upstream failure',
        code: 'RETRY_BUDGET_EXHAUSTED',
        message: 'MoSPI CPI endpoint unreachable after 3 retries',
        dataset: 'CPI',
      }),
    })) as unknown as typeof fetch;

    await expect(fetchMacroCpi({})).rejects.toMatchObject({
      name: 'MacroTransportError',
      status: 502,
      code: 'RETRY_BUDGET_EXHAUSTED',
      dataset: 'CPI',
      errorMessage: 'MoSPI CPI endpoint unreachable after 3 retries',
    });
  });

  it('surfaces 400 validation error string when code/message are absent', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 400,
      json: async () => ({
        error: "year must be a four-digit year (received '2025-26')",
      }),
    })) as unknown as typeof fetch;

    let caught: unknown;
    try {
      await fetchMacroCpi({ year: '2025-26' });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(MacroTransportError);
    const err = caught as MacroTransportError;
    expect(err.status).toBe(400);
    expect(err.code).toBeUndefined();
    expect(err.errorMessage).toBe("year must be a four-digit year (received '2025-26')");
    expect(err.message).toBe(
      "macro transport returned 400: year must be a four-digit year (received '2025-26')",
    );
  });

  it('preserves exact `macro transport returned <status>` message when error body is empty or non-JSON', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 502,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    await expect(fetchMacroIip({})).rejects.toThrow('macro transport returned 502');

    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON');
      },
    })) as unknown as typeof fetch;

    await expect(fetchMacroIip({})).rejects.toThrow('macro transport returned 503');
  });
});
