# CSIP — Framework Integration Matrix

**Capability:** CSIP — Cross-Sector Intelligence Platform
**Program:** v1.1 Track 5
**Phase:** CSIP Phase 5 — Implementation Planning (per WP-1 approval recommendation)
**Artifact:** Framework Integration Matrix
**Version:** 1.0-draft
**Date:** 2026-08-08
**Purpose:** Map each framework capability to its reuse within CSIP. This is the framework-level counterpart to the Service Dependency Matrix, Implementation Traceability Matrix, and Reuse Report, and makes the WP-2 review largely evidence-based.

---

## 1. Framework capability → CSIP usage

| Framework Capability | CSIP Usage |
|---|---|
| **Manifest Loader** | Plugin registration — validate/load CSIP manifest (`platform.cross-sector`) |
| **Evidence Pipeline** | Portfolio evidence generation (Cross-Sector Evidence Model hierarchy) |
| **Replay** | Portfolio replay determinism (identical rankings/allocations/reports/diversification/evidence) |
| **Transport** | Portfolio DTO serialization (PDF-ready JSON reports, versioned DTO) |
| **Diagnostics** | Execution diagnostics (observational only, never influences behaviour) |
| **Qualification** | Capability registration / production-readiness gate |
| **Activation** | Plugin lifecycle (INACTIVE → READY → ACTIVE) |

## 2. CSIP service → framework service mapping

| CSIP Service | Framework service(s) reused |
|---|---|
| Ontology Mapper | (none — depends on frozen ontology metadata) |
| Portfolio Intelligence | Replay, Transport |
| Ranking | — |
| Allocation | — |
| Diversification | — |
| Opportunity | — |
| Correlation | — |
| Reporting | Transport (DTO serialization) |
| Evidence | Evidence Pipeline |
| Lifecycle (all) | Manifest Loader, Diagnostics, Qualification, Activation |

## 3. Integration acceptance surface (WP-2)

| # | Framework capability | CSIP integration acceptance |
|---|---|---|
| 1 | Manifest Loader | CSIP manifest validates + loads frozen |
| 2 | Evidence Pipeline | CSIP portfolio evidence builds + validates immutable |
| 3 | Replay | CSIP replay byte-identical (portfolio level) |
| 4 | Transport | CSIP portfolio DTO serializes deterministically |
| 5 | Diagnostics | CSIP diagnostics captured (observational only) |
| 6 | Qualification | CSIP qualifies when certified/replayable/regression-passed/deterministic |
| 7 | Activation | CSIP activates → ACTIVE |
| 8 | Coexistence | Five-plugin coexistence without branching |

## 4. Rule

All framework services are **reused unchanged**; no framework capability is re-implemented by CSIP. Any failure is an integration bug, not a framework change.

## 5. Status

**PLAN ARTIFACT — COMPLETE.** Framework integration surface is explicit and evidence-based for WP-2.
