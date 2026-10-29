# IIPS v3.0 CAP-03 — P-1 (P1-F) source-to-script verification and corrected procedure — 2026-10-29 (revision 3)

| Field | Value |
|---|---|
| Record | Companion to `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1` (revision 3, 786 lines, ASCII) |
| Authority read | P1-F, IRR `docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md` (blob `a90bb001…`, §6) and tracker §16.206 (`CV-CORR-186`) |
| Pinned IPD execution basis | commit `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`, tree `76f083d7058e170d8212455c03bad1033136ee68` (remote tree re-read this pass) |
| IRR baseline and origin/main | `aa013db4bd2cc50a249ef30bfca9ce303fe2f5fe` (tree `3a9ef48c…`, 2218 entries); origin/main unchanged at the time of the checks |
| PR | #382 (`arena/325002ab-iips-review-recovered`); head is recorded in the publication section of E |
| Status of P-1 | **UNSPENT. Not executed on any host. No provisioning command, store, binding, membership, audit row, or receipt has been created.** |
| Scope of this pass | Documentation and script review only. No PowerShell was run or parsed, no entrypoint was invoked (including execute-mode diagnostics), no IPD write, no merge, no gate or authority change |

**Evidence labels used below.** `SRC` = read in the pinned IPD source at `a891802e` (scratch copies under `/tmp/w`; the file path is cited). `REC` = read in an IRR or IPD record (path and line cited). `LIVE` = read from the GitHub API in this pass. `STATIC` = checked by reading or text scan only; no PowerShell parser or host was used. `NOT VERIFIED` = not established. Blob or tree IDs are cited as published; nothing here is runtime evidence.

---

## A. Findings

### A1. Corrections made in revision 3 (this pass)

Each correction below cites the finding that required it. Revision 2 remains on the reviewed-but-unpublished local state and is replaced in place by revision 3 (same path).

| # | Revision 2 defect or gap | Revision 3 correction | Evidence |
|---|---|---|---|
| C-1 | Freshness used the compare API `files` array with a `< 300` completeness test. | Replaced by a complete recursive tree diff (`git/commits/{sha}` → `git/trees/{sha}?recursive=1`); a `truncated` flag is a stop. The compare API is not used for completeness. | LIVE, §A2-F1 |
| C-2 | No record of an interrupted or crashed execute. | `EXECUTE-MARKER.json` is written before `Process.Start`. S00 refuses if any prior `p1-*` run directory holds a marker, or lacks `SHA256SUMS.txt` (unknown state). Sealed read-only runs do not block. | STATIC; design in §B |
| C-3 | Pre-existing `dist/` refused the run. | `dist/` is no longer refused. The relative-import closure of the entry file must exist and every file in it must have mtime ≥ this run's build start. The closure with SHA-256 is written to `entry-closure-sha256.txt`. | SRC (`src_tsconfig.json`, `src_package.json`); §A2-F5 |
| C-4 | S05 expected emitted code `STORE_NOT_FOUND`. The emitted code is `UNEXPECTED_FAILURE` with the message `the validation store file does not exist`. A correct refusal would have stopped the run. | S05 accepts either the code `STORE_NOT_FOUND` or `UNEXPECTED_FAILURE` with that exact message, and records both verbatim. | SRC, §A2-F3 (defect D-14) |
| C-5 | Summary had no V-A2-8 fields. | Summary now has `v2A8ProxyPass` (measured proxy result) and `v2A8LiteralTest: NOT_PERFORMED`. | STATIC; §A2-F6 |
| C-6 | Freshness ran before the pre-state validation, not immediately before GO. | Order is S05 → freshness → GO → marker → invocation. | STATIC |
| C-7 | Evidence root could be created by the script. | The evidence root must already exist. The script never creates it. | STATIC |
| C-8 | Raw evidence was written with BOM and with `Set-Content` newline rules. | Raw files use `[IO.File]::WriteAllText` as UTF-8 without BOM; the command line is written before the process starts. | STATIC |
| C-9 | IPD pin tree was not checked on the remote from the script. | `F-IPD-PIN-TREE` reads `repos/ramkivs/iips-production-market-data/git/commits/a891802e…` and requires tree `76f083d7…`. | LIVE (value confirmed this pass) |
| C-10 | Tracker changes were not inspected. | `F-TRACKER-ADDED-P1-LINES` compares the tracker blob at baseline and origin/main and stops on any added line that names P-1 together with a consumption, revocation, supersession, or failure term. | LIVE (tracker blob unchanged, §A2-F2) |
| C-11 | Entry path was relative to the working directory. | The entry is passed as an absolute path. The `isMain` guard accepts a `.js` path ending (SRC `gateAPrimeProvisioning.ts`, `isMain`). | SRC |

