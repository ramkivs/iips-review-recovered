# IID O3 — S4-R8 Infosys Bonus-Event Successor Admission: Additive Program Authority Decision Record

**Decision identifier:** `O3` (existing identifier preserved; no new identifier is invented)
**Decision:** **O3 — ADMITTED for local personal investment analysis** (Infosys corporate-action successor scope only)
**Instrument:** Additive successor admission under the original O3 re-issue obligation (original O3 §8.4)
**Decision owner / operator:** Ramki (sole decision owner)
**Application:** IIPS v3.0
**Operating model:** Local / Single User / Personal Use
**Production:** Explicitly **OUT OF SCOPE**
**Decision date:** 2026-11-20
**Repository:** `ramkivs/iips-review-recovered`
**Branch:** `arena/fe76d26e-iips-review-recovered`
**Original O3 record:** `docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` (preserved byte-identical; not modified by this record)
**Prior additive records:** the 2026-11-14 Marico/KEC re-admission and both 2026-11-19 successor admissions (preserved, not modified)

> **Nature of this record.** Governance recording of an explicit operator authorization given in the
> `S4-R8 / G-8 / L-031` work item of 2026-11-20, with the transcription, candidate verification and
> guard demonstration that the authorization directed. Admission is not installation: no Windows-host
> dataset was replaced, no portfolio database was accessed, no IPD file was changed, and no pull
> request was merged.

---

## 1. Authority and additive effect

The operator supplied a documented event record for **Infosys Limited's 1:1 bonus issue of 2018**
(preserved verbatim at
`evidence/real-issuer/S4-R8-INFOSYS-BONUS-2018-2026-11-20/source/operator-supplied-event-2026-11-20.json`,
SHA-256 `ab1e2600201d8503a4ed2d789184cfa64c56ec0e101a393be585ebd9ae1bbef2`), identifying the official
NSE record-date intimation of 2018-08-24 and the FY2018-19 annual report as sources, and directed its
transcription into the canonical corporate-action contract and successor admission. The original O3
record §8.4 states that admission does not automatically extend to a re-transcribed or superseded
bundle; a fresh operator declaration must record the successor identity and digests. This record is
that fresh declaration for the exact successor content verified below.

This record changes **Infosys corporate-action governance only**. The Infosys financial successor
input, the Marico quarterly successor and the KEC admitted input keep their bytes and prior
admissions; this successor input *contains* byte-identical copies of the Infosys financial input and
adds one corporate-actions file. It does not supersede any freshness, source-rights, valuation,
host-installation or overall-readiness limitation, and it admits none of the 13 discovery candidates
of the 2026-11-17 S4-R8 investigation.

## 2. Operative decision

> ## **O3 — ADMITTED for local personal investment analysis.**
>
> The operator admits the exact Infosys corporate-action successor input bundle and the exact
> successor candidate dataset identified in §3, bound to the verified digests recorded there, as
> candidate inputs for the operator's own local personal investment analysis, with all original O3
> restrictions and all limitations in this record attached.

Admission is per exact identity and digest. It is not inherited by association, issuer name, directory
name, a future restatement, or a different dataset digest.

**Admission metadata (operator-declared in the supplied event record):**

| Field | Value |
|---|---|
| `source_type` | `SEBI_LODR_CORPORATE_ANNOUNCEMENT` |
| `permission_status` | `PUBLIC_STATUTORY_FILING` — mandatory public regulatory disclosures (SEBI LODR / Companies Act, 2013); public factual data for factual reference and database indexing, as operator-declared |
| Event | Infosys Limited 1:1 bonus issue; board approval 2018-07-13; record date 2018-09-05; effective (allotment) 2018-09-06 |

## 3. Exact admitted identities and digests

### 3.1 Successor candidate dataset

