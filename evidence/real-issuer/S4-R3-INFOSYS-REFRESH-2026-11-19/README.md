# S4-R3 Infosys Successor Refresh — FY2025 + FY2026 (2026-11-19)

*IID Stage 4 — ticket `S4-R3-Infosys` (Data Supply + Proof). Append-only successor
bundle; no historical evidence bundle is modified. This bundle ingests the
operator-supplied audited consolidated annual financials for Infosys Limited
FY2025 and FY2026, records their O3 successor admission, and verifies the
resulting candidate dataset. It does not install, operate, or accept anything,
and it does not close `S4-R3` overall.*

## 0. Boundaries

- **No freshness policy, assessment clock basis, accepted period definition,
  valuation policy, XBRL tag map, or ingestion-contract rule was changed.**
- The FY2026 annual basis is **233 days** old at the 2026-11-19 clock and
  remains **STALE**, exactly as for Marico and KEC. This work clears the
  exceptional 963-day Infosys lag; it does not make Infosys fresh and does
  not lift `STALE_STATEMENTS`.
- Candidate verification is **not** installation, live verification, or
  acceptance. The successor candidate was built under `/tmp` outside the
  repository and is **not installed** on any host.
- No IPD repository file was created, edited, moved, or deleted; no pull
  request was merged; L-033 / G-15 / §17.39 records are unmodified.

## 1. Source and provenance

The source is an operator-supplied payload (sole decision owner, 2026-11-19),
preserved **verbatim** at `source/operator-supplied-payload-2026-11-19.json`
(SHA-256 `590a9dec2ae94227d8494764e73f694318235e81ec09b882b3a3264cb950ab56`)
before any transcription. Operator-declared admission metadata:
`source_type: SEBI_LODR_REG33_AUDITED`, `permission_status:
PUBLIC_STATUTORY_FILING_VERIFIED` (SEBI LODR Regulations, 2015 filings on
BSE/NSE and Infosys Investor Relations), auditor **Deloitte Haskins & Sells
LLP**, audit opinion **UNMODIFIED**. Entity identity reconciles against the
admitted roster: CIN `L85110KA1981PLC013115`, ISIN `INE009A01021`, NSE
`INFY`, BSE `500209`, INR Crore.

**Honesty boundary:** no filing PDF/XBRL was fetched (network: NONE) and
payload-to-filing verification is **NOT_CLAIMED** in this session. The
payload's FY2024 baseline reference was reconciled **exactly (14/14 fields)**
against the committed admitted FY2024 row before transcription — including
the schema-alignment determination below — and every arithmetic relation the
payload supports was hand-checked (`runs/03-derived-handchecks.json`).

## 2. Schema alignment: the Net Income mapping (confirmed before writing)

