# L-039 — KEC consolidated current investments: delta investigation, OPEN

## 1. Baseline, governing record and cutoff (`V2211`)

**IRR only**, branch `arena/3c6fd35e-iips-review-recovered`. Fetched authoritative remote main and clean HEAD
were both **ed839d116d1d7363431e7d771e2f90dcbb9b330c** (PR #593 merge); no subsequent main commit was returned
at start. L-038's separate delta is complete and remains OPEN; none of it is reopened or edited here.

Read together, not by whichever summary is shortest:

- Limitation register **§17.25 including its fact-level follow-up**, tracker **§16.283 including follow-up**.
  The failed original probe is superseded by retained, hash-matched context verification, not still a blocker.
- WI12-L039 bundle: determination, primary source gzip files, context/precision/comparison reports and tests.
- Original WI8-INDUSTRIALS-KEC and WI8-L039-CASH-SIDE bundles: the **421-page** FY25/FY26 search, FY26 PDF
  p117 balance sheet, p129 Note 10, pp131–132 Notes 17–19, p145 Note 54, original and L-040-corrected artifacts.
- W07 §§4–6, its ingestion corrections D1–D5, and the **16 November reconciliation**: PR #568 body/merge
  `064195397dfdb32bf0f34a461b02fd6b9f9f9a8df0` and PR #563's supersession comment (actual full merge hash
  recorded in baseline-and-provenance.json). #563's seven commits reached main through #568, not a separate
  acceptance of an economic zero. W07 itself was documented **12 November**; reconciliation was published
  **16 November**. Neither date is an exhaustive external-filing cutoff. Later S4-R3 KEC refresh inputs are
  included in read-only replay; no later qualifying amount/nil decision was found in the governing record.

Session date is **2026-11-17**. Evidence runners report **2026-11-18**; exact observed timestamps are retained,
not silently backdated. WI12's nominal Nov5 / runner Nov8 discrepancy also remains. The delta is new inspection
since those records, not a claim all evidence worldwide was exhausted by a precise as-of instant.

## 2. Reused facts and append-only corrections (`V2212`)

March audited consolidated XML remains byte-identical: **77,918 bytes**, SHA-256
`133f0cf14a5bbdecf055affc046e5aa73097f8d9793bf423942933b037f19d21`; retained original gzip SHA
`a7defc017d0d0f50d42e4fd940625be4c7141b9f26fefcf0f64b7adc554301ee`. Sole CurrentInvestments fact:

```xml
<in-capmkt:CurrentInvestments contextRef="OneI" decimals="-7" unitRef="INR">0</in-capmkt:CurrentInvestments>
```

Namespace `http://www.sebi.gov.in/xbrl/2026-01-31/in-capmkt`. OneI instant **2026-03-31**, entity 532714 under
SEBI ScripCode scheme, no segment/scenario/explicit/typed dimensions; unit iso4217:INR; no precision or xsi:nil.
Consolidated/audited is filing-level selection, **not** inferred from an undimensioned context: standalone uses
OneI too. Scrip-code/ISIN strings in discovery metadata are not a new admitted identity binding.

CurrentFinancialAssets **₹19,390.60 crore** = 0 + 6,474.21 receivables + 411.26 cash + 100.67 other bank balances
+ 0 loans + 12,404.46 other current financial assets. The last is 276.90 Note19 + 12,127.56 contract assets.
The arithmetic reconciles reported values; it does **not** recover an unrounded current-investments amount.
Note10's 4,900 ₹10 shares and equal-to-cost conclusion support the **₹49,000 non-current** counterexample.
It proves a reported zero can mask a small nonzero balance, **not** that current investments are nonzero.

These corrections supersede inaccurate W07 summary wording, leaving historical bytes untouched:

