/**
 * IID-3 — operator CLI tests.
 *
 * The CLI is the ONLY way an investment artifact is created or versioned. These tests drive it end to end
 * against a real store in a temporary directory:
 *
 *   create → re-run (UNCHANGED) → changed input (version 2) → both versions readable
 *
 * The fail-closed paths matter as much as the happy path: no owner context, no boundary, no dataset and no
 * identity sources must each stop the run with a machine-readable reason and leave the store untouched.
 *
 * @vitest-environment node
 */
import { afterAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { runCli, writeSummary, type CliSummary } from './generate-investment-artifacts';
import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { loadAuthoritativeNp04Persistence } from '../../reports/persistence-port';
import { createInvestmentArtifactService } from '../investmentArtifacts';
import { M1_ISSUER_ID } from '../demo/m1Data';
import { M1_NOW, M1_NOW_V2, prepareM1Environment } from '../demo/m1Pipeline';

const env = prepareM1Environment();
afterAll(() => env.cleanup());

function baseArgs(overrides: { readonly datasetDir?: string; readonly generatedAt?: string; readonly dbPath?: string } = {}): string[] {
  return [
    '--issuer',
    M1_ISSUER_ID,
    '--data-dir',
    overrides.datasetDir ?? env.datasetV1Dir,
    '--identity-dir',
    env.identityDir,
    '--db',
    overrides.dbPath ?? env.dbPath,
    '--owner-carrier',
    env.carrierPath,
    '--generated-at',
    overrides.generatedAt ?? M1_NOW,
  ];
}

function steps(summary: CliSummary): Record<string, string> {
  return Object.fromEntries(summary.steps.map((step) => [step.step, step.status]));
}

function rowCount(dbPath: string): number {
  if (!existsSync(dbPath)) return 0;
  const database = openDatabase({ path: dbPath, createDirectory: false, migrate: false });
  try {
    const port = createInvestmentArtifactService({
      port: (() => {
        const store = new GovernedArtifactStore(database);
        // Reuse the production adapter shape rather than reaching for SQL in a test.
        return {
          createInstance: store.createInstance.bind(store),
          appendVersion: store.appendVersion.bind(store),
          resolveById: store.resolveById.bind(store),
          queryByOwner: store.queryByOwner.bind(store),
          listSupersededBy: store.listSupersededBy.bind(store),
        };
      })(),
      owner: { tenantId: 'irr-reports-personal', userId: 'owner-irr-reports-personal' },
    });
    return port.inventory().reduce((total, entry) => total + entry.versionCount, 0);
  } finally {
    (database as { close?: () => void }).close?.();
  }
}

describe('the documented sequence runs end to end', () => {
  it('creates version 1 from a snapshot, with every step recorded', async () => {
    const { exitCode, summary } = await runCli(baseArgs());
    expect(exitCode).toBe(0);
    expect(summary.status).toBe('OK');
    expect(summary.failure).toBeNull();
    expect(steps(summary)).toMatchObject({
      snapshot: 'OK',
      identity: 'OK',
      assessment: 'OK',
      compose: 'OK',
      validate: 'OK',
      'chain-head': 'OK',
      compare: 'SKIPPED',
      persist: 'OK',
      verify: 'OK',
    });
    expect(summary.identity).toMatchObject({ state: 'RESOLVED', issuerId: M1_ISSUER_ID });
    expect(summary.dataset).toMatchObject({ datasetClass: 'SYNTHETIC_REFERENCE' });
    expect(summary.artifact).toMatchObject({ outcome: 'CREATED', wrote: true, artifactVersion: 1, versionCount: 1 });
    expect(summary.chain?.versionCount).toBe(1);
    expect(summary.artifact?.scopeToken).toBe(`co:${M1_ISSUER_ID}`);
    expect(summary.limitations.some((entry) => entry.startsWith('L-009'))).toBe(true);
  });

  it('reports UNCHANGED and writes nothing when the same inputs are re-run', async () => {
    const before = rowCount(env.dbPath);
    const { exitCode, summary } = await runCli(baseArgs());
    expect(exitCode).toBe(0);
    expect(summary.artifact).toMatchObject({ outcome: 'UNCHANGED', wrote: false, versionCount: 1 });
    expect(steps(summary).compare).toBe('OK');
    expect(steps(summary).persist).toBe('OK');
    expect(rowCount(env.dbPath)).toBe(before);
  });

  it('appends version 2 in the SAME chain when the input changes, and version 1 stays readable', async () => {
    const first = await runCli(baseArgs());
    const firstDigest = first.summary.artifact!.payloadDigest;

    const second = await runCli(baseArgs({ datasetDir: env.datasetV2Dir, generatedAt: M1_NOW_V2 }));
    expect(second.exitCode).toBe(0);
    expect(second.summary.artifact).toMatchObject({ outcome: 'APPENDED', wrote: true, artifactVersion: 2, versionCount: 2 });
    expect(second.summary.artifact?.reportKey).toBe(first.summary.artifact?.reportKey);
    expect(second.summary.artifact?.chainRootReportId).toBe(first.summary.artifact?.chainRootReportId);
    expect(second.summary.artifact?.payloadDigest).not.toBe(firstDigest);
    // The chain view the CLI prints still carries version 1, unchanged.
    expect(second.summary.chain?.versions[0]?.payloadDigest).toBe(firstDigest);

    // Independently readable, through the same boundary the transport uses.
    process.env['IIPS_NP04_DATABASE_PATH'] = env.dbPath;
    try {
      const port = await loadAuthoritativeNp04Persistence();
      const service = createInvestmentArtifactService({
        port,
        owner: { tenantId: 'irr-reports-personal', userId: 'owner-irr-reports-personal' },
      });
      const chain = service.readChain(`co:${M1_ISSUER_ID}`);
      expect(chain.versionCount).toBe(2);
      expect(chain.versions[0]!.payloadDigest).toBe(firstDigest);
      expect(chain.versions[1]!.payloadDigest).toBe(second.summary.artifact?.payloadDigest);
    } finally {
      delete process.env['IIPS_NP04_DATABASE_PATH'];
    }
  });
});

describe('fail-closed paths write nothing', () => {
  it('stops before touching the store when no owner context is established', async () => {
    const freshDb = join(env.root, 'no-owner.db');
    const { exitCode, summary } = await runCli([
      ...baseArgs({ dbPath: freshDb }).slice(0, 6),
      '--db',
      freshDb,
      '--owner-carrier',
      join(env.root, 'absent-carrier.json'),
      '--generated-at',
      M1_NOW,
    ]);
    expect(exitCode).toBe(1);
    expect(summary.failure?.code).toBe('OWNER_CONTEXT_UNAVAILABLE');
    expect(existsSync(freshDb)).toBe(false);
  });

  it('stops with PERSISTENCE_UNAVAILABLE when the boundary cannot be resolved', async () => {
    const freshDb = join(env.root, 'no-boundary.db');
    const { exitCode, summary } = await runCli(baseArgs({ dbPath: freshDb }), { loadPort: async () => null });
    expect(exitCode).toBe(1);
    expect(summary.failure?.code).toBe('PERSISTENCE_UNAVAILABLE');
    expect(summary.artifact).toBeNull();
    expect(existsSync(freshDb)).toBe(false);
  });

  it('stops when the dataset snapshot is missing or unreadable', async () => {
    const { exitCode, summary } = await runCli(baseArgs({ datasetDir: join(env.root, 'no-such-dataset') }));
    expect(exitCode).toBe(1);
    expect(summary.failure?.code).toBe('DATASET_UNAVAILABLE');
  });

  it('stops when the identity sources are missing', async () => {
    const args = baseArgs();
    args[args.indexOf('--identity-dir') + 1] = join(env.root, 'no-such-identity');
    const { exitCode, summary } = await runCli(args);
    expect(exitCode).toBe(1);
    expect(summary.failure?.code).toBe('IDENTITY_SOURCES_MISSING');
  });

  it('stops when the requested issuer is not in the roster', async () => {
    const args = baseArgs();
    args[args.indexOf('--issuer') + 1] = 'IN:EQISIN:IN0000000045';
    const { exitCode, summary } = await runCli(args);
    expect(exitCode).toBe(1);
    expect(summary.failure?.code).toBe('ISSUER_NOT_IN_ROSTER');
  });

  it('writes nothing at all in dry-run mode', async () => {
    const freshDb = join(env.root, 'dry-run.db');
    const { exitCode, summary } = await runCli([...baseArgs({ dbPath: freshDb }), '--dry-run']);
    expect(exitCode).toBe(0);
    expect(summary.artifact).toMatchObject({ outcome: 'DRY_RUN', wrote: false, versionCount: 0 });
    expect(existsSync(freshDb)).toBe(false);
  });
});

describe('the summary is machine-readable and persistable', () => {
  it('writes the summary to a file with the same content it returns', async () => {
    const { summary } = await runCli(baseArgs());
    const path = join(env.root, 'summary.json');
    writeSummary(path, summary);
    const written = JSON.parse(readFileSync(path, 'utf8')) as CliSummary;
    expect(written).toEqual(summary);
    expect(written.schemaVersion).toBe(1);
    expect(Object.keys(written)).toEqual([
      'schemaVersion',
      'status',
      'generatedAt',
      'steps',
      'dataset',
      'identity',
      'assessment',
      'artifact',
      'chain',
      'limitations',
      'failure',
    ]);
  });
});
