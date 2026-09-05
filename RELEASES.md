# IIPS Engineering Standards

# RELEASES

**Repository:** iips-engineering-standards  
**Document Version:** 1.0

---

# Purpose

This document is the official release ledger for the IIPS Engineering Standards repository.

Each published engineering standard shall receive a unique version, release date, and release status.

---

# Release Policy

Every release shall include:

- Version identifier
- Release date
- Engineering standard
- Release status
- Summary of changes
- Compatibility notes

---

# Release History

## v1.0.0 — Initial Repository Release

**Release Date:** August 2026

### Repository

Status: Released

Included:

- Repository infrastructure
- Governance documents
- Initial standards roadmap

---

## IES-005 v1.0

**Title:** Sector Engine Calibration Platform

Status: Production

Deliverables:

- Platform Architecture
- Calibration Framework
- Runtime Framework
- Governance
- Version Matrix
- Compatibility Matrix

Compatibility:

- Baseline platform release

---

## IES-006 v1.0 (FROZEN)

**Title:** Banking Sector Engine

Status: **FROZEN v1.0** (transitioned from Draft on 2026-08-06)

Deliverables (reference specification baseline):

- Banking methodology
- Banking metrics (v1 scope: BM-001…BM-019)
- Score engine
- Formula library
- Calibration Profile v1.0
- Decision engine
- Evidence framework
- Validation suite (7 fixtures)
- Worked example
- Engineering diagrams
- Reference Asset Governance
- Normative Calculation Appendix
- Arena implementation specification

Frozen reference assets:

- Calibration Profile `banking-calibration-1.0.0`
- Golden Reference Dataset `banking-golden-reference-1.0.0`
- Frozen Expected Outputs `banking-expected-outputs-1.0.0`
- Validation Fixtures `banking-validation-fixtures-1.0.0`

Depends on:

- IES-005 v1.0 (approved)
- IES-005.1 Engineering Contracts (approved)

Post-freeze rule: any methodology change requires a new calibration/profile version, not modification of the frozen baseline.

---

## IES-007 v1.0 (FROZEN)

**Title:** Insurance Sector Engine

Status: **FROZEN v1.0** (transitioned from Draft on 2026-08-06)

Deliverables (reference specification baseline):

- Insurance methodology (19 documents)
- Insurance metric library (IM-001…IM-008)
- Insurance score engine + formula library
- Insurance calibration profile v1.0
- Insurance decision engine + evidence framework
- Validation suite (8 fixtures)
- Insurance-vs-Banking comparison
- Sector Profile
- Data Dictionary + Reference Data Sources
- Reference Asset Governance + Normative Calculation Appendix
- Implementation Readiness Certificate

Frozen reference assets:

- Calibration Profile `insurance-calibration-1.0.0`
- Golden Reference Dataset `insurance-golden-reference-1.0.0`
- Frozen Expected Outputs `insurance-expected-outputs-1.0.0`
- Validation Fixtures `insurance-validation-fixtures-1.0.0`

Depends on:

- IES-005 v1.0 (approved)
- IES-005.1 Engineering Contracts (approved)
- Reuses `iips-platform` runtime/framework (no platform change required)

Post-freeze rule: any methodology change requires a new calibration/profile version.

---

## IES-008 v1.0 (FROZEN)

**Title:** Capital Markets Sector Engine

Status: **FROZEN v1.0** (transitioned from Draft on 2026-08-06)

Deliverables:

- Capital Markets methodology (19 documents)
- Metric library (CM-001…CM-008)
- Score engine + formula library
- Calibration profile v1.0
- Decision engine + evidence framework
- Validation suite (8 fixtures)
- Sub-sector / applicability / consistency / decision-trace matrices
- Reference Asset Governance + Normative Calculation Appendix
- Freeze Manifest + Compatibility Statement
- Implementation Readiness Certificate

Frozen reference assets:

- Calibration `capital-markets-calibration-1.0.0`
- Golden Dataset `capital-markets-golden-reference-1.0.0`
- Expected Outputs `capital-markets-expected-outputs-1.0.0`
- Validation Fixtures `capital-markets-validation-fixtures-1.0.0`

Depends on:

- IES-005 / IES-005.1 (approved)
- Reuses `iips-platform` (no platform change required)

Post-freeze rule: any methodology change requires a new calibration/profile version.

---

## IES-009 v1.0 (FROZEN)

**Title:** Healthcare Sector Engine

Status: **FROZEN v1.0** (transitioned from Draft on 2026-08-06)

Deliverables:

- Healthcare methodology (19 documents)
- Metric library (HC-001…HC-012)
- Score engine + clinical-quality constraint
- Calibration profile v1.0 + sub-sector profiles
- Decision engine (healthcare overrides + precedence)
- Evidence framework + validation suite (7 fixtures)
- 8 reference/architecture matrices
- Freeze Manifest + Compatibility Statement + Regression Baseline

Frozen reference assets:

- Calibration `healthcare-calibration-1.0.0`
- Golden Dataset `healthcare-golden-reference-1.0.0`
- Expected Outputs `healthcare-expected-outputs-1.0.0`
- Validation Fixtures `healthcare-validation-fixtures-1.0.0`

Depends on:

- IES-005 / IES-005.1 (approved)
- Reuses `iips-platform` (no platform change required)

Post-freeze rule: any methodology change requires a new calibration/profile version.

