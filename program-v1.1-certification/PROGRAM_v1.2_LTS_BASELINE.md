# Program v1.2 — LTS Baseline (Successor to v1.1.0 — 13-Engine Release Candidate)

**Program:** IIPS Engineering Standards — Program v1.2
**Milestone:** Program v1.2 Final Certification — Successor LTS Baseline (13-Engine)
**Document type:** CONSTITUTION — successor to `PROGRAM_v1.1_LTS_BASELINE.md` (v1.1.0, 10-engine)
**Version:** `v1.2.0` — **RELEASE CANDIDATE — PREPUBLICATION** (additive successor, not yet tagged/published)
**Date:** 2026-09-05 (preparation date; release date to be set at publication gate)
**Canonical commit (preparation baseline):** `da01a82c67df9e1043d32c2855c1898be57a5509` (HEAD == origin/main, clean)
**Predecessor:** `program-v1.1.0` (`c65d533` recovered LTS + `PROGRAM_v1.1_LTS_BASELINE.md` 10-engine FROZEN, `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` ISSUED, `RELEASE_NOTES_PROGRAM_v1.1.0.md` Tag `program-v1.1.0`)
**Release model:** **MINOR successor** — `v1.1.0` → `v1.2.0` per `governance/VERSIONING_POLICY.md` (MINOR = New published standards / major additions) and `RELEASES.md` (MINOR = New engineering standards). `v1.1.1` PATCH rejected (PATCH = Documentation fixes only).
**Status:** **RELEASE CANDIDATE — PREPUBLICATION** — additive successor baseline prepared; not yet released, not yet tagged, not yet published. Historical `program-v1.1.0` remains the 10-engine LTS and is not rewritten.

---

## 1. Purpose

Program v1.2 is the **MINOR successor** to Program v1.1.0 LTS. It carries forward the entire `v1.1.0` deterministic investment-intelligence foundation (platform contracts, 10 sector engines, CSIP, replay/evidence guarantees) and **additively certifies three deferred sector engines** that were `FROZEN` via D38, opened via D42, implemented at `6a5d7cc`, closed via Track 8, and certified via `E2E-025→029` and `E2E-030 delta`:

- D38 `3165065` — FROZEN evidence baseline adopted (13-sector replay `v1.1.0`, `45/45 MATCH`)
- D41 `ed97606` — Track 8 Architecture Audit Addendum `CURRENT/CERTIFIED` (`APPROVED FOR OPENING — IES-016/017/020`, invariants 3–10 CONFORMANT, 1–2 NOT VERIFIABLE)
- D42 `6d4dbc1` — Opening Authority Decision `A — OPEN ALL THREE` (GATE0 lifted for 016/017/020, `EngineRegistry 10→13` authorized)
- Implementation `6a5d7cc1747a959a781a12c83336be73b71cb542` — 10→13, Option-A `44ba/ea22/c8ed` preserved, G1–G6 `5813…` preserved
- Track 8 Closure `eee39d3cdfc7c1e53b82a1bc4446761a5ff6af63` — 10 invariants ×3 engines **30/30 CONFORMANT** (1–2 NOT VERIFIABLE → CONFORMANT)
- E2E-025→029 at `e156cf6a7b33acd727d1d64c0e8021c0bd67343f` — 17/17, 3/3, 4/4, 4/4 **all PASS**, `68.4 Accumulate / 71.6 Buy / 74.9 Buy` deterministic
- E2E-030 delta at `67e89aa52dabb5819e5f7af9c83787546dafdfb7` (fixup `0e362ed`) — **CERTIFIED — 13-ENGINE DELTA**
- D40 reconciliation at `da01a82c67df9e1043d32c2855c1898be57a5509` — control-plane reconciled to 13-engine certified scope, historical 10-engine LTS preserved, *does not imply release/tag/production authorization*

This document is the **successor constitution** that defines the 13-engine LTS surface for `v1.2.0` without rewriting the `v1.1.0` constitution.

---

## 2. Frozen v1.2 baseline — successor LTS surface (additive)

