# NP-08 / D08 MACRO — D89 MACRO UI DISCLOSURE / ATTRIBUTION DECISION ACT

**Act identifier:** `NP-08-D08-D89-MACRO-UI-DISCLOSURE-DECISION-ACT-01`  
**Decision date:** 2026-10-05  
**Gate:** D89 — Macro UI Disclosure / Attribution Governance Gate  
**Classification:** **B — D89 REQUIREMENTS PARTIALLY ESTABLISHED**  
**Track:** NP-08 / D08 MACRO — governance only

> **Decision in one sentence:** The IIPS Macro UI **SHALL disclose MoSPI / e-Sankhyiki as the provider/platform and name the governed dataset and granularity as a product-transparency control; formal Category-A legal attribution, its format, GODL applicability, and other API-use terms remain NOT DETERMINED.**

---

## 1. PURPOSE, SCOPE AND DECISION

This act answers only:

> **What source/disclosure information should the IIPS Macro UI present, based on the authoritative governance evidence currently established?**

It establishes a binding **product-transparency** disclosure contract for the D08 Macro UI. It does **not** decide what licence rights IIPS has. In particular:

- Product disclosure is **not** proof of a legal attribution obligation.
- Product disclosure is **not** a waiver of attribution, permission, licence or other terms.
- Provider designation and Category-A access do **not** grant a licence or resolve commercial use, redistribution, caching, retention, citation or other unresolved terms.
- This act does **not** establish M-3, authorize UI implementation, authorize production, or establish live-E2E success.

The D89 result is **B** because an evidence-based product source-disclosure contract can be fixed without deciding the still-unresolved legal attribution/licensing questions. External clarification is therefore **not required to decide the product-transparency contract**. The terms questions remain open; this act does not authorize contacting MoSPI.

---

## 2. AUTHORITATIVE BASELINE

| Item | Value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Authoritative ref | `origin/main` |
| Baseline commit | `2f8f62be76cff97b17c50b6ca107eaee670c2523` |
| Baseline tree | `23d3387c7cd231de25ad8a69e494690cf6ce620f` |
| Parent of baseline | `630820f8cb22fd279f7d93603e5674fff703b11e` |
| Provider-designation act | `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT.md`, blob `300568446c06bb9ff94c0292cf787349571dda6e` |
| Entitlement/licensing act | `NP-08-D08-MACRO-ENTITLEMENT-LICENSING-DECISION-ACT.md`, blob `06b9717470b1923709dcd16b117dbb8a7fa8a1bc` |
| IPD refs at baseline | `0` |

The baseline was re-read immediately before this artifact was written: local `origin/main` equalled GitHub API `main` at `2f8f62be…`; the tree and both prior-act blobs matched the values above; staged paths and deletions were `0 / 0`. The act is grounded in the remote `origin/main` tree, not in Arena working-tree presence.

---

## 3. DECISION AUTHORITY AND AUTHORIZATION BOUNDARY

| Item | Decision |
|---|---|
| Decision authority | **Ramki — IIPS application owner and Program Authority** |
| Recording authority | Ramki authorized recording this D89 decision on 2026-10-05. |
| Bindingness | **BINDING — adopt the product-transparency contract as SHALL / MUST NOT.** |
| Category wording | **Factual GSDD classification only.** No licence name or rights claim may be displayed. |
| Agent role | Investigation, verification and record execution only; no independent legal or Program Authority decision. |
| UI implementation authority | **NOT GRANTED BY THIS GATE.** A later implementation gate must have separate explicit authority. |
| External-contact authority | **NOT GRANTED.** No contact with MoSPI is authorized. |

Authorization is limited to establishing and recording the product-transparency contract below. It does not authorize implementation changes, changes to Macro source/transport/API/tests, external contact or acceptance of terms.

---

## 4. GOVERNED D08 IDENTITY AND BOUNDARY

