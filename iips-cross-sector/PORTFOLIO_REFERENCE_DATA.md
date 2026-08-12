# IIPS — CSIP Portfolio Reference Data

**Program:** v1.1 Track 5 — CSIP
**Version:** 1.0-draft
**Status:** REFERENCE DATA SPECIFICATION
**Date:** 2026-08-06
**Purpose:** Defines the data CSIP consumes and produces — the reference data model.

---

## 1. Input: normalized engine outputs (ontology dimensions)

Per opportunity (company), from engine published outputs via ontology mapping:

| Field | Type | Source |
|---|---|---|
| companyId | string | engine output |
| sector | string | engine output |
| conviction | number (0–100) | composite score (normalized) |
| confidence | number (0–1) | engine confidence |
| quality | number (0–100) | quality dimension |
| growth | number (0–100) | growth dimension |
| risk | number (0–100) | risk dimension |
| valuation | number (0–100) | valuation/opportunity dimension |
| capitalEfficiency | number (0–100) | capital efficiency |
| moat | number (0–100) | moat/franchise |
| verdict | string | engine verdict |
| calibrationVersion | string | engine |
| methodologyVersion | string | engine |
| replayMetadata | object | engine |

## 2. Output: portfolio intelligence

- Portfolio Intelligence Report
- Ranked opportunities
- Allocation Recommendation (per strategy)
- Diversification Score
- Top-N opportunities + rationale
- Correlation/sensitivity report
- PDF-ready JSON reports

## 3. Strategy profiles (allocation)

Conservative · Balanced · Growth · Aggressive · Income · Value — each defines target weights/constraints.

## 4. Determinism

All reference data is deterministic; portfolio replay produces identical outputs.

## 5. Status

**REFERENCE DATA SPEC COMPLETE** — feeds the golden portfolio dataset + expected outputs.
