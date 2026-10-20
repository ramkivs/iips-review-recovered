# PKG-08 — Row 4 Sector Research Surface: Bounded Contract Proposal and Acceptance Criteria

**Record ID:** `PKG-08-ROW4-CONTRACT-PROPOSAL-01`
**Date:** 2026-10-20 (UTC)
**Governance parent:** [`PKG-08-ROW4-SECTOR-SURFACE-COMMISSION-AND-GOVERNANCE-RECONCILIATION-2026-10-20.md`](./PKG-08-ROW4-SECTOR-SURFACE-COMMISSION-AND-GOVERNANCE-RECONCILIATION-2026-10-20.md) (`PKG-08-ROW4-COMMISSION-01`)
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Authoritative ref:** `refs/heads/main` @ `0231e162717c9c7bf8b14b304307231fa5c84a5e`
**Status:** **PROPOSED — awaiting PA review. Not an accepted requirement, not implementation authority.**

> **This document is a contract proposal.** Every field, endpoint mapping, and acceptance criterion below is marked as **Established** (already supported by authoritative code or a binding decision), **Proposed** (a bounded recommendation awaiting review), or **Unresolved** (a material product choice that cannot be inferred from existing authority). No proposal is treated as accepted until separately authorized.

---

## 1. Purpose and users

**[Established]** The Sector Research Surface answers the question: *"What does the certified platform say about this sector — its engine, decision, certified pillars, position in the governed universe, and replay verification?"*

**[Proposed]** The primary user is the single application owner (IRR is a single-user personal-use application under `F-1`/`F-2`/`F-3`). The surface provides a sector-level research view that:

- Displays the certified engine identity and result for a selected sector.
- Shows the sector's position in the governed 13-sector universe.
- Provides evidence-chain and replay-verification summaries.
- Links to the existing Company surface for the full trust chain.

**[Established]** This is a read-only, presentational surface. No analytical calculation, ranking, scoring, or derivation occurs in the frontend. Every displayed value has a traceable certified source.

---

## 2. Sector identity

**[Established]** The governed sector universe consists of exactly 13 canonical sectors, in canonical order:

| # | Sector name | Engine ID | IES |
|---|---|---|---|
| 1 | Banking | `sector.banking` | IES-006 |
| 2 | Insurance | `sector.insurance` | IES-007 |
| 3 | Capital Markets | `sector.capital-markets` | IES-008 |
| 4 | Healthcare | `sector.healthcare` | IES-009 |
| 5 | Hospitality | `sector.hospitality` | IES-010 |
| 6 | Energy | `sector.energy` | IES-011 |
| 7 | Utilities | `sector.utilities` | IES-012 |
| 8 | Consumer | `sector.consumer` | IES-013 |
| 9 | Industrials | `sector.industrials` | IES-014 |
| 10 | Technology | `sector.technology` | IES-015 |
| 11 | Telecommunications | `sector.telecom` | IES-016 |
| 12 | Automobile | `sector.auto` | IES-017 |
| 13 | Materials & Metals | `sector.materials` | IES-020 |

**[Established]** Source: `CANONICAL_SECTORS` (`iips-platform/src/sector-engines/cross-sector/population/ScreeningPopulation.ts:34-48`), corroborated by `CERTIFIED_ENGINES[].sectorFamily` (`iips-platform/src/integration/EngineRegistry.ts`), `CERTIFIED_AI_ADVISORY_SECTORS` (`frontend/src/features/ai-advisory/AiAdvisory.tsx:23-37`), and `PROGRAM_v1.1_REPLAY_BASELINE.json`.

**[Established]** Rejected aliases: `IT`, `Chemicals`, `Realty`, `Real Estate` are not mappable sectors (`ScreeningPopulation.ts`).

