# DEC-D25-TIER3-EVIDENTIARY-STANDARD — Tier-3 Methodology Acceptance Established

- **Record ID:** `DEC-D25-TIER3-EVIDENTIARY-STANDARD`
- **Title:** D25 — Tier-3 Methodology-Acceptance Evidentiary-Standard Decision: All Three Accepted as Fresh Forward-Looking Acceptance
- **Class:** `DECISION`
- **Status:** `RECORDED — IES-016 = ACCEPT · IES-017 = ACCEPT · IES-020 = ACCEPT. ALL THREE ARE FRESH FORWARD-LOOKING ACCEPTANCES. HISTORICAL ACCEPTANCE IS *NOT* ESTABLISHED FOR ANY OF THEM. ALL THREE REMAIN A2.`
- **Date:** 2026-08-29
- **Authority relationship:** gate `D25 — Tier-3 Methodology-Acceptance Evidentiary-Standard
  Gate`, conducted **governance-only**. The maintainer selected **ACCEPT** independently for each
  of the three methodologies and granted recording authority with commit and push on `arena`.
  **This gate makes and records an evidentiary-standard decision only. It authorizes no
  implementation, no product mutation, no fence-8 relief, no evidence creation, no certification
  and no matrix modification.**
- **Scope:** determination of whether the surviving later artifacts constitute sufficient
  authoritative evidence of methodology acceptance for `D16 v1.0`, `D17 v1.0` and `D20 v1.0`, and
  the resulting per-engine decisions. **Supersedes only the relevant `DEC-D23` deferral
  *rationales* where this record establishes contrary evidence. `DEC-D23` itself is preserved
  unchanged as the historical record of the prior deferral.**
- **Provenance:** evidence assessed read-only from `origin/phase13-next` at
  `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`, following the discovery recorded at D24. No artifact
  was modified during assessment. **No primary decision record was reconstructed, and none is
  treated as existing.**
- **Supersession / revision relationship:** supersedes the **rationales** recorded at
  `DEC-D23-TIER3-METHODOLOGY-DECISION` §3.1(B1), §3.2(B1) and §3.3(B1) to the extent identified in
  §6 below. **`DEC-D23` is not rewritten, amended or deleted.** Depends on the D24 discovery
  findings. `DEC-D21-FENCE8-DETERMINATION` §7 (**B — PATHWAY AUTHORIZED / NO RELIEF GRANTED**) is
  **unchanged**.

---

## 1. DECISIONS

# **IES-016 `D16 v1.0` = ACCEPT · IES-017 `D17 v1.0` = ACCEPT · IES-020 `D20 v1.0` = ACCEPT**

**All three are FRESH FORWARD-LOOKING ACCEPTANCES made now.**

**For none of the three is historical acceptance established.** The primary decision records are
absent, and the surviving certificates are not maintainer-issued. This record does **not** assert,
imply or reconstruct that any prior acceptance occurred.

**All three engines remain evidence-maturity A2.** No A1/A2 change occurs. **D7-3 = A is
preserved** — no Tier-3 exception is created and the A1 standard is not lowered.

---

## 2. THE DECISIVE EVIDENTIARY FINDING

The Tier-3 "implementation readiness certificates" are **not the same instrument** as the A1
engines' certificates:

| Attribute | A1 engines (IES-010…015) — **all 6** | Tier-3 (IES-016/017/020) — **all 3** |
|---|---|---|
| Title | *"Implementation Readiness Certificate (**ISSUED**)"* | *"IMPLEMENTATION READINESS CERTIFICATE (v1.0)"* |
| `**Issuer:**` | **"IIPS Engineering Standards Maintainer"** | **ABSENT** |
| `**Issued:**` | dated (2026-08-08 / 2026-08-09) | **ABSENT** |
| `**Status:**` | **"AUTHORIZED — implementation may begin against the frozen baseline"** | **ABSENT** |
| Structure | `## 1. Certifications` — conditions incl. *"reference assets frozen ✅"*, *"architecture review passed 8/8 / 11/11 ✅"*, *"implementation authorized ✅"* | `## Certification evidence` · `## Confidence decision (recorded)` · `## Stop state` |
| Self-declared limit | — | *"**No commit / no push** — promotion is a separate authorization"* |

