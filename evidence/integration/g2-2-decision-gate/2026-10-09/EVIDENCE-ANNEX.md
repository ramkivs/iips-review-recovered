# EVIDENCE-ANNEX — G2-2 decision record R2

**Status:** CANDIDATE R2, REVISION 1 — NOT APPROVED — NOT PUBLISHED — NOT AUTHORITATIVE. This annex records how the path sets, the sync, the live-wiring facts and the blob identities were derived. It records no decision.

## A1. Basis

- Base: `800789957f2a3cf4e28d5dfff49d92f29d6a7671` (IRR `main`; verified by C01).
- Default checks: `verify_g2_2_checks.sh` (C01 to C28) run at 2026-10-09T17:24:38Z (UTC) against the published state. Output: `g2_2_checks_output.txt`. Result: 26 PASS, 0 FAIL, 2 NOT-VERIFIED (C14 and C15).
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
| `frontend/server/pit/ipdPitReadAdapter.ts` | PIT consumer, imported by `getPitReadPort()` (line 695). Excluded by AD-01 as a PR #42 path. Governed by AD-02's scope, not a Reports path (§A8). | `9168cc1de52a…` | `9168cc1de52a…` | Equal |
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
| `docs/integration/IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md` | 44088 | `7f543add350f9267e02a8202335a583ca6feb325` | `976108de8144adb1af6767c9c1bf5bb7a1e076db49d94b7684ad6878e9963a63` |
| `evidence/integration/g2-2-decision-gate/2026-10-09/g2_2_checks_output.txt` | 3662 | `dc207d4352653dbbf36256f08db67fbaf9672f71` | `0aef94e2f66ef3799d07525072e3a35510a2de51f30ad2c14f72a230920e9474` |
| `evidence/integration/g2-2-decision-gate/2026-10-09/verify_g2_2_checks.sh` | 16187 | `884a6fa881449b57cddb500faef9e7e1457e09e1` | `46768f49fb51b94e6d9eedc6892f5bfb679e4d0d620e22ba1562a3f504949788` |

The candidate inventory is five files: this annex, the record, the checks output, the checks script and `SHA256SUMS`. The record, checks output and checks script are listed above with their sizes, blob identities and SHA-256 values. This annex's identity is recorded in `SHA256SUMS`. The identity of `SHA256SUMS` is in the completion report. Neither can be recorded in this file.

## A6. Check results

- Default mode (C01 to C28): 26 PASS, 0 FAIL, 2 NOT-VERIFIED (C14 AD-06 and C15 AD-20, both OPEN by design). Full rows are in `g2_2_checks_output.txt`. C23 to C28 were added in this revision: C23 Reports dispatch block identity across base, PR #42 head and D-3 qualified commit; C24 PR #42 merge parents; C25 live-wiring presence on base; C26 excluded-dependency presence on base; C27 PR #42 record in the published lineage raw snapshot; C28 ratified-path identity at the D-3 qualified commit. All six are presence or identity checks. None admits behaviour.
- Negative test (scratch copy; not committed): with the D-3 commit set to the pre-PR #42 commit `0b961fe…` and the PR #42 title altered, the same script returned FAIL for C23, C27 and C28 and exited 1. The new checks can fail.
- Route mode (R01 to R04): run after the push. Results are recorded in the pull request and the completion report.

## A7. Not verified and not performed

- The `NON_PRODUCTION_D114_*` constants named in B2 §3.2: not checked by C21.
- Content of the five AD-02 consumer files on `main`: not reviewed. Presence is checked (C22).
- Runtime behaviour of the PIT and D114 consumers: UNPROVEN (B2 §5 item 4).
- Runtime behaviour, runtime correctness, route protection, security properties, UI behaviour and end-to-end acceptance of the Reports and PIT dispatch wiring: UNPROVEN. No runtime test was run.
- Content and behaviour of the unclassified modules in §A8 (`pit-transport.ts`, `frontend/src/core/auth/keycloakAdapter.ts`, `iips-platform/src/…`): not reviewed beyond their import edges.
- Satisfaction of the PR #42 title condition: NOT ESTABLISHED (Q2). Coverage of the promotion-authority act by PR #42: not evaluated (C13).
- Content of the two drifted excluded paths beyond the Reports dispatch block (C23): not reviewed.
- Symbol-level behaviour: not checked. Presence only (C21).

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
| G-2 user-portfolio dispatch | condition at line 802 | Read at base | Not addressed by this record. |

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
| `reports-api.test.ts`, line 21; `reports-transport.test.ts`, line 21 | `admin-transport.ts` | test import | Test-only. Excluded module. Not admitted. |
| `reports-transport.test.ts`, line 302 | `executive-transport.ts` | test import | Test-only. Excluded module. Not admitted. |
| `executive-transport.ts`, lines 695–696 | `pit/ipdPitReadAdapter.ts` (excluded by AD-01 as a PR #42 path) | dynamic import | AD-02 consumer. AD-02 scope when effective. No runtime admission. |
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
| Promotion-authority act | `2606185923f6cbd3f4df5c3af200f54d40ed4bbc` on `arena/01a0f839-iips-production-market-data`; coverage of PR #42 not evaluated | C13 |
| D-3 statement | "Promotion executed: NO" (`GOVERNED-REPORTS-ACCEPTANCE-DECISION.md`, §11) | Read at base |
