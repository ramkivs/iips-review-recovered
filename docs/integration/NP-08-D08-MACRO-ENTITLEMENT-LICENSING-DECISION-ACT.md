# NP-08 / D08 MACRO — ENTITLEMENT / LICENSING DECISION ACT

**Act identifier:** `NP-08-D08-MACRO-ENTITLEMENT-LICENSING-DECISION-ACT-01`
**Decision date:** 2026-10-05
**Track:** NP-08 / D08 MACRO — Track B (governance)
**Gate:** Entitlement / Licensing Governance Gate
**Classification:** **B — ENTITLEMENT PARTIALLY ESTABLISHED**

---

## 1. PURPOSE AND BOUNDARY

This act answers one question only:

> **WHAT USE RIGHTS, CONDITIONS AND RESTRICTIONS ARE ACTUALLY ESTABLISHED FOR THE GOVERNED D08 DATA?**

It is a separate and independent gate from provider designation. It does not answer *who* the governed source is (that was settled by `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT-01`), nor *whether a particular environment can reach it* (live E2E), nor *whether production is authorized*.

This act does **not** accredit, register, subscribe, contact the provider, or accept any external terms. No external licensing action was performed.

---

## 2. AUTHORITATIVE BASELINE

| Item | Value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Authoritative ref | `origin/main` |
| Baseline commit | `630820f8cb22fd279f7d93603e5674fff703b11e` |
| Baseline tree | `78609d87cf43ee0e47e15e5b449f8070bd5d0a61` |
| Parent commit | `b489efd97abebaad4fdec9060466bc58cf91a482` |
| Provider designation act | `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT.md` (blob `300568446c06bb9ff94c0292cf787349571dda6e`) |
| IPD refs in repository | `0` |

Baseline was re-verified immediately before mutation and was not relied upon from memory.

---

## 3. DECISION AUTHORITY

| Item | Value |
|---|---|
| Decision authority | **Ramki** — IIPS application owner and Program Authority |
| Authorization granted | Recording of this governance interpretation act (2026-10-05) |
| Scope of authorization | Recording the interpretation **only** |
| Authorization expressly NOT granted for | commercial use · redistribution · raw-data retention · provider account creation · subscription · credentials · production · item-level IIP · external licensing agreements · contacting the provider |

**Authorization to record a governance interpretation is not authorization to perform an external licensing action.** No such action was taken.

---

## 4. PROVIDER AND GOVERNED DATASETS

| Item | Value |
|---|---|
| Designated provider | **MoSPI** — Ministry of Statistics and Programme Implementation, Government of India |
| Provider/API identity | **e-Sankhyiki REST** — `https://api.mospi.gov.in` |
| Governed datasets | **NAS / CPI / IIP** (and nothing else) |
| D08 boundary | **UNCHANGED** — `NAS / CPI / IIP` |
| Prohibited datasets | WPI · PPI · any RBI-sourced series — **MUST NOT** be added |

---

## 5. AUTHORITATIVE ENTITLEMENT SOURCE(S)

### 5.1 Primary operative instrument — GSDD 2019 (Tier 1)

| Field | Value |
|---|---|
| Document title | **Guidelines for Statistical Data Dissemination (GSDD)** — "in accordance with NDSAP, 2012" |
| Document identifier | **OM No. Y-18020/9/2017-CAP** |
| Issuing authority | Government of India, **Ministry of Statistics and Programme Implementation**, Central Statistics Office (Coordination and Publication Division), Sardar Patel Bhavan, Sansad Marg, New Delhi-01 |
| Document date | **15.02.2019** |
| Signatory | (Cyriac George), Joint Director (CAP) — "This issues with the approval of the Competent Authority" |
| Official location | `https://mospi.gov.in/sites/default/files/data_disemination/Data_Dissemination_Guidelines%20_feb19.pdf` |
| Extent | 5 pages |
| Retrieval | Retrieved and read in full on 2026-10-05 |

**§3 Scope (verbatim):** "These guidelines apply to all data collated, compiled and produced by MoSPI either directly or received from various Ministries/Departments by MoSPI."

**§4.A.1 Category A — open access data (verbatim classification rule):** "Aggregated/analyzed information and publications which will be **shared free of cost with users**. This includes the following type of data:
(i) Data relating to National Accounts
(ii) Consumer Price Index (CPI)
(iii) Index of Industrial Production (IIP) - **at NIC 2 digit level**
(iv) Annual Survey of Industries (ASI) Volume I
(v) Reports of Central Statistics Office
(vi) Reports of National Sample Surveys (NSS)."

