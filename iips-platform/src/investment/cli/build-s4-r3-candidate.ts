#!/usr/bin/env tsx
/**
 * S4-R3 — pinned, candidate-only build and verification wrapper.
 *
 *   tsx src/investment/cli/build-s4-r3-candidate.ts --build --output-dir <NEW directory outside this repository>
 *   tsx src/investment/cli/build-s4-r3-candidate.ts --verify-only --output-dir <existing candidate package>
 *
 * This is NOT a new dataset-generation pipeline. It validates the exact O3-admitted inputs, invokes the existing
 * multi-input ingestion CLI (`ingest.ts`) once, and verifies the published bytes through the existing reader,
 * manifest verifier, content-digest algorithm and runtime coverage read. It writes only a new candidate package
 * and non-content verification metadata beside it. It never installs, provisions identity, opens a database,
 * accesses the Windows host, publishes to Git/GitHub, or claims overall IID readiness.
 *
 * The output directory must NOT exist and must be outside this repository. Its parent must already exist. A
 * failed or mismatching build is preserved for diagnosis; nothing is overwritten or retried-over. The fixed
 * build clock is the recorded S4-R3 measurement clock, not a claim about the current wall-clock time.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { canonicalize } from '../fundamentals/canonical';
import { computeContentDigest, verifyManifest, type DatasetManifest } from '../fundamentals/manifest';
import { computeInputDigest, mergeInputBundles, type InputBundle } from '../ingestion/multiInput';
import { listingConflicts } from '../ingestion/builder';
import {
  COVERAGE_FILE_NAME,
  DATASET_FILE_NAMES,
  MANIFEST_FILE_NAME,
  readDataset,
  serializeDatasetFile,
} from '../ingestion/writer';
import { investmentCoverageFromLocalDataset } from '../identity/runtime';
import { measureCoverage } from '../coverage/measure';
import { loadInputBundle, run as ingest } from './ingest';

export const S4_R3_CANDIDATE_DIGEST = 'sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b';
export const S4_R3_BUILD_CLOCK = '2026-11-14T00:00:00.000Z';
export const S4_R3_AS_OF = '2026-11-14';
const RECORDED_MANIFEST_SHA256 = 'b921741942d4674ed968f2938917b588b07ae9dc6db12f2998cb7361727d90ba';
const EVIDENCE_LEDGER_SHA256 = 'b41b0b106fe731d1b2420f72f05b2efa7e44e1a39ef185b4af063f441be92c63';
const BUNDLE_REL = 'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14';
const DEFAULT_REPOSITORY_ROOT = resolve(__dirname, '../../../..');

const ADMITTED_INPUTS = [
  {
    issuerId: 'IN:CIN:L85110KA1981PLC013115',
    dir: 'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input',
    inputDigest: 'sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c',
    files: {
      'periods.csv': 'e2cdba2042a55fc3352e85b8384e014f669e1472deb9011e7be2babd4fbc745c',
      'roster.json': '426e8478bca1ffc3fd47a6a24995230cfbfc05ccd1df4b92fa774ba15c60f8b4',
    },
  },
  {
    issuerId: 'IN:CIN:L15140MH1988PLC049208',
    dir: `${BUNDLE_REL}/ingest-input/marico`,
    inputDigest: 'sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d',
    files: {
      'periods.csv': 'df2e1d7182b9aa9d50ab2907342dc2f17330a1ac13fec5ad96a44fff68e41669',
      'roster.json': '259c2f093b611af8e1541a78ea5e151cc2ab41cf93ef32bbfaa54fcb18c2cadb',
    },
  },
  {
    issuerId: 'IN:CIN:L45200MH2005PLC152061',
    dir: `${BUNDLE_REL}/ingest-input/kec`,
    inputDigest: 'sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a',
    files: {
      'periods.csv': 'ff6e62fde3ec80143a759d2200cdd0f8fae64fc7113b9cb1da691b2baa37e46b',
      'roster.json': 'd36b27705ef67fccacb3a3a71812556144a52d447a46cef87e3961b39335c0c6',
    },
  },
] as const;

export interface CandidateCheck { readonly id: string; readonly ok: boolean; readonly detail: string }
export interface CandidateLedgerEntry {
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly expectedSha256: string | null;
  readonly match: boolean;
}
export interface CandidateLedger {
  readonly schemaVersion: 1;
  readonly scope: 'all files under investment/dataset; excludes verification/';
  readonly datasetVersion: string;
  readonly entries: readonly CandidateLedgerEntry[];
}
export interface CandidateVerificationReport {
  readonly schemaVersion: 1;
  readonly tool: 'build-s4-r3-candidate';
  readonly generatedAt: string;
  readonly result: 'PASS' | 'FAIL' | 'BLOCKED_DIGEST_MISMATCH';
  readonly outputDir: string;
  readonly datasetDir: string;
  readonly expectedCandidateDigest: string;
  readonly actualCandidateDigest: string | null;
  readonly buildClock: string;
  readonly authoritativePipeline: 'src/investment/cli/ingest.ts';
  readonly ledgerSha256: string;
  readonly inputs: readonly { readonly issuerId: string; readonly inputDir: string; readonly inputDigest: string }[];
  readonly checks: readonly CandidateCheck[];
  readonly boundaries: {
    readonly windowsInstallation: 'NOT_EXECUTED';
    readonly existingWindowsDataset: 'UNTOUCHED';
    readonly stage2Provisioning: 'NOT_EXECUTED';
    readonly portfolioDatabase: 'NOT_ACCESSED';
    readonly gitHubDatasetPublication: 'NOT_PERFORMED';
    readonly overallIidReadiness: 'NOT_READY';
  };
  readonly limitations: {
    readonly L041: 'OPEN';
    readonly L042: 'OPEN';
    readonly freshness: readonly { readonly issuerId: string; readonly flags: readonly ['STALE_STATEMENTS', 'STALE_DATA'] }[];
    readonly pdfToTranscriptionVerification: 'NOT_CLAIMED';
    readonly independentSourceRightsVerification: 'NOT_CLAIMED';
  };
}

function sha256(raw: Buffer | string): string { return createHash('sha256').update(raw).digest('hex'); }
function readJson<T>(path: string): T { return JSON.parse(readFileSync(path, 'utf8')) as T; }
function filesUnder(root: string, prefix = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(root, prefix), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) out.push(...filesUnder(root, rel));
    else if (entry.isFile()) out.push(rel);
    else throw new Error(`refusing non-regular entry in candidate/input tree: ${rel}`);
  }
  return out;
}
function contains(parent: string, child: string): boolean {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel));
}
function snapshot(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of filesUnder(root)) {
    const s = statSync(join(root, name));
    out[name] = `${String(s.size)}:${String(s.mtimeMs)}:${sha256(readFileSync(join(root, name)))}`;
  }
  return out;
}

/** Recompute the exact consumed-file and bundle digests before any output directory is created. */
export function validateAdmittedInputs(repositoryRoot: string): {
  readonly bundles: readonly InputBundle[];
  readonly inputs: CandidateVerificationReport['inputs'];
} {
  const root = realpathSync(resolve(repositoryRoot));
  const bundles = ADMITTED_INPUTS.map((expected) => {
    const dir = resolve(root, expected.dir);
    const actualFiles = filesUnder(dir).sort();
    const expectedFiles = Object.keys(expected.files).sort();
    if (canonicalize(actualFiles) !== canonicalize(expectedFiles)) {
      throw new Error(`admitted input census mismatch for ${expected.issuerId}: expected ${expectedFiles.join(', ')}, found ${actualFiles.join(', ')}`);
    }
    const bundle = loadInputBundle(dir);
    for (const file of bundle.filesRead) {
      const wanted = (expected.files as Readonly<Record<string, string>>)[file.name];
      if (wanted === undefined || file.sha256 !== wanted) {
        throw new Error(`admitted input file digest mismatch: ${dir}/${file.name}; refusing before build`);
      }
    }
    const inputDigest = computeInputDigest(bundle.filesRead);
    if (inputDigest !== expected.inputDigest) {
      throw new Error(`admitted inputDigest mismatch for ${expected.issuerId}: found ${inputDigest}, expected ${expected.inputDigest}`);
    }
    return bundle;
  });
  mergeInputBundles(bundles);
  return {
    bundles,
    inputs: ADMITTED_INPUTS.map((entry) => ({ issuerId: entry.issuerId, inputDir: resolve(root, entry.dir), inputDigest: entry.inputDigest })),
  };
}

