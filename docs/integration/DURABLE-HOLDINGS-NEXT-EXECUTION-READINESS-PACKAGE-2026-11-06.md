# Durable holdings — next consolidated execution-readiness package

**Work item:** WS-A-DH-EXEC-READINESS-02-2026-11-06.
**Deliverable status:** documentary readiness package PREPARED; engineering/host/operations NOT AUTHORIZED by this package.
**Authority basis:** [three-decision PA adoption act](IIPS_v3.0_PA_G4_C3_D01_D04_ADOPTION_ACT_2026-11-06.md), G4-2, D01 and D04, with governing publication/readback effectiveness under act §5.
**Permitted advance now:** reconcile dependencies and prepare bounded contracts, tests and authorization requests.
**Not permission to implement:** D05 implementation and A-6 D05 expansion remain separate explicit-authority requirements.

## 1. Settled premises — do not reopen them

- G4-2 is ADOPTED: C-3 deferral. No content or QE execution pin; QE 0/11, Gate C/U4 NOT RENDERED. Remaining G4-1/G4-3/G4-4 stay unresolved.
- D01 is ADOPTED: `ramkivs/iips-production-market-data` owns the canonical IIPS G-2 portfolio domain/persistence; IRR is the consumer. `ipo-screening-engine` is outside IIPS architecture and dependency tracking, not an alternative or qualification source. Old comparisons remain historical only. No transfer or repository mutation.
- D04 is ADOPTED: snapshots and contribution lineage only; trade, cash and tax-lot accounting excluded. Reuse established IPD SQLite/local trusted IPC, not a new DB/driver or inferred accounting ledger.
- Reuse the prior [architecture/source assessment](SAIRAM-DURABLE-HOLDINGS-ARCHITECTURE-READINESS-2026-11-06.md) and [detailed D01–D06 proposals](SAIRAM-DURABLE-HOLDINGS-PA-DECISION-PACKAGE-2026-11-06.md). Historical pending labels for the three adopted questions are superseded by the new act, not rewritten.
- This package neither changes the prescribed qualification sequence nor turns planning dependencies into new PA gates.

## 2. Dependency reassessment and advancement boundary

| Entry | What D01/D04 now discharge | Can advance now | Still required before substantive execution/adoption |
|---|---|---|---|
| D02 | Canonical repository unambiguous | Prepare precise holdings-owner extension/mapping questions using existing source evidence | Separate PA holdings-domain extension; authorized inventory if needed; exact trusted binding, collisions, revoked-data and provisioning/data disposition. No DB inspection here |
| D03 | Repository and snapshot/contribution scope settled | Write exact lifecycle/revision, retry/unknown-outcome, actual success/readback contract and acceptance vectors | Owner boundary D02; versioned bounded semantic amendment and PA disposition; D05 exact engineering authority for changes. D03 remains CONDITIONAL, not adopted |
| D05 | Correct IPD ownership and no-ledger scope settled | Prepare narrow file/schema/test/runtime/backup/host envelope using prior source loci | D02/D03 applicable dispositions, data-dependent scope, exact new implementation authorization. Existing G-2/G3 authority retained only where unchanged; no blanket grant |
| D06 | Candidate admission bounded to snapshot operations in the canonical repository | Prepare operation-specific result/admission checklist with exact evidence slots | Completed authorized qualification, accepted host results, all applicable Gate C/U4/DQ obligations and separate effective named-operation Gate 5/U6 admission. No guard change |
| A-6 | Canonical IPD deposition locus settled | Preserve provenance/corroboration and exact-act request checklist | Genuine A-5 input, actual residual assessment, corroboration and separate expansion authority; no corpus changes |
| G4-1/3/4 | G4-2 settled as C-3, D01 settles locus | Preserve exact content/alias/lineage questions and historical census | No C-1 acceptance or automatic pin selection. C-3 keeps new designation deferred; other dispositions remain independent |

