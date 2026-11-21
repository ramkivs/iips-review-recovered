/**
 * L-031 pinned candidate-build wrapper (candidate d2b65bcc).
 *
 * Exercises the real admitted inputs and the real ingestion CLI in isolated temporary directories only.
 * No Windows host, runtime dataset, identity provisioning, portfolio database, or GitHub publication is involved.
 * Windows PowerShell execution is NOT claimed by this suite.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  EXPECTED_CONTENT_FILE_SHA256,
  L031_CANDIDATE_DIGEST,
  buildCandidate,
  inspectCandidate,
  validateAdmittedInputs,
  verifyExistingCandidate,
  type CandidateLedger,
} from '../../src/investment/cli/build-l031-candidate';
import { readDataset } from '../../src/investment/ingestion/writer';

const ROOT = join(__dirname, '..', '..', '..');
const L031_BUNDLE = join(ROOT, 'evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20');
const INPUT_RELS = [
  'evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20/ingest-input/infosys',
  'evidence/real-issuer/S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19/ingest-input/marico',
  'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec',
];
const sha256 = (raw: Buffer | string): string => createHash('sha256').update(raw).digest('hex');
let temp = '';
let good = '';
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
function copyInputs(name: string, mutate: (root: string) => void): string {
  const root = join(temp, name);
  for (const rel of INPUT_RELS) {
    const target = join(root, rel);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(ROOT, rel), target, { recursive: true });
  }
  // The evidence-ledger check needs the L-031 bundle ledger entries too.
  const bundleTarget = join(root, 'evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20');
  cpSync(L031_BUNDLE, bundleTarget, { recursive: true });
  mutate(root);
  return root;
}

before(() => {
  temp = mkdtempSync(join(tmpdir(), 'iid-l031-candidate-build-'));
  good = join(temp, 'good');
  const report = buildCandidate(good, ROOT);
  assert.equal(report.result, 'PASS');
});
after(() => { if (temp !== '') rmSync(temp, { recursive: true, force: true }); });

describe('L-031 candidate build — exact source-input digest enforcement', () => {
  it('pins all three input digests and every consumed file hash', () => {
    const { inputs } = validateAdmittedInputs(ROOT);
    assert.deepEqual(inputs.map((i) => i.inputDigest), [
      'sha256:c8dd466608e93ceca26d924516d06ffa805c259f2b78eefbf402980029cc3b7f',
      'sha256:bf670d6efbe8c8444235ec199203078a26635670dd288fa6a0cfe2c67622d91c',
      'sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a',
    ]);
  });

  it('rejects an altered input file before any build output is created', () => {
    const root = copyInputs('altered', (r) => {
      const p = join(r, INPUT_RELS[1]!, 'periods.csv');
      writeFileSync(p, `${readFileSync(p, 'utf8')}tampered`);
    });
    assert.throws(() => validateAdmittedInputs(root), /digest mismatch|inputDigest mismatch/);
  });

  it('rejects a missing input file', () => {
    const root = copyInputs('missing', (r) => { rmSync(join(r, INPUT_RELS[2]!, 'roster.json')); });
    assert.throws(() => validateAdmittedInputs(root));
  });

  it('rejects an unexpected extra input file (census is exact)', () => {
    const root = copyInputs('extra', (r) => { writeFileSync(join(r, INPUT_RELS[0]!, 'extra.json'), '{}'); });
    assert.throws(() => validateAdmittedInputs(root), /census mismatch/);
  });
});

describe('L-031 candidate build — deterministic reproduction of d2b65bcc', () => {
  it('builds the exact authorised digest through the authoritative pipeline', () => {
    const { report } = inspectCandidate(good, ROOT);
    assert.equal(report.result, 'PASS');
    assert.equal(report.actualCandidateDigest, L031_CANDIDATE_DIGEST);
    assert.equal(report.expectedCandidateDigest, L031_CANDIDATE_DIGEST);
    assert.equal(report.checks.length, 16);
    assert.ok(report.checks.every((c) => c.ok));
  });

  it('reproduces identically on a second independent build', () => {
    const second = join(temp, 'second');
    const report = buildCandidate(second, ROOT);
    assert.equal(report.actualCandidateDigest, L031_CANDIDATE_DIGEST);
    const a = readDataset(join(good, 'investment', 'dataset'));
    const b = readDataset(join(second, 'investment', 'dataset'));
    assert.deepEqual(b.content, a.content);
  });

  it('carries both admitted Infosys corporate actions and no others', () => {
    const read = readDataset(join(good, 'investment', 'dataset'));
    assert.deepEqual(
      read.content.corporateActions.map((a) => [a.actionId, a.type, a.adjustmentFactor]),
      [
        ['CA-INFY-BONUS-2018-09-06', 'BONUS', 0.5],
        ['CA-INFY-BUYBACK-TENDER-2025-12-04', 'BUYBACK_TENDER', 1],
      ],
    );
    assert.equal(read.manifest.coverage.corporateActions, 2);
  });

  it('preserves Marico and KEC content unchanged (period populations per issuer)', () => {
    const read = readDataset(join(good, 'investment', 'dataset'));
    const counts = new Map<string, { annual: number; quarter: number }>();
    for (const p of read.content.periods) {
      const entry = counts.get(p.issuerId) ?? { annual: 0, quarter: 0 };
      if (p.period.periodType === 'ANNUAL') entry.annual += 1; else entry.quarter += 1;
      counts.set(p.issuerId, entry);
    }
    assert.deepEqual(counts.get('IN:CIN:L85110KA1981PLC013115'), { annual: 5, quarter: 0 });
    assert.deepEqual(counts.get('IN:CIN:L15140MH1988PLC049208'), { annual: 5, quarter: 2 });
    assert.deepEqual(counts.get('IN:CIN:L45200MH2005PLC152061'), { annual: 3, quarter: 2 });
    assert.equal(read.content.periods.length, 17);
    assert.deepEqual(read.content.issues, []);
  });

  it('manifest and file inventory match the pinned expectations', () => {
    const datasetDir = join(good, 'investment', 'dataset');
    const names = readdirSync(datasetDir).sort();
    assert.deepEqual(names, [...Object.keys(EXPECTED_CONTENT_FILE_SHA256), 'coverage-report.json', 'manifest.json'].sort());
    const read = readDataset(datasetDir);
    assert.deepEqual({ ...read.manifest.files }, { ...EXPECTED_CONTENT_FILE_SHA256 });
    const ledger = JSON.parse(readFileSync(join(good, 'verification', 'file-digests.json'), 'utf8')) as CandidateLedger;
    assert.equal(ledger.entries.length, 10);
    assert.ok(ledger.entries.every((e) => e.match));
  });
});

describe('L-031 candidate build — verify-only and failure safety', () => {
  it('verify-only passes and is strictly read-only', () => {
    const beforeSnap = snapshot(good);
    const report = verifyExistingCandidate(good, ROOT);
    assert.equal(report.result, 'PASS');
    assert.deepEqual(snapshot(good), beforeSnap);
  });

  it('rejects a candidate whose content bytes were altered after build', () => {
    const target = join(temp, 'tampered-package');
    cpSync(good, target, { recursive: true });
    const p = join(target, 'investment', 'dataset', 'periods.json');
    writeFileSync(p, `${readFileSync(p, 'utf8')} `);
    assert.throws(() => verifyExistingCandidate(target, ROOT));
  });

  it('refuses to build over an existing destination and never touches a sentinel active dataset', () => {
    const active = join(temp, 'active-dataset');
    mkdirSync(active, { recursive: true });
    writeFileSync(join(active, 'sentinel.txt'), 'active');
    const beforeSnap = snapshot(active);
    assert.throws(() => buildCandidate(good, ROOT), /refusing existing candidate destination/);
    assert.throws(() => buildCandidate(join(temp, 'no-parent', 'leaf'), ROOT), /parent directory must already exist/);
    assert.deepEqual(snapshot(active), beforeSnap);
    assert.equal(existsSync(join(temp, 'no-parent')), false);
  });
});
