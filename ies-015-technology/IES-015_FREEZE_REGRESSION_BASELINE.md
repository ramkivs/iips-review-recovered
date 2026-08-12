# IES-015 — Freeze Regression Baseline

**Standard:** IES-015 — Technology Sector Engine
**Date:** 2026-08-09
**Purpose:** The frozen regression baseline that Technology implementation must reproduce exactly — the WP-3 implementation target.

---

## 1. Frozen baseline

| Artifact | Version | SHA-256 |
|---|---|---|
| Technology Calibration Profile | 1.0.0 | `9be45e06…` (see Freeze Manifest) |
| Golden Dataset | 1.0.0 | `0a41807a…` |
| Frozen Expected Outputs | 1.0.0 | `fcb46d7b…` |
| Replay Dataset | 1.0.0 | `889a5bff…` |
| Validation Fixtures (21) | 1.0.0 | `20b99a5b…` |
| Normative Calculation Appendix (D15 v1.3) | 1.3 | `8f0a1cdf…` |
| Ontology Metadata | 1.0.0 | `55bfb233…` |

## 2. Expected outputs (implementation target)

| Provider | Subsegment | Archetype | Composite | Verdict |
|---|---|---|---|---|
| TE-001 | software-saas | subscription | 76.3 | Buy |
| TE-002 | it-services | services-project | 67.3 | Accumulate |
| TE-003 | semiconductors | foundry-manufacturing | 76.4 | Buy |
| TE-004 | electronics-hardware | hardware | 67.7 | Accumulate |
| TE-005 | digital-platforms | transaction-platform | 80.5 | Strong Buy |
| TE-006 | internet-consumer-tech | usage-based | 63.4 | Watch (leverage + margin) |
| TE-007 | cybersecurity | license | 84.0 | Strong Buy |
| TE-008 | data-infrastructure | managed-services | 67.8 | Accumulate |
| TE-009 | tech-enabled-services | managed-services (hybridDominant) | 63.7 | Accumulate |
| TE-010 | digital-platforms (dominant) | subscription | 78.0 | Buy |
| TE-011 | digital-platforms (most conservative) | usage-based | 70.9 | Buy |
| TE-012 | it-services | license | 49.2 | Watch (round-half-even 49.25→49.2) |
| TE-013 | software-saas | subscription | 40.1 | Avoid (governance) |

## 3. Implementation must

- Reproduce all **13 frozen outputs** exactly (composite + verdict), including:
  - effective band-table resolution (`calibrated ?? baseline`, boundaries + scores together) — TE-001/003/005/010/011;
  - **TM-009 3-band** cardinality — TE-007;
  - calibrated TM-008 + TM-011 (TE-003), TM-006 (TE-005/010/011), TM-007 (TE-001/013);
  - **round-half-to-even** at composite — TE-012 (49.25 → 49.2);
  - **min_rank** overrides — TE-006 (Watch), TE-013 (Avoid).
- Pass all 21 validation fixtures (incl. band-cardinality rejection + conservative higher/lower-better + hybrid/multi-subsegment conflict fixtures).
- Reproduce byte-identical replay (incl. resolved calibration version binding, D15 §6a.4).
- Consume platform unchanged; register ontology metadata for CSIP (zero CSIP change).
- Treat reference assets as the **authoritative test oracle** (implementation disagreement = implementation defect).

## 4. Status

**FROZEN** — this is the implementation target.
