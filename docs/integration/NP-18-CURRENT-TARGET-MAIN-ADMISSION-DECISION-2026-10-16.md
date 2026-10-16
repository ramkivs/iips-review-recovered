# NP-18 — bounded non-production main-admission decision

| Field | Decision |
|---|---|
| Record | `NP-18-CURRENT-TARGET-MAIN-ADMISSION-DECISION-2026-10-16` |
| Date / class | 2026-10-16; separate prospective feature-membership/admission act and evidence assessment |
| **Admission verdict** | **APPROVED FOR MAIN ADMISSION — bounded NP-18 increment only** |
| **Current main membership** | **NOT YET EFFECTIVE / NOT YET ADMITTED ON MAIN** — approval is not a merge or a claim that the implementation is already on main |
| Authority holder | Ramki, Program Authority; active non-production feature-baseline membership jurisdiction (J-3) |
| Decision exercise / recorder | Arena exercising the recorded standing PA project decision/execution authorization under the current **“NP-18 — MAIN-ADMISSION ASSESSMENT”** instruction; no independently held agent jurisdiction, new human signature or personally spoken PA selection is claimed |
| Exact qualified implementation | **`3c64d69c148d01081b2ba9b8f76fa58c21ed2b99`** |
| Qualification | **QUALIFIED FOR BOUNDED NON-PRODUCTION USE**, decision/evidence published at **`a25b3967bbd140a8ea4e2fb14143a421bee2eaba`**; unchanged |
| Evaluated current PR head | `a25b3967bbd140a8ea4e2fb14143a421bee2eaba`, PR #114 OPEN |
| Main target / actual main | `98c21768f77061a68470e4b4f6750d38abeec594`, independently unchanged |
| Recording | Existing fixed branch `arena/d57c506a-iips-review-recovered`, existing PR #114 |
| Approval publication | This explicit approval is operative after additive branch publication and independent remote verification of this decision/evidence/tracker. Actual main membership additionally requires an appropriately authorized integration and post-integration main verification. |
| Not granted | Whole-PR #114 admission/merge/closure, other-workstream admission, release, production activation, new engine certification, or product-scope expansion |

## 1. Applicable authority — an explicit admission act, not qualification by implication

On authoritative main, [`NP-13-D0-01.md`](NP-13-D0-01.md) §§1.3, 2.1–2.5 and 10.3 designate
Ramki's bounded active non-production **J-3 membership** jurisdiction and require each exercise to
be its **own explicit act**. Jurisdiction alone decides no membership. Applying that general
membership jurisdiction to NP-18 is disclosed as a scope reading, not a claim that D0 itself names
or accepts NP-18. The [NP-07 acceptance record](IIPS_v3.0_NP07_RESEARCH_ACCEPTANCE_AND_BASELINE_ADMISSION.md)
§§1–4 supplies a relevant ordinary-admission precedent: qualified bounded scope, exact coordinates,
regression evidence, an explicit exercise of membership authority and truthful main publication.
Its NP-07 verdict is **not transferred** to NP-18. No NP-13 baseline definition, J-1/J-2 decision,
ref-realization rule, unrelated deferred gate or production jurisdiction is created here.

The additional execution basis is the existing project-wide standing authorization, evidenced on
main by the F3 record §1.2 and already distinguished from that record's capability-specific §4 grant:

> The single user is the Program Authority and has explicitly granted global decision and execution authority for this project. This standing authorization covers the necessary decisions, governance records, implementation, testing, corrections, and publication within the established scope. Do not request repeated approval for individual decisions or routine implementation steps. The authorization does not permit fabricated evidence, weakened safeguards, unrelated scope expansion, or claims of success without verification.

The current instruction expressly directs a separate evidence-backed admission decision **if existing
authority permits it**. A prospective admission decision for the already selected and explicitly
qualified NP-18 increment is within that established project scope. **This record exercises that
narrow decision now**, as an explicit J-3 act for the PA holder under the recorded standing execution
authorization. It does not assert that R3 or the qualification decision already granted admission,
that Arena independently holds the PA's jurisdiction, or that Ramki personally uttered a new selection.
The F3 record is evidence of standing authorization, not an NP-18-specific grant or expansion of F3 §4.

No new PA approval of settled NP-18 product intent or another qualification cycle is necessary.
The genuinely separate remaining decision concerns **the actual broader PR's disposition/merge**,
not whether these nine NP-18 product paths can be approved for non-production main admission.

## 2. Exact approved increment — not every change in PR #114

