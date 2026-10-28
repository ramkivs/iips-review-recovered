# IPD Execution Prompt — CAP-03 D2 Receipt Correction (Option B, Bounded, Non-Production)

> **For the IPD repository pass only.** Repository: `ramkivs/iips-production-market-data`. This prompt is issued from the IRR repository and is **not** an IPD act. It is governed by the IRR formal decision record `docs/integration/IIPS_v3.0_CAP03_P1_PA_FORMAL_DECISION_RECORD_2026-10-28.md` (§5), whose merge commit is recorded in IRR tracker §16.165. Read that merge commit before starting.
>
> **P-1 is NOT EXECUTED / UNSPENT / NOT AUTHORIZED.** This pass must not run `executeProvisioning` against any real store, must not create a P-1 store, and must not touch any Windows host. Tests use temporary stores only.

## 1. Authority and scope

- **Authority.** IRR formal decision record §5 (PA-5 Option B selected; bounded, non-production implementation authority recorded). The specification is the IRR D2 handoff §4 (`docs/integration/IIPS_v3.0_CAP03_D2_IPD_RECEIPT_HANDOFF_2026-10-28.md`), as adjusted by the formal record §5.2.
- **Purpose.** The provisioning receipt must record **execution identity** (the executing HEAD and tree) **separately from compiled-basis identity**, as DA-A1 requires.
- **Production.** Out of scope.
- **Pins.** This pass designates **no** pin. The expected values for pin enforcement are supplied at execution time, not hard-coded. The new commit's identity is recorded only after it exists.

## 2. Prerequisites — verify before any write

Stop and report if any check fails.

1. IRR formal decision record is merged on IRR `main`, and its merge commit is recorded in IRR tracker §16.165. Record that commit.
2. IPD `main` equals **`888eb375eebee01640e44ccdcbb138a71e8c4513`** (tree `cf3b90482fa7ed1f9780f20a9286164686885d2b`). If `main` has moved, re-verify. If the movement is non-documentary, **stop** (Gate 4 §3.2(4)). If it is documentary only, record the new baseline and continue.
3. No open PR in IPD that changes `src/persistence/gateAPrimeProvisioning.ts`, `src/persistence/gateAPrimeValidation.ts`, or `tests/g3_gate_a_prime_successor_provisioning.test.ts`.
4. No P-1 authorization, execution, or receipt exists in IPD's register or evidence. P-1 remains UNSPENT.
5. The identity constants in `src/persistence/gateAPrimeValidation.ts` are non-null (`PRINCIPAL_LABEL`, `TENANT_ID`, `CANONICAL_OWNER_ID`) and `BASIS_COMMIT` = `5fc74085ade980846ff4a07b36415b6d49446486`, `BASIS_TREE` = `7226ef0033b3a7049169d8fcf9bcbc9908e2590b`. Record these; they must not change.

## 3. Files

**Allowed to change (exactly these two):**

- `src/persistence/gateAPrimeProvisioning.ts`
- `tests/g3_gate_a_prime_successor_provisioning.test.ts`

**Must not change:**

- `src/persistence/gateAPrimeValidation.ts` (`BASIS_COMMIT` and `BASIS_TREE` are compiled here and must not change)
- Any migration, schema, or persisted row
- The audit event detail `{ tenantId, canonicalOwnerId }` and the audit append path
- IPC, startup, composition, or frontend imports (T-8 import-graph test)
- `package.json`, `scripts/**`, or any other file

**Must not add any file** under `src/`, `tests/`, or `scripts/`. A new compiled module or test file changes the `dist/**` set and breaks the runtime-dist entry count (1,140 files) recorded in the S1 determination and the H-12 records. Put the helper inside `gateAPrimeProvisioning.ts`.

## 4. Implementation (smallest correct change)

### Step 1 — verify the baseline

- Confirm the file blob and the constants in §2 at `888eb375`.
- Confirm the line numbers in this prompt match. They were verified at `888eb375`: `GateAPrimeExecutionResult` 64–73; `executeWithAuthorization` 260–321 (the result return at 317–318); `executeProvisioning` 323–343 (`openDatabase` at about 333); `parseGateAPrimeArguments` allow-list at about 385–400; CLI `isMain` block at about 425. If lines differ, use the code, not the numbers.

### Step 2 — inspect

- Read `GateAPrimeExecutionResult`, `executeWithAuthorization`, `executeProvisioning`, `parseGateAPrimeArguments`, and the CLI block.
- Read `tests/g3_gate_a_prime_successor_provisioning.test.ts`: the `describe` block, the `args()` helper, and tests T-1 to T-9, which must keep passing.
- Confirm that `executeWithAuthorization` returns `basisCommit: BASIS_COMMIT` and `basisTree: BASIS_TREE`, and that the audit `detail` is `{ tenantId, canonicalOwnerId }`.

### Step 3 — implement

1. **Helper** (inside `gateAPrimeProvisioning.ts`), e.g. `readExecutionHead(repoRoot: string): { commit: string; tree: string }`:
   - Runs `git -C <repoRoot> rev-parse --verify HEAD^{commit}` and `git -C <repoRoot> rev-parse --verify HEAD^{tree}` with `child_process.execFileSync`.
   - Uses a **sanitized environment** that drops `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_CEILING_DIRECTORIES`, and `GIT_NAMESPACE`. It keeps only what Windows needs to run `git` (`PATH`, `SystemRoot`, and the user-profile variables).
   - Each output must match `/^[0-9a-f]{40}$/`. Otherwise refuse with `EXECUTING_HEAD_UNRESOLVED` **before any store is opened**.
