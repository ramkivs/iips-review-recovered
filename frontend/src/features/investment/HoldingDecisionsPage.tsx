/**
 * IID-02 — Investment & Holding Decisions, the independent capability workspace at
 * `/investment/holding-decisions`.
 *
 * WHAT IT IS. The investment decision workflow as a working area of its own: candidate security
 * decisions and held security decisions, with the portfolio and security context of a held position,
 * the disposition and its rationale, the gates and investment limits in force, the portfolio impact
 * and implications, and a link to the corresponding company assessment.
 *
 * THE CANDIDATE / HELD DISTINCTION IS PRESERVED, AND IT IS STRUCTURAL. A held decision is keyed by a
 * portfolio AND a security; a candidate is keyed by a security alone. They are two separate sections,
 * each with its own heading and its own read. A candidate is never presented as a portfolio holding:
 * the candidate panel is mounted with `kind="candidate"`, which is the existing component's own
 * switch, and that component renders no position, quantity, market value or portfolio weight for a
 * candidate because none exists.
 *
 * IT CREATES NOTHING. There is no control here that could record a decision, write a disposition or
 * append to any store. The verb shown is the one the operator CLI recorded against the governed
 * store; this page reads it or says that none exists.
 *
 * IT REBUILDS NOTHING. The disposition rendering is the EXISTING `DispositionPanel`, mounted with
 * the existing `held` / `candidate` kinds. The held list is the EXISTING portfolio-dispositions read;
 * the portfolio's holdings are the EXISTING holding-identities read.
 *
 * THE SELECTION IS ADDRESSABLE. The portfolio, the security and the held/candidate choice live in the
 * query string, so the workspace survives a refresh, a bookmark or a move to a sibling capability
 * with the subject intact.
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import CapabilityBreadcrumb from './CapabilityBreadcrumb';
import DispositionPanel from './DispositionPanel';
import { ReadOnlyDisclosure, SurfaceSection } from './InvestmentStates';
import {
  DispositionUnavailableError,
  DISPOSITION_UNAVAILABLE_COPY,
  fetchPortfolioDispositions,
  type PortfolioDispositionList,
} from '../../api/investmentDisposition';
import { readInvestmentContext, companyAssessmentHref, type InvestmentContext } from './investmentContext';

type HeldListState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly list: PortfolioDispositionList }
  | { readonly kind: 'unavailable'; readonly reason: string }
  | { readonly kind: 'error'; readonly message: string };

/** Trimmed, or null when the reader supplied nothing. Never a fabricated identifier. */
function entered(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export default function HoldingDecisionsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const context: InvestmentContext = readInvestmentContext(searchParams);
  const portfolioId = context.portfolioId ?? null;
  const securityId = context.securityId ?? null;
  /**
   * The issuer, when the reader arrived with one (from the landing page, from IID-01 or from IID-03).
   *
   * IID-02 is addressed by portfolio and security — a held decision is keyed by both — so the issuer
   * is CONTEXT here rather than the address. It is carried so that the company assessment behind the
   * decision is reachable, and so that moving to a sibling capability keeps the company.
   */
  const issuerId = entered(searchParams.get('issuerId') ?? '');

  /**
   * The held/candidate choice.
   *
   * It is explicit and it is addressable. `held` requires a portfolio AND a security, because a held
   * position is keyed by both; `candidate` requires a security alone. The default is `candidate` when
   * only a security is known, and `held` when a portfolio is known too — but the reader can always
   * say which one they mean, and the two sections below are always distinguished.
   */
  const requested = searchParams.get('subject');
  const subject: 'candidate' | 'held' = requested === 'held' || requested === 'candidate' ? requested : portfolioId !== null ? 'held' : 'candidate';

  const [heldList, setHeldList] = useState<HeldListState>({ kind: 'loading' });

  useEffect(() => {
    if (portfolioId === null) {
      setHeldList({ kind: 'unavailable', reason: 'no-portfolio' });
      return;
    }
    let cancelled = false;
    setHeldList({ kind: 'loading' });
    fetchPortfolioDispositions(portfolioId)
      .then((list) => {
        if (!cancelled) setHeldList({ kind: 'ready', list });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof DispositionUnavailableError) {
          setHeldList({ kind: 'unavailable', reason: error.reason });
          return;
        }
        setHeldList({ kind: 'error', message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [portfolioId]);

  /** Write a parameter into the query string, preserving every other one. */
  const setParam = (key: string, value: string | null): void => {
    const next = new URLSearchParams(searchParams);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <section className="holding-decisions">
      <header>
        <h1>IID-02 — Investment &amp; Holding Decisions</h1>
        <p className="muted">
          Stored investment decisions over candidates and held positions: the disposition and its rationale, the
          gates and investment limits in force, the portfolio impact and implications, and the company assessment
          behind them.
        </p>
        <ReadOnlyDisclosure />
        <CapabilityBreadcrumb current="holdingDecisions" context={context} issuerId={issuerId} />
      </header>

      <SurfaceSection
        id="decision-context"
        title="Position context"
        description="A held decision is keyed by a portfolio and a security. A candidate is keyed by a security alone and has no position."
      >
        <form
          aria-label="Set the decision context"
          onSubmit={(event) => {
            // Nothing to submit: the fields write to the URL as they change, so the selection is
            // addressable and survives a refresh.
            event.preventDefault();
          }}
        >
          <label htmlFor="decision-portfolio">Portfolio id</label>{' '}
          <input
            id="decision-portfolio"
            name="portfolioId"
            type="text"
            value={context.portfolioId ?? ''}
            placeholder="pf-…"
            onChange={(event) => setParam('portfolioId', entered(event.target.value))}
          />{' '}
          <label htmlFor="decision-security">Security id</label>{' '}
          <input
            id="decision-security"
            name="securityId"
            type="text"
            value={context.securityId ?? ''}
            placeholder="IN:ISIN:…"
            onChange={(event) => setParam('securityId', entered(event.target.value))}
          />{' '}
          <fieldset>
            <legend>Decision subject</legend>
            <label htmlFor="decision-subject-held">
              <input
                id="decision-subject-held"
                type="radio"
                name="subject"
                value="held"
                checked={subject === 'held'}
                onChange={() => setParam('subject', 'held')}
              />{' '}
              Held position (needs a portfolio and a security)
            </label>{' '}
            <label htmlFor="decision-subject-candidate">
              <input
                id="decision-subject-candidate"
                type="radio"
                name="subject"
                value="candidate"
                checked={subject === 'candidate'}
                onChange={() => setParam('subject', 'candidate')}
              />{' '}
              Candidate (a security that is not held)
            </label>
          </fieldset>
        </form>
        <p className="muted">
          A candidate is a security that is <strong>not</strong> held: it has no position, no quantity, no market
          value and no portfolio weight, and none is shown for it. It is reachable without any portfolio.
        </p>
      </SurfaceSection>

      <SurfaceSection
        id="held-decisions"
        title="Held positions"
        description="Decisions recorded against positions in one portfolio."
      >
        {portfolioId === null ? (
          <p role="status">
            No portfolio is selected. Enter a portfolio id above to read the decisions recorded against its
            holdings.
          </p>
        ) : heldList.kind === 'loading' ? (
          <p role="status">Reading the portfolio&rsquo;s decisions…</p>
        ) : heldList.kind === 'unavailable' ? (
          <p role="status">
            {heldList.reason === 'no-portfolio'
              ? 'No portfolio is selected.'
              : (DISPOSITION_UNAVAILABLE_COPY[heldList.reason as keyof typeof DISPOSITION_UNAVAILABLE_COPY] ??
                DISPOSITION_UNAVAILABLE_COPY.unrecognised)}
          </p>
        ) : heldList.kind === 'error' ? (
          <p role="alert">{heldList.message}</p>
        ) : heldList.list.dispositions.length === 0 ? (
          <p role="status">
            No disposition has been recorded for any position in this portfolio. No decision is created here: a
            disposition is produced by the operator CLI against the governed store.
          </p>
        ) : (
          <>
            <table>
              <caption>
                Decisions recorded for portfolio {heldList.list.portfolioId} ({heldList.list.count})
              </caption>
              <thead>
                <tr>
                  <th scope="col">Security</th>
                  <th scope="col">Issuer</th>
                  <th scope="col">Verb</th>
                  <th scope="col">Confidence</th>
                  <th scope="col">Horizon</th>
                  <th scope="col">Version</th>
                  <th scope="col">Open</th>
                </tr>
              </thead>
              <tbody>
                {heldList.list.dispositions.map((entry) => (
                  <tr key={`${entry.portfolioId}:${entry.securityId}`} data-security-id={entry.securityId}>
                    <th scope="row">
                      <code>{entry.securityId}</code>
                    </th>
                    <td>
                      {entry.issuerId === null ? (
                        <span className="muted">no issuer binding</span>
                      ) : (
                        <code>{entry.issuerId}</code>
                      )}
                    </td>
                    <td>
                      {entry.verb === null ? (
                        <span className="muted">{entry.withheld === true ? 'withheld' : 'no verb recorded'}</span>
                      ) : (
                        entry.verb
                      )}
                    </td>
                    <td>{entry.confidence === null ? <span className="muted">not stated</span> : entry.confidence}</td>
                    <td>{entry.horizon === null ? <span className="muted">not stated</span> : entry.horizon}</td>
                    <td>
                      v{entry.artifactVersion} · <code>{entry.headReportId}</code>
                    </td>
                    <td>
                      {/*
                        The link addresses the HELD decision: the portfolio and the security together.
                        A candidate link never carries a portfolio, because a candidate has no position key.
                      */}
                      <Link
                        to={`/investment/holding-decisions?portfolioId=${encodeURIComponent(entry.portfolioId)}&securityId=${encodeURIComponent(entry.securityId)}&subject=held`}
                      >
                        Held decision →
                      </Link>{' '}
                      {entry.issuerId === null ? null : (
                        <Link
                          to={companyAssessmentHref(entry.issuerId, {
                            portfolioId: entry.portfolioId,
                            securityId: entry.securityId,
                          })}
                        >
                          Company assessment →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {heldList.list.limitations.length > 0 ? (
              <>
                <h3>Limitations of this read</h3>
                <ul className="muted">
                  {heldList.list.limitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        )}
      </SurfaceSection>

      <SurfaceSection
        id="decision-detail"
        title="Decision detail"
        description="The stored disposition for the selected subject, with its rationale, limits and implications."
      >
        {securityId === null ? (
          <p role="status">
            No security is selected. Enter a security id above, or choose a position from the portfolio&rsquo;s
            decisions.
          </p>
        ) : subject === 'held' ? (
          portfolioId === null ? (
            <p role="status">
              A held decision is keyed by a portfolio and a security. Enter the portfolio id to read the decision
              recorded against this position.
            </p>
          ) : (
            <>
              <p className="muted">
                Held position · portfolio <code>{portfolioId}</code> · security <code>{securityId}</code>
                {issuerId === null ? '' : (
                  <>
                    {' '}
                    · issuer <code>{issuerId}</code>
                  </>
                )}
              </p>
              {issuerId === null ? null : (
                <p>
                  <Link
                    to={companyAssessmentHref(issuerId, {
                      portfolioId,
                      securityId,
                    })}
                  >
                    Company assessment for this position →
                  </Link>
                </p>
              )}
              {/* THE EXISTING DISPOSITION PANEL, MOUNTED WITH ITS OWN `held` KIND. */}
              <DispositionPanel kind="held" securityId={securityId} portfolioId={portfolioId} heading="Held disposition" />
            </>
          )
        ) : (
          <>
            <p className="muted">
              Candidate · security <code>{securityId}</code>
              {portfolioId === null ? '' : ` · evaluated in the context of portfolio ${portfolioId}`}
              {issuerId === null ? '' : ` · issuer ${issuerId}`}
            </p>
            {issuerId === null ? null : (
              <p>
                <Link to={companyAssessmentHref(issuerId, { securityId })}>Company assessment →</Link>
              </p>
            )}
            {/* THE EXISTING DISPOSITION PANEL, MOUNTED WITH ITS OWN `candidate` KIND. */}
            <DispositionPanel
              kind="candidate"
              securityId={securityId}
              {...(portfolioId === null ? {} : { portfolioId })}
              heading="Candidate disposition"
            />
          </>
        )}
      </SurfaceSection>

      <SurfaceSection id="decision-notes" title="What this page does not do">
        <ul className="muted">
          <li>It does not create a decision, and there is no control on this page that could.</li>
          <li>It does not present a candidate as a holding: the two are separate sections and separate reads.</li>
          <li>It does not compute a disposition: the verb shown is the one the operator CLI recorded.</li>
          <li>It does not treat absence of a recorded decision as a negative verdict.</li>
        </ul>
      </SurfaceSection>
    </section>
  );
}
