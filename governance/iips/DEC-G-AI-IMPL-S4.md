# DEC-G-AI-IMPL-S4 — Advisory Failure / Fallback / Error Semantics

- **Record ID:** `DEC-G-AI-IMPL-S4`
- **Title:** S4 — Advisory Failure, Fallback and Error Semantics
- **Class:** `DECISION`
- **Status:** `RECORDED — S4 RESOLVED`
- **Date/time:** 2026-08-27
- **Authority relationship:** derives from `AUTH-G-AI-IMPL` (as amended), `SPEC-G-AI-IMPL` and
  `DEC-G-AI-IMPL-S1-S4` (S1 deterministic advisor, S2 fixed copy, S3-A `executeWithAi`). Resolves the
  S4 items that record left blocked. Does **not** resolve S2 exact wording and does **not** resolve
  SR-1.
- **Scope:** advisory-generation failure, fallback behaviour, advisory-specific error UX, and the
  directly dependent transport/component semantics. Nothing else.
- **Provenance:** both decisions were issued **explicitly by the maintainer** at this gate. Failure
  conditions and status conventions were verified from canonical objects by reference; no baseline
  transition was performed. No semantics were inferred from the recovered implementation.
- **Supersession / revision:** supersedes the **S4 status** recorded in `DEC-G-AI-IMPL-S1-S4`
  (`BLOCKED — SPECIFICATION AMENDMENT REQUIRED`). No historical record is modified.

---

## 1. FAILURE TAXONOMY

Six conditions, kept distinct. They are **not** collapsed into one generic failure.

| ID | Condition | Determination |
|---|---|---|
| **A** | Unknown / unresolvable sector key — the key matches no `sector → engineId` pair in the frozen baseline | **ALREADY SPECIFIED — HTTP 404**, unchanged |
| **B** | Known sector, engine result `COMPLETED`, but the advisor **cannot produce advice** | **S4 DECISION — HTTP 503** |
| **C** | Known sector, engine returns `state: 'FAILED'` or `'CANCELLED'` | **S4 DECISION — advisory precondition failure, HTTP 503** |
| **D** | Engine execution **throws** inside `executeWithAi` | **ALREADY SPECIFIED — HTTP 500** transport failure |
| **E** | Advisor **throws** after a valid `COMPLETED` engine result | **S4 DECISION — HTTP 503** |
| **F** | Runtime / transport failure not attributable to A–E | **ALREADY SPECIFIED — HTTP 500** |

Explicit rule: **the existing 404 semantics for unknown/unresolvable sectors are NOT reused for a
known-sector advisory failure.** Condition A and conditions B/C/E are distinct outcomes with distinct
status codes and distinct error codes.

---

## 2. KNOWN-SECTOR ADVISORY FAILURE (conditions B and E)

### DECISION: **HTTP 503 with an advisory-specific error code; canonical `ErrorState`**

| Element | Rule |
|---|---|
| HTTP status | **503** |
| Error code | **`advisory-unavailable`** |
| Response body | the canonical error-envelope shape already used by the transports: `{ error: 'advisory-unavailable', code: 'advisory-unavailable' }` |
| UI | canonical **`ErrorState`** (`StateComponents.tsx:26`) |
| Distinction from A | 404 / unknown-sector remains a separate outcome and is never substituted |
| Engine result | **preserved** — the certified engine result is not altered, discarded or re-derived |
| Advisory fallback copy | **NONE** |
| Fabricated or partial advice | **PROHIBITED** |

### Why 503 and not a new status

**503 is already an established canonical status with this meaning.** `admin-transport.ts:686` maps
`TOKEN_FAILED` / `USERS_FAILED` / `ROLES_FAILED` to **503** with the comment "IdP source unavailable
-> 503; source contract -> 502", and 502 is reserved for source-contract failure. Reusing 503 for
"advisory dependency unavailable" is therefore consistent with the existing convention. **No new
status code is introduced.**

Status codes already in canonical use, for reference: `200`, `201`, `204`, `401`, `404`, `409`,
`500`, `502`, `503`.

---

## 3. ENGINE RESULT NOT COMPLETED (condition C)

### DECISION: **ADVISORY PRECONDITION FAILURE — HTTP 503, distinct code**

Verified from the canonical contract: `executeWithAi` performs **zero** `state` checks. Its body is:

