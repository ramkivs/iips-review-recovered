/**
 * Program v3.0 — Phase 3: Application Shell.
 *
 * Global layout: TopBar + Sidebar (navigation) + content outlet + global shell states.
 * Presentation-only. Consumes semantic tokens. Role-aware navigation via SessionContext.
 */
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSession } from '../core/session/SessionContext';

export function AppShell() {
  const { session } = useSession();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gridTemplateRows: '56px 1fr',
        gridTemplateAreas: '"topbar topbar" "sidebar content"',
        height: '100vh',
      }}
    >
      <div style={{ gridArea: 'topbar' }}>
        <TopBar role={session.role} tenantId={session.tenantId} />
      </div>
      <nav style={{ gridArea: 'sidebar' }} aria-label="Primary">
        <Sidebar />
      </nav>
      <main style={{ gridArea: 'content', overflow: 'auto', padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
