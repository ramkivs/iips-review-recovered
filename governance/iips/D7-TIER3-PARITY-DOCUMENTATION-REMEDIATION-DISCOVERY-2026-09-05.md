# D7-TIER3-PARITY - DOCUMENTATION REMEDIATION DISCOVERY / DECISION PREPARATION (READ-ONLY)

- Date: 2026-09-05 (Asia/Calcutta)
- Artifact class: READ-ONLY discovery and decision preparation for the documentation-remediation gap established by the durably recorded P2 review (commit 81e1b51563c8f82e40e2464545cce7e30ba8fb3d). This gate performs NO remediation, authorizes nothing, mutates nothing, and certifies nothing.
- Status: PREPARED 2026-09-05 - NEW work. NOT YET DURABLY RECORDED (separate maintainer recording protocol; nothing staged/committed/pushed).
- Evidence classes: [ARENA] = verified read-only by Arena this gate (pinned blob reads, live measurements at the product baseline); no [ATTESTED] facts relied on; [DEVELOPMENT] not used.
- INDEPENDENCE DISCLOSURE (mandatory, Sec. 8 of the programme authority): No organizational, external, or third-party independence exists for this programme. This discovery is not independent verification. D15 model applies exactly: role separation + clean-workspace reproducibility. D7-TIER3-INDEPENDENCE unchanged (OPEN/negative).

## 1. Authority / baseline validation [ARENA]

- Governance tip verified == 81e1b51563c8f82e40e2464545cce7e30ba8fb3d; chain intact: a98a5da4 -> b4abf34d -> 367ffdbc -> fab88267 -> 751b243b -> 7fa0664f -> 81e1b515 (P2 review recording at tip).
- Three P2 review records byte-identical at tip (blobs 9f64841ed07b277a4fc2a71e1b907dd0be900bda / a55f04d4da1eb25eabdabe23f2e02b78e7046b03 / 69fe3bcc2c9ae7409d4c5c0792d40234e0a35588); recorded conclusions stand: REJECT - documentation parity NOT ESTABLISHED for all three engines.
- Product baseline == 830bd7218f6a77274e3d58eef09d706a3a99794f; all 57 engineering-set documents re-verified unchanged at pinned blobs this gate; product worktree clean; no remediation artifact exists in any D7-TIER3-PARITY namespace (the only governance-tree path matching "remediation" is the pre-existing, unrelated legacy file program-v1.1-certification/PROGRAM_v1.1_V2_REMEDIATION_BACKLOG.md, blob 5b7f54589421f86bdd5ec9e3e149673cf6065d3a, outside this programme); no P3 artifact exists.
- Zero mutation performed by this gate (both clones porcelain-clean throughout).

## 2. Remediation corpus inventory (57 documents; all [ARENA] at 830bd7218f6a77274e3d58eef09d706a3a99794f)

P2-measured current state of EVERY document: single shared title-stripped body template (SHA-256 prefix f610ee047a57; six D36 provenance/boundary statements; UTF-8 BOM; no engineering content - 0 numeric/table matches corpus-wide). P2 result for every document: R1 PASS, R6 PASS, R2-R5 UNVERIFIABLE, class check FAIL (0-of-N), rollup FAIL.

### IES-016 (ies-016-telecommunications/docs/)

| Document | Pinned blob | Bytes | Lines | A1 exemplar slot bytes | Frozen asset(s) the slot must represent |
| -------- | ----------- | ----- | ----- | ---------------------- | --------------------------------------- |
| IES-016_01_README.md | 817c1c37790390f883db08c72f73ba05dcad0695 | 797 | 13 | 1724 | see matrix row 01 |
| IES-016_02_EXECUTIVE_SUMMARY.md | e912fb1abb0dc2c3c27c64fcd53d15f86afbd9e7 | 808 | 13 | 1056 | see matrix row 02 |
| IES-016_03_INDUSTRY_MODEL.md | ea0848b455e2f77cbb94fbfdd3acd204cdf141bd | 805 | 13 | 1561 | see matrix row 03 |
| IES-016_04_BUSINESS_MODEL.md | 0fd252834459eee1308a22fbd4004b4ca357e749 | 805 | 13 | 1411 | see matrix row 04 |
| IES-016_05_METHODOLOGY_PRINCIPLES.md | 1e89c811efd416c3f272cac1aed967e36b733971 | 813 | 13 | 1351 | see matrix row 05 |
| IES-016_06_METRIC_LIBRARY.md | c650eb12795a1536e77262534388fe8e9a3490c4 | 805 | 13 | 2072 | see matrix row 06 |
| IES-016_07_SCORE_ENGINE.md | 7cc38e16f49757ac620e0bb8c96fd1e0e2eafbcd | 803 | 13 | 1143 | see matrix row 07 |
| IES-016_08_FORMULA_LIBRARY.md | 43e031042009633717f58379f9986ce180db88b1 | 806 | 13 | 1283 | see matrix row 08 |
| IES-016_09_CALIBRATION.md | f31cb2ba209ac92584af560a80a7f2d8bb3305bc | 802 | 13 | 1310 | see matrix row 09 |
| IES-016_10_DECISION_ENGINE.md | 86f8cdef744622cffe50d792e015a5d1b792253e | 806 | 13 | 1250 | see matrix row 10 |
| IES-016_11_EVIDENCE_FRAMEWORK.md | 0cff229cfd972fd6b2e4ff3da29d123a6052a63c | 809 | 13 | 1156 | see matrix row 11 |
| IES-016_12_VALIDATION.md | e1e18c2d2d0cd9cbd07b57ad5d1755ab366c61e4 | 801 | 13 | 958 | see matrix row 12 |
| IES-016_13_ARENA_IMPLEMENTATION_SPECIFICATION.md | bed2eb3c418811c07525c43e8acea1d2b55ff700 | 825 | 13 | 1341 | see matrix row 13 |
| IES-016_14_REFERENCE_ASSET_GOVERNANCE.md | 9c3d4add5709a7b8e2a832d09b30ddfef673777b | 817 | 13 | 966 | see matrix row 14 |
| IES-016_15_NORMATIVE_CALCULATION_APPENDIX.md | e0796155cf098e51496c4693deb9a063c28fae16 | 821 | 13 | 2867 | see matrix row 15 |
| IES-016_16_IMPLEMENTATION_READINESS_CERTIFICATE.md | 327e0d623a55ee80ac2378d640446b4951e5ff69 | 827 | 13 | 852 | see matrix row 16 |
| IES-016_17_MASTER_INDEX.md | 5f75bcc4b94f78b97c4f47b3f075d431cde76788 | 803 | 13 | 1333 | see matrix row 17 |
| IES-016_18_DATA_DICTIONARY.md | 2439ba3d90d34273125dd1e653cf725fb52dc5d9 | 806 | 13 | 1532 | see matrix row 18 |
| IES-016_19_REFERENCE_DATA_SOURCES.md | 3775cdbd62b33b1fdcac000cef2a879cdad327fb | 813 | 13 | 1046 | see matrix row 19 |

