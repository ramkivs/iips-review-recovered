/** Raw inspection ONLY: never constructs PF-1 (whose constructor can repair a tail). */
import { TextDecoder } from "node:util";
import {
  BROKER_IMPORT_EVIDENCE_SCHEMA,
  computeEvidenceRecordDigest,
  computeImportId,
  type BrokerImportEvidenceRecord,
} from "./brokerImportEvidenceStore.js";
import type { BrokerEvidenceOwnerContext } from "./brokerImportEvidenceOwnerResolver.js";
export function requireReset(ok: unknown, code: string): asserts ok {
  if (!ok) throw new Error(code);
}
export function exactKeys(
  v: unknown,
  keys: string[],
): asserts v is Record<string, any> {
  requireReset(
    !!v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      Object.keys(v).sort().join("|") === keys.sort().join("|"),
    "UNKNOWN_OR_MISSING_FIELDS",
  );
}
const text = (v: unknown) => typeof v === "string";
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(text);
const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const count = (v: unknown) => Number.isSafeInteger(v) && Number(v) >= 0;
const iso = (v: unknown) =>
  text(v) &&
  Number.isFinite(Date.parse(v as string)) &&
  new Date(v as string).toISOString() === v;
const hash = (v: unknown) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
export function inspectOwnerJournal(
  bytes: Buffer,
  owner: BrokerEvidenceOwnerContext,
) {
  requireReset(
    bytes.length <= 256 * 1024 * 1024,
    "OFFLINE_INSPECTION_LIMIT_NOT_RETENTION_QUOTA",
  );
  if (!bytes.length) return { records: 0, events: 0, readStateEvents: 0 };
  const raw = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  requireReset(raw.endsWith("\n"), "INCOMPLETE_JOURNAL");
  const lines = raw.slice(0, -1).split("\n");
  const header = JSON.parse(lines.shift()!);
  exactKeys(header, ["journalFormatVersion"]);
  requireReset(header.journalFormatVersion === 1, "UNSUPPORTED_JOURNAL");
  const ids = new Set<string>(),
    imports = new Set<string>();
  let reads = 0;
  for (let i = 0; i < lines.length; i++) {
    const e = JSON.parse(lines[i]);
    requireReset(
      e &&
        e.seq === i + 1 &&
        typeof e.recordId === "string" &&
        /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
          e.recordId,
        ),
      "INVALID_EVENT_ORDER_OR_ID",
    );
    if (e.op === "readState") {
      exactKeys(e, ["seq", "op", "recordId", "read", "updatedAt"]);
      requireReset(
        ids.has(e.recordId) && typeof e.read === "boolean" && iso(e.updatedAt),
        "INVALID_READ_STATE",
      );
      reads++;
      continue;
    }
    exactKeys(e, [
      "seq",
      "op",
      "recordId",
      "tenantId",
      "ownerUserId",
      "dedupKey",
      "payload",
      "createdAt",
    ]);
    requireReset(
      e.op === "create" && !ids.has(e.recordId) && iso(e.createdAt),
      "UNKNOWN_OR_DUPLICATE_EVENT",
    );
    const p = e.payload;
    exactKeys(p, [
      "schema",
      "importId",
      "tenantId",
      "ownerUserId",
      "portfolioSlot",
      "broker",
      "variant",
      "fileName",
      "readAt",
      "contentDigest",
      "status",
      "identityAuthority",
      "counts",
      "rows",
      "pipelineRefusals",
      "warnings",
      "validation",
      "saveAuthorization",
      "persistence",
      "reconciliation",
      "limitations",
      "recordDigest",
    ]);
    requireReset(
      e.tenantId === owner.tenantId &&
        e.ownerUserId === owner.ownerUserId &&
        p.tenantId === owner.tenantId &&
        p.ownerUserId === owner.ownerUserId,
      "FOREIGN_OR_MIXED_SCOPE",
    );
    requireReset(
      p.schema === BROKER_IMPORT_EVIDENCE_SCHEMA &&
        text(p.portfolioSlot) &&
        p.portfolioSlot.length > 0 &&
        text(p.broker) &&
        p.broker.length > 0 &&
        (p.variant === null || text(p.variant)) &&
        text(p.fileName) &&
        iso(p.readAt) &&
        hash(p.contentDigest) &&
        [
          "PARSED_UNRESOLVED",
          "PARSED_IDENTITIES_RESOLVED",
          "REJECTED",
          "BLOCKED",
        ].includes(p.status),
      "INVALID_PAYLOAD",
    );
    requireReset(
      hash(p.importId) &&
        p.importId === computeImportId(p.broker, p.contentDigest, p.readAt) &&
        !imports.has(p.importId) &&
        e.dedupKey === `${p.schema}:${p.importId}`,
      "INVALID_IMPORT_ID",
    );
    exactKeys(p.identityAuthority, ["source", "entities"]);
    requireReset(
      p.identityAuthority.source === "IPD_GOVERNED_D05_SECURITY_MASTER" &&
        count(p.identityAuthority.entities),
      "INVALID_AUTHORITY",
    );
    exactKeys(p.counts, [
      "nativeRows",
      "identityAssessedRows",
      "identityResolvedRows",
      "identityUnresolvedRows",
      "savedRows",
    ]);
    requireReset(
      Object.values(p.counts).every(count) &&
        Array.isArray(p.rows) &&
        p.counts.nativeRows === p.rows.length &&
        p.counts.savedRows === 0 &&
        p.counts.identityResolvedRows + p.counts.identityUnresolvedRows ===
          p.counts.nativeRows &&
        p.counts.identityAssessedRows <= p.counts.nativeRows,
      "INVALID_COUNTS",
    );
    let resolved = 0;
    for (let j = 0; j < p.rows.length; j++) {
      const r = p.rows[j];
      exactKeys(r, [
        "rowIndex",
        "symbol",
        "isin",
        "exchange",
        "quantity",
        "averagePrice",
        "currentPrice",
        "identityStatus",
        "identityBasis",
        "identityRefusalCode",
        "quarantineIds",
      ]);
      requireReset(
        r.rowIndex === j + 1 &&
          text(r.symbol) &&
          (r.isin === null || text(r.isin)) &&
          (r.exchange === null || text(r.exchange)) &&
          num(r.quantity) &&
          num(r.averagePrice) &&
          (r.currentPrice === null || num(r.currentPrice)) &&
          ["RESOLVED", "UNRESOLVED"].includes(r.identityStatus) &&
          text(r.identityBasis) &&
          (r.identityRefusalCode === null || text(r.identityRefusalCode)) &&
          strings(r.quarantineIds),
        "INVALID_ROW",
      );
      if (r.identityStatus === "RESOLVED") resolved++;
    }
    requireReset(
      resolved === p.counts.identityResolvedRows &&
        Array.isArray(p.pipelineRefusals),
      "INVALID_ROW_COUNTS",
    );
    for (const r of p.pipelineRefusals) {
      exactKeys(r, ["reason", "details", "stage"]);
      requireReset(Object.values(r).every(text), "INVALID_REFUSAL");
    }
    for (const [key, flag] of [
      ["validation", "performed"],
      ["saveAuthorization", "authorized"],
      ["persistence", "performed"],
    ]) {
      exactKeys(p[key], [flag, "reason"]);
      requireReset(
        p[key][flag] === false && text(p[key].reason),
        "INVALID_NO_WRITE_FACT",
      );
    }
    exactKeys(p.reconciliation, [
      "importedRows",
      "savedRows",
      "difference",
      "disposition",
    ]);
    requireReset(
      p.reconciliation.importedRows === p.rows.length &&
        p.reconciliation.savedRows === 0 &&
        p.reconciliation.difference === p.rows.length &&
        p.reconciliation.disposition === "NO_HOLDINGS_SAVED" &&
        strings(p.warnings) &&
        strings(p.limitations),
      "INVALID_RECONCILIATION",
    );
    const { recordDigest, ...body } = p;
    requireReset(
      hash(recordDigest) &&
        computeEvidenceRecordDigest(
          body as Omit<BrokerImportEvidenceRecord, "recordDigest">,
        ) === recordDigest,
      "RECORD_DIGEST_MISMATCH",
    );
    ids.add(e.recordId);
    imports.add(p.importId);
  }
  return { records: ids.size, events: lines.length, readStateEvents: reads };
}
