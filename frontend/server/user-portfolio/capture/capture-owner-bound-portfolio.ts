#!/usr/bin/env tsx
/**
 * W11 acceptance dependency 1 — operator CLI for the owner-bound portfolio capture.
 *
 *   tsx server/user-portfolio/capture/capture-owner-bound-portfolio.ts --output-root <absolute dir>
 *       [--portfolio-id <id>] [--max-attempts <1-5>] [--retry-delay-ms <0-10000>] [--validate-only]
 *       [--irr-commit <sha>] [--irr-dirty <true|false>] [--ipd-commit <sha>]
 *       [--ipd-commit-source <LABEL>] [--ipd-entrypoint-mtime-utc <instant>] [--ipd-process-count <n>]
 *
 * The supported entry point on the Windows host is
 * `tools/windows/capture-owner-bound-portfolio.ps1`, which runs this file. Operators do
 * not build frames, edit source or assemble output: this CLI validates configuration,
 * runs the bounded capture (`ownerBoundPortfolioCapture.ts`) through the existing IRR
 * IPC consumer, and writes both output files.
 *
 * READ-ONLY toward IPD. It connects only to an already-running service, sends only
 * `portfolio.list`, `portfolio.get` and `portfolio.revisions`, starts no process, opens
 * no database and changes no environment variable. Its only writes are its own output
 * files, created new (never overwritten) under the output root.
 *
 * OUTPUT — two different artifacts, in two clearly named directories:
 *   <run>/LOCAL-ONLY-DO-NOT-PUBLISH/exact-owner-bound-portfolio-capture.json
 *       The exact capture: portfolio contents verbatim. Stays on this host.
 *   <run>/SANITIZED-SUMMARY/w11-dep1-capture-summary.json (+ .md)
 *       The publishable summary: counts, consistency results, timestamps, protocol and
 *       build metadata, outcome. It is NOT the complete evidence.
 *
 * CONSOLE — progress and the outcome only. No portfolio id, name, holding, identifier,
 * digest value or amount is ever printed.
 *
 * EXIT CODES (`CAPTURE_EXIT_CODES`)
 *    0  CONSISTENT_CAPTURE                 one attempt passed every gating check
 *    2  CONFIGURATION_INVALID              invalid invocation or configuration; no connection made
 *   10  IPC_CONNECTION_FAILURE             timeout or transport fault
 *   11  BINDING_OR_AUTHORIZATION_REFUSAL   zero-byte close (Class P) or local precondition refusal
 *   12  AMBIGUOUS_OR_MISSING_PORTFOLIO     none listed, several listed, or the selected id not listed
 *   13  INCONSISTENT_READ                  every bounded attempt disagreed; nothing kept
 *   14  PROTOCOL_CAPABILITY_UNAVAILABLE    typed refusal, or a response the consumer does not admit
 *   15  OUTPUT_WRITE_FAILURE               an output file could not be written; no success is claimed
 *   70  INTERNAL_ERROR                     a defect in this utility
 */
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildExactCaptureDocument,
  buildSanitizedSummary,
  CAPTURE_EXIT_CODES,
  captureOwnerBoundPortfolio,
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_RETRY_DELAY_MS,
  MAX_ATTEMPTS_LIMIT,
  RETRY_DELAY_LIMIT_MS,
  sha256Hex,
  validateCaptureConfiguration,
  type CaptureOutcome,
  type CaptureTransport,
  type ExactCaptureReference,
  type HostBuildMetadata,
} from './ownerBoundPortfolioCapture.js';

export const LOCAL_ONLY_DIRECTORY = 'LOCAL-ONLY-DO-NOT-PUBLISH';
export const SANITIZED_DIRECTORY = 'SANITIZED-SUMMARY';
export const EXACT_CAPTURE_FILE = 'exact-owner-bound-portfolio-capture.json';
export const CANDIDATES_FILE = 'portfolio-candidates.json';
export const SUMMARY_JSON_FILE = 'w11-dep1-capture-summary.json';
export const SUMMARY_MARKDOWN_FILE = 'w11-dep1-capture-summary.md';

const USAGE =
  'usage: capture-owner-bound-portfolio --output-root <absolute dir> [--portfolio-id <id>] ' +
  `[--max-attempts <1-${MAX_ATTEMPTS_LIMIT}>] [--retry-delay-ms <0-${RETRY_DELAY_LIMIT_MS}>] [--validate-only]`;

