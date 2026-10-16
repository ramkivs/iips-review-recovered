# NP-18 — current-target authority determination (2026-10-16)

**EVIDENCE / TARGET-READINESS RECORD ONLY — NO RE-ANCHORING OR IMPLEMENTATION AUTHORITY GRANTED.**

This records the result of the current conditional instruction to recover authority and re-anchor
only if the existing grant permits it. It is not an issued PA act, approval request for the already
settled three-view scope, proposed signature, qualification, admission or release. Recording agent:
Arena; historical authority holder identified by the source acts: **Ramki**. No new human decision
or signature is asserted. The blocked branch of the current instruction applies.

## 1. Exact recovered authority and durable publication

Original path:
`governance/iips/AUTH-NP-18-INTELLIGENCE-EXPOSURE-IMPLEMENTATION-AUTHORITY-2026-09-26.md`

- Creation/authority-record commit: **`d44c5c7aab43d1c89da06a6f99c4a9e75e47423d`**.
- Parent decision boundary: `b8afaeae2daa7a33bc1c8061d04de6b580c77029`; its parent is the
  designated governance baseline `3c7568e0437f2a5e7b385833ed0752990286ad87`.
- Blob **`8f8b077fe8f44833868a8b7df6ccc68df8ff9a62`**, complete text **25,872 bytes**,
  SHA-256 **`f1d14170ba81c7b30dda729747be778f2e8fbc2a33d1b0bf3c7ae1a9d16b5cff`**.
  All 244 lines inspected; remote raw bytes match the immutable Git object and the digest in
  the creation commit's message. This is not an excerpt substituted for the act.
- The act explicitly designates **`arena/01a0ddea-iips-review-recovered` for recording ONLY**;
  it deliberately does **not** move `arena/01a03e3b-iips-review-recovered`. Creation commit is
  an ancestor of the live designated recording tip **`fedc19ee41c07a7a00a0b887e78f352b466cf41a`**
  and the counterpart **`arena/01a0e30f-iips-review-recovered@17c759cdccc6f7e1e3753c5215fcfa5d11ed4328`**.
  Both contain the same issued original and R2 records. Thus historical publication is verified
  on its **expressly named recording line**, not assumed from a stray file's existence.
- The canonical governance ref remains **`3c7568e0437f2a5e7b385833ed0752990286ad87`**. Original
  and R2 are **absent from current main**. Recording-line publication does not make them portable
  main-target grants. Conversely, absence from main alone is not grounds to erase the valid,
  expressly branch-scoped historical authority or demand its original approval again.
- The text attributes the historical selections to RAMKI, with Arena recording without discretion.
  Git publication proves those recorded bytes/provenance, not an independently observed human
  signature. No signature requirement or new authentication ceremony is invented here.

Subsequent target act:
`governance/iips/AUTH-NP-18-R2-IMPLEMENTATION-RETARGETING-AUTHORITY-2026-09-26.md`

- Creation commit **`abac36b2f0d1d3ac7f8aa9c16d471b634e166d1a`**, direct child of `d44c5c7…`;
  blob **`bc6fb0ca975f9413c86141b6769e21a701d6f65f`**;
  SHA-256 **`a2f9dba52706885d435b446819c659d1b07efd442a100e1b92d864e143b28e28`**.
- R2 records Ramki's express selection moving **only implementation** to
  **`phase13-next@1a602d849cc47331d4f61cc366ed0a343f80e287`**. Recording remains on the named
  authority branch. Other decisions and original exclusions remain preserved.
- Complete original/R2 text, the decision-boundary record, commit parents and both qualification
  records were inspected. No later current-main target grant or delegation was located in current
  main/session, the named authority/governance tips or donor governance records. This is the
  stated relevant-ref search boundary, not a claim about inaccessible or unreferenced records.
  Current IRR tags (`program-v1.2.0`, `v3.0-phase12-certified`) do not establish a new NP-18 target act.

Immutable remote source coordinates and raw-byte evidence are in
[`verification.json`](../../evidence/integration/np18-authority-determination/2026-10-16/verification.json).

## 2. Why a mechanical re-anchor is not authorized by these acts

