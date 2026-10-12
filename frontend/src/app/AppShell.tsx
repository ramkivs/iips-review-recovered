import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell() {
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