function validateEvidenceLedger(repositoryRoot: string): CandidateCheck {
  const bundle = resolve(repositoryRoot, BUNDLE_REL);
  const ledgerPath = join(bundle, 'digests.json');
  const raw = readFileSync(ledgerPath);
  if (sha256(raw) !== EVIDENCE_LEDGER_SHA256) throw new Error('enclosing S4-R3 evidence ledger SHA-256 mismatch');
  const ledger = readJson<{ readonly files: Readonly<Record<string, { readonly sha256: string; readonly bytes: number }>> }>(ledgerPath);
  const names = Object.keys(ledger.files).sort();
  const actual = filesUnder(bundle).filter((name) => name !== 'digests.json').sort();
  if (canonicalize(names) !== canonicalize(actual)) throw new Error('enclosing S4-R3 evidence bundle census mismatch');
  for (const name of names) {
    const file = readFileSync(join(bundle, name));
    const entry = ledger.files[name]!;
    if (sha256(file) !== entry.sha256 || file.length !== entry.bytes) throw new Error(`enclosing evidence digest mismatch: ${name}`);
  }
  return { id: 'enclosing-evidence-ledger', ok: true, detail: `${String(names.length)} entries and ledger SHA-256 match` };
}

function recordedManifest(repositoryRoot: string): DatasetManifest {
  const path = resolve(repositoryRoot, BUNDLE_REL, 'runs/candidate-manifest.json');
  const raw = readFileSync(path);
  if (sha256(raw) !== RECORDED_MANIFEST_SHA256) throw new Error('recorded candidate manifest SHA-256 mismatch');
  return readJson<DatasetManifest>(path);
}
function comparableManifest(manifest: DatasetManifest): string {
  return canonicalize({
    datasetSchema: manifest.datasetSchema,
    datasetVersion: manifest.datasetVersion,
    contentDigest: manifest.contentDigest,
    provider: manifest.provider,
    licence: manifest.licence,
    sourceRightsState: manifest.sourceRights?.state,
    dataAsOf: manifest.dataAsOf,
    knownAsOf: manifest.knownAsOf,
    lastImportAt: manifest.lastImportAt,
    importRunId: manifest.importRunId,
    quality: manifest.quality,
    completenessPct: manifest.completenessPct,
    coverage: manifest.coverage,
    digestScope: manifest.digestScope,
    files: manifest.files,
    inputs: (manifest.inputs ?? []).map((entry) => ({
      inputDigest: entry.inputDigest, files: entry.files, issuerIds: entry.issuerIds, sectors: entry.sectors,
    })),
  });
}

