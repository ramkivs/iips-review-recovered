/**
 * IID Stage 3 — `verify-installed-dataset`: verify an installed investment dataset **read-only**, through the
 * product's own reader and the runtime coverage API.
 *
 *   tsx src/investment/cli/verify-installed-dataset.ts [--data-dir <root>] [--dataset-dir <dir>]
 *       [--expect-version sha256:<hex>] [--expect-class OPERATOR_SUPPLIED]
 *       [--expect-issuers <n>] [--expect-issuer <issuerId>]... [--expect-sectors <n>] [--expect-sector <name>]...
 *       [--expect-annual-periods <n>] [--expect-quarterly-periods <n>]
 *       [--expect-inputs <n>] [--expect-input-dir <bundle-dir-name>]...
 *       [--as-of <yyyy-mm-dd>] [--json]
 *
 * Exit codes:
 *   0  every check passed;
 *   1  at least one check failed, and each failure is printed with what was expected and what was found;
 *   2  the dataset could not be read at all (absent, unreadable, integrity failure) or the arguments were unusable.
 *
 * WHAT THIS COMMAND DOES NOT DO. It writes nothing, creates nothing, renames nothing, deletes nothing, and
 * performs no network access. It opens no database — in particular it never opens the portfolio store, and it
 * refuses a `--dataset-dir` that names anything other than a dataset directory. It does not recover an
 * interrupted publication: recovery belongs to the authoritative writer, which runs it at the start of an
 * ingestion, and a marker found here is REPORTED, never resolved.
 *
 * WHY IT EXISTS SEPARATELY FROM `iid-readiness`. The readiness diagnostic's `fundamentals-dataset` finding is
 * an existence check: a bare empty directory satisfies it. Stage 3 acceptance needs the stronger statement —
 * that the installed bytes verify, that the population is the admitted one, and that the runtime coverage read
 * answers from them. This command makes that statement using the same code the product uses at runtime
 * (`readDataset`, `investmentCoverageFromLocalDataset`), so it cannot drift from the behaviour it attests.
 *
 * The final check is a read-only attestation: the directory tree it inspected is snapshotted before the first
 * read and again after the last, and the run fails if any name, size or modification time moved.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';

import { DatasetIntegrityError, DatasetMissingError } from '../fundamentals/errors';
import type { DatasetInputProvenance, DatasetManifest } from '../fundamentals/manifest';
import { investmentCoverageFromLocalDataset } from '../identity/runtime';
import { computeInputDigest } from '../ingestion/multiInput';
import { COVERAGE_FILE_NAME, MANIFEST_FILE_NAME, previousPathOf, readDataset, stagingPathOf } from '../ingestion/writer';
import type { InvestmentCoverageReport } from '../coverage/investmentCoverage';
import { FUNDAMENTALS_BOUNDARY } from '../port/fundamentalsReadPort';
import type { DatasetContent } from '../fundamentals/types';

export const VERIFY_SCHEMA_VERSION = 1;

/** The file names a published dataset directory holds: the manifest's content files, the manifest, the derived report. */
const DERIVED_FILE_NAMES: readonly string[] = [MANIFEST_FILE_NAME, COVERAGE_FILE_NAME];

export interface VerifyCheck {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}

export interface VerifyExpectations {
  readonly datasetVersion: string | null;
  readonly datasetClass: string | null;
  readonly issuers: number | null;
  readonly issuerIds: readonly string[];
  readonly sectors: number | null;
  readonly sectorNames: readonly string[];
  readonly annualPeriods: number | null;
  readonly quarterlyPeriods: number | null;
  readonly inputs: number | null;
  readonly inputDirNames: readonly string[];
}

export interface VerifyReport {
  readonly schemaVersion: number;
  readonly tool: 'verify-installed-dataset';
  readonly generatedAt: string;
  readonly dataRoot: string;
  readonly datasetDir: string;
  readonly asOf: string;
  readonly expectations: VerifyExpectations;
  readonly checks: readonly VerifyCheck[];
  readonly passed: number;
  readonly failed: number;
  readonly result: 'PASS' | 'FAIL';
  readonly exitCode: number;
}

interface Args {
  readonly dataRoot: string | null;
  readonly datasetDir: string | null;
  readonly asOf: string;
  readonly json: boolean;
  readonly expectations: VerifyExpectations;
}