D01/D04 do not discharge D02, semantic approval, qualification, result acceptance or admission. A checklist being complete is not an automatic adoption. No unresolved decision becomes adopted by dependency propagation.

## 3. Bounded readiness lanes

| Lane | Existing evidence / gap | Required exact next artifact | Accountable owner / authority |
|---|---|---|---|
| Owner and trusted local identity | Evidence target `owner-4dc756b3` / `irr-personal-073dd1c8`; evidence AMEND-01 excludes holdings; current IPD provisioning constants differ | Separate additive D02 question/instrument with old/new binding and data/collision/revocation disposition if needed; no caller owner, default identity or label-as-credential | PA for extension; IPD owner/operator for separately authorized inventory/execution |
| Lifecycle/revisions | Four-revision cap; immutable history and transactional contribution sets already exist | Bounded monotonic revision/overflow-refusal contract; preserve all history, contribution MERGE/REPLACE/reset semantics and no purge/compaction. Exact schema/migration impact required before engineering | IPD contract owner prepares; PA D03 semantics / D05 implementation |
| Create retry / unknown outcome | Create is not request-idempotent; requestId is not an idempotency key | No automatic retry; reconcile by authorized list/readback before deliberate retry. Enumerate success, refusal, acknowledged/unknown commit and duplicate cases. Request-idempotent create, if desired, requires separate versioned key/conflict/retention/replay design | IPD/IRR contract owners; no exactly-once promise |
| Receipt and non-empty projections | IRR generic-success and holdings/contribution projection gaps | Actual minimal v1 save receipt plus authorized readback schema, exact field/version mapping, null/missing/error cases and non-empty vectors. Saved state only after committed readback; no invented fields or fabricated success | IRR consumer and IPD contract owners; exact changed-wire approval |
| Backup / recovery / migration | Source transactions and integrity controls are not host backup or restore results | Runtime/schema/file ownership, consistent backup cut, copy checksum, isolated restore and collision/new-history/revoked-owner refusal plan. Enumerate exact migration/data scope only after separately authorized inventory | Designated operator/IPD; D05 exact authority and later host evidence |
| Qualification and admission | W-1 hard-false, Gate 4 results unaccepted | Preserve existing QE-1…11 plus H01–H12 below; exact governed source/materialized inventory, test scope, host results, separate result acceptance and operation admission | PA decides; operator executes only expressly authorized steps |

Candidate source loci are already enumerated in the earlier readiness source manifest: IPD `src/persistence/{connection,portfolio_store,brokerImportPersistence,binding,durablePortfolioStorePort}.ts`, local IPC dispatch/endpoint/consumer and exact existing migrations; IRR consumer/response paths are in the prior bounded envelope. This is not an approved edit list. Do not invent a future implementation SHA, rewrite prior migrations or access an operational store to fill blanks.

## 4. Required tests and acceptance evidence — NOT EXECUTED here

Existing H01–H12 and governing QE retain their original requirements. The table organizes evidence preparation, not new test authority or a substitute qualification suite.

