/**
 * G-2 Durable User Portfolio — BOUNDARY TESTS.
 *
 * Verifies the single choke point: shape validation before delegation, scope
 * derived from the principal ONLY (no caller-supplied scope exists), verbatim
 * delegation to the port, envelope echo guards, and fail-closed delegation
 * (typed failures preserved, untyped failures closed over). The port is a
 * recording fake — G24 itself is never contacted here.
 *
 * Case IDs: G2B-01 … (boundary).
 *
 * @vitest-environment node
 */
import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import {
  createPortfolio,
  deletePortfolio,
  getPortfolio,
  listPortfolios,
  resetPortfolio,
  revisionHistory,
  saveHoldings,
} from './userPortfolioBoundary.js';
import { G2Error } from './userPortfolioContract.js';
import type { UserPortfolioPort } from './userPortfolioPort.js';

const PRINCIPAL = { userId: 'analyst-a', tenantId: 'tenant-A', roles: ['analyst'] as const };
const PRINCIPAL_T = PRINCIPAL as unknown as Parameters<typeof listPortfolios>[1];

function view(portfolioId = 'P-1', revision = 1): Record<string, unknown> {
  return {
    portfolioId, portfolioName: 'N', revision, holdings: [], totalMarketValue: 0,
    totalHoldingsCount: 0, weightSumPercentage: 0, lastUpdated: 't', provenanceDigest: 'd',
    isSaved: true, contributions: [],
  };
}

/** Recording fake port. */
function fakePort(impl: Partial<UserPortfolioPort> = {}): { port: UserPortfolioPort; calls: Array<{ op: string; params: unknown }> } {
  const calls: Array<{ op: string; params: unknown }> = [];
  const record = (op: string) => (params: unknown) => {
    calls.push({ op, params });
    const fn = (impl as Record<string, ((p: never) => unknown) | undefined>)[op];
    if (fn) return fn(params as never);
    if (op === 'listPortfolios') return [];
    if (op === 'revisionHistory') return [];
    if (op === 'deletePortfolio') return { portfolioId: (params as { portfolioId: string }).portfolioId, deletedAt: 't' };
    if (op === 'saveHoldings') {
      const p = params as { portfolioId: string };
      return { success: true, isDuplicate: false, disposition: 'SAVED_NEW_BATCH', revision: 2, portfolio: view(p.portfolioId, 2) };
    }
    if (op === 'createPortfolio') return view('P-NEW', 0);
    return view((params as { portfolioId: string }).portfolioId);
  };
  return {
    calls,
    port: {
      listPortfolios: record('listPortfolios'),
      getPortfolio: record('getPortfolio'),
      createPortfolio: record('createPortfolio'),
      saveHoldings: record('saveHoldings'),
      resetPortfolio: record('resetPortfolio'),
      deletePortfolio: record('deletePortfolio'),
      revisionHistory: record('revisionHistory'),
    } as unknown as UserPortfolioPort,
  };
}

async function reasonOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    assert.ok(error instanceof G2Error);
    return error.reason;
  }
  assert.fail('expected a G2Error');
}

describe('G2B — delegation and scope derivation', () => {
  it('G2B-01 derives scope from the principal on every operation', async () => {
    const { port, calls } = fakePort();
    await listPortfolios(port, PRINCIPAL_T);
    await getPortfolio(port, PRINCIPAL_T, 'P-1');
    await createPortfolio(port, PRINCIPAL_T, {});
    await saveHoldings(port, PRINCIPAL_T, 'P-1', { holdings: [{ symbol: 'A' }] });
    await resetPortfolio(port, PRINCIPAL_T, 'P-1', {});
    await deletePortfolio(port, PRINCIPAL_T, 'P-1', {});
    await revisionHistory(port, PRINCIPAL_T, 'P-1');
    assert.equal(calls.length, 7);
    for (const call of calls) {
      assert.deepEqual((call.params as { scope: unknown }).scope, { tenantHint: 'tenant-A' });
    }
  });

  it('G2B-02 passes caller parameters through verbatim after validation', async () => {
    const { port, calls } = fakePort();
    await saveHoldings(port, PRINCIPAL_T, 'P-1', {
      holdings: [{ symbol: 'A', quantity: 5 }],
      options: { mode: 'REPLACE', contentDigest: 'd1' },
      expectedRevision: 2,
    });
    assert.deepEqual(calls[0].params, {
      scope: { tenantHint: 'tenant-A' },
      portfolioId: 'P-1',
      holdings: [{ symbol: 'A', quantity: 5 }],
      options: { mode: 'REPLACE', contentDigest: 'd1' },
      expectedRevision: 2,
    });
  });

  it('G2B-03 denies a principal without a tenant before touching the port', async () => {
    const { port, calls } = fakePort();
    const bad = { userId: 'u', tenantId: '', roles: [] } as unknown as Parameters<typeof listPortfolios>[1];
    assert.equal(await reasonOf(listPortfolios(port, bad)), 'FORBIDDEN');
    assert.equal(calls.length, 0);
  });
});

