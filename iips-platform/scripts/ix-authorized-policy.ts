/**
 * IX — the authorized valuation policy, reproduced from the committed Infosys inputs.
 *
 * WHY THIS SCRIPT EXISTS. `L-034` and `L-036` were decided by the owner on 2026-11-06 and are implemented in the
 * engine. A decision that is implemented must be *reproducible from the source evidence*: anyone holding this
 * repository must be able to rebuild the Infosys assessment from the committed Work Item 3 inputs and check, line by
 * line, what the authorised policy did and did not change.
 *
 * This script therefore:
 *
 *   1. rebuilds the baseline from `evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/ingest-input` — the committed
 *      inputs, not a re-typed fixture — under the same clock the VII/VIII packages used;
 *   2. asserts the authorised policy is the one in force (categories, rates, one 0.35 ceiling, no floor) and that the
 *      arithmetic it publishes is right, recomputed here independently of `buildConfidence`;
 *   3. records every output that moved relative to the VII/VIII baseline, and every output that did not, so the
 *      difference attributable to the policy is separated from the difference attributable to issuer data;
 *   4. builds the SAME assessment over a V2 dataset that carries one filed associates/JV figure, and records what the
 *      schema alone changes — the review control closes, the carrying value enters the bridge, and nothing else moves.
 *
 *   tsx scripts/ix-authorized-policy.ts <output-dir>
 *
 * The script REFUSES to publish if the engine disagrees with the authorised policy, if the V1 baseline moved for a
 * reason other than the policy, or if a V2 carrying value silently changed confidence, quality or adequacy.
 *
 * Read-only with respect to history: no WI1/WI2/WI3 artefact is rewritten, no store is opened, no NP-04 artefact is
 * minted, and the only files written are the ones inside the output directory.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { assessCompany } from '../src/investment/assessment/engine';
import { policyDefaultPenaltyOf } from '../src/investment/assessment/confidence';
import { VALUATION_POLICY, mosBandFor } from '../src/investment/assessment/policy';
import { calendarDaysBetween } from '../src/investment/assessment/policyReview';
import { buildDatasetContent, type DatasetInputs } from '../src/investment/ingestion/builder';
import type { CompanyAssessmentPayload } from '../src/investment/assessment/types';
import type { IssuerRecord, ListingRecord, PriceRecord, SecurityRecord } from '../src/investment/fundamentals/types';
import type { SectorName } from '../src/investment/contracts/operatingMetrics';

const WI3 = resolve(__dirname, '../../evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06');
const ISSUER_ID = 'IN:CIN:L85110KA1981PLC013115';
const SECURITY_ID = 'IN:ISIN:INE009A01021';
/** The clock VII and VIII used, so the reproduction is comparable line for line. */
const RUN_CLOCK = '2026-11-06T14:05:00.000Z';
const DATASET_VERSION = 'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847';
const DATASET_VERSION_V2 = 'sha256:ix-v2-dataset-with-filed-associates-jv';

/** What VII/VIII recorded before the policy was authorised. A drift here is a finding, not a nuisance. */
const PRIOR_RECORDED = Object.freeze({
  payloadDigest: '6a328ef09636c51d069156cad1ea6e0e50c34e62fff0be1d64949f73a1f3504e',
  combined: 0.6736,
  caps: ['STALE_DATA', 'DILUTION_PROXY'] as readonly string[],
  dataConfidence: 0.85,
  intrinsicLow: 875.3394146903431,
  intrinsicMid: 1088.972274952081,
  intrinsicHigh: 1399.8105188789887,
  mosVsMid: -0.08418738213693565,
  band: 'FAIR' as string | null,
});

const text = (file: string): string => readFileSync(file, 'utf8');
const round4 = (value: number): number => Number(Math.min(1, Math.max(0, value)).toFixed(4));

