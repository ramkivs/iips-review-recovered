# SAIRAM durable holdings — exact PA decision package (proposed)

**Prepared 2026-11-06. PA DECISIONS PENDING. New Act ID UNASSIGNED. Not an adoption, write permission,
qualification result, migration/provisioning command or admission.** This package accompanies
`SAIRAM-DURABLE-HOLDINGS-ARCHITECTURE-READINESS-2026-11-06.md`; its baselines, current gaps and H01–H12
acceptance criteria are incorporated as decision inputs, not newly effective rules.

## Recommended disposition

Reuse the already-established IPD SQLite/local IPC portfolio architecture for the personal single-user
application. Keep IRR a consumer, not the durable holdings owner. Canonical target owner is
`owner-4dc756b3`; SAIRAM is display-only. Do not enable any write until all W-1 conditions are met.
Resolve repository and identity scope first. Do not introduce a trade ledger or a new database merely
to make holdings snapshots durable.

## D01 — Identify the authoritative IPD portfolio repository

**Recommended text for a separate explicit PA rendering:**

> The G-2 portfolio domain and persistence remain owned by IPD in
> `ramkivs/iips-production-market-data` (GitHub ID 1361385667), extending the existing portfolio store.
> `ramkivs/ipo-screening-engine` (ID 1405223378) is a distinct IPO-research repository and is not an
> alias, replacement portfolio owner or destination for duplicating that store. This clarification
> grants no implementation or write admission. All references in later implementation/qualification
> acts must name the actual repository and immutable commit.

Alternative: if the intended owner really is `ipo-screening-engine`, PA must explicitly designate a
new cross-repository domain migration and contract/provenance disposition. **Not recommended**: it
would require a much larger investigation and implementation scope and cannot be treated as routine
IRR integration. No IPD PR has been created in the wrong repository during decision preparation.

## D02 — Extend canonical owner identity to durable holdings, not carrier credentials

**Recommended text:**

> Extend canonical opaque owner `owner-4dc756b3` to the designated IPD durable personal holdings
> capability, non-production only, in addition to its existing evidence scope. SAIRAM remains display
> identity only. Authorization continues to originate exclusively in IPD's governed local OS/IPC
> principal binding and one ACTIVE membership; no request owner/tenant/company identity can authorize
> access. The IRR evidence carrier is not an IPD credential or proof of membership.
>
> Existing IPD owner `ipd-owner-ramki-personal` and technical tenant `ipd-personal-local` are not silently
> equated with evidence identifiers. Before any identity mutation, record whether the designated DB
> contains retained data. Approve an exact offline old/new binding and ownership migration/recovery
> manifest, preserving original bytes, audit, collision checks, tenant isolation, tombstones and W-16
> revoked-data rules; if no data exists, approve a verified empty-target provisioning path instead.
> Retain `ipd-personal-local` as the technical IPD tenant unless a separately justified migration is
> approved; evidence tenant `irr-personal-073dd1c8` is not transmitted as authority. No automatic
> reassignment or provisioning occurs at request time.

This is a holdings-scope amendment to the explicit AMEND-01 exclusion (§11(3)/§15), not a rewrite of
that frozen evidence act. A new uniquely registered adoption instrument is required if PA adopts it;
no evidence-retention/deletion Act ID may be reused.

## D03 — Approve the minimum sustainable lifecycle and contract dispositions

**Recommended text:**

> Reuse current node:sqlite/IPD migration and transaction architecture; select no new database/driver.
> Authorize preparation of an exact bounded IPD implementation amendment replacing the fixture-like
> four-revision cap with monotonically increasing immutable revisions, explicit safe-integer/overflow
> refusal and no automatic history deletion, purge or compaction. Before engineering starts, identify
> its file set, tests, lineage and schema impact; no unapproved prior-migration edits.
>
> Preserve existing MERGE/REPLACE/reset contribution-set and idempotency rules, with explicit user
> disclosure. Admit a strictly specified success/readback projection for non-empty holdings and
> contributions, closing the generic IRR adapter envelope gaps without inventing fields. Prefer the
> existing minimal broker save receipt plus authorized get/revisions verification rather than a new
> broad portfolio API. Each changed wire field requires exact version/mapping approval on both sides.
>
> Initial creation is deliberate and guarded, not automatic. Preserve v1's create outcome-unknown
> limitation and reconcile-by-list before any explicit retry; no exactly-once claim or use of requestId
> as an idempotency key. If request-idempotent create is required, adopt a separate versioned contract
> defining key scope, collision/body conflicts, retention and replay semantics before implementation.

## D04 — Confirm holdings snapshots, not an accounting transaction ledger

**Recommended text:**

> Initial scope is durable personal holdings snapshots and existing broker contribution/lineage
> history, atomically committed through database transactions. It does not authorize inferring or
> storing trade/cash/lot transactions from snapshot differences. Any buys/sells, corporate-action,
> tax-lot, cash-ledger, precision, reversal or accounting reconciliation extension requires its own
> IPD-owned domain and migration decision. Existing broker and canonical-identity semantics are reused.

