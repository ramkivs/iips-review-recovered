/**
 * NP-06 Reports — R3 persistence integration against the REAL governed NP-04 store.
 *
 * Authority: `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (R3-Option B: second
 * dependency specifier `iips-np04-governed-persistence#2e11fa3b…`; the primary pin was left
 * unchanged by R3 and was later advanced independently by the CAP-03 DQ-4 reconciliation in
 * tracker §16.119).
 *
 * SCOPE — READ BEFORE READING A GREEN RESULT AS QUALIFICATION.
 *   This suite validates the five-operation persistence contract at the BINDING level, using
 *   TEST-ONLY owner pairs (`test-tenant-r3` / `test-owner-r3`). Those pairs are test data, not
 *   a production owner: R1 is SELECTED — NOT EFFECTIVE, no Reports owner source exists, and
 *   nothing here supplies one. This is not F-7: the F-7 durable leg is an HTTP-level,
 *   separate-process restart against an effective R1 + an R2 contract, and remains NOT
 *   SATISFIED. No transport, route, or UI is exercised or exposed by this file.
 *
 * @vitest-environment node
 */
import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { ReportsPersistence } from './persistence';
import {
  assertNp04PersistencePort,
  loadAuthoritativeNp04Persistence,
  NP04_BOUNDARY,
  NP04_DATABASE_PATH_ENV,
  PersistenceBoundaryError,
} from './persistence-port';
import { adaptNp04Store, resolveAuthoritativeNp04Port } from './np04-adapter';
import { composeReportContent } from './composition';

/** Test-only owner pairs. Never a production owner source (see header). */
const OWNER_A = { tenantId: 'test-tenant-r3', userId: 'test-owner-r3' } as const;
const OWNER_B = { tenantId: 'test-tenant-r3', userId: 'test-owner-foreign' } as const;
const GENERATED_AT = '2026-10-25T00:00:00.000Z';

const temporaryDirs: string[] = [];
const savedDbPath = process.env[NP04_DATABASE_PATH_ENV];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-reports-r3-'));
  temporaryDirs.push(dir);
  return dir;
}

function inputFor(value: number) {
  return {
    engineOutput: {
      reportId: 'report-portfolio-summary-P-R3',
      reportType: 'Portfolio Summary',
      portfolioId: 'P-R3',
      payload: { scenario: 'Base', value },
    },
    generatedAt: GENERATED_AT,
    parameters: { horizon: '12m' },
  } as const;
}

