# IIPS v3.0 — NP-07 Research Non-Production Qualification Record

## Executed Qualification & Durability Reconciliation

**Program:** IIPS Engineering Standards — Program v3.0
**Workstream:** NP-07 — Research
**Record Identifier:** `NP-07-QUAL-01` — Research Non-Production Qualification (executed)
**Document Type:** QUALIFICATION RECORD — non-production qualification, executed and durably recorded
**Version:** 1.0 — Qualification Decision
**Date:** 2026-10-04
**Gate:** `GATE-NP07-CONTROLLED-QUALIFICATION-DURABILITY-R3`
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Status:** **QUALIFIED — NON-PRODUCTION / IRR**

> **This record grants QUALIFICATION only.**
> **ACCEPTANCE IS NOT GRANTED by this record.** Acceptance requires a separate explicit acceptance act.
> **CERTIFICATION IS NOT GRANTED by this record.** Certification requires a separate certification authority/act.
> **PROMOTION IS NOT GRANTED by this record.** Promotion into an active feature baseline requires separate authority.
> **PRODUCTION READINESS IS NOT GRANTED by this record.**

---

## 0. Dual-ref statement (read this first)

NP-07's qualified **implementation** and this qualification **record** live on different refs. Both are stated precisely:

| Role | Ref | Commit | Durability |
| --- | --- | --- | --- |
| **Qualified implementation + executed evidence** | IRR `refs/heads/main` | **`ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd`** | **AUTHORITATIVE MAIN — VERIFIED** |
| **This qualification record** | IRR `refs/heads/arena/01a0f351-iips-review-recovered` | see §8 | **DESIGNATED BRANCH — VERIFIED** |

The six NP-07 source/test files are **byte-identical** on both refs (verified below), so the execution on `main` is representative of both. The record itself is **not on `main`** and no claim of mainline record durability is made.

### Addendum — `main` advanced during this gate (2026-10-04T07:28Z)

After qualification was executed and before this record was finalized, `main` advanced by one commit:

| | Commit | Note |
| --- | --- | --- |
| Qualified against | `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` | the coordinate used for all execution in §3 |
| `main` tip at record finalization | `2e32348fbd0bf7ab5e38f9bed92e63aa25a10322` | `docs(np-13): publish D2-B operational ref binding and initial evidence decision` |

The advancing commit added **one documentation file** — `docs/integration/NP-13-PA-D2-B-REF-BINDING-EVIDENCE-DECISION-01.md` — an NP-13 governance record with no relationship to NP-07.

**All eight NP-07 artifacts were re-verified byte-identical at `2e32348f…`** (the six source/test files, plus `server/engine-transport.test.ts` and `app/App.tsx`). The qualification therefore remains valid at the new tip.

The qualification coordinate is nonetheless recorded as **`ac8a751c…`**, because that is the commit against which execution actually occurred. It is not restated as `2e32348f…`, which would imply execution that did not happen at that commit.

---

## 1. NP-07 Identity and Qualification Scope

**NP-07 — Research.** The RETAIN scope claimed by the supplied qualification evidence, and verified here, is exactly three capabilities:

1. **Company Intelligence**
2. **Cross-Sector Intelligence**
3. **Engine Registry**

Bounded to the `/research/*` product boundary. Nothing beyond these three is included.

### Scope table

| Surface | In NP-07 Scope? | Implementation | Route | Evidence |
| --- | --- | --- | --- | --- |
| **Company Intelligence** | **YES** | `frontend/src/features/company/CompanyIntelligence.tsx` — blob `116a45221d7388e0173c635ef3e7e55074477df1` | `/research/company/:id` (`App.tsx` line 34) | blob verified on `main`; 6/6 executed |
| **Cross-Sector Intelligence** | **YES** | `frontend/src/features/cross-sector/CrossSectorIntelligence.tsx` — blob `d2ebcde14d08e3efcad2458826ace7ccd1a3fa1c` | `/research/cross-sector` (`App.tsx` line 36) | blob verified on `main`; 6/6 executed |
| **Engine Registry** | **YES** | `frontend/src/features/engines/EngineRegistry.tsx` — blob `0ad0af7ee061aaebc8e0215e5e4fb662aed03e52` | `/research/engines` (`App.tsx` line 37) | blob verified on `main`; 4/4 + 6/6 executed |
| **Sector Intelligence** | **NO** | **Not implemented** — `frontend/src/features/` contains no sector feature directory | `/research/sector/:id` → `<FeaturePlaceholder surface="Sector" />` (`App.tsx` line 35) | Documented as out of qualified scope, not silently included |
| Other Research surface | **None** | No other `/research/*` route exists | — | `App.tsx` lines 33–37 are the complete `/research` set |

