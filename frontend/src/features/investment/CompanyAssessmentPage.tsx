/**
 * IID-6 — the full company assessment surface (IID-3 payload, extended).
 *
 * A READ SURFACE, NOT A DECISION SURFACE. It renders what one persisted assessment version says, together with the
 * identity, provenance, adequacy and limitations that qualify it, plus — where a portfolio and security context is
 * supplied in the URL — that holding's stored disposition, and the issuer's stored change history. The only
 * interactive elements are the version selector and the timeline's "compare" buttons: both change WHICH stored
 * version is read, never what it says. Nothing here writes, generates, appends or recomputes.
 *
 * EVERY NUMBER IS SHOWN WITH ITS STATUS. A missing value is rendered as `not available — <reason>`, never as a
 * blank, a zero or a dash that could be read as zero. A withheld method is shown as withheld with its reason.
 *
 * THE THREE CAPABILITIES MEET HERE. Assessment (IID-2), disposition (IID-4) and change history (IID-5) are rendered
 * from their own read models on one page, each keeping its own vocabulary: the assessment never states a verb, the
 * disposition never restates an assessment value, and the timeline never re-derives a category.
 */
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import {
  ASSESSMENT_UNAVAILABLE_COPY,
  AssessmentUnavailableError,
  LIMITATION_DISCLOSURES,
  fetchCompanyAssessment,
  type AssessmentEnvelope,
  type AssessmentVersionView,
  type NumericObservationView,
} from '../../api/investment';
import ChangeTimeline from './ChangeTimeline';
import DispositionPanel from './DispositionPanel';
import SectorReferenceDisclosure from './SectorReferenceDisclosure';
import { AbsentValue, Badge, ReadOnlyDisclosure, SurfaceSection } from './InvestmentStates';
import { formatNumber, formatPercent, formatRatio4, notAvailable, observed } from './investmentCopy';

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly envelope: AssessmentEnvelope }
  | { readonly kind: 'unavailable'; readonly reason: keyof typeof ASSESSMENT_UNAVAILABLE_COPY }
  | { readonly kind: 'error'; readonly message: string };

/** Render a number, or `not available — <reason>`. Never "0" and never an empty cell. */
function numeric(observation: NumericObservationView | null | undefined, unit = ''): string {
  if (observation === null || observation === undefined) return notAvailable('not reported in this version');
  if (observation.value === null) return notAvailable(observation.reason ?? observation.presence);
  return `${formatNumber(observation.value)}${unit}`;
}

function adequacyTone(adequacy: string): 'ok' | 'warn' | 'bad' | 'neutral' {
  if (adequacy === 'SUFFICIENT') return 'ok';
  if (adequacy === 'PARTIAL') return 'warn';
  if (adequacy === 'INSUFFICIENT') return 'bad';
  return 'neutral';
}

