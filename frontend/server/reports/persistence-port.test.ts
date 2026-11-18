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
  countOpenNp04Databases,
  loadAuthoritativeNp04Persistence,
  loadReadOnlyNp04Persistence,
  NP04_DATABASE_PATH_ENV,
  np04OpenOptions,
  PersistenceBoundaryError,
  releaseAllNp04Databases,
  releaseNp04DatabasesUnderDirectory,
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
  /** The handle refuses to close, so release must REPORT it rather than swallow it. */
  readonly throwOnClose?: boolean;
  /** The handle exposes no `close` at all. */
  readonly noClose?: boolean;
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
        if (behaviour.noClose === true) return {};
        return {
          close: () => {
            if (behaviour.throwOnClose === true) throw new Error('close refused');
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
  // Same ordering the affected suites now use: dispose what the resolver opened, then delete.
  // A handle that refuses to close is reported here rather than left to lock the directory.
  try {
    releaseAllNp04Databases();
  } catch (error) {
    if (!(error instanceof PersistenceBoundaryError)) throw error;
  }
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
 * Deterministic release — the Windows `EBUSY` lifecycle, proven here
 *
 * The resolver opens a database handle per call and hands it to the caller inside a validated
 * port. Nothing in the five-operation port says who closes it, so the resolver records what it
 * opened. These tests use the SAME stand-in seam the intent tests use: no private package, no
 * database engine — only the handle lifecycle this repository owns.
 * ------------------------------------------------------------------ */

async function openAt(
  dbPath: string,
  behaviour: { readonly throwOnClose?: boolean; readonly noClose?: boolean } = {},
): Promise<Capture> {
  const capture = newCapture();
  mkdirSync(dirname(dbPath), { recursive: true });
  writeFileSync(dbPath, 'stand-in-database');
  process.env[NP04_DATABASE_PATH_ENV] = dbPath;
  const port = await loadAuthoritativeNp04Persistence('READ', {
    importModule: standInModule(capture, behaviour),
  });
  expect(port, `the stand-in store at ${dbPath} must resolve`).not.toBeNull();
  return capture;
}

describe('deterministic release of resolver-opened database handles', () => {
  it('counts a handle the resolver opened, and closes exactly the handles under the given directory', async () => {
    const before = countOpenNp04Databases();
    const first = await openAt(join(workDir, 'scope-a', 'one.db'));
    const second = await openAt(join(workDir, 'scope-b', 'two.db'));
    expect(countOpenNp04Databases()).toBe(before + 2);

    expect(releaseNp04DatabasesUnderDirectory(join(workDir, 'scope-a'))).toBe(1);
    expect(first.closed).toBe(1);
    // The handle in the sibling directory is NOT this caller's to close.
    expect(second.closed).toBe(0);
    expect(countOpenNp04Databases()).toBe(before + 1);
  });

  it('is idempotent: a second release of the same scope closes nothing further', async () => {
    await openAt(join(workDir, 'idem', 'one.db'));
    expect(releaseNp04DatabasesUnderDirectory(join(workDir, 'idem'))).toBe(1);
    expect(releaseNp04DatabasesUnderDirectory(join(workDir, 'idem'))).toBe(0);
  });

  it('closes a nested store several directories below the released root', async () => {
    const capture = await openAt(join(workDir, 'deep', 'nested', 'store', 'three.db'));
    expect(releaseNp04DatabasesUnderDirectory(workDir)).toBeGreaterThanOrEqual(1);
    expect(capture.closed).toBe(1);
  });

  it('does not treat a sibling directory that merely shares a name prefix as contained', async () => {
    const sibling = `${workDir}-sibling`;
    const capture = await openAt(join(sibling, 'four.db'));
    try {
      expect(releaseNp04DatabasesUnderDirectory(workDir)).toBe(0);
      expect(capture.closed).toBe(0);
    } finally {
      releaseNp04DatabasesUnderDirectory(sibling);
      rmSync(sibling, { recursive: true, force: true });
    }
  });

  it('releases every tracked handle wherever it was opened', async () => {
    const first = await openAt(join(workDir, 'all-a', 'five.db'));
    const second = await openAt(join(workDir, 'all-b', 'six.db'));
    const released = releaseAllNp04Databases();
    expect(released).toBeGreaterThanOrEqual(2);
    expect(first.closed).toBe(1);
    expect(second.closed).toBe(1);
    expect(countOpenNp04Databases()).toBe(0);
  });

  it('reports a close failure with the offending path instead of suppressing it, and keeps counting the handle', async () => {
    const before = countOpenNp04Databases();
    const dbPath = join(workDir, 'stubborn', 'seven.db');
    await openAt(dbPath, { throwOnClose: true });

    let raised: unknown = null;
    try {
      releaseNp04DatabasesUnderDirectory(join(workDir, 'stubborn'));
    } catch (error) {
      raised = error;
    }
    expect(raised).toBeInstanceOf(PersistenceBoundaryError);
    const detail = (raised as PersistenceBoundaryError).detail as { failures: readonly string[] };
    expect(detail.failures).toHaveLength(1);
    expect(detail.failures[0]).toContain(dbPath);
    expect(detail.failures[0]).toContain('close refused');
    // A handle that refused to close is still open: the count must not lie about disposal.
    expect(countOpenNp04Databases()).toBe(before + 1);
  });

  it('treats a dependency handle with no close operation as released rather than pretending to close it', async () => {
    const before = countOpenNp04Databases();
    await openAt(join(workDir, 'noclose', 'eight.db'), { noClose: true });
    expect(countOpenNp04Databases()).toBe(before + 1);
    expect(releaseNp04DatabasesUnderDirectory(join(workDir, 'noclose'))).toBe(1);
    expect(countOpenNp04Databases()).toBe(before);
  });

  it('never tracks a half-constructed handle: the failed composition already closed it', async () => {
    const capture = newCapture();
    const dbPath = join(workDir, 'broken-tracking', 'nine.db');
    process.env[NP04_DATABASE_PATH_ENV] = dbPath;
    const before = countOpenNp04Databases();

    const port = await loadAuthoritativeNp04Persistence('INITIALISE', {
      importModule: standInModule(capture, { createFile: dbPath, throwInStore: true }),
    });

    expect(port).toBeNull();
    expect(capture.closed).toBe(1);
    expect(countOpenNp04Databases()).toBe(before);
  });

  it('refuses a blank directory argument rather than releasing everything by accident', () => {
    expect(() => releaseNp04DatabasesUnderDirectory('')).toThrow(PersistenceBoundaryError);
    expect(() => releaseNp04DatabasesUnderDirectory('   ')).toThrow(PersistenceBoundaryError);
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
