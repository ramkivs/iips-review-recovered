/**
 * Program v3.0 — Sidebar (global navigation).
 * Role-aware; reflects platform RBAC (admin-only surfaces hidden for lower roles).
 *
 * Milestone N: renders a small presentation-only status label for surfaces that are not
 * fully implemented (partial/future), so a route's presence is not mistaken for a
 * complete module. The label sits OUTSIDE the link (never inside its accessible name)
 * and is display-only — not a permission or authorization signal.
 */
import { NavLink } from 'react-router-dom';
import { visibleNav, NAV_STATUS_LABEL } from './navigation';
import { useSession } from '../core/session/SessionContext';

export function Sidebar() {
  const { session } = useSession();
  const items = visibleNav(session.role);

  return (
    <ul className="app-nav">
      {items.map((item) => (
        <li key={item.path} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavLink
            to={item.path}
            style={({ isActive }) => ({
              display: 'block',
              flex: 1,
              padding: '8px 12px',
              textDecoration: 'none',
              color: isActive ? 'var(--color-ink)' : 'var(--color-ink-secondary)',
              background: isActive ? 'var(--color-surface-2)' : 'transparent',
              borderRadius: '4px',
              fontWeight: isActive ? 600 : 400,
            })}
          >
            {item.label}
          </NavLink>
          {item.status && item.status !== 'implemented' && (
            <span
              data-testid={`nav-status-${item.label}`}
              style={{
                fontSize: 11,
                padding: '1px 6px',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                color: 'var(--color-ink-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {NAV_STATUS_LABEL[item.status]}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
