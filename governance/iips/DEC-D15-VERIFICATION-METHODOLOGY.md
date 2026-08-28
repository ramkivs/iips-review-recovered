# DEC-D15-VERIFICATION-METHODOLOGY — Authoritative Verification Model Established

- **Record ID:** `DEC-D15-VERIFICATION-METHODOLOGY`
- **Title:** D15 — Verification-Independence Labelling and Methodology: Role Separation plus Clean-Workspace Reproducibility Established as the Programme Standard
- **Class:** `DECISION` / `METHODOLOGY AUTHORITY`
- **Status:** `RECORDED — §1 = A · §2 = B · §3 = SAME METHODOLOGY, EXPLICITLY LABELLED. NO EVIDENCE CREATED, NO A1/A2 CHANGE`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D15 — Verification-Independence Labelling and Methodology
  Gate`. The maintainer selected explicitly per section and granted **durable recording authority
  on `arena`** separately. §1 = A is a **methodology** decision, granted as such. **No
  evidence-creation, product-branch-amendment, A1-transition, matrix-amendment or certification
  authority was granted or inferred.**
- **Scope:** establishment of the authoritative verification model, a labelling convention for
  future reports, disposition of the existing 11 reports, and the Tier-3 methodology consequence.
  **No evidence created, no report amended, no A1/A2 status change, no matrix change, no
  product-branch mutation, no authorization of the D14 documentation programme.**
- **Provenance:** read-only discovery against `origin` in the same turn. Every claim about the
  reports was tested across all 11 by `git show` / `git grep`.
- **Supersession / revision relationship:** amends nothing. **Corrects `DEC-D14-TIER3-PREREQUISITE-RESOLUTION`
  §3.2**, which is a dated record and is therefore **not** edited. **Refines the labelling
  requirement recorded in `DEC-A2-A1-TIER3-CREATION-AUTHORITY`** without altering its substantive
  finding. **Preserves D7-3 = A and `D7-TIER3-INDEPENDENCE` unchanged.**

---

## 1. SELECTIONS

| Section | Question | Selected |
|---|---|---|
| **§1** | Authoritative verification model | **A — role separation + clean-workspace reproducibility is the programme standard** |
| **§2** | The existing 7 reports | **B — record as an ambiguity risk, not a defect; no correction** |
| **§3** | Tier-3 consequence | **Same methodology permitted, explicitly labelled** |
| **§5** | Recording authority | **GRANTED** — this record, on `arena` only |

---

## 2. PRECHECK STATE

**No re-provision this turn.** `git ls-remote origin` → **8 refs**, identical to the D14
end-state: `arena` `62b1dba6961c573b0bd6a2d57ba914c015342416` · `phase13-next`
`357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` · `main` `c65d533…` · `gai-impl-canonical`
`f63a9b49…` · `phase13-hardening-delivery` `254e4723…` · tag pair `a975b0dc…` / `7325aeda…`.
`governance/iips/` = **41 records** before this commit. Matrix =
`cada0451400409b0fe9ff0d62309b756c7b45e43`.

---

## 3. SELF-CORRECTION — `DEC-D14` §3.2 OVERSTATED THE FINDING

`DEC-D14-TIER3-PREREQUISITE-RESOLUTION` §3.2 recorded that the 7 A1/CSIP reports
*"affirmatively assert independence"* and that this **contradicts** `D7-TIER3-INDEPENDENCE`.
**That characterization was too strong.** Three tests across all 11 reports:

| Test | Verified result |
|---|---|
| Claims of external / third-party / third party / certification body / accredited / organizational / separate organization / outside team | **0 hits for every one of the 8 terms, across all 11 reports** |
| Verifier disclosed by name in the 7 | **All 7** — `Verifier: Arena AI (independent, clean-clone, from committed repository state)` |
| Is "independent" qualified? | **Yes** — by the parenthetical itself, and operationally by §1 *Method*: *"A **fresh `git clone`** of the committed repository was created … with no prior build state"* |

**Therefore:** the reports **name the verifier as Arena AI**, **never claim organizational
independence**, and **define "independent" as clean-clone reproducibility**.
`D7-TIER3-INDEPENDENCE` (*"no genuinely independent verifier exists"*) is **consistent** with
these reports, **not contradicted** by them — they never made the claim D7 denies.

`DEC-D14-TIER3-PREREQUISITE-RESOLUTION` is a **dated record** and is **not edited**. **This record
is the correction.**

**Pattern disclosed:** this is the second correction of my own prior characterization in this
programme — D11 understated `D-CLASS-DUAL`'s scope by a factor of 15, corrected at D12; D14
overstated these independence claims, corrected here. Both were found by re-testing the
underlying evidence rather than re-reading the earlier record.

---

## 4. §1 = A — THE AUTHORITATIVE VERIFICATION MODEL

### 4.1 The model

**Verification in this programme means role separation plus clean-workspace reproducibility. It
does not mean, and has never meant, organizational independence.**

| Element | What it requires | Evidence it is already practised |
|---|---|---|
| **Role separation** | The reviewer acts as reviewer, not as implementer, of the artifact under review | `reports/…:3` *"Arena acting as reviewer, not implementer"* |
| **Clean-workspace reproducibility** | A fresh clone with no prior build state; the frozen baseline must be reproduced exactly | all 7 state *"clean-clone, from committed repository state"*; §1 *Method* of each |
| **Verifier disclosure** | The verifier is named | all 7 name **Arena AI** |
| **Not claimed** | Organizational, external, third-party or accredited independence | **0 occurrences** of any such term in all 11 |

### 4.2 Why this is a ratification, not a change

The 11 existing reports **already implement this model**. §1 = A therefore **changes no existing
evidence, invalidates no report, and alters no A1 or A2 status.** It records what the evidence
already is, so that future work is measured against a stated standard rather than an inferred one.

### 4.3 Labelling convention for future reports

§1 = A included deciding whether future reports should carry an explicit qualifier. **They
should.** Any future verification report — Tier-3 or otherwise — must state on its face:

1. the **verifier's identity**;
2. that **"independent" denotes role separation plus clean-workspace reproducibility**; and
3. that **no organizational, external, third-party or accredited independence is claimed**.

This **refines** the requirement recorded in `DEC-A2-A1-TIER3-CREATION-AUTHORITY` that future
verification be labelled *"simulated"*. The **substantive finding is unchanged** — no genuinely
independent verifier exists — but the **required wording** is now the accurate description above
rather than the single word "simulated". Where the two differ, **this record governs**.

---

## 5. §2 = B — THE EXISTING REPORTS: AMBIGUITY RISK RECORDED, NO CORRECTION

**Recorded, and not treated as a defect:** the bare word *"independent"* in a document titled
*"Independent Verification Report"* **could be misread** by a reader who skips the parenthetical
as implying organizational independence.

| Property | Finding |
|---|---|
| Is the wording **false**? | **NO** — the parenthetical qualifies it, the verifier is named, and no organizational independence is claimed |
| Is there a **risk**? | **YES — ambiguity only**, for a reader who does not read the qualification |
| Correction authorized? | **NO** |
| Existing reports amended? | **NO — all 11 untouched** |

Recording this as a **defect** would have been inaccurate, and the maintainer selected the
accurate characterization.

---

## 6. §3 — TIER-3 CONSEQUENCE

**A future Tier-3 verifier may use the same role-separated, clean-workspace methodology as the
existing A1 population**, provided its report carries the explicit labelling required by §4.3.

| Consequence | Status |
|---|---|
| Tier-3 methodology **permitted** | **YES — same as A1** |
| Explicit labelling **required** | **YES** — §4.3, all three elements |
| Tier-3 **exception** to A1 created | **NO** — the standard is identical, not relaxed |
| **D7-3 = A** | **PRESERVED — the A1 standard is not lowered** |
| **A1 conferred on IES-016/017/020 by this record** | **NO** |
| `D7-TIER3-INDEPENDENCE` | **UNCHANGED** — no genuinely independent verifier exists |

### 6.1 Effect on the Tier-3 A1 pathway — stated precisely

D14 identified two prerequisites. This gate resolves **prerequisite 1**: the methodology is
**acceptable**, subject to labelling. **Prerequisite 2 (documentation parity) remains unresolved**
— the D14 programme is scoped but **unexecuted**.

**Therefore Tier-3 A1 remains out of reach until the documentation programme is executed under its
own authority.** Nothing in this record authorizes that execution, and no A1 transition or matrix
amendment is implied.

---

## 7. STRUCTURAL FINDINGS — FENCE SCOPE (recorded, not remediated)

### 7.1 All 11 reports sit inside fence 4

`SPEC-G-AI-IMPL` §5 fence 4 = **`iips-platform/**`**, verified as **398 files** at
`phase13-next`. `DEC-G-AI-IMPL-CERTIFICATION` criterion **K** was certified **PASS** on the basis
of *"`iips-platform/**`: **0** blobs differing."* All **11 of 11** reports are inside that path.

`AUTH-G-AI-IMPL` line 12 states the authorization *"Binds the implementation scope only"*, so
amending a report is **not** literally an AI Advisory implementation act and fence 4 does **not**
bar it outright. **But** any future correction of those reports requires **both** product-branch
mutation authority **and** an explicit decision about the criterion-K baseline, which was
certified against that set's immutability. **No such authority is granted or implied here.**

### 7.2 Fence 8 reaches the D14 documentation programme

`SPEC-G-AI-IMPL` §5 fence 8 = **`ies-010 … ies-020`**, `iips-cross-sector` — certification
baselines. The **60-artifact** programme scoped at D14 would create files inside
`ies-016-telecommunications/`, `ies-017-automobile/` and `ies-020-materials-metals/`, each
verified at **12 files** — i.e. **inside a recorded fence**.

**D14 scoped the programme without noting this.** It is recorded here so that any future
execution-authority gate addresses it explicitly rather than discovering it mid-execution.

---

## 8. AUTHORITY SEPARATION

Stated separately. **Nothing below is authorized by this gate.**

| Authority | Granted by D15? |
|---|---|
| Methodology determination | **YES — the only grant** |
| Evidence creation | **NO** |
| Authorization of the D14 60-document programme | **NO** |
| Product-branch amendment (incl. the 11 reports) | **NO** |
| Fence-4 or fence-8 relief | **NO** |
| **A1 transition** for IES-016/017/020 | **NO** |
| Matrix amendment | **NO** |
| Certification or release/tag change | **NO** |
| P7 reopening | **NO** |

**No downstream transition is inferred**, and no authority not explicitly granted has been
assumed — not from configured credentials, not from write capability, not from technical
convenience, and not from any prior GO.

---

## 9. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| All 11 verification reports | **UNTOUCHED** |
| A1 / A2 status of all 14 capabilities | **UNCHANGED — 7 A1 / 7 A2** |
| All capabilities Class A | **UNCHANGED** |
| **D7-3 = A** — A1 standard not lowered, no Tier-3 exception | **PRESERVED** |
| `D7-TIER3-INDEPENDENCE` | **UNCHANGED** |
| Matrix `cada04514004…` and `phase13-next` | **UNTOUCHED** |
| Fences 1–10 | **UNTOUCHED — no relief granted** |
| Evidence artifacts | **NONE created** |
| All dated `DEC-*` records | **UNTOUCHED** |
| Root `README.md` fence `0d759fbdd751…` | **UNTOUCHED** |
| H/I/J · P7 · engines · releases · tags | **NOT executed · NOT reopened · UNTOUCHED** |

---

## 10. THE SINGLE NEXT GATE

Identified from the resulting state. **Not pre-authorized and not executed by this record.**

| Item | State after D15 |
|---|---|
| Verification methodology | **RESOLVED — §1 = A** |
| Tier-3 methodology permission | **RESOLVED — §3, same methodology, labelled** |
| **Prerequisite 2 — documentation parity** | **UNRESOLVED — D14 programme scoped, unexecuted** |
| H/I/J | **DORMANT — environment-blocked (D13)** |

Prerequisite 1 is now resolved, so **the only remaining substantive blocker to Tier-3 A1 is
prerequisite 2**. Therefore:

# **`D16 — TIER-3 DOCUMENTATION-PARITY PROGRAMME EXECUTION-AUTHORITY GATE`**

It would have to decide, **separately**: (a) **evidence-creation authority** to author the 60
artifacts; (b) **fence-8 relief or an explicit determination** that creating files under
`ies-016/017/020` is permitted (§7.2); and, only thereafter and each under its own grant,
(c) any **A1 transition** and (d) any **matrix amendment**.

**This record pre-authorizes nothing in D16.** It selects no outcome, creates no evidence, and
confers no transition.

---

## 11. WHAT THIS RECORD DOES NOT DO

No evidence artifact created · no documentation authored · no verification report authored or
amended · no product-branch mutation · no fence-4 or fence-8 relief · no A1 transition · no
evidence-maturity change · no matrix amendment · no engine or implementation change · no
certification-result change · no release, version or tag change · no authorization of the D14
documentation programme · no verifier engaged, invented or simulated · no Tier-3 exception created
· no Class A capability status change · no P7 reopening and no P7 status claim · no H/I/J
execution · no amendment of any existing record · no restoration of historical artifacts · no
D5-S1 threshold change · no branch merged, rebased, created, moved or deleted · no ref other than
`arena` moved · no force-push.

## 12. CLASSIFICATION

# **D15 RECORDED — §1 = A · §2 = B · §3 = SAME, LABELLED**

The authoritative verification model is **role separation plus clean-workspace reproducibility**,
with the verifier named and **no organizational independence claimed** — a **ratification** of what
all 11 existing reports already do, changing no evidence and no status. The 7 reports are recorded
as carrying an **ambiguity risk, not a defect**, and are **not** corrected. A future Tier-3
verifier **may** use the same methodology, **must** label it explicitly, and gains **no** A1 by
doing so. **D7-3 = A is preserved; the A1 standard is not lowered and no Tier-3 exception
exists.** `DEC-D14` §3.2's overstatement is **corrected here**. Two fence-scope findings recorded:
all 11 reports sit inside **fence 4** (`iips-platform/**`, 398 files, criterion K certified 0
differing), and the D14 programme's execution site sits inside **fence 8** (`ies-010 … ies-020`).
Next gate identified as **`D16 — TIER-3 DOCUMENTATION-PARITY PROGRAMME EXECUTION-AUTHORITY GATE`**
and **not** pre-authorized. `phase13-next` and the matrix are **unchanged**. All 14 capabilities
remain **Class A**, **7 A1 / 7 A2**. **STOP after recording — no further authority is held or
inferred.**
