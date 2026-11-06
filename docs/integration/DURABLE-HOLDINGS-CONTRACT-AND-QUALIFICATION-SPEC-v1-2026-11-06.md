# Durable holdings contract and qualification specification — v1.0.0

**Work item:** WS-A-DH-CONTRACT-READINESS-03-2026-11-06 (Prompt 8).
**Document version:** 1.0.0, 2026-11-06. **Status:** contract/test definitions prepared; NOT IMPLEMENTATION AUTHORITY, QUALIFICATION OR ADMISSION.
**Primary specification:** [next readiness package](DURABLE-HOLDINGS-NEXT-EXECUTION-READINESS-PACKAGE-2026-11-06.md).
**Authority baseline:** IRR main `3d97b8bfa58316cc1d5bd703396569e5ba171696`, merged #474 and its effectiveness receipt, independently verified. G4-2 C-3, D01 repository designation and D04 snapshot/contribution scope are EFFECTIVE. Canonical portfolio repository is `ramkivs/iips-production-market-data`; IRR is its consumer. No other portfolio repository is involved.

## 1. Version, evidence and decision boundary

This is one coherent specification with machine-readable appendices under `evidence/integration/durable-holdings-contract-v1-2026-11-06/`: baseline/provenance, candidate JSON Schemas, schema-only vectors, future runtime test definitions, H01–H12 matrix and validation/publication helpers. Appendices are part of this specification, not separate competing decision papers. Reuse previous source/authority investigations; do not repeat implementation or operational tests.

**Finalizable as documentation under current authority:** exact source/contract comparison, proposed DTOs/state machines, trust invariants, test definitions, evidence requirements and bounded authorization requests. **Not finalized as effective runtime policy:** D02 ownership extension/tenant choice, D03 lifecycle/wire/projection amendments, D05 engineering/qualification scope, or D06 admission. Only the three previously adopted decisions are effective. No new Act ID is assigned by this specification.

IPD source reference is main `07e86a4f2c105651f3097a96cb519f8611945e30`: 14 earlier cited source/authority blobs still match and were freshly SHA-256 verified; the protocol source and three IRR consumer definitions were additionally read for exact schemas. Source inspection is not qualification. Baseline JSON records immutable file identities and the already-published #474 effectiveness receipt. Frozen acts remain unchanged.

### 1.1 Measured contract gaps — do not paper over them

| Surface | Authoritative observation | Explicit candidate disposition, requiring approval where substantive |
|---|---|---|
| Accepted consumer v1 vs current reads | Original v1 describes durability; later DR-3/DQ-2 omits `durability`/`durable` on detail. IRR enforces absence | Detail schema preserves absence. Never manufacture either field or infer it from revision |
| Non-empty contributions | IPD projects nullable provenance from migration 004; IRR DR-4r/DQ-3 refuses non-empty contributions | Exact nullable projection amendment requested; retain NULL as unknown, not blank/default/source reconstruction |
| Save shape | Accepted v1 flat `mode/contentDigest/broker`; generic IRR adapter sends nested `options` and cannot produce richer `G2SaveResult` | Candidate uses a dedicated flat save DTO plus actual receipt/readback, not the richer generic result. No hidden adapter repair |
| Provenance | Internal broker writer accepts file/time/lineage inputs; accepted generic IPC does not carry the full provenance | Candidate consumer-contract **2.0.0** adds a closed `sourceEvidence` payload and explicit observed holding fields. Candidate frame `v=2`, existing framing/endpoint and closed operation names; current `v=1` unchanged. Never send these new fields to current v1 as if admitted |
| Creation | Accepted IPC create has name only and INITIAL revision 1; lower store currently rejects empty holding vectors; current dispatch refuses writes | Candidate permits empty INITIAL only, no fake holding/default portfolio; implementing this narrow exception needs D03/D05 authority |
| Revision cap/order | Current store checks stale revision, then cap=4, then duplicate; cap can refuse even duplicate at revision 4 | Candidate removes fixed cap, preserves stale-first, makes duplicate no-op before overflow refusal for new mutation. This is an explicit semantic change, not an existing guarantee |
| MERGE meaning | Current durable writer stores the incoming holding vector, does not compute an additive multi-broker union; contribution ledger accumulates digest records | Candidate explicitly defines authoritative complete observed snapshot + lineage merge. No summed quantities, inferred trades or silent cross-broker aggregation. PA must accept this meaning or request a separately bounded alternative |
| Modes | Lower store has REPLACE/RESET/DELETE; internal broker import refuses REPLACE on existing portfolios; no live IPC writes admitted | Initial candidate scope is create + MERGE snapshot save + necessary reads only. No re-enabling REPLACE/RESET/DELETE |

## 2. D02 — trusted holdings-owner contract

### 2.1 Inputs, ownership and resolution

**Canonical owner:** `owner-4dc756b3`. `SAIRAM` is display-only, never authentication or authority. IPD alone owns binding resolution and durable authorization. IRR evidence tenant `irr-personal-073dd1c8` is not automatically a holdings tenant or credential.

**Proposed exact technical-tenant choice for PA:** retain IPD `ipd-personal-local` as the holdings tenant; prospectively bind it to canonical owner `owner-4dc756b3`. This minimizes tenant changes and is **not adopted**. It differs from evidence tenant identity; no equivalence, cross-domain carrier authorization or automatic data reassignment is asserted. Alternative: changing both owner and tenant requires a separate exact governed mapping/data disposition and qualification, not an undocumented substitution.