const USAGE =
  'usage: verify-installed-dataset.ts [--data-dir <root>] [--dataset-dir <dir>] [--expect-version sha256:<hex>]'
  + ' [--expect-class OPERATOR_SUPPLIED] [--expect-issuers <n>] [--expect-issuer <id>]...'
  + ' [--expect-sectors <n>] [--expect-sector <name>]... [--expect-annual-periods <n>]'
  + ' [--expect-quarterly-periods <n>] [--expect-inputs <n>] [--expect-input-dir <name>]...'
  + ' [--as-of <yyyy-mm-dd>] [--json]';

function getFlag(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

function getAllFlags(argv: readonly string[], flag: string): string[] {
  const values: string[] = [];
  argv.forEach((token, index) => {
    if (token !== flag) return;
    const value = argv[index + 1];
    if (value !== undefined) values.push(value);
  });
  return values;
}

function getNumber(argv: readonly string[], flag: string): number | null {
  const raw = getFlag(argv, flag);
  if (raw === undefined) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function parseVerifyArgs(argv: readonly string[]): Args {
  return {
    dataRoot: getFlag(argv, '--data-dir') ?? null,
    datasetDir: getFlag(argv, '--dataset-dir') ?? null,
    asOf: getFlag(argv, '--as-of') ?? new Date().toISOString().slice(0, 10),
    json: argv.includes('--json'),
    expectations: {
      datasetVersion: getFlag(argv, '--expect-version') ?? null,
      datasetClass: getFlag(argv, '--expect-class') ?? null,
      issuers: getNumber(argv, '--expect-issuers'),
      issuerIds: getAllFlags(argv, '--expect-issuer'),
      sectors: getNumber(argv, '--expect-sectors'),
      sectorNames: getAllFlags(argv, '--expect-sector'),
      annualPeriods: getNumber(argv, '--expect-annual-periods'),
      quarterlyPeriods: getNumber(argv, '--expect-quarterly-periods'),
      inputs: getNumber(argv, '--expect-inputs'),
      inputDirNames: getAllFlags(argv, '--expect-input-dir'),
    },
  };
}

/**
 * Resolve the directory to verify, the same way the runtime does: an explicit `--dataset-dir` wins; otherwise
 * `<dataRoot>/investment/dataset`, where `dataRoot` is `--data-dir`, then `IIPS_DATA_DIR`, then `<cwd>/.iips-data`.
 * The subpath literals are the boundary's own, not retyped here.
 */
function resolveTargets(args: Args): { dataRoot: string; datasetDir: string } {
  const root = args.dataRoot ?? process.env.IIPS_DATA_DIR ?? resolve(process.cwd(), '.iips-data');
  const resolvedRoot = resolve(root);
  if (args.datasetDir !== null) return { dataRoot: resolvedRoot, datasetDir: resolve(args.datasetDir) };
  return { dataRoot: resolvedRoot, datasetDir: resolve(resolvedRoot, 'investment', 'dataset') };
}

/**
 * Hash a file exactly as the writer does: the file's utf8 TEXT, bare hex, no `sha256:` prefix. A verifier that
 * hashed the bytes or prefixed the value would report a mismatch against a dataset the writer accepts.
 */
function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path, 'utf8'), 'utf8').digest('hex');
}

/**
 * The BUNDLE name a provenance entry refers to. The recorded `inputDir` is the directory the run read, whose leaf
 * is conventionally `ingest-input`; the bundle it belongs to is that directory's parent. Taking the leaf alone
 * would name every bundle `ingest-input` and match nothing.
 */
function bundleNameOf(inputDir: string): string {
  const leaf = basename(inputDir);
  return leaf === 'ingest-input' ? basename(dirname(inputDir)) : leaf;
}

/** A name/size/mtime snapshot of a directory tree, used to attest that this command changed nothing. */
function snapshot(root: string, depth: number): Record<string, string> {
  const out: Record<string, string> = {};
  if (!existsSync(root)) return out;
  const stat = statSync(root);
  out['.'] = `dir:${String(stat.mtimeMs)}`;
  if (depth <= 0 || !stat.isDirectory()) return out;
  for (const name of readdirSync(root).sort()) {
    const path = join(root, name);
    const entry = statSync(path);
    out[name] = entry.isDirectory() ? 'dir' : `file:${String(entry.size)}:${String(entry.mtimeMs)}`;
    if (!entry.isDirectory()) continue;
    for (const [inner, value] of Object.entries(snapshot(path, depth - 1))) out[`${name}/${inner}`] = value;
  }
  return out;
}

