# DEC-G-AI-IMPL-CERTIFICATION — G-AI-IMPL Implementation Certification Record

- **Record ID:** `DEC-G-AI-IMPL-CERTIFICATION`
- **Title:** G-AI-IMPL Implementation Certification — Durable Record of the Determination
- **Class:** `CERTIFICATION` / `DECISION`
- **Status:** `RECORDED — CERTIFIED, WITH RECORDED LIMITATIONS`
- **Date:** 2026-08-27
- **Authority relationship:** gate `G-AI-IMPL CERTIFICATION RECORDING AUTHORITY`. The
  maintainer explicitly authorized durable recording of the certification determination
  reached at the preceding `G-AI-IMPL FINAL CERTIFICATION GATE`, with the mutation scope
  limited to this record plus one amendment line in `AUTH-G-AI-IMPL`.
- **Scope:** records a determination already reached. It authorizes **nothing new** — no
  release, no version promotion, no P7 action, no further implementation, no further
  commit or push of implementation work, and no live-validation activity.

---

## 1. CERTIFIED ARTIFACT

```
certified implementation SHA   f63a9b493118643725568a95b86405a5835a30a0
                               (= origin/gai-impl-canonical at the time of certification)
canonical baseline             85bbd49cd31c215a8fd0e7651b718861944dfe45
parent chain                   85bbd49cd31c215a8fd0e7651b718861944dfe45
                                 -> e5d59981c10578db0bf7a5b656acccb9450f45e0   (13-path implementation)
                                 -> f63a9b493118643725568a95b86405a5835a30a0   (G-DISPATCH-COVERAGE)
merge commits in the chain     0
authority branch at recording  origin/arena/01a03e3b-iips-review-recovered = 34256044035bca91509308f803c3fea9324aebec
```

## 2. CERTIFIED SCOPE — EXACTLY THE 13-PATH DELTA

Nothing outside this surface is certified.

```
frontend/server/ai-advisory-transport.ts
frontend/server/ai-advisory-transport.test.ts
frontend/src/api/aiAdvisory.ts
frontend/src/components/ai/AiExplanation.tsx
frontend/src/components/ai/AiExplanation.test.tsx
frontend/server/executive-transport.ts
frontend/src/features/company/CompanyIntelligence.tsx
frontend/src/features/company/CompanyIntelligence.test.tsx
frontend/src/features/research/SectorIntelligence.tsx
frontend/src/features/research/SectorIntelligence.test.tsx
frontend/src/features/decision-matrix/DecisionMatrix.tsx
frontend/src/features/decision-matrix/DecisionMatrix.test.tsx
frontend/src/app/navigation.test.ts
```

Blob identities at `f63a9b49`: 12 files byte-identical to `e5d59981`; the thirteenth,
`frontend/server/ai-advisory-transport.test.ts`, is `775d412beb9109f791d2b6ed6744fd465ddcaf4a`
— the authorized G-DISPATCH-COVERAGE revision. `git diff --name-only 85bbd49 f63a9b49`
returns exactly these 13 paths and no others.

## 3. CERTIFICATION RESULTS — CRITERIA A–M

Criteria are those defined durably in `DEC-G-AI-IMPL-CERT-CRITERIA` (blob `902b8c8b597e…`).
Every REQUIRED criterion was executed afresh at the certification gate.

