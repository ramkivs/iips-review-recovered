/**
 * IID-4 — the disposition engine: assessment + portfolio context + limits → one defensible verb.
 *
 * WHAT IT CONSUMES. A stored `CompanyAssessmentPayload` (read-only, never recomputed), a portfolio context
 * block produced by the IRR adapter over the existing CSIP analytics, and a resolved limits policy. It
 * performs no valuation, no adequacy assessment and no risk detection of its own; every number it cites
 * comes from those three inputs.
 *
 * WHAT IT WILL NOT DO. It will not emit a verb for `INSUFFICIENT` evidence, will not turn a missing
 * measurement into a zero, will not invent a fifth verb, and will not emit an order, a quantity, a price or
 * a timing anywhere in the payload. When nothing fits, the disposition is withheld with the first failing
 * gate's reason and the list of unmet inputs.
 *
 * DETERMINISM. `generatedAt` is the caller's clock; everything else is a function of the inputs. Two runs
 * with the same inputs, clock and policy produce a byte-identical payload (which is what makes composer-side
 * idempotency meaningful).
 */
import { valueOrNull, isPresent } from '../contracts/observation';
import type { LineItemId } from '../contracts/lineItems';
import { validatePayload } from '../assessment/engine';
import type { CompanyAssessmentPayload } from '../assessment/types';
import type { AnyVerb } from '../contracts/disposition';
import { INTERPRETATION, VERB_DEFINITIONS } from '../contracts/disposition';
import type {
  DispositionAssessmentRef,
  DispositionRationaleEntry,
  Falsifier,
  HoldingDispositionPayload,
  PortfolioContextBlock,
  ResolvedLimits,
  SubjectFacts,
} from './types';
import {
  DISPOSITION_MODEL_VERSION,
  DISPOSITION_POLICY_VERSION,
  DISPOSITION_SCHEMA_VERSION,
} from './types';
import type { AssessmentFacts, PortfolioFacts } from './gates';
import { evaluateGates } from './gates';
import { evaluateCaps, sectorCapFor, withAppliedLimits } from './limits';
import { buildPortfolioImplication, impliedBand } from './portfolioImplication';
import { buildRationale, type CitableEvidence } from './rationale';
import { definitionFor, VERB_HORIZON } from './policy';
import { selectVerb, type PreviousDisposition } from './verbs';
import { subjectPayloadScope } from './subject';

export class DispositionError extends Error {
  constructor(message: string, readonly code:
    | 'SUBJECT_ASSESSMENT_MISMATCH'
    | 'ASSESSMENT_INVALID'
    | 'RATIONALE_CITATION_UNRESOLVED', readonly detail: Readonly<Record<string, unknown>> = {}) {
    super(message);
    this.name = 'DispositionError';
  }
}

export interface DispositionEngineInput {
  readonly subject: SubjectFacts;
  readonly assessment: {
    readonly payload: CompanyAssessmentPayload;
    readonly ref: DispositionAssessmentRef;
  };
  /** Portfolio context for this subject, or `null` when there is none (candidates may have none). */
  readonly portfolio:
    | { readonly block: PortfolioContextBlock; readonly facts: PortfolioFacts }
    | null;
  /** The resolved limits policy, or `null` when it could not be resolved (G-6 fails). */
  readonly limits: ResolvedLimits | null;
  readonly previous?: PreviousDisposition | null;
  /** A hard trigger (new severity ≥4 risk, adequacy downgrade, quality change, restatement, identity change). */
  readonly hardTrigger?: boolean;
  readonly generatedAt: string;
  /** Limitation ids carried on the payload (register ids, not prose). */
  readonly limitations?: readonly string[];
}

const DEFAULT_LIMITATIONS = Object.freeze([
  'L-001',
  'L-002',
  'L-003',
  'L-004',
  'L-005',
  'L-006',
  'L-007',
  'L-008',
  'L-009',
  'L-010',
  'L-011',
  'L-012',
  'L-013',
  'L-014',
  'L-015',
  'L-016',
  'L-017',
  'L-018',
  'L-019',
  'L-020',
  'L-021',
  'L-022',
  'L-023',
  'L-024',
  'L-025',
]);

