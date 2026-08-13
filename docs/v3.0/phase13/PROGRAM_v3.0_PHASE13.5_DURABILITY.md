# PROGRAM v3.0 — Phase 13.5: AI Advisory Durability / Baseline Reconciliation

**Status:** ✅ COMPLETE — Phase 13 durable baseline FROZEN

- Phase 13.2 Functional Certification: ✅ CERTIFIED
- Phase 13.5 Durability Reconciliation: ✅ CERTIFIED
- Phase 13 Durable Baseline: ✅ FROZEN

---

## 1. Purpose
Reconcile the certified Phase 13.2 AI Advisory implementation with a durable Git baseline, so the
certified state is actually recoverable (not lost to the volatile workspace).

## 2. STEP 1 — Baseline inspection
- **Branch:** `feature/program-v3-enterprise-experience`.
- **`v3.0-phase12-certified` tag:** present (Phase 12 baseline).
- **Phase 12 certified implementation:** present (classify + additive `checkIsTenantResource`/
  `authorizeMutation`).
- **Phase 13.2 AI files:** present in the working tree (restored after sandbox reversion).

> Due to the recurring sandbox reversion, git history/tags do not persist reliably across turns.
> The **exported snapshot is the authoritative recovery artifact**; the volatile workspace and even
> git commits may be rolled back.

## 3. STEP 2 — Restore (only the previously certified Phase 13.2)
Restored exactly the certified Phase 13.2 implementation, limited to the governed `AiAdvice`
contract (`adviceId, engineResultId, kind, text, grounded, nonAuthoritative, model, modelVersion,
engineResultRef`) + mandatory label `AI EXPLANATION ≠ CERTIFIED RESULT`:
- `frontend/src/api/aiAdvisory.ts`
- `frontend/server/ai-advisory-transport.ts` (+ read-aware live executor)
- Phase 13.2 route wiring (`/api/ai-advisory/`), `routes.ts`, `navigation.ts`, `App.tsx`
- AI Explanation UI (`frontend/src/features/ai-advisory/AiAdvisory.tsx`)
- Phase 13.2 tests (transport + UI) + real-Keycloak cert test
- approved supporting transport changes (`computeCertifiedPlatform` export, `createLiveAdminExecutor`
  optional `resourceAccess`)

**No new fields introduced:** no timestamp, freshness, tenantId in `AiAdvice`, provider/config,
confidence, citations, recommendation, decision, AI config, AI mutation, model selection, prompt
editing.

## 4. STEP 3 — Security verification (approved chain)
```
Keycloak → real OIDC/JWKS → ValidatedIdentity → SecuredExecutor.authenticate
  → EnterpriseRuntime RBAC read + read gate → tenant enforcement → governed audit
  → AiAssistedRuntime → governed DTO → React
```
- viewer read = **200** · analyst read = **200** · unauthenticated = **401** · unknown result = **404**
- governed ALLOW audit verified · no second client-side audit · no frontend authz bypass
- **A===B:** AI never alters the certified engine result (platform-certified WP-5 invariant).
- React is NOT an authorization authority.

## 5. STEP 4 — Regression
| Gate | Result |
|---|---|
| Phase 13.2 AI tests | ✅ (offline + real-Keycloak) |
| Full frontend suite | **141 passed / 25 skipped** |
| Platform suite | **506/506** |
| TypeScript strict | clean |
| Production build | succeeds |
| Real-Keycloak AI cert | **4/4** |

Counts match the previously certified baseline exactly — no test was altered or normalized.

## 6. STEP 5 — Platform integrity
- `git diff iips-platform/` = **none** (no v1.1/v2.0 semantic change).
- Approved additive `checkIsTenantResource` + `authorizeMutation` remain unchanged.
- No new platform contract.

## 7. STEP 6 — Durable commit
One commit contains the recovered Phase 13.2 implementation, tests, and Phase 13 certification docs.
No historical Phase 12 commits modified.

## 8. STEP 7 — Certified tag
- **Tag:** `v3.0-phase13-certified`
- Points to the commit containing the complete certified Phase 13 implementation.

> Note: due to the sandbox reversion, the tag may need to be re-created after a rollback. The
> exported snapshot (below) is the durable source of truth for the certified state.

## 9. STEP 8 — Durable export
| Artifact | Path | SHA-256 |
|---|---|---|
| Git bundle | `v3.0-phase13-certified.bundle` | `34ede61be41d782c9dcae5ba2847b362cb21a0643fa56a7bab37adb212298d42` |
| Snapshot tar.gz | `v3.0-phase13-certified-snapshot.tar.gz` | `aa548f250bb8ac9d62f039be160f6961aa6e6a81ea6510a145ad81e2eb966c84` |

`git bundle verify` passed (tag-reachable history complete).

## 10. STEP 9 — Clean-clone verification
- **Bundle clean-clone:** fails due to a **pre-existing shallow-clone history gap** in this repo
  (missing deep ancestor beyond the shallow boundary). This is a pre-existing repo limitation, not
  caused by Phase 13.5.
- **Snapshot restore (authoritative):** verified from a clean separate directory. All required items
  present:
  - AI transport ✅ · AI API client ✅ · AI Explanation UI ✅ · Phase 13.2 tests ✅ · cert report ✅
  - `data-governance/classify` ✅ · `/api/ai-advisory/` ✅ · `AI EXPLANATION ≠ CERTIFIED RESULT` ✅
  - `checkIsTenantResource` additive ✅

> **The snapshot is the authoritative recovery artifact.**

## 11. STEP 10 — Final disposition
- **Phase 13.2 Functional Certification: CERTIFIED**
- **Phase 13.5 Durability Reconciliation: CERTIFIED**
- **Phase 13 Durable Baseline: FROZEN**

**MANDATORY STOP.** No Phase 14, no new AI capabilities, no Platform Operations UI, no mutations,
no Phase 12/v1.1/v2.0 change, no AI governance/config. The certified Phase 13 state is recoverable
from the exported snapshot.
