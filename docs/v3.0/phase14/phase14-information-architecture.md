# PROGRAM v3.0 — Phase 14: Candidate Information Architecture

**CANDIDATE ONLY — not implemented.** Sections included only where a governed capability was
discovered; UNAVAILABLE items excluded.

## Current IA (from certified Phase 12/13)

```
Executive           → /executive
Portfolio           → /portfolio, /portfolio/:id/holdings
Research            → /research/company/:id, /research/sector/:id, /research/cross-sector
Intelligence        → /intelligence/opportunities|risks|rankings|decision-matrix
                      → /ai-advisory (AI Explanation, non-authoritative)
Evidence            → /evidence, /evidence/:id, /evidence/snapshots, /evidence/replay/:id
Administration      → /admin (Overview, Identity, Tenants, Engines, Platform, Audit,
                       Live Data + Data Classification, Migration/Workflow/Marketplace)
```

## Candidate Phase 14 IA (from discovered-but-unexposed governed capabilities only)

```
Intelligence / Operations  (candidate, read-only)
└── Workflow Overview       ← WorkflowRuntime (definitions/order/nodes + version)
                             (read-only; no define/execute)

Research / Evidence         (candidate, read-only)
└── Deeper Evidence/Replay drill-down ← EvidencePackage / ReplayService (governed)
                             (partially surfaced; optional)

Platform API surface        ← PlatformApi (governed execute/isIdempotent)
                             (candidate ONLY if a governed, scoped execution surface is desired;
                              NOT a generic 'run anything' control)
```

## Sections explicitly EXCLUDED (UNAVAILABLE / PLATFORM-ONLY)
Users management · Tenant management · Roles/permission editing · System configuration · AI
configuration/governance · Quota editing · Migration exec/rollback · Engine/DR/marketplace
lifecycle · Golden outputs as live source.

## Recommended Phase 14 shape (for later consideration, when authorized)
1. **Workflow read surface** (read-only definitions/order/nodes) — the cleanest governed read
   candidate; small scope, no mutation.
2. **Optional deeper evidence/replay drill-down** (read-only) — already partially surfaced; likely
   low value to duplicate.
3. **Keep AI frozen** — AI config/governance remains UNAVAILABLE; no AI expansion.

> The IA is candidate-only and driven strictly by discovered contracts. No implementation is proposed
> in this inspection.
