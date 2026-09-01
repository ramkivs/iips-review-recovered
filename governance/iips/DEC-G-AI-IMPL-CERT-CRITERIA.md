# DEC-G-AI-IMPL-CERT-CRITERIA â€” Certification Criteria, Live-Validation Policy & Dispatch Coverage

- **Record ID:** `DEC-G-AI-IMPL-CERT-CRITERIA`
- **Title:** G-AI-IMPL Certification Criteria (D-CERT-CRITERIA), Live-Validation Policy
  (G-LIVE-TEST) and Dispatch Coverage Authorization (G-DISPATCH-COVERAGE)
- **Class:** `DECISION`
- **Status:** `RECORDED â€” CRITERIA DEFINED`
- **Date:** 2026-08-27
- **Authority relationship:** gate `G-AI-IMPL CERTIFICATION-PRECONDITION AUTHORITY`, Â§5, Â§6
  and the G-DISPATCH-COVERAGE decision. Each outcome below was selected explicitly by the
  maintainer at that gate; recording authority (record + commit + push to
  `origin/arena/01a03e3b-iips-review-recovered`) was granted there.
- **Scope:** defines certification criteria and authorizes one narrowly-scoped test
  addition. It does **not** perform certification, does **not** promote a certification
  version, and does **not** reopen P7.

**Provenance:** pre-existing governance record; provenance reconstructed from the authoritative governance record and execution lineage available at the time of D33-C1 amendment. This metadata amendment records provenance only and does not alter the record's substantive decision, authorization, scope, or evidentiary determination.

---

## 1. PROBLEM

Before this record, **no durable record defined what G-AI-IMPL certification requires**.
Every prior mention in `governance/iips/` was `BLOCKED`, `NOT PERFORMED`, or "separate
gate". `AUTH-G-AI-IMPL` Â§4 expressly places *"Certification, or any attempt at
live-Keycloak certification"* outside that record's authority. Certification therefore
could not be scoped or audited. **D-CERT-CRITERIA.**

## 2. DECISION â€” CERTIFICATION CRITERIA

| ID | Criterion | Classification | Current status |
|---|---|---|---|
| **A** | Static / source validation (S1, S2 exact text, S3-A, S4 codes, SR-1â€¦SR-5 markers, D6/D7) | **REQUIRED** | **PASSED** â€” 11/11 checks against the pushed blob |
| **B** | Typecheck â€” client `tsc --noEmit` **and** server `tsc --noEmit -p tsconfig.server.json` | **REQUIRED** | **PASSED** â€” both exit 0 |
| **C** | Production build (`tsc -b && vite build`) | **REQUIRED** | **PASSED** â€” exit 0 |
| **D** | Complete automated suite (`vitest run`) | **REQUIRED** | **PASSED** â€” 651 passed / 21 skipped / 0 failed |
| **E** | Test obligations **T1 â€¦ T10** | **REQUIRED** | **PASSED** â€” 130 passed / 0 failed |
| **F** | Specification requirements **SR-1 â€¦ SR-5** | **REQUIRED** | **PASSED** |
| **G** | Real HTTP transport verification | **REQUIRED ONLY IF INFRASTRUCTURE AVAILABLE** | see Â§3 |
| **H** | Authenticated live HTTP 200 advisory request | **REQUIRED ONLY IF INFRASTRUCTURE AVAILABLE** | **NOT PERFORMED** â€” no IdP |
| **I** | Real Keycloak authentication | **REQUIRED ONLY IF INFRASTRUCTURE AVAILABLE** | **NOT PERFORMED** â€” no container runtime, no IdP |
| **J** | Live browser rendering | **REQUIRED ONLY IF INFRASTRUCTURE AVAILABLE** | **NOT PERFORMED** â€” no browser |
| **K** | Recovery-evidence and ten-fence verification | **REQUIRED** | **PASSED** â€” 10/10 unchanged `85bbd49`â†’`e5d59981`; six blobs preserved at `origin/arena` |
| **L** | Provenance: A===B, `engineResultUnchanged`, adviceLog lineage, snapshotRef | **REQUIRED** | **PASSED** |
| **M1** | No unauthenticated advisory success path (missing token 401, expired token 401) | **REQUIRED** | **PASSED** |
| **M2** | Host no-regression on all three embedded surfaces (T6) | **REQUIRED** | **PASSED** |
| **M3** | Navigation/route inventory unchanged (T7, D3/D4) | **REQUIRED** | **PASSED** |

