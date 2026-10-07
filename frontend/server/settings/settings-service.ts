/**
 * UI12 SETTINGS — private, user-owned, tenant-scoped personal configuration.
 *
 * Authority: `docs/integration/IIPS_v3.0_NP11_SETTINGS_PRODUCT_CONTRACT_AND_PERSISTENCE_OWNER_DESIGNATION.md`
 * (NP-11-AUTH-01, governance commit `a75b346`), disposition READY FOR IMPLEMENTATION GATE.
 * Requirement: D4_01 INT-014b — "Settings (UI12) — ADAPT".
 *
 * AUTHORIZED PRODUCT MODEL (D1 / D2)
 *   Settings are PRIVATE, USER-OWNED and TENANT-SCOPED. The authoritative ownership key is
 *   `(tenantId, userId)`, and BOTH values are supplied by the caller from the authenticated
 *   server-side principal — never from a request body, query, header or client state. There is no
 *   sharing, no invitation, no workspace/tenant inheritance and no administrator-managed personal
 *   Settings. The browser is never an ownership authority.
 *
 * BOUNDED PREFERENCE SET (D1 — "explicit Settings schema, not an unbounded dictionary")
 *   Exactly ONE governed personal preference is authorized: `theme` ∈ {light, dark}. The set is
 *   CLOSED (D4). Data mode, freshness, PIT addressing, provenance, provider/broker selection,
 *   system/tenant/environment configuration, feature flags and secrets are EXPLICITLY EXCLUDED
 *   and are structurally absent — an unknown key is REJECTED, never stored.
 *
 * APPEND-ONLY REVISION MODEL (D6 / D8)
 *   `PersistenceService` is an append-only journal whose only mutation primitive is
 *   `updateReadState`, and `append()` de-duplicates. Settings therefore cannot be mutated in
 *   place. Every operation records a durable REVISION EVENT (`settings-updated`,
 *   `settings-reset`) with a unique dedup key, and the effective state is FOLDED from the
 *   revision history in deterministic `seq` order. Historical revisions are never rewritten and
 *   never deleted: "reset" establishes the governed defaults as a NEW effective revision.
 *
 * SCHEMA VERSIONING (D7)
 *   Every persisted revision carries its own `schemaVersion`, which is SEPARATE from the
 *   whole-journal `journalFormatVersion` owned by the persistence authority. A revision written
 *   under an unsupported Settings schema version FAILS CLOSED (it is never silently
 *   reinterpreted under the current schema).
 *
 * SECURITY
 *   `PersistenceService` is a library authority, NOT an HTTP/RBAC boundary (TD-2 §5). Tenant and
 *   owner are ALWAYS server-derived by the caller and are never read from a request.
 *   `persistence-service.ts` is NOT modified. No identity model, credential store, token
 *   handling or browser persistence is introduced here.
 */
import path from 'node:path';
import {
  PersistenceService,
  resolveDataDir,
  type PersistedRecord,
} from '../persistence/persistence-service';

/** Dedicated data subdirectory — Settings never shares a journal directory with another consumer. */
export const SETTINGS_DATA_SUBDIR = 'settings';

/** Dedup namespace so Settings revisions never collide with another consumer's records. */
const EVENT_PREFIX = 'settings-event\u0000';

/**
 * Settings schema version (D7). This is the version of the SETTINGS record grammar and is
 * deliberately distinct from `JOURNAL_FORMAT_VERSION` (the whole-journal format version owned by
 * the persistence authority). Changing the meaning of a persisted revision requires incrementing
 * this value; an older revision is then never silently reinterpreted.
 */
export const SETTINGS_SCHEMA_VERSION = 1;

/** Authorized theme modes — mirrors the governed theme mechanism (`core/theme/theme.ts`). */
export const THEME_MODES = Object.freeze(['light', 'dark'] as const);
export type ThemeMode = (typeof THEME_MODES)[number];

/**
 * The COMPLETE authorized personal-preference key set. Bounded and closed by governance — this is
 * NOT a generic key/value configuration store. Adding a key requires an explicit governance
 * decision; an unlisted key is rejected rather than persisted.
 */
export const AUTHORIZED_PREFERENCE_KEYS = Object.freeze(['theme'] as const);
export type AuthorizedPreferenceKey = (typeof AUTHORIZED_PREFERENCE_KEYS)[number];

/** The authorized personal preferences carried by the effective state. */
export interface SettingsPreferences {
  readonly theme: ThemeMode;
}

/**
 * System-defined governed defaults (D9). Deterministic constants: they depend on no client
 * identity, no browser storage, no timestamp, no random state, no URL parameter, no PIT state
 * and no provider state. The same empty user configuration always yields these values.
 */
