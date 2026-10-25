# CAP-03 One-Pass PA Decision and IRR Execution Record — 2026-10-25

| Field | Value |
|---|---|
| PA decision record ID | `IIPS-V3-CAP03-DR2-DQ1-PA-DECISION-2026-10-25-01` |
| Additional disposition IDs | `IIPS-V3-CAP03-DR3-DQ2-PA-DISPOSITION-2026-10-25-01`; `IIPS-V3-CAP03-DR4R-DQ3-PA-DISPOSITION-2026-10-25-01`; `IIPS-V3-CAP03-DQ4-FREEZE-H12-PA-DISPOSITION-2026-10-25-01`; `IIPS-V3-CAP03-DQ5-HOST-LOGISTICS-PA-CONFIRMATION-2026-10-25-01` |
| IRR execution record ID | `IIPS-V3-CAP03-DR2-DQ1-IRR-EXECUTION-2026-10-25-01` |
| Register reconciliation | `CV-CORR-94`, master tracker §16.112; `CHG-2026-10-25-13` |
| Date / authority | `2026-10-25` UTC; the PA's direct one-pass execution instruction under the standing global authorization. No additional approval was requested or inferred. |
| Status | **IRR consumer determinations are effective upon publication to IRR `main`, green exact-head CI, and independent remote read-back. IPD provider implementation, DQ-4 freeze/H-12 execution, and host operations are not completed or made effective by this IRR record.** |

## 1. Authority, scope, and effectiveness boundary

This record executes the PA's direction to render Option A for DR-2/DQ-1, and to continue through DR-3/DQ-2, DR-4r/DQ-3, DQ-4 sequencing, and DQ-5 host logistics. The proposed packet [`IIPS_v3.0_CAP03_PA_DECISION_PACKET_DQ1-DQ7_PROPOSED_2026-10-24.md`](IIPS_v3.0_CAP03_PA_DECISION_PACKET_DQ1-DQ7_PROPOSED_2026-10-24.md) and the prerequisite register §§5.2–5.5 remain preserved as historical decision inputs; this dated record supplies the PA answers within the stated authority boundary.

Effectiveness is locus-specific. The adapter mapping and consumer-scope decisions below are IRR-locus determinations and become effective when this record and implementation are merged to IRR `main`, their exact-head checks pass, and the merged blobs are independently read back. They do not make the IPD producer conformant. The packet assigns producer-side DR work and DQ-4 freeze/H-12 publication to IPD; those acts are not made effective by publishing this IRR record. Cross-repository DR-2 closure therefore remains open until the exact authorized IPD producer/test change is published in the IPD locus and independently verified.

The implementation boundary is exactly:

- IPD: `src/persistence/portfolio_store.ts` and `tests/q1_ipc_read_contract_conformance.test.ts` — **not changed in this IRR-bound session**.
- IRR: `frontend/server/user-portfolio/ipcPortAdapter.ts` and `frontend/server/user-portfolio/ipcPortAdapter.test.ts` — changed as described below.

No migration, G2 type replacement, route change, pin change, endpoint activation, read-pair admission, write authorization, `durable:true`, production eligibility, or fence removal is authorized here. The completed CAP-03 host-operations package is not republished, repackaged, or regenerated. DQ-6 and DQ-7 are not answered or altered by this pass.

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

These are recorded as the PA's DQ-4 direction, not as an IPD-locus freeze. The exact final pins cannot be named while the IPD producer half is incomplete; the two existing package pins remain unchanged and are not treated as final QE pins. H-12 remains **NOT ADOPTED**.

## 6. DQ-5 — designated-host logistics confirmed; no host operation

The PA confirms the packet's logistics: designated host `desktop-no0nhtp`; operator-supplied Node `>=22.13.0 <23` (no agent installation or switching); choose the single non-existent P-1 store path only at execution time (do not pre-create or guess it); and consent to the one P-1 provisioning execution under successor-act §8 when its prerequisites are effective and present. This consent authorizes no QE result, H-12 adoption, acceptance, admission, write, or production claim.

No host operation was attempted. The execution environment was Linux x86_64, had neither `pwsh` nor `powershell.exe`, and was not the designated native-Windows host. No native-Windows evidence is claimed or substituted. No host preflight, path designation, P-1 provisioning, S3 preflight, or QE was performed.

## 7. IRR implementation and exact scope

Only these two source paths changed:

1. `frontend/server/user-portfolio/ipcPortAdapter.ts` — implemented the authorized seven values and three renames; validates required values; keeps historical values row-specific; copies current `isSaved` without inference; rejects `durability`/`durable` properties and non-empty `contributions`; preserves existing Class A refusal and route/fence behavior.
2. `frontend/server/user-portfolio/ipcPortAdapter.test.ts` — covers the exact approved matrix, output key sets, stored empty INITIAL digest, current `isSaved` pass-through, per-row INITIAL/MERGE/REPLACE/RESET history, no historical `isSaved`, malformed/missing/null/non-finite values, and refusals for durability/contribution claims.

`frontend/server/user-portfolio/userPortfolioContract.ts` remains frozen and unchanged (starting blob `e6b57bb8a021d8eb4b9b7572d12affc7de66be0b`). The IPC client, port interface, endpoint/fence, package manifest, lockfile, route, and unrelated modules are unchanged. The primary IPD pin remains `2d9130e76bb0dc89daeefabaf297e27bdaa84250` (59 commits behind current IPD main, still an ancestor); the broker alias remains `70b24f029842a7e9b7f615e4d9df7376fd4ff817` (208 behind, still an ancestor). No re-pin was performed.

