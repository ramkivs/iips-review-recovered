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

function IdentityCell({ item }: { readonly item: CoverageItemView }): JSX.Element {
  const { binding } = item;
  if (item.state === 'RESOLVED') {
    return (
      <div className="identity">
        <code>{binding.issuerId}</code>
        <code>{binding.securityId}</code>
        <code>{binding.listingId}</code>
        <span className="muted">via {binding.resolutionBasis === 'ISIN' ? 'ISIN' : 'exchange symbol'}</span>
      </div>
    );
  }
  if (binding.issuerId !== null) {
    return (
      <div className="identity">
        <code>{binding.issuerId}</code>
        <span className="muted">identity known, not assessed</span>
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
        <h1>Investment identity coverage</h1>
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

      <h2>Notes</h2>
      <ul>
        {report.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
}