export const GOVERNED_DEFAULT_PREFERENCES: Readonly<SettingsPreferences> = Object.freeze({
  theme: 'light',
});

export type SettingsEventKind = 'settings-updated' | 'settings-reset';

/** A durable settings revision. `schemaVersion` is the Settings schema version (D7). */
interface SettingsEvent {
  readonly kind: SettingsEventKind;
  readonly schemaVersion: number;
  /** Present for `settings-updated`: the authorized keys changed by this revision. */
  readonly changes?: Readonly<Partial<SettingsPreferences>>;
  /** Server-derived revision timestamp (disclosure metadata, never a preference input). */
  readonly at: string;
}

/**
 * The effective Settings state for one `(tenantId, userId)` owner, folded deterministically from
 * the persisted revision history. `schemaVersion` is the Settings schema version; the revision
 * fields are derived from the durable journal and are not separately persisted.
 */
export interface SettingsState extends SettingsPreferences {
  readonly schemaVersion: number;
  readonly revisionCount: number;
  readonly lastRevisionAt: string | null;
  readonly lastRevisionKind: SettingsEventKind | null;
}

/** Raised on a malformed or unauthorized request payload. The transport maps this to 400. */
export class SettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsValidationError';
  }
}

/**
 * Raised when a persisted revision (or the caller's declared schema version) is not supported by
 * this build. FAIL CLOSED — never silently reinterpreted. The transport maps this to 422.
 */
export class SettingsSchemaVersionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsSchemaVersionError';
  }
}

/**
 * Raised when the Settings journal contains a record that is not a valid Settings revision.
 * FAIL CLOSED — the effective state is never partially applied. The transport maps this to 500.
 */
export class SettingsCorruptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsCorruptionError';
  }
}

let persistence: PersistenceService | null = null;

export function resolveSettingsDataDir(): string {
  return path.join(resolveDataDir(), SETTINGS_DATA_SUBDIR);
}

/** The UI12 persistence handle — a SEPARATE PersistenceService instance over its own journal. */
export function getSettingsPersistence(): PersistenceService {
  if (!persistence) persistence = new PersistenceService({ dataDir: resolveSettingsDataDir() });
  return persistence;
}

/** Test/process-boundary seam: drop the cached instance so the next call re-reads the journal. */
export function resetSettingsPersistence(): void {
  persistence = null;
}

// ── Payload validation ──────────────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Validate a caller-supplied preference patch against the CLOSED authorized set.
 *
 * An unknown key — including any identity field (`tenantId`, `userId`), any excluded capability
 * (`defaultDataMode`, `freshness`, `pitMode`) and any future/unauthorized preference — is
 * REJECTED. Nothing is coerced, nothing is silently dropped, and no partial patch is stored.
 */
export function validatePreferencesPatch(input: unknown): Readonly<Partial<SettingsPreferences>> {
  if (!isRecord(input)) throw new SettingsValidationError('invalid-settings-payload');
  const keys = Object.keys(input);
  if (keys.length === 0) throw new SettingsValidationError('no-changes');
  for (const key of keys) {
    if (!(AUTHORIZED_PREFERENCE_KEYS as readonly string[]).includes(key)) {
      throw new SettingsValidationError(`unsupported-setting:${key}`);
    }
  }
  const out: { theme?: ThemeMode } = {};
  if ('theme' in input) {
    const theme = input.theme;
    if (typeof theme !== 'string' || !(THEME_MODES as readonly string[]).includes(theme)) {
      throw new SettingsValidationError('invalid-theme');
    }
    out.theme = theme as ThemeMode;
  }
  return Object.freeze(out);
}

/**
 * Parse and validate ONE persisted revision. Any deviation fails closed — a corrupt or
 * unsupported record never contributes to an effective state.
 */
