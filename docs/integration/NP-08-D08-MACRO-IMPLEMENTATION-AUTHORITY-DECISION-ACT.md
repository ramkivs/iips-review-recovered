# NP-08 / D08 MACRO — IMPLEMENTATION-AUTHORITY DECISION ACT

> **1. Act ID:** `NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01`
> **2. Title:** D08 Macro — Implementation-Authority Decision Act (D1–D4)
> **3. Effective date/time:** **`2026-10-05`** — **prospective only**
> **4. Issuing authority:** **Ramki / Program Authority** — every decision recorded in this act was supplied **explicitly by Ramki** in response to the `NP-08 / D08 MACRO — IMPLEMENTATION-AUTHORITY DECISION GATE`. `arena-agent` executed the gate, independently reverified the baseline, and **recorded** the decisions only. **No decision was rendered by the agent.**
> **Act type:** `AUTHORITY DECISION` — **non-executable**
> **Workstream:** NP-08 — Intelligence · **D08 Macro**
> **Repository / ref (durable):** `ramkivs/iips-review-recovered` @ `main`
> **Mutation:** one new governance artifact; **zero** modification to any historical record; **zero** source-code mutation
> **IPD:** **OUT OF SCOPE — zero mutation**

---

> # ⚠️ **THIS ACT AUTHORIZES DECISIONS ONLY.**
>
> **Implementation has NOT occurred.**
> No code file was created, modified, copied, or deleted by this act.
> No `/api/macro` route was created. No `mospi-source.ts` was created.
> No `MacroContext.tsx` was created. No `executive-transport.ts` was modified.
> No dependency was installed. No package manifest was modified.
> No fixture was created. No build was run.

---

## 5. PURPOSE AND PROVENANCE OF THIS ACT

This act exists because the preceding gate stopped at `D — IMPLEMENTATION NOT AUTHORIZED` on five grounds, all of which required an explicit Ramki decision rather than an inference.

| # | Gate | Outcome |
|---:|---|---|
| 1 | `D08 MACRO — IIP / NAS RUNTIME CODE-ENUMERATION GATE` | Evidence gaps **CLOSED** — NAS / CPI / IIP each classified **A**. Both runtime code contracts established. |
| 2 | `D08 MACRO — IMPLEMENTATION-CHANGE AUTHORIZATION GATE` | **D — IMPLEMENTATION NOT AUTHORIZED.** Blockers: (i) no explicit Ramki authorization; (ii) Macro implementation surface **absent** from `origin/main`; (iii) implementation exists only on non-authoritative refs; (iv) authentication posture unselected; (v) dependency toolchain unavailable. |
| 3 | `D08 MACRO — IMPLEMENTATION-AUTHORITY DECISION GATE` (**this act**) | Ramki supplied **D1–D4** explicitly. Recorded here. |

The evidence question is closed. The **authority** question is what this act resolves.

---

## 6. DECISION MATRIX (§16)

| Decision | Ramki decision | Scope | Result |
|---|---|---|---|
| **D1 — Implementation authority** | ✅ **AUTHORIZE** | D08 Macro route-contract implementation (8 items, §8) | Authority **GRANTED** |
| **D2 — Create Macro implementation** | ✅ **AUTHORIZE CREATION ON `origin/main`** | Implementation surface creation on the authoritative non-production ref | Creation authority **GRANTED** |
| **D3 — Authentication posture** | ✅ **OPTION A — ACCEPT THROTTLED NO-AUTH** | Runtime authentication posture | Posture **SELECTED** |
| **D4 — Dependency / toolchain** | ✅ **AUTHORIZE** | Provisioning declared dev dependencies for test / typecheck / build / verification | Provisioning **AUTHORIZED** |

**No decision was inferred. All four were explicitly supplied by Ramki.**

---

## 7. DECISION AUTHORITY (§14.1)

| Element | Determination |
|---|---|
| Decision authority | **Ramki / Program Authority** |
| Agent role | Investigation, baseline verification, presentation of options, and record-execution **only** |
| Decisions rendered by agent | **NONE** |
| Method of supply | Explicit option selection against the four questions presented by the decision gate |

---

## 8. DECISION 1 — EXACT SCOPE OF AUTHORIZATION (§14.2)

> # ✅ **D1 = AUTHORIZE**

