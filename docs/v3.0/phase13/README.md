# PROGRAM v3.0 — Phase 13: Contract & Scope Inspection

**Status:** CONTRACT & SCOPE INSPECTION — COMPLETE (documentation only; **no implementation**)

**Branch:** `feature/program-v3-enterprise-experience`

---

## 1. What this phase is

Phase 13 determines what the next governed v3.0 milestone can legitimately expose from the
certified platform **after** the Phase 12 baseline — without inventing capabilities, without
redefining engine/authorization semantics, and without bypassing the frozen G3 security boundary.

**This is inspection only.** No React feature, route, endpoint, DTO, mutation, schema, platform
contract, auth, authorization, configuration, dependency, or adapter was created.

## 2. Frozen baseline (must remain immutable)

| Item | Value |
|---|---|
| Tag | `v3.0-phase12-certified` |
| Commit (this workspace) | `69b4a6772fa8fc6ddb29922f0102b3a1df7d75eb` |
| Immutable | tag + Phase 12 semantics + v1.1 + v2.0 + G3 + EnterpriseRuntime + ApiSecurity + golden provenance |

> Note: the maintainer's prompt cited commit `7325aeda…`; this sandbox's history was reverted by the
> environment, so the tag resolves to `69b4a677…`. The **tag and the certified state it points to**
> are authoritative; the literal commit hash differs due to the sandbox reversion.

## 3. Non-negotiable boundaries

- **v3.0 / React** = presentation, navigation, interaction, state presentation only. React is NOT an
  authorization, tenant, investment-decision, audit, or data-governance authority.
- **G3:** Keycloak answers WHO; `EnterpriseRuntime`/`PlatformApi.ApiSecurity` answer WHAT MAY THEY DO.
  Frontend visibility ≠ authorization.
- **Source-of-truth rule:** every proposed UI field maps
  `UI field → API DTO → governed contract → certified source`. If no governed source exists, display
  **"Unavailable"** — never fabricate.

## 4. Method

For each candidate capability: does a governed contract exist? read/write/mutation? authorization?
tenant scope? audit? persistence? reversibility/idempotency? certification guarantee? UI suitability?

Capabilities with no governed source are classified **UNAVAILABLE**; missing security properties are
classified as **platform-governance gaps**, not solved opportunistically in React/transport.

## 5. Headline finding

After the certified Phase 12 baseline, the governed, exposed capability surface is:

**Exposed (via G2 transport):** executive, portfolio, company, cross-sector, decision-matrix,
evidence, replay (all read-only) **+** the full Administration surface (read-only) **+** the single
authorized mutation `data-governance/classify`.

**Governed-but-not-yet-exposed (candidates for a future phase, requiring its own authorization):**
v2.0 distributed modules (`AiAssistedRuntime`, `CloudHaRuntime`, `DisasterRecoveryRuntime`,
`MigrationRuntime`, `PluginMarketplace`, `V2Observability`, `WorkflowRuntime`, `PerformanceScaling`,
`PlatformApi`, `LiveDataRuntime`) expose read and mutation surfaces that are **not** all wired into
the transport/UI.

**Deliberately UNAVAILABLE / not to be invented:** user CRUD, tenant CRUD, role CRUD, permission
editing, system configuration, AI configuration/governance, quota editing, migration
execution/rollback, engine lifecycle activation (as UI), marketplace activation, snapshot
create/restore, DR restore, node markDown/rollingRestart — unless backed by an explicit governed
contract + separate authorization (many are PLATFORM-ONLY per Phase 12.2 inspection).

## 6. Phase discipline

Inspection → Review → Explicit authorization → Implementation → Certification. **These gates are
never merged.** This deliverable is the inspection gate only; Phase 13 implementation is NOT
authorized.

## 7. Deliverables (in this directory)

| File | Contents |
|---|---|
| `README.md` | This file — scope, boundaries, status |
| `contract-inspection.md` | Complete platform/frontend/G3 contract findings |
| `capability-matrix.md` | Capability × contract × read/write × authz × tenant × audit matrix |
| `phase13-information-architecture.md` | Candidate IA from **discovered** capabilities only |
| `field-source-map.md` | UI field → DTO → contract → certified source |
| `authority-and-security-map.md` | Authority chain + security map (G3) |
| `mutation-inventory.md` | Every candidate mutation + security properties |
| `phase13-gap-analysis.md` | G1–G5 gap classification |
| `phase13-security-review.md` | Threat / security-boundary findings |
| `phase13-recommendation.md` | Recommended scope + explicit UNAVAILABLE items |

## 8. Mandatory stop

No implementation was performed. Per the authorization, **STOP** after the inspection package and
request explicit approval before any Phase 13 implementation milestone.
