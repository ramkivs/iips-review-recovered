# P1 — REPOSITORY CONVERGENCE — INVESTIGATION REPORT

**IIPS SINGLE-PLATFORM INTEGRATION & CONVERGENCE — P1 only.**
NON-PRODUCTION · READ-ONLY · NO MUTATION · NO MAIN MERGE · NO PUSH · NO COMMIT

- **Evidence date (UTC):** 2026-10-07
- **Method:** fresh full clones (non-shallow, non-partial) at `/tmp/p1p2-verify/{irr,ipd}`; direct `git ls-remote`; GitHub API via `gh`; in-clone history/tree/diff analysis. No repository was modified.
- **Attribution:** all IRR findings @ `ramkivs/iips-review-recovered` `origin/main` = `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` (tree `c6fb24d9093ee49e813561ba849c6c26d9da9805`); all IPD findings @ `ramkivs/iips-production-market-data` `origin/main` = `4d3e1cdca3a33da0ec3be8b336b17128108a502c` (tree `db853dc21d01162e69b0e1211dbea1cb5c5f72b1`), except where an unmerged branch/pinned commit is explicitly named.
- **STOP conditions:** A/B/C/E not triggered (authorities re-verified at P0 pins; full history available; no mutation required). STOP D evaluated — see §5; not triggered (implementation matches documented governance claims; discrepancies are documented staleness, classified in P2 §7).

---

## 1. P1 Repository Authority

| Repository | Ref | Commit | Tree | Verified |
|---|---|---|---|---|
| IRR `ramkivs/iips-review-recovered` | `origin/main` (`refs/heads/main`; remote HEAD → main) | `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` | `c6fb24d9093ee49e813561ba849c6c26d9da9805` | YES — `git ls-remote` (HEAD & `refs/heads/main` both = pin), `gh api commits/main`, fresh full clone (`is-shallow=false`, no promisor, clean, `0 0` divergence vs `origin/main`) |
| IPD `ramkivs/iips-production-market-data` | `origin/main` (`refs/heads/main`; remote HEAD → main) | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | `db853dc21d01162e69b0e1211dbea1cb5c5f72b1` | YES — same three independent channels; clean full clone; `0 0` divergence |

Both authoritative refs are **unchanged** from the P0-verified baselines (STOP A check performed 2026-10-07T15:48:15Z before any investigation). Remote branch inventory: IRR 68 branch heads / 47 PR refs / 2 tags; IPD 32 branch heads / 6 PR refs / 4 tags.

---

## 2. P1 Lineage Summary

### 2.1 IRR main (162 commits; single root `c65d533` "Import recovered IIPS workspace")

Lineage phases (all reachable from `origin/main`; verified via `git log --oneline origin/main` + `git show --stat` per promotion):

