# DEC-D10-PATH-COUNT-CONSISTENCY — D-AUTH-11PATH Resolved

- **Record ID:** `DEC-D10-PATH-COUNT-CONSISTENCY`
- **Title:** D10 — Path-Count Consistency: Confirmation and Correction of `D-AUTH-11PATH`
- **Class:** `DECISION`
- **Status:** `RECORDED — §1 = A, §2 = A2, §3 = B. TWO STANDING STATEMENTS CORRECTED UNDER SEPARATE AUTHORITY`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D10 — AUTH-G-AI-IMPL PATH-COUNT CONSISTENCY / D-AUTH-11PATH`.
  The maintainer selected explicitly per section, then granted **two separate authorities**
  (§3 = B): (a) explicit **amendment authority** for **exactly two named locations**, and
  (b) separate **governance recording authority** on `arena`. Neither was inferred from
  configured credentials, from write capability, or from any prior GO.
- **Scope:** confirmation of one defect and correction of the **two standing statements** that
  carry it. **No product-branch mutation, no matrix amendment, no engine or implementation
  change, no certification, release or tag change, no evidence creation, no H/I/J execution, no
  Tier-3 activity, no P7 reopening, and no rewriting of any historical `DEC-*` record.**
- **Provenance:** read-only discovery against `origin` in the same turn. The authoritative count
  was verified **from the implementation commit itself**, not from prose.
- **Supersession / revision relationship:** amends `AUTH-G-AI-IMPL` §3 item 3 and
  `SPEC-G-AI-IMPL` metadata **Scope**, in each case **preserving the original text** via the
  programme's established `~~original~~ — **AMENDED by …**` convention. Supersedes no record.
  Completes the correction begun by `DEC-G-AI-IMPL-PATH-COUNT` (D-11V13) and closes the item
  reported as `D-AUTH-11PATH` in `DEC-D9-RECORD-CORRECTION` §7.

---

## 1. SELECTIONS

| Section | Question | Selected |
|---|---|---|
| **§1** | Which outcome | **A — confirm `D-AUTH-11PATH` as a factual standing-record defect** |
| **§2** | Amendment scope | **A2 — correct BOTH standing statements** (`AUTH:69` + `SPEC:11`) |
| **§3** | Recording authority | **B — recording + amendment authority**, two separate grants |

---

## 2. PRECHECK STATE

**The sandbox re-provisioned between D9 and D10.** `/home/user` was wiped: the working clones
`iips-gov2…gov8` and all 11 out-of-repo reports were **destroyed**; only
`/home/user/iips-review-recovered` survived. A fresh clone (`iips-gov9`) was taken and every
fact below was re-verified from `origin`, never from local state.

**This is direct empirical confirmation of `DEC-D6-DURABLE-RECORDING-POLICY` (D6 = A):** the D8
and D9 records survived the wipe intact at `origin/arena`, while every out-of-repo artifact did
not.

`git ls-remote origin` → **8 refs**: `arena` `9c5759984d06317dba393da9cbfd39a204bcea5d` ·
`phase13-next` `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` · `main` `c65d533…` ·
`gai-impl-canonical` `f63a9b49…` · `phase13-hardening-delivery` `254e4723…` · tag pair
`a975b0dc…` / `7325aeda…`. `governance/iips/` = **36 records** before this commit. Matrix =
`cada0451400409b0fe9ff0d62309b756c7b45e43`.

---

## 3. §1 = A — THE DEFECT IS CONFIRMED, AND IS IN TWO PLACES

### 3.1 The standing statements (2)

| # | Location | Original wording | Nature |
|---|---|---|---|
| 1 | `AUTH-G-AI-IMPL.md:69` (§3, item 3) | `3. re-verify the exact 11-path delta against the then-current baseline;` | **STANDING** procedural instruction in an `ACTIVE` authorization |
| 2 | `SPEC-G-AI-IMPL.md:11` (metadata **Scope**) | `- **Scope:** the 11-path delta below. …` | **STANDING** scope line in an `ACTIVE (RECONSTITUTED)` specification |

Location 2 was **not reported by D9**, which identified only `AUTH:69`. Its discovery is the
reason §2 option **A2** exists.

Before correction, `SPEC-G-AI-IMPL` **contradicted itself**: line 11 said `11-path`, line 58 said
`## 4. Change surface — exactly 13 paths (5 NEW + 8 MODIFY)`, and line 87 said *"No path outside
these **13** may be created, modified, deleted, renamed, restored, copied, staged, committed or
pushed."*

