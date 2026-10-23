# IIPS v3.0 — G3-D6 G-2 §3 Single-User Reading
## Program Authority decision record

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-G3-D6-G2-SECTION-3-CONFIRMATION-PA-DECISION-2026-10-19-01` |
| Decision | `G3-D6` — interpretation of the accepted G-2 §3 durable user-portfolio requirements in the single-user mechanism |
| Program Authority | Ramki, single owner/user and PA |
| Decision date | 2026-10-19 (UTC) |
| PA disposition | **`CONFIRM` — APPROVED**: all G-2 §3 requirements apply in full, including for single-user deployment |
| Decision source | Direct PA instruction in the execution request for this work; this is a PA decision, not an Arena recommendation |
| Governing records | `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`; `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md`; accepted Gate E W-1–W-16 policy; current IPD G3 request |

## 1. Rendered decision

> **G3-D6 — `CONFIRM` — APPROVED.** The full G-2 §3 requirement set applies without a single-user waiver. The mechanism may be single-user and non-production, but it may not omit owner, tenant/company context, durable identity, restart, versioning, migration, lifecycle, reset/deletion, concurrency, authorization, isolation, audit, lineage, contribution or idempotency obligations.

This confirms applicability, not implementation completion. No schema field, property name, API, migration identifier or implementation detail is invented by this record.

## 2. Complete requirement map

The table maps each accepted obligation to the future implementation/qualification evidence that must demonstrate it. It is a control map, not a schema definition. `Not current evidence` means the requirement remains unimplemented or unqualified on the inspected heads.

| G-2 §3 requirement | Confirmed reading and controlling authority | Required future evidence / current status |
|---|---|---|
| Explicit principal/owner | The single active local binding is the authority; ownership is resolved per request and is not supplied by the browser/IRR. | Gate 3 binding/authority tests; Gate 4 QE-1 and QE-8. Current IPD `main` has no durable implementation. |
| Tenant/company context | Owner authorization includes the accepted owner/tenant context and the canonical company-identity resolution rules; single-user scope does not erase context or permit caller substitution. | T-B/T-C and QE-1/QE-8; no caller authority fields or invented identity defaults. Current host/store evidence is absent. |
| Stable durable identity | A portfolio identity is stable within the IPD-owned portfolio capability and is not replaced by the certified IRR reference portfolio or a session-only identity. | Read/lifecycle tests and QE-3/QE-4. Exact schema/property names remain for the Gate 3 act. |
| Restart durability | A successful durable acknowledgement requires a committed durable store; session results remain `SESSION_ONLY`/`durable:false`. | T-H at Gate 3; QE-4 after stopping and restarting both IRR and IPD, with byte-for-byte read-back. Not executed. |
| Versioned serialization/deserialization | The accepted versioned consumer contract and the versioned persistence/serialization boundary apply; unknown versions/refusals remain fail-closed. | T-A/T-H and Gate 4 QE-4/QE-7. Exact serialized fields and migration identifiers are not decided here. |
| Migration capability | Startup follows `validate → connect → migrate → verify → bind`; an unverified migration or store fault exposes no endpoint and has no fallback. | T-E and QE-7, with migration-ledger evidence. No migration has been implemented or verified on current `main`. |
| Lifecycle and retention | Create/save/reset/delete semantics, tombstone behavior and indefinite preservation/no automatic purge apply; revoked-binding data remains retained and inaccessible until a separately governed action. | T-C/T-D/T-G and QE-3/QE-8/QE-9. Current IPD is session-only. |
| Reset/deletion | Reset preserves portfolio identity/history with a governed empty revision; delete is a tombstone and does not physically erase history. | QE-3 and refusal/no-effect rows in QE-9. No implementation result is claimed. |
| Concurrency/version semantics | `expectedRevision` is required for save/reset/delete; revisions are immutable and each committed mutation increments by one; stale/missing values refuse. | T-G and QE-3/QE-7. The exact storage representation is not prescribed by this record. |
| Server authorization | Authorization is performed by IPD against the active binding and owner/tenant/portfolio relationship inside the transaction; IRR supplies no principal or scope. | T-B/T-C and QE-1/QE-8/QE-10. No server-side durable path exists on current `main`. |
| Owner/tenant isolation | Missing, foreign, revoked and tombstoned resources are refused without disclosure; no caller-supplied authority or cross-owner operation is accepted. | T-B/T-C/T-D and QE-1/QE-8/QE-9. Windows/cross-account evidence is not available here. |
| Auditability | Immutable revision records and the local A-3 audit line provide the required mutation/binding lifecycle audit; no cross-system audit destination is implied. | Gate 3 audit tests and QE-9/lineage checks. Exact audit record shape remains to be fixed by the act. |
| Durable contribution/lineage/idempotency preservation | Broker contribution SHA-256 lineage, attribution and `contentDigest` survive restart and `REPLACE`/`RESET`; content idempotency yields no new revision and no request-level retry key is invented. | T-G/T-H plus QE-5/QE-6/QE-10. No current durable evidence exists. |

## 3. Interpretation limits

1. `CONFIRM` does not turn the single-user H-18 non-production scope into multi-user, enterprise, authentication, OIDC, RBAC or tenant-directory authority.
2. `CONFIRM` does not replace IPD's existing `PortfolioStore`/portfolio port or permit IRR to own durable state. A durable adapter is additive and IPD-owned.
3. The Gate E policy remains controlling for refusal, write authorization, canonical identity, retention, audit and the four W-1 conditions.
4. Gate 3 CI evidence cannot be relabelled Gate 4 qualification; Gate 4 result acceptance and Gate 5 admission remain separate.

## 4. Explicit non-effects and evidence boundary

No implementation, migration, schema, store, binding, Windows act, qualification run, result acceptance, admission or fence lift is created by this decision. IPD remains `SESSION_ONLY` / `durable:false`; IRR remains HTTP `503`; C8 remains **NOT MET**; the 51-row/13-item baselines and IRR PR #114 are untouched.

The requirement map identifies future obligations and unresolved implementation details; it is not evidence that any requirement has passed.

*Rendered as a durable PA confirmation of full G-2 §3 applicability.*
