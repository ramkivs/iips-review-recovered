# IIPS v3.0 — Non-Authentication Owner Context — Final Program Authority Decision Record

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-OWNER-CONTEXT-PA-DECISION-FINAL-01` |
| Record type | Final Program Authority decision record recording explicit PA approval of the seven policy-level dispositions F-1 … F-7. Non-executable at preparation. Grants no implementation, owner-source creation, concrete owner/tenant value, mechanism, inventory, migration, journal mutation, API/UI behavior change, capability admission, publication, merge, deployment, or production authority. |
| Status at preparation | **POLICY DISPOSITIONS F-1…F-7 APPROVED BY PROGRAM AUTHORITY — FINAL RECORD PENDING FINAL USER REVIEW — NOT PUBLISHED — NOT EFFECTIVE** |
| Date | 2026-10-12 (Asia/Calcutta) |
| Decision authority | Ramki (Ramakrishnan) — Program Authority / application owner |
| Decision source | The seven policy-level dispositions were explicitly approved by the Program Authority in the finalization gate task of 2026-10-12. The recording agent records that approval exactly as conveyed, renders no additional decision, supplies no undecided value, and accepts no authority on the Program Authority's behalf. |
| Recording agent | Arena Agent Mode — final decision-record preparation only |
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative ref | `refs/heads/main` |
| Verified baseline `origin/main` | Commit `139c5b8d24b3a21ba4db4ded044feadfb2ac582b` (merge of PR #61; re-verified at preparation) |
| Decision lineage | Preparation packet [`IIPS_v3.0_OWNER_CONTEXT_PROGRAM_AUTHORITY_DECISION.md`](IIPS_v3.0_OWNER_CONTEXT_PROGRAM_AUTHORITY_DECISION.md) (`IIPS-V3-OWNER-CONTEXT-PA-DECISION-01`, rectified commit `6c03a6a`, blob `ae935970…`); rendered draft [`IIPS_v3.0_OWNER_CONTEXT_PA_DECISION_RENDERED_DRAFT.md`](IIPS_v3.0_OWNER_CONTEXT_PA_DECISION_RENDERED_DRAFT.md) (`IIPS-V3-OWNER-CONTEXT-PA-DECISION-DRAFT-01`, commit `8ff2183`, blob `3f47fc8e…`). Both preserved unchanged as historical evidence. |
| Environment | Non-production. Production and the separate IPD repository are OUT OF SCOPE. |
| Implementation | **NOT AUTHORIZED** |

---

## 1. Purpose and decision status

This is the final decision record for the non-authentication owner-context gate. It records the Program Authority's explicit approval of the seven **policy-level** dispositions F-1 … F-7 rendered in `IIPS-V3-OWNER-CONTEXT-PA-DECISION-DRAFT-01`, and it preserves, exactly and separately, the four matters the Program Authority left UNDECIDED.

Three distinctions bind this record:

1. **Policy approval ≠ concrete value or mechanism resolution.** The approved dispositions are policy: the permitted source class, the retained tenant dimension, the mandatory source properties, the scope shape, the failure posture, the data-preservation default, and the qualification bar. **No concrete runtime `ownerUserId` value, no concrete `tenantId` value, and no concrete mechanism is approved by this record.** The four UNDECIDED items in §5 remain open and require their own explicit decisions.
2. **Policy approval ≠ effectiveness.** Approval of the policy dispositions in the Program Authority's review does not, by itself, make this decision effective. Effectiveness requires the publication sequence in §11 (final user review of this exact record, separate merge authorization, merge to `refs/heads/main`, independent remote verification). Until then this record is a locally prepared, pending governance artifact.
3. **Effectiveness ≠ implementation authority.** Even when effective, this decision authorizes no implementation. Implementation authority arises only from a later gate satisfying the conditions in §10.

## 2. Program Authority approval statement

On 2026-10-12, the Program Authority (Ramki, Ramakrishnan) explicitly approved, at policy level, the seven dispositions recorded in §4 of this document: **F-1** (permitted ownership-source class C1), **F-2** (retention of `tenantId` as an existing partition dimension paired with `ownerUserId`), **F-3** (adoption of the six mandatory source/lifecycle properties), **F-4** (one application-level ownership decision with explicit per-domain binding and staged scope; initial scope Watchlists/Collaboration/Settings; Reports and Portfolios deferred), **F-5** (fail-closed `503 owner-context-unavailable` for all ownership failure classes), **F-6** (existing data preserved but inaccessible by default), and **F-7** (five-part per-capability qualification bar). The Program Authority simultaneously left four matters explicitly UNDECIDED (§5). The approval was conveyed in the authoritative finalization gate task for this record; this record transcribes it without addition, narrowing, or reinterpretation.

## 3. Baseline and governing records

- **Baseline:** `ramkivs/iips-review-recovered @ refs/heads/main` = `139c5b8d24b3a21ba4db4ded044feadfb2ac582b` (merge of PR #61, the global no-auth implementation), re-verified at preparation of this record.
- **Governing records (all preserved unchanged by this decision):** the effective global NO-AUTH Program Authority decision (`IIPS_v3.0_GLOBAL_NO_AUTH_PROGRAM_AUTHORITY_DECISION.md`, merged PR #60; implemented PR #61) — this record is the separate ownership/data-semantics decision its §5(5) requires; **D-1** persistence-domain ownership (`0c4f27b3…`); **D-1 ext** journal-persistence domain extension (`11df4d03…`); **D-2** domain-scoped identity/tenant authorities (`ec80ef89…`); **G2-2 AD-05** tenant-membership deferral (`2f89bbc9…`); **D-3** Governed Reports acceptance (`3b24b9c9…`) and promotion-scope record (`0e383adcc…`); **G-2** durable user-portfolio architectural decision (`7e83946b…`); **H-18** single-user direction (`a13f7a34…`, recorded status CANDIDATE — its product direction is carried here via the effective global no-auth decision §3); the G3 authentication-authority HARD STOP; `NP-08-D115` (companyId is not an owner identity).
- This decision changes, weakens, reopens, or supersedes **none** of these records.

## 4. Approved dispositions (F-1 … F-7)

### 4.1 F-1 — Ownership semantics — **APPROVED (policy)**

1. **C1 — governed owner declaration — is the permitted authority class.** The only permitted class of non-authentication ownership source for the first-party IRR application is an explicit, PA-authorized declaration establishing the application's legitimate data owner, recorded through a governed act and satisfying the F-3 mandatory properties. Classes C2, C3, and C4 are foreclosed unless a later, separately governed PA decision opens a specific one.
2. At the authority level, the legitimate data owner of this single-user, personal-use application is the Program Authority / application owner. This is a **policy identification**, not a runtime identity value. A human-readable owner name does **not** become a runtime identifier except through an approved declaration value rule.
3. **UNDECIDED (preserved, §5):** the concrete `ownerUserId` value or approved value rule; the concrete ownership-source mechanism. No owner value is invented by this record, and none may be treated as established without its own explicit decision.

*Authority:* packet §7 F-1, §8; global no-auth §5(1)/(5); D-2 §4, §7; D-1; G-2.

### 4.2 F-2 — Tenant semantics — **APPROVED (policy)**

1. **`tenantId` is RETAINED as an existing partition dimension**, paired with `ownerUserId` as the governing composite scope key exactly as the TD-2 journal contract and D-1 ext §3(4) enforce it. Both dimensions are to be established together by the same governed declaration act and validated together on every operation; neither may be supplied by an HTTP client.
2. Within this decision, `tenantId` is a partition dimension of this application's journal-regime data only. It is **not** asserted equivalent to, mappable to, or derivable from the G24 tenant or the Reports tenant (D-2 §3.4, §8). This decision creates **no** tenant-membership system, no tenant directory, no Company Identity Authority, and no universal cross-domain identity equivalence (AD-05 deferral retained).
3. **UNDECIDED (preserved, §5):** the concrete `tenantId` value or approved value rule. The tenant dimension is not removed by this decision; no tenant value is invented; removed-fixture values (`admin-a`/`tenant-A` era) are not reused by default — any reuse would itself be a PA-rendered value decision.

*Authority:* packet §7 F-2; D-2 §3.4, §4, §7–§8; global no-auth §5(4); TD-2; D-1 ext §3(4); AD-05.

### 4.3 F-3 — Source and lifecycle — **APPROVED (policy)**

1. **All six mandatory source/lifecycle properties are ADOPTED** as binding acceptance criteria for any owner-context source permitted under F-1:
   1. **Recording location** — where the declaration is durably recorded.
   2. **Authority to create or change the declaration** — the Program Authority only, by explicit governed act; no process, transport, or client may alter it.
   3. **Stability across restarts** — the source must survive process restart and be independently re-verifiable (addressing the D-1 ext §3(8) restart gap at the source level).
   4. **Recovery behavior** — defined behavior for restoration from the recorded location.
   5. **Behavior when the source is unreadable or inconsistent** — fail closed per F-5; never repaired, guessed, or silently defaulted at runtime.
   6. **Audit/evidence trail** — establishment and any change must leave a reviewable governance/evidence record.
2. The ownership context is established only by the Program Authority acting through governed acts: the accepted decision record (values) and a subsequent PA-authorized implementation gate (mechanism).
3. **UNDECIDED (preserved, §5):** the concrete mechanism for recording, reading, maintaining, and recovering the ownership declaration. No mechanism is selected by this record; evidence and a separate authorization are required. No source is implemented by this record, and no journal lifecycle operation (deletion/reset/retention/archival/compaction) is created or governed by it.

*Authority:* packet §7 F-3, §11; D-1 ext §3(7)–(8), §6; TD-7a.

### 4.4 F-4 — Capability scope — **APPROVED (policy)**

1. **One application-level ownership decision with explicit per-domain binding and staged scope.** The owner/tenant declaration is a single application-level policy fact for the first-party IRR application. It binds each persistence domain only through that domain's existing governed contract. It is not a universal identity authority, not a cross-domain identity mapping, and not automatic admission of any capability (D-1; D-2 §7–§8).
2. **Initial policy scope:** **Watchlists (NP-09), Collaboration (NP-10), Settings (NP-11)** — the journal-domain trio whose entire stack is resident on IRR `main` (D-1 ext). Collaboration remains Option A — private, owner-scoped threads; no sharing, ACLs, invitations, workspace membership, mentions, or assignments are introduced or implied.
3. **Deferred:** **Reports (NP-06)** — subject to its existing governance and admission requirements (D-3; promotion NOT EXECUTED; main admission NOT GRANTED; NP-04 store off-main). **Portfolios (G-2)** — subject to its existing governance, IPD-side requirements (G24 membership regime), and cross-domain requirements (governed `(issuer, subject) → applicationUserId` translation per D-2 §8).
4. **This policy disposition does not itself admit or enable any capability.** Admission of any capability — even within the initial scope — requires its own implementation-authorization gate and F-7 qualification.

*Authority:* packet §7 F-4, §10; D-1; D-1 ext; D-2 §7–§8; D-3 + promotion-scope record; G-2.

### 4.5 F-5 — Failure behavior — **APPROVED (policy)**

1. **Fail-closed behavior is RETAINED** for every ownership failure class (source absent, invalid, unavailable, inconsistent, or cannot be independently verified):
   - affected owner-scoped operations return **HTTP 503 `owner-context-unavailable`**;
   - **no data may be read or changed** under an unapproved owner;
   - **no synthetic, hard-coded, inferred, or browser-supplied owner/tenant** is permitted;
   - **no authentication-dependent fallback** is permitted.
2. Any departure for any class requires new explicit PA authority in a governed decision; it must never be presumed.

*Authority:* packet §6 (25/25 fail-closed tests verified at baseline), §7 F-5, §9; global no-auth §5(5); TD-2/TD-3 fail-closed semantics.

### 4.6 F-6 — Existing data — **APPROVED (policy)**

1. **Binding default: existing data is PRESERVED BUT INACCESSIBLE** unless and until its authorized ownership context is established — the posture the 503 safeguard already enforces.
2. This decision does **NOT** authorize: local data inventory; user-data inspection; migration or reconciliation; deletion, reassignment, partition rewriting, or exposure; or journal lifecycle changes.
3. **UNDECIDED (preserved, §5):** whether a separate read-only local inventory will be authorized. No inventory is authorized by this decision. Any later disposition class (reconciled / migrated / retired) may be authorized only on evidence of what exists and of the identity/tenant values under which it was written.
4. **No fact is claimed** about whether prior journals exist or do not exist; the repository cannot establish that without user-data inspection, which is not authorized. Records in the Reports store (off-main) and G24 store (IPD repository) remain governed by their own repositories' decisions.

*Authority:* packet §7 F-6, §9; global no-auth §5(4); D-1 ext §3(7), §4.

### 4.7 F-7 — Qualification — **APPROVED (policy)**

1. **The five-part qualification bar is ADOPTED, independently for each capability:**
   1. **Positive ownership-boundary tests** — operations admitted only under the authorized owner/tenant pair.
   2. **Negative ownership-boundary tests** — foreign, absent, or invalid pairs refused without data read or change.
   3. **Failure-mode tests** — absent/invalid/inconsistent source yields the F-5 behavior.
   4. **Durability/restart evidence** meeting the existing D-1 extension §6 standard for journal-backed capabilities (separate-process restart must be evidenced, not assumed).
   5. **No cross-domain equivalence** without a governed D-2 §8 translation contract.
2. Qualification is per-capability and independent (D-1 ext §5). **Passing the existing fail-closed tests does not independently qualify any capability**: those tests prove correct unavailability, not correct operation under an authorized owner. No capability is represented as admitted or qualified by this decision.

*Authority:* packet §7 F-7, §6, §11; D-1 ext §5–§6; D-2 §8.

## 5. The four unresolved items (explicitly UNDECIDED)

These matters were deliberately left undecided by the Program Authority. They are not defaulted, inferred, or resolved by this record, and each requires its own separate explicit decision:

| Item | Exact status | Constraint |
|---|---|---|
| `F1_OWNER_USER_ID_VALUE` | **UNDECIDED — requires a separate explicit decision** | No owner value is invented; a human-readable owner name is not a runtime identity without an approved rule |
| `F2_TENANT_VALUE` | **UNDECIDED — requires a separate explicit decision** | No tenant value is invented; the tenant dimension is not removed; no universal cross-domain equivalence is created |
| `F3_MECHANISM` | **UNDECIDED — evidence and a separate authorization are required** | No mechanism is selected; no source is implemented; implementation behavior is not certification evidence |
| `F6_INVENTORY_AUTHORIZED` | **UNDECIDED — no inventory is authorized by the current decision** | Any inventory must be separately authorized and read-only initially, with explicit handling rules; it grants no disposition |

## 6. Initial capability scope and deferred capabilities

- **Initial policy scope (decision scope only — nothing admitted):** Watchlists (NP-09), Collaboration (NP-10, private Option A semantics), Settings (NP-11).
- **Deferred to existing governance:** Reports (NP-06) — own admission requirements; Portfolios (G-2) — own governance, IPD-side, and cross-domain requirements.
- No capability in any group is admitted, enabled, or qualified by this decision.

## 7. Mandatory fail-closed and data-preservation invariants

Retained in full force by this decision (packet §9; unchanged):

1. All five owner-scoped transports continue returning `503 owner-context-unavailable` until the decision is effective **and** a separately authorized implementation binds an approved owner context; no owner is inferred, defaulted, or synthesized; no owner-scoped data is read or changed.
2. No hard-coded or fallback owner/tenant; no browser-supplied identity accepted as authoritative; no cross-domain identifier equivalence assumed.
3. Existing owner/tenant partitions and data contracts are preserved unchanged; no filter removal, rewrite, merge, reassignment, migration, or journal mutation.
4. Journal lifecycle operations (deletion, reset, retention, archival, compaction) remain un-governed and are not invented by this decision.
5. No user data may be inspected, moved, or modified without a separately authorized act with explicit handling rules.
6. **Separate data-safety finding (recorded, not fixed here):** the TD-7a comment describes the data directory as "gitignored", but `.iips-data` does not appear in the repository `.gitignore` at the baseline (packet §9.6). Any future source mechanism must account for keeping owner-scoped local data out of version control; correcting the `.gitignore` is an implementation act requiring its own authorization and is not granted here.
7. Production remains out of scope; the IPD repository is governed separately.

## 8. Qualification requirements

Any capability admitted under this decision must satisfy the F-7 five-part bar with independent per-capability evidence (§4.7). The bar constrains future admission gates; it grants no qualification now.

## 9. Explicit non-authorizations

This record does NOT authorize: implementation of any ownership source, provider, or mechanism; any concrete `ownerUserId` or `tenantId` value (none is recorded as a value); any change to the 503 `owner-context-unavailable` safeguard; creation or modification of ownership records or user data; local data inventory or user-data inspection; any migration, reconciliation, deletion, reassignment, partition rewrite, or exposure; any persistence schema, journal format, contract, storage-lifecycle, or `.gitignore` change; admission, enablement, or qualification of Watchlists, Collaboration, Settings, Reports, or Portfolios; publication, push, PR creation, or merge of this record; production activity of any kind; any act in the IPD repository. Policy approval recorded here confers no implementation authority.

## 10. Conditions required before implementation authorization can be considered

A later implementation-authorization gate may be considered only when, at minimum (packet §11):

1. This final record has completed the publication sequence in §11 and is effective on `refs/heads/main`.
2. The four UNDECIDED items in §5 are resolved by their own explicit PA decisions (`F1_OWNER_USER_ID_VALUE`, `F2_TENANT_VALUE` rendered into the accepted record lineage; `F3_MECHANISM` specified with evidence; `F6_INVENTORY_AUTHORIZED` decided if needed).
3. An implementation plan demonstrates: the exact source mechanism and its lifecycle against the six F-3 properties; zero behavior change outside the authorized scope; preserved data contracts and journal format (`JOURNAL_FORMAT_VERSION` unchanged unless separately governed); and the F-7 qualification evidence suite.
4. Independent per-capability qualification demonstrates reads/writes occur only within the authorized ownership boundary, with negative and failure-mode coverage.
5. Any cross-domain binding is covered by a separately governed D-2 §8 translation contract; any IPD-side change is authorized under that repository's governance.
6. The invariants in §7 remain satisfied throughout.

## 11. Publication and effectiveness requirements

This record is prepared locally for the user's final review. It becomes effective only through:

1. The user's final review and confirmation of this exact record.
2. Separate explicit merge authorization by the Program Authority.
3. Merge to `ramkivs/iips-review-recovered @ refs/heads/main` (no direct push, no force-push).
4. Independent remote verification of the merged commit/tree/blob.

At preparation: final user review **PENDING**; merge authorization **NOT GRANTED**; publication **NOT PERFORMED**; decision effectiveness **NO**. Policy approval of F-1…F-7 does not substitute for any step above.

## 12. Decision-status summary

```text
POLICY_DISPOSITIONS_F1..F7=APPROVED_BY_PROGRAM_AUTHORITY_2026-10-12
F1_PERMITTED_CLASS=C1_GOVERNED_OWNER_DECLARATION; C2_C3_C4_FORECLOSED_UNLESS_SEPARATELY_GOVERNED
F1_OWNER_USER_ID_VALUE=UNDECIDED_SEPARATE_EXPLICIT_DECISION_REQUIRED
F2_TENANT=RETAINED_AS_PARTITION_DIMENSION_PAIRED_WITH_OWNER_USER_ID; NO_CROSS_DOMAIN_EQUIVALENCE
F2_TENANT_VALUE=UNDECIDED_SEPARATE_EXPLICIT_DECISION_REQUIRED
F3_SIX_PROPERTIES=ADOPTED; CHANGE_AUTHORITY=PA_GOVERNED_ACT_ONLY
F3_MECHANISM=UNDECIDED_EVIDENCE_AND_SEPARATE_AUTHORIZATION_REQUIRED
F4_SCOPE=ONE_APPLICATION_LEVEL_DECISION; PER_DOMAIN_BINDING; STAGED
F4_INITIAL_SCOPE=NP-09_WATCHLISTS; NP-10_COLLABORATION_PRIVATE_OPTION_A; NP-11_SETTINGS
F4_DEFERRED=NP-06_REPORTS; G-2_PORTFOLIOS
F5_FAILURE=FAIL_CLOSED_503_OWNER_CONTEXT_UNAVAILABLE_ALL_CLASSES; NO_FALLBACKS
F6_EXISTING_DATA=PRESERVED_BUT_INACCESSIBLE_DEFAULT; NO_INVENTORY_NO_INSPECTION_NO_MIGRATION_AUTHORIZED
F6_INVENTORY_AUTHORIZED=UNDECIDED_NO_INVENTORY_AUTHORIZED_BY_THIS_DECISION
F7_QUALIFICATION=FIVE_PART_BAR_ADOPTED; PER_CAPABILITY_INDEPENDENT; FAIL_CLOSED_TESTS_NOT_QUALIFICATION
CAPABILITIES_ADMITTED=NONE
CAPABILITIES_QUALIFIED=NONE
CONCRETE_OWNER_OR_TENANT_VALUE_APPROVED=NONE
MECHANISM_APPROVED=NONE
FINAL_RECORD_STATUS=PENDING_FINAL_USER_REVIEW
PUBLICATION_AUTHORITY=NOT_GRANTED
MERGE_AUTHORIZATION=NOT_GRANTED
ORIGIN_MAIN_PUBLICATION=NOT_YET
DECISION_EFFECTIVE=NO
IMPLEMENTATION_AUTHORITY=NONE
NEXT_STEP=FINAL_USER_REVIEW_OF_THIS_RECORD; RESOLVE_SECTION_5_UNDECIDED_ITEMS; SEPARATE_MERGE_AUTHORIZATION; MERGE; REMOTE_VERIFICATION; THEN_IMPLEMENTATION_GATE_PER_SECTION_10
```

*End of final decision record. It records the Program Authority's explicit approval of the seven policy dispositions, preserves the four undecided matters exactly, grants no concrete value, mechanism, implementation, publication, or admission, and changes no behavior.*
