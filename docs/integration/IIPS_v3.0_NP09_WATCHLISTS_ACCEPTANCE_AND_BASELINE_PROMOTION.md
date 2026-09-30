# IIPS v3.0 — NP-09 Watchlists Non-Production Acceptance & Active IRR Feature Baseline Promotion

## Program Authority Acceptance & Baseline Promotion Record

**Program:** IIPS Engineering Standards — Program v3.0  
**Workstream:** NP-09 — Watchlists  
**Record Identifier:** NP-09-PROMO-01 — Watchlists Non-Production Acceptance & Baseline Promotion  
**Document Type:** ACCEPTANCE / PROMOTION RECORD — Non-production feature baseline promotion  
**Version:** 1.0 — Acceptance Decision  
**Date:** 2026-10-01  
**Repository:** `ramkivs/iips-review-recovered`  
**Branch:** `arena/01a0f351-iips-review-recovered`  
**Qualified Implementation Commit:** `fbe76496fc47d002afced9cccab5158dd72c69ed`  
**Designation Baseline:** `docs/integration/IIPS_v3.0_NP09_WATCHLISTS_PERSISTENCE_OWNER_DESIGNATION.md` (`ceec1bda4a65beae5ba476ad948f77a17ac57e50`)  
**IPD Status:** Read-Only Reference Baseline (`4d3e1cdca3a33da0ec3be8b336b17128108a502c`), 0 mutations  
**Status:** **ACCEPTED — INCLUDED IN ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**  

---

## 1. Acceptance Basis & Program Authority Decision

Following the successful execution and recording of the NP-09 Watchlists Non-Production Qualification & Reconciliation Gate, Program Authority formally records:

> **NP-09 WATCHLISTS — ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**

This acceptance recognizes the qualified Watchlists implementation in repository `ramkivs/iips-review-recovered` at commit `fbe76496fc47d002afced9cccab5158dd72c69ed` as an accepted, active non-production feature in the IRR application baseline.

### What Acceptance Means
1. **Active Feature Inclusion**: UI07 Watchlists at `/watchlists` is formally promoted from an implementation candidate to an active non-production feature of the IRR platform.
2. **Governed Architectural Ownership**: Watchlists persistence ownership resides authoritatively in the IRR Server Tier (`frontend/server/watchlists/`).
3. **Persistence Authority Compliance**: Gate-P Class C filesystem event journal (`watchlists/journal.ndjson`) with format version 1 is accepted as the durable persistence mechanism for Watchlists in the non-production IRR server environment.
4. **Governed Contract Adherence**: Membership, baseline-vs-current deltas, and deterministic triggers consume certified decision-matrix reference outputs without fabricating market-data feeds or time-series histories.
5. **D115 Identity Compliance**: Server-derived tenant and owner scoping via `SecuredExecutor` is accepted for non-production access control.

### What Acceptance Does NOT Mean
1. **No Production Authority**: Does NOT grant production deployment, production release, or production readiness authority.
2. **No External Integration**: Does NOT activate or authorize live market-data feeds, broker integration, NSE, or Dhan production APIs.
3. **No Production OIDC/Keycloak Authority**: Operates solely under the established non-production `SecuredExecutor` test/development identity abstraction; no live production IdP configuration is authorized.
4. **No Broad Certification**: This milestone represents non-production feature baseline acceptance only; formal release or production certification remains governed by separate subsequent program milestones.

---

## 2. Acceptance Matrix

