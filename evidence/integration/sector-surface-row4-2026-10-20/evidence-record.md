# Evidence record — IRR capability matrix row 4 (Research — sector surface)

**Date:** 2026-10-20 (UTC).
**Repository:** `ramkivs/iips-review-recovered` (IRR).
**Authoritative ref:** `refs/heads/main` @ `ad008e45e64f15e895043bd2c554a7c93a4c2dc1`.
**Session branch:** `arena/731ab028-iips-review-recovered` (branched from `ad008e45`, unmodified at the time of the checks below).
**Mode:** investigation and evidence collection only. No product code, route, UI, API, DTO, schema, test or tracker row was changed.

This record is the executed-evidence annex to
`docs/integration/2026-10-20/PKG-08-ROW4-SECTOR-SURFACE-INVESTIGATION-AND-ACCEPTANCE-GAP-2026-10-20.md`.
It is not a decision, not implementation authority, and not acceptance.

---

## 1. Baseline verification

| # | Check | Command (as run) | Result |
|---|---|---|---|
| E1 | Canonical remote | `git remote -v` | `origin https://github.com/ramkivs/iips-review-recovered.git` (fetch + push) |
| E2 | Authoritative `main` | `git ls-remote origin refs/heads/main` / `git rev-parse HEAD` / `git rev-parse origin/main` | all three = `ad008e45e64f15e895043bd2c554a7c93a4c2dc1` |
| E3 | Working tree | `git status --short` | empty (clean) at session start and after every check in this record |
| E4 | Clone depth | `git rev-parse --is-shallow-repository`; `git log --oneline --all \| wc -l` | `true`; `1` commit — the clone is shallow, so **no in-repository history archaeology was possible**; all cross-branch findings in §5 were taken from remote refs (`git ls-remote`) and the GitHub contents/tree API |
| E5 | Remote heads | `git ls-remote --heads origin \| wc -l` | `154` remote heads; **no** head named `arena/01a0d1d3*`, `arena/01a0d33d*` or `arena/01a0814b*` exists on IRR (those names belong to the IPD repository, §5.3) |
| E6 | Open PRs | `gh pr list --state open` | exactly one: **#114** "Browser-only broker preview and bounded NP-18 intelligence views (non-production)" — unrelated to row 4. **No PR exists for any sector-surface work.** |
| E7 | File identity | `sha256sum frontend/src/app/App.tsx frontend/src/app/navigation.ts` | `App.tsx` = `c7026228aa4fe0aa3f9e37de4d500266550c0b585728492fbbeb393978b6d3d4`; `navigation.ts` = `5cc254a105c2089e2865d9eaea22a632a5452a5c2a74b72ffc0896adc529854c` |

---

## 2. Suite, typecheck and build (executed at `ad008e45`)

| # | Check | Command | Result |
|---|---|---|---|
| E8 | Install | `cd frontend && npm ci --no-audit --no-fund --strict-ssl=false` | `added 188 packages` — NOTE: `--strict-ssl=false` was required **only** because the sandbox CA bundle cannot verify `codeload.github.com` for the `github:` dependency pin (`npm error UNABLE_TO_VERIFY_LEAF_SIGNATURE`). No repository file, lockfile, script or pin was altered; `node_modules/` is git-ignored. The plain `npm ci` failure is a sandbox TLS-policy artefact, not a repository defect. |
| E9 | Typecheck | `npx tsc --noEmit` | exit `0` |
| E10 | Full suite | `npx vitest run` | **77 files / 935 tests passed**, `0` failed, `0` skipped, exit `0`, `67.45 s` |
| E11 | Build | `npm run build` | exit `0` — `dist/assets/index-iS_TOxU4.js` `272.97 kB`, gzip `78.25 kB` |

E9–E11 are **repo-health evidence only**. Per the tracker's own legend they are not qualification, admission, release or product acceptance, and they say nothing about row 4 beyond "the repository still builds green with the placeholder in place".