/** Read-only inspection of generated bytes. Returns a ledger and report; writes nothing. */
export function inspectCandidate(outputDir: string, repositoryRoot = DEFAULT_REPOSITORY_ROOT): {
  readonly ledger: CandidateLedger;
  readonly report: CandidateVerificationReport;
} {
  const root = realpathSync(resolve(repositoryRoot));
  const out = realpathSync(resolve(outputDir));
  const datasetDir = join(out, 'investment', 'dataset');
  const checks: CandidateCheck[] = [];
  const add = (id: string, ok: boolean, detail: string): void => { checks.push({ id, ok, detail }); };
  const admitted = validateAdmittedInputs(root);
  add('admitted-input-digests', true, '3/3 exact input bundles and 6/6 consumed files match');
  checks.push(validateEvidenceLedger(root));
  const reference = recordedManifest(root);
  const read = readDataset(datasetDir);
  const { manifest, content } = read;
  const rawHashes: Record<string, string> = {};
  for (const name of Object.keys(manifest.files)) rawHashes[name] = sha256(readFileSync(join(datasetDir, name)));
  const integrity = verifyManifest(manifest, rawHashes, content);
  add('reader-and-manifest-integrity', integrity.ok, `${String(Object.keys(manifest.files).length)} declared files verified`);
  const actualDigest = computeContentDigest(content);
  const digestOk = actualDigest === S4_R3_CANDIDATE_DIGEST && manifest.contentDigest === actualDigest && manifest.datasetVersion === actualDigest;
  add('exact-o3-candidate-digest', digestOk, `expected ${S4_R3_CANDIDATE_DIGEST}; actual ${actualDigest}`);
  add('recorded-manifest-comparable-fields', comparableManifest(manifest) === comparableManifest(reference), 'content-bearing manifest fields match the recorded candidate; audit paths may differ by checkout');
  const expectedNames = [...DATASET_FILE_NAMES, MANIFEST_FILE_NAME, COVERAGE_FILE_NAME].sort();
  const actualNames = filesUnder(datasetDir).sort();
  add('dataset-file-census', canonicalize(expectedNames) === canonicalize(actualNames), `${String(actualNames.length)} files; expected 8 content + manifest + coverage`);
  const issuerIds = new Set(content.issuers.map((issuer) => issuer.issuerId));
  const securityIds = new Set(content.securities.map((security) => security.securityId));
  add('admitted-issuer-identities', issuerIds.size === 3 && ADMITTED_INPUTS.every((entry) => issuerIds.has(entry.issuerId)), '3 admitted issuer identities resolved');
  add('security-identity-resolution', securityIds.size === content.securities.length && content.securities.every((security) => issuerIds.has(security.issuerId)), `${String(content.securities.length)} securities resolve to admitted issuers`);
  add('listing-resolution', content.listings.every((listing) => {
    const security = content.securities.find((entry) => entry.securityId === listing.securityId);
    return security !== undefined && security.issuerId === listing.issuerId;
  }) && listingConflicts(content.listings).length === 0, `${String(content.listings.length)} listings resolve without overlap`);
  add('corporate-actions', content.corporateActions.length === 0 && content.corporateActions.every((action) => issuerIds.has(action.subjectIssuerId)), 'empty admitted corporate-action table preserved');
  add('operating-metrics-and-prices', content.operatingMetrics.length === 0 && content.prices.length === 0, 'no unsupported metric or price was fabricated');
  const annual = content.periods.filter((period) => period.period.periodType === 'ANNUAL').length;
  const quarterly = content.periods.filter((period) => period.period.periodType === 'QUARTER').length;
  const periodKeys = new Set(content.periods.map((period) => `${period.issuerId}|${period.period.periodType}|${period.period.periodStart}|${period.period.periodEnd}|${period.period.statementScope}|${period.basis}`));
  add('period-validation', annual === 11 && quarterly === 2 && periodKeys.size === content.periods.length && content.periods.every((period) => issuerIds.has(period.issuerId)), '13 unique periods = 11 ANNUAL + 2 QUARTER');
  add('ingestion-issues', content.issues.length === 0, '0 ingestion issues');
  const expectedCoverageText = serializeDatasetFile(measureCoverage(content, { datasetVersion: actualDigest, generatedAt: S4_R3_BUILD_CLOCK }));
  add('derived-coverage-report', readFileSync(join(datasetDir, COVERAGE_FILE_NAME), 'utf8') === expectedCoverageText, 'coverage-report.json matches the authoritative recomputation for the verified content');
  const coverage = investmentCoverageFromLocalDataset(S4_R3_AS_OF, out);
  add('runtime-coverage-read', coverage.dataset.datasetVersion === actualDigest && coverage.measuredSectors === 3 && coverage.issues.length === 0, 'authoritative coverage read loads the candidate; this is not installation or overall readiness');
  const entries = expectedNames.map((name) => {
    const raw = readFileSync(join(datasetDir, name));
    const actual = sha256(raw);
    const expected = name === COVERAGE_FILE_NAME ? sha256(expectedCoverageText) : ((reference.files as Readonly<Record<string, string>>)[name] ?? null);
    return { path: `investment/dataset/${name}`, bytes: raw.length, sha256: actual, expectedSha256: expected, match: expected === null || expected === actual };
  });
  add('file-level-digest-ledger', entries.every((entry) => entry.match), `${String(entries.filter((entry) => entry.match).length)}/${String(entries.length)} package files match available expectations`);
  const ledger: CandidateLedger = { schemaVersion: 1, scope: 'all files under investment/dataset; excludes verification/', datasetVersion: actualDigest, entries };
  const failed = checks.some((check) => !check.ok);
  const report: CandidateVerificationReport = {
    schemaVersion: 1, tool: 'build-s4-r3-candidate', generatedAt: new Date().toISOString(),
    result: failed ? (digestOk ? 'FAIL' : 'BLOCKED_DIGEST_MISMATCH') : 'PASS',
    outputDir: out, datasetDir, expectedCandidateDigest: S4_R3_CANDIDATE_DIGEST, actualCandidateDigest: actualDigest,
    buildClock: S4_R3_BUILD_CLOCK, authoritativePipeline: 'src/investment/cli/ingest.ts',
    ledgerSha256: sha256(serializeDatasetFile(ledger)), inputs: admitted.inputs, checks,
    boundaries: { windowsInstallation: 'NOT_EXECUTED', existingWindowsDataset: 'UNTOUCHED', stage2Provisioning: 'NOT_EXECUTED', portfolioDatabase: 'NOT_ACCESSED', gitHubDatasetPublication: 'NOT_PERFORMED', overallIidReadiness: 'NOT_READY' },
    limitations: { L041: 'OPEN', L042: 'OPEN', freshness: ADMITTED_INPUTS.map((entry) => ({ issuerId: entry.issuerId, flags: ['STALE_STATEMENTS', 'STALE_DATA'] as const })), pdfToTranscriptionVerification: 'NOT_CLAIMED', independentSourceRightsVerification: 'NOT_CLAIMED' },
  };
  return { ledger, report };
}

