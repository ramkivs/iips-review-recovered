/**
 * WS-A — durable broker-import evidence journal (IRR trusted host).
 *
 * WHY THIS EXISTS
 *   The observed Dhan import (2026-11-05T07:50:49.090Z) left NOTHING behind: a browser-local parse
 *   result was displayed and discarded. A digest and a read timestamp on screen are not evidence
 *   retention, and they do not survive process termination. This module retains the governed
 *   equivalent of the import evidence durably, in the owner's local data directory, through the
 *   already-governed PF-1 append-only journal authority (`../persistence/persistence-service`):
 *   no new storage engine, no new dependency, no network, no cross-repository write.
 *
 * WHAT IS RETAINED (per import)
 *   - the native row inventory: every row's name and native values, with ISIN/exchange recorded as
 *     EXPLICITLY ABSENT rather than omitted or invented;
 *   - the content digest reported by the ingest, plus a digest over this evidence record itself;
 *   - source metadata and the read timestamp;
 *   - the per-row identity basis and status (and, once the owning pipeline publishes per-row
 *     assessments, their refusal codes and quarantine ids — the schema already carries them);
 *   - the pipeline refusal details, verbatim;
 *   - the validation and save-authorization decisions (recorded as NOT_PERFORMED / not authorized,
 *     because a preview never performs them);
 *   - the saved-holdings count (0 from the preview) so the reconciliation between imported evidence
 *     and persisted holdings is recorded, not implied.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *   - It never writes holdings, never calls a portfolio store, never resolves identity and never
 *     authorizes a save. `savedRows` is evidence ABOUT a save, never a save.
 *   - It does not retain the raw broker file bytes: the product's recorded statement is that the
 *     CSV is processed locally and not uploaded, and the digest plus the complete parsed inventory
 *     is the governed equivalent. The absence of the raw bytes is recorded as a limitation.
 *   - It fails closed: a storage error propagates. A caller must not report retention that did not
 *     happen.
 *
 * Authority: PF-1 (`IIPS-V3-PF1` durable persistence, Class C filesystem journal, TD-2/TD-3/TD-7a)
 * plus the Workstream A correction recorded in the IRR implementation record of 2026-11-05.
 */
import { createHash } from 'node:crypto';

import { PersistenceService, resolveDataDir } from '../persistence/persistence-service.js';
import type { BrokerHoldingsPreview } from '../../src/api/brokerHoldingsPreview.js';

/** Closed schema id. Any change to the record grammar MUST increment it. */
export const BROKER_IMPORT_EVIDENCE_SCHEMA = 'IIPS_BROKER_IMPORT_EVIDENCE_V1';

/* ------------------------------------------------------------------ *
 * Retention policy — FIXED BY PA ACT, NOT BY CODE
 *
 * Authority: `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` §8.3(16), rendering
 * the PA's Decision 6 of 2026-11-05. These three constants RECORD that decision; they are not a
 * policy this module chooses, and code may never be the origin of a change to any of them — a change
 * requires a new dated PA act.
 *
 * NOTHING HERE DELETES ANYTHING. There is no expiry sweep, no purge, no compaction, no scheduled or
 * size-triggered or count-triggered or import-triggered or restart-triggered or error-triggered or
 * quota-triggered deletion anywhere in this module. Retention is INDEFINITE. Deletion is
 * EXPLICIT-OWNER-ONLY and is exercised OUTSIDE the HTTP surface (§8.3(16)(h)); the admitted route is
 * read-only and no `DELETE` exists anywhere in this namespace. The review threshold below is a
 * WARNING AND REVIEW point only — crossing it changes no behaviour and destroys no data, and it is
 * not a quota.
 * ------------------------------------------------------------------ */

/** §8.3(16)(a) — retention period: INDEFINITE, no expiry, until explicit deletion by the owner. */
export const BROKER_EVIDENCE_RETENTION_POLICY = 'INDEFINITE';

/** §8.3(16)(b)/(c) — purge basis: EXPLICIT-ONLY, expressly not time-based and not count-based. */
export const BROKER_EVIDENCE_DELETION_MODE = 'EXPLICIT_OWNER_ONLY';

/**
 * §8.3(16)(g) and §4.4 — the PA-settable WARNING / REVIEW threshold: 50 MB of retained parsed
 * evidence in the owner's scope. Surfaced through obligation O-1's permitted means. It is NEVER an
 * automatic deletion trigger and there is no quota; a later PA act may change the value.
 */
export const BROKER_EVIDENCE_REVIEW_THRESHOLD_BYTES = 50 * 1024 * 1024;