function parseEvent(r: PersistedRecord): SettingsEvent {
  if (typeof r.dedupKey !== 'string' || !r.dedupKey.startsWith(EVENT_PREFIX)) {
    throw new SettingsCorruptionError('unrecognized record in the settings journal');
  }
  if (!isRecord(r.payload)) throw new SettingsCorruptionError('settings revision payload missing');
  const p = r.payload;
  if (typeof p.schemaVersion !== 'number') {
    throw new SettingsCorruptionError('settings revision schema version missing');
  }
  if (p.schemaVersion !== SETTINGS_SCHEMA_VERSION) {
    throw new SettingsSchemaVersionError(
      `unsupported settings schema version ${String(p.schemaVersion)} (supported: ${SETTINGS_SCHEMA_VERSION})`,
    );
  }
  if (p.kind !== 'settings-updated' && p.kind !== 'settings-reset') {
    throw new SettingsCorruptionError('unknown settings revision kind');
  }
  if (typeof p.at !== 'string' || p.at === '') {
    throw new SettingsCorruptionError('settings revision timestamp missing');
  }
  if (p.kind === 'settings-updated') {
    if (!isRecord(p.changes)) throw new SettingsCorruptionError('settings revision changes missing');
    const keys = Object.keys(p.changes);
    if (keys.length === 0) throw new SettingsCorruptionError('settings revision carried no changes');
    for (const key of keys) {
      if (!(AUTHORIZED_PREFERENCE_KEYS as readonly string[]).includes(key)) {
        throw new SettingsCorruptionError(`unauthorized key in persisted settings revision: ${key}`);
      }
    }
    if ('theme' in p.changes) {
      const theme = p.changes.theme;
      if (typeof theme !== 'string' || !(THEME_MODES as readonly string[]).includes(theme)) {
        throw new SettingsCorruptionError('invalid persisted theme value');
      }
    }
  }
  return p as unknown as SettingsEvent;
}

// ── Deterministic fold ──────────────────────────────────────────────────────────────────────

/**
 * Fold the append-only revision history into the effective state.
 *
 * Deterministic: revisions are replayed in ascending `seq` (the journal's authoritative write
 * order), starting from the system-defined governed defaults. `listOrdered` returns newest-first,
 * so it is re-sorted here. Replaying the same journal always yields byte-identical state.
 */
export function foldSettings(
  tenantId: string,
  ownerUserId: string,
  store: PersistenceService = getSettingsPersistence(),
): SettingsState {
  const revisions = [...store.listOrdered(tenantId, ownerUserId)].sort((a, b) => a.seq - b.seq);
  let preferences: SettingsPreferences = { ...GOVERNED_DEFAULT_PREFERENCES };
  let lastRevisionAt: string | null = null;
  let lastRevisionKind: SettingsEventKind | null = null;

  for (const record of revisions) {
    const event = parseEvent(record);
    if (event.kind === 'settings-reset') {
      // Reset = establish the governed default effective configuration as a NEW revision.
      // It never rewrites or deletes earlier journal records.
      preferences = { ...GOVERNED_DEFAULT_PREFERENCES };
    } else {
      preferences = { ...preferences, ...(event.changes ?? {}) };
    }
    lastRevisionAt = event.at;
    lastRevisionKind = event.kind;
  }

  return Object.freeze({
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    theme: preferences.theme,
    revisionCount: revisions.length,
    lastRevisionAt,
    lastRevisionKind,
  });
}

function appendRevision(
  store: PersistenceService,
  tenantId: string,
  ownerUserId: string,
  event: SettingsEvent,
): void {
  // A monotonically increasing suffix keeps every revision distinct under the dedup contract.
  const seqHint = store.listOrdered(tenantId, ownerUserId).length + 1;
  store.append({
    tenantId,
    ownerUserId,
    dedupKey: `${EVENT_PREFIX}${seqHint}\u0000${event.kind}`,
    payload: event,
  });
}

// ── Commands ────────────────────────────────────────────────────────────────────────────────

/** Read the effective Settings for the owner. No revision → the governed defaults (D9). */
export function readEffectiveSettings(
  tenantId: string,
  ownerUserId: string,
  store: PersistenceService = getSettingsPersistence(),
): SettingsState {
  return foldSettings(tenantId, ownerUserId, store);
}

/**
 * Apply an authorized preference patch as a NEW durable revision.
 *
 * The patch is validated against the closed authorized set FIRST: an unauthorized key or value
 * throws and nothing is written. Returns the new effective state.
 */
export function updateSettings(
  tenantId: string,
  ownerUserId: string,
  patch: unknown,
  store: PersistenceService = getSettingsPersistence(),
  now: string = new Date().toISOString(),
): SettingsState {
  const changes = validatePreferencesPatch(patch);
  appendRevision(store, tenantId, ownerUserId, {
    kind: 'settings-updated',
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    changes,
    at: now,
  });
  return readEffectiveSettings(tenantId, ownerUserId, store);
}

/**
 * Reset authorized Settings to the governed defaults (D6).
 *
 * Appends a NEW revision that establishes the governed default effective configuration. Historical
 * journal records are neither rewritten nor deleted — no physical erasure semantics are invented.
 */
export function resetSettings(
  tenantId: string,
  ownerUserId: string,
  store: PersistenceService = getSettingsPersistence(),
  now: string = new Date().toISOString(),
): SettingsState {
  appendRevision(store, tenantId, ownerUserId, {
    kind: 'settings-reset',
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    at: now,
  });
  return readEffectiveSettings(tenantId, ownerUserId, store);
}
