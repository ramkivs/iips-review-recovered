# NP-18 — PA-authorized current-target non-production qualification adjudication

| Field | Decision |
|---|---|
| Record | `NP-18-CURRENT-TARGET-NON-PRODUCTION-QUALIFICATION-2026-10-16` |
| Date | 2026-10-16 |
| Class | Separate qualification authorization, evidence assessment and bounded adjudication — not implementation authority or admission |
| Program Authority / authorizer | Ramki, the user and PA, through the explicit current operating instruction quoted below |
| Adjudicator / recorder | Arena agent executing that explicit PA qualification authorization |
| **Verdict** | **QUALIFIED FOR BOUNDED NON-PRODUCTION USE** |
| Evaluated implementation | **`3c64d69c148d01081b2ba9b8f76fa58c21ed2b99`** |
| Evaluated recording / evidence head | **`07e6791989c7b8b1e6c8b21f483bdf5cdc7538da`**; NP-18 product and protected source blobs unchanged from the evaluated implementation |
| R3 implementation decision | `904f5d99f9e6468fb4805c96a78c16c70a08395e` — retained as implementation authority only |
| Exact selected main base | `98c21768f77061a68470e4b4f6750d38abeec594`, independently unchanged at this adjudication |
| Recording / publication | Existing `arena/d57c506a-iips-review-recovered`, PR **#114**; no other branch/PR or main mutation |
| Effectiveness | The verdict is rendered here under the supplied PA authorization and becomes effective for the pinned scope on additive branch publication and independent remote verification of this decision, direct evidence and tracker. Final recording commit/raw bytes/CI are bound externally in the PR receipt, avoiding self-reference. |
| Not granted | Main admission, merge/closure of PR #114, certification of a new engine/capability, release, production activation or scope expansion |

## 1. Explicit PA authorization and provenance

The current user instruction is titled **“NP-18 — PA-AUTHORIZED NON-PRODUCTION QUALIFICATION”** and supplies:

> Execute in one pass. The user, Ramki, explicitly authorizes the bounded non-production qualification adjudication in their capacity as Program Authority (PA). Do not request this authorization again.

It expressly directs the separate adjudication of implementation
`3c64d69c148d01081b2ba9b8f76fa58c21ed2b99`, publication of the supported verdict and direct evidence,
update of the existing repository tracker, and independent remote/CI verification through PR #114.
**This instruction is the qualification execution authority.** Arena acts under it now; no duplicate
authorization is requested, new human signature fabricated, or independent human review claimed.
This is not an inference from standing authority, R3, passing CI or historical qualification.

The original act (`d44c5c7…` §12), R2 (`abac36b…` §12), and
[R3 §§4–5](NP-18-R3-CURRENT-MAIN-IMPLEMENTATION-AUTHORITY-2026-10-16.md) require a separate subsequent
qualification path, which this record now executes. R3's target, credential-free API and group-only
navigation resolutions remain intact; R3 itself is not retroactively relabelled a qualification grant.
The former “qualification verdict not rendered” status in tracker §16.38.9 was accurate when recorded
and is prospectively resolved by this separate PA-authorized adjudication.

Only these three paths change in this qualification pass:

1. `docs/integration/NP-18-CURRENT-TARGET-NON-PRODUCTION-QUALIFICATION-2026-10-16.md` — this decision.
2. `evidence/integration/np18-qualification/2026-10-16/adjudication.json` — direct evidence/criterion assessment.
3. `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` — current summary and additive outcome.

No product, test, API, transport, engine, fixture, package/config, fence, CI workflow, historical act
or prior evidence file is changed. The current instruction authorizes these qualification records;
this does not widen R3's nine-product-file implementation boundary.

## 2. Exact evaluated scope

The verdict applies **only** to the composition-only NP-18 increment at the pinned implementation,
for single-user non-production use over the existing certified SNAPSHOT reference data:

```text
frontend/src/features/intelligence/IntelligenceOpportunities.tsx
frontend/src/features/intelligence/IntelligenceOpportunities.test.tsx
frontend/src/features/intelligence/IntelligenceRisks.tsx
frontend/src/features/intelligence/IntelligenceRisks.test.tsx
frontend/src/features/intelligence/IntelligenceRankings.tsx
frontend/src/features/intelligence/IntelligenceRankings.test.tsx
frontend/src/app/App.tsx
frontend/src/app/navigation.ts
frontend/src/app/App.test.tsx
```

The actual product delta from R3 to implementation is exactly these nine paths; the two additional
implementation-commit paths are the already-approved validation JSON and composed diagnostic.
The nine product blobs match the original validation hashes and the evaluated recording head;
**19 protected file blobs** also match the validated implementation. There is no frontend/platform
source delta between implementation and `07e6791…`. Independent Dhan/Holdings work and all existing
fences are preserved and **not qualified by this verdict**. Selective donor reuse is not an orphan merge.

