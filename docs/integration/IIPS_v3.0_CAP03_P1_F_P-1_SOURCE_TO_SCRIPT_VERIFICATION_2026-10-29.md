# IIPS v3.0 CAP-03 — P-1 (P1-F) source-to-script verification and corrected procedure — 2026-10-29

| Field | Value |
|---|---|
| Authority | P1-F, `docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md` §6 (IRR `origin/main` `aa013db`) |
| Base act | `IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01`, `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md` at IPD `a891802e` (§§4–9) |
| IPD pin | commit `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`, tree `76f083d7058e170d8212455c03bad1033136ee68` |
| Companion script | `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1` |
| Status of this pass | **Read-only.** No provisioning, no entrypoint invocation, no store or row, no authorization consumption, no IPD write, no PowerShell execution, no new PA approval. |
| P-1 | **UNSPENT.** Not invoked. No store, binding, membership, audit event, or receipt exists. |

Method: fetched IPD sources at the pin via the GitHub API and recomputed the git blob IDs of the local copies; read the entrypoint, validator, connection, and migration source; read the act §§4–9; read the IRR P1-F and PF-15/F4 records; checked the build configuration. Where a fact could not be read from source or a record, it is listed under A4 as unverified, not assumed.

---

## A. Findings

### A1. Confirmed defects in the P-1 procedure as written

