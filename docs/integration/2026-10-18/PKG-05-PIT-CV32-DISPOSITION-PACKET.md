# PKG-05 — CV-32 PIT UI/API-only disposition packet

**Status:** prepared for product disposition; not a decision and not implementation authority.
**Date:** 2026-10-18.
**Owner:** IRR product owner for the consuming surface; IPD interface remains unchanged.

## Verified state

- Matrix row 20 and current IRR code establish the read seam `/api/pit/market-data`, bound to the pinned IPD package; it is HTTP/API-only and the identity authority is explicitly `NON_AUTHORITATIVE`.
- Current CV-32 record says the PIT seam answers correctly, `src/api/pit.ts` exists, but no feature consumes it. Row 21 is `NI`/`AP`/`NW` and `NOT SATISFIED`.
- Existing UI/API work and tests do not constitute a mounted product screen. Do not combine CV-32 with CV-22 universe widening or the portfolio decision.

## Separate disposition alternatives

1. **Mount a bounded PIT panel** on an identified company view. Define a single screen, exactly which read-only fields are shown, non-authoritative identity/freshness presentation, and one test that exercises the mounted path through the client/API boundary.
2. **Record API-only** for the current product scope. Preserve the API and its tests; no UI work is commissioned.

The decision owner must select or expressly defer; this packet does not choose. If option 1 is selected, implementation requires its own bounded authorization and closure evidence: mounted screen plus a test covering actual route consumption and honest identity semantics. If option 2 is selected, record the explicit API-only disposition and close CV-32 by documentation. No IPD source change, universe widening, or Group 1/2 act is implied.
