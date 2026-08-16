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
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="app-topbar">
        <TopBar role={session.role} tenantId={session.tenantId} />
      </div>
      <nav className="app-sidebar" aria-label="Primary">
        <Sidebar />
      </nav>
      <main className="app-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