| Item | Established state |
|---|---|
| Provider | **MoSPI** — Ministry of Statistics and Programme Implementation, Government of India — **DESIGNATED** |
| Source/API identity | **e-Sankhyiki REST**, hosted at `https://api.mospi.gov.in` |
| D08 boundary | **NAS / CPI / IIP**, unchanged |
| Dataset-specific scope | NAS; CPI published index through the governed index path; IIP at **NIC 2-digit level only**, within the existing D08 implementation boundary |
| Excluded | WPI · PPI · RBI-sourced data · item-level IIP · CPI shop-price microdata · any dataset outside D08 |
| Entitlement | **B — PARTIALLY ESTABLISHED**, unchanged by D89 |

The API identity above is governance context. The UI is not required to expose a REST host, route, API parameter, authentication detail or other internal API mechanic.

---

## 5. GSDD 2019 RECHECK — TIER 1

### 5.1 Instrument identity

**Guidelines for Statistical Data Dissemination (GSDD)**, issued by the Government of India, Ministry of Statistics and Programme Implementation, Central Statistics Office, Coordination and Publication Division, as **Office Memorandum No. Y-18020/9/2017-CAP dated 15.02.2019**. The official MoSPI PDF is at:

`https://mospi.gov.in/sites/default/files/data_disemination/Data_Dissemination_Guidelines%20_feb19.pdf`

The OM states that the guidelines were issued with approval of the Competent Authority. GSDD 2019 remains the operative instrument identified by the entitlement gate; that gate also records it as operative-but-reviewable under §5. No superseding authoritative GSDD was located in the official sources investigated for D89.

### 5.2 Category A findings

GSDD §4.A.1 defines Category A as open-access aggregated/analyzed information and publications that are **“shared free of cost with users”** and lists:

1. Data relating to National Accounts;
2. Consumer Price Index (CPI); and
3. Index of Industrial Production (IIP) **at NIC 2-digit level**.

Within §4.A.1 itself, no end-user attribution statement, source citation, provider-naming rule, publication acknowledgement, redistribution notice, disclaimer or prescribed attribution placement/format is stated. This is a finding about §4.A.1, **not** a conclusion that no other term can apply.

GSDD §4.B(ii) separately describes shop-collected CPI price data as non-shareable. The D08 CPI path is the published index path, not that shop-price microdata. GSDD §4.A.2 separately lists **item-level IIP** as Category B access by registration; it is outside D08. Category-A IIP is **not** all IIP: the instrument expressly limits the Category-A entry to NIC 2-digit level.

### 5.3 Dissemination clauses and the Annex

GSDD §5 is framed as directions for MoSPI's dissemination of shareable data (including access through the MoSPI website, clear presentation, metadata and release/revision practices). It does not prescribe a Category-A re-user attribution statement or its placement in a third-party UI.

GSDD §5(7) identifies the Annex as the requisition instrument for **Category B** restricted-access data; it directs Category C UFS-map requests to the relevant NSSO Regional Office. The Annex is titled **“Application for Restricted Access Data”** and contains a Data Access Agreement. Its clause 5 source-citation text applies to publications employing data obtained **under that request**. It must **not** be imported into Category-A NAS / CPI / IIP-NIC-2 as an attribution requirement.

The Annex disclaimer in clause 6 likewise is not treated as a Category-A API-data disclaimer. This D89 act does not rewrite or broaden the entitlement act's Annex-scope finding.

---

## 6. OFFICIAL API DOCUMENTATION — TIER 1

The official manuals below were inspected as API documentation, not treated as licences merely because they document access or request execution.