The three-view product intent is settled: same certified slices, alternate framing; Opportunities
as the top-N subset of Rankings; Risks aggregate-only. **G6-R4 does not cancel this intent** merely
because existing reference content is already visible elsewhere. That finding is reused unchanged.

However, R2 is not a generic permission to select a new target:

1. **R2 §§2–3 and §13:** names `phase13-next` and a specific baseline. **§5.3 / §13 require stopping
   if that baseline differs.** Re-deriving line anchors does not authorize changing branches.
2. **R2 §7:** expressly binds the implementation to the historical guarded `/api/cross-sector`
   path through `authFetch`/Bearer propagation, with no re-authoring of that hardening.
3. **R2 §8 and original §§6/8:** bind an exact old navigation/status and assertion model, preserve
   `NavStatus`/`NAV_STATUS_LABEL` and specify IntelligenceHub and old test files.
4. Current authoritative **`main@98c21768f77061a68470e4b4f6750d38abeec594`** instead has the
   already-approved credential-free `noAuthFetch` client, group-only parents and
   `AVAILABLE_CHILD_PATHS`; no IntelligenceHub, NavStatus or old Sidebar/navigation test files.
   This is more than line-number drift. A current-target record must expressly reconcile those
   binding target/security/navigation clauses, while changing **no authentication implementation**.
5. The global standing authorization transcribed in the main-published owner-context mechanism
   decision §1.2 permits decisions/execution **within established scope**, but the same record
   limits its operative grant to its §4 capabilities. It supplies no located NP-18 target delegation.
   H-18 and subsequent personal-use directions exclude enterprise architecture; they do not by
   themselves issue an NP-18 current-target implementation grant. Restoring old auth is not a remedy.

**Determination:** original authority is sufficient for its historical bounded implementation,
**not sufficient evidence of authority for this agent to retarget and replace the binding R2
conditions**. The present instruction is conditional, not a selected replacement of those clauses.
No current-target re-anchoring act is issued. Publishing an agent-written grant or merging a document
would not fill that substantive gap. No merge is performed to manufacture authority.

## 3. Exact current-target file set for the missing act — NOT AUTHORIZED

The following is the smallest technical mapping, inspected against exact main and the donor
implementation at **`4357e14a35966cd8508e0c59e40627791c103172`**. It is evidence for a single
missing target decision, **not an operative allowlist**. A future PA act can name these exact nine
product files; there is no unrestricted product wildcard and no proposed new IntelligenceHub.

| File | Bounded change only if the target act is issued |
|---|---|
| `frontend/src/features/intelligence/IntelligenceOpportunities.tsx` | New discovery/action view; reuse existing fetch/DTO/table/state/badge components. Preserve top-10 subset relationship, upstream ordering and provenance; no new rationale calculation. |
| `frontend/src/features/intelligence/IntelligenceOpportunities.test.tsx` | New affected rendering/subset/order/null/error/provenance tests using existing harness and certified payload evidence. |
| `frontend/src/features/intelligence/IntelligenceRisks.tsx` | New aggregate-only view: avgRisk, diversification/correlation flags and concentration sectors. Reuse components; no company/sector risk fields or derived measures. |
| `frontend/src/features/intelligence/IntelligenceRisks.test.tsx` | New aggregate-only/no-derivation, null/error/provenance coverage. |
| `frontend/src/features/intelligence/IntelligenceRankings.tsx` | New full published-ranking comparison view; preserve existing 13-row population and exact payload order. No ordinal/reranking computation or selector. |
| `frontend/src/features/intelligence/IntelligenceRankings.test.tsx` | New order/population/subset-relationship/null/error/provenance coverage. |
| `frontend/src/app/App.tsx` | Only import/mount the three existing route identifiers before the catch-all; preserve all existing routes, including prior independent branch work. |
| `frontend/src/app/navigation.ts` | Only admit the three existing child paths to `AVAILABLE_CHILD_PATHS` and correct their adjacent unbuilt-child comment. Preserve group-only parent, other children and all existing navigation machinery. |
| `frontend/src/app/App.test.tsx` | Add route/link/no-credential integration assertions; change only assertions actually obsolete from the three routes. Preserve unrelated negative/placeholder, personal-use and parameterized-link tests. |

