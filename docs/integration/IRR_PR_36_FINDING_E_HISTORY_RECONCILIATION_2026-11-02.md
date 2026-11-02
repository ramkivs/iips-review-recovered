# IRR PR #36 — Finding E history and functionality reconciliation

**Checked:** 2026-11-02
**Repository:** `ramkivs/iips-review-recovered`
**Authority checked:** live `refs/heads/main` at `8e79416c523d73d4961ac811b718155f2c7f8065`
**Disposition:** historical reconciliation only; no product-code correction indicated.

## Executive finding

PR #36, “docs(np-08): promote Finding E comment rectification,” corrected four stale provider-designation comments and added its rectification act. Its four source diffs are comments only: no executable behavior, tests, API contract, data boundary, or UI behavior changed. The PR’s recorded merge commit is on current `main`; its original branch-head commit is not, because the merge commit is a distinct one-parent commit with the same parent and tree.

Finding E is complete for that bounded comment correction. Current `main` still contains the act unchanged, and the four source files carry the designated-provider statement or a later accurate restatement. Current `main` also contains later, separately authorized Macro source/API/UI implementation and tests. No PR #36 functionality is missing or defective, so no product-code edit or reimplementation is warranted.

This does **not** assert live MoSPI egress or Windows/browser E2E success. Those remain separate from comment rectification; this reconciliation performed no Windows/native-host/browser run and no live provider request.

## 1. Exact history and ancestry

GitHub PR metadata, the commit/tree API, local object inspection, and live `git ls-remote` were cross-checked. The remote and local `main` refs both resolved to `8e79416…` at the time of inspection.

| Role | Commit | Tree | Parent(s) / exact relation |
|---|---|---|---|
| PR #36 base | `dbb19d38510239c817bd699c3ec4b5af3ef16c80c` | `e6c8c77a6657c56b48c3a47b5a110fa6a2fd4dc4` | PR #35 merge commit; parents `2f8f62be76cff97b17c50b6ca107eaee670c2523` and `8811d7d4b83f7088ada0ccdbc45004676671c526` |
| PR #36 head | `39bd90c129bb8fc41c1e7b37a7122e9fc2fc800a` | `a98000d3e5536a236bdca10e2265b3e14ad6a6cd` | One parent: PR base `dbb19d…`; one commit in the PR |
| Recorded PR #36 merge commit | `d0c6f80ef4b5732772b64a67ef15cdfc5a44e18a` | `a98000d3e5536a236bdca10e2265b3e14ad6a6cd` | One parent: `dbb19d…`; tree is exactly the PR-head tree |
| Current remote `main` | `8e79416c523d73d4961ac811b718155f2c7f8065` | `b3f1fe3eeb896834355fbdc9c964e5d47836c006` | Current authoritative tip; local `main` matched the live remote ref |

The historical PR branch `arena/01a10c0e-iips-review-recovered` and `refs/pull/36/head` both still resolve to `39bd90c…`. GitHub compare reports the recorded merge commit as the merge base of `d0c6f80…...8e79416…` (`ahead_by: 1052`, `behind_by: 0`): the merge commit is an ancestor of current `main`. Comparing the PR head to current `main` reports the same 1,052 later commits and one commit behind: `39bd90c…` itself is not an ancestor of `main`. This is a commit-identity distinction, not a tree/content omission: `39bd90c…` and `d0c6f80…` have the identical tree and parent.

PR #36’s base was the already-merged PR #35 D89 decision record. PR #35 changed one documentation file; it did not add source/UI behavior. The base therefore represents the pre-Finding-E source blobs plus the D89 governance record.

## 2. PR discussion and original scope

The GitHub API returned **zero** issue comments, review submissions, and inline review comments for PR #36. Its description limits the change to the four comment corrections and the rectification act; it expressly excludes D89 UI work, tests, historical acts, and IPD.

The PR description reports `git diff --cached --check` and a static comment-only assertion as passed. It also reports that `npm ci` failed on `UNABLE_TO_VERIFY_LEAF_SIGNATURE`; accordingly, the PR did **not** run focused tests, typecheck, or build. That limitation is retained rather than upgraded into a test claim.

The exact five paths and blob coordinates are:

