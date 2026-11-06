/**
 * IID-6 — the sector-reference disclosure block (C-2, AC-6.4).
 *
 * WHAT THIS IS FOR. A sector reference is sector-level intelligence produced by a sector engine. It is NOT a view
 * about the issuer on the page, and mixing the two would be the single most misleading thing this surface could do:
 * a reader would attribute a sector's verdict to a company.
 *
 * So it is rendered as an `<aside>` with its own heading, a muted presentation, an explicit statement that it is not
 * company-specific, and a link to the existing sector view. It sits OUTSIDE the assessment sections rather than
 * among them, and the assessment itself never consumes it — the payload's own `sectorReferenceView` is a separate
 * member that no assessed value is derived from.
 */
import { Link } from 'react-router-dom';

import type { CompanyAssessmentView } from '../../api/investment';
import { AbsentValue } from './InvestmentStates';
import { formatNumber } from './investmentCopy';

export function SectorReferenceDisclosure({
  view,
  sector,
}: {
  readonly view: NonNullable<CompanyAssessmentView['sectorReferenceView']>;
  readonly sector: string;
}): JSX.Element {
  return (
    <aside aria-labelledby="sector-reference-heading" data-disclosure="sector-reference" className="sector-reference">
      <h3 id="sector-reference-heading">Sector-level reference intelligence</h3>
      <p className="muted">
        This block is sector-level reference intelligence for the {sector} sector. It is not company-specific
        analysis of this issuer, it is not an input to the assessment above, and it is not an input to any
        disposition. Sector values and company values are never combined.
      </p>
      <dl>
        <dt>Reference</dt>
        <dd>
          <code>{view.sectorRefId}</code> <span className="muted">({view.evidenceClass})</span>
        </dd>
        <dt>Sector engine verdict</dt>
        <dd>{view.engineVerdict === null ? <AbsentValue reason="the sector engine produced no verdict" /> : view.engineVerdict}</dd>
        <dt>Sector composite</dt>
        <dd>{view.composite === null ? <AbsentValue reason="composite not computed" /> : formatNumber(view.composite)}</dd>
        <dt>Note</dt>
        <dd>{view.note}</dd>
      </dl>
      <p>
        <Link to={`/research/company/${encodeURIComponent(sector)}`}>
          Open the {sector} sector reference view →
        </Link>
      </p>
    </aside>
  );
}

export default SectorReferenceDisclosure;
