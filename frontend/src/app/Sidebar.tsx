/**
 * Program v3.0 — Sidebar (global navigation).
 * Role-aware; reflects platform RBAC (admin-only surfaces hidden for lower roles).
 *
 * Milestone N: renders a small presentation-only status label for surfaces that are not
 * fully implemented, so a route's presence is not mistaken for a complete module.
 *
 * Milestone N+1: renders child entries (deep-linkable) with their own honest status
 * labels. All labels sit OUTSIDE the link (never inside its accessible name) and are
 * display-only — not a permission or authorization signal.
 */
import { NavLink } from 'react-router-dom';
import { visibleNav, NAV_STATUS_LABEL, type NavItem, type NavStatus } from './navigation';
import { useSession } from '../core/session/SessionContext';

const topLinkStyle = {
  display: 'block',
  flex: 1,
  padding: '8px 12px',
  textDecoration: 'none',
  borderRadius: '4px',
} as const;

const childLinkStyle = {
  display: 'block',
  flex: 1,
  padding: '4px 12px',
  fontSize: 13,
  textDecoration: 'none',
  borderRadius: '4px',
} as const;

function StatusBadge({ label, status }: { label: string; status: NavStatus }) {
  if (status === 'implemented') return null;
  return (
    <span
      data-testid={`nav-status-${label}`}
      style={{
        fontSize: 11,
        padding: '1px 6px',
        border: '1px solid var(--color-border)',
        borderRadius: 4,
        color: 'var(--color-ink-muted)',
        whiteSpace: 'nowrap',
      }}
    >
      {NAV_STATUS_LABEL[status]}
    </span>
  );
}

function NavRow({ item, child = false }: { item: NavItem; child?: boolean }) {
  const base = child ? childLinkStyle : topLinkStyle;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <NavLink
        to={item.path}
        style={({ isActive }) => ({
          ...base,
          color: isActive ? 'var(--color-ink)' : 'var(--color-ink-secondary)',
          background: isActive ? 'var(--color-surface-2)' : 'transparent',
          fontWeight: isActive ? 600 : 400,
        })}
      >
        {item.label}
      </NavLink>
      {item.status && <StatusBadge label={item.label} status={item.status} />}
    </div>
  );
}

export function Sidebar() {
  const { session } = useSession();
  const items = visibleNav(session.role);

  return (
    <ul className="app-nav">
      {items.map((item) => (
        <li key={item.path}>
          <NavRow item={item} />
          {item.children && item.children.length > 0 && (
            <ul
              style={{
                listStyle: 'none',
                margin: '2px 0 4px',
                paddingLeft: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {item.children.map((child) => (
                <li key={child.path}>
                  <NavRow item={child} child />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
