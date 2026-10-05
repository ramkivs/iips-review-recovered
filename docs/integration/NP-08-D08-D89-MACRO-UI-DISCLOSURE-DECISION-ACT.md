# NP-08 / D08 MACRO — D89 UI DISCLOSURE / ATTRIBUTION DECISION ACT

> **Act identifier:** `NP-08-D08-D89-MACRO-UI-DISCLOSURE-DECISION-ACT-01`
> **Decision date:** `2026-10-05` (UTC)
> **Gate:** D89 Macro UI Disclosure / Attribution Governance Gate
> **Classification:** **B — D89 PARTIALLY ESTABLISHED**
> **Act type:** Governance decision; non-executable
> **Mutation authorized by this act:** One additive governance artifact only. No source, transport, API route, test, IPD, or production mutation.

---

## 1. DECISION IN ONE SENTENCE

> **The future D08 Macro UI SHALL identify the source as `MoSPI / e-Sankhyiki` for NAS, CPI and IIP data as a product-transparency control; Category-A formal legal attribution, prescribed attribution wording, source-link duty, licence terms, and non-endorsement duty remain not established by the evidence investigated in this gate.**

The product disclosure requirement is deliberately not treated as proof of a legal attribution obligation, licence permission, redistribution right, retention right, or provider endorsement.

---

## 2. AUTHORITATIVE BASELINE

| Item | Value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Authoritative investigation ref | `origin/main` |
| Baseline commit before this act | `2f8f62be76cff97b17c50b6ca107eaee670c2523` |
| Baseline tree before this act | `23d3387c7cd231de25ad8a69e494690cf6ce620f` |
| Baseline parent | `630820f8cb22fd279f7d93603e5674fff703b11e` |
| Current provider-designation act | `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT.md`; durable designation commit `630820f8cb22fd279f7d93603e5674fff703b11e`; baseline blob `300568446c06bb9ff94c0292cf787349571dda6e` |
| Current entitlement/licensing act | `NP-08-D08-MACRO-ENTITLEMENT-LICENSING-DECISION-ACT.md`; baseline blob `06b9717470b1923709dcd16b117dbb8a7fa8a1bc` |
| Provider act SHA-256 at baseline | `de92dabd81925fd9b4856f3b868a9f12a95f15acb7c64326c859d1b348c058b6` |
| Entitlement act SHA-256 at baseline | `8ffe51fe9d7ea0ec10e7b81c69b7760fa2343357b02d258091ee8a574c6ca2a0` |
| Baseline worktree | Clean; no staged, unstaged, or untracked mutation at the start of the D89 act |
| Provider designation state | **MoSPI — DESIGNATED**, D08 only |
| Entitlement state | **B — ENTITLEMENT PARTIALLY ESTABLISHED** |
| D08 datasets | **NAS / CPI / IIP only** |

`origin/main` was re-read and independently checked against the live GitHub `main` ref before this artifact was created. The provider and entitlement acts above were byte-checked at that baseline and are not rewritten by this act.

---

## 3. DECISION AUTHORITY AND BOUNDARY

| Item | Determination |
|---|---|
| Decision authority | **Ramki / IIPS Program Authority** |
| Agent role | Investigation, evidence comparison, baseline verification and record execution only |
| Governed boundary | **D08 Macro — NAS / CPI / IIP** |
| Designated provider | **MoSPI — Ministry of Statistics and Programme Implementation, Government of India** |
| Source/API identity | **e-Sankhyiki — MoSPI REST API**, technically identified in the prior act as `https://api.mospi.gov.in` |
| Category-A scope | NAS; CPI; IIP at NIC-2-digit level |
| Out of scope | Item-level IIP, CPI shop-level price microdata, WPI, PPI, RBI-sourced series and any other dataset |

Provider designation is not blanket attribution permission or a licence waiver. Category-A access is not blanket attribution permission or a licence waiver.

---

## 4. AUTHORITATIVE EVIDENCE

### 4.1 Tier 1 — GSDD 2019 / OM Y-18020/9/2017-CAP

