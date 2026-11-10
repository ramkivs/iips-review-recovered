/**
 * IID-01 — Stock Intelligence, the independent capability workspace at `/investment/stock-intelligence`.
 *
 * WHAT IT IS. The company assessment workflow as a working area of its own: find a governed company,
 * open its stored assessment, and read its fundamentals, reporting periods, valuation methods and
 * results, risk factors, evidence, limitations and version context.
 *
 * IT REBUILDS NOTHING. The assessment rendering is the EXISTING `CompanyAssessmentPage`, mounted
 * with the selected issuer. The discovery panel is the EXISTING `CompanyDiscoveryPanel`, which
 * searches the governed eligible roster server-side. There is one implementation of the assessment
 * renderer, not two.
 *
 * IT INVENTS NOTHING. A company is selected either from a governed discovery result (the server's
 * own `issuerId`) or from an issuer id the reader already holds. The reader's issuer id is never
 * derived from a display name, and no assessment data is computed in the browser.
 *
 * THE SELECTION IS ADDRESSABLE. The selected issuer lives in the query string, so the workspace can
 * be refreshed, bookmarked, shared or reached from a sibling capability and still open the same
 * company with the same holding context.
 *
 * IT IS NOT INVESTMENT COVERAGE. Coverage reports identity resolution over observed rows; this is a
 * company assessment over one issuer. The two are independent reads and neither substitutes for the
 * other.
 */
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import CapabilityBreadcrumb from './CapabilityBreadcrumb';
import CompanyAssessmentPage from './CompanyAssessmentPage';
import CompanyDiscoveryPanel from './CompanyDiscoveryPanel';
import { ReadOnlyDisclosure, SurfaceSection } from './InvestmentStates';
import { readInvestmentContext, stockIntelligenceHref, type InvestmentContext } from './investmentContext';

/** Trimmed, or null when the reader supplied nothing. Never a fabricated identifier. */
function entered(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export default function StockIntelligencePage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  // The context is the EXISTING workflow context: portfolio, security and assessment version.
  const context: InvestmentContext = readInvestmentContext(searchParams);
  // The selected issuer is workspace state, and it is addressable: it lives in the query string.
  const selectedIssuer = entered(searchParams.get('issuerId') ?? '');
  const [issuerInput, setIssuerInput] = useState('');

  /**
   * Select an issuer. The issuer id is written into the query string so the selection survives a
   * refresh, a bookmark, a shared link and a move to a sibling capability. Every other parameter is
   * preserved, so the holding context the reader arrived with is not discarded.
   */
  const selectIssuer = (issuerId: string): void => {
    const next = new URLSearchParams(searchParams);
    next.set('issuerId', issuerId);
    setSearchParams(next);
  };

  return (
    <section className="stock-intelligence">
      <header>
        <h1>IID-01 — Stock Intelligence</h1>
        <p className="muted">
          Company intelligence over one stored assessment version: fundamentals and reporting periods, valuation
          methods and results, risk factors, assessment evidence and limitations, and the version the reading came
          from.
        </p>
        <ReadOnlyDisclosure />
        <CapabilityBreadcrumb current="stockIntelligence" context={context} issuerId={selectedIssuer} />
      </header>

      <SurfaceSection
        id="stock-discovery"
        title="Find a company"
        description="Search the governed eligible roster by company name or supported identifier. The server matches; this page never classifies."
      >
        <CompanyDiscoveryPanel context={context} />
        <h3>Or open an issuer id you already hold</h3>
        <form
          aria-label="Open a company assessment"
          onSubmit={(event) => {
            event.preventDefault();
            const issuer = entered(issuerInput);
            if (issuer === null) return;
            selectIssuer(issuer);
          }}
        >
          <label htmlFor="stock-issuer">Issuer id</label>{' '}
          <input
            id="stock-issuer"
            name="issuerId"
            type="text"
            value={issuerInput}
            placeholder="IN:CIN:… or IN:EQISIN:…"
            onChange={(event) => setIssuerInput(event.target.value)}
          />{' '}
          <button type="submit" disabled={entered(issuerInput) === null}>
            Open company assessment
          </button>
        </form>
        <p className="muted">
          The issuer id is the IID-0 identity the server resolved, not a ticker and not a sector. The portfolio and
          security below are optional context and open the same assessment with that holding&rsquo;s disposition
          beside it.
        </p>
      </SurfaceSection>

      {selectedIssuer === null ? (
        <SurfaceSection
          id="stock-assessment"
          title="Company assessment"
          description="No company is selected yet."
        >
          <p role="status">
            Choose a company above to open its stored assessment. Nothing is shown until a governed company has
            been selected, and no company is inferred from the text typed into the search box.
          </p>
        </SurfaceSection>
      ) : (
        <>
          <SurfaceSection
            id="stock-assessment"
            title="Company assessment"
            description="The stored assessment for the selected company, with its own version context."
          >
            <p className="muted">
              Selected issuer <code>{selectedIssuer}</code>.{' '}
              {/*
                Clearing drops the issuer but KEEPS the holding context, so the reader returns to
                the empty state of this workspace with the portfolio and security they arrived with.
              */}
              <Link to={stockIntelligenceHref(context)}>Clear the selection</Link>
            </p>
            {/*
              THE EXISTING ASSESSMENT SURFACE, MOUNTED WITH THE SELECTED ISSUER.

              There is one assessment renderer. The `/investment/company/:issuerId` route and this
              workspace render the same component, so the assessment's rules cannot drift between
              them.
            */}
            <CompanyAssessmentPage issuerId={selectedIssuer} />
          </SurfaceSection>
        </>
      )}
    </section>
  );
}
