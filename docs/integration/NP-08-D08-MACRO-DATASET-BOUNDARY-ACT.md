# NP-08 / D08 MACRO — DATASET BOUNDARY CONSTITUTION ACT

> **1. Act ID:** `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT-01`
> **2. Title:** D08 Macro — Dataset Boundary Constitution and D8 Schema-Vocabulary Reconciliation Act
> **3. Effective date/time:** **`2026-10-04T19:20:30Z`** (UTC) — **prospective only** (§24)
> **4. Issuing authority:** **Ramki / Program Authority** — explicit authority to resolve the Macro dataset boundary identified by the completed read-only investigation. `arena-agent` performed investigation, verification, and record-execution **only**; no decision rendered by the agent.
> **Act type:** `CONSTITUTIVE GOVERNANCE BOUNDARY` — **non-executable**
> **Workstream:** NP-08 — Intelligence · GATE-Y
> **Repository / ref (durable):** `ramkivs/iips-review-recovered` @ `main`
> **Mutation:** one new governance artifact; **zero** modification to any historical record
> **IPD:** **OUT OF SCOPE — zero mutation**

---

## 5. PURPOSE

To constitute, **for the first time with IRR-native constitutive force**, the durable **D08 Macro dataset boundary** — a boundary that the completed investigation (`NP-08-D08-MACRO-DATASET-BOUNDARY-PROVENANCE-INVESTIGATION.md`) established was previously **preserved but never constituted** inside IRR.

The investigation determined:

| # | Finding | Status |
|---:|---|---|
| A | D8 line 60 introduces the series vocabulary as derived from forensic M-1 and the `IntelligenceDTO` contract | ✅ Accepted |
| B | D8 §3 did **not** authorize a Macro dataset; D08 Macro was DEFERRED and macro data acquisition was not authorized | ✅ Accepted |
| C | `GDP`, `REPO_RATE`, `10Y_GSEC`, `TRADE_DEFICIT` each occur **only once** in the corpus — in the D8 product/schema contract description | ✅ Accepted |
| D | Those four series have **no independent governing authority** established by the IRR corpus | ✅ Accepted |
| E | `NAS / CPI / IIP` is preserved by later NP-08 acts, but its originating WP-MACRO-03 record is **absent from IRR** | ✅ Accepted |
| F | Boundary classification: **`ESTABLISHED BY DOWNSTREAM PRESERVATION ONLY`** | ✅ Accepted |
| G | NAS source — **unresolved** | ✅ Accepted |
| H | MoSPI dataset coverage — **unresolved** | ✅ Accepted |

> # ⚠️ **THIS ACT CONSTITUTES A DATASET BOUNDARY ONLY.**
> **No provider is designated. No entitlement is granted. No implementation is authorized. No production is authorized.**

---

## 6. AUTHORITY BASIS

| Element | Basis |
|---|---|
| Program Authority | **Ramki / Program Authority** — authorization of this gate, limited to establishing the durable governance boundary |
| D08 authority established | `NP-08-D08-MACRO-SOURCE-PROVIDER-DESIGNATION-ACT-01` (blob `8c98cfde…`) — D08 Macro source/provider designation authority **ESTABLISHED** |
| D08 Macro in scope | `NP-08-D8-MACRO-SCOPE-DETERMINATION-ACT-01` (blob `7cd63efb…`) — decision **A — MACRO REMAINS IN D8 INTELLIGENCE SCOPE** |
| M-2 authority envelope | `gate-y-m2-intelligence-data-authorization-2026-09-27-001` (blob `bd3be402…`) — macro lies within the granted authority envelope |
| Precedent act | `NP-08-D08-MACRO-DATASET-BOUNDARY-PROVENANCE-INVESTIGATION.md` — read-only, Outcome **B** |

### 6.1 §3 corpus-support test (passed before constituting)

| Test | Result |
|---|---|
| Does the current corpus still support `NAS / CPI / IIP` as the intended boundary? | ✅ **YES** — four durable acts record it as the **"approved dataset boundary"** |
| Does any authoritative record contradict it? | ❌ **NO** — zero contradicting records found on `origin/main` |
| Is D8 a competing dataset authority? | ❌ **NO** — D8 §3 authorizes **no** dataset (§15) |
| May the boundary be constituted while NAS source is unresolved? | ✅ **YES** — §4 of the gate expressly permits recording `NAS source = UNRESOLVED` |

