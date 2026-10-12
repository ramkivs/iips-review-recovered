/**
 * Program v3.0 — Phase 3: Global navigation model.
 *
 * Role-aware navigation (admin-only surfaces hidden for non-admins). The frontend reflects
 * platform RBAC; it does NOT decide permissions. At this phase roles come from a minimal
 * session stub (to be connected to the transport/EnterpriseRuntime in a later phase).
 */
import type { Role } from '../core/session/session';
import { ROUTES } from './routes';

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
  // G-2 — durable user portfolios (read-only IPD/G24-backed consumer, 2026-10-08
  // UI-Consumer Implementation Authorization). A personal durable-portfolio view
  // distinct from the certified reference Portfolio workspace above; available to
  // every authenticated role, authorization enforced server-side by the G-2
  // boundary.
  { label: 'User Portfolios', path: '/user-portfolios', minRole: 'viewer' },
  { label: 'Watchlists', path: '/watchlists', minRole: 'viewer' },
  { label: 'Collaboration', path: '/collaboration', minRole: 'viewer' },
  // NP-11 UI12 — private, user-owned personal settings (personal capability, not a platform
  // configuration surface). Available to every authenticated role; mutations are authorized
  // server-side by the governed execute action.
  { label: 'Settings', path: '/settings', minRole: 'viewer' },
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
  // Governed Screener — declarative screening over the certified 13-engine set (read-only).
  { label: 'Screener', path: '/screener', minRole: 'viewer' },
  {
    label: 'Intelligence',
    path: '/intelligence',
    minRole: 'viewer',
    children: [
      { label: 'Opportunities', path: '/intelligence/opportunities', minRole: 'viewer' },
      { label: 'Risks', path: '/intelligence/risks', minRole: 'viewer' },
      { label: 'Rankings', path: '/intelligence/rankings', minRole: 'viewer' },
      { label: 'Decision Matrix', path: '/intelligence/decision-matrix', minRole: 'viewer' },
      // Phase 13.2 — AI Explanation. The IA groups it under Intelligence while its recorded
      // path is top-level `/ai-advisory` (phase14-information-architecture.md). Read-only and
      // NON-authoritative: the surface always carries "AI EXPLANATION ≠ CERTIFIED RESULT".
      { label: 'AI Explanation', path: '/ai-advisory', minRole: 'viewer' },
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

/** Role ordering used by the navigation model (frontend reflection of platform RBAC only). */
const ROLE_RANK: Record<Role, number> = { viewer: 0, analyst: 1, admin: 2 };

/**
 * Child destinations that are concretely navigable from global navigation today.
 *
 * A destination is listed here only when BOTH hold:
 *   1. the path is concrete (no route parameter), and
 *   2. the route renders an implemented workspace — not a placeholder / `NotYetAuthorized`.
 *
 * Deliberately NOT listed (and therefore not rendered as global links):
 *   - parameterised children that require a selection — `/research/company/:id`,
 *     `/research/sector/:id`, `/portfolio/:id/holdings`, `/evidence/replay/:id`. These are
 *     reached contextually from a company/sector/evidence row (e.g. Cross-Sector Intelligence
 *     and Decision Matrix link to `/research/company/<sector>`), and a literal `:id` link
 *     would be broken navigation;
 *   - children whose target is a placeholder or duplicates the parent path;
 *   - Administration sections, which are owned by the Administration surface's own tablist
 *     (`src/features/admin/Administration.tsx`) — rendering them here would duplicate it.
 *
 * `NAV` itself (the frozen navigation model) is unchanged; this is additive availability
 * metadata used by the Sidebar.
 */
export const AVAILABLE_CHILD_PATHS: ReadonlySet<string> = new Set<string>([
  ROUTES.researchCrossSector,        // Phase 8 — Cross-Sector Intelligence (implemented)
  '/research/engines',               // E2E-025 — Engine Registry (implemented; no ROUTES key)
  ROUTES.intelligenceDecisionMatrix, // Phase 9 — Decision Matrix (implemented)
  ROUTES.aiExplanation,              // Phase 13.2 — AI Explanation (implemented; non-authoritative)
]);

/** Filter nav items visible to a given role. */
export function visibleNav(role: Role): NavItem[] {
  return NAV.filter((item) => ROLE_RANK[role] >= ROLE_RANK[item.minRole]);
}

/**
 * Filter the renderable children of a nav item: same role rule as `visibleNav`, restricted to
 * destinations available in global navigation (`AVAILABLE_CHILD_PATHS`). Order follows the model.
 */
export function visibleChildren(item: NavItem, role: Role): NavItem[] {
  return (item.children ?? []).filter(
    (child) => ROLE_RANK[role] >= ROLE_RANK[child.minRole] && AVAILABLE_CHILD_PATHS.has(child.path),
  );
}
