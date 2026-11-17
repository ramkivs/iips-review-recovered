/**
 * S4-R3 pinned candidate-build wrapper.
 *
 * Exercises the real admitted inputs and the real ingestion CLI in isolated temporary directories only.
 * No Windows host, runtime dataset, identity provisioning, portfolio database, or GitHub publication is involved.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  S4_R3_CANDIDATE_DIGEST,
  buildCandidate,
  inspectCandidate,
  verifyExistingCandidate,
  type CandidateLedger,
} from '../../src/investment/cli/build-s4-r3-candidate';
import { DATASET_FILE_NAMES } from '../../src/investment/ingestion/writer';

const ROOT = join(__dirname, '..', '..', '..');
const BUNDLE = join(ROOT, 'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14');
const INPUT_DIRS = [
  'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input',
  'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico',
  'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec',
];
let temp = '';
let good = '';
const sha256 = (raw: Buffer | string): string => createHash('sha256').update(raw).digest('hex');
function snapshot(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (dir: string, prefix = ''): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path, rel);
      else { const s = statSync(path); out[rel] = `${String(s.size)}:${String(s.mtimeMs)}:${sha256(readFileSync(path))}`; }
    }
  };
  walk(root);
  return out;
}
function copyPackage(name: string): string {
  const target = join(temp, name);
  cpSync(good, target, { recursive: true });
  return target;
}

before(() => {
  temp = mkdtempSync(join(tmpdir(), 'iid-s4-r3-candidate-build-'));
  good = join(temp, 'good');
  const report = buildCandidate(good, ROOT);
  assert.equal(report.result, 'PASS');
});
after(() => { if (temp !== '') rmSync(temp, { recursive: true, force: true }); });

describe('S4-R3 candidate build — exact identity and package metadata', () => {
  it('builds the exact admitted candidate through the authoritative CLI and writes only the new package', () => {
    const dataset = join(good, 'investment', 'dataset');
    const manifest = JSON.parse(readFileSync(join(dataset, 'manifest.json'), 'utf8')) as { contentDigest: string; files: Record<string, string> };
    assert.equal(manifest.contentDigest, S4_R3_CANDIDATE_DIGEST);
    assert.deepEqual(Object.keys(manifest.files).sort(), [...DATASET_FILE_NAMES].sort());
    assert.equal(readFileSync(join(dataset, 'manifest.json'), 'utf8'), readFileSync(join(BUNDLE, 'runs/candidate-manifest.json'), 'utf8'));
    for (const name of DATASET_FILE_NAMES) assert.equal(sha256(readFileSync(join(dataset, name))), manifest.files[name]);
    const ledger = JSON.parse(readFileSync(join(good, 'verification/file-digests.json'), 'utf8')) as CandidateLedger;
    assert.equal(ledger.entries.length, 10);
    assert.equal(ledger.datasetVersion, S4_R3_CANDIDATE_DIGEST);
    assert.ok(ledger.entries.every((entry) => entry.match));
    const evidence = JSON.parse(readFileSync(join(good, 'verification/verification.json'), 'utf8')) as { result: string; boundaries: Record<string, string>; limitations: Record<string, unknown> };
    assert.equal(evidence.result, 'PASS');
    assert.equal(evidence.boundaries.windowsInstallation, 'NOT_EXECUTED');
    assert.equal(evidence.boundaries.stage2Provisioning, 'NOT_EXECUTED');
    assert.equal(evidence.boundaries.overallIidReadiness, 'NOT_READY');
    assert.equal(evidence.limitations.L041, 'OPEN');
    assert.equal(evidence.limitations.L042, 'OPEN');
  });

  it('verify-only re-reads the package and attests that nothing changed', () => {
    const before = snapshot(good);
    const report = verifyExistingCandidate(good, ROOT);
    assert.equal(report.result, 'PASS');
    assert.deepEqual(snapshot(good), before);
  });
});

describe('S4-R3 candidate build — fail-closed refusals', () => {
  it('refuses an existing destination without changing it', () => {
    const before = snapshot(good);
    assert.throws(() => buildCandidate(good, ROOT), /refusing existing candidate destination/);
    assert.deepEqual(snapshot(good), before);
  });

  it('refuses an output inside the repository before creating it', () => {
    const target = join(ROOT, `s4-r3-refused-${String(process.pid)}-${String(Date.now())}`);
    assert.equal(existsSync(target), false);
    assert.throws(() => buildCandidate(target, ROOT), /outside the repository/);
    assert.equal(existsSync(target), false);
  });

  it('refuses altered admitted input bytes before creating any output directory', () => {
    const fakeRoot = join(temp, 'altered-input-repo');
    for (const dir of INPUT_DIRS) cpSync(join(ROOT, dir), join(fakeRoot, dir), { recursive: true });
    const periods = join(fakeRoot, INPUT_DIRS[1]!, 'periods.csv');
    writeFileSync(periods, `${readFileSync(periods, 'utf8')}\n`);
    const target = join(temp, 'must-not-be-created');
    assert.throws(() => buildCandidate(target, fakeRoot), /admitted input file digest mismatch/);
    assert.equal(existsSync(target), false);
  });

  it('detects altered content and preserves the diagnostic bytes', () => {
    const target = copyPackage('altered-content');
    const path = join(target, 'investment/dataset/periods.json');
    writeFileSync(path, `${readFileSync(path, 'utf8')} `);
    const before = snapshot(target);
    assert.throws(() => verifyExistingCandidate(target, ROOT));
    assert.deepEqual(snapshot(target), before);
  });

  it('detects a missing declared file', () => {
    const target = copyPackage('missing-file');
    rmSync(join(target, 'investment/dataset/prices.json'));
    assert.throws(() => verifyExistingCandidate(target, ROOT), /missing/);
  });

  it('detects a wrong manifest identity', () => {
    const target = copyPackage('wrong-manifest');
    const path = join(target, 'investment/dataset/manifest.json');
    const manifest = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    manifest.contentDigest = `sha256:${'0'.repeat(64)}`;
    writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
    assert.throws(() => verifyExistingCandidate(target, ROOT), /content digest/);
  });

  it('detects a tampered file-level ledger even when the dataset itself still verifies', () => {
    const target = copyPackage('tampered-ledger');
    const path = join(target, 'verification/file-digests.json');
    const ledger = JSON.parse(readFileSync(path, 'utf8')) as CandidateLedger;
    const altered = { ...ledger, entries: ledger.entries.map((entry, index) => index === 0 ? { ...entry, sha256: '0'.repeat(64) } : entry) };
    writeFileSync(path, `${JSON.stringify(altered, null, 2)}\n`);
    assert.throws(() => verifyExistingCandidate(target, ROOT), /ledger/);
  });

  it('detects a stale or altered derived coverage report', () => {
    const target = copyPackage('altered-coverage');
    const path = join(target, 'investment/dataset/coverage-report.json');
    writeFileSync(path, `${readFileSync(path, 'utf8')} `);
    const { report } = inspectCandidate(target, ROOT);
    assert.equal(report.result, 'FAIL');
    assert.equal(report.checks.find((check) => check.id === 'derived-coverage-report')?.ok, false);
    assert.throws(() => verifyExistingCandidate(target, ROOT));
  });
});
