/** GC-D2 / 2F offline qualification: no G24, credential, database or live port.
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';
import type http from 'node:http';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { prepareUnresolvedHoldingEvidence, G2_IDENTITY_CLAIM_KEYS } from './translationBoundary.js';
import { saveHoldings, getPortfolio } from './userPortfolioBoundary.js';
import { G2Error, G2_CONTRACT_VERSION, G2_LINEAGE, G2_UNRESOLVED_WRITE_MESSAGE } from './userPortfolioContract.js';
import type { UserPortfolioPort } from './userPortfolioPort.js';
import { handleUserPortfolioRequest } from '../user-portfolio-transport.js';

const PRINCIPAL = { userId: 'offline-fixture', tenantId: 'offline-only', roles: [] } as Parameters<typeof saveHoldings>[1];
const METHODS = ['listPortfolios', 'getPortfolio', 'createPortfolio', 'saveHoldings', 'resetPortfolio', 'deletePortfolio', 'revisionHistory'] as const;
function recordingPort() {
  const writes: unknown[] = [];
  let serializations = 0;
  const operations = Object.fromEntries(METHODS.map(name => [name, vi.fn(async (params: unknown) => {
    serializations++;
    JSON.stringify(params);
    writes.push(params);
    throw new Error('Refused save must never invoke this test port');
  })]));
  return { port: operations as unknown as UserPortfolioPort, writes, operations, get serializations() { return serializations; } };
}
async function refused(holdings: unknown, extras: Record<string, unknown> = {}, principal = PRINCIPAL) {
  const stub = recordingPort();
  await expect(saveHoldings(stub.port, principal, 'P-1', { holdings, ...extras }))
    .rejects.toMatchObject({ name: 'G2Error', reason: 'INVALID_REQUEST' });
  for (const operation of Object.values(stub.operations)) expect(operation).not.toHaveBeenCalled();
  expect(stub.serializations).toBe(0);
  expect(stub.writes).toEqual([]);
}
async function fence(path: string, method: string) {
  const req = { url: path, method } as http.IncomingMessage;
  Object.defineProperties(req, {
    headers: { get() { throw new Error('Headers must not be read'); } },
    on: { value() { throw new Error('Request body must not be read'); } },
  });
  let status = 0;
  let body = '';
  let headers: unknown;
  const res = {
    setHeader: vi.fn(),
    writeHead(code: number, value?: unknown) { status = code; headers = value; },
    end(value: string) { body = value; },
  } as unknown as http.ServerResponse;
  await handleUserPortfolioRequest(req, res);
  return { status, body, headers };
}

describe('GC-D2 — Option 2F', () => {
  it('T-1 preserves native bytes; unresolved save has zero calls/writes', async () => {
    const native = Object.freeze({ symbol: ' TCS ', isin: ' ine-native ', exchange: 'NSE' as const, quantity: 2 });
    const out = prepareUnresolvedHoldingEvidence([native]);
    expect(out).toEqual([{ ...native, identityStatus: 'UNRESOLVED' }]);
    expect(out[0]).not.toHaveProperty('companyId');
    expect(out[0]).not.toHaveProperty('resolutionDisposition');
    expect(Object.isFrozen(out)).toBe(true);
    expect(Object.isFrozen(out[0])).toBe(true);
    expect(native).not.toHaveProperty('identityStatus');
    await refused([native]);
  });
  it('T-2 bypass declaration never unlocks a save at any caller level', async () => {
    const claim = { identityStatus: 'UNRESOLVED', resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS' };
    await refused([{ symbol: 'TCS', ...claim }]);
    await refused([{ symbol: 'TCS' }], claim);
    await refused([{ symbol: 'TCS' }], { options: claim });
  });
  it('T-3 missing or claimed resolution is never a resolved upstream default', async () => {
    expect(prepareUnresolvedHoldingEvidence([{ symbol: 'TCS' }])[0].identityStatus).toBe('UNRESOLVED');
    for (const identityStatus of ['RESOLVED', 'UNRESOLVED', undefined, '']) await refused([{ symbol: 'TCS', identityStatus }]);
    await refused([{ symbol: 'TCS', resolutionDisposition: 'CANONICAL_P04' }]);
  });
  it('T-4 refuses ticker/company claims including empty or undefined values', async () => {
    for (const key of ['companyId', 'runtimeCompanyId']) {
      for (const value of ['TCS', 'INFY', '', undefined]) await refused([{ symbol: 'TCS', [key]: value }]);
    }
  });
  it('T-5 missing, malformed, empty and cross-exchange batches cannot merge/save', async () => {
    for (const input of [null, {}, [], [{}], [{ symbol: '' }], [{ symbol: '  ' }], [{ symbol: 'TCS', exchange: 'NYSE' }]]) await refused(input);
    const native = [{ symbol: 'TCS', exchange: 'NSE' }, { symbol: 'TCS', exchange: 'BSE' }];
    expect(prepareUnresolvedHoldingEvidence(native).map(h => h.symbol)).toEqual(['TCS', 'TCS']);
    await refused(native);
  });
  it('T-6 absent ISIN/exchange stay absent without fabrication or rewriting', () => {
    const [out] = prepareUnresolvedHoldingEvidence([{ symbol: 'Native\tSymbol' }]);
    expect(out.symbol).toBe('Native\tSymbol');
    expect(out).not.toHaveProperty('isin');
    expect(out).not.toHaveProperty('exchange');
    expect(out).not.toHaveProperty('companyId');
  });
  it('T-7 no disposition emitted and no client callback invoked', async () => {
    const callback = vi.fn(() => { throw new Error('Client callback executed'); });
    const native = { symbol: 'TCS', toJSON: callback, unknown: 'NON_PRODUCTION_OPERATOR_BYPASS' };
    expect(prepareUnresolvedHoldingEvidence([native])).toEqual([{ symbol: 'TCS', identityStatus: 'UNRESOLVED' }]);
    await refused([native]);
    expect(callback).not.toHaveBeenCalled();
  });
  it('T-8 refuses caller owner/tenant/durable/resolution authority by presence', async () => {
    for (const key of [...G2_IDENTITY_CLAIM_KEYS, 'tenantId', 'tenant', 'revision', 'portfolioId']) {
      await refused([{ symbol: 'TCS', [key]: 'untrusted' }]);
      await refused([{ symbol: 'TCS' }], { [key]: undefined });
    }
  });
  it('T-9 refusal precedes serialization and scope derivation', async () => {
    const principal = Object.defineProperty({}, 'tenantId', { get() { throw new Error('Scope accessed'); } });
    const serialization = vi.spyOn(JSON, 'stringify');
    try {
      await refused([{ symbol: 'TCS', quantity: 10 }], {}, principal as typeof PRINCIPAL);
      expect(serialization).not.toHaveBeenCalled();
    } finally { serialization.mockRestore(); }
  });
  it('T-10 domain-scoped read fields cannot authorize an equivalent write', async () => {
    const view = { portfolioId: 'P-1', holdings: [{ symbol: 'TCS', companyId: 'TCS', identityStatus: 'RESOLVED' }] };
    const port = { getPortfolio: vi.fn(async () => view) } as unknown as UserPortfolioPort;
    expect(await getPortfolio(port, PRINCIPAL, 'P-1')).toBe(view);
    await refused(view.holdings);
  });
  it('T-11 stable typed refusal; retries do not repair identity', async () => {
    const stub = recordingPort();
    for (let i = 0; i < 3; i++) {
      await expect(saveHoldings(stub.port, PRINCIPAL, 'P-1', { holdings: [{ symbol: 'TCS' }] }))
        .rejects.toEqual(new G2Error('INVALID_REQUEST', G2_UNRESOLVED_WRITE_MESSAGE));
    }
    expect(stub.operations.saveHoldings).not.toHaveBeenCalled();
    expect(stub.writes).toEqual([]);
  });
  it('T-12 protected fence files keep their pre-implementation blob identities', () => {
    for (const [path, want] of [
      ['../user-portfolio-transport.ts', '51704c12a467cd2f718a030b5036bc55c9afa73f'],
      ['../owner-context-unavailable.ts', 'cb8db45d668d28cee7e0a52721001d579a872733'],
    ]) {
      const bytes = readFileSync(new URL(path, import.meta.url));
      expect(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')).toBe(want);
    }
  });
  it('T-13 six routes stay 503 without reading claims/body; 404/405 retained', async () => {
    for (const [path, methods] of [
      ['/api/user-portfolios/context', ['GET', 'HEAD']],
      ['/api/user-portfolios', ['GET', 'HEAD', 'POST']],
      ['/api/user-portfolios/P-1', ['GET', 'HEAD', 'DELETE']],
      ['/api/user-portfolios/P-1/holdings', ['PUT']],
      ['/api/user-portfolios/P-1/revisions', ['GET', 'HEAD']],
      ['/api/user-portfolios/P-1/reset', ['POST']],
    ] as const) {
      for (const method of methods) {
        const out = await fence(path, method);
        expect(out.status).toBe(503);
        expect(JSON.parse(out.body).error).toBe('owner-context-unavailable');
      }
    }
    expect((await fence('/api/user-portfoliosEVIL', 'GET')).status).toBe(404);
    expect(await fence('/api/user-portfolios/P-1/holdings', 'GET')).toMatchObject({ status: 405, headers: { Allow: 'PUT' } });
  });
  it('T-14 hostile prototypes/accessors refused without evaluating them', async () => {
    let reads = 0;
    const accessor = Object.defineProperty({ symbol: 'TCS' }, 'companyId', { get() { reads++; return 'TCS'; } });
    await refused([accessor]);
    await refused([Object.assign(Object.create({ identityStatus: 'RESOLVED' }), { symbol: 'TCS' })]);
    expect(reads).toBe(0);
  });
  it('T-15 IRR revision leaves the upstream lineage immutable', () => {
    expect(G2_CONTRACT_VERSION).toBe('2');
    expect(G2_LINEAGE.commit).toBe('6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4');
    expect(Object.isFrozen(G2_LINEAGE)).toBe(true);
  });
});
