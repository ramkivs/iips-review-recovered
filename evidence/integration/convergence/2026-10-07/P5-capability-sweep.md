# P5 — CAPABILITY SWEEP — INVESTIGATION REPORT

**IIPS SINGLE-PLATFORM INTEGRATION & CONVERGENCE — P5 only.**
NON-PRODUCTION · READ-ONLY · NO MUTATION

- **Evidence date (UTC):** 2026-10-07. Bases: IRR main `17e234a1` (tree `c6fb24d9…`); IPD main `4d3e1cdc` (tree `db853dc2…`); pinned lineages NP-04 `2e11fa3b` (tree `7c1d516a…`), G24 `6828155` (tree `eb07ea36…`), IPD exec `ea70a8c`, IRR restart `5eba01b` (identities verified in P3/P4).
- **Method:** implementation traces + executed tests (P4 results) + executed durability proofs (P3 results) + targeted code inspection. Filenames/documentation alone were never sufficient.

---

## 1. Capability Matrix

| # | Capability | Repository/Lineage | Implementation | Contract | Runtime Path | Persistence | Identity | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Engine execution | IRR main | 14 sector engine packages; frozen calibration JSON; `EngineRegistry` | `EngineRegistryEntry`, apiVersion 1.0 | `POST /api/engines/:id/execute` → factory → deterministic result + provenance + snapshotRef; 404/400/422 closed | frozen in-repo assets | engine IDs only | **PRESENT AND COHERENT** | `engine-transport.test.ts` in 973-pass suite; registry import list verified |
| 2 | PIT / historical data | IRR main ↔ IPD pin | `PitReadService`, series-aware store, D114 population (pin) | `pitReadContract` (securityId `ISIN:<isin>:<series>`, D01/D02, fail-closed) | client `/api/pit/market-data` → boundary → adapter → pin package | in-memory (populated per process) | securityId only (no tenant/user) | **PRESENT AND COHERENT (within pin boundary)** — main↔pin keying divergence recorded (IPD main is `companyId`-keyed) | `pitRuntimeIntegration`/`pitD114RuntimeIntegration` PASS; pin tests 720/720 |
| 3 | Reports | IRR main (consumer) + IPD pin (store) | reports transport + canonical/composition/artifact + NP-04 binding | `ReportsPersistencePort` (5 ops), reportKey/reportId | `/api/reports/*` → port → dynamic `./persistence` import (fail-closed 503) | NP-04 SQLite (pin, off-main) — **P3 durability PROVEN** | owner `(tenantId,userId)` | **PRESENT AND COHERENT (consumer on main; store off-main)** | reports-* tests PASS (incl. 38/38 with pristine manifest) |
| 4 | Research | IRR main | `MacroContext` + macro transport + MoSPI source | D08 macro route contract | `/api/macro/*` | none (sourced) | guarded reads | **PRESENT AND COHERENT** | tests in 973-pass suite |
| 5 | Intelligence | IRR main | cross-sector intelligence + decision matrix + AI advisory transports | certified DTOs | `/api/cross-sector`, `/api/decision-matrix`, `/api/ai-advisory/*` | none | guarded | **PRESENT AND COHERENT** | tests in suite; IPD counterpart is presentation-only by design |
| 6 | Watchlists | IRR main | event-sourced service over PF-1 journal | NP-09 INT-011a | `/api/watchlists` | PF-1 journal — **P3 durability PROVEN (main implementation)** | `(tenantId, ownerUserId)` server-derived | **PRESENT AND COHERENT** | `watchlists-*` tests PASS; two-process proof |
| 7 | Collaboration | IRR main | journal-backed service/resolvers | family contract | `/api/collaboration*` | PF-1 journal (PROVEN) | same | **PRESENT AND COHERENT** | `collaboration-*` tests PASS |
| 8 | Settings / configuration | IRR main | journal-backed settings service | TD-2/TD-3/TD-7a | `/api/settings*` | PF-1 journal (PROVEN) | same | **PRESENT AND COHERENT** | `settings-*` tests PASS |
| 9 | Governed Screener | IRR main (NP-12 N4); IPD main (C6) | N4 Screen runtime, server-derived 13-member population; IPD `ScreenerService` (C6) | `ScreenDefinition` canonical bytes vs `ScreenerFilter` grades | `POST /api/screener` (IRR); IPD in-process, **mounted route fails closed** (universe uncommissioned) | none | guarded reads | **PRESENT AND COHERENT (IRR)**; IPD screener **DEFERRED** (fail-closed by design) | IRR screener tests PASS; IPD `MultiFactorScreenerSurface` header + tests |
| 10 | Evidence Landing / navigation | IRR main | `EvidenceLanding` + navigation IA | NP-13 governance | `/evidence` UI routes | none | guarded | **PRESENT AND COHERENT** | `EvidenceLanding.test.tsx` PASS (PR #45 promotion) |
| 11 | AI Advisory | IRR main | selective transport (PR #46) | transport contract | `/api/ai-advisory/*`; live-cert tests self-skip without IdP | none | guarded | **PRESENT AND COHERENT (main scope)** — canonical richer line unmerged (see §D) | `ai-advisory-transport.test.ts` PASS; 4 live tests skipped (by design) |
| 12 | User Portfolio (G-2) | IRR main (contract/adapter/transport) + IPD G24 (backend, off-main) | `UserPortfolioPort`→HTTP→`DurablePortfolioStore` | `userPortfolioContract` v1 + G24 wire | `/api/user-portfolios/*`; live seam 503 until IdP audience configured | G24 SQLite — **P3 durability PROVEN**; **G-2 IMPLEMENTATION EXISTS OFF-MAIN** | governed `(issuer,subject)→applicationUserId` + membership tenant | **PRESENT AND COHERENT within pinned lineage; NOT at authoritative-main pair; UI client absent (deliberate)** | IRR user-portfolio tests PASS (wire stub); G24 84/84; two-process proof |
| 13 | API transport | IRR main | Node server `executive-transport.ts` router + 12 domain transports | per-route DTOs | 20+ routes, all guarded | mixed | guarded | **PRESENT AND COHERENT (IRR)**; IPD main: **MISSING (by design — no server)** | suite PASS; IPD `src/server` off-main only |
| 14 | UI transport | IRR main; IPD main | IRR SPA 15 features; IPD restored shell (portfolio functional; others presentation/fail-closed) | typed API clients / view models | IRR browser→server; IPD in-process view models | n/a | IRR guarded; IPD none | **PRESENT (both, different scopes)** | IRR 973 tests + build; IPD 542 tests |
| 15 | Persistence | all | see P3 §1 | — | — | journal/NP-04/G24 PROVEN; IPD main none durable | — | **PARTIAL at authoritative-main pair** (durable IPD stores off-main) | P3 report |
| 16 | Journal | IRR main | PF-1 append-only NDJSON + version header + tail quarantine | TD-2/TD-3 | services layer | filesystem — PROVEN | tenant+owner scoped | **PRESENT AND COHERENT** | P3 Tests 1 & 4 |
| 17 | Identity / tenant boundary | IRR main + G24 | Keycloak→Principal→TenantDirectory; G24 mapping registry; D115 company binding | D-2 Option B; translationBoundary §1–15 | every guarded route; G24 HTTP | tenant store (FS) / G24 tables | explicit chains | **PRESENT AND COHERENT**; **AG-5 company-level mapping UNRESOLVED (recorded)** | secured-executor/executive-read-auth/user-portfolio tests PASS; G24 identity tests |
| 18 | Authorization | IRR main + G24 | `SecuredExecutor` (authn→RBAC→resource→tenant→audit); G24 `PortfolioAuthorizer` dual-gate | G3 boundary | server-side only; client claims never trusted | audit events (G24) | Principal + scope | **PRESENT AND COHERENT** | tests PASS on both sides |
| 19 | Security route protection | IRR main; IPD main | IRR: all API routes guarded (401/403 before data); IPD: donor API routes fail-closed `UnavailableSurface`, OIDC not activated | guardRead / route map | IRR server; IPD shell | n/a | IRR server-derived | **PRESENT AND COHERENT (IRR)**; IPD offline by design | IRR auth tests PASS; IPD shell tests PASS |
| 20 | Cross-repository IPD integration | IRR main → IPD pin | package pin `2e11fa3b` (3 subpaths) + G-2 HTTP contract | pitReadContract / persistence-port / G2 wire | runtime imports + HTTP | pin/G24 stores | securityId / owner / applicationUserId | **PRESENT BUT INCONSISTENT** with authoritative-main doctrine: pin resolves (proven) but **fails against IPD main (`ERR_MODULE_NOT_FOUND` — no exports field)**; G24 off-main | Special investigation A (executable); P1/P3 |
| 21 | D114 integration | IRR main ↔ IPD pin | D114 parsers + non-production population + ingestion loader (pin) | d114-non-production subpath | IRR runtime store population + pin tests | in-memory | n/a | **PRESENT AND COHERENT (pin boundary)** | `wsk_iu6_d114_pit_population` PASS; IRR `pitD114RuntimeIntegration` PASS |
| 22 | Durable recovery | IRR main / pin / G24 | journal replay; SQLite reopen; migration idempotence | TD-3 / migration ledgers | Process B reopen (P3.2 protocol) | PROVEN ×3 | recovery by scope/owner | **PRESENT AND COHERENT (evidence level)** — restart-proof *artifacts* off-main (implementation identical, proven) | P3 §3/§4 |
| 23 | Platform shell | IRR main; IPD main | IRR full app; IPD donor-restored shell | routes.ts donor model | IRR SPA+server; IPD offline SPA | n/a | IRR guarded | **PRESENT (both)** — 23 shared shell paths, only 3 byte-identical (donor divergence recorded) | IRR build+tests; IPD shell tests |
| 24 | Error / fail-closed behavior | both | typed closed error vocabularies; existence-hiding 404; fail-closed surfaces | PIT/G2/Screener contracts | verified executably | n/a | n/a | **PRESENT AND COHERENT** | P3 probes (foreign/missing → undefined/empty); IPD fail-closed surfaces; suites |

**Count toward convergence capability closure (PRESENT AND COHERENT):** #1, #4, #5, #6, #7, #8, #9(IRR), #10, #11, #13(IRR), #14, #16, #17, #18, #19(IRR), #21, #22, #24. Bounded/partial: #2, #3, #12 (pin/lineage-bounded), #15, #20, #23. Deferred at IPD: screener universe. Missing by design at IPD main: server/API/authn.

---

## 2. Special Investigations (P1 findings)

### A. IPD package pin (`2e11fa3b`) — which IRR capabilities depend on it, and behavior against IPD main
- **Dependent IRR capabilities (all on IRR main):** `/api/pit/market-data` (PIT read seam: `ipdPitReadAdapter`, `nonProductionRuntimePitStore` — D114 population), `/api/reports/*` persistence binding (`persistence-port` dynamic import of `./persistence`), the vitest cross-repo integration tests, and the manifest-assertion test. Also `nonProductionPitStore` (`./pit`).
- **Executable proof (this stage):** importing `iips-production-market-data/pit` against a node_modules copy of **IPD main** → **`ERR_MODULE_NOT_FOUND`** (main `package.json` has **no `exports` field** and no root `pit/` path); the same import against the **pin** → resolves (`PitReadService`, `PointInTimeStore`, `buildPitKey`). **The IRR dependency cannot be evaluated against IPD main.** No package files were modified.

### B. G-2 functional coherence (independent of main placement)
- **Coherent:** contract (IRR main) ↔ adapter ↔ G24 HTTP server ↔ authorization chain ↔ durable store, with tests green on both sides (IRR user-portfolio suite; G24 84/84) and a successful end-to-end two-process durability proof through the real governed provisioning chain. Failure behavior is closed and typed; ownership is re-derived from credentials every call; existence is hidden on 404.
- **Boundaries that remain open by design:** no UI client; live seam 503 until the IdP issues the `ipd-user-portfolio-api` audience; provisioning is operator-only. **Not on IPD main** — so functionally coherent as a lineage-pinned capability, not as main-level convergence.

### C. IPD executive transport (`arena/01a0cf86 @ ea70a8c`)
- **Adds:** `src/transports/executive_transport.ts` (295 lines) — a certified Executive computation transport (`computeCertifiedExecutive` over the frozen v1.1 replay baseline) that loads a **full copy of IRR's `iips-platform/` carried inside this IPD branch** (engines, DI, snapshot/replay, evidence pipeline, certification docs) + `tests/executive_recovery_integration.test.ts` (**18/18 PASS**, executed in place) + forensic live-re-execution evidence (byte-identical parity claims vs IRR certified output, SHA-256 `95e15dda…` per its recovery report).
- **Is main's `/executive` equivalent? NO** — main's surface is presentation-only (Path L view-model over offline DTOs; no certified computation). The functional certified-executive capability exists only on this unmerged branch, and it embeds a **cross-repository duplication of the entire IRR platform** inside IPD.

### D. IRR disjoint program line (`gai-impl-canonical` / `phase13-*`, root `7325aed`, no common ancestor with main)
Classification only (no reconciliation attempted):
- **duplicated:** macro transport + MoSPI source; browser OIDC/Keycloak auth; AI-advisory surface family; sector engines (13); hubs/navigation — main carries separately-governed parallel implementations of the same capabilities.
- **superseded:** Phase-13 hardening/qualification records; v1.2 release documentation (tag/release exist on main); engine implementations (main's certified set).
- **unique (not on main, no recorded disposition):** P-1 notification surface, P-2 notes surface, PF-2 roster/trigger wiring, secret-management authority, global search command palette, embedded non-authoritative AI explanation, real-socket dispatch coverage tests.
- **unresolved:** the residual unique work has no in-repo disposition record; the line's tag `v3.0-phase12-certified` remains unreachable from main.

### E. Two screeners — shared contract?
- **NO shared contract.** IRR NP-12 N4: `ScreenDefinition` (canonical byte grammar, digest preimage), server-derived 13-member governed population from the v1.1 replay baseline, execution `executeScreen`, byte-stable responses. IPD C6: `ScreenerFilter` (PE/ROE/margin/grade), `ScreenerCandidate` (grades A+…F), in-process `registerCandidate`/`executeScreen`, universe uncommissioned → mounted route fails closed. Different DTOs, different populations, different keying, no cross-references. They are two distinct capabilities, not one integrated screener.

### F. Three portfolio systems — same product capability?
- **IRR certified reference portfolio** (`/api/portfolio`, `computeCertifiedPortfolio`): frozen engine-snapshot DTO; no user state; presentation of the certified baseline. Not a user product.
- **IRR G-2 durable user portfolio** (`/api/user-portfolios/*` → G24): user-owned, revisioned, SQLite-durable, tenant/member-scoped, broker-agnostic holdings (`UserHoldingInput`), optimistic concurrency. A governed durable product capability (backend off-main; no UI).
- **IPD broker-import portfolio** (BI-07/08, IPD main): browser-side CSV ingestion with broker adapters (Zerodha/Groww/Dhan/FINAPP), atomic merge, idempotency, session-lifetime store. An offline operator tool.
- **Conclusion:** three distinct capabilities with one shared shape note — G24's `SaveHoldingsRequest` reuses IPD main's `UserHoldingInput` type (`frontend/src/features/portfolio/import/types.ts`), the only concrete contract overlap. They are not the same product and are not integrated with each other.

---

## 3. Cross-Repository Consistency Observations

- Identifier spaces are deliberately disjoint and translated only at governed seams: `securityId` (PIT) vs `companyId` (IPD envelopes) vs IRR sector/company IDs vs `applicationUserId` (G24). No identifier equivalence is assumed anywhere (D-2 verified in code).
- The only executable cross-repo integration is IRR main → IPD pin (package) + IRR main → G24 (HTTP contract, stub-tested). There is **no integration path from IPD main to IRR** (shell is donor-derived and fail-closed for API routes).
- Divergences that remain: two screeners (§E), three portfolios (§F), two PIT keyings (pin securityId vs main companyId), two persistence packages on two unmerged IPD branches, duplicated platform copy inside IPD exec branch, duplicated frontend shell (23 paths, 3 identical).

## 4. Identity / Security Observations

- IRR enforces server-side authn/authz on every route family (verified by tests; client claims never trusted; tenant from filesystem directory). IPD main has no activated authn (offline by design); its durable identity chain exists only on G24 (off-main) — verified executable there.
- Fail-closed semantics verified executably at every probed boundary (PIT misses, foreign-owner/tenant, G24 FK enforcement, existence-hiding contract, uncommissioned screener, donor routes).
- No penetration testing performed; no live IdP testing performed (STOP conditions respected).

## 5. Capability Gaps

1. G-2 full-stack closure: UI client absent; live IdP audience deferred (503).
2. IPD main screener universe uncommissioned (fails closed).
3. IPD main: no server/API/authn/durable state (by design — but bounds any single-platform claim at the main pair).
4. AG-5 company-level mapping unresolved.
5. IRR main's 43 legacy regression failures (P4) — capability-adjacent hygiene, not capability absence.
6. Disjoint-line unique capabilities (P-1/P-2/PF-2/search/secret-mgmt) unreconciled.

## 6. P5 Disposition

## **P5 — CAPABILITY STATE PARTIALLY ESTABLISHED**

18 of 24 evaluated capabilities are PRESENT AND COHERENT within their declared boundaries (predominantly on IRR main). The cross-repository capabilities that would constitute single-platform convergence (user portfolio, durable persistence at the main pair, cross-repo integration at authoritative mains) are bounded by off-main dependencies, deliberate deferrals, and unresolved mappings — evidenced, classified, and not counted toward closure.

**END P5**
