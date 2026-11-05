/**
 * IID-4 — rationale, counter-arguments and falsifiers (§A1.5, AC-4.6).
 *
 * Every claim here is a template with holes filled from the payload, and every entry cites at least one
 * evidence id and at least one observation reference. That is the difference between an explanation and a
 * sentence a model felt good about: `buildRationale` cannot emit a claim whose numbers are not in the
 * assessment or the portfolio context it was handed, and a test asserts that every citation resolves.
 *
 * COUNTER-ARGUMENTS ARE NOT DECORATION. A disposition that only lists supporting facts is advocacy. Where
 * the payload supplies a disconfirming fact — a quality flag, an unresolved risk, a PARTIAL adequacy, a
 * price that is not yet a discount, a cap that fired — it is emitted with `direction: COUNTERS`, and the
 * falsifiers say what would change the view.
 */
import type { SourceRef } from '../contracts/observation';
import type { AnyVerb } from '../contracts/disposition';
import type {
  DispositionRationaleEntry,
  Falsifier,
  PortfolioContextBlock,
  ResolvedLimits,
  SubjectFacts,
} from './types';
import type { AssessmentFacts, PortfolioFacts } from './gates';
import { MOS_THRESHOLDS } from './policy';

/** The minimum an evidence entry must expose to be citable. */
export interface CitableEvidence {
  readonly evidenceId: string;
  readonly claim: string;
  readonly supports: readonly string[];
  readonly observationRefs: readonly string[];
  readonly source: SourceRef;
}

export interface RationaleInput {
  readonly subject: SubjectFacts;
  readonly facts: AssessmentFacts;
  readonly portfolio: PortfolioFacts | null;
  readonly portfolioBlock: PortfolioContextBlock | null;
  readonly limits: ResolvedLimits;
  readonly verb: AnyVerb | null;
  readonly capsApplied: readonly { readonly gateId: string; readonly from: string; readonly to: string }[];
  readonly decisionPath: readonly string[];
  readonly assessmentEvidence: readonly CitableEvidence[];
  readonly datasetClass: string;
}

export interface RationaleOutput {
  readonly rationale: readonly DispositionRationaleEntry[];
  readonly falsifiers: readonly Falsifier[];
  /** Portfolio and limits evidence, synthesised here so every claim can cite a real id. */
  readonly extraEvidence: readonly CitableEvidence[];
}

const pct = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

/**
 * Format an observation for prose without ever inventing a number. An absent value is named as absent —
 * "unmeasured", not "0.00 %" — because a zero reads as a measurement and would quietly contradict the
 * unmeasured-weight disclosure sitting next to it.
 */
const obsPct = (observation: { readonly value?: number | null; readonly presence: string }): string =>
  observation.presence === 'PRESENT' && observation.value !== null && observation.value !== undefined
    ? `${observation.value.toFixed(2)}%`
    : `unmeasured (${observation.presence})`;

function findEvidence(
  evidence: readonly CitableEvidence[],
  prefixes: readonly string[],
): CitableEvidence | null {
  for (const prefix of prefixes) {
    const match = evidence.find(
      (entry) => entry.supports.some((path) => path.startsWith(prefix)) || entry.evidenceId.startsWith(prefix),
    );
    if (match !== undefined) return match;
  }
  return null;
}

function refsOf(entry: CitableEvidence | null, fallback: readonly string[]): string[] {
  if (entry === null) return [...fallback];
  const refs = entry.observationRefs.length > 0 ? entry.observationRefs : entry.supports;
  return refs.length > 0 ? [...refs] : [...fallback];
}

