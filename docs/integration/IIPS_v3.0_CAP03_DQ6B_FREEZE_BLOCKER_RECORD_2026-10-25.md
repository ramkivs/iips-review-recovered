# IIPS v3.0 CAP-03 — DQ-6b Freeze Blocker Record

**Blocker ID:** `IIPS-V3-CAP03-DQ6B-FREEZE-BLOCKER-2026-10-25-01`
**Date:** 2026-10-25
**Repository locus:** IRR — `ramkivs/iips-review-recovered`
**Tracker locus:** §16.121 (`CV-CORR-101`, `CHG-2026-10-25-26`)
**Companion brief:** [`IIPS_v3.0_CAP03_DQ6B_FREEZE_DISPOSITION_DECISION_BRIEF_2026-10-25.md`](IIPS_v3.0_CAP03_DQ6B_FREEZE_DISPOSITION_DECISION_BRIEF_2026-10-25.md)
(`IIPS-V3-CAP03-DQ6B-FREEZE-DISPOSITION-DECISION-BRIEF-2026-10-25-01`)

## Status: **OPEN — BLOCKING. UNRESOLVED PENDING PROGRAM AUTHORITY (PA) DECISION.**

---

## 1. What is blocked

| Blocked item | Identifier this pass | Status |
|---|---|---|
| DQ-4 final QE freeze | `CHG-2026-10-25-24` / `CHG-2026-10-25-25` | **NOT ESTABLISHED** — blocked |
| Exact final repository-pin designation | IRR candidate `907e1fdac76612c9e171774aab079b4862d35ef2` / tree `0ad2ad717cdf63a9b675045e0049e8d5d1e4bac0`; IPD candidate `8eec74ae27cda09f3c368b9c299895eae41554db` / tree `4eba29029f8d95cfe483e615a7047426b298ce50` | **NOT DESIGNATED** — blocked |
| Exact final npm pin designation | Primary `8eec74ae…` (final-ready); alias `70b24f02…` (disposition pending) | **NOT DESIGNATED** — blocked |
| H-12 regeneration / validation / adoption | 32 IPD + 24 IRR = 56 | **NOT ADOPTED** — blocked pending exact commits |
| Gate 4 execution | — | **AUTHORIZED — NOT STARTED** — QE `0/11` |
| Gate 5 | — | **NOT INITIATED / NOT ADMITTED** |

## 2. Why it is blocked

DQ-6b is **unanswered**, and the DQ-4 final QE freeze cannot be written without an answer.

A final freeze manifest must state the `iips-broker-import` alias disposition, because:

1. The alias is a **distinct dependency coordinate into the same repository** —
   `70b24f029842a7e9b7f615e4d9df7376fd4ff817` (IPD tree `cc0f0117822850f9046e9a51bd05c1d45f80cd57`,
   **214 commits behind** IPD `main`, full-history ancestor).
2. It is **not cosmetic**: it supplies the fourteen raw TypeScript sources compiled by
   `frontend/tsconfig.broker-import.json` (blob `a339c9c4def365f0b80295bb32ad74cf2f95a9bd`) into
   `.cache/broker-import`, which `frontend/src/api/brokerHoldingsPreview.ts`
   (blob `bf079a1b587cebf582c03a7aa2c99b87cf890f73`) imports to back the live, PO-accepted
   **DB-C1** `/broker-holdings` preview.
3. It is **not collapsible by a pin change**: re-pinning the alias to the modern commit fails
   `build:broker-import` with `TS18003` (evidence `21`), and that script gates
   `predev`/`prebuild`/`pretest`/`pretest:ci`/`pretypecheck`.
4. It is **not semantically neutral**: the mapper's `sourceClassification` changes `REAL` →
   `UNCLASSIFIED` at three sites between the alias pin and IPD `main`.

## 3. Authority gap — exact statement

No effective decision resolves DQ-6b. Established by eight independent searches (brief §3, S-1…S-8):

- The DQ-1…DQ-7 packet (`IIPS-V3-CAP03-PA-DECISION-PACKET-DQ1-DQ7-2026-10-24-01`, blob
  `9ccc0b0687f6a3bacad1b12189f4f022d23407c1`) is **PROPOSED — NOT EFFECTIVE**; its DQ-6b
  answer-sheet row is **blank**.
- The effective CAP-03 one-pass PA decision record (blob `624632bb022c147e7df477a7d77d96793d484035`)
  states verbatim: **"DQ-6 and DQ-7 are not answered or altered by this pass."**
- The only effective act in the DQ-6 family — `IIPS-V3-IPD-PR42-CLOSE-WITH-RECORD-PA-DISPOSITION-2026-10-24-01`
  (IPD locus) — answers **DQ-6a** and states **"DQ-6b remains open and untouched."**
