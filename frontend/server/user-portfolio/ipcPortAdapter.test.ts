/**
 * Gate B — `UserPortfolioPort` adapter over same-host IPC.
 *
 * Covers: the allowlisted wire form (no scope/identity), IPD refusal mapping into the existing
 * closed vocabulary, fail-closed transport handling, uniform non-disclosure, and NO MUTATION ON
 * REFUSAL — every mutating operation refuses locally with zero upstream requests.
 *
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import {
  G2_IPC_OPERATIONS,
  G2_WRITE_POLICY_UNDEFINED_MESSAGE,
  createIpcUserPortfolioAdapter,
} from './ipcPortAdapter.js';
import { G2_OWNER_CONTEXT_SOURCE } from './ownerContextFromBinding.js';
import { IpcTransportError } from './ipcClient.js';
import { G2Error, G2_UNRESOLVED_WRITE_MESSAGE } from './userPortfolioContract.js';

const PORTFOLIO_ID = 'pf-1';
const TENANT_HINT = 'irr-domain-4b82d6e1';

const BINDING = Object.freeze({
  source: G2_OWNER_CONTEXT_SOURCE,
  endpoint: Object.freeze({ kind: 'unix' as const, path: '/run/iips/g2-ipd.sock' }),
  scope: Object.freeze({ tenantHint: TENANT_HINT }),
});

const SCOPE = Object.freeze({ tenantHint: TENANT_HINT });

interface Call {
  readonly operation: string;
  readonly payload: Readonly<Record<string, unknown>> | undefined;
}

/** A recording exchange stub. A function result may be an `Error`, which is thrown. */
function createExchange(result: unknown | ((call: Call) => unknown)) {
  const calls: Call[] = [];
  const exchange = vi.fn(async (operation: string, payload?: Readonly<Record<string, unknown>>) => {
    const call = { operation, payload };
    calls.push(call);
    const value = typeof result === 'function' ? (result as (call: Call) => unknown)(call) : result;
    if (value instanceof Error) throw value;
    return value;
  });
  return { calls, exchange };
}

function portfolioView(portfolioId: string = PORTFOLIO_ID) {
  return {
    portfolioId,
    portfolioName: 'Test portfolio',
    revision: 1,
    holdings: [],
    contributions: [],
    totalMarketValue: 0,
    totalHoldingsCount: 0,
    weightSumPercentage: 0,
    lastUpdated: '2026-10-17T00:00:00.000Z',
    provenanceDigest: 'digest',
    isSaved: false,
  };
}

const LIST_RESPONSE = {
  status: 200,
  body: {
    portfolios: [{
      portfolioId: PORTFOLIO_ID,
      portfolioName: 'Test portfolio',
      revision: 1,
      totalMarketValue: 0,
      totalHoldingsCount: 0,
      weightSumPercentage: 0,
      lastUpdated: '2026-10-17T00:00:00.000Z',
      provenanceDigest: 'digest',
      isSaved: false,
    }],
  },
};

const VIEW_RESPONSE = { status: 200, body: { portfolio: portfolioView() } };

const REVISIONS_RESPONSE = {
  status: 200,
  body: {
    revisions: [{
      revision: 1,
      operation: 'INITIAL',
      totalMarketValue: 0,
      provenanceDigest: 'digest',
      holdingsCount: 0,
      createdAt: '2026-10-17T00:00:00.000Z',
    }],
  },
};

describe('Gate B — adapter wire form', () => {
  it('reads through the allowlisted operations with no scope on the wire', async () => {
    const list = createExchange(LIST_RESPONSE);
    const adapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange: list.exchange });

    await expect(adapter.listPortfolios({ scope: SCOPE })).resolves.toEqual(LIST_RESPONSE.body.portfolios);
    expect(list.calls).toEqual([{ operation: G2_IPC_OPERATIONS.listPortfolios, payload: undefined }]);

    const get = createExchange(VIEW_RESPONSE);
    const getAdapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange: get.exchange });
    await expect(getAdapter.getPortfolio({ scope: SCOPE, portfolioId: PORTFOLIO_ID }))
      .resolves.toEqual(portfolioView());
    expect(get.calls).toEqual([{ operation: G2_IPC_OPERATIONS.getPortfolio, payload: { portfolioId: PORTFOLIO_ID } }]);

    const revisions = createExchange(REVISIONS_RESPONSE);
    const revisionsAdapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange: revisions.exchange });
    await expect(revisionsAdapter.revisionHistory({ scope: SCOPE, portfolioId: PORTFOLIO_ID }))
      .resolves.toEqual(REVISIONS_RESPONSE.body.revisions);
    expect(revisions.calls).toEqual([{ operation: G2_IPC_OPERATIONS.revisionHistory, payload: { portfolioId: PORTFOLIO_ID } }]);
  });

  it('never serializes scope, tenant, owner or principal values', async () => {
    const { calls, exchange } = createExchange(VIEW_RESPONSE);
    const adapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange });

    await adapter.getPortfolio({ scope: SCOPE, portfolioId: PORTFOLIO_ID });

    const wire = JSON.stringify(calls);
    for (const key of ['tenantHint', 'tenantId', 'scope', 'principal', 'owner', 'applicationUserId', 'membership']) {
      expect(wire).not.toContain(key);
    }
    expect(Object.keys(calls[0].payload ?? {})).toEqual(['portfolioId']);
  });
});

