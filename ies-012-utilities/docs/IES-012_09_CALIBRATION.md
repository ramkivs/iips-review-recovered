# IES-012 — Utilities Sector Engine

## Document 09 — UTILITIES CALIBRATION

**Document ID:** IES-012-D09
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines calibration thresholds and weights **by business model (regulated vs merchant) and segment** — where regulatory economics, reliability, and segment differences are expressed (per methodology principles).

# 1. Segment / business-model calibration profiles

| Profile | Quality weight | Growth weight | Risk weight | Profitability weight | CapitalEff weight | Valuation weight |
|---|---|---|---|---|---|---|
| Regulated Electric | 0.30 | 0.20 | 0.15 | 0.20 | 0.10 | 0.05 |
| Gas Distribution | 0.30 | 0.15 | 0.15 | 0.20 | 0.10 | 0.10 |
| Water Utilities | 0.30 | 0.10 | 0.15 | 0.20 | 0.15 | 0.10 |
| IPP / Merchant | 0.20 | 0.25 | 0.25 | 0.15 | 0.10 | 0.05 |
| Multi-utility | 0.30 | 0.15 | 0.15 | 0.20 | 0.10 | 0.10 |

# 2. Regulatory-quality risk

| Regulatory posture | Risk weight multiplier |
|---|---|
| Constructive (low lag) | low (0.8x) |
| Neutral | medium (1.0x) |
| Adversarial (high lag) | high (1.2x) |

# 3. Reliability handling

- Reliability (SAIDI) is a quality input; poor reliability → lower quality score.
- Reliability penalties reflected in quality/risk calibration, never scoring-logic change.

# Status

**IES-012-D09 · Version 1.0 · Status SPECIFICATION**
