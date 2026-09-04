/**
 * Program v3.0 — Phase 3: Global navigation model.
 *
 * Role-aware navigation (admin-only surfaces hidden for non-admins). The frontend reflects
 * platform RBAC; it does NOT decide permissions. At this phase roles come from a minimal
 * session stub (to be connected to the transport/EnterpriseRuntime in a later phase).
 */
import type { Role } from '../core/session/session';

export interface NavItem {
  label: string;
  path: string;
  minRole: Role;
  children?: NavItem[];
}

export const NAV: NavItem[] = [
  { label: 'Executive', path: '/executive', minRole: 'viewer' },
  {
    label: 'Portfolio',
    path: '/portfolio',
    minRole: 'viewer',
    children: [
      { label: 'Overview', path: '/portfolio', minRole: 'viewer' },
      { label: 'Holdings', path: '/portfolio/:id/holdings', minRole: 'viewer' },
    ],
  },
  {
    label: 'Research',
    path: '/research',
    minRole: 'viewer',
    children: [
      { label: 'Company', path: '/research/company/:id', minRole: 'viewer' },
      { label: 'Sector', path: '/research/sector/:id', minRole: 'viewer' },
      { label: 'Cross-Sector', path: '/research/cross-sector', minRole: 'viewer' },
      { label: 'Engines', path: '/research/engines', minRole: 'viewer' },
    ],
  },
  {
    label: 'Intelligence',
    path: '/intelligence',
    minRole: 'viewer',
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
    children: [
      { label: 'Users', path: '/admin/users', minRole: 'admin' },
      { label: 'Roles', path: '/admin/roles', minRole: 'admin' },
      { label: 'Tenants', path: '/admin/tenants', minRole: 'admin' },
      { label: 'Audit', path: '/admin/audit', minRole: 'admin' },
    ],
  },
];

/** Filter nav items visible to a given role. */
export function visibleNav(role: Role): NavItem[] {
  const rank: Record<Role, number> = { viewer: 0, analyst: 1, admin: 2 };
  return NAV.filter((item) => rank[role] >= rank[item.minRole]);
}
