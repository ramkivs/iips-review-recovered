/** NP-18 R3: actual composed transport -> unchanged client -> actual App routes -> DOM.
 * Run from repository root:
 * NODE_ENV=test frontend/node_modules/.bin/tsx evidence/integration/np18-r3/2026-10-16/verify-views.mts
 * Local, ephemeral, credential-free SNAPSHOT observation; no product handlers or fixture data.
 * Vite transforms the real TSX; jsdom is not a manual browser or deployed-host observation.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { server } from '../../../../frontend/server/executive-transport.ts';

assert.equal(process.env.NODE_ENV, 'test', 'Prevent automatic product listener');
const frontend = fileURLToPath(new URL('../../../../frontend/', import.meta.url));
const require = createRequire(frontend + 'package.json');
const { JSDOM } = require('jsdom');
const { createServer } = require('vite');
const realFetch = globalThis.fetch;
const requests: { path: string; credentials: RequestCredentials | undefined; authorization: boolean }[] = [];
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
assert.ok(address && typeof address !== 'string');
const base = `http://127.0.0.1:${address.port}`;
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: base });
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'Node', 'MutationObserver']) {
  Object.defineProperty(globalThis, name, { value: dom.window[name], configurable: true, writable: true });
}
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const React = require('react');
const { render, screen, within, cleanup } = require('@testing-library/react');
const { MemoryRouter } = require('react-router-dom');
let vite: any;
try {
  const res = await realFetch(base + '/api/cross-sector', { credentials: 'omit' });
  assert.equal(res.status, 200);
  const cross = await res.json() as any;
  assert.equal(cross.provenance.freshness, 'SNAPSHOT');
  assert.equal(cross.portfolio.holdings, 13);
  assert.equal(cross.ranking.length, 13);
  assert.equal(cross.opportunity.length, 10);
  assert.deepEqual(cross.opportunity, cross.ranking.slice(0, 10));
  const executive = await (await realFetch(base + '/api/executive')).json() as any;
  const portfolio = await (await realFetch(base + '/api/portfolio')).json() as any;
  assert.deepEqual(cross.ranking, executive.ranking);
  assert.deepEqual(cross.opportunity, portfolio.opportunity);

  // Resolve only the same-origin URL for this Node diagnostic; production client is unchanged.
  globalThis.fetch = (input, init) => {
    const path = String(input);
    const authorization = new Headers(init?.headers).has('authorization');
    requests.push({ path, credentials: init?.credentials, authorization });
    assert.equal(path, '/api/cross-sector', 'Dedicated views must not introduce another endpoint');
    assert.equal(init?.credentials, 'omit');
    assert.equal(authorization, false);
    return realFetch(new URL(path, base), init);
  };
  vite = await createServer({ root: frontend, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  const { App } = await vite.ssrLoadModule('/src/app/App.tsx');
  const observations: Record<string, unknown> = {};
  for (const [kind, title, rows] of [
    ['rankings', 'Rankings', cross.ranking],
    ['opportunities', 'Opportunities', cross.opportunity],
    ['risks', 'Risks', null],
  ] as const) {
    render(React.createElement(MemoryRouter, {
      initialEntries: [`/intelligence/${kind}`],
      future: { v7_startTransition: true, v7_relativeSplatPath: true },
    }, React.createElement(App)));
    await screen.findByTestId(`${kind}-provenance`);
    assert.ok(screen.getByRole('heading', { name: title }));
    assert.equal(screen.queryByTestId('shell-feature-unavailable'), null);
    assert.ok(screen.getByTestId('nav-group-Intelligence'));
    assert.equal(screen.queryByRole('link', { name: 'Intelligence' }), null);
    const section = screen.getByRole('region', { name: `Intelligence ${kind}` });
    assert.equal(within(section).getByRole('link', { name: 'Cross-Sector' }).getAttribute('href'), '/research/cross-sector');
    const provenance = screen.getByTestId(`${kind}-provenance`).textContent;
    assert.equal(provenance, `${cross.provenance.dataSource} · freshness ${cross.provenance.freshness} · mapping ${cross.provenance.transportSemantics} · calibrated ${cross.provenance.calibratedAt}`);
    if (rows) {
      const table = within(section).getByTestId('data-table');
      const actualRows = [...table.querySelectorAll('tbody tr')].map((tr: any) =>
        [...tr.querySelectorAll('td')].map((td: any) => td.textContent));
      const expectedRows = rows.map((row: any) => [row.companyId, row.sector,
        row.conviction == null ? 'unavailable' : String(row.conviction)]);
      assert.deepEqual(actualRows, expectedRows, 'Exact payload order and scores, no derived rank');
      assert.deepEqual([...table.querySelectorAll('thead th')].map((th: any) => th.textContent),
        ['Company', 'Sector', 'Certified Conviction']);
      observations[kind] = { rows: actualRows.length, exactOrderAndValues: true, provenance };
    } else {
      assert.equal(within(section).getByTestId('metric-value').textContent,
        cross.portfolio.avgRisk == null ? 'unavailable' : String(cross.portfolio.avgRisk));
      assert.equal(within(section).queryAllByTestId('metric-card').length, 1);
      assert.equal(within(section).queryByRole('table'), null);
      for (const [id, values, empty] of [
        ['diversification-flags', cross.diversification.flags, 'No certified diversification flags'],
        ['correlation-flags', cross.correlation.flags, 'No certified correlation flags'],
        ['concentration-sectors', cross.correlation.concentrationSectors, 'No certified concentration sectors'],
      ] as const) {
        const actual = [...screen.getByTestId(`risks-${id}`).querySelectorAll('li')].map((li: any) => li.textContent);
        assert.deepEqual(actual, values.length ? values : [empty]);
      }
      for (const row of cross.ranking) assert.ok(!section.textContent.includes(row.companyId));
      observations.risks = { aggregateOnly: true, avgRisk: cross.portfolio.avgRisk,
        diversificationFlags: cross.diversification.flags, correlationFlags: cross.correlation.flags,
        concentrationSectors: cross.correlation.concentrationSectors, provenance };
    }
    for (const child of ['Opportunities', 'Risks', 'Rankings']) {
      const matchingLinks = screen.getAllByRole('link', { name: child });
      assert.ok(matchingLinks.some((link: any) => link.getAttribute('href') === `/intelligence/${child.toLowerCase()}`));
    }
    cleanup();
  }
  assert.equal(requests.length, 3);
  const negativeEndpoints: Record<string, number> = {};
  for (const path of ['/api/opportunities', '/api/risks', '/api/rankings', '/api/cross-sector?topN=13']) {
    const response = await realFetch(base + path);
    assert.equal(response.status, 404);
    negativeEndpoints[path] = response.status;
  }
  console.log(JSON.stringify({ status: 'PASS', locus: 'local actual composed transport and App routes rendered through Vite/jsdom',
    dataKind: 'existing certified SNAPSHOT reference set; no test fixture substitutions',
    sameSliceTop10Of13: true, existingExecutivePortfolioSlicesUnchanged: true,
    observations, requests, negativeEndpoints,
    limitations: ['Not a deployed-host or manual-browser observation.',
      'No live market or broker-data claim.', 'Not qualification, admission, release or production authority.'] }, null, 2));
} finally {
  cleanup();
  globalThis.fetch = realFetch;
  if (vite) await vite.close();
  dom.window.close();
  await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve()));
}
