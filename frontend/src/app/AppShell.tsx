import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import './AppShell.css';

export function AppShell() {
  const pathname = useLocation().pathname;
  const isMacroRoute = pathname.replace(/\/+$/, '') === '/research/macro';
  // CV-51: Reports shares the narrow-viewport shell treatment so long report identifiers
  // and tables never clip the shell at <=640px / <=320px.
  const isReportsRoute = pathname === '/reports' || pathname.startsWith('/reports/');

  return (
    <div
      className={
        isMacroRoute
          ? 'app-shell app-shell--macro'
          : isReportsRoute
            ? 'app-shell app-shell--reports'
            : 'app-shell'
      }
      style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gridTemplateRows: '56px 1fr',
        gridTemplateAreas: '"topbar topbar" "sidebar content"',
        height: '100vh',
      }}
    >
      <div style={{ gridArea: 'topbar' }}>
        <TopBar />
      </div>
      <nav style={{ gridArea: 'sidebar' }} aria-label="Primary">
        <Sidebar />
      </nav>
      <main id="main-content" style={{ gridArea: 'content', overflow: 'auto', padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
