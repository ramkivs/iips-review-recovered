# IIPS v3.0 — NP-10 Collaboration Governance & Persistence Owner Designation

## Collaboration Product Contract, Scope & Persistence Owner Designation Decision

**Program:** IIPS Engineering Standards — Program v3.0  
**Workstream:** NP-10 — Collaboration  
**Decision Identifier:** NP-10-AUTH-01 — Collaboration Product Contract, Scope & Persistence Owner Designation  
**Document Type:** AUTHORITY DECISION — Governance & Authority Designation Record  
**Version:** 1.0 — Decision  
**Date:** 2026-10-01  
**Repository:** `ramkivs/iips-review-recovered`  
**Branch:** `arena/01a0f351-iips-review-recovered` (descendant of baseline promotion `3b8c3b5`)  
**IRR Authority Baseline:** `ramkivs/iips-review-recovered` (`3b8c3b5`)  
**IPD Reference Baseline:** `ramkivs/iips-production-market-data` `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c` (READ ONLY, 0 mutations)  
**Status:** **ACCEPTED — PROGRAM AUTHORITY DECISION RECORDED**  
**Authority:** Program Authority — Human Architectural Decision  
**Implementation Boundary:** This decision establishes the Product Contract, scope boundaries, closed reference set, and persistence owner designation. It does **NOT** grant implementation authority or authorize production activation. Implementation remains withheld until a separate IRR-bound implementation gate is convened.

---

## 1. Executive Summary & Context

Following the completion of the read-only investigation for workstream NP-10, the investigation established that:
1. Collaboration is currently absent from the active IRR repository (`ramkivs/iips-review-recovered`).
2. Canonical IPD (`ramkivs/iips-production-market-data`) at commit `4d3e1cd` contains only a fail-closed structural placeholder (`CollaborationStructural`, `status: 'unavailable'`).
3. Historical donor code in IPD at commit `42f91fad` implemented an unpromoted recovery (D83) that was subsequently pruned and deferred in canonical convergence planning due to unpromoted external directory and package dependencies.
4. The historical donor is **REFERENCE ONLY** and establishes zero current authority.

To resolve the governance gaps identified in the investigation, Program Authority hereby issues the definitive architectural decisions required to govern Collaboration.

---

## 2. Program Authority Decisions

### Decision 1: Product Contract & Sharing Model

**Disposition:** **OPTION A — PRIVATE THREAD / ANNOTATION MODEL AUTHORIZED**

**Rationale & Rules:**
1. **Model Definition**: Collaboration in the non-production IIPS platform is defined as user-owned research threads and comments attached to governed platform objects.
2. **Privacy by Default**: Threads and comments are private by default, tenant-scoped, and owned strictly by the authenticated principal (`(tenantId, userId)`).
3. **No Unpromoted ACL System**: Cross-user workspace ACLs, multi-user workspace co-ownership, invitations, and permission delegation are explicitly **EXCLUDED**. Those capabilities would require M-5 / G3 cross-user permissions and an external identity directory that does not exist in IRR.
4. **Governed Object Citations**: Collaboration is established by reference inside threads—threads attach to an anchor governed object, and comments may reference additional governed objects from the closed set.

---

### Decision 2: Mentions, Assignments & Tenant Directory Scope

**Disposition:** **EXCLUDED FROM INITIAL NON-PRODUCTION SCOPE**

**Rationale & Rules:**
1. **Directory Dependency Pruning**: The historical donor (`42f91fad`) relied on `server/directory/roster-directory.ts` (an unpromoted Keycloak roster sync module). IRR possesses no such directory subsystem (possessing only `ADMIN_DIRECTORY`, a static test dictionary in `admin-transport.ts`).
2. **Fail-Closed Identity Discipline**: Introducing `@mentions` and user assignments without an authoritative tenant roster sync would force either accepting arbitrary unvalidated strings or fabricating users, violating D115 identity discipline.
3. **Authorized Boundary**: Initial Collaboration scope is strictly limited to threads and comments authored by the authenticated principal referencing governed objects. Cross-user `@mentions` and assignments are excluded until a platform-wide Tenant Member Directory authority is separately established.

