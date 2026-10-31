# IIPS v3.0 — 51 × 17 Capability Matrix Reassessment (2026-10-31)
**Record:** `IIPS-V3-CAPMATRIX-51X17-REASSESSMENT-2026-10-31-01`

**IRR main:** `7fd824de30d8268ed3eca210bc664dc60749fa8c`

**IPD main:** `527f811b17edb02caa665b345d9f36102435e1e8`

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
## C. Downgrades / reopened items
No accepted capability was reopened without contradictory evidence. Row 47 is restored to verified current figures. Row 48 remains partial because G14 final reconciliation is blocked and P1-F consumption is not reconciled, not because PR #398 or IPD P-20 remains open. Row 19 is upgraded for live-source E2E based on operator-transferred evidence, with a non-blocking browser-rendering residual.
## D. Remaining blockers and dependencies
The dominant chain remains: PA-09 Gate 4 pin → P-1 runtime execution → S2/Limb A native run → H-12 L2c/S2a → S3 → QE-1..11 → Gate C subset acceptance → Gate 4/U4 acceptance → DQ-4 freeze → Gate 5/CV-52/U5 → U6 write authorization. O-05 admission and DR-2/DR-4r operational closure sit downstream. PA-01/02/03 are documentary conflicts, not P-1 prerequisites. REG-12 mapping, CV-22 expansion, CV-24 F6/TD-7b, REG-06 Operator Drop and D115 wiring are separate governance/dormant items.
## E. Responsibility distribution
- Cross-repository integration / dependencies: 5 pending item(s).
- Evidence / certification / verification: 8 pending item(s).
- External / infrastructure blockers: 2 pending item(s).
- IRR implementation / deliverables: 1 pending item(s).
- Operator execution: 2 pending item(s).
- PA decisions / governance: 17 pending item(s).
- Qualification / admission gates: 5 pending item(s).
## F. Overall position
- Matrix: 51 × 17 preserved; 116 cells updated.
- ACCEPTED: 20 rows (1, 2, 3, 6, 7, 12, 13, 15, 17, 18, 20, 24, 25, 26, 31, 37, 38, 46, 49, 50).
- ACCEPTED+FOLLOWUP: 12 rows (4, 5, 9, 10, 11, 19, 27, 35, 39, 45, 47, 48).
- BLOCKED: 2 rows (30, 32).
- BRANCH_ONLY: 1 rows (36).
- DEFERRED: 3 rows (8, 29, 41).
- HISTORICAL: 2 rows (42, 43).
- IMPLEMENTED: 2 rows (22, 28).
- OOS: 8 rows (14, 16, 21, 23, 33, 40, 44, 51).
- VERIFIED: 1 rows (34).
- Pending register: 40 items; completed/OOS rows are excluded unless a distinct residual remains.
- Open PRs: none at final census (IRR #398 merged; IPD none).
## G. Evidence and artifacts
- Workbook: `IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.xlsx`
- Matrix CSV: `IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv`
- Pending CSV: `IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv`
- Raw execution/probe/census logs: `raw/`
- Evidence register: workbook sheet `Evidence Register` and `reassessment_data.py`.
## H. Non-claims
This record creates no PA decision, acceptance, qualification, admission, production eligibility, durable:true, fence lift, provisioning, host execution or IPD write. Operator-reported host events are not independently verified unless raw evidence is cited. Green CI/tests are not Gate 4 qualification.