Approval covers exactly the qualified composition increment **`904f5d99f9e6468fb4805c96a78c16c70a08395e`
→ `3c64d69c148d01081b2ba9b8f76fa58c21ed2b99`**, at these nine product paths:

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

The exact Git diff over those paths is bound in the [direct assessment evidence](../../evidence/integration/np18-admission/2026-10-16/assessment.json),
SHA-256 **`67719c4b44218b42d3fc9d3290e1d657d01e9945b25e59fb54588e7f2b91522f`**.
All nine qualified product blobs and 19 protected blobs remain unchanged at the evaluated head.
`App.tsx` and `navigation.ts` also contain **pre-existing broker-preview hunks** from the R3 starting
session; this is **not whole-blob admission of those unrelated hunks**. App's NP-18 delta is only
three imports/three routes; navigation's NP-18 delta admits the existing three children and corrects
the obsolete comment, preserving the group-only parent. App's added six route/nav tests remain intact.

The approved functionality and limitations remain: three distinct full alternate framings of existing
certified Cross-Sector SNAPSHOT data; all 13 ranking members in supplied order, matching top-10 subset;
aggregate avgRisk and existing flags/concentration sectors only; unavailable null/undefined scores,
genuine zero retained; credential-free API and unchanged DTO/transport/engines/fences. No new risk,
rationale, population, external acquisition, persistence, authentication or enterprise scope.

The qualification/admission records and their existing direct evidence may accompany this approved
increment as its provenance. Their publication does not admit another workstream's product delta.
No detached/orphan merge or silent synthesis of a different integration tree is authorized; a material
change to source/base/integration would require delta review before reusing the pinned evidence.

## 3. Admission-specific assessment and evidence reuse

