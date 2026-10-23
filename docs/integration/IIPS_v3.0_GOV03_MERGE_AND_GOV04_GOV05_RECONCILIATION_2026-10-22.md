# IIPS v3.0 — GOV-03 merge receipt, GOV-04 verified readiness, GOV-05 prerequisite reconciliation

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-GOV03-MERGE-AND-GOV04-GOV05-RECONCILIATION-2026-10-22-01` |
| **Correction identifier** | `CV-CORR-64` (tracker §16.82; `CHG-2026-10-22-18`) |
| **Date** | `2026-10-22` (UTC) |
| **Capacity** | Independent review with executed verification, plus bounded, in-scope corrections. **No Program Authority decision is rendered.** No Gate 4/5 action, no write authorization, no `durable: true` claim, no `503` fence lift, no historical-lineage promotion. |
| **IPD base of record at pass start** | `1cceacfff40f22dbc9cd64906bf26a5feac1075e` (tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`) |
| **IPD `main` at pass end** | **`73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`** (tree `66020736919befa5e5320550a396187cd351b40e`) — PR #45 merge |
| **IRR `main` at pass start / end** | `518988965429bd3c5a785a547846600c61a493f5` → **`685a804d2da3f1074af1481ddd86d6a26f04fd75`** (PR #196, unrelated Gate 4 packet corrections, merged during the pass) |
| **Runtime used for every executed check** | Linux sandbox, Node **v22.22.3**, npm 10.9.8, `node:sqlite` experimental warning emitted and expected. **Not** the Gate 4 host, **not** Windows. |

This record supersedes nothing by assertion. It reports what was executed, what was read back from the authoritative remotes, and which decisions remain unrendered.

---

## 1. GOV-03 — PR #45 reviewed, tested, and merged

### 1.1 Identity and ancestry (verified, not inferred)

| Item | Verified value |
|---|---|
| PR | `#45` — `GOV-03: Durable broker-import persistence and guarded test output` (`gov03/durable-broker-import-publication` → `main`) |
| State | **`MERGED`** `2026-10-22T17:13:17Z` by `ramkivs` |
| Head at review | `196a0e8804446efe32a21000bbf9f0a1e44954af` (tree `66020736919befa5e5320550a396187cd351b40e`) |
| Base at review | `1cceacfff40f22dbc9cd64906bf26a5feac1075e` — unchanged during review; head is a single commit whose only parent is the base |
| Diff | **9 paths**, `+1537 / −25` — matches the published file list exactly; no commit appeared during review |
| Merge commit | **`73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`**, parents `1cceacff…` + `196a0e88…`, tree `66020736919befa5e5320550a396187cd351b40e` |
| Post-merge tree | identical to the reviewed head tree; **9/9 path blobs identical** (see §1.4) |

### 1.2 The published head versus the previously recorded candidate

The prior pass could not publish to IPD and recorded the candidate as the IRR artifact `docs/integration/artifacts/q1-broker-import-durability.patch` (tree `3ba52989b1817bb98b56e54a1d300fac77c15c16`). Applying that patch to a pristine `1cceacff…` checkout and committing reproduces **exactly** `3ba52989b1817bb98b56e54a1d300fac77c15c16`; the published head is **one line** further:

```diff
--- a/scripts/run-tests.mjs
+++ b/scripts/run-tests.mjs
@@ -92,7 +92,7 @@
-console.log(`[test-guard] files=${files.length} (source suite files: ${sourceTests.length})`);
+const runnerArgs = ['--test', '--test-reporter=tap', ...files];
```

(blob `fe1ab1a…` → `4a90d935bc74bac03902d43906ddef32e582c7b7`). **No product module and no test changed** relative to the recorded candidate. The change makes the CV-35 executed-test-count guard parse `# tests <n>` deterministically instead of relying on Node's reporter selection by destination type (TTY → `spec`, pipe → `tap`). It **strengthens** the guard; it cannot produce a false green: the guard still fails on zero executed tests, on a missing count line, on a stale build and on missing compiled tests.

Authority for the change: the directive's bounded CI/test-runner correction, exercised here because the evidence supported a safe correction and no required check was weakened. It is non-production test infrastructure; it adds no dependency, no network surface and no application behaviour.

### 1.3 Review findings against the accepted GOV-03 scope

| # | Review question | Finding | Disposition |
|---|---|---|---|
| 1 | Governed identity and ownership | `evaluateBrokerImportIdentityGate` refuses the **whole** request with per-holding evidence when any holding lacks exactly one canonical resolution; refuses `NON_PRODUCTION_OPERATOR_BYPASS`; refuses `UNRESOLVED` carrying a non-empty `companyId` as `IDENTITY_FABRICATED`; never invents an identity. Owner is caller-supplied from IPD's own binding resolution, never from the import. | **Accept** |
| 2 | Durable persistence + contribution tracking | `portfolio_contributions` is now written once per committed import (keyed by the import content digest) and read back through `PortfolioDetail.contributions`; `DurablePortfolioStorePort` exposes the read. | **Accept** |
| 3 | Duplicate-import idempotency and revision preservation | The W-8/BI-08 duplicate check reads the **whole** contribution ledger, so a re-import of an **earlier** file is `ALREADY_IMPORTED_NO_OP` rather than a second application; `REPLACE`/`RESET` start a new contribution set without deleting revisions (W-10). Verified by test, not by inspection alone. | **Accept** |
| 4 | Portfolio IPC read-response contract conformance | Read results are now the contract v1 §6 result **itself** (`PortfolioSummary[]`, `PortfolioDetail`, `RevisionEntry[]`) and the revision timestamp is `committedAt`. Verified source-of-truth: contract v1 §6 table (`evidence/cross-repository/IIPS_V3_G2_IPD_IRR_PORTFOLIO_CONSUMER_CONTRACT_V1_2026-10-18.md`). The pre-existing wrappers and `createdAt` were genuine departures. | **Accept** |
| 5 | Fail-closed when the ownership binding is missing/unresolved | Unchanged: `resolveActiveBinding` absence → Class P `BINDING_ABSENT`, zero bytes; the read/write surface cannot be reached without a resolved binding. Re-verified over a real socket in this pass. | **Accept** |
| 6 | TAP output and the CV-35 guard | See §1.2. Guard exercised locally (`[test-guard] OK — 802 test(s) executed, 801 passed, exit 0`) and in CI (`executed test count` = 802 executed / 801 passed / 0 failed at the head commit). | **Accept** |
| 7 | Protected HTTP 503 routes and write authority | IPD serves no HTTP surface. The IRR fences are byte-identical to the row-34 record (§2.4) and no IRR file in the GOV-03 scope changed. `evaluatePortSaveGuard()` still returns `authorized: false` unconditionally and IPC writes still return `WRITE_NOT_AUTHORIZED` **before** any mutation. `DurablePortfolioStorePort.durability = 'DURABLE'` is a pre-existing in-process type property, unchanged by this candidate and **not** surfaced on the wire. | **Accept** |
| 8 | Contract completeness of `PortfolioDetail` | Contract v1 §6 lists `durability`/`durable` as detail fields. They are **absent** and the conformance suite asserts their absence, so the omission is visible rather than mistaken for conformance. Fabricating `durable: true` is forbidden by the standing boundary and a `durable: false` would be a false statement about a SQLite-backed store. This is a **PA decision item**, not a defect to be fixed by the implementer (§3.3, DR-3). | **Recorded, not fixed** |
| 9 | Contribution projection completeness | `PortfolioContribution` carries `contributionId`, `amount`, `contributedAt`, `createdAt`. The frozen IRR `G2Contribution` requires `sourceBroker`, `fileName`, `contentDigest`, `lineageDigest`, `importedAt`, `holdingsCount`, `totalMarketValue`. The fixed migration set has no columns for the missing attribution. This is the **migration 004 act** already recorded as outstanding (§3.3, DR-4). | **Recorded, already tracked** |
| 10 | Import into a **tombstoned** portfolio id (new observation) | Executed probe at the merged tree: `create` → `delete` → re-import of the same id returns `{"ok":false,"code":"INVALID_REQUEST","message":"portfolio already exists: P-TOMB","storeEffect":"NONE"}` with **zero row delta** (`portfolios=1 portfolio_revisions=2 portfolio_holdings=1 portfolio_contributions=1` before and after) and **no resurrection**; an import into a **never-existing** id creates a portfolio (`SAVED_NEW_BATCH`). So a tombstoned id is **distinguishable** from a missing id on this path, whereas the read path deliberately folds missing/foreign/tombstoned together (`ResourceUnavailableError`). Severity: **nil today** — no module under `src/` imports `brokerImportPersistence.ts` (only the test suite does), so the path has no product exposure; no driver internals leak. | **Recorded as a Gate 4 `QE-3` follow-up; no semantic change made** |

Nothing in items 1–10 blocks a bounded implementation merge, and none of them converts this merge into a qualification, an acceptance, an admission or a capability claim.

### 1.4 Independent executed checks (this pass)

| Check | Result |
|---|---|
| `npx tsc --noEmit` at the reviewed head | exit **0** |
| `npm run build` (tsc emit + vite bundle) | exit **0** |
| `npm test` (guarded runner) | **802 executed / 801 passed / 0 failed / 1 skipped** — reproduces the reported run exactly |
| Baseline reconciliation | CI-published baseline at `1cceacff…` = **784** (`executed test count` check summary read from the API); delta **+18** = the three new suites (**11 + 4 + 3 = 18**, measured directly with `node --test` on the compiled suites) ⇒ **no test was dropped, skipped or silently weakened** |
| Read `g3_portfolio_read_isolation` edit | the two changed assertions remove the wrapper expectation only; owner-isolation semantics (single owner's portfolios, mutual indistinguishability of foreign/missing) are unchanged and still asserted |
| 9/9 blob equality between the merge commit and the reviewed head | `4a90d935…` run-tests, `27becc76…` dispatch, `59bb09eb…` brokerImportPersistence, `2bba27f4…` durablePortfolioStorePort, `c48479db…` portfolio_store, `69e36f68…` g3 read isolation, `22981dec…` durability suite, `a0b65ff4…` conformance suite, `755ee1a2…` ownership-readiness suite — **9/9 MATCH** |

### 1.5 CI state, including one GitHub-side anomaly

| Item | Value |
|---|---|
| PR-head CI run | **`39818708637`** (event `pull_request`, head `196a0e8…`) — workflow conclusion **`success`**, all **9** job steps `completed / success` (checkout, setup, `npm ci`, typecheck, build, guarded test, publish count, post-steps) |
| `executed test count` check run at the head | **`completed / success`** — *"802 tests executed — 801 passed, 0 failed. Guard: a run that executes zero tests fails (CV-35). Head: `196a0e8…`"* |
| Check-suite object | **`completed / success`** (`107920552899`, app `github-actions`) |
| **Anomaly** | the **job-level** check run `typecheck · build · test` stayed `in_progress` with `completed_at: null` for the whole review window while its own run, suite and every step reported `completed / success`. Re-polled repeatedly (16:59 → 17:12 UTC); it never finalized. |
| Recovery attempts (all denied to this installation, none worked around) | `gh run rerun 39818708637` → *"cannot be rerun; its workflow file may be broken"*; `POST …/actions/runs/39818708637/rerun` → `403`; `…/rerun-failed-jobs` → `403`; `gh workflow run ci.yml --ref gov03/…` → `403`; `POST …/check-suites/107920552899/rerequest` → `403`. **No check was marked complete by hand.** |
| Merge-gate reasoning (recorded explicitly) | at the decision point GitHub reported `mergeable: MERGEABLE`, `mergeStateStatus: UNSTABLE` — **not `BLOCKED`**. Per GitHub's own semantics `UNSTABLE` means checks that are *not required* are pending/failing; an unsatisfied **required** check yields `BLOCKED`. Branch-protection configuration is **not readable** by this installation (`GET …/branches/main/protection` and `…/required_status_checks` → `403 Resource not accessible by integration`; `GET …/rulesets` → `[]`). The merge therefore proceeded on: run-level `success`, step-level `success`, suite-level `success`, the executed-test-count check `success` at the exact head, an independent local reproduction of the full gate, and GitHub's own non-blocked mergeability. |
| Post-merge verification (the decisive evidence for the anomaly) | `main` push CI run **`39820730894`** at `73fd8c16…` — workflow `completed / success`; at that commit **both** check runs are `completed / success`, and `executed test count` = *"802 tests executed — 801 passed, 0 failed. Head: `73fd8c16…`"*. The stuck object was a reporting fault, and the same gate completes normally at the merge commit. |

### 1.6 What the merge is — and is not

**Is:** landing of a bounded implementation on IPD `main`, reviewed and independently re-executed, with the tests, guard and write refusal intact.

**Is not, and is not to be cited as:** Gate 4 qualification; a Gate 4 result acceptance; Gate 5 admission; authorization for production portfolio writes; proof of a real-process durable restart round trip on the deployment host; proof of end-to-end broker-import idempotency across a restart **and** the real IPC/HTTP boundary; or permission to claim `durable: true`. Gate E W-1(3)/W-1(4) remain false and every write still refuses with zero store effect.

---

## 2. GOV-04 — verified operational readiness

### 2.1 The approved Gate A′ act does not match the current provisioning basis (re-verified, exact blobs)

| Item | Gate A′ act pin (ref `gate-a/local-principal-enablement-2026-10-16` = `2ded0e981407b38c73bdea164153f53856aa7217`, tree `9069045d3daf22156020188696fc2f9c2f32bf27`) | Current IPD `main@73fd8c16…` |
|---|---|---|
| Migration `003` | `9ba884acc3c554c839a32ca41d0d16bda7e64690` — **present at the pinned ref, exact match** | `32b125bf962bb76a6ae59d3b262203dbbb988197` — **different** |
| Provisioner | `src/gate_a/provision.ts` = `b6f780f63278d333fd38c66e1abd2f3b64dcc2ea` | no `src/gate_a/`; the only provisioner is `src/persistence/provisioning.ts` = `dc844189a1c92f00acc3d7572c22f3e28e138eb6` |
| Validator | `src/gate_a/validate.ts` = `550b9f4b83983d5d57aa29f565f371e5bcbed430` | no equivalent under `src/gate_a/` |
| Binding service | `710a47e2…` at the pinned ref | `src/persistence/binding.ts`, different module |

**Determination:** the Gate A′ act is *valid for its own pinned artifact* and **inapplicable to the current IPD baseline**. The act's own "no substitution" rule forbids running the current module under it, transplanting its schema, or minting its private brand. Executing the old act **because it was previously approved** would be an unauthorized substitution. → **DR-1**.

### 2.2 Operational status of the designated ownership source

| Assertion | Evidence class | Result |
|---|---|---|
| A fresh store has no `ACTIVE` binding and no `ACTIVE` membership | executed (`q1_ownership_source_readiness`, this pass) | **NOT OPERATIONAL** |
| The **real** `startIpcServer` endpoint answers `portfolio.list` with **zero bytes** when the binding is absent | executed, real AF_UNIX socket | **Class P / `BINDING_ABSENT`** |
| `provisioning.ts` is unreachable from every module under `src/` and its brand cannot be forged | executed (importer census over `src/**` = `[]`; forged act throws `ProvisioningNotAuthorizedError`, zero rows written) | **fail-closed, unforgeable** |
| IRR's precondition defaults to `false`; owner context `NOT_ESTABLISHED`; the adapter fails closed before any upstream call | source + suite | **fail-closed by default** |
| A valid fixture binding makes the same real endpoint serve a live read | executed (fixture rows written directly, labelled as fixture) | **mechanism live; no operational principal exists** |
| All `/api/user-portfolios*` route-method pairs still `503`; the boundary never constructs the port | executed (`fenceUnchanged` 26 + `user-portfolio-transport` 3 + `ownerContextFromBinding` 15 = **44/44**) | **fence intact** |

**Fixture discipline:** the readiness suite and the cross-repository probe write `local_principal_bindings` / `local_principal_memberships` rows directly into a **disposable temporary store** and delete it in `finally`. That is a *controlled non-production fixture*; it is **not** provisioning, **not** an activation, and **not** evidence of an operational principal.

### 2.3 Cross-repository probe re-run at the merged IPD `main`

Executed from IRR with the real IRR client and the real `IpcUserPortfolioPort` against a built checkout of `73fd8c16…` (`gov04-cross-repository-read-probe.mjs`, mode `candidate`):

```
{ "mode": "candidate", "result": "PASS", "operationalBinding": false, "qualified": false,
  "realSocketFixtureRead": true, "contextSwitchIsolation": true,
  "refusals": [
    {"method":"listPortfolios",   "message":"… portfolio.list result does not supply weightSumPercentage, provenanceDigest, isSaved …"},
    {"method":"getPortfolio",     "message":"… portfolio view result does not supply isSaved …"},
    {"method":"revisionHistory",  "message":"… portfolio.revisions result does not supply totalMarketValue, provenanceDigest, holdingsCount …"}]}
```

Owner-context switching isolates A from B; a revoked binding yields Class P with zero bytes. The **wire shape is no longer the obstacle**; the residual gap is exactly the frozen-type difference in §2.5.

### 2.4 Fences and frozen surfaces (byte-identical)

`reports-transport.ts` `981470541812a64c733309f1debec75455d85bee`; `user-portfolio-transport.ts` `51704c12a467cd2f718a030b5036bc55c9afa73f`; `owner-context-unavailable.ts` `cb8db45d668d28cee7e0a52721001d579a872733`; `userPortfolioContract.ts` `e6b57bb8a021d8eb4b9b7572d12affc7de66be0b` — **all unchanged** during this pass.

### 2.5 Correction — the v1→G2 gap includes property **renames**, not only missing fields

A prior pass (`d93260ef…`, merged as PR #199) emptied `V1_TO_G2_ENVELOPE_GAP.renamedInV1` on the stated premise that *"accepted v1 §6 actually uses `holdingsCount` and `committedAt`, the same as G2"*. **That premise is false for the IRR side**, and the correction is withdrawn here with the evidence:

| Frozen IRR type (source of truth) | Field | v1 §6 spelling | Delta |
|---|---|---|---|
| `G2PortfolioSummary` (`userPortfolioContract.ts` line 296) | `totalHoldingsCount` (line 301) | `holdingsCount` | **rename** |
| `G2PortfolioView` (line 249) | `totalHoldingsCount` (line 255) | `holdingsCount` | **rename** |
| `G2RevisionEntry` (line 309) | `createdAt` (line 315) | `committedAt` | **rename** |
| `G2PortfolioSummary` | `weightSumPercentage`, `provenanceDigest`, `isSaved` | absent | missing ×3 |
| `G2RevisionEntry` | `totalMarketValue`, `provenanceDigest`, `holdingsCount` | absent | missing ×3 |
| `G2PortfolioView` | `isSaved` | absent | missing ×1 |

So the gap is **7 missing fields + 3 property renames (2 distinct v1 properties)** — *not* additive-only. Restored values: summary `{holdingsCount → totalHoldingsCount}`, view `{holdingsCount → totalHoldingsCount}`, revisionEntry `{committedAt → createdAt}`.

**Scope of the correction:** `V1_TO_G2_ENVELOPE_GAP` is exported diagnostic metadata; it is **not** read by any refusal path, message template, wire serializer or HTTP route. The refusal behaviour (`UPSTREAM_UNAVAILABLE`, named missing fields, no fabrication) is unchanged. Verified: `npx tsc --noEmit` exit 0; `ipcPortAdapter.test.ts` **46/46**; full `npm test` **87 files / 1,077 passed / 0 failed**; `npm run build` exit 0; fence/transport/owner-context suites **44/44**.

**Consequence for the decision:** because two G2-required properties are spelled differently rather than absent, a purely additive IPD contract revision cannot close the gap on its own — an explicit mapping authorisation is also required. → **DR-2**.

---

## 3. Decisions requested (none rendered here)

### DR-1 — Provisioning basis for current G3 (blocking GOV-04)
**Question:** may the approved Gate A′ act be used to provision the **current** IPD G3 schema/tool, or must a successor act be rendered?
**Evidence:** §2.1 (four pinned blobs; three differ from `main`, one has no counterpart).
**Alternatives:** (a) retain Gate A′ strictly for its historical store and separately authorize a named, verified compatibility path to current G3 — creates a second store and an unauthorized bridge risk; (b) **issue a bounded successor provisioning act naming the exact current IPD commit/tree/tool/schema blobs**, explicitly superseding the old execution basis, and authorizing the minimal issuer entry point needed to make the current unreachable mutator executable. **Recommended: (b).**
**Consequences of (b):** the private brand stays private, the executor/host/path/row-cardinality/audit/rollback rules are re-stated for the current tool, and the old act's single-execution count is untouched.
**Authority:** Program Authority (Ramki). **Blocking:** yes — no operational owner can exist without it.

### DR-2 — Read-contract gap (7 missing fields + 3 renames)
**Question:** how is the frozen `G2*` read shape satisfied — extend the IPD contract v1 result shapes, or authorize an IRR-side mapping?
**Alternatives:** (a) **contract v1 minor revision adding the 7 fields, plus explicit authorisation of an IRR adapter property mapping for the 3 renames** (keeps G2 frozen, keeps one wire version, no duplicate producer fields); (b) add G2-named duplicate fields IPD-side (`totalHoldingsCount`, `createdAt`) — rejected: two names for one value, ambiguity for every future consumer; (c) replace the frozen G2 type family — heaviest, touches UI and HTTP mapping.
**Recommended: (a).** Required contents of the act: each field's source-of-truth and lifecycle semantics (`isSaved` needs a defined INITIAL/save/RESET/tombstone rule — it must not be inferred from revision or non-empty holdings), the absent-vs-null-vs-error policy, read-consistency and historical-revision behaviour, and the permitted producer/adapter/test manifests. Adding producer fields **alone is insufficient**: the adapter refuses unconditionally today, so its gap refusals must be explicitly re-authorized to become validated mappings.
**Authority:** Program Authority. **Blocking:** yes, for any admitted v1 read.

### DR-3 — `durability` / `durable` in `PortfolioDetail`
**Question:** what does v1 emit for these two required detail fields while no durability claim may be made?
**Alternatives:** (a) keep them absent and record the detail result as "ten of twelve v1 detail fields" in every conformance claim (current state, honest, but not literal v1 conformance); (b) authorize a non-claiming literal (`durability: 'DURABLE'`, `durable: false` is **not** acceptable — it is a false statement about a SQLite-backed store); (c) defer to the Gate 4 result-acceptance act and then emit the true values.
**Recommended: (c)** with (a) as the interim, explicitly recorded position. **No `durable: true` may be emitted before the result-acceptance act.**
**Authority:** Program Authority. **Blocking:** no for bounded implementation; yes for a full-conformance claim.

### DR-4 — Contribution schema (migration `004`)
**Question:** add the per-contribution attribution the frozen `G2Contribution` requires (`sourceBroker`, `fileName`, `contentDigest`, `lineageDigest`, `importedAt`, `holdingsCount`, `totalMarketValue`)?
**Evidence:** current projection carries only `contributionId`, `amount`, `contributedAt`, `createdAt`; the fixed migration set has no columns for the rest; the module deliberately does not invent them.
**Alternatives:** (a) authorize migration `004` with those columns and a back-fill rule for existing rows (refuse rather than guess); (b) declare the contribution projection out of Gate 5 read scope. **Recommended: (a)** when the read route is admitted.
**Authority:** Program Authority (Gate 3 act §4.7 requires a separate act for schema changes).

---

## 4. GOV-05 — reference-only lineage reconciled, still blocked

### 4.1 Ref and lineage census (read-only; nothing fetched into any working lineage, merged, cherry-picked or re-pinned)

| Ref | Value | Relation to current `main` |
|---|---|---|
| IPD `refs/heads/main` | `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` | current |
| IRR `refs/heads/main` | `685a804d2da3f1074af1481ddd86d6a26f04fd75` | current (PR #196) |
| IPD tag `iips-pin-g24-6828155e` | annotated tag object `dcdaaa94e8e050ba132a19813d2f22f214dca7d3` → commit `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` | **not an ancestor of IPD `main`** (`git merge-base --is-ancestor` false); reachable only as the tip of `refs/heads/arena/01a0f308-…` |
| IPD tag `iips-pin-np04-2e11fa3b` | tag object `8e91cc70…` → commit `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | **not an ancestor of IPD `main`**; reachable only as the tip of `refs/heads/np04-governed-persistence-windows` |
| IPD `c1b955b4…` | `refs/heads/arena/01a0e6d9-…` tip | branch-only, reference-only |
| IRR `470cc698…` / `5eba01b6…` | present **only** on `origin/arena/a2df3b85-iips-review-recovered` | branch-only, reference-only; unchanged |
| IRR PR **#114** | `OPEN`, `mergeable: CONFLICTING`, head `e331995a94b704e078b27a70a36cbc161311fd09` on `arena/d57c506a-iips-review-recovered` | an unadmitted historical lineage; not a current admission candidate |

**No document or PR was found presenting the G24 or IRR-adapter lineage as a current admission candidate** (targeted census of `docs/integration/*.md` and the tracker for admission-candidacy wording returns no hit; every mention is a prohibition). Row 32 and `CV-52` remain `NOT SATISFIED` / `BLOCKED`.

### 4.2 Prerequisites for the current-main line (status after this pass)

| # | Prerequisite | Status |
|---|---|---|
| 1 | The Q1 residual implementation landed on IPD `main` | **SATISFIED** — merged `73fd8c16…` (this pass). Landing is not qualification. |
| 2 | An **applicable** provisioning authority and its executed evidence on the deployment host | **NOT SATISFIED** — DR-1; host `desktop-no0nhtp` not reachable from this session |
| 3 | An **effective** Gate 4 qualification act (Act ID still `PENDING ASSIGNMENT`) | **NOT SATISFIED** — the packet on `main` is `PROPOSED — NOT EFFECTIVE` |
| 4 | `QE-1`…`QE-11` executed and recorded on the deployment host | **NOT STARTED** — no host execution this pass |
| 5 | A **separate** qualification-result acceptance act | **NOT RENDERED** |
| 6 | Contract decisions: DR-2 (fields + renames), DR-3 (durability), DR-4 (contribution schema) | **NOT RENDERED** |
| 7 | Gate 5 admission act (`CV-52`) naming the qualified commits and lifting **named** operations only | **NOT INITIATED** |

---

## 5. Boundaries preserved (explicit)

- **Gate 4:** not executed, not authorized, not started. **Gate 5:** not granted, not initiated. **Result acceptance:** not rendered.
- **No production-write authorization.** Gate E W-1(3)/W-1(4) unchanged; every write still refuses with zero store effect.
- **No `durable: true`** claim anywhere; the two detail fields remain absent and are asserted absent.
- **No historical-lineage promotion** — no rebase, merge, cherry-pick, re-pin or revival of G24, NP-04 or the IRR adapter lineage.
- **No `503` fence lift**; fence and frozen-contract blobs byte-identical.
- **No PA decision fabricated.** DR-1…DR-4 are requests, not determinations.
- The only IRR product file touched in this pass is `frontend/server/user-portfolio/ipcPortAdapter.ts` and its test — diagnostic metadata restoration inside an always-refusing path, with no wire, refusal or HTTP behaviour change.

---

## 6. Executed verification index

| ID | Check | Result |
|---|---|---|
| `V314` | PR #45 head `196a0e88…` / base `1cceacff…` / tree `66020736…` / 9 paths read from the live API; single commit; base unchanged during review | **PASS** |
| `V315` | Published head vs recorded candidate: recorded patch reproduces tree `3ba52989…`; published head differs by exactly one line (`--test-reporter=tap`, blob `fe1ab1a…`→`4a90d93…`) | **PASS** |
| `V316` | IPD `tsc --noEmit` 0; `npm run build` 0; `npm test` **802/801/0/1** at the reviewed head | **PASS** |
| `V317` | Delta reconciliation: CI baseline at `1cceacff…` = 784; new suites measured **11 + 4 + 3 = 18**; 784 + 18 = 802 — no test silently removed or skipped | **PASS** |
| `V318` | PR CI run `39818708637` `completed / success`; `executed test count` `completed / success` (802/801/0) at the head; job-level check run stuck `in_progress` while all 9 steps and the suite were `success` — recorded as a GitHub reporting fault | **PASS (anomaly recorded)** |
| `V319` | Merge gate: `mergeable: MERGEABLE`, `mergeStateStatus: UNSTABLE` (**not `BLOCKED`**); branch-protection read `403`/`[]` recorded rather than assumed | **PASS** |
| `V320` | Merge receipt: merge `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`, parents `1cceacff…`+`196a0e88…`, tree `66020736…`; **9/9** path blobs identical to the reviewed head | **PASS** |
| `V321` | Post-merge `main` push CI run `39820730894` `completed / success` at the merge commit; both check runs `completed / success`; `executed test count` = 802/801/0 | **PASS** |
| `V322` | Gate A′ basis: pinned ref `2ded0e98…` / tree `9069045d…`; `src/gate_a/provision.ts` `b6f780f6…`, `src/gate_a/validate.ts` `550b9f4b…`, migration `003` `9ba884ac…` all match the act; current `main` migration `003` = `32b125bf…`, `provisioning.ts` = `dc844189…`, no `src/gate_a/` ⇒ **inapplicable to current baseline** | **PASS** |
| `V323` | Designated ownership source not operational at the merged tree: 0 bindings / 0 memberships; real endpoint zero bytes; provisioning unreachable and unforgeable; IRR precondition default `false` | **PASS** |
| `V324` | Controlled-fixture positive control: with fixture binding rows the same real endpoint serves a live read; owner-context switch isolates A/B; revoked binding ⇒ Class P zero bytes | **PASS** |
| `V325` | Cross-repository probe at IPD `main@73fd8c16…` (real IRR client + real adapter): `operationalBinding:false`, `qualified:false`, `realSocketFixtureRead:true`, `contextSwitchIsolation:true`, refusals naming exactly **3 / 1 / 3** fields | **PASS** |
| `V326` | Fences byte-identical: `98147054…`, `51704c12…`, `cb8db45d…`; frozen `userPortfolioContract.ts` `e6b57bb8…`; `fenceUnchanged` + transport + owner-context suites **44/44** | **PASS** |
| `V327` | Rename-metadata correction: frozen G2 uses `totalHoldingsCount` (lines 255, 301) and `createdAt` (line 315) where v1 uses `holdingsCount` and `committedAt`; maps restored; **diagnostic only** — no refusal/message/wire dependency | **PASS** |
| `V328` | IRR checks after the correction: `tsc --noEmit` 0; `ipcPortAdapter.test.ts` **46/46**; full `npm test` **87 files / 1,077 passed / 0 failed**; `npm run build` 0 | **PASS** |
| `V329` | GOV-05 census: `6828155e` and `2e11fa3b` **not** ancestors of IPD `main`; `c1b955b4` branch-only; IRR `470cc698` only on `arena/a2df3b85-…`; PR #114 `OPEN`/`CONFLICTING`; no document presents either lineage as a current admission candidate | **PASS** |
| `V330` | Tombstone observation: re-import into a deleted id ⇒ `INVALID_REQUEST` "portfolio already exists", `storeEffect:'NONE'`, row deltas `0/0/0/0`, no resurrection; never-existing id ⇒ `SAVED_NEW_BATCH`; module has no product importer | **PASS (follow-up recorded)** |
| `V331` | Non-grants scan: no Gate 4/5 act, no result acceptance, no write authorization, no `durable:true`, no fence change, no lineage promotion, no PA decision rendered anywhere in this pass's artifacts | **PASS** |

---

## 7. Publication

The coordinates of the PR carrying this record are verifiable in GitHub; they are deliberately not self-embedded. Status after publication: **GOV-03 implementation landed** (`73fd8c16…`), **GOV-04 operationally unproved and blocked on DR-1** (plus DR-2/DR-3 for any admitted read), **GOV-05 blocked and reference-only**.

*Prepared by Arena Agent Mode as an investigation, review and reconciliation record. No Program Authority decision, gate, fence, admission or durability claim is made or implied.*