| Field | Finding |
|---|---|
| Instrument | **Guidelines for Statistical Data Dissemination (GSDD)**, in accordance with NDSAP 2012 |
| Identifier | **OM No. Y-18020/9/2017-CAP** |
| Date / authority | **15.02.2019**; Government of India, MoSPI, Central Statistics Office, Coordination and Publication Division; issued with approval of the Competent Authority |
| Official location | <https://mospi.gov.in/sites/default/files/data_disemination/Data_Dissemination_Guidelines%20_feb19.pdf> |
| Scope | Applies to data collated, compiled and produced by MoSPI, directly or received from Ministries/Departments |
| Category A | §4.A.1 identifies National Accounts data, CPI and IIP at NIC 2 digit level as aggregated/analyzed open-access data shared free of cost |
| Category B | §4.A.2 identifies primary/unit-level data and item-level IIP as restricted access data available by registration |
| Annex | §5(7) directs Category-B requisitions, and Category-C requisitions, to the Annex/Data Access Agreement |
| Annex clause 5 | Requires books, articles, papers, theses, reports and publications employing data obtained under the request to cite the data source |
| Category-A UI attribution | **No Category-A attribution, source-citation, provider-naming, acknowledgement, redistribution notice, disclaimer or non-endorsement wording is prescribed in the Category-A provisions investigated** |

The Annex clause 5 obligation is not imported into Category A. It remains a Category-B/C condition and does not govern the D08 NAS/CPI/IIP-at-NIC-2-digit boundary. The GSDD distinction is a granularity control, not a basis for applying Category-B language to Category A.

The Annex clause 6 statement that MoSPI bears no responsibility for use or interpretation is likewise not imported as a Category-A UI disclaimer.

### 4.2 Tier 1 — MoSPI metadata and official dissemination instruments

| Instrument | Date / authority | Concise finding |
|---|---|---|
| **Data Dissemination: National Metadata Structure (NMDS), 2nd Edition**, `ASPD/Oct/2024/2` | October 2024; MoSPI Administrative Statistics and Policy Division | Establishes metadata/dissemination concepts. Mandatory metadata includes data description, classification, reference period, data access, methodology documentation, and source-data type. It supports user-facing dataset context but does **not** prescribe a legal attribution string, licence statement, non-endorsement wording, or a UI placement rule. Official location: <https://www.mospi.gov.in/sites/default/files/NMDS%202.0_05122024.pdf> |
| **National Metadata Structure for Consumer Price Index (CPI)** | Official MoSPI/NSO metadata; metadata last posted and updated 13 February 2026 | Identifies NSO/MoSPI as contact, compiling and custodian organisation; states that CPI is available on the e-Sankhyiki portal and describes dissemination, reference period, base years and data access. It does **not** prescribe Category-A attribution or a licence notice. Official location: <https://www.mospi.gov.in/uploads/governance/governance1773827165694_a1652a6d-80e4-4e64-bc57-cfd41dcd00cb_National_Metadata_Structure_for_CPI_(2).pdf> |
| **MoSPI GDP/NAS press note** | 31 August 2026; National Accounts Division, NSO, MoSPI | Identifies detailed GDP data as available at the official e-Sankhyiki NAS page. This confirms official dataset/source presentation, not a legal attribution term. Official location: <https://www.mospi.gov.in/uploads/latestReleases/latest_release_1788172583113_d65a77cf-240e-4491-82ee-59f78618fa41_Press_Note_on_GDP_Estimates_for_Q1_2026-27.pdf> |
| **MoSPI IIP releases investigated** | Official NSO/MoSPI releases | Identify detailed IIP data at the official e-Sankhyiki IIP page, including sectoral and NIC-2-digit tables. The releases do not prescribe an IIPS UI attribution format or API licence term. The official landing page referenced is <https://esankhyiki.mospi.gov.in/macroindicators?product=iip>. |

These instruments support a transparent source/data identity, but none located in this investigation establishes a Category-A legal attribution obligation for the governed API data.