---

## 7. D08 MACRO SCOPE

| Field | Record |
|---|---|
| Domain | **D8 Intelligence** |
| Sub-domain | **D08 Macro** |
| In D8 Intelligence scope? | ✅ **YES** — `NP-08-D8-MACRO-SCOPE-DETERMINATION-ACT-01`, decision **A** |
| Historical D8 status | **DEFERRED** (original D8 act, blob `a2b4179f…`, §3) |
| Scope changed by this act? | ❌ **NO** — scope is unchanged; only the **dataset boundary** is constituted |
| Macro data acquisition authorized by this act? | ❌ **NO** |
| M-1 commissioned? | ❌ **NO — remains NOT COMMISSIONED** |
| M-3 established? | ❌ **NO — remains NOT ESTABLISHED** |

---

## 8. DATASET BOUNDARY

> # **THE D08 MACRO GOVERNANCE DATASET BOUNDARY IS: `NAS` / `CPI` / `IIP`.**

This is a **D08 Macro governance boundary**.

It is **not**:

- a provider designation;
- a designation of **MoSPI**;
- a designation of **RBI**;
- a provider entitlement;
- an implementation authorization;
- a production authorization.

| Series | Boundary status |
|---|---|
| `NAS` | ✅ **IN BOUNDARY** |
| `CPI` | ✅ **IN BOUNDARY** |
| `IIP` | ✅ **IN BOUNDARY** |
| `GDP` | ❌ **OUTSIDE** |
| `REPO_RATE` | ❌ **OUTSIDE** |
| `10Y_GSEC` | ❌ **OUTSIDE** |
| `WPI` | ❌ **OUTSIDE** |
| `TRADE_DEFICIT` | ❌ **OUTSIDE** |

### 8.1 Central statement

> ## **Within the D08 Macro governance boundary, the currently constituted dataset scope is `NAS` / `CPI` / `IIP`. Presence of additional series names in the `IntelligenceDTO` / product schema does not itself constitute governed Macro dataset authority. `GDP`, `REPO_RATE`, `10Y_GSEC`, `WPI`, and `TRADE_DEFICIT` are not thereby authorized by this act.**

This statement was **verified against the corpus** before adoption (§12) — it is supported by D8 line 60 and D8 §3.

---

## 9. NAS STATUS

| Field | Record |
|---|---|
| Boundary status | ✅ **IN BOUNDARY** |
| **Source** | ⚠️ **`UNRESOLVED`** |
| Source designated by this act? | ❌ **NO** |

### 9.1 §4 investigation result — classification **C — NAS SOURCE ABSENT / UNRESOLVED**

| Search term | Occurrences on `origin/main` | Result |
|---|---:|---|
| `NAS` (word-boundary) | **7** — all inside the boundary phrase, in 4 acts | No authoritative source linkage |
| `National Accounts Statistics` | **0** | Absent |
| `national accounts` | **0** | Absent |
| `NSO` (word-boundary) | **0** | Absent |
| `sourceAgency` | **1** — D8 line 64 only, qualified **"e.g."** | Example vocabulary only |
| `source provider` | **0** | Absent |
| `MoSPI` | 9 — candidate / exclusion / contract-example / entitlement-withheld | **Not linked to `NAS` by any authoritative record on `origin/main`** |

> # ⚠️ **NO AUTHORITATIVE RECORD ON `origin/main` LINKS `NAS` TO ANY SOURCE.**
>
> **MoSPI is NOT assigned to `NAS` by this act.** The gate expressly forbids assigning MoSPI merely because NAS is generally associated with national statistics. **No source is invented.**
>
> **Evidence-scope note.** Non-authoritative implementation evidence outside `origin/main` does link `NAS` to MoSPI in code — on `phase13-next` and `gai-impl-canonical`: `SOURCE_ID = 'MoSPI'`, `APPROVED_DATASETS = ['NAS', 'CPI', 'IIP']`, `NAS: '/api/nas/getNASData'`, and `NAS: { label: 'National Accounts Statistics' }`. That evidence is **absent from `origin/main`**, is implementation rather than governance, and confers no designation, entitlement, acquisition authority, or provenance. Its existence does **not** resolve the `NAS` source question.

