# IIPS v3.0 — NP-07 Research Non-Production Qualification Record

## Refreshed Qualification & Durability Reconciliation — No-Auth Baseline (v2.0)

**Program:** IIPS Engineering Standards — Program v3.0
**Workstream:** NP-07 — Research
**Record Identifier:** `NP-07-QUAL-01` — Research Non-Production Qualification (executed) — **v2.0 No-Auth Baseline Refresh**
**Document Type:** QUALIFICATION RECORD — non-production qualification, executed and durably recorded
**Version:** 2.0 — Baseline Refresh (supersedes for publication the v1.0 record of 2026-10-04; that record is preserved unchanged — see §0)
**Original Qualification Date:** 2026-10-04 (execution against `main@ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd`)
**Refresh Date:** 2026-10-13 (Asia/Calcutta) — re-verification and re-execution against the current no-auth IRR baseline `main@6c2c955a9a3ad0e6d896746beb5062980952ba37`
**Gate (original):** `GATE-NP07-CONTROLLED-QUALIFICATION-DURABILITY-R3`
**Gate (refresh):** `REG-09` governance reconciliation, 2026-10-13 (canonical tracker)
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Status:** **QUALIFIED — NON-PRODUCTION / IRR** (scope unchanged; baseline refreshed)

> **This record grants QUALIFICATION only.**
> **ACCEPTANCE IS NOT GRANTED by this record.** Acceptance is granted by the separate act `NP-07-ACCEPT-01`.
> **CERTIFICATION IS NOT GRANTED by this record.** Certification requires a separate certification authority/act.
> **PROMOTION IS NOT GRANTED by this record.** Promotion into an active feature baseline requires separate authority.
> **PRODUCTION READINESS IS NOT GRANTED by this record.**

---

## 0. Dual-ref statement and publication status (read this first)

| Role | Ref | Commit | Durability |
| --- | --- | --- | --- |
| **Qualified implementation + executed evidence** | IRR `refs/heads/main` | **`6c2c955a9a3ad0e6d896746beb5062980952ba37`** (refresh coordinate, 2026-10-13); original execution coordinate `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` (2026-10-04) | **AUTHORITATIVE MAIN — VERIFIED** |
| **v1.0 qualification record (historical)** | IRR `refs/heads/arena/01a0f351-iips-review-recovered` @ `3b5c54c09e06b1e86c93c29ed25508b171591416` | prepared `1a037748…` → `45563a25…`; blob `6c2be92adc57b8a5b9e5e8183dc7d27ecbb251be` (18,310 bytes) | **HISTORICAL — PRESERVED UNCHANGED, NOT AUTHORITATIVE ON `main`** |
| **This v2.0 refresh record** | IRR `refs/heads/main` (published via the established PR workflow under `REG-09`, 2026-10-13) | see publication coordinates in `NP-07-ACCEPT-01` §15 | **MAINLINE PUBLICATION** |

**Relationship to the v1.0 record.** The 2026-10-04 record remains the durable historical act of qualification on its branch; it is **not** claimed to be authoritative on `main`, and it is not edited. This v2.0 record is the mainline publication of `NP-07-QUAL-01`, refreshed only in statements affected by (a) the transition of IRR `main` to the global no-auth baseline and (b) the passage of `main` from `ac8a751c` to `6c2c955`. The qualification **decision and scope are unchanged**.

### Refreshed statements (exhaustive)

