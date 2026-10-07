/**
 * UI12 — Settings service tests (offline, deterministic).
 *
 * Proves the governed product contract at the service boundary: system-defined defaults,
 * ownership isolation (user + tenant), append-only revision semantics, deterministic
 * reconstruction, restart durability, reset-as-new-revision, prior-revision immutability,
 * schema versioning, closed preference set, and fail-closed handling of malformed/unsupported
 * journal content.
 */
import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { PersistenceService } from '../persistence/persistence-service';
import {
  AUTHORIZED_PREFERENCE_KEYS,
  GOVERNED_DEFAULT_PREFERENCES,
  SETTINGS_DATA_SUBDIR,
  SETTINGS_SCHEMA_VERSION,
  SettingsCorruptionError,
  SettingsSchemaVersionError,
  SettingsValidationError,
  foldSettings,
  readEffectiveSettings,
  resetSettings,
  resolveSettingsDataDir,
  updateSettings,
  validatePreferencesPatch,
} from './settings-service';

const tmpDirs: string[] = [];
function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-ui12-svc-'));
  tmpDirs.push(d);
  return d;
}
afterEach(() => {
  for (const d of tmpDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const store = (dir = tmpDir()) => new PersistenceService({ dataDir: dir });
const AT = '2026-10-01T00:00:00.000Z';

const TENANT_A = 'tenant-A';
const USER_1 = 'analyst-a';
const USER_2 = 'admin-a';   // same tenant, different owner
const TENANT_B = 'tenant-B';

describe('UI12 — Settings service: governed defaults', () => {
  it('returns the system-defined governed defaults when no revision exists', () => {
    const s = store();
    const state = readEffectiveSettings(TENANT_A, USER_1, s);
    expect(state.theme).toBe(GOVERNED_DEFAULT_PREFERENCES.theme);
    expect(state.theme).toBe('light');
    expect(state.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(state.revisionCount).toBe(0);
    expect(state.lastRevisionAt).toBeNull();
    expect(state.lastRevisionKind).toBeNull();
  });

  it('is deterministic — the same empty configuration always yields the same defaults', () => {
    const a = readEffectiveSettings(TENANT_A, USER_1, store());
    const b = readEffectiveSettings(TENANT_A, USER_1, store());
    expect(a).toEqual(b);
  });

  it('has a closed, bounded authorized preference set (theme only)', () => {
    expect([...AUTHORIZED_PREFERENCE_KEYS]).toEqual(['theme']);
  });

  it('resolves its journal to a DISTINCT settings consumer boundary', () => {
    const dir = resolveSettingsDataDir();
    expect(dir.endsWith(path.join('', SETTINGS_DATA_SUBDIR))).toBe(true);
    expect(SETTINGS_DATA_SUBDIR).toBe('settings');
  });
});

describe('UI12 — Settings service: update / revision semantics', () => {
  it('persists an authorized update as a new durable revision', () => {
    const s = store();
    const state = updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT);
    expect(state.theme).toBe('dark');
    expect(state.revisionCount).toBe(1);
    expect(state.lastRevisionKind).toBe('settings-updated');
    expect(state.lastRevisionAt).toBe(AT);
  });

  it('creates a distinct revision per update, even for a repeated value', () => {
    const s = store();
    updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT);
    updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT);
    const state = readEffectiveSettings(TENANT_A, USER_1, s);
    // The dedup contract must never silently swallow a revision.
    expect(state.revisionCount).toBe(2);
    expect(state.theme).toBe('dark');
  });

  it('reconstructs the effective state deterministically from the journal', () => {
    const dir = tmpDir();
    const s = store(dir);
    updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT);
    updateSettings(TENANT_A, USER_1, { theme: 'light' }, s, '2026-10-01T00:05:00.000Z');
    updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, '2026-10-01T00:10:00.000Z');

    // A fresh instance over the SAME journal (process restart) folds the identical state.
    const reopened = readEffectiveSettings(TENANT_A, USER_1, store(dir));
    const folded = foldSettings(TENANT_A, USER_1, store(dir));
    expect(reopened).toEqual(folded);
    expect(reopened.theme).toBe('dark');
    expect(reopened.revisionCount).toBe(3);
  });

  it('never rewrites or deletes prior revisions (append-only)', () => {
    const dir = tmpDir();
    const s = store(dir);
    updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT);

    const journal = path.join(dir, 'journal.ndjson');
    const afterFirst = fs.readFileSync(journal, 'utf8');
    const firstLines = afterFirst.split('\n').filter((l) => l.length > 0);

    updateSettings(TENANT_A, USER_1, { theme: 'light' }, s, '2026-10-01T01:00:00.000Z');
    resetSettings(TENANT_A, USER_1, s, '2026-10-01T02:00:00.000Z');

    const afterMore = fs.readFileSync(journal, 'utf8');
    const lines = afterMore.split('\n').filter((l) => l.length > 0);

    // Every earlier line is byte-identical; only new lines were appended.
    expect(lines.slice(0, firstLines.length)).toEqual(firstLines);
    expect(lines.length).toBe(firstLines.length + 2);
  });
});

