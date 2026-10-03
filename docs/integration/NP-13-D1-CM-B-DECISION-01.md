# NP-13 — D1 COMPLETION MODEL: CM-B DURABLE PUBLICATION

> **Record identifier:** `NP-13-D1-CM-B-DECISION-01` — D1 Completion Model (CM-B) Decision Publication
> **Document type:** `AUTHORITY DECISION` — additive durability publication of an already-final decision; not a re-selection, not a reinterpretation, not a new semantic act
> **Gate:** **NP-13 — CM-B Durable Publication & Final Durability Gate (fresh-session recovery)**
> **Publication record date:** 2026-10-03
> **Program Authority:** Ramki (Ramakrishnan)
> **Repository:** IRR — `ramkivs/iips-review-recovered`
> **Authoritative durability destination:** `origin/main` (`refs/heads/main`)
> **Decision published:** **CM-B — Preserve necessary-only / non-exhaustive completion model; remain open**
> **Resulting state:** **D1 completion model = NECESSARY CONDITIONS ONLY / NON-EXHAUSTIVE** · **D1 = OPEN / INCOMPLETE / NOT CLOSED** · **D2 = NOT ELIGIBLE** · **D3 = NOT ELIGIBLE**
> **Implementation:** **NOT AUTHORIZED**
> **Production:** OUT OF SCOPE
> **IPD:** OUT OF SCOPE — READ-ONLY / NOT ACCESSED / NOT MODIFIED
> **Authority granted by this record:** **NONE**

---

## 1. PURPOSE, CHARACTER, AND EXECUTION BOUNDARY

1.1 **Purpose.** This record durably publishes the already-decided CM-B disposition of the D1 completion-model question: the necessary-only / non-exhaustive model is preserved, and D1 remains open. This is a recovery publication of a previously blocked attempt; the previous attempt failed closed because live GitHub state could not be established, and no mutation occurred in that attempt.

1.2 **Character — durability only.** This is a **durability / publication gate only**. It does **not** reinterpret, re-decide, expand, narrow, or convert the CM-B decision. It does not convert CM-B into CM-A or CM-C. It does not add new completion semantics. It performs **no** implementation work, does not modify IPD, and does not create or advance D2 or D3 eligibility.

1.3 **Execution boundary.**

| Boundary | State |
|---|---|
| Repository | **IRR** — `ramkivs/iips-review-recovered` |
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative ref | `origin/main` (`refs/heads/main`) |
| IPD | **OUT OF SCOPE** — not accessed, not modified |
| Production | **OUT OF SCOPE** |
| Implementation | **NOT AUTHORIZED** |
| D2 / D3 | **NOT ELIGIBLE** |

1.4 **Fresh-session rule applied.** This publication did not trust any previously cached baseline. At the start of this session, live GitHub connectivity was established, live authoritative `origin/main` and its tree were retrieved via `git fetch origin` and the GitHub API (`gh api repos/ramkivs/iips-review-recovered/git/ref/heads/main` and `.../commits/main`), repository identity was verified (`ramkivs/iips-review-recovered`, default branch `main`), and the newly retrieved live `main` was used as the mutation baseline. The historical value `d8c55469f198731293ff7fc3b8ff683692ff19f7` was treated strictly as historical evidence (it is in fact the first parent of the live `origin/main` commit) and was not assumed current.

1.5 **Additive character.** This record is additive only. It does not amend, replace, correct, restate-as-authority, or supersede any predecessor record. In particular it does not modify:

- `NP-13-D0-01.md`
- `NP-13-D1-01.md`
- `NP-13-D1-C-01.md`
- `NP-13-D1-PREREQ-01.md`
- `NP-13-GO3B-01.md`
- `NP-13-GO3B-DECISION-01.md`
- `NP-13-PA-D1-DECISION-01.md`
- `NP-13-PA-D1C-DECISION-01.md`

1.6 **Git workflow is not governance.** Branch creation, commit, push, pull request, and merge are **publication mechanics**. They create no implementation authority, resolve no D1-C dimension, establish no D2/D3 eligibility, and create no separate D1 acceptance state.

---

## 2. PUBLISHED CM-B DECISION (REPRODUCED VERBATIM)

2.0 **Reproduction rule.** The decision below was made by Program Authority before this publication. It is reproduced in substance and without addition; it is not re-selected here.

> **CM-B — Preserve necessary-only model and remain open**
>
> ```text
> D1 completion model
> = NECESSARY CONDITIONS ONLY / NON-EXHAUSTIVE
> ```
>
> No sufficient completion set is established.
>
> D1 remains OPEN / INCOMPLETE / NOT CLOSED.
>
> The known necessary conditions remain necessary.
>
> The currently known conditions are not an exhaustive completion set.
>
> No D1 completion may be declared from the existing condition set alone.
>
> Unresolved completion-model semantics remain unresolved.
>
> This decision does not resolve D1-C semantics.

