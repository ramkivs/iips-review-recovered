#!/usr/bin/env tsx
/**
 * IID P6-A — operator CLI: report IID runtime dependency readiness.
 *
 *   tsx server/investment/cli/iid-readiness.ts [--json] [--data-dir <dir>] [--strict]
 *
 * READ-ONLY. It opens no database, contacts no IPC peer, writes nothing, and changes no environment.
 * It exists so an operator can see which dependency is missing and who must act, instead of starting
 * a transport and inferring the cause from separate 503 bodies.
 *
 * EXIT CODES
 *   0  every read-path dependency is satisfied (or --strict was not supplied)
 *   1  a read-path dependency is outstanding AND --strict was supplied
 *   2  the invocation itself was invalid
 *
 * The default exit code is 0 even when dependencies are outstanding: this is a REPORT, and a
 * non-zero default would make it look like a failed operation rather than an honest inventory.
 * Use --strict in a scripted preflight when an outstanding dependency must stop the sequence.
 *
 * Output carries setting NAMES and bounded reason codes only — never a value, owner pair, digest,
 * filesystem path or stack trace — so it is safe to attach to a review record.
 */
import { assessIidReadiness, formatIidReadiness, type ReadinessReport } from '../runtimeReadiness.js';

export interface ReadinessCliResult {
  readonly exitCode: number;
  readonly report: ReadinessReport | null;
  readonly text: string;
  readonly usageError: string | null;
}

const USAGE = 'usage: iid-readiness [--json] [--data-dir <dir>] [--strict]';

export function runReadinessCli(argv: readonly string[]): ReadinessCliResult {
  let json = false;
  let strict = false;
  let dataRoot: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') {
      json = true;
      continue;
    }
    if (arg === '--strict') {
      strict = true;
      continue;
    }
    if (arg === '--data-dir') {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) {
        return { exitCode: 2, report: null, text: '', usageError: `--data-dir requires a value. ${USAGE}` };
      }
      dataRoot = value;
      index += 1;
      continue;
    }
    return { exitCode: 2, report: null, text: '', usageError: `unknown argument. ${USAGE}` };
  }

  const report = assessIidReadiness(dataRoot === undefined ? {} : { dataRoot });
  const text = json ? JSON.stringify(report, null, 2) : formatIidReadiness(report);
  return { exitCode: strict && !report.ready ? 1 : 0, report, text, usageError: null };
}

const invokedDirectly =
  process.argv[1] !== undefined && /iid-readiness\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  const { exitCode, text, usageError } = runReadinessCli(process.argv.slice(2));
  if (usageError !== null) {
    process.stderr.write(`${usageError}\n`);
  } else {
    process.stdout.write(`${text}\n`);
  }
  process.exitCode = exitCode;
}
