import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { verifyBrowserBundle } from './verify-browser-bundle.mjs';

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'irr-browser-gate-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await mkdir(join(dir, 'assets'));
  await writeFile(join(dir, 'assets', 'app.js'), 'console.log("safe");');
  return dir;
}

test('clean browser output passes', async (t) => {
  const result = await verifyBrowserBundle(await fixture(t));
  assert.deepEqual(result.hits, []);
});

test('every prohibited class is rejected in emitted files, including source maps', async (t) => {
  const dir = await fixture(t);
  for (const forbidden of ['IIPS_MARKET_DATA_BASE_URL', 'IIPS_DHAN_BASE_URL', 'DhanApiClient',
    'MarketDataTransportClient', 'vault://synthetic', '-----BEGIN PRIVATE KEY-----',
    'http://user:password@example.test', 'password="syntheticsecret"', '"Bearer abcdefghijklmnop"',
    'node:sqlite', 'api.dhan.co', 'src/persistence/file']) {
    await writeFile(join(dir, 'assets', 'app.js.map'), forbidden);
    const result = await verifyBrowserBundle(dir);
    assert.ok(result.hits.some((hit) => hit.file.endsWith('.map')), 'forbidden fixture was accepted');
    const cli = spawnSync(process.execPath, ['scripts/verify-browser-bundle.mjs', dir], { encoding: 'utf8' });
    assert.equal(cli.status, 1);
    assert.ok(!cli.stderr.includes(forbidden), 'must not print matched secret material');
  }
});

test('missing JS and symlinks fail closed', async (t) => {
  const dir = await fixture(t);
  await rm(join(dir, 'assets', 'app.js'));
  await assert.rejects(verifyBrowserBundle(dir));
  await writeFile(join(dir, 'assets', 'app.js'), 'safe');
  await symlink(join(dir, 'assets', 'app.js'), join(dir, 'link'));
  await assert.rejects(verifyBrowserBundle(dir));
});
