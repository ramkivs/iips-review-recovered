# EVIDENCE-ANNEX — G2-2 decision record R2

**Status:** CANDIDATE R2, REVISION 2 — NOT APPROVED — NOT PUBLISHED — NOT AUTHORITATIVE. This annex records how the path sets, the sync, the live-wiring facts, the Program Authority direction evidence and the blob identities were derived. It records no decision. Revision 2 adds the evidence for §1B (P1 to P5) and §14A (K1 to K9) of the record: §A8 (extended import-edge inventory), §A9 (promotion-authority act wording) and §A10 (P1 to P5 evidence).

## A1. Basis

- Base: `800789957f2a3cf4e28d5dfff49d92f29d6a7671` (IRR `main`; verified by C01).
- Default checks: `verify_g2_2_checks.sh` (C01 to C35) run at 2026-10-09T18:43:26Z (UTC) against the published state. Output: `g2_2_checks_output.txt`. Result: 33 PASS, 0 FAIL, 2 NOT-VERIFIED (C14 and C15).
- PR #42: merge `47edf6f3db79c6c443caed148121406f33a158b7`; first parent `0b961fecbe29ed643c86c1a223fc22ac6d30a115`; second parent (PR head) `4906a6b71f5133d714f0f4c29c89dba22ded37f5` (C24). The 23 paths changed by the merge are the 13 in §A2 and the 10 in §A3 (C18). State MERGED; title and merge facts in §A9 (C27).

## A2. AD-01 ratified Reports set (13 paths)

"Equal" means the blob at the PR #42 merge and the blob at base are identical. Each of the 13 blobs also equals the blob at the D-3 qualified commit `39dd43eb…` (C28).

| Path | PR #42 merge blob | Base blob | Equal |
|---|---|---|---|
| `frontend/server/reports-api.test.ts` | `9cc52dc6dd18…` | `9cc52dc6dd18…` | Equal |
| `frontend/server/reports-transport.test.ts` | `4ae07780541a…` | `4ae07780541a…` | Equal |
| `frontend/server/reports-transport.ts` | `cdee7ed16b46…` | `cdee7ed16b46…` | Equal |
| `frontend/server/reports/artifact.ts` | `1da89bd46d39…` | `1da89bd46d39…` | Equal |
| `frontend/server/reports/canonical.ts` | `f57fa6a6a57f…` | `f57fa6a6a57f…` | Equal |
| `frontend/server/reports/composition.ts` | `fc9a8fbbdd66…` | `fc9a8fbbdd66…` | Equal |
| `frontend/server/reports/index.ts` | `0e3024d253f6…` | `0e3024d253f6…` | Equal |
| `frontend/server/reports/np04-adapter.ts` | `7f7b80a53416…` | `7f7b80a53416…` | Equal |
| `frontend/server/reports/persistence-port.ts` | `16d787ea77fa…` | `16d787ea77fa…` | Equal |
| `frontend/server/reports/persistence.ts` | `49f203069bac…` | `49f203069bac…` | Equal |
| `frontend/server/reports/reports-artifact.test.ts` | `cbe6496c18c8…` | `cbe6496c18c8…` | Equal |
| `frontend/server/reports/reports-canonical.test.ts` | `b411310a4ae6…` | `b411310a4ae6…` | Equal |
| `frontend/server/reports/reports-persistence.test.ts` | `45f0be080598…` | `45f0be080598…` | Equal |

## A3. PR #42 paths not ratified (10 paths)

"Equal" compares the PR #42 merge blob with the base blob. "Differs" means the path has changed on `main` since the merge. No inference is drawn from a difference.

