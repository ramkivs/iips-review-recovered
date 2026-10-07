/**
 * Program v3.0 — Phase 3: Entry point.
 * Applies theme (light default), provides the inert session, and mounts the router.
 *
 * NP-11 (UI12): the deterministic system default is applied first, then the user's durable
 * effective preference is applied from the governed server boundary when it can be consulted.
 * Nothing is cached in the browser; on failure the governed default stands.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { SessionProvider } from './core/session/SessionContext';
import { applyTheme } from './core/theme/theme';
import { GOVERNED_DEFAULT_THEME, syncEffectiveThemeFromServer } from './features/settings/themeSync';
import './core/theme/global.css';

applyTheme(GOVERNED_DEFAULT_THEME);
void syncEffectiveThemeFromServer();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionProvider
        session={{ userId: 'demo-analyst', tenantId: 'tenant-demo', role: 'analyst', authenticated: true }}
      >
        <App />
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
