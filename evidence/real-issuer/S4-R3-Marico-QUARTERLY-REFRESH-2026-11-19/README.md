# S4-R3 Marico Quarterly Successor — Q1 + Q2 FY2027 (2026-11-19)

*IID Stage 4 — `S4-R3` Marico quarterly series (Data Supply + Proof). Append-only
successor bundle; no historical evidence bundle is modified. This bundle ingests
the operator-supplied reviewed consolidated quarterly financials for Marico
Limited Q1 FY2027 and Q2 FY2027 alongside the existing FY2026 annual baseline,
records their O3 successor admission, and verifies the resulting candidate
dataset. It does not install, operate, or accept anything, and it does not
close `S4-R3`.*

## 0. Boundaries

- **No freshness policy, TTM construction rule, basis-preference rule,
  assessment clock basis, accepted period definition, valuation policy, XBRL
  tag map, or ingestion-contract rule was changed.**
- The FY2026 annual valuation basis remains **233 days old and STALE** at the
  2026-11-19 clock. The new quarters are Marico's latest *reported* periods;
  they do not freshen the annual valuation basis, and `STALE_STATEMENTS`
  remains raised.
- Candidate verification is **not** installation, live verification, or
  acceptance. The successor candidate was built under `/tmp` outside the
  repository and is **not installed** on any host.
- No IPD repository file was created, edited, moved, or deleted; no pull
  request was merged; prior 2026-11-19 records (L-033, G-15, §17.39, §17.40)
  are unmodified.

## 1. Source and provenance

The source is an operator-supplied payload (sole decision owner, 2026-11-19),
preserved **verbatim** at `source/operator-supplied-payload-2026-11-19.json`
(SHA-256 `3cb61ea83187163166cec98f8cc13b189d33f6159807fefb6cea4d4452fddc7b`)
before any transcription. Operator-declared admission metadata:
`source_type: SEBI_LODR_REG33_LIMITED_REVIEW`, `permission_status:
PUBLIC_STATUTORY_FILING_VERIFIED` (SEBI LODR Regulations, 2015 filings on
BSE/NSE and Marico Investor Relations), auditor **B S R & Co. LLP**, review
opinion **UNMODIFIED** (limited review). Entity identity reconciles against
the admitted roster: CIN `L15140MH1988PLC049208`, ISIN `INE196A01026`, NSE
`MARICO`, BSE `531642`, INR Crore. The FY2026 annual anchor (2026-03-31,
filed 2026-05-05) matches the payload's `existing_annual_anchor` exactly and
its row is preserved cell-for-cell.

**Honesty boundary:** no filing PDF/XBRL was fetched (network: NONE) and
payload-to-filing verification is **NOT_CLAIMED** in this session. In its
place, the payload's internal arithmetic and its published H1 FY2027
reconciliation target were verified in full (§4).

## 2. Schema alignment: the Net Income mapping (confirmed before writing)

Marico's FY2026 annual row maps **`NET_PROFIT` = 1,813 (total PAT including
NCI** — PBT 2,277 − tax 464 = 1,813**)** and carries the owners' share
separately as **`NET_PROFIT_ATTRIBUTABLE_TO_OWNERS` = 1,762**. The identical
mapping is applied to the quarters — Q1: `NET_PROFIT` = **652**, owners =
**630**; Q2: `NET_PROFIT` = **558**, owners = **550** — with no remapping.
The payload's `period_type: "QUARTERLY"` label is mapped to the contract
token **`QUARTER`** (the token the coverage read path counts), with
`quarter_form: DISCRETE` and `quarter_index` 1/2, mirroring KEC's quarterly
structure. Full mapping, non-ingested payload fields (EBITDA, margins, P&L
NCI), and the columns left blank (`NOT_REPORTED`, never invented) are in
`data-extraction.json`.

## 3. Successor input and transcription

`probe/build_marico_quarterly_refresh.py` (re-running reproduces the input
byte-for-byte) preserves every historical cell of the admitted Marico
successor input (annual rows gain only the additive
`quarter_form`/`quarter_index` columns, blank), copies the admitted roster
byte-for-byte (SHA-256 `259c2f09…`), and appends **Q1 FY2027 first, then
Q2 FY2027**:

