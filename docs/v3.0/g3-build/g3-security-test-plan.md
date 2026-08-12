# Program v3.0 — G3: Security Test Plan

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** G3 — security tests
**Document type:** TEST PLAN
**Version:** 1.0
**Date:** 2026-08-09

---

## 1. Authentication tests

- valid login → authenticated
- invalid login → 401
- expired session → 401
- logout → session invalidated
- revoked/invalid session → 401 (where supported)

## 2. Authorization tests

- admin authorized action → allow
- analyst authorized action → allow
- viewer authorized action → allow
- unauthorized role/action → **403**

## 3. Tenant isolation

```text
Tenant A → Tenant A resource   ALLOW
Tenant A → Tenant B resource   DENY
Tenant B → Tenant A resource   DENY
```

Positive + negative cases.

## 4. Tampering / bypass

- tenant-ID manipulation → rejected
- role manipulation → rejected
- forged headers → rejected
- direct API access (bypassing React) → enforced by platform
- bypassing React navigation → enforced by platform
- expired token/session → rejected

The security boundary must hold even when the React application is bypassed entirely.

## 5. HTTP semantics

```text
No authentication → 401
Invalid/expired authentication → 401
Authenticated but unauthorized → 403
```

## 6. Audit

- authentication success/failure
- authorization allow/deny
- tenant access attempt
- privileged operation
- logout / session lifecycle
- security boundary failure

All via `EnterpriseRuntime.AuditRecord` / `auditLog()`.

## 7. Regression

All existing v1.1 / v2.0 / v3.0 tests must remain passing.

## Status

**SECURITY TEST PLAN — IMPLEMENTED.** Adapter + enforcement tests run (see G3 certification report).
