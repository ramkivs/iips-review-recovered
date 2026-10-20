# PKG-08 — IRR capability matrix row 4 (Research — sector surface)
## Investigation, evidence reconciliation and acceptance-gap report

**Status:** investigation and evidence record only. **Not a product decision, not a product-scope selection, not implementation authority, not acceptance.**
**Date:** 2026-10-20 (UTC).
**Matrix row:** 4 — Research — sector surface (IRR).
**Recorded acceptance (unchanged by this document): `NOT SATISFIED`.**
**Owner of the outstanding outcome:** IRR product/program authority. Platform evidence below is supplied only to describe current behaviour.

**Companion evidence record:** [`evidence/integration/sector-surface-row4-2026-10-20/evidence-record.md`](../../../evidence/integration/sector-surface-row4-2026-10-20/evidence-record.md) — the executed commands and raw probe results (E1–E28) cited throughout as `E<n>`.

**Relationship to existing records:**

- [`docs/integration/2026-10-18/PKG-08-IRR-SURFACE-SCOPE-ROWS-4-14-16.md`](../2026-10-18/PKG-08-IRR-SURFACE-SCOPE-ROWS-4-14-16.md) (2026-10-18) asked the row-4 scope question and **deliberately did not answer it**. This document completes the investigation side of that question. It still does not answer it; answering it is the authority act identified in §8.
- `docs/integration/IIPS_v3.0_NP07_RESEARCH_ACCEPTANCE_AND_BASELINE_ADMISSION.md` §6 and `…_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md` §4/§7 record the sector surface as **excluded and not accepted**. This document re-verifies that exclusion as still accurate (§5.3) and does not disturb it.
- The master tracker (`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`) is **not edited** by this work.

---

## 1. Executive finding

**Row 4 remains unresolved because there is nothing to resolve it *to*: no accepted requirement for a sector research surface exists anywhere on the authoritative repository, and the sector route has never been commissioned, implemented, qualified or accepted.**

Four independent facts, each verified on `main` today:

1. **The route is a mount, not a capability.** `frontend/src/app/App.tsx:45` mounts `<FeaturePlaceholder surface="Sector" />`, which renders `FeatureNotImplemented` (`frontend/src/components/shell/ShellStates.tsx:46-55`) — a static "not yet built" panel with `data-testid="shell-feature-unavailable"`. There is no `frontend/src/features/sector/` directory, no sector component, and no importer of a sector client.
2. **No sector API exists.** `GET /api/sector/Banking`, `/api/sector` and `/api/sectors` all return `404 {"error":"not found"}` (E13–E15). There is no sector DTO, schema, transport handler or fixture anywhere in `frontend/server/`.
3. **CV-41 never authorised a sector workspace.** CV-41's entire subject was *navigation honesty for the two placeholder-landing parents* (`Research`, `Intelligence`). It offered two remedies — repoint the parent at an implemented child, or make the parent a non-clickable group heading — and the executed remedy was the **group heading**, which by the tracker's own words required "no implementation" (`§16.16.6`, tracker line 1038). It added `groupOnly` to `navigation.ts` and two tests to `App.test.tsx`. It did not add, remove or alter the `Sector` nav child, which was **already present and already hidden** by `AVAILABLE_CHILD_PATHS` before CV-41 ran.
4. **The one existing specification is off-`main` and not authoritative.** An S1–S6 "accepted spec (recorded 2026-08-21)" exists only in the header comment of `frontend/src/features/research/SectorIntelligence.tsx` on the unmerged IRR branches `phase13-next` and `gai-impl-canonical`, which the tracker records as the 2026-08-21 **orphan stack with no merge-base with `main`** and **OIDC-gated**, i.e. incompatible with the operative no-auth posture (`XV-17`, tracker line 1108; `CHG-2026-10-14-16`).

The matrix's own Governance cell is therefore being read correctly by the tracker and **mis-read when cited as progress**: `V — CV-41 disposition executed 2026-10-14` certifies that *navigation is honest*, not that *a sector surface exists*. The Acceptance cell says `NOT SATISFIED`, and nothing since 2026-10-14 has changed the underlying facts.

A secondary finding: **the "company" research API is not company-specific.** `GET /api/company/:id` resolves `:id` as a **sector** (`computeCertifiedCompany(sectorId)`, `frontend/server/executive-transport.ts:526`; `companyId: \`${d.sector}-H1\``, line 533; dispatch lines 953-963). The typed client agrees — `fetchCompanyData(sector: string, …)`, `frontend/src/api/company.ts:24` — as do `fetchEvidenceData(sector, …)` (`evidence.ts:38`) and `fetchReplayData(sector, …)` (`replay.ts:28`). `/research/company/:id` is in substance a **per-sector engine result page with a synthetic company identity**. This is the single most important fact for anyone scoping a sector surface, because it means (a) a sector surface would overlap heavily with an existing certified surface, and (b) the honest naming of both surfaces is itself an open product question.

---

## 2. Verified baseline

| Field | Value | Evidence |
|---|---|---|
| Repository | `ramkivs/iips-review-recovered` (IRR) | `gh repo view`; E1 |
| Canonical remote | `https://github.com/ramkivs/iips-review-recovered.git` | `git remote -v`; E1 |
| Authoritative ref | `refs/heads/main` | E2 |
| Authoritative commit | **`ad008e45e64f15e895043bd2c554a7c93a4c2dc1`** | `git ls-remote`, `git rev-parse HEAD`, `git rev-parse origin/main` all agree; E2 |
| Session branch | `arena/731ab028-iips-review-recovered`, branched from `ad008e45` | repo state |
| Working tree | **clean** at session start and after every check | `git status --short`; E3 |
| Clone shape | **shallow — 1 commit** (`git rev-parse --is-shallow-repository` = `true`) | E4. Consequence: no in-repository history archaeology was possible; every cross-branch finding in §5 was taken from `git ls-remote` and the GitHub contents/tree API |
| Remote heads | **154**; none named `arena/01a0d1d3*`, `arena/01a0d33d*`, `arena/01a0814b*` (those are IPD names) | E5 |
| Open PRs | **one**: #114 "Browser-only broker preview and bounded NP-18 intelligence views (non-production)" — **unrelated to row 4**. **No PR exists for any sector-surface work.** | E6 |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not authoritative for this row**; referenced only in §5.3 for completeness | `gh repo list` |
| Suite / typecheck / build at `ad008e45` | `tsc --noEmit` exit `0`; `vitest run` **77 files / 935 tests passed**; `npm run build` exit `0` (`272.97 kB`, gzip `78.25 kB`) | E8–E11 |
| File identity | `App.tsx` SHA-256 `c7026228aa4fe0aa3f9e37de4d500266550c0b585728492fbbeb393978b6d3d4`; `navigation.ts` SHA-256 `5cc254a105c2089e2865d9eaea22a632a5452a5c2a74b72ffc0896adc529854c` | E7 |

**Repository-health caveat.** E8 required `npm ci --strict-ssl=false` because the sandbox CA bundle cannot verify `codeload.github.com` for the `github:` dependency pin (`npm error UNABLE_TO_VERIFY_LEAF_SIGNATURE`). This is a sandbox TLS-policy artefact, **not a repository defect**; no lockfile, script or pin was touched and `node_modules/` is git-ignored.