**§4.A.2 Category B — Restricted access data free of cost (verbatim):** "Primary unit level data collected by MoSPI through surveys / censuses, and item level data collected from secondary sources, after suppression or anonymisation of the identification details of individuals/ establishments. **Such data can be accessed by registration.** This includes the following type of data: … **(iv) Item level IIP data** …"

**§4.B Non-shareable data (verbatim, item (ii)):** "Data sets containing identification particulars of individual informants/establishments. Some examples in this category are identification particulars of informants/establishments in unit level data of Index of Industrial production (IIP), ASI and NSS sample surveys; and **data on prices collected from different shops of various rural and urban markets selected for preparation of Consumer Price Index (CPI)**."

**§4.B Non-shareable data (verbatim, item (v)) — MATERIAL CAVEAT:** "Sharing of data obtained from other sources or compiled by MoSPI based on such sources, will be regulated as per the **data sharing protocol laid down by such sources**."

**§5 Dissemination (conditions (1)–(12)), relevant extracts:**
- (1) "Access to all shareable data should be made available through the MoSPI's website."
- (4) "Data should be made available on an impartial and objective basis."
- (7) "Requisition for the shareable data under Category 'B' should be made to the Additional Director General, Data Storage and Dissemination Division, MOSPI … as per **Annex**."
- (9) "Multiple options for downloading the data file in popular formats (.csv, .xlsx, etc.) along with its metadata should be made available."

**§5 Review (verbatim):** "These guidelines may be reviewed periodically duly considering users feedback."

### 5.2 Annex — Data Access Agreement (scope is critical)

GSDD 2019's **Annex** ("Application for Restricted Access Data" + "Data Access Agreement") contains, verbatim:

- cl. 2: "The data will be only for the stated purpose(s). **Data will not be used for proprietary or law enforcement purposes.**"
- cl. 3: "No attempt will be made to identify any individual person, family, business, enterprise, etc."
- cl. 4: "The applicant will implement security measures to prevent unauthorized access to data acquired."
- cl. 5: "Any books, articles, papers, theses, reports, publications, etc. that employ data obtained under this request, **will cite the data source** in accordance with the established norms/ practices."
- cl. 6: "MoSPI bear no responsibility for use of the data or for any interpretation based on it."

> **⚠️ SCOPE DETERMINATION (decisive for this gate).** Per §5(7), the Annex and its Data Access Agreement are the requisition instrument for **Category 'B'** (and, via §5(7) second sentence, Category 'C') data. They are **not** conditions imposed on **Category A** open access data.
>
> Consequently: the citation obligation (cl. 5) and the proprietary-use restriction (cl. 2) are **Category B/C conditions** and **must NOT be read across** to the governed Category A datasets NAS / CPI / IIP-at-NIC-2-digit. Conversely, they **do** apply to item-level IIP — which is outside the D08 boundary and is not authorized by this act.

### 5.3 Overlay instrument considered — GODL-India (applicability NOT established)

| Field | Value |
|---|---|
| Document title | **Government Open Data Licence – India (GODL-India)** |
| Gazette notification | **13 February 2017** (Extraordinary Gazette) |
| Policy parent | National Data Sharing and Accessibility Policy (NDSAP), 2012 (17 March 2012) |
| Stated scope (GODL §3) | "all shareable non-sensitive data available either in digital or analog forms but **generated using public funds by various agencies of the Government of India**" |
| Terms (GODL §3) | worldwide, royalty-free, non-exclusive licence to **use, adapt, publish** (original, adapted and/or derivative), translate, display, add value, create derivative works (including products and services) "for all lawful **commercial and non-commercial** purposes" |
| Conditions (GODL §4) | (a) **Attribution** — acknowledge provider, source and licence by explicitly publishing an attribution statement including DOI/URL/URI; (b) attribution of multiple data; (c) **Non-endorsement** — must not suggest the provider endorses the user |
| Exemptions (GODL §7) | personal information; data the provider is not authorised to licence; non-shareable/sensitive data; crests/logos/official symbols; third-party IP; military insignia; identity documents; RTI s.8 data |
| Warranty | none; provider not liable for errors, omissions or loss |
| Governing law | Indian law; copyright vests with the licensor under the Indian Copyright Act, 1957 |