| Manual | Official location and identified authority | Finding relevant to D89 |
|---|---|---|
| **CPI API User Manual**, MOSPI API Platform, Computer Centre, MoSPI | `https://api.mospi.gov.in/API/CPI%20API%20User%20Manual.pdf`; no issue date/revision was visible in the inspected front matter. | Covers API use, registration/login and CPI index/item endpoints. No API data-use licence, attribution format, redistribution, caching or data citation section was located. The separate item endpoint is not the D08 CPI index path. |
| **API User Manual for National Accounts Statistics (NAS)** | `https://esankhyiki.mospi.gov.in/API/NAS%20API%20User%20Manual.pdf`; document history identifies DIID Rev 1 (22.10.2025) and **Approved Rev 2 (07.11.2025)**. | Covers signup, login and API execution. Its front-matter “Disclaimer” describes the manual and its process instructions; it does not state a data-user attribution or reuse condition. No API data-use terms section was located. |
| **API User Manual for Index of Industrial Production (IIP)** | `https://esankhyiki.mospi.gov.in/API/IIP%20API%20User%20Manual.pdf`; document history identifies DIID Rev 1 (22.10.2025) and **Approved Rev 2 (07.11.2025)**. | Covers signup, login and API execution. Its “Disclaimer” concerns the manual and reporting issues with it, not a data-user attribution or licence condition. No API data-use terms section was located. |

### Required API-terms finding

> **No API-specific authoritative terms document was located in the official sources investigated.**

This is not a claim that no API terms exist. The manuals establish that API documentation exists; the inspected manual contents do not supply a Category-A attribution format or resolve the legal terms for re-use of API data.

---

## 7. OTHER OFFICIAL MoSPI / GOVERNMENT MATERIAL INVESTIGATED

### 7.1 MoSPI Copyright Policy — scope unresolved for API outputs

An official MoSPI-path Copyright Policy is published at:

`https://www.niip.gov.in/web/mospi/copyright-policy`

The page text states, in substance, that material featured on **“this website”** may be reproduced after proper permission; it must be reproduced accurately and not in a derogatory or misleading context; and where material is published or issued to others, **“the source must be prominently acknowledged.”** The located page does not show a policy date or revision. A legacy MoSPI-domain result also points to `http://www.mospi.nic.in/copyrights-policy`.

This website-material policy is relevant and prevents an overbroad assertion that no other MoSPI source contains acknowledgement language. The official material located does **not** establish whether Category-A JSON/observations served through `api.mospi.gov.in` or e-Sankhyiki are “material featured on this website” for this policy, whether the policy's permission condition covers this API use, or how it interacts with GSDD Category A. Its applicability to D08 API outputs is therefore **NOT DETERMINED**. It is not treated as either a confirmed Category-A API attribution term or a waiver of one.

### 7.2 e-Sankhyiki portal “Terms of Use” link — text not resolved

The official e-Sankhyiki portal page/footer exposes a link labelled **“Terms of Use”** (the portal is at `https://esankhyiki.mospi.gov.in/`; an indexed official product page showing the footer is `https://esankhyiki.mospi.gov.in/macroindicators?product=cpi`). The terms text and its target could not be retrieved and read in the official-source investigation. Its contents and applicability to API-served data are **NOT DETERMINED**. The existence of a portal link is not evidence of a particular legal term, and this act does not say that no portal terms exist.

### 7.3 Publication-specific acknowledgement notices

MoSPI / DIID's **Compendium of Datasets and Registries in India — 2025** front matter says reproduction is permitted provided the source is acknowledged and gives a citation for **that publication**. Official location:

`https://www.mospi.gov.in/uploads/announcements/announcements_1769778908344_7ee8297b-535c-4256-b8c6-06c5b95f7685_Compendium_of_Datasets_and_Registries_in_India,_2025.pdf`

This is a publication-specific reproduction/citation notice. No official text located extends that notice to D08 API outputs as a whole. It is not used to manufacture a universal API attribution rule.

### 7.4 e-Sankhyiki launch material

The Government of India, Ministry of Statistics and Programme Implementation release **PRID 2029708 dated 30.06.2024** describes e-Sankhyiki as a MoSPI-developed portal, lists NAS, CPI and IIP among its data products, and describes API access and re-use as portal functionality: `https://www.pib.gov.in/PressReleasePage.aspx?PRID=2029708`. A later MoSPI/PIB release **PRID 2076859 dated 25.11.2024** also describes an e-Sankhyiki API: `https://www.pib.gov.in/PressReleasePage.aspx?PRID=2076859`. The texts located do not set a licence, attribution format or API use term. A description of access/re-use functionality is not itself a licence grant.

