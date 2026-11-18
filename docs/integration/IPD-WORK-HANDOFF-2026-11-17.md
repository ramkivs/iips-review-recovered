# IPD work handoff — W05 financial-data lifecycle line

**Date:** 2026-11-17 (UTC)
**From:** the IRR-side W05 lifecycle implementation/review session
**To:** whoever continues the **IPD** (`ramkivs/iips-production-market-data`) work on this line
**Storage note:** this handoff is committed in **IRR** because IPD is read-only to this session (no IPD modification or cross-repository writes were performed or are permitted here). If IPD-side convention wants it in IPD, copy it across at the start of the IPD work under IPD's own authority.
**Status:** W05 **IN PROGRESS — NOT ACCEPTED**. Nothing here changes that status, claims actual portfolio coverage, requests a θF decision, or requests application integration.

**Updated 2026-11-18 after the final targeted review** (four findings corrected — the historical denominator, the identity gate and W04, which "method" the roadmap means, and entitlement/retention beyond the rights record; detail in `W05-ROADMAP-RECONCILIATION-2026-11-17.md` §8).

**Updated 2026-11-17 after the authoritative roadmap reconciliation** (IPD record `d418ce2`; roadmap blob `7affba55a5ba568333fdc2961a322c2f76b4c671` at IPD `main` `2685562522f1a2fd1d745a7857f771bf21453315`, W05 at lines 148–149). The seven corrections and their disposition are in `W05-ROADMAP-RECONCILIATION-2026-11-17.md`; this handoff reflects them.

## 1. Why this handoff exists

This session implemented, tested and reviewed the W05 reusable issuer-level financial-data lifecycle **entirely in IRR**. Per the authoritative roadmap, **W05 execution belongs to IRR and the operator**; **IPD's role is limited to its roadmap and supporting records**. This handoff gives the IPD side what it needs for that role — the context of what IRR produced, the reconciliation of it against the roadmap, and the corrected statements — and, for visibility, what IRR and the operator own next.

## 2. What the IRR side produced (context for the IPD side)

