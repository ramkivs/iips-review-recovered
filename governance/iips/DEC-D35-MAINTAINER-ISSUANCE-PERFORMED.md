# DEC-D35-MAINTAINER-ISSUANCE-PERFORMED — Tier-3 Maintainer Issuance Acts Performed

- **Record ID:** `DEC-D35-MAINTAINER-ISSUANCE-PERFORMED`
- **Title:** D35 — Tier-3 Maintainer Issuance: Six Acts Performed by the Maintainer; Values Authorized for Application; Certificates and Manifests Not Yet Amended
- **Class:** `DECISION`
- **Status:** `RECORDED — SIX MAINTAINER ISSUANCE ACTS PERFORMED. VALUES AUTHORIZED FOR APPLICATION. **CERTIFICATES AND MANIFESTS NOT YET AMENDED — `phase13-next` WRITE MECHANISM STILL OUTSTANDING.**`
- **Date:** 2026-08-29
- **Authority relationship:** gate `D35 — Tier-3 Maintainer Issuance`, following
  `DEC-D34-MAINTAINER-ISSUANCE-RECONCILIATION`, which established that **zero** issuance values
  were Category A and that the only genuinely missing maintainer inputs were the **issuer/approver
  identity** and the **date**. At this gate the maintainer **explicitly performed the six acts**,
  supplying the identity and the date, and granted recording authority with commit and push on
  `arena`, scoped to **recording only**.
- **Scope:** recording of six maintainer issuance acts and authorization of the exact values to be
  applied when a `phase13-next` write mechanism exists. **Creates no certificate, no freeze
  manifest, no regression test, no verification report. Modifies no product file. Exercises no
  fence-4 or fence-8 relief. Performs no A2 → A1 promotion.**
- **Provenance:** the identity and date were **supplied by the maintainer at this gate** and are
  transcribed verbatim. **No value is copied from an A1 template and presented as a Tier-3 act;
  no value is invented.** Verified against `origin/phase13-next` at
  `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`.
- **Supersession / revision relationship:** amends nothing. Discharges the pending prerequisite
  recorded in `DEC-D32-MAINTAINER-ISSUANCE-EXECUTION-READINESS` §2 and
  `DEC-D34-MAINTAINER-ISSUANCE-RECONCILIATION` §4 item 3. Depends on
  `DEC-D28-FENCE-RELIEF-AUTHORIZATION` and `DEC-D30-EXECUTION-LINEAGE-AND-ISSUANCE-AUTHORITY`,
  both **unmodified**.

---

## 1. THE SIX MAINTAINER ACTS, PERFORMED

The maintainer **explicitly performed** the following at this gate. These are **current acts
performed now**, not reconstructions of historical acts.

| # | Act | Engine | Identity authorized | Date authorized |
|---|---|---|---|---|
| 1 | Readiness-certificate issuance | **IES-016** | `IIPS Engineering Standards Maintainer` | `2026-08-29` |
| 2 | Freeze-manifest approval | **IES-016** | `IIPS Engineering Standards Maintainer` | `2026-08-29` |
| 3 | Readiness-certificate issuance | **IES-017** | `IIPS Engineering Standards Maintainer` | `2026-08-29` |
| 4 | Freeze-manifest approval | **IES-017** | `IIPS Engineering Standards Maintainer` | `2026-08-29` |
| 5 | Readiness-certificate issuance | **IES-020** | `IIPS Engineering Standards Maintainer` | `2026-08-29` |
| 6 | Freeze-manifest approval | **IES-020** | `IIPS Engineering Standards Maintainer` | `2026-08-29` |

**The maintainer explicitly confirmed that the identity `IIPS Engineering Standards Maintainer` is
theirs to give for IES-016, IES-017 and IES-020.** This record therefore transcribes a maintainer
act; it does **not** copy an A1 template value and present it as a Tier-3 act.

---

## 2. CRITICAL DISTINCTION — CURRENT ACT, NOT HISTORICAL RECONSTRUCTION

| | State |
|---|---|
| Date of the issuance act | **2026-08-29 — the date the act was actually performed** |
| Is this back-dated? | **NO.** It is not recorded as having occurred earlier |
| Are the missing historical primary records (`D16_/D17_/D20_AUTHORITY_REVIEW.md`, `D20_CERTIFICATION_DATA_ACCEPTANCE.md`) reconstructed? | **NO — they remain absent and are not treated as having existed** |
| Does this record assert that a prior issuance occurred? | **NO** |
| Does it change the D25 methodology-acceptance determination? | **NO** |

**The four categories remain strictly separate:** substantive methodology-acceptance evidence
(**present**, per D25) · later implementation/certification assertions (**present**) · actual
maintainer issuance metadata (**now supplied by this act**) · missing historical primary authority
records (**still absent, not reconstructed**).

---

## 3. VALUES AUTHORIZED FOR APPLICATION

When a `phase13-next` write mechanism exists, the following values are authorized for the six
D28 fence-8 operations. **Nothing else is authorized.**

### 3.1 Readiness certificates — 3 files, AMEND

