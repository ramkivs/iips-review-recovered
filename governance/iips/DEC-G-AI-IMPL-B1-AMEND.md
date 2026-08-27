# DEC-G-AI-IMPL-B1-AMEND — B1 Baseline Authority Amendment Direction

- **Record ID:** `DEC-G-AI-IMPL-B1-AMEND`
- **Title:** B1 — Baseline Authority Amendment Direction
- **Class:** `DECISION`
- **Status:** `RECORDED — DIRECTION ONLY`
- **Date/time:** 2026-08-27
- **Authority relationship:** derives from `DEC-G-AI-IMPL-B1` (which recorded `B1-D`). Selects the
  **direction** in which the baseline authority is to be amended. It does **not** amend
  `AUTH-G-AI-IMPL` or `SPEC-G-AI-IMPL`, and does not perform any transition.
- **Scope:** amendment direction only. B2, B3, B4, S1–S4 are **not** resolved here.
- **Provenance:** direction selected explicitly by the maintainer at the B1-AMEND gate, after the
  three options were evaluated against repository evidence. Technical assessment was reported but was
  not treated as authorization.
- **Supersession / revision:** supersedes no record. `DEC-G-AI-IMPL-B1.md` and
  `DEC-G-AI-IMPL-BS.md` are **not modified** and remain the historical record.

---

## 1. SELECTED DIRECTION

# **DIRECTION A — AUTHORIZE A CONTROLLED TRANSITION TO CANONICAL `85bbd49`**

**DIRECTION ONLY.** The authority has **not** been amended by this record.

---

## 2. B1-D HISTORY

`DEC-G-AI-IMPL-B1` recorded **B1-D — BASELINE AUTHORITY RE-SPECIFICATION REQUIRED**, on the finding
that `AUTH-G-AI-IMPL` authorizes a baseline (`85bbd49`) whose 11-path surface it specifies, while
expressly prohibiting every route to it — and defines no reconciliation mechanism. Neither existing
baseline was both authorized and executable, and no third executable baseline exists in authority.

The amendment direction was deliberately deferred at that gate. This record supplies it.

---

## 3. RATIONALE

Direction A was evaluated against the decision criteria and is the only option that preserves the
authorized scope as written.

| Criterion | A — Canonical | B — Recovery | C — New baseline |
|---|---|---|---|
| Existing implementation scope preserved | **PASS** | FAIL | FAIL |
| Existing 10 fences preserved | **PASS** | FAIL | FAIL |
| SR-4 executable without invention | **PASS** | FAIL | FAIL |
| B2 collision resolved cleanly | **PASS** | FAIL | conditional |
| B3 target availability | **PASS** | FAIL | conditional |
| D5 engine baseline | **PASS** | FAIL | conditional |
| Requires new construction mechanism | NO | NO | **YES** |
| Requires standing constraint amendment | **YES** | NO | **YES** |
| Requires scope re-specification | NO | **YES** | **YES** |

Evidence verified at `85bbd49` before selection:

- all **8** MODIFY targets present, including `SectorIntelligence.test.tsx` and
  `DecisionMatrix.test.tsx`
- all **5** NEW paths **absent** — so they are genuinely new and no recovery evidence is displaced
- all **10** fence paths present and therefore enforceable
- `guardRead` = **1** (`admin-transport.ts:320`); `ENGINE_FACTORY` = **13** registrations
- `iips-platform` = 398 files; `ies-010…ies-020` + `iips-cross-sector` = 370 files

**This rationale is not itself authorization.** The transition remains unauthorized until the
amendment gate records it.

---

## 4. REJECTED DIRECTIONS

### B — recovery re-specification: **REJECTED**

Fails six of nine criteria. Selecting it would require substantive re-specification, not merely
changing the baseline string:

- the two MODIFY targets do not exist at `c65d533`
- SR-4 has no executable basis — `guardRead` = 0, and `admin-transport.ts` is fence 5
- D5 requires 13 engines; recovery registers 10
- the three NEW paths are occupied by fence-10-protected recovery evidence

No compatibility layer may be invented, no second read-authorization model introduced, and no
recovered implementation promoted into authority — so the failures cannot be engineered away.

### C — new reconciled baseline: **REJECTED**

Highest construction complexity. No construction mechanism exists in authority, and creating one
would require explicit authority for the construction method, contributing source commits,
merge/cherry-pick/copy permissions, preservation of protected recovery evidence, incorporation of
canonical-only dependencies, and independent verification of the resulting tree. It would create a
further baseline-construction authorization gate before any implementation could be considered.

