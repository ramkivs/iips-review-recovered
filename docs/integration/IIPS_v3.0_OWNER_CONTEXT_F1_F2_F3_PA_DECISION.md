# IIPS v3.0 — Owner Context F-1 / F-2 / F-3 Program Authority Decision Record

| Field | Value |
|---|---|
| Record ID | IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PA-DECISION-01 |
| Record type | Formal Program Authority decision record rendering the PA's approval of the reviewed decision proposal `IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PROPOSAL-01`. Establishes approved policy definitions and an approved architectural **design direction** for the three previously UNDECIDED items of `IIPS-V3-OWNER-CONTEXT-PA-DECISION-FINAL-01`. |
| Status | **APPROVED BY PROGRAM AUTHORITY — RECORDED — FINAL RECORD REVIEW PENDING — NOT PUBLISHED — NOT EFFECTIVE** |
| Decision date | 2026-10-12 |
| Recorded | 2026-10-12 (local preparation; local-only, uncommitted) |
| Prepared against baseline | `origin/main` = `834ef334f53434bfe3643a3b4881b6440af434eb` (merge of PR #62), as recorded in the local clone; HEAD `0093105` on `arena/79f30e80-iips-review-recovered` |
| Implementation authority | **NOT GRANTED** |
| Value-selection authority | **NOT GRANTED AND NOT EXERCISED** (no concrete owner or tenant value is selected by this record) |
| Publication/merge authority | **NOT GRANTED BY THE RENDERING TASK**; publication requires a separate explicit authorization |

---

## 1. Purpose

This record renders, as a formal Program Authority (PA) decision, the PA's approval of the reviewed proposal:

`docs/integration/IIPS_v3.0_OWNER_CONTEXT_F1_F2_F3_DECISION_PROPOSAL.md` (`IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PROPOSAL-01`).

It resolves, at policy and design-direction level, the three items left UNDECIDED by `IIPS-V3-OWNER-CONTEXT-PA-DECISION-FINAL-01` (`F1_OWNER_USER_ID_VALUE` definition, `F2_TENANT_VALUE` definition, `F3_MECHANISM`), while **preserving as UNDECIDED** the concrete values, the F-6 inventory authorization, and every implementation detail the proposal identified as unresolved.

This record does not describe the proposal as awaiting review: the proposal has been reviewed and approved. This record also does not describe the approved design direction as implemented, demonstrated, or qualified: it is not.

## 2. Approval provenance

1. The proposal `IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PROPOSAL-01` was prepared read-only against baseline `834ef33` and submitted for PA review with status `F-1/F-2/F-3 DECISION PROPOSAL PREPARED — AWAITING PA REVIEW`.
2. On 2026-10-12 the Program Authority (the user, acting as PA — consistent with the provenance recorded in `IIPS-V3-OWNER-CONTEXT-PA-DECISION-FINAL-01`) **explicitly approved** the reviewed proposal, and directed its translation into this formal decision record.
3. The approval was conveyed in the authoritative rendering-gate task for this record; this record transcribes it without addition, narrowing, or reinterpretation.
4. The rendering task **explicitly withheld** implementation authority and publication/merge authority. The PA's approval of the proposal is therefore recorded strictly as approval of policy definitions and design direction, and is distinguished from any subsequent implementation or publication authorization, none of which has been granted.

## 3. Governing context preserved

The following records retain their existing authority unchanged; this record amends none of them:

- `IIPS_v3.0_OWNER_CONTEXT_PA_DECISION_FINAL.md` — F-1…F-7 approved policy dispositions; its four UNDECIDED items are addressed here only to the extent §4–§5 state.
- `IIPS_v3.0_GLOBAL_NO_AUTH_PROGRAM_AUTHORITY_DECISION.md` — no authentication/OIDC/sessions/tokens in scope; the 503 fail-closed behavior remains mandatory.
- `IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md` (D-2) — domain-scoped authority rule (§7), translation boundary rule (§8), tenant-authority landscape (§4).
- D-1, D-1 extension, AD-05, G-2 records, and the published NP-09/NP-10/NP-11 designation records — unchanged.

## 4. Approved dispositions

### 4.1 F-1 — Owner identifier definition — **APPROVED**

Adopted exactly as proposed in proposal §3.2 with §3.4 equivalence exclusions:

1. `ownerUserId` is the single **stable, opaque, server-owned application-owner partition key** of the single-user IRR application. It carries **partition semantics only and no authorization semantics** — the storage layer consumes it by equality alone (`persistence-service.ts:157–163, 184–186`); no authorization logic exists or may be built on it under this decision.
2. **Format requirements (binding on any future value):** single non-empty string; JSON-stable (persisted verbatim in journal lines); MUST NOT contain NUL (component of the compound dedup key, `persistence-service.ts:184–186`); deterministic and exact-equality stable; opaque (no derivable personal, username, email, or company identity); bounded length (exact bound is an implementation-gate detail).
3. **Assignment rule:** established **only** by a PA-governed declaration (approved class C1; classes C2–C4 remain foreclosed). Never generated at runtime; never derived from any request, header, cookie, browser state, authenticated principal, company identifier, or any other domain's identity; never defaulted.
4. **Stability rule:** immutable once recorded. Change requires a new PA governed decision plus a separately governed data-reconciliation decision; no runtime mutation path may exist.
5. **Missing/invalid behavior:** absent, empty, unreadable, or inconsistent source ⇒ HTTP `503 owner-context-unavailable`; no inference, no fallback identity, no data read or written (approved policy F-5).
6. **Equivalence exclusions (binding):** NOT equivalent to and NOT derived from any authenticated principal, browser/client identity, company identifier (D-2 §5), IPD `applicationUserId`, G24/Reports `userId`, or any other domain's owner identifier (D-2 §8).

**The concrete `ownerUserId` value is NOT selected by this record** (§5.1).

### 4.2 F-2 — Tenant partition definition — **APPROVED**

Adopted exactly as proposed in proposal §4.4 with §4.3 and §4.5:

1. `tenantId` is retained as the **partition dimension paired with `ownerUserId`** in the existing composite key `(tenantId, ownerUserId)` (approved policy F-2; TD-2 unchanged). It is a **partition dimension only**: no tenancy, membership, entitlement, RBAC, or administrative semantics — none exist on main and none are introduced.
2. **Format requirements:** identical to §4.1(2).
3. **Assignment rule:** established and changed by the **same governed act** as `ownerUserId`; never request-derived; never defaulted at runtime.
4. **Single-user sufficiency:** one governed partition value is sufficient for this single-user application; the composite key is retained because it is the existing journal contract, **not because multi-tenancy is implied**. No multi-tenant architecture is inferred or introduced.
5. **Cross-domain non-equivalence (binding):** the IRR owner-context `tenantId` is a new, explicitly identified, domain-scoped partition value (D-2 §7) and is **NOT equivalent** to any IPD, G24, Reports, or company tenant identifier (D-2 §4, §8).
6. **Joint failure rule:** any state in which the pair cannot be fully validated — missing, inconsistent, or unverifiable, in whole or in part — is treated as absent ⇒ `503 owner-context-unavailable` (approved policy F-5).
7. **One record, two fields:** F-1 and F-2 are resolved in one PA decision record with separate fields and separate rules but a shared lifecycle, because the pair is consumed atomically, changes together, and fails together (proposal §4.5). This record is the policy record; the future value-establishing act follows the same form.

**The concrete `tenantId` value is NOT selected by this record** (§5.1).

### 4.3 F-3 — Mechanism: approved architectural design direction — **APPROVED AS DIRECTION**

The PA approves the proposal §6.1 recommendation as the **design direction**:

1. **Option B — server-local governed configuration as the technical carrier:** a single durable, server-owned declaration file in the TD-7a server-owned data domain (`persistence-service.ts:31–33, 108–109`), written once as the materialization of the value-establishing PA act and read-only thereafter, containing the approved pair and a reference to the governing decision record.
2. **Option A — PA-governed declaration as the authority:** the PA decision record that approves the exact pair is the **sole source of legitimacy**; it names the carrier mechanism and path convention and records the integrity binding. The carrier is its materialization, never an independent authority.
3. **Option C — existing fail-closed configuration discipline as the behavioral precedent:** the carrier's path is addressed through a server-owned seam mirroring the proven rule of `serverOwnedDatabasePath()` / `IIPS_NP04_DATABASE_PATH` (`persistence-port.ts:234–247`): read from the server-owned environment, never from a request; absent path, absent file, unreadable file, malformed content, or integrity-check failure ⇒ resolver returns `null` ⇒ owner-scoped routes answer `503 owner-context-unavailable` via the existing helper (`owner-context-unavailable.ts:14–18`); **never repaired, guessed, or silently defaulted at runtime** (approved policy F-3 property 5).

**Status of this approval — explicit:** this is approval of an architectural **design direction**. It is NOT a finding that the six F-3 source/lifecycle properties have been demonstrated; they remain binding acceptance criteria whose demonstration is conditioned on the unresolved requirements preserved in §5.2 and on the F-7 qualification evidence suite. The proposal assessed the recommended combination as capable of satisfying all six properties (proposal §7); capability is not demonstration.

**The C-only fallback is NOT approved.** Option C alone (environment variables carrying the governed values directly) was evaluated and rejected for this purpose because its recovery behavior is UNRESOLVED from repository evidence (proposal §5.3, §5.4, §6.2). It remains a documented fallback only if a future PA decision explicitly accepts its gaps.

### 4.4 Capability scope — **CONFIRMED**

Initial application scope is Watchlists NP-09, Collaboration NP-10, and Settings NP-11 only (approved policy F-4). Reports NP-06 and Portfolios G-2 **remain deferred**; their owner-scoped routes keep unconditional `503 owner-context-unavailable`.

### 4.5 Runtime-flow properties — **APPROVED AS BINDING REQUIREMENTS**

The proposal §8 flow refinements are approved as requirements of any future implementation:

1. Failure is **per-route, not process-fatal**: an invalid context withholds owner-scoped capabilities only; non-owner surfaces keep serving (matches current behavior at `executive-transport.ts:681`).
2. Resolution of the static pair is performed once at server initialization (recommended) or per request (acceptable NP-04 pattern) — an implementation-gate choice.
3. Validation of a partition-key pair is **not user authentication**; no login, session, token, principal, or identity provider exists or is introduced (global no-auth decision).
4. The pair flows through the **existing leading service parameters**; TD-2 signatures, journal grammar, and `JOURNAL_FORMAT_VERSION` are unchanged.

## 5. Remaining unresolved matters (preserved, not decided)

### 5.1 Concrete values — UNDECIDED

| Item | Status |
|---|---|
| `F1_OWNER_USER_ID_VALUE` | **UNDECIDED — SEPARATE EXPLICIT PA DECISION REQUIRED.** No value is selected, generated, or recorded here. |
| `F2_TENANT_VALUE` | **UNDECIDED — SAME GOVERNED ACT AS THE OWNER VALUE** (one act, two fields, §4.2(7)). No value is selected, generated, or recorded here. |

### 5.2 F-3 unresolved requirements — PRESERVED AS BINDING CONDITIONS

Approval of the design direction does **not** establish any of the following; each remains an unresolved requirement of the eventual implementation, to be specified and demonstrated at the implementation gate:

1. **Integrity binding** between the carrier file and the governing declaration (form: recorded reference and/or hash — proposal §5.4, §11.3). Unauthorized-edit detection depends on it; it is unspecified.
2. **Restart stability** — to be demonstrated for the approved carrier (proposal §5.4: SUPPORTED BY EVIDENCE for the durable-file design, demonstration pending).
3. **Recovery** — re-materialization from the PA decision record under governance; the procedure is unspecified and undemonstrated (proposal §5.4, §7(4)).
4. **Change authority and auditability** — bindings that keep change authority with the PA act and changes repository-visible (proposal §5.4 rows: FEASIBLE WITH IDENTIFIED GAP pending the integrity binding).
5. **Missing / malformed / conflicting / unverifiable configuration behavior** — the required behavior is fixed (fail closed, 503, never repaired/guessed/defaulted); its implementation and failure-mode evidence are pending (approved policy F-7 part 3).
6. **Carrier grammar, file format, and path-seam name** — undefined; implementation-gate details requiring their own approval (proposal §11.3).
7. **TD-7b** — the production data-dir/deployment regime remains deferred; the design direction targets the TD-7a local-development regime only (proposal §11.1).
8. **`.gitignore` discrepancy** — the TD-7a comment claims the data dir is gitignored; the repository's `.gitignore` contains no `.iips-data` entry (verified at proposal preparation). Must be resolved before any implementation gate (proposal §11.2).
9. **Historical doc-comment drift** — consumer headers still reference supply "from the authenticated principal" (`watchlists-service.ts:31`, `collaboration-service.ts:35`); to be reconciled (documentation-only) at the implementation gate (proposal §11.5).
10. **Elements that do not yet exist** — the owner-context resolver, the carrier file, and the rewiring of the three in-scope transports (proposal §6.4). All are implementation work, unauthorized by this record.

### 5.3 F-6 — existing data — UNDECIDED

`F6_INVENTORY_AUTHORIZED` remains **UNDECIDED**. No inventory, inspection, listing, scanning, migration, reconciliation, deletion, reassignment, partition rewriting, or data exposure is authorized by this record. If journals written under branch-era or test values exist, their reconciliation is a separately authorized future task and is **not** a dependency of the approved design direction (proposal §11.4; approved policy F-6).

### 5.4 Verification limitation

The proposal (and therefore this record's baseline) was verified against the last-fetched `origin/main` ref in a session without remote access. If `main` has moved since PR #62, the proposal's evidence must be re-verified against the current baseline before publication or implementation (proposal §11.7).

## 6. Evidence and rationale

The approval rests on the evidence assembled and cited in the proposal (all paths verified at baseline `834ef33`); the material anchors:

1. **Partition-key semantics:** `ownerUserId`/`tenantId` are plain strings consumed only by equality scoping and in the NUL-delimited compound dedup key; "library authority, not an HTTP identity or access-control boundary" (`frontend/server/persistence/persistence-service.ts:18–21, 157–163, 184–186`); both documented "Server-resolved … never taken from an HTTP client" (lines 67–70); imports limited to `node:fs/path/crypto` (lines 35–37).
2. **Fail-closed precedent:** `serverOwnedDatabasePath()` returns `null` unless a non-empty server-owned value is present; any composition failure yields `null` → upstream 503, "no substitute store is ever created" (`frontend/server/reports/persistence-port.ts:217–223, 234–247, 271–301`).
3. **Existing 503 baseline:** all owner-scoped transports answer `503 owner-context-unavailable` after route validation (`watchlists-transport.ts:56–72`; `collaboration-transport.ts:54`; `settings-transport.ts:48`; `reports-transport.ts:72`; `user-portfolio-transport.ts:68`; helper `owner-context-unavailable.ts:1–18`).
4. **Server-owned data domain:** TD-7a `IIPS_DATA_DIR` seam with server-owned local default; per-capability journal subdirectories (`persistence-service.ts:31–33, 108–109`; `watchlists-service.ts:41, 96–103`; `collaboration-service.ts:47`; `settings-service.ts:49`).
5. **Why A alone fails:** runtime dependency on a repository checkout; only frozen-artifact precedent exists (`executive-transport.ts:72`); TD-7b deferred. **Why C alone fails:** governed values would live outside the repository's audit/recovery surface — recovery UNRESOLVED (proposal §5.1, §5.3, §6.2).
6. **Reuse survey:** no existing identifier is suitable for reuse; all candidates excluded (proposal §3.3; D-2 §4–§8).
7. **Six-property compliance assessment:** the recommended combination was assessed capable of satisfying all six approved F-3 properties (proposal §7), subject to the §5.2 conditions of this record.

## 7. Capability and IPD boundaries

1. **No capability is admitted or qualified by this record.** Admission requires a separate implementation-authorization gate; qualification requires the F-7 five-part bar per capability (approved policy F-4(4), F-7).
2. **NP-09 Watchlists:** designation published to main; **qualification remains NOT ESTABLISHED** — publication of a designation is not qualification, and this record changes nothing in that status.
3. **NP-10 Collaboration / NP-11 Settings:** designation and qualification evidence remain branch-only (`arena/01a0f351`) and unadmitted; separate gates required.
4. **Reports NP-06 and Portfolios G-2:** deferred; unconditional 503 retained.
5. **IPD:** unmodified by this record and by the proposal. IRR `ownerUserId` is NOT equated with IPD `applicationUserId`; IRR `tenantId` is NOT equated with any IPD/G24/Reports/company tenant identifier. Any future mapping requires a D-2 §8 governed translation contract. The G-2 boundary and the IRR–IPD boundary are unchanged.

## 8. Authorization and non-authorization statements

### 8.1 What this decision grants

1. Approved policy definition of `ownerUserId` (§4.1) and of `tenantId` (§4.2).
2. Approved architectural design direction for the F-3 mechanism: Option B carrier bound to Option A authority, under Option C's fail-closed discipline (§4.3).
3. Confirmation of the initial capability scope (§4.4) and of the binding runtime-flow properties (§4.5).
4. Establishment of the binding conditions that any future implementation must satisfy (§5.2, §9).

### 8.2 What this decision does NOT grant

1. **No implementation authority** — no code, test, schema, journal-format, resolver, carrier, rewiring, or runtime-configuration change.
2. **No permission to populate concrete owner or tenant values** — none are selected here; a separate PA act is required.
3. **No permission to modify runtime configuration** in any environment.
4. **No permission to inspect, inventory, migrate, reconcile, delete, reassign, rewrite, or expose existing user data** (F-6 UNDECIDED).
5. **No capability qualification or admission** — including NP-09, whose qualification remains NOT ESTABLISHED.
6. **No modification of IPD**, no change to the IRR–IPD boundary, no change to G-2.
7. **No publication, push, pull request, or merge authority** — this record is local and uncommitted; publication requires a separate explicit authorization.
8. **No reopening** of D-1, D-1 ext, D-2, AD-05, G-2, the global no-auth decision, or any accepted governance decision.
9. **No automatic progression** to any subsequent gate.

## 9. Conditions required before implementation

All of the following must be satisfied, in order, before any implementation of the approved direction is authorized:

1. **Value act:** a separate PA governed decision selects the exact `F1_OWNER_USER_ID_VALUE` and `F2_TENANT_VALUE` (one act, two fields, §4.2(7)), conforming to the §4.1(2)/§4.2(2) format requirements.
2. **Implementation gate:** approves the carrier grammar, path-seam name, and the integrity-binding form (§5.2(1), (6)); resolves the `.gitignore`/TD-7a discrepancy (§5.2(8)); reconciles the historical doc comments (§5.2(9)).
3. **Baseline re-verification:** the proposal's evidence is re-verified against the current `origin/main` (§5.4).
4. **Per-capability gates:** each of NP-09/NP-10/NP-11 receives its own implementation authorization and passes the F-7 five-part qualification bar with independent evidence, including failure-mode tests demonstrating the fail-closed behavior of §4.3(3) and §4.5.
5. **Record publication:** this record (and the value act) are published through the repository's governed publication process, if and when separately authorized.
6. **F-6 separation:** no step above authorizes data inspection or reconciliation; if a reconciliation question arises, it is decided separately.

## 10. Decision effectiveness and publication status

| Item | Status |
|---|---|
| PA approval of the reviewed proposal | **GRANTED — recorded §2** |
| Policy definitions (§4.1, §4.2) | **APPROVED** |
| F-3 design direction (§4.3) | **APPROVED AS DIRECTION** — unresolved requirements preserved (§5.2) |
| Concrete owner/tenant values | **UNDECIDED** (§5.1) |
| `F6_INVENTORY_AUTHORIZED` | **UNDECIDED** (§5.3) |
| Implementation authority | **NOT GRANTED** |
| Capability admission/qualification | **NONE** — NP-09 qualification NOT ESTABLISHED |
| Final record review | **PENDING** |
| Publication | **NOT PERFORMED** — local, uncommitted, per rendering-task restriction |
| Merge | **NOT AUTHORIZED** |
| Decision effectiveness | **NO** until publication, consistent with the repository's record-then-publish convention and with `IIPS-V3-OWNER-CONTEXT-PA-DECISION-FINAL-01` §9–§10 practice |

Local preparation of this record is not publication and is not effectiveness.

---

## FINAL STATUS

**`F-1/F-2/F-3 PA DECISION RECORD PREPARED — AWAITING FINAL RECORD REVIEW`**
