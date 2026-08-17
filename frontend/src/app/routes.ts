/**
 * Program v3.0 — Route map (from the navigation model).
 *
 * Presentation-only route definitions. Milestone N+1: aligned with the real surfaces —
 * the dead `/evidence/snapshots` entry is removed and Administration routes match the
 * 8 governed read-only tabs (deep-linkable). No business logic.
 */
export const ROUTES = {
  root: '/',
  executive: '/executive',
  portfolio: '/portfolio',
  portfolioDetail: '/portfolio/:id',
  portfolioHoldings: '/portfolio/:id/holdings',
  research: '/research',
  researchCompany: '/research/company/:id',
  researchSector: '/research/sector/:id',
  researchCrossSector: '/research/cross-sector',
  intelligence: '/intelligence',
  intelligenceOpportunities: '/intelligence/opportunities',
  intelligenceRisks: '/intelligence/risks',
  intelligenceRankings: '/intelligence/rankings',
  intelligenceDecisionMatrix: '/intelligence/decision-matrix',
  evidence: '/evidence',
  evidenceDetail: '/evidence/:id',
  evidenceReplay: '/evidence/replay/:id',
  admin: '/admin',
  adminOverview: '/admin/overview',
  adminIdentity: '/admin/identity',
  adminTenancy: '/admin/tenancy',
  adminEngines: '/admin/engines',
  adminPlatform: '/admin/platform',
  adminAudit: '/admin/audit',
  adminData: '/admin/data',
  adminOperations: '/admin/operations',
} as const;
