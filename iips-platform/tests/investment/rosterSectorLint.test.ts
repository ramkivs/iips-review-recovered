/**
 * IID Stage 4 — `S4-R7`: the static roster vocabulary lint.
 *
 * WHAT THESE TESTS PIN. That the lint discovers the *whole* committed hand-authored roster population by
 * walking the tree rather than naming bundles — the previous `S3-D1` test knew three bundles and could
 * not see the S4-R3 refresh rosters at all; that every sector decision is `findInvalidIssuerSectors`
 * itself, not a second vocabulary; that a deliberately respelled roster is rejected with the offending
 * file, issuer and value named, and that the CLI exits non-zero on it; that fixture rosters are excluded
 * from the gated population but reported rather than silently dropped; and that the lint is read-only —
 * the bytes and mtimes of every roster it reads are unchanged afterwards.
 *
 * The negative fixture is synthetic and lives under `tests/**\/fixtures/`, never beside admitted evidence.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

import { findInvalidIssuerSectors } from '../../src/investment/ingestion/sectorValidation';
import {
  discoverRosters,
  lintRosterFile,
  lintRosters,
  main,
  renderReport,
  ROSTER_FILE_NAMES,
} from '../../scripts/lint-roster-sectors';

const PLATFORM = resolve(__dirname, '../..');
const ROOT = resolve(__dirname, '../../..');
const SCRIPT = join(PLATFORM, 'scripts', 'lint-roster-sectors.ts');
const FIXTURES = join(__dirname, 'fixtures', 'roster-lint');
const NEGATIVE = join(FIXTURES, 'respelled-sector-roster.json');
const POSITIVE = join(FIXTURES, 'valid-sector-roster.json');

/** Run the real CLI in a child process so the exit code is the process's own, not a returned number. */
function cli(args: readonly string[]): { status: number; stdout: string; stderr: string } {
  const run = spawnSync(process.execPath, ['--import', 'tsx', SCRIPT, ...args], {
    cwd: PLATFORM,
    encoding: 'utf8',
  });
  return { status: run.status ?? -1, stdout: run.stdout ?? '', stderr: run.stderr ?? '' };
}

/** A temporary repository-shaped tree containing one roster, to prove discovery is not a fixed list. */
function treeWithRoster(fixture: string, bundle = 'SYNTHETIC-LINT-FIXTURE-2026-11-15'): string {
  const dir = mkdtempSync(join(require('node:os').tmpdir(), 's4r7-lint-'));
  const input = join(dir, 'evidence', 'real-issuer', bundle, 'ingest-input');
  mkdirSync(input, { recursive: true });
  copyFileSync(fixture, join(input, 'roster.json'));
  return dir;
}

function fingerprint(path: string): string {
  const stats = statSync(path);
  return `${createHash('sha256').update(readFileSync(path)).digest('hex')}:${stats.mtimeMs}:${stats.size}`;
}

