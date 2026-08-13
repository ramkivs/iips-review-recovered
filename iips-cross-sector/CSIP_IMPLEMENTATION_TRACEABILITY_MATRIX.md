# CSIP — Implementation Traceability Matrix

**Capability:** CSIP — Cross-Sector Intelligence Platform
**Program:** v1.1 Track 5
**Phase:** CSIP Phase 5 — Implementation Planning
**Artifact:** Traceability Matrix (per Phase 4 approval recommendation)
**Version:** 1.0-draft
**Date:** 2026-08-08
**Purpose:** Map every CSIP implementation component back to its frozen specification source, making implementation completeness objectively reviewable and directly verifiable against the frozen baseline.

---

## 1. Component → frozen source traceability

| Implementation Component | Frozen Source | Governing asset / matrix |
|---|---|---|
| **Ontology Mapper** | Universal Investment Ontology | Ontology Consistency Matrix (per-engine 8-dimension metadata) |
| **Portfolio Ranking Engine** | Cross-Sector Intelligence Standard (§5.2) | Portfolio Decision Trace Matrix (stage 3) |
| **Allocation Engine** | Allocation Decision Matrix | Allocation Rule Precedence Table (rule order) |
| **Diversification Engine** | Diversification Fixtures + Portfolio Expected Outputs | Diversification formula (`100 − concentration + (n−1)·3`) |
| **Replay Service** | Portfolio Replay Dataset | replay assertions: identical rankings/allocations/reports/diversification/evidence |
| **Evidence Builder** | Cross-Sector Evidence Model | Portfolio Decision Trace Matrix (stage 6) |
| **Portfolio Report Generator** | Portfolio Expected Outputs + Cross-Sector Evidence Model | Reporting Engine output shape (PDF-ready JSON) |
| **Opportunity Engine** | Cross-Sector Intelligence Standard (§5.5) | Top-N rationale via Evidence Model (fixtures at WP-3) |
| **Correlation Engine** | Cross-Sector Intelligence Standard (§5.6) | platform-metadata-only flags (no price correlation) |
| **Portfolio Intelligence Service** | Portfolio Expected Outputs | sector exposure, concentration, avg conviction/quality/risk |

## 2. Work package mapping

| Work Package | Components implemented |
|---|---|
| **WP-1 Platform Reuse Verification** | Platform/plugin-host integration (no CSIP-specific component) |
| **WP-2 Framework Integration** | Replay Service, Evidence Builder (framework services) |
| **WP-3 Cross-Sector Intelligence Engine** | Ontology Mapper, Portfolio Ranking Engine, Allocation Engine, Diversification Engine, Opportunity Engine, Correlation Engine, Portfolio Report Generator, Portfolio Intelligence Service |
| **WP-4 Validation, Replay, Regression, Release** | All components verified against frozen baseline |

## 3. Acceptance-to-source closure

| Acceptance target | Frozen source | Verified by |
|---|---|---|
| 6 portfolio expected outputs | Portfolio Expected Outputs | WP-4 regression (6/6) |
| 8 allocation fixtures | Allocation Decision Matrix + Allocation Fixtures | WP-4 fixture acceptance |
| 5 diversification fixtures | Diversification Fixtures | WP-4 fixture acceptance |
| Replay determinism | Portfolio Replay Dataset | WP-4 replay byte-identical |
| Zero engine/platform changes | Compatibility Statement | WP-1 + WP-4 reuse report |
| Evidence traceability | Cross-Sector Evidence Model | WP-3 evidence builder + WP-4 |

## 4. Completeness rule

Every component in §1 must have (a) a frozen specification source, (b) a governing matrix/precedence artifact, and (c) a WP-4 acceptance target. Any component lacking all three is flagged as incomplete before release.

## 5. Status

**ARCHITECTURE REVIEW/FREEZE-SUPPORTED** — this matrix is the implementation completeness checklist for CSIP.
