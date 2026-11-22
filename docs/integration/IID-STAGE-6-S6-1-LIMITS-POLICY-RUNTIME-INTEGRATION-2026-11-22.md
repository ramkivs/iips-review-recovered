# IID Stage 6 — S6-1: operator limits policy runtime integration (implementation record)

**Work item:** S6-1 — connect the existing fail-closed operator-limits parser to the documented policy path and to
the disposition-generation path (decision record `IID-STAGE-5-PA-PO-ACCEPTANCE-DECISION-2026-11-22.md` §4.2–§4.3;
roadmap §C.11 "first actionable step")
**Authority:** owner instruction 2026-11-22 — implementation, targeted tests, documentation and publication through
an IRR PR. **Not authorised, not done:** choosing or writing the owner's limits values; a populated
`limits-policy.json`; IPD files or behaviour; other Stage 6 work; production/hosted/multi-user/commercial scope;
any change to the owner's Windows checkout.
**Repository:** `ramkivs/iips-review-recovered` (IRR). Base `main@58270c822d611b0e847182f463dea61b862a70f3` (PR #621 merge)
**Date:** 2026-11-22 (UTC)
**Status:** **IMPLEMENTED AND VERIFIED IN THE SANDBOX — S6-1 NOT COMPLETE** (§7: host verification with the
owner's own file is pending and the owner's values do not exist yet; and §3 names an architectural gap that this
work item was not authorised to close).

---

## 1. What was inspected first (current branch, not the earlier static search)

| Item | Found on `main@58270c82` |
|---|---|
| Decision record §4.3 blocker | "no runtime reader bound to the documented path; no caller of `resolveDispositionLimits` outside its module" |
| Re-verified | **Still true.** `resolveDispositionLimits` (`frontend/server/investment/dispositionService.ts`) had no caller in `frontend/server`, `frontend/src` or `iips-platform/src` other than its own tests; no reference to `investment/policies` or `limits-policy.json` existed outside `docs/OPERATOR_RUNBOOK.md` §15.3 and roadmap B.H |
| Parser / schema | `iips-platform/src/investment/disposition/limits.ts` — `parseLimitsPolicyText` → `parseLimitsPolicy` (closed key set, typed rejections `LIMITS_REJECTIONS`), `resolveLimits` (effective dating; `basis` `SYSTEM_DEFAULT` ↔ `OPERATOR_CONFIG`; future-dated policy ⇒ defaults + note). `resolveDispositionLimits` wraps them fail-closed for text input. **Unchanged by this work** |
| Existing tests | `frontend/server/investment/disposition-records.test.ts` "limits policy resolution" (defaults / operator text / unreadable text fails closed); `iips-platform/tests/investment/disposition-limits.test.ts` |
| Data-root convention | explicit root > `IIPS_DATA_DIR` > `<cwd>/.iips-data`, then `investment/<subdir>` — `resolveIdentityDir` (identity), `localSnapshotStore` (dataset), `resolveDataDir` (persistence) |
| **Actual runtime disposition-generation path and its callers** | The engine is `buildDispositionPayload` (`iips-platform/src/investment/disposition/engine.ts`), which takes `limits: ResolvedLimits` as an input; recording is `createDispositionRecordsService().record()`. **The only caller of either in IRR is `frontend/server/investment/cli/disposition-demonstration.ts`** — the operator CLI named by runbook §15.1 — and it passed `resolveLimits({ policy: null, asOf })`, i.e. a literal "no policy". The read transport (`disposition-transport.ts`, GET/HEAD only) produces nothing; it serves recorded chains. **There is no operator CLI that mints a disposition for a real holding against the live NP-04 store** (§3) |

## 2. What was implemented (narrow)

### 2.1 `frontend/server/investment/limitsPolicySource.ts` — new

- `resolveLimitsPolicyDir(dataRoot?, env?)` / `resolveLimitsPolicyPath(dataRoot?, env?)` — the documented path
  under the application's data-root precedence. The file name (`limits-policy.json`) is a constant; nothing can point
  the loader at another file, so `OPERATOR_CONFIG` has exactly one possible provenance.
- `loadOperatorLimitsPolicy({ asOf, dataRoot?, env? })` → `{ limits: ResolvedLimits, source: { kind, path } }`:
  - **no file** → `resolveDispositionLimits({ policyText: null })` (labelled defaults), `source.kind = 'ABSENT'`, the
    path it looked at;
  - **file present** → bytes read → `resolveDispositionLimits({ policyText })` — the **existing** parser and
    resolver, no parallel logic — `source.kind = 'OPERATOR_FILE'`; a valid in-force policy yields `OPERATOR_CONFIG`
    with the file's `policyVersion`; a future-dated one yields defaults with the note (that is `resolveLimits`'
    decision, preserved);
  - **file present but empty, a directory, unreadable, not JSON, not an object, unknown key, missing/invalid/
    out-of-range value** → throws `LimitsPolicyError(<reason>)`. The defaults are never substituted. (A blank *file*
    is treated as invalid rather than as "no policy": the operator wrote something, and it is not a policy.)
