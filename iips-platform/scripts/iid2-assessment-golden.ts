/**
 * IID-2 evidence emitter.
 *
 * Produces the golden assessments and the determinism evidence from the *engine itself* — the same call the
 * application makes — so nothing in `evidence/iid/IID-2-COMPANY-ASSESSMENT-2026-11-06/` is a re-implementation.
 *
 *   tsx scripts/iid2-assessment-golden.ts <output-dir>
 *
 * Writes: golden-<issuer>.json, golden-digests.json, golden-<issuer>.html, readiness.txt.
 * Read-only: no dataset is fetched, no store is touched, no NP-04 artifact is read or written.
 *
 * The three reference issuers are synthetic fixtures. Nothing here describes a real company.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { assessCompany } from '../src/investment/assessment/engine';
import type { AssessCompanyInput } from '../src/investment/assessment/engine';
import type { CompanyAssessmentPayload } from '../src/investment/assessment/types';
import { renderAssessmentHtml } from '../src/investment/assessment/view';
import {
  bankAssessmentInput,
  techAssessmentInput,
  thinAssessmentInput,
} from '../tests/investment/assessmentFixtures';

const [outputDir = 'evidence'] = process.argv.slice(2);
const root = resolve(import.meta.dirname, '..');

const sha = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const issuers: readonly { name: string; input: AssessCompanyInput }[] = [
  { name: 'tech', input: techAssessmentInput() },
  { name: 'bank', input: bankAssessmentInput() },
  { name: 'thin', input: thinAssessmentInput() },
];

function reorder(input: AssessCompanyInput, mode: 'REVERSED' | 'ROTATED'): AssessCompanyInput {
  const arrange = <T,>(items: readonly T[]): readonly T[] => {
    if (items.length < 2) return items;
    if (mode === 'REVERSED') return [...items].reverse();
    const shift = items.length >> 1;
    return [...items.slice(shift), ...items.slice(0, shift)];
  };
  return {
    ...input,
    dataset: {
      ...input.dataset,
      periods: arrange(input.dataset.periods),
      prices: arrange(input.dataset.prices),
      corporateActions: arrange(input.dataset.corporateActions),
      operatingMetrics: arrange(input.dataset.operatingMetrics),
    },
    dividendDeclarations:
      input.dividendDeclarations === undefined ? undefined : arrange(input.dividendDeclarations),
  };
}

mkdirSync(outputDir, { recursive: true });

const digests: {
  readonly issuer: string;
  readonly businessKey: string;
  readonly inProcess: readonly { readonly ordering: string; readonly payloadSha256: string; readonly bytes: number }[];
  readonly restarts: readonly { readonly run: number; readonly payloadSha256: string; readonly inputDigest: string; readonly bytes: number }[];
  readonly identicalAcrossOrderings: boolean;
  readonly identicalAcrossRestarts: boolean;
}[] = [];

const readiness: string[] = [];

for (const { name, input } of issuers) {
  const base = assessCompany(input);
  const payload = base.payload;

  writeFileSync(join(outputDir, `golden-${name}.json`), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeFileSync(
    join(outputDir, `golden-${name}.html`),
    renderAssessmentHtml(payload, base.narrative),
    'utf8',
  );

  const orderings = ['AS_GIVEN', 'REVERSED', 'ROTATED'] as const;
  const inProcess = orderings.map((ordering) => {
    const result = ordering === 'AS_GIVEN' ? base : assessCompany(reorder(input, ordering as 'REVERSED' | 'ROTATED'));
    const serialised = JSON.stringify(result.payload);
    return {
      ordering,
      payloadSha256: createHash('sha256').update(serialised).digest('hex'),
      bytes: serialised.length,
    };
  });

  const restarts = [1, 2, 3].map((run) => {
    const line = execFileSync(
      process.execPath,
      ['--import', 'tsx', 'tests/investment/helpers/assessmentRestart.ts', name],
      { cwd: root, encoding: 'utf8' },
    ).trim();
    const [, inputDigest, payloadSha256, bytes] = line.split(' ');
    return { run, payloadSha256: payloadSha256!, inputDigest: inputDigest!, bytes: Number(bytes) };
  });

  const identicalAcrossOrderings = new Set(inProcess.map((entry) => entry.payloadSha256)).size === 1;
  const identicalAcrossRestarts = new Set(restarts.map((entry) => entry.payloadSha256)).size === 1;

  digests.push({
    issuer: payload.subject.issuerId,
    businessKey: `${payload.artifact.subjectScope}|${payload.artifact.modelVersion}|${payload.artifact.policyVersion}`,
    inProcess,
    restarts,
    identicalAcrossOrderings,
    identicalAcrossRestarts,
  });

  const intrinsic = payload.valuation.intrinsic;
  readiness.push(
    [
      name.toUpperCase(),
      payload.subject.issuerId,
      `sector=${payload.subject.sector}`,
      `adequacy=${payload.completeness.adequacy}`,
      `coverage=${payload.completeness.requiredFieldCoveragePct}`,
      `intrinsic=${intrinsic === null ? 'WITHHELD' : `${intrinsic.perShare.low.value?.toFixed(2)}-${intrinsic.perShare.mid.value?.toFixed(2)}-${intrinsic.perShare.high.value?.toFixed(2)}`}`,
      `mos=${payload.valuation.marginOfSafety?.refusal ?? payload.valuation.marginOfSafety?.band ?? 'none'}`,
      `moat=${payload.moat.classification}`,
      `dividends=${payload.dividends.verdict}`,
      `confidence=${payload.confidence.combined}`,
      `violations=${base.violations.length}`,
    ].join(' '),
  );
}

writeFileSync(join(outputDir, 'golden-digests.json'), `${JSON.stringify(digests, null, 2)}\n`, 'utf8');
writeFileSync(
  join(outputDir, 'readiness.txt'),
  [
    'IID-2 company assessment — synthetic reference issuers (NOT real-company coverage)',
    '',
    ...readiness,
    '',
    `payload digests stable across 3 orderings: ${digests.every((entry) => entry.identicalAcrossOrderings)}`,
    `payload digests stable across 3 process restarts: ${digests.every((entry) => entry.identicalAcrossRestarts)}`,
    '',
  ].join('\n'),
  'utf8',
);

process.stdout.write(`${readiness.join('\n')}\n`);