---

## program-v1.2.0 — 13-Engine Successor LTS (RELEASE CANDIDATE — PREPUBLICATION)

**Version identifier:** `program-v1.2.0` / `v1.2.0` (planned tag `program-v1.2.0` — TAG PLANNED, NOT YET CREATED)
**Release date:** **2026-09-05**
**Release status:** **RELEASE CANDIDATE — PREPUBLICATION** (not yet released, not yet tagged, not yet published) — **PUBLICATION APPROVED — AWAITING PUBLICATION EXECUTION** (sign-off `2026-09-05`, Engineering Reviewer `Ramki`, Repository Maintainer `Sai`, `Approved for Release`)
**Release type:** **MINOR successor** to `program-v1.1.0` (10-engine LTS) — `MINOR = New published standards / major additions` per `governance/VERSIONING_POLICY.md` and `RELEASES.md` Semantic Versioning
**Engineering standards / Engines:** `IES-006 Banking` · `IES-007 Insurance` · `IES-008 Capital Markets` · `IES-009 Healthcare` · `IES-010 Hospitality` · `IES-011 Energy` · `IES-012 Utilities` · `IES-013 Consumer` · `IES-014 Industrials` · `IES-015 Technology` · **`IES-016 Telecommunications (sector.telecom) v1.0 FROZEN`** · **`IES-017 Automobile (sector.auto) v1.0 FROZEN Option-A`** · **`IES-020 Materials & Metals (sector.materials) v1.0 FROZEN G1–G6`** — **13/13** `1.0.0` `FROZEN`, `calibrationVersion 1.0.0`

**Summary of changes:** Additive successor to `program-v1.1.0` — carries forward entire 10-engine deterministic foundation (platform contracts, CSIP `csip-v1.0.0`, Replay/Performance baselines, 10×10 Track 8 zero blocking) and adds three deferred sector engines that were FROZEN via D38 `3165065` (`45/45 MATCH`), opened via D42 `6d4dbc1` `A — OPEN ALL THREE`, implemented at `6a5d7cc1747a959a781a12c83336be73b71cb542` (33 files, Registry `10→13`), closed via Track 8 `eee39d3` **30/30 CONFORMANT**, certified via `E2E-025→029` at `e156cf6` (17/17, 3/3, 4/4, 4/4) and `E2E-030` delta at `67e89aa` (`0e362ed` fixup) **CERTIFIED — 13-ENGINE DELTA**, reconciled at `da01a82`. No methodology invented; D16 M1–M15, D17 M1–M15 + Option-A `44ba/ea22/c8ed` (left-to-right `for(i…) compositeRaw+=…` `r1h2e` no `sum()`), D20 M1–M15 + G1–G6 `5813…` preserved verbatim. Deterministic replay `68.4 Accumulate SNAP_FF2C2128` / `71.6 Buy SNAP_4E9D59AE` / `74.9 Buy SNAP_BC9B6426` byte-identical.

**Compatibility notes:** **Fully backward compatible** — existing 10 engines `IES-006…015` unchanged (`git diff 0`, `banking 4/4`, `technology 13/13`, `track8 10/10`), platform `git diff 0`, taxonomy `IT→015, Chemicals→014, Realty→015` held. **Breaking changes: none evidenced.** Migration = additive engine discovery (`GET /api/engines` now 13) and execution (`POST sector.telecom/auto/materials`); no destructive migration; rollback additive-only to `program-v1.1.0`.

**Dependencies:** No new external dependencies; reuses `iips-platform` runtime/framework/snapshot/replay/distributed + `CrossSectorEngine` unchanged.

**Historical preservation:** `program-v1.1.0` remains **historical 10-engine LTS** (`PROGRAM_v1.1_LTS_BASELINE.md` 10-engine FROZEN, `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` ISSUED, `RELEASE_NOTES_PROGRAM_v1.1.0.md` Tag `program-v1.1.0`) — **preserved verbatim, not rewritten**. This `v1.2.0` is additive successor.

**Release boundary:** This ledger entry is **PREPUBLICATION preparation** — tag `program-v1.2.0` **PLANNED, NOT YET CREATED**, GitHub Release **NOT YET PUBLISHED**, production **NOT PROMOTED**. Publication requires separate release-execution gate after `RELEASE_CHECKLIST.md` Phases 1–6 sign-off.

**Evidence:** `PROGRAM_v1.2_LTS_BASELINE.md` `v1.2.0` RC, `RELEASE_NOTES_PROGRAM_v1.2.0.md`, `PROGRAM_v1.2.0_COMPATIBILITY_AND_MIGRATION.md`, `PROGRAM_v1.2_FINAL_READINESS_CERTIFICATE.md` RC, all additive at `da01a82`.

---

# Upcoming Releases

| Version | Standard | Planned Status |
|---------|----------|----------------|
| v1.1 | IES-005 | Maintenance |

---

# Semantic Versioning

Repository versions:

- MAJOR — Breaking governance or repository changes
- MINOR — New engineering standards
- PATCH — Documentation corrections and non-breaking improvements

Engineering standards maintain independent version histories.

---

# Release Approval Checklist

A release is approved only after:

- Engineering review completed
- Documentation finalized
- Validation passed
- Compatibility assessed
- Version assigned
- Release notes updated

---

# Engineering Summary

This document is the canonical record of published releases for the IIPS Engineering Standards repository.