| Category | Frozen artifact(s) — v1.2.0 |
|---|---|
| Platform contracts | IES-005, IES-005.1 (plugin contract, runtime, framework, snapshot, replay, evidence, manifest, transport, diagnostics, qualification, activation) — **unchanged from v1.1.0** |
| Platform capabilities | ARM, Performance baseline (IES-005.2), Observability contract (IES-005.3), CI/CD gates (IES-005.4), CSIP `csip-v1.0.0` (sector-neutral, unchanged) |
| **13 released sector engines** | `banking-engine-v1.0.0` · `insurance-engine-v1.0.0` · `capital-markets-engine-v1.0.0` · `healthcare-engine-v1.0.0` · `hospitality-engine-v1.0.0` · `energy-engine-v1.0.0` · `utilities-engine-v1.0.0` · `consumer-engine-v1.0.0` · `industrials-engine-v1.0.0` · `technology-engine-v1.0.0` · **`telecommunications-engine-v1.0.0`** · **`automobile-engine-v1.0.0`** · **`materials-metals-engine-v1.0.0`** |
| Exact engine list (IES → engineId) | IES-006 `sector.banking` 1.0.0 · IES-007 `sector.insurance` 1.0.0 · IES-008 `sector.capital-markets` 1.0.0 · IES-009 `sector.healthcare` 1.0.0 · IES-010 `sector.hospitality` 1.0.0 · IES-011 `sector.energy` 1.0.0 · IES-012 `sector.utilities` 1.0.0 · IES-013 `sector.consumer` 1.0.0 · IES-014 `sector.industrials` 1.0.0 · IES-015 `sector.technology` 1.0.0 · **IES-016 `sector.telecom` 1.0.0** · **IES-017 `sector.auto` 1.0.0** · **IES-020 `sector.materials` 1.0.0** — all `FROZEN`, `calibrationVersion 1.0.0` |
| Sector reference assets | Calibration profiles, golden datasets, expected outputs, replay datasets, validation fixtures, ontology metadata — **all frozen per sector** (10 LTS + 3 new) |
| **Program v1.2 Replay Baseline** | `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` **v1.1.0 13-sector** carried forward as frozen evidence (D38 `45/45 MATCH`) — to be versioned as `PROGRAM_v1.2_REPLAY_BASELINE.json v1.2.0` or addendum at publication (additive, not silent edit of v1.1.0 historical file) |
| **Program v1.2 Performance Baseline** | `program-v1.1-certification/PROGRAM_v1.1_PERFORMANCE_BASELINE.json` carried forward (regression comparison) |
| Observability contract | Common `ObservabilityPipeline` (IES-005.3) — unchanged |
| CSIP behavior | Sector-neutral pipeline (common schema/registry/retrieval/intelligence surface) — unchanged, verified for 13 |
| CI/CD gates | 8 stages, 5 hard gates, mutation-sensitive, frozen-oracle validation — unchanged |
| Architecture invariants | **13×10 audit** — Track 8 10 invariants ×3 new engines **30/30 CONFORMANT**, existing 10×10 unchanged |
| Accepted legacy deviations | 4 findings (v2.0-R1..R4) frozen as known v1.1 characteristics — carried forward unchanged |

**IES-016/017/020 frozen evidence references (D38 FROZEN 2026-09-04):**

- **IES-016 Telecommunications** — `ies-016-telecom/IES-016_FREEZE_MANIFEST.json` — D16 M1–M15 v1.0, `telecommunications-calibration-1.0.0`, golden `3cfb9d93f545d45d749cc48c88e25bab23075b013911ea7751212b49f1168ee0`, replay `92be99526e498d1378d0a158c42009c05bdc24f181e908d28ff009dae7fd34ca`, oracle `c7c0b0d70390a2f8cc6073988361b8ab84fdc559d9134e9067392f0719c8e01a`, ontology 8/8, `45/45 MATCH`
- **IES-017 Automobile** — `ies-017-auto/IES-017_FREEZE_MANIFEST.json` — D17 M1–M15 v1.0 + Option-A left-to-right re-frozen `44ba141957eb78654bce0fe3320a709a812291f35b5b7b6a5f342bfe54f27a25 / ea22807925694aa3e2b97cd2f1b1990cc4235e4e19023b31ae43bdc55314d81d / c8ed26c58dc6d2f7db71caa4d8d959cae843ddff0b9dd4e072856ed2e952428f` triple MATCH, `automobile-calibration-1.0.0` `IES-017 v1.0 Option-A`, `for(i…) compositeRaw+=pillarValues[i]*weightValues[i]` `r1h2e` no `sum()`
- **IES-020 Materials & Metals** — `ies-020-materials/IES-020_FREEZE_MANIFEST.json` — D20 M1–M15 v1.0 + G1–G6 v1.0 `5813060b1440c2ec61a947eb1e20b920ecb0f540699819b17bf718868e181e63`, `materials-metals-calibration-1.0.0`, expected `56a6ad197640c9c9f3f922ffca3897ddd006a7682099f01347cfaa6e0d754025` via `9d920fa987b7d042183139dd1fca5634d605f40c5ebcc92f486525c265dde446`, segments `steel/cement/aluminium/diversified`, archetype `integrated 1.0 / producer 1.1`, 8 metrics, `r1h2e` lower-inclusive/upper-exclusive, ontology 8/8