Implementation authority is granted **only** for the following eight-item D08 Macro route-contract change set. **No other change is authorized.**

| # | Authorized change | Specification |
|---:|---|---|
| 1 | **NAS explicit `indicator_code`** | `1` = Gross Value Added · `5` = Gross Domestic Product. Both runtime-confirmed. No reliance on numeric ordering or implicit defaults. |
| 2 | **IIP `type`** | `type=Sectoral` — excludes `General` and all Use-based categories. |
| 3 | **IIP `category_code`** | `category_code=2` (Manufacturing, Sectoral) for base year `2022-23`. Excludes Mining (`12`), Electricity & Gas (`13`), Water/Sewerage/Waste (`14`). |
| 4 | **IIP `subcategory_code`** | Governed NIC-2-digit enumeration — `022011-1210` … `022011-1232`, representing NIC divisions 10–32. Excludes sector aggregates. |
| 5 | **IIP base-year handling** | Runtime enumeration per applicable base year. **Category codes are NOT portable across base years** and must not be hard-coded base-year-independently. |
| 6 | **Pagination** | `limit` + `page`, continuing until the complete governed result is retrieved according to returned pagination metadata (`page` / `totalRecords` / `totalPages` / `recordPerPage`). Duplicate page accumulation prevented. Empty/invalid pagination metadata handled safely. **Fail closed** — a partial response is never silently treated as complete. |
| 7 | **Retry / backoff** | Bounded retry/backoff; handle `429`; honor `Retry-After` where applicable. |
| 8 | **Timeout** | Explicit, enforced request timeout. |

**Additional constraint (item 9, carried from the authorization gate):** validation of IIP codes **must not** use the stale Swagger `category_code` range (`01`–`11`) or the stale `subcategory_code` regex (`^\d+(,\d+)*$`, which rejects every valid hyphenated code). **Runtime metadata governs base-year-dependent codes.**

**Architecture constraints carried forward into the implementation gate:**

- Preserve existing architecture — do **not** redesign the Macro subsystem.
- Preserve governed transport: `MacroContext → authFetch → /api/macro → guarded read → MoSPI route`, unless the repository demonstrates a minimal correction is required.
- Preserve **fail-closed** behavior: unavailable or invalid metadata must not silently become valid observations.
- Preserve **LIVE-only** semantics: no snapshots, no stale fallback payloads, no synthetic Macro observations.
- Preserve dataset boundary: **NAS / CPI / IIP only**.

---

## 9. DECISION 2 — IMPLEMENTATION CREATION AUTHORITY (§14.3)

> # ✅ **D2 = AUTHORIZE CREATION ON `origin/main`**

| Element | Determination |
|---|---|
| Verified fact | `origin/main` contains **ZERO** Macro implementation files (`frontend/server/macro/` = 0; `mospi-source.ts` = 0; `src/api/macro.ts` = 0; `MacroContext.tsx` = 0; `/api/macro` route = 0 matches in `executive-transport.ts`). |
| Decision | Creation of the required D08 Macro implementation surface **directly on `origin/main`** is **AUTHORIZED**. |
| Nature | This is a **broader** authority decision than modifying an existing adapter, and is recorded as explicitly granted. |
| Independence | **Creation authority is NOT inferred from D1.** It is separately and explicitly granted here. |
| Non-production | `origin/main` is the authoritative **non-production** governance/implementation repository. The production repository remains out of scope. |

### 9.1 Sub-decision recorded as OPEN — provenance of the new surface

D2 authorizes **creation**. It does **not**, by itself, authorize wholesale copying, cherry-picking, or merging from `origin/phase13-next` or `origin/gai-impl-canonical`.

Those refs contain the only existing Macro implementation (`mospi-source.ts` 511 lines / SHA-256 `7464bb74…`, `mospi-source.test.ts`, `macro-transport.test.ts`, `src/api/macro.ts`, `MacroContext.tsx`, `MacroContext.test.tsx`) and are **non-authoritative**. Their existence does **not** establish authority, and their content is **not** durable IIPS state.

> **Open item for the next gate:** if the implementation proposes to base the new surface on either ref, that must be **explicitly confirmed by Ramki** in the implementation gate. It is not authorized by this act.

---

## 10. TARGET REF (§14.4)

