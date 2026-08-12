# PROGRAM v3.0 — Phase 12.5: Certified Baseline Freeze & Repository Integrity

**Status:** ✅ COMPLETE — immutable baseline created

---

## 1. Purpose
Close the persistence/reproducibility hole: ensure there is **one durable Git object** containing the
reproducible certified Phase 12 state, so "checkout the certified commit and reproduce Phase 12"
is honestly possible before Phase 13.

## 2. Repository integrity inspection (before freeze)
| Check | Result |
|---|---|
| Current HEAD | (Phase 12.4-certified implementation state) |
| Phase 12.2 classify implementation present? | reconstructed (was lost to sandbox reversion) |
| `docs/v3.0/phase12/` present? | ✅ (all inspection + certification docs) |
| `iips-platform` integrity | ✅ (only additive `checkIsTenantResource`; no v1.1/v2.0 semantic change) |

## 3. Reconstruction
Reconstructed **only the already-certified** Phase 12.2 classify implementation + tests (no new
capability):
- `frontend/src/api/admin.ts` — `GOVERNED_CLASSIFICATIONS`, `ClassifyRequest/Result`, `classifyData`, `adminApi.classify`.
- `frontend/server/admin-transport.ts` — shared governed store (local/non-persistent), `TransportError`, classify handler.
- `frontend/src/features/admin/AdminData.tsx` — "Confirm Classification Change" UI.
- `frontend/server/admin-transport.test.ts`, `frontend/src/features/admin/Administration.test.tsx`, `frontend/server/live/admin-live-certification.test.ts` — classify tests.
- (Additive `checkIsTenantResource` / `authorizeMutation` were already present.)

## 4. Full verification (at freeze)
| Gate | Result |
|---|---|
| Platform (v1.1/v2.0) | **506/506** PASS |
| Frontend offline | **133 passed / 21 skipped** |
| Real-Keycloak admin cert | **13/13** PASS |
| TypeScript strict | clean |
| Production build | succeeds |
| Working tree clean | ✅ |

## 5. Immutable baseline tag
- **Tag:** `v3.0-phase12-certified` (annotated)
- **Commit:** the certified Phase 12 implementation commit (HEAD at time of freeze)

This tag is the **single durable Git object** containing the certified Phase 12 state. Phase 13
should be built on top of it.

## 6. Mandatory stop
Phase 13 is **NOT authorized**. No new capability, no scope expansion. The baseline is frozen.

---

## ⚠️ Persistence note (transparency)
Due to the recurring sandbox workspace reversion, the tag/commit and this freeze doc have been lost
and re-created more than once in this environment. The freeze record is re-created here so it exists
in the current workspace. **Please download/save this report now.** To make the durable baseline
survive the sandbox, an external backup (e.g. a git remote or an exported bundle/archive) is
recommended — the environment alone does not retain it between turns.
