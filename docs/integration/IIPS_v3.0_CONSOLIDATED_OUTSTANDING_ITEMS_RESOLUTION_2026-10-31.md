# IRR consolidated outstanding-items resolution — P-11, P-18, P-19, P-20, P-33 (2026-10-31)

**Record:** `IIPS-V3-CONSOLIDATED-OUTSTANDING-RESOLUTION-2026-10-31-01`
**Tracker overlay:** §16.234 / `CV-CORR-214` / `CHG-2026-10-31-13` / `V1851`–`V1862`
**Authoritative repository:** `ramkivs/iips-review-recovered`
**IPD boundary:** read-only verification only; no IPD write.

## Final item status

| Item | Final status | Principal evidence | Remaining dependency / owner |
|---|---|---|---|
| P-11 — PR #398 / Windows CI | **COMPLETE** | PR #398 merged as `7fd824de30d8268ed3eca210bc664dc60749fa8c`; exact head `eddbaead386b3d9627402e4070537defd3dfa0e0`; Windows run `41220141777` PASS; static/recovery-audit run `41220141940` PASS; post-merge runs `41221317984` / `41221318050` PASS; 17/17 changed-path blobs read back. | None for P-11. S04-compatible retained-bundle acceptance remains P-36. |
| P-18 — runbook restamp | **COMPLETE** | `docs/OPERATOR_RUNBOOK.md` now states 108 files / 1,377 tests and points to IRR `main@7fd824de…`, frontend tree `67607e1de119a79cba4acfa9d2375493aa898bea`, and raw receipts. | None. |
| P-19 — identifier allocation | **COMPLETE** | §16.230 / §16.231 / §16.232 / §16.233 unique after PR #398/#400/#402; V1806–V1850 unique; CHG-2026-10-31-11/12 change-log rows reconciled; §16.234 consumes the declared next free allocation. | None. Next free §16.235 / CV-CORR-214 / CHG-2026-10-31-13 / V1847. |
| P-20 — IRR pending-register closure | **COMPLETE** | IPD PR #114 merged as `527f811b17edb02caa665b345d9f36102435e1e8`; corrected tracker blob `5ceb5398b0cb172bdc793e62bdfaea005b7c426a`; `31fd3b84…` verified as blob, not commit; IRR register no longer lists P-20 as outstanding. | None for the documentation conflict. |
| P-33 — G14 final reconciliation | **PARTIAL — final G14 BLOCKED / NOT STARTED** | `IIPS_v3.0_CAP03_G14_DEPENDENCY_ASSESSMENT_2026-10-31.md` reconciles G2–G13. | G6 P1-F consumption NOT RECONCILED; G7 S3; G8 QE 0/11; G9 DQ-4 8/10; G10 Gate 4 pin/acceptance; G11 Gate 5; PA-01/02/03/09/17. Owners: PA / Operator / IRR / IPD as scoped. |

## P-11 investigation and correction

The original Windows fixture failure in run `41207888891` was:

`ASSERTION FAILED: expected exception: parent traversal inventory path`

Root cause: the fixture attempted to create a traversal row by replacing `src\persistence` in an inventory row that did not contain that path, so the expected unsafe path was never produced. Subsequent commits also normalized ZIP entry paths and inventory paths. The final PR head preserves the intended §16.230 / CV-CORR-210 / V1806–V1817 changes and the S2 artifact-retention requirements, adds §16.232 / CV-CORR-212 / V1830–V1834, and passes exact-head Windows and static/recovery-audit CI.

A post-merge frontend contract-test drift was then detected: the S2-DEP-A test still asserted the superseded fixed staged-count-19 gate. The test was corrected to the rev-8 manifest-derived exact path-set contract, required `dist-artifacts.zip`, shared helper import, and preserved prefix/byte gates. This strengthened rather than weakened coverage. Focused test 15/15 PASS; full IRR suite 108 files / 1,377 tests / 0 failed; guard and build PASS.

## P-18 verification

Executed at IRR `main@7fd824de30d8268ed3eca210bc664dc60749fa8c` with frontend tree `67607e1de119a79cba4acfa9d2375493aa898bea`:

- `npm ci --no-audit --no-fund`: exit 0
- `npm run typecheck`: exit 0
- `npm run typecheck:replay-server`: exit 0
- `npm run test:ci`: 108 files / 1,377 tests / 0 failed
- `node .ci/assert-tests.js .vitest-report.json`: OK
- `npm run build`: exit 0; 142 modules; main JS chunk 1,609.84 kB / gzip 226.69 kB

The runbook startup path and operator instructions were preserved.

## P-19 allocation reconciliation

PR #398 consumed §16.230 / CV-CORR-210 / V1806–V1817 and §16.232 / CV-CORR-212 / V1830–V1834. The earlier reassessment consumed §16.231 / CV-CORR-211 / V1818–V1829. PR #400/#402 consumed §16.233 / CV-CORR-213 / V1835–V1850. The final census found each heading and verification row unique. Missing change-log rows for CHG-2026-10-31-11/12 were added as reconciliations of identifiers already consumed by §16.232/§16.233; they did not create competing allocations. This resolution consumes §16.234 / CV-CORR-214 / CHG-2026-10-31-13 / V1851–V1862.

## P-20 remote IPD verification

IPD PR #114 was independently verified through GitHub API and raw blob read-back:

- merge commit: `527f811b17edb02caa665b345d9f36102435e1e8`
- parents: `4e275ec97a7701521e6a4e7632e9324bafe8d286`, `2ca99a36e050dbd6972f29bf8219434cb66d60de`
- one changed path: `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`
- diff: `+90 / -0`
- corrected blob: `5ceb5398b0cb172bdc793e62bdfaea005b7c426a`
- SHA-256: `8fdd6c5d6eab7539507752aa4e809dcfe12582fd3072896557d8db789eb94b7e`
- PR-head CI `41219124224`: success
- post-merge CI `41219297374`: success
- open IPD PRs: 0

IRR removed P-20 from the exclusively-pending register and updated matrix row 48. IPD was not modified.

## P-33 / G14 determination

The final G14 reconciliation was **not** declared complete. The dependency assessment identifies the genuine upstream blockers and required evidence. Green CI, script publication, recovery-release asset verification and documentation corrections do not close P-1 execution, S3, QE, DQ-4, Gate 4 acceptance or Gate 5 admission.

## Updated registers and artifacts

- Tracker: `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`, §16.234.
- Pending register: `evidence/integration/capability-matrix-51x17-reassessment-2026-10-31/IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv` — now **40** genuinely pending items; P-11/P-18/P-19/P-20 removed.
- Workbook: `evidence/integration/capability-matrix-51x17-reassessment-2026-10-31/IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.xlsx` — 51 × 17 matrix preserved; pending sheet updated; traceability verified.
- Runbook: `docs/OPERATOR_RUNBOOK.md`.
- P-20 closure: `docs/integration/IIPS_v3.0_P20_IRR_PENDING_REGISTER_CLOSURE_2026-10-31.md`.
- G14 assessment: `docs/integration/IIPS_v3.0_CAP03_G14_DEPENDENCY_ASSESSMENT_2026-10-31.md`.
- Evidence bundle: `evidence/integration/consolidated-outstanding-resolution-2026-10-31/`.

## Boundaries

No PA decision, acceptance, qualification, admission, release, provisioning, host execution, `durable:true`, `503` lift or production authorization was created. No IPD write occurred. Historical records were preserved; dated overlays govern stale historical text.