/** Write verification metadata beside an already generated candidate. Never writes dataset content. */
export function recordCandidateVerification(outputDir: string, repositoryRoot = DEFAULT_REPOSITORY_ROOT): CandidateVerificationReport {
  const { ledger, report } = inspectCandidate(outputDir, repositoryRoot);
  const dir = join(resolve(outputDir), 'verification');
  mkdirSync(dir, { recursive: false });
  writeFileSync(join(dir, 'file-digests.json'), serializeDatasetFile(ledger), 'utf8');
  writeFileSync(join(dir, 'verification.json'), serializeDatasetFile(report), 'utf8');
  return report;
}

/** Build once into a NEW directory outside the repository. A mismatch is preserved, never installed or admitted. */
export function buildCandidate(outputDir: string, repositoryRoot = DEFAULT_REPOSITORY_ROOT): CandidateVerificationReport {
  const root = realpathSync(resolve(repositoryRoot));
  const admitted = validateAdmittedInputs(root);
  validateEvidenceLedger(root);
  recordedManifest(root);
  const target = resolve(outputDir);
  if (existsSync(target)) throw new Error(`refusing existing candidate destination: ${target}`);
  const parent = dirname(target);
  if (!existsSync(parent) || !statSync(parent).isDirectory()) throw new Error(`candidate parent directory must already exist: ${parent}`);
  const realParent = realpathSync(parent);
  const prospective = join(realParent, basename(target));
  if (contains(root, prospective)) throw new Error('candidate output must be outside the repository working tree');
  mkdirSync(target);
  const datasetDir = join(target, 'investment', 'dataset');
  const code = ingest([...admitted.bundles.flatMap((bundle) => ['--input', bundle.dir]), '--dataset-dir', datasetDir, '--now', S4_R3_BUILD_CLOCK]);
  if (code !== 0) throw new Error(`authoritative ingestion failed with exit ${String(code)}; candidate/diagnostic directory preserved at ${target}`);
  const report = recordCandidateVerification(target, root);
  if (report.result !== 'PASS') throw new Error(`candidate blocked: ${report.result}; preserved at ${target}; no admission or installation performed`);
  return report;
}

