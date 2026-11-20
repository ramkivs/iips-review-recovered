# IID O3 — S4-R3 Infosys Successor Admission: Additive Program Authority Decision Record

**Decision identifier:** `O3` (existing identifier preserved; no new identifier is invented)
**Decision:** **O3 — ADMITTED for local personal investment analysis** (Infosys successor scope only)
**Instrument:** Additive successor admission under the original O3 re-issue obligation (original O3 §8.4)
**Decision owner / operator:** Ramki (sole decision owner)
**Application:** IIPS v3.0
**Operating model:** Local / Single User / Personal Use
**Production:** Explicitly **OUT OF SCOPE**
**Decision date:** 2026-11-19
**Repository:** `ramkivs/iips-review-recovered`
**Branch:** `arena/fe76d26e-iips-review-recovered`
**Original O3 record:** `docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` (preserved byte-identical; not modified by this record)
**Prior additive re-admission:** `docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md` (Marico/KEC successors; preserved, not modified)

> **Nature of this record.** Governance recording of an explicit operator authorization given in the
> `S4-R3-Infosys` work item of 2026-11-19, with the ingestion and candidate verification that the
> authorization directed. Admission is not installation: no Windows-host dataset was replaced, no
> portfolio database was accessed, no IPD file was changed, and no pull request was merged.

---

## 1. Authority and additive effect

The operator supplied audited consolidated annual financials for Infosys Limited for FY2025 and FY2026
(operator-supplied payload preserved verbatim at
`evidence/real-issuer/S4-R3-INFOSYS-REFRESH-2026-11-19/source/operator-supplied-payload-2026-11-19.json`,
SHA-256 `590a9dec2ae94227d8494764e73f694318235e81ec09b882b3a3264cb950ab56`) and directed their ingestion
and O3 successor admission for ticket `S4-R3-Infosys`. The original O3 record §8.4 states that admission
does not automatically extend to a restated, re-transcribed, re-digested or superseded bundle; a fresh
operator declaration must record the successor identity and digests. This record is that fresh
declaration for the exact successor content verified below.

This record changes **Infosys governance only**. The Marico and KEC admitted inputs, digests and
statuses are untouched. It does not supersede any freshness, source-rights, valuation,
host-installation or overall-readiness limitation.

## 2. Operative decision

> ## **O3 — ADMITTED for local personal investment analysis.**
>
> The operator admits the exact Infosys successor input bundle and the exact successor candidate
> dataset identified in §3, bound to the verified digests recorded there, as candidate inputs for the
> operator's own local personal investment analysis, with all original O3 restrictions and all
> limitations in this record attached.

Admission is per exact identity and digest. It is not inherited by association, issuer name, directory
name, a future restatement, or a different dataset digest.

**Admission metadata (operator-declared in the supplied payload):**

| Field | Value |
|---|---|
| `source_type` | `SEBI_LODR_REG33_AUDITED` |
| `permission_status` | `PUBLIC_STATUTORY_FILING_VERIFIED` |
| Permission basis | Public statutory financial disclosures filed under SEBI (LODR) Regulations, 2015 on BSE/NSE and Infosys Investor Relations |
| Auditor | Deloitte Haskins & Sells LLP |
| Audit opinion | `UNMODIFIED` |

## 3. Exact admitted identities and digests

### 3.1 Successor candidate dataset