### IES-017 (ies-017-automobile/docs/)

| Document | Pinned blob | Bytes | Lines | A1 exemplar slot bytes | Frozen asset(s) the slot must represent |
| -------- | ----------- | ----- | ----- | ---------------------- | --------------------------------------- |
| IES-017_01_README.md | d6cb13c8398c342a2ca9167ea2d008b5070aff84 | 797 | 13 | 1724 | see matrix row 01 |
| IES-017_02_EXECUTIVE_SUMMARY.md | bc5d7f8ed5f39f40ac8a84ad7b0b931cfcfc26cb | 808 | 13 | 1056 | see matrix row 02 |
| IES-017_03_INDUSTRY_MODEL.md | 766ebe3e66b11b4e79d762400b1ebae92c32d444 | 805 | 13 | 1561 | see matrix row 03 |
| IES-017_04_BUSINESS_MODEL.md | 9c7340cf7cf10f3e378df32aa1ab62ff07822e76 | 805 | 13 | 1411 | see matrix row 04 |
| IES-017_05_METHODOLOGY_PRINCIPLES.md | 240e6f267e916906485cbf490d223a9a40250ff4 | 813 | 13 | 1351 | see matrix row 05 |
| IES-017_06_METRIC_LIBRARY.md | b5f9400d091d5a34509556833a0bc755f9ccbeff | 805 | 13 | 2072 | see matrix row 06 |
| IES-017_07_SCORE_ENGINE.md | 1c29965c794853f22fbbdd1964e62119f6054ac9 | 803 | 13 | 1143 | see matrix row 07 |
| IES-017_08_FORMULA_LIBRARY.md | a50418245950a6a7f5669aea552f9723a5b776ee | 806 | 13 | 1283 | see matrix row 08 |
| IES-017_09_CALIBRATION.md | b6804d6176c3b7569b1591f74e41a31e7ad0c407 | 802 | 13 | 1310 | see matrix row 09 |
| IES-017_10_DECISION_ENGINE.md | 050c15d23d467efb0d667e68e99cbe189b996022 | 806 | 13 | 1250 | see matrix row 10 |
| IES-017_11_EVIDENCE_FRAMEWORK.md | dc6efab58344dae3f5cb96e94345804c0ce72fe9 | 809 | 13 | 1156 | see matrix row 11 |
| IES-017_12_VALIDATION.md | 998b7a3747bd93ee98c023da8cc46b67db27eab7 | 801 | 13 | 958 | see matrix row 12 |
| IES-017_13_ARENA_IMPLEMENTATION_SPECIFICATION.md | fdd9c63503655fd25a6520a38bee65ae75d8dbae | 825 | 13 | 1341 | see matrix row 13 |
| IES-017_14_REFERENCE_ASSET_GOVERNANCE.md | 9a16525f2168dd2469e1c443d9c3f567d1c2875f | 817 | 13 | 966 | see matrix row 14 |
| IES-017_15_NORMATIVE_CALCULATION_APPENDIX.md | 2a2e27ea8dbefa008e551cea56b2bf3344f4e424 | 821 | 13 | 2867 | see matrix row 15 |
| IES-017_16_IMPLEMENTATION_READINESS_CERTIFICATE.md | 4ece989d35b2a05ee476bbb61998417e6d31039b | 827 | 13 | 852 | see matrix row 16 |
| IES-017_17_MASTER_INDEX.md | b1745214436d0f9fcac0e18ef4135be43f6d9a6d | 803 | 13 | 1333 | see matrix row 17 |
| IES-017_18_DATA_DICTIONARY.md | 8e4af0a3bc3dee494a4f72c5cde2134d2d2dda2d | 806 | 13 | 1532 | see matrix row 18 |
| IES-017_19_REFERENCE_DATA_SOURCES.md | 6cc264582a41cae27bfab9ed2c134618bd7a2f0f | 813 | 13 | 1046 | see matrix row 19 |