**Withdrawn finding (no change made).** A revision-2 review pass suspected that the regular-expression and path literals in the script were double-escaped. A raw-character count (`BS=` per string) shows they are correct: `'["\r\n]'`, `'\\$'` (one literal backslash at end), `'^[A-Za-z]:\\'` (one backslash), `'^\d+ blob …\t(.+)$'`, `'^v22\.(\d+)\.(\d+)$'`, and the `yyyy-MM-dd\THH` date formats are right. The apparent doubling came from the tool display, which doubles backslashes. No change is needed; do not "fix" these.

### A2. Verified against source, records and remote (with identity)

**F1. Freshness completeness (LIVE, this pass).** The compare API `files` array is capped and is not paginated:

| Range (base…main) | Compare API `files` | Recursive tree diff | Result |
|---|---|---|---|
| `064e9f1f…aa013db` (149 commits) | 241 | 241 | Identical lists (0 in one only, 0 in the other only) |
| `cf4c9a38…aa013db` (410 commits) | 300 (no truncation flag) | 790 | 490 changes omitted silently |
| `cf4c9a38…aa013db`, `page=2&per_page=100` | 0 files (100 commits) | — | `files` is not paginated; only commits page |
| `aa013db…origin/main` (origin/main was `aa013db` at the check) | 0 | 0 | Identical; this range cannot exercise the large-diff path |

Conclusion: a count below 300 is not a completeness proof. The docs wording on the 300-file cap was **not** retrieved in this pass (the GitHub compare-endpoint documentation chunk was not reached), so it is not cited as documentary evidence. Revision 3 does not depend on it.

**F2. Freshness constants re-read at origin/main (LIVE).** Tree of `aa013db` = `3a9ef48c…`, 2218 entries, not truncated. Base and main trees are identical, so the changed-path count is 0.
- `docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md` → blob `a90bb00141194608e64503b24d43964bf7ff85a0` (matches P1-F blob).
- `docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md` → blob `3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d` (matches PF-15 `-02`).
- Tracker blob `12e483edc4d946b489e2ece9b79794b931c1fa2f`, unchanged base→main.
- IPD `a891802e…` → tree `76f083d7…` (remote).

**F3. Argument parser and validate behaviour (SRC, IPD `a891802e`).**
- `gateAPrimeProvisioning.ts` lines 574–626 (`parseGateAPrimeArguments`): allow-list of ten flags (`--mode`, `--act-id`, `--store`, `--principal-label`, `--tenant-id`, `--canonical-owner-id`, `--actor`, `--repo-root`, `--execution-commit`, `--execution-tree`). Each value must be `--name=value` (`requiredOption`, lines 566–571). Execute requires the last three (lines 609–611). `--actor` is accepted and optional; the parser stores it and does not require it.
- `--actor` is not recorded in any output (`GateAPrimeExecutionResult`, lines 84–106). This is the source fact behind D-6.
- Validate mode (`validateProvisioning`, lines ~536–548) calls `assertCommonArguments` (lines 300–309: act id, absolute store, store outside any Git worktree) and then `validateStoreAtPath`. It does not require the identity arguments.
- `validateStoreAtPath` (`gateAPrimeValidation.ts` lines 367–377) opens with `readOnly: true` and throws `GateAPrimeStoreError('STORE_NOT_FOUND', …)` at line 372 when the file is absent.
- Execute path (SRC, `gateAPrimeProvisioning.ts` lines 513–524; `connection.ts` lines 67–86): `openDatabase` creates the store's parent directories (`mkdirSync`, line 84) and the store file (`new DatabaseSync`, line 85) before any migration; `ensureMigrations` runs at line 524; the provisioning `BEGIN IMMEDIATE` is at line 471 (inside the write function). A failure after line 85 can therefore leave a store file with a partial schema (defect D-12). S03 checks the parent's ancestor chain for this reason.
- `GateAPrimeStoreError` extends `Error` (`gateAPrimeValidation.ts` line 93). `GateAPrimeRefusalError` extends `Error` in the provisioning module (line 107). The entry-point `isMain` block maps only `GateAPrimeRefusalError` to `code`; any other error is `UNEXPECTED_FAILURE`.

