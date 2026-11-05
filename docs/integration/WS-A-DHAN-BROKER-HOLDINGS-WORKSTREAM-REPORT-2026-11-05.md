# Workstream A — Dhan Broker Holdings Import, Identity Resolution and Durable Persistence
## Consolidated report (2026-11-05)

**Repositories investigated:** `ramkivs/iips-review-recovered` (IRR) and
`ramkivs/iips-production-market-data` (IPD).
**Investigated baselines:** IRR `main@9e0a041` (PR #433 merged), IPD `main@b605a61` (PR #125
merged), plus every remote branch head visible at investigation time and the full PR history of
both repositories (`gh pr list --state all`).
**Session branch (IRR):** `arena/63391e87-iips-review-recovered`.
**IPD working branch:** `arena/63391e87-iips-production-market-data` (commit `2f97357`,
**push blocked — see §12**).

---

## 1. Ownership map (who owns which lifecycle stage)

| # | Lifecycle stage | Owner | Implementation |
| --: | :--- | :--- | :--- |
| 1 | Native evidence acquisition | IRR | `src/features/broker-holdings/BrokerHoldingsPreview.tsx` (local `File.text()`, 1 MiB cap, no upload) |
| 2 | Original evidence retention | IRR | **was absent**; now `server/broker-import/brokerImportEvidenceStore.ts` (PF-1 journal). Raw bytes deliberately not retained (product statement: CSV stays local). |
| 3 | Format detection | IPD | `frontend/src/features/portfolio/import/broker-format-detector.ts` |
| 4 | Parsing (Dhan detailed + Web UI summary) | IPD | `adapters/dhan-holdings-adapter.ts` |
| 5 | Row-count / field integrity | IPD (parse) + IPD (validate) | adapter + `broker-import-ingress.ts` stage 5 |
| 6 | Digest generation | IPD | `computeSha256` in `src/contracts/provenance.ts`, ingress stage 0 |
| 7 | Source metadata / timestamp | IPD ingress → IRR evidence record | `provenance.{fileName,asOf,contentDigest}` |
| 8 | Identifier normalization | IPD | mapping store `.trim().toUpperCase()` |
| 9 | Security-master lookup | IPD (authority) | `src/identity/security_master.ts`, `mapping_store.ts` (effective-dated) |
| 10 | Identity resolution | IPD | `broker-holdings-mapper.ts` (BI-03) and `src/identity/broker_observation_resolver.ts` (durable leg) |
| 11 | P04 quarantine | IPD | `src/identity/quarantine.ts`, mapping-store quarantine sink |
| 12 | Validation | IPD | ingress stage 5 (`VALIDATE`) |
| 13 | Save authorization | IPD | Gate E W-1 `evaluatePortSaveGuard()` in `src/persistence/portfolio_store.ts` |
| 14 | Durable holdings persistence | IPD | `src/persistence/brokerImportPersistence.ts` + `DurablePortfolioStore` (SQLite) |
| 15 | API/UI retrieval | IRR (renderer) / IPD (direct P1 IPC provider) | `server/broker-import/brokerImportHttp.ts` (GET revision), `src/api/userPortfolios.ts` |
| 16 | Separate-process restart recovery | IPD (holdings) + IRR (evidence) | IPD `tests/q1_broker_import_durability.test.ts`; IRR `brokerImportEvidenceRestart.test.ts` |
| 17 | Import ↔ holdings reconciliation | IPD (`reconcileBrokerImportByRead`) + IRR evidence record | both |

IRR never resolves identity, never writes holdings and never claims durability from a display.

---

## 2. Branches, commits and PR findings

