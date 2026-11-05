#!/usr/bin/env node
/**
 * Materialize the pinned `iips-broker-import` alias into `.cache/broker-import` (IRR-owned step).
 *
 * WHY THIS STEP EXISTS
 *   `src/api/brokerHoldingsPreview.ts` imports the IPD-owned broker ingress and the IPD-owned
 *   governed D05 security master from `.cache/broker-import/...`. At the previous alias pin
 *   (`70b24f0`, 2026-10-16) the IPD manifest declared no `files` field, so npm packed the whole
 *   repository and `tsc -p tsconfig.broker-import.json` compiled the alias's RAW TypeScript
 *   sources into `.cache/broker-import`. The merged PR #127 commit (`7bcae35`) carries the DB-C1
 *   package redesign, whose manifest declares `files: ["dist/package"]`: the installed alias now
 *   publishes ONLY built `.js` plus `.d.ts` artifacts, so the raw-source compile has no inputs and
 *   fails closed (`TS18003`). This step therefore materializes the PUBLISHED build output into the
 *   same `.cache/broker-import` layout the IRR consumer already imports from.
 *
 * WHAT IT DOES NOT DO
 *   - It does not compile, patch, transform or re-derive any IPD logic. It copies the pinned
 *     package's own published artifacts byte-for-byte.
 *   - It does not resolve identity, widen a namespace, bypass a gate or write holdings.
 *   - It performs no network I/O: everything it reads is already installed from the committed
 *     lockfile.
 *
 * FAIL-CLOSED GUARANTEES
 *   1. `package.json` and `package-lock.json` must both pin the alias to the exact 40-hex governed
 *      commit recorded in `broker-import-package-profile.json` — no floating specifier, no drift
 *      between manifest and lockfile.
 *   2. The installed alias must be resolvable and must publish `dist/package`.
 *   3. Every module in `requiredPublishedModules` must be present as BOTH `.js` and `.d.ts`.
 *   4. The materialized tree is rebuilt from scratch (no stale artifact from an earlier pin can
 *      survive), and a deterministic manifest records the pin, the file inventory and each file's
 *      SHA-256 so the guard test can re-verify what was actually materialized.
 *
 * Any failure exits non-zero with a static reason; `prebuild` / `pretest` / `pretypecheck` then
 * refuse to run, so a broken pin can never produce a green build or a green suite.
 */
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function fail(reason, detail) {
  process.stderr.write(`broker-import materialization refused: ${reason}${detail ? ` (${detail})` : ''}\n`);
  process.exit(1);
}

function readJson(path) {
  if (!existsSync(path)) fail('a required governance or manifest file is missing', relative(frontendRoot, path));
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    fail('a required governance or manifest file is not valid JSON', relative(frontendRoot, path));
  }
}

const profile = readJson(join(frontendRoot, 'broker-import-package-profile.json'));
const COMMIT_RE = /^[0-9a-f]{40}$/;

if (typeof profile.aliasCommit !== 'string' || !COMMIT_RE.test(profile.aliasCommit)) {
  fail('the governed alias commit in the package profile is not an exact 40-hex commit SHA');
}
if (profile.aliasSpecifier !== `github:${profile.aliasRepository}#${profile.aliasCommit}`) {
  fail('the governed alias specifier in the package profile does not match its own commit SHA');
}

// --- Guard 1: manifest and lockfile must both pin the exact governed commit -------------------
const manifest = readJson(join(frontendRoot, 'package.json'));
const manifestSpec = manifest?.dependencies?.[profile.aliasDependency];
if (manifestSpec !== profile.aliasSpecifier) {
  fail('package.json does not pin the broker-import alias to the governed commit', String(manifestSpec));
}

const lockfile = readJson(join(frontendRoot, 'package-lock.json'));
const lockRootSpec = lockfile?.packages?.['']?.dependencies?.[profile.aliasDependency];
if (lockRootSpec !== profile.aliasSpecifier) {
  fail('package-lock.json root does not pin the broker-import alias to the governed commit', String(lockRootSpec));
}
const lockEntry = lockfile?.packages?.[`node_modules/${profile.aliasDependency}`];
if (!lockEntry || typeof lockEntry.resolved !== 'string' || !lockEntry.resolved.endsWith(`#${profile.aliasCommit}`)) {
  fail('package-lock.json does not resolve the broker-import alias to the governed commit', String(lockEntry?.resolved));
}

// --- Guard 2: the installed alias must publish `dist/package` ---------------------------------
const installedRoot = join(frontendRoot, profile.installedRoot);
if (!existsSync(join(installedRoot, 'package.json'))) {
  fail('the broker-import alias is not installed; run the lockfile-exact install first', profile.installedRoot);
}
const publishedRoot = join(installedRoot, profile.publishedRoot);
if (!existsSync(publishedRoot)) {
  fail('the installed broker-import alias publishes no build output', profile.publishedRoot);
}

// --- Guard 3: every required module must publish both runtime and declaration artifacts -------
const missing = [];
for (const modulePath of profile.requiredPublishedModules) {
  for (const extension of ['.js', '.d.ts']) {
    const candidate = join(publishedRoot, `${modulePath}${extension}`);
    if (!existsSync(candidate)) missing.push(`${modulePath}${extension}`);
  }
}
if (missing.length > 0) {
  fail('the pinned broker-import alias does not publish required modules', missing.join(', '));
}

// --- Guard 4: rebuild the materialized tree from scratch --------------------------------------
const materializedRoot = join(frontendRoot, profile.materializedRoot);
rmSync(materializedRoot, { recursive: true, force: true });
mkdirSync(materializedRoot, { recursive: true });
cpSync(publishedRoot, materializedRoot, { recursive: true });

function inventory(root) {
  const seen = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const absolute = join(dir, entry);
      const stat = statSync(absolute);
      if (stat.isDirectory()) walk(absolute);
      else seen.push(absolute);
    }
  };
  walk(root);
  return seen.sort();
}

const files = inventory(materializedRoot).map((absolute) => {
  const bytes = readFileSync(absolute);
  return {
    path: relative(materializedRoot, absolute).split('\\').join('/'),
    bytes: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
});

const materializedManifest = {
  manifestSchema: 'IIPS_BROKER_IMPORT_MATERIALIZED_V1',
  aliasDependency: profile.aliasDependency,
  aliasRepository: profile.aliasRepository,
  aliasCommit: profile.aliasCommit,
  aliasSpecifier: profile.aliasSpecifier,
  publishedRoot: profile.publishedRoot,
  materializedRoot: profile.materializedRoot,
  consumedAs: 'published-build-output',
  rawSourcesCompiled: false,
  fileCount: files.length,
  requiredPublishedModules: [...profile.requiredPublishedModules].sort(),
  files,
};

writeFileSync(
  join(materializedRoot, 'BROKER-IMPORT-MATERIALIZED.json'),
  `${JSON.stringify(materializedManifest, null, 2)}\n`,
  'utf8',
);

process.stdout.write(
  `broker-import alias ${profile.aliasCommit} materialized: ${files.length} published files -> `
  + `${profile.materializedRoot} (published build output; no IPD source recompiled)\n`,
);