This resolves ambiguity in “transaction-capable”: SQLite transactions already exist; an investment
transaction ledger is a separate absent capability, not a configuration flag.

## D05 — Exact implementation and qualification scope (not blanket permission)

**Required rendering after D01–D04 and exact change planning:**

> Name the designated IPD and IRR immutable basis commits, authorized files/migrations/contracts and
> H01–H12 tests for the newly required owner/lifecycle/projection changes. Preserve all unchanged
> G-2/G3/DP-2/2F/PIT/reference boundaries. Specify the applicable Gate 3 authority extension, if needed,
> rather than asserting all prior implementation authority is missing. Keep W-1 hard-false throughout
> implementation and fixture tests. No production activity is authorized.

Then the accountable PA/operator must settle the **existing** Gate-4 QE/H-12 pin and scope rules,
authorized host/runtime/schema/digests and raw evidence protocol before execution. Do not treat the
current source-inspection pin or a passing PR as the designated QE execution pin. Existing
`WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md` records the unresolved pin alternatives;
reuse it instead of inventing a future SHA or repeating its completed investigation.

## D06 — Qualification result acceptance and operation-specific admission (later, separate)

No prospective approval can substitute for actual H01–H12 and existing QE evidence. After the
specifically authorized host run, PA must separately accept results and then render the Gate 5/U6
admission naming the qualified IPD/IRR commits and exact operations/fences. W-1's four conjunctions
remain independently necessary. An accepted owner-extension act alone does not lift a fence.

Recommend minimal create/save/readback admission first, leaving reset/delete unavailable until their
own lifecycle and recovery criteria are accepted. A later write-guard change must itself be explicitly
authorized in the admitted scope, never inferred from fixture tests or a local “enabled” setting.

## Operator and security decisions required before use

Record exact non-production database location/runtime, OS endpoint security and trusted local account,
one-writer policy/lock contention behavior, approved identity inventory, consistent backup method,
retention, recovery ownership and measurable RPO/RTO. No defaults are invented here. Test original-byte
restore without overwriting newer history and explicit revoked-binding recovery; do not weaken W-16.
Only IPD/operator governs DB recovery. IRR has no backup, identity registry or shadow portfolio DB.

## Readiness and publication rule

Architecture assessment and decision preparation can be published now as IRR-owned docs. Repository
conflict, holdings owner extension, lifecycle/projection gaps and accepted host qualification/admission
remain outstanding. **None of D01–D06 is rendered by publication of this proposal.** No new Act ID is
assigned, no implementation begins, no DB is opened/migrated/provisioned, no W-1 flag changes, and no
personal holdings save or restore is attempted. All actual later implementation changes must travel
through the correctly designated repository-owned PRs and exact authority/qualification sequence.

## Candidate implementation change envelope for D05 (not authorization)

After D01 designates the portfolio repository, the smallest source-review envelope is:

| Owner | Candidate files/contracts | Bounded purpose |
|---|---|---|
| IPD | `src/persistence/gateAPrimeValidation.ts`, `directP1Provisioning.ts`, `binding.ts` | Approved owner extension and offline inventory/migration validation; no default/request identity provisioning |
| IPD | `src/persistence/portfolio_store.ts`, `durablePortfolioStorePort.ts`, `brokerImportPersistence.ts` | Approved revision-cap successor, atomic invariants/duplicate and unknown-outcome handling; keep W-1 false until separately admitted |
| IPD | `src/ipc/protocol.ts`, `dispatch.ts`, `brokerImportConsumer.ts` only where a rendered contract change requires | Exact response/operation agreement, no caller-authority or wider listener admission |
| IPD | New append-only migration only if the approved inventory-backed owner/lifecycle change needs schema work | Never alter migrations 001–004 or automatically rewrite retained ownership |
| IPD tests | Existing `tests/g3_write_gate.test.ts`, `g3_binding_resolution.test.ts`, `g3_portfolio_read_isolation.test.ts` and broker persistence/transaction suites, plus targeted H01–H12 fixtures | Refusals remain zero-effect, revoked ownership isolation, lifecycle/atomicity/recovery proofs |
| IRR | `frontend/server/user-portfolio/ipcPortAdapter.ts`, `userPortfolioContract.ts`/port only under explicit response amendment; dedicated broker save/revision adapter as applicable | Close actual success/non-empty readback gaps without fabricating fields; no local DB |
| IRR | `frontend/server/user-portfolio-transport.ts`, broker HTTP/UI consumption only under exact future operation admission | Honest UI/reconcile behavior; existing fences remain until Gate 5 names the approved commits |

This is a candidate envelope, not a claim every file must change or that a migration is necessary.
Only after operator-authorized inventory can an act safely name existing-data rekey SQL, exact files
and qualification pins. Do not obtain an exact-looking plan by inventing database contents or a future
SHA. The data-dependent inventory itself needs bounded operator authorization and is not executed here.
