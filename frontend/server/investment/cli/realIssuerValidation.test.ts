/**
 * IIPS v3.0 Work Item 1 — real-issuer regression test.
 *
 * The reference dataset shipped with the product is synthetic (L-004), and no real issuer had been assessed
 * through IID-3 before Work Item 1 (L-009). This test pins the two things that changed as a result:
 *
 *   1. Operator-supplied real disclosures reach the assessment engine unchanged. The evidence files under
 *      `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/` are ingested through IID-0's own builder, so the test
 *      fails if the filed figures, the derivation set or the ingestion contract drift.
 *   2. A run over `OPERATOR_SUPPLIED` data does not publish "the reference dataset is synthetic" about
 *      itself. Both limitation lines keep their identifiers; only the sentence that would otherwise be false
 *      about the run in hand is restated. The synthetic wording is asserted unchanged in the same test, so the
 *      restatement cannot quietly become the only wording.
 *
 * Read-only against the evidence directory: the dataset is materialised in a temp dir, and the run is a dry
 * run (no store, no owner context), so nothing is persisted.
 *
 * @vitest-environment node
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { buildDatasetContent, type DatasetInputs } from '../../../../iips-platform/src/investment/ingestion/builder';
import { writeDataset } from '../../../../iips-platform/src/investment/ingestion/writer';
import type { IssuerRecord, ListingRecord, SecurityRecord } from '../../../../iips-platform/src/investment/fundamentals/types';
import { runCli, limitationsForDatasetClass } from './generate-investment-artifacts';

/** Work Item 1 evidence directory. `process.cwd()` is `frontend/` under vitest. */
const EVIDENCE_DIR = resolve(process.cwd(), '../evidence/real-issuer/REL-1-INFOSYS-2026-11-06');
const INGEST_INPUT_DIR = join(EVIDENCE_DIR, 'ingest-input');
const IDENTITY_DIR = join(EVIDENCE_DIR, 'identity');

const ISSUER_ID = 'IN:CIN:L85110KA1981PLC013115';
const GENERATED_AT = '2026-11-06T00:00:00.000Z';