- `isLimitsDisclosureConsistent(loaded)` — the invariant "`OPERATOR_CONFIG` only when `source.kind === 'OPERATOR_FILE'`;
  otherwise the version ends `+system-default`", exported so producers and tests can assert it.

### 2.2 `frontend/server/investment/cli/disposition-demonstration.ts` — the one producer, now wired

- Caps come from `loadOperatorLimitsPolicy({ asOf: CLOCK, dataRoot: options.limitsPolicyRoot ?? env.root })`,
  loaded **before any store is opened**; a `LimitsPolicyError` cleans up the temporary root and propagates.
- Default behaviour unchanged: the demonstration's own fresh root has no policy ⇒ `ABSENT` / `SYSTEM_DEFAULT`,
  identical verbs and chain mechanics to before.
- New optional `--limits-policy-root <dir>` (programmatic `{ limitsPolicyRoot }`) so an operator can prove, on a
  synthetic subject and a throwaway store, that **the file at `<dir>/investment/policies/limits-policy.json`** loads
  and is applied. Only the root is configurable, never the file name.
- Evidence JSON gains `limits { source, basis, policyVersion, effectiveFrom, notes, recordedHeld, recordedCandidate }`
  and **verification point 9**: disclosure consistent, and both recorded payloads carry exactly the loaded `basis`
  and `policyVersion`.
- CLI exit codes: `0` all points pass; `1` a point fails; **`2` the operator policy was rejected** — the reason and
  "defaults NOT substituted" are printed; no evidence file is written.

### 2.3 Not changed

`limits.ts`, `engine.ts`, `dispositionService.ts`, `dispositionComposition.ts`, the read transport, any scoring,
assessment, portfolio or verb logic, any UI, any IPD file. No new dependency. No settings UI. No new route.

## 3. Architectural gap recorded — not closed here (requires separate authority)

The decision record's S6-1 acceptance reads *"a disposition computed after the policy is in place reports
`limits.basis = OPERATOR_CONFIG` with the owner's `policyVersion`"*. After this work that is true for every
disposition IRR can produce — but the only producer is the **synthetic demonstration**. IRR has **no operator CLI
that mints a disposition for a real holding** (real portfolio read → real assessment chain → `buildDispositionPayload`
→ `record()` on the live NP-04 store). The runbook's §15.1 "and the same `record()` path in any operator script"
describes a path that no script yet walks.

Consequences, stated plainly:

- The owner's policy, once authored, will be **loaded, validated and applied** by the disposition path that exists,
  and its basis/version will be **disclosed truthfully** — verifiable on the host with the §5 command.
- A disposition **on a real holding** carrying `OPERATOR_CONFIG` cannot be produced until a real-holding disposition
  mint exists. Building one is a new capability (portfolio read via IPC, identity resolution, assessment lookup,
  subject/portfolio-context assembly, write to the live store) — **outside S6-1's authorisation**. It is recorded as
  **S6-1b — real-holding disposition mint CLI — OPEN, IRR-owned, awaiting authority**, and it is the natural next
  design item once the owner's policy exists.
- This work did **not** silently widen into S6-1b.

## 4. Tests added and results (sandbox, Node 22 / vitest 2.1.9)

