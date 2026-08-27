# SPEC-G-AI-IMPL — G-AI-IMPL Implementation Specification (RECONSTITUTED)

- **Record ID:** `SPEC-G-AI-IMPL`
- **Title:** G-AI-IMPL — AI Advisory Embedded Surface Implementation Specification
- **Class:** `SPECIFICATION`
- **Status:** `ACTIVE (RECONSTITUTED)`
- **Date/time:** 2026-08-27
- **Authority relationship:** issued originally at the G-AI specification-discovery gate (classified
  **CASE B — IMPLEMENTABLE DELTA EXISTS**) and authorized by `AUTH-G-AI-IMPL`. Binds implementation
  once a controlled-change gate returns `IMPLEMENTATION GO`.
- **Scope:** the 11-path delta below. Excludes baseline transition, recovery-evidence replacement,
  canonical-content import, certification, and every path in §5.
- **Provenance:** see `AUTH-G-AI-IMPL` — reconstituted from previously issued session content after
  the original out-of-repo artifact was destroyed by sandbox re-clones. No requirement has been added,
  weakened or inferred.
- **Supersession / revision:** supersedes no record.

---

## 1. Incorporated scope constraints D1–D8 (fixed; not reopened)

| ID | Constraint |
|---|---|
| **D1** | Audience: viewer / analyst / admin under the existing governed `read` authority; no AI-specific role or restriction |
| **D2** | Product surface: **embedded** advisory on existing Company / Decision / Research surfaces; **no standalone AI Advisory workspace** |
| **D3** | **No standalone AI route** |
| **D4** | **No navigation entry**; explicitly **not** an Intelligence child |
| **D5** | Sector coverage: **dynamic** — whatever `ENGINE_FACTORY` registers (13 at the authorized baseline); **CSIP explicitly excluded** |
| **D6** | Identifier: **sector / engine key**, matched case-insensitively |
| **D7** | Label: canonical **`AI EXPLANATION`** badge **plus** adjacent `'AI EXPLANATION ≠ CERTIFIED RESULT'` text |
| **D8** | Roadmap: **separate future wave**, name and position unassigned; **not PC-4, not N+5** |

## 2. Specification requirements SR-1 … SR-5

| ID | Requirement |
|---|---|
| **SR-1** | The synthesized `snap_<sector>` value is a **presentation-level reference** and must **not** be presented as a canonical `snapshotRef` |
| **SR-2** | `freshness` is **`'SNAPSHOT'`**, consistent with the governed read convention. Clarification only — **no code correction** is implied |
| **SR-3** | `adviceId` must be produced by the **canonical platform `adviceId()` helper** |
| **SR-4** | Authorization must use **canonical `guardRead`** with resource **`read.ai-advisory`** |
| **SR-5** | **No sector enumeration anywhere in the delta.** Coverage derives from `ENGINE_FACTORY` via `engineDetails` |

## 3. Test obligations T1 … T10

| ID | Obligation |
|---|---|
| **T1** | Governed read authorization — viewer / analyst / admin 200; missing token 401; expired token 401; viewer denied `execute` 403; admin gate not granted read |
| **T2** | Dynamic engine coverage — resolves for **every** key in `engineDetails`; unknown key 404; **no** hard-coded sector list |
| **T3** | Advisory-only presentation — `AiBadge` renders `AI EXPLANATION`; adjacent `≠ CERTIFIED RESULT` text; **no** `BUY`/`SELL`/`HOLD`; `nonAuthoritative: true`; `unavailable[]` listed and never fabricated |
| **T4** | Loading / error / unavailable states |
| **T5** | Host/result binding — the advisory requests the **host's own** sector key on each of the three surfaces |
| **T6** | Embedded rendering does not alter existing certified rendering on the hosts |
| **T7** | No standalone route/nav — route and navigation inventories unchanged |
| **T8** | No forbidden computation or persistence — no scoring, re-ranking, recomputation, storage, alerts, subscriptions, events or scheduling |
| **T9** | `adviceId` produced by the platform helper (SR-3) |
| **T10** | `freshness === 'SNAPSHOT'` (SR-2) |

## 4. Change surface — exactly 11 paths

### NEW — 5

