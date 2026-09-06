/**
 * Program v3.0 — Entry point.
 * Applies theme (light default), establishes the REAL OIDC session (Keycloak authorization-
 * code + PKCE S256 via core/auth/oidcClient — replaces the former hardcoded demo session),
 * completes the login callback when present, and mounts the router.
 *
 * Session display data is derived from the retained token payload and is a PRESENTATION HINT
 * ONLY: real authentication/authorization happen server-side (SecuredExecutor + JWKS).
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { SessionProvider } from './core/session/SessionContext';
import { applyTheme } from './core/theme/theme';
import { beginLogin, completeLogin, getOidcSession, hasPendingRedirect, logout } from './core/auth/oidcClient';
import './core/theme/global.css';

applyTheme('light');

const root = ReactDOM.createRoot(document.getElementById('root')!);

function render(): void {
  const session = getOidcSession();
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <SessionProvider
          session={session}
          onLogin={() => { void beginLogin(); }}
          onLogout={() => { logout(); render(); }}
        >
          <App />
        </SessionProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}

// Complete the OIDC authorization callback (no-op on a normal load), then render.
if (hasPendingRedirect()) {
  void completeLogin()
    .catch((e) => console.error('OIDC login failed:', e))
    .finally(() => render());
} else {
  render();
}