describe('UI12 — Settings service: reset', () => {
  it('establishes the governed defaults as a NEW revision', () => {
    const s = store();
    updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT);
    const state = resetSettings(TENANT_A, USER_1, s, '2026-10-01T03:00:00.000Z');
    expect(state.theme).toBe(GOVERNED_DEFAULT_PREFERENCES.theme);
    expect(state.lastRevisionKind).toBe('settings-reset');
    expect(state.revisionCount).toBe(2); // the earlier revision remains in the history
  });

  it('survives restart and applies only to the owning user', () => {
    const dir = tmpDir();
    const s = store(dir);
    updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT);
    updateSettings(TENANT_A, USER_2, { theme: 'dark' }, s, AT);
    resetSettings(TENANT_A, USER_1, s, AT);

    const reopened = store(dir);
    expect(readEffectiveSettings(TENANT_A, USER_1, reopened).theme).toBe('light');
    expect(readEffectiveSettings(TENANT_A, USER_2, reopened).theme).toBe('dark');
  });

  it('resetting an untouched owner still yields deterministic governed defaults', () => {
    const s = store();
    const state = resetSettings(TENANT_A, USER_2, s, AT);
    expect(state.theme).toBe(GOVERNED_DEFAULT_PREFERENCES.theme);
    expect(state.revisionCount).toBe(1);
  });
});

describe('UI12 — Settings service: ownership isolation', () => {
  it('isolates owners within the same tenant', () => {
    const s = store();
    updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT);
    expect(readEffectiveSettings(TENANT_A, USER_2, s).theme).toBe('light');
    expect(readEffectiveSettings(TENANT_A, USER_2, s).revisionCount).toBe(0);
  });

  it('isolates tenants across the same user id', () => {
    const s = store();
    updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT);
    const other = readEffectiveSettings(TENANT_B, USER_1, s);
    expect(other.theme).toBe('light');
    expect(other.revisionCount).toBe(0);
  });
});

describe('UI12 — Settings service: closed preference set / validation', () => {
  it('rejects an empty patch instead of writing a spurious revision', () => {
    expect(() => validatePreferencesPatch({})).toThrow(SettingsValidationError);
    expect(() => validatePreferencesPatch({})).toThrow('no-changes');
  });

  it('rejects a non-object patch', () => {
    expect(() => validatePreferencesPatch(null)).toThrow('invalid-settings-payload');
    expect(() => validatePreferencesPatch('dark')).toThrow('invalid-settings-payload');
    expect(() => validatePreferencesPatch(['theme'])).toThrow('invalid-settings-payload');
  });

  it('rejects an unauthorized preference key', () => {
    expect(() => validatePreferencesPatch({ fontScale: 2 })).toThrow('unsupported-setting:fontScale');
  });

  it('rejects the EXCLUDED data-mode / PIT / freshness preferences', () => {
    expect(() => validatePreferencesPatch({ defaultDataMode: 'LIVE' })).toThrow('unsupported-setting:defaultDataMode');
    expect(() => validatePreferencesPatch({ pitMode: 'PIT' })).toThrow('unsupported-setting:pitMode');
    expect(() => validatePreferencesPatch({ freshness: 'STALE' })).toThrow('unsupported-setting:freshness');
  });

  it('rejects client-supplied identity fields', () => {
    expect(() => validatePreferencesPatch({ tenantId: 'tenant-B' })).toThrow('unsupported-setting:tenantId');
    expect(() => validatePreferencesPatch({ userId: 'analyst-b' })).toThrow('unsupported-setting:userId');
    expect(() => validatePreferencesPatch({ theme: 'dark', ownerUserId: 'x' })).toThrow('unsupported-setting:ownerUserId');
  });

  it('rejects an unsupported theme value', () => {
    expect(() => validatePreferencesPatch({ theme: 'sepia' })).toThrow('invalid-theme');
    expect(() => validatePreferencesPatch({ theme: 1 })).toThrow('invalid-theme');
  });

  it('writes nothing when validation fails', () => {
    const s = store();
    expect(() => updateSettings(TENANT_A, USER_1, { defaultDataMode: 'LIVE' }, s, AT)).toThrow(SettingsValidationError);
    const state = readEffectiveSettings(TENANT_A, USER_1, s);
    expect(state.revisionCount).toBe(0);
    expect(state.theme).toBe('light');
  });

  it('accepts each governed theme mode', () => {
    const s = store();
    expect(updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT).theme).toBe('dark');
    expect(updateSettings(TENANT_A, USER_1, { theme: 'light' }, s, AT).theme).toBe('light');
  });
});

