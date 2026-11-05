/**
 * NP-06 Reports — operator-controlled invocation that persists the GENUINE certified
 * `CrossSectorEngine` reports through the existing NP-06 persistence adapter and the NP-04
 * governed `createInstance` boundary.
 *
 * AUTHORITY
 *   PA IMPLEMENTATION AUTHORIZATION — NP-06 REAL REPORT PERSISTENCE (2026-11-05).
 *   This is the smallest safe producer-to-persistence invocation. It is NOT a new public
 *   write route and NOT a UI write capability. It is a one-off, operator-run script.
 *
 * WHAT IT REUSES (no duplicate engine logic)
 *   - `computeCertifiedPlatform()` from `server/executive-transport.ts` — the certified frozen
 *     sector-engine execution and the genuine `CrossSectorEngine` output (`pr.reports`).
 *   - `composeReportContent()` — the existing NP-06 composition stage.
 *   - `ReportsPersistence.persistNew()` — the existing NP-06 persistence adapter.
 *   - `resolveAuthoritativeNp04Port()` — the existing NP-04 governed `createInstance` boundary.
 *
 * WHAT IT MUST NEVER DO
 *   - Fabricate, reconstruct, or edit report content. The only input is `pr.reports`.
 *   - Construct a Reports-local store. NP-04 remains the exclusive persistence authority.
 *   - Change the Reports owner carrier or the approved owner pair. The owner is resolved from
 *     the server-owned carrier (`IIPS_REPORTS_OWNER_PATH`).
 *   - Start a public write route or add a UI write control.
 *
 * USAGE (from `frontend/`)
 *   npx tsx server/reports/persist-real-reports.ts                 # dry run (no writes)
 *   npx tsx server/reports/persist-real-reports.ts --commit        # persist genuine reports
 *   npx tsx server/reports/persist-real-reports.ts --verify        # read back in a new process
 *   npx tsx server/reports/persist-real-reports.ts --verify --api http://127.0.0.1:8787
 *
 * REQUIRED ENVIRONMENT
 *   IIPS_REPORTS_OWNER_PATH   server-owned Reports carrier file (not the directory)
 *   IIPS_NP04_DATABASE_PATH   absolute NP-04 SQLite database path
 *
 * OPERATOR NOTE
 *   Run `--commit` once. A second run with the same content would create a new NP-04 instance
 *   (identical content, distinct durable `reportId`); the script refuses that unless `--force`
 *   is supplied. `--verify` opens a fresh store handle in a new process and reads the artifacts
 *   back, proving durability across the process boundary.
 */

import path from 'node:path';
import { composeReportContent } from './composition.js';
import { resolveAuthoritativeNp04Port } from './np04-adapter.js';
import { ReportsPersistence } from './persistence.js';
import { NP04_DATABASE_PATH_ENV } from './persistence-port.js';
import {
  REPORTS_OWNER_PATH_ENV,
  resolveReportsOwnerContext,
} from '../reports-owner-resolver.js';

type Mode = 'dry-run' | 'commit' | 'verify';

interface ParsedArgs {
  readonly mode: Mode;
  readonly force: boolean;
  readonly api: string | null;
}

function parseArgs(argv: readonly string[]): ParsedArgs {
  const mode: Mode = argv.includes('--commit')
    ? 'commit'
    : argv.includes('--verify')
      ? 'verify'
      : 'dry-run';
  const apiIndex = argv.indexOf('--api');
  const api = apiIndex >= 0 ? argv[apiIndex + 1] ?? null : null;
  return { mode, force: argv.includes('--force'), api };
}

function requireOwner() {
  const owner = resolveReportsOwnerContext();
  if (owner === null) {
    throw new Error(
      `Reports owner context unavailable. Set ${REPORTS_OWNER_PATH_ENV} to the server-owned ` +
        'Reports carrier file (outside any Git working tree).',
    );
  }
  return owner;
}

function requireDatabasePath(): string {
  const databasePath = process.env[NP04_DATABASE_PATH_ENV];
  if (typeof databasePath !== 'string' || databasePath.length === 0) {
    throw new Error(`Set ${NP04_DATABASE_PATH_ENV} to the absolute NP-04 database path.`);
  }
  if (!path.isAbsolute(databasePath)) {
    throw new Error(`${NP04_DATABASE_PATH_ENV} must be an absolute path; received '${databasePath}'.`);
  }
  return databasePath;
}

async function resolvePersistence() {
  const resolution = await resolveAuthoritativeNp04Port();
  if (!resolution.available) {
    throw new Error(`NP-04 governed persistence unavailable: ${resolution.reason}`);
  }
  return new ReportsPersistence(resolution.port);
}

