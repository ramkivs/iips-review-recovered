# PROGRAM v3.0 — Phase 12.2: Mutation RBAC Map

Maps every candidate mutation to the governed role/action model (`ROLE_POLICY` +
`EnterpriseRuntime.check/authorize`). Inspection only — no implementation.

## The governed role model (frozen `EnterpriseRuntime.ROLE_POLICY`)

| Role | Permitted (action × resource) |
|---|---|
| `admin` | `* × *` (all actions, all resources) |
| `analyst` | `execute × *`, `read × *` |
| `viewer` | `read × *` |

`EnterpriseRuntime.authorize(principal, action, resource)` returns true if any of the principal's
roles grants `(action, resource)`. `check()` = `authorize()` + audit. `authorizeExecution()` =
`check('execute', resource)` + quota.

**Important:** `ROLE_POLICY` grants `admin` the `*` action — but **only when the decision goes
through `EnterpriseRuntime.check/authorize`**. The mutation classes do **not** call these. So
"admin can do everything" is **not** an implicit license for any mutation; each mutation must be
explicitly wired to the governed decision (via `SecuredExecutor.authorize`) before RBAC applies.

## Per-mutation RBAC mapping

| Mutation | Required action (proposed) | Required role | EnterpriseRuntime decision | ApiSecurity/resource decision | Governing class |
|---|---|---|---|---|---|
| 1.1 certify (read) | `read` | viewer/analyst/admin | `check('read', resource)` → ok | — | EnterpriseRuntime |
| 1.2 register | `admin` | admin | `check('admin', 'plugin.register')` | admin gate | **none in class** |
| 1.3 revoke | `admin` | admin | `check('admin', 'plugin.revoke')` | admin gate | **none in class** |
| 1.4 activate/deactivate | `admin` | admin | `check('admin', 'engine.activate')` | admin gate | **none in class** |
| 2.1 classify | `admin` | admin | `check('admin', 'data.classify')` + tenant match | admin gate + tenant | **none in class** |
| 3.1 workflow define | `admin` | admin | `check('admin', 'workflow.define')` | admin gate | **none in class** |
| 4.1 recordMigration | `admin` | admin | `check('admin', 'migration.record')` | admin gate | **none in class** |
| 6.1 DR restore | `admin` | admin | `check('admin', 'dr.restore')` | admin gate | **none in class** |
| 7.1 markDown | `admin` | admin | `check('admin', 'node.markdown')` | admin gate | **none in class** |
| 7.2 rollingRestart | `admin` | admin | `check('admin', 'node.restart')` | admin gate | **none in class** |

## Critical gap (RBAC authority)

For **every** candidate mutation, the governing class (`PluginMarketplace`, `DataGovernanceRuntime`,
`WorkflowRuntime`, `MigrationRuntime`, `DisasterRecoveryRuntime`, `CloudHaRuntime`,
`ActivationService`) has **no EnterpriseRuntime / PlatformApi.ApiSecurity reference**. Verified by
repo grep: zero hits.

Therefore:
- The **only** way any mutation obtains governed RBAC + audit is the approved **`SecuredExecutor`
  server-side composition** (from G3 / Phase 12.1): `authenticate()` → `authorize()` =
  `EnterpriseRuntime.check` + resource gate + audit, wrapping the mutation call.
- **No mutation can be considered RBAC-authorized at the platform contract level today.** Exposing
  one would require an explicit G2/transport wrapper (a Phase 12.2 **implementation** decision, not
  yet authorized).

## Tenant mapping

| Mutation | Tenant scope | Tenant enforcement in class | Needed for UI |
|---|---|---|---|
| 1.1–1.4, 3.1, 6.1, 7.1, 7.2 | global | ❌ | server-side admin RBAC; tenant context display |
| 2.1 classify | tenant-scoped (data.tenantId) | ⚠️ accepts tenantId param, **no caller check** | **must** enforce `DataGovernanceRuntime.canAccess` + tenant match server-side |
| 4.1 recordMigration | global | ❌ | server-side admin RBAC |

Tenant identity is never accepted from URL/query/localStorage/headers/React state; it is always
platform-validated server-side.

## Conclusion

**RBAC alone does not authorize any mutation today.** Each candidate needs an explicit server-side
wrapper through the approved `SecuredExecutor` + `EnterpriseRuntime` decision, plus (for classify)
tenant ownership enforcement. None are A-class UI candidates in the current governed state; most
are C (platform-only). See `phase12.2-recommendation.md`.
