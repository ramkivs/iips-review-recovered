# IID O3 — S4-R3 Re-admission: Additive Program Authority Decision Record

**Decision identifier:** `O3` (existing identifier preserved; no new identifier is invented)
**Decision:** **O3 — ADMITTED for local personal investment analysis.**
**Instrument:** Additive re-admission / successor-scope decision under the original O3 re-issue obligation
**Decision owner / operator:** Ramki (sole decision owner)
**Application:** IIPS v3.0
**Operating model:** Local / Single User / Personal Use
**Production:** Explicitly **OUT OF SCOPE**
**Decision date:** 2026-11-14
**Repository:** `ramkivs/iips-review-recovered`
**Branch:** `arena/53ff9276-iips-review-recovered`
**Inspected published baseline:** `b2a14c9851a7ee7b4b3a6dcf201778ce9f053e10`
**Original O3 record:** `docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md`
**Original O3 publication commit:** `cf24c47b2871e3b7079428b52be449c1a1209526`
**Original O3 decision-time baseline:** `d1118df296b9f17e211a85ee91f8bb24c89ff947`

> **Nature of this record.** Governance recording of an explicit operator authorization. Documentation and read-only verification only. No ingestion, dataset installation, Windows-host write, portfolio-database access, identity provisioning, IPD change, or PR merge was performed.

---

## 1. Authority and additive effect

The operator explicitly authorized reissuing O3 to admit the refreshed Marico successor bundle, the refreshed KEC successor bundle, and the exact S4-R3 candidate dataset, for the same single-user, local, personal investment-analysis purpose and restrictions as the original O3 decision dated 2026-11-13.

The original O3 record §8.4 states that admission does **not** automatically extend to a restated, re-transcribed, re-digested or superseded bundle; a fresh operator declaration must record the successor identity and digests. This record is that fresh declaration for the exact successor content verified below.

The original O3 record is preserved byte-identical:

| Property | Value |
|---|---|
| SHA-256 | `25d8ba88248c138ca41f82874dca10db4e8605cba19c690a7a8a3740b7ee55ca` |
| Git blob | `be627a990c13f6fd259819b9c4acda836870cd47` |
| Modified by this record | **NO** |

This instrument supersedes only the prior “O3 admission of refreshed content is not implied / remains pending” statements in the S4-R3 README, determination, readiness reassessment and final handover. Those historical files are not rewritten. It does not supersede their freshness, source-rights, valuation, host-installation or overall-readiness limitations.

## 2. Operative decision

> ## **O3 — ADMITTED for local personal investment analysis.**
>
> The operator admits the exact refreshed Marico and KEC successor input bundles and the exact S4-R3 candidate dataset identified in §3, bound to the verified digests recorded there, as candidate inputs for the operator’s own local personal investment analysis, with all original O3 restrictions and all limitations in this record attached.

Admission is per exact identity and digest. It is not inherited by association, issuer name, directory name, a future restatement, or a different dataset digest.

## 3. Exact admitted identities and digests

### 3.1 Candidate dataset

| Property | Verified value |
|---|---|
| Candidate `datasetVersion` | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` |
| Candidate `contentDigest` | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` |
| Schema | `IIPS_INVESTMENT_FUNDAMENTALS_V1` |
| Manifest evidence | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/runs/candidate-manifest.json` |
| Manifest SHA-256 | `b921741942d4674ed968f2938917b588b07ae9dc6db12f2998cb7361727d90ba` |
| Manifest Git blob | `1b655f9739620dacb2d93a0b21a90e53bb612633` |
| Recorded population | 3 issuers; 13 periods = 11 `ANNUAL` + 2 `QUARTER`; 0 issues |

**Verification method and boundary.** The candidate digest was verified read-only against the committed candidate manifest, CLI run log, coverage report, read-only assessment payloads, determination and regression-test pin. The three constituent `inputDigest` values were independently recomputed from the committed input bytes using the canonical sorted `{name, sha256}` list defined by `computeInputDigest`. **No new ingestion or candidate rebuild was executed**, because this work item expressly prohibits ingestion. The dataset digest is therefore verified as the exact recorded candidate identity bound to independently verified constituent inputs, not as a freshly rebuilt dataset.

### 3.2 Constituent input bundles consumed by the candidate

| Role | Exact input path | Issuer | Verified `inputDigest` |
|---|---|---|---|
| Original Infosys input retained | `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input` | `IN:CIN:L85110KA1981PLC013115` | `sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c` |
| Refreshed Marico successor | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico` | `IN:CIN:L15140MH1988PLC049208` | `sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d` |
| Refreshed KEC successor | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec` | `IN:CIN:L45200MH2005PLC152061` | `sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a` |

Exact consumed-file hashes:

| Input | File | SHA-256 |
|---|---|---|
| Infosys original | `periods.csv` | `e2cdba2042a55fc3352e85b8384e014f669e1472deb9011e7be2babd4fbc745c` |
| Infosys original | `roster.json` | `426e8478bca1ffc3fd47a6a24995230cfbfc05ccd1df4b92fa774ba15c60f8b4` |
| Marico successor | `periods.csv` | `df2e1d7182b9aa9d50ab2907342dc2f17330a1ac13fec5ad96a44fff68e41669` |
| Marico successor | `roster.json` | `259c2f093b611af8e1541a78ea5e151cc2ab41cf93ef32bbfaa54fcb18c2cadb` |
| KEC successor | `periods.csv` | `ff6e62fde3ec80143a759d2200cdd0f8fae64fc7113b9cb1da691b2baa37e46b` |
| KEC successor | `roster.json` | `d36b27705ef67fccacb3a3a71812556144a52d447a46cef87e3961b39335c0c6` |

The successor input directories live inside one enclosing S4-R3 evidence bundle. That bundle is **not** a new standalone Marico or KEC directory elsewhere: its exact path is `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/`.

### 3.3 Enclosing S4-R3 evidence bundle

| Property | Verified value |
|---|---|
| Path | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/` |
| Git tree at inspected baseline | `0d77f2b026e905c0c66e9039e91596a11fe57139` |
| Files in bundle | **27** |
| Entries in `digests.json` | **26** (the ledger excludes itself) |
| Ledger SHA-256 | `b41b0b106fe731d1b2420f72f05b2efa7e44e1a39ef185b4af063f441be92c63` |
| Ledger Git blob | `d1630e685b57064056884a83b93b2e5e8adae8f8` |
| Ledger verification | **26/26 SHA-256 and byte-count matches; 0 mismatches; no undeclared file except the ledger itself** |