---

### Decision 3: Closed Governed Object Reference Set

**Disposition:** **CLOSED DETERMINISTIC ENUM: `['company', 'evidence', 'watchlist']`**

**Rationale & Candidate Evaluation:**

| Object Kind | Status | Evaluation & Authority Basis |
| :--- | :--- | :--- |
| **`company`** | **PERMITTED** | Fully established in IRR via Company Research (`/research/company/:id`, `computeCertifiedCompany()`). Resolved against certified universe. |
| **`evidence`** | **PERMITTED** | Fully established in IRR via Evidence Explorer (`/evidence/:id`, `computeCertifiedEvidence()`). Resolved against certified universe. |
| **`watchlist`** | **PERMITTED** | Fully established in IRR via Watchlists (NP-09, `/watchlists`, `watchlists-service.ts`). Resolved against authenticated principal's own watchlists journal. |
| **`report`** | **EXCLUDED** | Reports (UI08) is not established or implemented in IRR. Referencing an absent capability violates fail-closed integrity. |
| **`raw/provider data`** | **EXCLUDED** | INT-013 hard boundary: raw provider data can never be referenced. Only governed platform objects are referenceable. |

An attempt to cite any object outside `['company', 'evidence', 'watchlist']` or an unresolvable/foreign object must fail closed with HTTP 404 (`governed-object-not-found`).

---

### Decision 4: Persistence Authority & Ownership Designation

**Disposition:** **PERSISTENCE OWNER = IRR SERVER TIER**

**Boundary & Invariants:**
1. **Designated Boundary**: `frontend/server/collaboration/` in repository `ramkivs/iips-review-recovered`.
2. **Persistence Foundation**: Governed under Gate-P Class C filesystem journal architecture using `frontend/server/persistence/persistence-service.ts`.
3. **Data Subdirectory**: `IIPS_DATA_DIR/collaboration/journal.ndjson`.
4. **Format Version**: First line strictly `{ "journalFormatVersion": 1 }`.
5. **Event Model**: Append-only lifecycle events folded in ascending `seq` order:
   - `thread-created`: Creates a new thread attached to a governed object.
   - `comment-added`: Appends a comment to an existing thread.
   - `comment-deleted`: Deletes a comment from a thread.
   - `thread-deleted`: Deletes a thread and its comments (no resurrection).
6. **NS-5 Vintage Pinning**: Every thread and comment persists the governed vintage (`dataVersion`, `asOf`, `mode`) observed at authoring time. If the current platform vintage later diverges, the mismatch is disclosed honestly without silent re-pinning or historical fabrication.

---

### Decision 5: Authoritative Implementation Repository

**Disposition:** **IMPLEMENTATION REPOSITORY = `ramkivs/iips-review-recovered` (IRR)**

**Rationale:**
1. IRR is the active application and feature baseline repository containing the certified sector engines, executive transport, Gate-P persistence layer, and active UI surfaces.
2. IPD (`ramkivs/iips-production-market-data`) is strictly a market-data infrastructure repository and is designated **READ ONLY** for application surfaces. Exactly 0 Collaboration implementation files shall be added to IPD.

---

### Decision 6: Lifecycle, Retention & Audit Principles

1. **Lifecycle**:
   - Threads and comments are created strictly by the authenticated principal.
   - Deletion writes an explicit tombstone event (`comment-deleted` or `thread-deleted`). Replay folds deleted items out of view deterministically.
2. **Retention**:
   - Retained in the append-only journal until explicit deletion or local data directory purge.
3. **Audit**:
   - The sequence of journal records provides an immutable operational audit log.
   - All HTTP endpoint access is subject to `EnterpriseRuntime.auditLog()` recording via `SecuredExecutor`.
