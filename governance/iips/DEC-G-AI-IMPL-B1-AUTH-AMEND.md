# DEC-G-AI-IMPL-B1-AUTH-AMEND — B1 Canonical Baseline Authority Amendment

- **Record ID:** `DEC-G-AI-IMPL-B1-AUTH-AMEND`
- **Title:** B1 — Canonical Baseline Authority Amendment
- **Class:** `DECISION`
- **Status:** `RECORDED — B1 AUTHORITY AMENDED`
- **Date/time:** 2026-08-27
- **Authority relationship:** derives from `DEC-G-AI-IMPL-B1` (B1-D) and `DEC-G-AI-IMPL-B1-AMEND`
  (direction A). Amends `AUTH-G-AI-IMPL` §4 and adds §6. Does **not** amend `SPEC-G-AI-IMPL`,
  `DEC-G-AI-IMPL-BS`, `DEC-G-AI-IMPL-B1` or `DEC-G-AI-IMPL-B1-AMEND`.
- **Scope:** baseline authority only — amendments #1…#6. Does **not** resolve B2, B3, B4 or S1–S4, and
  does **not** authorize implementation.
- **Provenance:** the three grants required by amendments #2, #3 and #4 were issued **explicitly by
  the maintainer** at this gate. None was inferred. `SPEC-G-AI-IMPL` and the three prior `DEC-` records
  are unmodified; history is not rewritten.
- **Supersession / revision:** amends `AUTH-G-AI-IMPL` as described. Supersedes the operative effect of
  `B1-D` (which required this re-specification) while preserving `DEC-G-AI-IMPL-B1` as history.

---

## 1. PRIOR STATE

| Item | Value |
|---|---|
| B1 prior state | **B1-D — BASELINE AUTHORITY RE-SPECIFICATION REQUIRED** (`DEC-G-AI-IMPL-B1`) |
| Selected direction | **A — CANONICAL TRANSITION** (`DEC-G-AI-IMPL-B1-AMEND`) |
| Authority before this gate | **not amended** — `AUTH-G-AI-IMPL` blob `1d38903f8aad`, unchanged since creation |
| Transition before this gate | **not performed** — HEAD descended from `c65d533`, not `85bbd49` |

B1-D arose because `AUTH-G-AI-IMPL` authorized a baseline it simultaneously made unreachable, with no
reconciliation mechanism. This record supplies the missing authority.

---

## 2. THE SIX AMENDMENTS

All six are recorded in `AUTH-G-AI-IMPL` §6. Summary:

| # | Amendment | State |
|---|---|---|
| 1 | **Executable baseline** — `85bbd49` is both the authorized target and the authorized executable baseline *after* the transition gate succeeds; current checkout remains `c65d533` | **ESTABLISHED** |
| 2 | **Standing `phase13-next` constraint** — scoped exception granted | **ESTABLISHED** |
| 3 | **Transition mechanism** — `git checkout --detach 85bbd49cd31c215a8fd0e7651b718861944dfe45` | **ESTABLISHED** |
| 4 | **Branch authority** — detached HEAD; no branch created, moved or deleted | **ESTABLISHED** |
| 5 | **Recovery evidence preservation** — six blobs preserved; no deletion, overwrite, replacement, copying, restoration or modification | **ESTABLISHED** |
| 6 | **Post-transition verification** — nine mandatory checks after transition, before implementation | **ESTABLISHED** |

---

## 3. EXACT AUTHORITY BASIS

| Amendment | Basis |
|---|---|
| #1 | `SPEC-G-AI-IMPL` §4 already specifies an 11-path surface that presupposes canonical; verified at `85bbd49` — all 8 MODIFY targets present, all 5 NEW paths absent, all 10 fence paths present, `guardRead` = 1, `ENGINE_FACTORY` = 13 |
| #2 | **Explicit maintainer grant at this gate.** The constraint originates from the session-level standing instruction and the session's own operating rule — **not** from IIPS governance. `DEC-G-AI-IMPL-B1-AMEND:103` had already recorded that it "is not this programme's alone to lift, so the amendment must state its authority"; the permitting authority is therefore named as the maintainer |
| #3 | **Explicit maintainer grant at this gate**, selecting the detached-checkout mechanism from the evaluated options |
| #4 | **Explicit maintainer grant at this gate**, selecting detached HEAD over branch creation or direct `phase13-next` checkout |
| #5 | Fence 10 of `SPEC-G-AI-IMPL`; six blob identities verified at this gate |
| #6 | Required by this gate; the nine checks are derived from the established baseline facts |

---

## 4. CONSTRAINTS LIFTED / EXCEPTIONED

| Constraint | Effect |
|---|---|
| Session-level "do not check out `phase13-next`" | **Exception granted, scoped to this controlled transition only.** Not deleted, not weakened, and creates **no** general branch-switching permission. Remains in full force outside the single authorized transition |
| `AUTH-G-AI-IMPL` §4 "Baseline transition, branch switch, or checkout of `85bbd49`" | **Amended** — the original text is preserved with strikethrough for history; the prohibition continues to apply to every form of transition other than the §6.3 mechanism |

