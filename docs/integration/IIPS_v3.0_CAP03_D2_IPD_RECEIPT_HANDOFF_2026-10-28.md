# CAP-03 — D2 Provisioning-Receipt Gap: Verified Code Path and Implementation Handoff (`2026-10-28`)

> **STATUS: IMPLEMENTATION-READY HANDOFF ONLY. NO IPD WRITE, REF, BRANCH, OR PR HAS BEEN MADE OR IS AUTHORIZED BY THIS DOCUMENT.** The IPD correction described here is outside IRR scope. It requires a separate authorization and a Program Authority (PA) decision (PA-5, `IIPS_v3.0_CAP03_P1_PA_STATUS_MATRIX_2026-10-28.md`) before any IPD commit. Nothing here authorizes P-1, a capture, a host diagnostic, or any execution.

| Field | Value |
|---|---|
| **Record type** | Read-only code-path verification and implementation handoff; not a PA act, not an IPD act |
| **Authority locus for this record** | `ramkivs/iips-review-recovered`, branch `arena/4ceb5dc1-iips-review-recovered` (merges to `main` by PR) |
| **Target repository (read-only here)** | `ramkivs/iips-production-market-data`, `refs/heads/main` at **`888eb375eebee01640e44ccdcbb138a71e8c4513`** (verified 2026-10-28 by `git ls-remote`) |
| **Adopted requirement** | DA-A1 (package §1.7, adopted as written by the 2026-10-28 directive; adoption record §1): *"Any provisioning receipt must record both the compiled basis and the executing HEAD and tree."* |
| **Gap** | **Confirmed.** The receipt records the compiled basis only. The executing HEAD and tree are not resolved, checked, or returned. |
| **Tracker** | §16.163 (`CV-CORR-143`, `CHG-2026-10-28-06`), `V1126`–`V1131` |

---

## 1. Verified current behaviour (IPD `main` `888eb375`)

Files and symbols, with line numbers as read on `888eb375`:

| Location | Verified content |
|---|---|
| `src/persistence/gateAPrimeValidation.ts` 25–26 | `export const BASIS_COMMIT = '5fc74085ade980846ff4a07b36415b6d49446486';` and `BASIS_TREE = '7226ef0033b3a7049169d8fcf9bcbc9908e2590b';` (compiled constants; the only definitions) |
| `src/persistence/gateAPrimeProvisioning.ts` 24–40 | Re-exports `BASIS_COMMIT` / `BASIS_TREE` from the validation module |
| same, 51–62 | `GateAPrimeArguments` (CLI-derived); `GateAPrimeExecutionOptions` (`platform?`, `nodeVersion?`) — no repo-root or HEAD field |
| same, 64–73 | `GateAPrimeExecutionResult`: `mode`, `actId`, `store`, `bindingId`, `membershipId`, `auditEventId`, `basisCommit`, `basisTree`. **No executing HEAD or tree field.** |
| same, 83 | Module-private execution brand (`GATE_A_PRIME_EXECUTION_BRAND`); the only path to a binding insert |
| same, 123–131 | `isInsideGitWorktree(filePath)` walks parents looking for a `.git` entry. It does not invoke Git and does not resolve HEAD. |
| same, 133 | `assertCommonArguments` — argument and store-path checks |
| same, 209 | `authorizeExecution` — win32 only; Node `>=22.13.0 <23` (line 237); store absolute, outside any Git worktree, and must not pre-exist |
| same, 260–322 | `executeWithAuthorization(db, authorization, args)` inserts the binding and membership, appends the audit event, and returns at **317–318**: `basisCommit: BASIS_COMMIT, basisTree: BASIS_TREE` |
| same, 323–343 | `executeProvisioning(args, options)` order: `authorizeExecution` → `openDatabase` → `ensureMigrations(GATE3_MIGRATIONS)` → `executeWithAuthorization` → `closeDatabase()` in `finally` |
| same, 385–400 | `parseGateAPrimeArguments` — strict allow-list: `--mode`, `--act-id`, `--store`, `--principal-label`, `--tenant-id`, `--canonical-owner-id`, `--actor`. Unknown arguments are refused. |
| same, 425 | `isMain` guard: the CLI prints the result as JSON on stdout. **No receipt file is written.** |
| `tests/g3_gate_a_prime_successor_provisioning.test.ts` | 12 tests. Every `executeProvisioning` call is a **refusal** test (116, 131, 139, 154, 212, 221, 287). The **success path of `executeWithAuthorization` is not exercised by any test**, and no test references `basisCommit` or `basisTree`. |
| `tests/g3_startup_validation.test.ts` | Startup validation; not affected by the provisioning result shape |

