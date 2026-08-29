# DEC-D23-TIER3-METHODOLOGY-DECISION — Tier-3 Methodology Decision: All Three Deferred on Analysis

- **Record ID:** `DEC-D23-TIER3-METHODOLOGY-DECISION`
- **Title:** D23 — Tier-3 Methodology Acceptance Decision Gate: Per-Engine Evidence Analysis and Dispositions
- **Class:** `DECISION`
- **Status:** `RECORDED — IES-016 = DEFER · IES-017 = DEFER · IES-020 = DEFER. NO METHODOLOGY ACCEPTED OR REJECTED. NO HISTORICAL ACCEPTANCE ASSERTED.`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D23 — Tier-3 Methodology Acceptance Decision Gate`, conducted as
  a **read-only decision analysis** followed by an explicit maintainer disposition per engine.
  Depends on `DEC-D17-METHODOLOGY-ACCEPTANCE` (prior state), `DEC-D21-FENCE8-DETERMINATION` §7
  (fence finding) and `DEC-D22-TIER3-METHODOLOGY-ACCEPTANCE-STATUS` (status confirmation). **No
  fence-relief, product-branch-mutation, evidence-creation, certification, matrix or A1/A2
  authority was granted or inferred.**
- **Scope:** determination of the acceptance disposition of `D16 v1.0`, `D17 v1.0` and `D20 v1.0`,
  with the specific blocker recorded for each. **No file modified during analysis. No methodology
  invented or reinterpreted. No missing historical evidence repaired or reinterpreted. No
  implementation authority granted.**
- **Provenance:** every finding re-measured this turn from a detached checkout of
  `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` and from `origin/arena`. Line numbers are from the
  current tree.
- **Supersession / revision relationship:** amends nothing. **Confirms** the `DEC-D17` dispositions
  after a full per-engine content analysis that D17 did not perform, and records the precise
  blockers that must be resolved before any future acceptance.

---

## 1. PRIOR HISTORICAL STATE (unchanged by this record)

| Engine | Methodology | Prior disposition | Decided at |
|---|---|---|---|
| IES-016 Telecommunications | `D16 v1.0` | **DEFERRED** | `DEC-D17` §1 = C |
| IES-017 Automobile | `D17 v1.0` | **DEFERRED** | `DEC-D17` §2 = C |
| IES-020 Materials & Metals | `D20 v1.0` | **DEFERRED** | `DEC-D17` §3 = C |

`DEC-D17` status, verbatim: *"NO METHODOLOGY ACCEPTED OR REJECTED."*

**No historical acceptance is asserted or reconstructed by this record.** All four cited acceptance
records — `D16_AUTHORITY_REVIEW.md`, `D17_AUTHORITY_REVIEW.md`, `D20_AUTHORITY_REVIEW.md`,
`D20_CERTIFICATION_DATA_ACCEPTANCE.md` — were **re-verified as absent** from `phase13-next` this
turn. Their absence remains **explicitly acknowledged**. Any future acceptance is a **fresh
forward-looking decision**, not validation of a historical one.

---

## 2. CURRENT DECISION

# **IES-016 `D16 v1.0` = DEFER · IES-017 `D17 v1.0` = DEFER · IES-020 `D20 v1.0` = DEFER**

The dispositions match the analysis. **None is an acceptance and none is a rejection.** The value
of this gate over D17 is that the **specific blocker is now recorded for each engine**, so a future
gate need not re-derive it.

---

## 3. PER-ENGINE ANALYSIS AND BLOCKERS

### 3.1 IES-016 — `D16 v1.0` — **DEFER** (the only engine where ACCEPT would be coherent)

| Aspect | Finding |
|---|---|
| Methodology considered | Normative calculation contract, §3.1–3.9: metric taxonomy **TC-001…TC-012**, subsegment, archetype, resolution, band scoring, pillar composition, composite, verdict mapping, min-rank overrides. **Does not use the M1–M15/G1–G6 framework** |
| Content available | **19,564 B / 295 lines — the most developed of the three.** Complete calculation, calibration, evidence/provenance, ontology-registration, golden-reference/expected-outputs/replay/fixtures, integration and acceptance-gate contracts, plus a risk register |
| Evidence supporting acceptance | **Internally consistent** — PROPOSED throughout with **no self-contradiction**; explicit no-fabrication statement (§8); engine implemented (11 files) with 2 regression tests |
| **Blockers recorded** | **(B1)** §13 item 2 — unresolved **GATE0 note vs Amendment v1.1 §C** tension · **(B2)** §4 calibration is *"PROPOSED; NOT authoritative until maintainer approval"* and §8 data authority is *"PENDING"* — so accepting "the methodology" would **not** by itself make calibration or data authoritative; a future acceptance must state explicitly whether it covers them · **(B3)** two **false factual claims**: `:295` *"ENGINE IMPLEMENTATION: … NOT EXECUTED"* (11 impl files + 2 tests exist) and `:281` *"lives out-of-repo"* (it is in-repo, 12 files) |
| Do blockers prevent acceptance? | **Not the methodology itself.** B1 is a documentary/historical tension; B2 is a scoping question; B3 are accuracy defects. **ACCEPT would be coherent** provided B1 is resolved and B2 is stated |
| Historical or fresh | **Fresh forward-looking only** |

### 3.2 IES-017 — `D17 v1.0` — **DEFER** (hard blocker)

| Aspect | Finding |
|---|---|
| Methodology considered | **M1–M15** framework (M1/M2/M3 metric taxonomy, M4 subsegments, M5 archetypes, M6 pillars, M7 weights, M10–M15 scoring/normalization/verdict/overrides). Only **G1** and **G6** actually appear in the document |
| Content available | **13,841 B / 246 lines.** **Every substantive section is explicitly prefixed `PROPOSED`** (§2–§7, §12) |
| Evidence supporting acceptance | **Essentially none** — the document labels itself PROPOSED throughout |
| **Blockers recorded** | **(B1)** §13 item 2 — *"**Confidence decision** (Option-A analog) — explicit IES-017 decision required."* An **undecided constituent of the methodology** · **(B2)** §13 item 1 — *"Maintainer acceptance of M1–M15 (**all PENDING** in `D17_AUTHORITY_REVIEW.md`)"*, and that record is **absent** · **(B3)** self-contradiction: `:5` and `:245` assert *"METHODOLOGY ACCEPTED"* while `:8` says PROPOSED and `:238` says *"all PENDING"* (`D-AUTHCLAIM-UNSUPPORTED`) |
| Do blockers prevent acceptance? | **Yes.** B1 is an open decision that is a **component** of the methodology; accepting a methodology with an undecided component is incoherent. **Not REJECT** — the content is largely complete |
| Historical or fresh | **Fresh forward-looking only** |

### 3.3 IES-020 — `D20 v1.0` — **DEFER** (decisive blocker)

| Aspect | Finding |
|---|---|
| Methodology considered | **M1–M15** mapped across §2–§27, with a **G-decision** at §16 |
| Content available | **11,376 B / 222 lines — the least developed.** Nearly all sections PROPOSED; §22 *"ILLUSTRATIVE ONLY"*; §26 *"future, after authority"* |
| Evidence supporting acceptance | **None** |
| **Blockers recorded** | **(B1)** §28 lists **5 unresolved questions requiring authority decisions**: Q1 aluminium placement (`base-metals` vs `specialty-materials`) · Q2 `cashCostCurve` percentile as input primitive vs absolute unit cash cost · Q3 `reserveLife` commodity-weighting · Q4 confidence treatment (G-decision) · Q5 whether `royalty`/`streaming` is a legitimate archetype · **(B2)** **both** `D20_AUTHORITY_REVIEW.md` and `D20_CERTIFICATION_DATA_ACCEPTANCE.md` are **absent** · **(B3)** self-contradiction: `:6` and `:221` assert *"METHODOLOGY ACCEPTED … CERTIFICATION DATA FROZEN"* while `:16` says PROPOSED and `:31` says data authority **PENDING**; the generator `:18` claims an *"ACCEPTED calibration"* |
| Do blockers prevent acceptance? | **Yes, decisively** — 5 open methodology questions, several substantive (input-primitive choice, taxonomy placement, archetype legitimacy). **Not REJECT** — the blockers are open questions, not defects |
| Historical or fresh | **Fresh forward-looking only** |

---

## 4. METHODOLOGY ACCEPTANCE STATUS AFTER D23

| Engine | Methodology | Status |
|---|---|---|
| IES-016 | `D16 v1.0` | **DEFERRED — not accepted, not rejected.** Nearest to acceptable; blockers B1–B3 recorded |
| IES-017 | `D17 v1.0` | **DEFERRED — not accepted, not rejected.** Hard blocker: undecided confidence treatment |
| IES-020 | `D20 v1.0` | **DEFERRED — not accepted, not rejected.** Decisive blocker: 5 open authority questions |

**Cross-engine independence is preserved** per `DEC-D17` §4 = A: each is decided on its own merits,
consistent with the packs' own design (*"Automobile methodology is NOT inherited"*; *"No domain
methodology is inherited"*).

---

## 5. IMPLEMENTATION AUTHORITY — NONE GRANTED

Recording these dispositions grants **nothing**. Separately and explicitly:

| Authority | Granted by D23? |
|---|---|
| Methodology acceptance | **NO — all three deferred** |
| Product / source / test / schema / persistence / parser / UI implementation | **NO** |
| **Fence-8 relief** | **NO** |
| Amendment of `SPEC-G-AI-IMPL` §5 | **NO** |
| The 3-file `D-AUTHCLAIM-UNSUPPORTED` correction | **NO** |
| Evidence creation | **NO** |
| Tier-3 documentation creation (the 60 artifacts) | **NO** |
| Verification | **NO** |
| **A2 → A1 transition** | **NO** |
| Certification of any engine | **NO** |
| Matrix amendment | **NO** |
| Release / tag change | **NO** |
| P7 reopening · H/I/J execution | **NO · NO** |

**Methodology acceptance is distinct from, and prior to, implementation, evidence, verification,
certification and matrix authority.** No engine is certified by this record.

---

## 6. FUTURE DEPENDENCIES

### 6.1 What must be resolved before each engine can be accepted

| Engine | Required before a future ACCEPT |
|---|---|
| **IES-016** | Resolve the GATE0 / Amendment v1.1 §C tension; state explicitly whether acceptance covers §4 calibration and §8 data authority. (The `:281`/`:295` accuracy defects are a separate **fence-8-bound** document correction) |
| **IES-017** | Make the **confidence decision** (Option-A analog); record M1–M15 acceptance. (The `:5`/`:245` vs `:8`/`:238` contradiction is a separate **fence-8-bound** correction) |
| **IES-020** | Decide **Q1–Q5** from §28. (The `:6`/`:221` vs `:16`/`:31` contradiction and generator `:18` are separate **fence-8-bound** corrections) |

### 6.2 The chain remains unbroken and unchanged

```
methodology acceptance              ← STILL DEFERRED (this record changes nothing)
  → fence-8 determination / relief  ← DETERMINED at D-21 §7 (pathway only; NO relief granted)
  → product-branch mutation authority
  → evidence creation
  → verification
  → separate A2 → A1 authority
  → certification / matrix decision