| Path | Base blob (`dbb19d…`) | PR head / merge blob (`a98000…`) | Current `main` blob (`8e79416…`) | Reconciliation |
|---|---|---|---|---|
| `frontend/server/executive-transport.ts` | `1b98d0510cbcc0dc4ba133068c8605fbbd943092` | `535211cfceb78c146bf0d5982348ad78637f15b6` | `43a869cb2c6b745c3be135193722b9abd1ed22d6` | PR #36 changed only the route comment from “MoSPI is NOT designated” to the designated NAS/CPI/IIP statement, retaining the entitlement/M-3/production/boundary limits. Later transport work changed this file substantially; current D08 route still states the bounded designation and exact dataset boundary. |
| `frontend/server/macro/mospi-source.ts` | `e2d7c957799b352ec429f95ea563f51dab231def` | `03b4bb047251feccb8ba4654f2d19ee37fbe43ac` | `252898d5e9a9ddbdabfe8cbc17ab8c2f24ab3169` | PR #36 corrected the header and technical-source comments only. Later source implementation and tests changed the file; current header identifies MoSPI as designated for NAS/CPI/IIP only and preserves separate entitlement, M-3, production, and expansion restrictions. |
| `frontend/src/api/macro.ts` | `24c0911c4aeab1b8a3dd207b935ba57455dd3b5c` | `0050940185a16769239b067d7170059334ea46d5` | `edc7daefd587097328642ac75e0e230f4b1aab57` | PR #36 corrected the module comment only. Later changes added credential-free fetching, CPI query support, and typed transport errors; the current comment carries the same bounded provider status. |
| `frontend/src/features/research/MacroContext.tsx` | `3fd917d867846106ad354599e888d162fc5bb259` | `883088b604dd2e482bdf415f315525080093c175` | `2066eae2cd3a0738b1b427b5a0ee725496133a58` | PR #36 corrected the comment only. PR #61 later restated the single-user credential-free chain; the current comment retains the designation and its limits. |
| `docs/integration/NP-08-D08-MACRO-PROVIDER-DESIGNATION-COMMENT-RECTIFICATION-ACT.md` | Absent | `0674a38c24954e1c6f76eaa8eee455ded96e89a3` | `0674a38c24954e1c6f76eaa8eee455ded96e89a3` | Added by PR #36 and byte-identical on current `main`; no later edit or replacement was found. |

The four source patches sum to 17 insertions and 12 deletions, all in comments. The fifth path is the 251-line rectification act. The published act identifies Finding E as comment-only, bounds MoSPI designation to NAS/CPI/IIP, and explicitly preserves separate licensing/entitlement, attribution, M-3, production, and boundary decisions.

## 3. Finding E and related NP-08 records

The current `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT.md` designates MoSPI for NAS/CPI/IIP. Its §15 expressly supersedes earlier “not designated” statements in the historical source-provider, dataset-boundary, implementation-authority, and boundary-rectification acts **only** as to that designation. It preserves the other restrictions and says historical acts are not rewritten.

The D89 UI-disclosure decision record separately affirms that provider status and entitlement are independent; it also preserves old status text as historical. The older Dataset Boundary and Implementation Authority acts therefore remain in the repository with their original dates and language. They are not current contrary decisions and are not candidates for editing in this reconciliation.

One similarly worded comment remains in `frontend/server/macro/macro-transport.ts`: “NOT authorized here” describes what that earlier implementation act did not authorize. The Finding E act classifies this as a valid local scope statement, not a current assertion that MoSPI is undesignated. It was not one of the four stale comments and is not changed.

**Finding E status:** complete and durably present on current `main` for its authorized comment-only scope. The rectification act’s blob is unchanged; all four target source files have since evolved, and none retains the stale “MoSPI is NOT designated” statement.

## 4. Later independent and superseding implementation

These later records explain why current blobs differ from PR #36. They are not changes made by PR #36 and are not reasons to replay its patch.

