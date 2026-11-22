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
| Finding F-1 (limits policy version is a chain parameter) | **DECIDED by the owner 2026-11-22 — FAIL CLOSED** (see §9.1); the implemented behaviour is retained unchanged |
| Owner's policy values | **supplied by the owner 2026-11-22** (see §9.2); installation on the host and host verification pending |
| PR #622 | open; not merged; CI visibility/guard issue owned by the owner |

## 9. Owner decisions recorded (2026-11-22, later pass) — F-1, approved operator policy, host-verification protocol

This section records two owner decisions and the verification protocol that follows from them. It changes **no
code**: the behaviour decided in §9.1 is the behaviour `holdingDisposition.ts` already has, and the policy in §9.2 is
installed on the **owner's host**, never in this repository. Nothing in this section was executed on the host from
the sandbox session that wrote it (§9.4).

### 9.1 F-1 — decision of record: FAIL CLOSED on chain-parameter drift

**Decision (owner, 2026-11-22):** when a disposition is generated for a holding whose existing `hd:<portfolio>/<security>`
chain was recorded under a different `limitsBasis` or `limitsPolicyVersion`, the run **stops with
`CHAIN_PARAMETERS_DRIFT`**. The chain is **not overwritten**, **not reused** for a version under the new parameters,
and **no replacement chain is created automatically**. The operator is told which parameter drifted (`head` vs `next`)
and nothing is written.

| Aspect | Decided | Implementation status (evidence) |
|---|---|---|
| Detection point | before any write | `frontend/server/investment/holdingDisposition.ts` L605–623: `stableDispositionParameters(previousHead.payload)` vs `stableDispositionParameters(payload)`; throws `HoldingDispositionFailure('CHAIN_PARAMETERS_DRIFT', …, { scopeToken, headReportId, drifted[] })` **before** `record()` — already so |
| Overwrite / reuse of the chain | forbidden | nothing is appended; the artifact service's `CHAIN_SCOPE_DRIFT` refusal (`investmentArtifacts.ts` `assertChainOfScope`) remains the second line of defence — already so |
| Automatic replacement chain | forbidden | no code path mints a different `scopeToken` for the same holding; none is added — already so |
| CLI behaviour | stop, exit `2`, report the drift | `cli/generate-holding-disposition.ts` maps every `HoldingDispositionFailure` to exit `2` with the code and detail — already so |
| Test of record | `[3′]` in `holdingDisposition.test.ts` (head on `SYSTEM_DEFAULT`, then operator policy ⇒ `CHAIN_PARAMETERS_DRIFT` naming `limitsPolicyVersion` / `limitsBasis`; chain still v1) | passes in CI on PR #622 (`8364270`, `297b8b4`) |

**Consequence for operation.** A real-holding chain must be recorded **only after** the operator policy is installed
(§9.2 → §9.3). If a chain already exists on `SYSTEM_DEFAULT` (none is known to exist on the host as of this record —
no recording run has been reported), it stays as it is; what to do with such a chain (leave it, or open a new chain
identity under a **separately authorised** procedure) is **not** decided here and is **not** automated. The
`CHAIN_PARAMETERS_DRIFT` protection must not be bypassed.

The other alternatives named when F-1 was opened (§8.1: "new chain identity per policy", "limits as provenance")
are **rejected for now** — not implemented, not scheduled.

### 9.2 Approved operator limits policy (owner's values — recorded verbatim, not authored here)

```json
{
  "policyVersion": "limits-policy/2026-11",
  "effectiveFrom": "2026-11-01",
  "singleNameMaxPct": 8,
  "sectorMaxPct": {
    "DEFAULT": 25,
    "Technology": 20
  }
}
```

