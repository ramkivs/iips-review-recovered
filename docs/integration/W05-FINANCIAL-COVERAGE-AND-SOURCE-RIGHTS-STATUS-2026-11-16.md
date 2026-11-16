# Snapshot-to-Live W05 — financial coverage and source rights: status and reconciliation

**Date:** 2026-11-16
**Roadmap item:** W05, "Financial coverage and source rights" (IPD `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`, blob `7affba55a5ba568333fdc2961a322c2f76b4c671`)
**Type:** record and read-only evidence. No application code, test, dataset, manifest or rights declaration is changed. Nothing was run on the Windows host and nothing was downloaded.
**Repositories read:** IRR `ramkivs/iips-review-recovered` at `main` `064195397dfdb32bf0f34a461b02fd6b9f9a8df0`, with every branch and every pull-request head; IPD `ramkivs/iips-production-market-data` at `main` `49742e3648ae1563914326ec9a76c68f84b9dc3f`, read only, with all branches and pull-request heads.
**Earlier W05 records, kept as written:** [Stage 2 record, 2026-11-10](IIPS-CURRENT-PORTFOLIO-STAGE-2-IRR-RECORD-2026-11-10.md), section 3; [qualification record, 2026-11-12](W05-ACTUAL-FINANCIAL-DATASET-QUALIFICATION-2026-11-12.md).
**Evidence folder:** [`evidence/integration/w05-financial-coverage-and-source-rights-2026-11-16/`](../../evidence/integration/w05-financial-coverage-and-source-rights-2026-11-16/README.md)

**Result.** W05 is **not complete and is not accepted**. The repository side of the rights mechanism is complete on `main`. What is missing is data and a place on `main` for the rights decisions: no issuer of the portfolio has a financial dataset, no source's terms have been reviewed, and the Principal's admission decisions for three issuers exist only on unmerged branches. Two decisions are the Principal's (section 8.2).

## 0. Summary

| Question | Answer | Section |
|---|---|---|
| Which datasets still have `UNKNOWN` source rights? | All five dataset manifests committed on `main`: four dataset versions of one issuer (Infosys Limited) and one copy. None carries a rights declaration | 2 |
| Which datasets have verified authorization for personal investment analysis? | **None is verified.** Three issuer bundles, two refreshed inputs and one candidate dataset are admitted for local personal use by the Principal's own declaration (decision `O3`). Those records are not on `main` | 3 |
| Which financial and issuer sources remain unavailable? | Statements for every issuer of the portfolio; a selected source for them; reviewed terms for any source; operating metrics; quarterly statements; ten of thirteen sectors | 4 |
| Which W05 implementation is complete? | The rights declaration, the class derived from it, and its enforcement on the CLI, the coverage read models, the HTTP route and the page | 5 |
| What remains, and what needs a rights decision? | Three repository items that need no decision, two decisions of the Principal, and three items blocked by other work | 8 |

## 1. What the roadmap asks of W05

> **Status:** local dataset mechanism exists; actual per-issuer coverage and rights unknown. **Execution:** IRR financial data and host/source operator; IPD boundaries intact. **Deliverable:** source/rights, filing/period/basis, issuer/sector/method coverage and dataset-digest dossier. **Acceptance/evidence:** verify entitlement and retention where applicable, distinguish period from import clock and zero/nil from missing/unmapped, reconcile to W04. **Blocker:** host/source evidence; a third-party rights-holder decision only if the selected source requires one. No inferred approval from provider string.

Blocker B03 of the same roadmap: source rights are "unknown, not denied"; W05 to W07 "must verify the actual source's permissible use and retention"; "do not assume the PA grants another party's rights".

## 2. Rights state of the committed datasets

Produced by [`build-dossier.mts`](../../evidence/integration/w05-financial-coverage-and-source-rights-2026-11-16/build-dossier.mts) with the product's own reader and classifier; output in [`dossier.json`](../../evidence/integration/w05-financial-coverage-and-source-rights-2026-11-16/dossier.json).

