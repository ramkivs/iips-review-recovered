# CAP-03 P-1 Revision 7 — post-CI boundary and readiness reconciliation

**Record ID:** `IIPS-V3-CAP03-P1-REV7-POST-CI-BOUNDARY-RECONCILIATION-2026-10-30-01`  
**Tracker allocation:** §16.223 / `CV-CORR-203` / `CHG-2026-10-31-03` / `V1728`–`V1737`  
**Scope:** IRR-only review, workflow correction, and documentation. No IPD repository read/write by the agent; no host or local-filesystem investigation; no ACL change; no P-1 operation, provisioning, evidence/claim/marker/store artifact, consuming test, S2 rerun, or PR merge.

## 1. Independent workflow and commit reconciliation

At the start of this reconciliation, PR #382 head and branch ref were `698920a8c7a43801cafd592129401ea6c399b75d` (tree `8f869288b5a187aa104b8335b04e4ed0fb02eab5`). Authoritative `main` remained `f6ae5ebd8552990fc156f7a4c9a6a1110b22a413`; it is an ancestor of the PR head. No newer main commit or main-side conflict was found, so no rebase/merge reconciliation was needed. PR #382 was OPEN, UNMERGED, MERGEABLE, with `mergeStateStatus: CLEAN` at the check; it remains open and unmerged by instruction.

| Run | Conclusion | Exact head | Independent result |
|---|---|---|---|
| Generic CI `41102065894` | SUCCESS | `698920a8c7a43801cafd592129401ea6c399b75d` | Current-head job `Typecheck · Test · Build` succeeded |
| IRR-only static checks `41102065682` | SUCCESS | `698920a8c7a43801cafd592129401ea6c399b75d` | Current-head IRR-only run succeeded |
| Older generic CI `41101977469` | CANCELLED | `5dd5b9f227be9652f10a99d49887d3e1093929ab` | Older-head run was cancelled |
| Older IRR-only static checks `41101976326` | SUCCESS | `5dd5b9f227be9652f10a99d49887d3e1093929ab` | Older-head IRR-only run succeeded |

The successful current-head generic run is a real green result at its exact SHA; it is not repeated here. It remains valid as the result for that commit's configured typecheck/test/build job. It does not establish a safe IPD boundary, prove that no dependency artifact was used, or validate P-1/host execution. The run is not treated as a substitute for the dedicated safe IRR-only check.

## 2. What the generic workflow configured and what the run proves

At the completed run's revision, `.github/workflows/ci.yml` checked out IRR, configured Node 22 with npm caching keyed by `frontend/package-lock.json`, then ran `npm ci --no-audit --no-fund`, typecheck, strict replay-server typecheck, the full Vitest suite and nonzero-test guard, and production build. These are unconditional steps in its successful job. `frontend/package.json` and the lockfile declare three direct GitHub dependencies pinned to commits in `ramkivs/iips-production-market-data` (`iips-broker-import`, `iips-np04-governed-persistence`, and `iips-production-market-data`). The completed job therefore ran the package installation against those lockfile entries; the dependency packages were available to the build/test job.

**Evidence limitation:** `gh run view 41102065894 --log` failed while downloading the Actions log archive from `results-receiver.actions.githubusercontent.com` (EOF). The Jobs API retry returned the successful job but an empty `steps` array; an earlier Jobs API request returned HTTP 502. The available run summary does not identify whether npm obtained the IPD-pinned package contents through a remote GitHub fetch during this run or from its npm cache. Consequently:

- The workflow's configuration and completed `npm ci` establish IPD-pinned dependency installation/use as a job input.
- Actual network access to the IPD GitHub repository during this run is **UNVERIFIED**; the missing logs do not justify claiming either a remote fetch or no remote fetch.
- The workflow contains no explicit checkout of the IPD repository and no IPD write step. Its declared Actions permission is read-only `contents: read`. No evidence of an IPD write was found.
- The agent did not access the IPD repository or its artifacts. The limitation concerns the hosted workflow's actual fetch-versus-cache path.

