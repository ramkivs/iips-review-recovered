# IIPS v3.0 CAP-03 — P-1 (P1-F) source-to-script verification and corrected procedure — 2026-10-29 (revision 2)

| Field | Value |
|---|---|
| Authority | P1-F, `docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md` §6 (conditions 1–5), IRR `origin/main` blob `a90bb00141194608e64503b24d43964bf7ff85a0`, baseline `aa013db4bd2cc50a249ef30bfca9ce303fe2f5fe` |
| Base act | `IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01`, IPD `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md` at `a891802e`, blob `528de6aeddbc8e5f3191be8792f3937d77de4037` (§§4, 7, 8, 9) |
| IPD pin | commit `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`, tree `76f083d7058e170d8212455c03bad1033136ee68` |
| PF-15 designation | `docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md`, blob `3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d` (row F4, §1.1, §4) |
| Companion script | `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1` (revision 2; ASCII; not parsed or run) |
| Status of this pass | **Read-only with respect to the host and the store.** No provisioning, no entrypoint invocation (including execute-mode diagnostics), no store or row, no authorization consumption, no IPD write, no PowerShell or Windows execution in this environment, no PA request. |
| P-1 | **UNSPENT.** Not invoked. No store, binding, membership, audit event, or receipt exists. |
| Readiness | **NOT READY TO INVOKE.** Four authority items (Q-1 to Q-4) have no recorded answer; the script refuses until they do (section E). |

Method for revision 2: re-read the pinned entrypoint, validator, connection, provisioning, ledger, audit and migration sources (fetched at `a891802e` into scratch and re-hashed; the scratch copies of `vite.config.ts` and `tsconfig.json` from an earlier pass did **not** match the pinned blobs and are not cited); read act §§7–9 and P1-F §§5–6 verbatim; read the build configuration at the pin; re-read the whole draft script line by line for PowerShell 5.1 issues. Every check below is either source-verified, record-verified, or listed in A4 as unverified.

---

## A. Findings

### A1. Defects in the revision-1 draft, corrected in revision 2