| Repository | Finding |
| :--- | :--- |
| IRR | `main@9e0a041`; 433 merged PRs, none open. The broker-import work landed as: preview (PR lineage of `d82ff99`, Dhan convergence 2026-10-16), CAP-02 transport/composition acts (PR #114 lineage, 2026-10-23/26), Direct P1 read (PR #424), tracking records (#427–#433). **No merged or open branch contains per-row identity evidence, an evidence journal, or a truthfulness fix for the 0/68 counters.** Remote holds only ephemeral `arena/*` heads; none supersedes `main` for these stages. |
| IPD | `main@b605a61`; 125 PRs (124 merged, #126 open and unrelated — a Windows setup bundle). The identity/parsing implementation is `bi03/bi04/bi05/bi07/bi08` (merged), the durable leg is PR #109/#113 (`O5-A` refusing consumer, 941 tests), DR-2 provider envelope #89. **No merged or open branch assesses every row before refusing**, so the per-row evidence gap is a mainline defect, not lost work. |
| Both | No unmerged work was found that implements the corrections published here; no conflicting implementation exists. Nothing was re-done without evidence. |

---

## 3. Exact source evidence — all 68 rows (retained verbatim)

`evidence/integration/ws-a-dhan-68-row/rows.json` retains, for every row: the verbatim source
name, the row's raw digit string exactly as supplied, the numeric reading used, **every**
alternative decomposition, and the explicit absence of ISIN and exchange. 67 of 68 rows have at
least one alternative decomposition, so no row is "inferred" silently.

Two evidence limitations are recorded rather than papered over:

1. **The original bytes were never retained** — the system displayed only a digest. The
   reconstructed fixture therefore has its own digest
   (`c44e3cdb06e2d49f88c46d61867444f8a301cdf71a068b0e3aa1d748e6d52f31`) and **nothing asserts it
   equals** the observed `468441df…6264b1`. The observed digest is unverifiable from the retained
   artefacts of the run — itself an evidence-retention finding (§6).
2. **The numeric columns are a documented de-concatenation** of the supplied digit strings. The
   names are verbatim, and identity resolution acts on names/ISIN/exchange only, so the identity
   conclusions are independent of which decomposition is chosen.

---

## 4. Injection of the evidence into the real pipeline (measured)

`evidence/integration/ws-a-dhan-68-row/identity-outcomes.json` is the output of the **actual**
IPD pipeline (not a model of it) for these 68 rows:

| Run | Disposition | Rows | Resolved | Unresolved | Assessed individually |
| :--- | :--- | --: | --: | --: | --: |
| Empty `SecurityMaster` (the configuration the observed run used) | `REJECTED` @ `NORMALIZE` | 68 | 0 | 68 | **0** (pipeline aborted at row 1) |
| Governed D05 master (`7f53540b…b74b5`, 2,250 entities) | `REJECTED` @ `NORMALIZE` | 68 | **1** | 67 | 68 (after the IPD correction) |

---

## 5. 68-row identity reconciliation

Table generation: `evidence/integration/ws-a-dhan-68-row/identity-outcomes.json` (governed run).
"Lookup result" lists the namespaces actually queried, in order.

| # | Source name | Mapping evidence in the authoritative source | Lookup result | Identity status | Exact reason |
| --: | :--- | :--- | :--- | :--- | :--- |
| 1 | AGI GREENPAC | No ISIN; no exchange. Exact governed display-name alias `NSE_SYMBOL:AGI GREENPAC` → `EQ_AGI_IN` (effective 2022-01-01; D05 revision `7f53540b…b74b5`). | NSE_SYMBOL: RESOLVED → `EQ_AGI_IN` · BSE_SYMBOL: UNMAPPED_IDENTIFIER | **RESOLVED** (canonical P04) | Resolved by the governed alias on the first (NSE) lookup; the BSE namespace was not queried. Still not saveable: the other 67 rows are unresolved and P04 applies to the whole import. |
| 2 | ASK AUTOMOTIVE | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 3 | AJAX ENGINEERING | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 4 | ARIHANT CAPITAL MARKETS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 5 | ARKADE DEVELOPERS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 6 | ARROW GREENTECH | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 7 | ASHOKA BUILDCON | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 8 | BANK OF BARODA | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 9 | BHARAT COKING COAL | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 10 | BLUE JET HEALTHCARE | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 11 | CANARA ROBECO ASSET MANAGEMENT COMPANY | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 12 | CREDO BRANDS MARKETING (MUFTI) | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 13 | DAM CAPITAL ADVISORS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 14 | ECOS MOBILITY & HOSPITALITY | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 15 | EMS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 16 | EPACK PREFAB TECHNOLOGIES | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 17 | ELECON ENGINEERING COMPANY | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 18 | EMAMI | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 19 | ENGINEERS INDIA | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 20 | FINEOTEX CHEMICAL | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 21 | GHCL | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 22 | GMR POWER & URBAN INFRA | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 23 | GATEWAY DISTRIPARKS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 24 | GEEKAY WIRES | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 25 | GENUS POWER INFRASTRUCTURES | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 26 | GRAUER & WEIL | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 27 | GUJARAT PIPAVAV PORT | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 28 | HIMADRI SPECIALITY CHEMICAL | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 29 | IDFC FIRST BANK | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 30 | IIFL CAPITAL SERVICES | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 31 | INDRAPRASTHA MEDICAL CORPORATION | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 32 | INTERNATIONAL CONVEYORS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 33 | INTERNATIONAL GEMOLOGICAL INSTITUTE | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 34 | J KUMAR INFRAPROJECTS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 35 | JAI BALAJI INDUSTRIES | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 36 | JAMNA AUTO INDUSTRIES | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 37 | JIO PLATFORMS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 38 | KM SUGAR MILLS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 39 | KP ENERGY | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 40 | KROSS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 41 | LANDMARK CARS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 42 | MATRIMONY.COM | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 43 | MONARCH NETWORTH CAPITAL | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 44 | NATIONAL STOCK EXCHANGE OF INDIA | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 45 | OSWAL PUMPS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 46 | PANAMA PETROCHEM | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 47 | PARADEEP PHOSPHATES | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 48 | PRECISION WIRES INDIA | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 49 | PREMIER POLYFILM | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 50 | PUDUMJEE PAPER PRODUCTS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 51 | RADHIKA JEWELTECH | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 52 | RAJOO ENGINEERS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 53 | RATEGAIN TRAVEL | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 54 | SALASAR TECHNO ENGINEERING | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 55 | SHAKTI PUMPS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 56 | SHARDA MOTOR | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 57 | SIGMA SOLVE | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 58 | SIYARAM SILK MILLS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 59 | STEELCAST | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 60 | SUZLON ENERGY | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 61 | THYROCARE TECHNOLOGIES | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 62 | TITAGARH RAIL SYSTEMS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 63 | UNIVASTU | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 64 | VARDHMAN SPECIAL STEELS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 65 | VISHAL MEGA MART | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 66 | VISHNU CHEMICALS | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 67 | WAAREE RENEWABLE TECHNOLOGIES | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |
| 68 | WEBSOL ENERGY SYSTEM | No ISIN; no exchange. No exact key for this name in the NSE or BSE symbol namespace; no D05 entity matches the name or its compacted symbol form. | NSE_SYMBOL: UNMAPPED_IDENTIFIER · BSE_SYMBOL: UNMAPPED_IDENTIFIER | UNRESOLVED (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` — the export supplies neither ISIN nor exchange and the published name is not a governed mapping key or alias. Missing evidence: the ISIN (preferred) or an exchange-scoped trading symbol. |

**Summary:** 68 rows accounted for. **1 resolved** (`AGI GREENPAC` → `EQ_AGI_IN`, governed
alias), **67 unresolved** with an identical, evidenced cause. No row was resolved by name
similarity; no identifier was invented.

---

## 6. Root cause of the unresolved identities (exact)

1. **The observed run could never resolve anything (IRR defect, primary).** The preview passed an
   **empty** `SecurityMaster` to IPD's ingress. `AGI GREENPAC` — the one row with authoritative
   mapping evidence in the governed master — therefore failed, and the failure it displayed was
   the mapper's *second, speculative* lookup: `BSE_SYMBOL:AGI GREENPAC`. Reproduced verbatim
   (`WS-A-07`, empty master). With the governed master supplied the same row resolves and the
   first refusal moves to `ASK AUTOMOTIVE` — direct proof that the master, not the file, produced
   the zero.
2. **The broker export supplies no identifier that P04 can resolve (source limitation).**
   `DHAN_WEB_UI_SUMMARY_V1` carries a display name, no ISIN and no exchange. 67 of the 68 names
   have no exact key in either symbol namespace and no D05 entity whose name or compacted
   symbol form matches. The governed master is 52 real plus 2,198 synthetic records
   (`BLOCK-3L-BROKER-CSV-FULL-RESOLUTION-AUDIT.md`), so absence is genuine and total, not a
   lookup defect.
3. **The mapper aborted at the first unresolved row (IPD defect).** Rows 2–68 were never assessed,
   so the run produced one message for the file and zero per-row outcomes — the reason the
   operator could not tell whether 68 rows failed identically or differently.
4. **The reported reason was the masked fallback, not the evidence (IPD defect).** Only the last
   speculative lookup survived, so the message read as an exchange mismatch when the actual cause
   was a missing identifier class.
5. **Not a cause:** effective dating (`asOf` is inside all effective windows), normalization
   (values are trimmed/upper-cased consistently on both sides), and inactive mappings (no
   candidate mapping was found at all for the 67 rows).

---

## 7. P04 quarantine assessment

P04 is **effective and not bypassed**. Quarantine records are produced for every failed lookup
with `quarantineId`, `identifierType`, `rawIdentifier`, `reason`, `asOf`, `receivedAt` and
`details`. After the IPD correction, all 68 rows' records survive the refusal and are retained in
the evidence record. `DP-2 Option 2F` (whole-import refusal unless every holding has one governed
canonical identity) is intact: 1 resolved row does **not** authorize the import. No operator
bypass was used (`allowNonProductionBypass: false` everywhere in the tested paths).

---

## 8. Evidence-retention and persistence assessment

| Artefact | Retained before | Retained now | Where |
| :--- | :--- | :--- | :--- |
| Original native evidence | No (digest only) | Governed equivalent: complete parsed inventory, digest, metadata; raw bytes deliberately not retained | IRR evidence journal |
| Complete parsed 68-row result | No | Yes (all 68 rows, native values, ISIN/exchange explicitly `null`) | IRR evidence journal |
| Content digest | Displayed only | Yes (+ record digest re-verified on read) | IRR evidence journal |
| Source metadata + read timestamp | Displayed only | Yes | IRR evidence journal |
| Per-row identity status / basis | No (hard-coded label) | Yes (`identityBasis` per row) | IRR evidence journal |
| Mapping-lookup evidence | No | Schema field present; populated once the IPD correction is published and the pin advanced | IRR evidence journal |
| P04 quarantine decisions | In-memory only | Yes (refusal details verbatim) | IRR evidence journal |
| Refusal details | Displayed only | Yes | IRR evidence journal |
| Validation / save-authorization decisions | Not recorded | Recorded as `NOT_PERFORMED` / `authorized: false` with reasons | IRR evidence journal |
| Authorized saved holdings | Fenced by Gate E W-1 | Proven on a qualification fixture (not the user's data) | IPD SQLite store |
| Import→holdings reconciliation | Read-only helper | Recorded in every evidence record (`importedRows`, `savedRows`, `difference`, disposition) | IRR + IPD |

---

## 9. Validation and save authorization

* **Validation** is IPD ingress stage 5 and is only reached when identity resolves for the whole
  file; it is never reached for this surface.
* **Save authorization** is Gate E W-1 (`evaluatePortSaveGuard()`), which is hard-false for
  W-1(3) Gate 4 qualification and W-1(4) Gate 5 admission. `persistBrokerImport` therefore returns
  `WRITE_NOT_AUTHORIZED` with `storeEffect: 'NONE'` and **zero rows touched** (proven by
  `countRows()` before/after). This is **correct fail-closed governance, not a defect**.
* The preview performs neither, and now says so explicitly instead of leaving it to inference.

---

## 10. Separate-process restart recovery (measured)

| What | Test | Result |
| :--- | :--- | :--- |
| Unresolved 68-row import evidence | IRR `brokerImportEvidenceRestart.test.ts` — Process A runs the real preview + real journal and exits; Process B receives only the store address, identity scope and an independent digest expectation; a third process repeats the import | PASS — 1 record, 68 rows, identical `recordDigest`, `duplicateImportIds: false`, foreign scope invisible, no duplication on re-import |
| Authorized holdings (qualification fixture) | IPD `tests/q1_broker_import_durability.test.ts` — in-process restart, then a genuinely separate OS process reading the SQLite file, then an idempotent re-import | PASS (49 tests incl. Q1 suites) — holdings and contributions byte-equal after restart, separate-process read matches, re-import is `ALREADY_IMPORTED_NO_OP` with no duplicated row |
| Storage failure | IRR store unit test (unwritable data dir), IPD injected-fault rollback test | PASS — throws, never reports retention/success |

---

## 11. Confirmed defects and corrections

| ID | Owner | Defect | Correction | Status |
| :-- | :--- | :--- | :--- | :--- |
| IRR-D1 | IRR | Empty `SecurityMaster` → nothing can resolve; 0/68 presented as a lookup result | Governed IPD master supplied; counters state what was measured | Published (IRR PR) |
| IRR-D2 | IRR | Every row hard-labelled `UNRESOLVED` | Per-row `identityStatus` + `identityBasis` from the pipeline | Published (IRR PR) |
| IRR-D3 | IRR | "individually assessed" count absent | `counts.identityAssessedRows` (honest 0 while refused) | Published (IRR PR) |
| IRR-D4 | IRR | No retention of any import evidence | PF-1-backed evidence journal, tamper-verified, restart-proven | Published (IRR PR) |
| IPD-D1 | IPD | Mapper aborts at first unresolved row → no per-row evidence | Every row assessed before a single typed refusal | Implemented, **publication blocked** |
| IPD-D2 | IPD | Refusal surfaces only the last speculative lookup | Full ordered lookup evidence attached to the refusal | Implemented, **publication blocked** |
| IPD-D3 | IPD | Unscoped name/symbol lookups unrecorded | Identifier class + every attempt + missing evidence recorded | Implemented, **publication blocked** |
| IPD-D4 | IPD | Exchange-scoped rows queried in the NSE namespace first | Declared exchange's namespace only | Implemented, **publication blocked** |
| IPD-D5 | IPD | No master supplied claimed `RESOLVED` | `NOT_EVALUATED` / `IDENTITY_NOT_EVALUATED` | Implemented, **publication blocked** |

Correct fail-closed behaviours explicitly **not** changed: P04 quarantine, DP-2 Option 2F
whole-import refusal, Gate E W-1 write gate, no name-similarity inference, no fabricated
identifiers, no save of unresolved holdings.

---

## 12. Files changed, commits, PRs and remote verification

### IRR (published)

| File | Change |
| :--- | :--- |
| `frontend/src/api/brokerHoldingsPreview.ts` | governed identity authority, computed counters, per-row `identityBasis`, explicit non-performed decisions |
| `frontend/src/api/brokerHoldingsPreview.test.ts` | 18 tests incl. 8 WS-A 68-row cases |
| `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx` | counters, authority disclosure, corrected copy |
| `frontend/src/features/broker-holdings/BrokerHoldingsPreview.test.tsx` | updated expectations |
| `frontend/server/broker-import/brokerImportEvidenceStore.ts` | **new** durable evidence journal (PF-1) |
| `frontend/server/broker-import/brokerImportEvidenceStore.test.ts` | **new** 7 retention tests |
| `frontend/server/broker-import/brokerImportEvidenceWriter.ts` / `...Recoverer.ts` | **new** separate-process proof harness |
| `frontend/server/broker-import/brokerImportEvidenceRestart.test.ts` | **new** restart-recovery proof |
| `frontend/server/broker-import/__fixtures__/dhan-web-ui-summary-68.csv` | **new** 68-row fixture |
| `frontend/server/broker-import/index.ts` | exports the evidence store |
| `frontend/tsconfig.broker-import.json` | compiles the governed master from the pin |
| `docs/integration/WS-A-BROKER-PREVIEW-AND-EVIDENCE-RETENTION-2026-11-05.md` | IRR implementation record |
| `docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05.md` | this report |
| `evidence/integration/ws-a-dhan-68-row/*` | rows, outcomes, preview output, evidence record, transcript |

### IPD (implemented, NOT published)

| File | Change |
| :--- | :--- |
| `frontend/src/features/portfolio/import/broker-identity-assessment.ts` | **new** per-row assessment + typed refusal |
| `frontend/src/features/portfolio/import/broker-holdings-mapper.ts` | assess all rows, one refusal, no masked reason, exchange-scoped lookups |
| `frontend/src/features/portfolio/import/broker-import-ingress.ts` | publish assessments on success and refusal |
| `frontend/src/features/portfolio/import/types.ts` | `identityAssessments` / `identitySummary` |
| `tests/ws_a_dhan_broker_holdings_identity.test.ts` | **new** 12 tests, all pass |
| `evidence/integration/ws-a-dhan-68-row/*`, `docs/integration/WS-A-DHAN-BROKER-IDENTITY-EVIDENCE-RECORD-2026-11-05.md` | evidence + record |

Local IPD commit `2f97357` on `arena/63391e87-iips-production-market-data`.
**Push rejected:** `remote: Permission to ramkivs/iips-production-market-data.git denied to
ramkivs. … 403`; `gh api … /git/refs` → `Resource not accessible by integration (403)`. The GitHub
connection for this session is read-only for IPD, so **no IPD commit, PR or merge exists**. The
correction is complete and green locally but is **not completion** until it is published.

### Test summary (exact)

* IRR: `npm run typecheck` PASS; `npm test` → **111 files / 1381 tests PASS**; broker-import +
  preview subset → 10 files / 107 tests PASS.
* IPD: `tsc` PASS; new suite **12/12 PASS**; unchanged suites re-run — BI-03/04/05/07/08 +
  operator-bypass **93/93 PASS**, Q1 durable import + consumer + E2E multi-broker + P04
  broad-universe **49/49 PASS**.

---

## 13. Acceptance matrix

| Lifecycle stage | Owner repository | Implemented | Operational | Durable | Restart verified | Result / blocker |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Native evidence acquisition | IRR | Yes | Yes (browser file read, 1 MiB cap) | n/a | n/a | Working |
| Parsing | IPD | Yes | Yes | n/a | n/a | 68/68 rows, no loss or duplication |
| 68-row preservation | IPD + IRR | Yes | Yes | Yes | Yes | Full inventory retained; numeric columns are a documented de-concatenation |
| Digest and metadata | IPD (compute) + IRR (retain) | Yes | Yes | Yes | Yes | Deterministic and content-sensitive; observed digest unverifiable (bytes not retained) |
| Identity resolution | IPD | Yes (corrected) | Partly | Yes (evidence) | Yes | 1/68 resolvable with existing evidence; 67 genuinely unmapped. **IPD correction unpublished (403)** |
| P04 quarantine | IPD | Yes | Yes | Yes | Yes | Effective; per-row records retained; no bypass |
| Validation | IPD | Yes | Not reached | n/a | n/a | Unreachable while identity is unresolved — correct |
| Save authorization | IPD | Yes | Yes | n/a | n/a | W-1 gate refuses with zero store effect — correct governance |
| Holdings persistence | IPD | Yes | No (W-1 false) | Yes (fixture) | Yes | Real-user save blocked by Gate 4/5; never fabricated |
| Retrieval and reconciliation | IRR + IPD | Yes | Partly | Yes | Yes | Evidence record carries reconciliation; CAP-02 read route live, **write path refuses** |
| Import-evidence retention | IRR | Yes | Library only | Yes | Yes | **Blocker:** mounting a route needs a transport authority act (closed route set) |

---

## 14. Remaining blockers (with the exact missing evidence)

1. **IPD publication (accountable: IPD, blocked by the GitHub connection).** Commit `2f97357` is
   green locally; the session's GitHub integration is read-only for IPD (`403 — Resource not
   accessible by integration`). Remediation: reconnect GitHub so the integration can write to
   `ramkivs/iips-production-market-data`, then push the branch and open the PR.
2. **IRR per-row identity evidence in the preview (accountable: IRR, dependent on 1).** The pinned
   `iips-broker-import` is `70b24f0` (2026-10-16), which cannot publish per-row assessments.
   Consuming the correction requires a governed pin advance to the merged IPD commit; until then
   the preview reports `identityAssessedRows: 0` and a file-level identity basis — truthfully.
3. **Authoritative identifiers for 67 of 68 rows (accountable: source data).** Missing evidence:
   an ISIN or an exchange-scoped trading symbol per holding. `DHAN_WEB_UI_SUMMARY_V1` does not
   emit either. The `DHAN_DETAILED_HOLDINGS_V1` export (which carries ISIN and Exchange) would
   resolve rows that exist in the governed master; rows absent from the master (all 67 today)
   need a governed D05 deposition before they can resolve at all.
4. **Import-evidence route (accountable: IRR governance).** The admitted broker-import route set is
   closed (POST holdings, GET revision). An evidence-retention endpoint needs a transport authority
   act plus the retention/consent statement for local storage of parsed personal financial
   evidence.
5. **Real-user durable save (accountable: IPD governance).** Gate 4 qualification and Gate 5
   admission are not accepted (W-1(3)/W-1(4)). No implementation change can lift this, and none
   was attempted.
