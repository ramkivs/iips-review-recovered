/**
 * Program v3.0 — Phase 3: Entry point.
 * Applies theme (light default), provides the inert session, and mounts the router.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { SessionProvider } from './core/session/SessionContext';
import { applyTheme } from './core/theme/theme';
import './core/theme/global.css';

applyTheme('light');

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