**D42 authority chain:** `23b4b40295fe… (1700 entries, G:\IIPS\historical-package)` → D36 ACCEPTED → D38 `3165065` FROZEN → D41 `ed97606` CURRENT/CERTIFIED → D42 `6d4dbc1` `A — OPEN ALL THREE` → `6a5d7cc` IMPLEMENTATION → `eee39d3` TRACK 8 CLOSURE → `e156cf6` E2E-025→029 → `67e89aa/0e362ed` E2E-030 delta → `da01a82` D40 reconciliation → **this v1.2.0 baseline**.

---

## 3. Determinism / replay guarantees (must hold in v1.2.0 — preserved from v1.1.0)

- Injectable `Clock`/`IdProvider` only (`fixed 2026-08-09T00:00:00.000Z` + `deterministic`); no `Math.random`/`Date.now` in business logic.
- Replay-identical: same input + contract version + calibration version + runtime configuration → identical output + evidence + metadata + replay.
- Round-half-to-even at composite only; lower-inclusive / upper-exclusive boundaries.
- Frozen oracle discipline: reference assets are authoritative test oracle; implementation disagreement = implementation defect.
- Verified at `eee39d3`/`e156cf6`/`67e89aa`: `sector.telecom 68.4 Accumulate SNAP_FF2C2128`, `sector.auto 71.6 Buy SNAP_4E9D59AE` (Option-A left-to-right), `sector.materials 74.9 Buy SNAP_BC9B6426` — each `same requestId → same SNAP/ev_` + `byteIdentical` via ReplayService.

---

## 4. Accepted legacy deviations (carried forward unchanged)

| # | Deviation | Classification | v2.0 remediation |
|---|---|---|---|
| 1 | Ontology exposure inconsistency (4 v1.0 engines rely on CSIP mapper) | 🟡/🟠 | v2.0-R1 |
| 2 | CSIP `engineVersions` evidence staleness | 🟠 | v2.0-R2 |
| 3 | Calibration-version exposure (only Technology exposes in metadata) | 🟡/🟠 | v2.0-R3 |
| 4 | Banking frozen-asset layout (`frozen-assets/` subdir) | 🟡 | v2.0-R4 |

No new deviations introduced by IES-016/017/020 (ontology 8/8 explicit, calibrationVersion 1.0.0 exposed, CSIP sector-neutral verified).

---

## 5. The v1.2 ↔ v2.0 boundary (inherits v1.1 MUST/MAY)

### MUST PRESERVE in v2.0 (deterministic investment-intelligence core — unchanged)

```
Input → Contract → Calibration → Deterministic Engine → Evidence → Snapshot → Replay
```
- Sector-engine isolation
- Common runtime / plugin contract
- Frozen-oracle discipline
- Deterministic replay
- Evidence traceability
- CSIP sector neutrality
- No silent methodology changes
- Backward-compatibility policy

### MAY CHANGE in v2.0 (legitimate evolution — unchanged list)

- Distributed execution, Cloud/Kubernetes, Live market-data, Enterprise tenancy/RBAC, AI assistance (never replacing scoring), Plugin marketplace, Workflow designer, Public SDK/API, Uniform ontology exposure (v2.0-R1), Uniform calibration-version metadata (v2.0-R3), CSIP `engineVersions` modernization (v2.0-R2)

v1.2.0 adds no new MAY CHANGE items; it is strictly additive within MUST PRESERVE.

---

## 6. Versioning & rollback rules (v1.2.0)

- Any methodology/calibration change requires a **new version**, never modification of frozen baseline (preserved from `PROGRAM_v1.1_LTS_BASELINE.md` §6).
- Breaking changes require a **major version** + compatibility review — **none evidenced** for `v1.1.0→v1.2.0` (10-engine behavior `git diff 0`, Track 8 10×10 pass, compatibility assessment: backward compatible).
- Rollback is **additive-only**; released engines and frozen assets are **never modified destructively**; `program-v1.1.0` remains historical 10-engine LTS.
- Program v1.2 Replay/Performance baselines are successor controlled artifacts (v1.2.0) that supersede v1.1.0 for 13-engine regression, while v1.1.0 baselines remain preserved for historical comparison.
- **Tag:** `program-v1.2.0` — **PLANNED, NOT YET CREATED** (publication gate).

---

## 7. Compatibility & Migration (v1.1.0 → v1.2.0)

**Backward compatibility:** **Fully backward compatible.** Existing 10 engines `IES-006…015` unchanged (`git diff --stat HEAD -- iips-platform/src/sector-engines/banking…technology` 0, `technology-acceptance 13/13 PASS`, `banking-acceptance 4/4 PASS`). Existing `CrossSectorEngine` 10-engine aggregation unchanged (`holdings 10` when run with 10 alone). No taxonomy change (`IT→015, Chemicals→014, Realty→015` held, `422` guard).

