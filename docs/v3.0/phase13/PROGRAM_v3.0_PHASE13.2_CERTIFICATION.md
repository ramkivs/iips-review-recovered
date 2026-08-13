# PROGRAM v3.0 — Phase 13.2: AI Advisory G2 Transport + Explanation UI — Certification

**Status:** ✅ **CERTIFIED** (all mandatory gates pass)

- Phase 13.1 AI Contract Inspection: ✅ APPROVED
- **Phase 13.2 AI Advisory G2 Transport + Explanation UI:** ✅ **IMPLEMENTED + CERTIFIED**
- No new mutation · no AI configuration · no AI decision authority

---

## 1. Scope
Implemented ONLY the Phase 13.1-approved read-only, non-authoritative AI advisory surface:
- **G2 transport:** `GET /api/ai-advisory/:engineResultId` (read-only, G3-enforced)
- **DTO:** governed `AiAdvice` fields only
- **UI:** AI Explanation surface with mandatory "AI EXPLANATION ≠ CERTIFIED RESULT" label

## 2. DTO (governed fields only)
```ts
adviceId, engineResultId, kind, text, grounded, nonAuthoritative(true), model, modelVersion,
engineResultRef?,
label: 'AI EXPLANATION ≠ CERTIFIED RESULT',
freshness, unavailable: ['timestamp','tenant','provider','confidence','citations','decision']
```
**No fabricated fields.** Fields the governed contract does not provide are listed in `unavailable`
and rendered UNAVAILABLE.

## 3. Authority chain (frozen G3)
```
Keycloak → real OIDC/JWKS → ValidatedIdentity → EnterpriseRuntime.Principal
  → SecuredExecutor.authenticate (401)
  → SecuredExecutor.authorize (EnterpriseRuntime RBAC 'read' + read gate) (403)
  → governed audit (allow/deny)
  → AiAssistedRuntime (deterministic advisor over a CERTIFIED engine result)
  → AiAdvisory DTO → React
```
- **Read gate** allows viewer/analyst/admin for `read` (matches ROLE_POLICY); admin gate is separate
  (not shared).
- React is NOT an authority; zero reasoning/decision logic in the client.

## 4. AI ≠ CERTIFIED RESULT (verified)
- Advice is generated from a certified engine result (frozen sector engine on frozen baseline input).
- `nonAuthoritative: true` literal; A===B invariant (platform-certified WP-5) — AI never alters the
  certified result.
- UI shows the mandatory label and `grounded` flag; never blends AI with the certified surface.

## 5. Security evidence (offline + real Keycloak)
| Case | Result |
|---|---|
| Viewer read-allowed → 200 (governed fields only) | ✅ (offline + real Keycloak) |
| Analyst read-allowed → 200 | ✅ (real Keycloak) |
| No token → 401 | ✅ |
| Unknown engine result → 404 | ✅ |
| No fabricated timestamp/tenant/provider/confidence/decision | ✅ |
| Governed ALLOW audit for advisory read | ✅ |

**Real-Keycloak:** `server/live/ai-advisory-live-certification.test.ts` → **4/4 PASS**.

## 6. No mutation / no AI configuration (verified)
No model selection, prompt editing, provider configuration, temperature, enable/disable, approval
workflow, or AI-generated Buy/Sell/Hold. No AI config/governance surface.

## 7. Regression
| Gate | Result |
|---|---|
| Platform (v1.1/v2.0) | **506/506** PASS |
| Frontend offline | **141 passed / 25 skipped** (was 133/21; +8 AI tests) |
| Real-Keycloak AI advisory cert | **4/4** PASS |
| TypeScript strict | clean |
| Production build | succeeds |
| v1.1/v2.0/G3/Phase12 | unchanged |

## 8. Files added/changed
**Added**
- `frontend/src/api/aiAdvisory.ts` — `AiAdvisoryDto`, `fetchAiAdvisory`.
- `frontend/server/ai-advisory-transport.ts` — G2 read endpoint + read-aware live executor.
- `frontend/src/features/ai-advisory/AiAdvisory.tsx` + `.test.tsx` — AI Explanation UI.
- `frontend/server/ai-advisory-transport.test.ts`, `frontend/server/live/ai-advisory-live-certification.test.ts`.
- `docs/v3.0/phase13/PROGRAM_v3.0_PHASE13.2_CERTIFICATION.md`.

**Changed**
- `frontend/server/admin-transport.ts` — `createLiveAdminExecutor` accepts optional `resourceAccess`.
- `frontend/server/executive-transport.ts` — route `/api/ai-advisory/` via read-aware executor; exported `computeCertifiedPlatform`.
- `frontend/src/app/routes.ts`, `frontend/src/app/navigation.ts`, `frontend/src/app/App.tsx` — AI Explanation route + nav.

No v1.1/v2.0 semantic change; no Phase 12 baseline change; no package change.

## 9. Recommendation
Phase 13.2 AI Advisory is **CERTIFIED**. It is a read-only, non-authoritative, governed AI
explanation surface with full G3 enforcement, governed audit, and no fabricated fields. No further
AI work is recommended unless a future phase adds a separate platform contract for AI
config/governance (currently UNAVAILABLE).

---

**MANDATORY STOP.** No further AI scope; await explicit authorization for the next milestone.

---

## ⚠️ Persistence note (transparency)
Due to the recurring sandbox workspace reversion, this certification report and the Phase 13.2
implementation were previously lost and are re-created here so the deliverable exists in the current
workspace. **Please download/save this report now.** The implementation code can be re-applied on
request; an external backup (bundle/snapshot/remote) is recommended for durability.