### IES-020 (ies-020-materials-metals/docs/)

| Document | Pinned blob | Bytes | Lines | A1 exemplar slot bytes | Frozen asset(s) the slot must represent |
| -------- | ----------- | ----- | ----- | ---------------------- | --------------------------------------- |
| IES-020_01_README.md | 49cd3b0a0ae27428ac7b35c1ec8ff79040ece970 | 817 | 13 | 1724 | see matrix row 01 |
| IES-020_02_EXECUTIVE_SUMMARY.md | e76323097dbe1c91139eaff1b4e0efdad7961f7d | 828 | 13 | 1056 | see matrix row 02 |
| IES-020_03_INDUSTRY_MODEL.md | 34361109bb3f33f9400092ac547a48850fcb2ab5 | 825 | 13 | 1561 | see matrix row 03 |
| IES-020_04_BUSINESS_MODEL.md | 32c8a34291babc27127953f1743fcdee53479ab0 | 825 | 13 | 1411 | see matrix row 04 |
| IES-020_05_METHODOLOGY_PRINCIPLES.md | 3bf2a5c446d3ffc0e8205087d7da279b3ab292a1 | 833 | 13 | 1351 | see matrix row 05 |
| IES-020_06_METRIC_LIBRARY.md | ebd0030b126e3f001dab2ef4d3790a2594ccde19 | 825 | 13 | 2072 | see matrix row 06 |
| IES-020_07_SCORE_ENGINE.md | 4db02b350364b84f513a99bf6095d99bbec02d1a | 823 | 13 | 1143 | see matrix row 07 |
| IES-020_08_FORMULA_LIBRARY.md | 71e0c9409e470a93c04a43424a413bcfa16cb939 | 826 | 13 | 1283 | see matrix row 08 |
| IES-020_09_CALIBRATION.md | cf5f529ffaaf2d7ba60b8c4359499d4fc503350b | 822 | 13 | 1310 | see matrix row 09 |
| IES-020_10_DECISION_ENGINE.md | 46a3805eb4d0c2ad2ad41f6748e899d9e2aa336b | 826 | 13 | 1250 | see matrix row 10 |
| IES-020_11_EVIDENCE_FRAMEWORK.md | 25df5e3d3ea595575ed313eb4b53529bf93bbe41 | 829 | 13 | 1156 | see matrix row 11 |
| IES-020_12_VALIDATION.md | 6c9d5b17fdaad39d614aa2497f4feffcf0c2d511 | 821 | 13 | 958 | see matrix row 12 |
| IES-020_13_ARENA_IMPLEMENTATION_SPECIFICATION.md | 42a88909a88280fde1e6752da01d49d8ae83f9c1 | 845 | 13 | 1341 | see matrix row 13 |
| IES-020_14_REFERENCE_ASSET_GOVERNANCE.md | 1f73bd9ad54df9e17567879e3cc18fc8cc23f011 | 837 | 13 | 966 | see matrix row 14 |
| IES-020_15_NORMATIVE_CALCULATION_APPENDIX.md | 693aad8b3eb1020883c80ceea712a29ccabbfcac | 841 | 13 | 2867 | see matrix row 15 |
| IES-020_16_IMPLEMENTATION_READINESS_CERTIFICATE.md | 828082dfd7f20d5c9dc0bd7fcad5f09186213e2e | 847 | 13 | 852 | see matrix row 16 |
| IES-020_17_MASTER_INDEX.md | e016bbfbddbc4788610c5a9c4032690000b98e65 | 823 | 13 | 1333 | see matrix row 17 |
| IES-020_18_DATA_DICTIONARY.md | 17ee212d8c75197ce0bd0af48420e4b85974b7c5 | 826 | 13 | 1532 | see matrix row 18 |
| IES-020_19_REFERENCE_DATA_SOURCES.md | 56292001c3590588ee9ca21d93565c40bb0ad885 | 833 | 13 | 1046 | see matrix row 19 |

## 3. Measured current-state finding (unchanged from P2; re-confirmed)

- 57/57 documents are the same provenance template (measured); zero substantive engineering content corpus-wide; the A1 exemplar (IES-010) carries substantive content in every slot (set total 26,212 bytes; e.g. D09 calibration weight tables, D10 verdict bands + override triggers/effects, D15 worked calculations). Documentation parity NOT ESTABLISHED. Substantive engine documentation DOES exist in the in-engine frozen assets (discovery packs 19564/13841/11376 bytes with 29/24/21 headings; acceptance matrices with 16 gate rows each; in-engine readiness certificates with 13/13 tables at 2051, 2033, 2071 bytes; the frozen JSON chains) - the gap is precisely the 19-slot engineering-set content.

## 4. Source-of-truth mapping (live-measured; nothing invented)