**F4. Execute refusals (SRC).** `STORE_ALREADY_EXISTS` at `gateAPrimeProvisioning.ts` lines 413 and 434; `ALREADY_PROVISIONED` at lines 411 and 466. A second execute on an existing store therefore refuses on the store-existence check. This is source-only; it is not run.

**F5. Module and build (SRC at the pin: `package.json` blob `51796e63…`; `tsconfig.json` blob `6d696ec2…`, read this pass via the API).** `package.json` has `"type": "module"`. `tsconfig.json` uses `module` and `moduleResolution` `NodeNext`, `outDir: ./dist`, `rootDir: ./`, `include` of `src/**`, `tests/**` and `frontend/**`, and does not set `incremental`. A type error anywhere in `frontend/**` would therefore fail `npm run build` before the closure check (listed as U-5). Consequences: the emitted entry is `dist/src/persistence/gateAPrimeProvisioning.js` (not `dist/persistence/…`); every build rewrites every emitted file, so the mtime test is meaningful; relative specifiers are explicit `./x.js`, so the closure walk can follow them. `prepare` runs `build:portfolio-ui-package` and `build:pit-package`, so `npm ci` also emits package output. `npm run build` is `tsc && vite build && …` (`dist-frontend` for Vite). The base act §8 does not name a build step; the QE matrix does list `npm ci --no-audit --no-fund` (`docs/integration/IIPS_v3.0_CAP02_QE_EXECUTION_MATRIX_AND_HOST_PREREQUISITES_2026-10-26.md`, line 90). The build is treated here as a pre-step that is not authority and touches no store. This is open question Q-MIG-B below only as a confirmation.

**F6. Post-state report and receipt (SRC).**
- Validate report (`GateAPrimeValidationReport`, `gateAPrimeValidation.ts` lines 82–91): `actId`, `storePath`, `readOnly`, `status` (`PASS`|`FAIL`), `checks` (`{id, ok, detail}`, line 129–131), `bindings`, `memberships`, `auditEvents`.
- Execute result (`GateAPrimeExecutionResult`, lines 84–106): `mode`, `actId`, `store`, `bindingId`, `membershipId`, `auditEventId` (number), `basisCommit`, `basisTree`, `executingCommit`, `executingTree`. The script's receipt test uses these names.
- Ledger table (`pin_migration_ledger.ts` lines 25–28): `_migration_ledger(migration_id, checksum, applied_at)`; the read-only dump selects these columns. Provisioning table names match migrations 001–004 (`local_principal_bindings`, `local_principal_memberships`, `audit_events`, `portfolios`, `portfolio_revisions`, `portfolio_holdings`, `portfolio_contributions`).
- Validation proxy for V-A2-8 (`gateAPrimeValidation.ts` lines 331–336): `consumedShape && bindings <= 1 && memberships <= 1`. This is a row-state proxy evaluated in validate mode. It does not demonstrate refusal of a second execute.

