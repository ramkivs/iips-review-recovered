#!/usr/bin/env tsx
/**
 * IID-0 — fundamentals ingestion CLI (file in, files out).
 *
 *   tsx src/investment/cli/ingest.ts --input <dir> --dataset-dir <dir> [--now <iso>] [--allow-errors] \
 *     [--dataset-schema <IIPS_INVESTMENT_FUNDAMENTALS_V1|IIPS_INVESTMENT_FUNDAMENTALS_V2>]
 *
 * `--input` may be REPEATED, once per bundle, to assemble several bundles into one dataset in a single run
 * (`S3-D2`):
 *
 *   tsx src/investment/cli/ingest.ts --input <bundleA> --input <bundleB> --input <bundleC> --dataset-dir <dir>
 *
 * That is the only supported way to combine bundles. Ingesting them one run at a time into the same directory does
 * not combine them: `writeDataset` replaces the destination, so the last run would leave only its own issuers. Such
 * a run is now REFUSED rather than allowed to shrink the dataset silently — an ingestion run may add or update
 * issuers, but may not remove any (see `assertNoSilentSourceLoss`).
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
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import { buildDatasetContent, type DatasetInputs, type TextFile, type XbrlFileInput } from '../ingestion/builder';
import {
  assertNoSilentSourceLoss,
  manifestProvenance,
  mergeInputBundles,
  type InputBundle,
} from '../ingestion/multiInput';
import { assertValidIssuerSectors } from '../ingestion/sectorValidation';
import { assertSupportedDatasetSchema, type DatasetSchema } from '../contracts/lineItems';
import {
  COVERAGE_FILE_NAME,
  recoverInterruptedPublication,
  serializeDatasetFile,
  writeDataset,
} from '../ingestion/writer';
import { sha256Hex } from '../fundamentals/canonical';
import { computeContentDigest, type DatasetInputFile } from '../fundamentals/manifest';
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
  /**
   * Every `--input` directory, in the order given, each resolved to an absolute path (`S3-D2`).
   *
   * One entry is the ordinary single-bundle run and behaves exactly as it did before the flag was repeatable.
   */
  readonly inputDirs: readonly string[];
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
  /**
   * Every value of a repeatable flag, in the order supplied.
   *
   * Repeats are KEPT, not collapsed. Supplying the same directory twice is a conflict the merge validation reports
   * as `DUPLICATE_INPUT_DIR`: silently deduplicating it would accept a command line that does not say what the
   * operator meant, and would record one source where two were named.
   */
  const getAll = (flag: string): string[] => {
    const values: string[] = [];
    argv.forEach((token, index) => {
      if (token !== flag) return;
      const value = argv[index + 1];
      if (value !== undefined) values.push(value);
    });
    return values;
  };
  const inputDirs = getAll('--input');
  const datasetDir = get('--dataset-dir');
  if (inputDirs.length === 0 || datasetDir === undefined) {
    throw new Error(
      'usage: ingest.ts --input <dir> [--input <dir> ...] --dataset-dir <dir> [--now <iso>] [--allow-errors] [--dataset-schema <schema>]',
    );
  }
  return {
    inputDirs: inputDirs.map((dir) => resolve(dir)),
    datasetDir: resolve(datasetDir),
    now: get('--now') ?? new Date().toISOString(),
    allowErrors: argv.includes('--allow-errors'),
    // Fail closed on a grammar this build does not know, before anything is read: `assertSupportedDatasetSchema`
    // is the single authority on which schemas exist, so the CLI cannot invent one.
    datasetSchema: assertSupportedDatasetSchema(get('--dataset-schema')),
  };
}

/**
 * The name a consumed input file is recorded under: its path inside the input directory, `/`-separated.
 *
 * `sep` is normalised to `/` so that one bundle's input digest is the same on Windows and on Linux. Provenance
 * that changed with the platform it was read on could not be reproduced, and this product's designated runtime is
 * a Windows laptop.
 */
function inputFileName(inputDir: string, path: string): string {
  return relative(inputDir, path).split(sep).join('/');
}

/**
 * Load ONE input bundle, recording the exact bytes it consumed (`S3-D2`).
 *
 * The recorded file list comes from the reading code itself rather than from a second scan of the directory, so
 * the provenance digest cannot claim a file this run did not read, or omit one it did. Files the ingestion path
 * does not read — `data-extraction.json` and `identity/*.json` are deliberately ignored here — are therefore not
 * in the digest, which is the honest reading: it identifies what this dataset was actually built from.
 */