| Item | Value |
|---|---|
| Pull request | **IRR #598** — https://github.com/ramkivs/iips-review-recovered/pull/598 — held for the Principal. On 2026-11-18 the Principal instructed a final targeted review, correction and a merge conditional on that review; the PR's actual state is GitHub's to report (`gh pr view 598`), not this document's. A merge is not W05 acceptance. |
| Branch / commits | `arena/dd0a8542-iips-review-recovered` on `main` `70f76134deba91de4ddca9e932542231b298cdf9`; commits `3a93cc5` (implementation), `40e0169` (metric-completeness correction), `31c10c1`/`e527ae6` (handoff), plus the roadmap-reconciliation corrections of 2026-11-17 and the final-review corrections of 2026-11-18 (this document's commit). |
| Change shape | All additions — zero pre-existing files modified. Accepted behaviour (W05 source-rights classification, fail-closed reads, Q1–Q7, O3/PA-01, limitation dispositions) is preserved by construction and pinned by unchanged tests. |
| What was built | `iips-platform/src/investment/lifecycle/`: rights record (fail-closed, per-purpose permissions, **entitlement and retention verified side by side** and both verdicts carried through qualification into the report, redistribution never authorised); per-issuer dataset qualification (freshness, periods, basis, statement and required-metric completeness — **the required-metric set is provisional pending W10** — distinct missing/nil/zero/unmapped, accounting limitations, rights eligibility, integrity/provenance); the **per-dataset qualification ruleset** (technical, no approval axis — explicitly NOT θF); the issuer-level lifecycle (identity-resolved mapping, one dataset reused per issuer, progressive provisioning via the authorized **manual** path only, distinct coverage states, >200 holdings); and reporting with explicit denominators, **coverage by issuer, sector and analytical method** (the roadmap's "method"; method requirements provisional pending W10), a separately labelled source/rights breakdown by acquisition method (not the method dimension), the separate entitlement and retention verdicts per issuer, and the financial ratio with its identity rule and the basis on which each identity was resolved. |
| θF | Per the roadmap: θF is the **portfolio-wide financial ratio that gates W20** — not a per-dataset qualification threshold and **not a W05 condition**. It is set from **observed evidence under the standing grant**; no defensible value can yet be asserted, so none is asserted (`THETA_F`, `NO_DEFENSIBLE_VALUE_ASSERTED`) and the W20 gate fails closed. **No θF decision is requested for W05**, and no product-owner approval dependency exists for it. |
| Coverage position | **Unmeasured for W04 revision 1.** The only measurement on record is the historical 2026-11-12 one over a different census: **0 of 65 ISIN-resolved rows of the published 68-row Dhan CSV** matched an issuer with a dataset (0 of 68 rows). W04 revision 1 has **64 holdings**; none of them has been processed, so no "0 of 64" result exists and none is stated. The IPD W04 record shows a stored security identity on 1 of the 64, which bounds the revision-1 numerator at one — a property of the W04 census, not something this code enforces. Detail: `W05-ROADMAP-RECONCILIATION-2026-11-17.md` §4. |
| Identity gate and W04 | A holding reaches the financial ratio only when the identity resolver returns `RESOLVED` for the observation supplied. That is **not** the same statement as "W04 identity-passed": the resolver also resolves on exchange and symbol where a row has no ISIN, and the lifecycle does not read the W04 census. The report discloses the resolution basis; **the reconciliation to W04 is outstanding**. |
| Tests | 62 W05 tests (32 qualification incl. the θF semantics set, the separate rights verdicts and coverage by analytical method; 14 rights incl. retention verified alongside entitlement; 16 lifecycle incl. coverage dimensions, the rights verdicts in the report and the identity gate). `npm run test:iid` 1651/1651 green (344 suites); `npm test` 678/678 green; typecheck clean. |
| Integration status | The lifecycle modules are **standalone** — and that is **not a W05 gap**: W05 does not require integration into a served application flow or an IPD endpoint. Coverage display belongs to **W17 in IRR**. |
| Detail records | `W05-ISSUER-LEVEL-FINANCIAL-DATA-LIFECYCLE-2026-11-17.md` (implementation record), `W05-ROADMAP-RECONCILIATION-2026-11-17.md` (this reconciliation). |

## 3. Ownership of what comes next

**IPD side (roadmap and supporting records only):**
1. Keep the roadmap and its supporting records current — including this reconciliation trail (IPD record `d418ce2` and its extract are the authoritative side; this document and `W05-ROADMAP-RECONCILIATION-2026-11-17.md` are the IRR-side counterpart).
2. Confirm the seven corrections recorded in the IRR-side reconciliation match the roadmap wording (W05 at lines 148–149), or note any residual difference for IRR to correct.

**IRR + operator (W05 execution):**
1. **Progressive per-issuer provisioning under D1** (manual acquisition from permitted primary sources, evidence package per issuer, rights record per dataset with retention verified alongside entitlement, ingestion via `cli/ingest.ts --authorization-record`) — this is what turns Coverage from mechanism into evidence. D3 stands: no automated retrieval.
2. **θF set from observed evidence under the standing grant** as that evidence accrues — a recorded observed-evidence setting, not a decision or approval. It gates W20 (currently fail-closed). Not a W05 condition.
3. **W10** establishes the required-metric set; until then the metric-completeness set stays marked `PROVISIONAL_PENDING_W10` and is not presented as settled.
4. **Reconciliation to W04** — run the actual revision-1 holdings through the lifecycle and reconcile the result to the W04 census, holding by holding. Not done; no figure for revision 1 exists until it is.
5. **The actual W05 dossier** — source/rights, filing/period/basis, issuer/sector/method coverage and dataset digests for the actual holdings, with entitlement and retention verified per actual source. Not done.
6. **Principal disposition of PR #598** — the Principal instructed a final targeted review and a conditional merge on 2026-11-18; merging the mechanism does not accept W05.

## 4. Boundaries held — and to keep holding

- **IPD was not modified.** All access attempts were read-only (all failed with 403). No cross-repository writes. This handoff is the only IPD-adjacent artifact, and it lives in IRR.
- No real filing ingestion/download; no automated exchange retrieval or scraping (D3); no candidate-dataset installation on the Windows host; no production deployment or data operations.
- Source documents and filing text stay out of commits; only metadata, references, digests and evidence.
- No invented financial values; missing is never zero; **no numerical threshold invented** and none asserted for θF. Unknown/unsupported rights fail closed — retention included; provider name/operator assertion is not independent permission; redistribution remains `NOT_AUTHORISED`.
- `DatasetManifest.sourceRights` semantics preserved; O3 admissions unchanged (Infosys, Marico, KEC only — AGI not admitted); PA-01, D1/D2/D3 dispositions, Q7 closure (PR #596) and the limitation-register dispositions untouched. W07/W10 scope unchanged and not claimed.
- **W05 must not be marked complete or accepted**: actual dataset coverage remains unestablished (revision 1's 64 holdings are unmeasured), the reconciliation to W04 is outstanding, and the required-metric set and the method requirements are provisional pending W10. θF is NOT a W05 condition.

## 5. Evidence and pointers

- IRR PR #598 (state/head/files: `gh pr view 598 --json state,baseRefName,headRefName,headRefOid,mergeable,files`); per-file blob SHAs via `git ls-tree origin/arena/dd0a8542-iips-review-recovered` — the IPD side can compare these against GitHub's UI when IRR reads are available to it.
- IRR docs: `W05-ROADMAP-RECONCILIATION-2026-11-17.md` (the seven-point disposition — start here), `W05-ISSUER-LEVEL-FINANCIAL-DATA-LIFECYCLE-2026-11-17.md` (implementation record), `W05-ACTUAL-FINANCIAL-DATASET-QUALIFICATION-2026-11-12.md` (the 2026-11-12 measurement — 0 of 65 ISIN-resolved rows of the 68-row Dhan CSV, a different census from W04 revision 1 — retained as history), `W05-D1-D2-DECISION-IMPLEMENTATION-REGISTER-2026-11-17.md` (D1 evidence-package fields, D2/D3), `W05-STATEMENT-SOURCE-RIGHTS-AND-REPOSITORY-EXPOSURE-ASSESSMENT-2026-11-17.md`, `W05-RIGHTS-QUESTIONS-Q1-Q7-ADDENDUM-2026-11-17.md`.
- IPD-side authority: roadmap blob `7affba55…` at `main` `2685562522…` (SHA-256 `875938b087bca87415c5215283967049d331d609383095ecc93adfe7e5e98e89`, W05 lines 148–149), reconciliation record `d418ce2`.
- Re-verification commands and a sandbox-recovery note (local git refs can roll back on restart; the remote branch is the source of truth; `git fetch origin arena/dd0a8542-iips-review-recovered && git reset --hard …` after checking untracked files with `git hash-object`) are in the IRR implementation record and were exercised during this session.

## 6. Next actions, in order

1. IRR + operator: begin progressive per-issuer provisioning under D1 with rights + retention evidence (§3).
2. IRR + operator: let θF be set from observed evidence under the standing grant as it accrues; W20 stays fail-closed until then (§3).
3. Keep the required-metric set marked provisional pending W10 (§3).
4. IRR + operator: reconcile an actual revision-1 run to the W04 census (§3).
5. Principal's disposition of IRR PR #598 (§3).
6. IPD: fold this reconciliation into the roadmap's supporting records, or note residual differences for IRR to correct (§3).