[Current qualification decision](NP-18-CURRENT-TARGET-NON-PRODUCTION-QUALIFICATION-2026-10-16.md),
[qualification evidence](../../evidence/integration/np18-qualification/2026-10-16/adjudication.json),
tracker §16.38.10 and the [qualification receipt](https://github.com/ramkivs/iips-review-recovered/pull/114#issuecomment-6209919176)
were re-bound to the current remote head. No implementation, test/build, composed diagnostic or
qualification investigation was repeated. The 84 local passing tests, strict typecheck/build, actual
composed-server/App-DOM and earlier raw-byte evidence remain valid for the identical source.

| ID | Admission invariant / authority rule | Result |
|---|---|---|
| A-1 | Completed qualification of the exact scope, not code existence or CI alone | **PASS.** Separate explicit PA-authorized qualification at `a25b396…`, implementation `3c64d69…`, twelve required criteria demonstrated; verdict remains QUALIFIED FOR BOUNDED NON-PRODUCTION USE. |
| A-2 | Exact identity and no unreviewed source/base drift | **PASS.** Selected main unchanged; nine product + 19 protected blobs match qualification; no frontend/platform delta since the qualified implementation. |
| A-3 | Regression/build/runtime evidence applicable to the current candidate | **PASS, reused.** 84 local passing tests, strict typecheck/build and actual composed runtime; current-head hosted full-suite, non-zero/full-pass guard, typecheck/build all SUCCESS. No artificial requalification prerequisite. |
| A-4 | Published qualification and evidence integrity | **PASS.** Fresh raw remote decision/evidence/tracker comparison and unchanged published receipt; remote parent/ref/PR head confirmed. |
| A-5 | Separate explicit membership/admission decision under applicable authority | **APPROVED BY THIS ACT.** D0 J-3 holder plus evidenced standing PA decision/execution authorization and current instruction; not an inference from R3, qualification or a GitHub merge button. |
| A-6 | Target integration compatibility and repository workflow | **PASS for evaluated PR candidate.** PR #114 MERGEABLE/CLEAN; current PR merge-ref tree equals candidate tree with exact main/head parents; no conflicting main delta. Main reports unprotected, rulesets empty, no recorded reviews/required review decision. These observations do not grant authority or bypass a rule. |
| A-7 | No admission of unqualified/unassessed scope by implication | **ENFORCED.** This decision covers the nine-path NP-18 increment, not the actual PR's additional eight broker-product paths or the broker hunks in shared files. |
| A-8 | Actual main presence, main-published records and post-integration verification before claiming effective membership | **NOT YET SATISFIED / future integration gate.** Qualified NP-18 implementation is still branch-only. Admission is approved prospectively, not recorded as already effective on main. |
| A-9 | Applicable authority to merge the actual complete PR | **NOT AUTHORIZED BY THIS ACT.** PR #114 is a combined candidate, not an NP-18-only nine-path merge. A broader PR disposition must explicitly cover its other workstream; a technical green/clean state is not that decision. |

Fresh relevant CI: [run **38863865672**](https://github.com/ramkivs/iips-review-recovered/actions/runs/38863865672),
job **116852096469**, exact `head_sha` **`a25b3967bbd140a8ea4e2fb14143a421bee2eaba`**,
completed/success, every job step SUCCESS. This is the evaluated qualification recording head's CI,
not a substitute from an earlier commit. The existing workflow will run automatically for the new
admission-recording commit; its exact-head result is separately verified in the final PR receipt.

Manual-browser/deployed-host observations and downloaded raw logs/numeric hosted count remain
**NOT VERIFIED / NOT CAPTURED**, not newly mandatory: no inspected ordinary-admission criterion
requires them in addition to the existing bounded qualification, actual composed runtime and direct
hosted result/guard evidence. No observation is fabricated, later explicit criterion waived or local
84-test count relabelled a hosted count. Historical exceptions stay historical.

## 4. Actual PR merge boundary and the single remaining decision

At entry, the complete main→PR delta is **32 paths / 17 product paths**, not just nine. The eight
additional product paths are:

```text
frontend/package-lock.json
frontend/package.json
frontend/src/api/brokerHoldingsPreview.test.ts
frontend/src/api/brokerHoldingsPreview.ts
frontend/src/app/routes.ts
frontend/src/features/broker-holdings/BrokerHoldingsPreview.test.tsx
frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx
frontend/tsconfig.broker-import.json
```

The existing broker CSV preview is independently recorded under **DB-C1**; its branch implementation
and tests do not become NP-18 qualification/admission evidence merely because the PR is shared.
This assessment does not reopen or requalify that work. Adding these admission records changes only
three documentary paths (decision, evidence, existing tracker), not the 17-product-path scope.
The PR's original broker-only title/body also require a routine scope/status correction, preserving
the original description as history; that authorized publication step is completed in this pass.

**Genuine boundary:** current NP-18 authority and this act do not silently become whole-PR broker
admission/merge authority. R3/qualification expressly withhold merge, and the current instruction
requires applicable authority before merging. The recorded standing authorization is exercised here
only for the settled NP-18 scope, not to decide the independently traceable broker workstream.
No branch protection, reviewer requirement, browser ceremony or extra test is invented as a blocker.

**Single smallest remaining action:** an explicit PA disposition of the **complete existing PR #114
merge/publication scope**, including its independently recorded broker-preview delta. Proposed bounded
wording, **NOT a decision attributed to Ramki or issued by this record**:

> Authorize the normal merge/publication of existing PR #114 at its final remotely verified head into IRR main@98c21768f77061a68470e4b4f6750d38abeec594, expressly disposing the complete enumerated PR delta: the separately approved NP-18 increment and the existing DB-C1 browser-only broker CSV preview/dependency changes, including the shared App/navigation hunks. Retain all UNRESOLVED/no-network/no-save, G-2/Reports/identity and reference-data boundaries. Do not derive another workstream's qualification or Product Acceptance from NP-18's verdict. No release, production activation or expanded broker/analytics scope is authorized. After the authorized integration, verify the resulting main commit, admitted NP-18 source/records and applicable CI.

The final exact head and full path list are bound in the external PR verification receipt. The PA
may instead prescribe a different in-scope disposition, but this agent does not create a competing
PR, alter product code, split/reset published work or change the current lifecycle without authority.
This remaining decision is not another approval of NP-18's settled three-view intent or qualification.

## 5. Permitted next state and publication

- **Qualification:** remains QUALIFIED FOR BOUNDED NON-PRODUCTION USE; no new cycle.
- **Admission decision:** APPROVED for the pinned NP-18 increment, operative on the designated
  branch publication/verification; **actual main membership NOT YET EFFECTIVE**.
- **Merge:** NOT PERFORMED / NOT AUTHORIZED here for the actual combined PR #114. Main unchanged,
  PR remains OPEN; no direct main write, competing PR or unrelated product change.
- **Release / production:** NOT AUTHORIZED / NOT STARTED. No engine certification or program-wide closure.
- Only this decision, `evidence/integration/np18-admission/2026-10-16/assessment.json` and the existing
  root master tracker change in Git. Existing PR title/body are corrected as publication metadata.
  One additive commit is pushed; raw remote artifacts, current ref/parent/PR/main and final exact-head
  hosted CI are independently verified in the durable PR receipt. No extra self-referential tracker
  commit or Library synchronization is needed.