**F7. Authority records (REC).**
- Tracker §16.206 current pointer (line 22): `P-1` is **AUTHORIZED — ONE ATTEMPT, NOT YET MADE — UNSPENT** (P1-F rendered). The same line records P-1 as NOT EXECUTED and not authorized only in the superseded 2026-10-27 text.
- Tracker §16.206 P1-F row (line 16926) and conditions (line 16928): condition (2), "the first attempt, successful or not, spends the act, per successor act §8". Condition (1): `EXECUTION_PIN_MISMATCH` before any connection. Condition (4): receipt records basis and executing HEAD/tree. Non-grants include "second attempt or re-run".
- Base act (IPD `a891802e`, `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md`, §§6–9, blob `528de6ae…`): §7 items 1–6 (refuse before SQL; one `BEGIN IMMEDIATE`; duplicate handling; no unintended mutations; no retry; no fixture substitution); §8 step 3 names `--actor <label>`; §8.2 stop conditions ("stop, record, do not proceed"); §9 "consumed on completion whether the act succeeds or fails; a failure is recorded `FAILED / ROLLED BACK` or `NOT EXECUTED — <reason>`".
- PF-15 corrected act `-02` (`/tmp/w/pf15c.md`, blob `3fe9a2dd`): row F4 (line 30) `C:\iips-data\iips\user-portfolio.sqlite` "RENDERED as intended stable path for the single P-1 store and subsequent S3/QE"; line 36 "Keep F4 stable … Any unexpected value drift is STOP; technical compatibility is not permission to substitute a value"; line 63 "F4 names the intended one-time `$StorePath`"; line 64 "PF-15 does not grant or consume P-1"; row F5 (line 31) "RENDERED as intended Gate 4 evidence root".
- CAP-02 host runbook (`docs/integration/IIPS_v3.0_CAP02_HOST_EXECUTION_RUNBOOK_AND_EVIDENCE_STRUCTURE_2026-10-26.md`): header (lines 1–5) "PREPARATION ONLY … designates no value"; §4 (lines 75–100) "one attempt, consumed on completion", with steps 0–2 before the single invocation and the act-consumed record after it; §7 (line 142) "Any PF mismatch → STOP before commands; `NOT EXECUTED — <reason>`"; example `--actor ramki` (lines 86, 90); example `$EvidenceRoot = "D:\iips-evidence\$RunId"` (line 53); example entry path `dist/persistence/…` (no `src/`), which is wrong against the pin (see §A2-F5).
- S2 execution matrix (`docs/integration/IIPS_v3.0_CAP03_S2_P1_S3_QE_EXECUTION_AND_EVIDENCE_MATRIX_2026-10-26.md`): line 142 template `--actor=<label>` (placeholder); line 147 "success performs exactly one `BEGIN IMMEDIATE`".
- QE matrix H-8 (line 80): `$EvidenceRoot` absolute, writable, outside every Git worktree, "not the store path", not synchronized.
- Consolidated PA package pass 7 (`docs/integration/IIPS_v3.0_CAP03_CONSOLIDATED_PA_DECISION_PACKAGE_PROPOSED_2026-10-29.md`, line 13 and line 67): E8 capture root `D:\cap03-p1-capture-20261028-01`, parent `D:`; PA-13/E10 is capture authorization, "not P-1 authorization and not a `P1-F` precondition" (tracker PA-13 row, line 16925).

**F8. Record-accuracy note (no edit made this pass).** Tracker line 12741 (`DISP-03`) records that validate at step 2 "refuses `STORE_NOT_FOUND`". That names the thrown class. The emitted code, per F3, is `UNEXPECTED_FAILURE` with that message. This note is for a later IRR record correction under PA direction. It does not change any gate.

### A3. Still unverified (named items)

