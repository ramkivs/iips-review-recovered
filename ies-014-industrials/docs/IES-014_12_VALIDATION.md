# IES-014 — Industrials Sector Engine

## Document 12 — INDUSTRIALS VALIDATION

**Document ID:** IES-014-D12
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION (Phase 2 — frozen golden-output contract)

---

# Purpose

Defines the validation approach: golden dataset, expected outputs, replay, fixtures, independent verification.

# 1. Validation assets (planned in Phase 3)

- Golden Dataset — industrials providers across subsegments (capital goods, aero/defense, transport, E&C, electrical, diversified) + business-model archetypes.
- Expected Outputs — frozen composite + verdict per provider.
- Validation Fixtures — order cancellation/demand shock, EPC cost overrun, defense program failure, margin compression, leverage breach.
- Replay Dataset — replay determinism.

# 2. Acceptance criteria

- Reproduce all frozen expected outputs exactly.
- Pass all validation fixtures.
- Replay byte-identical.
- Zero platform/engine modifications (Industrials is a new sector engine).

# 3. Independent verification

Clean-clone reproduction of frozen outputs.

# Status

**IES-014-D12 · Version 1.0 · Status SPECIFICATION (frozen golden-output contract)**
