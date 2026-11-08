# WI-12 — `L-038` preference capital: does any later audited report say it is nil? (2026-11-08)

This bundle answers **one** question, and it answers it **negatively**:

> Is there, in an authoritative audited consolidated annual report of Marico Limited issued **after** the one
> already in the corpus, an **explicit statement** that establishes **issued preference share capital** —
> a value, a nil, or a stated absence of preference shares?

**No.** Across FY2023-24 (259 pp), FY2024-25 (255 pp) and FY2025-26 (279 pp) — the three most recent integrated
annual reports, the last of which was published on **2026-07-08** and is the latest audited consolidated report in
existence at the time of writing — the word *preference* appears only in

1. the **authorised**-capital table, where 7 crore preference shares of ₹10 each / **₹65 crore** are authorised at
   every reporting date from 31 March 2023 to 31 March 2026;
2. the heading of the sub-note on **equity**-share rights ("Rights, preferences and restrictions attached to
   equity shares"); and
3. the historical rows of the statement of changes in equity, recording preference shares issued by bonus in
   September 2002 and redeemed in March 2004.

There is **no sentence to quote** about issued preference capital in any of them. Under D-2 a declaration requires
quoted wording with provenance (`NIL: <quoted wording>` + `filing_ref`, never on a derived line); with nothing to
quote, `PREFERENCE_CAPITAL` stays **`MISSING` / `NOT_REPORTED`**, the enterprise-to-equity bridge stays blocked, and
**`L-038` stays `OPEN`**.

---

## 1. What was already settled before this bundle, and what it left open

| Already established | Where |
| --- | --- |
| FY2023-24 consolidated Note 12(a) shows authorised preference capital 7 crore shares / ₹65 crore at both 31-03-2023 and 31-03-2024, and an issued section made up only of equity (₹129 crore / ₹129 crore) | `WI7-L038-DEBT-COMPLETENESS-2026-11-07/source/fy24-note-12a-…-page189.txt` |
| "only one class of equity shares" is **not** a nil declaration; the eClerx precedent withdrew that inference | `WI5-PREFERENCE-CAPITAL-2026-11-07/source/preference-capital-investigation.txt`; register §17.16 |
| Preference capital remains the independent blocker of `L-038` after the two contract decisions | register §17.23, tracker §16.281 |

Two named gaps remained, and this bundle closes both:

* **FY24 PDF page 190** — assumed to carry an unextracted "Note 12(b)". §2 shows what is actually on it.
* **A post-FY24 audited report** — no such document existed in the repository. §3–§4 show that two newer ones exist,
  and what they say.

## 2. Page 190 is not a missing share-capital sub-section — it is `12(b) Reserves & surplus`

`source/fy24-page190-note12b-reserves-and-surplus.txt`, retrieved fresh from the issuer host on a runner and
**identity-matched to the corpus copy** (`bytes` 21,087,675, `sha256 03cb0db7…7595`, 259 pages — the same document
the WI-7 bundle cites). The page carries, left column, the closing items of Note 12(a):

```
(v)   For the period of preceding five years as on the Balance Sheet date, Issued, Subscribed and Paid-up Share Capital
      includes::
      Aggregate of 32,37,430 (31st March, 2023: 22,19,980) Equity shares allotted under the Employee stock option plan schemes as
      consideration for services rendered by employees for which only exercise price has been received in cash.
      Shares held by Promoters at the end of the year i.e. March 31, 2024   [23-row promoter table …]
```

and, right column, the **beginning of Note 12(b) — "Reserves & surplus"** (`Securities premium`, `General reserve`,
`Share based option outstanding account`, `Treasury shares`, `Capital reserve`, `WEOMA reserve`, `Retained earnings`,
`Adjustment pursuant to the Scheme of Capital Reduction of MCCL`). Page 191 confirms it, opening with
`(v) WEOMA reserve` and `(vi) Retained earnings`.

Two consequences, and they matter:

1. **There is no unextracted share-capital sub-section.** Note 12(a) is the whole share-capital note; its sub-items
   are (i) movements, (ii) rights attached to equity shares, (iii) shares reserved for issue under options,
   (iv) shareholders holding more than 5 %, (v) five-year issued-capital detail. Nothing about preference shares is
   hiding after (iii).
2. **The note uses "includes", not "comprises".** "(v) … Issued, Subscribed and Paid-up Share Capital
   **includes**::" is an inclusive enumeration of ESOP allotments. By the same grammar that withdrew the eClerx nil
   (WI-5), an "includes" list cannot be read as an exhaustive statement of a company's issued capital — and
   therefore cannot establish that the non-equity part is nil.

## 3. Two newer audited documents were retrieved (identity recorded, not assumed)

Retrieval ran on GitHub Actions runners because the working sandbox has no egress to `marico.com`; each file was
hashed and page-counted on arrival, and the raw locator logs are kept verbatim in `runs/`.

| Document | Bytes | sha256 | Pages | Notes |
| --- | --- | --- | --- | --- |
| Integrated Annual Report **2023-24** (control) | 21,087,675 | `03cb0db78289cdda4ffcd4b4e9f14f3b444a52a4fd64d6265578180fa9857595` | 259 | identical to the corpus copy cited in WI-7 |
| Integrated Annual Report **2024-25** | 14,370,556 | `74e0f6c239f6b611a1d66f361988a65f52bdfb51956ada929de3f4857b1e3474` | 255 | first new document; consolidated note 12(a) on PDF p.185 |
| Integrated Annual Report **2025-26** | 21,282,741 | `7ea5e097b415f4fa226d32cad95cdc6435a88c58e43c2db10d4de7b31103ec4f` | 279 | **latest** audited consolidated report; created 2026-07-08; consolidated note 12(a) on PDF p.205 |
| Annual Audited Financial Statements FY2024-25 | 5,399,768 | `63c1badce2745ebaab516c98e43eb92570b3764fda326daf6b83e312f8010ae6` | 42 | examined and **rejected as non-qualifying**: no share-capital note at all (0 pages contain *preference*; 0 contain *issued, subscribed*) |

The FY2025-26 report was found by probing the issuer's own `investorspdf` naming series after the Wayback CDX index
for `marico.com/investorspdf/*` (2,204 archived URLs) showed `Annual_Audited_Financial_Statements_FY_2024_25.pdf`
but no FY26 entry yet — i.e. the archive lags, and an archive miss is not evidence of absence. The direct fetch
settled it.

## 4. What the newer reports actually say about preference shares

Verbatim extracts are in `source/`; the page index of every *preference* occurrence in all four documents is in
`source/preference-mention-index.json`.

**Consolidated Note 12(a), all three years — same structure, authorised only.** The rupee glyph extracts as `H`
(or `J` on the FY24 page), which is a font-mapping artefact of the PDF and is reproduced, not corrected:

| Reporting date | Authorised preference shares | ₹ crore | Issued / subscribed / paid-up shown |
| --- | --- | --- | --- |
| 31-03-2024 *(FY24 p.189; FY25 p.185 col. 2024)* | 7 crore @ ₹10 | 65 | equity only — 1,29,41,01,828 @ Re. 1 = **129** |
| 31-03-2025 *(FY25 p.185; FY26 p.205 col. 2025)* | 7 crore @ ₹10 | 65 | equity only — 1,29,54,97,599 @ Re. 1 = **130** |
| 31-03-2026 *(FY26 p.205)* | 7 crore @ ₹10 | 65 | equity only — 1,29,81,48,935 @ Re. 1 = **130** |

Totals lines: authorised **165 / 295** at every date; issued **129 / 129** (FY24), **130 / 129** (FY25),
**130 / 130** (FY26). Nowhere is there an issued-preference line, a preference-capital note, or a sentence about
preference shares.

**The sub-note on rights is scoped to equity, and is internally inconsistent with its own table.** FY24 p.189, and
verbatim again on FY25 p.185 and FY26 p.205:

```
(ii)  Rights, preferences and restrictions attached to equity shares
      Equity Shares: The authorised share capital of the Company comprises of 150 Crores equity share of Re. 1 each and 8 Crores
      equity shares of H 10 each.
```

That sentence **omits** the 7 crore preference shares that the authorised table immediately above it lists. It is
the clearest available demonstration of why absence cannot be read as nil here: read exhaustively, the sentence
would say Marico has no authorised preference capital at all — which the same page contradicts. It is a statement
about *equity* rights, not a class enumeration.

**Follow-ups in the same note keep the "includes" grammar.** FY24 p.190, FY25 p.186 and FY26 p.205 all carry
"(v) For the period of preceding five years …, Issued, Subscribed and Paid-up Share Capital **includes**::", naming
only ESOP allotments (FY25: "Aggregate of 44,78,091 (31st March, 2024: 32,37,430) Equity shares…"; FY26:
"Aggregate of 8,25,267 (31st March, 2025: 44,78,091) Equity shares…").

**Preference shares demonstrably existed historically.** FY24 p.254, FY25 p.252 and FY26 p.275, statement of changes
in equity (historical rows, verbatim in `source/`):

```
August 2002     Bonus (Equity 1:1)                     200
September 2002  Bonus (Preference 1:1)                 200
May 2004        Bonus (Equity 1:1)                     400
December 2015   Bonus (Equity 1:1)                    8000
March 2004      Redemption proceeds of Bonus Preference shares   200 | 2,000 | 11
… * Dividends are inclusive of those received on Bonus Preference Shares
```

A company whose own equity statement still traces redeemed bonus preference shares is precisely a company for which
"the issued-preference row is absent, therefore preference capital is nil" cannot stand as a rule.

**Standalone statements were kept separate and add nothing.** FY24 p.233; FY25 pp.229–230; FY26 pp.250–251 — the
same authorised table (preference 7 / 65) and the same equity-only issued section, with the same equity-scoped rights
sub-note. No standalone statement establishes issued preference capital either, so there is nothing to import into,
or reconcile with, the consolidated observation.

## 5. The D-2 grammar, applied sentence by sentence

The test D-2 imposes is not "is the number absent?" but "**is there a sentence to quote, with a provenance?**"
(`NIL: <quoted wording>` plus `filing_ref`, never on a derived line — `IIPS_V3_IID_D2_NIL_BY_DISCLOSURE_2026-11-06`
§5). Applied to the three reports:

| Test | Result |
| --- | --- |
| A sentence stating issued preference capital is nil / no preference shares are outstanding | **not present** — 0 occurrences of *preference* outside the authorised table, the equity-rights heading and the 2002/2004 history rows |
| A class statement ("the Company has only one class of shares") | **not present** — 0 hits in FY24 (259 pp) and FY25 (255 pp); FY26's two hits for *single class* are "receivables are considered to be a **single class** of financial assets" (p.261) and an unrelated line on p.215 |
| An exhaustive enumeration of issued capital | **not present** — the enumeration says "*includes*" |
| An authorised-capital sentence that could be read as a class statement | **present but unusable** — scoped to equity rights and contradicted by its own table (§4) |
| Prohibition on inferring nil from absence, dashes, arithmetic, or authorised capital | **respected throughout** — no inference taken |

## 6. Rejected mappings, with the reason each fails

| # | Candidate mapping | Why it is rejected |
| --- | --- | --- |
| R1 | `PREFERENCE_CAPITAL = 0` because the issued section lists only equity, in FY24, FY25 and FY26 | **Inference from absence.** The limitation's own completion standard, and D-2 §1, forbid it: a filing that says nothing is not a filing that says nil. |
| R2 | Nil from "(ii) … authorised share capital … comprises of 150 Crores equity share of Re. 1 each and 8 Crores equity shares of ₹10 each" | Scoped to **equity**-share rights; omits authorised preference that the same page lists; an internally contradicted sentence cannot enumerate classes. |
| R3 | Nil from "(v) … Issued, Subscribed and Paid-up Share Capital **includes**::" | "Includes" is non-exhaustive by grammar — the identical wording on which the eClerx nil was withdrawn (WI-5, register §17.16). |
| R4 | Nil from the 2002/2004 bonus-and-redemption history rows | They record that preference shares **existed and were redeemed**; they say nothing about 2024–2026 and prove that absence of a row is not evidence of nil. |
| R5 | Nil from the FY2024-25 *Annual Audited Financial Statements* (42 pp) | Not a qualifying source: it carries **no share-capital note** (0 pages with *preference*, 0 with *issued, subscribed*). Silence in a shorter document is not a declaration. |
| R6 | Use authorised ₹65 crore as the value | Authorised ≠ issued. The paper §17.21/§17.23 distinction stands; ₹65 crore has been authorised and unissued throughout. |
| R7 | Arithmetic: issued total ₹129/₹130 equals the equity line, so preference must be zero | **Arithmetic residual**, expressly forbidden (§17.22, §17.23 boundary; the same class of error L-039 rejects). |
| R8 | Carry the FY23/FY24 observation forward to FY26 as "unchanged" | Anchoring / latest-complete substitution in disguise: an unchanged *absence* is still an absence, and no later document upgrades it to a declaration. |

No mapping was accepted, so **no dataset, payload, manifest or IX artefact changes** and no new limitation identifier
is consumed.

## 7. Determination

* **`PREFERENCE_CAPITAL` (Marico, consolidated):** `MISSING` / `NOT_REPORTED` — **unchanged**, now on the strength of
  three consecutive audited consolidated reports instead of one.
* **`L-038`:** stays **`OPEN`**. The investigation is complete; the *limitation* is not resolved. Its remaining
  blocker is a silence in the source, not a missing rule, and no amount of further retrieval of the same publisher
  will convert that silence into a declaration.
* **The bridge:** still withheld for Marico — `enterpriseValue → equityValue` cannot subtract an unknown preference
  claim. `netDebt`/`grossDebt` behaviour is untouched (§17.23 safeguards intact).
* **What would close it:** an audited consolidated disclosure that *states* the issued preference amount, or states
  that there are none (with quotable wording and provenance) — for example a share-capital note carrying an explicit
  nil line, a redemption schedule, or a class-of-shares sentence. Nothing in FY24–FY26 does.

## 8. Files, hashes and reproduction

| Path | What it is |
| --- | --- |
| `source/fy24-page189-tail-note12a-share-capital.txt`, `source/fy24-page190-note12b-reserves-and-surplus.txt` | FY24 consolidated Note 12(a) closing lines and the whole of PDF p.190 |
| `source/fy24-page254-…`, `source/fy25-page252-…`, `source/fy26-page275-statement-of-changes-capital-history.txt` | the statement-of-changes historical preference rows, all three years |
| `source/fy25-page185-…`, `source/fy25-page186-…`, `source/fy26-page205-note12a-consolidated-equity-share-capital.txt` | consolidated Note 12(a) of the two newer reports |
| `source/fy25-page229-…`, `source/fy25-page230-…`, `source/fy26-page250-…`, `source/fy26-page251-…` | the corresponding **standalone** notes, kept separate |
| `source/preference-mention-index.json` | every page of all four documents that mentions *preference*, *only one class* / *one class of* / *single class*, or *issued, subscribed* |
| `runs/01…04-*.txt` | the four runner locator logs, verbatim — transport ladder, identity checks, page dumps |
| `determination.json` | the machine-readable outcome |
| `digests.json` | sha256 + byte length of every file above |

Re-hashing every path against `digests.json` reproduces the bundle. Extraction method: `pdftotext -layout` on the
runners, one page range at a time; multi-column pages keep their horizontal layout, so a printed line may carry text
from two notes — **columns are never re-assembled into one logical row**, here or in the extracts.

**One normalisation, declared rather than silent.** The runner wrote its logs with trailing spaces on a handful of
lines. The published copies of those five files have trailing whitespace stripped and a single terminating newline,
which changes no column position and no character of text. The digests below are of the **published** bytes; the
digests before that trim are recorded here so the runner output can still be matched byte-for-byte against the
commits the runners themselves pushed (`.l038-temp/*` in `6ccf1de`, `695085a`, `5c03cbb`, `5630bf4`):

| File | sha256 before trim (= runner commit blob) | runner commit |
| --- | --- | --- |
| `runs/01-fy24-locator-report.txt` | `bb156ceb57f7938f61dbfdebc9e60726614dd1a31abd684960417673cd6273cb` | `6ccf1de` |
| `runs/02-fy2425-locator-report.txt` | `a9c7ce182674482c372ba177304dac789bc201d2b283f54ed19a755eed53e93b` | `695085a` |
| `runs/03-fy2526-locator-report.txt` | `a66977e4e8970b284eed2c4d5f364a80cc35971c13a24685acee2bf3bcb3a502` | `5c03cbb` |
| `runs/04-fy26-standalone-report.txt` | `07ba0222c618c4d7e9d62ed7d51821142252053aab8a086b3b48f52aab193099` | `5630bf4` |
| `source/fy26-page205-note12a-consolidated-equity-share-capital.txt` | `cd3e30043d2488a5689d3cd9225bb355647e2c57373dfea37f55ac69c36017e0` | `5630bf4` (same page, re-dumped) |

All four run logs were verified byte-identical to those runner blobs before publication.