| File | Covers | Result |
|---|---|---|
| `frontend/server/investment/limitsPolicySource.test.ts` (24 tests) | documented path under explicit root / `IIPS_DATA_DIR` / cwd fallback / blank env; valid policy → `OPERATOR_CONFIG` + exact `policyVersion` + caps + `effectiveFrom`; found through `IIPS_DATA_DIR`; future-dated → defaults with note, not `OPERATOR_CONFIG`; absent → explicit `ABSENT`, labelled defaults, never `OPERATOR_CONFIG`; 12 invalid-file cases each mapped to its `LimitsPolicyError.reason` (malformed JSON, array, empty, whitespace, unknown key, missing version, missing/invalid `effectiveFrom`, out-of-range cap, non-numeric cap, non-object sector map, non-percentage sector cap); directory at the path; unparseable `asOf`; forged disclosure rejected | **24/24 pass** |
| `frontend/server/investment/cli/disposition-demonstration.test.ts` (3 tests) | default run: 9 points hold, `ABSENT`/`SYSTEM_DEFAULT`, written payload default, `noExecutionPath` true; valid root: 9 points hold, `OPERATOR_FILE`, `OPERATOR_CONFIG`, `policyVersion` `limits-policy/s6-1-test` on loaded limits, both recorded payloads and every `limits.applied` entry; caps 7 / {DEFAULT 22, Technology 18} in the written payload; **verbs identical to the default run** (decision logic untouched); invalid root: rejects with `LimitsPolicyError(UNKNOWN_KEY)` before any store, no evidence written | **3/3 pass** |
| `frontend/server/investment/disposition-records.test.ts` (existing, 17 tests) | unchanged behaviour of the records service and `resolveDispositionLimits` | **17/17 pass** |

Type checks: `tsc --noEmit` (frontend main project) **clean**; `tsc -p tsconfig.investment-server.json` reports only
the two pre-existing errors in `g10JsFreeCoverage.test.ts` / `iidInvestmentCoverageTransport.test.ts` (untouched,
present on `main` before this work; not introduced here). No broad suite run.

## 5. Runtime verification performed (sandbox; operator-style invocation)

```text
npx tsx server/investment/cli/disposition-demonstration.ts --out <dir>
  PASS  9. … source ABSENT, basis SYSTEM_DEFAULT, policyVersion limits-policy/1.0.0+system-default; held …; candidate …   exit 0

npx tsx server/investment/cli/disposition-demonstration.ts --out <dir> --limits-policy-root <root with a valid file>
  PASS  9. … source OPERATOR_FILE, basis OPERATOR_CONFIG, policyVersion limits-policy/cli-check; held OPERATOR_CONFIG/limits-policy/cli-check; candidate OPERATOR_CONFIG/limits-policy/cli-check   exit 0
  evidence.limits = { source.kind OPERATOR_FILE, basis OPERATOR_CONFIG, policyVersion limits-policy/cli-check, effectiveFrom 2026-11-01T00:00:00.000Z, recordedHeld/recordedCandidate OPERATOR_CONFIG }

npx tsx server/investment/cli/disposition-demonstration.ts --out <dir> --limits-policy-root <root with an unknown key>
  FAIL  limits policy (UNKNOWN_KEY): unknown limits-policy key "singleNameMaxPercent" — policy_inputs_unavailable; defaults NOT substituted   exit 2   (no output directory created)

IIPS_DATA_DIR=<root> → loadOperatorLimitsPolicy({ asOf }) → OPERATOR_FILE OPERATOR_CONFIG limits-policy/cli-check <root>/investment/policies/limits-policy.json
```

The policy files used were throwaway test values in a sandbox temp directory, deleted afterwards. **No file was
written to the owner's data root; no owner values exist or were invented.**

## 6. Documentation

- `docs/OPERATOR_RUNBOOK.md` §15.3 — how the file is found, the outcome table, the host verification command, and
  the explicit "what this does not yet give you" (no real-holding mint).
- Roadmap §C.12; tracker §16.316; this record.

## 7. Status and what remains