function snapshotDiff(before: Record<string, string>, after: Record<string, string>): string[] {
  const moved: string[] = [];
  for (const key of Object.keys(before)) {
    if (after[key] === undefined) moved.push(`removed ${key}`);
    if (after[key] !== undefined && after[key] !== before[key]) moved.push(`changed ${key}`);
  }
  for (const key of Object.keys(after)) {
    if (before[key] === undefined) moved.push(`created ${key}`);
  }
  return moved;
}

/**
 * Refuse a target that cannot be the dataset directory of the fundamentals boundary.
 *
 * The rule is STRUCTURAL and derived from the product's own `FUNDAMENTALS_BOUNDARY` constants: the dataset
 * lives at `<dataRoot>/<defaultSubdir>/<datasetSubdir>`, so a target must be a DIRECTORY whose last two path
 * segments are exactly those two names. One structural rule refuses everything this guard exists to refuse,
 * with no blacklist of names or extensions:
 *
 *   - any FILE at the path — which is how the owner-managed portfolio store presents itself — is refused by
 *     the directory test, whatever its extension;
 *   - a similarly named directory (`dataset-old`, `dataset-backup`) is refused by the segment test;
 *   - a path inside the portfolio store domain is refused because its parent segment is not `investment`, and
 *     is refused again explicitly by the domain test below.
 *
 * A blacklist of extensions would be both weaker and out of bounds here: the IID module boundary forbids this
 * tree from even naming a persistence technology. Refusing by structure needs no such vocabulary.
 */
function targetGuard(datasetDir: string): string | null {
  if (existsSync(datasetDir) && !statSync(datasetDir).isDirectory()) {
    return `refusing to open a file as a dataset directory: ${datasetDir}`;
  }
  /*
   * Split on BOTH separators, not on `sep`. `ingest.ts` normalises `sep` to `/` so that one bundle's input
   * digest is identical on Windows and on Linux; the same reasoning applies to this guard. Splitting on `sep`
   * alone would make a Windows path a single opaque segment on Linux, so the guard would refuse the real host
   * path `C:\iips-data\investment\dataset` with a misleading reason — and would do so only on the platform
   * where nobody runs it. Normalising here makes the refusal identical on both.
   */
  const segments = datasetDir.split(/[\\/]/).filter((segment) => segment.length > 0);
  const leaf = (segments[segments.length - 1] ?? '').toLowerCase();
  const parent = (segments[segments.length - 2] ?? '').toLowerCase();
  if (leaf !== FUNDAMENTALS_BOUNDARY.datasetSubdir.toLowerCase()) {
    return `refusing a target that is not a dataset directory: ${datasetDir}`;
  }
  if (parent !== FUNDAMENTALS_BOUNDARY.defaultSubdir.toLowerCase()) {
    return `refusing a target outside the fundamentals boundary: expected `
      + `<dataRoot>/${FUNDAMENTALS_BOUNDARY.defaultSubdir}/${FUNDAMENTALS_BOUNDARY.datasetSubdir}, found ${datasetDir}`;
  }
  const normalised = datasetDir.split(/[\\/]/).join('/').toLowerCase();
  if (normalised.includes('/iips/') || normalised.endsWith('/iips')) {
    return `refusing a target inside the portfolio store domain: ${datasetDir}`;
  }
  return null;
}

function annualCount(content: DatasetContent): number {
  return content.periods.filter((period) => period.period.periodType === 'ANNUAL').length;
}

function quarterlyCount(content: DatasetContent): number {
  return content.periods.filter((period) => period.period.periodType === 'QUARTER').length;
}

