# IIPS one-pass execution — evidence and decision packet index

**Date:** 2026-10-18 UTC. These are evidence and decision-input records, not PA decisions. No product implementation or Group 1/2 gate is reopened. The follow-up updates only verified evidence/status fields; it does not assert the missing workbook's aggregate baseline.

| Package | Record | State |
|---|---|---|
| PKG-01 / PKG-09 | `evidence/integration/one-pass-2026-10-18/PKG-01-PKG-09-EXECUTION-RECORD.md`; `evidence/integration/one-pass-2026-10-18/PKG-09-CLEAN-CLONE-TRANSCRIPT.md` | PR #132's composed engine and AI-advisory route evidence reconciled to exact merged tree `e9bb64c…`; PKG-09 clean-clone command/API procedure passed at that exact SHA. Scope limits are explicit. |
| PKG-02 | `PKG-02-PORTFOLIO-CROSS-REPOSITORY-DEPENDENCY.md` | Current IPD/IRR boundary and CV-20 stop recorded; IPD main's post-467 changes are docs-only; session-only portfolio port and IRR `503` fence remain. |
| PKG-02A | `PKG-02A-CV20-DECISION-REQUEST-RECONCILIATION.md` | IRR-side reconciliation/registration of the single authoritative CV-20 decision request published on IPD `main` (`IIPS-V3-CV20-PA-DECISION-REQUEST-2026-10-18-01`, IPD PR #13 at `2d124134…`); baselines refreshed to IRR `d32c812…` (PR #133) with all CV-20-material blobs identical; adequacy confirmed; discrepancies D-1…D-5 dispositioned. **No competing request created; no option selected; CV-20 remains `DECISION REQUIRED`.** |
| PKG-03 | `PKG-03-REPORTS-CV21-DECISION-PACKET.md` | Three separate CV-21 alternatives and downstream R1/R2/R3/F-7 constraints prepared; no disposition selected. |
| PKG-04 | `PKG-04-GOVERNED-UNIVERSE-CV22-DECISION-PACKET.md` | A/B/C alternatives, 52 real vs. 2,198 synthetic source-reported composition, contract gap, and acceptance proposal prepared; no universe choice selected. |
| PKG-05 | `PKG-05-PIT-CV32-DISPOSITION-PACKET.md` | Bounded mounted-panel vs. API-only choice prepared, distinct from CV-22; no UI implementation authorized. |
| PKG-06 | `PKG-06-MACRO-QUALIFICATION-BLOCKERS.md` | Entitlement, attribution, external-evidence, and authority gaps remain separate from route/display evidence. |
| PKG-07 | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.49 and §19 | CV-25/CV-35/CV-42 and the associated group summary reconciled to verified evidence; no unresolved product decision is closed. The 51×17 Excel baseline is not reconstructed. |
| PKG-08 | `PKG-08-IRR-SURFACE-SCOPE-ROWS-4-14-16.md` | Row-specific current behavior, scope questions, and conditional closure evidence prepared; no product surface/storage option selected. |

## Post-merge verification snapshot (before this follow-up's publication)

### IRR — PR #132 and exact tested tree

- `gh pr view 132` reported `MERGED`, merge commit `e9bb64c2e5aa5c888b689f6e40fc5ae3875ccab6`; `git ls-remote origin refs/heads/main` matched that SHA at verification.
- The merge commit has first parent `9be364b11631291a8602e07fcbdd0c7a9cc6ed06` and second parent PR head `c8fe209ec691dd3673ba9fbd14fb2dd7fba70ec3`. PR-head and merge trees match (`4bfa34f5f53a243bc63c75b1ab624875423a6bf2`). The new clean-clone transcript is explicitly against `e9bb64c…`, not inferred from its parent.
- PR CI run `39129320262` and post-merge main CI run `39129422038` both completed successfully. Run metadata shows Typecheck, full Vitest suite, non-zero-test assertion, and Production build steps passed. The published PR body/execution record reports the 15 focused tests and 814/73 full-suite result; no second full-suite run was performed for this gap.
- The packet-index file, new composed-engine test, and original PKG evidence files are present on that merged tree; this follow-up's updated reconciliation text is the pending documentation diff, not content attributed to `e9bb64c…`. PR #132 changed no application runtime module or dependency lockfile relative to its first parent.

### PKG-09 exact-main outcome

- Fresh clean clone at `e9bb64c…`, clean status before and after installation, Node `v22.22.3`, npm `10.9.8`; `npm ci` installed 188 packages with the documented CA bundle.
- Carrier integrity passed: 363 bytes and SHA-256 `d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4`.
- With carrier: health / engines / watchlists `200`; user portfolios and valid Reports artifacts `503 owner-context-unavailable`; bare `/api/reports` `404`. Without carrier: watchlists / collaboration / settings each `503 owner-context-unavailable`. All calls were GET-only; the temporary data homes remained absent/empty after both servers stopped.
- The prior `GET /api/engines` transcript's 4,725-byte count was not reproduced. At both first-parent `9be364b…` and merged `e9bb64c…`, the response was 4,731 bytes with the same SHA-256 and 13 engines. The earlier response body/hash was not preserved; the six-byte variance is documented as an unexplained measurement discrepancy, with no route-contract difference.
- This is a PASS for the PKG-09 command/API procedure only. It is not full WP-1 acceptance, an unassisted human-reader test, browser acceptance, Windows qualification, or Gate C evidence.

### Current dependency and PR state

- IPD `main` was reverified at `9130c259ee753bad63611b256f67a470f715e37f`. GitHub compare from packet-time `467eb529f52820032b17ea0212c92362a96dfe18` shows four commits (PRs #10/#11) and only the cross-repository reconciliation Markdown file changed. IPD main CI run `39129936129` succeeded. PR #8 remains merged at `467eb529…`; PR #9's runner guard/workflow remains in current main. Both IPD pin tags are visible and peel to the intended exact commits. No IPD files or refs were modified by this IRR work.
- IRR had one open PR, #114, concerning broker preview and NP-18 views; it is separate, its CI is green, and merge authority remains separate/not established. No PR exists for this session branch at the start of the follow-up. No competing PR was created for PR #132.

## Baseline verification limitation

The user-specified canonical file `/IIPS/IRR_Arena_Section_18_1_Full_Capability_Matrix_51_Rows.xlsx` is absent from the accessible IRR `main` tree. The repository's 51×17 Markdown matrix and supplied `24/9/13/5/0` figures are not a verified substitute for that workbook; those aggregate counts remain unverified and are not presented as canonical. The follow-up makes only row-specific evidence/status edits supported by the current remote evidence and does not calculate or publish an Excel baseline.

Packet fields that state IRR `main@9be364b…` or IPD `main@467eb529…` describe the pre-merge/pre-PR #10/#11 snapshot when those packet notes were prepared. The post-merge refs and relationships are recorded above; the underlying decision packets remain inputs, not operative decisions.
