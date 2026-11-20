# IID O3 — L-031 Infosys Window-Coverage Successor Admission: Additive Program Authority Decision Record

**Decision identifier:** `O3` (existing identifier preserved; no new identifier is invented)
**Decision:** **O3 — ADMITTED for local personal investment analysis** (Infosys window-coverage successor scope only)
**Instrument:** Additive successor admission under the original O3 re-issue obligation (original O3 §8.4)
**Decision owner / operator:** Ramki (sole decision owner)
**Application:** IIPS v3.0
**Operating model:** Local / Single User / Personal Use
**Production:** Explicitly **OUT OF SCOPE**
**Decision date:** 2026-11-20
**Repository:** `ramkivs/iips-review-recovered`
**Branch:** `arena/fe76d26e-iips-review-recovered`
**Original O3 record:** `docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` (preserved byte-identical; not modified by this record)
**Prior additive records:** 2026-11-14 Marico/KEC re-admission; 2026-11-19 Infosys and Marico successor admissions; 2026-11-20 S4-R8 bonus-event admission (all preserved, not modified)

> **Nature of this record.** Governance recording of an explicit operator authorization given in the
> `S4-R8 / G-8 / L-031` work item of 2026-11-20, with the transcription and candidate verification
> that the authorization directed. Admission is not installation: no Windows-host dataset was
> replaced, no portfolio database was accessed, no IPD file was changed, and no pull request was
> merged.

---

## 1. Authority and additive effect

The operator supplied an **operator-declared corporate-action window table for Infosys Limited
covering 2024-03-31 → 2026-11-20** (preserved verbatim at
`evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20/source/operator-declared-window-table-2026-11-20.json`),
containing an explicit nil declaration for share-multiplying/structural events in the window, six
cash dividend entries, and one tender-offer buyback, and directed its governed transcription and
successor admission to discharge the window-coverage limb left open in register §17.43. The original
O3 §8.4 re-issue obligation is satisfied by this fresh declaration recording the successor identity
and digests.

This record changes **Infosys window-coverage governance only**. All prior admitted inputs keep their
bytes and admissions; this successor input *contains* byte-identical copies of the Infosys financial
input and of the admitted 2018 BONUS record, and adds one buyback record.

**Admission metadata (operator-declared):** `source_type: SEBI_LODR_CORPORATE_ANNOUNCEMENTS_AND_SEBI_BUYBACK_ANNOUNCEMENT`;
`permission_status: PUBLIC_STATUTORY_FILING` (public regulatory record); window declaration as
operator-declared table under L-031 §16.2's required resolution.

## 2. Operative decision

> ## **O3 — ADMITTED for local personal investment analysis.**
>
> The operator admits the exact Infosys window-coverage successor input bundle and the exact
> successor candidate dataset identified in §3, bound to the verified digests recorded there, as
> candidate inputs for the operator's own local personal investment analysis, with all original O3
> restrictions and all limitations in this record attached.

Admission is per exact identity and digest. It is not inherited by association, issuer name, directory
name, a future restatement, or a different dataset digest.

## 3. Exact admitted identities and digests

### 3.1 Successor candidate dataset

| Property | Verified value |
|---|---|
| Candidate `datasetVersion` | `sha256:d2b65bccd5d8ff289119068eb1c03f094a232c9ea6a754b060b76f9386f509bd` |
| Candidate `contentDigest` | `sha256:d2b65bccd5d8ff289119068eb1c03f094a232c9ea6a754b060b76f9386f509bd` |
| Recorded population | 3 issuers; 17 periods = 13 `ANNUAL` + 4 `QUARTER`; **2 corporate actions**; 0 ingestion issues |
| Build / verification | Authoritative ingestion CLI, 3 inputs, pinned clock `2026-11-20T00:00:00.000Z`, output outside the repository; `readDataset` read-back byte-faithful (bundle `runs/02`, `tests/investment/l031InfosysWindowCoverage.test.ts`) |
| Supersedes candidate | `sha256:a7638c6b8f23b067ab84f580805b918aea4b902c8e324026c7c7c942c09f5ab5` (remains admitted for any use that does not adopt this successor record) |

### 3.2 Constituent input bundles

| Role | Exact input path | Issuer | Verified `inputDigest` |
|---|---|---|---|
| Infosys window-coverage successor (this record) | `evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20/ingest-input/infosys` | `IN:CIN:L85110KA1981PLC013115` | `sha256:c8dd466608e93ceca26d924516d06ffa805c259f2b78eefbf402980029cc3b7f` |
| Marico quarterly successor (unchanged) | `evidence/real-issuer/S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19/ingest-input/marico` | `IN:CIN:L15140MH1988PLC049208` | `sha256:bf670d6efbe8c8444235ec199203078a26635670dd288fa6a0cfe2c67622d91c` |
| Refreshed KEC successor (unchanged) | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec` | `IN:CIN:L45200MH2005PLC152061` | `sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a` |

The successor input's `periods.csv` (`87728ec8…`) and `roster.json` (`426e8478…`) are byte-identical
to the admitted Infosys financial input; its `corporate-actions.json` preserves the admitted
`CA-INFY-BONUS-2018-09-06` record byte-faithfully and adds `CA-INFY-BUYBACK-TENDER-2025-12-04`
(`BUYBACK_TENDER`, effective 2025-12-04 on extinguishment, `perShareComparable: true`,
`adjustmentFactor: 1`, no successors). The six declared cash dividends are **not** transcribed:
`DIVIDEND` is not a canonical type and dividends create no per-share comparability break; they remain
documented in the source artifact. No schema was extended.

## 4. Preserved restrictions

The original O3 restrictions are preserved without widening: **local personal use only; single user;
local host only;** no commercial/production use; no SaaS or multi-user deployment; no redistribution
of source bundles, normalized datasets or derived contents; no claim of independent legal verification
of source licensing.

## 5. Limitations attached to this admission

- **Provenance.** The window coverage is an **operator declaration**, preserved verbatim; referenced
  exchange/SEBI PDFs were not retrieved in this session and independent verification is
  **NOT_CLAIMED**. The declaration's internal arithmetic (buyback share-count bridge and INR 18,000
  crore consideration) reconciles exactly and is hand-checked in the bundle.
- **Declaration scope.** The nil declaration covers 2024-03-31 → 2026-11-20 as stated and no later
  date; any subsequent in-window event requires a further successor admission on the same pattern.
- **Installation.** The successor candidate was built and verified outside the repository. It is not
  installed on any host and does not replace the existing Windows dataset
  (`sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`).

## 6. Governance disposition

- `L-031`: **RESOLVED (2026-11-20)** — both limbs of §16.2's required resolution are demonstrated:
  an operator-declared table covering the window (this record) **and** the acceptance test showing
  the guard fires on a real declared action with the factor applied (register §17.43). Recorded in
  register §17.44; the register summary row for L-031 is updated to match, as was done for L-033.
- `S4-R8` / `G-8`: **CLOSED (2026-11-20, §17.43)** — unchanged by this record.
