# DEC-G-AI-IMPL-S2 — Exact Advisory Wording Authority

- **Record ID:** `DEC-G-AI-IMPL-S2`
- **Title:** S2 — Exact Authoritative Wording of `AiAdvice.text`
- **Class:** `DECISION`
- **Status:** `RECORDED — S2 WORDING RESOLVED`
- **Date/time:** 2026-08-27
- **Authority relationship:** derives from `DEC-G-AI-IMPL-S1-S4` (S2-B — fixed, non-result-dependent
  copy), which decided the **rule** and left the **wording** pending. This record supplies the
  wording only. It does **not** modify `AUTH-G-AI-IMPL`, `SPEC-G-AI-IMPL`, `DEC-G-AI-IMPL-S1-S4` or
  `DEC-G-AI-IMPL-S4`, and does **not** resolve SR-1.
- **Scope:** the exact sentence assigned to `AiAdvice.text`. Nothing else.
- **Provenance:** the sentence was **selected verbatim by the maintainer** at this gate from candidate
  proposals put to them. It was **not** authored by the gate, and it was **not** recovered from
  implementation evidence.
- **Supersession / revision:** supersedes the "EXACT WORDING — PENDING" status recorded in
  `DEC-G-AI-IMPL-S1-S4` §3. No historical record is modified.

---

## 1. THE AUTHORITATIVE SENTENCE

```
AiAdvice.text = "This is a supplementary advisory explanation. It is not a certified engine result and does not alter the certified result."
```

Recorded **verbatim**. Implementation must use this exact string, including its two sentences and its
terminal full stop. No paraphrase, abbreviation, localisation variant or punctuation change is
authorized.

---

## 2. SOURCE OF AUTHORITY

**Explicitly decided at this gate by the maintainer.**

Verified before the decision that no wording was already authoritative:

| Check | Result |
|---|---|
| Any governance record assigning `AiAdvice.text` | **0** occurrences |
| `"text template"` in canonical `docs/` | **0** |
| `"message taxonomy"` in canonical `docs/` | **0** |
| `"fallback copy"` in canonical `docs/` | **0** |
| Canonical reference to advisory text | **1** — `docs/v3.0/ai-experience.md`: "AI consumes certified scores/evidence and produces **advisory text only**". This is the **concept**, not exact wording, and is not itself authority for a sentence |

Wording source classification: **B — EXPLICITLY DECIDED AT THIS GATE.**

---

## 3. FIXED-COPY RULE (unchanged from S2-B)

| Property | Requirement |
|---|---|
| Fixed | One sentence-set, invariant |
| Identical for every engine result | **YES** — no variation by sector, engine or result |
| Independent of result fields | **YES** — no `composite`, `verdict`, `sector`, `kind` or any other engine field |
| Independent of evidence | **YES** — no evidence-derived content |
| Deterministic | **YES** — constant output for constant input, trivially |
| Dynamic placeholders | **PROHIBITED** |
| Result-dependent slots | **PROHIBITED** |
| Message taxonomy | Not applicable — a single message |

---

## 4. SEMANTIC CONSTRAINTS AND VERIFICATION

| Constraint | Satisfied? | Basis |
|---|---|---|
| Does not depend on composite / verdict / sector / kind | **YES** | The sentence names none of them |
| Does not claim external intelligence | **YES** | "advisory explanation" only; no claim of intelligence, insight or analysis beyond explanation |
| Does not imply an external AI model | **YES** | No model, provider, or AI capability is named or implied — consistent with **S1** (deterministic in-process advisor, AI invocation prohibited) |
| Does not imply certification | **YES** | It states the opposite expressly: "It is **not** a certified engine result" |
| Does not alter the engine result | **YES** | It states this expressly: "does not alter the certified result" — reinforcing the **S3-A** A===B guarantee |
| Provides no recommendation absent from governed data | **YES** | No Buy/Sell/Hold, no recommendation, no forward-looking claim, no external fact |
| Does not contradict S1 deterministic behaviour | **YES** | A constant sentence is deterministic by construction |
| Does not contradict S3 `executeWithAi` | **YES** | It affirms that the certified result is unaltered, which is exactly what `engineResultUnchanged` guarantees |
| Does not contradict S4 no-fabrication / no-fallback | **YES** | It fabricates nothing and is not a fallback; under S4 an advisory failure yields **503 `advisory-unavailable`**, never this sentence as a substitute |
| Compatible with the D7 label | **YES** — see §5 |

---

## 5. COMPATIBILITY WITH THE D7 PRESENTATION

