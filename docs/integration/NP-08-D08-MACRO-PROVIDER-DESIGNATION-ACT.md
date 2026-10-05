# NP-08 / D08 MACRO — PROVIDER DESIGNATION ACT

> **1. Act ID:** `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT-01`
> **2. Title:** D08 Macro — Designation of the Governed Provider for NAS / CPI / IIP
> **3. Decision date:** **`2026-10-05`** — **prospective only**
> **4. Authoritative repository:** `ramkivs/iips-review-recovered`
> **5. Authoritative ref:** `origin/main`
> **6. Baseline commit:** **`b489efd97abebaad4fdec9060466bc58cf91a482`** (tree **`e8394fafe738327fa0664bb63ed128258ef15b26`**)
> **7. Decision authority:** **Ramki / Program Authority** — explicit designation decision supplied by Ramki within the `NP-08 / D08 MACRO — TRACK B PROVIDER DESIGNATION GOVERNANCE GATE`. `arena-agent` performed investigation, verification and record-execution **only**; **no decision was rendered by the agent.**
> **Act type:** `PROVIDER DESIGNATION` — **non-executable**
> **Workstream:** NP-08 — Intelligence · **D08 Macro**
> **Mutation:** one new governance artifact; **zero** modification to any historical record; **zero** source-code mutation
> **IPD:** **OUT OF SCOPE — zero mutation**
> **Production repository (`ramkivs/iips-production-market-data`):** **OUT OF SCOPE**

---

> # ⚠️ **THIS ACT ANSWERS ONE QUESTION ONLY: WHO IS THE GOVERNED SOURCE?**
>
> It does **not** answer: *can a particular environment reach the provider?* · *are we entitled to consume the data?* · *what provenance authority governs it?* · *is production authorized?*
>
> Those states remain **independently governed and independently evidenced** (§12).

---

## 8. PROVIDER IDENTITY — DESIGNATED

> # ✅ **THE GOVERNED D08 MACRO PROVIDER IS: `MoSPI`.**

| Field | Record |
|---|---|
| **Designated provider** | **MoSPI** |
| **Full institutional identity** | **Ministry of Statistics and Programme Implementation (MoSPI), Government of India** |
| **Statistical-system identity** | National Statistical Office (NSO) is the statistical wing operating within MoSPI; MoSPI is the ministry of record |
| **Source/API identity** | **e-Sankhyiki — MoSPI REST API**, base `https://api.mospi.gov.in` |
| **Access mode of record** | Unauthenticated HTTPS GET, **throttled** (no-auth posture, D3 Option A) |
| **Designation scope** | **D08 Macro only** — this designation confers no authority outside D08 |

---

## 9. GOVERNED DATASETS

> # **D08 boundary = `NAS` / `CPI` / `IIP` — UNCHANGED BY THIS ACT**

| Dataset | Expansion | Meaning |
|---|---|---|
| **NAS** | National Accounts Statistics | Gross Value Added (`indicator_code=1`), Gross Domestic Product (`indicator_code=5`) |
| **CPI** | Consumer Price Index | Group / Sub-Group index and inflation; own base-year enumeration (`2012`/`2010`/`2024`) |
| **IIP** | Index of Industrial Production | `type=Sectoral`, Manufacturing category, NIC-2-digit subcategories |

---

## 10. DATASET-TO-PROVIDER MAPPING

| Dataset | D08 governed? | Designated provider | Source/API identity | Designation status |
|---|---|---|---|---|
| **NAS** | **YES** | **MoSPI** | `/api/nas/getNASData` | ✅ **DESIGNATED** |
| **CPI** | **YES** | **MoSPI** | `/api/cpi/getCPIIndex` | ✅ **DESIGNATED** |
| **IIP** | **YES** | **MoSPI** | `/api/iip/getIipData` (+ `/api/iip/getIipFilter` runtime metadata) | ✅ **DESIGNATED** |
| **WPI** | **NO** | — | — | 🔴 **MUST NOT DESIGNATE — excluded from D08** |
| **PPI** | **NO** | — | — | 🔴 **MUST NOT DESIGNATE** |
| **RBI-sourced data** | **NO** | — | — | 🔴 **MUST NOT DESIGNATE** |

**Correspondence verified:** the implementation's governed source boundary on `origin/main` (`frontend/server/macro/mospi-source.ts`) matches this mapping exactly — `MACRO_SOURCE_ID = 'MoSPI'`, `APPROVED_DATASETS = ['NAS','CPI','IIP']`, `MOSPI_REST_BASE_URL = 'https://api.mospi.gov.in'`, endpoints as tabulated. The route enforces the allowlist (`404` for any non-approved dataset).

