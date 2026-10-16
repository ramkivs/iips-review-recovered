# NP-18 R3 — current-main target resolution and bounded implementation

| Field | Decision |
|---|---|
| Record | `NP-18-R3-CURRENT-MAIN-IMPLEMENTATION-AUTHORITY-2026-10-16` |
| Date / environment | 2026-10-16; single-user, personal-use, non-production |
| Authority holder | Ramki, the existing Program Authority and sole user |
| Decision exercise / recorder | Arena agent exercising the recorded standing project decision/execution authorization under the current **“R3 TARGET RESOLUTION, BOUNDED IMPLEMENTATION AND CONVERGENCE”** instruction; not a new human signature or claim of a personally spoken option selection |
| Status | **ISSUED — implementation only**, effective after additive publication of this record to the recording ref below and independent remote byte verification; not qualification, admission, release or production authority |
| Product target / exact base | `ramkivs/iips-review-recovered`, `refs/heads/main@98c21768f77061a68470e4b4f6750d38abeec594` |
| Recording / execution ref | `refs/heads/arena/d57c506a-iips-review-recovered`, existing PR #114; starting head `11f90db891c095af39a1009f84c2ed1b6721a127` |
| Publication locus | The expressly named active recording branch; authority is not manufactured by merging to main. Main admission remains separate. |

## 1. Authority provenance and the narrow decision being exercised

The historical Ramki acts establish the settled capability scope and its limitations:

- Original: `governance/iips/AUTH-NP-18-INTELLIGENCE-EXPOSURE-IMPLEMENTATION-AUTHORITY-2026-09-26.md`,
  authority-record commit **`d44c5c7aab43d1c89da06a6f99c4a9e75e47423d`**, blob
  `8f8b077fe8f44833868a8b7df6ccc68df8ff9a62`, SHA-256
  `f1d14170ba81c7b30dda729747be778f2e8fbc2a33d1b0bf3c7ae1a9d16b5cff`.
- R2: `governance/iips/AUTH-NP-18-R2-IMPLEMENTATION-RETARGETING-AUTHORITY-2026-09-26.md`,
  **`abac36b2f0d1d3ac7f8aa9c16d471b634e166d1a`**, blob
  `bc6fb0ca975f9413c86141b6769e21a701d6f65f`, SHA-256
  `a2f9dba52706885d435b446819c659d1b07efd442a100e1b92d864e143b28e28`.

Both were remotely verified on their expressly designated historical recording lineage, not assumed
portable from their presence. Original/R2 alone do **not** delegate a new target; that remains the
correct finding of the evidence-only determination at **`11f90db891c095af39a1009f84c2ed1b6721a127`**,
`docs/integration/NP-18-CURRENT-TARGET-AUTHORITY-DETERMINATION-2026-10-16.md`.