## 4. Original versus successor admission scope

| Content | Admission position after this record |
|---|---|
| Original Infosys `REL-1-INFOSYS-2026-11-06` | Remains covered by the original O3 admission, subject to its existing limitations. The candidate consumes its unchanged original input. No newer Infosys period is admitted or inferred. |
| Original Marico `WI7-CONSUMER-MARICO-2026-11-07` | Original admission remains intact for that exact historical bundle. For the S4-R3 candidate, the admitted Marico input is the refreshed successor identified in §3.2. |
| Original KEC `WI8-INDUSTRIALS-KEC-2026-11-07` | Original admission remains intact for that exact historical bundle. For the S4-R3 candidate, the admitted KEC input is the refreshed successor identified in §3.2. |
| S4-R3 candidate dataset | Admitted as **candidate input** at the exact digest in §3.1. Admission is not installation and does not replace the existing Windows dataset. |
| Other bundles, WI2/WI3 variants, future restatements | **Not admitted by this record.** A different digest requires a fresh operator declaration under the original O3 re-issue obligation. |

Original bundle preservation was verified against the original O3 decision-time baseline `d1118df2…`:

| Original bundle | Git tree, unchanged at `d1118df2…` and `b2a14c9…` | Original ledger entries reverified |
|---|---|---:|
| `REL-1-INFOSYS-2026-11-06` | `c777e1e8a1a713028eb622a8b545857299dbef21` | 37/37 |
| `WI7-CONSUMER-MARICO-2026-11-07` | `41888478a5008c22cce3d82095040d75ff4d67ea` | 30/30 |
| `WI8-INDUSTRIALS-KEC-2026-11-07` | `b2cd94816f4e1968107402be8a44fb6e20bc82e4` | 54/54 |

Successor rosters are byte-identical to their admitted originals. Every historical CSV cell is preserved under its `issuer_id`/`period_end` key. Marico adds FY2025/FY2026 annual rows; KEC adds Q1/Q2 FY2027 discrete-quarter rows and the additive `quarter_form`/`quarter_index` columns, which are blank on historical annual rows. The original inputs remain the inputs that reproduce the historical host pin `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`; this work item did not rebuild that pin.

## 5. Preserved restrictions

The original O3 restrictions are preserved without widening:

- **Local personal use only**, for the operator’s own investment analysis.
- **Single user; local host only.**
- **No commercial or production deployment.**
- **No SaaS, multi-user, hosted or service-bureau use.**
- **No redistribution** of the bundles, datasets or derived artefacts is authorised.
- **No re-licensing or transfer** of the operator’s declaration to another person, deployment or organisation.
- The operator declaration is **not independent legal verification** of third-party licensing, publisher terms or source rights.
- Admission does not bypass identity, ownership, authority, revision or any other mandatory check, and does not change refusal vocabulary, status codes or store-effect guarantees.

## 6. Mandatory limitations preserved

### 6.1 Source rights and valuation

- **L-041 — source rights / dataset-classifier divergence: OPEN.**
- **L-042 — valuation basis-label / equity-bridge limitation: OPEN.**