Internal IPD resolution input is the OS-protected local endpoint and database's binding/membership rows, never a browser-supplied owner. Require exactly one ACTIVE binding and exactly one ACTIVE membership for it; return internal `{bindingId, membershipId, canonicalOwnerId, tenantId}` only after resolving and validating current store facts. No owner/tenant/binding ID is serialized in IPC responses. An IRR local precondition is readiness metadata, not owner proof. Endpoint names, portfolio IDs, browser origin, cookies, tokens, F-3/evidence carrier and display labels do not authenticate the holdings owner.

On each request, framing and recursive caller-authority rejection precede resolution. Reject unknown/authority fields at every nested request object; never strip and treat the remaining request as authorized. Current C7 refused-key union remains normative, including owner/tenant/principal/scope/credential/companyId/identityStatus/resolutionDisposition. Schema closure is supplemental: it is not a replacement for recursive C7 checking.

Absent/multiple/malformed/revoked binding or membership and resolution faults → Class P, zero bytes and close, bounded local diagnostics only. Foreign, missing, mismatched-tenant and tombstoned portfolio → same post-authorization `RESOURCE_UNAVAILABLE`, existence hidden. Resolve fresh per call; before any domain mutation re-resolve and compare owner/membership under the same `BEGIN IMMEDIATE` transaction. Revocation committed first wins. A writer serialized first may complete before later revocation; do not promise retroactive cancellation or a process-global cached owner.

### 2.2 Provisioning/data prerequisites

No current inventory or DB access is authorized. A future expressly authorized operator must establish runtime/schema/binding/membership/ownership and whether existing data exists before any provisioning/data change. Empty, conflict-free target may only be provisioned under its separate exact authority. If old owner data exists, preserve it; require an exact offline old/new mapping and collision/revocation disposition before reassignment. Revoked data remains inaccessible and retained under W-16, not silently transferred or deleted. No automatic startup/request-time provisioning, portable credential or new auth/tenancy model.

**Proposed PA wording — P8-D02-REQ-01, NOT ADOPTED:**

> Extend the canonical owner `owner-4dc756b3` prospectively to the G-2 holdings snapshot domain in the designated IPD repository, with technical tenant `ipd-personal-local` retained as a distinct IPD key. SAIRAM remains display-only; the IRR evidence tenant/carrier is not holdings authority. IPD resolves and revalidates its sole ACTIVE local binding/membership within the protected transaction, refusing caller identity and ambiguous/revoked bindings. This grants no operational inventory, provisioning, migration, existing-data reassignment, holdings writes or admission. Existing data/collisions/revocations require separately authorized inventory and an exact governed disposition before any change. Implementation requires the separate D05 instrument.

Acceptance of a future D02 rendering: explicit owner/tenant choice and exclusions; identity/no-leak/revocation test definitions accepted; no inferred data transfer; immutable authority published/effective. D02 remains separately unauthorized now.

## 3. D03 — lifecycle and API candidate contract

### 3.1 Exact request/response definitions and compatibility

`contracts.schema.json` is Draft 2020-12, a **candidate contract definition**, not an installed validator or runtime contract admission. `$defs` contains Create/Get/List/Revisions/Save requests, observed/server-derived holdings, contributions, summary/detail/revision, minimal save receipt, success envelopes and authorized refusal. Request objects are closed recursively; no owner/tenant/companyId/identity status/lineage assertion from the caller. The 20 schema-only examples contain explicitly synthetic values, not broker or master-identity evidence.

Same-host IPD endpoint; uint32 big-endian length + UTF-8 JSON, one request/at most one response per connection; request 64 KiB and response 256 KiB caps remain. No TCP/HTTP or new IPC operation. `requestId` is optional correlation only. Candidate request/response JSON carries `v=2`; current `v=1` requests and refusals are unchanged. Required new fields make this a deliberately breaking, separately PA-approved version, not an optional minor extension. Current IPD must refuse `v=2` as unsupported until exact authority/paired deployment. Frame/envelope validation, C7 rejection, binding resolution, W-1, then permitted operation; malformed/oversize/unknown/reserved operations remain Class P. Framing/size/domain/cross-field/security checks are not all expressible in JSON Schema.

| Operation | Candidate request payload | Candidate result / invariants |
|---|---|---|
| `portfolio.list` | No payload | Actual summary array for resolved owner only; no auto-create/default/fallback |
| `portfolio.get` | `{portfolioId}` | Actual Detail: summary plus holdings/contributions. Durability fields absent under DR-3; IPD-derived identity/lineage in output only |
| `portfolio.revisions` | `{portfolioId}` | Ordered actual immutable historical entries; `committedAt` is stored revision time, not generated read time; no borrowing current metrics |
| `portfolio.create` | `{portfolioName?}` | New opaque IPD ID, empty INITIAL revision 1, `isSaved:false`, zero holdings/contributions. No request-idempotency promise. Requires approved empty-INITIAL implementation |
| `portfolio.save` | `{portfolioId,expectedRevision,mode:'MERGE',holdings,contentDigest,broker,sourceEvidence}` | Existing portfolio only, positive expectedRevision. Minimal accepted save receipt + separately verified actual readback. No implicit create through this external operation |

