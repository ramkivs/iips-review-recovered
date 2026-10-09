# EVIDENCE-ANNEX — G2-2 decision record R2

**Status:** CANDIDATE R2 — NOT APPROVED — NOT PUBLISHED — NOT AUTHORITATIVE. This annex records how the path sets, the sync and the blob identities were derived. It records no decision.

## A1. Basis

- Base: `800789957f2a3cf4e28d5dfff49d92f29d6a7671` (IRR `main`; verified by C01).
- Default checks: `verify_g2_2_checks.sh` run at 2026-10-09T16:26:22Z (UTC) against the published state. Output: `g2_2_checks_output.txt`. Result: 20 PASS, 0 FAIL, 2 NOT-VERIFIED (C14 and C15).
- PR #42: merge `47edf6f3db79c6c443caed148121406f33a158b7`; first parent `0b961fecbe29ed643c86c1a223fc22ac6d30a115`; PR head `4906a6b71f5133d714f0f4c29c89dba22ded37f5`. The 23 paths changed by the merge are the 13 in §A2 and the 10 in §A3 (C18).

## A2. AD-01 ratified Reports set (13 paths)

"Equal" means the blob at the PR #42 merge and the blob at base are identical.

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
| `frontend/server/admin-transport.test.ts` | Admin transport test. Outside the Reports set. G3 surface per session notes. Not ratified. | `443bcdd4a740…` | `443bcdd4a740…` | Equal |
| `frontend/server/admin-transport.ts` | Admin transport. Outside the Reports set. G3 surface per session notes. Not ratified. | `284a46305053…` | `4bc78e79f654…` | Differs |
| `frontend/server/executive-transport.ts` | Runtime dispatch wiring for Reports on the `/api/reports/` namespace, with a G3-enforced boundary. Excluded by AD-01 (no runtime admission; no G3 membership). | `fd2d120ac1b1…` | `1883120bac36…` | Differs |
| `frontend/server/pit/ipdPitReadAdapter.ts` | PIT consumer. Governed by AD-02's scope, not a Reports path. | `9168cc1de52a…` | `9168cc1de52a…` | Equal |
| `frontend/server/secured-executor.ts` | G3 surface per session notes. Excluded by AD-01 (no G3 membership). | `183133541fac…` | `183133541fac…` | Equal |
| `frontend/server/tenant-directory.test.ts` | Tenant test. G3 per session notes. Excluded by AD-01 and AD-05. | `476d4bef6152…` | `476d4bef6152…` | Equal |
| `frontend/server/tenant-membership-store.ts` | Tenant membership store. G3. Excluded by AD-01 and AD-05. | `7ef1cec97e18…` | `7ef1cec97e18…` | Equal |

## A4. Session branch sync (non-destructive)

| Item | Value |
|---|---|
| Session head before sync | `1eaf0024e11cba6614968008cd46725554acb652` (9 session-only commits) |
| Base | `800789957f2a3cf4e28d5dfff49d92f29d6a7671` (3 main-only commits) |
| Merge base | `c19a905d9b7ff6f7faa5c966b59504063f3d45c1` |
| Sync merge commit | `686d45670bcf10a5c8167c8fd3e5caa20a9e75d7`; parents `1eaf0024…` and `800789957…` |
| Conflicts | Six lineage supporting scripts, add/add, mode-only: 100755 on the session branch, 100644 on `main`. Resolved to `main`'s content and mode. |
| Other differences | One `docs/integration/` file present on `main` and absent from the session branch. It merged cleanly. |
| Tree of sync merge | `76aa3be2020c98d82aada86b9e445f19a3e9e237`, identical to the tree of `origin/main`. |
| History | Not rewritten. Not reset. No force-push. |

## A5. Candidate inventory (repository paths; all new relative to base)

| Path | Bytes | Git blob | SHA-256 |
|---|---|---|---|
| `docs/integration/IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md` | 31469 | `47994dc3100b6c5747e69ca677740166e3a4e491` | `9e47cfb7c61707718125db5a87f5f667655047b6232ec9719c341478f1ad7a2a` |
| `evidence/integration/g2-2-decision-gate/2026-10-09/g2_2_checks_output.txt` | 2684 | `e6fee0d3b377c37b3bd3d43f258b08150570d726` | `26d2fd315b11eb60665f4ad30aef2f244bb93ef761c99da2dc722e7b042f4896` |
| `evidence/integration/g2-2-decision-gate/2026-10-09/verify_g2_2_checks.sh` | 11860 | `2237ecc7759bb0f5b18a6f8d7c6e23f1674340c9` | `88d652450716f8329c997e56966c3e4f180525ae0d7fb356f7313e9d6cea40d6` |

The five-file inventory is these four files plus this annex. This annex's own hash is in `SHA256SUMS`. The hash of `SHA256SUMS` is in the completion report.

## A6. Check results

- Default mode (C01 to C22): 20 PASS, 0 FAIL, 2 NOT-VERIFIED (C14 AD-06 and C15 AD-20, both OPEN by design). Full rows are in `g2_2_checks_output.txt`.
- Route mode (R01 to R04): run after the push. Results are recorded in the pull request and the completion report.

## A7. Not verified and not performed

- The `NON_PRODUCTION_D114_*` constants named in B2 §3.2: not checked by C21.
- Content of the five AD-02 consumer files on `main`: not reviewed. Presence is checked (C22).
- Runtime behaviour of the PIT and D114 consumers: UNPROVEN (B2 §5 item 4).
- Authority basis for the PR #42 merge: not examined.
- Current content of the two drifted excluded paths: not reviewed.
- Symbol-level behaviour: not checked. Presence only (C21).