- Full-history pickaxe across IRR (**1,038 commits**) and IPD (all branches), added-file censuses,
  and `gh search issues` for `DQ-6b` in both repositories returned **no DQ-6b decision record**.
- **0 open PRs** in both repositories; no pending vehicle carries one.

> **This is a genuine authority boundary, not an evidentiary shortfall.** The investigation is
> complete; the missing element is a rendered PA determination.

## 4. Why the packet's own framing does not resolve it

The packet framed DQ-6b as two options, and **neither is presently executable**:

| Framed option | Status |
|---|---|
| **(i)** Re-pin alias to the DQ-4 freeze commit + guard both | **Impossible** — `TS18003` (brief §4.4) |
| **(ii)** Retire the alias | **Unavailable** — conditioned on the preview surface being retired; DB-C1 is live and PO-accepted (brief §4.8) |

The only executable and fully guarded configuration — preserve the alias as a documented, guarded
compatibility baseline — is **not among the framed options**. DQ-6b has therefore escalated from a
routine off-critical-path tick to a **freeze-blocking determination** requiring a fresh PA act.

## 5. Options presented to the PA

| Option | Meaning | Executable today | Requires |
|---|---|---|---|
| **A** | Freeze the qualified **split** primary/alias baseline, alias documented + guarded | **Yes** (IRR `106 files / 1,350 tests`; harness `15/15`) | PA act rendering DQ-6b (Path A) |
| **B-1** | Modernize via **IPD package-surface change** (new governed export / `files` entry) | No | IPD-side PA authority + IPD implementation + requalification |
| **B-2** | Modernize via **IRR broker-build redesign** (stop compiling installed raw source) | No (needs a published IPD export, or IRR re-implementation) | IRR implementation-authority act; in practice depends on B-1 |

Common tail under either B option (brief §6.4): lineage requalification (`REAL` → `UNCLASSIFIED`),
DB-C1 preview requalification, guard-test rewrite (`brokerImportPackageConsumer.test.ts` blob
`0a1e58de…`; `reports-persistence-integration.test.ts` blob `4f6024f0…` line 84), toolchain
re-validation, bilateral harness re-execution, and H-12 re-derivation.

**Preparer's recommendation (NOT a decision): Path A**, per brief §10. Conditions C-1…C-5 are
suggested for the PA to adopt, reject or amend.

## 6. Exact conditions that clear this blocker

All six must be satisfied (brief §9):

1. A **census-checked act ID** rendered by the **Program Authority**;
2. **Verbatim determination text** naming the chosen option and every fixed semantic — alias
   disposition, whether the split is permanent or interim, and the lineage classification
   authoritative for QE;
3. **Named commits / trees / manifest blobs** at the freeze;
4. **Merge to the governing locus `main`** with green exact-head CI — and, if Path B, **also to the
   IPD locus**, because a package-surface change is an IPD-locus act;
5. **Independent remote read-back**;
6. A **dated receipt mirrored** into the other repository's tracker.

A recommendation, brief, draft, or PR description is **never** effectiveness.

## 7. What this pass did and did not do

**Did:** re-verified both remotes; executed eight authority searches; independently re-verified
every technical claim (primary/alias pins, `files: ['dist/package']` vs no restriction, the
fourteen required sources, `TS18003`, the `REAL` → `UNCLASSIFIED` change at three sites, the guard
test, the harness `15/15`, and the DB-C1 preview dependency chain); and published this blocker
record plus the companion brief in the IRR locus.

**Did not:** render or infer a PA decision; answer DQ-6b; designate any pin; establish the freeze;
re-pin any dependency; modify any IRR source, test, build or tsconfig; adopt H-12; start Gate 4;
grant QE credit; initiate or admit Gate 5; perform any host operation; or write to IPD.

**Zero IPD writes.** IPD accessed read-only at `8eec74ae27cda09f3c368b9c299895eae41554db`.

## 8. Preserved in force

DR-4r/DQ-3 **Option B** (empty contributions pass; non-empty contributions refuse); the effective
CAP-03 one-pass PA decision record; the DQ-4 pin-reconciliation record and all failed-candidate
evidence; the DQ-1…DQ-7 packet as **PROPOSED — NOT EFFECTIVE**; all frozen G2/schema/protocol/
route/fence blobs; all `503` fences; `SESSION_ONLY`/`durable:false`; `WRITE_NOT_AUTHORIZED`;
Gate 3 acceptance for bounded scope; production non-eligibility.

## 9. Single next dependency-respecting action

**Obtain the PA's rendered DQ-6b determination (Path A or Path B, with B-1/B-2 and locus if Path
B).** Only after that act is effective may the exact final repository pins be designated and H-12
be regenerated, validated and put forward for adoption in the Gate 4 sequence.

*End of blocker record — OPEN, BLOCKING, UNRESOLVED PENDING PA DECISION.*
