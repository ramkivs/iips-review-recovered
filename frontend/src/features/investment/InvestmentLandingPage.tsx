/**
 * IID WI-1 (P1) — the Investment Intelligence landing surface, at the concrete route `/investment`.
 *
 * WHY IT EXISTS. IID-01 (stock intelligence), IID-02 (investment & holding decisions) and IID-03 (historical change
 * intelligence) were all implemented and reachable, but only through a link on a coverage row or a portfolio row.
 * Nothing in the product named them, so a reader could not tell the capabilities existed. This page names all
 * three, says what each one reads, and gives each a real way in.
 *
 * IT REBUILDS NOTHING. Every destination is an existing IID-6 surface: `CompanyAssessmentPage` (which already
 * renders fundamentals, valuation, risk, evidence, the held `DispositionPanel` and `ChangeTimeline`) and
 * `CandidateAssessmentPage` (which already renders the candidate `DispositionPanel`). This page only routes to them.
 *
 * IT DOES NOT DEPEND ON COVERAGE. There is no fetch here at all. Coverage is an all-or-nothing read that fails when
 * identity files, the IPD binding or the owner carrier are unavailable; discovery of the three capabilities must not
 * fail with it. Coverage and User Portfolios are offered as *where to find an identifier*, never as substitutes for
 * the capabilities themselves.
 *
 * DISCOVERY (IID WI-2 / P2). `CompanyDiscoveryPanel` searches the governed eligible roster server-side, so a
 * reader can FIND a company by name or identifier instead of already holding an opaque id. The opaque-identifier
 * forms below remain as an additional, precise entry method.
 *
 * NO CLIENT-SIDE CLASSIFICATION. Every issuer id this page navigates to came from the server — either resolved
 * from the roster by the discovery endpoint, or typed verbatim by the operator. This page never derives an issuer
 * from a security, never turns a display name into an identity, and never invents a portfolio.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ReadOnlyDisclosure, SurfaceSection } from './InvestmentStates';
import CompanyDiscoveryPanel from './CompanyDiscoveryPanel';
import {
  candidateAssessmentHref,
  changeHistoryHref,
  companyAssessmentHref,
} from './investmentContext';

/** Trimmed, or null when the operator supplied nothing. Never a fabricated identifier. */
function entered(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export default function InvestmentLandingPage(): JSX.Element {
  const navigate = useNavigate();
  const [issuerId, setIssuerId] = useState('');
  const [securityId, setSecurityId] = useState('');
  const [portfolioId, setPortfolioId] = useState('');

  const issuer = entered(issuerId);
  const security = entered(securityId);
  const portfolio = entered(portfolioId);

  return (
    <section className="investment-landing">
      <header>
        <h1>Investment Intelligence</h1>
        <p className="muted">
          Three read-only capabilities over the governed investment store: company assessment, investment and
          holding decisions, and historical change intelligence. They are one workflow — company → fundamentals →
          valuation → risk → disposition → portfolio impact → historical changes — and each stage keeps the company,
          assessment and holding context it was opened with.
        </p>
        <ReadOnlyDisclosure />
      </header>

      <SurfaceSection
        id="iid-01"
        title="IID-01 — Stock Intelligence"
        description="Company identification, fundamentals, valuation, risk, assessment evidence and limitations, read from one stored assessment version."
      >
        <p>
          Opens the stored company assessment for an issuer. The assessment states its own identity binding,
          reporting periods, valuation methods, risk factors, evidence and limitations; a missing value is shown
          with its reason and never as zero.
        </p>
        {/* IID WI-2 (P2): find a company first. This reads the discovery endpoint only, never Coverage. */}
        <CompanyDiscoveryPanel />
        <h3>Or open an identifier you already hold</h3>
        <form
          aria-label="Open a company assessment"
          onSubmit={(event) => {
            event.preventDefault();
            if (issuer === null) return;
            navigate(
              companyAssessmentHref(issuer, {
                ...(portfolio === null ? {} : { portfolioId: portfolio }),
                ...(security === null ? {} : { securityId: security }),
              }),
            );
          }}
        >
          <label htmlFor="iid-issuer">Issuer id</label>{' '}
          <input
            id="iid-issuer"
            name="issuerId"
            type="text"
            value={issuerId}
            placeholder="IN:CIN:… or IN:EQISIN:…"
            onChange={(event) => setIssuerId(event.target.value)}
          />{' '}
          <button type="submit" disabled={issuer === null}>
            Open company assessment
          </button>
        </form>
        <p className="muted">
          The issuer id is the IID-0 identity the server resolved, not a ticker and not a sector. Supplying the
          optional portfolio and security below opens the same assessment with that holding&rsquo;s disposition
          beside it.
        </p>
      </SurfaceSection>

      <SurfaceSection
        id="iid-02"
        title="IID-02 — Investment & Holding Decisions"
        description="Candidate and held dispositions with their rationale, gates, limits in force, portfolio context and implication."
      >
        <p>
          A <strong>held</strong> decision is keyed by a portfolio and a security and is read beside the company
          assessment. A <strong>candidate</strong> is a security that is not held: it has no position, no quantity
          and no portfolio weight, and it is reachable without any portfolio.
        </p>
        <form
          aria-label="Open a candidate decision"
          onSubmit={(event) => {
            event.preventDefault();
            if (security === null) return;
            navigate(candidateAssessmentHref(security, portfolio ?? undefined));
          }}
        >
          <label htmlFor="iid-security">Security id</label>{' '}
          <input
            id="iid-security"
            name="securityId"
            type="text"
            value={securityId}
            placeholder="IN:ISIN:…"
            onChange={(event) => setSecurityId(event.target.value)}
          />{' '}
          <label htmlFor="iid-portfolio">Portfolio id (optional)</label>{' '}
          <input
            id="iid-portfolio"
            name="portfolioId"
            type="text"
            value={portfolioId}
            onChange={(event) => setPortfolioId(event.target.value)}
          />{' '}
          <button type="submit" disabled={security === null}>
            Open candidate decision
          </button>
        </form>
        <p>
          For a held decision, open the portfolio and choose the holding — its row carries the portfolio and
          security context into the assessment:{' '}
          <Link to="/user-portfolios">User portfolios →</Link>
        </p>
        <p className="muted">
          No decision is created here. Every disposition is produced by the operator CLI against the governed
          store; these surfaces read the stored result or state that none exists.
        </p>
      </SurfaceSection>

      <SurfaceSection
        id="iid-03"
        title="IID-03 — Historical Change Intelligence"
        description="Assessment version history, comparisons between stored versions, material changes, review triggers and attribution."
      >
        <p>
          Opens the same company assessment scrolled to its change history. Comparisons are computed on read from
          two or more stored versions; each pair can be opened at the exact stored version it compares.
        </p>
        <form
          aria-label="Open historical changes"
          onSubmit={(event) => {
            event.preventDefault();
            if (issuer === null) return;
            navigate(
              changeHistoryHref(issuer, {
                ...(portfolio === null ? {} : { portfolioId: portfolio }),
                ...(security === null ? {} : { securityId: security }),
              }),
            );
          }}
        >
          <button type="submit" disabled={issuer === null}>
            Open historical changes
          </button>
          <span className="muted"> Uses the issuer id entered above.</span>
        </form>
        <p className="muted">
          A chain with fewer than two stored versions has no pair to compare, and the timeline says so rather than
          inventing a history.
        </p>
      </SurfaceSection>

      <SurfaceSection
        id="finding-identifiers"
        title="Where to find an identifier"
        description="These surfaces list what the server has already resolved. They are entry aids, not the three capabilities."
      >
        <ul>
          <li>
            <Link to="/user-portfolios">User portfolios →</Link> — each resolved holding links to its company
            assessment, its held decision and its change history, carrying the portfolio and security context.
          </li>
          <li>
            <Link to="/investment/coverage">Investment coverage →</Link> — every observed row and its resolution
            state. Coverage reports identity resolution only; it is not a company assessment, not a decision and
            not a change history, and it is unavailable whenever its own sources cannot be read.
          </li>
        </ul>
        <p className="muted">
          The three capabilities are named on this page without any read, so they stay discoverable even when
          coverage, portfolios or the owner context are unavailable. Company discovery reads the governed
          identity files directly and does not depend on Investment Coverage succeeding.
        </p>
      </SurfaceSection>
    </section>
  );
}
