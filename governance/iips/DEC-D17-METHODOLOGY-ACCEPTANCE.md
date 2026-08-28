# DEC-D17-METHODOLOGY-ACCEPTANCE — Tier-3 Engine Methodologies Deferred

- **Record ID:** `DEC-D17-METHODOLOGY-ACCEPTANCE`
- **Title:** D17 — Tier-3 Engine Methodology Acceptance: All Three Deferred; Acceptance Precondition Verified as Unsatisfiable
- **Class:** `DECISION`
- **Status:** `RECORDED — §1 = C · §2 = C · §3 = C (ALL DEFERRED) · §4 = A. NO METHODOLOGY ACCEPTED OR REJECTED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D17 — Tier-3 Engine Methodology-Acceptance Gate`. The
  maintainer selected **C (Defer)** for each of the three engine methodologies, **A** for
  cross-engine consistency, and granted **durable recording authority on `arena`** separately.
  **No acceptance, rejection, execution, evidence-creation, fence-relief, product-branch,
  A1-transition, matrix or certification authority was granted or inferred.**
- **Scope:** determination of acceptance status for the repository's `D16 v1.0`, `D17 v1.0` and
  `D20 v1.0` engine methodologies; verification of the gate's own acceptance precondition;
  recording of two new integrity findings. **No methodology accepted or rejected, no
  documentation created, no evidence created, no product-branch mutation, no fence relief, no
  A1/A2 change, no matrix change.**
- **Provenance:** read-only discovery against `origin` in the same turn. The absence of the cited
  records was tested by filename **and** content across **five refs plus `arena`**.
- **Supersession / revision relationship:** amends nothing. Carries forward `DEC-D16-TIER3-DOCUMENTATION-PARITY-EXECUTION`
  unchanged: the documentation-parity programme remains blocked because the prerequisite
  established there is **not met** by this gate.

**Namespace discipline:** throughout this record, `D16 v1.0`, `D17 v1.0` and `D20 v1.0` denote the
**repository's** IES-016 / IES-017 / IES-020 methodology contracts. They are **not** governance
gates. See `DEC-D16-TIER3-DOCUMENTATION-PARITY-EXECUTION` §10 (`D-NS-COLLISION`).

---

## 1. SELECTIONS

| Section | Question | Selected |
|---|---|---|
| **§1** | IES-016 methodology (`D16 v1.0`) | **C — Defer** |
| **§2** | IES-017 methodology (`D17 v1.0`) | **C — Defer** |
| **§3** | IES-020 methodology (`D20 v1.0`) | **C — Defer** |
| **§4** | Cross-engine consistency | **A — accept independently; no common-methodology requirement** |
| **§5** | Recording authority | **GRANTED** — this record, on `arena` only |

**No methodology was accepted and none was rejected.**

---

## 2. PRECHECK STATE

**No re-provision this turn.** `git ls-remote origin` → **8 refs**, identical to the D16
end-state: `arena` `4f1f78b096d43bb1a4f1f68fb17100ddcabbddd6` · `phase13-next`
`357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` · `main` `c65d533…` · `gai-impl-canonical`
`f63a9b49…` · `phase13-hardening-delivery` `254e4723…` · tag pair `a975b0dc…` / `7325aeda…`.
`governance/iips/` = **43 records** before this commit. Matrix =
`cada0451400409b0fe9ff0d62309b756c7b45e43`.

---

## 3. THE GATE'S ACCEPTANCE PRECONDITION — VERIFIED AS **UNSATISFIABLE**

D17 required explicit verification that the cited acceptance records exist **before allowing an
Accept outcome**. Searched by filename **and** by content, across five refs **and** `arena`:

| Cited record | `origin/main` | `origin/phase13-next` | `origin/gai-impl-canonical` | `origin/phase13-hardening-delivery` | `85bbd49…` | `origin/arena` |
|---|---|---|---|---|---|---|
| `D16_AUTHORITY_REVIEW.md` | **0** | **0** | **0** | **0** | **0** | **0** |
| `D17_AUTHORITY_REVIEW.md` | **0** | **0** | **0** | **0** | **0** | **0** |
| `D20_AUTHORITY_REVIEW.md` | **0** | **0** | **0** | **0** | **0** | **0** |
| `D20_CERTIFICATION_DATA_ACCEPTANCE.md` | **0** | **0** | **0** | **0** | **0** | **0** |

Files whose **name** matches `AUTHORITY_REVIEW` or `CERTIFICATION_DATA_ACCEPTANCE`: **0 on every
ref, including `arena`**. The tokens survive only as **citations inside 5 files**:

| File | Nature of the citation |
|---|---|
| `ies-016-telecommunications/TELECOMMUNICATIONS_DISCOVERY_PACK.md` | §13: *"see the companion `D16_AUTHORITY_REVIEW.md` decision matri[x]"* |
| `ies-017-automobile/AUTOMOBILE_DISCOVERY_PACK.md` | *"recorded 2026-08-20 in `D17_AUTHORITY_REVIEW.md`"* |
| `ies-020-materials-metals/MATERIALS_METALS_DISCOVERY_PACK.md` | *"see `D20_CERTIFICATION_DATA_ACCEPTANCE.md`"* |
| `ies-017-automobile/contract-tests/generate_expected_outputs.py` | *"derives from the **PROPOSED** calibration … (see `D17_AUTHORITY_REVIEW.md`)"* |
| `ies-020-materials-metals/contract-tests/generate_expected_outputs.py` | *"derives from the **ACCEPTED** calibration (see `D20_AUTHORITY_REVIEW.md`, recorded 2026-08-20)"* |

