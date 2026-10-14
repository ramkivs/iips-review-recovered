# IIPS Engineering Standards

# Repository Home Page (README)

**Repository:** iips-engineering-standards  
**Version:** 1.0

---

# Welcome

Welcome to the **IIPS Engineering Standards** repository.

This repository contains the official engineering standards for the Institutional Investment Platform System (IIPS). These standards define the architecture, methodology, governance, and implementation guidance for institutional-grade investment research engines.

---

# Mission

Build a complete family of engineering standards that enable deterministic, explainable, replayable, and extensible investment analysis engines.

---

# Published Standards

| Standard | Title | Status |
|----------|-------|--------|
| IES-005 | Sector Engine Calibration Platform | Production |
| IES-006 | Banking Sector Engine | Draft v1.0 |

> **Current LTS vs Release Candidate (as of `da01a82` 13-engine certified `main`):**
> - **Historical LTS `program-v1.1.0` = 10-engine LTS** (`IES-006…015`, `PROGRAM_v1.1_LTS_BASELINE.md` FROZEN, `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` ISSUED 2026-08-09, Tag `program-v1.1.0`) — **preserved verbatim**.
> - **Successor `v1.2.0` = 13-engine certified release — PUBLISHED 2026-09-05** (`IES-006…015 + IES-016/017/020`, `PROGRAM_v1.2_LTS_BASELINE.md` `v1.2.0` RC, `E2E-030` 13-engine delta at `67e89aa`, D40 `da01a82` reconciled) — **TAG `program-v1.2.0` CREATED, GitHub Release PUBLISHED 2026-09-05** (`v1.2.0` remains an *additive successor*; `program-v1.1.0` stays the historical 10-engine LTS, unrewritten). Verified against remote state on 2026-10-14: annotated tag `program-v1.2.0` exists (tag object `4ec8812e…` → commit `5decdca9…`) and the GitHub Release `program-v1.2.0` is published at <https://github.com/ramkivs/iips-review-recovered/releases/tag/program-v1.2.0> (`publishedAt` 2026-09-05T06:11:08Z), covering the 13 certified sector engines (IES-006…015, 016, 017, 020). *Additive status correction (`CV-CORR-04`, 2026-10-14): this line read "PREPUBLICATION / TAG PLANNED, NOT YET CREATED" while publication was pending; the surrounding historical text is preserved verbatim and no claim is re-dated.* See `program-v1.1-certification/RELEASE_NOTES_PROGRAM_v1.2.0.md` and `PROGRAM_v1.2.0_COMPATIBILITY_AND_MIGRATION.md`.

---

# Planned Standards

> **Status note (`CV-CORR-04`, 2026-10-14).** The standards listed below were planned at the time of writing. IES-010 Hospitality, IES-011 Energy, IES-012 Utilities, IES-013 Consumer, IES-014 Industrials, IES-015 Technology, IES-016 Telecommunications, IES-017 Automobile and IES-020 Materials & Metals are now **established and certified** — the authoritative id → title → freeze-manifest mapping is `iips-platform/src/integration/EngineRegistry.ts`, and each has a frozen directory `ies-0xx-*/IES-0xx_FREEZE_MANIFEST.json`. Numbers/titles in this historical table predate the freeze renumbering and are preserved as written.


- IES-007 — Insurance Sector Engine
- IES-008 — Capital Markets Sector Engine
- IES-009 — Healthcare Sector Engine
- IES-010 — Hospitality Sector Engine
- IES-011 — Utilities Sector Engine
- IES-012 — Energy Sector Engine
- IES-013 — Information Technology Sector Engine
- IES-014 — Chemicals Sector Engine
- IES-015 — Realty Sector Engine
- IES-016 — Telecommunications Sector Engine
- IES-017 — Automobile Sector Engine
- IES-018 — Consumer Sector Engine
- IES-019 — Industrials Sector Engine
- IES-020 — Materials & Metals Sector Engine

---

# Repository Structure

```text
iips-engineering-standards/
├── ies-005-platform/
├── ies-006-banking/
├── shared/
└── implementations/
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

This repository is under active development and serves as the canonical source for all IIPS engineering standards.