This was a **configuration/process boundary deviation**: an unfiltered generic workflow automatically ran for an IRR-only PR, and its unconditional install was configured to consume IPD-pinned dependencies. That is unsafe for IRR-only validation and is corrected below. This classification does not assert an unobserved network fetch or IPD write; actual remote repository access remains unverified.

## 3. Corrected future validation boundary

`.github/workflows/ci.yml` is now limited on both `pull_request` and `push` to `frontend/**` and `.ci/**`. Those paths retain the existing product frontend typecheck, replay-server typecheck, Vitest suite/test-count guard, and production build for frontend or test-guard changes. The generic workflow does **not** include tracker, governance, P-1 procedure, IRR evidence, or workflow-only paths. A change to the generic workflow itself is covered by the dedicated IRR-only workflow, not by invoking its IPD-dependent install. A PR that also changes `frontend/**` remains a product-CI case and can run the dependency-consuming workflow.

The existing `.github/workflows/cap03-revision7-irr-static.yml` remains the safe route for this work: IRR checkout plus Python standard-library compilation and validation only; it does not run npm, install packages, build, fetch or write IPD. Its path list now includes the generic workflow file and this reconciliation record. The static validator checks that generic CI is path-scoped and that the safe workflow remains dependency-free.

**Open-PR timing constraint:** `main` is still the old baseline and PR #382 is deliberately not merged. The path-filter change is therefore published in the PR branch, not yet effective on `main`. The correction commit is published with GitHub's `[skip ci]` marker so the old broad workflow is not rerun before the corrected workflow definition is in effect. No generic CI rerun was requested or launched. Once the correction reaches `main`, IRR-only changes will follow the dependency-free route. If further commits are added to this still-open PR before merge, do not trigger the base-version generic workflow; retain the skip-checks protection.

## 4. P-1 readiness re-assessment

No PA or P-1 status is changed by CI reconciliation. The previously recorded Q-EV operator observations for `H:\IIPS-P1-EVIDENCE` and express acceptance of its existing DACL remain operator-attested, point-in-time facts; they were not independently rechecked. The accepted DACL is not a blocker and is not evidence of effective writability. No ACL changes are authorized or made.

The following remain in force without reopening or manufacturing blockers:

- P-1 remains **AUTHORIZED — NOT EXECUTED — UNSPENT**, exactly one attempt; no Preflight, Execute, provisioning entrypoint, claim/marker/store/evidence creation, consuming test, retry, or second attempt occurred.
- PA-06 admitted S2 evidence remains L2a-only at the designated commit/tree; it was not rerun. PA-13/E10, PA-19, PA-20, and PA-1 remain effective as previously recorded.
- Q-CONS-2/3, Q-MIG, Q-TX, Q-V8, Q-WRITE, and Q-BUILD remain resolved at their recorded scopes. In particular, Q-BUILD's S04 evidence-reuse scope does not authorize a build.
- `P-1-C` remains **NOT ESTABLISHED** and `P-1-D` remains **DESIGNATED / NOT VERIFIED FOR THE ATTEMPT**; both are non-blockers, not PASS.
- U-4 and U-5 remain **NOT RUN** under their prior waivers; A6 remains **NOT RUN**. No status was promoted and no completed/waived work was reopened.
- Q-EV path/owner/DACL verification remains as operator-reported for the time checked. No host, root, filesystem, ACL, or permission investigation was repeated.

The current authoritative-main freshness gate is still **NOT SATISFIED**: main remains at `f6ae5ebd8552990fc156f7a4c9a6a1110b22a413`, does not contain the current Revision 7 pointer `CV-CORR-203`, and PR #382 remains OPEN/UNMERGED. Overall P-1 execution readiness therefore remains **NOT CLEARED**. The workflow correction does not waive that gate. After the PR is reviewed and merged through the normal process, the published-main pointer/freshness condition must be read back before any separately authorized invocation; the script's runtime safeguards remain applicable. No PA renewal is requested here.

## 5. Publication verification

The exact final IRR commit/tree, remote branch read-back, PR state, and whether the `[skip ci]` publication started any new workflow run are recorded in tracker row `V1737` after push. Local validation is limited to the IRR-only static validator, its Python compilation, allocation/path/scope checks, and `git diff --check`. No generic CI is rerun.