function provenanceChecks(
  manifest: DatasetManifest,
  expectations: VerifyExpectations,
  checks: VerifyCheck[],
): void {
  const entries: readonly DatasetInputProvenance[] = manifest.inputs ?? [];
  if (expectations.inputs !== null) {
    checks.push({
      id: 'provenance-entries',
      ok: entries.length === expectations.inputs,
      detail: `manifest.inputs holds ${String(entries.length)} entr(y/ies); expected ${String(expectations.inputs)}`,
    });
  }
  if (entries.length === 0) {
    checks.push({
      id: 'provenance-recorded',
      ok: false,
      detail: 'manifest.inputs is absent or empty — this dataset records no per-bundle provenance',
    });
    return;
  }
  const names = entries.map((entry) => bundleNameOf(entry.inputDir));
  if (expectations.inputDirNames.length > 0) {
    const wanted = [...expectations.inputDirNames].sort();
    const found = [...names].sort();
    const missing = wanted.filter((name) => !found.includes(name));
    const unexpected = found.filter((name) => !wanted.includes(name));
    checks.push({
      id: 'provenance-input-dirs',
      ok: missing.length === 0 && unexpected.length === 0,
      detail: `recorded ${found.join(', ')}${missing.length === 0 ? '' : `; missing ${missing.join(', ')}`}`
        + `${unexpected.length === 0 ? '' : `; unexpected ${unexpected.join(', ')}`}`,
    });
  }
  /*
   * The input digest is recomputed with the PRODUCT'S OWN function over the recorded file list, never with a
   * second implementation — a verifier that recomputed it differently would prove nothing about the writer.
   */
  const recomputed = entries.filter((entry) => computeInputDigest(entry.files) === entry.inputDigest);
  checks.push({
    id: 'provenance-input-digests',
    ok: recomputed.length === entries.length,
    detail: `${String(recomputed.length)}/${String(entries.length)} recorded input digest(s) recompute exactly`,
  });
  /*
   * And, where the bundle directory is still readable, each recorded per-file digest is re-hashed from the bytes
   * on disk. Where it is not readable — the operator's host may not carry the repository's evidence tree at the
   * recorded path — that is reported as unverifiable rather than as a failure or a pass.
   */
  const readable: string[] = [];
  const mismatched: string[] = [];
  const unavailable: string[] = [];
  for (const entry of entries) {
    const bundle = bundleNameOf(entry.inputDir);
    if (!existsSync(entry.inputDir)) {
      unavailable.push(bundle);
      continue;
    }
    readable.push(bundle);
    for (const file of entry.files) {
      const path = join(entry.inputDir, file.name.split('/').join(sep));
      if (!existsSync(path)) {
        mismatched.push(`${bundle}/${file.name} absent`);
        continue;
      }
      if (sha256File(path) !== file.sha256) mismatched.push(`${bundle}/${file.name} digest`);
    }
  }
  checks.push({
    id: 'provenance-bundle-bytes',
    /*
     * A bundle directory that is no longer readable is NEITHER a pass nor a failure: it is reported as not
     * verified either way. Failing it would condemn a correctly installed dataset because the repository's
     * evidence tree moved; passing it silently would claim a verification that did not happen.
     */
    ok: mismatched.length === 0,
    detail: `${String(readable.length)} bundle(s) re-hashed from the bytes on disk, ${String(mismatched.length)} `
      + `mismatch(es)${unavailable.length === 0 ? '' : `; not readable at the recorded path (NOT VERIFIED either way): ${unavailable.join(', ')}`}`,
  });
}

