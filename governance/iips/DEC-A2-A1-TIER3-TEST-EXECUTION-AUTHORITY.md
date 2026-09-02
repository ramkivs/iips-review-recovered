# DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY

- **Record ID:** `DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY`
- **Title:** A2 -> A1 Tier-3 Test-Execution Authority -- Exact-Scope Grant to Execute the Twelve Existing Tier-3 Regression Test Files (IES-016/017/020; Execution Only; No Artifact Writes; No Git Mutation)
- **Class:** `DECISION / AUTHORITY`
- **Status:** `RECORDED - EXECUTION AUTHORITY ONLY FOR THE TWELVE EXACT FILES BELOW. NO ARTIFACT CREATION/AMENDMENT. NO GIT WRITE. NO A2 -> A1 STATUS FLIP. NO MATRIX AMENDMENT. NO CERTIFICATION. NO PROMOTION. NO RELEASE/TAG.`
- **Date/time:** 2026-09-02 (Asia/Calcutta, +05:30); exact recording time is the commit timestamp of this record
- **Authority relationship:** authority-recording gate `A2 -> A1 TIER-3 TEST-EXECUTION AUTHORITY RECORDING GATE`. `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY` (arena `809ebf9c9face0679f3c7053232f756180b72c73`) grants product artifact creation/amendment only and grants no execution. `DEC-A2-A1-TEST-EXECUTION-AUTHORITY` (arena `23cbbf8d9b24959d51ae04ff04372d5acb20a293`) covers only the six named Tier-2 regression test files, has been executed, and is exhausted. Neither record authorizes execution of the twelve Tier-3 test files below; this record is the explicit, narrowly scoped execution grant. Recording authority for this record is scoped to `governance/iips/` on `arena/01a03e3b-iips-review-recovered` only (D6).
- **Scope:** execution of the twelve exact, existing, tracked test files listed in section 3, by the exact command in section 4, in the exact pinned product state in sections 2 and 5, producing only the console evidence in section 6. No other path, no artifact write, no Git mutation, no status change is authorized.
- **Provenance:** produced after (a) `A2-A1 MUTATION GATE 1 PASS` and the successful Tier-2 execution under `DEC-A2-A1-TEST-EXECUTION-AUTHORITY` (36 subtests, 36 passed, 0 failed, exit code 0, product HEAD `100a90237d4ac3db29d10019423b67afe99e2819`), and (b) the Tier-3 freeze-manifest refresh committed and pushed as `phase13-next` `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36` (parent `100a9023`; exactly three files changed: `ies-016-telecommunications/IES-016_FREEZE_MANIFEST.json`, `ies-017-automobile/IES-017_FREEZE_MANIFEST.json`, `ies-020-materials-metals/IES-020_FREEZE_MANIFEST.json`). Read-only discovery verified the twelve files, their byte identities, their import closure, and that the source/test/package closure is unchanged between `100a9023` and `ff1c90e`. No Tier-3 test has been executed at `ff1c90e`; no current Tier-3 execution evidence exists at the time of this record.
- **Supersession / revision relationship:** supersedes none; amends none. `DEC-A2-A1-TEST-EXECUTION-AUTHORITY`, `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY`, `DEC-A2-A1-CLOSURE-STRATEGY`, `DEC-A2-A1-TIER3-CREATION-AUTHORITY`, `DEC-D5-EVIDENCE-MATURITY`, `DEC-D5-S1-REGRESSION-EVIDENCE`, `DEC-D5-S3-EVIDENCE-DEBT`, `DEC-D6-DURABLE-RECORDING-POLICY`, `DEC-D15-VERIFICATION-METHODOLOGY`, `DEC-D36-TIER3-DOCUMENTATION-PARITY-AUTHORITY` and all other referenced records are unchanged.

---

## 1. GOVERNANCE BASIS

This authority is recorded against and references:

- D5 (evidence maturity);
- D5-S1 (four-kind regression evidence standard: acceptance, framework-integration, reuse-verification, wp4-validation);
- D5-S3 (A2 evidence-debt disposition);
- D6 (durable recording location: `governance/iips/` on `arena/01a03e3b-iips-review-recovered`);
- D7 (A2/A1 evidence-debt disposition; `D7-TIER3-PARITY` and `D7-TIER3-INDEPENDENCE` remain open);
- D15 (role separation plus clean-workspace reproducibility; the execution operator acts as executor, not as verifier);
- D25 (Tier-3 evidentiary standard);
- D28 (fence-4/fence-8 relief that created the six Tier-3 framework-integration and reuse-verification files at `33838ac`);
- D30 (execution lineage `phase13-next`);
- D36 (Tier-3 documentation-parity set, 63 files at `0a8e287`);
- `DEC-A2-A1-CLOSURE-STRATEGY`;
- `DEC-A2-A1-TIER3-CREATION-AUTHORITY`;
- `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY` (creation/amendment grant only; execution NOT granted by that record);
- `DEC-A2-A1-TEST-EXECUTION-AUTHORITY` (six Tier-2 files only; executed; exhausted).

