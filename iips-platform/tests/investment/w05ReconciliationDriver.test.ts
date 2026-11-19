/**
 * W05 — reconciliation driver tests (workflow steps 2–3).
 *
 * SYNTHETIC, DECLARED ROWS ONLY. These tests pin the driver's validation, refusal and evidence-output
 * behaviour. They are not the W04 revision-1 holdings and no revision-1 figure is produced or claimed
 * here. The anti-substitution rule is itself under test: a run over any other census must be labelled
 * as such and can never be presented as the revision-1 result.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { run } from '../../src/investment/cli/run-census-reconciliation';
import type { CensusHoldingRow } from '../../src/investment/lifecycle/censusReconciliation';
import { IDENTITY_FIXTURES } from './identityFixture';
import { writeTempDataset } from './fixtures';

function row(overrides: Partial<CensusHoldingRow> & { holdingId: string }): CensusHoldingRow {
  return {
    portfolioId: 'PORT-SYNTHETIC',
    portfolioRevision: 'rev-test-1',
    symbol: null,
    isin: null,
    exchange: null,
    quantity: 10,
    storedSecurityIdentity: null,
    category: 'MISSING_OR_UNRESOLVED',
    ...overrides,
  };
}

function sampleRows(): CensusHoldingRow[] {
  return [
    row({ holdingId: 'R-1', isin: 'IN0000000011', symbol: 'AARAV', exchange: 'NSE', storedSecurityIdentity: 'IN0000000011', category: 'QUALIFIED' }),
    row({ holdingId: 'R-2', symbol: 'AARAV', exchange: 'NSE', category: 'MISSING_OR_UNRESOLVED' }),
    row({ holdingId: 'R-3', symbol: 'NOSUCH', exchange: 'NSE', category: 'MISSING_OR_UNRESOLVED' }),
    row({ holdingId: 'R-4', symbol: 'NOSUCH2', exchange: 'NSE', storedSecurityIdentity: 'SEC-ORPHAN-1', category: 'AMBIGUOUS' }),
    row({ holdingId: 'R-5', isin: 'IN0000000029', symbol: 'BODHI', exchange: 'NSE', category: 'MISSING_OR_UNRESOLVED' }),
  ];
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

interface Capture {
  readonly code: number;
  readonly out: string;
  readonly err: string;
}

function captureRun(argv: readonly string[]): Capture {
  const originalOut = process.stdout.write;
  const originalErr = process.stderr.write;
  let out = '';
  let err = '';
  process.stdout.write = ((chunk: string | Uint8Array): boolean => {
    out += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string | Uint8Array): boolean => {
    err += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
    return true;
  }) as typeof process.stderr.write;
  try {
    return { code: run(argv), out, err };
  } finally {
    process.stdout.write = originalOut;
    process.stderr.write = originalErr;
  }
}

function buildBundle(name: string, rows: readonly CensusHoldingRow[]): { bundle: string; out: string } {
  const root = mkdtempSync(join(tmpdir(), `w05-driver-${name}-`));
  const bundle = join(root, 'bundle');
  const out = join(root, 'out');
  mkdirSync(join(bundle, 'identity-sources'), { recursive: true });
  for (const file of ['eligible-roster.json', 'listing-map.json', 'corporate-actions.json']) {
    cpSync(join(IDENTITY_FIXTURES, file), join(bundle, 'identity-sources', file));
  }
  writeJson(join(bundle, 'census-rows.json'), rows);
  writeJson(join(bundle, 'provenance.json'), {
    asOf: '2026-09-15',
    route: '/api/investment/coverage?asOf=2026-09-15',
    note: 'synthetic declared rows — not the W04 revision-1 holdings',
  });
  return { bundle, out };
}

function addInputDigests(bundle: string, files: readonly string[]): void {
  const entries: Record<string, { sha256: string; bytes: number }> = {};
  for (const name of files) {
    const path = join(bundle, name);
    entries[name] = { sha256: sha256(path), bytes: readFileSync(path).byteLength };
  }
  writeJson(join(bundle, 'input-digests.json'), { algorithm: 'SHA-256', files: entries });
}

describe('W05 — run-census-reconciliation driver: validation, refusal and evidence outputs', () => {
  test('a complete bundle runs, publishes every evidence output, and is repeatable', () => {
    const { bundle, out } = buildBundle('happy', sampleRows());
    writeJson(join(bundle, 'w04-census-expected.json'), {
      total: 5,
      categories: { QUALIFIED: 1, AMBIGUOUS: 1, MISSING_OR_UNRESOLVED: 3, EXPIRED_OR_INELIGIBLE: 0, UNAVAILABLE: 0 },
    });
    writeJson(join(bundle, 'eligible-set.json'), {
      basis: 'synthetic product-scope designation (test)',
      exclusions: [{ observationId: 'R-5', reason: 'instrument class outside product scope' }],
    });
    addInputDigests(bundle, ['census-rows.json', 'provenance.json']);

    const first = captureRun([bundle, '--out', out, '--generated-at', '2026-09-15T00:00:00.000Z']);
    assert.equal(first.code, 0, first.err);
    for (const name of ['reconciliation-result.json', 'reconciliation-summary.txt', 'holding-level.tsv', 'disagreements.json', 'output-digests.json']) {
      assert.ok(existsSync(join(out, name)), `${name} is published`);
    }

    const envelope = JSON.parse(readFileSync(join(out, 'reconciliation-result.json'), 'utf8'));
    assert.equal(envelope.driver, 'run-census-reconciliation');
    assert.equal(envelope.result.summary.rowsSupplied, 5);
    assert.equal(envelope.result.eligibleSet.designated, true);
    assert.equal(envelope.result.eligibleSet.size, 4);
    assert.equal(envelope.provenance.note, 'synthetic declared rows — not the W04 revision-1 holdings', 'provenance is carried verbatim');

    const tsv = readFileSync(join(out, 'holding-level.tsv'), 'utf8').trim().split('\n');
    assert.equal(tsv.length, 6, 'header plus one line per holding');
    assert.match(tsv[1]!, /R-1\tPORT-SYNTHETIC\trev-test-1\t10\tQUALIFIED\tIN0000000011\tRESOLVED/);

    // The D2 disagreement and the census-only split are both disclosed, never smoothed over.
    const disagreements = JSON.parse(readFileSync(join(out, 'disagreements.json'), 'utf8'));
    assert.equal(disagreements.count, 2);
    const ids = disagreements.entries.map((entry: { holdingId: string }) => entry.holdingId).sort();
    assert.deepEqual(ids, ['R-2', 'R-4']);
    const runOnly = disagreements.entries.find((entry: { holdingId: string }) => entry.holdingId === 'R-2');
    assert.equal(runOnly.identityAgreement.state, 'RUN_ONLY');
    assert.equal(runOnly.identityAgreement.agrees, false);
    assert.match(runOnly.identityAgreement.note, /EXCHANGE_SYMBOL/);
    assert.match(runOnly.identityAgreement.note, /D2/);

    const summary = readFileSync(join(out, 'reconciliation-summary.txt'), 'utf8');
    assert.match(summary, /headline: per-holding reconciliation only; no revision-1 coverage figure is asserted/);
    assert.match(summary, /DISAGREES/);

    // Published outputs verify against their own digest manifest.
    const outputDigests = JSON.parse(readFileSync(join(out, 'output-digests.json'), 'utf8'));
    for (const [name, entry] of Object.entries(outputDigests.files as Record<string, { sha256: string }>)) {
      assert.equal(sha256(join(out, name)), entry.sha256, `${name} matches its published digest`);
    }

    // Repeatability: identical inputs produce byte-identical evidence.
    const out2 = `${out}-repeat`;
    const second = captureRun([bundle, '--out', out2, '--generated-at', '2026-09-15T00:00:00.000Z']);
    assert.equal(second.code, 0, second.err);
    assert.equal(
      readFileSync(join(out, 'reconciliation-result.json'), 'utf8'),
      readFileSync(join(out2, 'reconciliation-result.json'), 'utf8'),
    );
  });

  test('an absent bundle dir exits 2 and invents nothing', () => {
    const result = captureRun(['/nonexistent/bundle', '--out', join(tmpdir(), 'w05-driver-nope')]);
    assert.equal(result.code, 2);
    assert.match(result.err, /bundle directory not found/);
  });

  test('a missing or unparseable census-rows.json is refused', () => {
    const { bundle, out } = buildBundle('missing-rows', sampleRows());
    const fs = require('node:fs') as typeof import('node:fs');
    fs.rmSync(join(bundle, 'census-rows.json'));
    const missing = captureRun([bundle, '--out', out]);
    assert.equal(missing.code, 1);
    assert.match(missing.err, /missing .*census-rows\.json/);
    assert.match(missing.err, /never invents rows/);

    writeFileSync(join(bundle, 'census-rows.json'), '{not json', 'utf8');
    const broken = captureRun([bundle, '--out', out]);
    assert.equal(broken.code, 2);
    assert.match(broken.err, /could not be read or parsed/);
  });

  test('malformed rows are refused item by item — nothing is guessed or filled in', () => {
    const rows = sampleRows() as unknown as Array<Record<string, unknown>>;
    rows[0] = { ...rows[0], category: 'NOT_A_CATEGORY' };
    rows[1] = { ...rows[1], holdingId: '' };
    rows[2] = { ...rows[2], quantity: 'ten' };
    const { bundle, out } = buildBundle('malformed', rows as unknown as CensusHoldingRow[]);
    const result = captureRun([bundle, '--out', out]);
    assert.equal(result.code, 1);
    assert.match(result.err, /category must be one of/);
    assert.match(result.err, /holdingId must be a non-empty string/);
    assert.match(result.err, /quantity must be a number or null/);
  });

  test('duplicate holding ids, count mismatches and W04-count mismatches all stop the run', () => {
    const dup = sampleRows();
    dup[1] = { ...dup[1]!, holdingId: 'R-1' };
    const dupBundle = buildBundle('dup', dup);
    const dupResult = captureRun([dupBundle.bundle, '--out', dupBundle.out]);
    assert.equal(dupResult.code, 1);
    assert.match(dupResult.err, /duplicate holdingId R-1/);

    const { bundle, out } = buildBundle('counts', sampleRows());
    const expectResult = captureRun([bundle, '--out', out, '--expect-count', '64']);
    assert.equal(expectResult.code, 1);
    assert.match(expectResult.err, /does not match --expect-count 64/);

    writeJson(join(bundle, 'w04-census-expected.json'), {
      total: 64,
      categories: { QUALIFIED: 1, AMBIGUOUS: 0, MISSING_OR_UNRESOLVED: 63, EXPIRED_OR_INELIGIBLE: 0, UNAVAILABLE: 0 },
    });
    const w04Result = captureRun([bundle, '--out', out]);
    assert.equal(w04Result.code, 1);
    assert.match(w04Result.err, /does not match the W04 census record/);
    assert.match(w04Result.err, /row count 5 does not match the W04 record total 64/);
  });

  test('a tampered file listed in input-digests.json is refused before the harness runs', () => {
    const { bundle, out } = buildBundle('tampered', sampleRows());
    addInputDigests(bundle, ['census-rows.json', 'provenance.json']);
    writeFileSync(join(bundle, 'provenance.json'), '{"asOf":"2026-09-15","tampered":true}\n', 'utf8');
    const result = captureRun([bundle, '--out', out]);
    assert.equal(result.code, 1);
    assert.match(result.err, /digest mismatch for provenance\.json/);
  });

  test('the installed identity sources are required — fail closed, never a fallback roster', () => {
    const { bundle, out } = buildBundle('no-sources', sampleRows());
    const fs = require('node:fs') as typeof import('node:fs');
    fs.rmSync(join(bundle, 'identity-sources'), { recursive: true });
    const result = captureRun([bundle, '--out', out]);
    assert.equal(result.code, 1);
    assert.match(result.err, /identity-sources/);
    assert.match(result.err, /part of the input bundle/);
  });

  test('a broken candidate dataset is refused by name, never silently dropped', () => {
    const { bundle, out } = buildBundle('bad-dataset', sampleRows());
    const temp = writeTempDataset();
    try {
      mkdirSync(join(bundle, 'datasets'), { recursive: true });
      cpSync(temp.dir, join(bundle, 'datasets', 'candidate'), { recursive: true });
      const periodsPath = join(bundle, 'datasets', 'candidate', 'periods.json');
      const periods = JSON.parse(readFileSync(periodsPath, 'utf8')) as unknown[];
      writeFileSync(periodsPath, JSON.stringify([...periods, { tampered: true }]), 'utf8');
      const result = captureRun([bundle, '--out', out]);
      assert.equal(result.code, 1);
      assert.match(result.err, /dataset candidate could not be read/);
      assert.match(result.err, /DatasetIntegrityError/);
    } finally {
      temp.cleanup();
    }
  });

  test('flags without values and unknown flags are refused, not guessed', () => {
    const { bundle, out } = buildBundle('flags', sampleRows());
    assert.equal(captureRun([bundle, '--out']).code, 1);
    assert.equal(captureRun([bundle, '--out', out, '--mystery', 'x']).code, 1);
    assert.equal(captureRun([]).code, 1);
    assert.equal(captureRun([bundle, '--out', out, '--as-of', 'yesterday']).code, 1);
  });
});