| Filing | Period end | Filed | Revenue | Net profit (total) | Owners | Basic EPS |
|---|---|---|---|---|---|---|
| Q1 FY2027 `MARICO-INDAS-CONSOL-Q1-FY27-RESULTS` | 2026-06-30 | 2026-08-04 | 3,957 | 652 | 630 | 4.87 |
| Q2 FY2027 `MARICO-INDAS-CONSOL-Q2-FY27-RESULTS` | 2026-09-30 | 2026-11-02 | 3,897 | 558 | 550 | 4.24 |

(INR Crore except EPS.) Successor input digest:
`sha256:bf670d6efbe8c8444235ec199203078a26635670dd288fa6a0cfe2c67622d91c`;
`periods.csv` SHA-256 `59464d497418c2a989e7ed9e64446b103bf9fe5a3d214800871e0dda1cb014e6`.

## 4. Verification (2026-11-19)

- **H1 reconciliation (`runs/03-derived-handchecks.json`):** Q1+Q2 equals the
  published H1 FY2027 totals on **all seven checks** — revenue 7,854; other
  income 101; total income 7,955; total PAT 1,210; owners' PAT 1,180; NCI 30;
  basic EPS 9.11. Within-quarter owners+NCI and revenue+other-income
  identities also pass; EBITDA margins hand-check to the payload (rounding).
- **Candidate:** authoritative ingestion CLI (Infosys successor + Marico
  quarterly successor + admitted KEC, digests re-verified), pinned clock
  `2026-11-19T00:00:00.000Z` → **new candidate
  `sha256:3e42d98dad57de69ae4dba6f88c588da9114e6e829b21a811d35270b2c2de16a`**
  (`datasetVersion` == `contentDigest`; supersedes `sha256:ce341a12…`), 3
  issuers, **13 annual + 4 quarterly = 17 periods, 0 ingestion issues**
  (`runs/01-candidate-ingest.txt`).
- **Sequence:** Marico quarters DISCRETE index 1→2, measured **zero sequence
  gaps**; candidate quarterly coverage now Marico 2 + KEC 2.

## 5. Freshness and the TTM question (unchanged policy, 2026-11-19 clock)

| Issuer | Annual valuation basis | Status | Latest reported |
|---|---|---|---|
| Marico | FY2026, 2026-03-31 / 2026-05-05, 233 days | **STALE** | **Q2 FY2027 quarter, 2026-09-30 / 2026-11-02, 50 days** |
| Infosys | FY2026, 2026-03-31 / 2026-04-23, 233 days | **STALE** (unchanged) | FY2026 annual |
| KEC | FY2026, 2026-03-31 / 2026-05-16, 233 days | **STALE** (unchanged) | Q2 FY2027 quarter, 50 days |

**TTM determination (explicit, per work-item step 6):** a TTM bridge is
**not available and was not enabled**. The engine constructs TTM only from
**four DISCRETE quarters** (`periods.ts buildTtm`); Marico holds two, and
the Q3/Q4 FY2026 quarters that would complete a TTM window are not in
evidence and were not invented. Independently, the freshness basis
precedence selects **ANNUAL whenever an annual period exists**
(`freshness.ts`), so FY2026 remains the valuation basis regardless. The
FY2026 annual anchor stays intact as the latest published annual (FY2027
annual due May 2027 per the payload's status note), and Marico's annual
staleness flag is documented to persist until that filing.

## 6. Status disposition

- **Marico quarterly coverage under `S4-R3`: established in candidate** —
  the quarterly-presence limb is now met for two of three issuers (Marico,
  KEC). O3 successor admission recorded in
  `docs/integration/IID-O3-S4-R3-Marico-QUARTERLY-SUCCESSOR-ADMISSION-2026-11-19.md`
  and limitation register §17.41.
- **`S4-R3` overall / L-043: OPEN** — freshness limb unmet for all issuers.
- **`S4-R3-Infosys`: RESOLVED (register §17.40)** — unaffected.
- **Infosys / KEC governance: untouched.**

## 7. Artifact digests

See `digests.json` (beside this README) for the SHA-256 digest of every file
in this bundle. Candidate bytes live outside the repository and are exactly
reproducible from the three committed inputs via the authoritative CLI at
the pinned clock — reproducibility, not the sandbox path, is the evidence.