function artifactSummary(artifact: {
  readonly reportId: string;
  readonly reportKey: string;
  readonly reportType: string;
  readonly portfolioId: string;
  readonly artifactVersion: number;
  readonly supersedesReportId: string | null;
  readonly generatedAt: string;
  readonly provenance: { readonly engineOutputId: string };
}) {
  return {
    reportId: artifact.reportId,
    reportKey: artifact.reportKey,
    reportType: artifact.reportType,
    portfolioId: artifact.portfolioId,
    artifactVersion: artifact.artifactVersion,
    supersedesReportId: artifact.supersedesReportId,
    generatedAt: artifact.generatedAt,
    engineOutputId: artifact.provenance.engineOutputId,
  };
}

async function main(): Promise<void> {
  const { mode, force, api } = parseArgs(process.argv.slice(2));
  const owner = requireOwner();
  const databasePath = requireDatabasePath();
  const persistence = await resolvePersistence();
  const ownerPair = { tenantId: owner.tenantId, userId: owner.ownerUserId };

  if (mode === 'verify') {
    const page = persistence.queryByOwner(ownerPair);
    const summary = {
      mode,
      databasePath,
      owner: ownerPair,
      artifactCount: page.items.length,
      artifacts: page.items.map(artifactSummary),
      note: 'Read through a fresh NP-04 store handle in this process.',
    };
    console.log(JSON.stringify(summary, null, 2));

    if (api !== null) {
      const response = await fetch(`${api.replace(/\/$/, '')}/api/reports/artifacts?limit=25`);
      const body = (await response.json().catch(() => ({}))) as {
        data?: unknown;
        nextCursor?: unknown;
        error?: string;
      };
      const apiCount = Array.isArray(body.data) ? body.data.length : 0;
      console.log(
        JSON.stringify(
          {
            mode: 'verify-api',
            api,
            status: response.status,
            artifactCount: apiCount,
            error: body.error ?? null,
            note:
              response.status === 200 && apiCount === page.items.length
                ? 'API artifact count matches the store read-back.'
                : 'API artifact count does not match the store read-back; check that the server uses the same database path.',
          },
          null,
          2,
        ),
      );
    }
    return;
  }

  // Dry run and commit both use the genuine certified producer output. `NODE_ENV=test`
  // suppresses the transport's listen() side effect; no server is started by this script.
  process.env.NODE_ENV = 'test';
  const { computeCertifiedPlatform } = await import('../executive-transport.js');
  const { csip } = computeCertifiedPlatform();
  const reports = csip.reports;
  if (!Array.isArray(reports) || reports.length === 0) {
    throw new Error('CrossSectorEngine produced no reports; refusing to persist an empty set.');
  }

  const generatedAt = new Date().toISOString();
  const composed = reports.map((report) => ({
    report,
    content: composeReportContent({ engineOutput: report, generatedAt }),
  }));

  const existing = persistence.queryByOwner(ownerPair);
  const existingKeys = new Set(existing.items.map((item) => item.reportKey));
  const duplicates = composed.filter((entry) => existingKeys.has(entry.content.reportKey));

  const preview = {
    mode,
    databasePath,
    owner: ownerPair,
    generatedAt,
    producer: 'CrossSectorEngine (certified frozen v1.1 Replay Baseline inputs)',
    reportCount: composed.length,
    reports: composed.map((entry) => ({
      engineOutputId: entry.report.reportId,
      reportType: entry.report.reportType,
      portfolioId: entry.report.portfolioId,
      reportKey: entry.content.reportKey,
    })),
    existingArtifactCount: existing.items.length,
    duplicateReportKeys: duplicates.map((entry) => entry.report.reportId),
  };

  if (duplicates.length > 0 && !force) {
    throw new Error(
      `Refusing to create duplicate instances. The following engine outputs already have ` +
        `persisted reportKeys: ${duplicates.map((entry) => entry.report.reportId).join(', ')}. ` +
        'Use --force only if a new instance is intended.',
    );
  }

  if (mode === 'dry-run') {
    console.log(
      JSON.stringify(
        {
          ...preview,
          note: 'Dry run: no records were written. Re-run with --commit to persist.',
        },
        null,
        2,
      ),
    );
    return;
  }

  const persisted = composed.map((entry) =>
    persistence.persistNew(ownerPair, { engineOutput: entry.report, generatedAt }),
  );
  console.log(
    JSON.stringify(
      {
        ...preview,
        persistedCount: persisted.length,
        persisted: persisted.map(artifactSummary),
        note: 'Persisted through the existing NP-06 adapter and NP-04 createInstance boundary.',
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
        note: 'No report was persisted by this invocation.',
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
});