## 3. Evidence and criterion-by-criterion adjudication

Direct evidence: [adjudication.json](../../evidence/integration/np18-qualification/2026-10-16/adjudication.json).
It binds fresh remote head/PR/main reads, five published source artifacts and their raw-byte hashes,
three exact-head CI run/job/step results, two published receipts, nine product hashes, 19 protected
blobs, reused immutable source coordinates and the following criterion assessment.

Reused evidence, **not tests rerun in this pass**:

- [Validation](../../evidence/integration/np18-r3/2026-10-16/validation.json), first published in `3c64d69…`:
  actual local commands, **84 passed / 0 failed / 0 skipped in nine suites**, strict typecheck,
  production build and composed-server/App-DOM observations, plus source/scope provenance.
- [Publication](../../evidence/integration/np18-r3/2026-10-16/publication.json) at `0c641f3…`:
  independent implementation publication/byte verification and implementation CI.
- [Composed diagnostic](../../evidence/integration/np18-r3/2026-10-16/verify-views.mts): actual composed
  server → unchanged client → actual App routes → Vite/jsdom DOM, using certified SNAPSHOT responses,
  **not** a mocked route table or test-fixture substitute. The published execution result is in validation.
- [Final receipt 6209484040](https://github.com/ramkivs/iips-review-recovered/pull/114#issuecomment-6209484040)
  and [follow-up receipt 6209579022](https://github.com/ramkivs/iips-review-recovered/pull/114#issuecomment-6209579022):
  freshly fetched and verified to identify their exact head/run, unchanged since creation.

| ID | Applicable criterion | Evidence and adjudicated result |
|---|---|---|
| Q-01 | Separate qualification authority; exact authorized target | **PASS.** Current explicit PA instruction authorizes this separate adjudication; R3 remains the implementation basis for exact main `98c21768…`. Implementation/recording heads and PR #114 independently confirmed. |
| Q-02 | Exactly nine authorized product files, preservation of unrelated work | **PASS.** Actual implementation delta equals the named allowlist; nine validated hashes and 19 protected blobs match; no product delta through the recording head. No independent workstream is included in this verdict. |
| Q-03 | Three distinct full views, alternate framings of existing data, not new capabilities/datasets | **PASS.** Three view suites, six App deep-link/navigation cases and actual composed App-DOM rendering establish Opportunities, Risks and Rankings with shared Cross-Sector disclosures and explicit Opportunities/Rankings relationship. |
| Q-04 | All 13 ranking members in payload order; matching top-10 opportunity subset; no reranking/ordinal/universe expansion | **PASS.** Unit order/mapping checks and composed DOM exact row/value/column comparisons: Rankings 13, Opportunities 10; upstream `opportunity` equals `ranking.slice(0, 10)`. No client rank computation or Top-25/50 expansion. |
| Q-05 | Risks limited to aggregate avgRisk, diversification/correlation flags and concentration sectors | **PASS.** Risk tests and actual DOM confirm one aggregate metric, exact flag wording/order and concentration sectors, no risk table/company identities/row-risk drill-down. Observed avgRisk 76.5 is the upstream value, not a new grade, probability or recalculation. |
| Q-06 | Null/undefined scores unavailable, genuine zero preserved; loading/error/unavailable behavior | **PASS.** View tests cover null scores, missing scores, genuine zero, pending requests, error and missing payload; existing state/data components are reused. No fabricated zero or fallback investment data. |
| Q-07 | Provenance verbatim; SNAPSHOT, no LIVE claim | **PASS.** Three provenance assertions and actual composed DOM preserve dataSource, freshness, transportSemantics and calibratedAt, including SNAPSHOT and `2026-08-09T00:00:00.000Z`. |
| Q-08 | Existing credential-free API unchanged; no new endpoint, DTO, transport, provider or persistence | **PASS.** Existing fetchCrossSectorData/noAuthFetch/API blobs unchanged. Three actual view requests use `/api/cross-sector`, credentials omit, no Authorization; invented endpoints/topN query remain 404. Scope/protected-blob checks establish no added source/transport machinery. |
| Q-09 | Group-only Intelligence parent; admitted existing children, direct URLs and navigation; existing routes retained | **PASS.** App/nav evidence preserves group-only heading/no new hub; six new direct-link/navigation cases and actual App-DOM route checks pass. Exact App delta is three imports/three routes; prior Dhan route preserved. |
| Q-10 | Affected tests and relevant regressions, strict typecheck and production build | **PASS.** Reused 84 passing tests (50 affected trio/App + 34 relevant regressions), existing strict config and build exit 0, 106-module production bundle. No failing/skipped local tests in this bounded run; no tests suppressed. |
| Q-11 | Actual current-target runtime/logical UI, not fixtures alone | **PASS.** Existing ephemeral actual composed server and real App routes render exact certified SNAPSHOT slices through the unchanged client. Executive/Portfolio slices remain consistent; source bytes still match the executed diagnostic/validation. This is automated local logical UI, not manual-browser evidence. |
| Q-12 | Durable remote publication, exact-head hosted CI and evidence/receipts | **PASS.** Raw remote R3/validation/publication/diagnostic/tracker bytes equal Git objects; exact-head full-suite, non-zero/full-pass guard, typecheck/build job steps SUCCESS in the three runs below; final receipts identify those heads and remain published. |

Freshly verified hosted CI (no success borrowed across commits):

| Run / job | Exact head | Result |
|---|---|---|
| [38860598503](https://github.com/ramkivs/iips-review-recovered/actions/runs/38860598503) / 116841763581 | `3c64d69c148d01081b2ba9b8f76fa58c21ed2b99` | **completed / success**, every job step SUCCESS |
| [38860864856](https://github.com/ramkivs/iips-review-recovered/actions/runs/38860864856) / 116842592107 | `0c641f3b5546788b2621eefc66296d30d209fab8` | **completed / success**, every job step SUCCESS |
| [38861559122](https://github.com/ramkivs/iips-review-recovered/actions/runs/38861559122) / 116844768891 | `07e6791989c7b8b1e6c8b21f483bdf5cdc7538da` | **completed / success**, every job step SUCCESS |

## 4. Limitations, exceptions and undemonstrated observations

**No required bounded qualification criterion is failed or unproven by the available evidence.**
The following remain explicit limits, not invented passes:

- Manual-browser and externally deployed-host observations: **NOT PERFORMED / NOT VERIFIED** on this
  target. Original/R2 §12 require a separate evidence/adjudication path, and R3 §5 requires actual
  composed-server/logical-UI evidence, not a prescribed manual browser, external host or historical
  Windows/Keycloak environment. The existing automated runtime evidence satisfies this bounded
  criterion. The current PA instruction also explicitly confirms that optional observations are not
  prerequisites absent a governing requirement. No such governing requirement was identified.
- Hosted raw-log download/numeric hosted test count: **NOT CAPTURED / NOT VERIFIED**; previous redirect
  EOF/network limitation preserved. Direct exact-head run/job/step APIs verify full-suite success and
  the non-zero/full-pass guard. **84 is the local bounded-regression count, not an invented hosted count.**
- The older donor's bounded qualification (`4357e14…`, after pending `8d9babc…`) and source-reported
  **687 pass / 7 fail / 15 skip** remain historical; no old verdict, runtime observation or exception
  is inherited. Current CI scope is the established frontend package, not a claim that every repository,
  platform, IPD or historical certification suite is green. No unrelated IdP/admin tests are rerun.
- Existing Router/async-act warnings, diagnostic Vite CJS deprecation and hosted action/image annotations
  are retained as non-failing warnings, not suppressed failures. No global configuration is weakened.
- Frozen certified SNAPSHOT reference data is not live market breadth, personal broker holdings,
  owner-data access or a new certified intelligence engine. Wider risk measures, populations, per-row
  rationale, authentication/RBAC, persistence, enterprise scope and other workstreams stay excluded.

No new local tests, builds, composed diagnostic, deployment, manual observation or raw-log capture
were performed in this adjudication pass: there is no specific unresolved qualification gap requiring
those reruns. The existing workflow runs automatically for the qualification recording commit;
its final exact-head result is verified in the post-publication PR receipt, not assumed here.

## 5. Verdict and next permitted state

**QUALIFIED FOR BOUNDED NON-PRODUCTION USE** of the exact NP-18 composition increment at
**`3c64d69c148d01081b2ba9b8f76fa58c21ed2b99`**, under the nine-file/data/risk/population boundaries above.
This is a new current-target adjudication based on the criterion matrix and explicit PA authorization,
not merely an implementation-complete/CI-green status or a portable historical qualification.

- **Qualification stage:** COMPLETE for that pinned bounded non-production scope, effective on the
  designated publication/remote verification. The earlier missing-qualification-verdict dependency
  is resolved by this decision, without changing older records.
- **Next permitted state:** the qualified candidate may proceed to **separate ordinary main-admission
  assessment/decision** under applicable authority. Non-production use remains limited to the pinned
  reference-data composition; no environment deployment or fence changes are authorized here.
- **Not granted:** main admission or PR merge/closure, release, production activation, new engine/capability
  certification or broader product/program closure. NP-18's wider governance remains OPEN / COMMISSIONING
  with these separate dispositions preserved. Other PR #114 workstreams are neither qualified nor
  admitted by this record; their boundaries must remain independently traceable.
- **Publication integrity:** this decision, direct evidence and the existing tracker are published in
  one additive commit on existing PR #114, then raw bytes, parent/ref, main/PR lifecycle and relevant
  exact-head hosted CI are verified independently. The durable PR receipt records the final commit,
  hashes and CI, so no additional commit is needed merely to assert its own publication.
