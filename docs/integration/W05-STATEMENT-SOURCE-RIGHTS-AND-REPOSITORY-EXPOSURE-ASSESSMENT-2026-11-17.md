# Snapshot-to-Live W05 — statement source, source rights and repository exposure: assessment

**Date:** 2026-11-17
**Roadmap item:** W05, "Financial coverage and source rights"
**Type:** assessment record and read-only evidence. No application code, test, dataset, manifest, rights declaration, authorization record or evidence bundle is changed. Nothing was run on the Windows host. No filing, dataset or market-data file was downloaded.
**Repositories read:** IRR `ramkivs/iips-review-recovered` at `main` `b74237f1c330be0e1d3287ae633bcaece9c5f901`. IPD at `main` `b4a9f0f3601c2c56960aa15796370af0b7664d39`, read only: one record and one evidence file.
**Earlier W05 records, kept as written:** [status record, 2026-11-16](W05-FINANCIAL-COVERAGE-AND-SOURCE-RIGHTS-STATUS-2026-11-16.md), whose section 8.2 poses the two decisions this record prepares; [reconciliation record, 2026-11-17](W05-IID-RECONCILIATION-AND-AUTHORIZATION-REFERENCE-2026-11-17.md).
**Evidence folder:** [`evidence/integration/w05-statement-source-rights-and-repository-exposure-2026-11-17/`](../../evidence/integration/w05-statement-source-rights-and-repository-exposure-2026-11-17/README.md)

**Status.** W05 remains **IN PROGRESS, NOT COMPLETE, NOT ACCEPTED**. `L-041` and `L-042` remain OPEN. The `O3` records and `PA-01` are unchanged. This record admits no issuer, authorises no redistribution and does not authorise installing the S4-R3 candidate dataset.

**Grades used below.** **V** verified here: read at the address and date given, counted by a committed script, or read from a committed file. **S** statute or regulation text. **O** the Principal's own declaration on record. **A** assumption, not verified. **R** recommendation of this assessment. **D** decision that is the Principal's. The assessment reads terms and statutes. It is not legal advice and does not decide how a rights holder or a court would apply them.

## 0. Result

| # | Question | Answer | Grade |
|---|---|---|---|
| 1 | Recommended primary source | The issuer's own filings under SEBI LODR regulations 33 and 34 (financial results with their XBRL instance; the annual report), **taken by hand by the Principal from NSE's corporate-filings pages for personal use and kept on the local host**. The issuer's own copy ranks equally and is the route for a security not listed on NSE. BSE's website serves as locator and cross-check. No scripted retrieval from either exchange | R; needs D1 |
| 2 | Personal-use access and retention | NSE permits viewing, printing and downloading for personal, non-commercial use, with acknowledgement and without alteration. The Copyright Act treats a private copy for personal use or research, including electronic storage, as no infringement. No source read states a retention period. BSE's website grants no such permission in what was read | V, S; section 2 |
| 3 | Issuer coverage and gaps | NSE and BSE between them list every holding of the committed 68-row surface: 67 on NSE, 1 on BSE only. No issuer of that surface has an admitted statement source: 68 of 68. The 64 holdings of revision 1 are not named in any repository | V; section 4 |
| 4 | Repository exposure | The public repository reproduces third-party filing text: 114 source files (1,625,555 bytes) and five run reports that print filing pages (600,088 bytes). The Principal's own `O3` records say redistribution is not authorised | V; section 5 |
| 5 | Handling from now on | Source documents and page text stay on the local host. The repository receives locators and digests. Existing evidence is not touched | R; section 6 |
| 6 | Decisions of the Principal | Two: confirm the source (D1); decide how long the existing reproduction stays public (D2). A third only if scripted retrieval is wanted (D3) | D; section 7 |
| 7 | Effect on W05 | The rights side of the source is narrowed for personal, local, manual use once D1 is given. Financial coverage stays at 0 of 64 measured; at most 1 holding can count until W04 stores more identities | V; section 8 |

## 1. What was examined