**Breaking changes:** **None evidenced.** No platform branching (`git diff` framework/runtime/snapshot/replay/distributed 0), no cross-sector contamination, no CSIP logic change.

**Migration guidance:** **Additive availability** — consumers may discover 3 new engines via `GET /api/engines` (now 13) and call `POST /api/engines/sector.{telecom,auto,materials}/execute` — existing callers with 10-engine pinning remain valid. No destructive migration, no config change required, no data migration.

**Affected standards:** `IES-016 v1.0`, `IES-017 v1.0 (Option-A)`, `IES-020 v1.0 (G1–G6)` added as `FROZEN v1.0` — each independent lifecycle per `VERSIONING_POLICY.md` (no version change to IES-005…015).

**Updated dependencies:** None — reuses `iips-platform` runtime/framework/snapshot/replay/distributed unchanged.

---

## 8. Certification aggregate for v1.2.0

| Track / Gate | Evidence | Status |
|---|---|---|
| D38 Freeze | `ies-016/017/020` manifests `45/45 MATCH`, `PROGRAM_v1.1_REPLAY_BASELINE.json` 13-sector v1.1.0 | **FROZEN 2026-09-04** |
| D41 Track 8 Addendum | `PROGRAM_v1.1_TRACK8_ARCHITECTURE_AUDIT_ADDENDUM.md` `CURRENT/CERTIFIED` 3–10 CONFORMANT | **APPROVED FOR OPENING** |
| D42 Opening Authority | `IIPS_v3.0_OPENING_AUTHORITY_DECISION.md` `A — OPEN ALL THREE` | **AUTHORIZED** |
| Implementation | `6a5d7cc` 33 files, Registry 13, Adapter 13 | **COMPLETE** |
| Track 8 Closure | `PROGRAM_v1.1_TRACK8_IMPLEMENTATION_CLOSURE.md` `30/30 CONFORMANT` | **CERTIFIED** |
| E2E-025 Engine API | `engine-api-integration` 17/17 PASS (13× POST COMPLETED MATCH) | **PASS** |
| E2E-026 Product | `csip-product-e2e` 3/3 PASS (holdings 13, avgConviction 72.9) | **PASS** |
| E2E-027 Replay | `replay-e2e` 4/4 + `evidence-provenance` 4/4 + live determinism | **PASS** |
| E2E-028 Cross-Sector | 13-engine ranking contains Telecommunications/Automobile/Materials & Metals, no branching | **PASS** |
| E2E-029 Provenance | Chain `D38→D41→D42→6a5d7cc→eee39d3→025→029` hashes `3cfb/92be`, `44ba/ea22/c8ed`, `56a6/5813` | **PASS** |
| E2E-030 Delta | `IIPS_v3.0_E2E-030_CERTIFICATION.md` §12–§13 `13-ENGINE DELTA CERTIFIED` at `67e89aa` | **CERTIFIED** |
| D40 Reconciliation | `da01a82` 62 lines, 13-engine current certified scope reconciled | **RECONCILED** |

---

## 9. Historical preservation

**`program-v1.1.0` remains the historical 10-engine LTS** — `PROGRAM_v1.1_LTS_BASELINE.md` (10-engine), `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` (`ISSUED` 10/10), `PROGRAM_v1.1_FINAL_CERTIFICATION_STATUS.md` (`CLOSED / LTS`), `RELEASE_NOTES_PROGRAM_v1.1.0.md` (Tag `program-v1.1.0`) — **all preserved verbatim, not rewritten**. This `v1.2.0` baseline is **additive successor**, not replacement. Rollback remains additive-only.

Historical 10-engine replay baseline (`program-v1.1.0` era) remains preserved for comparison; the 13-sector replay file is a successor artifact (version `1.2.0` at publication) that does not retroactively claim `program-v1.1.0` was 13-engine.

---

## 10. Status

**`v1.2.0` — RELEASE CANDIDATE — PREPUBLICATION**

- Successor LTS baseline **PREPARED** at `da01a82` (additive, not yet released).
- Awaiting `RELEASE_CHECKLIST.md` Phase 1–6 sign-off (Governance §9), `RELEASES.md` ledger entry, `RELEASE_NOTES_PROGRAM_v1.2.0.md`, `PROGRAM_v1.2.0_COMPATIBILITY_AND_MIGRATION.md`, `PROGRAM_v1.2_FINAL_READINESS_CERTIFICATE.md`, tag `program-v1.2.0` (PLANNED), GitHub Release publication (publication gate).
- **Not yet tagged, not yet published, not yet promoted.** D40 reconciliation explicitly withholds release/tag/production authorization until publication gate.

---

*Additive successor constitution — does not rewrite `program-v1.1.0`, does not invent methodology, does not alter D16/D17/D20, preserves Option-A `44ba/ea22/c8ed` and G1–G6 `5813…` verbatim.*