---

## 8. GODL-INDIA — APPLICABILITY NOT ESTABLISHED

The **Government Open Data License — India** was notified by the Ministry of Electronics and Information Technology on **10.02.2017** and published in the *Gazette of India: Extraordinary*, Part I, Section 1, on **13.02.2017** (No. 42). The official Gazette copy is at:

`https://www.data.gov.in/sites/default/files/Gazette_Notification_OGDL.pdf`

The Gazette's preamble describes the open licence in connection with datasets **“published under NDSAP and through the OGD Platform.”** Its defined attribution statement is for data published under that licence; its conditions include attribution and non-endorsement. The material inspected does not establish that the governed `api.mospi.gov.in` / e-Sankhyiki API data are published through the OGD Platform, nor that MoSPI/e-Sankhyiki incorporates GODL for these API outputs.

> **GODL applicability to the governed API/data = NOT ESTABLISHED.**

This is neither a finding that GODL applies nor a finding that it does not apply. No underlying-government-data inference is made. Consequently, GODL-derived attribution, source-link, licence-label and non-endorsement obligations are **not imported as binding D08 legal requirements** by this act.

---

## 9. LEGAL / PRODUCT DETERMINATION MATRIX

| Question | D89 determination | Basis / limit |
|---|---|---|
| Does GSDD §4.A.1 itself prescribe Category-A end-user attribution? | **No such requirement is stated in §4.A.1.** | Does not establish that no other term applies. |
| Does Annex clause 5 automatically govern Category-A data? | **No. Do not apply it to Category A.** | §5(7) names the Annex for Category B restricted-access requests; the Annex is for restricted access. |
| Overall formal legal attribution for Category-A D08 data | **NOT DETERMINED** | The MoSPI Copyright Policy's website-material scope, e-Sankhyiki portal Terms of Use, third-source protocols and API-use terms have not been resolved for these API outputs. Not waived. |
| Legally prescribed attribution wording or placement | **NOT DETERMINED** | No Category-A API wording/placement was located. |
| Source URL/link legally required | **NOT ESTABLISHED** | No applicable Category-A API source-link requirement was located. |
| GODL applies to the governed API/data | **NOT ESTABLISHED** | No API/e-Sankhyiki incorporation or OGD-platform application was established. |
| Formal non-endorsement statement legally required | **NOT ESTABLISHED** | GODL applicability is not established; no other applicable D08 instrument prescribing such a statement was located. |
| Product-level source disclosure | **ESTABLISHED — SHALL** | Independent product-transparency decision expressly authorized by Ramki; not a legal attribution conclusion. |
| Product-level dataset/granularity disclosure | **ESTABLISHED — SHALL** | Product-transparency and scope-integrity control; it does not enlarge entitlement. |

---

## 10. BINDING D89 PRODUCT-TRANSPARENCY CONTRACT

The following requirements are binding for a future authorized D08 Macro UI implementation. They are **product controls**, not legal licence terms.

### DT-1 — Provider/platform label (SHALL)

Every user-facing Macro data view that presents governed observations **SHALL** display this neutral source label, legibly associated with the data:

> **Provider: Ministry of Statistics and Programme Implementation (MoSPI) · Data platform: e-Sankhyiki.**

The same provider/platform wording is sufficient for NAS, CPI and IIP because all three are governed to the same provider and platform. It identifies the designated provider and the dissemination platform; it does not assert that MoSPI is the sole origin of every underlying input or that MoSPI approved, endorses or is affiliated with IIPS.

This is a product-transparency string, **not** a prescribed legal attribution statement and **not** a determination that the wording satisfies any later-established legal citation requirement.

### DT-2 — Dataset name (SHALL)

Each data view **SHALL** identify the dataset actually displayed:

| D08 data view | Required user-facing dataset label |
|---|---|
| NAS | **National Accounts Statistics (NAS)** |
| CPI | **Consumer Price Index (CPI)** — identify the governed published index view; the D08 path is the Group/Subgroup index path, not shop-price microdata. |
| IIP | **Index of Industrial Production (IIP)** — identify **NIC 2-digit level only**; the D08 implementation is the governed Sectoral / Manufacturing selection. |