describe('S4-R7 — discovery covers the whole committed roster population', () => {
  test('finds every committed hand-authored roster, not a named subset', () => {
    const { rosters } = discoverRosters(ROOT);
    // Bundles the earlier three-bundle test never looked at, across both roster families.
    for (const path of [
      'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input/roster.json',
      'evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/ingest-input/roster.json',
      'evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input/roster.json',
      'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico/roster.json',
      'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec/roster.json',
      'evidence/real-issuer/D2-NIL-BY-DISCLOSURE-2026-11-06/input/roster.json',
      'evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06/ingest-input/roster.json',
      'evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/ingest-input/roster.json',
      'evidence/real-issuer/WI5-PREFERENCE-CAPITAL-2026-11-07/ingest-input/roster.json',
      'evidence/real-issuer/WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07/ingest-input/roster.json',
      'evidence/real-issuer/WI7-L038-DEBT-COMPLETENESS-2026-11-07/ingest-input/roster.json',
      'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/identity/eligible-roster.json',
    ]) {
      assert.ok(rosters.includes(path), `discovery must include ${path}`);
    }
    assert.ok(rosters.length >= 18, `expected the full committed population, found ${rosters.length}`);
  });

  test('discovery is deterministic and sorted', () => {
    const first = discoverRosters(ROOT);
    const second = discoverRosters(ROOT);
    assert.deepEqual(first, second);
    assert.deepEqual(first.rosters, [...first.rosters].sort());
  });

  test('a newly committed roster is discovered without editing the lint', () => {
    const dir = treeWithRoster(POSITIVE, 'SYNTHETIC-NEWLY-ADDED-BUNDLE');
    try {
      const { rosters } = discoverRosters(dir);
      assert.deepEqual(rosters, [
        'evidence/real-issuer/SYNTHETIC-NEWLY-ADDED-BUNDLE/ingest-input/roster.json',
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('both hand-authored roster filenames are recognised', () => {
    assert.deepEqual([...ROSTER_FILE_NAMES].sort(), ['eligible-roster.json', 'roster.json']);
    const { rosters } = discoverRosters(ROOT);
    assert.ok(rosters.some((path) => path.endsWith('/eligible-roster.json')));
    assert.ok(rosters.some((path) => path.endsWith('/roster.json')));
  });

  test('test fixtures are excluded from the gated population but reported, never silently dropped', () => {
    const { rosters, excludedFixtures } = discoverRosters(ROOT);
    assert.ok(rosters.every((path) => !path.includes('/fixtures/')), 'no fixture may be gated as evidence');
    assert.ok(excludedFixtures.length >= 2, 'excluded fixtures must be enumerated');
    assert.ok(
      excludedFixtures.some((path) => path.endsWith('fixtures/roster.json')),
      'the pre-existing synthetic fixture must be reported as excluded',
    );
  });
});

describe('S4-R7 — every committed roster validates through the one authority', () => {
  test('all committed rosters pass', () => {
    const report = lintRosters(ROOT);
    assert.equal(report.ok, true, renderReport(report));
    assert.equal(report.failed, 0);
    assert.equal(report.checked, report.files.length);
    assert.ok(report.checked >= 18);
    assert.ok(report.files.every((file) => file.ok && file.structuralError === null));
  });

  test('the lint returns exactly what findInvalidIssuerSectors returns — no second vocabulary', () => {
    const { rosters } = discoverRosters(ROOT);
    for (const path of rosters) {
      const parsed = JSON.parse(readFileSync(join(ROOT, path), 'utf8')) as { issuers: never };
      const result = lintRosterFile(ROOT, path);
      assert.deepEqual(result.invalid, findInvalidIssuerSectors(parsed.issuers));
      assert.equal(result.issuerCount, (parsed.issuers as unknown[]).length);
    }
  });

  test('the committed real-issuer rosters keep their canonical sectors', () => {
    const report = lintRosters(ROOT);
    const real = report.files.filter((file) => file.path.startsWith('evidence/real-issuer/'));
    assert.ok(real.length >= 18);
    assert.ok(real.every((file) => file.ok));
  });
});

describe('S4-R7 — the deliberately respelled fixture fails', () => {
  test('the negative fixture is rejected and every offender is named', () => {
    const dir = treeWithRoster(NEGATIVE);
    try {
      const report = lintRosters(dir);
      assert.equal(report.ok, false);
      assert.equal(report.failed, 1);
      const file = report.files[0]!;
      assert.equal(file.invalid.length, 2, 'both offenders must be reported, not just the first');
      assert.equal(file.invalid[0]!.issuerId, 'IN:CIN:L00000AA0000SYN000001');
      assert.equal(file.invalid[0]!.reason, 'CASE');
      assert.equal(file.invalid[0]!.suggestion?.sector, 'Consumer');
      assert.equal(file.invalid[1]!.issuerId, 'IN:CIN:L00000AA0000SYN000002');
      assert.equal(file.invalid[1]!.suggestion?.sector, 'Technology');
      const rendered = renderReport(report);
      assert.match(rendered, /FAIL\s+evidence\/real-issuer\/SYNTHETIC-LINT-FIXTURE-2026-11-15\/ingest-input\/roster\.json/);
      assert.match(rendered, /Synthetic Lint Fixture One Limited/);
      assert.match(rendered, /"consumer"/);
      assert.match(rendered, /RESULT: FAIL/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('the CLI exits non-zero on the respelled roster and names file, issuer and value', () => {
    const dir = treeWithRoster(NEGATIVE);
    try {
      const run = cli(['--root', dir]);
      assert.equal(run.status, 1, `expected exit 1, got ${run.status}\n${run.stdout}\n${run.stderr}`);
      assert.match(run.stderr, /roster\.json/);
      assert.match(run.stderr, /IN:CIN:L00000AA0000SYN000001/);
      assert.match(run.stderr, /"consumer"/);
      assert.match(run.stderr, /RESULT: FAIL/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('the same code path accepts the canonical positive control', () => {
    const dir = treeWithRoster(POSITIVE);
    try {
      assert.equal(lintRosters(dir).ok, true);
      const run = cli(['--root', dir]);
      assert.equal(run.status, 0, run.stderr);
      assert.match(run.stdout, /RESULT: PASS/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('a malformed roster is a failure, not a silent skip', () => {
    const dir = mkdtempSync(join(require('node:os').tmpdir(), 's4r7-malformed-'));
    try {
      const path = join(dir, 'roster.json');
      writeFileSync(path, JSON.stringify({ issuers: { not: 'an array' } }), 'utf8');
      const report = lintRosters(dir);
      assert.equal(report.ok, false);
      assert.match(report.files[0]!.structuralError ?? '', /"issuers" must be an array/);
      writeFileSync(path, '{ not json', 'utf8');
      assert.match(lintRosters(dir).files[0]!.structuralError ?? '', /cannot read or parse roster/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('S4-R7 — the lint is read-only and its CLI contract holds', () => {
  test('the committed rosters are byte- and mtime-identical after linting', () => {
    const { rosters } = discoverRosters(ROOT);
    const before = rosters.map((path) => fingerprint(join(ROOT, path)));
    const report = lintRosters(ROOT);
    const run = cli([]);
    const after = rosters.map((path) => fingerprint(join(ROOT, path)));
    assert.equal(report.ok, true);
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(after, before, 'the lint must not modify, repair or rewrite any roster');
    assert.deepEqual(discoverRosters(ROOT).rosters, rosters, 'the lint must not create or remove rosters');
  });

  test('a failing run does not touch the offending roster either', () => {
    const dir = treeWithRoster(NEGATIVE);
    try {
      const path = join(dir, 'evidence/real-issuer/SYNTHETIC-LINT-FIXTURE-2026-11-15/ingest-input/roster.json');
      const before = fingerprint(path);
      assert.equal(cli(['--root', dir]).status, 1);
      assert.equal(fingerprint(path), before);
      assert.equal(readFileSync(path, 'utf8'), readFileSync(NEGATIVE, 'utf8'));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('the CLI passes on the real repository and reports the population', () => {
    const run = cli([]);
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /rosters checked: \d+; failed: 0/);
    assert.match(run.stdout, /excluded test fixtures: \d+/);
    assert.match(run.stdout, /No roster was modified by this lint\./);
  });

  test('--json emits the machine-readable report', () => {
    const run = cli(['--json']);
    assert.equal(run.status, 0, run.stderr);
    const report = JSON.parse(run.stdout) as { ok: boolean; checked: number; files: unknown[] };
    assert.equal(report.ok, true);
    assert.equal(report.checked, report.files.length);
  });

  test('usage errors exit 2 rather than passing silently', () => {
    assert.equal(cli(['--root']).status, 2);
    assert.equal(cli(['--nonsense']).status, 2);
    assert.equal(main(['--root']), 2);
    assert.equal(main(['--unknown']), 2);
  });

  test('an unscannable root exits 2', () => {
    const dir = mkdtempSync(join(require('node:os').tmpdir(), 's4r7-missing-'));
    const missing = join(dir, 'does-not-exist');
    try {
      assert.equal(cli(['--root', missing]).status, 2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('the fixture tree stays separate from admitted evidence', () => {
    assert.ok(readdirSync(FIXTURES).includes('respelled-sector-roster.json'));
    assert.match(readFileSync(NEGATIVE, 'utf8'), /SYNTHETIC S4-R7 NEGATIVE FIXTURE/);
    assert.ok(!NEGATIVE.startsWith(join(ROOT, 'evidence')), 'a negative fixture must never live in evidence/');
  });
});