### 4.3 Tier 1 — official API documentation

| Instrument | Finding |
|---|---|
| **MOSPI API PLATFORM — CPI API USER MANUAL** | Official documentation at <https://api.mospi.gov.in/API/CPI%20API%20User%20Manual.pdf>. It identifies `https://api.mospi.gov.in` as the base URL and documents signup, access tokens, endpoints, formats and the unauthenticated first-10-record response. |
| API terms review | The manual is technical usage documentation. In the official API/MoSPI sources investigated, no authoritative API-specific terms-of-use or licence document was located prescribing attribution, source citation, redistribution, caching, retention, non-endorsement, or disclaimer wording for NAS/CPI/IIP API responses. |
| Exact absence statement | **No API-specific authoritative terms document was located in the official sources investigated.** This is not a finding that no API terms exist. |
| API mechanics | No source-link or UI requirement is inferred from the API endpoint, Swagger/manual, response shape, or the presence of an API `source` field. |

### 4.4 Tier 1/2 — GODL-India investigation

| Instrument | Finding |
|---|---|
| Government Open Data License — India | Official OGD location: <https://www.data.gov.in/Godl>. The official OGD materials describe GODL attribution and non-endorsement terms for data licensed under GODL, including provider/source/licence attribution and a URL/URI/DOI in the attribution statement. |
| Official OGD terms | <https://www.data.gov.in/terms-of-use> states that portal catalog/information is subject to the licence metadata of individual dataset records and identifies OGD-platform content as licensed under GODL, subject to the stated limitations. |
| Applicability to `api.mospi.gov.in` | **NOT ESTABLISHED.** No MoSPI/e-Sankhyiki instrument located in this investigation incorporates GODL by reference for the governed API or identifies NAS/CPI/IIP API responses as GODL-licensed. No OGD dataset record linking the governed API was established. |
| Applicability conclusion | GODL attribution, licence and non-endorsement terms are **not imported** into D89 as binding requirements. This act does not conclude that GODL does not apply generally, or that it cannot apply to a separately identified OGD dataset. |

The existence of a general Government of India open-data licence, or the fact that the underlying data is government data, is not sufficient to establish its application to this API.

### 4.5 Tier 3 discovery/corroboration

Searches of official MoSPI/e-Sankhyiki/API and OGD sources were used to locate the instruments above. Secondary results were used only for discovery and were not used to establish a legal or governance conclusion where an official source was required.

---

## 5. CATEGORY AND GRANULARITY RECHECK

| D08 data | GSDD treatment | D89 consequence |
|---|---|---|
| NAS / National Accounts | Category A: data relating to National Accounts | Common product source disclosure applies; Category-A legal attribution remains not determined |
| CPI published index | Category A: CPI | Common product source disclosure applies; price-collection/shop-level microdata is a separate non-shareable boundary |
| IIP at NIC-2-digit level | Category A: IIP at NIC 2 digit level | Common product source disclosure applies |
| IIP item-level | Category B: item-level IIP, registration/requisition instrument applies | Outside D08; Category-B Annex citation must not be imported into D08 |

The disclosure contract is the same for NAS, CPI and IIP because the provider designation and source identity are common and GSDD places the three governed Category-A classes in one open-access list. The dataset name and granularity must remain clear in the surrounding UI; a single generic source label must not conceal that item-level or other excluded data is outside the D08 decision.

---

## 6. D89 UI DISCLOSURE CONTRACT

### 6.1 Required product-transparency disclosure

For every later-rendered D08 Macro dataset surface, the UI **SHALL** present the following neutral source statement:

> **`Data source: MoSPI / e-Sankhyiki`**

This is a product-transparency requirement established by D89. It is not a licence attribution statement and is not evidence that formal legal attribution is required.

The contract applies to:

1. NAS views;
2. CPI views;
3. IIP views at the governed NIC-2-digit granularity;
4. dataset summary and detail views; and
5. any responsive rendering of those views.

