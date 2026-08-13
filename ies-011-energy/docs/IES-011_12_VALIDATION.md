# IES-011 — Energy Sector Engine

## Document 12 — ENERGY VALIDATION

**Document ID:** IES-011-D12
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the validation approach: golden dataset, expected outputs, replay, fixtures, independent verification.

# 1. Validation assets (planned in Phase 3)

- Golden Dataset — energy providers across value-chain segments + commodity exposures.
- Expected Outputs — frozen composite + verdict per provider.
- Validation Fixtures — price collapse, cost blowout, reserve write-down, leverage breach, stranded asset.
- Replay Dataset — replay determinism.

# 2. Acceptance criteria

- Reproduce all frozen expected outputs exactly.
- Pass all validation fixtures.
- Replay byte-identical.
- Zero platform/engine modifications (Energy is a new sector engine).

# 3. Independent verification

Clean-clone reproduction of frozen outputs.

# Status

**IES-011-D12 · Version 1.0 · Status SPECIFICATION**