| # | Item | Why it is unverified | Who can verify |
|---|---|---|---|
| U-1 | Whether the PowerShell script parses and behaves as designed on PS 5.1 | No PowerShell in this sandbox; static review only (§A4) | Operator, on the designated host, only after designations and a PA ruling |
| U-2 | Host facts: hostname, non-elevation, product name, Node version, flag-free `node:sqlite`, `GATE_A_PRIME_*` absence, NODE_OPTIONS, OneDrive, NTFS, ACLs | Windows host only; this sandbox is Linux | Operator, read-only, in the preflight |
| U-3 | Store absence, sidecar absence, parent existence, reparse points, `.git` in the ancestor chain | Host filesystem | Operator, read-only |
| U-4 | Clean checkout at `a891802e` / `76f083d7`; designated blobs at HEAD | No local IPD checkout in this sandbox; remote tree only (15/15 designated blobs, remote, prior pass) | Operator, in S02 |
| U-5 | `npm ci` and `npm run build` on the host; closure emission | Not run; no PowerShell or Windows | Operator, in S04 |
| U-6 | V-A2-1 to V-A2-7 at runtime | Validator and entry are source-only here; V-A2-7 is `src/ipc/dispatch.ts` line 231 at `27becc76` (source only) | Operator, S08 |
| U-7 | Literal V-A2-8 (second invocation refused) | Requires a second invocation, which the single-attempt rule forbids; not performed (§E) | Not performable within P-1 |
| U-8 | Store ACL writability | Attested, not probed (PF-12) | Operator attestation |
| U-9 | Non-P-1-named documents that revoke P-1 | The freshness check covers P-1-named paths and tracker lines only | Reviewer of the full changed-path list in `run-summary.json` |

### A4. Static review of revision 3 (PowerShell 5.1; no runtime claim)

Checks performed by reading the file and by scripted text scans (no PowerShell parser; no execution):
- ASCII only (0 non-ASCII lines). Forbidden keywords `else`, `elseif`, `finally`, `break`, `continue`: 0 occurrences. `exit`: 0 occurrences as code (a comment word was changed to avoid it).
- Brackets and quotes balanced under a PowerShell-aware text scan (single-quote doubling and backtick escapes handled). This is not a parse.
- 53 check identifiers; `S08-VALIDATE` appears in two mutually exclusive branches by design.
- Every stop is a `throw` from `Stop-Gate` or `Require-Check`, caught by one outer `catch` that writes `run-summary.json` and `SHA256SUMS.txt` when a run directory exists. No process code is set. The summary is authoritative.
- Process invocation uses `System.Diagnostics.ProcessStartInfo` with separate stdout/stderr capture, `UseShellExecute = false`. Only `npm` runs through `$env:ComSpec /d /c`. Arguments containing whitespace are wrapped in double quotes; a quoted argument ending in a backslash is refused; a quote or newline in any argument is refused. The designated values (act id, store, identity values, commit and tree) contain no whitespace; the repo-root argument is quoted if its path contains whitespace.
- PS 5.1 features used: `ConvertFrom-Json`, `ConvertTo-Json -Depth` (3.0+), `Get-FileHash` (4.0+), `Get-ChildItem -Directory`, `New-Object` with generic HashSet, `[IO.File]::WriteAllText`, `[regex]::Matches`, `Set-StrictMode -Version Latest` (ordinal hashtable access is strict-safe; object-property access is guarded).
- Single-attempt semantics: the marker is written and `ExecuteInvoked` is set only immediately before `Invoke-Capture` for `--mode=execute`. A failed marker write stops before invocation. Any stop after that point sets `CONSUMED_STOPPED_AFTER_INVOCATION` (see §E).
- Risks not verified at runtime: `ConvertFrom-Json` over the ~2,200-entry recursive tree and the tracker blob (size is well within expected limits, but unverified on PS 5.1); `gh` authentication on the host; `Get-Acl` availability; `npm.cmd` resolution through `ComSpec`.

---

## B. Corrected script (revision 3): structure and stop points

The script is `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1`. As committed, it refuses at S00 because the three designations are null. It is a reviewed artifact, not a runnable procedure.

