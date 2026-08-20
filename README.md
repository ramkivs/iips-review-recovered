# IIPS Engineering Standards

# Repository Home Page (README)

**Repository:** iips-engineering-standards (recovered as `iips-review-recovered`)
**Version:** 1.0

---

# Welcome

Welcome to the **IIPS Engineering Standards** repository.

This repository contains the official engineering standards for the Institutional Investment Platform System (IIPS). These standards define the architecture, methodology, governance, and implementation guidance for institutional-grade investment research engines.

---

# Mission

Build a complete family of engineering standards that enable deterministic, explainable, replayable, and extensible investment analysis engines.

---

# Published Standards (delivered + frozen)

The following standards are implemented, certified, runtime-integrated, and UI-integrated. Per-engine evidence is recorded in `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`.

| Standard | Title | Status |
|----------|-------|--------|
| IES-005 | Sector Engine Calibration Platform | Production |
| IES-006.2A | Banking Sector Engine | Frozen v1.0 |
| IES-007 | Insurance Sector Engine | Frozen v1.0 |
| IES-008 | Capital Markets Sector Engine | Frozen v1.0 |
| IES-009 | Healthcare Sector Engine | Frozen v1.0 |
| IES-010 | Hospitality Sector Engine | Frozen v1.0 |
| IES-011 | Energy Sector Engine | Frozen v1.0 |
| IES-012 | Utilities Sector Engine | Frozen v1.0 |
| IES-013 | Consumer Sector Engine | Frozen v1.0 |
| IES-014 | Industrials Sector Engine | Frozen v1.0 |
| IES-015 | Technology Sector Engine | Frozen v1.0 |
| IES-016 | Telecommunications Sector Engine | Frozen v1.0 |
| IES-017 | Automobile Sector Engine | Frozen v1.0 |
| IES-020 | Materials & Metals Sector Engine | Frozen v1.0 |
| CSIP | Cross-Sector Intelligence Platform | Frozen v1.0 |

---

# Planned Standards

None — the sector-engine pipeline is exhausted (13 sector engines + CSIP delivered, certified, runtime-integrated, and UI-integrated).

---

# Repository Structure

```text
iips-engineering-standards/
├── iips-platform/            # runtime foundation + sector engines + release/report artifacts
├── frontend/                 # Program v3.0 React application + transport servers
├── iips-cross-sector/        # CSIP (cross-sector) engineering standards
├── ies-010-hospitality/      # per-sector standards (IES-010 … IES-015)
├── ies-011-energy/
├── ies-012-utilities/
├── ies-013-consumer/
├── ies-014-industrials/
├── ies-015-technology/
├── ies-016-telecommunications/
├── ies-017-automobile/
├── ies-020-materials-metals/
├── program-v1.1-certification/
├── governance/
└── docs/
```

---

# Engineering Principles

- Documentation First
- Deterministic Execution
- Configuration over Hard Coding
- Replay by Design
- Explainable Decisions
- Versioned Standards
- Independent Sector Methodologies

---

# Version Policy

- Repository: Semantic Versioning
- Engineering Standards: Independent versioning
- Calibration Profiles: Independent versioning
- Schemas: Independent versioning

---

# Release Workflow

1. Draft engineering standard
2. Engineering review
3. Publish standard
4. Arena implementation
5. Clarification review
6. Version update

---

# Contributing

Please read `CONTRIBUTING.md` before submitting changes.

---

# License

Apache License 2.0

---

# Status

This repository is under active development and serves as the canonical source for all IIPS engineering standards. Program v3.0 integration status (engines, runtime, UI, certification) is reconciled in `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`.
