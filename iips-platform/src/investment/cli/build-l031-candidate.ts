#!/usr/bin/env tsx
/**
 * L-031 — pinned, candidate-only build and verification wrapper for candidate d2b65bcc.
 *
 *   tsx src/investment/cli/build-l031-candidate.ts --build --output-dir <NEW directory outside this repository>
 *   tsx src/investment/cli/build-l031-candidate.ts --verify-only --output-dir <existing candidate package>
 *
 * This is NOT a new dataset-generation pipeline. It validates the exact O3-admitted inputs, invokes the existing
 * multi-input ingestion CLI (`ingest.ts`) once, and verifies the published bytes through the existing reader,
 * manifest verifier, content-digest algorithm and runtime coverage read. It writes only a new candidate package
 * and non-content verification metadata beside it. It never installs, provisions identity, opens a database,
 * accesses the Windows host, publishes to Git/GitHub, or claims overall IID readiness.
 *
 * The output directory must NOT exist and must be outside this repository. Its parent must already exist. A
 * failed or mismatching build is preserved for diagnosis; nothing is overwritten or retried-over. The fixed build clock is the recorded L-031 candidate build clock (2026-11-20), not a claim about current time.
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

export const L031_CANDIDATE_DIGEST = 'sha256:d2b65bccd5d8ff289119068eb1c03f094a232c9ea6a754b060b76f9386f509bd';
export const EXPECTED_CONTENT_FILE_SHA256: Readonly<Record<string,string>> = {
  'corporateActions.json': 'f118919b04d2d4217df8b02193916850d52020920d6fedae28ae414343142320',
  'issuers.json': 'b67da8709e7044312c5ef2db5fd92c416dc349bfdaff54f08f2d4194a5bc4014',
  'issues.json': '37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570',
  'listings.json': '77f8d13490332c05589d3ebbdb59bda98ef7cebc853371d652698824ab992130',
  'operatingMetrics.json': '37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570',
  'periods.json': '50fee979d9b6b4557d1c1272f892717f2fc82a780257b1b58b4bf0fdecc88173',
  'prices.json': '37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570',
  'securities.json': 'd25abfdede4a4bb89f44babcf8a3690f294e5c2bd93651109ddebe6590abc5ab',
};
export const L031_BUILD_CLOCK = '2026-11-20T00:00:00.000Z';
export const L031_AS_OF = '2026-11-20';
const EVIDENCE_LEDGER_SHA256 = '0a3e0664c4ce49b75492ea126429665b9bcc35826ffaeefd1e67495242c7dbb7';
const BUNDLE_REL = 'evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20';
const DEFAULT_REPOSITORY_ROOT = resolve(__dirname, '../../../..');

const ADMITTED_INPUTS = [
  {
    issuerId: 'IN:CIN:L85110KA1981PLC013115',
    dir: `${BUNDLE_REL}/ingest-input/infosys`,
    inputDigest: 'sha256:c8dd466608e93ceca26d924516d06ffa805c259f2b78eefbf402980029cc3b7f',
    files: {
      'corporate-actions.json': '9364d39df722bbd68996b87dae6b7deef3e2a57903cbe2bd9a6b7b3ec13e79d6',
      'periods.csv': '87728ec81892ec08cc707a651a9d00861ef7a0993f65f0db7346da9c55f2b8dd',
      'roster.json': '426e8478bca1ffc3fd47a6a24995230cfbfc05ccd1df4b92fa774ba15c60f8b4',
    },
  },
  {
    issuerId: 'IN:CIN:L15140MH1988PLC049208',
    dir: 'evidence/real-issuer/S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19/ingest-input/marico',
    inputDigest: 'sha256:bf670d6efbe8c8444235ec199203078a26635670dd288fa6a0cfe2c67622d91c',
    files: {
      'periods.csv': '59464d497418c2a989e7ed9e64446b103bf9fe5a3d214800871e0dda1cb014e6',
      'roster.json': '259c2f093b611af8e1541a78ea5e151cc2ab41cf93ef32bbfaa54fcb18c2cadb',
    },
  },
  {
    issuerId: 'IN:CIN:L45200MH2005PLC152061',
    dir: 'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec',
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
  readonly tool: 'build-l031-candidate';
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
    readonly windowCoverageProvenance: 'OPERATOR_DECLARED';
    readonly pdfToTranscriptionVerification: 'NOT_CLAIMED';
    readonly independentSourceRightsVerification: 'NOT_CLAIMED';
    readonly windowsInstallation: 'NOT_EXECUTED';
    readonly d8ActiveDatasetVerification: 'OUTSTANDING';
    readonly g2InstalledDataset: 'OUTSTANDING';
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
  if (sha256(raw) !== EVIDENCE_LEDGER_SHA256) throw new Error('enclosing L-031 evidence ledger SHA-256 mismatch');
  const ledger = readJson<{ readonly files: Readonly<Record<string, { readonly sha256: string; readonly bytes: number }>>; readonly successorInputDigest?: string; readonly candidateDatasetVersion?: string }>(ledgerPath);
  if (ledger.successorInputDigest !== 'sha256:c8dd466608e93ceca26d924516d06ffa805c259f2b78eefbf402980029cc3b7f') throw new Error('L-031 ledger successorInputDigest mismatch');
  if (ledger.candidateDatasetVersion !== L031_CANDIDATE_DIGEST) throw new Error('L-031 ledger candidateDatasetVersion mismatch');
  const names = Object.keys(ledger.files).sort();
  const actual = filesUnder(bundle).filter((name) => name !== 'digests.json').sort();
  if (canonicalize(names) !== canonicalize(actual)) throw new Error('enclosing L-031 evidence bundle census mismatch');
  for (const name of names) {
    const file = readFileSync(join(bundle, name));
    const entry = ledger.files[name]!;
    if (sha256(file) !== entry.sha256 || file.length !== entry.bytes) throw new Error(`enclosing evidence digest mismatch: ${name}`);
  }
  return { id: 'enclosing-evidence-ledger', ok: true, detail: `${String(names.length)} entries and ledger SHA-256 match` };
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
  add('admitted-input-digests', true, '3/3 exact input bundles and 7/7 consumed files match');
  checks.push(validateEvidenceLedger(root));
  const read = readDataset(datasetDir);
  const { manifest, content } = read;
  const rawHashes: Record<string, string> = {};
  for (const name of Object.keys(manifest.files)) rawHashes[name] = sha256(readFileSync(join(datasetDir, name)));
  const integrity = verifyManifest(manifest, rawHashes, content);
  add('reader-and-manifest-integrity', integrity.ok, `${String(Object.keys(manifest.files).length)} declared files verified`);
  const actualDigest = computeContentDigest(content);
  const digestOk = actualDigest === L031_CANDIDATE_DIGEST && manifest.contentDigest === actualDigest && manifest.datasetVersion === actualDigest;
  add('exact-o3-candidate-digest', digestOk, `expected ${L031_CANDIDATE_DIGEST}; actual ${actualDigest}`);
  add('pinned-content-file-hashes', canonicalize(manifest.files) === canonicalize(EXPECTED_CONTENT_FILE_SHA256), 'manifest file map equals the pinned expected content-file hashes; absolute audit paths in manifest inputs are not identity');
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
  const actionIds = content.corporateActions.map((action) => `${action.actionId}:${action.type}`).sort();
  add('corporate-actions', canonicalize(actionIds) === canonicalize(['CA-INFY-BONUS-2018-09-06:BONUS', 'CA-INFY-BUYBACK-TENDER-2025-12-04:BUYBACK_TENDER']) && content.corporateActions.every((action) => issuerIds.has(action.subjectIssuerId)), 'exactly the two admitted Infosys corporate actions are present and valid');
  add('operating-metrics-and-prices', content.operatingMetrics.length === 0 && content.prices.length === 0, 'no unsupported metric or price was fabricated');
  const annual = content.periods.filter((period) => period.period.periodType === 'ANNUAL').length;
  const quarterly = content.periods.filter((period) => period.period.periodType === 'QUARTER').length;
  const periodKeys = new Set(content.periods.map((period) => `${period.issuerId}|${period.period.periodType}|${period.period.periodStart}|${period.period.periodEnd}|${period.period.statementScope}|${period.basis}`));
  add('period-validation', annual === 13 && quarterly === 4 && periodKeys.size === content.periods.length && content.periods.every((period) => issuerIds.has(period.issuerId)), '17 unique periods = 13 ANNUAL + 4 QUARTER');
  add('ingestion-issues', content.issues.length === 0, '0 ingestion issues');
  const expectedCoverageText = serializeDatasetFile(measureCoverage(content, { datasetVersion: actualDigest, generatedAt: L031_BUILD_CLOCK }));
  add('derived-coverage-report', readFileSync(join(datasetDir, COVERAGE_FILE_NAME), 'utf8') === expectedCoverageText, 'coverage-report.json matches the authoritative recomputation for the verified content');
  const coverage = investmentCoverageFromLocalDataset(L031_AS_OF, out);
  add('runtime-coverage-read', coverage.dataset.datasetVersion === actualDigest && coverage.measuredSectors === 3 && coverage.issues.length === 0, 'authoritative coverage read loads the candidate; this is not installation or overall readiness');
  const entries = expectedNames.map((name) => {
    const raw = readFileSync(join(datasetDir, name));
    const actual = sha256(raw);
    const expected = name === COVERAGE_FILE_NAME ? sha256(expectedCoverageText) : name === MANIFEST_FILE_NAME ? null : (EXPECTED_CONTENT_FILE_SHA256[name] ?? null);
    return { path: `investment/dataset/${name}`, bytes: raw.length, sha256: actual, expectedSha256: expected, match: expected === null || expected === actual };
  });
  add('file-level-digest-ledger', entries.every((entry) => entry.match), `${String(entries.filter((entry) => entry.match).length)}/${String(entries.length)} package files match available expectations`);
  const ledger: CandidateLedger = { schemaVersion: 1, scope: 'all files under investment/dataset; excludes verification/', datasetVersion: actualDigest, entries };
  const failed = checks.some((check) => !check.ok);
  const report: CandidateVerificationReport = {
    schemaVersion: 1, tool: 'build-l031-candidate', generatedAt: new Date().toISOString(),
    result: failed ? (digestOk ? 'FAIL' : 'BLOCKED_DIGEST_MISMATCH') : 'PASS',
    outputDir: out, datasetDir, expectedCandidateDigest: L031_CANDIDATE_DIGEST, actualCandidateDigest: actualDigest,
    buildClock: L031_BUILD_CLOCK, authoritativePipeline: 'src/investment/cli/ingest.ts',
    ledgerSha256: sha256(serializeDatasetFile(ledger)), inputs: admitted.inputs, checks,
    boundaries: { windowsInstallation: 'NOT_EXECUTED', existingWindowsDataset: 'UNTOUCHED', stage2Provisioning: 'NOT_EXECUTED', portfolioDatabase: 'NOT_ACCESSED', gitHubDatasetPublication: 'NOT_PERFORMED', overallIidReadiness: 'NOT_READY' },
    limitations: { windowCoverageProvenance: 'OPERATOR_DECLARED', pdfToTranscriptionVerification: 'NOT_CLAIMED', independentSourceRightsVerification: 'NOT_CLAIMED', windowsInstallation: 'NOT_EXECUTED', d8ActiveDatasetVerification: 'OUTSTANDING', g2InstalledDataset: 'OUTSTANDING' },
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
    const target = resolve(outputDir);
  if (existsSync(target)) throw new Error(`refusing existing candidate destination: ${target}`);
  const parent = dirname(target);
  if (!existsSync(parent) || !statSync(parent).isDirectory()) throw new Error(`candidate parent directory must already exist: ${parent}`);
  const realParent = realpathSync(parent);
  const prospective = join(realParent, basename(target));
  if (contains(root, prospective)) throw new Error('candidate output must be outside the repository working tree');
  mkdirSync(target);
  const datasetDir = join(target, 'investment', 'dataset');
  const code = ingest([...admitted.bundles.flatMap((bundle) => ['--input', bundle.dir]), '--dataset-dir', datasetDir, '--now', L031_BUILD_CLOCK]);
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
    process.stderr.write('usage: build-l031-candidate.ts (--build | --verify-only) --output-dir <directory>\n');
    return 2;
  }
  const report = build ? buildCandidate(output) : verifyExistingCandidate(output);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return report.result === 'PASS' ? 0 : 1;
}
const invokedDirectly = process.argv[1] !== undefined && /build-l031-candidate\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }
}