---

## 10. CPI STATUS

| Field | Record |
|---|---|
| Boundary status | ✅ **IN BOUNDARY** |
| Corpus contradiction? | ❌ **NONE** |
| Provider inferred from dataset name? | ❌ **NO** |

CPI appears in the corpus only in (a) the preserved boundary phrase in four NP-08 acts, and (b) D8 line 64 as product/schema vocabulary. **No record excludes CPI.** No provider is inferred from the dataset name.

---

## 11. IIP STATUS

| Field | Record |
|---|---|
| Boundary status | ✅ **IN BOUNDARY** |
| Corpus contradiction? | ❌ **NONE** |
| Provider inferred from dataset name? | ❌ **NO** |

IIP appears in the corpus only in (a) the preserved boundary phrase in four NP-08 acts, and (b) D8 line 64 as product/schema vocabulary. **No record excludes IIP.** No provider is inferred from the dataset name.

> ⚠️ **Measurement note:** a prior gate reported `IIP` = 32,257 occurrences. That figure was a **substring artifact of "IIPS"**. Corrected word-boundary count: **IIP = 132**, NAS = 106, CPI = 102, WPI = 54, GDP = 8, `REPO_RATE` / `10Y_GSEC` / `TRADE_DEFICIT` = 4 each.

---

## 12. D8 SCHEMA-VOCABULARY RECONCILIATION

**D8 is not rewritten. No field is deleted. No series is declared invalid.**

### 12.1 Vocabulary preserved

D8 (blob `a2b4179f…`) line 64 records the product/schema vocabulary:

> `seriesId` (`CPI`, `IIP`, `GDP`, `REPO_RATE`, `10Y_GSEC`, `WPI`, `TRADE_DEFICIT`), `sourceAgency` (e.g., `MoSPI`, `RBI`), `vintageDate`, `releaseDate`, `value`

introduced by line 60:

> **"Intelligence data domains (per forensic M-1 and `IntelligenceDTO` contract `src/transports/intelligence_dto.ts`):"**

### 12.2 Reconciliation statement — **SUPPORTED AND ADOPTED**

> # **Presence in the `IntelligenceDTO` / product schema vocabulary does not by itself constitute governed Macro dataset authority.**

**Corpus basis:**

| # | Evidence | Location |
|---:|---|---|
| 1 | The vocabulary is attributed to the **product contract**, not to a governance authorization | D8 line 60 |
| 2 | `sourceAgency` is qualified **"e.g."** — example vocabulary | D8 line 64 |
| 3 | D8 §3 sets **D08 MACRO = DEFERRED** and orders *"Do not authorize macro data acquisition"* | D8 line 79 |
| 4 | D8 §3 authorizes no dataset and does not authorize implementation or production | D8 lines 81–85 |

### 12.3 Classification of the apparent conflict

> **`B — SCHEMA/PRODUCT VOCABULARY vs AUTHORITY BOUNDARY`**

Two records operating on **different dimensions** do not conflict as a matter of governance. D8 describes what the contract **can express**; this act governs what **may be acquired**.

---

## 13. GDP STATUS

> # **`GDP`**
> **CURRENT GOVERNED MACRO BOUNDARY STATUS: `OUTSIDE ESTABLISHED D08 MACRO DATASET BOUNDARY` / `NO GOVERNED SOURCE ESTABLISHED`**

| Field | Record |
|---|---|
| Corpus occurrences | **1** — D8 line 64 only |
| Independent governing authority | ❌ **NONE** |
| Authorized by this act? | ❌ **NO** |
| Permanently prohibited? | ❌ **NOT DECLARED** — no authoritative act supports that conclusion |
| D8 field deleted? | ❌ **NO** — D8 is unmodified |

---

## 14. REPO_RATE STATUS

