# PKG-08 — Matrix Row 4 Commission and NP-07 Governance Reconciliation

**Record ID:** `PKG-08-ROW4-COMMISSION-01`
**Date:** 2026-10-20 (UTC)
**Matrix row:** 4 — Research — sector surface (IRR)
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Authoritative ref:** `refs/heads/main` @ `0231e162717c9c7bf8b14b304307231fa5c84a5e`
**Session branch:** `arena/759192ef-iips-review-recovered`
**Investigation report:** [`docs/integration/2026-10-20/PKG-08-ROW4-SECTOR-SURFACE-INVESTIGATION-AND-ACCEPTANCE-GAP-2026-10-20.md`](./PKG-08-ROW4-SECTOR-SURFACE-INVESTIGATION-AND-ACCEPTANCE-GAP-2026-10-20.md)
**Evidence record:** [`evidence/integration/sector-surface-row4-2026-10-20/evidence-record.md`](../../../evidence/integration/sector-surface-row4-2026-10-20/evidence-record.md)
**Companion contract proposal:** [`PKG-08-ROW4-SECTOR-RESEARCH-SURFACE-CONTRACT-PROPOSAL-2026-10-20.md`](./PKG-08-ROW4-SECTOR-RESEARCH-SURFACE-CONTRACT-PROPOSAL-2026-10-20.md)
**Status:** **COMMISSIONED — product-scope definition authorized; implementation, qualification and acceptance are separate, later acts.**
**Decision-maker:** Program Authority (PA) — Ramki (Ramakrishnan)
**Recording agent:** Arena Agent Mode — recording and publication only; no independent authority rendered

> **Rendered PA decision — Row 4: B — COMMISSION the Sector Research Surface as an IIPS v3.0 product capability.**
>
> This is the PA's selected disposition. Do not ask the PA to repeat this selection.

---

## 1. Decision

**COMMISSION the Sector Research Surface as an IIPS v3.0 product capability.**

The product owner has explicitly selected disposition **B** from the investigation report's §9.8 sequencing: commission a named sector surface with a bounded route/screen contract.

### 1.1 What the commission establishes

- The Sector Research Surface at `/research/sector/:id` is now a commissioned IIPS v3.0 product capability.
- The commission defines the product scope: a governed, presentational research view answering *"What does the certified platform say about this sector?"*
- The commission authorizes proceeding with the bounded product-definition work described in the companion contract proposal.
- The commission is a product-scope authorization. It does not by itself grant implementation authority, qualification, acceptance, or release eligibility (see §5).

### 1.2 What the commission does not establish

- No specific screen field, API contract, data source, implementation detail, or acceptance criterion is established by this commission alone. Those are defined in the companion contract proposal and require separate review.
- No implementation has occurred under this commission.
- No qualification, acceptance, certification, or production readiness is granted.
- No IPD repository work is authorized.
- No change to any other commissioned surface (Company, Cross-Sector, Engine Registry, Macro) is authorized by this record.

---

## 2. NP-07 Exclusion Reconciliation

### 2.1 The earlier exclusion

**`NP-07-ACCEPT-01` §6** (published 2026-10-13, `docs/integration/IIPS_v3.0_NP07_RESEARCH_ACCEPTANCE_AND_BASELINE_ADMISSION.md`):

> **Sector Intelligence (`/research/sector/:id`) is EXCLUDED and is NOT accepted.**

This exclusion was made because at the time of NP-07 qualification and acceptance (2026-10-04, refreshed 2026-10-13), the sector surface was not implemented, not qualified, and not commissioned. NP-07's accepted scope was exactly three capabilities: Company Intelligence, Cross-Sector Intelligence, and Engine Registry (`Option C-2`). The sector surface was explicitly and correctly excluded.

**`NP-07-QUAL-01`** (same date) independently confirmed the exclusion:

- §1 scope table: Sector Intelligence — `NO` (not in NP-07 scope).
- §7 limitations: "Sector Intelligence is not implemented."
- §7 explicit exclusions: "Sector Intelligence `/research/sector/:id` — excluded."

### 2.2 The new commission and its authority basis

This commission is a **separate, subsequent product-scope authorization** made by the Program Authority under the same standing authority that established NP-07. The authority basis is:

- The Program Authority holds feature-baseline membership jurisdiction (`NP-13-D0-01` §1.3, §2.1, §2.3, §3.9).
- The standing project authorization (`IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2) covers decisions, governance records, and publication within established scope.
- The investigation report (PKG-08 row 4, 2026-10-18 and 2026-10-20) established the factual basis for the commission.
- The tracker explicitly states rows 4/14/16 "require their own product/authority outcomes" (tracker line 2351).

### 2.3 Effect on the earlier exclusion

| Statement | Status |
|---|---|
| NP-07-ACCEPT-01 §6 exclusion wording | **Historical record — preserved unchanged.** The NP-07 record is not rewritten. |
| NP-07's accepted scope (Company + Cross-Sector + Engine Registry) | **Unchanged.** NP-07's acceptance covers exactly what it accepted. The sector surface was not part of it. |
| NP-07-QUAL-01's exclusion of Sector Intelligence | **Historical record — preserved unchanged.** Qualification scope is unchanged. |
| Whether Sector Intelligence is now authorized for future implementation | **Yes — superseded for future scope by this commission.** The commission creates a new, separate authorization path for the Sector Research Surface. |
| Whether the sector surface is now accepted, qualified, or certified | **No.** Commissioning ≠ acceptance. Acceptance, qualification, and certification are separate, later acts. |

### 2.4 Precise reconciliation

The NP-07 exclusion and this commission are not contradictory. They address different questions:

- **NP-07** answered: *"Is the sector surface part of the NP-07 Research acceptance?"* → **No.** This remains true. NP-07's accepted scope has not expanded.
- **This commission** answers: *"Should a Sector Research Surface exist as an IIPS v3.0 product capability?"* → **Yes.**

The earlier exclusion **remains applicable** for NP-07's accepted scope. It does not block a later, separate commission of the sector surface as its own capability, which is exactly what this record does. The NP-07 exclusion is **narrowly superseded** only to the extent that the sector surface is now commissioned as a separate capability with its own authority path. Outside that commissioned scope, the NP-07 exclusion remains applicable.

### 2.5 Preservation of unrelated NP-07 decisions

All NP-07 decisions outside the sector exclusion are unaffected:

- Company Intelligence: accepted (unchanged).
- Cross-Sector Intelligence: accepted (unchanged).
- Engine Registry: accepted (unchanged).
- NP-08 Macro exclusion: unchanged.
- Reports, Portfolios, production integration exclusions: unchanged.
- IPD boundary: unchanged.
- GAP-6 status: unchanged.

### 2.6 Historical record protection

**No historical record is modified by this commission.** Specifically:

- `NP-07-ACCEPT-01` is not edited.
- `NP-07-QUAL-01` is not edited.
- The master tracker's NP-07 rows are not edited.
- The NP-07 blob hashes, coordinates, and scope statements remain accurate as records of what NP-07 accepted.

---

## 3. Commission scope and boundary

### 3.1 Commissioned scope

The Sector Research Surface is commissioned as a **governed, presentational, read-only research view** at route `/research/sector/:id`. It answers the question: *"What does the certified platform say about this sector — its engine, decision, certified pillars, position in the governed universe, and replay verification?"*

The commissioned scope is bounded by the companion contract proposal (`PKG-08-ROW4-SECTOR-RESEARCH-SURFACE-CONTRACT-PROPOSAL-2026-10-20.md`).

### 3.2 Exclusions from this commission

The following are explicitly excluded from this commission:

1. **Live or time-varying sector data.** All sector data is frozen SNAPSHOT (v1.1 Replay Baseline). No live data source is commissioned.
2. **Sector constituent lists.** The "company" is a synthetic `${sector}-H1` reference holding. No real constituent company universe is commissioned.
3. **Sector classification expansion.** The 13 canonical sectors are the complete governed universe. No GICS/NAICS/NIC taxonomy is commissioned.
4. **Sector narrative, news, or external intelligence.** No external data source is commissioned.
5. **New API endpoints.** The commissioned surface composes from existing governed endpoints. No new endpoint is created under this commission (see companion contract proposal §3).
6. **Changes to the NP-07-accepted surfaces.** Company Intelligence, Cross-Sector Intelligence, and Engine Registry are not modified by this commission.
7. **Changes to the Company route naming.** The existing `/research/company/:id` route and `/api/company/:sector` endpoint are not renamed or restructured by this commission. The semantic naming question is addressed as a product recommendation in the companion contract proposal, not as a mandated change.
8. **AI advisory embedding.** Whether the sector page embeds `<AiExplanation>` remains an unresolved product choice (companion contract proposal §4.4).
9. **Cross-sector context on the sector page.** Whether to include cross-sector signals on the sector page remains an unresolved product choice.
10. **IPD repository work.** Out of scope.
11. **Production, deployment, or certification.** Not authorized by this commission.

### 3.3 Relationship to CV-41

CV-41 (completed 2026-10-14) made `Research` and `Intelligence` group-only navigation headings. This commission does not alter CV-41's disposition. If the sector surface is eventually implemented, the `Sector` nav child in `navigation.ts:47` would need to be added to `AVAILABLE_CHILD_PATHS`, which would require updating `App.test.tsx:118-126` and `:149-164` in the same change — a CV-41 sequencing constraint. This is a future implementation concern, not a governance conflict.

---

## 4. Semantic naming recommendation

### 4.1 The core ambiguity

The investigation established that `/api/company/:id` and `/research/company/:id` are in substance **sector-keyed**, not company-specific:

- `computeCertifiedCompany(sectorId)` resolves by sector.
- `companyId` is derived as `${sector}-H1`.
- The typed client names its parameter `sector`: `fetchCompanyData(sector, …)`.
- Cross-sector and engine-registry links point at `/research/company/${sector}`.

This creates a naming collision: the existing "Company" surface is in fact a sector-level view with a synthetic company identity.

### 4.2 Recommended approach

**Commission a distinct Sector Research Surface at `/research/sector/:id` that composes from the existing sector-keyed endpoints under their current names.**

Rationale:

1. **The existing Company surface is an accepted NP-07 capability.** Renaming or repositioning it would alter an accepted surface's route — a governance event beyond this commission's scope.
2. **The Sector surface has a distinct product purpose.** The Company surface answers *"What does the platform say about this sector's certified result, as a single reference entity?"* The Sector surface answers *"What does the platform say about this sector — its engine, decision, pillars, universe position, and replay verification?"* These are overlapping but not identical questions; the Sector surface is broader and adds engine identity, universe position, and evidence/replay integration.
3. **Composition without new endpoints preserves the governed contract.** All sector data is reachable through existing endpoints. No new endpoint is needed.
4. **Honest labelling resolves the naming collision at the presentation layer.** The sector surface should label its data as sector-level data, not as a "company" result. The mandatory link to `/research/company/:sector` (per the orphan spec's S3, adopted here as a proposal) makes the relationship explicit.

This approach treats the naming collision as a **presentation-layer concern** rather than requiring a route/endpoint rename. The contract proposal implements this recommendation.

---

## 5. Authority boundary

### 5.1 What this commission authorizes

| Authority level | Status |
|---|---|
| **Product-scope authorization** | **GRANTED** — the Sector Research Surface is commissioned as a product capability |
| **Contract/schema definition** | **AUTHORIZED FOR PROPOSAL** — the companion contract proposal is submitted for review; final contract decisions require PA review of the proposal |
| **Implementation authority** | **NOT GRANTED** — a separate, bounded implementation authority act is required before code changes |
| **Qualification authority** | **NOT GRANTED** — qualification is a later, separate act |
| **Acceptance authority** | **NOT GRANTED** — acceptance is a later, separate act |
| **Release/production authority** | **NOT GRANTED** — not authorized |

### 5.2 What remains separately gated

1. **Implementation authority act.** Before any code change (component, route, navigation, test), a separate implementation authority decision must be recorded, defining the exact file set, test requirements, scope limits, and acceptance evidence. This follows the precedent established by `CV-53-D89-MACRO-UI-DISCLOSURE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-2026-10-15.md`.
2. **Contract finalization.** The companion contract proposal is a *proposal*. The exact field list, endpoint mapping, missing-value semantics, and navigation behavior require PA review and approval before implementation.
3. **Qualification.** After implementation, a separate qualification record must be prepared (modelled on `NP-07-QUAL-01`).
4. **Acceptance.** After qualification, a separate acceptance record must be prepared (modelled on `NP-07-ACCEPT-01` and `CV-53-D89-MACRO-PRODUCT-ACCEPTANCE-RECORD-2026-10-15.md`).
5. **Browser/Windows/operator acceptance.** Arena cannot perform this; it must be operator-transferred.

### 5.3 No unnecessary approval loop for current work

This commission and the companion contract proposal are governance documentation within the standing authorization for investigation, decision recording, and publication. No additional approval loop is required for these records themselves. The additional act identified above (implementation authority) is required only when code changes are proposed.

---

## 6. Matrix row 4 status

**Row 4 remains `NOT SATISFIED`.**

Commissioning is not acceptance. The acceptance cell will remain `NOT SATISFIED` until:

1. Implementation is completed under a separate implementation authority act.
2. Qualification is recorded.
3. Acceptance is recorded (with operator-transferred browser/Windows evidence where required).
4. The matrix row is reconciled.

This commission changes the row's *trajectory* — the surface is now commissioned rather than uncommissioned — but does not change its acceptance status.

---

## 7. Durable deliverables

| Deliverable | Path | Purpose |
|---|---|---|
| This record | `docs/integration/2026-10-20/PKG-08-ROW4-SECTOR-SURFACE-COMMISSION-AND-GOVERNANCE-RECONCILIATION-2026-10-20.md` | Commission decision and NP-07 reconciliation |
| Contract proposal | `docs/integration/2026-10-20/PKG-08-ROW4-SECTOR-RESEARCH-SURFACE-CONTRACT-PROPOSAL-2026-10-20.md` | Bounded product contract and acceptance criteria |

Both are published on the session branch for review and PR to `main`.

---

## 8. Effectiveness

This decision takes effect when this record is merged to `refs/heads/main` of `ramkivs/iips-review-recovered` and independently verified there.

---

*Recording agent: Arena Agent Mode — recording and publication only; no independent authority rendered. Commission decision: Program Authority — Ramki, 2026-10-20.*

**End of commission record `PKG-08-ROW4-COMMISSION-01`.**