The previous durable authorities did NOT grant execution of the twelve Tier-3 files. This record exists to fill that gap explicitly and narrowly.

## 2. EXECUTION LINEAGE AND PIN

- **Product repository root:** `G:\IIPS\phase13-next-authority`
- **Branch:** `phase13-next` (symbolic ref `refs/heads/phase13-next`; detached HEAD not permitted)
- **HEAD:** `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36`
- **origin/phase13-next:** `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36`
- **Working directory for the command:** `G:\IIPS\phase13-next-authority\iips-platform`

## 3. EXACT EXECUTION SCOPE (twelve existing files; byte-pinned)

All twelve files are existing, tracked files at HEAD `ff1c90e` (each with a single-revision history; none was created by this or any other A2 -> A1 gate). None of them is one of the six untracked Tier-2 test files. Paths are relative to the product repository root.

| Standard | Path | Bytes | SHA-256 | Subtests |
|---|---|---:|---|:-:|
| IES-016 | `iips-platform/tests/regression/telecommunications-acceptance.test.ts` | 13693 | `2bf45b69cf58fd89c86cc8559bcb0801a37e2b2ca76acbe62808864d5de8ebf1` | 13 |
| IES-016 | `iips-platform/tests/regression/telecommunications-framework-integration.test.ts` | 12138 | `ded96a3929bfd583ab1099c28b28979c2a9a471432e920ea0b1951c9a07a3b61` | 7 |
| IES-016 | `iips-platform/tests/regression/telecommunications-reuse-verification.test.ts` | 10259 | `d8ec7b9411b72dad08aea162eada516f6ea07dc6e61728748ea604bbd49852a1` | 4 |
| IES-016 | `iips-platform/tests/regression/telecommunications-wp4-validation.test.ts` | 7401 | `60aa5d1e5c796bc7eaf4599d46000c5359f298e2591b8e646e1ebfa8042a4fc1` | 5 |
| IES-017 | `iips-platform/tests/regression/automobile-acceptance.test.ts` | 13183 | `35d8f133beb6df7a90ee06bbd272d52ed8f3690c95acdb545b2dabcd79bb0a87` | 13 |
| IES-017 | `iips-platform/tests/regression/automobile-framework-integration.test.ts` | 11970 | `188b8a281609ee2bc3a7515c75773fb0b7dc8d8956527f93fd7b9aeebd2480a4` | 7 |
| IES-017 | `iips-platform/tests/regression/automobile-reuse-verification.test.ts` | 10143 | `c52b2ad6cc7d75c0ffb389c3d3cbc4771774bf0d11416eec7fa663ad127b62bc` | 4 |
| IES-017 | `iips-platform/tests/regression/automobile-wp4-validation.test.ts` | 7245 | `b3f8e695e5103ed16e3ee63142edc56650dd893daf66e0f2e477e72954f2effc` | 5 |
| IES-020 | `iips-platform/tests/regression/materials-metals-acceptance.test.ts` | 13404 | `705e459d4af95e943a2d06e4aadebf2b89401b9fc0f7ffe07ac0c1cd1a097757` | 13 |
| IES-020 | `iips-platform/tests/regression/materials-metals-framework-integration.test.ts` | 12141 | `7cc13c1c178c33e715495d002c7fbec4ede493fe6fbb72467f4e8ecb85367bd9` | 7 |
| IES-020 | `iips-platform/tests/regression/materials-metals-reuse-verification.test.ts` | 10275 | `d360930970dbce9cd85bc67b40cb408a1060c3a974a3ebcddf0f5847e5857a14` | 4 |
| IES-020 | `iips-platform/tests/regression/materials-metals-wp4-validation.test.ts` | 7367 | `7daa7da3afbc6fe408ae15f63fc311ec6daff63977698bbd2ccc4f8a648307be` | 5 |

Total expected subtests: 87 (29 per standard). The twelve files must be byte-identical to this table immediately before and immediately after execution. Any difference voids the execution.

Verified read-only properties of the twelve files: imports limited to `node:assert/strict`, `node:fs`, `node:path`, `node:test` and `../../src/**`; `node:fs` used for `readFileSync` only; no file writes, child processes, network access or `process.exit`; no reference to any freeze manifest, to `ies-012`..`ies-015`, or to the four protected calibration files.

## 4. AUTHORIZED COMMAND (exact; nothing else)

From `G:\IIPS\phase13-next-authority\iips-platform`:

