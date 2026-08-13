# IES-010 — RevPAR Decision Trace Examples

**Standard:** IES-010 — Hospitality Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-08
**Status:** ARCHITECTURE REVIEW ARTIFACT

> **Purpose.** Complete end-to-end traces from raw RevPAR to final verdict using representative Golden Dataset providers.

---

## 1. Trace pipeline

```text
Raw RevPAR → Band → Score → Demand Pillar → Composite → Override → Verdict
```

## 2. Example A — HP-001 Luxury Recovery (owned, no override)

| Stage | Value |
|---|---|
| Raw RevPAR | 9,360 |
| Band | > 8,000 → Strong |
| Score | 90 |
| Demand pillar (RevPAR 0.7 + demand 0.3) | 85.5 |
| Composite (owned weights) | 79.0 |
| Override | none |
| **Verdict** | **Buy** |

## 3. Example B — HP-007 Demand Shock (asset-light, override)

| Stage | Value |
|---|---|
| Raw RevPAR | 2,700 |
| Band | < 3,000 → Weak |
| Score | 40 |
| Demand pillar | 46.0 |
| Composite (asset-light weights) | 54.2 |
| Override | Demand shock → cap ≤ Watch |
| **Verdict** | **Watch** |

## 4. Example C — HP-009 Occupancy Collapse (owned, override)

| Stage | Value |
|---|---|
| Raw RevPAR | 1,750 |
| Band | < 3,000 → Weak |
| Score | 40 |
| Composite (owned weights) | 38.9 |
| Override | Occupancy collapse → cap ≤ Avoid |
| **Verdict** | **Avoid** |

## 5. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.** End-to-end traces confirmed against expected outputs.