export interface CliIo {
  readonly out: (line: string) => void;
  readonly err: (line: string) => void;
}

export interface CliDependencies {
  /** The server-owned environment. Read, never written. */
  readonly env: NodeJS.ProcessEnv;
  readonly io: CliIo;
  readonly platform?: NodeJS.Platform;
  /** TESTS ONLY: a mocked IPC. Production uses the existing IRR IPC client. */
  readonly transport?: CaptureTransport;
  readonly now?: () => Date;
  readonly sleep?: (milliseconds: number) => Promise<void>;
}

export interface CliResult {
  readonly exitCode: number;
  readonly outcome: CaptureOutcome | 'OUTPUT_WRITE_FAILURE' | 'VALIDATION_ONLY_OK';
  readonly runDirectory: string | null;
  readonly summaryPath: string | null;
  readonly exactCapturePath: string | null;
  readonly candidatesPath: string | null;
}

interface ParsedArguments {
  readonly outputRoot: string | undefined;
  readonly portfolioId: string | undefined;
  readonly maxAttempts: number;
  readonly retryDelayMs: number;
  readonly validateOnly: boolean;
  readonly build: HostBuildMetadata;
}

type ParseOutcome =
  | { readonly ok: true; readonly value: ParsedArguments }
  | { readonly ok: false; readonly error: string };

const VALUE_FLAGS: readonly string[] = [
  '--output-root',
  '--portfolio-id',
  '--max-attempts',
  '--retry-delay-ms',
  '--irr-commit',
  '--irr-dirty',
  '--ipd-commit',
  '--ipd-commit-source',
  '--ipd-entrypoint-mtime-utc',
  '--ipd-process-count',
];

function parseBoundedInteger(raw: string, min: number, max: number): number | null {
  if (!/^\d{1,6}$/.test(raw)) return null;
  const value = Number(raw);
  return value >= min && value <= max ? value : null;
}

/** Parses the command line. An error message never echoes an argument value. */
export function parseCaptureArguments(argv: readonly string[]): ParseOutcome {
  const values = new Map<string, string>();
  let validateOnly = false;

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--validate-only') {
      validateOnly = true;
      continue;
    }
    if (!VALUE_FLAGS.includes(flag)) return { ok: false, error: `unknown argument. ${USAGE}` };
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) return { ok: false, error: `${flag} requires a value. ${USAGE}` };
    if (values.has(flag)) return { ok: false, error: `${flag} was supplied more than once. ${USAGE}` };
    values.set(flag, value);
    index += 1;
  }

  let maxAttempts = DEFAULT_MAX_ATTEMPTS;
  const rawAttempts = values.get('--max-attempts');
  if (rawAttempts !== undefined) {
    const parsed = parseBoundedInteger(rawAttempts, 1, MAX_ATTEMPTS_LIMIT);
    if (parsed === null) return { ok: false, error: `--max-attempts must be an integer from 1 to ${MAX_ATTEMPTS_LIMIT}.` };
    maxAttempts = parsed;
  }

  let retryDelayMs = DEFAULT_RETRY_DELAY_MS;
  const rawDelay = values.get('--retry-delay-ms');
  if (rawDelay !== undefined) {
    const parsed = parseBoundedInteger(rawDelay, 0, RETRY_DELAY_LIMIT_MS);
    if (parsed === null) {
      return { ok: false, error: `--retry-delay-ms must be an integer from 0 to ${RETRY_DELAY_LIMIT_MS}.` };
    }
    retryDelayMs = parsed;
  }

  const portfolioId = values.get('--portfolio-id');
  if (portfolioId !== undefined && (portfolioId.trim().length === 0 || portfolioId.length > 256)) {
    return { ok: false, error: '--portfolio-id must be a non-blank identifier of at most 256 characters.' };
  }

  const rawDirty = values.get('--irr-dirty');
  if (rawDirty !== undefined && rawDirty !== 'true' && rawDirty !== 'false') {
    return { ok: false, error: '--irr-dirty must be true or false.' };
  }
  const rawProcessCount = values.get('--ipd-process-count');
  let ipdIpcProcessCount: number | undefined;
  if (rawProcessCount !== undefined) {
    const parsed = parseBoundedInteger(rawProcessCount, 0, 999);
    if (parsed === null) return { ok: false, error: '--ipd-process-count must be an integer from 0 to 999.' };
    ipdIpcProcessCount = parsed;
  }

  return {
    ok: true,
    value: {
      outputRoot: values.get('--output-root'),
      portfolioId,
      maxAttempts,
      retryDelayMs,
      validateOnly,
      build: {
        irrCommit: values.get('--irr-commit'),
        irrWorkingTreeDirty: rawDirty === undefined ? undefined : rawDirty === 'true',
        ipdCheckoutCommit: values.get('--ipd-commit'),
        ipdCheckoutSource: values.get('--ipd-commit-source'),
        ipdEntrypointLastWriteUtc: values.get('--ipd-entrypoint-mtime-utc'),
        ipdIpcProcessCount,
      },
    },
  };
}

