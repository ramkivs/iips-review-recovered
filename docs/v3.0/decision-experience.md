# Program v3.0 — Decision Experience

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** DECISION EXPERIENCE (Phase 1)
**Version:** 1.0
**Date:** 2026-08-09

> How the certified decision is presented. **Decision before metric** (P2): never make users interpret dozens of metrics before discovering the actual decision.

---

## 1. Decision hierarchy (top → bottom)

```text
Decision          (verdict: Strong Buy/Buy/Accumulate/Hold/Watch/Avoid)
  ↓
Confidence        (if the platform supplies it; from evidence/execution)
  ↓
Why               (decision drivers — from pillars/overrides)
  ↓
Key drivers       (top contributing factors)
  ↓
Supporting metrics
  ↓
Raw evidence
```

## 2. Decision card

A `DecisionCard` shows, first and foremost:
- **Decision badge** (verdict) — the primary element.
- **Confidence indicator** (where supplied).
- **Composite score** (0–100, as returned).
- **Key drivers** (from pillars/overrides — presentational).
- Link → Evidence → Snapshot → Replay.

## 3. Authority labeling

The decision is a **CERTIFIED ENGINE RESULT** (v1.1) delivered via v2.0. It is never presented as AI-generated. AI explanation (if any) is visually separate and labeled **AI EXPLANATION**.

## 4. Non-goals

- v3.0 does **not** recompute the verdict, composite, confidence, or drivers.
- v3.0 does **not** reinterpret or override verdicts.
- Overrides applied (e.g., Watch/Avoid caps) are displayed **as returned** by the engine.

## Status

**DECISION EXPERIENCE — COMPLETE (Phase 1).**
