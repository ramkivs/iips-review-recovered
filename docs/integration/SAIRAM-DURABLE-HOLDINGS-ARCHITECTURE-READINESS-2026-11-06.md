# SAIRAM durable holdings — architecture investigation and implementation readiness

**Date:** 2026-11-06. **Class:** investigation and recommendation, NOT an authority act or write enablement.
**Status:** decision-ready; real personal holdings persistence NOT authorized by this document.
Canonical target owner **`owner-4dc756b3`**; **SAIRAM is display-only**, never a credential or partition key.

## 1. Verified baselines and repository designation conflict

| Repository | Independently read main | Finding |
|---|---|---|
| IRR `ramkivs/iips-review-recovered` | `2a55110806599084355b299fb3e0a559471f0c48` | Existing G-2 port/IPC read routes, evidence retention, W-1 fences |
| User-named IPD `ramkivs/ipo-screening-engine` (GitHub ID 1405223378) | `d661b5ee99a782566fedcb9aa2b139e756948d27` | README identifies Python personal IPO research; evaluation lifecycle and post-listing storage, not the cited G-2 portfolio implementation |
| G-2-cited portfolio repository `ramkivs/iips-production-market-data` (ID 1361385667) | `07e86a4f2c105651f3097a96cb519f8611945e30` | SQLite portfolio store, migrations, binding/IPC, broker reconciliation and hard-false W-1 guard; also current IRR broker-import dependency pin |

These are **different repositories**, not alternate names for the same GitHub repository. The complete
named-repository tree (739 entries, not truncated), its README and IRR's dependency/authority references
were inspected. No G-2 portfolio implementation path was found in that tree; this is a scoped source
finding, not a claim that a deployed database does not exist. No operator database was opened.
Read-only inspection of the *cited* third repository verifies the existing architecture; it does not
silently substitute it for the user-named IPD or authorize porting code to the Python IPO engine.

**Blocking implementation decision D01:** confirm the authoritative portfolio-owning IPD repository.
Recommendation: retain the existing G-2 portfolio owner/lineage in `iips-production-market-data` and
record explicitly that the named IPO-screening repository is a separate consumer/domain. If PA instead
intends relocation to `ipo-screening-engine`, a new ownership/migration/interface decision is required;
this investigation neither designs a duplicate store there nor transfers IPD ownership to IRR.

All changes in this task are IRR-owned findings, proposal and additive status records. **No IPD PR or
mutation** is appropriate before resolving this identity conflict. The user-named IPD was investigated,
not ignored. Future implementation must use repository-owned IPD PRs after designation; IRR cannot
supply IPD runtime authority by writing its own report.

## 2. Authority reconciliation (existing decisions, not re-decided)

| Authority/source in IRR unless noted | Verified interpretation |
|---|---|
| `IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` §§1–9 | IPD owns domain and durable persistence; extend existing PortfolioStore, preserve broker semantics, PIT/reference portfolio separation, non-production first. Original decision leaves storage unspecified. |
| `IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md` §§1–5 | Subsequent 2026-10-07 authority established verified G24 SQLite reuse (historical better-sqlite3 HTTP lineage); not a new database choice today. |
| `IIPS_v3.0_G2_IRR_DP1_IDENTITY_CREDENTIAL_TRUST_AMENDMENT_2026-10-16.md`; G3 and Direct P1 records | Later local-principal OS IPC path supersedes historical bearer/HTTP mechanism for this path. No login/enterprise identity expansion. |
| U1 AMEND-01 evidence-retrieval PA decision act §§11(3),14–15 | A-8 proposal became effective A-9 retrieval under the exact evidence owner. It explicitly does **not** extend `owner-4dc756b3` to durable holdings. |
| U1 AMEND-02 live-retention act + effectiveness/publication receipts | Evidence-only append/readback authority is effective; not holdings write authority. Existing retention/deletion work is referenced, not repeated. |
| IPD cross-repository `IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md` W-1…W-16 | Accepted Gate 2 policy; W-1 independently requires exact implementation authority, accepted host qualification, and named-commit admission. Source guard says W-1(3)/(4) unmet. |
| `WS-A-DURABLE-USER-HOLDINGS-MILESTONE-DEFINITION-2026-11-05.md`; `WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md` | Retention success/fixture persistence does not complete WS-A-DM. Gate-4 pin/H-12, host qualification, result acceptance and admission remain distinct decisions; no gate advancement is inferred here. |

Current source is newer than the historical G24 implementation record: `src/persistence/connection.ts`
uses **`node:sqlite` DatabaseSync**, Node >=22.13.0, one file-backed process connection, foreign keys ON,
DELETE rollback-journal mode, synchronous FULL. Reuse this already-established current lineage; do not
replace it with a new SQLite driver, PostgreSQL, a hosted service, PF-1, PIT or a browser store.
Source inspection is not a fresh qualification result or proof of user-host provisioning.

