# IID O3 — S4-R3 Marico Quarterly Successor Admission: Additive Program Authority Decision Record

**Decision identifier:** `O3` (existing identifier preserved; no new identifier is invented)
**Decision:** **O3 — ADMITTED for local personal investment analysis** (Marico quarterly successor scope only)
**Instrument:** Additive successor admission under the original O3 re-issue obligation (original O3 §8.4)
**Decision owner / operator:** Ramki (sole decision owner)
**Application:** IIPS v3.0
**Operating model:** Local / Single User / Personal Use
**Production:** Explicitly **OUT OF SCOPE**
**Decision date:** 2026-11-19
**Repository:** `ramkivs/iips-review-recovered`
**Branch:** `arena/fe76d26e-iips-review-recovered`
**Original O3 record:** `docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` (preserved byte-identical; not modified by this record)
**Prior additive records:** `IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md` (Marico/KEC annual successors) and `IID-O3-S4-R3-INFOSYS-SUCCESSOR-ADMISSION-2026-11-19.md` (preserved, not modified)

> **Nature of this record.** Governance recording of an explicit operator authorization given in the
> Marico quarterly work item of 2026-11-19, with the ingestion and candidate verification that the
> authorization directed. Admission is not installation: no Windows-host dataset was replaced, no
> portfolio database was accessed, no IPD file was changed, and no pull request was merged.

---

## 1. Authority and additive effect

The operator supplied reviewed consolidated quarterly financials for Marico Limited for Q1 FY2027 and
Q2 FY2027 (operator-supplied payload preserved verbatim at
`evidence/real-issuer/S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19/source/operator-supplied-payload-2026-11-19.json`,
SHA-256 `3cb61ea83187163166cec98f8cc13b189d33f6159807fefb6cea4d4452fddc7b`) and directed their ingestion
and O3 successor admission for the Marico quarterly series under `S4-R3`. The original O3 record §8.4
states that admission does not automatically extend to a restated, re-transcribed, re-digested or
superseded bundle; a fresh operator declaration must record the successor identity and digests. This
record is that fresh declaration for the exact successor content verified below.

This record changes **Marico quarterly governance only**. The Infosys successor and KEC admitted
inputs, digests and statuses are untouched. It does not supersede any freshness, source-rights,
valuation, host-installation or overall-readiness limitation.

## 2. Operative decision

> ## **O3 — ADMITTED for local personal investment analysis.**
>
> The operator admits the exact Marico quarterly successor input bundle and the exact successor
> candidate dataset identified in §3, bound to the verified digests recorded there, as candidate
> inputs for the operator's own local personal investment analysis, with all original O3 restrictions
> and all limitations in this record attached.

Admission is per exact identity and digest. It is not inherited by association, issuer name, directory
name, a future restatement, or a different dataset digest.

**Admission metadata (operator-declared in the supplied payload):**

| Field | Value |
|---|---|
| `source_type` | `SEBI_LODR_REG33_LIMITED_REVIEW` |
| `permission_status` | `PUBLIC_STATUTORY_FILING_VERIFIED` |
| Permission basis | Public statutory financial disclosures filed under SEBI (LODR) Regulations, 2015 on BSE/NSE and Marico Investor Relations |
| Auditor | B S R & Co. LLP |
| Review opinion | `UNMODIFIED` (unmodified limited review) |

## 3. Exact admitted identities and digests

### 3.1 Successor candidate dataset

| Property | Verified value |
|---|---|
| Candidate `datasetVersion` | `sha256:3e42d98dad57de69ae4dba6f88c588da9114e6e829b21a811d35270b2c2de16a` |
| Candidate `contentDigest` | `sha256:3e42d98dad57de69ae4dba6f88c588da9114e6e829b21a811d35270b2c2de16a` |
| Schema | `IIPS_INVESTMENT_FUNDAMENTALS_V1` |
| Recorded population | 3 issuers; 17 periods = 13 `ANNUAL` + 4 `QUARTER`; 0 ingestion issues |
| Build | Authoritative ingestion CLI, 3 inputs, pinned clock `2026-11-19T00:00:00.000Z`, output outside the repository |
| Verification | `readDataset` loads the package; manifest `datasetVersion` == `contentDigest`; per-issuer series, TTM availability and freshness measured from the loaded bytes (bundle `runs/02-freshness-2026-11-19.json`) |
| Supersedes candidate | `sha256:ce341a125445de1f30b48d150a925151749b69623250e86bbc12c408a0bd0003` (2026-11-19 Infosys successor candidate; remains admitted for any use that does not adopt this successor record) |