/** Verify an existing package and its recorded ledger/evidence without writing anything. */
export function verifyExistingCandidate(outputDir: string, repositoryRoot = DEFAULT_REPOSITORY_ROOT): CandidateVerificationReport {
  const out = realpathSync(resolve(outputDir));
  const before = snapshot(out);
  const { ledger, report } = inspectCandidate(out, repositoryRoot);
  const ledgerPath = join(out, 'verification', 'file-digests.json');
  const evidencePath = join(out, 'verification', 'verification.json');
  const ledgerRaw = readFileSync(ledgerPath);
  const recordedLedger = readJson<CandidateLedger>(ledgerPath);
  const evidence = readJson<CandidateVerificationReport>(evidencePath);
  if (sha256(ledgerRaw) !== report.ledgerSha256 || canonicalize(recordedLedger) !== canonicalize(ledger)) throw new Error('recorded file-level digest ledger does not match the candidate bytes');
  if (evidence.result !== 'PASS' || evidence.actualCandidateDigest !== report.actualCandidateDigest || evidence.ledgerSha256 !== report.ledgerSha256) throw new Error('recorded verification evidence does not attest this exact candidate/ledger');
  const after = snapshot(out);
  if (canonicalize(before) !== canonicalize(after)) throw new Error('verify-only changed the candidate package');
  if (report.result !== 'PASS') throw new Error(`candidate verification failed: ${report.result}`);
  return report;
}

function main(argv: readonly string[]): number {
  let output: string | undefined;
  let build = false;
  let verify = false;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]!;
    if (token === '--output-dir') {
      const value = argv[index + 1];
      if (output !== undefined || value === undefined || value.startsWith('--')) { output = undefined; break; }
      output = value;
      index += 1;
      continue;
    }
    if (token === '--build' && !build) { build = true; continue; }
    if (token === '--verify-only' && !verify) { verify = true; continue; }
    output = undefined;
    break;
  }
  if (output === undefined || build === verify) {
    process.stderr.write('usage: build-s4-r3-candidate.ts (--build | --verify-only) --output-dir <directory>\n');
    return 2;
  }
  const report = build ? buildCandidate(output) : verifyExistingCandidate(output);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return report.result === 'PASS' ? 0 : 1;
}
const invokedDirectly = process.argv[1] !== undefined && /build-s4-r3-candidate\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }
}