**No unavailable test is recorded as PASS.** Every `NOT PERFORMED` above is recorded as
`NOT PERFORMED`.

### Note on criterion G â€” recorded for accuracy, not to vary the decision

The maintainer classified **G** as *REQUIRED ONLY IF INFRASTRUCTURE AVAILABLE*. It is
recorded exactly so. One factual qualification is noted here so a later reader is not
misled: unlike H, I and J, **G does not depend on any external infrastructure**. The
repository already contains a working real-socket test pattern â€”
`frontend/server/admin-transport.test.ts` uses `http.createServer(...)` plus
`server.listen(0, ...)` and passes in this environment, with no container runtime and no
IdP. Real-socket verification of the advisory surface is therefore achievable here, and the
G-DISPATCH-COVERAGE authorization in Â§4 will in fact provide it. The classification stands
as decided; this note only prevents the classification from being read as "G is impossible
here", which is not true.

## 3. DECISION â€” G-LIVE-TEST: **OPTION D**

> **Live validation is required when infrastructure exists, but absence of infrastructure
> is recorded as a certification limitation rather than a failure.**

Consequences, stated explicitly so nothing is inferred later:

1. **H, I and J are genuine requirements**, not optional extras. They are unmet **solely**
   because the environment lacks a container runtime and an IdP â€” measured this gate:
   `docker`, `podman`, `docker-compose`, `nerdctl` all **NOT FOUND**; `127.0.0.1:8080` â†’
   `000`; ~~no compose or IdP configuration tracked in the repository~~.
   **AMENDED by `DEC-D9-RECORD-CORRECTION` (defect `D-HIJ-CONFIG`):** this is the
   **originating** statement of the error corrected in `DEC-G-AI-IMPL-CERTIFICATION` Â§5, and is
   corrected here for the same reason. **No compose** configuration is tracked (0 files) â€” that
   half is correct. **Keycloak IdP configuration IS tracked** â€” 5 artifacts, including the
   provisioning harness `frontend/server/live/keycloak-provision.mjs`. The correct reason is
   that **no Keycloak server was reachable and no container runtime existed to start one**.
   H, I and J remain **`NOT PERFORMED`**; the limitation remains **not self-clearing**; **no**
   result is converted to PASS.
2. **Absence is a recorded limitation, not a failure.** Certification may proceed with the
   limitation recorded verbatim in the certification record.
3. **The limitation is not self-clearing.** If an IdP and browser later become available,
   H, I and J must be performed and the limitation withdrawn by a further record.
4. **A specific technical consequence is recorded:** the dispatch branch returns
   `401 {"error":"authentication unavailable (no IdP configured)"}` whenever
   `getReadExecutor()` yields no executor
   (`frontend/server/executive-transport.ts`, `/api/ai-advisory/` branch). Without an IdP
   the live endpoint **cannot** return 200. H is therefore unreachable here by construction,
   not by test omission.
5. **No 14th path is created by this decision.** Option C was available and was **not**
   selected. The recovered live-certification test
   (`frontend/server/live/ai-advisory-live-certification.test.ts`, blob `2bcaac3329de`)
   remains **recovery evidence only** and is **not** imported, restored, copied or derived
   from.

## 4. DECISION â€” G-DISPATCH-COVERAGE

### 4.1 Finding (new, this gate)

The `/api/ai-advisory/` dispatch branch in `frontend/server/executive-transport.ts` â€” the
only production path that reaches the feature â€” is exercised by **no** test:

- The only import from `executive-transport` in any test is `resolveSectorEngine`
  (`frontend/server/ai-advisory-transport.test.ts:26`).
- That test calls `handleAiAdvisoryRequest(req, res, executor, resolveSectorEngine)`
  **directly**, bypassing the dispatcher.