| ID | Criterion | Classification | Result |
|---|---|---|---|
| **A** | Static / source validation (S1, S2 exact text, S3-A, S4 codes, SR-1…SR-5 markers, D6/D7) | REQUIRED | **PASS** — 12/12 static checks against the pushed blob |
| **B** | Typecheck — client `tsc --noEmit` and server `tsc --noEmit -p tsconfig.server.json` | REQUIRED | **PASS** — both exit 0 |
| **C** | Production build (`tsc -b && vite build`) | REQUIRED | **PASS** — exit 0 |
| **D** | Complete automated suite (`vitest run`) | REQUIRED | **PASS** — **656 passed / 21 skipped / 0 failed**; 51 files passed / 2 skipped |
| **E** | Test obligations **T1 … T10** | REQUIRED | **PASS** — **135 passed / 0 failed** across the 6 delta test files |
| **F** | Specification requirements **SR-1 … SR-5** | REQUIRED | **PASS** |
| **G** | Real HTTP / dispatch coverage (infrastructure-independent) | REQUIRED | **PASS** — 5 real-socket tests through the actual `executive-transport` `/api/ai-advisory/` dispatch listener |
| **H** | Authenticated live HTTP 200 advisory request | REQUIRED ONLY IF INFRASTRUCTURE AVAILABLE | **NOT PERFORMED** — see §5 |
| **I** | Real Keycloak authentication | REQUIRED ONLY IF INFRASTRUCTURE AVAILABLE | **NOT PERFORMED** — see §5 |
| **J** | Live browser rendering | REQUIRED ONLY IF INFRASTRUCTURE AVAILABLE | **NOT PERFORMED** — see §5 |
| **K** | Recovery-evidence and ten-fence verification | REQUIRED | **PASS** — 10/10, six blobs preserved |
| **L** | Provenance: A===B, `engineResultUnchanged`, adviceLog lineage, snapshotRef | REQUIRED | **PASS** |
| **M1** | No unauthenticated advisory success path | REQUIRED | **PASS** — missing token 401, expired token 401, real-dispatch no-token 401 |
| **M2** | Host no-regression on all three embedded surfaces (T6) | REQUIRED | **PASS** — 6 T6 tests |
| **M3** | Navigation / route inventory unchanged (T7, D3/D4) | REQUIRED | **PASS** — 3 T7 tests |

**No unavailable test is recorded as PASS.** H, I and J are recorded as `NOT PERFORMED`.

### 3.1 Supporting detail

- **Typecheck / build:** client `tsc --noEmit` exit 0; server
  `tsc --noEmit -p tsconfig.server.json` exit 0; `tsc -b && vite build` exit 0.
- **Ten fences:** `routes.ts` `ea1fd329460a` · `navigation.ts` `03fcf14d7db9` ·
  `Sidebar` `f1d22d3d0536` · `AppShell` `e05b823faf9e` · `App` `15e638ed5b6f` ·
  `admin-transport.ts` `a32d485ae450` · `secured-executor.ts` `f85692ddd0be` ·
  `PROGRAM_v1.1_REPLAY_BASELINE.json` `63bcd350f2cd` · `ROADMAP.md` `b5485618f8db` ·
  `INTEGRATION_VERIFICATION_MATRIX.md` `4967b0232afc` — all byte-identical to `85bbd49`.
  `iips-platform/**`: **0** blobs differing. `ies-0*` + `iips-cross-sector`: **0** blobs
  differing. **0 fence failures.**
- **Provenance / A===B / adviceLog:** `executeWithAi` is the sole orchestration path
  (`advisor.advise(` occurrences = 0); "returns the engine result unchanged (A===B)";
  "proves AI ON and AI OFF produce the identical engine result"; "records adviceLog lineage
  for the advice it produced"; "does not mutate the engine result"; `engineResultRef`
  matches `^SNAP_[0-9A-F]{8}$` and is not a synthesized `snap_<sector>`.
- **G dispatch coverage:** the `/api/ai-advisory/` dispatch branch inside the module-scope
  `http.createServer` callback in `executive-transport.ts` is exercised over a **real
  socket** on a real ephemeral port, with the production request listener captured rather
  than re-implemented. Five tests: 200 with the exact 12-field DTO · no-IdP fail-closed 401
  with no fabricated payload · no-token 401 · unknown-sector 404 · prefix specificity 404.

## 4. CERTIFIED PROPERTIES

- Governed read authorization via canonical `guardRead`, resource **`read.ai-advisory`**
  (SR-4). No second RBAC model introduced.
- Dynamic sector coverage derived from `ENGINE_FACTORY` (13 engines) plus the frozen v1.1
  Replay Baseline; **no sector enumeration** anywhere in the delta (SR-5, D5/D6).
- Advisory-only, non-authoritative presentation; D7 label
  `AI EXPLANATION ≠ CERTIFIED RESULT`; the fixed 122-character S2 sentence, byte-exact, with
  no interpolation; no `BUY` / `SELL` / `HOLD`.
