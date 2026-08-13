# Program v3.0 — Phase 0: v2.0 Boundary Map

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** V2.0 BOUNDARY MAP (Phase 0)
**Version:** 1.0
**Date:** 2026-08-09

> Maps the certified v2.0 platform contracts to the v3.0 experience surfaces. **v3.0 consumes these; it does not redefine them.**

---

## 1. Boundary rule

- **v3.0** = presentation + interaction over the certified platform.
- **v2.0** = certified platform (distributed/HA/DR/live-data/enterprise/marketplace/workflow/SDK/AI/evidence/replay).
- **v1.1** = deterministic investment-engine meaning.

**v3.0 must never reverse these responsibilities.**

## 2. Contract → v3.0 surface map

| v2.0 contract (module/type) | v3.0 experience surface | Notes |
|---|---|---|
| `ExecutionResult.metadata` (verdict, composite, pillars, overrides, calibrationVersion) | Company decision, DecisionCard, DecisionBadge | Display as returned |
| `NormalizedHolding` + `PortfolioIntelligenceReport` | Portfolio overview, holdings, sector exposure, concentration, diversification | Display CSIP-computed values |
| `RankedOpportunity` / `OpportunitySet` | Rankings, opportunities | Display ranked output |
| `AllocationRecommendation` | Allocation view | Show recommendation + rulesApplied |
| `EvidencePackage` | Evidence Explorer, evidence drawer | Trace decision → evidence |
| `Snapshot` | Snapshot selector/badge | Show snapshotId, version, generatedAt |
| `ReplayResult` | Replay Explorer (ORIGINAL/REPLAY/MATCH) | Invoke certified replay; no browser replay |
| `DataSnapshot` (dataVersion, asOf, provider, quality, completeness) | Data freshness indicators (LIVE/SNAPSHOT/STALE/UNAVAILABLE/REPLAY) | Show freshness; never present stale as current |
| `EnterpriseRuntime` (Principal, Role, Permission, AuditRecord) | Admin UX (users/roles/tenants/permissions), permission-aware UI | Enforce via contracts |
| `DataGovernanceRuntime` | Admin data governance, data residency/classification | Display governed metadata |
| `DeterministicWorkflow` | Workflow view (where exposed) | Show workflow nodes/results; no hidden logic |
| `PluginMarketplace` | Admin engine registry | Certified-only |
| `AiAdvice` | AI assistance (labeled AI EXPLANATION) | Clearly distinct from CERTIFIED RESULT |
| `V2Observability` (TraceRecord) | Lineage, audit, replay timeline | Trace across chain |
| `CloudHaRuntime` | Platform health (admin) | Show node health |

## 3. Surfaces with no direct v2.0 contract (gap → document, don't fabricate)

The following v3.0 IA items have **no existing certified contract**; they must be surfaced **only from contracts that exist**, or documented as unavailable:

- "Performance" (portfolio return): **no performance/returns contract** exists — do not invent P&L in React.
- "Risk" beyond CSIP's concentration/diversification: surface only what CSIP exposes.
- "Decision Matrix (quality × valuation)": **presentation-only**; consume any platform-supplied classification, never re-derive.
- "Screening": only if a screening contract is exposed; otherwise document gap.

## 4. API transport gap

The v2.0 contracts are **in-process TypeScript**, not an HTTP API. v3.0 requires a thin **transport/adapter** (new, authorized) that exposes these certified contracts read-only. This adapter must not alter contract semantics.

## Status

**V2.0 BOUNDARY MAP — COMPLETE (Phase 0).** No v2.0/v1.1 behavior modified.
