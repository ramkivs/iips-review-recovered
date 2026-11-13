#!/usr/bin/env tsx
/**
 * IID-0 — fundamentals ingestion CLI (file in, files out).
 *
 *   tsx src/investment/cli/ingest.ts --input <dir> --dataset-dir <dir> [--now <iso>] [--allow-errors] \
 *     [--dataset-schema <IIPS_INVESTMENT_FUNDAMENTALS_V1|IIPS_INVESTMENT_FUNDAMENTALS_V2>]
 *
 * `--dataset-schema` declares the dataset grammar the operator is supplying. It is optional and defaults to the
 * legacy V1 grammar, so every existing command line produces exactly the dataset it produced before. It exists
 * because `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` is introduced by V2 (`L-036`): without a way to declare
 * V2, the one item V2 adds could be accepted by the library and never by an operator.
 *
 * Input directory layout:
 *   roster.json              { issuers[], securities[], listings[] }   (required)
 *   periods.csv              normalised statement facts                (optional)
 *   operating-metrics.csv    operating metric observations              (optional)
 *   corporate-actions.json   { corporateActions[] }                     (optional)
 *   prices.json              { prices[] }                               (optional)
 *   xbrl-filings.json        [{ file, issuerId, periodEnd, statementScope, filingRef, filedAt, basis? }] (optional)
 *   xbrl/*.xml               XBRL instance documents                     (optional)
 *
 * No network calls of any kind. Nothing outside the given directories is read or written.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { buildDatasetContent, type DatasetInputs, type TextFile, type XbrlFileInput } from '../ingestion/builder';
import { assertValidIssuerSectors } from '../ingestion/sectorValidation';
import { assertSupportedDatasetSchema, type DatasetSchema } from '../contracts/lineItems';
import { COVERAGE_FILE_NAME, writeDataset } from '../ingestion/writer';
import { canonicalize } from '../fundamentals/canonical';
import { measureCoverage, renderCoverageSummary } from '../coverage/measure';
import type { CorporateActionRecord, IssuerRecord, ListingRecord, PriceRecord, SecurityRecord } from '../fundamentals/types';

/** One line of `xbrl-filings.json`: the instance file plus the issuer/period it belongs to. */
interface XbrlFilingDeclaration {
  readonly file: string;
  readonly issuerId: string;
  readonly periodEnd: string;
  readonly statementScope: 'CONSOLIDATED' | 'STANDALONE';
  readonly filingRef: string;
  readonly filedAt: string;
  readonly basis?: 'AS_FILED' | 'RESTATED';
  readonly restatementOf?: string | null;
}

interface Args {
  readonly inputDir: string;
  readonly datasetDir: string;
  readonly now: string;
  readonly allowErrors: boolean;
  /** The declared dataset grammar. Absent means the legacy V1 grammar, exactly as before the flag existed. */
  readonly datasetSchema: DatasetSchema;
}

function parseArgs(argv: readonly string[]): Args {
  const get = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    return index === -1 ? undefined : argv[index + 1];
  };
  const inputDir = get('--input');
  const datasetDir = get('--dataset-dir');
  if (inputDir === undefined || datasetDir === undefined) {
    throw new Error(
      'usage: ingest.ts --input <dir> --dataset-dir <dir> [--now <iso>] [--allow-errors] [--dataset-schema <schema>]',
    );
  }
  return {
    inputDir: resolve(inputDir),
    datasetDir: resolve(datasetDir),
    now: get('--now') ?? new Date().toISOString(),
    allowErrors: argv.includes('--allow-errors'),
    // Fail closed on a grammar this build does not know, before anything is read: `assertSupportedDatasetSchema`
    // is the single authority on which schemas exist, so the CLI cannot invent one.
    datasetSchema: assertSupportedDatasetSchema(get('--dataset-schema')),
  };
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function readTextFile(path: string): TextFile {
  return { name: path.split(/[\\/]/).pop() ?? path, text: readFileSync(path, 'utf8') };
}

