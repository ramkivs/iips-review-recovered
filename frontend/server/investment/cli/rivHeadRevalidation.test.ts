/**
 * RIV — the representative real issuer, re-validated at head, pinned as tests.
 *
 * `evidence/real-issuer/HEAD-REVALIDATION-INFOSYS-2026-11-12/` records a real Indian listed non-financial issuer
 * (Infosys Limited) taken through the whole IID path again at the current authoritative head, from the primary
 * evidence committed under `WI3-BORROWINGS-NIL-2026-11-06/ingest-input`. These tests are the part that must fail
 * on regression:
 *
 *   1. **the generator is reproducible.** `scripts/riv-head-revalidation.ts` re-derives the issuer's assessment
 *      from the committed filing cells and refuses to publish if any recomputed figure disagrees with the
 *      published one, if a changed payload path carries no attribution, or if the two dataset classifiers stop
 *      disagreeing. Run against the committed head payload it must reproduce the four committed artifacts byte
 *      for byte — so a silent change in the engine, the policy or the mapping shows up here rather than ageing
 *      in a directory nobody re-reads.
 *   2. **defect A stays corrected.** The reader-visible L-002/L-003 notices state counts read from
 *      `XBRL_TAG_MAP` and `DERIVATIONS`, on both the CLI side and the presentation side. One side moving alone
 *      is the defect; both are pinned against the code.
 *   3. **`L-041` stays OPEN and visible.** The assessment path and the investment-coverage path classify the
 *      same committed real-issuer manifests two different ways. That is a recorded defect awaiting a contract
 *      decision, not an accepted behaviour: the test asserts the disagreement, so a one-sided fix fails loudly
 *      and forces `L-041` to be updated deliberately.
 *
 * Read-only: nothing here writes inside the repository, opens a store, or touches the network.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { main } from '../../../../iips-platform/scripts/riv-head-revalidation';
import { XBRL_TAG_MAP } from '../../../../iips-platform/src/investment/ingestion/xbrl';
import { DERIVATIONS } from '../../../../iips-platform/src/investment/fundamentals/derive';
import { classifyDataset } from '../../../../iips-platform/src/investment/fundamentals/datasetClass';
import { buildInvestmentCoverageReport } from '../../../../iips-platform/src/investment/coverage/investmentCoverage';
import type { DatasetManifest } from '../../../../iips-platform/src/investment/fundamentals/manifest';
import { limitationsForDatasetClass } from './generate-investment-artifacts';

const BUNDLE = resolve(process.cwd(), '../evidence/real-issuer/HEAD-REVALIDATION-INFOSYS-2026-11-12');
const WI3 = resolve(process.cwd(), '../evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06');
const REL1 = resolve(process.cwd(), '../evidence/real-issuer/REL-1-INFOSYS-2026-11-06');
const WI2 = resolve(process.cwd(), '../evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06');

const text = (file: string): string => readFileSync(file, 'utf8');
const scratch = mkdtempSync(join(tmpdir(), 'iips-riv-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe('RIV — the generator reproduces the committed evidence', () => {
  it('rebuilds all four artifacts byte-identically from the committed head payload', () => {
    const outDir = join(scratch, 'rebuilt');
    expect(
      main([
        outDir,
        '--head-payload',
        join(BUNDLE, 'artifact', 'assessment-payload-head.json'),
        '--head-summary',
        join(BUNDLE, 'runs', 'cli-head.json'),
      ]),
    ).toBe(0);

    const emitted = readdirSync(join(outDir, 'verification'))
      .map((name) => `verification/${name}`)
      .concat(readdirSync(join(outDir, 'artifact')).map((name) => `artifact/${name}`))
      .sort();
    expect(emitted).toEqual([
      'artifact/payload-diff-vs-wi3.json',
      'verification/dataset-class-divergence.json',
      'verification/independent-recomputation.json',
      'verification/mapping-census.json',
    ]);
    for (const relative of emitted) {
      // Byte equality, not deep equality: the committed artifact is the evidence, and a key reorder is a change.
      expect(text(join(outDir, relative)), `committed ${relative} is not reproducible at this head`).toBe(text(join(BUNDLE, relative)));
    }
  });

  it('reproduces WI-3 dataset identity and every published figure the recomputation reaches', () => {
    const recomputation = JSON.parse(text(join(BUNDLE, 'verification', 'independent-recomputation.json'))) as any;
    expect(recomputation.reproducibility.datasetVersionRecomputedAtHead).toBe(
      'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847',
    );
    expect(recomputation.reproducibility.reproduced).toBe(true);
    expect(recomputation.reproducibility.ingestionIssues).toBe(0);
    expect(recomputation.reproducibility.persistedArtifactEqualsFreshAnalysis).toBe(true);
    // The authorised R-4.3 penalty may not re-value the company: the intrinsic range is WI-3's, to the last bit.
    expect(recomputation.recomputation.valuation.published.intrinsic).toEqual({
      low: 875.3394146903431,
      mid: 1088.972274952081,
      high: 1399.8105188789887,
    });
    expect(recomputation.recomputation.marginOfSafety.published.band).toBe('FAIR');
    expect(recomputation.recomputation.marginOfSafety.published.refusal).toBeNull();
    // Confidence moved, and moved only by the authorised penalty: 0.6736 × 0.65.
    expect(recomputation.recomputation.confidence.published.combined).toBe(0.4378);
    expect(recomputation.recomputation.confidence.recomputed.aggregateReduction).toBe(0.35);
    // A blank filing cell is an absence with a reason. It is never a zero and never PRESENT.
    const states = recomputation.recomputation.derivationCoverage.flatMap((entry: any) =>
      entry.perPeriod.map((period: any) => period.state),
    );
    expect(states).toContain('INPUTS_MISSING');
    expect(states).toContain('REPORTED_AND_RECONCILED_AGAINST_DERIVATION');
  });

  it('attributes every payload path that moved since WI-3, and leaves none unexplained', () => {
    const diff = JSON.parse(text(join(BUNDLE, 'artifact', 'payload-diff-vs-wi3.json'))) as any;
    expect(diff.unattributedPaths).toEqual([]);
    expect(diff.changedPaths).toBe(diff.changes.length);
    expect(diff.changedPaths).toBeGreaterThan(0);
    for (const change of diff.changes) {
      expect(typeof change.cause).toBe('string');
      expect(change.cause.length).toBeGreaterThan(0);
      expect(typeof change.evidence).toBe('string');
    }
    // Nothing the issuer reported may have moved: the causes are a clock, an identity rule and two authorised
    // policies. No cause is "unexplained". (Defect C is recorded open, not corrected, so the EV basis label is
    // unchanged from WI-3 and contributes no diff path — see findings/C-EV-BASIS-BRIDGE.md.)
    const causes = new Set(diff.changes.map((change: any) => change.cause as string));
    expect([...causes].sort()).toEqual([
      'ASSOCIATES_JV_DISCLOSURE (L-036)',
      'IX_AUTHORIZED_POLICY (L-034)',
      'IX_AUTHORIZED_POLICY (L-034) + ASSOCIATES_JV_DISCLOSURE (L-036)',
      'RUN_CLOCK',
      'RUN_CLOCK + IDENTITY_LISTING_NARROWING',
    ]);
  });

  it('refuses to publish when a recomputed figure is perturbed', () => {
    // The negative control: the generator's refusals are the point of it. Perturb a figure the recomputation
    // derives independently of the engine (net debt), and PROVE the refusal comes from that recomputation rather
    // than from the digest premise — so re-hash the perturbed bytes into the summary the generator checks against.
    // A generator that only verified digests would pass this; one that re-derives the arithmetic refuses and names
    // the moved figure.
    const payload = JSON.parse(text(join(BUNDLE, 'artifact', 'assessment-payload-head.json'))) as any;
    payload.fundamentals.capitalStructure.netDebt.value += 1;
    const perturbedPayload = join(scratch, 'perturbed-payload.json');
    writeFileSync(perturbedPayload, JSON.stringify(payload), 'utf8');
    const summary = JSON.parse(text(join(BUNDLE, 'runs', 'cli-head.json'))) as any;
    summary.artifact.payloadDigest = createHash('sha256').update(readFileSync(perturbedPayload)).digest('hex');
    const perturbedSummary = join(scratch, 'perturbed-summary.json');
    writeFileSync(perturbedSummary, JSON.stringify(summary), 'utf8');
    expect(() =>
      main([join(scratch, 'refused'), '--head-payload', perturbedPayload, '--head-summary', perturbedSummary]),
    ).toThrow(/REFUSED to publish[\s\S]*netDebt/);
  });
});

describe('RIV — defect A: the reader-visible counts are read from the code', () => {
  it('states the tag-map size and the derivation count the product actually has', () => {
    expect(Object.keys(XBRL_TAG_MAP).length).toBe(22);
    expect(DERIVATIONS.length).toBe(8);
    for (const datasetClass of [null, 'SYNTHETIC_REFERENCE', 'OPERATOR_SUPPLIED', 'UNKNOWN'] as const) {
      const lines = limitationsForDatasetClass(datasetClass);
      expect(lines.find((line) => line.startsWith('L-002 '))).toBe(
        `L-002 ${Object.keys(XBRL_TAG_MAP).length} XBRL tags mapped; unmapped tags remain visible gaps`,
      );
      expect(lines.find((line) => line.startsWith('L-003 '))).toBe(`L-003 closed derivation set = ${DERIVATIONS.length} items`);
    }
  });

  it('pins the presentation-side notice to the same count', () => {
    // `src/api/investment.ts` is presentation-only and imports nothing from `iips-platform`, so the number there
    // is a literal. It is read back and compared with the code, which is the only way to keep the two in step
    // without breaking that boundary.
    const source = text(join(process.cwd(), 'src', 'api', 'investment.ts'));
    const line = source.split('\n').find((entry) => entry.includes("id: 'L-002'"));
    expect(line, 'the L-002 disclosure line was not found').toBeDefined();
    const stated = Number(/(\d+) XBRL tags are mapped/.exec(line!)?.[1]);
    expect(stated).toBe(Object.keys(XBRL_TAG_MAP).length);
    const derivationLine = source.split('\n').find((entry) => entry.includes("id: 'L-003'"));
    expect(derivationLine).toBeDefined();
    expect(derivationLine).toContain(`closed at ${DERIVATIONS.length} items`);
  });

  it('records that the coverage path publishes the same count the notice now states', () => {
    const manifest = JSON.parse(text(join(WI3, 'dataset', 'manifest.json'))) as DatasetManifest;
    const report = buildInvestmentCoverageReport({
      asOf: '2026-11-12',
      generatedAt: '2026-11-12T00:00:00.000Z',
      manifest,
      issuers: [],
      securities: [],
      periods: [],
      prices: [],
      operatingMetrics: [],
      issues: [],
      identitySourcesAvailable: false,
      identitySourceDetail: null,
      issuerIdentityState: null,
    });
    expect(report.financialCoverage.xbrlMappedTags).toBe(Object.keys(XBRL_TAG_MAP).length);
    expect(report.financialCoverage.derivationItems).toBe(DERIVATIONS.length);
    expect(report.financialCoverage.note).toContain(`${Object.keys(XBRL_TAG_MAP).length} XBRL tags are mapped`);
  });
});

describe('RIV — L-041: the two dataset classifiers disagree on the committed real-issuer manifests', () => {
  const bundles = [
    ['REL-1-INFOSYS-2026-11-06', REL1],
    ['WI2-PRICE-OBSERVATION-2026-11-06', WI2],
    ['WI3-BORROWINGS-NIL-2026-11-06', WI3],
  ] as const;

  it.each(bundles)('%s: the assessment path fails closed, the coverage path asserts operator-supplied', (_name, dir) => {
    const manifest = JSON.parse(text(join(dir, 'dataset', 'manifest.json'))) as DatasetManifest;
    // These manifests were written before the rights field existed, so the rights evidence is genuinely absent.
    expect(manifest.sourceRights).toBeUndefined();
    // The assessment path: the rights-evidence rule, fail-closed. This half is correct and must stay correct.
    expect(classifyDataset(manifest)).toBe('UNKNOWN');
    // The coverage path: a substring test on provider and licence — the rule `datasetClass.ts` repudiates in
    // writing under "WHAT WAS WRONG". This half is defect L-041 and is OPEN.
    const report = buildInvestmentCoverageReport({
      asOf: '2026-11-12',
      generatedAt: '2026-11-12T00:00:00.000Z',
      manifest,
      issuers: [],
      securities: [],
      periods: [],
      prices: [],
      operatingMetrics: [],
      issues: [],
      identitySourcesAvailable: false,
      identitySourceDetail: null,
      issuerIdentityState: null,
    });
    expect(report.dataset.datasetClass).toBe('OPERATOR_SUPPLIED');
  });

  it('is recorded in the bundle as OPEN with the reason it was not corrected here', () => {
    const divergence = JSON.parse(text(join(BUNDLE, 'verification', 'dataset-class-divergence.json'))) as any;
    expect(divergence.limitation).toBe('L-041');
    expect(divergence.status).toContain('OPEN');
    expect(divergence.rows.length).toBe(3);
    expect(divergence.rows.every((row: any) => row.agree === false)).toBe(true);
    expect(divergence.whyNotCorrectedHere).toContain('contract decision');
  });
});
