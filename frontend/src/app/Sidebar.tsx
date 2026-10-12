/**
 * Program v3.0 — Phase 3: Sidebar (global navigation).
 *
 * Role-aware; reflects platform RBAC (admin-only surfaces hidden for lower roles).
 * Renders the model's child destinations that are available in global navigation
 * (`visibleChildren`), so implemented sections are discoverable instead of reachable
 * only by URL. Parents keep their own link and active-route behaviour.
 */
import { NavLink } from 'react-router-dom';
import { visibleNav, visibleChildren } from './navigation';
import { useSession } from '../core/session/SessionContext';

const TOP_LEVEL_LINK_STYLE = ({ isActive }: { isActive: boolean }) => ({
  display: 'block',
  padding: '8px 12px',
  textDecoration: 'none',
  color: isActive ? 'var(--color-ink)' : 'var(--color-ink-secondary)',
  background: isActive ? 'var(--color-surface-2)' : 'transparent',
  borderRadius: '4px',
  fontWeight: isActive ? 600 : 400,
});

const CHILD_LINK_STYLE = ({ isActive }: { isActive: boolean }) => ({
  display: 'block',
  padding: '6px 10px',
  textDecoration: 'none',
  fontSize: '13px',
  color: isActive ? 'var(--color-ink)' : 'var(--color-ink-secondary)',
  background: isActive ? 'var(--color-surface-2)' : 'transparent',
  borderRadius: '4px',
  fontWeight: isActive ? 600 : 400,
});

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
      {items.map((item) => {
        const children = visibleChildren(item, session.role);
        return (
          <li key={item.path}>
            <NavLink to={item.path} style={TOP_LEVEL_LINK_STYLE}>
              {item.label}
            </NavLink>
            {children.length > 0 && (
              <ul
                aria-label={`${item.label} sections`}
                style={{
                  listStyle: 'none',
                  margin: '2px 0 6px',
                  padding: '0 0 0 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  borderLeft: '1px solid var(--color-border)',
                }}
              >
                {children.map((child) => (
                  <li key={child.path}>
                    <NavLink to={child.path} style={CHILD_LINK_STYLE}>
                      {child.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