export function loadInputs(inputDir: string, datasetSchema?: DatasetSchema): DatasetInputs {
  const rosterPath = join(inputDir, 'roster.json');
  if (!existsSync(rosterPath)) throw new Error(`roster.json is required in ${inputDir}`);
  const roster = readJson<{ issuers: IssuerRecord[]; securities: SecurityRecord[]; listings: ListingRecord[] }>(rosterPath);
  /**
   * `S3-D1` — validate the sector vocabulary HERE, before anything is built or written.
   *
   * The cast on the line above is an assertion, not a validation: `readJson` is
   * `JSON.parse(...) as T`, so `roster.issuers` is typed `IssuerRecord[]` whether or not the file
   * actually held canonical sectors. `IssuerRecord.sector` is the closed `SectorName` union, but a type
   * is erased at runtime and coverage measurement selects issuers by string equality, so an off-
   * vocabulary sector used to make its issuer match no sector at all — an ingestion that exited `0`,
   * recorded no issue, and measured zero sectors.
   *
   * Validating before `buildDatasetContent` is also what makes the failure non-destructive: `writeDataset`
   * replaces a dataset directory file by file, so a roster this build cannot interpret must never reach
   * it. Throwing here means an existing valid dataset is left untouched. Not bypassable by
   * `--allow-errors`, which accepts ingestion issues, not uninterpretable input.
   */
  assertValidIssuerSectors(roster.issuers, rosterPath);

  const optional = (name: string): string | null => {
    const path = join(inputDir, name);
    return existsSync(path) ? path : null;
  };

  const periodsPath = optional('periods.csv');
  const metricsPath = optional('operating-metrics.csv');
  const actionsPath = optional('corporate-actions.json');
  const pricesPath = optional('prices.json');
  const filingsPath = optional('xbrl-filings.json');

  const xbrlDir = join(inputDir, 'xbrl');
  let xbrlFiles: XbrlFileInput[] = [];
  if (filingsPath !== null) {
    const filings = readJson<XbrlFilingDeclaration[]>(filingsPath);
    xbrlFiles = filings.map((filing) => {
      const path = join(xbrlDir, filing.file);
      if (!existsSync(path)) throw new Error(`XBRL instance ${filing.file} declared in xbrl-filings.json is missing`);
      return { ...filing, name: filing.file, text: readFileSync(path, 'utf8') };
    });
  } else if (existsSync(xbrlDir) && readdirSync(xbrlDir).some((entry) => entry.endsWith('.xml'))) {
    throw new Error('xbrl-filings.json is required when xbrl/ contains instance documents (issuer and period must be declared, never inferred)');
  }

  return {
    ...(datasetSchema === undefined ? {} : { datasetSchema }),
    issuers: roster.issuers,
    securities: roster.securities,
    listings: roster.listings,
    corporateActions: actionsPath === null ? [] : readJson<{ corporateActions: CorporateActionRecord[] }>(actionsPath).corporateActions,
    prices: pricesPath === null ? [] : readJson<{ prices: PriceRecord[] }>(pricesPath).prices,
    periodCsv: periodsPath === null ? null : readTextFile(periodsPath),
    operatingMetricsCsv: metricsPath === null ? null : readTextFile(metricsPath),
    xbrlFiles,
  };
}

export function run(argv: readonly string[]): number {
  const args = parseArgs(argv);
  const inputs = loadInputs(args.inputDir, args.datasetSchema);
  const content = buildDatasetContent(inputs);

  const errors = content.issues.filter((issue) => issue.severity === 'ERROR');
  for (const issue of content.issues) {
    process.stdout.write(`${issue.severity.padEnd(7)} ${issue.code.padEnd(32)} ${issue.subject}  ${issue.detail}\n`);
  }
  if (errors.length > 0 && !args.allowErrors) {
    process.stderr.write(`\n${errors.length} ingestion error(s); nothing was written. Re-run with --allow-errors to write a partial dataset that records them.\n`);
    return 1;
  }

  const written = writeDataset({
    dir: args.datasetDir,
    content,
    provider: 'operator-file-input',
    licence: 'operator-supplied; not redistributable',
    now: args.now,
    importRunId: `run-${args.now}`,
    /**
     * The operator is ingesting their OWN files, so the rights state is the operator's own
     * attestation and its basis is the input directory they pointed at.
     *
     * This is an ATTESTATION, not a verification: nothing here checked a third party's terms, and
     * the recorded basis says exactly what was relied on. An operator whose source needs a
     * rights-holder permission must obtain it and record THAT basis here instead.
     */
    sourceRights: {
      state: 'OPERATOR_ASSERTED',
      basis: `operator-supplied input files read from ${args.inputDir}`,
      note: 'operator attestation over the operator’s own input files; not an independent verification of any third party’s terms',
    },
  });

  const report = measureCoverage(content, { datasetVersion: written.manifest.datasetVersion, generatedAt: args.now });
  const coveragePath = join(args.datasetDir, COVERAGE_FILE_NAME);
  writeFileSync(coveragePath, `${JSON.stringify(JSON.parse(canonicalize(report)), null, 2)}\n`, 'utf8');

  process.stdout.write(`\ndatasetSchema  ${written.manifest.datasetSchema}\n`);
  process.stdout.write(`datasetVersion ${written.manifest.datasetVersion}\n`);
  process.stdout.write(`dataset        ${written.dir}\n`);
  process.stdout.write(`coverage       ${coveragePath}\n\n`);
  process.stdout.write(`${renderCoverageSummary(report)}\n`);
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && /ingest\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  try {
    process.exitCode = run(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

export { parseArgs };