| Property | Verified value |
|---|---|
| Candidate `datasetVersion` | `sha256:a7638c6b8f23b067ab84f580805b918aea4b902c8e324026c7c7c942c09f5ab5` |
| Candidate `contentDigest` | `sha256:a7638c6b8f23b067ab84f580805b918aea4b902c8e324026c7c7c942c09f5ab5` |
| Schema | `IIPS_INVESTMENT_FUNDAMENTALS_V1` |
| Recorded population | 3 issuers; 17 periods = 13 `ANNUAL` + 4 `QUARTER`; **1 corporate action**; 0 ingestion issues |
| Build | Authoritative ingestion CLI, 3 inputs, pinned clock `2026-11-20T00:00:00.000Z`, output outside the repository |
| Verification | `readDataset` loads the package; manifest `datasetVersion` == `contentDigest`; the corporate action reads back byte-faithful; guard/factor demonstration in bundle `runs/02` and `tests/investment/s4r8InfosysBonusEvent.test.ts` |
| Supersedes candidate | `sha256:3e42d98dad57de69ae4dba6f88c588da9114e6e829b21a811d35270b2c2de16a` (remains admitted for any use that does not adopt this successor record) |

### 3.2 Constituent input bundles consumed by the successor candidate

| Role | Exact input path | Issuer | Verified `inputDigest` |
|---|---|---|---|
| Infosys corporate-action successor (this record) | `evidence/real-issuer/S4-R8-INFOSYS-BONUS-2018-2026-11-20/ingest-input/infosys` | `IN:CIN:L85110KA1981PLC013115` | `sha256:aa414045de21c6833aa57035768da14f92a302bfaaaac48767a28647e8954c52` |
| Marico quarterly successor (unchanged, 2026-11-19 admission) | `evidence/real-issuer/S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19/ingest-input/marico` | `IN:CIN:L15140MH1988PLC049208` | `sha256:bf670d6efbe8c8444235ec199203078a26635670dd288fa6a0cfe2c67622d91c` |
| Refreshed KEC successor (unchanged, 2026-11-14 admission) | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec` | `IN:CIN:L45200MH2005PLC152061` | `sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a` |

Exact consumed-file hashes (successor input): `periods.csv` `87728ec81892ec08cc707a651a9d00861ef7a0993f65f0db7346da9c55f2b8dd`
and `roster.json` `426e8478bca1ffc3fd47a6a24995230cfbfc05ccd1df4b92fa774ba15c60f8b4` (byte-identical
to the admitted Infosys successor financial input), plus `corporate-actions.json`
`1351c192a6f22f1527b3f9bcc1058943cfe99ae3fa191b8785ad9f82361981e0` carrying the single canonical
record `CA-INFY-BONUS-2018-09-06` (`BONUS`, effective 2018-09-06, `perShareComparable: false`,
`adjustmentFactor: 0.5` derived from the exact doubling of the supplied share counts, no successors).

## 4. Preserved restrictions

The original O3 restrictions are preserved without widening:

- **Local personal use only**, for the operator's own investment analysis.
- **Single user; local host only.**
- No commercial or production use; no SaaS or multi-user deployment.
- No redistribution of source bundles, normalized datasets or derived dataset contents.
- No claim of independent legal verification of source licensing.

## 5. Limitations attached to this admission

- **Provenance.** The event record is operator-supplied and preserved verbatim; the referenced
  exchange PDFs were **not retrieved** in this session and PDF-to-record verification is
  **NOT_CLAIMED**. The exact source locators are recorded in the bundle. All arithmetic the record
  supports (share-count doubling, paid-up capital at INR 5 face value, INR 1,092 crore capitalization,
  factor derivation) was hand-checked and passes.
- **Scope of the event.** The record establishes one historical (2018) event. It does **not**
  establish Infosys's corporate-action continuity for the 2024-03-31 → present window (see §6), and
  the parallel ADS stock dividend and the treasury-trust note were not transcribed (no admitted ADS
  security; no trust-allocation semantics in the contract).
- **Installation.** The successor candidate was built and verified outside the repository. It is not
  installed on any host and does not replace the existing Windows dataset
  (`sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`).

## 6. Governance disposition

- `S4-R8` (roadmap evidence: `corporateActions > 0`, real event recorded and re-published):
  **CLOSED (2026-11-20)** — the verified candidate carries one real admitted action and the
  guard/factor behaviour is demonstrated on that record. Recorded in register §17.43.
- `G-8` (corporate-actions gap, S4-R8 row): **CLOSED** on the same evidence.
- `L-031`: **remains OPEN, narrowed** — its acceptance limb (guard fires on a real declared action,
  factor applied not guessed) is demonstrated; its window-coverage limb (an operator-declared table
  covering 2024-03-31 → present for Infosys) is not established by a 2018 event and remains the exact
  outstanding operator requirement.
