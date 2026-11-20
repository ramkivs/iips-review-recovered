/**
 * W05 — evidence-completeness checker tests (workflow steps 5 and 7).
 *
 * The checker reports every acceptance condition as SATISFIED / PENDING / UNRESOLVED / BLOCKED from
 * machine-readable artifacts and NEVER accepts W05 itself. Two rules are under test here in
 * particular: a run over anything but the 64 revision-1 rows can never satisfy the reconciliation
 * condition, and the PROVISIONAL_PENDING_W10 marker must be preserved and verified while W10 has
 * not established the required-metric set.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildReviewPackage, renderReviewPackage, run } from '../../src/investment/cli/w05-evidence-completeness';

function writeJson(path: string, value: unknown): void {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sha256Text(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** A synthetic repo root whose files carry the standing markers the checker verifies. */
function fakeRepoRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'w05-completeness-repo-'));
  mkdirSync(join(root, 'iips-platform', 'src', 'investment', 'lifecycle'), { recursive: true });
  mkdirSync(join(root, 'docs', 'integration'), { recursive: true });
  writeFileSync(
    join(root, 'iips-platform', 'src', 'investment', 'lifecycle', 'qualification.ts'),
    "export const x = { requiredSetStatus: 'PROVISIONAL_PENDING_W10' };\n",
    'utf8',
  );
  writeFileSync(
    join(root, 'iips-platform', 'src', 'investment', 'lifecycle', 'threshold.ts'),
    "assertionStatus: 'NO_DEFENSIBLE_VALUE_ASSERTED',\n  value: null,\n",
    'utf8',
  );
  writeFileSync(
    join(root, 'docs', 'integration', 'W05-ACTUAL-DOSSIER-2026-11-18.md'),
    '# dossier\n| source | entitlement | retention |\n|---|---|---|\n| a | VERIFIED | VERIFIED |\n',
    'utf8',
  );
  return root;
}

function fullEvidenceRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'w05-completeness-full-'));

  // A published 64-row reconciliation run with reviewed disagreements and verified digests.
  const summaryText = 'summary\n';
  writeJson(join(root, 'reconciliation', 'reconciliation-result.json'), {
    driver: 'run-census-reconciliation',
    result: {
      summary: {
        rowsSupplied: 64,
        agreement: { BOTH_IDENTIFIED: 1, BOTH_UNIDENTIFIED: 61, CENSUS_ONLY: 1, RUN_ONLY: 1 },
      },
    },
  });
  writeFileSync(join(root, 'reconciliation', 'reconciliation-summary.txt'), summaryText, 'utf8');
  writeJson(join(root, 'reconciliation', 'output-digests.json'), {
    algorithm: 'SHA-256',
    files: {
      'reconciliation-result.json': {
        sha256: sha256Text(`${JSON.stringify({
          driver: 'run-census-reconciliation',
          result: {
            summary: {
              rowsSupplied: 64,
              agreement: { BOTH_IDENTIFIED: 1, BOTH_UNIDENTIFIED: 61, CENSUS_ONLY: 1, RUN_ONLY: 1 },
            },
          },
        }, null, 2)}\n`),
        bytes: 1,
      },
      'reconciliation-summary.txt': { sha256: sha256Text(summaryText), bytes: summaryText.length },
    },
  });
  writeJson(join(root, 'reconciliation', 'disagreements.json'), {
    count: 2,
    entries: [{ holdingId: 'H-2' }, { holdingId: 'H-4' }],
  });
  writeJson(join(root, 'reconciliation', 'disagreements-reviewed.json'), {
    reviewed: [
      { holdingId: 'H-2', disposition: 'D2 disclosed disagreement — recorded as a finding', note: 'n1' },
      { holdingId: 'H-4', disposition: 'census-only split — recorded as a finding', note: 'n2' },
    ],
  });

  // Rights verdicts with entitlement AND retention explicit for every declared source.
  writeJson(join(root, 'rights', 'expected-sources.json'), ['src-a', 'src-b']);
  writeJson(join(root, 'rights', 'rights-verdicts.json'), [
    { sourceId: 'src-a', entitlementStatus: 'ELIGIBLE_LOCAL_PERSONAL_USE', entitlementBasis: 'personal-use terms recorded', retentionStatus: 'ELIGIBLE_LOCAL_PERSONAL_USE', retentionBasis: 'retention permitted, review 2027-01-01' },
    { sourceId: 'src-b', entitlementStatus: 'RESTRICTED', entitlementBasis: 'analysis only', retentionStatus: 'RESTRICTED', retentionBasis: 'local retention refused' },
  ]);

  // Both host coverage captures with verified body digests.
  const investmentBody = '{"reportVersion":1,"items":[]}\n';
  const identityBody = '{"reportVersion":1,"items":[]}\n';
  mkdirSync(join(root, 'host-coverage'), { recursive: true });
  writeFileSync(join(root, 'host-coverage', 'capture-investment.body.json'), investmentBody, 'utf8');
  writeFileSync(join(root, 'host-coverage', 'capture-identity.body.json'), identityBody, 'utf8');
  writeJson(join(root, 'host-coverage', 'capture-investment.json'), {
    route: '/api/investment/coverage/investment?asOf=2026-09-15', status: 200, bodySha256: sha256Text(investmentBody), bodyFile: 'capture-investment.body.json', capturedAt: '2026-11-18T00:00:00.000Z',
  });
  writeJson(join(root, 'host-coverage', 'capture-identity.json'), {
    route: '/api/investment/coverage?asOf=2026-09-15', status: 200, bodySha256: sha256Text(identityBody), bodyFile: 'capture-identity.body.json', capturedAt: '2026-11-18T00:00:00.000Z',
  });

  // The two Principal decisions.
  writeJson(join(root, 'decisions', 'F1-repository-publication.json'), {
    id: 'F1', decision: 'REPOSITORY_REMAINS_PUBLIC_WITH_RISK_ACCEPTED', decidedBy: 'Principal', decidedAt: '2026-11-20', basis: 'recorded in the decision record',
  });
  writeJson(join(root, 'decisions', 'F2-statement-source.json'), {
    id: 'F2', decision: 'ISSUER_OFFICIAL_FILINGS', decidedBy: 'Principal', decidedAt: '2026-11-20', basis: 'roadmap: third-party permission only if the selected source requires one',
  });

  // The acceptance decision.
  writeJson(join(root, 'acceptance', 'w05-acceptance.json'), {
    accepted: true, acceptedBy: 'Principal', acceptedAt: '2026-11-21', statement: 'W05 ACCEPTED — conditions evidenced',
  });
  return root;
}

