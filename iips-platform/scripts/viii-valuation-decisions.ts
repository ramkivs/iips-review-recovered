/**
 * VIII — valuation-integrity decision package: scenario arithmetic.
 *
 * WHY THIS SCRIPT EXISTS. Two register entries are open and neither can be closed by implementation:
 *
 *   `L-034` — R-4.3 requires a confidence cap for `POLICY_DEFAULT` assumptions and the design of record states no
 *             magnitude. The mechanism exists (`confidence.assumptionCaps`, `factor: null`) and applies nothing.
 *   `L-036` — the payload now discloses that the associates/JV term is a policy zero, but dataset schema v1 has no
 *             carrying-value field, so the amount is unavailable and the understatement is unquantified.
 *
 * A decision needs numbers: what a cap *would* do to the published confidence, and what a rupee of carrying value
 * *would* do to the published per-share value. This script computes those relationships from the committed Infosys
 * Work Item 3 inputs and the current engine, and writes them down. It **changes nothing**: no policy constant is set,
 * no cap is applied, no schema field is added, and no alternative is recommended. Every number that depends on an
 * undecided input is labelled as hypothetical in the output rather than assumed.
 *
 *   tsx scripts/viii-valuation-decisions.ts <output-dir>
 *
 * The script refuses to publish if
 *   - the engine's policy cap factor is no longer null (a decision was taken elsewhere),
 *   - a policy-default cap is applied to the confidence block,
 *   - the reproduced baseline differs from the values recorded in the VII evidence bundle, or
 *   - the associates/JV term is no longer the disclosed policy zero.
 *
 * Read-only: no store, no NP-04 artefact and no dataset on disk is touched.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { assessCompany } from '../src/investment/assessment/engine';
import { VALUATION_POLICY, mosBandFor } from '../src/investment/assessment/policy';
import { buildDatasetContent, type DatasetInputs } from '../src/investment/ingestion/builder';
import type { CompanyAssessmentPayload } from '../src/investment/assessment/types';
import type { IssuerRecord, ListingRecord, PriceRecord, SecurityRecord } from '../src/investment/fundamentals/types';
import type { SectorName } from '../src/investment/contracts/operatingMetrics';

const WI3 = resolve(__dirname, '../../evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06');
const ISSUER_ID = 'IN:CIN:L85110KA1981PLC013115';
const SECURITY_ID = 'IN:ISIN:INE009A01021';
const RUN_CLOCK = '2026-11-06T14:05:00.000Z';
const DATASET_VERSION = 'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847';

/** Marks a per-share observation that passed through the enterprise-to-equity bridge (L-036's disclosure). */
const BRIDGE_MARKER = 'associates-treatment/';

/** The six existing cap factors, matching the published confidence formula (`confidence.ts`). */
const CAP_FACTORS: Readonly<Record<string, number>> = Object.freeze({
  ADEQUACY_PARTIAL: 0.85,
  ADEQUACY_INSUFFICIENT: 0.6,
  STALE_DATA: 0.9,
  DILUTION_PROXY: 0.98,
  DIVIDEND_SOURCE_CONFLICT: 0.95,
  HIGH_METHOD_DISAGREEMENT: 0.85,
});

/** The VII evidence bundle's recorded outputs. A drift here means the baseline moved and this package is stale. */
const VII_RECORDED = Object.freeze({
  payloadDigest: '6a328ef09636c51d069156cad1ea6e0e50c34e62fff0be1d64949f73a1f3504e',
  intrinsicLow: 875.3394146903431,
  intrinsicMid: 1088.972274952081,
  intrinsicHigh: 1399.8105188789887,
  mosVsMid: -0.08418738213693565,
  band: 'FAIR',
  combined: 0.6736,
});

const text = (file: string): string => readFileSync(file, 'utf8');

function datasetInputs(dir: string): DatasetInputs {
  const roster = JSON.parse(text(join(dir, 'ingest-input', 'roster.json'))) as {
    issuers: IssuerRecord[];
    securities: SecurityRecord[];
    listings: ListingRecord[];
  };
  let prices: PriceRecord[] = [];
  try {
    prices = (JSON.parse(text(join(dir, 'ingest-input', 'prices.json'))) as { prices: PriceRecord[] }).prices;
  } catch {
    prices = [];
  }
  return {
    issuers: roster.issuers,
    securities: roster.securities,
    listings: roster.listings,
    corporateActions: [],
    prices,
    periodCsv: { name: 'periods.csv', text: text(join(dir, 'ingest-input', 'periods.csv')) },
    operatingMetricsCsv: null,
    xbrlFiles: [],
  };
}