---

## 3. Route, navigation and UI (source-verified)

| Fact | Source | Value |
|---|---|---|
| Sector route mount | `frontend/src/app/App.tsx:45` | `<Route path="/research/sector/:id" element={<FeaturePlaceholder surface="Sector" />} />` |
| Placeholder component | `frontend/src/app/App.tsx:26-28` | `function FeaturePlaceholder({ surface }) { return <FeatureNotImplemented surface={surface} />; }` |
| Rendered shell | `frontend/src/components/shell/ShellStates.tsx:46-55` | `FeatureNotImplemented` — `<ShellState title={`${surface} — not yet built`} testid="shell-feature-unavailable">` with copy "…part of a later Program v3.0 phase and has not been implemented yet. No feature data is fabricated at this stage." |
| Route constant | `frontend/src/app/routes.ts:19` | `researchSector: '/research/sector/:id'` |
| Nav child entry | `frontend/src/app/navigation.ts:47` | `{ label: 'Sector', path: '/research/sector/:id' }` |
| Nav allow-list | `frontend/src/app/navigation.ts:80-89` | `AVAILABLE_CHILD_PATHS` = `/research/cross-sector`, `/research/engines`, `/research/macro`, `/intelligence/opportunities`, `/intelligence/risks`, `/intelligence/rankings`, `/intelligence/decision-matrix`, `/ai-advisory`. **`Sector` is absent** |
| Render filter | `frontend/src/app/navigation.ts:101-104` | `visibleChildren()` returns only children whose path is in `AVAILABLE_CHILD_PATHS` ⇒ **the Sector child is never rendered as a link** |
| Feature directory | `ls frontend/src/features` | `ai-advisory, collaboration, company, cross-sector, decision-matrix, engines, evidence, executive, intelligence, portfolio, replay, research, screener, settings, user-portfolios, watchlists` — **no `sector` directory**; `research/` contains only `MacroContext.tsx`, `MacroDataModeNotice.tsx`, `MacroResearch.tsx`, `MacroSourceDisclosure.tsx` (+ tests) |
| Sector component anywhere on `main` | `grep -rn "SectorIntelligence" frontend/src` | no hits |

### 3.1 Frontend tests that touch the sector route

| Test | File:lines | What it actually asserts |
|---|---|---|
| `does not render parameterised or placeholder children as global links` | `frontend/src/app/App.test.tsx:118-126` | `'Sector'` (among `Company`, `Holdings`, `Replay`, `Snapshots`) is **not** a rendered nav link, and no rendered link href contains `:`. **It does not render `/research/sector/:id` and does not assert anything about the sector surface.** |
| `resolves every clickable nav destination to a built surface (no nav click lands on "not yet built")` | `frontend/src/app/App.test.tsx:149-164` | Walks only hrefs `filter(href => href.startsWith('/') && !href.includes(':'))` ⇒ **`/research/sector/:id` is structurally excluded** from this test. |
| `renders group-only parents as headings, never as links to an unbuilt surface` | `frontend/src/app/App.test.tsx:141-147` | `Research` / `Intelligence` render `nav-group-*` and are not links. This is the CV-41 test (§6). |
| `does not mount an administration route…`, `uses the feature-unavailable placeholder for an unmatched route` | `frontend/src/app/App.test.tsx:166-176` | `/admin` and `/nonsense` render `shell-feature-unavailable`. **Not** sector-specific. |
| `Shell states › FeatureNotImplemented does not fabricate feature data or imply an auth gate` | `frontend/src/components/shell/ShellStates.test.tsx:30-33` | Asserts the placeholder component's own text. **Not** sector-specific. |

**Conclusion:** no test on `main` asserts that a sector research capability exists, fetches, renders or fails honestly. The only sector-adjacent assertions are negative navigation assertions.

---

## 4. Server / API behaviour (executed probes)

