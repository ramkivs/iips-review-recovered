/**
 * Program v3.0 — Global navigation model.
 *
 * Role-aware navigation (admin-only surfaces hidden for non-admins). The frontend reflects
 * platform RBAC; it does NOT decide permissions.
 *
 * Milestone N (Integration & Documentation Reconciliation): each top-level surface now
 * carries a presentation-only `status` so the UI can honestly distinguish implemented
 * surfaces from partial/future ones. A navigation entry existing does NOT mean its module
 * is fully implemented — the status field is the honest marker, and it is display-only
 * (never a route, permission, or authorization decision).
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
      { label: 'Overview', path: '/portfolio', minRole: 'viewer' },
      { label: 'Holdings', path: '/portfolio/:id/holdings', minRole: 'viewer' },
    ],
  },
  {
    label: 'Research',
    path: '/research',
    minRole: 'viewer',
    status: 'partial',
    children: [
      { label: 'Company', path: '/research/company/:id', minRole: 'viewer' },
      { label: 'Sector', path: '/research/sector/:id', minRole: 'viewer' },
      { label: 'Cross-Sector', path: '/research/cross-sector', minRole: 'viewer' },
    ],
  },
  {
    label: 'Intelligence',
    path: '/intelligence',
    minRole: 'viewer',
    status: 'partial',
    children: [
      { label: 'Opportunities', path: '/intelligence/opportunities', minRole: 'viewer' },
      { label: 'Risks', path: '/intelligence/risks', minRole: 'viewer' },
      { label: 'Rankings', path: '/intelligence/rankings', minRole: 'viewer' },
      { label: 'Decision Matrix', path: '/intelligence/decision-matrix', minRole: 'viewer' },
    ],
  },
  {
    label: 'Evidence',
    path: '/evidence',
    minRole: 'viewer',
    status: 'partial',
    children: [
      { label: 'Decision Evidence', path: '/evidence', minRole: 'viewer' },
      { label: 'Snapshots', path: '/evidence/snapshots', minRole: 'viewer' },
      { label: 'Replay', path: '/evidence/replay/:id', minRole: 'viewer' },
    ],
  },
  {
    label: 'Administration',
    path: '/admin',
    minRole: 'admin',
    status: 'implemented',
    children: [
      { label: 'Users', path: '/admin/users', minRole: 'admin' },
      { label: 'Roles', path: '/admin/roles', minRole: 'admin' },
      { label: 'Tenants', path: '/admin/tenants', minRole: 'admin' },
      { label: 'Audit', path: '/admin/audit', minRole: 'admin' },
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