describe('Gate B — refusal mapping (existing vocabulary, no new semantics)', () => {
  const cases: ReadonlyArray<{ readonly status: number; readonly error?: string; readonly reason: string }> = [
    { status: 400, reason: 'INVALID_REQUEST' },
    { status: 400, error: 'SAVE_GUARD_VIOLATION', reason: 'SAVE_GUARD_VIOLATION' },
    { status: 401, reason: 'IPD_AUTH' },
    { status: 403, reason: 'FORBIDDEN' },
    { status: 404, reason: 'NOT_FOUND' },
    { status: 405, reason: 'METHOD_NOT_ALLOWED' },
    { status: 409, reason: 'REVISION_CONFLICT' },
    { status: 503, reason: 'UPSTREAM_UNAVAILABLE' },
    { status: 500, reason: 'IPD_ERROR' },
    { status: 302, reason: 'IPD_ERROR' },
  ];

  for (const testCase of cases) {
    it(`maps status ${testCase.status}${testCase.error ? ` (${testCase.error})` : ''} to ${testCase.reason}`, async () => {
      const { calls, exchange } = createExchange({
        status: testCase.status,
        body: testCase.error ? { error: testCase.error } : {},
      });
      const adapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange });

      await expect(adapter.getPortfolio({ scope: SCOPE, portfolioId: PORTFOLIO_ID }))
        .rejects.toMatchObject({ name: 'G2Error', reason: testCase.reason });

      // Exactly one upstream request: a refusal is never retried and never partially applied.
      expect(calls).toHaveLength(1);
    });
  }

  it('closes a malformed success envelope as UPSTREAM_UNAVAILABLE', async () => {
    const { exchange } = createExchange({ status: 200, body: {} });
    const adapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange });

    await expect(adapter.listPortfolios({ scope: SCOPE }))
      .rejects.toMatchObject({ reason: 'UPSTREAM_UNAVAILABLE' });
  });

  it('refuses an upstream echo for a portfolio that was not requested', async () => {
    const { exchange } = createExchange({ status: 200, body: { portfolio: portfolioView('pf-other') } });
    const adapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange });

    await expect(adapter.getPortfolio({ scope: SCOPE, portfolioId: PORTFOLIO_ID }))
      .rejects.toMatchObject({ reason: 'UPSTREAM_UNAVAILABLE' });
  });
});