| Later record | Provenance and effect relevant here |
|---|---|
| PR #61 (`1f7997e…`, 2026-10-12), “Remove authentication flow for single-user IIPS” | Reconciled the credential-free single-user architecture. In the Macro client it switched to the shared `noAuthFetch`; in `MacroContext.tsx` it restated the transport comment. This is later architecture work, not a Finding E change. |
| PR #98 / commit `2d959ff…` (2026-10-14) | Documentation/tracker and lineage reconciliation only. It records PRs #35/#36 as merged ancestral blobs; it changes no Macro source behavior and does not supersede the Finding E act. |
| PR #102 (`c3aa60e…`, 2026-10-15) | Added `MacroSourceDisclosure` and component tests for the separate D89 product-transparency contract. |
| PR #103 (`1d031f3…`, 2026-10-15) | Mounted the read-only `/research/macro` surface, made it reachable through Research navigation, and added focused mounted-view tests. Its commit record reports 10 focused surface tests, typecheck, build, and 726/726 full-suite tests. Current `App.tsx`, routes, navigation, `MacroResearch.tsx`, and tests contain this work. Thus the later D89 UI disclosure is present; PR #36 itself never purported to implement it. |
| PR #106 / commit `cea06dc…` (2026-10-15) | A later CPI defect was identified: exact duplicate provider rows were being deduplicated before comparison with the provider-declared count, causing a false incomplete-pagination 502. The change retains CPI duplicates (`deduplicate: false`) while preserving strict completeness checks, with source/route regression tests. GitHub’s changed-file list and commit show these source/test changes even though PR #106’s description characterizes the PR as evidence-only. This independent later correction is already in current `main`; it is not a PR #36 defect. The associated Windows response evidence is operator evidence, not a Windows run by this reconciliation. |
| PR #110 (`e9279a5…`, 2026-10-15) | Added the separate D91 §1 data-mode notice on the Macro screen. It is not part of Finding E or provider designation. |
| PR #112 (`1c208f3…`, 2026-10-15) | Added bounded Macro source-configuration injection, surfaced typed transport error fields, and tests for settings invariance and CPI missing-index disposition. Its record reports 49/49 focused tests, 770/770 full tests, typecheck, and build passing. These are later API/transport features, separate from the comment-only PR. |
| PR #174 / commit `c03d6ec…` (2026-10-21) | The tracker-only commit references **IPD** PR #36 (still open at that time), not IRR PR #36. It changes no Macro source, UI, or Finding E record. This similarly numbered cross-repository reference is not a later decision about this PR. |

Current `main` has a production consumer: `App.tsx` mounts `MacroResearch` at `/research/macro`, and the Research navigation exposes it. `MacroResearch` renders the D89 source disclosure adjacent to NAS/CPI/IIP data and handles empty/error responses without substituting data. The corresponding context, API, transport/source, and disclosure tests are present. These later implementation records supersede the earlier October 14 discovery that no mounted Macro screen yet existed; that earlier finding was accurate at its date and is not current-state evidence.

## 5. Functionality disposition and residuals

- **PR #36 scope:** no runtime feature was added or removed; no executable defect is attributable to it. The corrected comments match the current provider-designation act and current source/API/UI disclosures.
- **Later Macro read and UI:** the NAS/CPI/IIP read path, source/client/context, D89 disclosure component, and mounted Research screen exist on current `main`, with targeted tests. The CPI duplicate-row defect discovered later has already been corrected and tested. No feature should be reimplemented or transplanted from a historical branch for this task.
- **Governance boundaries:** designation is NAS/CPI/IIP only. This does not itself grant broader entitlement/licensing, commercial use, redistribution, caching/retention, attribution, M-3 provenance authority, production authorization, or additional dataset scope. IPD is untouched.
- **Environment residual:** external MoSPI connectivity/live E2E remains a distinct environment-dependent matter. The prior coordinated audit’s Windows/browser plan remains outstanding. No Windows, native-host, browser E2E, or live MoSPI verification is claimed here; no Gate/QE qualification was started.

## 6. Validation evidence and limits

- PR #36’s own description records a static comment-only assertion and `git diff --cached --check` as passing, but no focused tests/typecheck/build because dependency installation failed certificate verification.
- Later D89 PR #103 and Macro PR #112 records provide separate test evidence for their own implementation. The CPI row-retention commit also records focused source/route regressions.
- The completed coordinated audit ran the IRR suite (109 files / 1,365 tests) and production build successfully at `6f347a018dbfacbc7d5e62fe9f773b323ce9d69c`. The frontend tree at that commit is identical to `main@8e79416…` (`git diff --quiet 6f347a0… 8e79416… -- frontend` passed); the intervening main changes are documentation-only. These prior results therefore cover the same current frontend implementation, but were not rerun for this documentation-only reconciliation.
- Publication validation for this record is `git diff --check` plus the pull-request checks, if configured. Neither substitutes for Windows/browser or live-provider evidence.

## 7. Change boundary

This record is additive. No source, UI, test, package/dependency, governance act, IPD file, branch history, or remote ref is rewritten. No obsolete implementation is restored, no PR #36 patch is cherry-picked, and no new Macro behavior is introduced.
