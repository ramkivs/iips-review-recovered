# Program v3.0 — Personas & Roles

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** PERSONAS & ROLES (Phase 1)
**Version:** 1.0
**Date:** 2026-08-09

> Primary user personas and how they map to the certified `EnterpriseRuntime` RBAC model (admin/analyst/viewer). The frontend never bypasses server-side authorization.

---

## 1. Personas

| Persona | Primary need | Primary surfaces | RBAC role |
|---|---|---|---|
| **Executive** | "What is happening? What matters? What needs attention?" | Executive, Portfolio overview, Intelligence | viewer/analyst (read) |
| **Portfolio Manager** | Decide + act on holdings | Portfolio, Holdings, Allocation, Actions, Opportunities | analyst |
| **Analyst / Researcher** | Deep-dive company/sector/evidence/replay | Research, Company, Sector, Evidence, Replay | analyst |
| **Risk / Compliance** | Understand risk, audit, lineage | Intelligence risks, Evidence, Lineage, Audit | analyst/viewer |
| **Administrator** | Manage users/roles/tenants/data/engines/platform | Administration | admin |

## 2. Role model (from `EnterpriseRuntime`)

| Role | Can |
|---|---|
| `admin` | Manage users/roles/tenants/permissions/data/engines; execute all |
| `analyst` | Execute engines, read all research/intelligence/evidence |
| `viewer` | Read only (no execute) |

## 3. Navigation & permission behavior

- The navigation model is **role-aware**: admin-only surfaces (Administration) are hidden/disabled for non-admins.
- The frontend does **not** decide permissions; it reflects `EnterpriseRuntime`/`PlatformApi.ApiSecurity` authorization.
- Permission-denied surfaces render `PermissionDeniedState` (never fabricate data).

## 4. Tenant awareness

- Every user operates within a tenant (from `Principal.tenantId`).
- The UI surfaces only the user's tenant data; cross-tenant access is impossible (enforced by platform).

## Status

**PERSONAS & ROLES — COMPLETE (Phase 1).**
