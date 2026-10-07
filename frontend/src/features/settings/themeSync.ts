/**
 * UI12 — boot-time application of the effective theme preference.
 *
 * Authority: `docs/integration/IIPS_v3.0_NP11_SETTINGS_PRODUCT_CONTRACT_AND_PERSISTENCE_OWNER_DESIGNATION.md`
 * (NP-11-AUTH-01), decision 20 (theme integration).
 *
 * Reuses the EXISTING governed theme mechanism (`core/theme/theme.ts`, unchanged) — no theme
 * architecture is replaced and no token foundation is altered.
 *
 * The effective theme is the SERVER's answer for the server-derived `(tenantId, userId)` owner.
 * This module persists NOTHING in the browser: there is no `localStorage`/`sessionStorage`/
 * IndexedDB write, no cookie and no credential handling. When the server cannot be consulted
 * (the known browser→transport credential-path / G3 dependency), the governed system default is
 * applied and that fact is returned — a stale client-side value is never treated as authoritative.
 */
import { applyTheme, type ThemeMode } from '../../core/theme/theme';
import { fetchSettings, SettingsApiError, type SettingsFailureKind } from '../../api/settings';

/**
 * The system-defined governed default (D9), mirroring the server's
 * `GOVERNED_DEFAULT_PREFERENCES`. This is NOT client authority: it is only the deterministic
 * pre-load value applied before the server's authoritative answer arrives.
 */
export const GOVERNED_DEFAULT_THEME: ThemeMode = 'light';

export interface EffectiveThemeResult {
  readonly applied: ThemeMode;
  readonly source: 'SERVER' | 'GOVERNED_DEFAULT';
  /** Present when the server could not be consulted — disclosed, never silently swallowed. */
  readonly failureKind: SettingsFailureKind | null;
  readonly detail: string | null;
}

/**
 * Consult the server for the effective theme and apply it through the existing theme mechanism.
 *
 * Fail-closed: on ANY failure the governed default is applied (never a client-cached value) and
 * the failure is disclosed to the caller.
 */
export async function syncEffectiveThemeFromServer(baseUrl = ''): Promise<EffectiveThemeResult> {
  try {
    const envelope = await fetchSettings(baseUrl);
    applyTheme(envelope.data.theme);
    return { applied: envelope.data.theme, source: 'SERVER', failureKind: null, detail: null };
  } catch (e) {
    const failureKind = e instanceof SettingsApiError ? e.kind : 'transport';
    applyTheme(GOVERNED_DEFAULT_THEME);
    return {
      applied: GOVERNED_DEFAULT_THEME,
      source: 'GOVERNED_DEFAULT',
      failureKind,
      detail: String(e),
    };
  }
}
