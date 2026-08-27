# DEC-G-AI-IMPL-B1 — B1 Executable Baseline Reconciliation Decision

- **Record ID:** `DEC-G-AI-IMPL-B1`
- **Title:** B1 — Executable Baseline Reconciliation
- **Class:** `DECISION`
- **Status:** `RECORDED — B1-D`
- **Date/time:** 2026-08-27
- **Authority relationship:** derives from `AUTH-G-AI-IMPL` and `SPEC-G-AI-IMPL`. Binds the
  controlled-change gate: implementation may not proceed while B1 is `B1-D`.
- **Scope:** **B1 only.** B2, B3, B4, S1, S2, S3 and S4 are **not** resolved here.
- **Provenance:** reached by testing the durable reconstituted authority against repository evidence.
  No baseline was switched, constructed or modified while deciding. The amendment direction was
  **explicitly deferred** by the maintainer rather than selected.
- **Supersession / revision:** supersedes the **B1 outcome** recorded in `DEC-G-AI-IMPL-BS` (which was
  `B1-C — new baseline reconciliation required`) as the operative B1 state. `DEC-G-AI-IMPL-BS` is
  **not modified**; it remains the historical record, and its B2–B4 / S1–S4 entries remain in force
  unchanged.

---

## 1. DECISION

# **B1-D — BASELINE AUTHORITY RE-SPECIFICATION REQUIRED**

The authority itself must be amended before any baseline can be selected. Neither existing baseline is
both **authorized** and **executable**, and no reconciliation mechanism exists in the authority to
bridge them.

### The distinction that decides it

| | Authorized baseline | Executable baseline |
|---|---|---|
| **Canonical `85bbd49`** | **YES** — `SPEC-G-AI-IMPL` targets it; the 11-path surface, `guardRead`, 13 `ENGINE_FACTORY` registrations and both MODIFY targets all exist there | **NO** — every route to it is prohibited |
| **Recovery `c65d533`** | **NO** — never named as the target; cannot host the authorized scope | **YES** — it is the current checkout, but the delta cannot be applied to it |

The two are not interchangeable merely because both are Git commits.

---

## 2. AUTHORITY BASIS

- `AUTH-G-AI-IMPL` §1 authorizes the delta defined in `SPEC-G-AI-IMPL`.
- `SPEC-G-AI-IMPL` §4 specifies an 11-path surface that presupposes the canonical tree: it requires
  canonical `guardRead` (SR-4), 13 registered engines (D5), and two files that exist only on canonical.
- `AUTH-G-AI-IMPL` §4 expressly does **not** authorize: "Baseline transition, branch switch, or
  checkout of `85bbd49`"; "Restoration or copying of canonical files into the recovery checkout";
  "Creation of the two MODIFY targets absent from the recovery baseline"; "Implementation of
  `guardRead` or introduction of a second read-authorization model".
- A search of all durable records found **no** transition mechanism: `reconciled baseline`,
  `synthetic baseline`, `third baseline` and `transition mechanism` each occur **0** times in
  `governance/iips/`.

The authority therefore **authorizes a baseline it simultaneously makes unreachable**, and supplies no
mechanism to reconcile that. Because inventing a mechanism is prohibited, the defect must be corrected
in the authority.

---

## 3. CURRENT AND TARGET BASELINES

| Item | Value |
|---|---|
| Current checkout | recovery `c65d53373717aacc3a1dce12d47b5aeaf50541a5` |
| Authorized target | canonical `85bbd49cd31c215a8fd0e7651b718861944dfe45` |
| `git merge-base` | **NONE** |
| Current branch | `arena/01a03e3b-iips-review-recovered` |
| Durable-authority HEAD at decision time | `ff9c75041c9584f5c2b1ea428e4b0e755e2ab200` |

---

## 4. EVIDENCE

| Test | Recovery `c65d533` | Canonical `85bbd49` |
|---|---|---|
| `guardRead` (SR-4 dependency) | **0** | **1** (`admin-transport.ts:320`) |
| `ENGINE_FACTORY` registrations (D5 requires 13) | **10** | **13** |
| `frontend/src/features/research/SectorIntelligence.tsx` (MODIFY target) | **ABSENT** | **PRESENT** (`3adb39a0befc`) |
| `frontend/src/app/navigation.test.ts` (MODIFY target) | **ABSENT** | **PRESENT** (`ead42f07b4c6`) |
| The three authorized NEW paths | **3 of 3 PRESENT** as protected recovery evidence (`0792a6a4ef32`, `322726b6023c`, `775d9150bd45`) | **0 of 3** present |
| Occurrences of `c65d533` as an authorized target in `SPEC-G-AI-IMPL` | **0** | — |

---

## 5. REJECTED ALTERNATIVES

### B1-A — recovery baseline authorized: **REJECTED**

Fails on five independent grounds:

