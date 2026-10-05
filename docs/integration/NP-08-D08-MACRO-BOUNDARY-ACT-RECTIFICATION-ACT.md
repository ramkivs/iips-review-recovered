# NP-08 / D08 MACRO — BOUNDARY ACT RECTIFICATION ACT

> **1. Act ID:** `NP-08-D08-MACRO-BOUNDARY-ACT-RECTIFICATION-ACT-01`
> **2. Title:** D08 Macro — Narrow Rectification of the Dataset Boundary Act's Implementation-Status Statements
> **3. Effective date/time:** **`2026-10-05`** — **prospective only**
> **4. Issuing authority:** Executed under the `NP-08 / D08 MACRO — IMPLEMENTATION-CHANGE GATE`, §6 (Boundary-Act Reconciliation), which directs that a contradiction be **formally rectified in a separate act** rather than by rewriting the historical record.
> **Act type:** `NARROW RECTIFICATION` — **non-executable**
> **Workstream:** NP-08 — Intelligence · **D08 Macro**
> **Repository / ref (durable):** `ramkivs/iips-review-recovered` @ `main`
> **Mutation:** one new governance artifact. **The D08 Boundary Act is NOT modified.**
> **IPD:** **OUT OF SCOPE — zero mutation**

---

## 5. PURPOSE

The durable D08 constitution and the newer implementation-authority decision act contradict each other on one narrow point. This act resolves that contradiction **without rewriting history**.

| Record | Blob | Statement |
|---|---|---|
| `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT.md` | `d07f5863…` (23,517 B / SHA-256 `2fe0efdd…`) | Records implementation as **NOT AUTHORIZED** |
| `NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT.md` | `1df62a9e…` (19,926 B / SHA-256 `827aa1d5…`) | **Grants** D1 implementation authority |

Left unresolved, a reader of `main` would see a standing prohibition alongside an implementation proceeding under an explicit grant. This act makes the relationship explicit.

---

## 6. WHAT THIS ACT DOES **NOT** ALTER

> # 🔴 **THE D08 BOUNDARY ACT IS NOT MODIFIED.**

| Check | Result |
|---|---|
| `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT.md` blob before | `d07f5863…` |
| `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT.md` blob after | `d07f5863…` — **UNCHANGED** |
| Historical meaning | **PRESERVED** — no line is deleted, edited, or softened |

This act is **additive**. The boundary act remains a complete and accurate record of what was true when it was made, and of what remains true today **outside** the superseded scope.

---

## 7. PROVISIONS SUPERSEDED — STATED EXACTLY

Only the following provisions of `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT-01` are superseded, **solely** with respect to implementation authorization:

| Line | Provision as recorded | Effect of this act |
|---:|---|---|
| **33** | *"No provider is designated. No entitlement is granted. **No implementation is authorized.** No production is authorized."* | The clause *"No implementation is authorized"* is **superseded** for the §8 scope only. All other clauses in the sentence remain in **full force**. |
| **396** | *"# **IMPLEMENTATION = `NOT AUTHORIZED`.**"* | **Superseded** for the §8 scope only. |
| **468** | *"\| 5 \| Acquisition implementation \| ❌ **NOT AUTHORIZED** \| Separate authorization \|"* | The required *"Separate authorization"* has now been given by the Implementation-Authority Decision Act. This row is **superseded** for the §8 scope only. |
| **496** | *"…No provider is designated. No entitlement is granted. **No implementation is authorized.** No production is authorized…"* | The clause *"No implementation is authorized"* is **superseded** for the §8 scope only. |

> **Nothing else in the boundary act is affected.**
> In particular the following remain **fully in force and unaltered**: the D08 dataset boundary (`NAS / CPI / IIP`), the non-designation of any provider, the non-grant of entitlement, the non-establishment of M-3, the non-authorization of production, the exclusion of `GDP` / `REPO_RATE` / `10Y_GSEC` / `TRADE_DEFICIT`, the exclusion of `WPI`/`PPI`, the exclusion of `RBI`, and the preservation of the WP-MACRO-03 provenance gap.

---

## 8. EXACT SCOPE OF THE SUPERSEDED IMPLEMENTATION AUTHORITY

The supersession extends **only** to the eight-item D08 Macro route-contract change set authorized as **D1**, plus the surface-creation authority **D2**, the authentication posture **D3**, and the toolchain authority **D4** recorded in `NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01`:

1. NAS explicit `indicator_code` (`1` = GVA, `5` = GDP)
2. IIP `type=Sectoral`
3. IIP `category_code` resolved at runtime per base year
4. IIP governed NIC-2 `subcategory_code`
5. Runtime IIP category/subcategory enumeration per base year
6. Complete pagination via `limit` / `page`
7. Bounded retry/backoff, `429`, `Retry-After`
8. Enforced request timeout
9. Runtime metadata (not stale Swagger) governing IIP code validation
10. Creation of the Macro implementation surface on `origin/main`
11. No-auth / throttled authentication posture
12. Dependency provisioning for test / typecheck / build / verification **only**

