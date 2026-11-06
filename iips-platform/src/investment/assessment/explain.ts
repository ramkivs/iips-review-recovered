/**
 * IID-2 — deterministic explanation templates.
 *
 * Sentences are generated from the payload's own fields, so an explanation cannot say something the payload
 * does not contain. No model, no free text, no adjectives that the numbers do not support.
 */
import { calendarDaysBetween } from './policyReview';
import type { CompanyAssessmentPayload } from './types';

export function assessmentNarrative(payload: CompanyAssessmentPayload): readonly string[] {
  const lines: string[] = [];

  const periods = payload.fundamentals.annual.length;
  lines.push(
    `${payload.subject.issuerId} is assessed on ${periods} annual period(s) of ${payload.data.series.statementScope.toLowerCase()} statements at ${payload.data.datasetVersion}.`,
  );

  lines.push(
    `Adequacy is ${payload.completeness.adequacy} (${payload.completeness.adequacyBasis.join(', ') || 'no gate fired'}); required-field coverage is ${(payload.completeness.requiredFieldCoveragePct * 100).toFixed(0)}%.`,
  );

  if (payload.valuation.intrinsic === null) {
    const unmet = payload.valuation.intrinsic === null ? payload.valuation.methods.filter((method) => method.applicable && method.output === null).map((method) => method.methodId) : [];
    lines.push(
      `No intrinsic range is published: ${unmet.length === 0 ? 'no weighted method produced a per-share value' : `the weighted methods ${unmet.join(', ')} produced no output`}.`,
    );
  } else {
    lines.push(
      `Intrinsic value is ${payload.valuation.intrinsic.perShare.mid.value?.toFixed(2)} per share (range ${payload.valuation.intrinsic.perShare.low.value?.toFixed(2)}–${payload.valuation.intrinsic.perShare.high.value?.toFixed(2)}), a blend of ${payload.valuation.intrinsic.weighting.map((weight) => `${weight.methodId} ${(weight.weight * 100).toFixed(0)}%`).join(', ')}.`,
    );
  }

  if (payload.valuation.marginOfSafety !== null) {
    lines.push(
      payload.valuation.marginOfSafety.refusal === null
        ? `At the ${payload.valuation.marginOfSafety.priceAsOf} price the margin of safety is ${((payload.valuation.marginOfSafety.mosVsMid.value ?? 0) * 100).toFixed(1)}% against the midpoint (${payload.valuation.marginOfSafety.band}).`
        : `Margin of safety is withheld: ${payload.valuation.marginOfSafety.refusal}.`,
    );
  }

  lines.push(
    `Moat is ${payload.moat.classification} (ROIC−WACC positive for ${payload.moat.roicWaccSpread.consecutiveYearsPositive} consecutive year(s), ${payload.moat.evidence.length} dimension(s) evidenced).`,
  );

  lines.push(
    `Dividend verdict is ${payload.dividends.verdict}; source reconciliation is ${payload.dividends.reconciliation.status}${payload.dividends.reconciliation.reason === null ? '' : ` (${payload.dividends.reconciliation.reason})`}.`,
  );

  const appliedPolicyCaps = payload.confidence.assumptionCaps.filter((declaration) => declaration.applied);
  lines.push(
    `Quality verdict is ${payload.quality.verdict} with ${payload.quality.flags.length} flag(s); combined confidence is ${payload.confidence.combined}${payload.confidence.caps.length === 0 ? '' : ` with caps ${payload.confidence.caps.join(', ')}`}${
      appliedPolicyCaps.length === 0
        ? ''
        : `, including the R-4.3 policy-default penalty (${appliedPolicyCaps
            .map((declaration) => `${declaration.category} ${declaration.penaltyRate}`)
            .join(' + ')})`
    }.`,
  );

  // `L-036`: an outstanding review is a fact about the assessment, so it belongs in the narrative a reader sees
  // without expanding the capital-structure block.
  //
  // The age is DERIVED here rather than read from the payload: the persisted block is clock-free by contract (a day
  // count in the payload would mint a version on every midnight re-run), so the narrative measures `clockStart`
  // against the report's own `asOf` — the clock the report was generated at, which is what a reader is asking about.
  const review = payload.fundamentals.capitalStructure.associatesJVReview;
  if (review.reviewRequired) {
    const elapsedDays = calendarDaysBetween(review.clockStart, payload.asOf.generatedAt);
    lines.push(
      `Associates/JV review ${review.status}: the POLICY_ZERO treatment has run ${String(elapsedDays ?? 'an unmeasurable number of')} day(s) from the evidence date ${String(review.clockStart ?? '(unavailable)')}, against a ${review.reviewAgeDays}-day review age. ${review.reason}`,
    );
  }

  return lines;
}