| Property | Verified value |
|---|---|
| Candidate `datasetVersion` | `sha256:ce341a125445de1f30b48d150a925151749b69623250e86bbc12c408a0bd0003` |
| Candidate `contentDigest` | `sha256:ce341a125445de1f30b48d150a925151749b69623250e86bbc12c408a0bd0003` |
| Schema | `IIPS_INVESTMENT_FUNDAMENTALS_V1` |
| Recorded population | 3 issuers; 15 periods = 13 `ANNUAL` + 2 `QUARTER`; 0 ingestion issues |
| Build | Authoritative ingestion CLI, 3 inputs, pinned clock `2026-11-19T00:00:00.000Z`, output outside the repository |
| Verification | `readDataset` loads the package; manifest `datasetVersion` == `contentDigest`; per-issuer series and freshness measured from the loaded bytes (bundle `runs/02-freshness-2026-11-19.json`) |
| Supersedes candidate | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` (2026-11-14 admitted candidate; remains the admitted candidate for any use that does not adopt this successor record) |

### 3.2 Constituent input bundles consumed by the successor candidate

| Role | Exact input path | Issuer | Verified `inputDigest` |
|---|---|---|---|
| Infosys successor (this record) | `evidence/real-issuer/S4-R3-INFOSYS-REFRESH-2026-11-19/ingest-input/infosys` | `IN:CIN:L85110KA1981PLC013115` | `sha256:93d2ddc3e1dbf1dec6d45ea17bbdedb48c9de21875178caf9ccbc23a6201a50f` |
| Refreshed Marico successor (unchanged, 2026-11-14 admission) | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico` | `IN:CIN:L15140MH1988PLC049208` | `sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d` |
| Refreshed KEC successor (unchanged, 2026-11-14 admission) | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec` | `IN:CIN:L45200MH2005PLC152061` | `sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a` |

Exact consumed-file hashes (successor input):

| Input | File | SHA-256 |
|---|---|---|
| Infosys successor | `periods.csv` | `87728ec81892ec08cc707a651a9d00861ef7a0993f65f0db7346da9c55f2b8dd` |
| Infosys successor | `roster.json` | `426e8478bca1ffc3fd47a6a24995230cfbfc05ccd1df4b92fa774ba15c60f8b4` |

The successor `roster.json` is byte-identical to the admitted REL-1 roster (same SHA-256 as recorded
in the 2026-11-14 re-admission §3.2). Every historical CSV cell is preserved under its
`issuer_id`/`period_end` key: the successor `periods.csv` begins with the admitted FY2022–FY2024 rows
byte-for-byte and appends FY2025 then FY2026. The original REL-1 input remains in place and remains the
input covered by the original O3 admission for the historical candidate.

## 4. Preserved restrictions

The original O3 restrictions are preserved without widening:

- **Local personal use only**, for the operator's own investment analysis.
- **Single user; local host only.**
- No commercial or production use; no SaaS or multi-user deployment.
- No redistribution of source bundles, normalized datasets or derived dataset contents.
- No claim of independent legal verification of source licensing.

## 5. Limitations attached to this admission

- **Provenance.** The FY2025/FY2026 figures are an operator-supplied transcription payload, preserved
  verbatim in the bundle. Payload-to-filing (PDF/XBRL) verification was **not** performed in this
  session (`NOT_CLAIMED`), and no source excerpt PDF is committed for these two filings. The payload's
  FY2024 baseline reference reconciles exactly (14/14 fields) against the committed admitted FY2024
  row, and all internal arithmetic that the payload supports was hand-checked (bundle
  `runs/03-derived-handchecks.json`); one inconsistency in a non-ingested field (`operating_profit_ebit`
  bridge, FY2026, Δ −165) is recorded, unresolved by invention.
- **Partial transcription.** Each new period carries the 14 supplied line items; 19 contract columns
  are blank and ingest as `NOT_REPORTED`. Nothing was invented, interpolated or carried forward.
- **Freshness.** At the 2026-11-19 clock the FY2026 annual basis is 233 days old and remains **STALE**
  under the unchanged `freshness-policy/1.0.0` 200-day window, exactly as for Marico and KEC.
  This admission clears the exceptional 963-day Infosys lag; it does **not** make Infosys fresh, does
  not lift `STALE_STATEMENTS`, and does **not** close `S4-R3` overall.
- **Installation.** The successor candidate was built and verified outside the repository. It is not
  installed on any host and does not replace the existing Windows dataset
  (`sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`).

## 6. Governance disposition

- `S4-R3-Infosys` (data-supply residual: "a committed source-supported Infosys period"): **discharged
  by this record** — two committed, O3 successor-admitted Infosys annual periods (FY2025, FY2026) now
  exist. Its register disposition is recorded in the limitation register §17.40.
- `S4-R3` overall and limitation `L-043`: **remain OPEN** — the freshness limb
  (`STALE_STATEMENTS` no longer raised) is unmet for all three issuers at the 2026-11-19 clock and
  cannot be met until an annual period end on or after 2026-05-03 exists at the assessment clock (in
  practice FY2027 filings, ~April 2027) or an owner policy decision recorded outside this instrument.