| ID | Finding | Evidence | Effect if followed | Correction (in the script) |
|---|---|---|---|---|
| **D-1** | **Wrong entry path.** The build emits `dist/src/persistence/gateAPrimeProvisioning.js`, not `dist/persistence/...`. | IPD `tsconfig.json` (blob `6d696ec2`): `rootDir: "./"`, `outDir: "./dist"`, `include: ["src/**/*", …]`. Written as `dist/persistence/…` in P1-F §6 (entry row), and in the runbook `IIPS_v3.0_CAP02_HOST_EXECUTION_RUNBOOK_AND_EVIDENCE_STRUCTURE_2026-10-26.md` lines 84, 88, 92. | `node dist/persistence/…` names a file that the build does not produce (inferred from config; not executed). | Entry is `dist\src\persistence\gateAPrimeProvisioning.js`. The script checks that the file exists after the build (S04-ENTRY). |
| **D-2** | **Space-separated options are refused.** P1-F §6 writes `--mode execute`; base act §8 step 3 and runbook line 88 write `--mode=execute --act-id <ID> --store <path> …`. The parser accepts only `--name=value`. | Parser `requiredOption` (`gateAPrimeProvisioning.ts` line 566): a bare `--name` throws `ARGUMENT_INVALID` "must use the form `--name=<value>`". `parseGateAPrimeArguments` (line 575). Corroborated by F4 reconciliation (`IIPS_v3.0_CAP03_P1_F4_PARENT_PREFLIGHT_RECONCILIATION_2026-10-27.md` line 170). | The single attempt would be refused at argument parsing (no SQL). That consumes the operator's session effort, and under P1-F it reads as an attempt. | Every option is `--name=value` (script §S07 and §S08). |
| **D-3** | **Act §8 step 2 cannot produce "bindings = 0" on an absent store.** `--mode=validate` refuses `STORE_NOT_FOUND` when the file is absent. | `gateAPrimeValidation.ts` lines 371–372 (`existsSync` check throws `STORE_NOT_FOUND`); `validateProvisioning` (`gateAPrimeProvisioning.ts` line 540) inherits it. F4 reconciliation DISP-03 (line 155–158) records that refusal, verbatim, as the pre-state evidence. | Literal step 2 is unsatisfiable; an operator could invent a count. | Pre-state is the `STORE_NOT_FOUND` refusal, recorded verbatim (S05). This follows the F4 reconciliation record. It is not a PA ruling in P1-F itself (see A4). |
| **D-4** | **Build step missing from the act sequence.** The committed tree has no `dist/` (`.gitignore` lists `dist/`), and act §8 has no build step. P1-F assumes a built entry file. | IPD `.gitignore` at the pin lists `dist/` and `dist-frontend/`. Act §8 steps 0–6 contain no build. | The entry file may not exist, or may be stale. | S04 runs `npm ci` and `npm run build` from the pinned tree before any entrypoint call, then checks the entry file exists. **This is outside act §8's text; see G-09.** |
| **D-5** | **The execution pin check is narrower than act §8 step 0.** The entrypoint reads only `HEAD^{commit}` and `HEAD^{tree}` (`readExecutionHead`, line 214). It does not check that `--repo-root` is the top-level worktree, and it does not check cleanliness. Act step 0 requires `git status --porcelain` to be empty. | `gateAPrimeProvisioning.ts` lines 192–229 (`resolveGitObject`, `readExecutionHead`). Act §8 step 0. | A subdirectory or a dirty checkout at the right HEAD would pass the entrypoint's check. | S02 checks top-level path, HEAD, tree, `git status --porcelain --untracked-files=all` empty, and the 15 designated blobs at HEAD. |
| **D-6** | **`--actor` is accepted and discarded.** The parser allows `--actor` and maps it into the arguments object, but `executeWithAuthorization` never reads it, and it is not written to the receipt or the audit event. Act §8 step 3 requires `--actor <label>`. P1-F designates no label. | `parseGateAPrimeArguments` allow-list and mapping (lines 577–590, 621); `executeWithAuthorization` (lines 445–510). The only `ramki` value in the record is a runbook example (`…2026-10-26.md` lines 86, 90), which is not an authority designation. | An operator could copy the runbook's `ramki` and believe it is designated. | `-ActorLabel` is a required parameter with a format check. The script never supplies a default (G-13). |
| **D-7** | **P1-F designates no store path, but the PF-15 record designates one.** P1-F §6 says "no store path is pre-designated by this act." PF-15 act `-02` (rulings §6) designates the F4 literal `C:\iips-data\iips\user-portfolio.sqlite`; the consolidated PA package (QP1) approves F2/F4/F5 as rendered; the P1-C/P1-D capture procedure uses F4 as `$StorePath`. | P1-F §6 table, `--store` row (IRR `aa013db`). `IIPS_v3.0_CAP03_P1_F4_PARENT_PREFLIGHT_RECONCILIATION_2026-10-27.md` lines 18, 53, 133. `IIPS_v3.0_CAP03_CONSOLIDATED_PA_DECISION_PACKAGE_PROPOSED_2026-10-29.md` line 68. | Using a different path would be invention. Using F4 without confirmation relies on a record P1-F does not restate. | Script default is the F4 literal, with a go/no-go item to confirm it as the P-1 store (G-10). No other path is substituted. Not `%LOCALAPPDATA%`. |
| **D-8** | **No evidence root is designated.** Act §8.1 requires evidence, but names no location. | Act §8.1; no designation found in IRR `aa013db`. | An evidence root inside the checkout or the store directory would contaminate the sealed evidence. | `-EvidenceRoot` is mandatory with no default. The script refuses a root inside the checkout or the store chain (G-14). |
| **D-9** | **Act V-A2-8 ("a second invocation is refused and changes nothing") conflicts with P1-F condition 2 ("no second attempt").** | Act §5.4 table row V-A2-8 and §6 V-A2-8; P1-F §6 conditions 2 and "Not authorized" list. | Running the literal check is itself a second `--mode=execute`, which P1-F forbids. | Not invoked. V-A2-8 is evidenced from source: `authorizeExecution` refuses `ALREADY_PROVISIONED` (line 411) and `STORE_ALREADY_EXISTS` (line 413) before any connection, and the validator reports row counts (S08). The literal check is recorded as not performed. **Needs PA clarity if the literal check is wanted; see A4.** |
| **D-10** | **V-A2-7 is not an IPC check.** The validator's V-A2-7 calls `evaluatePortSaveGuard()` in-process (`gateAPrimeValidation.ts` line 319). It does not exercise the IPC path. | Validator line 319. IPC refusal source: IPD `src/ipc/dispatch.ts` blob `27becc76…`, line 231 (`WRITE_NOT_AUTHORIZED` before mutation). | A passing V-A2-7 would not show the IPC refusal at runtime. | The IPC runtime check is listed as **not run by the script** (manifest `notRunByScript`). Source-level evidence only. |
| **D-11** | **`--mode=validate` exits 0 when the report says FAIL.** `main` writes the report to stdout and sets no exit code. Refusals exit 1 with JSON on stderr. | `gateAPrimeProvisioning.ts` lines 634–646. | Checking only the exit code would miss a FAIL report. | The script parses the JSON `status` and every V-A2 check, not the exit code (S08). |
| **D-12** | **A failure after the store opens can leave a store file behind.** The connection creates the file (`new DatabaseSync`, `connection.ts` line 85) before any write. A non-refusal error becomes `EXECUTION_FAILED_ROLLED_BACK`, and `closeDatabase()` does not delete the file. | `gateAPrimeProvisioning.ts` lines 513–537; `connection.ts` lines 84–88. | Post-failure state includes a store file that P1-F's single-use rule forbids reusing. | The script never deletes, repairs, or overwrites. It records the state (S09). |
| **D-13** | **Whether a pre-invocation stop consumes P1-F is not stated.** P1-F §6 condition 2: the act "is spent by the first attempt, whether it succeeds or fails." Base act §9: "consumed on completion … a failure is recorded `FAILED / ROLLED BACK` or `NOT EXECUTED — <reason>`." | P1-F §6 condition 2; base act §9. | An operator cannot tell whether a stop before invocation spends the act. | The script never invokes `--mode=execute` until every check passes and the confirmation token is supplied. Any stop before invocation is recorded as `STOPPED_BEFORE_INVOCATION`. **Whether that consumes P1-F is a PA question (A4, G-18).** |

