#!/usr/bin/env tsx
/**
 * IID-3 — M-1 demonstration: one issuer, end to end, in a NEW isolated scope.
 *
 *   tsx server/investment/cli/m1-demonstration.ts --out <dir> [--keep]
 *
 * WHAT IT DOES, IN ORDER (the ten verification points of the milestone):
 *
 *   1  create            CLI run 1 → version 1 persisted
 *   2  read              a SEPARATE PROCESS reads the chain back and prints its identity
 *   3  payload/evidence  the stored payload and its evidence count are intact and labelled synthetic
 *   4  UNCHANGED         CLI run 2 with identical inputs → no write
 *   5  version 2         CLI run 3 with a changed dataset → a new version in the SAME chain
 *   6  version 1 steady  version 1's payload digest and byte length are unchanged, and it is still readable
 *   7  chain validity    both versions validate as one contiguous, single-parent chain
 *   8  corruption        a tampered copy of the store is refused on read (fail closed, no partial history)
 *   9  no boundary        with persistence unavailable every route answers a static, sanitized 503
 *  10  no mutating route  every non-GET/HEAD method on every investment route answers 405
 *
 * WHAT IT DOES NOT DO. It does not touch an existing store: every run creates a fresh temporary directory. It
 * does not use real issuer data: the dataset is the IID-2 synthetic reference company, written through IID-0's
 * own ingestion writer and labelled `SYNTHETIC_REFERENCE`. Limitation L-009 therefore still stands — no real
 * company has been assessed — and the evidence says so explicitly.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import type http from 'node:http';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { adaptNp04Store } from '../../reports/np04-adapter.js';
import { loadAuthoritativeNp04Persistence } from '../../reports/persistence-port.js';
import { INVESTMENT_TRANSPORT_ERRORS, handleInvestmentRequest } from '../investment-transport.js';
import { createInvestmentArtifactService } from '../investmentArtifacts.js';
import { M1_ISSUER_ID } from '../demo/m1Data.js';
import { M1_NOW, M1_NOW_V2, prepareM1Environment } from '../demo/m1Pipeline.js';
import { runCli } from './generate-investment-artifacts.js';
import { runShowChain } from './show-investment-chain.js';

/**
 * `node:sqlite` is reached through `createRequire`: the demonstration only needs it to TAMPER with a copy of the
 * store, and a static import would make this module unloadable in runners that do not treat `node:sqlite` as a
 * builtin. The product path never opens a database — that is the point of the boundary.
 */
const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire('node:sqlite') as typeof import('node:sqlite');

const OWNER_CONTEXT = { tenantId: 'irr-reports-personal', ownerUserId: 'owner-irr-reports-personal' };

export interface VerificationPoint {
  readonly point: number;
  readonly name: string;
  readonly expected: string;
  readonly observed: string;
  readonly pass: boolean;
}

export interface DemonstrationEvidence {
  readonly schemaVersion: 1;
  readonly milestone: 'M-1';
  readonly generatedFor: string;
  readonly dataClass: 'SYNTHETIC_REFERENCE';
  readonly realIssuerAssessment: 'NOT PERFORMED — BLOCKED (no approved real dataset in the local ingestion path)';
  readonly issuerId: string;
  readonly scopeToken: string;
  readonly clock: { readonly v1: string; readonly v2: string };
  readonly runs: readonly {
    readonly label: string;
    readonly exitCode: number;
    readonly status: string;
    readonly outcome: string | null;
    readonly wrote: boolean | null;
    readonly reportKey: string | null;
    readonly payloadDigest: string | null;
    readonly inputDigest: string | null;
    readonly reportId: string | null;
    readonly artifactVersion: number | null;
    readonly versionCount: number | null;
    readonly failure: { readonly code: string; readonly message: string } | null;
  }[];
  readonly independentReads: readonly {
    readonly when: string;
    readonly process: 'SEPARATE_PROCESS';
    readonly exitCode: number;
    readonly versionCount: number;
    readonly reportKey: string | null;
    readonly versions: readonly { readonly artifactVersion: number; readonly payloadDigest: string; readonly inputDigest: string }[];
    readonly payloadBytes: number | null;
  }[];
  readonly corruption: {
    readonly tamper: string;
    readonly httpStatus: number;
    readonly bodyError: string | null;
    readonly servedData: boolean;
  };
  readonly boundaryUnavailable: {
    readonly httpStatus: number;
    readonly body: unknown;
    readonly sanitized: boolean;
  };
  readonly mutatingRoutes: readonly {
    readonly method: string;
    readonly url: string;
    readonly status: number;
    readonly allow: string | null;
  }[];
  readonly sanitization: {
    readonly bodiesChecked: number;
    readonly leaks: readonly string[];
  };
  readonly verification: readonly VerificationPoint[];
  readonly limitationsConfirmed: readonly string[];
}