| Step | Read-only? | Content | Stop |
|---|---|---|---|
| S00 | yes | Designations (ruling, actor, evidence root, store = F4); absolute paths; evidence root exists and is outside the worktree and store chain; prior-run scan (marker and unsealed runs refuse); run directory created | `S00-*` |
| S01 | yes | Host name, non-elevated, product name, `GATE_A_PRIME_*` absent, NODE_OPTIONS unset, Node `v22.13+`, flag-free `node:sqlite` probe (no database opened) | `S01-*` |
| S02 | yes | HEAD commit and tree, clean status (`--untracked-files=all`), designated blobs at HEAD | `S02-*` |
| S03 | yes | Store and sidecars absent; outside worktree; no `.git` or reparse point in the ancestor chain; fixed NTFS; not OneDrive; nearest-ancestor ACL written for review | `S03-*` |
| S04 | build | `npm ci`, `npm run build`; entry closure present and emitted this run; clean after build; ignored entries limited to `node_modules/`, `dist/`, `dist-frontend/` | `S04-*` |
| S05 | yes | `--mode=validate` with absent store; expects exit 1, empty stdout, code `STORE_NOT_FOUND` or `UNEXPECTED_FAILURE` with the exact message; store still absent | `S05-*` |
| Freshness | yes | origin/main; IPD pin tree on remote; complete base→main tree diff (`truncated` stops); P1-F, PF-15 blobs; tracker added-line scan; P-1-named changes (review artifacts excluded) | `F-*`, `FRESHNESS_*` |
| S06 | — | GO gate. `PreflightOnly` stops here | — |
| S07 | **invokes once** | Writes `EXECUTE-MARKER.json`; then `--mode=execute` with all ten flags; receipt fields compared with the pin and the expected binding and membership ids | `S07-*`, `EXECUTION_*` |
| S08 | yes | `--mode=validate` with the same arguments; V-A2-1…8 proxy checks and counts 1/1/1 | `S08-*` |
| S09 | yes | Store SHA-256, size, UTC timestamp, sidecar presence; read-only dump of table counts and ledger rows | `S09-*` |
| S10 | — | Summary and seal (`SHA256SUMS.txt` over every other file in the run directory) | — |

