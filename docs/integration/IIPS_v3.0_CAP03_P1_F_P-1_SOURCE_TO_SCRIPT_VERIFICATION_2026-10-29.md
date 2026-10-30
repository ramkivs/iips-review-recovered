# IIPS v3.0 CAP-03 — P-1 (P1-F) source-to-script verification — historical Revision 5 plus current Revision 7 addendum

> **Current companion status (2026-10-30):** the current procedure is Revision 7. Sections A–F and the Revision 6 addendum below preserve their dated snapshots; section I records Q-EV designation, section J records the operator's point-in-time observations and DACL acceptance, and **section K governs the latest post-CI boundary and readiness reconciliation**. Section H governs the prior one-pass technical dispositions except where later addenda supersede a specific status. No PowerShell parse, host run, S2 rerun, P-1 Preflight/Execute, or IPD write occurred. The agent did not access IPD. Generic CI run `41102065894` at head `698920a8c7a43801cafd592129401ea6c399b75d` completed with `npm ci` against three IPD-pinned lockfile entries; because the Actions logs/step metadata were unavailable, remote fetch versus npm-cache use is **UNVERIFIED** (section K).


| Field | Value |
|---|---|
| Record | Companion to `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1` (revision 5, 1569 lines, 111,385 bytes, ASCII, LF, SHA-256 `7aa52aa4…e916`; final pass in F13) |
| Supersedes | Revision 4 of this record and script (commit `fe6e801`) and earlier revisions. Revision-4 text is in git history (`git show fe6e801:<path>`). Revision-5 changes are in **section F**; where section F states a change, section F governs the earlier sections. |
| Authority read | P1-F, IRR `docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md` (blob `a90bb001…`, §6, conditions 1–5); tracker §16.206 (`CV-CORR-186`) current-state pointer rows at baseline lines 14 and 22 |
| Pinned IPD execution basis | commit `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`, tree `76f083d7058e170d8212455c03bad1033136ee68` |
| IRR baseline | `aa013db4bd2cc50a249ef30bfca9ce303fe2f5fe` (tree `3a9ef48c…`, 2218 entries) was the historical Revision 7 comparison baseline; `origin/main` later advanced to `72e56ba8cd7e63deca0bf49c3d2ca8ecc6b3c576` and was merged additively into this session branch (current reconciliation in section H) |
| PR | #382 (`arena/325002ab-iips-review-recovered` → `main`). Head and state: section E3 |
| Status of P-1 | **UNSPENT. Not executed on any host. No entrypoint invocation (including execute-mode diagnostics). No provisioning, store, binding, membership, audit row, or receipt has been created.** |
| Scope of this pass | Revision 5: focused correction of revision 4 in the same PR and branch (R5-01 to R5-10, section F). No PowerShell was run or parsed. No Windows host was used. No entrypoint invocation, provisioning, store or binding creation, IPD write, merge, gate, authority, or capability change. The Node probes below ran on Linux only against pinned source and scratch text, never against a P-1 store. |

Legend for every claim: **[SRC]** source read at the pin (file and line); **[REC]** IRR record (file and line); **[GH]** remote read via the GitHub API this pass; **[TEST]** Linux-side Node or text test this pass (not a P-1 run); **[STATIC]** text scan of the script (not a parse); **[NOT PERFORMED]** not run and not claimed.

---

## A. Findings

### A1. The ten review findings — classification and disposition

| # | Finding (this pass's directive) | Classification | Revision-4 disposition | Residual after this revision |
|---|---|---|---|---|
| 1 | Evidence-root containment must cover every Git working tree, equality with the repo root, and store-chain equality and ancestry. Do not overclaim OneDrive. | **Confirmed gap in rev 3.** Rev 3 checked `.git` only in the store chain and compared the evidence root to the repo root by prefix only. | Fixed. `Invoke-EvidencePlacement` (S00): `.git` file or directory at or above the evidence root (`S00-EVIDENCE-NO-GIT-IN-CHAIN`); reparse points in the chain; not a drive root; not the repo root or inside it; not inside a listed worktree; not equal to or inside the store directory or any store-chain ancestor (`S00-EVIDENCE-NOT-STORE-CHAIN`, `S00-EVIDENCE-NOT-IN-STORE-DIR`, `S00-STORE-NOT-IN-EVIDENCE`); fixed NTFS. OneDrive is an environment-variable check only and is labelled as not a sync-state proof. | Sync state beyond environment roots is not verified (U-2). Evidence-root fixed-NTFS is applied by this revision; authority to confirm (Q-EV). |
| 2 | Two-stage procedure: Preflight vs Execute, no default proceed; Execute verifies a reviewed preflight acceptance hash-bound to the preflight summary and to the script SHA-256; repeats all safety checks; one invocation. | **Confirmed gap in rev 3** (rev 3 had a `-PreflightOnly` switch; absence of the switch meant execute). | Fixed. `-Mode` is mandatory with `ValidateSet('Preflight','Execute')`. Execute requires `-AcceptanceFile` and `-ConfirmToken`. `Test-AcceptanceAndPreflight` (S00) checks the acceptance schema, decision, `scriptSha256`, `authorityRulingRef`, pins, store, evidence root, reviewer, the sealed preflight directory (every file hash and the exact file set), the preflight `run-summary.json` hash, mode, outcome, zero execute calls, same script hash, same store and evidence root, and all preflight checks passing. `Invoke-PreInvocationRecheck` repeats host, git pin, store placement, closure hashes, freshness, and the script and acceptance hashes immediately before the marker. A `SECOND_INVOCATION_REFUSED` guard sits on the single call site. | Acceptance text is a reviewed artifact; its author is outside the script. |
| 3 | Post-invocation failures must not skip S08 and S09; preserve raw evidence and continue read-only validation, fingerprint, sidecars, dump. | **Confirmed defect in rev 3.** A non-JSON stdout after exit 0, a `Stop-Gate` in S08, or a parse failure escaped to the outer catch and skipped S09. | Fixed. The invocation is in its own try block (`S07-INVOCATION-EXCEPTION`). S07 receipt parse, S08 validate and S09 dump each sit in their own try block and call `Add-PostFailure`, which records and continues. `Invoke-Capture` writes stdout, stderr, code and timing before any interpretation. Outcome is set from recorded state (`EXECUTED_POST_STEP_FAILED` when a post step failed). | If writing the raw stdout file itself fails after the process ends, the raw stdout is not preserved (the exception is recorded, the file is not). Documented, not closed. |
| 4 | Run directories: unique `p1-<mode>-<UTC>-<guid8>` names; exclusive creation; no overwrite; separate `run-summary.json` and `failure-summary.json`. | **Confirmed defect in rev 3.** `Write-Summary` and `Write-Seal` used `-Overwrite`. | Fixed. Names `p1-pre-<yyyyMMdd>T<HHmmssfff>Z-<guid8>` and `p1-exe-…` (`S00-RUNDIR-NEW`). Every file is created with `FileMode.CreateNew` (`Write-RawFile`); there is no overwrite switch. `run-summary.json` on a normal end; `failure-summary.json` on any stop; `SHA256SUMS.txt` last. | A GUID-fragment collision is treated as negligible, not impossible. `New-Item` after `Test-Path` is not an atomic exclusive create for directories. |
| 5 | S09 dump: parse structured output; require every table count and the ledger query ok; expected IDs 001–004 and checksums by SHA-256 of migration SQL. | **Confirmed gap in rev 3.** The rev-3 dump printed text (`ERROR …`) and was not checked. | Fixed. The dump emits `schema: IIPS-P1-READONLY-DUMP/1`, per-table `{ok,count|error}`, and ledger `{ok,rows|error}`. `S09-DUMP-QUERIES` requires all ok. `S09-LEDGER-EXPECTED` (execute-matching outcome only) requires the ledger ids in order equal to `$ExpectedMigrations` and each checksum equal to the pinned SHA-256. `S04-EMITTED-MIGRATIONS` checks the same values against the emitted build (`dist/src/persistence/gateAPrimeValidation.js` `GATE3_MIGRATIONS` and `migration_ledger.js` `migrationChecksum`). `S09-READONLY-INVARIANT`: store SHA-256 unchanged across the read-only steps. | Dump and emitted-probe JavaScript are syntax-checked on Linux only; neither has run on the host [NOT PERFORMED]. |
| 6 | Store writability: ACL evaluation is a fact, not an effective-access test; writability method is a GO requirement pending authority ruling (Q-WRITE). | **Confirmed gap in rev 3** (rev 3 only wrote the nearest-ancestor ACL for review). | Fixed as a GO requirement. `S00-WRITABILITY-DESIGNATED` requires a designated method (`ACL_EVALUATION` or `PARENT_PROBE`); none is designated, so every run refuses. `ACL_EVALUATION` (`Get-WriteAclEvaluation`) evaluates the DACL of the nearest existing ancestor for the current user and group SIDs and requires allow bits for CreateFiles and CreateDirectories and no matching deny; it is labelled not an effective-access test. `PARENT_PROBE` creates and removes one uniquely named probe file in the store parent (never on the store path), once. | Q-WRITE: the authority must rule which method, if either, is accepted. Inherited, privilege-based and non-ACL denials are not evaluated by either method. |
| 7 | Freshness: include tree-entry mode in comparisons; tracker pointer-row identity plus added-line scan; state that identity checks do not prove absence of unrecorded revocation. | **Confirmed gap in rev 3** (`100644` was not compared; pointer identity was absent). | Fixed. Tree entries are `mode type sha`; `F-P1F-ENTRY` and `F-PF15-ENTRY` require `100644 blob <sha>`. `F-TRACKER-POINTER-IDENTITY`: each marker (`**Latest (`CV-CORR-186`` and `**Current CAP-03 P-1 / PF-15 status**`) must match exactly one baseline line (`**Last Updated**` was rejected: 2 baseline matches), and that line must still exist at origin/main. The added-line scan (`F-TRACKER-ADDED-P1-LINES`) is kept. Limitation is stated in the summary `notPerformedByScript`. | Identity checks do not prove absence of a revocation recorded outside the IRR repository or under a non-P-1 name. The pointer check is fail-closed: any legitimate tracker edit to those two rows stops the run for review. |
| 8 | Q-CONS must cover marker creation, process-start failure, pre-invocation stop, and consumption; marker-before-process retained. | **Authority question, open.** The record states the cases (section E1 table); the script's treatment is recorded. | Covered in the record (E1). Script: marker before process (kept); any sealed `p1-exe-*` directory blocks every later run (`S00-NO-PRIOR-EXECUTE-DIRECTORY`), so a pre-invocation stop cannot be followed by a second execute without a PA-authorized change. | Q-CONS-1 to Q-CONS-3 require a written PA ruling. Not decided here. |
| 9 | Publication section must cite the actual revision-4 commit and PR state; keep PowerShell 5.1 parse and Windows runtime NOT PERFORMED; tracker error-code discrepancy kept as a separate narrow correction, not applied in this PR. | **Process requirement.** | Section E3 gives the publication rule and the verification commands. The commit hash is not written into this file (a file cannot name its own commit); it is in the PR body and the final report, and is verified by `ls-remote` and `gh api`. PowerShell 5.1 parse: **NOT PERFORMED**. Windows runtime: **NOT PERFORMED**. Tracker DISP-03 discrepancy (F9): **not applied**; proposed as a separate correction in E6. | None beyond the above. |
| 10 | Full static recheck against pinned source and effective act; text scans are not a PowerShell parse. | **Required.** | Done for this revision. Static results are in B5. None of them is a parse. | PowerShell parse, 5.1 or later, on a Windows host: **NOT PERFORMED**. |

### A2. Defects found in revision 3 during this pass (new, beyond A1)

