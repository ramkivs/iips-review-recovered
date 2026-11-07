# WI-5 — second issuer validation: explicit nil-by-disclosure (eClerx Services Limited)

**Issuer.** eClerx Services Limited — CIN `L72200MH2000PLC125319` (printed on the audited consolidated
balance sheet, Annual Report 2023-24, p.195), NSE `ECLERX`, BSE `532927`, ISIN `INE738I01010`
(corroborated across three independent market-data references; the ISIN is not printed in the audited
financial statements — see the limitation at the end of this file).

**Line item validated.** `PREFERENCE_CAPITAL`, declared nil on the FY2024 audited consolidated period only,
with the filer's own wording from Note 13 (p.223):

> The Company has only one class of equity shares having a par value of Rs 10 per share.

**What this work item does not do.** It declares **no** nil on any borrowings line item. eClerx's audited
consolidated statements carry a *filed dash* on the Borrowings captions at 2024-03-31 (`Borrowings 17 - 6.77`)
and non-zero balances in the two prior periods (6.77 / 3.08 at 2023-03-31; 0.50 / 0.91 at 2022-03-31). A dash
is an explicitly reported zero, not a declaration, and Note 40 characterises the Group's financial liabilities
by exclusion ("other than derivatives and lease liabilities comprises trade and other payables") rather than by
declaring borrowings nil. Reading a nil out of that would be the inference D-2 refuses.

## Contents

| Path | What it is |
| --- | --- |
| `identity/` | operator roster, listing map, corporate actions (schema `IIPS_INVESTMENT_IDENTITY_V1`) |
| `ingest-input/periods.csv` | three consecutive audited consolidated periods, Rs million, one nil cell |
| `ingest-input/roster.json`, `prices.json` | identity roster and the single recorded market observation |
| `source/quotes.json` | four quotes: the nil wording, two borrowings captions, and the exclusion wording |
| `source/*.txt` | page-anchored extracts of the texts quoted above, with "what this establishes / does not" |
| `runs/commands.txt` | the commands actually run, with their recorded output |
| `runs/01-ingest.txt`, `02-generate.txt` | CLI stdout, verbatim |
| `runs/cli-wi5-created.json` | full run summary (dataset, identity, assessment, artifact, chain) |
| `runs/06-payload-verify.json` | separate-process readback of the persisted artifact |
| `artifact/assessment-payload-wi5.json` | the payload as read back from the governed store |
| `digests.json` | sha256 + byte count of every committed file in this bundle |

## Result

`SUFFICIENT` adequacy (100% required-field coverage), `MATERIAL_CONCERNS` quality, combined confidence
**0.3210** (data 0.85, model 0.125). The nil arrives in the payload exactly as declared —
`presence: NIL_BY_DISCLOSURE`, `reason: DECLARED_NIL_IN_SOURCE`, the quoted sentence as `note`, the filing
reference and period attached.

The debt aggregate is **`NOT_REPORTED`**, not zero: `currentMaturities` has no caption in the filing, and the
implementation refuses to treat an unreported component as zero. That is the substantive cross-issuer finding
of this work item — it is described in `docs/integration/IIPS_V3_IID_WI5_PREFERENCE_CAPITAL_NIL_2026-11-07.md`.

## Limitations recorded here (not in the product register)

1. The ISIN is not printed in the audited financial statements; it is corroborated from three independent
   market-data references and used only as the security key.
2. The market observation is the NSE close of 2026-11-06 taken from a public quote endpoint
   (`YAHOO-FINANCE:…ECLERX.NS`), because the run clock (2026-11-07) falls on a non-trading day. The
   price-freshness policy therefore refuses it (`PRICE_STALE` / `PRICE_PREDATES_KNOWLEDGE_CUTOFF`), and
   margin of safety is `NOT_COMPUTABLE` for this run. This is a clock effect, not an effect of the nil.
3. Statutory-auditor confirmation of the two filings is from their signature blocks (S.R. Batliboi &
   Associates LLP, 2024-05-16 and 2023-05-25); the PDFs themselves are not committed, only page-anchored
   extracts.