1. **Authorization** — `SPEC-G-AI-IMPL` never names `c65d533` as the target (0 occurrences).
2. **SR-4 unexecutable** — `guardRead` = 0 at recovery, and `admin-transport.ts` is fence 5, so it may
   not be added.
3. **D5 coverage wrong** — `ENGINE_FACTORY` = 10 at recovery, D5 requires the 13 canonical engines.
4. **MODIFY targets absent** — both exist only on canonical.
5. **Fence 10 violated** — all three NEW paths are occupied by protected recovery evidence.

No compatibility layer was invented.

### B1-B — canonical baseline authorized: **REJECTED — TRANSITION NOT AUTHORIZED**

Canonical is the correct **target** but is not **reachable** under existing authority:

- `AUTH-G-AI-IMPL` §4 prohibits baseline transition, branch switch and checkout of `85bbd49`.
- The standing constraint prohibits checking out `phase13-next` / canonical.
- No durable record permits the transition; the only textual match for "permits … transition" in
  `governance/iips/` is `DEC-G-AI-IMPL-BS:57`, which is that record's own **rejection** of B1-B.

The fact that canonical is the intended target was **not** treated as making it executable. **No
transition was performed.**

### Third executable baseline: **NONE FOUND**

No reconciled, synthetic, ancestor-derived or separately authorized baseline is defined in any durable
record. None was invented, constructed or merged.

### B1-C — new baseline reconciliation required: **SUPERSEDED as the operative state**

`B1-C` was correct as far as it went, and is preserved in `DEC-G-AI-IMPL-BS` as history. It is
superseded here because it identifies a requirement without identifying the blocker. **B1-D** records
the operative finding: the authority itself must be re-specified, because it authorizes a baseline it
prohibits reaching and defines no reconciliation mechanism.

---

## 6. STANDING CONSTRAINTS (unchanged by this decision)

- Do not switch to, or check out, `phase13-next` / canonical `85bbd49`.
- No restoration, copying or overwriting of protected recovery evidence (fence 10).
- No implementation of `guardRead`; no second read-authorization model.
- No route or navigation creation (D3 / D4).
- No change to PC-4, N+5, E2E-017 or the Engine Master Matrix.
- All work remains on the session branch `arena/01a03e3b-iips-review-recovered`.

---

## 7. CONSEQUENCES FOR B2 / B3 / B4

Classified only. **Not resolved here.**

| Item | Consequence of B1-D |
|---|---|
| **B2** — three NEW-path collisions | **Remains BLOCKED.** Its treatment depends on the selected baseline: at recovery the paths are occupied by fence-10 evidence; at canonical all three are genuinely absent and the collision disappears. Cannot be decided until B1 is amended. |
| **B3** — two absent MODIFY targets | **Remains BLOCKED.** Both exist at canonical; neither exists at recovery. Resolves automatically if the amended authority selects canonical, otherwise requires change-surface re-specification. |
| **B4** — SR-4 / `guardRead` | **Remains BLOCKED — baseline dependency.** `guardRead` exists only at canonical. Becomes `B4-A — resolved by selected baseline` if the amended authority selects a baseline containing it, with SR-4 unchanged. |

**S1–S4: UNCHANGED — DEFERRED.** They are independent of the baseline and must not be decided in this
gate.

---

## 8. WHAT UNBLOCKS B1

The authority must be amended in one of three directions. **The maintainer has explicitly deferred
selecting among them**; the choice is reserved to a later authority gate.

| Direction | Effect | Note |
|---|---|---|
| **(a)** Authorize a controlled transition to canonical `85bbd49` | Cleanest. At canonical the three collisions vanish, both MODIFY targets exist and `guardRead` exists — resolving B2, B3 and B4 as consequences | Requires lifting the standing "do not check out `phase13-next`" constraint, which is not this gate's to lift |
| **(b)** Re-specify the scope for the recovery baseline | Redefines the target as `c65d533` and re-specifies the 11-path surface for it | Requires resolving B2 and B3 by re-specification, and an SR-4 basis that does not exist at recovery |
| **(c)** Define and authorize a new reconciled baseline | Establishes a third baseline plus its construction mechanism | Most complex; no such mechanism currently exists in authority |

**No direction is selected by this record.** Until one is, B1 remains `B1-D` and implementation
remains **BLOCKED**.

---

## 9. NO IMPLEMENTATION OCCURRED

| Check | Result |
|---|---|
| Branch switch · checkout of `85bbd49` · merge · rebase · reset | **NONE** |
| Canonical file restoration or copying | **NONE** |
| Recovery evidence overwritten | **NONE** — all six recovered AI files byte-identical |
| Implementation file created or modified | **NONE** |
| Test, frontend, engine, policy or schema change | **NONE** |
| `guardRead` implemented | **NO** — still 0 occurrences at recovery |
| Baseline changed | **NO** — HEAD still descends from `c65d533` |
| Repository mutation in this gate | **authority record only**, within `governance/iips/`, separately authorized by the maintainer |

**IMPLEMENTATION: BLOCKED.**
