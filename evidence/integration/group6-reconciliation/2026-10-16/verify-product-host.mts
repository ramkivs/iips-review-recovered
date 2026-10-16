/** Targeted Group 6 observation of the actual composed product transport, not a replica route table.
 * Run from repository root: NODE_ENV=test frontend/node_modules/.bin/tsx evidence/integration/group6-reconciliation/2026-10-16/verify-product-host.mts
 * No dedicated screens, new product routes, external services, credentials or data writes.
 */
import assert from 'node:assert/strict';
import { server } from '../../../../frontend/server/executive-transport.ts';

assert.equal(process.env.NODE_ENV, 'test', 'Prevent automatic product listener; use an ephemeral test port');
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
assert.ok(address && typeof address !== 'string');
const base = `http://127.0.0.1:${address.port}`;
const observations: Record<string, unknown> = {};
try {
  const payloads: Record<string, any> = {};
  for (const path of ['/api/executive', '/api/portfolio', '/api/cross-sector']) {
    const res = await fetch(base + path);
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    payloads[path] = body;
    assert.equal(body.portfolio.holdings, 13);
    assert.equal(body.provenance.freshness, 'SNAPSHOT');
    assert.equal(body.opportunity.length, 10);
    assert.equal(typeof body.portfolio.avgRisk, 'number');
    observations[path] = { status: res.status, referenceHoldings: body.portfolio.holdings,
      ranking: body.ranking?.length ?? null, opportunities: body.opportunity.length,
      avgRisk: body.portfolio.avgRisk, correlation: body.correlation,
      diversification: body.diversification, provenance: body.provenance };
  }
  const cross = payloads['/api/cross-sector'];
  assert.equal(cross.ranking.length, 13);
  assert.equal(payloads['/api/executive'].ranking.length, 13);
  assert.deepEqual(cross.opportunity, cross.ranking.slice(0, 10));
  assert.deepEqual(cross.ranking, payloads['/api/executive'].ranking);
  assert.deepEqual(cross.opportunity, payloads['/api/portfolio'].opportunity);
  for (let i = 1; i < cross.ranking.length; i++) {
    const a = cross.ranking[i - 1], b = cross.ranking[i];
    assert.ok(a.conviction > b.conviction || (a.conviction === b.conviction && a.sector <= b.sector));
  }
  const holdings = payloads['/api/portfolio'].holdings;
  assert.equal(holdings.length, 13);
  assert.ok(holdings.every((h: any) => typeof h.risk === 'number'));
  observations.portfolioRowRisk = { count: holdings.length, numeric: true, gradedRiskList: false };
  const again = await (await fetch(base + '/api/cross-sector')).json();
  assert.deepEqual(again, cross);
  for (const path of ['/api/opportunities', '/api/risks', '/api/rankings', '/api/cross-sector?topN=13']) {
    const res = await fetch(base + path);
    observations[path] = { status: res.status };
    assert.equal(res.status, 404);
  }
  console.log(JSON.stringify({ status: 'PASS', locus: 'local actual composed product server, ephemeral port',
    implementationChanged: false, observations, limitations: [
      'No externally deployed host or manual browser observation was available.',
      'SNAPSHOT reference set, not live market breadth or personal broker holdings.',
      'No dedicated-screen implementation or orphan qualification rerun.'
    ] }, null, 2));
} finally {
  await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve()));
}