**Not lifted:** every other entry in `AUTH-G-AI-IMPL` §4, all 10 fences, D1–D8, SR-1…SR-5, T1…T10, and
the prohibitions on merge, rebase, cherry-pick, reset, branch creation/deletion, and copying or
reconstructing canonical content.

---

## 5. TRANSITION MECHANISM

```
git checkout --detach 85bbd49cd31c215a8fd0e7651b718861944dfe45
```

Rejected alternatives, with reasons:

| Alternative | Rejected because |
|---|---|
| Merge canonical into the arena branch | Prohibited; also `merge-base` = NONE |
| Rebase onto canonical | Prohibited |
| Cherry-pick canonical files | Prohibited |
| Reset the arena branch to `85bbd49` | Prohibited, and would destroy the 4 governance commits (`191d595`, `ff9c750`, `e8adce5`, `798101b`) |
| Copy or reconstruct canonical content | Prohibited |
| Check out `phase13-next` as a branch | Barred by the standing constraint beyond the scoped exception, and places work on shared canonical history |
| Create a new branch at `85bbd49` | Conflicts with the session's fixed-branch rule |

The detached mechanism is **non-destructive**: it moves no ref, creates no branch and rewrites no
history.

---

## 6. BRANCH AUTHORITY

- `arena/01a03e3b-iips-review-recovered` — **unchanged**; not moved, reset, merged, rebased or deleted
- **No new branch** created
- Implementation checkout state — **detached HEAD at `85bbd49`**
- Authority records remain on the **arena branch**, unaffected by the detach
- **Recorded consequence:** work performed while detached is on no branch. Publication of any
  implementation work would require its own explicit branch and push authority, which this record does
  **not** grant

**No branch was changed while recording this amendment.**

---

## 7. EVIDENCE-PRESERVATION RULE

The six recovered AI files (`0792a6a4ef32`, `322726b6023c`, `775d9150bd45`, `2bcaac3329de`,
`8eda5c51b21b`, `1113a6e3023b`) are evidence and history. Their existence authorizes **no** deletion,
overwrite, replacement, copying into canonical, restoration into another tree, or modification for
implementation. The authorized mechanism leaves them present and unmodified at
`arena/01a03e3b-iips-review-recovered` and at `c65d533`. Fence 10 applies in every tree.

---

## 8. POST-TRANSITION VERIFICATION

Mandatory, **after** the transition and **before** implementation — nine checks recorded in
`AUTH-G-AI-IMPL` §6.6: canonical HEAD; detached state; `ENGINE_FACTORY` = 13; `guardRead` = 1; all
MODIFY targets present; all five NEW paths absent; recovery evidence intact; clean worktree; all 10
fences re-verified.

---

## 9. B2 / B3 / B4 — EXPECTED DEPENDENCY ONLY

**Not resolved here.** Each must be verified **after** the transition.

| Item | Expectation |
|---|---|
| **B2** | The three NEW-path collisions are expected to disappear — all three paths are absent at `85bbd49`. **Verify after transition** |
| **B3** | The two MODIFY targets are expected to exist at `85bbd49`. **Verify after transition** |
| **B4** | `guardRead` is expected to exist at `85bbd49`, making SR-4 executable as written. **Verify after transition** |

These consequences are **not** implementation permission.

## 10. S1–S4 — UNCHANGED

`S1 BLOCKED · S2 BLOCKED · S3 BLOCKED · S4 BLOCKED`. The canonical transition decision is **not** used
to infer advisor behaviour, advisory text, execution path, or AI fallback semantics.

---

## 11. B1 STATUS AFTER THIS AMENDMENT

```
B1-D  →  B1-AUTH-AMENDED  →  canonical baseline authorized, transition mechanism defined
      →  controlled baseline-transition + verification gate  →  B1 operationally executable
```

**B1 is NOT operationally complete.** `AUTH-G-AI-IMPL` has been amended, but the actual checkout
remains `c65d533` until the subsequent transition gate runs and passes verification.

---

## 12. NO TRANSITION AND NO IMPLEMENTATION OCCURRED

| Check | Result |
|---|---|
| Baseline transition performed | **NO** — no checkout, detach, merge, rebase, reset or branch change |
| Current checkout | recovery `c65d533` lineage; HEAD remains on `arena/01a03e3b-iips-review-recovered` |
| Implementation file created or modified | **NONE** |
| Canonical file restored or copied | **NONE** |
| Recovery evidence deleted, overwritten or modified | **NONE** |
| Tests, frontend, engine, policy or schema changed | **NONE** |
| `SPEC-G-AI-IMPL`, `DEC-G-AI-IMPL-BS`, `DEC-G-AI-IMPL-B1`, `DEC-G-AI-IMPL-B1-AMEND` | **NOT MODIFIED** |
| Repository mutation in this gate | `governance/iips/AUTH-G-AI-IMPL.md` (amended) and this record (created) — authority only |

**IMPLEMENTATION: BLOCKED.**
