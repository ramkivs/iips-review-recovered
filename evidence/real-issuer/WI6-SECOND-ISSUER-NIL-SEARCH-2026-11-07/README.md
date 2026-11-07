# WI-6 — second issuer search: no qualifying nil-by-disclosure found

**Outcome: negative.** No listed Indian Technology-sector issuer examined in this pass (Infosys and eClerx excluded by
instruction) has an audited consolidated filing that declares a governed line item nil. **No dataset was ingested, no
assessment was generated, no artifact was persisted, and no nil was declared.** The objective — a second issuer besides
Infosys with a genuinely supported explicit nil — remains **unmet**.

This bundle is the record of the search: what was read, what it contained, what could not be read, and why the
pipeline was not run.

## Why nothing was ingested

D-2 records a nil only where the audited source **declares** it, in words, for the same period, on the same basis. Three
tempting substitutes were checked and refused:

| Tempting evidence | Why it is not a nil |
| --- | --- |
| A borrowings caption showing a dash, or no caption at all (TCS, Tata Elxsi, Sasken, Zensar's results statement) | presentation, not a declaration — this is the rule WI-5 was corrected for |
| Equity reconciling arithmetically to a complete decomposition | an inference, however strong |
| "The Company has only one class of equity shares" (Sasken Note 15(c), and the withdrawn eClerx sentence) | scoped by its heading to **equity** shares; says nothing about preference capital or borrowings |
| A Management Discussion and Analysis sentence (Birlasoft FY2022-23) | not the audited financial statements |
| A secondary aggregator quoting the sentence (Zensar) | cannot establish a nil; the primary filing must be read |

## Candidates examined in this pass

| Issuer | What the filing showed | Verdict |
| --- | --- | --- |
| **Newgen Software Technologies** (`L72200DL1992PLC049074`) | Note 19 Borrowings: ₹219.92 lakh current at 31-Mar-2024, ₹423.55 lakh at 31-Mar-2023 (deferred payment liabilities) | rejected — borrowings are non-zero |
| **Sasken Technologies** (`L72100KA1989PLC014226`) | consolidated Notes 13–15, 32–34: no borrowings note, no nil wording; Note 15(c) is the scoped equity-class sentence; Note 32 measures adjusted net debt as total liabilities less cash | rejected — silence is not a declaration |
| **Zensar Technologies** (`L72200PN1963PLC012621`) | primary filing unreadable: HTTP 403 (NSE archive), 403 (storage mirror), 404 (BSE path); a secondary aggregator attributes "The Company does not have any outstanding borrowings as at 31 March 2024 and 31 March 2023" to its notes | **blocked, not established** — named next candidate |
| **Birlasoft** (`L72100PN1997PLC106834`) | company-site PDF returned an empty text layer; the only "no borrowings" wording located is FY2022-23 MD&A | rejected — MD&A is not an audited disclosure |

Carried forward from the WI-5 pass (already rejected there, unchanged): TCS, Tata Elxsi, HCLTech, Mphasis, Persistent,
LTIMindtree, Happiest Minds, and the subsidiary filers. Also rejected here: Tanla Platforms (borrowings ≠ 0),
KFin Technologies (front matter only; financial-services classification), Capgemini Technology Services India (unlisted).

## Contents

| Path | What it is |
| --- | --- |
| `candidates.json` | the candidate register: issuer, CIN, filing examined, evidence class, finding, verdict, reason |
| `source/newgen-fy24-note-19-borrowings.txt` | page-anchored extract, Note 19, p.262 |
| `source/sasken-fy24-note-15-equity-share-capital.txt` | page-anchored extract, Note 15(c), pp.194–196 — the scoped sentence, recorded as a non-nil |
| `source/sasken-fy24-note-32-capital-management.txt` | page-anchored extract, Note 32, p.217 |
| `source/access-blockers.txt` | the exact HTTP failures that blocked Zensar and Birlasoft |
| `runs/commands.txt` | the retrievals performed and the verification commands |
| `digests.json` | sha256 + byte count of every committed file |

## What would turn this into a success

Read Zensar's FY2023-24 Integrated Annual Report **consolidated** statements (pp.248–321) from a reachable copy of the
filing, and check the borrowings note and the liquidity-risk note. If the sentence "The Company does not have any
outstanding borrowings as at 31 March 2024 and 31 March 2023" appears there in the consolidated notes, it is a
candidate nil for `LONG_TERM_BORROWINGS` / `SHORT_TERM_BORROWINGS` — the item must be quoted verbatim, with page and
note, and three consecutive periods must be sourced. Nothing in this bundle pre-commits that outcome.