| Historical wording | Verified interpretation |
|---|---|
| March XML 190,118 bytes | **77,918 bytes**, same recorded SHA, verified from retained and fresh bodies |
| September instance H1 FY26 / 2025-09-30 | **2026-09-30**, H1 FY27, unaudited consolidated; never substitute for March |
| ₹5,103.23 crore gross debt | Existing WI8 and current canonical replay retain **₹5,377.76 crore**; no debt remapping here |
| All zero tags / 13 zeros / 24 template defaults | Exact direct-child OneI INR scan finds **16 zero monetary facts**, all decimals=-7. Counts depend on filter. This establishes neither utility defaults nor populated-vs-blank workbook behavior |
| Nonzero figures “Exact” | Those are reported numbers with finite declared accuracy, not proof of exact unrounded carrying values |
| Blank cells/default filling proved | Not proved. PDF omission and repeated machine zeros do not identify utility population rules |
| Relative schemaRef must resolve via a package | A catalog can support offline resolution; the relative URI alone does not prove which package applies |
| No 2026 taxonomy published anywhere | Too broad; new BSE download below contains a 2026 core but a different accounting-basis entry point |

No repeat 421-page search. FY26 annual report is the same **18,566,481 bytes**, SHA
`ba638897313ac1fe5b7da42d7a95dac5f9efec1d1a203f88d9f963622ba3c820`, 215 PDF pages.
Selected consolidated notes were reread, not the entire report relabelled new evidence.

## 3. Official taxonomy and precision delta (`V2213`)

Exact URLs, owners, observed timestamps/statuses, raw and retained-compressed SHA-256s are in
`source/retrieval-ledger.json`; taxonomy member hashes, entry/import/reference declarations, concept attributes,
labels, references, presentation/calculation edges and dimension-default arcs are in **taxonomy-readback.json**.
This is structural inspection, not full DTS validation against every remote import.

1. **NSE current information page row6 → official IndAS ZIP**, 232,782 bytes, SHA
   `d06512f59f06a6ca126a90f185884a5679c9c666c0ab1c9d38b32449004c0441`: package metadata/catalog/core/IndAS
   entry remain **2025-01-31**. CurrentInvestments is monetaryItemType, item, instant, debit, nillable=true,
   abstract=false, no fixed/default value and no child definition annotation. English label “Current investments”;
   references SEBI Reg33 AnnexureIX and MCA ScheduleIII Assets(2)(b)(i). Presentation is in current financial
   assets; calculation weight +1 into CurrentFinancialAssets with the six reported children. Those relationships
   do not declare omitted facts zero. The seven package dimension-default arcs are retained, not confused with
   numeric defaults. They do not inject an economic zero into this concept.
2. **BSE information page item7 labelled Ind AS → its actual official ZIP**, 223,740 bytes, SHA
   `fcb8254212c771e951b6633a5e95d747770af9a62cd3859c5be69688310efb13`: core target namespace **2026-01-31**
   matches the fact QName; CurrentInvestments attributes and label agree. However metadata says **financial
   results as per AS**, and entry/roles/calculation/presentation are **IntegratedFinance_OtherThanBank**, not
   IntegratedFinance_IndAS. Its calculation relates the concept to the AS current-assets network (seven children),
   not the six-child IndAS CurrentFinancialAssets network. This **partially verifies an official 2026 concept**,
   but does not verify the applicable KEC IndAS entry point or version migration. No namespace-date substitution
   or relabelling of this package as the KEC DTS. BSE's separately linked OtherThanBank URL returned404.
3. Relative NSE 2026 entry404; tested SEBI HTTPS IndAS entry/core and OtherThanBank entry530. The SEBI public
   listing page was retrievable but did not deliver the missing entry/import package. These are finite access
   results, **not nonexistence findings**. Neither complete applicable 2026 IndAS DTS nor authoritative version
   mapping/default-population confirmation was established.
4. Official NSE archive outer ZIP was retrieved and inventoried. Initial follow-ups failed (HTTP/2 stream errors);
   a bounded HTTP1.1 + user-agent retry succeeded with the **same 8,922,025-byte outer SHA**. Two retained nested
   IndAS ZIPs contain legacy **2018/2019/2020 in-bse-fin** and **2025-01-31 integrated IndAS**, respectively.
   The latter's metadata/catalog/entry/imports were read, not inferred from filenames. Neither provides a
   2026 IndAS package. Full member inventories, nested raw/compressed hashes and original errors are retained
   in `source/access-retry/followup-ledger.json`; this finite archive result is not global nonexistence.