describe('G2B — fail-closed validation', () => {
  it('G2B-10 rejects inadmissible identifiers before delegating', async () => {
    const { port, calls } = fakePort();
    for (const bad of ['', 'a/b', ' x ', 42, null]) {
      assert.equal(await reasonOf(getPortfolio(port, PRINCIPAL_T, bad)), 'INVALID_REQUEST');
    }
    assert.equal(calls.length, 0);
  });

  it('G2B-11 rejects malformed create/save/lifecycle requests before delegating', async () => {
    const { port, calls } = fakePort();
    assert.equal(await reasonOf(createPortfolio(port, PRINCIPAL_T, null as never)), 'INVALID_REQUEST');
    assert.equal(await reasonOf(createPortfolio(port, PRINCIPAL_T, { portfolioName: '  ' })), 'INVALID_REQUEST');
    assert.equal(await reasonOf(saveHoldings(port, PRINCIPAL_T, 'P-1', { holdings: {} })), 'INVALID_REQUEST');
    assert.equal(await reasonOf(saveHoldings(port, PRINCIPAL_T, 'P-1', { holdings: [{ symbol: '' }] })), 'INVALID_REQUEST');
    assert.equal(await reasonOf(saveHoldings(port, PRINCIPAL_T, 'P-1', { holdings: [], options: { mode: 'X' } })), 'INVALID_REQUEST');
    assert.equal(await reasonOf(saveHoldings(port, PRINCIPAL_T, 'P-1', { holdings: [], expectedRevision: -1 })), 'INVALID_REQUEST');
    assert.equal(await reasonOf(resetPortfolio(port, PRINCIPAL_T, 'P-1', { expectedRevision: 1.5 })), 'INVALID_REQUEST');
    assert.equal(await reasonOf(deletePortfolio(port, PRINCIPAL_T, 'P-1', 'x' as never)), 'INVALID_REQUEST');
    assert.equal(calls.length, 0);
  });
});

describe('G2B — delegation guards', () => {
  it('G2B-20 preserves typed port failures verbatim', async () => {
    const { port } = fakePort({
      getPortfolio: () => {
        throw new G2Error('FORBIDDEN', 'denied upstream');
      },
    });
    try {
      await getPortfolio(port, PRINCIPAL_T, 'P-1');
      assert.fail('expected FORBIDDEN');
    } catch (error) {
      assert.ok(error instanceof G2Error);
      assert.equal(error.reason, 'FORBIDDEN');
      assert.equal(error.message, 'denied upstream');
    }
  });

  it('G2B-21 closes over untyped port failures', async () => {
    const { port } = fakePort({
      listPortfolios: () => {
        throw new Error('boom');
      },
    });
    assert.equal(await reasonOf(listPortfolios(port, PRINCIPAL_T)), 'UPSTREAM_UNAVAILABLE');
  });

  it('G2B-22 guards the addressed echo on views and deletes', async () => {
    const { port } = fakePort({ getPortfolio: (async () => view('P-OTHER')) as never });
    assert.equal(await reasonOf(getPortfolio(port, PRINCIPAL_T, 'P-1')), 'UPSTREAM_UNAVAILABLE');
    const { port: port2 } = fakePort({
      deletePortfolio: async () => ({ portfolioId: 'P-OTHER', deletedAt: 't' }),
    });
    assert.equal(await reasonOf(deletePortfolio(port2, PRINCIPAL_T, 'P-1', {})), 'UPSTREAM_UNAVAILABLE');
  });
});
