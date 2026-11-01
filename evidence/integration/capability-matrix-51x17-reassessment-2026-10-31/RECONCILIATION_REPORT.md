# IIPS v3.0 — 51 × 17 Capability Matrix Reassessment (2026-10-31)
**Record:** `IIPS-V3-CAPMATRIX-51X17-REASSESSMENT-2026-10-31-01`

**Original reassessment IRR main:** `7fd824de30d8268ed3eca210bc664dc60749fa8c`

**Original reassessment IPD main:** `527f811b17edb02caa665b345d9f36102435e1e8`

**Historical P-08 amendment (`2026-11-01`):** IRR investigation baseline `ad7d2362532c146aa023229bae48342eeab646fb`; IPD merge `e9c2eef6c82ba51814a72ce962cf227e9fd89d56` (PR #115); tracker blob `efa804097d51263ce91dff4ac7201fb572ef1d8a`; outcome **RESOLVED — CONTINUED DEFERRAL (REG-06)** (superseded as current state).

**REG-06 implementation amendment (`2026-11-01`):** IRR investigation baseline `ed41a4c1f0e1a92cc429b31210794aa2e4b5948b`; IPD merge `eb9289222e2bdfd0e79381d4d81f7f81715e019b` (PR #117, head `5b2c03dc8888aa40a4dd967ef6e7f3b76731c01e`); tracker blob `c1c666149c2d907026df3d9a2d184d2b9a2383c0`; outcome **IPD product admission/implementation COMPLETED; IRR RECONCILED**. Production/AD-17/M-2 not authorized.

**Baseline:** `evidence/integration/capability-matrix-51x17-2026-10-27/` at reference commit `fff8cf98ddcc7af1c6ab58d3ae9a3442a5322935`.
## A. Scope and method
This reassessment inspected both authoritative repositories, all available remote branches and PRs in full clones, current trackers/decision acts, implementation artifacts, and executed current-head validation. The original 51 capabilities and 17 dimensions are preserved. Statuses are updated only where current evidence supports a change; historical text is retained in the baseline bundle. Production remains outside scope.
## B. What changed from the October 27 baseline
- **O-05 / row 28:** IPD PR #113 merged a bounded refusing-only broker-import consumer; state-2 code-level limb satisfied, admission limb remains open.
- **D-9 / row 35:** C4-2 PA act effective; Reports header-claim question closed; F-7 bounded backend acceptance unchanged; G-14 residual recorded.
- **O-06 / row 45:** closed no action required; all three IPD specifiers guarded.
- **O-07 / row 48:** closed documentation reconciliation; row 27 re-scoped; O-09 remains open.
- **P-1 / rows 30/32:** PR #398 merged; P1-F consumption remains NOT RECONCILED and no host execution is inferred.
- **Validation counts:** IRR 108 files / 1377 tests after S2-DEP-A rev-8 contract-test correction; IPD 941 tests / 940 pass / 1 skip.
- **Branch distances:** G24 branch 7 ahead / 920 behind; historical Reports branch 28 ahead / 1043 behind.
- **Runbook:** restamped to 108/1377 with exact frontend-tree pointer.
- **P-20:** IPD PR #114 merged; IRR pending register no longer lists the resolved IPD documentation conflict.
- **P-33/G14:** dependency assessment published; final G14 remains blocked by upstream gates.
- **Historical P-08 / row 29 (PR #115 amendment):** IPD PR #115 merge `e9c2eef6c82ba51814a72ce962cf227e9fd89d56`, tracker blob `efa804097d51263ce91dff4ac7201fb572ef1d8a`; **RESOLVED — CONTINUED DEFERRAL (REG-06)**. PA §5.5 corrects the historical packaging/identifier observations; export map exists but excludes Operator Drop, build does not emit it, and the identifier is `record.companyId`. No product admission at that baseline.
- **REG-06 / row 29 (current implementation amendment 2026-11-01):** IPD PR #117 merge `eb9289222e2bdfd0e79381d4d81f7f81715e019b` completed durable PIT, series-qualified ingestion, product runtime and emitted `./operator-drop` export. Full suite 987/986/0/1; focused 46/46; package-consumer and installed-tarball smoke PASS. IRR reconciled by §16.242; historical DEFERRED preserved. Production/AD-17/M-2 not authorized; O-05/P-1 gates unchanged.
## C. Downgrades / reopened items
No accepted capability was reopened without contradictory evidence. Row 47 is restored to verified current figures. Row 48 remains partial because G14 final reconciliation is blocked and P1-F consumption is not reconciled, not because PR #398 or IPD P-20 remains open. Row 19 is upgraded for live-source E2E based on operator-transferred evidence, with a non-blocking browser-rendering residual.
## D. Remaining blockers and dependencies
The dominant chain remains: PA-09 Gate 4 pin → P-1 runtime execution → S2/Limb A native run → H-12 L2c/S2a → S3 → QE-1..11 → Gate C subset acceptance → Gate 4/U4 acceptance → DQ-4 freeze → Gate 5/CV-52/U5 → U6 write authorization. O-05 admission and DR-2/DR-4r operational closure sit downstream. PA-01/02/03 are documentary conflicts, not P-1 prerequisites. REG-12 mapping, CV-22 expansion, CV-24 F6/TD-7b and D115 wiring remain separate items. REG-06 Operator Drop is completed on IPD and reconciled in IRR; P-08 is a completed/reconciled entry, not an active pending task. Production/AD-17/M-2, O-05 and P-1 gates are not closed by that completion.
## E. Responsibility distribution
- Completed / reconciled items: 1 register entry.
- Cross-repository integration / dependencies: 5 register entries.
- Evidence / certification / verification: 8 register entries.
- External / infrastructure blockers: 2 register entries.
- IRR implementation / deliverables: 1 register entry.
- Operator execution: 2 register entries.
- PA decisions / governance: 16 register entries.
- Qualification / admission gates: 5 register entries.
## F. Overall position
- Matrix: 51 × 17 preserved; 128 cells updated.
- ACCEPTED: 20 rows (1, 2, 3, 6, 7, 12, 13, 15, 17, 18, 20, 24, 25, 26, 31, 37, 38, 46, 49, 50).
- ACCEPTED+FOLLOWUP: 12 rows (4, 5, 9, 10, 11, 19, 27, 35, 39, 45, 47, 48).
- BLOCKED: 2 rows (30, 32).
- BRANCH_ONLY: 1 rows (36).
- DEFERRED: 2 rows (8, 41).
- HISTORICAL: 2 rows (42, 43).
- IMPLEMENTED: 2 rows (22, 28).
- OOS: 8 rows (14, 16, 21, 23, 33, 40, 44, 51).
- VERIFIED: 2 rows (29, 34).
- Register: 40 entries, including 1 completed/reconciled item (P-08); this is not a count of active implementation tasks. Other completed/OOS rows are excluded unless a distinct residual remains.
- Open PRs at the original census: none (historical). At the P-08 amendment census: IPD none; IRR #409 merged during this pass as c9e725f6 and preserved.
## G. Evidence and artifacts
- Workbook: `IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.xlsx`
- Matrix CSV: `IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv`
- Pending CSV: `IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv`
- Raw execution/probe/census logs: `raw/`
- Evidence register: workbook sheet `Evidence Register` and `reassessment_data.py`.
## H. Non-claims
This record creates no PA decision, acceptance, qualification, admission, production eligibility, durable:true, fence lift, provisioning, host execution or IPD write. Operator-reported host events are not independently verified unless raw evidence is cited. Green CI/tests are not Gate 4 qualification.
