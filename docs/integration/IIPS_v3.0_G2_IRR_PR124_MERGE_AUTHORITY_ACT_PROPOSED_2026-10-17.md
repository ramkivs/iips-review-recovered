# IIPS v3.0 — IRR — **PR #124 merge authority — ACT PREPARED FOR DECISION**

> ## STATUS: **PROPOSED — NOT APPROVED — NOT AUTHORITY TO MERGE**
> This artifact puts **one** matter to the Program Authority: **`D-IRR-124` — authority to merge
> IRR PR #124**, whose two records are already published on the PR branch and green in hosted CI.
> **It contains no rendered approval, no approver, and no implied consent.** Nothing in it may be
> cited as authority, and PR #124 must **not** be merged until the Authority renders this act in its
> own words.
>
> An `ACCEPT` of this act authorizes **one merge of one PR at one content set**, at the exact head the
> rendering records. It does **not** authorize adapter implementation, adapter publication, a Gate B
> ref change, Gate C/D/E, a pin change, promotion, admission, release or production.
>
> **Publication note (`2026-10-17`, added on amendment).** This act is itself published through PR
> #124, so publishing it necessarily moved the PR head after this document was first drafted. The act
> is therefore expressed against a **content set** (§1.1) plus a **head recorded at rendering**, not
> against a head that its own publication would invalidate. The earlier draft's literal head
> `238e73b…` and 2-file count are superseded by §1.1 and are preserved only in the amendment note
> in §6.

| Field | Value |
|---|---|
| **Act identifier** | `IIPS-V3-IRR-PR124-MERGE-AUTHORITY-2026-10-17-01` |
| **Artifact type** | **Prepared merge-authority act** — a request for decision; renders nothing |
| **Repository / branch (this record)** | `ramkivs/iips-review-recovered` / `arena/53704c04-iips-review-recovered` (this session branch) |
| **Authority capacity required to render** | **RAMKI — Program Authority**, acting in the **IRR capacity** |
| **Subject of the authority** | Merge **PR #124 only**, at the exact head named in §2 |
| **Production status** | NON_PRODUCTION — one user, one personal laptop, `H-18` scope |
| **Prepared at** | `2026-10-17` (Asia/Calcutta), against the live remote |

---

## 1. What PR #124 is

PR #124 carries **additive IRR documentation** and **nothing else**. It is a documentation PR; it
changes no product code, test, configuration, dependency, pin, fence, route or authority.

| # | Record | File | What it does |
|---|---|---|---|
| 1 | **§16.43 (`CV-CORR-26`)** — Group 1A receipt | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | Records the executed **D1** merge of PR #117 with remote-verified coordinates, and the **IRR-side D3 findings** (pin untagged; no IPD tag contains `2e11fa3b…`) |
| 2 | **§16.44 (`CV-CORR-27`)** — D12 assessment | tracker **and** `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D12_REBASELINE_ASSESSMENT_2026-10-17.md` | The **assessment only** that the `D-4` baseline is stale and the eight-file adapter re-applies cleanly; expressly **grants nothing** |
| 3 | **§16.45 (`CV-CORR-28`)** — decision package | tracker | Records that **this act** and the **D12 act** are *prepared, not rendered* |
| 4 | **This act**, prepared | `docs/integration/IIPS_v3.0_G2_IRR_PR124_MERGE_AUTHORITY_ACT_PROPOSED_2026-10-17.md` | The request being decided — **grants nothing by itself** |
| 5 | **The D12 act**, prepared | `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D12_REBASELINE_AUTHORITY_ACT_PROPOSED_2026-10-17.md` | A **separate** request — **not** covered by this act (§3.2) |

### 1.1 The content set this act may merge

**Four files**, all documentation:

1. `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`
2. `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D12_REBASELINE_ASSESSMENT_2026-10-17.md`
3. `docs/integration/IIPS_v3.0_G2_IRR_PR124_MERGE_AUTHORITY_ACT_PROPOSED_2026-10-17.md` *(this act)*
4. `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D12_REBASELINE_AUTHORITY_ACT_PROPOSED_2026-10-17.md`