5. **XBRL International XBRL2.1 corrected errata 2013-02-20**, §§4.6.3–4.6.7, freshly retrieved, raw SHA
   `0aabd01fa4c77b41e7d2aeac2845f872e53871edcffad96fc99e72ba6555501f` (full body lossless gzip;
   `precision-standard-extract.txt` is whitespace-normalized). Explicit **decimals=-7** declares accuracy to
   10^7 INR = **₹1 crore**, not INF/exact zero. Nearest-rounding half-quantum is ₹5,000,000 = **₹0.5 crore**;
   e.g. ₹49,000 is compatible with a zero rounded at that scale. This is an accuracy illustration, not an
   admitted issuer interval/balance or proof of its actual rounding procedure. The zero→inferred-INF special
   case in §4.6.6 applies when **inferring decimals from supplied precision**; this fact supplies decimals
   explicitly and no precision, so it cannot override -7. Conversely, declared -7 is known finite accuracy,
   not an unknown precision attribute. Numeric zero, nil, omitted caption and template artifact are distinct.

The first attempted standards URL and guidance URL were not found; corrected official standards retrieval
succeeded. A failed endpoint is not substituted for standards content. An official taxonomy's nillable=true
means a nil fact is allowed, **not** that lexical 0 is nil or that absence equals zero.

## 4. Issuer/exchange disclosure delta, provenance and admission (`V2214`)

**candidate-dispositions.json** indexes both previous controls and fresh candidates by official owner/location,
reporting/filing date, scope, locator, audit/filed/discovery classification, raw/compressed hash and admission.
Raw download ledgers remain immutable in source/; PDF hashes refer to actual full bodies, while retained page
extracts have separate manifest hashes. Full PDFs and the unrelated large archive are not committed.

- NSE March XML/rendered body hashes match WI12. FY26 annual report hash matches WI8. No replacement amount.
- November2 Q2 results PDF hash **42d826df45b0b561460980fbc7a1f8fab2ff3985ec1196fe42706f0e4097144e**
  matches prior probe; consolidated p7 omits current investments, standalone p16 cannot be used for group.
  September machine zero is a different instant; prior Q1 and management net-debt KPIs remain unsuitable.
- Current NSE integrated-filing metadata identifies original audited March consolidated and unaudited September
  consolidated separately. Current announcements response contains 1,612 records, newest observed November12
  analyst-meeting notice; no qualifying post-cutoff audited March correction in the inspected response. API is
  bounded/current-response evidence, not an exhaustive or independently authenticated all-exchange search.
  Metadata identity strings are not used to override the admitted issuer roster.
- Issuer real `/financial-annual-results` and `/quarterly-results` pages were found (prior generic routes had
  returned shells). Annual directory still points to the same FY26 report; embedded quarterly index includes
  Q2 FY27 published Nov3, Q1 FY27 Aug10 and Q4 FY26 May18. These index dates are not silently substituted for
  exchange filing dates. New index inspection is not a new financial disclosure or issuer confirmation.
- BSE announcements endpoint403 remains an access limit. Initial transcript/meeting alias and archive
  requests failed; HTTP1.1/user-agent retry succeeded. The November6 transcript-intimation PDF is **one page**,
  keyword-scanned with no target hits, not a retrieved full earnings transcript or audited March schedule.
  November12 meeting notice is one page (retained extract) scheduling Nov17–18 meetings, not an amount/nil
  confirmation. It corroborates CIN/symbol/scrip532714 as a filed notice, but grants no new identity admission.
  Raw PDF hashes and exact bounds are recorded. No claim to have reviewed a full linked earnings transcript.
  Earnings page and management KPI context remain discovery only, not March economic nil evidence.
  No private issuer/exchange correspondence was sent or received, and no owner adjudication was made.

All fresh sources: **DISCOVERY_ONLY_NOT_ADMITTED**. Public availability is not source admission, licence,
redistribution permission, O3 or execution authority. Existing admitted operator inputs only are replayed.
No provider/source-rights expansion; no acceptedBy, nil declaration or financial observation manufactured.

## 5. Closure paths, canonical verification and external action (`V2215`)

