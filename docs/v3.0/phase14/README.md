# PROGRAM v3.0 — Phase 14: Contract & Scope Inspection

**Status:** CONTRACT & SCOPE INSPECTION — COMPLETE (documentation only; **no implementation**)

**Baseline:** `v3.0-phase13-certified` (frozen) — preserved. No earlier-phase reconstruction.

---

## 1. What this phase is

Phase 14 establishes what the next governed v3.0 milestone can legitimately expose from the
certified platform **after** the Phase 12 (Administration + Data Classification) and Phase 13 (AI
Explanation) baselines — without inventing capabilities, without redefining engine/authorization
semantics, and without bypassing the frozen G3 security boundary.

**This is inspection only.** No implementation, no endpoints, no UI, no mutations, no
v1.1/v2.0/Phase12/Phase13 contract changes, no AI expansion.

## 2. Frozen baseline (must remain immutable)

| Item | Value |
|---|---|
| Tag | `v3.0-phase13-certified` |
| Phase 12 | Administration + Data Classification (certified/frozen) |
| Phase 13 | AI Explanation (certified/frozen) |
| v1.1 / v2.0 | unchanged (only approved additive `checkIsTenantResource`/`authorizeMutation`) |
| G3 | Keycloak (WHO) · EnterpriseRuntime/ApiSecurity (WHAT MAY THEY DO) · SecuredExecutor boundary |

## 3. Non-negotiable boundaries

- **v3.0 / React** = presentation, navigation, interaction, state only. React is NOT an authority.
- **G3** preserved: no second RBAC/audit system, no localStorage/URL/header/query authority, no
  ad-hoc JWT, no custom password.
- **Source-of-truth rule:** every proposed UI field maps
  `UI field → API DTO → governed contract → certified source`. If no governed source exists →
  **"Unavailable"** — never fabricate.
- **No AI expansion/configuration** in Phase 14 (AI config/governance remains UNAVAILABLE).

## 4. Method

For each candidate capability: does a governed contract exist? read/write/mutation? authorization?
tenant scope? audit? persistence? reversibility/idempotency? certification guarantee? UI suitability?

Capabilities with no governed source → **UNAVAILABLE**; missing security properties → **platform
governance gaps** (not solved in React/transport).

## 5. Headline finding

The exposed, certified surface is rich and stable:

- **Research/decision/evidence surfaces** (executive, portfolio, company, cross-sector,
  decision-matrix, evidence, replay) — all read-only, viewer-level.
- **Administration** (Phase 12) — read-only + the single certified `data-governance/classify` mutation.
- **AI Explanation** (Phase 13) — read-only, non-authoritative.

**Governed-but-unexposed candidates** (requiring their own authorization):
- **Workflow read** (`WorkflowRuntime.version`, definitions) — governed read, currently only
  `version()` exposed; full definitions/execution history not surfaced.
- **Platform API surface** (`PlatformApi`) — governed execute/isIdempotent; not a UI admin surface.
- **Live data source metadata** beyond admin (`LiveDataRuntime`/`DataSourceMeta`) — already partially
  in admin.
- **Workflow/evidence/replay deeper drill-downs** (some already surfaced).

**Deliberately UNAVAILABLE / not to be invented:** user/tenant/role/permission CRUD, system
configuration, AI configuration/governance, quota/entitlement editing, migration exec/rollback,
engine/DR/marketplace lifecycle (all PLATFORM-ONLY per prior inspections), golden outputs as live
source.

## 6. Phase discipline

Inspection → Review → Explicit authorization → Implementation → Certification. **Never merged.**
This is the inspection gate; Phase 14.1 implementation is NOT authorized.

## 7. Deliverables (in this directory)

| File | Contents |
|---|---|
| `README.md` | Scope, boundaries, status |
| `contract-inspection.md` | Platform/frontend/G3 contract findings |
| `capability-matrix.md` | Capability × contract × read/write × authz × tenant × audit |
| `phase14-information-architecture.md` | Candidate IA from discovered capabilities only |
| `field-source-map.md` | UI field → DTO → contract → certified source |
| `authority-and-security-map.md` | Authority chain + security map |
| `mutation-inventory.md` | Candidate mutations + security properties |
| `phase14-gap-analysis.md` | G1–G5 gap classification |
| `phase14-security-review.md` | Threat / security-boundary findings |
| `phase14-recommendation.md` | Recommended scope + explicit UNAVAILABLE items |

## 8. Mandatory stop

No implementation performed. Await explicit approval of this inspection before any Phase 14.1 work.
