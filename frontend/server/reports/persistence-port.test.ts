/**
 * `G-11` hardening — the NP-04 boundary's open is an EXPLICIT, operation-specific decision.
 *
 * Recorded issue: `loadAuthoritativeNp04Persistence()` opened every store with `createDirectory:
 * true, migrate: true`, so a READ could create a database file, create its directory and run schema
 * migrations as a side effect of answering a question.
 *
 * These tests are executable, and they run WITHOUT the private `iips-np04-governed-persistence`
 * package being installed: the boundary resolves its module dynamically, so the loader takes an
 * optional module-resolution seam (`Np04LoaderOverrides`) that production never supplies. That is
 * what lets the exact `openDatabase` options and the fail-closed guards be asserted here rather than
 * argued from source inspection.
 *
 * WHAT THESE TESTS DO NOT CLAIM. They do not claim that NP-04's real `openDatabase` honours
 * `createDirectory: false` / `migrate: false` — that is NP-04's contract for its own options, and it
 * is exercised against the real package by `reports-persistence-integration.test.ts` in a
 * dependency-complete image. What is proven here is that this repository never asks it for anything
 * else on a read path, and never reaches it at all when the store is absent.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadAuthoritativeNp04Persistence,
  loadReadOnlyNp04Persistence,
  NP04_DATABASE_PATH_ENV,
  np04OpenOptions,
} from './persistence-port.js';

const SERVER_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');

interface Capture {
  options?: Record<string, unknown>;
  closed: number;
  imported: boolean;
}

interface Behaviour {
  readonly createFile?: string;
  readonly throwOnOpen?: boolean;
  readonly throwInStore?: boolean;
}

/** A stand-in for the authoritative module: the same shape, none of the storage. */
function standInModule(capture: Capture, behaviour: Behaviour = {}): () => Promise<Record<string, unknown>> {
  class StandInStore {
    constructor(_database: unknown) {
      if (behaviour.throwInStore === true) throw new Error('store construction failed');
    }
    createInstance(): object {
      return {};
    }
    appendVersion(): object {
      return {};
    }
    resolveById(): object {
      return {};
    }
    queryByOwner(): object {
      return { items: [], nextCursor: null };
    }
    listSupersededBy(): object {
      return { reportId: '', supersededBy: [], rootReportId: '' };
    }
  }
  return async () => {
    capture.imported = true;
    return {
      GovernedArtifactStore: StandInStore,
      openDatabase: (options: Record<string, unknown>) => {
        capture.options = options;
        if (behaviour.throwOnOpen === true) throw new Error('open failed');
        if (behaviour.createFile !== undefined) {
          // Mirrors what `createDirectory: true` authorises: the directory may come into existence
          // as part of the open, which is legal ONLY on the INITIALISE path.
          mkdirSync(dirname(behaviour.createFile), { recursive: true });
          writeFileSync(behaviour.createFile, 'stand-in-database');
        }
        return {
          close: () => {
            capture.closed += 1;
          },
        };
      },
    };
  };
}

function newCapture(): Capture {
  return { closed: 0, imported: false };
}

let workDir = '';
const savedPath = process.env[NP04_DATABASE_PATH_ENV];

beforeEach(() => {
  workDir = mkdtempSync(join(tmpdir(), 'iid-np04-intent-'));
});

