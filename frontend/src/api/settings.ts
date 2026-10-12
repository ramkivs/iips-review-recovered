/**
 * UI12 — typed API client for the governed Settings surface.
 *
 * Authority: `docs/integration/IIPS_v3.0_NP11_SETTINGS_PRODUCT_CONTRACT_AND_PERSISTENCE_OWNER_DESIGNATION.md`
 * (NP-11-AUTH-01). Requirement: D4_01 INT-014b.
 *
 * Mirrors the server contract 1:1 — no derivation, no transformation, no client-side authority.
 *
 * Constraints reflected here:
 *   - Tenant and owner are server-bound, but the client supplies no identity of any kind; the
 *     HTTP operation remains unavailable until a non-authentication owner source is established.
 *   - The server response is the AUTHORITATIVE effective state. Nothing is cached, mirrored or
 *     restored from `localStorage`, `sessionStorage` or IndexedDB — no browser storage is used
 *     for settings, and no credential or token handling exists in this client.
 *   - Only the bounded preference keys are represented. Excluded capabilities (data mode, freshness,
 *     PIT addressing, provenance) have no representation here at all.
 */
import { noAuthFetch } from '../core/network/noAuthFetch';

export type ThemeMode = 'light' | 'dark';

export interface SettingsState {
  readonly surfaceName: string;
  readonly disposition: string;
  /** Settings schema version (server-side; distinct from the journal format version). */
  readonly schemaVersion: number;
  readonly theme: ThemeMode;
  readonly revisionCount: number;
  readonly lastRevisionAt: string | null;
  readonly lastRevisionKind: 'settings-updated' | 'settings-reset' | null;
  /** `GOVERNED_DEFAULT` when the owner has no durable revision, else `USER_REVISION`. */
  readonly source: 'GOVERNED_DEFAULT' | 'USER_REVISION';
  readonly tenantId: string;
}

export interface SettingsProvenance {
  readonly dataSource: string;
  readonly asOf: string | null;
  readonly dataVersion: string;
  readonly mode: string;
  readonly freshness: string;
  readonly authority: string;
  readonly transportSemantics: string;
}

export interface SettingsEnvelope {
  readonly data: SettingsState;
  readonly provenance: SettingsProvenance;
}

/** Why a Settings request failed — without an authentication-specific state. */
export type SettingsFailureKind = 'validation' | 'transport';

export class SettingsApiError extends Error {
  constructor(
    message: string,
    readonly kind: SettingsFailureKind,
    readonly status: number | null,
  ) {
    super(message);
    this.name = 'SettingsApiError';
  }
}

function kindForStatus(status: number): SettingsFailureKind {
  if (status === 400 || status === 422) return 'validation';
  return 'transport';
}

async function request(path: string, init: RequestInit | undefined, baseUrl: string): Promise<SettingsEnvelope> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}${path}`, init);
  } catch (e) {
    throw new SettingsApiError(`settings request failed: ${String(e)}`, 'transport', null);
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; detail?: { reason?: string } };
    const message = body.error === 'owner-context-unavailable'
      ? `Settings unavailable: ${body.detail?.reason ?? 'owner context is not available.'}`
      : body.error ?? `settings request failed: ${res.status}`;
    throw new SettingsApiError(message, kindForStatus(res.status), res.status);
  }
  const envelope = (await res.json()) as SettingsEnvelope;
  // Fail closed on a contract violation: never present a malformed envelope as effective state.
  const theme = envelope?.data?.theme;
  if (theme !== 'light' && theme !== 'dark') {
    throw new SettingsApiError('settings response contract violation: unrecognized effective theme', 'transport', res.status);
  }
  return envelope;
}

/** Read the owner-scoped effective settings (the HTTP operation is currently unavailable). */
export async function fetchSettings(baseUrl = ''): Promise<SettingsEnvelope> {
  return request('/api/settings', undefined, baseUrl);
}

/** Apply a bounded preference patch. Only the established preference set may be sent. */
export async function updateSettings(patch: { readonly theme: ThemeMode }, baseUrl = ''): Promise<SettingsEnvelope> {
  return request(
    '/api/settings',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    },
    baseUrl,
  );
}

/** Reset owner-scoped settings to governed defaults (a new durable revision when available). */
export async function resetSettings(baseUrl = ''): Promise<SettingsEnvelope> {
  return request('/api/settings/reset', { method: 'POST' }, baseUrl);
}
