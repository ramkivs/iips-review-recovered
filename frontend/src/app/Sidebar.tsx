/** Global navigation for the single-user personal-use application. */
import type { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';
import { visibleNav, visibleChildren, isGroupOnly } from './navigation';

const TOP_LEVEL_LINK_STYLE = ({ isActive }: { isActive: boolean }) => ({
  display: 'block',
  padding: '8px 12px',
  textDecoration: 'none',
  color: isActive ? 'var(--color-ink)' : 'var(--color-ink-secondary)',
  background: isActive ? 'var(--color-surface-2)' : 'transparent',
  borderRadius: '4px',
  fontWeight: isActive ? 600 : 400,
});

const GROUP_HEADING_STYLE: CSSProperties = {
  display: 'block',
  padding: '8px 12px 4px',
  color: 'var(--color-ink-secondary)',
  fontWeight: 600,
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

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
  const items = visibleNav();

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
      {items.map(item => {
        const children = visibleChildren(item);
        const groupOnly = isGroupOnly(item);
        return (
          <li key={item.path}>
            {groupOnly ? (
              // Group-only heading: the parent path has no built surface, so it is labelled, not
              // linked. Its implemented children below remain normal links.
              <span style={GROUP_HEADING_STYLE} data-testid={`nav-group-${item.label}`}>
                {item.label}
              </span>
            ) : (
              <NavLink to={item.path} style={TOP_LEVEL_LINK_STYLE}>
                {item.label}
              </NavLink>
            )}
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
                {children.map(child => (
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