D7 requires the canonical **`AI EXPLANATION`** badge **plus** the adjacent
**`'AI EXPLANATION ≠ CERTIFIED RESULT'`** text. This sentence **complements** rather than duplicates
that label:

| Layer | Content | Source |
|---|---|---|
| Badge | `AI EXPLANATION` | canonical `Badges.tsx` `AiBadge` |
| Adjacent DTO label | `'AI EXPLANATION ≠ CERTIFIED RESULT'` | `SPEC-G-AI-IMPL` §6 / D7 |
| `AiAdvice.text` | the sentence in §1 | **this record** |

The three are rendered together. The sentence adds provenance ("supplementary advisory explanation")
and an explicit non-alteration statement that neither the badge nor the label carries. **D7 is
preserved unchanged**; nothing in this record replaces the badge or the adjacent label.

---

## 6. REJECTED ALTERNATIVES

| Alternative | Rejected because |
|---|---|
| The recovered transport string `"The certified engine produced composite ${composite} → ${verdict}. This is advisory only."` | **Ineligible on two independent grounds.** (1) It is recovered implementation evidence and may not be promoted to product authority. (2) It is **result-dependent** — it interpolates `composite` and `verdict` — which the S2 fixed-copy rule prohibits |
| The platform test advisor's copy (`iips-advisor`) | Test evidence only; not product authority |
| Any incidental UI string or screenshot-derived copy | Prohibited by the hard copy rule |
| Reusing the D7 label `'AI EXPLANATION ≠ CERTIFIED RESULT'` as `text` | Would duplicate the adjacent label verbatim and add no provenance or non-alteration statement |
| Wording asserting an AI model, provider or external analysis | Would contradict **S1**, which prohibits AI invocation and requires that `model` / `modelVersion` not imply an external AI model |
| Wording containing a recommendation or forward-looking claim | Would provide a recommendation not present in governed data |
| Deferring the wording again | The rule was already decided at S2; only the sentence was outstanding, and it is now supplied by the maintainer |

---

## 7. RECOVERED AND TEST COPY NOT USED

Recorded explicitly:

- **No recovered copy was used.** `frontend/server/ai-advisory-transport.ts` (`0792a6a4ef32`) remains
  **evidence only** and was not copied, quoted as authority, or adapted.
- **No test-advisor copy was used.** The `iips-advisor` deterministic test advisor in
  `program-v2.0-wp5-ai.test.ts` remains **evidence only**.
- **No historical implementation string was promoted** into product authority.
- The sentence in §1 originated from the maintainer's selection at this gate.

---

## 8. S1 / S3 / S4 UNCHANGED

| Item | Status |
|---|---|
| **S1** — deterministic in-process advisor; AI invocation prohibited; no additional reads | **UNCHANGED** |
| **S3** — `executeWithAi` is the authoritative orchestration path; direct `advise()` not permitted | **UNCHANGED** |
| **S4** — failure taxonomy, 503 semantics, no fallback, no fabrication | **UNCHANGED — RESOLVED** |

Nothing in this record reopens or reinterprets S1, S3 or S4.

---

## 9. SR-1 REMAINS SEPARATE

**SR-1 — the runtime `engineResultRef` review — is UNCHANGED and remains a separate review.** It is
not resolved, combined, or prejudged by this record.

---

## 10. SPECIFICATION AMENDMENT

**NOT REQUIRED.** `SPEC-G-AI-IMPL` already specifies the DTO `text` field as one of the seven governed
`AiAdvice` fields; this record supplies the authoritative value for it under the S2-B rule already
recorded in `DEC-G-AI-IMPL-S1-S4`. No clause of `SPEC-G-AI-IMPL` is amended, and the file has **not**
been edited (blob remains `dcb89af0fcf8`).

---

## 11. IMPLEMENTATION REMAINS BLOCKED

| Check | Result |
|---|---|
| Implementation file created or modified | **NONE** |
| Test file created or modified | **NONE** |
| Frontend, engine, route, navigation, policy or schema change | **NONE** |
| `SPEC-G-AI-IMPL` or any historical decision record | **NOT MODIFIED** |
| Recovery file restored or copied | **NONE** |
| Baseline transition performed | **NO** |
| Certification | **NOT PERFORMED** |
| Repository mutation in this gate | this decision record only, under `governance/iips/` |

**IMPLEMENTATION: BLOCKED.** The sentence is **not** implemented by this record.

### Remaining gates, in order

1. **SR-1 — runtime `engineResultRef` review**
2. **Final G-AI-IMPL controlled implementation authorization gate**