| Manifest under `evidence/real-issuer/` | Dataset version | Rights field | Class |
|---|---|---|---|
| `REL-1-INFOSYS-2026-11-06/dataset/manifest.json` | `sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e` | absent | `UNKNOWN` |
| `REL-1-INFOSYS-2026-11-06/dataset-v1/manifest.json` | `sha256:9be1a83ef198393b97465e104bef9270287bdc01a400c140a9f70927cdfa96e0` | absent | `UNKNOWN` |
| `WI2-PRICE-OBSERVATION-2026-11-06/dataset/manifest.json` | `sha256:0ef4299dde504a202b96bce06183b91f38081e0f83f7d9a2d64ec7fc204d0579` | absent | `UNKNOWN` |
| `WI3-BORROWINGS-NIL-2026-11-06/dataset/manifest.json` | `sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847` | absent | `UNKNOWN` |
| `D2-POST-MERGE-REGRESSION-2026-11-06/runs/dataset-manifest.json` | `sha256:ca29c835…` (a copy of the first, kept as run output) | absent | `UNKNOWN` |

- **Five manifests, four dataset versions, one issuer.** All are Infosys Limited, sector Technology, three annual consolidated periods ending 2024-03-31, as filed, Ind AS. The four directories pass the product reader's digest check.
- **Both classifiers agree on `main`.** For each directory the assessment path (`classifyDataset`) and the investment-coverage read model report `UNKNOWN`.
- **The other four issuers have no committed dataset.** eClerx Services, Zensar Technologies, Marico and KEC International exist as `ingest-input` directories (eight in all, for five issuers in three sectors) and as dataset versions named in run output (section 6, row 2).
- **A rebuild changes the class.** The ingestion CLI stamps every dataset it writes with `OPERATOR_ASSERTED` and gives the input directory as the basis (`iips-platform/src/investment/cli/ingest.ts`). Checked at `main`: rebuilding `REL-1-INFOSYS-2026-11-06/ingest-input` into a scratch directory reproduces `sha256:ca29c835…` exactly and carries that declaration. The same content is `UNKNOWN` as committed and `OPERATOR_SUPPLIED` when rebuilt.
- **The stamp does not distinguish.** It is the same for every input directory, admitted or not, and the CLI has no option to state another basis. The class `OPERATOR_SUPPLIED` therefore records that the operator ran the ingestion; it does not record which decision admitted the data.
- **Historical labels.** 39 committed files of the bundles (37 under `runs`, one under `withdrawn`, one bundle README) carry the retired label `APPROVED_LOCAL_INGESTION` (111 occurrences). They are kept as history. The label is no longer in the vocabulary and asserts no right.

## 3. Authorization on record

**Verified authorization, meaning a review of a source's terms, exists for no dataset.** No record in either repository claims one, and every rights record found disclaims it.

What exists is the Principal's own declaration, decision `O3`:

| Content | Instrument | Position |
|---|---|---|
| Infosys `REL-1-INFOSYS-2026-11-06`; Marico `WI7-CONSUMER-MARICO-2026-11-07`; KEC `WI8-INDUSTRIALS-KEC-2026-11-07` | `O3` decision record, 2026-11-13 | **Admitted as candidate inputs for local personal use.** Basis: the Principal's explicit declaration that the bundles come from sources he is permitted to use for personal, local investment analysis |
| The refreshed Marico and KEC inputs of `S4-R3-FILING-REFRESH-2026-11-14`, and the candidate dataset `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` (three issuers) | `O3` re-admission record, 2026-11-14 | **Admitted for local personal investment analysis**, bound to exact digests. The candidate manifest carries `OPERATOR_ASSERTED` |
| Infosys `WI2` and `WI3`; eClerx `WI5`; Zensar `WI6A-S2`; Marico `WI7-L038` | none | **Not admitted.** Both `O3` records say that admission is per bundle and is not inherited |
| The M1 demonstration dataset and the test fixtures | `sourceRights.state = SYNTHETIC` | No rights question arises |

Limits the `O3` records state for themselves, repeated here because they bound W05:

1. The declaration is the Principal's. It is **not** an independent verification of third-party licensing, publisher terms or source rights.
2. Use is single-user, local and personal. Production, hosted, multi-user and commercial use are out of scope.
3. **Redistribution is not authorised** for the bundles, for datasets derived from them or for artefacts computed from them. See section 8.2, decision 1.
4. A restated or re-digested bundle needs a fresh declaration. Record `PA-01` of 2026-11-15 then closes `O3` as a recurring gate for the personal-use path: "The owner admits their own data by using it."

