# IIPS v3.0 CAP-03 — P-1 (P1-F) source-to-script verification and corrected procedure — 2026-10-29 (revision 4)

| Field | Value |
|---|---|
| Record | Companion to `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1` (revision 4, 1234 lines, ASCII, LF) |
| Supersedes | Revision 3 of this record and revision 3 of the script (commit `4efb09b`). The revision-3 content is in git history. |
| Authority read | P1-F, IRR `docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md` (blob `a90bb001…`, §6, conditions 1–5); tracker §16.206 (`CV-CORR-186`) current-state pointer rows at baseline lines 14 and 22 |
| Pinned IPD execution basis | commit `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`, tree `76f083d7058e170d8212455c03bad1033136ee68` |
| IRR baseline | `aa013db4bd2cc50a249ef30bfca9ce303fe2f5fe` (tree `3a9ef48c…`, 2218 entries, not truncated); origin/main unchanged for the comparison in this pass |
| PR | #382 (`arena/325002ab-iips-review-recovered` → `main`). Head and state: section E3 |
| Status of P-1 | **UNSPENT. Not executed on any host. No entrypoint invocation (including execute-mode diagnostics). No provisioning, store, binding, membership, audit row, or receipt has been created.** |
| Scope of this pass | Documentation and script revision. No PowerShell was run or parsed. No Windows host was used. No IPD write, no merge, no gate, authority, or capability change. The Node probes below ran on Linux only against pinned source and scratch text, never against a P-1 store. |

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

## B. Revision-4 script: structure, stop points, and static results

### B1. Modes and stages

The script is `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1`. As committed, it **refuses at S00 in both modes**: `$AuthorityRulingRef`, `$DesignatedActorLabel`, `$DesignatedEvidenceRoot` and `$DesignatedWritabilityMethod` are null. It is a reviewed artifact, not a runnable procedure.

| Stage | Mode | Read-only? | Content | Check IDs |
|---|---|---|---|---|
| S00 | both | yes (run directory not yet created) | Script path; designations (ruling, actor, evidence root, writability method, store = F4); absolute paths; `ConfirmToken` for execute; acceptance argument; evidence root containment (Invoke-EvidencePlacement); prior-run scan (`p1-exe-*` any; marker; unsealed; any `p1-*` file); execute only: acceptance and preflight verification | `S00-*` |
| — | both | — | Create run directory exclusively (`p1-pre-…` or `p1-exe-…`), `run.log` | `S00-RUNDIR-NEW` |
| S01 | both | yes | Host, non-elevated, product, `GATE_A_PRIME_*` absent, NODE_OPTIONS unset, Node node22 ≥ 13, flag-free `node:sqlite` probe | `S01-*` |
| S02 | both | yes | HEAD and tree = pin; `status --porcelain --untracked-files=all` empty; designated blobs (ls-tree) | `S02-*` |
| S03 | both | yes; `PARENT_PROBE` writes and removes one probe in the store parent once | Store absent; sidecars absent; outside worktrees; no `.git` or reparse in the chain; fixed NTFS; not OneDrive env root; writability by the designated method | `S03-*` |
| S04 | both | build (non-authority; no store) | `npm ci`, `npm run build`; closure present and emitted this build; emitted migration identity; clean after build; ignored entries limited to `node_modules/`, `dist/`, `dist-frontend/` | `S04-*` |
| S05 | both | yes | `--mode=validate` on the absent store: exit 1, empty stdout, `STORE_NOT_FOUND` or `UNEXPECTED_FAILURE` with the verbatim message; store still absent | `S05-*` |
| S06 | both | yes (GitHub read-only) | Freshness: origin/main; IPD pin tree on the remote; full recursive tree diff with modes; P1-F and PF-15 entries; tracker pointer identity; tracker added-line scan; P-1-named changes | `F-*`, `FRESHNESS_*` |
| S07-GO | both | — | Preflight: outcome `PREFLIGHT_PASSED_NOT_EXECUTED`; end, summary, seal. Execute: continue. | — |
| S07-RECHECK | execute | yes | Script hash and acceptance hash unchanged; host; git pin; store placement; closure hashes; freshness; only this run's `p1-exe-*` directory | `R-*` |
| S07-MARKER | execute | writes the marker (CreateNew) | `EXECUTE-MARKER.json` before the process | — |
| S07-INVOKE | execute | **invokes once** | `node … --mode=execute` with the ten arguments; `ExecuteCalls` guard | `S07-RECEIPT`, `S07-RESULT`, `S07-INVOCATION-EXCEPTION` |
| S08 | execute | yes | Store SHA-256 after execute; `--mode=validate` with the same arguments; V-A2-1…V-A2-7 and the `V-A2-8` row-state result; counts 1/1/1; `status` PASS | `S08-VALIDATE`, `S08-STORE-HASH` |
| S09 | execute | yes | If the store exists: size, UTC write time, sidecars before dump; structured read-only dump; query checks; ledger identity against the pinned expected list (execute-matching outcome); store SHA-256 unchanged; sidecars after dump | `S09-*` |
| S10 | both | — | Summary (`run-summary.json`) and seal (`SHA256SUMS.txt`) | — |
| Catch | both | — | Any stop: outcome set from recorded state; `failure-summary.json`; seal | — |

