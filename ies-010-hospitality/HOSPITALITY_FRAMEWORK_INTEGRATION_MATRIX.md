# IES-010 — Hospitality Framework Integration Matrix

**Standard:** IES-010 — Hospitality Sector Engine
**Purpose:** Documents, in one place, how Hospitality consumes each shared framework service — the framework-level counterpart to the Implementation Traceability Matrix.
**Date:** 2026-08-08

---

## 1. Framework capability → Hospitality usage

| Framework capability | Shared service | Hospitality usage | Inputs | Outputs | Deterministic guarantee | Replay participation | Evidence generated | Validation test |
|---|---|---|---|---|---|---|---|---|
| Manifest Loader | `ManifestLoader` | plugin registration | Hospitality manifest | frozen canonical manifest | immutable | no | manifest | WP2-ACC1 |
| Evidence Pipeline | `EvidencePipeline` | portfolio/hospitality evidence | engineId, recommendation, composite, confidence | evidence package | deterministic evidence | yes | evidence record | WP2-ACC2 |
| Transport | `Transport` | DTO serialization | engineId, rows | versioned DTO | deterministic checksum | yes | DTO | WP2-ACC3 |
| Diagnostics | `DiagnosticsService` | execution diagnostics | engineId, duration, statuses | diagnostics snapshot | observational | no | diagnostics | WP2-ACC4 |
| Qualification | `QualificationService` | production gate | certified, replay, regression, deterministic | qualification result | deterministic | yes | gate result | WP2-ACC4 |
| Activation | `ActivationService` | lifecycle | engineId, qualified | activation result | deterministic | yes | activation | WP2-ACC4 |
| Replay | `ReplayService` | replay reproduction | snapshotId | replay result | byte-identical | yes | replay evidence | WP2-ACC5 |
| Snapshot Store | `SnapshotStore` | snapshot storage | snapshot | append-only store | immutable | yes | snapshot | WP2-ACC5 |

## 2. Integration acceptance surface (WP-2)

| # | Framework capability | Hospitality acceptance |
|---|---|---|
| 1 | Manifest Loader | Hospitality manifest validates + loads frozen |
| 2 | Evidence Pipeline | Hospitality evidence builds + validates immutable |
| 3 | Transport | Hospitality DTO serializes deterministically |
| 4 | Diagnostics / Qualification / Activation | Hospitality qualifies + activates |
| 5 | Replay + Snapshot Store | Hospitality replay byte-identical |
| 6 | Coexistence | Six-plugin coexistence without branching |

## 3. Rule

All framework services are **reused unchanged**; no framework capability is re-implemented by Hospitality. Any failure is an integration bug, not a framework change.

## 4. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