> **⚠️ APPLICABILITY = NOT ESTABLISHED.** GODL is a general Government-of-India open-data licence adopted under NDSAP 2012. **No MoSPI instrument located in this investigation states that GODL governs data served through `api.mospi.gov.in` / e-Sankhyiki.** A Government-of-India OGD overview document describes GODL as allowing users "to consume **datasets available on OGD platform**" (`data.gov.in`) for commercial and non-commercial purposes — a platform-scoped framing that does not, on this evidence, extend to the e-Sankhyiki REST API.
>
> Per §18 and §24 of this gate, GODL's commercial-use and redistribution permissions are therefore **NOT imported** into the D08 entitlement record. GODL is recorded as a **candidate overlay whose applicability is unresolved**, not as operative licence.

### 5.4 Non-operative instrument — Draft Revised GSDD 02.01.2025

| Field | Value |
|---|---|
| Document title | **Draft** of Revised Guidelines for Statistical Data Dissemination (GSDD) |
| Date | 02.01.2025 |
| Official location | `https://www.mospi.gov.in/sites/default/files/Draft-Revised_GSDD_02012025.pdf` |
| Status | **DRAFT — not notified, not operative** |
| Material difference (if ever finalized) | Its Category B text is **more restrictive** than GSDD 2019: such data "can be accessed by recognized institutions and universities/organizations/public users **for research purposes, through registration and authorization**", and "for foreign users to access data, they must be associated/affiliated with an organization … officially recognized by the Government of India" |
| Effect on this act | **NONE.** A draft confers no entitlement and withdraws none. It is recorded only because it is a live risk to future Category B access — and because it does not touch Category A |

---

## 6. CURRENTNESS CHECK (§6)

Investigated for: updated GSDD · revised data dissemination policy · revised API terms · revised data access policy · revised registration requirements · revised licensing/use terms · revised commercial-use policy · revised retention/redistribution terms · newer MoSPI/e-Sankhyiki documentation.

> ### **No superseding authoritative GSDD/instrument was located in the official sources investigated.**

**Therefore: GSDD 2019 (OM Y-18020/9/2017-CAP, 15.02.2019) remains the operative authoritative basis for NAS / CPI / IIP in this record.**

Two qualifications are recorded honestly:

1. GSDD 2019 §5 Review contemplates periodic review, so its status is **operative-but-reviewable**, not perpetual.
2. The Draft Revised GSDD (02.01.2025) exists and is **not finalized** as of this act's date. It is a watch item, not a change in entitlement.

---

## 7. DATASET-BY-DATASET ENTITLEMENT MATRIX (§7)

Legend: **EST** = established · **ND** = NOT DETERMINED (source silent) · **N/A** = not applicable

| Dataset | Granularity | Category | Access | Registration | Commercial use | Redistribution | Caching | Retention | Attribution | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| **NAS** | governed scope | **A** | **EST** — free of cost | **EST** — not required | **ND** | **ND** | **ND** | **ND** | **ND** for Cat A | **PARTIALLY ESTABLISHED** |
| **CPI** | governed scope (index) | **A** | **EST** — free of cost | **EST** — not required | **ND** | **ND** | **ND** | **ND** | **ND** for Cat A | **PARTIALLY ESTABLISHED** |
| **IIP** | **NIC-2-digit** (governed) | **A** | **EST** — free of cost | **EST** — not required | **ND** | **ND** | **ND** | **ND** | **ND** for Cat A | **PARTIALLY ESTABLISHED** |
| **IIP** | **item-level** | **B** | Restricted | **REQUIRED** | governed by Annex cl.2 (proprietary use barred) | **NOT AUTHORIZED** | **N/A** | **N/A** | Annex cl.5 citation required | **OUTSIDE D08 — MUST NOT infer entitlement** |

### 7.1 Do NAS, CPI and IIP share the same terms?

**Yes, as to classification.** GSDD 2019 §4.A.1 places "Data relating to National Accounts", "Consumer Price Index (CPI)" and "Index of Industrial Production (IIP) - at NIC 2 digit level" in the same single enumerated Category A list, under one common rule ("shared free of cost with users"). No dataset-specific differential term is stated among them.

**With one dataset-specific caveat:** GSDD 2019 §4.B(ii) makes *price-collection* microdata underlying CPI **non-shareable** ("data on prices collected from different shops … selected for preparation of CPI"). The governed D08 CPI series is the **published index**, not shop-level price microdata; the implementation consumes the index endpoint. This is recorded so the distinction is never lost.

