# L-038 — Marico consolidated preference capital: delta investigation, OPEN

## 1. Baseline and previous evidence cutoff (`V2205`)

Repository: **ramkivs/iips-review-recovered (IRR only)**. Work branch:
`arena/dea7aba4-iips-review-recovered`. Authoritative remote-main baseline: **843f162b8ddb587e395f14e0dc0821286c348a0f**
(PR #592 merge), fetched and equal to clean HEAD before work. No IPD inspection/write or cross-repository operation.

Governing records, read before the delta investigation:

- `IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` **§§17.23–17.24**, including their distinctions
  between policy decisions, implementation, verification and publication. L-038 is **OPEN** because preference
  capital is unknown, not because the debt/cash alignment decisions need reopening.
- `W07-FINANCIAL-LIMITATION-RESOLUTION-2026-11-12.md` **§§3.1–3.4** and its required external-evidence section:
  **UNRESOLVED_PENDING_EXTERNAL_EVIDENCE**. The last documented W07 evidence cutoff is **2026-11-12**.
  This is a documented investigation date, not proof of an exhaustive worldwide filing index.
- Master tracker **§16.282** and `evidence/real-issuer/WI12-L038-PREFERENCE-CAPITAL-2026-11-08/`:
  `README.md`, `determination.json`, original source extracts, runner locator reports and `digests.json`.

**Preserved findings, not re-litigated:** FY2024/FY2025/FY2026 audited consolidated annual reports do not establish
issued preference capital. Authorised preference capital is not issued capital. The issued/subscribed/paid-up
section's equity-only presentation is not an exhaustive nil declaration; Note 12(a)(v)'s **includes** is
non-exhaustive. W07's FY24/FY25 MGT-7s are **unsigned pre-AGM standalone drafts**, not group evidence, especially
for partially owned subsidiaries. No silence, authorised amount, arithmetic residual, historical redemption,
prior-year carry-forward or omitted caption is mapped to a number/nil. **PREFERENCE_CAPITAL remains
MISSING / NOT_REPORTED, value null.** The existing debt/cash-period owner decisions and implementation remain
**CLOSED**, and L-040's zero-substitution correction remains in force.

Evidence directory for this delta: `evidence/real-issuer/L038-DELTA-2026-11-17/`.
`baseline-and-provenance.json` records machine-derived baseline/source blob ids and capture lineage.

## 2. Exact new evidence delta and limits (`V2206`)

The delta adds **new inspection evidence**, not an assertion that a newly published post-cutoff disclosure exists:

1. Rechecked the issuer's current annual-report directory and targeted public MGT-7 candidates.
2. Re-fetched **only metadata/bytes** of the FY26 parent annual report as an identity control. Its SHA-256 and
   279-page count equal the WI12 record, checked programmatically. **No repeat of the 793-page investigation.**
3. Retrieved the FY24/FY25 MGT-7 draft controls, inspecting targeted financial-year, capital, draft and signature
   pages (six per document, not shareholder appendices). FY25 p2 still explicitly says **“This is draft MGT-7
   prepared before holding of AGM as per Companies Act, 2013.”** Both fresh PDF signature-field inventories are
   empty; that is not cryptographic authentication or an MCA filing receipt. FY24's flattened text does not
   recover all form values; W07's explicit draft finding is reused, not presented as a complete new field reading.
4. Newly inspected the issuer-hosted **Subsidiary_Financials_FY26.pdf**, **703 pages**, absent from the documented
   W07 L-038 source set. It was found through the displayed issuer directory. PDF creation/modification metadata
   is July 2026, **not evidence of publication after W07 or of a statutory filing date**. It is new to this
   investigation, not necessarily new to the public.
5. Performed targeted discovery for signed final MGT-7s, consolidated nil/capital disclosures and clarifications.
   Known drafts and non-responsive results were not upgraded to financial evidence. The BSE AGM-transcript
   cover located by search is prior to the cutoff, not a new MGT-7 or audited capital schedule; only the first
   browser chunk was inspected, no raw-byte digest obtained, and no complete-transcript negative claim made.

**Subsidiary inspection bound:** the new 703-page PDF was text-indexed for capital/preference/redemption/conversion
terms, yielding **127 hit pages**. The **first 40 hit pages** were retained for bounded review (ending at PDF p217); selected capital passages were inspected,
not all 703 pages substantively reviewed and not a complete entity-by-entity audit. There are **52 new retained
extracts** in total (12 draft-control pages + 40 subsidiary pages). Relevant subsidiary examples include:

- PDF **p26, Note 15**: BDT **31,50,00,000** issued/subscribed/paid-up share capital, with ordinary-share
  authorised wording; **p27, Note 15.1** reports Marico Limited India's **90%** holding. These are scoped capital
  facts, **not an explicit preference-capital nil**, not an INR group amount and not a complete group schedule.
- PDF **p53**: **Marico Middle East FZE**, consolidated statement, AED **1,036,635** share capital.
  This is a subsidiary/subgroup statement, not Marico Limited parent consolidated issued preference capital.
- PDF **p210**: “The company has one class of ordinary shares which carry no rights to fixed income. All issued
  shares are fully paid.” An ordinary-share class description cannot rule out every preference instrument at
  parent/group scope. No nil is inferred from it.
- Other retained pages include separate Egyptian-pound statements and South African group/company columns.
  Mixed scopes, units and accounting statements must not be totalled, residualised or substituted for the
  consolidated target. Share-capital headings alone do not identify a preference class.

No complete all-subsidiary, preference-class, non-controlling-interest and elimination reconciliation has been
established for each affected reporting instant. An inventory of 127 keyword pages is **not** that reconciliation.
Because path C also independently lacks an authenticated signed parent filing and owner acceptance, the bounded
inspection is **not expanded into another bulk investigation** merely to search for a zero.

## 3. Candidate/source status, provenance and rights (`V2207`)

`source/retrieval.json` is the machine-generated ledger: exact URLs, HTTP status, retrieval timestamps, byte counts,
raw PDF SHA-256, PDF metadata/page counts, signature-field inspection and each retained extract's PDF page/hash.
`candidate-assessment.json` records issuer, period, final/draft status, standalone/consolidated scope, locators,
share classes/amounts, group completeness, filing-date uncertainty and admission/rights disposition **per candidate**.
All digests are tool/code-produced, never manually fabricated.

| Candidate | Period / scope / exact locator | Result |
|---|---|---|
| `https://marico.com/investorspdf/Draft_MGT-7_-_FY24.pdf` | FY24 parent only; form I/p2, IV(i)(b)/p4, signature slots p17 | Draft control, not a signed/final MCA return. W07 finding retained. Parent preference zero is not group nil. |
| `https://marico.com/investorspdf/Draft_MGT-7_-_FY25.pdf` | FY25 parent only; p2 explicit draft sentence, p4 preference table, p17 signature slots | Same disqualifiers. Authorised 65,000,000 / INR650,000,000 versus issued/subscribed/paid-up zeros are separate columns, not a consolidated declaration. |
| `Draft_MGT-7_-_FY26.pdf`, `MGT-7_-_FY26.pdf`, `MGT-7_-_FY25.pdf` | Exact `/investorspdf/` candidates on both `marico.com` and `www.marico.com` | **404** at tested locations. No filing obtained there; guesses are not an exhaustive official registry search and do not prove non-existence. |
| `Marico_Annual_Report_FY26.pdf` | FY26 audited consolidated Note12(a), WI12 PDF p205 and continuation evidence | Exact same byte digest as prior report; established negative finding reused. Metadata-only control, not a new disclosure. |
| `Subsidiary_Financials_FY26.pdf` | FY26 plus comparatives; component standalone/subgroup scopes; p26/27, p53, p210 examples above | Real new-to-inspection source, but **not** a parent audited consolidated nil. Final/signature/audit status not authenticated for every component; all-subsidiary scope not reconciled. |

**Filing dates:** no MCA filing date/SRN/challan was authenticated for any purported final return. A retrieved date,
PDF metadata date, statutory due date or a website year label is **not** a filing date. Document status is reported
only to the extent established. `discovery-log.json` records search queries, issuer-directory/parser limits and the
partial BSE-transcript discovery; none is an admitted observation.

**Access and capture:** browser PDF retrievals failed for some candidates. An initial runner probe had TLS failures
and no available PDF executable; these are preserved as **retrieval failures, not document non-existence**. A bounded
curl retry with isolated **pypdf 6.1.3** runner tooling retrieved the four PDFs successfully. No host/product package
was installed. Full PDFs remained temporary and were not committed. Runner 44250008327 is the successful source
capture; 44249537298 records the initial attempt. Artifact transport from the sandbox failed, so API annotations
were used to recover the **existing capture without re-fetching sources**; `baseline-and-provenance.json` records
those run ids. Hashes of all 52 recovered extracts were independently verified. Run timestamps are retained as emitted;
this record does not reinterpret them as filing/publication timestamps. The temporary capture workflow is removed
from the final tree; the bounded source-probe script is retained for audit/reproduction.

**Rights/admission:** every fresh external item is **DISCOVERY_ONLY_NOT_ADMITTED**. Public availability does not
establish independent source rights or automatically admit new observations. No provider, O3, licence, nil binding
or source-rights authority was expanded. No raw third-party PDF is republished. The original issuer sources remain
the originals; extracted text is explicitly a derivative representation with page locators and hashes. No signed
post-AGM MCA filing package was obtained or bypassed through credentials, payment or access controls.

## 4. Literal closure-path assessment and owner decision (`V2208`)

| Path | Finding | Disposition |
|---|---|---|
| **A — source-supported consolidated issued preference amount** | No qualifying group amount obtained. Authorised preference capital, subsidiary ordinary share capital and parent draft zeros are not interchangeable. | **NOT SATISFIED** |
| **B — explicit audited consolidated nil/absence declaration** | No such declaration obtained. Reused parent audited reports do not say it; the bounded subsidiary evidence does not establish a group-wide nil. This is not a claim that no qualifying source exists outside this search. | **NOT SATISFIED** |
| **C — complete authoritative statutory return + subsidiary evidence + governed cross-scope acceptance** | No authenticated signed/final parent return/SRN/challan; no complete period-specific supporting subsidiary/group schedule; no owner acceptance. Even a signed standalone zero alone would be insufficient. | **NOT SATISFIED** |

**Owner decision:** **PENDING IF PATH C IS PURSUED — NOT MADE.** The owner must explicitly accept the supported
cross-scope `NilBinding` after the complete evidence exists. The agent does not insert `acceptedBy`, accept the
scope nuance or treat technical withholding as owner approval. The already-closed debt/cash alignment decisions
are **not** reopened. No decision on bridge-wide instant equality or any unrelated policy is implied.

**Remaining external dependency:** obtain either a direct audited consolidated issued-preference amount/nil
covering the relevant period/group (A/B), **or** the signed post-AGM parent statutory filing with authenticated
filing identity/date/receipt, plus audited subsidiary share-class evidence reconciled to the relevant consolidated
perimeter and reporting instants, including partially owned subsidiaries and applicable cancellations/redemptions/
conversions, followed by explicit governed owner cross-scope acceptance (C). The newly retrieved subsidiary
compilation is a lead, not a completed reconciliation or a waiver of the missing parent filing. FY24/FY25/FY26
require their own supported periods; a later fact may not be carried backward or forward.

## 5. Dataset and valuation disposition (`V2209`)

**No financial data or production code changed. No successor dataset created.** No `writeDataset`, production
installation, persisted assessment, host operation or IPD operation is part of this task. Existing inputs, datasets,
payloads, nil declarations, same-instant rules, capital completeness and L-040 correction are untouched.

`iips-platform/scripts/l038-delta-verify.ts` loads the **unchanged** original WI7, debt-completeness WI7-L038 and
S4-R3 candidate Marico inputs through `loadInputs` / `buildDatasetContent` **in memory**. It uses production
`computeContentDigest`, `assessCompany` and `equityValueFromEnterprise`. `missing-value-verification.json` records:

- Every consolidated period remains **MISSING / NOT_REPORTED / null** for `PREFERENCE_CAPITAL`: 3 + 3 + 5 rows,
  including FY2025 and FY2026 in the refresh **candidate** (not newly admitted by this task).
- Assessment capital blocks retain the same missing preference claim; intrinsic value remains **null**.
- The enterprise-to-equity bridge remains **NOT_COMPUTABLE**, with existing `netDebt` refusal occurring first in
  the real input sets. This task does **not** misreport that first refusal as the preference-capital refusal.
- A separate **SYNTHETIC_FIXTURE** regression isolates missing preference capital with otherwise complete inputs:
  the bridge/sensitivity explicitly refuses **preferenceCapital**, so another real-input blocker cannot mask it.
- Standalone nil without owner acknowledgement is refused by the existing cross-scope guard
  `NIL_SCOPE_NUANCE_UNACKNOWLEDGED`. No proposed nil is ingested as an issuer observation.
- Repeated in-memory builds produce identical production content digests. The diagnostic enterprise numerator
  used to exercise the bridge is **synthetic**, never an admitted enterprise value. Assessment references used
  by the diagnostic are not minted operational identity bindings.

These are verification reports over existing inputs, **not before/after successor-dataset claims**. With no data
change there is no new published dataset digest to manufacture. Existing bundle/data blobs are also checked against
the baseline; unchanged Git blobs establish that unrelated issuers/periods and historical evidence did not move.

## 6. Tests, static checks and publication (`V2210`)

- New `l038DeltaMissingPreservation.test.ts`: **9/9**, including three real-input replays, isolated preference
  bridge/sensitivity refusal, missing cross-scope acceptance, existing annual-report byte identity and all 52
  extract hashes, and no false A/B/C closure.
- Existing L-038 debt/cash alignment, L-040, nil-binding and ingestion tests: **107/107**.
- W07 **L-038-only** regression selection: **2/2**.
- Full IID regression suite: **1582/1582**; existing unrelated tests are regression only, not another limitation
  investigation. **L-039 was not begun.**
- Platform `tsc --noEmit`: **PASS** (TypeScript 5.4.5). Python compile and applicable CAP-03 static validation:
  **PASS**, with classification/routing/release-audit unit suites **7 + 4 + 23** PASS.
- `git diff --check`: **PASS**. Complete diff reviewed: append-only register/tracker; new delta record/evidence,
  source-probe/verification utilities and tests; no historical source/data/test rewrite or production logic change.
  The initial local static-history check required unshallowing the clone; it was rerun on full history, not waived.

Captured results and exact commands: evidence `validation.txt`. Local TypeScript tests are not represented as
GitHub CI execution. PR/checks/merge and independent remote head/blob/ancestry verification are reported after
publication, not pre-claimed here. Changes stay on the designated branch; temporary capture workflow removed before PR.

## 7. Final status and next separate task

**L-038 OPEN — UNRESOLVED_PENDING_EXTERNAL_EVIDENCE.** The delta investigation is delivered; no closure is invented.
No qualifying A/B/C outcome was established by the accessible, bounded evidence. No missing→zero, prior-year
carry-forward, authorised→issued inference, equity-only nil, arithmetic residual, standalone→group substitution
or valuation-withholding relaxation occurred. No owner decision was made on the user's behalf.

Authoritative updates are **append-only limitation-register §17.30** and **master tracker §16.299 /
CV-CORR-264 / CHG-2026-11-06-27 / V2205–V2210**. Historical §§17.23–17.24 and §16.282 remain intact.

**L-039 is untouched and not started.** It is the next **separate** work item after this L-038 report, not scope
silently added to this investigation. Stage 4's existing status is not upgraded by a still-open financial limitation.
