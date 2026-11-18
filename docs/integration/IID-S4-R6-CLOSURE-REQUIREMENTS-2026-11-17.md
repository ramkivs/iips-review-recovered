# S4-R6 / G-4 — what is required to close the operating-metrics item

**Type:** focused closure-requirements investigation; **not an owner decision or a closure act**.

**Record date:** 2026-11-17 (UTC). This is commit-bounded: the reviewed PR/evidence carries 2026-11-18 timestamps, retained as recorded.

**Designated branch:** `arena/5461e5b5-iips-review-recovered`.

**Review baseline:** `5fac71be58e53ad39d9d06b2e3769785114d9fe6`; fetched main `70f76134deba91de4ddca9e932542231b298cdf9`.

**Result after this work: S4-R6 OPEN; G-4 OPEN.** The investigation delivered by PR #591 remains complete and unchanged. This record resolves what the two proposed routes would need to establish; it does **not** select a route or replace the disputed acceptance criterion.

**Supporting review evidence:** [criteria, source identities and publication checks](../../evidence/iid/S4-R6-CLOSURE-REQUIREMENTS-2026-11-17/README.md).

## 1. Plain-English answer

There are two different things that could be meant by “finished”:

1. **Provide the missing data and make the methods available.** That satisfies the numeric test, provided the data really validates and the named methods actually become `AVAILABLE`. Merely adding a row, choosing this route, or proving that the software can consume metrics is not enough.
2. **Accept that these methods will remain unavailable for this population.** That is a legitimate maintenance choice for the application owner. But a bare “keep them withheld” does not satisfy the numeric test. To use it as **formal closure**, the owner must explicitly adopt that alternative as the governing closure criterion and record the bounded accepted limitation. Otherwise it is a documented limitation with the item still open.

**Neither route is complete now.** There is no real metric evidence satisfying route A, and there is no operative owner decision resolving the conflicting criteria and adopting route B. This user request asks for an investigation; it does not itself accept the limitation or change the closure rule.

**Smallest next action:** Ramki, the recorded application owner/operator, makes **one explicit choice about the closure criterion and disposition**. If closure without acquiring metrics is intended, the choice must explicitly accept the withholding limitation for the current population **as the replacement closure criterion**, not just say “leave the methods withheld.” A short attributed instruction recorded against S4-R6 is sufficient; no new committee, second approver, decision identifier or approval workflow is needed.

## 2. Already complete — preserved, not repeated