**Consequence:** the precondition **cannot be satisfied from the repository as it stands**. An
**Accept** outcome was therefore **precluded for all three engines by the gate's own rule**. The
maintainer selected **Defer** for each, which is consistent with that finding.

---

## 4. NEW FINDING — `D-AUTHCLAIM-UNSUPPORTED` (recorded, not remediated)

**IES-017 and IES-020 each simultaneously assert acceptance and denial of acceptance, and both
rest the assertion on records that do not exist.**

| Engine | Asserts **ACCEPTED** | Asserts **PROPOSED / PENDING** |
|---|---|---|
| **IES-016** | — | *"NOT authoritative until the D16 methodology is approved by the maintainer/domain authority"* · *"Data authority: **PENDING — maintainer acceptance required**"* · §13: *"**this is a proposal**"* |
| **IES-017** | line 5: *"**METHODOLOGY ACCEPTED** (M1–M15 ACCEPTED + G1–G6 DECIDED, recorded 2026-08-20 in `D17_AUTHORITY_REVIEW.md`)"* | line 8: *"**Status: PROPOSED**"* · *"Data authority: **PENDING**"* · line 31: *"requires **fresh M1–M15 authority**"* · generator: *"**PROPOSED** calibration"* |
| **IES-020** | header block: *"**STATUS: METHODOLOGY ACCEPTED**"* · *"Certification data is **FROZEN**"* · generator: *"**ACCEPTED** calibration … recorded 2026-08-20"* | line 16: *"**Status: PROPOSED**"* · *"Data authority: **PENDING**"* |

The sharpest instance is **IES-020**, where the generator asserts an **ACCEPTED** calibration
while the pack states **Data authority: PENDING** — both citing the same absent record.

**Mitigating fact recorded in fairness:** both generators state prominently *"THIS IS A REFERENCE
ORACLE / TRANSCRIPTION TOOL ONLY. It is **NOT an authority**."*

**Disposition:** recorded and **not remediated**. The affected files are on `phase13-next`, a
product branch. **No product-branch mutation is authorized by this gate**, and none was performed.

---

## 5. ACCEPTANCE RECORDED ON `arena` COULD NOT SATISFY THE PACKS' CONDITION

Even had a methodology been accepted, recording that acceptance in `governance/iips/` would **not**
have satisfied the packs, because:

1. the packs require acceptance ***via*** `D16_/D17_/D20_AUTHORITY_REVIEW.md`;
2. those files would live in the engine directories, which exist only on product branches —
   `ies-016/017/020` = **12 files each** on `origin/phase13-next` and `origin/gai-impl-canonical`,
   and **0 / 0 / 0** on `origin/arena`;
3. `merge-base(arena, phase13-next)` = **NONE** and `merge-base(arena, gai-impl-canonical)` =
   **NONE**.

**So an Accept on `arena` would have left every pack still reading `PROPOSED`.** Satisfying the
packs requires **product-branch mutation**, which no gate in D8–D17 has authorized. This is
recorded so no future gate mistakes a governance-store acceptance for repository-level acceptance.

---

## 6. §4 = A — THE THREE METHODOLOGIES ARE INDEPENDENT BY DESIGN

| Pack | Verbatim |
|---|---|
| **IES-017** | *"Automobile methodology is **NOT inherited**"* · *"IES-016 (D16) methodology **does NOT transfer**"* · *"requires **fresh M1–M15 authority**"* |
| **IES-020** | *"**No domain methodology is inherited**"* · *"structural/process precedent **ONLY**"* |
| **Shared** | the **19-stage lifecycle** process framework |

**§4 = A is therefore a ratification of the repository's own design.** Each methodology is decided
on its own merits; no common decision is required, and none is imposed.

**§4 Option B** (*"require a common methodology decision before any acceptance"*) would have
contradicted the packs' explicit design and was **not** selected.

---

## 7. WHAT DEFERRAL MEANS CONCRETELY

| Property | Value |
|---|---|
| IES-016 / 017 / 020 methodology status | **UNDECIDED — deferred** |
| Any methodology accepted | **NO** |
| Any methodology rejected | **NO** |
| Repository packs' status | **UNCHANGED — still `PROPOSED`** |
| D16 prerequisite (methodology acceptance) | **NOT MET** |
| Documentation-parity programme (60 artifacts) | **REMAINS BLOCKED** — D16 §1 = E stands |
| Artifacts created | **NONE — 0 of 60** |
| A2 → A1 transition | **NONE — IES-016/017/020 remain A2** |

**What would unblock it:** creation of the engine-specific acceptance records in the engine
directories on a product branch, under **product-branch mutation authority** that does not
currently exist — followed by a further acceptance decision at a gate of its own.

