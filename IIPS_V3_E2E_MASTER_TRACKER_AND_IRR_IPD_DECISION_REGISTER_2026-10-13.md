# IIPS v3.0 — E2E Master Tracker and IRR/IPD Program Authority Decision Register (2026-10-13)

| Field | Value |
|---|---|
| Canonical Tracker Path | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` |
| Program Authority (PA) | **Ramki** — single owner, sole user, and Program Authority of the single-user personal-use IIPS platform |
| Primary Repository (IRR) | `ramkivs/iips-review-recovered` (`refs/heads/main`) |
| Related Repository (IPD) | `ramkivs/iips-production-market-data` (`refs/heads/main` at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`, tree `db853dc21d01162e69b0e1211dbea1cb5c5f72b1`) |
| Pre-REG-08 IRR Baseline | Commit `f970028cf633f561c225d66ae4b3864f48afe656`; root tree `bab9782ed104567e571abccc350c75760ff35dca` (merge of PR #75) |
| Last Updated | `2026-10-13` (UTC) — `REG-11` Gate B bounded Reports owner-binding investigation (see §8); prior: `AD-20` bounded disposition (persistence lineage & identity contract decision gate; see §7) and additive governance reconciliation (see §6) |

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
| **REG-11 (`NP-06` / `F-4`)** | Governed Reports owner-context binding, D-1/PR #42 P1, qualification, and admission | Area F | IRR, IPD | D-1/D-2/D-3; AD-20 (PR #78 / `39d03d6…`); PR #42 (merge `47edf6f…`); G2-2 candidate AD-01 (PR #51 / `eb05e25…`; PR #53 / `3064a90…`); effective F-3 act/qualification (PRs #68–#70); accepted Reports branch `arena/01a0f1b3@6a8afbb2…` | **BLOCKED / DEFERRED** — bounded investigation recorded in §8; no F-3-to-Reports binding or product admission | Mixed: `PROVEN`, `DECIDED`, `UNPROVEN`, `CONFLICTING`, `DEFERRED` | D-1 designates the NP-04 artifact/report persistence domain and current IRR pin `2e11fa3…`; this proves technical persistence fit only. Reports expects principal-derived `(tenantId,userId)`; F-3 supplies partition-only `(tenantId,ownerUserId)`. No D-2 §8 contract exists. Current valid `/api/reports*` operations return source-level `503 owner-context-unavailable`. | No direct identity equivalence; no Reports pin/consumer admission from D-1 or AD-02; no no-auth Reports implementation authority; no F-7 qualification for the F-3 pair; no Reports UI/no-auth port or UI admission; no production. `PR #42` remains an unresolved historical authority conflict (P1). Exact IPD act `26061859…` does not cover PR #42; coverage by another act remains NOT ESTABLISHED. G2-2 AD-01 operative effect is NOT ESTABLISHED. | **Next:** PA-governed Reports owner contract or D-2 §8 translation decision; separately disposition P1; only then consider separate implementation authority, reproducible F-7 qualification, acceptance/admission, and any route/UI gate. Keep 503. Gate A is not a prerequisite to Gate B. |
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

---

## 5. Tracker Change Log (Additive)

| Date | Entry ID | Summary of Change |
|---|---|---|
| `2026-10-13` | `CHG-2026-10-13-01` | Initial consolidation of full-reference IRR (`main@f970028c`, 95 heads, 75 PRs) and IPD (`main@4d3e1cdc`, 32 heads, 6 PRs) investigation and Program Authority Decision Register (`REG-01` – `REG-13`). |
| `2026-10-13` | `CHG-2026-10-13-02` | Recorded PA decision `REG-08` (`APPROVED — bounded implementation authorized`, `docs/integration/IIPS_v3.0_REG08_BOUNDED_UI_HYGIENE_PA_DECISION_2026-10-13.md`), implemented and validated `ExecutiveDashboard.tsx` canonical engine IDs and `AiAdvisory.tsx` 13-sector selector (`33/33` focused tests pass, `tsc --noEmit` `0`, `npm run build` `0`), and published via PR #76 to `main`. |
| `2026-10-13` | `CHG-2026-10-13-04` | Recorded the `AD-20` bounded PA disposition via `docs/integration/IIPS_v3.0_AD20_PERSISTENCE_LINEAGE_IDENTITY_CONTRACT_DECISION_2026-10-13.md`: both IPD persistence lineages verified and classified as distinct domain stores that may coexist (neither on IPD `main`); persistence convergence (Gate A), Reports owner binding (Gate B), and Portfolio identity/security-identifier contract (Gate C) retained open as separate minimum next gates; IU-6 repin rationale left UNPROVEN and act `26061859` coverage of PR #42 left NOT ESTABLISHED (none invented). See §7. |
| `2026-10-13` | `CHG-2026-10-13-03` | Governance reconciliation of `REG-02` (admission preserved; stale banners additively clarified; P4 route decided NOT ADMITTED/retained), `REG-03` (`AD-06` reconciled at lineage & domain-role level; both persistence refs preserved; `AD-20` open), `REG-05` (Workflow = `HISTORICAL-ONLY`), `REG-06` (Operator Drop = internal primitive; product admission `DEFERRED`) via `docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md`; `REG-09` NP-07 records refreshed against the no-auth baseline `main@6c2c955` (`22/22` tests, `tsc` `0`, `build` `0`) and published to `main` (`NP-07-QUAL-01` / `NP-07-ACCEPT-01` v2.0). See §6. |
| `2026-10-13` | `CHG-2026-10-13-05` | One-pass `REG-11` Gate B investigation published at `docs/integration/IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_INVESTIGATION_2026-10-13.md`; corrected the AD-01 status claim and unverified `Reports.tsx` pointer, separated D-1 persistence fit from identity/consumer authority, preserved P1 and all fail-closed boundaries. Documentation only; no PA decision or application-code change. See §8. |

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

- **Publication PR:** to be identified in the linked GitHub PR metadata; it contains this record and the tracker update in one additive documentation-only change.
- **Source branch:** `arena/b7b3c81e-iips-review-recovered` → IRR `refs/heads/main`; baseline `39d03d6c293076dbac2fb4173c9482849e0c234b`.
- **Self-reference:** this tracker and investigation record are part of the publication tree, so their own PR head, merge commit, and resulting tree cannot be embedded without another publication. The linked PR is the durable coordinate; its remote merge metadata is authoritative for those self-referential values.
- **Post-merge proof required and reported:** merged PR state; exact two-path diff; both documents present on remote `main`; current Reports 503 transport, User Portfolios 503 transport, owner-context resolver, executive dispatch, and package pin unchanged from the investigation baseline; IPD `main`, NP-04 pin, G24 refs, and act ref unchanged; worktree clean. No test or live-runtime result is implied.
