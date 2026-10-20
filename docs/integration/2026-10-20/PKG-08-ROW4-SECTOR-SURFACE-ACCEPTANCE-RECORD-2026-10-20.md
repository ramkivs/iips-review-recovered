# PKG-08 — Row 4 Sector Research Surface: Acceptance Record

**Record ID:** `PKG-08-ROW4-ACCEPT-01`
**Date:** 2026-10-20 (UTC)
**Commission:** `PKG-08-ROW4-COMMISSION-01`
**Contract proposal:** `PKG-08-ROW4-CONTRACT-PROPOSAL-01`
**PA approval:** `PKG-08-ROW4-CONTRACT-PROPOSAL-APPROVAL-01`
**Implementation authority:** `PKG-08-ROW4-IMPL-AUTH-01`
**Qualification:** `PKG-08-ROW4-QUAL-01`
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Session branch:** `arena/759192ef-iips-review-recovered`
**Decision-maker:** Program Authority (PA) — Ramki (Ramakrishnan)
**Recording agent:** Arena Agent Mode — evidence execution and record preparation only
**Status:** **ACCEPTED — NON-PRODUCTION / IRR (operator-transferred checks outstanding)**

> ### **PKG-08 ROW 4 — ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**
>
> **Scope:** The Sector Research Surface at `/research/sector/:id` only.
>
> **This acceptance does not constitute certification, production readiness, or production release.**

---

## 1. Acceptance decision

The Sector Research Surface, as qualified by `PKG-08-ROW4-QUAL-01`, is **ACCEPTED INTO THE ACTIVE NON-PRODUCTION IRR FEATURE BASELINE** by Program Authority decision on **2026-10-20**.

The acceptance is based on:
- Completed qualification (`PKG-08-ROW4-QUAL-01`)
- Implementation on the session branch (`arena/759192ef-iips-review-recovered`)
- 947/947 tests passing (12 new sector + 935 pre-existing regression)
- Typecheck pass, build pass
- Server-level E2E verification of all 5 composed endpoints
- NP-07 historical exclusion reconciled (not bypassed) by `PKG-08-ROW4-COMMISSION-01`

## 2. Accepted scope

The accepted Sector Research Surface provides:

1. **Sector selection and navigation** — 13 canonical sectors reachable via sidebar nav and in-page selector
2. **Sector-level research** — engine identity, certified decision, pillars, frozen inputs, universe position, evidence chain, replay verification
3. **Honest sector semantics** — data labelled as sector-level; `${sector}-H1` synthetic entity not presented as a real company
4. **Mandatory Company link** — link to `/research/company/:sector` for the full trust chain
5. **Provenance and freshness** — SNAPSHOT disclosure, calibrated-at date, frozen-baseline statement
6. **Unavailable-value honesty** — null confidence/pillars/quality/valuation → "unavailable" (never 0)
7. **Error handling** — honest error state for fetch failures and unknown sectors

## 3. Acceptance criteria disposition

| # | Criterion | Result | Evidence |
|---|---|---|---|
| AC-1 | Sector selection and navigation reachability | **PASS** | Sector nav child visible; `/research/sector/Banking` renders sector content (not placeholder); `App.test.tsx` passes |
| AC-2 | Correct distinction between sector-level and company-level research | **PASS** | Header says "Banking — Sector Research"; `data-testid="sector-intelligence"` present; mandatory link to `/research/company/Banking` |
| AC-3 | Contract-to-UI field mapping | **PASS** | Every displayed field traced to a named certified endpoint; no fabrication |
| AC-4 | Correct handling of missing or unavailable data | **PASS** | Null confidence → "Confidence unavailable"; null pillars → `pillars-unavailable`; null quality/valuation → "unavailable" |
| AC-5 | Provenance and frozen-snapshot presentation | **PASS** | `data-testid="sector-provenance"` with SNAPSHOT freshness, calibrated-at date, frozen-baseline disclosure |
| AC-6 | Evidence and replay integration | **PASS** | Evidence chain with key metrics, supporting scores, decision rules; replay summary with reproduced/byteIdentical/differenceAvailable:false |
| AC-7 | Selector options from governed source | **PASS** | Options sourced from `/api/decision-matrix`; no hardcoded sector list |
| AC-8 | All 13 sectors resolve | **PASS** | Server E2E confirms all 13 sectors served; component test verifies selector navigation |
| AC-9 | Unknown sector fails closed | **PASS** | `GET /api/company/NotASector` → 404; component renders error state |
| AC-10 | No regression on existing surfaces | **PASS** | 947 tests pass (935 pre-existing + 12 new); 0 failures |
| AC-11 | Component tests | **PASS** | 12/12 sector tests: loading, success, pillars, null confidence, universe position, evidence, replay, selector, company link, provenance, error, unknown sector |
| AC-12 | Server-level E2E | **PASS** | All 5 endpoints verified at named commit; Banking served correctly; unknown sector fails closed |
| AC-13 | Typecheck and build | **PASS** | `tsc --noEmit` exit 0; `npm run build` exit 0 |
| AC-14 | Browser rendering | **NOT VERIFIED** | Requires product owner's browser |
| AC-15 | Windows-host execution | **NOT VERIFIED** | Requires product owner's Windows environment |
| AC-16 | Unassisted reader comprehension | **NOT VERIFIED** | Requires independent reader |
| AC-17 | Responsive layout | **NOT VERIFIED** | Requires product owner's display |

## 4. NP-07 reconciliation confirmation

The NP-07 exclusion of Sector Intelligence (`NP-07-ACCEPT-01` §6) is **reconciled, not bypassed**:

- NP-07's historical record is preserved unchanged
- NP-07's accepted scope (Company + Cross-Sector + Engine Registry) is unchanged
- The new commission (`PKG-08-ROW4-COMMISSION-01`) is a separate, subsequent authorization
- The NP-07 exclusion remains applicable outside the newly commissioned scope

## 5. Known limitations

1. **Non-production.** The accepted capability is non-production.
2. **Operator-transferred checks outstanding.** AC-14 through AC-17 require the product owner's local environment.
3. **No certification.** This acceptance does not constitute certification.
4. **No production readiness.** Production deployment is not authorized.
5. **No IPD dependency.** No IPD files are changed or admitted.
6. **Unresolved product choices.** AI advisory embedding, cross-sector context, portfolio exposure, and inbound cross-links remain unresolved (excluded from initial scope per the approved contract).

## 6. Publication

| Field | Value |
|---|---|
| Session branch | `arena/759192ef-iips-review-recovered` |
| Base | `0231e162717c9c7bf8b14b304307231fa5c84a5e` (`main`) |
| Publication | PR to `main`; remote verification after merge |

## 7. Boundary statements

> This acceptance does not constitute certification, production readiness, or production release.

> The NP-07 historical exclusion is reconciled, not rewritten. NP-07's accepted scope is unchanged.

> Operator-transferred browser/Windows/responsive/unassisted-reader checks remain outstanding and are not claimed as passed.

---

*Recording agent: Arena Agent Mode — evidence execution and record preparation only. Acceptance decision: Program Authority — Ramki, 2026-10-20.*

**End of acceptance record `PKG-08-ROW4-ACCEPT-01`.**