**[Proposed]** Sector selection behaviour:
- The sector surface is reached at `/research/sector/:id` where `:id` is a canonical sector name (case-insensitive resolution, matching the existing `/api/company/:sector` behaviour).
- A sector selector (`<select>`) provides the 13 canonical sectors as options.
- **The selector options are sourced from `GET /api/decision-matrix` response's `companies[].sector` array** — never hardcoded. This adopts the orphan spec's S6 ("N+12 pattern"), which is portable as-is because the endpoint exists on `main`.
- Changing the selector navigates to `/research/sector/:newSectorId`, triggering a refetch.

---

## 3. Endpoint mapping

### 3.1 Existing endpoints to reuse

**[Established]** No new endpoint is required. The commissioned surface composes from five existing, certified, sector-addressable endpoints:

| Endpoint | Used for | Source verification |
|---|---|---|
| `GET /api/company/:sector` | Certified decision (verdict, composite, confidence), pillars, overrides, resolved subsegment/archetype, calibration version, frozen input metrics, evidence reference | Investigation §4.5 E16–E18; `executive-transport.ts:526-563` |
| `GET /api/evidence/:sector` | Evidence chain summary (evidenceId, engineId, recommendation, compositeScore, confidence, keyMetrics, supportingScores, decisionRulesApplied, calibrationVersion, replayReference, methodologyVersion) | Investigation §4.5 E21; `executive-transport.ts:434-490` |
| `GET /api/replay/:sector` | Replay verification summary (reproduced, byteIdentical, differenceAvailable:false, evidenceRefs) | Investigation §4.5 E22; `executive-transport.ts:389-432` |
| `GET /api/decision-matrix` | Governed 13-sector list (for selector options and universe position) | Investigation §4.5 E23; `executive-transport.ts:351-386` |
| `GET /api/engines` | Sector ↔ engine ↔ IES ↔ calibration identity | Investigation §4.5 E24; `EngineApiAdapter.ts:200-223` |

### 3.2 Existing typed clients to reuse

**[Established]** The following typed API clients already exist and name their path parameter `sector`:

| Client | File:line | Parameter name |
|---|---|---|
| `fetchCompanyData` | `frontend/src/api/company.ts:24` | `sector: string` |
| `fetchEvidenceData` | `frontend/src/api/evidence.ts:38` | `sector: string` |
| `fetchReplayData` | `frontend/src/api/replay.ts:28` | `sector: string` |
| `fetchDecisionMatrixData` | `frontend/src/api/decisionMatrix.ts:22` | (no parameter — fetches all) |
| `fetchEngines` | `frontend/src/api/engines.ts` | (no parameter — fetches all) |

**[Proposed]** These clients are reused as-is. No new client is created. The sector surface component imports all five.

### 3.3 Endpoints explicitly not used