function toPoints(fraction: number | null): number | null {
  return fraction === null ? null : Math.round(fraction * 100 * 100) / 100;
}

function midPresent(payload: CompanyAssessmentPayload): boolean {
  const mid = payload.valuation.intrinsic?.perShare.mid;
  return mid === undefined ? false : isPresent(mid);
}

/**
 * The payload's annual series is stored NEWEST FIRST. Every trend read below sorts by `periodEnd`
 * ascending first, because comparing `[n-1] < [n-2]` on a newest-first array reads the oldest pair and
 * would report a growing company as declining. That mistake is easy to make and invisible in a fixture
 * where every series is monotone, so the ordering is made explicit here rather than assumed.
 */
function ascendingPeriods(payload: CompanyAssessmentPayload) {
  return [...payload.fundamentals.annual].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
}

function netDebtToEbitda(periods: ReturnType<typeof ascendingPeriods>): Array<number | null> {
  return periods.map((period) => {
    const netDebt = period.derived.NET_DEBT as { value: number | null; presence: string } | undefined;
    const ebitda = period.derived.EBITDA as { value: number | null; presence: string } | undefined;
    if (netDebt?.value == null || ebitda?.value == null || ebitda.value === 0) return null;
    return netDebt.value / ebitda.value;
  });
}

/**
 * Read the payload into the facts a verb decision needs.
 *
 * Everything is read, nothing is inferred: a value that is absent stays `null`, and the trend flags are
 * `false` rather than "assume deteriorating".
 */
function refDisagreements(payload: CompanyAssessmentPayload, ref: DispositionAssessmentRef): string[] {
  const out: string[] = [];
  const compare = (field: string, left: unknown, right: unknown) => {
    if (left !== right) out.push(`${field}: payload=${String(left)} ref=${String(right)}`);
  };
  compare('adequacy', payload.completeness.adequacy, ref.adequacy);
  compare('qualityVerdict', payload.quality.verdict, ref.qualityVerdict);
  compare('moatClassification', payload.moat.classification, ref.moatClassification);
  compare('modelVersion', payload.artifact.modelVersion, ref.modelVersion);
  compare('policyVersion', payload.artifact.policyVersion, ref.policyVersion);
  compare('datasetVersion', payload.data.datasetVersion, ref.datasetVersion);
  compare('knownAsOf', payload.asOf.knownAsOf, ref.knownAsOf);
  return out;
}

export function deriveFacts(payload: CompanyAssessmentPayload): AssessmentFacts {
  const mosBlock = payload.valuation.marginOfSafety;
  const periods = ascendingPeriods(payload);
  const leverage = netDebtToEbitda(periods).filter((value): value is number => value !== null);
  const risingLeverage = leverage.length >= 2 && leverage[leverage.length - 1]! > leverage[leverage.length - 2]!;

  const revenueSeries = periods
    .map((period) => valueOrNull(period.values.REVENUE_FROM_OPERATIONS as never))
    .filter((value): value is number => value !== null);
  const revenueDeclining =
    revenueSeries.length >= 2 && revenueSeries[revenueSeries.length - 1]! < revenueSeries[revenueSeries.length - 2]!;
  const patCagr = valueOrNull(payload.fundamentals.trends.patCagr3y);
  const deteriorating = revenueDeclining || (patCagr !== null && patCagr < 0);

  // 'unresolved' in the risk taxonomy means NEW or ONGOING: RESOLVED and UNVERIFIED do not count.
  const unresolved = payload.risk.factors.filter((factor) => factor.status === 'NEW' || factor.status === 'ONGOING');
  return Object.freeze({
    adequacy: payload.completeness.adequacy,
    // UNIT CONVERSION, stated once: the IID-2 payload stores `mosVsMid` and `roicSpread` as FRACTIONS
    // (0.15 = 15 %). The disposition contract speaks in percentage points everywhere, because every
    // threshold in `disposition-policy` is written in points. Converting at this single boundary is what
    // keeps "15" from meaning 1500 % somewhere downstream.
    mosVsMidPct: toPoints(mosBlock === null || mosBlock === undefined ? null : valueOrNull(mosBlock.mosVsMid)),
    mosBand: mosBlock?.band ?? null,
    intrinsicMidPresent: midPresent(payload),
    qualityVerdict: payload.quality.verdict,
    highSeverityQualityFlags: payload.quality.flags.filter((flag) => flag.severity === 'HIGH').length,
    moatClassification: payload.moat.classification,
    roicSpread: toPoints(valueOrNull(payload.moat.roicWaccSpread.spread)),
    dividendVerdict: payload.dividends.verdict,
    netDebtToEbitdaRising: risingLeverage,
    unresolvedMaxSeverity: unresolved.reduce((max, factor) => Math.max(max, factor.severity), 0),
    unresolvedSeverityAtLeast4: unresolved.filter((factor) => factor.severity >= 4).length,
    newSeverityAtLeast4: payload.risk.factors.filter((factor) => factor.status === 'NEW' && factor.severity >= 4).length,
    deterioratingFundamentals: deteriorating,
    sector: payload.subject.sector ?? null,
    evidenceIds: payload.evidence.map((entry) => entry.evidenceId),
  } satisfies AssessmentFacts);
}