function VersionSelector({
  versions,
  selected,
  onSelect,
}: {
  readonly versions: readonly AssessmentVersionView[];
  readonly selected: string;
  readonly onSelect: (reportId: string) => void;
}): JSX.Element {
  return (
    <ul className="version-list" aria-label="Stored versions">
      {versions.map((version) => (
        <li key={version.reportId}>
          <button type="button" aria-pressed={version.reportId === selected} onClick={() => onSelect(version.reportId)}>
            v{version.artifactVersion}
          </button>{' '}
          <span className="muted">
            {version.generatedAt} · dataAsOf {version.dataAsOf} · payload {version.payloadDigest.slice(0, 12)}…
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The fundamentals the payload carries: reported values, derived values and trends, each with its period. */
function FundamentalsSection({ assessment }: { readonly assessment: AssessmentEnvelope['assessment'] }): JSX.Element {
  const fundamentals = assessment.fundamentals;
  const annual = fundamentals?.annual ?? [];
  if (annual.length === 0) {
    return (
      <SurfaceSection id="fundamentals" title="Fundamentals and periods">
        <p>
          <AbsentValue reason="this stored version carries no fundamental period block" />
        </p>
        <p className="muted">
          An absent fundamentals block is reported as absent. It is never rendered as zero, and no value is
          reconstructed from another period.
        </p>
      </SurfaceSection>
    );
  }
  return (
    <SurfaceSection
      id="fundamentals"
      title="Fundamentals and periods"
      description="Every reported and derived value is shown with its period and, when absent, with its reason."
    >
      {annual.map((period, index) => {
        const values = Object.entries(period.values ?? {});
        const derived = Object.entries(period.derived ?? {});
        return (
          <div key={`${period.periodEnd ?? index}`}>
            <h3>
              Period ending {period.periodEnd ?? notAvailable('period end not recorded')}{' '}
              <span className="muted">({period.basis ?? 'basis not recorded'})</span>
            </h3>
            <table>
              <caption>Reported values, period ending {period.periodEnd ?? 'unknown'}</caption>
              <thead>
                <tr>
                  <th scope="col">Line item</th>
                  <th scope="col">Value</th>
                  <th scope="col">Basis</th>
                </tr>
              </thead>
              <tbody>
                {values.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <AbsentValue reason="no reported value in this period" />
                    </td>
                  </tr>
                ) : (
                  values.map(([lineItem, value]) => (
                    <tr key={lineItem}>
                      <th scope="row">
                        <code>{lineItem}</code>
                      </th>
                      <td>{numeric(value)}</td>
                      <td className="muted">{value.presence === 'PRESENT' ? 'as filed' : `${value.presence}${value.reason === undefined ? '' : ` — ${value.reason}`}`}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {derived.length === 0 ? null : (
              <table>
                <caption>Derived values, period ending {period.periodEnd ?? 'unknown'}</caption>
                <thead>
                  <tr>
                    <th scope="col">Derivation</th>
                    <th scope="col">Value</th>
                    <th scope="col">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {derived.map(([item, value]) => (
                    <tr key={item}>
                      <th scope="row">
                        <code>{item}</code>
                      </th>
                      <td>{numeric(value)}</td>
                      <td className="muted">
                        {value.note ?? <AbsentValue reason="no note recorded for this derivation" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      {fundamentals?.trends === undefined ? null : (
        <>
          <h3>Trends</h3>
          <table>
            <caption>Declared trends across the assessed periods</caption>
            <thead>
              <tr>
                <th scope="col">Trend</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(fundamentals.trends).map(([key, value]) => (
                <tr key={key}>
                  <th scope="row">
                    <code>{key}</code>
                  </th>
                  <td>
                    {value !== null && typeof value === 'object'
                      ? numeric(value as NumericObservationView)
                      : value === null
                        ? <AbsentValue reason="not computable from the assessed periods" />
                        : String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </SurfaceSection>
  );
}

/** Confidence components and the caps that were applied to them. */
function ConfidenceSection({ assessment }: { readonly assessment: AssessmentEnvelope['assessment'] }): JSX.Element {
  const confidence = assessment.confidence;
  return (
    <SurfaceSection
      id="confidence"
      title="Confidence components and caps"
      description="Confidence is a policy computation, not a probability. Its components and every cap applied to them are listed here."
    >
      <table>
        <caption>Confidence components</caption>
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Data confidence</th>
            <td>{formatRatio4(confidence.dataConfidence)}</td>
          </tr>
          <tr>
            <th scope="row">Model confidence</th>
            <td>{formatRatio4(confidence.modelConfidence)}</td>
          </tr>
          <tr>
            <th scope="row">Combined</th>
            <td>{formatRatio4(confidence.combined)}</td>
          </tr>
        </tbody>
      </table>
      <h3>Caps applied</h3>
      {confidence.caps === undefined ? (
        <p>
          <AbsentValue reason="this version records no cap list" />
        </p>
      ) : confidence.caps.length === 0 ? (
        <p className="muted">No cap was applied to this assessment.</p>
      ) : (
        <ul>
          {confidence.caps.map((cap) => (
            <li key={cap}>
              <code>{cap}</code>
            </li>
          ))}
        </ul>
      )}
      <h3>Caps declared but not applied</h3>
      {(confidence.assumptionCaps ?? []).filter((cap) => !cap.applied).length === 0 ? (
        <p className="muted">
          No unapplied cap is declared on this version. A cap the policy does not quantify would be listed here
          rather than counted among the caps applied.
        </p>
      ) : (
        <ul>
          {(confidence.assumptionCaps ?? [])
            .filter((cap) => !cap.applied)
            .map((cap) => (
              <li key={cap.cap}>
                <code>{cap.cap}</code> · declared, factor{' '}
                {cap.factor === null ? 'not set in policy' : formatRatio4(cap.factor)} · triggered by{' '}
                {cap.triggers.map((trigger) => `${trigger.methodId}/${trigger.assumption}`).join(', ')}
                {cap.reason === null ? null : <span className="muted"> — {cap.reason}</span>}
              </li>
            ))}
        </ul>
      )}
      {confidence.formula === undefined ? null : <p className="muted">{confidence.formula}</p>}
    </SurfaceSection>
  );
}

/** Risk taxonomy and the material risk factors the assessment recorded. */
function RiskSection({ assessment }: { readonly assessment: AssessmentEnvelope['assessment'] }): JSX.Element {
  const aggregate = assessment.risk.aggregate;
  const evaluation = assessment.risk.evaluation;
  const byCategory = new Map<string, { count: number; highestSeverity: number }>();
  for (const factor of assessment.risk.factors) {
    const current = byCategory.get(factor.category) ?? { count: 0, highestSeverity: 0 };
    byCategory.set(factor.category, {
      count: current.count + 1,
      highestSeverity: Math.max(current.highestSeverity, factor.severity),
    });
  }
  return (
    <>
      <h3>Risk taxonomy</h3>
      {aggregate === null ? (
        <p>
          aggregate risk <AbsentValue reason="no aggregate risk score was produced" />
        </p>
      ) : (
        <p>aggregate risk {numeric(aggregate)}</p>
      )}
      {evaluation === undefined ? (
        <p className="muted">
          This version was produced before per-dimension risk reporting existed, so which dimensions were evaluated is{' '}
          <AbsentValue reason="not published in this version" />. The absence of a factor is not evidence of a pass.
        </p>
      ) : (
        <>
          <p>
            evaluation <code>{evaluation.completeness}</code> · policy disposition <code>{evaluation.disposition}</code> —{' '}
            {evaluation.counts.evaluated} of {evaluation.counts.applicable} applicable dimensions evaluated,{' '}
            {evaluation.counts.passed} passed, {evaluation.counts.concerns} with a concern,{' '}
            {evaluation.counts.notEvaluable} not evaluable
            {evaluation.counts.notApplicable === 0 ? '' : `, ${evaluation.counts.notApplicable} not applicable`}.
          </p>
          <p className="muted">{evaluation.note}</p>
          <table>
            <caption>Every risk dimension, whether or not it produced a factor</caption>
            <thead>
              <tr>
                <th scope="col">Dimension</th>
                <th scope="col">Status</th>
                <th scope="col">Measurement</th>
                <th scope="col">Threshold</th>
                <th scope="col">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {evaluation.dimensions.map((dimension) => (
                <tr key={dimension.dimensionId}>
                  <th scope="row">
                    <code>{dimension.dimensionId}</code>
                  </th>
                  <td>{dimension.status}</td>
                  <td>
                    {dimension.measurement === null
                      ? 'no measurement'
                      : observed(dimension.measurement)}
                  </td>
                  <td>{dimension.threshold}</td>
                  <td>
                    {dimension.statement}
                    {dimension.unavailableInputs.length === 0 ? null : (
                      <>
                        {' '}
                        <span className="muted">blocked by {dimension.unavailableInputs.join(', ')}</span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {byCategory.size === 0 ? (
        <p className="muted">No risk factor was evidenced. That is not a statement that none exists.</p>
      ) : (
        <table>
          <caption>Risk factors grouped by declared category</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Factors</th>
              <th scope="col">Highest severity</th>
            </tr>
          </thead>
          <tbody>
            {[...byCategory.entries()].map(([category, facts]) => (
              <tr key={category}>
                <th scope="row">{category}</th>
                <td>{facts.count}</td>
                <td>{facts.highestSeverity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>Material risk factors</h3>
      {assessment.risk.factors.length === 0 ? (
        <p className="muted">No risk factor was evidenced. That is not a statement that none exists.</p>
      ) : (
        <ul>
          {assessment.risk.factors.map((factor) => (
            <li key={factor.riskId}>
              <code>{factor.riskId}</code> [{factor.category}] severity {factor.severity}, likelihood{' '}
              {factor.likelihood}, {factor.status} — {factor.statement}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** The assumptions and consumed inputs behind the valuation. */
function AssumptionsSection({ assessment }: { readonly assessment: AssessmentEnvelope['assessment'] }): JSX.Element {
  const assumptions = assessment.assumptions;
  const components = assumptions.discountRate?.components;
  return (
    <SurfaceSection
      id="assumptions"
      title="Assumptions and consumed inputs"
      description="Policy defaults are system defaults, not the reader's preferences. Every assumption is printed with its basis."
    >
      <table>
        <caption>Assessment-level assumptions</caption>
        <thead>
          <tr>
            <th scope="col">Assumption</th>
            <th scope="col">Value</th>
            <th scope="col">Basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Discount rate</th>
            <td>{assumptions.discountRate === null ? <AbsentValue reason="no discount rate was set" /> : formatRatio4(assumptions.discountRate.value)}</td>
            <td className="muted">{assumptions.discountRate?.basis ?? notAvailable('basis not recorded')}</td>
          </tr>
          <tr>
            <th scope="row">Terminal growth</th>
            <td>{assumptions.terminalGrowth === null ? <AbsentValue reason="no terminal growth was set" /> : formatRatio4(assumptions.terminalGrowth)}</td>
            <td className="muted">policy</td>
          </tr>
          <tr>
            <th scope="row">Forecast horizon (years)</th>
            <td>{assumptions.forecastHorizonYears === null ? <AbsentValue reason="no horizon was set" /> : assumptions.forecastHorizonYears}</td>
            <td className="muted">policy</td>
          </tr>
          <tr>
            <th scope="row">Valuation policy</th>
            <td colSpan={2}>
              <code>{assumptions.policyVersion}</code>
            </td>
          </tr>
        </tbody>
      </table>

      {components === undefined ? null : (
        <>
          <h3>Discount-rate components</h3>
          <table>
            <caption>Components of the discount rate, as consumed by the valuation methods</caption>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(components).map(([key, value]) => (
                <tr key={key}>
                  <th scope="row">
                    <code>{key}</code>
                  </th>
                  <td>{formatRatio4(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {assumptions.methodSpecific === undefined || assumptions.methodSpecific.length === 0 ? null : (
        <>
          <h3>Method-specific assumptions</h3>
          {assumptions.methodSpecific.map((entry) => (
            <table key={entry.methodId}>
              <caption>{entry.methodId} assumptions</caption>
              <thead>
                <tr>
                  <th scope="col">Assumption</th>
                  <th scope="col">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(entry.assumptions).map(([key, value]) => (
                  <tr key={key}>
                    <th scope="row">
                      <code>{key}</code>
                    </th>
                    <td>{typeof value === 'number' ? formatNumber(value) : value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </>
      )}
    </SurfaceSection>
  );
}

export default function CompanyAssessmentPage(): JSX.Element {
  const { issuerId = '' } = useParams<{ issuerId: string }>();
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('portfolioId');
  const securityId = searchParams.get('securityId');
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    fetchCompanyAssessment(issuerId, selectedReportId ?? undefined)
      .then((envelope) => {
        if (!cancelled) setState({ kind: 'ready', envelope });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof AssessmentUnavailableError) {
          setState({ kind: 'unavailable', reason: error.reason });
          return;
        }
        setState({ kind: 'error', message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [issuerId, selectedReportId]);

  if (state.kind === 'loading') {
    return <p role="status">Reading stored assessment…</p>;
  }

  if (state.kind === 'unavailable' || state.kind === 'error') {
    return (
      <section>
        <h1>Company assessment</h1>
        <p role="alert">
          {state.kind === 'unavailable' ? ASSESSMENT_UNAVAILABLE_COPY[state.reason] : state.message}
        </p>
        <p className="muted">
          Nothing is substituted for a failed read: no cached assessment, no client-side recomputation and no
          fallback store.
        </p>
      </section>
    );
  }

  const { envelope } = state;
  const { assessment, version, versions, scope } = envelope;
  // `L-036` — absent on versions composed before the disclosure existed, which is why it is read defensively and
  // rendered as an absent value rather than silently omitted.
  const bridge = assessment.fundamentals?.capitalStructure?.equityBridge;

  return (
    <section className="company-assessment">
      <header>
        <h1>{assessment.subject.legalName}</h1>
        <p className="muted">
          <code>{assessment.subject.issuerId}</code> · {assessment.subject.sector}
          {assessment.subject.sectorSubsegment === null ? '' : ` · ${assessment.subject.sectorSubsegment}`} ·
          reporting currency {assessment.subject.reportingCurrency} · FY end {assessment.subject.fiscalYearEnd}
        </p>
        <p className="muted">
          scope <code>{scope.scopeToken}</code> · chain {scope.reportKey.slice(0, 16)}… ·{' '}
          {scope.versionCount} stored version{scope.versionCount === 1 ? '' : 's'} · chain root{' '}
          <code>{scope.chainRootReportId}</code>
        </p>
        <p className="muted">
          model {version.modelVersion} · policy {version.policyVersion} · dataAsOf {version.dataAsOf} · knownAsOf{' '}
          {version.knownAsOf} · dataset {version.datasetVersion.slice(0, 20)}… ({version.datasetClass}) · staleness{' '}
          {assessment.asOf.stalenessDays} day(s)
          {assessment.asOf.staleBeyondPolicy ? ' — beyond policy' : ''}
        </p>
        <p>
          <Badge tone={adequacyTone(assessment.completeness.adequacy)}>{`adequacy ${assessment.completeness.adequacy}`}</Badge>{' '}
          <Badge
            tone={
              assessment.quality.verdict === 'CLEAN'
                ? 'ok'
                : assessment.quality.verdict === 'UNVERIFIED'
                  ? 'bad'
                  : 'warn'
            }
          >
            {`data quality ${assessment.quality.verdict}`}
          </Badge>{' '}
          <Badge tone="neutral">{`confidence ${formatRatio4(assessment.confidence.combined)}`}</Badge>{' '}
          <Badge tone="neutral">{`required-field coverage ${assessment.completeness.requiredFieldCoveragePct.toFixed(1)}%`}</Badge>{' '}
          {assessment.asOf.staleBeyondPolicy ? <Badge tone="warn">stale beyond policy</Badge> : null}
        </p>
        <p className="muted">
          identity binding <code>{assessment.subject.identity.bindingRef}</code> · roster{' '}
          {assessment.subject.identity.rosterVersion.slice(0, 12)}… · listing map{' '}
          {assessment.subject.identity.listingMapVersion.slice(0, 12)}… · corporate actions{' '}
          {assessment.subject.identity.corporateActionTableVersion.slice(0, 12)}…
        </p>
        <ReadOnlyDisclosure />
      </header>

      <SurfaceSection
        id="versions"
        title="Version history"
        description="Every stored version of this chain. Selecting one reads exactly that stored version; nothing is recomputed."
      >
        <VersionSelector
          versions={versions}
          selected={version.reportId}
          onSelect={(reportId) => setSelectedReportId(reportId)}
        />
        <p className="muted">
          Viewing v{version.artifactVersion} · reportId <code>{version.reportId}</code> · payload digest{' '}
          <code>{version.payloadDigest}</code> · input digest <code>{version.inputDigest}</code>
        </p>
      </SurfaceSection>

      <FundamentalsSection assessment={assessment} />

      <SurfaceSection id="adequacy" title="Assessment adequacy">
        <ul>
          {assessment.completeness.adequacyBasis.map((basis) => (
            <li key={basis}>{basis}</li>
          ))}
        </ul>
        <h3>Missing values, with reasons</h3>
        {assessment.completeness.missingFields.length === 0 ? (
          <p className="muted">No required field is missing for the periods assessed.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">Field</th>
                <th scope="col">Period</th>
                <th scope="col">Reason</th>
              </tr>
            </thead>
            <tbody>
              {assessment.completeness.missingFields.map((missing) => (
                <tr key={`${missing.field}-${missing.periodEnd}`}>
                  <td>
                    <code>{missing.field}</code>
                  </td>
                  <td>{missing.periodEnd}</td>
                  <td>{missing.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SurfaceSection>

      <SurfaceSection id="valuation" title="Valuation">
        {assessment.valuation.intrinsic === null ? (
          <p>No intrinsic range was produced for this assessment.</p>
        ) : (
          <p>
            intrinsic per share (INR) low {numeric(assessment.valuation.intrinsic.perShare.low)} · mid{' '}
            {numeric(assessment.valuation.intrinsic.perShare.mid)} · high{' '}
            {numeric(assessment.valuation.intrinsic.perShare.high)} · spread{' '}
            {numeric(assessment.valuation.intrinsic.spreadPct, '%')}
          </p>
        )}
        {assessment.valuation.intrinsic?.withheld !== null &&
        assessment.valuation.intrinsic?.withheld !== undefined ? (
          <p className="muted">withheld inputs: {assessment.valuation.intrinsic.withheld.unmetInputs.join(', ')}</p>
        ) : null}
        <h3>Enterprise-to-equity bridge</h3>
        {bridge === undefined ? (
          <p>
            <AbsentValue reason="this version records no enterprise-to-equity disclosure" />
          </p>
        ) : (
          <>
            <p>
              <code>{bridge.formula}</code>
            </p>
            <p>
              treatment <code>{bridge.treatment}</code> · policy <code>{bridge.policyVersion}</code>
              {bridge.substitutedInputs.length === 0
                ? ' · every term came from a reported figure'
                : ` · substituted by policy: ${bridge.substitutedInputs
                    .map(
                      (entry) =>
                        `${entry.input} (${entry.treatment}; ${entry.presence}${
                          entry.reason === null ? '' : `: ${entry.reason}`
                        })`,
                    )
                    .join(', ')}`}
            </p>
            <p className="muted">{bridge.note}</p>
          </>
        )}
        <h3>Methods considered</h3>
        <table>
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col">Role</th>
              <th scope="col">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {assessment.valuation.methods.map((method) => (
              <tr key={method.methodId}>
                <td>
                  <code>{method.methodId}</code>
                </td>
                <td>{method.role}</td>
                <td>
                  {method.output === null
                    ? `withheld${method.notApplicableReason === null ? '' : `: ${method.notApplicableReason}`}`
                    : `per share ${numeric({ value: method.output.perShare, presence: 'PRESENT' })}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Margin of safety</h3>
        {assessment.valuation.marginOfSafety === null ? (
          <p>No margin of safety was produced.</p>
        ) : (
          <p>
            price {numeric(assessment.valuation.marginOfSafety.price)} (as of{' '}
            {assessment.valuation.marginOfSafety.priceAsOf ?? 'unknown'}) · vs mid{' '}
            {numeric(assessment.valuation.marginOfSafety.mosVsMid, '%')} · vs low{' '}
            {numeric(assessment.valuation.marginOfSafety.mosVsLow, '%')} · band{' '}
            {assessment.valuation.marginOfSafety.band ?? 'none'}
            {assessment.valuation.marginOfSafety.refusal === null
              ? ''
              : ` · price refused: ${assessment.valuation.marginOfSafety.refusal}`}
          </p>
        )}
        <h3>Sensitivity</h3>
        {assessment.valuation.sensitivity.length === 0 ? (
          <p className="muted">No sensitivity grid was produced.</p>
        ) : (
          assessment.valuation.sensitivity.map((grid) => (
            <table key={grid.methodId}>
              <caption>
                {grid.methodId} · base WACC {grid.baseWaccBps}bps · base growth {grid.baseGrowthBps}bps
              </caption>
              <thead>
                <tr>
                  <th scope="col">WACC (bps)</th>
                  <th scope="col">Growth (bps)</th>
                  <th scope="col">Value per share</th>
                </tr>
              </thead>
              <tbody>
                {grid.points.map((point) => (
                  <tr key={`${point.waccBps}-${point.growthBps}`}>
                    <td>{point.waccBps}</td>
                    <td>{point.growthBps}</td>
                    <td>{numeric(point.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))
        )}
      </SurfaceSection>

      <ConfidenceSection assessment={assessment} />

      <SurfaceSection id="risk" title="Risk, dividends and moat">
        <RiskSection assessment={assessment} />
        <h3>Dividends</h3>
        <p>
          verdict {assessment.dividends.verdict} · payout {numeric(assessment.dividends.payoutRatio)} · FCF coverage{' '}
          {numeric(assessment.dividends.fcfCoverage)} · net debt/EBITDA{' '}
          {numeric(assessment.dividends.netDebtToEbitda)} · paid in {assessment.dividends.consecutiveYearsPaid}{' '}
          consecutive year(s)
        </p>
        {assessment.dividends.withheld === null ? null : (
          <p className="muted">withheld: {assessment.dividends.withheld.unmetInputs.join(', ')}</p>
        )}
        {assessment.dividends.conflict === null ? null : (
          <p className="muted">source conflict: {assessment.dividends.conflict}</p>
        )}
        <h3>Moat</h3>
        <p>
          classification {assessment.moat.classification} · ROIC−WACC spread{' '}
          {numeric(assessment.moat.roicWaccSpread.spread, '%')} over{' '}
          {assessment.moat.roicWaccSpread.consecutiveYearsPositive} positive year(s)
        </p>
        {assessment.moat.withheld === null ? null : (
          <p className="muted">withheld: {assessment.moat.withheld.unmetInputs.join(', ')}</p>
        )}
      </SurfaceSection>

      <AssumptionsSection assessment={assessment} />

      <SurfaceSection id="evidence" title="Evidence and provenance">
        <p className="muted">
          {assessment.evidence.length} evidence entr{assessment.evidence.length === 1 ? 'y' : 'ies'} · dataset{' '}
          <code>{assessment.data.datasetVersion.slice(0, 20)}…</code> from {assessment.data.provider} · content
          digest <code>{assessment.data.contentDigest.slice(0, 20)}…</code> · statement scope{' '}
          {assessment.data.series.statementScope} ({assessment.data.series.annualPeriods} annual periods)
        </p>
        <ul>
          {assessment.evidence.map((entry) => (
            <li key={entry.evidenceId}>
              <code>{entry.evidenceId}</code> {entry.claim}{' '}
              <span className="muted">
                ({entry.source.kind}: {entry.source.ref}
                {entry.source.filedAt === undefined ? '' : `, filed ${entry.source.filedAt}`})
              </span>
            </li>
          ))}
        </ul>
        <p className="muted" data-testid="freshness-statement">
          Freshness: {assessment.asOf.stalenessDays} day(s) old at execution
          {assessment.asOf.staleBeyondPolicy ? ', which is beyond the freshness policy' : ', within the freshness policy'}.
          Both clocks are stated on the version line above; this page does not recompute them.
        </p>
      </SurfaceSection>

      {assessment.sectorReferenceView === null ? null : (
        <SectorReferenceDisclosure view={assessment.sectorReferenceView} sector={assessment.subject.sector} />
      )}

      {portfolioId !== null && securityId !== null ? (
        <DispositionPanel kind="held" portfolioId={portfolioId} securityId={securityId} heading="Disposition" />
      ) : (
        <SurfaceSection
          id="disposition"
          title="Disposition"
          description="A disposition is keyed by a portfolio and a security, so it is rendered when this page is opened from a holding."
        >
          <p>
            No disposition is shown here because no portfolio and security context was supplied.{' '}
            <span className="muted">
              Open this company from a holding in a portfolio to see that holding&rsquo;s stored disposition, or read a
              candidate assessment directly.
            </span>
          </p>
          <p>
            <Link to="/user-portfolios">User portfolios →</Link>{' '}
            <Link to={`/investment/coverage`}>Identity coverage →</Link>
          </p>
        </SurfaceSection>
      )}

      <ChangeTimeline issuerId={issuerId} versions={versions} />

      <SurfaceSection id="limitations" title="Limitations and disclosures">
        <p className="muted">
          Decision support only. No trade execution. Non-production. Assessment inputs are operator-supplied; no
          exchange data was downloaded.
        </p>
        <ul>
          {LIMITATION_DISCLOSURES.filter((entry) => envelope.limitations.includes(entry.id)).map((entry) => (
            <li key={entry.id}>
              <strong>{entry.id}</strong> {entry.text}
            </li>
          ))}
        </ul>
        {assessment.limitations.length === 0 ? null : (
          <ul>
            {assessment.limitations.map((limitation) => (
              <li key={limitation} className="muted">
                {limitation}
              </li>
            ))}
          </ul>
        )}
        <p className="muted">
          {envelope.disclosures.datasetNotice} · values shown: {formatPercent(assessment.completeness.requiredFieldCoveragePct)} of
          required fields present, {observed({ value: assessment.confidence.combined }, (value) => formatRatio4(value))} combined confidence.
        </p>
      </SurfaceSection>
    </section>
  );
}
