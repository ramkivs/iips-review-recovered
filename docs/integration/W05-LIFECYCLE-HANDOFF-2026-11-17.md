# IRR work handoff — W05 reusable issuer-level financial-data lifecycle

**Date:** 2026-11-17 (UTC)
**From:** the W05 lifecycle implementation/review session
**To:** whoever continues IRR (`ramkivs/iips-review-recovered`) work on this line
**W05 status: IN PROGRESS — NOT COMPLETE — NOT ACCEPTED.** Nothing in this handoff changes that status, claims actual portfolio coverage, or approves any threshold.

## 1. State of the work

| Item | Value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` (IRR) |
| Working branch | `arena/dd0a8542-iips-review-recovered` |
| Base | `main` `70f76134deba91de4ddca9e932542231b298cdf9` |
| Commits on the branch | `3a93cc513d5d82106ee8b813b1c9c3aee48d7fcd` (implementation) → `40e01695bb9876ea6f0fa55df0a9c7701c009296` (review correction) |
| Pull request | **#598** — https://github.com/ramkivs/iips-review-recovered/pull/598 — **OPEN, MERGEABLE/CLEAN**, left open for the Principal. Do not merge without the Principal. |
| Change shape | 10 files, ALL additions. Zero pre-existing files modified, so every previously accepted behaviour (W05 source-rights classification, fail-closed reads, Q1–Q7, O3/PA-01/L-041/L-042 dispositions) is preserved by construction. |
| Checks | `npm run test:iid` 1629/1629 pass (339 suites) · `npm test` 678/678 pass · `npm run typecheck` clean · `git diff --check` clean. No CI workflow is configured on this branch (`gh pr checks` reports none). |
| Remote verification | All 10 file blobs on the remote branch were checked against the commit via the GitHub contents API — all MATCH. |

## 2. What exists (map)

**Implementation — `iips-platform/src/investment/lifecycle/` (new, additive):**

| Module | Purpose |
|---|---|
| `rightsRecord.ts` | W05-B dataset-level rights record: source identity/type, document reference, acquisition method/date, evidence refs (metadata/digests only — never filing text), seven purposes recorded separately, restrictions/expiry/review, status + reason. Unknown/unsupported rights FAIL CLOSED; a bare assertion or provider name is not permission; redistribution recorded but never authorised (`NOT_AUTHORISED`). |
| `qualification.ts` | W05-C per issuer-dataset qualification: freshness, period coverage/continuity, annual/quarterly identification, consolidated vs standalone, statement completeness, **required operating-metric completeness** (governed `sectorRequirements` reused; nil/zero are reports, absence is missing; unknown sector fails closed), distinct missing/nil/zero/unmapped semantics, accounting limitations, rights eligibility, integrity/provenance. Named gates incl. `REQUIRED_METRICS_PRESENT`. `technicallyValid` ≠ qualified. Results reproducible from the recorded `QualificationEvidenceSnapshot` (`evidenceDigest`, `qualificationFromEvidence`). |
| `threshold.ts` | W05-D documented/testable/configurable threshold mechanism. The value is a PROPOSAL: `PROPOSED_NOT_APPROVED`, `approvalEffect:'NONE'`, numbers taken from governed `valuation-policy/1.0.0`, θF named as the exact outstanding product-owner decision. No `APPROVED` status exists in code. |
| `issuerLifecycle.ts` | W05-A issuer-level lifecycle: identity via the established resolver; one dataset reused per issuer across holdings/portfolios; missing/stale/incomplete/rights-unknown/rights-restricted/unavailable recorded distinctly; provisioning requests via the authorized **manual** ingestion path (`cli/ingest.ts --authorization-record`) only; links to holdings + portfolio revision; never blocks portfolio creation/use; 220-holding scale tested. Also `catalogEntryFromReadPort` / `tryCatalogEntryFromDatasetDir` (fail-closed reads). |
| `reporting.ts` | W05-E issuer/portfolio report with explicit `DISTINCT_ISSUERS` and `ELIGIBLE_HOLDINGS` denominators, named exclusions, unresolved cases itemised. |

**Tests — `iips-platform/tests/investment/`:** `w05LifecycleFixture.ts` (synthetic fixtures, self-declared), `w05Lifecycle.test.ts` (acceptance 1, 2, 11, 12 + negatives), `w05Qualification.test.ts` (acceptance 3, 5–10 + metric-completeness + threshold), `w05RightsRecord.test.ts` (acceptance 4, 13 + malformed/inconsistent-provenance negatives). 40 tests total.

**Docs:** this handoff; `docs/integration/W05-ISSUER-LEVEL-FINANCIAL-DATA-LIFECYCLE-2026-11-17.md` (implementation record incl. the review correction §4.1); the pre-existing W05 records (`W05-ACTUAL-FINANCIAL-DATASET-QUALIFICATION-2026-11-12`, `W05-FINANCIAL-COVERAGE-AND-SOURCE-RIGHTS-STATUS-2026-11-16`, `W05-STATEMENT-SOURCE-RIGHTS-AND-REPOSITORY-EXPOSURE-ASSESSMENT-2026-11-17`, `W05-D1-D2-DECISION-IMPLEMENTATION-REGISTER-2026-11-17`, `W05-IID-RECONCILIATION-AND-AUTHORIZATION-REFERENCE-2026-11-17`, Q1–Q7 addendum) are unchanged and remain the governing context.

**Integration status — read this precisely:** the lifecycle modules are imported **only by their own tests**. They are verified standalone capabilities; nothing in `frontend/`, the coverage endpoints, the ingestion CLI or any served application flow uses them yet. Wiring them into an application surface is a candidate next integration step that requires the Principal/roadmap to name the intended surface — do not wire them speculatively.

## 3. Boundaries that must be preserved (standing constraints)

- IPD (`ramkivs/iips-production-market-data`) is **read-only**; no IPD modification or cross-repository writes. The IPD roadmap is currently **unverified** for this session (see §4).
- No real filing ingestion/download; no automated exchange retrieval or scraping (D3: manual only); no candidate-dataset installation on the Windows host; no production deployment or data operations.
- Source documents and filing text stay out of commits; only metadata, references, digests and evidence.
- Never invent financial values or convert missing to zero. Never invent an approved qualification threshold. Unknown/unsupported rights fail closed; provider name/operator assertion is not independent permission; redistribution stays `NOT_AUTHORISED` — do not weaken fail-closed behaviour to improve coverage figures.
- Preserve `DatasetManifest.sourceRights` semantics (`SYNTHETIC` / `OPERATOR_ASSERTED` with basis / absent-equals-`UNKNOWN`), the O3 authorization records (Infosys, Marico, KEC only — AGI not admitted), PA-01, D1/D2/D3 dispositions, and the limitation-register dispositions. Q7 is closed (PR #596) and must not be reopened.
- Do not change W07/W10 scope or claim their acceptance. Do not mark W05 complete/accepted: actual dataset coverage and the θF decision are separate outstanding matters.

## 4. Open items (exact blockers and decisions)

1. **θF — qualification threshold approval (product owner).** The mechanism and proposal exist (`threshold.ts`, `W05-THF-PROPOSAL-1`); every result is `PROPOSED_NOT_APPROVED`. Exact decision wording is in `threshold.provenance.outstandingDecision`. Until decided, Qualification is not accepted.
2. **Actual issuer coverage (operator, under D1).** 0/65 portfolio holdings covered (2026-11-12 record; unchanged and not claimed otherwise). Provision progressively per issuer: manual acquisition under D1 → evidence package (source/locator, document identity and period, dates, byte length, page count, SHA-256) → rights record (`rightsRecord.ts`) → ingestion via `cli/ingest.ts --authorization-record` where applicable. The lifecycle reports gaps and issues provisioning requests; nothing blocks portfolio use meanwhile.
3. **Authoritative roadmap verification (external dependency).** The IPD `main` file `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` could **not** be obtained from this sandbox: every method (REST contents/git/GraphQL, authenticated git remote with both auth styles, codeload, anonymous) returns 403 "Resource not accessible by integration" / "Write access to repository not granted." Diagnostic: the session's GitHub App installation token (`arena-ai-coding-agent`, installation `155853637`) lists the IPD repo (id `1361385667`, private, default branch `main`) in its installation selection but the issued token is scoped to a repository subset that excludes it. **Action:** grant the session's GitHub connection read access to `ramkivs/iips-production-market-data` (reconnect GitHub in Arena or add the repo to the connection), then capture the IPD `main` commit SHA + file blob SHA and confirm the W05 requirements/dependencies (incl. W07/W10/W15/W20 relationships) against the source. Until then the requirement comparison rests on the task brief's wording, not the authoritative file.
4. **Application-flow integration (Principal/roadmap).** Name the intended surface if/when the lifecycle should be served (e.g. coverage endpoint/front-end transport); the modules are standalone today.

## 5. How to re-verify (for the next session)

```bash
# PR and remote state
gh pr view 598 --json state,baseRefName,headRefName,headRefOid,mergeable,files
gh api repos/ramkivs/iips-review-recovered/git/ref/heads/arena/dd0a8542-iips-review-recovered --jq .object.sha
# per-file blob check (repeat per file): git rev-parse <commit>:<path> vs
#   gh api "repos/ramkivs/iips-review-recovered/contents/<path>?ref=arena/dd0a8542-iips-review-recovered" --jq .sha

