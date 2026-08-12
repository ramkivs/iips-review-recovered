# IES-012 — Utilities Sector Engine

## Document 14 — REFERENCE ASSET GOVERNANCE

**Document ID:** IES-012-D14
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Governance rules for utilities reference assets (Phase 3): golden dataset, expected outputs, fixtures, replay dataset.

# 1. Governance rules

- All reference assets are **deterministic + versioned**.
- Frozen assets are immutable; changes require a new version, never mutation.
- Calibration is segment-scoped and versioned (`utilities-calibration-1.0.0`).
- Every asset carries provenance (source, version, SHA-256).

# 2. Lifecycle

Specification → Reference Assets → Architecture Review → Freeze → Implementation → Validation → Independent Verification → Release.

# 3. Post-freeze rule

Any methodology/calibration change requires a new version — never edits to the frozen baseline.

# Status

**IES-012-D14 · Version 1.0 · Status SPECIFICATION**