**The A1 certificates are maintainer-issued authorization instruments. The Tier-3 certificates are
implementation-evidence reports that *assert* acceptance occurred.** Only the former is primary
evidence of an authority decision.

**Comparative check performed:** the six A1 engines have **zero** `*AUTHORITY*` records
(`find … -iname '*AUTHORITY*'` → **0**). Their acceptance is evidenced by the **maintainer-issued
certificate itself**. Tier-3 has no equivalent instrument.

---

## 3. EVIDENCE HIERARCHY

| Rank | Artifact | Can establish | Cannot establish |
|---|---|---|---|
| 1 | **Primary decision records** — `D16_AUTHORITY_REVIEW.md`, `D17_AUTHORITY_REVIEW.md`, `D20_AUTHORITY_REVIEW.md`, `D20_CERTIFICATION_DATA_ACCEPTANCE.md` | Formal acceptance by the authority | **ABSENT on every ref — establish nothing** |
| 2 | **Maintainer-issued readiness certificate** (Issuer / Issued / Status = AUTHORIZED) | That the maintainer authorized implementation against a frozen baseline | **Tier-3 has none** |
| 3 | **Certified replay baseline** `PROGRAM_v1.1_REPLAY_BASELINE.json` (fence 7) | Outputs frozen for regression; sector is in the certified 13-sector set; contract-version label | That the methodology was formally accepted |
| 4 | **Engine acceptance matrix** | Implementation conforms to the contract; gates executed and PASS | Acceptance of the methodology itself |
| 5 | **Tier-3 readiness certificate** (evidence-report form) | Test evidence; that a confidence decision was recorded | Acceptance — not maintainer-issued; defers promotion |
| 6 | **`ROADMAP.md`** | Programme-level status treatment (*"✅ Frozen v1.0"*) | Acceptance authority |
| 7 | **Implementation artifacts** | The methodology was implemented | Acceptance |

### 3.1 The five evidentiary categories, kept distinct

| Category | IES-016 | IES-017 | IES-020 |
|---|---|---|---|
| An acceptance decision **occurred** | Secondary assertion only | Secondary assertion only | Secondary assertion only |
| Methodology **implemented** | **ESTABLISHED** | **ESTABLISHED** | **ESTABLISHED** |
| Outputs **certified/frozen** | **ESTABLISHED** | **ESTABLISHED** | **ESTABLISHED** |
| Methodology **formally accepted** | **NOT ESTABLISHED** | **NOT ESTABLISHED** | **NOT ESTABLISHED** |
| Sufficient for **fresh acceptance now** | **YES — strong** | **YES — strong** | **YES — strong** |

---

## 4. EVIDENCE RELIED UPON

| Evidence | Location | Finding |
|---|---|---|
| Certified replay baseline | `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` (fence 7) | 13-sector set **includes all three**; `contractVersion` = `"IES-016 v1.0 (D16 normative)"` / `"IES-017 v1.0 (D17 normative)"` / `"IES-020 v1.0 (D20 normative)"`; frozen `expectedOutput` 77.8 Buy / 71.3 Buy / 82.5 Strong Buy; `calibrationProfile` named for each |
| Acceptance matrices | `TELECOMMUNICATIONS_` / `AUTOMOBILE_` / `MATERIALS_METALS_ENGINE_ACCEPTANCE_MATRIX.md` | 16 gates, **all PASS**; header asserts *"Contract: D1x v1.0 (M1–M15 ACCEPTED)"*; confidence recorded at `:24` |
| Readiness certificates | `IES-016/017/020_IMPLEMENTATION_READINESS_CERTIFICATE.md` | Full PASS evidence tables incl. *"13/13 frozen expected outputs reproduced"*, *"Null-confidence honesty — PASS"*; **confidence decision recorded** at `:27–29`; **no Issuer / Issued / Status** |
| Implementation | `iips-platform/src/sector-engines/{telecommunications,automobile,materials-metals}/` | 11 files each; 6 regression tests; commits `9bf91d1`, `d51b120`, `6355949` are ancestors of `phase13-next` |
| IES-016 calibration | `ies-016-telecommunications/calibration/telecommunications-calibration-1.0.0.json` | **Matches pack §4 field-for-field** — all 5 segment weight vectors, `leverageAlert` values, `archetypeRisk` |
| IES-020 implemented contract | pack §6–8 + golden reference | Q2 `cashCostCurve` = *"Cost-curve percentile position"*; Q3 `reserveLife` = *"Proven+probable reserves ÷ annual production"* (no commodity weighting); Q5 `royalty` **admitted** (risk 0.8) and used in the golden reference, `streaming` **absent** |
| ROADMAP | `ROADMAP.md` | IES-016 / IES-017 / IES-020 all *"✅ Frozen v1.0"* |
| **Missing primary records** | — | **All four absent** on `origin/main`, `origin/phase13-next`, `origin/gai-impl-canonical`, `origin/phase13-hardening-delivery`, `85bbd49…` and `origin/arena`. **Not reconstructed. Not treated as existing.** |