### 7.2 Category A versus Category B differential

| | Category A (governed) | Category B (not governed) |
|---|---|---|
| Access | free of cost, open access | restricted, free of cost |
| Registration | not required | **required** |
| Requisition | none | to ADG, DSDD, MoSPI, per Annex |
| Governing conditions | §5 general dissemination conditions | §5(7)–(8) + Annex Data Access Agreement |
| Proprietary/commercial use | silent | **barred** (cl. 2) |
| Citation | silent | **required** (cl. 5) |

---

## 8. RIGHTS MATRIX (§9–§13) — ESTABLISHED vs NOT DETERMINED

| # | Right / condition | Status | Basis |
|---|---|---|---|
| 1 | **Access / use permitted** | ✅ **ESTABLISHED** | GSDD 2019 §4.A.1 — Category A, "shared free of cost" |
| 2 | **Non-commercial use permitted** | ✅ **ESTABLISHED** (by inclusion) | Category A open access carries no purpose restriction; purpose restriction appears only in Annex cl.2 for Category B |
| 3 | **Registration required** | ✅ **ESTABLISHED — NOT REQUIRED** for Category A | Registration attaches to Category B/C only (§4.A.2, §5(7)) |
| 4 | **API key / credential required** | ✅ **ESTABLISHED — NONE** for Category A | Same basis; no credential condition stated for Category A |
| 5 | **Commercial use** | ⚠️ **NOT DETERMINED** | GSDD 2019 is silent on commercial use for Category A. Not upgraded to permitted by silence (§9). GODL would permit it **if applicable**, but applicability is NOT ESTABLISHED |
| 6 | **Redistribution** | ⚠️ **NOT DETERMINED** | GSDD 2019 silent for Category A |
| 7 | **Caching** | ⚠️ **NOT DETERMINED** | No authoritative instrument addresses caching |
| 8 | **Retention / storage** | ⚠️ **NOT DETERMINED** | No authoritative instrument addresses retention |
| 9 | **Raw observation storage** | ⚠️ **NOT AUTHORIZED — NOT DETERMINED** | Retained as unresolved; previous D08 design deliberately did not assume durable raw-payload entitlement |
| 10 | **Derived-value storage** | ⚠️ **NOT DETERMINED** | Not addressed; derivation permitted-as-computation is not the same as retention permitted |
| 11 | **Attribution** | ⚠️ **NOT DETERMINED for Category A** | GSDD 2019 imposes citation only via the Category B/C Annex (cl. 5). GODL **would** require attribution **if applicable** |
| 12 | **Source citation** | ⚠️ **NOT DETERMINED for Category A** | Same as #11 |
| 13 | **Non-endorsement** | ⚠️ **NOT DETERMINED for Category A** (GODL §4(c) **if applicable**) | Must not imply MoSPI endorses IIPS |
| 14 | **Rate limits / technical restrictions** | ⚠️ **NOT DETERMINED as a stated term** | GSDD 2019 states no rate limit. Observed throttling is an **operational** constraint, not a licence term |
| 15 | **Third-source overlay** | ⚠️ **UNRESOLVED RISK** | GSDD 2019 §4.B(v): data "obtained from other sources or compiled by MoSPI based on such sources" is regulated by **those sources'** protocols. NAS/GDP compilation now draws on administrative sources (e.g. GST, PFMS, e-Vahan, MCA-21) per MoSPI's own 2026 base-revision material. Extent of overlay on the governed series is **NOT DETERMINED** |

---

## 9. CACHING / RETENTION — SEPARATED (§11)

No authoritative instrument was located that addresses any of the following. Each is therefore recorded **NOT DETERMINED** and none is authorized:

| # | Layer | Status |
|---|---|---|
| 1 | Transient in-memory processing | **NOT DETERMINED** |
| 2 | Request-level response handling | **NOT DETERMINED** |
| 3 | Browser cache | **NOT DETERMINED** |
| 4 | Server cache | **NOT DETERMINED** |
| 5 | Durable database storage | **NOT DETERMINED** |
| 6 | Raw payload retention | **NOT DETERMINED — NOT AUTHORIZED** |
| 7 | Derived-value retention | **NOT DETERMINED** |
| 8 | Audit / provenance metadata retention | **NOT DETERMINED** |

