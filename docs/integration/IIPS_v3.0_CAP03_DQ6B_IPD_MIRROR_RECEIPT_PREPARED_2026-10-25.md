# IIPS v3.0 CAP-03 — DQ-6b Decision: IPD-Locus Mirror Receipt (**PREPARED — NOT PUBLISHED**)

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-DQ6B-IPD-MIRROR-RECEIPT-2026-10-25-01` (census before this record: **0** in either repository) |
| **Record type** | Cross-repository **dated receipt** — mirrors an IRR-locus determination into the IPD locus. Creates no authority, adopts nothing, admits nothing |
| **Status** | **PREPARED — NOT PUBLISHED — NOT EFFECTIVE.** Publication requires an IPD-capable session |
| **Subject** | `IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01` (Path A, interim, guarded) |
| **Why it exists** | Effectiveness element **6** of the DQ-6b decision (packet §10 / brief §9): "a dated receipt mirrored into the other repository's tracker" |
| **Why it is not published here** | This session is **IRR-bound**. Per the governing CAP-03 record §10 it "may not create/push an IPD branch". Writing this receipt is an **IPD-locus** act, exactly as the precedent `IIPS-V3-CAP03-IRR-POST-BASELINE-MOVEMENT-RECEIPT-2026-10-24-01` was an IPD-locus act receiving IRR facts |
| **Intended IPD path** | `evidence/cross-repository/IIPS_V3_CAP03_DQ6B_DECISION_MIRROR_RECEIPT_2026-10-25.md` |
| **Intended tracker locus** | IPD `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md` (dated entry) |

> **This file is the exact text to publish, not evidence that it was published.** No IPD commit,
> branch, PR, file, package, manifest, schema, migration, protocol, route or source was created or
> modified by this pass. Zero IPD writes were performed.

---

## 1. What the IPD locus receives

| Item | Value to record |
|---|---|
| Determination | **DQ-6b → Path A**: the CAP-03 final QE freeze may designate the qualified **split** primary/alias baseline |
| Primary IPD coordinate | `8eec74ae27cda09f3c368b9c299895eae41554db` / tree `4eba29029f8d95cfe483e615a7047426b298ce50` — IPD `main`, **0 behind** |
| Alias coordinate | `70b24f029842a7e9b7f615e4d9df7376fd4ff817` / tree `cc0f0117822850f9046e9a51bd05c1d45f80cd57` — **214 behind**, ancestor, **interim and guarded** |
| Alias disposition | **Preserved.** Not modernized, not re-pinned, not retired |
| Split status | **INTERIM — not a permanent architecture decision** |
| Lineage classification | **Preserved as-is**: `REAL` at the alias (three mapper sites), `UNCLASSIFIED` at the primary. No reclassification, no requalification |
| Guards | Preserved in force and binding at the freeze; not relaxed |
| IPD-side change required by Path A | **None.** Path A is an IRR-locus act; it mutates no IPD file |
| Modernization follow-on | Open, **not authorized**, off critical path (`CAP03-DQ6B-FOLLOW-ON-ALIAS-MODERNIZATION`) |

## 2. Why the IPD locus is a legitimate recipient

1. The decision **names two IPD commits** and fixes their roles for the CAP-03 freeze. IPD is the
   provider locus and its tracker already carries cross-repository receipts
   (`IIPS_V3_CAP03_IRR_POST_BASELINE_MOVEMENT_RECEIPT_2026-10-24.md` and `…_RECEIPT_2_…`).
2. The receipt is **registration only**. It renders no IPD decision, opens no admission path, and does
   not convert the IRR act into an IPD act.
3. It explicitly preserves the **DQ-6a** IPD disposition
   (`IIPS-V3-IPD-PR42-CLOSE-WITH-RECORD-PA-DISPOSITION-2026-10-24-01`) unchanged. DQ-6b is answered
   without reopening, qualifying or contradicting DQ-6a.

## 3. What publishing this receipt does **not** do

It does not: establish the DQ-4 final QE freeze; adopt H-12; qualify or accept Limb A content;
authorize any IPD package-surface change; add any export or `files` entry; move the alias; reclassify
lineage; lift a fence; start Gate 4; grant QE credit; initiate or admit Gate 5; claim durable-read
acceptance or production eligibility; or create any admission path for IPD PR #42, #34 or #41.

## 4. Exact publication instructions for the IPD-capable session

1. Confirm IPD `main` is still `8eec74ae27cda09f3c368b9c299895eae41554db` (tree `4eba2902…`). If it has
   advanced, re-verify that `package.json` (blob `51796e63…`), `src/persistence/portfolio_store.ts`
   (blob `540d49f2…`) and the three divergent alias sources are unchanged before mirroring; if any has
   changed, **stop** and record drift rather than mirroring a stale coordinate.
2. Add this receipt verbatim at
   `evidence/cross-repository/IIPS_V3_CAP03_DQ6B_DECISION_MIRROR_RECEIPT_2026-10-25.md`.
3. Add a dated entry to the IPD execution tracker naming the IRR act ID, the IRR publication commit and
   this receipt's blob identity.
4. Merge to IPD `main` by **merge commit** with green exact-head CI; record the merge commit, tree and
   post-merge CI run.
5. Read back the receipt blob and SHA-256 from the remote.
6. On completion, effectiveness element **6** of `IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01` is
   satisfied, and the IRR tracker §16.122 records that the six-element set is complete.

## 5. Attestation for this preparation

| Claim | Value |
|---|---|
| IPD file, branch, commit, PR, issue or comment modified by this pass | **NO** |
| This receipt effective | **NO — prepared only** |
| Any effectiveness element claimed as satisfied by this file | **NO** |
| IRR coordinates cited here verified read-only | **YES** — `8eec74ae…`/`4eba2902…`, `70b24f02…`/`cc0f0117…`, IRR `ba64b2d…`/`5e4262f1…` |

*End of prepared IPD mirror receipt — NOT PUBLISHED, NOT EFFECTIVE.*
