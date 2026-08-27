# DEC-G-AI-IMPL-PATH-COUNT — D-11V13 Path-Count Reconciliation

- **Record ID:** `DEC-G-AI-IMPL-PATH-COUNT`
- **Title:** D-11V13 — Change-Surface Path-Count Reconciliation (11 → 13)
- **Class:** `DECISION` / `DOCUMENTATION CORRECTION`
- **Status:** `RECORDED — D-11V13 RESOLVED`
- **Date:** 2026-08-27
- **Authority relationship:** gate `G-AI-IMPL CERTIFICATION-PRECONDITION AUTHORITY`, §4.
  Direction confirmed by the maintainer; recording authority granted at the same gate.
- **Scope:** prose and boundary language in the two **current** authority documents only.
  No implementation code, no test, no historical decision record is altered.

---

## 1. THE DEFECT

`SPEC-G-AI-IMPL` §4's MODIFY table has **six rows**, but **row 5 enumerates three distinct
paths**:

```
| `frontend/src/features/company/CompanyIntelligence.test.tsx` ·
  `frontend/src/features/research/SectorIntelligence.test.tsx` ·
  `frontend/src/features/decision-matrix/DecisionMatrix.test.tsx` | T5, T6 |
```

Counting rows gives 6; counting paths gives 8. The distinct-path surface is therefore
**5 NEW + 8 MODIFY = 13**, while five prose locations said 11:

| Location | Text before |
|---|---|
| `SPEC-G-AI-IMPL.md` §4 heading | `## 4. Change surface — exactly 11 paths` |
| `SPEC-G-AI-IMPL.md` §4 subsection | `### MODIFY — 6` |
| `SPEC-G-AI-IMPL.md` §4 closing sentence | `No path outside these 11 may be created, modified, …` |
| `AUTH-G-AI-IMPL.md` header amendment note | `…(SR-1…SR-5, T1…T10, 11 paths, 10 fences)…` |
| `AUTH-G-AI-IMPL.md` §2 scope table | `5 new files + 6 modified files = 11 paths` |
| `AUTH-G-AI-IMPL.md` §4 boundary line | `Any expansion beyond the 11 authorized paths` |

The last of these is not merely a heading — it is a **boundary statement**. Read alone it
would have excluded two of the eight MODIFY paths that were in fact implemented and pushed.

## 2. WHY 13 WAS ALREADY AUTHORITATIVE

Two durable sources already established 13, and they agree with each other:

1. **COL-5**, `SPEC-G-AI-IMPL` §5.1: *"The existing **13-path implementation surface remains
   authoritative**. No relocation of the three paths is required, and T1–T10 traceability is
   unchanged."* Authorized at the `G-AI-IMPL COLLISION RESOLUTION AUTHORITY` gate
   (`DEC-G-AI-IMPL-COL-RESOLUTION`).
2. **The explicit path table itself**, which enumerates exactly those 13 paths.

`DEC-G-AI-IMPL-COL-RESOLUTION` even recorded the discrepancy in passing: *"SPEC still lists
5 NEW + 6 MODIFY; all 13 present in the worktree."* That record is **historical and is not
rewritten**; it is cited here as corroboration only.

The pushed implementation matches the table exactly: the differing set between trees
`85bbd49` and `e5d59981` is precisely those 13 paths, with no difference in either
direction.

## 3. DECISION

**Documentation arithmetic only.** The authoritative surface was never ambiguous once COL-5
and the table are read together, and the implementation conforms to it. However, a
certification record that repeated "11 paths" would misstate the certified surface, and
`AUTH-G-AI-IMPL` §4's boundary line would be internally contradicted. **Correction is
required before certification cites a path count.**

## 4. AMENDMENTS APPLIED (minimum necessary)

`SPEC-G-AI-IMPL.md`:

| Location | Before | After |
|---|---|---|
| §4 heading | `## 4. Change surface — exactly 11 paths` | `## 4. Change surface — exactly 13 paths (5 NEW + 8 MODIFY)` |
| §4 subsection | `### MODIFY — 6` | `### MODIFY — 8 (six table rows; row 5 enumerates three paths)` |
| §4 closing sentence | `No path outside these 11 may be …` | `No path outside these 13 may be …` |

`AUTH-G-AI-IMPL.md`:

| Location | Before | After |
|---|---|---|
| header amendment note | `…T1…T10, 11 paths, 10 fences…` | `…T1…T10, 13 paths, 10 fences…` |
| §2 scope table | `5 new files + 6 modified files = 11 paths` | `5 new files + 8 modified files = 13 paths` |
| §4 boundary line | `Any expansion beyond the 11 authorized paths` | `Any expansion beyond the 13 authorized paths` |

In every case the change is the numeral and, where useful, a parenthetical explaining the
row-versus-path distinction. **No table row is added, removed or reworded. No path is
introduced. No requirement, obligation or boundary is widened or narrowed.** The set of
authorized paths is bit-for-bit the same set as before; only its stated cardinality is
corrected.

## 5. VERIFICATION

- Distinct paths enumerated in `SPEC-G-AI-IMPL` §4 tables, parsed programmatically: **13**.
- Paths in commit `e5d59981`: **13**.
- Set difference in either direction: **empty**.
- `grep -rn "11 path\|11 authorized\|MODIFY — 6" governance/iips/` after amendment: matches
  remain **only** inside historical `DEC-` records, which are preserved verbatim by design.

## 6. WHAT THIS RECORD DOES NOT DO

| Item | Status |
|---|---|
| Change the authorized path set | **NO** — same 13 paths |
| Add or remove a path | **NO** |
| Alter any requirement (SR, T, D, S, B, COL) | **NO** |
| Rewrite any historical decision record | **NO** |
| Alter implementation or tests | **NO** |
| Certify | **NO** |

## 7. CLASSIFICATION

# **D-11V13 — RESOLVED**

Documentation arithmetic corrected in the two current authority documents. The
authoritative implementation surface is explicitly and consistently **13 paths: 5 NEW + 8
MODIFY**.