The source line SHALL be visually and semantically distinguishable from IIPS-generated interpretation, analysis, derived commentary, or product recommendations. It SHALL NOT say or imply that MoSPI endorses, approves, certifies, sponsors, or recommends IIPS.

### 6.2 Dataset naming

The dataset identity SHALL remain visible in the dataset heading, card, or equivalent context:

| Dataset | Required product context |
|---|---|
| NAS | `National Accounts Statistics (NAS)` |
| CPI | `Consumer Price Index (CPI)` |
| IIP | `Index of Industrial Production (IIP)` and the governed granularity where relevant, including NIC-2-digit context |

This dataset naming is a product transparency control. It is not a claim that GSDD prescribes a particular UI label.

Where multiple D08 datasets appear together, the UI may use one common source-disclosure area only if each dataset remains unambiguously identified. A source line that could be read as applying to an ungoverned dataset is not compliant with this contract.

### 6.3 Placement and responsive behavior

The source statement SHALL be placed in the visible dataset context, adjacent to the dataset heading or dataset metadata, rather than being available only through a hover state, hidden interaction, or inaccessible developer-only field. It SHALL remain available in detail views and narrow/responsive layouts.

The exact component, CSS, DOM structure and implementation pattern are intentionally left to a later implementation-authority gate. This act authorizes no implementation.

### 6.4 Common versus dataset-specific disclosure

No dataset-specific provider wording is required. The common statement `Data source: MoSPI / e-Sankhyiki` is sufficient for NAS, CPI and governed IIP because:

* MoSPI is the designated D08 provider;
* e-Sankhyiki is the designated source/API identity; and
* no authoritative Category-A instrument investigated prescribes a different dataset-by-dataset attribution format.

The statement must not be extended to WPI, PPI, RBI data, item-level IIP, or any other non-D08 data without a separate governance decision.

### 6.5 Fields not required by this D89 contract

| Field | D89 status | Basis / boundary |
|---|---|---|
| Provider name | **Required as product disclosure** — MoSPI | Provider designation plus transparency decision; not a legal attribution finding |
| Dataset name | **Required as product context** | Ensures the common source line is not ambiguous; product control |
| Source/API identity | **Required at service level** as `e-Sankhyiki`; raw endpoint need not be shown | Source designation; API mechanics are not a UI requirement |
| Source URL | **Not established and not required by D89** | No Category-A source-link duty or API term located; this act selects no destination and does not invent one |
| Data period/base year | **Not a D89 attribution requirement** | NMDS supports this metadata where available; a later product may show it, but D89 does not mandate it |
| Last evaluated timestamp | **Not a D89 requirement** | M-3 remains unestablished; no timestamp contract is created here |
| Formal attribution statement | **Not established for Category A** | GSDD Category-A provisions are silent; Annex clause 5 is Category B/C only; GODL applicability is unresolved |
| Licence statement | **Must not be asserted by this act** | GODL applicability and any API licence are not established |
| Disclaimer | **No D89 legal disclaimer established** | GSDD Annex clause 6 is not imported into Category A; no API disclaimer located |
| Non-endorsement statement | **Not established as a binding legal requirement** | GODL is not established as applicable |
| Data-quality disclaimer | **Not established by D89** | NMDS quality metadata does not prescribe an IIPS UI disclaimer |

A later product decision may choose additional transparency fields, but must label them as product choices and must not present them as legal licence conditions without authoritative support.

---

## 7. ATTRIBUTION STATUS — SEPARATED FROM DISCLOSURE

### Established

* A neutral **product source-disclosure requirement** for `Data source: MoSPI / e-Sankhyiki`.
* Dataset identity and governed granularity must remain clear in the surrounding UI.
* The source label must be separated from IIPS interpretation and must not imply MoSPI endorsement.

### Not established

* A formal Category-A legal attribution obligation.
* A formal Category-A source-citation obligation.
* Any exact legal attribution wording.
* A required DOI, URL, URI or source-link format for D08 API data.
* A binding non-endorsement obligation for D08 API data.
* A binding licence statement, commercial-use permission, redistribution permission, caching permission or retention permission.
* A requirement to display the internal API endpoint.