afterEach(() => {
  if (savedDbPath === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
  else process.env[NP04_DATABASE_PATH_ENV] = savedDbPath;
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('R3-Option B dependency surface', () => {
  it('admits exactly the decided second specifier and guards the reconciled primary and broker pins', () => {
    const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    const manifest = JSON.parse(fs.readFileSync(path.join(frontendRoot, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
    };
    expect(manifest.dependencies['iips-np04-governed-persistence']).toBe(
      'github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494',
    );
    expect(manifest.dependencies['iips-production-market-data']).toBe(
      'github:ramkivs/iips-production-market-data#8eec74ae27cda09f3c368b9c299895eae41554db',
    );
    expect(manifest.dependencies['iips-broker-import']).toBe(
      'github:ramkivs/iips-production-market-data#70b24f029842a7e9b7f615e4d9df7376fd4ff817',
    );
    expect(NP04_BOUNDARY.pinnedDependency).toBe('iips-np04-governed-persistence');
    expect(NP04_BOUNDARY.pinnedCommit).toBe('2e11fa3b689d1a3674a5e4ba1f1de9a559e20494');
    expect(NP04_BOUNDARY.authoritativeCommit).toBe('2e11fa3b689d1a3674a5e4ba1f1de9a559e20494');
    expect(NP04_BOUNDARY.persistedSubpathExported).toBe(true);
    expect(NP04_BOUNDARY.requiresAuthorizedChange).toEqual([]);
  });

  it('fails closed when no server-owned database path is configured', async () => {
    delete process.env[NP04_DATABASE_PATH_ENV];
    expect(await loadAuthoritativeNp04Persistence()).toBeNull();
    const resolution = await resolveAuthoritativeNp04Port();
    expect(resolution.available).toBe(false);
    expect(() => adaptNp04Store({})).toThrow(PersistenceBoundaryError);
    expect(() => assertNp04PersistencePort(null)).toThrow(PersistenceBoundaryError);
  });
});

describe('five-operation contract against the real governed store', () => {
  it('creates, resolves, queries, appends and chains — with cross-owner non-disclosure', () => {
    const dbPath = path.join(tempDir(), 'reports.db');
    const database = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
    try {
      const binding = new ReportsPersistence(adaptNp04Store(new GovernedArtifactStore(database)));

      // createInstance: instance identity is store-minted, content identity is deterministic.
      const first = binding.persistNew(OWNER_A, inputFor(1));
      expect(first.artifactVersion).toBe(1);
      expect(first.supersedesReportId).toBeNull();
      expect(first.reportKey).toMatch(/^[0-9a-f]{64}$/);
      expect(first.reportId.startsWith('report-')).toBe(false);
      expect(first.ownership).toEqual(OWNER_A);

      const duplicate = binding.persistNew(OWNER_A, inputFor(1));
      expect(duplicate.reportId).not.toBe(first.reportId);
      expect(duplicate.reportKey).toBe(first.reportKey);

      // resolveById + queryByOwner, scoped without existence disclosure across owners.
      expect(binding.resolve(OWNER_A, first.reportId).reportId).toBe(first.reportId);
      expect(() => binding.resolve(OWNER_B, first.reportId)).toThrow();
      expect(binding.queryByOwner(OWNER_A).items.map((a) => a.reportId)).toContain(first.reportId);
      expect(binding.queryByOwner(OWNER_B).items).toEqual([]);

      // appendVersion: only the current head may be superseded; chain is single-parent.
      const second = binding.appendVersion(OWNER_A, first.reportId, inputFor(2));
      expect(second.artifactVersion).toBe(2);
      expect(second.supersedesReportId).toBe(first.reportId);
      expect(() => binding.appendVersion(OWNER_A, first.reportId, inputFor(3))).toThrow();

      // listSupersededBy via the binding's verified chain view.
      const chain = binding.supersessionChain(OWNER_A, second.reportId);
      expect(chain.current.reportId).toBe(second.reportId);
      expect(chain.history.map((a) => a.reportId)).toEqual([first.reportId]);
      expect(() => binding.supersessionChain(OWNER_B, second.reportId)).toThrow();
    } finally {
      database.close();
    }
  });

  it('survives database close and reopen at the same server-owned path (persistence level)', () => {
    const dbPath = path.join(tempDir(), 'reports-reopen.db');
    let reportId = '';
    const firstDb = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
    try {
      const binding = new ReportsPersistence(adaptNp04Store(new GovernedArtifactStore(firstDb)));
      reportId = binding.persistNew(OWNER_A, inputFor(7)).reportId;
    } finally {
      firstDb.close();
    }

    // Independently verify persisted state after reopen — a new handle, a new store, a new binding.
    const secondDb = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
    try {
      const binding = new ReportsPersistence(adaptNp04Store(new GovernedArtifactStore(secondDb)));
      const reopened = binding.resolve(OWNER_A, reportId);
      expect(reopened.reportId).toBe(reportId);
      expect(reopened.artifactVersion).toBe(1);
      expect(binding.queryByOwner(OWNER_A).items.map((a) => a.reportId)).toContain(reportId);
    } finally {
      secondDb.close();
    }
  });

  it('resolves the admitted port through the runtime resolver when configured', async () => {
    process.env[NP04_DATABASE_PATH_ENV] = path.join(tempDir(), 'reports-resolver.db');
    const port = await loadAuthoritativeNp04Persistence();
    expect(port).not.toBeNull();
    const binding = new ReportsPersistence(port);
    const created = binding.persistNew(OWNER_A, inputFor(11));
    expect(binding.resolve(OWNER_A, created.reportId).reportKey).toBe(
      composeReportContent(inputFor(11)).reportKey,
    );
  });
});
