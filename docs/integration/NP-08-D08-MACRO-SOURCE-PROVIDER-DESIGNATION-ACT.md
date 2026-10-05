# NP-08 / D08 MACRO — SOURCE/PROVIDER DESIGNATION & PROSPECTIVE ACQUISITION AUTHORIZATION ACT

> **1. Act ID:** `NP-08-D08-MACRO-SOURCE-PROVIDER-DESIGNATION-ACT-01`
> **2. Title:** D08 Macro — Source/Provider Designation Authority and Prospective Macro Data-Acquisition Authorization Act
> **3. Effective date/time:** **`2026-10-04T18:29:31Z`** (UTC) — **prospective only** (§12)
> **4. Issuing authority:** **Ramki / Program Authority** — explicit authority to constitute the D08 Macro source/provider designation and prospective acquisition governance boundary. `arena-agent` performed investigation, verification, and record-execution **only**; no decision rendered by the agent.
> **Act type:** `AUTHORITY SOURCE/PROVIDER DESIGNATION + PROSPECTIVE ACQUISITION AUTHORIZATION` — **non-executable**
> **Structural precedent:** `d8-d06-d07-source-provider-designation-2026-09-27-001` (blob `4dc2288a…`) — **precedent for form only; no substantive provider decision is carried into D08** (§7)
> **Workstream:** NP-08 — Intelligence · GATE-Y
> **Repository / ref (durable):** `ramkivs/iips-review-recovered` @ `main` (§13)
> **Mutation:** one new governance artifact; **zero** modification to any historical record
> **IPD:** **OUT OF SCOPE — zero mutation**

---

## 5. PURPOSE

To constitute the previously **unowned** D08 Macro source/data-acquisition authority identified by the completed investigation (`NP-08-MACRO-SOURCE-ACQUISITION-AUTHORITY-INVESTIGATION.md`, verdict **`B — AUTHORITY COVERAGE PARTIAL`**).

Three functions were found genuinely uncovered:

| # | Uncovered function | Addressed by |
|---:|---|---|
| 1 | Macro source/provider selection | ✅ §6.1 — **authority** to designate |
| 2 | Macro acquisition authorization | ✅ §6.2 — **prospective** authorization |
| 3 | Macro acquisition mechanism | ✅ §6.3 — **governance-level** authorization only |

> # ⚠️ **THIS ACT ESTABLISHES AUTHORITY ONLY.**
> **No provider is selected. No entitlement is granted. No implementation is authorized. No production is authorized.**

---

## 6. AUTHORITY ESTABLISHED

> # **D08 MACRO SOURCE/PROVIDER DESIGNATION AUTHORITY — ESTABLISHED.**
> # **PROSPECTIVE MACRO DATA-ACQUISITION AUTHORIZATION — ESTABLISHED.**

### 6.1 Macro source/provider designation

| Field | Record |
|---|---|
| Authority to **designate** a Macro source/provider | ✅ **ESTABLISHED** |
| Is any provider **designated** by this act? | ❌ **NO** — §7.2 |
| Is any provider **entitled** by this act? | ❌ **NO** — §7.3 |
| Boundary | Designation must fall **inside** the WP-MACRO-03 approved source boundary (§8) |

### 6.2 Prospective authorization for Macro data acquisition

| Field | Record |
|---|---|
| Prospective Macro data acquisition | ✅ **AUTHORIZED from the effective point forward** |
| Retroactive authorization of prior acquisition | ❌ **NOT AUTHORIZED** — §12 |
| Mode | **LIVE-only** — SNAPSHOT acquisition is **prohibited** (§8) |

### 6.3 Acquisition mechanism — governance level only

| Field | Record |
|---|---|
| Governance of the Macro acquisition **mechanism** | ✅ **AUTHORIZED at governance level** |
| Selection of database / ORM / schema / storage technology | ❌ **NOT SELECTED** — §8.1 |
| Selection of vendor implementation / protocol implementation | ❌ **NOT SELECTED** — §8.1 |
| Selection of deployment architecture | ❌ **NOT SELECTED** — §8.1 |
| Implementation | ❌ **separate future gate** — §10 |

### 6.4 Dataset eligibility — within the established boundary

| Field | Record |
|---|---|
| Authority over dataset eligibility | **Constrained, not granted** |
| Governing boundary | **WP-MACRO-03** — approved Macro dataset boundary; **NAS / CPI / IIP** |
| May this act vary that boundary? | ❌ **NO** |
| WPI / PPI / RBI expansion | ❌ **PROHIBITED** |

