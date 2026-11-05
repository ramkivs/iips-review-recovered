/**
 * IID-0 — standing constraints, enforced as tests rather than asserted in prose.
 *
 * AC-X2 (zero external network connections) and the architectural boundaries are checked statically over
 * the IID source tree: if a future change adds a socket, a SQLite handle, an NP-04 dependency or a frozen
 * sector engine import, this test fails.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(__dirname, '..', '..', 'src', 'investment');

function sourceFiles(dir: string = SRC): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...sourceFiles(path));
    else if (entry.endsWith('.ts')) found.push(path);
  }
  return found;
}

const files = sourceFiles();
const sources = files.map((file) => ({ file: relative(SRC, file), text: readFileSync(file, 'utf8') }));

const NETWORK_TOKENS = [
  "from 'node:http'",
  'from "node:http"',
  "from 'node:https'",
  "from 'node:net'",
  "from 'node:dgram'",
  "from 'node:tls'",
  "require('node:http')",
  "from 'axios'",
  "from 'node-fetch'",
  "from 'undici'",
];

describe('AC-X2 — no external network', () => {
  test('no IID module imports a network transport', () => {
    for (const { file, text } of sources) {
      for (const token of NETWORK_TOKENS) {
        assert.equal(text.includes(token), false, `${file} must not import ${token}`);
      }
    }
  });

  test('no IID module calls fetch', () => {
    for (const { file, text } of sources) {
      assert.equal(/(^|[^.\w])fetch\s*\(/.test(text), false, `${file} must not call fetch()`);
    }
  });

  test('no IID module embeds an http(s) URL as a request target', () => {
    for (const { file, text } of sources) {
      const urls = text.match(/https?:\/\/[^\s'")]+/g) ?? [];
      const nonNamespace = urls.filter((url) => !url.startsWith('http://www.w3.org') && !url.startsWith('http://www.xbrl.org'));
      assert.deepEqual(nonNamespace, [], `${file} must not reference an endpoint`);
    }
  });
});

describe('boundaries', () => {
  test('no IID module opens a database or imports a persistence driver', () => {
    for (const { file, text } of sources) {
      assert.equal(/sqlite|better-sqlite3|node:sqlite/i.test(text), false, `${file} must not touch SQLite`);
    }
  });

  test('no IID module depends on NP-04, the Reports layer, or the frozen sector engines', () => {
    for (const { file, text } of sources) {
      const imports = [...text.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1]!);
      for (const specifier of imports) {
        assert.ok(
          specifier.startsWith('.') || specifier.startsWith('node:'),
          `${file} imports "${specifier}", which leaves the IID module boundary`,
        );
        assert.equal(
          /sector-engines|frontend\/|reports\/|np04|governed-persistence/i.test(specifier),
          false,
          `${file} must not import "${specifier}"`,
        );
      }
    }
  });

  test('every IID source file is accounted for', () => {
    assert.ok(files.length >= 15, `expected the IID tree to be populated, found ${files.length} files`);
  });
});