export interface BrokerImportEvidenceRow {
  readonly rowIndex: number;
  readonly symbol: string;
  readonly isin: string | null;
  readonly exchange: string | null;
  readonly quantity: number;
  readonly averagePrice: number;
  readonly currentPrice: number | null;
  readonly identityStatus: 'RESOLVED' | 'UNRESOLVED';
  readonly identityBasis: string;
  readonly identityRefusalCode: string | null;
  readonly quarantineIds: readonly string[];
}

export interface BrokerImportEvidenceRecord {
  readonly schema: typeof BROKER_IMPORT_EVIDENCE_SCHEMA;
  /** Deterministic identity of the import attempt: broker + content digest + read timestamp. */
  readonly importId: string;
  readonly tenantId: string;
  readonly ownerUserId: string;
  readonly portfolioSlot: string;
  readonly broker: string;
  readonly variant: string | null;
  readonly fileName: string;
  readonly readAt: string;
  readonly contentDigest: string;
  readonly status: string;
  readonly identityAuthority: { readonly source: string; readonly entities: number };
  readonly counts: {
    readonly nativeRows: number;
    readonly identityAssessedRows: number;
    readonly identityResolvedRows: number;
    readonly identityUnresolvedRows: number;
    readonly savedRows: number;
  };
  readonly rows: readonly BrokerImportEvidenceRow[];
  readonly pipelineRefusals: readonly { readonly reason: string; readonly details: string; readonly stage: string }[];
  readonly warnings: readonly string[];
  readonly validation: { readonly performed: false; readonly reason: string };
  readonly saveAuthorization: { readonly authorized: false; readonly reason: string };
  readonly persistence: { readonly performed: false; readonly reason: string };
  readonly reconciliation: {
    readonly importedRows: number;
    readonly savedRows: number;
    readonly difference: number;
    readonly disposition: 'NO_HOLDINGS_SAVED' | 'RECONCILED';
  };
  readonly limitations: readonly string[];
  /** SHA-256 over the canonical form of this record WITHOUT this field. */
  readonly recordDigest: string;
}

export type RetainedBrokerImportEvidence = {
  readonly recordId: string;
  readonly duplicate: boolean;
  readonly record: BrokerImportEvidenceRecord;
};

/**
 * Obligation O-1 storage-usage summary for ONE owner scope (AMEND-01 §4.3, §8.3(16)(e)).
 *
 * A review aid only. It is never a quota, never a deletion trigger and never a reason to refuse an
 * import or a read: crossing the review threshold changes no behaviour and destroys no data.
 */
export interface BrokerImportEvidenceStorageUsage {
  /** Number of evidence records retained in this owner scope. */
  readonly recordCount: number;
  /** Approximate UTF-8 bytes of the retained payloads — a lower bound, see `describeStorageUsage`. */
  readonly approximateBytes: number;
}

export class BrokerImportEvidenceError extends Error {
  constructor(readonly code: 'EVIDENCE_TAMPERED' | 'EVIDENCE_NOT_FOUND' | 'EVIDENCE_INVALID', message: string) {
    super(message);
    this.name = 'BrokerImportEvidenceError';
  }
}

/**
 * Canonical JSON: object keys sorted, stable for the same record. The record digest is computed and
 * verified over this form only, so it cannot drift with key order.
 */
function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
}

/**
 * Narrow a journal payload to a plain object so its `importId` can be compared.
 *
 * Defensive by design: the journal is shared with other Class-C consumers, so a payload is never
 * assumed to be an evidence record. Anything that is not a plain object simply cannot match, and is
 * skipped rather than throwing — an unrelated record must not make an evidence read fail.
 */
function isRecordPayload(payload: unknown): payload is Record<string, unknown> {
  return payload !== null && typeof payload === 'object' && !Array.isArray(payload);
}

export function computeEvidenceRecordDigest(record: Omit<BrokerImportEvidenceRecord, 'recordDigest'>): string {
  return createHash('sha256').update(canonicalJson(record), 'utf8').digest('hex');
}

export function computeImportId(broker: string, contentDigest: string, readAt: string): string {
  return createHash('sha256').update(`${broker}\u0000${contentDigest}\u0000${readAt}`, 'utf8').digest('hex');
}

export interface BuildEvidenceInput {
  readonly tenantId: string;
  readonly ownerUserId: string;
  readonly portfolioSlot: string;
  readonly fileName: string;
  readonly preview: BrokerHoldingsPreview;
}

