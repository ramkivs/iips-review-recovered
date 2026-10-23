# PKG-08 — Row 4 Contract Proposal PA Approval

**Record ID:** `PKG-08-ROW4-CONTRACT-PROPOSAL-APPROVAL-01`
**Date:** 2026-10-20 (UTC)
**Governance parent:** `PKG-08-ROW4-COMMISSION-01`
**Approved proposal:** `PKG-08-ROW4-CONTRACT-PROPOSAL-01`
**Decision-maker:** Program Authority (PA) — Ramki (Ramakrishnan)
**Recording agent:** Arena Agent Mode — recording only; no independent authority rendered
**Status:** **APPROVED**

---

## 1. Decision

The Program Authority has reviewed and **APPROVED** the bounded contract proposal for the Sector Research Surface (`PKG-08-ROW4-CONTRACT-PROPOSAL-01`).

The proposal is sound, consistent with the commission, and correctly bounded. Every field is mapped to an existing governed endpoint. No new API, DTO, or schema is required. The composition approach preserves the existing governed contract and reuses five existing typed clients.

## 2. Approved scope

The approved scope is exactly as proposed in `PKG-08-ROW4-CONTRACT-PROPOSAL-01`:

### 2.1 Included

- **Route:** `/research/sector/:id` where `:id` is a canonical sector name (case-insensitive)
- **Sector selector:** `<select>` sourced from `GET /api/decision-matrix` `companies[].sector` (13 canonical sectors)
- **Displayed information:**
  - Sector identity and engine information (from `GET /api/engines`)
  - Certified decision: verdict, composite, confidence, overrides, subsegment, archetype (from `GET /api/company/:sector`)
  - Certified pillars (from `GET /api/company/:sector`; `null` → "unavailable")
  - Frozen input metrics (from `GET /api/company/:sector`)
  - Evidence chain summary (from `GET /api/evidence/:sector`)
  - Replay verification summary (from `GET /api/replay/:sector`)
  - Position in governed universe: quality, valuation (from `GET /api/decision-matrix`; `null` → "unavailable")
  - Provenance and freshness (from all endpoints' `provenance`)
- **Navigation:**
  - Sector nav child visible in sidebar
  - Mandatory link to `/research/company/:sector` for full trust chain
- **Unavailable-value semantics:** Follow existing Company surface pattern (`null` → "unavailable", never `0`)
- **Tests:** Component tests, integration tests, full regression suite must pass

### 2.2 Excluded (as proposed)

- AI advisory embedding (unresolved product choice §9.1)
- Cross-sector context on sector page (unresolved product choice §9.2)
- Portfolio sector exposure on sector page (unresolved product choice §9.3)
- Inbound cross-links from other surfaces (unresolved product choice §9.4)
- Sector constituent companies, live time series, external intelligence, taxonomy expansion, ranking/banding/quadrant, aggregation/derivation
- New API endpoints (composition only)
- Route renaming (`/research/company/:id` and `/api/company/:sector` unchanged)

## 3. Verified against current repository state

The proposal was verified against the current authoritative repository state:

- All five endpoints exist and are sector-addressable (investigation E16–E24)
- All five typed clients exist and use correct parameter names (`sector: string`)
- All existing components are reusable (CompanyHeader, MetricGroup, MetricCard, DataTable, DecisionBadge, CertifiedBadge, FreshnessBadge, StatusBadge, LoadingState, ErrorState, UnavailableState, EvidenceCard)
- Navigation structure supports adding Sector to `AVAILABLE_CHILD_PATHS`
- CV-41 sequencing constraint understood: nav visibility, route mount, and tests must change atomically

## 4. No material inconsistencies identified

The proposal is internally consistent and consistent with:
- The commission decision (`PKG-08-ROW4-COMMISSION-01`)
- The investigation report and evidence record
- NP-07 qualification and acceptance records (exclusion reconciled, not bypassed)
- Existing governed contracts and component patterns
- CV-41 navigation-honesty invariant

## 5. Approval effect

This approval authorizes proceeding to the next stage: recording a separate implementation-authority act and then implementing the approved scope.

This approval does **not** by itself grant implementation authority. A separate implementation-authority act must be recorded before code changes occur.

---

*Recording agent: Arena Agent Mode — recording only; no independent authority rendered.*

**End of PA approval `PKG-08-ROW4-CONTRACT-PROPOSAL-APPROVAL-01`.**
