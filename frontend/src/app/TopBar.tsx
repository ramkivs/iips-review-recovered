/**
 * Program v3.0 — Phase 3: TopBar.
 * Brand + session identity (role/tenant). Presentation-only.
 */
import type { Role } from '../core/session/session';

interface TopBarProps {
  role: Role;
  tenantId: string;
  /** Optional real-OIDC login/logout affordances (rendered only when provided). */
  onLogin?: () => void;
  onLogout?: () => void;
}

export function TopBar({ role, tenantId, onLogin, onLogout }: TopBarProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        padding: '0 24px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface-1)',
      }}
    >
      <strong style={{ fontSize: '16px' }}>IIPS — Enterprise Investment Intelligence</strong>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px' }}>
        <span data-testid="topbar-tenant">Tenant: {tenantId}</span>
        <span data-testid="topbar-role">Role: {role}</span>
        {onLogin && <button type="button" onClick={onLogin} data-testid="topbar-login">Sign in</button>}
        {onLogout && <button type="button" onClick={onLogout} data-testid="topbar-logout">Sign out</button>}
      </div>
    </header>
  );
}
