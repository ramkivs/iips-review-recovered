# PR #54 — Final Integration Readiness (2026-10-11)

**Verified code head:** `cb1c75d` (remote `refs/heads/arena/2034893d-iips-review-recovered`, verified with `git ls-remote` and fresh full-history clones of the remote).
**Base:** `main` `3064a90`. **PR:** #54 (open, not draft, mergeable, merge state clean). **Not merged.**

This document is evidence-only. Its commit changes nothing under `iips-platform/`, `frontend/`, or any governance or certification path. Results below apply to `cb1c75d` unless marked otherwise. Earlier results remain attributed to the commits they were measured on: `6704c4d` (655/655), `b70d430` (656/656 and controls C0–C7).

## 1. Commit chain
`3064a90` (main) → `6704c4d` remediation → `9c57227` evidence → `b70d430` A13 adapter pin + wp11/wp14 types → `e89d388` evidence → `cb1c75d` wp7 type narrowing.

Changes since the last platform verification at `b70d430`: `cb1c75d` changes one test file (`program-v2.0-wp7-workflow.test.ts`). Changes since `e89d388`: the same single file. Frontend: 0 files changed since `e89d388`.

## 2. Frontend gate — CLOSED (previously blocked)
- Cause of prior block: `frontend/node_modules` absent.
- Install: `npm ci --no-audit --no-fund` in `frontend/` (lockfile v3, 231 packages). First attempt failed with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on `codeload.github.com` for the git dependency `iips-production-market-data`. `curl` reached the same host (HTTP 200). The certificate is issued by the sandbox proxy CA ("E2B Proxy CA"), which is in the system trust bundle but not in Node's bundled CA list. The second attempt set `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` for that command only. Full verification stayed on. No TLS bypass was used.
- Result: `added 184 packages`, exit 0. Manifest and lockfile unchanged. No tracked files changed. npm states it skips integrity checks for git dependencies; the dependency is pinned by commit `2e11fa3b…`.
- Typecheck (`tsc --noEmit`): exit 0, 0 errors (run on `cb1c75d`).
- Tests (`vitest run`): **66 files passed, 3 skipped; 993 tests passed, 25 skipped** (exit 0, run on `cb1c75d`). The skipped files are `server/live/{live-tenant-engine,admin-live-certification,ai-advisory-live-certification}.test.ts`. They are gated by `describe.skipIf(!kcUp)` and skip when no Keycloak answers at `localhost:8080`. They were **not run and are not counted as passing.** They are live-environment certification tests and were not changed by this PR.
- Build (`tsc -b && vite build`): exit 0, output in git-ignored `dist/`.
- Git state after install, tests and build: clean.

## 3. `wp7` diagnostic disposition — FIXED (type-only)
- Diagnostics: TS2571 "Object is of type 'unknown'" at lines 95, 129, 135 of `program-v2.0-wp7-workflow.test.ts`.
- Cause: `WorkflowResult.nodeOutputs` is typed `Record<string, unknown>`, and the test reads `.composite` without narrowing. The runtime value is correct (engine metadata carries `composite`).
- Classification: test-authoring defect, not a runtime defect. `wp7` passed 12/12 before and after.
- Fix: explicit assertion to `{ composite: number }` at the three accesses. The equality assertions against the frozen baseline are unchanged.
- Result on `cb1c75d`: `wp7` 12/12 pass; scoped regression typecheck exit 0.

## 4. Remaining type errors outside this PR (documented, not blocking)
- `tests/` tree on `main` (`3064a90`): **62** TS errors in 25 files.
- Tree on `cb1c75d`: **57** TS errors in 22 files. The 5 removed are the wp7, wp11 and wp14 errors fixed in this PR.
- Diff of the two error sets shows only removals. **This PR introduces zero type errors.** None of the 57 are in the 12 test files this PR changes.
- Why not blocking: the repo's `tsconfig.json` includes only `src/`, so `npm run typecheck` (the repo gate, exit 0) does not cover tests. Tests run through `tsx`, which does not type-check, and they pass at runtime.
- Concrete impact: type-safety gaps in pre-existing tests, with no runtime effect in this verification. Fixing them means changing 22 files outside the remediation, and adding a test typecheck gate would be a tooling decision. Both are out of scope for this PR.

