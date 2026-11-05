/** @vitest-environment node */
// Only isolated synthetic temporary data. Never use inherited operational evidence paths.
import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { spawnSync } from "node:child_process";
import {
  buildBrokerImportEvidence,
  BrokerImportEvidenceStore,
} from "./brokerImportEvidenceStore.js";
import { CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT } from "./brokerImportEvidenceOwnerCarrier.js";
import { resolveBrokerEvidenceOwnerContext } from "./brokerImportEvidenceOwnerResolver.js";
import { PersistenceService } from "../persistence/persistence-service.js";
import { previewBrokerHoldings } from "../../src/api/brokerHoldingsPreview.js";
import { handleBrokerImportRequest } from "./brokerImportHttp.js";
import { BINDING_PRECONDITION_SETTING } from "../user-portfolio/ownerContextFromBinding.js";
import { runOwnerResetCli } from "./ownerEvidenceResetCli.js";
import {
  canonical,
  digest,
  createResetPlan,
  executeReset,
  inspectReset,
  loadResetPlan,
  resetConfirmation,
  saveResetPlan,
  type OfflineDeclaration,
  type ResetPlan,
  type ResetPhase,
  type ResetHook,
} from "./ownerEvidenceReset.js";
const d: OfflineDeclaration = {
  allWritersStopped: true,
  localFilesystemNoSync: true,
  staleBrowserSessionsClosed: true,
  otherRecoveryCopies: [],
};
const dirs: string[] = [];
function fixture(empty = false) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "iips-synthetic-owner-reset-"),
  );
  dirs.push(root);
  fs.chmodSync(root, 0o700);
  const data = path.join(root, "data");
  fs.mkdirSync(data, { mode: 0o700 });
  const carrier = path.join(root, "owner.json");
  fs.writeFileSync(carrier, CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT, {
    mode: 0o600,
  });
  const env = { IIPS_DATA_DIR: data, IIPS_BROKER_EVIDENCE_OWNER_PATH: carrier };
  const owner = resolveBrokerEvidenceOwnerContext(env)!;
  const store = new BrokerImportEvidenceStore({ dataDir: data });
  const csv =
    "Name,Quantity,Avg Price,Last Traded,Investment,Current Value,P&L,P&L %\nSYNTHETIC-ONLY,3,10,10,30,30,0,0\n";
  const records = [];
  if (!empty)
    for (let i = 0; i < 2; i++)
      records.push(
        store.retain(
          buildBrokerImportEvidence({
            ...owner,
            portfolioSlot: "P1-BROKER",
            fileName: "SYNTHETIC.csv",
            preview: previewBrokerHoldings(
              csv,
              "SYNTHETIC.csv",
              `2026-11-06T01:02:0${i}.000Z`,
            ),
          }),
        ),
      );
  if (records[0])
    new PersistenceService({ dataDir: data }).updateReadState(
      owner.tenantId,
      owner.ownerUserId,
      records[0].recordId,
      true,
    );
  const target = path.join(data, "journal.ndjson");
  if (!fs.existsSync(target))
    fs.writeFileSync(target, '{"journalFormatVersion":1}\n', { mode: 0o600 });
  fs.chmodSync(target, 0o600);
  for (const name of ["holdings", "transactions", "settings", "watchlists"])
    fs.writeFileSync(
      path.join(data, name + ".json"),
      "SYNTHETIC unrelated " + name,
      { mode: 0o600 },
    );
  return {
    root,
    data,
    carrier,
    target,
    env,
    owner,
    records,
    original: fs.readFileSync(target),
  };
}
const execute = (p: ResetPlan, env: NodeJS.ProcessEnv, hook?: ResetHook) =>
  executeReset(p, resetConfirmation(p), env, d, resetConfirmation, hook);
const auditPath = (p: ResetPlan) =>
  path.join(path.dirname(p.recoveryCopy), p.operationId + ".audit.ndjson");