---

## 11. EXACT SCOPE OF THIS DESIGNATION

This act designates MoSPI **only** as:

1. the governed **source** of record for D08 Macro `NAS`, `CPI`, `IIP`;
2. the counterparty for any **future** entitlement/licensing governance (itself a separate gate);
3. the named source for provenance attribution **once M-3 is separately established**.

This act does **not** designate MoSPI for any dataset outside D08, and does **not** designate any other provider.

---

## 12. EXPLICIT EXCLUSIONS — INDEPENDENTLY GOVERNED STATES

> # ❌ **NONE OF THE FOLLOWING IS GRANTED, ESTABLISHED OR IMPLIED BY THIS ACT.**

| # | State | Standing |
|---:|---|---|
| 1 | **Entitlement / licensing** | ❌ **NOT GRANTED** — separate subsequent governance gate |
| 2 | **Commercial-use rights** | ❌ **NOT GRANTED** |
| 3 | **Redistribution rights** | ❌ **NOT GRANTED** |
| 4 | **Caching rights** | ❌ **NOT GRANTED** |
| 5 | **Retention rights** | ❌ **NOT GRANTED** |
| 6 | **Attribution rights** | ❌ **NOT DETERMINED** |
| 7 | **M-3 provenance authority** | ❌ **NOT ESTABLISHED** — separate gate; recorded dependency since `8c98cfde…` §9.2 |
| 8 | **Production authorization** | ❌ **NOT AUTHORIZED** |
| 9 | **Production deployment** | ❌ **NOT AUTHORIZED** |
| 10 | **Credentials / tokens** | ❌ **NONE AUTHORIZED** |
| 11 | **Provider account / API subscription** | ❌ **NOT AUTHORIZED** — no account created, no subscription taken |
| 12 | **Additional datasets** | ❌ **NOT AUTHORIZED** |
| 13 | **Implementation expansion** | ❌ **NOT AUTHORIZED** |
| 14 | **IPD** | ❌ **OUT OF SCOPE — UNTOUCHED** |
| 15 | **D08 boundary expansion** | ❌ **NOT AUTHORIZED** |
| 16 | **`GDP` / `REPO_RATE` / `10Y_GSEC` / `TRADE_DEFICIT`** | ❌ **NOT ADDED** to the D08 boundary |
| 17 | **WPI / PPI** | ❌ **PROHIBITED** |
| 18 | **RBI as a source** | ❌ **PROHIBITED** |
| 19 | **SNAPSHOT acquisition / fallback** | ❌ **PROHIBITED** by WP-MACRO-03 |
| 20 | **Retroactive acquisition authorization** | ❌ **NOT AUTHORIZED** |

---

## 13. INDEPENDENT STATE RECORD

| State | Standing |
|---|---|
| **D08 boundary** | `NAS / CPI / IIP` — **UNCHANGED** |
| **Provider designation** | ✅ **MoSPI DESIGNATED** (this act) — NAS / CPI / IIP only |
| **Entitlement** | ❌ **NOT GRANTED** |
| **M-3 provenance authority** | ❌ **NOT ESTABLISHED** |
| **Implementation** | ✅ **AUTHORIZED / DURABLE** — commit `b489efd…` |
| **Authentication** | **NO-AUTH / THROTTLED** |
| **Live E2E (Arena)** | 🔴 **C — BLOCKED (environmental)** |
| **Production** | ❌ **NOT AUTHORIZED** |
| **IPD** | ✅ **UNTOUCHED** |

---

## 14. LIVE-E2E SEPARATION — MANDATORY

> # 🔴 **ARENA LIVE E2E = `C — BLOCKED`. THIS ACT DOES NOT CHANGE THAT.**

The evidence establishes only:

* Arena Node `globalThis.fetch` (undici) → `api.mospi.gov.in` = **`ECONNRESET`**;
* TCP connects; **TLS fails**; control host (`registry.npmjs.org`) succeeds;
* multiple MoSPI hostnames/IPs fail (`api`, `mospi.gov.in`, `esankhyiki`, `mcp`);
* CA trust configuration does not change the result;
* no proxy, container runtime, or alternate network namespace is available;
* application fail-closed behaviour, governed URL construction, no-auth posture and negative controls all remained **correct**;
* zero repository mutation occurred.

> **This evidence is recorded solely as the live-acquisition qualification status of one environment.**
>
> It **MUST NOT** be read as provider rejection, provider denial, lack of entitlement, proof of MoSPI licensing status, proof that MoSPI blocks all access, or evidence that another environment cannot reach MoSPI.