2.1 This decision is consistent with, and is a durable publication alongside, the previously published `PA-D1-03 = 03-C — NECESSARY CONDITIONS ONLY / D1 REMAINS OPEN` recorded at `NP-13-PA-D1-DECISION-01 §2.3`. CM-B does not alter, narrow, or expand `PA-D1-03`; it records the same necessary-only, non-exhaustive disposition under its CM-B label.

---

## 3. PRESERVED HISTORICAL GOVERNANCE STATE (BASELINE)

3.1 The following pre-existing authoritative governance state is **preserved exactly** and is not altered by this record.

```text
PA-D1-01 = 01-A
PA-D1-02 = 02-B
PA-D1-03 = 03-C
PA-D1-04 = 04-A
```

```text
PA-D1C-01 = 01-B
PA-D1C-02 = 02-B
PA-D1C-03 = 03-B
PA-D1C-04 = 04-B
PA-D1C-05 = 05-B
PA-D1C-06 = 06-B
PA-D1C-07 = 07-B
PA-D1C-08 = 08-B
PA-D1C-09 = 09-B
PA-D1C-10 = 10-B
```

```text
G-O-3(b) A–G
= ACCEPTED / DURABLE / CLOSED

D1 prerequisite ordering
= UNRESOLVED

D1-C #1–#10
= REQUIRED / NOT YET FULLY RESOLVED

D2
= NOT ELIGIBLE

D3
= NOT ELIGIBLE

IMPLEMENTATION
= NOT AUTHORIZED
```

3.2 **No alteration.** None of the decisions in §3.1 is altered, reinterpreted, qualified, or reopened by this record.

---

## 4. REQUIRED COMPLETION-CONDITION STATE (PRESERVED MATRIX)

| Condition | Status |
|---|---|
| C1 — D1-A form selected | Necessary · Satisfied |
| C2 — D1-B definition established | Necessary · Satisfied |
| C3 — G-O-3(b) resolved | Necessary · Satisfied · Not sufficient |
| C4 — D1-C resolved | Necessary · Partial / Open |
| C5 — D1-C #1–#10 resolved | Necessary · Not satisfied / Open |
| C6 — Completion model closed by later explicit act | Necessary · Not satisfied / Open |

4.1 **Explicit non-exhaustiveness statement.**

```text
C1–C6 are NOT an exhaustive completion set.

C1–C6 are NOT sufficient for D1 completion.

CM-B deliberately preserves the necessary-only,
non-exhaustive model.
```

4.2 This matrix is reproduced from the existing decision record; it is not re-derived or re-evaluated by this publication.

---

## 5. D1-C — UNTOUCHED BY THIS PUBLICATION

5.1 This record resolves none of D1-C dimensions #1–#10. The following dimensions remain exactly as previously decided:

```text
#1 Stable baseline identifier
#2 Identifier form
#3 Version / epoch
#4 Temporal / effective point
#5 Full continuity
#6 Trigger mechanics
#7 Complete identity-preservation semantics
#8 Governed-object supersession
#9 Collision handling
#10 Ownership
```

5.2 Preserved status, unchanged:

```text
#1–#4, #8–#10
= DECIDED TO REMAIN UNRESOLVED

#5
= BOUNDED SEMANTICS PRESERVED / FULL CONTINUITY UNRESOLVED

#6–#7
= PRIOR PARTIAL SEMANTICS PRESERVED / REMAINDER UNRESOLVED
```

5.3 This record does not resolve D1-C semantics (§2.0) and makes no D1-C resolution claim of any kind.

---

## 6. D1 ACCEPTANCE AND DOWNSTREAM ELIGIBILITY (PRESERVED)

6.1 Preserved exactly:

```text
D1 COMPLETE
= condition-satisfaction state

D1 ACCEPTED
= no separate acceptance state established
```

6.2 No acceptance mechanism is created by this record.

6.3 No inference is drawn or permitted:

```text
D1 COMPLETE → D2 eligible   (NOT INFERRED)
D1 COMPLETE → D3 eligible   (NOT INFERRED)
```

6.4 D2 and D3 remain **NOT ELIGIBLE**.

---

## 7. LIVE PRE-MUTATION VERIFICATION PERFORMED

7.1 The following checks were performed against live GitHub state before any mutation, using the newly retrieved live `main` as baseline:

