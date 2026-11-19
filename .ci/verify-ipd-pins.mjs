import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const frontend = resolve(root, 'frontend');
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const manifest = readJson(resolve(frontend, 'package.json'));
const lock = readJson(resolve(frontend, 'package-lock.json'));
const installedLock = readJson(resolve(frontend, 'node_modules/.package-lock.json'));

const pinned = {
  'iips-broker-import': '9d03a35b4d4d79972c466c2c8e45e8c9270524d4',
  'iips-np04-governed-persistence': '2e11fa3b689d1a3674a5e4ba1f1de9a559e20494',
  'iips-production-market-data': '1ce6a829a7ce65550356a0071c108a60f2d813be',
};

for (const [name, commit] of Object.entries(pinned)) {
  const spec = `github:ramkivs/iips-production-market-data#${commit}`;
  const resolved = `git+ssh://git@github.com/ramkivs/iips-production-market-data.git#${commit}`;
  const lockEntry = `node_modules/${name}`;

  assert.equal(manifest.dependencies[name], spec, `${name}: package.json pin changed`);
  assert.equal(lock.packages[lockEntry]?.resolved, resolved, `${name}: committed lock pin changed`);
  assert.equal(installedLock.packages[lockEntry]?.resolved, resolved, `${name}: installed commit differs`);
  assert.ok(existsSync(resolve(frontend, lockEntry, 'package.json')), `${name}: package was not installed`);

  console.log(`Verified ${name} at ${commit}`);
}