```
npx --no-install tsx --test tests/regression/telecommunications-acceptance.test.ts tests/regression/telecommunications-framework-integration.test.ts tests/regression/telecommunications-reuse-verification.test.ts tests/regression/telecommunications-wp4-validation.test.ts tests/regression/automobile-acceptance.test.ts tests/regression/automobile-framework-integration.test.ts tests/regression/automobile-reuse-verification.test.ts tests/regression/automobile-wp4-validation.test.ts tests/regression/materials-metals-acceptance.test.ts tests/regression/materials-metals-framework-integration.test.ts tests/regression/materials-metals-reuse-verification.test.ts tests/regression/materials-metals-wp4-validation.test.ts
```

- Twelve explicit paths only, in the order above. No globs. No `npm test` (its script runs `src/**/*.test.ts tests/regression/*.test.ts`, i.e. the entire suite including the six untracked Tier-2 files). No `--watch`. No coverage, reporter-to-file, or any flag that writes to disk.
- `--no-install` is mandatory: if `tsx` is not already resolvable from the existing local `node_modules`, execution MUST stop; installation is prohibited.
- Expected resolved runtime: `tsx@4.23.9` (per `iips-platform/package-lock.json` at HEAD). The actually resolved version is evidence, not a precondition.

## 5. PRE-EXECUTION PREREQUISITES (dirty-state definition)

A clean worktree is NOT required and MUST NOT be imposed. The only valid pre-state is:

1. Root, branch, HEAD and `origin/phase13-next` exactly as in section 2.
2. Node.js >= 18 (>= 20 recommended); `npm` present; `iips-platform/node_modules` already present with `tsx` resolvable (no install permitted to satisfy this); expected `tsx` 4.23.9.
3. `git status --porcelain=v1 --untracked-files=all` contains EXACTLY ten entries:
   - `' M'` for each of the four protected calibration files;
   - `??` for each of the six Tier-2 test files created under `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY`;
   - nothing else. `git diff --cached --name-only` is empty.
4. Four protected calibration files retain their recorded raw-byte SHA-256:
   - `ies-012-utilities/calibration/utilities-calibration-1.0.0.json` = `cd60d644c92f999cc6484b31ae3842376ced07c7727fe5dd7b13a67a7f2f0ab8`
   - `ies-013-consumer/calibration/consumer-calibration-1.0.0.json` = `2c25fa39cb85f4202eafb0f57c08996aa4c6cd0619c7f462f3a8ca118833b0c9`
   - `ies-014-industrials/calibration/industrials-calibration-1.0.0.json` = `abaa02d0c96055febbc69a3175b28d354aed515fe9695acb089fd3f849ee05be`
   - `ies-015-technology/calibration/technology-calibration-1.0.0.json` = `9be45e06c953711a7c3202ac8b4fc5d6337dc9c59189f0a2c5f45485d729a06d`
   These files must not be reset, normalized, staged, rewritten, or otherwise touched.
5. Six untracked Tier-2 test files retain their recorded SHA-256 (all under `iips-platform/tests/regression/`):
   - `banking-framework-integration.test.ts` = `a8199e4c6759e99f63eca190cf0acb3746f279b0f9679084c87b4fc0ba9c6394`
   - `banking-reuse-verification.test.ts` = `e18b7727c1f1051638596e0b6fb815d10f79c3cdeece35172ab924f889b66912`
   - `banking-wp4-validation.test.ts` = `f226775dcad92220ff9e33b075931c46136f91ac3959c736dfec2afc5ecbe239`
   - `insurance-wp4-validation.test.ts` = `2e101a69d42adf4b2ec3031f7eb8153460665960b610d2a5a1a3045236a3575f`
   - `capital-markets-wp4-validation.test.ts` = `f21f57cc6edc17a53119e46adff460b539741bb0c589b5cb92b2a11938adf698`
   - `healthcare-wp4-validation.test.ts` = `96666d53be25048a1a0e0130d08aac84509ba9a470727a66019693b59b76887e`
   These files are outside the execution scope and must not be executed, modified, staged, or otherwise touched.
6. Twelve Tier-3 files are tracked (`git ls-files` lists all twelve), absent from `git diff --name-only`, and match section 3 (bytes + SHA-256).
7. Any prerequisite failure => do not execute; record the failure; stop.

## 6. MANDATORY EXECUTION EVIDENCE

The execution is valid only if ALL of the following are captured (console/transcript only; no file may be written inside the product repository):

- exact working directory and exact command line executed;
- complete console transcript (stdout + stderr, TAP output included);
- process exit code;
- `node --version`, `npm --version`, and the `tsx` version actually resolved (e.g. `npx --no-install tsx --version`);
- UTC timestamp of start and end;
- operator identity and machine identity;
- pre-execution `git status --porcelain=v1 --untracked-files=all` and `git rev-parse HEAD`;
- post-execution `git status --porcelain=v1 --untracked-files=all` and `git rev-parse HEAD`;
- pre- and post-execution SHA-256 of all twelve Tier-3 test files (section 3);
- pre- and post-execution SHA-256 of all four protected calibration files (section 5.4);
- pre- and post-execution SHA-256 of all six untracked Tier-2 test files (section 5.5);
- explicit confirmation that pre and post status are identical (exactly the four protected `' M'` entries and the six `??` entries), the index is empty, HEAD is unchanged, all twenty-two hashes are unchanged, and no new untracked/modified/staged path exists.

