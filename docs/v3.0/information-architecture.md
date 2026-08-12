# Program v3.0 — Information Architecture

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** INFORMATION ARCHITECTURE (Phase 1)
**Version:** 1.0
**Date:** 2026-08-09

> The global structure of the v3.0 application. Consumes certified v2.0/v1.1 contracts only; where an IA item has no contract, it is documented as a gap (never fabricated).

---

## 1. Primary application structure

```text
IIPS
├── Executive
├── Portfolio
│   ├── Overview
│   ├── Holdings
│   ├── Allocation
│   ├── Risk
│   ├── Opportunities
│   └── Actions
├── Research
│   ├── Company
│   ├── Sector
│   ├── Cross-Sector
│   ├── Rankings
│   └── Screening
├── Intelligence
│   ├── Opportunities
│   ├── Risks
│   ├── Signals
│   └── Decision Matrix
├── Evidence
│   ├── Decision Evidence
│   ├── Snapshots
│   ├── Replay
│   ├── Lineage
│   └── Audit
└── Administration
    ├── Users
    ├── Roles
    ├── Tenants
    ├── Permissions
    ├── Data
    ├── Engines
    └── Platform Audit
```

## 2. Contract availability map (per IA item)

| IA item | Certified contract? | v3.0 action |
|---|---|---|
| Executive overview | CSIP portfolio intelligence | Surface |
| Portfolio holdings / allocation / sector exposure / diversification | `PortfolioIntelligenceReport`, `NormalizedHolding` | Surface |
| Portfolio risk | CSIP concentration/diversification only | Surface only those |
| Portfolio performance/returns | **No contract** | Show "unavailable" (documented gap) |
| Company decision / pillars / overrides | `ExecutionResult.metadata` | Surface |
| Sector / cross-sector ranking | `RankedOpportunity` | Surface |
| Screening | **No contract** | Document gap |
| Decision Matrix (quality × valuation) | **Presentation-only**; consume platform classification if present | Never re-derive |
| Evidence | `EvidencePackage` | Surface |
| Snapshots | `Snapshot` | Surface |
| Replay | `ReplayResult` | Invoke certified replay |
| Lineage / audit | `V2Observability` TraceRecord, `EnterpriseRuntime.auditLog` | Surface |
| Users/Roles/Tenants/Permissions | `EnterpriseRuntime` | Admin UX |
| Data governance | `DataGovernanceRuntime` | Admin UX |
| Engines | `RegistryManager`, `PluginMarketplace` | Admin UX |
| Platform health | `CloudHaRuntime` | Admin UX |

## 3. Cross-surface relationship (the decision→evidence→replay spine)

All surfaces connect along the trust chain:

```text
Portfolio → Holding → Company → Decision → Evidence → Snapshot → Replay → Original result
```

Every decision surface exposes a route to its evidence and replay.

## 4. Progressive disclosure (levels)

- L1 Executive summary (portfolio health, top opportunities/risks)
- L2 Decision details (verdict, confidence, drivers)
- L3 Analytical details (pillars, metrics)
- L4 Evidence (metrics, data sources, snapshot, provenance)
- L5 Raw / provenance / replay

## Status

**INFORMATION ARCHITECTURE — COMPLETE (Phase 1).** Consumes certified contracts only.
