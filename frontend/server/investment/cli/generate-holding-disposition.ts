/**
 * IID Stage 6 — S6-1b operator CLI: generate ONE disposition for an ACTUAL persisted holding.
 *
 *   tsx server/investment/cli/generate-holding-disposition.ts --portfolio <portfolioId> --holding <selector>
 *       [--db <path>] [--owner-carrier <path>] [--data-root <dir>] [--as-of <YYYY-MM-DD>] [--dry-run] [--out <file>]
 *
 *   <selector>   `symbol:INFY` | `isin:INE009A01021` | `index:0` | a bare symbol-or-ISIN
 *
 * What it reads, and from where (nothing else):
 *   - the portfolio view        the SAME same-host IPC read channel every holdings read uses
 *                               (`IIPS_G2_IPC_ENDPOINT`, `IIPS_G3_IPC_BINDING_PROVISIONED=true`; IPD resolves the owner);
 *   - identity sources          `<data-root>/investment/identity/*` (`--data-root`, else `IIPS_DATA_DIR`, else `<cwd>/.iips-data`);
 *   - the limits policy         `<data-root>/investment/policies/limits-policy.json` through the S6-1 loader —
 *                               absent ⇒ labelled SYSTEM_DEFAULT; invalid ⇒ exit 2, nothing read further, nothing written;
 *   - the assessment            the latest persisted `investment.company-assessment` for the resolved issuer in the
 *                               authoritative NP-04 store (`--db` / `IIPS_NP04_DATABASE_PATH`, owner from
 *                               `--owner-carrier` / `IIPS_REPORTS_OWNER_PATH`). The store is opened with READ intent:
 *                               it must already exist; this CLI never creates or migrates one.
 *
 * What it writes: at most one `investment.holding-disposition` version on the `hd:<portfolio>/<security>` chain,
 * through `createDispositionRecordsService().record()`. A re-run with unchanged inputs writes nothing
 * (`UNCHANGED` / `CLOCK_ONLY_UNCHANGED`). `--dry-run` builds and reports the disposition and records nothing.
 *
 * Exit codes: 0 recorded / unchanged / dry run; 2 stopped on a named precondition (owner, store, policy, holding,
 * identity, assessment, inconsistency, persistence) with nothing written; 1 unexpected failure.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { loadRuntimeIdentitySources, runtimeIdentityDir } from '../../../../iips-platform/src/investment/identity/runtime';
import { NP04_DATABASE_PATH_ENV, loadAuthoritativeNp04Persistence, releaseAllNp04Databases } from '../../reports/persistence-port.js';
import { REPORTS_OWNER_PATH_ENV, resolveReportsOwnerContext } from '../../reports-owner-resolver.js';
import {
  HOLDING_DISPOSITION_REPORT_SCHEMA,
  HoldingDispositionFailure,
  generateHoldingDisposition,
  parseHoldingSelector,
  type HoldingDispositionRunReport,
} from '../holdingDisposition.js';
import { createPortfolioViewProvider } from '../sources.js';
import { resolveLimitsPolicyPath } from '../limitsPolicySource.js';

export interface CliArgs {
  readonly portfolioId: string;
  readonly holding: string;
  readonly db: string | null;
  readonly carrierPath: string | null;
  readonly dataRoot: string | null;
  readonly asOf: string | null;
  readonly dryRun: boolean;
  readonly out: string | null;
}

export const USAGE =
  'usage: tsx server/investment/cli/generate-holding-disposition.ts --portfolio <portfolioId> --holding <symbol:X|isin:Y|index:N|X> ' +
  '[--db <path>] [--owner-carrier <path>] [--data-root <dir>] [--as-of <YYYY-MM-DD>] [--dry-run] [--out <file>]';

export function parseArgs(argv: readonly string[]): CliArgs {
  const get = (flag: string): string | null => {
    const index = argv.indexOf(flag);
    if (index === -1) return null;
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`${flag} requires a value\n${USAGE}`);
    return value;
  };
  const portfolioId = get('--portfolio');
  const holding = get('--holding');
  if (portfolioId === null || holding === null) throw new Error(USAGE);
  const asOf = get('--as-of');
  if (asOf !== null && !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error(`--as-of must be YYYY-MM-DD\n${USAGE}`);
  return {
    portfolioId,
    holding,
    db: get('--db'),
    carrierPath: get('--owner-carrier'),
    dataRoot: get('--data-root'),
    asOf,
    dryRun: argv.includes('--dry-run'),
    out: get('--out'),
  };
}

export interface CliFailureReport {
  readonly schemaVersion: typeof HOLDING_DISPOSITION_REPORT_SCHEMA;
  readonly status: 'STOPPED';
  readonly generatedAt: string;
  readonly failure: { readonly code: string; readonly message: string; readonly detail: Readonly<Record<string, unknown>> };
  readonly wrote: false;
}

export type CliOutcome = { readonly exitCode: 0; readonly report: HoldingDispositionRunReport } | { readonly exitCode: 2; readonly report: CliFailureReport };

function stopped(generatedAt: string, code: string, message: string, detail: Readonly<Record<string, unknown>> = {}): CliOutcome {
  return {
    exitCode: 2,
    report: { schemaVersion: HOLDING_DISPOSITION_REPORT_SCHEMA, status: 'STOPPED', generatedAt, failure: { code, message, detail }, wrote: false },
  };
}

/**
 * The run, with the environment it reads made explicit. `loadPort` and `loadPortfolioView` are injectable so the
 * fixture tests can drive the SAME code against a fixture store and a fixture view; production supplies neither.
 */
