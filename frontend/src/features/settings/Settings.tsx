/**
 * UI12 — SETTINGS (private, user-owned, tenant-scoped personal configuration).
 *
 * Authority: `docs/integration/IIPS_v3.0_NP11_SETTINGS_PRODUCT_CONTRACT_AND_PERSISTENCE_OWNER_DESIGNATION.md`
 * (NP-11-AUTH-01). Requirement: D4_01 INT-014b.
 *
 * Route: /settings (viewer+ may read; mutations require analyst-and-above, server-enforced).
 *
 * AUTHORIZED MODEL: the surface exposes ONLY the governed personal preference — theme. It is
 * PRIVATE and NON-SHARED: there is deliberately no sharing, invitation, inheritance or
 * administrator control, and no control for any excluded capability (data mode, freshness, PIT
 * addressing, provenance, system/tenant/environment configuration, feature flags, secrets).
 *
 * The server response is the AUTHORITATIVE effective state. This component stores nothing in the
 * browser (no localStorage / sessionStorage / IndexedDB) and never manufactures identity.
 *
 * THEME INTEGRATION: the effective theme from the server is applied through the EXISTING governed
 * theme mechanism (`applyTheme`); the theme architecture and token foundations are unchanged.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  fetchSettings,
  resetSettings,
  updateSettings,
  SettingsApiError,
  type SettingsFailureKind,
  type SettingsProvenance,
  type SettingsState,
  type ThemeMode,
} from '../../api/settings';
import { applyTheme } from '../../core/theme/theme';
import { LoadingState, PermissionDeniedState } from '../../components/state/StateComponents';

const THEME_OPTIONS: readonly ThemeMode[] = ['light', 'dark'];

const FAILURE_LABEL: Record<SettingsFailureKind, string> = {
  authorization: 'Authorization failure',
  validation: 'Validation failure',
  transport: 'Transport failure',
};

function failureOf(e: unknown): { kind: SettingsFailureKind; message: string } {
  if (e instanceof SettingsApiError) return { kind: e.kind, message: e.message };
  return { kind: 'transport', message: String(e) };
}

export function Settings() {
  const [state, setState] = useState<SettingsState | null>(null);
  const [provenance, setProvenance] = useState<SettingsProvenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<{ kind: SettingsFailureKind; message: string } | null>(null);

  const load = useCallback(async () => {
    setFailure(null);
    try {
      const envelope = await fetchSettings();
      setState(envelope.data);
      setProvenance(envelope.provenance ?? null);
      // Theme integration: the server's effective state controls the presentation preference.
      applyTheme(envelope.data.theme);
    } catch (e: unknown) {
      setFailure(failureOf(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function mutate(fn: () => Promise<{ data: SettingsState; provenance: SettingsProvenance }>): Promise<void> {
    setBusy(true);
    setFailure(null);
    try {
      const envelope = await fn();
      setState(envelope.data);
      setProvenance(envelope.provenance ?? null);
      applyTheme(envelope.data.theme);
    } catch (e: unknown) {
      // The effective state is left untouched — a rejected mutation changes nothing.
      setFailure(failureOf(e));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState />;

  // Authorization failure: the governed boundary denied the read. Nothing is fabricated.
  if (failure !== null && failure.kind === 'authorization' && state === null) {
    return <PermissionDeniedState />;
  }

  // No effective state was obtained: report the failure class plainly. An unknown condition is
  // treated as a transport failure — never as an empty (fabricated) configuration.
  if (state === null) {
    const shown = failure ?? { kind: 'transport' as SettingsFailureKind, message: 'settings unavailable' };
    return (
      <section data-testid="settings-surface">
        <h1 style={{ fontSize: 22, margin: 0 }}>Settings</h1>
        <p data-testid="settings-failure" style={{ color: 'var(--color-status-negative)', fontSize: 13, marginTop: 12 }}>
          <strong data-testid="settings-failure-kind">{FAILURE_LABEL[shown.kind]}</strong>: {shown.message}
        </p>
        <button type="button" data-testid="settings-retry" onClick={() => { setLoading(true); void load(); }}>
          Retry
        </button>
      </section>
    );
  }

  return (
    <section data-testid="settings-surface">
      <h1 style={{ fontSize: 22, margin: 0 }}>Settings</h1>
      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: '6px 0 0' }}>
        Your private personal preferences. They are owned by you, scoped to your tenant, and never
        shared with other users. Only authorized personal preferences appear here.
      </p>

      <dl
        data-testid="settings-effective"
        style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 13 }}
      >
        <dt style={{ color: 'var(--color-ink-secondary)' }}>Effective theme</dt>
        <dd data-testid="settings-current-theme" style={{ margin: 0 }}>{state.theme}</dd>
        <dt style={{ color: 'var(--color-ink-secondary)' }}>Source</dt>
        <dd data-testid="settings-source" style={{ margin: 0 }}>
          {state.source === 'GOVERNED_DEFAULT' ? 'governed default' : 'your saved revision'}
        </dd>
        <dt style={{ color: 'var(--color-ink-secondary)' }}>Durable revisions</dt>
        <dd data-testid="settings-revision-count" style={{ margin: 0 }}>{state.revisionCount}</dd>
        <dt style={{ color: 'var(--color-ink-secondary)' }}>Settings schema</dt>
        <dd data-testid="settings-schema-version" style={{ margin: 0 }}>v{state.schemaVersion}</dd>
      </dl>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor="settings-theme" style={{ fontSize: 13 }}>Theme</label>
        <select
          id="settings-theme"
          data-testid="settings-theme-select"
          value={state.theme}
          disabled={busy}
          onChange={(e) => {
            const theme = e.target.value as ThemeMode;
            void mutate(() => updateSettings({ theme }));
          }}
        >
          {THEME_OPTIONS.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
        </select>
        <button
          type="button"
          data-testid="settings-reset"
          disabled={busy}
          onClick={() => { void mutate(() => resetSettings()); }}
        >
          Reset to defaults
        </button>
      </div>

      {failure !== null && (
        <p data-testid="settings-failure" style={{ color: 'var(--color-status-negative)', fontSize: 13, marginTop: 12 }}>
          <strong data-testid="settings-failure-kind">{FAILURE_LABEL[failure.kind]}</strong>: {failure.message}
          {' '}Your effective settings were not changed.
        </p>
      )}

      {busy && (
        <p data-testid="settings-busy" role="status" aria-live="polite" style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>
          Applying&hellip;
        </p>
      )}

      {provenance !== null && (
        <p data-testid="settings-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 20 }}>
          {provenance.dataSource} · {provenance.dataVersion}
          <br />
          {provenance.transportSemantics}
        </p>
      )}
    </section>
  );
}

export default Settings;
