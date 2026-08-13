# PROGRAM v3.0 — Phase 13: Gap Analysis

Gap classification: **G1** UI gap · **G2** transport gap · **G3** platform contract gap ·
**G4** governance/security gap (HARD STOP) · **G5** data-source gap.

## Gap inventory

| Area | Desired | Actual | Class | Action |
|---|---|---|---|---|
| AI explanation surface | Non-authoritative advisory per engine result | ✅ `AiAssistedRuntime` governed; not exposed via G2 | **G1 (+G2)** | Potential Phase 13 UI (read-only, non-authoritative) |
| Platform Ops read (HA/DR) | node health, DR status, telemetry, perf | ✅ contracts exist; partially exposed in admin | **G1** (mostly delivered) | Optional read-only extension |
| Migration / marketplace / workflow read | read-only history/registry/definitions | ✅ contracts; already in admin (read-only) | **G1 (covered)** | None needed (delivered) |
| AI configuration / governance | config/store/usage/policy | ❌ no contract | **G3** | UNAVAILABLE — not a React problem |
| User / tenant / role / permission admin | CRUD | ❌ no contract | **G3** | UNAVAILABLE (Keycloak-owned / no contract) |
| System configuration | config store | ❌ no contract | **G3** | UNAVAILABLE |
| Quota / entitlement | persisted ledger | ❌ no store (call-time param) | **G3** | UNAVAILABLE |
| Migration exec / rollback | run/rollback | ❌ no contract | **G3** | UNAVAILABLE |
| Audit query / pagination / export | robust query API | ⚠️ in-memory `auditLog` only | **G3** (platform) | presentational filter only |
| Audit correlation id on record | trace id on AuditRecord | ⚠️ trace on telemetry, not audit | **G3** (platform) | show if available else UNAVAILABLE |
| Engine lifecycle / DR restore / marketplace activation | UI mutation | ❌ no governed UI contract (platform-only) | **G3** | PLATFORM-ONLY |
| Golden outputs as live source | — | ❌ forbidden | **G5** | SNAPSHOT only |

## Classification summary

| Class | Count | Nature | v3.0 ownership |
|---|---|---|---|
| G1 (UI gap) | 1–2 | AI explanation (governed read, non-authoritative); optional HA/DR read | v3.0 UI + maybe G2 read endpoint |
| G2 (transport gap) | 1 | AI advisory not yet exposed via G2 | G2 read endpoint (if authorized) |
| G3 (platform contract gap) | 9 | AI config, user/tenant/role/permission, system config, quota, migration exec, audit query, engine/DR/marketplace lifecycle | **NOT a React problem** — separate platform governance |
| G4 (governance/security gap) | 0 | no insufficiency in authz/audit/tenant enforcement | — |
| G5 (data-source gap) | 1 | golden outputs as live source (forbidden) | show unavailable |

## Key conclusion

- **G4 = 0:** the governed security boundary is sufficient — no HARD STOP.
- The **only cleanly actionable Phase 13 gap** is **G1/G2**: exposing the governed, non-authoritative
  **AI advisory** surface (and optional read-only Platform Ops) — both read-only, no new mutation.
- **G3 gaps are intentionally absent by design** and must be reported as UNAVAILABLE; adding them is a
  separate platform-governance decision, never a v3.0/transport concern.