## 5. Platform and A13 acceptance on `cb1c75d`
- **Full suite, CRLF** (`core.autocrlf=true`, full-history clone of the remote): **656 / 656**, 0 fail, 0 skip.
- **Full suite, LF** (full-history clone of the remote): **656 / 656**, 0 fail, 0 skip.
- **49 original failures:** all 49 exact test titles from the committed pre-fix run (`run-summaries.txt`) PASS in the CRLF run. 0 `not ok` lines.
- **A13 negative controls on `cb1c75d`** (CRLF clone, reset between controls):

| Control | Expected | Result |
|---|---|---|
| C0 clean | PASS | PASS |
| C1 modified protected engine | FAIL | FAIL (detected) |
| C2 staged new file in protected dir | FAIL | FAIL (detected) |
| C3 out-of-scope A13 record edit | PASS | PASS |
| C4 modified allowlisted adapter | FAIL | FAIL (detected) |
| C5 authorized adapter change with pin updated | PASS | PASS |
| C7 protected file renamed out of tree | FAIL | FAIL (detected) |

C6 (adapter deleted) fails at module load, not through the guard message. This was recorded at `b70d430`; the A13 test is unchanged since then.
- **Focused on `cb1c75d`:** `wp11` 10/10, `wp14` 12/12, `wp7` 12/12.
- **Repo typecheck (`src/`) on `cb1c75d`:** exit 0.

## 6. Final diff review (PR #54, `origin/main...HEAD`)
- 20 files, +564/−38, all under `iips-platform/tests/`, `evidence/integration/…/`, or `.gitattributes`. No `src/`, `package.json`, lockfile, `frontend/`, governance, certification, or `program-v1.1-certification` change.
- Suppression scan of added lines: 0 occurrences each of `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `eslint-disable`, `as any`, `.skip(`, `.only(`, `*.todo`, `assert.ok(true`, `process.exit`, `NODE_TLS`, `strict-ssl`.
- Removed assertion lines (14) were each replaced by an assertion of the same kind: 10 count assertions → `BASELINE.sectors.length`; 3 `wp7` accesses → typed accesses; 1 A13 `assert.ok(` opener → `assert.deepEqual`.
- Test titles: the A13 test title is byte-identical. The new control is additive.
- "M2 package": no code package named M2 exists. The only M2 artifact is `evidence/intelligence-data-supply-governance/GATE-Y-M2-INTELLIGENCE-DATA-AUTHORIZATION-ACT.md`, a governance act document. The PR does not touch it or any `*m2*` path.

## 7. Evidence durability
- Evidence folder is tracked on the branch, and the remote branch contains it at `cb1c75d`.
- Raw logs remain gitignored (`*.log`) and outside the repo. Their totals and failing identities are in `run-summaries.txt`.
- Install log summaries are recorded in §2 above. The git-dependency TLS fix was an environment trust setting for one command, not a repo change.

## 8. Governance and boundary
- The 10-engine LTS remains the only authoritative certification. No certification record was changed. 13-engine certification is not claimed.
- The 13-engine delta-certification governance decision remains outstanding. It is a separate governance item and does not change any verified technical result.

## 9. Open items at integration (not technical gates)
1. Explicit merge authority from the user (this PR is not merged).
2. Windows `core.autocrlf=true` working copies must re-checkout the eight byte-asserted files after pulling (`git ls-files --eol` should show `attr/text eol=lf`, `w/lf`).
3. 25 environment-gated live Keycloak tests were skipped, not run, not claimed.
4. Pre-existing test-tree type debt (57 errors, 22 files) outside this PR.
5. Label debt: some test titles still say "10"; kept for failure-identity stability.

## 10. Conclusion
**READY FOR EXPLICIT MERGE AUTHORITY.**
All technical acceptance gates pass on `cb1c75d`: the platform suite passes under LF and CRLF, all 49 original failures pass by exact title, the A13 controls are as expected, the frontend typecheck/test/build gate is closed, the repo typecheck passes, and the diff is confined to tests and evidence. Remaining items are a merge authorization decision, an operational Windows step, documented environment skips, and pre-existing debt. None of them is a technical blocker for this PR.
