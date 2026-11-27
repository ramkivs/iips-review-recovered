#!/usr/bin/env tsx
/**
 * Snapshot-to-Live W-06 — read-only observation CLI entrypoint.
 *
 * Usage (from `frontend/`):
 *   npm run w06:observe -- \
 *     --portfolio-id DHAN_PORTFOLIO \
 *     --as-of 2026-11-27 \
 *     --out-dir <evidence-output-dir> \
 *     [--api-base-url http://127.0.0.1:8787] \
 *     [--capture-file <exact-owner-bound-portfolio-capture.json>] \
 *     [--revision <int> --provenance-digest <digest> --captured-at <utc-iso>]
 *
 * READ-ONLY BOUNDARY
 *   - Performs one `GET /api/investment/coverage?asOf=<YYYY-MM-DD>` read (and one read-only
 *     `GET /api/user-portfolios/<portfolioId>` read only when no pre-captured revision ref is
 *     supplied via `--capture-file` or `--revision`/`--provenance-digest`/`--captured-at`).
 *   - Projects coverage items through `projectCoverageReportToW06Rows` and runs
 *     `measureDhanRevisionCoverage`: one `POST /api/dhan/quotes` + one `GET /api/dhan/freshness`
 *     per eligible resolved identity, zero calls for unresolved or excluded items, no retries,
 *     and no refreshes.
 *   - Writes only the designated UTF-8 (no BOM) output files:
 *       1. `w06-revision-coverage-report.json` (`iips.w06.dhan-revision-coverage/v1`)
 *       2. `w06-observation-summary.json`      (`iips.w06.observation-summary/v1`)
 *       3. `identities-route-response.json`    (when `--out-dir` or `--coverage-out` is set)
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { CapturedRevisionRef } from './dhanRevisionCoverage';
import {
  parseCaptureDocumentToRevisionRef,
  runW06CoverageObservation,
  type RunW06ObservationOutcome,
} from './w06CoverageHandoff';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8787';

export interface ParsedW06CliArgs {
  readonly help: boolean;
  readonly apiBaseUrl: string;
  readonly portfolioId?: string;
  readonly asOf?: string;
  readonly outDir?: string;
  readonly reportOutPath?: string;
  readonly summaryOutPath?: string;
  readonly coverageOutPath?: string;
  readonly captureFilePath?: string;
  readonly revision?: number;
  readonly provenanceDigest?: string;
  readonly capturedAt?: string;
  readonly timeoutMs?: number;
}

function normalizeFlagName(rawKey: string): string {
  return rawKey.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
}

export function parseW06CliArgs(argv: readonly string[]): ParsedW06CliArgs {
  const map: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]!;
    if (!token.startsWith('--')) continue;
    const key = normalizeFlagName(token.slice(2));
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      map[key] = next;
      i += 1;
    } else {
      map[key] = true;
    }
  }

  const outDir = typeof map.outDir === 'string' ? map.outDir : undefined;
  const reportOutPath =
    typeof map.reportOut === 'string'
      ? map.reportOut
      : outDir !== undefined
        ? join(outDir, 'w06-revision-coverage-report.json')
        : undefined;
  const summaryOutPath =
    typeof map.summaryOut === 'string'
      ? map.summaryOut
      : outDir !== undefined
        ? join(outDir, 'w06-observation-summary.json')
        : undefined;
  const coverageOutPath =
    typeof map.coverageOut === 'string'
      ? map.coverageOut
      : outDir !== undefined
        ? join(outDir, 'identities-route-response.json')
        : undefined;

  return {
    help: map.help === true,
    apiBaseUrl: typeof map.apiBaseUrl === 'string' ? map.apiBaseUrl : DEFAULT_API_BASE_URL,
    ...(typeof map.portfolioId === 'string' ? { portfolioId: map.portfolioId } : {}),
    ...(typeof map.asOf === 'string' ? { asOf: map.asOf } : {}),
    ...(outDir !== undefined ? { outDir } : {}),
    ...(reportOutPath !== undefined ? { reportOutPath } : {}),
    ...(summaryOutPath !== undefined ? { summaryOutPath } : {}),
    ...(coverageOutPath !== undefined ? { coverageOutPath } : {}),
    ...(typeof map.captureFile === 'string' ? { captureFilePath: map.captureFile } : {}),
    ...(typeof map.revision === 'string' ? { revision: Number(map.revision) } : {}),
    ...(typeof map.provenanceDigest === 'string' ? { provenanceDigest: map.provenanceDigest } : {}),
    ...(typeof map.capturedAt === 'string' ? { capturedAt: map.capturedAt } : {}),
    ...(typeof map.timeoutMs === 'string' ? { timeoutMs: Number(map.timeoutMs) } : {}),
  };
}

export function formatW06CliUsage(): string {
  return [
    'Snapshot-to-Live W-06 — Read-Only Quote & Freshness Coverage Observation',
    '',
    'Usage:',
    '  npm run w06:observe -- --portfolio-id <ID> --as-of <YYYY-MM-DD> --out-dir <DIR> [options]',
    '',
    'Required:',
    '  --portfolio-id <id>          Target portfolio ID (no default portfolio is assumed).',
    '  --as-of <YYYY-MM-DD>         Identity coverage evaluation date.',
    '  --out-dir <dir>              Evidence output directory (or supply --report-out and --summary-out).',
    '',
    'Options:',
    '  --api-base-url <url>         Loopback IRR server URL (default: http://127.0.0.1:8787).',
    '  --capture-file <path>        LOCAL-ONLY exact W11-DEP1 capture JSON or CapturedRevisionRef JSON.',
    '  --revision <int>             Explicit captured integer revision (with --provenance-digest and --captured-at).',
    '  --provenance-digest <str>    Explicit captured provenance digest.',
    '  --captured-at <utc-iso>      Explicit capture UTC timestamp.',
    '  --report-out <path>          Override canonical report path (default: <out-dir>/w06-revision-coverage-report.json).',
    '  --summary-out <path>         Override summary path (default: <out-dir>/w06-observation-summary.json).',
    '  --coverage-out <path>        Override retained coverage response path (default: <out-dir>/identities-route-response.json).',
    '  --timeout-ms <ms>            Per-request HTTP timeout in milliseconds (default: 10000).',
    '  --help                       Print this usage summary.',
  ].join('\n');
}

export interface RunW06CliDeps {
  readonly fetchImpl?: typeof fetch;
  readonly now?: () => Date;
  readonly stdout?: (line: string) => void;
  readonly stderr?: (line: string) => void;
}

export async function runW06Cli(
  argv: readonly string[],
  deps: RunW06CliDeps = {},
): Promise<{ readonly exitCode: number; readonly outcome: RunW06ObservationOutcome | null }> {
  const out = deps.stdout ?? ((line: string) => process.stdout.write(`${line}\n`));
  const err = deps.stderr ?? ((line: string) => process.stderr.write(`${line}\n`));
  const parsed = parseW06CliArgs(argv);

  if (parsed.help) {
    out(formatW06CliUsage());
    return { exitCode: 0, outcome: null };
  }

  if (!parsed.portfolioId || !parsed.asOf) {
    err('ERROR [CONFIGURATION_INVALID]: --portfolio-id and --as-of are required.');
    return {
      exitCode: 2,
      outcome: {
        ok: false,
        code: 'CONFIGURATION_INVALID',
        message: '--portfolio-id and --as-of are required.',
      },
    };
  }

  if (!parsed.reportOutPath || !parsed.summaryOutPath) {
    err('ERROR [CONFIGURATION_INVALID]: supply --out-dir <dir> or both --report-out and --summary-out.');
    return {
      exitCode: 2,
      outcome: {
        ok: false,
        code: 'CONFIGURATION_INVALID',
        message: 'supply --out-dir <dir> or both --report-out and --summary-out.',
      },
    };
  }

  let capture: CapturedRevisionRef | undefined;
  let expectedHoldingsCount: number | null = null;

  if (parsed.captureFilePath !== undefined) {
    let rawCaptureDoc: unknown;
    try {
      const content = readFileSync(resolve(parsed.captureFilePath), 'utf8').replace(/^\uFEFF/, '');
      rawCaptureDoc = JSON.parse(content) as unknown;
    } catch (error) {
      const message =
        error instanceof Error
          ? `Unable to read --capture-file: ${error.message}`
          : 'Unable to read --capture-file.';
      err(`ERROR [CAPTURE_FILE_UNREADABLE]: ${message}`);
      return { exitCode: 2, outcome: { ok: false, code: 'CAPTURE_FILE_UNREADABLE', message } };
    }
    const extracted = parseCaptureDocumentToRevisionRef(rawCaptureDoc, parsed.portfolioId);
    if (!extracted.ok) {
      err(`ERROR [${extracted.code}]: ${extracted.message}`);
      return { exitCode: 2, outcome: extracted };
    }
    capture = extracted.capture;
    expectedHoldingsCount = extracted.expectedHoldingsCount;
  } else if (
    parsed.revision !== undefined ||
    parsed.provenanceDigest !== undefined ||
    parsed.capturedAt !== undefined
  ) {
    capture = {
      portfolioId: parsed.portfolioId,
      revision: parsed.revision ?? Number.NaN,
      provenanceDigest: parsed.provenanceDigest ?? '',
      capturedAt: parsed.capturedAt ?? '',
    };
  }

  const outcome = await runW06CoverageObservation({
    apiBaseUrl: parsed.apiBaseUrl,
    portfolioId: parsed.portfolioId,
    asOf: parsed.asOf,
    ...(capture !== undefined ? { capture } : {}),
    expectedHoldingsCount,
    reportOutPath: parsed.reportOutPath,
    summaryOutPath: parsed.summaryOutPath,
    ...(parsed.coverageOutPath !== undefined ? { coverageOutPath: parsed.coverageOutPath } : {}),
    ...(parsed.timeoutMs !== undefined ? { timeoutMs: parsed.timeoutMs } : {}),
    ...(deps.fetchImpl !== undefined ? { fetchImpl: deps.fetchImpl } : {}),
    ...(deps.now !== undefined ? { now: deps.now } : {}),
  });

  if (!outcome.ok) {
    err(`ERROR [${outcome.code}]: ${outcome.message}`);
    const exitCode = outcome.code === 'OUTPUT_WRITE_FAILURE' ? 15 : 10;
    return { exitCode, outcome };
  }

  const { totals } = outcome.report;
  out(
    [
      `W-06 observation recorded (asOf=${outcome.summary.asOf}, revision=${outcome.report.capture.revision}):`,
      `  observedCoverageItems=${outcome.summary.observedCoverageItems}`,
      `  excludedItems=${outcome.summary.excludedItems.length}`,
      `  inScopeRows=${totals.rows} (resolved=${totals.identityResolved}, unresolved=${totals.identityUnresolved})`,
      `  categories: current=${totals.coverageCurrent} stale=${totals.coverageStale} unavailable=${totals.coverageUnavailable} unknown=${totals.coverageUnknown} statusUnreadable=${totals.statusUnreadable}`,
      `  dataCalls=${outcome.summary.totalDataCalls} (quotes=${outcome.summary.quoteCalls}, freshness=${outcome.summary.freshnessCalls})`,
      `  providerQualification=${outcome.report.providerQualification}`,
    ].join('\n'),
  );
  return { exitCode: 0, outcome };
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  const { exitCode } = await runW06Cli(process.argv.slice(2));
  process.exitCode = exitCode;
}
