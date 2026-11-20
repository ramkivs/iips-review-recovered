# W05 actual dossier — real-issuer source/rights, filing/period/basis, coverage, dataset digests

**Date:** 2026-11-18 (UTC)
**Branch:** `arena/9852cfbf-iips-review-recovered` (from `main` `a55ce12f`, the merge of IRR PR #598)
**Status:** W05 **IN PROGRESS — NOT ACCEPTED**. This is the review's item-3 deliverable: the actual
W05 dossier **as it can honestly be built today** from the committed real-issuer evidence
(`evidence/real-issuer/`) and the operator-supplied broker evidence, with the item-1 provisioning
plan (§6) inside it. It states what exists, and marks what is not yet verified — especially
per-source entitlement and retention, which are **not verified for any source yet** and fail
closed. No coverage figure for W04 revision 1 exists (see `W05-W04-RECONCILIATION-2026-11-18.md`).

---

## 1. Issuer and sector coverage (O3 boundary)

| Issuer | Key identities | Sector | Admission | Evidence |
|---|---|---|---|---|
| Infosys Limited | CIN `IN:CIN:L85110KA1981PLC013115`; ISIN `INE009A01021` | Technology | **Admitted (O3)** | `REL-1-INFOSYS-2026-11-06/`, `WI2-…`, `WI3-…`, `D2-…`, `D3-…`, `S4-R2-…`, `HEAD-REVALIDATION-INFOSYS-2026-11-12/` |
| Marico Limited | CIN `L15140MH1988PLC049208`; ISIN `INE196A01026`; BSE `531642`; NSE `MARICO` | Consumer | **Admitted (O3)** | `WI7-CONSUMER-MARICO-2026-11-07/`, `WI7-L038-DEBT-COMPLETENESS-…`, `WI7-L038-RESIDUAL-…`, `WI12-L038-PREFERENCE-CAPITAL-…`, `L038-DELTA-2026-11-17/` |
| KEC International Limited | CIN `L45200MH2005PLC152061`; ISIN `INE389H01022`; NSE `KEC` | Industrials | **Admitted (O3)** | `WI8-INDUSTRIALS-KEC-2026-11-07/`, `WI8-L039-CASH-SIDE-…`, `WI9-L036-ASSOCIATES-…`, `L039-DELTA-2026-11-17/` |
| Zensar Technologies | — | Technology | **Investigated — unsuccessful; discovery only** | `WI6-SECOND-ISSUER-NIL-SEARCH-…`, `WI6A-…-2026-11-07/` (consolidated statements not retrieved; no observation, dataset or assessment created) |

O3 admissions are unchanged: **Infosys, Marico, KEC only**. L038/L039 delta material is
`DISCOVERY_ONLY_NOT_ADMITTED` on its own face (see §2). The three admitted issuers span three
sectors (Technology, Consumer, Industrials). This dossier makes **no** coverage claim for the W04
portfolio's holdings: which of the 64 revision-1 holdings touch these issuers is unestablished
until the reconciliation run happens.

## 2. Source and rights — every source, and what is NOT verified

**Acquisition routes (all manual, D3-compliant):** issuer-hosted public annual-report PDFs
transcribed page by page (`source/*.txt` bounded extracts + page maps + byte hashes in each
bundle); one exchange market-data file (BSE bhavcopy CSV, 2026-11-06); MCA/company-filing
derivatives for the L038 delta (MGT-7 drafts, subsidiary financials); official taxonomy packages
for the L039 delta (reproducible local XML readback). No automated exchange retrieval or scraping;
no bulk filing ingestion.

**Rights posture — the honest position:**

| Source class | Entitlement verified per source? | Retention verified per source? | Effective rights state | Consequence |
|---|---|---|---|---|
| Issuer-hosted annual-report PDFs (Infosys, Marico, KEC) | **NOT VERIFIED** | **NOT VERIFIED** | `UNKNOWN` (fail closed) | no rights-eligible dataset is admitted on this basis until item 1 records a rights record per source |
| Exchange bhavcopy CSV (BSE, 2026-11-06 close) | **NOT VERIFIED** | **NOT VERIFIED** | `UNKNOWN` (fail closed) | same |
| MCA/company-filing derivatives (L038 delta) | **NOT VERIFIED** | **NOT VERIFIED** | `DISCOVERY_ONLY_NOT_ADMITTED` (bundle's own verdict) | discovery only; no admission |
| Taxonomy packages (L039 delta) | **NOT VERIFIED** | **NOT VERIFIED** | `DISCOVERY_ONLY_NOT_ADMITTED` (bundle's own verdict) | discovery only; no admission |

The delta bundles state the governing rule verbatim: **"public accessibility is not a rights grant
or independent rights verification"** and "Official/public availability does not establish licence,
redistribution rights, provider admission, O3, owner acceptance or execution authorization"
(`L038-DELTA-2026-11-17/baseline-and-provenance.json`, `L039-DELTA-2026-11-17/README.md`). No PDF
has been redistributed. Redistribution remains `NOT_AUTHORISED`. A provider name or operator
assertion is not independent permission. Disclosure obligations never imply copyright/download/
storage/reproduction/redistribution permission. Until §6 completes per source, entitlement and
retention are recorded as **NOT VERIFIED** and the `RIGHTS_ELIGIBLE` gate fails closed — which is
exactly the mechanism's designed behaviour, not a defect to paper over.

## 3. Filing, period and basis per issuer

**Infosys** — CONSOLIDATED, INDAS, `AS_FILED`, scale CRORE (`REL-1-…/ingest-input/periods.csv`):

| Period | Period end | Filing ref | Filed on | Taken from |
|---|---|---|---|---|
| FY2024 | 2024-03-31 | `INFY-INDAS-CONSOL-FY24` | 2024-04-18 | `consol-fy24-annual-finstatement.pdf` — BS p.1, P&L p.2, CF p.5 |
| FY2023 | 2023-03-31 | `INFY-INDAS-CONSOL-FY23` | 2023-04-13 | `consol-fy23-annual-finstatement.pdf` — BS p.1, P&L p.2, CF p.5 |
| FY2022 | 2022-03-31 | `INFY-INDAS-CONSOL-FY23` (comparative column) | 2023-04-13 | FY2022-23 filing, printed p.1–p.2 |

33 filed line items × 3 periods. Borrowings: FY2024 **nil by disclosure** — Note 2.11 "The Group has
no outstanding borrowings." (`WI3-…/digests.json` declarations, quote digests pinned); FY2023/
FY2022 borrowings `NOT_REPORTED`, deliberately, never assumed nil (`S4-R2-INFOSYS-BORROWINGS-2026-11-17`).
Price: one BSE close, INE009A01021, 2026-11-06, ₹1,180.65 (`WI2-…/digests.json` observation,
extract SHA-256 `35886caa8b64aacff0fce69a75c0a0cc353087f30af2957a517cd460916814aa`).

**Marico** — INDAS, consolidated (`WI7-CONSUMER-MARICO-2026-11-07/README.md`):

| Period end | Filing ref | Auditor opinion | Source bytes (SHA-256) |
|---|---|---|---|
| 2024-03-31 | `MARICO-INDAS-CONSOL-FY24-AR` (current column) | B S R & Co. LLP, PDF p.169 | `Marico_Annual_Report_FY24.pdf` `03cb0db78289cdda4ffcd4b4e9f14f3b444a52a4fd64d6265578180fa9857595` |
| 2023-03-31 | `MARICO-INDAS-CONSOL-FY24-AR-COMPARATIVE` | same | as above |
| 2022-03-31 | `MARICO-INDAS-CONSOL-FY23-AR-COMPARATIVE` | B S R & Co. LLP, PDF p.125 | `Marico_Annual_Report_FY23.pdf` `0f41759d903f2f9e1185d1bd52228a1653592583ca729abe75edf430b9332b0a` |

`Marico_Annual_Report_FY22.pdf` (`cd8855e5…`) was fetched and hashed with **no figure taken**.
Later refresh: FY2025 and FY2026 consolidated annual periods transcribed from the verbatim
annual-report page extracts in `WI12-L038-PREFERENCE-CAPITAL-2026-11-08/runs/02–03`
(`S4-R3-FILING-REFRESH-2026-11-14/README.md`). L038 delta: MGT-7 FY24/FY25 + Subsidiary_Financials
FY26 page transcriptions (draft parent; no final parent receipt; discovery only).

**KEC International** — Ind AS, consolidated (`WI8-INDUSTRIALS-KEC-2026-11-07/`, `L039-DELTA-…`):
audited consolidated periods ingested from the FY2025-26 annual report pages (identity ISIN/
listing p.107; auditor opinion p.111+; Ind AS basis policy p.120; balance sheet + P&L p.117; cash
flows p.118–119; Note 30 borrowings FY25 p.129 / FY26 p.136; FY25 comparatives p.110–112, p.124,
p.137); every figure traced to a printed page in `ingest-input/data-extraction.json`. L039 delta:
official taxonomy packages read locally (member hashes recorded) — discovery only.

## 4. Analytical-method coverage (the roadmap's method dimension; PROVISIONAL_PENDING_W10)

| Sector | Governed matrix methods | Status on real evidence |
|---|---|---|
| Technology | `DCF_FCFF`, … | `DCF_FCFF` exercised end-to-end on Infosys: intrinsic ₹875.34 / ₹1,088.97 / ₹1,399.81; margin of safety −8.42 % vs mid, band `FAIR`, against the single BSE close; enterprise-to-equity bridge required the WI3 nil declarations (`WI3-…`) |
| Consumer | `DCF_FCFF`, `PE_RELATIVE`, `EV_EBITDA` | all three declared exercisable on audited filings alone (Consumer's matrix declares **no** mandatory operating metric — the reason the sector was chosen, `WI7-…/README.md`) |
| Industrials | `DCF_FCFF`, `EV_EBITDA`, `EV_REVENUE`, … | `G2_PARTIAL` at 100 % statement coverage: `DCF_FCFF` + `EV_EBITDA` usable; `EV_REVENUE` withheld for a missing mandatory operating metric; bridge refused (grossDebt ₹5,377.76 crore resolved, netDebt not) — assessment `SUFFICIENT` / `MATERIAL_CONCERNS`, confidence 0.3199 (`WI8-…`) |

Operating metrics: `S4-R6-OPERATING-METRICS-2026-11-18/` (requirement matrix from `SECTOR_METHODS` +
`OPERATING_METRICS`, census of the two served datasets, capability probes on the committed
synthetic fixture; no metric entered, no issuer admitted). **The required-metric set stays
`PROVISIONAL_PENDING_W10`** and method requirements are disclosure only — no new gate.

## 5. Dataset digests (metadata and references only)

| Dataset artifact | Digest | Where pinned |
|---|---|---|
| Infosys assessment payload v1 / v2 | `610eca02…` / `cc91f239197a1ed8aca52600ca25ec9c62cd78863e224756c21dfff7ba57cfcd` | `REL-1-…/digests.json` (chain) |
| Infosys WI2 payload / price extract | `06be8f6680ec70caeb73bb83788d730127018076bb39f1a17e43c2c425a04a8f` / `35886caa…` | `WI2-…/digests.json` |
| Infosys WI3 payload | `83644bc68e3d68f3f714fb205179eae63c6da2ff9d5cdcf77d0a3d5c573d493d` | `WI3-…/digests.json` |
| Infosys head re-validation (2026-11-12) | dataset `sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847`; payload `18f5ccb60533535de5b9c8be034a7d16499a3b60d5899f672d4320317dbdc85d`; input `sha256:db46d36c5b0ef92717d35118b4003e7e43fa55267808d41cf006193d20e9a4ef` | `HEAD-REVALIDATION-…/digests.json` |
| Marico WI7 payload | `3fd27a98313d853704e864df6d1228566053be43f49c4d2c011371615ced2343` | `WI7-CONSUMER-MARICO-…/digests.json` |
| Marico L038 delta manifest | README `40671aeabda8cb5ff031c40619089b49a91a0472183a31de8dc81784dc8fbdf2`; baseline `e2a34592…`; per-file SHA-256 manifest | `L038-DELTA-2026-11-17/digests.json` |
| KEC WI8 payloads | `artifact/assessment-payload-kec-wi8.json`, `…-kec-wi8-l040-corrected.json` pinned per file | `WI8-INDUSTRIALS-KEC-…/digests.json` |
| KEC L039 delta manifest | per-file SHA-256 map (README `1e0241c8…`, determinations, source extracts) | `L039-DELTA-2026-11-17/digests.json` |
| Combined **candidate** dataset (S4-R3, 2026-11-14) | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` (3 issuers, 3 securities, 5 listings, 11 annual + 2 quarterly periods, 0 prices/operating-metric records, `dataAsOf` 2026-09-30) | `S4-R3-FILING-REFRESH-…/runs/candidate-manifest.json` — **candidate manifest only; not installed; no rights record attached** |

Every digests.json pins its bundle's bytes (per-file SHA-256, some with byte counts); source
documents and filing text are not copied into this dossier — the bundles are the record.

## 6. Item-1 provisioning plan — progressive, per issuer, D1/D3 in force

This is what turns §2's "NOT VERIFIED" cells into verified verdicts. Manual only (D3 stands);
progressive (no requirement to cover every holding before non-production use); reuse suitable
datasets across holdings and portfolios.

For each issuer, in order (start with the three O3-admitted issuers):

1. **Manual acquisition** of each needed primary source from the permitted primary location
   (issuer investor-relations host; exchange published files). One source at a time; every failed
   retrieval recorded; no automated exchange retrieval/scraping; no bulk filing ingestion; no
   candidate-dataset installs on the Windows host.
2. **Per-source rights record, entitlement AND retention verified side by side** — from the
   source's own terms or an explicit authorization record, not from the provider's name and not
   from an operator assertion: what permits local personal use (entitlement) and what permits
   keeping the bytes (retention). Unknown or unsupported → `UNKNOWN`/`RESTRICTED`, fail closed.
   Redistribution stays `NOT_AUTHORISED` unless a source explicitly grants it (none has).
3. **Evidence package per issuer**: source bytes hashed (kept per the established bundle
   convention — bounded page extracts, page maps, digests; filing text stays out of new commits
   where the rules require), transcription with per-figure page provenance, period rows
   (filing/period/basis per §3).
4. **Ingestion** via `cli/ingest.ts --authorization-record` with the rights record attached;
   `DatasetManifest.sourceRights` semantics preserved (`SYNTHETIC`, `OPERATOR_ASSERTED` with
   basis, `UNKNOWN` default) and authorization-reference checking unchanged.
5. **Update this dossier's §2 table** per source as each verdict lands (entitlement and retention
   columns), and attach the dataset digests to §5. Coverage display is W17 work in IRR — no
   application integration is a prerequisite for any of this.
6. **Then** the W04 revision-1 run (`W05-W04-RECONCILIATION-2026-11-18.md` §5) can evaluate these
   datasets against the actual holdings under the roadmap eligible-set designation (the lifecycle
   now models `E`: `EligibleSetDesignation`, exclusions itemised, `|E|` as the ratio denominator).

## 7. Boundaries held

No production deployment or data operations; no bulk acquisition; IPD untouched and read-only; no
invented financial values (missing is never zero); no invented qualification threshold; no
automatic rights approval; θF remains unset (`NO_DEFENSIBLE_VALUE_ASSERTED`, gates W20, **not** a
W05 condition); O3/PA-01/L-041/L-042 untouched; W07/W10 scope unchanged; Q7 closed and not
reopened; the required-metric set stays `PROVISIONAL_PENDING_W10`; **W05 remains IN PROGRESS —
NOT ACCEPTED**.