> # **`REPO_RATE`**
> **CURRENT GOVERNED MACRO BOUNDARY STATUS: `OUTSIDE ESTABLISHED D08 MACRO DATASET BOUNDARY` / `NO GOVERNED SOURCE ESTABLISHED`**

| Field | Record |
|---|---|
| Corpus occurrences | **1** — D8 line 64 only |
| Independent governing authority | ❌ **NONE** |
| Authorized by this act? | ❌ **NO** |
| RBI authority created? | ❌ **NO** — §16 |
| Permanently prohibited? | ❌ **NOT DECLARED** — no authoritative act supports that conclusion |
| D8 field deleted? | ❌ **NO** — D8 is unmodified |

---

## 15. 10Y_GSEC STATUS

> # **`10Y_GSEC`**
> **CURRENT GOVERNED MACRO BOUNDARY STATUS: `OUTSIDE ESTABLISHED D08 MACRO DATASET BOUNDARY` / `NO GOVERNED SOURCE ESTABLISHED`**

| Field | Record |
|---|---|
| Corpus occurrences | **1** — D8 line 64 only |
| Independent governing authority | ❌ **NONE** |
| Authorized by this act? | ❌ **NO** |
| RBI authority created? | ❌ **NO** — §16 |
| Permanently prohibited? | ❌ **NOT DECLARED** — no authoritative act supports that conclusion |
| D8 field deleted? | ❌ **NO** — D8 is unmodified |

---

## 16. WPI STATUS

> # **`WPI`**
> **CURRENT GOVERNED MACRO BOUNDARY STATUS: `OUTSIDE ESTABLISHED D08 MACRO DATASET BOUNDARY` / `NO GOVERNED SOURCE ESTABLISHED`**

| Field | Record |
|---|---|
| Corpus occurrences | **54** (8 distinct lines) |
| Authorized by this act? | ❌ **NO** |
| WPI authority created? | ❌ **NO** |
| Permanently prohibited as a dataset? | ❌ **NOT DECLARED** — see note below |
| D8 field deleted? | ❌ **NO** — D8 is unmodified |

### 16.1 Preserved exclusion — **unchanged**

| # | Preserved statement | Location |
|---:|---|---|
| 1 | `\| WPI / PPI / RBI expansion \| ❌ **PROHIBITED** \|` | D08 designation act line 72 |
| 2 | `\| 16 \| Dataset-selection variation (WPI / PPI / RBI) \|` | D08 designation act line 219 |
| 3 | `\| 6 \| No WPI / PPI / RBI expansion \| ✅ **PRESERVED** \|` | M-5 disposition line 145 |
| 4 | `\| NAS / CPI / IIP approved dataset boundary \| ✅ **PRESERVED** — no WPI/PPI/RBI authority expansion \|` | D91 competence line 137 |
| 5 | `\| 6 \| No WPI / PPI / RBI authority expansion \|` | D91 mechanism line 275 |
| 6 | `* MoSPI / RBI / WPI authority;` (non-grant list) | D88 §9.4 line 102 |

> ⚠️ **Precision note.** The preserved prohibition is an ** authority-expansion** prohibition (`no WPI/PPI/RBI authority expansion`). This act **preserves it unchanged** and does **not** convert it into a dataset-level permanent prohibition, because no authoritative act in the corpus supports that broader conclusion. `WPI` is recorded as **OUTSIDE the constituted boundary**.

---

## 17. TRADE_DEFICIT STATUS

> # **`TRADE_DEFICIT`**
> **CURRENT GOVERNED MACRO BOUNDARY STATUS: `OUTSIDE ESTABLISHED D08 MACRO DATASET BOUNDARY` / `NO GOVERNED SOURCE ESTABLISHED`**

| Field | Record |
|---|---|
| Corpus occurrences | **1** — D8 line 64 only |
| Independent governing authority | ❌ **NONE** |
| Authorized by this act? | ❌ **NO** |
| Permanently prohibited? | ❌ **NOT DECLARED** — no authoritative act supports that conclusion |
| D8 field deleted? | ❌ **NO** — D8 is unmodified |

---

## 18. SOURCE / PROVIDER BOUNDARY

