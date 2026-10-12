# IIPS v3.0 — Non-Authentication Owner Context — Program Authority Decision (Proposed Decision Packet)

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-OWNER-CONTEXT-PA-DECISION-01` |
| Record type | PROPOSED decision-preparation gate record for an additive Program Authority decision; non-executable. Grants no implementation, owner-source creation, migration, journal mutation, API/UI behavior change, capability admission, merge, deployment, or production authority. |
| Status at preparation | **PROPOSED — NOT APPROVED — PROGRAM AUTHORITY DECISION REQUIRED** |
| Date | 2026-10-12 (UTC) |
| Decision authority | Ramki (Ramakrishnan) — Program Authority / application owner, as identified by the authoritative H-18, G1, and NP-12-N4 A3/A5 records |
| Decision source | The decision fields below are prepared for explicit Program Authority determination. The recording agent renders no decision, selects no ownership model, and accepts no authority on the Program Authority's behalf. |
| Recording agent | Arena Agent Mode — investigation, verification, and decision-packet preparation only |
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative ref | `refs/heads/main` |
| Verified baseline `origin/main` | Commit `139c5b8d24b3a21ba4db4ded044feadfb2ac582b`; tree `631999deac88d48c809e44766c1759479c2db3a1` (merge of PR #61, 2026-10-12T10:43:21Z) |
| Environment | Non-production. Production and the separate IPD repository are OUT OF SCOPE. |
| Implementation | **NOT AUTHORIZED** |

---

## 1. Purpose and decision status

This record prepares the Program Authority decision required to resolve the ownership-authority gap created by the effective global NO-AUTH posture. The merged global no-auth decision removed every authentication dependency from the first-party IRR application and, by its own §5 rule 5, explicitly deferred the ownership question:

> "seek a separate PA ownership/data-semantics decision before adding a binding or migration" — `IIPS_v3.0_GLOBAL_NO_AUTH_PROGRAM_AUTHORITY_DECISION.md` §5(5).

No record on `origin/main` at the verified baseline supplies that decision (see §4). Until it is supplied, the five owner-scoped capability transports intentionally fail closed with `503 owner-context-unavailable`, and no owner is inferred, defaulted, or synthesized.

This is a **decision-preparation gate**. It frames the exact questions the Program Authority must answer, states the evidence and the invariants, and lists what remains blocked. It does **not** preselect an ownership model, grant implementation authority, or change any behavior.

## 2. Verified baseline and governance context

Verification performed at preparation (all against `ramkivs/iips-review-recovered`):

- `origin/main` fetched and confirmed at `139c5b8d24b3a21ba4db4ded044feadfb2ac582b` = known baseline = merge of PR #61 "Remove authentication flow for single-user IIPS" (merged 2026-10-12T10:43:21Z). Working tree clean at the same commit.
- PR #60 (merged `d84bbd6a7a16318718421c4ea2e06b941749beeb`, 2026-10-12T08:31:57Z) published the global no-auth PA decision record to `main` **before** the PR #61 implementation — matching that record's effectiveness sequence. **Effectiveness basis:** this record treats the global no-auth decision as effective on the repository evidence alone — the decision record durably published on `refs/heads/main` (PR #60) followed by the PA-authorized implementation merge (PR #61, merged under the Program Authority's GitHub account). Repository evidence does not independently prove the underlying PA acceptance event itself (record §8 step 1); that acceptance is taken as established by the publication-and-implementation sequence and by the authoritative task context for this gate.
- PR #61 file set inspected via the GitHub API (106 files): authentication flows, guards, tenant directories, and admin identity surfaces removed; five owner-scoped transports rewired to fail closed; owner-context-unavailable helper added; no governance record added by PR #61; no owner source introduced.
- Blob hashes of the cited prior records were recomputed at the baseline and match the hashes those later records assert for them (records unchanged): D-1 `0c4f27b3…`, D-2 `ec80ef89…`, H-18 `a13f7a34…`, G3 hard stop `322c1b41…`, G2-2 `2f89bbc9…`.

Records inspected and reused (paths on verified baseline; blob prefixes recomputed at preparation):

| Record | Blob | Relevance |
|---|---|---|
| [`IIPS_v3.0_GLOBAL_NO_AUTH_PROGRAM_AUTHORITY_DECISION.md`](IIPS_v3.0_GLOBAL_NO_AUTH_PROGRAM_AUTHORITY_DECISION.md) | `595633e0…` | Effective global NO-AUTH posture; §5(1) no synthetic principal; §5(4) preserve owner/tenant data; §5(5) defers ownership to a separate PA decision (the gate this record prepares). |
| [`PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`](PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md) (D-1) | `0c4f27b3…` | Portfolio vs Artifact/Report persistence are distinct domains; no identity mapping, no implementation authority. |
| [`D1-JOURNAL-PERSISTENCE-DOMAIN-EXTENSION.md`](D1-JOURNAL-PERSISTENCE-DOMAIN-EXTENSION.md) (D-1 ext) | `11df4d03…` | Journal persistence (Watchlists / Collaboration / Settings) is a third distinct governed form; `(tenantId, ownerUserId)` enforced per operation; lifecycle gaps un-governed; qualification pending. |
| [`IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md`](IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md) (D-2) | `ec80ef89…` | Identity/tenant authority is domain-scoped; no universal identity/tenant/owner/Company authority; client-supplied identity never authoritative; translation-boundary rule. |
| [`IIPS_v3.0_H18_PRODUCT_SCOPE_SINGLE_USER_PERSONAL_USE.md`](IIPS_v3.0_H18_PRODUCT_SCOPE_SINGLE_USER_PERSONAL_USE.md) (H-18) | `a13f7a34…` | Single-user, personal-use product scope; no auth/RBAC/multi-user/enterprise architecture. |
| [`GOVERNED-REPORTS-ACCEPTANCE-DECISION.md`](GOVERNED-REPORTS-ACCEPTANCE-DECISION.md) (D-3) and [`GOVERNED-REPORTS-PROMOTION-SCOPE-DECISION.md`](GOVERNED-REPORTS-PROMOTION-SCOPE-DECISION.md) | `3b24b9c9…` / `0e383adcc…` | Reports accepted at qualified branch scope; owner `(tenantId, userId)` derived solely from the authenticated principal; no promotion executed. |
| [`IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`](IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md) (G-2) | `7e83946b…` | IPD owns the user-portfolio domain; IRR consumes only through a separately governed boundary; architecture direction only. |
| [`IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md`](IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md) (G2-2) | `2f89bbc9…` | AD-05: tenant membership deferred, AUTHORITY REQUIRED retained; runtime tenant behaviour UNPROVEN; fixture tenant directories excluded. |
| [`AUTHENTICATION_AUTHORITY_HARD_STOP.md`](../v3.0/g3-build/AUTHENTICATION_AUTHORITY_HARD_STOP.md) | `322c1b41…` | Authentication authority was undefined; identity mechanisms must not be invented. |
| [`NP-08-D115-IDENTITY-RUNTIME-COMPANYID-BINDING-AUTHORITY-ACT.md`](NP-08-D115-IDENTITY-RUNTIME-COMPANYID-BINDING-AUTHORITY-ACT.md) | — | `runtimeCompanyId` is expressly **not** an authentication subject or owner identity; not an ownership source. |
| [`NP-12-N4-A3-AUTHORITY-DECISION-RECORD.md`](../../NP-12-N4-A3-AUTHORITY-DECISION-RECORD.md) / A5 | — | Record Ramki as "IIPS Program Authority and single owner of the IIPS application" — evidence of the human owner; not a runtime data-owner source. |
| [`P5-capability-sweep.md`](../../evidence/integration/convergence/2026-10-07/P5-capability-sweep.md) | `b5e5975d…` | Per-capability identity models and statuses. Pre-PR-61 evidence, reused here for the service/persistence layers only: the reviewed PR #61 patch shows the five affected transports were rewired to fail closed and authentication surfaces removed, while the TD-2 journal service contract (the five primitives and `(tenantId, ownerUserId)` enforcement) is unchanged apart from its contract comment (see §3). |
| `frontend/server/owner-context-unavailable.ts` | `cb8db45d…` | The current fail-closed 503 contract. |

## 3. Problem statement — the exact unresolved authority question

The global NO-AUTH posture is effective: no request may fail for lack of credentials, and no authentication principal exists in the first-party IRR application. But five capability areas are owner-scoped, and their only previously exercised owner/tenant supplier was the authenticated principal:

- **Journal domain (PF-1 / TD-2):** `frontend/server/persistence/persistence-service.ts` enforces `(tenantId, ownerUserId)` on every append/read/update/lookup. PR #61 changed its contract comment from "the CALLER derives tenant/owner from the authenticated principal" to "a trusted CALLER is responsible for supplying tenant/owner scope" — and no authorized supplier now exists.
- **Reports (D-1 Artifact/Report domain, D-3):** owner `(tenantId, userId)` was derived solely from the authenticated principal (D-3; D-2 §3.4).
- **User Portfolios (D-1 Portfolio domain, G-2):** ownership flows through the governed `(issuer, subject) → applicationUserId` translation and G24 ACTIVE-membership validation (`frontend/server/user-portfolio/translationBoundary.ts`) — a chain that begins with an authenticated principal and whose backend is off-main in the IPD repository.

**The exact unresolved authority question:**

> With no authentication principal available, **what must identify the application's legitimate data owner and tenant for owner-scoped operations**, by what authority is that identification established and maintained, within what lifecycle and failure semantics, for which of the five affected capability areas — and what is the disposition of data written under the prior auth-derived identities?

Every affected transport currently answers this question by refusing to answer it: `503 owner-context-unavailable`, "No owner is inferred; no data is read or changed." That posture must remain until the Program Authority answers the question explicitly.

## 4. Existing-authority search — no decision resolves this gap

An exhaustive text search of `origin/main` at the baseline was performed for ownership-source decisions (terms including: "ownership source", "owner source", "non-authentication ownership", "single/sole/canonical/personal owner", "owner binding", "ownership authority", "OWNER_AUTHORITY"). Findings:

1. The **only** record contemplating this gap is the global no-auth decision itself, which defers it (§5(5)) and forbids interim substitutes (§5(1), §5(4)).
2. D-1 and D-1 ext assign persistence-domain standing and journal governance but expressly create **no** owner/tenant authority, no identity mapping, and no implementation authority.
3. D-2 declares the identity/tenant landscape "MULTIPLE INCOMPATIBLE AUTHORITIES" and establishes **no** universal tenant, owner, or Company authority. Its four surveyed tenant sources are: the IRR fixture directory (removed by PR #61), the Reports file directory (branch-only), G24 memberships (branch-only, IPD repository), and IPD (none).
4. The G3 HARD STOP records that authentication/identity authority must not be invented.
5. AD-05 (G2-2) retains AUTHORITY REQUIRED for tenant membership and records runtime tenant behaviour as UNPROVEN.
6. `NP-08-D115` expressly excludes `companyId`/`runtimeCompanyId` from owner-identity candidacy.

**Conclusion: NO EXISTING PROGRAM AUTHORITY DECISION RESOLVES THIS GAP.** This conclusion is evidence-based (search above), not assumed.

## 5. Decision boundary

### A. Already decided — must remain unchanged

1. Single-user, personal-use application. The operative basis is the effective global no-auth decision §3 (PA-accepted record merged via PR #60; implementation merged via PR #61), which states the single-user, personal-use product scope. H-18 records the same product direction and is on `main`, but its own recorded status remains **CANDIDATE — PENDING PROGRAM AUTHORITY APPROVAL**; H-18 is therefore cited here as a recorded direction, not as an effective approved decision. No authentication, RBAC, multi-user support, or enterprise architecture.
2. Global NO-AUTH access posture for first-party IRR surfaces is effective (merged PR #60 record + PR #61 implementation). No in-scope request may fail solely for missing credentials; no replacement authentication of any kind.
3. No synthetic principal; no browser-supplied `userId`/`tenantId`/roles accepted as authoritative; no cross-domain identity mapping (global no-auth §5(1); D-2 §7–§9).
4. Existing owner/tenant data partitions are preserved — no rewrite, merge, reassignment, or exposure by dropping filters (global no-auth §5(4)).
5. Persistence domains remain distinct: Portfolio (G24 lineage), Artifact/Report (store lineage), and the Journal form (Watchlists/Collaboration/Settings) (D-1; D-1 ext). Domain ownership ≠ identity mapping ≠ implementation authority (D-1 §6).
6. Client-supplied identity must never become authoritative; cross-domain translation requires a separately governed contract (D-2 §7–§8).
7. Journal lifecycle operations (deletion, reset, retention, archival, compaction) are NOT governed and must not be silently invented (D-1 ext §3(7), §4).
8. Fail-closed posture at every owner-scoped boundary until ownership authority is explicitly established (global no-auth §5(5); current transport behavior).

### B. Unresolved — requires explicit Program Authority judgment

The decision fields in §7 (F-1 … F-7). None is answered by any existing record.

### C. Decidable at this gate without authorizing implementation

This gate decides: the framing of the authority question (§3); the inventory of settled constraints (§5.A); the decision fields and their evidence context (§7); the candidate source classes and their implications (§8); the data-safety invariants (§9); the capability scope boundary (§10); the qualification evidence bar for any future implementation gate (§11); and the publication sequence (§13). Deciding these frames is not deciding the ownership semantics themselves.

### D. Blocked until a later implementation-authorization gate

All implementation of any owner-context source; any change to the 503 behavior; any journal/schema/format/lifecycle change; any data migration or reconciliation; any admission or re-enablement of Watchlists, Collaboration, Settings, Reports, or Portfolios HTTP operations; any cross-domain binding; any merge or publication of an ownership decision as effective. §12 lists explicit non-authorizations.

## 6. Current state of the affected transports (verified at baseline)

All five transports preserve route/method validation and then fail closed for every owner-scoped operation, without reading request bodies, tenant claims, or Authorization headers:

| Capability | Transport | Behavior at baseline | Fail-closed tests (executed at preparation) |
|---|---|---|---|
| NP-09 Watchlists | `frontend/server/watchlists/watchlists-transport.ts` | 503 `owner-context-unavailable` | 3/3 PASS |
| NP-10 Collaboration | `frontend/server/collaboration/collaboration-transport.ts` | 503 `owner-context-unavailable` | 3/3 PASS + 4/4 route-integration PASS |
| NP-11 Settings | `frontend/server/settings/settings-transport.ts` | 503 `owner-context-unavailable` | 5/5 PASS + 5/5 route-integration PASS |
| NP-06 Reports | `frontend/server/reports-transport.ts` | 503 `owner-context-unavailable` | 2/2 PASS |
| G-2 Portfolios | `frontend/server/user-portfolio-transport.ts` | 503 `owner-context-unavailable` | 3/3 PASS |

Executed at preparation on the verified baseline (vitest, `frontend/`): **25/25 tests PASS across the seven suites above**. No capability data was read or changed; no `.iips-data` directory exists in the preparation workspace.

## 7. Decision fields for Program Authority

Each field states the exact question, the evidence that frames it, and what the Program Authority must determine. The recording agent supplies no answer.

### F-1 — Ownership semantics

**Question:** What must identify the application's legitimate data owner when no authentication principal is available?

**Evidence framing:** The application is single-user and personal-use (H-18); the human owner is recorded as Ramki (NP-12-N4 A3/A5; H-18 authority fields). Every prior runtime owner value was auth-derived or fixture-derived and is now removed or excluded (§4). The journal layer requires a concrete `(tenantId, ownerUserId)` pair per operation (TD-2); the Reports store requires a caller-supplied ownership pair (D-1 §4); the G-2 seam requires an `applicationUserId` resolved through a governed mapping from an authenticated subject (translationBoundary). The decision must therefore state what counts as the legitimate owner identification **at the authority level** and how it is expressed **as the concrete values** these domains consume — without inventing values to make requests succeed.

**PA must determine:** the authoritative definition of the legitimate owner; whether the owner identification is a declared fact, a governed record, or a per-domain authority; and the exact rule by which an owner-scoped operation obtains its owner value.

### F-2 — Tenant semantics

**Question:** What is the authorized source and meaning of `tenantId`, and how does it relate to the existing `ownerUserId`?

**Evidence framing:** D-2 §4 found four incompatible tenant authorities and established none as universal. The IRR fixture directory (`admin-a`/`analyst-a` → `tenant-A`) was fixture content in runtime use and has been removed (PR #61). D-2 §7–§8 forbid treating identifiers across domains as equivalent and forbid client-supplied identity. The journal uses `tenantId` as a partition key alongside `ownerUserId`; G24 validates tenant hints against ACTIVE memberships; Reports `tenantId` is not equatable with G24 `tenantId` (D-2 §3.4).

**PA must determine:** whether `tenantId` remains a partition dimension in a single-user application; if so, its authorized source, its meaning, and its relationship to `ownerUserId`; if not, the disposition of the existing tenant-keyed partitions and contracts — in every case without assuming any value can be invented, defaulted, or universally mapped.

### F-3 — Source and lifecycle

**Question:** What authority establishes the ownership context, and what persistence, stability, recovery, and lifecycle properties must that source satisfy?

**Evidence framing:** Candidate classes are framed (not selected) in §8. Whichever source is chosen must state: where it is recorded; who may create or change it and by what act; its stability across process restarts (journal separate-process restart is UNPROVEN — D-1 ext §3(8)); its recovery behavior; its behavior when unreadable or inconsistent; and the audit/evidence trail of its establishment. Implementation behavior is not certification evidence (D-1 ext §6).

**PA must determine:** the establishing authority and act; the required durability/stability/recovery properties; the change/revocation procedure; and the consistency-verification requirement.

### F-4 — Scope

**Question:** Does the ownership decision apply uniformly to Watchlists, Collaboration, Settings, Reports, and Portfolios, or does existing domain governance require distinctions?

**Evidence framing:** The five capabilities sit on **three distinct persistence/identity regimes** (D-1; D-1 ext; P5 §1 rows 3/6/7/8/12): (i) the Journal form with trusted-caller `(tenantId, ownerUserId)` (Watchlists, Collaboration, Settings); (ii) the NP-04 artifact store with caller-supplied ownership pairs (Reports; store off-main); (iii) the G24 managed-membership domain with governed `(issuer, subject) → applicationUserId` translation (Portfolios; backend off-main, IPD repository). D-2 forbids silently treating any one authority as universal and requires governed translation boundaries for cross-domain use.

**PA must determine:** whether one ownership decision governs all five capabilities (and, if so, the per-domain binding rule that respects D-1/D-2), or whether the capabilities are decided per-domain / in stages — and which capabilities are in scope of this decision at all.

### F-5 — Data safety / failure behavior

**Question:** What must happen when the ownership source is absent, invalid, unavailable, inconsistent, or cannot be independently verified?

**Evidence framing:** The current behavior is 503 `owner-context-unavailable` with no data read or changed (§6). Fail-closed precedents exist throughout the corpus (PIT, G2 seam, screener, donor surfaces — P5 §1 row 24).

**PA must determine:** the required failure behavior for each failure class, confirming or amending the fail-closed default. Until the decision explicitly permits otherwise, the fail-closed posture in §9 remains binding.

### F-6 — Existing data disposition

**Question:** Do current data or journal records require migration, ownership reconciliation, or other disposition?

**Evidence framing (verified without inspecting any user data):** No journal, database, or user-data file is tracked at the baseline (`git ls-files`: 1,221 files, zero journal/data matches); no `.iips-data` directory exists in the preparation workspace. The journal data directory is server-local (`IIPS_DATA_DIR`, default `<cwd>/.iips-data` — TD-7a) and therefore any existing journal records exist only on the machine(s) where the server has run. Records written before PR #61 were keyed by auth-derived pairs (per D-2 §3.1 and P5: server-derived `(tenantId, ownerUserId)` from the authenticated principal, with the fixture directory's tenant values). Whether such local journals exist, and under which pairs, **cannot be established from this repository without inspecting user data**, and no such inspection is authorized or has been performed. **No claim is made that existing records are safe to expose; none is made that they are lost.** The Reports store (off-main) and G24 store (IPD repository) raise the same question in their own repositories, reachable only through their own governance.

**PA must determine:** the disposition classes to permit (e.g., remain-preserved-inaccessible / reconciled / migrated / retired) and the evidence required before any disposition act — including whether any local-evidence collection is authorized and under what handling rules.

### F-7 — Qualification

**Question:** What is the minimum evidence needed to prove that each admitted capability reads and writes only within its authorized ownership boundary?

**Evidence framing:** The evidence bar is set by D-1 ext §5–§6 (per-capability qualification independently evidenced; separate-process restart unproven; implementation behavior is not certification) and by the fail-closed verification pattern already executed in §6.

**PA must determine:** the required evidence set per capability. Candidate minimum set (for PA review, not adopted): (i) positive boundary tests — operations admitted only under the authorized owner/tenant pair; (ii) negative boundary tests — foreign/absent/invalid pairs refused without data read or change; (iii) failure-mode tests — absent/invalid/inconsistent source yields the F-5 behavior; (iv) durability/restart evidence at the D-1 ext bar for journal-backed capabilities; (v) no cross-domain identifier equivalence claimed without a governed translation contract (D-2 §8).

## 8. Candidate ownership-source classes (framing only — none selected)

These classes are enumerated only to frame the F-1/F-3 decision. Each is listed with its recorded constraints. Selection belongs to the Program Authority with explicit evidence; this record selects none.

| Class | Description | Recorded constraints / implications |
|---|---|---|
| C1 — Governed owner declaration | An explicit, PA-authorized declaration establishing the owner (and tenant, if retained) for the single-user application, recorded through a governed act. | Must be distinguished from a "hardcoded/default owner merely to make requests succeed": the global no-auth decision §5(1) prohibits creating or substituting a default, hard-coded, or owner-named principal, and §5(5) requires a separate PA ownership/data-semantics decision before adding any binding. C1 therefore requires explicit PA authorization of exact content, mechanism, storage, lifecycle, and failure behavior. A bare constant without those properties is not C1. |
| C2 — Existing domain authorities | Reuse a domain's own authority (G24 managed memberships for Portfolios; caller-supplied pairs for the Reports store; trusted-caller for the journal). | Each is branch-only/off-main or has no established supplier on IRR main (D-2 §4); each is domain-scoped, not universal (D-1, D-2 §7); G24 additionally requires provisioning and membership lifecycle acts in the IPD repository. |
| C3 — Configuration-derived values | Browser value, local config, environment variable, or generated identifier. | Client-supplied identity must never become authoritative (D-2 §7(7); global no-auth §5(1)). An environment/config value is configuration, not authority, unless PA explicitly governs it — with its own stability/recovery/verification properties. Not admissible by default. |
| C4 — Derivation from existing data | Infer the owner from stored journal pairs or prior auth-derived records. | Inference/synthesis of a principal or owner is prohibited (global no-auth §5(1), §5(5)); would also require F-6 disposition first. Not admissible without an explicit PA decision authorizing that specific derivation. |

## 9. Data-safety and fail-closed invariants (retained until explicitly changed)

1. All five owner-scoped transports continue returning `503 owner-context-unavailable`; no owner is inferred, defaulted, or synthesized; no owner-scoped data is read or changed.
2. No hardcoded or fallback owner/tenant; no browser-supplied identity accepted as authoritative; no cross-domain identifier equivalence assumed.
3. Existing owner/tenant partitions and data contracts are preserved unchanged; no filter removal, rewrite, merge, reassignment, migration, or journal mutation.
4. Journal lifecycle operations (deletion, reset, retention, archival, compaction) remain un-governed and must not be invented.
5. No user data may be inspected, moved, or modified without a separately authorized act with explicit handling rules.
6. **Observation for the decision (not a directive):** the TD-7a code comment describes the data directory as "gitignored", but `.iips-data` does not appear in the repository `.gitignore` at the baseline (verified: 143 lines, no match; `git ls-files` shows no tracked data files). Any ownership decision that persists local owner-scoped data should account for keeping such data out of version control.
7. Production remains out of scope; the IPD repository is governed separately.

## 10. Affected capabilities and scope boundaries

| Capability | Workstream | Persistence regime (D-1 / D-1 ext) | Identity model evidenced (P5) | Status at baseline |
|---|---|---|---|---|
| Watchlists | NP-09 (INT-011a) | Journal (third form) | `(tenantId, ownerUserId)` server-derived via trusted caller | HTTP fail-closed 503; service/journal intact |
| Collaboration | NP-10 | Journal (third form) | same; PRIVATE owner-scoped threads — per `TRANSPORT_SEMANTICS` in `collaboration-transport.ts` (code-level evidence; see provenance note below this table) | HTTP fail-closed 503; service/journal intact |
| Settings | NP-11 | Journal (third form) | same | HTTP fail-closed 503; service/journal intact |
| Reports | NP-06 | Artifact/Report domain (NP-04 store, off-main) | `(tenantId, userId)` from authenticated principal (D-3) | HTTP fail-closed 503; domain modules intact |
| Portfolios | G-2 | Portfolio domain (G24, off-main, IPD repo) | governed `(issuer,subject)→applicationUserId` + ACTIVE membership | HTTP fail-closed 503; adapter/translation boundary intact |

Scope boundary: this gate covers only the ownership question for these five owner-scoped areas under the global no-auth posture. It does not reopen engine admission, provider designation, certification, convergence, or any unrelated workstream. The Collaboration product semantics remain Option A — Private Thread / Annotation Model; no sharing, ACLs, invitations, workspace membership, mentions, or assignments are introduced or implied. **Provenance note (Collaboration Option A):** the Option A — Private Thread / Annotation Model designation is supplied by the task's authoritative context; at the verified baseline, no repository decision record establishing that product decision was found on `origin/main` (searched; negative result), and none is asserted to exist by this record. The repository evidence available at the baseline is code-level: `TRANSPORT_SEMANTICS` in `frontend/server/collaboration/collaboration-transport.ts` declares "PRIVATE, owner-scoped collaboration threads", and the collaboration service/resolvers carry owner-scoped contracts with no sharing, invitation, or multi-user surfaces. That code-level evidence is consistent with the Option A designation but is not itself the governing product decision.

## 11. Required evidence for a subsequent implementation-authorization gate

A future gate may authorize implementation only after, at minimum:

1. The Program Authority has accepted an exact ownership decision record answering F-1 … F-7 (or explicitly deferring named fields).
2. The accepted decision has been merged to `refs/heads/main` under a separate explicit merge authorization and independently verified remotely (same sequence as the global no-auth gate, §13).
3. An implementation plan demonstrates: the exact source mechanism and its lifecycle; zero behavior change outside the authorized scope; preserved data contracts and journal format (`JOURNAL_FORMAT_VERSION` unchanged unless separately governed); and the F-7 qualification evidence suite.
4. Independent qualification per capability demonstrates reads/writes occur only within the authorized ownership boundary, with negative and failure-mode coverage.
5. Any cross-domain binding is covered by a separately governed translation contract per D-2 §8; any change in the IPD repository is authorized under that repository's governance.
6. Data-safety invariants in §9 remain satisfied throughout.

## 12. Explicit non-authorizations

This record does NOT authorize: implementation of any ownership source or provider; any change to the 503 `owner-context-unavailable` behavior; any hardcoded, inferred, or default owner or tenant; creation or modification of ownership records or user data; any data migration, reconciliation, or journal mutation; any persistence schema, journal format, or storage lifecycle change; any API or UI behavior change; admission or re-enablement of Watchlists, Collaboration, Settings, Reports, or Portfolios; creation of an implementation branch; merge, push, or publication of this or any record as an approved decision; production activity of any kind; any act in the IPD repository. Investigation and preparation confer no implementation authority.

## 13. Publication boundary and effectiveness

- **This record is PROPOSED.** Preparation on a working branch is not PA acceptance, not merge authorization, and not effective `main` authority.
- Required sequence for effectiveness (mirrors the H-18 / global no-auth precedent): (1) Program Authority reviews and explicitly accepts the exact decision rendered into the fields of this record (or a successor record); (2) Program Authority separately authorizes merge of the governance record; (3) the authorized PR is merged to `ramkivs/iips-review-recovered @ refs/heads/main`; (4) the merged commit/tree/blob are independently verified remotely; (5) only then is the ownership decision effective — and implementation authority, if any, arises only from a further gate meeting §11.
- At preparation: PA acceptance **PENDING**; merge authorization **PENDING**; main publication **NOT YET**; decision effective **NO**.

## 14. Acceptance criteria for closing this decision-preparation gate

This preparation gate closes when:

1. The Program Authority has reviewed this packet and either (a) renders explicit determinations for F-1 … F-7 into an exact decision record, or (b) explicitly directs a different framing, identifying the fields to change.
2. The rendered decision record's publication path is agreed under §13.
3. No field is silently defaulted: any field left undecided is explicitly marked UNDECIDED in the rendered record.
4. The fail-closed posture remains in force throughout (it does — nothing in this gate changes behavior).

## 15. Final status block

```text
OWNER_CONTEXT_DECISION=PROPOSED; NOT_APPROVED
DECISION_PREPARATION_GATE=PREPARED
BASELINE_ORIGIN_MAIN=139c5b8d24b3a21ba4db4ded044feadfb2ac582b
EXISTING_AUTHORITY_RESOLVING_THIS_GAP=NONE_FOUND_EVIDENCE_IN_SECTION_4
FAIL_CLOSED_503_OWNER_CONTEXT_UNAVAILABLE=RETAINED; VERIFIED_25_OF_25_TESTS_PASS
NO_SYNTHETIC_OR_DEFAULT_OWNER_OR_TENANT=REQUIRED
OWNER_TENANT_DATA_PARTITIONS=PRESERVED; NO_MIGRATION_NO_RECONCILIATION_AUTHORIZED
JOURNAL_LIFECYCLE_DELETION_RESET_RETENTION_ARCHIVAL_COMPACTION=NOT_GOVERNED
AFFECTED_CAPABILITIES=NP-09_WATCHLISTS; NP-10_COLLABORATION_PRIVATE_OPTION_A; NP-11_SETTINGS; NP-06_REPORTS; G-2_PORTFOLIOS
PA_DECISION_FIELDS=F-1_OWNERSHIP; F-2_TENANT; F-3_SOURCE_LIFECYCLE; F-4_SCOPE; F-5_FAILURE; F-6_EXISTING_DATA; F-7_QUALIFICATION
IMPLEMENTATION_AUTHORITY=NONE
CAPABILITY_ADMISSION=NONE
PA_ACCEPTANCE_OF_DECISION=PENDING
GOVERNANCE_RECORD_MERGE_AUTHORIZATION=PENDING_SEPARATE_EXPLICIT_PA_AUTHORIZATION
ORIGIN_MAIN_PUBLICATION=NOT_YET
DECISION_EFFECTIVE=NO
NEXT_GATE=PA_DETERMINATION_OF_FIELDS_F-1..F-7; THEN_SEPARATE_MERGE_AUTHORIZATION; MERGE; REMOTE_VERIFICATION; THEN_IMPLEMENTATION_GATE_PER_SECTION_11
```

*End of proposed decision-preparation record. It frames the Program Authority decision required to resolve the non-authentication ownership gap; it selects no ownership model, grants no authority, and changes no behavior.*
