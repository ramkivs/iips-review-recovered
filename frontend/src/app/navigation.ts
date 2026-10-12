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
  { label: 'User Portfolios', path: '/user-portfolios' },
  { label: 'Watchlists', path: '/watchlists' },
  { label: 'Collaboration', path: '/collaboration' },
  { label: 'Settings', path: '/settings' },
  {
    label: 'Research',
    path: '/research',
    children: [
      { label: 'Company', path: '/research/company/:id' },
      { label: 'Sector', path: '/research/sector/:id' },
      { label: 'Cross-Sector', path: '/research/cross-sector' },
      { label: 'Engines', path: '/research/engines' },
    ],
  },
  { label: 'Screener', path: '/screener' },
  {
    label: 'Intelligence',
    path: '/intelligence',
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
];

/** Concrete, implemented destinations available as global child links. */
export const AVAILABLE_CHILD_PATHS: ReadonlySet<string> = new Set<string>([
  ROUTES.researchCrossSector,
  '/research/engines',
  ROUTES.intelligenceDecisionMatrix,
  ROUTES.aiExplanation,
]);

/** All non-retired product navigation, without a role/session dependency. */
export function visibleNav(): NavItem[] {
  return NAV;
}

/** Render only concrete, implemented child destinations. */
export function visibleChildren(item: NavItem): NavItem[] {
  return (item.children ?? []).filter(child => AVAILABLE_CHILD_PATHS.has(child.path));
}