2. **Arguments** (add to the `parseGateAPrimeArguments` allow-list):
   - `--repo-root=<absolute path>`: required in `execute` mode.
   - `--execution-commit=<40 hex>`: required in `execute` mode.
   - `--execution-tree=<40 hex>`: required in `execute` mode.
   - Missing or malformed values refuse `ARGUMENT_INVALID`. Read no value from the environment.
3. **Resolution order** in `executeProvisioning`: resolve HEAD and tree **before** `openDatabase`. If the resolved HEAD or tree differs from `--execution-commit` or `--execution-tree`, refuse `EXECUTION_PIN_MISMATCH` **before** `openDatabase`. A refusal creates no store.
4. **Result** (`GateAPrimeExecutionResult`): add `executingCommit` and `executingTree`. Return them from `executeWithAuthorization` alongside the **unchanged** `basisCommit: BASIS_COMMIT` and `basisTree: BASIS_TREE`. Existing fields and values are unchanged.
5. **Audit and persistence**: no change. Do not add execution identity to the audit event. Do not add a column or migration.

### Step 4 — basis immutability

- `basisCommit` and `basisTree` are still read from the compiled constants. Do not read them from the checkout, the arguments, or the environment.

### Step 5 — execution identity from the actual execution context

- `executingCommit` and `executingTree` come only from the `git -C <repoRoot>` resolution in Step 3.1.

### Step 6 — fail closed

- Any unresolvable identity, malformed identity, or mismatch refuses before a store is opened. A refusal leaves the store path untouched.

### Step 7 — tests (additive, in the existing test file)

| ID | Test | Expectation |
|---|---|---|
| T-10 | `--repo-root` pointing at a non-repository, or a repository with an unresolvable HEAD | Refuses `EXECUTING_HEAD_UNRESOLVED`; creates no store |
| T-11 | Success path: temporary Git repository with one commit; `platform: 'win32'`, `nodeVersion: '22.22.3'`; store in a separate temporary directory outside the repository | `executingCommit`/`executingTree` equal the fixture's `git rev-parse` output; `basisCommit`/`basisTree` equal the compiled constants (**distinct** values). Linux CI feasibility of `node:sqlite` with a real store is **not yet verified**. If the test cannot run on the CI runner, report it and **do not weaken or remove it** |
| T-12 | Mismatched `--execution-commit` (and separately `--execution-tree`) | Refuses `EXECUTION_PIN_MISMATCH`; creates no store |
| T-13 | `GIT_DIR` and related variables set in the process environment, with a fixture whose HEAD differs from the environment-named repository | Resolved HEAD is the `--repo-root` HEAD, not the environment's |
| T-1 to T-9 | Existing | Pass unchanged, except that the `args()` helper gains `repoRoot`, `executionCommit`, and `executionTree` |
| T-8 | Import graph | Unchanged and green |

### Step 8 — dist entry-count gate

- The changed-file list must be exactly the two files in §3, each `M` (modified). No `A` (added) entries.
- Confirm the count of compiled outputs for `src/` and `tests/` is unchanged from `888eb375`.

### Step 9 — audit and persistence contracts

- Confirm the `detail: { tenantId, canonicalOwnerId }` line is byte-identical to `888eb375`.
- Confirm no migration, no schema change, and no persisted row change.

### Step 10 — validate, publish, verify

1. `tsc --noEmit` (or `npm run build:tsc`) clean.
2. `npm test` (`scripts/run-tests.mjs`) green on the Linux CI runner.
3. Open a PR from a new branch on IPD. Confirm exact-head CI green.
4. Merge with `--merge`. Confirm post-merge CI green.
5. Remote read-back: `git ls-remote` agrees, and the blobs of the two files on `main` match the PR head.

## 5. Stop conditions

- **A new pin-designation choice** appears that the IRR formal record does not resolve. **Stop only that dependent action.** Return the exact choice with evidence. Continue all other authorized work. Do not designate a pin.
- **A required test cannot run** on the CI runner. Report it. Do not weaken or remove it.
- **A need to add a file, change persistence, change audit detail, change `gateAPrimeValidation.ts`, or change the CLI beyond §4.2.** Stop and return to PA.
- **IPD `main` moved non-documentary** before the PR merges (Gate 4 §3.2(4)). Stop and re-verify.
- **Any action that would run `executeProvisioning` against a real store**, touch a Windows host, or run PowerShell. Do not do it.

## 6. Required report (returned to IRR tracker §16.165 by a later receipt)

1. IPD baseline: `main` SHA and tree at start.
2. Implementation PR number, head commit SHA, and tree.
3. Merge commit SHA on IPD `main`, and its tree.
4. Exact-head and post-merge CI run IDs and conclusions.
5. Changed-file list (should be exactly the two files) with `git diff --stat`.
6. Test results: `tsc`, `npm test` counts, and T-10 to T-13 results. State T-11's CI feasibility explicitly.
7. Confirmation that the `dist/**` entry count is unchanged and no file was added.
8. Confirmation that basis constants, audit detail, and persistence are unchanged.
9. The implementation commit's identity **as recorded after it exists**. No pin is designated by this report.
10. Statements that: no P-1 action was taken; no store was created outside tests; no Windows host was touched; no PowerShell was run; no IRR write occurred.

*End of IPD execution prompt. P-1 remains NOT EXECUTED, UNSPENT, and NOT AUTHORIZED.*