**Mechanism (verified).** `executeWithAuthorization` never reads `HEAD` or the tree of the checkout in which the process runs. Whatever commit the process executes from, the receipt names `5fc74085…` / `7226ef00…`. A receipt from an execution at `001c3c80…` would therefore carry the basis, not the executing commit. (Addendum `IIPS_v3.0_CAP03_P1_ADOPTION_RECONCILIATION_2026-10-28.md` §2, `V1114`–`V1117`.)

**Consequence for the execution pin.** The successor act's §8 step 0 requires the executing HEAD to equal "the act-designated pin". DA-A1 (adopted) designates `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, tree `399fa44a5f1953c0f61b452420fefb5985426ef1`, and reads that coordinate as the act-designated pin. The current receipt cannot evidence that the executing HEAD matched it.

## 2. Gap against adopted DA-A1

| Adopted element (DA-A1, as adopted) | Current IPD `main` | Status |
|---|---|---|
| Receipt records the compiled basis | Yes — `basisCommit`, `basisTree` (318) | Conforms |
| Receipt records the **executing HEAD** | No | **Gap** |
| Receipt records the **executing tree** | No | **Gap** |
| Execution pin is the act-designated coordinate `001c3c80…` | Not enforced by the module | **Gap** (enforcement is not literal DA-A1 text; recorded as an open design element in §4) |
| Any other execution commit requires a new PA decision and fresh S2 evidence at that commit | Not enforced by the module | Governance rule; not a code gap, but it constrains the fix (§5) |

Because DA-A1 was adopted as written, this gap is an **adopted-requirement gap**, not an open question. It blocks P-1 authorization until resolved (see §5 and the PA status matrix).

## 3. Options (PA-5 decision; reserved to the PA)

The PA must choose one. This handoff does not choose.

| Option | What happens | Consequence |
|---|---|---|
| **A — Operator-recorded bundle** | IPD unchanged. The operator records `git rev-parse HEAD` and `HEAD^{tree}` in the evidence bundle beside the unchanged receipt. | Keeps `001c3c80…` as the execution commit and the existing S2 evidence basis. **Requires a PA amendment** to DA-A1, because DA-A1 says the *receipt* must record HEAD and tree. The module still does not enforce it. |
| **B — IPD correction, new execution pin** | A separate IPD authorization; a correction commit `C′` changes the receipt (§4) and optionally enforces the pin. | The receipt satisfies DA-A1 as written. **But the correction is a new commit, so the executing commit changes from `001c3c80…` to `C′`.** `C′` then needs: a new PA execution-pin decision; fresh S2 evidence at `C′`; the Gate 4 H-12 regeneration and QE pins re-examined (PA-2); and a P-1 authorization act naming `C′`. |
| **C — Hold P-1** | No IPD change, no amendment. P-1 remains NOT AUTHORIZED. | No new risk; no progress toward P-1. |

**Observation for the PA (inference, not a finding).** Option B is the only route on which the receipt itself meets DA-A1 as written. Option A is cheaper but needs the amendment. The choice between them is a PA decision.

## 4. Implementation specification (applies only under a separate IPD authorization; Option B)

**Files that change:** `src/persistence/gateAPrimeProvisioning.ts` and `tests/g3_gate_a_prime_successor_provisioning.test.ts`. **Files that must not change:** `src/persistence/gateAPrimeValidation.ts` (`BASIS_COMMIT`/`BASIS_TREE` are unchanged), any migration, any schema, the IPC, startup, composition, or frontend import graph (T-8).

**4.1 Resolve the executing commit and tree (new helper, e.g. `readExecutionHead(repoRoot)`).**
- Required new argument `--repo-root=<absolute path>` in `execute` mode, added to the `parseGateAPrimeArguments` allow-list (385–400). It is not read from the environment (the module already refuses `GATE_A_PRIME_*` environment values).
- Run `git -C <repoRoot> rev-parse --verify HEAD^{commit}` and `git -C <repoRoot> rev-parse --verify HEAD^{tree}` via `child_process.execFileSync` with a **sanitized environment** that drops `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_CEILING_DIRECTORIES`, and `GIT_NAMESPACE`. Keep only what Windows needs to run `git` (`PATH`, `SystemRoot`, and the user profile variables).
- Each result must match `/^[0-9a-f]{40}$/`; otherwise refuse with a new code, `EXECUTING_HEAD_UNRESOLVED`, before any store is opened.
- Resolution happens in `executeProvisioning`, **before** `openDatabase` (i.e. before line 333), so a refusal creates no store.

**4.2 Optional pin enforcement (PA decision; recommended, not required by DA-A1).** Required arguments `--execution-commit` and `--execution-tree`. If the resolved HEAD or tree differs, refuse `EXECUTION_PIN_MISMATCH` before opening a store. Without this, the receipt records the executing HEAD but does not refuse a wrong one. Adding these arguments changes the CLI contract, so the new IPD act must name them.

