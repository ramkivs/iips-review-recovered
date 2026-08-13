# PROGRAM v3.0 — Phase 13: Candidate Information Architecture

**CANDIDATE ONLY — not implemented.** Sections are included **only** where a governed capability was
discovered. UNAVAILABLE items are excluded or shown as unavailable.

## Principles applied
- Authority separation (certified state ≠ AI ≠ operational ≠ config).
- Tenant awareness; permission awareness (hiding ≠ security); freshness semantics.
- Source-of-truth mapping; progressive disclosure (L1–L5).
- No invention.

## Current IA (from certified Phase 12)

```
Executive
├── Dashboard
Portfolio
├── Overview
├── Holdings
Research
├── Company /research/company/:id
├── Sector /research/sector/:id
├── Cross-Sector /research/cross-sector
Intelligence
├── Opportunities · Risks · Rankings
├── Decision Matrix
Evidence
├── Decision Evidence
├── Snapshots
├── Replay /evidence/replay/:id
Administration  (admin)
├── Overview
├── Identity & Access
├── Tenants
├── Engines & Certification
├── Platform Operations
├── Audit
├── Live Data & Governance  (incl. Data Classification)
├── Migration / Workflow / Marketplace
```

## Candidate Phase 13 IA (from discovered-but-unexposed governed capabilities only)

Any of the following is a **candidate only if separately authorized**; each maps to a governed contract.

```
Intelligence  (extension candidates)
└── AI Explanation / Advisory   ← AiAssistedRuntime (NON-authoritative; AI ≠ CERTIFIED RESULT)
    ├── Advice per engine result (explanation/summary/hypothesis/anomaly/research)
    └── clearly labeled AI EXPLANATION

Platform Operations  (extension — read-only)
├── HA / Node Health (read)        ← CloudHaRuntime.checkHealth/coordinator
├── DR / Backup status (read)      ← DisasterRecoveryRuntime.exportBackup/detectCorruption
├── Telemetry / Traces             ← V2Observability.list/byTrace
└── Performance measurements       ← PerformanceScaling.measureBatch

Administration  (read-only extensions already largely delivered)
├── Migration history (read)       ← MigrationRuntime.migrationsLog (already in admin)
├── Marketplace registry (read)    ← PluginMarketplace.list (already in admin)
└── Workflow definitions (read)    ← WorkflowRuntime.define/version
```

## Sections explicitly EXCLUDED (UNAVAILABLE — no governed source)
- Users management · Tenant management · Roles management · Permission editing · System
  configuration · AI configuration/governance · Quota editing · Migration execution/rollback ·
  Engine lifecycle (UI) · DR restore · Snapshot create/restore · Marketplace activation · Node
  markDown/rollingRestart.

## Recommended Phase 13 shape (for later consideration, when authorized)
1. **AI Explanation surface** (non-authoritative advisory over `AiAssistedRuntime`) — the most
   distinct governed, non-admin capability not yet exposed. Must be clearly labeled
   **AI EXPLANATION ≠ CERTIFIED RESULT** and use the existing authority badges.
2. **Read-only Platform Operations extension** (HA/DR/telemetry/perf — some already present) — a
   read surface, no new mutation.
3. **Keep Administration closed** — Phase 12 is certified/frozen; do not re-open broad admin in Phase 13.

> The IA is candidate-only and driven strictly by discovered contracts. No implementation is proposed
> in this inspection.
