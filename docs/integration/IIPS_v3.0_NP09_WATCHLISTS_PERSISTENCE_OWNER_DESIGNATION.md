# IIPS v3.0 — NP-09 Watchlists Persistence Owner Designation

## Watchlists Persistence Owner Designation Decision

**Program:** IIPS Engineering Standards — Program v3.0  
**Workstream:** NP-09 — Watchlists  
**Decision identifier:** NP-09-AUTH-01 — Watchlists Persistence Owner Designation  
**Document type:** AUTHORITY DECISION — Governance designation record only (not implementation, certification, release, or production authority)  
**Version:** 1.0 — Decision  
**Date:** 2026-09-30  
**Branch:** `arena/01a0f351-iips-review-recovered` (branched from `main@bfe85a7ecaf690f4ff00f2878714eb594a3536b8`)  
**IRR authority baseline:** `ramkivs/iips-review-recovered` `main@bfe85a7ecaf690f4ff00f2878714eb594a3536b8`  
**IPD reference baseline:** `ramkivs/iips-production-market-data` `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c`  
**Status:** **ACCEPTED — PROGRAM AUTHORITY DESIGNATION RECORDED**  
**Authority:** Ramki / Program Authority — human architectural decision  
**Implementation boundary:** This decision establishes repository persistence ownership and governance direction only. It does **NOT** grant implementation authority, production authority, certification authority, or release authority.

---

## 1. Authoritative Designation

Program Authority designates the repository and architectural boundary for the Watchlists capability:

> **WATCHLISTS PERSISTENCE OWNER = IRR SERVER TIER**

* **Capability:** Watchlists
* **Product surface:** UI07 / `/watchlists`
* **Persistence governance:** Gate-P
* **Persistence class:** Class C (Append-Only Filesystem Event Journal)
* **Persistence owner:** IRR Server Tier
* **Designated repository:** `ramkivs/iips-review-recovered`
* **Designated persistence boundary:** `frontend/server/watchlists/`
* **Storage technology model:** Established Gate-P Class C append-only filesystem event journal authority (`journal.ndjson`, version header `journalFormatVersion: 1`, restart-durable, server-derived tenant+owner scoping)
* **IPD role:** Read-only reference context only; no Watchlists mutation, no API changes, no schema changes, no Watchlists persistence implementation

The Watchlists product surface, its server/API transport, and its persistence service are formally owned by the IRR repository/server tier (`ramkivs/iips-review-recovered`) for the purposes of future authorized non-production implementation.

---

## 2. Repository Boundaries Established

### 2.1 IRR — `ramkivs/iips-review-recovered`
IRR is the designated future implementation owner for:
* Watchlists product surface (UI07, route `/watchlists`);
* Watchlists server/API transport endpoints (`GET /api/watchlists`, `POST /api/watchlists`, `DELETE /api/watchlists/:id`, `POST /api/watchlists/:id/items`, `DELETE /api/watchlists/:id/items/:secId`);
* Watchlists persistence service (`frontend/server/watchlists/watchlists-service.ts`);
* Watchlists Class C persistence integration (`frontend/server/persistence/persistence-service.ts`);
* Watchlists lifecycle and append-only event folding behavior (`list-created`, `item-added`, `item-removed`, `list-deleted`);
* Watchlists unit, integration, and UI test suites and qualification evidence.

### 2.2 IPD — `ramkivs/iips-production-market-data`
For the Watchlists workstream:
* **READ ONLY / REFERENCE CONTEXT ONLY;**
* **NO** Watchlists implementation;
* **NO** Watchlists persistence implementation;
* **NO** API changes;
* **NO** schema changes;
* **NO** service changes;
* **NO** deletion or restoration of historical donor Watchlists code;
* **NO** commits;
* **NO** pushes.

The prior IPD G-2 portfolio-persistence assignment (`IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`) remains completely unchanged. This designation does **not** amend G-2 except insofar as it records that Watchlists persistence ownership is now explicitly assigned to the IRR server tier, outside the previously excluded G-2 portfolio scope.

---