| Path | Required content |
|---|---|
| `frontend/server/ai-advisory-transport.ts` | `GET /api/ai-advisory/:sectorKey` using `guardRead(executor, token, 'ai-advisory')` (SR-4); dynamic key resolution (D5/D6); platform `adviceId()` (SR-3); `freshness: 'SNAPSHOT'` (SR-2); DTO label `'AI EXPLANATION ≠ CERTIFIED RESULT'` (D7). **Not a copy of the recovered file** |
| `frontend/src/components/ai/AiExplanation.tsx` | Embedded advisory component: `AiBadge` + adjacent clause text + governed fields + Loading / Error / Unavailable. **No sector selector** |
| `frontend/src/api/aiAdvisory.ts` | Thin `authFetch` client consistent with the canonical API-client pattern |
| `frontend/server/ai-advisory-transport.test.ts` | T1, T2, T9, T10 |
| `frontend/src/components/ai/AiExplanation.test.tsx` | T3, T4, T8 |

### MODIFY — 6

| Path | Permitted change |
|---|---|
| `frontend/server/executive-transport.ts` | Add the `/api/ai-advisory/` dispatch **only** |
| `frontend/src/features/company/CompanyIntelligence.tsx` | Embed with the host's sector key |
| `frontend/src/features/research/SectorIntelligence.tsx` | Embed with the host's sector key |
| `frontend/src/features/decision-matrix/DecisionMatrix.tsx` | Embed with `selected.sector` |
| `frontend/src/features/company/CompanyIntelligence.test.tsx` · `frontend/src/features/research/SectorIntelligence.test.tsx` · `frontend/src/features/decision-matrix/DecisionMatrix.test.tsx` | T5, T6 |
| `frontend/src/app/navigation.test.ts` | T7 — assert no AI navigation entry |

No path outside these 11 may be created, modified, deleted, renamed, restored, copied, staged,
committed or pushed.

## 5. Must-not-touch boundaries — 10

| # | Boundary |
|---|---|
| 1 | `frontend/src/app/routes.ts` (D3) |
| 2 | `frontend/src/app/navigation.ts` (D4) |
| 3 | `frontend/src/app/Sidebar.tsx`, `AppShell.tsx`, `App.tsx` (D3/D4) |
| 4 | `iips-platform/**` including `AiAssistedRuntime.ts` and all sector engines (engine matrix) |
| 5 | `frontend/server/admin-transport.ts` — `guardRead` is reused **as-is** |
| 6 | `frontend/server/secured-executor.ts` — no security-model change |
| 7 | `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` — certified baseline |
| 8 | `ies-010 … ies-020`, `iips-cross-sector` — certification baselines; CSIP excluded per D5 |
| 9 | `ROADMAP.md`, `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` — D8, wave unassigned |
| 10 | The six recovered AI files — **reference evidence only; no restoration, copying, modification, replacement or deletion** |

## 6. Data contract

**Input:** a sector/engine key (string), matched case-insensitively against the keys of
`computeCertifiedPlatform().engineDetails`. Unknown key → `404`.

**Output:** the seven governed `AiAdvice` fields — `adviceId`, `kind`, `text`, `grounded`,
`nonAuthoritative`, `model`, `modelVersion`, `engineResultRef?` — plus transport-level `engineResultId`,
`label`, `freshness`, `unavailable[]`. Ten of the twelve trace directly to the shared canonical
contract; `label` and `unavailable[]` are transport-level additions established by D7 and by this
specification.

## 7. Security and provenance constraints

- Authorization **only** via canonical `guardRead` with resource `read.ai-advisory` (SR-4). No second
  read-authorization model may be introduced.
- Governed audit chain as required by the Phase 13.1 authority/security map: authenticate (401) →
  authorize (403) → governed audit.
- Tenant: advisory content derives from the **global certified baseline**, not tenant-owned data;
  `AiAdvice` carries no `tenantId`. Principal-tenant validation at authentication remains in force.
  No advisory-specific tenant scoping is authorized.
- AI is **never** a decision authority; the certified engine result is not altered (A===B).
- Fields the governed contract does not provide are listed in `unavailable[]` and rendered
  **UNAVAILABLE — never fabricated**.
- Read-only. No mutation, no AI configuration, no prompt/provider/model-selection surface.

## 8. Items this specification does NOT define

Recorded so that no implementer fills them by inference:

- The concrete `AiAdvisor` behaviour and how `text` is produced → **S1, S2**
- `advise()` versus `AiAssistedRuntime.executeWithAi` → **S3**
- AI-failure and fallback semantics, error UX → **S4**

See `DEC-G-AI-IMPL-BS`. These are **unresolved** and must not be decided during implementation.