function baseline(): CompanyAssessmentPayload {
  const inputs = datasetInputs(WI3);
  const content = buildDatasetContent(inputs);
  if (content.issues.length > 0) throw new Error(`dataset rebuild produced ${content.issues.length} issue(s)`);
  const issuer = inputs.issuers[0]!;
  const result = assessCompany({
    issuerId: ISSUER_ID,
    legalName: issuer.legalName,
    sector: issuer.sector as SectorName,
    sectorSubsegment: issuer.subSegment,
    securityId: SECURITY_ID,
    dataset: content,
    datasetVersion: DATASET_VERSION,
    contentDigest: DATASET_VERSION,
    provider: 'operator-file-input',
    identity: {
      bindingRef: 'sha256:viii-scenario-binding',
      rosterVersion: 'sha256:viii-scenario-roster',
      listingMapVersion: 'sha256:viii-scenario-listing-map',
      corporateActionTableVersion: 'sha256:viii-scenario-actions',
    },
    generatedAt: RUN_CLOCK,
    knownAsOf: RUN_CLOCK,
  });
  if (result.violations.length > 0) throw new Error(`engine reported ${result.violations.length} violation(s)`);
  return result.payload;
}

const round4 = (value: number): number => Number(Math.min(1, Math.max(0, value)).toFixed(4));

const bandOf = (mid: number, price: number): string | null =>
  mid === 0 ? null : mosBandFor((mid - price) / mid);

/** Methods whose per-share figure passed through the enterprise-to-equity bridge, identified by L-036's own note. */
function bridgedMethods(payload: CompanyAssessmentPayload) {
  return payload.valuation.methods.filter(
    (method) => method.applicable && method.output !== null && (method.output.perShareMid.note ?? '').includes(BRIDGE_MARKER),
  );
}

/**
 * Re-blend the published method legs with one EV-bridge increment. Pure arithmetic on published numbers: only the
 * bridged methods move, and each moves by `increment / dilutedShares` on every leg.
 */
function withBridgeIncrement(payload: CompanyAssessmentPayload, increment: number, price: number) {
  const shares = payload.fundamentals.capitalStructure.dilutedShares.value ?? 0;
  const weights = payload.valuation.intrinsic?.weighting ?? [];
  const bridged = new Set(bridgedMethods(payload).map((method) => method.methodId));
  const byId = new Map(payload.valuation.methods.map((method) => [method.methodId, method]));
  let low = 0;
  let mid = 0;
  let high = 0;
  for (const weight of weights) {
    const method = byId.get(weight.methodId);
    const delta = bridged.has(weight.methodId) && shares > 0 ? increment / shares : 0;
    low += ((method?.output?.perShareLow.value ?? 0) + delta) * weight.weight;
    mid += ((method?.output?.perShareMid.value ?? 0) + delta) * weight.weight;
    high += ((method?.output?.perShareHigh.value ?? 0) + delta) * weight.weight;
  }
  const mos = mid === 0 ? 0 : (mid - price) / mid;
  return { intrinsicLow: low, intrinsicMid: mid, intrinsicHigh: high, mosVsMid: mos, band: bandOf(mid, price) };
}

