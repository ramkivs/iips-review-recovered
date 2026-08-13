# IES-011 — Energy Calibration Boundary Matrix

**Standard:** IES-011 — Energy Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-08
**Status:** ARCHITECTURE REVIEW ARTIFACT

> **Purpose.** Explicitly document the transition boundaries between adjacent calibration profiles, making calibration assignment independently auditable.

---

## 1. Calibration profile assignment

| Segment | Commodity exposure | Calibration profile | Boundary rule |
|---|---|---|---|
| Integrated | Diversified | C-01 | default (diversified value chain) |
| Upstream | Price taker | C-02 | pure E&P, commodity-price exposed |
| Upstream | Partial hedger | C-02 | hedged E&P (same segment weights) |
| Midstream | Contracted | C-03 | fee-based transport/storage revenue |
| Downstream | Partial hedger | C-04 | refining margin exposure |
| Renewables | Contracted | C-05 | transition-led, growth-weighted |
| Regulated Utility | Regulated | C-06 | regulated return, low price risk |

## 2. Boundary rules

- **Segment is the primary assignment key**; commodity exposure refines risk weighting.
- Adjacent profiles differ in **pillar weights + leverage alert** only (never scoring logic).
- A company is assigned to exactly one profile based on its **dominant segment + commodity exposure**.
- Assignment is deterministic and auditable (segment + exposure fields).

## 3. Auditability

Every provider's calibration assignment traces to its `segment` + `commodityExposure` fields → single profile C-01..C-06.

## 4. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.**