describe('W05 — evidence-completeness checker: conditions never self-satisfy', () => {
  test('an empty evidence root leaves the blocking conditions blocked and the run exits 1', () => {
    const root = mkdtempSync(join(tmpdir(), 'w05-completeness-empty-'));
    const repo = fakeRepoRoot();
    const report = buildReviewPackage(root, repo, '2026-11-18T00:00:00.000Z');
    const byId = new Map(report.conditions.map((condition) => [condition.id, condition]));
    assert.equal(byId.get('revision-1-reconciliation')!.status, 'BLOCKED');
    assert.equal(byId.get('source-rights-verdicts')!.status, 'BLOCKED');
    assert.equal(byId.get('host-coverage-captures')!.status, 'BLOCKED');
    assert.equal(byId.get('principal-decisions')!.status, 'PENDING');
    assert.equal(byId.get('w05-acceptance')!.status, 'PENDING');
    // The two standing states are honestly satisfied even with no operator artifacts at all.
    assert.equal(byId.get('required-metric-set')!.status, 'SATISFIED');
    assert.match(byId.get('required-metric-set')!.detail, /PROVISIONAL_PENDING_W10 is preserved/);
    assert.equal(byId.get('theta-f')!.status, 'SATISFIED');
    assert.match(byId.get('theta-f')!.detail, /honestly unset/);
    assert.equal(report.allSatisfied, false);
    assert.match(report.note, /never accepts/);
    assert.match(renderReviewPackage(report), /NOT ALL CONDITIONS SATISFIED/);
  });

  test('a complete evidence root satisfies every condition and exits 0', () => {
    const root = fullEvidenceRoot();
    const repo = fakeRepoRoot();
    const report = buildReviewPackage(root, repo, '2026-11-18T00:00:00.000Z');
    for (const condition of report.conditions) {
      assert.equal(condition.status, 'SATISFIED', `${condition.id}: ${condition.detail}`);
    }
    assert.equal(report.allSatisfied, true);
  });

  test('a run over anything but the 64 revision-1 rows can never satisfy the reconciliation condition', () => {
    const root = fullEvidenceRoot();
    const repo = fakeRepoRoot();
    const otherCensus = {
      driver: 'run-census-reconciliation',
      result: { summary: { rowsSupplied: 68, agreement: { BOTH_IDENTIFIED: 0, BOTH_UNIDENTIFIED: 0, CENSUS_ONLY: 0, RUN_ONLY: 0 } } },
    };
    writeJson(join(root, 'reconciliation', 'reconciliation-result.json'), otherCensus);
    // Refresh the digest manifest so the row-count guard is what refuses, not the digest check.
    writeJson(join(root, 'reconciliation', 'output-digests.json'), {
      algorithm: 'SHA-256',
      files: {
        'reconciliation-result.json': {
          sha256: sha256Text(`${JSON.stringify(otherCensus, null, 2)}\n`),
          bytes: 1,
        },
      },
    });
    const report = buildReviewPackage(root, repo, '2026-11-18T00:00:00.000Z');
    const condition = report.conditions.find((entry) => entry.id === 'revision-1-reconciliation')!;
    assert.equal(condition.status, 'PENDING');
    assert.match(condition.detail, /not the 64 revision-1 holdings/);
    assert.match(condition.detail, /that other census only/);
    assert.equal(report.allSatisfied, false);
  });

  test('digest mismatches, unreviewed disagreements and unknown verdicts are all surfaced', () => {
    const root = fullEvidenceRoot();
    const repo = fakeRepoRoot();

    writeFileSync(join(root, 'reconciliation', 'reconciliation-summary.txt'), 'tampered\n', 'utf8');
    let report = buildReviewPackage(root, repo, '2026-11-18T00:00:00.000Z');
    let condition = report.conditions.find((entry) => entry.id === 'revision-1-reconciliation')!;
    assert.equal(condition.status, 'UNRESOLVED');
    assert.match(condition.detail, /digest mismatch/);

    const good = fullEvidenceRoot();
    writeJson(join(good, 'reconciliation', 'disagreements-reviewed.json'), { reviewed: [{ holdingId: 'H-2' }] });
    report = buildReviewPackage(good, repo, '2026-11-18T00:00:00.000Z');
    condition = report.conditions.find((entry) => entry.id === 'revision-1-reconciliation')!;
    assert.equal(condition.status, 'PENDING');
    assert.match(condition.detail, /H-4/);

    const unknown = fullEvidenceRoot();
    writeJson(join(unknown, 'rights', 'rights-verdicts.json'), [
      { sourceId: 'src-a', entitlementStatus: 'UNKNOWN', entitlementBasis: '', retentionStatus: 'ELIGIBLE_LOCAL_PERSONAL_USE', retentionBasis: 'ok' },
      { sourceId: 'src-b', entitlementStatus: 'ELIGIBLE_LOCAL_PERSONAL_USE', entitlementBasis: 'ok', retentionStatus: 'ELIGIBLE_LOCAL_PERSONAL_USE', retentionBasis: 'ok' },
    ]);
    report = buildReviewPackage(unknown, repo, '2026-11-18T00:00:00.000Z');
    condition = report.conditions.find((entry) => entry.id === 'source-rights-verdicts')!;
    assert.equal(condition.status, 'PENDING');
    assert.match(condition.detail, /src-a/);
    assert.match(condition.detail, /fail closed stands/);
  });

  test('the run wrapper reports statuses and exit codes, and a missing root exits 2', () => {
    const root = fullEvidenceRoot();
    const repo = fakeRepoRoot();
    const out = join(root, 'review-package.json');
    const originalOut = process.stdout.write;
    const originalErr = process.stderr.write;
    let captured = '';
    process.stdout.write = ((chunk: string | Uint8Array): boolean => {
      captured += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
      return true;
    }) as typeof process.stdout.write;
    process.stderr.write = ((chunk: string | Uint8Array): boolean => true) as typeof process.stderr.write;
    let code = -1;
    try {
      code = run([root, '--out', out, '--repo-root', repo]);
    } finally {
      process.stdout.write = originalOut;
      process.stderr.write = originalErr;
    }
    assert.equal(code, 0);
    assert.match(captured, /ALL CONDITIONS SATISFIED/);
    const published = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(published.allSatisfied, true);
    assert.equal(published.conditions.length, 8);

    process.stderr.write = ((chunk: string | Uint8Array): boolean => true) as typeof process.stderr.write;
    try {
      assert.equal(run(['/nonexistent/evidence-root']), 2);
    } finally {
      process.stderr.write = originalErr;
    }
  });
});