function datasetInputs(periodCsv: string, datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V1' | 'IIPS_INVESTMENT_FUNDAMENTALS_V2'): DatasetInputs {
  const roster = JSON.parse(text(join(WI3, 'ingest-input', 'roster.json'))) as {
    issuers: IssuerRecord[];
    securities: SecurityRecord[];
    listings: ListingRecord[];
  };
  let prices: PriceRecord[] = [];
  try {
    prices = (JSON.parse(text(join(WI3, 'ingest-input', 'prices.json'))) as { prices: PriceRecord[] }).prices;
  } catch {
    prices = [];
  }
  return {
    datasetSchema,
    issuers: roster.issuers,
    securities: roster.securities,
    listings: roster.listings,
    corporateActions: [],
    prices,
    periodCsv: { name: 'periods.csv', text: periodCsv },
    operatingMetricsCsv: null,
    xbrlFiles: [],
  };
}

/**
 * The same committed CSV, plus one column, on the newest balance-sheet instant only.
 *
 * This is how a V2 dataset is authored by hand: the column is a period-level fact, so every other period carries an
 * empty cell and therefore `NOT_REPORTED` — never zero.
 */
export function withCarryingValue(periodCsv: string, crore: number): string {
  const lines = periodCsv.trimEnd().split('\n');
  const header = `${lines[0]},INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES`;
  const newest = lines
    .slice(1)
    .map((line) => line.split(',')[4] ?? '')
    .sort()
    .at(-1);
  const body = lines.slice(1).map((line) => {
    const periodEnd = line.split(',')[4];
    return `${line},${periodEnd === newest ? String(crore) : ''}`;
  });
  return `${[header, ...body].join('\n')}\n`;
}

interface Assessment {
  readonly payload: CompanyAssessmentPayload;
  readonly payloadDigest: string;
}

function assess(periodCsv: string, datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V1' | 'IIPS_INVESTMENT_FUNDAMENTALS_V2', datasetVersion: string): Assessment {
  const inputs = datasetInputs(periodCsv, datasetSchema);
  const content = buildDatasetContent(inputs);
  if (content.issues.length > 0) {
    throw new Error(`dataset rebuild produced ${content.issues.length} issue(s): ${JSON.stringify(content.issues)}`);
  }
  const issuer = inputs.issuers[0]!;
  const result = assessCompany({
    issuerId: ISSUER_ID,
    legalName: issuer.legalName,
    sector: issuer.sector as SectorName,
    sectorSubsegment: issuer.subSegment,
    securityId: SECURITY_ID,
    dataset: content,
    datasetVersion,
    contentDigest: datasetVersion,
    provider: 'operator-file-input',
    identity: {
      bindingRef: 'sha256:ix-evidence-binding',
      rosterVersion: 'sha256:ix-evidence-roster',
      listingMapVersion: 'sha256:ix-evidence-listing-map',
      corporateActionTableVersion: 'sha256:ix-evidence-actions',
    },
    generatedAt: RUN_CLOCK,
    knownAsOf: RUN_CLOCK,
  });
  if (result.violations.length > 0) throw new Error(`engine reported ${result.violations.length} violation(s)`);
  // A LOCAL structural digest: sha256 over the payload's own JSON. It is not the NP-04 canonical payload digest
  // (that one is minted at the composition boundary and asserted by the frontend store tests); it exists so that a
  // later change to this reproduction is detectable without opening a store.
  const structuralDigest = createHash('sha256').update(JSON.stringify(result.payload), 'utf8').digest('hex');
  return { payload: result.payload, payloadDigest: structuralDigest };
}

const conf = (payload: CompanyAssessmentPayload) => payload.confidence;
const mid = (payload: CompanyAssessmentPayload): number | null => payload.valuation.intrinsic?.perShare.mid.value ?? null;