- `freshness: 'SNAPSHOT'` (SR-2); `adviceId` produced by the canonical platform `adviceId()`
  helper (SR-3); genuine canonical `engineResultRef` (SR-1).
- Deterministic in-process advisor (S1): no external AI, no provider, no network, no
  additional reads, no scoring, re-ranking, storage, alerts, subscriptions, events or
  scheduling.
- `executeWithAi` sole path; the certified engine result is unchanged (A===B) and adviceLog
  lineage is retained (S3-A, L).
- S4 failure semantics: **404** unknown sector · **503 `advisory-unavailable`** ·
  **503 `engine-result-not-completed`** with the advisor body never invoked · **no fallback
  advice**, fabricated or partial.
- Fail-closed with no IdP configured; **no unauthenticated advisory success path** (M1).
- Host certified surfaces unchanged on all three embedded surfaces (M2); route and
  navigation inventories unchanged (M3).
- All ten must-not-touch boundaries intact; recovery evidence preserved (K, fence 10).

## 5. RECORDED LIMITATIONS — OPTION D (H / I / J)

Recorded verbatim. **These are limitations, not failures, and they are not PASS.**

> Live validation (H authenticated live HTTP 200, I real Keycloak authentication,
> J live browser inspection) is **required when the infrastructure exists**. The
> infrastructure did not exist at certification: `docker`, `podman`, `docker-compose`,
> `nerdctl`, `chromium`, `google-chrome` and `firefox` were all **NOT FOUND**; nothing
> answered on `127.0.0.1:8080`; no compose or IdP configuration is tracked in the
> repository. Under `DEC-G-AI-IMPL-CERT-CRITERIA` Option D this absence is recorded as a
> **certification limitation, not a failure**.

Additional recorded facts:

- The limitation is **not self-clearing**. If an IdP and browser become available, H, I and
  J must be performed and this limitation withdrawn by a further record.
- H is unreachable in that environment **by construction**, not by test omission: the
  dispatch branch returns `401 {"error":"authentication unavailable (no IdP configured)"}`
  whenever no read executor exists.
- **No 14th path was created** to pursue live validation. Option C of G-LIVE-TEST was
  available and was **not** selected.
- The recovered live-certification test
  (`frontend/server/live/ai-advisory-live-certification.test.ts`, blob `2bcaac3329de`)
  remains **recovery evidence only**. It was not imported, restored, copied or derived from.

## 6. DEFECT DISPOSITION AT CERTIFICATION

| ID | Status at certification |
|---|---|
| **D-DUR-7** | **CLOSED** — all seven previously non-durable implementation hashes are reachable from `f63a9b49`: `570471632871` `d0a6e1067665` `858f1f89fe81` `5e96a75f0c5e` `bb96a540f9a6` `033f42e5167b` `41e4b06cebf6` |
| **D-11V13** | **RESOLVED** — `SPEC-G-AI-IMPL` §4 and `AUTH-G-AI-IMPL` §2/§4 now state **13 paths (5 NEW + 8 MODIFY)**; see `DEC-G-AI-IMPL-PATH-COUNT`. The authorized path **set** was never altered |
| **D-AUTH-CP** | **RESOLVED** — see `DEC-G-AI-IMPL-IMPL-COMMIT-PUSH` |
| **G-DISPATCH-COVERAGE** | **CLOSED** — commit `f63a9b49`, 5 real-socket tests |
| **H / I / J** | **OPEN as recorded limitations** (§5) — non-blocking under Option D |
| **P7 verification gap** | **OPEN, recorded** (§7) — non-blocking |
| **Criteria status staleness** | **REFRESHED by this record** — `DEC-G-AI-IMPL-CERT-CRITERIA` §2's status column recorded 651/130, the pre-dispatch-coverage run; the certified values are **656 / 21 / 0** and **135 / 0**. The criteria *classifications* are unchanged and are not amended |

## 7. P7 — NOT REOPENED, AND A RECORDED VERIFICATION GAP

**P7 is not reopened.** No P7 item, artifact or entry was created, modified, promoted or
revisited by any part of the G-AI-IMPL work.