> # **NO SOURCE OR PROVIDER IS DESIGNATED, ENTITLED, OR SELECTED BY THIS ACT.**

| # | Provider / source | Status |
|---:|---|---|
| 1 | **MoSPI** | ❌ **NOT DESIGNATED** — evident candidate only; dataset coverage **unresolved** |
| 2 | **RBI** | ❌ **NOT DESIGNATED** — and `REPO_RATE` / `10Y_GSEC` authority is **not created** |
| 3 | **NSO** | ❌ **NOT DESIGNATED** — 0 occurrences in corpus |
| 4 | Any other provider | ❌ **NOT DESIGNATED** |

| Field | Record |
|---|---|
| Provider entitlement / licensing | ❌ **NOT GRANTED** |
| Credentials / contracts / network activation | ❌ **NOT GRANTED** |
| Provider qualification or acceptance | ❌ **NOT GRANTED** |
| Does this act narrow the field to one provider? | ❌ **NO** |

> **Provider designation remains the NEXT separate gate.**

---

## 19. PROVENANCE STATUS

**No provenance is manufactured. The absent WP-MACRO-03 source is NOT claimed to have been recovered.**

### 19.1 Three-way provenance distinction

| | Category | Content |
|---|---|---|
| **A** | **Constituted by this IRR-native act** | The **`NAS` / `CPI` / `IIP`** dataset boundary **as IRR-native constitutive authority**; the schema-reconciliation statement (§12.2); the out-of-boundary record for `GDP` / `REPO_RATE` / `10Y_GSEC` / `WPI` / `TRADE_DEFICIT`; the `NAS source = UNRESOLVED` record |
| **B** | **Preserved from downstream records** | The **content** `NAS / CPI / IIP`, adopted from four durable NP-08 acts that preserved it: D91 competence line 137, D91 mechanism lines 125/252/272, M-5 disposition line 142, D08 designation act lines 70/136 |
| **C** | **Inherited / unverified — originating source absent** | The originating **WP-MACRO-03 decision record**. `IIPS-WP-MACRO-03-DECISION.md` is **absent** from every ref and tag; no `WP-MACRO` file exists in the tree. The `G:\IIPS` corpus and the historical Macro bundles are **unavailable in this environment** |

### 19.2 Environment limitation — reported, not papered over

| Item | Status |
|---|---|
| `IIPS-WP-MACRO-03-DECISION.md` | ❌ **ABSENT** from all refs / tags |
| `G:\IIPS` / `G:\IIPS-*` corpus | ❌ **NOT PRESENT** in this Linux sandbox |
| `iips-milestone-wp-macro-0*.bundle` | ❌ **0 files** found |

> **Effect on validity.** The **content** of the boundary is determinable from the corpus (four durable preservation records, no contradicting record). What is absent is the **originating historical authority record**. Because this act supplies **IRR-native constitutive authority** prospectively, the missing source is **not required for the validity of this constitution** — it is required only for **historical provenance**, which is recorded here as **unverified**.

---

## 20. WP-MACRO-03 RELATIONSHIP

> # **WP-MACRO-03 REMAINS INDEPENDENTLY AUTHORITATIVE.**
> # **THIS ACT DOES NOT WEAKEN, REPLACE, SUPERSEDE, AMEND, OR REINTERPRET WP-MACRO-03.**

| # | WP-MACRO-03 constraint | Status |
|---:|---|---|
| 1 | Dataset boundary (`NAS / CPI / IIP`) | ✅ **CONSTITUTED IRR-natively — not expanded** |
| 2 | LIVE-only | ✅ **Preserved — not weakened** |
| 3 | SNAPSHOT | ❌ **Not authorized — remains prohibited** |
| 4 | No WPI / PPI / RBI authority expansion | ✅ **Preserved — §16.1** |
| 5 | No derived Macro values | ✅ **Preserved** |
| 6 | Provenance requirements | ✅ **Preserved** |
| 7 | Governed transport (`guardRead('macro')`) | ✅ **Preserved** |
| 8 | Source governance | ✅ **Preserved** |

