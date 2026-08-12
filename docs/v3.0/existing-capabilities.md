# Program v3.0 — Phase 0: Existing Capabilities

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** EXISTING CAPABILITIES (Phase 0 — discovery)
**Version:** 1.0
**Date:** 2026-08-09

> Catalog of the certified platform capabilities that v3.0 must consume. v3.0 adds presentation/interaction; it never redefines these.

---

## 1. Investment engines (v1.1 — 10 frozen)

Each sector engine (`sector.banking`, `sector.insurance`, `sector.capital-markets`, `sector.healthcare`, `sector.hospitality`, `sector.energy`, `sector.utilities`, `sector.consumer`, `sector.industrials`, `sector.technology`) exposes, via `ExecutionResult.metadata`:

- `verdict` (Strong Buy / Buy / Accumulate / Hold / Watch / Avoid)
- `composite` (0–100)
- `overridesApplied`
- resolved subsegment/archetype (where applicable)
- `pillars` (quality/growth/risk/profitability/capitalEfficiency/valuation — per sector)
- `calibrationVersion`
- `ontology` (8-dim UIO mapping)
- `snapshotRef`, `evidenceRef` (execution identity)

## 2. Portfolio analytics (CSIP)

`iips-cross-sector` / `cross-sector/` exposes:

- `NormalizedHolding` (companyId, sector, conviction, confidence, quality, growth, risk, valuation, capitalEfficiency, moat, verdict)
- `PortfolioIntelligenceReport` (portfolioId, scenario, holdings, sectorExposure, concentration, diversificationScore, avgConviction, avgQuality, avgRisk)
- `RankedOpportunity` (companyId, sector, conviction)
- `AllocationRecommendation` (strategy, recommendation, rulesApplied)
- `DiversificationAnalysis` (concentration, diversificationScore, band, flags)
- `OpportunitySet` (top, rationale)
- `CorrelationReport` (flags, concentrationSectors)
- `PortfolioReport` (reportId, reportType, payload)

## 3. Evidence

`EvidencePipeline` produces immutable `EvidencePackage`:
`evidenceId, engineId, recommendation, compositeScore, confidence, keyMetrics[], supportingScores[], calibrationVersion, decisionRulesApplied[], replayReference, provenance, generatedAt`.

## 4. Snapshots

`SnapshotService`/`SnapshotStore` produce immutable `Snapshot`:
`snapshotId, engineId, schemaVersion, generatedAt, metrics, scores, verdict, evidenceRefs[], provenance`.

## 5. Replay

`ReplayService` reproduces `ReplayResult`:
`snapshotId, reproduced, byteIdentical, evidenceRefs[]`.

## 6. Live-data snapshots (v2.0)

`MarketDataSource`/`DataSnapshot` carry: `snapshotId, dataVersion, asOf, provider, quality (good/stale/partial/unavailable), completenessPct, fields` — the immutable input boundary.

## 7. RBAC / tenancy (v2.0)

`EnterpriseRuntime`: `Principal` (userId, tenantId, roles), `Role` (admin/analyst/viewer), `Permission`, `AuditRecord`, `check()`/`authorize()`/`isTenantResource()`/quotas.

## 8. Data governance (v2.0)

`DataGovernanceRuntime`: `GovernedData` (dataId, tenantId, classification, region, retentionDays, createdAt, immutable), `canAccess`, `canExport`, provider governance, residency.

## 9. Workflow (v2.0)

`DeterministicWorkflow`: `WorkflowDefinition` (workflowId, version, nodes, order), `WorkflowNode` (type engine/filter/aggregate/transform, capability, inputs), `WorkflowResult` (nodeOutputs, snapshotRefs, executedCount).

## 10. Marketplace (v2.0)

`PluginMarketplace`: `PluginRecord` (pluginId, manifestHash, signer, trustState, certified, blacklisted, determinismVerified), certification gate, revocation.

## 11. AI (v2.0, advisory-only)

`AiAssistedRuntime`/`AiAdvisor`: `AiAdvice` (kind, text, grounded, nonAuthoritative, model, modelVersion, engineResultRef). **AI is advisory; never decision authority (A === B).**

## 12. Observability / audit (v2.0)

`V2Observability`: `TraceRecord` (traceId, engineId, nodeId, dataVersion, asOf, provider, quality, snapshotId, evidenceRef, event, requestId). Events: live-data, snapshot, execution, evidence, replay, node transition, failover, DR, provider failure.

## 13. Administration-relevant

- Engine registry: `RegistryManager`, `PluginLoader` (engine list/manifests).
- Data governance controls.
- Audit: `EnterpriseRuntime.auditLog()`, `V2Observability`.
- Platform health: `CloudHaRuntime` node health, `DiagnosticsService`.

## Status

**EXISTING CAPABILITIES — COMPLETE (catalogued, not modified).**