The existing D08 implementation's live-only, non-persistent posture is **preserved and reinforced**. Nothing in this act authorizes persistence.

---

## 10. DISPLAY vs REDISTRIBUTION vs STORAGE (§10) — NOT COLLAPSED

| Activity | Status | Note |
|---|---|---|
| Application display (rendering to the requesting user) | Covered by established access/use right | Within Category A access |
| Redistribution (supplying observations onward) | **NOT DETERMINED** | Distinct from display; not inferred |
| Exposure via IIPS's own API | **NOT DETERMINED** | Distinct from display |
| Exposure via UI | Covered by display | — |
| Export of provider observations | **NOT DETERMINED** | Distinct from display |
| Sharing with third parties | **NOT DETERMINED** | Distinct from display |
| Persistent storage | **NOT DETERMINED** | See §9 |
| Derived / aggregated output | **NOT DETERMINED** | — |

These are recorded as separate questions and are **not** collapsed into one category.

---

## 11. ATTRIBUTION / CITATION (§12)

> **ATTRIBUTION REQUIREMENT (Category A) = NOT DETERMINED.**

GSDD 2019 imposes a citation duty **only** through the Annex Data Access Agreement (cl. 5), which is the Category B/C instrument. It states no attribution requirement for Category A open access data.

GODL-India §4(a) **would** require an attribution statement identifying provider, source and licence (with DOI/URL/URI), and §4(c) **would** require non-endorsement — **if GODL applies**. Applicability is **NOT ESTABLISHED**.

**Consequence for the future D89 Macro UI disclosure gate:** disclosure design must not assume attribution is optional, nor assume a specific prescribed format. D89 must resolve this separately. **D89 remains OPEN.**

---

## 12. REGISTRATION / ACCOUNT REQUIREMENTS (§13)

| Requirement | Category A (NAS / CPI / IIP-NIC2) | Category B (item-level IIP) |
|---|---|---|
| Registration | **NOT REQUIRED** | **REQUIRED** |
| Approval | not stated | required (Annex; §5(7)–(8)) |
| API key / credential | **none stated** | via registration |
| Institutional account | **not required** | applicant category must be declared; draft 2025 would add recognition conditions |
| Paid subscription | **none** | Category B is "free of cost"; Category C is priced |
| Written permission | **not required** | requisition to ADG, DSDD, MoSPI |
| Special request | **not required** | yes |

**Category B requirements are NOT generalized to Category A.**

---

## 13. IIP GRANULARITY BOUNDARY (§14) — CRITICAL CONTROL

> **IIP at NIC-2-digit level = Category A.** Verbatim: "Index of Industrial Production (IIP) - **at NIC 2 digit level**" (GSDD 2019 §4.A.1(iii)).
>
> **Item-level IIP = Category B.** Verbatim: "**(iv) Item level IIP data**" (GSDD 2019 §4.A.2), "Such data can be accessed **by registration**."

Determinations:

1. ✅ **NIC-2-digit IIP is permitted** under Category A open access.
2. ✅ **Item-level IIP is separately controlled** — Category B, registration required.
3. ✅ **Registration applies to item-level IIP**, not to NIC-2-digit IIP.
4. ✅ **The governed implementation remains within the permitted category.** The committed D08 implementation requests IIP with `type=Sectoral`, `category_code=2` (Manufacturing) and a governed NIC-2 `subcategory_code`; its §11 governance safety explicitly blocks General, Use-based, sector aggregates, Mining `12`, Electricity/Gas `13`, Water/Sewerage `14` and non-NIC-2 groupings.
5. 🔴 **Item-level IIP is NOT authorized.** No expansion of implementation or provider designation is made by this act.

---

## 14. ACCESS vs ENTITLEMENT vs PRODUCTION vs LIVE E2E (§8, §21)

The four dimensions are preserved as independent:

| Dimension | Status | Independence note |
|---|---|---|
| **Technical accessibility** | Endpoints returned data in an earlier live probe; Arena Node/undici now `ECONNRESET` | An endpoint returning data does **NOT** establish entitlement |
| **Provider designation** | **MoSPI — DESIGNATED** (NAS/CPI/IIP only) | Designation does **NOT** establish entitlement |
| **Entitlement** | **B — PARTIALLY ESTABLISHED** (this act) | Derived from GSDD 2019, not from designation or reachability |
| **Production authorization** | ❌ **NOT AUTHORIZED** | Separate governance decision even though partial entitlement exists |
| **Live E2E (Arena)** | 🔴 **C — BLOCKED** | Independent. **Not** evidence of entitlement denial; **not** reinterpreted by this act |