**Green-suite caveat.** E9–E11 are repo-health evidence. Per the tracker's own status legend they are **not** qualification, admission, release or product acceptance, and they say nothing about row 4 beyond "the repository still builds green with the placeholder in place" — which is exactly what the existing `App.test.tsx` guarantees (§4.3).

---

## 3. Scope and method

In scope (per the task): baseline establishment; route/UI trace; backend and data-contract trace; CV-41 and governance reconciliation; intended-capability reconstruction from repository evidence; acceptance-gap matrix; a bounded implementation *proposal*; documentation, commit, publication and remote verification.

Out of scope: any code, route, UI, API, DTO, schema or test change; any product-scope or contract decision; any tracker or matrix edit; any claim of browser, Windows, operator or unassisted-reader acceptance; any IPD repository work; any conflation of sector research with company research or cross-sector intelligence.

Method:

1. **Baseline** — `git remote -v`, `git ls-remote`, `git rev-parse`, `git status`, `gh pr list`, `gh repo list`, `sha256sum` (E1–E7).
2. **Static trace** — full read of `frontend/src/app/{App.tsx,AppShell.tsx,Sidebar.tsx,navigation.ts,routes.ts}`, `frontend/src/components/shell/ShellStates.tsx`, `frontend/src/features/{company,cross-sector,engines,research}/*`, `frontend/src/api/*.ts`, `frontend/server/executive-transport.ts`, `iips-platform/src/integration/{EngineRegistry,EngineApiAdapter}.ts`, `iips-platform/src/sector-engines/cross-sector/population/ScreeningPopulation.ts`, plus targeted greps over `frontend/src` and `frontend/server` for sector semantics (not merely the token `sector`).
3. **Executed verification** — `npm ci`, `tsc --noEmit`, `vitest run`, `npm run build`, then boot of the real composed transport (`npx tsx server/executive-transport.ts`, loopback `:8787`) and 17 HTTP probes (E12–E28).
4. **Governance reconciliation** — full read of the CV-41 register row, tracker §§16.16.5–16.16.7, §18.1 row 4, §§19/23 status paragraphs, `PKG-08`, `NP-07` qualification and acceptance records, `docs/v3.0/{information-architecture,navigation-model,phase13,phase14}/*`, and the lineage investigation; plus remote ref enumeration and GitHub API tree reads for the orphan branches (§5).

---

## 4. Current implementation assessment

### 4.1 The route and what it renders

| Element | Location | Value |
|---|---|---|
| Sector route | `frontend/src/app/App.tsx:45` | `<Route path="/research/sector/:id" element={<FeaturePlaceholder surface="Sector" />} />` |
| Local placeholder wrapper | `frontend/src/app/App.tsx:26-28` | `function FeaturePlaceholder({ surface }: { surface: string }) { return <FeatureNotImplemented surface={surface} />; }` |
| Rendered component | `frontend/src/components/shell/ShellStates.tsx:46-55` | `FeatureNotImplemented` → `<ShellState title={`${surface} — not yet built`} testid="shell-feature-unavailable">` |
| Route constant | `frontend/src/app/routes.ts:19` | `researchSector: '/research/sector/:id'` |
| Nav child entry | `frontend/src/app/navigation.ts:47` | `{ label: 'Sector', path: '/research/sector/:id' }` |
| Nav render filter | `frontend/src/app/navigation.ts:80-89, 101-104` | `AVAILABLE_CHILD_PATHS` does **not** contain the sector path ⇒ `visibleChildren()` drops it ⇒ **no Sector link is ever rendered** |
| Feature directory | `ls frontend/src/features` | no `sector/`; `research/` holds only the Macro surface |
| Sector component on `main` | `grep -rn "SectorIntelligence" frontend/src` | **no hits** |

Six `FeaturePlaceholder` mounts exist on `main` (`App.tsx:43,45,55,57,58,61`): `/research`, `/research/sector/:id`, `/intelligence/*`, `/evidence/snapshots`, `/evidence/replay`, and the wildcard.

**Classification: the route is *mounted only*.** It performs no fetch, resolves no `:id`, renders no sector identity, and renders no sector data. It is not "partially wired" — there is no wire.

### 4.2 Navigation and reachability

- `Research` is a **group-only heading** (`navigation.ts:44` `groupOnly: true`); `Sidebar.tsx:59-64` renders it as `<span data-testid="nav-group-Research">`, never a link.
- The `Sector` child exists in `NAV` but is filtered out by `AVAILABLE_CHILD_PATHS`. **A user cannot reach `/research/sector/:id` by clicking anywhere in the product.** It is reachable only by typing the URL or by a cross-link — and **no cross-link to it exists** (§4.4).
- Even if the child were un-hidden, `SV` would break two existing tests (`App.test.tsx:118-126` and `:149-164`) unless a built surface landed in the same change. The tracker records this sequencing dependency as a hard constraint inherited from CV-41 (`NP-08-D08-MACRO-DISCLOSURE-XV16-PA-DECISION-PACKET-2026-10-14.md:142`; `…OPTION-E-DISPOSITION…:142` V-C6).

### 4.3 Frontend tests touching the sector route — and why none is sector acceptance evidence

| Test | File:lines | What it actually asserts |
|---|---|---|
| `does not render parameterised or placeholder children as global links` | `App.test.tsx:118-126` | `'Sector'` is **not** a rendered nav link; no rendered href contains `:`. **It never renders `/research/sector/:id`** and asserts nothing about a sector capability. |
| `resolves every clickable nav destination to a built surface (no nav click lands on "not yet built")` | `App.test.tsx:149-164` | Walks only `hrefs.filter(h => h.startsWith('/') && !h.includes(':'))` ⇒ **`/research/sector/:id` is structurally excluded**. |
| `renders group-only parents as headings, never as links to an unbuilt surface` | `App.test.tsx:141-147` | `Research`/`Intelligence` render `nav-group-*` and are not links. **The CV-41 test.** |
| `does not mount an administration route…` / `uses the feature-unavailable placeholder for an unmatched route` | `App.test.tsx:166-176` | `/admin`, `/nonsense` render `shell-feature-unavailable`. Not sector-specific. |
| `Shell states › FeatureNotImplemented does not fabricate feature data or imply an auth gate` | `ShellStates.test.tsx:30-33` | Asserts the placeholder component's own copy. Not sector-specific. |

**No test on `main` asserts that a sector surface exists, fetches, renders, or fails honestly.** The matrix row's Validation cell (`V — shell tests cover the placeholder`) is accurate and is *placeholder-render* coverage, not capability coverage. A "route responds / placeholder renders" test must never be described as sector-surface completion.

### 4.4 Where sector identifiers are linked today (all to `/research/company/:id`, never to `/research/sector/:id`)

| Source | File:lines | Target |
|---|---|---|
| Cross-sector ranking table | `CrossSectorIntelligence.tsx:91` | `/research/company/${r.sector}` |
| Cross-sector opportunities list | `CrossSectorIntelligence.tsx:111` | `/research/company/${o.sector}` |
| Engine registry "Explore a certified result" | `EngineRegistry.tsx:82` | `/research/company/${e.sectorFamily}` |
| Company → replay | `CompanyIntelligence.tsx:96` | `/evidence/replay/${data.sector}` |

**Conclusion:** the whole product treats the **company** route as the sector destination. `/research/sector/:id` is an orphan path with no inbound link. This is the practical reason row 4 has stayed `NI`/`NW` rather than being noticed as broken.