Designation is valid while live E2E remains blocked in Arena. That combination is **not contradictory**.

---

## 15. RELATIONSHIP TO THE PRIOR D08 SOURCE/PROVIDER ACT

| Element | Record |
|---|---|
| Prior act | `NP-08-D08-MACRO-SOURCE-PROVIDER-DESIGNATION-ACT-01` — blob **`8c98cfde…`** · `2026-10-04T18:29:31Z` |
| What it did | **Established the AUTHORITY** to designate a D08 Macro source/provider (§6.1) |
| What it did **not** do | Designated **no** provider (§7.2); recorded MoSPI only as an *"evident candidate, not designated"* |
| This act | **Exercises that established authority** to make the designation |
| Prior act modified? | ❌ **NO — `8c98cfde…` remains byte-identical** |
| Historical rewriting | ❌ **NONE** |

### 15.1 Precedence / supersession semantics

| # | Statement |
|---:|---|
| 1 | `8c98cfde…` §7.2 (*"no provider is designated"*) is **superseded by this act to the extent, and only to the extent, of the D08 designation of MoSPI for NAS / CPI / IIP.** |
| 2 | `8c98cfde…` §6 (authority established) is **affirmed, not superseded** — it is the basis of this act. |
| 3 | `8c98cfde…` §7.3 (no entitlement) is **affirmed and preserved in full**. |
| 4 | `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT-01` (`d07f5863…`) **§23 `PROVIDER DESIGNATION = NOT YET MADE`** is **superseded** as to MoSPI/NAS/CPI/IIP only. All other rows of §23 (RBI, NSO, any other provider, entitlement, qualification/acceptance) remain **in full force**. |
| 5 | `NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01` (`1df62a9e…`) §16 (*"MoSPI REMAINS NOT DESIGNATED"*) is **superseded** as to the provider-designation statement only. Every other exclusion in that act is **unaffected**. |
| 6 | `NP-08-D08-MACRO-BOUNDARY-ACT-RECTIFICATION-ACT-01` (`8ce8e5ac…`) is **unaffected** — it superseded implementation-status clauses only and explicitly preserved non-designation; that preservation is now superseded to the extent stated in (4) and (5). |
| 7 | **No historical act is rewritten.** Future readers must read this act together with the superseded clauses. |

---

## 16. UNIVERSAL ARTIFACT DURABILITY INVARIANT

> **Arena-local existence is NOT durability.**
>
> Durability requires: publication to the authoritative repository/ref (`ramkivs/iips-review-recovered` @ `main`) **plus** independent remote verification of commit, tree, artifact blob and SHA-256.
>
> This act is durable only upon satisfaction of §17.

---

## 17. VERIFICATION REQUIREMENTS

| # | Requirement |
|---:|---|
| 1 | `origin/main` verified before and after mutation |
| 2 | Baseline commit `b489efd…` and tree `e8394faf…` confirmed pre-mutation |
| 3 | **Only** this artifact added — no source, test, package or governance file modified |
| 4 | Non-force push to `origin/main` |
| 5 | Independent remote query (`gh api`) of commit, parent, tree and changed-file list |
| 6 | Artifact blob and SHA-256 recorded and verified remotely |
| 7 | All prior D08 blobs verified **unchanged** (`7cd63efb…`, `8c98cfde…`, `d07f5863…`, `1df62a9e…`, `8ce8e5ac…`) |
| 8 | IPD refs remain **0** |
| 9 | No credentials, tokens or secrets introduced |

---

## 18. DECISION SUMMARY

> **Designated provider:** **MoSPI — Ministry of Statistics and Programme Implementation, Government of India.**
>
> **Governed datasets:** **NAS · CPI · IIP — and nothing else.**
>
> **Boundary:** **D08 = NAS / CPI / IIP, unchanged.**
>
> **Not granted:** entitlement · licensing · commercial use · redistribution · caching · retention · attribution · M-3 · production · credentials · provider account · additional datasets · implementation expansion.
>
> **Live E2E (Arena):** **remains `C — BLOCKED` — environmental, and not evidence either way.**

---

*End of Provider Designation Act. Recorded against `origin/main` = `b489efd97abebaad4fdec9060466bc58cf91a482` / tree `e8394fafe738327fa0664bb63ed128258ef15b26`. This act designates the governed source and nothing more. **No entitlement is granted. M-3 is not established. Production is not authorized. IPD is untouched.***
