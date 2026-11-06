# B-04 — Dhan 68-row ISIN + NSE reassessment (2026-11-06)

**B-04 reassessment COMPLETE / VERIFIED: 68 explicit dispositions; 1 resolved, 67 unresolved, 0 ambiguous. No identity-status changes from the previous1/67 assessment.** This is an additive read-only identity assessment, not import execution or full identity coverage. No IPD/master change or Wave-2 expansion.

## 1. Source validation before matching

Source is the complete user-embedded Dhan equity portfolio dated06-11-2026, reconciled by the user with Dhan Demat dated05-11-2026. `source.csv` retains all68 rows/all9 supplied columns, exact numeric strings/quantities/P&L values and the trailing space in “National Stock Exchange of India ”. Exchange=NSE is an explicit user-supplied constant, not an inferred tenth source column. No further upload is required or requested. Broker authenticity/reconciliation itself is user-attested, not independently checked with Dhan.

Pre-match validation PASS:68 data rows,nine columns on every row,no blanks,68 distinct ISIN+NSE keys,valid ISIN syntax/checksum,finite numeric fields,quantity×LTP=current value and current−buy=P&L for all68. No parsing/data-integrity issue found. Average-buy×quantity is not enforced against rounded displayed rates; no supplied buy value is recalculated. Source SHA256: **2dc1d1fba6e183cfa657652d0dab98daac570df6e3ef3adbbc8f2a397fcabd0d**. Full pre-match evidence: `source-validation.json`.

## 2. Current authoritative master and rule boundary