| Phase | Commits | Change | Reachable from main | Evidence | Classification |
|---|---|---|---|---|---|
| v3.0 engine program | `c65d533`…`5decdca` (tag `program-v1.2.0`, reachable) | 10-engine LTS → 13-engine certification (D38–D42, E2E-025…030); `iips-platform` sector engines (14 sectors incl. telecom/auto/materials) | YES | `git log`; `iips-platform/src/integration/EngineRegistry.ts` (13 `CERTIFIED_ENGINES`); `gh release list` shows published release `program-v1.2.0` (2026-09-05) | MERGED / REACHABLE |
| IU-5/IU-6 IPD PIT integration | `a9a33b5`, `fb2ac13`, `37d07b0`, `5164949` (PRs #1–#4 era) | Real non-production IRR→IPD PIT runtime integration; IPD dependency pinned; D114 PIT population integrated into IRR runtime | YES | `git show --stat`; `frontend/package.json` pin; `frontend/server/pit/*` | MERGED / REACHABLE |
| NP-12 N4 Screen | `3fc21b1`, `a0386fe`, … | Canonical Screen Definition + engine-free Screen-side runtime | YES | `iips-platform/src/sector-engines/cross-sector/{definition,screen,population}/`; `frontend/server/screener/screener-transport.ts` | MERGED / REACHABLE |
| NP-08 D08 Macro / D115 | `b489efd`, `b1db08c`, `2dc5563`, … | Macro route-contract change set; D115 runtime company-identity boundary; MoSPI source | YES | `frontend/server/macro/{macro-transport,mospi-source}.ts`; `frontend/server/d115-runtime.ts` | MERGED / REACHABLE |
| NP-13 / NP-15 governance | `265a38b`…`59adbfd` | D-series decision acts; NP-15 Phase-1 convergence investigation + declaration gate; **IPD publication FAILED (403, credential scope) → holding copy retained in IRR, D-NP15-12: deferred, D-NP15-7 half-satisfied, IRR↔IPD SHA cross-reference NOT established** | YES | `docs/integration/NP-15-*.md` incl. §8.2 (commit `59adbfd`) | MERGED / REACHABLE (IPD-side publication OPEN) |
| Governance decisions D-1/D-2/D-3 | `80a4dc9` (PR #38), `0a36dee` (PR #39), `cade02d`/`f4dab7d` (PRs #40/#41) | D-1 Option C (domain-scoped persistence ownership), D-2 Option B (domain-scoped identity/tenant), D-3 reports acceptance | YES | `docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`, `IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md`, `GOVERNED-REPORTS-*.md` | MERGED / REACHABLE |
| Family promotions (selective reconciliation pattern) | PRs #42–#47 + `29a43e5`, `a0ab5a3`, `17e234a` | Governed Reports (23 files, +5,982); Watchlists/Collaboration/Settings (34 files, +6,687); Evidence Landing; AI Advisory transport; Governed Screener composition; SPA OIDC handoff (9 files, +634); G-2 durable user portfolio (14 files, +3,651); main-health remediation (3 files, +42/−20) | YES | `git show --stat` per candidate commit (`4906a6b`, `3d29aea`, `80f5b19`, `ddba1bd`, `bdbba1f`, `0e2d6d2`, `c8f37d5`, `0882242`); each merges via PR with a "Candidate: … reconciled onto main" commit | MERGED / REACHABLE — **selective promotion**: candidate commits are re-authored unions, not branch merges |

**Topology finding (IRR):** IRR contains a **second, disjoint program line**. `gai-impl-canonical` (tip `f63a9b4`), `phase13-next` (`4357e14`), `phase13-hardening-delivery` (`254e472`) are rooted at `7325aed` ("chore: establish durable Phase 12 certified baseline") which shares **no common ancestor** with main's root `c65d533` (`git merge-base origin/main origin/gai-impl-canonical` → empty). Consequence: **tag `v3.0-phase12-certified` → `7325aeda` is NOT reachable from IRR `origin/main`** (reachable only via the disjoint line). By contrast, tag `program-v1.2.0` → `5decdca` IS reachable from main.

### 2.2 IPD main (94 commits; two-commit-root era: `e93b14a` baseline → P13–P17 certs → D114 stages → BI-03…BI-08 → v1.0.0-rc1 → full-IIPS shell recovery → UI08/UI06)

| Phase | Commits | Change | Reachable from main | Evidence | Classification |
|---|---|---|---|---|---|
| Program v1.0 + certs | `e93b14a`…`b797437` | P13–P17 certification, WS-E UI01–UI14, OQ/release evidence | YES | `git log origin/main` | MERGED / REACHABLE |
| D114 historical data | `da4e5b5`…`ba47efd` | 10-year NSE CM-UDiFF + Bhavcopy parsers, dual-era reconciliation, Windows evidence handoff | YES | `src/d114/*`; `evidence/` | MERGED / REACHABLE |
| BI-03…BI-08 broker import | `83ba584`…`d1a813c` | FINAPP/Dhan/Groww/Zerodha adapters, format detector, atomic merge, idempotency guard, React host integration | YES | `frontend/src/features/portfolio/import/*` | MERGED / REACHABLE |
| v1.0.0-rc1 + Windows acceptance | `5cfcf82`, `8a058f6`, `005f732` (PR #1); `91a0a3d`/`b217f7a` (PR #2) | Release-candidate seal; full-shell technical acceptance | YES | `git log`; PR merges | MERGED / REACHABLE |
| Full-IIPS shell recovery (Option A) | `f13002e`, `144e8ed`, `881371e`, `c7faf1f`, `f9101be`, `ad2205a`, `6b8afda` | Donor shell restored from **full-IIPS baseline tree `682f4e6029818c839f23211ae5067eed862c5037` on IPD branch `arena/01a0c440`**; API/auth-coupled donor routes render fail-closed (`UnavailableSurface`) | YES | `frontend/src/app/routes.ts` (donor citation at head); `git ls-tree 01a0c440` | MERGED / REACHABLE (donor itself unmerged — see §3) |
| UI08 Security Master / UI06 screener | `c3d61a1` (PR #3), `f7cd994` (PR #4) | UI08 security-master surface; UI06 multifactor screener surface restored — **mounted route fails closed: "D01-derived governed candidate universe is not commissioned"** | YES | `frontend/src/features/screener/MultiFactorScreenerSurface.tsx` head comment; `frontend/src/features/security-master/SecurityMasterSurface.tsx` | MERGED / REACHABLE (functionality bounded by design) |

**Topology finding (IPD):** all four tags (`p14-r7-65b78f7`, `portfolio-option-a-cb969b6`, `post-cleanup-baseline-b46b4f4`, `temporary-cleanup-caf73ba`) point to commits **NOT reachable from `origin/main`** (verified `git merge-base --is-ancestor` per tag → NO for all four).

---

## 3. P1 Omission Ledger

Branches with commits ahead of `origin/main` (method: `git rev-list --count origin/main..origin/<b>` + `git cherry` + two-dot content diffs for material branches). IRR: 18 such branches (16 main-descended, 3 disjoint-rooted — note `phase14.1-recovery-deposit` main-descended). IPD: 31 such branches. Material items:

### IRR

| Item | Repository | Evidence | Status | Impact |
|---|---|---|---|---|
| `gai-impl-canonical` @ `f63a9b4` (47 commits ahead; disjoint root `7325aed`) | IRR | `git log origin/main..origin/gai-impl-canonical`; two-dot diff 501 files / +77,572 −22,173 | **UNMERGED parallel line — partially superseded, residual unique work NOT reconciled** | **HIGH** — contains capability work absent from main (P-1 notifications, P-2 notes, PF-2 roster/trigger, secret-management authority, global search palette, governed hubs N+8–N+15, embedded AI explanation, real-socket dispatch coverage). Main carries separately-governed parallel implementations of overlapping surface (macro/MoSPI, OIDC, AI-advisory transport, screener, 13 engines). Residual unique work has no recorded disposition → **UNEXPLAINED residual** |
| `phase13-next` @ `4357e14` (78 ahead; disjoint) + `phase13-hardening-delivery` @ `254e472` (6 ahead; disjoint) | IRR | two-dot diffs; v1.2 release docs present on main via `program-v1.1-certification/` | **SUPERSEDED (partially)** — Phase 13/14 hardening & NP-18 qualification line; v1.2 tag/release exist on main; NP-18 qualification records unmerged | MEDIUM (records/evidence only) |
| `arena/a2df3b85` @ `5eba01b` (7 ahead; main-descended) | IRR | two-dot diff = exactly 5 added files: 2 E2E-015 promotion/closure records (root), `frontend/server/persistence/{restart-proof-writer,restart-proof-recoverer,persistence-restart-proof.test}.ts` | **PARTIALLY MERGED** — engine-ID taxonomy content of `5eba01b` is byte-identical on main (promoted as `0882242`); residual: PF-1 separate-process restart proof + 2 records | **MEDIUM-HIGH for P3** — the D-1 §3.8 journal restart-durability proof is NOT on main |
| `arena/01a0f1b3` (NP-06 Reports qualification, 28 ahead; main-descended stale snapshot) | IRR | two-dot diff 198 files / +3,833 −57,155 (branch predates most of main) | **SUPERSEDED** — governed Reports promoted via PR #42 with own acceptance docs on main | LOW |
| `arena/01a0c0e` (1 ahead, patch-equivalent to main `d0c6f80`) | IRR | `git cherry` → 1 `^-` | **MERGED (content)** / SUPERSEDED | NONE |
| Doc/record-only branches: `01a06af2` (E2E-015 authorize — superseded by `0e2d6d2` promotion), `01a077de`/`01a07ccb` (E2E-016 charter/certification), `01a0ddea`/`01a0ddff`/`01a03e3b` (NP-18 / D7-TIER3), `01a0e30f` (D8/GATE-Y acts), `01a0f351` (NP-10 correction), `01a0f64b` (NP-13 acceptance), `01a1079e` (D115 completion), `01a10b3c` (remote durability verification), `01a10cce` (capability evidence reconciliation), `phase14.1-recovery-deposit` | IRR | subjects + `--stat` (docs-only) | **SUPERSEDED** where main carries the counterpart record (E2E-015, NP-13, D115 partial); otherwise **UNEXPLAINED (records only, no code impact)** — e.g., E2E-016, D7-TIER3, NP-18 records have no main counterpart | LOW (governance records) |

### IPD

| Item | Repository | Evidence | Status | Impact |
|---|---|---|---|---|
| `np04-governed-persistence-windows` @ `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (26 ahead of main) | IPD | `git merge-base --is-ancestor 2e11fa3b origin/main` → **NO**; `rev-list` 0/26; diff main→pin adds `src/persistence/{db,errors,identity,index,package,reportKey,schema,store}.ts` (NP-04, +1,831), `src/pit/pit_read_service.ts`, `src/d114/non_production_{package,pit_population}.ts` (+818), package `exports` incl. `./persistence`, `./pit`, `./d114-non-production`, 5 test suites; **IRR `frontend/package.json` pins exactly this commit** | **INTENTIONALLY NOT PROMOTED** (per IRR D-1: "Neither lineage is thereby promoted to current main") — but it is a **hard dependency of IRR main** (PIT read seam + Reports persistence seam) | **CRITICAL** — the IPD state IRR main consumes is not IPD `origin/main`; `src/persistence` does not exist on IPD main; IPD main `package.json` has **no `exports` field at all**, so the subpaths IRR imports cannot resolve from main |
| `arena/01a0e6d9` = `arena/01a0f308` @ `6828155` (26 ahead) — **G24 lineage** | IPD | unique commits incl. `8c99627` "NP04-G24: non-production durable persistence implementation" (+7,720: `src/persistence/{bootstrap,config,connection}` + migrations 001/002, `src/server/http-server.ts` (457 lines) + authorization, `src/auth/oidc-verifier.ts` + jwks, `src/app_identity/*`, `src/portfolio/{durable-store,repository,consolidation}`, 8 G24 test files) and `6828155` NP04-G32 governance; **IRR `userPortfolioContract.ts` pins this lineage** (`G2_LINEAGE`) | **INTENTIONALLY NOT PROMOTED** (G-2 contract: acceptance "SHA/tree-bound to 6828155; main admission prohibited") | **CRITICAL** — the G-2 durable user-portfolio backend (SQLite + OIDC + HTTP `/api/ipd/*`) exists ONLY here; **second, different persistence package than NP-04** (only `errors.ts`/`index.ts` names shared, blobs differ; db/identity/reportKey/schema/store exist only on NP-04; bootstrap/config/connection/migrations only on G24) |
| `arena/01a0f839` @ `12c480b` (5 ahead) | IPD | NP04 promotion authority + post-promotion acceptance acts (governance only) | **INTENTIONALLY NOT PROMOTED** (governance-only; bound to `6828155`) | MEDIUM (acceptance evidence for G-2) |
| `iu-6-d114-pit-population` @ `246cb94` (22 ahead); `arena/01a0ec3d` @ `46aaa59` (20 ahead) | IPD | both are ancestors of the NP-04/G24 lineages (merge-base `246cb94`; PRs #5/#6 merges `c2b2f19`, `0dab122`) | **MERGED into pinned lineages; NOT on main** | HIGH (same criticality as parents) |
| `arena/01a0cf86` @ `ea70a8c` (1 ahead) | IPD | two-dot diff: adds `src/transports/executive_transport.ts` (295 lines), `tests/executive_recovery_integration.test.ts`, `IIPS_EXECUTIVE_CONTROLLED_RECOVERY_REPORT.md`, `forensic-evidence/executive-live-reexecution-20260924/*` | **UNEXPLAINED** — Stage-4 Executive controlled recovery (functional executive transport + live-reexecution forensic evidence) not promoted; main's `/executive` is presentation-only (Path L) | MEDIUM |
| `arena/01a0c440` @ `42f91fa` (192 ahead) | IPD | holds the **full-IIPS donor baseline tree `682f4e60…` cited by IPD main's `frontend/src/app/routes.ts`** + D115 blocked-identity records | **INTENTIONALLY NOT PROMOTED (donor/provenance branch)** | MEDIUM — main's shell restoration cites this unmerged tree as its structural donor |
| `arena/01a0d943` (DHAN-D2 dev-only synthetic fixture surface, 3 ahead) | IPD | docs/evidence only, "development-only synthetic fixture demonstration" | **INTENTIONALLY NOT PROMOTED** (dev-only) | LOW |
| Historical development/blocked/parked lines: `01a0814b` (D89 UI12 data-mode, 177), `01a0853c` (R-2 provider-neutral market data, 45), `01a0853d` (P08 BLOCKED, 73), `01a0853d-…` (D56, 152), `01a0a438` (D115 Stage-3 prep, 216), `01a0a4a1` (P13-B persistence merge, 11), `01a0ae80` (D115 evidence, 191), `01a0bdb5` (BI-03 era, 182), `01a0c86d` (D115 parked, 186), `01a0d1d3` (R-1 exec topology, 26), `01a0d33d` (G6 manifest, 48), `01a0ddae` (GATE-Y D06/D07, 50), `01a0e30c` (P01-01 identifier spec, 22), `m1-ad4-repair` (79), `p14-implementation-recovered` (101), `windows/d114-stage5-banking-replay-observation` (192) | IPD | era subjects (BI-, P13–P17, D114, P14, D115, D89) all present in main history as directly-applied commits; two-dot diffs large (732–1,414 files) | **SUPERSEDED (historical development lines; era output present on main)** — per-branch content equivalence NOT exhaustively verified (see Evidence Gaps) | LOW–MEDIUM |
| Tags outside main ancestry: all 4 IPD tags (see §2.2) | IPD | `git merge-base --is-ancestor` → NO ×4 | **UNEXPLAINED** (tag targets on unmerged lines) | LOW (provenance hygiene) |

---

## 4. P1 Cross-Repository Boundary

**What belongs to IRR (on authoritative main):** the certified sector-engine library and program (`iips-platform`: 14 sector engines, frozen calibration assets, `EngineRegistry` 13 certified engines, framework/registry/snapshot/replay/runtime/plugin-loader/distributed runtimes); the full application shell UI (`frontend/src`, 97 files: executive, portfolio (certified reference), company, cross-sector, decision-matrix, evidence, replay, research/macro, screener, engines, admin, watchlists, collaboration, settings, AI advisory); the Node API server (`frontend/server`, 78 files) with the security boundary (Keycloak/`SecuredExecutor`/`TenantDirectory`/D115 company runtime); NP-12 N4 governed Screen; PF-1 filesystem journal persistence (watchlists/collaboration/settings); the G-2 consumer contract/port/adapter/transport; the PIT read consumer stack; governance decision records (NP-xx, D-1/D-2/D-3, G-2).

**What belongs to IPD (on authoritative main):** canonical market-data contracts D01–D09 + `CanonicalEnvelope`/provenance; instrument identity (D05 broad-universe security master — verified 2,250 ISIN records = 52 real + 2,198 synthetic per BLOCK-3L audit; mapping store; quarantine; governed fixture master); point-in-time store (in-memory, `companyId`-keyed); D114 parsers/ingestion; quality/normalization/ingress/spi/fundamentals/intelligence/engine_adapters; UI view models UI01–UI14; in-process `ScreenerService` (Contract C6); the restored full-IIPS offline shell (`frontend/src`, 49 files; portfolio broker-import workspace with Zerodha/Groww/Dhan/FINAPP adapters, session-lifetime store); Windows acceptance evidence; OQ/e2e/operations modules.

**Actual integration points (all originate on IRR main; none are on IPD main):**
1. **Package pin:** IRR `frontend/package.json` → `iips-production-market-data` `github:ramkivs/iips-production-market-data#2e11fa3b…` (IPD branch `np04-governed-persistence-windows` tip, 26 commits ahead of IPD main). Consumed subpaths: `./pit` (`PitReadService`, `PointInTimeStore`, `DataProvenanceDTO`), `./d114-non-production` (`populateNonProductionD114Pit`), `./persistence` (`openDatabase`, `GovernedArtifactStore`). Files: `frontend/server/pit/{ipdPitReadAdapter,nonProductionPitStore,nonProductionRuntimePitStore}.ts`, `frontend/server/reports/persistence-port.ts`.
2. **G-2 HTTP wire contract:** IRR `frontend/server/user-portfolio/*` ↔ IPD G24 lineage `arena/01a0e6d9 @ 6828155` (`/api/ipd/portfolios*`, audience `ipd-user-portfolio-api`, header `x-ipd-tenant-id`), acceptance `arena/01a0f839 @ 12c480b`. No package import — HTTP only.
3. **Shared shell lineage:** 23 identical relative paths between IRR `frontend/src` and IPD `frontend/src` (App, AppShell, Sidebar, TopBar, navigation, routes, shared components, PortfolioWorkspace); only 3 byte-identical (`DecisionComponents.tsx`, `ShellStates.tsx`, `Badges.tsx`). IPD's shell is donor-derived (donor tree on IPD branch `arena/01a0c440`), not exported from IRR.

**Unexplained duplication / divergence:**
- **Two screeners:** IRR governed NP-12 N4 Screen (server-derived 13-member population, `POST /api/screener`) vs IPD `ScreenerService` (Contract C6, PE/ROE/margin filters, fails closed — universe uncommissioned). No shared contract.
- **Two portfolios:** IRR certified reference portfolio (`/api/portfolio`, frozen engine DTO) + G-2 durable user portfolios (G24-backed) vs IPD BI-07/08 broker-import portfolio workspace (session-lifetime, in-memory). No integration between IPD main's portfolio and G-2.
- **Two PIT keyings on IPD:** main `PointInTimeStore` keys `${companyId}:${domain}`; the pinned lineage (IU-1) keys by series-aware `securityId` (`ISIN:<isin>:<series>`) — the keying IRR's contract requires exists only off-main.
- **Two different persistence packages on two unmerged IPD branches** (NP-04 `store/db/schema/reportKey/identity` vs G24 `connection/bootstrap/migrations`), both required by IRR main, neither on IPD main. IRR D-1 explicitly declares them **distinct, non-interchangeable domains**.
- **Parallel program line in IRR** (`gai-impl-canonical` et al., disjoint root) with overlapping-but-separate implementations of macro, auth, AI advisory, screener-adjacent surfaces.

**Missing integration evidence:**
- NP-15 IPD-side publication (blocked by credential scope; holding copy in IRR; IRR↔IPD commit-SHA cross-reference NOT established — D-NP15-7 half-satisfied).
- G-2 UI consumer: no IRR frontend client calls `/api/user-portfolios` (documented as deliberate: "no portfolio UI / navigation / browser client" in `user-portfolio-transport.ts`); live seam answers 503 until IdP issues the IPD audience (live-IdP work deferred).
- No integration path exists from IPD main's restored shell to IRR's server (donor API routes render fail-closed `UnavailableSurface` by design).

---

## 5. P1 Conclusion

## **CONVERGENCE PARTIALLY ESTABLISHED**

- Both repositories' authorities, histories, and promotion lineages were fully reconstructed; IRR main's promotion chain (selective reconciliations via PRs #1–#47) is coherent and evidence-backed.
- The IRR→IPD integration is real, contract-governed, and implemented **on IRR main** — but every IPD-side counterpart it depends on (PIT population/read service/package exports; NP-04 artifact persistence; G24 durable portfolio + OIDC + HTTP server) exists **only on IPD branches that are not `origin/main`**. Under the authoritative-ref doctrine (`origin/main` for both repos), the cross-repository convergence state is therefore only partially established.
- This off-main state is **documented and intentional** per IRR-side governance (D-1: "Neither lineage is thereby promoted to current main"; G-2 contract: "main admission prohibited") — i.e., not an unexplained divergence — but it remains an open convergence condition: IPD `origin/main` does not currently contain the state IRR `origin/main` consumes.
- Additional partial aspects: disjoint parallel line in IRR with unreconciled unique work; NP-15 IPD-side publication blocked; duplicated shell/screener/portfolio surfaces across repos without shared contracts.

**END P1**
