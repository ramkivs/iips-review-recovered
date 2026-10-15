/**
 * Program v3.0 — NP-08 / D08 MACRO: origin-scoped TLS compatibility tests.
 *
 * NO NETWORK. Routing and the TLS-option posture are asserted directly, and the
 * scoped fetch is injected. Nothing in this file contacts MoSPI.
 *
 * Purpose: prove the compatibility setting is (a) scoped to exactly
 * `https://api.mospi.gov.in`, (b) cannot reach any other origin, (c) keeps
 * certificate verification enabled, (d) does NOT enable unsafe renegotiation,
 * and (e) still fails closed.
 */
import { constants } from 'node:crypto';

import { Agent } from 'undici';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  MOSPI_ORIGIN,
  MOSPI_TLS_CONNECT_OPTIONS,
  createMospiFetch,
  isMospiOrigin,
  mospiTlsDispatcher,
} from './mospi-tls';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isMospiOrigin', () => {
  it('accepts exactly the MoSPI origin, including with path and query', () => {
    expect(isMospiOrigin(MOSPI_ORIGIN)).toBe(true);
    expect(isMospiOrigin(`${MOSPI_ORIGIN}/api/cpi/getCPIIndex?base_year=2012&Format=JSON`)).toBe(true);
  });

  it('rejects look-alike hosts, other schemes, other ports and non-URLs', () => {
    expect(isMospiOrigin('https://api.mospi.gov.in.evil.example/api/cpi/getCPIIndex')).toBe(false);
    expect(isMospiOrigin('https://evil.example/?host=api.mospi.gov.in')).toBe(false);
    expect(isMospiOrigin('https://api.mospi.gov.in:8443/api/cpi/getCPIIndex')).toBe(false);
    expect(isMospiOrigin('http://api.mospi.gov.in/api/cpi/getCPIIndex')).toBe(false);
    expect(isMospiOrigin('https://other.mospi.gov.in/api/cpi/getCPIIndex')).toBe(false);
    expect(isMospiOrigin('not a url')).toBe(false);
  });
});

describe('MOSPI_TLS_CONNECT_OPTIONS', () => {
  it('sets exactly the client-only legacy-connect flag and nothing else', () => {
    expect(Object.keys(MOSPI_TLS_CONNECT_OPTIONS).sort()).toEqual(['rejectUnauthorized', 'secureOptions']);
    expect(MOSPI_TLS_CONNECT_OPTIONS.secureOptions).toBe(constants.SSL_OP_LEGACY_SERVER_CONNECT);
    // The dangerous flag (permits unsafe MID-CONNECTION renegotiation) must stay off.
    expect(MOSPI_TLS_CONNECT_OPTIONS.secureOptions & constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION).toBe(0);
  });

  it('keeps certificate verification enabled', () => {
    expect(MOSPI_TLS_CONNECT_OPTIONS.rejectUnauthorized).toBe(true);
  });
});

describe('mospiTlsDispatcher', () => {
  it('is a single cached undici Agent, reused across calls', () => {
    const first = mospiTlsDispatcher();
    expect(first).toBeInstanceOf(Agent);
    expect(mospiTlsDispatcher()).toBe(first);
  });
});

describe('createMospiFetch', () => {
  it('routes the MoSPI origin through the scoped fetch and never through the runtime fetch', async () => {
    const runtimeFetch = vi.fn();
    vi.stubGlobal('fetch', runtimeFetch);
    const scoped = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => ({ status: 200 }) as unknown as Response,
    );
    const fetchImpl = createMospiFetch(scoped as unknown as typeof fetch);

    const url = `${MOSPI_ORIGIN}/api/cpi/getCPIIndex?base_year=2012&Format=JSON`;
    const init = { method: 'GET', headers: { Accept: 'application/json' } } as RequestInit;
    const res = await fetchImpl(url, init);

    expect(scoped).toHaveBeenCalledTimes(1);
    expect(scoped.mock.calls[0]![0]).toBe(url);
    expect(scoped.mock.calls[0]![1]).toBe(init);
    expect(runtimeFetch).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('leaves every other origin on the untouched runtime fetch, arguments and result unchanged', async () => {
    const marker = { status: 204 } as unknown as Response;
    const runtimeFetch = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => marker);
    vi.stubGlobal('fetch', runtimeFetch);
    const scoped = vi.fn();
    const fetchImpl = createMospiFetch(scoped as unknown as typeof fetch);

    const url = 'https://api.mospi.gov.in.evil.example/api/cpi/getCPIIndex';
    const init = { method: 'GET' } as RequestInit;
    const res = await fetchImpl(url, init);

    expect(scoped).not.toHaveBeenCalled();
    expect(runtimeFetch).toHaveBeenCalledTimes(1);
    expect(runtimeFetch.mock.calls[0]![0]).toBe(url);
    expect(runtimeFetch.mock.calls[0]![1]).toBe(init);
    expect(res).toBe(marker);
  });

  it('fails closed: a scoped-fetch failure propagates and is never retried on another origin path', async () => {
    const runtimeFetch = vi.fn();
    vi.stubGlobal('fetch', runtimeFetch);
    const failure = new TypeError('fetch failed');
    const scoped = vi.fn(async () => {
      throw failure;
    });
    const fetchImpl = createMospiFetch(scoped as unknown as typeof fetch);

    await expect(fetchImpl(`${MOSPI_ORIGIN}/api/cpi/getCPIIndex`)).rejects.toBe(failure);
    expect(runtimeFetch).not.toHaveBeenCalled();
  });
});