interface FakeResponse {
  status: number;
  headers: Record<string, string | string[] | number>;
  body: string;
}

async function httpCall(
  method: string,
  url: string,
  deps: Parameters<typeof handleInvestmentRequest>[2] = {},
): Promise<FakeResponse> {
  const result: FakeResponse = { status: 0, headers: {}, body: '' };
  let ended = false;
  const res = {
    setHeader(name: string, value: string | string[] | number): void {
      result.headers[name.toLowerCase()] = value;
    },
    writeHead(status: number, headers?: Record<string, string | string[] | number>): void {
      result.status = status;
      for (const [name, value] of Object.entries(headers ?? {})) result.headers[name.toLowerCase()] = value;
    },
    end(chunk?: string): void {
      ended = true;
      if (typeof chunk === 'string') result.body = chunk;
    },
    get headersSent(): boolean {
      return result.status !== 0 && ended;
    },
    destroyed: false,
  } as unknown as http.ServerResponse;
  await handleInvestmentRequest({ method, url } as http.IncomingMessage, res, {
    resolveOwner: () => OWNER_CONTEXT,
    ...deps,
  });
  return result;
}

function leakScan(bodies: readonly string[], secrets: readonly string[]): string[] {
  const leaks: string[] = [];
  for (const body of bodies) {
    const lower = body.toLowerCase();
    for (const secret of secrets) {
      if (body.includes(secret)) leaks.push(secret);
    }
    for (const forbidden of ['select ', 'governed_artifacts', 'node_modules', '    at ', 'stack']) {
      if (lower.includes(forbidden)) leaks.push(forbidden);
    }
  }
  return [...new Set(leaks)];
}

