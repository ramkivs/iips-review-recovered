/**
 * W05 — `run-census-reconciliation`: the revision-1 W05–W04 reconciliation driver (workflow steps 2–3).
 *
 *   tsx src/investment/cli/run-census-reconciliation.ts <bundle-dir> --out <out-dir>
 *     [--as-of YYYY-MM-DD] [--expect-count N] [--generated-at ISO]
 *
 * The bundle is the operator input bundle specified in `docs/integration/W05-W04-RECONCILIATION-2026-11-18.md`
 * §4, laid out as a directory:
 *
 *   <bundle>/census-rows.json            CensusHoldingRow[] verbatim (the harness rows interface)
 *   <bundle>/identity-sources/           eligible-roster.json, listing-map.json, corporate-actions.json
 *   <bundle>/datasets/<name>/            optional candidate datasets (read with the product's own reader)
 *   <bundle>/eligible-set.json           optional EligibleSetDesignation { basis, exclusions[] }
 *   <bundle>/w04-census-expected.json    optional { total, categories } — strict count validation
 *   <bundle>/provenance.json             optional; carried verbatim into the output (Step 1 writes it)
 *   <bundle>/input-digests.json          optional { algorithm, files: { path: { sha256, bytes } } }
 *
 * This driver invents nothing: rows are consumed verbatim by `runCensusReconciliation`, identity sources
 * are read by the product's own loader, datasets by the product's own reader, and every refusal is a
 * validation failure with the offending item named. It never substitutes one census for another: a run
 * over anything but the W04 revision-1 rows is labelled as such in the output (the harness headline).
 *
 * Exit codes follow `verify-retrieval-evidence.ts`: 0 every check passed; 1 at least one check failed
 * (nothing is written outside --out, and the run stops before calling the harness); 2 the bundle could
 * not be read at all.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loadIdentitySourcesFromDir } from '../identity/sources';
import {
  tryCatalogEntryFromDatasetDir,
  type DatasetCatalogEntry,
  type EligibleSetDesignation,
} from '../lifecycle/issuerLifecycle';
import {
  runCensusReconciliation,
  type CensusHoldingRow,
  type CensusReconciliationResult,
} from '../lifecycle/censusReconciliation';

export const CENSUS_CATEGORIES: readonly CensusHoldingRow['category'][] = [
  'QUALIFIED',
  'AMBIGUOUS',
  'MISSING_OR_UNRESOLVED',
  'EXPIRED_OR_INELIGIBLE',
  'UNAVAILABLE',
];

interface DriverArgs {
  readonly bundleDir: string;
  readonly outDir: string;
  readonly asOf: string | null;
  readonly expectCount: number | null;
  readonly generatedAt: string | null;
}

interface InputDigests {
  readonly algorithm: string;
  readonly files: Readonly<Record<string, { readonly sha256: string; readonly bytes: number }>>;
}

interface W04Expected {
  readonly total: number;
  readonly categories: Readonly<Record<string, number>>;
}

function sha256Of(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function fail(message: string): never {
  throw new DriverRefusal(message);
}

class DriverRefusal extends Error {}
class UnreadableBundle extends Error {}

function parseArgs(argv: readonly string[]): DriverArgs {
  const positional: string[] = [];
  let outDir: string | null = null;
  let asOf: string | null = null;
  let expectCount: number | null = null;
  let generatedAt: string | null = null;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]!;
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) {
      fail(`${token} requires a value; a flag with no value, or followed by another flag, is refused`);
    }
    index += 1;
    if (token === '--out') outDir = value;
    else if (token === '--as-of') asOf = value;
    else if (token === '--expect-count') {
      expectCount = Number(value);
      if (!Number.isInteger(expectCount) || expectCount < 0) fail(`--expect-count must be a non-negative integer, got "${value}"`);
    } else if (token === '--generated-at') generatedAt = value;
    else fail(`unknown flag ${token}`);
  }
  if (positional.length !== 1) fail('usage: run-census-reconciliation.ts <bundle-dir> --out <out-dir> [--as-of YYYY-MM-DD] [--expect-count N] [--generated-at ISO]');
  if (outDir === null) fail('--out is required');
  return { bundleDir: resolve(positional[0]!), outDir: resolve(outDir), asOf, expectCount, generatedAt };
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new UnreadableBundle(`${path} could not be read or parsed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Structural validation of one `CensusHoldingRow`. Every problem is named; nothing is guessed or filled in. */
function rowProblems(value: unknown, index: number): string[] {
  const problems: string[] = [];
  if (!isPlainObject(value)) return [`row ${index}: not an object`];
  const row = value as Record<string, unknown>;
  if (typeof row.holdingId !== 'string' || row.holdingId.trim() === '') problems.push(`row ${index}: holdingId must be a non-empty string`);
  if (typeof row.portfolioId !== 'string') problems.push(`row ${index}: portfolioId must be a string`);
  if (typeof row.portfolioRevision !== 'string') problems.push(`row ${index}: portfolioRevision must be a string`);
  for (const field of ['symbol', 'isin', 'exchange', 'storedSecurityIdentity'] as const) {
    if (!(field in row)) problems.push(`row ${index}: ${field} is required (string or null)`);
    else if (row[field] !== null && typeof row[field] !== 'string') problems.push(`row ${index}: ${field} must be a string or null`);
  }
  if (!('quantity' in row)) problems.push(`row ${index}: quantity is required (number or null)`);
  else if (row.quantity !== null && typeof row.quantity !== 'number') problems.push(`row ${index}: quantity must be a number or null`);
  if (typeof row.category !== 'string' || !CENSUS_CATEGORIES.includes(row.category as CensusHoldingRow['category'])) {
    problems.push(`row ${index}: category must be one of ${CENSUS_CATEGORIES.join(', ')}`);
  }
  return problems;
}

