# IIPS v3.0 — CAP-03 Gate 4 H-12 R5 Adoption: Prepared IPD-Locus Mirror Receipt (`2026-10-25`)

| Field | Value |
|---|---|
| Prepared Receipt ID | `IIPS-V3-CAP03-G4-H12-R5-ADOPTION-IPD-MIRROR-RECEIPT-2026-10-25-01` |
| Target Publication Locus | `ramkivs/iips-production-market-data` (`evidence/cross-repository/`) |
| Prepared In Locus | `ramkivs/iips-review-recovered` (`docs/integration/IIPS_v3.0_CAP03_G4_H12_R5_ADOPTION_IPD_MIRROR_RECEIPT_PREPARED_2026-10-25.md`) |
| Governing PA Act Referenced | `IIPS-V3-CAP03-G4-H12-R5-PA-ADOPTION-ACT-2026-10-25-01` (`docs/integration/IIPS_v3.0_CAP03_G4_H12_R5_PA_ADOPTION_ACT_EFFECTIVE_2026-10-25.md`) |
| Status | **PREPARED — NOT PUBLISHED IN IPD** (this IRR session made **zero IPD writes**; per `Gate 4 Act` §13.2, this file prepares exact cross-locus receipt text so an IPD-capable session can register the IRR-published H-12 R5 adoption act in IPD's execution tracker) |

---

## 1. What the IPD Locus Receives

| Item | Value to Record in IPD |
|---|---|
| Determination | **Gate 4 H-12 Authorized Manifest (`R5`) ADOPTED by Express PA Act** (`IIPS-V3-CAP03-G4-H12-R5-PA-ADOPTION-ACT-2026-10-25-01`) |
| Adopted Primary Manifest | `G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5` (`docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json` in IRR; Git blob SHA-1 `f4649e36a81c7013287810cd3202b99586dbd951`; `143,813` bytes; raw SHA-256 `d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76`) |
| Bound Amended-§8 Supplement | `IIPS-V3-CAP03-G4-H12-R5-AMENDED-S8-SUPPLEMENT-2026-10-25-01` (`evidence/integration/cap03-h12-r5-adoption-2026-10-25/20-amended-s8-supplemental-inventory.json` in IRR; Git blob SHA-1 `6c777de6f36bfd06ff89373540d755cc367744f2`; `287,101` bytes; raw SHA-256 `87442b0adbd061a700aa468bdd97e8b049819cc599f5ae50d7a94cfc2f33fdbf`) |
| Core Membership | **`32` IPD + `24` IRR = `56` `PRESENT` entries** (`G4-AMEND-01` Alternative A; `0` absent, `0` duplicates) + `1` conditional helper (`scripts/test-summary-parser.mjs`, `15c849fa739765af501182919748e4610acc4157`) |
| Designated IPD Primary QE Pin | `8eec74ae27cda09f3c368b9c299895eae41554db` / root tree `4eba29029f8d95cfe483e615a7047426b298ce50` (`32/32` core + `1/1` helper + `7/7` post-Gate-3 CAP-02 surface entries verified `PRESENT` and byte-unchanged at IPD `main@c6b540afd1fd3da5f18d029a54d1d89331916ead`) |
| Designated IPD Broker-Import Alias Pin | `70b24f029842a7e9b7f615e4d9df7376fd4ff817` / root tree `cc0f0117822850f9046e9a51bd05c1d45f80cd57` (`14/14` raw sources bound under 6/6 effective DQ-6b Path A; `10` identical, `4` divergent; strictly limited to IRR non-durable `build:broker-import` / DB-C1 preview) |
| Designated IRR QE Consumer Pin | `ba64b2d5927c2f872560710cf1474c25a5cde0d5` / root tree `5e4262f1cd75bf13b76ced5b45058f31434b5dad` (`24/24` core entries verified `PRESENT` and byte-unchanged) |
| Validation Basis | `981` R5 checks / `0` failures + `1,606` adoption-criteria checks / `0` failures; clean 2-build `1,140`-file `dist/**` reproducibility baseline (`81bddd5cdd007bccb391759d765f57d780cb3a9db886299890a5c0fa5c4311b2`, `npm pack` shasum `cc2aa70186b8fd7bc7255452ac8d8b00d094f53e`); `evidence_deposit_set = ABSENT_PENDING_EXECUTION` |
| IRR Publication Coordinates | To be copied by the IPD session from IRR Master Tracker `§16.123.12` post-merge publication receipt via independent GitHub API read-back |

---

## 2. Preserved Downstream Boundaries in IPD

1. **DQ-4 final QE freeze:** remains **`PREPARED AND VALIDATED — NOT ESTABLISHED`** (`8/10` criteria met; criteria `7` and `8` — native-Windows host sequence `S2 → one bounded P-1 → S3` and native-Windows canonical host evidence — remain `NOT MET`).
2. **Gate 4 & Qualification Execution:** Gate 4 remains **`AUTHORIZED — NOT STARTED`**; **`QE` remains `0/11` executed**; `S2`, `P-1` (strictly single-use), and `S3` remain **unexecuted**.
3. **Gate 5, Durable Reads, and Fences:** Gate 5 remains **`NOT INITIATED / NOT ADMITTED`**; DR-4r / DQ-3 Option B (`durable: false`) and all twelve IRR `/api/user-portfolios*` `HTTP 503` fences remain preserved unchanged; production eligibility remains **`NOT ADMITTED`**.

---

## 3. Non-Effectiveness of This Prepared File Prior to IPD Publication

| Check | Status |
|---|---|
| Published in `ramkivs/iips-production-market-data` by this IRR pass | **NO — `0` IPD writes** |
| This prepared file claimed as an IPD-side publication | **NO — prepared in IRR only** |
| Governing IRR H-12 R5 adoption act effective on IRR `main` upon IRR merge + CI + remote read-back | **YES** (`Gate 4 Act` §§8, 13, 15.3; `§16.123.12`) |

*End of prepared IPD mirror receipt — NOT PUBLISHED IN IPD.*