| # | Defect in revision 1 | Consequence | Correction in revision 2 |
|---|---|---|---|
| A1-1 | Argument wrapper used `'\"'` in single quotes, so quoted arguments carried a literal backslash before the quote. | Any argument containing a space would reach `node` with malformed quoting. | Wrapper is `'"'`. |
| A1-2 | `ARG_QUOTE` test was `'[\"\\r\\n]'` in single quotes. The regex class therefore matched `"`, `\`, `r` and `n`. | Every argument containing a backslash (every store and repo path) would have been refused, so the draft would stop at the first pre-state call (S05). | Test is `'["\r\n]'`. |
| A1-3 | Git checks read `StdOut` only and ignored exit codes. | A failed `git` (for example a `safe.directory` refusal) produces empty output, which passes `S02-CLEAN`. | `Invoke-Git` throws on any non-zero exit. |
| A1-4 | `-ActorLabel` was accepted on format alone; `-StorePath` had a default. | A parameter or default was treated as authority. | Both must equal designation constants; both are null or unset in this revision, so every run refuses at S00. |
| A1-5 | No authorization-freshness check. | Nothing verified that P1-F remained effective and unspent immediately before invocation. | `Invoke-Freshness` (GitHub API, read-only) runs after S05 and before the GO gate; any unverifiable result stops. |
| A1-6 | V-A2-8 counted as a pass in the S08 gate, while the summary said it was "not performed". | The gate represented an unperformed check as passed. | S08 labels V-A2-8 as the row-state proxy; the summary states that the literal second-invocation check is NOT PERFORMED. |
| A1-7 | S04 accepted a pre-existing `dist/`, did not check that the entry was emitted in this run, and did not check the entry's imports. | Stale or foreign build output could be used. | `dist/` must be absent; entry mtime must be ≥ build start; direct relative imports must exist; ignored output must be only `node_modules/`, `dist/`, `dist-frontend/`. |
| A1-8 | Ledger dump used `SELECT *`. | Column set not fixed by the source. | Dump selects `migration_id, checksum, applied_at` (`migration_ledger.ts` line 25 DDL; line 90 insert). |
| A1-9 | `Split-Path -Parent` walked to the drive root (PS 5.1 behaviour on a root unverified). | Unknown behaviour on the ancestor walk. | `[System.IO.Path]::GetDirectoryName`, which returns null at the root. |
| A1-10 | `Get-Command node` read `.Source` on a possibly multi-result array under `StrictMode`. | Possible error on a path that should be a clean stop. | First element of an array, after a count check. |
| A1-11 | Child-process output used the default code page. | Non-ASCII output could be altered in the raw evidence. | `StandardOutputEncoding` and `StandardErrorEncoding` set to UTF-8. |
| A1-12 | `SHA256SUMS.txt` excluded `run-summary.json` and was not written on stop paths. | Evidence could be unsealed. | Summary is written first; the seal covers every other file, including the final `run.log`, on success and on stop. |
| A1-13 | Outcome logic was nested string-compare chains; `else` and `continue` were used. | Hard to review; violates the directive's control-flow rule. | Explicit state assignments; no `else`, `elseif`, `finally`, `break`, `continue`, or `exit` statements. |
| A1-14 | Edition check used an assumed EditionID mapping. | An unstated requirement. | Product name is compared with the act's own wording, "Windows 11 Home Single Language" (act §8). EditionID is recorded only. |
| A1-15 | S00 created the run directory before validating designations. | Evidence written for a run that could never be authorized. | Designations are checked before any directory is created. |

### A2. Verified against source and records (corrections to the revision-1 reading)

**A2-a. V-A2-8 and the second-invocation contradiction (resolved as NOT PERFORMED).**
- Act §8 step 5 lists "V-A2-8 second invocation refused with zero change" as a post-state check.
- P1-F condition 2: "One attempt, single-use … No second attempt without a further PA act."
- Validator `src/persistence/gateAPrimeValidation.ts` lines 331–336: `consumedShape = bindings.length > 0 || memberships.length > 0`; the check passes iff `consumedShape && bindings.length <= 1 && memberships.length <= 1`. This is a row-state proxy. It does not exercise a second invocation.
- Source-level refusal path (not executed): `gateAPrimeProvisioning.ts` `authorizeExecution` ~lines 409–411: if the store exists, `ALREADY_PROVISIONED` (rows present) or `STORE_ALREADY_EXISTS` (file, no rows); and a second check ~lines 433–435 before `openDatabase`. Both are pre-SQL.
- Consequence: the code refuses a second execute **only if the store file exists**. If a first attempt fails before the file is created, the code would permit another execute. Single-attempt is therefore a governance rule (P1-F condition 2), not a code-enforced rule.
- Resolution used here: the script never invokes execute twice; the literal V-A2-8 is recorded as **NOT PERFORMED**; the S08 validator result is labelled as the row-state proxy. A PASS of the proxy is not a PASS of V-A2-8.

**A2-b. Actor (Q-4).**
- P1-F §6 required-value table names no `--actor`. Base act §8 step 3 does name `--actor <label>`.
- `parseGateAPrimeArguments` (entrypoint, lines ~584–606) accepts `--actor`; `actor` is optional in the type (`GateAPrimeArguments.actor?`), and the receipt does not record it. The value has no store effect.
- The label is therefore a designation question, not a source question. The script does not supply a value.

**A2-c. Store path (Q-2).**
- P1-F §6: "`--store` … an absolute path that does not exist at invocation; no store path is pre-designated by this act."
- PF-15 corrected act `-02` row F4 names `C:\iips-data\iips\user-portfolio.sqlite` as the "P-1 `$StorePath`" for the single P-1 store and subsequent S3/QE. §4 of that act says PF-15 does not grant or consume P-1.
- Base act §8 step 1 conditions: absolute; outside every Git working tree; local fixed NTFS; not a synchronized folder; operator-writable without elevation; must not pre-exist.
- The script uses F4's value as `$DesignatedStorePath` and refuses any other value. Whether F4 binds the `--store` argument is open (Q-2). The script does not treat F4 as that binding.

**A2-d. Evidence root (Q-3).**
- No record designates an evidence root for P-1 **execution** evidence.
- E8 `D:\cap03-p1-capture-20261028-01` (capture procedure, revision 2026-10-28d) belongs to the E10 capture session; P1-F §5 and PA-13 state E10 is "not P-1 authorization".
- F5 `C:\iips-evidence\cap03-gate4` is the Gate 4 evidence root (S2 pin script comments; PF-15 row F5).
- Neither is a P-1 designation. The script refuses until one is recorded.

**A2-e. Build pre-step (reconciled; not authority).**
- Act §8 does not name a build. The entry path `dist/src/persistence/gateAPrimeProvisioning.js` exists only after a build. P1-F's table names `dist/persistence/...` (D-1); the emitted path is `dist/src/...` (`tsconfig.json` `rootDir: "./"`, `outDir: "./dist"`).
- `npm run build` at the pin = `tsc && vite build && npm run build:portfolio-ui-package && npm run build:pit-package` (`package.json`, blob `51796e63…`, which matches the P1-F table).
- `vite.config.ts` (blob `5563e1bc…`): `build.outDir = 'dist-frontend'`, so `vite build` does not empty `dist/`.
- `tsconfig.portfolio-ui-package.json` (blob `b5395d7b…`) and `tsconfig.pit-package.json` (blob `8dc497c0…`): `outDir: ./dist/package`, which does not overlap `dist/src`.
- `tsconfig.json` (blob `6d696ec2…`): no `incremental` or `tsBuildInfo`, so a stale build cache cannot cause skipped emission. A pre-existing `dist/` is still refused because its provenance is unknown.
- `npm ci` runs the root `prepare` script, which runs both package builds. This is a lifecycle side effect of the pinned `package.json`, recorded in the script.
- Pinned `.gitignore`: `node_modules/`, `dist/`, `dist-frontend/`, `*.log`, `.DS_Store`, `run-d114-acquisition.ps1`. The script allows only the first three as ignored build output.
- Build output is not designated evidence. It is a prerequisite for the entry path and is re-emitted from the pinned tree in the same run.

**A2-f. Validate and execute argument rules (source).**
- Validate requires only `--mode`, `--act-id`, `--store` (parser lines ~600–606). Validate opens with `new DatabaseSync(path, { readOnly: true })` (validator line 377), returns `STORE_NOT_FOUND` on an absent store (validator lines 371–372), and makes no directories.
- Execute requires `--repo-root`, `--execution-commit`, `--execution-tree` in addition (parser lines ~608–612). The base act §8 step 3 command omits them; P1-F's table names them. The script supplies them, with values equal to the pinned commit and tree.
- Strict parser: unknown arguments are refused; `--name=value` form only (`requiredOption`, line 566).

**A2-g. Execute side effects (source).**
- `openDatabase` (`connection.ts` lines 67–85) calls `mkdirSync(dirname(filePath), { recursive: true })` and sets `journal_mode = DELETE`. Execute can therefore create the store's parent directories. The script records whether the parent pre-existed (`storeParentPreexisted`) and does not create it.
- `executeProvisioning` (~line 523) runs `ensureMigrations` before `executeWithAuthorization`. On a fresh store, each pending migration runs in its own `BEGIN IMMEDIATE`, followed by the provisioning transaction. A failure in a migration can leave a store file with a partial ledger (D-12). The script records the state and does not repair it.
- `isInsideGitWorktree` (entrypoint ~line 290) refuses a store inside a Git working tree. The script mirrors this check with a `.git` ancestor scan and a `git worktree list` check.
- `environmentCarriesGateValues` (line 284, used at line 312) refuses `GATE_A_PRIME_*` environment variables. The script refuses on the same condition.
- Platform: `process.platform` must be `win32` (line 395). Runtime: Node `>=22.13.0 <23` (`authorizeExecution`, ~lines 400–406).

**A2-h. Receipt and report schemas (source).**
- Execute success (stdout, one JSON object; exit 0), return object at lines 496–508: `mode`, `actId`, `store`, `bindingId`, `membershipId`, `auditEventId`, `basisCommit`, `basisTree`, `executingCommit`, `executingTree`.
- Execute refusal (stderr, one JSON object; exit 1), lines 640–644: `{ ok: false, code, error }`.
- Validate report (validator lines 78–90, 355–359): `actId`, `storePath`, `status` (`PASS`/`FAIL`), `checks[]` of `{ id, ok, detail }`, `bindings`, `memberships`, `auditEvents`.

**A2-i. Tables and ledger (source).**
- `portfolios`, `portfolio_revisions`, `portfolio_holdings`, `portfolio_contributions`: migration 001 (`CREATE TABLE` at lines 17, 33, 49, 75).
- `local_principal_bindings`, `local_principal_memberships`: migration 003 (lines 14, 23).
- `audit_events`: `audit.ts` (lines 47, 54, 82).
- `_migration_ledger` (`migration_id`, `checksum`, `applied_at`): `migration_ledger.ts` line 25 (DDL), 57, 90, 103.
- `migration_ledger.ts` (blob `88198b44…`) is a transitive module that P1-F §2.3 does not designate. It is recorded here, not treated as designated.

**A2-j. Wording readings for the Program Authority (Q-5).**
- Act §7.2 says "On success: exactly one `BEGIN IMMEDIATE`, one binding row, one membership row, one audit row". The source runs migration transactions before the provisioning transaction on a fresh store. The reading used here is that §7.2 governs the provisioning transaction.
- Act §7.4 says the entrypoint "may not create, alter or delete any … migration". V-A2-1 requires `_migration_ledger` to hold 001–004 after execution. The reading used here is that creating the four ledger rows and their tables is the expected result, and that §7.4 forbids altering or removing existing migrations.
- Neither reading is a blocker for the script, but both must be confirmed in the PA ruling before any run.

### A3. Verified in this pass (remote or record, with identity)

| Fact | Evidence |
|---|---|
| IRR `origin/main` = `aa013db4bd2cc50a249ef30bfca9ce303fe2f5fe` | `git fetch origin` and `git rev-parse origin/main` |
| P1-F blob at `origin/main` = `a90bb001…` | `git rev-parse origin/main:<P1-F path>` |
| PF-15 corrected act blob at `origin/main` = `3fe9a2dd…` | `git rev-parse origin/main:<PF-15 path>` |
| Base act blob at IPD `a891802e` = `528de6ae…` | `gh api contents` at the pin (the file is in IPD, not IRR) |
| Pinned `package.json` blob = `51796e63…`, `tsconfig.json` blob = `6d696ec2…`, `vite.config.ts` blob = `5563e1bc…`, `tsconfig.portfolio-ui-package.json` = `b5395d7b…`, `tsconfig.pit-package.json` = `8dc497c0…` | `gh api contents` at `a891802e` |
| Entry, validator, connection, provisioning, binding, audit, migrations 001–004, dispatch, portfolio_store, and test blobs match P1-F §2.3 | Prior pass, recorded in the 2026-10-29 readiness record |
| Validator blob = `df5d48a5…` and entrypoint blob = `5f49936b…` (designated) | Prior pass |

### A4. Still unverified (each is a named item)

1. Windows runtime of the script. Not run; PowerShell 5.1 parse not performed. Static review and bracket-balance check only.
2. Host identity, elevation, Windows edition, Node version, `node:sqlite` flag-free load, `NODE_OPTIONS`, `GATE_A_PRIME_*` absence: all on `desktop-no0nhtp`, not measured.
3. Host checkout HEAD, tree, and cleanliness; `dist/` absence; the build's result on Windows.
4. Store absence and ancestor ACLs on host; whether any other worktree contains the store path.
5. `gh` authentication on the host, so the freshness check's result is unknown until run.
6. The actor label (Q-4) and the evidence root (Q-3). Neither is designated.
7. Whether F4 binds `--store` (Q-2).
8. Whether a pre-invocation stop consumes P1-F (Q-1).
9. Literal V-A2-8 (second invocation refusal): not performable without a second invocation.
10. V-A2-7 runtime (IPC `WRITE_NOT_AUTHORIZED`, `evaluatePortSaveGuard()` hard-false): source-only (`src/ipc/dispatch.ts` blob `27becc76…`, line 231).
11. Partial-migration behaviour under a fault during `ensureMigrations` (D-12): source-read only.
12. `npm ci` lifecycle behaviour on the host (the `prepare` script runs the package builds).
13. Freshness: the compare API result for a long change list (the script stops at 300 files, the API cap).

---

## B. Corrected script (revision 2)

Path: `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1`.

Stages, in order:

| Stage | Content | Invokes |
|---|---|---|
| S00 | Designation gates (ruling reference, actor, evidence root, store = F4); absolute paths; evidence outside worktree and store chain; run directory created only after all gates pass | none |
| S01 | Host name, non-elevated, product name, GATE_A_PRIME_* absent, NODE_OPTIONS unset, Node `>=22.13.0 <23`, `node:sqlite` probe (no database opened) | `node -v`, probe |
| S02 | `rev-parse` toplevel, HEAD, HEAD^{tree}; `status` clean (all untracked); `ls-tree -r HEAD` for the 15 designated blobs; SHA-256 of three sources | git (read-only) |
| S03 | Store absent; sidecars absent; outside worktree; `git worktree list`; ancestor chain (no `.git`, no reparse points); fixed NTFS; not OneDrive; nearest-ancestor ACL file | git, file tests |
| S04 | `dist/` absent; `npm ci`; `npm run build`; entry present and emitted this run; direct imports exist; clean tree; ignored output allow-list | `npm ci`, `npm run build` (build pre-step, not authority) |
| S05 | Pre-state `--mode=validate`; expects code 1 and `STORE_NOT_FOUND`; store still absent | `node --mode=validate` (read-only) |
| Freshness | P1-F and PF-15 blobs at `origin/main`; compare `aa013db…origin/main`; no P-1-named path changed except the two review artifacts; changed-file list recorded | `gh api` (read-only) |
| S06 | GO gate; `-PreflightOnly` stops here | none |
| S07 | The one `--mode=execute` invocation (only if not preflight and `-ConfirmToken P1-F-ONE-ATTEMPT`); receipt checked | `node --mode=execute` |
| S08 | `--mode=validate` after execute; V-A2-1…V-A2-7 and the V-A2-8 row-state proxy must pass; counts 1/1/1; status PASS | `node --mode=validate` (read-only) |
| S09 | Store SHA-256, size, UTC last write, sidecars; read-only table counts and ledger rows | `node` read-only dump |
| S10 | `run-summary.json`; `SHA256SUMS.txt` over all other run files | none |

Stop behaviour: every stop is a `throw` caught once. A stop writes `run-summary.json` and the seal when a run directory exists. After any invocation, the outcome becomes `CONSUMED_STOPPED_AFTER_INVOCATION`.

Limits of the script: it does not set a process exit code, so the summary is authoritative. It does not probe store writability (PF-12). It does not run V-A2-7 or the literal V-A2-8.

---

## C. Go/no-go checklist

| ID | Item | State | Basis |
|---|---|---|---|
| G-01 | P1-F effective and unspent at invocation | **Automated check; operator read still required** (tracker and P1-F status on `origin/main`) | Freshness stage; P1-F §6, §8 |
| G-02 | Single-attempt reading for a pre-invocation stop (Q-1) | **NO-GO — unresolved** | P1-F cond. 2; base act §9 |
| G-03 | Pin, tree, designated blobs, clean checkout on host | Static design only; **not measured on host** | S02 |
| G-04 | Host, elevation, edition, Node, sqlite, env | Static design only; **not measured on host** | S01 |
| G-05 | Store absent; ancestors; fixed NTFS; not synced | Static design only; **not measured on host** | S03 |
| G-06 | Build pre-step produces the entry, cleanly | Static design only; **not run** | S04 |
| G-07 | Pre-state validate returns `STORE_NOT_FOUND` | Static design only; **not run** | S05 |
| G-08 | Store path binding to `--store` (Q-2) | **NO-GO — unresolved** (F4 value is the designated value; binding is a PA question) | PF-15 F4; P1-F §6 |
| G-09 | Actor label (Q-4) | **NO-GO — not designated** | Base act §8 step 3; P1-F §6 silent |
| G-10 | Evidence root for P-1 execution (Q-3) | **NO-GO — not designated** (E8 and F5 are not P-1 designations) | P1-F §5; PA-13; PF-15 F5 |
| G-11 | Partial-migration and §7.2/§7.4 wording (Q-5) | Non-blocking reading; **PA confirmation requested** | Section A2-j |
| G-12 | V-A2-8 literal | **NOT PERFORMABLE without a second invocation**; recorded as NOT PERFORMED | P1-F cond. 2; A2-a |
| G-13 | V-A2-7 runtime | Operator post-step; not automated | Act §8 step 5 |

---

## D. Post-execution validation procedure

Run only after an invocation has occurred.

1. Receipt (S07): stdout must be one JSON object whose fields match section A2-h. Compare `basisCommit`/`basisTree` with `5fc74085…`/`7226ef00…`, `executingCommit`/`executingTree` with the pin, and `bindingId`/`membershipId` with `c5808abaffd072d6401ce63ad86c6ac0`/`d25dcc5370100b00766efc5166f65cf3`.
2. Validation (S08): V-A2-1 (ledger 001–004 and checksums), V-A2-2…V-A2-7 as named in the validator, and the V-A2-8 row-state proxy. Counts: bindings 1, memberships 1, audit events 1. Literal V-A2-8 is NOT PERFORMED.
3. Store (S09): SHA-256 and size; UTC last write; sidecars absent; table counts for the eight tables (expected: bindings 1, memberships 1, audit events 1, portfolio tables 0, ledger 4 rows).
4. Evidence: raw stdout and stderr, command lines, exit codes, UTC start and end times, `run.log`, `run-summary.json`, `SHA256SUMS.txt`. No receipt is written before the raw evidence.
5. Remaining operator checks: V-A2-7 (IPC `WRITE_NOT_AUTHORIZED`; `evaluatePortSaveGuard()` hard-false), read-only, separate from the script.
6. Failure states. Any non-zero execute exit is recorded as consumed. Recorded dispositions are `FAILED / ROLLED BACK` or `NOT EXECUTED — <reason>` (base act §9). No repair, no re-run, no deletion of the store.

---

## E. Final status

- **P-1: UNSPENT.** Not invoked. No store, binding, membership, audit event, or receipt exists.
- **Source-verified:** the entrypoint argument rules, validate and execute paths, refusal and receipt schemas, table and ledger names, build chain and emitted entry path, `openDatabase` directory creation, `ensureMigrations` transactions, the single-attempt code path (A2-a), and the designated blob set (A3).
- **Script:** revision 2 is a static-reviewed draft. It is not parsed or run. It refuses every run until the designations are recorded.
- **Unresolved authority questions (not decided by this record):**
  - **Q-1.** Does a pre-invocation stop (S00–S06 or a freshness stop) consume P1-F? P1-F cond. 2 and base act §9 do not say. Until a ruling exists, treat it as undetermined.
  - **Q-2.** Does PF-15 F4 designate the value of the P1-F `--store` argument?
  - **Q-3.** Which absolute evidence root is designated for P-1 execution evidence?
  - **Q-4.** What is the `--actor` label value? (P1-F is silent; base act §8 step 3 requires it.)
  - **Q-5.** Confirm the readings in A2-j (§7.2 transaction scope; §7.4 migration creation; partial-migration disposition).
- **Next safe action:** no host action in this pass. (1) The Program Authority answers Q-1 to Q-4 and confirms Q-5. (2) The answers are committed as reviewed designation changes to the script constants and this record; the operator then confirms that the script's git blob on the host equals the reviewed PR head (`git hash-object` on the file). (3) Only then does the operator run `-PreflightOnly` on `desktop-no0nhtp`, and only if the Q-1 answer permits a pre-invocation run. (4) A preflight stop is not followed by a rerun without a ruling. No execute invocation occurs until the preflight output has been reviewed and the designations are in place.
- **G-08 (store binding), G-09 (actor), G-10 (evidence root)** remain NO-GO until designated. In the 2026-10-28 numbering these were G-10, G-13 and G-14.
- **Unchanged by this record:** Gate 4 AUTHORIZED — NOT STARTED; QE 0/11; Gate 5 NOT INITIATED; S3 not started; V1295 NOT MET; no production, no `durable:true`; IPD not written by IRR; PA-19 (H-1 to H-9 PA-WAIVED) remains in effect; PA-20 waives host-side evidence requirements and is not a blocker by itself.
