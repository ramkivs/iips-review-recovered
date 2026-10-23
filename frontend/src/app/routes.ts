/**
 * Program v3.0 — Phase 3: Route map (from the frozen navigation model).
 *
 * Presentation-only route definitions. Feature workspaces (Executive, Portfolio, Research,
 * Intelligence, Evidence) are mounted directly; user/role/tenant administration is retired.
 * No session or identity gate is part of route resolution.
 */
export const ROUTES = {
  root: '/',
  executive: '/executive',
  portfolio: '/portfolio',
  brokerHoldings: '/broker-holdings',
  portfolioDetail: '/portfolio/:id',
  portfolioHoldings: '/portfolio/:id/holdings',
  watchlists: '/watchlists',
  collaboration: '/collaboration',
  settings: '/settings',
  research: '/research',
  researchCompany: '/research/company/:id',
  researchSector: '/research/sector/:id',
  researchCrossSector: '/research/cross-sector',
  // CV-53 / D89 — the one Macro surface authorized by the D89 UI-disclosure implementation gate.
  // Read-only, and the only place the D89 disclosure contract (DT-1…DT-8) is rendered.
  researchMacro: '/research/macro',
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
} as const;