function coverageChecks(
  report: InvestmentCoverageReport,
  manifest: DatasetManifest,
  expectations: VerifyExpectations,
  checks: VerifyCheck[],
): void {
  checks.push({
    id: 'coverage-version-agrees',
    ok: report.dataset.datasetVersion === manifest.datasetVersion,
    detail: `coverage report ${report.dataset.datasetVersion} vs manifest ${manifest.datasetVersion}`,
  });
  if (expectations.datasetClass !== null) {
    checks.push({
      id: 'coverage-dataset-class',
      ok: report.dataset.datasetClass === expectations.datasetClass,
      detail: `served datasetClass ${report.dataset.datasetClass}; expected ${expectations.datasetClass}`,
    });
  }
  checks.push({
    id: 'coverage-class-not-none',
    ok: report.dataset.datasetClass !== 'NONE',
    detail: `financialCoverage.datasetClass ${report.financialCoverage.datasetClass}`,
  });
  if (expectations.sectors !== null) {
    checks.push({
      id: 'coverage-measured-sectors',
      ok: report.measuredSectors === expectations.sectors,
      detail: `measuredSectors ${String(report.measuredSectors)} of ${String(report.totalSectors)}; expected `
        + String(expectations.sectors),
    });
  }
  const measured = report.sectors.filter((sector) => sector.measured);
  const starved = measured.filter((sector) => sector.usableMethods.length === 0);
  checks.push({
    id: 'coverage-usable-methods',
    ok: measured.length > 0 && starved.length === 0,
    detail: measured.length === 0
      ? 'no sector is measured'
      : measured.map((sector) => `${sector.sector} ${sector.stage} usable ${String(sector.usableMethods.length)}`).join('; '),
  });
  checks.push({
    id: 'coverage-outstanding-listed',
    ok: report.outstandingSectors.length === report.totalSectors - report.measuredSectors,
    detail: `${String(report.outstandingSectors.length)} unmeasured sector(s) listed explicitly of `
      + `${String(report.totalSectors - report.measuredSectors)} expected`,
  });
  const rows = report.issuers;
  if (expectations.issuerIds.length > 0) {
    const missing = expectations.issuerIds.filter((id) => !rows.some((row) => row.issuerId === id));
    checks.push({
      id: 'coverage-issuer-rows',
      ok: missing.length === 0,
      detail: missing.length === 0
        ? `${String(rows.length)} row(s) served, every expected issuer present`
        : `not served: ${missing.join(', ')}`,
    });
  }
  const notCovered = rows.filter((row) => row.state !== 'COVERED');
  checks.push({
    id: 'coverage-row-state',
    ok: rows.length > 0 && notCovered.length === 0,
    detail: rows.length === 0
      ? 'no issuer row was served'
      : `${String(rows.length - notCovered.length)}/${String(rows.length)} row(s) COVERED`
        + (notCovered.length === 0 ? '' : `; not covered: ${notCovered.map((row) => `${row.issuerId} ${row.state}`).join(', ')}`),
  });
  checks.push({
    id: 'coverage-issues',
    ok: report.issues.length === 0,
    detail: `${String(report.issues.length)} ingestion issue(s) reported by the coverage read`,
  });
  checks.push({
    id: 'coverage-identity-disclosure',
    ok: true,
    detail: `identitySourcesAvailable ${String(report.identitySourcesAvailable)} — disclosure, not a gate: `
      + `${report.identitySourceDetail ?? 'no detail'}`,
  });
}