Run directory layout: `run.log`; `NN-<name>.cmdline.txt`, `.stdout.txt`, `.stderr.txt`, `.code.txt`, `.timing.txt` for every process; `probe-sqlite-<guid>.mjs`; `probe-migrations-<guid>.mjs`; `acl-<n>-nearest-ancestor.txt` (ACL method); `entry-closure-sha256.txt`; `readonly-dump-<guid>.mjs`; `EXECUTE-MARKER.json` (execute only, before the process); `run-summary.json` or `failure-summary.json`; `SHA256SUMS.txt` (last).

Refusals before the run directory exists (all of S00 before creation) create nothing and no summary file. Operators must keep the console transcript for those stops.

### B2. Outcomes (set from recorded state; never inferred)

| Outcome | Meaning |
|---|---|
| `PREFLIGHT_PASSED_NOT_EXECUTED` | Preflight completed. The entrypoint was not invoked. |
| `PREFLIGHT_STOPPED` | Preflight stopped at a check. |
| `STOPPED_BEFORE_MARKER` | Execute stopped before the marker. No marker, no invocation. Q-CONS-2 open. |
| `MARKER_WRITTEN_INVOCATION_EXCEPTION` | The marker exists; the invocation wrapper threw (process start or raw-capture write). The attempt is spent (Q-CONS-3). S08 and S09 still ran. |
| `EXECUTED_RECEIPT_MATCHES` (intermediate) | Exit 0; the receipt matches the pinned values. Final classification follows. |
| `EXECUTED_VALIDATED_PASS` | Receipt matches; validate PASS with V-A2-1…V-A2-8 row-state result and counts 1/1/1; ledger identity; no post-step failure; read-only invariant. |
| `EXECUTED_POST_STEP_FAILED` | Receipt matches and validation passed, but a post-step failure was recorded. |
| `EXECUTED_POST_VALIDATION_NOT_PASSED` | Receipt matches but validation or ledger identity did not pass. |
| `EXECUTED_RECEIPT_MISMATCH` | Exit 0 but stdout is not the expected receipt. |
| `EXECUTION_REFUSED_OR_FAILED` | Nonzero process status. Refusal code recorded from the last stderr JSON line. |
| `MARKER_WRITTEN_STOPPED_AFTER_MARKER` | A stop after the marker that is not a recorded invocation outcome. The attempt is treated as spent. |

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

### B5. Static checks on revision 4 (NOT a PowerShell parse)