```

**An ACCEPT would unblock nothing on its own.** It would still require fence-8 relief, product-branch
mutation authority, evidence creation, verification, separate A2→A1 authority, and
certification/matrix authority — each its own gate.

### 6.3 Fence-8

**Unchanged.** `D-21 §7 = B — PATHWAY AUTHORIZED / NO RELIEF GRANTED` stands. Recording this
decision under `governance/iips/` **does not require fence-8 relief**, because `governance/`
appears in **0 of the 10** fence rows. **No fence-8 relief was exercised by this gate.**

---

## 7. VERIFICATION

| # | Check | Result |
|---|---|---|
| 1 | Exact artifact changed | `governance/iips/DEC-D23-TIER3-METHODOLOGY-DECISION.md` — **created, working tree only** |
| 2 | Dispositions match the analysis | **YES** — all three DEFER, as recommended |
| 3 | No historical acceptance fabricated | **YES** — §1 records the four cited records as absent; every disposition is DEFER; §3 marks all three "fresh forward-looking only" |
| 4 | Fence-8 unchanged | `SPEC-G-AI-IMPL.md` **UNMODIFIED**; fence-8 text byte-identical |
| 5 | No product files changed | Read-only checkout **DETACHED**, `porcelain=0`; no branch created |
| 6 | Matrix and A1/A2 unchanged | Matrix `cada0451400409b0fe9ff0d62309b756c7b45e43`; **7 A1 / 7 A2**; all Class A |
| 7 | Governance convention | All nine `README` metadata fields present; Class `DECISION`; D12-valid |
| 8 | `git status --porcelain` | reported in-session |
| 9 | Commit | **NONE** |
| 10 | Push | **NONE** |

### 7.1 Durability caveat

Because **no commit and no push** were directed, this record — together with
`DEC-D21-FENCE8-DETERMINATION` and `DEC-D22-TIER3-METHODOLOGY-ACCEPTANCE-STATUS` — exists **only in
the working tree**. Per `DEC-D6-DURABLE-RECORDING-POLICY` the durable store is `origin/arena`, which
still holds **46 records** ending at `DEC-D19`. The sandbox has **re-provisioned 12 times**.
**None of the three will survive the next re-provision** unless separately authorized for commit
and push. No such authority is granted or inferred here.

---

## 8. WHAT THIS RECORD DOES NOT DO

No methodology accepted, rejected or altered · no acceptance record created for any engine · no
historical acceptance asserted, repaired or reinterpreted · no new methodology invented · no
product / source / test / schema / persistence / parser / UI code created or modified · no
product-branch mutation · no push of any ref · no commit · no fence relief and no relaxation of any
fence · no amendment of `SPEC-G-AI-IMPL` §5 · no implementation of the 3-file correction · no
documentation file created · no evidence created · no matrix or inventory change · no A1/A2
authority altered · no engine certified · no release or tag change · no verification performed · no
housekeeping · no P7 reopening · no H/I/J execution · no unrelated governance decision altered · no
branch created, moved or deleted · no force-push.

## 9. CLASSIFICATION

# **D23 RECORDED — IES-016 DEFER · IES-017 DEFER · IES-020 DEFER**

All three Tier-3 methodologies remain **deferred**, now on the basis of a full per-engine evidence
analysis rather than the general deferral recorded at D17. **No methodology is accepted or
rejected, and no historical acceptance is asserted** — all four cited acceptance records were
re-verified as **absent**, and every disposition is marked **fresh forward-looking only**. The
specific blockers are recorded: IES-016 — the GATE0/Amendment tension and the unresolved
calibration/data-authority scope (the **only** engine where ACCEPT would be coherent); IES-017 — an
**undecided confidence treatment** that is a constituent of the methodology; IES-020 — **five open
authority questions**. **No implementation, evidence, relief, certification, matrix or A1/A2
authority is granted.** Fence-8 remains **unchanged and unexercised**. **No commit and no push** —
this record is **working-tree only** and **not durable** until separately authorized. **STOP.**