---

## 5. DECISION STANDARD APPLIED

**One principle, applied identically to all three:**

> Later artifacts establish **implementation, conformance and freezing** — **not formal
> acceptance**. Absence of the primary record is therefore **not fatal to a fresh acceptance**, but
> it **is fatal to claiming a historical one**.

| Option | Why not |
|---|---|
| **ACCEPT as historical** | The primary records are absent **and** the Tier-3 certificates are **not maintainer-issued**, unlike all six A1 certificates. Treating an implementer-authored assertion as an authority instrument is the `D-AUTHCLAIM-UNSUPPORTED` pattern this programme refused at `DEC-D22` |
| **REJECT** | No substantive defect was found. The methodologies are fully specified, implemented, and their outputs are frozen in a certified baseline with green gates. **Absence of a primary record alone is insufficient grounds for rejection** |
| **DEFER** | The surviving evidence **is** sufficient for a fresh forward-looking acceptance, so deferral would withhold a decision the evidence supports |
| **ACCEPT as fresh** | **Selected** — the evidence supports it, and it is recorded without asserting anything about the past |

---

## 6. SUPERSESSION OF D23 RATIONALES ONLY

`DEC-D23-TIER3-METHODOLOGY-DECISION` is **preserved unchanged** as the historical record of the
prior deferral. **D24 established that its evidentiary findings were incorrect**, and this record
supersedes the following **rationales only**:

| D23 rationale | D25 position |
|---|---|
| IES-017 blocker B1: *"Confidence decision (Option-A analog) — has not been made"* | **WITHDRAWN.** The decision **is recorded** — `IES-017_IMPLEMENTATION_READINESS_CERTIFICATE.md:27–29` (*"G5 (Option-A analog, maintainer)"*) and `AUTOMOBILE_ENGINE_ACCEPTANCE_MATRIX.md:24` |
| IES-020 blocker B1 (Q4 confidence) | **WITHDRAWN.** Recorded at `IES-020_IMPLEMENTATION_READINESS_CERTIFICATE.md:27–29` |
| IES-020 blockers Q2 `cashCostCurve`, Q3 `reserveLife`, Q5 royalty/streaming | **WITHDRAWN.** Resolved by the implemented contract |
| IES-016 blockers B2 (§4 calibration) and B3 (§8 data authority) | **WITHDRAWN.** Calibration matches pack §4 field-for-field and is frozen in the certified baseline; the 13 synthetic providers are frozen in the certified baseline |
| IES-016 blocker B1 (GATE0 / Amendment tension) | **SUPERSEDED as a blocker.** The GATE0 note is in a document marked *"Version 1.0 (DRAFT)"* / *"Status: SCOPE — awaiting Gate 0 approval"*, and IES-016 was subsequently opened (`9bf91d1`), implemented and added as the **11th** replay-baseline sector; `ROADMAP.md` records *"✅ Frozen v1.0"*. The packs' citation to *"Amendment v1.1"* remains a **dangling citation** — that document does not exist |

