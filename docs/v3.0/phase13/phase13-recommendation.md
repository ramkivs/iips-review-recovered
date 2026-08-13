# PROGRAM v3.0 — Phase 13: Recommendation

Recommended Phase 13 scope and explicit UNAVAILABLE items. **Inspection only — no implementation.**

## 1. What Phase 13 can legitimately expose (governed, discovered)

Based solely on discovered governed contracts after the certified Phase 12 baseline:

- **AI Explanation surface** (read-only, **non-authoritative**) over `AiAssistedRuntime`:
  per-engine-result advisory (explanation/summary/hypothesis/anomaly/research), with `grounded`
  flag, model/version, engine-result link, and a mandatory **AI EXPLANATION ≠ CERTIFIED RESULT**
  label. This is the most distinct governed capability not yet exposed.
- **Platform Operations read extension** (optional): HA node health, DR/backup status, telemetry,
  performance measurements — read-only, no new mutation (partially already delivered in admin).
- **Keep Administration closed** (Phase 12 certified/frozen).

## 2. What requires only UI work (G1)
- AI explanation rendering (using Phase 4 components + authority badges).
- Optional Platform Ops read tables.

## 3. What requires G2 transport work (G2)
- A read-only AI advisory endpoint (if the AI surface is authorized) exposing `AiAssistedRuntime`
  advice for a certified engine result, enforced via the frozen chain.
- (Optional) read-only HA/DR/telemetry endpoints if not already present.

## 4. What requires v2.0 platform work (G3 — NOT a React problem)
AI configuration/governance, user/tenant/role/permission CRUD, system configuration, quota/
entitlement ledger, migration exec/rollback, audit query/export, engine/DR/marketplace lifecycle —
all require new platform contracts (separate governance decision).

## 5. What must remain UNAVAILABLE
Everything in §4, plus: golden outputs as a live source; deterministic test market-data as
production data; AI presented as decision authority; any mutation without a governed RBAC + tenant +
audit wrapper.

## 6. Read-only / mutation
**All recommended Phase 13 capabilities are read-only.** **No new mutation is recommended in
Phase 13.** The single certified mutation (data classification) is already delivered and frozen.

## 7. Mutations requiring additional platform governance
Migration exec/rollback, engine/DR/marketplace lifecycle, AI config — require new platform contracts;
not a v3.0 concern.

## 8. Recommended Phase 13 sequence (ONLY after explicit implementation authorization)
1. **G2 AI advisory read endpoint** (if AI surface authorized) — enforced via the frozen chain.
2. **G1 AI Explanation UI** — non-authoritative advisory, authority/freshness labels, grounded flag.
3. **G1 Platform Operations read** (optional) — HA/DR/telemetry/perf read tables.
4. **Certification gate** — regression (platform 506/506, frontend suite), tsc, build, real Keycloak,
   security tests (401/403/tenant/audit), AI ≠ CERTIFIED provenance check.

## 9. Proposed certification gates
For each authorized capability: governed state only (no fabrication); admin/analyst/viewer access
per contract; tenant isolation; 401/403; governed audit; AI surface labeled non-authoritative and
grounded; no v1.1/v2.0/G3/Phase12 change; full regression; production build.

## 10. Final status
- **Phase 13 implementation: NOT AUTHORIZED.** This inspection is the deliverable.
- **Recommended shape:** a **read-only, governed AI-explanation + optional Platform-Ops-read**
  surface, with **no new mutation**, all backed by governed contracts and the frozen G3 boundary.
- Broad CRUD / configuration / AI-governance / lifecycle mutation is **deliberately absent** and must
  remain UNAVAILABLE or platform-governed.

---

**MANDATORY STOP reached.** Awaiting explicit maintainer approval before any Phase 13 implementation
milestone.
