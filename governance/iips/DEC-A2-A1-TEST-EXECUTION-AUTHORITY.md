# DEC-A2-A1-TEST-EXECUTION-AUTHORITY

- **Record ID:** `DEC-A2-A1-TEST-EXECUTION-AUTHORITY`
- **Title:** A2 -> A1 Test-Execution Authority -- Exact-Scope Grant to Execute the Six Named Tier-2 Regression Test Files (Execution Only; No Artifact Writes; No Git Mutation)
- **Class:** `DECISION / AUTHORITY`
- **Status:** `RECORDED - EXECUTION AUTHORITY ONLY FOR THE SIX EXACT FILES BELOW. NO ARTIFACT CREATION/AMENDMENT. NO GIT WRITE. NO A2 -> A1 STATUS FLIP. NO MATRIX AMENDMENT. NO CERTIFICATION. NO PROMOTION. NO RELEASE/TAG.`
- **Date/time:** 2026-09-02 (Asia/Calcutta, +05:30); exact recording time is the commit timestamp of this record
- **Authority relationship:** authority-recording gate `A2 -> A1 TEST-EXECUTION AUTHORITY RECORDING GATE`. `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY` (arena `809ebf9c9face0679f3c7053232f756180b72c73`) granted creation of the six files only and did NOT grant execution; this record is the explicit, narrowly scoped execution grant. Recording authority for this record is scoped to `governance/iips/` on `arena/01a03e3b-iips-review-recovered` only (D6).
- **Scope:** execution of the six exact test files listed in section 3, by the exact command in section 4, in the exact pinned product state in sections 2 and 5, producing only the console evidence in section 6. No other path, no artifact write, no Git mutation, no status change is authorized.
- **Provenance:** produced after `A2-A1 MUTATION GATE 1 PASS` on the Windows product checkout `G:\IIPS\phase13-next-authority`, which created the six files unstaged/uncommitted and left the four protected calibration modifications byte-identical, and after `P1 POST-CREATION VALIDATION PASS`, which reconciled all six artifacts against the frozen Gate-1 manifest. Gate 1 executed no tests; no execution evidence exists at the time of this record.
- **Supersession / revision relationship:** supersedes none; amends none. `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY`, `DEC-A2-A1-CLOSURE-STRATEGY`, `DEC-A2-A1-TIER3-CREATION-AUTHORITY`, `DEC-D5-EVIDENCE-MATURITY`, `DEC-D5-S1-REGRESSION-EVIDENCE`, `DEC-D5-S3-EVIDENCE-DEBT`, `DEC-D6-DURABLE-RECORDING-POLICY`, `DEC-D36-TIER3-DOCUMENTATION-PARITY-AUTHORITY` and all other referenced records are unchanged.

---

## 1. GOVERNANCE BASIS

This authority is recorded against and references:

- D5 (evidence maturity);
- D5-S1 (four-kind regression evidence standard);
- D5-S3 (A2 evidence-debt disposition);
- D6 (durable recording location: `governance/iips/` on `arena/01a03e3b-iips-review-recovered`);
- D7 (A2/A1 evidence-debt disposition);
- D30 (execution lineage `phase13-next`);
- `DEC-A2-A1-CLOSURE-STRATEGY`;
- `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY` (creation grant only; execution NOT granted by that record).

The previous durable authority did NOT grant execution. This record exists to fill that gap explicitly and narrowly.

## 2. EXECUTION LINEAGE AND PIN

- **Product repository root:** `G:\IIPS\phase13-next-authority`
- **Branch:** `phase13-next` (symbolic ref `refs/heads/phase13-next`; detached HEAD not permitted)
- **HEAD:** `100a90237d4ac3db29d10019423b67afe99e2819`
- **origin/phase13-next:** `100a90237d4ac3db29d10019423b67afe99e2819`
- **Working directory for the command:** `G:\IIPS\phase13-next-authority\iips-platform`

## 3. EXACT EXECUTION SCOPE (six files; byte-pinned)

| Path (relative to product repository root) | Bytes | SHA-256 | Tests |
|---|---:|---|:-:|
| `iips-platform/tests/regression/banking-framework-integration.test.ts` | 7307 | `a8199e4c6759e99f63eca190cf0acb3746f279b0f9679084c87b4fc0ba9c6394` | 6 |
| `iips-platform/tests/regression/banking-reuse-verification.test.ts` | 6935 | `e18b7727c1f1051638596e0b6fb815d10f79c3cdeece35172ab924f889b66912` | 6 |
| `iips-platform/tests/regression/banking-wp4-validation.test.ts` | 15794 | `f226775dcad92220ff9e33b075931c46136f91ac3959c736dfec2afc5ecbe239` | 6 |
| `iips-platform/tests/regression/insurance-wp4-validation.test.ts` | 16330 | `2e101a69d42adf4b2ec3031f7eb8153460665960b610d2a5a1a3045236a3575f` | 6 |
| `iips-platform/tests/regression/capital-markets-wp4-validation.test.ts` | 16305 | `f21f57cc6edc17a53119e46adff460b539741bb0c589b5cb92b2a11938adf698` | 6 |
| `iips-platform/tests/regression/healthcare-wp4-validation.test.ts` | 15976 | `96666d53be25048a1a0e0130d08aac84509ba9a470727a66019693b59b76887e` | 6 |

The six files must be byte-identical to this table immediately before and immediately after execution. Any difference voids the execution.

