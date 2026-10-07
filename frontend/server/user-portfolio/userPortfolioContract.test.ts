/**
 * G-2 Durable User Portfolio — CONSUMPTION CONTRACT TESTS.
 *
 * Verifies the G-2 §5 contract: frozen lineage pin, closed failure vocabulary,
 * status mapping, transport-shape validation (fail closed), and response-envelope
 * verification (echo guards). Every expectation is pinned to the recorded G24
 * behavior — see `userPortfolioContract.ts` for the blob citations.
 *
 * Case IDs: G2C-01 … (contract).
 *
 * @vitest-environment node
 */
import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import {
  G2_CONTRACT_VERSION,
  G2_IPD_AUDIENCE,
  G2_LINEAGE,
  G2_ROUTES,
  G2_TENANT_HEADER,
  G2Error,
  isValidExpectedRevision,
  isValidPortfolioId,
  isValidPortfolioName,
  isValidSaveMode,
  mapG24Status,
  validateHoldingShape,
  validateHoldingsShape,
  validateSaveOptionsShape,
  verifyCreateEnvelope,
  verifyDeleteEnvelope,
  verifyHealthEnvelope,
  verifyPortfolioEnvelope,
  verifyPortfolioListEnvelope,
  verifyRevisionsEnvelope,
  verifySaveEnvelope,
} from './userPortfolioContract.js';

function reasonOf(fn: () => unknown): string {
  try {
    fn();
  } catch (error) {
    assert.ok(error instanceof G2Error);
    return error.reason;
  }
  assert.fail('expected a G2Error');
}

describe('G2C — lineage pin and contract constants', () => {
  it('G2C-01 pins the exact verified G24 lineage', () => {
    assert.equal(G2_LINEAGE.repository, 'ramkivs/iips-production-market-data');
    assert.equal(G2_LINEAGE.branch, 'refs/heads/arena/01a0e6d9-iips-production-market-data');
    assert.equal(G2_LINEAGE.commit, '6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4');
    assert.equal(G2_LINEAGE.tree, 'eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5');
    assert.equal(G2_LINEAGE.baselineCommit, '0dab1221fb0f89e2e0601ea905d642bfe72d5f9c');
    assert.equal(G2_LINEAGE.httpServerBlob, '17f9cb8a21cbabfc956daee660fa7efb5445da94');
    assert.equal(G2_LINEAGE.durableStoreBlob, '1c23f259f580ba1992d3848d8c8d222bbf9a9e6a');
    assert.equal(G2_LINEAGE.governanceBlob, '45d016e8d0443994dd356625113c4be6ebfda50c');
    assert.ok(Object.isFrozen(G2_LINEAGE));
  });

  it('G2C-02 fixes the contract version, audience, tenant header, and routes', () => {
    assert.equal(G2_CONTRACT_VERSION, '1');
    assert.equal(G2_IPD_AUDIENCE, 'ipd-user-portfolio-api');
    assert.notEqual(G2_IPD_AUDIENCE, 'iips-spa');
    assert.equal(G2_TENANT_HEADER, 'x-ipd-tenant-id');
    assert.equal(G2_ROUTES.health, '/api/ipd/health');
    assert.equal(G2_ROUTES.portfolios, '/api/ipd/portfolios');
  });
});

describe('G2C — G24 status mapping', () => {
  it('G2C-10 maps every documented G24 status onto the closed vocabulary', () => {
    assert.equal(mapG24Status(400, 'SAVE_GUARD_VIOLATION'), 'SAVE_GUARD_VIOLATION');
    assert.equal(mapG24Status(400, 'INVALID_REQUEST'), 'INVALID_REQUEST');
    assert.equal(mapG24Status(400), 'INVALID_REQUEST');
    assert.equal(mapG24Status(401), 'IPD_AUTH');
    assert.equal(mapG24Status(403), 'FORBIDDEN');
    assert.equal(mapG24Status(404), 'NOT_FOUND');
    assert.equal(mapG24Status(405), 'METHOD_NOT_ALLOWED');
    assert.equal(mapG24Status(409), 'REVISION_CONFLICT');
    assert.equal(mapG24Status(503), 'UPSTREAM_UNAVAILABLE');
    assert.equal(mapG24Status(500), 'IPD_ERROR');
    assert.equal(mapG24Status(502), 'IPD_ERROR');
    assert.equal(mapG24Status(418), 'IPD_ERROR');
  });
});