The **additional operative basis for this R3 decision** is the existing project-wide standing
authorization, transcribed on authoritative main in
`docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2:

> “The single user is the Program Authority and has explicitly granted global decision and execution
> authority for this project. This standing authorization covers the necessary decisions, governance
> records, implementation, testing, corrections, and publication within the established scope.
> Do not request repeated approval for individual decisions or routine implementation steps.
> The authorization does not permit fabricated evidence, weakened safeguards, unrelated scope
> expansion, or claims of success without verification.”

That document's own executable F-3/NP-09/10/11 grant remains limited to its §4; it is cited here as
**main-published evidence of the standing authorization**, not reinterpreted as an NP-18-specific
grant. The current operating instruction expressly opens the R3 target-resolution step and directs
exercise of that standing authority if applicable. Selecting the already-verified current target for
the already-selected three views is within that project scope. **This record exercises that narrow
decision now**; it does not assert the decision already occurred under the original/R2 acts, and
no human signature, new delegation or verbatim human option selection is fabricated.

The evidence-only determination remains historical evidence, not an authority act. Its current-target
block is resolved prospectively by **this** explicit target/clause decision, not by editing that record
or pretending it granted permission. G6-R4's three-view requirement is preserved, not reopened.

## 2. Explicit R3 target, security and navigation resolutions

1. **Select current authoritative main at the exact base above.** Execute additively on the existing
   session branch, preserving its independent Dhan work. Do not switch branches, reset unrelated
   changes, merge the orphan or alter main to manufacture authority. Recheck main/ref integrity
   before implementation. If the selected base or current relevant contracts change materially,
   stop the dependent work and reconcile the delta rather than silently follow a moving target.
2. **Replace R2's target-stop condition (§§5.3/13)** for this implementation only. It now binds the
   selected main base and the current paths in §3, not `phase13-next@1a602d84…`. Historical anchors
   remain historical evidence; they are not executable assertions on current main.
3. **Replace R2 §7's old authFetch/Bearer composition requirement for this target only** with use of
   the **existing, already-approved, credential-free** `fetchCrossSectorData()` → `noAuthFetch()` →
   `/api/cross-sector` path **unchanged**. No guard is removed, disabled, weakened or bypassed;
   no upstream or client authentication code is edited. The selected current-main path already
   directly serves certified reference data under the personal-use product scope. Do not restore
   obsolete OIDC/Bearer/RBAC machinery or infer permission to read owner data. Reports and durable
   portfolio fences remain untouched.
4. **Replace R2 §8's obsolete navigation/status bindings** only with admitting the three existing
   child paths to `AVAILABLE_CHILD_PATHS`. Retain the Intelligence group-only heading (no new hub),
   Sidebar and all other navigation. Existing route identifiers already exist; `routes.ts` is unchanged.
   App integration tests replace the obsolete Hub/Sidebar/navigation test targets, without weakening
   unrelated assertions or suppressing route/privacy failures.
5. **Retain original content constraints.** Opportunities are the existing top-10 subset of the same
   ranking; Rankings render all 13 current published members in exact payload order; Risks show
   only avgRisk, diversification/correlation flags and concentration sectors. Each distinct full
   view explicitly identifies its relation to Cross-Sector and the other framings. No new capability
   or independent dataset is implied. Null/undefined scores show **unavailable**, never fabricated zero.

## 3. Exhaustive permitted product-file list — nine files

| Exact path | Permitted change |
|---|---|
| `frontend/src/features/intelligence/IntelligenceOpportunities.tsx` | New dedicated discovery/action view by selective donor reuse; existing fetch/DTO/table/state/badge components; explicit subset/framing and provenance. No derived rationale. |
| `frontend/src/features/intelligence/IntelligenceOpportunities.test.tsx` | Reuse/adapt donor unit tests; subset/order/full-view, missing/error/loading and provenance/credential constraints. |
| `frontend/src/features/intelligence/IntelligenceRisks.tsx` | New dedicated aggregate-only risk view using existing components; preserve words/values and missing-value semantics. |
| `frontend/src/features/intelligence/IntelligenceRisks.test.tsx` | Reuse/adapt donor tests; only the four permitted inputs, no leaked row-level risk, missing/error/loading/provenance. |
| `frontend/src/features/intelligence/IntelligenceRankings.tsx` | New full ordered comparison view; upstream order verbatim, no rank computation, full current population, shared-data framing. |
| `frontend/src/features/intelligence/IntelligenceRankings.test.tsx` | Reuse/adapt donor tests; exact order/population/subset relation, missing/error/loading/provenance. |
| `frontend/src/app/App.tsx` | Add only three imports and dedicated route mounts before the catch-all; preserve every existing route and independent branch change. |
| `frontend/src/app/navigation.ts` | Admit only the three existing Intelligence children in `AVAILABLE_CHILD_PATHS`; correct adjacent obsolete comment, preserve group-only parent and all other children/machinery. |
| `frontend/src/app/App.test.tsx` | Add direct/deep-link/navigation/no-credential assertions for the trio; reuse existing test data/harness, preserve unrelated negative/placeholder/parameterized and personal-use assertions. |

**Only these supporting paths are additionally permitted:**

- `docs/integration/NP-18-R3-CURRENT-MAIN-IMPLEMENTATION-AUTHORITY-2026-10-16.md` — this act.
- `evidence/integration/np18-r3/2026-10-16/validation.json` — immutable-source, scope and executed-test evidence.
- `evidence/integration/np18-r3/2026-10-16/publication.json` — independently observed remote coordinates.
- `evidence/integration/np18-r3/2026-10-16/verify-views.mts` — local composed-server diagnostic, no product handler.
- `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` — additive current outcome and historical supersession pointers.

No unrestricted mutation wildcard. No new helper module, index export, hub, test fixture corpus,
package/lock/config file or extra route identifier is needed. Reuse the existing donor test-only
fixtures/harness inside the named tests, clearly test-only; they must not become product data or
be described as certified/live success. No new acquisition/production dataset or synthetic fixture
corpus. Reuse existing certified composed-server data for integration observations.

## 4. Preserved exclusions and authority separation

- No new risk engine, score, grade, band, threshold, loss probability, inversion or derived measure.
  Existing upstream risk semantics and flag wording remain unchanged. No per-company/per-sector
  risk in the dedicated Risk view and no new risk rankings. Existing Portfolio columns are untouched.
- No governed population expansion, Top-25/50 selector, new sort/rank/ordinal calculation, calibration
  or scoring changes. No engine or frozen asset changes. Opportunity rationale absent from the
  DTO must not be fabricated or added to the contract.
- No new/changed API, DTO, data contract, transport, persistence, provider, credential handling,
  authentication, RBAC, multi-user/tenant framework or enterprise architecture. No IPD changes.
- No direct merge/cherry-pick of the disconnected historical branch. Selectively reuse the six
  component/test contents at donor `4357e14a35966cd8508e0c59e40627791c103172` with explicit adaptations.
- No original dated governance/certification record edited; no IVM, Macro or unrelated work.
- **Implementation authority only.** Test/build success, remote publication, route visibility or
  historical donor qualification is not current-target qualification, admission, release or production
  activation. Those remain **NOT GRANTED by R3** and require their separate later decision/evidence.
  NP-18 is not marked qualified/accepted/released by this act. Main merge is not performed here.

## 5. Validation and evidence required from implementation

Collect actual candidate-tree evidence without claiming a qualification adjudication:

1. Three affected view suites plus App route/nav tests: declared shared-data identity, exact order,
   full 13-member ranking, top-10 subset, aggregate-only risk, missing/null/zero preservation,
   error/loading/unavailable behavior, direct URLs, provenance verbatim, no auth or new endpoint.
2. Strict frontend typecheck and production build. Relevant existing product/three-screen regressions
   and real composed-server observation over labelled SNAPSHOT data. No synthetic/live success claim.
   Reuse unaffected prior results; broader CI automatically runs its existing suite.
3. Exact scope review against the starting session tree and selected main: nine product files only,
   named supporting files only; protected client/route identifiers/server/engine/fence/package blobs
   unchanged. Correct defects within that boundary before publication.
4. Additive push on the fixed existing branch/PR, independently read remote commit/ref and file bytes,
   inspect hosted CI for the exact implementation head, then update the existing repository tracker.
   Self-reference coordinates are verified externally in the PR comment where necessary.

Historical qualification chronology is reused: `8d9babc…` pending record → direct child `4357e14…`
source-reported bounded adjudication (687 passed / 7 failed / 15 skipped); not a full-suite green or
current-main qualification. Preserve exceptions and provenance. A later qualification/admission
actor must assess the actual new target evidence; no authority to self-certify is conferred here.

**Rationale:** remove the specific stale-target barrier to the already-selected composition work,
using standing project authority under the current R3 instruction, without changing product risk,
data, security or deployment behavior. Existing certified content remains preserved. Do not ask to
approve the settled three-view intent again. Repository tracker only; no Library synchronization
is attempted or made a dependency of this work.