**4.3 Optional dirty-tree check (PA decision; not in DA-A1).** Refuse `WORKTREE_NOT_CLEAN` if `git -C <repoRoot> status --porcelain --untracked-files=all` is non-empty. Not required by DA-A1; the Gate 4 S3 preflight text should be checked before adopting it.

**4.4 Result and receipt.** Extend `GateAPrimeExecutionResult` (64–73) with `executingCommit` and `executingTree`, and return them from `executeWithAuthorization` (317–318) alongside the unchanged `basisCommit` and `basisTree`. The CLI JSON gains two fields; existing fields and their values are unchanged. The receipt remains the stdout JSON; the operator must persist it into the evidence directory (no change to file-writing behaviour is proposed).

**4.5 Tests** (new, in `tests/g3_gate_a_prime_successor_provisioning.test.ts`):
- **T-10** `--repo-root` pointing at a non-repository, or a repository with an unresolvable HEAD, refuses with `EXECUTING_HEAD_UNRESOLVED` and creates no store.
- **T-11 (success path, new coverage).** Create a temporary Git repository with one commit, pass `platform: 'win32'`, `nodeVersion: '22.22.3'`, and a store under a separate temporary directory outside that repository. Assert that `executingCommit`/`executingTree` equal the `git rev-parse` output of the fixture and that `basisCommit`/`basisTree` equal the compiled constants. The design avoids Windows by using the existing `options` injection. Feasibility on the Linux CI runner (Node `>=22.13` `node:sqlite` with a real store) is **not yet verified** and must be confirmed in the IPD pass. **It would be the first test of the success path.**
- **T-12** (only if §4.2 adopted) a mismatched `--execution-commit` refuses `EXECUTION_PIN_MISMATCH` and creates no store.
- **T-13** `GIT_DIR` (and the other redirecting variables) set in the process environment do not change the resolved HEAD. Use a fixture whose HEAD differs from the environment-named repository.
- Existing refusal tests (T-1 to T-9) must pass unchanged, except that their `args()` helper gains `repoRoot` where needed.

**4.6 Acceptance for the IPD pass.** `npm run build:tsc` (or `tsc --noEmit`) clean; `npm test` (the `scripts/run-tests.mjs` runner) green on the Linux CI runner; T-8 import-graph test unchanged and green. The Windows runtime behaviour is **not** verified by CI and must be recorded separately under a later, separately authorized host step.

## 5. Dependencies and blockers (in order)

1. **PA-5 decision** (Option A, B, or C) — reserved to the PA. No default is inferred.
2. If Option B: **separate IPD authorization** naming the files in §4 and the new CLI arguments; a new IPD act or amendment for the new argument contract.
3. If Option B: **new execution-pin designation** for `C′` by a separate PA act (DA-A1: any other execution commit needs a new PA decision), with **fresh S2 evidence at `C′`**, and PA-2 (H-12 and QE pins) re-examined.
4. **P-1 authorization act** naming the execution commit explicitly (DA-A1), only after 1–3 (or after the Option A amendment).
5. Only then: the next capture procedure (separately authorized; DC-C2 and PA-3b outstanding) and P-1 itself (separately authorized).

## 6. Explicit exclusions

- No `BASIS_COMMIT` or `BASIS_TREE` change. The successor act's `BASIS_COMMIT` is `5fc74085…`; IRR must not change it, and a replacement IPD act must not be created from the IRR workflow.
- No change to the successor act's text in IPD, no IPD branch, no IPD PR, no IPD commit, and no IPD write of any kind from this pass.
- No P-1 execution; no provisioning run; no store creation; no PowerShell or Node run of the provisioning module.
- No claim that the Windows runtime, the native harness, or L-2 passed.

## 7. Verification of this handoff (static; read-only)

| Check | Result |
|---|---|
| IPD `main` = `888eb375eebee01640e44ccdcbb138a71e8c4513` (`git ls-remote`, this pass) | Verified |
| Symbols and lines in §1 (`git show` of IPD `main` into scratch) | Verified |
| `git grep` for `BASIS_COMMIT\|basisCommit\|BASIS_TREE\|rev-parse\|HEAD` on IPD `main`: definitions only in `gateAPrimeValidation.ts` 25–26; consumers only in `gateAPrimeProvisioning.ts`; no test references `basisCommit`/`basisTree` | Verified |
| Successor-act §8 step 0 literal text has no manifest or H-12 text; "act-designated pin" is undefined in the act | Verified (addendum §1.4) |
| Execution in a Windows or Node runtime | **Not performed** |

*End of handoff. P-1 remains NOT EXECUTED, UNSPENT, and NOT AUTHORIZED.*
