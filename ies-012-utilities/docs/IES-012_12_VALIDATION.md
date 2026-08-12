# IES-012 — Utilities Sector Engine

## Document 12 — UTILITIES VALIDATION

**Document ID:** IES-012-D12
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the validation approach: golden dataset, expected outputs, replay, fixtures, independent verification.

# 1. Validation assets (planned in Phase 3)

- Golden Dataset — utilities providers across segments + regulated/merchant models.
- Expected Outputs — frozen composite + verdict per provider.
- Validation Fixtures — adverse rate case, regulatory lag, capex overrun, stranded asset, leverage breach.
- Replay Dataset — replay determinism.

# 2. Acceptance criteria

- Reproduce all frozen expected outputs exactly.
- Pass all validation fixtures.
- Replay byte-identical.
- Zero platform/engine modifications (Utilities is a new sector engine).

# 3. Independent verification

Clean-clone reproduction of frozen outputs.

# Status

**IES-012-D12 · Version 1.0 · Status SPECIFICATION**