## 4. AUTHORIZED COMMAND (exact; nothing else)

From `G:\IIPS\phase13-next-authority\iips-platform`:

```
npx --no-install tsx --test tests/regression/banking-framework-integration.test.ts tests/regression/banking-reuse-verification.test.ts tests/regression/banking-wp4-validation.test.ts tests/regression/insurance-wp4-validation.test.ts tests/regression/capital-markets-wp4-validation.test.ts tests/regression/healthcare-wp4-validation.test.ts
```

- Six explicit paths only. No globs. No `npm test`. No `--watch`. No coverage, reporter-to-file, or any flag that writes to disk.
- `--no-install` is mandatory: if `tsx` is not already resolvable from the existing local `node_modules`, execution MUST stop; installation is prohibited.
- Expected resolved runtime: `tsx@4.23.9` (per `iips-platform/package-lock.json` at HEAD). The actually resolved version is evidence, not a precondition.

## 5. PRE-EXECUTION PREREQUISITES (dirty-state definition)

A clean worktree is NOT required and MUST NOT be imposed. The only valid pre-state is:

1. Root, branch, HEAD and `origin/phase13-next` exactly as in section 2.
2. `git status --porcelain=v1 --untracked-files=all` contains EXACTLY ten entries:
   - `' M'` for each of the four protected calibration files;
   - `??` for each of the six files in section 3;
   - nothing else. `git diff --cached --name-only` is empty.
3. Four protected calibration files retain their recorded raw-byte SHA-256:
   - `ies-012-utilities/calibration/utilities-calibration-1.0.0.json` = `cd60d644c92f999cc6484b31ae3842376ced07c7727fe5dd7b13a67a7f2f0ab8`
   - `ies-013-consumer/calibration/consumer-calibration-1.0.0.json` = `2c25fa39cb85f4202eafb0f57c08996aa4c6cd0619c7f462f3a8ca118833b0c9`
   - `ies-014-industrials/calibration/industrials-calibration-1.0.0.json` = `abaa02d0c96055febbc69a3175b28d354aed515fe9695acb089fd3f849ee05be`
   - `ies-015-technology/calibration/technology-calibration-1.0.0.json` = `9be45e06c953711a7c3202ac8b4fc5d6337dc9c59189f0a2c5f45485d729a06d`
   These files must not be reset, normalized, staged, rewritten, or otherwise touched.
4. Six files match section 3 (bytes + SHA-256).
5. `iips-platform/node_modules` already present with `tsx` resolvable (no install permitted to satisfy this).
6. Any prerequisite failure => do not execute; record the failure; stop.

## 6. MANDATORY EXECUTION EVIDENCE

The execution is valid only if ALL of the following are captured (console/transcript only; no file may be written inside the product repository):

- exact command line executed and working directory;
- full console transcript (stdout + stderr, TAP output included);
- process exit code;
- `node --version`, `npm --version`, and the `tsx` version actually resolved (e.g. `npx --no-install tsx --version`);
- UTC timestamp of start and end;
- operator identity and machine identity where available;
- pre-execution `git status --porcelain=v1 --untracked-files=all`, `git rev-parse HEAD`, and the ten SHA-256 values (four protected + six tests);
- post-execution `git status --porcelain=v1 --untracked-files=all`, `git rev-parse HEAD`, and the same ten SHA-256 values;
- explicit confirmation that pre and post status are identical (exactly the four protected `' M'` entries and the six `??` entries), HEAD is unchanged, and no new untracked/modified/staged path exists.

Evidence is to be presented to the next gate. Durable recording of that evidence, if any, requires a separate authority; this record does not grant it.

## 7. EXPLICITLY PROHIBITED

During and as a consequence of this execution, the following are prohibited:

- artifact writes of any kind (no evidence artifact, report, manifest, certificate, or log file may be created or amended inside the product repository);
- modifying any test, source, fixture, helper, or configuration file;
- installing dependencies (`npm install`, `npm ci`, `npx` with install, any package manager);
- changing `package.json`, `package-lock.json`, or any manifest;
- `git add` / `git commit` / `git push` / `git stash` / `git reset` / `git checkout` / `git restore` / `git clean` or any Git write;
- modifying the four protected calibration files;
- modifying Tier-3 freeze manifests, verification reports, or certificates;
- modifying the Integration Verification Matrix, Engine Master Matrix, or Screenshot-to-Certified-Product Parity Matrix;
- any A2 -> A1 status change;
- certification, promotion, release, or tagging;
- D5 / D5-S1 / D5-S3 changes;
- D36 changes or reopen;
- E2E-019;
- H / I / J;
- fence-9;
- executing any test file other than the six in section 3, including `npm test`, globbed execution, the full regression suite, or `src/**/*.test.ts`;
- build operations or artifact generation of any kind;
- any path outside the six named tests.

## 8. BOUNDARIES

This record authorizes execution only. It grants no artifact creation or amendment authority, changes no capability status, flips no A2 to A1, amends no matrix, certifies nothing, creates no release/tag, promotes nothing, changes no implementation/calibration, creates or amends no evidence artifact, reopens no D5/D5-S1/D5-S3, D36 or E2E-019 decision, executes no H/I/J, relieves no fence-9, and does not itself record execution results.

# **DEC-A2-A1-TEST-EXECUTION-AUTHORITY RECORDED - EXECUTION SCOPE ONLY - STOP FOR EXECUTION GATE**