**No path outside that list.** Zero product, test, configuration, dependency, pin, fence, route or
evidence paths. Observed content delta at the amended draft: **4 files, +788 / −1**.

## 2. Verified state at preparation (live remote, read-only)

| # | Check | Verified value |
|---|---|---|
| 1 | IRR `main` | `4368a8d407f71dd84633a501ae1a003612fd28fe`, tree `128eec64ed52d571377b27e2d15de68a44a614c0` |
| 2 | PR #117 | **MERGED** `2026-10-17T13:23:53Z`; head `7c8a180…`; merge `4368a8d…`; post-merge CI `39036388471` **success** |
| 3 | **PR #124 state** | **OPEN**, `mergedAt` **null** — at the amended draft: head `1004b9a…`, `MERGEABLE`/`CLEAN`, CI `39038415527` **success** |
| 4 | **PR #124 head** | **recorded at rendering** — the head must be named in the rendering text. At the amended draft: `1004b9a173398d0d2683f0d34efd7d27552b4b46` (superseded by any later amendment) |
| 5 | **PR #124 content** | **4 files**, +788 / −1 — the content set of §1.1; nothing else |
| 6 | **PR #124 mergeability** | `mergeable` **MERGEABLE**, `mergeStateStatus` **CLEAN** |
| 7 | **PR #124 exact-head CI** | runs `39037920409` (at `238e73b…`) and `39038415527` (at `1004b9a…`) — both **`success`** (`Typecheck · Test · Build`). The rendering must cite the run at **its** recorded head |
| 8 | PR #124 reviews / comments | **none** — no review, no approval, no authority-bearing comment |
| 9 | Existing acts covering this merge | **none** — `D1` names PR **#117** only; no act names PR #124 |
| 10 | Protected fences on `main` | `cb8db45d…`, `51704c12…`, `93f602fd…`, `d1c52fe6…`, `56fd4826…`, `98147054…` — all unchanged |

**Why authority is genuinely required.** PR #124 is mergeable and green, and that is **not** merge
authority. `D1` is scoped to PR #117 by its own text. No other act mentions PR #124. The only
reviewer-capacity holder is the Program Authority.

---

## 3. THE DECISION REQUESTED

> **`D-IRR-124` — Merge authority for IRR PR #124.**
>
> **`ACCEPT`** / **`DECLINE`** / **`ACCEPT WITH CHANGES`** (state the changes).

If rendered `ACCEPT`, the act authorizes **exactly** the following, and nothing more:

| Element | Fixed by this act |
|---|---|
| **PR** | `ramkivs/iips-review-recovered` **#124** |
| **Head** | **the exact head recorded in the rendering text**; if the head moves after rendering, this act does **not** apply and a fresh rendering is required |
| **Base** | `main` at **`4368a8d407f71dd84633a501ae1a003612fd28fe`** |
| **Records covered** | §16.43 (`CV-CORR-26`), §16.44 (`CV-CORR-27`) with its D12 assessment, §16.45 (`CV-CORR-28`), and the two **prepared** acts — **all five**, i.e. the §1.1 content set exactly |
| **Merge method** | **Regular merge commit** (`--merge`), consistent with PR #117. **Not** squash, **not** rebase. |
| **Pre-merge conditions** | (i) PR head equals the head recorded in the rendering; (ii) `mergeable` = `MERGEABLE` and `mergeStateStatus` = `CLEAN`; (iii) the check at **that** head is `SUCCESS`; (iv) the diff is exactly the §1.1 content set — **4 documentation paths, 0** product/test/config/dependency/pin paths; (v) all six fence blobs byte-identical at the PR head |
| **Post-merge verification** | (i) merge commit SHA and parents recorded; (ii) hosted CI on the merge commit is `success`; (iii) the two changed paths match at `main` and at the merged head; (iv) `§16.43` and `§16.44` are present at `main`; (v) the six fences still byte-identical at `main`; (vi) any new receipt is recorded **additively** and **without** claiming a further authority |

### 3.1 What an `ACCEPT` would make effective