- **Terms and law.** Fourteen sources, listed with addresses, reading method and the passages relied on in [`external-sources.json`](../../evidence/integration/w05-statement-source-rights-and-repository-exposure-2026-11-17/external-sources.json). Eight pages were read once each with the session's page reader; six are excerpts returned by a web search and are marked so.
- **Not done, on purpose.** No page of either exchange was opened for any issuer of the portfolio, and no filing was requested. Checking 64 issuers by script is the systematic collection that NSE's terms prohibit (section 2.1), and the task forbade downloads. Availability per issuer therefore rests on the legal duty and on listing status (section 3, row 1).
- **Repository.** Every tracked file under `evidence/real-issuer/` was classified by [`build_inventory.py`](../../evidence/integration/w05-statement-source-rights-and-repository-exposure-2026-11-17/build_inventory.py); the result is [`inventory.json`](../../evidence/integration/w05-statement-source-rights-and-repository-exposure-2026-11-17/inventory.json).
- **Host remark.** For requests to `www.nseindia.com` the page reader reported the host `www.nseindia.in`. The pages define the website as `https://www.nseindia.com/`, and the search index lists the same clauses at the `.com` address. Whether `.in` is NSE's redirect or the reader's rendering was not determined.

## 2. What the terms and the law say

### 2.1 NSE (V)

| Source | What it says | Consequence for IIPS |
|---|---|---|
| Copyright policy, updated 21/10/2025 | "Users may view, print copies and download the Content for personal, non-commercial or educational purpose" without altering it and with "full acknowledgement that the Content originated from this Website" | **Download by hand for personal use is permitted.** The dataset must name its origin |
| Same | No content may be "reproduced on or transmitted to or stored in any other website or in other form of electronic retrieval system" | **A public repository may not carry it** |
| Same | The permission does "not extend to any content which is identified as being copyright of a third party"; that needs the copyright holder | An issuer's annual report is the issuer's work. NSE's permission does not clearly reach it (question Q2) |
| Terms of Use, updated 29/10/2025, clause 8 | Content may not be copied, reproduced, "stored (either in hardcopy or in an electronic retrieval system)", distributed, published or "hyperlinked" without prior written permission; "Unless the information or Content is available for download, not to aggregate, copy or duplicate" | Downloadable files may be copied. Whether a local dataset is an "electronic retrieval system" is open (Q1) |
| Clause 9 | "User is prohibited to conduct any systematic or automated data collection activities (including scraping, data mining, data extraction and data harvesting)" | **Scripted retrieval is prohibited.** The clause states no exception |
| Clauses 7 and 13 | Terms change without notice; no unreasonable load | The position must be re-read when the terms change |
| `robots.txt` | Allows all paths except `/market-data-test` | A crawler convention. It grants no right and does not displace clause 9 |
| Paid Corporate Data page | Licensed corporate data: INR 1,060,000 by leased line; INR 500,000 a year for the end-of-day file | The licensed route to automated data. Its terms were not read |

Neither NSE document states a retention period.

### 2.2 BSE (V)

| Source | What it says | Consequence for IIPS |
|---|---|---|
| Disclaimer of `www.bseindia.com`, undated | All proprietary rights in information received from the website "remain the exclusive property of BSE"; "Any reproduction, redistribution or transmission, for consideration or otherwise ... is strictly prohibited" | **No republication** |
| Its Copyright Notice | No part of the information "may be reproduced or transmitted in any form by any means, without the express written consent of BSE" | **No permission to download or keep a copy for personal use was found on this website** |
| Terms & Conditions linked from it | A licence for BSE's freeware tools only | Does not address filings |
| `robots.txt` | The address returned the website's 404 page | Nothing read |
| Terms of the separate BSEPlus site | Personal use; extracts may be printed or downloaded; no database "by regularly or systematically downloading" | Another site's terms. Not shown to govern `www.bseindia.com` (A) |

### 2.3 Statute and regulation (S)

- **SEBI LODR, 2015.** A listed entity submits its financial results to the stock exchange (regulation 33) and its annual report (regulation 34), sends the annual report to shareholders (regulation 36), and publishes both on its own website (regulation 46). Read in the Gazette text as notified in 2015. The present hosting periods of regulation 46 (results two years, annual report five years) were read in secondary renderings only.
- **Companies Act, 2013, section 136.** The financial statements are sent to every member, and a listed company places them on its website. The Principal is a member of every company he holds. Read in a secondary rendering.
- **Copyright Act, 1957, section 52(1)(a)(i) and its Explanation.** Fair dealing with a work "for the purposes of private or personal use, including research" is no infringement, and "the storing of any work in any electronic medium" for that purpose is none either. Read in the Copyright Office text. The exception covers private use. It does not cover publication.