`sourceEvidence` is proposed `{fileName,sourceBroker,importedAt,evidenceRecordDigest}`: provenance observations only, never authority; original timestamp and reference digest must match the approved IRR retained record, not current clock or guessed metadata. `contentDigest` is the existing original import digest/contribution identity. `evidenceRecordDigest` identifies a retained parsed-evidence record, not a new database key or raw CSV upload. Validate root broker/source broker/per-row broker consistency; preserve source values, refuse contradictory provenance. IPD computes canonical identities, row lineage and aggregate provenance digest using the existing governed IPD broker mapper/provenance functions over source observations and original importedAt; the adapter must construct the internal lineage field server-side, never accept it as a wire assertion. No digest algorithm is replaced. A caller-supplied digest is not proof of identity, authorization or authenticity. Do not change existing digest algorithms or claim cryptographic verification merely from 64 hex characters.

Proposed 2.0.0 fields and mappings require **D03 contract acceptance**, exact paired IRR/IPD deployment pins and contract conformance tests. Unknown `sourceEvidence`/new row fields on current v1 must not be silently sent, ignored or coerced. No dynamic negotiation/probing or undocumented v2 endpoint. Existing op names/envelope structure/framing are reused, but the exact new version value and payload semantics are explicit D03 amendment scope, not effective v1. Implement a separate guarded v2 branch only after authorization; preserve v1 behavior and refuse unapproved/mixed versions. No downgrade, silent automatic upgrade or mixed-version interpretation is allowed.

### 3.2 Snapshot, revision and duplicate invariants

The candidate MERGE payload is the complete authoritative **observed holdings snapshot**, not a delta. Persist the incoming vector for the next revision, append one contribution record for a new import digest; do not add quantities or sum old/current snapshots. Contribution `amount` is snapshot-observation value, **not cash paid**; summing contribution amounts is not current portfolio valuation. Multi-broker union/accounting is outside this candidate; PA must expressly accept this meaning rather than infer completeness from a single broker export.

Creation allocates one stable ID with INITIAL revision 1 and zero holdings. Subsequent mutating saves commit exactly revision n+1, immutable old holdings/revision rows and updated current pointer plus contribution/audit atomically. `isSaved` describes the current operation; evidence retained is a different state. No selective history rewrite, expiry, purge or compaction. No REPLACE/RESET/DELETE in the proposed initial scope; retain existing code/fences and historical read vocabulary without re-enabling these operations.

**Current cap remains 4. Proposed successor:** revision and expectedRevision are safe integers 1…9,007,199,254,740,991; no arbitrary four-revision limit. Under the serialized transaction: validate ownership and expectedRevision first → validate complete payload/identity/provenance → check active-set contribution digest and exact content duplicate → no-op returns same revision and original lineage, no new rows → for a new mutation refuse if n is at the safe maximum, else append n+1. Current source's cap-before-duplicate behavior is explicitly different; no cap removal or reordering is implemented here. Use existing `REVISION_CONFLICT` for unavailable next revision with bounded non-sensitive detail; do not invent a currently implemented outcome code.

Idempotency scope is resolved owner + portfolio + active contribution set + original content digest, not requestId, file name, timestamp or display label. Same digest after intervening imports is a no-op at a current expected revision; stale expectedRevision still conflicts even for duplicate input. A no-op never restores an earlier holdings vector or retimestamps provenance. Identical concurrent submissions at the same expected revision yield one commit and a stale loser; a later explicit reconciled duplicate at the new revision may no-op. No background resend. Equal last-content digests follow the existing deterministic computation; no fuzzy equivalence or independent rehashing canonicalization is introduced.

Cross-field numeric proposal: finite non-negative binary64 values within the JS safe numeric range; active quantity positive, inactive quantity may be zero; weight 0…100 and whole-vector weight sum 100±0.01 for a non-empty save, at least one active row, no duplicate symbols. Preserve broker-observed marketValue (do not silently recompute or round it); aggregate sum/weights must match the stored input within the stated tolerance, without decimal/REAL migration or exact-money/accounting claims. Schema checks types/ranges; domain tests check finite values, aggregate overflow and sums, duplicates, broker consistency and actual canonical resolution. These bounds/tolerance are proposed D03 semantics, not an assertion that the lower store currently enforces all of them.

### 3.3 Outcome and recovery state machines

| Prior state + event | Next state | Observable rule |
|---|---|---|
| ABSENT + authorized deliberate create | CREATED at revision 1 | Empty INITIAL only; no default on read/error; no holdings success claim |
| CREATED/SNAPSHOT_n + valid new snapshot at n | SNAPSHOT_n+1 | Complete atomic domain commit; receipt only after COMMIT |
| SNAPSHOT_n + duplicate at current n | SNAPSHOT_n | ALREADY_IMPORTED_NO_OP; original lineage retained, no new revision/contribution |
| SNAPSHOT_n + stale/malformed/unresolved/foreign | Unchanged or hidden | Typed authorized refusal / Class P as appropriate; no partial domain write |
| Any attempted write + timeout/disconnect/commit uncertainty | OUTCOME_UNKNOWN | Neither SAVED nor FAILED-to-retry; no automatic resend |
| OUTCOME_UNKNOWN + exact authorized revision/contribution readback | COMMITTED_VERIFIED or still UNRESOLVED | Match stable ID, expected successor/current revision, content/contribution/provenance evidence and actual snapshot; a receipt alone is insufficient |
| OUTCOME_UNKNOWN + absent row | UNRESOLVED unless terminal non-commit proved | Absence while a writer could still commit is not proof; require settled operation/quiescence and consistent reads before NOT_COMMITTED classification |
| Unknown create + ambiguous new list entries | UNRESOLVED | Name/time/requestId matches are not proof. No second create until exact outcome resolution and explicit user action |