| Item | Status | Owner |
|---|---|---|
| Loader at the documented path, existing parser, fail-closed, truthful disclosure | **IMPLEMENTED; verified by tests and by sandbox runtime invocation** | IRR (this PR) |
| Wired into the disposition-generation path | **IMPLEMENTED** for the only producer that exists (demonstration CLI) | IRR (this PR) |
| Host verification with the owner's own file (`--limits-policy-root %IIPS_DATA_DIR%`, point 9 `OPERATOR_CONFIG` + the owner's `policyVersion`) | **PENDING** — needs (a) this PR delivered to the host by the owner's manual, controlled synchronisation and (b) the owner's policy file, which does not exist yet | owner |
| Owner's limits values | **not authored** (reserved to the owner; next action) | owner |
| S6-1b real-holding disposition mint | **OPEN — awaiting authority** (§3) | IRR, on owner instruction |
| **S6-1** | **NOT COMPLETE** — code delivered and verified in the sandbox; completion requires the host verification above with the owner's values | — |

No IPD write. No change to the owner's Windows checkout. No fetch/pull/checkout/merge/rebase/reset in the owner's
environment. Stage 6 remains **IN PROGRESS**; nothing else in Stage 6 was started.

---

## 8. Addendum — S6-1b: real-holding disposition generation (authorised and implemented 2026-11-22, same PR #622)

**Authority:** owner instruction 2026-11-22 authorising S6-1b narrowly: a safe operator CLI/workflow that generates a
disposition for an **actual persisted holding** using the authoritative NP-04 investment data, the existing disposition
engine, the S6-1 loader and the existing disposition-record persistence — on PR #622's head branch, no separate PR, no
merge. §3 and §7 above are **not rewritten**; this section supersedes their "S6-1b OPEN — awaiting authority" lines.
**Not authorised, not done:** synthesising holdings described as real; creating missing company assessments;
inventing identities, values or results; changing scoring/assessment/verb rules; IPD files; the owner's policy
values; the CI guard; merging #622.

### 8.1 What was inspected before writing code (findings that shaped the design)

| Question | Found |
|---|---|
| Where real holdings come from | The G2 portfolio view over the same-host **IPC read channel** (`IpcUserPortfolioPort.getPortfolio`, v2 protocol), gated by the server-owned binding precondition (`IIPS_G3_IPC_BINDING_PROVISIONED`, `IIPS_G2_IPC_ENDPOINT`); IPD resolves the owner from its own active A-2 binding; the scope is empty. `createPortfolioHoldingsProvider` (`sources.ts`) already walks this path for one portfolio's rows. IRR holds no portfolio store of its own |
| How issuer/security identity is established | `resolveHoldingIdentities(portfolioId, holdings, sources, asOf)` (`holding-identity-transport.ts`) over `loadRuntimeIdentitySources(dataRoot)` — `<root>/investment/identity/{eligible-roster,listing-map,corporate-actions}.json`; `assessable = RESOLVED ∧ listingId ≠ null`. The served `/api/investment/holdings/:portfolioId/identity` route uses exactly this |
| Where assessments live | `createInvestmentArtifactService({port, owner}).readChain(companyScopeToken(issuerId), 'investment.company-assessment')` → head → `readVersionWithPayload`; `InvestmentVersionView` carries `datasetClass`, `payloadDigest`, `inputDigest`, `substantiveDigest`. Store opened through `loadAuthoritativeNp04Persistence(intent)`: `READ` = existing store only, no create/migrate (writes are not restricted by intent); `INITIALISE` = create+migrate, reserved to the mint CLI |
| The engine input | `DispositionEngineInput{subject, assessment{payload, ref}, portfolio{block, facts}, limits, previous?, hardTrigger?, generatedAt}`; `heldSubject` requires `exchange ∈ {NSE,BSE}`, `securityClass`, `securityState` (default `UNKNOWN` ⇒ gate G-2 withholds); `buildPortfolioContext` needs the **whole** `G2PortfolioView` plus an identity resolver for the other rows |
| Persistence and duplicate rules | `createDispositionRecordsService().record()` → `recordDisposition` → **substantive idempotency** on the chain head: same meaning ⇒ `UNCHANGED` / `CLOCK_ONLY_UNCHANGED` / `INPUT_CHANGED_CONTENT_IDENTICAL`, `wrote:false`; changed meaning ⇒ `APPENDED` on the same `hd:<portfolio>/<security>` chain. No second mechanism needed |
| **Finding F-1 (pre-existing IID-4 rule).** | `stableDispositionParameters` (`dispositionComposition.ts`) makes **`limitsPolicyVersion` and `limitsBasis` stable chain parameters**, i.e. part of the chain's `reportKey`. A disposition head recorded under `SYSTEM_DEFAULT` therefore **cannot be superseded on the same chain** by one under an operator policy: the artifact service would append and then refuse the chain as `CHAIN_SCOPE_DRIFT` ("chain member carries a different chain identity"). S6-1b detects this **before any write** and stops (`CHAIN_PARAMETERS_DRIFT`). Whether a policy change should open a new chain identity or be demoted to provenance is an **IID-4 design decision for the owner**, not something this command resolves |
| Hard trigger | `PreviousDisposition{verb, mosVsMidPct, weightPct}` (`verbs.ts`); hysteresis consumes only `previous.verb`; `hardTrigger` bypasses it. The engine documents the trigger classes but no caller computed them |
| Existing writers | **None for a real holding** (§3 re-confirmed): the demonstration CLI is synthetic; the transports are GET/HEAD |