```ts
const engineResult = rt.runtime.execute(engineId, request).result;
const evidence = { composite: engineResult.metadata.composite, verdict: engineResult.metadata.verdict };
const advice = this.advisor.advise(engineResult, evidence);
this.advices.push(Object.freeze(advice));
return { result: engineResult, advice, engineResultUnchanged: true };
```

`ExecutionResult.state` is `'COMPLETED' | 'FAILED' | 'CANCELLED'`, and `'FAILED'` is handled
**nowhere** in the canonical transports. Without an explicit rule, a `FAILED` or `CANCELLED` engine
result would be passed straight to `advise()`.

| Element | Rule |
|---|---|
| Required check | The transport **must** verify `ExecutionResult.state === 'COMPLETED'` before advice is generated |
| Non-`COMPLETED` handling | Treated as an **advisory precondition failure** — advice is **not** generated from a `FAILED` or `CANCELLED` result, and the advisor is **not** called |
| HTTP status | **503** |
| Error code | **`engine-result-not-completed`** — distinct from `advisory-unavailable` |
| UI | canonical **`ErrorState`** |
| Not treated as | an engine-level 500, and not as an unknown-sector 404 |

This keeps condition C distinguishable from both B/E (advisor-side) and D/F (transport-side), as
required.

---

## 4. FALLBACK

### DECISION: **NO FALLBACK**

| Prohibited | |
|---|---|
| Invented advisory sentence | **PROHIBITED** |
| Recovered transport copy or test-advisor copy | **PROHIBITED** — evidence only |
| Generic AI-generated fallback | **PROHIBITED** |
| Silent alternate advisor | **PROHIBITED** |
| External provider | **PROHIBITED** (S1) |
| Additional data reads | **PROHIBITED** (S1) |
| Partial advice | **PROHIBITED** |
| Silent substitution | **PROHIBITED** |

S1's deterministic in-process advisor remains authoritative. When advice cannot be produced, the
outcome is an explicit 503 error — never a substitute advisory.

---

## 5. TRANSPORT SEMANTICS (complete)

| Condition | Status | Code |
|---|---|---|
| Unauthenticated | **401** | existing `guardRead` / `AuthError` |
| Authenticated but not authorized | **403** | existing `guardRead` / `AuthError` |
| Unknown / unresolvable sector (A) | **404** | existing unknown-sector semantics |
| Engine result not `COMPLETED` (C) | **503** | `engine-result-not-completed` |
| Advisor cannot produce advice (B) or throws (E) | **503** | `advisory-unavailable` |
| Engine execution throws (D) / runtime or transport failure (F) | **500** | existing transport-failure semantics |
| Success | **200** | the governed 12-field DTO, unchanged |

The governed **success** response shape is unchanged: the seven `AiAdvice` fields plus `engineResultId`,
`label`, `freshness`, `unavailable[]`. Error responses use the canonical error-envelope shape already
used by the transports, so **no change to the governed response shape** occurs.

---

## 6. UI SEMANTICS

| Condition | Canonical state |
|---|---|
| Request in flight | `LoadingState` |
| Success | governed advisory rendering — `AiBadge` plus the adjacent `'AI EXPLANATION ≠ CERTIFIED RESULT'` text (D7) |
| 404 unknown sector | `ErrorState` |
| 503 `engine-result-not-completed` | `ErrorState` |
| 503 `advisory-unavailable` | `ErrorState` |
| 500 transport failure | `ErrorState` |
| Fields absent from the governed contract | `UnavailableState` — unchanged, and **distinct** from advisory failure |

**No new UI state is introduced.** Only the seven existing canonical states are used, and only
`LoadingState`, `ErrorState` and `UnavailableState` are implicated. **No UI code is modified by this
record.**

Note preserved: `UnavailableState` continues to express "the governed contract does not provide this
field" (per `SPEC-G-AI-IMPL`), which is a different meaning from "advisory generation failed". The two
are deliberately not merged.

---

## 7. `executeWithAi` FAILURE DISTINCTION

| Failure inside the `executeWithAi` flow | Classification |
|---|---|
| Engine returns `state: 'FAILED'` / `'CANCELLED'` | **S4 DECISION** — condition C, advisory precondition failure, 503 `engine-result-not-completed` |
| Engine execution throws | **ALREADY SPECIFIED** — condition D, 500 |
| Advisor throws after a `COMPLETED` result | **S4 DECISION** — condition E, 503 `advisory-unavailable` |
| `advices.push(Object.freeze(advice))` failure | **S4 DECISION** — treated as condition E (advisory generation did not complete successfully); 503 `advisory-unavailable`. The engine result remains unaffected because it was produced before the advisory step |
| Runtime construction / transport failure | **ALREADY SPECIFIED** — condition F, 500 |

