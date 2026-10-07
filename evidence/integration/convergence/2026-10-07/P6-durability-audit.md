# P6 — DURABILITY AUDIT & AUTHORITATIVE STATE RECONCILIATION — REPORT

**IIPS SINGLE-PLATFORM INTEGRATION & CONVERGENCE — P6 only.**
NON-PRODUCTION · READ-ONLY · NO MUTATION · NO MERGE · audit/reproduction in disposable areas only

- **Evidence date (UTC):** 2026-10-07 (P6 stage, ~17:00Z)
- **Method note / incident disclosure:** at P6 start the sandbox's command-execution channel became unavailable (platform 503 incident; every `bash` invocation — including trivial probes — failed before execution). **No command was executed against any repository, clone, or worktree during P6**; the last verified state (P4 §0: all tracked worktrees 0 modifications) therefore stands. Authority re-verification and lineage-tip verification were performed through an independent channel — the **GitHub web interface** (`github.com` repository, branch, commit, and raw-file pages) — with results cross-checked against the in-session `git ls-remote`/fresh-clone verifications performed at 16:10:37Z (P3 stage). All P6 evidence below cites its channel.

---

## 1. Authority Verification

| Repository | Authoritative ref | Required pin | Observed (web channel, P6) | In-session git verification (16:10:37Z) | Verdict |
|---|---|---|---|---|---|
| IRR `ramkivs/iips-review-recovered` | `origin/main` | `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` | Latest commit on main = `17e234a1…` "Promote main-health remediation to main (MHEALTH-PROMO-2026-10-07)", 162 commits, 68 branches, 2 tags | `HEAD` and `refs/heads/main` both = pin; clean full clone | **UNCHANGED — STOP check passed** |
| IPD `ramkivs/iips-production-market-data` | `origin/main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | Latest commit on main = `4d3e1cdc…` "Merge pull request #4 … UI06 Multifactor Screener Restoration", 94 commits, 32 branches, 4 tags | same, both channels | **UNCHANGED — STOP check passed** |

Branch/tag counts match the P0/P1 inventory (IRR 68/2, IPD 32/4) — no structural movement.

---

## 2. Artifact Durability Matrix (P6.1 / P6.9)

| # | Material artifact | Repository / path | Commit (tree) | Reachable from authoritative main? | Owner lineage if not | Another process can retrieve? | Reproducible without Arena state? | Classification |
|---|---|---|---|---|---|---|---|---|
| 1 | PF-1 journal implementation (`persistence-service.ts`) | IRR `frontend/server/persistence/` | `17e234a1` (`c6fb24d9`) | YES | — | YES (public repo, main) | YES | **AUTHORITATIVE MAIN** |
| 2 | PF-1 journal tests (`persistence-service.test.ts`) | IRR same dir | `17e234a1` | YES | — | YES | YES | **AUTHORITATIVE MAIN** |
| 3 | PF-1 separate-process restart proof (writer/recoverer/test) + 2 E2E-015 records | IRR `frontend/server/persistence/restart-proof-*` + root records | `5eba01b` (`3573fcc0`) on `arena/a2df3b85-iips-review-recovered` (tip verified unchanged, web) | **NO** (files absent on main) | `arena/a2df3b85` | YES (named branch, public) | YES (executed natively in P3) | **AUTHORITATIVE PINNED LINEAGE** (branch-only; implementation blob identical to main) |
| 4 | NP-04 governed persistence package (`src/persistence/*` + 5 test suites) | IPD `src/persistence/` | `2e11fa3b` (`7c1d516a`) on `np04-governed-persistence-windows` (tip verified unchanged, web) | **NO** | pin branch | YES | YES (720/720 + two-process proof in P3/P4) | **AUTHORITATIVE PINNED LINEAGE** |
| 5 | IRR consumer side of NP-04 (`reports/persistence-port.ts`, `np04-adapter.ts`, `persistence.ts`, reports-transport + tests) | IRR `frontend/server/reports/` | `17e234a1` | YES | — | YES | YES | **AUTHORITATIVE MAIN** |
| 6 | G-2/G24 durable portfolio stack (`src/{persistence,portfolio,server,auth,app_identity}` + 8 g24 test files, migrations 001/002) | IPD | `6828155` (`eb07ea36`) on `arena/01a0e6d9-iips-production-market-data` (tip verified unchanged, web) | **NO** | G24 lineage | YES | YES (84/84 + two-process proof) | **AUTHORITATIVE PINNED LINEAGE** |
| 7 | G-2 acceptance acts (G31 acceptance, promotion authority, A3 designation, post-promotion acceptance; SHA/tree-bound to `6828155`/`eb07ea36`; "main 4d3e1cd UNMOVED; main promotion NOT authorized") | IPD governance docs | `12c480b` (`79e05023`) on `arena/01a0f839-iips-production-market-data` (tip verified unchanged, web) | **NO** | acceptance lineage | YES | YES | **AUTHORITATIVE PINNED LINEAGE** (governance-only) |
| 8 | G-2 contract/port/adapter/transport/translationBoundary + tests (wire-stub) | IRR `frontend/server/user-portfolio/` | `17e234a1` | YES | — | YES | YES | **AUTHORITATIVE MAIN** |
| 9 | IPD main PIT store, contracts D01–D09, identity, D114, view models, shell | IPD `src/`, `frontend/src/` | `4d3e1cdc` (`db853dc2`) | YES | — | YES | YES (542/542) | **AUTHORITATIVE MAIN** (medium non-durable — recorded fact, not a classification demotion) |
| 10 | IPD broker-import portfolio (BI-07/08) | IPD `frontend/src/features/portfolio/` | `4d3e1cdc` | YES | — | YES | YES | **AUTHORITATIVE MAIN** (session-lifetime by design) |
| 11 | IPD executive transport + embedded `iips-platform/` copy + recovery test + forensic evidence | IPD `src/transports/executive_transport.ts` etc. | `ea70a8c` (`1cd0515`) on `arena/01a0cf86-iips-production-market-data` (tip verified unchanged, web) | **NO** | exec recovery branch | YES | YES (18/18) | **HISTORICAL / NON-AUTHORITATIVE** — unmerged recovery artifact; promotion status **UNEXPLAINED** (no disposition act found) |
| 12 | Disjoint program line (P-1/P-2/PF-2/secret-mgmt/search/hubs/Keycloak-browser/AI-canonical) | IRR `gai-impl-canonical` @ `f63a9b4` (tip verified unchanged, web), `phase13-next` `4357e14`, `phase13-hardening-delivery` `254e472` (root `7325aed`, disjoint) | — | **NO** (no common ancestor with main) | disjoint line | YES | partially (line-tested per its own records; not re-run in P3–P5) | **HISTORICAL / NON-AUTHORITATIVE** — partially SUPERSEDED by main's parallel implementations; residual unique work UNEXPLAINED (no disposition) |
| 13 | Governance decision records (D-1, D-2, D-3, G-2 contract record, NP-15 records incl. holding copy) | IRR `docs/integration/` | `17e234a1` | YES | — | YES | YES | **AUTHORITATIVE MAIN** |
| 14 | IRR README / ENGINEERING_READINESS_REVIEW.md | IRR root | `17e234a1` | YES | — | YES | YES | **DUPLICATE/STALE** (README tag/release claims CONTRADICTED — P2; ERR HISTORICAL-SUPERSEDED) |
| 15 | Frozen v1.1 Replay Baseline (13 sectors) + certification assets | IRR `program-v1.1-certification/` | `17e234a1` | YES | — | YES | YES | **AUTHORITATIVE MAIN** (material to the 43-failure root cause, §7) |
| 16 | Tag `program-v1.2.0` → `5decdca` | IRR | — | YES | — | YES | YES | **AUTHORITATIVE MAIN** |
| 17 | Tag `v3.0-phase12-certified` → `7325aed`; IPD tags ×4 (`p14-r7…`, `portfolio-option-a…`, `post-cleanup…`, `temporary-cleanup…`) | IRR / IPD | — | **NO** (all five; verified in-session 16:10Z) | disjoint / historical lines | YES | YES | **HISTORICAL / NON-AUTHORITATIVE** — see §9 |
| 18 | P0–P5 investigation reports (6 files) | Arena workspace `/home/user/*.md` | — | n/a | **ARENA-ONLY** | NO (not in any repo) | NO (as artifacts) — their FACTS are repo-verifiable | **ARENA-ONLY** (§3) |
| 19 | P3.2 durability driver scripts + captured outputs + temp storage | sandbox `/tmp/p3p5-verify/` | — | n/a | **ARENA-ONLY (ephemeral)** | NO | facts reproducible (§6) | **ARENA-ONLY** (§3) |

---

## 3. Arena-Only State Audit (P6.2)

| Item | What it proves | Reconstructable from repository state? | Repository artifact exists? | Absence affects reproducibility? | Required action (NOT performed) |
|---|---|---|---|---|---|
| `P0-authoritative-baseline-reconciliation.md` | Authority pins + clone hygiene | YES (ls-remote/gh api commands recorded inside it) | No equivalent single artifact | No — re-runnable in minutes | Publication would require authorization; proposed path e.g. IRR `evidence/integration/P0-…` — not executed |
| `P1-repository-convergence.md` | Lineage reconstruction, omission ledger | YES (all git commands recorded) | Partially (governance docs cover promoted items only) | No | Same as above |
| `P2-contract-implementation-discovery.md` | Contract/implementation map | YES (paths/symbols recorded) | No | No | Same |
| `P3-persistence-durability.md` | Durability proofs + provenance | YES — every proof re-derivable from repo lineages; repo-side test suites cover the same semantics (`persistence-service.test.ts` on main; `np04_governed_persistence.test.ts` on pin; `g24_*` on G24; restart-proof on `a2df3b85`) | YES (equivalent repo tests exist at each lineage) | **No** — the durability FACTS do not depend on Arena state | Same |
| `P4-validation.md` | Executable health ledger | YES (exact commands/commits recorded; all suites re-runnable) | No (test results are transient by nature) | No | Same |
| `P5-capability-sweep.md` | Capability matrix | YES (evidence pointers to repo artifacts) | No | No | Same |
| `/tmp/p3p5-verify/drivers/*.ts` (journal/np04/g24 two-process drivers, PIT demo) + `/tmp/p3p5-verify/storage/*` | P3.2 cross-process protocol executions | YES — trivially re-writable from the recorded protocol + public APIs | YES (equivalent semantics in repo test suites; the branch-native restart proof is repo-hosted) | No | None (ephemeral by design); optionally publish driver scripts alongside P3 report if authorized |
| `/tmp/p3p5-verify/*` clones/worktrees/logs | Investigation environment | YES (fresh clones) | n/a | No | None |

**Conclusion:** no REQUIRED implementation or proof exists only in Arena state. Arena-only items are reports and drivers whose facts are independently re-derivable from public repository state. Publication of the reports would require authorization and is recorded as a condition, not performed.

---

## 4. Off-Main Lineage Audit (P6.3)

| Lineage | Purpose | Used by main? | Durable? | Tested? | Main reachable? | Governance disposition | Audit status |
|---|---|---|---|---|---|---|---|
| IPD NP-04 pin `np04-governed-persistence-windows` @ `2e11fa3b` | Governed artifact persistence (SQLite/node:sqlite) + PIT read service + D114 population + package exports | **YES — hard dependency of IRR main** (`frontend/package.json` pin; subpaths `./pit`, `./d114-non-production`, `./persistence`) | YES (branch tip on GitHub; WAL/FULL durability of the store PROVEN in P3) | YES (720/720 at pin, incl. NP-04 + IU-1/2/3/6 suites) | NO (26 commits ahead of IPD main) | IRR D-1: distinct artifact domain; "neither lineage promoted to current main" — deliberate | **VALID PINNED LINEAGE; NOT AUTHORITATIVE MAIN** — the key reproducibility condition (§5) |
| IPD G-2 `arena/01a0e6d9` @ `6828155` | Durable user portfolio (better-sqlite3, migrations, OIDC, `/api/ipd/*`, app-identity registry) | YES at contract level — IRR main `userPortfolioContract.ts` pins this lineage (`G2_LINEAGE`); HTTP-only, no build-time fetch | YES (branch tip verified; store durability + identity recovery PROVEN) | YES (G24 suite 84/84 — historical claim independently verified) | NO (26 ahead) | D-1 Option C portfolio domain; G-2 contract "main admission prohibited"; acceptance acts bind SHA/tree | **VALID PINNED LINEAGE; NOT AUTHORITATIVE MAIN** |
| IPD G-2 acceptance `arena/01a0f839` @ `12c480b` | Acceptance governance (G31 acceptance ACCEPTED; promotion authority; A3 designation; post-promotion acceptance) | Referenced (pinned in IRR contract as acceptance coordinate) | YES (tip verified; governance-only files) | n/a (docs) | NO (5 ahead) | Verbatim: "main 4d3e1cd UNMOVED; main promotion NOT authorized; certification NOT created; production NOT authorized" | **VALID PINNED LINEAGE (governance)** |
| IRR restart-proof `arena/a2df3b85` @ `5eba01b` | PF-1 separate-process journal restart proof (D-1 ext. §3.8) + E2E-015 records | NO (files not on main); implementation under proof IS on main (blob-identical `ca735d5d…`) | YES (tip verified) | YES (proof executed natively in P3; vitest orchestrator on branch) | NO (7 ahead; root content promoted as `0882242`/`17e234a`) | No promotion disposition found for the proof artifacts | **VALID PINNED LINEAGE; implementation=MAIN, artifacts=BRANCH-ONLY** — condition recorded |
| IPD exec `arena/01a0cf86` @ `ea70a8c` | Stage-4 Executive certified computation transport + full `iips-platform/` copy + forensic re-execution evidence | NO (main `/executive` is presentation-only) | YES (tip verified) | YES (18/18 recovery integration test) | NO (1 ahead) | **No promotion/acceptance disposition found** | **NON-AUTHORITATIVE; UNEXPLAINED promotion status** — material because it is the only functional executive computation on IPD side |
| IRR `gai-impl-canonical` @ `f63a9b4` / `phase13-next` `4357e14` / `phase13-hardening-delivery` `254e472` (disjoint root `7325aed`) | Parallel program line: P-1/P-2, PF-2, secret-mgmt, global search, hubs, Keycloak browser auth, AI-advisory canonical, dispatch coverage | NO (main has separately-governed parallel implementations of overlapping surfaces) | YES (tips verified; `f63a9b4` tip confirmed unchanged via web) | Internally (per its own commit records: "656 passed / 21 skipped / 0 failed" at tip; not re-run in P3–P5) | NO — **no common ancestor with main** (`c65d533`) | No disposition for residual unique work; tag `v3.0-phase12-certified` on this line | **NON-AUTHORITATIVE; partially SUPERSEDED; residual UNIQUE work UNRECONCILED** |

**Key distinction upheld:** each pinned lineage above is *valid, durable, and tested* without being *authoritative main*. These states are not collapsed anywhere in this audit.

---

## 5. Cross-Repository Reproducibility (P6.4)

**External dependency inventory of IRR main @ `17e234a1` (from authoritative `frontend/package.json`, fetched raw):**
- `iips-production-market-data`: `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` — **the only non-registry dependency**; consuming paths: `frontend/server/pit/*` (PIT read seam, D114 population) and `frontend/server/reports/persistence-port.ts` (dynamic `./persistence` import); plus the cross-repo integration tests and the manifest-assertion test.
- Registry deps: `react ^18.3.1`, `react-dom ^18.3.1`, `react-router-dom ^6.28.0` (registry-resolvable). `iips-platform` is in-repo (relative imports, no package dependency). No other git/file/url dependencies exist.

**Dependency vs authoritative main:**
- Pin `2e11fa3b` = tip of `np04-governed-persistence-windows`, **26 commits ahead of IPD `origin/main`, NOT reachable from it** (verified in-session; branch tip re-verified unchanged via web).
- **Executable proof (P3/P4):** the subpath imports resolve against the pin but fail against an IPD-main tree with `ERR_MODULE_NOT_FOUND` (main `package.json` has no `exports` field; no root `pit/` path). The pin is **explicitly declared** (package.json + package-lock, exact SHA) and **independently fetchable** (public branch; fresh clone performed in P3).
- G-2 runtime seam: IRR main's `/api/user-portfolios/*` requires the G24 HTTP server (off-main `6828155`) for live operation; IRR-side tests exercise the wire contract via the scripted stub (repo artifact on main). Live seam remains 503 without the IdP audience (deferred, out of scope).

## Reproducibility Verdict

## `REPRODUCIBLE ONLY WITH PINNED OFF-MAIN LINEAGES`

IRR main **cannot** be built/tested/run from IRR main + IPD main alone: the declared dependency resolves only at the off-main pin, and the G-2 capability's backend exists only on the off-main G24 lineage. Both off-main dependencies are explicitly identified (exact SHA; branch; tree) and independently fetchable — but a GitHub dependency pin is **not** treated as equivalent to authoritative-main convergence.

---

## 6. Persistence Evidence Audit (P6.5)

| Mechanism | Source commit (implementation under proof) | Storage implementation | Fixture | Process A (terminated) | Process B (independent) | Recovery result | Proof artifact location |
|---|---|---|---|---|---|---|---|
| IRR PF-1 journal | IRR main `17e234a1` (`persistence-service.ts`, blob `ca735d5d…`) | append-only NDJSON + version header + tail quarantine | 2 deterministic records + duplicate + read-state flip | pid 2076, exit 0 | pid 2169 | exact payload, read-state, updatedAt; foreign tenant/owner → undefined; dedup preserved | **P3 driver = Arena-only; equivalent repo tests on MAIN** (`persistence-service.test.ts`) + branch-native restart proof (pinned lineage) |
| NP-04 store | pin `2e11fa3b` (`src/persistence/*`) | SQLite via `node:sqlite`, WAL + synchronous=FULL + FK ON, checksummed migrations | 1 governed artifact (deterministic canonicalPayload) | pid 2090, exit 0 | pid 2344 | artifact exact; pragmas confirmed on reopen; migrations idempotent (0 reapplied); foreign owner/tenant empty | **driver = Arena-only; repo test suite at PIN** (`tests/np04_governed_persistence.test.ts`, 720/720 incl.) |
| G-2/G24 portfolio | G24 `6828155` (`src/persistence/*`, `src/portfolio/*`, `src/app_identity/*`) | SQLite via better-sqlite3 13.0.3, rollback journal + FULL + FK, migrations 001/002 | governed identity chain + portfolio + 2 holdings (60/40) | pid 2379, exit 0 (FK enforcement demonstrated on unprovisioned first attempt) | pid 2415 | identity re-resolved; portfolio/holdings/weights/revision exact; history `INITIAL,MERGE`; foreign scope empty; migrations idempotent | **driver = Arena-only; repo suite at G24** (84/84, claim verified) |
| IPD main PIT | IPD main `4d3e1cdc` | in-memory `Map` — **no storage medium** | 2 vintage envelopes | n/a | n/a | in-process vintage resolution correct; pre-history fail-closed miss; **cross-process durability impossible by construction** | repo tests on MAIN (542/542) |
| IPD main portfolio | IPD main `4d3e1cdc` | in-browser session store | n/a | n/a | n/a | session-lifetime by design | repo tests on MAIN |

**PF-1 restart proof — the three questions answered separately (as required):**
1. **Implementation on main?** YES — `persistence-service.ts` at main is byte-identical to the branch's (blob `ca735d5d…`).
2. **Proof artifacts on main?** NO — `restart-proof-writer.ts`, `restart-proof-recoverer.ts`, `persistence-restart-proof.test.ts`, and the two E2E-015 records exist only on `arena/a2df3b85 @ 5eba01b`.
3. **Independently reproducible?** YES — executed natively in P3 (separate OS processes, PIDs 2453/2483, exact field-for-field recovery, contract probes green), and the equivalent durability of main's implementation was separately proven by the main-native two-process driver. Any independent party with repo access + a TS loader can reproduce it.

---

## 7. Validation Evidence Audit (P6.6)

| Reported result | Lineage | Exact tests | Classification | Evidence |
|---|---|---|---|---|
| 43/642 platform failures | IRR main `17e234a1` | `program-v2.0-{wp0,wp1,wp2,wp3,wp4,wp10,wp11,wp12,wp13,wp14,final-certification}*.test.ts` (42) + `np12-n4-screen-producer.test.ts` A13 (1) | **Genuine current-main failures; deterministic; PRE-EXISTING and known-in-repo; root cause established by this audit; NOT environment/investigator-induced** | (a) wp0 re-run alone reproduced 2/6 pass. (b) Root cause (web-verified source): the v2.0-era tests define **test-local 10-engine factories** (`ENGINE_FACTORY` map with exactly the v1.1 ten sectors in `program-v2.0-wp0-constitutional-guard.test.ts`) while the frozen `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` now carries **13 sectors** (telecom/auto/materials added at D42 certification) → `ENGINE_FACTORY[sec.engineId] is not a function` (×5) and `Unknown engine: sector.telecom` (×29) on the 3 newer sectors; `makeEngine`/`make is not a function` (×8) are import-shape breakage in the same legacy family. (c) In-repo acknowledgment: the pre-tip `pitRuntimeIntegration.test.ts` comment (removed by `17e234a` today, visible in that commit's diff) documented `ENGINE_FACTORY[s.engineId] is not a function` as "a PRE-EXISTING platform defect, reproducible on the pristine baseline … outside IU-5 scope" at pinned baseline `acd1556`. (d) The G-2 implementation commit `470cc69` message records "2 pre-existing failures (byte-identical to pristine baseline)" in the frontend suite — same known-condition pattern, since remediated by the MHEALTH promotion (`17e234a` = tip). |
| NP-12 protected-surface violation (1) | IRR main | `np12-n4-screen-producer.test.ts:1137` A13 vs baseline `5ca181c` | **Genuine; BASELINE-INDUCED** — main's own commit `9f93c6c` (Oct 3, "publish A8-S-03 authority decision and N4-A13 Screen producer") legitimately added/modified the record file after the test's pinned protected-surface baseline | web-verified file history: exactly one main commit (`9f93c6c`) touched the file |
| 4 `wsj_iu3` type errors | NP-04 pin + G24 | `tests/wsj_iu3_pit_read_boundary.test.ts` (TS2345 ×2, TS2339 ×2) | **Genuine, deterministic test-code type errors; runtime-green** (720/720 and 84/84); type-check debt on both lineages | P4 §3/§4 |
| 1 frontend manifest-test failure (instrumented run) | IRR main (run copy) | `server/reports/reports-persistence.test.ts` manifest assertion | **INVESTIGATOR-INDUCED** (dependency-materialization workaround); passes 38/38 with pristine `package.json` | P4 §1/§6 |
| 25 skipped frontend tests | IRR main | `server/live/*` | **BY DESIGN — live-IdP dependency absent** (self-skip; live certification out of scope per STOP rules) | P4 §1 |
| IPD `test:direct` 0-pass | IPD main | all 48 test files | **ENVIRONMENT-DEPENDENT** (Node type-stripping vs `.js`-specifier convention); same tests 542/542 via tsx and via their primary dist suite | P4 §2 |
| "84/84 PASS" G24 claim | G24 `6828155` | `tests/g24_*.test.ts` | **Independently re-executed and VERIFIED** (exactly 84/84) | P4 §4 |

**No unexplained material validation failures remain.** Nothing was repaired, modified, or re-run to obtain a preferred outcome.

---

## 8. Capability Durability Audit (P6.7)

All 18 capabilities classified PRESENT AND COHERENT in P5 were re-checked for durability of their evidence:

- **Implementation on stated lineage:** YES for all 18 (paths/symbols recorded in P5 §1, verified at the cited commits in P2–P4).
- **Contract exists:** YES for all (contract files at the same lineages).
- **Required dependencies exist:** YES, with the recorded boundary conditions — #2 (PIT) and #3 (Reports) depend on the NP-04 pin lineage; #12 (G-2) depends on the G24 lineage at runtime; these dependencies are explicit, pinned, and fetchable (§5). No capability depends on unreferenced Arena state.
- **Persistence owner exists where applicable:** YES (#3 → IPD artifact domain at pin; #6/#7/#8/#16 → IRR PF-1 on main; #12 → IPD portfolio domain at G24; #22 → proven at all three).
- **Identity boundary exists where applicable:** YES (P3 §2; server-derived principals; governed mapping chain; no client-trusted identity).
- **Evidence independently reproducible:** YES — every coherent capability is backed by repo-hosted tests that passed in P4 at the stated lineage, plus the P3 executable proofs where applicable.
- **No required implementation exists only in Arena workspace:** confirmed — **NO downgrades required; no upgrades made.**

The six bounded/partial P5 classifications (#2, #3, #12, #15, #20, #23) remain bounded for exactly the reasons P5 recorded (off-main dependency, deliberate deferral, duplication) — durable and attributable, but not main-level closure.

---

## 9. Tag / Branch / History Hygiene (P6.8)

| Anomaly | Repositories | Determination |
|---|---|---|
| Tag `v3.0-phase12-certified` unreachable from main | IRR | **Material convergence concern** — certifies the disjoint line's root; a reader following the tag lands on a lineage with no common ancestor with main. Documented in P1; unchanged. |
| 4 IPD tags unreachable from main (`p14-r7-65b78f7`, `portfolio-option-a-cb969b6`, `post-cleanup-baseline-b46b4f4`, `temporary-cleanup-caf73ba`) | IPD | **Provenance-only / unexplained** — historical-era markers on unmerged lines; no governance record found tying them to main admission. Low materiality. |
| Disjoint root `7325aed` (no merge-base with main root `c65d533`) | IRR | **Material convergence concern** (recorded P1/P5-D): parallel program line with unreconciled unique work. |
| Branches carrying material implementation: NP-04, G24, acceptance, restart-proof, exec | IPD/IRR | **Expected governance state** for the four pinned/governed lineages (explicit keep-off-main dispositions verified verbatim); **UNEXPLAINED** for exec (`01a0cf86`) — no disposition act. |
| Donor branch `arena/01a0c440` (tree `682f4e60` cited by IPD main `routes.ts`) | IPD | **Provenance-only** — main's shell restoration cites an unmerged tree as its structural donor; reachable and durable, but the citation target is off-main (condition recorded). |
| ~17 historical-era IPD development lines + IRR doc-record branches | both | **Superseded / stale** — era output present on main; per-branch content equivalence not exhaustively verified (P1 evidence gap, still open). |
| IRR README tag/release claims | IRR | **Stale/contradicted** (P2) — hygiene defect on main, read-only recorded. |

No tag, branch, or history object was altered.

---

## 10. Eight YES/NO Audit Conclusions

1. **Are both authoritative repository refs independently verified?** **YES** — web channel at P6 start (IRR main `17e234a1…`, IPD main `4d3e1cdc…`; branch/tag counts unchanged) + in-session `git ls-remote` at 16:10:37Z. (Primary remote channel was down at P6 start — platform incident disclosed in §Method; two independent channels agree.)
2. **Is every material convergence implementation attributable to a durable repository lineage?** **YES** — every implementation in the P0–P5 record resolves to a GitHub-hosted commit/tree (main or a named pinned branch), per §2. Two of the three durable stores are attributable to **off-main** lineages — attributable and durable-as-hosted, but not main (states not collapsed).
3. **Is every material durability claim independently reproducible?** **YES** — all three proven mechanisms were reproduced from repository state alone (P3 §3) with commands/protocol recorded; equivalent repo-hosted test suites exist at each lineage; any independent process with repo access and a standard toolchain can reproduce them.
4. **Is any required implementation present only in Arena workspace state?** **NO** — Arena holds reports/drivers/temp storage only (§3); zero required implementation is Arena-only.
5. **Can the authoritative IRR main be reproduced using authoritative IPD main alone?** **NO** — the sole non-registry dependency pins IPD commit `2e11fa3b` (26 commits off main); subpath imports fail against IPD main (`ERR_MODULE_NOT_FOUND`, no `exports` field); G-2 live seam requires off-main G24. Verdict §5: REPRODUCIBLE ONLY WITH PINNED OFF-MAIN LINEAGES.
6. **Are off-main dependencies explicitly identifiable and reproducible?** **YES** — NP-04 pin declared with exact SHA in `package.json` + lockfile; G24/acceptance pinned with branch+SHA+tree in `userPortfolioContract.ts` and the acceptance acts (SHA/tree binding verified verbatim); all six material lineage tips re-verified unchanged today; all fetchable via fresh clone (performed in P3).
7. **Are material validation failures fully explained?** **YES** — every failure classified with root cause (§7): 43 genuine pre-existing platform failures (root-caused to legacy 10-engine test harnesses vs 13-sector baseline; in-repo comment acknowledged the class as pre-existing); 1 baseline-induced protected-surface guard; 4 genuine test-code type errors; 1 investigator-induced (remediated by pristine re-run); 25 by-design skips; 1 environment-blocked script form. None unexplained.
8. **Is the evidence package sufficient for P7 historical reconciliation?** **YES** — stable authorities; complete lineage/tag/branch inventory; omission ledger with classifications; governance dispositions (incl. today's verbatim verification of the acceptance chain); root-caused failure ledger; reproducibility map; explicit gap list (§11). Condition: the Arena-only reports should be published or regenerated by P7's executor, since the workspace is not authoritative and not durable.

---

## 11. Unresolved Evidence Gaps

1. **Reproduction requires off-main lineages** (pin `2e11fa3b`; G24 `6828155` for live G-2) — the central condition on any convergence claim at the authoritative-main pair.
2. **Restart-proof artifacts are branch-only** (implementation on main; proof files on `arena/a2df3b85`).
3. **IPD exec branch (`ea70a8c`) promotion status UNEXPLAINED** — only functional executive computation on IPD side; embeds a full IRR platform copy (duplication).
4. **NP-15 IPD-side publication still open** — IRR↔IPD SHA cross-reference not established (D-NP15-7 half-satisfied).
5. **AG-5 company-level mapping unresolved** (no implementation anywhere).
6. **Arena-only reports unpublished** — facts repo-verifiable, artifacts not durable outside Arena (publication requires authorization).
7. **Disjoint IRR line residual unique work unreconciled**; tag `v3.0-phase12-certified` unreachable from main.
8. **Per-branch content equivalence for ~17 historical IPD lines** not exhaustively verified (P1 gap, still open).
9. **IRR README stale claims** on main (hygiene).
10. Platform incident during P6: primary remote-verification channel unavailable; web channel substituted (both channels agreed; residual risk judged negligible given 16:10Z in-session verification).

---

## 12. P6 Classification

## **DURABILITY AUDIT CONDITIONAL**

Material state is durable and attributable — every implementation, proof, contract, and governance act resolves to a durable repository lineage, all durability claims are independently reproducible, and all validation failures are explained with root causes. The following **bounded conditions** remain: reproduction of IRR main requires pinned off-main IPD lineages; the restart-proof artifacts and the IPD executive transport are branch-only; the NP-15 cross-reference is open; Arena-only reports are unpublished; tag/history hygiene anomalies are recorded but unremediated. No required artifact is missing or unattributable, and no unexplained Arena-only state exists.

**END P6**