### 6.5 Source / provenance requirements

| Field | Record |
|---|---|
| Provenance requirement | ✅ **PRESERVED** as already established — **not reinvented** (§9) |
| New provenance policy invented by this act? | ❌ **NO** |
| M-3 provenance establishment | ⚠️ **UNRESOLVED — recorded as explicit dependency** (§9.2) |

### 6.6 Provider/source ↔ application acquisition path

| Field | Record |
|---|---|
| Governance of the relationship between designated provider/source and the Macro application acquisition path | ✅ **ESTABLISHED** |
| Scope | Governance only — the relationship's **governed form**, not its build |
| Existing `/research/macro` product boundary | ✅ **PRESERVED unchanged** (§8) |

### 6.7 Prospective effect only

> # **This act has PROSPECTIVE EFFECT ONLY.** (§12)

---

## 7. PROVIDER SELECTION vs AUTHORITY — CRITICAL SEPARATION

> # ⚠️ **AUTHORITY ≠ DESIGNATION ≠ ENTITLEMENT ≠ IMPLEMENTATION ≠ PRODUCTION**

| # | Element | Status |
|---:|---|---|
| **A** | **Authority to designate a provider** | ✅ **ESTABLISHED BY THIS ACT** |
| **B** | **Actual provider designation** | ❌ **NOT MADE** |
| **C** | **Provider entitlement / contract** | ❌ **NOT GRANTED** |
| **D** | **Implementation of acquisition** | ❌ **NOT AUTHORIZED** |
| **E** | **Production authorization** | ❌ **NOT AUTHORIZED** |

### 7.2 No provider is designated by this act

> **This act designates NO provider.** The corpus does **not** independently require that a specific provider be designated now.

One candidate is evident from the record — **MoSPI**, described as *"national-statistics (macro) data commissioned under WP-MACRO-02/03"* and present in implementation as `server/macro/mospi-source.ts`. However:

- the WP-MACRO-01/02/03 **source records are absent from IRR** (0 occurrences);
- the D8 Macro scope act made **no** provider designation;
- the D06/D07 designation act's provider selection was **D07-only**.

> ### 🔴 **MoSPI is recorded as an EVIDENT CANDIDATE, not designated.** Actual designation is a separate act requiring its own authority. This gate does not silently combine it with implementation.

### 7.3 Entitlement remains separate

No provider entitlement, licensing, credential, contract, or network activation is granted. Per the D06/D07 precedent: *"no NSE, Dhan, MOSPI, MoSPI, RBI, or other provider entitlement."*

---

## 8. WP-MACRO-03 HARD FENCE

> # **WP-MACRO-03 REMAINS INDEPENDENTLY AUTHORITATIVE.**
> # **THIS ACT DOES NOT WEAKEN, REPLACE, SUPERSEDE, OR REINTERPRET WP-MACRO-03.**

| # | Preserved constraint | Status |
|---:|---|---|
| 1 | Macro **LIVE-only** | ✅ **PRESERVED** |
| 2 | **NEVER SNAPSHOT** | ✅ **PRESERVED** |
| 3 | Approved Macro **dataset boundary** | ✅ **PRESERVED** |
| 4 | **NAS / CPI / IIP** boundary | ✅ **PRESERVED** |
| 5 | **No derived Macro values** | ✅ **PRESERVED** |
| 6 | **Provenance requirements** | ✅ **PRESERVED** |
| 7 | **Governed transport** (`guardRead('macro')`) | ✅ **PRESERVED** |
| 8 | Existing **Macro contract** | ✅ **PRESERVED** |
| 9 | Existing **`/research/macro` product boundary** | ✅ **PRESERVED** |
| 10 | Existing **authorization / guard semantics** | ✅ **PRESERVED** |

### 8.1 Two formulations that MUST NOT appear

> # ❌ **This authority act is NOT authorization to create a SNAPSHOT Macro path.**
> # ❌ **D08 authority does NOT override WP-MACRO-03.**

> ⚠️ **D91 relief does not permit SNAPSHOT.** SNAPSHOT is independently prohibited by WP-MACRO-03, which lies outside D88 competence and outside this act's authority.

---

## 9. PROVENANCE

### 9.1 Preserved, not reinvented

> **This act preserves the established provenance requirement. It invents no new provenance policy.**

### 9.2 M-3 — explicit unresolved dependency