- The Group 1A receipt becomes **durable** rather than branch-resident.
- The **D12 assessment** becomes a durable record the PA can then act on — **as an assessment**,
  with its `STATUS: ASSESSMENT ONLY` banner intact.
- The **D3 findings** become part of the authoritative record, so the IPD-side tagging obligation is
  visible to the IPD-bound session without relying on chat.

### 3.2 What an `ACCEPT` explicitly does **NOT** do

| Not granted | Why it matters |
|---|---|
| **Adapter implementation authority** | `D12` is a separate act; this act touches no adapter file |
| **Adapter publication** | No PR may be opened from a Gate B ref under this act; §16.44 records that none is |
| **Any Gate B ref change** | `gate-b/local-principal-ipc-implementation` stays at `6c654be…`; no ref created, moved or deleted |
| **`D12` itself** | The act renders no baseline, no ref strategy, no tree identity |
| **Gate C qualification, Gate D admission, Gate E write policy** | Separate later acts; the `503` fence stays in force |
| **Promotion (`INV-04`/`D10`), CV-52 admission, `P-6`/`P-8`** | Untouched |
| **Pin change (CV-25) or any IPD act** | `2e11fa3b…` unchanged; IPD is not written |
| **Production, release or "Group 1 complete"** | Not claimed; `CV-25` and `D2b` remain open |

---

## 4. Options considered and why `ACCEPT` is recommended

| Option | Effect | Assessment |
|---|---|---|
| **`ACCEPT` at the rendered head** (recommended) | Makes the receipt and the assessment durable; unblocks a clean `D12` rendering against a published record | **Recommended.** The PR is documentation-only, green, and touches no product path. It is the only way the D12 assessment stops being branch-resident. |
| **`DECLINE`, keep #124 open** | No record is durable; the D3 findings and the D12 assessment stay on a branch | Defensible, but leaves the authority gap undocumented in the authoritative record — the exact condition the roadmap's `A4` identifies as the reason the Gate chain drifted. |
| **`ACCEPT WITH CHANGES`** | e.g. merge §16.43 only, or require a §16.44 amendment | Workable; the act must then name the amended head, and this proposal's exact-head condition means a **new rendering** is required after any change. |
| **Merge and render `D12` in the same act** | Bundles two separable authorities | **Not recommended.** The program's established discipline separates publication from implementation (`D-2` vs `D-4`; `D-GC` §3 lists four separable acts). Bundling would be a precedent change requiring explicit statement. |

**Sequencing note.** `D12` **may** be rendered before or after this merge. It is **safer after**,
because `D12` would then cite a **published** assessment rather than a branch-resident one — but no
recorded dependency requires that order. `D12` is **not** a precondition of this act, and this act is
**not** a precondition of `D12`.

---

## 5. Amendment note

**Amendment 1 (`2026-10-17`).** The first draft of this act named head `238e73b…` and "2 files". Publishing
the act and the D12 act onto the same PR branch necessarily moved the head, which would have made the
act's own exact-head condition unsatisfiable. The act therefore now fixes a **content set** (§1.1) and
requires the **rendering** to record the head. The superseded values are preserved in this note rather
than silently rewritten. **No scope was added**: the added files are the two prepared acts themselves,
which grant nothing.

## 6. Boundaries preserved by this preparation

- **No merge** was performed; PR #124 remains **OPEN**, `mergedAt` null.
- **No** adapter file, product file, test, configuration, dependency, pin or fence was modified.
- **No** ref was created, moved or deleted; **no** PR was opened from a Gate B ref.
- **No** IPD write; IPD was read with `git ls-remote` only.
- **No** Windows/browser acceptance performed or claimed; **no** Gate C/D/E execution.
- **No** authority rendered or implied; `D12` remains **NOT GRANTED**.

*End of the prepared act `IIPS-V3-IRR-PR124-MERGE-AUTHORITY-2026-10-17-01` — PROPOSED · NOT APPROVED ·
NOT AUTHORITY TO MERGE · PR #124 OPEN · HEAD RECORDED AT RENDERING · NON_PRODUCTION.*