### 3.2 13 is authoritative — verified from the commit, not from prose

```
git diff-tree --no-commit-id --name-status -r e5d59981c10578db0bf7a5b656acccb9450f45e0
  →  13 paths  =  5 A (new)  +  8 M (modified)
```

| The 5 added paths | The 8 modified paths |
|---|---|
| `frontend/server/ai-advisory-transport.ts` | `frontend/server/executive-transport.ts` |
| `frontend/server/ai-advisory-transport.test.ts` | `frontend/src/app/navigation.test.ts` |
| `frontend/src/api/aiAdvisory.ts` | `frontend/src/features/company/CompanyIntelligence.tsx` |
| `frontend/src/components/ai/AiExplanation.tsx` | `frontend/src/features/company/CompanyIntelligence.test.tsx` |
| `frontend/src/components/ai/AiExplanation.test.tsx` | `frontend/src/features/research/SectorIntelligence.tsx` |
| | `frontend/src/features/research/SectorIntelligence.test.tsx` |
| | `frontend/src/features/decision-matrix/DecisionMatrix.tsx` |
| | `frontend/src/features/decision-matrix/DecisionMatrix.test.tsx` |

The 5 added paths are **exactly** `SPEC-G-AI-IMPL` §4's `### NEW — 5`. The 8 modified paths are
**exactly** §4's `### MODIFY — 8 (six table rows; row 5 enumerates three paths)`. **Set difference
in both directions: empty.** Corroborated by `SPEC-G-AI-IMPL` §5.1 / **COL-5** (*"The existing
13-path implementation surface remains authoritative"*) and by `AUTH-G-AI-IMPL` lines 10, 55, 88,
97 and 104.

### 3.3 Root cause — diagnosed exactly

`DEC-G-AI-IMPL-PATH-COUNT` §5 records its own verification as:

> `grep -rn "11 path\|11 authorized\|MODIFY — 6" governance/iips/` after amendment: matches
> remain **only** inside historical `DEC-` records, which are preserved verbatim by design.

That pattern uses `"11 path"` with a **space**. It **cannot match `11-path` with a hyphen.** All
**6** locations D-11V13 corrected used the spaced form (*"11 paths"*, *"11 authorized paths"*);
the **2** it missed both use the hyphenated form.

**Therefore §5's completeness claim was incomplete when written** — it is not falsified by later
events. Running the corrected pattern `"11-path\|11 path\|11 authorized"` surfaces exactly the two
standing occurrences in §3.1 above. `DEC-G-AI-IMPL-PATH-COUNT` is a historical record and was
**not** amended; this record supplies the correction.

### 3.4 Full occurrence classification — 24 lines / 25 occurrences

| Class | Count | Locations | Disposition |
|---|---|---|---|
| **STANDING — defective** | **2** | `AUTH-G-AI-IMPL:69`, `SPEC-G-AI-IMPL:11` | **CORRECTED** |
| **HISTORICAL — correct as of date** | **20** | `DEC-G-AI-IMPL-B1` (3) · `-B1-AMEND` (3) · `-B1-AUTH-AMEND` (1) · `-BS` (2) · `-PATH-COUNT` (10) · `SPEC-G-AI-IMPL` §4 amendment note — line **61** pre-amendment, line **67** post-amendment, the shift caused by this record's own Scope edit; it is the preserved-original quote of the D-11V13 heading | **NOT AMENDED — history** |
| D9's own defect report | 2 | `DEC-D9-RECORD-CORRECTION:171,192` | **NOT AMENDED** |

### 3.5 Option B was not supportable

11 was **never** a legitimate alternative count. It was a **table-row miscount**: 5 NEW rows +
6 MODIFY rows = 11 **rows**, against 5 + 8 = 13 **paths**, because MODIFY row 5 enumerates three
distinct paths. `DEC-G-AI-IMPL-PATH-COUNT` §1 records this and notes that the §4 boundary line
*"is not merely a heading — it is a **boundary statement**. Read alone it would have excluded two
of the eight MODIFY paths that were in fact implemented and pushed."* **No evidential basis for a
standing 11/13 distinction exists.**

---

## 4. §2 = A2 — CORRECTIONS EXECUTED

Each amendment **preserves the original text** by strikethrough, matching the convention used in
`AUTH-G-AI-IMPL` §4 and applied at D9. Each replacement was verified to match **exactly one**
occurrence before being applied.

| # | Record | Location | Correction |
|---|---|---|---|
| 1 | `AUTH-G-AI-IMPL.md` | §3 item 3, line 69 | `~~11-path~~ **13-path**` + note citing `DEC-G-AI-IMPL-PATH-COUNT` (D-11V13), `SPEC-G-AI-IMPL` §5.1 / COL-5, and independent verification against `e5d59981`; original "11" retained and explained as a row count |
| 2 | `SPEC-G-AI-IMPL.md` | metadata **Scope**, line 11 | `~~11-path~~ **13-path**` + note establishing consistency with §4's heading, §4's closing sentence and D-11V13; original "11" retained and explained as a row count |

Both notes state expressly that **no path is added, removed or reworded**, and that **no
requirement, obligation or boundary is widened or narrowed** — only the stated cardinality is
corrected. This mirrors `DEC-G-AI-IMPL-PATH-COUNT` §4's own guarantee.

---

## 5. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| The authorized **path set** | **UNCHANGED — bit-for-bit the same 13 paths** |
| Every requirement, obligation and boundary | **UNCHANGED** |
| All **20 historical** occurrences of "11" | **UNTOUCHED**, including `DEC-G-AI-IMPL-PATH-COUNT`'s before/after table |
| `DEC-G-AI-IMPL-PATH-COUNT` §5 | **NOT amended** — historical; its incompleteness is corrected by this record instead |
| Root `README.md` (fence `0d759fbdd751…`) | **UNTOUCHED** |
| `phase13-next` and the matrix | **UNTOUCHED — no product-branch mutation** |
| Engines, implementation, certification, release, tag | **UNTOUCHED** |
| H/I/J, Tier 3, P7 | **NO execution, NO activity, NO reopening** |
| Evidence artifacts | **NONE created** |

---

## 6. ADDITIONAL OBSERVATION — reported, NOT remediated

`DEC-G-AI-IMPL-PATH-COUNT:27` reads *"while **five** prose locations said 11"* while the table
immediately following it lists **6** locations. A trivial internal imprecision in a **historical**
record. **Reported and not corrected**; correcting it would require amending a historical `DEC-*`
record, which this gate's guardrails and §2 = A2 both exclude.

---

## 7. OPEN ITEMS AFTER D10

| Item | Status after D10 |
|---|---|
| `D-AUTH-11PATH` | **CLOSED** — both standing statements corrected; 13 confirmed authoritative from the commit |
| `D-HIJ-CONFIG` | **CLOSED at D9** |
| `D-README-STALE` | **CLOSED at D9** |
| H/I/J execution | **DORMANT** — plan recorded at D8, unexecuted; limitation stands and is not self-clearing |
| Tier-3 A1 pathway | **DORMANT** — prerequisites unchanged |
| P7 | **CLOSED as no-referent** at D8 — never PASS, not reopened |
| Sandbox volatility | **ONGOING** — 9th re-provision observed; D6 remains the operative mitigation |

---

## 8. WHAT THIS RECORD DOES NOT DO

No product-branch mutation · no matrix amendment · no change to `ROADMAP.md`, the root
`README.md`, or any fenced file · no engine or implementation change · no change to the
authorized path set · no amendment of any historical `DEC-*` record, including
`DEC-G-AI-IMPL-PATH-COUNT` · no evidence artifact created · no independent-verification report
authored · no verifier engaged or invented · no A2 → A1 transition · no Class A capability status
change · no certification change · no H/I/J execution and no limitation withdrawn · no live
validation performed · no test executed · no server started · no release, version or tag promotion
· no P7 reopening and no P7 status claim · no restoration of historical artifacts · no D5-S1
threshold change · no Tier-3 activity · no branch merged, rebased, created, moved or deleted · no
ref other than `arena` moved · no force-push.

## 9. CLASSIFICATION

# **D10 EXECUTED — §1 = A · §2 = A2 · §3 = B**

`D-AUTH-11PATH` **confirmed and closed**. Two standing statements corrected with original text
preserved; the authorized path set is **unchanged at 13 paths (5 NEW + 8 MODIFY)**, verified
against commit `e5d59981`. All 20 historical occurrences left intact. Root cause recorded: the
D-11V13 verification pattern used `"11 path"` (space) and so could not match `"11-path"`
(hyphen). `phase13-next` and the matrix are **unchanged**. All 14 capabilities remain **Class A**,
**7 A1 / 7 A2**. **STOP after recording — no further authority is held or inferred.**
