/**
 * IID — the Investment Coverage surface.
 *
 * WHAT THIS PAGE IS
 *   The investment-coverage position of the served dataset: which issuers the dataset holds, what
 *   financials exist for each, which sectors have been measured, and what is outstanding. It
 *   answers a question about the DATA.
 *
 * WHAT THIS PAGE IS NOT
 *   It is not the Identity Coverage page. Identity Coverage answers a question about a ROW — does
 *   this observed holding have a defensible issuer/security/listing — and it fails closed when the
 *   eligible roster, listing map or corporate-action table cannot be loaded. That surface is
 *   `IdentityCoveragePage` and its fail-closed behaviour is unchanged.
 *
 *   Previously both menu entries rendered ONE component whose failure branches were all
 *   identity-worded, so an absent identity roster replaced the whole investment-coverage page with
 *   "Identity coverage is unavailable". The two are now separate reads with separate contracts and
 *   separate states.
 *
 * THE IDENTITY DEPENDENCY IS DISCLOSED, NOT ENFORCED
 *   Where the identity sources could not be loaded, that is disclosed in the dataset disclosure and
 *   on each affected issuer row (`identityDependency`). It never becomes a page-level failure: the
 *   investment-coverage position of the dataset is unaffected by an identity file being absent.
 */
import { useEffect, useState } from 'react';

import {
  fetchInvestmentCoverageInvestment,
  InvestmentCoverageUnavailableError,
  type InvestmentCoverageIssuerRow,
  type InvestmentCoverageReport,
} from '../../api/investmentCoverageInvestment';

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly report: InvestmentCoverageReport }
  | {
      readonly kind: 'unavailable';
      readonly message: string;
      readonly issues: readonly { readonly code: string; readonly subject: string; readonly detail: string }[];
    }
  | { readonly kind: 'error'; readonly message: string };

const STATE_TONE: Readonly<Record<string, string>> = Object.freeze({
  COVERED: 'ok',
  NO_FINANCIALS: 'warn',
  SECTOR_NOT_MEASURED: 'warn',
  ISSUED_DATA: 'bad',
});

function tone(state: string): string {
  return STATE_TONE[state] ?? 'bad';
}

/**
 * The identity dependency of one issuer row, disclosed in place.
 *
 * `null` is rendered as "not evaluated" — the identity sources were absent, so no binding could be
 * checked. It is never rendered as "no dependency": those are different statements.
 */
function IdentityDependencyCell({ row }: { readonly row: InvestmentCoverageIssuerRow }): JSX.Element {
  if (row.identityDependency === null) {
    return (
      <span className="muted">
        not evaluated
        {row.identityDependencyDetail !== null && <div className="muted">{row.identityDependencyDetail}</div>}
      </span>
    );
  }
  if (row.identityDependency === 'UNRESOLVED') {
    return (
      <span className="warn">
        unresolved
        {row.identityDependencyDetail !== null && <div className="muted">{row.identityDependencyDetail}</div>}
      </span>
    );
  }
  return <span className="ok">resolved</span>;
}