Six files are absent/new, three exist on exact main. Historical components use existing shared
components/DTO and are candidates for **selective content reuse**, not a disconnected-branch merge.
Their old guarded-path comments and old assertion anchors cannot be represented as current truth.
`routes.ts`, `crossSector.ts`, `noAuthFetch.ts`, Sidebar, all server/engine files, package/lock files,
fixture corpora and original authority records remain outside this proposed product change set.
Any additive implementation/evidence record and tracker path must also be named in the actual act;
this determination does not grant open-ended documentation or product mutation rights.

## 4. One exact missing PA action; no repeated approval of settled scope

The missing action is **an express target-only NP-18 R3 selection by the existing PA**, not a new
three-view product-scope decision or governance redesign. It must:

- Name **IRR main `98c21768f77061a68470e4b4f6750d38abeec594`** and execution on the fixed session
  branch **`arena/d57c506a-iips-review-recovered`**, preserving its already-published independent work.
- Select replacement of R2's target/baseline and exact obsolete file/test/navigation bindings with
  the nine-file mapping above; reconcile R2 §7 by explicitly using the **already-approved current
  credential-free client/path unchanged**, without introducing or restoring auth/RBAC/multi-user work.
- Preserve all original content limitations: **no new risk engine, scores, grades, bands, thresholds
  or derived risk; no ranking-population or Top-25/50 expansion; no new DTO/API, unrelated contract,
  persistence, acquisition, auth or fixture changes; no orphan merge; no new LIVE freshness claim**.
  `null` stays unavailable, never fabricated zero. No untransported per-row rationale is invented.
- State its designated recording ref and effectiveness explicitly. A PA-issued act can designate
  additive recording here; main merge must not be used as a substitute for the authority decision.
- Authorize implementation only; retain separate subsequent qualification/admission/release and
  production boundaries. Validation evidence is collected, not self-adjudicated as qualification.

Evidence that resolves the gap is the **PA's explicit target/clause selection** in the operating
instruction, or an existing durable PA act with that exact selection/delegation and remote ref.
No signature ceremony, original-intent reapproval, investigation rerun or enterprise deployment is
required. The new act must be recorded additively, not by editing the original or R2.

## 5. Required later validation; no qualification performed now

After a valid target implementation grant, collect actual candidate-tree evidence: affected three
view suites and App integration; exact payload ordering, full-ranking/top-N subset identity;
aggregate-only Risk content; no derived output, fabricated null values or independent-dataset claims;
error/unavailable rendering; no credentials; provenance verbatim and SNAPSHOT-labelled; real composed
API and relevant existing product regressions; strict typecheck and production build; exact changed
file list and forbidden-path blob preservation. Reuse existing test harness/labelled certified data;
no new production fixture corpus or synthetic success. A later **separate** qualification/admission
decision must identify this actual evidence and exceptions. Test success is not that decision.

Historical qualification remains as §16.38.3 recorded: reconciliation `8d9babc…` precedes its direct
child adjudication `4357e14…`. The latter **source-reports** bounded qualification on the orphan,
687 pass / 7 fail / 15 skipped, with full-suite exceptions; certification/release not granted and
production not authorized. Neither record grants current-target implementation or qualification.
No historical suite, runtime, or capability investigation is repeated in this pass.

## 6. Actual execution / publication disposition

- **PASS:** complete authority recovery, designated-ref publication/provenance and source integrity
  checks; exact base/file-state checks; current-target scope mapping; `git diff --check`.
- **BLOCKED / NOT STARTED:** re-anchoring grant publication and dedicated implementation. No grant
  path/commit exists for a current-target act; this determination's path/commit must not be substituted.
- **NOT STARTED:** new tests, target qualification/admission, release/activation. No application code
  changed; prior evidence remains valid for unchanged code. No test result is invented for this pass.
- **Independent authorized work completed:** this evidence-only record, durable verification evidence
  and an append to the existing tracker. No IPD change or consolidated fast-track task.
- **Library synchronization BLOCKED / NOT VERIFIED:** connector unsupported; only the existing
  repository tracker can be updated/verified. No competing master.

Published through the existing active PR #114 on the fixed session branch. Final evidence-record,
tracker and commit raw-byte/blob verification coordinates are recorded in the PR after push rather
than self-embedded in a committed blob. Publication of these findings creates **no authority**.
