#!/usr/bin/env node
// Lightweight runner for W-28 coverage measurement tests (no vitest required).
// Uses tsx to import TS module and runs 11 required conditions.
import { measureCoverage, maskIsin, sanitizeForPublication } from './coverageMeasurement.ts';

import { createHash } from 'node:crypto';

function assert(cond, msg) { if (!cond) throw new Error(msg); }
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg}: expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); }
function includes(arr, v, msg) { if (!arr.includes(v)) throw new Error(`${msg}: expected one of ${JSON.stringify(arr)} to include ${JSON.stringify(v)}`); }

function holding(overrides = {}) {
  return {
    symbol: 'RELIANCE',
    companyId: 'C-RL',
    isin: 'INE002A01018',
    exchange: 'NSE',
    quantity: 10,
    averageBuyPrice: 100,
    currentPrice: 110,
    marketValue: 1100,
    weightPercentage: 10,
    active: true,
    sourceBroker: 'ZERODHA',
    lineageDigest: 'a'.repeat(64),
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    securityIdentity: { securityId: 'ISIN:INE002A01018:EQ', isin: 'INE002A01018', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' },
    ...overrides,
  };
}
function portfolioView(holdings, portfolioId = 'portfolio-1', revision = 7) {
  return {
    portfolioId,
    portfolioName: 'Test Portfolio',
    revision,
    holdings,
    totalMarketValue: holdings.reduce((s, h) => s + h.marketValue, 0),
    totalHoldingsCount: holdings.length,
    weightSumPercentage: 100,
    lastUpdated: '2026-11-01T00:00:00.000Z',
    provenanceDigest: 'b'.repeat(64),
    isSaved: true,
    contributions: [],
  };
}
function registrySnapshot(overrides = {}) {
  const qualified = new Set([
    'C-RL|NSE_EQ|ISIN:INE002A01018:EQ',
    'C-TCS|NSE_EQ|ISIN:INE467B01029:EQ',
    'C-INFY|NSE_EQ|ISIN:INE009A01021:EQ',
    'C-INFY|BSE_EQ|ISIN:INE009A01021:EQ',
    'C-RL|NSE_EQ|ISIN:INE002A01018:BE',
  ]);
  return {
    manifestCommit: '371bf3bd4bb3eba49bbf6ae614d3edaaa04793ed',
    pipelineCommit: '325266d684f857a377d55b147e7306e02c7a495a',
    manifestSha256: '69a918f78791114e8fb036ddfd2a2005facdddf785a7496bc28f541fd4964769',
    qualifiedRegistry: qualified,
    proposedRegistry: new Set(['C-PROP|NSE_EQ|ISIN:INE040A01034:EQ']),
    p04Universe: new Set(['INE002A01018', 'INE467B01029', 'INE009A01021', 'INE040A01034', 'INE040H01021']),
    providerUniverse: new Set(['INE002A01018', 'INE467B01029', 'INE009A01021', 'INE040A01034', 'INE040H01021']),
    registryVersion: '371bf3bd@4680-qualified',
    ...overrides,
  };
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`✓ ${name}`); passed++; } catch (e) { console.error(`✗ ${name}\n  ${e.message}\n  ${e.stack?.split('\n')[1] ?? ''}`); failed++; }
}

