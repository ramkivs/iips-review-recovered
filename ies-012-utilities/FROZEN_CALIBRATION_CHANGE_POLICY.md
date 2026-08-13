# IES-012 — Frozen Calibration Change Policy

**Standard:** IES-012 — Utilities Sector Engine
**Phase:** 5 — Freeze
**Version:** 1.0
**Date:** 2026-08-08
**Status:** GOVERNANCE — defines how frozen calibration may evolve (increasingly important at 10–20 sectors)

---

## 1. What constitutes a calibration change

A calibration change is any modification to:
- **Weights** (segment pillar weights),
- **Thresholds** (band→score boundaries),
- **Leverage alerts**,
- **Regulatory-posture risk multipliers**,
- **Verdict mapping** boundaries.

It is **not** a calibration change to correct a data-entry/typo error that does not alter semantics (see §3).

## 2. What requires a new semantic version

Any calibration change that **alters expected outputs** (composite/verdict) for any frozen provider requires a **new semantic version** (e.g., `utilities-calibration-1.1.0`). This triggers full regression re-validation + independent verification.

## 3. What can be corrected without changing methodology

- Formatting/typographical corrections with **no output change**.
- Documentation clarifications.
- These are additive corrections, still version-tracked, and do not change the frozen baseline semantics.

## 4. Compatibility guarantees

- Calibration v1.0.0 is the **frozen baseline**; implementation must reproduce it exactly.
- A new calibration version is **backward-compatible** only if it produces identical outputs for all prior frozen providers.

## 5. Replay compatibility expectations

- Frozen-calibration replay must remain **byte-identical**.
- A new calibration version creates a **new replay dataset**; prior replay datasets remain valid for the prior version.

## 6. Migration rules

- New calibration version → new calibration profile + new golden/expected/replay/fixtures.
- Implementation loads the profile by version; no code change to the scoring engine.
- CSIP compatibility preserved (ontology registration unchanged).

## 7. Deprecation policy

- Prior calibration versions remain frozen/valid indefinitely (audit + rollback).
- Deprecation is only via a documented, versioned notice; never mutation of the frozen baseline.

## 8. Status

**GOVERNANCE — COMPLETE.**
