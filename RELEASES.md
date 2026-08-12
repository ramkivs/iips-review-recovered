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