Do not label the D08 IIP view as all IIP, item-level IIP, mining/electricity/general/use-based data, or another granularity. Do not label shop-collected CPI price microdata as the governed CPI index.

### DT-3 — Shared source, dataset-specific scope (SHALL)

A single common provider/platform line is sufficient; a different source name or attribution wording is **not** required for each dataset. The dataset name and its relevant granularity must still be shown separately as DT-2 requires.

### DT-4 — Placement and persistence (SHALL)

On any Macro overview, chart, table, card or other view that displays observations, the source and dataset labels **SHALL** be visible in the same content area, adjacent to the data title or panel. They **SHALL NOT** be available only in a global footer, tooltip, hover state, help page or expandable secondary panel. If a future detail view presents Macro data, the labels must remain visible there too.

### DT-5 — Responsive and accessible disclosure (SHALL)

The provider/platform and dataset labels **SHALL** remain visible and readable on narrow/responsive layouts and **SHALL** be exposed as ordinary accessible text. A responsive layout must not hide, truncate into ambiguity, or place the source solely behind hover or interaction.

No Macro UI currently exists, so this is a future acceptance criterion—not a claim that current responsive behavior was tested.

### DT-6 — Separate provider disclosure from IIPS-generated interpretation (SHALL)

The source label **SHALL** be visually/semantically distinct from any IIPS-generated explanation, derived value, trend, score or recommendation. Product-generated analysis must not be attributed to MoSPI or presented as a MoSPI finding. Where such analysis is later shown, its IIPS-generated nature must be clear.

### DT-7 — Neutrality / no implied endorsement (MUST NOT)

The UI **MUST NOT** state or imply that MoSPI has approved, certified, endorsed, sponsored, partnered with, or reviewed IIPS or its interpretation. Do not use MoSPI emblems, seals, logos, official letterhead or other branding in a way that implies affiliation. This is a product-integrity guard; it is **not** a finding that an applicable licence prescribes a non-endorsement disclaimer.

### DT-8 — Do not invent provenance metadata (MUST NOT)

The UI **MUST NOT** fabricate a data period, base year, freshness, “last evaluated” timestamp, licence status, source citation or other provenance value. Period/base-year may be shown as ordinary dataset context only when actually selected/returned and reliably available. No “last evaluated” timestamp is required by D89; the current Macro response contract does not provide an authoritative `evaluatedAt`/retrieval-time field. M-3 remains separate and unestablished.

### DT-9 — Optional factual GSDD classification (MAY, with strict wording)

If a product owner elects to display the GSDD classification, the UI **MAY** use only a clearly labelled factual classification such as:

> **GSDD 2019 classification: Category A — open access data, shared free of cost.**

This optional line must be identified as a **GSDD classification**, not as a licence, permission, attribution rule or commercial-use statement. Scope qualifiers are mandatory:

- **NAS:** only for the governed National Accounts data view;
- **CPI:** only the governed published index view; not shop-collected price microdata;
- **IIP:** **NIC 2-digit level only**.

If the UI cannot keep the scope qualifier clear, omit this optional classification line. This line does not state that commercial use, redistribution, storage, retention or attribution is permitted or waived.

### DT-10 — Source URL (not legally required; product link recommended)

No source URL is established as a legal Category-A requirement. As a product usability recommendation, the text **“e-Sankhyiki”** may link to the official portal landing page `https://esankhyiki.mospi.gov.in/`, identified by MoSPI/PIB as the e-Sankhyiki portal. A link is optional, not an attribution obligation. Do not expose or link the REST base URL or raw API endpoint in the user-facing source line unless a later, separately authorized product decision requires it.

### DT-11 — Attribution wording (NOT DETERMINED)