| Path | Reason | PR #42 merge blob | Base blob | Equal |
|---|---|---|---|---|
| `frontend/package.json` | Pin file. AD-01 admits no pin. | `3048351c3afb…` | `3048351c3afb…` | Equal |
| `frontend/package-lock.json` | Pin file. AD-01 admits no pin. | `9c14f6862720…` | `9c14f6862720…` | Equal |
| `frontend/server/admin-live-composition.test.ts` | Admin composition test. Contains no Reports reference. Not in the Reports set. | `3564ae5470c4…` | `3564ae5470c4…` | Equal |
| `frontend/server/admin-transport.test.ts` | Admin transport test. Outside the Reports set. Not ratified. | `443bcdd4a740…` | `443bcdd4a740…` | Equal |
| `frontend/server/admin-transport.ts` | Admin transport. Outside the Reports set. Not ratified. Defines `createLiveAdminExecutor` (line 298), which the ratified `reports-transport.ts` imports (§A8). | `284a46305053…` | `4bc78e79f654…` | Differs |
| `frontend/server/executive-transport.ts` | Live runtime dispatch wiring: Reports on `/api/reports/` (lines 778–793) and PIT on `/api/pit/` (lines 824–828). Excluded by AD-01: not ratified and not removed. Retained under Q1 and not admitted (§A8). The Reports dispatch block is identical to the PR #42 head (C23). | `fd2d120ac1b1…` | `1883120bac36…` | Differs |
| `frontend/server/pit/ipdPitReadAdapter.ts` | PIT consumer, imported by `getPitReadPort()` (line 695). Excluded by AD-01 as a PR #42 path, not a Reports path (§A8). At its current content it is also an AD-02 consumer; the record does **not** say that PR #42's change to this file (+6/−4 against the first parent of the merge) is governed by AD-02. AD-02, once effective, admits only the §2 pin consumption; it does not ratify that change, and its content is not reviewed (record §4, K2). | `9168cc1de52a…` | `9168cc1de52a…` | Equal |
| `frontend/server/secured-executor.ts` | Defines `SecuredExecutor`, imported type-only by the ratified `reports-transport.ts` (line 50). Excluded by AD-01. Not admitted. | `183133541fac…` | `183133541fac…` | Equal |
| `frontend/server/tenant-directory.test.ts` | Tenant directory test. Excluded by AD-01 and AD-05. The earlier "G3" attribution is not carried forward; no source examined supports it. | `476d4bef6152…` | `476d4bef6152…` | Equal |
| `frontend/server/tenant-membership-store.ts` | Tenant membership store; defines `FileTenantDirectory` (line 88), constructed by `admin-transport.ts` (lines 307–312). Excluded by AD-01 and AD-05. Not admitted. | `7ef1cec97e18…` | `7ef1cec97e18…` | Equal |

## A4. Session branch sync (non-destructive)

| Item | Value |
|---|---|
| Session head before sync | `1eaf0024e11cba6614968008cd46725554acb652` (9 session-only commits) |
| Base | `800789957f2a3cf4e28d5dfff49d92f29d6a7671` (3 main-only commits) |
| Merge base | `c19a905d9b7ff6f7faa5c966b59504063f3d45c1` |
| Sync merge commit | `686d45670bcf10a5c8167c8fd3e5caa20a9e75d7`; parents `1eaf0024…` and `800789957…` |
| Conflicts | Six lineage supporting scripts, add/add, mode-only. Before the sync: 100755 on the session branch, 100644 on `main`. Resolved to `main`'s content and mode. |
| Other differences | One `docs/integration/` file present on `main` and absent from the session branch. It merged cleanly. |
| Tree of sync merge | `76aa3be2020c98d82aada86b9e445f19a3e9e237`, identical to the tree of `origin/main`. |
| History | Not rewritten. Not reset. No force-push. |

## A5. Candidate inventory (repository paths; all new relative to base)

