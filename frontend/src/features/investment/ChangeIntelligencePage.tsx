/**
 * IID-03 — Historical Change Intelligence, the independent capability workspace at
 * `/investment/change-intelligence`.
 *
 * WHAT IT IS. The historical intelligence workflow as a working area of its own: identify the issuer,
 * read its assessment version history, compare stored versions, and read the material changes, the
 * review triggers and the attribution behind them, with links to the exact stored versions being
 * compared.
 *
 * THE EXISTING "TWO VERSIONS" RULE IS PRESERVED, AND IT IS THE EXISTING RULE. A comparison requires
 * at least two stored versions; with fewer there is no pair to compare and nothing is invented to
 * fill the timeline. This workspace does not weaken, restate or re-implement that rule: it reads the
 * chain's stored versions and mounts the EXISTING `ChangeTimeline`, which enforces the rule itself
 * and renders the `no-history` state when it holds.
 *
 * IT REBUILDS NOTHING. The version history and the comparisons are rendered by the EXISTING
 * `ChangeTimeline`. The version LIST it needs is the one the company assessment already returns, so
 * the chain is read through the existing assessment endpoint rather than a second one.
 *
 * IT FABRICATES NO HISTORY. A version that is not stored is not shown; a pair that is not stored is
 * not compared; an attribution is the one the server recorded.
 *
 * THE SELECTION IS ADDRESSABLE. The issuer lives in the query string, as do the holding context and
 * the assessment version the reader was working with, so the workspace survives a refresh, a
 * bookmark or a move to a sibling capability.
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import CapabilityBreadcrumb from './CapabilityBreadcrumb';
import ChangeTimeline from './ChangeTimeline';
import CompanyDiscoveryPanel from './CompanyDiscoveryPanel';
import { ReadOnlyDisclosure, SurfaceSection } from './InvestmentStates';
import {
  AssessmentUnavailableError,
  ASSESSMENT_UNAVAILABLE_COPY,
  fetchCompanyAssessment,
  type AssessmentEnvelope,
} from '../../api/investment';
import { readInvestmentContext, type InvestmentContext } from './investmentContext';

type ChainState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly envelope: AssessmentEnvelope }
  | { readonly kind: 'unavailable'; readonly reason: keyof typeof ASSESSMENT_UNAVAILABLE_COPY }
  | { readonly kind: 'error'; readonly message: string };

/** Trimmed, or null when the reader supplied nothing. Never a fabricated identifier. */
function entered(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export default function ChangeIntelligencePage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const context: InvestmentContext = readInvestmentContext(searchParams);
  // The issuer is the subject of a change history, so it is addressed by issuer id.
  const issuerId = entered(searchParams.get('issuerId') ?? '');
  const [issuerInput, setIssuerInput] = useState('');

  const [chain, setChain] = useState<ChainState>({ kind: 'loading' });

  useEffect(() => {
    if (issuerId === null) {
      setChain({ kind: 'unavailable', reason: 'not-found' });
      return;
    }
    let cancelled = false;
    setChain({ kind: 'loading' });
    // The chain's stored versions are read through the EXISTING assessment endpoint. There is no
    // second history read, so the two surfaces cannot disagree about how many versions exist.
    fetchCompanyAssessment(issuerId, context.reportId)
      .then((envelope) => {
        if (!cancelled) setChain({ kind: 'ready', envelope });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof AssessmentUnavailableError) {
          setChain({ kind: 'unavailable', reason: error.reason });
          return;
        }
        setChain({ kind: 'error', message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [issuerId, context.reportId]);

  /** Select an issuer, preserving every other parameter. */
  const selectIssuer = (value: string): void => {
    const next = new URLSearchParams(searchParams);
    next.set('issuerId', value);
    setSearchParams(next);
  };

  const versions = chain.kind === 'ready' ? chain.envelope.versions : [];

  return (
    <section className="change-intelligence">
      <header>
        <h1>IID-03 — Historical Change Intelligence</h1>
        <p className="muted">
          The stored assessment history of one issuer: the versions that exist, the comparisons between consecutive
          stored versions, the material changes, the review triggers, and the attribution behind them.
        </p>
        <ReadOnlyDisclosure />
        <CapabilityBreadcrumb current="changeIntelligence" context={context} issuerId={issuerId} />
      </header>

      <SurfaceSection
        id="change-issuer"
        title="Identify the issuer"
        description="Choose a governed company, or open an issuer id you already hold."
      >
        <CompanyDiscoveryPanel context={context} />
        <h3>Or open an issuer id you already hold</h3>
        <form
          aria-label="Open historical changes"
          onSubmit={(event) => {
            event.preventDefault();
            const issuer = entered(issuerInput);
            if (issuer === null) return;
            selectIssuer(issuer);
          }}
        >
          <label htmlFor="change-issuer">Issuer id</label>{' '}
          <input
            id="change-issuer"
            name="issuerId"
            type="text"
            value={issuerInput}
            placeholder="IN:CIN:… or IN:EQISIN:…"
            onChange={(event) => setIssuerInput(event.target.value)}
          />{' '}
          <button type="submit" disabled={entered(issuerInput) === null}>
            Open historical changes
          </button>
        </form>
      </SurfaceSection>

      {/*
        THE VERSION HISTORY SECTION.

        The heading and the section are rendered ONCE, and only its CONTENT changes with the read
        state. The section is therefore always addressable and always names itself, whichever state
        the read is in — a reader who lands here mid-read sees the same section, not a different
        one.
      */}
      <SurfaceSection
        id="change-history"
        title="Version history"
        description="Every stored version of this chain. A comparison needs two of them."
      >
        {issuerId === null ? (
          <p role="status">
            No issuer is selected. Choose a company above to read its stored version history. Nothing is shown
            until a governed issuer has been selected, and no issuer is inferred from the text typed into the search
            box.
          </p>
        ) : chain.kind === 'loading' ? (
          <p role="status">Reading the stored version history…</p>
        ) : chain.kind === 'unavailable' ? (
          <>
            <p role="alert">{ASSESSMENT_UNAVAILABLE_COPY[chain.reason]}</p>
            <p className="muted">
              Nothing is substituted for a failed read: no cached history, no reconstructed comparison and no
              fallback store.
            </p>
          </>
        ) : chain.kind === 'error' ? (
          <p role="alert">{chain.message}</p>
        ) : (
          <>
            <p className="muted">
              Issuer <code>{issuerId}</code> · {versions.length} stored version
              {versions.length === 1 ? '' : 's'}
              {versions.length < 2 ? ' — a chain needs two stored versions before anything can be compared' : ''}
            </p>
            <table>
              <thead>
                <tr>
                  <th scope="col">Version</th>
                  <th scope="col">Report id</th>
                  <th scope="col">Generated</th>
                  <th scope="col">Data as of</th>
                  <th scope="col">Open</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version.reportId} data-report-id={version.reportId}>
                    <th scope="row">v{version.artifactVersion}</th>
                    <td>
                      <code>{version.reportId}</code>
                    </td>
                    <td>{version.generatedAt}</td>
                    <td>{version.dataAsOf}</td>
                    <td>
                      <Link
                        to={`/investment/change-intelligence?issuerId=${encodeURIComponent(issuerId)}${
                          context.portfolioId === undefined
                            ? ''
                            : `&portfolioId=${encodeURIComponent(context.portfolioId)}`
                        }${
                          context.securityId === undefined
                            ? ''
                            : `&securityId=${encodeURIComponent(context.securityId)}`
                        }&reportId=${encodeURIComponent(version.reportId)}`}
                      >
                        Open this version →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </SurfaceSection>

      {/*
        THE EXISTING TIMELINE, MOUNTED WITH THE CHAIN'S STORED VERSIONS.

        It enforces the two-version rule itself and renders the `no-history` state when it holds.
        The comparison links inside it address the exact stored versions being compared and carry
        the holding context, so moving between versions never loses the subject.
      */}
      {issuerId !== null && chain.kind === 'ready' ? (
        <ChangeTimeline issuerId={issuerId} versions={versions} context={context} />
      ) : null}
    </section>
  );
}