- Its `req`/`res` are **stub objects** built by object literal and cast
  (`as unknown as http.IncomingMessage` / `as unknown as http.ServerResponse`) â€” no socket.
- Its `OidcVerifier` is **mocked** (`{ verify: vi.fn().mockResolvedValue(...) }`) â€” no real
  authentication.

So the untested code is precisely: the URL-prefix match, `getReadExecutor()` acquisition,
the 401 no-IdP branch, the dynamic `import('./ai-advisory-transport')`, and the 500 catch.

### 4.2 Decision â€” **OPTION: cover it inside the existing authorized test file**

**AUTHORIZED:** a follow-up commit on `gai-impl-canonical` adding real-socket coverage of
the `/api/ai-advisory/` dispatch branch, placed **inside**
`frontend/server/ai-advisory-transport.test.ts`.

| Constraint | Value |
|---|---|
| New path created | **NONE** â€” `frontend/server/ai-advisory-transport.test.ts` is already one of the 13 authorized paths |
| Authorized surface | remains **13 paths**; no 14th path exists or is created |
| Pattern to use | the repository's own existing real-socket pattern: `http.createServer(...)` + `server.listen(0, ...)` as in `frontend/server/admin-transport.test.ts` |
| External infrastructure required | **NONE** â€” no container runtime, no IdP |
| Implementation behavior | **UNCHANGED** â€” this is test-only; no source file other than the named test file may be modified |
| Methodology touched | **NONE** â€” S1â€“S4, SR-1â€“SR-5, B1â€“B4, D1â€“D8, P7, TRIM-S, TRIM-V, HARVEST, EXIT, NO-DECISION all unchanged |
| Fences | all ten remain must-not-touch |
| Certification | **NOT** performed by this authorization |
| When | at a separate execution gate; **this record does not itself perform the work** |

Minimum acceptance for that follow-up, to be verified at its own gate:

1. a real `GET /api/ai-advisory/<sector>` over a real socket returns **200** with the
   governed 12-field DTO, using the deterministic advisor and the canonical `guardRead`;
2. the same request **without** a token returns **401** (no unauthenticated success path);
3. the no-IdP branch returns **401 `authentication unavailable (no IdP configured)`**;
4. the existing 130 authorized tests continue to pass and the full suite remains green.

## 5. CERTIFICATION READINESS AFTER THIS RECORD

| Former blocker | State now |
|---|---|
| **D-AUTH-CP** | **RESOLVED** by `DEC-G-AI-IMPL-IMPL-COMMIT-PUSH` |
| **D-CERT-CRITERIA** | **RESOLVED** by Â§2 of this record |
| **G-LIVE-TEST** | **RESOLVED** as Option D â€” live validation is a recorded limitation, not a blocker |
| **G-DISPATCH-COVERAGE** | **AUTHORIZED, NOT YET PERFORMED** â€” outstanding work item |
| **D-11V13** | **RESOLVED** by the amendments recorded in `DEC-G-AI-IMPL-PATH-COUNT` |
| **D-DUR-7** | **CLOSED** |

**Remaining outstanding item before certification:** the G-DISPATCH-COVERAGE test
addition (Â§4). Everything else is resolved or is a recorded environment limitation.

## 6. WHAT THIS RECORD DOES NOT DO

| Item | Status |
|---|---|
| Perform certification | **NO** |
| Promote a certification version | **NO** |
| Reopen P7 | **NO** |
| Alter implementation behavior | **NO** |
| Create a 14th path | **NO** |
| Modify any source file | **NO** â€” the Â§4 authorization is test-only and is executed at a later gate |
| Mark any unavailable test as PASS | **NO** |
| Import, restore or derive from the recovered live-certification test | **NO** |

## 7. CLASSIFICATION

- **D-CERT-CRITERIA â€” RESOLVED** (criteria defined, Â§2)
- **G-LIVE-TEST â€” RESOLVED as OPTION D** (Â§3)
- **G-DISPATCH-COVERAGE â€” AUTHORIZED, OUTSTANDING** (Â§4)