### 2.4 What is verified, assumed and declared

| Verified (V, S) | Assumed (A) | Declared by the Principal (O) |
|---|---|---|
| NSE permits personal download and forbids scripted collection and republication | `nsearchives.nseindia.com`, where the filing files sit, is part of the website those terms govern | The three admitted issuers come from sources he is permitted to use for personal, local analysis (`O3`) |
| BSE forbids reproduction and grants no personal download right in what was read | Each portfolio issuer's filings are in fact present on its exchange. Inferred from the duty; not checked per issuer | The repository stays public during implementation and becomes private afterwards. Stated in the task of 2026-11-17; no repository document records it |
| The law gives every member the financial statements and allows a private copy for personal use | A local single-user dataset is not an "electronic retrieval system" in NSE's sense, or is covered by the download permission | |
| No source read permits publication of copies | Figures as such are not protected by copyright. A general principle; not researched for India here | |

## 3. The six questions of the source assessment

| # | Question | Finding | Grade |
|---|---|---|---|
| 1 | Availability of annual reports and quarterly statements | Required by law for every listed entity, at the exchange and on the issuer's website. The bundles show it in practice for the evidence issuers: an NSE filing index of 20 rows and a results list of 36 rows for KEC with XBRL and PDF files (`WI12-L039-CURRENT-INVESTMENTS-2026-11-05`), annual reports in the NSE archive, a 15.7 MB report from BSE. Not checked for any portfolio issuer | S; V for the evidence issuers; A for the portfolio |
| 2 | Is automated retrieval technically feasible? | **On NSE, yes**: the same bundle records scripted requests to three NSE endpoints for one issuer from a GitHub-hosted runner; the results list answered with 36 rows and the filing index with 20, each with file addresses. **On BSE, partly**: its announcement API answered 403; attachment files and the price file answered 200. NSE publishes no developer interface for filings. The product's XBRL mapping reaches 21 of its 47 reported line items, so the annual-report PDF is needed in any case | V |
| 3 | Personal-use access, download, local storage, retention | NSE: download by hand permitted; retention not limited and not addressed. BSE: not permitted in what was read. Law: a private copy with electronic storage is no infringement; a member receives the statements by right | V, S |
| 4 | Restrictions | Scripted collection: prohibited by NSE. Reproduction on another website, redistribution, publication: prohibited by both exchanges and outside the private-use exception. Alteration: prohibited by NSE. Hyperlinking NSE content: needs permission on the wording of clause 8 | V |
| 5 | Local retention with a repository free of copies | **Yes.** The bundles already identify each document by address, byte length and SHA-256 without carrying it (`source-bytes.json`, `page-map.json`). What they carry in addition is the page text. The data root is outside the working tree by designation (`O3` record, section 11), and `.gitignore` already excludes `.iips-data/` | V |
| 6 | Do NSE and BSE suffice? | By listing, yes: 65 rows of the surface are NSE series EQ, 2 are NSE series BE, 1 is on BSE only ([WS-A record](WS-A-68-ROW-IDENTITY-ASSESSMENT-RECONCILIATION-2026-11-09.md), section 1.3). Revision 1 has 63 NSE rows and 1 BSE row. **The BSE-only holding needs the issuer's own copy**, because BSE's terms give no verified right. Eight names of the surface look like financial-sector issuers, two of them banks, whose statement format differs; that is a matter of W07 and was not assessed | V; A for the format remark |

## 4. The `O3` boundary and the issuers without an admissible source

**The boundary, as the records state it (O).** Both records are unchanged; their digests are in [`portfolio-source-gap.json`](../../evidence/integration/w05-statement-source-rights-and-repository-exposure-2026-11-17/portfolio-source-gap.json).

| Admitted | By | As |
|---|---|---|
| `REL-1-INFOSYS-2026-11-06`, `WI7-CONSUMER-MARICO-2026-11-07`, `WI8-INDUSTRIALS-KEC-2026-11-07` | [`O3`, 2026-11-13](IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md) | Candidate inputs for local personal use; exactly these three bundles |
| The refreshed Marico and KEC inputs under `S4-R3-FILING-REFRESH-2026-11-14/ingest-input/`, the retained Infosys input, and the candidate dataset `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` | [`O3` re-admission, 2026-11-14](IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md) | By exact digest. Admission is not installation |