IRR UI states: PREVIEW/EVIDENCE_RETAINED → SUBMITTING → RECEIPT_UNVERIFIED → SAVED_VERIFIED only after permitted readback; errors → REFUSED or OUTCOME_UNKNOWN. A committed save whose readback fails remains unverified/unknown to the UI, not a failed import inviting retry. No session store, default portfolio, repair, automatic replay or compensation by deleting IRR evidence. IPD and IRR PF-1 are not one distributed transaction.

Pre-authorization Class P: zero bytes/close, no owner/resource disclosure. Class A: exact admitted typed envelope, `RESOURCE_UNAVAILABLE` folds foreign/missing/tombstoned; `REVISION_CONFLICT`, `INVALID_REQUEST`, `REFUSED_UNRESOLVED_IDENTITY`, `REFUSED_STORE_GUARD`, `WRITE_NOT_AUTHORIZED`, `UNAVAILABLE` remain bounded. Transport-level unknown is an **IRR outcome**, not a fabricated current IPC `OUTCOME_UNKNOWN` frame. Internal broker outcome vocabulary remains distinct. No raw SQL/path/stack/identity in responses; sanitized local diagnostics are not proof of successful state.

### 3.4 Response and contribution projection

Do not construct the richer generic `G2SaveResult` by inventing holdingsSavedCount/isSaved/portfolio/timestamps. Candidate dedicated save consumer validates the minimal receipt's disposition/revision/durability/durable pair, then reads actual Detail and Revisions to verify. Save receipt durability fields belong to accepted v1 save vocabulary, **not** an admitted implementation/result now; their emission/reliance requires applicable separate result/DR authority and actual serving-store evidence. Detail retains DR-3 absence of both fields; a provider claim there must still refuse until separately amended. A boolean from the receipt never substitutes for qualification/admission.

Candidate DR-4r contribution amendment maps exactly `contributionId, amount, contributedAt, createdAt, fileName, sourceBroker, contentDigest, lineageDigest, importedAt, semantics`; migration-004 legacy provenance may be NULL. Preserve all NULLs as unknown; no empty strings, guessed broker/filename/import time, dropping a row or replacement by an empty list. Validate schema and cross-field source/lineage consistency; malformed non-empty rows refuse projection, not fabricate a successful empty portfolio. `holdingsCount → totalHoldingsCount` and `committedAt → createdAt` remain only authorized IRR renames, not wire changes. Counts/value/weights come from actual readback; not the receipt's absent counters.

**Proposed PA wording — P8-D03-REQ-01, NOT ADOPTED:**

> Adopt the candidate lifecycle/API semantics in this specification v1.0.0 §3 and its content-addressed schema appendix: deliberate empty INITIAL revision 1; complete observed snapshot plus contribution-ledger MERGE, not additive cross-broker holdings; immutable safe-integer revisions replacing cap 4, stale-first/duplicate-before-overflow ordering; no request-idempotent create or automatic retry; exact unknown-outcome reconciliation. Accept the explicitly versioned proposed payload/provenance amendment and dedicated minimal-receipt/actual-readback mapping, including nullable non-empty contributions, only at named paired implementation pins after conformance and the applicable DR/result amendment. Preserve DR-3 detail-field absence unless separately rendered otherwise. Initial scope excludes REPLACE/RESET/DELETE, accounting, identity expansion and operational permission. This semantic decision grants no engineering or write authority; D02, D05, qualification and D06 remain separately required.

Alternative: retain current cap/gaps and writes closed. Request-idempotent create, multi-broker aggregation, accounting or broader mode admission needs a distinct bounded contract; none is inferred. A future rendering must name this document/schema Git blobs and actual approved contract version, not use unfilled coordinates as an effective act.

## 4. D05 — exact bounded implementation and qualification envelope (proposal only)

### 4.1 Candidate file/change allowlist