export async function runCli(
  argv: readonly string[],
  deps: {
    readonly env?: NodeJS.ProcessEnv;
    readonly now?: () => string;
    readonly loadPort?: () => Promise<unknown>;
    readonly loadPortfolioView?: (portfolioId: string) => Promise<Awaited<ReturnType<ReturnType<typeof createPortfolioViewProvider>>>>;
  } = {},
): Promise<CliOutcome> {
  const env = deps.env ?? process.env;
  const generatedAt = (deps.now ?? (() => new Date().toISOString()))();
  const args = parseArgs(argv);
  const dataRoot = args.dataRoot === null ? undefined : resolve(args.dataRoot);

  // Owner context first: a run without one reads and writes nothing.
  const owner = resolveReportsOwnerContext(args.carrierPath === null ? env : { ...env, [REPORTS_OWNER_PATH_ENV]: args.carrierPath });
  if (owner === null) {
    return stopped(generatedAt, 'OWNER_CONTEXT_UNAVAILABLE', `no owner context is established (set ${REPORTS_OWNER_PATH_ENV} or --owner-carrier); nothing was read`);
  }

  const port = await (deps.loadPort ?? (() => loadPortWithReadIntent(args.db, env)))();
  if (port === null || port === undefined) {
    return stopped(
      generatedAt,
      'PERSISTENCE_UNAVAILABLE',
      `the authoritative NP-04 store is unavailable (set ${NP04_DATABASE_PATH_ENV} or --db to an EXISTING store; this command never creates one); nothing was read`,
    );
  }

  try {
    const report = await generateHoldingDisposition(
      {
        portfolioId: args.portfolioId,
        holding: parseHoldingSelector(args.holding),
        generatedAt,
        ...(args.asOf === null ? {} : { asOf: args.asOf }),
        dryRun: args.dryRun,
      },
      {
        loadPortfolioView: deps.loadPortfolioView ?? createPortfolioViewProvider({ env }),
        loadIdentitySources: () => loadRuntimeIdentitySources(dataRoot),
        ...(dataRoot === undefined ? {} : { dataRoot }),
        port,
        owner: { tenantId: owner.tenantId, userId: owner.ownerUserId },
      },
    );
    return { exitCode: 0, report };
  } catch (cause) {
    if (cause instanceof HoldingDispositionFailure) {
      return stopped(generatedAt, cause.code, cause.message, {
        ...cause.detail,
        identityDir: runtimeIdentityDir(dataRoot),
        limitsPolicyPath: resolveLimitsPolicyPath(dataRoot, env),
      });
    }
    throw cause;
  }
}

