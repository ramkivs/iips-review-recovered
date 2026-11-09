/**
 * IID-1 — the minimal coverage view.
 *
 * Shows counts, every observed row, its state and reason, the raw observation behind an unresolved row,
 * corporate-action successor reconciliation, and the separate financial-coverage position.
 *
 * It shows NO company metric for a row without an identity, and none for a row whose identity is not
 * assessable. There is no client-side classification: the server resolves, this page renders.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { candidateAssessmentHref, changeHistoryHref, companyAssessmentHref } from './investmentContext';

import {
  CoverageUnavailableError,
  fetchInvestmentCoverage,
  type CoverageItemView,
  type InvestmentCoverageReport,
} from '../../api/investmentCoverage';

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly report: InvestmentCoverageReport }
  | {
      readonly kind: 'unavailable';
      readonly message: string;
      readonly issues: readonly { readonly file: string; readonly code: string; readonly detail: string }[];
    }
  | { readonly kind: 'error'; readonly message: string };

const STATE_TONE: Readonly<Record<string, string>> = Object.freeze({
  RESOLVED: 'ok',
  OUT_OF_SCOPE_SECURITY: 'warn',
  INELIGIBLE: 'warn',
});

function tone(state: string): string {
  return STATE_TONE[state] ?? 'bad';
}

/**
 * IID WI-1 (P4): the holding context a coverage row can legitimately carry. `portfolioId` is the portfolio the
 * server observed the row in (null for a watchlist or broker-preview row) and `securityId` is the resolved
 * binding's own security. A null stays absent: no portfolio is assumed and no security is constructed.
 */
function rowContext(item: CoverageItemView): { portfolioId?: string; securityId?: string } {
  return {
    ...(item.portfolioId === null ? {} : { portfolioId: item.portfolioId }),
    ...(item.binding.securityId === null ? {} : { securityId: item.binding.securityId }),
  };
}

/**
 * IID-6: an identity that is known becomes a way IN, and an identity that is not known offers nothing to click.
 *
 * The links are the only reason this cell knows about routing: `RESOLVED` + `assessable` opens the stored company
 * assessment for the issuer, and every known securityId opens the candidate view (which itself says whether a
 * disposition exists). Nothing here decides that an assessment exists — the destination page reports that honestly.
 */
function IdentityCell({ item }: { readonly item: CoverageItemView }): JSX.Element {
  const { binding } = item;
  if (item.state === 'RESOLVED') {
    return (
      <div className="identity">
        <code>{binding.issuerId}</code>
        <code>{binding.securityId}</code>
        <code>{binding.listingId}</code>
        <span className="muted">via {binding.resolutionBasis === 'ISIN' ? 'ISIN' : 'exchange symbol'}</span>
        {binding.issuerId !== null && binding.assessable ? (
          <span>
            {/*
              IID WI-1 (P4): a coverage row knows which portfolio observed it. Carrying that portfolio and the
              row's security means the company page can render THIS holding's disposition instead of reporting
              that no context was supplied. Both come from the server's binding — neither is derived here.
            */}
            <Link to={companyAssessmentHref(binding.issuerId, rowContext(item))}>Company assessment →</Link>{' '}
            <Link to={changeHistoryHref(binding.issuerId, rowContext(item))}>Change history →</Link>
          </span>
        ) : null}
        {binding.securityId !== null ? (
          <span>
            <Link to={candidateAssessmentHref(binding.securityId, item.portfolioId ?? undefined)}>
              Candidate view →
            </Link>
          </span>
        ) : null}
      </div>
    );
  }
  if (binding.issuerId !== null) {
    return (
      <div className="identity">
        <code>{binding.issuerId}</code>
        <span className="muted">identity known, not assessed</span>
        <span>
          <Link to={companyAssessmentHref(binding.issuerId, rowContext(item))}>Company assessment →</Link>
        </span>
      </div>
    );
  }
  return <span className="muted">no identity</span>;
}