---

## 5. EXACT AUTHORITY AMENDMENTS REQUIRED

Direction A requires the following amendments. **None is made by this record.** Each must be
explicitly authorized and recorded by the subsequent **B1 authority-amendment gate**.

| # | Required amendment |
|---|---|
| 1 | **Explicit permission to transition to canonical `85bbd49`** as the executable implementation baseline — removing or qualifying the corresponding entry in `AUTH-G-AI-IMPL` §4 |
| 2 | **Explicit treatment of the standing "do not check out `phase13-next`" constraint** — lifted, qualified, or replaced with a narrower constraint. This constraint is not this programme's alone to lift, so the amendment must state its authority |
| 3 | **Exact permitted transition mechanism** — named precisely (for example: create a new working branch from `85bbd49`, versus check out `phase13-next` directly). **Not specified here**; the amendment gate must define it |
| 4 | **Branch / checkout authority** — which branch implementation occurs on, and how that reconciles with the session branch `arena/01a03e3b-iips-review-recovered` |
| 5 | **Preservation requirements for recovery evidence** — the six recovered AI files are **0 of 6 present** at canonical and **6 of 6 present** at `c65d533`. The amendment must state how fence 10 is honoured when the working tree is canonical: the recovered files are preserved in the recovery branch and its history, and must not be deleted, overwritten, or copied into the canonical tree |
| 6 | **Consequential re-verification** — after transition, the 11-path delta and all 10 fences must be re-verified against the canonical tree before any implementation mutation |

Amendments to the implementation specification, change surface, SR-4, advisor behaviour, advisory text
or execution path are **not** part of this direction and require their own authority-recording steps.

---

## 6. CONSEQUENCES FOR B2 / B3 / B4

Classified only. **Not resolved here.** Each remains **BLOCKED — AWAITING B1 AMENDMENT**.

| Item | Consequence once direction A is amended and executed |
|---|---|
| **B2** — three NEW-path collisions | The collisions **disappear**: all three paths are absent at `85bbd49`, so `NEW` becomes genuinely new and fence 10 is not engaged in the canonical working tree. B2 can then be closed without change-surface re-specification. |
| **B3** — two absent MODIFY targets | Both exist at `85bbd49`, so `MODIFY` becomes executable as written. No canonical-content import is required, because the files are already in the baseline. |
| **B4** — SR-4 / `guardRead` | `guardRead` exists at `85bbd49` (`admin-transport.ts:320`) and SR-4 is unchanged, so B4 becomes **B4-A — resolved by selected baseline**, with fence 5 intact (`guardRead` reused as-is, not modified). |

**S1–S4: UNCHANGED — DEFERRED.** They are independent of the baseline and are not affected by this
direction. They remain blocked on their own product/specification decisions.

---

## 7. THE AUTHORITY HAS NOT BEEN AMENDED

Recorded explicitly, as required:

- `AUTH-G-AI-IMPL.md` — **NOT MODIFIED**
- `SPEC-G-AI-IMPL.md` — **NOT MODIFIED**
- `DEC-G-AI-IMPL-B1.md` — **NOT MODIFIED**
- `DEC-G-AI-IMPL-BS.md` — **NOT MODIFIED**
- Baseline authority — **unchanged**; the authorized target and the prohibited transition both stand
  as previously recorded
- Change surface, SR-4, advisor behaviour, advisory text, execution path — **unchanged**
- No branch switched; `85bbd49` **not** checked out; no baseline constructed, merged, cherry-picked or
  copied
- No standing constraint lifted or altered by this record

---

## 8. IMPLEMENTATION REMAINS BLOCKED

**IMPLEMENTATION: BLOCKED.**

The sequence from here:

1. **B1 authority-amendment gate** — explicitly authorize and record the amendments in §5. Until then
   B1 remains `B1-D` in operative effect and the transition remains unauthorized.
2. **B2 / B3 / B4 resolution gate** — resolve from the canonical baseline state once the amendment is
   durable.
3. **S-series authority gate** — S1, S2, S3, S4 independently.
4. **Controlled implementation gate** — re-verify the durable authorization, specification, all B/S
   decisions, the exact 11-path delta against the then-current baseline, and all 10 fences.

Selecting direction A does **not** authorize implementation, and does not authorize the transition.