### A2. Corrected misunderstandings (verified against source; not defects in the act)

- **Identity values.** The three P1-F §4 values (`ramki-personal-local`, `ipd-personal-local`, `ipd-owner-ramki-personal`) equal the compiled constants in `gateAPrimeValidation.ts` (blob `df5d48a5`, lines 50–52). P1-F §4 table lines 98–100 agree. The base act §4 "UNRESOLVED" text is superseded by the later determination named in the constants' header; I did not re-read that determination in this pass.
- **Environment refusal.** `environmentCarriesGateValues` (line 284) refuses variables whose names start with `GATE_A_PRIME_`. It does **not** refuse `NODE_OPTIONS`. The script refuses `NODE_OPTIONS` as an extra host guard, not as an entrypoint requirement (S01-ENV-NODEOPTS).
- **Journal mode.** `PRAGMA journal_mode = DELETE` (`connection.ts` line 87). In normal operation there is no `-wal` or `-shm`; the transient sidecar is `-journal`. The script checks all three before invocation (PF-12 list).
- **Store parent.** `mkdirSync(dirname(filePath), { recursive: true })` (`connection.ts` line 84) creates missing parents. An absent parent is not a precondition. The reported parent `C:\iips-data\iips` is reported as existing, with creation `2026-10-26` and unknown provenance (`IIPS_v3.0_CAP03_P1C_P1D_EVIDENCE_HANDOFF_ACCEPTANCE_REVIEW_2026-10-27.md` line 69). **Reported, not measured.**
- **Refusal order** (`authorizeExecution`, lines 378–443): act id, absolute store path, not inside a worktree, no `GATE_A_PRIME_*` variables → identity values → `win32` → Node `>=22.13.0 <23` → store absent (lines 411–413) → executing HEAD and tree equal the pin (line 424) → store absent again → only then the connection (`executeProvisioning`, line 513). This matches act §7.1.
- **Validation is read-only.** `validateStoreAtPath` opens with `readOnly: true` (line 377) and creates nothing. `validateProvisioning` applies the same `GATE_A_PRIME_*` check to `process.env`.
- **Receipt.** On success, stdout is one JSON object (`GateAPrimeExecutionResult`: `mode`, `actId`, `store`, `bindingId`, `membershipId`, `auditEventId`, `basisCommit`, `basisTree`, `executingCommit`, `executingTree`), exit 0. On refusal or failure, stderr is `{"ok":false,"code":…,"error":…}`, exit 1.
- **Two distinct commits.** The compiled basis (`BASIS_COMMIT` `5fc74085…`, `BASIS_TREE` `7226ef00…`) is not derived from the checkout. The executing identity is measured from `--repo-root` and must equal `--execution-commit` / `--execution-tree`. The receipt records both.
- **Deterministic ids.** `bindingId` = first 32 hex of `sha256("binding:" + principalLabel)`; `membershipId` = first 32 hex of `sha256("membership:" + tenantId + ":" + canonicalOwnerId)` (`gateAPrimeProvisioning.ts` lines 128–135). Computed for the P1-F values: **bindingId `c5808abaffd072d6401ce63ad86c6ac0`, membershipId `d25dcc5370100b00766efc5166f65cf3`**. The script checks these in the receipt and in validation.
- **Worktree test.** `isInsideGitWorktree` (line 290) walks up from the store's parent looking for `.git`.
- **Build output is not clobbered.** `vite.config.ts` writes to `dist-frontend`; `tsconfig.portfolio-ui-package.json` and `tsconfig.pit-package.json` write to `dist/package`. Nothing clears `dist/src`.