| Field | Record |
|---|---|
| Is WP-MACRO-03 modified by this act? | ❌ **NO** |
| Does this act override WP-MACRO-03? | ❌ **NO** |
| Does this act expand the dataset boundary? | ❌ **NO** |
| Does this act create REPO_RATE or 10Y_GSEC authority? | ❌ **NO** |

---

## 21. D88 / D91 RELATIONSHIP

| Record | Status |
|---|---|
| **D88** (blob `d396e688…`) | ❌ **NOT MODIFIED** — UI12 data-mode authority only; §9.4 exclusions preserved |
| **D91 competence** (blob `4bb191a6…`) | ❌ **NOT MODIFIED** |
| **D91 mechanism** (blob `f61325ee…`) | ❌ **NOT MODIFIED** — §18 `D91 RELIEF — NOT GRANTED` unchanged |
| **D91 relief** | ❌ **NOT REQUESTED, NOT GRANTED** by this act |
| D88/D91 relief needed to constitute this boundary? | ❌ **NO** |

---

## 22. M-5 RELATIONSHIP

| Field | Record |
|---|---|
| **M-5 disposition** (blob `2006786c…`) | ❌ **NOT MODIFIED, NOT REOPENED** |
| M-5 status | **UNCHANGED** — `M-5 D91 DEPENDENCY — OUTSIDE D88/UI12 RELIEF COMPETENCE` |
| Does this act constitute a D91 relief status? | ❌ **NO** |

---

## 23. PROVIDER DESIGNATION STATUS

> # **PROVIDER DESIGNATION = `NOT YET MADE`.**

| # | Item | Status |
|---:|---|---|
| 1 | MoSPI | ❌ **NOT DESIGNATED** |
| 2 | RBI | ❌ **NOT DESIGNATED** |
| 3 | NSO | ❌ **NOT DESIGNATED** |
| 4 | Any other provider | ❌ **NOT DESIGNATED** |
| 5 | Provider entitlement / licensing | ❌ **NOT GRANTED** |
| 6 | Provider qualification / acceptance | ❌ **NOT GRANTED** |

---

## 24. IMPLEMENTATION STATUS

> # **IMPLEMENTATION = `NOT AUTHORIZED`.**

Not authorized by this act:

- ❌ transport code;
- ❌ API acquisition code;
- ❌ storage;
- ❌ credentials;
- ❌ provider integration;
- ❌ Macro UI modification;
- ❌ `/api/macro` modification;
- ❌ database / schema / migration;
- ❌ deployment.

**Implementation remains a future, separately authorized gate.**

---

## 25. PRODUCTION STATUS

> # **PRODUCTION = `NOT AUTHORIZED`.**

| # | Item | Status |
|---:|---|---|
| 1 | Production deployment | ❌ **NOT AUTHORIZED** |
| 2 | Certification | ❌ **NOT GRANTED** |
| 3 | Acceptance | ❌ **NOT GRANTED** |
| 4 | Live data operation | ❌ **NOT AUTHORIZED** |
| 5 | Retroactive authorization of prior acquisition | ❌ **NOT AUTHORIZED** — **prospective only** |

---

## 26. EXPLICIT EXCLUSIONS

| # | Exclusion |
|---:|---|
| 1 | ❌ No provider designation (MoSPI, RBI, NSO, or any other) |
| 2 | ❌ No provider entitlement, licensing, credential, or contract |
| 3 | ❌ No acquisition or storage implementation |
| 4 | ❌ No deployment or production |
| 5 | ❌ No certification or acceptance |
| 6 | ❌ No D88 expansion |
| 7 | ❌ No D91 modification; no D91 relief requested or granted |
| 8 | ❌ No M-5 reopening |
| 9 | ❌ No WP-MACRO-03 weakening, replacement, amendment, or reinterpretation |
| 10 | ❌ No dataset-boundary expansion |
| 11 | ❌ No LIVE-only weakening; no SNAPSHOT authorization |
| 12 | ❌ No WPI / PPI / RBI authority creation |
| 13 | ❌ No `REPO_RATE` or `10Y_GSEC` authority creation |
| 14 | ❌ No derived Macro values |
| 15 | ❌ No provenance or source-governance change |
| 16 | ❌ No rewrite, narrowing, or broadening of D8 |
| 17 | ❌ No deletion or invalidation of any D8 schema field |
| 18 | ❌ No declaration that `GDP` / `REPO_RATE` / `10Y_GSEC` / `TRADE_DEFICIT` are permanently prohibited |
| 19 | ❌ No M-2 expansion |
| 20 | ❌ No M-1 commissioning |
| 21 | ❌ No M-3 establishment |
| 22 | ❌ No technology, vendor, protocol, or storage selection |
| 23 | ❌ No retroactive authorization — **prospective effect only** |
| 24 | ❌ No claim that the absent WP-MACRO-03 source has been recovered |
| 25 | ❌ No IPD access or mutation |

