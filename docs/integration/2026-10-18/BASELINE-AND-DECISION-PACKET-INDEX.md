# IIPS one-pass execution — evidence and decision packet index

**Date:** 2026-10-18. These are evidence/decision-input records, not PA decisions. No Group 1/2 work is reopened; no canonical matrix/tracker edit is made.

| Package | Record | State |
|---|---|---|
| PKG-01 / PKG-09 | `evidence/integration/one-pass-2026-10-18/PKG-01-PKG-09-EXECUTION-RECORD.md`; `evidence/integration/one-pass-2026-10-18/PKG-09-CLEAN-CLONE-TRANSCRIPT.md` | Current composed HTTP tests, clean-clone command/API reproduction, limitations and transcript recorded. |
| PKG-02 | `PKG-02-PORTFOLIO-CROSS-REPOSITORY-DEPENDENCY.md` | IPD/IRR interfaces, current fence, CV-20 ordering, and no-admission boundary recorded. |
| PKG-03 | `PKG-03-REPORTS-CV21-DECISION-PACKET.md` | Three separate CV-21 alternatives and downstream R1/R2/R3/F-7 constraints prepared. |
| PKG-04 | `PKG-04-GOVERNED-UNIVERSE-CV22-DECISION-PACKET.md` | A/B/C alternatives, 52 real vs 2,198 synthetic, contract gap, and acceptance proposal prepared. |
| PKG-05 | `PKG-05-PIT-CV32-DISPOSITION-PACKET.md` | Bounded mounted-panel vs API-only choice prepared, distinct from CV-22. |
| PKG-06 | `PKG-06-MACRO-QUALIFICATION-BLOCKERS.md` | Entitlement/legal/external-evidence gaps separated from route and display evidence. |
| PKG-08 | `PKG-08-IRR-SURFACE-SCOPE-ROWS-4-14-16.md` | Row-specific current behavior, scope questions, and conditional closure evidence prepared. |

## Baseline verification limitation

The user-specified canonical file `/IIPS/IRR_Arena_Section_18_1_Full_Capability_Matrix_51_Rows.xlsx` was not available at `/IIPS` or `/home/user`; the latest authoritative IRR `main` tree also contains no `.xlsx` file. The repository's 51×17 Markdown matrix and the supplied 24/9/13/5/0 count are therefore useful reported evidence but **not a verified substitute for that canonical workbook**. No matrix classification/count was changed. To complete the canonical lock, the file must become accessible or its authoritative remote location must be identified.

## Current remote state observed

- IRR `main` and session branch starting commit: `9be364b11631291a8602e07fcbdd0c7a9cc6ed06`. No existing PR is associated with `arena/d8d34903-iips-review-recovered`; unrelated PR #114 remains open and is not modified.
- IPD `main`: `467eb529f52820032b17ea0212c92362a96dfe18`; current main has PR #8's session-only store port and D05 source. No IPD implementation files were changed.