export function buildScenarioPackage() {
  const payload = baseline();
  const capital = payload.fundamentals.capitalStructure;
  const shares = capital.dilutedShares.value ?? 0;
  const price = payload.valuation.marginOfSafety?.price.value ?? 0;
  const intrinsic = payload.valuation.intrinsic;
  if (intrinsic === null) throw new Error('the baseline has no intrinsic range; the package cannot be built');

  /* ---- guards: nothing may have moved without a recorded decision ---------------------------------- */
  const policy = VALUATION_POLICY.policyDefaultAssumptionCaps;
  if (policy.factor !== null) {
    throw new Error(`policy now carries a cap factor (${String(policy.factor)}); this package documents the undecided state`);
  }
  if (payload.confidence.assumptionCaps.some((entry) => entry.applied)) {
    throw new Error('a policy-default cap is applied; the implementation changed without an authorised decision');
  }
  if (capital.associatesAndJV.presence !== 'NOT_COMPUTABLE') {
    throw new Error(`associates/JV is now ${capital.associatesAndJV.presence}; the L-036 schema question is moot`);
  }
  if (Math.abs((intrinsic.perShare.mid.value ?? 0) - VII_RECORDED.intrinsicMid) > 1e-9) {
    throw new Error('the reproduced intrinsic mid differs from the VII evidence bundle; re-record the baseline first');
  }
  if (payload.confidence.combined !== VII_RECORDED.combined) {
    throw new Error('the reproduced confidence differs from the VII evidence bundle');
  }

  /* ---- baseline ------------------------------------------------------------------------------------- */
  const netDebt = capital.netDebt.value ?? 0;
  const nci = capital.minorityInterest.value ?? 0;
  const preference = capital.preferenceCapital.value ?? 0;
  const associates = capital.associatesAndJV.value ?? 0;
  /** `equity = EV − netDebt − NCI − preference + associates` ⇒ `EV = equity − bridgeOffset`. */
  const bridgeOffset = -netDebt - nci - preference + associates;
  const bridged = bridgedMethods(payload);
  const enterpriseMethods = bridged.map((method) => {
    const perShareMid = method.output!.perShareMid.value ?? 0;
    const equityValue = perShareMid * shares;
    return {
      methodId: method.methodId,
      weight: intrinsic.weighting.find((entry) => entry.methodId === method.methodId)?.weight ?? null,
      equityValue,
      enterpriseValue: equityValue - bridgeOffset,
      perShareMid,
    };
  });

  const baselineRecord = {
    issuerId: ISSUER_ID,
    inputBundle: 'evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06',
    datasetVersion: DATASET_VERSION,
    runClock: payload.asOf.generatedAt,
    dilutedShares: shares,
    shareCountPeriod: capital.shareCountPeriod,
    netDebt,
    nonControllingInterest: nci,
    preferenceCapital: { presence: capital.preferenceCapital.presence, value: capital.preferenceCapital.value },
    associatesAndJV: {
      presence: capital.associatesAndJV.presence,
      reason: capital.associatesAndJV.reason ?? null,
      value: capital.associatesAndJV.value,
      treatment: capital.equityBridge.treatment,
      policyVersion: capital.equityBridge.policyVersion,
    },
    bridgeOffset,
    bridgeFormula: capital.equityBridge.formula,
    enterpriseMethods,
    intrinsic: {
      low: intrinsic.perShare.low.value,
      mid: intrinsic.perShare.mid.value,
      high: intrinsic.perShare.high.value,
      spreadPct: intrinsic.spreadPct.value,
      weighting: intrinsic.weighting,
    },
    price: { value: price, asOf: payload.valuation.marginOfSafety?.priceAsOf ?? null },
    marginOfSafety: {
      mosVsMid: payload.valuation.marginOfSafety?.mosVsMid.value ?? null,
      mosVsLow: payload.valuation.marginOfSafety?.mosVsLow.value ?? null,
      band: payload.valuation.marginOfSafety?.band ?? null,
      refusal: payload.valuation.marginOfSafety?.refusal ?? null,
    },
    confidence: {
      dataConfidence: payload.confidence.dataConfidence,
      modelConfidence: payload.confidence.modelConfidence,
      combined: payload.confidence.combined,
      caps: payload.confidence.caps,
      assumptionCaps: payload.confidence.assumptionCaps,
    },
    reproducedAgainstVII: {
      payloadDigestRecorded: VII_RECORDED.payloadDigest,
      intrinsicMidMatches: true,
      combinedMatches: true,
      mosMatches: Math.abs((payload.valuation.marginOfSafety?.mosVsMid.value ?? 0) - VII_RECORDED.mosVsMid) < 1e-12,
      bandMatches: payload.valuation.marginOfSafety?.band === VII_RECORDED.band,
    },
  };

  /* ---- L-036: a rupee of carrying value ----------------------------------------------------------------- */
  const bridgedWeight = intrinsic.weighting
    .filter((entry) => bridged.some((method) => method.methodId === entry.methodId))
    .reduce((total, entry) => total + entry.weight, 0);
  const perSharePerRupee = shares === 0 ? 0 : bridgedWeight / shares;
  const baselineMid = intrinsic.perShare.mid.value ?? 0;
  const baselineMos = payload.valuation.marginOfSafety?.mosVsMid.value ?? 0;

  const hypothetical = [0, 100, 500, 1_000, 2_500, 5_000, 10_000].map((crore) => {
    const metrics = withBridgeIncrement(payload, crore * 1e7, price);
    return {
      associatesCarryingValueCrore: crore,
      label: 'HYPOTHETICAL_ARITHMETIC_NOT_AN_ISSUER_VALUE',
      intrinsicMid: metrics.intrinsicMid,
      deltaMidVsBaseline: metrics.intrinsicMid - baselineMid,
      mosVsMid: metrics.mosVsMid,
      mosDeltaPercentagePoints: (metrics.mosVsMid - baselineMos) * 100,
      band: metrics.band,
      inputValidity: 'NO_AUTHORITATIVE_CARRYING_VALUE_EXISTS_IN_COMMITTED_EVIDENCE',
    };
  });

  // The carrying value at which the published band would leave FAIR: solve (mid − price) / mid = −0.15.
  const fairUpperBoundMid = price / 0.85;
  const carryingValueToLeaveFair = perSharePerRupee === 0 ? null : (fairUpperBoundMid - baselineMid) / perSharePerRupee;

  const l036 = {
    treatmentNow: capital.equityBridge.treatment,
    policyVersion: capital.equityBridge.policyVersion,
    substitutedInputs: capital.equityBridge.substitutedInputs,
    schemaGap: {
      datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V1',
      closedLineItemCount: 52,
      associatesItemPresent: false,
      note:
        'the engine hard-codes `components.associatesAndJV = NOT_COMPUTABLE(NOT_REPORTED)`; the closed line-item table ' +
        'has no associates/JV item, so no dataset column can populate the term even if a filing stated it',
    },
    unitSensitivity: {
      perSharePerCrore: perSharePerRupee * 1e7,
      perSharePerThousandCrore: perSharePerRupee * 1e10,
      percentageOfMidPerThousandCrore: ((perSharePerRupee * 1e10) / (baselineMid === 0 ? 1 : baselineMid)) * 100,
      mosPercentagePointsPerThousandCrore: (() => {
        const metrics = withBridgeIncrement(payload, 1e10, price);
        return (metrics.mosVsMid - baselineMos) * 100;
      })(),
      bridgedWeight,
      methodIds: bridged.map((method) => method.methodId),
      derivation: 'deltaMid = weight(bridged methods) × (carryingValue / dilutedShares); exact, not a linearisation',
    },
    bandBoundary: {
      fairUpperBoundMid,
      carryingValueCroreToReachBoundary: carryingValueToLeaveFair === null ? null : carryingValueToLeaveFair / 1e7,
      note:
        'an arithmetic statement about the published band under the committed inputs, not a forecast and not a view on ' +
        'any issuer: the band stays FAIR until the carrying value reaches this amount',
    },
    hypotheticalScenarios: hypothetical,
    quantified: false,
    unquantifiedReason: 'NO_AUTHORITATIVE_ASSOCIATES_JV_CARRYING_VALUE_IN_COMMITTED_SOURCE_EVIDENCE',
  };

  /* ---- L-034: cap alternatives -------------------------------------------------------------------------- */
  const triggers = payload.confidence.assumptionCaps.map((cap) => ({
    cap: cap.cap,
    triggers: cap.triggers,
    triggerCount: cap.triggers.length,
  }));
  const triggerTotal = triggers.reduce((total, entry) => total + entry.triggerCount, 0);
  const capTypesTriggered = triggers.filter((entry) => entry.triggerCount > 0).length;
  // The published `combined` rounds once, after every cap; recovering the pre-round value exactly:
  const preRound =
    (0.6 * payload.confidence.dataConfidence + 0.4 * payload.confidence.modelConfidence) *
    payload.confidence.caps.reduce((total, cap) => total * (CAP_FACTORS[cap] ?? 1), 1);

  const illustrative = [0.98, 0.95, 0.9, 0.85, 0.8].map((factor) => ({
    illustrativeFactor: factor,
    label: 'ILLUSTRATIVE_ARITHMETIC_NOT_A_PROPOSAL',
    once: round4(preRound * factor),
    perCapType: round4(preRound * factor ** capTypesTriggered),
    perTrigger: round4(preRound * factor ** triggerTotal),
  }));

  const l034 = {
    policyVersion: policy.policyVersion,
    factor: policy.factor,
    waccCap: policy.waccCap,
    multipleCap: policy.multipleCap,
    declarationState: payload.confidence.assumptionCaps,
    appliedCaps: payload.confidence.caps,
    triggers,
    triggerTotal,
    capTypesTriggered,
    triggerCondition:
      'a trigger exists when a method with output publishes `wacc` and the assessment-level discount-rate basis is ' +
      "POLICY_DEFAULT, or publishes `multipleBasis === 'POLICY_DEFAULT'`",
    applicationOrder:
      'ADEQUACY_PARTIAL|ADEQUACY_INSUFFICIENT → STALE_DATA → DILUTION_PROXY → DIVIDEND_SOURCE_CONFLICT → ' +
      'HIGH_METHOD_DISAGREEMENT → assumption caps in declaration order (WACC, then MULTIPLE); one rounding at the end, ' +
      'and the result is clamped to [0, 1]',
    publishedValues: {
      dataConfidence: payload.confidence.dataConfidence,
      modelConfidence: payload.confidence.modelConfidence,
      combined: payload.confidence.combined,
      preRoundCombined: preRound,
      existingCapFactors: payload.confidence.caps.map((cap) => ({ cap, factor: CAP_FACTORS[cap] ?? null })),
    },
    alternatives: [
      {
        id: 'A_NO_CAP_UNTIL_AUTHORISED',
        description: 'current state: the caps are declared by name, the factor is null, nothing is applied',
        formula: 'combined = round4(preRound)',
        multiplicity: 0,
        combinedNow: payload.confidence.combined,
      },
      {
        id: 'B_ONE_CAP_WHEN_ANY_TRIGGER',
        description: 'the factor applies once when at least one trigger exists, regardless of how many',
        formula: 'combined = round4(preRound × f)',
        multiplicity: 1,
        combinedNow: null,
      },
      {
        id: 'C_ONE_CAP_PER_CAP_TYPE',
        description: 'the WACC cap and the MULTIPLE cap each apply once, independently',
        formula: 'combined = round4(preRound × f²)',
        multiplicity: capTypesTriggered,
        combinedNow: null,
      },
      {
        id: 'D_ONE_CAP_PER_TRIGGERING_ASSUMPTION',
        description: 'every triggering method/assumption pair applies the factor',
        // `f³` because this assessment has three triggers; the count is published alongside as `multiplicity`.
        formula: 'combined = round4(preRound × f³)',
        multiplicity: triggerTotal,
        combinedNow: null,
      },
    ],
    illustrativeArithmetic: illustrative,
    quantified: false,
    unquantifiedReason: 'CAP_FACTOR_NOT_SET_IN_POLICY',
  };

  return {
    schemaVersion: 1,
    phase: 'VIII',
    generatedAt: RUN_CLOCK,
    status: 'INVESTIGATION_ONLY — no policy value set, no cap applied, no schema field added',
    baseline: baselineRecord,
    l034,
    l036,
    readings: {
      l034: 'OPEN — mechanism prepared, requirement unsatisfied, factor and granularity undecided',
      l036: 'PARTIALLY RESOLVED — disclosure corrected; carrying value unavailable; understatement unquantified',
    },
  };
}

function main(): void {
  const outDir = process.argv[2];
  if (outDir === undefined) throw new Error('usage: tsx scripts/viii-valuation-decisions.ts <output-dir>');
  const pkg = buildScenarioPackage();
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, 'valuation-decision-scenarios.json');
  writeFileSync(target, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  const baseline = pkg.baseline as { confidence: { combined: number }; intrinsic: { mid: number | null } };
  const l034 = pkg.l034 as { alternatives: unknown[]; factor: unknown };
  const l036 = pkg.l036 as { quantified: boolean; unquantifiedReason: string };
  process.stdout.write(`wrote ${target}\n`);
  process.stdout.write(`  baseline confidence ${baseline.confidence.combined} · intrinsic mid ${String(baseline.intrinsic.mid)}\n`);
  process.stdout.write(`  L-034 alternatives documented: ${l034.alternatives.length} · factor ${String(l034.factor)}\n`);
  process.stdout.write(`  L-036 quantified: ${String(l036.quantified)} (${l036.unquantifiedReason})\n`);
}

if (require.main === module) main();