function preserved(f: ReturnType<typeof fixture>) {
  expect(fs.readFileSync(f.target)).toEqual(f.original);
  for (const name of ["holdings", "transactions", "settings", "watchlists"])
    expect(fs.readFileSync(path.join(f.data, name + ".json"), "utf8")).toBe(
      "SYNTHETIC unrelated " + name,
    );
}
afterEach(() => {
  for (const dir of dirs.splice(0))
    fs.rmSync(dir, { recursive: true, force: true });
});
describe("authorized offline whole-journal reset: synthetic acceptance", () => {
  it("AC1 raw read-only planning: full valid PF-1 create/readState, exact bytes/hash/count/owner", () => {
    const f = fixture(),
      p = createResetPlan(f.env, d);
    expect(p.source.records).toBe(2);
    expect(p.source.events).toBe(3);
    expect(p.source.readStateEvents).toBe(1);
    expect(p.source.sha256).toBe(digest(f.original));
    expect(p.source.bytes).toBe(f.original.length);
    expect(p.ownerUserId).toBe("owner-4dc756b3");
    expect(p.tenantId).toBe("irr-personal-073dd1c8");
    preserved(f);
    saveResetPlan(p, f.env, d);
    expect(loadResetPlan(p.operationId, f.env, d)).toEqual(p);
    expect(inspectReset(p, f.env, d).state).toBe("NOT_ATTEMPTED_NO_SUCCESS");
  });
  it("AC2 incorrect targets: relative/Git paths, directory, symlink and hardlink all refused", () => {
    const f = fixture();
    expect(() =>
      createResetPlan({ ...f.env, IIPS_DATA_DIR: "." }, d),
    ).toThrow();
    expect(() =>
      createResetPlan({ ...f.env, IIPS_DATA_DIR: path.resolve("..") }, d),
    ).toThrow();
    const alias = path.join(f.root, "alias");
    fs.symlinkSync(f.data, alias);
    expect(() =>
      createResetPlan({ ...f.env, IIPS_DATA_DIR: alias }, d),
    ).toThrow("ALIAS");
    fs.renameSync(f.target, f.target + ".original");
    fs.symlinkSync(f.target + ".original", f.target);
    expect(() => createResetPlan(f.env, d)).toThrow("ALIAS");
    fs.unlinkSync(f.target);
    fs.linkSync(f.target + ".original", f.target);
    expect(() => createResetPlan(f.env, d)).toThrow("REGULAR_PRIVATE_FILE");
    fs.unlinkSync(f.target);
    fs.mkdirSync(f.target, { mode: 0o700 });
    expect(() => createResetPlan(f.env, d)).toThrow();
    fs.rmdirSync(f.target);
    fs.renameSync(f.target + ".original", f.target);
    preserved(f);
    const p = createResetPlan(f.env, d);
    p.target = path.join(f.data, "holdings.json");
    const { planHash, ...body } = p;
    p.planHash = digest(canonical(body));
    expect(() => execute(p, f.env)).toThrow("PLAN_SCOPE_PATH");
    preserved(f);
  });
  it("AC3 trusted carrier and OS private access + explicit quiescence are mandatory", () => {
    const f = fixture();
    expect(() => createResetPlan({ IIPS_DATA_DIR: f.data }, d)).toThrow();
    const bytes = fs.readFileSync(f.carrier);
    fs.writeFileSync(f.carrier, "{}");
    expect(() => createResetPlan(f.env, d)).toThrow("APPROVED_TRUSTED_OWNER");
    fs.writeFileSync(f.carrier, bytes);
    for (const file of [f.target, f.carrier]) {
      fs.chmodSync(file, 0o644);
      expect(() => createResetPlan(f.env, d)).toThrow("PRIVATE_ACCESS");
      fs.chmodSync(file, 0o600);
    }
    fs.chmodSync(f.data, 0o755);
    expect(() => createResetPlan(f.env, d)).toThrow("PRIVATE_ACCESS");
    fs.chmodSync(f.data, 0o700);
    for (const key of [
      "allWritersStopped",
      "localFilesystemNoSync",
      "staleBrowserSessionsClosed",
    ])
      expect(() => createResetPlan(f.env, { ...d, [key]: false })).toThrow(
        "ATTESTATION",
      );
    preserved(f);
  });
  it("AC4 foreign/mixed scope, unknown schema/events, row-order/digest/import tampering and malformed tails preserve every byte", () => {
    const f = fixture();
    const lines = f.original.toString().trimEnd().split("\n");
    const variants = [
      f.original.toString().replace("owner-4dc756b3", "foreign-owner"),
      f.original
        .toString()
        .split("IIPS_BROKER_IMPORT_EVIDENCE_V1")
        .join("UNKNOWN"),
      f.original.toString().replace('"op":"create"', '"op":"delete"'),
      f.original.toString().replace('"rowIndex":1', '"rowIndex":9'),
      f.original.toString().replace("SYNTHETIC-ONLY", "TAMPERED"),
      f.original.toString().replace('"importId":"', '"importId":"a'),
      f.original.toString() + "{partial",
      lines
        .map((s, i) => (i === 0 ? '{"journalFormatVersion":2}' : s))
        .join("\n") + "\n",
    ];
    for (const raw of variants) {
      fs.writeFileSync(f.target, raw);
      expect(() => createResetPlan(f.env, d)).toThrow();
      expect(fs.readFileSync(f.target, "utf8")).toBe(raw);
    }
    fs.writeFileSync(f.target, f.original);
    preserved(f);
  });
  it("AC5 missing/wrong-plan/final-denied confirmation cancels; attempted plans cannot be reused", () => {
    const f = fixture(),
      p = createResetPlan(f.env, d),
      wrong = createResetPlan(f.env, d);
    for (const phrase of [
      "",
      resetConfirmation(wrong),
      resetConfirmation(p).toLowerCase(),
    ])
      expect(() =>
        executeReset(p, phrase, f.env, d, resetConfirmation),
      ).toThrow("EXACT_CONFIRMATION");
    expect(fs.existsSync(p.recoveryCopy)).toBe(false);
    expect(fs.existsSync(auditPath(p))).toBe(false);
    preserved(f);
    expect(() =>
      executeReset(p, resetConfirmation(p), f.env, d, () => "NO"),
    ).toThrow("FINAL_CONFIRMATION");
    preserved(f);
    expect(fs.readFileSync(p.recoveryCopy)).toEqual(f.original);
    expect(inspectReset(p, f.env, d).state).toBe("INCOMPLETE_ACTIVE_UNCHANGED");
    expect(() => execute(p, f.env)).toThrow("PLAN_ALREADY_ATTEMPTED");
  });
  it("AC6 stale source, changed census/carrier or altered plan invalidates the confirmation before removal", () => {
    const f = fixture(),
      p = createResetPlan(f.env, d);
    saveResetPlan(p, f.env, d);
    fs.appendFileSync(f.target, "\n");
    expect(() => execute(p, f.env)).toThrow();
    fs.writeFileSync(f.target, f.original);
    const q = createResetPlan(f.env, d);
    fs.writeFileSync(
      path.join(
        path.dirname(q.recoveryCopy),
        "11111111-1111-4111-8111-111111111111.recovery.ndjson",
      ),
      "other copy",
      { mode: 0o600 },
    );
    expect(() => execute(q, f.env)).toThrow("PLAN_STALE");
    expect(() => execute({ ...q, planHash: "0".repeat(64) }, f.env)).toThrow(
      "PLAN_HASH",
    );
    preserved(f);
  });
  it("AC7/8/9 whole active journal cleared ONLY after original-byte verified copy, PREPARED, fresh confirmation and CONFIRMED audit; copies/audit/unrelated data retained", () => {
    const f = fixture(),
      p = createResetPlan(f.env, d);
    let before = false;
    expect(
      executeReset(
        p,
        resetConfirmation(p),
        f.env,
        d,
        (current) => {
          expect(current.planHash).toBe(p.planHash);
          expect(fs.readFileSync(p.recoveryCopy)).toEqual(f.original);
          expect(fs.readFileSync(auditPath(p), "utf8")).toContain("PREPARED");
          preserved(f);
          return resetConfirmation(p);
        },
        (phase) => {
          if (phase === "afterConfirmed") {
            before = true;
            preserved(f);
            expect(fs.readFileSync(p.recoveryCopy)).toEqual(f.original);
            expect(fs.readFileSync(auditPath(p), "utf8")).toContain(
              "CONFIRMED",
            );
          }
        },
      ),
    ).toBe("CLEARED_WITH_RETAINED_RECOVERY");
    expect(before).toBe(true);
    expect(fs.existsSync(f.target)).toBe(false);
    expect(fs.readFileSync(p.recoveryCopy)).toEqual(f.original);
    expect(fs.statSync(p.recoveryCopy).mode & 0o777).toBe(0o600);
    const audit = fs.readFileSync(auditPath(p), "utf8");
    expect(audit).not.toContain("SYNTHETIC");
    expect(
      audit
        .trim()
        .split("\n")
        .map((s) => JSON.parse(s).phase),
    ).toEqual([
      "STARTED",
      "COPY_VERIFIED",
      "PREPARED",
      "CONFIRMED",
      "COMPLETED",
    ]);
    expect(inspectReset(p, f.env, d).state).toBe(
      "COMPLETED_ACTIVE_CLEARED_COPY_RETAINED",
    );
    for (const name of ["holdings", "transactions", "settings", "watchlists"])
      expect(fs.readFileSync(path.join(f.data, name + ".json"), "utf8")).toBe(
        "SYNTHETIC unrelated " + name,
      );
    expect(fs.readFileSync(f.carrier, "utf8")).toBe(
      CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT,
    );
  });
  it.each([
    "existing-copy",
    "corrupt-copy",
    "missing-copy",
    "audit-start",
    "audit-prepare",
    "audit-complete",
    "audit-late-corruption",
  ])("AC10 fail-closed backup/audit fault: %s", (scenario) => {
    const f = fixture(),
      p = createResetPlan(f.env, d);
    saveResetPlan(p, f.env, d);
    if (scenario === "existing-copy")
      fs.writeFileSync(p.recoveryCopy, "preserve existing", { mode: 0o600 });
    if (scenario === "audit-start") fs.mkdirSync(auditPath(p), { mode: 0o700 });
    expect(() =>
      execute(p, f.env, (phase) => {
        if (scenario === "audit-late-corruption" && phase === "afterConfirmed")
          fs.appendFileSync(auditPath(p), "{broken");
        if (scenario === "corrupt-copy" && phase === "afterBackupWrite")
          fs.writeFileSync(p.recoveryCopy, "corrupt");
        if (scenario === "missing-copy" && phase === "afterPrepared")
          fs.unlinkSync(p.recoveryCopy);
        if (
          (scenario === "audit-prepare" && phase === "afterBackupVerified") ||
          (scenario === "audit-complete" && phase === "afterRemoval")
        )
          fs.chmodSync(auditPath(p), 0o400);
      }),
    ).toThrow();
    if (scenario === "audit-complete") {
      expect(fs.existsSync(f.target)).toBe(false);
      expect(fs.readFileSync(p.recoveryCopy)).toEqual(f.original);
      expect(inspectReset(p, f.env, d).state).not.toBe(
        "COMPLETED_ACTIVE_CLEARED_COPY_RETAINED",
      );
    } else preserved(f);
    if (scenario === "existing-copy")
      expect(fs.readFileSync(p.recoveryCopy, "utf8")).toBe("preserve existing");
  });
  it("AC11 missing and empty/header-only journals are explicit NO_OP; header is not removed", () => {
    const f = fixture(true),
      original = fs.readFileSync(f.target),
      p = createResetPlan(f.env, d);
    expect(execute(p, f.env)).toBe("NO_OP");
    expect(fs.readFileSync(f.target)).toEqual(original);
    expect(inspectReset(p, f.env, d).state).toBe(
      "NO_OP_NO_ACTIVE_RECORDS_REMOVED",
    );
    fs.unlinkSync(f.target);
    const absent = createResetPlan(f.env, d);
    expect(execute(absent, f.env)).toBe("NO_OP");
    expect(fs.existsSync(f.target)).toBe(false);
    expect(fs.existsSync(absent.recoveryCopy)).toBe(false);
  });
  it("AC12 every phase real process SIGKILL, fresh-process truthful status; no automatic resume/restore, explicit restore only without overwrite", () => {
    const phases: ResetPhase[] = [
      "beforeBackup",
      "afterBackupWrite",
      "afterBackupVerified",
      "afterPrepared",
      "afterConfirmed",
      "afterRemoval",
      "afterCompleted",
    ];
    for (const phase of phases) {
      const f = fixture(),
        p = createResetPlan(f.env, d);
      saveResetPlan(p, f.env, d);
      const args = [
        "--import",
        "tsx",
        "server/broker-import/__fixtures__/ownerResetProcess.ts",
      ];
      const options = {
        env: { ...process.env, ...f.env },
        encoding: "utf8" as const,
        timeout: 20000,
      };
      const child = spawnSync(
        process.execPath,
        [...args, "kill", p.operationId, phase],
        options,
      );
      expect(child.signal, child.stderr).toBe("SIGKILL");
      const status = spawnSync(
        process.execPath,
        [...args, "status", p.operationId],
        options,
      );
      expect(status.status, status.stderr).toBe(0);
      const result = JSON.parse(status.stdout);
      const removed = ["afterRemoval", "afterCompleted"].includes(phase);
      expect(fs.existsSync(f.target)).toBe(!removed);
      expect(result.state).toBe(
        phase === "afterCompleted"
          ? "COMPLETED_ACTIVE_CLEARED_COPY_RETAINED"
          : phase === "afterRemoval"
            ? "INCOMPLETE_ACTIVE_ABSENT_UNKNOWN_NOT_SUCCESS"
            : "INCOMPLETE_ACTIVE_UNCHANGED",
      );
      if (phase !== "beforeBackup") {
        expect(fs.readFileSync(p.recoveryCopy)).toEqual(f.original);
        expect(result.backupVerified).toBe(true);
      }
      expect(() => execute(p, f.env)).toThrow();
      if (removed) {
        expect(digest(fs.readFileSync(p.recoveryCopy))).toBe(p.source.sha256);
        fs.copyFileSync(p.recoveryCopy, f.target, fs.constants.COPYFILE_EXCL);
        expect(fs.readFileSync(f.target)).toEqual(f.original);
        expect(inspectReset(p, f.env, d).state).toBe(
          "CONTRADICTORY_OR_RECREATED_ACTIVE_NOT_SUCCESS",
        );
        expect(() =>
          fs.copyFileSync(p.recoveryCopy, f.target, fs.constants.COPYFILE_EXCL),
        ).toThrow();
      } else preserved(f);
    }
  }, 120000);
  it("AC13 corrupt/missing completion or recreated active state never reports successful reset; no artifact cleanup", () => {
    const f = fixture(),
      p = createResetPlan(f.env, d);
    execute(p, f.env);
    const audit = fs.readFileSync(auditPath(p));
    fs.appendFileSync(auditPath(p), "{partial");
    expect(inspectReset(p, f.env, d).state).toBe(
      "INVALID_OR_INTERRUPTED_AUDIT_NOT_SUCCESS",
    );
    expect(fs.existsSync(f.target)).toBe(false);
    expect(fs.readFileSync(p.recoveryCopy)).toEqual(f.original);
    fs.writeFileSync(auditPath(p), audit);
    fs.writeFileSync(f.target, "new data", { mode: 0o600 });
    expect(inspectReset(p, f.env, d).state).toBe(
      "CONTRADICTORY_OR_RECREATED_ACTIVE_NOT_SUCCESS",
    );
    expect(() =>
      fs.copyFileSync(p.recoveryCopy, f.target, fs.constants.COPYFILE_EXCL),
    ).toThrow();
  });
  it("AC14 fresh real host: opaque A-9 404 after clear, no HTTP DELETE, exact-byte explicit restore resurrects old IDs", async () => {
    const f = fixture(),
      p = createResetPlan(f.env, d);
    execute(p, f.env);
    async function call(method: string) {
      const env = { ...f.env, [BINDING_PRECONDITION_SETTING]: "true" };
      const server = http.createServer((req, res) => {
        void handleBrokerImportRequest(req, res, {
          env,
          saveAdapterDeps: {
            callIpc: (async () => {
              throw new Error("NO IPC");
            }) as never,
          },
        });
      });
      await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
      const port = (server.address() as { port: number }).port;
      try {
        const response = await fetch(
          `http://127.0.0.1:${port}/api/broker-import/P1-BROKER/evidence/${f.records[0].record.importId}`,
          { method },
        );
        return { status: response.status, body: await response.json() };
      } finally {
        await new Promise<void>((r, e) =>
          server.close((err) => (err ? e(err) : r())),
        );
      }
    }
    expect(await call("GET")).toEqual({
      status: 404,
      body: { outcome: "RESOURCE_UNAVAILABLE" },
    });
    expect((await call("DELETE")).status).toBe(405);
    // All hosts now closed. No new history: PF-1 does not create a journal until append.
    expect(fs.existsSync(f.target)).toBe(false);
    expect(digest(fs.readFileSync(p.recoveryCopy))).toBe(p.source.sha256);
    fs.copyFileSync(p.recoveryCopy, f.target, fs.constants.COPYFILE_EXCL);
    expect(fs.readFileSync(f.target)).toEqual(f.original);
    expect((await call("GET")).status).toBe(200);
    expect(fs.readFileSync(p.recoveryCopy)).toEqual(f.original);
  });
  it("AC15 non-TTY/env-only confirmation cannot execute; no CLI hook/target options; AC16 every operation remains isolated in temp fixtures", () => {
    const f = fixture(),
      p = createResetPlan(f.env, d);
    expect(() =>
      runOwnerResetCli(["execute", p.operationId], {
        ...f.env,
        CONFIRM: resetConfirmation(p),
      }),
    ).toThrow("TTY");
    preserved(f);
    expect(p.target).toBe(path.join(f.data, "journal.ndjson"));
    expect(path.relative(os.tmpdir(), p.target).startsWith("..")).toBe(false);
    expect(p.permanentErasure).toBe(false);
  });
});
