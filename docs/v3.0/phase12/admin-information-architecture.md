# PROGRAM v3.0 — Phase 12: Candidate Administration Information Architecture

**CANDIDATE ONLY — not implemented.** Sections are included **only** where a governed capability
was discovered (see `capability-matrix.md`). Sections with no governed source are marked
UNAVAILABLE and **removed** from the active IA.

## Principles applied

- **Authority separation:** certified platform state ≠ AI explanation ≠ operational status ≠
  user-entered config. Each surface labels its authority.
- **Tenant awareness:** active tenant context always visible.
- **Permission awareness:** hiding a button never implies security; server enforces.
- **Freshness:** preserve LIVE / SNAPSHOT / STALE / UNAVAILABLE / REPLAY semantics.
- **Progressive disclosure:** keep the L1→L5 design principle.
- **Destructive ops:** require explicit confirmation + governed audit.
- **No invention:** UNAVAILABLE items are shown as unavailable, not built.

## Candidate IA (from discovered contracts only)

```
Administration  (/admin)  — admin role (server-enforced)
│
├── Overview                       ← read-only platform summary (node health, engine count,
│                                     live-data quality, recent audit) — NO metrics invented
│
├── Identity & Access              ← READ-ONLY reference + self
│   ├── Current Principal          ← own identity (Principal), role, tenant (self only)
│   ├── Roles & Permissions        ← ROLE_POLICY reference matrix (read-only)
│   │
│   │  (Users, Role management, Permission editing: UNAVAILABLE — Keycloak-owned / no contract)
│
├── Tenants                        ← ACTIVE-TENANT CONTEXT + isolation status only
│   │                                (Tenant CRUD/config/quota: UNAVAILABLE)
│
├── Data Governance                ← READ + governed inspection
│   ├── Classifications            ← DataClassification + GovernedData (read)
│   ├── Ownership & Lineage        ← tenant ownership, provenance (read)
│   ├── Providers & Quality        ← DataSourceMeta quality/completeness/freshness (read)
│   └── (Governed mutation classify: exposed only if a guarded contract is authorized — ⚠️)
│
├── Engines & Certification        ← READ-ONLY registry
│   ├── Engine Registry            ← PluginLoader.list + PluginIdentity/PluginManifest
│   ├── Certification Status       ← PluginMarketplace.PluginRecord (trust/certified/blacklisted)
│   └── Evidence & Replay Linkage  ← EvidencePackage + ReplayService (read)
│
├── Platform Operations            ← READ-ONLY
│   ├── Health & HA                ← CloudHaRuntime node health + failover/quorum
│   ├── DR / Recovery              ← DisasterRecoveryRuntime status
│   ├── Telemetry                  ← V2Observability traces (read)
│   └── Performance                ← PerformanceScaling measurements (read)
│
├── Audit                          ← READ-ONLY over governed auditLog (filter/sort/paginate)
│
├── Workflow                       ← READ-ONLY definitions/executions (approvals/admin: UNAVAILABLE)
│
├── Live Data                      ← READ-ONLY source/freshness/quality/lineage
│
├── Migration History              ← READ-ONLY migrationsLog
│
└── Marketplace Registry           ← READ-ONLY (module status/trust); revoke NOT in v3.0 admin
```

## Sections explicitly EXCLUDED (UNAVAILABLE — no governed source)

- **Users management** (create/disable/lookup) — Keycloak-owned; no platform contract.
- **Roles management** (assign/remove) — Keycloak-owned; no platform contract.
- **Permission editing** — no mutation contract; `ROLE_POLICY` is code.
- **Tenant management** (create/config/quota) — no contract.
- **AI Governance** — no config/store/usage contract (AI advisory is a research surface, not admin).
- **Quotas & Entitlements** — no store; enforcement param only.
- **System Configuration** — no config service.
- **Migration execution/rollback** — no UI contract.
- **Workflow approvals / retries / admin actions** — no contract.
- **Marketplace activation / module install** — no activation contract (only certification/revocation).

## Recommended IA shape for implementation (later, when authorized)

1. **Admin Overview** — one read-only landing that aggregates governed state (health, engines,
   live-data, audit summary).
2. **Identity & Access → Roles & Permissions reference** — read-only policy display.
3. **Tenants → Active Context & Isolation** — read-only.
4. **Engines & Certification** — read-only registry.
5. **Platform Operations** — read-only health/HA/DR/telemetry/performance.
6. **Audit** — read-only governed audit viewer.
7. **Live Data** — read-only source/quality.
8. **Migration History** — read-only.
9. **Workflow Definitions (read)** — read-only.
10. **Marketplace Registry (read)** — read-only.

> The IA is **dominantly a governed read/inspection surface**. This is the honest, contract-driven
> answer to "what can Administration expose today." Broad admin CRUD is deliberately absent.