/**
 * Checks the output root WITHOUT creating anything. The exact capture must never be
 * committable, so a root inside any git working tree is refused.
 */
export function assessOutputRoot(outputRoot: string | undefined): string | null {
  if (outputRoot === undefined || outputRoot.trim().length === 0) {
    return '--output-root is required: an absolute directory OUTSIDE any git working tree.';
  }
  if (!path.isAbsolute(outputRoot)) return '--output-root must be an absolute path.';
  let cursor = path.resolve(outputRoot);
  for (;;) {
    if (existsSync(path.join(cursor, '.git'))) {
      return (
        '--output-root is inside a git working tree. The exact capture holds portfolio contents and must ' +
        'never be committable: choose a directory outside every repository.'
      );
    }
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  const resolved = path.resolve(outputRoot);
  if (existsSync(resolved) && !statSync(resolved).isDirectory()) return '--output-root exists and is not a directory.';
  return null;
}

function compactUtcStamp(instant: Date): string {
  return instant.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}

function writeNewFile(filePath: string, text: string): Buffer {
  const bytes = Buffer.from(text, 'utf8');
  // `wx`: create only. An existing file is never overwritten.
  writeFileSync(filePath, bytes, { flag: 'wx', mode: 0o600 });
  return bytes;
}

const LOCAL_ONLY_README = [
  'LOCAL-ONLY - DO NOT PUBLISH, COMMIT, UPLOAD OR ATTACH',
  '',
  'This directory holds the EXACT owner-bound portfolio capture for W11 acceptance dependency 1:',
  'portfolio identifier, holdings, security identifiers and amounts, exactly as IPD returned them.',
  '',
  'It must stay on this Windows host. Do not copy it into a repository, an issue, a pull request,',
  'a chat or a shared drive. The publishable artifact is the sanitized summary in the sibling',
  `directory "${SANITIZED_DIRECTORY}". The summary records the SHA-256 of the exact capture file,`,
  'which binds the two without disclosing any content.',
  '',
].join('\r\n');

const RUN_README = [
  'W11 acceptance dependency 1 - owner-bound portfolio capture run',
  '',
  `${LOCAL_ONLY_DIRECTORY}\\`,
  '    Exact capture (portfolio contents). LOCAL-ONLY. Never publish.',
  '    Present only when the outcome is CONSISTENT_CAPTURE, or as a candidates list when the',
  '    operator must choose among several listed portfolios.',
  '',
  `${SANITIZED_DIRECTORY}\\`,
  '    Sanitized summary (JSON and Markdown). This is the publishable artifact.',
  '    It is a summary. It is NOT the complete capture evidence.',
  '',
].join('\r\n');

function renderSummaryMarkdown(summary: Record<string, unknown>): string {
  // Rendered ONLY from the sanitized summary object, so it can carry nothing the
  // sanitized JSON does not.
  const lines = [
    '# W11 acceptance dependency 1 - owner-bound portfolio capture: sanitized summary',
    '',
    `> ${String(summary.notice)}`,
    '',
    `- Outcome: **${String(summary.outcome)}** (${String(summary.reasonCode)}), exit code ${String(summary.exitCode)}`,
    `- Evidence eligibility: ${String(summary.evidenceEligibility)}`,
    `- Capture id: ${String(summary.captureId)}`,
    `- Detail: ${String(summary.message)}`,
    '',
    '## Sanitized summary (JSON)',
    '',
    '```json',
    JSON.stringify(summary, null, 2),
    '```',
    '',
  ];
  return lines.join('\n');
}

/**
 * Runs the CLI. Returns instead of exiting so it can be tested with a mocked IPC.
 * Every path other than a written, consistent capture returns a non-zero exit code.
 */
export async function runCaptureCli(argv: readonly string[], deps: CliDependencies): Promise<CliResult> {
  const { io } = deps;
  const now = deps.now ?? (() => new Date());
  const none = { runDirectory: null, summaryPath: null, exactCapturePath: null, candidatesPath: null };
  const invalid = (message: string): CliResult => {
    io.err(`CONFIGURATION_INVALID: ${message}`);
    io.err('No IPC connection was attempted and nothing was written.');
    return { exitCode: CAPTURE_EXIT_CODES.CONFIGURATION_INVALID, outcome: 'CONFIGURATION_INVALID', ...none };
  };

  io.out('W11 acceptance dependency 1 - owner-bound portfolio capture (read-only)');

  const parsed = parseCaptureArguments(argv);
  if (!parsed.ok) return invalid(parsed.error);
  const args = parsed.value;

  // ---- validation before any connection -------------------------------------
  const outputProblem = assessOutputRoot(args.outputRoot);
  if (outputProblem !== null) return invalid(outputProblem);
  const outputRoot = path.resolve(args.outputRoot as string);

  const configuration = validateCaptureConfiguration(deps.env, deps.platform ?? process.platform);
  for (const problem of configuration.problems) io.err(`  [config] ${problem.code}: ${problem.message}`);
  if (configuration.ok) io.out('Configuration: valid (endpoint resolvable, binding precondition affirmed)');

  if (args.validateOnly) {
    if (!configuration.ok) {
      io.err('CONFIGURATION_INVALID: validation only; no IPC connection was attempted and nothing was written.');
      return { exitCode: CAPTURE_EXIT_CODES.CONFIGURATION_INVALID, outcome: 'CONFIGURATION_INVALID', ...none };
    }
    io.out('Validation only: no IPC connection was attempted and nothing was written.');
    return { exitCode: 0, outcome: 'VALIDATION_ONLY_OK', ...none };
  }

  // ---- output locations, created before connecting ---------------------------
  const startedAt = now();
  const captureId = randomUUID();
  const runDirectory = path.join(outputRoot, `w11-dep1-capture-${compactUtcStamp(startedAt)}-${captureId.slice(0, 8)}`);
  const localOnlyDirectory = path.join(runDirectory, LOCAL_ONLY_DIRECTORY);
  const sanitizedDirectory = path.join(runDirectory, SANITIZED_DIRECTORY);
  try {
    mkdirSync(localOnlyDirectory, { recursive: true, mode: 0o700 });
    mkdirSync(sanitizedDirectory, { recursive: true, mode: 0o700 });
    writeNewFile(path.join(runDirectory, 'README.txt'), RUN_README);
    writeNewFile(path.join(localOnlyDirectory, 'README-LOCAL-ONLY.txt'), LOCAL_ONLY_README);
  } catch {
    io.err('OUTPUT_WRITE_FAILURE: the output directories could not be created under --output-root.');
    io.err('No IPC connection was attempted.');
    return { exitCode: CAPTURE_EXIT_CODES.OUTPUT_WRITE_FAILURE, outcome: 'OUTPUT_WRITE_FAILURE', ...none };
  }

  // ---- the bounded capture ---------------------------------------------------
  const result = await captureOwnerBoundPortfolio({
    env: deps.env,
    platform: deps.platform,
    portfolioId: args.portfolioId,
    maxAttempts: args.maxAttempts,
    retryDelayMs: args.retryDelayMs,
    transport: deps.transport,
    now,
    sleep: deps.sleep,
    onProgress: (line) => io.out(line),
    captureId,
  });

  // ---- LOCAL-ONLY outputs ----------------------------------------------------
  let exact: ExactCaptureReference = { written: false, fileName: null, sha256: null, bytes: null };
  let exactCapturePath: string | null = null;
  let candidatesPath: string | null = null;
  let writeFailure: string | null = null;

  if (result.outcome === 'CONSISTENT_CAPTURE') {
    try {
      const document = buildExactCaptureDocument(result, args.build);
      const target = path.join(localOnlyDirectory, EXACT_CAPTURE_FILE);
      const bytes = writeNewFile(target, `${JSON.stringify(document, null, 2)}\n`);
      exact = { written: true, fileName: EXACT_CAPTURE_FILE, sha256: sha256Hex(bytes), bytes: bytes.byteLength };
      exactCapturePath = target;
    } catch {
      writeFailure = 'the LOCAL-ONLY exact capture file could not be written';
    }
  } else if (result.candidates !== null) {
    try {
      const target = path.join(localOnlyDirectory, CANDIDATES_FILE);
      writeNewFile(
        target,
        `${JSON.stringify(
          {
            classification: 'LOCAL-ONLY - LISTED PORTFOLIO IDENTIFIERS - DO NOT PUBLISH',
            note: 'Portfolios IPD listed for the owner it resolved. Choose one and re-run with -PortfolioId <id>.',
            candidates: result.candidates,
          },
          null,
          2,
        )}\n`,
      );
      candidatesPath = target;
    } catch {
      writeFailure = 'the LOCAL-ONLY candidates file could not be written';
    }
  }

  // ---- sanitized summary (always, for every outcome) ---------------------------
  const finalOutcome: CliResult['outcome'] = writeFailure === null ? result.outcome : 'OUTPUT_WRITE_FAILURE';
  const exitCode = writeFailure === null ? result.exitCode : CAPTURE_EXIT_CODES.OUTPUT_WRITE_FAILURE;
  const summary = buildSanitizedSummary(result, args.build, exact);
  if (writeFailure !== null) {
    // A consistent read that could not be preserved is not a capture.
    summary.outcome = 'OUTPUT_WRITE_FAILURE';
    summary.reasonCode = 'LOCAL_ONLY_FILE_NOT_WRITTEN';
    summary.message = `${writeFailure}. No capture is claimed.`;
    summary.exitCode = exitCode;
    summary.evidenceEligibility = 'NO_CAPTURE';
  }

  let summaryPath: string | null = path.join(sanitizedDirectory, SUMMARY_JSON_FILE);
  try {
    writeNewFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
    writeNewFile(path.join(sanitizedDirectory, SUMMARY_MARKDOWN_FILE), renderSummaryMarkdown(summary));
  } catch {
    summaryPath = null;
    io.err('OUTPUT_WRITE_FAILURE: the sanitized summary could not be written. No capture is claimed.');
    return {
      exitCode: CAPTURE_EXIT_CODES.OUTPUT_WRITE_FAILURE,
      outcome: 'OUTPUT_WRITE_FAILURE',
      runDirectory,
      summaryPath,
      exactCapturePath,
      candidatesPath,
    };
  }

  // ---- outcome ---------------------------------------------------------------
  io.out('');
  if (exitCode === 0) {
    io.out(`OUTCOME: ${finalOutcome} (exit ${exitCode})`);
    io.out(String(summary.message));
  } else {
    io.err(`OUTCOME: ${finalOutcome} (exit ${exitCode})`);
    io.err(String(summary.message));
  }
  io.out(`Sanitized summary (publishable; NOT the complete evidence): ${summaryPath}`);
  if (exactCapturePath !== null) io.out(`Exact capture (LOCAL-ONLY; never publish):               ${exactCapturePath}`);
  if (candidatesPath !== null) io.out(`Portfolio candidates (LOCAL-ONLY; never publish):        ${candidatesPath}`);
  if (exitCode !== 0) io.err('No capture was produced. Nothing synthetic was substituted.');

  return { exitCode, outcome: finalOutcome, runDirectory, summaryPath, exactCapturePath, candidatesPath };
}

const invokedDirectly =
  process.argv[1] !== undefined && /capture-owner-bound-portfolio\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  runCaptureCli(process.argv.slice(2), {
    env: process.env,
    io: {
      out: (line) => process.stdout.write(`${line}\n`),
      err: (line) => process.stderr.write(`${line}\n`),
    },
  }).then(
    (result) => {
      process.exitCode = result.exitCode;
    },
    () => {
      process.stderr.write('INTERNAL_ERROR: the capture utility failed unexpectedly. Nothing was captured.\n');
      process.exitCode = CAPTURE_EXIT_CODES.INTERNAL_ERROR;
    },
  );
}