export function loadInputBundle(inputDir: string, datasetSchema?: DatasetSchema): InputBundle {
  const dir = resolve(inputDir);
  const filesRead: DatasetInputFile[] = [];

  /** Read a file AND record the digest of the bytes consumed. */
  const consume = (path: string): string => {
    const text = readFileSync(path, 'utf8');
    filesRead.push({ name: inputFileName(dir, path), sha256: sha256Hex(text) });
    return text;
  };
  const consumeJson = <T,>(path: string): T => JSON.parse(consume(path)) as T;
  const consumeTextFile = (path: string): TextFile => ({
    // `TextFile.name` stays the bare file name: ingestion issues quote it as their subject, so changing it would
    // change recorded issue text and with it the content digest.
    name: path.split(/[\\/]/).pop() ?? path,
    text: consume(path),
  });

  const rosterPath = join(dir, 'roster.json');
  if (!existsSync(rosterPath)) throw new Error(`roster.json is required in ${inputDir}`);
  const roster = consumeJson<{ issuers: IssuerRecord[]; securities: SecurityRecord[]; listings: ListingRecord[] }>(rosterPath);
  /**
   * `S3-D1` — validate the sector vocabulary HERE, before anything is built or written.
   *
   * The cast inside `consumeJson` above is an assertion, not a validation: it is `JSON.parse(...) as T`, so
   * `roster.issuers` is typed `IssuerRecord[]` whether or not the file actually held canonical sectors.
   * `IssuerRecord.sector` is the closed `SectorName` union, but a type is erased at runtime and coverage
   * measurement selects issuers by string equality, so an off-vocabulary sector used to make its issuer match no
   * sector at all — an ingestion that exited `0`, recorded no issue, and measured zero sectors.
   *
   * Validating before `buildDatasetContent` is also what makes the failure non-destructive: a roster this build
   * cannot interpret must never reach the writer at all. Throwing here means an existing valid dataset is left
   * untouched. Not bypassable by `--allow-errors`, which accepts ingestion issues, not uninterpretable input.
   *
   * `S3-D2` does not relax this: every bundle of a multi-input run is loaded through here, so each one is
   * sector-validated on its own before the set is merged. The writer now publishes as one unit and would not
   * partially overwrite a dataset either, but that is a second line of defence, not a licence to hand it input
   * this build cannot interpret.
   */
  assertValidIssuerSectors(roster.issuers, rosterPath);

  const optional = (name: string): string | null => {
    const path = join(dir, name);
    return existsSync(path) ? path : null;
  };

  const periodsPath = optional('periods.csv');
  const metricsPath = optional('operating-metrics.csv');
  const actionsPath = optional('corporate-actions.json');
  const pricesPath = optional('prices.json');
  const filingsPath = optional('xbrl-filings.json');

  const xbrlDir = join(dir, 'xbrl');
  let xbrlFiles: XbrlFileInput[] = [];
  if (filingsPath !== null) {
    const filings = consumeJson<XbrlFilingDeclaration[]>(filingsPath);
    xbrlFiles = filings.map((filing) => {
      const path = join(xbrlDir, filing.file);
      if (!existsSync(path)) throw new Error(`XBRL instance ${filing.file} declared in xbrl-filings.json is missing`);
      return { ...filing, name: filing.file, text: consume(path) };
    });
  } else if (existsSync(xbrlDir) && readdirSync(xbrlDir).some((entry) => entry.endsWith('.xml'))) {
    throw new Error('xbrl-filings.json is required when xbrl/ contains instance documents (issuer and period must be declared, never inferred)');
  }

  const inputs: DatasetInputs = {
    ...(datasetSchema === undefined ? {} : { datasetSchema }),
    issuers: roster.issuers,
    securities: roster.securities,
    listings: roster.listings,
    corporateActions: actionsPath === null ? [] : consumeJson<{ corporateActions: CorporateActionRecord[] }>(actionsPath).corporateActions,
    prices: pricesPath === null ? [] : consumeJson<{ prices: PriceRecord[] }>(pricesPath).prices,
    periodCsv: periodsPath === null ? null : consumeTextFile(periodsPath),
    operatingMetricsCsv: metricsPath === null ? null : consumeTextFile(metricsPath),
    xbrlFiles,
  };
  return { dir, inputs, filesRead };
}

/**
 * Load a single input directory. Public behaviour is unchanged: this is `loadInputBundle` without the provenance,
 * kept so existing callers keep one function to call.
 */
export function loadInputs(inputDir: string, datasetSchema?: DatasetSchema): DatasetInputs {
  return loadInputBundle(inputDir, datasetSchema).inputs;
}