Expected result: 87 subtests, 0 failures, 0 cancelled, 0 skipped, 0 todo, exit code 0. A differing count or status is evidence requiring review; it is NOT automatic success and NOT automatic failure of this authority.

Evidence is to be presented to the next gate. Durable recording of that evidence requires a subsequent authority; this record does not grant it.

## 7. POSTCONDITION

Immediately after execution the product repository must have:

- exactly the same ten status entries as before execution;
- an empty index;
- HEAD unchanged at `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36`;
- all twenty-two recorded hashes unchanged;
- no newly created file anywhere in the repository (including under `iips-platform/`, `ies-0xx-*/`, coverage or cache directories).

Any deviation voids the execution result and requires STOP and human review. No automatic rollback is authorized.

## 8. EXPLICITLY PROHIBITED

During and as a consequence of this execution, the following are prohibited:

- modifying any test, source, fixture, helper, or configuration file;
- installing dependencies (`npm install`, `npm ci`, `npx` with install, any package manager);
- changing `package.json`, `package-lock.json`, or any manifest;
- generating fixtures or expected outputs (including `contract-tests/generate_expected_outputs.py`);
- build or typecheck operations (`tsc`, `npm run typecheck`, any bundler);
- writing transcripts, logs, evidence files, reports, manifests, or certificates into the product repository;
- executing any test file other than the twelve in section 3;
- executing `npm test`, the full regression suite, or `src/**/*.test.ts`;
- using globs or directory arguments;
- executing, modifying, staging, or touching the six untracked Tier-2 test files;
- modifying the four protected calibration files;
- modifying the three refreshed freeze manifests (`IES-016`, `IES-017`, `IES-020`);
- modifying `iips-platform/IES016_INDEPENDENT_VERIFICATION_REPORT.md`, `IES017_...`, or `IES020_...`;
- creating or amending any final-readiness or implementation-readiness certificate;
- amending the Integration Verification Matrix or the Engine Master Matrix (or the Screenshot-to-Certified-Product Parity Matrix);
- any A2 -> A1 status change;
- certification, promotion, release, or tagging;
- `git add` / `git commit` / `git push` / `git stash` / `git reset` / `git checkout` / `git restore` / `git clean` / `git tag` or any Git write;
- D5 / D5-S1 / D5-S3 changes or reopen;
- D36 / D36-A changes or reopen;
- E2E-019;
- H / I / J;
- fence-9 work;
- any path outside the twelve named tests.

## 9. GOVERNANCE BOUNDARY

This record authorizes execution only. It authorizes no product artifact creation or amendment; no independent-verification report amendment; no final-readiness certificate; no A2 -> A1 status change; no matrix amendment; no certification, promotion, release, or tag. It changes no implementation or calibration, reopens no D5/D5-S1/D5-S3, D36/D36-A or E2E-019 decision, executes no H/I/J, relieves no fence-9, and does not itself record execution results. Durable recording of execution results requires a subsequent, separately granted authority.

## 10. EVIDENCE STANDING AT THE TIME OF THIS RECORD

- **Current product state:** `phase13-next` `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36` (Tier-3 freeze-manifest refresh). The refreshed manifests carry no test-execution claim.
- **Tier-2 execution evidence** (36/36 at `100a9023`) concerns IES-006.2A/007/008/009 only and establishes nothing for IES-016/017/020.
- **Stale Tier-3 evidence:** `iips-platform/IES016_INDEPENDENT_VERIFICATION_REPORT.md`, `IES017_...` and `IES020_...` record executions of 2026-08-30 against `phase13-next` `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` (11/11 per standard, 33/33, 87/87), under a role-separated (not organizationally independent) model. They predate `0a8e287` (D36) and `ff1c90e` and are historical only for current purposes; they are not current execution evidence and are not modified by this record.
- **Current Tier-3 execution evidence at `ff1c90e`:** none exists. Producing it is the sole purpose of this authority.

## 11. D7 BOUNDARY

`D7-TIER3-PARITY` and `D7-TIER3-INDEPENDENCE` remain OPEN. Executing the twelve tests under this authority does not close, narrow, or re-decide either item, and does not by itself satisfy any limb of A1 for IES-016, IES-017 or IES-020.

# **DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY RECORDED - EXECUTION SCOPE ONLY - STOP FOR EXECUTION GATE**
