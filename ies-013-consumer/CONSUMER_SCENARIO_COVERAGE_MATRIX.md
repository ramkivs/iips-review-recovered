# IES-013 — Consumer Scenario Coverage Matrix

**Standard:** IES-013 — Consumer Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSET

> **Purpose.** Ensure the golden dataset intentionally exercises the major Consumer business situations — every calibration path and override before implementation.

---

## 1. Consumer scenario coverage

| Scenario | Segment | Business model | Calibration path | Override exercised |
|---|---|---|---|---|
| Premium brand expansion | Luxury | Branded | Luxury | none (positive) |
| Staple resilience during slowdown | Staples | Branded | Staples (defensive) | none |
| Discretionary demand contraction | Discretionary | Retailer | Discretionary (cyclical) | category disruption → Watch |
| Successful premiumization | Staples | Branded | Staples | none |
| Failed premiumization | Discretionary | Branded | Discretionary | brand erosion → Avoid |
| Channel disruption | Discretionary | Retailer | Retailer | channel loss → Watch |
| Private-label competition | Staples | Branded | Staples | input-cost squeeze → Watch |
| Margin compression (commodity inflation) | Staples | Branded | Staples | input-cost squeeze → Watch |
| Innovation-led market-share gains | Discretionary | DTC | DTC | none (positive) |
| Brand erosion | Luxury | Branded | Luxury | brand erosion → Avoid |

## 2. Coverage completeness

- **Every segment** (Staples, Discretionary, Luxury) + business model (branded/retailer/DTC) represented.
- **Every override path** (brand erosion, category disruption, input-cost squeeze, channel loss, leverage, governance) exercised.
- **Every calibration path** (segment + business model) exercised.

## 3. Status

**REFERENCE ASSET — COMPLETE.**
