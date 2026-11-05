# Owner-controlled evidence reset — bounded implementation and isolated verification

Authority: **IIPS-V3-CAP02-OWNER-EVIDENCE-RESET-2026-11-06-01**, already effective through #459/#460.
No new PA adoption, Act ID or governance investigation. Starting authoritative main:
`34c8b39e3ee1d26bba4f9b362ca631c4e42ce863` (latest remote at rebaseline).
Active implementation branch: `arena/773aaf95-iips-review-recovered`.

## Recovery and scope

The preserved remote predecessor branch `arena/2082c792-iips-review-recovered` ends at
`6eb6ac166234b176961f32acd83322c1afc2b325` (authority receipt); it has no reset implementation files.
This checkout and local unreachable Git objects also contained no uncommitted predecessor drafts.
Nothing was discarded or overwritten. The core was reconstructed from the preserved session design;
the recorded CLI/test contracts were reused and reconciled against the immutable amendment/paper §6.
No claim is made that the inaccessible original core bytes were recovered. Historical authority and
proposal text remains unchanged; this document is a later implementation overlay.

New modules only under `frontend/server/broker-import/`: raw `ownerEvidenceResetJournal.ts`, core
`ownerEvidenceReset.ts`, owner-only TTY `ownerEvidenceResetCli.ts`, synthetic acceptance tests and
`__fixtures__/ownerResetProcess.ts` test-only kill harness. No live composition imports these modules.
The CLI exposes only plan/execute/status plus operation UUID, never a target or test hook argument.

Whole active journal only, fixed path, approved carrier + local UID/private modes, full-file scope and
schema/digest validation. No PF-1 construction during planning. Exact plan hash includes inode/device/
size/times, content/counts, carrier binding, owner and copy census. Preparation and final immediate
removal each need the explicit same plan-bound phrase; copy, PREPARED and CONFIRMED facts precede unlink.
Final confirmed fact is read back before removal. Success requires absent active file, original verified
copy and completion audit. Missing/partial/contradictory facts are not success. No automatic recovery.

Runbook **§13** is the exact offline operating/recovery procedure. Qualified Linux local/private
filesystem boundary only; no Windows/macOS, ACL inspection, process discovery/locking, fsync or
power-loss durability claim. 256 MiB inspection ceiling is not a quota/purge policy. External copy
metadata is declared, not exhaustive discovery. No production deployment or owner reset was performed.

## Executed acceptance matrix (synthetic isolated local filesystem only)

| Required check | Executed proof |
|---|---|
| 1 Correct target/raw inspection | AC1: actual PF-1 create + readState grammar, exact counts/bytes/hash; read-only source preserved |
| 2 Incorrect/aliased target | AC2: relative/Git/directory/symlink/hardlink and rehashed foreign target refused |
| 3 Missing owner/OS access/quiescence | AC3: missing/invalid canonical carrier, nonprivate files/dir, each missing attestation refused |
| 4 Foreign preservation/integrity | AC4: mixed owner, schema/event/order/digest/import/tail corruption all byte-identical after refusal |
| 5 Missing/wrong-plan confirmation | AC5: no audit/copy/removal on initial refusal; final cancellation retains active + verified copy; no reuse |
| 6 Plan freshness | AC6: changed file/census/plan rejected |
| 7 Copy before removal | AC7/8/9 checks exact original bytes + PREPARED at final prompt and CONFIRMED before unlink |
| 8 Backup failure/corruption/audit failure | AC10 table: existing/corrupt/missing copy, STARTED/PREPARED/COMPLETED write failures and late corrupt audit |
| 9 Whole journal clear | AC7/8/9: all records gone by single active-file removal; unrelated files/carrier preserved |
| 10 Recovery copy preserved | AC7/8/9: byte/hash identity, mode 0600, audit privacy; no backup destruction |
| 11 Empty/missing no-op | AC11: header retained, absent remains absent, explicit NO_OP not deletion |
| 12 Interrupted backup/removal | AC12: real SIGKILL at all seven hook boundaries; fresh process status; no auto retry/restore |
| 13 Truthful recovery | AC13 + completion-fault case: absent without completion is unknown; corrupt audit/recreated file never clear-success |
| 14 Original-byte restore/resurrection | AC12 exclusive restore + overwrite refusal; AC14 real fresh HTTP host returns opaque 404, then 200 after explicit restore |
| 15 No HTTP deletion | AC14 actual DELETE 405; unchanged HTTP composition/route files and full owner-safety/route regression |
| 16 PF-1/frozen unchanged/fixtures only | Baseline blob verifier + AC15/16; fixture paths explicitly created under system temporary directory, never operational env |

