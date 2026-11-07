# WI-6A — Zensar primary-source recovery: the consolidated question stays open

**Outcome: unsuccessful, and no data change.** WI-6A was commissioned to settle one question — does the
*consolidated* section of Zensar Technologies' FY2023-24 Integrated Annual Report declare borrowings nil? It does
not get an answer here, and the bundle does not pretend otherwise. The consolidated statements (printed pp.248-321)
were **not retrieved** by any reader available to this run, so **no observation was created, no nil declared, no
dataset ingested and no assessment generated**. Zensar is recorded as **investigated, unsuccessful**.

Two things *were* settled, and they bound the answer independently of the missing pages:

1. **The sentence belongs to the standalone statements.** The filing publishes standalone statements from printed
   page 176 and consolidated statements from printed page 248. The sentence the owner located sits at printed
   pages ~246-247 — *before* the consolidation boundary. It is a statement about Zensar Technologies Limited, not
   about the Group, and D-2 does not let a standalone declaration be transferred to consolidated data.
2. **The page boundary is not a technicality.** The same group's consolidation papers show a subsidiary carrying
   borrowings in its own right, which is exactly the assumption a parent-only "no borrowings" sentence would
   smuggle into group figures. (Recorded as a caution, not as evidence — it comes from an aggregator and is not
   used for any number.)

## Why nothing was ingested

| Tempting step | Why it was not taken |
| --- | --- |
| Treat "The Company does not have any outstanding borrowings…" as the consolidated nil | it is a standalone declaration; the filing separates the two sets of statements at p.248 and the sentence sits at pp.246-247 |
| Assume the consolidated notes repeat the sentence because the standalone ones do | an assumption is not a reading, and no page was ever rendered |
| Treat the unreadable pp.248-321 as "nothing there" | a page that was never rendered is not a silence, a dash or a nil — this is the WI-6 error, one step earlier |
| Cite a secondary aggregator that reproduces the sentence | an aggregator cannot establish a nil, and it does not show which set of notes the sentence came from |
| Build a three-period table with blank consolidated columns | three unread periods are not evidence; the check is recorded as `NOT_PERFORMED`, not as "nil in all three" |

## What was actually read

The front matter, end-to-end, from **two independent copies of the same document** — the NSE origin
(`nsearchives.nseindia.com/.../AR_24514_ZENSARTECH_2023_2024_1507202421929.pdf`) and the RPG Group mirror — which
agree word for word:

* the transmittal letter to BSE and NSE, dated 15 July 2024: **Scrip ID ZENSARTECH, Scrip Code 504067, Symbol
  ZENSARTECH, Series EQ**, subject "Notice of 61st Annual General Meeting and Integrated Annual Report for FY
  2023-24", signed Rajiv Mundhra;
* the contents spread: **176 Standalone Financial Statements**, **248 Consolidated Financial Statements**;
* the Index: Standalone then Consolidated statements, Glossary p.322, SASB p.327, SDG Linkage Index p.328.

CIN and ISIN are **not** in the readable window and are therefore recorded as `NOT_VERIFIED_FROM_FILING`. They are
not imported from company-registry aggregators to make the identity block look complete.

## Why the consolidated pages were not reached

Every route is listed, with its exact status, in `source/access-log.txt`. In short:

* the **NSE origin serves the file** — the direct reader starts reading it — but stops inside the front matter
  (about 55 printed pages, ~100 KB of text); the same cap applies to the RPG Group mirror, so it is a *reader*
  limit, not a server limit;
* the **text-rendering proxy that paginates whole documents** is refused by the NSE archive: `HTTP 403`, Akamai
  reference `#18.1668dc17.1794028603.32167b5a` — a *proxy* refusal, correcting WI-6's note that treated it as an
  origin block;
* the mirror returns **empty** through that proxy; the storage mirror returns **403**; the BSE annual-report path
  returns **404**; the BSE announcement API is Referer-gated; the Wayback Machine has **no snapshot**; the public
  CORS proxies are themselves blocked.

None of those outcomes says anything about what pages 248-321 contain. They say this environment cannot read them.

## Contents

| Path | What it is |
| --- | --- |
| `determination.json` | the structured result: status, scope finding, what was and was not created, the new limitation |
| `periods.json` | the three-period record — every period `NOT_RETRIEVED`, the check `NOT_PERFORMED`, with the reason |
| `source/cover-letter-and-index-extract.txt` | the parts of the filing that *were* read, verbatim, from both copies, plus the scope arithmetic |
| `source/standalone-sentence-user-report.txt` | the owner-reported sentence, marked as not read by this run, with the scope determination and the caution against transfer |
| `source/access-log.txt` | all fourteen retrieval attempts with exact statuses, and what the log does and does not establish |
| `runs/commands.txt` | the retrieval and verification commands performed |
| `runs/02-guard-test.txt` | output of this bundle's guard test |
| `runs/03-typecheck.txt` | output of `tsc --noEmit` |
| `runs/04-clean-clone.txt` | reproduction from a clean clone |
| `digests.json` | sha256 + byte count of every substantive file (7); it never records itself, and this bundle's own run logs `runs/02`, `runs/03`, `runs/04` are excluded by name |

## What would turn this into an answer

Read printed pp.248-321 of **this same filing** from a place where the pages can actually be rendered — the
consolidated balance sheet, the consolidated statement of changes in equity, every borrowings / loans / lease /
financial-liabilities note, the auditor's report and the liquidity-risk note. If the consolidated notes carry an
affirmative sentence about consolidated borrowings for both 31 March 2024 and 31 March 2023, quote it verbatim with
printed page and note number, verify the same basis for FY2022-23 and FY2021-22, and only then run the existing D-2
pipeline unchanged. If they do not, Zensar stays investigated-and-unsuccessful and no artifact is created.

This bundle pre-commits neither outcome.