## 3. Current architecture and consequential gaps

| Area | Existing source/contract | Remaining issue |
|---|---|---|
| Owner binding | IPD single ACTIVE local binding + single ACTIVE membership; resolved afresh, revalidated in broker transaction | Current provisioning constants are `ipd-owner-ramki-personal` / `ipd-personal-local`, not requested canonical owner; explicit governed extension/migration needed |
| Stable portfolio | SQLite portfolio ID, owner/tenant columns, immutable revision rows, owner-filtered reads/tombstones | No observed live SAIRAM portfolio creation/readback; do not infer one from P1 provisioning or an evidence portfolio slot |
| Atomicity | `BEGIN IMMEDIATE`, COMMIT/ROLLBACK, nested work shares outer transaction; uncertain commit reported explicitly | Host qualification still required; no power-loss claim from PRAGMA/source alone |
| Concurrency | expectedRevision, serialized transaction, binding revalidation before broker mutation | Keep one local writer; busy/lock contention and stale-browser behavior must be qualified, not add distributed concurrency |
| Idempotency | Committed contribution digest for MERGE, last-revision content checks; correlation requestId is not a key | `create` is not request-idempotent; outcome-unknown can create another portfolio if blindly retried; REPLACE/RESET start a new contribution set |
| Lifecycle | `MAX_REVISIONS = 4`, DELETE exception; tombstones and retained history | Four-revision cap is unsuitable for ongoing personal use; explicit lifecycle amendment + authorized implementation required, never silently raise cap |
| Holdings | IPD canonical identity resolution, rows/lineage, broker contribution provenance migration 004 | Unresolved/ambiguous rows refuse whole request under 2F; no symbol guessing or partial-save shortcut |
| Transactions | Atomic *database transactions* and immutable snapshot/contribution revisions exist | No trade/cash/lot accounting transaction ledger evidenced in migrations 001/004; holdings snapshots cannot establish buys/sells, realized P&L, tax lots or cash balances |
| IRR reads | Same-host IPC list/detail/revisions; identity absent from wire; reference portfolio separate | General port `saveHoldings` cannot construct its historical success envelope from v1's minimal receipt; non-empty contribution projection remains unadmitted in read adapter |
| Broker write path | Dedicated broker save/revision adapter with guarded IPD persistence; W-1 refusal retained | Identity/gates/contract response/readback must all be qualified before enablement; guard change alone would be insufficient |
| Backups | SQLite file and migration/audit primitives are source foundations | No verified operational backup/restore for this owner; don't copy a live database file and claim consistent recovery |

Source locators and exact blob/SHA-256 pins are in
`evidence/integration/sairam-holdings-readiness-2026-11-06/cited-portfolio-source-manifest.json`.
The four-revision limit, create limitation and adapter gaps are real readiness dependencies, not reasons
to rebuild the domain. Historical Gate E text saying SESSION_ONLY cannot override current source's
DURABLE internal port vocabulary; conversely that internal label does not authorize a real-user
successful-write claim or admission.

## 4. Recommended smallest safe personal architecture

One local, non-production IPD service; one designated existing SQLite portfolio database; one trusted
local principal binding/membership; one canonical owner `owner-4dc756b3`; stable personal portfolio ID
with multiple broker contributions if needed. No multi-user directory, SaaS tenancy, OIDC redesign,
service credential, distributed database or IRR shadow store. Keep the required technical tenant key
but do not equate `ipd-personal-local` with evidence tenant `irr-personal-073dd1c8`.

IPD owns identity resolution, durable authorization, transactions, revisions, contribution lineage,
migrations and backup integrity. IRR presents holdings/evidence as different states, collects broker
observations locally, consumes the minimal admitted IPC contract and reconciles outcomes through reads.
No browser raw-CSV upload or client storage expansion. Certified `/api/portfolio` and its reference
workspace remain separate and unchanged.

### Trusted identity and authorization flow

1. Operator provisions/verifies the governed local IPC endpoint and database outside requests.
   Existing binding precondition in IRR is only readiness metadata, never proof or authorization.
2. IRR sends the admitted operation, portfolio ID and domain payload only. It never sends an owner,
   tenant, principal, scope, companyId or identityStatus as authority. Reject forbidden nested keys,
   don't silently strip them. First-party browser signals are hardening, not authentication.
3. IPD authenticates access using the established OS endpoint security, resolves its actual ACTIVE
   binding/membership, and authorizes ownership server-side. Before mutation it rereads that binding
   inside the same serialized transaction: revocation committed first must win.