`ies-016-telecommunications/IES-016_IMPLEMENTATION_READINESS_CERTIFICATE.md`
`ies-017-automobile/IES-017_IMPLEMENTATION_READINESS_CERTIFICATE.md`
`ies-020-materials-metals/IES-020_IMPLEMENTATION_READINESS_CERTIFICATE.md`

| Field | Authorized value | Basis |
|---|---|---|
| `**Issuer:**` | `IIPS Engineering Standards Maintainer` | Maintainer act, §1 |
| `**Issued:**` | `2026-08-29` | Maintainer act, §1 |
| `**Status:**` | `AUTHORIZED — implementation may begin against the frozen baseline` | Follows the established A1 convention (IES-010 … IES-015, CSIP); conferred by this act. **Flagged: if different wording is required, that requires a further maintainer act** |

### 3.2 Freeze manifests — 3 files, CREATE

`ies-016-telecommunications/IES-016_FREEZE_MANIFEST.json`
`ies-017-automobile/IES-017_FREEZE_MANIFEST.json`
`ies-020-materials-metals/IES-020_FREEZE_MANIFEST.json`

| Field | Authorized value | Basis |
|---|---|---|
| `approver` | `IIPS Engineering Standards Maintainer` | Maintainer act, §1 |
| `freezeDate` | `2026-08-29` | Maintainer act, §1 |
| `status` | `FROZEN` | Follows the A1 convention; conferred by this act |
| `releaseTag` | **`null` / deferred, citing `DEC-D31`** | `DEC-D31` — not mandatory for Tier-3 A1; no tag exists and none is created |
| All other fields | Populated from the existing frozen artifacts only | Per D28 §3.1; **no value invented** |

---

## 4. WHAT REMAINS OUTSTANDING

| # | Requirement | Status |
|---|---|---|
| 1 | D28 relief authorization | **GRANTED** (`7b4de38…`) |
| 2 | `phase13-next` execution lineage | **GRANTED** (`ea57e69…`) |
| 3 | `releaseTag` | **CLEARED** (`DEC-D31`) |
| 4 | **Maintainer issuance — six acts** | **PERFORMED — discharged by this record** |
| 5 | **A mechanism with `phase13-next` write access** | **STILL OUTSTANDING** — blocks all 15 authorized paths |

**So exactly one requirement remains: a mechanism with `phase13-next` write access.** Until it
exists, **none of the 15 D28 paths can be created or amended**, notwithstanding that every
authority and prerequisite is now in place.

---

## 5. VERIFICATION PERFORMED AT THIS GATE

| Check | Result |
|---|---|
| `origin/phase13-next` | `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` — **unmodified** |
| Readiness certificates amended? | **NO** — all three still `Issuer=0`, `Issued=0`, `Status=0` |
| Freeze manifests created? | **NO** — 0 of 3 exist |
| Fence-4 / fence-8 relief exercised? | **NO** — `SPEC-G-AI-IMPL §5.2` intact; 0 of the 12 create-targets exist |
| Matrix / A1-A2 | `cada0451400409b0fe9ff0d62309b756c7b45e43` · **7 / 7** |
| Tags | **2 entries** — none created |
| `D25 / D28 / D30 / D31 / D32 / D33 / D34` | **unmodified** |
| A2 → A1 promotion | **NONE** |

---

## 6. WHAT THIS RECORD DOES NOT DO

No certificate created or amended · no freeze manifest created · no regression test created or
executed · no independent-verification report created · no product / source / test / schema /
persistence / parser / UI file created or modified · no `phase13-next` modification or push · no
fence-4 or fence-8 relief exercised · no `SPEC-G-AI-IMPL` amendment · no matrix amendment · no
A1/A2 change · no tag created or modified · no A2 → A1 promotion · no certification · no
reconstruction of any missing primary authority record · no back-dating of any issuance · no
invention of any value · no amendment of the 18 records identified in
`DEC-D33-PROVENANCE-METADATA-GAP` · no resolution of the Provenance gap · no branch merged,
rebased, created, moved or deleted other than the single named `arena` refspec · no force-push.

## 7. CLASSIFICATION

# **D35 RECORDED — SIX MAINTAINER ACTS PERFORMED · EXECUTION STILL BLOCKED**

The maintainer **explicitly performed** all six Tier-3 issuance acts at this gate, authorizing
`IIPS Engineering Standards Maintainer` as issuer/approver and `2026-08-29` as the issuance and
freeze date. These are **current acts performed now** — **not** back-dated, and **not** a
reconstruction of the absent historical primary records. The exact values to be applied to the
three readiness certificates and three freeze manifests are recorded in §3, together with the
`releaseTag` disposition from `DEC-D31`.

**No certificate was amended and no manifest was created**, because the **one remaining
requirement — a mechanism with `phase13-next` write access — is still outstanding**, and it blocks
all 15 D28-authorized paths regardless of the fact that every authority and prerequisite is now in
place. **A1/A2 remains 7 / 7. No fence relief was exercised. No A2 → A1 promotion.** **STOP.**