**[Proposed]** `POST /api/engines/:engineId/execute` is **not** used as a sector data source. The investigation verified that live engine dispatch on caller-supplied inputs returns different composite values (`50` vs the frozen baseline's `47.1` for Banking) — it is not a substitute for the certified baseline result.

**[Proposed]** `GET /api/portfolio` and `GET /api/cross-sector` are **not** included in the initial scope. Their data (sector exposure/weight, cross-sector ranking/opportunity/correlation) is already available on existing surfaces (Portfolio, Cross-Sector Intelligence). Including them on the sector page would duplicate information and broaden scope without a defined user need. This is an unresolved product choice (see §4.3).

---

## 4. Displayed information: field/source map

### 4.1 Sector identity and engine information

| Field | Source | Status |
|---|---|---|
| Sector name | `GET /api/engines` → `engines[].sectorFamily` (matched by sector) | **[Established]** directly available |
| Engine ID | `GET /api/engines` → `engines[].engineId` | **[Established]** directly available |
| IES identifier | `GET /api/engines` → `engines[].ies` | **[Established]** directly available |
| IES title | `GET /api/engines` → `engines[].iesTitle` | **[Established]** directly available |
| Engine version | `GET /api/engines` → `engines[].engineVersion` | **[Established]** directly available |
| SEC version | `GET /api/engines` → `engines[].secVersion` | **[Established]** directly available |
| SEMC version | `GET /api/engines` → `engines[].semcVersion` | **[Established]** directly available |
| Calibration profile | `GET /api/engines` → `engines[].calibrationProfile` | **[Established]** directly available |
| Calibration version | `GET /api/engines` → `engines[].calibrationVersion` | **[Established]** directly available |
| Engine capabilities | `GET /api/engines` → `engines[].capabilities` | **[Established]** directly available |

### 4.2 Certified decision

| Field | Source | Status |
|---|---|---|
| Verdict | `GET /api/company/:sector` → `decision.verdict` | **[Established]** directly available |
| Composite score | `GET /api/company/:sector` → `decision.composite` | **[Established]** directly available |
| Confidence | `GET /api/company/:sector` → `decision.confidence` | **[Established]** directly available; **`null` for some sectors** → rendered as "unavailable" (never `0`) |
| Overrides applied | `GET /api/company/:sector` → `overrides[]` | **[Established]** directly available |
| Resolved subsegment | `GET /api/company/:sector` → `resolvedSubsegment` | **[Established]** directly available; may be `null` |
| Resolved archetype | `GET /api/company/:sector` → `resolvedArchetype` | **[Established]** directly available; may be `null` |

### 4.3 Certified pillars

| Field | Source | Status |
|---|---|---|
| Pillar scores | `GET /api/company/:sector` → `pillars` | **[Established]** directly available; **`null` for sectors whose engine does not expose them** → rendered as "unavailable" (never derived) |

### 4.4 Frozen input metrics

| Field | Source | Status |
|---|---|---|
| Input metrics | `GET /api/company/:sector` → `inputs[]` | **[Established]** directly available; labelled as SNAPSHOT inputs |

### 4.5 Evidence chain summary

| Field | Source | Status |
|---|---|---|
| Evidence ID | `GET /api/evidence/:sector` → `evidence.evidenceId` | **[Established]** directly available |
| Engine ID (from evidence) | `GET /api/evidence/:sector` → `evidence.engineId` | **[Established]** directly available |
| Recommendation | `GET /api/evidence/:sector` → `evidence.recommendation` | **[Established]** directly available |
| Composite score (from evidence) | `GET /api/evidence/:sector` → `evidence.compositeScore` | **[Established]** directly available |
| Confidence (from evidence) | `GET /api/evidence/:sector` → `evidence.confidence` | **[Established]** directly available |
| Key metrics | `GET /api/evidence/:sector` → `evidence.keyMetrics[]` | **[Established]** directly available |
| Supporting scores | `GET /api/evidence/:sector` → `evidence.supportingScores[]` | **[Established]** directly available |
| Decision rules applied | `GET /api/evidence/:sector` → `evidence.decisionRulesApplied` | **[Established]** directly available |
| Methodology version | `GET /api/evidence/:sector` → `evidence.provenance.methodologyVersion` | **[Established]** directly available |
| Replay reference | `GET /api/evidence/:sector` → `evidence.replayReference` | **[Established]** directly available |

### 4.6 Replay verification summary

| Field | Source | Status |
|---|---|---|
| Reproduced | `GET /api/replay/:sector` → `replay.reproduced` | **[Established]** directly available |
| Byte-identical | `GET /api/replay/:sector` → `replay.byteIdentical` | **[Established]** directly available |
| Difference available | `GET /api/replay/:sector` → `differenceAvailable` | **[Established]** always `false`; no field-level diff exists |
| Evidence refs | `GET /api/replay/:sector` → `replay.evidenceRefs[]` | **[Established]** directly available |

**[Established]** The replay verification is a summary only. No field-level diff is displayed or implied. The governed contract explicitly declines to provide one (`replay.note`). A mandatory link to `/research/company/:sector` provides access to the full trust chain.

### 4.7 Position in the governed universe

| Field | Source | Status |
|---|---|---|
| Quality axis | `GET /api/decision-matrix` → `companies[]` matched by sector → `quality` | **[Established]** directly available; **`null` for some sectors** → rendered as "unavailable" |
| Valuation axis | `GET /api/decision-matrix` → `companies[]` matched by sector → `valuation` | **[Established]** directly available; **`null` for some sectors** → rendered as "unavailable" |
| Verdict (from matrix) | `GET /api/decision-matrix` → `companies[]` matched by sector → `verdict` | **[Established]** directly available |
| Composite (from matrix) | `GET /api/decision-matrix` → `companies[]` matched by sector → `composite` | **[Established]** directly available |

**[Established]** The decision matrix response carries a `note` disclaiming any certified quadrant or band. The sector surface must not derive, compute, or display quadrants, bands, or rankings.

### 4.8 Provenance and freshness

| Field | Source | Status |
|---|---|---|
| Data source | Each endpoint's `provenance.dataSource` | **[Established]** directly available |
| Freshness | Each endpoint's `provenance.freshness` — always `"SNAPSHOT"` | **[Established]** |
| Calibrated at | Each endpoint's `provenance.calibratedAt` — always `"2026-08-09T00:00:00.000Z"` | **[Established]** |
| Transport semantics | Each endpoint's `provenance.transportSemantics` | **[Established]** |

**[Proposed]** A provenance footer is displayed on the sector page, following the pattern established by the Company surface and the D89 Macro disclosure precedent. The footer states:

- All data is a frozen SNAPSHOT from the v1.1 Replay Baseline.
- Calibrated at 2026-08-09.
- No live data, time series, or external source is represented.

---

## 5. Data semantics

### 5.1 Frozen snapshot

**[Established]** All sector data is frozen at the v1.1 Replay Baseline (`calibratedAt: "2026-08-09T00:00:00.000Z"`, `freshness: "SNAPSHOT"`). Nothing is live or time-varying.

### 5.2 Provenance

**[Established]** Every endpoint response carries a `provenance` object. The sector surface displays provenance for every section, following the established pattern.

### 5.3 Unavailable values

**[Established]** The following null/missing-value patterns are already implemented on the Company surface and are proposed for reuse on the Sector surface:

| Condition | Behaviour | Precedent |
|---|---|---|
| `confidence` is `null` | Render "unavailable" (never `0`) | `CompanyIntelligence.tsx:51`, `CompanyHeader.tsx` |
| `pillars` is `null` | Render `pillars-unavailable` panel | `CompanyIntelligence.tsx:74-76` |
| `quality` is `null` | Render "unavailable" | `DecisionMatrix.tsx` |
| `valuation` is `null` | Render "unavailable" | `DecisionMatrix.tsx` |
| `resolvedSubsegment` is `null` | Omit sublabel | `CompanyIntelligence.tsx` |
| `resolvedArchetype` is `null` | Omit archetype portion | `CompanyIntelligence.tsx` |

---

## 6. Evidence and replay integration

### 6.1 Evidence chain

**[Proposed]** The sector surface displays an evidence-chain summary section showing the key metrics, supporting scores, decision rules applied, and methodology version from `GET /api/evidence/:sector`. This is a summary, not a replacement for the full evidence surface at `/evidence/:id`.

### 6.2 Replay verification

**[Proposed]** The sector surface displays a replay-verification summary section showing `reproduced`, `byteIdentical`, and `differenceAvailable: false` from `GET /api/replay/:sector`. A link to the full replay at `/evidence/replay/:sector` is provided.

**[Established]** No field-level diff is displayed or implied. The governed replay contract explicitly states that no field-level difference is computed.

### 6.3 Link to Company surface

**[Proposed]** A mandatory link to `/research/company/:sector` is displayed, labelled clearly (e.g., "View full certified result →"). This adopts the orphan spec's S3 ("Sector → Company link is mandatory"), as a reasonable product recommendation.

---

## 7. Navigation

### 7.1 Entry point

**[Proposed]** The sector surface is reached via:
1. The `Sector` nav child under `Research` in the sidebar (currently hidden by `AVAILABLE_CHILD_PATHS`).
2. Direct URL: `/research/sector/:id`.
3. A cross-link from the Company surface or Engine Registry (not currently present; may be added as a future enhancement).

### 7.2 Navigation changes required for implementation

**[Established — sequencing constraint]** To make the `Sector` nav child visible, the following must change in the same implementation:

1. Add `/research/sector/:id` (or the resolved path) to `AVAILABLE_CHILD_PATHS` in `navigation.ts:80-89`.
2. Update `App.test.tsx:118-126` (the test asserting `'Sector'` is not a rendered nav link).
3. Update `App.test.tsx:149-164` (the test asserting every rendered nav href resolves to a built surface).
4. Mount the real `SectorIntelligence` component in `App.tsx:45` instead of `FeaturePlaceholder`.

**[Established]** These changes must be in a single atomic implementation to maintain CV-41's navigation-honesty invariant.

### 7.3 Relationship to other research surfaces

**[Established]** The Sector surface is a sibling of:
- **Company Intelligence** (`/research/company/:id`) — the full trust chain for a single sector reference entity.
- **Cross-Sector Intelligence** (`/research/cross-sector`) — comparisons across sectors.
- **Engine Registry** (`/research/engines`) — the governed engine catalogue.
- **Macro Research** (`/research/macro`) — macro-economic indicators.

**[Proposed]** The Sector surface complements (not duplicates) the Company surface. The Company surface shows the trust chain for a single reference entity. The Sector surface shows the broader sector view: engine identity, universe position, evidence summary, and replay verification, with a link to the Company surface for the full chain.

---

## 8. Out-of-scope features

The following are explicitly **not included** in the initial commissioned scope:

| Feature | Reason |
|---|---|
| Sector constituent companies | No company universe exists; the "company" is a synthetic reference holding |
| Live time-series sector data | All data is frozen SNAPSHOT; no live data source exists |
| Sector news, narrative, or external intelligence | No external data source is commissioned |
| Sector classification beyond 13 canonical names | No GICS/NAICS/NIC taxonomy exists on `main` |
| Sector-level ranking, banding, or quadrant | The decision matrix explicitly disclaims certified quadrants |
| Sector aggregation or derivation | The surface is presentational only; no computation in React |
| Sector-specific AI advisory embedding | Unresolved product choice (see §9) |
| Portfolio sector exposure on the sector page | Already available on `/portfolio`; not in initial scope |
| Cross-sector context on the sector page | Already available on `/research/cross-sector`; unresolved whether to duplicate |
| New API endpoint | Composition from existing endpoints; no new endpoint needed or proposed |
| Route renaming | `/research/company/:id` and `/api/company/:sector` keep their current names |

---

## 9. Unresolved product choices

These are genuine material decisions that cannot be inferred from existing authority:

### 9.1 AI advisory embedding

**[Unresolved]** Should the sector page embed `<AiExplanation sectorKey={sector} />`? The orphan spec (S-series) included it; `main` keeps the advisory on its own route (`/ai-advisory`) under `REG-08` with the `AI EXPLANATION ≠ CERTIFIED RESULT` labelling. Embedding it in the sector page is a product/presentation decision requiring separate authorization.

**Recommendation:** Do not embed in the initial scope. Link to `/ai-advisory/:sector` as an optional adjacent surface.

### 9.2 Cross-sector context on the sector page

**[Unresolved]** Should the sector page include cross-sector signals (ranking, opportunity, correlation flags) from `GET /api/cross-sector`? The orphan spec (S4) excluded it; `CrossSectorIntelligence` already provides it on its own route.

**Recommendation:** Exclude from initial scope. Link to `/research/cross-sector` for cross-sector context.

### 9.3 Sector exposure and weight

**[Unresolved]** Should the sector page show the sector's portfolio exposure/weight from `GET /api/portfolio`? The data exists but the surface is a research view, not a portfolio view.

**Recommendation:** Exclude from initial scope. The information is available on `/portfolio`.

### 9.4 Inbound cross-links from other surfaces

**[Unresolved]** Should the Company surface, Engine Registry, or Cross-Sector surface add links pointing to the Sector surface? Currently, all sector-addressed links point at `/research/company/:sector`.

**Recommendation:** Not in initial scope. Add as a future enhancement after the Sector surface is accepted.

---

## 10. Existing components and contracts for reuse

**[Established]** The following existing components, contracts, and patterns are identified for reuse:

| Reuse | Location | For |
|---|---|---|
| `fetchCompanyData` / `CompanyData` | `frontend/src/api/company.ts` | Sector decision, pillars, overrides, inputs, evidence ref |
| `fetchEvidenceData` / `EvidenceData` | `frontend/src/api/evidence.ts` | Evidence-chain summary |
| `fetchReplayData` / `ReplayData` | `frontend/src/api/replay.ts` | Replay verification summary |
| `fetchDecisionMatrixData` / `MatrixCompany` | `frontend/src/api/decisionMatrix.ts` | Governed sector list + universe position; selector options |
| `fetchEngines` / `EngineListData` | `frontend/src/api/engines.ts` | Engine identity, IES, versions, calibration |
| `CompanyHeader` | `frontend/src/components/company/CompanyHeader.tsx` | Header pattern with null confidence handling |
| `MetricGroup`, `MetricCard`, `DataTable` | `frontend/src/components/data/DataComponents.tsx` | Certified value presentation |
| `DecisionBadge` | `frontend/src/components/decision/DecisionComponents.tsx` | Verdict display |
| `CertifiedBadge`, `FreshnessBadge`, `StatusBadge` | `frontend/src/components/ui/Badges.tsx` | Provenance / freshness / overrides |
| `LoadingState`, `ErrorState`, `UnavailableState` | `frontend/src/components/state/StateComponents.tsx` | Honest loading/error/unavailable states |
| `noAuthFetch` | `frontend/src/core/network/noAuthFetch.ts` | No-auth transport |
| `pillars-unavailable` pattern | `CompanyIntelligence.tsx:74-76` | Null-honest rendering |
| D89 disclosure pattern | `MacroSourceDisclosure.tsx`, `MacroDataModeNotice.tsx` | Precedent for a frozen-data disclosure |
| Test harnesses | `CompanyIntelligence.test.tsx`, `EngineRegistry.test.tsx`, `AiAdvisory.test.tsx` | Component-test template |

---

## 11. Acceptance criteria

### 11.1 Arena-executable tests

The following acceptance criteria can be verified by Arena in the sandbox environment:

| # | Criterion | Test type | Observable behaviour |
|---|---|---|---|
| AC-1 | **Sector selection and navigation reachability** | Component + integration | A user can navigate to `/research/sector/Banking` and see sector content (not `shell-feature-unavailable`). The `Sector` nav child is visible in the sidebar. |
| AC-2 | **Correct distinction between sector-level and company-level research** | Component | The sector page labels data as sector-level. The sector page does not present the synthetic `${sector}-H1` entity as a real company. A link to `/research/company/:sector` is present. |
| AC-3 | **Contract-to-UI field mapping** | Component per section | Every displayed field corresponds to a named source from a certified endpoint response. No field is fabricated, derived, or computed in React. |
| AC-4 | **Correct handling of missing or unavailable data** | Component per null case | `null` confidence renders "unavailable" (never `0`). `null` pillars render the `pillars-unavailable` panel. `null` quality/valuation render "unavailable". |
| AC-5 | **Provenance and frozen-snapshot presentation** | Component | A provenance footer displays freshness (`SNAPSHOT`), calibrated-at date, and data source. The D89 disclosure pattern or equivalent is used. |
| AC-6 | **Evidence and replay integration** | Component | The evidence section shows key metrics, supporting scores, and decision rules. The replay section shows `reproduced`, `byteIdentical`, and `differenceAvailable: false`. No field-level diff is displayed or implied. |
| AC-7 | **Selector options from governed source** | Integration | The sector selector `<select>` has exactly 13 options, sourced from `GET /api/decision-matrix` `companies[].sector`. No hardcoded sector list. |
| AC-8 | **All 13 sectors resolve** | Integration | Navigating to `/research/sector/:id` for each of the 13 canonical sectors returns sector content (not error or placeholder). |
| AC-9 | **Unknown sector fails closed** | Integration | Navigating to `/research/sector/NotASector` returns an honest error state (not fabricated data). |
| AC-10 | **No regression on existing surfaces** | Full suite | The existing 935+ tests continue to pass. CV-41 navigation tests are updated atomically with the sector surface implementation. |
| AC-11 | **Component tests** | Component | `SectorIntelligence.test.tsx` covers: loading, success, error, unavailable; null confidence; null pillars; absent universe row; selector options; navigation on change; provenance footer text. |
| AC-12 | **Server-level E2E** | Transport probe | At a named commit, the composed transport serves all five endpoints for a canonical sector, and the sector page renders from those responses. Raw probe log deposited as evidence. |
| AC-13 | **Typecheck and build** | Infrastructure | `tsc --noEmit` exit 0; `npm run build` exit 0. |

### 11.2 Operator-transferred checks (Arena cannot execute)

The following require the product owner's local environment:

| # | Criterion | Environment |
|---|---|---|
| AC-14 | **Browser rendering** | Real browser (Chromium/Firefox/Safari) on the operator's workstation |
| AC-15 | **Windows-host execution** | Windows environment if applicable |
| AC-16 | **Unassisted reader comprehension** | An independent reader can understand the surface without project history |
| AC-17 | **Responsive layout** | Multiple viewport widths on the operator's display |

These are recorded as **NOT VERIFIED** until operator-transferred evidence is supplied.

---

## 12. Implementation sequencing (proposed)

```
[done]     1. Investigation + evidence record                              → merged
[done]     2. Commission decision + NP-07 reconciliation                   → this PR
[done]     3. Contract proposal + acceptance criteria                      → this PR
[gate]     4. PA review of contract proposal                               → awaiting
           5. Separate implementation authority act                        → after PA review
           6. Implementation (component + route + nav + tests)             → under impl authority
                      — all in ONE change (CV-41 sequencing constraint)
           7. Server-level E2E at a named commit                           → after implementation
           8. Qualification record                                         → after E2E
           9. Acceptance record + tracker row-4 reconciliation             → after qualification
```

Steps 4–9 require separate acts. No implementation occurs under this contract proposal.

---

## 13. Explicit statement of what is and is not authorized

| Statement | Status |
|---|---|
| The Sector Research Surface is commissioned as a product capability | **AUTHORIZED** (by the commission record) |
| The bounded contract described above may be implemented after separate PA review and implementation authority | **PROPOSED** (awaiting review) |
| A specific field, endpoint, or behaviour described above is accepted as a binding requirement | **NOT YET** (requires PA review of this proposal) |
| Implementation may begin | **NOT AUTHORIZED** (requires separate implementation authority act) |
| The sector surface is qualified, accepted, or certified | **NO** |
| The historical NP-07 record has been modified | **NO** (preserved unchanged) |
| The NP-07 exclusion is silently bypassed | **NO** (explicitly reconciled in the commission record) |

---

*Recording agent: Arena Agent Mode — investigation, proposal preparation, and publication only; no independent authority rendered.*

**End of contract proposal `PKG-08-ROW4-CONTRACT-PROPOSAL-01`.**
