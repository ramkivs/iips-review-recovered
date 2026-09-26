# NP-18 — INTELLIGENCE EXPOSURE / DERIVATION IMPLEMENTATION AUTHORITY

- **Record ID:** `AUTH-NP-18-INTELLIGENCE-EXPOSURE-IMPLEMENTATION-AUTHORITY-2026-09-26`
- **Title:** NP-18 (PAY-02, Intelligence) — Authority act granting a bounded implementation authority for three composition-only Intelligence surfaces over the existing certified `CrossSectorData` / `PipelineResult` path
- **Class:** `GOVERNANCE` / `IMPLEMENTATION AUTHORITY ACT`
- **Status:** `ISSUED — IMPLEMENTATION AUTHORIZED WITHIN THE BOUNDARY OF §6/§7. THIS ACT DOES NOT ITSELF CERTIFY OR QUALIFY THE IMPLEMENTATION. NP-18 REMAINS OPEN / COMMISSIONING. NO IMPLEMENTATION PERFORMED IN THIS GATE.`
- **Date/time:** 2026-09-26T18:09:38Z (UTC)
- **Grantor:** RAMKI. **Recording agent:** Arena session agent (no discretion exercised; every selection below is RAMKI's, recorded verbatim).
- **Recording branch:** `arena/01a0ddea-iips-review-recovered` **ONLY** (D-6 = A). The authoritative governance branch `arena/01a03e3b-iips-review-recovered` is **NOT moved** by this act and remains at `3c7568e0437f2a5e7b385833ed0752990286ad87`.
- **Governance baseline (this act's parent):** `b8afaeae2daa7a33bc1c8061d04de6b580c77029` — the durable decision-boundary record commit, whose own parent is `3c7568e0437f2a5e7b385833ed0752990286ad87`.
- **Product baseline actually re-verified in this gate:** `origin/phase13-next` @ **`1a602d849cc47331d4f61cc366ed0a343f80e287`**. Re-verified by `git ls-remote` and by an isolated scratch checkout, and every source line anchor in §5/§6/§8 was re-derived at this SHA in this gate. **UNCHANGED** since the preparation gate. Any future execution gate MUST re-verify this baseline before relying on any line anchor below; if `phase13-next` has advanced, the anchors are stale and must be re-derived.
- **Supersession / revision relationship:** none. New record. Amends no dated record. Does **not** modify the D7 disposition, the D7-TIER3-INDEPENDENCE or D7-TIER3-PARITY corpora, the A1 records, the IVM, D14/D15/D25/D36, or E2E-018.
- **Content SHA-256:** self-inclusion is arithmetically impossible; the authoritative SHA-256 of this act as committed is recorded externally in the commit trail and in the gate report. This file is the authoritative bytes.

---

## 1. Authority context

This act is issued under the gate *"NP-18 IMPLEMENTATION AUTHORITY — FINAL FRAMING DECISION + ATOMIC AUTHORITY RECORD"*. It rests on, and does not restate or amend, the durable decision-boundary record:

`governance/iips/DEC-NP-17-NP-18-PAYLOAD-DECISION-BOUNDARY-2026-09-26.md` — blob `a5a345a71d5bda24a73934c216d299fb715bbaab`, 14,464 bytes, content SHA-256 `bd2f1d4b01adcae245ad17a621219795b962dc207e0146729e612f2a78765e7d`, committed at `b8afaeae…` (parent = baseline `3c7568e0…`, exactly 1 file added). Re-verified present and byte-identical in this gate.

That record's selections remain in force and are the precondition of this act:

| ID | Selection | Effect |
|---|---|---|
| **A-0** | `A-DECLINE` | Company-fundamentals data-source gate **DECLINED**. No external provider authorized. No acquisition path. |
| **B-0** | `B-1` | Intelligence: **exposure / derivation only**. No external intelligence acquisition source. |
| **B-1** | Opportunities `IMPLEMENTED` | From the existing certified slice. |
| **B-2** | Risks `IMPLEMENTED` | **Aggregate `avgRisk` + existing flags ONLY.** |
| **B-3** | Rankings `IMPLEMENTED` | From the existing certified slice. |
| **B-4** | `NO NEW DTO` | Compose over the existing `CrossSectorData` / `PipelineResult` contract. |

`ResearchEvents` **S1 / S10 remain in force and are NOT superseded**. `GP-5` remains **NOT ESTABLISHED**. `GP-6` contract-content authoring remains **NOT AUTHORIZED**. Neither is altered by this act.

## 2. The seven durable decisions (recorded verbatim)

```text
D-1  = A — SAME CERTIFIED SLICES, ALTERNATE FRAMING
D-2  = A — AUTHORIZE TEST AMENDMENT
D-3  = A — FLIP INTELLIGENCE GROUP STATUS TO IMPLEMENTED
D-3b = LEAVE IVM §7 UNCHANGED AS HISTORICAL RECORD
D-4  = B — LEAVE IVM §6.4 UNCHANGED
D-5  = B — ANNOTATE THE TWO MACRO REFERENCES AS UNRECOVERED EXTERNAL ARTIFACT
D-6  = A — SESSION BRANCH ONLY
```

## 3. D-1a — distinct Intelligence framing (recorded verbatim)

```text
D-1a = A — THREE DISTINCT FULL VIEWS
```

| Surface | Authorized framing | Certified source slice |
|---|---|---|
| `/intelligence/opportunities` | **DISCOVERY / ACTION VIEW** — the existing top-N opportunity slice presented as an Intelligence discovery surface, emphasizing opportunity rationale **and stating expressly that it is the top-N subset of the same `RankedOpportunity[]` used by Rankings** | `CrossSectorData.opportunity` (= `pr.opportunity.top`) |
| `/intelligence/risks` | **PORTFOLIO RISK VIEW** — aggregate `avgRisk` plus the existing diversification / correlation flags and concentration sectors | `portfolio.avgRisk`, `diversification.flags`, `correlation.flags`, `correlation.concentrationSectors` |
| `/intelligence/rankings` | **ORDERED COMPARISON VIEW** — the existing ranking slice presented as the ordered comparison surface | `CrossSectorData.ranking` (= `pr.ranking`) |

Each surface renders its own slice in full with distinct framing. All three call the **existing** `fetchCrossSectorData()`. **No new computation. No new data.**

## 4. Cross-cutting resolution carried into this act

| Item | Resolution | Consequence |
|---|---|---|
| **C-1** | **RESOLVED** — `UI03`/`UI04` are **not** governed identifiers (0 occurrences at baseline `3c7568e0…`, 0 on `phase13-next`, 0 on `gai-impl-canonical`; the only occurrence in the repository is inside the decision-boundary record). The three sub-surface route identifiers **already exist**: `ROUTES.intelligenceOpportunities` / `intelligenceRisks` / `intelligenceRankings` at `frontend/src/app/routes.ts:24–26`. | **`routes.ts` requires ZERO modification.** Binding to existing identifiers is not a contract-content mutation. |
| **C-2** | **RESOLVED** — `IIPS-WP-MACRO-03-DECISION.md` does **not exist** on any ref. Exactly 2 references, both code comments, both scoped to the **Macro / MoSPI** workstream: `frontend/src/api/macro.ts:7` and `frontend/src/features/research/MacroContext.tsx:7`. Informational/historical attribution; the operative frozen contract exists independently in code (`macro.ts:18`; `SERIES_POLICY` / `assertValidFilters` in `frontend/server/macro/mospi-source.ts`). **NP-18 does not depend on it.** | **Not a blocker. Handled as D-5, a SEPARATE workstream item (§9).** |
| **C-3** | **RESOLVED** — `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md:152` (§6 *"Known gaps (preserved, not silently fixed)"*, item 4) is a **historical Milestone-N** statement that expressly reserved its own supersession (*"Hardening these is a separate authorization."*). That authorization was granted, implemented as **N+2** (commit `87f8b59dfb55d2b91155e7628777b3280352fd31`, *"feat: enforce governed read authorization"*, 11 files incl. `executive-transport.ts` and `crossSector.ts`) and certified as **N+3** (`docs/v3.0/phase13-hardening/PHASE13_N3_READ_AUTHORIZATION_CERTIFICATION.md`; §10 live acceptance `/api/cross-sector -> HTTP 200`, Result: PASS). **No live conflict.** | **Not a blocker. IVM preserved unchanged (D-4 = B, D-3b = LEAVE).** |

## 5. Verified composition boundary (the path this act authorizes composing over)

Re-derived read-only at `origin/phase13-next` @ `1a602d84…` in this gate:

| # | Layer | Location | Verified content |
|---|---|---|---|
| 1 | Client DTO | `frontend/src/api/crossSector.ts:9–26` | `interface CrossSectorData` — `portfolio{…avgRisk…}`, `diversification{band,flags}`, `ranking[]`, `opportunity[]`, `correlation{flags,concentrationSectors}`, `decisions[]`, `provenance` |
| 2 | Client fetch | `frontend/src/api/crossSector.ts:28–32` | `fetchCrossSectorData()` → `authFetch(\`${baseUrl}/api/cross-sector\`)` |
| 3 | Guard surface map | `frontend/server/executive-transport.ts:579–591` | `readSurfaceFor(url)`; **`:585`** `if (path === '/api/cross-sector') return 'cross-sector';` |
| 4 | Guard enforcement | `frontend/server/executive-transport.ts:820, 830` | `readSurfaceFor(req.url)` → `authorizeRead(req, res, surface)` |
| 5 | Guard call | `frontend/server/executive-transport.ts:606–617` | `authorizeRead(...)` → **`:612`** `admin.guardRead(executor, token, surface)`; 401/403 on denial |
| 6 | Route handler | `frontend/server/executive-transport.ts:842–844` | `computeCertifiedCrossSector()` |
| 7 | Payload builder | `frontend/server/executive-transport.ts:499–531` | 1:1 mapping over `computeCertifiedPlatform()` → `{ engineOutputs, csip: pr }` |
| 8 | Engine | `iips-platform/src/sector-engines/cross-sector/CrossSectorEngine.ts:31, 56` | `CrossSectorEngine` → `PipelineResult` |
| 9 | Types | `iips-platform/src/sector-engines/cross-sector/types.ts` | `RankedOpportunity`; `PortfolioIntelligenceReport.avgRisk` |
| 10 | Opportunity slice | `iips-platform/src/sector-engines/cross-sector/opportunity/OpportunityEngine.ts` | `top` = `ranked.slice(0, n)` + generated rationale |

Certified provenance carried verbatim by the payload (`executive-transport.ts:524–528`): `dataSource: 'certified v2.0 platform (CSIP cross-sector engine) over frozen v1.1 Replay Baseline inputs'` · `freshness: 'SNAPSHOT'` · `calibratedAt: '2026-08-09T00:00:00.000Z'` · `transportSemantics: '1:1 mapping; transport transformation != decision transformation'`.

**Existing composition precedent** — `frontend/src/features/cross-sector/CrossSectorIntelligence.tsx:1–12`: *"using CERTIFIED CSIP outputs ONLY. React performs only presentational operations (sort/filter/group/format). NO ranking/normalization/percentile/opportunity/risk/confidence/comparison/threshold/allocation logic in the frontend."* That surface already renders all three slices at `:103` (`avgRisk`), `:108–138` (ranking), `:167–169` (opportunity), `:173–179` (risk flags). **The three surfaces authorized here reuse the same certified payload; they add presentation, not capability.**

## 6. PERMITTED mutations (exhaustive)

### 6.1 NEW files — exactly 6, all under the existing module `frontend/src/features/intelligence/`

```text
frontend/src/features/intelligence/IntelligenceOpportunities.tsx
frontend/src/features/intelligence/IntelligenceOpportunities.test.tsx
frontend/src/features/intelligence/IntelligenceRisks.tsx
frontend/src/features/intelligence/IntelligenceRisks.test.tsx
frontend/src/features/intelligence/IntelligenceRankings.tsx
frontend/src/features/intelligence/IntelligenceRankings.test.tsx
```

### 6.2 MODIFIED files — exactly 6, with line-scoped authority

| File | Authorized change | Anchors at `1a602d84…` |
|---|---|---|
| `frontend/src/app/App.tsx` | Add 3 lazy imports + 3 `<Route>` entries for `/intelligence/opportunities`, `/intelligence/risks`, `/intelligence/rankings`, inserted **before** the `/intelligence/*` catch-all | before `:66`; pattern per `:25, :64, :65` |
| `frontend/src/app/navigation.ts` | Flip the **three children** `'future'` → `'implemented'`; flip the **Intelligence group** `'partial'` → `'implemented'` (D-3 = A) | children `:85, :86, :87`; group `:82` |
| `frontend/src/features/intelligence/IntelligenceHub.tsx` | Replace the now-false honest-marker block *"Opportunities · Risks · Rankings — future Program v3.0 surfaces (not yet implemented)"* (`data-testid="intelligence-future"`) | `:75–79`; link pattern per `:64–73` |
| `frontend/src/app/navigation.test.ts` | Amend **only** the assertions rendered obsolete by §8.1 | see §8.1 |
| `frontend/src/app/Sidebar.test.tsx` | Amend **only** the assertions rendered obsolete by §8.1 | see §8.1 |
| `frontend/src/features/intelligence/IntelligenceHub.test.tsx` | Amend **only** the assertions rendered obsolete by §8.1 | see §8.1 |

### 6.3 Express constraint on `navigation.ts`

The amendment authority at §6.2 is **limited to lines `:82, :85, :86, :87`**. The following MUST be **preserved unchanged**:

- **`:31`** `export type NavStatus = 'implemented' | 'partial' | 'future';` — **must NOT be narrowed.** The `'future'` member is retained as still-supported.
- **`:121`** `export const NAV_STATUS_LABEL: Record<NavStatus, string>` — **must NOT be altered**; `NAV_STATUS_LABEL.future` is asserted at `navigation.test.ts:32` and the `Record<NavStatus, string>` type would break if the union were narrowed.
- **`:10–11`** the documented semantics of `status` — *"display-only (never a route, permission, or authorization decision)"*.

Note: `:85, :86, :87` are the **only** three `status: 'future'` occurrences in `navigation.ts`. After the authorized flip **no `'future'` navigation child remains**, while the `'future'` machinery is retained as supported-but-unused.

### 6.4 Express constraint on `frontend/src/app/Sidebar.tsx`

`Sidebar.tsx` is **NOT** in the permitted modification set and **MUST NOT be modified**. Its `isFuture` branch (`:58`–`:67`, rendering `<span data-testid="nav-future-{label}">` for `status === 'future'` and `<NavLink to={item.path}>` otherwise) is **retained as valid, still-supported code**. It becomes unreached in practice by the navigation state transition; that is an accepted consequence and is **not** authority to delete or refactor it.

## 7. EXCLUDED mutations (exhaustive, binding)

### 7.1 Files that MUST NOT be modified

```text
frontend/src/app/routes.ts                        — identifiers already exist (:24–26); ZERO change
frontend/src/api/crossSector.ts                   — B-4 NO NEW DTO; ZERO change
frontend/server/executive-transport.ts            — no new endpoint; readSurfaceFor NOT extended; no new guard surface
iips-platform/**                                  — no recomputation; ZERO change
docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md      — D-3b LEAVE §7; D-4 = B LEAVE §6.4; ZERO change
frontend/src/api/macro.ts                         — D-5 is a SEPARATE Macro workstream item (§9)
frontend/src/features/research/MacroContext.tsx   — D-5 is a SEPARATE Macro workstream item (§9)
frontend/src/app/Sidebar.tsx                      — §6.4; ZERO change
governance/**                                     — no governance record amended by implementation
```

### 7.2 Capabilities that are NOT authorized

- **No new DTO.** No `IntelligenceDTO`. No `FundamentalsDTO`. No schema file. No new transport contract.
- **No new endpoint.** `/api/cross-sector` is preserved exactly as-is. No new API route of any kind.
- **No transport modification.** `executive-transport.ts` untouched; `readSurfaceFor` not extended; no new guard surface registered.
- **No `iips-platform` modification.** No engine, calibration, decision, evidence, metrics, scoring or frozen-asset change.
- **No recomputation. No fabrication.** No bands, quadrants, thresholds, percentiles, normalizations, scores, ratings, ranks or classifications computed in transport or React.
- **No persistence** of any kind.
- **No hosting, no credentials, no provider activation.** The dormant `MarketDataSource` / `DataBoundExecutor` surfaces **remain dormant**.
- **No external provider.** No company-fundamentals acquisition (A-0 = `A-DECLINE`). No external intelligence acquisition (B-0 = `B-1`).
- **No synthetic fixtures. No synthetic payloads.** Frozen fixtures remain fixtures and must stay labelled.
- **No new navigation identifier.** No change to `routes.ts`.
- **No `LIVE` freshness claim.** Provenance remains `SNAPSHOT`.
- **No movement of `arena/01a03e3b-iips-review-recovered`.**
- **No amendment of any dated governance record**, including the D7 corpora, the A1 records, the IVM, D14/D15/D25/D36 and E2E-018.

## 8. Test-amendment authority (D-2 = A) — precisely scoped

Authority is granted to amend **only** assertions genuinely rendered obsolete by the authorized navigation-state transition. The bodies below were **inspected at the re-verified product baseline `1a602d84…` in this gate**, as required.

### 8.1 OBSOLETE — amendment authorized (exactly 6 assertion groups in 3 files)

| # | Location | Assertion as it stands | Why obsolete |
|---|---|---|---|
| 1 | `navigation.test.ts:25` | `expect(byLabel['Intelligence'].status).toBe('partial')` | D-3 = A flips the group to `'implemented'`. **Lines `:24` (Research) and `:26` (Evidence) remain VALID and MUST be preserved.** The test title at `:23` also becomes inaccurate and may be adjusted accordingly. |
| 2 | `navigation.test.ts:71–77` | `statusOf('Intelligence','Opportunities'\|'Risks'\|'Rankings')).toBe('future')` ×3 | All three children flip to `'implemented'`. No `'future'` child remains, so this test has no subject. |
| 3 | `Sidebar.test.tsx:44–48` | `nav-status-Opportunities` / `nav-status-Risks` `toHaveTextContent('Future')` | Per `Sidebar.tsx:58`, `isFuture` becomes false; no Future badge is rendered. No `'future'` child remains, so this test has no subject. |
| 4 | `Sidebar.test.tsx:61–69` | `nav-future-{Opportunities,Risks,Rankings}` present **and** `queryByRole('link', {name:'Opportunities'\|'Risks'\|'Rankings'})` absent | Per `Sidebar.tsx:61–78` the three now render as `<NavLink>`; the non-navigable-text invariant is inverted by design. |
| 5 | `IntelligenceHub.test.tsx:141–149` | `intelligence-future` has text `'Opportunities · Risks · Rankings'` **and** three `queryByRole('link', …)` absent | §6.2 requires replacing the `:75–79` block; the surfaces are no longer future and may be linked. |
| 6 | `IntelligenceHub.test.tsx:172–182` | `/intelligence/opportunities` renders `shell-not-authorized` (placeholder) | §6.2 registers a real `<Route>` before the `App.tsx:66` catch-all, so the path no longer resolves to the placeholder. |

### 8.2 REMAIN VALID — amendment **PROHIBITED**

| Location | Assertion | Status after transition |
|---|---|---|
| **`navigation.test.ts:100`** (test `:92–105`) | `navigable = walk(NAV).filter(n => n.status !== 'future')`, then `expect(n.path).not.toContain(':id')` | **STILL VALID — MUST NOT BE MODIFIED.** The filter's subject set grows, but the three new navigable paths (`/intelligence/opportunities`, `/intelligence/risks`, `/intelligence/rankings`) contain **no** `:id`. The assertion holds unchanged. |
| `navigation.test.ts:24, :26` | Research `'partial'`; Evidence `'partial'` | **STILL VALID** — unaffected by D-3. |
| `navigation.test.ts:29–33` | `NAV_STATUS_LABEL.{implemented,partial,future}` | **STILL VALID** — the label map is unchanged (§6.3). |
| `navigation.test.ts:79–90` | N+16 Holdings / N+17 Evidence Replay removals | **STILL VALID** — unaffected. |
| `Sidebar.test.tsx:50–53, :55–59, :71–76` | Holdings absent; Decision Evidence link; Replay absent | **STILL VALID** — unaffected. |
| `Sidebar.test.tsx:78+` | no rendered navigation link contains `:id` | **STILL VALID** — the three new links contain no `:id`. |
| `IntelligenceHub.test.tsx:159–170` | `/intelligence` renders `IntelligenceHub`, not `FeaturePlaceholder` | **STILL VALID** — unaffected. |

**No gratuitous amendment is authorized.** Any change beyond §8.1 is outside this act.

## 9. D-5 — SEPARATE Macro workstream item (expressly NOT part of NP-18)

D-5 = **B — ANNOTATE THE TWO REFERENCES AS UNRECOVERED EXTERNAL ARTIFACT.**

Scope: annotate `frontend/src/api/macro.ts:7` and `frontend/src/features/research/MacroContext.tsx:7` as citing `IIPS-WP-MACRO-03-DECISION.md`, an **unrecovered external artifact** absent from every ref. No new document is authored.

**This is recorded as a distinct Macro-workstream item and is NOT authorized by this act.** It must not be bundled into, executed under, or silently absorbed by NP-18 implementation. It requires its own authority act. Both files are listed in §7.1 as **must-not-modify** for NP-18.

**No conflation:** MoSPI is national-statistics (macro) data commissioned under WP-MACRO-02/03. It is **not** company fundamentals and is **unaffected** by A-0 = `A-DECLINE`.

## 10. IVM preservation (D-3b = LEAVE, D-4 = B)

`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` is **preserved unchanged in its entirety**:

- **§6.4 (line 152)** — preserved as historical Milestone-N evidence, consistent with its own section title *"Known gaps (preserved, not silently fixed)"* and its express reservation *"Hardening these is a separate authorization."* **No supersession annotation.**
- **§7 (lines 155–157)** — preserved unchanged as the historical Milestone-N record, notwithstanding that implementing NP-18 makes its statement *"it implements none of them"* historical. **No supersession annotation.**

Implementing NP-18 therefore creates a **known, accepted, documented divergence** between IVM §7 and the navigation state. That divergence is **intentional** under D-3b and is **not** a defect to be silently fixed.

## 11. Mandatory rendering constraints (binding on implementation)

1. **1:1 mapping only.** React performs presentational operations only (sort/filter/group/format), per the `CrossSectorIntelligence.tsx:1–12` precedent.
2. **`null` → `"unavailable"`.** Never `0`. Never a fabricated value.
3. **Provenance carried verbatim** from the payload: `dataSource` as certified, `freshness: 'SNAPSHOT'`, `calibratedAt: '2026-08-09T00:00:00.000Z'`, `transportSemantics` as certified. **No `LIVE` claim over frozen Replay-Baseline inputs.**
4. **K-2 — Opportunity/Ranking identity constraint (binding).** `/intelligence/opportunities` **must state expressly** that it renders the **top-N slice of the same `RankedOpportunity[]`** as `/intelligence/rankings` (`opportunity` = `pr.opportunity.top`, and `top` = `ranked.slice(0, n)`; both map to the identical shape `{ companyId, sector, conviction }`). Opportunities and Rankings **remain slices of the same certified data** and **MUST NOT** be presented as two independent datasets.
5. **K-3 — Aggregate-risk-only constraint (binding).** `/intelligence/risks` renders **only** aggregate `portfolio.avgRisk` plus the existing `diversification.flags`, `correlation.flags` and `correlation.concentrationSectors` (and allocation `rulesApplied` where already certified). **No per-company risk. No per-sector risk. No fabricated or newly computed risk object.** No certified per-company or per-sector risk object exists in the platform; anything further is fabrication and is prohibited.
6. **K-4 — `PipelineResult` slice constraint (binding).** The slice inventory is limited to what `PipelineResult` actually produces (`intelligence`, `ranking`, `opportunity`, `allocation`, `diversification`, `correlation`, `evidence`, `reports`). Nothing may be added.
7. **D-1 = A framing honesty constraint (binding).** Alternate framing **must not be represented as new data or as new intelligence capability.** Each surface must make its relationship to the existing `/research/cross-sector` rendering explicit, so that distinct presentation is not mistaken for distinct data.
8. **No hardcoded sectors. No derived values. No interpretation or recommendations** beyond what the certified payload already carries.

## 12. Express statements required by the granting gate

- **NP-18 remains `OPEN / COMMISSIONING`** until implementation **and** qualification are subsequently completed. This act does not change that state.
- **This act authorizes implementation; it does NOT itself certify or qualify the implementation.** Passing tests, a component existing, a route resolving, or a nav status flipping do **not** constitute qualification. Qualification requires a separate, subsequent evidence and adjudication path.
- **NP-17 remains `OPEN / COMMISSIONING`**, its acquisition limb **CLOSED BY DECLINATION** (A-0 = `A-DECLINE`). NP-17 **is not** authorized, reopened or advanced by this act. Reopening requires a fresh authority act.
- **D-1/A alternate framing must not be represented as new data or new intelligence capability.**
- **Opportunities and Rankings remain slices of the same certified data.**
- **Risks remain aggregate `avgRisk` + existing flags only.**
- **`null` → `"unavailable"`.**
- **Provenance remains `SNAPSHOT`; no `LIVE` claim.**
- **No new DTO. No new endpoint. No persistence. No synthetic fixtures. No provider.**
- **No implementation was performed in this gate.** No component, route, navigation, test, DTO, endpoint, transport, platform or fixture was created or modified by the creation of this act.

## 13. Execution conditions for any future implementation gate

1. **Re-verify the product baseline** by `git ls-remote` before relying on any line anchor in this act. If `origin/phase13-next` has advanced beyond `1a602d849cc47331d4f61cc366ed0a343f80e287`, **all anchors in §5, §6, §8 are stale and must be re-derived** before execution.
2. **Re-align the session checkout** to the session remote tip and verify the worktree is clean before any edit. This environment has re-cloned the governed checkout **three times** between turns; a repair performed in one turn does not survive into the next. Repair and execution must be atomic within a single turn.
3. **Verify durability with `git ls-remote`, never with local remote-tracking refs.** This repository is cloned with a **single-branch refspec** (`remote.origin.fetch = +refs/heads/main:refs/remotes/origin/main`), so `git push` does **not** refresh tracking refs and `--not --remotes` checks give false negatives.
4. **Verify `arena/01a03e3b-iips-review-recovered` remains exactly `3c7568e0437f2a5e7b385833ed0752990286ad87`** before and after execution.
5. **Amend only §8.1.** Re-inspect the assertion bodies before amending; do not modify anything in §8.2.
6. **Fail closed.** If any invariant fails, throw and stop; do not claim completion.

---

*End of authority act. This act authorizes a bounded implementation. It certifies nothing and qualifies nothing.*