Per engine, the authoritative in-scope sources available for remediation authoring, all pinned at 830bd7218f6a77274e3d58eef09d706a3a99794f:
- IES-016: discovery pack blob 68aae104dd3a0ccad8122d5770bd8d2c61637ba6 (19564 B, 29 headings); frozen calibration 178160fcbe0a30975c6796ac22c73a9bd03ab91a (262 leaf values; golden reference f0dfc647b8e0220d04a241902a82899e3a667393 (220 leaves); expected outputs 0d45ffc44df6d61a6f95dac15a12cb6f88be3155 (180 leaves, 13 cases); replay dataset ed6bbeb8b127f45ac8c8d99f9baee8c42bd60001; validation fixtures 25accdd952a6f774968e51b3a18eb6f4aa1dbf05; ontology metadata 31383863e126a6688bd95249522e654c933ec6f1; freeze manifest 70018bdb38849d50af7258f62d0341ac2bf64f1a (12-key pinmap); readiness certificate d764f276d980b6843e1b68939803299181bd3a47; acceptance matrix 0a45484582300d106c104e093a176d9ba52f6aec (16 gates); pinned generator c69ce2eb5d989f63a0618406b103dc398ebc4948.
- IES-017: discovery pack blob e0ad759f4be4231b18959ae6f22aaa3ec6e2ab0b (13841 B, 24 headings); frozen calibration e3f84ede6f5e89580aa451a689c0b5689cf8674e (262 leaf values; golden reference 11dcd3953046c4e27f80a8ffc71c2c7ef59ede47 (222 leaves); expected outputs b9982d744d92d592714dcc5b1e8599bed63752f2 (182 leaves, 13 cases); replay dataset f4d599631ee27b48aa808472f5cd9cbb0b108cff; validation fixtures fa9bb6df3560bd2449486d5ac9dbc889ff7ac56d; ontology metadata c0cbe1659642ff6bcc2e767e06d24be081c4cd7f; freeze manifest a7d1190edbd8bf0bfc5b852da466c5e03b6f2cd3 (12-key pinmap); readiness certificate a1f8ee7f9a7e7bdb572041f9cbbe0357a87bc77f; acceptance matrix 8707125b545d36541e1199e3f35d425fdda3613d (16 gates); pinned generator ec599ce1aafb26fe645f238e1f953521e60795f8.
- IES-020: discovery pack blob 7677ec47a335d0157411830a80aba29912dc97b5 (11376 B, 21 headings); frozen calibration ceea1d5fe7c9e4c56f76f6d34efcbbfef311cccf (262 leaf values; golden reference 1b601093cb09d607a7725bfed6b7cc4689c3f1e0 (222 leaves); expected outputs 3e67cb6f01fdc7a2459d6f4376e54cfa4b89cf2e (182 leaves, 13 cases); replay dataset 62ace6612c289a38ac6bb75ee5795c56be7650f5; validation fixtures 000412669a40a7b36e6bdd85bcbb9196dd5ab2e4; ontology metadata 8ea6b53c08aad0c3cbb7fb04020d3f8b8903ab25; freeze manifest 0d43a538734c9c13645778b0eadfbd978730f637 (12-key pinmap); readiness certificate 7533e1d69dfd32b1f2781680e885e536a714f180; acceptance matrix 12a04073ff0334bb3fe7ca6c1c0b8325da79059c (16 gates); pinned generator 2552b6590b75a5bbbc3d5893e07fb27468991e48.
- Shared governance/standard sources: DEC-D25 blob cbab4da9ce922aacf45e513954d6e325bb037810 (evidentiary standard; recorded ACCEPT of D16 v1.0 / D17 v1.0 / D20 v1.0); DEC-D15 blob 8cc089df6ae680706921dd5ecb57b75776ad4580 (verification methodology); DEC-D14 blob 84e276ad4246f1618731b135884005d937e5820e (parity invariant); DEC-D36 blob 747178d0adb86699d39486f261ac273bbf8f527e (documentation-parity authority, CLOSED at exactly 63 files).
- Q5-relevant platform ontology sources that EXIST [ARENA]: iips-cross-sector/UNIVERSAL_INVESTMENT_ONTOLOGY.md (blob 72ee4d3d552bc1ca6007a7d79c92cac6721b226e, 3,037 B); iips-cross-sector/architecture-review/ONTOLOGY_CONSISTENCY_MATRIX.md (blob a01d7f84ea3be4397b3b940f3dc8ce42de4be5d5, 5,862 B); iips-platform/src/sector-engines/cross-sector/ontology/OntologyMapper.ts (blob ea0f6acfe0ca9e8fbeb04392a2861881cadaa937); and the A1 exemplar of a registration review: ies-010-hospitality/HOSPITALITY_ONTOLOGY_REGISTRATION_REVIEW.md (blob 8d755d3d970ab0db5c115833847b018aabcf4df3, 2,332 B: registration coverage / engine-declared metadata / CSIP compatibility proof / result / status).

SOURCE-LABELLING TENSION DISCOVERED (recorded, not resolved): the IES-016 discovery pack self-labels key sections as pending authority ("Calibration contract (frozen, immutable - PROPOSED; NOT authoritative until maintainer approval)", Sec. 4; "Data authority ... PENDING maintainer acceptance", Sec. 8; "PROPOSED (AWAITING MAINTAINER ACCEPTANCE)" markers; Sec. 13 lists maintainer acceptance as follow-up 1), while the IES-017/020 packs carry terminal status lines "METHODOLOGY ACCEPTED (M1-M15 + G1-G6, recorded 2026-08-20)". Governance DEC-D25 (read first-hand in P1) records ACCEPT for ALL THREE methodologies (D16 v1.0 / D17 v1.0 / D20 v1.0) as FRESH forward-looking acceptances, and the freeze manifests froze the chains on 2026-08-29. The 017 pack also carries an internal tension (Sec. 13 item 1 says M1-M15 "all PENDING in D17_AUTHORITY_REVIEW.md" while its own terminal status line records acceptance). Any remediation authoring must cite DEC-D25 as the acceptance authority and must NOT rely on, or silently update, the packs' stale self-labels. The 020 pack separately lists five genuinely open authority questions (Sec. 28): aluminium placement; cashCostCurve percentile vs absolute unit cost; reserveLife commodity-weighting; confidence G-decision; royalty/streaming archetype legitimacy (note: D25-era evidence records royalty admitted at risk 0.8 and used in the golden reference; streaming absent - a partial, recorded disposition, not a blanket resolution).

## 5. Nineteen-slot remediation matrix

Columns: Slot | Class | Engines | Current state | Required substantive content | Authoritative source(s) | A1 exemplar evidence | Engine-specific content | Dependencies | Re-review requirement. All rows: Current state = template-only, P2 FAIL. Exemplar evidence column states what IES-010 substantively carries (form AND content demonstrated; exemplar demonstrates the A1-standard form - it is evidence of the standard, not itself authoritative methodology for Tier-3 engines).

| Slot | Class | Engines | Current | Required substantive content | Authoritative source(s) [pinned] | A1 exemplar (IES-010) | Engine-specific content | Dependencies | Re-review |
| --- | ---- | ------- | ------- | ---------------------------- | ------------------------------ | --------------------- | ---------------------- | ------------ | --------- |
| 01 | Governance/index | 016/017/020 | template-only; P2 FAIL | README describing the actual 19-document set, engine identity, doc map, D36 provenance | the 19-doc set itself (pinned inventory); D14 84e276ad4246f1618731b135884005d937e5820e | README (1,724 B) indexes the set with document map | engine identity + directory naming (display Telecommunications/Automobile/Materials & Metals vs dir names) | none | full R1-R6+class |
| 02 | Overview | 016/017/020 | template-only; P2 FAIL | executive summary consistent with frozen outputs: anchor cases, verdict distribution, program status, A2 labelling | expected outputs (13 cases) 0d45ffc4...; D25 cbab4da9ce922aacf45e513954d6e325bb037810 | exec summary (1,056 B) summarizes the engine | anchor composites 77.8/71.3/82.5 case-1 values per engine | none | full |
| 03 | Domain model | 016/017/020 | template-only; P2 FAIL | subsegment + archetype taxonomy exactly matching golden-derived values | discovery pack taxonomy sections; golden reference f0dfc647... | industry model (1,561 B) defines taxonomy | subsegments: cable-mso; converged-telco; fixed-broadband; tower-infra; wireless-mno / commercial-vehicles; ev-native; mass-market-oem; premium-oem; tier-1-supplier / base-metals; diversified-miners; precious-metals; specialty-materials; steel-producers; archetypes: consumer; converged; enterprise; infrastructure; wholesale / commercial; component-supplier; ev-pure-play; full-line; luxury / integrated; processor; pure-play; recycling; royalty | none (values frozen) | full |
| 04 | Domain model | 016/017/020 | template-only; P2 FAIL | business-model dimensions/drivers mapped to the 6-pillar structure and golden inputs | pack Sec. 1/3 (016), M-marker sections (017/020); golden reference | business model (1,411 B) | per-engine pillar drivers as encoded in golden inputs | none | full |
| 05 | Methodology | 016/017/020 | template-only; P2 FAIL | methodology principles as ACCEPTED (cite D25), incl. scoring/normalization/missing-data principles | pack normative contract (016 Sec. 3 D16 v1.0; 017/020 M1-M15) + D25 cbab4da9ce922aacf45e513954d6e325bb037810 | methodology principles (1,351 B) | engine methodology identity: D16/D17/D20 v1.0 | SOURCE RECONCILIATION: cite D25 acceptance over stale pack PROPOSED/PENDING self-labels (016 Sec.4/8/13; 017 Sec.13-vs-terminal) | full |
| 06 | Quantitative core | 016/017/020 | template-only; P2 FAIL | metric library: every input metric, meaning, units, range, missing-data rule, exactly as consumed | pack metric taxonomy (016 Sec. 3.1 TC-001..TC-012; 017 M1-M3; 020 M1-M3); golden input fields; generator c69ce2eb... | metric library (2,072 B) defines metrics | per-engine metric taxonomies (TC-xxx vs M-marker families) | none | full |
| 07 | Engine logic | 016/017/020 | template-only; P2 FAIL | score-engine flow: inputs -> band scoring -> effective band-table resolution -> pillars -> composite, as implemented | pack Sec. 3.5-3.7 (016) / M6-M11; generator source (pinned per engine) | score engine (1,143 B) specifies flow | calibration version 1.0.0 chain per engine | none | full |
| 08 | Quantitative core | 016/017/020 | template-only; P2 FAIL | formula library: resolution, band, pillar-weight, composite and rounding formulas exactly as computed | pack formula sections + generator (both pinned) | formula library (1,283 B) states formulas | per-engine weight vectors/thresholds from calibration | none | full |
| 09 | Calibration | 016/017/020 | template-only; P2 FAIL | calibration document matching the frozen calibration field-for-field (all 262 leaves: segment weight vectors, bandScores, calibratedBandTables, verdictMapping, archetypeRisk, profile) | frozen calibration JSON per engine 178160fc...; D25 "matches pack field-for-field" record | calibration (1,310 B) carries weight tables + risk thresholds | engine-specific 262-leaf values; contractVersion per engine | SOURCE RECONCILIATION (016): pack Sec. 4 PROPOSED label vs D25 acceptance + FROZEN manifest 2026-08-29 - cite D25+freeze | full |
| 10 | Engine logic | 016/017/020 | template-only; P2 FAIL | decision engine: verdict bands + all override types with triggers, effects, precedence (min-rank), matching frozen outputs across 13 cases | pack Sec. 3.8/3.9; calibration verdictMapping; expected outputs; P1 Q4 precedence findings | decision engine (1,250 B) carries verdict table + override table | override vocabularies: 016: competition-pressure, governance, leverage-breach, margin-compression; 017: competition-pressure, demand-collapse, governance, leverage-breach, margin-compression, recall-risk; 020: competition-pressure, governance, leverage-breach, margin-compression, strike-disruption, tailings-failure; verdict vocab (6 values) common | none | full |
| 11 | Evidence/validation | 016/017/020 | template-only; P2 FAIL | evidence/confidence framework per D15 + engine confidence treatment | pack Sec. 5/6 (016), Sec. 6 (017), Sec. 16 (020 G-decision cross-ref); D15 8cc089df6ae680706921dd5ecb57b75776ad4580 | evidence framework (1,156 B) | 017 confidence Option-A analog recorded; 020 G-decision cross-ref to D20 review | 020 confidence G-decision content: REQUIRES AUTHORITY DECISION if stated as settled (pack Sec. 28 Q4 open) | full |
| 12 | Evidence/validation | 016/017/020 | template-only; P2 FAIL | validation document matching the frozen validation structure: 13 cases, basis names, fixtures, replay reproduction as recorded claims | pack Sec. 7; expected 0d45ffc4...; replay ed6bbeb8...; fixtures 25accdd9... | validation (958 B) | basis names telecommunications-golden-reference-1.0.0 / automobile-golden-reference-1.0.0 / materials-metals-golden-reference-1.0.0 | stored replay reproduced/byteIdentical claims must be labelled claims (P1 rule) | full |
| 13 | Implementation/ontology | 016/017/020 | template-only; P2 FAIL | implementation specification consistent with ontology metadata + CSIP zero-modification registration; integration contract labelled proposal-until-implementation-authorization | ontology metadata 31383863...; pack Sec. 6 (016)/Sec. 23 (020)/integration sections; platform ontology sources (universal ontology 72ee4d3d, consistency matrix a01d7f84, OntologyMapper.ts); IES-010 registration-review exemplar 8d755d3d | implementation spec (1,341 B) | engine ontology mappings per engine metadata | Q5 content-level compatibility is NOT established by authoring: dimension-level analysis vs platform ontology is a SEPARATE evidence work item (sources exist, listed in Sec. 4); integration materialization remains unauthorized (packs state so) | full |
| 14 | Asset governance | 016/017/020 | template-only; P2 FAIL | asset inventory matching the FROZEN manifest 12-key pinmap incl. hashNormalization conventions; D36 provenance classes | freeze manifest 70018bdb...; D36 747178d0adb86699d39486f261ac273bbf8f527e | reference asset governance (966 B) | 12-key pinmaps per engine (same key structure, engine-specific hashes) | none | full |
| 15 | Quantitative core | 016/017/020 | template-only; P2 FAIL | normative worked calculations reproducible from the frozen chain (resolution -> bands -> pillars -> composite -> verdict) incl. at least the anchor case | golden + calibration + expected (all pinned); generator | normative appendix (2,867 B) works calculations | anchor cases TC-001 77.8 Buy / AB-001 71.3 Buy / MM-001 82.5 Strong Buy | none | full |
| 16 | Readiness | 016/017/020 | template-only; P2 FAIL | readiness content carrying the frozen 13/13 reproduced table with D25 labelling; NOT maintainer-issued certification | in-engine readiness certificate d764f276...; D25; P1 Q8 findings | readiness certificate (852 B) | per-engine 13/13 tables (2,051/2,033/2,071 B in-engine assets) | labelling constraint (no Issuer/Issued/Status fields) | full |
| 17 | Governance/index | 016/017/020 | template-only; P2 FAIL | master index listing exactly the 19 documents with correct names/order and resolving references | the 19-doc set (pinned inventory) | master index (1,333 B) | engine-prefixed names | none | full |
| 18 | Data | 016/017/020 | template-only; P2 FAIL | data dictionary matching actual JSON field inventories (names, types, enums) of golden/expected/replay | golden 220/222/222 and expected 180/182/182 leaves per engine (pinned) | data dictionary (1,532 B) | field inventories differ per engine (220/222/222 golden; 180/182/182 expected) | none | full |
| 19 | Data | 016/017/020 | template-only; P2 FAIL | reference data sources register, consistent with pack data-authority statements; no fabricated citations | pack Sec. 8 (016/017) / Sec. 27 (020); discovery packs (pinned) | reference data sources (1,046 B) | per-engine source registers | SOURCE RECONCILIATION (016): Sec. 8 "PENDING maintainer acceptance" label - cite D25/freeze; synthetic-fixture provenance must be labelled (pack states synthetic IES-015 convention) | full |

Row classification (authoring prerequisite): content authoring only = slots 01, 02, 03, 04, 06, 07, 08, 10, 12, 14, 15, 16, 17, 18 (14 slots; all values frozen and pinned). Source reconciliation first (narrow, citation-level: cite D25 acceptance + FROZEN manifest over stale pack self-labels; no source edit needed or proposed) = slots 05, 09, 19 (and the 016 pack Sec. 13 item 2 historical GATE0 note if referenced). Methodology authority first = NOT REQUIRED for any slot (methodologies already ACCEPTed under D25; W9 unchanged). Another governance decision first (content domains that may not be stated as settled) = slot 11 (020 confidence G-decision, pack Sec. 28 Q4) and slot 13 (Q5 dimension-level analysis as a separate work item; integration materialization). Unresolved authority dependency = 020 pack Sec. 28 Q1-Q5 (aluminium placement, cashCostCurve form, reserveLife weighting, G-decision, royalty/streaming) - remediation may document these as RECORDED-OPEN with their recorded partial dispositions, but must not resolve them.

## 6. Engine-by-engine differences (do not normalize)

- Structure: the three remediations are STRUCTURALLY IDENTICAL (same 19 slots, same frozen-chain shapes: calibration 262 leaves with identical top-level key sets; 6-value verdict vocabulary; 5 subsegments; 5 archetypes; 13 cases) but require ENGINE-SPECIFIC VALUES throughout (measured): subsegments cable-mso, converged-telco, fixed-broadband, tower-infra, wireless-mno/commercial-vehicles, ev-native, mass-market-oem, premium-oem, tier-1-supplier/base-metals, diversified-miners, precious-metals, specialty-materials, steel-producers likewise distinct archetypes and override vocabularies (016 four override types; 017 six incl. recall-risk + demand-collapse; 020 six incl. tailings-failure + strike-disruption); golden/expected leaf counts 220/180 (016) vs 222/182 (017/020).
- Source depth differs: discovery packs 19,564 B / 29 headings (016, D16-section cross-referenced normative contract), 13,841 B / 24 headings (017, M1-M15 markers), 11,376 B / 21 headings (020, M-markers + five open authority questions + D20 Part D cross-refs). Metric taxonomy families differ (TC-001..TC-012 vs M1-M3 families). 016 uniquely carries the historical GATE0-vs-Amendment note and PENDING self-labels; 020 uniquely carries open Q1-Q5 and the royalty/streaming partial disposition. One generic document per slot is NOT acceptable: each engine requires its own values, taxonomy, and pack cross-references.

## 7. Required substantive content (consolidated)

- Per the matrix: 14 slots are pure content authoring from pinned frozen values; 3 slots (05/09/19) additionally require the D25-acceptance citation convention; slot 13 additionally requires the ontology-registration content plus explicit open-items labelling; slot 11 (020) must carry the G-decision as recorded-open unless separately decided. All 57 remediated documents must preserve D36 provenance semantics (they would be MODIFIED D36-NEW-EVIDENCE files: dated, provenance-explicit, never represented as recovered historical material) and the Sec. 8 disclosure requirement applies to every remediation artifact.

## 8. Dependencies and risks (classified)

- BLOCKING (authority-class, applies to ALL remediation): D36 product-mutation authority is CLOSED at exactly 63 files; editing the 57 documents is product mutation on phase13-next. No currently recorded authority permits it. A new, explicit product-mutation + authoring authority is required before ANY editing. (Technical blockers: none - all content sources are pinned and available.)
- REQUIRES AUTHORITY DECISION (content-level, localized): 020 pack Sec. 28 Q1-Q5 as listed; integration-contract materialization (all engines, pack-stated); any change to frozen methodology (none required by this discovery; W9 would govern).
- SOURCE RECONCILIATION (non-blocking, citation-level): pack self-label vs D25 acceptance tensions (Sec. 4). Resolved in authoring by citing D25 + freeze manifests; NO pack edits proposed (packs are frozen assets; editing them would itself require authority and is NOT recommended).
- REQUIRES ADDITIONAL EVIDENCE: Q5 dimension-level ontology compatibility analysis (sources exist - universal ontology, consistency matrix, OntologyMapper.ts, exemplar form - but the analysis itself is unperformed work, distinct from document authoring; would NOT be resolved by authoring alone). DF-1 mechanical closure (needs bundle recomputed*Sha256 values supplied by the maintainer; non-blocking for authoring). Manifest corroboration rows (quoting them is optional, non-blocking).
- NON-BLOCKING: E2E-018 (live-UI parity matrix - separate programme; this discovery changes nothing and authorizes nothing there); D36 stub files (untouched; the 19-doc remediation does not touch ARCHITECTURE_REVIEW stubs); frozen assets (all remain read-only).

## 9. Authority gaps (explicitly separated; NOT granted here)

1. Authority to AUTHOR substantive documentation (the 57 files): NOT granted. Requires a new decision covering authoring + product mutation (D36 closed), under W1-W9 (NEW work, provenance, no count-based parity claims, evidence-class labelling, Sec. 8 disclosure), with the carry-forward rules of Sec. 7 of the P2 authority (no inferential resolution of open items).
2. Authority to CHANGE FROZEN METHODOLOGY: NOT required by this discovery (sources suffice for all 19 slots); NOT granted; any future need is a separate D7-3-constrained Class-A-wide decision (W9).
3. Authority to CHANGE source-of-truth engineering assets (packs, calibration, chains): NOT required and NOT recommended (citation convention suffices); NOT granted; would be product mutation requiring separate authority.
4. Authority to RE-REVIEW the remediated corpus: NOT granted. A separate P2-analogue scope/execution authority + maintainer execution gate + recording would be required (same pattern as P1/P2).
5. Authority to CERTIFY PARITY: NOT granted; NEVER implied by remediation or re-review completion; remains a separate determination gate against the unchanged A1 standard. D7-TIER3-PARITY stays NOT SATISFIED until then.

## 10. Remediation options (decision-ready)

- OPTION A - Author substantive documentation from existing frozen sources: VIABLE AND EVIDENCE-SUPPORTED for the core corpus. Grounds: every slot's required content is derivable from pinned, frozen, measured sources (Sec. 4/5); 14/19 slots are pure authoring; the remaining tensions are citation-level (05/09/19) or localized open items that can be carried as RECORDED-OPEN (020 Sec. 28; slot 13 integration/Q5 labelling) without resolving them. No methodology change needed. Preconditions that must be part of any Option-A authority: explicit product-mutation grant for exactly the 57 files (or a chosen subset, per-engine phased), D25-citation convention, open-items carried open, provenance as modified D36-NEW-EVIDENCE, Sec. 8 disclosure per artifact, and a separately authorized re-review + recording before any parity effect.
- OPTION B - Resolve source/methodology gaps FIRST: NOT REQUIRED as a blanket precondition (discovery found no missing source for the 19 slots' core content). A NARROW B applies inside Option A to: the 020 Sec. 28 Q1-Q5 decisions (if the maintainer wants them settled rather than carried open), the Q5 dimension-level analysis work item, and DF-1 mechanical closure (supply bundle SHA values). These are separable decisions and should not delay authoring of the uncontested 14+ slots.
- OPTION C - Do not remediate yet: AVAILABLE. Consequence (grounded): the durably recorded P2 REJECT stands; Decision C's documentation half remains unsatisfied; the A1 pathway stays blocked. Nothing in the record decays by waiting, and no authority text imposes a deadline.
- RECOMMENDATION (evidence-grounded, decision for the maintainer): if the intent is to progress toward parity, Option A scoped per-engine with the preconditions above, plus the narrow B items tracked separately (Q5 analysis; DF-1 closure values; 020 open questions either decided or carried open). This recommendation grants nothing and is not execution authorization.

## 11. Q5 / DF-1 / manifest treatment (unchanged by this discovery)

- Q5 ontology compatibility: REMAINS UNVERIFIABLE at content level. Discovery ADDS the finding that platform-side ontology sources exist (Sec. 4), making a future dimension-level analysis executable - but existence of sources is not analysis; no resolution is claimed or inferred.
- DF-1: REMAINS byteIdentical=false / caseDiffs=0 with the documented convention (Windows Python text-mode CRLF write vs committed LF serialization) and residual: newline-only-ness NOT cryptographically proven; mechanically closable from bundle recomputedExpectedSha256/recomputedReplaySha256 values; no recomputation performed in this gate; no claim made.
- Manifest qualification: REMAINS as recorded (primary 33/33 attested; corroboration rows present but not quoted in the Windows attestation); discovery neither quotes nor upgrades them.

## 12. Recommended next authority decision

A single maintainer decision is suggested: choose Option A (with preconditions), B-narrow, or C. If A: issue (i) a documentation-remediation authoring + product-mutation authority artifact (exactly which of the 57 files, per-engine phasing, D25-citation convention, open-items-carried-open rule, provenance/disclosure requirements), then (ii) execution, then (iii) a separately authorized re-review and durable recording, then (iv) any parity determination remains a further separate gate. This section PREPARES that decision; it does not make it.

## 13. Explicit non-authorizations

- This gate does NOT authorize or perform: editing any of the 57 documents; creating replacement documentation; changing product code, frozen methodology, D14/D25/D15 or any frozen asset; changing E2E-018; modifying D36 stubs; certification; parity satisfaction; P3; promotion or release; resolution of open items by inference. Exclusions are not implicit permissions.

## 14. Provenance, integrity, and mutation statement

- All measurements first-hand [ARENA] at 830bd7218f6a77274e3d58eef09d706a3a99794f (pinned blob reads; byte/line counts; heading censuses; leaf counts; template-hash re-confirmation). Zero mutation: governance tip 81e1b51563c8f82e40e2464545cce7e30ba8fb3d unchanged, nothing staged/committed/pushed, product worktree clean, 57 documents byte-unchanged, no P3/certification/promotion artifact created. D7-TIER3-PARITY REMAINS NOT SATISFIED. This artifact is decision preparation only; recording requires the separate maintainer protocol.