| Repository/file locus | Precisely proposed delta | Exclusions / prerequisites |
|---|---|---|
| IPD `src/persistence/portfolio_store.ts` | Approved empty-INITIAL exception, revision-cap successor/overflow and duplicate ordering; retain transaction/history/current-pointer/owner predicates | No direct operational DB access; no change to ownership/data without D02; no new ledger or history deletion |
| IPD `src/persistence/brokerImportPersistence.ts` | Exact approved snapshot/provenance mapping and validation reuse | No guessed identity, D05-master expansion, digest algorithm change, automatic create via external save, REPLACE activation or W-1 bypass |
| IPD `src/persistence/binding.ts` | Approved prospective canonical-owner/tenant contract checks and serialized revalidation only if D02 requires a code delta | No automatic provisioning, rebinding, old-data reassignment or weakened revocation |
| IPD `src/ipc/protocol.ts`, `src/ipc/dispatch.ts` | Closed approved payload/result validation and guarded future handler integration/conformance | W-1 remains hard-false and current refusals unchanged; no new op or live write reachability, no direct raw-store bypass |
| IPD new `tests/durable_holdings_contract_v1.test.ts`, `tests/durable_holdings_recovery_v1.test.ts` | Isolated synthetic lifecycle/owner/transaction/schema/failure tests and restart/backup fixtures | Future exact authorization only; no real DB or operator evidence reset. Actual directory/test runner verified in implementation plan |
| IRR `frontend/server/user-portfolio/ipcPortAdapter.ts`, dedicated new `snapshotContract.ts`/`snapshotContract.test.ts` in same directory | Approved narrow DTO and nullable projection/readback consumer tests; retain generic gap refusal until exact replacement approved | No new browser route, raw CSV upload, write enablement, default/session fallback, certified reference/PF-1/IID changes |

This is the **proposed** D05 allowlist, not permission to touch IPD. Existing `durablePortfolioStorePort.ts` guard and connection/migration/endpoint/provisioning code are **protected**, reused unchanged; do not rewrite frozen W-1 constants to make tests pass. If a schema, endpoint, provisioning, consumer-surface or file change outside this allowlist is found necessary, stop and request an explicit amended envelope. No prior migrations 001–004 edits and no new migration are authorized by this candidate. Optional source metadata added to already-existing provenance columns; an actual need for new persistence columns or migration must return for exact separate authorization.

### 4.2 Transaction, integrity and test boundaries

One designated local node:sqlite connection, supported Node >=22.13.0, existing FK/journal/synchronous settings, `BEGIN IMMEDIATE` outer transaction; nested broker/store work shares it. Revalidate active binding/ownership, payload/identity/numeric/expected revision and duplicate under that same boundary before domain writes; atomically write revision/holding rows, active contribution, pointer and existing audit behavior, COMMIT then acknowledge. No production direct construction bypass of the guarded port. Missing/foreign/tombstoned resources indistinguishable. Lock timeout or unknown commit never triggers automatic write retry. All rejected requests leave zero domain delta; identity quarantine/evidence records, if existing policy creates them, are separate authorized evidence effects and never mislabeled a successful holdings write.

Future tests may use clearly isolated temporary synthetic databases only after the exact D05 test scope is authorized. Required injection points: before transaction; after portfolio/revision/each holding/contribution/pointer/audit mutation where present; before COMMIT; commit attempt; post-COMMIT/pre-ack; transport failure and restart. Compare all relevant logical row counts, stable IDs, revisions, historical hashes/current pointer/lineage, not just a return code. Corruption/tamper/migration-checksum mismatch → fail closed, never repair or substitute empty state. Distinguish SQLite rollback from inability to prove commit outcome; no unconditional power-loss guarantee.

### 4.3 Provisioning, migration, backup/recovery and host safeguards

Provisioning/data migration execution remains outside this proposed D05 engineering envelope. Separately authorized inventory must bind exact local path/runtime/schema ledger, principal/binding/membership, ownership/portfolio/revision/tombstone/audit state and data-collision disposition. No operational inventory was performed here. If data or identity mapping needs migration, attach a later exact act and additive migration/checksum/rollback plan; never edit prior migration checksums or auto-reassign revoked data.

Backup design: stop IRR/IPD writers, close all handles, establish operator-confirmed quiescence; verify regular owner-local path, no symlink/ambiguous/network/Git target; use consistent quiesced database and required sidecars as one set, not a live DB-file copy. Manifest includes source pins/runtime/schema/migration checksums, physical copy hashes and logical schema/binding/history/lineage identities, cut time and quiescence evidence, with access-controlled local storage and minimal non-sensitive audit. Restore only into a new isolated non-production location for testing; verify manifest, schema/checksum/foreign-key/integrity/history/current-pointer/owner/revocation before use. Reject damaged/incomplete backup or incompatible binary/schema. No overwrite of newer accepted history, replay-as-restoration, automatic restore or downgrade against changed schema. Retain original copies; rollback means stop and verify pre-change recovery readiness, not destructive SQL undo.

Proposed operational recovery target, **not adopted**: verified consistent pre-change backup and before any later admitted mutation, RPO zero relative to that last protected cut; recovery must preserve all accepted later history or refuse rollback, not silently meet an RPO by discarding it. Isolated restore qualification target RTO <=30 minutes from verified available local copy; if unmet, report failure and return for a different explicit policy, not claim compliance. No backup schedule is activated by this document. Frequency/capacity/path/retention and operating recovery permissions must be rendered in the final operator/admission scope; original retained copies and evidence-retention policy are not altered.

Qualify the exact designated host OS/runtime/endpoint security and filesystem: named-pipe ACL on Windows or owner-only local socket controls on POSIX, readable/writable/full/locked/unsupported path, handle release/restart and journal consistency. Source flags are not proof of Windows ACL, locking, fsync, sudden power-loss or all-copy erasure properties. No new host/production deployment or Gate 4 execution designation in this work item.

**Proposed PA wording — P8-D05-REQ-01, NOT GRANTED:**