function RawCell({ item }: { readonly item: CoverageItemView }): JSX.Element {
  const entries = Object.entries(item.raw);
  return (
    <div>
      {item.reasonText !== null && <p className="reason">{item.reasonText}</p>}
      {item.detail !== null && <p className="muted">{item.detail}</p>}
      {item.candidates.length > 0 && <p className="muted">candidates: {item.candidates.join(', ')}</p>}
      {entries.length > 0 && (
        <pre className="raw">
          {entries.map(([key, value]) => `${key}=${String(value)}`).join('\n')}
        </pre>
      )}
    </div>
  );
}

export default function InvestmentCoveragePage(): JSX.Element {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchInvestmentCoverage()
      .then((report) => {
        if (!cancelled) setState({ kind: 'ready', report });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof CoverageUnavailableError) {
          setState({ kind: 'unavailable', message: error.message, issues: error.issues });
          return;
        }
        setState({ kind: 'error', message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === 'loading') {
    return <p role="status">Loading identity coverage…</p>;
  }

  if (state.kind === 'error') {
    return (
      <section>
        <h1>Identity coverage</h1>
        <p role="alert">The coverage report could not be loaded: {state.message}</p>
      </section>
    );
  }

  if (state.kind === 'unavailable') {
    return (
      <section>
        <h1>Identity coverage is unavailable</h1>
        <p role="alert">{state.message}</p>
        <p className="muted">
          No identity can be established without the eligible roster, listing map and corporate-action
          table, so no row is classified. Nothing is guessed and no substitute roster is used.
        </p>
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Code</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {state.issues.map((issue, index) => (
              <tr key={`${issue.file}-${index}`}>
                <td>
                  <code>{issue.file}</code>
                </td>
                <td>{issue.code}</td>
                <td>{issue.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  const { report } = state;
  const states = Object.keys(report.counts).filter((key) => key !== 'observed' && key !== 'assessable');

  return (
    <section className="investment-coverage">
      <header>
        <h1>Investment coverage</h1>
        <p className="muted">
          as of {report.asOf} · roster {report.identitySources.rosterLabel} (
          {report.identitySources.rosterDataClass})
        </p>
        <p>
          <strong>{report.statusLine}</strong>
        </p>
      </header>

      <h2>Counts</h2>
      <table>
        <thead>
          <tr>
            <th>State</th>
            <th>Rows</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>observed</td>
            <td>{report.counts.observed}</td>
          </tr>
          <tr>
            <td>assessable</td>
            <td>{report.counts.assessable}</td>
          </tr>
          {states.map((key) => (
            <tr key={key}>
              <td className={tone(key)}>{key}</td>
              <td>{report.counts[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>By source</h2>
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Observed</th>
            <th>Resolved</th>
            <th>Unresolved</th>
            <th>Assessable</th>
          </tr>
        </thead>
        <tbody>
          {(Object.keys(report.bySource) as (keyof typeof report.bySource)[]).map((source) => (
            <tr key={source}>
              <td>{source}</td>
              <td>{report.bySource[source].observed}</td>
              <td>{report.bySource[source].resolved}</td>
              <td>{report.bySource[source].unresolved}</td>
              <td>{report.bySource[source].assessable}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Every observed row</h2>
      <table>
        <thead>
          <tr>
            <th>State</th>
            <th>Source</th>
            <th>Identity</th>
            <th>Reason and raw observation</th>
          </tr>
        </thead>
        <tbody>
          {report.items.map((item) => (
            <tr key={item.observationId} data-observation-id={item.observationId} data-state={item.state}>
              <td className={tone(item.state)}>
                {item.state}
                {item.reason !== null && <div className="muted">{item.reason}</div>}
              </td>
              <td>
                {item.source}
                {item.portfolioId !== null && <div className="muted">{item.portfolioId}</div>}
              </td>
              <td>
                <IdentityCell item={item} />
              </td>
              <td>
                <RawCell item={item} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {report.successorReconciliations.length > 0 && (
        <>
          <h2>Corporate-action successor reconciliation</h2>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Type</th>
                <th>Effective</th>
                <th>Slices</th>
                <th>Measured</th>
                <th>Unmeasured</th>
              </tr>
            </thead>
            <tbody>
              {report.successorReconciliations.map((reconciliation) => (
                <tr key={reconciliation.actionId}>
                  <td>{reconciliation.actionId}</td>
                  <td>{reconciliation.type}</td>
                  <td>{reconciliation.effectiveDate}</td>
                  <td>
                    {reconciliation.slices.map((slice, index) => (
                      <div key={`${reconciliation.actionId}-${index}`} className={slice.mapped ? '' : 'warn'}>
                        {slice.mapped ? slice.issuerId : `UNMAPPED slice (${slice.issuerId ?? 'unknown'})`} @{' '}
                        {slice.ratio}
                      </div>
                    ))}
                  </td>
                  <td>{reconciliation.measuredWeight}</td>
                  <td>{reconciliation.unmeasuredWeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h2>Financial coverage is not identity coverage</h2>
      <table>
        <tbody>
          <tr>
            <td>Sectors measured</td>
            <td>
              {report.financialCoverage.measuredSectors} of {report.financialCoverage.totalSectors}
            </td>
          </tr>
          <tr>
            <td>Outstanding sectors</td>
            <td>{report.financialCoverage.outstandingSectors.join(', ') || 'none'}</td>
          </tr>
          <tr>
            <td>Methods usable / withheld</td>
            <td>
              {report.financialCoverage.usableMethods} / {report.financialCoverage.withheldMethods}
            </td>
          </tr>
          <tr>
            <td>XBRL tags mapped</td>
            <td>{report.financialCoverage.xbrlMappedTags}</td>
          </tr>
          <tr>
            <td>Derivable line items</td>
            <td>{report.financialCoverage.derivationItems}</td>
          </tr>
          <tr>
            <td>Dataset</td>
            <td>{report.financialCoverage.datasetClass}</td>
          </tr>
        </tbody>
      </table>
      <p className="muted">{report.financialCoverage.note}</p>

      <h2>Dataset freshness</h2>
      <table>
        <caption>What this coverage read was computed from, and how old it is</caption>
        <tbody>
          <tr>
            <th scope="row">Coverage as of</th>
            <td>{report.asOf}</td>
          </tr>
          <tr>
            <th scope="row">Report generated at</th>
            <td>{report.generatedAt}</td>
          </tr>
          <tr>
            <th scope="row">Identity roster</th>
            <td>
              {report.identitySources.rosterLabel} ({report.identitySources.rosterDataClass}) ·{' '}
              <code>{report.identitySources.rosterVersion.slice(0, 16)}…</code>
            </td>
          </tr>
          <tr>
            <th scope="row">Listing map</th>
            <td>
              <code>{report.identitySources.listingMapVersion.slice(0, 16)}…</code>
            </td>
          </tr>
          <tr>
            <th scope="row">Corporate actions</th>
            <td>
              <code>{report.identitySources.corporateActionTableVersion.slice(0, 16)}…</code>
            </td>
          </tr>
          <tr>
            <th scope="row">Financial dataset class</th>
            <td>{report.financialCoverage.datasetClass}</td>
          </tr>
        </tbody>
      </table>
      <p className="muted">
        Per-security statement freshness is a fact about a stored assessment, not about this coverage read. It is
        shown on each company page as <code>dataAsOf</code>, <code>knownAsOf</code> and the staleness verdict; this
        page does not estimate it for a security it has not assessed.
      </p>

      <h2>Boundary coverage and missing explanations</h2>
      <p className="muted">
        Boundary coverage is a property of one company&rsquo;s assessment chain: it counts the consecutive version
        pairs that have a stored explanation. There is no cross-issuer boundary read model, so this page does not
        total it — a total it could not compute would be a fabricated number. Open a company&rsquo;s change history to
        see its coverage and any missing explanation; the identity rows above link to each known issuer.
      </p>
      <p className="muted">
        Filling a missing explanation is an operator reconciliation action against the governed store
        (<code>ChangeService.reconcile</code>, report kind <code>VERSION_BOUNDARY_RECONSTRUCTED</code>). It is not
        exposed to the browser and no surface here can trigger it.
      </p>

      <h2>Notes</h2>
      <ul>
        {report.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
}