| Element | Determination |
|---|---|
| **Target ref** | **`origin/main`** |
| Repository | `ramkivs/iips-review-recovered` |
| Remote | `https://github.com/ramkivs/iips-review-recovered.git` |
| Durability mechanism | Commit on `origin/main`, verified remotely. **Arena-local existence is not durability.** |
| Publication method | Plumbing publish; **never force-push** (`git push --force` prohibited). |
| Production repository | **OUT OF SCOPE** |

---

## 11. DECISION 3 — AUTHENTICATION POSTURE (§14.5)

> # ✅ **D3 = OPTION A — ACCEPT THROTTLED NO-AUTH**

| Element | Determination |
|---|---|
| Selected posture | **Unauthenticated MoSPI GET** — the posture observed live during the preceding evidence gate. |
| Basis | Unauthenticated GETs are **live-confirmed** to return data. Response is **throttled** — documentation states unauthenticated access returns only the first 10 records per request. |
| Recorded constraints | (a) This is **unauthenticated** access. (b) Throttling is an **operational constraint**, not a defect to be worked around. (c) **No claim of authenticated entitlement is made.** (d) Retry/backoff must be **bounded**. (e) This decision **does NOT** grant commercial entitlement, and **does NOT** designate MoSPI. |
| Authenticated behavior | **NOT TESTED.** Live evidence for the authenticated path does not exist and is not created by this act. |
| Token path | **NOT authorized.** Option B is not selected; no authorized credential mechanism exists. |
| Registration | No account registration, subscription, or credential creation is authorized or implied. |
| Future revision | Any move to Option B requires a **separate** governance decision plus an authorized credential mechanism. |

---

## 12. DECISION 4 — DEPENDENCY / TOOLCHAIN AUTHORITY (§14.6)

> # ✅ **D4 = AUTHORIZE**

| Element | Determination |
|---|---|
| Authorization | Provisioning/installation of the repository's **declared** development dependencies is **AUTHORIZED**. |
| Permitted purposes **only** | `test` · `typecheck` · `build` · implementation verification |
| Manifest changes | **NOT authorized.** No change to declared dependency sets, versions, or lockfiles. If provisioning would alter a manifest or lockfile, **STOP and report** rather than proceeding. |
| Unrelated dependencies | **NOT authorized.** |
| Recorded obstacle | `node_modules` is absent; a prior `npm install` failed on **TLS**. Provisioning may therefore not succeed. If it fails, the implementation gate must **report the failure** and may **not** claim full verification. |

**Available repository scripts (worktree reference, `frontend/package.json`):** `dev` · `build` (`tsc -b && vite build`) · `preview` · `typecheck` (`tsc --noEmit`) · `test` (`vitest run`).

---

## 13. EXPLICIT EXCLUSIONS (§14.7)

This act **MUST NOT** be interpreted as granting any of the following. Each remains **UNAUTHORIZED**:

| # | Excluded | Status |
|---:|---|---|
| 1 | MoSPI provider designation | ❌ **NOT DESIGNATED** |
| 2 | Commercial-use entitlement | ❌ **NOT GRANTED** |
| 3 | Redistribution rights | ❌ **NOT GRANTED** |
| 4 | Caching rights | ❌ **NOT GRANTED** |
| 5 | Retention rights | ❌ **NOT GRANTED** |
| 6 | Attribution rights | ❌ **NOT DETERMINED** |
| 7 | M-3 provenance authority | ❌ **NOT ESTABLISHED** |
| 8 | Production authorization | ❌ **NOT AUTHORIZED** |
| 9 | Production deployment | ❌ **NOT AUTHORIZED** |
| 10 | IPD authority / IPD mutation | ❌ **OUT OF SCOPE — UNTOUCHED** |
| 11 | D08 dataset-boundary expansion | ❌ **NOT AUTHORIZED** |
| 12 | Acquisition authorization beyond the already-defined route contract | ❌ **NOT AUTHORIZED** |
| 13 | New provider selection | ❌ **NOT AUTHORIZED** |
| 14 | New dataset selection | ❌ **NOT AUTHORIZED** |
| 15 | WPI / PPI authority | ❌ **NOT AUTHORIZED** |
| 16 | RBI source authority | ❌ **NOT AUTHORIZED** |

---

## 14. EFFECTIVE BOUNDARY (§14.8)

> # **D08 Macro dataset boundary = `NAS` / `CPI` / `IIP` — UNCHANGED**

