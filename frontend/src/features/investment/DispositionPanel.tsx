/**
 * IID-6 — the disposition panel (IID-4 read model).
 *
 * WHAT IT IS. The stored investment assessment of one holding or one candidate: a verb, its definition, the
 * rationale for and against it, the falsifiers that would change it, the limits in force, the portfolio context it
 * was measured against, and the implication for the portfolio. Nothing here is computed in the browser and nothing
 * here can be changed from the browser: the panel reads one stored chain version and formats it.
 *
 * HELD AND CANDIDATE ARE DIFFERENT SUBJECTS, NOT DIFFERENT LABELS. A held position has quantities, a weight and a
 * portfolio implication measured against them. A candidate has none of those — its payload says
 * `quantities: NOT_APPLICABLE` — so this panel renders a candidate with NO quantity row, NO weight and NO projected
 * weight, and says so explicitly. Filling those cells from anything else would invent a position.
 *
 * A WITHHELD VERB IS NOT AN EMPTY VERB. When the payload withholds a verb it carries the reasons and the unmet
 * inputs, and those are what the panel shows. It never renders an inferred verb, and it never renders
 * "not available" where the payload actually explains itself.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  DISPOSITION_UNAVAILABLE_COPY,
  DispositionUnavailableError,
  fetchCandidateDisposition,
  fetchHeldDisposition,
  type DispositionEnvelope,
  type DispositionPayloadView,
  type DispositionUnavailableReason,
} from '../../api/investmentDisposition';
import { AbsentValue, Badge, ReadOnlyDisclosure, SurfaceSection, UnavailableNotice, ValueOrAbsent } from './InvestmentStates';
import { formatPercent, formatRatio4, notAvailable, observed } from './investmentCopy';

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly envelope: DispositionEnvelope }
  | { readonly kind: 'unavailable'; readonly reason: DispositionUnavailableReason };

export interface DispositionPanelProps {
  readonly kind: 'held' | 'candidate';
  readonly securityId: string;
  /** Required for `held`; optional context for `candidate`. */
  readonly portfolioId?: string;
  readonly heading?: string;
  /** Assessment currently displayed alongside this independent disposition read. */
  readonly displayedAssessment?: { readonly issuerId: string; readonly reportId: string };
}

function verbTone(verb: string | null): string {
  if (verb === null) return 'neutral';
  if (verb === 'AVOID' || verb === 'AVOID_CANDIDATE') return 'bad';
  if (verb === 'ACCUMULATE' || verb === 'INITIATE') return 'ok';
  if (verb === 'REDUCE') return 'warn';
  return 'neutral';
}