const scratch = mkdtempSync(join(tmpdir(), 'iips-real-issuer-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

function text(file: string): string {
  return readFileSync(file, 'utf8');
}

function realInputs(): DatasetInputs {
  const roster = JSON.parse(text(join(INGEST_INPUT_DIR, 'roster.json'))) as {
    issuers: IssuerRecord[];
    securities: SecurityRecord[];
    listings: ListingRecord[];
  };
  return {
    issuers: roster.issuers,
    securities: roster.securities,
    listings: roster.listings,
    corporateActions: [],
    prices: [],
    periodCsv: { name: 'periods.csv', text: text(join(INGEST_INPUT_DIR, 'periods.csv')) },
    operatingMetricsCsv: null,
    xbrlFiles: [],
  };
}

/** Write the real dataset once; a fresh copy per test would only re-prove the writer. */
function realDatasetDir(): string {
  const dir = join(scratch, 'dataset');
  const content = buildDatasetContent(realInputs());
  const errors = content.issues.filter((issue) => issue.severity === 'ERROR');
  expect(errors).toEqual([]);
  writeDataset({
    dir,
    content,
    provider: 'operator-file-input',
    licence: 'operator-supplied; not redistributable',
    now: GENERATED_AT,
    importRunId: 'wi1-real-issuer-regression',
    // The operator is supplying their own filing extracts. The rights state is their attestation
    // and the basis is those files — not a provider label and not a claim that any third party's
    // terms were checked.
    sourceRights: {
      state: 'OPERATOR_ASSERTED',
      basis: 'operator-supplied issuer disclosure extracts supplied with this regression',
      note: 'operator attestation over the operator’s own disclosure extracts',
    },
  });
  return dir;
}

describe('the real-issuer disclosure set ingests cleanly through IID-0', () => {
  it('produces three annual consolidated periods with no ingestion errors', () => {
    const content = buildDatasetContent(realInputs());
    expect(content.issues.filter((issue) => issue.severity === 'ERROR')).toEqual([]);
    expect(content.periods).toHaveLength(3);
    expect(content.periods.map((period) => period.period.periodEnd)).toEqual([
      '2022-03-31',
      '2023-03-31',
      '2024-03-31',
    ]);
    for (const period of content.periods) {
      expect(period.issuerId).toBe(ISSUER_ID);
      expect(period.sourceScale).toBe('CRORE');
      expect(period.basis).toBe('AS_FILED');
    }
  });

  it('carries the filed figures as printed and the closed derivation set unchanged', () => {
    const content = buildDatasetContent(realInputs());
    const fy24 = content.periods.find((period) => period.period.periodEnd === '2024-03-31')!;
    // ₹1,53,670 crore as filed, scaled to INR by the declared source scale only.
    expect(fy24.values.REVENUE_FROM_OPERATIONS?.value).toBe(153_670 * 10_000_000);
    expect(fy24.values.NET_PROFIT?.value).toBe(26_248 * 10_000_000);
    expect(fy24.values.EPS_BASIC?.value).toBeCloseTo(63.39, 5);
    expect(fy24.values.OPERATING_CASH_FLOW?.value).toBe(25_210 * 10_000_000);
    // Ind AS 116 lease liabilities, the two filed lines summed (₹6,400 crore non-current + ₹1,959 crore current).
    expect(fy24.values.LEASE_LIABILITIES?.value).toBe(8_359 * 10_000_000);
    expect(fy24.derived.EBIT?.value).toBe(364_580_000_000);
    expect(fy24.derived.EBITDA?.value).toBe(411_360_000_000);
    expect(fy24.derived.FREE_CASH_FLOW?.value).toBe(230_090_000_000);
    // Defect D-2, pinned: the issuer presents no borrowings line at all, and the dataset has no way to say
    // "nil by disclosure", so net debt stays underived rather than zero-filled. Update this assertion when the
    // nil-representation decision lands — until then the absence is the honest result.
    expect(fy24.derived.NET_DEBT).toBeUndefined();
  });
});

describe('a real-data run reports itself honestly', () => {
  it('classifies the snapshot as operator-supplied and assesses it without inventing a verdict', async () => {
    const datasetDir = realDatasetDir();
    const { exitCode, summary } = await runCli([
      '--issuer',
      ISSUER_ID,
      '--data-dir',
      datasetDir,
      '--identity-dir',
      IDENTITY_DIR,
      '--generated-at',
      GENERATED_AT,
      '--dry-run',
    ]);
    expect(exitCode).toBe(0);
    expect(summary.status).toBe('OK');
    // The class follows the dataset's DECLARED RIGHTS EVIDENCE. This dataset declares
    // `OPERATOR_ASSERTED` — the operator supplied their own disclosure extracts and said so — so it
    // is `OPERATOR_SUPPLIED`. The class is no longer inferred from the provider label.
    expect(summary.dataset).toMatchObject({ datasetClass: 'OPERATOR_SUPPLIED', dataAsOf: '2024-03-31' });
    expect(summary.identity).toMatchObject({ state: 'RESOLVED', issuerId: ISSUER_ID });

    // The engine's own judgement on this data: adequate inputs, but the statements are stale at the run date.
    expect(summary.assessment?.adequacy).toBe('SUFFICIENT');
    expect(summary.assessment?.qualityVerdict).toBe('MATERIAL_CONCERNS');
    // D-2's visible consequence: the two enterprise-value methods stay withheld because gross debt cannot be
    // summed while two of its four components are nil-by-disclosure rather than reported.
    expect(summary.assessment?.withheldMethodCount).toBe(2);
  });

  it('restates L-004 and L-009 for the data class in hand and leaves the synthetic wording intact', async () => {
    const datasetDir = realDatasetDir();
    const { summary } = await runCli([
      '--issuer',
      ISSUER_ID,
      '--data-dir',
      datasetDir,
      '--identity-dir',
      IDENTITY_DIR,
      '--generated-at',
      GENERATED_AT,
      '--dry-run',
    ]);

    const real = summary.limitations;
    expect(real).toHaveLength(9);
    expect(real.filter((entry) => entry.startsWith('L-004'))).toHaveLength(1);
    expect(real.filter((entry) => entry.startsWith('L-009'))).toHaveLength(1);

    const l004 = real.find((entry) => entry.startsWith('L-004'))!;
    const l009 = real.find((entry) => entry.startsWith('L-009'))!;
    expect(l004).not.toBe('L-004 the reference dataset is synthetic: mechanics only, no company validation');
    expect(l004).toContain('OPERATOR_SUPPLIED');
    expect(l009).toContain('one issuer reached through one path');

    // The synthetic sentences are still what a synthetic run gets, verbatim: the limitation is restated, not closed.
    const synthetic = limitationsForDatasetClass('SYNTHETIC_REFERENCE');
    expect(synthetic).toContain('L-004 the reference dataset is synthetic: mechanics only, no company validation');
    expect(synthetic).toContain('L-009 no real issuer has been assessed through IID-3; M-1 uses synthetic reference data');
    // A run that fails before the snapshot step must not claim a data class it never saw.
    expect(limitationsForDatasetClass(null)).toEqual(synthetic);
    // Every other line is identical across data classes: only the two restated sentences move.
    const differing = real.filter((entry, index) => entry !== synthetic[index]);
    expect(differing.map((entry) => entry.slice(0, 5))).toEqual(['L-004', 'L-009']);
  });
});
