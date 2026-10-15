import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import './AppShell.css';

export function AppShell() {
  const isMacroRoute = useLocation().pathname.replace(/\/+$/, '') === '/research/macro';

  return (
    <div
      className={isMacroRoute ? 'app-shell app-shell--macro' : 'app-shell'}
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