describe('UI12 — Settings service: schema versioning (D7)', () => {
  it('exposes a settings schema version distinct from the journal format version', () => {
    // The persistence authority owns the whole-journal version; Settings owns its own.
    expect(SETTINGS_SCHEMA_VERSION).toBe(1);
    const s = store();
    const state = updateSettings(TENANT_A, USER_1, { theme: 'dark' }, s, AT);
    expect(state.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
  });

  it('fails closed on a persisted revision written under an unsupported schema version', () => {
    const dir = tmpDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'journal.ndjson'),
      `${JSON.stringify({ journalFormatVersion: 1 })}\n` +
        `${JSON.stringify({
          seq: 1, op: 'create', recordId: 'r1', tenantId: TENANT_A, ownerUserId: USER_1,
          dedupKey: 'settings-event\u00001\u0000settings-updated',
          payload: { kind: 'settings-updated', schemaVersion: 99, changes: { theme: 'dark' }, at: AT },
          createdAt: AT,
        })}\n`,
    );
    const s = new PersistenceService({ dataDir: dir });
    // Never silently reinterpreted under the current schema.
    expect(() => readEffectiveSettings(TENANT_A, USER_1, s)).toThrow(SettingsSchemaVersionError);
  });

  it('fails closed on a malformed persisted payload', () => {
    const s = store();
    s.append({
      tenantId: TENANT_A,
      ownerUserId: USER_1,
      dedupKey: 'settings-event\u00001\u0000settings-updated',
      payload: { kind: 'settings-updated', at: AT }, // schemaVersion + changes missing
    });
    expect(() => readEffectiveSettings(TENANT_A, USER_1, s)).toThrow(SettingsCorruptionError);
  });

  it('fails closed on an unrecognized record inside the settings journal', () => {
    const s = store();
    s.append({ tenantId: TENANT_A, ownerUserId: USER_1, dedupKey: 'foreign\u0000record', payload: { kind: 'whatever' } });
    expect(() => readEffectiveSettings(TENANT_A, USER_1, s)).toThrow(SettingsCorruptionError);
  });

  it('fails closed on a persisted revision carrying an unauthorized key', () => {
    const s = store();
    s.append({
      tenantId: TENANT_A,
      ownerUserId: USER_1,
      dedupKey: 'settings-event\u00001\u0000settings-updated',
      payload: { kind: 'settings-updated', schemaVersion: SETTINGS_SCHEMA_VERSION, changes: { defaultDataMode: 'LIVE' }, at: AT },
    });
    expect(() => readEffectiveSettings(TENANT_A, USER_1, s)).toThrow(SettingsCorruptionError);
  });

  it('fails closed on an unsupported whole-journal format version', () => {
    const dir = tmpDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'journal.ndjson'), `${JSON.stringify({ journalFormatVersion: 99 })}\n`);
    expect(() => new PersistenceService({ dataDir: dir })).toThrow();
  });

  it('fails closed on a malformed non-final journal line', () => {
    const dir = tmpDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'journal.ndjson'),
      `${JSON.stringify({ journalFormatVersion: 1 })}\n` +
        `{ not-json\n` +
        `${JSON.stringify({ seq: 1, op: 'create', recordId: 'r1', tenantId: TENANT_A, ownerUserId: USER_1, dedupKey: 'x', payload: {}, createdAt: AT })}\n`,
    );
    expect(() => new PersistenceService({ dataDir: dir })).toThrow();
  });
});
