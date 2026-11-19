# IID Stage 4 — S4-R8 / corporate-actions G-8: investigated, OPEN/event-driven

## 1. Baseline, authority and literal criterion (`V2197`)

IRR only, branch `arena/e2a99980-iips-review-recovered`. The exact remote-main baseline is `deb94ee9918be5ed1043cc4b7f6c1309337233a7`, machine-recorded in
`evidence/real-issuer/S4-R8-CORPORATE-ACTIONS-2026-11-17/census.json` (`baseline`, merge of PR #591 / S4-R6).
It was fetched and confirmed equal to clean HEAD before changes. No IPD write, host operation or installation.

Authoritative references (section/row names govern if line numbers move):

- `IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md`, roadmap row **S4-R8** (baseline line 238):
  **Fill corporate actions as events occur**, authority **OPERATOR — event-driven**, current evidence
  `merge.actions 0`, `corporateActions 0`; action **Record actions as they occur and re-publish**;
  closure evidence **`corporateActions > 0`**. Its subsequent addenda leave S4-R8 open.
- `IID-STAGE4-COVERAGE-MEASUREMENT-EVIDENCE-2026-11-14.md`, scenario 7 rows (baseline lines 681, 756):
  synthetic limb demonstrated, real transcribed action still required for G-8 / L-031 / S4-R8.
- `IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` §16.2 **L-031**, summary row L-031:
  **OPEN**. Required evidence: a feed/operator-declared table covering the window and an acceptance test showing
  the guard fires on a **real declared action**, with the factor applied, **not guessed**. No later decision
  inspected supersedes this requirement. No limitation status is changed here.
- Latest master tracker §16.297 records S4-R6 investigated/G-4 OPEN and S4-R7 discharged; those are not reopened.
  This item appends §16.298, not an interpretation of an old superseded progress row.

**Naming collision:** the corporate-actions G-8 is the S4-R8 row, not PA-01's G-8 (single acceptance authority)
and not formal closure's G-8 (AC-X6 fixture-size issue, already closed). PA-01 simplifies acceptance authority,
not the evidence needed to claim that a real event was recorded. No new sign-off ceremony is created.

## 2. Existing synthetic demonstration (`V2198`)

**Reused unchanged**, not rewritten: `iips-platform/tests/investment/iidStage4ScenarioMatrix.test.ts`,
`§23 scenario 7 — (S) successor weights reconcile to 1, or the whole file is rejected` (three existing tests).
The committed identity fixture's DEMERGER weights are 0.6/0.4, MERGER weight 1; perturbing a weight rejects the
**whole** table with `SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE` and the actual sum. The third test records the real-data
zero. Existing `identity-corporate-actions.test.ts` and `identity-sources.test.ts` cover factor semantics,
lookup, successor measured/unmeasured allocations and fail-closed source loading. The combined existing-test run
passed **77/77**, including all scenario-matrix tests. No synthetic fixture or scenario test was edited.

Label: **SYNTHETIC_FIXTURE**. This is neither real issuer coverage nor operational action evidence.

## 3. Real-event census and exact search scope (`V2199`)

Evidence directory: `evidence/real-issuer/S4-R8-CORPORATE-ACTIONS-2026-11-17/`.
Reproduce with `cd iips-platform && npx tsx scripts/s4r8-corporate-action-census.ts`.

`census.json` inventories **all 597 baseline-tracked files under `evidence/real-issuer`**, not just files named
corporate-actions: committed source extracts, JSON/XBRL facts, input transcriptions, retrieval reports in `runs/`,
READMEs and controls. Each inventory row has the baseline Git blob id, and every keyword hit has a line locator.
Hit text collapses whitespace for discovery only; originals are the authoritative terms. The script also scans
corporate-action table names across the **whole repository**. Discovery terms include bonus, split, buyback,
merger/demerger, amalgamation, scheme of arrangement, dividends, redemption, QIP, allotment, rights issue,
capital reduction and symbol/name changes. Semantic findings below distinguish actual references from generic
accounting policy, column-split language, test output and acquisition/asset accounting.

Population: **Infosys, Marico, KEC** only. The generated dataset rows record exact CIN issuer ids and current ISIN
security ids from production read-back. Zensar and other rejected/search/control material in the inventory is
**not admitted population**. Existing original inputs and refresh-candidate inputs were separately re-ingested into
temporary directories; the latter remains a **candidate**, not a new O3 admission. Measured periods span
2022-03-31 to 2026-03-31 (historical combined inputs) / 2026-09-30 (refresh candidate), assessment clock
2026-11-17. L-031's narrower Infosys continuity interval after 2024-03-31 is still not verified.

There are **13 action-table files**: **11 evidence tables with zero records**, and two synthetic fixture tables
with 3 and 9 actions. Seven of the eleven are identity input tables; four are persisted historical dataset
copies. WI8's legacy empty `entries` form is counted explicitly as such; `identity/provision.ts` already handles
that exact empty-only legacy shape. It is not silently treated as a non-empty `actions` table. Both temporary
combined datasets read back **0 corporate actions**.

**This is not a claim that no corporate actions occurred.** In particular, restricting the search to `source/`
would have missed Marico's historical bonus/split table in committed retrieval reports. Primary annual-report PDFs
are not present in the checkout; no web retrieval was performed, no public event calendar was treated as evidence,
and this finite census cannot establish non-occurrence outside these extracts.

## 4. Candidate-by-candidate source, identity and rights assessment (`V2200`)

`candidate-events.json` records **13 discovery candidate/group rows**, not 13 validated legal events. Every row
states issuer/current security identity, source file and exact line locator, reported terms, available dates,
missing event fields, lineage, authority, window applicability and operator action. Null means **not established**,
not zero. A current ordinary-equity ISIN is not evidence of the historical instrument's identity.

The five required classes are retained explicitly: (1) no applicable event found in inspected evidence,
(2) event exists but event-level source evidence unavailable, (3) evidence exists but rights/admission insufficient,
(4) source-supported/admissible, (5) malformed/ambiguous/rejected or cannot map to the canonical schema.
The row counts are **0 / 2 / 6 / 0 / 5** respectively. Categories 2/3 may have additional blockers; the assigned
category is not a waiver of them. Category 5 does not imply a validator was run on a fabricated record.

| Candidate(s) | Exact source anchor (under `evidence/real-issuer/`) | Finding and primary class |
|---|---|---|
| Infosys aggregate purchased/extinguished shares | `WI3-BORROWINGS-NIL-2026-11-06/source/consol-fy24-note-2.12-equity-share-capital.txt:26-28`, Note 2.12, document pp26–31 | Five-year aggregate preceding 2024-03-31: **21,41,00,951** shares, face value ₹5. Event dates, individual terms and factor not supplied. **2**; cannot establish applicability of each event to the price/filing interval. |
| Marico equity bonuses, August 2002 / May 2004 / December 2015 | `WI12-L038-PREFERENCE-CAPITAL-2026-11-08/runs/03-fy2526-locator-report.txt:1424,1428,1432` (also 1585/1589/1593) | Each prints **Equity 1:1**, but only month/year. Supplemental investigation material, not an admitted event schedule. **3**, also missing day-level dates and historical security identity. Predates measured periods; no speculative restatement. |
| Marico preference bonus, September 2002 | Same report `:1426` (also 1587) | Prints **Preference 1:1**; not the admitted ordinary-equity security. **3**, missing instrument/dates/terms and admission. |
| Marico split, February 2007 | Same report `:1430` (also 1591) | Prints **Share Split (10:1)**. **3**; no day-level effective date, historical security mapping or authorised factor transcription. |
| Marico preference redemption, March 2004 | Same report `:1441-1442,1605` | Prints redemption proceeds of bonus preference shares (200; 2,000; indexed 11). **3**, not an equity conversion factor or a successor allocation. |
| Marico ESOP/trust allotments | `WI12-L038-PREFERENCE-CAPITAL-2026-11-08/source/fy26-page205-note12a-consolidated-equity-share-capital.txt:90-98`, Note 12(a)(v); FY24 counterparts also inventoried | Annual aggregates, not individual action dates; **ESOP issuance is not a canonical action type**. **5**, no relabelling as bonus/rights. |
| KEC FY25 QIP | `WI8-INDUSTRIALS-KEC-2026-11-07/source/fy25-consolidated-cash-flow-financing-pdf-page112.txt:26`; identity corporate-actions note | QIP proceeds 870.16; identity note reports 9,111,630 issued shares. **5**, QIP is not RIGHTS/SPLIT/MERGER and dates/adjustment terms are absent. |
| KEC earlier-year Composite Scheme | `WI8-INDUSTRIALS-KEC-2026-11-07/source/fy26-notes-09-to-10-intangible-assets-and-investments-pdf-page129.txt:54-59`, Note 9.1 | Brand accounting reference, no event date/predecessor/successor/allocation. **2**, must not infer MERGER/DEMERGER from asset accounting. |
| Marico FY25 interim and proposed final dividends | `WI12-L038-PREFERENCE-CAPITAL-2026-11-08/runs/02-fy2425-locator-report.txt:134-158` | Interim H3.50 declared 2025-01-31; final H7.00 recommended 2025-05-02, conditional on AGM (record date/payment deadline in same paragraph are not an effective action date). **5**, DIVIDEND unsupported. |
| Marico FY26 proposed final dividend | `WI12-L038-PREFERENCE-CAPITAL-2026-11-08/runs/04-fy26-standalone-report.txt:217-218` | H4.00 recommendation subject to AGM. **5**, not an effective share-base action. |
| Other aggregate cash dividends | KEC FY25 source p111 `:56` and other cash-flow hits in inventory | Annual paid totals, not dated event terms. **5**, DIVIDEND unsupported. |

There is **no admissible canonical action**. Existing manifests declare **OPERATOR_ASSERTED**, expressly not
independent verification of third-party terms. Permission to inspect an existing extract is not automatic permission
to admit a new event record, and a source citation is not a rights grant. The supplemental WI12/refresh sources do
not broaden O3; this item makes no admission decision on the owner's behalf. Original PDF bytes, detailed notices,
announcement/effective dates, applicable fraction/residual/rounding rules and predecessor/successor security terms
must be obtained where relevant. None is invented or extrapolated from a cash-flow total or historical illustration.

## 5. Production capability and boundaries (`V2201`)

| Path | Finding |
|---|---|
| Schema: `fundamentals/types.ts`, `CorporateActionRecord` | 13 types; effective date, subject issuer/security, comparability, factor/basis, issuer successors/ratios, free-form sourceRef. **No** announcement-date, successor-security, raw conversion-term or fractions/residual/rounding fields; DIVIDEND/QIP/ESOP unsupported. Keep extra original terms in authorised source evidence, not invented schema fields. |
| Identity: `identity/sources.ts`; `identity/provision.ts`; versions in `identity/types.ts` | Canonical container/schema, required fields, type/date/factor/duplicate/issuer checks, successors required for MERGER/DEMERGER, reconciliation; any issue rejects the file set. Provisioning retains canonical versioned identity sources; legacy handling is narrow, not a new authority. |
| Dataset: `cli/ingest.ts` → `ingestion/builder.ts` → `ingestion/writer.ts` | **Defect found and corrected**, §6. CLI default refuses on ERROR before writing; partial publication with `--allow-errors` is explicit, and now cannot retain any action from a rejected action file. Writer/readDataset hash and preserve accepted original records. |
| Successors: `identity/corporateActions.ts`, `identity/coverage.ts`, `coverageView.ts` | Issuer successor weights, measured plus unmeasured slices, not a per-security exchange engine. Unknown/unmeasured successor issuer is deliberately not silently dropped. No historical successor security is inferred. |
| Lookup/factors: `actionsForIssuer`, `adjustPerShareSeries`, `verifyPerShareConsistency`, `symbolHistory` | Existing as-of/security filtering, ordering, pre→post per-share factor convention and non-comparable boundaries covered by existing tests. No formula change. |
| Assessment: `assessment/engine.ts` → `assessment/margin.ts:selectPrice` | Reads dataset corporateActions; refuses effective non-comparable actions without a matching price adjustment action id. Existing synthetic assessment tests exercise refusal/matching adjustment. **Not fired or proven on real evidence here**. No price, valuation or freshness behaviour edited. |

Identity is explicit: unknown subject issuer rejects; the corrected dataset path also rejects a supplied unknown or
wrong-owner subject security. A null security remains the schema's issuer-wide form, not a guessed security.
Duplicate/conflicting **same actionId** rejects. Different ids on the same day may be legitimate distinct events;
there is no source-semantic conflict adjudicator. Provenance sourceRef is preserved, but the identity parser permits
a legacy default `corporate-actions`; it does **not** authenticate a locator or source rights. A syntactically valid
record is not thereby source-supported/admissible. These are evidence/operator duties, not claims of automation.

Existing tolerances differ: validation uses 1e-6 and reconciliation display uses 1e-9. This item changes **neither**
threshold; near-tolerance acceptance must not be represented as exact reconciliation. No fractional allocation,
security conversion or independent corporate-action feed coverage is claimed. ReadDataset verifies integrity,
not source truth, and does not retroactively repair pre-existing datasets. The source corpus remains the audit
original; rejected inputs are not overwritten. The generic schema is not extended speculatively without a real
source-supported need.

## 6. Small issuer-neutral correction and regressions (`V2202`)

Baseline dataset assembly checked only subject issuer and a comparability warning, then passed actions straight
through. Thus a dataset-side malformed/unbalanced action could bypass the identity loader entirely. Separately,
identity validation accepted negative weights summing to one, and duplicate successor ids.

- Extract the **existing** record validator as `validateCorporateActionRecords`; canonical identity loading delegates
  to it. Retain the existing container validation, messages, defaults and reconciliation tolerance.
- Reject non-positive successor ratios and duplicate successor issuer ids, rather than allowing impossible allocations.
- Invoke that validator in dataset assembly **without a JSON round-trip** (which would hide Infinity as null).
- Require canonical dataset fields (including an explicit comparability boolean and non-empty sourceRef):
  identity-file legacy defaults must not allow a missing boolean to bypass the assessment guard when original
  dataset records are retained without normalisation. The identity-file defaults themselves remain unchanged.
- Check supplied subject security exists and belongs to the subject issuer. If any action has an error, expose
  **zero actions from the file** and named ERROR issues; do not publish the apparently good subset. Preserve valid
  originals exactly, including sourceRef/factorBasis. CLI default writes nothing; `--allow-errors` may publish
  unrelated partial content with recorded errors, **never the rejected action subset**.

`iips-platform/tests/investment/s4r8-corporate-action-ingestion.test.ts`: **22 tests**, synthetic only. Covers missing
fields, invalid calendar dates/types/issuer/booleans/factors/ratios, nonfinite runtime numbers, missing merger mappings,
unbalanced/negative/zero/duplicate-successor weights, non-object records, duplicate/conflicting action ids, security
ownership, null security, exact two-issuer original/provenance persistence/read-back, unrelated content unchanged,
CLI no-write and explicit partial-write withholding; missing canonical dataset fields cannot bypass the guard. Existing scenario 7 is reused, not duplicated or relabelled real.

## 7. Real-event validation/read-back (`V2203`)

**NOT PERFORMED — no admissible canonical event.** No real record was constructed or submitted, no false rejection
was manufactured and no numeric criterion was filled by a fixture. Temporary production re-ingestion and
independent `readDataset` verification establish the actual real-input zero, not a real action demonstration.
Two-issuer valid-action persistence/read-back is **synthetic regression evidence only** (§6).

## 8. Before/after integrity (`V2203`)

No existing input, evidence bundle, dataset, issuer, listing, holding or assessment artifact is modified.
`digest-comparison.json` contains **production-generated**, not hand-computed digests: original baseline source was
replayed into a temporary dataset, then corrected source replayed with the same inputs/clock and verified with
`readDataset` and `computeContentDigest`. The complete generated dataset rows (including sourceRights) are identical
before/after for **both** historical and refresh-candidate inputs. Both still have 0 corporateActions. Hashes are
in the JSON evidence, not manually transcribed. There is no real data-change digest to manufacture. No live preview,
production process or host data path is used.

## 9. Exact determination and validation (`V2204`)

**Determination C — events are referenced, but none can be admitted as a complete canonical action from this evidence.
G-8 remains OPEN/event-driven; L-031 remains OPEN.** It would be incorrect to choose B as a global non-occurrence
finding. Historical sources contain actions; their terms/identity/dates/rights and applicability are not sufficiently
established for this workflow. A is **not demonstrated**: `corporateActions > 0` is false (0 in both read-back
datasets), and L-031's real declared-action guard/factor acceptance evidence is absent. Synthetic success cannot
satisfy either real-data limb. Investigation and safe generic correction are delivered, not criterion closure.

Validation: new targeted **22/22**; existing corporate-action/source/scenario-matrix **77/77**; full IID
**1573/1573**, no skips/failures; platform `tsc --noEmit` PASS with TypeScript 5.4.5. CAP-03 static validator and
its classification/routing/release-audit unit tests **7 + 4 + 23** PASS; Python compile PASS; `git diff --check`
PASS. Commands and captured summaries: evidence `validation.txt`. CI/publication results are added to the completion
report after remote verification, not predicted here. Full diff reviewed: two production files, new tests/script,
new investigation evidence and append-only register/tracker addenda only; no historical test/fixture change.

## 10. Remaining actions and roadmap (`V2204`)

Owner/operator: obtain event-specific authorised evidence when an applicable action occurs or is established;
confirm document+locator, legal issuer/security identity at the event date, announcement/effective dates, original
terms and any successor/conversion/fraction/residual treatment; establish source rights and admission under the
existing controls, not a broadened O3; transcribe only representable supported terms, validate both identity and
dataset paths, re-publish, independently read back and demonstrate the real guard/factor/reconciliation, retaining
before/after digests and originals. Unsupported event types or required security/fraction semantics need an explicit
governed schema/workflow decision, not an invented mapping. No unnecessary approval checkpoint blocks this publication.

Stage 4 remains **PARTIALLY COMPLETE**, IID **NOT READY**. S4-R2 CLOSED; S4-R3/Infosys OPEN; S4-R4 CLOSED;
S4-R5 DECIDED—DISCHARGED; S4-R6 investigated/G-4 OPEN with owner decision outstanding; S4-R7 discharged.
S4-R8 is the **last numbered item in the current Stage 4 roadmap**; there is no registered S4-R9 to invent.
Next work is residual operator/owner action on the existing open limbs (including S4-R8 when evidence becomes
available), not an assertion of Stage 4 closure or authority to start a new roadmap stage.