> After D02 and D03 are expressly effective at their exact scopes, authorize only the non-production engineering and isolated synthetic-test delta in specification v1.0.0 §4.1's named IRR/IPD file allowlist, implementing the approved snapshot contract while retaining hard-false W-1 and all live refusals. Require H01–H12 and the unchanged governing QE obligations, with exact committed implementation/test inventories, negative owner/identity tests, beyond-four/overflow/idempotency/retry tests, non-empty projection tests, transaction/failure/restart and consistent isolated backup/recovery evidence. No operational database access, provisioning, migration, old-data reassignment, source outside the allowlist, prior migration edits, D05-master/A-6 expansion, content/QE execution pin, Gate 4 acceptance, D06 admission, production, accounting, PF-1/evidence/clearing or guard weakening is included. Return for an exact amendment if any excluded dependency is required. Product writes stay closed; later host/operational qualification and admission require their own applicable explicit authority and accepted evidence.

This is a bounded engineering/test request, not new host qualification authority. Exact native-host acceptance remains governed by existing acts and C-3/other Gate 4 questions. The PA may instead retain all current behavior/writes closed. The proposed instrument must bind immutable spec/schema/allowlist and identify actual implementation/test pins in its eventual acceptance record; do not invent future SHA values or waive controls to fill them.

## 5. D06 — operation-specific admission, still conditional

Accountable admission authority: **PA**; operator/IPD produce evidence and IRR consumes only the admitted contract. A prepared checklist, green CI, accepted policy, owner extension or synthetic test pass is never admission.

| Gate | Evidence required before a PA admission decision | Failure consequence |
|---|---|---|
| Effective scope | G4-2/D01/D04 plus exact D02, D03 and D05 authority, governing contract/DR amendments and exact implementation coordinates | Stop; do not broaden an older act |
| Owner | Approved canonical binding/tenant, authorized provisioning/data disposition where needed, current isolation/revocation proofs | No identity guessing/rebind/default; refuse |
| Implementation | File/schema/contract inventories and accepted conformance, H01–H12 evidence, all required governing results | Fixture PASS alone insufficient |
| Host/backup | Exact host/runtime/filesystem/endpoint and safe backup/isolated recovery results; approved operational recovery policy | No source-flag substitute or destructive rollback |
| API/UI | Non-empty actual snapshots/contributions and sanitized errors; receipt/readback/unknown-outcome controls; no unadmitted DR fields | No false saved state or automatic resend |
| Governance | Applicable Gate 4 acceptance, Gate C/U4 and DQ requirements satisfied through their proper authority; separate result acceptance | Current QE 0/11 and NOT RENDERED states cannot be bypassed |
| Operations | Explicit named create, MERGE snapshot save and necessary reads at exact IRR/IPD pins, owner scope, operator controls and stop/revocation conditions | No blanket write enablement; REPLACE/RESET/DELETE/accounting excluded |
| Effectiveness | Distinct PA admission act, exact scope/date/authority and required publication/green checks/independent readback | No automatic admission when prerequisites become true |

**Proposed future PA wording — P8-D06-REQ-01, NOT ADMISSION:**

> Keep operations unadmitted until the exact authorities, owner, implementation/host/backup/contract evidence and separately accepted qualification results in §5 are attached and verified. A later distinct PA act must name the exact admitted snapshot create/MERGE-save/read operations, source coordinates, owner/tenant, operational safeguards and effective publication. No operation is admitted by this checklist; no W-1/fence change, Gate 4 acceptance or execution pin is rendered here. Broader operations require separate authority.

## 6. Cross-workstream responsibility and remaining PA docket

| Dependency | Accountable party | Current disposition / exact next requirement |
|---|---|---|
| A-5 | Operator supplies genuine source; IRR validates under existing intake scope | Detailed 11-column DHAN_DETAILED_HOLDINGS_V1 with actual ISIN/Exchange/raw digest/provenance still external. Existing 68 summary rows: 1 resolved/67 unresolved, not complete coverage |
| A-6 | PA authorizes exact expansion; IPD/operator corroborates/deposits | New D05-master expansion authority absent. Genuine residual assessment + independent corroboration + exact drop/checksum/count/masterRevision/integrity tests required; never guess identifiers |
| A-7 | IPD/IRR within applicable authority | Blocked on completed authorized A-6; then actual per-row re-assessment/readback and any exact consumption disposition. Missing source cells are not an ISIN absence test |
| IID-1/2/3 | Existing roadmap/domain owners | Merged #456/#461/#464+#467 at recorded scopes; synthetic M-1 is not real holdings or issuer readiness |
| IID-4 | Existing separate implementation owner | Merged #471 with #473 post-merge evidence preserved; no new IID code in this specification |
| IID-5/6 | Existing roadmap owners | NOT STARTED at rebaseline; M-2/M-3 not delivered. R-16 3/13 synthetic sectors, ten outstanding; L-001–L-027 retained |
| Retention/clearing | Existing IRR/operator authority | COMPLETE capability; not reopened. Indefinite retention until explicit reset, owner-only offline whole-active clear, verified retained recovery copy and restore/resubmit resurrection limits unchanged |