The completed work is [PR #591](https://github.com/ramkivs/iips-review-recovered/pull/591), merged as `deb94ee9918be5ed1043cc4b7f6c1309337233a7`. Its authoritative result is [the original S4-R6 investigation](IID-S4-R6-OPERATING-METRICS-2026-11-18.md), especially §§2–8, with [its existing evidence bundle](../../evidence/real-issuer/S4-R6-OPERATING-METRICS-2026-11-18/README.md).

The following are **reused recorded facts**, not new measurements:

- 14 of 38 sector/method slots require metrics; 24 are statement-only.
- There are zero real operating-metric records in the recorded assemblies.
- The two live metric gaps are Technology `EV_REVENUE` for Infosys and Industrials `EV_REVENUE` for KEC. The other twelve metric-gated slots have no issuers in their sectors; those sectors are unmeasured.
- No source-supported NRR, recurring-revenue share or book-to-bill value has been entered. The original repository search is complete; it does **not** prove no such source exists anywhere outside the repository.
- The generic ingestion, validation and gating capability was already demonstrated by twelve synthetic probes and the 25-test suite. Those are **capability evidence only**, not real metrics.
- No production defect preventing the required metric behaviour was found. Safe withholding is already implemented.

**Not repeated:** the source search, requirement-matrix derivation, metric census, synthetic probes, implementation inspection/changes, capability tests, wider regression runs, dataset construction, installation or host execution. This follow-up only reads existing records/evidence and verifies its own publication scope, links, source identities and preservation. The original record, evidence, tests and code are not edited.

## 3. The exact unresolved wording

| Existing authority | What it says | Consequence |
|---|---|---|
| [Stage-4 register](IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md) §7, S4-R6 **Exact act** | “Supply validated operating-metric records, or record that these methods stay withheld for this population” | Both courses are named as possible actions. An allowed action is not automatically sufficient closure evidence. |
| Same row, **Exact evidence that closes it** | “`operatingMetricRecords > 0` with `validation VALID`, and the named methods `AVAILABLE`” | This is a conjunction: real valid records **and** method availability. A withholding decision meets neither part. |
| [S4-R3 reassessment](IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md) §4, S4-R6 row | “Validated metric records or a recorded decision to keep methods withheld.” | This permits a decision-only alternative, unlike the numeric evidence column. |
| Original S4-R6 §§7.2/8 row 6; register's S4-R6 investigation addendum, `V2196` | Which test governs is itself an owner decision; a withholding decision alone cannot satisfy the numeric test | The completed investigation explicitly left the conflict unresolved. It cannot be erased by choosing the convenient older sentence or treating later explanatory prose as acceptance. |

The original record does **not** contain a completed choice of option A or B. The underlying technical state is clear; the ambiguity is **what result the owner will accept as closing this item**.

## 4. Route A — real metrics and observed availability

**Is it sufficient?** **Yes, if the numeric condition is actually met for the declared closure scope.** It also meets the data limb of the alternative wording. There is no need to waive the numeric test when satisfying it. The completion note should state that the numeric criterion governs, identify the target population/methods, and link the evidence rather than leaving scope implicit.

For the **existing three-issuer population**, PR #591 §7.1 explicitly identifies these two live targets:

| Target method | Required source-supported observations |
|---|---|
| Technology `EV_REVENUE` — Infosys | **Both** `TM_NRR` (PERCENT, 0–300) and `TM_RECURRING_REVENUE_PCT` (PERCENT, 0–100) |
| Industrials `EV_REVENUE` — KEC | `IN_BOOK_TO_BILL` (RATIO, 0–10) |

This is at least **three qualifying observations** to address both live targets, not an arbitrary `operatingMetricRecords = 1`. The two Technology metrics must qualify together for an eligible issuer/annual-period pair. The KEC observation must qualify for KEC's eligible annual period. The issuer periods need not be the same across the two companies.

### Evidence necessary for A

1. **A source that actually supports each metric's meaning and value.** Retain the document reference, exact locator, issuer, period/scope, unit and source lineage. Respect the existing permitted-use/source-rights rules. A label, source URL or nonempty `source_ref` by itself does not prove the figure is supported. Keep source documents outside the repository where the existing rules require; publish allowed locator/digest/verification metadata, not newly redistributed source text or payload dumps.
2. **The canonical observations.** Follow the existing `OperatingMetricRecord`/CSV contract: correct issuer/metric IDs; value, unit, `period_end`, `statement_scope`, `source_class`, `source_ref`, `observed_at` and `entered_at`. The annual period must be present for that issuer in the dataset. No missing-to-zero substitution, quarterly-for-annual substitution, conflicting or unvalidated observation qualifies.
3. **Actual validation results:** the relevant records are `PRESENT` and `VALID`; no conflict/quarantine prevents them qualifying. All other declared method inputs must also be satisfied. A new data change would need verification of **those new real observations**, not repetition of PR #591's completed synthetic capability investigation.
4. **Actual measurement/read-back:** identify the resulting dataset digest and show `operatingMetricRecords > 0` **and both named live methods `AVAILABLE`**, with the qualifying issuer/period identified. Reuse existing supported ingestion/read mechanisms; if changing an installed dataset, follow PA-01's existing backup, digest, verification and rollback safeguards. No such operation is performed by this follow-up.
5. **A concise S4-R6 completion record:** owner/operator attribution and date, numeric criterion retained, explicit population/target methods, source/evidence locators, dataset before/after identity as applicable, validation and availability result, and the resulting item status. This can be a short prospective entry linked from the S4-R6 register/tracker; no fresh recurring O3 approval ceremony or separate acceptance authority is required by PA-01.

**Limits:** “AVAILABLE” here is the existing coverage result, not a promise that the assessment produces a valuation. PR #591 §6.4 already records that coverage and assessment differ in latest-period and source-class requirements. Do not use a weak `VENDOR` record to claim an assessment unlock; it is below the recorded floor. Do not derive KEC book-to-bill by dividing the order figures: the existing source record explicitly forbids that inference. Changing that policy would be a separate decision, not the requested transcription route.

**Population boundary:** the twelve other metric-gated slots do not gain issuers or become available through these three observations. A closure note must explicitly preserve that unmeasured remainder. Nothing in this follow-up authorizes a new issuer population or certifies all fourteen slots as available. If the owner intends the numeric target to mean **all fourteen** rather than the two named live targets for the current population, that broader target must be stated; the present population cannot satisfy it. The decision must not conceal a scope reduction as a measured success.

**Current blocker for A:** no qualifying real source-supported observations have been entered, so the numeric condition is false. Source absence in the inspected evidence is a genuine data blocker, not a software/approval blocker and not proof that acquisition is impossible. Choosing A alone would leave S4-R6 open pending the data/results.

## 5. Route B — accept withholding as the final disposition

**Is a simple withholding decision sufficient under the existing numeric criterion? No.** It is allowed as an action and would document a controlled limitation, but it does not create records or make a method available. The original record §7.2 expressly says so.

**Could B be sufficient for formal decision closure? Yes, conditionally:** the application owner can explicitly adopt the alternative closure rule for this bounded item and accept its limitation. That is **a prospective criterion/disposition decision**, not a finding that the old numeric test passed. PA-01 gives the owner this maintenance authority; this investigation does not exercise it on the owner's behalf.

### Minimum operative record necessary for B

A single short, dated, attributable owner instruction/record must make all of the following clear:

1. **Scope:** S4-R6 / operating-metrics G-4, current population Infosys/Marico/KEC; specifically the two live `EV_REVENUE` gaps and the twelve other metric-gated slots with no issuers. No population expansion is implied.
2. **Choice:** retain withholding until qualifying real source-supported metrics exist. Do not enter, estimate or manufacture values to complete the item.
3. **Criterion reconciliation:** explicitly adopt the reassessment's **recorded-withholding alternative in place of the register's numeric closure evidence for this accepted-limitation disposition**. Cite the conflicting entries and original S4-R6 §7.2. Merely restating option B without this point leaves exactly the current ambiguity.
4. **Acceptance and status:** explicitly state whether this is **final accepted-limitation closure of S4-R6**, not a temporary deferral. State the G-4 disposition too. Decision-item closure does not by itself close the underlying data gap: if G-4 remains an open data limitation, say so; if G-4 is accepted/discharged under the revised criterion, say **accepted limitation, not data remediated**, and explicitly supersede its numeric closure test. Do not infer one status from the other or invent a silent split between the existing coupled labels.
5. **Evidence and honest residual:** link PR #591's existing matrix/census/source findings and capability evidence. Record that real metric records remain zero, both live methods remain `WITHHELD / MANDATORY_METRIC_MISSING`, the other twelve metric-gated slots remain in unmeasured sectors for want of issuers, and no real metric/valuation unlock is claimed. Identify what would warrant revisiting the limitation: qualifying real metrics or an explicit later owner change. No new capability test, source search, implementation, host capture or data change is required merely to accept this already-evidenced state.

**Where to record it:** a short prospective S4-R6-only decision/closure entry in the Stage-4 register (or one focused record linked by that entry), with a tracker receipt. Reuse **S4-R6/G-4**; do not create a parallel owner/approval structure or edit historical evidence to make the numeric test appear satisfied.

These are the **contents of the still-missing decision**, not a new prescribed ceremony. One explicit owner instruction can supply all of them and be recorded once. The decision is **NOT MADE in this publication**. “Investigate closure” is not permission to assert it.

## 6. Who may decide, and who supplies the data?

The repository explicitly establishes the responsible side:

- The S4-R6 register row and original investigation §§7–8 name **OWNER with OPERATOR**, and assign closure-test reconciliation to **OWNER**.
- [PA-01](IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md) §1 makes the application owner the sole operational authority; §3 **policy row G-6** specifically makes S4-R6 an ordinary maintenance choice; **policy row G-8** collapses local acceptance to the same owner/operator. These policy-table numbers are not the operating-metrics gap identifier.
- [O1 authority/context](IID-O1-IDENTITY-GOVERNANCE-PA-DECISION-2026-11-16.md) §1 explicitly identifies **Ramki** as sole decision owner for this application's architectural, governance, authorization, acceptance and implementation decisions. This identifies the existing application owner; it does not repurpose O1's identity decision as a metrics decision.

Therefore **Ramki, as application owner/operator**, chooses the disposition/closure criterion. The operator performs any actual transcription and verification needed for A through existing mechanisms; the recording agent can record the explicit choice and its evidence. No separate external repository, committee, second approver or newly appointed owner is established as a prerequisite for resolving S4-R6.

PA-01 removes approval ceremony and recurring O3 re-admission gates; it does **not** fabricate metric evidence or make “missing” and “available” the same fact. Resolving contradictory acceptance language is necessary for a truthful closure claim, not permission to operate the software.

## 7. Smallest concrete next action and present status

**Exact next action:** ask Ramki to give **one explicit S4-R6-only instruction** selecting the final acceptance criterion and scope:

- **If retaining A:** keep the numeric criterion for the named live methods of the current population (or explicitly state any broader target); keep the item open until source-supported records validate and the measured availability evidence exists.
- **If closing without metrics:** explicitly accept B as final accepted-limitation closure, replace the conflicting numeric criterion for that disposition, state S4-R6 and G-4 statuses without implying a data unlock, and preserve the existing withheld/unmeasured disclosures. Record that single instruction prospectively against S4-R6 with the existing evidence links.

That is smaller than another investigation, new tests, a new data source integration or a new approval process. **Only the second choice can close the decision item immediately on the existing zero-metric evidence**, and only after the actual owner has made and recorded that criterion/disposition choice. If the owner keeps the numeric test, acquiring and verifying the real source-supported metrics is unavoidable.

**Genuine unresolved facts:** (i) A has no real qualifying metrics/results; (ii) B has no explicit criterion reconciliation/final acceptance. No implementation defect or missing synthetic proof is established as a blocker. The current record supplies neither a new metric nor an owner instruction, so **S4-R6 remains OPEN and G-4 remains OPEN after this work**.

Scope protection: this publication changes no completed work, no source data, code or tests, and no other gap/work-item decision. It does not change the original S4-R6 record or evidence, select A/B, implement a policy, or modify unrelated roadmap work.