### A3. Verified in this pass (source or remote, with the evidence named)

| Fact | Evidence |
|---|---|
| IPD pin commit and tree exist, and `main` is 24 ahead and 0 behind the pin (current `main` tip `aa356ec…`; the pin is not `main`). | GitHub API: `commits/a891802e…` tree `76f083d7…`; `compare/a891802e…...main` ahead 24, behind 0. |
| All 15 designated blobs (IRR P1-F §2.3 table) at the pin. | `contents/<path>?ref=a891802e…` `.sha` compared with the table: 15/15 OK. |
| The local scratch copies are byte-identical to the designated blobs. | `git hash-object` on the fetched files: `gateAPrimeProvisioning.ts` `5f49936b`, `gateAPrimeValidation.ts` `df5d48a5`, `connection.ts` `5169e402`, `tsconfig.json` `6d696ec2`, `provisioning.ts` `dc844189`, `binding.ts` `96d0079d`, `audit.ts` `273ccd3b`, `migration 001` `f594a182`. |
| Build config (`rootDir`, `outDir`, `include`), `.gitignore`, Vite output. | `tsconfig.json`, `.gitignore`, `vite.config.ts`, `tsconfig.portfolio-ui-package.json`, `tsconfig.pit-package.json` at the pin. |
| Dispatch refusal source. | `src/ipc/dispatch.ts` blob `27becc76…` line 231. |
| P1-F identity values = compiled constants. | P1-F §4 lines 98–100; `gateAPrimeValidation.ts` lines 50–52. |
| IRR `origin/main` = `aa013db`; session branch clean at `aa013db`; no PR for this branch. | `git`, `gh pr list --head`. |
| Node `v22.22.3` on the sandbox loads `node:sqlite` flag-free without opening a database (Linux only). | Readiness pass, 2026-10-29. Does not show Windows behaviour. |

### A4. Still unverified (each is a named item, not an assumption)