No formal Category-A attribution format was established. DT-1 is not a legal citation or an assertion that attribution is unnecessary. Do not label DT-1 “required by law,” “required by GODL,” or “MoSPI attribution” unless a later authoritative act establishes that conclusion.

### DT-12 — Licence, permissions and rights language (MUST NOT)

The UI **MUST NOT** name GODL-India or another licence, or state “licensed/open-licensed,” “public domain,” “no licence required,” “free for commercial use,” “redistribution permitted,” “retention permitted,” or equivalent rights language on the present evidence. The optional factual Category-A line in DT-9 is the only permitted licence-adjacent classification wording; it must not be styled or described as a licence.

### DT-13 — Legal non-endorsement status (NOT ESTABLISHED)

A legally required non-endorsement statement is **NOT ESTABLISHED**. No prescribed disclaimer text is adopted. DT-7's product rule not to imply endorsement stands independently and must not be represented as a GODL condition.

### DT-14 — Disclaimer and data-quality wording (not prescribed)

No D08-applicable API-data disclaimer or generic data-quality disclaimer was located. The “Disclaimer” headings in NAS/IIP API manuals concern those manuals, not an end-user licence/disclaimer for API observations. Do not copy the Category-B Annex disclaimer into Category A. D89 does not prescribe a generic disclaimer sentence or require a last-evaluated timestamp.

### DT-15 — No implementation authority (MUST NOT)

This governance act **MUST NOT** be treated as authority to change UI code, components, styles, MacroContext, API clients, transport, tests, screenshots or production. The requirements are a contract for a later, separately authorized implementation gate.

---

## 11. D89 UI-SURFACE INSPECTION — READ ONLY

All code inspection used the authoritative `origin/main` tree at the baseline above. No file was changed.

| File/component inspected | Finding |
|---|---|
| `frontend/src/features/research/MacroContext.tsx` | Implements request state/fetch effects and provides `{ nas, iip, cpi, reload }` through context. It renders `children`; it is not a Macro data-view component. |
| `frontend/src/api/macro.ts` | Defines response fields including `dataset`, technical `source`, `records`, pagination and candidate provenance. It fetches and returns data; it does not render a source disclosure. |
| `frontend/server/macro/mospi-source.ts` | Technical identifier is `MACRO_SOURCE_ID = 'MoSPI'`; this is not a user-facing attribution component. |
| `frontend/server/macro/macro-transport.ts` | Returns the technical source identifier with Macro responses; it contains no UI. |
| Production-source search for `useMacro`, `MacroProvider`, and `MacroContext` under `frontend/src` | **No production UI component consumes the Macro context.** Tests are not a user-facing Macro view. |
| `frontend/src/components/evidence/EvidenceComponents.tsx` — `ProvenancePanel` | Generic provenance table exists; not connected to Macro or to a legal-attribution contract. |
| `frontend/src/components/evidence/EvidenceExplorerComponents.tsx` — `ProvenanceChain` | Generic provenance chain exists and uses wrapping layout; not connected to Macro. This does not establish responsive behavior for a Macro view. |
| `frontend/src/features/admin/AdminData.tsx` | Admin-only “Live data sources” table includes Provider/Data version/As of/Quality/Completeness columns; it is not the Macro product surface. |

### UI inspection conclusions

1. No current Macro overview, chart, table, detail view or responsive Macro layout exists to inspect or test.
2. The API contract carries a technical source value but the current application has no Macro UI consumer to display it.
3. Generic provenance/admin patterns exist, but there is **no reusable Macro source-disclosure component/pattern already wired into the product**. A repository-wide UI search found no Macro attribution, citation or disclaimer component; the textual matches are unrelated features or generic provenance primitives.
4. Therefore source visibility, per-dataset placement, detail-view persistence and responsive behavior are not currently established by implementation. DT-1–DT-8 define those product requirements for a later authorized gate.
5. Older comments in `MacroContext.tsx` and `src/api/macro.ts` state that MoSPI is “NOT designated.” Those comments predate the separate provider-designation act and are stale against the current governance record. They were not changed in this governance-only gate and are not treated as authoritative UI disclosure or current provider status. Any code/comment rectification belongs in a separately authorized implementation gate.

