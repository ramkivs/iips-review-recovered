# CAP-03 One-Pass PA Decision and IRR Execution Record — 2026-10-25

| Field | Value |
|---|---|
| PA decision record ID | `IIPS-V3-CAP03-DR2-DQ1-PA-DECISION-2026-10-25-01` |
| Additional disposition IDs | `IIPS-V3-CAP03-DR3-DQ2-PA-DISPOSITION-2026-10-25-01`; `IIPS-V3-CAP03-DR4R-DQ3-PA-DISPOSITION-2026-10-25-01`; `IIPS-V3-CAP03-DQ4-FREEZE-H12-PA-DISPOSITION-2026-10-25-01`; `IIPS-V3-CAP03-DQ5-HOST-LOGISTICS-PA-CONFIRMATION-2026-10-25-01` |
| IRR execution record ID | `IIPS-V3-CAP03-DR2-DQ1-IRR-EXECUTION-2026-10-25-01` |
| Register reconciliation | `CV-CORR-98`, master tracker §16.117–§16.118; execution `CHG-2026-10-25-22`, post-merge receipt `CHG-2026-10-25-23` |
| Date / authority | `2026-10-25` UTC; the PA's direct one-pass execution instruction under the standing global authorization. No additional approval was requested or inferred. |
| Status | **IPD provider implementation is merged and independently verified at IPD `main@8eec74ae…` (PR #89). IRR PR #265 is now CLOSED / MERGED as `e590ca40d950052e32b2813027f0d1027b9e65ec` (tree `97530e48…`); its exact-head and post-merge CI passed, and consumer/frozen blobs were independently read back. Bilateral DR-2 source/test conformance is published across both loci. DQ-4 final freeze/H-12, host operations, Gate 4/5, and durable-read acceptance remain unperformed.** |

> **Current-state supersession note (`2026-10-25`):** The execution snapshot below was drafted before IPD PR #89 merged and before IRR main advanced through PRs #271/#272. Its then-current IPD blocker, CAP-03 identifier allocation, IRR base/head, test totals, and non-merge receipt remain historical facts from that snapshot. §11 is the verified pre-merge recheck; §12 supersedes its PR-open status with the live PR #265 merge/read-back. The bilateral DR-2 implementation statement in §12 depends on both the independently verified IPD PR #89 publication and IRR PR #265, not on the IRR merge alone.

## 1. Authority, scope, and effectiveness boundary

This record executes the PA's direction to render Option A for DR-2/DQ-1, and to continue through DR-3/DQ-2, DR-4r/DQ-3, DQ-4 sequencing, and DQ-5 host logistics. The proposed packet [`IIPS_v3.0_CAP03_PA_DECISION_PACKET_DQ1-DQ7_PROPOSED_2026-10-24.md`](IIPS_v3.0_CAP03_PA_DECISION_PACKET_DQ1-DQ7_PROPOSED_2026-10-24.md) and the prerequisite register §§5.2–5.5 remain preserved as historical decision inputs; this dated record supplies the PA answers within the stated authority boundary.

This paragraph is retained as the chronology from the original decision-rendering snapshot: PRs #263/#264 advanced IRR `main` to `0cc999ffba424476bace9688ca2f93ab114f0ee5`; PR #266 advanced it to `4e54a9231d2c823aef1930671a6e8f64cde912d7`; and PR #267 published the PR #266 receipt at `53176b73e505cbc75ad23694bbd12482323ae7a3` (its exact checks and tree remain in the historical evidence annex). The phrase “CAP-03 … remains allocated `CV-CORR-96` / §16.114 / `CHG-2026-10-25-17/-18` / `V645`–`V657`” records only that earlier snapshot and is superseded: current IRR main subsequently consumed overlapping identifiers in §§16.114–§16.116. The operative CAP-03 allocation is now `CV-CORR-98` / §§16.117–§16.118 / `CHG-2026-10-25-22/-23` / `V658`–`V670` as recorded in the master tracker. The fixed branch now integrates `main@69e3e7c…`. All CAP-03 route/fence and endpoint statements in this record concern **user-portfolio** routes; Reports transport/proposal/receipt work is separate and not attributed to or changed by this pass.

Effectiveness is locus-specific. The PA decision remains the governing act. The IPD producer is published and independently verified at IPD `main@8eec74ae…` (PR #89); the IRR consumer is now published and independently read back at IRR `main@e590ca40…` (PR #265, §12). Together these receipts establish the PA-approved bilateral DR-2 source/test implementation and conformance evidence. DQ-4 final pin/freeze/H-12 publication remains a distinct later act and is not made effective by either repository's implementation merge.

The implementation boundary is exactly:

- IPD (separate locus): `src/persistence/portfolio_store.ts` and `tests/q1_ipc_read_contract_conformance.test.ts` — changed and merged in IPD PR #89; **not modified by this IRR-bound pass**.
- IRR: `frontend/server/user-portfolio/ipcPortAdapter.ts` and `frontend/server/user-portfolio/ipcPortAdapter.test.ts` — changed as described below.

No migration, G2 type replacement, CAP-03 user-portfolio route change or activation, pin change, read-pair admission, write authorization, `durable:true`, production eligibility, or user-portfolio fence removal is authorized here. PR #263 separately merged Reports transport work onto current IRR `main`; it is outside this CAP-03 pass, is not claimed as CAP-03 work, and is not changed by this pass. The completed CAP-03 host-operations package is not republished, repackaged, or regenerated. DQ-6 and DQ-7 are not answered or altered by this pass.

## 2. DQ-1 / DR-2 — Option A selected

**PA determination:** select Option A: add the seven approved values to the IPD v1 read results and expressly authorize only the three named IRR renames. Preserve all frozen G2 types and all other v1/G2 behavior.

| Frozen G2 shape | Approved provider values | Only permitted rename | Required source and rule |
|---|---|---|---|
| `G2PortfolioSummary` (`portfolio.list`) | `weightSumPercentage`, `provenanceDigest`, `isSaved` | `holdingsCount` → `totalHoldingsCount` | The three values must come from the current revision's stored row/lifecycle. `isSaved` is true exactly when the current revision operation is `MERGE` or `REPLACE`; false for `INITIAL` or `RESET`. |
| `G2PortfolioView` (`portfolio.get`) | `isSaved` | `holdingsCount` → `totalHoldingsCount` | Same current-revision rule. No result is emitted for a missing, foreign, or tombstoned portfolio. |
| `G2RevisionEntry` (`portfolio.revisions`) | `totalMarketValue`, `provenanceDigest`, `holdingsCount` | `committedAt` → `createdAt` | All values must come from that exact historical revision row. Never borrow current-revision values or append `isSaved` to history. |

The seven additions are exactly the three summary values, one view value, and three revision values. The three renames are exactly the two `holdingsCount` projections and the revision timestamp. No other field, alias, default, migration, or type change is admitted. An empty digest is accepted only when the provider supplies that stored string for that row; IRR does not synthesize it.

**Fail-closed semantics:** missing, `null`, non-finite, or otherwise malformed required values fail with the existing upstream-unavailable contract-envelope refusal. Numeric totals/weights must be finite; counts and revisions must be non-negative integers; `isSaved` must be boolean; required strings must be strings, and the mapped revision timestamp must be nonblank. No fallback zero, empty string, inferred lifecycle, or default is constructed. Existing IPD `RESOURCE_UNAVAILABLE` behavior remains the response for missing, foreign, and tombstoned records; IRR emits no portfolio field/object for that refusal (mapped to the frozen G2 `NOT_FOUND` reason).

`isSaved` is copied verbatim from the provider by IRR; IRR does **not** infer it from revision number, holdings, or history. Therefore the lifecycle rule above still requires the IPD producer and its conformance test. Historical values are row-specific and `G2RevisionEntry` remains without `isSaved`.

## 3. DQ-2 / DR-3 — interim durability disposition

**PA determination:** select `(c) + (a)`. `durability` and `durable` remain absent; interim conformance wording is exactly **“ten of twelve detail fields”**; any future true durability value is deferred until the separate result-acceptance act. A `durable:false` sentinel is not used. No `durable:true` value or claim is made.

The IRR adapter does not copy either field; it rejects a view result that unexpectedly contains either unadmitted property. This is a fail-closed consumer guard, not durability evidence or result acceptance. The provider's existing absence remains visible. The distinct P10/result-acceptance act remains unrendered and cannot be inferred from these code tests or any future QE success.

## 4. DQ-3 / DR-4r — first Gate 5 contribution scope

**PA determination:** select Option B. `G2Contribution` projection is **out of scope for the first Gate 5 read admission**. QE-6, if later authorized and executed, is at the store tier for lineage; any contribution mapping is a named follow-up requiring its own decision.

The IRR adapter passes through an actually empty provider `contributions` array, but fails closed on a non-empty array. It neither maps nullable rows, silently omits populated rows, nor manufactures an empty list. This consumer disposition does not admit any read pair or start QE-6.

## 5. DQ-4 — freeze and H-12 sequencing direction; no freeze performed

The PA's sequencing direction is:

1. Do not designate the final IPD QE pin or IRR consumer pin until the authorized DR-2…DR-4r implementation commits have landed in their respective loci. At that later freeze, record the exact commits and trees; no silent re-pin.
2. Preserve the already completed CAP-03 host-operations package exactly as it is. **Do not republish, repackage, regenerate, or adopt H-12 in this pass.** No new H-12 candidate or freeze manifest was produced.
3. The sequencing order is H-12 candidate regeneration at the exact final freeze → S2 → one P-1 provisioning execution → a distinct H-12 adoption act → S3 preflight → QE. This order is recorded as a dependency constraint only; the PA's explicit no-regeneration direction means no H-12 candidate is authorized or generated in this pass, and the chain cannot begin. H-12 adoption remains a separate act and is not implied by a candidate or technical success.
4. Any non-documentary drift after a future freeze is **STOP** and requires PA re-designation; no silent pin movement.

These are recorded as the PA's DQ-4 direction, not as an IPD-locus freeze. The exact final pins cannot be named while the IPD producer half is incomplete; CAP-03's primary package pin (`2d9130e…`) and broker-import alias (`70b24f0…`) remain unchanged and are not treated as final QE pins. The separately merged Reports-only persistence specifier (`iips-np04-governed-persistence#2e11fa3…`) is preserved as current-main ancestry and is outside CAP-03; it is neither a CAP-03 re-pin nor changed here. H-12 remains **NOT ADOPTED**.

## 6. DQ-5 — designated-host logistics confirmed; no host operation

The PA confirms the packet's logistics: designated host `desktop-no0nhtp`; operator-supplied Node `>=22.13.0 <23` (no agent installation or switching); choose the single non-existent P-1 store path only at execution time (do not pre-create or guess it); and consent to the one P-1 provisioning execution under successor-act §8 when its prerequisites are effective and present. This consent authorizes no QE result, H-12 adoption, acceptance, admission, write, or production claim.

No host operation was attempted. The execution environment was Linux x86_64, had neither `pwsh` nor `powershell.exe`, and was not the designated native-Windows host. No native-Windows evidence is claimed or substituted. No host preflight, path designation, P-1 provisioning, S3 preflight, or QE was performed.

## 7. IRR implementation and exact scope

Only these two source paths changed:

1. `frontend/server/user-portfolio/ipcPortAdapter.ts` — implemented the authorized seven values and three renames; validates required values; keeps historical values row-specific; copies current `isSaved` without inference; rejects `durability`/`durable` properties and non-empty `contributions`; preserves existing Class A refusal and route/fence behavior.
2. `frontend/server/user-portfolio/ipcPortAdapter.test.ts` — covers the exact approved matrix, output key sets, stored empty INITIAL digest, current `isSaved` pass-through, per-row INITIAL/MERGE/REPLACE/RESET history, no historical `isSaved`, malformed/missing/null/non-finite values, and refusals for durability/contribution claims.

`frontend/server/user-portfolio/userPortfolioContract.ts` remains frozen and unchanged (starting blob `e6b57bb8a021d8eb4b9b7572d12affc7de66be0b`). Relative to integrated `origin/main@53176b73e505cbc75ad23694bbd12482323ae7a3`, the IPC client, port interface, CAP-03 user-portfolio endpoint/fence, package manifest, lockfile, user-portfolio route, and unrelated modules are unchanged by this pass. PR #263 Reports transport files are present through independently merged mainline ancestry and are outside this two-file CAP-03 diff. CAP-03's primary IPD package pin remains `2d9130e76bb0dc89daeefabaf297e27bdaa84250` (59 commits behind current IPD main, still an ancestor); the broker-import alias remains `70b24f029842a7e9b7f615e4d9df7376fd4ff817` (208 behind, still an ancestor). The separately merged Reports-only persistence alias `iips-np04-governed-persistence#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` is unchanged and outside this pass. No CAP-03 re-pin or dependency change was performed.

### IPD producer blocker at original decision snapshot (superseded by §11)

The read-only IPD source at `4b5c65a731a66a6fa1260146a55df9ed772953a5` / tree `cf5e85856009360de3ffb9614970c383a26d73ba` still has the pre-Option-A result shape:

- `list()` returns only the old summary fields and uses `COALESCE(r.holdings_count, 0)` / `COALESCE(r.total_market_value, 0)`, so a missing joined revision can be fabricated as zero.
- `get()` does not return `isSaved` and defaults missing-row values with `revisionRow?.… ?? 0` / `?? ''`.
- `revisions()` selects only `revision`, `operation`, `created_at`, and `content_digest`; it does not return the three approved stored-row values.
- The current `tests/q1_ipc_read_contract_conformance.test.ts` asserts the old 6-key summary, 10-key detail, and old revision shape. It has not been changed to test Option A or the fail-closed malformed-row cases.

For this evidence only, the current IPD `build:tsc` completed with exit 0 and the **existing old-contract Q1 test** passed 3/3 on Linux. That baseline pass does not implement or prove Option A. An initial direct source-only test invocation failed because the repository test imports compiled `.js` counterparts; the supported compiled run then passed, and both attempts are preserved in the evidence annex. The IPD tracked worktree remained clean at the same commit/tree.

The precise next source action is limited to the two already-authorized IPD files: project the stored current-row values and lifecycle flag without `COALESCE`/null defaults; return each history row's own stored values; preserve unavailable outcomes; and extend Q1 tests for the exact keys, lifecycle, row-specific history, and missing/null/non-finite refusal cases. No schema migration is needed or authorized. This IPD-locus work was not executable on the fixed IRR branch; no other branch was created or used.

## 8. Validation evidence and retained attempts

All output logs are under [`evidence/integration/cap03-dr2-one-pass-2026-10-25/`](../../evidence/integration/cap03-dr2-one-pass-2026-10-25/). The initial pre-advance results and the first integration runs remain historical. `npm ci` was run after integrating `0cc999f`; PRs #266/#267 then advanced current main through documentation/tracker-only changes without changing frontend code, package manifests, or lockfiles. After integrating the final current main `53176b73e505cbc75ad23694bbd12482323ae7a3`, the final focused/full-suite/typecheck/build validation was rerun; final logs carry the `-after-main-53176b` suffix. The `-after-main` and `-after-main-4e54` logs are retained as earlier snapshots.

| Command / check | Result |
|---|---|
| `npm ci` after main integration (committed lockfile; CA workaround environment-only) | exit 0; 190 packages added, 191 audited; npm reported 11 vulnerabilities (6 moderate, 3 high, 2 critical); no audit fix or dependency/pin change (`dependency-setup-after-main.txt` (install at `0cc999f`; manifests/lockfile unchanged through `53176b73`)) |
| Focused `npm test -- server/user-portfolio server/user-portfolio-transport.test.ts` on integrated `main@53176b73` | exit 0; 9 files / 173 tests passed, including adapter 49/49 and fence unchanged 26/26 (`focused-user-portfolio-after-main-53176b.txt`); standalone adapter suite 49/49 (`adapter-test-after-main-53176b.txt`) |
| Full `npm run test:ci` on integrated `main@53176b73` | exit 0; 104 files / 1,321 passed / 0 failed (`full-test-ci-after-main-53176b.txt`) |
| `node .ci/assert-tests.js .vitest-report.json` | exit 0; `OK — 104 test file(s), 1321 test(s), 0 failed` (`test-report-guard-after-main-53176b.txt`) |
| `npm run typecheck` | exit 0 (`typecheck-after-main-53176b.txt`) |
| `npm run typecheck:replay-server` | exit 0 (`typecheck-replay-server-after-main-53176b.txt`) |
| Direct strict TypeScript check of adapter and tests | exit 0 (`direct-strict-tsc-after-main-53176b.txt`) |
| `npm run build` on integrated `main@53176b73` | exit 0; 138 modules; JS chunk `1,590.96 kB` / gzip `222.05 kB`; existing >500 kB chunk warning, no build failure (`build-after-main-53176b.txt`) |
| IPD current-source `npm run build:tsc` (read-only baseline only) | exit 0 |
| IPD current old-contract Q1 conformance test | exit 0; 3/3 passed; not evidence of the new Option-A contract |

The first IRR focused attempt failed because a valid historical fixture had accidentally been placed in the invalid-value table. The fixture was corrected to omit required historical fields; the initial failure and both pre-advance/current-main passing runs are retained. npm's audit findings and build/runtime warnings are reported, not silently “fixed” by changing frozen dependency pins.

## 9. Gates, host, and non-grants remain separate

| Item | State after this pass |
|---|---|
| Gate 4 | **AUTHORIZED — NOT STARTED** |
| QE-1…QE-11 | **0/11 executed**; no QE result accepted |
| H-12 | **NOT ADOPTED**; no regeneration, repackaging, or adoption |
| P-1 / host preflight / S3 | **NOT EXECUTED** |
| Gate 5 / read-pair admission | **NOT INITIATED / NOT ADMITTED** |
| CAP-03 user-portfolio endpoint activation / routes | **None**; user-portfolio 503 fences unchanged. Reports transport is separate merged-main work from PR #263, outside this pass. |
| Writes / `durable:true` / production eligibility | **Not authorized, not claimed, not performed**; no CAP-03 user-portfolio endpoint activation or user-portfolio fence removal |
| Fence removal | **Not authorized or performed** |
| CV/XV count movement | **None**; CAP-03 sub-prerequisite dispositions are recorded in §16.117 without changing global register arithmetic |

Green code tests, typechecks, a build, or the old-contract IPD baseline are not Gate 4 acceptance, QE, H-12 adoption, result acceptance, Gate 5 admission, write authorization, production eligibility, or CAP-03 user-portfolio fence removal. The Reports transport merged by PR #263 is a separate capability and is not evidence of CAP-03 user-portfolio admission.

## 10. Genuine blockers at the original snapshot (superseded where noted by §11)

1. **IPD publication boundary:** the provider and its conformance test are not changed on IPD `main`. This session is bound to the IRR branch and may not create/push an IPD branch. Until the two-file IPD change is implemented and published in the IPD locus, actual reads against the current pinned provider remain fail-closed and DR-2 is not cross-repository closed.
2. **Freeze/H-12:** no final commit/tree pins exist for the post-decision provider implementation. The completed host-operations package is under an explicit no-regeneration constraint; H-12 remains not adopted and no replacement candidate was produced.
3. **Native host:** this Linux sandbox cannot perform or evidence the designated-host preflight/P-1/S3/QE. The only valid execution requires the designated native host and the effective sequencing prerequisites; no Linux result is substituted.

At the original record's publication instant, PR #265 was open and unmerged; that non-merge boundary is historical and is superseded by the current-state recheck below. Exact current head/tree, fresh checks, and any merge receipt must be added only after GitHub read-back; no stale head/check is promoted as current evidence.

## 11. Historical pre-merge cross-repository/current-base recheck (`2026-10-25`; superseded by §12)

This dated update supersedes the old IPD-blocker and old-main snapshot above without rewriting the original PA answers.

### 11.1 IPD producer publication verified; no IPD work repeated

IPD PR #89 is `MERGED` at `79d06e3c5da60da2a234b7ac18c35df848bf9d11` (head `bc144b95649aec88c3bfd0fc2a9c68e828d4839a`); current IPD `main` is `8eec74ae27cda09f3c368b9c299895eae41554db`, tree `4eba29029f8d95cfe483e615a7047426b298ce50`. The source and conformance-test blobs read back from GitHub are `540d49f2deb2c8d600b5b866675d145cf76a1e46` and `eddedd56449d6d0ac27dd394bd2a7262d0cb0c24`, byte-identical to PR #89's merge tree. PR #89 changed exactly the authorized provider/test pair plus its tracker/evidence; it did not change schema/migrations, IPC protocol/routes, package manifests, or workflow. PR #90/#91 are also merged; their checks and the current IPD `main` push CI `40196407747` succeeded. Full remote receipts, the merged test record, and source SHA-256 values are in [`ipd-pr89-current-main-remote-readback.txt`](../../evidence/integration/cap03-dr2-one-pass-2026-10-25/ipd-pr89-current-main-remote-readback.txt).

The merged provider supplies the exact seven PA-approved values from their owning rows, retains v1 wire names, derives current `isSaved` from the stored lifecycle operation (`MERGE`/`REPLACE` true; `INITIAL`/`RESET` false), keeps history row-specific with no `isSaved`, preserves `RESOURCE_UNAVAILABLE` without a result for missing/foreign/tombstoned resources, and fails closed on malformed required values. IPD PR #89's real-endpoint/real-IRR-adapter harness reports **15/15 PASS**. IPD implementation is therefore no longer an outstanding source/test action; this fact is separate from final pin/freeze, Gate 4/5, or operational admission.

### 11.2 IRR current base, validation, and scope

Current IRR `main` is `69e3e7c65082340908e976e9ec0a638b8608dabd` (tree `6379243f40f0e84baa895920228d6558ad2b9fbd`), including PR #271 and #272. The local fixed branch was synchronized to that exact base, preserving its §§16.114–§16.116 tracker records and placing CAP-03 at §16.117. Current-base validation passed: adapter **49/49**; focused user-portfolio **9 files / 173 passed / 0 failed**; full `npm run test:ci` **106 files / 1,349 passed / 0 failed**; report guard **106 / 1,349 / 0**; main typecheck, replay-server typecheck, and strict adapter/test TypeScript check all exit 0; production build exits 0 (142 modules; existing non-fatal >500 kB chunk warning). Exact logs are indexed in the evidence annex with suffix `-after-main-69e3e7`.

The CAP-03 implementation delta remains exactly `frontend/server/user-portfolio/ipcPortAdapter.ts` and `frontend/server/user-portfolio/ipcPortAdapter.test.ts`. Frozen G2 types, IPC client/interface, user-portfolio routes/fences, schema/migrations, package manifests, and lockfile are unchanged. The old CAP-03 allocation collided with current IRR Reports records; the reallocation `CV-CORR-98` / §§16.117–§16.118 / `CHG-2026-10-25-22/-23` / `V658`–`V670` had zero prior hits on IRR `main@69e3e7c…` and IPD `main@8eec74ae…` at the recorded census.

### 11.3 Bilateral status, pins, and non-grants

At this update's pre-merge timestamp, IRR PR #265 is still open; therefore the IRR consumer mapping is not yet effective on IRR `main`, and this record does not claim a completed bilateral publication/read-back. Once the exact PR is merged and its consumer blobs are independently read back alongside the already-merged IPD provider, the two-locus DR-2 implementation/conformance evidence can be reconciled. That must not be described as CAP-03 end-to-end closure or as Gate 5/durable-read admission.

The frozen IRR package/lock inputs still point to IPD primary pin `2d9130e76bb0dc89daeefabaf297e27bdaa84250` (65 commits behind current IPD `main`) and broker-import alias `70b24f029842a7e9b7f615e4d9df7376fd4ff817` (214 behind). They were not re-pinned. This PR is not a DQ-4 final QE freeze; no final pin/freeze manifest or H-12 candidate/adoption is rendered. DQ-3 Option B remains: empty contributions pass, non-empty contributions refuse; no contribution projection, QE-6 lineage, Gate 5 admission, or read pair. Gate 4 remains **AUTHORIZED — NOT STARTED**, QE **0/11**, result acceptance **NOT RENDERED**, Gate 5 **NOT INITIATED / NOT ADMITTED**. The completed host-operations package remains untouched; no host preflight, P-1, S2/S3, provisioning, write, production claim, or user-portfolio fence lift occurred.

This §11 is the time-bounded pre-merge snapshot. The exact live PR head/base, refreshed mergeability and changed-file scope, reviews, exact-head checks, protection evidence, GitHub merge receipt, main tree, and remote blob read-back are now recorded below and in master-tracker §§16.117–§16.118. The prior `c059…` check remains historical and is not evidence for the current base.

## 12. Post-merge publication, exact-head checks, and independent remote read-back (`2026-10-25`)

### 12.1 PR state and merged tree

GitHub reports PR #265 **CLOSED / MERGED** at `2026-10-25T13:47:14Z`. Exact PR head: `00601079e2f29de124d54573b031047b97e9e85d`, tree `97530e48eb6e421d72a1aa3534a7a40c770814ed`; base at merge: `69e3e7c65082340908e976e9ec0a638b8608dabd`. Merge commit: `e590ca40d950052e32b2813027f0d1027b9e65ec`, tree `97530e48eb6e421d72a1aa3534a7a40c770814ed`, parents current base then exact PR head. The verified remote `main` ref resolves to that same merge SHA/tree. The GitHub commit verification object reports `verified=true`.

### 12.2 Current PR scope, exact-head check, and post-merge CI

The GitHub changed-file API/compare reports **65 paths, +4,604 / −95**; exactly two `frontend/` implementation paths are changed: `frontend/server/user-portfolio/ipcPortAdapter.ts` and `frontend/server/user-portfolio/ipcPortAdapter.test.ts`. Remaining paths are decision/tracker/evidence records. No G2 contract/type, migration/schema, route, IPC client/interface, package manifest/lockfile, pin, or production-fence path changed. The refreshed pre-merge API state was `mergeable=true`, `mergeable_state=clean`, with no reviews, no requested reviewers, and no review decision. Repository settings allow merge commits; `/branches/main` reported `protected:false`, rulesets `[]`; the branch-protection endpoint returned 403 to this integration, and no bypass was attempted.

PR-head `Typecheck · Test · Build` run `40199009657`, job `121185964690`, passed at `2026-10-25T13:46:04Z`; post-merge `main` push run `40199212799`, job `121186578312`, passed at `2026-10-25T13:49:06Z` on `e590ca40…`. Both workflow jobs passed lockfile installation, typecheck, strict replay-server import closure, the full Vitest suite, non-zero/pass-count guard, and production build. Local validation on the same tree: adapter 49/49; focused suites 9 files / 173 passed / 0 failed; full suite 106 files / 1,349 passed / 0 failed; report guard 106 / 1,349 / 0; all three TypeScript checks exit 0; build exit 0 (142 modules; existing non-fatal >500 kB warning). Raw output and exact blob hashes are in [`pr265-postmerge-readback.txt`](../../evidence/integration/cap03-dr2-one-pass-2026-10-25/pr265-postmerge-readback.txt) and the adjacent current-base logs.

### 12.3 Independent consumer/frozen-input read-back

GitHub's Git Trees/Blobs API was queried at the merged `main` tree. Adapter/test blobs `1e20e98023f20f80ed61d8d32d070fdde677d3c7` / `46243a7a79ba3b19cd4d2b8a56df8905aba220f8` byte-match local `git show` from `e590ca4`. Frozen G2 contract/types, IPC client, port interface, user-portfolio 503 transport fence, and owner-context refusal fence remain exactly `e6b57bb8…`, `c1b885e3…`, `ba0001e8…`, `51704c12…`, and `cb8db45d…`; package and lockfile blobs are also unchanged. Full sizes and SHA-256 values are in the linked remote-readback record.

### 12.4 Cross-repository DR-2 result; DQ-3/DQ-4 and non-grants

The IPD provider/test half was already merged under PR #89 as `79d06e3c5da60da2a234b7ac18c35df848bf9d11`, and current IPD `main@8eec74ae27cda09f3c368b9c299895eae41554db` retains the independently read-back provider/test blobs. PR #89's real-IRR-adapter/real-IPD-endpoint harness passed 15/15 against earlier IRR head `c059c326c355b80c3224ad861dfecfb93963f112`; an explicit Git-object comparison confirms the adapter source blob used by the harness (`1e20e98023f20f80ed61d8d32d070fdde677d3c7`) is identical to the merged `e590ca40…` adapter blob. The harness remains a pre-merge run, not post-merge execution or operational admission. PR #89 tests/checks plus PRs #90/#91 and current IPD main CI are recorded in the evidence annex. Alongside IRR PR #265's exact merged consumer blobs, the two repository receipts establish that the PA-approved **bilateral DR-2 / Option A source-and-test implementation and contract-conformance evidence is published in both loci**. This conclusion rests on both repositories and the harness; it is not a claim of CAP-03 end-to-end or operational closure.

The DQ-4 implementation-commit prerequisite is now met in both repositories, but no final QE pin/freeze manifest was designated and no package pin was changed. The primary existing IRR IPD pin `2d9130e76bb0dc89daeefabaf297e27bdaa84250` remains 65 commits behind IPD main; broker-import alias `70b24f029842a7e9b7f615e4d9df7376fd4ff817` remains 214 behind. DQ-3 Option B remains unchanged: empty contributions pass, non-empty contributions refuse; no projection, QE-6 lineage, read pair, or Gate 5 admission. DQ-2 remains `(c)+(a)`; no `durability`/`durable` field, durable-read admission, or result acceptance.

Gate 4 remains **AUTHORIZED — NOT STARTED**, QE **0/11**, result acceptance **NOT RENDERED**, Gate 5 **NOT INITIATED / NOT ADMITTED**. No H-12 adoption, host preflight/P-1/S2/S3/provisioning, write, production eligibility, user-portfolio route activation, or fence lift occurred. The completed CAP-03 host-operations package was not republished, repackaged, or regenerated.