Refusals before the run directory exists (all of S00's designation and path checks, and the evidence-root scan) create nothing and write no summary file; the stop is then visible on the console only. Operators must keep the console transcript for those stops.

Run directory layout: `p1-<UTC stamp>/` under the evidence root, containing `run.log`, `run-summary.json`, every raw `NN-name.{cmdline,stdout,stderr,code,timing}.txt`, `probe-sqlite.mjs`, `nearest-ancestor-acl.txt`, `entry-closure-sha256.txt`, `readonly-dump.mjs`, `EXECUTE-MARKER.json` (only when an invocation is about to happen), `validate-report.json`, `SHA256SUMS.txt`. The S07 receipt is the raw stdout of `NN-p1-execute-SINGLE-ATTEMPT.stdout.txt`, not a separate file.

---

## C. Go/no-go checklist (current state: NO-GO)

| # | Gate | State | Owner |
|---|---|---|---|
| G-08 | Store binding (`--store` = F4) | Open: Q-STORE (F4 supported; confirmation requested) | PA |
| G-09 | Actor label | Open: Q-ACTOR (no designation; examples only) | PA |
| G-10 | Evidence root | Open: Q-EV (none designated; F5 is Gate 4 scope) | PA |
| G-11 | Single-attempt consumption for stops before invocation | Open: Q-CONS | PA |
| G-12 | Migration on fresh store and transaction boundaries | Open: Q-MIG, Q-TX (both supported by the act's V-A2-1 and §7.2 text; confirmation requested) | PA |
| G-13 | Authorization freshness at GO | Mechanism written (tree diff, P1-F, PF-15, IPD pin, tracker); not yet run on a host | Operator, at run time |
| G-14 | Host preconditions (U-2, U-3, U-4, U-5) | Not verifiable from this sandbox | Operator |
| G-15 | Post-run acceptance rule for V-A2-8 | Open (§E, V-A2-8 decision) | PA |

**Do not run any preflight or invocation until G-08 to G-12 are ruled.** The reason is Q-CONS: if a stop before invocation can be read as spending the attempt, even a preflight run would carry that risk.

---

## D. Post-execution validation procedure (what the run must record)

Recorded for each stage, in the run directory: raw stdout, raw stderr, exit code, UTC start and end, the exact command line (secrets excluded; none are used).
- S05 pre-state: exit code, stderr JSON (`code`, `error`), store-absent fact.
- S07 execute: exit code; on exit 0, the receipt object (raw stdout of the execute call) with `mode`, `actId`, `store`, `basisCommit`, `basisTree`, `executingCommit`, `executingTree`, `bindingId`, `membershipId`, `auditEventId`; on non-zero, the refusal code and message.
- S08 validate: `status`, the `checks` list with `id`/`ok`, counts `bindings`, `memberships`, `auditEvents`.
- S09 store: SHA-256, size, UTC last write, sidecar presence, read-only counts for each table, and the ledger rows (`migration_id`, `checksum`, `applied_at`).
- Summary: `outcome`, `executeInvoked`, `executeMarkerWritten`, `p1fConsumption`, `v2A8ProxyPass`, `v2A8LiteralTest: NOT_PERFORMED`, freshness facts, and the not-performed list.

---

## E. Final status, authority questions and next safe action

### E1. Authority questions (reconciled against the records)

Mapping to the requested items: Q-1 = consumption (Q-CONS); Q-2 = store binding (Q-STORE); Q-3 = evidence root (Q-EV); Q-4 = actor (Q-ACTOR); Q-5 = migration and transaction (Q-MIG, Q-TX). The rev-2 "Q-1 to Q-4" labels are superseded by these names.

| Question | Record evidence | Reconciled status | Decision needed |
|---|---|---|---|
| **Q-CONS** (Q-1): does a stop before any entrypoint invocation consume P1-F? | P1-F cond. 2 and §16.206 P1-F row: "the first attempt, successful or not, spends the act". Base act §9: consumed "on completion whether the act succeeds or fails", with `NOT EXECUTED — <reason>` as a failure disposition. Runbook §4 and §7: NOT EXECUTED is a status for an item that did not run; "act consumed" appears only in the post-execution record list. | **UNRESOLVED.** §9 can be read to make a NOT EXECUTED record a consumed-act disposition; runbook §4 reads a pre-execution stop as not an attempt. The record does not settle it. | PA ruling, in writing: whether a read-only preflight, or a stop before invocation, consumes P1-F. |
| **Q-STORE** (Q-2): does `--store` equal the PF-15 F4 path? | PF-15 F4: "the single P-1 store"; "keep F4 stable across the P-1 … sequence"; drift is STOP (lines 30, 36, 63). P1-F: `--store` absolute and non-existent, "not pre-designated" (§16.206 P1-F row). | **LARGELY SUPPORTED.** The record names F4 as the single P-1 store and makes any drift a STOP. P1-F is silent on binding. | PA confirmation that F4 is the `--store` for P-1. The script constant already equals F4. |
| **Q-EV** (Q-3): which evidence root for P-1? | None designated for P-1. E8/PA-13 root is capture-only and "not a P1-F precondition". F5 is "intended Gate 4 evidence root". QE H-8: absolute, outside worktrees, not the store path. Runbook `$EvidenceRoot` designates no value. | **UNRESOLVED.** | PA designation (absolute local path; outside worktrees, cloud sync, and the store chain; pre-existing). Do not reuse E8 or F5 without a ruling. |
| **Q-ACTOR** (Q-4): which `--actor` value? | Base act §8 step 3 names `--actor <label>`. P1-F's identity table omits it. The parser accepts it and never records it (D-6). Values in the repo: `ramki` (runbook examples lines 86, 90; preflight instrument examples); `<label>` placeholder (S2 matrix line 142). | **UNRESOLVED.** Examples are not designations. | PA designation of the label (or confirmation that `ramki` is designated). |
| **Q-MIG** (Q-5a): do migrations 001–004 apply on the fresh store? | Base act §6 V-A2-1 requires ledger `001`–`004` with the basis checksums. §7 item 4 forbids unintended creation of migrations. SRC: `executeProvisioning` calls `ensureMigrations` at line 524, after `openDatabase`. | **LARGELY SUPPORTED.** Schema creation is the intended consequence of V-A2-1; the act does not say it expressly. | PA confirmation. |
| **Q-TX** (Q-5b): is the provisioning write one transaction? | Base act §7 item 2: "exactly one `BEGIN IMMEDIATE`" for the provisioning writes. S2 matrix line 147 repeats it. SRC: migrations run in per-migration transactions before the provisioning transaction (`pin_migration_ledger.ts` lines 43–45, 56–90). | **LARGELY SUPPORTED.** The §7 item 2 wording covers the provisioning writes. | PA confirmation that migration transactions sit outside §7 item 2. |
| **Q-V8** (post-run acceptance): is V-A2-8 satisfied by the proxy? | Act §6 V-A2-8: "a second invocation is refused and changes nothing; the act is recorded consumed." Validator lines 331–336: row-state proxy only. Source refusal path: §A2-F4. The literal test would be a second invocation, which P1-F forbids. | **PROXY MEASURED; LITERAL NOT PERFORMED.** Not a precondition to run. | PA rule after the run: accept the proxy plus source-verified refusal, or record V-A2-8 as not satisfied. |

### E2. V-A2-8 contradiction, resolved

The act's V-A2-8 requires a second invocation to be refused. P1-F condition 2 and the directive forbid a second invocation. Both cannot be met by running the test. Resolution:
- The validator's V-A2-8 (lines 331–336) is a row-state proxy, evaluated in validate mode. It is measured in S08 as `v2A8ProxyPass`. It is not a refusal test.
- The literal test is **NOT PERFORMED** and must not be run. The summary records `v2A8LiteralTest: NOT_PERFORMED`.
- No record in this pass represents V-A2-8 as passed. The proxy result is reported as measured only.

### E3. Publication and remote verification

- Local files written in this pass: revision 3 script (786 lines) and this record (revision 3), both at the paths above, uncommitted at the time of writing.
- Remote verification of PR #382 (`headRefOid`, branch head, `ls-remote`) is recorded in the PR body after the commit and push, not claimed here before they happen.

### E4. Final status (this pass)

- **P-1 remains UNSPENT.** No provisioning command, store, binding, membership, audit row, or receipt has been created. No entrypoint invocation occurred, including execute-mode diagnostics.
- **Source-verified:** the parser allow-list and required arguments; validate behaviour on an absent store (code `UNEXPECTED_FAILURE`, message); the execute refusal paths; the module format and emitted entry path; the receipt and report field names; the ledger columns; the V-A2-8 proxy definition; the base act and P1-F text cited above.
- **Record-verified:** tracker §16.206 current state; PF-15 F4 and F5 wording; runbook status; the actor, evidence-root and store questions listed in E1.
- **Live-verified (GitHub, this pass):** origin/main `aa013db` and tree `3a9ef48c…`; base and main tree identical; P1-F blob `a90bb001…`; PF-15 blob `3fe9a2dd…`; tracker blob unchanged; IPD pin tree `76f083d7…`; the compare-API truncation behaviour in §A2-F1.
- **Static only:** the script's PowerShell 5.1 behaviour (§A4); the bracket and quote balance; ASCII.
- **Not verified:** U-1 to U-9 (§A3).
- **Not decided here:** Q-CONS, Q-STORE, Q-EV, Q-ACTOR, Q-MIG, Q-TX, and the V-A2-8 acceptance rule (§E1). No PA ruling is recorded or inferred.

### E5. Exact next safe action

1. The Program Authority rules in writing on Q-CONS, Q-EV and Q-ACTOR (required), and confirms Q-STORE, Q-MIG and Q-TX. No preflight or invocation until then.
2. Only after the ruling: a reviewed change sets the three designations and the ruling reference in the script, citing the ruling. Then the operator runs the read-only preflight on `DESKTOP-NO0NHTP` with `-PreflightOnly`, and returns the raw run directory for independent review.
3. The single attempt is taken only in a separate, explicitly authorized run with `-ConfirmToken P1-F-ONE-ATTEMPT`, after the preflight is reviewed. Nothing in this pass authorizes that run.
