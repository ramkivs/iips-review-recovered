/**
 * DHAN-P4 identity: entrypoint fault reporting.
 *
 * The reported symptom was "The IRR identity service is unavailable." on an `INFY` search.
 * That string is correct — it means THIS server failed — but it was the whole diagnosis:
 * the fault was discarded, so neither the browser nor the operator could tell a missing
 * module from a missing setting from an unreachable IPD.
 *
 * These tests pin the split the fix installs:
 *   - the browser still gets an opaque, stable message;
 *   - the server log carries the cause.
 *
 * The entrypoint is not exported (it is a listening process), so the contract is pinned
 * against its source, and the behaviour it delegates to is exercised directly.
 *
 * @vitest-environment node
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { handleDhanIdentityRequest, DHAN_IDENTITY_API_ROUTES } from './market-data/dhanIdentityTransport';

const ENV = { IIPS_MARKET_DATA_TRANSPORT_URL: 'http://127.0.0.1:8791', IIPS_MARKET_DATA_TRANSPORT_TOKEN: 'synthetic-server-only-token' };
const source = readFileSync('server/executive-transport.ts', 'utf8');

afterEach(() => vi.restoreAllMocks());

describe('DHAN identity entrypoint fault reporting', () => {
  it('routes every identity fault to one reporting function', () => {
    expect(source).toContain('function reportIdentityFault(');
    // The outer catch must report, not swallow.
    const outerCatch = source.slice(source.indexOf("import('./market-data/dhanIdentityTransport')"));
    expect(outerCatch).toContain('reportIdentityFault({');
    expect(outerCatch).toContain("stage: 'transport'");
    // The transport is handed the same hook so it can report faults it classifies itself.
    expect(outerCatch).toContain('reportIdentityFault }');
  });

  it('keeps the browser message opaque while the log carries the cause', () => {
    // The response body is still exactly the reported symptom — no path, no setting, no
    // exception text. That is deliberate: a browser is not the operator.
    const marker = "message: 'The IRR identity service is unavailable.'";
    expect(source).toContain(marker);
    const at = source.indexOf(marker);
    // Just the enclosing res.end(...) statement.
    const responseCall = source.slice(source.lastIndexOf('res.end(', at), source.indexOf(';', at) + 1);
    expect(responseCall).toContain('TRANSPORT_UNAVAILABLE');
    for (const leak of ['detail', 'fault', 'String(', 'message: fault']) {
      expect(responseCall).not.toContain(leak);
    }
    // The diagnosis goes to the server log, which is where /api/dhan/health also puts it.
    expect(source).toContain('console.error(`[dhan-identity]');
  });

  it('does not flatten a classified transport failure into the generic message', () => {
    // requestDhanIdentity returns classified failures; only an unexpected throw reaches the
    // entrypoint catch. A 4xx contract violation must therefore never be reported as a fault.
    const handler = source.slice(source.indexOf("import('./market-data/dhanIdentityTransport')"));
    const catchIndex = handler.indexOf('} catch (fault) {');
    expect(handler.slice(catchIndex)).not.toContain('if (!outcome.ok) reportIdentityFault');
  });

  it('answers with a classified body and never the exception text when the transport throws', async () => {
    const faults: { stage: string; message: string }[] = [];
    // A transport that throws from a classification helper is the IRR-bug case.
    const { createServer } = await import('node:http');
    const server = createServer((req, res) => {
      void handleDhanIdentityRequest(req, res, {
        env: ENV,
        failure: (fault) => faults.push({ ...fault }),
        // Force a throw from inside the transport's own coordinate mapping.
        fetchImpl: (() => { throw new TypeError('internal mapping failure'); }) as unknown as typeof fetch,
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as { port: number };
    try {
      const resp = await fetch(`http://127.0.0.1:${port}${DHAN_IDENTITY_API_ROUTES.search}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: 'INFY' }),
      });
      // The throw is asynchronous inside requestDhanIdentity's try, so it is classified as an
      // unreachable transport rather than escaping — either way the client sees a code.
      const body = (await resp.json()) as { error: { code: string; message: string } };
      expect(['TRANSPORT_UNAVAILABLE', 'TRANSPORT_TIMEOUT']).toContain(body.error.code);
      expect(JSON.stringify(body)).not.toContain('internal mapping failure');
      expect(faults).toEqual([]);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