**D23's deferral dispositions were not unreasonable on the evidence before it**; they were based on
the discovery packs, which are the **earliest** artifacts and are **stale** relative to the later
artifact classes.

---

## 7. ENGINE-SPECIFIC FINDINGS

### 7.1 IES-016 — the M1–M15 boilerplate

The readiness certificate and acceptance matrix assert *"M1–M15 ACCEPTED"*, but the IES-016 pack
contains **0** references to M1–M15; its methodology is `## 3. Normative calculation contract
(D16 v1.0)` with metric taxonomy **TC-001…TC-012**.

**Assessment: a naming/template defect, not a substantive one.** It weakens the literal evidentiary
value of that phrase but **does not prevent acceptance**: the methodology is identified by
`D16 v1.0` and is fully specified in pack §3, which is what was implemented and frozen. Resolvable
from the other authoritative artifacts. **No methodology was rewritten, and none is rewritten by
this record.** Restating the phrase in IES-016's own terms would be a **product-branch document
correction** requiring fence-8 relief — **not authorized here**.

### 7.2 IES-017 — confidence

**Recorded, not missing.** `IES-017_IMPLEMENTATION_READINESS_CERTIFICATE.md:27–29`:
*"G5 (Option-A analog, maintainer): `confidence: 0.8` is used **only** as the internal
`EvidencePipeline.build()` plumbing value … the governed transport reports `null`."* Corroborated
at `AUTOMOBILE_ENGINE_ACCEPTANCE_MATRIX.md:24`. **D23's blocker is not reintroduced.**

### 7.3 IES-020 — the five questions and illustrative data

| Item | Status |
|---|---|
| Q1 aluminium placement | **OPEN — and expressly OUTSIDE the scope of this acceptance.** Not exercised by the frozen dataset (no aluminium provider; 5 implemented subsegments); no effect on certified outputs. Recorded as a scoped open item for future data |
| Q2 `cashCostCurve` | **Resolved by the implemented contract** — *"Cost-curve percentile position"*, lower-better |
| Q3 `reserveLife` | **Resolved by the implemented contract** — *"Proven+probable reserves ÷ annual production"*, single ratio, no commodity weighting |
| Q4 confidence | **Recorded** — `:27–29` |
| Q5 royalty/streaming | **Resolved** — `royalty` admitted (risk 0.8) and used in the golden reference; `streaming` absent |
| Illustrative synthetic data | **Not a bar** — the 13 providers are the programme-wide synthetic-fixture convention and are **frozen in the certified replay baseline** |

**Q1 was not resolved by this gate**, as it was not necessary to determine the evidentiary
standard.

---

## 8. WHAT THIS ACCEPTANCE DOES **NOT** DO

| Not authorized / not changed | Status |
|---|---|
| Methodology implementation | **NOT AUTHORIZED** |
| Product / source / test / schema / persistence / parser / UI mutation | **NOT AUTHORIZED** |
| **Fence-8 relief** | **NOT GRANTED — `DEC-D21` §7 unchanged: B — PATHWAY AUTHORIZED / NO RELIEF GRANTED** |
| Amendment of `SPEC-G-AI-IMPL` §5 | **NOT AUTHORIZED** |
| Evidence creation | **NOT AUTHORIZED** |
| The 60-artifact documentation programme | **NOT AUTHORIZED** |
| Correction of the discovery packs (`D-AUTHCLAIM-UNSUPPORTED`, IES-016 factual claims) | **NOT AUTHORIZED** — 4 files, requires fence-8 relief |
| Certification | **NOT AUTHORIZED** |
| Matrix modification | **NOT AUTHORIZED** |
| **A1 / A2 change** | **NONE — all three remain A2** |
| Release / tag promotion | **NOT AUTHORIZED** |
| P7 reopening · H/I/J execution | **NOT AUTHORIZED** |

### 8.1 Why all three remain A2