export function run(argv: readonly string[]): number {
  const args = parseArgs(argv);

  /**
   * `S3-D2` — load every named bundle, validate the SET, and only then build or write anything.
   *
   * `mergeInputBundles` calls `assertMergeableInputBundles` first, so duplicate or conflicting identities, an empty
   * bundle and incompatible grammars all throw here with the destination untouched. Each bundle was loaded through
   * `loadInputBundle`, so `S3-D1` sector validation has already run on every one of them.
   *
   * The merged set then goes through `buildDatasetContent` ONCE, which is what keeps this from being a weaker path
   * than single-bundle ingestion: the builder's referential-integrity, duplicate-period, sign-rule, nil-binding and
   * listing-overlap checks all run over the union of the bundles rather than per bundle.
   */
  const bundles = args.inputDirs.map((dir) => loadInputBundle(dir, args.datasetSchema));
  const merged = mergeInputBundles(bundles);

  /**
   * Resolve an interrupted publication BEFORE reading the destination (`S3-D2`, publication safety).
   *
   * A previous run that was killed between the two renames of the swap leaves the dataset either absent from
   * its path or sitting beside it under a marker. Reading the destination in that state would answer the wrong
   * question — the guard below would see no dataset at all and allow anything — so the markers are resolved
   * first, deterministically. This is a no-op with no marker present, which is why an ordinary run's output is
   * unchanged; when it does act, every action is reported, because silently moving the operator's dataset
   * directories would be worse than the interruption that caused it.
   */
  const recovery = recoverInterruptedPublication(args.datasetDir);
  for (const action of recovery.actions) {
    process.stdout.write(`recovery       ${action}\n`);
  }

  // Refuse a run that would silently drop issuers or recorded sources from the dataset already at the destination
  // — the S3-D2 failure mode, guarded rather than merely made unnecessary. Throws before anything is written.
  assertNoSilentSourceLoss(
    args.datasetDir,
    merged.provenance,
    merged.inputs.issuers.map((issuer) => issuer.issuerId),
  );

  const content = buildDatasetContent(merged.inputs);

  const errors = content.issues.filter((issue) => issue.severity === 'ERROR');
  for (const issue of content.issues) {
    process.stdout.write(`${issue.severity.padEnd(7)} ${issue.code.padEnd(32)} ${issue.subject}  ${issue.detail}\n`);
  }
  if (errors.length > 0 && !args.allowErrors) {
    process.stderr.write(`\n${errors.length} ingestion error(s); nothing was written. Re-run with --allow-errors to write a partial dataset that records them.\n`);
    return 1;
  }

  /**
   * The coverage report is derived from the content, so its version is the content digest — the same value the
   * manifest it is published beside will carry. Computing it here is what lets the report be published IN THE
   * SAME UNIT as the dataset instead of being written into the destination afterwards, where a failure left a
   * dataset that verified while its coverage report still described the previous version.
   */
  const datasetVersion = computeContentDigest(content);
  const report = measureCoverage(content, { datasetVersion, generatedAt: args.now });

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
      // One directory reads exactly as it did before `--input` was repeatable, so a single-bundle manifest is
      // byte-identical to the manifests already committed as evidence.
      basis: `operator-supplied input files read from ${args.inputDirs.join(', ')}`,
      note: 'operator attestation over the operator’s own input files; not an independent verification of any third party’s terms',
    },
    /**
     * Per-bundle provenance, recorded only for a multi-input run (`manifestProvenance` returns nothing for one
     * bundle). Audit metadata: it is not part of `datasetVersion`, so recording where a dataset came from cannot
     * change what it says.
     */
    inputProvenance: manifestProvenance(merged.provenance),
    /**
     * The coverage report travels with the dataset. Bytes are unchanged — same canonical form, same name — and
     * it is still outside `manifest.files` and outside `datasetVersion`, exactly as when the CLI wrote it
     * itself. What changes is that it can no longer be left behind by a failed publication.
     */
    derivedFiles: () => ({ [COVERAGE_FILE_NAME]: serializeDatasetFile(report) }),
  });

  const coveragePath = join(args.datasetDir, COVERAGE_FILE_NAME);
  for (const marker of written.deferredCleanup) {
    process.stdout.write(`recovery       the superseded dataset at ${marker} could not be discarded now; the next run will remove it\n`);
  }

  if (merged.provenance.length > 1) {
    // Operator-visible for a multi-input run only, so a single-bundle run's output is unchanged. Naming every
    // source on the way out is the point of the contract: a three-issuer dataset must not look like a one-issuer
    // dataset that happened to grow.
    process.stdout.write(`\ninputs         ${merged.provenance.length} bundles merged into one dataset\n`);
    for (const entry of merged.provenance) {
      process.stdout.write(`  ${entry.inputDir}\n`);
      process.stdout.write(`    issuers      ${entry.issuerIds.length === 0 ? 'none' : entry.issuerIds.join(', ')}\n`);
      process.stdout.write(`    sectors      ${entry.sectors.length === 0 ? 'none' : entry.sectors.join(', ')}\n`);
      process.stdout.write(`    inputDigest  ${entry.inputDigest}  over ${entry.files.length} file(s)\n`);
    }
  }

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