export function buildRationale(input: RationaleInput): RationaleOutput {
  const { facts, portfolioBlock, limits, verb, subject } = input;
  const rationale: DispositionRationaleEntry[] = [];
  const extraEvidence: CitableEvidence[] = [];

  const portfolioEvidence: CitableEvidence[] = [];
  if (portfolioBlock !== null) {
    const weightEntry: CitableEvidence = {
      evidenceId: `pf:weight:${subject.securityId}`,
      claim: `Value-weighted portfolio weight and sector exposure for ${subject.securityId}`,
      supports: ['portfolioContext.weightPct', 'portfolioContext.sectorExposurePct', 'portfolioContext.companyExposurePct'],
      observationRefs: ['portfolioContext.weightPct', 'portfolioContext.sectorExposurePct'],
      source: { kind: 'DATASET', ref: `portfolio-snapshot:${portfolioBlock.asOf}` },
    };
    const concentrationEntry: CitableEvidence = {
      evidenceId: `pf:concentration:${subject.securityId}`,
      claim: `Count-based CSIP concentration and diversification context (labelled, not verb-driving)`,
      supports: ['portfolioContext.countBasedSectorExposure', 'portfolioContext.diversificationBand'],
      observationRefs: ['portfolioContext.countBasedConcentrationPct', 'portfolioContext.diversificationBand'],
      source: { kind: 'DERIVED', ref: 'csip:portfolio-intelligence+diversification' },
    };
    portfolioEvidence.push(weightEntry, concentrationEntry);
  }
  const limitsEvidence: CitableEvidence = {
    evidenceId: `lim:${limits.policyVersion}`,
    claim: `Limits in force: single-name ${limits.singleNameMaxPct}%, basis ${limits.basis}`,
    supports: ['limits.singleNameMaxPct', 'limits.sectorMaxPct'],
    observationRefs: ['limits.singleNameMaxPct', 'limits.basis'],
    source: { kind: 'POLICY', ref: `limits-policy:${limits.policyVersion}` },
  };
  const allEvidence = [...input.assessmentEvidence, ...portfolioEvidence, limitsEvidence];

  const add = (entry: DispositionRationaleEntry): void => {
    if (entry.evidenceIds.length === 0 || entry.observationRefs.length === 0) return;
    if (rationale.some((existing) => existing.rationaleId === entry.rationaleId)) return;
    rationale.push(Object.freeze(entry));
  };

  // ---------------------------------------------------------------- valuation ---
  if (facts.mosVsMidPct !== null) {
    const valuationEvidence = findEvidence(allEvidence, ['valuation', 'marginOfSafety', 'mos']);
    const mos = facts.mosVsMidPct;
    const direction = mos >= 0 ? 'SUPPORTS' : 'COUNTERS';
    add({
      rationaleId: 'rat-valuation-mos',
      claim: `Price is ${pct(mos)} versus the assessed mid intrinsic value (band ${facts.mosBand ?? 'unclassified'})`,
      direction,
      category: 'VALUATION',
      weight: 1,
      evidenceIds: [valuationEvidence?.evidenceId ?? 'assessment:valuation'],
      observationRefs: refsOf(valuationEvidence, ['valuation.marginOfSafety.mosVsMid']),
    });
    if (verb === 'RETAIN' || verb === 'ACCUMULATE' || verb === 'INITIATE' || verb === 'WATCH') {
      if (mos < MOS_THRESHOLDS.accumulateDiscount) {
        const counterEvidence = valuationEvidence;
        add({
          rationaleId: 'rat-valuation-below-accumulate-threshold',
          claim: `The discount is ${pct(mos)}, below the ${MOS_THRESHOLDS.accumulateDiscount}% the policy requires before exposure is increased`,
          direction: 'COUNTERS',
          category: 'VALUATION',
          weight: 0.5,
          evidenceIds: [counterEvidence?.evidenceId ?? 'assessment:valuation'],
          observationRefs: refsOf(counterEvidence, ['valuation.marginOfSafety.mosVsMid']),
        });
      }
    }
  }

  // ------------------------------------------------------------------ quality ---
  const qualityEvidence = findEvidence(allEvidence, ['quality', 'completeness']);
  add({
    rationaleId: 'rat-quality-verdict',
    claim: `Quality verdict is ${facts.qualityVerdict} with ${facts.highSeverityQualityFlags} HIGH-severity flag(s)`,
    direction: facts.qualityVerdict === 'CLEAN' || facts.qualityVerdict === 'MINOR_CONCERNS' ? 'SUPPORTS' : 'COUNTERS',
    category: 'QUALITY',
    weight: 0.8,
    evidenceIds: [qualityEvidence?.evidenceId ?? 'assessment:quality'],
    observationRefs: refsOf(qualityEvidence, ['quality.verdict']),
  });

  // --------------------------------------------------------------------- moat ---
  const moatEvidence = findEvidence(allEvidence, ['moat']);
  add({
    rationaleId: 'rat-moat-classification',
    claim: `Moat classification is ${facts.moatClassification}${
      facts.roicSpread === null ? '' : ` with an ROIC−WACC spread of ${pct(facts.roicSpread)}`
    }`,
    direction: facts.moatClassification === 'WIDE' || facts.moatClassification === 'NARROW' ? 'SUPPORTS' : 'COUNTERS',
    category: 'MOAT',
    weight: 0.6,
    evidenceIds: [moatEvidence?.evidenceId ?? 'assessment:moat'],
    observationRefs: refsOf(moatEvidence, ['moat.classification']),
  });

  // --------------------------------------------------------------------- risk ---
  const riskEvidence = findEvidence(allEvidence, ['risk']);
  if (facts.unresolvedMaxSeverity >= 3 || facts.unresolvedSeverityAtLeast4 > 0) {
    add({
      rationaleId: 'rat-risk-unresolved',
      claim: `Highest unresolved risk severity is ${facts.unresolvedMaxSeverity}, with ${facts.unresolvedSeverityAtLeast4} factor(s) at severity ≥ 4`,
      direction: facts.unresolvedMaxSeverity >= 4 ? 'COUNTERS' : 'SUPPORTS',
      category: 'RISK',
      weight: 0.7,
      evidenceIds: [riskEvidence?.evidenceId ?? 'assessment:risk'],
      observationRefs: refsOf(riskEvidence, ['risk.factors']),
    });
  } else {
    add({
      rationaleId: 'rat-risk-none-material',
      claim: 'No unresolved risk factor reaches severity 3 in the stored assessment',
      direction: 'SUPPORTS',
      category: 'RISK',
      weight: 0.4,
      evidenceIds: [riskEvidence?.evidenceId ?? 'assessment:risk'],
      observationRefs: refsOf(riskEvidence, ['risk.factors']),
    });
  }

  // ----------------------------------------------------------------- dividends ---
  const dividendEvidence = findEvidence(allEvidence, ['dividends', 'dividend']);
  add({
    rationaleId: 'rat-dividend-verdict',
    claim: `Dividend verdict is ${facts.dividendVerdict}${
      facts.netDebtToEbitdaRising ? ' with net debt / EBITDA rising' : ''
    }`,
    direction: facts.dividendVerdict === 'UNCOVERED' ? 'COUNTERS' : 'SUPPORTS',
    category: 'DIVIDEND',
    weight: 0.4,
    evidenceIds: [dividendEvidence?.evidenceId ?? 'assessment:dividends'],
    observationRefs: refsOf(dividendEvidence, ['dividends.verdict']),
  });

  // ---------------------------------------------------------------- portfolio ---
  if (portfolioBlock !== null) {
    const weightEntry = portfolioEvidence[0]!;
    if (portfolioBlock.weightPct.presence === 'PRESENT' && portfolioBlock.weightPct.value !== null) {
      add({
        rationaleId: 'rat-portfolio-weight',
        claim: `The position is ${obsPct(portfolioBlock.weightPct)} of measured portfolio value and its sector is ${obsPct(portfolioBlock.sectorExposurePct)}`,
        direction: 'SUPPORTS',
        category: 'PORTFOLIO',
        weight: 0.5,
        evidenceIds: [weightEntry.evidenceId],
        observationRefs: ['portfolioContext.weightPct', 'portfolioContext.sectorExposurePct'],
      });
    }
    if (
      portfolioBlock.unmeasuredWeightPct.presence === 'PRESENT' &&
      portfolioBlock.unmeasuredWeightPct.value !== null &&
      portfolioBlock.unmeasuredWeightPct.value > 0
    ) {
      add({
        rationaleId: 'rat-portfolio-unmeasured',
        claim: `${portfolioBlock.holdingsUnresolved} unresolved holding(s) contribute ${obsPct(portfolioBlock.unmeasuredWeightPct)} of unmeasured weight; every percentage here is of MEASURED value`,
        direction: 'COUNTERS',
        category: 'DATA',
        weight: 0.3,
        evidenceIds: [weightEntry.evidenceId],
        observationRefs: ['portfolioContext.unmeasuredWeightPct'],
      });
    }
  }

  // -------------------------------------------------------------------- caps ---
  for (const cap of input.capsApplied) {
    add({
      rationaleId: `rat-cap-${cap.gateId.toLowerCase()}`,
      claim: `${cap.gateId} lowered the verb from ${cap.from} to ${cap.to}: the projected exposure breaches the ${
        cap.gateId === 'CAPACITY_SINGLE_NAME' ? 'single-name' : 'sector'
      } cap (${limits.singleNameMaxPct}% single-name, policy ${limits.policyVersion}, basis ${limits.basis})`,
      direction: 'COUNTERS',
      category: 'CONCENTRATION',
      weight: 0.9,
      evidenceIds: [limitsEvidence.evidenceId],
      observationRefs: ['limits.singleNameMaxPct', 'portfolioContext.sectorExposurePct'],
    });
  }

  // ----------------------------------------------------------------- adequacy ---
  if (facts.adequacy !== 'SUFFICIENT') {
    add({
      rationaleId: 'rat-adequacy-partial',
      claim: `Evidence adequacy is ${facts.adequacy}: no exposure-increasing verb is available and no unsupported positive conclusion is drawn (R-9)`,
      direction: 'COUNTERS',
      category: 'DATA',
      weight: 0.8,
      evidenceIds: [qualityEvidence?.evidenceId ?? 'assessment:evidence'],
      observationRefs: refsOf(qualityEvidence, ['completeness.adequacy']),
    });
  }

  // ------------------------------------------------------------------ withheld ---
  if (verb === null) {
    add({
      rationaleId: 'rat-withheld',
      claim: `No verb is emitted: ${input.decisionPath.join(' ')}`,
      direction: 'COUNTERS',
      category: 'DATA',
      weight: 1,
      evidenceIds: [qualityEvidence?.evidenceId ?? 'assessment:evidence'],
      observationRefs: refsOf(qualityEvidence, ['completeness.adequacy']),
    });
  }

  // --------------------------------------------------------------- falsifiers ---
  const falsifiers: Falsifier[] = [];
  const pushFalsifier = (statement: string, trigger: string, observation: string): void => {
    falsifiers.push(Object.freeze({ statement, trigger, observation }));
  };

  pushFalsifier(
    'A margin-of-safety move across the policy threshold would change this view',
    `mosVsMid crosses ${MOS_THRESHOLDS.accumulateDiscount}% or ${MOS_THRESHOLDS.reducePremium}% by more than the hysteresis margin`,
    'assessment.valuation.marginOfSafety.mosVsMid',
  );
  pushFalsifier(
    'An unresolved risk factor escalating to severity 5, or a new severity ≥ 4 factor, reclassifies immediately',
    'risk.factors[].severity ≥ 4 with status NEW or UNRESOLVED',
    'assessment.risk.factors',
  );
  if (verb === 'RETAIN' || verb === 'ACCUMULATE') {
    pushFalsifier(
      'A quality downgrade to MATERIAL_CONCERNS with a HIGH-severity flag would withdraw the positive view',
      'quality.verdict becomes MATERIAL_CONCERNS',
      'assessment.quality.verdict',
    );
    pushFalsifier(
      'A dividend becoming UNCOVERED while leverage rises would make REDUCE available',
      'dividends.verdict = UNCOVERED and netDebtToEbitda rising',
      'assessment.dividends',
    );
  }
  if (verb === 'REDUCE') {
    pushFalsifier(
      'A recovery into the FAIR band with the position back inside the cap would restore RETAIN',
      `mosVsMid ≥ ${MOS_THRESHOLDS.fairBandLow}% and weight ≤ cap`,
      'assessment.valuation.marginOfSafety.mosVsMid',
    );
  }
  if (verb === 'AVOID') {
    pushFalsifier(
      'Resolution or restatement of the disqualifying fact, with SUFFICIENT evidence, would withdraw AVOID',
      'the cited disqualifier no longer holds in a later as-filed version',
      'assessment.quality.verdict + assessment.risk.factors',
    );
  }
  if (verb === 'INITIATE' || verb === 'WATCH') {
    pushFalsifier(
      'A sector-exposure increase beyond the sector cap would withdraw INITIATE and leave WATCH',
      'projected sector exposure > sector cap',
      'portfolioContext.sectorExposurePct',
    );
    pushFalsifier(
      'An adequacy upgrade to SUFFICIENT with a ≥ +15% discount is what would move WATCH to INITIATE',
      'completeness.adequacy = SUFFICIENT and mosVsMid ≥ 15%',
      'assessment.completeness.adequacy',
    );
  }
  if (verb === 'AVOID_CANDIDATE') {
    pushFalsifier(
      'The disqualifier being resolved with SUFFICIENT evidence would move AVOID_CANDIDATE back to WATCH or INITIATE',
      'the cited disqualifier no longer holds',
      'assessment.quality.verdict',
    );
  }
  if (verb === null) {
    pushFalsifier(
      'Supplying the unmet input named in `withheld.unmetInputs` is what would allow a verb to be emitted',
      'every unmetInputs entry becomes PRESENT',
      'disposition.withheld.unmetInputs',
    );
  }

  return Object.freeze({
    rationale: Object.freeze(rationale),
    falsifiers: Object.freeze(falsifiers),
    extraEvidence: Object.freeze([...portfolioEvidence, limitsEvidence]),
  });
}