# tests and checks (from iips-platform/)
npm install          # node_modules is not persisted across sandbox restarts
npm run test:iid     # 1629 tests expected green
npm test             # 678 tests expected green — if the 30 A13 tests fail with
                     # "failed to unpack tree object 5ca181c7…", the checkout is
                     # shallow: run `git fetch --unshallow origin` at the repo root
npm run typecheck    # clean
git diff --check     # clean
```

**Environment note:** sandbox restarts can roll local git refs back while the working tree persists. The remote branch is the source of truth — recover with `git fetch origin arena/dd0a8542-iips-review-recovered && git reset --hard origin/arena/dd0a8542-iips-review-recovered` after checking that any untracked files match `git rev-parse origin/arena/dd0a8542-iips-review-recovered:<path>` (`git hash-object <file>`).

## 6. Next actions, in order

1. Unblock the GitHub connection for IPD and complete the authoritative roadmap verification (§4.3); correct against the source file if its wording differs from the brief.
2. Principal reviews PR #598 and decides merge (merging is the Principal's act).
3. Product owner decides θF (§4.1).
4. Operator begins progressive per-issuer provisioning under D1 with rights evidence (§4.2); re-run the lifecycle/report to evidence coverage as it grows.
5. If the Principal names an application surface, integrate the standalone modules there (§4.4).