| Path | Bytes | Git blob | SHA-256 |
|---|---|---|---|
| `docs/integration/IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md` | 75469 | `ca118534bb0f5debcc9d5e416d5fb04fc629b054` | `a7e4ee52129506643e986544e38d3d0736b7ae57ab1493a64125452810b07d3e` |
| `evidence/integration/g2-2-decision-gate/2026-10-09/g2_2_checks_output.txt` | 5007 | `91f1a995399aef68713221b0cd1fa69af4b1681a` | `39d65ee0a88c185305c570545b0a028fbf4bb297e2e1013e9ff144b347c58a5d` |
| `evidence/integration/g2-2-decision-gate/2026-10-09/verify_g2_2_checks.sh` | 22289 | `d9a2977f3adec9b737c23281d87a1c3567acf27e` | `507737ae54433f86be212c9f5d07d62d1cc13c8449b2a1e5f4392db46b95c722` |

The candidate inventory is five files: this annex, the record, the checks output, the checks script and `SHA256SUMS`. The record, checks output and checks script are listed above with their sizes, blob identities and SHA-256 values. This annex's identity is recorded in `SHA256SUMS`. The identity of `SHA256SUMS` is in the completion report. Neither can be recorded in this file.

## A6. Check results

- Default mode (C01 to C35): 33 PASS, 0 FAIL, 2 NOT-VERIFIED (C14 AD-06 and C15 AD-20, both OPEN by design). Full rows are in `g2_2_checks_output.txt`.
- C23 to C28 were added in revision 1: C23 Reports dispatch block identity across base, PR #42 head and D-3 qualified commit; C24 PR #42 merge parents; C25 live-wiring presence on base; C26 excluded-dependency presence on base; C27 PR #42 record in the published lineage raw snapshot; C28 ratified-path identity at the D-3 qualified commit. All six are presence or identity checks. None admits behaviour.
- C29 to C35 were added in revision 2: C29 promotion-authority act wording (four quoted exclusions present; no IRR, `PR #42`, `governed reports`, `G-2`, `G2 `, `user portfolio` or `companion` reference); C30 existing AD-03 HTTP consumption mechanism on base (`G2_IPD_BASE_URL` declared and read; `G2_LINEAGE.commit` equals the AD-03 reference); C31 G-2 user-portfolio dispatch and its six dependency edges on base; C32 the four ratified test files with import edges to excluded or unclassified modules, and the fifth with none; C33 D-1 present on base and an ancestor of the PR #42 merge; C34 the G-2 consumer commit adds the `/api/user-portfolios/` dispatch and the G-2 implementation record whose blob is unchanged on base; C35 the computed pin specifier in the two ratified Reports files. All seven are presence, identity or wording checks. None admits behaviour and none grants authority.
- Negative test, revision 1 (scratch copy; not committed): with the D-3 commit set to the pre-PR #42 commit `0b961fe…` and the PR #42 title altered, the same script returned FAIL for C23, C27 and C28 and exited 1.
- Negative tests, revision 2 (seven mutated scratch copies of the script; not committed). Each copy alters exactly one string or identifier and is run against the live remotes in its own fresh work directory. Each returned exit 1 with the targeted check reporting FAIL: C29 (an exclusion string altered: `excl=0/1/1/1 ext_refs=0`); C30 (the `G2_IPD_BASE_URL` declaration string altered: `0 1 1`); C31 (the `/api/user-portfolios/` condition string altered: `0 1 1 1 1 1 1`); C32 (the module list in the edge pattern altered: the four test files report 0 edges); C33 (`D1_COMMIT` set to the base commit, which is not an ancestor of the PR #42 merge); C34 (`IRR_G2_CONSUMER` set to an IPD commit, so the implementation record does not resolve — C10 also fails, as it shares the identifier); C35 (the computed specifier string altered in the first of its two occurrences: `0 1`). The new checks can fail.
- Route mode (R01 to R04): run after the push. Results are recorded in the pull request and the completion report.

## A7. Not verified and not performed

- The `NON_PRODUCTION_D114_*` constants named in B2 §3.2: not checked by C21.
- Content of the five AD-02 consumer files on `main`: not reviewed. Presence is checked (C22).
- Runtime behaviour of the PIT and D114 consumers: UNPROVEN (B2 §5 item 4).
- Runtime behaviour, runtime correctness, route protection, security properties, UI behaviour and end-to-end acceptance of the Reports and PIT dispatch wiring: UNPROVEN. No runtime test was run.
- Content and behaviour of the unclassified modules in §A8 (`pit-transport.ts`, `frontend/src/core/auth/keycloakAdapter.ts`, `iips-platform/src/…`): not reviewed beyond their import edges.
- Satisfaction of the PR #42 title condition: NOT ESTABLISHED (Q2). Coverage of PR #42 by the promotion-authority act: NOT ESTABLISHED; the act's verified wording is quoted in the record §1A, Q2 and no conclusion is drawn from it (C13, C29).
- Content of the two drifted excluded paths beyond the Reports dispatch block (C23): not reviewed.
- Symbol-level behaviour: not checked. Presence only (C21).
- The identity of any build answering at a configured `G2_IPD_BASE_URL`: UNPROVEN. C30 checks only that the variable is declared and read and that the G-2 contract names the AD-03 reference. No HTTP request was made and no deployment configuration was read.
- The `G-2` implementation record's §8 item 5 statement against commit `a0ab5a34…`: recorded as a conflict of record (C34, §A10). Not resolved, and no authority is inferred.
- D-1 and the PR #42 merge: recorded as an unresolved authority conflict (C33, §A10). Not resolved, and no retrospective authorization is claimed.

## A8. Live wiring and import edges (Q1; presence and identity only)

Source-level, at base `800789957…`. Line numbers refer to the files on `main`. Nothing in this section admits behaviour.

Live wiring in `frontend/server/executive-transport.ts` (blob `1883120bac36d22c26fbc7c40c31c5072a189e84`):

| Element | Location on `main` | Verified by | Status under this record |
|---|---|---|---|
| Server creation | line 734 (`http.createServer`) | C25 | Presence |
| Reports dispatch | lines 778–793 (condition at line 778) | C23 | Retained (Q1). Not admitted. Runtime UNPROVEN. |
| PIT dispatch | condition at line 824; call to `pit-transport.ts` at lines 827–828 | C25 | Retained (Q1). Not admitted. Runtime UNPROVEN. |
| PIT read port | `getPitReadPort()`, lines 689–700; dynamic imports at lines 695–696 | Read at base | Retained. See the edge table. |
| Server listen | lines 1024–1025, under `NODE_ENV !== 'test'` | C25 | Presence. On a non-test start, the source serves these routes. Runtime UNPROVEN. |
| G-2 user-portfolio dispatch | condition at line 802; dynamic import of `./user-portfolio-transport` at line 805; handler call at line 811; 401 when no executor, 500 on transport error (lines 808, 813) | C31 | Retained. **NOT ADMITTED** by AD-03 or AD-04 (PA direction P3, record §1B). Not removed, disabled, reverted or modified. Runtime UNPROVEN. |

Dependency and import edges (presence only; none is admitted):

| From (`main`) | To | Edge | Status |
|---|---|---|---|
| `executive-transport.ts`, line 781 | `reports-transport.ts` (ratified) | dynamic import in the Reports dispatch | Ratified presence. The dispatch is not admitted. |
| `reports-transport.ts`, line 181 | `admin-transport.ts`, line 298 (`createLiveAdminExecutor`) | dynamic import | Excluded by AD-01. Not admitted. C26. |
| `admin-transport.ts`, lines 307–312 | `tenant-membership-store.ts`, line 88 (`FileTenantDirectory`) | dynamic import; construction | Excluded by AD-01 and AD-05. Not admitted. C26. |
| `reports-transport.ts`, line 49 | `admin-transport.ts` (`TransportError`) | value import; constructed at lines 225, 230, 295, 298 and 313 | Excluded by AD-01. Not admitted. Runtime load edge. C26. |
| `reports-transport.ts`, line 50 | `secured-executor.ts` (`SecuredExecutor`) | type-only import | Excluded by AD-01. Not admitted. C26. |
| `reports-transport.ts`, line 47 | `frontend/src/core/auth/keycloakAdapter.ts` (`AuthError`) | value import; used at line 530 | Pre-existing module outside the PR #42 set. Unclassified. No authentication authority granted. |
| `reports-transport.ts`, line 48; `reports/persistence.ts`, line 19 | `iips-platform/src/distributed/EnterpriseRuntime.ts` (`Principal`) | type-only import | Pre-existing module outside the PR #42 set. Unclassified. |
| `reports-api.test.ts`, line 21 | `admin-transport.ts` (`createAdminExecutor`, `TEST_TENANT_DIRECTORY`) | test import | Test-only. Excluded module. Not admitted. |
| `reports-api.test.ts`, line 25 | `frontend/src/core/auth/keycloakAdapter.ts` (`OidcVerifier`) | test import, type-only | Test-only. Unclassified module. Not admitted. No authentication authority. |
| `reports-api.test.ts`, line 26 | `iips-platform/src/sector-engines/cross-sector/reporting/ReportingEngine` | test import, value | Test-only. Unclassified module. Not admitted. |
| `reports-api.test.ts`, line 27 | `iips-platform/src/distributed/EnterpriseRuntime.ts` (`Principal`) | test import, type-only | Test-only. Unclassified module. Not admitted. |
| `reports-transport.test.ts`, line 21 | `admin-transport.ts` (`createAdminExecutor`, `TEST_TENANT_DIRECTORY`) | test import | Test-only. Excluded module. Not admitted. |
| `reports-transport.test.ts`, line 29 | `frontend/src/core/auth/keycloakAdapter.ts` (`OidcVerifier`) | test import, type-only | Test-only. Unclassified module. Not admitted. No authentication authority. |
| `reports-transport.test.ts`, line 30 | `iips-platform/src/distributed/EnterpriseRuntime.ts` (`Principal`) | test import, type-only | Test-only. Unclassified module. Not admitted. |
| `reports-transport.test.ts`, line 302 | `executive-transport.ts` | test import, dynamic | Test-only. Excluded module. Not admitted. |
| `reports/reports-artifact.test.ts`, line 10 | `iips-platform/src/sector-engines/cross-sector/reporting/ReportingEngine` | test import, value | Test-only. Unclassified module. Not admitted. |
| `reports/reports-persistence.test.ts`, lines 29 and 30 | `iips-platform/src/sector-engines/cross-sector/reporting/ReportingEngine` (value); `iips-platform/src/distributed/EnterpriseRuntime.ts` (`Principal`, type-only) | test imports | Test-only. Unclassified modules. Not admitted. |
| `reports/reports-persistence.test.ts`, line 795 | `iips-production-market-data/persistence` | test import, **computed** specifier `['iips-production-market-data', 'persistence'].join('/')` under `/* @vite-ignore */` | Test-only. Pin-package edge inside a ratified file. C35. Not admitted. |
| `reports/persistence-port.ts`, line 289 | `iips-production-market-data/persistence` | runtime import, **computed** specifier `['iips-production-market-data', 'persistence'].join('/')`; returns `null` on failure (line 294) | Ratified file. Pin-package edge. C35. Not admitted. |
| `reports/reports-canonical.test.ts` | none | — | The fifth ratified test file has **no** import edge to an excluded or unclassified module. Its only pin mention is a comment at line 13 naming a different commit, `bd5229d0…`. C32. |
| `user-portfolio-transport.ts`, line 51 | `frontend/src/core/auth/keycloakAdapter.ts` (`AuthError`) | value import | G-2 dispatch dependency. Unclassified module. **NOT ADMITTED** (P3). No authentication authority. C31. |
| `user-portfolio-transport.ts`, line 52 | `iips-platform/src/distributed/EnterpriseRuntime.ts` (`Principal`) | type-only import | G-2 dispatch dependency. Unclassified module. **NOT ADMITTED** (P3). C31. |
| `user-portfolio-transport.ts`, line 53 | `admin-transport.ts` (`TransportError`) | value import | G-2 dispatch dependency. Excluded by AD-01. **NOT ADMITTED** (P3). C31. |
| `user-portfolio-transport.ts`, line 54 | `secured-executor.ts` (`SecuredExecutor`) | type-only import | G-2 dispatch dependency. Excluded by AD-01. **NOT ADMITTED** (P3). C31. |
| `user-portfolio-transport.ts`, line 142 | `admin-transport.ts` (`createLiveAdminExecutor`) | dynamic import in `createLiveUserPortfolioExecutor()` | G-2 dispatch dependency. Excluded by AD-01 and AD-05. **NOT ADMITTED** (P3). C31. |
| `executive-transport.ts`, lines 695–696 | `pit/ipdPitReadAdapter.ts` (excluded by AD-01 as a PR #42 path) | dynamic import | AD-02 consumer at its current content. AD-02 scope when effective. AD-02 does not ratify PR #42's change to this file (K2). No runtime admission. |
| `executive-transport.ts`, lines 695–696 | `pit/nonProductionRuntimePitStore.ts` | dynamic import | AD-02 consumer. AD-02 scope when effective. No runtime admission. |
| `executive-transport.ts`, line 827 | `pit-transport.ts` | dynamic import | Unclassified. Not a PR #42 path. Introduced by commit `acd1556d50d77111cb318249ac3acbfd1d8454b5` (2026-09-29). |
| `pit-transport.ts` | `pit/pitReadBoundary.ts`, `pit/pitReadPort.ts`, `pit/pitReadContract.ts` | import | IRR-local. Checked: none of the three imports the pin, `d114`, or `nonProductionRuntimePitStore`. |

## A9. PR #42 provenance (Q2; facts only)

| Item | Value | Verified by |
|---|---|---|
| Title | "Promotion candidate: Governed Reports onto current main (DO NOT MERGE without promotion act)" | GitHub (`gh pr view 42`); published lineage raw snapshot (C27) |
| State and merge time | MERGED; 2026-10-06T21:09:33Z | GitHub; C27 |
| Head | branch `promotion/governed-reports-candidate`; commit `4906a6b71f5133d714f0f4c29c89dba22ded37f5` | GitHub; C11; C27 |
| Merge commit | `47edf6f3db79c6c443caed148121406f33a158b7`; parents `0b961fecbe29ed643c86c1a223fc22ac6d30a115` (merge of PR #41) and `4906a6b…` | C12; C24 |
| Reports dispatch block | absent at `0b961fe…` (the first parent); present, 16 lines, at `47edf6f…` and at `4906a6b…` | Same extraction as C23 |
| Lineage record | "Title and state conflict, recorded as a lineage fact." (`evidence/integration/lineage-investigation/2026-10-08/CAPABILITY-LINEAGE-RECOVERY-INVESTIGATION.md`, note on PR titles) | Read at base |
| Promotion-authority act | `2606185923f6cbd3f4df5c3af200f54d40ed4bbc`, file `evidence/np04/NP04-PROMOTION-AUTH-TARGET-DESIGNATION-AND-AUTHORITY-ACT.md`, on `arena/01a0f839-iips-production-market-data`. Wording verified and quoted in the record §1A, Q2: §3 target `arena/01a0e6d9-…`; §4 SOURCE `6828155…`, promotion unit `0dab1221… → 8c99627… → d4fdb33… → 6828155…`; §4 exclusions include `main → 0dab1221`, promotion into `main` of the NP04 lineage, "Watchlists, Reports, Collaboration, Settings, Governed Screener persistence"; §5 "`main` — NOT AUTHORIZED", "Merge, cherry-pick, rebase, copy — NOT AUTHORIZED"; §6 "opening a `main`-targeted PR" and "interpreting NP04 acceptance as `main`-integration authorization" NOT authorized. Coverage of PR #42: NOT ESTABLISHED; no conclusion drawn. | C13; C29; file read from IPD commit `2606185…` (11,249 bytes, 227 lines, SHA-256 `0296f6a6a0cc565c412e0ee2b0da6ff925e6135a57e710cc1b0fe70dbb33697b`) |
| D-3 statement | "Promotion executed: NO" (`GOVERNED-REPORTS-ACCEPTANCE-DECISION.md`, §11) | Read at base |
| D-1 | `docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`, commit `80a4dc95a37a4945ffd07d6cc71a6b716c9e0847`, 2026-10-06T19:56:49Z; D-1 Option C; authority Ramki — Program Authority / application owner; authoritative ref `refs/heads/main`. Ancestor of the PR #42 merge, which was merged 2026-10-06T21:09:33Z. | C33; read at base |

## A10. Program Authority directions P1 to P5 — evidence

Source-level and repository-level facts only. Nothing in this section admits behaviour, grants authority, or resolves an open item.

**P1 — D-1 and PR #42.**

| Item | Value | Verified by |
|---|---|---|
| D-1 path on `main` | `docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md` (186 lines at base) | Read at base |
| D-1 commit | `80a4dc95a37a4945ffd07d6cc71a6b716c9e0847`, 2026-10-06T19:56:49Z, subject "docs(governance): publish D-1 explicit domain-scoped persistence ownership decision (Option C)" | `git log` on `main`; C33 |
| D-1 header | Record ID `D-1-PERSISTENCE-DOMAIN-OWNERSHIP-DECISION-01`; "Authority: Ramki — Program Authority / application owner"; "Authoritative ref: `refs/heads/main`"; "Record type: Governance decision — durably published; non-executable" | Read at base, lines 3–13 |
| D-1 §2 standing, line 57 | "main admission explicitly prohibited by the recorded promotion-authority act" | Read at base |
| D-1 §3 standing, line 75 | "Reports consumer contract; no qualification, acceptance, or promotion act; no main admission." | Read at base |
| D-1 §6, lines 109–110 | "PROMOTION ≠ MAIN ADMISSION" and "MAIN ADMISSION ≠ CONVERGENCE" | Read at base |
| D-1 §11, line 145 | "No promotion authority granted. Neither persistence lineage is promoted by this decision, to any ref." | Read at base |
| D-1 §12, lines 149–150 | "No mainline admission created by this decision. The main refs of both repositories are unaffected in capability content" | Read at base |
| D-1 §15, lines 166–169 | "This decision does NOT authorize: … promotion; main capability admission; merge of implementation branches; final convergence; …" | Read at base |
| Ancestry | D-1 commit is an ancestor of the PR #42 merge `47edf6f3…`; PR #42 merged 2026-10-06T21:09:33Z, about 73 minutes after D-1 | C33; C12, C24, C27 |

**P2 — G-2 consumer commit `a0ab5a34…`.**

| Item | Value | Verified by |
|---|---|---|
| Commit | `a0ab5a344d1ca2cb7c07a8fa6ae2090b2535852c`, author date 2026-10-07T11:18:26Z | `git log -1`; C10 |
| Subject | "Promote G-2 non-production durable user portfolio to main (G-2-PROMO-2026-10-07)" | `git log -1` |
| Body | "Admission of the certified G-2 implementation into main history. Candidate c8f37d5 reconciled byte-exact (14/14 blobs) onto 29a43e5 from certified session-branch tip 756bdd4 (implementation 470cc69). Scope: 13 G-2 implementation paths + additive +31/-0 dispatch ONLY; the 2 E2E-015 prior-act root records on the session branch are NOT admitted." | `git log -1` |
| Change set | 14 paths, +3651/−0, including `frontend/server/executive-transport.ts` (+31/−0), `frontend/server/user-portfolio-transport.ts` (516 lines) and the G-2 implementation record (213 lines) | `git show --stat` |
| Dispatch added | `/api/user-portfolios/` condition and the dynamic import of `./user-portfolio-transport`, plus the two cached-module declarations (+7 lines) | `git diff a0ab5a34^1 a0ab5a34 -- frontend/server/executive-transport.ts`; C31 |
| Ancestry | `a0ab5a34…` is an ancestor of IRR `main`. No pull request was found associated with it. | C10 |
| G-2 implementation record | `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md`, blob `8486a5708c6a3f616718a6021afa13508a4227ef`, identical at `a0ab5a34…` and at base | C34 |
| Conflict | Record lines 196–197: "Main admission of this implementation — NOT AUTHORIZED by this act (session branch only); G24 main admission remains PROHIBITED per D-1 standing." The file is on `main` with the blob introduced by that commit. | C34; read at base |
| Interpretation | Recorded as evidence. No authority is inferred from commit presence or from the subject line. AD-20 remains OPEN. | Record §1B, P2 |

**P3 — G-2 user-portfolio dispatch and dependencies.**

| Location on `main` | Fact | Verified by |
|---|---|---|
| `executive-transport.ts` line 802 | `/api/user-portfolios/` dispatch condition | C31; read at base |
| `executive-transport.ts` line 805 | dynamic import of `./user-portfolio-transport` | C31; read at base |
| `executive-transport.ts` lines 806–811 | executor and config resolution; `handleUserPortfolioRequest` call | Read at base |
| `executive-transport.ts` lines 808, 813 | 401 when no executor; 500 on transport error | Read at base |
| `user-portfolio-transport.ts` lines 51–54 | `AuthError` from `../src/core/auth/keycloakAdapter`; type `Principal` from `../../iips-platform/src/distributed/EnterpriseRuntime`; `TransportError` from `./admin-transport`; type `SecuredExecutor` from `./secured-executor` | C31; read at base |
| `user-portfolio-transport.ts` line 142 | dynamic import of `createLiveAdminExecutor` from `./admin-transport` | C31; read at base |
| Provenance of the dispatch | Added by `a0ab5a34…` (+31/−0) | `git diff a0ab5a34^1 a0ab5a34` |

**P4 — PIT route and the AD-02 boundary.**

| Location on `main` | Fact | Verified by |
|---|---|---|
| `executive-transport.ts` line 824 | `/api/pit/` dispatch condition | C25; read at base |
| `executive-transport.ts` line 827 | dynamic import of `./pit-transport` | Read at base |
| `executive-transport.ts` line 828 | `handlePitReadRequest(req, res, await getPitReadPort())` | Read at base |
| `executive-transport.ts` lines 689–700 | `getPitReadPort()`; dynamic imports of `./pit/ipdPitReadAdapter` (line 695) and `./pit/nonProductionRuntimePitStore` (line 696) | Read at base; Annex A §A8 |
| AD-02 admitted consumers | The five files in record §2, at pin `2e11fa3b…`, non-production only | C22; record §2 |
| Boundary | The route, the dispatch and `pit-transport.ts` are not among the AD-02 consumers and are not admitted by AD-02 | Record §1B, P4; §2 |

**P5 — Effectiveness.**

| Item | Value |
|---|---|
| Authoritative route | Merge of this record to `refs/heads/main` of `ramkivs/iips-review-recovered`, then independent remote verification (record §10) |
| Current state | Candidate on session branch `arena/1dcbe88d-iips-review-recovered`; NOT merged, NOT authoritative |
| Merge authorization | None. PR #51 is open and in draft. Merge requires a separate explicit authorization after review |