describe('G2C — identifier and scalar validation', () => {
  it('G2C-20 admits segment-shaped portfolio identifiers only', () => {
    assert.equal(isValidPortfolioId('550e8400-e29b-41d4-a716-446655440000'), true);
    assert.equal(isValidPortfolioId('P-123'), true);
    assert.equal(isValidPortfolioId(''), false);
    assert.equal(isValidPortfolioId('   '), false);
    assert.equal(isValidPortfolioId(' padded '), false);
    assert.equal(isValidPortfolioId('a/b'), false);
    assert.equal(isValidPortfolioId(123), false);
    assert.equal(isValidPortfolioId(null), false);
    assert.equal(isValidPortfolioId(undefined), false);
  });

  it('G2C-21 admits only the governed save modes', () => {
    assert.equal(isValidSaveMode('MERGE'), true);
    assert.equal(isValidSaveMode('REPLACE'), true);
    assert.equal(isValidSaveMode('merge'), false);
    assert.equal(isValidSaveMode('UPSERT'), false);
    assert.equal(isValidSaveMode(''), false);
    assert.equal(isValidSaveMode(undefined), false);
  });

  it('G2C-22 admits only non-negative integer revisions', () => {
    assert.equal(isValidExpectedRevision(0), true);
    assert.equal(isValidExpectedRevision(41), true);
    assert.equal(isValidExpectedRevision(-1), false);
    assert.equal(isValidExpectedRevision(1.5), false);
    assert.equal(isValidExpectedRevision('3'), false);
    assert.equal(isValidExpectedRevision(Number.NaN), false);
  });

  it('G2C-23 admits only bounded non-blank portfolio names', () => {
    assert.equal(isValidPortfolioName('Retirement'), true);
    assert.equal(isValidPortfolioName(''), false);
    assert.equal(isValidPortfolioName('   '), false);
    assert.equal(isValidPortfolioName('x'.repeat(257)), false);
    assert.equal(isValidPortfolioName(42), false);
  });
});

describe('G2C — holding shape validation', () => {
  it('G2C-30 accepts a minimal holding (symbol only) and passes values through', () => {
    const out = validateHoldingShape({ symbol: 'STUBCO' }, 0);
    assert.equal(out.symbol, 'STUBCO');
    assert.equal(out.quantity, undefined);
  });

  it('G2C-31 accepts a fully populated holding verbatim', () => {
    const full = {
      symbol: 'STUBCO', companyId: 'C1', isin: 'INE000000001', exchange: 'NSE',
      quantity: 10, averageBuyPrice: 100, currentPrice: 110, marketValue: 1100,
      weightPercentage: 100, active: true, sourceBroker: 'DHAN', lineageDigest: 'd',
      identityStatus: 'RESOLVED', resolutionDisposition: 'CANONICAL_P04', rawIdentifier: 'r',
    };
    assert.deepEqual(validateHoldingShape(full, 2), full);
  });

  it('G2C-32 rejects malformed holdings fail-closed', () => {
    assert.equal(reasonOf(() => validateHoldingShape(null, 0)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape('x', 0)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape([], 0)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape({}, 1)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape({ symbol: '  ' }, 1)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape({ symbol: 'A', exchange: 'NYSE' }, 1)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape({ symbol: 'A', quantity: '10' }, 1)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape({ symbol: 'A', quantity: Number.NaN }, 1)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape({ symbol: 'A', active: 'yes' }, 1)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape({ symbol: 'A', companyId: 7 }, 1)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape({ symbol: 'A', identityStatus: 'MAYBE' }, 1)), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingShape({ symbol: 'A', resolutionDisposition: 'X' }, 1)), 'INVALID_REQUEST');
  });

  it('G2C-33 requires a holdings array and validates every element', () => {
    assert.equal(reasonOf(() => validateHoldingsShape({})), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateHoldingsShape('x')), 'INVALID_REQUEST');
    assert.deepEqual(validateHoldingsShape([]), []);
    assert.equal(reasonOf(() => validateHoldingsShape([{ symbol: 'A' }, { symbol: '' }])), 'INVALID_REQUEST');
  });
});

describe('G2C — save options validation', () => {
  it('G2C-40 defaults absent options and admits the governed shape', () => {
    assert.deepEqual(validateSaveOptionsShape(undefined), {});
    assert.deepEqual(validateSaveOptionsShape(null), {});
    assert.deepEqual(
      validateSaveOptionsShape({ mode: 'REPLACE', contentDigest: 'abc', fileName: 'f.csv' }),
      { mode: 'REPLACE', contentDigest: 'abc', fileName: 'f.csv' },
    );
  });

  it('G2C-41 rejects malformed options fail-closed', () => {
    assert.equal(reasonOf(() => validateSaveOptionsShape([])), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateSaveOptionsShape('x')), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateSaveOptionsShape({ mode: 'UPSERT' })), 'INVALID_REQUEST');
    assert.equal(reasonOf(() => validateSaveOptionsShape({ contentDigest: 42 })), 'INVALID_REQUEST');
  });
});

