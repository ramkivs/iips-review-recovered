/**
 * W05 — Financial dataset source-rights classification across coverage surfaces.
 *
 * Regression guard for two reproducible W05 defects in IRR's coverage read models:
 *
 *   1. `buildInvestmentCoverageReport` (`coverage/investmentCoverage.ts`) and
 *      `buildFinancialCoverageDisclosure` (`identity/coverage.ts`) previously derived `datasetClass`
 *      by testing `/synthetic|test-fixture|fixture/i` against `manifest.provider` + `manifest.licence`
 *      instead of reading `DatasetManifest.sourceRights` via `classifyDataset()`.
 *      As a result:
 *        - datasets with omitted or `UNKNOWN` `sourceRights` (including all committed historical
 *          bundles under `evidence/real-issuer/.../dataset/`) were silently upgraded to
 *          `OPERATOR_SUPPLIED` on the strength of their `provider` string;
 *        - datasets with `SYNTHETIC` `sourceRights` whose `provider`/`licence` lacked the words
 *          "synthetic" or "fixture" were misclassified as `OPERATOR_SUPPLIED`;
 *        - malformed `sourceRights` declarations (`OPERATOR_ASSERTED` with blank `basis`, or an
 *          unrecognized state such as `APPROVED_LOCAL_INGESTION`) bypassed `assertSourceRights()`.
 *
 *   2. `buildInvestmentCoverageReport` counted issuer quarterly periods by comparing against
 *      `'QUARTERLY'` instead of the governed `PeriodType` `'QUARTER'` (`contracts/period.ts`),
 *      reporting `quarterlyPeriods: 0` and `NO_FINANCIALS` for quarterly-only issuers.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { buildInvestmentCoverageReport } from '../../src/investment/coverage/investmentCoverage';
import { handleInvestmentCoverageRequest } from '../../src/investment/coverage/investmentCoverageEndpoint';
import { buildFinancialCoverageDisclosure } from '../../src/investment/identity/coverage';
import {
  financialCoverageFromLocalDataset,
  investmentCoverageFromLocalDataset,
} from '../../src/investment/identity/runtime';
import { readDataset } from '../../src/investment/ingestion/writer';
import type { DatasetManifest } from '../../src/investment/fundamentals/manifest';
import { referenceContent, writeTempDataset } from './fixtures';

const AS_OF = '2026-11-12';
const COMMITTED_INFOSYS_DATASET = resolve(
  __dirname,
  '../../../evidence/real-issuer/REL-1-INFOSYS-2026-11-06/dataset',
);

describe('W05 — coverage surfaces classify datasets solely from DatasetManifest.sourceRights', () => {
  it('classifies the committed REL-1-INFOSYS dataset (no sourceRights field) as UNKNOWN, never OPERATOR_SUPPLIED', () => {
    const read = readDataset(COMMITTED_INFOSYS_DATASET);
    assert.equal(read.manifest.provider, 'operator-file-input');
    assert.equal(read.manifest.sourceRights, undefined);

    const inv = buildInvestmentCoverageReport({
      asOf: AS_OF,
      generatedAt: `${AS_OF}T00:00:00.000Z`,
      manifest: read.manifest,
      issuers: read.content.issuers,
      securities: read.content.securities,
      periods: read.content.periods,
      prices: read.content.prices,
      operatingMetrics: read.content.operatingMetrics,
      issues: read.content.issues,
      identitySourcesAvailable: false,
    });

    assert.equal(inv.dataset.datasetClass, 'UNKNOWN');
    assert.equal(inv.dataset.sourceRights?.state, 'UNKNOWN');
    assert.equal(inv.financialCoverage.datasetClass, 'UNKNOWN');
    assert.ok(inv.notes.some((note) => /UNKNOWN/.test(note)));
    for (const note of inv.notes) {
      assert.doesNotMatch(note, /approved/i);
    }

    const fin = buildFinancialCoverageDisclosure({ manifest: read.manifest });
    assert.equal(fin.datasetClass, 'UNKNOWN');
  });

  it('never counts a SYNTHETIC dataset as OPERATOR_SUPPLIED even when provider/licence look like real exchange labels', () => {
    const read = readDataset(COMMITTED_INFOSYS_DATASET);
    const syntheticManifest: DatasetManifest = {
      ...read.manifest,
      provider: 'nse-filing-primary',
      licence: 'exchange-public',
      sourceRights: { state: 'SYNTHETIC', basis: '', note: 'reference mechanics only' },
    };

    const inv = buildInvestmentCoverageReport({
      asOf: AS_OF,
      generatedAt: `${AS_OF}T00:00:00.000Z`,
      manifest: syntheticManifest,
      issuers: read.content.issuers,
      securities: read.content.securities,
      periods: read.content.periods,
      prices: read.content.prices,
      operatingMetrics: read.content.operatingMetrics,
      issues: read.content.issues,
      identitySourcesAvailable: true,
    });

    assert.equal(inv.dataset.datasetClass, 'SYNTHETIC_FIXTURE');
    assert.equal(inv.dataset.sourceRights?.state, 'SYNTHETIC');
    assert.equal(inv.financialCoverage.datasetClass, 'SYNTHETIC_FIXTURE');
    assert.ok(inv.notes.some((note) => /SYNTHETIC_REFERENCE/.test(note)));
  });

  it('classifies OPERATOR_ASSERTED with non-blank basis as OPERATOR_SUPPLIED and discloses that it is an operator attestation, not verified permission', () => {
    const read = readDataset(COMMITTED_INFOSYS_DATASET);
    const attestedManifest: DatasetManifest = {
      ...read.manifest,
      provider: 'synthetic-looking-provider-ignored',
      licence: 'fixture-looking-licence-ignored',
      sourceRights: {
        state: 'OPERATOR_ASSERTED',
        basis: 'operator-supplied annual report transcription',
        note: 'operator attestation only',
      },
    };

    const inv = buildInvestmentCoverageReport({
      asOf: AS_OF,
      generatedAt: `${AS_OF}T00:00:00.000Z`,
      manifest: attestedManifest,
      issuers: read.content.issuers,
      securities: read.content.securities,
      periods: read.content.periods,
      prices: read.content.prices,
      operatingMetrics: read.content.operatingMetrics,
      issues: read.content.issues,
      identitySourcesAvailable: true,
    });

    assert.equal(inv.dataset.datasetClass, 'OPERATOR_SUPPLIED');
    assert.equal(inv.dataset.sourceRights?.state, 'OPERATOR_ASSERTED');
    assert.equal(inv.dataset.sourceRights?.basis, 'operator-supplied annual report transcription');
    assert.equal(inv.financialCoverage.datasetClass, 'OPERATOR_SUPPLIED');
    assert.ok(
      inv.notes.some(
        (note) => /operator has attested/i.test(note) && /not an independent verification/i.test(note),
      ),
    );
    for (const note of inv.notes) {
      assert.doesNotMatch(note, /approved/i);
    }
  });

  it('fails closed on blank-basis OPERATOR_ASSERTED or invented APPROVED_LOCAL_INGESTION states across coverage endpoints', async () => {
    const temp = writeTempDataset(referenceContent());
    const dataRoot = mkdtempSync(join(tmpdir(), 'w05-cov-root-'));
    try {
      const targetDatasetDir = join(dataRoot, 'investment', 'dataset');
      mkdirSync(join(dataRoot, 'investment'), { recursive: true });
      cpSync(temp.dir, targetDatasetDir, { recursive: true });

      // Corrupt manifest.json with blank-basis OPERATOR_ASSERTED (digest scope does not cover manifest.json itself)
      const manifestPath = join(targetDatasetDir, 'manifest.json');
      const rawManifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
      rawManifest.sourceRights = { state: 'OPERATOR_ASSERTED', basis: '   ', note: '' };
      writeFileSync(manifestPath, `${JSON.stringify(rawManifest, null, 2)}\n`, 'utf8');

      // 1. Direct coverage builders throw rather than downgrading or upgrading
      assert.throws(() => investmentCoverageFromLocalDataset(AS_OF, dataRoot), /basis/i);

      // 2. HTTP investment-coverage endpoint translates the failure into 503 INVESTMENT_DATASET_UNREADABLE
      const httpRes = await handleInvestmentCoverageRequest(
        { method: 'GET', url: `/api/investment/coverage/investment?asOf=${AS_OF}` },
        {
          readInvestmentCoverage: (asOf) => investmentCoverageFromLocalDataset(asOf, dataRoot),
          today: () => AS_OF,
        },
      );
      assert.notEqual(httpRes, null);
      assert.equal(httpRes?.status, 503);
      const body = JSON.parse(httpRes!.body) as { error: string; issues: { code: string }[] };
      assert.equal(body.error, 'investment-coverage-unavailable');
      assert.equal(body.issues[0]?.code, 'INVESTMENT_DATASET_UNREADABLE');

      // 3. Identity-coverage financial disclosure stays fail-safe (NONE) so corrupt fundamentals do not claim coverage
      const finDisclosure = financialCoverageFromLocalDataset(dataRoot);
      assert.equal(finDisclosure.datasetClass, 'NONE');

      // 4. Forged historical state APPROVED_LOCAL_INGESTION is likewise rejected
      rawManifest.sourceRights = { state: 'APPROVED_LOCAL_INGESTION', basis: 'forged', note: '' };
      writeFileSync(manifestPath, `${JSON.stringify(rawManifest, null, 2)}\n`, 'utf8');
      assert.throws(() => investmentCoverageFromLocalDataset(AS_OF, dataRoot), /source rights state must be one of/i);
    } finally {
      temp.cleanup();
      rmSync(dataRoot, { recursive: true, force: true });
    }
  });
});