---

## 12. DATASET DIFFERENCES AND DISCLOSURE MATRIX

| Dataset | Shared source line | Dataset label | GSDD category/granularity fact | Special UI boundary |
|---|---|---|---|---|
| **NAS** | Same DT-1 line | National Accounts Statistics (NAS) | Category A lists data relating to National Accounts. | Do not use the Category-A fact to assert a licence or a right beyond the entitlement act. |
| **CPI** | Same DT-1 line | Consumer Price Index (CPI), governed published Group/Subgroup index view | Category A lists CPI; GSDD separately identifies shop-collected CPI price data as non-shareable. | Do not imply that shop-price microdata is in the D08 UI. |
| **IIP** | Same DT-1 line | Index of Industrial Production (IIP), NIC 2-digit level only | Category A expressly limits IIP to NIC 2-digit level. | Do not imply all-IIP or item-level coverage. |

A common provider disclosure is sufficient. The dataset name and IIP/CPI granularity distinctions are not interchangeable and must remain explicit.

---

## 13. EXPLICIT NON-DETERMINATIONS AND NON-AUTHORIZATIONS

This act leaves the following matters unchanged and unresolved where indicated:

- **Formal Category-A attribution:** NOT DETERMINED — not waived and not declared unnecessary.
- **Attribution wording/placement as a legal term:** NOT DETERMINED.
- **MoSPI Copyright Policy applicability to API data:** NOT DETERMINED.
- **e-Sankhyiki Terms of Use content and applicability:** NOT DETERMINED.
- **API-specific authoritative terms:** none located; this is not a claim that none exist.
- **GODL-India applicability:** NOT ESTABLISHED — neither applicability nor non-applicability is concluded.
- **Commercial use:** NOT DETERMINED.
- **Redistribution:** NOT DETERMINED.
- **Caching:** NOT DETERMINED.
- **Retention or storage of raw/derived data:** NOT DETERMINED; no storage right is granted.
- **Third-source data-sharing protocols:** unresolved to the extent applicable under GSDD §4.B(v); this act does not identify or clear them.
- **Legally required non-endorsement or disclaimer:** NOT ESTABLISHED.
- **M-3 provenance authority:** NOT ESTABLISHED.
- **Production:** NOT AUTHORIZED.
- **Credentials, provider account or API subscription:** none authorized by D89.
- **Additional datasets:** NOT AUTHORIZED.
- **UI/application implementation:** NOT AUTHORIZED by D89.
- **IPD:** OUT OF SCOPE / UNTOUCHED.
- **Live-E2E success from Arena:** NOT ESTABLISHED; current status remains **C — BLOCKED**.

---

## 14. EXTERNAL ACTIONS

> **NONE.**

No MoSPI contact, clarification request, registration, account creation, API subscription, credential use, requisition, payment, terms acceptance or other external action was performed or authorized. The existence of unresolved questions does not authorize contacting the provider.

---

## 15. RELATIONSHIP TO PRIOR D08 ACTS — NO HISTORICAL REWRITE

1. `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT.md` is affirmed: MoSPI/e-Sankhyiki remains designated for NAS/CPI/IIP only.
2. `NP-08-D08-MACRO-ENTITLEMENT-LICENSING-DECISION-ACT.md` is affirmed in full: **B — ENTITLEMENT PARTIALLY ESTABLISHED**; Category-A legal attribution remains **NOT DETERMINED**; GODL applicability is **NOT ESTABLISHED**; M-3 is **NOT ESTABLISHED**.
3. D89 closes only the product-transparency question to the extent DT-1–DT-10 establish a display contract. It does not supersede or resolve any legal-rights non-determination in the entitlement act.
4. The former statement “D89 = OPEN” in the entitlement act remains a truthful historical statement as of that act. This separate act records the subsequent D89 decision; no prior act is rewritten.
5. This act does not alter the implementation-authority act, implementation, live-E2E state, production state or any IPD record.

---