The A1 certificates certified conditions Tier-3 cannot satisfy: *"reference assets frozen"* and
*"architecture review passed 8/8 / 11/11"*. Tier-3 has **0** `docs/` files and **0**
`ARCHITECTURE_REVIEW` per engine. **Methodology acceptance is not evidence maturity.** Accepting
the methodologies changes nothing about A1/A2, and **D7-3 = A** continues to forbid any Tier-3
exception to the A1 definition.

---

## 9. OPEN ITEMS AFTER D25

| Item | Status |
|---|---|
| Tier-3 methodology acceptance | **ESTABLISHED — all three, fresh forward-looking** |
| **Historical acceptance** | **NOT ESTABLISHED — and not claimed** |
| Primary decision records | **STILL ABSENT — preserved as a fact; not reconstructed** |
| IES-020 Q1 aluminium placement | **OPEN — scoped out of the acceptance; non-blocking** |
| IES-016 M1–M15 boilerplate | **OPEN — template defect; correction needs fence-8 relief** |
| `D-AUTHCLAIM-UNSUPPORTED` (4 files) | **OPEN — correction needs fence-8 relief** |
| Dangling citations (*"Amendment v1.1"*, `/home/user/IIPS-IES-016-DISCOVERY.md`, the four primary records) | **OPEN — preserved as facts** |
| Documentation-parity programme (60 artifacts) | **NOT AUTHORIZED** |
| A2 → A1 for Tier-3 | **NOT AUTHORIZED — prerequisites unchanged** |

---

## 10. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| `DEC-D23-TIER3-METHODOLOGY-DECISION` | **UNCHANGED — not rewritten, amended or deleted** |
| No primary decision record fabricated | **NONE — all four remain absent and are recorded as absent** |
| `SPEC-G-AI-IMPL` §5 / all ten fences | **UNMODIFIED — no relief** |
| `phase13-next` | **UNTOUCHED — `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`** |
| Discovery packs, generators, product code | **UNTOUCHED** |
| Matrix `cada04514004…` · A1 / A2 = 7 / 7 | **UNCHANGED** |
| **D7-3 = A** | **PRESERVED** |
| All previously recorded decisions | **PRESERVED** |
| H/I/J · P7 | **NOT executed · NOT reopened** |

---

## 11. WHAT THIS RECORD DOES NOT DO

No methodology implemented · no product / source / test / schema / persistence / parser / UI code
created or modified · no product-branch mutation · no fence relief and no relaxation of any fence ·
no amendment of `SPEC-G-AI-IMPL` §5 · no evidence created · no documentation authored · no
discovery pack corrected · no primary decision record reconstructed or fabricated · no certification
performed or changed · no matrix amendment · no A1/A2 change · no release, version or tag change ·
no verifier engaged, invented or simulated · no Tier-3 exception created · no rewrite or deletion of
`DEC-D23` · no resolution of IES-020 Q1 · no P7 reopening and no P7 status claim · no H/I/J
execution · no restoration of historical artifacts · no D5-S1 threshold change · no housekeeping ·
no branch merged, rebased, created, moved or deleted other than the single named `arena` refspec ·
no force-push.

## 12. CLASSIFICATION

# **D25 RECORDED — IES-016 ACCEPT · IES-017 ACCEPT · IES-020 ACCEPT**

All three Tier-3 methodologies are **accepted as fresh forward-looking acceptances made now**.
**Historical acceptance is *not* established for any of them and is not claimed** — the four
primary decision records remain **absent**, and the Tier-3 readiness certificates are **not
maintainer-issued**, unlike all six A1 certificates (which carry `Issuer: IIPS Engineering
Standards Maintainer` and `Status: AUTHORIZED`). The evidence relied upon establishes
**implementation, conformance and freezing**, which is sufficient for a fresh acceptance but not
for a historical one. **D23 is preserved unchanged**; only the D23 *rationales* that D24 showed to
be incorrect are superseded. **All three engines remain A2**; **D7-3 = A** stands. **No
implementation, product-mutation, fence-relief, evidence-creation, certification or matrix
authority is granted.** `DEC-D21` §7 remains **B — PATHWAY AUTHORIZED / NO RELIEF GRANTED**.
**STOP.**