describe('G2C — response envelope verification', () => {
  const view = {
    portfolioId: 'P-1', portfolioName: 'N', revision: 2, holdings: [], totalMarketValue: 0,
    totalHoldingsCount: 0, weightSumPercentage: 0, lastUpdated: 't', provenanceDigest: 'd',
    isSaved: true, contributions: [],
  };

  it('G2C-50 verifies the portfolio envelope and the addressed echo', () => {
    assert.deepEqual(verifyPortfolioEnvelope({ portfolio: view }, 'P-1'), view);
    assert.equal(reasonOf(() => verifyPortfolioEnvelope(null, 'P-1')), 'UPSTREAM_UNAVAILABLE');
    assert.equal(reasonOf(() => verifyPortfolioEnvelope({}, 'P-1')), 'UPSTREAM_UNAVAILABLE');
    assert.equal(reasonOf(() => verifyPortfolioEnvelope({ portfolio: view }, 'P-2')), 'UPSTREAM_UNAVAILABLE');
    assert.equal(
      reasonOf(() => verifyPortfolioEnvelope({ portfolio: { ...view, revision: -1 } }, 'P-1')),
      'UPSTREAM_UNAVAILABLE',
    );
    assert.equal(
      reasonOf(() => verifyPortfolioEnvelope({ portfolio: { ...view, holdings: {} } }, 'P-1')),
      'UPSTREAM_UNAVAILABLE',
    );
  });

  it('G2C-51 verifies the collection envelope', () => {
    assert.deepEqual(verifyPortfolioListEnvelope({ portfolios: [{ portfolioId: 'P-1' }] }), [{ portfolioId: 'P-1' }]);
    assert.equal(reasonOf(() => verifyPortfolioListEnvelope({})), 'UPSTREAM_UNAVAILABLE');
    assert.equal(reasonOf(() => verifyPortfolioListEnvelope({ portfolios: [{ portfolioId: '' }] })), 'UPSTREAM_UNAVAILABLE');
  });

  it('G2C-52 verifies the revisions envelope', () => {
    const entry = { revision: 0, operation: 'INITIAL', totalMarketValue: 0, provenanceDigest: 'd', holdingsCount: 0, createdAt: 't' };
    assert.deepEqual(verifyRevisionsEnvelope({ revisions: [entry] }), [entry]);
    assert.equal(reasonOf(() => verifyRevisionsEnvelope({})), 'UPSTREAM_UNAVAILABLE');
    assert.equal(reasonOf(() => verifyRevisionsEnvelope({ revisions: [{ revision: 'x' }] })), 'UPSTREAM_UNAVAILABLE');
  });

  it('G2C-53 verifies the save envelope', () => {
    const save = { success: true, isDuplicate: false, disposition: 'SAVED_NEW_BATCH', revision: 2, portfolio: view };
    const out = verifySaveEnvelope(save, 'P-1');
    assert.equal(out.isDuplicate, false);
    assert.equal(out.portfolio.portfolioId, 'P-1');
    assert.equal(reasonOf(() => verifySaveEnvelope({ ...save, success: false }, 'P-1')), 'UPSTREAM_UNAVAILABLE');
    assert.equal(reasonOf(() => verifySaveEnvelope({ ...save, isDuplicate: 'no' }, 'P-1')), 'UPSTREAM_UNAVAILABLE');
    assert.equal(reasonOf(() => verifySaveEnvelope(save, 'P-9')), 'UPSTREAM_UNAVAILABLE');
  });

  it('G2C-54 verifies the create envelope and its INITIAL invariants', () => {
    const created = { ...view, revision: 0, holdings: [], isSaved: false };
    assert.deepEqual(verifyCreateEnvelope({ portfolio: created }), created);
    assert.equal(reasonOf(() => verifyCreateEnvelope({})), 'UPSTREAM_UNAVAILABLE');
    assert.equal(
      reasonOf(() => verifyCreateEnvelope({ portfolio: { ...created, revision: 3 } })),
      'UPSTREAM_UNAVAILABLE',
    );
    assert.equal(
      reasonOf(() => verifyCreateEnvelope({ portfolio: { ...created, holdings: [{ symbol: 'X' }] } })),
      'UPSTREAM_UNAVAILABLE',
    );
    assert.equal(
      reasonOf(() => verifyCreateEnvelope({ portfolio: { ...created, isSaved: true } })),
      'UPSTREAM_UNAVAILABLE',
    );
  });

  it('G2C-55 verifies the delete and health envelopes', () => {
    assert.deepEqual(
      verifyDeleteEnvelope({ portfolioId: 'P-1', deletedAt: 't' }, 'P-1'),
      { portfolioId: 'P-1', deletedAt: 't' },
    );
    assert.equal(reasonOf(() => verifyDeleteEnvelope({ portfolioId: 'P-2', deletedAt: 't' }, 'P-1')), 'UPSTREAM_UNAVAILABLE');
    assert.deepEqual(
      verifyHealthEnvelope({ status: 'UP', mode: 'NON_PRODUCTION', persistence: 'CONNECTED' }),
      { status: 'UP', mode: 'NON_PRODUCTION', persistence: 'CONNECTED' },
    );
    assert.equal(reasonOf(() => verifyHealthEnvelope({ status: 'UP' })), 'UPSTREAM_UNAVAILABLE');
  });
});
