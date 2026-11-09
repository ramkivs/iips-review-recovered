/**
 * IID-6 — the change timeline and version comparison (IID-5 read models).
 *
 * TWO RULES THIS COMPONENT EXISTS TO KEEP:
 *
 *   1  A READER MUST BE ABLE TO TELL WHAT KIND OF DIFFERENCE THEY ARE LOOKING AT. Every pair is labelled with the
 *      server's classification — SUBSTANTIVE, GENERATION_METADATA_ONLY or FRESHNESS_TRANSITION — in words, and the
 *      label is explained. A model-only change is never rendered as a data change and a freshness crossing is never
 *      rendered as a decline in the business (AC-6.5, and the IID-5 wording it rests on).
 *   2  BOTH VERSIONS' CLOCKS AND MODEL IDENTITIES ARE ALWAYS VISIBLE SIDE BY SIDE. `dataAsOf`, `knownAsOf`, model
 *      version, policy version and dataset version are printed for the previous version and the current one, from
 *      the chain's own version views. A pair whose metadata cannot be resolved says so — it does not fall back to
 *      the other version's values.
 *
 * READ-ONLY, AND HONEST ABOUT WHAT IT CANNOT DO. A missing boundary explanation is rendered as a gap with the
 * operator reconciliation named as the thing that fills it — the capability is a server-side operation with no
 * browser affordance, and this component has no button that could pretend otherwise.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  CHANGE_CATEGORIES,
  CHANGE_UNAVAILABLE_COPY,
  ChangeUnavailableError,
  fetchChangeBoundaries,
  fetchCompanyChanges,
  type BoundariesEnvelope,
  type ChangeCategory,
  type ChangeEnvelope,
  type ChangeItemView,
  type ChangeUnavailableReason,
  type ComparisonView,
} from '../../api/investmentChanges';
import type { AssessmentVersionView } from '../../api/investment';
import { AbsentValue, MaterialityBadge, DirectionBadge, PriorityBadge, SurfaceSection, UnavailableNotice } from './InvestmentStates';
import { ATTRIBUTION_COPY, CLASSIFICATION_COPY, formatNumber, notAvailable } from './investmentCopy';
import { companyAssessmentHref, type InvestmentContext } from './investmentContext';

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly changes: ChangeEnvelope; readonly boundaries: BoundariesEnvelope | null }
  | { readonly kind: 'unavailable'; readonly reason: ChangeUnavailableReason };

export interface ChangeTimelineProps {
  readonly issuerId: string;
  /** Every version of the same chain, from the assessment envelope. Supplies the as-of/model columns. */
  readonly versions: readonly AssessmentVersionView[];
  /**
   * IID WI-1 (P4): the holding context the surrounding company page was opened with. Comparison links carry it so
   * opening a compared version does not silently discard the portfolio and security the reader came from. Absent
   * when the timeline is rendered without a holding (its own tests do exactly that).
   */
  readonly context?: InvestmentContext;
}

function itemValues(item: ChangeItemView): { readonly from: string; readonly to: string; readonly extra: string | null } {
  switch (item.kind) {
    case 'NUMERIC':
      return {
        from: item.observed.from === null ? notAvailable('not present in the earlier version') : formatNumber(item.observed.from),
        to: item.observed.to === null ? notAvailable('not present in the later version') : formatNumber(item.observed.to),
        extra:
          item.observed.relativePct === null
            ? null
            : `${item.observed.relativePct > 0 ? '+' : ''}${formatNumber(item.observed.relativePct)}% (${item.observed.unit})`,
      };
    case 'CATEGORICAL':
      return {
        from: item.from === null ? notAvailable('not set in the earlier version') : item.from,
        to: item.to === null ? notAvailable('not set in the later version') : item.to,
        extra: item.equivalenceClass === undefined ? null : `equivalence class ${item.equivalenceClass}`,
      };
    case 'PRESENCE':
      return { from: item.from, to: item.to, extra: item.note };
    case 'SET':
      return {
        from: item.removed.length === 0 ? 'no member removed' : `removed: ${item.removed.join(', ')}`,
        to: item.added.length === 0 ? 'no member added' : `added: ${item.added.join(', ')}`,
        extra: null,
      };
  }
}

