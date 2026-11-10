/**
 * IID — the breadcrumb every capability workspace renders.
 *
 * WHY IT EXISTS. The three capabilities are independent application routes. Without a trail, a
 * reader who arrived at one of them from a deep link had no way back to the overview and no way to
 * the other two. The breadcrumb is the consistent back navigation: it names where the reader is and
 * offers the sibling capabilities as real destinations.
 *
 * IT IS A NAVIGATION TRAIL, NOT A HIERARCHY CLAIM. The three capabilities are peers: IID-02 does
 * not contain IID-01, and the trail does not pretend otherwise. It says "Investment Intelligence",
 * names the current capability, and offers the other two.
 *
 * THE CONTEXT TRAVELS. Every link carries the issuer, portfolio, security and assessment version the
 * reader is working with, so moving between capabilities does not discard the subject. Absent
 * members stay absent.
 */
import { Link } from 'react-router-dom';

import {
  CAPABILITY_ROUTES,
  changeIntelligenceHref,
  holdingDecisionsHref,
  stockIntelligenceHref,
  type InvestmentContext,
} from './investmentContext';

/** The three capability labels, in their established order. */
export const CAPABILITY_LABELS = Object.freeze({
  stockIntelligence: 'IID-01 — Stock Intelligence',
  holdingDecisions: 'IID-02 — Investment & Holding Decisions',
  changeIntelligence: 'IID-03 — Historical Change Intelligence',
});

export interface CapabilityBreadcrumbProps {
  /** Which capability the reader is currently on. */
  readonly current: keyof typeof CAPABILITY_LABELS;
  /** The workflow context to carry on every link. */
  readonly context?: InvestmentContext;
  /** The issuer this trail is about, when there is one. */
  readonly issuerId?: string | null;
}

/**
 * The breadcrumb trail for a capability workspace.
 *
 * The current capability is rendered as text with `aria-current`, not as a link to itself: a link
 * that points at the page you are already on is a dead control.
 */
export default function CapabilityBreadcrumb({
  current,
  context = {},
  issuerId = null,
}: CapabilityBreadcrumbProps): JSX.Element {
  // EVERY sibling link carries the issuer as well as the holding context, so moving between the
  // three capabilities never discards the company the reader was working with.
  const siblings: readonly { key: keyof typeof CAPABILITY_LABELS; href: string }[] = [
    { key: 'stockIntelligence', href: stockIntelligenceHref(context, issuerId) },
    { key: 'holdingDecisions', href: holdingDecisionsHref(context, issuerId) },
    {
      key: 'changeIntelligence',
      href: changeIntelligenceHref(issuerId, context),
    },
  ];

  return (
    <nav className="capability-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/investment">Investment Intelligence</Link>
        </li>
        {siblings.map((sibling) =>
          sibling.key === current ? (
            <li key={sibling.key}>
              <span aria-current="page">{CAPABILITY_LABELS[sibling.key]}</span>
            </li>
          ) : (
            <li key={sibling.key}>
              <Link to={sibling.href}>{CAPABILITY_LABELS[sibling.key]}</Link>
            </li>
          ),
        )}
      </ol>
    </nav>
  );
}

/** The three capability route constants, re-exported so a caller needs one import. */
export { CAPABILITY_ROUTES };