function RationaleTable({ payload }: { readonly payload: DispositionPayloadView }): JSX.Element {
  if (payload.rationale.length === 0) {
    return <p className="muted">No rationale entry was recorded with this disposition.</p>;
  }
  return (
    <table>
      <caption>Rationale recorded with this disposition, for and against</caption>
      <thead>
        <tr>
          <th scope="col">Claim</th>
          <th scope="col">Direction</th>
          <th scope="col">Category</th>
          <th scope="col">Weight</th>
          <th scope="col">Evidence</th>
        </tr>
      </thead>
      <tbody>
        {payload.rationale.map((entry) => (
          <tr key={entry.rationaleId}>
            <td>{entry.claim}</td>
            <td>
              <Badge tone={entry.direction === 'COUNTERS' ? 'bad' : entry.direction === 'SUPPORTS' ? 'ok' : 'neutral'}>
                {entry.direction}
              </Badge>
            </td>
            <td>{entry.category}</td>
            <td>{entry.weight.toFixed(2)}</td>
            <td>
              {entry.evidenceIds.length === 0 ? (
                <AbsentValue reason="no evidence reference recorded" />
              ) : (
                entry.evidenceIds.join(', ')
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LimitsInForce({ payload }: { readonly payload: DispositionPayloadView }): JSX.Element {
  const limits = payload.limits;
  return (
    <>
      <p className="muted">
        policy <code>{limits.policyVersion}</code> · basis {limits.basis} · effective from {limits.effectiveFrom} ·
        digest <code>{limits.digest.slice(0, 16)}…</code>
      </p>
      <p className="muted">
        single-name cap {formatPercent(limits.singleNameMaxPct)} · default sector cap{' '}
        {formatPercent(limits.defaultSectorMaxPct)}
      </p>
      {limits.notes.length === 0 ? null : <p className="muted">{limits.notes.join(' · ')}</p>}
      {limits.applied.length === 0 ? (
        <p className="muted">No limit was binding at the measured weight.</p>
      ) : (
        <table>
          <caption>Limits evaluated, with what they were measured against</caption>
          <thead>
            <tr>
              <th scope="col">Limit</th>
              <th scope="col">Scope</th>
              <th scope="col">Cap</th>
              <th scope="col">Measured</th>
              <th scope="col">Projected</th>
              <th scope="col">Breached</th>
            </tr>
          </thead>
          <tbody>
            {limits.applied.map((limit) => (
              <tr key={`${limit.limitId}-${limit.scope}`}>
                <td>
                  <code>{limit.limitId}</code>
                </td>
                <td>{limit.scope}</td>
                <td>{formatPercent(limit.capPct)}</td>
                <td>
                  <ValueOrAbsent
                    value={limit.measuredPct}
                    reason="not measured"
                    format={(value) => formatPercent(value)}
                  />
                </td>
                <td>
                  <ValueOrAbsent
                    value={limit.projectedPct}
                    reason="no projected weight is asserted"
                    format={(value) => formatPercent(value)}
                  />
                </td>
                <td>{limit.breached ? 'yes' : 'no'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

/**
 * The portfolio context and implication block.
 *
 * For a candidate every weight is `NOT_APPLICABLE` in the payload, and this renders the payload's own reason. It
 * does not print `0` and does not compute "0% of a portfolio it is not in".
 */
function ImplicationBlock({ payload }: { readonly payload: DispositionPayloadView }): JSX.Element {
  const implication = payload.portfolioImplication;
  const context = payload.portfolioContext;
  const isCandidate = payload.subject.kind === 'CANDIDATE';
  return (
    <>
      {isCandidate ? (
        <p role="note" className="muted">
          A candidate has no position, so no quantity, no portfolio weight and no projected weight exists. The band
          basis below states what would be implied by the verb; nothing is measured against a holding.
        </p>
      ) : context === null ? (
        <p className="muted">
          No portfolio context block was recorded with this disposition, so no weight or exposure is shown.
        </p>
      ) : (
        <>
          <p className="muted">
            portfolio {payload.subject.portfolioId ?? notAvailable('portfolio id not recorded')} · revision{' '}
            {context.portfolioRevision} · as of {context.asOf} · measured {context.holdingsMeasured}, unresolved{' '}
            {context.holdingsUnresolved}, out of scope {context.holdingsOutOfScope}
          </p>
          <table>
            <caption>Portfolio context the disposition was measured against</caption>
            <thead>
              <tr>
                <th scope="col">Measure</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Position weight', context.weightPct],
                ['Company exposure', context.companyExposurePct],
                ['Sector exposure', context.sectorExposurePct],
                ['Concentration band', context.concentrationBand],
              ].map(([label, value]) => (
                <tr key={String(label)}>
                  <th scope="row">{String(label)}</th>
                  <td>{observed(value as { value: number | null; reason?: string }, (v) => formatPercent(v))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h4>Portfolio implication</h4>
      <p className="muted">{implication.bandBasis}</p>
      <table>
        <caption>Implied target exposure for this {isCandidate ? 'candidate' : 'holding'}</caption>
        <thead>
          <tr>
            <th scope="col">Measure</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{isCandidate ? 'Current weight (candidate)' : 'Current weight'}</th>
            <td>
              {implication.currentWeightPct.value === null
                ? observed(implication.currentWeightPct)
                : formatPercent(implication.currentWeightPct.value)}
            </td>
          </tr>
          <tr>
            <th scope="row">Implied target weight band</th>
            <td>
              {implication.impliedTargetWeightBand === null ? (
                <AbsentValue reason="no target band is asserted for this verb" />
              ) : (
                `${formatPercent(implication.impliedTargetWeightBand.lowPct)} – ${formatPercent(
                  implication.impliedTargetWeightBand.highPct,
                )}`
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">Projected single-name weight</th>
            <td>{observed(implication.projectedSingleNamePct, (v) => formatPercent(v))}</td>
          </tr>
          <tr>
            <th scope="row">Projected sector exposure</th>
            <td>{observed(implication.projectedSectorExposurePct, (v) => formatPercent(v))}</td>
          </tr>
          <tr>
            <th scope="row">Projected top-holding weight</th>
            <td>{observed(implication.projectedTopHoldingPct, (v) => formatPercent(v))}</td>
          </tr>
        </tbody>
      </table>
      {implication.deltaNotes.length === 0 ? null : (
        <ul className="muted">
          {implication.deltaNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export function DispositionPanel({ kind, securityId, portfolioId, heading, displayedAssessment }: DispositionPanelProps): JSX.Element {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    const read =
      kind === 'held'
        ? portfolioId === undefined
          ? Promise.reject(new DispositionUnavailableError('request-invalid', 400))
          : fetchHeldDisposition(portfolioId, securityId)
        : fetchCandidateDisposition(securityId, portfolioId);
    read
      .then((envelope) => {
        if (!cancelled) setState({ kind: 'ready', envelope });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          kind: 'unavailable',
          reason: error instanceof DispositionUnavailableError ? error.reason : 'unrecognised',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [kind, securityId, portfolioId]);

  const title = heading ?? (kind === 'held' ? 'Disposition' : 'Candidate assessment');

  if (state.kind === 'loading') {
    return (
      <SurfaceSection id="disposition" title={title}>
        <p role="status">Reading the stored disposition…</p>
      </SurfaceSection>
    );
  }

  if (state.kind === 'unavailable') {
    return (
      <SurfaceSection id="disposition" title={title}>
        <UnavailableNotice
          title="Disposition not available"
          message={DISPOSITION_UNAVAILABLE_COPY[state.reason]}
          detail={
            state.reason === 'not-recorded'
              ? 'A disposition is produced by the operator CLI against a stored assessment. This surface reads what was produced and cannot create one.'
              : undefined
          }
        />
      </SurfaceSection>
    );
  }

  const { envelope } = state;
  const payload = envelope.disposition;
  const isCandidate = payload.subject.kind === 'CANDIDATE';
  const withheld = payload.disposition.withheld;

  return (
    <SurfaceSection id="disposition" title={title}>
      <header>
        <p>
          <Badge tone={isCandidate ? 'info' : 'neutral'}>{isCandidate ? 'CANDIDATE — no position' : 'HELD POSITION'}</Badge>{' '}
          <strong>{payload.subject.symbol}</strong> · <code>{payload.subject.securityId}</code> ·{' '}
          {payload.subject.exchange} · {payload.subject.securityClass} · identity {payload.subject.identityState} ·
          security {payload.subject.securityState}
        </p>
        <p className="muted">
          assessment cited: version {payload.companyAssessmentRef.artifactVersion} · reportId{' '}
          <code>{payload.companyAssessmentRef.reportId}</code> · dataAsOf {payload.companyAssessmentRef.dataAsOf} ·
          knownAsOf {payload.companyAssessmentRef.knownAsOf} · model {payload.companyAssessmentRef.modelVersion}
        </p>
        <p className="muted">
          disposition version {envelope.version.artifactVersion} recorded {envelope.version.generatedAt} · model{' '}
          {payload.artifact.modelVersion} · policy {payload.artifact.policyVersion} · adequacy{' '}
          {payload.disposition.adequacy}
        </p>
      </header>

      {displayedAssessment !== undefined &&
      (payload.subject.issuerId !== displayedAssessment.issuerId ||
        payload.companyAssessmentRef.reportId !== displayedAssessment.reportId) ? (
        <p role="alert">
          This disposition does not cite the company assessment currently displayed. It belongs to issuer{' '}
          <code>{payload.subject.issuerId}</code> and the assessment report identified above; do not interpret it as a
          decision for the displayed version.
        </p>
      ) : null}

      {withheld !== null ? (
        <div role="note">
          <h3>Withheld — no verb was produced</h3>
          <p>
            The evidence was not sufficient to produce a disposition verb. This is a stated outcome, not an error and
            not a neutral verdict.
          </p>
          <p className="muted">reasons: {withheld.reasons.length === 0 ? 'none recorded' : withheld.reasons.join(', ')}</p>
          <p className="muted">
            unmet inputs: {withheld.unmetInputs.length === 0 ? 'none recorded' : withheld.unmetInputs.join(', ')}
          </p>
        </div>
      ) : (
        <div>
          <p>
            <Badge tone={verbTone(payload.disposition.verb)}>{payload.disposition.verb ?? 'NO VERB'}</Badge>{' '}
            <span className="muted">
              confidence{' '}
              {payload.disposition.confidence === null
                ? notAvailable('confidence not recorded')
                : formatRatio4(payload.disposition.confidence)}{' '}
              · horizon {payload.disposition.horizon}
            </span>
          </p>
          <p>{payload.disposition.definitionApplied}</p>
        </div>
      )}

      <h3>Rationale and counter-arguments</h3>
      <RationaleTable payload={payload} />

      <h3>Falsifiers</h3>
      {payload.falsifiers.length === 0 ? (
        <p className="muted">No falsifier was recorded with this disposition.</p>
      ) : (
        <ul>
          {payload.falsifiers.map((falsifier) => (
            <li key={falsifier.statement}>
              {falsifier.statement} <span className="muted">— trigger: {falsifier.trigger}</span>
            </li>
          ))}
        </ul>
      )}

      <h3>Gates evaluated</h3>
      <table>
        <caption>Evidence and policy gates applied before the verb was produced</caption>
        <thead>
          <tr>
            <th scope="col">Gate</th>
            <th scope="col">Outcome</th>
            <th scope="col">Detail</th>
          </tr>
        </thead>
        <tbody>
          {payload.disposition.gates.map((gate) => (
            <tr key={gate.gateId}>
              <td>
                <code>{gate.gateId}</code>
              </td>
              <td>{gate.outcome}</td>
              <td>{gate.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Limits and policy in force</h3>
      <LimitsInForce payload={payload} />

      <h3>Portfolio context and implication</h3>
      <ImplicationBlock payload={payload} />

      <h3>Review</h3>
      <p className="muted">
        next review{' '}
        {payload.review.nextReviewOn === null ? (
          <AbsentValue reason="no review date is scheduled" />
        ) : (
          payload.review.nextReviewOn
        )}
      </p>
      <ul>
        {payload.review.triggers.map((trigger) => (
          <li key={trigger.triggerId}>
            <code>{trigger.triggerId}</code> {trigger.armed ? 'armed' : 'not armed'} — {trigger.condition}
          </li>
        ))}
      </ul>

      <h3>Evidence</h3>
      {payload.evidence.length === 0 ? (
        <p className="muted">No evidence entry was recorded with this disposition.</p>
      ) : (
        <ul>
          {payload.evidence.map((entry) => (
            <li key={entry.evidenceId}>
              <code>{entry.evidenceId}</code> {entry.claim}{' '}
              <span className="muted">
                ({entry.source.kind}: {entry.source.ref})
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="muted">{payload.interpretation.notAnInstruction}</p>
      <p className="muted">
        Stored limiting identifiers: {envelope.limitations.length === 0 ? 'none' : envelope.limitations.join(', ')}.
        Prose lives in the limitation register.
      </p>
      <ReadOnlyDisclosure />
      {kind === 'candidate' && payload.subject.issuerId.length > 0 ? (
        <p>
          <Link to={`/investment/company/${encodeURIComponent(payload.subject.issuerId)}`}>
            Open the current company assessment (which may differ from the cited version) →
          </Link>
        </p>
      ) : null}
    </SurfaceSection>
  );
}

export default DispositionPanel;
