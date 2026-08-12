# CSIP — Implementation Plan

**Capability:** CSIP — Cross-Sector Intelligence Platform
**Program:** v1.1 Track 5
**Milestone:** CSIP Phase 5 — Implementation Planning (gated work packages)
**Status:** PLAN — execution roadmap (not code)
**Date:** 2026-08-08
**Baseline:** IES-005 + IES-005.1 (contracts) + four released engines v1.0 (Banking/Insurance/Capital Markets/Healthcare, immutable) + **CSIP v1.0.0 (frozen)**
**Reuse:** `iips-platform` runtime/framework (validated by four sectors — no platform change)

---

## 0. Guiding rules

- Two-repository separation (`iips-engineering-standards` = truth/frozen; `iips-platform` = implementation).
- Frozen spec is the target; deviations are implementation bugs.
- CSIP is a **platform plugin** consuming `SectorPlugin` outputs — never recompute/duplicate sector scoring.
- Reuse, don't rebuild. Determinism (injectable Clock/IdProvider only; no randomness). Staged & gated. DoD per WP.
- Produce `CSIP_IMPLEMENTATION_REUSE_REPORT.md` at completion.
- Zero changes to the four sector engines and zero runtime/framework changes (unless a defect is proven).

---

## WP-1 — Platform Reuse Verification (evidence gathering)

**Objective:** Confirm CSIP registers/executes as a platform plugin via the existing runtime with **zero platform changes**.

| Task | Notes |
|---|---|
| 1.1 Verify `SectorPlugin` + `PluginLoader` host the CSIP plugin | Reuse unchanged |
| 1.2 Verify runtime/registry/snapshot/replay accept the CSIP plugin | Reuse unchanged |
| 1.3 Confirm CSIP consumes engine **published outputs** (via ontology metadata) | Black-box contract; no engine internals |
| 1.4 Confirm no platform or engine modification | Contracts Review concluded No change |

**Deliverables:** CSIP plugin skeleton registered/executed via existing runtime; reuse evidence.
**Acceptance:** CSIP hosts with zero platform changes; prior 4-sector regression unchanged; `tsc --strict` clean.
**Risk:** Low (validated 4×).

---

## WP-2 — Framework Integration (verify reuse)

**Objective:** Wire CSIP through existing framework services — all reused.

| Task | Notes |
|---|---|
| 2.1 Manifest loading | `ManifestLoader` reuse |
| 2.2 Evidence pipeline | `EvidencePipeline` reuse (Evidence Builder) |
| 2.3 Transport | generic DTO |
| 2.4 Diagnostics/Qualification/Activation | reuse |
| 2.5 Replay service | `replay` reuse — portfolio-level replay determinism |
| 2.6 Five-plugin coexistence | banking + insurance + capital markets + healthcare + CSIP |

**Deliverables:** CSIP registered through all framework services; coexistence regression.
**Acceptance:** same services serve all five plugins without branching; `tsc --strict` clean; tests pass.
**Risk:** Low.

---

## WP-3 — Cross-Sector Intelligence Engine (CSIP-specific)

**Objective:** Implement the 7 CSIP core services using **frozen assets only**, consuming normalized engine outputs via the ontology.

| Task | Notes |
|---|---|
| 3.1 Ontology Mapper | Per-engine 8-dimension metadata → normalized dimensions (Ontology Consistency Matrix) |
| 3.2 Portfolio Intelligence Service | sector exposure, concentration, diversification score, avg conviction/quality/risk (Expected Outputs) |
| 3.3 Cross-Sector Ranking Engine | rank by conviction desc then sector asc (deterministic tie-break) |
| 3.4 Capital Allocation Engine | Allocation Rule Precedence Table + Allocation Decision Matrix (6 strategies) |
| 3.5 Diversification Analyzer | concentration + single-factor exposure; `100 − concentration + (n−1)·3` (Diversification Fixtures) |
| 3.6 Opportunity Engine | Top-10/25/50 + rationale via Evidence Model (**close defined Top-N fixture gap**) |
| 3.7 Correlation Engine | platform-metadata-only flags (macro/interest-rate/regulatory/cyclicality) — no price correlation |
| 3.8 Reporting Engine | Executive/IC/Portfolio/Allocation/Sector reports — PDF-ready JSON (Expected Outputs shape) |
| 3.9 Evidence Builder | Cross-Sector Evidence Model hierarchy (Recommendation → Sector Contribution → Portfolio Impact → Allocation Rationale → Diversification Impact) |

**Deliverables:** CSIP plugin (`iips-cross-sector/portfolio|ranking|allocation|diversification|opportunity|correlation|reporting`) reproducing frozen portfolio outputs; consumes only normalized dimensions.
**Acceptance:** **Golden Dataset Reproducibility (6/6)**; **Replay Determinism (PF-05)**; **8 allocation fixtures**; **5 diversification fixtures**; **Evidence Completeness**; **Zero engine/platform changes**. `tsc --strict` clean; tests pass.
**Risk:** Medium (frozen assets authoritative; deterministic formulas verified).

---

## WP-4 — Validation, Replay, Regression, Independent Verification, Release

**Objective:** Prove implementation matches the frozen baseline + release.

| Task | Notes |
|---|---|
| 4.1 Portfolio golden regression | vs `portfolio-expected-outputs-1.0.0` (6/6) |
| 4.2 Replay verification | identical rankings/allocations/reports/diversification/evidence (PF-05) |
| 4.3 Fixture acceptance | 8 allocation + 5 diversification fixtures |
| 4.4 Traceability + reuse report | frozen spec → implementation → test (`CSIP_IMPLEMENTATION_TRACEABILITY_MATRIX.md`) + `CSIP_IMPLEMENTATION_REUSE_REPORT.md` |
| 4.5 Independent verification | clean-clone reproduction of all portfolio outputs |
| 4.6 Release candidate + release | tag `csip-v1.0.0` |

**Deliverables:** regression report, replay report, fixture acceptance, traceability, reuse report, release candidate, final readiness report, release.
**Acceptance:** 100% match vs frozen outputs; replay byte-identical; all fixtures; independent clean-clone reproduction; release candidate.
**Risk:** Low–Medium.

---

## Execution order & gating

```
WP-1 Reuse → (approve) → WP-2 Framework → (approve) → WP-3 Engine → (approve) → WP-4 Release → (approve) → Release
```

Each WP stops for approval. WP-1/WP-2 are evidence/reuse verification; **nearly all new engineering effort is in WP-3** (per direction), since CSIP-specific logic (7 services) is implemented there.

## Reuse expectation

WP-1/WP-2 are primarily **evidence gathering + reuse verification**; platform/engine modifications = **0** (recorded in reuse report). All new engineering effort is CSIP-specific in WP-3.

## Out of scope

No new sector methodology, no edits to frozen assets, no engine or platform changes, no price-based correlation, no performance optimization without approval.

## Status

**PLAN COMPLETE** — awaiting approval before WP-1 execution.