/**
 * READ intent on purpose: the mint CLI (`generate-investment-artifacts`) is the one caller allowed to bring a store
 * into existence. A disposition for a real holding presupposes an assessment already persisted in an existing
 * store, so an absent store is a precondition failure here, not something to create.
 */
async function loadPortWithReadIntent(dbPath: string | null, env: NodeJS.ProcessEnv): Promise<unknown> {
  if (dbPath === null) return loadAuthoritativeNp04Persistence('READ');
  const previous = env[NP04_DATABASE_PATH_ENV];
  env[NP04_DATABASE_PATH_ENV] = resolve(dbPath);
  try {
    return await loadAuthoritativeNp04Persistence('READ');
  } finally {
    if (previous === undefined) delete env[NP04_DATABASE_PATH_ENV];
    else env[NP04_DATABASE_PATH_ENV] = previous;
  }
}

/** The operator-facing summary lines (stderr). The JSON report (stdout / `--out`) is the record. */
export function summaryLines(outcome: CliOutcome): readonly string[] {
  if (outcome.exitCode === 2) {
    return [`STOPPED ${outcome.report.failure.code}: ${outcome.report.failure.message}`, 'wrote: nothing'];
  }
  const r = outcome.report;
  return [
    `${r.status.padEnd(9)} holding   ${r.portfolio.portfolioId} #${r.holding.index} ${r.holding.symbol} (${r.holding.isin ?? 'no ISIN'}) weight ${r.holding.weightPercentage}%`,
    `${''.padEnd(9)} identity  ${r.identity.issuerId} / ${r.identity.securityId} [${r.identity.resolutionBasis ?? '-'}] securityState=${r.identity.securityState} roster=${r.identity.rosterDataClass}`,
    `${''.padEnd(9)} assessment ${r.assessment.reportId} v${r.assessment.artifactVersion} (${r.assessment.versionCount} version(s)) adequacy=${r.assessment.adequacy} dataset=${r.assessment.datasetClass}`,
    `${''.padEnd(9)} limits    basis=${r.limits.basis} policyVersion=${r.limits.policyVersion} source=${r.limits.source.kind} singleName=${r.limits.singleNameMaxPct}% sectorDefault=${r.limits.defaultSectorMaxPct}%`,
    `${''.padEnd(9)} disposition verb=${r.disposition.verb ?? 'WITHHELD'} caps=${r.disposition.capsApplied.length} previous=${r.previous?.verb ?? 'none'} hardTrigger=${r.hardTrigger.hardTrigger}`,
    r.persistence === null
      ? `${''.padEnd(9)} persistence not attempted (dry run)`
      : `${''.padEnd(9)} persistence ${r.persistence.outcome} wrote=${r.persistence.wrote} head=${r.persistence.headReportId} v${r.persistence.headArtifactVersion} chain=${r.disposition.scopeToken} versions=${r.persistence.versionCount}`,
  ];
}

const invokedDirectly = process.argv[1] !== undefined && /generate-holding-disposition\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  void runCli(process.argv.slice(2))
    .then((outcome) => {
      const argv = process.argv.slice(2);
      const outIndex = argv.indexOf('--out');
      const out = outIndex === -1 ? null : argv[outIndex + 1] ?? null;
      const text = `${JSON.stringify(outcome.report, null, 2)}\n`;
      if (out !== null) {
        mkdirSync(dirname(resolve(out)), { recursive: true });
        writeFileSync(resolve(out), text, 'utf8');
      }
      process.stdout.write(text);
      for (const line of summaryLines(outcome)) process.stderr.write(`${line}\n`);
      process.exitCode = outcome.exitCode;
    })
    .catch((cause: unknown) => {
      process.stderr.write(`FAIL ${cause instanceof Error ? cause.message : String(cause)}\n`);
      process.exitCode = 1;
    })
    .finally(() => {
      releaseAllNp04Databases();
    });
}
