# IES-010 — Override Precedence Matrix

**Standard:** IES-010 — Hospitality Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-08
**Status:** ARCHITECTURE REVIEW ARTIFACT

> **Purpose.** Document the deterministic execution order of hospitality overrides so every override executes in one sequence.

---

## 1. Override execution order (highest precedence first)

```text
Governance
      ↓
Brand Deterioration
      ↓
Occupancy Collapse
      ↓
Demand Shock
      ↓
Leverage Alert
      ↓
Normal Verdict
```

## 2. Override precedence table

| Priority | Override | Trigger | Cap | Binding |
|---|---|---|---|---|
| 1 (highest) | Governance | compliance/governance failure | Avoid | Hard |
| 2 | Brand Deterioration | brand/quality failure | Avoid | Hard |
| 3 | Occupancy Collapse | occupancy < 40% sustained | Avoid | Hard |
| 4 | Demand Shock | occupancy collapse or severe cyclical downturn | Watch | Hard |
| 5 | Leverage Alert | Debt/EBITDA above business-model alert | Watch | Hard |
| — | Normal Verdict | no override | — | — |

## 3. Rules (determinism)

- Overrides apply **after** composite computation.
- The **most restrictive cap wins** (highest-priority override sets the final cap).
- Execution is a **single deterministic sequence**; the highest applicable override determines the verdict.
- All overrides are **hard** (cannot be overridden by scoring).

## 4. Mapping to fixtures

| Fixture | Override exercised |
|---|---|
| HOSP-07 (HP-007) | Demand shock → Watch |
| HOSP-08 (HP-008) | Brand deterioration → Avoid |
| HOSP-09 (HP-009) | Occupancy collapse → Avoid |

## 5. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.** Deterministic override precedence defined.