### IPD producer blocker, measured at current `main`

The read-only IPD source at `4b5c65a731a66a6fa1260146a55df9ed772953a5` / tree `cf5e85856009360de3ffb9614970c383a26d73ba` still has the pre-Option-A result shape:

- `list()` returns only the old summary fields and uses `COALESCE(r.holdings_count, 0)` / `COALESCE(r.total_market_value, 0)`, so a missing joined revision can be fabricated as zero.
- `get()` does not return `isSaved` and defaults missing-row values with `revisionRow?.… ?? 0` / `?? ''`.
- `revisions()` selects only `revision`, `operation`, `created_at`, and `content_digest`; it does not return the three approved stored-row values.
- The current `tests/q1_ipc_read_contract_conformance.test.ts` asserts the old 6-key summary, 10-key detail, and old revision shape. It has not been changed to test Option A or the fail-closed malformed-row cases.

For this evidence only, the current IPD `build:tsc` completed with exit 0 and the **existing old-contract Q1 test** passed 3/3 on Linux. That baseline pass does not implement or prove Option A. An initial direct source-only test invocation failed because the repository test imports compiled `.js` counterparts; the supported compiled run then passed, and both attempts are preserved in the evidence annex. The IPD tracked worktree remained clean at the same commit/tree.

The precise next source action is limited to the two already-authorized IPD files: project the stored current-row values and lifecycle flag without `COALESCE`/null defaults; return each history row's own stored values; preserve unavailable outcomes; and extend Q1 tests for the exact keys, lifecycle, row-specific history, and missing/null/non-finite refusal cases. No schema migration is needed or authorized. This IPD-locus work was not executable on the fixed IRR branch; no other branch was created or used.

## 8. Validation evidence and retained attempts

All output logs are under [`evidence/integration/cap03-dr2-one-pass-2026-10-25/`](../../evidence/integration/cap03-dr2-one-pass-2026-10-25/). Successful checks were run after the final source/test edit.

| Command / check | Result |
|---|---|
| `npm ci` (IRR, committed lockfile; CA workaround environment-only) | exit 0; 190 packages added, 191 audited; npm reported 11 vulnerabilities (6 moderate, 3 high, 2 critical); no audit fix or pin change |
| Focused `npm test -- server/user-portfolio server/user-portfolio-transport.test.ts` | exit 0; 9 files / 173 tests passed, including adapter 49/49 and fence unchanged 26/26 |
| Full `npm run test:ci` | exit 0; 102 files / 1,312 passed / 0 failed; raw log preserved |
| `node .ci/assert-tests.js .vitest-report.json` | exit 0; `OK — 102 test file(s), 1312 test(s), 0 failed` |
| `npm run typecheck` | exit 0 |
| `npm run typecheck:replay-server` | exit 0 |
| Direct strict TypeScript check of adapter and tests | exit 0 |
| `npm run build` | exit 0; 138 modules; JS chunk `1,590.96 kB` / gzip `222.05 kB`; existing >500 kB chunk warning, no build failure |
| IPD current-source `npm run build:tsc` (read-only baseline only) | exit 0 |
| IPD current old-contract Q1 conformance test | exit 0; 3/3 passed; not evidence of the new Option-A contract |

The first IRR focused attempt failed because a valid historical fixture had accidentally been placed in the invalid-value table. The fixture was corrected to omit required historical fields; the initial failure and final passing run are both retained. npm's audit findings and build/runtime warnings are reported, not silently “fixed” by changing frozen dependency pins.

## 9. Gates, host, and non-grants remain separate

| Item | State after this pass |
|---|---|
| Gate 4 | **AUTHORIZED — NOT STARTED** |
| QE-1…QE-11 | **0/11 executed**; no QE result accepted |
| H-12 | **NOT ADOPTED**; no regeneration, repackaging, or adoption |
| P-1 / host preflight / S3 | **NOT EXECUTED** |
| Gate 5 / read-pair admission | **NOT INITIATED / NOT ADMITTED** |
| Endpoint activation / HTTP routes | **None**; existing 503 fences unchanged |
| Writes / `durable:true` / production eligibility | **Not authorized, not claimed, not performed** |
| Fence removal | **Not authorized or performed** |
| CV/XV count movement | **None**; CAP-03 sub-prerequisite dispositions are recorded in §16.112 without changing global register arithmetic |

Green code tests, typechecks, a build, or the old-contract IPD baseline are not Gate 4 acceptance, QE, H-12 adoption, result acceptance, Gate 5 admission, write authorization, production eligibility, or fence removal.

## 10. Genuine blockers and next executable actions

1. **IPD publication boundary:** the provider and its conformance test are not changed on IPD `main`. This session is bound to the IRR branch and may not create/push an IPD branch. Until the two-file IPD change is implemented and published in the IPD locus, actual reads against the current pinned provider remain fail-closed and DR-2 is not cross-repository closed.
2. **Freeze/H-12:** no final commit/tree pins exist for the post-decision provider implementation. The completed host-operations package is under an explicit no-regeneration constraint; H-12 remains not adopted and no replacement candidate was produced.
3. **Native host:** this Linux sandbox cannot perform or evidence the designated-host preflight/P-1/S3/QE. The only valid execution requires the designated native host and the effective sequencing prerequisites; no Linux result is substituted.

The implementation and tests that were lawfully executable in the IRR locus are complete. The tracker receipt §16.112.9 records exact publication, CI, remote commits/trees, and remote blob read-back when complete.