function validateEligibleSet(value: unknown): EligibleSetDesignation {
  if (!isPlainObject(value)) fail('eligible-set.json must be an object { basis, exclusions[] }');
  const basis = value.basis;
  const exclusions = value.exclusions;
  if (typeof basis !== 'string' || basis.trim() === '') fail('eligible-set.json: basis must be a non-empty string');
  if (!Array.isArray(exclusions)) fail('eligible-set.json: exclusions must be an array');
  for (const entry of exclusions as unknown[]) {
    if (!isPlainObject(entry)) fail('eligible-set.json: every exclusion must be { observationId, reason }');
    if (typeof entry.observationId !== 'string' || entry.observationId === '') fail('eligible-set.json: exclusion.observationId must be a non-empty string');
    if (typeof entry.reason !== 'string' || entry.reason === '') fail('eligible-set.json: exclusion.reason must be a non-empty string');
  }
  return { basis, exclusions: exclusions as EligibleSetDesignation['exclusions'] };
}

function categoryCounts(rows: readonly CensusHoldingRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const category of CENSUS_CATEGORIES) counts[category] = 0;
  for (const row of rows) counts[row.category] = (counts[row.category] ?? 0) + 1;
  return counts;
}

function writeOutput(outDir: string, name: string, text: string, digests: Record<string, { sha256: string; bytes: number }>): void {
  const path = join(outDir, name);
  writeFileSync(path, text, 'utf8');
  const bytes = Buffer.byteLength(text, 'utf8');
  digests[name] = { sha256: createHash('sha256').update(text).digest('hex'), bytes };
}

function summaryText(result: CensusReconciliationResult, bundleDir: string): string {
  const lines: string[] = [];
  lines.push(`W05–W04 census reconciliation — as of ${result.asOf} (bundle: ${bundleDir})`);
  lines.push(`rows supplied: ${result.summary.rowsSupplied}; run resolved: ${result.summary.runResolved}; run unresolved: ${result.summary.runUnresolved}; excluded from E: ${result.summary.excludedFromEligibleSet}`);
  lines.push(`contributes to financial-ratio numerator: ${result.summary.contributesToFinancialRatioNumerator}`);
  lines.push(`eligible set: ${result.eligibleSet.designated ? 'designated' : 'NOT designated'} — basis: ${result.eligibleSet.basis}; |E| = ${result.eligibleSet.size}`);
  lines.push(`agreement: BOTH_IDENTIFIED ${result.summary.agreement.BOTH_IDENTIFIED}; BOTH_UNIDENTIFIED ${result.summary.agreement.BOTH_UNIDENTIFIED}; CENSUS_ONLY ${result.summary.agreement.CENSUS_ONLY}; RUN_ONLY ${result.summary.agreement.RUN_ONLY}`);
  lines.push('category × run disposition:');
  for (const entry of result.summary.categoryByDisposition) {
    lines.push(`  ${entry.category}: resolved ${entry.resolved}, unresolved ${entry.unresolved}, excluded ${entry.excludedFromEligibleSet}`);
  }
  lines.push('holding-level entries:');
  for (const entry of result.entries) {
    lines.push(`  ${entry.holdingId} [${entry.census.category}] ${entry.run.disposition}${entry.run.issuerId === null ? '' : ` → ${entry.run.issuerId}`} (${entry.run.resolutionBasis ?? 'no basis'}) agreement ${entry.identityAgreement.state}${entry.identityAgreement.agrees ? '' : ' DISAGREES'}`);
    if (!entry.identityAgreement.agrees && entry.identityAgreement.note !== null) lines.push(`      ${entry.identityAgreement.note}`);
  }
  lines.push(`headline: ${result.summary.headline}`);
  for (const note of result.notes) lines.push(`note: ${note}`);
  return `${lines.join('\n')}\n`;
}