**Route wiring verified on `main`** — `frontend/src/app/App.tsx` blob `ee9222f91bed706ffdf867aee72ba0bee2780622`; navigation `frontend/src/app/navigation.ts` blob `d37d3363e8e12a313bbec30f754e05d2fd662762` (lines 29–36: Research → Company, Sector, Cross-Sector, Engines).

### Blob identity across the two refs

| File | `main` | `arena/01a0f351` | Identical? |
| --- | --- | --- | --- |
| `company/CompanyIntelligence.tsx` | `116a45221d73…` | `116a45221d73…` | ✅ |
| `company/CompanyIntelligence.test.tsx` | `de4031cec1c8…` | `de4031cec1c8…` | ✅ |
| `cross-sector/CrossSectorIntelligence.tsx` | `d2ebcde14d08…` | `d2ebcde14d08…` | ✅ |
| `cross-sector/CrossSectorIntelligence.test.tsx` | `51112d7bada4…` | `51112d7bada4…` | ✅ |
| `engines/EngineRegistry.tsx` | `0ad0af7ee061…` | `0ad0af7ee061…` | ✅ |
| `engines/EngineRegistry.test.tsx` | `01559565a726…` | `01559565a726…` | ✅ |
| `app/App.tsx` | `ee9222f91bed…` | `6d9693884a5e…` | **DIFFERS** (branch adds NP-09/10/11 routes) |
| `app/navigation.ts` | `d37d3363e8e1…` | `3f07d43cb471…` | **DIFFERS** (branch adds NP-09/10/11 entries) |

The three capabilities and their tests are identical; only route-registration files differ, and not in any `/research` line.

---

## 2. Test Population Reconciliation

| Capability | Claimed | Discovered | Decomposition | Result |
| --- | ---: | ---: | --- | --- |
| **Company Intelligence** | **6** | **6** | `CompanyIntelligence.test.tsx` — 6 dedicated cases | ✅ MATCH |
| **Cross-Sector Intelligence** | **6** | **6** | `CrossSectorIntelligence.test.tsx` — 6 dedicated cases | ✅ MATCH |
| **Engine Registry** | **10** | **10** | `EngineRegistry.test.tsx` **4** (surface) + `server/engine-transport.test.ts` **6** (registry/discovery transport) | ✅ MATCH |
| **Combined** | **22** | **22** | 6 + 6 + 4 + 6 | ✅ MATCH |

### The "10" is a test count, not an engine count

This was the one ambiguous figure. It is resolved by durable evidence and by execution:

* **Durable corroboration.** `docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` (on `main`) §10 table lists `Engine Registry UI` = **4** tests and `Engine transport HTTP` = **6** tests. `4 + 6 = 10`.
* **Not an engine count.** The current registry contract returns **13** certified engines, not 10 (`engine-transport.test.ts`: `expect(body.engines.length).toBe(13)`). E2E-030's "only 10" refers to the 10-engine LTS baseline at its own HEAD (`286f3da…`), a different subject.
* **Executed.** Both files run together: **10 passed, 0 failed**.

**Interpretation preserved:** the supplied report's "Engine Registry 10/10" is the combined surface + transport/discovery test population. That terminology is preserved here and reconciled explicitly rather than replaced.

---

## 3. Executed Qualification

### Environment

| Item | Value |
| --- | --- |
| Node | `v22.22.3` |
| npm | `10.9.8` |
| Test runner | `vitest 2.1.9` (`linux-x64`, `node-v22.22.3`) |
| TypeScript | `5.9.3` |
| OS | `Linux 6.1.158+ x86_64` |
| Executed at | 2026-10-04T07:20Z–07:25Z UTC |

### RUN 1 — on the qualified implementation ref (`main` @ `ac8a751c…`)

| Run | Command | Result |
| --- | --- | --- |
| 1a | `npx vitest run src/features/company/CompanyIntelligence.test.tsx` | **6/6 passed**, exit 0 |
| 1b | `npx vitest run src/features/cross-sector/CrossSectorIntelligence.test.tsx` | **6/6 passed**, exit 0 |
| 1c | `npx vitest run src/features/engines/EngineRegistry.test.tsx` | **4/4 passed**, exit 0 |
| 1d | `npx vitest run server/engine-transport.test.ts` | **6/6 passed**, exit 0 |
| 1e | all four files combined | **22/22 passed**, 0 failed, 0 skipped, exit 0 |
| 1f | `npm test` (full frontend suite) | **272 passed / 2 failed / 25 skipped** (299 total) |

### RUN 2 — on the record ref (`arena/01a0f351` @ `0e13ad4…`)

| Run | Command | Result |
| --- | --- | --- |
| 2a | the same four NP-07 files | **22/22 passed**, 0 failed, 0 skipped, exit 0 |