describe('Gate B — fail-closed transport and non-disclosure', () => {
  it('maps transport failures into the closed vocabulary', async () => {
    const timeout = createExchange(new IpcTransportError('timeout'));
    await expect(createIpcUserPortfolioAdapter({ binding: BINDING, exchange: timeout.exchange })
      .listPortfolios({ scope: SCOPE })).rejects.toMatchObject({ reason: 'UPSTREAM_UNAVAILABLE' });

    const oversized = createExchange(new IpcTransportError('response-too-large'));
    await expect(createIpcUserPortfolioAdapter({ binding: BINDING, exchange: oversized.exchange })
      .listPortfolios({ scope: SCOPE })).rejects.toMatchObject({ reason: 'UPSTREAM_UNAVAILABLE' });

    const framing = createExchange(new IpcTransportError('request-too-large'));
    await expect(createIpcUserPortfolioAdapter({ binding: BINDING, exchange: framing.exchange })
      .listPortfolios({ scope: SCOPE })).rejects.toMatchObject({ reason: 'INVALID_REQUEST' });

    const unexpected = createExchange(() => { throw new Error('unexpected'); });
    await expect(createIpcUserPortfolioAdapter({ binding: BINDING, exchange: unexpected.exchange })
      .listPortfolios({ scope: SCOPE })).rejects.toMatchObject({ reason: 'UPSTREAM_UNAVAILABLE' });
  });

  it('preserves a typed G2Error thrown upstream', async () => {
    const { exchange } = createExchange(() => new G2Error('FORBIDDEN', 'denied'));
    const adapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange });

    await expect(adapter.listPortfolios({ scope: SCOPE }))
      .rejects.toMatchObject({ reason: 'FORBIDDEN', message: 'denied' });
  });

  it('treats a scope mismatch as indistinguishable from a missing portfolio, with no request', async () => {
    const { calls, exchange } = createExchange(LIST_RESPONSE);
    const adapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange });

    await expect(adapter.listPortfolios({ scope: { tenantHint: 'foreign-tenant' } }))
      .rejects.toMatchObject({ reason: 'NOT_FOUND', message: 'Portfolio is not available.' });
    await expect(adapter.listPortfolios({ scope: undefined as unknown as typeof SCOPE }))
      .rejects.toMatchObject({ reason: 'NOT_FOUND' });

    expect(calls).toHaveLength(0);
  });

  it('refuses an invalid portfolio identifier before any request', async () => {
    const { calls, exchange } = createExchange(VIEW_RESPONSE);
    const adapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange });

    await expect(adapter.getPortfolio({ scope: SCOPE, portfolioId: '../pf-1' }))
      .rejects.toMatchObject({ reason: 'INVALID_REQUEST' });
    await expect(adapter.revisionHistory({ scope: SCOPE, portfolioId: '' }))
      .rejects.toMatchObject({ reason: 'INVALID_REQUEST' });

    expect(calls).toHaveLength(0);
  });
});

describe('Gate B — no mutation on refusal (Gate E remains unopened)', () => {
  it('refuses every mutating operation locally with zero upstream requests', async () => {
    const { calls, exchange } = createExchange(VIEW_RESPONSE);
    const adapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange });

    await expect(adapter.createPortfolio({ scope: SCOPE }))
      .rejects.toMatchObject({ reason: 'INVALID_REQUEST', message: G2_WRITE_POLICY_UNDEFINED_MESSAGE });
    await expect(adapter.resetPortfolio({ scope: SCOPE, portfolioId: PORTFOLIO_ID }))
      .rejects.toMatchObject({ reason: 'INVALID_REQUEST', message: G2_WRITE_POLICY_UNDEFINED_MESSAGE });
    await expect(adapter.deletePortfolio({ scope: SCOPE, portfolioId: PORTFOLIO_ID }))
      .rejects.toMatchObject({ reason: 'INVALID_REQUEST', message: G2_WRITE_POLICY_UNDEFINED_MESSAGE });

    // Effective DP-2 Option 2F, verbatim: the unresolved/ambiguous save is refused before any
    // serializer, scope derivation, port call or upstream request.
    await expect(adapter.saveHoldings({
      scope: SCOPE,
      portfolioId: PORTFOLIO_ID,
      holdings: [{ symbol: 'TCS' }],
    })).rejects.toMatchObject({ reason: 'INVALID_REQUEST', message: G2_UNRESOLVED_WRITE_MESSAGE });

    expect(calls).toHaveLength(0);
  });

  it('is frozen and holds no mutable state between refusals', async () => {
    const { exchange } = createExchange(VIEW_RESPONSE);
    const adapter = createIpcUserPortfolioAdapter({ binding: BINDING, exchange });

    expect(Object.isFrozen(adapter)).toBe(true);
    await expect(adapter.saveHoldings({ scope: SCOPE, portfolioId: PORTFOLIO_ID, holdings: [] }))
      .rejects.toBeInstanceOf(G2Error);
    await expect(adapter.saveHoldings({ scope: SCOPE, portfolioId: PORTFOLIO_ID, holdings: [] }))
      .rejects.toBeInstanceOf(G2Error);
  });

  it('refuses to construct from a binding that did not come from provisioning', () => {
    expect(() => createIpcUserPortfolioAdapter({ binding: { ...BINDING, source: 'caller' } as never }))
      .toThrow(G2Error);
    expect(() => createIpcUserPortfolioAdapter({ binding: { ...BINDING, endpoint: { kind: 'unix', path: 'relative.sock' } } as never }))
      .toThrow(G2Error);
    expect(() => createIpcUserPortfolioAdapter({ binding: { ...BINDING, scope: { tenantHint: ' padded' } } as never }))
      .toThrow(G2Error);
    expect(() => createIpcUserPortfolioAdapter(undefined as never)).toThrow(G2Error);
  });
});