### 8.2 What was implemented (IRR only)

| File | Role |
|---|---|
| `frontend/server/investment/holdingDisposition.ts` — new | The composable run `generateHoldingDisposition(input, deps)`: **(1)** limits via `loadOperatorLimitsPolicy` first — `LimitsPolicyError` ⇒ `POLICY_INVALID`, nothing else touched; **(2)** identity sources, fail-closed; **(3)** the real portfolio view through the injected provider (production: `createPortfolioViewProvider`), id cross-checked; **(4)** `selectHolding` by `symbol:` / `isin:` / `index:` / bare — no match, inactive, or >1 active match ⇒ stop; **(5)** `resolveHoldingIdentities` for the whole view; subject must be `RESOLVED`, assessable, listing in force, `instrumentType EQUITY`, exchange in the closed set — else `IDENTITY_UNRESOLVED`; `securityState` = `ACTIVE` only when the listing window covers `asOf`, otherwise `UNKNOWN` (no other state inferred); **(6)** latest persisted assessment for `co:<issuerId>` — `CHAIN_NOT_FOUND` ⇒ `ASSESSMENT_UNAVAILABLE` (never created); issuer mismatch or substantive-digest mismatch ⇒ `ASSESSMENT_INCONSISTENT`; `DispositionAssessmentRef` built from the stored version + payload; **(7)** `buildPortfolioContext` over the real view, other rows' issuer/sector from the same identity sources (roster sector); **(8)** `heldSubject` from the row as delivered (`quantity`, `averageBuyPrice`, `marketValue` as `DATASET` observations with a row locator; unrealised gain `DERIVED`, or `NOT_COMPUTABLE` when the average price is not positive); **(9)** previous head on the same chain via `readHolding` ⇒ `previous.verb` for hysteresis, `detectHardTrigger` over the observable subset (adequacy / quality / moat / identity change — named in the report; severity-≥4 risk and restatement detection **not** inferred); **(10)** `buildDispositionPayload` unchanged; payload must carry the given limits (`basis`, `policyVersion`, `digest`) and cite the given identity/assessment or `DISPOSITION_INCONSISTENT`; F-1 pre-check ⇒ `CHAIN_PARAMETERS_DRIFT`; **(11)** `record()` with the assessment's digests and `datasetClass`; store errors ⇒ `PERSISTENCE_FAILED` with the store's own message. `dryRun` stops after (10). The report names portfolio (id, revision, `lastUpdated`), holding (index, symbol, ISIN, broker, quantities, weight), identity (issuer, security, listing, basis, state, `rosterDataClass`), assessment (scope, reportId, version, count, adequacy, `datasetClass`, substantive digest), limits (`basis`, exact `policyVersion`, `source{kind,path}`, caps, notes), previous head, hard-trigger reasons, disposition (chain scope, verb, withheld, caps applied, carried basis/version) and persistence (`outcome`, `wrote`, head id/version, chain `versionCount`) |
| `frontend/server/investment/cli/generate-holding-disposition.ts` — new | Operator entry point. `--portfolio <id> --holding <selector> [--db] [--owner-carrier] [--data-root] [--as-of] [--dry-run] [--out]`. Owner from the reports carrier (`IIPS_REPORTS_OWNER_PATH` / `--owner-carrier`); store with **READ intent** (must exist; never created or migrated here); portfolio through `createPortfolioViewProvider({env})`; identity + policy under `--data-root` / `IIPS_DATA_DIR`. JSON report to stdout / `--out`; summary lines to stderr; exit 0 recorded/unchanged/dry-run, 2 stopped with a named code (nothing written), 1 unexpected. Releases NP-04 handles on exit |
| `frontend/server/investment/sources.ts` — additive | `createPortfolioViewProvider(options)` beside `createPortfolioHoldingsProvider`: same precondition, same port, same empty scope, returns the whole view. Existing providers untouched |
| `frontend/server/investment/np04StandInPortFixture.ts` — new, **tests only** | An in-memory five-operation port keeping the contract the artifact service depends on (store-assigned ids, `reportKey` by the canonical grammar, heads-only `queryByOwner`, contiguous supersession, owner partitioning, `appendVersion` refuses a changed `reportKey`). Never imported by production code; not evidence of persistence |
| `frontend/server/investment/holdingDisposition.test.ts` — new | §8.3 |

