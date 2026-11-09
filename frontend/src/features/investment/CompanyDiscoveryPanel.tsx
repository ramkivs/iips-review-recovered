/**
 * IID WI-2 (P2) — company discovery, mounted inside the existing `/investment` landing page.
 *
 * WHAT CHANGED FOR THE READER. WI-1 could only open an assessment for an opaque identifier the operator already
 * held. This panel lets the reader FIND a company by name or identifier, see which governed company matched, and
 * open its Stock Intelligence assessment — then continue through disposition and historical changes on the
 * existing surfaces.
 *
 * THE SERVER MATCHES; THIS PANEL ONLY DISPLAYS. The query is sent verbatim to `/api/investment/companies`. Every
 * `issuerId` rendered here came from the governed roster via that response. Nothing is classified, constructed or
 * inferred in the browser, and a display name is never turned into an identity.
 *
 * THREE AVAILABILITY STATES, HONESTLY. A match may have a stored assessment, may have none, or may be of UNKNOWN
 * availability because the governed store did not answer. "Unknown" is never rendered as "none": the reader is
 * told the difference, and can still open the company surface, which reports its own read result.
 *
 * INDEPENDENT OF COVERAGE. This calls the discovery endpoint only. Coverage is not consulted, so a coverage 503
 * cannot remove company discovery.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  CompanyDiscoveryError,
  DISCOVERY_UNAVAILABLE_COPY,
  searchCompanies,
  type CompanyDirectoryResult,
  type CompanyMatch,
} from '../../api/investmentDiscovery';
import { changeHistoryHref, companyAssessmentHref, type InvestmentContext } from './investmentContext';

type DiscoveryState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly result: CompanyDirectoryResult }
  | { readonly kind: 'failed'; readonly message: string };

/** What the reader is told about assessment availability. `UNKNOWN` is deliberately not collapsed into `NONE`. */
export function availabilityCopy(match: CompanyMatch): string {
  switch (match.assessment) {
    case 'AVAILABLE':
      return `Stored assessment available${match.versionCount === null ? '' : ` · ${String(match.versionCount)} version${match.versionCount === 1 ? '' : 's'}`}`;
    case 'NONE':
      return 'Known company — no assessment has been recorded yet';
    case 'DAMAGED':
      return 'A stored assessment exists but failed validation; it will not be served';
    case 'UNKNOWN':
    default:
      return 'Assessment availability could not be checked — the governed store did not answer';
  }
}

export function CompanyDiscoveryPanel({ context = {} }: { readonly context?: InvestmentContext }): JSX.Element {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<DiscoveryState>({ kind: 'idle' });

  const run = async (value: string): Promise<void> => {
    setState({ kind: 'loading' });
    try {
      const result = await searchCompanies(value);
      setState({ kind: 'ready', result });
    } catch (error) {
      setState({
        kind: 'failed',
        message:
          error instanceof CompanyDiscoveryError
            ? DISCOVERY_UNAVAILABLE_COPY[error.reason]
            : DISCOVERY_UNAVAILABLE_COPY.unrecognised,
      });
    }
  };

  return (
    <div>
      <form
        aria-label="Find a company"
        onSubmit={(event) => {
          event.preventDefault();
          void run(query);
        }}
      >
        <label htmlFor="iid-company-query">Company name or identifier</label>{' '}
        <input
          id="iid-company-query"
          name="q"
          type="search"
          value={query}
          placeholder="Company name, ISIN, CIN or NSE:SYMBOL"
          onChange={(event) => setQuery(event.target.value)}
        />{' '}
        <button type="submit" disabled={query.trim().length < 2 || state.kind === 'loading'}>
          Find company
        </button>
      </form>
      <p className="muted">
        Matching is performed by the server against the governed eligible roster. A name selects a governed
        record; the record supplies the company identity. Nothing is classified in this page.
      </p>

      {state.kind === 'idle' ? (
        <p className="muted">Search for a company to open its Stock Intelligence assessment.</p>
      ) : null}

      {state.kind === 'loading' ? <p role="status">Searching the governed roster…</p> : null}

      {state.kind === 'failed' ? <p role="alert">{state.message}</p> : null}

      {state.kind === 'ready' ? (
        <div>
          {state.result.directory.rosterDataClass === 'SYNTHETIC_FIXTURE' ? (
            <p role="note" className="muted">
              The served roster is a synthetic fixture, not live market coverage.
            </p>
          ) : null}
          {state.result.directory.assessmentAvailabilityUnavailableReason === null ? null : (
            <p role="note" className="muted">
              {state.result.directory.assessmentAvailabilityUnavailableReason}
            </p>
          )}
          {state.result.matches.length === 0 ? (
            <p role="note">
              No governed company matched “{state.result.query}”. No company was invented and no identifier was
              constructed from the text. Try a different name, or an ISIN, CIN or EXCHANGE:SYMBOL.
            </p>
          ) : (
            <>
              <table>
                <caption>
                  Governed companies matching “{state.result.query}” ({state.result.totalMatched})
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Company</th>
                    <th scope="col">Issuer identity</th>
                    <th scope="col">Sector</th>
                    <th scope="col">Matched by</th>
                    <th scope="col">Assessment</th>
                    <th scope="col">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {state.result.matches.map((match) => (
                    <tr key={match.issuerId}>
                      <th scope="row">{match.legalName}</th>
                      <td>
                        <code>{match.issuerId}</code>
                        <div className="muted">
                          {match.cin === null ? 'CIN not recorded' : `CIN ${match.cin}`}
                          {match.equityIsin === null ? '' : ` · ISIN ${match.equityIsin}`}
                        </div>
                      </td>
                      <td>{match.sector}</td>
                      <td>
                        {match.matchedBy === 'LEGAL_NAME'
                          ? 'company name'
                          : match.matchedBy === 'ISSUER_ID'
                            ? 'issuer id'
                            : 'governed identifier'}
                      </td>
                      <td>{availabilityCopy(match)}</td>
                      <td>
                        {/* The href is built from the SERVER's issuer id, never from the name the reader typed. */}
                        <Link to={companyAssessmentHref(match.issuerId, context)}>Stock Intelligence →</Link>{' '}
                        <Link to={changeHistoryHref(match.issuerId, context)}>Change history →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {state.result.truncated ? (
                <p className="muted">
                  Showing the first {state.result.matches.length} of {state.result.totalMatched} matches. Refine
                  the query to narrow it.
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default CompanyDiscoveryPanel;
