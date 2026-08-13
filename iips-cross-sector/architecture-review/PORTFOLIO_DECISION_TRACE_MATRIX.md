# IIPS — CSIP Portfolio Decision Trace Matrix

**Program:** v1.1 Track 5 — Cross-Sector Intelligence Platform
**Phase:** CSIP Phase 3 — Architecture Review
**Artifact:** 1 of 4 (Portfolio Decision Trace Matrix)
**Version:** 1.0-draft
**Date:** 2026-08-08
**Purpose:** Trace every portfolio-level decision from raw engine output to final recommendation, so that each recommendation is end-to-end accountable and replayable. This is the decision-side counterpart to the Cross-Sector Evidence Model.

---

## 1. Decision trace (canonical)

```text
Engine Outputs                          (source of truth — black box, immutable engines)
   │
   ▼
Ontology Mapping                        (engine-declared metadata → Universal Investment Ontology)
   │
   ▼
Cross-Sector Ranking                    (normalized conviction/confidence/quality/valuation)
   │
   ▼
Allocation Logic                        (strategy profile + rule precedence)
   │
   ▼
Diversification Analysis                (concentration / single-factor exposure)
   │
   ▼
Final Recommendation                    (portfolio recommendation + evidence chain)
```

## 2. Decision Trace Matrix

| # | Stage | Input | Transformation | Output | Evidence recorded | Determinism source |
|---|---|---|---|---|---|---|
| 1 | **Engine Outputs** | Company inputs → sector engine | Sector methodology (frozen, unchanged) | Sector, Composite (0–100), Verdict, Confidence, Evidence, Risk, Calibration/Methodology Version, Replay Metadata | Engine evidence id + snapshot id | Sector calibration (frozen) |
| 2 | **Ontology Mapping** | Composite, Confidence, pillar scores | Engine-declared ontology metadata table | Normalized dimensions: Conviction, Confidence, Quality, Growth, Risk, Valuation, Capital Efficiency, Moat | Mapping table version + per-engine mapping row | Ontology metadata (static) |
| 3 | **Cross-Sector Ranking** | Normalized dimensions across sectors | Sort by conviction desc, then sector asc (deterministic tie-break) | Ranked opportunity list | Ranking rationale (why this ordering) | Sort key (static, no randomness) |
| 4 | **Allocation Logic** | Ranked list + strategy profile + constraints | Allocation Rule Precedence Table (see artifact 3) | Allocation Recommendation per strategy | Allocation rationale + rule(s) applied in order | Rule precedence (static) |
| 5 | **Diversification Analysis** | Holdings + sector exposure + risk | Exposure, concentration, diversification score | Diversification Score + concentration/factor flags | Diversification impact | Deterministic formula (verified) |
| 6 | **Final Recommendation** | Ranking + allocation + diversification + evidence | Cross-Sector Evidence Model assembly | Portfolio Recommendation | Why-stock, why-sector, why-allocation, which-engine, confidence, evidence | Deterministic assembly |

## 3. Traceability contract

- Every final recommendation must reference a full chain: **engine → mapping → ranking → allocation rule → diversification impact → evidence**.
- No recommendation may originate from a stage that cannot be traced to a frozen engine output.
- The trace is **deterministic and versioned**: identical inputs at stage 1 → identical stage 6 output and identical evidence on replay.

## 4. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.** This trace is the acceptance basis for the Cross-Sector Evidence Model and the Portfolio Replay assertions (identical rankings / allocations / reports / diversification scores / evidence).
