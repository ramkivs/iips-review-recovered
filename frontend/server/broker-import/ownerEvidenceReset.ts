/** Act IIPS-V3-CAP02-OWNER-EVIDENCE-RESET-2026-11-06-01. Offline only.
 * Linux local-filesystem + private POSIX mode/UID qualification. NO ACL inspection,
 * cross-process lock, fsync, power-loss atomicity, automatic retry/restore or secure erasure.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import {
  evaluateBrokerEvidenceOwnerContext,
  type BrokerEvidenceOwnerContext,
} from "./brokerImportEvidenceOwnerResolver.js";
import {
  inspectOwnerJournal,
  exactKeys,
  requireReset as check,
} from "./ownerEvidenceResetJournal.js";
export type OfflineDeclaration = {
  allWritersStopped: boolean;
  localFilesystemNoSync: boolean;
  staleBrowserSessionsClosed: boolean;
  otherRecoveryCopies: string[];
};
export type ResetPhase =
  | "beforeBackup"
  | "afterBackupWrite"
  | "afterBackupVerified"
  | "afterPrepared"
  | "afterConfirmed"
  | "afterRemoval"
  | "afterCompleted";
export type ResetHook = (phase: ResetPhase, plan: ResetPlan) => void; // in-process test seam, NEVER CLI/env/HTTP
export const canonical = (v: any): string =>
  v === null || typeof v !== "object"
    ? JSON.stringify(v)
    : Array.isArray(v)
      ? "[" + v.map(canonical).join(",") + "]"
      : "{" +
        Object.keys(v)
          .sort()
          .map((k) => JSON.stringify(k) + ":" + canonical(v[k]))
          .join(",") +
        "}";
export const digest = (v: Buffer | string) =>
  createHash("sha256").update(v).digest("hex");
const idOK = (s: string) =>
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
    s,
  );
const exists = (p: string) => {
  try {
    fs.lstatSync(p);
    return true;
  } catch (e: any) {
    if (e.code === "ENOENT") return false;
    throw e;
  }
};
function safePath(p: string, directory: boolean, privateMode = true) {
  check(
    path.isAbsolute(p) && path.normalize(p) === p && !p.endsWith("/"),
    "EXPLICIT_CANONICAL_PATH_REQUIRED",
  );
  let current = "/";
  const parts = p.split("/").filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    const s = fs.lstatSync(current);
    check(!s.isSymbolicLink(), "ALIAS_PATH_FORBIDDEN");
    check(
      s.uid === process.getuid!() || s.uid === 0,
      "UNTRUSTED_ANCESTOR_OWNER",
    );
    if (i < parts.length - 1)
      check(
        s.isDirectory() &&
          (!(s.mode & 0o022) || (s.uid === 0 && !!(s.mode & 0o1000))),
        "UNSAFE_ANCESTOR",
      );
  }
  const s = fs.lstatSync(p);
  check(s.uid === process.getuid!(), "OS_OWNER_REQUIRED");
  check(
    directory ? s.isDirectory() : s.isFile() && s.nlink === 1,
    "REGULAR_PRIVATE_FILE_REQUIRED",
  );
  if (privateMode)
    check(
      (s.mode & 0o777) === (directory ? 0o700 : 0o600),
      "PRIVATE_ACCESS_REQUIRED",
    );
  const local = [0xef53, 0x58465342, 0x9123683e, 0x794c7630]; // ext, XFS, btrfs, overlay
  check(
    local.includes(Number(fs.statfsSync(p).type)),
    "UNQUALIFIED_FILESYSTEM",
  );
}
function readPrivate(p: string, max = 256 * 1024 * 1024): Buffer {
  safePath(p, false);
  const fd = fs.openSync(p, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const s = fs.fstatSync(fd);
    check(
      s.size <= max &&
        s.uid === process.getuid!() &&
        s.nlink === 1 &&
        (s.mode & 0o777) === 0o600,
      "UNSAFE_FILE_OR_INSPECTION_LIMIT",
    );
    return fs.readFileSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}
function context(env: NodeJS.ProcessEnv, d: OfflineDeclaration) {
  check(
    process.platform === "linux" &&
      typeof process.getuid === "function" &&
      process.getuid() === process.geteuid!(),
    "UNQUALIFIED_OS",
  );
  exactKeys(d, [
    "allWritersStopped",
    "localFilesystemNoSync",
    "staleBrowserSessionsClosed",
    "otherRecoveryCopies",
  ]);
  check(
    d.allWritersStopped === true &&
      d.localFilesystemNoSync === true &&
      d.staleBrowserSessionsClosed === true &&
      Array.isArray(d.otherRecoveryCopies) &&
      d.otherRecoveryCopies.every(
        (x) =>
          typeof x === "string" &&
          x.length > 0 &&
          x.length <= 4096 &&
          !/[\r\n\x00]/.test(x),
      ),
    "QUIESCENCE_LOCAL_NO_SYNC_ATTESTATION_REQUIRED",
  );
  const data = env.IIPS_DATA_DIR,
    carrier = env.IIPS_BROKER_EVIDENCE_OWNER_PATH;
  check(data && carrier, "EXPLICIT_PATHS_REQUIRED");
  safePath(data, true);
  safePath(carrier, false);
  for (let p = data; ; p = path.dirname(p)) {
    check(!exists(path.join(p, ".git")), "GIT_WORKTREE_FORBIDDEN");
    if (p === path.dirname(p)) break;
  }
  const carrierHash = digest(readPrivate(carrier, 4096));
  const resolved = evaluateBrokerEvidenceOwnerContext(env);
  check(resolved.ok && resolved.context, "APPROVED_TRUSTED_OWNER_REQUIRED");
  check(carrierHash === digest(readPrivate(carrier, 4096)), "CARRIER_CHANGED");
  const target = path.join(data, "journal.ndjson"),
    control = path.join(data, "broker-evidence-reset");
  check(
    carrier !== target && !carrier.startsWith(control + "/"),
    "CARRIER_TARGET_ALIAS",
  );
  if (exists(control)) safePath(control, true);
  return {
    data,
    carrier,
    carrierHash,
    target,
    control,
    owner: resolved.context,
  };
}
function snapshot(target: string, owner: BrokerEvidenceOwnerContext) {
  if (!exists(target))
    return {
      present: false,
      identity: null,
      bytes: 0,
      sha256: digest(Buffer.alloc(0)),
      records: 0,
      events: 0,
      readStateEvents: 0,
    };
  const before = fs.lstatSync(target, { bigint: true });
  const bytes = readPrivate(target);
  const after = fs.lstatSync(target, { bigint: true });
  const identity = (s: typeof before) =>
    [s.dev, s.ino, s.size, s.mtimeNs, s.ctimeNs].map(String);
  check(
    canonical(identity(before)) === canonical(identity(after)) &&
      bytes.length === Number(before.size),
    "SOURCE_CHANGED_DURING_INSPECTION",
  );
  return {
    present: true,
    identity: identity(after),
    bytes: bytes.length,
    sha256: digest(bytes),
    ...inspectOwnerJournal(bytes, owner),
  };
}
function copies(control: string) {
  if (!exists(control)) return [];
  return fs
    .readdirSync(control)
    .filter((n) => n.endsWith(".recovery.ndjson"))
    .sort()
    .map((name) => {
      check(
        idOK(name.slice(0, -".recovery.ndjson".length)),
        "UNKNOWN_RECOVERY_ARTIFACT",
      );
      const bytes = readPrivate(path.join(control, name));
      return { name, bytes: bytes.length, sha256: digest(bytes) };
    });
}
export interface ResetPlan {
  version: 1;
  operationId: string;
  createdAt: string;
  tenantId: string;
  ownerUserId: string;
  target: string;
  carrier: string;
  carrierHash: string;
  source: ReturnType<typeof snapshot>;
  recoveryCopy: string;
  existingRecoveryCopies: ReturnType<typeof copies>;
  declaration: OfflineDeclaration;
  permanentErasure: false;
  planHash: string;
}
const planBody = (p: ResetPlan) => {
  const { planHash, ...body } = p;
  return body;
};
export function createResetPlan(
  env: NodeJS.ProcessEnv,
  declaration: OfflineDeclaration,
): ResetPlan {
  const c = context(env, declaration),
    operationId = randomUUID();
  const p: ResetPlan = {
    version: 1,
    operationId,
    createdAt: new Date().toISOString(),
    ...c.owner,
    target: c.target,
    carrier: c.carrier,
    carrierHash: c.carrierHash,
    source: snapshot(c.target, c.owner),
    recoveryCopy: path.join(c.control, operationId + ".recovery.ndjson"),
    existingRecoveryCopies: copies(c.control),
    declaration: JSON.parse(JSON.stringify(declaration)),
    permanentErasure: false,
    planHash: "",
  };
  p.planHash = digest(canonical(planBody(p)));
  return p;
}
function validate(p: ResetPlan, env: NodeJS.ProcessEnv, d: OfflineDeclaration) {
  exactKeys(p, [
    "version",
    "operationId",
    "createdAt",
    "tenantId",
    "ownerUserId",
    "target",
    "carrier",
    "carrierHash",
    "source",
    "recoveryCopy",
    "existingRecoveryCopies",
    "declaration",
    "permanentErasure",
    "planHash",
  ]);
  check(
    p.version === 1 &&
      idOK(p.operationId) &&
      p.permanentErasure === false &&
      p.planHash === digest(canonical(planBody(p))),
    "PLAN_HASH_OR_SCHEMA_INVALID",
  );
  const c = context(env, d);
  check(
    p.target === c.target &&
      p.carrier === c.carrier &&
      p.recoveryCopy ===
        path.join(c.control, p.operationId + ".recovery.ndjson") &&
      p.tenantId === c.owner.tenantId &&
      p.ownerUserId === c.owner.ownerUserId &&
      p.carrierHash === c.carrierHash &&
      canonical(d) === canonical(p.declaration),
    "PLAN_SCOPE_PATH_OR_DECLARATION_CHANGED",
  );
  exactKeys(p.source, [
    "present",
    "identity",
    "bytes",
    "sha256",
    "records",
    "events",
    "readStateEvents",
  ]);
  check(
    typeof p.source.present === "boolean" &&
      [
        p.source.bytes,
        p.source.records,
        p.source.events,
        p.source.readStateEvents,
      ].every((v) => Number.isSafeInteger(v) && v >= 0),
    "PLAN_SOURCE_INVALID",
  );
  return c;
}
function unchanged(
  p: ResetPlan,
  env: NodeJS.ProcessEnv,
  d: OfflineDeclaration,
) {
  const c = validate(p, env, d);
  check(
    canonical(snapshot(c.target, c.owner)) === canonical(p.source) &&
      canonical(
        copies(c.control).filter(
          (x) => x.name !== path.basename(p.recoveryCopy),
        ),
      ) === canonical(p.existingRecoveryCopies),
    "PLAN_STALE_OR_TARGET_CHANGED",
  );
  return c;
}
function controlDir(p: ResetPlan) {
  const c = path.dirname(p.recoveryCopy);
  if (!exists(c)) fs.mkdirSync(c, { mode: 0o700 });
  safePath(c, true);
  return c;
}
const artifact = (p: ResetPlan, suffix: string) =>
  path.join(path.dirname(p.recoveryCopy), p.operationId + "." + suffix);
export function saveResetPlan(
  p: ResetPlan,
  env: NodeJS.ProcessEnv,
  d: OfflineDeclaration,
) {
  unchanged(p, env, d);
  controlDir(p);
  const file = artifact(p, "plan.json");
  fs.writeFileSync(file, JSON.stringify(p, null, 2) + "\n", {
    mode: 0o600,
    flag: "wx",
  });
  return file;
}
export function loadResetPlan(
  id: string,
  env: NodeJS.ProcessEnv,
  d: OfflineDeclaration,
): ResetPlan {
  check(idOK(id), "INVALID_OPERATION_ID");
  const c = context(env, d);
  const p = JSON.parse(
    readPrivate(
      path.join(c.control, id + ".plan.json"),
      1024 * 1024,
    ).toString(),
  );
  validate(p, env, d);
  check(p.operationId === id, "PLAN_ID_MISMATCH");
  return p;
}
export const resetConfirmation = (p: ResetPlan) =>
  `CLEAR ALL ACTIVE EVIDENCE ${p.operationId} ${p.planHash}`;
const outcome = (phase: string) =>
  phase === "COMPLETED"
    ? "CLEARED_WITH_RETAINED_RECOVERY"
    : phase === "NO_OP"
      ? "NO_OP"
      : "IN_PROGRESS_NOT_SUCCESS";
const phases = [
  "STARTED",
  "COPY_VERIFIED",
  "PREPARED",
  "CONFIRMED",
  "COMPLETED",
];
function audit(p: ResetPlan, phase: string) {
  const file = artifact(p, "audit.ndjson");
  if (phase !== "STARTED") readPrivate(file, 1024 * 1024);
  const entry = {
    version: 1,
    operationId: p.operationId,
    tenantId: p.tenantId,
    ownerUserId: p.ownerUserId,
    planHash: p.planHash,
    sourceHash: p.source.sha256,
    records: p.source.records,
    bytes: p.source.bytes,
    backup: path.basename(p.recoveryCopy),
    backupRetained: phase !== "STARTED" && phase !== "NO_OP",
    planBoundConfirmation: true,
    phase,
    outcome: outcome(phase),
    time: new Date().toISOString(),
  };
  const fd = fs.openSync(
    file,
    fs.constants.O_WRONLY |
      fs.constants.O_NOFOLLOW |
      (phase === "STARTED"
        ? fs.constants.O_CREAT | fs.constants.O_EXCL
        : fs.constants.O_APPEND),
    0o600,
  );
  try {
    const line = Buffer.from(JSON.stringify(entry) + "\n");
    check(fs.writeSync(fd, line) === line.length, "INCOMPLETE_AUDIT_WRITE");
  } finally {
    fs.closeSync(fd);
  }
  const actual = readPrivate(file, 1024 * 1024);
  check(
    actual.toString().endsWith(JSON.stringify(entry) + "\n"),
    "AUDIT_READBACK_FAILED",
  );
}
function verifiedCopy(p: ResetPlan) {
  const b = readPrivate(p.recoveryCopy);
  check(
    b.length === p.source.bytes &&
      digest(b) === p.source.sha256 &&
      canonical(inspectOwnerJournal(b, p)) ===
        canonical({
          records: p.source.records,
          events: p.source.events,
          readStateEvents: p.source.readStateEvents,
        }),
    "RECOVERY_COPY_INVALID",
  );
}
export function executeReset(
  p: ResetPlan,
  confirmation: string,
  env: NodeJS.ProcessEnv,
  d: OfflineDeclaration,
  confirmRemoval: (p: ResetPlan) => string,
  hook?: ResetHook,
): "NO_OP" | "CLEARED_WITH_RETAINED_RECOVERY" {
  unchanged(p, env, d);
  check(
    confirmation === resetConfirmation(p) &&
      typeof confirmRemoval === "function",
    "EXACT_CONFIRMATION_REQUIRED",
  );
  controlDir(p);
  check(
    !exists(artifact(p, "audit.ndjson")) && !exists(p.recoveryCopy),
    "PLAN_ALREADY_ATTEMPTED_OR_COPY_EXISTS",
  );
  audit(p, "STARTED");
  if (!p.source.records) {
    audit(p, "NO_OP");
    check(
      inspectReset(p, env, d).state === "NO_OP_NO_ACTIVE_RECORDS_REMOVED",
      "NO_OP_UNVERIFIED",
    );
    return "NO_OP";
  }
  hook?.("beforeBackup", p);
  unchanged(p, env, d);
  fs.writeFileSync(p.recoveryCopy, readPrivate(p.target), {
    mode: 0o600,
    flag: "wx",
  });
  hook?.("afterBackupWrite", p);
  verifiedCopy(p);
  unchanged(p, env, d);
  audit(p, "COPY_VERIFIED");
  hook?.("afterBackupVerified", p);
  audit(p, "PREPARED");
  hook?.("afterPrepared", p);
  check(
    confirmRemoval(p) === resetConfirmation(p),
    "FINAL_CONFIRMATION_REQUIRED",
  );
  verifiedCopy(p);
  unchanged(p, env, d);
  audit(p, "CONFIRMED");
  hook?.("afterConfirmed", p);
  verifiedCopy(p);
  unchanged(p, env, d);
  const prepared = inspectReset(p, env, d);
  const lastFact = JSON.parse(
    readPrivate(artifact(p, "audit.ndjson"), 1024 * 1024)
      .toString()
      .trimEnd()
      .split("\n")
      .pop()!,
  );
  check(
    prepared.state === "INCOMPLETE_ACTIVE_UNCHANGED" &&
      prepared.backupVerified &&
      lastFact.phase === "CONFIRMED",
    "PREPARED_FACT_NOT_VERIFIED",
  );
  // Sole destructive operation: fixed whole active journal. No directory/backup/unrelated removal.
  fs.unlinkSync(p.target);
  hook?.("afterRemoval", p);
  check(!exists(p.target), "ACTIVE_RECREATED");
  verifiedCopy(p);
  audit(p, "COMPLETED");
  hook?.("afterCompleted", p);
  check(
    inspectReset(p, env, d).state === "COMPLETED_ACTIVE_CLEARED_COPY_RETAINED",
    "COMPLETION_NOT_VERIFIED",
  );
  return "CLEARED_WITH_RETAINED_RECOVERY";
}
export function inspectReset(
  p: ResetPlan,
  env: NodeJS.ProcessEnv,
  d: OfflineDeclaration,
) {
  validate(p, env, d);
  let backupVerified = false;
  try {
    verifiedCopy(p);
    backupVerified = true;
  } catch {
    /* explicitly reported, never repaired */
  }
  const result = (state: string) => ({
    operationId: p.operationId,
    state,
    backupVerified,
    automaticAction: false,
    permanentErasure: false,
  });
  if (!exists(artifact(p, "audit.ndjson")))
    return result("NOT_ATTEMPTED_NO_SUCCESS");
  let events: any[];
  try {
    const raw = readPrivate(
      artifact(p, "audit.ndjson"),
      1024 * 1024,
    ).toString();
    check(raw.endsWith("\n"), "PARTIAL_AUDIT");
    events = raw
      .trimEnd()
      .split("\n")
      .map((x) => JSON.parse(x));
    const expected =
      events[1]?.phase === "NO_OP" ? ["STARTED", "NO_OP"] : phases;
    check(
      events.length >= 1 && events.length <= expected.length,
      "INVALID_PHASE_COUNT",
    );
    events.forEach((e, i) => {
      exactKeys(e, [
        "version",
        "operationId",
        "tenantId",
        "ownerUserId",
        "planHash",
        "sourceHash",
        "records",
        "bytes",
        "backup",
        "backupRetained",
        "planBoundConfirmation",
        "phase",
        "outcome",
        "time",
      ]);
      check(
        e.version === 1 &&
          e.operationId === p.operationId &&
          e.tenantId === p.tenantId &&
          e.ownerUserId === p.ownerUserId &&
          e.planHash === p.planHash &&
          e.sourceHash === p.source.sha256 &&
          e.records === p.source.records &&
          e.bytes === p.source.bytes &&
          e.backup === path.basename(p.recoveryCopy) &&
          e.backupRetained === (i > 0 && e.phase !== "NO_OP") &&
          e.planBoundConfirmation === true &&
          e.phase === expected[i] &&
          e.outcome === outcome(e.phase) &&
          new Date(e.time).toISOString() === e.time &&
          (i === 0 || e.time >= events[i - 1].time),
        "INVALID_AUDIT",
      );
    });
  } catch {
    return result("INVALID_OR_INTERRUPTED_AUDIT_NOT_SUCCESS");
  }
  let same = false;
  try {
    same = canonical(snapshot(p.target, p)) === canonical(p.source);
  } catch {
    /* malformed/foreign active is not unchanged */
  }
  const last = events[events.length - 1].phase;
  if (last === "NO_OP")
    return result(
      same && p.source.records === 0 && !backupVerified
        ? "NO_OP_NO_ACTIVE_RECORDS_REMOVED"
        : "CONTRADICTORY_OR_RECREATED_ACTIVE_NOT_SUCCESS",
    );
  if (exists(p.target))
    return result(
      same && last !== "COMPLETED"
        ? "INCOMPLETE_ACTIVE_UNCHANGED"
        : "CONTRADICTORY_OR_RECREATED_ACTIVE_NOT_SUCCESS",
    );
  return result(
    last === "COMPLETED" && backupVerified
      ? "COMPLETED_ACTIVE_CLEARED_COPY_RETAINED"
      : "INCOMPLETE_ACTIVE_ABSENT_UNKNOWN_NOT_SUCCESS",
  );
}