1. **Windows host behaviour.** Node on `DESKTOP-NO0NHTP`, flag-free `node:sqlite` on Windows, `npm ci` / `npm run build` on Windows (the basis build ran on Linux, act GA-V6), and the `win32` platform check. Only Linux was observed.
2. **PowerShell.** The script has not been parsed or run by PowerShell. Static checks only: balanced braces and parentheses, no `else`, `elseif`, `finally`, `exit`, or `break` statements, ASCII only, one `try`/`catch`. `ExitCode` and `WaitForExit` are .NET members, not control flow. PowerShell 5.1 is assumed.
3. **Host facts.** Store absence, `-journal`/`-wal`/`-shm` absence, the nearest-ancestor drive type (fixed NTFS), reparse points, `.git` in chain, OneDrive, ACL writability. These are reported (P1-C/P1-D not established; PA-20 waived as evidence), not measured in this pass. The script measures what it can read without creating anything; writability is attested by the operator from the saved ACL, because PF-12 forbids a probe file.
4. **Store path.** F4 as the P-1 store (D-7) is record-based. P1-F does not restate it.
5. **Actor label and evidence root.** No designation exists in the record (D-6, D-8).
6. **Test suite.** Test names read (T-1…T-15); bodies not read. IPD check-runs at `a891802e` reported success in the readiness pass; not re-verified here.
7. **Transitive source.** `migration_ledger.ts` and `portfolio_store.ts` bodies were not read. The ledger table name `_migration_ledger` comes from act V-A2-1 text, not from source.
8. **Consumption.** Whether a stop before invocation consumes P1-F (D-13).
9. **Literal V-A2-8.** Whether a second `--mode=execute` may be used as a check (D-9). The record says no.
10. **Act §8 step 5 IPC runtime check.** Not performed. Source-level only (D-10).
11. **Open IPD PRs.** Not re-checked.

---

## B. Corrected script

**File:** `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1`

**Parameters**

| Parameter | Required | Meaning |
|---|---|---|
| `-RepoRoot` | yes | Absolute path of the IPD checkout, which must be at `a891802e…`. |
| `-EvidenceRoot` | yes | Absolute evidence directory, outside the checkout and outside the store directory. |
| `-ActorLabel` | yes | Operator/PA-designated label, `[A-Za-z0-9._-]{1,64}`. No default. |
| `-StorePath` | no | Default `C:\iips-data\iips\user-portfolio.sqlite` (F4; see G-10). |
| `-PreflightOnly` | no | Runs S00–S06 (read-only checks, build, pre-state validation). Stops before the single invocation. |
| `-ConfirmToken` | for execute | Must equal `P1-F-ONE-ATTEMPT`. Without `-PreflightOnly` and without this token, the script stops at the GO gate. |

**Stages**

| Stage | Purpose | Writes |
|---|---|---|
| S00 | Arguments, paths, evidence location | Creates the run directory under `EvidenceRoot` only |
| S01 | Host, non-elevation, edition, Node `22.13+`, flag-free `node:sqlite` probe, no `GATE_A_PRIME_*` and no `NODE_OPTIONS` | Probe file in run directory |
| S02 | Top-level path, HEAD and tree, clean `git status`, 15 blobs | None |
| S03 | Store absent, sidecars absent, outside worktree, ancestor chain (no `.git`, no reparse points), fixed NTFS, not OneDrive, ACL saved | ACL text in run directory |
| S04 | `npm ci`, `npm run build`, entry present, clean after build | Gitignored `node_modules/`, `dist/` |
| S05 | `--mode=validate` pre-state; expect `STORE_NOT_FOUND`, exit 1; store still absent | None |
| S06 | GO gate; `-PreflightOnly` ends here with `PREFLIGHT_PASSED_NOT_EXECUTED` | None |
| S07 | **Single** `--mode=execute` with `--name=value` options; receipt compared field by field | Store (the only write, by the entrypoint) |
| S08 | `--mode=validate` with the same options; V-A2-1…8, status, counts 1/1/1 | None |
| S09 | Store SHA-256 and size; read-only dump of counts and ledger (only if the store exists) | None |
| S10 | `SHA256SUMS.txt` and `run-summary.json` | Run directory only |

**Outcomes** (`run-summary.json` field `outcome`): `PREFLIGHT_PASSED_NOT_EXECUTED`; `STOPPED_BEFORE_INVOCATION`; `EXECUTED_VALIDATED_PASS`; `EXECUTED_POST_VALIDATION_NOT_PASSED`; `EXECUTED_RECEIPT_MISMATCH`; `EXECUTION_REFUSED_OR_FAILED_CONSUMED`; `CONSUMED_STOPPED_AFTER_INVOCATION`. `executeInvoked` is `true` for any outcome after S07 starts.

**Invocation (operator, on the Windows host, non-elevated, after §C is satisfied)**

