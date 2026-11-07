# IIPS v3.0 — WI-6: the second issuer search, and why it ends without a nil

**Work item.** WI-6 — second successful real-issuer nil-by-disclosure validation. Technology only, IRR only; IPD
untouched.
**Outcome.** **Negative.** No qualifying nil was found; nothing was ingested or persisted; the objective remains unmet.
**Bundle.** `evidence/real-issuer/WI6-SECOND-ISSUER-NIL-SEARCH-2026-11-07/` (`digests.json` covers every file).

## 1. WI-5 closed out first

PR #501 (head `d30a931`) was checked against five conditions before merging: the unsupported eClerx preference-capital
nil is withdrawn (no nil cell in `periods.csv`; `preferenceCapital` is `MISSING`/`NOT_REPORTED` in the current payload);
the superseded run and payload are retained under `runs/superseded/` and `artifact/superseded/` and are marked withdrawn
in the bundle README; dataset `sha256:7aa6e3f9…`, payload `e876296ae0fb…` and §17.10 agree; `L-036` is still
`PARTIALLY RESOLVED` and `L-035` still `OPEN`; and no file under the WI-3 or WI-4 bundles changed. The PR was mergeable
and was **squash-merged as `d863d3e`**. A clean clone of `origin/main` then reproduced 24/24 bundle digests and 9/9
guard tests.

## 2. What WI-6 had to find

An explicit, quoted declaration by a **listed Indian Technology issuer's audited consolidated statements** that a
governed line item (borrowings, current maturities, preference capital) is **nil**, for a stated period. Not a dash, not
an absent caption, not arithmetic completeness, not an exclusion list, not a related-party or financial-liability
implication, and not "only one class of equity shares".

## 3. What the search found

`candidates.json` records ten issuers with the filing examined and the verdict. The essentials:

| Issuer | Primary finding | Verdict |
| --- | --- | --- |
| Newgen Software Technologies | Note 19 Borrowings (p.262): ₹219.92 lakh current at 31-Mar-2024; ₹423.55 lakh at 31-Mar-2023 | rejected — non-zero |
| Sasken Technologies | consolidated Notes 13–15, 32–34: no borrowings note, no nil wording; Note 15(c) is the scoped "only one class of **equity** shares" sentence; Note 32 defines adjusted net debt as total liabilities less cash | rejected — silence, and the eClerx trap in the same form |
| Zensar Technologies | filing unreadable (HTTP 403 NSE, 403 mirror, 404 BSE); a secondary aggregator attributes "The Company does not have any outstanding borrowings as at 31 March 2024 and 31 March 2023" to its notes | **blocked — named next candidate** |
| Birlasoft | company-site PDF yields an empty text layer; only FY2022-23 MD&A says "no borrowings" | rejected — MD&A is not audited |
| TCS, Tata Elxsi, HCLTech, Mphasis, Persistent, LTIMindtree, Happiest Minds, subsidiary filers | carried forward from WI-5, unchanged | rejected there; not re-litigated |
| Tanla, KFin, Capgemini Technology Services India | borrowings ≠ 0; front matter only and financial-services classification; unlisted | rejected |

**The exact blocker.** A nil can only be recorded from text that was read. The one candidate whose secondary evidence
matches the required form — Zensar — could not be read: the NSE annual-report archive refused the reader with HTTP 403
(reference #18.1668dc17.1794028603.32167b5a), the storage mirror returned 403, and the BSE annual-report path returned
404. Reading a secondary aggregator instead would repeat exactly the error WI-5 was corrected for, one level further
from the source.

## 4. Consequences

None to the product or to any stored artifact:

* no `periods.csv`, no dataset version, no assessment, no payload, no chain version was created for WI-6;
* no nil was declared anywhere, and no zero was substituted for one;
* the WI-3 (Infosys) and WI-5 (eClerx) bundles are byte-identical — the guard test verifies both bundles' own digests to
  prove it;
* `L-036` remains `PARTIALLY RESOLVED`, `L-035` remains `OPEN`, `L-001` … `L-034` untouched. Nothing was closed to make
  the work item look complete.

**Objective status: unmet.** Infosys remains the only issuer with a validated explicit nil-by-disclosure. Sector
expansion stays deferred, as instructed.

## 5. Comparison with the two prior issuers

| | Infosys (WI-3) | eClerx (WI-5, corrected) | WI-6 |
| --- | --- | --- | --- |
| Wording | "The Group has no outstanding borrowings." + "only one class of shares … and has no debt" | none that qualifies (equity-class sentence only) | none found |
| Governed lines declared nil | 4 (three borrowings + preference capital), FY2024 | 0 | 0 |
| Payload effect | `grossDebt`/`netDebt` `DERIVED`, net cash ₹19,342 crore | `preferenceCapital` `NOT_REPORTED`; debt aggregates unavailable | n/a — no artifact |
| Lesson carried | a declaration can carry a nil | a scoped sentence cannot | an unreadable filing cannot either |

The three cases together pin the boundary from both sides: what a nil needs (Infosys) and the two things that look like
one and are not — a scoped sentence (eClerx) and an unverifiable one (Zensar).

## 6. Verification

| Check | Result |
| --- | --- |
| `npx tsx --test tests/investment/wi6SecondIssuerSearch.test.ts` | see `runs/02-guard-test.txt` |
| `npx tsc --noEmit` (iips-platform) | see `runs/03-typecheck.txt` |
| clean clone | bundle digests + guard test, see `runs/04-clean-clone.txt` |
| WI-3 / WI-5 bundles untouched | asserted by the guard test against their own `digests.json` |

No ingestion, generation or persistence command was run, so there is no chain version, payload digest or readback to
report — and none is claimed.

## 7. Next step, recorded so the next pass starts here

Read Zensar's FY2023-24 consolidated statements from a reachable copy of the filing (NSE archive when it stops refusing
the reader, or the BSE attachment), and check the borrowings note and the liquidity-risk note for the sentence the
aggregator reports. If it is there, quote it with page and note, take three consecutive periods (FY2024, FY2023,
FY2022), and run the standard pipeline. This document does not pre-commit that result.