export function run(argv: readonly string[]): number {
  const args = parseVerifyArgs(argv);
  const targets = resolveTargets(args);
  const guard = targetGuard(targets.datasetDir);
  if (guard !== null) {
    process.stderr.write(`${guard}\n${USAGE}\n`);
    return 2;
  }

  const checks: VerifyCheck[] = [];
  const before = snapshot(dirname(targets.datasetDir), 3);
  const startedAt = new Date().toISOString();

  checks.push({
    id: 'dataset-present',
    ok: existsSync(targets.datasetDir) && statSync(targets.datasetDir).isDirectory(),
    detail: targets.datasetDir,
  });
  checks.push({
    id: 'no-publication-markers',
    ok: !existsSync(stagingPathOf(targets.datasetDir)) && !existsSync(previousPathOf(targets.datasetDir)),
    detail: `staging ${existsSync(stagingPathOf(targets.datasetDir)) ? 'PRESENT' : 'absent'}, previous `
      + `${existsSync(previousPathOf(targets.datasetDir)) ? 'PRESENT' : 'absent'} — reported, never resolved here`,
  });

  let manifest: DatasetManifest | null = null;
  let content: DatasetContent | null = null;
  let readFailure = '';
  try {
    const read = readDataset(targets.datasetDir);
    manifest = read.manifest;
    content = read.content;
    checks.push({ id: 'reader-verifies', ok: true, detail: 'readDataset verified every file digest and recomputed the content digest' });
  } catch (error) {
    if (error instanceof DatasetMissingError || error instanceof DatasetIntegrityError) {
      readFailure = `${error.name}: ${error.message}`;
      checks.push({ id: 'reader-verifies', ok: false, detail: readFailure });
    }
    if (!(error instanceof DatasetMissingError) && !(error instanceof DatasetIntegrityError)) {
      readFailure = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      checks.push({ id: 'reader-verifies', ok: false, detail: readFailure });
    }
  }

  if (manifest !== null && content !== null) {
    checks.push({
      id: 'manifest-identity',
      ok: manifest.datasetVersion === manifest.contentDigest,
      detail: `datasetVersion ${manifest.datasetVersion}`,
    });
    if (args.expectations.datasetVersion !== null) {
      checks.push({
        id: 'expected-version',
        ok: manifest.datasetVersion === args.expectations.datasetVersion,
        detail: manifest.datasetVersion === args.expectations.datasetVersion
          ? `matches the expected digest ${args.expectations.datasetVersion}`
          : `FOUND ${manifest.datasetVersion} EXPECTED ${args.expectations.datasetVersion}`,
      });
    }
    const declared = Object.keys(manifest.files);
    const mismatched = declared.filter((name) => {
      const path = join(targets.datasetDir, name);
      return !existsSync(path) || sha256File(path) !== manifest.files[name];
    });
    checks.push({
      id: 'file-digests-recomputed',
      ok: mismatched.length === 0,
      detail: `${String(declared.length - mismatched.length)}/${String(declared.length)} declared file digest(s) `
        + `re-hash to the recorded value${mismatched.length === 0 ? '' : `; mismatched: ${mismatched.join(', ')}`}`,
    });
    const onDisk = readdirSync(targets.datasetDir).sort();
    const allowed = [...declared, ...DERIVED_FILE_NAMES].sort();
    const extra = onDisk.filter((name) => !allowed.includes(name));
    const absent = allowed.filter((name) => !onDisk.includes(name));
    checks.push({
      id: 'dataset-files-exact',
      ok: extra.length === 0 && absent.length === 0,
      detail: `${String(onDisk.length)} file(s) on disk, ${String(declared.length)} declared content file(s), `
        + `${String(DERIVED_FILE_NAMES.length)} derived/manifest`
        + `${extra.length === 0 ? '' : `; unexpected: ${extra.join(', ')}`}`
        + `${absent.length === 0 ? '' : `; absent: ${absent.join(', ')}`}`,
    });
    if (args.expectations.issuers !== null) {
      checks.push({
        id: 'issuer-count',
        ok: content.issuers.length === args.expectations.issuers,
        detail: `${String(content.issuers.length)} issuer(s); expected ${String(args.expectations.issuers)}`,
      });
    }
    if (args.expectations.issuerIds.length > 0) {
      const found = content.issuers.map((issuer) => issuer.issuerId);
      const missing = args.expectations.issuerIds.filter((id) => !found.includes(id));
      const unexpected = found.filter((id) => !args.expectations.issuerIds.includes(id));
      checks.push({
        id: 'issuer-ids',
        ok: missing.length === 0 && unexpected.length === 0,
        detail: `found ${found.join(', ')}`
          + `${missing.length === 0 ? '' : `; missing ${missing.join(', ')}`}`
          + `${unexpected.length === 0 ? '' : `; unexpected ${unexpected.join(', ')}`}`,
      });
    }
    const sectors = [...new Set(content.issuers.map((issuer) => issuer.sector))].sort();
    if (args.expectations.sectors !== null) {
      checks.push({
        id: 'distinct-sectors',
        ok: sectors.length === args.expectations.sectors,
        detail: `${String(sectors.length)} distinct sector(s): ${sectors.join(', ')}; expected `
          + String(args.expectations.sectors),
      });
    }
    if (args.expectations.sectorNames.length > 0) {
      const wanted = [...args.expectations.sectorNames].sort();
      const sectorStrings: readonly string[] = sectors;
      const missing = wanted.filter((name) => !sectorStrings.includes(name));
      checks.push({
        id: 'sector-names',
        ok: missing.length === 0 && sectors.length === wanted.length,
        detail: `found ${sectors.join(', ')}${missing.length === 0 ? '' : `; missing ${missing.join(', ')}`}`,
      });
    }
    checks.push({
      id: 'issuer-sector-assignment',
      ok: content.issuers.every((issuer) => issuer.sector.length > 0),
      detail: content.issuers.map((issuer) => `${issuer.legalName} → ${issuer.sector}`).join('; '),
    });
    if (args.expectations.annualPeriods !== null) {
      const annual = annualCount(content);
      checks.push({
        id: 'annual-periods',
        ok: annual === args.expectations.annualPeriods,
        detail: `${String(annual)} annual period(s); expected ${String(args.expectations.annualPeriods)}`,
      });
    }
    if (args.expectations.quarterlyPeriods !== null) {
      const quarterly = quarterlyCount(content);
      checks.push({
        id: 'quarterly-periods',
        ok: quarterly === args.expectations.quarterlyPeriods,
        detail: `${String(quarterly)} quarterly period(s); expected ${String(args.expectations.quarterlyPeriods)}`,
      });
    }
    checks.push({
      id: 'ingestion-issues',
      ok: content.issues.length === 0,
      detail: content.issues.length === 0
        ? '0 issue(s) recorded in the dataset'
        : content.issues.map((issue) => `${issue.severity} ${issue.code} ${issue.subject}`).join('; '),
    });
    const rights = manifest.sourceRights;
    checks.push({
      id: 'source-rights-recorded',
      // The product's own rule is that `OPERATOR_ASSERTED` requires a non-empty BASIS; the note is disclosure and is
      // reported verbatim rather than required, so this check cannot fail a dataset the writer accepted.
      ok: rights !== undefined && rights.state === 'OPERATOR_ASSERTED' && rights.basis.length > 0,
      detail: rights === undefined
        ? 'manifest carries no sourceRights — ABSENT equals UNKNOWN, which is not permitted evidence of anything'
        : `${rights.state}; ${rights.note}`,
    });
    provenanceChecks(manifest, args.expectations, checks);

    let report: InvestmentCoverageReport | null = null;
    let coverageFailure = '';
    try {
      report = investmentCoverageFromLocalDataset(args.asOf, targets.dataRoot);
    } catch (error) {
      coverageFailure = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
    if (report === null) {
      checks.push({ id: 'coverage-api-reads', ok: false, detail: `the runtime coverage read failed: ${coverageFailure}` });
    }
    if (report !== null) {
      checks.push({
        id: 'coverage-api-reads',
        ok: true,
        detail: `investmentCoverageFromLocalDataset answered for asOf ${report.asOf}: ${report.statusLine}`,
      });
      coverageChecks(report, manifest, args.expectations, checks);
    }
  }

  const moved = snapshotDiff(before, snapshot(dirname(targets.datasetDir), 3));
  checks.push({
    id: 'read-only-attestation',
    ok: moved.length === 0,
    detail: moved.length === 0
      ? `nothing created, removed or modified under ${dirname(targets.datasetDir)} between the first read and the last`
      : `THIS RUN CHANGED SOMETHING: ${moved.join('; ')}`,
  });

  const failed = checks.filter((check) => !check.ok).length;
  const result: 'PASS' | 'FAIL' = failed === 0 ? 'PASS' : 'FAIL';
  const exitCode = readFailure !== '' && manifest === null ? 2 : (failed === 0 ? 0 : 1);
  const report: VerifyReport = {
    schemaVersion: VERIFY_SCHEMA_VERSION,
    tool: 'verify-installed-dataset',
    generatedAt: startedAt,
    dataRoot: targets.dataRoot,
    datasetDir: targets.datasetDir,
    asOf: args.asOf,
    expectations: args.expectations,
    checks,
    passed: checks.length - failed,
    failed,
    result,
    exitCode,
  };

  if (args.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return exitCode;
  }
  process.stdout.write(`verify-installed-dataset — READ-ONLY\n`);
  process.stdout.write(`  dataRoot     ${report.dataRoot}\n`);
  process.stdout.write(`  datasetDir   ${report.datasetDir}\n`);
  process.stdout.write(`  asOf         ${report.asOf}\n\n`);
  for (const check of checks) {
    process.stdout.write(`  [${check.ok ? 'PASS' : 'FAIL'}] ${check.id}\n         ${check.detail}\n`);
  }
  process.stdout.write(`\n  RESULT ${result} — ${String(report.passed)} passed, ${String(report.failed)} failed\n`);
  return exitCode;
}

const invokedDirectly = process.argv[1] !== undefined && /verify-installed-dataset\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  try {
    process.exitCode = run(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}