### 3.2 Constituent input bundles consumed by the successor candidate

| Role | Exact input path | Issuer | Verified `inputDigest` |
|---|---|---|---|
| Marico quarterly successor (this record) | `evidence/real-issuer/S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19/ingest-input/marico` | `IN:CIN:L15140MH1988PLC049208` | `sha256:bf670d6efbe8c8444235ec199203078a26635670dd288fa6a0cfe2c67622d91c` |
| Infosys successor (unchanged, 2026-11-19 admission) | `evidence/real-issuer/S4-R3-INFOSYS-REFRESH-2026-11-19/ingest-input/infosys` | `IN:CIN:L85110KA1981PLC013115` | `sha256:93d2ddc3e1dbf1dec6d45ea17bbdedb48c9de21875178caf9ccbc23a6201a50f` |
| Refreshed KEC successor (unchanged, 2026-11-14 admission) | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec` | `IN:CIN:L45200MH2005PLC152061` | `sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a` |

Exact consumed-file hashes (successor input):

| Input | File | SHA-256 |
|---|---|---|
| Marico quarterly successor | `periods.csv` | `59464d497418c2a989e7ed9e64446b103bf9fe5a3d214800871e0dda1cb014e6` |
| Marico quarterly successor | `roster.json` | `259c2f093b611af8e1541a78ea5e151cc2ab41cf93ef32bbfaa54fcb18c2cadb` |

The successor `roster.json` is byte-identical to the admitted Marico successor roster (same SHA-256 as
recorded in the 2026-11-14 re-admission §3.2). Every historical CSV cell is preserved under its
`issuer_id`/`period_end` key: the FY2022–FY2026 annual rows gain only the two additive
`quarter_form`/`quarter_index` columns (blank on annual rows), and Q1 FY2027 then Q2 FY2027 are
appended as DISCRETE quarters. The FY2026 annual anchor row is preserved cell-for-cell.

## 4. Preserved restrictions

The original O3 restrictions are preserved without widening:

- **Local personal use only**, for the operator's own investment analysis.
- **Single user; local host only.**
- No commercial or production use; no SaaS or multi-user deployment.
- No redistribution of source bundles, normalized datasets or derived dataset contents.
- No claim of independent legal verification of source licensing.

## 5. Limitations attached to this admission

- **Provenance.** The Q1/Q2 FY2027 figures are an operator-supplied transcription payload, preserved
  verbatim in the bundle. Payload-to-filing (PDF/XBRL) verification was **not** performed in this
  session (`NOT_CLAIMED`), and no source excerpt PDF is committed for these two filings. The payload's
  internal arithmetic and its H1 FY2027 reconciliation (Q1+Q2 against all seven published H1 totals)
  were hand-checked and pass (bundle `runs/03-derived-handchecks.json`).
- **Partial transcription.** Each quarterly row carries the 6 supplied line items; all other contract
  columns are blank and ingest as `NOT_REPORTED`. Nothing was invented, interpolated or carried
  forward. EBITDA/margin payload fields have no contract column and were not ingested.
- **Freshness and TTM.** At the 2026-11-19 clock the FY2026 annual basis remains 233 days old and
  **STALE**; the new quarters are Marico's latest *reported* periods (Q2 FY2027, 50 days) and do not
  freshen the annual valuation basis. A TTM basis is **not available**: TTM construction requires four
  DISCRETE quarters and Marico holds two (Q3/Q4 FY2026 quarters are not in evidence), and the
  freshness basis precedence selects ANNUAL whenever an annual period exists. The annual staleness
  flag is therefore retained, documented to persist until the FY2027 annual filing (expected
  May 2027).
- **Installation.** The successor candidate was built and verified outside the repository. It is not
  installed on any host and does not replace the existing Windows dataset
  (`sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`).

## 6. Governance disposition

- Marico quarterly coverage under `S4-R3`: **established in candidate** (quarterly-presence limb now
  met for two of three issuers). Recorded in limitation register §17.41.
- `S4-R3` overall and limitation `L-043`: **remain OPEN** — the freshness limb
  (`STALE_STATEMENTS` no longer raised) is unmet for all three issuers at the 2026-11-19 clock and
  cannot be met until an annual period end on or after 2026-05-03 exists at the assessment clock (in
  practice FY2027 filings) or an owner policy decision recorded outside this instrument.
- `S4-R3-Infosys`: **RESOLVED (2026-11-19, register §17.40)** — unaffected by this record.
