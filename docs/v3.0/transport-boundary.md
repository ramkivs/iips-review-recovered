# Program v3.0 — Transport Boundary (v2.0 adapter)

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** TRANSPORT BOUNDARY (Phase 1 — G2 spec, frozen before transport implementation)
**Version:** 1.0
**Date:** 2026-08-09
**Status:** GOVERNANCE DOCUMENT — the contract for the v3.0 transport/adapter layer.

> The v2.0 platform contracts are **in-process TypeScript**, not an HTTP API. v3.0 needs a thin **transport/adapter** to expose them to a browser SPA. This document defines exactly what the adapter may and may not do.

---

## 1. Architecture

```text
Browser
  ↓
v3.0 React SPA
  ↓
Typed v3 API Client
  ↓
v3.0 Transport / Adapter
  ↓
Existing v2.0 Platform Contracts
  ↓
v1.1 Deterministic Engines
```

## 2. What the adapter MAY do

- authenticate / establish session context
- enforce transport-level request validation
- map HTTP requests to existing contracts
- map existing responses into transport DTOs
- propagate tenant / principal / permission context
- expose evidence / snapshot / replay data
- expose platform status
- handle serialization
- handle transport errors
- provide pagination/filtering **where purely a transport/application concern**

## 3. What the adapter MUST NOT do

- calculate scores
- recalculate confidence
- apply investment thresholds
- recalculate rankings
- alter engine weights
- reinterpret verdicts
- modify sector classifications
- introduce frontend-specific investment rules
- bypass `EnterpriseRuntime`
- bypass `PlatformApi.ApiSecurity`
- change snapshot semantics
- modify replay semantics

## 4. Contract → transport DTO map

| v2.0 contract | Transport DTO (browser receives) | Mapping |
|---|---|---|
| `ExecutionResult.metadata` (verdict, composite, pillars, overrides, calibrationVersion, ontology) | Decision DTO | 1:1 read-only |
| `PortfolioIntelligenceReport` | Portfolio DTO | 1:1 |
| `NormalizedHolding[]` | Holdings DTO | 1:1 |
| `RankedOpportunity[]` | Ranking DTO | 1:1 |
| `AllocationRecommendation` | Allocation DTO | 1:1 |
| `EvidencePackage` | Evidence DTO | 1:1 |
| `Snapshot` | Snapshot DTO | 1:1 |
| `ReplayResult` | Replay DTO | 1:1 |
| `DataSnapshot` (dataVersion/asOf/provider/quality/completeness) | Data-freshness DTO | 1:1 |
| `EnterpriseRuntime` Principal/Role/Audit | Auth/Admin DTO | 1:1 |
| `V2Observability` TraceRecord | Lineage DTO | 1:1 |
| `CloudHaRuntime` node health | Platform-health DTO | 1:1 |

**All mappings are structural (rename/serialize). No value transformation of investment semantics.**

## 5. Security

- **Principal** — derived from the authenticated session (new auth layer, Phase 3+).
- **Tenant** — from `Principal.tenantId`, propagated to contracts.
- **Role / Permission** — enforced by `EnterpriseRuntime` / `PlatformApi.ApiSecurity`.
- **Authorization** — the adapter enforces transport-level authz **in addition to** (never in place of) platform authz.
- **Audit** — transport-level audit events recorded; does not replace platform audit.

## 6. Semantic guarantee (the core rule)

```text
Transport transformation  ≠  Decision transformation
```

The adapter may change **how** intelligence is transported/serialized, but must **never** change **what** the intelligence is. Any transport mapping that would alter a verdict, score, ranking, threshold, confidence, weight, classification, snapshot, or replay semantics is **prohibited**.

## 7. Stop conditions

Implementing the transport layer must stop and request authorization if:
- a v2.0 contract must change to fit the transport,
- the adapter would alter investment semantics,
- a security boundary would be weakened,
- RBAC would be bypassed,
- deterministic logic would need recreation in the adapter.

## 8. Golden-Outputs Provenance Rule (FROZEN)

The **frozen expected-output artifacts** (`*expected-outputs-1.0.0.json`) are a governed source for the **certified reference/SNAPSHOT experience** (used by v3.0 Phases 5–7 to display certified golden pillar/confidence values).

**They are NOT the permanent live analytical source for future tenant production data.**

```text
LIVE / SNAPSHOT INPUT
        ↓
v1.1 CERTIFIED ENGINE
        ↓
GOVERNED OUTPUT
        ↓
v2.0 PLATFORM
        ↓
v3.0 UI
```

**NOT:**
```text
Golden expected-output
        ↓
Company UI
```

If live company analytics require a governed contract that does not yet exist, **STOP** rather than replacing it with a golden fixture. This distinction is preserved in every transport DTO's `provenance.dataSource`.

## Status

**TRANSPORT BOUNDARY — FROZEN (Phase 1, amended Phase 7).** Governs the transport/adapter implementation.