### 4.5 Backend and data contracts (executed probes)

**No sector endpoint exists.** `GET /api/sector/Banking`, `/api/sector`, `/api/sectors` → `404 {"error":"not found"}` (E13–E15). There is no sector handler, DTO, schema or fixture in `frontend/server/`.

**What does exist, and is sector-addressable today:**

| Capability | Endpoint | Verified shape (E#) | Source |
|---|---|---|---|
| Sector engine result + identity + pillars + frozen inputs | `GET /api/company/:sector` | `{companyId:"Banking-H1", sector:"Banking", decision{verdict:"Watch",composite:47.1,confidence:0.8}, overrides[], pillars{asset-quality:15,…}, resolvedSubsegment, resolvedArchetype, calibrationVersion, inputs[{key,value}], evidence{evidenceId:"ev_Banking",engineId:"sector.banking",recommendation,compositeScore}, provenance{dataSource,freshness:"SNAPSHOT",calibratedAt:"2026-08-09T00:00:00.000Z",transportSemantics}}` | E16–E18; `computeCertifiedCompany` `executive-transport.ts:526-563` |
| Sector evidence chain | `GET /api/evidence/:sector` | `decision{}`, `evidence{evidenceId:"ev_Banking",engineId:"sector.banking",recommendation,compositeScore,confidence,keyMetrics[{id,name,value}],supportingScores[{id,name,value}],decisionRulesApplied,calibrationVersion,replayReference,provenance{…methodologyVersion:"IES-Banking"}}`, `snapshot{}`, `replay{}` | E21; `computeCertifiedEvidence` `:434-490` |
| Sector replay verification | `GET /api/replay/:sector` | `original{snapshotId:"snap_Banking",engineId:"sector.banking",calibrationVersion:"1.0.0",verdict,composite,confidence,provenance{…}}`, `replay{reproduced:true,byteIdentical:true,evidenceRefs:["ev_Banking"]}`, `differenceAvailable:false`, explicit `note` that no field-level diff exists | E22; `computeCertifiedReplay` `:389-432` |
| Governed sector universe (13 names, with certified axes) | `GET /api/decision-matrix` | `companies[13]` of `{companyId,sector,verdict,composite,quality,valuation}` — e.g. `Banking-H1/Banking/Watch/47.1/15/50`; `Insurance-H1/…/72.3/72.2/**null**`; `universe{}`; `note` disclaiming any certified quadrant/band | E23; `computeCertifiedDecisionMatrix` `:351-386` |
| Sector ↔ engine ↔ IES ↔ calibration identity | `GET /api/engines` | `engines[13]` of `{engineId:"sector.banking",ies:"IES-006",iesTitle:"Banking Sector Engine",sectorFamily:"Banking",engineVersion:"1.0.0",secVersion,semcVersion,calibrationProfile:"banking-calibration-1.0.0",calibrationVersion,capabilities[]}`; `provenance{certifiedCount:13, source:"Program v1.1 — 13 frozen sector engines (IES-006…015 LTS + IES-016/017/020 via D42) — freeze manifests + replay baseline v1.1.0", freshness:"FROZEN", runtimeConfig{clock:"fixed",idProvider:"deterministic"}}` | E24; `EngineApiAdapter.listEngines()` `EngineApiAdapter.ts:200-223` |
| Corroboration in the typed clients | `frontend/src/api/company.ts:24`, `evidence.ts:38`, `replay.ts:28` | all three client functions name their path parameter **`sector`** (`fetchCompanyData(sector, …)`, `fetchEvidenceData(sector, …)`, `fetchReplayData(sector, …)`) — the client layer already documents these as sector reads |
| Per-sector exposure / weight | `GET /api/portfolio` | `portfolio.sectorExposure = {Banking:7.7, …, "Materials & Metals":7.7}`; `holdings[0] = {companyId:"Banking-H1",sector:"Banking",decision,composite,confidence,quality,risk,weight}` | E25 |
| Per-sector cross-sector aggregates | `GET /api/cross-sector` | `ranking[{companyId,sector,conviction}]`, `opportunity[]`, `correlation{flags,concentrationSectors}`, `decisions[{sector,verdict,composite,confidence}]` | E26 |
| Canonical sector vocabulary | source constant | `CANONICAL_SECTORS` = `Banking, Insurance, Capital Markets, Healthcare, Hospitality, Energy, Utilities, Consumer, Industrials, Technology, Telecommunications, Automobile, Materials & Metals` — stated as "verified identical as a set and in order across `EngineRegistry.CERTIFIED_ENGINES[].sectorFamily` and `PROGRAM_v1.1_REPLAY_BASELINE.json`"; `IT`/`Chemicals`/`Realty`/`Real Estate` are **rejected aliases**, not mappable sectors | `ScreeningPopulation.ts:14-64` |
| Frontend sector vocabulary | source constant | `CERTIFIED_AI_ADVISORY_SECTORS` (`AiAdvisory.tsx:23-37`) — same 13 names, order-asserted by `AiAdvisory.test.tsx:60-88` under `REG-08` | `AiAdvisory.tsx` |

**Error / missing-value behaviour as implemented:**

- Unknown sector on `/api/company/:id` → `404 {"error":"Error: company not found: <id>"}` (E19). Resolution is case-insensitive (`executive-transport.ts:527`) but the raw `Error:` prefix leaks into the JSON body; the empty-id case returns `{"error":"Error: company not found: "}` (E20).
- `confidence` is `null` where the certified golden expected-outputs carry no confidence (e.g. `Materials & Metals`, E18) and the UI already renders this as "unavailable" rather than `0` (`CompanyIntelligence.tsx:51`, `CompanyHeader`).
- `pillars` are `null` for sectors whose engine does not expose them; `CompanyIntelligence.tsx:74-76` renders an explicit `pillars-unavailable` panel rather than deriving.
- `quality` / `valuation` on `/api/decision-matrix` are `null` where the engine lacks the axis (E23).
- All product provenance is `freshness: "SNAPSHOT"`, `calibratedAt: "2026-08-09T00:00:00.000Z"` — a **frozen v1.1 Replay Baseline**, not live data.
- `POST /api/engines/:engineId/execute` executes on **caller-supplied inputs**: `POST` with `inputs:{}` returned `composite: 50` (E27) versus the frozen baseline's `47.1` (E16). **Live engine dispatch is not a substitute for the certified baseline sector result and must not be presented as one.**

**Explicitly unavailable:** any sector-constituent list; any sector-level aggregate beyond the cross-sector/decision-matrix/portfolio emissions above; any sector time series; any sector news, narrative or external intelligence source; any sector taxonomy beyond the 13 certified names (no GICS/NAICS/NIC classification is modelled in IRR anywhere on `main`).

---

## 5. Prior, parallel and abandoned work

### 5.1 IRR orphan branches — one candidate sector component, never admitted

| Ref (IRR) | Tip | File | Size / blob |
|---|---|---|---|
| `phase13-next` | `4357e14a35966cd8508e0c59e40627791c103172` | `frontend/src/features/research/SectorIntelligence.tsx` | 11,007 B, blob `858f1f89fe81e58ffb266bf84c878ee2ced9dc96` |
| `phase13-next` | " | `frontend/src/features/research/SectorIntelligence.test.tsx` | 14,583 B |
| `gai-impl-canonical` | `f63a9b493118643725568a95b86405a5835a30a0` | same two paths | identical sizes (11,007 B / 14,583 B) |

Standing characterisation on `main` (tracker `CHG-2026-10-14-16` / §16.19, and `XV-17` at line 1108): this is the **2026-08-21 orphan stack**, it has **no merge-base with `main`**, it is **OIDC/`authFetch`-gated** (contradicting the operative no-auth decision), and it additionally carries a `/research/macro` nav entry not present on `main`. The tracker's rule for it is explicit: *"Reconciliation must be by content port under the owning gate; a merge is arithmetically impossible (disjoint histories)."*

The lineage investigation (`evidence/integration/lineage-investigation/2026-10-08/CAPABILITY-LINEAGE-RECOVERY-INVESTIGATION.md:59, 89`) classifies it **L3 / UNMNT** with disposition "none on IRR main (placeholder)", status `NON_PRODUCTION`, and notes the E2E-018 screenshot `docs/v3.0/e2e-018-screenshots/sector-intelligence_banking.png` as *binary evidence only — screenshots are not implementation proof*.

### 5.2 The only sector-surface specification that exists anywhere

It is the header comment of the orphan file (§5.1):

> *Route: `/research/sector/:id`. Answers "What does the certified platform say about this sector — its engine, decision, certified pillars, position in the governed universe, and replay verification?" — composed 1:1 from the FOUR existing governed read endpoints: `/api/company/:sector`, `/api/evidence/:sector`, `/api/replay/:sector`, `/api/decision-matrix`.*
>
> *Accepted spec (S1–S6, recorded 2026-08-21):*
> * **S1** all four endpoints compose v1
> * **S2** NO duplication of the Company trust chain — replay-verification summary only, with a link to `/research/company/:sector` for the full chain
> * **S3** Sector → Company link is mandatory
> * **S4** CSIP/macro context excluded
> * **S5** payload order preserved; no sort/rank/band/quadrant
> * **S6** sector selector options sourced ONLY from `/api/decision-matrix`
>
> *Null confidence/quality/valuation/pillars render "unavailable" (never 0). No new endpoint, no recomputation, no fabrication, no persistence.*

Three things make a straight port impossible without separate decisions:

1. **AI advisory embedding.** The file renders `<AiExplanation sectorKey={company.sector} />` inside the sector page. On `main` the advisory is a **separate, non-authoritative, route-mounted surface** (`/ai-advisory`, `AiAdvisory.tsx`) governed by `REG-08` and labelled `AI EXPLANATION ≠ CERTIFIED RESULT`. Embedding it is a product/presentation decision that does not exist on `main`.
2. **Auth transport.** The file's own comment states the three calls propagate a **Bearer** token via `authFetch`. `main` ships `noAuthFetch` (`frontend/src/core/network/noAuthFetch.ts`) under the operative no-auth posture; the orphan's tests also import `keycloakAdapter`/`admin-transport`, both removed.
3. **Naming collision.** The spec composes `/api/company/:sector` as *sector* data while the product names that route "Company" — the same collision recorded as tracker conflict **K11** ("`companyId`: IPD instrument ID vs IRR synthetic sector ID `Banking-H1`").

Only the S6 part (selector sourced from `/api/decision-matrix`) is portable as-is: that endpoint exists and returns the 13 canonical sectors (E23).

**Status of S1–S6 for governance purposes:** not on `main`, not referenced by any record on `main`, written against a pre-no-auth stack, and therefore **not an accepted requirement**. It is recorded here as the only existing candidate shape.

### 5.3 IPD repository — out of scope, recorded for completeness

`git ls-remote --heads https://github.com/ramkivs/iips-production-market-data.git` confirms:

| Ref (IPD) | Tip | Artefact |
|---|---|---|
| `arena/01a0d1d3-iips-production-market-data` | `1c5f46ca039148594bdf243b964a5853c6433248` | `frontend/src/features/research/SectorIntelligence.tsx` (16,782 B); `frontend/server/research-sector-transport.ts` (28,463 B) |
| `arena/01a0d33d-iips-production-market-data` | `887ecce026cd0e1f05b5f4039faa92cb2b9fbff0` | same recovered set |
| `arena/01a0814b-iips-production-market-data` | `da4305149bd5495789f893f530edb2526d08bb5b` | 12,916 B donor variant |

These are **IPD** files in a **different repository**, on unmerged branches. The IPD-side `research-sector-transport.ts` has **no IRR counterpart on `main`** and its presence must not be read as an IRR capability. Nothing here promotes or ports them.

### 5.4 Abandoned / superseded / never-merged

- **No PR, merged or open, has ever carried IRR sector-surface work.** `gh pr list --state all --limit 30` plus `gh pr list --state open` show no such PR; the only open PR is #114 (unrelated).
- **NP-07 (REG-09) deliberately excluded the sector surface** from qualification and acceptance and that exclusion is recorded as current (§6.3).
- **CV-41 is complete but is not sector work** (§6.1).
- **PKG-08 (2026-10-18) deliberately did not select** an option and remains the open question.

---

## 6. CV-41 and governance reconciliation

### 6.1 What CV-41 authorised, and what it delivered

**Register row (tracker line 1038).** Problem: *"Two top-level nav destinations land on 'not yet built'. The sidebar `Research` link resolves to `/research` and the `Intelligence` link to `/intelligence`, both of which render `FeatureNotImplemented`; five routes total … are placeholder mounts, while their implemented siblings … are reachable only by URL or by the four child links the nav allows."*

Remedy options offered: *"Choose per surface: repoint the parent link at its implemented child, **or** label the parent as a group-only heading (non-clickable)."*
Work required column: *"none (IA disposition, no implementation required for the honest option)."*
Status: **`COMPLETE (2026-10-14, CV-CORR-04; group-heading option)`**.

**Delivered (verified on `main` today):**

| Artefact | Location |
|---|---|
| `NavItem.groupOnly?: boolean` | `frontend/src/app/navigation.ts:19` |
| `groupOnly: true` on `Research` | `navigation.ts:44` |
| `groupOnly: true` on `Intelligence` | `navigation.ts:59` |
| `isGroupOnly(item)` | `navigation.ts:91-94` |
| Non-clickable group heading with `data-testid="nav-group-*"` | `Sidebar.tsx:59-64` |
| Test: headings are not links | `App.test.tsx:141-147` |
| Test: every rendered nav href resolves to a built surface | `App.test.tsx:149-164` |
| Reversal note | tracker §16.16.6 — "a one-line `navigation.ts` change per item with no fence, no route and no contract touched" |

### 6.2 What CV-41 explicitly did **not** authorise

- It did **not** commission, specify or authorise a sector workspace. PKG-08 states this in terms: *"CV-41 made the parent Research navigation an honest group heading; **it did not commission a sector workspace**."*
- It did **not** create an endpoint, DTO, schema, fixture or test for sector data.
- It did **not** touch the `Sector` nav child. `navigation.ts:47` already existed and was already filtered out by `AVAILABLE_CHILD_PATHS` **before** CV-41 ran: `docs/integration/IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md:80` (written 2026-10-13) cites `navigation.ts` blob `3866b80eb0a74157cb9374e3db2c1b1116848a4a` as *"Research → Company, Sector, Cross-Sector, Engines"*, i.e. the Sector entry and its hiding pre-date the 2026-10-14 CV-41 execution.
- Its `groupOnly` heading and its two `App.test.tsx` tests are **exactly and only** a navigation/placeholder-honesty disposition. They are presentation-layer honesty markers; `navigation.ts:17` states this explicitly: *"Presentation-only honesty marker: it is never a permission or an authorization decision."*

**Direct answer to the task's question: yes — the `groupOnly` heading and the `App.test.tsx` changes were solely a navigation/placeholder disposition, and nothing else.**

### 6.3 Is CV-41 still binding? Yes — and it is not implementation authority

CV-41 is **binding and complete** for navigation honesty; it is settled and this report identifies no contradictory evidence and no unresolved dependency that would reopen it. Repointing a parent at an implemented child remains open to the PA (tracker row, final column) but touches no fence and changes nothing about row 4.

Critically, CV-41 confers **no implementation authority** for a sector surface. The tracker's standing rule is stated twice at line 2351 and line 3119: *"CV-21 Reports, CV-22 governed universe, CV-32 PIT UI/API, and **PKG-08 rows 4/14/16 likewise require their own product/authority outcomes**"* and *"**packets are not authority**."*

**The NP-07 exclusion is separate, older, and still standing** (2026-10-13, refreshed against `main@6c2c955`):

- `IIPS_v3.0_NP07_RESEARCH_ACCEPTANCE_AND_BASELINE_ADMISSION.md:117` — *"**Sector Intelligence (`/research/sector/:id`) is EXCLUDED and is NOT accepted.**"*
- `:122` — route state recorded as `App.tsx` line 41 → `<FeaturePlaceholder surface="Sector" />` (line number now drifted to 45; §6.5).
- `IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md:64` — *"**Not implemented** — `frontend/src/features/` contains no sector feature directory"*; `:170` and `:178` repeat the exclusion.
- NP-07's `Option C-2` scope is **company + cross-sector + engine registry only**; sector and Macro are excluded by name.

No later decision on `main` defines an intended sector research product behaviour. The only definitional text anywhere is the off-`main` S1–S6 (§5.2).

### 6.4 Matrix row 4 — cell-by-cell reading

Row (tracker §18.1, line 2368):

| # | Capability | Existence | Authority | Integration | Wiring | Data | Persistence | Recovery | Validation | E2E | Evidence | Governance | Acceptance | Qualification | Release-readiness | Anchor |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 4 | Research — sector surface (IRR) | `P — placeholder route only` | `NA` | `NI` | `NW — FeaturePlaceholder` | `NA` | `NA` | `NA` | `V — shell tests cover the placeholder` | `NA` | `V` | `V — CV-41 disposition executed 2026-10-14 (groupOnly heading + App.test.tsx)` | **`NOT SATISFIED`** | `NA` | `NI — not a shipped surface` | `App.tsx:41`; V19; CV-41 |

Every cell above is **re-verified as accurate** by this investigation, with two corrections of form (not substance):

- **Anchor drift.** `App.tsx:41` is stale; the sector placeholder is at **`App.tsx:45`** at `ad008e45`. Line 41 is now `/collaboration`. The drift is from route additions after 2026-10-13 (e.g. `/research/macro` at `App.tsx:47`). The path, element and surface string are unchanged.
- **Validation cell wording.** `V — shell tests cover the placeholder` is literally true but is *placeholder-render* coverage (§4.3). It must not be read forward into the Acceptance column.

### 6.5 No authority exists today to build the missing work

Searches for sector-specific implementation authority on `main` returned nothing. The governing statements are all negative or deferring: PKG-08 row 4 ("Retain placeholder/API-only, **or** commission…?" — unanswered), tracker lines 2351/3119 ("require their own product/authority outcomes"; "packets are not authority"), and NP-07 §6 ("EXCLUDED and is NOT accepted").

---

## 7. Intended capability — what the repository evidence supports, and what it does not

The task requires separating documented requirements from reasonable proposals and unresolved product questions. The result is stark.

### 7.1 Documented on the authoritative ref — essentially nothing

The only things `main` says about a sector surface are **names**:

- `frontend/src/app/routes.ts:19` — `researchSector: '/research/sector/:id'`
- `frontend/src/app/navigation.ts:47` — `{ label: 'Sector', path: '/research/sector/:id' }`
- `docs/v3.0/navigation-model.md:48` — `… /research/sector/:id …`
- `docs/v3.0/information-architecture.md:26-27` — a `Research` tree with `Sector` and `Cross-Sector` children
- `docs/v3.0/phase13/phase13-information-architecture.md:22` and `docs/v3.0/phase14/phase14-information-architecture.md:11` — same route list
- `docs/OPERATOR_RUNBOOK.md:188` — `/research/sector/:id` listed among the honest `FeatureNotImplemented` mounts

There is **no screen contract, no field list, no data-source designation, no acceptance criterion, and no user outcome** for a sector surface anywhere on `main`. The phase capability matrices (`docs/v3.0/phase13/capability-matrix.md`, `phase14/capability-matrix.md`) list only "Company intelligence" and "Cross-sector" — **there is no Sector row**.

PKG-08 anticipated exactly this and pre-empted the inference: **"No endpoint or feature requirement is inferred from the route name."**

**Therefore: the intended sector research capability CANNOT be established from existing authority.** That is a finding, not a gap in this investigation.

### 7.2 What a sector surface could legitimately show, from data that exists today (no invention)

Derived strictly from §4.5, with the certified source named for each:

| Element | Certified source | Notes |
|---|---|---|
| Sector identity (13 canonical names) | `CANONICAL_SECTORS` / `CERTIFIED_ENGINES[].sectorFamily` / `CERTIFIED_AI_ADVISORY_SECTORS` / `PROGRAM_v1.1_REPLAY_BASELINE.json` | the only classification that exists; no external taxonomy |
| Engine identity for the sector (`engineId`, `IES`, `iesTitle`, `engineVersion`, `calibrationProfile`, `calibrationVersion`, `capabilities`) | `GET /api/engines` (E24) | `freshness: FROZEN` |
| Certified decision (`verdict`, `composite`, `confidence`) | `GET /api/company/:sector` (E16) | `confidence` `null` for some sectors → must render "unavailable" |
| Certified pillars | `GET /api/company/:sector` | `null` where the engine does not expose them |
| Overrides applied | `GET /api/company/:sector` | already surfaced by `CompanyIntelligence` |
| Frozen input metrics (traceable) | `GET /api/company/:sector` / `GET /api/evidence/:sector` `keyMetrics` | labelled `SNAPSHOT` |
| Evidence chain summary (`evidenceId`, `engineId`, recommendation, supporting scores, rules applied) | `GET /api/evidence/:sector` (E21) | the full chain already lives at `/evidence/:id` |
| Replay verification summary (`reproduced`, `byteIdentical`, `differenceAvailable: false`) | `GET /api/replay/:sector` (E22) | no field-level diff exists and none may be implied |
| Position in the governed universe (composite / quality / valuation axes) | `GET /api/decision-matrix` (E23) | `null` axes → "unavailable" |
| Sector exposure / weight in the reference portfolio | `GET /api/portfolio` (E25) | 7.7 % each across 13 sectors |
| Cross-sector context (ranking, opportunity, correlation flags) | `GET /api/cross-sector` (E26) | already rendered by `CrossSectorIntelligence`; S4 of the orphan spec excluded it |
| Sector selector options | `GET /api/decision-matrix` `companies[].sector` (E23) | the "N+12 pattern" — sourced, never hardcoded |
| Provenance / freshness | every DTO's `provenance` | all `SNAPSHOT`, `calibratedAt: 2026-08-09T00:00:00.000Z` |

### 7.3 What does **not** exist and must not be implied

- Constituent companies of a sector (there is no company universe; the "company" is a synthetic `${sector}-H1` holding).
- Any sector-level metric not already emitted by the four endpoints plus `/api/portfolio` and `/api/cross-sector`.
- Any sector classification beyond the 13 certified names.
- Any live, dated or time-varying sector data (everything is a frozen v1.1 Replay Baseline snapshot).
- Any sector narrative, news, filing or external intelligence source.
- A field-level replay diff (the governed contract explicitly declines to provide one).

### 7.4 Unresolved product questions raised by the evidence

These are recorded, **not answered**:

1. **Is a sector surface wanted at all, given that `/research/company/:id` is already sector-keyed?** The honest options are (a) retain the placeholder and record a dated deferral; (b) **rename/reposition** the existing certified surface so its sector semantics are truthful and route `/research/sector/:id` to it; (c) commission a distinct sector surface with its own contract. Option (b) has no precedent in the register and would change an accepted NP-07 surface's route — a governance event, not a code change.
2. **If a distinct surface is commissioned, does it duplicate or complement the Company trust chain?** The orphan spec's S2/S3 answered this ("summary only + mandatory link"), but that answer is not authoritative on `main`.
3. **Where does the advisory belong?** The orphan spec embeds `AiExplanation`; `main` keeps the advisory on its own route under `REG-08`.
4. **How is `SNAPSHOT`/frozen data disclosed?** Precedent exists (`CertifiedBadge`, `FreshnessBadge`, and the D89 `MacroSourceDisclosure` pattern) but no sector-specific wording is authorised.
5. **Does cross-sector context belong on a sector page?** S4 excluded it; `main`'s `CrossSectorIntelligence` already provides it on its own route.

---

## 8. Acceptance-gap matrix

Labels: **VERIFIED PRESENT** · **PARTIAL** · **MISSING** · **NOT VERIFIED** · **BLOCKED** · **NOT APPLICABLE**.

| Capability / criterion | Current implementation | Evidence | Gap | Required action | Authority needed? | Acceptance evidence |
|---|---|---|---|---|---|---|
| **Route and navigation** — a sector route is mounted | `<Route path="/research/sector/:id">` mounts `FeaturePlaceholder` (static shell, no fetch, no `:id` resolution) | `App.tsx:45`; `App.tsx:26-28`; `ShellStates.tsx:46-55`; `routes.ts:19` | **PARTIAL** (mounted only — a route that exists but delivers no capability) | Either mount a real sector view in the same change that un-hides the nav child, or record a dated retain/defer disposition and leave the mount honest | Yes — if un-hiding the child (breaks `App.test.tsx:118-126` and `:149-164` otherwise) | A test that renders `/research/sector/<canonical>` and asserts sector content (not `shell-feature-unavailable`), plus `App.test.tsx` green |
| **Sector selection** — a user can reach and change sector | **Not reachable.** `Sector` is in `NAV` (`navigation.ts:47`) but absent from `AVAILABLE_CHILD_PATHS` (`:80-89`) ⇒ `visibleChildren()` (`:101-104`) drops it. No inbound link exists anywhere (`CrossSectorIntelligence.tsx:91,111`; `EngineRegistry.tsx:82`; `CompanyIntelligence.tsx:96` all point at `/research/company/:sector`) | `navigation.ts:47,80-89,101-104`; `Sidebar.tsx:54-91`; `App.test.tsx:118-126` | **MISSING** | Add a governed selector (options from `/api/decision-matrix`, never hardcoded) and/or inbound cross-links, in the same change as the view | Yes | Test asserting selector options equal the 13 canonical sectors; test asserting navigation to a changed sector refetches |
| **Sector identity and classification** | Canonical vocabulary exists and is governed, but is **never displayed as a sector identity** on a sector route | `ScreeningPopulation.ts:34-64` (`CANONICAL_SECTORS`, rejected aliases `IT`/`Chemicals`/`Realty`/`Real Estate`); `EngineRegistry.ts:53+`; `AiAdvisory.tsx:23-37`; E24 | **PARTIAL** (data present, no surface) | Render sector name + `engineId`/`IES`/engine version/calibration from `GET /api/engines`, 1:1, no invented taxonomy | Yes | Test asserting the displayed engine identity equals `/api/engines` for that `sectorFamily` |
| **Data and research contract** — a sector DTO/schema | **No sector endpoint, DTO, schema or fixture.** `/api/sector*`, `/api/sectors` → `404 {"error":"not found"}`. The sector-keyed contracts that exist are named `company` | E13–E15; `executive-transport.ts:526-563, 953-963`; `src/api/company.ts:24-28` | **MISSING** | Either (i) compose the surface 1:1 from `/api/company/:sector` + `/api/evidence/:sector` + `/api/replay/:sector` + `/api/decision-matrix` with **no new endpoint** (transport-boundary-safe), or (ii) define and authorise a new sector DTO — a contract/governance event | (i) product disposition only; (ii) **contract decision + authority** | Documented field list with a named certified source per field; negative test per field for the `null` case |
| **Backend integration** | Four certified sector-addressable endpoints return 200 with full provenance (E16, E21, E22, E23) plus `/api/engines` (E24) | E16–E24 | **VERIFIED PRESENT** (for the *inputs*; no sector consumer exists) | Bind a client per endpoint (or reuse existing typed clients — §9.1) | No — reuse | Contract test per consumed endpoint asserting exact DTO keys and `provenance.freshness === 'SNAPSHOT'` |
| **`GET /api/company/:id` semantics** | **Sector-keyed, not company-specific**: `computeCertifiedCompany(sectorId)` keyed by `k.toLowerCase() === sectorId.toLowerCase()`; emits `companyId: "<Sector>-H1"`. Also consumed that way by `EngineRegistry.tsx:82` and `CrossSectorIntelligence.tsx:91,111` | `executive-transport.ts:526-533, 953-963`; E16–E19 | **VERIFIED PRESENT** (as a fact) — and it is the **root ambiguity** for row 4 | Decide whether the sector surface consumes this endpoint under its current name (with honest labelling) or whether the route/identity naming is itself the decision (§7.4 Q1) | **Yes — product decision** | Recorded naming/semantics decision; UI copy that does not present a synthetic `${sector}-H1` holding as a real company |
| **Research presentation** — sector view rendering | No sector component or directory exists | `ls frontend/src/features` (no `sector/`); `grep -rn "SectorIntelligence" frontend/src` → 0 | **MISSING** | One presentational component composed ONLY from certified fields; presentational sort/group/format only; `null` → "unavailable" (never `0`) | Yes | Component test per section: success, `null` pillar, `null` confidence, absent universe row |
| **Provenance and missing-data behaviour** | Provenance already flows on every DTO (`dataSource`, `freshness: "SNAPSHOT"`, `calibratedAt: 2026-08-09T00:00:00.000Z`, `transportSemantics`); `null` handling is already implemented and tested on the Company surface | E16, E21–E23; `CompanyIntelligence.tsx:51,74-76`; `CompanyHeader.tsx` | **PARTIAL** (mechanism present; no sector surface to carry it) | Reuse `CertifiedBadge` / `FreshnessBadge` / `UnavailableState`; reuse the `pillars-unavailable` pattern; do not imply a field-level replay diff | No — reuse | Test asserting the provenance footer text and the `unavailable` rendering for each `null` axis |
| **Component and API tests** | 77 files / 935 tests pass; **zero** sector-surface tests. Sector-adjacent assertions are all negative nav assertions | E10; `App.test.tsx:118-126, 149-164`; `ShellStates.test.tsx:30-33` | **MISSING** | Add sector component tests and (if a client is added) client tests; do **not** count placeholder-render tests as sector coverage | Yes (implementation authority) | Named test files with pass counts recorded in an evidence record |
| **End-to-end verification** | No E2E exists for a sector surface: no route consumption, no browser run, no operator run | §4.3; no E2E artefact references a sector route on `main` | **MISSING / NOT VERIFIED** | Server-probe E2E (route → API → render) at minimum; browser/Windows acceptance is **not** performable by Arena and must not be claimed | Yes | Executed probe log at a named commit; any human/browser acceptance recorded as operator-transferred, not self-asserted |
| **Governance and implementation authority** | **No authority exists.** PKG-08 row 4 is an unanswered question; NP-07 excludes the surface; tracker lines 2351/3119 state rows 4/14/16 "require their own product/authority outcomes" and "packets are not authority" | `PKG-08-…-ROWS-4-14-16.md:9`; NP-07 acceptance `:117,:122`; qualification `:64,:170,:178`; tracker 2351, 3119 | **BLOCKED** | A dated, named disposition for row 4: **retain/defer (recorded)** or **commission (with named route/screen contract, permitted data source, acceptance test and implementation authority)** — PKG-08's own closure rule | **Yes — this is the blocker** | A signed/dated disposition record published on `main`, plus tracker reconciliation |
| **Acceptance and qualification** | Acceptance cell = **`NOT SATISFIED`**; Qualification = `NA`. NP-07 qualified only company + cross-sector + engine registry | tracker §18.1 row 4; NP-07 §5, §6 | **MISSING — and remains `NOT SATISFIED`** | Qualification and acceptance are separate, later acts, each requiring its own record | Yes | Acceptance record naming the surface, scope, evidence set and exclusions — modelled on `docs/integration/IIPS_v3.0_NP07_RESEARCH_ACCEPTANCE_AND_BASELINE_ADMISSION.md` |
| **Prior orphan implementation (`phase13-next` / `gai-impl-canonical`)** | `SectorIntelligence.tsx` (11,007 B, blob `858f1f89…`) + test (14,583 B) exist on two unmerged IRR refs with **no merge-base with `main`** and an OIDC/`authFetch` transport; carries the non-authoritative S1–S6 spec | `git ls-remote`; GitHub tree/contents API; tracker `XV-17` line 1108, `CHG-2026-10-14-16` | **NOT VERIFIED** as admissible; **BLOCKED** as a merge | Content port only under an owning gate — never a merge (disjoint histories) | Yes | Not usable as acceptance evidence in its current location |
| **IPD recovered implementation** | `SectorIntelligence.tsx` (16,782 B) + `research-sector-transport.ts` (28,463 B) on IPD branches | `git ls-remote` on `iips-production-market-data`; contents API | **NOT APPLICABLE** (different repository; task boundary excludes IPD) | Do not port, equate or cite as IRR capability | n/a | n/a |
| **Browser / Windows / operator acceptance for any sector surface** | None exists | — | **NOT VERIFIED** (and not performable here) | Must be executed by the operator on the Windows host and transferred as evidence | n/a | Operator-transferred transcript; never self-asserted by Arena |

---

## 9. Recommended bounded implementation plan

This is a **proposal**, sequenced by dependency. Steps 1–2 are authorised (investigation/documentation). Step 3 is the decision. Steps 4–8 are **contingent on step 3 selecting "commission"** and are **not authorised** by anything in this document.

### 9.1 Existing components and contracts to reuse (no new data, no new contract)

| Reuse | Location | For |
|---|---|---|
| `fetchCompanyData` / `CompanyData` | `frontend/src/api/company.ts:10-28` | sector decision, pillars, overrides, inputs, evidence ref |
| `fetchEvidenceData` / `EvidenceData` | `frontend/src/api/evidence.ts:10,38` (parameter is named `sector`) | evidence-chain summary |
| `fetchReplayData` / `ReplayData` | `frontend/src/api/replay.ts:9,28` (parameter is named `sector`) | replay verification summary |
| `fetchDecisionMatrixData` / `MatrixCompany` | `frontend/src/api/decisionMatrix.ts:10-31` | governed sector list + universe position; selector options |
| `fetchEngines` / `EngineListData` | `frontend/src/api/engines.ts:10-32` | `engineId`, `IES`, versions, calibration |
| `CompanyHeader` | `frontend/src/components/company/CompanyHeader.tsx` | header pattern with `null` confidence handling |
| `MetricGroup`, `MetricCard`, `DataTable` | `frontend/src/components/data/DataComponents.tsx` | certified value presentation |
| `DecisionBadge` | `frontend/src/components/decision/DecisionComponents.tsx` | verdict |
| `CertifiedBadge`, `FreshnessBadge`, `StatusBadge` | `frontend/src/components/ui/Badges.tsx` | provenance / freshness / overrides |
| `LoadingState`, `ErrorState`, `UnavailableState` | `frontend/src/components/state/StateComponents.tsx` | honest states |
| `noAuthFetch` | `frontend/src/core/network/noAuthFetch.ts` | no-auth transport (the orphan's `authFetch` must not be revived) |
| `pillars-unavailable` pattern | `CompanyIntelligence.tsx:74-76` | `null`-honest rendering, never `0` |
| D89 disclosure pattern | `MacroSourceDisclosure.tsx`, `MacroDataModeNotice.tsx` | precedent for a frozen-data disclosure on a read-only surface |
| Test harnesses | `CompanyIntelligence.test.tsx`, `EngineRegistry.test.tsx`, `AiAdvisory.test.tsx` (incl. its 13-sector order assertion) | component-test template |

### 9.2 Required UI work (contingent)

1. One component, `frontend/src/features/sector/SectorIntelligence.tsx`, presentational only: sector identity (name + `engineId`/`IES`/version/calibration from `/api/engines`), certified decision (verdict/composite/confidence), pillars, overrides, frozen inputs, evidence summary, replay-verification summary, universe position, governed selector, provenance footer.
2. Sort/group/format only — **no** ranking, banding, quadrant, threshold, aggregation or derivation in React.
3. `null` → "unavailable" everywhere (confidence, pillars, quality, valuation).
4. Mandatory link to `/research/company/:sector` for the full trust chain (adopt S3 only if the decision records it).
5. No embedded AI advisory unless separately decided (S4/§7.4 Q3); if decided, reuse the existing non-authoritative labelling.

### 9.3 Required server/API work

**None, under the composition option.** All four source endpoints plus `/api/engines` and `/api/decision-matrix` already exist, are sector-addressable, and carry provenance (E16, E21–E24). No new endpoint is required and none should be invented.

Two *optional* cleanups, each needing its own authority because each changes an existing certified response:

- `GET /api/company/:id` unknown-sector error body leaks the raw `Error:` prefix (E19/E20) — cosmetic, but it is a contract-shape change.
- Adding a `/api/sector/:id` alias — **not recommended**: it would create a second name for the same certified payload and deepen the naming collision (§7.4 Q1).

### 9.4 Required data or contract work

- **None for data.** Everything is already certified and frozen.
- **Contract work only if** the disposition chooses a new sector DTO rather than composition: then a field list with a named certified source per field, missing-value semantics, and a negative-path test matrix are required — a governance event.
- `POST /api/engines/:id/execute` must **not** be used as the sector data source: with caller-supplied inputs it returned `composite: 50` versus the frozen baseline's `47.1` (E16 vs E27). Certified sector results come from the baseline composition only.

### 9.5 Tests and end-to-end verification (contingent)

1. `SectorIntelligence.test.tsx` — loading / success / error / unavailable; `null` confidence; `null` pillars; absent universe row; selector options equal the 13 canonical sectors; navigation on change; provenance footer text.
2. `App.test.tsx` — extend so `/research/sector/:id` resolves to a built surface **in the same change** that adds the nav child (otherwise `App.test.tsx:118-126` and `:149-164` fail).
3. Server-level E2E at the composed transport: `/api/engines` + `/api/company/:sector` + `/api/evidence/:sector` + `/api/replay/:sector` + `/api/decision-matrix` → render, at a named commit, with the raw probe log deposited as an evidence record.
4. **Not performable here and therefore not claimable:** real-browser rendering, Windows-host execution, unassisted human-reader acceptance. These must be operator-transferred.

### 9.6 Governance / authority dependencies

| Dependency | Kind | Blocking? |
|---|---|---|
| Row-4 disposition: retain/defer **or** commission | Product/program authority (**PKG-08 closure rule**) | **YES — this is the blocker** |
| If commissioned: named route/screen contract, permitted data source, acceptance test, implementation authority | Authority act | **YES** |
| Naming/semantics decision for `/api/company/:id` (sector-keyed) vs `/research/sector/:id` | Product decision (§7.4 Q1) | YES if the surface consumes the company endpoint |
| Advisory placement decision | Product decision (§7.4 Q3) | Only if embedding is proposed |
| CV-41 | **Settled — no action** | No |
| NP-07 exclusion | Stands until a new act admits the sector surface; do not reopen | No (but it must be reconciled by the new act) |
| CV-22 (governed universe) | Separate — not a prerequisite for sector identity | No |
| IPD work of any kind | Out of scope | No |

### 9.7 Acceptance and qualification evidence (contingent)

Modelled on the NP-07 pair and on `PKG-05` (the CV-32 API-only disposition), which is the closest precedent for closing an unmounted-surface row by documentation:

- A qualification record: scope, file paths with blob/SHA identity, executed test counts at a named commit, typecheck/build results, and explicit exclusions.
- An acceptance record: the accepted user outcome, the certified source per displayed field, the `null`/missing-value semantics, and the explicit statement that no production readiness, admission or certification is granted.
- A dated tracker/matrix reconciliation (row 4 only) — **not performed by this document**.

### 9.8 Sequencing

```
[done]  1. Investigation + evidence record + this report      → this change
[next]  2. Publish to main and verify remotely                → this change
[gate]  3. Row-4 disposition decision  ◄── BLOCKING GATE
         ├── (a) RETAIN/DEFER  → dated disposition record; row 4 recorded as a
         │                       deliberate disposition, not "NOT SATISFIED by
         │                       omission"; no code.  (PKG-05 precedent)
         └── (b) COMMISSION    → 4 → 5 → 6 → 7 → 8
                4. Named route/screen contract + implementation authority
                5. UI component (composition only, §9.2) + nav child + tests
                   — all in ONE change (CV-41 sequencing constraint)
                6. Server-level E2E at a named commit
                7. Qualification record
                8. Acceptance record + tracker row-4 reconciliation
```

**Work already authorised:** steps 1–2 only (investigation and documentation under the standing authorization).
**Work requiring an additional decision:** everything from step 3 onward.

---

## 10. Authority questions (genuine, unresolved)

1. **Row 4 disposition.** Retain the placeholder with a dated deferral, or commission a named sector surface? PKG-08 asked this on 2026-10-18 and it is unanswered. Owner: IRR product/program authority. This single question blocks everything else.
2. **If commissioned: what is the screen contract?** Which certified fields, from which named endpoints, with what missing-value semantics — and is composition (no new endpoint) or a new sector DTO the intended shape?
3. **Naming and identity.** Given `/api/company/:id` and `/research/company/:id` are sector-keyed, is the correct remedy a *new* sector surface, or *renaming/repositioning the existing certified surface* so its semantics are truthful? The second option has no precedent in the register and would alter an NP-07-accepted route.
4. **Advisory placement.** May a sector page embed the non-authoritative AI explanation, or must it stay on `/ai-advisory` under `REG-08`?
5. **Cross-sector context on a sector page.** In scope or excluded (the orphan spec's S4 excluded it; `CrossSectorIntelligence` already owns it)?

Questions 2–5 are **contingent**: they only arise if question 1 is answered "commission".

---

## 11. Explicit statement of what remains unresolved

1. **Whether a sector research surface is wanted at all.** No requirement exists on the authoritative ref; only a route name.
2. **What the surface would show, and for whom.** No user outcome, field list or owner is recorded anywhere on `main`.
3. **Whether the sector surface duplicates `/research/company/:id`.** The company route is sector-keyed; the overlap is unresolved.
4. **The status of the S1–S6 spec.** It exists only on orphan branches with no merge-base with `main`, written against an OIDC stack. It is **not** authoritative and has not been ratified, rejected or superseded by any record on `main`.
5. **Whether the `phase13-next` / `gai-impl-canonical` component is a valid donor.** Content-port-only under an owning gate, per `XV-17`; not assessable end-to-end from this environment because those refs cannot be merged and their test dependencies (`keycloakAdapter`, `admin-transport`, `authFetch`) do not exist on `main`.
6. **The IPD recovered implementation.** Different repository, out of scope, not reconciled.
7. **Qualification and acceptance.** Neither exists for any sector surface; both are separate later acts.
8. **Browser, Windows and unassisted-reader acceptance.** None exists for any sector surface and none is claimed here; Arena cannot perform it.
9. **The matrix row's stale anchor** (`App.tsx:41` vs the current `App.tsx:45`). Corrected in this document; **the tracker itself was not edited**, so the stale anchor persists there.
10. **Row 4's matrix status.** This report changes nothing. **Row 4 remains `NOT SATISFIED`** until its actual acceptance criteria are defined by an authority act and independently evidenced.

---

## 12. Publication and verification

To be completed after commit and push:

| Field | Value |
|---|---|
| Report | `docs/integration/2026-10-20/PKG-08-ROW4-SECTOR-SURFACE-INVESTIGATION-AND-ACCEPTANCE-GAP-2026-10-20.md` |
| Evidence record | `evidence/integration/sector-surface-row4-2026-10-20/evidence-record.md` |
| Branch | `arena/731ab028-iips-review-recovered` |
| Base | `ad008e45e64f15e895043bd2c554a7c93a4c2dc1` |
| Publication | PR → `main`; remote read-back by SHA-256 from `main` after merge |

**Boundary statement.** This document adds two Markdown paths and nothing else. It changes no product code, route, UI, API, DTO, schema, test, fence, dependency, pin or tracker row. It does not render a decision, does not grant implementation authority, and does not mark matrix row 4 accepted or complete.
