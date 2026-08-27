# DEC-G-AI-IMPL-S1-S4 — Advisory Authority Decisions

- **Record ID:** `DEC-G-AI-IMPL-S1-S4`
- **Title:** S1–S4 — Advisory Authority Decisions
- **Class:** `DECISION`
- **Status:** `RECORDED — S1, S2, S3 RESOLVED · S4 BLOCKED (specification amendment required)`
- **Date/time:** 2026-08-27
- **Authority relationship:** derives from `AUTH-G-AI-IMPL` (as amended), `SPEC-G-AI-IMPL` and
  `DEC-G-AI-IMPL-B2-B4`. Resolves S1, S2 and S3; records S4 as blocked. Does **not** authorize
  implementation.
- **Scope:** S1–S4 only. B1–B4 are not reopened.
- **Provenance:** all four decisions were issued **explicitly by the maintainer** at this gate. None
  was inferred from implementation convenience, from the existence of a mechanism, or from recovered
  evidence. Contract facts were verified by object-level inspection of `origin/phase13-next` — no
  baseline transition was performed.
- **Supersession / revision:** supersedes the S1–S4 **status** recorded in `DEC-G-AI-IMPL-BS` and
  `DEC-G-AI-IMPL-B2-B4`. No historical record is modified.

---

## 1. PRE-EXISTING AUTHORITY (not decided here)

Established by the canonical platform contract, `iips-platform/src/distributed/AiAssistedRuntime.ts`
(blob `bf51421e7c7b`, byte-identical on both baselines), and by `SPEC-G-AI-IMPL`:

| Fact | Source |
|---|---|
| `AiAdvisor` is the governed interface | `export interface AiAdvisor` |
| `advise(engineResult, evidence)` is the governed method | `advise(engineResult: ExecutionResult, evidence: Record<string, unknown>): AiAdvice` |
| "Must NOT alter the result" | doc-comment on `advise()` |
| `AiAdvice` has seven governed readonly fields | `kind`, `text`, `grounded`, `nonAuthoritative: true`, `model`, `modelVersion`, `engineResultRef?` |
| Advice is supplementary to the engine result | `executeWithAi` returns `{ result, advice, engineResultUnchanged }` |
| `adviceId()` deterministic FNV-1a lineage helper | exported; required by **SR-3** |
| Response shape, freshness, provenance, tenant, route/navigation | **SPEC §6, SR-2, D3, D4** — unchanged |

---

## 2. S1 — AiAdvisor BEHAVIORAL CONTRACT

### DECISION: **S1-A(amended) — CONCRETE DETERMINISTIC ADVISOR; BEHAVIOR SPECIFIED HERE**

The existing interface contract alone was **not** sufficient, so the behaviour is specified explicitly:

| Element | Authoritative behaviour |
|---|---|
| **Advisor kind** | A **concrete deterministic in-process advisor** implementing `AiAdvisor` |
| **AI invocation** | **PROHIBITED.** No external provider, no network egress, no model call |
| **Determinism** | Output is fully determined by its inputs; no randomness, no clock, no environment dependence |
| **Permitted inputs** | **Only** the `ExecutionResult` and the `evidence` object passed to `advise()` |
| **Additional reads** | **PROHIBITED.** The advisor performs no additional platform, transport, file or network reads |
| **Engine result fields** | The advisor may read engine-result fields; it may **not** modify them (`ExecutionResult` is readonly and `advise()` must not alter the result) |
| **Fallback** | If advice cannot be produced, the advisor must **not** fabricate output — see **S4 (BLOCKED)** for the authoritative failure semantics |
| **Model identity** | `model` and `modelVersion` must identify the deterministic advisor truthfully; they must **not** imply an external AI model |

The recovered `DETERMINISTIC_ADVISOR` in `frontend/server/ai-advisory-transport.ts` is **evidence
only** and was **not** copied, referenced as authority, or used to derive this behaviour.

---

## 3. S2 — ADVISORY TEXT

### DECISION: **S2-B — FIXED, NON-RESULT-DEPENDENT COPY**