4. W-1 must be independently satisfied. The IRR evidence-owner carrier cannot replace an IPD binding
   and cannot authorize writes. Display label SAIRAM and knowledge of endpoint/portfolio ID authorize
   nothing. Missing/ambiguous/revoked binding fails closed, with existence-hiding for foreign portfolios.
5. Canonical-owner extension is a **proposal**, not an equivalence assertion: future designated IPD
   canonical_owner_id should be `owner-4dc756b3`. Preserve current data until explicit offline migration
   or governed cross-domain mapping is approved. Never rewrite old ownership at request time or
   transfer revoked-owner data automatically. Do not make the evidence carrier a portable credential.

## 5. API and transaction contracts required before implementation/admission

Existing v1 operations are `portfolio.list`, `.get`, `.revisions`, `.create`, `.save`, `.reset`, `.delete`.
Retain one request/one portfolio/at most one immutable revision. Existing reads carry opaque portfolioId;
create has no expectedRevision; save/reset/delete require it. Keep existing field names/statuses and
narrow broker DTO until a separately versioned amendment is accepted. No new endpoint is implemented.

| Contract point | Requirement / decision boundary |
|---|---|
| Create | Authorized owner derived in IPD; stable ID, INITIAL revision 1; no automatic default creation on read/error. Initially one deliberate creation, with list/revision reconciliation after unknown outcome. No exactly-once claim; request-level create idempotency needs a separately versioned amendment. |
| Save | Original broker content digest plus mode and expectedRevision; IPD resolves every row against governed D05 at the approved basis. Whole request refuses on zero/ambiguous matches; preserve per-row quarantine evidence. |
| Commit | Revalidate binding, validate stale revision, check duplicate contribution, write holdings/revision/contribution/current pointer/audit together, commit, then acknowledge. Any validation/serialization/refusal/rollback leaves zero committed domain rows. |
| Duplicate | MERGE duplicate in active contribution set => ALREADY_IMPORTED_NO_OP, same revision, no new rows/audit success fiction. Test stale revision ordering as implemented; don't promise duplicate overrides a stale revision. RESET/REPLACE contribution-set semantics and re-import after reset must be disclosed. |
| Result | Dedicated v1 save receipt supplies disposition/revision/durability/durable only. Require an authorized response/readback mapping before using the richer generic IRR G2SaveResult; never fabricate timestamps/portfolio/counters. Admit non-empty contributions explicitly. |
| Unknown outcome | Lost acknowledgement/commit uncertainty remains OUTCOME_UNKNOWN, not failed or saved. No automatic resend. Read list/detail/revisions, compare approved digest/provenance facts, then explicit user action. Correlation requestId is not a deduplication key. |
| Import reconciliation | Evidence retained != holdings saved. Preserve original import timestamp/evidence digests; compare IPD committed revision/contribution against the approved import after authorized readback. No distributed transaction with IRR PF-1 and no compensating evidence deletion. |
| Reset/delete | Governed empty revision/tombstone, expectedRevision and retention policy; not evidence deletion and not physical/all-copy erasure. No reset/delete button enabled by this task. |
| Trade ledger | Deferred. If “transactions” means buys/sells/cash/lots, approve a distinct domain/schema/precision/corporate-action/reversal contract first. No trades inferred from successive holdings CSVs. |

### Transaction design and integrity

Reuse IMMEDIATE SQLite transactions, FK constraints, migration checksums, immutable revision keys and
owner predicates. Duplicate test and insert must share the write transaction, including the committed
contribution set; guard against simultaneous identical imports producing duplicate rows. Binding,
revision, holding identities, quantities/prices, source attribution and lineage must be validated before
commit. Explicit numeric precision/rounding and supported input ranges must be verified against the
existing domain; no silent REAL-to-decimal migration. Test overflow/nonfinite values and reconciliation
of quantities/cost basis/weights. On lock contention return the admitted non-success/unknown vocabulary;
never retry a write automatically, drop another writer's changes or fall back to session storage.

## 6. Migration, recovery and backup strategy (proposed, not executed)

1. Inventory only with future operator authority: exact DB path/UID or Windows ACL, runtime, schema
   ledger 001–004, active binding/membership, portfolio IDs/revisions/tombstones, audit chain and hashes.
   This investigation inspects source, not an operator's database or personal holdings.
2. Resolve D01/D02 before changing identities. If no existing holdings, a governed empty target binding
   can be provisioned after authorization. If data exists, retain original, require explicit offline
   mapping/ownership recovery decision with old/new IDs and collision checks; revoked data follows W-16.