The following are **NOT** added to the D08 boundary by this act:

`GDP` · `REPO_RATE` · `10Y_GSEC` · `TRADE_DEFICIT`

`WPI` / `PPI` remain excluded. `RBI` remains an unauthorized source.

The boundary remains as constituted by `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT-01` (blob `d07f5863…`) unless a **separate** governance decision explicitly changes it.

---

## 15. NON-PRODUCTION STATUS (§14.9)

| Element | Determination |
|---|---|
| This act | Non-production governance record |
| Target ref `origin/main` | Authoritative **non-production** repository |
| Production repository | **OUT OF SCOPE** |
| Production-market-data changes | **NOT AUTHORIZED** |

---

## 16. NO PROVIDER DESIGNATION (§14.10)

> # ❌ **MoSPI REMAINS `NOT DESIGNATED`.**

No provider designation act is created by this act. Technical source identification is **not** converted into provider designation. Technical API accessibility is **not** treated as entitlement.

Provider designation remains a **separate future governance gate**.

---

## 17. NO ENTITLEMENT (§14.11)

> # ❌ **ENTITLEMENT REMAINS `NOT GRANTED`.**

| Right | Status |
|---|---|
| Commercial use | **NOT DETERMINED** |
| Redistribution | **NOT DETERMINED** |
| Caching | **NOT DETERMINED** |
| Retention | **NOT DETERMINED** |
| Attribution | **NOT DETERMINED** |

D3 (accept throttled no-auth) is an **operational** authentication decision. It confers **no** entitlement of any kind.

---

## 18. NO M-3 (§14.12)

> # ❌ **M-3 REMAINS `NOT ESTABLISHED`.**

The following may be carried by the implementation as **implementation-level fields only**. They are **candidates**, not governed M-3 requirements, unless and until a **separate** M-3 governance act establishes them:

* `baseYear`
* `categoryCode`
* `subcategoryCode`
* `indicatorCode`
* `apiContractVersion`
* `retrievalCompleteness`

They **MUST NOT** be described as governed M-3 requirements.

---

## 19. NO PRODUCTION (§14.13)

> # ❌ **PRODUCTION REMAINS `NOT AUTHORIZED`.**

Nothing in this act authorizes production use, production deployment, or production-market-data change.

---

## 20. NO IPD (§14.14)

> # ✅ **IPD REMAINS `UNTOUCHED`.**

Zero IPD references exist in this repository. No IPD mutation was performed or is authorized.

---

## 21. RELATIONSHIP TO THE EXISTING D08 BOUNDARY ACT (§14.15)

| Element | Determination |
|---|---|
| Existing act | `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT-01` — blob `d07f5863…` · 23,517 B · SHA-256 `2fe0efdd…` |
| Amended by this act? | ❌ **NO.** The boundary act is **not modified**. |
| Governing scope of this act | Authority decisions **D1–D4 only** |

### 21.1 Conflict — recorded, not papered over

The boundary act records implementation as unauthorized at lines **33**, **396**, **468**, and **496** (line 396: *"IMPLEMENTATION = `NOT AUTHORIZED`."*; line 468: *"Acquisition implementation ❌ **NOT AUTHORIZED** — Separate authorization"*).

This act grants implementation authority. That is a **direct conflict**, recorded explicitly:

> For the **authorized scope defined in §8 and no wider**, this act governs, and the boundary act's implementation-prohibition is **superseded to that extent**. **Every other provision of the boundary act remains in full force.**

### 21.2 Required future governance action

> **Formal rectification of the D08 Boundary Act** (to align its implementation-status statements with this authority grant) is **NOT performed by this act** and is recorded here as a **required future governance action**. It must not be carried out as a side effect of implementation.

---

## 22. EXACT BASELINE AGAINST WHICH THE DECISION WAS MADE (§14.16)

Independently reverified on `2026-10-05`, immediately before recording these decisions.

