/**
 * Program v3.0 — Phase 3: TopBar.
 * Brand + session identity (role/tenant) + sign-out. Presentation-only.
 */
import type { Role } from '../core/session/session';
import { useAuth } from '../core/auth/AuthProvider';

interface TopBarProps {
  role: Role;
  tenantId: string;
}

export function TopBar({ role, tenantId }: TopBarProps) {
  const { status, logout } = useAuth();
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
        {status === 'authenticated' && (
          <button type="button" data-testid="sign-out" onClick={() => { void logout(); }}>
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
