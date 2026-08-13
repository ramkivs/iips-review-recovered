# IES-015 — Technology Sector Engine

## Document 14 — REFERENCE ASSET GOVERNANCE

**Document ID:** IES-015-D14
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Governance rules for technology reference assets (Phase 3): golden dataset, expected outputs, fixtures, replay dataset.

# 1. Governance rules

- All reference assets are **deterministic + versioned**.
- Frozen assets are immutable; changes require a new version, never mutation.
- Calibration is subsegment+archetype scoped and versioned (`technology-calibration-1.0.0`).
- Every asset carries provenance (source, version, SHA-256).

# 2. Lifecycle

Specification → Reference Assets → Architecture Review → Freeze → Implementation → Validation → Independent Verification → Release.

# 3. Post-freeze rule

Any methodology/calibration change requires a new version — never edits to the frozen baseline.

# Status

**IES-015-D14 · Version 1.0 · Status SPECIFICATION**