The NP-07 suites pass identically on both refs, confirming NP-10/NP-11 work on the branch introduced no NP-07 regression.

### Typecheck and Build (on `main` @ `ac8a751c…`)

| Check | Command | Result | Exit | Detail |
| --- | --- | --- | --- | --- |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | **PASS** | **0** | 0 errors, 0 warnings |
| Build | `npm run build` (`tsc -b && vite build`) | **PASS** | **0** | `dist/assets/index-C41QNMsT.js` 235.03 kB (gzip 68.50 kB); built in 1.39s |

### The 2 full-suite failures are pre-existing and unrelated to NP-07

| Test | Failure | Classification |
| --- | --- | --- |
| `server/product-transport.test.ts` › *Product responses reject taxonomy-resolved categories while permitting all certified engines* | `expected [ 'sector.banking', …(12) ] to include 'sector.telecom'` | **Pre-existing** — product-transport / taxonomy subject; no NP-07 path involved |
| `server/pit/pitRuntimeIntegration.test.ts` › *IU5R-13 the company route is still handled by the company handler* | `expected { companyId: 'Banking-H1', …(10) } to have property "error"` | **Pre-existing** — PIT runtime integration subject (IU-5 / IU-7 lineage); no NP-07 path involved |

Neither failure is in an NP-07 test file. **All 22 NP-07 cases pass.**

---

## 4. Qualification Dimensions

| Capability / Dimension | Verified behaviour | Evidence |
| --- | --- | --- |
| **Company Intelligence — product behaviour** | Answers *"What does the certified platform say about this company, why, and can I verify/replay it?"* Every displayed value has a traceable certified source; **no frontend analytical calculation**; pillar sections show "unavailable" where the certified engine does not expose them (all sectors except Technology) — **never fabricated or derived**; certified input metrics shown as SNAPSHOT inputs | Source header, `CompanyIntelligence.tsx` blob `116a4522…` |
| **Company Intelligence — route/surface integrity** | `/research/company/:id` wired to the real component; loading / error / unavailable states distinguished | `App.tsx` line 34; 6/6 executed |
| **Company Intelligence — qualification tests** | **6/6 passed** — certified decision with pillars; pillar scores only when the engine exposes them; pillars-unavailable (no fabrication); certified input metrics (SNAPSHOT) as a table; evidence + replay entry point; error state on failure | executed |
| **Cross-Sector Intelligence — product behaviour** | Uses **CERTIFIED CSIP outputs ONLY**. React performs **only presentational operations** (sort/filter/group/format). **No** ranking, normalization, percentile, opportunity, risk, confidence, comparison, threshold, or allocation logic in the frontend | Source header, `CrossSectorIntelligence.tsx` blob `d2ebcde1…` |
| **Cross-Sector Intelligence — route/surface integrity** | `/research/cross-sector` wired to the real component | `App.tsx` line 36; 6/6 executed |
| **Cross-Sector Intelligence — qualification tests** | **6/6 passed** — universe overview from certified CSIP data; certified sector ranking table; decision distribution; opportunities and risk flags; presentational ranking sort; error state on failure | executed |
| **Engine Registry — registry behaviour** | Displays `engineId`, `sectorFamily`, `IES`, `engineVersion`, `calibration`, `provenance`. **Additive and semantically inert** — maps governed registry fields 1:1; does not compute scores, reinterpret verdicts, or fabricate versions. Handles loading / success / error / empty with no fabrication | Source header, `EngineRegistry.tsx` blob `0ad0af7e…` |
| **Engine Registry — registration/discovery contract** | `GET /api/engines` returns the certified engine set with provenance; governed dispatch via `POST /api/engines/:engineId/execute`; fail-closed guards: unsupported `apiVersion` → **422**, unknown/uncertified engine → **404 DENIED**, path/body `engineId` mismatch → **400**; dispatch is deterministic (same requestId + inputs → same `snapshotRef`) | 6/6 executed |
| **Engine Registry — qualification tests** | **4/4** surface + **6/6** transport = **10/10 passed** | executed |
| **Product boundary** | NP-07 remains limited to `/research/*`. `App.tsx` lines 33–37 are the complete `/research` set. Sector Intelligence is a placeholder and is **excluded**. No adjacent surface (Executive, Portfolio, Evidence, Replay, Decision Matrix, AI Advisory) was drawn into NP-07 | verified |
| **IPD dependency** | **NO IPD DEPENDENCY ESTABLISHED** — see §5 | verified |
| **Protected foundations** | No protected foundation was modified by this gate. **No implementation was changed.** The gate produced exactly one documentation artifact | verified |

---

## 5. IPD Dependency — **NO IPD DEPENDENCY ESTABLISHED**