afterEach(() => {
  if (savedPath === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
  else process.env[NP04_DATABASE_PATH_ENV] = savedPath;
  rmSync(workDir, { recursive: true, force: true });
});

describe('np04OpenOptions — the intent mapping', () => {
  it('READ never permits directory creation or migration', () => {
    expect(np04OpenOptions('READ')).toEqual({ createDirectory: false, migrate: false });
  });

  it('INITIALISE keeps the historical create-and-migrate behaviour', () => {
    expect(np04OpenOptions('INITIALISE')).toEqual({ createDirectory: true, migrate: true });
  });

  it('returns frozen values, so a caller cannot mutate the mapping', () => {
    expect(Object.isFrozen(np04OpenOptions('READ'))).toBe(true);
    expect(Object.isFrozen(np04OpenOptions('INITIALISE'))).toBe(true);
  });
});

describe('READ — a read cannot bring a store into existence', () => {
  it('fails closed on an absent path BEFORE importing the module or opening anything', async () => {
    const capture = newCapture();
    const missingDir = join(workDir, 'not-there');
    process.env[NP04_DATABASE_PATH_ENV] = join(missingDir, 'assessments.db');

    const port = await loadAuthoritativeNp04Persistence('READ', { importModule: standInModule(capture) });

    expect(port).toBeNull();
    // Not merely "created nothing": the module was never even resolved, so no handle was taken and
    // no schema was inspected.
    expect(capture.imported).toBe(false);
    expect(capture.options).toBeUndefined();
    expect(existsSync(missingDir)).toBe(false);
  });

  it('is what the DEFAULT call does — an omitted intent cannot acquire write powers', async () => {
    const capture = newCapture();
    const missingDir = join(workDir, 'default-not-there');
    process.env[NP04_DATABASE_PATH_ENV] = join(missingDir, 'assessments.db');

    const port = await loadAuthoritativeNp04Persistence(undefined, { importModule: standInModule(capture) });

    expect(port).toBeNull();
    expect(capture.imported).toBe(false);
    expect(existsSync(missingDir)).toBe(false);
  });

  it('the named read loader is the same READ intent (and fails closed with no path configured)', async () => {
    delete process.env[NP04_DATABASE_PATH_ENV];
    expect(await loadReadOnlyNp04Persistence()).toBeNull();
  });

  it('refuses a path that is a directory rather than a file', async () => {
    const capture = newCapture();
    process.env[NP04_DATABASE_PATH_ENV] = workDir;

    const port = await loadAuthoritativeNp04Persistence('READ', { importModule: standInModule(capture) });

    expect(port).toBeNull();
    expect(capture.imported).toBe(false);
  });

  it('opens an existing store with createDirectory:false, migrate:false and leaves the file untouched', async () => {
    const capture = newCapture();
    const dbPath = join(workDir, 'existing.db');
    writeFileSync(dbPath, 'existing-bytes');
    const before = statSync(dbPath);
    process.env[NP04_DATABASE_PATH_ENV] = dbPath;

    const port = await loadAuthoritativeNp04Persistence('READ', { importModule: standInModule(capture) });

    expect(port).not.toBeNull();
    expect(capture.options).toEqual({ path: dbPath, createDirectory: false, migrate: false });
    // The read did not rewrite, migrate or grow the file it was pointed at.
    expect(readFileSync(dbPath, 'utf8')).toBe('existing-bytes');
    const after = statSync(dbPath);
    expect(after.size).toBe(before.size);
    expect(after.mtimeMs).toBe(before.mtimeMs);
  });
});

describe('INITIALISE — the mint CLI keeps its ability to create and migrate', () => {
  it('opens with createDirectory:true, migrate:true and accepts the store the open created', async () => {
    const capture = newCapture();
    const dbPath = join(workDir, 'fresh', 'assessments.db');
    process.env[NP04_DATABASE_PATH_ENV] = dbPath;

    const port = await loadAuthoritativeNp04Persistence('INITIALISE', {
      importModule: standInModule(capture, { createFile: dbPath }),
    });

    expect(port).not.toBeNull();
    expect(capture.options).toEqual({ path: dbPath, createDirectory: true, migrate: true });
    expect(existsSync(dbPath)).toBe(true);
  });

  it('closes a half-constructed handle and fails closed when the store cannot be built', async () => {
    const capture = newCapture();
    const dbPath = join(workDir, 'broken', 'assessments.db');
    process.env[NP04_DATABASE_PATH_ENV] = dbPath;

    const port = await loadAuthoritativeNp04Persistence('INITIALISE', {
      importModule: standInModule(capture, { throwInStore: true }),
    });

    expect(port).toBeNull();
    expect(capture.closed).toBe(1);
  });
});

/* ------------------------------------------------------------------ *
 * Source fences — the property this change is about, enforced in code
 * ------------------------------------------------------------------ */

/** Comments discuss these symbols by name; only real code calls count. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function sourceFiles(dir: string, into: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, into);
    else if (entry.isFile() && full.endsWith('.ts') && !full.endsWith('.test.ts')) into.push(full);
  }
  return into;
}

describe('source fences', () => {
  it('no production module opens the boundary without stating its intent', () => {
    const offenders = sourceFiles(SERVER_ROOT)
      .filter((file) => !file.endsWith(join('reports', 'persistence-port.ts')))
      .filter((file) => /\bloadAuthoritativeNp04Persistence\(\s*\)/.test(stripComments(readFileSync(file, 'utf8'))))
      .map((file) => relative(SERVER_ROOT, file));
    expect(offenders).toEqual([]);
  });
});