function toCitable(payload: CompanyAssessmentPayload): CitableEvidence[] {
  return payload.evidence.map((entry) => ({
    evidenceId: entry.evidenceId,
    claim: entry.claim,
    supports: entry.supports,
    observationRefs: entry.observationRefs,
    source: entry.source,
  }));
}

/** The discrete disqualifiers this phase knows how to prove. Everything else is NOT a disqualifier. */
function citedEvidenceIds(entries: readonly { readonly evidenceIds: readonly string[] }[]): string[] {
  const out: string[] = [];
  for (const entry of entries) {
    for (const id of entry.evidenceIds) if (!out.includes(id)) out.push(id);
  }
  return out;
}

export function findDisqualifier(facts: AssessmentFacts): { statement: string } | null {
  if (facts.qualityVerdict === 'MATERIAL_CONCERNS' && facts.highSeverityQualityFlags > 0) {
    return {
      statement: `quality.verdict=MATERIAL_CONCERNS with ${facts.highSeverityQualityFlags} HIGH-severity flag(s)`,
    };
  }
  if (facts.unresolvedMaxSeverity >= 5) {
    return { statement: `an unresolved risk factor at severity ${facts.unresolvedMaxSeverity}` };
  }
  if (facts.mosVsMidPct !== null && facts.mosVsMidPct <= -25 && facts.deterioratingFundamentals) {
    return {
      statement: `price at ${facts.mosVsMidPct.toFixed(2)}% premium to assessed value with deteriorating fundamentals`,
    };
  }
  return null;
}