/** Builds the governed evidence record from a completed preview. Pure; no I/O. */
export function buildBrokerImportEvidence(input: BuildEvidenceInput): BrokerImportEvidenceRecord {
  const { preview } = input;
  const rows: BrokerImportEvidenceRow[] = preview.holdings.map((h, i) => ({
    rowIndex: i + 1,
    symbol: h.symbol,
    isin: h.isin,
    exchange: h.exchange,
    quantity: h.quantity,
    averagePrice: h.averagePrice,
    currentPrice: h.currentPrice,
    identityStatus: h.identityStatus,
    identityBasis: h.identityBasis,
    // Populated from the pinned pipeline's OWN published per-row assessment. IRR never derives a
    // refusal code and never mints a quarantine id; when the pipeline published no individual
    // outcome these stay null/empty, exactly as before the pin advance.
    identityRefusalCode: h.identityRefusalCode,
    quarantineIds: [...h.quarantineIds],
  }));
  const withoutDigest: Omit<BrokerImportEvidenceRecord, 'recordDigest'> = {
    schema: BROKER_IMPORT_EVIDENCE_SCHEMA,
    importId: computeImportId(preview.broker, preview.contentDigest, preview.asOf),
    tenantId: input.tenantId,
    ownerUserId: input.ownerUserId,
    portfolioSlot: input.portfolioSlot,
    broker: preview.broker,
    variant: preview.variant ?? null,
    fileName: input.fileName,
    readAt: preview.asOf,
    contentDigest: preview.contentDigest,
    status: preview.status,
    identityAuthority: { ...preview.identityAuthority },
    counts: { ...preview.counts },
    rows,
    pipelineRefusals: preview.rejections.map((r) => ({ reason: r.reason, details: r.details, stage: r.stage })),
    warnings: [...preview.warnings],
    validation: { performed: false, reason: preview.notPerformed.reason },
    saveAuthorization: { authorized: false, reason: preview.notPerformed.reason },
    persistence: { performed: false, reason: preview.notPerformed.reason },
    reconciliation: {
      importedRows: rows.length,
      savedRows: preview.counts.savedRows,
      difference: rows.length - preview.counts.savedRows,
      disposition: preview.counts.savedRows === 0 ? 'NO_HOLDINGS_SAVED' : 'RECONCILED',
    },
    limitations: [
      'The raw broker file bytes are not retained: the CSV is processed locally and is not uploaded.',
      'The content digest is retained as reported by the ingest; without the raw bytes it cannot be re-verified.',
      ...(preview.perRowIdentityEvidencePublished
        ? [
            'Per-row refusal codes and P04 quarantine ids are the pinned pipeline\u2019s own published assessment evidence; IRR derives none of them. Identity remains unresolved for every row the governed master did not resolve, and the whole-import P04 refusal remains in force.',
            'P04 quarantine record ids are minted per lookup by the IPD-owned pipeline and are therefore process-specific. The FIRST retention of an import is the authoritative evidence record; a repeated import is a no-op that returns it unchanged, so the retained record digest is stable even though a freshly rebuilt one is not.',
          ]
        : [
            'The pipeline published no per-row identity outcome for this run, so per-row refusal codes are empty and every row records a file-level identity basis.',
          ]),
    ],
  };
  return { ...withoutDigest, recordDigest: computeEvidenceRecordDigest(withoutDigest) };
}

/**
 * Append-only evidence journal. One record per (tenant, owner, importId) — a duplicate retention
 * is a no-op that returns the existing record, so restart and retry never duplicate evidence.
 */
export class BrokerImportEvidenceStore {
  private readonly journal: PersistenceService;

  constructor(options: { readonly dataDir?: string } = {}) {
    this.journal = new PersistenceService({ dataDir: options.dataDir ?? resolveDataDir() });
  }

  retain(record: BrokerImportEvidenceRecord): RetainedBrokerImportEvidence {
    this.assertValid(record);
    const dedupKey = `${BROKER_IMPORT_EVIDENCE_SCHEMA}:${record.importId}`;
    const duplicate = this.journal.exists(record.tenantId, record.ownerUserId, dedupKey);
    // A storage failure propagates: retention is never reported when the journal write failed.
    const persisted = this.journal.append({
      tenantId: record.tenantId,
      ownerUserId: record.ownerUserId,
      dedupKey,
      payload: record,
    });
    return { recordId: persisted.recordId, duplicate, record: this.verify(persisted.payload) };
  }

  exists(tenantId: string, ownerUserId: string, importId: string): boolean {
    return this.journal.exists(tenantId, ownerUserId, `${BROKER_IMPORT_EVIDENCE_SCHEMA}:${importId}`);
  }

  read(tenantId: string, ownerUserId: string, recordId: string): BrokerImportEvidenceRecord {
    const persisted = this.journal.readById(tenantId, ownerUserId, recordId);
    if (!persisted) throw new BrokerImportEvidenceError('EVIDENCE_NOT_FOUND', 'The evidence record is not present for this owner.');
    return this.verify(persisted.payload);
  }