| # | Revision-3 defect | Evidence | Revision-4 disposition |
|---|---|---|---|
| R3-a | Prior-run scan blocked only marked or unsealed runs. A sealed run with no marker (a pre-invocation stop in execute mode) did not block a later execute. This conflicts with the single-attempt rule while Q-CONS-2 is open. | Rev-3 script lines 432–446: `S00-NO-PRIOR-EXECUTE-MARKER` tests `EXECUTE-MARKER.json` only; `S00-NO-UNSEALED-PRIOR-RUN` tests `SHA256SUMS.txt` only. | Fixed: any `p1-exe-*` directory blocks (`S00-NO-PRIOR-EXECUTE-DIRECTORY`). |
| R3-b | A non-JSON stdout after exit 0 escaped the outer catch. Rev-3 S07 parsed `$exec.StdOut` at line 677 with no inner try block, and S08 parsed `$post.StdOut` at line 716 the same way. A failure skipped every later post-step, including S09 and the summary. | Rev-3 lines 677 and 716 (`Read-JsonText`); no try block between them and the outer catch. | Fixed (A1 #3): S07 invocation, receipt parse, S08 and S09 each have their own try block and call `Add-PostFailure`. |
| R3-c | `Get-RefusalField` parsed the whole stderr as one JSON object. Node 22 prints an `ExperimentalWarning` on stderr when `node:sqlite` loads, so a refusal parsed as `UNPARSEABLE`. Rev-3 used this at S05 (line 629–630, the pre-state refusal) as well as S07. | [TEST] Linux, Node 22.22.3: `import('node:sqlite')` writes two lines to stderr before anything else: `(node:PID) ExperimentalWarning: SQLite is an experimental feature and might change at any time` and a `--trace-warnings` hint. Rev-3 `Get-RefusalField` (line 230–236) and its S05 call (line 629–630). | Fixed: `Get-LastJsonLine` returns the last stderr line starting with `{`. The warning stays in raw stderr. The parser does not depend on the Node build. |
| R3-d | No store fingerprint invariant across the read-only steps; sidecars recorded only before the dump. | Rev-3 S09. | Fixed: `storeSha256AfterExecute` (S08), `storeSha256AfterRead` (S09), `S09-READONLY-INVARIANT`, `sidecarsBeforeDump`, `sidecarsAfterDump`. |
| R3-e | Migration identity was not checked against the emitted build. Rev-3 had no expected migration ids or checksums (0 matches for `ExpectedMigrations`, `migrationChecksum` or `GATE3`). | Rev-3 script text. | Fixed: `S04-EMITTED-MIGRATIONS` (B3). |
| R3-f | The dump was built as a text string, with `ERROR` prefixes, and `new DatabaseSync` outside any try block. | Rev-3 `readonly-dump.mjs` text. | Fixed (A1 #5). The rewritten dump opens inside try and returns structured JSON. Open-failure behaviour tested [TEST]: opening a nonexistent path throws `ERR_SQLITE_ERROR unable to open database file` and creates no directory. |
| R3-g | The rev-3 dump text had no try block around `new DatabaseSync(process.argv[2], { readOnly: true })` (rev-3 lines 749–750), and it wrote text, not structured JSON. | Rev-3 lines 748–750. | Fixed (A1 #5). The rewritten dump opens inside try and emits `IIPS-P1-READONLY-DUMP/1` JSON. Its exit code is 0 even when `ok` is false, so the script decides by the JSON `ok` field only. Open-failure behaviour tested [TEST]: a nonexistent path returns `{"schema":"IIPS-P1-READONLY-DUMP/1","ok":false,…,"error":"open: unable to open database file"}` and creates no directory. |
| R3-i | Rev-3 S08 required `V-A2-8` in its `$requiredIds` list while the record said the literal test is NOT PERFORMED. | Rev-3 `requiredIds` at S08. | Resolved (B4 and E2): the validator's row-state `V-A2-8` result is a measured item (`v2A8ProxyPass`). The literal test is NOT PERFORMED and is never presented as passed. Summary field `v2A8LiteralTest: NOT_PERFORMED`. |

Revision-3 record items named in the directive, re-verified:
- **`tsconfig` citation.** Pinned `tsconfig.json` blob `6d696ec2…` [GH]: `module` and `moduleResolution` `NodeNext`; `outDir` `./dist`; `rootDir` `./`; `include` `src/**`, `tests/**`, `frontend/**`; no `incremental`. Consistent with the emitted entry `dist/src/persistence/gateAPrimeProvisioning.js` (`rootDir ./`).
- **`Q-MIG-B` reference (rev 3).** Rev 3 used `Q-MIG-B` once (in the F5 text, for the build pre-step) and never defined it in its §E1 table. The build question is now `Q-BUILD` (D-9). Revision 4 has no `Q-MIG-B` reference.
- **Tracker line 12741 (`DISP-03`).** Verified at baseline `aa013db`: it says validate at step 2 refuses `STORE_NOT_FOUND` (citing validator lines 371–372). The pinned validator throws that code (line 372), but the entrypoint emits `UNEXPECTED_FAILURE` (F8, F9). The IPD tracker also records commit `e08d013` (line 14955) as the change that reports a missing store as `STORE_NOT_FOUND`. Compare API at `a891802e`: `e08d013` is 9 commits ahead of the pin (pin is its ancestor), so that change is not in the execution basis and is not evidence for the pinned behaviour. Revision 4 does not cite line 12741 as a pointer. It cites the pointer rows (lines 14 and 22) by content.

### A2 (continued). Source and record facts verified in this pass

| # | Fact | Source |
|---|---|---|
| F1 | `GATE_A_PRIME_ACT_ID` = `IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01`. Matches the script constant. | [SRC] `gateAPrimeValidation.ts` 23–24 (blob `df5d48a5`) |
| F2 | `BASIS_COMMIT` `5fc74085ade980846ff4a07b36415b6d49446486`; `BASIS_TREE` `7226ef0033b3a7049169d8fcf9bcbc9908e2590b`. Match the script. | [SRC] `gateAPrimeValidation.ts` 25–26 |
| F3 | `PRINCIPAL_LABEL` `ramki-personal-local`; `TENANT_ID` `ipd-personal-local`; `CANONICAL_OWNER_ID` `ipd-owner-ramki-personal`. Match the script. | [SRC] `gateAPrimeValidation.ts` 50–52 |
| F4 | `bindingIdFor(p)` = SHA-256 of `binding:` + p, first 32 hex; `membershipIdFor(t,o)` = SHA-256 of `membership:` + t + `:` + o, first 32 hex. Recomputed with Python: `c5808abaffd072d6401ce63ad86c6ac0` and `d25dcc5370100b00766efc5166f65cf3`. Match the script. | [SRC] `gateAPrimeProvisioning.ts` 128–136; [TEST] |
| F5 | Migration SQL: four `sql:` template literals, no escapes and no `${` (cooked value equals raw text). SHA-256 by two independent methods (Python extraction of the raw text; Node 22.22.3 type stripping importing the modules and hashing `m.sql`): 001 `08e712fd…80ab` (2878 chars), 002 `01892a86…47ed` (506), 003 `7967acc0…004e` (1104), 004 `0dbf90c1…b0ac` (542). The two methods agree. | [SRC] `src_src_persistence_migrations_00{1..4}_*.ts` (blobs `f594a182`, `932af8e6`, `32b125bf`, `6bad5a50`, recomputed with `git hash-object`); [TEST] |
| F6 | Ledger checksum = `migrationChecksum(migration)`, the SHA-256 of `migration.sql` as UTF-8, and it is the value inserted in `_migration_ledger`. | [SRC] `pin_migration_ledger.ts` 32–33, 70, 84–90 |
| F7 | `executeProvisioning`: `args.mode` check (518); `authorizeExecution(args, options)` at line 520, outside the try; `openDatabase` at 523 and `ensureMigrations(db, GATE3_MIGRATIONS)` at 524, inside the try at 522–526; `executeWithAuthorization` at 525. A non-refusal error in the try is re-thrown as `GateAPrimeRefusalError('EXECUTION_FAILED_ROLLED_BACK', …)` at 528–531. Errors from `authorizeExecution` are not wrapped. | [SRC] `gateAPrimeProvisioning.ts` 513–531 |
| F8 | Entrypoint (`if (isMain())`, 634–646): success writes one JSON object to stdout with `process.stdout.write` and exits normally (status 0). Any thrown error writes `{ok:false,code,error}` to stderr and sets `process.exitCode = 1`. `code` is the refusal code for `GateAPrimeRefusalError` and `UNEXPECTED_FAILURE` otherwise (including `GateAPrimeStoreError`, which is not a refusal class). | [SRC] `gateAPrimeProvisioning.ts` 629–646; classes at 107 and `gateAPrimeValidation.ts` 93 |
| F9 | Validate on an absent store: `validateStoreAtPath` throws `GateAPrimeStoreError('STORE_NOT_FOUND', 'the validation store file does not exist')`, which the entrypoint emits as `UNEXPECTED_FAILURE` with that message. The `DISP-03` tracker wording (`STORE_NOT_FOUND`) names the thrown class, not the emitted code. | [SRC] `gateAPrimeValidation.ts` 367–373; `gateAPrimeProvisioning.ts` 639–641 |
| F10 | Receipt (execute success) fields: `mode`, `actId`, `store`, `bindingId`, `membershipId`, `auditEventId` (number), `basisCommit`, `basisTree`, `executingCommit`, `executingTree`. | [SRC] `gateAPrimeProvisioning.ts` receipt type and object literal (around 85–91 and 496–508) |
| F11 | Validator report: `status` `'PASS'|'FAIL'`, `checks[]` of `{id, ok, detail}`, `bindings`, `memberships`, `auditEvents`. Check ids: `V-A2-1` (ledger, 162–177), `V-A2-2`, `V-A2-3`, `V-A2-4`, `V-A2-5`, `V-A2-6` (binding resolution, 195–213), `V-A2-7` (calls `evaluatePortSaveGuard()` at runtime, 323), `V-A2-8` (row-state, 334–336). | [SRC] `gateAPrimeValidation.ts` 76–90, 162–213, 245–343 |
| F12 | `V-A2-8` (lines 331–336): `consumedShape = bindings.length > 0 || memberships.length > 0`; the check passes when `consumedShape && bindings ≤ 1 && memberships ≤ 1`. It is a row-state check. It does not attempt a second invocation and does not test a refusal. Its detail string says a second invocation refuses, which is not tested. | [SRC] `gateAPrimeValidation.ts` 331–336 |
| F13 | `V-A2-7` runs the validator's runtime call to `evaluatePortSaveGuard()`. The IPC `WRITE_NOT_AUTHORIZED` path is in `src/ipc/dispatch.ts` at `27becc76`, line 231, and is source-only. | [SRC]; IPC not run [NOT PERFORMED] |
| F14 | Store open on the execute path: `openDatabase` runs `mkdirSync(dirname, {recursive:true})` (84), `new DatabaseSync(filePath)` (85), then `PRAGMA foreign_keys = ON` (86), `journal_mode = DELETE` (87), `synchronous = FULL` (88). Validate mode opens with `readOnly: true` (validator 377, 395) and no mkdir. Sidecar behaviour of read-only opens is NOT TESTED; S09 records sidecar presence and does not rely on it. | [SRC] `connection.ts` 84–88 (blob `5169e402`); validator 377, 395 |
| F15 | Environment gate: `environmentCarriesGateValues` (284–288) keeps environment keys with the prefix `GATE_A_PRIME_` (case-sensitive `startsWith`), and `assertCommonArguments` uses it at 312. The script's check is case-insensitive (PowerShell `-like`), which is stricter. | [SRC] `gateAPrimeProvisioning.ts` 284–288, 312 |
| F16 | Node range: `authorizeExecution` requires major 22 and minor ≥ 13 (`>=22.13.0 <23`). | [SRC] `gateAPrimeProvisioning.ts` 399–407 |
| F17 | Import-time side effects [SRC, static]: the entry's `isMain()` (629–631) compares `process.argv[1]` to `gateAPrimeProvisioning.js` or `.ts`. The probe imports the validator, which imports `migration_ledger`, the four migration modules, `audit`, `binding`, `portfolio_store`, and `node:sqlite`. A line-by-line top-level scan of the pinned blobs `540d49f2` (portfolio_store), `96d0079d` (binding), `273ccd3b` (audit), `88198b44` (migration_ledger), `5169e402` (connection), the four migrations, and the validator found no top-level calls (only declarations, `Object.freeze`, regex constants). The chain has not been executed as a whole [NOT PERFORMED]. | [SRC] pinned blobs fetched by contents API at `a891802e` and hashed with `git hash-object` (blob ids as listed) |
| F18 | `package.json` at the pin (blob `51796e63`): `"type": "module"`; `"build": "tsc && vite build && npm run build:portfolio-ui-package && npm run build:pit-package"`; `"prepare": "npm run build:portfolio-ui-package && npm run build:pit-package"`. So `npm ci` runs the two package builds through `prepare`. | [SRC] `package.json` lines 5, 7, 17 |
| F19 | Base act read at the pin: `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md`, 29856 bytes. Steps 0–6 and stop conditions §8.2. **There is no build step in §8.** The commands `npm ci`, `npx tsc --noEmit`, `npm run build`, `npm test` appear in §2 (table, line 63) as the local validation executed at the selected basis. The QE matrix (origin/main, line 90) lists `npm ci --no-audit --no-fund`; the script runs `npm ci` without those flags. | [SRC] base act §2 line 63, §8 lines 247–289; [REC] QE matrix line 90 |
| F20 | Base act §8 step 2 says "record that bindings = 0 and memberships = 0". The entrypoint emits `UNEXPECTED_FAILURE` on an absent store (F9), not a bindings count. The script records the verbatim refusal. | [SRC] base act §8 step 2; F9 |
| F21 | Base act §8 step 5 requires "V-A2-8 second invocation refused with zero change". That conflicts with P1-F condition 2 (one attempt). See E2. | [SRC] base act §8 step 5; P1-F §6 cond. 2 [REC] |
| F22 | PF-15 corrected act `-02`, row F4: `C:\iips-data\iips\user-portfolio.sqlite`, "RENDERED as intended stable path for the single P-1 store". The row does not state that it binds `--store`. | [REC] PF-15 blob `3fe9a2dd…` line 30 |
| F23 | Tracker pointer rows at baseline `aa013db`: line 14 (`**Latest (`CV-CORR-186`…` — P-1 AUTHORIZED, ONE ATTEMPT, NOT YET MADE) and line 22 (`**Current CAP-03 P-1 / PF-15 status**` — UNSPENT). Line 22 also states that `P-1-C` NOT ESTABLISHED and `P-1-D` NOT VERIFIED FOR THE ATTEMPT are PA-WAIVED under PA-20 (not blockers), and that `P-1` is UNSPENT. Marker counts at baseline: `**Latest (`CV-CORR-186`` 1; `**Current CAP-03 P-1 / PF-15 status**` 1; `**Last Updated**` 2 (not used as a marker). | [REC] tracker `aa013db` lines 14, 22; [TEST] counts |
| F24 | Tree modes at `aa013db` (recursive tree, [GH]): P1-F `100644 blob a90bb001…`; PF-15 `100644 blob 3fe9a2dd…`; tracker `100644 blob 12e483ed…`. | [GH] |
| F25 | Node 22.22.3 on Linux: loading `node:sqlite` prints the `ExperimentalWarning` (two stderr lines) and creates no database file. The S01 probe and the dump both returned exit 0 under this test, and the dump's error object is JSON on stdout. | [TEST] |
| F26 | IPD commit `e08d013` (cited in the IPD tracker at line 14955) is 9 commits ahead of the pin `a891802e`; the pin is an ancestor of it (compare API, `ahead_by 0`, `behind_by 9`). Not part of the basis; not used as evidence for pinned behaviour. | [GH] |

### A3. Still unverified (named items)

| # | Item | Why unverified | Who can verify |
|---|---|---|---|
| U-1 | The script parses and behaves as designed on Windows PowerShell 5.1 | No PowerShell in this sandbox. Static text review only (B5). **PowerShell 5.1 parse: NOT PERFORMED. Windows runtime: NOT PERFORMED.** | Operator, on the designated host, only after designations and PA ruling |
| U-2 | Host facts: hostname, non-elevation, product name, Node version, flag-free `node:sqlite`, `GATE_A_PRIME_*` absence, NODE_OPTIONS, drive type and format, sync state beyond environment roots, ACL evaluation | Windows host only | Operator, read-only, in the preflight |
| U-3 | Store absence, sidecar absence, parent existence, reparse points, `.git` at or above the store and evidence paths | Host filesystem | Operator, read-only |
| U-4 | Clean checkout at `a891802e` / `76f083d7`; designated blobs at HEAD of the local checkout | No local IPD checkout in this sandbox. Remote tree only: 15/15 designated blobs match (prior pass, [GH]) | Operator, in S02 |
| U-5 | `npm ci` and `npm run build` on the host; closure emission; emitted migration identity | Not run | Operator, in S04 |
| U-6 | Validator `V-A2-1` to `V-A2-7` at runtime | Validator and entry are source-only here | Operator, S08, only after a single invocation |
| U-7 | Literal `V-A2-8` (second invocation refused, zero change) | Requires a second invocation, which P1-F forbids. **NOT PERFORMED; must not be performed.** | Not performable within P-1 (Q-V8) |
| U-8 | Store-directory writability | No method is designated (Q-WRITE); ACL evaluation and parent probe are not effective-access tests | Authority ruling, then operator |
| U-9 | Revocations recorded outside the IRR repository or under non-P-1 names | Freshness covers P-1-named paths, the two pointer rows, and tracker added lines only | Reviewer of the changed-path list in `run-summary.json` |
| U-10 | Dump and emitted-probe JavaScript on Node 22.x on the host | Syntax-checked on Linux only [TEST]; not run on a host | Operator, in S04 and S09 |

---

## B. Script structure, stop points, and static results (revision 5; changes in section F)

### B1. Modes and stages

The script is `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1`. As committed, it **refuses at S00 in both modes**: `$AuthorityRulingRef`, `$DesignatedActorLabel`, `$DesignatedEvidenceRoot` and `$DesignatedWritabilityMethod` are null. It is a reviewed artifact, not a runnable procedure. If S00 were passed, S04 refuses while `$BuildAuthorityRef` is null (Q-BUILD).

| Stage | Mode | Declared effects (revision 5, R5-01) | Content | Check IDs |
|---|---|---|---|---|
| S00 | both | None before the run directory. Reads the evidence root, store chain, repository and (Execute) the acceptance file. | Script path; designations (ruling, actor, evidence root, writability method, store = F4); absolute and canonical paths (`Get-CanonicalPath`); evidence-root containment (`Invoke-EvidencePlacement`); prior-run scan (`p1-exe-*` any; marker; unsealed; any `p1-*` file); claim presence (Execute); acceptance and preflight verification (Execute) | `S00-*` |
| S00 claim | execute | Creates `execute-claim.json` exclusively in the evidence root, before the run directory; retained on every outcome after acquisition | `Invoke-ExecuteClaim`; read-back | `S00-EXECUTE-CLAIM-*`, `R-CLAIM-HELD` |
| — | both | Creates the run directory (`p1-pre-…` or `p1-exe-…`) exclusively, and `run.log` | Name and exclusive creation | `S00-RUNDIR-NEW` |
| S01 | both | Run-directory files only (probe script, logs); reads host, Node and environment | Host, non-elevated, product, `GATE_A_PRIME_*` absent, `GIT_*` absent (F13), NODE_OPTIONS unset, Node 22 ≥ 13, flag-free `node:sqlite` probe | `S01-*` |
| S02 | both | Run-directory files; read-only git queries | HEAD and tree = pin; `status --porcelain --untracked-files=all` empty; designated blobs (`ls-tree`) | `S02-*` |
| S03 | both | Run-directory files; `PARENT_PROBE` (only if designated) creates and removes one probe file in the store parent, with creation and cleanup recorded separately; `ACL_EVALUATION` reads ACLs only | Store absent; sidecars absent; outside worktrees; no `.git` or reparse in the chain; SUBST; fixed NTFS; not OneDrive env root; writability by the designated method | `S03-*` |
| S04 | both | `npm ci` and `npm run build` write `node_modules`, `dist`, `dist-frontend` in the checkout; no store | Build (requires `$BuildAuthorityRef`, Q-BUILD); closure present and emitted this build; emitted ledger module presence (`S04-EMITTED-LEDGER-MODULE`); emitted migration identity; clean after build; ignored entries limited to `node_modules/`, `dist/`, `dist-frontend/` | `S04-*` |
| S05 | both | `node --mode=validate` on the absent store: expected to refuse and not create the store | Verbatim refusal code and message; store still absent | `S05-*` |
| S06 | both | GitHub API, read-only | Freshness: origin/main; IPD pin tree on the remote; full recursive tree diff with modes; P1-F and PF-15 entries; tracker pointer identity; tracker added-line scan; P-1-named changes | `F-*`, `FRESHNESS_*` |
| S07-GO | both | None | Preflight outcome `PREFLIGHT_PASSED_NOT_EXECUTED`; end, summary, seal. Execute continues. | — |
| S07-RECHECK | execute | Run-directory files only; no probe, no build, no marker | Script and acceptance hashes; host; git pin; evidence containment (repeated); store placement (repeated, `ProbeAllowed` false); closure hashes; freshness; claim held; only this run's `p1-exe-*` | `R-*` |
| S07-MARKER | execute | Writes `EXECUTE-MARKER.json` (CreateNew) before the process | Marker | — |
| S07-INVOKE | execute | **Invokes once**: `node … --mode=execute` | Ten arguments; `ExecuteCalls` guard (`SECOND_INVOCATION_REFUSED`) | `S07-RECEIPT`, `S07-RESULT`, `S07-INVOCATION-EXCEPTION` |
| S08 | execute | Read-only: store SHA-256; `node … --mode=validate` with the same arguments | Store SHA-256; validate report; V-A2-1…V-A2-8 as a row-state proxy; counts 1/1/1; `status` PASS | `S08-*` |
| S09 | execute | Read-only: `DatabaseSync(…, { readOnly: true })` dump and sidecar listing; writes only run-directory files | Dump; ledger identity against the pinned list (execute-matching outcome); store SHA-256 unchanged; sidecars after dump | `S09-*` |
| S10 | both | Run-directory files (`run-summary.json`, `SHA256SUMS.txt`) | Summary and seal | — |
| Catch | both | Run-directory files (`failure-summary.json`, seal) | Any stop: outcome from recorded state; post-invocation forensics once (isolated) if the invocation was started; marker presence read from disk | — |

Run directory layout (revision 5): `run.log`; `NN-<name>.cmdline.txt`, `.stdout.txt`, `.stderr.txt`, `.code.txt`, `.timing.txt` for every process; `probe-sqlite-<guid>.mjs`; `probe-migrations-<guid>.mjs`; `acl-<n>-nearest-ancestor.txt` (ACL method); `entry-closure-sha256.txt`; `readonly-dump-<guid>.mjs`; `EXECUTE-MARKER.json` (execute only, before the process); `run-summary.json` or `failure-summary.json`; `SHA256SUMS.txt` (last). Execute only: `execute-claim.json` is written to the evidence root, not to the run directory (R5-03).

Refusals before the run directory exists (all of S00 before creation) create nothing and no summary file. Operators must keep the console transcript for those stops.

### B2. Outcomes (set from recorded state; never inferred)

| Outcome | Meaning |
|---|---|
| `PREFLIGHT_PASSED_NOT_EXECUTED` | Preflight completed. The entrypoint was not invoked. |
| `PREFLIGHT_STOPPED` | Preflight stopped at a check. |
| `STOPPED_BEFORE_MARKER` | Execute stopped before the marker. No marker, no invocation. The execute claim is retained if it was acquired (R5-03). Q-CONS-2 open. |
| `MARKER_WRITTEN_INVOCATION_EXCEPTION` | The marker exists; the invocation wrapper threw (process start or raw-capture write). The attempt is spent (Q-CONS-3). S08 and S09 still ran. |
| `EXECUTED_RECEIPT_MATCHES` (intermediate) | Exit 0; the receipt matches the pinned values. Final classification follows. |
| `EXECUTED_VALIDATED_PASS` | Receipt matches; validate PASS with V-A2-1…V-A2-8 row-state result and counts 1/1/1; ledger identity; no post-step failure; read-only invariant. |
| `EXECUTED_POST_STEP_FAILED` | Receipt matches and validation passed, but a post-step failure was recorded. |
| `EXECUTED_POST_VALIDATION_NOT_PASSED` | Receipt matches but validation or ledger identity did not pass. |
| `EXECUTED_RECEIPT_MISMATCH` | Exit 0 but stdout is not the expected receipt. |
| `EXECUTION_REFUSED_OR_FAILED` | Nonzero process status. Refusal code recorded from the last stderr JSON line. |
| `MARKER_WRITTEN_STOPPED_AFTER_MARKER` | A stop after the marker that is not a recorded invocation outcome. The attempt is treated as spent. A marker file found on disk in the outer catch is recorded as written (revision 5). |

### B3. Source-derived constants (all verified this pass)

| Constant | Value | Verified by |
|---|---|---|
| `$ExpectedCommit`, `$ExpectedTree` | `a891802e…`, `76f083d7…` | [GH] (prior pass); act §8 step 0 |
| `$BasisCommit`, `$BasisTree` | `5fc74085…`, `7226ef00…` | F2 |
| `$PrincipalLabel`, `$TenantId`, `$CanonicalOwnerId` | `ramki-personal-local`, `ipd-personal-local`, `ipd-owner-ramki-personal` | F3 |
| `$ExpectedBindingId`, `$ExpectedMembershipId` | `c5808abaffd072d6401ce63ad86c6ac0`, `d25dcc5370100b00766efc5166f65cf3` | F4 |
| `$ExpectedMigrations` (ids and SHA-256) | `001_initial_schema` `08e712fd…80ab`; `002_audit_event_sequence` `01892a86…47ed`; `003_local_principal_bindings` `7967acc0…004e`; `004_portfolio_contribution_provenance` `0dbf90c1…b0ac` | F5 (two methods) |
| `$CountedTables` | `_migration_ledger`, `local_principal_bindings`, `local_principal_memberships`, `audit_events`, `portfolios`, `portfolio_revisions`, `portfolio_holdings`, `portfolio_contributions` | `CREATE TABLE` in migrations 001–004 and `_migration_ledger` at `pin_migration_ledger.ts` line 25 |
| `$DesignatedStorePath` | `C:\iips-data\iips\user-portfolio.sqlite` | F22 (Q-STORE for binding) |
| `$DesignatedBlobs` (15) | as in revision 3; remote-verified at the pin in the prior pass | [GH], prior pass |
| `$P1FEntry`, `$Pf15Entry` | `100644 blob a90bb001…`, `100644 blob 3fe9a2dd…` | F24 |
| `$TrackerPointerMarkers` | `**Latest (`CV-CORR-186`` (1 baseline line), `**Current CAP-03 P-1 / PF-15 status**` (1) | F23 |
| `$AcceptanceSchema` | `IIPS-P1-PREFLIGHT-ACCEPTANCE/1` | New in revision 4 |

### B4. Single-attempt semantics and V-A2-8 resolution

- **One call site.** `Invoke-Capture` for `--mode=execute` appears once in the script. `$script:ExecuteCalls` is incremented immediately before the call; a second increment is a stop (`SECOND_INVOCATION_REFUSED`). The marker is written before the call (kept from revision 3, as directed).
- **Consumption as recorded by the script.** The script records `p1fConsumption` as `CONSUMED` when the marker exists, and as `UNDETERMINED` when there is no marker. Preflight records `NOT_APPLICABLE`. The script does not decide the authority question; see E1.
- **V-A2-8 (direction 1 of the current pass).** The contradiction is resolved as follows.
  1. What the validator's `V-A2-8` does: F12. It is a row-state check that passes only when at least one row exists and each table has at most one row. It is evaluated in validate mode. It does not refuse a second invocation.
  2. The script's S08 pass requires the validator's report `status` PASS. That includes the row-state `V-A2-8` result as a measured validator result. The script records it as `v2A8ProxyPass`. It never calls it "literal V-A2-8".
  3. The literal test (second invocation refused, zero change) is **NOT PERFORMED**. The summary says so in `v2A8LiteralTest` and in `notPerformedByScript`. No second invocation exists in the script.
  4. Whether the proxy, plus source-verified refusal behaviour (F9 and the `STORE_ALREADY_EXISTS` refusal at `gateAPrimeProvisioning.ts` 413 and 434), satisfies act §6 V-A2-8 is a PA question (Q-V8). It is not decided here.
- **Process-start failure and raw-capture failure after the marker** are treated as an attempt spent (E1, Q-CONS-3). The post-invocation steps still run (A1 #3).

### B5. Static checks on revision 5 (NOT a PowerShell parse)

| Check | Result |
|---|---|
| Lines / bytes / SHA-256 | 1569 lines; 111,385 bytes; SHA-256 `7aa52aa407c548940446817b0cb99b9a31c427660af39baf636bd3e59e45e916`; LF (0 CR) |
| Non-ASCII characters | 0 |
| Static text checks, final file (`/tmp/w/static_check.py`, re-implemented in the final pass because the earlier `ps_static.py` was lost in a scratch reset; its earlier 19-line result is not reproduced here) | FAILS: 0; 15 PASS (F8, F13) |
| Bracket balance (text scan that skips strings, comments and here-text) | Parentheses 1113/1113; braces 333/333; brackets 344/344. Text scan, not a parse. |
| Forbidden code keywords (`exit`, `else`, `elseif`, `finally`, `break`, `continue`, `switch`) | 0 hits in code |
| try blocks | 20; each followed by `catch` |
| Check IDs | 136 literal call sites (`Require-Check`, `Add-Check`, `Add-PostFailure`); 136 distinct |
| Script-scope variables read but never assigned | None |
| Forensic status values | `OK`, `FAILED`, `NOT_APPLICABLE`. `SKIPPED` is enforced by the completeness rule but is not emitted (F1, R5-05). |
| Embedded JavaScript (dump, emitted-migration probe, S01 sqlite probe) | `node --check` PASS for all three, extracted from the final text (F8) |
| PowerShell 5.1 parse | **NOT PERFORMED** |
| Windows runtime | **NOT PERFORMED** |
| Any execution of the script, the entrypoint, provisioning, or the P-1 store | **NOT PERFORMED** |

Known PS 5.1 review points (static only). The only `?` in the script is inside an embedded JavaScript string (revision-4 line 517; revision-5 numbering differs). No PowerShell ternary, `??`, `-AsHashtable`, `using` or `-Parallel` is used. `Set-StrictMode -Version Latest` is respected by `Get-Prop` (object property reads) and hashtable reads. `ConvertFrom-Json`, `ConvertTo-Json -Depth`, `Get-FileHash`, `Get-Acl`, `Get-ChildItem -Directory`, `New-Object` generic `HashSet`, `[IO.File]`, `[regex]`, `[guid]` and `[System.Security.AccessControl]` are available on Windows PowerShell 5.1 (not run). `npm` is started through `$env:ComSpec` with the arguments `/d`, `/c`, `npm` and the npm arguments as separate array elements; that is the only use of a shell. Arguments are quoted only when they contain whitespace; a quote or newline in an argument stops the run; a trailing backslash on a quoted argument stops the run.
---

## C. Source-to-script traceability

Revision-5 note: script line numbers in this section are revision-4 positions (`fe6e801`). Revision-5 positions are in section F.

Status: **SRC** source-verified at the pin; **REC** record-verified (IRR); **GH** remote-verified; **TEST** Linux test; **STATIC** text scan; **OPEN** authority question; **NOT PERFORMED** on host.

| Requirement or source element | Source or record (file, line, blob, or commit) | Script element | Check ID(s) | Status |
|---|---|---|---|---|
| Act identifier | `gateAPrimeValidation.ts` 23–24 (`df5d48a5`) | `$ActId` | `S08` args, `S07-INVOKE` args | SRC |
| Basis commit and tree | `gateAPrimeValidation.ts` 25–26 | `$BasisCommit`, `$BasisTree` | `S07-RECEIPT` | SRC |
| Principal, tenant, owner | `gateAPrimeValidation.ts` 50–52 | `$PrincipalLabel`, `$TenantId`, `$CanonicalOwnerId` | `S07-INVOKE` args; `S08` args | SRC |
| Binding and membership ids | `gateAPrimeProvisioning.ts` 128–136 (recomputed) | `$ExpectedBindingId`, `$ExpectedMembershipId` | `S07-RECEIPT` | SRC, TEST |
| Entrypoint path | `tsconfig.json` (`6d696ec2`: `outDir ./dist`, `rootDir ./`); emitted `dist/src/persistence/gateAPrimeProvisioning.js` | `$EntryRelative` | `S04-ENTRY`, `S04-CLOSURE-*` | GH, STATIC; not built [NOT PERFORMED] |
| Build commands | QE matrix line 90 (origin/main; `npm ci --no-audit --no-fund`); base act §2 line 63 (`npm ci`, `npm run build`); `package.json` lines 5, 7, 17 (F18, `prepare` runs package builds) | S04 `npm ci`, `npm run build` (flags as in act §2; the QE flags are not used) | `S04-NPM-CI`, `S04-BUILD` | SRC, REC; not run |
| Build step absent from act §8 | base act §8 (F19) | S04 (non-authority pre-step) | — | OPEN (Q-BUILD, D-9) |
| Pin tree and commit | base act §2.3, §8 step 0; `GH` | `$ExpectedCommit`, `$ExpectedTree` | `S02-COMMIT`, `S02-TREE`, `F-IPD-PIN-TREE` | GH |
| Designated blobs (15) | base act §2.3; P1-F §2.3 | `$DesignatedBlobs` | `S02-BLOBS` | GH (remote tree), not local |
| Migration SQL and checksums | `migrations/00{1..4}_*.ts` (blobs `f594a182`, `932af8e6`, `32b125bf`, `6bad5a50`); `pin_migration_ledger.ts` 32–33, 70, 84–90 | `$ExpectedMigrations` | `S04-EMITTED-MIGRATIONS`, `S09-LEDGER-EXPECTED` | SRC, TEST |
| Ledger table | `pin_migration_ledger.ts` 25 | `_migration_ledger` count and rows | `S09-DUMP-QUERIES` | SRC |
| Tables counted | migrations 001–004 `CREATE TABLE` | `$CountedTables` (dump) | `S09-DUMP-QUERIES` | SRC |
| Store path (F4) | PF-15 `-02` row F4 (`3fe9a2dd`, line 30) | `$DesignatedStorePath`, `S00-STORE-DESIGNATED` | `S00-STORE-DESIGNATED` | REC; binding OPEN (Q-STORE) |
| Evidence root | none designated for P-1 (Q-EV) | `$DesignatedEvidenceRoot`; `Invoke-EvidencePlacement` | `S00-EVIDENCE-*` | OPEN (Q-EV) |
| Actor label | base act §8 step 3 (`--actor <label>`); parser accepts and never records (D-6) | `$DesignatedActorLabel`, `S00-ACTOR-*` | `S00-ACTOR-*` | OPEN (Q-ACTOR) |
| Host name, elevation, product | base act §8 "Host"; runbook | `Invoke-HostAndRuntime` | `S01-HOST`, `S01-NONELEVATED`, `S01-PRODUCT` | REC; host NOT PERFORMED |
| Node range and flag-free sqlite | base act §8 "Runtime"; `gateAPrimeProvisioning.ts` 399–407 (F16) | `S01-NODE`, `S01-SQLITE` probe | `S01-NODE`, `S01-SQLITE` | SRC, TEST (Linux only) |
| `GATE_A_PRIME_*` refused | `gateAPrimeProvisioning.ts` 284–316 (F15) | `S01-ENV-GATE` | `S01-ENV-GATE` | SRC |
| `GIT_*` variables stripped by the entrypoint before it measures HEAD and tree | `gateAPrimeProvisioning.ts` `sanitizedGitEnvironment` and `readExecutionHead`, ~158–220 at `a891802e` (F13) | `S01-ENV-GIT` (also in the S07 recheck) | `S01-ENV-GIT` | SRC; host NOT PERFORMED |
| `NODE_OPTIONS` unset | base act §8 ("flag-free") | `S01-ENV-NODEOPTS` | `S01-ENV-NODEOPTS` | REC; host NOT PERFORMED |
| Store absent, sidecars absent, outside worktree | base act §8 step 1; P1-F; `gateAPrimeProvisioning.ts` 409–414 (`STORE_ALREADY_EXISTS`) | `Invoke-StorePlacement` | `S03-STORE-ABSENT`, `S03-NO-SIDECAR-*`, `S03-OUTSIDE-WORKTREE`, `S03-NO-WORKTREE-CONTAINS-STORE` | SRC; host NOT PERFORMED |
| `.git` at or above store and evidence paths | base act §8 step 1 ("outside every Git working tree"); `gateAPrimeProvisioning.ts` 290–297 (`isInsideGitWorktree`) | `Get-GitMarkerHits` | `S03-NO-GIT-IN-CHAIN`, `S00-EVIDENCE-NO-GIT-IN-CHAIN` | SRC |
| Fixed NTFS, not synced | base act §8 step 1; PF-11/H-8 | `Get-DriveFacts`; env OneDrive roots | `S03-FIXED-NTFS`, `S03-NOT-ONEDRIVE-ENV`, `S00-EVIDENCE-DRIVE-FIXED-NTFS` | REC; sync state NOT VERIFIED (U-2) |
| Writability | base act §8 step 1 ("operator-writable without elevation") | `Get-WriteAclEvaluation` or `Get-ProbeWritable` | `S00-WRITABILITY-DESIGNATED`, `S03-WRITE-*` | OPEN (Q-WRITE); not effective access |
| Pre-state validation | base act §8 step 2; `gateAPrimeValidation.ts` 367–373 (F9); F20 | `Invoke-PreStateValidate` | `S05-PRESTATE`, `S05-STORE-STILL-ABSENT` | SRC; host NOT PERFORMED |
| Execute arguments | base act §8 step 3; parser (`--name=value` only, D-2) | `$execArgs` | `S07-INVOKE` | SRC |
| Execute refusal and error codes | `gateAPrimeProvisioning.ts` 512–531, 634–646 (F7, F8) | `Get-RefusalField` with `Get-LastJsonLine` | `S07-RESULT` | SRC, TEST (warning line) |
| Receipt fields | `gateAPrimeProvisioning.ts` receipt type and literal (F10) | `S07-RECEIPT` | `S07-RECEIPT` | SRC |
| Post-state validation V-A2-1…V-A2-8 | base act §6; `gateAPrimeValidation.ts` 162–343 (F11–F13) | `S08` checks | `S08-VALIDATE` | SRC; runtime NOT PERFORMED |
| V-A2-8 literal (second invocation) | base act §6 and §8 step 5 vs P1-F cond. 2 | Summary field `v2A8LiteralTest` | — | OPEN (Q-V8); NOT PERFORMED |
| V-A2-7 IPC behaviour | `src/ipc/dispatch.ts` at `27becc76` line 231 | Not invoked | — | SRC (source only); NOT PERFORMED |
| Read-only open of store | `gateAPrimeValidation.ts` 367–395 (`readOnly: true`); F14 (DELETE journal) | `S09` dump | `S09-READONLY-INVARIANT`, `S09-SIDECARS` | SRC, TEST (absent path) |
| Single attempt | P1-F cond. 2; §16.206 P1-F row; base act §9 | `$script:ExecuteCalls`, marker, `S00-NO-PRIOR-EXECUTE-DIRECTORY` | `SECOND_INVOCATION_REFUSED`, `S00-NO-PRIOR-*` | REC; Q-CONS OPEN |
| Freshness (P-1 entries) | P1-F and PF-15 blob identities (F24) | `Invoke-Freshness` | `F-P1F-ENTRY`, `F-PF15-ENTRY` | GH |
| Tracker pointer rows | tracker `aa013db` lines 14 and 22 (F23) | `$TrackerPointerMarkers` | `F-TRACKER-POINTER-IDENTITY` | REC, TEST |
| Tracker added lines | — (drift guard) | `$TrackerP1Term`, `$TrackerConsumeTerm` | `F-TRACKER-ADDED-P1-LINES` | GH |
| Acceptance of preflight | New in revision 4 (this pass; governance design, not a PA ruling) | `Test-AcceptanceAndPreflight` | `S00-ACCEPTANCE-*`, `S00-PREFLIGHT-*` | Design; not yet exercised |
| Tracker DISP-03 wording | tracker line 12741 (`DISP-03`); IPD `e08d013` (F26) | none (not applied) | — | REC; separate correction (E6) |

---

## D. Remaining NO-GO conditions

Each item must be closed before any preflight or invocation. None is closed by this revision.

| # | Condition | Owner | Closes by |
|---|---|---|---|
| D-1 | **Q-CONS**: written PA treatment of a preflight run, a stop before the marker (including after the execute claim is acquired, which retains the claim), a marker followed by a process-start or raw-capture failure, and a recorded invocation (E1); and the release rule for `execute-claim.json` (F2, R5-03) | PA | Written ruling |
| D-2 | **Q-STORE**: confirm F4 `C:\iips-data\iips\user-portfolio.sqlite` is the `--store` for P-1 | PA | Written ruling |
| D-3 | **Q-EV**: designate the P-1 evidence root (absolute, fixed NTFS, outside every Git working tree and the store chain, not in a sync root, pre-existing, operator-created) | PA | Designation |
| D-4 | **Q-ACTOR**: designate the `--actor` label | PA | Designation |
| D-5 | **Q-WRITE**: designate the writability method (`ACL_EVALUATION` or `PARENT_PROBE`) and accept its limits | PA | Written ruling |
| D-6 | **Q-MIG**: confirm migrations 001–004 are created on the fresh store (V-A2-1 expected state) | PA | Written ruling |
| D-7 | **Q-TX**: confirm migration transactions sit outside act §7 item 2 ("one `BEGIN IMMEDIATE`") | PA | Written ruling |
| D-8 | **Q-V8**: decide how the post-run record treats literal `V-A2-8` (NOT PERFORMED, with proxy and source refusal evidence) | PA | Written ruling, after the run |
| D-9 | **Q-BUILD**: accept the S04 build pre-step (act §8 has no build step; the commands are act §2 basis validation; QE matrix line 90 lists `npm ci --no-audit --no-fund`, which the script does not use) or require an operator-produced `dist/` with recorded evidence | PA | Written ruling |
| D-10 | **AuthorityRulingRef**: the reviewed change that sets the designations cites the ruling(s) above | Author of the reviewed change | Reviewed change |
| D-11 | **Acceptance**: after a sealed, passing preflight on `DESKTOP-NO0NHTP` and review of its raw run directory, a reviewed acceptance file binding the preflight summary hash and the exact script SHA-256 | Reviewer | Reviewed artifact |
| D-12 | **Freshness at GO**: the operator's GitHub access must succeed; the PA's statement that P1-F is unspent must still hold on the day of the invocation. The repository read cannot prove the absence of an out-of-band attempt. | Operator and PA | At run time |
| D-13 | **Host facts**: U-2, U-3, U-4 (clean checkout; local blob check), U-5 (build), U-10 (JavaScript on Node 22.x) | Operator | Preflight |
| D-14 | **Windows runtime and PowerShell 5.1 parse** | Operator | Preflight |
| D-15 | **Tracker DISP-03 wording** (`STORE_NOT_FOUND` vs emitted `UNEXPECTED_FAILURE`): separate correction, not in this PR | IRR maintainer | Separate PR (E6) |

Independent functional or technical blockers (for the final report, after the authority items): D-13, D-14 and the host-side unknowns in U-2 to U-5 and U-10. Nothing in this revision is a runtime incompatibility; none has been observed.

---

## E. Authority questions, publication, status, and next safe action

### E1. Authority questions

**Q-CONS (single-attempt consumption), with the cases the script must distinguish:**

| Case | Script state | Marker | Process invoked | Script's recorded `p1fConsumption` | Question for PA |
|---|---|---|---|---|---|
| 1. Preflight run (any outcome) | Declared effects per B1 (run directory, npm ci and build, probe if designated, validate on the absent store); no execute-mode invocation; no claim | no | no | `NOT_APPLICABLE` | **Q-CONS-1**: confirm that a preflight is not an attempt |
| 2. Execute stop before the marker (any S00–S07-RECHECK failure after the claim was acquired) | Claim retained (`execute-claim.json`); run directory sealed (`failure-summary.json`) | no | no | `UNDETERMINED` | **Q-CONS-2**: confirm that this does not consume P1-F. The retained claim and the sealed `p1-exe-*` directory block every later execute run; release needs a PA ruling (R5-03). |
| 3. Marker written; process start or raw capture failed | Marker exists | yes | not started, or unknown | `CONSUMED` | **Q-CONS-3**: confirm consumption (the script treats the marker as spending the attempt; marker-before-process kept) |
| 4. Process started; any result (exit 0, nonzero, refusal, unparseable) | Marker exists | yes | yes | `CONSUMED` (P1-F cond. 2, "failed or partial consumes it") | none; the authority text already decides it [REC] |
| 5. Second execute | Blocked by S00 and by the call-site guard | — | — | not performed | none |

Source facts for the question: P1-F condition 2 and tracker §16.206 P1-F row: "the first attempt, successful or not, spends the act" [REC]. Base act §9: consumed "on completion whether the act succeeds or fails", with `NOT EXECUTED — <reason>` as a failure disposition [REC]. Runbook §4 and §7 read a pre-execution stop as "not an attempt" [REC]. Those readings differ for case 2. The record does not settle it.

**Other open items:** Q-STORE, Q-EV, Q-ACTOR, Q-MIG, Q-TX, Q-V8, Q-WRITE, Q-BUILD, as in section D.

### E2. Directive items (resolved in this revision or stated as open)

1. **V-A2-8 contradiction.** Resolved as in B4: the validator's row-state result is measured and reported as `v2A8ProxyPass`. The literal second-invocation test is NOT PERFORMED and is not represented as passed. The script has no second invocation. The acceptance rule is Q-V8.
2. **Authorization freshness.** Verified immediately before the marker by the recheck (`R-*`) and the full freshness read (`S06`). The repository read verifies P1-F and PF-15 entries (mode and blob), the tracker pointer rows, the added-line scan, and the IPD pin tree on the remote. It cannot prove that P-1 is unspent outside the repository. The script stops if GitHub is unavailable (`FRESHNESS_UNVERIFIABLE`). The out-of-band question is D-12. Establishability: partially (repository state yes; out-of-band no). Under the directive, the invocation must not proceed without the PA's current statement, which is D-12.
3. **Actor and store.** The actor label is not designated (Q-ACTOR); `-ActorLabel` is never authority. The store path equals the F4 string as a constant; binding to `--store` is Q-STORE. A valid format or a default is not authorization. Both designations stop the run as committed.
4. **Build pre-step.** Revision 4 runs `npm ci` and `npm run build` (act §2 basis validation; `prepare` runs the package builds, F18). The pin check (S02) runs before the build, cleanliness and ignored-entry checks run after it, and the emitted-closure and migration checks confirm the build output. Act §8 has no build step (F19), so the step is recorded as Q-BUILD. Nothing is run.
5. **PowerShell static review.** Done (B5): 5.1 feature check, process invocation (`ProcessStartInfo`, separate capture, no shell except `npm` through `ComSpec`), argument quoting, exception handling (one outer catch; try blocks only in post steps), evidence preservation (`CreateNew`, raw first), stop behaviour (`throw` only; no process status set). **Static review only; no runtime claim.**
6. **Post-state evidence.** Receipt fields (F10) and read-only invariants (F14; `S09-READONLY-INVARIANT`) are checked against the pinned source. Raw stdout, stderr, process status code, UTC start and end, store fingerprint before and after the read-only steps, the migration ledger, and table counts are recorded.
7. **Single-attempt semantics.** Stated in E1. No inference from earlier scripts. The unresolved authority question is exactly Q-CONS-2, and the script does not consume P1-F on that basis.

### E3. Publication and remote verification

- Revision 5 is committed to `arena/325002ab-iips-review-recovered` only, pushed without force, and verified remotely with `git ls-remote`, `gh api repos/ramkivs/iips-review-recovered/pulls/382` (head SHA, state, merged flag), and a read-back of the remote script SHA-256 and the remote record blob. The commit SHA is recorded in the PR body and in the final report. This file does not name its own commit.
- The PR is not merged. No merge is authorized by this pass.
- No durable publication is claimed from the local checkout alone. The remote read-back is the evidence.

### E4. Final status (revision 5 pass)

- **P-1 remains UNSPENT.** Nothing executed on any host. No entrypoint invocation (including execute-mode diagnostics), no provisioning, no store, no binding, no membership, no audit row, no receipt, no execute marker, no execute claim.
- **Static only:** revision-5 script text checks (B5; final pass 15 PASS, 0 FAIL). Not a PowerShell parse.
- **Linux-tested only:** the three embedded JavaScript blocks (`node --check`), the S01 flag-free sqlite probe on Linux, and the dump on a nonexistent path (F8).
- **NOT PERFORMED:** PowerShell 5.1 parse, and any other PowerShell parser (none available; F13); Windows runtime; host preflight; any build on a host; any entrypoint invocation; literal V-A2-8; the revision-5 runtime test matrix (F8).
- **Not decided here:** every item in F10.

### E5. Exact next safe action

1. The Program Authority rules in writing on the items in F10: Q-CONS-1, Q-CONS-2 (including the claim release rule), Q-CONS-3, Q-STORE, Q-EV, Q-ACTOR, Q-WRITE, Q-MIG, Q-TX, Q-V8, Q-BUILD, `AuthorityRulingRef`, and the acceptance reviewer. Nothing runs until then.
2. Only after that ruling: a reviewed change designates the values, `$AuthorityRulingRef` and `$BuildAuthorityRef`, citing the ruling. Before any host use, the F9 tests run on a fixture copy of the script, never against the P-1 store or evidence root. The operator then runs `-Mode Preflight` on `DESKTOP-NO0NHTP` and returns the raw `p1-pre-*` directory for independent review.
3. Only after that review: a reviewed acceptance file (schema `IIPS-P1-PREFLIGHT-ACCEPTANCE/1`) binding the preflight summary hash and the exact script SHA-256. The single attempt is then taken in a separate, explicitly authorized run with `-Mode Execute -ConfirmToken P1-F-ONE-ATTEMPT -AcceptanceFile <path>`. Nothing in this pass authorizes that run.
4. The DISP-03 correction (F7) is a separate IRR tracker change, to be directed by the IRR maintainer. It is not gate evidence.

### E6. DISP-03 correction (see F7; separate; not applied in this PR)

---

## F. Revision 5 (focused correction, R5-01 to R5-10)

**Basis.** Revision 4 (`fe6e801`) plus this pass. Same PR, same branch, same paths. The investigation was not repeated. Line numbers in F refer to the revision-5 script (1569 lines, SHA-256 `7aa52aa407c548940446817b0cb99b9a31c427660af39baf636bd3e59e45e916`, after the F13 correction) unless marked rev4. F1–F12 line numbers were written against the 1565-line script before the F13 insertion; from about line 609 on, the 1569-line script is 4 lines higher. F13 line numbers are from the 1569-line script.

**Changes made in this pass** (all in the script unless marked):

1. Outer catch: a marker file found on disk (`Test-Path` on `EXECUTE-MARKER.json` in the run directory) is recorded as written, even if the in-memory flag was not set because the write threw after file creation. The attempt is spent (line ~1528).
2. S04: explicit presence check `S04-EMITTED-LEDGER-MODULE` (line 802) before the emitted-migration probe. The path `dist\src\persistence\migration_ledger.js` is still inferred from the pinned source layout; the check is presence only.
3. The consumption text (`Get-P1Consumption`) now states that the retained execute claim, as well as the run directory, makes later execute runs refuse at S00.
4. The `$script:Sealed` guard in the outer catch (line 1557) was added before this pass and is verified here.
5. This record: sections B1, B2, B5, C (note), D-1, E1, E3–E6 replaced, and section F added.
6. Final execution-critical pass (F13): `S01-ENV-GIT` added to the script; B1, B5, C, F8, F9, E4 and F13 updated for it.

### F1. Status of R5-01 to R5-10

| Item | Status | Revision-5 change | Still open or not verified |
|---|---|---|---|
| **R5-01** Preflight contract | **CORRECTED** (text and declared effects). The invariant is **not verified by any run.** | The header (lines 1–41) replaces "Read-only" and "Never invokes the entrypoint" with the exact effects of each mode. `Get-DeclaredEffects` (line 1072) writes those effects into the summary field `declaredEffects`. Preflight effects: S03 probe (`Get-ProbeWritable`, line 453; checks `S03-WRITE-PARENT-PROBE` and `S03-WRITE-PARENT-PROBE-CLEANUP`, line 740), S04 `npm ci` and `npm run build` (line 749), S05 validate on the absent store. The invariant is enforced by the S00 and S03 absence checks, the S05 refusal expectation, and the absence of any execute path in Preflight. | The invariant is a design property until run on a host (NOT PERFORMED). The S05 refusal expectation is source-derived. |
| **R5-02** Evidence root and canonicalization | **PARTIAL.** Checks added; not closed. | `Get-CanonicalPath` (line 330) refuses non-drive-absolute paths, `/`, wildcard, quote, angle-bracket and pipe characters, control characters, a colon after the drive letter, doubled or empty segments, `.` and `..`, `~` short-name forms, a segment ending in a dot or space, and any path whose `GetFullPath` result differs from the input. Trailing separators are stripped before that comparison and the stripped form is used. `Invoke-EvidencePlacement` (line 650) compares the canonical root to the designated canonical root (`S00-EVIDENCE-DESIGNATED-EQUALS`; replaces prefix-only comparison) and checks: `.git` markers on the whole chain including the root (`S00-EVIDENCE-NO-GIT-IN-CHAIN`); reparse points on the chain; SUBST aliases (`Get-SubstHits`, line 360); listed worktree containment; store-chain equality and ancestry in both directions (`S00-EVIDENCE-NOT-STORE-CHAIN`, `S00-EVIDENCE-NOT-IN-STORE-DIR`, `S00-STORE-NOT-IN-EVIDENCE`); drive root; fixed NTFS; OneDrive environment roots. `Invoke-PreInvocationRecheck` (line 1019) calls `Invoke-EvidencePlacement` and `Invoke-StorePlacement -ProbeAllowed $false` again immediately before the claim and the marker. The probe result is an object with `CreateError`, `Created`, `Removed`, `CleanupError` and `Ok`, checked as separate conditions. `$script:Facts.writeProbe` holds the object, not `[bool]$probeOk`. | Case is not folded to the on-disk case. `GetFinalPathNameByHandle` is not called. SUBST detection is by listing only. Reparse detection covers the chain only. A directory swapped between checks is narrowed by the repeated checks, not excluded. Any inconclusive result stops (`Stop-Gate`). |
| **R5-03** Cross-process single-run claim | **PARTIAL.** Mechanical exclusion implemented; Q-CONS open. | `Invoke-ExecuteClaim` (line 1038) creates `execute-claim.json` in the evidence root with `FileMode.CreateNew` (atomic within one evidence root), after all S00 checks and before the run directory and the marker. It reads the claim back (`S00-EXECUTE-CLAIM-READBACK`). A creation failure stops: `EXECUTE_CLAIM_EXISTS` if the file exists, otherwise `EXECUTE_CLAIM_UNVERIFIABLE`. No retry. S00 refuses if a claim exists (`S00-NO-EXECUTE-CLAIM`, line 1409). The recheck requires it to be held (`R-CLAIM-HELD`). Nothing in the script deletes it. The count-based `R-NO-PRIOR-EXECUTE-RUN` check remains as a second check. Marker and retry semantics are unchanged. | (a) Excludes only concurrent or repeated Execute runs under the same evidence root on the same file system. It does **not** exclude an attempt under another root, on another machine, or out of band (Q-CONS). (b) The claim is acquired before S01–S07, so any Execute stop after acquisition, including a pre-marker stop, leaves the claim in place and blocks later runs until a PA release ruling. This is fail-closed and is a PA decision (Q-CONS-2). (c) There is no release procedure in the script; release is a PA act only. |
| **R5-04** Acceptance-directory integrity | **CORRECTED** (structure). The acceptance file itself is an operator-reviewed record. | `Test-AcceptanceAndPreflight` (line 945): name pattern `p1-pre-<8 digits>T<9 digits>Z-<8 lowercase hex>` (`S00-ACCEPTANCE-PREFLIGHT-NAME`); direct child of the canonical evidence root (`S00-PREFLIGHT-DIR-DIRECT-CHILD`); not a reparse point; no subdirectories (`S00-PREFLIGHT-NO-SUBDIRECTORY`); no reparse entries (`S00-PREFLIGHT-NO-REPARSE-ENTRY`); seal lines must match `^[0-9A-F]{64}  <name>$`, with no duplicate names, no malformed lines, and no self-listing (`S00-PREFLIGHT-SEAL-WELLFORMED`, line 991); sealed set equals the present file set (`S00-PREFLIGHT-SEAL-SET`); every sealed file is hashed and reparse points are refused (`S00-PREFLIGHT-SEAL-HASHES`). Bindings kept: acceptance `preflightSummarySha256` (`S00-PREFLIGHT-SUMMARY-HASH`), `scriptSha256` (`S00-ACCEPTANCE-SCRIPT-HASH`), pins, store path, evidence root, reviewer. The acceptance file's own SHA-256 is rechecked (`R-ACCEPTANCE-UNCHANGED`). | The acceptance content (decision, reviewer, review time) is not checked against any independent review record. The script verifies bindings only. No reviewed acceptance exists (D-11). |
| **R5-05** Post-invocation forensics | **PARTIAL.** Isolation and separation implemented; not run. | `Invoke-PostInvocationForensics` (line 1092) writes one entry per operation with `Add-Forensic` (line 375): `F-EXEC-RAW`, `F-RECEIPT`, `F-STORE-HASH`, `F-VALIDATE`, `F-STORE-STATE`, `F-DUMP`, `F-LEDGER`, `F-INVARIANT`, `F-SIDECARS`, `F-POST-FORENSICS`, each with status and reason. Each store hash, validate and S09 step is in its own try block. Invocation failure (`invocationFailure`: exception, refusal, or receipt mismatch) is separate from evidence-integrity failure (`evidenceIntegrityFailure` = not `evidenceComplete`). `evidenceComplete` is true only when no operation is FAILED or SKIPPED and no post-step failure is recorded (completeness block, about line 1349). Raw stdout, stderr, exit code and timing are written before interpretation. The entrypoint is never rerun to recover evidence. The outer catch calls post-invocation forensics once if they have not run (`PostForensicsDone`). | `SKIPPED` is part of the completeness rule, but no code path emits it. A step that cannot run is recorded `NOT_APPLICABLE` with a reason (only when the store is absent after a non-matching outcome) or `FAILED`. The R5-05 requirement to record "skipped" is therefore **partially** met. Every reachable branch recording every operation is reviewed, not machine-checked. A raw-file write failure after the process ends leaves the raw evidence incomplete and is recorded as such. |
| **R5-06** Writability method | **DOCUMENTED** (limits in F3). Q-WRITE open. | `S00-WRITABILITY-DESIGNATED` and `S03-WRITABILITY-METHOD-DESIGNATED` (line 689 onward). `ACL_EVALUATION` (`Get-WriteAclEvaluation`, line 423). `PARENT_PROBE` (`Get-ProbeWritable`, line 453): creation and cleanup are separate checks; a cleanup failure is a stop with the path recorded; the file is not deleted by any other means. | Q-WRITE is a PA designation. The script does not choose a method. |
| **R5-07** Build discrepancy | **REPORTED, NOT RESOLVED.** Execute and Preflight blocked. | `S04-BUILD-AUTHORITY-DESIGNATED` (line 752): `$BuildAuthorityRef` must be non-null, otherwise S04 stops in both modes. The S04 comment now cites act section 2 (previously "section 3 table line 63"). | Material and unresolved. See F4. |
| **R5-08** V-A2-8 boundary | **DOCUMENTED** (boundary). Q-V8 open. | Summary fields `v2A8ProxyPass` (line 523 onward; validator row-state result), `v2A8LiteralTest = 'NOT_PERFORMED'`, `v2A8Acceptance = 'PA_DECISION_REQUIRED (Q-V8)'`, and a `notPerformedByScript` entry. See F5. | PA decision Q-V8 (F10). |
| **R5-09** Explicit gates | **RETAINED.** None closed. | Gates and their enforcement are listed in F6. | All open. |
| **R5-10** DISP-03 correction | **DRAFTED, NOT APPLIED.** Separate and narrow. Not gate evidence. | See F7. | Separate IRR tracker change; not in this PR. |

### F2. The four distinctions (R5-01)

| Category | Revision-5 answer | Evidence or limit |
|---|---|---|
| 1. Provisioning or durable-store mutation | **None in Preflight.** Preflight creates no store, no binding, no membership, no audit row, no receipt, no execute marker and no execute claim. | Store absence (S03 and the recheck), the S05 refusal expectation (source-derived), and no execute path in Preflight. Not run on a host. |
| 2. Preflight filesystem mutations | Run directory and raw evidence under the evidence root. `npm ci` and `npm run build` write `node_modules`, `dist` and `dist-frontend` inside the IPD checkout. One probe file is created and removed in the store parent, only when `PARENT_PROBE` is designated. | Each is declared in `declaredEffects`. A probe cleanup failure is a stop. The script does not reverse build writes; ignored entries are checked after the build. |
| 3. Validation-mode invocation | `node <entry> --mode=validate`: S05 (pre-state, store absent, expected to refuse without creating the store) and S08 (post-state, read-only). | The validator does not create the store. The execute path (`openDatabase`) is the only path that creates parent directories and the store file (source facts, record A2). |
| 4. Execute-mode invocation | ONE `node <entry> --mode=execute` (S07), after the claim, the marker and the recheck. Never in Preflight. | Single call site; `ExecuteCalls` guard (`SECOND_INVOCATION_REFUSED`); no retry; marker written before process start. |

### F3. Writability method (R5-06): what each method proves and does not prove

| Method | Procedure | Proves | Does not prove |
|---|---|---|---|
| `ACL_EVALUATION` | Reads the DACL of the nearest existing ancestor of the store directory (`Get-WriteAclEvaluation`, line 423) and writes the ACL listing to `acl-<n>-nearest-ancestor.txt`. Requires allow bits for CreateFiles and CreateDirectories for the current user and group SIDs and no matching deny ACE. | The ACL as listed grants the required rights to the current identity SIDs, and no matching deny ACE exists on that ancestor. | Effective access. Not proved: group membership beyond the SIDs read, rights inherited from ancestors not on the evaluated entry, privileges (for example backup or restore rights), deny interactions across the chain, mandatory integrity labels, antivirus or sync-provider locks. Labelled "evaluation only" in the check detail. |
| `PARENT_PROBE` | Creates one uniquely named file `.p1-writeprobe-<guid>.tmp` in the store parent directory and removes it (`Get-ProbeWritable`, line 453). Creation and cleanup are separate checks (`S03-WRITE-PARENT-PROBE`, `S03-WRITE-PARENT-PROBE-CLEANUP`). | That the current process could create and remove one file in the store parent at that moment. | Writability of the store path itself (the store file is not created). Later access changes. SQLite journal and WAL sidecars, which are created in the same directory, are not created by the probe. A cleanup failure leaves the probe file in place, stops the run, and records its path. |

Q-WRITE: the PA must designate one method, or both, and accept the limits above. The script requires a designation and does not choose.

### F4. Build discrepancy (R5-07), reported exactly

| Source | Build and test sequence | Count or assertion |
|---|---|---|
| Base act §2 "Local validation at the selected basis" (IPD blob `528de6ae`; text at `/tmp/w/base_act.md` lines 56–66; table line 63) | `npm ci`; `npx tsc --noEmit`; `npm run build`; `npm test` | Recorded in the act as `875/874/0/1` |
| QE matrix, `origin/main` lines 90–94 | `npm ci --no-audit --no-fund`; `npx tsc --noEmit`; `npm run build`; guarded `npm test`; `npm run test:package-consumer` | Exactly 1,140 `dist/**` files |
| Script S04 (revision 5) | `npm ci` (no flags); `npm run build`. No tsc, no tests, no count. | Closure presence and emission; emitted migration identity; clean after build; ignored entries limited to `node_modules/`, `dist/`, `dist-frontend/` |
| Act §8 steps 0–6 | No build step | — |

Differences, all unresolved:

1. The script omits `npx tsc --noEmit` and `npm test` from act §2.
2. The script omits `--no-audit --no-fund` from the QE matrix `npm ci`.
3. The QE matrix 1,140-file count is not checked.
4. `npm ci` is not build-free: the `prepare` script runs the package builds (record F18). The script's `npm ci` therefore already performs package builds, and the act's build-step absence (F19) is not an absence of build activity.

Consequence: Execute is blocked (S04-BUILD-AUTHORITY-DESIGNATED; D-9; Q-BUILD). No test sequence has been run on any host.

### F5. V-A2-8 boundary (R5-08)

- **What the script records.** `v2A8ProxyPass` is whether the validator's report lists `V-A2-8` as ok. The validator's V-A2-8 (validator source; check ID 334; expression at lines 331–336 of the pinned validator) tests row state only: at least one row exists and each table has at most one row. It runs in validate mode and does not observe a second invocation.
- **Literal test: NOT PERFORMED.** A second `--mode=execute` on the populated store, expecting refusal with no change, has not been run. P1-F condition 2 forbids a second invocation, and the script has no second invocation (`SECOND_INVOCATION_REFUSED` guard).
- **Source-verified refusal (not run).** The store-exists refusal (`STORE_ALREADY_EXISTS`, `gateAPrimeProvisioning.ts` 413 and 434; record B4 item 4) is source evidence about the code. It is not a run.
- **Limit.** The row-state result cannot distinguish "a second invocation was refused" from "no second invocation was made". A result of 1/1/1 is consistent with both. The script never presents the proxy as the literal test.
- **Decision needed:** Q-V8 (F10).

### F6. Explicit gates (R5-09): all retained

| Gate | State | Enforcement in revision 5 | Evidence needed |
|---|---|---|---|
| Q-CONS | OPEN | Claim mechanism (R5-03); marker semantics unchanged; summary `p1fConsumption` | PA ruling (F10) |
| Q-STORE | OPEN | `S00-STORE-DESIGNATED`: `StorePath` must equal the F4 string. Binding to `--store` is not designated. | PA ruling |
| Q-EV | OPEN | `S00-EVIDENCE-DESIGNATED` and `S00-EVIDENCE-DESIGNATED-EQUALS`; containment checks | Designation of the canonical path |
| Q-ACTOR | OPEN | `S00-ACTOR-DESIGNATED`, `S00-ACTOR-EQUALS` | Designation |
| Q-WRITE | OPEN | `S00-WRITABILITY-DESIGNATED` | PA ruling |
| Q-MIG | OPEN | V-A2-1 and emitted identity checks | PA ruling |
| Q-TX | OPEN | None in the script. The per-migration transaction behaviour is a source fact recorded in record A2 (`ensureMigrations` runs before the `BEGIN IMMEDIATE` write transaction; migrations commit individually). | PA ruling |
| Q-V8 | OPEN | Proxy recorded as proxy (F5) | PA ruling |
| Q-BUILD | OPEN | `S04-BUILD-AUTHORITY-DESIGNATED` (F4) | PA ruling and designated sequence |
| `AuthorityRulingRef` | NULL | `S00-RULING` refuses | A ruling reference citing F10 |
| Freshness and revocation | NOT ESTABLISHED for execution | S06 and the recheck read repository and GitHub state only. They cannot prove out-of-band revocation or attempts. | Operator and PA statement on the day of any run (D-12) |
| Host facts (U-2 to U-5, U-10) | NOT VERIFIED | S01 and S02 run only on the host | Host preflight evidence (D-13) |
| PowerShell 5.1 parse and runtime | NOT PERFORMED | None in this environment | Windows validation (F9; D-14) |
| Independently reviewed Preflight acceptance | DOES NOT EXIST | `S00-ACCEPTANCE-*` and `S00-PREFLIGHT-*` checks | A sealed, passing preflight run and a reviewed acceptance (D-11) |

### F7. DISP-03 tracker correction (R5-10): separate, narrow, drafted, NOT applied

**Facts.**

- Tracker `DISP-03` (IRR tracker line 12741 at `aa013db`) reads: "On a correctly absent store, `--mode=validate` at step 2 refuses `STORE_NOT_FOUND` (`gateAPrimeValidation.ts` lines 371–372)."
- Validator source at the pin (read this pass from `/tmp/w/src_src_persistence_gateAPrimeValidation.ts`): line 372 throws `GateAPrimeStoreError('STORE_NOT_FOUND', 'the validation store file does not exist')`.
- Entrypoint mapping: the record's F9 (rev4 §A2) states that the entrypoint maps throws outside its `executeProvisioning` try to `UNEXPECTED_FAILURE` (entrypoint lines 634–645). **This is a source-derived mapping. No run of the entrypoint has occurred in any revision.** The tracker's "observed" wording is therefore not supported by a run; neither the refusal code nor `UNEXPECTED_FAILURE` has been observed.
- IPD commit `e08d013` changed the store-missing wording, 9 commits after the pin. It is not part of the basis (rev4 F26).

**Proposed narrow wording (NOT applied; separate IRR tracker change; not gate, acceptance, or authorization evidence):**

> DISP-03 note: at the pin `a891802e`, the validator source throws `STORE_NOT_FOUND` for an absent store (`gateAPrimeValidation.ts` line 372). The entrypoint mapping of that throw to `UNEXPECTED_FAILURE` with the message `the validation store file does not exist` is source-derived (entrypoint lines 634–645). Neither outcome has been observed by a run. This note changes no gate, acceptance, qualification, admission, or authorization status.

### F8. Tests: run, designed, and not run

**Run in this pass** (Linux sandbox; Node v22.22.3; Python 3; no PowerShell or Windows host):

| Test | Scope | Result |
|---|---|---|
| `/tmp/w/static_check.py` (re-implemented; B5) on the final script (SHA-256 `7aa52aa4…e916`) | Text checks (B5) | 15 PASS; FAILS: 0. Text checks only; not a parse. |
| `node --check` on the dump JavaScript, extracted from the final script (15 lines) | JavaScript syntax | PASS |
| `node --check` on the emitted-migration probe, extracted from the final script | JavaScript syntax | PASS |
| `node --check` on the S01 sqlite probe, extracted from the final script | JavaScript syntax | PASS |
| S01 sqlite probe run on Linux (no database opened) | Linux only; not the host S01 | Prints `SQLITE_FLAG_FREE_OK`; exit 0 |
| Dump on a nonexistent path (`/tmp/w/js/nonexistent/none.sqlite`, final pass) | Read-only open refusal | JSON `ok:false`, error `open: unable to open database file`; exit 0 (the script decides by `ok`); no directory created |
| Byte comparison of the migration probe line and the S01 probe line with revision 4 | Unchanged probe text | Identical (the revision-5 presence check is inserted above the probe, not inside it) |

**Designed, NOT run** (for the operator's Windows validation, F9):

- PowerShell 5.1 parse (`[System.Management.Automation.Language.Parser]::ParseFile`). No `pwsh` is available here.
- StrictMode runtime exercise of S00 on fixtures.
- `GIT_*` refusal (F13): a fixture run with `GIT_DIR` set must stop at `S01-ENV-GIT`, after the claim and before the marker, and must write no marker.
- The canonicalization refusal matrix (F1, R5-02) on fixture paths.
- Probe object tests: creation failure; cleanup failure (locked file).
- Claim exclusion: two concurrent Execute runs against one fixture evidence root produce one `CreateNew` winner and one refusal.
- Acceptance-directory fixtures: extra subdirectory; reparse entry; duplicate line; missing file; unexpected file; self-listing; malformed hash line.
- Forensic isolation: each post-invocation operation forced to throw; the rest must still run and be recorded.
- The marker-on-disk catch path (write throws after file creation).
- Preflight on a fixture store path and fixture evidence root (a copy of the script with fixture designations, never the P-1 store or evidence root).
- Host preflight on `DESKTOP-NO0NHTP`: **not authorized** (designations null; no `AuthorityRulingRef`; Q-* open) and **not performed**.
- Any build on a host; `npm test`; `npm run test:package-consumer`; the QE 1,140-file count.

### F9. Outstanding Windows validation (operator; not performed)

1. PowerShell 5.1 parse of the final script: zero errors.
2. StrictMode runtime exercise of S00 with fixtures (no P-1 store, no P-1 evidence root).
3. Canonicalization refusal matrix (R5-02).
4. Probe object tests: creation failure and cleanup failure, with the stop and the recorded path.
5. Claim exclusion on a fixture evidence root.
6. Acceptance-directory fixtures (R5-04).
7. Forensic isolation with each post-invocation operation forced to fail (R5-05).
8. `GIT_*` refusal (F13) on a fixture, and the `S01-ENV-GIT` result on the host.
9. Host facts U-2 to U-5 and U-10, and host preflight (D-13); PowerShell runtime (D-14).

None of these has been performed.

### F10. Unresolved PA rulings: exact decisions required

| ID | Exact decision required | Blocks |
|---|---|---|
| Q-CONS-1 | Confirm that a Preflight run is not an attempt (yes or no). | Preflight |
| Q-CONS-2 | Confirm that an Execute stop before the marker, including a stop after claim acquisition, does not consume P-1 (yes or no). Set the release rule for `execute-claim.json`: who may release it and on what written ruling. | Execute |
| Q-CONS-3 | Confirm that a marker followed by a process-start or raw-capture failure consumes P-1. The script treats it as spent. | Record only |
| Q-STORE | Confirm that `C:\iips-data\iips\user-portfolio.sqlite` (PF-15 F4) is the `--store` for P-1 (yes or no), or name another path. | Execute |
| Q-EV | Designate the exact canonical evidence-root path on the operator host (absolute, pre-existing, fixed NTFS, outside every Git working tree and the store chain). State whether sync-state beyond environment roots must be verified, and how. | Preflight |
| Q-ACTOR | Designate the actor label for `--actor`, and confirm it is non-authoritative (the parser does not record it; D-6). | Preflight |
| Q-WRITE | Choose `ACL_EVALUATION`, `PARENT_PROBE`, or both, and accept the limits in F3. | Preflight |
| Q-MIG | Confirm that migrations 001–004 are expected on the fresh store (V-A2-1 expected state). | Execute |
| Q-TX | Confirm that per-migration commits (`ensureMigrations` before `BEGIN IMMEDIATE`) sit outside act §7 item 2 ("one `BEGIN IMMEDIATE`"). | Execute |
| Q-V8 | Decide whether the row-state proxy plus source refusal evidence satisfies act §6 V-A2-8, or whether a literal test is required (which P1-F condition 2 forbids). This is a reserved PA decision. | Record and post-run |
| Q-BUILD | Choose the build sequence: (a) the act §2 set; (b) the QE matrix set including the 1,140-file count; or (c) an operator-produced `dist/` with recorded evidence. Then designate `$BuildAuthorityRef`. | Preflight |
| `AuthorityRulingRef` | Issue one ruling reference that cites the decisions above. | Preflight and Execute |
| Acceptance reviewer | After a sealed, passing preflight run: name the reviewer and accept the preflight directory and summary hash. | Execute |

PA-19 (H-1 to H-9 PA-WAIVED) does not cover these items. They are reserved decisions and are recorded as exact unresolved items. The PA-19 directive still applies to governance blockers.

### F11. Required statuses (as of this revision)

| Status | Value | Evidence |
|---|---|---|
| P-1 consumed | **NO** | No marker, no invocation, no store, binding, membership, audit row or receipt in the repository. Not verified on the host. Out-of-band attempts cannot be excluded from repository state (D-12). |
| Execute invocation performed | **NO** | No run of any kind; no entrypoint invocation. |
| Host Preflight authorized | **NO** | Designations are null; no `AuthorityRulingRef`; Q-* items open (F10). |
| Host Preflight performed | **NO** | Stated separately from authorization. |
| Store or provisioning state touched | **NO** | No run, no provisioning, no store or binding creation, no IPD write. |
| PR merged | **NO** | PR #382 is not merged; no merge authorized. |
| Execution readiness | **NO-GO** | F10 unresolved; host facts unverified; PowerShell 5.1 parse and runtime not performed; build discrepancy unresolved (F4); no reviewed Preflight acceptance exists. |

### F12. Revision-4 defects: status in revision 5

| Defect (from the rev4 review) | Status |
|---|---|
| Token sweep: `S00-NO-PRIOR-EXECUTE-MARKER`, `$allVA2`, `BASIS_COMMIT`, the `$env:ComSpec /d /c npm` prose | Tokens absent from the revision-5 script (0 hits each). The `npm` launch is documented in B5 as separate arguments through `$env:ComSpec`. |
| Stray `)` in the header run-directory line | Header rewritten in revision 5 (lines 1–41). |
| Keyword scan of comments | The code keyword scan passes (0 hits). The scanner excludes comments, so comment text is not machine-checked. |
| S04 citation "section 3 table line 63" | Corrected to act section 2. |
| Emitted path `dist/src/persistence/migration_ledger.js` inferred from source | Explicit presence check `S04-EMITTED-LEDGER-MODULE` before the probe (this pass). The path is still inferred. Emission by the pinned tsconfig is not verified without a build. |
| Seal in the catch path (defect 4) | `$script:Sealed` guard in the outer catch (line 1557), verified here. |
| Prefix-based evidence containment | Replaced by canonical checks (R5-02). |
| `[bool]$probeOk` | Replaced by the probe object (R5-02). |
| Pre-invocation recheck without containment | Recheck repeats containment (R5-02). |
| Non-atomic count check as the only gate | Claim added; count retained (R5-03). |
| Marker file on disk but in-memory flag unset after a write exception | Corrected in the outer catch (this pass). |

### F13. Final execution-critical pass (revision 5, after `9b96b4f`)

**Scope.** The critical path only: acceptance binding, pre-invocation recheck, claim and marker ordering, the single invocation, and forensics. One defect class (inherited environment) was examined in full. The investigation was not repeated. The only change to the script is the one below.

**Defect corrected: `S01-ENV-GIT`.**

- The entrypoint strips every `GIT_*` variable before it measures HEAD and tree (`sanitizedGitEnvironment` and `readExecutionHead`, `ep.ts` ~158–220 at `a891802e`, blob `5f49936b`). Its `EXECUTION_PIN_MISMATCH` refusal is raised after the marker has been written.
- The script's git calls (`Invoke-Git`, line 286) inherit the operator environment. Before this pass S01 checked `GATE_A_PRIME_*` and `NODE_OPTIONS` only. An inherited `GIT_DIR`, `GIT_WORK_TREE` or `GIT_INDEX_FILE` could make the script's S02 pin check measure a different repository from the one the entrypoint measures. The mismatch would surface only after the marker, so one attempt would be spent on a repository the script had not pinned.
- Fix (script, S01 in `Invoke-HostAndRuntime`): `S01-ENV-GIT` is fail-closed. Any environment variable whose name begins with `GIT_` (case-insensitive) stops the run. The detail records a count only, never values. The check runs at S01 and again in the S07 recheck, so it is repeated immediately before the marker.
- Order, stated exactly: in Execute mode S01 runs after the claim is acquired (line 1425 before line 1436). A stop at S01 or at the recheck writes no marker and does not consume P-1. It does leave `execute-claim.json` in the evidence root, which is retained on every outcome (Q-CONS-2). This record does not claim that the check stops before the claim.
- Not run. The check has not been executed on Windows (F9, item 8).

**Critical-path review (static, read-only). No further defect found.**

- *Acceptance binding* (`Test-AcceptanceAndPreflight`, ~945–1017). Binds the script SHA-256; the acceptance-named preflight run directory (direct child of the canonical evidence root, not a reparse point, flat); a well-formed seal with no self-listing and no duplicates; set equality between the seal and the directory; every sealed hash, compared exactly; the preflight summary hash; mode `Preflight`; outcome `PREFLIGHT_PASSED_NOT_EXECUTED`; zero execute calls and no marker; the same script, store path and evidence root; every preflight check passed. The acceptance file is hashed at S00 and again in the recheck.
- *Recheck* (`Invoke-PreInvocationRecheck`, ~1019–1036). Repeats the script and acceptance hashes, S01 (including `S01-ENV-GIT`), S02 (pin and cleanliness), evidence-root containment, store absence (with no probe), entry closure hashes, exclusivity of the execute run directory, claim presence, and freshness. It runs before the marker.
- *Claim and marker ordering* (`Invoke-ExecuteClaim`, ~1038–1070; main ~1425–1505). Claim (`CreateNew`, read back) → run directory → S01–S06 → recheck → marker (`WRITTEN_BEFORE_PROCESS_START`) → `ExecuteCalls` incremented after the marker write → the second-invocation guard → one `Invoke-Capture`. A failed marker write leaves `ExecuteCalls` at 0. A marker found on disk is treated as written (outer catch).
- *Single invocation.* The only `--mode=execute` argument is at line 1473; the only call that starts it is `Invoke-Capture` at line 1502, inside its own try block. The `--mode=validate` calls (lines 853, 1200) are read-only and run at S05 and after the attempt. None of them replaces the execute call.
- *Forensics* (`Invoke-PostInvocationForensics`, ~1092–1210). Each operation records its own status: `OK`, `FAILED`, or `NOT_APPLICABLE` with a reason. A receipt parse failure is isolated (`S07-RECEIPT-PARSE`). Store hash, post-validate and manifest steps run after an earlier failure. `NOT_APPLICABLE` is a fourth status beyond the three that R5-05 names. It is used only where an operation does not apply, always with a reason. It is disclosed here and not presented as `SKIPPED`. `evidenceComplete` is false when any operation failed or was skipped.

**Parse attempts (this pass).** No PowerShell is available in the sandbox.

- The official PowerShell release host is unreachable (`objects.githubusercontent.com` SSL failure, as tested in this pass).
- The npm `pwsh` package is an installer, which needs the same host.
- The `tree-sitter-powershell` 0.26.6 grammar (npm) could not be loaded. It requires tree-sitter 0.25, whose native build fails in this sandbox; the 0.21 core loaded the grammar's language object but rejected it.

No parse of any kind was obtained. **PowerShell 5.1 parse: NOT PERFORMED.**

**Embedded JavaScript (re-verified this pass).** The first extraction in this pass wrote an empty file for one block, and that result was discarded. All three blocks were re-extracted from the final script and checked again:

- `node --check` PASS for the sqlite probe, the emitted-migration probe, and the read-only dump.
- The sqlite probe prints `SQLITE_FLAG_FREE_OK` (exit 0).
- The dump on a nonexistent path returns `ok:false` with `open: unable to open database file` (exit 0). No directory is created.
- The emitted-migration probe needs the pinned IPD checkout and was not run.

**Host prerequisites (operator; the script checks the ones marked).**

- Windows PowerShell 5.1, non-elevated, on `DESKTOP-NO0NHTP` (S01-HOST, S01-NONELEVATED, S01-PRODUCT).
- `node` 22 with minor version 13 or later on PATH (S01-NODE); `git` on PATH (S02); `npm` reachable through `ComSpec` (S04).
- `gh` on PATH and authenticated for `gh api` (S06 freshness and the recheck). A missing `gh` stops the run. In Execute mode that stop follows claim acquisition, so the claim is retained (Q-CONS-2).
- If the designated writability method is `PARENT_PROBE`, the store parent directory must already exist, because S03 creates and removes its probe there. The entrypoint creates parent directories only during execute (`openDatabase`). A missing parent stops the run at S03. Preflight is expected to catch this earlier.
- An execution policy that permits this file. This is not a property of the script.

**Statuses (unchanged by this pass).** P-1 consumed: NO. Execute invocation performed: NO. Host Preflight authorized: NO. Host Preflight performed: NO. Store or provisioning state touched: NO. PR merged: NO. Execution readiness: NO-GO (F11).

---

## D. Revision 6 — PA-scoped Windows 10 personal host profile (2026-10-30)

This dated implementation addendum supersedes only the Revision 5 `S01-PRODUCT` target for the PA's expressly authorized personal environment. Revision 5 findings above remain historical and unchanged. The base Act Section 8 lives in IPD and is not modified here; its external text still specifies Windows 11 Home Single Language. The PA's 2026-10-30 direction authorizes the existing IRR execution script's exact personal target to be Windows 10 Home Single Language on `DESKTOP-NO0NHTP`, without adding a separate application architecture.

| Item | Revision 5 baseline | Revision 6 implementation |
|---|---|---|
| Hostname (`S01-HOST`) | `DESKTOP-NO0NHTP` exact case-insensitive match | **Unchanged** |
| Elevation (`S01-NONELEVATED`) | Administrator role must be false | **Unchanged** |
| Product (`S01-PRODUCT`) | Exact case-sensitive `ProductName = Windows 11 Home Single Language`, copied from base Act §8 | Exact case-sensitive `ProductName = Windows 10 Home Single Language`, profile `IIPS-V3-CAP03-P1-WINDOWS10-PERSONAL-HOST-PROFILE-PA-2026-10-30-01`, PA-authorized for this personal local scope |
| Evidence facts | Product and EditionID recorded | Adds profile reference, target product and scope to the facts; records actual `ProductName` and `EditionID` as before |
| Other runtime controls | S01 environment/runtime checks | **Unchanged:** gate/Git/Node environment checks; Node `>=22.13.0 <23`; flag-free `node:sqlite` |
| Filesystem/authority controls | S00/S02/S03/S04 and single-attempt execution logic | **Unchanged.** Designation and build-authority values remain null; script still refuses at S00/S04. |

### D.1 Runtime/filesystem review

No Windows 11 OS-version condition was found in IRR `frontend` or `iips-platform` source. The existing frontend `ipcClient.ts` selects `node:path.win32` and Windows named-pipe endpoints when `process.platform === 'win32'`; the existing test file has explicit `win32` cases. No source change to that IPC architecture was needed. The P-1 script's product-name check was the only Windows 11-specific gate in the reviewed execution instrument.

The other declared assumptions are retained rather than weakened: Windows PowerShell 5.1; Node 22.13+ and <23; flag-free `node:sqlite`; non-elevation; exact host name; no `GATE_A_PRIME_*`, `GIT_*`, or `NODE_OPTIONS`; clean exact pin; local fixed NTFS; store absence; evidence/store separation; no reparse points or Git worktree in relevant path chains; no sync root; sealed evidence; and single-use claim/marker. These gates were not host-tested against Revision 6. The prior Windows 10 F9 observation is evidence of the OS product only under Revision 5; it is not a Revision 6 S01 result.

### D.2 Implementation and validation state

- Existing execution script edited in place, not copied: exact product target and S01 diagnostic changed; profile/target/scope facts recorded. No other check or execution sequence was changed.
- New validator: `docs/integration/cap03-p1-f9/validate_windows10_host_profile.py` (Python standard library only). It checks the profile, preserved controls, old R5 F9 pin and unchanged null S00/S04 authority fields. Arena run: **PASS**. It does not parse PowerShell or execute the app.
- Revision 6 script SHA-256: `9396c7cc9e770a09a248dbd4624a96a6a2c4702f3e0c7a12d3bc0e51fb5f7d4b`; 1575 lines; 112,549 bytes. This exact digest is also emitted by the static validator.
- PowerShell 5.1 parser and actual Windows runtime validation of Revision 6: **NOT RUN** (no PowerShell/Windows host in Arena). Operator's exact parse-only command is recorded in `docs/integration/cap03-p1-f9/README.md`; no `-Mode Preflight`, `-Mode Execute`, entrypoint, store, build or provisioning command was run.
- F9-6 remains PARTIAL/NOT TESTED; F9-8 R5 observation remains BLOCKED and WV-02 WAIVED; U-4/U-5/U-10 remain NOT RUN and waived. No completed Windows tests were repeated.
- Existing Rev5 acceptance/preflight outputs are bound to the old script hash and cannot bind Revision 6. Any future P-1 route would still require its original authorities, current source/hash-bound evidence and build decision.

P-1 remains **AUTHORIZED — NOT EXECUTED — UNSPENT**. This host-profile implementation changes no authorization state and does not establish execution readiness.


---

## G. Revision 7 — PA-06 admitted S2 evidence reuse; no IPD build (`2026-10-30`)

### G1. Status and authority basis

Revision 7 is the current source snapshot; the previous sections remain historical evidence. The applicable effective decisions were read in the IRR record: `PA-19` (§16.202) waives H-1–H-9 as blockers; `PA-20` (§16.205) waives Windows-host, PowerShell, operator-presence and Windows/operator-generated-evidence blockers; `PA-1` (§16.206) keeps H-12/L2c/S2a outside P-1 prerequisites; `PA-06` (§16.206) admits `s2-a891802e-20261028T192516Z` as **L2a for the P-1 chain only**; `P1-F` (§16.206 / authorization act §6) authorizes one unspent Execute attempt; and corrected PF-15 F4 designates the P-1 store path. These are existing decisions, not new authority rendered by this source reconciliation. No waiver or NOT RUN result is treated as PASS.

S2 identity was checked only from IRR-held records: run `s2-a891802e-20261028T192516Z`; commit `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`; tree `76f083d7058e170d8212455c03bad1033136ee68`; seal SHA-256 `9D3C09DBDB691C2527A45605DEA20826B4EC2BA2F110985EE3F1033783B5225E`; host-deposit hash-record SHA-256 `FFD0956482427ACB404543E36DAC2705D802B04828E380290232C06129F3AFAD`; seal-recheck transcript SHA-256 `D4C5D9431115BF57D824DF465E3D99B11C619BC6D59A3F0974036F3BFCC2F7CA`. The admitted record reports the run status PASS, Node `v22.16.0`, npm `10.9.2`, typecheck/build return code 0, test summary 930 executed / 926 passed / 0 failed / 4 expected skips, package-consumer PASS, and identical before/after 1,140-line distribution inventories. This is PA-06-admitted historical evidence, not a repeated run and not Gate 4 S2 acceptance.

The retained inventory contains path/hash records, not the 1,140 emitted file bytes. It identifies the emitted provisioning entry, validator and migration-ledger modules, but it does **not** prove exact entry-import closure or an emitted-migration probe. `U-5` therefore remains **NOT RUN**. `WV-04` waives the blocker only for the specified personal non-production scope; it neither grants IPD build/write authority nor converts U-5 to PASS.

### G2. Requirement-by-requirement S02 / S00 / S03 reconciliation

| Stage / requirement | Current Revision 7 treatment | Authority / result boundary |
|---|---|---|
| **S02 — pin** | Retains exact commit/tree and all 15 designated blob checks from `PD-1`; no H-12/L2c/S2a dependency is added. | `PA-1`, `PD-1`, `PA-06`; source contract only. No IPD checkout was read in this pass. |
| **S02 — local checkout identity / clean state** | Existing local `HEAD`, tree, clean-tree and worktree guards remain; no local IPD checkout is inspected now. | `U-4` remains NOT RUN, with its blocker waived under `PA-20`; remote/admitted evidence is not represented as local checkout evidence. |
| **S00 — authorization reference** | `$AuthorityRulingRef` is `IIPS-V3-CAP03-P1-AUTHORIZATION-ACT-2026-10-29-01` (`P1-F`); S00 requires that exact act identifier. | Effective `P1-F`; one Execute attempt, not yet made. |
| **S00 — actor** | `$DesignatedActorLabel` is `Ramki`, the PA/operator named in P1-F. It is passed as metadata only; the pinned parser does not make it an authorization identity. No other label is invented. | P1-F names the PA/operator; base Act parser behavior is documented in earlier sections. |
| **S00 — store** | `$DesignatedStorePath` is exactly `C:\iips-data\iips\user-portfolio.sqlite`; supplied `-StorePath` must exactly equal it. | Corrected PF-15 F4; no host property or absence is claimed here. |
| **S00 — evidence root** | There is no PA-designated P-1 evidence-root literal. The mandatory `-EvidenceRoot` is an already-existing run-record destination, not a designation; S00 validates it and never creates it. PF-15 F5 is the Gate 4 root; PA-13 E10's `D:\cap03-p1-capture-20261028-01` is a capture-session root. Neither is reused as the P-1 run root. | No root is invented or represented as approved. The exact host path and its existence remain unobserved; fixed-NTFS, path separation, worktree, `.git`, reparse and sync-environment checks remain in code. |
| **S00 — writable method** | No ACL method or parent write probe is designated or run. The script reports store writability **NOT PROBED** and preserves the entrypoint's actual operation behavior. | `PA-20` waives operator-generated evidence as a blocker; this is not a writability PASS or a separate probe authorization. |
| **S00 — prior run / one attempt** | Execute claim, marker-before-process, one invocation, no retry and prior execute-directory refusal remain fail-closed. A no-marker Execute stop is reported **UNDETERMINED**; the retained claim/run blocks reuse pending PA disposition. | P1-F authorizes one attempt. No attempt was made. The claim/marker do not establish an out-of-band attempt. |
| **S03 — store and paths** | Exact F4 store equality; absent DB and `-journal`/`-wal`/`-shm`; outside checkout and all listed worktrees; `.git`/reparse ancestry; local fixed NTFS; SUBST and OneDrive-environment checks remain. No ACL inference or write probe occurs. | These are future runtime checks, not facts established in this IRR-only pass. |
| **S03 — writability** | Reported as NOT PROBED; no temporary file is created. | No `ACL_EVALUATION` or `PARENT_PROBE` designation is claimed. A failure of the authorized provisioning operation remains a failure of the one attempt, not an invitation to retry. |

### G3. S04 evidence consumption and distribution comparison

S04 now reads the existing admitted evidence in IRR at `evidence/cap03-s2/s2-a891802e-20261028T192516Z/` and its two publication companions. It verifies: (1) the effective P1-F record's PA-06/L2a admission reference; (2) the expected direct-file inventory and absence of subdirectories/reparse points in the evidence chain; (3) seal identity and every sealed content digest, allowing only the documented exact/LF/CRLF representation variants; (4) manifest run, status, host/runtime, commit/tree and artifact-to-seal identity; (5) result/run/pin/1,140-count/guard/package identities; (6) recorded install, typecheck, build, test and package-consumer result summaries; (7) equality and count of the admitted before/after 1,140-line inventories, including the named emitted entry/validator/ledger paths; and (8) host-deposit hash and two-pass publication transcript identities. This is a static verification of admitted IRR records, not a rerun of S2 or its host tests.

At a later authorized invocation, S04 reads any already-existing `dist` in the designated pinned checkout and compares the complete file set and SHA-256 values to the admitted 1,140-entry inventory; reparse points or any missing, extra or changed file fail closed. The pre-invocation recheck repeats a fingerprint of the same distribution and refuses if it changed after S04. Neither check installs dependencies, builds, repairs `dist`, creates a probe, or writes IPD. No current `dist` was accessed or compared in this IRR review, so no match is claimed. A missing/currently different distribution is not silently accepted; the script's existing S05/entrypoint requirements remain distinct from U-5's unrun build/emitted probes.

S04 explicitly records `U-5 = NOT RUN`, exact emitted-entry closure = NOT RUN, and emitted-migration probe = NOT RUN. Admitted S2 build/test records stay historical L2a evidence only. No emitted distribution bytes are copied into IRR.

### G4. Authority questions: resolved scope and genuine residuals

| Question | Current reconciliation | Status |
|---|---|---|
| `Q-STORE` | PF-15 corrected F4 is the exact P-1 `--store` literal. The script binds the argument to it; no substitution. | **RESOLVED for the path binding**; host existence/sidecars remain unobserved. |
| `Q-ACTOR` | P1-F names Ramki as PA/operator; `--actor Ramki` is display metadata only. | **RESOLVED for this non-authoritative label**; no identity claim is made from parser metadata. |
| `Q-EV` | No fixed P-1 root is designated by P1-F, PA-13 E10 or PF-15 F5. A safe, pre-existing runtime output destination is required, but no path is invented. | **No PA path designation established.** This is not represented as resolved; exact runtime input and host checks are unobserved. |
| `Q-WRITE` | No method is selected; S03 no longer performs a probe or treats ACL interpretation as effective access. | **Method unresolved / not required by this procedure; no writability PASS.** PA-20's waiver removes an evidence blocker only in scope. |
| `Q-BUILD` | S04 no longer runs any build, so no build sequence or `$BuildAuthorityRef` is needed for this path. | **Unresolved for any future build/IPD write; not a current S04 action.** U-5 remains NOT RUN. |
| `Q-CONS-1` | P1-F authorizes one provisioning Execute operation; a `-Mode Preflight` does not issue the entrypoint's `--mode=execute` call and no operator acceptance file is a P1-F condition. | **No preflight-acceptance prerequisite.** No standalone Preflight authority is inferred or used here. |
| `Q-CONS-2` | P1-F does not state a release rule for a retained execute claim after a stop before the marker. Code retains the claim and blocks another Execute. | **UNRESOLVED PA disposition.** Never infer that an unmarked stop consumed or did not consume the act; no retry/release path is added. |
| `Q-CONS-3` | P1-F says the first attempt, successful or failed/partial, spends the act. The code writes the marker before the single process-start call and conservatively treats any marker as spent. | **No-retry safeguard preserved.** Whether a process-start exception before the entrypoint actually starts is itself an “attempt” is not separately stated; the implementation remains conservatively spent. |
| `Q-MIG` | PA-06 admits historical S2 evidence; it does not decide a future store's V-A2-1 expected migration state. | **UNRESOLVED PA interpretation;** no migration-state or emitted probe is claimed. |
| `Q-TX` | No effective record located that determines whether per-migration commits sit outside Act §7 item 2. | **UNRESOLVED PA interpretation;** no transaction conclusion is added. |
| `Q-V8` | P1-F's single-attempt rule prevents a literal second invocation test. The summary retains `NOT_PERFORMED`; a row-state/source proxy is not equated with it. | **UNRESOLVED acceptance interpretation;** no second invocation was attempted or authorized. |

`PA-19`, `PA-20`, and `PA-1` were not expanded beyond their written scope. The open items above are not turned into blockers merely by retaining their accurate status; conversely, a waiver, designation, or historical PASS is never promoted to a technical observation.

### G5. Validation and limits

The Revision 7 script is 1,572 LF lines / 111,642 bytes; SHA-256 `e70050d0f841498b5784e4566898a6586918cf7a77ef659eb5016aa26e8b64e3`. The standard-library validator `docs/integration/cap03-p1-f9/validate_windows10_host_profile.py` checks Revision 7 source policy, the exact authority/path literals, preserved safeguards, S04's admitted-evidence and current-dist checks, regex path semantics against the admitted single-separator inventory format, and the IRR-held S2 evidence identity/completeness/digests. `git diff --check` is also required. These are IRR-only static checks. No PowerShell parser is available here; **no PowerShell parse is claimed**.

No IPD access, clone, worktree, inspection, build, dependency installation, write, or host operation was performed. No S2/host test was repeated. No P-1 Preflight/Execute/entrypoint, store, evidence root, marker, claim, probe, dump, fixture or acceptance file was created. `P-1-C` remains NOT ESTABLISHED; `P-1-D` remains DESIGNATED / NOT VERIFIED FOR THE ATTEMPT; both are not blockers. A6 remains NOT RUN. P-1 remains **AUTHORIZED — NOT EXECUTED — UNSPENT**. No F9 result changed.


### H. Revision 7 one-pass outstanding-question dispositions (2026-10-30)

This addendum supersedes conflicting *current-status* statements in A–G; those sections remain historical snapshots. It does not change the external P1-F act or invent a PA ruling. The only indispensable PA decision still absent is the exact canonical P-1 evidence-root designation described below.

#### H1. Q-CONS-2/Q-CONS-3 — claim retention, consumption, and no retry

- **Pre-marker stop:** if neither the marker exists (on disk or in-memory) nor a process-start request has been made, P-1 is **NOT CONSUMED**. This includes a failure after claim acquisition but before marker creation.
- **Claim disposition:** `execute-claim.json` is never deleted by the script. It remains on the designated root after a pre-marker stop, including an indeterminate `CreateNew`/read-back outcome. A retained claim blocks any reuse of that root; there is no script-level release, cleanup, or retry path. Claim retention does not itself consume the P-1 authorization.
- **Commit point:** successful creation of `EXECUTE-MARKER.json` is the durable attempt commitment. A marker already on disk consumes the attempt even if the in-memory write status is uncertain. The single process-start request also counts as consumed; an operating-system process-start failure is not a basis to retry. The process-start counter and marker precede the single `Invoke-Capture` call; a second call is refused.
- **Future operation:** because the current act permits one attempt and no marker/run/claim is being created in this review, no consumption status is changed. This rule preserves `AUTHORIZED — NOT EXECUTED — UNSPENT` until the one authorized attempt reaches the marker/process-start boundary.

#### H2. Q-MIG/Q-TX — existing implementation and migration failure boundaries

The determination is based on the admitted IRR-held source-to-script review (section A2/F7, the expected migration/checksum table and transaction-order record), not a fresh IPD read or test:

1. A fresh database is expected to apply migrations `001_initial_schema`, `002_audit_event_sequence`, `003_local_principal_bindings`, and `004_portfolio_contribution_provenance`, in that order, and record their exact checksums in `_migration_ledger`. The pinned `GATE3_MIGRATIONS` list, the four migration SQL/checksum records, the read-only dump contract, and the S2-recorded build/inventory all agree on those four identities. This is the expected source contract, not a claim that a fresh store was created or observed.
2. `ensureMigrations(db, GATE3_MIGRATIONS)` runs before the provisioning `BEGIN IMMEDIATE`. The existing source record says each migration and its ledger row commit transactionally/individually. The subsequent single `BEGIN IMMEDIATE` is the provisioning write transaction, not a transaction that wraps the migration bootstrap.
3. Therefore a migration failure rolls back that migration's transaction, while any earlier individually committed migration/ledger pairs can remain in the fresh database. If migration bootstrap completes and a later provisioning write fails, the provisioning transaction rolls back its writes; the migration ledger/schema remains. `EXECUTION_FAILED_ROLLED_BACK` must not be read as proof that already committed migrations were rolled back.
4. The one-attempt marker is written before entrypoint process start. Any migration or provisioning failure after invocation is a consumed/failed attempt; no automatic repair or second invocation is permitted. The existing read-only post-run dump records resulting state if the authorized process returns far enough for that forensic step. No migration, transaction, store, rollback, or failure-path test was run in this task.

**Disposition:** Q-MIG is resolved **YES — all 001–004 are required on a fresh store**. Q-TX is resolved **YES — per-migration commits precede and sit outside the one provisioning `BEGIN IMMEDIATE` transaction**. This technical interpretation matches the recorded implementation and migration dependencies; it does not amend the Act's scope or authorize a second attempt.

#### H3. Q-V8 — non-consuming assurance without a second invocation

The admitted source-refusal record and the existing IRR script's static controls are accepted as the required **source-only non-repeatability assurance for this one-attempt procedure**: one Execute call site, a pre-run retained claim, marker-before-process-start ordering, a second-call guard, and refusal on pre-existing marker/execute-run state. The row-state proxy remains a proxy. No literal second invocation was performed or will be performed under P1-F condition 2. Accordingly `v2A8LiteralTest = NOT_PERFORMED`, and no V-A2-8 runtime PASS is asserted. This closes the interpretation question without converting absent runtime evidence into PASS.

#### H4. Q-WRITE — ACL_EVALUATION selected, with strict claim boundary

`ACL_EVALUATION` is selected over `PARENT_PROBE` because it is non-mutating. The revised script's S03 projection reads the DACL on the nearest existing store-parent ancestor for the current user and token groups and checks requested create-file/create-directory bits plus matching denies. This is only a DACL projection; it is **not** Windows `AccessCheck`, an effective-access calculation, or proof that a later create will succeed. A failed projection stops the procedure; a positive projection is reported only as `allowsByDaclProjection`, with `effectiveAccessVerified=false`. No ACL was read on a host in this review, no parent write probe exists, and no actual write capability is claimed.

#### H5. Q-EV — canonical root is not designated; exact missing PA act

Review of effective `P1-F` in `docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md` §6, PA-13/E10 in tracker §16.206, the pass-2 PA designation/rulings records, and corrected PF-15 F4/F5 finds no P-1 run-record-root designation. `P1-F` authorizes one attempt and identifies the PA/operator, but names no evidence-root path, directory owner/security principal, or P-1-specific root/namespace rule. PA-13/E10 names `D:\cap03-p1-capture-20261028-01` as a capture-session root, not P-1 execution evidence. PF-15 F5 names `C:\iips-evidence\cap03-gate4` for the separate Gate 4 raw evidence, not P-1. PF-15 F4 is the store file, not a root. These cannot be repurposed or treated as aliases; no host existence or owner check was made.

The irreducible missing authority fact is a PA act naming one exact absolute path and declaring (a) the designated operator/security owner, (b) its purpose as the canonical P-1 run-record/evidence root, (c) its role as the single-attempt claim/marker namespace and retention boundary, and (d) any path-equivalence rule. The act must preserve the script’s required properties: directory already exists before invocation; exact parameter-to-designation equality; local fixed NTFS; not a drive root, IPD/IRR or other Git worktree, cloud-synchronized location, SUBST alias or reparse chain; separate from the store and its ancestor/descendant chain; and no prior P-1 run/claim/marker state. A read-only DACL projection is not proof of owner identity or effective access. No existing authority or standing authorization supplies the missing path/owner tuple, so selecting a path here would fabricate a PA designation. No PA record is amended to pretend otherwise.

The script therefore keeps `PA_DESIGNATION_REQUIRED` / `NOT DESIGNATED` and stops at S00 before canonicalizing, reading, or writing caller input. Its later filesystem checks are verification of a future designated, already-existing directory; they neither choose nor create the root. `S00-TRACKER-POINTER-PUBLISHED` also requires the current Revision 7 pointer on authoritative IRR `main` before any root access or claim/run directory.

#### H6. Q-BUILD — S04 reuses admitted evidence, no future build step

For this Revision 7 S04 path, the admitted `s2-a891802e-20261028T192516Z` L2a evidence is the build/test/inventory record. The script validates those existing IRR-held hashes and, only during a later separately authorized procedure, compares an already-existing pinned-checkout `dist` read-only against the exact admitted 1,140-file inventory and its pre-invocation fingerprint. It does not run `npm ci`, `npm run build`, or an emitted-entry/migration probe, and does not create replacement evidence. **Q-BUILD is resolved for this S04 design: no future build authority or IPD write is part of the procedure.** U-5 remains **NOT RUN**; the historical S2 build result is not promoted to U-5 PASS, Gate 4 S2, or a new build result. No current `dist` was accessed.

#### H7. Merge reconciliation, validation and unchanged statuses

The PR #382 DIRTY report was not merely stale: `main` first advanced from the recorded PR base `72e56ba…` to `9b54dbd…`, and this branch was initially reconciled and published against that explicit snapshot. Before the work completed, main advanced again through PR #388 to `238dfa3185fcb77aac1a50e1d8dee60856c9739d`, recording the effective `C4-2` PA act and D-9 closure. That main section consumes §16.215 / `CV-CORR-195` / `CHG-2026-10-30-10` / `V1639`–`V1648`, which collides with the first Revision 7 allocation. To preserve current main without identifier reuse, Revision 7 is now §16.216 / `CV-CORR-196` / `CHG-2026-10-30-11`; its technical record `V1593`–`V1612` remains unchanged and its reconciliation verification range moves to `V1649`–`V1661`. Main §§16.211/213/214/215, the D-9 decision-request history and effective act/addenda are preserved; branch §§16.208–210 and the §16.212 reservation are preserved. The script freshness baseline is exact current main `238dfa…`, and its pointer guard requires §16.216.

The current reconciled Revision 7 script is 1,650 LF lines / 119,683 bytes; SHA-256 `42253eab76161ecb2452b6b1fca8e629b010131b8bd88dbb5357dc929e084f90` (exact identity recorded at §16.216 / `V1654`). Verification is IRR-only: standard-library source/admitted-evidence/tracker validation, Python compilation, tracker marker/heading/identifier and source-identity checks, and `git diff --check`. The new `cap03-revision7-irr-static.yml` workflow uses only IRR checkout plus Python standard library and does not install Node/IPD dependencies. It is not run on this PR because GitHub loads PR workflows from the base branch and the workflow is newly added here; no full hosted workflow is triggered. The existing CI workflow's `npm ci` fetches three IPD Git dependencies, so it is not run. No PowerShell parser is available; no parse is claimed. No IPD access/clone/worktree/inspection/build/install/write, local operator filesystem investigation, S2 or host rerun, P-1 Preflight/Execute/entrypoint, store, database, marker, claim, evidence root, probe, dump, fixture, acceptance artifact, or second invocation occurred. `P-1-C` remains NOT ESTABLISHED; `P-1-D` remains DESIGNATED / NOT VERIFIED FOR THE ATTEMPT; both are not blockers. A6 remains NOT RUN. P-1 remains **AUTHORIZED — NOT EXECUTED — UNSPENT**.

## I. Q-EV PA designation and exact-root Revision 7 binding — current addendum (2026-10-30)

This additive IRR reconciliation records the user's explicit PA approval; it supersedes section H5 and the Q-EV row in section H **only as to the current designation status**. All other section H technical resolutions remain unchanged.

| Field | Current record |
|---|---|
| PA act | `IIPS-V3-CAP03-P1-QEV-RUN-RECORD-ROOT-PA-DESIGNATION-ACT-2026-10-30-01`, `docs/integration/IIPS_v3.0_CAP03_P1_QEV_RUN_RECORD_ROOT_PA_ACT_2026-10-30.md` |
| Tracker | §16.222 / `CV-CORR-202` / `CHG-2026-10-30-17` / `V1712`–`V1723` |
| Canonical Q-EV root | **`H:\IIPS-P1-EVIDENCE`** — exact root supplied and expressly approved by Ramki; no alias or alternative authoritative namespace |
| Accountable operator / security owner | Ramki under P1-F; sole system owner |
| Filesystem owner | The existing personal Windows user account running the authorized operation; no account name, SID, service identity, or enterprise account is inferred |
| Exclusive purpose / environment | Evidence for the single authorized P-1 attempt only; personal, single-user, non-commercial IIPS installation on one Windows laptop |
| Claim / marker | `execute-claim.json` directly under the root; `EXECUTE-MARKER.json` under the unique execute run directory beneath it; both retained permanently |
| Current Revision 7 script | 1,666 LF lines / 120,919 bytes; SHA-256 `650c2913d80a24ae349a16841de7201931a7198e2038920d43e7a2200e7eab0b` |
| Current IRR baseline | Main advanced to `78abb254abe095a1f7b03db58bdd9dd30aba0fbf` through PR #392, adding and preserving O-05 publication reconciliation §16.221/CV-CORR-201/CHG-2026-10-30-16/V1702–V1711. Q-EV now uses the next free §16.222/CV-CORR-202/CHG-2026-10-30-17/V1712–V1723; operator evidence §16.223/CV-CORR-203/V1724–V1737; post-CI reconciliation §16.224/CV-CORR-204/V1738–V1747. The current-main O-05 record and prior §16.218–§16.220 remain preserved; PR #382's claimed/skipped §16.216–§16.217 remain unused. |

### I1. Decision boundaries and permanent evidence semantics

The designation is **APPROVED AND ISSUED**, but is not an execution. P1-F still grants exactly one attempt, remains AUTHORIZED — NOT EXECUTED — UNSPENT, and grants no retry. An acquired or indeterminate `execute-claim.json` is never automatically released or deleted. A pre-marker stop without a process-start request remains NOT CONSUMED under Q-CONS-2 but permanently blocks reuse through the retained claim. `EXECUTE-MARKER.json` is written before process start; marker creation or a process-start request consumes the attempt, including process-start failure. Marker and claim retention are permanent. Interrupted/partial evidence retains its original bytes, hashes, provenance, and chain of custody; it is not rewritten, re-rooted, treated as a second attempt, or replaced by an alternative authoritative namespace.

### I2. Script binding and fail-closed owner check

The Revision 7 script now sets `$EvidenceRootDesignationState = 'DESIGNATED'` and `$DesignatedEvidenceRoot = 'H:\IIPS-P1-EVIDENCE'`. Mandatory `-EvidenceRoot` equality is exact and case-sensitive; the designation and equality checks precede `Get-CanonicalPath` and any access to caller-supplied evidence-root input. The claim and marker locations derive beneath this root.

After the root has passed the existing S00 checks for existence, fixed NTFS, non-root placement, SUBST/reparse/worktree/path integrity, store separation, and the environment-only OneDrive check, S00 now performs a **read-only filesystem owner SID comparison**: the root's owner must equal the SID of the currently running Windows user. The result is recorded as a Boolean only; no account name or SID is emitted. Failure or an unresolvable identity stops before claim/run-directory creation. This is an execution-time guard, not a host fact observed in this IRR review, and it does not prove the personal account is accessible or writable.

The selected `ACL_EVALUATION` remains unchanged: `Get-WriteAclEvaluation` is a read-only DACL projection for the nearest existing **store-parent** ancestor, not an effective-access test or proof of writability. The new root-owner comparison is not a DACL/effective-access evaluation. No ACL or ownership was inspected on H: during this work.

### I3. Required checks and non-claims

The root must already exist; neither this act nor the script's root gate creates it. Execution must still establish local fixed NTFS, not a drive root, no SUBST alias or prohibited reparse chain, no relevant Git worktree, separation from the SQLite store and its path chain, and absence of previous P-1 run/claim/marker state. The environment-variable OneDrive check is not proof of sync state. The reported `142 GB` free on H: is capacity only and does not demonstrate existence, locality, filesystem type, owner, security, suitability, or successful checks.

This pass did not access IPD, inspect the operator's filesystem, create the root/store/database/claim/marker/probe/evidence/acceptance file, run PowerShell, run a host check, perform P-1 Preflight/Execute, invoke provisioning, or run consuming tests. No filesystem check is claimed passed. PR #382 must remain OPEN/UNMERGED; the script's authoritative-main freshness gate remains active, and the branch publication alone cannot initiate an attempt.

### I4. Unchanged adjudications

Q-CONS-2/3, Q-MIG, Q-TX, Q-V8, Q-WRITE and Q-BUILD remain exactly as resolved in section H. PA-06/13/19/20/1, their waivers, admitted evidence, NOT RUN and NOT ESTABLISHED statuses remain unchanged. `P-1-C` is still **NOT ESTABLISHED**; `P-1-D` remains **DESIGNATED / NOT VERIFIED FOR THE ATTEMPT**; both are non-blockers, not PASS. No earlier PA decision is reopened or amended.

### I5. IRR-only validation and publication

The final source SHA-256, line/byte identity, static-validator result, `py_compile`, diff/scope audit, exact pushed commit, and PR #382 read-back are recorded in tracker verification rows V1718–V1723 after completion. Only Python standard-library checks and static IRR source/document inspection are permitted. No frontend/npm/full workflow or hosted CI that could fetch IPD dependencies is run. PowerShell 5.1 parse and Windows host validation remain NOT RUN / NOT PERFORMED.

## J. Operator verification evidence and DACL acceptance — current addendum (2026-10-30)

This section records operator-supplied read-only verification and explicit operator acceptance in `IIPS-V3-CAP03-P1-QEV-OPERATOR-VERIFICATION-DACL-ACCEPTANCE-2026-10-30-01`, tracker §16.223 / `CV-CORR-203` / `CHG-2026-10-31-02` / `V1724`–`V1737`. It supplements section I and supersedes its then-current “not performed / no check claimed passed” status **only for the enumerated checks below**. The PA's Q-EV designation, P1-F one-attempt authority, and all prior decisions remain unchanged.

The operator reports a successful read-only Windows PowerShell 5.1 verification of the exact designated root `H:\IIPS-P1-EVIDENCE`. Reported identity: `DESKTOP-NO0NHTP\USER`, SID `S-1-5-21-1872737340-673410177-2240931581-1001`. Reported PASS results: H: is a local fixed NTFS disk with 142.31 GB available at the time checked; no SUBST mapping; the canonical root exists at the exact path and is not a drive root; reparse-point, Git-worktree-separation and SQLite-store-separation checks pass; the documented OneDrive environment-root check passes; and the root owner matches the current account/SID. The operator reports no existing execution state, and `execute-claim.json` and `EXECUTE-MARKER.json` are absent. These are operator-provided, point-in-time results; no raw transcript or independent host inspection is claimed here. Capacity is not writability proof, and the OneDrive environment check does not establish sync state.

The operator expressly inspected and accepts the existing root DACL as appropriate for the personal, single-user, non-commercial laptop environment: inherited `BUILTIN\Administrators` — `FullControl`; `NT AUTHORITY\SYSTEM` — `FullControl`; `NT AUTHORITY\Authenticated Users` — `Modify`; `BUILTIN\Users` — `ReadAndExecute`. The inherited `Authenticated Users` and `Users` entries are **not blockers**. The DACL is preserved; no ACL change, tightening, service account, or enterprise security arrangement is recommended or performed. The operator's acceptance does not claim effective writability. Revision 7's read-only `ACL_EVALUATION` remains unchanged and is not proof of effective access or actual writability.

No Revision 7 script parse, S00/S03 execution, effective-writability test, P-1 Preflight/Execute, provisioning, consuming test, or second attempt is claimed. Runtime path-integrity, fixed-NTFS, owner, store-separation, environment, and no-prior-state guards remain applicable at invocation. The operator results resolve the previously unverified Q-EV host/root observations **as reported for the time checked** and make the DACL no blocker; they do not clear overall execution readiness because PR #382 remains open and the authoritative-main freshness gate is unsatisfied. P-1 remains **AUTHORIZED — NOT EXECUTED — UNSPENT**; `P-1-C` remains **NOT ESTABLISHED** and `P-1-D` **DESIGNATED / NOT VERIFIED FOR THE ATTEMPT**, both non-blockers, not PASS. Q-CONS-2/3, Q-MIG, Q-TX, Q-V8, Q-WRITE, Q-BUILD and all prior waivers remain unchanged.

The Revision 7 freshness-pointer marker is advanced to `CV-CORR-202` to match the current tracker; the exact root binding, one-attempt controls, and read-only ACL evaluation behavior are otherwise unchanged. The resulting script identity is 1,666 LF lines / 120,919 bytes, SHA-256 `650c2913d80a24ae349a16841de7201931a7198e2038920d43e7a2200e7eab0b`, pinned by the validator, README, and tracker. The record is based on the operator's explicit statement; the agent did not access the operator's filesystem, change permissions, access IPD, create any root/store/database/claim/marker/evidence artifact, or invoke P-1. Validation remains IRR-only: standard-library compilation, the static validator, and diff/scope checks; no script parse or host execution is implied.

## K. Post-CI boundary reconciliation and readiness — current addendum (2026-10-30)

PR #382's current-head workflow results were independently checked and bound to exact commits in tracker §16.224 / `CV-CORR-204` / `CHG-2026-10-31-03` / `V1738`–`V1747`: generic CI `41102065894` SUCCESS and IRR-only checks `41102065682` SUCCESS at `698920a8c7a43801cafd592129401ea6c399b75d`; older generic CI `41101977469` CANCELLED and older IRR-only checks `41101976326` SUCCESS at `5dd5b9f227be9652f10a99d49887d3e1093929ab`. PR #382 remained OPEN/UNMERGED. Main remained `f6ae5ebd8552990fc156f7a4c9a6a1110b22a413`; it is an ancestor of the current PR head, so no main-side reconciliation was needed.

The successful generic `Typecheck · Test · Build` workflow checked out IRR, configured Node 22/npm cache, then ran `npm ci --no-audit --no-fund`, typecheck, strict replay-server typecheck, the full Vitest suite and nonzero-test guard, and production build. `frontend/package.json` and the lockfile pin three direct dependencies to Git commits in `ramkivs/iips-production-market-data`. Thus the completed job used the IPD-pinned dependency packages as install/build/test inputs. The logs could not establish whether npm fetched the Git repositories remotely during that run or reused cached package content: `gh run view 41102065894 --log` failed with EOF from `results-receiver.actions.githubusercontent.com`; the successful Jobs API retry returned `steps: []` (an earlier request returned HTTP 502). **Actual remote IPD repository access is UNVERIFIED**; neither a remote fetch nor no remote fetch is asserted. The workflow contains no explicit IPD checkout or write step, and no IPD write is evidenced. The agent did not access IPD.

The broad generic trigger was a **configuration/process boundary deviation** for an IRR-only PR: its unconditional `npm ci` was configured to install IPD-pinned dependencies. This evidence establishes the unsafe configuration and completed install/use of those package inputs, not a proven remote fetch or IPD write. The successful CI result remains a valid green result for its exact code head, but does not validate safe IRR isolation or P-1 execution and is not rerun.

### K1. Corrected future routes

The generic product workflow now runs only for `frontend/**` and `.ci/**` changes on pull requests and `main` pushes. Existing frontend typecheck, strict replay-server typecheck, Vitest/test-count guard, and production build are preserved for those product/test-guard changes. Tracker, governance, P-1 source/evidence, and workflow-only edits are excluded. Mixed PRs that also change frontend source remain a product-CI case.

The independent `.github/workflows/cap03-revision7-irr-static.yml` remains Python standard-library-only and does not run npm, install, or build. Its trigger list includes `.github/workflows/ci.yml` and the post-CI reconciliation record; the static validator now asserts the generic path filters and safe-workflow boundary. No generic CI rerun was launched. Because main is unchanged and the PR remains unmerged, the corrected path filters are published on the branch but not yet effective in the base workflow. The correction commit uses `[skip ci]` to avoid invoking the old broad base workflow before the fix is incorporated; no merge is performed here.

### K2. Current readiness and non-claims

The Q-EV operator report and explicit acceptance of the existing DACL remain operator-supplied, point-in-time evidence; no host/filesystem/ACL check was repeated. No effective-writability claim is made and no ACL change occurred. PA-06 S2 remains L2a-only; PA-13/E10, PA-19, PA-20 and PA-1 remain effective. Q-CONS-2/3, Q-MIG, Q-TX, Q-V8, Q-WRITE and Q-BUILD remain resolved at their recorded scope. U-4 and U-5 remain NOT RUN under their prior waivers; A6 remains NOT RUN. `P-1-C` is NOT ESTABLISHED and `P-1-D` is DESIGNATED / NOT VERIFIED FOR THE ATTEMPT; both remain non-blockers, not PASS.

P-1 remains **AUTHORIZED — NOT EXECUTED — UNSPENT**, exactly one attempt. The authoritative-main freshness gate is **NOT SATISFIED** because main `f6ae5ebd8552990fc156f7a4c9a6a1110b22a413` does not contain the current `CV-CORR-204` pointer and PR #382 is OPEN/UNMERGED; overall execution readiness remains **NOT CLEARED**. The correction and hosted CI result do not waive freshness or authorize a host action. Any future invocation remains subject to the existing fail-closed runtime checks after the normal publication/review/merge process; no new PA approval is requested.

Formal pre-merge review found and corrected two S00/S06 freshness defects before merge: three P-1-named files added by this PR were missing from `$ReviewArtifactPaths`, which would make `F-NO-P1-NAMED-CHANGE` refuse after publication; and `$TrackerPointerRequiredText` did not match either live `CV-CORR-204` pointer row. The allowlist now includes the operator-verification record, post-CI record and historical F9 runner; the required-text check now matches `AUTHORIZED`, alongside the existing `NOT EXECUTED.*UNSPENT` check. The static validator enforces both conditions against all P-1-named paths in the PR diff.

**Capability-boundary finding:** this new, PA-authorized procedure does contain one future write-capable P-1 path: the single `node --mode=execute` call site in Execute mode. It also contains read-only GitHub API checks for IRR main and the pinned IPD commit/tree. These are not zero-capability code; they are the explicit one-attempt P1-F procedure, constrained by the exact pin, confirmation/authority gates, pre-claim main-pointer check, retained claim, marker-before-process ordering, and no retry/release path. No alternate/unbounded IPD writer, package installation, build, or IPD checkout was added. Neither API path nor Execute path was run in this review; no IPD access or write occurred. The review treats the narrow future path as within the existing PA scope, while preserving the task-time prohibition on any IPD operation.

Current Revision 7 script identity is **1,669 LF lines / 121,171 bytes**, freshness marker `CV-CORR-204`, SHA-256 `47bd766fa47c1fd6976f945b1d87ba8e1dd73a81fbbbaea0a5a4d0425ba94068`. The allowlist and pointer-text correction are statically reviewed by the validator. Local Python compilation/static validation and diff checks pass on the exact PR tree; no PowerShell parse, host execution, IPD operation, generic CI rerun, P-1 action or merge is claimed.

## L. Intervening-main review supplement (2026-10-31)

The final pre-merge refresh found authoritative main had advanced to `78abb254abe095a1f7b03db58bdd9dd30aba0fbf` through PR #392 after the dated section-K snapshot. Its O-05 publication record §16.221 / `CV-CORR-201` / `CHG-2026-10-30-16` / `V1702`–`V1711` and matching change-log row are preserved byte-for-byte. The conflicting pre-review CAP-03 allocation was retired before merge; the current allocation sequence is Q-EV §16.222/CV-CORR-202/V1712–V1723, operator evidence §16.223/CV-CORR-203/V1724–V1737, and post-CI review §16.224/CV-CORR-204/V1738–V1747. The script baseline and marker now bind `78abb...` / `CV-CORR-204`; all current identity references pin SHA-256 `47bd766fa47c1fd6976f945b1d87ba8e1dd73a81fbbbaea0a5a4d0425ba94068`.

The two fail-closed code-review findings remain corrected: all P-1-named PR paths are allowlisted, and both main-pointer rows match the authorization/unspent predicate. The procedure contains one PA-authorized future write-capable Execute call site and read-only GitHub API pin checks; neither was exercised. No agent IPD access/write, host/filesystem activity, P-1 Preflight/Execute, P-1 consumption, or evidence/claim/marker creation occurred. Exact-tree local IRR-only Python compilation, validator, allocation/pointer checks and `git diff --check` pass. No hosted check exists for the skip-CI correction. The conditional merge decision is reviewed against refreshed main and PR state below; P-1 remains **AUTHORIZED — NOT EXECUTED — UNSPENT** and overall execution readiness remains **NOT CLEARED** pending runtime gates.