No `sourceRights` metadata, source-rights classification, financial value, valuation logic, freshness policy or issuer identity was changed. The candidate manifest’s existing `OPERATOR_ASSERTED` declaration remains an operator attestation, not an independent rights review.

No PDF-to-transcription verification is claimed. The original PDFs were not independently inspected in this work item. The verified chain is committed extract/XBRL → transcription evidence → recorded candidate identity; the source-rights question remains open.

### 6.2 Freshness

The S4-R3 freshness results are preserved exactly at as-of **2026-11-14**:

| Issuer | Latest annual used | Staleness days | `STALE_STATEMENTS` | `STALE_DATA` | Quarterly periods |
|---|---|---:|---|---|---:|
| Infosys | 2024-03-31 | 958 | raised | present | 0 |
| Marico | 2026-03-31 | 228 | raised | present | 0 |
| KEC | 2026-03-31 | 228 | raised | present | 2 |

All three issuers remain subject to the reported `STALE_DATA` limitation. Admission does not make the data current, complete or market truth.

## 7. Verification performed

Machine-readable evidence: `evidence/integration/iid-o3-s4-r3-readmission-2026-11-14/verification.json`.

| Check | Result |
|---|---|
| GitHub branch independently inspected before recording | `arena/53ff9276-iips-review-recovered` at `b2a14c9851a7ee7b4b3a6dcf201778ce9f053e10` |
| Original O3 record read and preserved | Unchanged from publication commit `cf24c47b…` |
| S4-R3 design, evidence, readiness, bundle records and final handover read | Complete |
| S4-R3 bundle census / ledger | 27 files; 26 ledger entries; 26 matches; 0 mismatches |
| Original bundle trees and ledgers | 3 trees unchanged; 121/121 ledger entries match |
| Constituent input digests | 3/3 independently recomputed and matched to candidate manifest |
| Candidate digest cross-check | Manifest, run log, coverage, assessments, determination and test pin agree |
| Historical successor preservation | Rosters byte-identical; historical CSV cells preserved |
| Source-form / XBRL static checks | 105 cells checked; 0 failures |
| Committed source excerpts | 6 exact marked origin blocks; origin digests match |
| September XBRL identity | Compressed and raw SHA-256/byte counts match |
| Recorded freshness / `STALE_DATA` | 3/3 issuers preserved |
| JSON parse checks | 13 bundle JSON files parse |
| Read-only verification checks recorded | **87 checks; 0 failures** |
| Ingestion / candidate rebuild | **NOT EXECUTED** |

Publication state observed before recording: `main` at `08411bcd6d782a601fe5c82cc9983d076831148d`; PR #562 **OPEN**, unmerged, head `f98732e1861ff8b384183c30c11e4d1adbc2dc95`; no PR for the current branch. The O3-defining branch remained retrievable at `31a9b01e574f2911cc2685e3d63dddcfb1194d62`. Nothing was merged.

## 8. Execution boundary confirmations

| Boundary | Confirmation |
|---|---|
| Windows installation | **NOT PERFORMED** |
| `C:\iips-data` | **NOT READ OR WRITTEN** |
| Existing Windows dataset | **NOT MODIFIED** |
| Personal Portfolio SQLite database | **NOT ACCESSED OR MODIFIED** |
| Ingestion | **NOT EXECUTED** |
| Stage 2 identity provisioning | **NOT MODIFIED OR EXECUTED** |
| IPD | **NOT MODIFIED** |
| PR #562 or any other PR | **NOT MERGED** |
| Historical bundles / original O3 record | **NOT MODIFIED** |
| Overall IID readiness | **NOT CLAIMED** |

The local checkout was fast-forwarded to the independently inspected published baseline before recording; the prior uncommitted handover was preserved unchanged. No source, test, configuration, dependency, financial input or historical evidence file was edited by this work item.

## 9. Updated readiness and next step

| Item | Status after this record |
|---|---|
| O3 admission of the exact refreshed successor inputs and candidate | **RECORDED — ADMITTED** |
| S4-R3 acceptance limb | **DISCHARGED for the exact candidate identity** |
| S4-R3 overall closure | **OPEN** — freshness remains unresolved and host installation/verification has not occurred |
| Host installation / R-1 / R-2 captures | **NOT PERFORMED** |
| Infosys newer filing | **OPEN** |
| S4-R6 operating metrics / S4-R7 static roster lint | **OPEN** |
| D2–D6 Stage 5 dependencies | **OPEN** |
| Overall IID readiness | **NOT READY** |

**Next step:** a separately authorised operator host action may install the admitted candidate into a new candidate dataset location and capture host verification/readiness evidence. That action is not performed or implied by this record, must not silently replace the existing Windows dataset, and must preserve all stale-data and source-rights disclosures.

---

*End of additive O3 re-admission record.*