  /**
   * Resolve ONE record by `importId`, strictly inside the caller's `(tenantId, ownerUserId)` scope.
   *
   * WHY THIS EXISTS. PF-1 exposes `readById(tenant, owner, recordId)` and `exists(tenant, owner,
   * dedupKey)` but no read-by-dedupKey, and `recordId` is a `randomUUID()` minted at append time —
   * it is NOT derivable from `importId`. The admitted route addresses evidence by `importId`, so one
   * scoped resolution step is needed. PF-1 is used through its existing authority only: it is not
   * modified, not extended and not converted into an access-control boundary (AMEND-01 §8.2(9)).
   *
   * OWNER ISOLATION IS STRUCTURAL, NOT A FILTER APPLIED AFTERWARDS. `listOrdered` yields only records
   * whose `tenantId` AND `ownerUserId` both equal the arguments, so a record retained under any other
   * scope is never a candidate and can never be returned, compared against or disclosed. Cross-owner
   * access is impossible by construction, not by a check that could be forgotten.
   *
   * NON-ENUMERATION. This resolves AT MOST ONE record and returns no list, no count of candidates and
   * no neighbouring `importId`. The HTTP surface built on it therefore cannot enumerate
   * (AMEND-01 §8.1(1), §8.5(19)); the four-segment collection form stays `404`.
   *
   * Returns `null` when no record in scope carries that `importId` — the caller maps `null` to the
   * same opaque `404` used for a malformed or out-of-scope id, so absence is indistinguishable from
   * non-retention (§8.1(5)). Throws `EVIDENCE_TAMPERED` / `EVIDENCE_INVALID` when a matching record
   * fails re-verification: a tampered record is NEVER served and NEVER silently treated as absent
   * (§8.3(15)).
   */
  readByImportId(tenantId: string, ownerUserId: string, importId: string): BrokerImportEvidenceRecord | null {
    const match = this.journal
      .listOrdered(tenantId, ownerUserId)
      .find((p) => isRecordPayload(p.payload) && p.payload.importId === importId);
    if (!match) return null;
    return this.verify(match.payload);
  }

  /**
   * Obligation O-1 (AMEND-01 §4.3, §8.3(16)(e)) — storage-usage visibility for the owner's scope,
   * WITHOUT any new endpoint. Count and approximate bytes are surfaced through the already-admitted
   * evidence response and the operator runbook; no collection, metrics or admin route exists.
   *
   * `approximateBytes` sums the UTF-8 JSON length of each retained record's payload. It is an
   * APPROXIMATION and a lower bound: it excludes the journal's per-line envelope and excludes
   * non-evidence records that share the same Class-C journal file. It is a review aid, never a quota
   * — nothing here deletes, truncates, refuses or degrades (§8.3(16)(g)).
   */
  describeStorageUsage(tenantId: string, ownerUserId: string): BrokerImportEvidenceStorageUsage {
    const payloads = this.journal.listOrdered(tenantId, ownerUserId).map((p) => p.payload);
    let approximateBytes = 0;
    for (const payload of payloads) {
      approximateBytes += Buffer.byteLength(canonicalJson(payload), 'utf8');
    }
    return Object.freeze({ recordCount: payloads.length, approximateBytes });
  }

  list(tenantId: string, ownerUserId: string): Array<{ recordId: string; record: BrokerImportEvidenceRecord }> {
    return this.journal.listOrdered(tenantId, ownerUserId).map((p) => ({ recordId: p.recordId, record: this.verify(p.payload) }));
  }

  private assertValid(record: BrokerImportEvidenceRecord): void {
    if (record.schema !== BROKER_IMPORT_EVIDENCE_SCHEMA) {
      throw new BrokerImportEvidenceError('EVIDENCE_INVALID', 'The evidence record schema is not supported.');
    }
    if (!/^[0-9a-f]{64}$/.test(record.contentDigest)) {
      throw new BrokerImportEvidenceError('EVIDENCE_INVALID', 'The retained content digest is not a 64-character lowercase hex SHA-256.');
    }
    if (record.rows.length !== record.counts.nativeRows) {
      throw new BrokerImportEvidenceError('EVIDENCE_INVALID', 'The retained row inventory does not match the recorded native row count.');
    }
    if (record.rows.some((row, i) => row.rowIndex !== i + 1)) {
      throw new BrokerImportEvidenceError('EVIDENCE_INVALID', 'The retained row inventory is not a complete, ordered row set.');
    }
  }

  /** Re-verifies the stored record on every read; a tampered journal fails closed. */
  private verify(payload: unknown): BrokerImportEvidenceRecord {
    if (!payload || typeof payload !== 'object') {
      throw new BrokerImportEvidenceError('EVIDENCE_INVALID', 'The stored evidence payload is not an object.');
    }
    const record = payload as BrokerImportEvidenceRecord;
    this.assertValid(record);
    const { recordDigest, ...rest } = record;
    if (computeEvidenceRecordDigest(rest) !== recordDigest) {
      throw new BrokerImportEvidenceError('EVIDENCE_TAMPERED', 'The stored evidence record does not match its digest.');
    }
    return record;
  }
}