Consolidated authorization docket: **P8-D02-REQ-01** prospective owner/tenant extension; **P8-D03-REQ-01** exact candidate semantics/wire/projection; **P8-D05-REQ-01** bounded engineering/tests only; **P8-D06-REQ-01** later admission request/checklist, not grant. IDs are request IDs, **not Act IDs**. Other pending questions G4-1/G4-3/G4-4, A-5/A-6/A-7, IID-DATA/IID-L016 remain at their recorded boundaries; this spec does not replace them or re-adopt settled design. Existing current authority register remains three effective plus twelve pending; only documentary prerequisites have advanced.

## 7. Implementation-readiness assessment

**READY FOR A SUBSEQUENT BOUNDED PA AUTHORIZATION DECISION, NOT READY TO IMPLEMENT OR OPERATE.** The proposed target contract, exact scope, owner alternatives, schema/transition/failure rules (candidate consumer contract 2.0.0 / frame v=2), file envelope, test definitions and evidence gates are explicit. Missing authority is not missing documentation. Data-dependent inventory/mapping/migration and actual host/backup/real-input results remain separate prerequisites; no fabricated exact DB/path/binding/schema state or future implementation commit fills those slots.

D02 remains NOT ADOPTED; D03 remains a proposed contract/CONDITIONAL; D04 remains EFFECTIVE and unchanged; D05 separate implementation authority remains UNGRANTED; D06 remains CONDITIONAL / NOT ADMITTED. W-1 hard-false. QE 0/11; Gate C/U4 NOT RENDERED; no Gate 4 acceptance or QE execution pin. No holdings writes, operational DB access, IPD source/docs mutation, provisioning/migration, A-6 expansion, production/activation, PF-1/frozen authority/owner isolation weakening or completed retention/clearing implementation change.

## 8. H01–H12 acceptance and qualification matrix

The following rows mirror `acceptance-matrix.json`. Runtime tests T01–T24 are **definitions, not executions**. Schema vectors SV-01–SV-20 are documentation validation only. Each future artifact must state authority, exact source/test/host pins, fixture class, inputs/action/expected/observed result, failure evidence and limits; a synthetic fixture cannot discharge a genuine broker/real-holdings leg. No H criterion is marked qualified/complete by this work item.

### H01 — SOURCE_VERIFIED_HOST_UNQUALIFIED

- **Requirement:** Correct repo/runtime/schema/consumed inventory, protected foundations
- **Verification method:** Source identities plus separately authorized native host and artifact inventory audit
- **Required tests:** T01, T02
- **Evidence artifacts:** T01.json, T02.json
- **Expected result:** Matching exact blobs/pins/runtime; drift stops
- **Dependencies:** D05 exact scope; G4 pin/host conditions
- **Accountable owner:** IPD/IRR maintainers + operator
- **Current status:** SOURCE_VERIFIED_HOST_UNQUALIFIED
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H02 — BLOCKED_D02

- **Requirement:** Trusted owner and membership; absent/foreign/revoked/multiple or injected identity denied
- **Verification method:** Negative identity and serialized revocation fixtures
- **Required tests:** T03, T04
- **Evidence artifacts:** T03.json, T04.json
- **Expected result:** Zero bytes Class P; zero domain delta; foreign equals missing
- **Dependencies:** D02 effective owner extension
- **Accountable owner:** IPD owner/operator
- **Current status:** BLOCKED_D02
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H03 — DEFINED_NOT_EXECUTED

- **Requirement:** Stable snapshot persistence across process restarts
- **Verification method:** Authorized create/save/restart/readback fixture and later accepted host proof
- **Required tests:** T05, T06
- **Evidence artifacts:** T05.json, T06.json
- **Expected result:** Stable ID, revision and exact non-empty holdings/contribution lineage
- **Dependencies:** D05 authority and D02/D03 contracts
- **Accountable owner:** IPD + IRR + operator
- **Current status:** DEFINED_NOT_EXECUTED
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H04 — DEFINED_REAL_DATA_BLOCKED

- **Requirement:** Canonical identity and whole-import refusal
- **Verification method:** Negative/positive resolver and input guards, separate genuine input leg
- **Required tests:** T07, T08
- **Evidence artifacts:** T07.json, T08.json
- **Expected result:** No partial save; no guessed identifiers; zero delta on refusal
- **Dependencies:** D05 fixtures; A5/A6/A7 for real data
- **Accountable owner:** IPD identity/store owner
- **Current status:** DEFINED_REAL_DATA_BLOCKED
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H05 — DEFINED_NOT_EXECUTED

- **Requirement:** Serialized optimistic concurrency and duplicate protection
- **Verification method:** Races/busy/stale/revocation fault vectors
- **Required tests:** T09, T10
- **Evidence artifacts:** T09.json, T10.json
- **Expected result:** One committed revision at most; no write retry or cached authority
- **Dependencies:** D03 ordering and D05 test authority
- **Accountable owner:** IPD transaction owner
- **Current status:** DEFINED_NOT_EXECUTED
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H06 — DEFINED_NOT_EXECUTED

- **Requirement:** Atomic failure handling, unknown outcome and startup integrity
- **Verification method:** Faults at every mutation/commit/ack boundary in isolated stores
- **Required tests:** T11, T12
- **Evidence artifacts:** T11.json, T12.json
- **Expected result:** Complete revision or none; UNKNOWN if not provable; tamper refused
- **Dependencies:** D05 isolated fault-injection authority
- **Accountable owner:** IPD transaction owner + IRR
- **Current status:** DEFINED_NOT_EXECUTED
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H07 — DEFINED_PA_CONTRACT_REQUIRED