| Element | Authoritative rule |
|---|---|
| **Rule** | `AiAdvice.text` is a **single fixed sentence**, **identical for every engine result** |
| **Result dependence** | **None.** The text must not vary by sector, composite, verdict, `kind` or any other engine field |
| **Evidence dependence** | **None.** No slot substitution from evidence |
| **Message taxonomy** | Not applicable — one message |
| **Mandatory accompaniment** | The D7 label remains: canonical `AI EXPLANATION` badge **plus** the adjacent `'AI EXPLANATION ≠ CERTIFIED RESULT'` text. The fixed `text` does **not** replace either |
| **Grounded flag** | Populated per contract independently of the text |
| **EXACT WORDING** | **PENDING — see §7.** No wording was supplied with the decision, and none has been invented here |

Rejected: result-dependent templating (would make the copy vary by certified field, requiring wording
rules per `kind` and per verdict).

The recovered transport's advisory string and the platform test advisor's copy are **evidence only**
and were **not** used.

---

## 4. S3 — EXECUTION PATH

### DECISION: **S3-A — `executeWithAi` IS THE AUTHORITATIVE ORCHESTRATION PATH**

| Element | Authoritative rule |
|---|---|
| **Authoritative path** | The transport calls `AiAssistedRuntime.executeWithAi(engineId, makeEngine, request)` |
| **Advisor invocation** | Occurs **within** the governed runtime flow — `executeWithAi` calls `this.advisor.advise(engineResult, evidence)`. The transport does **not** call `advise()` directly |
| **Direct `advise()`** | **NOT permitted** for the G-AI-IMPL transport |
| **Evidence construction** | Performed by the platform: `evidence = { composite: engineResult.metadata.composite, verdict: engineResult.metadata.verdict }` |
| **A===B / result integrity** | Enforced by the platform — `executeWithAi` returns `engineResultUnchanged: true` and pushes `Object.freeze(advice)` into `adviceLog()`, providing runtime proof and advice lineage |
| **AI failure effect on the engine result** | None structurally — the engine executes first and independently of the advisor |
| **Where generation belongs** | Inside the governed runtime, not in the transport |
| **Input source** | The frozen certified baseline inputs retained in `engineDetails[sector].inputs`, resolved via `PROGRAM_v1.1_REPLAY_BASELINE.json` (`sector → engineId`, all **13** pairs verified) |

The prior governance wording "**advise/executeWithAi**" was **not** treated as a decision.
`executeWithAi` was **not** selected merely because it exists; the alternative was evaluated and
rejected on its consequences (below).

### Rejected alternative — S3-B, direct `advise()`

Avoids re-executing the engine, but provides **no** runtime A===B proof and **no** `adviceLog()`
lineage, both of which S3-A obtains from the governed path.

---

## 5. S4 — RELATED SEMANTICS

| Item | Classification |
|---|---|
| Advice identity | **ALREADY SPECIFIED** — SR-3, canonical `adviceId()` |
| Governed response shape | **ALREADY SPECIFIED** — SPEC §6 |
| Freshness | **ALREADY SPECIFIED** — SR-2, `'SNAPSHOT'` |
| Provenance | **ALREADY SPECIFIED** — governed audit chain |
| Route / navigation | **ALREADY SPECIFIED** — prohibited by D3 / D4 |
| Tenant | **ALREADY SPECIFIED** — advisory content is not tenant-owned |
| **AI failure behaviour** | **REQUIRES SPECIFICATION AMENDMENT — BLOCKED** |
| **Fallback behaviour** | **REQUIRES SPECIFICATION AMENDMENT — BLOCKED** |
| **Error UX / transport behaviour beyond the specified 401/403/404/500 and the canonical Loading/Error/Unavailable states** | **REQUIRES SPECIFICATION AMENDMENT — BLOCKED** |
| Residual dependency introduced by S1/S3 | **BLOCKED with S4** — under S3-A the advisor runs inside `executeWithAi`, so its failure surfaces through the runtime path; the authoritative handling of that case is not yet specified |

### **S4 = BLOCKED — SPECIFICATION AMENDMENT REQUIRED**

Recorded as blocked rather than resolved by invention. No fallback message, error payload or error UX
was invented. The already-specified items above are unchanged.

---

## 6. CONSISTENCY CHECK

Verified against SR-1…SR-5, T1…T10, D1–D8, B1–B4 and the 10 fences. **No contradiction found.**