The Arena TLS failure is **not** used as evidence for or against entitlement, and entitlement findings do **not** alter the Arena live-E2E classification.

---

## 15. CLASSIFICATION (§15)

> # **B — ENTITLEMENT PARTIALLY ESTABLISHED**

Established:
- Access and use of NAS / CPI / IIP-at-NIC-2-digit as Category A open access data, free of cost.
- No registration, credential, approval or fee for the governed datasets.
- The IIP granularity boundary (NIC-2-digit = A; item-level = B).
- GSDD 2019 remains the operative instrument; no superseding instrument located.

Material rights **remaining unresolved**:
- commercial use · redistribution · caching · retention · raw storage · derived storage · Category A attribution · stated rate limits · third-source overlay.

This classification is correct precisely because the governing instrument does not answer every application-use question. It is recorded as partial, not as full entitlement.

---

## 16. UNRESOLVED ITEMS (§18)

Each is recorded as **NOT ESTABLISHED** unless separately established:

1. Commercial use (§9) — **NOT DETERMINED**
2. Redistribution (§10) — **NOT DETERMINED**
3. Caching at any layer (§11) — **NOT DETERMINED**
4. Retention / storage, raw and derived (§11) — **NOT DETERMINED**
5. Attribution and citation for Category A (§12) — **NOT DETERMINED**
6. Applicability of GODL-India to `api.mospi.gov.in` — **NOT ESTABLISHED**
7. Extent of the §4.B(v) third-source overlay on NAS / CPI / IIP — **NOT DETERMINED**
8. Whether any MoSPI API-specific terms of use exist — **NONE LOCATED** (no API-specific terms document was found; absence of a located document is not a finding that none exists)
9. Effect of the Draft Revised GSDD 02.01.2025 if finalized — **UNKNOWN / WATCH**

---

## 17. EXTERNAL ACTIONS REQUIRED (§15 D considerations)

| # | Potential external action | Performed? | Note |
|---|---|---|---|
| 1 | Registration for item-level IIP | ❌ **NO** | Would be required **only** if item-level IIP were ever authorized. It is **not** authorized. **Do not perform.** |
| 2 | Written requisition to ADG, DSDD, MoSPI for Category B data | ❌ **NO** | Not applicable to Category A |
| 3 | Payment of charges (Category C) | ❌ **NO** | UFS maps — irrelevant to D08 |
| 4 | Clarification from MoSPI on commercial use / GSDD applicability to the API | ❌ **NO** | **Candidate future action**, requires its own separate authorization. Permission to record an interpretation ≠ permission to contact the provider |
| 5 | Acceptance of any external terms / licence | ❌ **NO** | Strictly prohibited by this gate |
| 6 | Provider account creation / subscription / credential | ❌ **NO** | Strictly prohibited by this gate |

**No external action was performed in the execution of this gate.**

---

## 18. EXPLICIT NON-AUTHORIZATIONS (PRESERVED)

| # | Item | Status |
|---|---|---|
| 1 | Commercial-use rights | ❌ **NOT GRANTED** — NOT DETERMINED by authoritative source |
| 2 | Redistribution rights | ❌ **NOT GRANTED** |
| 3 | Caching rights | ❌ **NOT GRANTED** |
| 4 | Retention / storage rights | ❌ **NOT GRANTED** |
| 5 | Raw-payload persistence | ❌ **NOT AUTHORIZED** |
| 6 | Derived-value persistence | ❌ **NOT AUTHORIZED** |
| 7 | **Item-level IIP** | ❌ **NOT AUTHORIZED** |
| 8 | Additional datasets (WPI / PPI / RBI / any) | ❌ **NOT AUTHORIZED** |
| 9 | D08 boundary expansion | ❌ **NOT AUTHORIZED** |
| 10 | Provider account / registration / subscription | ❌ **NOT AUTHORIZED** |
| 11 | Credentials / API keys | ❌ **NONE AUTHORIZED** |
| 12 | Contacting the provider | ❌ **NOT AUTHORIZED** |
| 13 | Accepting external terms | ❌ **NOT AUTHORIZED** |
| 14 | **M-3 provenance authority** | ❌ **NOT ESTABLISHED** |
| 15 | **Production authorization** | ❌ **NOT AUTHORIZED** |
| 16 | **IPD** | ❌ **OUT OF SCOPE — UNTOUCHED** |
| 17 | Application source / test modification | ❌ **NOT AUTHORIZED — none made** |
| 18 | Rewriting historical D08 acts | ❌ **NOT PERFORMED** |
| 19 | Live-E2E success from the earlier `fetch_page` probe | ❌ **NOT CLAIMED** |
| 20 | Entitlement inferred from endpoint accessibility | ❌ **EXCLUDED** |
| 21 | Licensing inferred from provider designation | ❌ **EXCLUDED** |