The FY2024 baseline row (`REL-1-INFOSYS-2026-11-06/ingest-input/periods.csv`)
maps **`NET_PROFIT` = 26,248 (total PAT including NCI)** and carries the
owners' share separately as **`NET_PROFIT_ATTRIBUTABLE_TO_OWNERS` = 26,233**
(`xbrl.ts`: `ProfitLossForPeriod → NET_PROFIT`,
`ProfitLossAttributableToOwnersOfParent → NET_PROFIT_ATTRIBUTABLE_TO_OWNERS`;
Marico's refresh rows follow the same mapping). The identical mapping is
applied to the new rows — `total_pat → NET_PROFIT`,
`profit_attributable_to_owners → NET_PROFIT_ATTRIBUTABLE_TO_OWNERS` — with no
remapping. Full payload→column mapping, the payload fields with no CSV column
(`operating_profit_ebit`, P&L NCI), and the 19 contract columns left blank
(`NOT_REPORTED`, never invented or carried forward) are recorded in
`data-extraction.json`. One payload-internal inconsistency is recorded, not
resolved: FY2026 `operating_profit_ebit + other_income − finance_cost =
40,160 ≠ PBT 39,995` (Δ −165) in a field the contract does not ingest.

## 3. Successor input and transcription

`probe/build_infosys_refresh.py` (re-running reproduces the input
byte-for-byte) preserves the admitted FY2022–FY2024 rows byte-for-byte,
copies the admitted roster byte-for-byte (SHA-256 `426e8478…`), and appends
**FY2025 first, then FY2026**, so the annual series 2022→2026 is consecutive
and YoY growth is unbroken:

| Filing | Period end | Filed | Revenue | Net profit (total) | Owners | Basic EPS |
|---|---|---|---|---|---|---|
| FY2025 `INFY-INDAS-CONSOL-FY25` | 2025-03-31 | 2025-04-17 | 162,990 | 26,750 | 26,713 | 64.50 |
| FY2026 `INFY-INDAS-CONSOL-FY26` | 2026-03-31 | 2026-04-23 | 178,650 | 29,474 | 29,440 | 71.58 |

(INR Crore except EPS. FY2026 `filed_at` is the Reg. 33 results date, the
baseline convention; the 2026-05-30 annual-report date is recorded in
`source-selection.json`. The FY2026 ₹869 Cr tax-reversal note is preserved
in the source payload; values are ingested `AS_FILED`.)

Successor input digest:
`sha256:93d2ddc3e1dbf1dec6d45ea17bbdedb48c9de21875178caf9ccbc23a6201a50f`;
`periods.csv` SHA-256 `87728ec81892ec08cc707a651a9d00861ef7a0993f65f0db7346da9c55f2b8dd`.

## 4. Candidate build and verification (2026-11-19)

Authoritative ingestion CLI, three inputs (Infosys successor + the unchanged
O3-admitted Marico and KEC successor inputs, digests re-verified identical
to their 2026-11-14 admitted values), pinned clock `2026-11-19T00:00:00.000Z`:

- **New candidate dataset:** `sha256:ce341a125445de1f30b48d150a925151749b69623250e86bbc12c408a0bd0003`
  (`datasetVersion` == `contentDigest`; supersedes `sha256:bdfb2527…` for
  successor use), 3 issuers, **13 annual + 2 quarterly = 15 periods, 0
  ingestion issues** (`runs/01-candidate-ingest.txt`).
- **Integrity:** `readDataset` loads the package; Infosys annual series
  2022–2026 consecutive with zero sequence gaps; values scale-checked
  (CRORE → INR) against the payload (`runs/02-freshness-2026-11-19.json`).
- **Handchecks** (`runs/03-derived-handchecks.json`): owners+NCI = total
  PAT, PBT − tax = PAT, revenue + other income = total income,
  attributable equity + NCI = total equity — PASS for both years; YoY:
  revenue +6.07% / +9.61%, owners' PAT +1.83% / +10.21%.

## 5. Freshness at the 2026-11-19 clock (unchanged policy)

| Issuer | Annual valuation basis (end / filed) | Before → **after** | Status |
|---|---|---|---|
| Infosys | FY2026, 2026-03-31 / 2026-04-23 | 963 → **233 days** | **STALE** |
| Marico | FY2026, 2026-03-31 / 2026-05-05 | 233 → **233 days** | **STALE** (unchanged) |
| KEC | FY2026, 2026-03-31 / 2026-05-16; latest quarter 2026-09-30 separate | 233 → **233 days** | **STALE** (unchanged) |

The 963-day Infosys lag is cleared to parity with the other issuers — and no
further. All three bases exceed the unchanged 200-day window (last
permissible annual period end 2026-05-03); `STALE_STATEMENTS` remains raised
for every issuer.

## 6. Status disposition

- **`S4-R3-Infosys`: data-supply residual DISCHARGED (2026-11-19).** Its
  closure evidence — a committed source-supported Infosys period — now
  exists: two committed, O3 successor-admitted annual periods. Recorded in
  the O3 successor admission record
  (`docs/integration/IID-O3-S4-R3-INFOSYS-SUCCESSOR-ADMISSION-2026-11-19.md`)
  and limitation register §17.40. This is resolution of the **data
  ingestion / O3 admission** limb only.
- **`S4-R3` overall / L-043: OPEN.** Freshness limb unmet for all issuers;
  closure still requires an annual period end ≥ 2026-05-03 at the
  assessment clock (in practice FY2027, filed ~April 2027) or an owner
  policy decision outside this bundle.
- **Marico / KEC governance: untouched** — inputs, digests, statuses
  unchanged.

## 7. Artifact digests

See `digests.json` (beside this README) for the SHA-256 digest of every file
in this bundle. Candidate bytes live outside the repository and are exactly
reproducible from the three committed inputs via the authoritative CLI at
the pinned clock — reproducibility, not the sandbox path, is the evidence.