| Check | Result |
|---|---|
| Lines / bytes / SHA-256 | 1234 lines; 85,478 bytes; SHA-256 `920f624fb94a29a9259e5a201b14dbb475e8764303cb056bafaa8e8f5bce77d5` (LF; the tracker pointer marker correction is in A1 #7) |
| Non-ASCII lines | 0 |
| CRLF lines | 0 (LF) |
| Whole-word `exit`, `else`, `elseif`, `finally`, `break`, `continue`, `switch` | 0 hits |
| Bracket balance `( ) { } [ ]` (PowerShell-aware text scan that skips strings, comments and here-text) | 912/912, 248/248, 296/296. This is a text scan, not a parse. |
| Check call sites (`Require-Check` and `Add-Check`) | 108 call sites, 107 distinct IDs; `S08-VALIDATE` appears once per mutually exclusive branch by design |
| Script-scope variables read but never assigned | none |
| `$script:Facts` keys read but never set | none (reads are guarded or set first) |
| Embedded JavaScript (dump, emitted-migration probe, S01 sqlite probe) | `node --check` passes for all three (Linux, Node 22.22.3) [TEST] |
| Dump on a nonexistent path | Returns structured JSON with `ok:false` and error `open: unable to open database file`; creates no directory. Exit code 0 (the script decides by `ok`). [TEST] |
| Emitted-migration probe and S01 probe on the host | NOT PERFORMED (no build, no host) |
| PowerShell 5.1 parse | **NOT PERFORMED** |
| Windows runtime | **NOT PERFORMED** |
| Any execution of the script, the entrypoint, provisioning, or the P-1 store | **NOT PERFORMED** |

Known PS 5.1 review points (static only). The only `?` in the script is inside an embedded JavaScript string (line 517); no PowerShell ternary, `??`, `-AsHashtable`, `using` or `-Parallel` is used. `Set-StrictMode -Version Latest` is respected by `Get-Prop` (object property reads) and hashtable reads; `ConvertFrom-Json`, `ConvertTo-Json -Depth`, `Get-FileHash`, `Get-Acl`, `Get-ChildItem -Directory`, `New-Object` generic `HashSet`, `[IO.File]`, `[regex]`, `[guid]`, `[System.Security.AccessControl]` are available on Windows PowerShell 5.1 (not run). No `-AsHashtable`, no `??`, no ternary, no `-Parallel`, no `using` statement. `npm` is resolved by `$env:ComSpec /d /c npm …`, the only use of a shell. Arguments are quoted only when they contain whitespace; a quote or newline in an argument stops the run; a trailing backslash on a quoted argument stops the run.

---

## C. Source-to-script traceability

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
| D-1 | **Q-CONS**: written PA treatment of a preflight run, a stop before the marker, a marker followed by a process-start or raw-capture failure, and a recorded invocation (E1) | PA | Written ruling |
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
| 1. Preflight run (any outcome) | Read-only; no invocation | no | no | `NOT_APPLICABLE` | **Q-CONS-1**: confirm that a preflight is not an attempt |
| 2. Execute stop before the marker (any S00–S07-RECHECK failure) | Run directory created and sealed (`failure-summary.json`) | no | no | `UNDETERMINED` | **Q-CONS-2**: confirm that this does not consume P1-F. A sealed `p1-exe-*` directory blocks later execute runs in the script until the PA changes the script or the directory. |
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

- Revision 4 is written locally, committed to `arena/325002ab-iips-review-recovered` only, pushed without force, and verified remotely by `git ls-remote` and `gh api repos/ramkivs/iips-review-recovered/pulls/382` (head SHA, state, merged flag). The commit hash is recorded in the PR body and the final report. This file does not name its own commit.
- The PR is not merged. No merge is authorized by this pass.
- No durable publication is claimed from the local checkout; remote verification is the evidence (see the final report).

### E4. Final status (this pass)

- **P-1 remains UNSPENT.** Nothing executed on any host. No entrypoint invocation, no provisioning, no store, no binding, no membership, no audit row, no receipt.
- **Source-verified:** F1–F25 (section A2), with the identities listed in each row. Migration checksums by two methods. Binding and membership ids recomputed.
- **Record-verified:** tracker §16.206 pointer rows (lines 14 and 22), PF-15 F4 (line 30), P1-F §6, act §2, §8, §9, runbook statements in E1.
- **Live-verified (GitHub, prior and this pass):** origin/main and the IRR baseline tree; P1-F, PF-15, tracker blobs and modes; IPD pin tree; 15 designated blobs at the remote tree.
- **Static only:** revision-4 script text checks (B5).
- **Linux-tested only:** the dump and emitted-probe JavaScript (syntax; absent-path behaviour); the Node `ExperimentalWarning` on stderr; the Node SHA-256 of migration SQL.
- **NOT PERFORMED:** PowerShell 5.1 parse; Windows runtime; host preflight; build on the host; any entrypoint invocation; literal V-A2-8.
- **Not verified:** U-1 to U-10 (A3).
- **Not decided here:** Q-CONS, Q-STORE, Q-EV, Q-ACTOR, Q-MIG, Q-TX, Q-V8, Q-WRITE, Q-BUILD, and the acceptance rule for the preflight.

### E5. Exact next safe action

1. The Program Authority rules in writing on Q-CONS (cases 1–3), Q-EV, Q-ACTOR, Q-WRITE and Q-BUILD, and confirms Q-STORE, Q-MIG and Q-TX. Nothing is run until then.
2. Only after the ruling: a reviewed change sets the designations and `$AuthorityRulingRef` in the script, citing the ruling. The operator then runs `-Mode Preflight` on `DESKTOP-NO0NHTP` and returns the raw `p1-pre-*` directory for independent review.
3. Only after that review: a reviewed acceptance file (schema `IIPS-P1-PREFLIGHT-ACCEPTANCE/1`) binding the preflight summary hash and the exact script SHA-256. The single attempt is then taken in a separate, explicitly authorized run with `-Mode Execute -ConfirmToken P1-F-ONE-ATTEMPT -AcceptanceFile <path>`. Nothing in this pass authorizes that run.

### E6. Separate correction (not applied in this PR)

Tracker `DISP-03` (line 12741 at `aa013db`) states that validate at step 2 refuses `STORE_NOT_FOUND`. The pinned validator throws that code (validator line 372), but the entrypoint emits `UNEXPECTED_FAILURE` with the message `the validation store file does not exist` (F9). The IPD commit `e08d013`, which changed the store-missing wording, is 9 commits after the pin and is not part of the basis (F26). Proposed: a separate, narrowly scoped IRR tracker correction that adds the emitted wording beside the thrown class name. It is not applied here, because this PR does not change the tracker and the pointer rows must stay unchanged for the freshness check.