---

## 8. AUTHORITY SEPARATION

Stated separately. **Nothing below is authorized by this gate.**

| Authority | Granted by D17? |
|---|---|
| Methodology acceptance or rejection | **NO — all three deferred** |
| Documentation creation | **NO** |
| Evidence creation | **NO** |
| Implementation authorization | **NO** |
| **Fence-8 relief** | **NO** |
| **A2 → A1 transition** | **NO** |
| Certification change | **NO** |
| Matrix amendment | **NO** |
| Product-branch mutation | **NO** |
| P7 reopening | **NO** |

**No authority not explicitly granted has been inferred** — not from configured credentials, not
from write capability, not from technical convenience, and not from any prior GO.

---

## 9. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| Artifacts created | **0 of 60** |
| `ies-016/017/020` on every ref | **UNTOUCHED — 12 files each on product refs, 0 on `arena`** |
| All ten fences, including fence 8 | **INTACT — no relief** |
| A1 / A2 status of all 14 capabilities | **UNCHANGED — 7 A1 / 7 A2** |
| All capabilities Class A | **UNCHANGED** |
| **D7-3 = A** | **PRESERVED** |
| Matrix `cada04514004…` and `phase13-next` | **UNTOUCHED** |
| All dated `DEC-*` records | **UNTOUCHED** |
| Root `README.md` fence `0d759fbdd751…` | **UNTOUCHED** |
| H/I/J · P7 | **NOT executed · NOT reopened** |

---

## 10. THE SINGLE NEXT GATE

Identified from the resulting state. **Not pre-authorized and not executed by this record.**

Every remaining actionable item now requires **product-branch mutation**, which no gate in D8–D17
has authorized:

| Remaining item | Requires |
|---|---|
| Methodology acceptance records (`D16_/D17_/D20_AUTHORITY_REVIEW.md`) | product-branch mutation |
| Correction of `D-AUTHCLAIM-UNSUPPORTED` | product-branch mutation |
| Documentation-parity programme (60 artifacts) | product-branch mutation **+ fence-8 relief** |
| Any A2 → A1 transition | matrix amendment **+ certification authority** |
| H/I/J execution | infrastructure that is **unobtainable** (D13) |

Meanwhile the standing-governance record set is **internally consistent and complete**: every
identified defect is closed (`D-HIJ-CONFIG`, `D-AUTH-11PATH`, `D-README-STALE`, `D-CLASS-DUAL`),
the verification methodology is established (D15), and the classification convention validates
(D12).

# **`D18 — PRODUCT-BRANCH AUTHORITY BOUNDARY GATE`**

It would decide the single remaining question: **whether this programme proceeds into
product-branch territory at all**, or concludes at the governance-record boundary. Until that is
decided, no further item above is actionable.

**This record pre-authorizes nothing in D18.**

---

## 11. WHAT THIS RECORD DOES NOT DO

No methodology accepted, rejected or altered · no acceptance record created · no documentation
authored · no artifact created · no evidence created · no product-branch mutation · no fence-8
relief and no relaxation of any fence · no A1 transition · no evidence-maturity change · no matrix
amendment · no engine or implementation change · no certification-result change · no release,
version or tag change · no correction of `D-AUTHCLAIM-UNSUPPORTED` · no verifier engaged, invented
or simulated · no Tier-3 exception created · no Class A capability status change · no P7 reopening
and no P7 status claim · no H/I/J execution · no amendment of any existing record · no restoration
of historical artifacts · no D5-S1 threshold change · no branch merged, rebased, created, moved or
deleted · no ref other than `arena` moved · no force-push.

## 12. CLASSIFICATION

# **D17 RECORDED — §1 = C · §2 = C · §3 = C · §4 = A**

All three Tier-3 engine methodologies are **deferred**. The gate's own acceptance precondition was
verified as **unsatisfiable**: `D16_AUTHORITY_REVIEW.md`, `D17_AUTHORITY_REVIEW.md`,
`D20_AUTHORITY_REVIEW.md` and `D20_CERTIFICATION_DATA_ACCEPTANCE.md` are **absent from all five
refs and from `arena`**, surviving only as citations in 5 files. **No methodology was accepted or
rejected.** New finding **`D-AUTHCLAIM-UNSUPPORTED`** recorded: IES-017 and IES-020 each assert
**ACCEPTED** and **PROPOSED** simultaneously, resting on absent records. Recorded also that a
governance-store acceptance **could not** satisfy the packs' condition, because the acceptance
vehicle lives on a product branch and `merge-base` to both product refs is **NONE**. §4 = A
ratifies the packs' own explicit design that **no domain methodology is inherited**. **0 of 60
artifacts created; fence 8 intact; no A1 transition; D16's programme remains blocked.** Next gate
identified as **`D18 — PRODUCT-BRANCH AUTHORITY BOUNDARY GATE`** and **not** pre-authorized.
`phase13-next` and the matrix are **unchanged**. All 14 capabilities remain **Class A**,
**7 A1 / 7 A2**. **STOP after recording — no further authority is held or inferred.**