**Recorded gap, stated exactly as reported:** `P7` does not exist as an artifact in this
repository. At the certification gate it had **0** occurrences in tracked non-lockfile
files, **0** in `ROADMAP.md`, **0** in `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`, and
**0** in any governance record predating this session. The only tracked `P7` strings are
coincidental substrings inside base64 `integrity` hashes in the two `package-lock.json`
files. `ROADMAP.md` (`b5485618f8db`) and `INTEGRATION_VERIFICATION_MATRIX.md`
(`4967b0232afc`) are byte-identical to canonical `85bbd49`.

Therefore **"P7 unchanged" cannot be verified by comparison against a P7 baseline, because
no such baseline artifact exists.** It is verified only by the absence of any modification
and the absence of any P7 artifact. **P7 is NOT claimed as PASS.**

## 8. WHAT IS EXPRESSLY NOT CERTIFIED

| Item | Status |
|---|---|
| Anything outside the 13-path delta | **NOT CERTIFIED** |
| H — authenticated live HTTP 200 against a real realm | **NOT PERFORMED** |
| I — real Keycloak authentication | **NOT PERFORMED** |
| J — live browser rendering | **NOT PERFORMED** |
| Any live-Keycloak certification of the advisory surface | **NOT PERFORMED** |
| **Any certification version or release promotion** | **NOT PERFORMED — none promoted** |
| **P7** | **NOT REOPENED, and not claimed as PASS** (§7) |
| `phase13-next`, `main`, or any other branch | **NOT TOUCHED** |
| The engine master matrix, PC-4, N+5, E2E-017 | **NOT CHANGED** |
| Methodology: S1–S4, SR-1–SR-5, B1–B4, D1–D8, TRIM-S, TRIM-V, HARVEST, EXIT, NO-DECISION | **NOT ALTERED** |

## 9. RECOVERY EVIDENCE (FENCE 10 / COL-3)

Preserved at `origin/arena/01a03e3b-iips-review-recovered` `34256044035bca91509308f803c3fea9324aebec`:

```
0792a6a4ef32  frontend/server/ai-advisory-transport.ts
775d9150bd45  frontend/server/ai-advisory-transport.test.ts
2bcaac3329de  frontend/server/live/ai-advisory-live-certification.test.ts
322726b6023c  frontend/src/api/aiAdvisory.ts
8eda5c51b21b  frontend/src/features/ai-advisory/AiAdvisory.tsx
1113a6e3023b  frontend/src/features/ai-advisory/AiAdvisory.test.tsx
```

All six remain evidence only. The three formerly colliding implementation paths are
byte-distinct from their recovered counterparts (COL-4).

## 10. WHAT THIS RECORD DOES NOT DO

| Item | Status |
|---|---|
| Promote a certification version or release | **NO** |
| Reopen P7 | **NO** |
| Alter implementation behavior, source or tests | **NO** |
| Change the 13-path surface | **NO** |
| Convert H, I or J into PASS | **NO** |
| Create a new implementation or test path | **NO** |
| Amend any implementation commit | **NO** |
| Alter methodology or any fence | **NO** |
| Rewrite any historical governance record | **NO** |
| Authorize any further commit or push of implementation work | **NO** — each requires its own grant |

## 11. CLASSIFICATION

# **CERTIFIED — WITH RECORDED LIMITATIONS**

The G-AI-IMPL implementation at `f63a9b493118643725568a95b86405a5835a30a0` satisfies every
REQUIRED criterion of `DEC-G-AI-IMPL-CERT-CRITERIA`. Criteria H, I and J are recorded as
Option-D limitations, not as passes. The P7 verification gap is recorded and not claimed as
a pass. No version or release is promoted and P7 is not reopened.

## 12. RESIDUAL WORK (NOT AUTHORIZED BY THIS RECORD)

Closing the H/I/J limitation is a **later validation activity**, not a reason to reopen this
certification. It would require: an available container runtime and Keycloak realm, a
browser, and — if a live-certification test is to be added — a separately authorized change
to the 13-path surface. Withdrawal of the limitation requires a further governance record.