**Any implementation change outside this list is still NOT AUTHORIZED** and requires a further governance decision.

---

## 9. EXCLUSIONS PRESERVED — UNCHANGED BY THIS RECTIFICATION

> # ❌ **NONE of the following is granted, loosened, or implied by this act.**

| Excluded | Standing |
|---|---|
| MoSPI provider designation | **NOT DESIGNATED** |
| Commercial-use entitlement | **NOT GRANTED** |
| Redistribution rights | **NOT GRANTED** |
| Caching rights | **NOT GRANTED** |
| Retention rights | **NOT GRANTED** |
| Attribution rights | **NOT DETERMINED** |
| M-3 provenance authority | **NOT ESTABLISHED** |
| Production authorization | **NOT AUTHORIZED** |
| Production deployment | **NOT AUTHORIZED** |
| IPD mutation | **OUT OF SCOPE — UNTOUCHED** |
| D08 boundary expansion | **NOT AUTHORIZED** |
| Addition of `GDP` / `REPO_RATE` / `10Y_GSEC` / `TRADE_DEFICIT` | **NOT AUTHORIZED** |
| `WPI` / `PPI` authority | **NOT AUTHORIZED** |
| `RBI` source authority | **NOT AUTHORIZED** |

> # **D08 boundary = `NAS` / `CPI` / `IIP` — UNCHANGED**

---

## 10. NON-PRODUCTION STATUS

| Element | Determination |
|---|---|
| This act | Non-production governance record |
| `origin/main` | Authoritative **non-production** repository |
| Production repository | **OUT OF SCOPE** |
| Production-market-data changes | **NOT AUTHORIZED** |

---

## 11. METHOD — WHY A SEPARATE ACT

Per the implementation gate §6, the historical D08 act is **not** rewritten merely to make the contradiction disappear. The directives observed:

| # | Requirement | Observed |
|---:|---|---|
| 1 | Prepare a **separate** rectification act | ✅ This act; boundary act untouched |
| 2 | **Do not alter historical meaning** | ✅ No line of the boundary act edited |
| 3 | **State exactly** which provisions are superseded | ✅ §7, line-by-line |
| 4 | **Preserve all exclusions** | ✅ §9 |
| 5 | **Publish durably** | ✅ committed and pushed to `origin/main` |
| 6 | **Independently verify** | ✅ blob-level remote verification |

---

## 12. BASELINE AGAINST WHICH THIS RECTIFICATION WAS MADE

| Element | Value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Remote | `https://github.com/ramkivs/iips-review-recovered.git` |
| Pre-mutation `origin/main` | **`06c556e05770307a02983ce4b81b97c2c070fdfa`** |
| Pre-mutation tree | **`31b92e6b320a2f75db3ef72857877d9a310cd877`** |
| Parent of pre-mutation commit | `da9499c2e8ff4d9460ed3957e1213a3332ea511f` |
| IPD refs | **0** — absent, untouched |
| Macro implementation on pre-mutation `origin/main` | **0 files** |

**Governance records verified unchanged by this act:**

| Record | Blob |
|---|---|
| `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT.md` | `d07f5863…` |
| `NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT.md` | `1df62a9e…` |
| `NP-08-D08-MACRO-SOURCE-PROVIDER-DESIGNATION-ACT.md` | `8c98cfde…` |
| `NP-08-M5-D91-OUT-OF-SCOPE-DISPOSITION-ACT.md` | `2006786c…` |
| `NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT.md` | `d396e688…` |
| `NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT.md` | `4bb191a6…` |
| `NP-08-D91-RELIEF-MECHANISM-ACT.md` | `f61325ee…` |
| `NP-08-D8-MACRO-SCOPE-DETERMINATION-ACT.md` | `7cd63efb…` |

---

## 13. EFFECT

After this act, the governance record on `main` reads coherently:

> The D08 boundary is `NAS / CPI / IIP`. No provider is designated. No entitlement is granted. **Implementation of the narrowly defined D08 Macro route-contract change set is authorized** by the Implementation-Authority Decision Act, and the boundary act's implementation prohibition is **superseded to that extent only**. M-3 is not established. Production is not authorized. IPD is untouched.

---

*End of Rectification Act. This act supersedes exactly four implementation-status statements in `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT-01` (lines 33, 396, 468, 496) and nothing else. The boundary act file is unmodified. **No provider is designated. No entitlement is granted. M-3 is not established. Production is not authorized.***
