/**
 * Program v3.0 — Phase 3: Route map (from the frozen navigation model).
 *
 * Presentation-only route definitions. Feature workspaces (Executive, Portfolio, Research,
 * Intelligence, Evidence, Admin) are shell placeholders at this phase — they render an
 * "Under construction / not yet authorized" shell state. No business logic.
 */
export const ROUTES = {
  root: '/',
  executive: '/executive',
  portfolio: '/portfolio',
  portfolioDetail: '/portfolio/:id',
  portfolioHoldings: '/portfolio/:id/holdings',
  watchlists: '/watchlists',
  collaboration: '/collaboration',
  settings: '/settings',
  research: '/research',
  researchCompany: '/research/company/:id',
  researchSector: '/research/sector/:id',
  researchCrossSector: '/research/cross-sector',
  screener: '/screener',
  intelligence: '/intelligence',
  intelligenceOpportunities: '/intelligence/opportunities',
  intelligenceRisks: '/intelligence/risks',
  intelligenceRankings: '/intelligence/rankings',
  intelligenceDecisionMatrix: '/intelligence/decision-matrix',
  // Phase 13.2 — AI Explanation (read-only, non-authoritative advisory). Grouped under
  // Intelligence in the IA (phase14-information-architecture.md); path recorded there and in
  // phase14/contract-inspection.md as `/ai-advisory`.
  aiExplanation: '/ai-advisory',
  evidence: '/evidence',
  evidenceDetail: '/evidence/:id',
  evidenceSnapshots: '/evidence/snapshots',
  evidenceReplay: '/evidence/replay/:id',
  admin: '/admin',
  adminUsers: '/admin/users',
  adminRoles: '/admin/roles',
  adminTenants: '/admin/tenants',
  adminAudit: '/admin/audit',
} as const;
