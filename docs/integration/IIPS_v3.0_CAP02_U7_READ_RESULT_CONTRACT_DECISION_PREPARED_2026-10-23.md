# IIPS v3.0 — CAP-02 U7 Read/Result Contract Decision (Prepared)

> ## STATUS: **PREPARED — NOT EFFECTIVE; U7 BLOCKS CUSTOM-PORT MODAL COMPOSITION**
> This record resolves the current-source evidence and proposes the narrowest honest disposition for the
> actually exported `BrokerImportModal`. It does not amend accepted consumer contract v1, the frozen G2
> wire/result contract, or any IPD component. No adapter may claim U7 is resolved until the required IPD UI/port
> act and IRR transport/composition acts are effective and implemented. U7 is separate from U1 and from U2,
> Gate 4, Gate 4 result acceptance, Gate 5 and operational-write authority.

| Field | Prepared value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-2026-10-23-01` |
| **Decision status** | **PREPARED / NOT EFFECTIVE** |
| **Initial assessment baseline** | IRR `f53056214d45c850928fbabd51dc6a2adcb64f2b`; IPD `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` |
| **Current IPD baseline** | `main@554ed6ceaa7422c95806fd1b6e095a24a8554be2`, tree `2d9dc14d8f9ab52a4507648e5323ce803dc6d512`; Increment A landed independently during this assessment |
| **Authority to prepare** | Standing PA grant + current CAP-02 directive §5; DEC-06 R-1/R-3/R-6/R-7 |
| **Authority to change a contract or component** | **Not granted by this record.** Accepted v1 and the UI are IPD-owned; exact IPD/PA acts and current manifests are required |
| **Rule** | Direct mappings only where semantics are proven; never derive historical, saved, analytics, identity or durable values by convenience |

---

## 1. Current source and exported surface

The field comparison uses these IPD source blobs, unchanged by Increment A:

| IPD source | Blob | Relevant content |
|---|---|---|
| `frontend/src/features/portfolio/portfolioStorePort.ts` | `d61f18dfdce12a7f0c4377a3c6d410026d454089` | UI port, save request/success/refusal, durability and revision methods |
| `frontend/src/features/portfolio/BrokerImportModal.tsx` | `f2ed480fdff2df795d0eed4cf03d7a1ce9db0ec2` | Exported modal, required full `onSaveSuccess` result, literal `DEFAULT_PORTFOLIO` save |
| `frontend/src/features/portfolio/import/ui-broker-import-view-model.ts` | `9066a9d45d3b76b8f7152db84d7ea130301bf78a` | Save outcome construction, refusal placeholders and success fallback behavior |
| `frontend/src/features/portfolio/portfolio-store.ts` | `b900a2481b73ed7bd00406b18a39c8f493b4c0cc` | UI `PortfolioRecord`, contribution and full save-result shapes |
| `frontend/src/features/portfolio/PortfolioWorkspace.tsx` | `068eed361934ad35ebf5275015cba6d89865db14` | Separate IPD application composition; **not exported** and not the selected mount |
| `src/persistence/portfolio_store.ts` | `c48479dbcd7244b5dc5086d70a18534780409164` | Actual v1 list/detail/revision projections and SQL columns |
| Accepted v1 contract | `163eb1f18ce023bb9a06917de99ca279fdb86bf7` | Normative result shapes, reserved analytics, change classes and refusal rules |

Current IPD `src/ui/portfolio_ui_package.ts` blob `03ffdd4655d26dc8f9f6030d36b0f30924a89836` exports
`BrokerImportModal` and deliberately excludes `PortfolioWorkspace`, application shell, IPC and persistence.
An external consumer at `554ed6ce…` resolved 22 runtime exports and confirmed `SESSION_ONLY`/`durable:false`.
Therefore the U7 decision must fit the **modal**, not assume the workspace's `getPortfolio` + `getAnalytics` +
`getRevision` workflow is part of CAP-02.

The seven-field/three-rename matrix itself is defined by **IRR's frozen G2 consumer types**, not by IPD UI
`PortfolioSummary`/`RevisionEntry` interfaces (which do not exist). Its governing IRR sources are
`frontend/server/user-portfolio/userPortfolioContract.ts` (blob `e6b57bb8…`: `G2PortfolioSummary`,
`G2PortfolioView`, `G2RevisionEntry`, `G2SaveResult`) and
`frontend/server/user-portfolio/ipcPortAdapter.ts` (blob `7881185e…`: `V1_TO_G2_ENVELOPE_GAP`). IPD UI
`PortfolioRecord` independently shares the detail view's `isSaved` and `totalHoldingsCount` requirements.

## 2. Exact seven-field and three-rename disposition

### 2.1 Seven missing fields

| # | Consumer type / field | Current v1 evidence | Honest CAP-02 disposition |
|---|---|---|---|
| 1 | IRR `G2PortfolioSummary.weightSumPercentage` | Absent from v1 list; present in current `portfolio.get` | Direct only from a validated same-revision detail read. The first modal surface consumes no G2 list, so do not expand list for an unused shape |
| 2 | IRR `G2PortfolioSummary.provenanceDigest` | Absent from v1 list; present in current `portfolio.get` | Same as #1; never combine different revisions |
| 3 | IRR `G2PortfolioSummary.isSaved` | Absent; no authoritative list equivalent | Not derivable. Keep G2 list refused/out of CAP-02 unless a separate accepted read-field act is later rendered |
| 4 | IRR `G2PortfolioView.isSaved`; IPD UI `PortfolioRecord.isSaved` | Absent from current v1 detail; revision/holdings/durability are not equivalent | **Blocks the current full-record save/refusal shapes.** The recommended modal amendment removes the need for a full record in its CAP-02 commit/refusal outcomes. If a full record is retained instead, an authoritative IPD read field/UI semantics act is mandatory; IRR must not infer it |
| 5 | IRR `G2RevisionEntry.totalMarketValue` | Historical column exists in IPD `portfolio_revisions`, but v1 revisions do not return it | Cannot be reconstructed from current detail. Keep G2 history out of CAP-02 or use an accepted additive read/IPD query act |
| 6 | IRR `G2RevisionEntry.provenanceDigest` | Historical `provenance_digest` exists but is not selected/returned | Same as #5; current portfolio provenance is not historical provenance |
| 7 | IRR `G2RevisionEntry.holdingsCount` | Historical `holdings_count` exists but is not selected/returned | Same as #5; no current-count substitution or IRR arithmetic |

Fields #5–#7 need no new persistence schema merely to expose existing columns, but they do need an IPD-owned
read/result change if consumed. Avoiding revision history in CAP-02 does not mark those G2 fields globally
resolved. Likewise, removing the modal's full-record requirement disposes of #4 **for this surface only**; it
does not add `isSaved` to v1 or make the frozen G2 view representable.

### 2.2 Three direct renames

These mappings are safe after the enclosing response is validated and its revision identity checked:

| IPD v1 source field | Consumer target field | Rule |
|---|---|---|
| v1 `PortfolioSummary.holdingsCount` | IRR `G2PortfolioSummary.totalHoldingsCount` | Direct numeric rename; no recomputation |
| v1 `PortfolioDetail.holdingsCount` | IRR `G2PortfolioView.totalHoldingsCount`; same target name in IPD UI `PortfolioRecord` | Direct numeric rename; no recomputation |
| v1 `RevisionEntry.committedAt` | IRR `G2RevisionEntry.createdAt` | Direct timestamp rename for the same revision commit instant; no current-time substitution |

The renames do not make an otherwise incomplete object representable. They are prepared adapter rules, not an
effective change to the frozen G2 adapter.

## 3. Minimal read model for the exported modal

### 3.1 Workspace analytics are out of scope, not fabricated

`portfolio.analytics` remains reserved and IRR must not dispatch it. The unexported IPD workspace requires
`getAnalytics` and a rich `PortfolioAnalyticsSummary`; the exported modal does not. Consequently:

- do not mount or deep-import `PortfolioWorkspace`;
- do not add analytics to the first CAP-02 surface;
- do not return zero/empty analytics or reuse a provenance digest as `lineageHash`;
- do not require an IPD workspace analytics amendment for this minimal modal increment.

If a future requirement adds the workspace or durable-portfolio analytics, that is a separate IPD composition
and G2 §7 contract decision. Certified reference analytics remain excluded by U0.

### 3.2 Only an authoritative revision token is needed before save

The modal accepts `expectedRevision?`, but CAP-02 must make it operationally mandatory. The prepared read model
is a revision-only host projection:

```text
authorized v1 read → select exact DEFAULT_PORTFOLIO → { portfolioId, revision }
```

A narrow implementation can use `portfolio.list`, whose v1 summary already carries `revision`, select the exact
ID and return no other portfolio fields. If the ID is absent, the surface is unavailable; IRR must not create a
portfolio or invent revision zero. The read is immediate, not a cached record. A concurrent change after the
read is handled by `expectedRevision`/`REVISION_CONFLICT`, not by silently replacing the token.

The exact HTTP GET route is **not admitted by this U7 record**. It must be added to the effective U1/composition
manifest or receive its own narrow route act. Until then there is no preview/revision endpoint.

### 3.3 Full detail and contribution projections stay out of the minimal surface

Accepted v1 detail declares `durability`/`durable`, but current IPD `DurablePortfolioStore.get()` omits them.
That remains an IPD implementation gap for any full-detail consumer; IRR must not fill it. The minimal
revision-token projection does not claim to cure or consume the full detail shape.

UI `BrokerContributionRecord`/IRR `G2Contribution` expects `sourceBroker`, `fileName`, `contentDigest`,
`lineageDigest`, `importedAt`, `holdingsCount`, `totalMarketValue`; v1 `PortfolioContribution` returns
`contributionId`, `amount`, `contributedAt`, `createdAt`. These are not shape-compatible. CAP-02 must not present
one as the other or claim complete contribution history. U2/C-1 owns the durable ledger/provenance decision.

## 4. Save-result gap and why a partial cast is unsafe

Accepted v1 success is intentionally small:

```text
disposition: SAVED_NEW_BATCH | MERGED | ALREADY_IMPORTED_NO_OP
revision: number
durability: DURABLE | SESSION_ONLY
durable: boolean
```

The current modal's `onSaveSuccess` and `PortfolioPortSaveSuccess.result` require full `PortfolioSaveResult`:
`PortfolioRecord`, `holdingsSavedCount`, `totalMarketValue`, `weightSumPercentage`, `provenanceDigest`,
`savedAt`, `success`, duplicate/disposition values and related display fields.

| UI success field | v1/read-back source | Disposition |
|---|---|---|
| `disposition` | Direct in a minimal v1 receipt; legacy UI/G2 spells v1 `MERGED` as `MERGED_INTO_EXISTING` | Safe in minimal receipt. Legacy mapping requires an explicit semantic rename |
| `revision` | Direct v1 success | Safe |
| `durability`, `durable` | Direct v1 success | Safe only as authoritative post-commit receipt; never set by IRR |
| `isDuplicate` | Derivable from `ALREADY_IMPORTED_NO_OP` | Safe explicit mapping, not an independent persistence claim |
| `success` | Boolean corresponding to received success member | Safe only inside that member |
| `portfolio` | Needs full detail, authoritative `isSaved`, revision match and contribution semantics | Not currently representable; remove from minimal CAP-02 receipt rather than fabricate |
| `holdingsSavedCount` | Session UI derives it from final/current holdings; v1 receipt has no normative field | Do not assume read-back semantics; remove from minimal receipt or define by IPD act |
| `totalMarketValue`, `weightSumPercentage`, `provenanceDigest` | Current detail can carry them | A later read is not part of the atomic save receipt; use only in separately labeled refreshed data |
| `savedAt` | Current detail `lastUpdated` is not a v1 save-receipt timestamp | Do not relabel without a contract decision |

The current modal also uses preview fallbacks in its success panel: accepted count, current totals/normalized
weight, portfolio name and lineage digest can stand in when save-result fields are absent. Passing a partial
`PortfolioSaveResult` through a cast could therefore display **preview data as though it were committed data**.
The current `onSaveSuccess(result: PortfolioSaveResult)` prop likewise cannot receive a minimal receipt without
an IPD UI change.

Durability has a separate concrete mismatch: `confirmAndSaveViaPort` assigns `this.durability` from the static
`storePort.durability`, and `buildViewModel` sets `durable` from that field; it does not derive the displayed flag
from `outcome.durable`. Merely relaying a truthful v1 outcome is therefore insufficient. The IPD UI act must make
the result view receipt-driven and must not derive a committed-operation claim from a static store capability.

### Prepared recommendation: a distinct minimal commit receipt

Do not reconstruct a full legacy result through save-plus-read and present it as atomic. Under a separate IPD
UI/port act:

1. Add a CAP-02-compatible commit-receipt outcome containing only authoritative v1 disposition, revision,
   durability and `durable` (plus an explicitly derived duplicate flag if desired).
2. Change the modal's CAP-02 success callback/panel to consume that receipt and show only those values. No
   preview fallback, full record, totals, count or timestamp is allowed in this receipt panel.
3. Treat any later revision read as a separate refresh with its own state. An authoritative commit followed by a
   failed refresh is **commit receipt received; refreshed revision unavailable**, not failed save or unknown.
4. Keep the legacy full G2/session result for its existing consumers; do not widen the frozen IRR G2 adapter.

Expanding the v1 write response to the full UI result would be a larger write-contract/policy change and is not
the narrow recommendation.

## 5. Refusal and outcome-unknown gaps

### 5.1 Refusal must not require or invent a full record

`PortfolioPortSaveRefusal` requires `portfolio: PortfolioRecord`, `durability` and `durable`. Accepted Class A
write refusals return outcome/message/storeEffect, not those values. The current view model additionally builds
refusal/failure results with zero counts/totals, empty provenance, a current `savedAt`, and—on one guard path—an
empty fallback `PortfolioRecord` with current timestamp. Those placeholders are not authoritative host outcomes.

Prepared IPD UI/port amendments:

- make the CAP-02 refusal snapshot unnecessary/optional and render no fake record when it is absent;
- remove current-time/zero/empty-provenance placeholders from the custom-port refusal outcome;
- keep `actualRevision` optional and populate it only from an authoritative conflict result;
- represent “no durable success” without deriving store durability from refusal or coercing it to `SESSION_ONLY`;
- separate store-capability declarations from per-operation commit evidence;
- never show refusal as COMMITTED or as a successful session save merely to satisfy the legacy view model.

### 5.2 Outcome-unknown needs a third state

The UI port currently has success and refusal, but no `OUTCOME_UNKNOWN` member. IRR's IPC client correctly
returns outcome-unknown on timeout/EOF and never retries. Mapping that state to ordinary `UNAVAILABLE`/`REJECTED`
loses W-9 semantics; mapping it to success is worse.

The prepared IPD UI act must add a distinct unknown member/view state that:

- says the prior operation may or may not have committed;
- makes no `durable:true`, rollback or ordinary-refusal claim;
- disables automatic retry and creates no current-time save result;
- offers only the separately authorized read/reconciliation path before a new user-initiated attempt;
- preserves diagnostics without owner, provider, socket, stack or response-body disclosure.

This cannot be implemented honestly as an IRR-only CSS/message workaround.

## 6. Additional composition constraints

| Finding | Prepared disposition |
|---|---|
| `expectedRevision?` is optional in the modal/port | CAP-02 surface stays unavailable until a valid token is loaded; adapter rejects absence before HTTP/IPC. No zero fallback |
| Port `durability`/`durable` are static declarations used by the view model | IPD UI act distinguishes store capability from per-operation commit evidence; no pre-commit durable-success presentation |
| Modal saves literal `DEFAULT_PORTFOLIO` | First mount is default-only. Arbitrary IDs require an IPD `portfolioId` prop act; no IRR parallel controller |
| Required `portfolioStore` prop exists alongside custom port | Supply the IPD-exported session fallback instance but always inject the CAP-02 port; never use fallback as an alternate write path |
| Browser preview contains canonical identity/provenance | Allowlist raw observations for transport; IPD re-resolves and recomputes authority. Preview values are never commit evidence |

## 7. Exact prepared decision package

The recommended package for PA/IPD rendering, **not a decision already in force**, is:

1. **Actual surface:** mount only exported `BrokerImportModal`; no workspace, G2 list/full view, revision history
   or analytics in CAP-02's first surface.
2. **Read:** use a revision-only authoritative v1 projection and make `expectedRevision` mandatory. The exact
   GET route remains unadmitted until included in an effective U1/composition act.
3. **v1 read fields:** **no v1 read-field expansion is recommended for this minimal modal surface.** Existing
   G2 summary/view/history gaps remain refused/out of scope. Any future full-record consumer needs its own act.
4. **Save:** preserve the minimal v1 commit receipt and amend the IPD modal/port to consume it without preview
   fallbacks or a read-after-write legacy result.
5. **Refusal/unknown:** amend the IPD port/UI for honest refusal without mandatory record/timestamp/durability
   fabrication and a distinct outcome-unknown/reconciliation state.
6. **Durability:** make persistence wording receipt-driven and separate store capability from operation commit
   evidence. Only an authoritative post-commit receipt can produce `durable:true` wording.
7. **Frozen G2 fields:** retain the seven/three matrix as the authority for any future G2 adapter decision. The
   three renames are direct; the seven fields are not globally resolved by CAP-02's narrower surface.
8. **Separate durable semantics:** C-1/U2 still owns raw resolution, complete file attribution/provenance,
   idempotency, atomic transaction and reconciliation. U7 neither authorizes nor satisfies them.

### Conditional implementation ownership

| Change | Owner after effectiveness |
|---|---|
| Minimal commit/refusal/unknown outcome types and modal presentation; no preview/refusal placeholders | IPD component/port act |
| Revision-only host projection and raw-save adapter; direct renames only where a governed G2 shape is actually used | IRR under effective U1/composition acts |
| Full-detail durability, `isSaved`, summary/history fields, if a future consumer requires them | Separate IPD read-contract/implementation act; not implied by CAP-02 |
| Complete contribution provenance and file attribution | IPD C-1/U2/schema acts |

## 8. Required verification after a future effective U7 act

- Modal type/runtime tests prove minimal receipts render only v1 values and never preview fallbacks as commits.
- Revision-only tests prove exact-ID selection, no fabricated zero/absent portfolio, no record cache and conflict on races.
- Refusal tests prove no empty record, current `savedAt`, zero metric or durability placeholder is presented as authoritative.
- Outcome-unknown tests prove zero retry, distinct wording and reconciliation-only recovery.
- Commit-received/refresh-failed tests remain distinct from save failure and outcome-unknown.
- Default-only tests prove no arbitrary portfolio ID is implied; the custom port, not session fallback, receives the save.
- Browser closure tests continue to prove no IPC/persistence/Node import.
- Restart/durable verification remains under U2/U3/U4/U5/U6 and is not established by U7 UI tests.

Until those acts and implementations exist, U7 remains a blocker and the exported modal must not be mounted
with a purportedly compatible custom IRR `PortfolioStorePort`.