---

## 27. FOLLOW-ON DEPENDENCIES

| # | Dependency | Status | Gate |
|---:|---|---|---|
| 1 | **NAS source identification** | ⚠️ **UNRESOLVED** — no authoritative linkage to any source on `origin/main`; non-authoritative implementation linkage exists on other refs | Separate investigation |
| 2 | **MoSPI dataset-coverage evidence** | ⚠️ **UNRESOLVED** — no authoritative coverage statement establishing MoSPI coverage for NAS/CPI/IIP exists on `origin/main`; non-authoritative implementation evidence exists on other refs | Provider designation gate |
| 3 | **Provider designation** | ❌ **NOT YET MADE** | **NEXT gate** |
| 4 | Provider entitlement / licensing | ❌ **NOT GRANTED** | After designation |
| 5 | Acquisition implementation | ❌ **NOT AUTHORIZED** | Separate authorization |
| 6 | **M-3 provenance establishment** | ⚠️ **UNRESOLVED** — independent dependency | Separate act |
| 7 | M-1 commissioning | ❌ **NOT COMMISSIONED** | Separate act |
| 8 | D06-NEWS-style forensic route assessment for Macro | ❌ **ABSENT** | Provider designation gate |
| 9 | WP-MACRO-03 originating decision record | ❌ **ABSENT from IRR** — requires `G:\IIPS` corpus | Environment-dependent |
| 10 | D91 relief determination | ❌ **No valid request** | Requires a real request |

---

## 28. RECORDS NOT MODIFIED

| Record | Blob | Status |
|---|---|---|
| `D8-INTELLIGENCE-DOMAIN-SCOPE-DETERMINATION-ACT.md` | `a2b4179f…` | ❌ Unmodified |
| `NP-08-D8-MACRO-SCOPE-DETERMINATION-ACT.md` | `7cd63efb…` | ❌ Unmodified |
| `NP-08-D08-MACRO-SOURCE-PROVIDER-DESIGNATION-ACT.md` | `8c98cfde…` | ❌ Unmodified |
| `NP-08-D88-…AUTHORITY-ESTABLISHMENT-ACT.md` | `d396e688…` | ❌ Unmodified |
| `NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT.md` | `4bb191a6…` | ❌ Unmodified |
| `NP-08-D91-RELIEF-MECHANISM-ACT.md` | `f61325ee…` | ❌ Unmodified |
| `NP-08-M5-D91-OUT-OF-SCOPE-DISPOSITION-ACT.md` | `2006786c…` | ❌ Unmodified |
| `GATE-Y-M2-INTELLIGENCE-DATA-AUTHORIZATION-ACT.md` | `bd3be402…` | ❌ Unmodified |
| `D8-D06-D07-SOURCE-PROVIDER-DESIGNATION-ACT.md` | `4dc2288a…` | ❌ Unmodified |
| `D8-D06-NEWS-SOURCE-PROVIDER-DESIGNATION-ACT.md` | `02ca1079…` | ❌ Unmodified |
| **WP-MACRO-03** | — | ❌ Unmodified |
| **IPD** | `4d3e1cdc…` | ❌ Unmodified — not accessed |

---

*End of Constitution Act. **The D08 Macro dataset boundary is constituted as `NAS` / `CPI` / `IIP` with IRR-native authority. No provider is designated. No entitlement is granted. No implementation is authorized. No production is authorized. The WP-MACRO-03 provenance gap is preserved, not closed.***
