/**
 * W-10 — repository grep assertion.
 *
 * The roadmap's verification requirement: no `IIPS_DHAN_*` environment read remains anywhere
 * in IRR, and no health/status/verification source carries a `vault://` reference, a
 * `secretRefPointers` field, or a keyPath field name. These are not style preferences —
 * the first is the B-6 "second source of truth" elimination and the second is the D-7
 * disclosure policy (B-15), whose breach publishes credential-store metadata.
 *
 * The scan walks `server/`, `src/` and `scripts/` (excluding node_modules and build caches).
 * Exemptions are explicit and narrow:
 *   - `scripts/verify-browser-bundle.mjs` mentions the forbidden tokens only as a DENYLIST
 *     for the browser-bundle gate; it never reads configuration.
 *   - `server/market-data/w11Configuration.test.ts` (W-11 scope) passes EXPLICIT fixture maps
 *     to IPD's own resolver — it never reads the ambient environment. Every file, including
 *     that one, is additionally held to an ambient-read ban below.
 *   - Test files may carry the literal tokens as negative canaries (fixtures proving the
 *     payloads and surfaces refuse them). Non-test sources may never mention them.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCAN_ROOTS = ['server', 'src', 'scripts'] as const;
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const SKIP_DIRECTORIES = new Set(['node_modules', '.cache', 'dist', 'coverage']);

/**
 * Non-test sources permitted to mention the forbidden tokens. The only entry is a DENYLIST:
 * the browser-bundle gate that fails the build when a marker leaks into the emitted bundle.
 * It names the forbidden markers only to REJECT them, and it never reads configuration.
 */
const NON_TEST_TOKEN_ALLOWLIST = new Set<string>([
  join('scripts', 'verify-browser-bundle.mjs'),
]);

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (!SKIP_DIRECTORIES.has(entry)) yield* walk(full);
      continue;
    }
    const ext = entry.slice(entry.lastIndexOf('.'));
    if (SOURCE_EXTENSIONS.has(ext)) yield full;
  }
}

function isTestFile(rel: string): boolean {
  return /\.(test|spec)\.(ts|tsx|js|mjs|cjs)$/.test(rel);
}

const files: { rel: string; abs: string }[] = [];
for (const root of SCAN_ROOTS) {
  const absRoot = join(ROOT, root);
  for (const abs of walk(absRoot)) {
    files.push({ rel: abs.slice(ROOT.length + 1), abs });
  }
}

describe('W-10 repository grep assertion', () => {
  it('scans a meaningful number of files (sanity)', () => {
    expect(files.length).toBeGreaterThan(200);
  });

  it('no IRR source reads the ambient IIPS_DHAN_* environment', () => {
    // Ambient-read patterns, for every file INCLUDING the W-11 fixture allowlist file:
    // any direct read of the IIPS_DHAN_* namespace off the ambient environment object.
    const ambient = /process\.env\.IIPS_DHAN_|process\.env\[['"]IIPS_DHAN_/;
    for (const { rel, abs } of files) {
      expect(ambient.test(readFileSync(abs, 'utf8')), `${rel} reads ambient IIPS_DHAN_*`).toBe(false);
    }
  });

  it('no non-test IRR source mentions IIPS_DHAN_* at all', () => {
    for (const { rel, abs } of files) {
      if (isTestFile(rel)) continue;
      if (NON_TEST_TOKEN_ALLOWLIST.has(rel)) continue;
      expect(readFileSync(abs, 'utf8'), rel).not.toMatch(/IIPS_DHAN_/);
    }
  });

  it('no non-test IRR source mentions secretRefPointers', () => {
    for (const { rel, abs } of files) {
      if (isTestFile(rel)) continue;
      if (NON_TEST_TOKEN_ALLOWLIST.has(rel)) continue;
      expect(readFileSync(abs, 'utf8'), rel).not.toMatch(/secretRefPointers/i);
    }
  });

  it('no non-test IRR source mentions vault:// or a keyPath field name', () => {
    for (const { rel, abs } of files) {
      if (isTestFile(rel)) continue;
      if (NON_TEST_TOKEN_ALLOWLIST.has(rel)) continue;
      const content = readFileSync(abs, 'utf8');
      expect(content, rel).not.toMatch(/vault:\/\//i);
      expect(content, rel).not.toMatch(/accessTokenKeyPath/i);
      expect(content, rel).not.toMatch(/clientIdKeyPath/i);
    }
  });

  it('the pre-W-10 env-resolution boundary module is gone', () => {
    expect(existsSync(join(ROOT, 'server', 'market-data', 'dhanMarketDataRoute.ts'))).toBe(false);
    expect(existsSync(join(ROOT, 'server', 'market-data', 'dhanMarketDataRoute.test.ts'))).toBe(false);
  });

  it('the browser status surface carries no pointer surface', () => {
    // The component renders only what the validated client hands it; it never names a
    // pointer field, a vault reference or a keyPath. (The API client itself carries the
    // denylist by design and is unit-tested for fail-closed behaviour.)
    const html = readFileSync(join(ROOT, 'src', 'features', 'dhan', 'DhanConnectionStatus.tsx'), 'utf8');
    expect(html).not.toMatch(/secretRefPointers/i);
    expect(html).not.toMatch(/vault:\/\//i);
    expect(html).not.toMatch(/accessTokenKeyPath/i);
    expect(html).not.toMatch(/clientIdKeyPath/i);
    expect(html).not.toMatch(/missingKeys/i);
  });
});
