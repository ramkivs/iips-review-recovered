/**
 * IIPS application entry point.
 *
 * This is a single-user, personal-use application. The browser opens directly into the
 * application; it does not establish a session, perform an OIDC callback, retain a token,
 * or redirect to an identity provider.
 *
 * UI12's governed default is applied first. Its server preference read remains optional;
 * if its owner scope cannot be resolved, the deterministic default stands and the failure
 * is disclosed by the settings boundary.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { applyTheme } from './core/theme/theme';
import { GOVERNED_DEFAULT_THEME, syncEffectiveThemeFromServer } from './features/settings/themeSync';
import './core/theme/global.css';

applyTheme(GOVERNED_DEFAULT_THEME);
void syncEffectiveThemeFromServer();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