**None of these records is on `main`.** They are referenced, not copied:

| Record | Where | On `main` |
|---|---|---|
| `docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` | Branch `arena/53ff9276-iips-review-recovered` at `5bf1167`, and PR #562 at `f98732e` (same blob `be627a99`) | No |
| `docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md` | Branch `arena/53ff9276-…` only; that branch has no pull request | No |
| `docs/integration/IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md` | Branch `arena/53ff9276-…` only | No |
| `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/runs/candidate-manifest.json` | Branch `arena/53ff9276-…` only | No |

Commits, blobs and SHA-256 values are in [`unmerged-rights-records-readback-2026-11-16.json`](../../evidence/integration/w05-financial-coverage-and-source-rights-2026-11-16/unmerged-rights-records-readback-2026-11-16.json).

**Host, as reported on that branch.** Its records state that the admitted three-issuer dataset is installed on the Windows host with class `OPERATOR_SUPPLIED` and rights `OPERATOR_ASSERTED`, and that the first persisted assessment of 2026-11-15 names dataset `sha256:bdfb2527…`. These are operator-reported results in unmerged records. They were not verified for this record and the host was not accessed.

## 4. Sources that are not available

| # | Not available | Basis |
|---|---|---|
| 1 | Financial statements for the issuers of the portfolio. None is ingested and none is committed | Qualification record of 2026-11-12: 0 of the 65 ISIN-resolved rows of the published 68-row surface. Not measured again. Revision 1 is treated in section 7 |
| 2 | A selected source for those statements. The five evidence issuers were transcribed by hand from issuer reports and exchange filings | XBRL ingestion reaches 21 of the 47 reported line items (dossier, `productSchema`) |
| 3 | Reviewed terms for any source used so far: issuer annual reports, NSE and BSE filings and XBRL instances, the BSE BhavCopy (one Infosys price), the Yahoo Finance chart endpoint (one eClerx price) | No terms review is recorded anywhere. The bundles' own retrieval notes name a third-party text-rendering service (`r.jina.ai`, in 17 files) as the route by which page text was read, and name the Internet Archive in 7 files. Blocker B03 stays open |
| 4 | Operating metrics. 0 records in every committed dataset; 33 are defined | Dossier |
| 5 | Quarterly statements. 0 in the committed datasets. Two KEC quarters exist only in the unmerged candidate | Dossier; read-back file |
| 6 | Ten of thirteen sectors. Real-issuer inputs exist for Technology, Consumer and Industrials | Dossier |
| 7 | The coverage report as served on the host. It has not been captured (item `R-2` of the IID branch, open there) | Unmerged IID records |
| 8 | Issuer identity for the portfolio beyond one holding. This is W04's subject and is not changed here | Section 7 |

## 5. W05 implementation

**Complete on `main`.** Each row was checked on 2026-11-16 by the tests of section 11.