Verified, not assumed, and not inferred from architecture:

| Check | Result |
| --- | --- |
| NP-07 filename hits in IPD (`main`) | **0** |
| NP-07 content hits in IPD (`main`) | **0** |
| `CompanyIntelligence` in IPD | **0** |
| `CrossSectorIntelligence` in IPD | **0** |
| `EngineRegistry` in IPD (product surface) | **0** |
| IPD `main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — **UNCHANGED**, worktree clean |

> ## **NO IPD DEPENDENCY ESTABLISHED.**

No IPD requirement was manufactured. The supplied report's "no IPD dependency" statement is **confirmed**.

---

## 6. E2E-030 / Certification Boundary

`docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` is present on `main` (and on many branches). Its scope was read exactly, not extended by inference:

* **Certification decision:** *"**CERTIFIED — 10-ENGINE LTS E2E SCOPE ONLY**"*
* **Certification scope:** `IES-006…015` — the exact frozen **10-engine `Program v1.1 LTS` baseline**
* **Canonical certified HEAD:** `286f3da6f20080e9bd13cf76cd8dd1608b89debd` (2026-09-04) — a **historical** HEAD, not the current `main` tip
* **Mentions of NP-07 subject matter:** `Company Intelligence` **0**, `Cross-Sector Intelligence` **0**, `RETAIN` **0**. The single `Engine Registry` reference is to `iips-platform/src/integration/EngineRegistry.ts` (a library taxonomy file), not the NP-07 UI surface

> ### **E2E-030 does not constitute NP-07 product certification.**

E2E-030 is engine-LTS certification of the 10-engine baseline. **NP-07 qualification remains distinct from certification.** This record grants no certification.

E2E-030 is nonetheless useful as a **durable corroborating source** for the test-population decomposition (§10 table: Engine Registry UI 4, Engine transport HTTP 6; and its closing note: *"Plus existing `CompanyIntelligence 6/6`, `CrossSector 6/6`…"*). It corroborates; it does not qualify.

---

## 7. Known Limitations and Explicit Exclusions

**Limitations**

1. **Sector Intelligence is not implemented.** `/research/sector/:id` resolves to `FeaturePlaceholder`. It is outside the qualified scope and is not claimed.
2. **Presentational-only guarantee is a design constraint, not a runtime guarantee enforced by tests.** The three surfaces are governed to consume certified outputs only and perform no analytical computation; this is asserted in source headers and exercised by the executed cases, but is not separately enforced at runtime.
3. **The full frontend suite carries 2 pre-existing failures** (`product-transport` taxonomy; `pitRuntimeIntegration` IU5R-13). Neither is NP-07-induced; neither is closed by this record.
4. **Single execution environment.** Results were produced on Node `v22.22.3` / vitest `2.1.9` / TypeScript `5.9.3` on `Linux 6.1.158+ x86_64`. Reproducible from the stated coordinates; not re-run on a second machine.
5. **The qualification record is not on `main`.** See §0.

**Explicit exclusions**

* No production certification.
* No production readiness.
* No production data, live market data, or broker connectivity.
* No acceptance, and no promotion into an active feature baseline.
* No concurrency / load qualification.
* No restart / deployment-tier durability qualification (not applicable — NP-07 is a read-only presentational Research surface with no owned persistence).
* No live identity / Keycloak / OIDC qualification.
* No IPD dependency, and no IPD-side qualification.
* No Engine Registry **certification** — the registry's *qualification* here is a product-surface and discovery-contract qualification only; E2E-030's engine certification is a separate, differently-scoped act.

---

## 8. Qualification Decision

The supplied NP-07 RETAIN qualification report was treated as **evidence to verify**, not as durable state. Every material claim in it was independently re-established against current repository evidence and re-executed:

* All three capabilities exist, are routed, and are byte-identical across the two refs.
* Test populations reconcile **exactly**: 6, 6, and 10 (4 + 6) — combined **22**.
* All **22** cases pass on both the qualified implementation ref (`main`) and the record ref.
* Typecheck and build pass.
* Product boundary confirmed; Sector Intelligence excluded.
* **No IPD dependency established.**
* Protected foundations untouched; **no implementation was changed**.
* E2E-030 boundaries respected.

> ## **NP-07 RESEARCH — QUALIFIED — NON-PRODUCTION / IRR**

> **NP-07 is qualified for the verified non-production IRR Research scope only. This act does not grant acceptance, certification, promotion, or production readiness.**

---

*Recorded under `GATE-NP07-CONTROLLED-QUALIFICATION-DURABILITY-R3`. Qualification only. No acceptance, no certification, no promotion, no production readiness. IPD unmutated at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`; IRR `main` unmutated at `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd`.*