## 3. Preservation of Standing Governance Baselines

This designation preserves and confirms the following standing governance baselines:

1. **Watchlists Product Contract (UI07):**
   * Top-level route `/watchlists`;
   * Strictly governed canonical security membership (`canonicalSecurityId` from SecurityMaster);
   * Baseline-vs-current delta tracking (observed snapshot baseline vs. current snapshot; zero time-series fabrication; over frozen baseline, delta is legitimately 0);
   * Deterministic trigger evaluation (`gt`, `gte`, `lt`, `lte`, `eq`, `changed`) over governed metrics, failing closed (`fired: null`, "not evaluated") if data is unavailable;
   * Direct navigation into Company Research (`/research/company/:id`);
   * User-owned, tenant-scoped, private by default (no multi-user sharing in initial scope).
2. **Gate-P Persistence Governance:**
   * Class C append-only filesystem event journal (`journal.ndjson`);
   * Whole-journal version header `{ journalFormatVersion: 1 }` on the first line;
   * Server-derived `tenantId` and `userId` directly from the authenticated principal context (`EnterpriseRuntime.Principal` / `SecuredExecutor`);
   * Restart durability surviving browser reloads and server restarts;
   * Quarantined fail-closed handling on malformed lines or unsupported versions;
   * Strict prohibition of PIT reuse for user watchlists.
3. **D115 Identity Alignment:**
   * No client-asserted `tenantId` or `userId` in request bodies or query params;
   * Non-production execution operates under the established G3 development session boundary (`minRole: 'viewer'` for read, `analyst` for mutation);
   * No live OIDC or production Keycloak claims.
4. **Protected Foundations:**
   * RR ↔ IPD non-production integration foundation remains closed;
   * PIT / IU-7 remains strictly market-data snapshot infrastructure;
   * IU-8 engine integration and certified 10-engine LTS baseline remain protected;
   * Certified reference portfolio (`/api/portfolio`) remains unchanged.

---

## 4. Implementation Authority Boundary

**NO IMPLEMENTATION AUTHORITY IS GRANTED BY THIS DECISION.**

This designation establishes repository ownership and governance boundaries only. It does **not** constitute authorization to:
* create or modify Watchlists source files;
* implement persistence schemas or create journal files;
* modify APIs, routes, navigation, or UI components;
* execute migrations;
* modify IPD;
* deploy or activate production services.

Implementation authority must be granted by a **separate subsequent implementation gate**.

---

## 5. Recording and Mutation Boundary

This governance action records only the accepted NP-09 authority designation in the existing IRR `docs/integration/` authority-decision location, following the additive precedents established by `IIPS_v3.0_OPENING_AUTHORITY_DECISION.md` and `IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`.

The only authorized repository mutation for this recording action is the addition of:
`docs/integration/IIPS_v3.0_NP09_WATCHLISTS_PERSISTENCE_OWNER_DESIGNATION.md`

No application/product implementation, IPD content, protected certification/history record, PIT artifact, production artifact, or unrelated worktree content is part of this decision record.

---

## 6. Authority Sign-Off

> **NP-09 Watchlists Persistence Owner Designation: ACCEPTED**
>
> Program Authority designates the **IRR Server Tier** (`ramkivs/iips-review-recovered`, boundary `frontend/server/watchlists/`) as the authoritative persistence owner for the Watchlists capability under Gate-P Class C append-only filesystem event journal governance; preserves IPD as read-only reference context without Watchlists mutation; preserves G-2 portfolio persistence unchanged; preserves PIT, certified engines, reference portfolio, and G3 boundaries unchanged; and grants governance designation only, not implementation authority.

**Authority:** Ramki / Program Authority — human architectural decision  
**Decision:** **ACCEPTED**  
**Designated Owner:** **IRR Server Tier** (`frontend/server/watchlists/`)  
**Date:** 2026-09-30  
**Recording baseline:** IRR `arena/01a0f351-iips-review-recovered` (branched from `main@bfe85a7ecaf690f4ff00f2878714eb594a3536b8`); IPD `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c`
