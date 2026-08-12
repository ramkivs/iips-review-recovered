# Program v3.0 — G3 Readiness Assessment

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** G3 READINESS ASSESSMENT (Phase 11 — documentation only, NOT implementation)
**Version:** 1.0
**Date:** 2026-08-09
**Status:** ASSESSMENT — identifies what is required to transition from `reference SNAPSHOT → authenticated tenant-scoped LIVE data`. No production auth is implemented in Phase 11.

---

## 1. Current state

All v3.0 surfaces (Executive, Portfolio, Company, Cross-Sector, Decision Matrix, Evidence, Replay) operate against the **certified reference SNAPSHOT** (frozen v1.1 Replay Baseline inputs + golden expected-outputs), served through the **minimal dev-mode transport** with a header-based session stub.

## 2. The transition to be achieved (NOT yet implemented)

```text
REFERENCE SNAPSHOT
      ↓
AUTHENTICATED TENANT (identity + session + RBAC)
      ↓
LIVE / TENANT-SCOPED DATA
```

## 3. Required capabilities (governed, separately)

| Capability | What it requires | Status |
|---|---|---|
| Authentication | Identity provider, credential/session/token flow, MFA for admin | ⚠️ Missing |
| Session management | Session creation/validation/expiry/rotation | ⚠️ Missing |
| Tenant scoping | Every request resolves to a tenant (`Principal.tenantId`) | Partial (dev-mode header) |
| RBAC enforcement | `EnterpriseRuntime`/`PlatformApi.ApiSecurity` actual authorization | ⚠️ Not wired to transport |
| Tenant data isolation | Live tenant data, not reference SNAPSHOT | ⚠️ Missing |
| Live data path | `LIVE/SNAPSHOT INPUT → v1.1 ENGINE → GOVERNED OUTPUT → v2.0 PLATFORM → v3.0 UI` | ⚠️ Missing (uses golden reference) |
| Audit integration | `EnterpriseRuntime.auditLog` / `V2Observability` wired to requests | ⚠️ Missing |

## 4. Governing principle (must not be violated)

- The G3 boundary must be implemented as a **properly governed platform/application boundary**.
- It must **not** be built opportunistically by extending the dev-mode session header into production security.
- **Transport transformation ≠ Decision transformation** remains the invariant.
- Golden expected-outputs remain **reference/SNAPSHOT sources only** — never the permanent live analytical source.

## 5. Recommended approach (for a future, separately authorized milestone)

1. Authorize a **dedicated G3 milestone** (auth/session/tenant boundary) with its own contract + certification.
2. Wire `EnterpriseRuntime`/`PlatformApi.ApiSecurity` as the authoritative authorization source.
3. Introduce tenant-scoped data access; serve live engine outputs (not golden fixtures) for authenticated tenants.
4. Preserve the v1.1 engine / v2.0 platform / v3.0 UI separation.
5. Re-run v3.0 certification + v2.0/v1.1 regression after the G3 boundary.

## 6. STOP conditions (Phase 11)

- Do NOT implement production auth in Phase 11.
- Do NOT silently treat the dev-mode session header as production security.
- Do NOT represent golden fixtures as permanent live replay/evidence history.

## Status

**G3 READINESS ASSESSMENT — COMPLETE (documented; not implemented).** Transition to authenticated tenant LIVE data is a future, separately governed milestone.