| # | Check | Result |
|---:|---|---|
| 1 | Repository identity (`gh repo view` → `nameWithOwner`) | `ramkivs/iips-review-recovered` — **MATCH** |
| 2 | Authoritative remote (`git remote -v`) | `origin` → `https://github.com/ramkivs/iips-review-recovered.git` — **MATCH** |
| 3 | Live `origin/main` (`git fetch origin` + `gh api .../git/ref/heads/main`) | `5ca181c7564a063a01265efdfdc5996563888d49` — **RETRIEVED LIVE** |
| 4 | Live main tree (`gh api .../commits/main` → `commit.tree.sha`) | `d428cdd6afa7f91ccf8f8301a312b35540ec2ca3` — **RETRIEVED LIVE** |
| 5 | Current branch / session | `arena/01a10089-iips-review-recovered`, based at `5ca181c7564a063a01265efdfdc5996563888d49` — **MATCH TO LIVE MAIN** |
| 6 | Clean worktree (`git status --porcelain`) | clean — **PASS** |
| 7 | Absence of colliding CM-B artifact (`find . -iname "*CM-B*"`) | none found — **PASS** |
| 8 | All eight predecessor artifacts present (`docs/integration/NP-13-*`) | `NP-13-D0-01.md`, `NP-13-D1-01.md`, `NP-13-D1-C-01.md`, `NP-13-D1-PREREQ-01.md`, `NP-13-GO3B-01.md`, `NP-13-GO3B-DECISION-01.md`, `NP-13-PA-D1-DECISION-01.md`, `NP-13-PA-D1C-DECISION-01.md` — **ALL PRESENT** |
| 9 | Predecessor blob identities recorded (`git hash-object`) | recorded in §8 below — **PASS** |
| 10 | PA-D1C artifact | `NP-13-PA-D1C-DECISION-01.md` present, blob `7b5ca0be27dcc7e9e58208964da895dfa23aef46` — **PASS** |
| 11 | PA-D1 artifact | `NP-13-PA-D1-DECISION-01.md` present, blob `596db534ec73607c69024b82ade542774d406eed` — **PASS** |
| 12 | G-O-3(b) artifact | `NP-13-GO3B-DECISION-01.md` present, blob `58e0df8739cbfef823216c560573bb4d6f43b7e8` — **PASS** |
| 13 | No unrelated local changes | `git status --porcelain=2 --branch` clean prior to this artifact — **PASS** |
| 14 | IPD not accessed | no IPD repository present or referenced in this session — **PASS** |

7.2 **Historical baseline note.** `d8c55469f198731293ff7fc3b8ff683692ff19f7` (the previously recorded baseline) was verified, via live retrieval, to be the first parent of the current live `origin/main` commit `5ca181c7564a063a01265efdfdc5996563888d49` (PR #27, `NP-12 N4-A12` authority-record publication). It is historical evidence only and was not assumed current; the live value retrieved in this session is the mutation baseline.

---

## 8. PREDECESSOR BLOB IDENTITIES AT TIME OF THIS PUBLICATION

Recorded for independent predecessor-integrity verification. These files are not modified by this record.

| Artifact | Git blob SHA-1 (pre-mutation) |
|---|---|
| `docs/integration/NP-13-D0-01.md` | `8caa2d3e8f9564231a51ba053d08ccb19fdbd0bb` |
| `docs/integration/NP-13-D1-01.md` | `3468cdaa4e72ce5d33ecfc219706877a2a319541` |
| `docs/integration/NP-13-D1-C-01.md` | `8e9688ed102493a342ada1c6d9f1b3b6d6a58b04` |
| `docs/integration/NP-13-D1-PREREQ-01.md` | `5fea4a54fbf81da8b5f6e4730f3da5727a7bf4e7` |
| `docs/integration/NP-13-GO3B-01.md` | `89366b72bdf00d10950a1a90d33f16bd0c978acf` |
| `docs/integration/NP-13-GO3B-DECISION-01.md` | `58e0df8739cbfef823216c560573bb4d6f43b7e8` |
| `docs/integration/NP-13-PA-D1-DECISION-01.md` | `596db534ec73607c69024b82ade542774d406eed` |
| `docs/integration/NP-13-PA-D1C-DECISION-01.md` | `7b5ca0be27dcc7e9e58208964da895dfa23aef46` |

These blob identities must be unchanged after this record's publication commit and merge; a change to any of them indicates an unrelated mutation outside the scope of this gate.

---

## 9. RESULTING GOVERNANCE STATE (SUMMARY)

| Governance item | State |
|---|---|
| **D1 completion model** | **NECESSARY CONDITIONS ONLY / NON-EXHAUSTIVE** |
| **D1** | **OPEN / INCOMPLETE / NOT CLOSED** |
| **D1-C #1–#10** | **REQUIRED / NOT YET FULLY RESOLVED** |
| **D2** | **NOT ELIGIBLE** |
| **D3** | **NOT ELIGIBLE** |
| **Implementation** | **NOT AUTHORIZED** |
| **G-O-3(b) A–G** | **ACCEPTED / DURABLE / CLOSED** |
| **D1 prerequisite ordering** | **UNRESOLVED** |
| **D1 acceptance** | **NO SEPARATE ACCEPTANCE STATE** |
| **IPD** | **OUT OF SCOPE — UNTOUCHED** |
| **Production** | **OUT OF SCOPE — UNTOUCHED** |

---

## 10. NO NEW SEMANTICS, NO SCOPE EXPANSION

10.1 This record introduces no new completion semantics, no new D1-C resolution, no sufficient or exhaustive completion claim, no implementation authority, and no D2/D3 advancement.

10.2 This record does not resolve D1-C semantics (§2.0, §5.3).

10.3 This record does not convert CM-B into CM-A or CM-C, and does not modify any predecessor artifact (§1.5, §8).

10.4 Authority granted by this record: **NONE**.

---

**End of `NP-13-D1-CM-B-DECISION-01`.**