| Element | Value |
|---|---|
| Repository | `iips-review-recovered` |
| Remote | `https://github.com/ramkivs/iips-review-recovered.git` |
| **`origin/main` (local)** | **`da9499c2e8ff4d9460ed3957e1213a3332ea511f`** |
| **`origin/main` (remote, `gh api`)** | **`da9499c2e8ff4d9460ed3957e1213a3332ea511f`** ✅ **MATCH** |
| **Tree** | **`9ce0e30fb02399551feef910683bb506de61bede`** ✅ |
| Parent commit | `408c5d4cefe843a5bedaa1a41cb6a04c371c826a` |
| Remote commit date | `2026-10-04T19:59:22Z` |
| Later superseding act | ❌ **NONE** — `main` is at latest |

### 22.1 Governance records verified unchanged

| Record | Blob |
|---|---|
| `NP-08-D08-MACRO-DATASET-BOUNDARY-ACT.md` | `d07f5863…` (23,517 B / SHA-256 `2fe0efdd…`) |
| `NP-08-D08-MACRO-SOURCE-PROVIDER-DESIGNATION-ACT.md` | `8c98cfde…` |
| `NP-08-M5-D91-OUT-OF-SCOPE-DISPOSITION-ACT.md` | `2006786c…` |
| `NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT.md` | `d396e688…` |
| `NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT.md` | `4bb191a6…` |
| `NP-08-D91-RELIEF-MECHANISM-ACT.md` | `f61325ee…` |
| `NP-08-D8-MACRO-SCOPE-DETERMINATION-ACT.md` | `7cd63efb…` |

### 22.2 Standing confirmed before decision

| Check | Result |
|---|---|
| D08 boundary = `NAS / CPI / IIP` | ✅ |
| MoSPI NOT DESIGNATED | ✅ |
| Entitlement NOT GRANTED | ✅ |
| Acquisition NOT AUTHORIZED | ✅ |
| Implementation NOT AUTHORIZED (pre-decision) | ✅ |
| Production NOT AUTHORIZED | ✅ |
| M-3 NOT ESTABLISHED | ✅ |
| IPD untouched (0 refs) | ✅ |
| Macro implementation exists on `origin/main` | ❌ **0 files — ABSENT** |
| New implementation-authority act already exists | ❌ **NONE** (NP-12 authority records contain **no** Macro/D08 reference) |
| Staged / deletions / commits before this act | **0 / 0 / 0** ✅ |

---

## 23. IMPLEMENTATION STATUS — NOT COMMENCED

> # 🔴 **IMPLEMENTATION STATUS: `NOT COMMENCED`**

This act is an **authority decision record**. It does **not** implement, and it does **not** claim that implementation has occurred.

Implementation proceeds only in the next gate:

> **D08 MACRO — IMPLEMENTATION-CHANGE GATE**

using the exact authorized scope (§8), target ref (§10), authentication posture (§11), and toolchain authority (§12) established here.

---

## 24. STOP CONDITIONS CARRIED INTO THE IMPLEMENTATION GATE

The implementation gate **MUST STOP** and report, rather than assume, if any of the following arises:

1. A change outside the §8 eight-item scope becomes necessary.
2. IIP base-year enumeration cannot be retrieved at runtime (no silent hard-coding).
3. The observed runtime contract differs materially from the evidence gate.
4. A credential or token becomes necessary (D3 = no-auth; no credential mechanism exists).
5. A manifest or lockfile change appears necessary for provisioning.
6. Production is implicated.
7. Provider designation or entitlement becomes necessary.
8. D08 boundary expansion becomes necessary.
9. M-3 establishment becomes necessary.
10. IPD mutation appears necessary.
11. Fail-closed or LIVE-only semantics cannot be preserved.

---

## 25. SUMMARY OF AUTHORITY GRANTED

> Authorized: **D1** route-contract implementation (§8) · **D2** creation of the implementation surface on `origin/main` (§9) · **D3** throttled no-auth posture (§11) · **D4** toolchain provisioning for verification only (§12).
>
> Not authorized: provider designation · entitlement · acquisition beyond the defined route contract · commercial use · redistribution · caching · retention · attribution · M-3 · production · IPD · D08 boundary expansion · WPI/PPI · RBI.
>
> Implementation: **NOT COMMENCED**.

---

*End of Decision Act. Recorded against `origin/main` = `da9499c2e8ff4d9460ed3957e1213a3332ea511f` / tree `9ce0e30fb02399551feef910683bb506de61bede`. This act records four explicit Ramki authority decisions and nothing else. **No implementation has occurred. No provider is designated. No entitlement is granted. M-3 is not established. Production is not authorized. IPD is untouched.***
