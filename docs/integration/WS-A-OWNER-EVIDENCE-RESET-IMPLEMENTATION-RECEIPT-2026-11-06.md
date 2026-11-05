# Owner-controlled evidence reset — implementation verification receipt (2026-11-06)

## Status: implementation MERGED; final tracker/receipt publication BLOCKED, not complete

Authority remains EFFECTIVE: `IIPS-V3-CAP02-OWNER-EVIDENCE-RESET-2026-11-06-01`, #459/#460.
This receipt does not adopt authority again, execute an owner reset, waive a check or certify a host.

| Coordinate | Verified value |
|---|---|
| Starting remote main | `34c8b39e3ee1d26bba4f9b362ca631c4e42ce863` |
| Fixed active branch | `arena/773aaf95-iips-review-recovered` |
| Implementation PR | [#462](https://github.com/ramkivs/iips-review-recovered/pull/462) |
| Exact head | `7f8bdbf044a3f82feb5af3ebcec911bba7fa5e11` |
| Merged authoritative main | `a9329dd509be8051f82780059646c0f179d42b74` |
| Head product CI | [42093558519](https://github.com/ramkivs/iips-review-recovered/actions/runs/42093558519), SUCCESS |
| Merged-main product CI | [42093933769](https://github.com/ramkivs/iips-review-recovered/actions/runs/42093933769), SUCCESS |
| Independent remote readback | GitHub API recursive trees + base64-decoded blobs: 17/17 changed paths exact at head and main, 2625 protected baseline blobs unchanged at both |
| Owner evidence reset / deployment | NOT EXECUTED / NOT ACTIVATED |

## What is implemented and verified

Offline Linux owner TTY plan/execute/status, one fixed entire active journal outside Git, trusted
canonical carrier plus UID/private access, whole-file strict schema/scope/order/record and import
digests, identity/hash/count/path/copy-census-bound confirmation. Unique private original-byte recovery
copy, hash/structure verification before unlink, minimal ordered audit including prepared + fresh
confirmed fact before removal, verified completion, explicit no-op and truthful incomplete/unknown
states. No automatic destructive continuation, repair, restore or cleanup. Recovery copies remain;
restoring old bytes or resubmitting an old snapshot can resurrect evidence. Not permanent erasure.

Exact procedure: runbook **§13**. Implementation and acceptance matrix:
`WS-A-OWNER-EVIDENCE-RESET-IMPLEMENTATION-2026-11-06.md`. Evidence:
`evidence/integration/ws-a-owner-reset-implementation-2026-11-06/`.

- **19 targeted synthetic tests PASS**, with real process SIGKILL at seven boundaries and independent
  fresh-process status. Interrupted after unlink but before completion is unknown, not success.
  After fully verified COMPLETED, status succeeds only with valid complete audit + absent path + copy.
- **1512 full regression tests PASS / 1 existing skip**, 117 passing files plus one skipped file.
  Owner/integrity/import/route tests included. Production build PASS (existing bundle-size warning).
- Dedicated strict ES2020 typecheck covers all new server/test modules; frontend and replay-server
  typechecks PASS. No claim that ordinary frontend CI typechecks this new server closure.
- Actual Python PTY/Node CLI plan, final cancellation/confirmation and fresh status PASS in two
  independent synthetic fixtures; environment-only/non-TTY confirmation refused.
- Fresh real HTTP host: former import opaque 404 after reset; DELETE 405; original-byte exclusive
  restore resurrects old ID (200). New active history is never overwritten by the tested restore.
- Baseline verifier: 2625 protected existing blobs unchanged; additive docs only; no existing live
  module imports reset tooling; sole destructive operation is the fixed active-journal unlink.
- All data fixtures temporary and synthetic; no operational owner file opened/reset for testing.

Linux local/private support boundary only. Filesystem allowlist is not universal mount qualification.
No Windows/macOS, ACL inspection, cross-process lock, fsync, power-loss atomicity, secure erasure or
exhaustive backup discovery. No PF-1, live handler/interface/digest/schema, dependency/workflow, holdings,
transactions, W-1, IPD, frozen authority or retention-policy change. No per-record deletion, tombstones,
automatic expiry/purge/compaction, backup destruction or production activation.

## Remaining blocker and precise non-completion

A tracker change triggers the CAP-03 static workflow. Its unchanged historical validator fails on
`evidence/iid/IID-1-IDENTITY-COVERAGE-2026-11-05/test-log-np12-regression.txt`, already on starting main:
its broad `(P1|P-1|...)` regex matches `np12`, but that unrelated IID artifact is not in the legacy
P-1 runtime freshness allowlist. `static.txt` reproduces the failure with full history. The validator's
SHA-256 is `ade7a42f3317b630b2f7d7bc23dbd949c304c025905e247ff35f7dc1002ccce9`, unchanged from starting main.
`static-baseline-proof.json` records the same offending path and blob at baseline.

Changing the CAP-03 validator/runtime allowlist, renaming/deleting existing IID evidence, disabling a
workflow, bypassing failed CI or claiming it passed would exceed this bounded reset publication.
None was done. Implementation/runbook/R2 were published separately in #462 with green applicable
product CI. This separate final tracker/receipt PR intentionally exposes the inherited static blocker.
It must remain unmerged on failure; **requested one-pass end-to-end completion has not been achieved**.
Needed follow-up is a separately scoped historical validator-classification correction, then successful
static CI and merge/readback of this receipt/tracker overlay. No further PA adoption for owner reset
is needed. No operational activation should be inferred from the merged code or this pending receipt.