export function buildDispositionPayload(input: DispositionEngineInput): HoldingDispositionPayload {
  const { subject, assessment, limits } = input;
  const payload = assessment.payload;
  if (payload === null || typeof payload !== 'object' || payload.artifact?.kind !== 'CompanyAssessment') {
    throw new DispositionError('the stored artifact is not a CompanyAssessment', 'ASSESSMENT_INVALID');
  }
  // INTEGRITY ON WRITE. The assessment is re-validated here rather than trusted: a disposition is a
  // statement about a specific assessment, and an artifact that violates its own invariants (of which the
  // most dangerous is a PRESENT-with-no-value observation) must not be able to produce one.
  const violations = validatePayload(payload);
  if (violations.length > 0) {
    throw new DispositionError(
      `the assessment payload violates its own invariants (${violations.length})`,
      'ASSESSMENT_INVALID',
      { violations: violations.slice(0, 10) },
    );
  }
  if (payload.subject.issuerId !== subject.issuerId) {
    throw new DispositionError(
      'the assessment belongs to a different issuer than the disposition subject',
      'SUBJECT_ASSESSMENT_MISMATCH',
      { assessmentIssuerId: payload.subject.issuerId, subjectIssuerId: subject.issuerId },
    );
  }

  // The reference must describe THIS payload. Without this check a caller could pair a stale artifact with
  // a fresh reading of the facts and publish a verdict attributed to evidence it never saw.
  const disagreement = refDisagreements(payload, assessment.ref);
  if (disagreement.length > 0) {
    throw new DispositionError(
      `the assessment reference disagrees with the payload it describes: ${disagreement.join(', ')}`,
      'SUBJECT_ASSESSMENT_MISMATCH',
      { disagreement },
    );
  }

  const facts = deriveFacts(payload);
  const portfolioFacts = input.portfolio?.facts ?? null;
  const portfolioBlock = input.portfolio?.block ?? null;
  const disqualifier = findDisqualifier(facts);

  // ---- reduction triggers (A1.3 REDUCE conditions) -----------------------------------------
  const reductionTriggers: string[] = [];
  if (facts.mosVsMidPct !== null && facts.mosVsMidPct <= -10) {
    reductionTriggers.push(`valuation:mosVsMid=${facts.mosVsMidPct.toFixed(2)}% ≤ -10%`);
  }
  if (limits !== null && portfolioFacts?.weightPct !== null && portfolioFacts !== null) {
    if (portfolioFacts.weightPct > limits.singleNameMaxPct) {
      reductionTriggers.push(`limits:single-name weight ${portfolioFacts.weightPct.toFixed(2)}% > cap ${limits.singleNameMaxPct}%`);
    }
    if (portfolioFacts.companyExposurePct !== null && portfolioFacts.companyExposurePct > limits.singleNameMaxPct) {
      reductionTriggers.push(
        `concentration:issuer exposure ${portfolioFacts.companyExposurePct.toFixed(2)}% > cap ${limits.singleNameMaxPct}%`,
      );
    }
    if (portfolioFacts.sectorExposurePct !== null && facts.sector !== null) {
      const sectorCap = sectorCapFor(limits, facts.sector);
      if (portfolioFacts.sectorExposurePct > sectorCap) {
        reductionTriggers.push(`limits:sector ${facts.sector} exposure ${portfolioFacts.sectorExposurePct.toFixed(2)}% > cap ${sectorCap}%`);
      }
    }
  }
  if (facts.dividendVerdict === 'UNCOVERED' && facts.netDebtToEbitdaRising) {
    reductionTriggers.push('dividend:UNCOVERED with net debt / EBITDA rising');
  }
  if ((facts.moatClassification === 'NONE' || facts.moatClassification === 'INSUFFICIENT_EVIDENCE') && facts.roicSpread !== null && facts.roicSpread < 0) {
    reductionTriggers.push(`moat:${facts.moatClassification} with a negative ROIC−WACC spread`);
  }
  if (facts.newSeverityAtLeast4 > 0) {
    reductionTriggers.push(`risk:${facts.newSeverityAtLeast4} new severity ≥ 4 factor(s)`);
  }

  // ---- caps --------------------------------------------------------------------------------
  const caps =
    limits === null
      ? { applied: [], singleNameBreached: false, sectorBreached: false, evaluable: false, unmet: ['limits.policy'] }
      : evaluateCaps({
          limits,
          subjectKind: subject.kind,
          sector: facts.sector,
          currentWeightPct: subject.kind === 'HELD' ? (portfolioFacts?.weightPct ?? null) : 0,
          currentSectorExposurePct: portfolioFacts?.sectorExposurePct ?? null,
          projectedBandHighPct: ((): number | null => {
            // The band is needed before the verb, so the caps are evaluated at the band the evidence would
            // support at most: the depth-scaled high end, or the current weight when there is none.
            const provisional = impliedBand({
              subject,
              facts,
              portfolio: portfolioFacts,
              block: portfolioBlock,
              limits: limits!,
              verb: subject.kind === 'HELD' ? 'ACCUMULATE' : 'INITIATE',
            });
            if (provisional.band !== null) return provisional.band.high;
            return subject.kind === 'HELD' ? (portfolioFacts?.weightPct ?? null) : 0;
          })(),
        });

  const hasLimitsBreachTrigger = reductionTriggers.some(
    (trigger) => trigger.startsWith('limits:') || trigger.startsWith('concentration:'),
  );

  const gates = evaluateGates({
    subject,
    facts,
    portfolio: portfolioFacts,
    limitsResolved: limits !== null,
    hasDisqualifier: disqualifier !== null,
    hasLimitsBreachTrigger,
  });

  const selection = selectVerb({
    subject,
    facts,
    portfolio: portfolioFacts,
    limits: limits ?? ({
      policyVersion: 'unresolved',
      effectiveFrom: '1970-01-01T00:00:00.000Z',
      basis: 'SYSTEM_DEFAULT',
      singleNameMaxPct: 0,
      sectorMaxPct: {},
      defaultSectorMaxPct: 0,
      digest: '',
      notes: [],
      applied: [],
    } as ResolvedLimits),
    caps,
    gates,
    hasDisqualifier: disqualifier !== null,
    disqualifierStatement: disqualifier?.statement ?? null,
    reductionTriggers,
    hardTrigger: input.hardTrigger ?? false,
    previous: input.previous ?? null,
  });

  // A limit breach that produced REDUCE is recorded as a named cap gate (AC-4.4).
  const extraGates = [...selection.extraGates];
  if (selection.verb === 'REDUCE' && hasLimitsBreachTrigger && limits !== null) {
    extraGates.push({
      gateId: 'CAPACITY_SINGLE_NAME',
      outcome: 'FAIL',
      detail: `current exposure already breaches the single-name cap ${limits.singleNameMaxPct}%`,
    });
  }

  const resolvedLimits = limits === null ? null : withAppliedLimits(limits, caps.applied);
  const verb = selection.verb as AnyVerb | null;

  const implication = buildPortfolioImplication({
    subject,
    facts,
    portfolio: portfolioFacts,
    block: portfolioBlock,
    limits:
      resolvedLimits ??
      ({
        policyVersion: 'unresolved',
        effectiveFrom: '1970-01-01T00:00:00.000Z',
        basis: 'SYSTEM_DEFAULT',
        singleNameMaxPct: 0,
        sectorMaxPct: {},
        defaultSectorMaxPct: 0,
        digest: '',
        notes: [],
        applied: [],
      } as ResolvedLimits),
    verb,
  });

  const rationale = buildRationale({
    subject,
    facts,
    portfolio: portfolioFacts,
    portfolioBlock,
    limits:
      resolvedLimits ??
      ({
        policyVersion: 'unresolved',
        effectiveFrom: '1970-01-01T00:00:00.000Z',
        basis: 'SYSTEM_DEFAULT',
        singleNameMaxPct: 0,
        sectorMaxPct: {},
        defaultSectorMaxPct: 0,
        digest: '',
        notes: [],
        applied: [],
      } as ResolvedLimits),
    verb,
    capsApplied: selection.capsApplied,
    decisionPath: selection.decisionPath,
    assessmentEvidence: toCitable(payload),
    datasetClass: assessment.ref.datasetClass,
  });

  // AC-4.6 CLOSURE, enforced rather than assumed. The rationale builder falls back to a coarse id
  // (`assessment:quality`) when the assessment payload happens to carry no matching evidence entry. Rather
  // than trusting both sides to agree, every cited id that the assessment did not already cover gets a
  // synthesised, honestly-labelled entry here — and if any citation STILL fails to resolve, the payload is
  // refused instead of published with a dangling reference.
  const baseEvidence = [...rationale.extraEvidence, ...toCitable(payload)];
  const known = new Set(baseEvidence.map((entry) => entry.evidenceId));
  const synthesised = citedEvidenceIds(rationale.rationale)
    .filter((id) => !known.has(id))
    .map((id) => ({
      evidenceId: id,
      claim: `citation ${id} is carried by the disposition rationale and resolved to a disposition-level reference`,
      supports: 'the rationale entry that cites it',
      observationRefs: [],
      source: { kind: 'DERIVED' as const, ref: 'disposition/rationale-citation' },
    }));

  const evidence = [...baseEvidence, ...synthesised].map((entry) => ({
    evidenceId: entry.evidenceId,
    claim: entry.claim,
    source: entry.source,
  }));

  const resolvedIds = new Set(evidence.map((entry) => entry.evidenceId));
  const dangling = citedEvidenceIds(rationale.rationale).filter((id) => !resolvedIds.has(id));
  if (dangling.length > 0) {
    throw new DispositionError(
      `rationale cites evidence that does not resolve: ${dangling.join(', ')}`,
      'RATIONALE_CITATION_UNRESOLVED',
    );
  }

  const withheld =
    selection.withheld === null
      ? null
      : {
          reasons: selection.withheld.reasons,
          unmetInputs: selection.withheld.unmetInputs,
        };

  return Object.freeze({
    schemaVersion: DISPOSITION_SCHEMA_VERSION,
    artifact: {
      kind: 'HoldingDisposition' as const,
      subjectScope: subjectPayloadScope(subject),
      modelVersion: DISPOSITION_MODEL_VERSION,
      policyVersion: DISPOSITION_POLICY_VERSION,
      generatedAt: input.generatedAt,
    },
    subject,
    companyAssessmentRef: assessment.ref,
    portfolioContext: portfolioBlock,
    disposition: {
      verb,
      confidence: verb === null ? null : round4(assessment.ref.adequacy === 'SUFFICIENT' ? confidenceOf(payload) : confidenceOf(payload) * 0.85),
      horizon: verb === null ? 'MEDIUM_TERM' : VERB_HORIZON[verb],
      adequacy: facts.adequacy,
      withheld,
      gates: [...gates.gates, ...extraGates],
      capsApplied: selection.capsApplied,
      policyVersion: DISPOSITION_POLICY_VERSION,
      definitionApplied: verb === null ? 'none: the disposition is withheld' : definitionFor(verb),
    },
    interpretation: {
      nature: INTERPRETATION.nature,
      notAnInstruction: INTERPRETATION.notAnInstruction,
      noExecutionPath: true as const,
      verbsMean: { ...VERB_DEFINITIONS },
    },
    limits:
      resolvedLimits ??
      ({
        policyVersion: 'unresolved',
        effectiveFrom: '1970-01-01T00:00:00.000Z',
        basis: 'SYSTEM_DEFAULT',
        singleNameMaxPct: 0,
        sectorMaxPct: {},
        defaultSectorMaxPct: 0,
        digest: '',
        notes: ['limits policy could not be resolved'],
        applied: [],
      } as ResolvedLimits),
    rationale: rationale.rationale as readonly DispositionRationaleEntry[],
    falsifiers: rationale.falsifiers as readonly Falsifier[],
    portfolioImplication: implication,
    review: {
      nextReviewOn: null,
      triggers: [
        {
          triggerId: 'TRG-NEXT-DATASET',
          condition: 're-evaluated for every position at the next dataset version',
          armed: true,
        },
        {
          triggerId: 'TRG-MOS-BAND',
          condition: 'MoS crossing ±15% / −10% / −25% by more than the hysteresis margin',
          armed: true,
        },
        {
          triggerId: 'TRG-RISK-SEVERITY',
          condition: 'a new or escalated risk factor at severity ≥ 4',
          armed: true,
        },
      ],
    },
    evidence,
    limitations: Object.freeze([...(input.limitations ?? DEFAULT_LIMITATIONS)]),
    disclosure: { decisionSupportOnly: true as const, noTradeExecution: true as const, nonProduction: true as const },
  });
}

function confidenceOf(payload: CompanyAssessmentPayload): number {
  const combined = payload.confidence?.combined;
  return typeof combined === 'number' && Number.isFinite(combined) ? round4(combined) : 0;
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/** A stable digest of the decision inputs, used for composer-side idempotency provenance. */
export function dispositionInputMembers(input: {
  readonly facts: AssessmentFacts;
  readonly limits: ResolvedLimits | null;
  readonly verb: string | null;
  readonly assessmentReportId: string;
  readonly weightPct: number | null;
}): Record<string, string | number | boolean | null> {
  return {
    adequacy: input.facts.adequacy,
    mosVsMidPct: input.facts.mosVsMidPct,
    qualityVerdict: input.facts.qualityVerdict,
    moatClassification: input.facts.moatClassification,
    dividendVerdict: input.facts.dividendVerdict,
    unresolvedMaxSeverity: input.facts.unresolvedMaxSeverity,
    assessmentReportId: input.assessmentReportId,
    limitsPolicyVersion: input.limits?.policyVersion ?? null,
    limitsDigest: input.limits?.digest ?? null,
    weightPct: input.weightPct,
    verb: input.verb,
  };
}

export type { LineItemId };