### Unresolved

* Whether a separate MoSPI/e-Sankhyiki/API instrument exists or will be issued that governs Category-A attribution or licensing.
* Whether a third-source data-sharing protocol under GSDD §4.B(v) affects any particular governed series or release.
* Whether GODL applies to any specific API response, dataset version or separately identified OGD publication.

> **Product disclosure requirement ≠ proof of a legal attribution obligation.**

---

## 8. GODL DETERMINATION

| Question | D89 determination |
|---|---|
| Does GODL expressly apply to `api.mospi.gov.in`? | **NOT ESTABLISHED** |
| Does a located MoSPI/e-Sankhyiki instrument incorporate GODL? | **NOT LOCATED / NOT ESTABLISHED** |
| Is GODL binding merely because the data is government data? | **NO — that inference is prohibited** |
| Are GODL attribution terms imported into D89? | **NO** |
| Is GODL non-endorsement imported into D89? | **NO** |
| Are GODL commercial or redistribution permissions imported? | **NO** |
| Does this act decide that GODL never applies? | **NO** |

Until applicability is established by an authoritative instrument, D89 must preserve `GODL applicability = NOT ESTABLISHED`.

---

## 9. READ-ONLY UI IMPLEMENTATION INVESTIGATION

The following files were inspected read-only; none was modified by this act:

| File | Finding |
|---|---|
| `frontend/src/app/App.tsx` | `/research` renders `FeaturePlaceholder`; no Macro UI route or MacroProvider mount is present |
| `frontend/src/features/research/MacroContext.tsx` | Defines the Macro provider/context and fetch effects for NAS/CPI/IIP, but has no JSX source-disclosure rendering. Its comments carry the earlier pre-designation status and identify candidate provenance only. |
| `frontend/src/features/research/MacroContext.test.tsx` | Test-only provider probes; no production UI disclosure component |
| `frontend/src/api/macro.ts` | Typed client returns a technical `source` field from transport; it does not render or establish attribution |
| `frontend/server/macro/macro-transport.ts` | Guarded read route; returns technical dataset/source data and enforces the D08 dataset allowlist; not a UI surface |
| `frontend/server/macro/mospi-source.ts` | MoSPI source adapter and candidate implementation provenance; not a UI surface |
| `frontend/src/features/executive/ExecutiveDashboard.tsx` | Existing non-Macro pattern renders `provenance.dataSource` beside freshness/authority badges |
| `frontend/src/features/portfolio/PortfolioWorkspace.tsx` | Existing non-Macro pattern renders `provenance.dataSource` in a header |
| `frontend/src/features/replay/ReplayExplorer.tsx` | Existing non-Macro pattern renders `provenance.dataSource` in a header |
| `frontend/src/components/ui/Badges.tsx` | Reusable freshness/authority badges exist; no Macro source-disclosure component exists |
| `frontend/src/components/evidence/EvidenceComponents.tsx` and `EvidenceExplorerComponents.tsx` | Generic provenance panels exist, but no Macro source/attribution contract is implemented |

### UI findings

1. No current Macro data-rendering component is mounted in the application.
2. No current Macro UI identifies the source to a user.
3. No current Macro per-dataset disclosure or detail-view disclosure exists.
4. Responsive survival cannot be demonstrated for a Macro disclosure because no Macro UI surface exists.
5. The current Macro transport/client carries a technical `source` value, but transport metadata is not user-visible attribution.
6. No dedicated reusable Macro source-disclosure pattern exists. Generic `provenance.dataSource` patterns in other surfaces are evidence of a possible later implementation pattern only; they are not reused or changed here.
7. No current Macro attribution, licence, non-endorsement or disclaimer component exists.

This investigation is read-only. It does not convert an implementation file into an implementation authority and does not authorize changes outside this act.

---

## 10. IMPLEMENTATION / PRODUCTION / IPD FENCES