First targeted run found a test expectation mismatch: a removed target invalidates a reused plan as
STALE before reaching ALREADY_ATTEMPTED. The test now accepts refusal in both cases; no safety gate was
weakened. Review added complete prepared-audit readback immediately before unlink and a late-audit-
corruption refusal test. Final targeted results and all seven kill checkpoints are in `acceptance.txt`.
Actual CLI/TTY verification covers plan, final cancel/confirm and a fresh status invocation with separate
synthetic fixtures (`verify_tty.py`, `tty.txt`). No terminal input was accepted from environment alone.

Evidence directory: `evidence/integration/ws-a-owner-reset-implementation-2026-11-06/`.
Typechecks include explicit strict ES2020 closure over every new production/test module (ordinary
frontend CI does not claim to typecheck this server closure), frontend and replay-server checks.
Full Vitest regression: **1512 passed, 1 pre-existing skipped**, 117 passing files + 1 skipped file.
Build/static/frozen verification and exact-head/main CI/readback coordinates are supplied by the
publication receipt. Implementation merged, synthetic qualification and actual operational execution
remain separate states. **Actual owner evidence reset: NOT EXECUTED.**

## Exclusions retained

No per-record removal/tombstone, journal rewrite, automatic expiry/purge/compaction, backup destruction,
PF-1/interface/digest/schema/live HTTP/dependency/workflow change, holdings/transaction writes, W-1
change, IPD mutation, authentication expansion, raw CSV upload, production activation, permanent erasure
or permanent-ID suppression. Recovery copies can restore intentionally cleared evidence. Retention
remains indefinite until explicit owner reset; 50 MiB remains warning/review only.

## Pre-existing static-publication blocker (not waived)

The unchanged CAP-03 validator (`ade7a42f3317b630b2f7d7bc23dbd949c304c025905e247ff35f7dc1002ccce9`)
fails on the starting main history, before checking this reset:
`evidence/iid/IID-1-IDENTITY-COVERAGE-2026-11-05/test-log-np12-regression.txt` matches its broad P1
regular expression but is not in the legacy P-1 runtime freshness allowlist. The failure is recorded
in `static.txt`; full history was fetched and reproduces the same failure. This is not caused by a
new reset path. Neither the protected validator/runtime allowlist nor that existing IID artifact was
modified. No waiver, false-green statement or CI bypass is authorized.

Implementation publication is separated from the tracker/final-receipt overlay: the code/runbook/R2
PR runs the applicable product CI; the later tracker/receipt PR triggers the static check and records
the inherited blocker. Until that separate PR can pass/merge, **end-to-end publication is incomplete**,
even if the implementation itself merges and remote readback succeeds. Tracker §16.259.2 references
are queued until that overlay publishes. Resolving the CAP-03 historical path classification requires
a separately scoped correction; it is not smuggled into owner reset or frozen P-1 authority.

## Implementation merged and remotely verified (later publication overlay)

PR **#462** head `7f8bdbf044a3f82feb5af3ebcec911bba7fa5e11`, merged
`a9329dd509be8051f82780059646c0f179d42b74`. Product CI **42093558519** (head) and
**42093933769** (merged main): SUCCESS. Independent GitHub API tree + decoded blob reads:
all **17 changed paths** exact bytes at head and merged main; **2625 protected baseline blobs**
unchanged at both, existing runbook/R2 overlays append-only. Evidence `remote-head-462.json`,
`remote-merged-462.json`, `ci-head-462.json`, `ci-main-462.json` is in the separate receipt PR.
Implementation is merged and synthetically verified, not merely a draft. Tracker/final-receipt
publication remains distinct and blocked by the inherited CAP-03 static issue described above.
