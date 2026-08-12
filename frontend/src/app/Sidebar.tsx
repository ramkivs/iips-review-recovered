/**
 * Program v3.0 — Phase 3: Sidebar (global navigation).
 * Role-aware; reflects platform RBAC (admin-only surfaces hidden for lower roles).
 */
import { NavLink } from 'react-router-dom';
import { visibleNav } from './navigation';
import { useSession } from '../core/session/SessionContext';

export function Sidebar() {
  const { session } = useSession();
  const items = visibleNav(session.role);

  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        height: '100%',
        background: 'var(--color-surface-1)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {items.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            style={({ isActive }) => ({
              display: 'block',
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
        </li>
      ))}
    </ul>
  );
}