// 1
test('1. exact ISIN and exchange mapping succeeds', () => {
  const h = holding({ isin: 'INE002A01018', exchange: 'NSE', securityIdentity: { securityId: 'ISIN:INE002A01018:EQ', isin: 'INE002A01018', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].result, 'RESOLVED', 'result');
  eq(results[0].exactRegistryMatch, 'YES', 'exact');
  eq(results[0].mappingQualification, 'QUALIFIED', 'qual');
  eq(results[0].reason, 'EXACT_QUALIFIED_MATCH', 'reason');
});
test('1b. BSE entry resolves via BSE_EQ', () => {
  const h = holding({ isin: 'INE009A01021', exchange: 'BSE', securityIdentity: { securityId: 'ISIN:INE009A01021:EQ', isin: 'INE009A01021', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].result, 'RESOLVED', 'BSE');
});
// 2
test('2. missing persisted ISIN remains unresolved', () => {
  const h = holding({ isin: undefined, exchange: 'NSE', securityIdentity: null });
  const pv = portfolioView([h]);
  const { results, summary } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].reason, 'MISSING_PERSISTED_ISIN', 'reason');
  eq(results[0].result, 'UNRESOLVED', 'result');
  eq(results[0].exactRegistryMatch, 'NO', 'exact');
  eq(results[0].mappingQualification, 'NOT_AVAILABLE', 'qual');
  eq(results[0].persistedIdentityAvailability, 'MISSING_ISIN', 'avail');
  eq(summary.missingIdentityCount, 1, 'missing count');
});
test('2b. empty string isin', () => {
  const h = holding({ isin: '', exchange: 'NSE' });
  const pv = portfolioView([h]);
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].reason, 'MISSING_PERSISTED_ISIN', 'empty');
});
// 3
test('3. no P04 correspondence', () => {
  const h = holding({ isin: 'INE999A99999', exchange: 'NSE', securityIdentity: { securityId: 'ISIN:INE999A99999:EQ', isin: 'INE999A99999', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const reg = registrySnapshot({ p04Universe: new Set(['INE002A01018']) });
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), reg);
  eq(results[0].reason, 'MISSING_P04_CORRESPONDENCE', 'p04');
  eq(results[0].result, 'UNRESOLVED', 'result');
});
// 4
test('4. no provider row', () => {
  const h = holding({ isin: 'INE999A99999', exchange: 'NSE', securityIdentity: { securityId: 'ISIN:INE999A99999:EQ', isin: 'INE999A99999', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const reg = registrySnapshot({ p04Universe: new Set(['INE002A01018', 'INE999A99999']), providerUniverse: new Set(['INE002A01018']) });
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), reg);
  eq(results[0].reason, 'NO_PROVIDER_ROW', 'provider');
});
// 5
test('5. proposed not counted as qualified', () => {
  const h = holding({ isin: 'INE040A01034', exchange: 'NSE', securityIdentity: { securityId: 'ISIN:INE040A01034:EQ', isin: 'INE040A01034', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const { results, summary } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].reason, 'PROPOSED_MAPPING_NOT_QUALIFIED', 'proposed reason');
  eq(results[0].result, 'UNRESOLVED', 'proposed unresolved');
  eq(results[0].mappingQualification, 'PROPOSED', 'proposed qual');
  eq(results[0].exactRegistryMatch, 'YES', 'proposed exact');
  eq(summary.holdingsWithQualifiedMappings, 0, 'qualified 0');
  eq(summary.holdingsWithProposedOnly, 1, 'proposed 1');
  eq(summary.coveragePercentage, 0, 'coverage 0');
});
// 6
test('6a. ambiguous invalid grammar', () => {
  const h = holding({ isin: 'INE002A01018', exchange: 'NSE', securityIdentity: { securityId: 'BAD-ID', isin: 'INE002A01018', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].reason, 'AMBIGUOUS_IDENTITY', 'bad grammar');
  eq(results[0].result, 'UNRESOLVED', 'amb unresolved');
});
test('6b. ambiguous ISIN mismatch', () => {
  const h = holding({ isin: 'INE002A01018', exchange: 'NSE', securityIdentity: { securityId: 'ISIN:INE040A01034:EQ', isin: 'INE040A01034', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].reason, 'AMBIGUOUS_IDENTITY', 'mismatch');
});
test('6c. identity not resolved', () => {
  const h = holding({ isin: 'INE002A01018', exchange: 'NSE', identityStatus: 'UNRESOLVED', securityIdentity: null });
  const pv = portfolioView([h]);
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].reason, 'IDENTITY_NOT_RESOLVED', 'unresolved');
});
// 7
test('7. same company different series rejected', () => {
  const h = holding({ isin: 'INE002A01018', exchange: 'NSE', securityIdentity: { securityId: 'ISIN:INE002A01018:BL', isin: 'INE002A01018', series: 'BL', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const reg = registrySnapshot({ qualifiedRegistry: new Set(['C-RL|NSE_EQ|ISIN:INE002A01018:EQ']) });
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), reg);
  eq(results[0].exactRegistryMatch, 'NO', 'series mismatch no match');
  eq(results[0].result, 'UNRESOLVED', 'rejected');
  includes(['NO_QUALIFIED_MAPPING', 'NO_QUALIFIED_MAPPING_EVIDENCE_LIMITED'], results[0].reason, 'reason');
});
// 8
test('8a. symbol match without ISIN does not resolve', () => {
  const h = holding({ isin: 'INE999A99999', exchange: 'NSE', symbol: 'RELIANCE', securityIdentity: { securityId: 'ISIN:INE999A99999:EQ', isin: 'INE999A99999', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].result, 'UNRESOLVED', 'symbol not match');
  eq(results[0].exactRegistryMatch, 'NO', 'symbol exact');
});
test('8b. company name similarity never matches', () => {
  const h = holding({ isin: 'INE999A99999', exchange: 'NSE', companyId: 'Reliance Industries Ltd', securityIdentity: { securityId: 'ISIN:INE999A99999:EQ', isin: 'INE999A99999', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].result, 'UNRESOLVED', 'company not match');
});
// 9
test('9. every input holding appears exactly once', () => {
  const holdings = [
    holding({ isin: 'INE002A01018', exchange: 'NSE' }),
    holding({ isin: undefined, exchange: 'NSE', securityIdentity: null, identityStatus: 'UNRESOLVED' }),
    holding({ isin: 'INE009A01021', exchange: 'NSE', securityIdentity: { securityId: 'ISIN:INE009A01021:EQ', isin: 'INE009A01021', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } }),
    holding({ isin: 'INE002A01018', exchange: 'NSE' }),
  ];
  const pv = portfolioView(holdings);
  const { results } = measureCoverage(holdings, new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results.length, 4, 'length');
  eq(new Set(results.map(r => r.holdingReference)).size, 4, 'unique refs');
  eq(results[0].holdingReference, 'holding:portfolio-1:0001', 'ref1');
  eq(results[1].holdingReference, 'holding:portfolio-1:0002', 'ref2');
  eq(results[3].holdingReference, 'holding:portfolio-1:0004', 'ref4');
  eq(results[0].isin, 'INE002A01018', 'dup1');
  eq(results[3].isin, 'INE002A01018', 'dup2');
});
test('9b. duplicates counted separately', () => {
  const holdings = [holding({ isin: 'INE002A01018' }), holding({ isin: 'INE002A01018' })];
  const pv = portfolioView(holdings, 'p1', 3);
  const { results, summary } = measureCoverage(holdings, new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results.length, 2, 'dup len');
  eq(summary.totalHoldings, 2, 'total');
  eq(results.filter(r => r.result === 'RESOLVED').length, 2, 'both resolved');
});
// 10
test('10. aggregate counts reconcile', () => {
  const holdings = [
    holding({ isin: 'INE002A01018', exchange: 'NSE' }),
    holding({ isin: undefined, exchange: 'NSE', securityIdentity: null, identityStatus: 'UNRESOLVED' }),
    holding({ isin: 'INE040A01034', exchange: 'NSE', securityIdentity: { securityId: 'ISIN:INE040A01034:EQ', isin: 'INE040A01034', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } }),
    holding({ isin: 'INE999Z99999', exchange: 'NSE', securityIdentity: { securityId: 'ISIN:INE999Z99999:EQ', isin: 'INE999Z99999', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } }),
  ];
  const pv = portfolioView(holdings);
  const reg = registrySnapshot({ p04Universe: new Set(['INE002A01018', 'INE040A01034']) });
  const { results, summary, gaps } = measureCoverage(holdings, new Map([[pv.portfolioId, pv]]), reg);
  const qualified = results.filter(r => r.mappingQualification === 'QUALIFIED').length;
  const proposed = results.filter(r => r.mappingQualification === 'PROPOSED').length;
  const unresolved = results.filter(r => r.result === 'UNRESOLVED').length;
  const missing = results.filter(r => r.persistedIdentityAvailability !== 'COMPLETE').length;
  eq(summary.holdingsWithQualifiedMappings, qualified, 'qual');
  eq(summary.holdingsWithProposedOnly, proposed, 'prop');
  eq(summary.unresolvedHoldings, unresolved, 'unres');
  eq(summary.missingIdentityCount, missing, 'missing');
  eq(summary.totalHoldings, results.length, 'total');
  eq(summary.coveragePercentage, Number(((qualified / results.length) * 100).toFixed(2)), 'pct');
  const gapSum = gaps.gaps.reduce((s, g) => s + g.count, 0);
  eq(gapSum, unresolved, 'gap sum');
  const reasonSum = Object.values(summary.unresolvedReasons).reduce((s, n) => s + n, 0);
  eq(reasonSum, unresolved, 'reason sum');
});
// 11
test('11. deterministic re-run', () => {
  const holdings = [holding({ isin: 'INE002A01018' }), holding({ isin: undefined, securityIdentity: null, identityStatus: 'UNRESOLVED' }), holding({ isin: 'INE040A01034', securityIdentity: { securityId: 'ISIN:INE040A01034:EQ', isin: 'INE040A01034', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } })];
  const pv = portfolioView(holdings);
  const reg = registrySnapshot();
  const first = measureCoverage(holdings, new Map([[pv.portfolioId, pv]]), reg);
  const second = measureCoverage(holdings, new Map([[pv.portfolioId, pv]]), reg);
  eq(JSON.stringify(first.results), JSON.stringify(second.results), 'results deterministic');
  eq(JSON.stringify(first.summary), JSON.stringify(second.summary), 'summary deterministic');
  eq(JSON.stringify(first.gaps), JSON.stringify(second.gaps), 'gaps deterministic');
  // Also hash
  const h1 = createHash('sha256').update(JSON.stringify(first.results)).digest('hex');
  const h2 = createHash('sha256').update(JSON.stringify(second.results)).digest('hex');
  eq(h1, h2, 'hash deterministic');
});
// privacy
test('privacy: maskIsin', () => {
  eq(maskIsin('INE002A01018'), 'INE***018', 'mask');
  eq(maskIsin(null), null, 'mask null');
});
test('privacy: sanitizeForPublication', () => {
  const h = holding({ isin: 'INE002A01018' });
  const pv = portfolioView([h]);
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  const sanitized = sanitizeForPublication(results);
  eq(sanitized[0].isin, null, 'sanitized null');
  eq(sanitized[0].maskedIsin, 'INE***018', 'masked');
  eq(results[0].isin, 'INE002A01018', 'original retained');
});
test('unsupported exchange', () => {
  const h = holding({ isin: 'INE002A01018', exchange: 'NYSE' });
  const pv = portfolioView([h]);
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), registrySnapshot());
  eq(results[0].reason, 'UNSUPPORTED_EXCHANGE', 'unsupported');
});
test('evidence-limited', () => {
  const h = holding({ isin: 'INE999A99999', exchange: 'NSE', securityIdentity: { securityId: 'ISIN:INE999A99999:EQ', isin: 'INE999A99999', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' } });
  const pv = portfolioView([h]);
  const reg = registrySnapshot({ p04Universe: undefined, providerUniverse: undefined });
  const { results } = measureCoverage([h], new Map([[pv.portfolioId, pv]]), reg);
  eq(results[0].reason, 'NO_QUALIFIED_MAPPING_EVIDENCE_LIMITED', 'limited');
});

console.log(`\n=== W-28 results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
else console.log('All 11 required conditions verified (synthetic fixtures, no owner data).');
