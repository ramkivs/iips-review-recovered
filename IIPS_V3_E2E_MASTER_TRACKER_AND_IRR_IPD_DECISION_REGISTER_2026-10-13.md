# IIPS v3.0 — E2E Master Tracker and IRR/IPD Program Authority Decision Register (2026-10-13)

| Field | Value |
|---|---|
| Canonical Tracker Path | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` |
| Program Authority (PA) | **Ramki** — single owner, sole user, and Program Authority of the single-user personal-use IIPS platform |
| Primary Repository (IRR) | `ramkivs/iips-review-recovered` (`refs/heads/main`) |
| Related Repository (IPD) | `ramkivs/iips-production-market-data` (`refs/heads/main` at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`, tree `db853dc21d01162e69b0e1211dbea1cb5c5f72b1`) |
| Pre-REG-08 IRR Baseline | Commit `f970028cf633f561c225d66ae4b3864f48afe656`; root tree `bab9782ed104567e571abccc350c75760ff35dca` (merge of PR #75) |
| Last Updated | `2026-10-13` (UTC) — `REG-11` Gate B R1/R2 **PA disposition recorded: `OPTION C — RETAIN DEFERRAL`** (effective on durable publication + independent remote verification; see §11); prior: PA decision request (§10), Gate B decision-input record `NOT DECISION-READY` (§9), Gate B investigation (§8), `AD-20` bounded disposition (§7) and additive governance reconciliation (§6) |

---

## 1. Repository Baselines and Cross-Repository Dependency Summary

### 1.1 Verified Repository Baselines
- **IRR (`ramkivs/iips-review-recovered`):** Default branch `refs/heads/main`; pre-`REG-08` baseline commit `f970028cf633f561c225d66ae4b3864f48afe656` (tree `bab9782ed104567e571abccc350c75760ff35dca`); 2 annotated tags (`program-v1.2.0` → `5decdca9`, `v3.0-phase12-certified` → `7325aeda`); PRs `#1–#75` merged prior to `REG-08` (`PR #76`).
- **IPD (`ramkivs/iips-production-market-data`):** Default branch `refs/heads/main` at `4d3e1cdca3a33da0ec3be8b336b17128108a502c` (tree `db853dc21d01162e69b0e1211dbea1cb5c5f72b1`); 32 remote heads, 4 lightweight tags, 6 PRs (`#1–#4` merged to `main`; `#5–#6` merged to `arena/01a0e6d9-iips-production-market-data`). Untouched by `REG-08`.

### 1.2 Cross-Repository Dependency Matrix

| Capability / Surface | IRR Surface (`main`) | IPD Target / Lineage | Pin / Reference Mechanism | Identity / Security-ID Regime | Current Operational & Governance Posture |
|---|---|---|---|---|---|
| **PIT & D114 Non-Production Read Seam (`REG-02` / `G1-B2` / `AD-02`)** | `frontend/server/pit/ipdPitReadAdapter.ts` (+ 3 pit test files + `executive-transport.ts` Company read enrichment) | IPD `refs/heads/np04-governed-persistence-windows@2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (`./pit`, `./d114-non-production`) | `frontend/package.json` git pin `#2e11fa3b...` | IRR `companyId` (`CMP-01`) mapped locally in `ipdPitReadAdapter.ts` to `ISIN:<isin>:EQ` | **Narrowly Admitted (`AD-02`)** for the 5 named files only; `AD-06` (`2e11fa3b` provenance) **RECONCILED 2026-10-13** (lineage + domain role; `REG-03`, §6); live `/api/pit/company/:companyId` (`pit-transport.ts`) **retained (`Q1`) but NOT admitted (`P4`) — activation requires a separate explicit gate**. |
| **Governed Reports (`REG-11` / `NP-06` / `D-3` / claimed `AD-01` / `F-4`)** | Current backend/persistence sources under `frontend/server/reports/`; valid API routes dispatch to `reports-transport.ts` and fail closed | IPD `np04-governed-persistence-windows@2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (`./persistence`, artifact/report domain) | Physical IRR package pin + computed `./persistence` specifier; declared `IIPS_NP04_DATABASE_PATH` (actual deployment value unverified) | Reports expects principal-derived `(tenantId, userId)`; F-3 supplies `(tenantId, ownerUserId)` with distinct semantics; no D-2 §8 binding | Valid operations remain source-level HTTP `503 owner-context-unavailable`. D-1 persistence-domain fit is **PROVEN** only; Reports consumer admission and F-3 identity binding are **NOT ESTABLISHED**; direct aliasing conflicts with F-3 exclusions. PR #42/D-1 P1 remains unresolved. G2-2 AD-01 is a candidate claim with operative effect **NOT ESTABLISHED** (PR #51 merged as draft; PR #53 post-merge C01 fail). No Reports UI/no-auth port was found at current `main` or the exact D-3 branch tree; prior `Reports.tsx` pointer corrected in §8. |
| **Durable User Portfolios (`REG-12` / `G-2` / `AD-03` / `AD-04` / `F-4` / `AG-5`)** | `frontend/server/user-portfolio/*`, `user-portfolio-transport.ts`, `executive-transport.ts:832-841`, `frontend/src/features/user-portfolios/*` | IPD `refs/heads/arena/01a0e6d9-iips-production-market-data@6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (Class B G24 SQLite store & HTTP handler; ancestor `0dab1221...`) | `G2_LINEAGE.commit = '6828155...'` (`AD-03` reference only, not package pin) | IRR F-3 `(owner-7f3a91c2, irr-domain-4b82d6e1)` vs IPD G24 `TenantScope` (`tenant_memberships`) + IRR `companyId` vs IPD free-text ticker (`RELIANCE`, `TCS`) | **Fenced at HTTP `503 owner-context-unavailable` (`F-4` / `F-5`)**. Dispatch not admitted (`P3`); `a0ab5a34` not ratified (`P2` / `AD-20` OPEN); G24 off IPD `main`; no `D-2` §8 owner or `companyId` translation contract. |
| **Journal-Backed Owner Surfaces (`REG-10` / `NP-09`, `NP-10`, `NP-11` / `F-3`)** | `frontend/server/{watchlists,collaboration,settings}/*`, `persistence/persistence-service.ts`, `owner-context-{carrier,resolver}.ts` | **None (100% IRR-resident Class C `PF-1` NDJSON journal)** | Server-owned `IIPS_OWNER_CONTEXT_PATH` (`owner-context.json`, SHA-256 `d5a79efb...`) + `IIPS_DATA_DIR` (`.iips-data/`) | Governed F-1/F-2 pair: `ownerUserId = "owner-7f3a91c2"`, `tenantId = "irr-domain-4b82d6e1"` | **`VERIFIED` on `main` (`PRs #64–#70`)**. Fully independent of IPD. |
| **Operator Drop (`REG-06` / `NP-05`)** | None in IRR | IPD `main@4d3e1cdc`: `src/operator_drop/parser.ts`, `tests/wsb_operator_drop.test.ts` | None (not exported in `package.json`) | Unqualified `symbol` / `isin` (`RawMarketRecord`) | **Tested IPD library primitive only** (`REG-06` decided 2026-10-13: product admission **DEFERRED**, fail-closed); internal OQ failover-harness references exist in IPD; not an admitted product capability. |

---

## 2. Consolidated Program Authority Decision Register (`REG-01` – `REG-13`)

*Controlled Status Vocabulary: `DECISION REQUIRED`, `DECIDED`, `AUTHORIZED`, `IMPLEMENTED`, `PUBLISHED`, `VERIFIED`, `BLOCKED`, `UNVERIFIED`, `DEFERRED`, `CLOSED`.*

| Decision ID | Title | Area | Repo(s) | Governing Record / Ref / Commit / PR | Current Status | Evidence Class | Exact Scope | Explicit Exclusions / Non-Scope | Dependencies / Blockers | Required Next Action |
|---|---|---|---|---|---|---|---|---|---|---|
| **REG-01 (`G1-B1/B3`)** | Program Authority Host Selection (`IRR`) & Non-Production Taxonomy (`sector.capital-markets`) | Area A / Baseline | IRR | `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md` (`857d1451`), `IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_BOUNDARY.md` (`5f341ac6`), `main@80078995` (PR #49) | `PUBLISHED` | `Verified` | Establishes `IRR` as non-production application integration host and `sector.capital-markets` as canonical ID. | Grants no implementation authority and no IPD provider authority. | Header banner of `857d1451` still says `PARTIALLY CLOSED` (`G2-2` `H-1`/`H-2`). | Optional PA-directed additive status erratum (`H-1`/`H-2`). |
| **REG-02 (`G1-B2` / `AD-02`)** | Narrow Non-Production Admission of IPD `./pit` & `./d114-non-production` at `2e11fa3b` | Area A | IRR, IPD | `docs/integration/IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md` (blob `2803c1c2`, published by commit `800789957`, 2026-10-09), `IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md` (`2f89bbc9`, PR #51 `eb05e25f`, PR #53 `3064a90f`), [`IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md`](docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md) §2 (`2026-10-13`) | `PUBLISHED` / `RECONCILED` (`2026-10-13`; see §6) | `Verified` | Admits non-production consumption of `./pit` and `./d114-non-production` at pin `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` for the 5 named IRR server/test files (`AD-02`); admission preserved **unchanged**. | Excludes `/api/pit/company/:companyId` live route & `pit-transport.ts` (`P4`), `PR #42` `+6/-4` diff to `ipdPitReadAdapter.ts` (`K2`), `./persistence`, and production use. Route activation requires a separate explicit gate. | Historical banners in `2803c1c2` / `2f89bbc9` (`NOT IN FORCE` / `NOT APPROVED FOR MERGE`) are **stale as to publication & effectiveness only** — additively clarified `2026-10-13` (H-2/H-3/H-14); historical files preserved unchanged. | Disposition executed `2026-10-13`: P4 route **NOT ADMITTED / retained** (activation requires a separate explicit gate). Keep fail-closed; no further action. |
| **REG-03 (`G2-2-AD-06`)** | IPD Pin `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` Provenance & Main-Admission Disposition | Area A / Area H | IPD, IRR | `IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md` §1 `AD-06` (`C14`), IPD `np04-governed-persistence-windows@2e11fa3b`, IPD `arena/01a0f839@26061859`, [`IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md`](docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md) §3 (`2026-10-13`) | `DECIDED` — `AD-06` **RECONCILED** at lineage & domain-role level (`2026-10-13`; see §6) | `Verified` | Pin line provenance established: `d61ff9c` (on IPD `main` tip `4d3e1cd`) + `3137426`, merged `bd5229d`, exposed `2e11fa3` (Ramaki, 2026-10-02); distinct from G24 portfolio line (`0dab122` → `8c99627` → `d4fdb33` → `6828155e`); shared merge-base `246cb94`; both lines descend from IPD `main` tip. Hosting/admission boundary = `D-1` Option C (pin = artifact/report domain; `6828155e` = portfolio domain reference `AD-03`). | No merge, cherry-pick, promotion, re-pin or replacement of either persistence implementation; neither ref admitted to IPD `main`; no package/API, identity or security-boundary reconciliation (D-1 §7–§9). | **Preserved unresolved:** `src/persistence` implementations remain divergent & non-interchangeable (`AD-20` / `REG-11` / `REG-12` open); IU-6 repin rationale unrecorded in any act (UNPROVEN — no lineage invented); act `26061859` coverage of IRR PR #42 NOT ESTABLISHED (`Q2`). | Keep both refs preserved as decided. Convergence of the two persistence implementations remains owned by `REG-11`/`REG-12` (`AD-20` OPEN). |
| **REG-04 (`NP-01-HIST`)** | Phase 14.1 Workflow Retrospective Historical Recognition | Area B | IRR | `docs/integration/PHASE14.1-RETROSPECTIVE-HISTORICAL-RECOGNITION.md` (PR #37 `a794c0fa`), `refs/heads/phase14.1-recovery-deposit@c115d1f49454a171c24ec61bab5e28f0ceea1df5` (PR #36) | `CLOSED` | `Verified` | Recognizes commit `52315b29` (archived in `v3.0-phase14.1-certified-snapshot.tar.gz` at `c115d1f4`) as a historical milestone (`HISTORICAL / NON-CONVERGED — NOT ON MAIN`). | Explicitly withholds `main` promotion, runtime admission, and product convergence. | None. | Keep `phase14.1-recovery-deposit@c115d1f4` preserved intact. |
| **REG-05 (`NP-01-DISP`)** | Phase 14.1 Workflow Product Convergence vs. Permanent Retirement Disposition | Area B | IRR | `PHASE14.1-RETROSPECTIVE-HISTORICAL-RECOGNITION.md` §M–§P, `iips-platform/src/distributed/WorkflowRuntime.ts`, [`IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md`](docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md) §4 (`2026-10-13`) | `DECIDED` — **Workflow = `HISTORICAL-ONLY`** for the current product baseline (`2026-10-13`; see §6) | `Verified` | Workflow is historical-only under `H-18` single-user no-auth scope; `NP-01` convergence not commissioned. Evidence check confirmed **no** separately approved, compatible no-auth/F-3 Workflow design gate exists (global no-auth PR #61 grants none; retrospective §O requires separate future authority). | The archived snapshot at `c115d1f4` (OIDC/Keycloak-dependent: `secured-executor.ts`, `keycloakAdapter.ts`, `admin-transport.ts` — all absent from `main`) is **not restored**; no `/workflows` route mounted; `WorkflowRuntime.ts` presence ≠ admission; REG-04 historical recognition not reopened. | None for the current baseline. | Any future Workflow product work (incl. no-auth/F-3 re-architecture) requires its own explicit design gate — **deferred, not commissioned**. |
| **REG-06 (`NP-05`)** | Operator Drop (`src/operator_drop/parser.ts`) Capability Disposition | Area C | IPD, IRR | IPD `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c`: `src/operator_drop/parser.ts` (`c9950cd0`), `tests/wsb_operator_drop.test.ts` (`1ef0fd7f`), [`IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md`](docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md) §5 (`2026-10-13`) | `DECIDED` — internal primitive preserved; product admission **`DEFERRED`** (fail-closed) (`2026-10-13`; see §6) | `Verified` | `OperatorDropParser` remains an internal IPD library primitive (in-package OQ failover-harness references only: `src/oq/synthetic_failover.ts`, `oq_suite_runner.ts:294`; 0 product/runtime ingestion callers; 0 IRR consumers; no `exports`/`main` in IPD `package.json`). Product admission deferred: no approved manual-ingestion product requirement in authoritative evidence (Block 3M-A identity-bypass record is IPD non-production qualification only; D114 stage-5 leaves `AD-17`/`M-2` NOT AUTHORIZED). | No runtime callers, no package exports, no PIT writes, no company/security-identifier mappings; **no IPD implementation code changes**. Promotion would require PIT write integration, series-qualified ISIN resolution and package export — none authorized. | None. | Keep as tested IPD library primitive; revisit only on an approved manual-ingestion product requirement + explicit admission gate. |
| **REG-07 (`IRR-TEST-HYGIENE`)** | Legacy Platform Regression Remediation (`49` Windows / `43` Linux Failures: `42` Family A + `1` A13 + `6` CRLF) | Area D | IRR | `evidence/integration/integrated-verification-2026-10-11-remediation/{REMEDIATION-REPORT,FINAL-INTEGRATION-READINESS}.md`, `main@e2cda00b` (PR #54, code head `cb1c75d`) | `VERIFIED` | `Verified` | Remediated all 11 `program-v2.0-*.test.ts` 13-engine factory maps (`42` failures), `np12-n4-screen-producer.test.ts` A13 pathspec + blob pin (`1` failure), and `.gitattributes` LF rules (`6` CRLF failures); `656/656` pass in full-history LF & CRLF clones. | `A13` requires full git history (`5ca181c`); `57` pre-existing test-tree TS errors across 22 untouched test files remain out of scope. | In shallow clones (`--is-shallow-repository=true`), `A13` (`ok 309`) fails loudly unless `5ca181c` is fetched (`655/656`). | Preserve PR #54 remediation on `main`; do not re-open. |
| **REG-08 (`IRR-UI-HYGIENE`)** | Bounded IRR Frontend UI Hygiene (`ExecutiveDashboard.tsx` Canonical Engine IDs + `AiAdvisory.tsx` 13-Sector Selector) | Area D | IRR | [`docs/integration/IIPS_v3.0_REG08_BOUNDED_UI_HYGIENE_PA_DECISION_2026-10-13.md`](docs/integration/IIPS_v3.0_REG08_BOUNDED_UI_HYGIENE_PA_DECISION_2026-10-13.md) (blob `41f315ae4f39419a8041fbd329ca8e038c853b73`); `ExecutiveDashboard.tsx` (`cf7e79ba...`); `AiAdvisory.tsx` (`65f392d6...`); PR **#76** | `CLOSED` (`CLOSED / DURABLE / REMOTELY VERIFIED` upon PR #76 merge & verification; see §3) | `Verified` | PA `APPROVED — bounded implementation authorized` (`2026-10-13`): (1) `ExecutiveDashboard.tsx` maps all 13 sectors to canonical `engineId`s (`sector.capital-markets`, `sector.telecom`, `sector.auto`, `sector.materials`, etc.); (2) `AiAdvisory.tsx` exposes all 13 canonical sectors in its `<select>`; (3) focused regression tests added (`33/33` pass, `tsc --noEmit` exit `0`, `npm run build` exit `0`). | Unrelated `routes.ts:27` `admin` constant left untouched; zero server, engine, persistence, API, or IPD changes. | None. | Completed via PR #76; protect as part of active IRR baseline (§4). |
| **REG-09 (`NP-07`)** | Research Surface (`/research/company/:id`, `/research/cross-sector`, `/research/engines`) Qualification & Acceptance (`Option C-2`) | Area E | IRR | Off-main historical: `arena/01a0f351-iips-review-recovered@3b5c54c0` — `IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md` (`NP-07-QUAL-01` v1.0, blob `6c2be92a`), `IIPS_v3.0_NP07_RESEARCH_ACCEPTANCE_AND_BASELINE_ADMISSION.md` (`NP-07-ACCEPT-01` v1.0, blob `1b2df7a7`). **Refreshed v2.0 records published on `main`** (same paths; [`docs/integration/IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md`](docs/integration/IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md), [`docs/integration/IIPS_v3.0_NP07_RESEARCH_ACCEPTANCE_AND_BASELINE_ADMISSION.md`](docs/integration/IIPS_v3.0_NP07_RESEARCH_ACCEPTANCE_AND_BASELINE_ADMISSION.md)) | `PUBLISHED` — refreshed & published `2026-10-13` (`CLOSED / DURABLE / REMOTELY VERIFIED` upon merge & post-merge verification; see §6) | `Verified` | `NP-07-QUAL-01` / `NP-07-ACCEPT-01` refreshed against the current no-auth baseline (`main@6c2c955`) and published via PR. Established `Option C-2` scope preserved exactly: company + cross-sector qualification included (Engine Registry included as established); **excluded:** unmounted `/research/sector/:id`, `NP-08` Macro, Reports, Portfolios, production integration. Refresh evidence: 22/22 focused tests, `tsc --noEmit` 0, `npm run build` 0; 6/6 dedicated blobs byte-identical `ac8a751c` → `6c2c955`. | v1.0 records preserved unchanged on `arena/01a0f351` — **not claimed authoritative on `main`** (they are historical); no certification, no production readiness; GAP-6 (C-1/C-2) not closed; acceptance decision date remains 2026-10-04 (not re-dated). | None. | Completed via this publication; protect as accepted non-production baseline (§4). Re-open only on scope change. |
| **REG-10 (`PF-1` / `F-3`)** | Class C Journal Persistence (`D-1 ext`) & Non-Auth Owner-Context Qualification (`NP-09`, `NP-10`, `NP-11`) | Area E | IRR | `D1-JOURNAL-PERSISTENCE-DOMAIN-EXTENSION.md` (`11df4d03`), `IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` (`PR #68` `a9594957`), `..._F3_IMPLEMENTATION_AND_QUALIFICATION_RECORD.md` (`PR #69` `2f6ee7a0`), `..._F3_BROWSER_ACCEPTANCE_RECORD.md` (`PR #70` `0ff644ed`); off-main `arena/a2df3b85@6f521f91` | `VERIFIED` | `Verified` | Establishes `owner-7f3a91c2` / `irr-domain-4b82d6e1` carrier (`IIPS_OWNER_CONTEXT_PATH`), qualifies `NP-09` Watchlists, `NP-10` Collaboration, and `NP-11` Settings across separate OS processes (`owner-context-restart.test.ts`) and real Chromium browser (`PR #70`). | Standalone `persistence-restart-proof.test.ts` on `arena/a2df3b85@6f521f9188bff4fb6dcae0acd9f35b2bc580a5e8` remains off-main; `F6_INVENTORY_AUTHORIZED` and `TD-7b` remain `DEFERRED` / `DECISION REQUIRED`. | None for `NP-09/10/11` on `main`. | Protect completed `F-3` / `NP-09..11` work on `main`. |
| **REG-11 (`NP-06` / `F-4`)** | Governed Reports owner-context binding, D-1/PR #42 P1, qualification, and admission | Area F | IRR, IPD | D-1/D-2/D-3; AD-20 (PR #78 / `39d03d6…`); PR #42 (merge `47edf6f…`); G2-2 candidate AD-01 (PR #51 / `eb05e25…`; PR #53 / `3064a90…`); effective F-3 act/qualification (PRs #68–#70); accepted Reports branch `arena/01a0f1b3@6a8afbb2…`; Gate B decision-input record (§9); Gate B R1/R2 PA decision request (§10); **Option C disposition (§11)** | **BLOCKED / DEFERRED** — bounded investigation recorded in §8; decision-readiness determination (`NOT DECISION-READY`) recorded in §9; **PA disposition `OPTION C (RETAIN DEFERRAL)` recorded 2026-10-13 (§11)**: R1/R2 remain deferred; no F-3-to-Reports binding or product admission | Mixed: `PROVEN`, `DECIDED`, `UNPROVEN`, `CONFLICTING`, `DEFERRED` | D-1 designates the NP-04 artifact/report persistence domain and current IRR pin `2e11fa3…`; this proves technical persistence fit only. Reports expects principal-derived `(tenantId,userId)`; F-3 supplies partition-only `(tenantId,ownerUserId)`. No D-2 §8 contract exists. Current valid `/api/reports*` operations return source-level `503 owner-context-unavailable`. §9 adds: the artifact/report **ownership-source authority** is not recorded anywhere (pin lineage carries 0 `evidence/np04` paths; its cited `R2`/`C4` decisions are unlocated; the IRR NP-04 boundary act is a non-authoritative transfer copy), so 8 of the 15 D-2 §8 elements are unresolved/unestablished (3 established, 2 partial, 2 structural/negative-only). | No direct identity equivalence; no Reports pin/consumer admission from D-1 or AD-02; no no-auth Reports implementation authority; no F-7 qualification for the F-3 pair; no Reports UI/no-auth port or UI admission; no production. `PR #42` remains an unresolved historical authority conflict (P1). Exact IPD act `26061859…` does not cover PR #42; coverage by another act remains NOT ESTABLISHED. G2-2 AD-01 operative effect is NOT ESTABLISHED. PA Option C (§11) decides: R1.1 **NOT ESTABLISHED** on the examined evidence; the F-3 pair **must not** be directly copied or aliased into Reports `(tenantId,userId)` absent an explicitly authorized, evidence-backed identity/security contract; **no** F-2 scope extension; **no** Reports-specific declaration, value act, or D-2 §8 contract created; R3 and R4 remain separate open gates; Gate A separate and open; no implementation/package/route/UI/runtime-config/production authorization; fail-closed retained (source-level `503` recorded baseline — no live-deployment claim). | **Next:** R1/R2 re-entry requires the ownership-source authority and contract semantics named in §11 (the deferral lifts only through an explicitly authorized, evidence-backed identity/security contract); take **R3** (Reports pin/consumer admission) and **R4** (`P1`) as their own separate gates; then separate implementation authority, reproducible F-7 qualification, acceptance/admission, and any route/UI gate. Keep 503. Gate A is not a prerequisite to Gate B. **R4 update (`2026-10-13`, §12):** the R4 evidence question is **RESOLVED — Outcome B, conflict ESTABLISHED** (`docs/integration/IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md`); R4 stays **OPEN** pending the explicit PA disposition (R4-A/R4-B/R4-C, §12.2); nothing else changes. **R4-B decision packet prepared (`2026-10-13`, §13):** minimum remediation scope and verification bar fixed in `docs/integration/IIPS_v3.0_REG11_R4_B_REMEDIATION_PA_DECISION_REQUEST_AND_PLAN_2026-10-13.md`; **PA choice PENDING**; no remediation performed. |
| **REG-12 (`G-2` / `F-4` / `AG-5`)** | Durable User Portfolios (`G-2`) Cross-Domain Identity Binding, IPD `G24` Promotion & Runtime Enablement | Area G | IRR, IPD | `IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` (`7e83946b`), `G2-2` (`AD-03`, `AD-04`, `P2`, `P3`, `AD-20`, PR #51), `G2-UI-CONSUMER-RECOVERY-REPUBLICATION-2026-10-08.md` (PR #50 `c19a905d`), `PR #61` (`139c5b8d`), `PR #63` (`F-4`); IPD `arena/01a0e6d9@6828155e` | `DEFERRED` | `Verified` | Read-only UI (`/user-portfolios*`) and contract/boundary seams are on `main`, fenced at HTTP `503 owner-context-unavailable` (`F-4`/`F-5`). IPD `6828155e` is designated as non-production reference (`AD-03`). | `/api/user-portfolios/` dispatch is not admitted (`P3`); commit `a0ab5a34` is not ratified (`P2`, `AD-20` OPEN); G24 (`6828155e`) is not admitted to IPD `main`. | **Blocked/Deferred on:** `D-2` §8 non-auth owner/tenant translation (`owner-7f3a91c2` ↔ G24 `TenantScope` / `AG-5`); `companyId` ↔ ISIN ↔ G24 ticker reconciliation (`D115`); `AD-20` & IPD `6828155e` vs `2e11fa3b` `src/persistence` conflict (classified as distinct domain stores, §7; convergence itself still open — Gate A). `AD-20` bounded disposition recorded 2026-10-13 (§7): next step is **Gate C**. | Keep `/api/user-portfolios*` fenced at `503` until PA opens the deferred `F-4` Portfolios gate (Gate C, §7). |
| **REG-13 (`NP-12` / `NP-13` / `NP-08`)** | Completed & Closed IRR Baselines (`NP-12` Screener, `NP-13` Evidence Landing, `NP-08` Macro & D115, `E2E-030` D42) | Completed Scope | IRR | `PRs #56–#57` (`E2E-030`), `PRs #58–#59` (`NP-13`), `PRs #71–#75` (`NP-12`), `NP-08-D08-*` & `NP-08-D115-*` | `VERIFIED` | `Verified` | All accepted, published, and remotely verified on `main@f970028c`. (`NP-12` `A6-IMPL-10` producer convergence remains `DEFERRED` under Option B). | Do not re-run or re-open completed qualification/acceptance gates. | None. | Protect as immutable baseline deliverables (§4). |

---

## 3. REG-08 Closure Record — Bounded UI Hygiene Correction (`2026-10-13`)

### 3.1 PA Decision and Exact Authorized Scope
- **Decision ID:** `REG-08`
- **Decision:** **`APPROVED — bounded implementation authorized`** (`2026-10-13`, PA: **Ramki**, single owner and Program Authority).
- **Governance Record:** [`docs/integration/IIPS_v3.0_REG08_BOUNDED_UI_HYGIENE_PA_DECISION_2026-10-13.md`](docs/integration/IIPS_v3.0_REG08_BOUNDED_UI_HYGIENE_PA_DECISION_2026-10-13.md) (Git blob `41f315ae4f39419a8041fbd329ca8e038c853b73`, raw SHA-256 `d6f4d472b690eeced26d662945f6ab30d39b3257b31149330a594d6dcc092ca2`).
- **Authorized Scope:** Only the two bounded UI corrections (`ExecutiveDashboard.tsx` canonical engine IDs + `AiAdvisory.tsx` 13-sector selector) and their focused regression tests (`ExecutiveDashboard.test.tsx`, `AiAdvisory.test.tsx`), plus this tracker and the `REG-08` PA decision record.

### 3.2 Before / After Status and Evidence

| Item | Before `REG-08` (`main@f970028c`) | After `REG-08` (PR #76) | Verification Evidence |
|---|---|---|---|
| **Defect 1: `ExecutiveDashboard.tsx` `evidenceRefs[].engineId`** | Constructed `engineId` via `` `sector.${d.sector.toLowerCase()}` ``, producing noncanonical IDs for 4 sectors: `sector.capital markets`, `sector.telecommunications`, `sector.automobile`, `sector.materials & metals`. | Uses `GOVERNED_ENGINE_ID_BY_SECTOR[d.sector]`, emitting canonical D42 IDs for all 13 sectors (`sector.capital-markets`, `sector.telecom`, `sector.auto`, `sector.materials`, plus the 9 remaining canonical IDs). | `ExecutiveDashboard.test.tsx` (`5/5` pass) + `server/product-transport.test.ts` (`10/10` pass). |
| **Defect 2: `AiAdvisory.tsx` `<select aria-label="Engine result">`** | Hardcoded 6 sectors (`Technology`, `Banking`, `Energy`, `Utilities`, `Consumer`, `Industrials`), omitting 7 of the 13 certified sectors. | Renders `CERTIFIED_AI_ADVISORY_SECTORS` (`13` canonical sectors: `Banking`, `Insurance`, `Capital Markets`, `Healthcare`, `Hospitality`, `Energy`, `Utilities`, `Consumer`, `Industrials`, `Technology`, `Telecommunications`, `Automobile`, `Materials & Metals`). | `AiAdvisory.test.tsx` (`6/6` pass) + `server/ai-advisory-transport.test.ts` (`12/12` pass). |
| **Optional `routes.ts:27` `admin: '/admin'`** | Present on `main` after PR #61. | **Unchanged** (explicitly excluded as optional unrelated cleanup not required for either defect). | `git diff` confirms `frontend/src/app/routes.ts` untouched. |

### 3.3 Changed Files, Concise Summary, and Artifact Identities

| File Path | Change Summary | Lines | Bytes | Git Blob SHA | Raw SHA-256 |
|---|---|---:|---:|---|---|
| `docs/integration/IIPS_v3.0_REG08_BOUNDED_UI_HYGIENE_PA_DECISION_2026-10-13.md` | New additive PA decision & implementation record for `REG-08` | 123 | 12,446 | `41f315ae4f39419a8041fbd329ca8e038c853b73` | `d6f4d472b690eeced26d662945f6ab30d39b3257b31149330a594d6dcc092ca2` |
| `frontend/src/features/executive/ExecutiveDashboard.tsx` | Added `GOVERNED_ENGINE_ID_BY_SECTOR` (13 canonical entries) and mapped `evidenceRefs[].engineId` through it | 155 | 7,805 | `cf7e79ba9907ae6d18807168d90860927ebbf25e` | `dac6867be10bacc1dbc1bc8aa3e94f98f8986fde99958360524d6a638ddb2fac` |
| `frontend/src/features/executive/ExecutiveDashboard.test.tsx` | Added `REG-08` regression test asserting all 13 canonical `engineId`s, the 4 corrected IDs, and zero fabricated/duplicate IDs | 134 | 5,950 | `2fc2cd5eeea41f3afe3c2d008dbaabe9f25f3847` | `212dd864ab6821950a57b545f910bb4dcf50690bb4edf6e77f8266dd6efdf761` |
| `frontend/src/features/ai-advisory/AiAdvisory.tsx` | Added `CERTIFIED_AI_ADVISORY_SECTORS` (13 canonical sectors) and bound `<select>` options to it | 106 | 4,859 | `65f392d644ce6ed41df64c9d64a851f663531674` | `d6ba7310406d079835bd32ce6d591db942bf864722554d84d0cda9ea5eb576ad` |
| `frontend/src/features/ai-advisory/AiAdvisory.test.tsx` | Added 2 `REG-08` regression tests asserting 13-sector option completeness, 1:1 correspondence, and `GET /api/ai-advisory/:sectorKey` requests | 128 | 5,127 | `ad68ef30e4cf54ce82c0f53d131619dc59b2f902` | `8ac51c670814d73340a9955af2f9760aa6e7d4fbe58f0397c48a413cdbeecb70` |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | Canonical E2E Master Tracker and IRR/IPD Program Authority Decision Register (this file) | — | — | Self-referential (verified on `origin/main` post-merge) | Self-referential (verified on `origin/main` post-merge) |

### 3.4 Focused Validation Checks, Commands, and Actual Outcomes

All commands executed in `/home/user/iips-review-recovered/frontend` after lockfile-exact `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt npm ci --no-audit --no-fund`:

1. `npx vitest run src/features/executive/ExecutiveDashboard.test.tsx src/features/ai-advisory/AiAdvisory.test.tsx server/ai-advisory-transport.test.ts server/product-transport.test.ts`
   - **Result:** **PASS** — `4` test files passed (`5` tests in `ExecutiveDashboard.test.tsx`, `6` tests in `AiAdvisory.test.tsx`, `12` tests in `server/ai-advisory-transport.test.ts`, `10` tests in `server/product-transport.test.ts`), **`33/33` tests passed, `0` failed**.
2. `npx tsc --noEmit`
   - **Result:** **PASS** — exit code `0`, `0` TypeScript errors.
3. `npm run build` (`tsc -b && vite build`)
   - **Result:** **PASS** — exit code `0`, `84` modules transformed (`dist/` cleaned after verification).

**Unverified / Not Run by Design:** Unrelated backend persistence/owner-context suites, `iips-platform` regression suites (already remediated and verified in PR #54 `e2cda00b`), and live external provider/OIDC suites.

### 3.5 Publication, Merge, and Remote Verification Coordinates
- **Pull Request:** **PR #76** (`ramkivs/iips-review-recovered`)
- **Task / Source Branch:** `arena/b0c55e2b-iips-review-recovered`
- **Target Branch:** `refs/heads/main` (base commit `f970028cf633f561c225d66ae4b3864f48afe656`, base tree `bab9782ed104567e571abccc350c75760ff35dca`)
- **Self-Referential Commit / Merge Note:** Because this tracker is committed as part of the PR #76 tree, the PR #76 head commit SHA, the resulting merge commit SHA on `origin/main`, and the merged root tree SHA cannot be embedded as literals inside the blob they hash; they are verified live against `origin/main` immediately after `gh pr merge 76 --merge` while all five non-self-referential file blobs and SHA-256 digests in §3.3 remain byte-identical on `origin/main`.

---

## 4. Completed-Work Protection List

The following completed baselines on `ramkivs/iips-review-recovered @ refs/heads/main` remain closed and untouched:
1. **Global NO-AUTH & F-1/F-2/F-3 Owner-Context Regime (`PRs #60–#70`):** `NP-09` Watchlists, `NP-10` Collaboration, and `NP-11` Settings qualified across separate OS processes and browser acceptance; `NP-06` Reports and `G-2` User Portfolios fenced at `503 owner-context-unavailable` (`F-4`/`F-5`).
2. **NP-12 Governed Screener Product-Layer Qualification, PA Acceptance & Closure (`PRs #71–#75`)** and Platform N4 Screen Certification (`5ca181c7`).
3. **PR #54 Integrated Verification Remediation (`e2cda00b` / `cb1c75d`):** 13-engine `ENGINE_FACTORY` maps across 11 `program-v2.0-*.test.ts` files, `np12-n4-screen-producer.test.ts` A13 pathspec + adapter blob-pin guard, and `.gitattributes` LF rules (`REG-07`).
4. **D42 / E2E-030 13-Engine Delta Governance & Replay Remediation (`PRs #56–#57`).**
5. **NP-13 Evidence Landing Navigation IA Governance & Baseline Promotion (`PRs #58–#59`).**
6. **NP-08 D08 Macro (`MoSPI` live adapter + disclosure acts) & D115 Company-ID Runtime Binding (`PRs #30–#35`, `PRs #43–#48`).**
7. **REG-08 Bounded Frontend UI Hygiene Correction (`PR #76`):** `ExecutiveDashboard.tsx` canonical 13-sector engine IDs and `AiAdvisory.tsx` 13-sector selector.
8. **REG-02/03/05/06 Governance Reconciliation & NP-07 (`REG-09`) Refreshed Acceptance Publication (`2026-10-13`, this PR):** additive PA dispositions and the refreshed `NP-07-QUAL-01` / `NP-07-ACCEPT-01` v2.0 records (§6). Historical records preserved unchanged; deferred capabilities remain fail-closed.
9. **AD-20 Bounded Disposition (`2026-10-13`, §7):** the two IPD persistence lineages are recorded as distinct, coexisting domain stores; convergence, repin rationale, PR #42 coverage, and all identity/security-identifier contracts remain open under Gates A/B/C. Deferred capabilities remain fail-closed; this item protects no new capability.
10. **REG-11 Gate B one-pass investigation (`2026-10-13`, §8):** published a bounded evidence/status record; persistence-domain fit proven, F-3-to-Reports binding not proven, P1 unresolved, F-4 deferred, F-7 Reports scope unqualified, and 503/UI boundaries preserved. Documentation only; zero application-code changes.
11. **REG-11 Gate B decision-input record (`2026-10-13`, §9):** determined that a Reports-specific owner-binding / consumer-authority contract is **`NOT DECISION-READY`**; identified the unrecorded artifact/report ownership-source authority and the 15-element D-2 §8 coverage gap, preserved `P1` as unresolved, and named the four required inputs (R1–R4). Documentation only; grants no authority and protects no new capability.
12. **REG-11 Gate B PA decision request (`2026-10-13`, §10):** prepared the explicit decision request for **R1** (ownership-source authority; four sub-questions R1.1–R1.4) and **R2** (contract shape A/B/C with prerequisites, consequences, required authority and preserved constraints), plus technical-feasibility-vs-authorization separation and the R3/R4 gate statements. **PA choice PENDING.** Documentation only; no option recommended as supported, no contract created, no capability changed.
13. **REG-11 Gate B R1/R2 PA disposition (`2026-10-13`, §11):** the Program Authority recorded **`OPTION C — RETAIN DEFERRAL`** on its actual date; R1.1 recorded **NOT ESTABLISHED**, direct copy/alias of the F-3 pair prohibited absent an explicitly authorized, evidence-backed identity/security contract, no F-2 scope extension, no Reports-specific declaration/value act/D-2 §8 contract, R3 and R4 retained as separate open gates, Gate A separate. Documentation only; effective on durable publication plus independent remote verification; protects no new capability and changes no fence.

---

## 5. Tracker Change Log (Additive)

| Date | Entry ID | Summary of Change |
|---|---|---|
| `2026-10-13` | `CHG-2026-10-13-01` | Initial consolidation of full-reference IRR (`main@f970028c`, 95 heads, 75 PRs) and IPD (`main@4d3e1cdc`, 32 heads, 6 PRs) investigation and Program Authority Decision Register (`REG-01` – `REG-13`). |
| `2026-10-13` | `CHG-2026-10-13-02` | Recorded PA decision `REG-08` (`APPROVED — bounded implementation authorized`, `docs/integration/IIPS_v3.0_REG08_BOUNDED_UI_HYGIENE_PA_DECISION_2026-10-13.md`), implemented and validated `ExecutiveDashboard.tsx` canonical engine IDs and `AiAdvisory.tsx` 13-sector selector (`33/33` focused tests pass, `tsc --noEmit` `0`, `npm run build` `0`), and published via PR #76 to `main`. |
| `2026-10-13` | `CHG-2026-10-13-04` | Recorded the `AD-20` bounded PA disposition via `docs/integration/IIPS_v3.0_AD20_PERSISTENCE_LINEAGE_IDENTITY_CONTRACT_DECISION_2026-10-13.md`: both IPD persistence lineages verified and classified as distinct domain stores that may coexist (neither on IPD `main`); persistence convergence (Gate A), Reports owner binding (Gate B), and Portfolio identity/security-identifier contract (Gate C) retained open as separate minimum next gates; IU-6 repin rationale left UNPROVEN and act `26061859` coverage of PR #42 left NOT ESTABLISHED (none invented). See §7. |
| `2026-10-13` | `CHG-2026-10-13-03` | Governance reconciliation of `REG-02` (admission preserved; stale banners additively clarified; P4 route decided NOT ADMITTED/retained), `REG-03` (`AD-06` reconciled at lineage & domain-role level; both persistence refs preserved; `AD-20` open), `REG-05` (Workflow = `HISTORICAL-ONLY`), `REG-06` (Operator Drop = internal primitive; product admission `DEFERRED`) via `docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md`; `REG-09` NP-07 records refreshed against the no-auth baseline `main@6c2c955` (`22/22` tests, `tsc` `0`, `build` `0`) and published to `main` (`NP-07-QUAL-01` / `NP-07-ACCEPT-01` v2.0). See §6. |
| `2026-10-13` | `CHG-2026-10-13-05` | One-pass `REG-11` Gate B investigation published at `docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_INVESTIGATION_2026-10-13.md`; corrected the AD-01 status claim and unverified `Reports.tsx` pointer, separated D-1 persistence fit from identity/consumer authority, preserved P1 and all fail-closed boundaries. Documentation only; no PA decision or application-code change. See §8. |
| `2026-10-13` | `CHG-2026-10-13-06` | `REG-11` Gate B **decision-input** record published at `docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_AND_AUTHORITY_DECISION_INPUT_2026-10-13.md`: determined the Reports-specific owner-binding / consumer-authority contract is `NOT DECISION-READY`; recorded the unrecorded artifact/report (`2e11fa3b…`) ownership-source authority (0 `evidence/np04` paths; cited `R2`/`C4` decisions unlocated; IRR NP-04 boundary act non-authoritative), the 15-element D-2 §8 Reports matrix (3 established, 2 partial, 2 structural/negative-only, 8 unresolved/unestablished), the P1/PR #42 re-verification (act `26061859…` re-read — not covered), and the four required inputs R1–R4. No decision, binding, mapping, admission or scope change; no application-code, pin or IPD change. See §9. |
| `2026-10-13` | `CHG-2026-10-13-07` | `REG-11` Gate B **PA decision request** published at `docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNERSHIP_SOURCE_AND_CONTRACT_SHAPE_PA_DECISION_REQUEST_2026-10-13.md`: states the exact decision requested (**R1** ownership-source determination with sub-questions R1.1–R1.4; **R2** contract shape **A/B/C**), the evidence-backed findings for each R1 proposition, per-option prerequisites/consequences/authority/retained constraints, the technical-feasibility-vs-authorization separation, a non-operative Option-A completeness checklist, the R3 (pin/consumer admission) and R4 (`P1`) gate statements, and the non-authorization boundaries. **PA choice PENDING**; no option selected or recommended as supported; no contract, mapping, value, admission or activation created; no code, pin, IPD or runtime change. See §10. |
| `2026-10-13` | `CHG-2026-10-13-08` | **Gate B R1/R2 PA disposition recorded** at `docs/integration/IIPS_v3.0_GATE_B_REPORTS_OPTION_C_DEFERRAL_PA_DECISION_2026-10-13.md`: the Program Authority rendered **`OPTION C — RETAIN DEFERRAL`** (R1.1 ownership-source authority **NOT ESTABLISHED** on the examined evidence; F-3 pair must not be copied/aliased into Reports `(tenantId,userId)` absent an explicitly authorized evidence-backed identity/security contract; no F-2 scope extension; no Reports-specific ownership declaration, value act, or D-2 §8 contract created; deferral retained). R3 (pin/consumer admission) and R4 (`P1`) remain separate open gates; Gate A remains separate and open. No implementation, package admission, route/UI activation, runtime-configuration change, or production behaviour authorized; Reports and User Portfolios retain fail-closed `503 owner-context-unavailable` as the recorded **source-level** baseline (no live-deployment claim). Documentation only; not operative until durably published and independently verified; no code, pin, IPD or runtime change. See §11. |
| `2026-10-13` | `CHG-2026-10-13-09` | **`REG-11` R4 (`P1`) historical-authority reconciliation published** at `docs/integration/IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md`: the R4 **evidence question is RESOLVED — Outcome B (existing authority conflict ESTABLISHED)**. PR #42 fully reconstructed from authoritative evidence (created `2026-10-06T21:03:29Z`, self-merged `21:09:33Z` with 0 reviews/0 comments at `47edf6f3…`; head `4906a6b7…`; 23 paths `+5,982/−22` incl. the `0dab1221…→2e11fa3b…` re-pin). Bounded-but-comprehensive authority search executed and its boundary recorded: all 35 distinct IPD ref tips (34 branches + 6 PR heads + 4 tags) and all 107 distinct IRR ref tips (branches + 80 PR heads + tags), full reachable histories, decisive-token blob and commit-message searches, complete NP-04 act corpus (exactly 5 acts, all `2026-10-01`), all-refs file-name inventory — **zero** acts reference PR #42's merge SHA/head SHA/branch/URL; **no promotion-execution act has ever existed on any searched ref**; **no IPD commit exists on or after `2026-10-06`**, so no contemporaneous or later IPD ratifying act can exist. Conflict basis: D-1 §11/§12/§15, D-3 §11, and the Promotion-Scope Decision (fail-closed bar; merged to `main` at `20:49:21Z` as the merge's own first parent) — all operative ancestors of the merge — expressly withheld the operations the merge performed; act `26061859…` re-read in full (DOES NOT ADDRESS the IRR operation; EXPLICITLY EXCLUDES Reports from its grant); candidate AD-01 non-operative and self-prohibits retrospective reading. **R4 remains OPEN pending the exact PA disposition defined in the record §11 (R4-A prospective regularization / R4-B remediation / R4-C recorded standing — none pre-selected).** No retroactive authorization created; R1/R2 Option C and R3 unchanged; no code, pin, IPD or runtime change. See §12. |
| `2026-10-13` | `CHG-2026-10-13-10` | **`REG-11` R4 `R4-B` remediation decision packet published** at `docs/integration/IIPS_v3.0_REG11_R4_B_REMEDIATION_PA_DECISION_REQUEST_AND_PLAN_2026-10-13.md`: authority hard stop honoured — no existing instrument permits the `R4-B` disposition or implementation (Option C withholds implementation authority; §12 requires an explicit PA disposition; G2-2 R2 constraints block PR #42 remediation absent PA direction), so **no remediation was performed**. New entanglement evidence recorded: the 10 `frontend/server/reports/` paths are byte-identical to `47edf6f3…` with zero external consumers and carry the only `./persistence` subpath edge (dynamic, fail-closed); all other PR #42 paths were superseded by later authorized work (`1f7997e…` no-auth baseline, `6729a26…` F-3, 2026-10-07 family merges) — full revert ruled out; pin `2e11fa3b…` retained-in-plan (AD-02 basis). Minimum scope, retention rationale, verification bar (§5.3) and the verbatim approval required (§8) are fixed. **PA choice PENDING**; R4-A/R4-C remain available; R1/R2 Option C, R3, Gates A/C unchanged; no code, pin, IPD or runtime change. See §13. |

---

## 6. REG-02 / REG-03 / REG-05 / REG-06 / REG-09 Governance Reconciliation Record (`2026-10-13`)

### 6.1 PA Decisions and Exact Boundaries

| Item | Before (at `main@6c2c955` investigation) | PA Disposition (`2026-10-13`) | Precise Boundary |
|---|---|---|---|
| **REG-02** | `AD-02` published & in force at exact scope; stale internal banners (`NOT IN FORCE` / `NOT APPROVED FOR MERGE`); P4 route disposition open | Admission **preserved unchanged**; banners additively clarified (H-2/H-3/H-14); **P4 `/api/pit/company/:companyId` decided: NOT ADMITTED / retained** | No `./persistence` admission; no file-list expansion; route **activation requires a separate explicit gate**; no production readiness |
| **REG-03** | `AD-06` OPEN (pin provenance undecided); two persistence lines distinguished by D-1 but provenance unconstrained | **`AD-06` reconciled at lineage & domain-role level**: pin line (`d61ff9c`+`3137426`→`bd5229d`→`2e11fa3b`, Ramaki 2026-10-02) vs G24 line (`0dab122`→`8c99627`→`d4fdb33`→`6828155e`); merge-base `246cb94`; both descend from IPD `main` tip; hosting boundary = D-1 Option C | **No merge/cherry-pick/promotion/re-pin/replacement** of either implementation; neither admitted to IPD `main`; `src/persistence` divergence preserved unresolved (`AD-20`/`REG-11`/`REG-12`); IU-6 repin rationale left UNPROVEN (none invented) |
| **REG-05** | `DECISION REQUIRED`; Phase 14.1 recognized historically (`REG-04` CLOSED); snapshot depends on deleted OIDC/Keycloak modules | **Workflow = `HISTORICAL-ONLY`** for the current product baseline; `NP-01` convergence not commissioned | Snapshot at `c115d1f4` preserved & not restored; no `/workflows` route; `WorkflowRuntime.ts` presence ≠ admission; any future work needs its own no-auth/F-3 design gate (deferred, not commissioned) |
| **REG-06** | `DECISION REQUIRED`; parser tested in IPD only | **Internal IPD library primitive preserved; product admission `DEFERRED`** (fail-closed) | No runtime callers, package exports, PIT writes, or identifier mappings added; **no IPD code changes**; no approved manual-ingestion product requirement found |
| **REG-09** | v1.0 records on `arena/01a0f351@3b5c54c0` (pre-no-auth); not on `main`; baseline refresh required | **Refreshed `NP-07-QUAL-01` / `NP-07-ACCEPT-01` v2.0 against no-auth `main@6c2c955` and published via PR** (scope preserved exactly: `Option C-2`) | v1.0 preserved unchanged & not claimed authoritative on `main`; acceptance decision date remains **2026-10-04** (not re-dated); exclusions intact: sector route, `NP-08` Macro, Reports, Portfolios, production integration; GAP-6 not closed; no certification |

### 6.2 NP-07 Refresh Evidence (executed 2026-10-13, `main@6c2c955a9a3ad0e6d896746beb5062980952ba37`)

- **Tests:** `22/22` passed (Company 6, Cross-Sector 6, EngineRegistry 4, `server/engine-transport` 6), 0 failed / 0 skipped — `npx vitest run` on the four focused files.
- **Typecheck:** `npx tsc --noEmit` exit **0**. **Build:** `npm run build` exit **0** (`dist/` cleaned after verification).
- **Blobs:** 6/6 dedicated capability/test blobs byte-identical `ac8a751c` → `6c2c955`; `server/engine-transport.test.ts` delta = one-line comment edit by the no-auth commit `1f7997e5` (semantics unchanged, 13-engine contract re-verified); `App.tsx`/`navigation.ts` = registration files with the `/research` five-route set complete and unchanged (App.tsx lines 39–43).
- **Environment:** Node `v22.22.3`, npm `10.9.8`, vitest `2.1.9`, TypeScript `5.9.3`, Linux x86_64.

### 6.3 Changed Files (this reconciliation; documentation only)

| File | Change |
|---|---|
| `docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md` | New additive PA decision record — `REG-02`, `REG-03`, `REG-05`, `REG-06` dispositions + G2-2/B2 banner errata |
| `docs/integration/IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md` | New on `main` — `NP-07-QUAL-01` v2.0 no-auth baseline refresh (historical v1.0 preserved on `arena/01a0f351`) |
| `docs/integration/IIPS_v3.0_NP07_RESEARCH_ACCEPTANCE_AND_BASELINE_ADMISSION.md` | New on `main` — `NP-07-ACCEPT-01` v2.0 refreshed acceptance & baseline admission (decision date preserved: 2026-10-04) |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | This tracker — §1.2/§2 row updates, §4 item 8, §5 `CHG-2026-10-13-03`, §6 |

**No application code, test code, IPD ref, pin, persistence, API, route or identity change.** Zero files outside the four above.

### 6.4 Validation Actually Performed (2026-10-13)

1. Remote state verified: IRR `origin/main@6c2c955` (PR #76 merge), IPD `origin/main@4d3e1cd`, pin & G24 branch tips, `phase14.1-recovery-deposit@c115d1f4` tip, `arena/01a0f351@3b5c54c0` tip — all via `git ls-remote` / fetched refs.
2. IPD lineage verified with `merge-base` / `--is-ancestor` checks (both persistence lines descend from IPD `main` tip; merge-base `246cb94`; implementations distinct at `src/persistence`).
3. Historical record blobs verified on `origin/main` (`2803c1c2` B2, `2f89bbc9` G2-2, `0c4f27b3` D-1).
4. NP-07 focused checks (§6.2) actually executed at `main@6c2c955`.
5. Diff scope check: complete change set = the four documentation files in §6.3 only.

**Unverified / Not Run by Design:** unrelated test suites (no application code changed); live PIT route runtime behaviour (P4 — UNPROVEN by design, not admitted); IPD-side test suites (IPD untouched).

### 6.5 Publication, Merge and Remote Verification Coordinates

- **Pull Request:** recorded post-merge (self-referential — see §3.5 note).
- **Task / Source Branch:** `arena/47b82a3f-iips-review-recovered` → `refs/heads/main` (base commit `6c2c955a9a3ad0e6d896746beb5062980952ba37`).
- **Self-Referential Note:** the PR head SHA, merge commit SHA and merged root tree SHA cannot be embedded inside the blobs they hash; they are verified live against `origin/main` immediately after merge and reported in the completion response, while the three non-self-referential document blobs in §6.3 remain byte-identical on `origin/main`.
- **Post-merge verification performed** (see §6.6): PR merged state, merge commit on `origin/main`, exact changed-file list, presence of each decision record and this tracker, and worktree status.

### 6.6 Deferred / Unresolved (fail-closed, preserved)

| Item | State |
|---|---|
| `/api/pit/company/:companyId` live route | NOT ADMITTED, retained; activation requires a separate explicit gate (`P4`) |
| Two IPD `src/persistence` implementations | Divergent, non-interchangeable; convergence owned by `REG-11`/`REG-12` (`AD-20` OPEN) |
| IU-6 repin rationale (`0dab1221` → `2e11fa3b`) | UNPROVEN (unrecorded in any act); no rationale invented |
| Act `26061859` vs IRR PR #42 coverage | NOT ESTABLISHED (`Q2`); unchanged |
| Workflow product work | Deferred; no design gate commissioned |
| Operator Drop product admission | Deferred, fail-closed |
| NP-08 Macro / Sector route / Reports / Portfolios / production | Excluded from NP-07; unchanged |
| GAP-6 (C-1 vs C-2 placement conventions) | OPEN; not closed by the NP-07 publication |

---

## 7. AD-20 Persistence Lineage and Identity Contract Decision Record (`2026-10-13`)

### 7.1 PA Disposition and Exact Boundaries

| Item | Before (at `main@6dac8bf` investigation) | PA Disposition (`2026-10-13`) | Precise Boundary |
|---|---|---|---|
| **AD-20** | OPEN — two divergent IPD `src/persistence` implementations; ownership, coexistence, convergence, repin rationale, PR #42 coverage, and identity/security-identifier contracts all unresolved; Reports & Portfolios blocked without a characterized gate | **BOUNDED DISPOSITION** via [`docs/integration/IIPS_v3.0_AD20_PERSISTENCE_LINEAGE_IDENTITY_CONTRACT_DECISION_2026-10-13.md`](docs/integration/IIPS_v3.0_AD20_PERSISTENCE_LINEAGE_IDENTITY_CONTRACT_DECISION_2026-10-13.md): proven portion closed — the two lineages are **distinct domain stores that may coexist** (pin `2e11fa3b…` = artifact/report domain via `./persistence`; G24 `6828155e…` = portfolio/tenancy domain via HTTP; neither on IPD `main`, which has no `src/persistence`); all other portions explicitly retained open under Gates A/B/C (§7.2) | **No merge/cherry-pick/promotion/re-pin/replacement** of either implementation; no pin change; no route activation; no owner/tenant, `(issuer, subject)`, `companyId`/ISIN/ticker, or persistence mapping created or inferred; Reports & Portfolios remain at HTTP `503 owner-context-unavailable`; **persistence convergence is NOT complete and is not claimed** |

### 7.2 Unresolved Dependencies and Minimum Next Gates (each a separate explicit PA gate; none authorized for implementation by §7)

| Gate | Unresolved dependency | Acceptance criteria (summary; full text in the AD-20 record §4.3) |
|---|---|---|
| **Gate A — Persistence Convergence Design** | `src/persistence` path collision; no D-1 §§7–9 identity/security/package reconciliation; no converged-tree qualification | Design record with layout + export map; both `np04_governed_persistence` and `g24_*` suites re-run on the converged tree; no effect on the `AD-02` pin without a separate re-pin act. **Not a prerequisite for Gates B or C** |
| **Gate B — Reports Owner Binding & Admission** (`REG-11`) | D-2 §8 binding of F-3 pair to Reports `(tenantId, userId)`; D-1 vs PR #42 (`P1`); F-7 qualification; UI no-auth port | Governed binding act; F-7 five-part evidence incl. restart durability; 503 fence stands until satisfied |
| **Gate C — Portfolio Identity & Security-Identifier Contract** (`REG-12`) | D-2 §8 translation: owner ↔ `applicationUserId`, tenant ↔ `TenantScope`/membership provisioning in the no-auth baseline, `companyId`/ISIN/`symbol` equivalence & uniqueness; `P2`/`P3` | Governed contract covering every D-2 §8 element with fail-closed behavior per missing-mapping case; 503 fence stands until satisfied |

**Preserved unresolved (unchanged, none invented):** IU-6 repin rationale (`0dab1221` → `2e11fa3b`) = UNPROVEN; act `26061859…` coverage of IRR PR #42 / commit `a0ab5a34` = NOT ESTABLISHED (`Q2`/`P2`).

### 7.3 Changed Files (AD-20 disposition; documentation only)

| File | Change |
|---|---|
| `docs/integration/IIPS_v3.0_AD20_PERSISTENCE_LINEAGE_IDENTITY_CONTRACT_DECISION_2026-10-13.md` | New additive AD-20 decision/reconciliation record with the persistence-lineage and identity-contract evidence matrix |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | This tracker — header, `REG-11`/`REG-12` next-action pointers, §4 item 9, §5 `CHG-2026-10-13-04`, §7 |

**No application code, test code, IPD ref, pin, persistence, API, route, or identity change.** Zero files outside the two above. `REG-08`, `REG-09`, and all other protected work are untouched.

### 7.4 Validation Actually Performed (2026-10-13)

1. Remote state verified: IRR `origin/main@6dac8bf` (PR #77 merge; PR #76 merge `6c2c955` confirmed via GitHub API — REG-08/REG-09 not reopened), IPD `origin/main@4d3e1cd`, pin branch tip `2e11fa3b`, both G24 branch tips `6828155e`, `arena/01a0f839@12c480b` — via `git ls-remote` / fetched objects. No open PRs in either repository; no ref movement since §6.
2. IPD lineage re-verified with `merge-base` / `--is-ancestor`, `ls-tree`, and `src/persistence` diff (17 files, +1,105/−1,081; 50 files overall); both `package.json` export maps and act `26061859…` read at their commits; IPD `main` confirmed to carry no `src/persistence`.
3. IRR fences verified byte-present on `main@6dac8bf`: `reports-transport.ts`, `user-portfolio-transport.ts`, `owner-context-unavailable.ts` (HTTP 503 `owner-context-unavailable`); seams `reports/persistence-port.ts` (pin `2e11fa3b…`, `IIPS_NP04_DATABASE_PATH`) and `user-portfolio/*` (`G2_LINEAGE` `6828155…`, reference only) read directly.
4. Diff scope check: complete change set = the two documentation files in §7.3 only; no mapping, pin, route, or safeguard altered; historical records preserved unchanged.

**Unverified / Not Run by Design:** application test suites (no application code changed); live Reports/Portfolio runtime behavior (fenced, UNPROVEN by design); IPD-side test suites (IPD untouched — G24 "84/84" remains as recorded in the IRR contract header, not re-run).

### 7.5 Publication, Merge and Remote Verification Coordinates

- **Pull Request:** recorded post-merge (self-referential — see the §6.5 note, which applies equally here).
- **Task / Source Branch:** `arena/148c5942-iips-review-recovered` → `refs/heads/main` (base commit `6dac8bff0fae6cd201df5b02e38ee45ab433881a`).
- **Post-merge verification performed:** PR merged state, merge commit on `origin/main`, exact changed-file list, presence of the AD-20 record and this tracker on `origin/main`, IPD refs unchanged, and worktree status — verified live immediately after merge and reported in the completion response.

---

## 8. REG-11 Gate B — Reports Owner-Binding Investigation (`2026-10-13`)

### 8.1 Bounded result

| Gate B question | Result |
|---|---|
| F-3 `(tenantId, ownerUserId)` → Reports `(tenantId, userId)` | **NOT PROVEN.** Direct field copying conflicts with the F-3 value semantics; no D-2 §8 Reports translation or Reports-specific no-auth owner contract exists. |
| Persistence boundary | **PROVEN technical fit only.** D-1 designates the NP-04 artifact/report domain at pin `2e11fa3…`; this does not authorize Reports package consumption/admission or establish identity. |
| D-1 / PR #42 (`P1`) | Historical merge-authority conflict remains **UNRESOLVED**. No retrospective approval or remediation. |
| IPD act `26061859…` | **Does not cover PR #42** under its explicit source/target/exclusion scope. Coverage by any different act remains **NOT ESTABLISHED**. The act's `6828155…` “NP04” label conflicts with D-1/AD-20's G24 portfolio-lineage designation; no relabeling is inferred. |
| G2-2 `AD-01` | Candidate record's operative effect is **NOT ESTABLISHED**; the 13-path historical presence fact is not an admission. This corrects the earlier tracker wording. |
| F-4 / F-7 | Reports remains **DEFERRED** under effective F-3 scope; F-7 qualification for the F-3/no-auth Reports path is **NOT SATISFIED**. Existing authenticated Reports evidence is scope-limited; restart status is conflicting/conditional under D-3. |
| Route, runtime, UI | Current source returns `503 owner-context-unavailable` before domain/persistence access. Live runtime configuration is **UNPROVEN**. No Reports UI/no-auth port was found at current `main` or the exact accepted D-3 branch tree; no UI admission. |
| Application code | **Zero changes.** Reports and User Portfolios remain fail-closed. |

### 8.2 Classification discipline

`PROVEN` means direct evidence at the cited ref; `DECIDED` means an effective governing record; `INFERRED` is not used to create any identity or authority; `UNPROVEN` means evidence is absent or insufficient; `CONFLICTING` records incompatible source/status claims without resolving them by assumption; `DEFERRED` means the governing F-3 scope excludes the capability for now. Persistence fit, identity binding, qualification, implementation authority, acceptance, product admission, route/UI enablement, publication, and remote verification remain distinct layers.

### 8.3 Reconciled D-1 / PR #42 / act status

D-1 designates NP-04 `./persistence` for the artifact/report domain but grants no implementation, promotion, main-admission, package/API, or identity-mapping authority. PR #42 merged 23 paths (13 Reports backend/domain/test paths plus 10 shared/package/auth/tenant/PIT paths) at `47edf6f3…`, despite its title/body requiring a separate promotion act. The chosen store is technically consistent with D-1; the merge and package edge are not authorized by that designation. This is the still-open P1 conflict.

Act `2606185923f6cbd3f4df5c3af200f54d40ed4bbc` names source `6828155…` and target `arena/01a0e6d9-iips-production-market-data`, expressly withholds `main` and Reports, and contains no IRR PR #42 authorization. Under AD-20, `2e11fa3…` is the artifact/report pin while `6828155…` is the G24 portfolio/tenancy reference; the act's conflicting “NP04 Phase-A” label is recorded without changing either lineage. Other-act coverage remains **NOT ESTABLISHED**.

The G2-2 file at blob `2f89bbc9…` says it is a candidate, not approved/published/authoritative, with independent verification still required. PR #51 merged it under a “DRAFT: not approved; do not merge” title; PR #53 records post-merge default checks `32 pass / 1 fail / 2 not verified` (C01 failed after base drift; C14/C15 not verified). The merged bytes prove a candidate was placed on `main`; they do not prove operative AD-01 effect. Historical files are preserved unchanged.

### 8.4 F-4 / F-7 and Reports evidence

The effective F-3 mechanism decision (PR #68) keeps Reports and Portfolios deferred and unconditional `503`; its implementation scope is NP-09/10/11 only. NP-06-R1 on the accepted Reports branch authorized the then-authenticated principal-based Reports implementation, not an F-3-to-Reports mapping or replacement of the established authentication architecture. D-3 accepts only that qualified branch scope and grants no main admission.

The accepted branch's qualification reports `32/32` requirements and `228/228` tracked tests for the authenticated-principal implementation. D-3 separately leaves process restart/recovery and live-IdP evidence conditional/unproven because the execution harness was not committed. Neither record qualifies the F-3 pair. F-7 remains unmet for positive/negative F-3 ownership tests and reproducible separate-process durability; current fail-closed behavior alone is insufficient. See the full per-part classification in the [Gate B investigation record](docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_INVESTIGATION_2026-10-13.md) §6.

The earlier main-tracker claim that `Reports.tsx` exists at `arena/01a0f1b3@6a8afbb2…` is not reproducible: the complete remote tree (1,265 entries; not truncated) contains no Reports UI component. Current `main` and PR #42's file manifest likewise contain no Reports UI path. D-3 UI08 exclusion remains.

### 8.5 Minimum next governance action

The first substantive next step is a PA decision choosing either a Reports-specific non-auth owner contract or a D-2 §8 translation contract with source/target authorities, identifier semantics, lifecycle, provisioning/revocation, tenant/ownership/authorization boundaries, audit, failure behavior, trust, durable storage, and package/API contract. P1 remains an independent open issue. Only after these decisions may separately authorized implementation, F-7 evidence, Reports/UI acceptance, product admission, or route/UI activation be considered. Keep Gate A separate; it is not a Gate B prerequisite. Preserve the 503 fence.

### 8.6 Evidence method and checks

| Channel / check | Result |
|---|---|
| IRR local | Initially clean shallow checkout at `39d03d6…`; source files read directly. |
| Remote IRR | Current `main`, accepted Reports branch tree, PR #42/#51/#53 state and manifests queried through GitHub. |
| Remote IPD | Relevant refs re-queried with `git ls-remote`; act read at exact commit `26061859…`. No IPD refs changed. |
| Windows / PowerShell | Not accessed; no Windows-side result is claimed. |
| Application tests / runtime probes | Not run. Existing Reports 503 test assertions and source path inspected only; no server, environment value, database, or user data accessed. |
| Documentation validation | `git diff --check` and the two-file documentation-only scope check are performed before publication. |

### 8.7 Changed files and exclusions

| File | Change |
|---|---|
| `docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_INVESTIGATION_2026-10-13.md` | New bounded investigation record; no PA decision or authority is rendered. |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | This tracker — REG-11 row and Reports matrix status corrected; §4 item 10; §5 `CHG-2026-10-13-05`; §8. |

**No application or test code, package, dependency, pin, persistence, schema, identity, route, UI, data, IPD ref, or protected REG-08/REG-09 work changed.** Zero files outside these two documentation paths.

### 8.8 Publication and remote-verification coordinates

- **Publication PR:** [PR #79](https://github.com/ramkivs/iips-review-recovered/pull/79), the single additive documentation-only publication containing this record and the tracker update. The PR was OPEN when this paragraph was prepared; its remote state and merge metadata are the authority for publication coordinates.
- **Source branch:** `arena/b7b3c81e-iips-review-recovered` → IRR `refs/heads/main`; baseline `39d03d6c293076dbac2fb4173c9482849e0c234b`.
- **Self-reference:** this tracker and investigation record are part of the publication tree, so their own PR head, merge commit, and resulting tree cannot be embedded without another publication. The linked PR is the durable coordinate; its remote merge metadata is authoritative for those self-referential values.
- **Post-merge proof checklist:** verify the merged PR state, exact two-path diff, both documents on remote `main`, unchanged Reports/User Portfolios 503 sources, owner-context resolver, executive dispatch, and package pin, unchanged IPD `main`/NP-04/G24/act refs, and clean worktree. Report actual results in the completion verification; no test or live-runtime result is implied.

---

## 9. REG-11 Gate B — Reports Owner-Binding & Authority Decision-Input Record (`2026-10-13`)

*Additive decision-input section for `REG-11` / `Gate B`. Operating record: [`docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_AND_AUTHORITY_DECISION_INPUT_2026-10-13.md`](docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_AND_AUTHORITY_DECISION_INPUT_2026-10-13.md) (record ID `IIPS-V3-REG11-GATE-B-OWNER-BINDING-AND-AUTHORITY-DECISION-INPUT-2026-10-13-01`). This section is **not** a PA decision and grants no authority; the operating record is authoritative for its own findings and citations.*

### 9.1 Gate B decision-readiness result

| Gate B question | Result | Classification |
|---|---|---|
| Can a Reports-specific owner-binding contract be established from existing decisions, records, and verified evidence? | **NO — `NOT DECISION-READY`.** Readiness conditions (target authority determinable; contract shape forced by existing authority; package/API element established; `P1` disposed) are **4 of 4 unmet**. | **UNPROVEN / NOT DECISION-READY** |
| Direct F-3 pair → Reports `(tenantId,userId)` aliasing | Rejected: the effective value act §5(7) denies equivalence to a Reports `userId` and to any Reports tenant identifier; D-2 §8 requires a governed contract. | **CONFLICTING** (already excluded by effective decisions) |
| Existing lawful F-3→Reports translation contract | None exists anywhere in the examined refs. | **UNPROVEN / NOT CREATED** |
| Reports target (`AuthenticatedOwner`) ownership-source **authority** | **Not recorded.** The artifact/report lineage `np04-governed-persistence-windows@2e11fa3b…` carries **0** `evidence/np04` paths (full recursive tree); its cited "closed decisions `R2`/`C4`" are unlocated in either repository; the IRR-side `NP-04-PERSISTENCE-DOMAIN-BOUNDARY-ACT.md` is self-labelled `ARENA TRANSFER COPY — NOT AUTHORITATIVE` and states an NP-04 owner is **not established**; D-1 confers ownership standing only (`DOMAIN OWNERSHIP ≠ IDENTITY MAPPING`). The store documents ownership as originating from **an authenticated principal established by the identity authority** — unsatisfiable in the no-auth baseline. | **PROVEN gap (new finding of §9)** |
| D-2 §8 element coverage for Reports (15 elements) | 3 established (source authority; source identifier; failure behaviour), 2 partial (ownership boundary; audit requirements), 2 proven only structurally or as a negative (authorization boundary; durable storage), **8 unresolved or unestablished** (target authority; target identifier; mapping lifecycle; provisioning authority; revocation authority; tenant boundary; security/trust model; package/API contract). | **UNPROVEN (aggregate)** |
| Gate A (persistence convergence) as a Gate B prerequisite | Not required — consistent with `AD-20` §4.3. | **REJECTED** |
| `P1` (D-1 vs PR #42) | Preserved **CONFLICTING / UNRESOLVED**. Re-verified this session: PR #42 `MERGED` at `47edf6f3…` despite its "DO NOT MERGE without promotion act" title/body, with 0 reviews and 0 comments; act `26061859…` (§4 verbatim) covers only the G24 Phase-A lineage into `arena/01a0e6d9` and expressly excludes `main` and "Watchlists, Reports, Collaboration, Settings, Governed Screener persistence"; coverage by any other act **NOT ESTABLISHED**; no retrospective authorization created. | **CONFLICTING / UNRESOLVED** |
| `F-4` / `F-7` / `NP-06-R1` | `F-4` defers Reports and requires per-domain binding through the domain's **existing governed contract**; the effective F-3 record requires unconditional owner-context unavailability; `F-7` is **NOT SATISFIED** for the proposed scope (parts 1/2/4 unproven; part 3 insufficient by F-7's own terms; part 5 a preserved prohibition); `NP-06-R1` authorizes only the historical **authenticated** model. | **DECIDED** / **NOT SATISFIED** / **NO** |
| Authority to render the binding decision now | **INSUFFICIENT.** The standing authorization is bounded to its established scope and forbids unrelated scope expansion; Reports is expressly deferred; any binding would create new identity/security semantics (a non-auth pair standing as `AuthenticatedOwner`; an extension of the F-2 value beyond its journal-regime scope). | **DECIDED (authority limit)** |

### 9.2 Required inputs (exact) — Gate B cannot proceed until supplied

| ID | Required input | Owner |
|---|---|---|
| **R1** | Target-authority determination for the Reports ↔ artifact/report ownership boundary: who owns the store's `AuthenticatedOwner` semantics, and whether a PA-governed **non-auth** declaration may lawfully supply that pair (IPD-side act, or an explicit PA determination of record with its limits). | Ramki / IPD-side authority |
| **R2** | PA choice of contract shape (this constitutes the Gate B binding act): **A** bind the accepted F-1/F-2 pair under a Reports-specific D-2 §8 contract (the only option consistent with `F-4`(1) / `F-1`(1) without reopening the value regime); **B** new Reports-specific owner declaration + value act; **C** retain deferral. The selected shape must state the full §5 element set. | Ramki |
| **R3** | Reports consumer / pin admission: whether the `./persistence` subpath of pin `2e11fa3b…` may be consumed at the Reports boundary (D-1 §9; `AD-02` excludes `./persistence`; `AD-01` presence-only, operative effect not established). | Ramki |
| **R4** | `P1` disposition: a located covering act (evidence) or an explicit PA disposition closing the conflict without manufacturing authorization. | Ramki |
| **R5** | F-7 five-part qualification evidence for the chosen contract (incl. separate-process durability) — only after R2 and a separate implementation-authorization gate. | Separate implementation gate |

### 9.3 Preserved boundaries (unchanged by §9)

`/api/reports*` and `/api/user-portfolios*` remain fail-closed at HTTP `503 owner-context-unavailable`; no owner/tenant/principal/mapping/security identifier is created, inferred, or aliased; no D-2 §8 or Reports-specific owner contract is created; no pin, package, lockfile, persistence, schema, route, UI, deployment or runtime-configuration change; no IPD ref, record, act or pin was written; Gate A and Gate C remain separate and untouched; `P1` remains open.

### 9.4 Changed files, checks and publication

| Item | Result |
|---|---|
| Changed paths | `docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_AND_AUTHORITY_DECISION_INPUT_2026-10-13.md` (new) and this tracker (header, `REG-11` row, §4 item 11, §5 `CHG-2026-10-13-06`, this §9). Documentation only. |
| Baseline | IRR `main@a280712fc00ab64f8751524144f61cdf2f82e47f`; PR #79 merge; `git diff 39d03d6 a280712 -- frontend` empty (code byte-identical), so PR #79's code-level findings are reused rather than re-derived. |
| IPD | `git ls-remote` re-verified `main` `4d3e1cd…`, pin `2e11fa3b…`, G24 `6828155e…` (×2), act branch `12c480b…` — **unchanged**; no IPD write. |
| Checks actually performed | Baseline/ref verification; PR #42/#78/#79 metadata; direct reads of the IRR Reports/owner-context sources, the IPD pin-lineage `src/persistence/{identity,store,schema}.ts` and `tests/np04_governed_persistence.test.ts`, the IPD act at `26061859…`, and the recursive trees of the pin/G24/act/`main` refs; `git diff --check`; documentation-only scope check. |
| Checks NOT performed | No application tests run; no live HTTP/runtime/database/environment access; no Windows/PowerShell; Reports UI/no-auth-port tree inspection **not** re-run (reused from PR #79). **No live deployment or runtime behaviour is proven.** |
| Publication | Additive documentation-only PR from the session branch (`arena/a2729fa4-iips-review-recovered`) to `refs/heads/main`; merge — and therefore durable effect — is the Program Authority's act. Self-referential PR/merge coordinates are verified against the remote after publication. |

---

## 10. REG-11 Gate B — Reports Ownership Source (R1) and Contract Shape (R2) PA Decision Request (`2026-10-13`)

*Additive decision-request section for `REG-11` / `Gate B`. Operating record: [`docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNERSHIP_SOURCE_AND_CONTRACT_SHAPE_PA_DECISION_REQUEST_2026-10-13.md`](docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNERSHIP_SOURCE_AND_CONTRACT_SHAPE_PA_DECISION_REQUEST_2026-10-13.md) (record ID `IIPS-V3-REG11-GATE-B-R1-R2-PA-DECISION-REQUEST-2026-10-13-01`). **PA CHOICE = PENDING.** This section is **not** a decision and selects no option; the operating record is authoritative for its own findings and citations.*

### 10.1 Decision requested from the Program Authority

| Input | Question | Status |
|---|---|---|
| **R1 — ownership-source authority** | R1.1 Does any existing authority (IRR- or IPD-side) establish the Reports target's ownership contract and source class — or is it **not established**? R1.2 May a PA-governed **non-auth** declaration lawfully supply `AuthenticatedOwner` at that boundary? R1.3 Does the F-2 tenant value's scope extend to the artifact/report boundary (or is a separate Reports tenant value/act required)? R1.4 If R1.1–R1.3 cannot be resolved, does Reports remain deferred? | **PENDING** |
| **R2 — contract shape** | Choose exactly one: **A** bind the accepted F-1/F-2 pair under a Reports-specific D-2 §8 contract; **B** establish a new Reports-specific declaration + value act; **C** retain deferral. | **PENDING** |

### 10.2 Options — prerequisites and consequences (summary)

| Option | Prerequisites | Consequences | Authority required | Evidence-supported now? |
|---|---|---|---|---|
| **A** Bind an existing governed identity pair | Target authority located/created (R1.1); authorized non-auth ownership-source class (R1.2); F-2 scope extension authorized (R1.3); full 15-element D-2 §8 act; affirmative no-authorization/no-client-identity/fail-closed statements; R3 decided before enablement | No new values; consistent with `F-4`(1) single-declaration framing; **extends the artifact/report store's ownership semantics** to a declaration-derived source (boundary security change); adapter change remains an implementation act; F-7 still required | PA binding act; target-authority determination (possibly IPD-side) | **No — P-A1/P-A2/P-A3 unestablished** |
| **B** New Reports-specific declaration + value act | Target authority located/created (same R1.1 burden); PA authority for new ownership/security semantics **and** a new value act (or an `F-4`(1) amendment); full element set + pair-relationship statement; R3 decided before enablement | Creates a **second ownership declaration** regime needing express reconciliation with `F-4`(1); same boundary security change as A plus a value-selection act; doubles F-3/F-7 evidentiary surface | PA binding act + new value act; target-authority determination | **No — P-B1/P-B2 unestablished** |
| **C** Retain deferral | **None** | State fully preserved; no new semantics; Gate B stays open; `503` guarantee unchanged; R1/R2 unresolved | None (confirmation only) | **Yes — prerequisites satisfied** |

**Neither A nor B is recommended as supported by current source evidence**; on the evidence as it stands only **C** has satisfied prerequisites. A or B become available only if the PA's R1 determination supplies their prerequisites. No option is selected here.

### 10.3 Technical feasibility vs governance authorization (preserved separation)

Structurally compatible field shapes and a store that validates only non-empty members are **technical facts**, not authority. Reaching the store with a non-principal pair requires (i) the R1.2 determination, (ii) a source change under a separate implementation gate, and (iii) R3 for the `./persistence` edge. Equivalences denied by the effective value act §5(7) and D-2 §8 remain **unauthorized** regardless of feasibility.

### 10.4 Remaining gates (unchanged, not advanced by §10)

| Gate | Status | Note |
|---|---|---|
| **R3 — Reports pin / consumer admission** | **Open** | No Reports consumer admission exists: `AD-02` §3.3(8) leaves the Reports `./persistence` and G-2 admissions unchanged; `AD-01` is presence-only with operative effect **NOT ESTABLISHED**; D-1 §9 performs no package/API reconciliation; D-3 §11 records implementation/promotion authority **NOT GRANTED**; the physical pin at `frontend/package.json:15` is presence, not authority. |
| **R4 — `P1` (D-1 vs PR #42)** | **Open — CONFLICTING / UNRESOLVED** | PR #42 merged at `47edf6f3…` under a "DO NOT MERGE without promotion act" title/body with 0 reviews; act `26061859…` excludes `main` and "…Reports…"; coverage by any other act **NOT ESTABLISHED**; no retrospective authorization. |
| Implementation-authorization gate | **Not authorized** | Follows R1/R2 (and R3 at the boundary). |
| F-7 qualification | **NOT SATISFIED** for Reports | Five-part bar incl. separate-process durability. |
| Gate A / Gate C | **Separate; untouched** | Gate A is not a Gate B prerequisite. |

### 10.5 Preserved boundaries and change scope

`/api/reports*` and `/api/user-portfolios*` remain fail-closed at `503 owner-context-unavailable`; no owner/tenant value, mapping, contract, admission or activation is created; no code, test, package, pin, lockfile, persistence, schema, route, UI, deployment or runtime-configuration change; no IPD write; PR #80's lifecycle is preserved (`OPEN`, untouched); Gate A and Gate C remain separate and untouched; `P1` remains open.

| Item | Result |
|---|---|
| Changed paths | `docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNERSHIP_SOURCE_AND_CONTRACT_SHAPE_PA_DECISION_REQUEST_2026-10-13.md` (new) and this tracker (header, §4 item 12, §5 `CHG-2026-10-13-07`, this §10). Documentation only. |
| Baseline | IRR `main@a280712fc00ab64f8751524144f61cdf2f82e47f`; IPD refs re-verified unchanged; PR #80 `OPEN` and unmodified. |
| Checks actually performed | Branch/worktree/baseline verification; PR #80 lifecycle; IPD `git ls-remote`; direct reads of the cited IRR records and IPD pin-lineage sources; relative-link existence check; documentation-only scope check. |
| Checks NOT performed | No application tests; no live HTTP/runtime/database/environment/deployment access; no Windows checks; Reports UI tree inspection reused from PR #79. **No live deployment or runtime behaviour is proven.** |
| Publication | Additive documentation-only commit on the session branch, published through the repository's normal PR workflow without merging or bypassing PR #80; merge is the Program Authority's act. |

---

## 11. REG-11 Gate B — Reports R1/R2 Program Authority Disposition: `OPTION C — RETAIN DEFERRAL` (`2026-10-13`)

*Additive decision section for `REG-11` / `Gate B`. Operating record: [`docs/integration/IIPS_v3.0_GATE_B_REPORTS_OPTION_C_DEFERRAL_PA_DECISION_2026-10-13.md`](docs/integration/IIPS_v3.0_GATE_B_REPORTS_OPTION_C_DEFERRAL_PA_DECISION_2026-10-13.md) (record ID `IIPS-V3-REG11-GATE-B-R1-R2-OPTION-C-PA-DECISION-2026-10-13-01`). The operating record carries the transcribed disposition; this section summarizes it and adds no determination.*

### 11.1 Disposition (transcribed, condensed — the operating record is authoritative)

| # | Disposition element |
|---|---|
| 1 | No existing IRR-side or IPD-side authority has been established by the examined evidence as the operative authority for the Reports target ownership contract (**R1.1 = NOT ESTABLISHED**). |
| 2 | The existing F-3 owner pair **must not** be directly copied or aliased into Reports `(tenantId,userId)` without an explicitly authorized, evidence-backed identity/security contract. |
| 3 | **No decision** is made to extend the F-2 tenant value beyond its established scope. |
| 4 | **No** Reports-specific ownership declaration, value act, or D-2 §8 contract is approved or created. |
| 5 | Reports owner binding **remains deferred** until the required ownership-source authority and contract semantics are established. |
| 6 | **R3** — Reports pin/consumer admission — remains a **separate open gate**. |
| 7 | **R4** — D-1 / PR #42 historical-authority reconciliation — remains **`CONFLICTING / UNRESOLVED`**. |
| 8 | **Gate A** remains separate and open; the decision neither requires nor resolves persistence-lineage convergence. |
| 9 | No implementation, package admission, route/UI activation, runtime configuration change, or production behaviour is authorized. |
| 10 | Reports and User Portfolios must retain their existing **fail-closed** behaviour; the recorded baseline is **source-level** `503 owner-context-unavailable`; the decision asserts nothing about live deployment behaviour. |
| — | **Effect:** R1/R2 remain deferred. This is a bounded governance disposition, not approval of a Reports owner-binding contract or admission to the persistence package. |

### 11.2 R1/R2 disposition mapping

| Input | Result |
|---|---|
| R1.1 Existing target ownership authority | **NOT ESTABLISHED** (examined evidence) |
| R1.2 Non-auth ownership-source class permitted? | **NOT RESOLVED / NOT AUTHORIZED**; direct copy or alias prohibited absent an explicitly authorized, evidence-backed identity/security contract |
| R1.3 F-2 tenant value scope extension | **NO EXTENSION DECIDED**; established scope unchanged |
| R1.4 Retain deferral? | **YES — deferral retained** |
| R2 Contract shape | **C — RETAIN DEFERRAL** (A and B not approved; nothing created) |

### 11.3 Effectiveness and recordkeeping

| Item | Result |
|---|---|
| Decision date | **2026-10-13** (Asia/Calcutta) — actual date; **not backdated** |
| Deciding authority | Ramki — Program Authority; the recording agent rendered no authority and transcribed the disposition without addition, narrowing, or reinterpretation |
| Effectiveness | **Recorded — effective only upon durable publication to `refs/heads/main` plus independent remote verification there.** Not represented as operative before that. |
| Effect of effectiveness | None on Reports' current operative state (already deferral, fail-closed under `F-4` and the effective F-3 mechanism record); it makes this disposition, the R1.1 finding and the §11.1 prohibitions durable |
| Merge | A separate Program Authority act; PR #80 is preserved (`OPEN`) and is not merged, bypassed, or altered by this record |

### 11.4 Gates retained open (unchanged)

| Gate | Status |
|---|---|
| R1/R2 | **DEFERRED** — re-entry requires the ownership-source authority and contract semantics named in §11.1(1)–(5) |
| **R3** — Reports pin/consumer admission | **OPEN — separate.** `AD-02` §3.3(8) leaves the Reports `./persistence` and G-2 admissions unchanged; `AD-01` presence-only, operative effect NOT ESTABLISHED; D-1 §9 performs no package/API reconciliation; D-3 §11 records implementation/promotion authority NOT GRANTED; the pin's physical presence is presence, not authority. |
| **R4** — `P1` (D-1 vs PR #42) | **OPEN — `CONFLICTING / UNRESOLVED`** (PR #42 merged under its own "DO NOT MERGE without promotion act" condition with no recorded review; act `26061859…` withholds `main` and Reports; coverage by any other act NOT ESTABLISHED). |
| Implementation-authorization gate | **NOT AUTHORIZED** |
| F-7 qualification | **NOT SATISFIED** for Reports |
| Gate A / Gate C | **SEPARATE / UNTOUCHED** |

### 11.5 Preserved boundaries and change scope

Reports and User Portfolios retain fail-closed behaviour; the recorded baseline is source-level `503 owner-context-unavailable` and **no live deployment behaviour is asserted**. No owner/tenant value, mapping, contract, admission, promotion or activation is created; no code, test, package, pin, lockfile, persistence, schema, route, UI, deployment or runtime-configuration change; no IPD write; `P1` remains open; Gate A and Gate C remain separate; no second master tracker.

| Item | Result |
|---|---|
| Changed paths | `docs/integration/IIPS_v3.0_GATE_B_REPORTS_OPTION_C_DEFERRAL_PA_DECISION_2026-10-13.md` (new) and this tracker (header, REG-11 row, §4 item 13, §5 `CHG-2026-10-13-08`, this §11). Documentation only. |
| Baseline | IRR `main@a280712fc00ab64f8751524144f61cdf2f82e47f`; IPD refs re-verified unchanged; PR #80 `OPEN` and unmodified in lifecycle. |
| Checks actually performed | Branch/worktree/baseline verification; PR #80 lifecycle; IPD `git ls-remote`; fence blob identity check (`reports-transport.ts` `98147054…`, `user-portfolio-transport.ts` `51704c12…`, `owner-context-unavailable.ts` `cb8db45d…`); relative-link existence; documentation-only scope check; `git diff --check`. |
| Checks NOT performed | No application tests; no live HTTP/runtime/database/environment/deployment access; no Windows checks. **No live deployment or runtime behaviour is proven.** |
| Publication | Additive documentation-only commit on the session branch `arena/a2729fa4-iips-review-recovered`, appended to the existing PR #80 lineage; merge — and therefore effectiveness — is the Program Authority's act. |

---

## 12. REG-11 R4 — PR #42 Historical-Authority Reconciliation: Evidence Question RESOLVED, Outcome B (`2026-10-13`)

Full record: [`docs/integration/IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md`](docs/integration/IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md). Documentation only; grants, ratifies, and revokes nothing.

### 12.1 Determination

| Item | Result |
|---|---|
| R4 evidence question (does an operative act explicitly authorize the PR #42 merge and the associated persistence-lineage admission?) | **RESOLVED — Outcome B: existing authority conflict ESTABLISHED.** No act classifies `EXPLICITLY COVERS`. The operative records in force at merge time — D-1 §11/§12/§15, D-3 §11, and the Promotion-Scope Decision (its publication merge `0b961fec…` is the PR #42 merge's own first parent, `20:49:21Z` vs merge `21:09:33Z`) — expressly withheld promotion, main admission, merge of implementation branches, and package/dependency changes; the Promotion-Scope Decision's fail-closed condition ("the separate promotion execution act does not exist … NO promotion") was violated by the merge. |
| Coverage by act `26061859…` | **DOES NOT ADDRESS** the IRR operation; **EXPLICITLY EXCLUDES** Reports persistence from its own grant (full re-read at its commit; prior `Q2` finding confirmed and now closed as a search question within the stated boundary). |
| Coverage by any other act | **NOT LOCATED** within the stated search boundary (35 distinct IPD tips + 107 distinct IRR tips, full histories, decisive-token and file-name searches; no IPD commit exists on or after `2026-10-06`). Not a claim of proof of nonexistence beyond that boundary (dangling objects, non-cross-referenced GitHub objects, Arena/Windows/Library domains not searched). |
| Retrospective authorization | **NONE created, implied, or recommended.** Technical merge validity and governance authorization remain strictly distinguished. No assertion about any individual's conduct is made; this is a records-level finding. |

### 12.2 R4 gate status after this record

**R4 remains OPEN — `CONFLICT ESTABLISHED (Outcome B) / PA DISPOSITION PENDING`.** The required decision input (record §11): one explicit PA disposition choosing **R4-A** (prospective regularization at named commit/scope, expressly non-retroactive), **R4-B** (PA-directed remediation plan), or **R4-C** (recorded standing: present-without-authority, fail-closed, non-buildable-upon). None is pre-selected.

### 12.3 Preserved boundaries (unchanged)

R1/R2 remain governed by the Option C deferral (§11) — not reopened, and not resolved by R4's evidence resolution; R3 remains a separate open gate; Gate A and Gate C remain separate; Reports and User Portfolios remain fail-closed at source level (`503 owner-context-unavailable`; no live-deployment claim); no implementation, package admission, route/UI activation, runtime-configuration, IPD, or production change.

### 12.4 Changed files, checks and publication

| Item | Result |
|---|---|
| Changed paths | `docs/integration/IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md` (new) and this tracker (REG-11 row, §5 `CHG-2026-10-13-09`, this §12). Documentation only. |
| Baseline | IRR `main@721520cc059cd80ad16bd7fb68da5cd6ecbadd9b` (PR #80 merge; Option C durably published). IPD refs re-verified unchanged (`main` `4d3e1cd…`, pin `2e11fa3b…`, G24 `6828155e…` ×2, act branch `12c480b5…`); no IPD write. |
| Checks actually performed | Remote ref verification both repos; PR #42 metadata/files/commits/reviews/comments/timeline (GitHub API); ancestry via GitHub compare (`47edf6f3…` ancestor of `721520cc…`, 119/0); full-history reconstruction of the 2026-10-06 `main` sequence; full re-reads of the 5 NP-04 acts at their commits and of D-1/D-3/Promotion-Scope Decision operative provisions; decisive-token searches over all distinct tips and full histories of both repos; all-refs file-name inventory; `git diff --check`; documentation-only scope check. |
| Checks NOT performed | No application tests; no live HTTP/runtime/database/environment/deployment access; no Windows/PowerShell, Arena-archive, or Library access; no dangling-object search. **No live deployment or runtime behaviour is proven.** |
| Publication | Additive documentation-only PR from the session branch (`arena/54c0eee2-iips-review-recovered`, branched from `main@721520cc…`) to `refs/heads/main`; merge — and therefore durable effect — is the Program Authority's act. PR #80's merged history preserved; no second master tracker. |

---

## 13. REG-11 R4 — `R4-B` Remediation PA Decision Request and Minimum-Scope Plan: PA CHOICE PENDING (`2026-10-13`)

Full record: [`docs/integration/IIPS_v3.0_REG11_R4_B_REMEDIATION_PA_DECISION_REQUEST_AND_PLAN_2026-10-13.md`](docs/integration/IIPS_v3.0_REG11_R4_B_REMEDIATION_PA_DECISION_REQUEST_AND_PLAN_2026-10-13.md). Documentation only; selects nothing; authorizes nothing; performs no remediation.

### 13.1 Authority determination (hard stop honoured)

No existing explicit instrument permits the `R4-B` disposition or its implementation: Option C (§11) expressly withholds implementation authorization; the R4 reconciliation (§12) requires an explicit PA disposition; the G2-2 R2 operative constraints block "revert, remediation or retrospective promotion of PR #42" absent PA direction; the fast-track task instruction is **not** treated as PA approval by its own terms. **Remediation was NOT performed.** The exact approval required is stated verbatim in the record §8.

### 13.2 New evidence recorded (entanglement trace at `main@721520cc…`)

(1) The 10 `frontend/server/reports/` domain/test files are **byte-identical** to the PR #42 merge, have **zero** consumers outside the directory, and carry the **only** `./persistence` package-subpath edge in the codebase (a runtime dynamic import, fail-closed). (2) The server-level reports files, `secured-executor.ts`, tenant stores, admin/executive transports were **superseded by subsequently authorized work** (no-auth baseline `1f7997e…` 2026-10-12; F-3 mechanism `6729a26…`; 2026-10-07 family merges) — full revert of PR #42 is therefore **not** correct. (3) The pin `2e11fa3b…` is untouched since the merge and its live use is exactly the AD-02-admitted `./pit` + `./d114-non-production` scope recorded at that pin. (4) Fence blobs verified identical to the Option C-recorded identities.

### 13.3 Proposed minimum scope (pending PA selection)

Remove exactly the 10 named `frontend/server/reports/` paths; retain the fence, the pin (AD-02 basis), the `K2` comment (recorded), and all later-authorized states; verification bar and durable-publication criteria fixed in record §5.3. R4-A/R4-C remain available (§12.2); the selection is the PA's act.

### 13.4 Preserved boundaries (unchanged)

R1/R2 Option C deferral; R3 open and separate (consumer-edge removal would decide no future admission); Gates A and C separate; AD-01 `NOT ESTABLISHED`; P4 not admitted; fail-closed source-level baseline (`503 owner-context-unavailable`); no IPD write; no history rewriting; PR #80 history preserved; no second master tracker.

### 13.5 Changed files, checks and publication

| Item | Result |
|---|---|
| Changed paths | `docs/integration/IIPS_v3.0_REG11_R4_B_REMEDIATION_PA_DECISION_REQUEST_AND_PLAN_2026-10-13.md` (new) and this tracker (REG-11 row pointer, §5 `CHG-2026-10-13-10`, this §13). Documentation only. |
| Baseline | IRR `main@721520cc…` unchanged; PR #81 `OPEN` @ `a7ce7d9b…` (0 reviews/0 comments) re-verified; PR #80 `MERGED`; fence blobs `98147054…`/`51704c12…`/`cb8db45d…` verified current. |
| Checks actually performed | Remote ref + PR state verification; per-path `rev-list` entanglement counts for all 23 PR #42 paths; blob-set identity of `frontend/server/reports/` between `47edf6f3` and `main`; repository-wide import greps (`./persistence` edge census; reports-module consumer census); fence blob identity; documentation-only scope check; `git diff --check`. |
| Checks NOT performed | No application tests (no code changed); no live HTTP/runtime/database/deployment access; no Windows/PowerShell/Arena-archive/Library access. **No runtime or production behaviour is claimed proven.** |
| Publication | Additive documentation-only commit appended to the PR #81 branch (`arena/54c0eee2-iips-review-recovered`); PR #81 remains **OPEN** — its contents (R4 reconciliation + this decision packet) are mutually consistent and both state `PA choice PENDING`; merge — and durable effect — is the Program Authority's act. |