| Boundary | Standing after D89 |
|---|---|
| UI implementation | **NOT PERFORMED**; this act is governance-only |
| Macro source, transport, API routes and tests | **UNTOUCHED BY THIS ACT** |
| Existing implementation authority | Not expanded. The prior implementation act's authorized change set does not silently include D89 disclosure work. |
| M-3 | **NOT ESTABLISHED**; D89 does not establish provenance authority or any M-3 field contract |
| Live E2E (Arena) | **C — BLOCKED**; unchanged |
| Production | **NOT AUTHORIZED**; unchanged |
| IPD | **UNTOUCHED / OUT OF SCOPE**; no IPD repository or file is modified |
| Historical acts | Provider and entitlement acts are not rewritten |
| External contact/action | **NONE**; no contact with MoSPI, registration, subscription, credential, licence acceptance or external terms acceptance occurred |

The D89 source-disclosure contract is durable governance only. It is not implementation authority, production authorization, live-E2E evidence, entitlement, or M-3.

---

## 11. DECISION CLASSIFICATION

> # **B — D89 PARTIALLY ESTABLISHED**

### Basis for B

1. The provider and source identity are already durably established for D08.
2. GSDD 2019 clearly places NAS, CPI and IIP at NIC-2-digit level in Category A and separately limits the Annex citation language to Category B/C access.
3. Official MoSPI metadata and dissemination instruments support identifiable dataset/source context but do not prescribe a Category-A legal attribution format.
4. An exact, neutral product source disclosure can therefore be established without resolving formal legal attribution.
5. API-specific legal terms and GODL applicability remain unresolved.

`A — D89 requirements established` is not selected because formal Category-A attribution, source-link, licence and non-endorsement details remain unresolved. `C` is not selected because a defensible product-transparency contract is supported. `D` is not selected because external clarification is not necessary to require the neutral source disclosure control; clarification remains a separate optional future action for unresolved legal/licensing questions.

---

## 12. UNIVERSAL ARTIFACT DURABILITY INVARIANT

> **Arena-local existence is not durability.**

This D89 act is durable only when the additive governance artifact is committed and published to the authorized session branch, and its remote commit, parent, tree, artifact blob, byte content and SHA-256 are independently verified. Durability also requires:

1. the exact baseline above was verified before mutation;
2. the provider-designation and entitlement act blobs remain byte-identical;
3. the final diff contains exactly one added governance artifact and no modified or deleted implementation, test, transport, API, IPD or historical-act file;
4. the publication is fast-forward only, never force-pushed;
5. the final remote artifact is re-read and its blob and SHA-256 independently recomputed; and
6. no production, live-E2E, entitlement, licensing, attribution-waiver or M-3 conclusion is inferred from publication.

The final commit/tree/parent/blob/SHA-256 and remote verification are reported in the execution report accompanying this act; this act does not make itself self-referential by asserting a commit hash inside its own content.

---

## 13. NEXT GATE

The next gate is a **separate D89 implementation-authority gate** for the source-disclosure contract, if implementation is later requested and explicitly authorized. That gate must preserve the exact product/legal separation recorded here.

A separate external-clarification gate may be requested for Category-A legal attribution, API terms or GODL applicability, but no MoSPI contact is authorized or required by this act.

**M-3 remains independent and is not the automatic next gate.** No implementation, production authorization or live-E2E claim follows from this D89 decision.

---

## 14. FINAL GOVERNANCE RECONCILIATION

```text
D08 Boundary       = NAS / CPI / IIP
Provider            = MoSPI — DESIGNATED
Entitlement         = B — PARTIALLY ESTABLISHED
D89                 = B — PARTIALLY ESTABLISHED
M-3                 = NOT ESTABLISHED
Production          = NOT AUTHORIZED
Live E2E            = C — BLOCKED
Implementation      = AUTHORIZED / DURABLE (prior D08 implementation act; D89 disclosure implementation NOT performed)
IPD                 = UNTOUCHED
```

*End of D89 Macro UI Disclosure / Attribution Decision Act. Governance only; implementation not performed.*
