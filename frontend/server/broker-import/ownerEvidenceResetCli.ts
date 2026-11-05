/** Offline owner TTY entrypoint. No HTTP registration, target argument or env-only confirmation. */
import fs from "node:fs";
import path from "node:path";
import { isatty } from "node:tty";
import { pathToFileURL } from "node:url";
import {
  createResetPlan,
  executeReset,
  inspectReset,
  loadResetPlan,
  resetConfirmation,
  saveResetPlan,
  type OfflineDeclaration,
  type ResetPlan,
} from "./ownerEvidenceReset.js";
function answer(prompt: string) {
  process.stdout.write(prompt + "\n> ");
  const bytes: number[] = [],
    b = Buffer.alloc(1);
  while (fs.readSync(0, b, 0, 1, null) === 1) {
    if (b[0] === 10)
      return Buffer.from(bytes).toString("utf8").replace(/\r$/, "");
    bytes.push(b[0]);
    if (bytes.length > 4096) throw new Error("INPUT_LIMIT");
  }
  throw new Error("CONFIRMATION_CANCELLED");
}
function describe(p: ResetPlan) {
  process.stdout.write(
    JSON.stringify(p, null, 2) +
      "\nALL ACTIVE evidence in this owner scope will be cleared. The original-byte recovery copy is RETAINED. Restoring it can resurrect evidence. NOT permanent erasure. Other copies/snapshots/media remain. No ACL/locking/fsync/power-loss guarantee.\n",
  );
}
export function runOwnerResetCli(args: string[], env: NodeJS.ProcessEnv) {
  if (!isatty(0) || !isatty(1))
    throw new Error("INTERACTIVE_LOCAL_OWNER_TTY_REQUIRED");
  const [action, id] = args;
  if (
    !["plan", "execute", "status"].includes(action) ||
    args.length !== (action === "plan" ? 1 : 2)
  )
    throw new Error("USAGE_plan_OR_execute_ID_OR_status_ID");
  const phrase =
    "I AM THE LOCAL OWNER; ALL WRITERS STOPPED; STALE BROWSERS CLOSED; LOCAL DISK NO SYNC";
  if (
    answer(
      "Stop every host/writer, close stale browser attempts. Type exactly: " +
        phrase,
    ) !== phrase
  )
    throw new Error("OFFLINE_ATTESTATION_REQUIRED");
  const other = answer(
    "Describe other retained recovery copies (repeat exactly for this plan), or NONE_KNOWN. Metadata only; no copy is deleted:",
  );
  if (!other) throw new Error("BACKUP_DISCLOSURE_REQUIRED");
  const d: OfflineDeclaration = {
    allWritersStopped: true,
    localFilesystemNoSync: true,
    staleBrowserSessionsClosed: true,
    otherRecoveryCopies: other === "NONE_KNOWN" ? [] : [other],
  };
  if (action === "plan") {
    const p = createResetPlan(env, d);
    describe(p);
    process.stdout.write(
      `Read-only journal inspection; plan saved: ${saveResetPlan(p, env, d)}\nNo evidence removed.\n`,
    );
    return;
  }
  const p = loadResetPlan(id, env, d);
  if (action === "status") {
    process.stdout.write(
      JSON.stringify(inspectReset(p, env, d), null, 2) +
        "\nNo automatic retry, deletion, restore or cleanup.\n",
    );
    return;
  }
  describe(p);
  const first = answer(
    "Authorize verified recovery-copy preparation for this exact plan. Type: " +
      resetConfirmation(p),
  );
  const outcome = executeReset(p, first, env, d, (current) =>
    answer(
      "Recovery copy VERIFIED; deletion fact PREPARED. Immediately before clearing the entire active journal, type: " +
        resetConfirmation(current),
    ),
  );
  process.stdout.write(
    JSON.stringify({
      outcome,
      operationId: p.operationId,
      recoveryCopy: p.recoveryCopy,
      permanentErasure: false,
    }) + "\n",
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    runOwnerResetCli(process.argv.slice(2), process.env);
  } catch (error) {
    process.stderr.write(
      `RESET NOT CONFIRMED AS SUCCESSFUL (${error instanceof Error ? error.message : "REFUSED"}). Stop writers; inspect saved operation with status. Preserve all artifacts. No automatic retry or restore.\n`,
    );
    process.exitCode = 1;
  }
}