| Item | Commit |
|---|---|
| A rights declaration on the dataset manifest: `SYNTHETIC`, `OPERATOR_ASSERTED` with a stated basis, `UNKNOWN` by default. A malformed declaration is refused | `a54591e` (PR #548, 2026-11-10) |
| The dataset class is derived from the declaration and from nothing else. The approval-claiming class `APPROVED_LOCAL_INGESTION` is removed | `a54591e` |
| The operator CLI publishes that class, and the limitation notices do not call unknown-rights data operator-supplied | `a54591e` |
| The coverage read models and `/api/investment/coverage/investment` classify by the declaration, expose it, and fail closed on a malformed one (defect `W05-D1`) | `6ae09ac` (PR #568, on `main` since 2026-11-16) |
| Quarterly periods are counted under the governed period type (defect `W05-D2`) | `6ae09ac` |
| The coverage page shows the class and the declaration | `6ae09ac` |
| Statement period and import clock are separate fields; a nil stated by the source and a missing value are separate presence states | Data model and read model; shown per dataset in the dossier |

**On the unmerged IID branch, not on `main`, and not judged here:** validation of sector names at ingestion; ingestion of several bundles with recorded input provenance; failure-atomic publication; installation of a verified candidate; a read-only verifier of an installed dataset; a second fix of the quarterly count.

**Where the two lines disagree.** That branch still carries the classifier that `6ae09ac` replaced, a substring test on the provider and licence text, in `coverage/investmentCoverage.ts` and `identity/coverage.ts`. Its limitation `L-041`, open there and on PR #562, describes exactly the disagreement that no longer exists on `main`. A trial merge of the branch into `main` conflicts in three files: the master tracker, `coverage/investmentCoverage.ts` and `tests/investment/investment-coverage.test.ts`. PR #562 merges cleanly.

## 6. Statements of the record of 2026-11-12 that this record replaces

The record is kept as written. A note at its top points here.

| # | Statement of 2026-11-12 | Standing | What the repository shows |
|---|---|---|---|
| 1 | Section 2: source-rights enforcement is "Remediated on branch" | Superseded | On `main` through PR #568, merge `064195397dfdb32bf0f34a461b02fd6b9f9a8df0` |
| 2 | Section 3.2: eight dataset versions, given as twelve-character prefixes | **Corrected** | The first eight characters are right; the next four are not the committed values. The committed versions are in the table below |
| 3 | Section 3.2: "absent -> `UNKNOWN`" on disk for all eight builds | Narrowed | True of the four committed Infosys directories. The builds of the other four issuers are not committed as datasets; a rebuild is stamped `OPERATOR_ASSERTED` (section 2) |
| 4 | Section 5.1: 22 XBRL tags map to 20 line items and leave 27 of 47 unmapped | **Corrected** | 22 tags map to 21 line items and leave 26 of 47 unreachable, at `6ae09ac` and at `main` alike |

Dataset versions, from each bundle's `manifest.json` or `runs/01-ingest.txt`:

| Bundle | Issuer | Prefix in the record of 2026-11-12 | Committed dataset version |
|---|---|---|---|
| `REL-1-INFOSYS-2026-11-06` | Infosys | `ca29c835398c...` | `sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e` |
| `WI2-PRICE-OBSERVATION-2026-11-06` | Infosys | `0ef4299db87b...` | `sha256:0ef4299dde504a202b96bce06183b91f38081e0f83f7d9a2d64ec7fc204d0579` |
| `WI3-BORROWINGS-NIL-2026-11-06` | Infosys | `21cf25222c14...` | `sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847` |
| `WI5-PREFERENCE-CAPITAL-2026-11-07` | eClerx | `7aa6e3f924f5...` | `sha256:7aa6e3f90ef0b2591b20ade967f41e2f876d012e6e58a03918eb0eafa1071e75` |
| `WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07` | Zensar | `a71498da7801...` | `sha256:a71498daabb31f23728f408a2a92d3fabe50efee7f2b1de4813e8e2c6a2581c7` |
| `WI7-CONSUMER-MARICO-2026-11-07` | Marico | `04c96303813d...` | `sha256:04c96303e269108803b2a5efef565eae2940ecb649b4f34998d01106a9cc6bd0` |
| `WI7-L038-DEBT-COMPLETENESS-2026-11-07` | Marico | `433358f3cfdc...` | `sha256:433358f3968616b89d89dc551f34660252f8be355866526495baaa93f764f9fc` |
| `WI8-INDUSTRIALS-KEC-2026-11-07` | KEC | `0df73ead5a72...` | `sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab` |

## 7. Reconciliation to W04

W04 was accepted as measured by the Principal on 2026-11-16: for `DHAN_PORTFOLIO` revision 1, **1 of 64 holdings has a stored security identity and 63 are unresolved** (IPD record `docs/integration/IIPS-W04-EVIDENCE-RECONCILIATION-AND-ACCEPTANCE-ASSESSMENT-2026-11-16.md`, merged by IPD PR #166 as `49742e3648ae1563914326ec9a76c68f84b9dc3f`). The tracker record of that acceptance is published separately from this record.

- The roadmap's financial metric (section K) counts a holding only when its identity passes and a rights-permitted dataset holds every mandatory input. **At most 1 of the 64 holdings can therefore count, and none is shown to count.** The issuer of the one identified holding is not in any repository, so it cannot be matched to a dataset here.
- The measurement of 2026-11-12, 0 of 65, was made against the published 68-row surface, not against revision 1. It is not restated as a result for revision 1.
- `θF` stays not established. Nothing here is a threshold.
- Financial coverage of the portfolio cannot rise above the identified count. It needs the identities of the 63 to be stored, which is future import work (IPD PR #163 is its prerequisite), and statements for those issuers.

## 8. What remains

### 8.1 Repository work that needs no decision

| # | Work | Why it is not done in this record |
|---|---|---|
| 1 | Reconcile branch `arena/53ff9276-iips-review-recovered` with `main`, keeping `classifyDataset` on both coverage surfaces, then record `L-041` as resolved. This also brings the `O3` records, `PA-01` and the candidate manifest to `main` | The branch is another line of work and was in use on the day of this record (last commit `2026-11-16T19:38:38Z`). Three files conflict |
| 2 | Let the operator state the rights basis when a dataset is written, so a manifest can name the `O3` record instead of a directory path | It changes `cli/ingest.ts`, which differs on the IID branch. Doing it before item 1 would add a conflict |
| 3 | Produce the W05 dossier for the dataset installed on the host | It needs the served coverage report to be captured on the host once. That capture is open item `R-2` of the IID branch and is not requested here |

### 8.2 Decisions of the Principal

1. **The repository is public, and the bundles are marked not redistributable.** `ramkivs/iips-review-recovered` is a public GitHub repository with an Apache-2.0 licence file at its root. Under the bundles' `source` directories it carries 135 files (about 1.6 MB): page text of issuer annual reports, exchange XBRL instances and one exchange price-file extract, with retrieval logs and locator records beside them. It also carries the transcribed inputs and the datasets built from them. The dataset manifests say `operator-supplied; not redistributable`, and `O3` says redistribution is not authorised. No record assesses the publication, and this record does not either. The decision is whether the repository stays public.
2. **The source of financial statements for the portfolio's own issuers.** None is selected. The choice decides whether any third-party permission is needed at all; the roadmap asks for one "only if the selected source requires one".

No decision is needed to keep using the three admitted issuers on the local host: `O3` and `PA-01` already cover it.

### 8.3 Blocked by other work

| Blocked item | Blocked by |
|---|---|
| Financial coverage of more than one holding | The 63 unresolved identities of W04 |
| Evidence of what the host serves | Host capture (blocker B02; IID item `R-2`) |
| Marico and KEC enterprise-to-equity values | Limitations `L-038` and `L-039` (W07) |

## 9. What this record did not do

No application code, test or configuration was changed. No dataset was installed, rebuilt in the repository, replaced or deleted. No manifest and no rights declaration was written. No source was contacted and nothing was downloaded. The Windows host was not accessed and no host step was repeated. No rights were asserted for any third party. IPD was read only. The IID branch, PR #562, PR #566 and PR #515 were not changed. No holding of any portfolio was read or named.

## 10. Validation

| Check | Result |
|---|---|
| `build-dossier.mts --check` at `main` `0641953` | Equal to a fresh build |
| Product reader over the four committed dataset directories | All four read; digests verify |
| Rebuild of `REL-1-INFOSYS-2026-11-06/ingest-input` into a scratch directory with the CLI at `main` | Version `sha256:ca29c835…`, equal to the committed one; `sourceRights.state` `OPERATOR_ASSERTED`. The scratch directory was discarded |
| W05 tests in `iips-platform` (`w05SourceRights`, `w05CoverageSourceRights`, `investment-coverage`, `investment-coverage-endpoint`) | 41 of 41 pass |
| W05 tests in `frontend` (`w05CoverageTransportRights`, `w05SourceRightsClassification`, `iidInvestmentCoverageTransport`) | 13 of 13 pass |
| Search of every IRR branch and pull-request head (1,017 refs) and of every IPD branch and pull-request head for W05 material, by path and by commit message | Nothing beyond the records named here |
| Trial merge of the IID branch and of PR #562 into `main` (`git merge-tree`, no ref written) | Three conflicted files; clean |
| Relative links of this record and of the evidence folder | All resolve |

The tests are targeted. No full suite was run for this record. It changes no code; the full suites last ran on the tree of `main` for PR #568.