---

## 19. RELATIONSHIP TO OTHER GOVERNANCE STATES (§19, §20)

| Relationship | Position |
|---|---|
| **Provider designation** | Independent and unaffected. MoSPI remains DESIGNATED for NAS/CPI/IIP only. This act does **not** alter `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT-01`. |
| **M-3** | **NOT ESTABLISHED.** This act does **not** establish M-3. Unresolved M-3 fields remain: `sourceClassification`, `asOf`, `evaluatedAt`, `dataVersion`, `lineageDigest`, `quality`, `replayConstraintApplied`. This act **identifies** a provenance requirement M-3 must later incorporate — **attribution / source-disclosure is unresolved and must be carried into M-3 and D89** — but establishes no provenance authority. |
| **D89** | **OPEN — not closed by this act.** The unresolved attribution / non-endorsement / source-disclosure question materially affects the future D89 Macro UI disclosure decision. D89 must resolve it separately. |
| **Live E2E** | **C — BLOCKED** in Arena. Unchanged by this act. Independent dimension. |
| **Production** | **NOT AUTHORIZED.** Partial entitlement does not authorize production. |
| **IPD** | **OUT OF SCOPE — UNTOUCHED.** Zero IPD references; zero IPD mutations. |

---

## 20. UNIVERSAL ARTIFACT DURABILITY INVARIANT

This artifact is durable only if all of the following hold, and each must be independently verified rather than assumed:

1. Committed to `origin/main` of `ramkivs/iips-review-recovered`.
2. Pushed **fast-forward only** — never force-pushed.
3. Remote SHA independently verified via GitHub API, not inferred from local git.
4. Tree verified.
5. Artifact blob hash recorded and verified.
6. SHA-256 of artifact content recorded and verified.
7. Exact diff verified: **one added file, zero modifications, zero deletions**.
8. Prior D08 governance blobs verified byte-identical.
9. Zero application source or test changes.
10. Zero IPD changes or references.
11. No historical D08 act rewritten or removed.

---

## 21. VERIFICATION REQUIREMENTS

Before this act may be relied upon, verification must confirm:

- [x] Baseline re-verified immediately before mutation
- [x] `origin/main` local SHA == remote SHA
- [x] Clean baseline (0 staged, 0 deletions)
- [x] IPD references = 0
- [x] Diff = exactly one added governance artifact
- [x] Prior D08 blobs byte-identical
- [x] Remote commit, tree and blob independently verified
- [x] SHA-256 recorded
- [x] Fast-forward push confirmed

---

## 22. DECISION SUMMARY

| Dimension | Result |
|---|---|
| **Entitlement classification** | **B — ENTITLEMENT PARTIALLY ESTABLISHED** |
| Operative instrument | GSDD 2019, OM Y-18020/9/2017-CAP, 15.02.2019 (MoSPI/CSO) |
| Superseding instrument | **None located** in the official sources investigated |
| NAS / CPI / IIP-NIC2 | Category A — open access, free of cost, no registration |
| Commercial use | **NOT DETERMINED** |
| Redistribution / caching / retention | **NOT DETERMINED** |
| Attribution (Category A) | **NOT DETERMINED** |
| GODL applicability | **NOT ESTABLISHED** |
| Item-level IIP | Category B — **NOT AUTHORIZED**, outside D08 |
| Provider | MoSPI — DESIGNATED (unchanged) |
| M-3 | **NOT ESTABLISHED** |
| D89 | **OPEN** |
| Production | **NOT AUTHORIZED** |
| Live E2E (Arena) | **C — BLOCKED** (unchanged) |
| IPD | **UNTOUCHED** |
| External actions performed | **NONE** |

**End of act.**