| Pair | Result |
|---|---|
| D6 (sector/engine key) vs S3-A (`executeWithAi` needs `engineId`) | **Consistent.** D6 governs the API-boundary identifier; S3-A governs the internal path. All 13 `sector → engineId` pairs exist in `PROGRAM_v1.1_REPLAY_BASELINE.json` |
| D5 (dynamic `ENGINE_FACTORY` coverage) vs S3-A | **Consistent.** Coverage still derives from `ENGINE_FACTORY` / `engineDetails`; no sector enumeration introduced |
| S2 (fixed text) vs `AiAdvice.text` | **Consistent.** `text` is `readonly string`; a fixed string satisfies the contract. `grounded`, `kind`, `model`, `modelVersion`, `nonAuthoritative` remain separately populated |
| S1 (no AI) vs D7 / T3 | **Consistent.** Non-authoritative presentation is unaffected by advisor determinism |
| S1/S2/S3 vs SR-2, SR-3, SR-4, SR-5 | **Consistent.** Freshness, `adviceId()`, `guardRead` and dynamic coverage are all unchanged |
| S3-A vs fences 4 and 5 | **Consistent.** `iips-platform/**` is used as-is and `admin-transport.ts` is untouched |
| **S3-A vs SR-1** | **Specification-review consequence — recorded, not silently changed.** SR-1 constrains a *synthesized* `snap_<sector>` presentation reference. Under S3-A, `engineResultRef` comes from `advice.engineResultRef` produced by the platform runtime's own `SnapshotService`, so the synthesized value does not arise. SR-1's subject may therefore be moot, or may need restating for the runtime-generated reference. This must be resolved by a **separate specification-amendment gate**; SR-1 is **not** amended here |

**AUTHORITY CONSISTENCY: PASS** (no contradiction; one specification-review consequence recorded).

---

## 7. SPECIFICATION AMENDMENTS STILL REQUIRED

Two items must be resolved by separate authorized gates before implementation:

| # | Item | Why |
|---|---|---|
| 1 | **S4 — AI failure, fallback and error semantics** | Blocked at the authority boundary by explicit maintainer decision. No semantics may be inferred |
| 2 | **S2 — exact fixed wording** | The rule (single fixed sentence, non-result-dependent) is decided, but the wording was not supplied. **No product copy has been invented to unblock implementation** |
| 3 | **SR-1 review under S3-A** | Consequence of choosing `executeWithAi`; SR-1's subject may be moot or require restatement |

---

## 8. EVIDENCE CONSULTED (evidence only — not authority)

| Evidence | Use |
|---|---|
| `AiAssistedRuntime.ts` (`bf51421e7c7b`) | Contract facts and the `executeWithAi` / `executeWithoutAi` / `isEngineResultEquivalent` bodies |
| `PluginContract.ts` | `ExecutionResult` and `ExecutionRequest` shapes |
| `PROGRAM_v1.1_REPLAY_BASELINE.json` | The 13 `sector → engineId → input` triples |
| `executive-transport.ts` (`31ec66372ea8`) | `engineDetails` retains `inputs`; `computeCertifiedPlatform()` |
| `docs/v3.0/ai-experience.md` | Trust rules; the single "advisory text" reference (concept, not wording) |
| Recovered `ai-advisory-transport.ts` (`0792a6a4ef32`) | **Not used as authority.** Its `DETERMINISTIC_ADVISOR` and advisory string remain evidence |
| Platform test advisor `iips-advisor` | **Not used as authority** |

---

## 9. IMPLEMENTATION REMAINS BLOCKED

| Check | Result |
|---|---|
| Implementation file created or modified | **NONE** |
| Test file created or modified | **NONE** |
| `admin-transport.ts` / `guardRead` / engine / frontend / route / navigation | **untouched** |
| Recovery file restored or copied | **NONE** |
| Baseline transition performed | **NO** — canonical inspected by object reference only |
| Certification | **NOT PERFORMED** |
| Repository mutation in this gate | this decision record only, under `governance/iips/` |

**IMPLEMENTATION: BLOCKED.** S4 is unresolved, and S2's exact wording is pending. The final G-AI-IMPL
controlled implementation gate may not be entered until S4 and the S2 wording are durably resolved and
the SR-1 review is complete.