```
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1 -RepoRoot "<IPD checkout at a891802e>" -EvidenceRoot "<absolute evidence root>" -ActorLabel "<designated label>" -PreflightOnly
```

The single attempt is the same command with `-PreflightOnly` removed and `-ConfirmToken P1-F-ONE-ATTEMPT` added. **Run `-PreflightOnly` first.** Do not run the execute form to "test" anything. Do not re-run the execute form after any outcome.

**Limits of the script.** It has not been parsed or run by PowerShell. It cannot verify host properties it cannot read (writability), or the actor label and evidence root (operator designations). It runs the build as an added pre-step (D-4).

---

## C. Go/no-go checklist

Read this before the first `-PreflightOnly` run. **Every GO item must hold before the execute form is run. Any NO-GO item stops the run.** Items marked *operator* are not automatic.

| # | Item | Status at 2026-10-29 | Basis / how verified |
|---|---|---|---|
| G-01 | P1-F rendered and unspent on `origin/main`; no receipt or store exists | **GO** (read) | P1-F §6 "ONE ATTEMPT, NOT YET MADE"; S03 |
| G-02 | No prior P-1 attempt (no store at the F4 path, no receipt) | **GO** (read; re-check on host) | S03 store absent; operator confirms no receipt in the evidence root |
| G-03 | Host is `DESKTOP-NO0NHTP` | operator/S01 | S01-HOST |
| G-04 | Non-elevated account | operator/S01 | S01-NONELEVATED |
| G-05 | Windows 11 Home edition | operator/S01 | S01-EDITION |
| G-06 | Node `22.13.0`–`22.x`; `node:sqlite` loads flag-free; `NODE_OPTIONS` unset | operator/S01 | S01-NODE, S01-SQLITE, S01-ENV-NODEOPTS |
| G-07 | No `GATE_A_PRIME_*` environment variables | operator/S01 | S01-ENV-GATE |
| G-08 | Checkout is at `a891802e…` / `76f083d7…`, top-level is `RepoRoot`, `git status --porcelain --untracked-files=all` empty | operator/S02 | S02-TOPLEVEL, S02-COMMIT, S02-TREE, S02-CLEAN |
| G-09 | 15 designated blobs at HEAD. **Build pre-step accepted** (outside act §8 text, D-4) | **GO** blobs (read); **operator to accept** the build | S02-BLOBS; S04 |
| G-10 | **F4 store path confirmed as the P-1 store** (P1-F silent; PF-15 designates it; D-7) | **OPERATOR — NO-GO until confirmed** | PF-15 `-02`; F4 reconciliation |
| G-11 | Store absent; `-journal`, `-wal`, `-shm` absent; outside worktree; no `.git` in chain; no reparse points; fixed NTFS; not OneDrive | operator/S03 | S03-* |
| G-12 | Nearest existing ancestor ACL reviewed; operator-writable without elevation | **OPERATOR** (attested; not probed) | `nearest-ancestor-acl.txt` |
| G-13 | **Actor label designated** by PA/operator (P1-F silent; D-6) | **OPERATOR — NO-GO until designated** | Script refuses a missing or malformed label |
| G-14 | **Evidence root designated**, absolute, outside checkout and store chain (D-8) | **OPERATOR — NO-GO until designated** | S00 |
| G-15 | Identity values in the script equal P1-F §4 | **GO** (verified, A2/A3) | P1-F lines 98–100; `gateAPrimeValidation.ts` lines 50–52 |
| G-16 | Pre-state validation returns `STORE_NOT_FOUND` on the absent store | operator/S05 | S05-PRESTATE |
| G-17 | Operator has read D-1 to D-13 and accepts the stated effects | **OPERATOR** | This record |
| G-18 | Consumption ambiguity (D-13) accepted, or PA has ruled. **Stops before invocation are not treated as consuming** until PA rules | **OPERATOR / PA** | P1-F condition 2; base act §9 |
| G-19 | No retry is planned, and the execute form is run once | **OPERATOR** | P1-F condition 2 |