- **Not admitted:** Infosys `WI2` and `WI3`, eClerx `WI5`, Zensar `WI6A-S2`, Marico `WI7-L038`, every other bundle, any restated or re-digested content, and every other issuer.
- **Basis:** the Principal's declaration. Both records say it is not a verification of third-party terms.
- **Limits:** one user, local host, personal analysis; no production, hosted or commercial use; **no redistribution of the bundles, of datasets derived from them or of artefacts computed from them**; not transferable.
- **`PA-01`:** `O3` is closed as a recurring gate: "The owner admits their own data by using it." The same record says it "is not a licence or rights determination".

**Issuers without an admissible source (V).**

| Population | Without an admitted source | Basis |
|---|---|---|
| The committed 68-row surface of 2026-11-06, `evidence/integration/b04-dhan-isin-nse-2026-11-06/source.csv` | **68 of 68**: every row of that file | No ISIN of the file equals any ISIN named in the real-issuer bundles, admitted or not (`portfolio_source_gap.py`) |
| `DHAN_PORTFOLIO` revision 1, 64 holdings | **64 of 64, unless a holding is Infosys, Marico or KEC** | Its CSV (import digest `a3c3ee76…`) is in no repository; IPD holds a sanitized output without identifiers. The names cannot be read here. On the earlier surface none is one of the three (A for revision 1) |
| The one holding with a stored identity | 1 of 1, same condition | Its issuer is in no repository (tracker §16.286) |

The names are not repeated here: the file above holds them, and a second copy would add to what the repository publishes.

## 5. Repository exposure

### 5.1 State of publication (V)