| Path | Result |
|---|---|
| A — admissible mapped same-instant consolidated amount | **NOT SATISFIED**; no independently usable March amount established |
| B — explicit admissible economic nil | **NOT SATISFIED**; neither audited note nor issuer/exchange confirmation obtained |
| C — authoritative applicable taxonomy + filing semantics + sufficient confirmation validating economic zero | **NOT SATISFIED**; partial 2026 concept evidence is not applicable full DTS/issuer semantics/confirmation |

Historical “outcome C — indeterminate” was an evidentiary category, **not closure path C satisfied**.
A verified machine-reported zero can be PRESENT; we neither reject it because zero nor promote this ambiguous
rounded fact to economic zero. **CURRENT_INVESTMENTS remains MISSING / NOT_REPORTED / value:null. L-039 OPEN,
UNRESOLVED_PENDING_EXTERNAL_EVIDENCE.** No cross-scope nil acceptance or cash-aggregation policy decision is
made on the owner's behalf. Same-instant and L-040 zero-substitution protections are unchanged.

Read-only production workflow: `loadInputs → buildDatasetContent → computeContentDigest → assessCompany` in
`iips-platform/scripts/l039-delta-verify.ts`; report **missing-value-verification.json**. No writeDataset,
production ingestion, report persistence, successor dataset or new artifact. Original WI8 3 annual rows and
refresh candidate 5 rows all preserve missing current investments. Before/repeated-replay content digests:

- WI8: `sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab` = unchanged published dataset.
- Refresh candidate: `sha256:65ad58cd3f8070d77f76965098e416e9dc1ddab6fed54923436065a18a7f45bd`, unchanged inputs;
  not a fabricated successor or current production admission.
- Historical corrected payload file SHA `fc50c53e08814d7851d7b9bb569ddf1eb4eec19ad7508c3c16db9b13a943f370`
  unchanged; superseded original artifact remains historical, not restored.

Valid gross debt **₹5,377.76 crore**, cash **₹411.26 crore**, and diagnostic enterprise-value sensitivity points
survive. Cash-and-investments, net debt, DCF enterprise-to-equity per-share outputs, intrinsic and sensitivity
per-share values stay withheld. Generic synthetic controls demonstrate an admissible numeric zero is PRESENT
and independently missing current investments blocks the bridge. No bank/noncurrent/other financial asset,
margin money, residual, management KPI, standalone, later period or zero-by-silence substitution.

**Identity boundary:** current loading of WI8's historical identity files fails on corporate-actions.json's old
`entries` rather than required `actions`. This is recorded, not fixed in an unrelated workstream. Financial-only
assessment replay uses the verbatim historical payload identity carrier; it does **not** claim current identity
qualification, host execution or a newly publishable/persisted report. No historical carrier was rewritten.

External closure action: issuer/auditor or exchange must provide a filed/audited same-instant **consolidated**
amount or explicit economic nil, or confirm the March fact's population/rounding meaning together with applicable
2026 IndAS taxonomy entry/imports/version mapping. Confirm whether zero means genuine nil versus rounded
nonzero/default artifact; provide source locator/filing date/authority. Qualify rights and map through canonical
workflow only then; seek any required owner policy/nil decision explicitly. No agent waiver.

## 6. Tests, preservation and publication (`V2216`)

Validation details and commands: **validation.txt**. New 7/7; existing targeted L039/L040/W07/ingestion/cash
alignment 86/86; WI8 35/35; retained fact-context Python7/7; full IID1589/1589; platform tsc noEmit PASS.
Static/Python/whitespace and preservation checks recorded with final publication. Product financial/ingestion/
valuation code is unchanged. Historical source bundles, all L-038 files, unrelated issuer/period data and
published artifacts remain byte-identical to baseline. Register **§17.31** and tracker **§16.300 / CV-CORR-265 /
CHG-2026-11-06-28 / V2211–V2216** are append-only. No IPD operation or other limitation investigation.

Temporary source/transport workflows are removed from the final tree; retained probes reproduce finite source
checks without changing financial data. CI/PR/merge/read-back results are reported after actual publication,
not predicted here. OPEN is a completed investigation outcome, not a closure claim.