3. Stop IRR/IPD writers, preserve verified consistent backup plus manifest of database/schema/audit/
   binding/version/pins. Prefer quiesced backup; use SQLite-supported consistent backup if separately
   adopted. Do not snapshot a live DB without journal-consistency proof. Restrict access; no production
   backup policy is selected. Retain originals and test restore only in isolated non-production copies.
4. Apply new migrations only if a separately authorized change needs them: append migration ledger,
   verify checksums/integrity and rollback strategy. No direct edits to prior migrations. On failure,
   do not run a downgraded binary over changed schema; stop and restore verified pre-change copy only
   when no newer accepted history would be overwritten. Never replay imports as “restoration.”
5. Prove restart, restore, owner isolation, revision/contribution identity and revocation behavior.
   Define RPO/RTO and backup frequency/retention before use; recommendations are not adopted policies.
   Keep restored evidence/holdings distinctions and disclose resurrection of older snapshots.

## 7. Responsibility matrix

| Concern | Accountable owner | IRR responsibility |
|---|---|---|
| Portfolio domain, SQLite/migrations, holding integrity, durable commit | Designated IPD portfolio repository | Minimal contract consumer only |
| Local binding/membership, canonical owner migration, revocation | IPD + governed local operator; PA scope approval | No identity assertions, no mapping database |
| Broker parsing/security-master identity/2F | Existing IPD pipeline | Local preview, source observations, honest refusal UI |
| Evidence journal/retrieval/retention | Existing separate IRR authority | Preserve without confusing it with holdings |
| IPC security and endpoint qualification | IPD/operator; IRR client boundary tests | First-party hardening and zero owner fields on wire |
| UI create/import/read/reconcile | IRR under later bounded authority | Distinct parsed/retained/not-saved/unknown/verified-committed states |
| Consistent database backup/recovery | IPD/operator | Stop requests, no auto replay or shadow restoration |
| Repository designation, owner extension, lifecycle, pin and admission | PA | Present exact choices/evidence, render no decision |

## 8. Targeted acceptance plan — NOT EXECUTED in this investigation

| ID | Required proof before admitting real writes |
|---|---|
| H01 | Correct repository/pin/runtime/schema and protected foundations verified; no source/data alias |
| H02 | `owner-4dc756b3` target binding approved; absent/foreign/multiple/revoked binding and injected owner/tenant denied before access |
| H03 | Authorized create -> stop both IRR/IPD -> restart -> exact owner-scoped stable ID and revision/holdings/contributions readback (QE-4) |
| H04 | Forged companyId/identityStatus, unresolved/ambiguous rows and partial imports refuse whole request with zero row/revision deltas (QE-2/9) |
| H05 | Concurrent stale revision conflicts; duplicate imports serialize to one commit/no-op; identity/revocation rechecked inside transaction (QE-8) |
| H06 | Fail/kill at holding/revision/contribution/audit/commit/ack boundaries: complete revision or none; unknown outcomes never false success; tampered ledger fails startup (QE-7) |
| H07 | Original/equivalent/earlier/REPLACE/RESET import duplicates and lineage match existing semantics; no fabricated success on generic adapter gaps (QE-6/10) |
| H08 | Approved revision-cap successor supports repeated personal use; prior history/tombstones retained; no compaction/purge implicit |
| H09 | Verify consistent backup, isolated restore, bad checksum/schema refusal, collision/new-history refusal, revoked-owner denial after restart |
| H10 | IRR browser workflows + non-empty contribution/receipt projections; saved only after actual committed readback; no auto retry/default/session fallback |
| H11 | Existing Gate E QE-1…11, DQ/read/refusal and host security evidence remain required under exact adopted qualification scope; fixture PASS is not result acceptance |
| H12 | No PIT/reference scoring, PF-1/evidence, W-1 or unrelated-domain mutation; trade ledger explicitly absent unless separately authorized |

## 9. Dependencies and execution order

D01 repository designation -> D02 owner-extension/migration and exact identity context -> D03 lifecycle/
contract gap dispositions -> exact IPD-owned bounded implementation scope + IRR consumption amendment
(as required, not a blanket new Gate 3) -> pin/runtime/schema/H-12 reconciliation under existing Gate 4
rules -> authorized isolated implementation and tests -> designated deployment-host QE -> separate
result acceptance -> exact-commit Gate 5/U6 operation-specific admission -> explicit real-user create/
import/readback. Existing authority may cover unchanged components; do not re-request completed acts
or pretend it covers newly identified owner/lifecycle/contract changes. No step is executed by this report.

The separate decision paper gives exact proposed wording. **W-1 unchanged; durable personal holdings
NOT enabled; WS-A-DM NOT declared complete.** Publication of this investigation closes decision
preparation only, not the repository designation conflict or any implementation/admission gate.