function holdingLevelTsv(result: CensusReconciliationResult): string {
  const lines: string[] = [
    'holdingId\tportfolioId\tportfolioRevision\tquantity\tcategory\tstoredSecurityIdentity\tdisposition\tresolutionBasis\tissuerId\tstates\tcontributesToRatio\tagreementState\tagrees',
  ];
  for (const entry of result.entries) {
    lines.push(
      [
        entry.holdingId,
        entry.portfolioId,
        entry.portfolioRevision,
        entry.quantity === null ? 'NULL' : String(entry.quantity),
        entry.census.category,
        entry.census.storedSecurityIdentity === null ? 'NULL' : entry.census.storedSecurityIdentity,
        entry.run.disposition,
        entry.run.resolutionBasis ?? 'NULL',
        entry.run.issuerId ?? 'NULL',
        entry.run.states.join(';'),
        String(entry.run.contributesToFinancialRatioNumerator),
        entry.identityAgreement.state,
        String(entry.identityAgreement.agrees),
      ].join('\t'),
    );
  }
  return `${lines.join('\n')}\n`;
}

export function run(argv: readonly string[]): number {
  let args: DriverArgs;
  try {
    args = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return error instanceof UnreadableBundle ? 2 : 1;
  }

  try {
    if (!existsSync(args.bundleDir) || !statSync(args.bundleDir).isDirectory()) throw new UnreadableBundle(`bundle directory not found: ${args.bundleDir}`);
    const rowsPath = join(args.bundleDir, 'census-rows.json');
    if (!existsSync(rowsPath)) fail(`missing ${rowsPath} — the bundle is incomplete; this driver never invents rows`);
    const rowsValue = readJson(rowsPath);
    if (!Array.isArray(rowsValue)) fail('census-rows.json must be a top-level JSON array of CensusHoldingRow');
    if (rowsValue.length === 0) fail('census-rows.json is empty; a run over zero rows is not a reconciliation');
    const problems: string[] = [];
    rowsValue.forEach((value, index) => problems.push(...rowProblems(value, index)));
    const seen = new Set<string>();
    for (const value of rowsValue as Array<Record<string, unknown>>) {
      const id = typeof value.holdingId === 'string' ? value.holdingId : '';
      if (id !== '' && seen.has(id)) problems.push(`duplicate holdingId ${id} — every holding appears exactly once`);
      if (id !== '') seen.add(id);
    }
    if (problems.length > 0) fail(`census-rows.json failed validation:\n  ${problems.join('\n  ')}`);
    const rows = rowsValue as CensusHoldingRow[];

    // Optional integrity manifest: every listed file must match before anything else happens.
    const digestsPath = join(args.bundleDir, 'input-digests.json');
    if (existsSync(digestsPath)) {
      const digestsValue = readJson(digestsPath);
      if (!isPlainObject(digestsValue) || !isPlainObject(digestsValue.files)) fail('input-digests.json must be { algorithm, files: { path: { sha256, bytes } } }');
      for (const [relPath, entry] of Object.entries(digestsValue.files as Record<string, unknown>)) {
        const filePath = join(args.bundleDir, relPath);
        if (!existsSync(filePath)) fail(`input-digests.json lists ${relPath}, which is not in the bundle`);
        if (!isPlainObject(entry) || typeof entry.sha256 !== 'string') fail(`input-digests.json: ${relPath} entry must carry sha256`);
        const actual = sha256Of(filePath);
        if (actual !== entry.sha256) fail(`digest mismatch for ${relPath}: bundle says ${entry.sha256}, file hashes to ${actual}`);
      }
    }

    // Strict census-count expectations (W04 record), when the bundle supplies them.
    const expectedPath = join(args.bundleDir, 'w04-census-expected.json');
    if (existsSync(expectedPath)) {
      const expectedValue = readJson(expectedPath);
      if (!isPlainObject(expectedValue) || typeof expectedValue.total !== 'number' || !isPlainObject(expectedValue.categories)) {
        fail('w04-census-expected.json must be { total, categories }');
      }
      const expected = expectedValue as unknown as W04Expected;
      const counts = categoryCounts(rows);
      const countProblems: string[] = [];
      if (rows.length !== expected.total) countProblems.push(`row count ${rows.length} does not match the W04 record total ${expected.total}`);
      for (const category of CENSUS_CATEGORIES) {
        const want = expected.categories[category] ?? 0;
        if ((counts[category] ?? 0) !== want) countProblems.push(`category ${category}: bundle has ${counts[category] ?? 0}, the W04 record expects ${want}`);
      }
      if (countProblems.length > 0) {
        fail(`the bundle does not match the W04 census record — the run stops (a mismatch is itself a reconciliation finding):\n  ${countProblems.join('\n  ')}`);
      }
    }
    if (args.expectCount !== null && rows.length !== args.expectCount) {
      fail(`row count ${rows.length} does not match --expect-count ${args.expectCount}`);
    }

    // Identity sources: the installed triple, read by the product's own loader. Required, fail-closed.
    const sourcesDir = join(args.bundleDir, 'identity-sources');
    if (!existsSync(sourcesDir)) fail(`missing ${sourcesDir} — the installed identity sources are part of the input bundle`);
    const loaded = loadIdentitySourcesFromDir(sourcesDir);
    if (!loaded.available) fail(`identity sources failed to load: ${JSON.stringify(loaded.issues)}`);

    // Candidate datasets: the product's own reader; a bad dataset is a refusal, never silently dropped.
    const datasetsDir = join(args.bundleDir, 'datasets');
    const datasets: DatasetCatalogEntry[] = [];
    if (existsSync(datasetsDir)) {
      for (const name of readdirSync(datasetsDir).sort()) {
        const dir = join(datasetsDir, name);
        if (!statSync(dir).isDirectory()) continue;
        const read = tryCatalogEntryFromDatasetDir(dir, name);
        if (!read.ok) fail(`dataset ${name} could not be read (${read.errorName}): ${read.error}`);
        datasets.push(read.entry);
      }
    }

    let eligibleSet: EligibleSetDesignation | undefined;
    const eligibleSetPath = join(args.bundleDir, 'eligible-set.json');
    if (existsSync(eligibleSetPath)) eligibleSet = validateEligibleSet(readJson(eligibleSetPath));

    let provenance: unknown = null;
    const provenancePath = join(args.bundleDir, 'provenance.json');
    if (existsSync(provenancePath)) provenance = readJson(provenancePath);

    const asOf = args.asOf ?? (isPlainObject(provenance) && typeof provenance.asOf === 'string' ? provenance.asOf : null);
    if (asOf === null) fail('no --as-of given and provenance.json carries none; the run refuses to guess a date');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) fail(`asOf must be YYYY-MM-DD (the identities-route contract), received "${asOf}"`);
    const generatedAt = args.generatedAt ?? `${asOf}T00:00:00.000Z`;

    const result = runCensusReconciliation({
      asOf,
      rows,
      identitySources: loaded.sources,
      datasets,
      ...(eligibleSet === undefined ? {} : { eligibleSet }),
    });

    // Evidence outputs. Every byte written is digested; the run is repeatable for fixed inputs.
    mkdirSync(args.outDir, { recursive: true });
    const outputDigests: Record<string, { sha256: string; bytes: number }> = {};
    const resultEnvelope = {
      driver: 'run-census-reconciliation',
      driverVersion: 1,
      generatedAt,
      bundleDir: args.bundleDir,
      provenance,
      result,
    };
    writeOutput(args.outDir, 'reconciliation-result.json', `${JSON.stringify(resultEnvelope, null, 2)}\n`, outputDigests);
    writeOutput(args.outDir, 'reconciliation-summary.txt', summaryText(result, args.bundleDir), outputDigests);
    writeOutput(args.outDir, 'holding-level.tsv', holdingLevelTsv(result), outputDigests);
    const disagreements = result.entries.filter((entry) => !entry.identityAgreement.agrees);
    writeOutput(args.outDir, 'disagreements.json', `${JSON.stringify({ count: disagreements.length, entries: disagreements }, null, 2)}\n`, outputDigests);
    writeOutput(args.outDir, 'output-digests.json', `${JSON.stringify({ algorithm: 'SHA-256', files: outputDigests }, null, 2)}\n`, {});
    process.stdout.write(`reconciliation ok — ${result.summary.rowsSupplied} rows, ${disagreements.length} disclosed disagreement(s); outputs in ${args.outDir}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    return error instanceof UnreadableBundle ? 2 : 1;
  }
}

const invokedDirectly = process.argv[1] !== undefined && /run-census-reconciliation\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  process.exitCode = run(process.argv.slice(2));
}