**Host location (owner's Windows machine):** `C:\iips-data\investment\policies\limits-policy.json`, i.e. data root
`C:\iips-data` (`IIPS_DATA_DIR=C:\iips-data` or `--data-root C:\iips-data`; §15.3 path rule `<root>/investment/policies/limits-policy.json`).
The file is **not** committed to this repository and must not be.

**Sandbox parse check of the exact JSON above (evidence that the document is accepted by the real loader; NOT a host
verification):** `loadOperatorLimitsPolicy({ dataRoot: <scratch>, asOf: 2026-11-22T00:00:00Z })` on the committed
`limitsPolicySource.ts` returned `source.kind OPERATOR_FILE`, `basis OPERATOR_CONFIG`, `policyVersion
limits-policy/2026-11`, `effectiveFrom 2026-11-01T00:00:00.000Z`, `singleNameMaxPct 8`, `sectorMaxPct { DEFAULT: 25,
Technology: 20 }`, `notes []`, digest `bf8dd114299e34a91a102b8577a2a988cbc2dddd5762bf02f5320eaa42bebc7c`;
`sectorCapFor` ⇒ `Technology` 20, any other sector (incl. `UNCLASSIFIED`) 25. **The host run must show the same
`policyVersion`** in every CLI report; the digest is not printed by the CLIs but is stored in the disposition payload
(`limits.digest`, shown by `DispositionPanel` / `GET /api/investment/portfolio/<portfolioId>/holding/<securityId>`) — a
different digest there means the file on disk differs from the approved text.

**Known pitfall (fail-closed, so safe, but it will stop you):** the loader reads the file as UTF-8 and hands it to
`JSON.parse`, which rejects a leading byte-order mark. Windows PowerShell 5.1 `Set-Content -Encoding UTF8` /
`Out-File -Encoding UTF8` write a BOM; the result is `POLICY_INVALID` (`limits policy is not valid JSON`). Write the
file without a BOM (PowerShell 7 `utf8`, or `[System.IO.File]::WriteAllText($p, $json, (New-Object System.Text.UTF8Encoding $false))`,
or Notepad "UTF-8" — not "UTF-8 with BOM").

### 9.3 Host-verification protocol (runbook §15.6, in order; owner executes; stop on the first non-zero exit)

Pre-step — **inspect before writing**. If `C:\iips-data\investment\policies\limits-policy.json` already exists, read
it and compare with §9.2 **before** writing anything. If it differs, do **not** overwrite: report its contents and
resolve the conflict first (a differing `policyVersion` on a holding that already has a chain is exactly the F-1 case).

```powershell
# 0. inspect (report the output of this step)
Test-Path 'C:\iips-data\investment\policies\limits-policy.json'
Get-Content 'C:\iips-data\investment\policies\limits-policy.json' -Raw   # only if it exists

# 1. install the approved policy (ONLY if the file is absent or already identical) — no BOM
New-Item -ItemType Directory -Force 'C:\iips-data\investment\policies' | Out-Null
$json = @'
{
  "policyVersion": "limits-policy/2026-11",
  "effectiveFrom": "2026-11-01",
  "singleNameMaxPct": 8,
  "sectorMaxPct": {
    "DEFAULT": 25,
    "Technology": 20
  }
}
'@
[System.IO.File]::WriteAllText('C:\iips-data\investment\policies\limits-policy.json', $json, (New-Object System.Text.UTF8Encoding $false))

# 2. confirm it loads as OPERATOR_CONFIG with the exact version (demonstration path, §15.3 — throwaway store, touches none of your data)
cd <IRR checkout>\frontend
npx tsx server/investment/cli/disposition-demonstration.ts --limits-policy-root C:\iips-data --out C:\iips-data\scratch\s6-1-demo
#    expect in the evidence: limits.source.kind OPERATOR_FILE, limits.basis OPERATOR_CONFIG, limits.policyVersion limits-policy/2026-11;
#    exit 2 with LimitsPolicyError means the file is malformed (check for a BOM, §9.2) — nothing is substituted

# 3. dry run against ONE real holding (environment as for the server: IIPS_G2_IPC_ENDPOINT, IIPS_G3_IPC_BINDING_PROVISIONED=true,
#    IIPS_NP04_DATABASE_PATH, IIPS_REPORTS_OWNER_PATH)
npx tsx server/investment/cli/generate-holding-disposition.ts `
  --portfolio <portfolioId> --holding symbol:<SYMBOL> `
  --db $env:IIPS_NP04_DATABASE_PATH --owner-carrier $env:IIPS_REPORTS_OWNER_PATH `
  --data-root C:\iips-data --dry-run --out C:\iips-data\scratch\s6-1b-dry-run.json
#    inspect: status DRY_RUN; holding = the chosen row; identity.issuerId = the governed issuer;
#    assessment.reportId = the existing assessment head; limits.basis OPERATOR_CONFIG, limits.policyVersion
#    limits-policy/2026-11, limits.source.kind OPERATOR_FILE, caps 8 / 25 / Technology 20; previous = null (no chain yet)
#    or a head whose carried basis/version are identical. If the output names CHAIN_PARAMETERS_DRIFT: STOP (§9.1).

# 4. recording run (same arguments, without --dry-run)   expect: status RECORDED, persistence.outcome CREATED, wrote true, versionCount 1

# 5. repeat step 4 unchanged                               expect: status UNCHANGED, wrote false, versionCount still 1, same headReportId
```

Keep the three JSON reports (dry run, recording, repeat). They are the S6-1/S6-1b completion evidence.

### 9.4 What this pass did and did not do

| Done (IRR repository, PR #622 branch) | Not done (requires the owner's host) |
|---|---|
| F-1 decision recorded here, runbook §15.6, roadmap §C.14, tracker §16.318 | installing the policy at `C:\iips-data\…` |
| approved policy text recorded verbatim; sandbox parse check (§9.2) | the §15.3 demonstration dry run on the host |
| host protocol written out (§9.3), including the inspect-before-write rule | the §15.6 dry run against a real holding |
| no code, no scoring/verb/chain logic, no IPD / IPO Screening Engine, no policy file in the repo | the recording run and the `UNCHANGED` repeat |

The sandbox that wrote this record has no access to the owner's Windows file system, portfolio store, NP-04 store or
IPC endpoint, and cannot install the pinned IPD packages; therefore **none of steps 0–5 was executed**, no holding was
tested, and **S6-1 and S6-1b remain NOT COMPLETE**. Completion is declared only when the owner's three reports show
`OPERATOR_CONFIG` / `limits-policy/2026-11`, `RECORDED`, then `UNCHANGED` with `versionCount 1` (and, if checked,
`limits.digest` `bf8dd114…` on the stored disposition).

## 10. Host verification evidence (operator-reported, 2026-11-22) — S6-1 acceptance MET; S6-1b recording verified, then COMPLETE on the identical repeat (§10.6)

**Provenance.** The owner executed §9.3 on the Windows host (`C:\tmp\iips-review-recovered` at `main@e5245b28` = the
PR #622 merge commit, delivered through the owner's own controlled fetch / fast-forward / build; data root
`C:\iips-data`; `IIPS_LOCAL_PERSONAL_USE=1`) and reported the CLI summary and an independent read-only API readback.
Everything in this section is **operator-reported** and reproduced here in sanitised form; nothing was executed from
the sandbox that wrote it. Main CI at `e5245b28`: all three workflows green.

### 10.1 What was reported

| Step (§9.3) | Reported | Result |
|---|---|---|
| 0 inspect existing policy | `C:\iips-data\investment\policies\limits-policy.json` already present with exactly the §9.2 text (owner-approved) | no write needed; not modified |
| 1 install | not applicable (already present) | — |
| 2 §15.3 loader check | subsumed by step 3 (the real-holding run loaded the file) | `OPERATOR_FILE` |
| 3 `--dry-run` on one real holding | `DHAN_PORTFOLIO`, holding #30 `INFY` / `INE009A01021`, 65 active holdings, weight 2.2868 %; nothing persisted | `DRY_RUN` |
| 4 recording run (owner explicitly authorised persistence) | `RECORDED … persistence CREATED wrote=true head=58f669f8-6027-43ec-89f8-2aa6ce8994b7 v1 chain=hd:DHAN_PORTFOLIO/IN:ISIN:INE009A01021 versions=1` | `RECORDED` / `CREATED` |
| 5 identical repeat ⇒ `UNCHANGED` | reported later the same day — see §10.6 | `UNCHANGED` / `CLOCK_ONLY_UNCHANGED`, `wrote=false` |
| independent readback | `GET /api/investment/portfolio/DHAN_PORTFOLIO/dispositions` (read-only script; no write): HTTP PASS, record identity PASS, holding chain PASS, disposition PASS, operator policy PASS; full 595-line JSON reviewed | PASS |

### 10.2 Readback facts (sanitised)

| Field | Value |
|---|---|
| `reportType` / `scopeToken` | `investment.holding-disposition` / `hd:DHAN_PORTFOLIO/IN:ISIN:INE009A01021` |
| `chainRootReportId` = `reportId` | `58f669f8-6027-43ec-89f8-2aa6ce8994b7`, `artifactVersion 1`, `supersedesReportId null`, `versionCount 1` |
| report key / payload / input / substantive / substantive-input digests | `e5447d52…0945` / `a17c7e9b…609f` / `0567931a…5a1e` / `e82a22b9…78ed` / `70961cf5…39f3`; grammar `disposition-substantive-identity/1`, source `RECORDED` |
| identity | `IN:CIN:L85110KA1981PLC013115` / `IN:ISIN:INE009A01021` `[ISIN]`, `securityState ACTIVE`, roster `OPERATOR_SUPPLIED` |
| assessment cited | `6b6e2316-d958-4187-9700-c47984a9a10a` v1, adequacy `SUFFICIENT`, quality `MATERIAL_CONCERNS`, moat `INSUFFICIENT_EVIDENCE`, `datasetClass OPERATOR_SUPPLIED`, `dataAsOf 2024-03-31`, `knownAsOf 2026-11-14`, `generatedAt 2026-11-15` |
| disposition | `AVOID`, confidence 0.321, `capsApplied []`, horizon `SHORT_TERM`, `impliedTargetWeightBand null`, `previous none`, `hardTrigger false`; gates G-1 PASS, G-2 PASS, G-3 PASS, G-4 **SKIP**, G-5 PASS, G-6 PASS; `modelVersion disposition-engine/1.0.0`, `policyVersion disposition-policy/1.0.0`, `generatedAt 2026-11-22T18:56:05.602Z`, evidence 9, limitations 25 |
| **limits** | `basis OPERATOR_CONFIG`, `policyVersion limits-policy/2026-11`, `effectiveFrom 2026-11-01T00:00:00.000Z`, `singleNameMaxPct 8`, `defaultSectorMaxPct 25`, `sectorMaxPct { DEFAULT 25, Technology 20 }`, **digest `bf8dd114299e34a91a102b8577a2a988cbc2dddd5762bf02f5320eaa42bebc7c`** (= §9.2 sandbox digest) |
| `limits.applied` | `SINGLE_NAME_MAX` cap 8 / measured 2.29 / projected 2.86 / breached false; `SECTOR_MAX` (`Technology`) cap 20 / measured 2.29 / projected 2.86 / breached false — both `OPERATOR_CONFIG` |
| portfolio context | `holdingsMeasured 65`, `holdingsUnresolved 0`, `holdingsOutOfScope 0`, `measuredWeightPct 100`, `unmeasuredWeightPct 0`, `portfolioRevision 4`; **sector references cover 2.29 % of 100 % measured weight** |
| safeguards | `interpretation.noExecutionPath true`; `decisionSupportOnly true`; `noTradeExecution true`; `nonProduction true`; "not an instruction" texts present at disposition and top level |

### 10.3 Reconciliation against the acceptance texts

| Requirement | Source | Evidence | Verdict |
|---|---|---|---|
| A disposition computed after the policy is in place reports `limits.basis = OPERATOR_CONFIG` with the owner's `policyVersion` | Stage 5 decision record §4.2 (S6-1 acceptance) | readback `OPERATOR_CONFIG` / `limits-policy/2026-11` / digest `bf8dd114…` | **MET** |
| The caps named in `limits.applied` are the owner's | same | `SINGLE_NAME_MAX` 8 %, `SECTOR_MAX` Technology 20 % | **MET** |
| An invalid file produces `policy_inputs_unavailable`, never silent defaults | same | CI tests (`limitsPolicySource.test.ts`, `holdingDisposition.test.ts` `POLICY_INVALID` case) on `main@e5245b28`; **not re-demonstrated on the host** (no reason to break the owner's file) | MET by test; host demonstration optional |
| Evidence: one disposition record or readback showing `OPERATOR_CONFIG` and the version, host artefact published sanitised | same | §10.2 | **MET** |
| **S6-1 — Operator limits policy (L-019)** | roadmap §C.11 / decision record §4.2 | all four rows above | **COMPLETE** (operator-reported, independently read back) |
| S6-1b: `--dry-run` on a real holding shows real issuer, real assessment head, expected `limits.basis` | this record §8.5 / runbook §15.6 | step 3 | **MET** |
| S6-1b: recording run writes one version on `hd:<portfolio>/<security>` through the existing record path | §8.5 / §15.6 | step 4: `CREATED`, v1, `versionCount 1`; readback confirms chain root = report | **MET** |
| S6-1b: a second identical run reports `UNCHANGED` and writes nothing | §8.5 / §9.3 step 5 / §15.6 | §10.6: status `UNCHANGED`, persistence `CLOCK_ONLY_UNCHANGED wrote=false`, head `58f669f8…` v1 unchanged, `versions=1` | **MET** |
| F-1 FAIL CLOSED remains in force | §9.1 | `previous none` — no drift possible on a first version; protection untested on the host and not expected to fire while the policy is unchanged | n/a (in force) |
| **S6-1b — real-holding disposition generation** | §8.6 / §9.4 completion standard ("three reports") | all three reports in hand (dry run §10.1 step 3; recording §10.1 step 4 + readback §10.2; repeat §10.6) | **COMPLETE** (see §10.6) |

### 10.4 Limitations that stay visible (the demonstration does not generalise)

1. **One holding of 65.** `DHAN_PORTFOLIO` has 65 active holdings; one disposition chain exists. Nothing here says the
   other 64 holdings are rostered, assessable or dispositioned.
2. **Sector coverage is 2.29 % of weight.** Only the subject carries a sector reference, so the `Technology` cap was
   measured against INFY alone, and `DEFAULT` was never exercised. The sector cap becomes meaningful only as more
   holdings are rostered with a canonical sector (gap assessment §2; S6-3 widens the population).
3. **Data age.** The cited assessment is `OPERATOR_SUPPLIED`, `dataAsOf 2024-03-31`, quality `MATERIAL_CONCERNS`,
   G-4 valuation `SKIP`, confidence 0.321. The `AVOID` verb is the engine's reading of that evidence; a genuinely
   newer assessment version (S6-4) is the designed route to a different reading. `SUFFICIENT` describes adequacy of
   coverage, not currency.
4. **AVOID is not an instruction.** The stored definition and `noExecutionPath true` say so; this record repeats it.
5. **Not evidenced yet for Stage 6 acceptance:** a quarter of review notes referencing ≥ 2 assessment versions per
   holding; a persisted comparison with content; L-023 citation resolution checked on this record's `rationale[]`
   (the readback summary did not report it).

### 10.5 Status after §10

| Item | Status |
|---|---|
| S6-1 operator limits policy (L-019) | **COMPLETE** — acceptance of decision record §4.2 met by host readback; register L-019 status change proposed in register §17.32 |
| S6-1b real-holding disposition generation | **COMPLETE** (2026-11-22) — dry run, recording run, independent readback and identical repeat (`UNCHANGED`, `wrote=false`, no duplicate version) all evidenced on the host; §10.6 |
| F-1 | decided FAIL CLOSED (§9.1); unchanged |
| Stage 6 | IN PROGRESS — S6-2…S6-5 untouched |
| Next roadmap item | **S6-2 — review cadence**: decided by the owner 2026-11-22 as WEEKLY / FRIDAY and recorded in `IID-STAGE-6-S6-2-REVIEW-CADENCE-OWNER-DECISION-2026-11-22.md` (roadmap §C.16) |

### 10.6 Step 5 reported — identical repeat, no write (operator-reported, 2026-11-22) ⇒ S6-1b COMPLETE

The owner ran the identical command again (no `--dry-run`, unchanged inputs). Exact output:

```text
UNCHANGED holding   DHAN_PORTFOLIO #30 INFY (INE009A01021) weight 2.2868437030765802%
          identity  IN:CIN:L85110KA1981PLC013115 / IN:ISIN:INE009A01021 [ISIN] securityState=ACTIVE roster=OPERATOR_SUPPLIED
          assessment 6b6e2316-d958-4187-9700-c47984a9a10a v1 (1 version(s)) adequacy=SUFFICIENT dataset=OPERATOR_SUPPLIED
          limits    basis=OPERATOR_CONFIG policyVersion=limits-policy/2026-11 source=OPERATOR_FILE singleName=8% sectorDefault=25%
          disposition verb=AVOID caps=0 previous=AVOID hardTrigger=false
          persistence CLOCK_ONLY_UNCHANGED wrote=false head=58f669f8-6027-43ec-89f8-2aa6ce8994b7 v1 chain=hd:DHAN_PORTFOLIO/IN:ISIN:INE009A01021 versions=1
```

**Reading of the output against the standard.**

| Claim | Where it is in the output | Standard |
|---|---|---|
| Initial persistence created version 1 | §10.1 step 4: `persistence CREATED wrote=true … v1 … versions=1` | §8.5 "recording run" |
| Independent API readback verified the persisted record | §10.2 (`chainRootReportId` = `reportId` = `58f669f8…`, `versionCount 1`) | §8.5 "`GET …/holding/<securityId>` serves it" (served via the portfolio `/dispositions` read) |
| Identical repeat returned `UNCHANGED` | first token `UNCHANGED`; `previous=AVOID`, `hardTrigger=false` | §8.5 / §9.3 step 5 / runbook §15.6 |
| Persistence reported `wrote=false` | `persistence CLOCK_ONLY_UNCHANGED wrote=false` — `CLOCK_ONLY_UNCHANGED` is the outcome runbook §15.6 names for "identity is substantive, not clock-based": only `generatedAt` differed | runbook §15.6 (`UNCHANGED` / `CLOCK_ONLY_UNCHANGED`, `wrote:false`) |
| Chain head remained unchanged | `head=58f669f8-6027-43ec-89f8-2aa6ce8994b7 v1` — same id and version as §10.1 step 4 | §9.3 step 5 "same headReportId" |
| Version count remained 1; no duplicate version | `versions=1` | §9.3 step 5 "versionCount still 1" |
| Limits still the owner's | `basis=OPERATOR_CONFIG policyVersion=limits-policy/2026-11 source=OPERATOR_FILE singleName=8% sectorDefault=25%` | decision record §4.2 |
| F-1 | no drift (same basis/version as the head) ⇒ protection not triggered, as expected | §9.1 |

**Determination.** Every limb of the completion standard this record set for itself (§8.5, §9.3 steps 3–5, §9.4 "three
reports", runbook §15.6) is now evidenced by a host artefact or host output: **S6-1b is COMPLETE** as of 2026-11-22.
Nothing on the host was altered by this determination and no further persistence operation was run. **S6-1** was
already COMPLETE on the recording-run readback (§10.3); the two statuses are distinct and both are now complete.

**What "complete" covers and what it does not.** It covers the capability: one real holding can be dispositioned under
the owner's policy, persisted once, read back independently, and re-run without duplication. It does **not** cover the
other 64 holdings, the sector-coverage limitation (§10.4 item 2), the data-age limitation (§10.4 item 3), or any Stage
6 acceptance item (§10.4 item 5). Stage 6 stays OPEN.
