# Program v3.0 — AI Experience

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** AI EXPERIENCE (Phase 1)
**Version:** 1.0
**Date:** 2026-08-09

> AI is an **assistant layer**, never a replacement for deterministic decision logic (P3). The UI must make the authority separation unmistakable.

---

## 1. The separation (display contract)

```text
CERTIFIED INTELLIGENCE                 AI ASSISTANCE
  Engine Result                          Summary
  Certified Decision                     Natural-language explanation
  Evidence                               Research assistance
  Snapshot                               Question answering
  Replay                                 Exploration
```

Every AI output is visually and textually labeled **AI EXPLANATION** (or equivalent) and is clearly distinct from **CERTIFIED RESULT**. AI output is never presented as authoritative.

## 2. AI surfaces

- **AI summary** on decision/company pages (advisory).
- **AI research assistance** in Research.
- **AI question-answering** over surfaced evidence (advisory).
- Always bounded by the v2.0 AI advisory contract (`AiAdvice`: kind, text, grounded, nonAuthoritative, model, modelVersion).

## 3. Trust rules

- AI consumes certified scores/evidence and produces **advisory text only**.
- AI **cannot** modify engine inputs, methodology/calibration, verdicts, or execution.
- AI **cannot** become decision authority (v2.0 flagship: AI ON/OFF → A === B).
- AI outputs that are not evidence-grounded are flagged (`grounded: false`) rather than presented as fact (hallucination containment).

## 4. Non-goals

- No AI-generated investment decision.
- No AI output presented as a certified engine result.

## Status

**AI EXPERIENCE — COMPLETE (Phase 1).**