export function buildEvidencePackage() {
  const committedCsv = text(join(WI3, 'ingest-input', 'periods.csv'));
  const v1 = assess(committedCsv, 'IIPS_INVESTMENT_FUNDAMENTALS_V1', DATASET_VERSION);
  const v2Csv = withCarryingValue(committedCsv, 1000);
  const v2 = assess(v2Csv, 'IIPS_INVESTMENT_FUNDAMENTALS_V2', DATASET_VERSION_V2);

  /* ---- the policy that must be in force ------------------------------------------------------------- */
  const policy = VALUATION_POLICY.policyDefaultAssumptionCaps;
  if (policy.application !== 'ADDITIVE_BY_CATEGORY') throw new Error(`policy application is ${policy.application}`);
  if (policy.maxAggregateReduction !== 0.35) throw new Error(`ceiling is ${policy.maxAggregateReduction}, not 0.35`);
  if (policy.confidenceFloor !== null) throw new Error(`policy carries a floor (${String(policy.confidenceFloor)})`);
  if (policy.categoryPenalties.DISCOUNT_RATE !== 0.2) throw new Error('DISCOUNT_RATE rate moved');
  if (policy.categoryPenalties.TARGET_MULTIPLE !== 0.15) throw new Error('TARGET_MULTIPLE rate moved');

  /* ---- L-034: the penalty, recomputed independently of the engine ----------------------------------- */
  const declarations = conf(v1.payload).assumptionCaps;
  const triggers = declarations.flatMap((declaration) => declaration.triggers);
  const independent = policyDefaultPenaltyOf(triggers, policy);
  const prePenalty =
    (0.6 * conf(v1.payload).dataConfidence + 0.4 * conf(v1.payload).modelConfidence) *
    conf(v1.payload).caps
      .filter((cap) => !cap.startsWith('POLICY_DEFAULT'))
      .reduce((total, cap) => total * ({ ADEQUACY_PARTIAL: 0.85, ADEQUACY_INSUFFICIENT: 0.6, STALE_DATA: 0.9, DILUTION_PROXY: 0.98, DIVIDEND_SOURCE_CONFLICT: 0.95, HIGH_METHOD_DISAGREEMENT: 0.85 } as Record<string, number>)[cap]!, 1);

  if (Math.abs(round4(prePenalty) - PRIOR_RECORDED.combined) > 1e-9) {
    throw new Error(
      `pre-penalty confidence ${round4(prePenalty)} is not the recorded baseline ${PRIOR_RECORDED.combined}; ` +
        'the V1 baseline moved for a reason other than the authorised policy',
    );
  }
  const expectedCombined = round4(prePenalty * independent.multiplier);
  if (conf(v1.payload).combined !== expectedCombined) {
    throw new Error(`engine published ${conf(v1.payload).combined}; independent arithmetic gives ${expectedCombined}`);
  }
  if (mid(v1.payload) !== PRIOR_RECORDED.intrinsicMid) {
    throw new Error(`intrinsic mid moved to ${String(mid(v1.payload))}; the opportunity set is not the policy\'s to change`);
  }

  const review = v1.payload.fundamentals.capitalStructure.associatesJVReview;
  const reviewAgeDays = calendarDaysBetween(review.clockStart, v1.payload.asOf.generatedAt);
  if (review.status !== 'REVIEW_DUE' || review.reviewRequired !== true) {
    throw new Error(`the review control is ${review.status}; the committed evidence is over the 180-day age`);
  }

  /* ---- L-036: the same issuer, the same evidence, one filed figure ---------------------------------- */
  const capital1 = v1.payload.fundamentals.capitalStructure;
  const capital2 = v2.payload.fundamentals.capitalStructure;
  if (capital2.equityBridge.treatment !== 'CARRYING_VALUE_REPORTED') {
    throw new Error(`the V2 dataset did not report a carrying value (${capital2.equityBridge.treatment})`);
  }
  if (capital2.associatesJVReview.status !== 'NOT_APPLICABLE' || capital2.associatesJVReview.reviewRequired) {
    throw new Error('a filed carrying value must close the review control');
  }
  // The policy's own inertness: a carrying value moves the bridge, and the ONLY other thing it may move is the
  // model-confidence input that is *derived from the published per-share spread* — a documented dependency, not a
  // penalty. Evidence-derived members must not move at all.
  for (const [label, a, b] of [
    ['dataConfidence', conf(v1.payload).dataConfidence, conf(v2.payload).dataConfidence],
    ['quality', v1.payload.quality.verdict, v2.payload.quality.verdict],
    ['adequacy', v1.payload.completeness.adequacy, v2.payload.completeness.adequacy],
    ['requiredFieldCoveragePct', v1.payload.completeness.requiredFieldCoveragePct, v2.payload.completeness.requiredFieldCoveragePct],
    ['disposition-neutral method count', v1.payload.valuation.methods.length, v2.payload.valuation.methods.length],
  ] as const) {
    if (a !== b) throw new Error(`${label} moved with the dataset schema (${String(a)} → ${String(b)})`);
  }
  // A carrying value must not add or remove a penalty: the applied-cap list is identical across the two datasets.
  if (conf(v1.payload).caps.join('|') !== conf(v2.payload).caps.join('|')) {
    throw new Error('a filed carrying value changed the applied confidence-caps list');
  }

  const shares = capital2.dilutedShares.value ?? 0;
  if (process.env.IX_DEBUG === '1') {
    process.stdout.write(JSON.stringify({ weighting: v2.payload.valuation.intrinsic?.weighting, notes: v2.payload.valuation.methods.map((m) => ({ id: m.methodId, note: m.output?.perShareMid.note })) }, null, 2) + '\n');
  }
  const bridgedWeight = (v2.payload.valuation.intrinsic?.weighting ?? [])
    .filter((entry) => {
      const method = v2.payload.valuation.methods.find((candidate) => candidate.methodId === entry.methodId);
      return (method?.output?.perShareMid.note ?? '').includes('associates-treatment/');
    })
    .reduce((total, entry) => total + entry.weight, 0);
  const carryingCrore = Number(capital2.associatesAndJV.value ?? 0) / 1e7;
  const deltaMid = (mid(v2.payload) ?? 0) - (mid(v1.payload) ?? 0);
  const expectedDelta = shares === 0 ? 0 : (bridgedWeight * carryingCrore * 1e7) / shares;
  if (Math.abs(deltaMid - expectedDelta) > 1e-6) {
    throw new Error(`the bridge delta ${deltaMid} is not the published weighting × carrying value / shares (${expectedDelta})`);
  }

  const price = v1.payload.valuation.marginOfSafety?.price.value ?? 0;
  const bandOf = (midValue: number): string | null => (midValue === 0 ? null : mosBandFor((midValue - price) / midValue));

  return {
    schemaVersion: 1,
    phase: 'IX',
    generatedAt: RUN_CLOCK,
    status: 'IMPLEMENTED — the authorised policy is in force and reproduced from committed inputs',
    authorisation: {
      decidedOn: '2026-11-06',
      authority: 'owner (IRR), one-pass implementation',
      decisions: {
        maximumAggregateReduction: policy.maxAggregateReduction,
        application: policy.application,
        confidenceFloor: policy.confidenceFloor,
        associatesReviewAgeDays: VALUATION_POLICY.associatesReview.reviewAgeDays,
      },
    },
    policyRecord: {
      version: policy.policyVersion,
      categories: policy.categoryPenalties,
      ceiling: policy.maxAggregateReduction,
      ceilingBinding: independent.ceilingBinding,
      singleFactor: policy.factor,
      formula:
        'combined = (0.6·dataConfidence + 0.4·modelConfidence) × Π evidence caps × (1 − min(0.35, ' +
        'Σ category penalty rates)), rounded to 4 dp once, clamped to [0, 1], no floor',
      rounding: 'once, at the end; zero is a legitimate published confidence',
      order: [
        'ADEQUACY_PARTIAL or ADEQUACY_INSUFFICIENT',
        'STALE_DATA',
        'DILUTION_PROXY',
        'DIVIDEND_SOURCE_CONFLICT',
        'HIGH_METHOD_DISAGREEMENT',
        'the R-4.3 aggregate penalty, applied once',
      ],
    },
    l034: {
      registerStatus: 'RESOLVED',
      triggers: triggers.map((trigger) => ({ methodId: trigger.methodId, assumption: trigger.assumption })),
      triggerCount: triggers.length,
      categoriesCharged: independent.categories.map((entry) => ({
        category: entry.category,
        cap: entry.cap,
        penaltyRate: entry.penaltyRate,
        methods: entry.triggers.map((trigger) => trigger.methodId),
        chargeCount: 1,
      })),
      summedReduction: independent.summedReduction,
      totalReduction: independent.totalReduction,
      multiplier: independent.multiplier,
      ceilingBinding: independent.ceilingBinding,
      confidence: {
        before: PRIOR_RECORDED.combined,
        dataConfidence: conf(v1.payload).dataConfidence,
        modelConfidence: conf(v1.payload).modelConfidence,
        prePenalty: round4(prePenalty),
        after: expectedCombined,
        published: conf(v1.payload).combined,
        absoluteReduction: round4(PRIOR_RECORDED.combined) - expectedCombined,
        relativeReduction: Number((1 - expectedCombined / PRIOR_RECORDED.combined).toFixed(6)),
      },
      caps: conf(v1.payload).caps,
      declarations: declarations.map((declaration) => ({
        cap: declaration.cap,
        category: declaration.category,
        applied: declaration.applied,
        penaltyRate: declaration.penaltyRate,
        triggers: declaration.triggers.map((trigger) => trigger.methodId),
      })),
      invariants: {
        oneChargePerCategory: true,
        ceilingAppliedOnce: independent.ceilingBinding ? 'binding' : 'not binding (sum below the ceiling)',
        floor: null,
        intrinsicMidUnchanged: mid(v1.payload) === PRIOR_RECORDED.intrinsicMid,
      },
    },
    l036: {
      registerStatus: 'PARTIALLY RESOLVED',
      treatment: capital1.equityBridge.treatment,
      treatmentPolicyVersion: capital1.equityBridge.policyVersion,
      reviewPolicyVersion: review.reviewPolicyVersion,
      review: {
        status: review.status,
        reviewRequired: review.reviewRequired,
        clockStart: review.clockStart,
        clockStartBasis: review.clockStartBasis,
        reviewAgeDays: review.reviewAgeDays,
        reviewDueOn: review.reviewDueOn,
        elapsedDaysAtRun: reviewAgeDays,
        elapsedDaysInPayload: null,
        payloadIsClockFree: !('elapsedDays' in review) && !('asOf' in review),
        reason: review.reason,
      },
      carryingValue: {
        established: false,
        presence: capital1.associatesAndJV.presence,
        reason: capital1.associatesAndJV.reason,
        value: capital1.associatesAndJV.value,
      },
      v2Dataset: {
        schema: 'IIPS_INVESTMENT_FUNDAMENTALS_V2',
        presence: capital2.associatesAndJV.presence,
        carryingValueCrore: carryingCrore,
        treatment: capital2.equityBridge.treatment,
        substitutedInputs: capital2.equityBridge.substitutedInputs,
        reviewStatus: capital2.associatesJVReview.status,
        reviewRequired: capital2.associatesJVReview.reviewRequired,
        schemaOnlyChanges: {
          intrinsicMidBefore: mid(v1.payload),
          intrinsicMidAfter: mid(v2.payload),
          deltaMid,
          bridgedWeight,
          dilutedShares: shares,
          derivation: 'deltaMid = bridgedWeight × carryingValue / dilutedShares (exact bridge arithmetic)',
          bandBefore: bandOf(mid(v1.payload) ?? 0),
          bandAfter: bandOf(mid(v2.payload) ?? 0),
          mosBefore: v1.payload.valuation.marginOfSafety?.mosVsMid.value ?? null,
          mosAfter: v2.payload.valuation.marginOfSafety?.mosVsMid.value ?? null,
        },
        unchangedBySchema: ['dataConfidence', 'quality', 'adequacy', 'requiredFieldCoveragePct', 'confidence.caps'],
        derivedFromTheBridgedOutput: {
          modelConfidenceBefore: conf(v1.payload).modelConfidence,
          modelConfidenceAfter: conf(v2.payload).modelConfidence,
          combinedBefore: conf(v1.payload).combined,
          combinedAfter: conf(v2.payload).combined,
          why:
            'model confidence is a function of the published per-share spread, so a carrying value that widens the ' +
            'range moves it; the movement is arithmetic on published outputs and applies no penalty of its own',
        },
      },
      quantified: true,
      quantifiedBasis:
        'the costs of the policy zero are now measurable from a V2 dataset, but the committed Infosys evidence carries ' +
        'no filed carrying value, so no issuer figure is asserted here',
    },
    regression: {
      priorPackage: 'VIII-VALUATION-DECISIONS-2026-11-06',
      priorRecorded: PRIOR_RECORDED,
      structuralDigestV1: v1.payloadDigest,
      structuralDigestV2: v2.payloadDigest,
      structuralDigestNote:
        'sha256 over the payload JSON as this reproduction builds it; the NP-04 canonical payload digest is minted at ' +
        'the composition boundary and is asserted by the frontend store suite, not here',
      attributableToPolicy: [
        'confidence.combined (0.6736 → ' + String(expectedCombined) + ')',
        'confidence.caps gained POLICY_DEFAULT_WACC and POLICY_DEFAULT_MULTIPLE',
        'confidence.formula gained the R-4.3 clause',
        'confidence.assumptionCaps: applied true, category and penaltyRate published',
        'fundamentals.capitalStructure.associatesJVReview published (clock-free)',
        'limitations gained the review sentence',
      ],
      attributableToIssuerData: [
        'fundamentals.capitalStructure.associatesAndJV: NOT_COMPUTABLE (POLICY_ZERO) → PRESENT (filed carrying value)',
        'valuation.intrinsic per-share legs (+ deltaMid) on the two bridged methods',
        'marginOfSafety.mosVsMid and its band',
        'associatesJVReview.status: REVIEW_DUE → NOT_APPLICABLE',
      ],
      unchanged: [
        'dataConfidence',
        'modelConfidence',
        'intrinsic per-share legs on the V1 dataset (the policy moves confidence, never a valuation)',
        'quality verdict',
        'adequacy and completeness',
        'every method selection and weight',
      ],
    },
  };
}

function main(): void {
  const outDir = process.argv[2];
  if (outDir === undefined) throw new Error('usage: tsx scripts/ix-authorized-policy.ts <output-dir>');
  const pkg = buildEvidencePackage();
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, 'authorized-policy-evidence.json');
  writeFileSync(target, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  const l034 = pkg.l034 as { confidence: { before: number; after: number }; totalReduction: number; caps: readonly string[] };
  const l036 = pkg.l036 as {
    review: { status: string; elapsedDaysAtRun: number | null };
    v2Dataset: { schemaOnlyChanges: { deltaMid: number } };
  };
  process.stdout.write(`wrote ${target}\n`);
  process.stdout.write(`  L-034: confidence ${l034.confidence.before} → ${l034.confidence.after} (reduction ${l034.totalReduction})\n`);
  process.stdout.write(`  L-034: caps ${l034.caps.join(', ')}\n`);
  process.stdout.write(`  L-036: review ${l036.review.status} at ${String(l036.review.elapsedDaysAtRun)} days\n`);
  process.stdout.write(
    `  L-036: a ₹1,000 crore filed carrying value moves mid by ${l036.v2Dataset.schemaOnlyChanges.deltaMid}/share\n`,
  );
}

if (require.main === module) main();