Not all `executeWithAi` failures are advisory failures: engine-side and transport-side failures retain
their existing semantics.

---

## 8. RESULT INTEGRITY

| Property | Preserved? |
|---|---|
| Engine result authority | **YES** — the certified engine result is never altered, discarded or re-derived by an advisory failure |
| A===B guarantee from S3-A | **YES** — the engine executes first and independently; `engineResultUnchanged` is unaffected by advisory failure |
| Advisory non-authoritative status | **YES** — an advisory failure removes advisory content; it never promotes or substitutes anything into the certified surface |
| No mutation of `EngineResult` | **YES** — `ExecutionResult` is readonly and no rule here writes to it |
| Provenance | **YES** — the governed audit chain is unchanged |
| Tenant isolation | **YES** — unchanged; advisory content remains non-tenant-owned |
| Route / navigation constraints | **YES** — D3 / D4 untouched; no route or navigation change |

---

## 9. REJECTED ALTERNATIVES

| Alternative | Rejected because |
|---|---|
| **A — UNAVAILABLE + `UnavailableState`** for advisory failure | Would overload `UnavailableState`, which already carries the distinct meaning "the governed contract does not provide this field", and would blur the line between a missing field and a failed generation |
| **C — non-fatal absence, no transport error** | Would change the governed 12-field response shape by omitting advisory content — a specification change rather than an omission, and would make an advisory failure invisible to the client |
| Reusing **404** for a known-sector advisory failure | Expressly prohibited; 404 must remain the unknown/unresolvable-sector outcome |
| Introducing a **new HTTP status** | Unnecessary — 503 already carries the "dependency unavailable" meaning canonically |
| Treating condition C as an engine-level **500** | Would conflate an engine-outcome condition with a transport failure and lose the distinction the taxonomy requires |
| Any fallback advisory copy | Prohibited by §4 |

---

## 10. NO-FABRICATION RULE

Recorded as an standing constraint on implementation:

**Advice is either produced by the S1 deterministic advisor from a `COMPLETED` certified engine result,
or the request fails with an explicit 503. There is no third outcome.** No invented sentence, no
recovered or test-advisor copy, no generic AI-generated fallback, no silent alternate advisor, no
external provider, no additional data reads, no partial advice, no silent substitution.

---

## 11. SPECIFICATION AMENDMENT STATUS

### **NOT REQUIRED**

S4 is completely specified by existing authority plus the explicit decisions recorded here:

- HTTP 401 / 403 / 404 / 500 semantics — already in `SPEC-G-AI-IMPL`
- HTTP 503 — an existing canonical status convention, not a new code
- `LoadingState` / `ErrorState` / `UnavailableState` — existing canonical components
- 12-field success response shape — unchanged
- D7 labelling — unchanged

No clause of `SPEC-G-AI-IMPL` requires amendment for S4, and **`SPEC-G-AI-IMPL` has not been edited**.

---

## 12. S2 AND SR-1 UNCHANGED

| Item | Status |
|---|---|
| **S2 — exact advisory wording** | **UNCHANGED — still PENDING.** Not resolved by this gate and not combined into S4 |
| **SR-1 — runtime `engineResultRef` review** | **UNCHANGED — separate review.** Not resolved by this gate |

---

## 13. IMPLEMENTATION REMAINS BLOCKED

| Check | Result |
|---|---|
| Implementation file created or modified | **NONE** |
| Test file created or modified | **NONE** |
| Frontend, engine, route, navigation, policy or schema change | **NONE** |
| `admin-transport.ts` / `guardRead` / `secured-executor.ts` | **untouched** |
| Recovery file restored or copied | **NONE** |
| Baseline transition performed | **NO** — canonical inspected by object reference only |
| Certification | **NOT PERFORMED** |
| Repository mutation in this gate | this decision record only, under `governance/iips/` |

**IMPLEMENTATION: BLOCKED.** S4 is now resolved, but S2 exact wording and the SR-1 review remain
outstanding. The final controlled implementation gate may not be entered until both are durably
resolved.

### Remaining gates, in order

1. **S2 — exact advisory wording**
2. **SR-1 — runtime `engineResultRef` review**
3. **Final G-AI-IMPL controlled implementation authorization gate**

These are **not** combined into S4.