Not changed: `engine.ts`, `verbs.ts`, `gates.ts`, `limits.ts`, `subject.ts`, `dispositionService.ts`,
`dispositionComposition.ts`, `investmentArtifacts.ts`, the transports, `disposition-demonstration.ts` (S6-1 wiring
as delivered), scoring/assessment rules, portfolio/broker-import/UI behaviour, `.github/workflows/ci.yml`, any IPD file.

### 8.3 Tests (fixtures — explicitly NOT a verification against the owner's persisted holdings)

`holdingDisposition.test.ts` — 21 tests. The portfolio view is a **fixture** standing where the IPC channel delivers
the real view (one resolvable M-1 row + one unresolvable row); the assessment is the **real M-1 assembly recorded
through the real artifact service**; identity sources are the M-1 files; engine, loader, portfolio context and the
record path are production code. The run-level suite is parameterised over every port available in the process: the
in-memory stand-in **always**, and the **real governed store (`iips-np04-governed-persistence`) whenever the package
resolves** — i.e. in CI, where the IPD dependency is installed. Only that run is evidence for persistence on the
authoritative store.

| Required case | Test | Stand-in result (sandbox) |
|---|---|---|
| 1 a persisted holding is selectable and processed | `[1][2]` by symbol / ISIN / index; `RECORDED`, `CREATED`, head v1, read back via `readHolding` | pass |
| 2 identity preserved | payload `subject` = resolved `IN:EQISIN:…` / `IN:ISIN:…` / symbol / NSE / `ACTIVE`; `companyAssessmentRef.reportId` = the persisted head | pass |
| 3 actual path receives the resolved limits | `[3][4][5]` payload `limits` = loaded limits (caps 8 / {DEFAULT 25, Technology 20}); `limits.applied` names `SINGLE_NAME_MAX` 8 % `OPERATOR_CONFIG` | pass |
| 4 `OPERATOR_CONFIG` recorded | read back from the store: `basis OPERATOR_CONFIG` | pass |
| 5 exact `policyVersion` | `limits-policy/s6-1b-fixture` on loaded limits, payload, report and stored payload | pass |
| 6 missing policy → `SYSTEM_DEFAULT` | `[6]` `ABSENT`, `limits-policy/1.0.0+system-default`, note present | pass |
| 7 invalid policy fails closed | `[7]` `POLICY_INVALID(UNKNOWN_KEY)` before the portfolio is read; no chain exists afterwards | pass |
| 8 missing assessment / unresolved identity block | `[8a]` `IDENTITY_UNRESOLVED` for the unresolvable row; `[8b]` `ASSESSMENT_UNAVAILABLE`, inventories empty (nothing created); `[8c]` unreadable / unknown portfolio ⇒ `PORTFOLIO_UNAVAILABLE` | pass |
| 9 persistence failure reported accurately | `[9]` write refused ⇒ `PERSISTENCE_FAILED`, `detail.code PERSISTENCE_UNAVAILABLE`, `storeMessage "disk full"`, nothing stored | pass |
| 10 repeated execution, no duplicates | `[10]` same inputs at a later clock ⇒ `UNCHANGED`, `wrote:false`, `versionCount 1`, same head; new **assessment** version ⇒ `APPENDED` v2 on the **same** `reportKey`, one chain listed | pass |
| F-1 | `[3′]` head on defaults, then operator policy ⇒ `CHAIN_PARAMETERS_DRIFT` naming `limitsPolicyVersion` / `limitsBasis`; chain still v1 on `SYSTEM_DEFAULT` | pass |
| CLI | owner absent ⇒ `OWNER_CONTEXT_UNAVAILABLE` (port never loaded); store absent ⇒ `PERSISTENCE_UNAVAILABLE`; full run with `--data-root` ⇒ `RECORDED` + `OPERATOR_CONFIG` + exact version in the summary lines, re-run `UNCHANGED`; `--dry-run` writes nothing; invalid policy ⇒ exit 2 naming the path; malformed argv refused | pass |
| 11 synthetic demonstration intact | `disposition-demonstration.ts` not modified by S6-1b; its 3-test suite is unchanged (requires the IPD package — runs in CI, see 8.4) | — |
| helpers | selector parsing, selection (none / inactive / ambiguous), listing-window → `ACTIVE`/`UNKNOWN`, hard-trigger cases | pass |

