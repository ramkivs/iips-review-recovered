/**
 * Read one persisted investment artifact's canonical payload back out of the governed store and verify it.
 *
 * `show-investment-chain.ts` prints identity, digests and counts but deliberately never the payload body — the
 * body is large and belongs to the transport. This CLI is the read-side counterpart used when the payload itself
 * is the evidence: it pulls the canonical bytes a `generate-investment-artifacts.ts` run persisted, writes them
 * verbatim to `--out`, and proves the bytes still hash to the digest recorded on the version. It is the step that
 * lets an evidence bundle carry `artifact/assessment-payload-*.json` as a *read-back of what was persisted*, not
 * as a re-serialization that could silently differ from the stored canonical form.
 *
 * Governance mirrors the generator: the owner context is resolved from the same carrier (`--owner-carrier` or
 * `IIPS_REPORTS_OWNER_PATH`) and the store from `--db` / `IIPS_NP04_DATABASE_PATH`. Nothing is written to the
 * store; the only file written is `--out`. A digest mismatch is a non-zero exit — the payload on disk is not the
 * payload that was persisted.
 *
 * Usage:
 *   tsx server/investment/cli/read-investment-payload.ts --issuer <issuerId> [--db <path>] \
 *     [--owner-carrier <path>] [--report-type <type>] [--version <reportId>] [--out <file>]
 */
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { companyScopeToken } from '../../../../iips-platform/src/investment/artifacts/scopeToken';
import { NP04_DATABASE_PATH_ENV, loadAuthoritativeNp04Persistence } from '../../reports/persistence-port.js';
import { REPORTS_OWNER_PATH_ENV, resolveReportsOwnerContext } from '../../reports-owner-resolver.js';
import { ASSESSMENT_REPORT_TYPE } from '../assessmentComposition.js';
import { createInvestmentArtifactService } from '../investmentArtifacts.js';

interface Args {
  readonly issuer: string;
  readonly db: string | null;
  readonly carrierPath: string | null;
  readonly reportType: string;
  readonly version: string | null;
  readonly out: string | null;
}

function parseArgs(argv: readonly string[]): Args {
  const get = (flag: string): string | null => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] !== undefined ? argv[index + 1]! : null;
  };
  const issuer = get('--issuer');
  if (issuer === null) {
    throw new Error(
      'usage: tsx server/investment/cli/read-investment-payload.ts --issuer <issuerId> [--db <path>] ' +
        '[--owner-carrier <path>] [--report-type <type>] [--version <reportId>] [--out <file>]',
    );
  }
  return {
    issuer,
    db: get('--db'),
    carrierPath: get('--owner-carrier'),
    reportType: get('--report-type') ?? ASSESSMENT_REPORT_TYPE,
    version: get('--version'),
    out: get('--out'),
  };
}

async function run(argv: readonly string[]): Promise<number> {
  const args = parseArgs(argv);
  const env: NodeJS.ProcessEnv = { ...process.env };
  if (args.db !== null) env[NP04_DATABASE_PATH_ENV] = args.db;
  if (args.carrierPath !== null) env[REPORTS_OWNER_PATH_ENV] = args.carrierPath;

  const owner = resolveReportsOwnerContext(env);
  if (owner === null) {
    process.stderr.write('FAIL owner: no owner context is established; nothing was read\n');
    return 2;
  }
  const port = await loadAuthoritativeNp04Persistence();
  if (port === null) {
    process.stderr.write(`FAIL persistence: set ${NP04_DATABASE_PATH_ENV} (or --db); nothing was read\n`);
    return 2;
  }

  const service = createInvestmentArtifactService({
    port,
    owner: { tenantId: owner.tenantId, userId: owner.ownerUserId },
  });
  const scope = companyScopeToken(args.issuer);
  const chain = service.readChain(scope, args.reportType);
  if (chain.versions.length === 0) {
    process.stderr.write(`FAIL chain: no versions persisted for scope ${scope}\n`);
    return 3;
  }
  const reportId = args.version ?? chain.versions[chain.versions.length - 1]!.reportId;
  const { version, payload } = service.readVersionWithPayload(scope, reportId, args.reportType);

  // The stored payload is already canonical JSON; hash the bytes verbatim, never a re-stringification.
  const bytes = Buffer.from(payload, 'utf8');
  const recomputed = createHash('sha256').update(bytes).digest('hex');
  const recorded = version.payloadDigest;
  const matches = recomputed === recorded;

  if (args.out !== null) writeFileSync(args.out, bytes);

  process.stdout.write(
    `${matches ? 'OK' : 'FAIL'}  read-back  scope ${scope}  version ${reportId}\n` +
      `  versionCount   ${chain.versions.length}\n` +
      `  reportType     ${args.reportType}\n` +
      `  payloadBytes   ${bytes.length}\n` +
      `  recordedDigest ${recorded}\n` +
      `  recomputed     ${recomputed}\n` +
      `  out            ${args.out ?? '(not written)'}\n`,
  );
  if (!matches) {
    process.stderr.write('FAIL the persisted payload no longer hashes to its recorded digest\n');
    return 4;
  }
  return 0;
}

// ESM guard: the sibling CLIs (`show-investment-chain`, `generate-investment-artifacts`) key off `process.argv[1]`
// rather than `require.main`, which is undefined in this module format. Same shape here so an import (as the test
// does) never fires the CLI and a direct `tsx …read-investment-payload.ts` invocation always does.
const invokedDirectly = process.argv[1] !== undefined && /read-investment-payload\.(ts|js)$/.test(process.argv[1]);

if (invokedDirectly) {
  void run(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (cause: unknown) => {
      process.stderr.write(`FAIL ${cause instanceof Error ? cause.message : String(cause)}\n`);
      process.exit(1);
    },
  );
}

export { run as readInvestmentPayload };
