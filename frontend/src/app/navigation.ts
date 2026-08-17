/**
 * Program v3.0 — Global navigation model.
 *
 * Role-aware navigation (admin-only surfaces hidden for non-admins). The frontend reflects
 * platform RBAC; it does NOT decide permissions.
 *
 * Milestone N (Integration & Documentation Reconciliation): each surface carries a
 * presentation-only `status` so the UI honestly distinguishes implemented from
 * partial/future surfaces. A navigation entry existing does NOT mean its module is fully
 * implemented — the status field is the honest marker, and it is display-only (never a
 * route, permission, or authorization decision).
 *
 * Milestone N+1 (Navigation & Route Reconciliation): children now match the real
 * implemented surfaces — Administration children are the 8 governed read-only tabs
 * (deep-linkable), the dead `/evidence/snapshots` entry is removed, and future-only
 * children (Holdings, Sector, Opportunities/Risks/Rankings, Decision Evidence) are
 * marked `future` so they are never mistaken for implemented capabilities.
 */
import type { Role } from '../core/session/session';

/** Presentation-only honesty marker. `partial` = some sub-surfaces implemented, module-level scope future. */
export type NavStatus = 'implemented' | 'partial' | 'future';

export interface NavItem {
  label: string;
  path: string;
  minRole: Role;
  status?: NavStatus;
  children?: NavItem[];
}

export const NAV: NavItem[] = [
  { label: 'Executive', path: '/executive', minRole: 'viewer', status: 'implemented' },
  {
    label: 'Portfolio',
    path: '/portfolio',
    minRole: 'viewer',
    status: 'implemented',
    children: [
      { label: 'Overview', path: '/portfolio', minRole: 'viewer', status: 'implemented' },
      // No distinct holdings surface exists yet (/portfolio/* renders the same workspace).
      { label: 'Holdings', path: '/portfolio/:id/holdings', minRole: 'viewer', status: 'future' },
    ],
  },
  {
    label: 'Research',
    path: '/research',
    minRole: 'viewer',
    status: 'partial',
    children: [
      { label: 'Company', path: '/research/company/:id', minRole: 'viewer', status: 'implemented' },
      { label: 'Sector', path: '/research/sector/:id', minRole: 'viewer', status: 'future' },
      { label: 'Cross-Sector', path: '/research/cross-sector', minRole: 'viewer', status: 'implemented' },
    ],
  },
  {
    label: 'Intelligence',
    path: '/intelligence',
    minRole: 'viewer',
    status: 'partial',
    children: [
      { label: 'Decision Matrix', path: '/intelligence/decision-matrix', minRole: 'viewer', status: 'implemented' },
      { label: 'Opportunities', path: '/intelligence/opportunities', minRole: 'viewer', status: 'future' },
      { label: 'Risks', path: '/intelligence/risks', minRole: 'viewer', status: 'future' },
      { label: 'Rankings', path: '/intelligence/rankings', minRole: 'viewer', status: 'future' },
    ],
  },
  {
    label: 'Evidence',
    path: '/evidence',
    minRole: 'viewer',
    status: 'partial',
    children: [
      { label: 'Replay', path: '/evidence/replay/:id', minRole: 'viewer', status: 'implemented' },
      // The evidence list hub (/evidence) is a placeholder; no snapshots surface exists.
      { label: 'Decision Evidence', path: '/evidence', minRole: 'viewer', status: 'future' },
    ],
  },
  {
    label: 'Administration',
    path: '/admin',
    minRole: 'admin',
    status: 'implemented',
    children: [
      { label: 'Overview', path: '/admin/overview', minRole: 'admin', status: 'implemented' },
      { label: 'Identity & Access', path: '/admin/identity', minRole: 'admin', status: 'implemented' },
      { label: 'Tenants', path: '/admin/tenancy', minRole: 'admin', status: 'implemented' },
      { label: 'Engines & Certification', path: '/admin/engines', minRole: 'admin', status: 'implemented' },
      { label: 'Platform Operations', path: '/admin/platform', minRole: 'admin', status: 'implemented' },
      { label: 'Audit', path: '/admin/audit', minRole: 'admin', status: 'implemented' },
      { label: 'Live Data & Governance', path: '/admin/data', minRole: 'admin', status: 'implemented' },
      { label: 'Migration / Workflow / Marketplace', path: '/admin/operations', minRole: 'admin', status: 'implemented' },
    ],
  },
];

/** Human-facing label for a nav status (presentation only). */
export const NAV_STATUS_LABEL: Record<NavStatus, string> = {
  implemented: 'Implemented',
  partial: 'Partial',
  future: 'Future',
};

/** Filter nav items visible to a given role. */
export function visibleNav(role: Role): NavItem[] {
  const rank: Record<Role, number> = { viewer: 0, analyst: 1, admin: 2 };
  return NAV.filter((item) => rank[role] >= rank[item.minRole]);
}
