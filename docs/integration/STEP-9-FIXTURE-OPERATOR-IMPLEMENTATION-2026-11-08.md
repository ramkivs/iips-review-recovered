# Step 9 Acceptance Fixture Operator — Implementation Record

**Date:** 2026-11-08
**Decision owner:** Ramki (sole decision owner; local / single-user / personal use; production out of scope)
**Authority:** PR #523, including §5.2, plus Ramki's subsequent authorization for one IRR operator script and targeted tests
**IRR baseline:** `e7e8adde8ba198c5f24167dfa23a773c1d086c68` (`main`, merge of PR #523)
**Implementation branch:** `arena/1166c9cb-iips-review-recovered`
**IPD reference inspected read-only:** `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19`
**Script:** `frontend/server/broker-import/step9AcceptanceFixtureOperator.ts`
**Tests:** `frontend/server/broker-import/step9AcceptanceFixtureOperator.test.ts`

## 1. Status — four dimensions remain distinct

| Dimension | Status |
| :-- | :-- |
| Operator implementation | **IMPLEMENTED** in IRR only |
| Targeted isolated tests | **PASS** — synthetic IPC double plus the real IRR Route A handler |
| Runtime acceptance execution | **NOT PERFORMED / NOT AUTHORIZED by this implementation** |
| Step 9 acceptance | **NOT PASSED** |

No fixture was created, no acceptance conflict request was issued, and no portfolio was deleted during implementation. No live runtime portfolio write was issued. The historical acceptance portfolio was not reused or recreated. Publishing this record does not accept any acceptance result.

## 2. Technical investigation — exact existing read surface

The investigation inspected the pinned IPD source read-only; it did not modify, build, install into, commit to, or open a PR against IPD.

### 2.1 Binding resolution is observable; named owner identity is not

The supported probe is existing IPC v1:

```json
{"v":1,"op":"portfolio.list","payload":{},"requestId":"<correlation-id>"}
```

The exact success envelope is:

```json
{"v":1,"ok":true,"op":"portfolio.list","requestId":"<same-id>","result":[]}
```

`result` is `PortfolioSummary[]`; a non-empty array has the existing summary fields (`portfolioId`, `portfolioName`, `revision`, `holdingsCount`, `totalMarketValue`, `lastUpdated`, `weightSumPercentage`, `provenanceDigest`, `isSaved`). **An empty array is valid and is not evidence of an absent binding.**

At the pinned commit, `src/ipc/dispatch.ts:311` calls `resolveActiveBinding(db)` before dispatching `portfolio.list` at `:443`. `src/persistence/binding.ts:102–132` requires exactly one `ACTIVE` local-principal binding, exactly one `ACTIVE` membership, and membership attachment to that binding. Zero, multiple, revoked, or mismatched shapes throw before the read. The dispatcher maps those binding failures to a zero-byte Class P close (`dispatch.ts:312–321`).

Therefore a correlated, protocol-valid `portfolio.list` success establishes **that IPD resolved the unique active A-2 binding/membership for that request**. It does not disclose the binding ID, principal label, canonical owner ID, or tenant ID. IRR's client also refuses response owner/tenant disclosure. The operator accepts no expected owner identifier and transmits none; IPD remains the sole owner resolver. This corrects the earlier shorthand "binding not observable read-only": **resolution/uniqueness is observable indirectly; named identity is deliberately not observable.** If a future acceptance requirement demands a named-owner match, the current surface cannot satisfy it and execution must remain blocked pending an IPD-owned read observation. No endpoint, operation, schema, or owner identifier was invented here.

Class P is intentionally indistinguishable among pre-admission refusals. The operator reports `IPC_BINDING_OR_PROTOCOL_UNVERIFIABLE`, never guesses "absent" versus "ambiguous", and issues no write.

### 2.2 Other exact surfaces used

| Surface | Request | Authoritative response / use |
| :-- | :-- | :-- |
| IPC `portfolio.get` | `{portfolioId}` | v1 `PortfolioDetail`; exact generated fixture, manual holding, revision, holdings and `contributions: []` under the personal projection |
| IPC `portfolio.revisions` | `{portfolioId}` | `RevisionEntry[]`; initial state must be exactly one `INITIAL` revision 1 |
| IPC `portfolio.create` | `{portfolioId, portfolioName, holdings:[{symbol,quantity,averageBuyPrice,currentPrice}]}` | personal write receipt with `disposition: SAVED_NEW_BATCH`, `revision: 1`, and `portfolio` detail. The pinned personal create requires a non-empty holdings array (`dispatch.ts:221–229`); the operator does not use the older empty-create proposal |
| IPC `portfolio.delete` | `{portfolioId, expectedRevision}` | exactly `{portfolioId, deletedAt}`; tombstone, not erase (`portfolio_store.ts:1621–1647`) |
| Route A `GET /api/broker-import/{id}/revision` | no body | `200 {portfolioId,revision}` or `404 {"outcome":"RESOURCE_UNAVAILABLE"}` |
| Route A `POST /api/broker-import/{id}/holdings` | valid v1 DTO, `mode: MERGE`, `expectedRevision: 0` | required acceptance observation: `409 {"outcome":"REVISION_CONFLICT"}` |

The operator calls `callIpc` directly only for `portfolio.list`, `portfolio.get`, `portfolio.revisions`, `portfolio.create`, and `portfolio.delete`. The conflict request goes through the existing Route A HTTP handler (which internally uses the existing v1 save adapter). The operator never calls IPC `portfolio.save` or `portfolio.reset` directly and adds no HTTP create/delete route.

## 3. F1–F7 implementation

| Phase | Implementation |
| :-- | :-- |
| **F1 Runtime verification** | Node ≥22.13; supported local platform; non-production `NODE_ENV`; exact `IIPS_LOCAL_PERSONAL_USE=1`; existing binding precondition; existing local IPC endpoint resolver; explicit loopback IRR origin. Enablement is never authorization. IPD's separate process flag and W-1 predicates are not readable through IPC and are never asserted from operator env; IPD enforces them on the create request before mutation. |
| **F2 Owner binding verification** | Correlated v1 `portfolio.list` success and strict summary-array validation. Empty list accepted. Class P, local client refusal, timeout, wrong version/op/correlation, malformed or duplicate summaries stop before mutation. No owner selection. |
| **F3 Fixture creation** | Fresh UTC + UUID identity in the `step9-fixture-` namespace; IPD ID grammar; synthetic grammatical symbol; list/get/HTTP absence preflight; exclusive evidence journal durable before the single `portfolio.create`. No identity fallback or create retry. |
| **F4 Initial state verification** | Exact create receipt; authoritative `portfolio.get` and `portfolio.revisions`; revision 1, one `INITIAL` revision, exact manual holding, `isSaved:false`, personal `contributions:[]`; canonical initial-state digest; fresh binding read and Route A revision read. |
| **F5 Conflict preparation** | Existing `validateBrokerImportSaveDto` and `buildV1SavePayload`; valid symbol/quantity/prices; `expectedRevision:0`; explicit `MERGE` with no `operation` key. PR #520 REPLACE and PR #521 grammar safeguards are re-tested. |
| **F6 Conflict verification** | One Route A POST; exact status 409 and JSON body `{"outcome":"REVISION_CONFLICT"}`; full request/response captured verbatim; authoritative detail and revision ledger unchanged; Route A revision still 1. Any other status/body or state delta fails. |
| **F7 Cleanup** | Fresh binding resolution and exact fixture read; one `portfolio.delete` with the observed revision; exact delete receipt; list absence + `portfolio.get` `RESOURCE_UNAVAILABLE` + Route A revision 404. **Logical removal/tombstone only; physical erasure is neither performed nor claimed.** |

Even `CONFLICT_OBSERVED` leaves `step9: "NOT PASSED"` in the transcript. Only a separate result-acceptance act can accept retained runtime evidence.

## 4. Fail-closed and partial-failure behaviour

- Invalid runtime, missing enablement/precondition, non-local endpoint/origin, unsupported Node/platform: no IPC or HTTP I/O.
- Absent/ambiguous/unverifiable binding (Class P), malformed protocol, wrong correlation, transport timeout: no create.
- Target already listed/readable, or HTTP preflight does not observe absence: no create and no cleanup of that target.
- IPD `WRITE_NOT_AUTHORIZED` or any create Class A refusal: stop; no speculative delete. The local flag cannot bypass IPD.
- Create outcome unknown: **read-only reconciliation first**. Delete only if the exact generated fixture is visible under a freshly resolved binding. If absent, no delete. If binding/read remains uncertain, retain the identity in evidence and stop.
- Receipt/read-back/initial-state failure after a verified create: cleanup is limited to that exact generated fixture. No other portfolio is eligible.
- Unexpected conflict success or store effect: fail the lifecycle; cleanup may remove the known fixture using its freshly observed revision, but never reports acceptance.
- Cleanup refusal/uncertainty: no automatic delete retry. Evidence reports `RECOVERY_REQUIRED`.
- Explicit `--recover` reads an existing eligible pre-conflict transcript, revalidates runtime/endpoint/binding/identity/INITIAL state, and writes a **separate** recovery transcript. It never overwrites the source evidence. Changed state, conflict-phase evidence, tampered identity, or another endpoint refuses without a write. An interrupted `RUNNING` pre-conflict transcript is eligible only under the operator's single-run/quiescent-host precondition.
- Evidence creation is exclusive; updates are complete-file fsync + atomic replacement. Journal failure before create prevents mutation. Journal failure after create does not suppress safe reconciliation/cleanup.

## 5. Operator interface (for a future separately authorized run)

From `frontend/`:

```text
npx tsx server/broker-import/step9AcceptanceFixtureOperator.ts --preflight --irr-origin http://127.0.0.1:8787 --evidence <new-local-path>
npx tsx server/broker-import/step9AcceptanceFixtureOperator.ts --execute-acceptance --irr-origin http://127.0.0.1:8787 --evidence <new-local-path>
npx tsx server/broker-import/step9AcceptanceFixtureOperator.ts --recover --irr-origin http://127.0.0.1:8787 --evidence <existing-eligible-path>
```

No arguments prints help without I/O. `--preflight` performs reads only. `--execute-acceptance` is an explicit mode selector, **not authorization**. There is no owner, portfolio-ID, holdings, authorization, retry, or physical-delete option. The IPD and IRR processes must already be configured under the existing governance decision; this change sets no runtime configuration.

## 6. Verification performed

| Check | Result |
| :-- | :-- |
| New operator targeted suite | **46/46 PASS** (isolated double + real Route A handler) |
| Operator + broker-import/user-portfolio safeguard suites | **212/212 PASS** |
| Full frontend suite (`npm run test:ci` + zero-test guard) | **1959 PASS, 1 pre-existing skip, 0 FAIL** |
| Frontend typecheck | PASS |
| Investment-server strict typecheck | PASS |
| Replay-server strict typecheck (now includes operator + targeted test) | PASS |
| Frontend production build (`npm run build`) | PASS (existing chunk-size warning only) |
| IRR Python validation regressions | **11/11 PASS** |
| IPD remote `main` before/after inspection | `de8756de1d7d4082e8e144dadf3fb53373b711c6`, unchanged |

The full suite uses existing isolated test stores/doubles and temporary OS directories; it is not a Step 9 acceptance run. GitHub CI result is recorded on the implementation PR, not inferred from this local table.

## 7. Scope and regression safeguards

Changed implementation files are the single operator script, its targeted test, the exact two-entry inclusion in `tsconfig.replay-server.json`, and this record. No dependency, lockfile, workflow, route, admission, W-1 predicate, revision-cap policy, persistence architecture, schema, or IPD file changed.

Preserved and verified: PR #520 REPLACE `payload.operation` and MERGE key absence; PR #521 symbol grammar; Route B G-2 write refusal 503; existing W-1/IPD authority; Gate 3 boundaries. The PR #523 shared v1/v2 revision-cap observation remains **OPEN and IPD-owned**. Gate 4 remains AUTHORIZED — NOT STARTED; Gate 5 not initiated; DQ-4 8/10; D06 unchanged.

## 8. Mandatory stop

**Implementation completion does not authorize lifecycle execution.** Stop after merge. Do not create the fixture, execute the conflict request, or delete anything without Ramki's separate execution authorization. **Step 9 remains NOT PASSED** until a separately authorized acceptance run produces valid, retained, separately accepted evidence.