export default function InvestmentCoveragePage(): JSX.Element {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchInvestmentCoverageInvestment()
      .then((report) => {
        if (!cancelled) setState({ kind: 'ready', report });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof InvestmentCoverageUnavailableError) {
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
    return <p role="status">Loading investment coverage…</p>;
  }

  if (state.kind === 'error') {
    return (
      <section>
        <h1>Investment coverage</h1>
        <p role="alert">The investment coverage could not be loaded: {state.message}</p>
      </section>
    );
  }

  if (state.kind === 'unavailable') {
    return (
      <section>
        <h1>Investment coverage is unavailable</h1>
        <p role="alert">{state.message}</p>
        <p className="muted">
          The investment dataset could not be read, so no investment coverage could be computed. This is an
          investment-data problem, not an identity-source problem: identity coverage is a separate read and is
          unaffected either way.
        </p>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {state.issues.map((issue, index) => (
              <tr key={`${issue.code}-${index}`}>
                <td>{issue.code}</td>
                <td>{issue.subject}</td>
                <td>{issue.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  const { report } = state;
  const datasetAbsent = report.dataset.datasetClass === 'NONE';
  const states = ['COVERED', 'NO_FINANCIALS', 'SECTOR_NOT_MEASURED', 'ISSUED_DATA'] as const;

  return (
    <section className="investment-coverage">
      <header>
        <h1>Investment coverage</h1>
        <p className="muted">
          as of {report.asOf} · dataset {report.dataset.datasetVersion} (
          {report.dataset.datasetClass})
        </p>
        <p>
          <strong>{report.statusLine}</strong>
        </p>
      </header>

      {/*
        THE IDENTITY DISCLOSURE.

        This is the row-and-field-level disclosure the requirement calls for: when the identity
        sources could not be loaded, the fact is stated here and on each affected issuer row. It is
        NOT a page-level failure and it never hides the investment-coverage position below.
      */}
      {!report.identitySourcesAvailable && (
        <section data-testid="identity-dependency-disclosure" className="warn">
          <h2>Identity sources are unavailable</h2>
          <p>
            The eligible roster, listing map or corporate-action table could not be loaded, so no identity
            binding could be evaluated for any issuer. This does not change the investment coverage below: it
            describes the dataset, and the dataset does not depend on an identity file.
          </p>
          {report.identitySourceDetail !== null && <p className="muted">{report.identitySourceDetail}</p>}
          <p className="muted">
            An identity-scoped assessment of an issuer cannot be opened while this holds. Open Identity Coverage
            for the governed identity position.
          </p>
        </section>
      )}

      <h2>Dataset</h2>
      <table>
        <tbody>
          <tr>
            <td>Dataset class</td>
            <td>{report.dataset.datasetClass}</td>
          </tr>
          {report.dataset.sourceRights !== undefined && report.dataset.sourceRights !== null && (
            <tr>
              <td>Source rights</td>
              <td>
                {report.dataset.sourceRights.state}
                {report.dataset.sourceRights.basis !== '' && (
                  <div className="muted">{report.dataset.sourceRights.basis}</div>
                )}
              </td>
            </tr>
          )}
          <tr>
            <td>Dataset version</td>
            <td>
              <code>{report.dataset.datasetVersion.slice(0, 16)}…</code>
            </td>
          </tr>
          <tr>
            <td>Content digest</td>
            <td>
              <code>{report.dataset.contentDigest.slice(0, 16)}…</code>
            </td>
          </tr>
          <tr>
            <td>Provider</td>
            <td>{report.dataset.provider}</td>
          </tr>
          <tr>
            <td>Licence</td>
            <td>{report.dataset.licence}</td>
          </tr>
          <tr>
            <td>Quality</td>
            <td>{report.dataset.quality}</td>
          </tr>
          <tr>
            <td>Completeness</td>
            <td>{report.dataset.completenessPct}%</td>
          </tr>
          <tr>
            <td>Data as of / known as of</td>
            <td>
              {report.dataset.dataAsOf ?? 'unknown'} / {report.dataset.knownAsOf ?? 'unknown'}
            </td>
          </tr>
          <tr>
            <td>Imported at</td>
            <td>{report.dataset.lastImportAt}</td>
          </tr>
          <tr>
            <td>Issuers / securities / listings</td>
            <td>
              {report.dataset.issuers} / {report.dataset.securities} / {report.dataset.listings}
            </td>
          </tr>
          <tr>
            <td>Annual / quarterly periods</td>
            <td>
              {report.dataset.annualPeriods} / {report.dataset.quarterlyPeriods}
            </td>
          </tr>
          <tr>
            <td>Prices / operating metrics / corporate actions</td>
            <td>
              {report.dataset.prices} / {report.dataset.operatingMetricRecords} / {report.dataset.corporateActions}
            </td>
          </tr>
          <tr>
            <td>Earliest / latest period end</td>
            <td>
              {report.dataset.earliestPeriodEnd ?? 'none'} / {report.dataset.latestPeriodEnd ?? 'none'}
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Counts</h2>
      <table>
        <thead>
          <tr>
            <th>State</th>
            <th>Issuers</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>observed</td>
            <td>{report.counts.observed}</td>
          </tr>
          {states.map((key) => (
            <tr key={key}>
              <td className={tone(key)}>{key}</td>
              <td>{report.counts[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Sector measurement</h2>
      <p className="muted">
        {report.measuredSectors} of {report.totalSectors} sector(s) measured.
        {report.outstandingSectors.length > 0 && (
          <> Outstanding: {report.outstandingSectors.join(', ')}.</>
        )}
      </p>
      <table>
        <thead>
          <tr>
            <th>Sector</th>
            <th>Stage</th>
            <th>Issuers</th>
          </tr>
        </thead>
        <tbody>
          {report.sectors.map((sector) => (
            <tr key={sector.sector} data-sector={sector.sector}>
              <td>{sector.sector}</td>
              <td>{sector.stage}</td>
              <td>{sector.issuerCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Issuer coverage</h2>
      {report.issuers.length === 0 ? (
        <p role="status">
          {datasetAbsent
            ? 'No investment dataset is installed, so no issuer is covered.'
            : 'The installed dataset declares no issuer, so no issuer is covered.'}
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>State</th>
              <th>Issuer</th>
              <th>Sector</th>
              <th>Periods</th>
              <th>Securities / prices / metrics</th>
              <th>Identity dependency</th>
            </tr>
          </thead>
          <tbody>
            {report.issuers.map((row) => (
              <tr key={row.issuerId} data-issuer-id={row.issuerId} data-state={row.state}>
                <td className={tone(row.state)}>
                  {row.state}
                  {row.issueCodes.length > 0 && <div className="muted">{row.issueCodes.join(', ')}</div>}
                </td>
                <td>
                  {row.legalName}
                  <div className="muted">
                    <code>{row.issuerId}</code>
                  </div>
                </td>
                <td>{row.sector}</td>
                <td>
                  {row.annualPeriods} annual / {row.quarterlyPeriods} quarterly
                  {row.latestPeriodEnd !== null && (
                    <div className="muted">latest {row.latestPeriodEnd}</div>
                  )}
                </td>
                <td>
                  {row.securities} / {row.prices} / {row.operatingMetrics}
                </td>
                <td>
                  <IdentityDependencyCell row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {report.issues.length > 0 && (
        <>
          <h2>Ingestion issues</h2>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {report.issues.map((issue, index) => (
                <tr key={`${issue.code}-${index}`}>
                  <td>{issue.code}</td>
                  <td>{issue.subject}</td>
                  <td>{issue.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h2>Financial coverage</h2>
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
