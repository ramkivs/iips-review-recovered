# PROGRAM v3.0 — Phase 13: Field → Source Map

Every potential Phase 13 UI field mapped: **UI Field → API DTO → governed contract → certified
source → authority → read/write → tenant scope → audit → status.**

Convention — **Status:** ✅ AVAILABLE · ⚠️ PARTIAL · ❌ UNAVAILABLE (no governed source — never fabricate).

## AI Explanation (candidate; governed, non-authoritative)

| UI Field | API DTO | Governed contract | Certified source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Advice kind | `AiAdvice.kind` | `AiAssistedRuntime` | advisory output | Platform (advisory) | READ | ✅ | ⚠️ | ✅ (as explanation) |
| Advice text | `AiAdvice.text` | `AiAssistedRuntime` | advisory output | Platform | READ | ✅ | ⚠️ | ✅ |
| Grounded flag | `AiAdvice.grounded` | `AiAssistedRuntime` | advisory output | Platform | READ | ✅ | ⚠️ | ✅ |
| Model / version | `AiAdvice.model`/`modelVersion` | `AiAssistedRuntime` | advisory output | Platform | READ | ✅ | ⚠️ | ✅ |
| Engine result ref | `AiAdvice.engineResultRef` | `AiAssistedRuntime` | certified result link | Platform | READ | ✅ | ⚠️ | ✅ |
| Non-authoritative marker | `AiAdvice.nonAuthoritative` | `AiAssistedRuntime` | advisory output | Platform | READ | ✅ | ⚠️ | ✅ |
| AI provider / config / usage / policy | ❌ | ❌ | — | — | — | — | — | ❌ UNAVAILABLE |

## Platform Operations read (candidate extension)

| UI Field | API DTO | Governed contract | Source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Node health | `NodeHealth` | `CloudHaRuntime.checkHealth` | HA registry | Platform | READ | global | ⚠️ | ✅ |
| HA coordinator / quorum | `coordinator()` | `CloudHaRuntime` | HA registry | Platform | READ | global | ⚠️ | ✅ |
| DR backup id / lineage | `DrBackup` | `DisasterRecoveryRuntime` | DR runtime | Platform | READ | global | ⚠️ | ✅ |
| Corruption list | `detectCorruption()` | `DisasterRecoveryRuntime` | DR runtime | Platform | READ | global | ⚠️ | ✅ |
| Trace records | `TraceRecord` | `V2Observability.list/byTrace` | telemetry | Platform | READ | global | ✅ | ✅ |
| Performance sample | `ScalingSample` | `PerformanceScaling` | measurement | Platform | READ | global | ⚠️ | ✅ |

## Existing delivered fields (re-verified for Phase 13 source-of-truth)

All Phase 12 admin fields map to governed contracts (see Phase 12 `admin-field-source-map.md` and
`frontend/src/api/admin.ts`). No fabricated users/tenants/permissions/health/audit/market data.

## Explicitly UNAVAILABLE fields (never fabricate)
- AI configuration / provider / model / policy / usage / governance
- User directory / lifecycle · Tenant metadata / creation / quota · Role/permission editing
- System configuration · Persistent quota / entitlement
- Migration execution / rollback
- Golden expected-outputs as a live source
- Deterministic test market-data fields as production market data

> **Rule:** if a governed source does not exist for a field, it is shown as **UNAVAILABLE** — never a
> fabricated `0`, derived value, or placeholder contract.