| Proof | Required acceptance evidence | Boundary before execution |
|---|---|---|
| H01 | Canonical repository/runtime/schema/consumed artifacts and protected controls, exact pin/tree/blob inventory | No content/QE execution pin nominated by this package |
| H02 | Trusted owner binding; absent/foreign/multiple/revoked/injected owner or tenant fail closed before access and again inside mutation | D02 separate scope; no current provisioning/inventory access |
| H03 | Authorized non-empty snapshot save, restart of both processes and exact owner-scoped ID/revision/holdings/contribution readback | Future authorized fixture/host procedure only; no save here |
| H04 | Forged identity, unresolved/ambiguous rows and partial imports refuse whole request with zero row/revision delta | Synthetic fixtures in later exact authorized test scope; no real input fabrication |
| H05 | Stale-revision race, concurrent duplicate serialization/no-op; identity and revocation rechecked in transaction | Exact admitted implementation/test envelope; no generic concurrency guarantee |
| H06 | Failure at holding/revision/contribution/audit/commit/ack boundaries; complete commit or none; unknown outcome never false success; tampered ledger refused | No kill/failure injection against operational stores |
| H07 | Original/equivalent/earlier/REPLACE/RESET duplicate and lineage semantics; no retry-induced duplicate or generic adapter success | Preserve existing semantics; reset implementation/admission never implicit |
| H08 | Authorized cap successor, monotonic revisions and explicit overflow refusal; prior history intact | D03 semantic approval and D05 exact engineering authority; no compaction/purge |
| H09 | Consistent backup, isolated restore, bad checksum/schema refusal, collision/new-history/revoked-owner refusal after restart | Backup/restore plan and exact host/operator authority first; no operational restore here |
| H10 | Non-empty actual receipt/readback/projection browser vectors, failure/no-auto-retry/default/session fallback; saved only after commit readback | Exact wire/consumer amendment; no fabricated success fields |
| H11 | Existing QE-1…11, DQ/read/refusal/native-host/security evidence, exact scope and results; acceptance separately rendered | C-3 deferral preserved, no Gate 4 execution/acceptance or waiver inferred |
| H12 | PF-1, PIT/reference scoring, retention/clearing, W-1 and unrelated domains unchanged; no ledger/accounting | Frozen foundation and ownership tests remain strict |

Each future evidence bundle must name exact authority, repository/source/test commits, tree/blob identities, fixture class, method, expected/actual result, failure controls, host/runtime/schema where applicable and limits. Synthetic fixtures never prove genuine 68-row identity coverage or real issuer readiness. Do not rerun the product suite now for this documentary change.

## 5. Sequenced handoff — preparation is not engineering permission

1. Publish/verify the three adopted documentary decisions and current 12-entry register.
2. Prepare D02 exact holdings-owner extension and D03 exact contracts within documentary scope; identify any inventory permission needed before obtaining data. Source evidence already reviewed is reused.
3. Present the precise D05 delta and test/backup/host envelope for separate PA implementation authorization; enumerate already-covered unchanged work separately. No broad ownership/technology redesign.
4. Only after the relevant express authority, execute bounded engineering/qualification under its own work item. C-3 and all governing pin/inventory/digest/non-document-drift rules remain binding.
5. Separately present qualified results and exact operation-specific D06 admission. Candidate initial create/save/readback is merely a proposed minimum; reset/delete or accounting are not included by default.
6. Only an effective admission satisfying every W-1 condition can authorize its exact guard/fence/operation changes. This package changes none of them.

## 6. Other dependencies and closed work

A-5 needs genuine `DHAN_DETAILED_HOLDINGS_V1` with the governed 11 columns including actual ISIN and Exchange, raw digest and source-cell provenance. Existing summary evidence remains 1 resolved/67 unresolved of 68, not real full coverage. Missing cells are not tested-absent ISINs. Actual residual assessment and independent authoritative corroboration precede a separately authorized A-6 drop/checksum/count/masterRevision/integrity test; A-7 follows completed authorized A-6. No guessed identifiers, fuzzy mappings or D05 expansion.

IID-1/2/3 and concurrent IID-4/#471 remain merged at recorded scope; IID-5/6 NOT STARTED. R-16 and L-001–L-027 remain at their recorded open scopes. No IID implementation or pin change. Neither synthetic M-1 nor disposition fixtures admit holdings writes.

Retention/retrieval and offline owner-only whole-active-store clearing capability remain COMPLETE. Preserve indefinite retention until explicit reset, verified retained recovery copy, possible restore/resubmit resurrection and OS/filesystem limitations. No permanent/all-copy erasure, ACL/locking/fsync/power-loss claim, selective rewrite, expiry, purge, compaction, HTTP DELETE, raw CSV upload or auth expansion. No operational reset or deployment activation.

**WS-A / WS-A-DM NOT COMPLETE. W-1 remains hard-false. No holdings writes, operational DB access, provisioning, migration, IPD source mutation, production, Gate 4 acceptance or QE execution pin in this work item.**
