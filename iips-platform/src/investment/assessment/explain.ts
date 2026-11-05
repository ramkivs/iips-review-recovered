/**
 * IID-2 — deterministic explanation templates.
 *
 * Sentences are generated from the payload's own fields, so an explanation cannot say something the payload
 * does not contain. No model, no free text, no adjectives that the numbers do not support.
 */
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

  lines.push(
    `Quality verdict is ${payload.quality.verdict} with ${payload.quality.flags.length} flag(s); combined confidence is ${payload.confidence.combined}${payload.confidence.caps.length === 0 ? '' : ` with caps ${payload.confidence.caps.join(', ')}`}.`,
  );

  return lines;
}