- `ramkivs/iips-review-recovered` is **public** (GitHub API, 2026-11-17), created 2026-08-13, with an Apache-2.0 licence file at its root and "Apache License 2.0" in its README. There is no notice that excludes third-party content from that licence.
- The first bundle reached `main` on 2026-11-06 (commit `98f3e45d`, PR #486), the first source file the same day (`accf9c10`).
- Forks 0, stars 0, watchers 0. The remote has 457 branches and 577 pull-request refs; how many carry the bundles was not counted. The repository is not in the Software Heritage archive. Clone and view counts could not be read: the traffic API answered 403 to this session. They are on the repository's Insights page.

### 5.2 Inventory of `evidence/real-issuer/` (V)

27 bundles, 570 files, 5,757,047 bytes, and two files at the folder root. Rules and per-file result are in the evidence folder.

| Class | Files | Bytes | Content |
|---|---|---|---|
| **Source data** | 114 | 1,625,555 | 103 text files of filing pages and notes (1,515,720 bytes): Marico 37, KEC 28, Infosys 19, Zensar 12, eClerx 5, Newgen 1, Sasken 1. 6 files of quotations. 4 compressed XBRL or rendered filing files of KEC from the NSE archive (42,465 bytes; 714,452 unpacked). 1 row of a BSE price file |
| **Source text inside evidence** | 5 | 600,088 of 665,385 | Run reports of `WI12-L038` and `WI12-L039` that print 42 filing pages between page markers |
| **Derived data** | 81 | 381,773 | 40 files of transcribed ingestion input, 40 dataset files, 1 file of selected XBRL facts |
| **Metadata** | 58 | 211,656 | Digest ledgers, page maps, document digests, identity files, retrieval logs |
| **Evidence** | 317 | 3,538,063 | Run output, assessment payloads, determinations, READMEs. Includes the five reports above |

- **Where the text came from.** By the address in each file's header: issuer websites for 76 of the 103 text files (`kecrpg.com` 26, `marico.com` 21, `infosys.com` 19, `rpggroup.com` 6, `eclerx.com` 4); `bseindia.com` for 7; the NSE archive for 2; 18 name their document without an address.
- **How much of each document.** Whole pages of the primary statements and notes: 10 of 259 pages and 7 of 224 for Marico's two reports, 14 of 215 and 6 of 206 for KEC, 6 of 167 and 5 of 180 for Zensar. Infosys and eClerx files are single notes.
- **Where the bundles that hold admitted material stand.** They carry 33 of the 114 source files. 27 sit in the three bundles admitted on 2026-11-13: `REL-1` none, `WI7` 12, `WI8` 15. The other 6 sit in the S4-R3 bundle, where the re-admission of 2026-11-14 covers only the specified ingestion inputs and the candidate dataset.
- **Files in a `source` directory:** 146 (1,761,607 bytes). The status record counted 135 at `0641953` by the bundle-level rule, which now gives 143; S4-R3 added 8.
- **The marker `not redistributable`** stands in 11 evidence files: dataset manifests, copies of them and reports that quote them. Eight are under `evidence/real-issuer/`. It is the default text that the ingestion CLI writes (`iips-platform/src/investment/cli/ingest.ts`). It is the product's own label, not a term read from a source: one of the eleven is the manifest of a synthetic fixture dataset (`evidence/iid/IID-0-FOUNDATIONS-2026-11-05/`).
- **How the content was obtained, by the bundles' own logs.** `curl` on throwaway GitHub Actions runners, an assistant fetch tool, and a page-rendering service: 17 files name `r.jina.ai`, and seven name the Internet Archive. Requests went to `www.nseindia.com/api/` endpoints and to `api.bseindia.com`.

### 5.3 Does the publication create an identifiable concern? (V for the facts; the judgement is this assessment's)

**Yes, in three respects.**

1. **Third-party text is published without a recorded permission, under a licence file that does not exclude it.** The page text is the issuers' work. The private-use exception does not cover publication. The Principal's own `O3` records say redistribution is not authorised. 27 of the 114 source files sit in the three bundles admitted on 2026-11-13, and 6 more sit in the S4-R3 bundle, where the re-admission of 2026-11-14 covers only the specified ingestion inputs and the candidate dataset.
2. **Exchange-hosted content is reproduced, and its collection is on record.** Four files from the NSE archive, page text printed from NSE-hosted results, page text of a BSE-hosted report and one BSE price row are in the repository; both exchanges forbid reproduction elsewhere. The logs record scripted requests to NSE endpoints on 2026-11-08, after the terms of 29/10/2025 that prohibit automated collection. **Whether clause 9 was breached is not decided here.**
3. **It persists.** The files are in Git history. Removing them from the tree would not remove them from history, and making the repository private ends public access without recalling a copy already taken and without authorising the earlier publication.

**Scale, stated so the concern is not overstated.** About 2.2 MB of text from seven issuers' public statutory filings, reproduced for verification, with no commercial use, in a repository with no forks or stars.

**Beside the rights question.** The repository also publishes the Principal's own holdings with quantities and values: five committed CSV files carry the 68 rows. That is his own data and no third party's right. It is named because it bears on the same visibility decision.

### 5.4 What can remain and what should be held locally (R)

| Material | Finding | Recommendation |
|---|---|---|
| Code, tests, documents | No concern | Remain |
| Metadata: locators, digests, page maps, logs | No third-party text. Clickable links to NSE files touch the "hyperlinked" wording of clause 8 (Q5) | Remain |
| Derived data and computed evidence | Figures, transcribed and computed by the project. `O3` nonetheless withholds redistribution of derived datasets and computed artefacts, and the KEC quarter figures of S4-R3 come from NSE-hosted files | Can remain; the Principal's call under D2 |
| The 114 source files and the five run reports | Third-party text | **Belong on the local host.** Not moved now: relocation needs explicit authorisation, would break the digest ledgers and one test (`w07FinancialLimitationResolution.test.ts` reads a `source` file), and would leave history unchanged |
| Source documents of any further issuer | — | **Never committed** (section 6) |

## 6. Handling from now on (R)

1. **Retrieval by hand.** The Principal downloads each document himself, one at a time, on the host. No script, runner, relay or assistant fetch tool is pointed at either exchange.
2. **Source stays local.** PDF, XBRL and page text live under the local data root, outside the working tree.
3. **The repository gets the locator, not the text:** issuer, document, period, filing date, address, page, byte length and SHA-256 of the document and of each page text. A reviewer re-obtains the document and compares digests.
4. **The manifest names its basis.** For example: "Issuer filing under SEBI LODR regulation 33/34, downloaded by hand from NSE on <date> for personal use; NSE Copyright policy as updated 21/10/2025; Copyright Act s. 52(1)(a)(i)." This is the acknowledgement NSE requires and the basis field the manifest already has.
5. **Document and channel are recorded separately** in the W05 dossier. Rights in the document are the issuer's; the conditions of access are the channel's.
6. **Derived inputs and datasets of portfolio issuers stay local** until D2 is answered.
7. **Existing evidence is left exactly as it is.**

## 7. Decisions of the Principal (D)

| # | Decision | Options | Recommendation | If nothing is decided |
|---|---|---|---|---|
| **D1** | The statement source for the portfolio's issuers (status record 8.2, decision 2) | Confirm row 1 of section 0, or name another source | Confirm. For manual, personal, local use **no third-party permission is needed on the terms and law as read**, so the roadmap's condition "only if the selected source requires one" is not met. Q1 to Q4 below stay open | No source is selected; nothing can be ingested for a portfolio issuer |
| **D2** | The existing public reproduction (status record 8.2, decision 1) | (a) Leave it until the planned switch to private. (b) Bring the switch forward. (c) Authorise relocation of the 119 files | The existing decision stands and this record does not ask to change it. It records that the exposure of 5.3 lasts while the repository is public and that only the switch ends it; (c) achieves little while history is public. What depends on public visibility is not known here | (a) applies |
| **D3** | Scripted retrieval | Ask NSE in writing, or take a licensed product, or do without | Do without. The licensed product costs INR 500,000 a year or more | Manual retrieval |

No decision is needed to keep using the three admitted issuers locally, and none to admit a further issuer: under `PA-01` the Principal admits his own data by using it. This record admits none.

**Rights questions left open.**

| # | Question |
|---|---|
| Q1 | Is a local single-user dataset an "electronic retrieval system" under NSE's clause 8 and Copyright policy? |
| Q2 | NSE's download permission excludes third-party copyright content. The personal copy of an issuer's report then rests on the Copyright Act. Can website terms narrow that exception? |
| Q3 | Does BSE permit a personal download from `www.bseindia.com`? Nothing read says so |
| Q4 | The terms of the issuers' own websites. None was read |
| Q5 | Do the retrievals on record fall under NSE's clause 9, and published links to NSE files under "hyperlinked"? |
| Q6 | May transcribed figures and datasets be published? `O3` withholds it today |
| Q7 | LODR as amended, in SEBI's own text |

None of them blocks D1. Q1 to Q4 would be settled by one written question to each exchange or by counsel, if the Principal wants certainty.

## 8. Effect on W05 and on other work

| Item | Effect |
|---|---|
| Blocker B03, "verify the actual source's permissible use and retention" | Narrowed. The terms of NSE and BSE and the governing law are now read and recorded. Issuer-site terms and Q1 to Q7 are not |
| W05 deliverable | The source and rights columns of the dossier can be filled for any dataset built under section 6. No such dataset exists |
| Financial coverage | Unchanged: 0 holdings shown to count; at most 1 of 64 can, until W04 stores the other 63 identities. The first unit of work after D1 is that one holding |
| Effort | Per issuer, by hand: the annual reports and results, then transcription. XBRL reaches 21 of 47 line items |
| S4-R3 candidate dataset | Not installed and not touched. Its KEC quarter figures are the one place where an admitted input meets NSE's clause 9 (5.3, item 2) |
| `L-041`, `L-042` | OPEN, untouched |
| W07, W10, W12, W15, W20 | Still wait for datasets of portfolio issuers. `L-038` and `L-039` are unchanged |
| W04, IID | Not reopened |

## 9. What this record did not do

No code, test, dataset, manifest, rights declaration, `O3` record, `PA-01`, limitation register or evidence bundle was changed. Nothing was deleted, rewritten, sanitized or moved. No dataset was rebuilt or installed. No filing, dataset or market-data file was downloaded and no exchange content is stored by this record beyond short quotations of terms. No issuer was admitted. No redistribution was authorised. IPD was read only. The Windows host was not accessed. No tracker identifier was used. W05 was not marked complete or accepted.

## 10. Validation

| Check | Result |
|---|---|
| `build_inventory.py --check` | Equal to a fresh build |
| `portfolio_source_gap.py --check` | Equal to a fresh build |
| Digests of both `O3` records, `PA-01` and the limitation register against `main` | Unchanged |
| `git diff --check`; relative links of this record and of the evidence folder | Clean; all resolve |
| Files changed | One record and one evidence folder, all new. No existing file is modified |
