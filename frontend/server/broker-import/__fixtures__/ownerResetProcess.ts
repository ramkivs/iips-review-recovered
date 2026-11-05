// TEST ONLY. Deliberately not exposed as a production CLI flag/environment variable.
import {
  executeReset,
  inspectReset,
  loadResetPlan,
  resetConfirmation,
  type OfflineDeclaration,
} from "../ownerEvidenceReset.js";
const d: OfflineDeclaration = {
  allWritersStopped: true,
  localFilesystemNoSync: true,
  staleBrowserSessionsClosed: true,
  otherRecoveryCopies: [],
};
const [action, id, phase] = process.argv.slice(2);
const p = loadResetPlan(id, process.env, d);
if (action === "kill")
  executeReset(
    p,
    resetConfirmation(p),
    process.env,
    d,
    resetConfirmation,
    (at) => {
      if (at === phase) process.kill(process.pid, "SIGKILL");
    },
  );
else if (action === "status")
  process.stdout.write(JSON.stringify(inspectReset(p, process.env, d)) + "\n");
else throw new Error("invalid test action");