Read IPD main remotely at **`749d42067edc86e74d2cf35deb4562c4549687a0`** (after #132). No stale IRR package cache/local master was used. Nine remote source/manifest/corpus blobs were independently verified by Git blob identity and SHA256, recorded in `master-readbacks.json`.

**Revision R (used on every row below and expanded on every JSON row):**
- batchId `BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001`
- fileChecksumSha256 `7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5`
- recordCount2250; authorizationRef `AUTH-D05-BROAD-UNIVERSE-MASTER-EXPANSION-ACT-2026-09-22-001`; operatingMode `OFFLINE_BOOTSTRAP`.

The fetched2250-record JSON matches that checksum/manifest. Its contents equal the fetched runtime TS asset. Only the pure fetched identity provider and dependency closure were compiled with TypeScript5.9.3; the real `getGovernedBroadSecurityMaster`/`resolveCompanyId` ran in isolated memory. Runtime master2250 company IDs; revision exact. No IPD implementation/test suite/DB/server was run. BSE-only AIIL runtime correction was read and applied by that provider; it changes no requested ISIN/NSE key. Provider adds governed AGI/UTIBANK symbol aliases, but none is used as a primary/fallback lookup in this assessment.

Matching is exact supplied ISIN then NSE listing eligibility, with distinct-canonical-company uniqueness; scrip names are never lookup keys. Mapping-store effective-dating and ambiguity/quarantine rules are applied. Because source dates lack timestamps, assessment convention is the entire portfolio day in Asia/Calcutta, start `2026-11-06T00:00:00+05:30`, end `2026-11-06T23:59:59.999+05:30`; not invented broker transaction/acquisition times. Resolved entity must remain effective and have an ACTIVE NSE listing. Multiple aliases/listings for the same company are not multiple issuers.

Governed identity is **not** proof of REAL-market origin, current NSE market availability, trade eligibility, account membership or authority to save holdings. The governed corpus is offline/bootstrap. Operational ownership checks were **NOT EVALUATED: no operational context/DB accessed**; this does not prevent reporting the master identity lookup, and does not authorize an import. No security is inferred delisted/nonexistent merely because absent from this corpus.

## 3. All68 row-level dispositions

Evidence directory: `evidence/integration/b04-dhan-isin-nse-2026-11-06/`. `assessment.json` contains all original nine source values per row, exchange, full master revision, exact-candidate counts, JSON pointers, matched identity/name, eligibility, old-row cross-reference and explanation. `new-quarantine.json` retains all67 new isolated in-memory P04 records.

**U:** supplied ISIN has **zero exact records among all2250**; therefore no ISIN+NSE candidate; actual resolver raised `UNMAPPED_IDENTIFIER`. Do not substitute a company name/NSE symbol, infer an issuer or correct the supplied ISIN. **R1:** one exact ISIN entity, ACTIVE NSE listings and effective throughout the portfolio date. Each row's individual lookup/quarantine evidence is in the JSON.

| Row | Scrip Name | ISIN Code | Exchange | Master result / security identifier / matched name | Revision | Resolution | Reason | Previous row / status |
|---|---|---|---|---|---|---|---|---|
| 1 | Himadri Speciality Chemical | `INE019C01026` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 28 / UNRESOLVED |
| 2 | Vishal Mega Mart | `INE01EA01019` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 65 / UNRESOLVED |
| 3 | Bank of Baroda | `INE028A01039` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 8 / UNRESOLVED |
| 4 | Jamna Auto Industries | `INE039C01032` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 36 / UNRESOLVED |
| 5 | Suzlon Energy | `INE040H01021` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 60 / UNRESOLVED |
| 6 | Fineotex Chemical | `INE045J01034` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 20 / UNRESOLVED |
| 7 | Vardhman Special Steels | `INE050M01012` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 64 / UNRESOLVED |
| 8 | Bharat Coking Coal | `INE05XR01022` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 9 / UNRESOLVED |
| 9 | ECOS Mobility & Hospitality | `INE06HJ01020` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 14 / UNRESOLVED |
| 10 | Siyaram Silk Mills | `INE076B01028` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 58 / UNRESOLVED |
| 11 | Gateway Distriparks | `INE079J01017` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 23 / UNRESOLVED |
| 12 | Paradeep Phosphates | `INE088F01024` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 47 / UNRESOLVED |
| 13 | Jai Balaji Industries | `INE091G01026` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 35 / UNRESOLVED |
| 14 | IDFC First Bank | `INE092T01019` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 29 / UNRESOLVED |
| 15 | Sigma Solve | `INE0A0S01028` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 57 / UNRESOLVED |
| 16 | Jio Platforms | `INE0BJO01010` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 37 / UNRESOLVED |
| 17 | Oswal Pumps | `INE0BYP01024` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 45 / UNRESOLVED |
| 18 | RateGain Travel | `INE0CLI01024` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 53 / UNRESOLVED |
| 19 | GMR Power & Urban Infra | `INE0CU601026` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 22 / UNRESOLVED |
| 20 | Blue Jet Healthcare | `INE0KBH01020` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 10 / UNRESOLVED |
| 21 | EPack Prefab Technologies | `INE0MLS01022` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 16 / UNRESOLVED |
| 22 | Kross | `INE0O6601022` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 40 / UNRESOLVED |
| 23 | EMS | `INE0OV601013` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 15 / UNRESOLVED |
| 24 | International Gemological Institute | `INE0Q9301021` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 33 / UNRESOLVED |
| 25 | Arkade Developers | `INE0QRL01017` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 5 / UNRESOLVED |
| 26 | Steelcast | `INE124E01038` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 59 / UNRESOLVED |
| 27 | KP Energy | `INE127T01021` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 39 / UNRESOLVED |
| 28 | KM Sugar Mills | `INE157H01023` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 38 / UNRESOLVED |
| 29 | Salasar Techno Engineering | `INE170V01027` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 54 / UNRESOLVED |
| 30 | Elecon Engineering Company | `INE205B01031` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 17 / UNRESOLVED |
| 31 | Canara Robeco Asset Management Company | `INE218I01013` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 11 / UNRESOLVED |
| 32 | Credo Brands Marketing (Mufti) | `INE220Q01020` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 12 / UNRESOLVED |
| 33 | Grauer & Weil | `INE266D01021` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 26 / UNRESOLVED |
| 34 | Vishnu Chemicals | `INE270I01022` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 66 / UNRESOLVED |
| 35 | Ajax Engineering | `INE274Y01021` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 3 / UNRESOLVED |
| 36 | DAM Capital Advisors | `INE284H01025` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 13 / UNRESOLVED |
| 37 | Waaree Renewable Technologies | `INE299N01021` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 67 / UNRESOLVED |
| 38 | Panama Petrochem | `INE305C01029` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 46 / UNRESOLVED |
| 39 | Premier Polyfilm | `INE309M01020` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 49 / UNRESOLVED |
| 40 | Precision Wires India | `INE372C01037` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 48 / UNRESOLVED |
| 41 | AGI Greenpac | `INE415A01038` | NSE | EQ_AGI_IN — AGI Greenpac Limited | R | RESOLVED | R1 | 1 / RESOLVED |
| 42 | Arihant Capital Markets | `INE420B01036` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 4 / UNRESOLVED |
| 43 | Ashoka Buildcon | `INE442H01029` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 7 / UNRESOLVED |
| 44 | IIFL Capital Services | `INE489L01022` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 30 / UNRESOLVED |
| 45 | ASK Automotive | `INE491J01022` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 2 / UNRESOLVED |
| 46 | Engineers India | `INE510A01028` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 19 / UNRESOLVED |
| 47 | Gujarat Pipavav Port | `INE517F01014` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 27 / UNRESOLVED |
| 48 | Rajoo Engineers | `INE535F01024` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 52 / UNRESOLVED |
| 49 | GHCL | `INE539A01019` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 21 / UNRESOLVED |
| 50 | Emami | `INE548C01032` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 18 / UNRESOLVED |
| 51 | Landmark Cars | `INE559R01029` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 41 / UNRESOLVED |
| 52 | Univastu | `INE562X01013` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 63 / UNRESOLVED |
| 53 | Arrow Greentech | `INE570D01018` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 6 / UNRESOLVED |
| 54 | International Conveyors | `INE575C01027` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 32 / UNRESOLVED |
| 55 | J Kumar Infraprojects | `INE576I01022` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 34 / UNRESOLVED |
| 56 | Radhika Jeweltech | `INE583V01021` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 51 / UNRESOLVED |
| 57 | Thyrocare Technologies | `INE594H01019` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 61 / UNRESOLVED |
| 58 | Sharda Motor | `INE597I01028` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 56 / UNRESOLVED |
| 59 | Titagarh Rail Systems | `INE615H01020` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 62 / UNRESOLVED |
| 60 | Geekay Wires | `INE669X01032` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 24 / UNRESOLVED |
| 61 | Indraprastha Medical Corporation | `INE681B01017` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 31 / UNRESOLVED |
| 62 | National Stock Exchange of India  | `INE721I01024` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 44 / UNRESOLVED |
| 63 | Websol Energy System | `INE855C01023` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 68 / UNRESOLVED |
| 64 | Pudumjee Paper Products | `INE865T01018` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 50 / UNRESOLVED |
| 65 | Matrimony.com | `INE866R01028` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 42 / UNRESOLVED |
| 66 | Monarch Networth Capital | `INE903D01011` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 43 / UNRESOLVED |
| 67 | Shakti Pumps | `INE908D01010` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 55 / UNRESOLVED |
| 68 | Genus Power Infrastructures | `INE955D01029` | NSE | 0 exact ISIN records; no candidate | R | UNRESOLVED | U | 25 / UNRESOLVED |

## 4. Reconciliation of every result with the prior68-row assessment

The prior dated Web UI summary used different quantities/values and lacked ISIN/exchange. It remains byte-preserved: `ws-a-dhan-68-row-pin-advance-2026-11-05/03-identity-assessment-68-row.json` (and its original evidence/quarantine artifacts). We match historical row labels by case-insensitive trim **only to cross-reference reports**, never to resolve a security. All68 labels map uniquely. Do not join by row number: source order changed. The table and JSON record every old row/status and retain every newly supplied value.

- **AGI Greenpac:** current source row41 ↔ historical row1. RESOLVED remains RESOLVED, same `EQ_AGI_IN` / `AGI Greenpac Limited`. Previously a governed name/symbol alias resolved without ISIN; now exact supplied `INE415A01038` confirms the same company, deposit pointer`/21`. One exact issuer and two ACTIVE NSE symbol/alias listings (`AGI`, `AGI GREENPAC`) are not issuer ambiguity. Its supplied quantity2/current1291.10 is a new dated observation, not an overwrite of historical quantity25/current15791.25.
- **Every other67 rows:** UNRESOLVED remains UNRESOLVED. The evidence reason changes: this is no longer “identifiers not supplied/not tested.” All67 valid user-supplied ISINs were explicitly queried and are absent in the current governed corpus. Each has its own zero-candidate count and actual new P04 quarantine record. No status changed; no old failure is represented as a newly failed operational import.
- Previous counts1 resolved/67 unresolved/0 ambiguous remain1/67/0. The source acquisition prerequisite is satisfied for this reassessment; governed coverage remains incomplete. B-04 assessment completion does not mean all68 identities resolved.

## 5. Quarantine preservation and execution boundaries

Prior134 quarantine outcomes/evidence are untouched and separately hash-registered. New67 records were generated by actual read-only ISIN lookups in a fresh isolated master sink and published additively; no prior sink was loaded/cleared/overwritten. New IDs/receivedAt are actual harness-generated assessment evidence, not production/broker event IDs or times. Do not replace134 history with67 or delete unresolved rows. All68 source holdings remain in output; none excluded or saved.

No IPD/master edits, no Wave-2 deposition/authorization request/initiation, no symbol/name fallback, no identifier manufacture, no portfolio-value substitutions, no account/owner transfer, no operational DB/provisioning/writes, no runtime/pin change, QE/qualification/admission or unrelated work. Existing full-import fail-closed/quarantine boundaries remain; no import/save operation was attempted here. R01/F2 and package integration are not reopened. Other workstream statuses unchanged.

## 6. Reproduction, validation and publication receipt

`reassess.mjs` documents the harness. Fetch the exact nine pinned blobs listed in `master-readbacks.json`, verify Git identities/SHA256 and deposition checksum; compile only `src/identity/governed_fixture_master.ts` and pure identity closure with TypeScript5.9.3 ES2022/NodeNext/strict to a separate temporary directory. Run `node reassess.mjs /absolute/compiled/governed_fixture_master.js /absolute/readback-root`. Quarantine IDs/receivedAt are new per run; canonical statuses/source/identities/revision/counts remain deterministic. Do not use cached installed package as a substitute for the recorded remote inspection.

Targeted source/arithmetic/ISIN/crosswalk/quarantine/preservation/scope tests and optional pinned-remote corpus verification are provided by `validate_b04.py`. Existing applicable IRR static/routing/classification checks also run; execution results in `validation.txt`. Publish only via green IRR PR. Final additive PR publication receipt records actual IRR head/merge/main CI and independent all-blob/source-count/revision/results readback after merge, not a fabricated future self-hash. Final result: **B-04 reassessment COMPLETE;1 resolved/67 unresolved/0 ambiguous; remaining reason is exact identifiers absent from governed corpus.** No further upload or expansion is initiated.
