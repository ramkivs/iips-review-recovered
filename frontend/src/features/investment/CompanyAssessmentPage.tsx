/**
 * IID-3 — the thin company assessment view.
 *
 * A READ SURFACE, NOT A DECISION SURFACE. It renders what one persisted assessment version says, together
 * with the identity, provenance, adequacy and limitations that qualify it. There is no disposition, no
 * order, no trade, no allocation and no change-intelligence affordance anywhere on this page: the only
 * interactive element is a version selector, and it changes which stored version is read — never what it
 * says.
 *
 * EVERY NUMBER IS SHOWN WITH ITS STATUS. A missing value is rendered as its reason (`NOT_REPORTED`,
 * `PRICE_UNAVAILABLE`, …), never as a blank, a zero or a dash that could be read as zero. A withheld method
 * is shown as withheld with its reason. Nothing is recomputed here: the page formats the payload, it does
 * not analyse it.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  ASSESSMENT_UNAVAILABLE_COPY,
  AssessmentUnavailableError,
  LIMITATION_DISCLOSURES,
  fetchCompanyAssessment,
  type AssessmentEnvelope,
  type AssessmentVersionView,
  type NumericObservationView,
} from '../../api/investment';

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly envelope: AssessmentEnvelope }
  | { readonly kind: 'unavailable'; readonly reason: keyof typeof ASSESSMENT_UNAVAILABLE_COPY }
  | { readonly kind: 'error'; readonly message: string };

/** Render a number, or its reason. Never "0" and never an empty cell. */
function numeric(observation: NumericObservationView | null | undefined, unit = ''): string {
  if (observation === null || observation === undefined) return 'not available';
  if (observation.value === null) {
    return `${observation.presence}${observation.reason === undefined ? '' : `: ${observation.reason}`}`;
  }
  const value = observation.value;
  return `${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${unit}`;
}

function Badge({ tone, children }: { readonly tone: 'ok' | 'warn' | 'bad' | 'neutral'; readonly children: string }): JSX.Element {
  return (
    <span className={`badge badge-${tone}`} data-tone={tone}>
      {children}
    </span>
  );
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
          <button
            type="button"
            aria-pressed={version.reportId === selected}
            onClick={() => onSelect(version.reportId)}
          >
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

export default function CompanyAssessmentPage(): JSX.Element {
  const { issuerId = '' } = useParams<{ issuerId: string }>();
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
          <Badge tone={assessment.quality.verdict === 'CLEAN' ? 'ok' : assessment.quality.verdict === 'UNVERIFIED' ? 'bad' : 'warn'}>
            {`data quality ${assessment.quality.verdict}`}
          </Badge>{' '}
          <Badge tone="neutral">{`confidence ${assessment.confidence.combined.toFixed(4)}`}</Badge>{' '}
          <Badge tone="neutral">{`required-field coverage ${assessment.completeness.requiredFieldCoveragePct.toFixed(1)}%`}</Badge>
        </p>
        <p className="muted">
          identity binding <code>{assessment.subject.identity.bindingRef}</code> · roster{' '}
          {assessment.subject.identity.rosterVersion.slice(0, 12)}… · listing map{' '}
          {assessment.subject.identity.listingMapVersion.slice(0, 12)}… · corporate actions{' '}
          {assessment.subject.identity.corporateActionTableVersion.slice(0, 12)}…
        </p>
      </header>

      <section aria-labelledby="versions-heading">
        <h2 id="versions-heading">Version history</h2>
        <VersionSelector
          versions={versions}
          selected={version.reportId}
          onSelect={(reportId) => setSelectedReportId(reportId)}
        />
        <p className="muted">
          Viewing v{version.artifactVersion} · reportId <code>{version.reportId}</code> · payload digest{' '}
          <code>{version.payloadDigest}</code> · input digest <code>{version.inputDigest}</code>
        </p>
      </section>

      <section aria-labelledby="adequacy-heading">
        <h2 id="adequacy-heading">Assessment adequacy</h2>
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
      </section>

      <section aria-labelledby="valuation-heading">
        <h2 id="valuation-heading">Valuation</h2>
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
          <p className="muted">
            withheld inputs: {assessment.valuation.intrinsic.withheld.unmetInputs.join(', ')}
          </p>
        ) : null}
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
        {assessment.assumptions.discountRate === null ? null : (
          <p className="muted">
            discount rate {assessment.assumptions.discountRate.value} ({assessment.assumptions.discountRate.basis}) ·
            terminal growth {assessment.assumptions.terminalGrowth ?? 'not set'} · horizon{' '}
            {assessment.assumptions.forecastHorizonYears ?? 'not set'} years · policy{' '}
            {assessment.assumptions.policyVersion}
          </p>
        )}
      </section>

      <section aria-labelledby="risk-heading">
        <h2 id="risk-heading">Risk, dividends and moat</h2>
        <h3>Risk</h3>
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
      </section>

      <section aria-labelledby="evidence-heading">
        <h2 id="evidence-heading">Evidence and provenance</h2>
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
        {assessment.sectorReferenceView === null ? null : (
          <p className="muted">
            sector reference {assessment.sectorReferenceView.sectorRefId} ({assessment.sectorReferenceView.evidenceClass}):
            engine verdict {assessment.sectorReferenceView.engineVerdict ?? 'none'} · composite{' '}
            {assessment.sectorReferenceView.composite ?? 'none'} — {assessment.sectorReferenceView.note}
          </p>
        )}
      </section>

      <section aria-labelledby="limitations-heading">
        <h2 id="limitations-heading">Limitations and disclosures</h2>
        <p className="muted">
          Decision support only. No trade execution. Non-production. Assessment inputs are operator-supplied;
          no exchange data was downloaded.
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
      </section>
    </section>
  );
}