| Field | Record |
|---|---|
| `M-3_PROVENANCE_ESTABLISHMENT` | ⚠️ **NOT ESTABLISHED** — recorded as dependency, **not silently resolved** |
| Source | M-2 §8: *"NOT GRANTED — this act explicitly does NOT itself establish M-3 provenance"* |
| Required fields (existing contract) | `sourceClassification`, `asOf`, `evaluatedAt`, `dataVersion`, `lineageDigest` (SHA-256), `quality`, `replayConstraintApplied` |
| Resolved by this act? | ❌ **NO** — separate gate required |

---

## 10. AUTHORITY / RESPONSIBILITY MATRIX

| Function | Authority |
|---|---|
| **Source/provider designation** | **D08 Macro authority established by this act** |
| **Prospective acquisition authorization** | **D08 Macro authority established by this act** |
| **Acquisition mechanism (governance level)** | **D08 Macro authority established by this act** |
| Dataset eligibility | **Existing WP-MACRO-03 boundary** |
| LIVE-only | **WP-MACRO-03** |
| SNAPSHOT | **Prohibited by WP-MACRO-03** |
| No derived Macro values | **WP-MACRO-03** |
| Provenance | **Existing governed provenance boundary** (M-3 **unresolved — dependency**) |
| Governed transport | **WP-MACRO-03** (`guardRead('macro')`) |
| UI12 data-mode | **D88** |
| D91 relief | **D91 mechanism / D88 competence** |
| Offline intelligence supply | **M-2** |
| D8 Intelligence domain scope | **D8 scope determination act** |
| Implementation | **Separate future authorization** |
| Deployment | **Separate future authorization** |
| Qualification | **Not authorized** |
| Acceptance | **Not authorized** |
| Certification | **Not authorized** |
| Production | **Not authorized** |

> **No authority is assigned where the corpus does not support it.**

---

## 11. EXPLICIT EXCLUSIONS

> # **THIS ACT DOES NOT AUTHORIZE OR GRANT:**

| # | Exclusion |
|---:|---|
| 1 | **D88 expansion** |
| 2 | **D91 modification** |
| 3 | **D91 relief** (neither requested nor granted) |
| 4 | **SNAPSHOT** Macro acquisition or fallback |
| 5 | **Provider entitlement / contract / credentials / network activation** unless separately designated |
| 6 | **Implementation** |
| 7 | **Deployment** |
| 8 | **Production** |
| 9 | **Certification** |
| 10 | **Acceptance** |
| 11 | **Qualification** |
| 12 | **Unrelated Macro policy changes** |
| 13 | **Historical rewriting** |
| 14 | **M-2 expansion** |
| 15 | **D115 or unrelated architecture** |
| 16 | **Dataset-selection variation** (WPI / PPI / RBI) |
| 17 | **Vintage-policy change** |
| 18 | **Derived Macro values** |
| 19 | **Retroactive / historical acquisition** |
| 20 | **Technology selection** (database, ORM, schema, storage, vendor, protocol, deployment) |

---

## 12. PROSPECTIVE EFFECT

> # **THIS ACT ESTABLISHES AUTHORITY PROSPECTIVELY FROM ITS EFFECTIVE / AUTHORITATIVE PUBLICATION POINT (`2026-10-04T18:29:31Z`).**

| Statement | Record |
|---|---|
| Prospective effect | ✅ **YES** |
| Retroactive authorization of prior Macro acquisition | ❌ **NOT AUTHORIZED** |
| Historical records rewritten | ❌ **NONE** |

**No historical record is rewritten by this act** (§14).

---

## 13. RELATIONSHIPS

### 13.1 D88 / D91 fence

| Statement | Record |
|---|---|
| **D88** remains limited to **UI12 account-wide data-mode authority** | ✅ **UNCHANGED** |
| **D91** remains the **UI12 relief mechanism** | ✅ **UNCHANGED** |
| Is this D08 authority independent of D88/D91? | ✅ **YES — independent** |
| Is D88 modified? | ❌ **NO** |
| Is D91 modified? | ❌ **NO** |
| Is D91 relief conferred or requested? | ❌ **NO** |

> ### **M-5 remains dispositioned as: `M-5 D91 DEPENDENCY — OUTSIDE D88/UI12 RELIEF COMPETENCE`**

### 13.2 M-2 boundary

| Statement | Record |
|---|---|
| M-2 remains the established **Intelligence Data Supply Authority** for its existing scope | ✅ **UNCHANGED** |
| M-2's **offline** intelligence-data boundary | ✅ **PRESERVED** |
| Is M-2 expanded to cover LIVE Macro? | ❌ **NO** |
| Are M-2's existing exclusions altered? | ❌ **NO** |
| Is this act a replacement for M-2? | ❌ **NO** |

