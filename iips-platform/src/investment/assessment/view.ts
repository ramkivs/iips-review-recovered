/**
 * IID-2 — fixture-backed read-only assessment view.
 *
 * Server-rendered HTML with no JavaScript and a `default-src 'none'` policy. It exists so the assessment can be
 * inspected during IID-2 without pre-empting IID-3 (persistence + GET transport) or IID-6 (UI integration).
 *
 * Disclosure rules enforced by construction:
 *   • a withheld method is shown with its reason, never omitted;
 *   • a withheld intrinsic shows what is missing, never a placeholder number;
 *   • the sector-reference block is visually and structurally separate from every company field.
 */
import { calendarDaysBetween } from './policyReview';
import type {
  CompanyAssessmentPayload,
  NumericObservation,
  RiskDimensionStatus,
  RiskEvaluation,
} from './types';

/** Tones for the D-3 dimension statuses: a pass is not a concern, and neither is "not evaluated". */
function dimensionTone(status: RiskDimensionStatus): string {
  if (status === 'PASSED') return 'ok';
  if (status === 'CONCERN') return 'bad';
  if (status === 'NOT_EVALUABLE') return 'absent';
  return 'muted';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * `L-036` review badge, with the elapsed age DERIVED at render time.
 *
 * The persisted block carries no day count on purpose: a member that moves every midnight would mint a version on
 * every re-run, which is the defect the substantive-identity grammar closes (L-014). The disclosure still shows the
 * age, because rendering has a clock — the report's own `asOf`.
 */
function reviewBadgeOf(payload: CompanyAssessmentPayload): string {
  const review = payload.fundamentals.capitalStructure.associatesJVReview;
  if (!review.reviewRequired) return '';
  const elapsedDays = calendarDaysBetween(review.clockStart, payload.asOf.generatedAt);
  const age = elapsedDays === null ? 'age unavailable' : `${elapsedDays} day(s)`;
  return ` <span class="badge">associates/JV review: ${escapeHtml(review.status)} · ${escapeHtml(age)}</span>`;
}

function num(value: number | null | undefined, decimals = 2): string {
  return value === null || value === undefined || !Number.isFinite(value) ? '—' : value.toFixed(decimals);
}

/** A value or its reason. Never a dash without a reason, never a zero for an absence. */
function cell(observation: NumericObservation, decimals = 2): string {
  if (observation.presence === 'PRESENT' && observation.value !== null) return num(observation.value, decimals);
  return `<span class="absent">${escapeHtml(observation.reason ?? observation.presence)}</span>`;
}

function pct(observation: NumericObservation, decimals = 1): string {
  if (observation.presence === 'PRESENT' && observation.value !== null) return `${num(observation.value * 100, decimals)}%`;
  return `<span class="absent">${escapeHtml(observation.reason ?? observation.presence)}</span>`;
}

const CSS = `
:root { color-scheme: light dark; }
body { font: 14px/1.5 system-ui, -apple-system, Segoe UI, sans-serif; margin: 2rem; max-width: 1100px; }
h1 { font-size: 1.4rem; margin-bottom: .25rem; }
h2 { font-size: 1.05rem; margin-top: 2rem; border-bottom: 1px solid rgba(128,128,128,.35); padding-bottom: .25rem; }
table { border-collapse: collapse; width: 100%; margin-top: .5rem; }
th, td { text-align: left; padding: .3rem .5rem; border-bottom: 1px solid rgba(128,128,128,.25); vertical-align: top; }
.muted { color: rgba(128,128,128,.95); }
.absent { color: #a15; font-variant: small-caps; }
.badge { display: inline-block; padding: .1rem .45rem; border-radius: 3px; border: 1px solid currentColor; font-size: 12px; }
.ok { color: #17643b; } .warn { color: #8a5a00; } .bad { color: #a1231f; }
.sector-reference { border: 1px dashed rgba(128,128,128,.6); padding: .75rem; margin-top: .5rem; }
code { font-size: 12px; }
`;

export function renderAssessmentHtml(payload: CompanyAssessmentPayload, narrative: readonly string[] = []): string {
  const adequacyTone = payload.completeness.adequacy === 'SUFFICIENT' ? 'ok' : payload.completeness.adequacy === 'PARTIAL' ? 'warn' : 'bad';
  const methodRows = payload.valuation.methods
    .map((method) => {
      const status = method.applicable
        ? method.output === null
          ? '<span class="absent">output withheld</span>'
          : `${num(method.output.perShareLow.value)} – ${num(method.output.perShareMid.value)} – ${num(method.output.perShareHigh.value)}`
        : `<span class="absent">${escapeHtml(method.notApplicableReason ?? 'not applicable')}</span>`;
      return `<tr><td><code>${method.methodId}</code></td><td>${method.role}</td><td>${status}</td><td class="muted">${escapeHtml(method.output?.basis ?? '')}</td></tr>`;
    })
    .join('');

  const selectionRows = payload.valuation.methodSelection.considered
    .map(
      (entry) =>
        `<tr><td><code>${entry.methodId}</code></td><td>${entry.role}</td><td class="muted">${escapeHtml(entry.reason)}</td></tr>`,
    )
    .join('');

  const sensitivityGrid = payload.valuation.sensitivity[0] ?? null;
  // `L-040`: a grid whose enterprise-to-equity conversion refused carries no per-share value at all. It is
  // rendered as withheld — with the blocking component named — and its enterprise-value column is labelled
  // diagnostic, so no cell can be read as a valuation or a sensitivity result.
  const sensitivityWithheld = sensitivityGrid !== null && sensitivityGrid.withheld !== undefined;
  const sensitivityRows = (sensitivityGrid?.points ?? [])
    .map((point) => {
      const ev = point.enterpriseValue === null ? '<span class="absent">out of domain</span>' : num(point.enterpriseValue);
      const perShareCell =
        point.value !== null
          ? num(point.value)
          : sensitivityWithheld
            ? '<span class="absent">withheld</span>'
            : '<span class="absent">out of domain</span>';
      return `<tr><td>${(point.waccBps / 100).toFixed(2)}%</td><td>${(point.growthBps / 100).toFixed(2)}%</td><td>${ev}</td><td>${perShareCell}</td></tr>`;
    })
    .join('');
  const sensitivityNotice = sensitivityWithheld
    ? `<p class="absent">No per-share value is published: the enterprise-to-equity conversion is ${escapeHtml(sensitivityGrid!.withheld!.presence)} (${escapeHtml(sensitivityGrid!.withheld!.reason)})${sensitivityGrid!.withheld!.note === null ? '' : ` — ${escapeHtml(sensitivityGrid!.withheld!.note)}`}. The enterprise-value column is diagnostic arithmetic only and is not a valuation.</p>`
    : '';

  const dividendRows = payload.dividends.perShareHistory
    .map((entry) => `<tr><td>${entry.periodEnd}</td><td>${cell(entry.dps)}</td><td class="muted">${entry.basis}</td></tr>`)
    .join('');

  const moatRows = payload.moat.evidence
    .map(
      (entry) =>
        `<tr><td><code>${escapeHtml(entry.dimension)}</code></td><td>${escapeHtml(entry.metric)}</td><td>${cell(entry.observed, 3)}</td><td>${entry.threshold}</td><td>${entry.persists ? 'persists' : 'not persisting'}</td></tr>`,
    )
    .join('');

  const riskRows = payload.risk.factors
    .map(
      (factor) =>
        `<tr><td><code>${escapeHtml(factor.riskId)}</code></td><td>${factor.severity}</td><td>${factor.likelihood}</td><td>${escapeHtml(factor.statement)}</td></tr>`,
    )
    .join('');

  /* D-3 — a dimension that passed and a dimension that could not be evaluated are different results, and both
   * are different from a concern. They are printed as such, with the blocking inputs where there are some. */
  const evaluation: RiskEvaluation | undefined = payload.risk.evaluation;
  const riskCompletenessTone =
    evaluation === undefined || evaluation.completeness === 'NONE'
      ? 'absent'
      : evaluation.completeness === 'PARTIAL'
        ? 'warn'
        : 'ok';
  const dimensionRows = (evaluation?.dimensions ?? [])
    .map((dimension) => {
      const measurement =
        dimension.measurement === null
          ? '<span class="muted">no measurement</span>'
          : cell(dimension.measurement, 3);
      const blocked =
        dimension.unavailableInputs.length === 0
          ? ''
          : `<div class="muted">blocked by ${dimension.unavailableInputs.map((path) => `<code>${escapeHtml(path)}</code>`).join(', ')}</div>`;
      return `<tr><td><code>${escapeHtml(dimension.dimensionId)}</code></td><td class="${dimensionTone(dimension.status)}">${dimension.status}</td><td>${measurement}</td><td>${escapeHtml(dimension.threshold)}</td><td>${escapeHtml(dimension.statement)}${blocked}</td></tr>`;
    })
    .join('');

  const qualityRows = payload.quality.flags
    .map((flag) => `<tr><td><code>${flag.code}</code></td><td>${flag.severity}</td><td>${escapeHtml(flag.evidence)}</td></tr>`)
    .join('');

  const missingRows = payload.completeness.missingFields
    .slice(0, 20)
    .map((field) => `<tr><td>${escapeHtml(field.field)}</td><td><code>${field.reason}</code></td></tr>`)
    .join('');

  const intrinsic = payload.valuation.intrinsic;
  const mos = payload.valuation.marginOfSafety;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Company assessment — ${escapeHtml(payload.subject.legalName)} (${escapeHtml(payload.asOf.dataAsOf)})</title>
<style>${CSS}</style>
</head>
<body>
<h1>${escapeHtml(payload.subject.legalName)}</h1>
<p class="muted"><code>${escapeHtml(payload.subject.issuerId)}</code> · ${escapeHtml(payload.subject.sector)} · ${escapeHtml(payload.data.series.statementScope)} · data as of ${escapeHtml(payload.asOf.dataAsOf)} · model ${escapeHtml(payload.artifact.modelVersion)} · policy ${escapeHtml(payload.artifact.policyVersion)}</p>
<p><span class="badge ${adequacyTone}">adequacy: ${payload.completeness.adequacy}</span> <span class="badge">quality: ${payload.quality.verdict}</span> <span class="badge">confidence: ${payload.confidence.combined}</span> <span class="badge">moat: ${payload.moat.classification}</span> <span class="badge">dividends: ${payload.dividends.verdict}</span>${
  reviewBadgeOf(payload)
}</p>

<h2>Identity and data</h2>
<table>
<tr><th>Issuer</th><td><code>${escapeHtml(payload.subject.issuerId)}</code></td><th>Binding</th><td><code>${escapeHtml(payload.subject.identity.bindingRef)}</code></td></tr>
<tr><th>Dataset</th><td><code>${escapeHtml(payload.data.datasetVersion)}</code></td><th>Provider</th><td>${escapeHtml(payload.data.provider)}</td></tr>
<tr><th>Annual periods</th><td>${payload.data.series.annualPeriods}</td><th>Quarterly periods</th><td>${payload.data.series.quarterlyPeriods}</td></tr>
<tr><th>Required-field coverage</th><td>${(payload.completeness.requiredFieldCoveragePct * 100).toFixed(0)}%</td><th>Staleness</th><td>${payload.asOf.stalenessDays} days${payload.asOf.staleBeyondPolicy ? ' (beyond policy)' : ''}</td></tr>
</table>

<h2>Valuation</h2>
${
  intrinsic === null
    ? `<p class="absent">No intrinsic range is published: every weighted method must produce a per-share value (INV-5). Unmet inputs: ${escapeHtml(
        payload.valuation.methods
          .filter((method) => method.applicable && method.output === null)
          .map((method) => method.methodId)
          .join(', ') || 'none applicable',
      )}.</p>`
    : `<p><strong>Intrinsic value:</strong> ${num(intrinsic.perShare.mid.value)} per share (range ${num(intrinsic.perShare.low.value)}–${num(intrinsic.perShare.high.value)}); spread ${pct(intrinsic.spreadPct)}; weights ${intrinsic.weighting.map((weight) => `${weight.methodId} ${(weight.weight * 100).toFixed(0)}%`).join(', ')}</p>`
}
${
  mos === null
    ? '<p class="absent">Margin of safety not computed.</p>'
    : `<p><strong>Margin of safety:</strong> ${mos.refusal === null ? `${pct(mos.mosVsMid)} against the midpoint (band ${mos.band}), price as of ${escapeHtml(mos.priceAsOf ?? '—')}` : `<span class="absent">withheld — ${escapeHtml(mos.refusal)}</span>`}</p>`
}
<table>
<thead><tr><th>Method</th><th>Role</th><th>Per-share low / mid / high</th><th>Basis</th></tr></thead>
<tbody>${methodRows}</tbody>
</table>
<h2>Method selection (${escapeHtml(payload.valuation.methodSelection.sector)})</h2>
<table>
<thead><tr><th>Method</th><th>Role</th><th>Reason / policy note</th></tr></thead>
<tbody>${selectionRows}</tbody>
</table>
<h2>Sensitivity (WACC × terminal growth)</h2>
${sensitivityNotice}
<table>
<thead><tr><th>WACC</th><th>Terminal growth</th><th>Enterprise value${sensitivityWithheld ? ' (diagnostic)' : ''}</th><th>Value per share</th></tr></thead>
<tbody>${sensitivityRows}</tbody>
</table>

<h2>Capital structure</h2>
<table>
<tr><th>Net debt</th><td>${cell(payload.fundamentals.capitalStructure.netDebt, 0)}</td><th>Lease treatment</th><td>${payload.fundamentals.capitalStructure.leaseTreatment}${payload.fundamentals.capitalStructure.pre116Comparative ? ' (pre-116 comparative flagged)' : ''}</td></tr>
<tr><th>Diluted shares</th><td>${cell(payload.fundamentals.capitalStructure.dilutedShares, 0)}</td><th>Share-count period</th><td>${escapeHtml(payload.fundamentals.capitalStructure.shareCountPeriod ?? '—')}</td></tr>
</table>

<h2>Dividends</h2>
<p>Verdict <strong>${payload.dividends.verdict}</strong> · reconciliation ${payload.dividends.reconciliation.status}${payload.dividends.conflict === null ? '' : ` · <span class="bad">${payload.dividends.conflict}</span>`}</p>
<p class="muted">Declared DPS ${cell(payload.dividends.reconciliation.dpsDeclared, 3)} · implied DPS ${cell(payload.dividends.reconciliation.dpsImplied, 3)} · delta ${pct(payload.dividends.reconciliation.deltaPct)}${payload.dividends.reconciliation.reason === null ? '' : ` · ${escapeHtml(payload.dividends.reconciliation.reason)}`}</p>
<table>
<thead><tr><th>Period end</th><th>DPS</th><th>Basis</th></tr></thead>
<tbody>${dividendRows}</tbody>
</table>

<h2>Moat — ${payload.moat.classification}</h2>
<p class="muted">ROIC−WACC spread ${cell(payload.moat.roicWaccSpread.spread, 3)} · consecutive positive years ${payload.moat.roicWaccSpread.consecutiveYearsPositive}</p>
<table>
<thead><tr><th>Dimension</th><th>Metric</th><th>Observed</th><th>Threshold</th><th>Persistence</th></tr></thead>
<tbody>${moatRows || '<tr><td class="absent" colspan="5">no moat evidence available</td></tr>'}</tbody>
</table>

<h2>Risk</h2>
<p class="muted">evaluation: <span class="${riskCompletenessTone}">${evaluation?.completeness ?? 'not published'}</span> · policy disposition: ${evaluation?.disposition ?? 'not published'}${evaluation === undefined ? '' : ` · ${evaluation.note}`}</p>
<table>
<thead><tr><th>Dimension</th><th>Status</th><th>Measurement</th><th>Threshold</th><th>Outcome</th></tr></thead>
<tbody>${dimensionRows || '<tr><td class="absent" colspan="5">this artefact predates per-dimension reporting; no dimension outcome was published</td></tr>'}</tbody>
</table>
<h3>Material risk factors</h3>
<table>
<thead><tr><th>Factor</th><th>Severity</th><th>Likelihood</th><th>Statement</th></tr></thead>
<tbody>${riskRows || '<tr><td class="absent" colspan="4">no risk factor crossed a policy threshold</td></tr>'}</tbody>
</table>

<h2>Quality and gaps</h2>
<table>
<thead><tr><th>Flag</th><th>Severity</th><th>Evidence</th></tr></thead>
<tbody>${qualityRows || '<tr><td colspan="3">no quality flag</td></tr>'}</tbody>
</table>
<table>
<thead><tr><th>Missing field</th><th>Reason</th></tr></thead>
<tbody>${missingRows || '<tr><td colspan="2">no required field missing</td></tr>'}</tbody>
</table>

<h2>What this says</h2>
<ul>${narrative.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>

<h2>Sector reference — shown separately, never an input</h2>
<div class="sector-reference">
<p><strong>${escapeHtml(payload.sectorReferenceView.sectorRefId)}</strong> (evidence class: ${payload.sectorReferenceView.evidenceClass})</p>
<p class="muted">Engine verdict: ${escapeHtml(payload.sectorReferenceView.engineVerdict ?? 'none supplied')} · composite: ${payload.sectorReferenceView.composite === null ? '—' : payload.sectorReferenceView.composite}</p>
<p class="muted">${escapeHtml(payload.sectorReferenceView.note)}</p>
</div>

<h2>Limitations</h2>
<ul>${payload.limitations.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>

<p class="muted">Decision support only · no trade execution · non-production. Every figure above is a field of the assessment payload; nothing is computed by this page.</p>
</body>
</html>`;
}

export const ASSESSMENT_VIEW_CSP = "default-src 'none'; style-src 'unsafe-inline'";