export async function runDemonstration(outDir: string): Promise<DemoOutcome> {
  const env = prepareM1Environment();
  const cliArgs = (datasetDir: string, generatedAt: string, dbPath = env.dbPath): string[] => [
    '--issuer',
    M1_ISSUER_ID,
    '--data-dir',
    datasetDir,
    '--identity-dir',
    env.identityDir,
    '--db',
    dbPath,
    '--owner-carrier',
    env.carrierPath,
    '--generated-at',
    generatedAt,
  ];

  const runs: DemonstrationEvidence['runs'][number][] = [];
  const record = (label: string, result: Awaited<ReturnType<typeof runCli>>): Awaited<ReturnType<typeof runCli>> => {
    const s = result.summary;
    runs.push({
      label,
      exitCode: result.exitCode,
      status: s.status,
      outcome: s.artifact?.outcome ?? null,
      wrote: s.artifact?.wrote ?? null,
      reportKey: s.artifact?.reportKey ?? null,
      payloadDigest: s.artifact?.payloadDigest ?? null,
      inputDigest: s.artifact?.inputDigest ?? null,
      reportId: s.artifact?.reportId ?? null,
      artifactVersion: s.artifact?.artifactVersion ?? null,
      versionCount: s.artifact?.versionCount ?? null,
      failure: s.failure,
    });
    return result;
  };

  // ---- 1 create -------------------------------------------------------------------------------
  const create = record('create-v1', await runCli(cliArgs(env.datasetV1Dir, M1_NOW)));

  // ---- 2/3 read from a SEPARATE PROCESS --------------------------------------------------------
  const separateRead = (when: string): DemonstrationEvidence['independentReads'][number] => {
    const here = fileURLToPath(new URL('.', import.meta.url));
    const script = join(here, 'show-investment-chain.ts');
    const child = spawnSync(
      process.execPath,
      [
        '--import',
        'tsx',
        script,
        '--issuer',
        M1_ISSUER_ID,
        '--db',
        env.dbPath,
        '--owner-carrier',
        env.carrierPath,
      ],
      // Run from the frontend package root so `tsx` resolves for the child process regardless of the
      // caller's working directory.
      { encoding: 'utf8', env: { ...process.env }, cwd: join(here, '..', '..', '..') },
    );
    const stdout = child.stdout ?? '';
    let parsed: Awaited<ReturnType<typeof runShowChain>>['output'] | null = null;
    try {
      parsed = JSON.parse(stdout) as Awaited<ReturnType<typeof runShowChain>>['output'];
    } catch {
      parsed = null;
    }
    return {
      when,
      process: 'SEPARATE_PROCESS',
      exitCode: child.status ?? -1,
      versionCount: parsed?.versionCount ?? 0,
      reportKey: parsed?.reportKey ?? null,
      versions: (parsed?.versions ?? []).map((v) => ({
        artifactVersion: v.artifactVersion,
        payloadDigest: v.payloadDigest,
        inputDigest: v.inputDigest,
      })),
      payloadBytes: parsed?.payloadBytes ?? null,
    };
  };

  const readAfterV1 = separateRead('after version 1');

  // ---- 4 UNCHANGED -----------------------------------------------------------------------------
  const unchanged = record('rerun-identical', await runCli(cliArgs(env.datasetV1Dir, M1_NOW)));

  // ---- 5 version 2 -----------------------------------------------------------------------------
  const version2 = record('changed-input-v2', await runCli(cliArgs(env.datasetV2Dir, M1_NOW_V2)));
  const readAfterV2 = separateRead('after version 2');

  // ---- 6/7 version 1 unchanged + whole chain valid ---------------------------------------------
  const database = openDatabase({ path: env.dbPath, createDirectory: false, migrate: false });
  let v1AfterV2: { readonly payloadDigest: string; readonly payloadBytes: number } | null = null;
  let chainCheck: { readonly versionCount: number; readonly versions: readonly number[]; readonly rootDigest: string } | null =
    null;
  try {
    const service = createInvestmentArtifactService({
      port: adaptNp04Store(new GovernedArtifactStore(database)),
      owner: { tenantId: OWNER_CONTEXT.tenantId, userId: OWNER_CONTEXT.ownerUserId },
    });
    const chain = service.readChain(`co:${M1_ISSUER_ID}`);
    const first = service.readVersionWithPayload(`co:${M1_ISSUER_ID}`, chain.chainRootReportId);
    v1AfterV2 = { payloadDigest: first.version.payloadDigest, payloadBytes: Buffer.byteLength(first.payload, 'utf8') };
    chainCheck = {
      versionCount: chain.versionCount,
      versions: chain.versions.map((version) => version.artifactVersion),
      rootDigest: chain.versions[0]!.payloadDigest,
    };
  } finally {
    (database as { close?: () => void }).close?.();
  }

  // ---- 8 corruption: tamper a COPY of the store and read through the transport -----------------
  const tamperedPath = join(env.root, 'tampered.db');
  // The store runs in WAL mode, so the sidecar files are part of its contents: checkpoint first, then copy the
  // database and any remaining sidecars, or the copy would look empty and prove nothing.
  {
    const source = new DatabaseSync(env.dbPath);
    try {
      source.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    } finally {
      source.close();
    }
  }
  copyFileSync(env.dbPath, tamperedPath);
  for (const suffix of ['-wal', '-shm']) {
    if (existsSync(`${env.dbPath}${suffix}`)) copyFileSync(`${env.dbPath}${suffix}`, `${tamperedPath}${suffix}`);
  }
  {
    const tampered = new DatabaseSync(tamperedPath);
    try {
      tampered.exec('DROP TRIGGER IF EXISTS governed_artifacts_no_update');
      tampered.exec('DROP TRIGGER IF EXISTS governed_artifacts_no_delete');
      // Move the ROOT version into another scope, rewriting its key so the row is individually well formed.
      const row = tampered
        .prepare('SELECT report_type, scenario, parameters_json, report_id FROM governed_artifacts WHERE artifact_version = 1 LIMIT 1')
        .get() as { report_type: string; scenario: string | null; parameters_json: string; report_id: string };
      const reScoped = 'co:IN:EQISIN:IN0000000011';
      tampered
        .prepare('UPDATE governed_artifacts SET portfolio_id = ?, report_key = ? WHERE report_id = ?')
        .run(reScoped, 'e'.repeat(64), row.report_id);
    } finally {
      tampered.close();
    }
  }
  process.env['IIPS_NP04_DATABASE_PATH'] = tamperedPath;
  let corruptionResponse: FakeResponse;
  try {
    corruptionResponse = await httpCall('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`);
  } finally {
    delete process.env['IIPS_NP04_DATABASE_PATH'];
  }

  // ---- 9 boundary unavailable ------------------------------------------------------------------
  const boundaryResponse = await httpCall('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`, {
    loadPort: async () => null,
  });

  // ---- 10 no mutating route --------------------------------------------------------------------
  const mutatingRoutes: DemonstrationEvidence['mutatingRoutes'][number][] = [];
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    for (const url of [
      `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`,
      `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}/versions/${create.summary.artifact?.reportId ?? 'x'}`,
    ]) {
      const response = await httpCall(method, url);
      mutatingRoutes.push({
        method,
        url: url.replace(encodeURIComponent(M1_ISSUER_ID), ':issuerId').replace(/\/versions\/[^/]+$/, '/versions/:reportId'),
        status: response.status,
        allow: typeof response.headers.allow === 'string' ? response.headers.allow : null,
      });
    }
  }

  // ---- sanitization sweep ----------------------------------------------------------------------
  const ok = await httpCall('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`);
  const notFound = await httpCall('GET', '/api/investment/company/IN%3AEQISIN%3AIN0000000011');
  const bodies = [ok.body, notFound.body, boundaryResponse.body, corruptionResponse.body, ...mutatingRoutes.map(() => '')];
  const leaks = leakScan(bodies, [env.root, 'investment.db', OWNER_CONTEXT.tenantId, OWNER_CONTEXT.ownerUserId]);

  const verification: VerificationPoint[] = [
    {
      point: 1,
      name: 'create',
      expected: 'CREATED, version 1, exactly one version',
      observed: `${create.summary.artifact?.outcome} v${create.summary.artifact?.artifactVersion} (${create.summary.artifact?.versionCount} version)`,
      pass: create.exitCode === 0 && create.summary.artifact?.outcome === 'CREATED' && create.summary.artifact?.versionCount === 1,
    },
    {
      point: 2,
      name: 'independent read in a separate process',
      expected: 'exit 0, one version, same reportKey',
      observed: `exit ${readAfterV1.exitCode}, ${readAfterV1.versionCount} version, key ${readAfterV1.reportKey?.slice(0, 12)}…`,
      pass:
        readAfterV1.exitCode === 0 &&
        readAfterV1.versionCount === 1 &&
        readAfterV1.reportKey === create.summary.artifact?.reportKey,
    },
    {
      point: 3,
      name: 'payload and evidence intact',
      expected: 'payload digest readable, evidence > 0, datasetClass SYNTHETIC_REFERENCE',
      observed: `payload ${readAfterV1.payloadBytes} bytes, digest ${readAfterV1.versions[0]?.payloadDigest.slice(0, 12)}…, evidence ${create.summary.assessment?.evidenceCount}`,
      pass:
        (readAfterV1.payloadBytes ?? 0) > 0 &&
        readAfterV1.versions[0]?.payloadDigest === create.summary.artifact?.payloadDigest &&
        (create.summary.assessment?.evidenceCount ?? 0) > 0 &&
        create.summary.dataset?.datasetClass === 'SYNTHETIC_REFERENCE',
    },
    {
      point: 4,
      name: 'unchanged re-run writes nothing',
      expected: 'UNCHANGED, wrote false, still one version',
      observed: `${unchanged.summary.artifact?.outcome}, wrote=${String(unchanged.summary.artifact?.wrote)}, ${unchanged.summary.artifact?.versionCount} version`,
      pass:
        unchanged.summary.artifact?.outcome === 'UNCHANGED' &&
        unchanged.summary.artifact?.wrote === false &&
        unchanged.summary.artifact?.versionCount === 1,
    },
    {
      point: 5,
      name: 'changed input appends version 2 to the same chain',
      expected: 'APPENDED, version 2, same reportKey',
      observed: `${version2.summary.artifact?.outcome} v${version2.summary.artifact?.artifactVersion}, key ${version2.summary.artifact?.reportKey?.slice(0, 12)}…`,
      pass:
        version2.summary.artifact?.outcome === 'APPENDED' &&
        version2.summary.artifact?.artifactVersion === 2 &&
        version2.summary.artifact?.reportKey === create.summary.artifact?.reportKey,
    },
    {
      point: 6,
      name: 'version 1 is byte-identical and still readable after version 2',
      expected: 'digest and byte length unchanged, readable in a separate process',
      observed: `digest ${v1AfterV2?.payloadDigest.slice(0, 12)}…, ${v1AfterV2?.payloadBytes} bytes; separate-process read ${readAfterV2.versions.length} versions`,
      pass:
        v1AfterV2?.payloadDigest === create.summary.artifact?.payloadDigest &&
        v1AfterV2?.payloadBytes === readAfterV1.payloadBytes &&
        readAfterV2.versionCount === 2,
    },
    {
      point: 7,
      name: 'both versions form one valid chain',
      expected: 'versions [1,2], chain validated on read',
      observed: `versions ${JSON.stringify(chainCheck?.versions)}, root digest ${chainCheck?.rootDigest.slice(0, 12)}…`,
      pass: chainCheck?.versionCount === 2 && JSON.stringify(chainCheck?.versions) === JSON.stringify([1, 2]),
    },
    {
      point: 8,
      name: 'corrupted / scope-drifted chain is refused on read',
      expected: '503, static integrity body, no data',
      observed: `${corruptionResponse.status} ${JSON.parse(corruptionResponse.body || '{}').error ?? ''}`,
      pass:
        corruptionResponse.status === 503 &&
        JSON.parse(corruptionResponse.body || '{}').error === INVESTMENT_TRANSPORT_ERRORS.integrityFailure.error,
    },
    {
      point: 9,
      name: 'persistence unavailable answers a sanitized static 503',
      expected: '503 investment-persistence-unavailable, exact static body',
      observed: `${boundaryResponse.status} ${boundaryResponse.body}`,
      pass:
        boundaryResponse.status === 503 &&
        boundaryResponse.body === JSON.stringify(INVESTMENT_TRANSPORT_ERRORS.persistenceUnavailable),
    },
    {
      point: 10,
      name: 'no mutating route exists',
      expected: 'every POST/PUT/PATCH/DELETE answered 405 with Allow: GET, HEAD',
      observed: `${mutatingRoutes.filter((r) => r.status === 405 && r.allow === 'GET, HEAD').length}/${mutatingRoutes.length} answered 405`,
      pass: mutatingRoutes.every((route) => route.status === 405 && route.allow === 'GET, HEAD'),
    },
  ];

  const evidence: DemonstrationEvidence = {
    schemaVersion: 1,
    milestone: 'M-1',
    generatedFor: 'IID-3 persistence, read transport and thin slice',
    dataClass: 'SYNTHETIC_REFERENCE',
    realIssuerAssessment: 'NOT PERFORMED — BLOCKED (no approved real dataset in the local ingestion path)',
    issuerId: M1_ISSUER_ID,
    scopeToken: `co:${M1_ISSUER_ID}`,
    clock: { v1: M1_NOW, v2: M1_NOW_V2 },
    runs,
    independentReads: [readAfterV1, readAfterV2],
    corruption: {
      tamper: 'root version re-filed under another scope with a rewritten reportKey (must fail closed)',
      httpStatus: corruptionResponse.status,
      bodyError:
        corruptionResponse.body === ''
          ? null
          : ((JSON.parse(corruptionResponse.body) as { error?: string }).error ?? null),
      servedData: corruptionResponse.status === 200,
    },
    boundaryUnavailable: {
      httpStatus: boundaryResponse.status,
      body: boundaryResponse.body === '' ? null : (JSON.parse(boundaryResponse.body) as unknown),
      sanitized: !boundaryResponse.body.includes(env.root),
    },
    mutatingRoutes,
    sanitization: { bodiesChecked: bodies.filter((body) => body !== '').length, leaks },
    verification,
    limitationsConfirmed: [
      'L-004 the reference dataset is synthetic; this demonstration validates mechanics only',
      'L-009 no real issuer was assessed; the real-issuer leg of M-1 is BLOCKED on an approved local dataset',
      'L-010 chains are located by bounded head scan because the boundary exposes no find-by-chain operation',
      'L-012 the chain root report id is used as the chain identifier because the canonical artifact shape omits chainId',
      'L-014 content identity covers the assessment timestamp, so a refresh at a new clock is a new version',
      'L-015 two chains for one scope are refused rather than merged',
    ],
  };

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'm1-demonstration.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');

  // Keep the run summaries themselves: they are the CLI's own account of what it did.
  const runsDir = join(outDir, 'runs');
  mkdirSync(runsDir, { recursive: true });
  writeFileSync(join(runsDir, 'create-v1.json'), `${JSON.stringify(create.summary, null, 2)}\n`, 'utf8');
  writeFileSync(join(runsDir, 'rerun-identical.json'), `${JSON.stringify(unchanged.summary, null, 2)}\n`, 'utf8');
  writeFileSync(join(runsDir, 'changed-input-v2.json'), `${JSON.stringify(version2.summary, null, 2)}\n`, 'utf8');

  env.cleanup();

  return { evidence, outDir };
}

export interface DemoOutcome {
  readonly evidence: DemonstrationEvidence;
  readonly outDir: string;
}

const invokedDirectly = process.argv[1] !== undefined && /m1-demonstration\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  const index = process.argv.indexOf('--out');
  const outDir = index === -1 ? join(process.cwd(), 'iid3-m1-evidence') : process.argv[index + 1]!;
  void runDemonstration(outDir).then(({ evidence }) => {
    for (const point of evidence.verification) {
      process.stderr.write(`${point.pass ? 'PASS' : 'FAIL'}  ${point.point}. ${point.name} — ${point.observed}\n`);
    }
    process.stdout.write(`${join(outDir, 'm1-demonstration.json')}\n`);
    process.exitCode = evidence.verification.every((point) => point.pass) ? 0 : 1;
  });
}
