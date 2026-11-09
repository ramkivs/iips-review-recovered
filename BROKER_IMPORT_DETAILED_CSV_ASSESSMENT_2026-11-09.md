# Broker Import Detailed-CSV Requirement — Evidence Assessment

**Repository:** `ramkivs/iips-review-recovered`
**Assessment date:** 2026-11-09
**Environment:** Local / Single-User / Non-Production
**Audit mode:** Read-only consumption of IPD code and data (no IPD modifications)

---

## 1. Publication Reference

| Field | Value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Branch | `evidence/publish-dhan-zerodha-holdings-20261109` |
| Commit | `2c2ee10cd025173d942f49d747095259703d417f` |
| Commit message | `Add Dhan holdings CSV with ISIN identifiers` |
| Date | 2026-11-09T23:11:51+05:30 |
| Parent commit | `e7abe21` |
| File | `evidence/broker-import/operator-supplied/dhan-holdings-withisin.csv` |

---

## 2. CSV Structure Verification

### Header (exact bytes from commit `2c2ee10`)

```
Trading Symbol,ISIN,Exchange,Total Qty,DP Qty,Available Qty,Average Buy Price,Last Traded Price,Current Value,Profit / Loss,P&L %
```

This **exactly matches** the governed `DHAN_DETAILED_HOLDINGS_V1` schema (11 columns, in order) as defined in `evidence/bi04/dhan-web-ui-summary-v1-schema.md` §2.1.

| Schema Position | Required Column | Actual Column | Match |
|---|---|---|---|
| 1 | Trading Symbol | Trading Symbol | ✅ |
| 2 | ISIN | ISIN | ✅ |
| 3 | Exchange | Exchange | ✅ |
| 4 | Total Qty | Total Qty | ✅ |
| 5 | DP Qty | DP Qty | ✅ |
| 6 | Available Qty | Available Qty | ✅ |
| 7 | Average Buy Price | Average Buy Price | ✅ |
| 8 | Last Traded Price | Last Traded Price | ✅ |
| 9 | Current Value | Current Value | ✅ |
| 10 | Profit / Loss | Profit / Loss | ✅ |
| 11 | P&L % | P&L % | ✅ |

**No BOM present.**

### Row Counts

| Metric | Value |
|---|---|
| Total lines | 69 |
| Header lines | 1 |
| Data rows | 68 |
| All rows fully populated (11 columns) | Yes |

### Identifier Completeness

| Identifier | Completeness | Values |
|---|---|---|
| **ISIN** | 100% (68/68) | All rows carry `INE####A#######` format ISINs |
| **Exchange** | 100% (68/68) | 64 NSE, 4 UNLISTED |
| **Series** | Not present | No Series column in `DHAN_DETAILED_HOLDINGS_V1` schema |

UNLISTED exchange rows: BCCL (row 9), CANARAROBECO (row 11), JIOPLATFORMS (row 37), NSE (row 44). Since ISIN is present and queried first/alone, UNLISTED exchange does not affect identity resolution path.

---

## 3. Parser Compatibility with Existing Dhan Broker Import Parser

**Format compatibility: YES.**