**Not blockers under this record (do not reopen):** the PA-20 waived evidence items (`P-1-C`, `P-1-D`, host capture) and H-1 to H-9 (PA-19 waiver). They are recorded as waived evidence, not as blockers.

---

## D. Post-execution validation procedure

Run only after the script returns. Do not re-invoke `--mode=execute`. Do not repair the store. Do not delete anything.

1. **Read `run-summary.json`.** Record `outcome`, `executeInvoked`, `failure`.
2. **If `outcome` is `EXECUTED_VALIDATED_PASS`:**
   - Check `receipt.json`: `mode` `execute`; `actId` = act id; `store` = `StorePath`; `basisCommit` `5fc74085…`; `basisTree` `7226ef00…`; `executingCommit` `a891802e…`; `executingTree` `76f083d7…`; `bindingId` `c5808aba…`; `membershipId` `d25dcc53…`; `auditEventId` present. (S07-RECEIPT checks these.)
   - Check the V-A2 report (`p1-postvalidate.stdout.txt`): `status` `PASS`; V-A2-1 to V-A2-8 all `ok`; `bindings` 1; `memberships` 1; `auditEvents` 1.
   - Check `readonly-dump.stdout.txt`: `portfolios`, `portfolio_revisions`, `portfolio_holdings`, `portfolio_contributions` all `0`; `_migration_ledger` holds 001–004.
   - Check the store fingerprint in `run-summary.json` (`storeSha256`, `storeSizeBytes`), `journalPresentAfter` `false`.
3. **If `outcome` is anything else:** record it verbatim. Do not repair, retry, or delete. Escalate to PA. The authority is treated as consumed unless PA rules otherwise (D-13).
4. **V-A2-7 (IPC).** Not run by the script. If the operator performs a runtime IPC check, record it as separate evidence. The source refusal is `src/ipc/dispatch.ts` (blob `27becc76…`, line 231).
5. **V-A2-8 (second invocation).** Not performed (D-9). Record as "evidenced by source logic (lines 411–413) and the post-state counts; literal re-invocation not performed under P1-F condition 2."
6. **Integrity of the run.** Verify `SHA256SUMS.txt` against the run directory. Confirm `git status --porcelain` in the checkout is still empty apart from ignored build output.
7. **Publication.** Write any receipt only after the raw evidence exists (act §8 step 6). Publish through a separate governed IRR change, and verify the remote read-back before claiming publication. Do not claim durable publication from the local checkout alone.

---

## E. Final status

| Question | Answer |
|---|---|
| **Source-verified?** | **Yes, for the procedure and its citations** (§A2, §A3): pin, blobs, build configuration, entrypoint and validator behaviour, identity values, refusal order. **No, for the script's run behaviour**: it has not been parsed or executed (PowerShell not run; Windows host not reached). |
| **P-1 unspent?** | **Yes.** No invocation, store, row, receipt, or consumption in this pass. P1-F remains "ONE ATTEMPT, NOT YET MADE" on `origin/main`. |
| **Changes in this pass** | Two files added under `docs/integration/` (this record and the script). No IPD write. No tracker or gate change. No PA request. No pinned-value change. |
| **Next action** | (1) PA or operator confirms F4 as the P-1 store (G-10). (2) PA or operator designates the actor label (G-13). (3) Operator designates the evidence root (G-14). (4) Operator accepts the build pre-step (G-09). (5) PA rules on the consumption of a pre-invocation stop (D-13 / G-18). (6) On the Windows host, run `-PreflightOnly`, record it, and proceed to the single execute form only if every GO item holds. |
| **Remaining independent technical blockers** | Windows host run of the script (not performed). Node and `node:sqlite` on the host (not observed). Store and ancestor facts on the host (reported, not measured). |
| **Waived, not blockers** | PA-20 evidence items and H-1 to H-9 (PA-19 waiver), per the standing directives. |

*Not performed in this pass:* any `--mode=execute`, any `--mode=validate` on a store, PowerShell execution, host contact, store or directory creation, IPD write, PA request, or tracker change.
