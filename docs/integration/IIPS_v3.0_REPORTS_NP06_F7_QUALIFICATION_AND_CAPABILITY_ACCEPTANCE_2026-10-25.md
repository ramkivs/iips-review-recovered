# IIPS v3.0 — NP-06 Reports: F-7 Separate-Process Durable HTTP Qualification and Capability Acceptance Record

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-F7-QUALIFICATION-AND-ACCEPTANCE-2026-10-25-01` |
| **Record type** | **QUALIFICATION AND CAPABILITY ACCEPTANCE RECORD.** |
| **Authority** | Program Authority (PA) — Ramki |
| **Date** | `2026-10-25` (Asia/Calcutta) |
| **Governing acts** | `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01`; `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01`; `IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01`; `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` |
| **Scope** | Bounded non-production NP-06 Reports capability qualification and backend acceptance. |
| **F-7 Status** | **SATISFIED** (all five qualification legs proven across separate operating system processes). |
| **Capability Acceptance** | **ACCEPTED (Bounded Non-Production Scope Only)**. |
| **CV-51 Status** | **WITHHELD / BLOCKED** (No UI, routes, navigation, or client exposure authorized). |
| **Production Admission** | **NOT ADMITTED / NOT PRODUCTION-READY**. |

---

## 1. Five-Leg F-7 Qualification Evidence

Qualification executed via `server/reports-restart.test.ts` driving `server/reports-restart-harness.ts` across independent OS processes against the real composed HTTP server (`executive-transport.ts`), real carrier resolver (`IIPS_REPORTS_OWNER_PATH`), and real SQLite NP-04 persistence (`IIPS_NP04_DATABASE_PATH`):

| Leg | Qualification Bar | Executed Process Evidence | Verdict |
|---|---|---|---|
| **1. Positive Leg** | Valid server-owned carrier and persistence foundation allow governed operations over HTTP without caller credentials. | Process A (`pid` distinct) persists report via `POST /api/reports/artifacts` -> `201 Created` (`reportId: 64-char store-assigned UUID`), `artifactVersion: 1`, `ownership: { tenantId: 'irr-reports-personal', userId: 'owner-irr-reports-personal' }`. Context endpoint returns `200 OK`. | **PROVEN** |
| **2. Negative Leg** | Cross-owner queries return 404 without existence disclosure. Client-supplied identity/tenant claims rejected. | Query parameter `?tenantId=...` -> `400 Bad Request`. Request body with `tenantId` / `userId` / `reportId` -> `400 Bad Request`. Unknown `reportId` -> `404 Not Found`. | **PROVEN** |
| **3. Failure-Mode Leg** | Missing, unreadable, or digest-mismatched carrier fails closed with HTTP 503. Missing database returns 503 persistence-unavailable. | Process with unconfigured carrier returns `503 owner-context-unavailable`. Process with tampered carrier returns `503 owner-context-unavailable`. Process with unset db path returns `503 persistence-unavailable`. | **PROVEN** |
| **4. Restart Durability Leg** | Persisted state survives complete OS process termination and is retrievable/mutable by fresh processes at same server-owned path. | Process A writes artifact -> terminates. Process B (fresh PID) retrieves exact artifact via `GET /api/reports/artifacts/:id` (`200 OK`) and appends version 2 via `POST /.../versions` (`201 Created`, `supersedesReportId: id`, `artifactVersion: 2`) -> terminates. Process C (third fresh PID) retrieves full single-parent supersession chain (`200 OK`). | **PROVEN** |
| **5. Non-Equivalence Leg** | No client-supplied identity is accepted, roles are retired, and no authentication credential is inferred. | Transport applies single declared owner partition (`P-1`); rejects ambient auth tokens; enforces server-constant namespace `reports.*`. | **PROVEN** |

---

## 2. Capability Acceptance Assessment

| Prerequisite / Gate | Required Standard | Status |
|---|---|---|
| **R1 Ownership Source** | Authoritative dated PA act with non-auth literals and carrier specification | **EFFECTIVE** (`IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01`) |
| **R2 Contract Shape** | Authoritative dated PA act with P-1, A-2, C-2, C-4, C-5, and §5.4 replacements | **EFFECTIVE** (`IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01`) |
| **R3 Persistence Binding** | Admitted dependency specifier to NP-04 store | **EFFECTIVE & INTEGRATED** (`IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01`) |
| **Transport Implementation** | Authorized non-auth HTTP transport implemented and verified | **COMPLETED & TESTED** (`frontend/server/reports-transport.ts`) |
| **F-7 Durable HTTP Qualification** | Real composed server tested across separate OS processes (all 5 legs) | **SATISFIED** (18/18 tests passed across 5 test suites) |
| **Capability Acceptance Verdict** | NP-06 Reports backend capability accepted for bounded non-production scope | **ACCEPTED (Non-Production)** |

---

## 3. Explicit Boundaries and Mandatory Safeguards

1. **`CV-51` Withheld:**
   - Client-facing Reports routes, navigation links, and UI remain **unauthorized and unexposed**.
   - No route added to client routing table (`AppShell`, `routes.ts`, `navigation.ts`).
   - Any client exposure requires a separate, dedicated `CV-51` decision act following capability acceptance.

2. **Production Admission Withheld:**
   - Reports is **not admitted to production**.
   - Lineage `2e11fa3b…` divergence remains a known non-production isolation boundary pending eventual `R3-Option C` convergence.

3. **`D115`/`CV-43` Unwired:**
   - 0 non-test importers of company identity runtime.

*Program Authority: Ramki. **Status: F-7 SATISFIED. Capability ACCEPTED for bounded non-production backend scope. CV-51 and Production Admission WITHHELD.***