The existing IPD Dhan adapter (`adapters/dhan-holdings-adapter.ts` at IPD commit `ae393aaf`, PR #144) fully supports `DHAN_DETAILED_HOLDINGS_V1`.

| Parser Requirement | This CSV | Status |
|---|---|---|
| Variant detection by header signature | Exact 11-column match | ✅ Detected as `DHAN_DETAILED_HOLDINGS_V1` |
| ISIN column present and queried first/alone | All 68 rows have ISIN | ✅ ISIN lookup path |
| Exchange column present | All 68 rows have Exchange | ✅ NSE/UNLISTED parsed |
| ISIN upper-cased before lookup | All ISINs already uppercase | ✅ No transformation needed |
| UNLISTED exchange handling | 4 rows UNLISTED | ✅ ISIN takes priority over exchange |
| No company-name similarity fallback | N/A — ISIN-based | ✅ No fallback needed |
| XLSX format | CSV, not XLSX | ✅ Supported |

**Parse result:** 68/68 rows parsed successfully, 0 errors, 0 warnings.

---

## 4. Identity Qualification Against Authenticated IPD D05 Master

### Master Used

| Field | Value |
|---|---|
| Repository | `ramkivs/iips-production-market-data` |
| Commit | `ae393aafdb35869bd039e1354b988e4232b26f7c` (PR #144 merge) |
| Master | Authenticated D05 Universe (2,390 records) |
| Batch ID | `BATCH-D05-REPLACEMENT-AUTHENTICATED-UNIVERSE-2026-11-08-001` |
| Checksum SHA-256 | `b555fd28589a03ea5cbb11c92f880468bcc4b63f449b853a18542aca5817d4c4` |
| Authorization | `AUTH-D05-REPLACEMENT-AUTHENTICATED-UNIVERSE-ACT-2026-11-08-001` |
| Operating mode | OFFLINE_BOOTSTRAP |

### Identity Resolution Path

Per the existing broker-identity-assessment module (`broker-identity-assessment.ts`):
1. Each row classified as `ISIN` identifier class (ISIN present)
2. ISIN queried **first and alone** against governed master (`resolveCompanyId({identifierType: 'ISIN', ...})`)
3. No exchange-scoped fallback when ISIN is present
4. If ISIN found → `RESOLVED` with `companyId`
5. If ISIN not found → `UNMAPPED_IDENTIFIER` → `UNRESOLVED` with refusal code `UNMAPPED_IDENTIFIER`
6. P04 quarantine record created for each unresolved ISIN

### Execution Results

| Metric | Count |
|---|---|
| Total data rows | 68 |
| Valid rows | 68 |
| Resolved | 29 |
| Unresolved | 39 |
| Ambiguous | 0 |
| Not evaluated | 0 |
| Excluded | 0 |

### Resolved Rows (29)

| Row | ISIN | Symbol | Exchange | CompanyId |
|---|---|---|---|---|
| 1 | INE415A01038 | AGI | NSE | EQ_AGI_IN |
| 2 | INE491J01022 | ASKAUTOLTD | NSE | EQ_ASKAUTOLTD_IN |
| 3 | INE274Y01021 | AJAX | NSE | EQ_AJAXENGG_IN |
| 4 | INE420B01036 | ARIHANTCAP | NSE | EQ_ARIHANTCAP_IN |
| 6 | INE570D01018 | ARROWGREEN | NSE | EQ_ARROWGREEN_IN |
| 7 | INE442H01029 | ASHOKA | NSE | EQ_ASHOKA_IN |
| 8 | INE028A01039 | BANKBARODA | NSE | EQ_BANKBARODA_IN |
| 18 | INE548C01032 | EMAMILTD | NSE | EQ_EMAMILTD_IN |
| 19 | INE242A01010 | ENGINERSIN | NSE | EQ_IOC_IN |
| 21 | INE539A01019 | GHCL | NSE | EQ_GHCL_IN |
| 23 | INE079J01017 | GATEWAY | NSE | EQ_GATEWAY_IN |
| 25 | INE955D01029 | GENUSPOWER | NSE | EQ_GENUSPOWER_IN |
| 26 | INE266D01021 | GRAUWEIL | NSE | EQ_GRAUWEIL_IN |
| 27 | INE517F01014 | GPPL | NSE | EQ_GPPL_IN |
| 28 | INE019C01026 | HSCL | NSE | EQ_HSCL_IN |
| 29 | INE092T01019 | IDFCFIRSTB | NSE | EQ_IDFCFIRSTB_IN |
| 30 | INE489L01022 | IIFLCAP | NSE | EQ_IIFLCAPS_IN |
| 32 | INE575C01027 | INTLCONV | NSE | EQ_INTLCONV_IN |
| 37 | INE019A01038 | JIOPLATFORMS | NSE | EQ_JSWSTEEL_IN |
| 42 | INE866R01028 | MATRIMONY | NSE | EQ_MATRIMONY_IN |
| 46 | INE305C01029 | PANAMAPET | NSE | EQ_PANAMAPET_IN |
| 53 | INE0CLI01024 | RATEGAIN | NSE | EQ_RATEGAIN_IN |
| 54 | INE170V01027 | SALASAR | NSE | EQ_SALASAR_IN |
| 55 | INE908D01010 | SHAKTIPUMP | NSE | EQ_SHAKTIPUMP_IN |
| 58 | INE076B01028 | SIYARAMSIL | NSE | EQ_SIYSIL_IN |
| 61 | INE594H01019 | THYROCARE | NSE | EQ_THYROCARE_IN |
| 62 | INE615H01020 | TITAGARH | NSE | EQ_TITAGARH_IN |
| 64 | INE050M01012 | VSSL | NSE | EQ_VSSL_IN |
| 67 | INE299N01021 | WAAREERTL | NSE | EQ_WAAREERTL_IN |

### Unresolved Rows (39)

| Row | ISIN | Symbol | Exchange | Refusal Reason |
|---|---|---|---|---|
| 5 | INE006O01015 | ARKADE | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 9 | INE0O3G01018 | BCCL | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 10 | INE0BCP01013 | BLUEJET | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 11 | INE0V7G01014 | CANARAROBECO | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 12 | INE888Y01019 | CREDO | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 13 | INE081U01012 | DAMCAPITAL | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 14 | INE0F9E01010 | ECOSMOBILITY | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 15 | INE0B6801012 | EMS | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 16 | INE067701014 | EPACK | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 17 | INE205B01023 | ELECON | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 20 | INE045J01026 | FINEORG | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 22 | INE08B801016 | GMRPUI | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 24 | INE910T01010 | GEEKAYWIRE | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 31 | INE681B01015 | INDRAMEDCO | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 33 | INE0SVO01010 | IGI | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 34 | INE926I01015 | JKIL | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 35 | INE091D01014 | JAIBALAJI | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 36 | INE039C01024 | JAMNAAUTO | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 38 | INE157H01014 | KMSUGAR | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 39 | INE530T01028 | KPENERGY | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 40 | INE05N501015 | KROSS | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 41 | INE559X01021 | LANDMARK | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 43 | INE905K01014 | MONARCH | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 44 | INE104D01011 | NSE | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 45 | INE0TQU01011 | OSWALPUMPS | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 47 | INE088Z01015 | PARADEEP | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 48 | INE372C01029 | PRECWIRE | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 49 | INE812A01025 | PREMIERPOL | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 50 | INE119U01013 | PUDUMJEE | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 51 | INE583V01021 | RADHIKA | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 52 | INE535D01029 | RAJOOENG | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 56 | INE937A01017 | SHARDAMOTR | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 57 | INE010V01014 | SIGMASOLVE | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 59 | INE124E01020 | STEELCAST | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 60 | INE043D01016 | SUZLON | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 63 | INE562X01013 | UNIVASTU | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 65 | INE088Z01019 | VISHALMEGA | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 66 | INE270I01014 | VISHNU | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |
| 68 | INE855C01015 | WEBELSOLAR | NSE | UNMAPPED_IDENTIFIER — ISIN absent from governed master |

All 39 unresolved rows share the same refusal code `UNMAPPED_IDENTIFIER` and missing evidence statement: "The supplied ISIN is not registered in the governed security master; an authoritative mapping (governed deposition) is required."

---

## 5. P04 Whole-Import Qualification

| Field | Value |
|---|---|
| Disposition | `REJECTED` |
| Saveable | `false` |
| User holdings length | 0 |
| Store effect | `NONE` |
| Refusal codes | `{"UNMAPPED_IDENTIFIER": 39}` |
| Pipeline stage reached | `NORMALIZE` |

**P04 whole-import refusal:** Since 39 of 68 rows are unresolved, `saveable = false`. The import is rejected under P04 / DP-2 Option 2F. No holdings are persisted.

---

## 6. Qualification Outcome

**The import does NOT qualify for persistence.**

| Criterion | Result |
|---|---|
| CSV format is `DHAN_DETAILED_HOLDINGS_V1` | ✅ YES |
| Parser compatibility | ✅ YES — 68/68 rows parsed |
| ISIN completeness | ✅ YES — 100% |
| All rows identity-resolved | ❌ NO — 29/68 resolved, 39/68 unresolved |
| P04 whole-import saveable | ❌ NO — `saveable: false` |
| Qualifies for persistence | ❌ NO — `disposition: REJECTED`, `storeEffect: NONE` |

**The detailed-CSV file exists and is parser-compatible, but identity qualification fails** because 39 of the 68 ISINs are absent from the governed authenticated D05 master. The import is P04-refused with zero store effect.

To qualify, the unresolved ISINs would require a new IPD D05 deposition under a new PA authorization act (Wave-2 Security Master Expansion Act), adding these entities to the governed corpus. IRR cannot perform this deposition; it is IPD-owned.

---

## 7. Evidence Artifacts

| Artifact | Path | Description |
|---|---|---|
| Execution evidence JSON | `evidence/integration/dhan-detailed-assessment-evidence-2026-11-09.json` | Full pipeline execution output including per-row assessments, quarantine records, provenance digests |
| Source CSV | `evidence/broker-import/operator-supplied/dhan-holdings-withisin.csv` (commit `2c2ee10`) | Operator-supplied Dhan Detailed Holdings CSV with ISIN identifiers |
| Content digest | `355acf73f6decb4a49b11b8aa3a0722fba032e59075b2db2ca47e405776291c7` | SHA-256 of raw CSV bytes |
| IPD commit consumed | `ae393aafdb35869bd039e1354b988e4232b26f7c` | Authoritative IPD main (PR #144 merge) |
| Pipeline code used | IPD `frontend/src/features/portfolio/import/` | Dhan adapter, identity assessment, ingress orchestrator, mapper |

---

## 8. Conclusion

The `DHAN_DETAILED_HOLDINGS_V1` CSV file has been published by the operator and is **parser-compatible** with the existing Dhan Broker Import pipeline. However, **identity qualification against the authenticated IPD D05 master fails**: 39 of 68 ISINs are absent from the governed corpus, resulting in a P04 whole-import refusal (`saveable: false`, `storeEffect: NONE`).

The detailed-CSV requirement is **partially satisfied**: the file exists and parses correctly, but the import cannot proceed to persistence because the governed security master lacks mappings for 39 of the 68 ISINs. Resolution requires IPD-side D05 deposition under a new authorization act — an IPD/PA-owned action outside IRR's scope.

**No holdings were persisted.** P04 fail-closed behavior is verified working as designed.