Transport started with `npx tsx server/executive-transport.ts` (binds `127.0.0.1:8787`, `EXEC_TRANSPORT_BIND_HOST`, `frontend/server/executive-transport.ts:716,972-976`). All calls GET unless stated.

| # | Request | Status | Response (truncated) | Meaning |
|---|---|---|---|---|
| E12 | `/api/health` | 200 | `{"status":"ok","transport":"program-v3.0 executive (dev)"}` | server up |
| E13 | `/api/sector/Banking` | **404** | `{"error":"not found"}` | **no sector route exists** |
| E14 | `/api/sector` | **404** | `{"error":"not found"}` | " |
| E15 | `/api/sectors` | **404** | `{"error":"not found"}` | " |
| E16 | `/api/company/Banking` | 200 | `{"companyId":"Banking-H1","sector":"Banking","decision":{"verdict":"Watch","composite":47.1,"confidence":0.8},"pillars":{"asset-quality":15,…},…,"provenance":{…"freshness":"SNAPSHOT","calibratedAt":"2026-08-09T00:00:00.000Z"}}` | **the "company" endpoint is sector-keyed** |
| E17 | `/api/company/banking` | 200 | identical sector payload | resolution is case-insensitive (`executive-transport.ts:527` `k.toLowerCase() === sectorId.toLowerCase()`) |
| E18 | `/api/company/Materials%20%26%20Metals` | 200 | `{"companyId":"Materials & Metals-H1","sector":"Materials & Metals","decision":{"verdict":"Buy","composite":74.9,"confidence":null}}` | all 13 canonical sectors resolve |
| E19 | `/api/company/NotASector` | 404 | `{"error":"Error: company not found: NotASector"}` | fail-closed unknown-sector handling (note: the raw `Error:` prefix leaks in the JSON body) |
| E20 | `/api/company/` | 404 | `{"error":"Error: company not found: "}` | empty id |
| E21 | `/api/evidence/Banking` | 200 | `decision{verdict,composite,confidence}`, `evidence{evidenceId:"ev_Banking",engineId:"sector.banking",recommendation,compositeScore,keyMetrics[],supportingScores[],decisionRulesApplied,calibrationVersion,provenance{frameworkVersion,engineVersion,methodologyVersion:"IES-Banking",snapshotId}}`, `snapshot{…}`, `replay{…}`, top-level `provenance` | sector-keyed evidence chain |
| E22 | `/api/replay/Banking` | 200 | `original{snapshotId:"snap_Banking",engineId:"sector.banking",…}`, `replay{reproduced:true,byteIdentical:true,evidenceRefs:["ev_Banking"]}`, `differenceAvailable:false`, `note:"The governed ReplayService exposes reproduced + byteIdentical + evidenceRefs only. No field-level or metric-level difference is computed or displayed."` | sector-keyed replay |
| E23 | `/api/decision-matrix` | 200 | `matrixType:"scatter"`, `companies[13]` of `{companyId,sector,verdict,composite,quality,valuation}` (e.g. `Banking-H1/Banking/Watch/47.1/15/50`; `Insurance-H1/…/72.3/72.2/null`), `universe{avgConviction,avgQuality,holdings}`, `note` on no certified quadrant/band | **a governed 13-sector list with sector names already exists** |
| E24 | `/api/engines` | 200 | `apiVersion:"1.0"`, `engines[13]` of `{engineId:"sector.banking",ies:"IES-006",iesTitle:"Banking Sector Engine",sectorFamily:"Banking",engineVersion:"1.0.0",secVersion,semcVersion,calibrationProfile:"banking-calibration-1.0.0",calibrationVersion,capabilities[]}`, `provenance{certifiedCount:13, source:"Program v1.1 — 13 frozen sector engines (IES-006…015 LTS + IES-016/017/020 via D42)…", freshness:"FROZEN", runtimeConfig{clock:"fixed",idProvider:"deterministic"}}` | sector ↔ engine ↔ IES ↔ calibration identity |
| E25 | `/api/portfolio` | 200 | `portfolio.sectorExposure` = `{Banking:7.7, Insurance:7.7, … Materials & Metals:7.7}`; `holdings[0]` = `{companyId:"Banking-H1",sector:"Banking",decision:"Watch",composite:47.1,confidence:0.8,quality:15,risk:70,weight:7.7}` | per-sector exposure and holding rows |
| E26 | `/api/cross-sector` | 200 | `portfolio{}`, `diversification{}`, `ranking[{companyId,sector,conviction}]`, `opportunity[]`, `correlation{flags,concentrationSectors}`, `decisions[{sector,verdict,composite,confidence}]` | per-sector cross-sector aggregates |
| E27 | `POST /api/engines/sector.banking/execute` `{apiVersion:"1.0",engineId:"sector.banking",requestId:"r1",inputs:{}}` | 200 | `state:"COMPLETED"`, `verdict:"Watch"`, **`composite:50`**, `snapshotRef:"SNAP_8B609A4D"`, `evidenceRef:"ev_sector.banking_2026-08-09T00:00:00.000Z"` | **caution:** live dispatch on caller-supplied inputs returns `50`, whereas the frozen v1.1 baseline composition returns `47.1` (E16). Engine dispatch is therefore **not** a substitute for the certified baseline sector result and must not be presented as one. |
| E28 | `GET /api/engines/sector.banking/execute` | 404 | `{"error":"not found"}` | method-guarded |