### 13.3 D06/D07 precedent

| Statement | Record |
|---|---|
| Used as **structural precedent only** | ✅ |
| Its D08 exclusion still intact? | ✅ **YES — untouched at blob `4dc2288a…`** |
| Are its substantive provider decisions copied into D08? | ❌ **NO** |
| Is the D06/D07 act modified? | ❌ **NO** |

### 13.4 D8 / GATE-Y

| Statement | Record |
|---|---|
| Macro remains **IN D8 Intelligence scope** | ✅ (D8 scope act, decision **A**) |
| This authority sits under the GATE-Y Intelligence data-supply path | ✅ |

---

## 14. HISTORICAL RECORDS — NO REWRITES

| Record | Treatment |
|---|---|
| D8 Macro scope act | ❌ Unmodified — `7cd63efb…` |
| M-2 authority act | ❌ Unmodified — `bd3be402…` |
| D06/D07 designation act | ❌ Unmodified — `4dc2288a…` |
| D88 authority act | ❌ Unmodified — `d396e688…` |
| D91 competence act | ❌ Unmodified — `4bb191a6…` |
| D91 mechanism act | ❌ Unmodified — `f61325ee…` |
| M-5 disposition act | ❌ Unmodified — `2006786c…` |
| WP-MACRO-03 | ❌ Unmodified |
| D89 / D90 | ❌ Unmodified; D89 disclosure item remains **historically OPEN** |
| D115 acts | ❌ Unmodified — `4ab8c649…`, `c25c4ac8…` |

---

## 15. DURABILITY METADATA

| Field | Value |
|---|---|
| **Repository** | **`ramkivs/iips-review-recovered`** (IRR) |
| **Ref** | **`main`** (`refs/heads/main`) |
| **Baseline commit BEFORE mutation** | **`c25c4ac845035d243be38727a6b6e90d229aa5ea`** |
| **Baseline tree BEFORE mutation** | `9a54f6831a2fc5799d6f4df8d2b80b09df875b07` |
| **Artifact path** | **`docs/integration/NP-08-D08-MACRO-SOURCE-PROVIDER-DESIGNATION-ACT.md`** |
| **Placement rationale** | `docs/integration/` is the established IRR governance-record location, consistent with the D88, D91, M-5, and D8 scope acts. **Not** placed in `evidence/intelligence-data-supply-governance/`: that directory is the byte-exact 10-file IPD GATE-Y corpus mirror published by P-4. |
| **IPD** | **OUT OF SCOPE — zero mutation** |
| **Production** | **OUT OF SCOPE** |
| Durability convention | **C-1** — durable only on authoritative remote publication **plus** independent remote verification |

---

## 16. VERIFICATION RECORD

| # | Check | Requirement |
|---:|---|---|
| 1 | Remote commit exists | ☐ |
| 2 | Parent = `c25c4ac845035d243be38727a6b6e90d229aa5ea` | ☐ |
| 3 | Ref = `main` | ☐ |
| 4 | Artifact present on remote `main` | ☐ |
| 5 | Blob SHA recorded | ☐ |
| 6 | SHA-256 from remote content | ☐ |
| 7 | Byte count / line count | ☐ |
| 8 | Clean worktree | ☐ |
| 9 | No unintended files changed | ☐ |
| 10 | Remote artifact re-read and rescanned | ☐ |
| 11 | IPD unchanged | ☐ |

---

## 17. NEXT GATES (NOT AUTHORIZED BY THIS ACT)

| # | Gate | Requires |
|---:|---|---|
| 1 | **Macro provider designation** | Actual designation of a source/provider (MoSPI is the evident candidate — §7.2) |
| 2 | **Provider entitlement / licensing** | Contract, credential, network activation |
| 3 | **Acquisition implementation** | Code, transport, storage, schema — separate authorization |
| 4 | **M-3 provenance establishment** | Resolving the §9.2 dependency |
| 5 | **D89 Macro disclosure obligation** | Historically OPEN; separate resolution |
| 6 | **Qualification / acceptance / certification** | Not authorized anywhere |

---

*End of Authority Act. **D08 Macro source/provider designation authority and prospective acquisition authorization ESTABLISHED** — governance only, prospective only, inside WP-MACRO-03. No provider selected. No entitlement. No implementation. No deployment. No qualification, acceptance, certification, or production. No historical record modified.*