function CategoryGroup({ category, items }: { readonly category: ChangeCategory; readonly items: readonly ChangeItemView[] }): JSX.Element {
  return (
    <section aria-labelledby={`change-category-${category}`} data-category={category}>
      <h4 id={`change-category-${category}`}>
        {category.replace(/_/g, ' ')} <span className="muted">({items.length})</span>
      </h4>
      {items.length === 0 ? (
        <p className="muted">No changed dimension in this category for this pair.</p>
      ) : (
        <table>
          <caption>{category.replace(/_/g, ' ')} changes</caption>
          <thead>
            <tr>
              <th scope="col">Dimension</th>
              <th scope="col">Materiality</th>
              <th scope="col">Direction</th>
              <th scope="col">Previous</th>
              <th scope="col">Current</th>
              <th scope="col">Detail</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const values = itemValues(item);
              return (
                <tr key={item.dimensionId}>
                  <th scope="row">
                    {item.label} <code className="muted">{item.dimensionId}</code>
                  </th>
                  <td>
                    <MaterialityBadge level={item.materiality} />
                  </td>
                  <td>
                    <DirectionBadge direction={item.direction} />
                  </td>
                  <td>{values.from}</td>
                  <td>{values.to}</td>
                  <td>
                    {values.extra === null ? (
                      <AbsentValue reason="no additional detail for this dimension" />
                    ) : (
                      values.extra
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

function VersionContext({
  comparison,
  versions,
}: {
  readonly comparison: ComparisonView;
  readonly versions: readonly AssessmentVersionView[];
}): JSX.Element {
  const previous = versions.find((version) => version.reportId === comparison.from.reportId) ?? null;
  const current = versions.find((version) => version.reportId === comparison.to.reportId) ?? null;
  const rows: readonly { readonly label: string; readonly previous: JSX.Element | string; readonly current: JSX.Element | string }[] = [
    { label: 'Version', previous: `v${comparison.from.artifactVersion}`, current: `v${comparison.to.artifactVersion}` },
    { label: 'Recorded at', previous: comparison.from.generatedAt, current: comparison.to.generatedAt },
    {
      label: 'dataAsOf',
      previous: previous === null ? <AbsentValue reason="version metadata not in this chain view" /> : previous.dataAsOf,
      current: current === null ? <AbsentValue reason="version metadata not in this chain view" /> : current.dataAsOf,
    },
    {
      label: 'knownAsOf',
      previous: previous === null ? <AbsentValue reason="version metadata not in this chain view" /> : previous.knownAsOf,
      current: current === null ? <AbsentValue reason="version metadata not in this chain view" /> : current.knownAsOf,
    },
    {
      label: 'Model version',
      previous: previous === null ? <AbsentValue reason="version metadata not in this chain view" /> : previous.modelVersion,
      current: current === null ? <AbsentValue reason="version metadata not in this chain view" /> : current.modelVersion,
    },
    {
      label: 'Policy version',
      previous: comparison.from.policyVersion,
      current: comparison.to.policyVersion,
    },
    {
      label: 'Dataset',
      previous: previous === null ? <AbsentValue reason="version metadata not in this chain view" /> : previous.datasetVersion,
      current: current === null ? <AbsentValue reason="version metadata not in this chain view" /> : current.datasetVersion,
    },
    {
      label: 'Substantive digest',
      previous: (
        <span>
          <code>{comparison.from.substantiveDigest ?? notAvailable('no substantive grammar for this type')}</code>{' '}
          <span className="muted">({comparison.from.substantiveDigestSource})</span>
        </span>
      ),
      current: (
        <span>
          <code>{comparison.to.substantiveDigest ?? notAvailable('no substantive grammar for this type')}</code>{' '}
          <span className="muted">({comparison.to.substantiveDigestSource})</span>
        </span>
      ),
    },
    {
      label: 'Payload digest',
      previous: <code>{comparison.from.payloadDigest.slice(0, 20)}…</code>,
      current: <code>{comparison.to.payloadDigest.slice(0, 20)}…</code>,
    },
  ];
  return (
    <table>
      <caption>Both versions side by side — clocks and model identity</caption>
      <thead>
        <tr>
          <th scope="col">Field</th>
          <th scope="col">Previous version</th>
          <th scope="col">Current version</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.previous}</td>
            <td>{row.current}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BoundaryCoverage({ boundaries }: { readonly boundaries: BoundariesEnvelope | null }): JSX.Element {
  if (boundaries === null) {
    return (
      <UnavailableNotice
        title="Boundary coverage"
        message="Boundary coverage could not be read, so no completeness claim is made for this chain."
      />
    );
  }
  const { coverage } = boundaries;
  return (
    <div>
      <p className="muted">
        {coverage.versionCount} stored version(s) · {coverage.pairCount} consecutive pair(s) ·{' '}
        {coverage.boundaryCount} stored boundary report(s) · {coverage.explainedPairs.length} explained ·{' '}
        {coverage.unexplainedPairs.length} missing
      </p>
      {coverage.unexplainedPairs.length === 0 ? (
        <p>Every consecutive pair in this chain has a stored boundary explanation.</p>
      ) : (
        <div role="note">
          <p>
            <strong>Explanation missing for {coverage.unexplainedPairs.length} version pair(s).</strong> The timeline
            above shows what the stored versions say; no cause is claimed for these pairs.
          </p>
          <ul>
            {coverage.unexplainedPairs.map((pair) => (
              <li key={`${pair.fromReportId}-${pair.toReportId}`}>
                pair <code>{pair.fromReportId}</code> → <code>{pair.toReportId}</code>
              </li>
            ))}
          </ul>
          <p className="muted">
            Filling a gap is an operator reconciliation action performed against the governed store
            (<code>ChangeService.reconcile</code>, report kind <code>VERSION_BOUNDARY_RECONSTRUCTED</code>). It is not
            exposed to the browser, this surface cannot trigger it, and it rewrites no history: it appends a labelled
            explanation.
          </p>
        </div>
      )}
    </div>
  );
}

export function ChangeTimeline({ issuerId, versions, context = {} }: ChangeTimelineProps): JSX.Element {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    setSelected(0);
    Promise.all([fetchCompanyChanges(issuerId), fetchChangeBoundaries(issuerId).catch(() => null)])
      .then(([changes, boundaries]) => {
        if (!cancelled) setState({ kind: 'ready', changes, boundaries });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          kind: 'unavailable',
          reason: error instanceof ChangeUnavailableError ? error.reason : 'unrecognised',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [issuerId]);

  const comparisons = state.kind === 'ready' ? state.changes.comparisons : [];
  const active = useMemo(() => comparisons[Math.min(selected, Math.max(comparisons.length - 1, 0))], [comparisons, selected]);

  if (state.kind === 'loading') {
    return (
      <SurfaceSection id="change-timeline" title="Change history">
        <p role="status">Reading stored version history…</p>
      </SurfaceSection>
    );
  }

  if (state.kind === 'unavailable') {
    return (
      <SurfaceSection id="change-timeline" title="Change history">
        <UnavailableNotice
          title="Change history not available"
          message={CHANGE_UNAVAILABLE_COPY[state.reason]}
          detail={
            state.reason === 'no-history'
              ? 'Comparisons are computed on read from two or more stored versions. With fewer than two stored versions there is no pair to compare, and nothing is invented to fill the timeline.'
              : undefined
          }
        />
      </SurfaceSection>
    );
  }

  const { changes, boundaries } = state;
  const items = active?.changes ?? [];
  const grouped = CHANGE_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  }));

  return (
    <SurfaceSection
      id="change-timeline"
      title="Change history"
      description="Comparisons are computed on read from stored versions. Explanations of each boundary are stored separately and shown at the end of this section."
    >
      <h3>Version timeline</h3>
      <p className="muted">
        {changes.pairCount} consecutive pair(s) in this chain · {changes.returned} shown
        {changes.truncated ? ' · the oldest pairs are not shown on this page' : ''}
      </p>
      {comparisons.length === 0 ? (
        <p>No comparable pair exists yet. A chain needs two stored versions before anything can be compared.</p>
      ) : (
        <>
          <table>
            <caption>Stored consecutive comparisons, newest first</caption>
            <thead>
              <tr>
                <th scope="col">Pair</th>
                <th scope="col">Classification</th>
                <th scope="col">Highest materiality</th>
                <th scope="col">Items</th>
                <th scope="col">Review</th>
                <th scope="col">Show</th>
                <th scope="col">Open stored version</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comparison, index) => {
                const previousIndex = comparisons.length - 1 - index;
                return (
                  <tr key={`${comparison.from.reportId}-${comparison.to.reportId}`}>
                    <td>
                      v{comparison.from.artifactVersion} → v{comparison.to.artifactVersion}
                    </td>
                    <td>{comparison.classification}</td>
                    <td>
                      <MaterialityBadge level={comparison.summary.highestMateriality} />
                    </td>
                    <td>{comparison.summary.total}</td>
                    <td>
                      {comparison.review.required ? (
                        <span>
                          required <PriorityBadge priority={comparison.review.priority} />
                        </span>
                      ) : (
                        'not required'
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        aria-pressed={previousIndex === selected}
                        onClick={() => setSelected(previousIndex)}
                      >
                        {previousIndex === selected ? `Showing v${comparison.from.artifactVersion} → v${comparison.to.artifactVersion}` : `Compare v${comparison.from.artifactVersion} → v${comparison.to.artifactVersion}`}
                      </button>
                    </td>
                    <td>
                      {/*
                        IID WI-1 (P4): each side of the pair is a stored version the read API can address
                        (`GET /api/investment/company/:issuerId/versions/:reportId`), so the link selects that
                        exact report on the company route and keeps the holding context. These are links, not
                        buttons: the compare control changes which pair is shown, this reads that version as
                        the assessment.
                      */}
                      <Link
                        to={companyAssessmentHref(issuerId, { ...context, reportId: comparison.from.reportId })}
                      >
                        Open v{comparison.from.artifactVersion}
                      </Link>{' '}
                      <Link
                        to={companyAssessmentHref(issuerId, { ...context, reportId: comparison.to.reportId })}
                      >
                        Open v{comparison.to.artifactVersion}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {active === undefined ? null : (
            <div>
              <h3>
                Comparison: v{active.from.artifactVersion} → v{active.to.artifactVersion}
              </h3>
              <p role="note" data-classification={active.classification}>
                {CLASSIFICATION_COPY[active.classification]}
              </p>

              <VersionContext comparison={active} versions={versions} />

              <h3>Materiality summary</h3>
              <p className="muted">
                {active.summary.total} item(s) · IMMATERIAL {active.summary.byMateriality.IMMATERIAL} · NOTABLE{' '}
                {active.summary.byMateriality.NOTABLE} · MATERIAL {active.summary.byMateriality.MATERIAL} · CRITICAL{' '}
                {active.summary.byMateriality.CRITICAL} · highest {active.summary.highestMateriality}
              </p>

              <h3>Changes by category</h3>
              {grouped.map((group) => (
                <CategoryGroup key={group.category} category={group.category} items={group.items} />
              ))}

              <h3>Review</h3>
              <p>
                {active.review.required ? (
                  <>
                    Review is required — priority <PriorityBadge priority={active.review.priority} />.
                  </>
                ) : (
                  <>No review trigger fired for this pair.</>
                )}
              </p>
              <ul>
                {active.review.triggers.map((trigger) => (
                  <li key={trigger.triggerId}>
                    <code>{trigger.triggerId}</code> {trigger.fired ? 'fired' : 'did not fire'} — {trigger.reason}
                  </li>
                ))}
              </ul>
              {active.review.suggestedFocus.length === 0 ? null : (
                <>
                  <h4>Questions to answer</h4>
                  <ul>
                    {active.review.suggestedFocus.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </>
              )}

              <h3>Attribution</h3>
              <p>{ATTRIBUTION_COPY[active.attribution.status]}</p>
              <p className="muted">
                cause {active.attribution.cause} · additive {active.attribution.additive ? 'verified' : 'not verified'}
                {active.attribution.reason === null ? '' : ` · ${active.attribution.reason}`}
              </p>
              <ul className="muted">
                <li>
                  data leg: {active.attribution.legs.data.available ? 'available' : 'unavailable'} —{' '}
                  {active.attribution.legs.data.requires}
                </li>
                <li>
                  model leg: {active.attribution.legs.model.available ? 'available' : 'unavailable'} —{' '}
                  {active.attribution.legs.model.requires}
                </li>
              </ul>

              {active.metadata.length === 0 ? null : (
                <>
                  <h3>Generation metadata that differs (not an investment change)</h3>
                  <table>
                    <caption>Members excluded from substantive identity that nevertheless differ</caption>
                    <thead>
                      <tr>
                        <th scope="col">Member</th>
                        <th scope="col">Previous</th>
                        <th scope="col">Current</th>
                      </tr>
                    </thead>
                    <tbody>
                      {active.metadata.map((entry) => (
                        <tr key={entry.member}>
                          <th scope="row">
                            <code>{entry.member}</code>
                          </th>
                          <td>{String(entry.from)}</td>
                          <td>{String(entry.to)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </>
      )}

      <h3>Boundary coverage</h3>
      <BoundaryCoverage boundaries={boundaries} />
    </SurfaceSection>
  );
}

export default ChangeTimeline;