### 4.1 What the server proves about "sector data"

- **Authoritative sector data that exists today:** the 13 canonical sector names (`CANONICAL_SECTORS`, `iips-platform/src/sector-engines/cross-sector/population/ScreeningPopulation.ts:34-48`; mirrored in `CERTIFIED_ENGINES[].sectorFamily`, `iips-platform/src/integration/EngineRegistry.ts:53+`, in `CERTIFIED_AI_ADVISORY_SECTORS`, `frontend/src/features/ai-advisory/AiAdvisory.tsx:23-37`, and in `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json`), each with an engine identity, IES, calibration profile and version.
- **Per-sector certified results that exist today:** verdict, composite, confidence (null where the engine lacks it), overrides, golden pillars, resolved subsegment/archetype, calibration version, frozen input metrics; evidence chain `ev_<sector>`; replay `snap_<sector>` (`reproduced`, `byteIdentical`, no field-level diff); cross-sector decision row; decision-matrix quality/valuation axes; portfolio sector exposure/weight.
- **Everything above is a frozen `SNAPSHOT`** (`provenance.freshness:"SNAPSHOT"`, `calibratedAt:"2026-08-09T00:00:00.000Z"`) over the v1.1 Replay Baseline. Nothing is live.
- **Not available:** any sector-level endpoint, any sector constituent list, any sector aggregate that is *not* already emitted by `/api/cross-sector` / `/api/decision-matrix` / `/api/portfolio`, any sector time series, any sector news/intelligence source, any sector classification beyond the 13 certified names.

---

## 5. Prior / parallel implementations (remote-verified, none on `main`)

### 5.1 IRR orphan branches — one candidate sector component

| Ref (IRR) | Tip | File | Size / blob |
|---|---|---|---|
| `phase13-next` | `4357e14a35966cd8508e0c59e40627791c103172` | `frontend/src/features/research/SectorIntelligence.tsx` | 11,007 B, blob `858f1f89fe81e58ffb266bf84c878ee2ced9dc96` |
| `phase13-next` | " | `frontend/src/features/research/SectorIntelligence.test.tsx` | 14,583 B |
| `gai-impl-canonical` | `f63a9b493118643725568a95b86405a5835a30a0` | same two paths | identical sizes (11,007 B / 14,583 B) |

Verified by `git ls-remote --heads origin` and `gh api repos/ramkivs/iips-review-recovered/git/trees/<ref>?recursive=1`.