1. **Baseline coordinates.** v1.0 recorded `main@ac8a751c` (and a `2e32348f` addendum). Those coordinates are stale for present-tense claims; the refresh coordinate is `main@6c2c955a9a3ad0e6d896746beb5062980952ba37` (merge of PR #76).
2. **No-auth architecture.** v1.0 excluded "live identity / Keycloak / OIDC qualification" as out of scope. Since PR #61 (global no-auth, merge `139c5b8d`; implementation commit `1f7997e5e325d94124f39f7458e27957197cbfb2`, "Remove authentication flow for single-user IIPS", 2026-10-12), IRR has **no live identity layer at all**; the platform runs under the single-user F-1/F-2/F-3 owner-context regime (`H-18`). The three Research surfaces were verified to carry **zero** authentication/identity imports (2026-10-13). The exclusion is restated as: the surfaces run on the no-auth baseline and are **independently verified auth-free**; no identity qualification is claimed or needed.
3. **Blob re-verification at the refresh coordinate** (§1.1).
4. **Re-executed evidence** (§3): the full NP-07 population re-run at the refresh coordinate.
5. **Publication status** (§0 above): the records now publish to `main` under `REG-09`; the C-2 branch-now placement of 2026-10-04 is preserved as the historical placement decision, and its deferred `main` publication is the act authorized separately for 2026-10-13. `GAP-6` (C-1 vs C-2 conventions) is **not** closed by this record.

**All scope, boundary, exclusion and interpretation statements of v1.0 are preserved unchanged** unless listed above.

---

## 1. NP-07 Identity and Qualification Scope

**NP-07 — Research.** The RETAIN scope, verified here and unchanged from v1.0, is exactly three capabilities:

1. **Company Intelligence**
2. **Cross-Sector Intelligence**
3. **Engine Registry**

Bounded to the `/research/*` product boundary. Nothing beyond these three is included. This is the established `Option C-2` scope as carried in the canonical tracker: company and cross-sector qualification included; sector route and `NP-08` Macro excluded — with Engine Registry remaining included exactly as established by `NP-07-QUAL-01` / `NP-07-ACCEPT-01` (its `10/10` = 4 + 6 combined surface + transport population). The refresh neither adds nor removes any surface.

### Scope table (verified at `main@6c2c955`, 2026-10-13)

| Surface | In NP-07 Scope? | Implementation | Route | Evidence |
| --- | --- | --- | --- | --- |
| **Company Intelligence** | **YES** | `frontend/src/features/company/CompanyIntelligence.tsx` — blob `116a45221d7388e0173c635ef3e7e55074477df1` | `/research/company/:id` (`App.tsx` line 40) | blob **byte-identical** to v1.0 baseline; 6/6 executed 2026-10-13 |
| **Cross-Sector Intelligence** | **YES** | `frontend/src/features/cross-sector/CrossSectorIntelligence.tsx` — blob `d2ebcde14d08e3efcad2458826ace7ccd1a3fa1c` | `/research/cross-sector` (`App.tsx` line 42) | blob **byte-identical**; 6/6 executed 2026-10-13 |
| **Engine Registry** | **YES** | `frontend/src/features/engines/EngineRegistry.tsx` — blob `0ad0af7ee061aaebc8e0215e5e4fb662aed03e52` | `/research/engines` (`App.tsx` line 43) | blob **byte-identical**; 4/4 + 6/6 executed 2026-10-13 |
| **Sector Intelligence** | **NO** | **Not implemented** — `frontend/src/features/` contains no sector feature directory | `/research/sector/:id` → `<FeaturePlaceholder surface="Sector" />` (`App.tsx` line 41) | Exclusion intact |
| **NP-08 Macro** | **NO** | Separate workstream (`REG-13`); not a `/research/*` surface | — | Explicitly excluded from NP-07 (preserved; named explicitly per `REG-09`) |
| Other Research surface | **None** | No other `/research/*` route exists | — | `App.tsx` lines 39–43 are the complete `/research` set (v1.0 recorded lines 33–37; the set is unchanged, line numbers shifted) |

**Route wiring verified at `6c2c955`** — `frontend/src/app/App.tsx` blob `5c178829f094c00d1cfcaa1d59f6047fe87b67f0`; navigation `frontend/src/app/navigation.ts` blob `3866b80eb0a74157cb9374e3db2c1b1116848a4a` (Research → Company, Sector, Cross-Sector, Engines). Both files differ from the v1.0-baseline blobs (`ee9222f91bed…`, `d37d3363e8e1…`) only in route-registration content beyond the `/research` set (the no-auth and later surface work); the `/research` five-route set is complete and unchanged in content.

### Blob identity at the refresh coordinate (v1.0 baseline → `main@6c2c955`)

| File | v1.0 recorded blob | `main@6c2c955` | Identical? |
| --- | --- | --- | --- |
| `company/CompanyIntelligence.tsx` | `116a45221d73…` | `116a45221d73…` | ✅ |
| `company/CompanyIntelligence.test.tsx` | `de4031cec1c8…` | `de4031cec1c8…` | ✅ |
| `cross-sector/CrossSectorIntelligence.tsx` | `d2ebcde14d08…` | `d2ebcde14d08…` | ✅ |
| `cross-sector/CrossSectorIntelligence.test.tsx` | `51112d7bada4…` | `51112d7bada4…` | ✅ |
| `engines/EngineRegistry.tsx` | `0ad0af7ee061…` | `0ad0af7ee061…` | ✅ |
| `engines/EngineRegistry.test.tsx` | `01559565a726…` | `01559565a726…` | ✅ |
| `server/engine-transport.test.ts` | `635c29d75833…` | `50ed9f3267e3…` | **DIFFERS** — a one-line comment change made by the no-auth commit `1f7997e5` (2026-10-12); test semantics unchanged (contract still `expect(body.engines.length).toBe(13)`; 6/6 re-executed 2026-10-13) |
| `app/App.tsx` | `ee9222f91bed…` | `5c178829f094…` | **DIFFERS** — registration file; `/research` set complete and unchanged (§1) |
| `app/navigation.ts` | `d37d3363e8e1…` | `3866b80eb0a7…` | **DIFFERS** — registration file; Research entries unchanged |

The three capabilities and their dedicated tests are byte-identical across the whole interval `ac8a751c` → `6c2c955`. Only registration files and one comment line in the transport test changed — and one of those changes is the no-auth transition itself.

---

## 2. Test Population Reconciliation (unchanged from v1.0)

| Capability | Claimed | Discovered | Decomposition | Result |
| --- | ---: | ---: | --- | --- |
| **Company Intelligence** | **6** | **6** | `CompanyIntelligence.test.tsx` — 6 dedicated cases | ✅ MATCH |
| **Cross-Sector Intelligence** | **6** | **6** | `CrossSectorIntelligence.test.tsx` — 6 dedicated cases | ✅ MATCH |
| **Engine Registry** | **10** | **10** | `EngineRegistry.test.tsx` **4** (surface) + `server/engine-transport.test.ts` **6** (registry/discovery transport) | ✅ MATCH |
| **Combined** | **22** | **22** | 6 + 6 + 4 + 6 | ✅ MATCH |

**The "10" is a test count, not an engine count** (preserved interpretation): `4 + 6 = 10` surface + transport cases. The registry contract returns **13** certified engines (`engine-transport.test.ts`: `expect(body.engines.length).toBe(13)`; `certifiedCount` 13 — re-verified 2026-10-13). E2E-030's "10" refers to the 10-engine LTS baseline, a different subject.

---

## 3. Executed Qualification — v2.0 Refresh Run (2026-10-13)

### Environment

| Item | Value |
| --- | --- |
| Node | `v22.22.3` |
| npm | `10.9.8` |
| Test runner | `vitest 2.1.9` (`linux-x64`, `node-v22.22.3`) |
| TypeScript | `5.9.3` |
| Baseline | IRR `main@6c2c955a9a3ad0e6d896746beb5062980952ba37` (tree checked out; lockfile-exact `npm ci`) |
| Executed at | 2026-10-13 (Asia/Calcutta) |

### Refresh run — on the current no-auth baseline (`main@6c2c955`)

| Run | Command | Result |
| --- | --- | --- |
| R1 | `npx vitest run src/features/company/CompanyIntelligence.test.tsx` | **6/6 passed**, exit 0 |
| R2 | `npx vitest run src/features/cross-sector/CrossSectorIntelligence.test.tsx` | **6/6 passed**, exit 0 |
| R3 | `npx vitest run src/features/engines/EngineRegistry.test.tsx` | **4/4 passed**, exit 0 |
| R4 | `npx vitest run server/engine-transport.test.ts` | **6/6 passed**, exit 0 |
| R5 | all four files combined | **22/22 passed**, 0 failed, 0 skipped, exit 0 |
| R6 | `npx tsc --noEmit` | **PASS**, exit 0 |
| R7 | `npm run build` (`tsc -b && vite build`) | **PASS**, exit 0 (`dist/` cleaned after verification) |

The original 2026-10-04 execution (RUN 1 / RUN 2 at `ac8a751c` and `0e13ad4`) is preserved in the v1.0 record and is **not restated as re-executed**. The refresh run above is the qualification evidence for the current baseline.

### Full-suite note

The v1.0 record noted two pre-existing full-suite failures (`product-transport` taxonomy; `pitRuntimeIntegration` IU5R-13), neither NP-07-induced. The `product-transport` taxonomy failure is no longer present in current evidence (`server/product-transport.test.ts` `10/10` pass in the REG-08 focused run, 2026-10-13, tracker §3.4). `pitRuntimeIntegration` IU5R-13 was not re-run by this refresh (out of scope). Full-suite status is outside this refresh's scope; the NP-07 population is **22/22**.

---

## 4. Qualification Dimensions (preserved from v1.0; re-verified at `6c2c955`)

| Capability / Dimension | Verified behaviour | Evidence |
| --- | --- | --- |
| **Company Intelligence — product behaviour** | Answers *"What does the certified platform say about this company, why, and can I verify/replay it?"* Every displayed value has a traceable certified source; **no frontend analytical calculation**; pillar sections show "unavailable" where the certified engine does not expose them — **never fabricated or derived**; certified input metrics shown as SNAPSHOT inputs | Source header, `CompanyIntelligence.tsx` blob `116a4522…` (byte-identical) |
| **Company Intelligence — route/surface integrity** | `/research/company/:id` wired to the real component; loading / error / unavailable states distinguished | `App.tsx` line 40; 6/6 executed 2026-10-13 |
| **Cross-Sector Intelligence — product behaviour** | Uses **CERTIFIED CSIP outputs ONLY**. React performs **only presentational operations** (sort/filter/group/format). **No** ranking, normalization, percentile, opportunity, risk, confidence, comparison, threshold, or allocation logic in the frontend | Source header, `CrossSectorIntelligence.tsx` blob `d2ebcde1…` (byte-identical) |
| **Engine Registry — registry behaviour** | Displays `engineId`, `sectorFamily`, `IES`, `engineVersion`, `calibration`, `provenance`. **Additive and semantically inert** — maps governed registry fields 1:1; handles loading / success / error / empty with no fabrication | Source header, `EngineRegistry.tsx` blob `0ad0af7e…` (byte-identical) |
| **Engine Registry — registration/discovery contract** | `GET /api/engines` returns the certified engine set (13) with provenance; governed dispatch via `POST /api/engines/:engineId/execute`; fail-closed guards: unsupported `apiVersion` → **422**, unknown/uncertified engine → **404 DENIED**, path/body `engineId` mismatch → **400**; dispatch is deterministic | 6/6 executed 2026-10-13 |
| **Product boundary** | NP-07 remains limited to `/research/*`. Sector Intelligence excluded. No adjacent surface (Executive, Portfolio, Evidence, Replay, Decision Matrix, AI Advisory, Reports, Macro) is drawn into NP-07 | verified at `6c2c955` |
| **Authentication posture (refresh)** | The three surfaces and their tests carry **zero** authentication / OIDC / Keycloak references; the baseline is the global no-auth regime (PR #61). No auth-dependent behaviour exists in NP-07 | grep-verified 2026-10-13 |
| **IPD dependency** | **NO IPD DEPENDENCY ESTABLISHED** — see §5 | verified |
| **Protected foundations** | No implementation was changed by this refresh. The gate produced documentation artifacts only | verified |

---

## 5. IPD Dependency — **NO IPD DEPENDENCY ESTABLISHED**

Restated and re-verified 2026-10-13 (IPD `main` `4d3e1cdca3a33da0ec3be8b336b17128108a502c`, unchanged): **0** NP-07 implementation files, **0** shared blobs, **0** `NP-07` token, **0** `EngineRegistry` product-surface references in IPD. The v1.0 §5 token-count discrepancy, disclosed at `NP-07-ACCEPT-01` v1.0 §7.1, is preserved: `CompanyIntelligence` / `CrossSectorIntelligence` strings occur in IPD only in historical/forensic text describing the surfaces as **pruned and NOT restored**.

> ## **NO IPD DEPENDENCY ESTABLISHED.**

---

## 6. E2E-030 / Certification Boundary (preserved)

> ### **E2E-030 does not constitute NP-07 product certification.** This record grants no certification.

E2E-030 is the frozen 10-engine `Program v1.1 LTS` engine certification (canonical HEAD `286f3da6f20080e9bd13cf76cd8dd1608b89debd`, historical). It corroborates the test-population decomposition only.

---

## 7. Known Limitations and Explicit Exclusions

**Limitations**

1. **Sector Intelligence is not implemented.** `/research/sector/:id` resolves to `FeaturePlaceholder`. Outside qualified scope; not claimed.
2. **Presentational-only guarantee** is a design constraint exercised by tests, not separately enforced at runtime (preserved from v1.0).
3. **Single execution environment** for both the original and the refresh runs (Node `v22.22.3` / vitest `2.1.9` / TypeScript `5.9.3`, Linux x86_64).
4. Full-suite status is out of scope for this refresh (§3 note).

**Explicit exclusions (preserved, plus NP-08 Macro named per `REG-09`)**

* No production certification; no production readiness; no production data, live market data, or broker connectivity.
* **Sector Intelligence** `/research/sector/:id` — excluded.
* **NP-08 Macro** (D08/D115 macro workstream) — excluded from NP-07.
* No expansion into **Reports**, **Portfolios**, or production integration.
* No certification of any kind; no promotion implied by this record.
* No IPD dependency and no IPD-side qualification.
* No concurrency / load qualification; no restart / deployment-tier durability qualification (not applicable — read-only presentational surfaces with no owned persistence).
* No live identity qualification — restated under the no-auth baseline: the surfaces carry no identity layer and none is qualified or needed (§0 item 2).

---

## 8. Qualification Decision

The v1.0 qualification decision is **unchanged**: NP-07's three capabilities exist, are routed, and are qualified for the non-production IRR Research scope only. The refresh re-established every material claim against the current no-auth baseline:

* All three capabilities and their dedicated tests are **byte-identical** between `ac8a751c` and `6c2c955`.
* Test populations reconcile exactly (6, 6, 10 = 4+6; combined **22**); all **22** pass at `6c2c955`; typecheck and build pass.
* Product boundary confirmed; Sector Intelligence and NP-08 Macro excluded.
* **No IPD dependency established.**
* Protected foundations untouched; **no implementation was changed** by the refresh.

> ## **NP-07 RESEARCH — QUALIFIED — NON-PRODUCTION / IRR**

> **NP-07 is qualified for the verified non-production IRR Research scope only. This act does not grant acceptance, certification, promotion, or production readiness.**

---

*Recorded under `GATE-NP07-CONTROLLED-QUALIFICATION-DURABILITY-R3` (original) and `REG-09` baseline refresh (2026-10-13). Qualification only. No acceptance, no certification, no promotion, no production readiness. IPD unmutated at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`; IRR `main` application code unmutated at `6c2c955a9a3ad0e6d896746beb5062980952ba37`.*
