/**
 * IID-6 — the candidate assessment surface (AC-6.7).
 *
 * A CANDIDATE IS NOT A HOLDING. It has no position key, no quantity, no weight and no portfolio implication measured
 * against a position — the payload says `quantities: NOT_APPLICABLE` and every weight is `NOT_APPLICABLE` with its
 * own reason. This page therefore contains no position table, no quantity field and no projected weight: filling any
 * of those for a security nobody holds would be an invented fact.
 *
 * REACHABLE WITHOUT A PORTFOLIO. The route is `/investment/candidate/:securityId`, and a `portfolio` query parameter
 * is optional context the server echoes in the subject — it is never required for the read, and no portfolio is
 * assumed when it is absent.
 *
 * NO GENERATION, NO PERSISTENCE. There is no control that could create a candidate, record a disposition or write
 * anything: the disposition is produced by the operator CLI, and this page reads the stored result or says that none
 * exists.
 */
import { useParams, useSearchParams } from 'react-router-dom';

import DispositionPanel from './DispositionPanel';
import { ReadOnlyDisclosure, SurfaceSection } from './InvestmentStates';

export default function CandidateAssessmentPage(): JSX.Element {
  const { securityId = '' } = useParams<{ securityId: string }>();
  const [searchParams] = useSearchParams();
  const contextPortfolioId = searchParams.get('portfolio') ?? undefined;

  return (
    <section className="candidate-assessment">
      <header>
        <h1>Candidate assessment</h1>
        <p className="muted">
          Security <code>{securityId}</code>
          {contextPortfolioId === undefined ? '' : ` · evaluated in the context of portfolio ${contextPortfolioId}`}
        </p>
        <p className="muted">
          A candidate is a security that is not held. No position, holding key, quantity, market value or portfolio
          weight exists for it, and none is shown. The candidate verbs are INITIATE, WATCH and AVOID_CANDIDATE, or an
          explicit withheld state when the evidence does not support a verb.
        </p>
        <ReadOnlyDisclosure />
      </header>

      <DispositionPanel
        kind="candidate"
        securityId={securityId}
        {...(contextPortfolioId === undefined ? {} : { portfolioId: contextPortfolioId })}
        heading="Candidate disposition"
      />

      <SurfaceSection id="candidate-notes" title="What this page does not do">
        <ul className="muted">
          <li>It does not create a candidate, and there is no control on this page that could.</li>
          <li>It does not assume a holding, and it does not borrow a held-position quantity or weight.</li>
          <li>It does not compute a disposition: the verb shown is the one the operator CLI recorded.</li>
          <li>
            It does not treat absence of evidence as a negative verdict. A candidate whose evidence is insufficient is
            withheld or WATCH, never AVOID_CANDIDATE by default.
          </li>
        </ul>
      </SurfaceSection>
    </section>
  );
}