Standing characterisation on `main` (tracker `CHG-2026-10-14-16`, §16.19, and `XV-17`, line 1108): this is the **2026-08-21 orphan stack**, it has **no merge-base with `main`**, and it is **OIDC/`authFetch`-gated** — i.e. it predates and contradicts the operative NO-AUTH decision. Reconciliation is by content port under an owning gate; a merge is arithmetically impossible.

### 5.2 The only sector-surface specification that exists anywhere

It is the header comment of the orphan file `frontend/src/features/research/SectorIntelligence.tsx` on `phase13-next`:

> *Route: `/research/sector/:id`. Answers "What does the certified platform say about this sector — its engine, decision, certified pillars, position in the governed universe, and replay verification?" — composed 1:1 from the FOUR existing governed read endpoints: `/api/company/:sector`, `/api/evidence/:sector`, `/api/replay/:sector`, `/api/decision-matrix`.*
>
> *Accepted spec (S1–S6, recorded 2026-08-21): S1 = all four endpoints compose v1; S2 = NO duplication of the Company trust chain — replay-verification summary only, with a link to `/research/company/:sector` for the full chain; S3 = Sector → Company link is mandatory; S4 = CSIP/macro context excluded; S5 = payload order preserved; no sort/rank/band/quadrant; S6 = sector selector options sourced ONLY from `/api/decision-matrix` (N+12 pattern).*

Three incompatibilities with `main` were confirmed by reading the file body:

1. It imports `../../components/ai/AiExplanation` and renders `<AiExplanation sectorKey={company.sector} />` inside the sector page. On `main` the advisory is a **separate, non-authoritative, route-mounted surface** (`/ai-advisory`, `AiAdvisory.tsx`, `CERTIFIED_AI_ADVISORY_SECTORS`), governed by `REG-08` and labelled `AI EXPLANATION ≠ CERTIFIED RESULT`. Embedding it in a sector page is a product/presentation decision that does not exist on `main`.
2. The file's own comment says the three calls propagate a **Bearer** token via `authFetch`; `main` ships `noAuthFetch` (`frontend/src/core/network/noAuthFetch.ts`) and the operative no-auth posture.
3. It consumes `/api/decision-matrix` for the selector, which exists on `main` (E23) — this part **is** portable.

This S1–S6 text is **not on `main`**, is not referenced by any record on `main`, and is therefore **not an accepted requirement**. It is recorded here as the only existing candidate shape, explicitly non-authoritative.

### 5.3 IPD repository (out of scope, recorded for completeness only)

`git ls-remote --heads https://github.com/ramkivs/iips-production-market-data.git`:

- `arena/01a0d1d3-iips-production-market-data` @ `1c5f46ca039148594bdf243b964a5853c6433248`
- `arena/01a0d33d-iips-production-market-data` @ `887ecce026cd0e1f05b5f4039faa92cb2b9fbff0`
- `arena/01a0814b-iips-production-market-data` @ `da4305149bd5495789f893f530edb2526d08bb5b`

Sizes confirmed via the contents API: `frontend/src/features/research/SectorIntelligence.tsx` = 16,782 B and `frontend/server/research-sector-transport.ts` = 28,463 B on `arena/01a0d1d3-iips-production-market-data`.

These are **IPD** files in a different repository. The task boundary excludes IPD; nothing here promotes, ports or equates them with the IRR surface. `frontend/server/research-sector-transport.ts` has **no** IRR counterpart on `main`.

---

## 6. CV-41 reconciliation evidence