| Acceptance Dimension | Authoritative Evidence | Disposition |
| :--- | :--- | :--- |
| **Product Contract** | NP-09 Product Contract (UI07, `/watchlists`, named lists, canonical membership, baseline deltas, triggers, Company Research navigation, private user-owned) | **ACCEPTED** |
| **Gate-P Persistence** | Class C filesystem append-only event journal (`journal.ndjson`, `journalFormatVersion: 1`, deterministic folding, lifecycle events) | **ACCEPTED** |
| **Persistence Ownership** | Designated in `NP-09-AUTH-01` as IRR Server Tier (`frontend/server/watchlists/`) | **ACCEPTED** |
| **Implementation** | Commit `fbe76496fc47d002afced9cccab5158dd72c69ed` | **ACCEPTED** |
| **Security / Identity** | D115 compliant; server-derived `(tenantId, userId)`, client assertions rejected, role-governed `readResourceGate` | **ACCEPTED** |
| **Governed Data** | Consumes certified engine outputs via `computeCertifiedDecisionMatrix()`, no client-supplied scores, snapshot provenance | **ACCEPTED** |
| **UI07 Surface** | Implemented at `/watchlists` in `Watchlists.tsx`, institutional fail-closed states (`LoadingState`, `EmptyState`, `ErrorState`), Company Research navigation | **ACCEPTED** |
| **Test Qualification** | 77 / 77 Watchlists and persistence tests passing (100% pass rate) | **ACCEPTED** |
| **Typecheck** | `npm run typecheck --prefix frontend` (0 errors, exit code 0) | **ACCEPTED** |
| **Build** | `npm run build --prefix frontend` (Vite production bundle built clean in 1.52s, exit code 0) | **ACCEPTED** |
| **IPD Isolation** | Repository `ramkivs/iips-production-market-data` unmutated (0 commits, 0 file changes) | **ACCEPTED** |
| **PIT / IU-7 Preservation** | `frontend/server/pit/` unmodified; market-data snapshot path preserved | **ACCEPTED** |
| **IU-8 Preservation** | `EngineApiAdapter` and certified sector engines preserved untouched | **ACCEPTED** |
| **G-2 Preservation** | Portfolio persistence boundary remains untouched | **ACCEPTED** |
| **Restart Limitation** | Explicit boundary retained: journal reconstruction verified; out-of-process OS/server restart retained for future operational verification | **ACCEPTED** |
| **Production Exclusion** | Production activation, external broker/market-data connectivity, and production OIDC explicitly excluded | **ACCEPTED** |

---

## 3. Explicit Qualification Limitations & Boundaries

1. **Restart Durability Boundary**:
   - The verified evidence proves deterministic journal reconstruction across independent service instances from the persisted filesystem storage (`journal.ndjson`).
   - Deployment-tier, out-of-process OS daemon / container lifecycle restart verification is not established by this non-production milestone and is retained as a future operational verification item if required by the deployment tier.
2. **Identity Boundary (D115)**:
   - Identity derivation functions through the established non-production `SecuredExecutor` test harness and development mapping.
   - Production Keycloak/OIDC realm activation, certificate provisioning, and external IdP cutover remain outside this gate's authority.
3. **Market Data Boundary**:
   - Scores and deltas derive strictly from the frozen v1.1 replay baseline snapshot via certified sector engines.
   - No live ticker, streaming feed, or real-time price monitoring is implied or authorized.

---

## 4. Protected Foundations Affirmation

Program Authority explicitly confirms that all protected foundational baselines remain unchanged:
- **RR ↔ IPD Integration**: Closed / dormant.
- **PIT / IU-7 Infrastructure**: Unmodified.
- **IU-8 Certified Engine Integration**: Unmodified.
- **Certified Sector Engines & Baseline Inputs**: Unmodified.
- **Reference Portfolio (`/api/portfolio`)**: Unmodified.
- **G-2 Portfolio Persistence Boundary**: Unmodified.
- **IPD Repository**: Read-only reference status maintained; exactly 0 mutations.

---

## 5. Next Governed Milestone

With NP-09 Watchlists accepted into the active non-production IRR feature baseline:
1. **Workstream Status**: NP-09 Watchlists is **ACCEPTED** and complete at the non-production feature level.
2. **Subsequent Program Step**: Transition to broader multi-surface feature baseline consolidation and platform convergence under Program v3.0, preserving all established persistence boundaries, identity invariants, and protected foundations.
