# CSIP — Service Dependency Matrix

**Capability:** CSIP — Cross-Sector Intelligence Platform
**Program:** v1.1 Track 5
**Phase:** CSIP Phase 5 — Implementation Planning (per Phase 5 approval recommendation)
**Artifact:** Service Dependency Matrix
**Version:** 1.0-draft
**Date:** 2026-08-08
**Purpose:** Document the **runtime dependency** graph among CSIP services (complements the Traceability Matrix, which documents component→source traceability). Prevents accidental circular dependencies and enables future optimization/parallel execution.

---

## 1. Service dependency graph

| CSIP Service | Depends On | Direction (→) |
|---|---|---|
| **Ontology Mapper** | Universal Investment Ontology (frozen) | leaf — no CSIP service dependency |
| **Portfolio Intelligence** | Published Engine Outputs (via Ontology Mapper) | Ontology Mapper |
| **Ranking** | Ontology Mapper (normalized dimensions) | Ontology Mapper |
| **Allocation** | Ranking + Allocation Rules (Decision Matrix / Precedence Table) | Ranking, Allocation Rules |
| **Diversification** | Portfolio Intelligence (exposure/concentration) | Portfolio Intelligence |
| **Opportunity** | Ranking + Diversification | Ranking, Diversification |
| **Correlation** | Published Engine Outputs (platform metadata only) | Ontology Mapper (metadata) |
| **Reporting** | All previous services | Portfolio Intelligence, Ranking, Allocation, Diversification, Opportunity, Correlation |
| **Evidence** | Entire execution pipeline | all services (assembles hierarchy last) |

## 2. Dependency rules (circular-dependency prevention)

1. **Acyclic by construction:** the graph is a strict DAG — every edge points forward (Ontology Mapper → … → Reporting → Evidence). No service depends on Reporting or Evidence.
2. **Ontology Mapper is the root:** no CSIP service may be a dependency of the Ontology Mapper (it depends only on the frozen ontology metadata).
3. **Evidence is the terminal node:** it depends on every service and is depended on by none.
4. **Reporting is the aggregation point:** it may depend on all analysis services but never feed back into them.
5. **Engine outputs are external leaves:** all CSIP services depend on normalized engine outputs via the ontology; no service writes back to an engine.

## 3. Execution ordering (for deterministic sequential execution)

```
1. Ontology Mapper
2. Portfolio Intelligence  (and in parallel-independent branches: Correlation)
3. Ranking
4. Diversification
5. Allocation
6. Opportunity
7. Reporting
8. Evidence
```

## 4. Parallel-execution opportunities (future)

Given the DAG, the following are independently parallelizable (no inter-dependency):
- Portfolio Intelligence + Correlation (both depend only on Ontology Mapper)
- Ranking + Diversification (both depend on prior stages, not each other)
- Allocation depends on Ranking; Opportunity depends on Ranking + Diversification.

## 5. Status

**PLAN ARTIFACT — COMPLETE.** Dependency graph is acyclic; ordering and parallelism are well-defined. Integrates with the Traceability Matrix for the implementation completeness picture.