- **Requirement:** Duplicate/lineage and mode semantics are exact
- **Verification method:** Original/equivalent/earlier digest and baseline-vs-successor cap tests
- **Required tests:** T13, T14
- **Evidence artifacts:** T13.json, T14.json
- **Expected result:** No-op preserves original lineage; unadmitted replace/reset/delete stay refused
- **Dependencies:** D03 exact semantics, D05 scope
- **Accountable owner:** IPD/IRR contract owners
- **Current status:** DEFINED_PA_CONTRACT_REQUIRED
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H08 — BLOCKED_D03_D05

- **Requirement:** Cap successor and retained immutable revision lifecycle
- **Verification method:** Beyond-four and safe-integer tests; old-history comparison
- **Required tests:** T15, T16
- **Evidence artifacts:** T15.json, T16.json
- **Expected result:** Monotonic 1-based revisions, no purge/compaction; explicit overflow refusal
- **Dependencies:** D03 lifecycle adoption + D05 authority
- **Accountable owner:** IPD store owner
- **Current status:** BLOCKED_D03_D05
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H09 — DEFINED_HOST_EVIDENCE_REQUIRED

- **Requirement:** Consistent backup, isolated recovery and refusal of unsafe restore
- **Verification method:** Quiescent copy/hash/manifest/restore and corruption/collision tests
- **Required tests:** T17, T18
- **Evidence artifacts:** T17.json, T18.json
- **Expected result:** Exact history integrity and revoked-owner refusal; no overwrite of new data
- **Dependencies:** D05 host/backup scope; separately authorized operational restore
- **Accountable owner:** Operator + IPD
- **Current status:** DEFINED_HOST_EVIDENCE_REQUIRED
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H10 — SCHEMAS_VALIDATED_RUNTIME_UNQUALIFIED

- **Requirement:** Actual receipt and non-empty contribution/readback/browser mapping
- **Verification method:** Schema vectors plus later consumer/IPC/UI conformance tests
- **Required tests:** T19, T20
- **Evidence artifacts:** T19.json, T20.json
- **Expected result:** No fake fields/counts/durability, no NULL coercion or false saved state
- **Dependencies:** D03 projection/DR4r amendment; D05 implementation; D06 admission
- **Accountable owner:** IRR/IPD contract owners
- **Current status:** SCHEMAS_VALIDATED_RUNTIME_UNQUALIFIED
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H11 — BLOCKED_G4_D05_D06

- **Requirement:** Existing governing QE and independent qualification/result/admission requirements
- **Verification method:** Exact prescribed QE set and ID-specific D06 evidence gate
- **Required tests:** T21, T22
- **Evidence artifacts:** T21.json, T22.json
- **Expected result:** Required outcomes actually accepted; no fixture or Linux-only substitute
- **Dependencies:** C3/G4 and D05/D06 formal authorities
- **Accountable owner:** PA accepts; operator executes
- **Current status:** BLOCKED_G4_D05_D06
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

### H12 — SOURCE_PRESERVED_RUNTIME_NOT_EXECUTED

- **Requirement:** Unrelated/frozen/PF1/W1/evidence controls and no ledger remain intact
- **Verification method:** Strict source/authority scope audit now; future negative runtime regressions
- **Required tests:** T23, T24
- **Evidence artifacts:** T23.json, T24.json
- **Expected result:** No weakened fence/ownership/control, accounting or synthetic-real substitution
- **Dependencies:** Existing frozen controls and D05 exact change allowlist
- **Accountable owner:** IRR/IPD maintainers; PA scope
- **Current status:** SOURCE_PRESERVED_RUNTIME_NOT_EXECUTED
- **Completion criteria:** Exact authorized test/host evidence at named commits, expected invariants actually observed, limitations retained and required PA result acceptance separately rendered; schema/spec validation alone is not completion.

## 9. Publication and validation

Tracker §16.264 / CV-CORR-244 / CHG-2026-11-06-07 / V2139; R2 §27; WS-A-DM §7 are append-only cross-references. No frozen act, current authority register or implementation is rewritten. No IPD documentation change is attempted: this work has no express IPD documentation-write grant. Candidate IPD-owned contract/code changes remain request text in IRR.

Validation here is schema/metaschema, positive/negative synthetic schema vectors, test-definition/matrix cross-references, all required matrix fields, version/provenance/authority/scope consistency, existing CAP-03 classification/static and whitespace. External jsonschema 4.25.1 with rfc3339-validator 0.1.4 are validation-only tools installed outside the repository; no product dependency/lockfile changes. T01–T24 are never executed by this validator. Independent exact-head/merged-main API readback and CI prove publication only. Final PR comment records actual source/head/merge/parent/CI and protected blob preservation without a receipt-commit loop.

Validation reproduction (documentation tooling only, no product install):

```sh
python -m pip install --target /tmp/p8-schema-tools jsonschema==4.25.1 rfc3339-validator==0.1.4
PYTHONPATH=/tmp/p8-schema-tools python evidence/integration/durable-holdings-contract-v1-2026-11-06/validate_scope.py
```

The full scope validator deliberately binds this session branch and baseline; its runtime test-definition check does not execute any T01–T24 action.
