/**
 * Global navigation for the single-user personal-use application.
 *
 * Navigation is not role-filtered. Administrative identity, role, and tenant-membership
 * management is intentionally retired; the remaining product surfaces open directly.
 */
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
  /**
   * `groupOnly` marks a parent whose own path has no built destination (it resolves to the
   * honest `FeatureNotImplemented` shell). Such an item is rendered as a non-clickable heading
   * over its implemented children, so no navigation click can land on "not yet built".
   * Presentation-only honesty marker: it is never a permission or an authorization decision.
   */
  groupOnly?: boolean;
}

export const NAV: NavItem[] = [
  { label: 'Executive', path: '/executive' },
  {
    label: 'Portfolio',
    path: '/portfolio',
    children: [
      { label: 'Overview', path: '/portfolio' },
      { label: 'Holdings', path: '/portfolio/:id/holdings' },
    ],
  },
  // Owner-scoped surfaces remain visible. Their data operations are served for the owner
  // established by the server-owned owner context (F-3) and report unavailable — never a
  // fabricated or inferred owner — whenever that context cannot be established.
  { label: 'Broker Holdings', path: '/broker-holdings' },
  { label: 'User Portfolios', path: '/user-portfolios' },
  // Personal, durable, single-user portfolio (local personal-use path; Program Authority 2026-11-08).
  { label: 'Personal Portfolio', path: '/personal-portfolio' },
  { label: 'Watchlists', path: '/watchlists' },
  // IID-1: identity coverage over holdings, broker-preview rows and watchlists. Read-only; it renders the
  // resolution state of every observed row and never substitutes a sector reference for an identity.
  { label: 'Identity Coverage', path: ROUTES.identityCoverage },
  /**
   * IID WI-1 (P1) — Investment Intelligence as an identifiable group naming the three capabilities.
   *
   * The parent is a real link because `/investment` is a built landing surface, not a placeholder. The children
   * address its three capability sections: the company, candidate and disposition routes all require an identifier
   * and so cannot be global destinations. Each child therefore lands on a real, implemented section that carries
   * the way into the existing IID-6 surfaces. Coverage stays a separate entry below — it reports identity
   * resolution, and is not one of the three capabilities.
   */
  {
    label: 'Investment Intelligence',
    path: ROUTES.investmentIntelligence,
    children: [
      { label: 'IID-01 — Stock Intelligence', path: `${ROUTES.investmentIntelligence}#iid-01` },
      { label: 'IID-02 — Investment & Holding Decisions', path: `${ROUTES.investmentIntelligence}#iid-02` },
      { label: 'IID-03 — Historical Change Intelligence', path: `${ROUTES.investmentIntelligence}#iid-03` },
    ],
  },
  // IID-6: the coverage panel at its authoritative path, beside the company assessment view it links to.
  { label: 'Investment Coverage', path: ROUTES.investmentCoverage },
  { label: 'Collaboration', path: '/collaboration' },
  {
    label: 'Research',
    path: '/research',
    // `/research` has no workspace of its own (it renders the honest placeholder), so it is a
    // group heading here rather than a link that dead-ends. Its implemented children stay links.
    groupOnly: true,
    children: [
      { label: 'Company', path: '/research/company/:id' },
      // PKG-08 Row 4: the Sector surface is now built. The sidebar entry points at a concrete
      // default sector (Banking) so the rendered href is parameter-free; the in-page selector
      // navigates between all 13 canonical sectors.
      { label: 'Sector', path: '/research/sector/Banking' },
      { label: 'Cross-Sector', path: '/research/cross-sector' },
      { label: 'Engines', path: '/research/engines' },
      { label: 'Macro', path: ROUTES.researchMacro },
    ],
  },
  { label: 'Screener', path: '/screener' },
  {
    label: 'Intelligence',
    path: '/intelligence',
    // R3: retain the group-only parent; the three dedicated framing views now join
    // the existing implemented children without adding a separate Intelligence hub.
    groupOnly: true,
    children: [
      { label: 'Opportunities', path: '/intelligence/opportunities' },
      { label: 'Risks', path: '/intelligence/risks' },
      { label: 'Rankings', path: '/intelligence/rankings' },
      { label: 'Decision Matrix', path: '/intelligence/decision-matrix' },
      { label: 'AI Explanation', path: ROUTES.aiExplanation },
    ],
  },
  {
    label: 'Evidence',
    path: '/evidence',
    children: [
      { label: 'Decision Evidence', path: '/evidence' },
      { label: 'Snapshots', path: '/evidence/snapshots' },
      { label: 'Replay', path: '/evidence/replay/:id' },
    ],
  },
  // CV-51 / NP-06 D8: Reports is the seventh L1 product section — a top-level sibling
  // between Evidence and Settings. Only the concrete `/reports` path is a global link;
  // `/reports/:reportId` is reached from the list, version links, and deep links.
  { label: 'Reports', path: ROUTES.reports },
  { label: 'Settings', path: '/settings' },
];

/** Concrete, implemented destinations available as global child links. */
export const AVAILABLE_CHILD_PATHS: ReadonlySet<string> = new Set<string>([
  // IID WI-1 (P1): concrete sections of the built `/investment` landing surface. Parameter-free, so they are
  // admissible global links; each resolves to a real rendered section rather than an identifier-bearing route.
  `${ROUTES.investmentIntelligence}#iid-01`,
  `${ROUTES.investmentIntelligence}#iid-02`,
  `${ROUTES.investmentIntelligence}#iid-03`,
  ROUTES.researchCrossSector,
  '/research/engines',
  ROUTES.researchMacro,
  // PKG-08 Row 4: the Sector surface is now built. The sidebar entry points at a concrete
  // default sector; the route pattern `/research/sector/:id` matches it.
  '/research/sector/Banking',
  ROUTES.intelligenceOpportunities,
  ROUTES.intelligenceRisks,
  ROUTES.intelligenceRankings,
  ROUTES.intelligenceDecisionMatrix,
  ROUTES.aiExplanation,
]);

/** A top-level nav item whose own path must not be rendered as a link. */
export function isGroupOnly(item: NavItem): boolean {
  return item.groupOnly === true;
}

/** All non-retired product navigation, without a role/session dependency. */
export function visibleNav(): NavItem[] {
  return NAV;
}

/** Render only concrete, implemented child destinations. */
export function visibleChildren(item: NavItem): NavItem[] {
  return (item.children ?? []).filter(child => AVAILABLE_CHILD_PATHS.has(child.path));
}