4. **Fail-Closed Failure Semantics**:
   - Malformed non-final records fail closed (`JOURNAL_MALFORMED`).
   - Truncated final line is quarantined with valid prefix rewrite.
   - Unsupported journal format versions fail closed (`JOURNAL_VERSION_UNSUPPORTED`).

---

## 3. Governance Decision Summary Matrix

| Decision Area | Program Authority Decision | Implementation Rule |
| :--- | :--- | :--- |
| **Product Contract** | Option A: Private Thread / Annotation Model | User-owned, tenant-scoped, private by default. |
| **Sharing Boundary** | Sharing by reference within owner thread | No cross-user ACLs or shared workspace invitations. |
| **Mentions / Assignments**| Excluded | Initial scope limited to owner threads/comments; no roster sync. |
| **Tenant Directory** | Excluded | Relies solely on authenticated principal `(tenantId, userId)`. |
| **Governed Object Set** | `['company', 'evidence', 'watchlist']` | Closed enum; Reports and raw provider data excluded. |
| **Persistence Owner** | IRR Server Tier | Boundary: `frontend/server/collaboration/`. |
| **Persistence Model** | Gate-P Class C | Filesystem journal `collaboration/journal.ndjson`. |
| **Implementation Repo** | `ramkivs/iips-review-recovered` (IRR) | IPD remains 100% read-only (0 mutations). |
| **Lifecycle / Retention** | Append-only event folding; tombstone deletion | No silent resurrection; fail-closed journal recovery. |
| **Audit** | Journal append-only sequence + `SecuredExecutor` audit | D115 compliant; server-derived identity only. |

---

## 4. Protected Foundations Affirmation

Program Authority explicitly confirms that the Collaboration decisions preserve all protected foundations:
- **RR ↔ IPD Integration**: Closed / dormant.
- **PIT / IU-7 Infrastructure**: Untouched.
- **IU-8 Engine Integration**: Untouched.
- **Certified Sector Engines & Baseline Inputs**: Untouched.
- **Reference Portfolio (`/api/portfolio`)**: Untouched.
- **G-2 Portfolio Persistence Boundary**: Untouched.
- **NP-09 Watchlists Baseline**: Untouched. Watchlists is strictly consumed as a citation target via `readWatchlist()`.
- **IPD Repository**: Read-only reference baseline maintained (`4d3e1cdca3a33da0ec3be8b336b17128108a502c`), 0 mutations.

---

## 5. Implementation Readiness Disposition

With all required governance decisions established and documented:

> ### **DISPOSITION: READY FOR IMPLEMENTATION GATE**

### Explicit Boundaries for the Subsequent Implementation Gate
1. **Implementation Target**: `ramkivs/iips-review-recovered` (IRR only; 0 mutations to IPD).
2. **Authorized Scope**:
   - `frontend/server/collaboration/collaboration-service.ts` (event folding, threads, comments, NS-5 vintage pinning).
   - `frontend/server/collaboration/collaboration-resolvers.ts` (resolving `company`, `evidence`, `watchlist`).
   - `frontend/server/collaboration/collaboration-transport.ts` (HTTP transport dispatched from `executive-transport.ts`).
   - `frontend/src/api/collaboration.ts` (client API client and DTOs).
   - `frontend/src/features/collaboration/Collaboration.tsx` (UI10 surface at `/collaboration`).
   - Routing and navigation registration in `routes.ts`, `navigation.ts`, and `App.tsx`.
   - Comprehensive test suites for service, transport, and UI surface.
3. **Strict Exclusions**:
   - Zero implementation in IPD.
   - Zero production Keycloak/OIDC mutations.
   - Zero live market-data or broker connections.
   - Zero `@mentions`, assignments, or external roster dependencies.
   - Zero references to unpromoted Reports or raw provider quotes.