Sandbox results: **21/21 pass** (stand-in); `limitsPolicySource` 24/24, `portfolio-context`, `sourcesW05Projection`,
`iidWi2Discovery`, `phase1D114WireToResolverInput`, `iidStage4ServedCoverageRoute` — **111/111** across the seven
files run. `tsc --noEmit` over the five S6-1b files (replay-server project options): **0 errors**.

### 8.4 Sandbox limitation stated plainly

During this session the sandbox could **not** install the pinned IPD packages (`codeload.github.com/ramkivs/
iips-production-market-data/...` answered 404 to anonymous fetches and the scoped token cannot read that repository),
so `iips-np04-governed-persistence` was absent here. Consequences: (a) the **real-store** branch of the S6-1b suite,
the existing `disposition-records` / `disposition-demonstration` suites and `tsc -p tsconfig.investment-server.json`
could not be executed in this sandbox — they run in CI once the guard the owner is resolving lets the workflow proceed;
(b) `generate-holding-disposition.ts` was exercised end-to-end only through `runCli` with the store and the view
injected, plus a direct invocation confirming the ESM guard, usage and the `OWNER_CONTEXT_UNAVAILABLE` stop. The CI
results on #622 are therefore the next evidence point for the real-store assertions, before any host run.

### 8.5 Host-side verification that remains (owner)

```text
cd frontend
npx tsx server/investment/cli/generate-holding-disposition.ts ^
  --portfolio <portfolioId> --holding symbol:<SYMBOL> ^
  --db %IIPS_NP04_DATABASE_PATH% --owner-carrier %IIPS_REPORTS_OWNER_PATH% ^
  --data-root %IIPS_DATA_DIR% --dry-run --out <scratch>\s6-1b-dry-run.json
```

With `IIPS_G2_IPC_ENDPOINT` and `IIPS_G3_IPC_BINDING_PROVISIONED=true` set as for the server. Expected: `status
DRY_RUN`, `holding` = the chosen row, `identity.issuerId` = the governed issuer (e.g. Infosys
`IN:CIN:L85110KA1981PLC013115` once its holding resolves), `assessment.reportId` = the existing chain head,
`limits.basis` = `OPERATOR_CONFIG` **only if** the owner's `limits-policy.json` exists at the documented path,
otherwise `SYSTEM_DEFAULT`. Repeat **without** `--dry-run` to record; a second run must report `UNCHANGED`. Then
`GET /api/investment/portfolio/<portfolioId>/holding/<securityId>` serves it. No owner policy values are authored by
this work; **both S6-1 and S6-1b stay NOT COMPLETE until the owner runs this on the host with their own file.**

### 8.6 Status after §8

| Item | Status |
|---|---|
| S6-1 loading/validation of the operator policy | implemented; host verification pending (§7) |
| S6-1b real-holding disposition generation | **implemented and fixture-verified in the sandbox (stand-in port); real-store run pending in CI; host verification pending** |
| Finding F-1 (limits policy version is a chain parameter) | **OPEN — owner decision required** before a policy change can supersede an existing real-holding chain |
| Owner's policy values | not supplied, not invented |
| PR #622 | open; not merged; CI visibility/guard issue owned by the owner |