## 16. INDEPENDENT GOVERNANCE STATES — FINAL RECONCILIATION

```text
D08 Boundary       = NAS / CPI / IIP — UNCHANGED
Provider            = MoSPI / e-Sankhyiki — DESIGNATED (these datasets only)
Entitlement         = B — PARTIALLY ESTABLISHED — UNCHANGED
D89                 = B — REQUIREMENTS PARTIALLY ESTABLISHED
Product disclosure  = BINDING SHALL / MUST NOT contract (DT-1…DT-15)
Legal attribution   = NOT DETERMINED — NOT waived
GODL                = applicability NOT ESTABLISHED
M-3                 = NOT ESTABLISHED
Production          = NOT AUTHORIZED
Live E2E            = C — BLOCKED in Arena
Implementation      = AUTHORIZED / DURABLE under prior implementation gate;
                      D89 UI implementation is NOT AUTHORIZED by this act
IPD                 = UNTOUCHED / OUT OF SCOPE
External contact    = NONE
```

The product-transparency decision is independent of legal attribution, entitlement, M-3, implementation authority, live E2E and production authorization. None of those states is changed by D89.

---

## 17. UNIVERSAL ARTIFACT DURABILITY INVARIANT

> **Arena-local or unmerged branch existence is NOT authoritative durability.**
>
> This act is durable only when the artifact is present on the authoritative `origin/main` ref of `ramkivs/iips-review-recovered` and remote commit, tree, artifact blob and SHA-256 have been independently verified. A commit/push to the session branch or a pull request alone does not satisfy this invariant.

Durability verification must be independent, not inferred from workspace presence or local Git state. Publication must not force-push. The artifact must be the only file added; prior D08 acts, implementation, tests and IPD must remain byte-identical/untouched.

---

## 18. VERIFICATION REQUIREMENTS

Before this act may be relied upon as durable:

- Re-read `origin/main` immediately before mutation and compare local ref with GitHub API remote SHA/tree.
- Confirm provider and entitlement acts match the baseline blobs recorded in §2.
- Confirm staged changes/deletions are zero and isolate the commit tree from pre-existing workspace files.
- Add only `docs/integration/NP-08-D08-D89-MACRO-UI-DISCLOSURE-DECISION-ACT.md`.
- Verify exact diff: one added governance artifact; zero modified/deleted files.
- Verify commit, tree and parent(s) independently on GitHub.
- Verify artifact blob and compute SHA-256 from the committed remote blob.
- Verify all prior D08 act blobs remain byte-identical.
- Verify Macro source, transport, API client, UI context, tests and other implementation files are unchanged by this gate.
- Verify IPD refs remain `0`, all IPD-named paths are unchanged, and no IPD file is added or deleted.
- Verify no historical act was rewritten, no secret was introduced, and no unintended governance record changed.
- If any unexpected mutation occurs: **STOP → RECTIFY → REVERIFY**.

---

## 19. CLASSIFICATION AND NEXT GATE

### D89 classification

> # **B — D89 REQUIREMENTS PARTIALLY ESTABLISHED**

The product-transparency source and dataset disclosure contract is established. Formal attribution, GODL, portal/API terms, and any legal citation/link/disclaimer requirements remain unresolved. This does not require external contact before a separate implementation-authority decision, because the source label is a product control and is not represented as a legal attribution.

### Next gate

> **Separate D89 UI-DISCLOSURE IMPLEMENTATION AUTHORITY GATE.**

That gate may propose implementation of DT-1–DT-8 and DT-13/DT-15 only after explicit authority; it must preserve the distinction between product source disclosure and legal attribution, and must not introduce licensing claims. Existing Gate 22 authority for the Macro route contract is not blanket authority for this UI change.

Separately, if a later decision requires formal legal attribution or a definitive rights statement, first conduct an independently authorized terms/applicability gate for the e-Sankhyiki Terms of Use, MoSPI Copyright Policy and GODL scope. **Do not contact MoSPI without a separate explicit authorization.** Do not advance automatically to M-3 or production.
