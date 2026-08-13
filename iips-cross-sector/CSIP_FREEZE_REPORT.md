# CSIP — Freeze Report (v1.0)

**Capability:** CSIP — Cross-Sector Intelligence Platform
**Program:** v1.1 Track 5
**Status:** FROZEN v1.0.0
**Freeze Date:** 2026-08-08
**Approver:** IIPS Engineering Standards Maintainer
**Repository Version:** CSIP (iips-cross-sector) as committed

---

## 1. Freeze scope

CSIP transitions from Draft to **Frozen v1.0.0**. See `CSIP_FREEZE_MANIFEST.json` for the machine-readable record (versions + SHA-256 hashes).

Frozen items:

| Asset | Frozen version |
|---|---|
| Universal Investment Ontology | 1.0.0 |
| Cross-Sector Intelligence Standard | 1.0.0 |
| Portfolio Architecture | 1.0.0 |
| Portfolio Reference Data | 1.0.0 |
| Portfolio Golden Dataset (6 portfolios) | 1.0.0 |
| Portfolio Expected Outputs (6) | 1.0.0 |
| Portfolio Replay Dataset | 1.0.0 |
| Allocation Fixtures (8) | 1.0.0 |
| Diversification Fixtures (5) | 1.0.0 |
| Allocation Decision Matrix | 1.0.0 |
| Cross-Sector Evidence Model | 1.0.0 |
| Architecture Review artifacts (5 files) | 1.0.0 |

## 2. Freeze gate (per `CSIP_FREEZE_CHECKLIST.md`)

All 21 items complete.

## 3. Compatibility

Per `CSIP_COMPATIBILITY.md`: CSIP v1.0 compatible with Platform v1.x; consumes Banking/Insurance/Capital Markets/Healthcare engines v1.0 as immutable black boxes; no engine or platform modification.

## 4. Regression baseline

See `CSIP_FREEZE_REGRESSION_BASELINE.md` — the implementation target (6 portfolio outputs + 8 allocation fixtures + 5 diversification fixtures + replay determinism).

## 5. Consumed engines (immutable, authoritative)

- Banking Engine v1.0 (`banking-engine-v1.0.0`)
- Insurance Engine v1.0 (`insurance-engine-v1.0.0`)
- Capital Markets Engine v1.0 (`capital-markets-engine-v1.0.0`)
- Healthcare Engine v1.0 (`healthcare-engine-v1.0.0`)

## 6. Post-freeze rule

Any change to the ontology, standard, or reference assets requires a new capability/version — not modification of the frozen baseline.

## 7. Release tag

`csip-v1.0.0` (implementation release planned after independent verification)
