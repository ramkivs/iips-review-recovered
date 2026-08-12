# IIPS — CSIP Cross-Sector Evidence Model

**Program:** v1.1 Track 5 — CSIP
**Version:** 1.0-draft
**Status:** REFERENCE ASSET
**Date:** 2026-08-06
**Purpose:** Standard evidence hierarchy for portfolio-level recommendations — as traceable as individual engine decisions.

---

## 1. Evidence hierarchy

```text
Recommendation
 ├── Sector Contribution
 │     ├── Engine Verdict
 │     ├── Confidence
 │     ├── Evidence
 ├── Portfolio Impact
 ├── Allocation Rationale
 └── Diversification Impact
```

## 2. Every recommendation explains

- **Why this stock** (company)
- **Why this sector**
- **Why this allocation**
- **Which engine produced it**
- **Confidence**
- **Supporting evidence**

## 3. Portfolio-level evidence

- Ranking rationale (normalized conviction/confidence/quality/valuation)
- Allocation rationale (strategy + constraints + decision matrix)
- Diversification impact (concentration/single-factor exposure)
- Replay metadata (identical outputs on replay)

## 4. Determinism

Evidence is deterministic + versioned; portfolio replay reproduces identical evidence.

## 5. Status

**REFERENCE ASSET** — defines the evidence shape for CSIP reports.
