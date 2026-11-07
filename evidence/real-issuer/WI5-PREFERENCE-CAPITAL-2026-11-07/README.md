# WI-5 — second issuer validation: no qualifying nil-by-disclosure for eClerx Services Limited

**Issuer.** eClerx Services Limited — CIN `L72200MH2000PLC125319` (printed in the audited consolidated signature block
and on the consolidated balance sheet), NSE `ECLERX`, BSE `532927`, ISIN `INE738I01010` (corroborated from market-data
references; not printed in the audited statements — see limitation 1).

**Question this bundle answers.** Does the audited consolidated filing declare any governed line item nil?

**Answer: no.** After review, the bundle's own earlier nil declaration — `PREFERENCE_CAPITAL` on the sentence *"The
Company has only one class of equity shares having a par value of Rs 10 per share."* — **has been withdrawn**. The
sentence is scoped by its heading (*"Terms / rights attached to equity shares"*) to equity shares and speaks about
classes of equity shares; it says nothing about preference shares. Nothing else in the filing declares preference share
capital nil, and presentation completeness is not a declaration.

The corrected dataset therefore declares **no** nil for this issuer. `PREFERENCE_CAPITAL` is empty (`NOT_REPORTED`),
the borrowings columns are numbers (the 2024-03-31 dash is an explicitly reported **zero**, not a nil), and
`CURRENT_MATURITIES_OF_LONG_TERM_DEBT` — which the filing never presents — stays empty rather than zero.

## What changed, and what did not

| | Withdrawn run (kept under `artifact/superseded/`, `runs/superseded/`) | Corrected run (this bundle) |
| --- | --- | --- |
| `PREFERENCE_CAPITAL` FY2024 | `NIL_BY_DISCLOSURE` / `DECLARED_NIL_IN_SOURCE` | `MISSING` / `NOT_REPORTED` |
| dataset version | `sha256:00db79c1…` | `sha256:7aa6e3f9…` |
| payload digest | `287622ae69fb…` | `e876296ae0fb…` |
| reportId | `c6d9d573-6e6e-468f-ae27-b037cf84b6e8` | `1c50bcbc-1031-4d77-9f1f-6d0ff45c4791` |
| adequacy / quality / confidence | `SUFFICIENT` / `MATERIAL_CONCERNS` / 0.3210 | **identical** |
| `grossDebt` / `netDebt` | `NOT_REPORTED` | **identical** |
| valuation, dividends, risk, methods | unchanged | **identical** |

A field-level diff of the two payloads is exactly six paths: the dataset digest, and the `preferenceCapital` observation
(presence/reason in three places — the annual series, the capital-structure component, and the capital-structure
summary). Withdrawing an unsupported nil changed the claim and nothing else: no figure, no ratio, no method, no
confidence. That is the expected shape, and it is why the withdrawal cost nothing analytically — the run never had a
debt position to lose.

## Contents

| Path | What it is |
| --- | --- |
| `identity/` | operator roster, listing map, corporate actions (`IIPS_INVESTMENT_IDENTITY_V1`) |
| `ingest-input/periods.csv` | three consecutive audited consolidated periods, Rs million — **no nil cells** |
| `ingest-input/roster.json`, `prices.json` | identity roster and the single recorded market observation |
| `source/preference-capital-investigation.txt` | the page-by-page search, what was found, what was not, and why the nil was withdrawn |
| `source/quotes.json` | nine quotes, each with what it establishes and what it does not; `conclusion` block records the retraction |
| `source/*.txt` | page-anchored extracts (Note 13, borrowings captions FY24/FY23, Note 40) |
| `runs/commands.txt` | the commands actually run |
| `runs/01-ingest.txt`, `02-generate.txt` | corrected-run CLI output, verbatim |
| `runs/cli-wi5-corrected.json` | full corrected run summary (dataset, identity, assessment, artifact, chain) |
| `runs/06-payload-verify.json` | separate-process readback of the corrected persisted artifact |
| `runs/superseded/`, `artifact/superseded/` | the withdrawn run's records and payload, kept so the retraction is auditable |
| `artifact/assessment-payload-wi5.json` | the corrected payload as read back from the governed store |
| `digests.json` | sha256 + byte count of every committed file |

## Why the work item still has value

WI-3 proved the nil path works where the filer declares a nil. WI-5 is the negative control: a real issuer, a real
three-period consolidated dataset, a sentence that *looks* like a nil declaration — and a governed answer of
`NOT_REPORTED` because the source does not say it. The bundle, the guard test and §17.10 keep that distinction visible:
an inference written as a declaration would be indistinguishable downstream from a real one.

## Limitations recorded here (bundle-local)

1. The ISIN is not printed in the audited statements; it is corroborated from market-data references and used only as
   the security key. The CIN, which is printed, is the issuer key.
2. The market observation is the 2026-11-06 NSE close from a public quote endpoint, because the run clock (2026-11-07) is
   a non-trading day. Price freshness refuses it (`PRICE_STALE`), so margin of safety is `NOT_COMPUTABLE` — a clock
   effect, recorded as such.
3. The search covered the balance sheet, the statement of changes in equity, Notes 13, 14, 40, 41, 46 and 47; Notes
   15–39 were not swept page by page, and the standalone statements were not re-read. No claim is made beyond the pages
   listed in `source/preference-capital-investigation.txt`.
4. The two filing PDFs are not committed; the extracts are page-anchored, and `quotes.json` records the URL, auditor and
   audit-report date for each.
