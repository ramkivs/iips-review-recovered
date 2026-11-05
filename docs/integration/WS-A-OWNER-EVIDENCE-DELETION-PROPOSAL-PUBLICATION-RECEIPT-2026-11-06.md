# WS-A — Owner-controlled evidence deletion proposal publication receipt

Date: 2026-11-06. **Publication receipt only — not a PA adoption/effectiveness instrument. No Act ID assigned.**

## Publication and independent verification

- Authoritative starting IRR main: `d847de35fb1f1894374b8025e5a8c1008e5bbc3b`.
- Decision package: **PR #457**, exact head `7bd375939108f0c091cf3756e15dd4198f37731c`, merge **`82406dd8828296ac425eb5a4827f581da6c89257`**.
- Exact-head IRR-static CI **42087623456 SUCCESS**; merged-main IRR-static CI **42087751299 SUCCESS**. Local scope/hash/count checks, Python compile, IRR static validator and whitespace checks PASS. Product/runtime CI is path-filtered for this docs-only work; no implementation or runtime test was repeated.
- Independent GitHub contents/blob API read-back: **10/10 changed paths MATCH**. Baseline-to-merged remote recursive tree blob comparisons: **346/346 protected runtime/governance/authority/reference paths unchanged**, **883/883 pre-existing evidence blobs unchanged**. These numbers are explicitly different verification sets, not publication-path totals.
- Full coordinates/hashes: `evidence/integration/ws-a-owner-deletion-decision-2026-11-06/proposal-remote-readback.json` and `proposal-ci.json`.

The receipt-only follow-up publishes these objective results and current tracker/R2 status. Its own final merge cannot be self-embedded: the publishing session independently verifies its remote contents/checks and records final main/PR coordinates in its PR record and final response. No new runtime requalification is required for this receipt.

## Reconciled prior publication counts

**PR #454 = 24 distinct changed paths. PR #455 = 5, overlapping tracker/R2 = 2. Cumulative union = 27.** GitHub merged file sets and Git diffs agree: `9d3f668e…` → `bf252e83…` gives 24; `bf252e83…` → `d847de35…` gives 5; `9d3f668e…` → `d847de35…` gives 27. The latter adds three new receipt artifacts, not three new runtime files. The 29 summed path occurrences count tracker/R2 twice. Earlier 24 and later 27 were both correct; the new paper supplies an additive scope clarification, not a numerical rewrite.

This deletion-proposal PR's own 10 changed paths are a separate publication, not a revision of those historical counts. No import implementation or test was repeated to reconcile them.

## Decision-ready package

- `WS-A-OWNER-EVIDENCE-DELETION-PA-DECISION-PAPER-2026-11-06.md`: architecture, current authority/limitations, count methodology, alternatives, recommendation, owner confirmation, backup/interruption/audit requirements and acceptance criteria.
- `WS-A-OWNER-EVIDENCE-DELETION-PROPOSED-ADDITIVE-AMENDMENT-2026-11-06.md`: separate draft with **Act ID UNASSIGNED**, exact bounded offline workflow proposed, adoption/effectiveness requirements and explicit exclusions.
- Runbook §12: additive caution to historical reset/restore recipes, no new removal command or change to effective policy.
- Tracker §16.258.1 and R2 §21.1: current state overlay.

**Arena recommendation:** an offline owner-confirmed whole-active-evidence reset only after whole-file scope/digest/path validation and verified owner-local recovery copy, with minimal external deletion-fact audit and explicit interrupted-state reconciliation. It is active-store clearing, not per-record or all-copy permanent erasure. Backups remain retained and can resurrect records on restore. Whole-file filesystem removal bypasses PF-1's owner filters, so foreign/mixed/invalid contents must block any future tool. Per-record tombstones, selective physical removal, backup destruction and secure media erasure remain separate decisions, not implementation details delegated by this draft.

## Status and stop condition

| Dimension | Current status |
|---|---|
| Investigation | **COMPLETE** |
| Decision-ready proposal | **PUBLISHED — MERGED AND INDEPENDENTLY VERIFIED** |
| PA decision on new model | **PENDING** |
| New Act ID | **UNASSIGNED — no ID invented or reused** |
| New amendment | **NOT EFFECTIVE / NOT ADOPTED** |
| New deletion implementation authority | **NOT GRANTED** |
| New deletion functionality/tooling | **NOT IMPLEMENTED** |
| Existing explicit local manual whole-journal principle | Unchanged; not executed in this task |
| Existing indefinite retention / owner / digest / W-1 / repositories | Unchanged |

No operational journal/carrier/backup was opened through a service, repaired, removed or altered. No HTTP DELETE, PF-1 change, evidence deletion, expiry/purge/compaction, holdings/transaction mutation, frozen A-8/A-9/retention authority edit or IPD change. No owner-isolation/integrity weakening. Publication authorizes nothing beyond the documentation task. **Stop here and await explicit PA adoption; do not implement or execute deletion.**