| Item | Evidence |
|---|---|
| CV-41 problem statement | tracker line 1038: "Two top-level nav destinations land on 'not yet built'… five routes total (`/research`, `/research/sector/:id`, `/intelligence/*`, `/evidence/snapshots`, `/evidence/replay`) plus the wildcard are placeholder mounts" |
| CV-41 remedy options | same row: "Choose per surface: repoint the parent link at its implemented child, **or** label the parent as a group-only heading (non-clickable)" |
| CV-41 status | `COMPLETE (2026-10-14, CV-CORR-04; group-heading option)`; "none (IA disposition, no implementation required for the honest option)" |
| Delivered artefacts | `navigation.ts:19` `groupOnly?: boolean`; `navigation.ts:44` `groupOnly: true` (Research); `navigation.ts:59` `groupOnly: true` (Intelligence); `navigation.ts:92-94` `isGroupOnly()`; `Sidebar.tsx:59-64` non-clickable `<span data-testid={`nav-group-${item.label}`}>`; `App.test.tsx:141-147` and `149-164` (the two new tests) |
| Reversal note | tracker §16.16.6: "Reversal is a one-line `navigation.ts` change per item with no fence, no route and no contract touched" |
| CV-41 did **not** touch the Sector child | `navigation.ts:47` (`{ label: 'Sector', path: '/research/sector/:id' }`) already existed and was already hidden by `AVAILABLE_CHILD_PATHS` at 2026-10-13 — `docs/integration/IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md:80` cites `navigation.ts` blob `3866b80eb0a74157cb9374e3db2c1b1116848a4a` as "Research → Company, Sector, Cross-Sector, Engines", i.e. **before** CV-41 was executed on 2026-10-14 |
| Matrix row 4 cells | tracker §18.1 line 2368: Existence `P — placeholder route only`; Authority `NA`; Integration `NI`; Wiring `NW — FeaturePlaceholder`; Validation `V — shell tests cover the placeholder`; Governance `V — CV-41 disposition executed 2026-10-14 (groupOnly heading + App.test.tsx)`; Acceptance **`NOT SATISFIED`**; Qualification `NA`; Release-readiness `NI — not a shipped surface`; anchor `App.tsx:41` |
| PKG-08 2026-10-18 | `docs/integration/2026-10-18/PKG-08-IRR-SURFACE-SCOPE-ROWS-4-14-16.md:9`: "`/research/sector/:id` is a `FeaturePlaceholder` … CV-41 made the parent Research navigation an honest group heading; **it did not commission a sector workspace**." Unresolved question: "Retain placeholder/API-only, or commission a named sector surface? What is the user outcome and owner? **No endpoint or feature requirement is inferred from the route name.**" |
| NP-07 exclusion (2026-10-13, still standing) | `docs/integration/IIPS_v3.0_NP07_RESEARCH_ACCEPTANCE_AND_BASELINE_ADMISSION.md:117` "**Sector Intelligence (`/research/sector/:id`) is EXCLUDED and is NOT accepted.**"; `:122` route state recorded at `App.tsx` line 41; `docs/integration/IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md:64,170,178` "Not implemented — `frontend/src/features/` contains no sector feature directory" / "excluded" |
| Current standing instruction | tracker line 2351 and line 3119: "CV-21 Reports, CV-22 governed universe, CV-32 PIT UI/API, and **PKG-08 rows 4/14/16 likewise require their own product/authority outcomes**"; "packets are not authority" |

### 6.1 Baseline-anchor correction

The recorded row-4 anchor is `App.tsx:41`. At `ad008e45` the sector placeholder is at **`App.tsx:45`** and `/research/collaboration` is at line 41. The four-line drift is explained by route additions after 2026-10-13 (e.g. `/research/macro`, `App.tsx:47`). The NP-07 records (written 2026-10-13) and the matrix anchor both cite the **older** line number. This is a documentation-drift fact, not a content change: the route path, element and placeholder surface string are unchanged.

---

## 7. What this record does not establish

- It does not establish that a sector research capability is required, commissioned or authorized.
- It does not establish browser, Windows, operator or unassisted-reader acceptance for any surface (none was performed and none is claimed).
- It does not treat E9–E11 (green typecheck / 935 tests / successful build) as qualification, admission or acceptance of row 4.
- It does not promote, port or endorse the `phase13-next` / `gai-impl-canonical` / IPD implementations.
- It does not edit the master tracker, the 51-row matrix, or any CV status.
