/* Dependency-free regression: real TypeScript serializer + real server validator.
 * Requires a Node release with node:module stripTypeScriptTypes transform support
 * (tested with Node 22.22). No HTTP listener, IPC, credentials, or database.
 * Run from the repository root:
 *   node --test frontend/scripts/broker-snapshot-payload.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const frontend = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('snapshot browser serialization is admitted by the real IRR validator', async () => {
  const temp = mkdtempSync(join(tmpdir(), 'iips-broker-shape-test-'));
  const originalFetch = globalThis.fetch;
  try {
    writeFileSync(join(temp, 'package.json'), '{"type":"module"}');
    function copyTransformed(source, destination) {
      const target = join(temp, destination);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, stripTypeScriptTypes(readFileSync(join(frontend, source), 'utf8'), { mode: 'transform' }));
    }
    copyTransformed('server/broker-import/brokerImportStage4.ts', 'server/broker-import/brokerImportStage4.js');
    copyTransformed('server/user-portfolio/ipcClient.ts', 'server/user-portfolio/ipcClient.js');
    copyTransformed('server/user-portfolio/userPortfolioContract.ts', 'server/user-portfolio/userPortfolioContract.js');
    copyTransformed('src/api/brokerImportStage4.ts', 'src/api/brokerImportStage4.js');
    // The source uses an extensionless import; keep that filename for Node ESM.
    copyTransformed('src/core/network/noAuthFetch.ts', 'src/core/network/noAuthFetch');
    const { validateStage4Request } = await import(pathToFileURL(join(temp, 'server/broker-import/brokerImportStage4.js')).href);
    const { commitBrokerImport } = await import(pathToFileURL(join(temp, 'src/api/brokerImportStage4.js')).href);
    let calls = 0;
    let captured;
    globalThis.fetch = async (url, init) => {
      calls++;
      captured = { url, body: JSON.parse(init.body), credentials: init.credentials };
      return new Response(JSON.stringify({ outcome: 'INVALID_REQUEST' }), { status: 400 });
    };
    const holding = {
      symbol: 'SYN', quantity: 1, averageBuyPrice: 1, currentPrice: 1, marketValue: 1,
      weightPercentage: 100, active: true, sourceBroker: 'DHAN', lineageDigest: '2'.repeat(64),
      dpQty: 1, availableQty: null, profitLoss: -5, pnlPercentage: -1,
    };
    const snapshot = {
      holdings: [holding], contentDigest: '1'.repeat(64), fileName: 'synthetic.csv',
      sourceBroker: 'DHAN', importedAt: '2026-11-08T09:15:00.000Z', mode: 'MERGE', fullSnapshot: true,
    };
    for (const preview of [null, { evaluated: 1, resolved: 1, unresolved: 0, ambiguous: 0 }]) {
      const request = { ...snapshot, portfolioId: 'SYNTHETIC', expectedRevision: 1, clientIdentityPreview: preview };
      await commitBrokerImport(request);
      assert.equal(captured.url, '/api/broker-import/SYNTHETIC/holdings');
      assert.equal(captured.credentials, 'omit');
      assert.deepEqual(captured.body, { ...snapshot, expectedRevision: 1 });
      assert.deepEqual(request.clientIdentityPreview, preview); // original UI state is unchanged
      assert.ok(validateStage4Request('SYNTHETIC', captured.body));
      assert.equal(validateStage4Request('SYNTHETIC', { ...captured.body, clientIdentityPreview: preview }), null);
      assert.equal(validateStage4Request('SYNTHETIC', { ...captured.body, unexpectedField: true }), null);
      assert.equal(validateStage4Request('SYNTHETIC', { ...captured.body, canonicalOwnerId: 'synthetic' }), null);
    }
    const approval = { approved: true, approvedBy: 'local-operator', approvedAt: '2026-11-21T12:00:00.000Z', summaryDigest: 'f'.repeat(64) };
    await commitBrokerImport({ ...snapshot, portfolioId: 'SYNTHETIC', expectedRevision: 1, clientIdentityPreview: null, partialAcceptance: approval });
    assert.ok(validateStage4Request('SYNTHETIC', captured.body));
    assert.deepEqual(captured.body.partialAcceptance, approval);
    const ordinary = { ...snapshot };
    delete ordinary.fullSnapshot;
    await commitBrokerImport({ ...ordinary, portfolioId: 'SYNTHETIC', expectedRevision: 0 });
    assert.deepEqual(captured.body, { ...ordinary, expectedRevision: 0 });
    assert.ok(validateStage4Request('SYNTHETIC', captured.body));
    await commitBrokerImport({ ...snapshot, portfolioId: 'SYNTHETIC', expectedRevision: 1, clientIdentityPreview: null, unexpectedField: true });
    assert.equal(captured.body.unexpectedField, true); // don't mask other invalid fields
    assert.equal(validateStage4Request('SYNTHETIC', captured.body), null);
    assert.equal(calls, 5); // exactly one mock request per operator submission
  } finally {
    globalThis.fetch = originalFetch;
    rmSync(temp, { recursive: true, force: true });
  }
});
