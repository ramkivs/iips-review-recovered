# IIPS v3.0 — WI-5: a second issuer, and the one nil its audited consolidated statements actually declare

**Work item.** Real-Issuer Work Item 5 — second-issuer validation on explicit nil-by-disclosure, Technology only,
one issuer only, one pass.
**Bundle.** `evidence/real-issuer/WI5-PREFERENCE-CAPITAL-NIL-2026-11-07/` (21 files, digested in `digests.json`).
**Guard.** `iips-platform/tests/investment/wi5PreferenceCapitalNil.test.ts` (8 tests).

## 1. Selected issuer and identity

| Property | Value | Where it comes from |
| --- | --- | --- |
| Legal name | eClerx Services Limited | cover and audited consolidated statements of both filings |
| CIN | `L72200MH2000PLC125319` | printed in the signature block of the audited consolidated balance sheet (AR 2023-24, p.195) |
| NSE / BSE | `ECLERX` / `532927` | exchange listings used for the roster |
| ISIN | `INE738I01010` | **not printed in the financial statements**; corroborated across three independent market-data references (limitation in §9) |
| Sector | Technology (data analytics and process management, single reportable segment per Note 36) | filings |
| Periods | FY2024, FY2023, FY2022 — three consecutive audited consolidated Ind AS periods, Rs million, `AS_FILED` | AR 2023-24 (FY24 + FY23) and AR 2022-23 (FY23 + FY22) |

## 2. Why this issuer, and what was rejected

The work item requires an explicit, unambiguous nil-by-disclosure **in audited consolidated statements**, on an
**existing governed line item**. Candidates were read in their original consolidated filings, not from secondary
debt summaries:

| Candidate | What the audited consolidated statements actually contain | Outcome |
| --- | --- | --- |
| **eClerx Services** | Note 13 (p.223): *"The Company has only one class of equity shares having a par value of Rs 10 per share."*; authorised capital is a single class (100,000,000 equity shares of Rs 10 each); borrowings captions carry a filed dash at 2024-03-31 | **selected** — one explicit nil, on `PREFERENCE_CAPITAL` |
| Tata Consultancy Services (AR 2023-24, Ind AS consolidated) | No borrowings caption at all; the contractual-maturity table lists only trade payables, lease liabilities and other financial liabilities (p.24); the interest-rate-risk note says only *"The Group's investments are primarily in fixed rate interest bearing investments. Hence, the Group is not significantly exposed to interest rate risk."* (p.23); authorised capital includes 105,02,50,000 preference shares (p.24) | **rejected** — silence, not a declared nil; and the "one class" argument fails because preference shares are authorised |
| LTIMindtree | consolidated borrowings exist (interest on borrowings; financial liabilities) | rejected — not a nil candidate |
| HCL Technologies | FY24 borrowings ₹2,327 crore (investor release); group entity filings that *do* declare nil are subsidiaries | rejected |
| Wipro / Tech Mahindra / Mphasis / Persistent / Happiest Minds / Cyient / Sonata / Coforge | consolidated borrowings balances (e.g. Mphasis ₹1,984.76 crore at 31.03.2023) | rejected |
| Tata Elxsi | risk note and liquidity table identical in form to TCS's (no borrowings sentence; no borrowings row); short-term borrowings history | rejected — silence |
| Birlasoft / Zensar / Newgen / Sasken | debt-free per secondary sources, but no qualifying *audited consolidated* sentence located in this pass; Birlasoft's "no borrowings and is debt-free" sits in MD&A, which is not the audited statements | not selected — evidence insufficient |
| Wipro VLSI Design Services, HCL Jigani, Attune Consulting, Rizing B.V. and the rest of the subsidiary filings | explicit nil sentences exist (*"The Company has no borrowings as at March 31, 2024 and 2023…"*) | **rejected** — subsidiary/standalone filers, not the listed consolidated entity |

No issuer was selected because a secondary source reported zero debt. The selected nil is quoted from the audited
notes with page, note and locator, and the borrowings columns that a weaker process would have marked nil are left as
numbers (see §3).

## 3. The nil, and the nils that were refused

**Declared (one cell, FY2024, `PREFERENCE_CAPITAL`)** — `NIL: The Company has only one class of equity shares having a
par value of Rs 10 per share.` Note 13, printed p.223, audited consolidated statements, AR 2023-24 (auditor's report
dated 2024-05-16). The payload carries it as `presence: NIL_BY_DISCLOSURE`, `reason: DECLARED_NIL_IN_SOURCE`, the
quoted sentence as `note`, `filingRef ECLERX-INDAS-CONSOL-FY24`, `periodEnd 2024-03-31`.

**Refused:**

* **Borrowings.** The consolidated balance sheet presents `Borrowings 17 -  6.77` (non-current) and `Borrowings 17 -  3.08`
  (current) at 2024-03-31, and 6.77/0.50 and 3.08/0.91 at 2023-03-31/2022-03-31. A dash is an **explicitly reported
  zero**, which `observation.ts` keeps apart from a declared nil; the dataset therefore records `0` for FY2024 and the
  filed numbers for the older periods. No sentence in the consolidated notes declares borrowings nil — Note 40 says the
  Group's financial liabilities are *"other than derivatives and lease liabilities… trade and other payables"*, an
  exclusion, not a declaration. Declaring a nil there would be the inference D-2 exists to refuse.
* **Current maturities of long-term debt.** No such caption is presented in any of the three filings. The cells are
  empty (`NOT_REPORTED`), not zero.
* Older periods' preference capital. The FY2023 and FY2022 rows carry no nil: the sentence is quoted from the FY2024
  filing only, exactly as WI-3 quoted Infosys's sentence from the FY2024 filing only.

## 4. Dataset

Schema unchanged (`IIPS_INVESTMENT_FUNDAMENTALS_V2` contract), no backfill, no rewrite of the Infosys dataset, no new
persistence mechanism.

    datasetVersion sha256:00db79c1fbcabd959079db1331b3f6c192b613ad92a1c41c12919068f0fe3839
    issues.json []            Technology G2_PARTIAL — usable 3, withheld 1, statement coverage 100%

Three periods × 33 numeric/nil fields were ingested; the only non-numeric cells are the one nil and the nine empty
cells (three periods × one absent caption). Expense mapping follows WI-3: the filer's `Other expense` caption maps to
`OTHER_EXPENSES`; `Cost of technical sub-contractors` is not a governed column and is not mapped — the same treatment
Infosys's cost of technical sub-contractors received in WI-3.

## 5. Assessment, persistence and readback

| Step | Result |
| --- | --- |
| adequacy | `SUFFICIENT` (100% required-field coverage, `FIELD_COVERAGE_AT_OR_ABOVE_SUFFICIENT_THRESHOLD`) |
| quality | `MATERIAL_CONCERNS` — `STALE_STATEMENTS` (latest period end 2024-03-31, 951 days before the run clock) |
| confidence | **0.3210** combined (data 0.85, model 0.12514) |
| dividends | `INSUFFICIENT_EVIDENCE` |
| risk | `NOT_COMPUTABLE` / `RISK_EVALUATION_PARTIAL` |
| compose → persist → verify | `CREATED (wrote)`, chain valid, 1 version, head v1; `reportId c6d9d573-6e6e-468f-ae27-b037cf84b6e8`, `payloadDigest 287622ae69fb…` |
| separate-process readback | payload re-read through `loadAuthoritativeNp04Persistence → createInvestmentArtifactService → readVersionWithPayload`; read digest equals the chain head digest, and `sha256` of the read payload text equals it too (`runs/06-payload-verify.json`) |

**The nil's measured effect.** `preferenceCapital` is a nil observation, never a number; the capital-structure
aggregation does not count it as zero (unlike Infosys, where the aggregate had an explicit permission for *declared*
nils). Consequently `grossDebt` and `netDebt` are **`NOT_REPORTED`**, not zero and not negative net cash, and every
enterprise-value method depends on that aggregate:

    grossDebt   {"presence":"MISSING","reason":"NOT_REPORTED","value":null}
    netDebt     {"presence":"MISSING","reason":"NOT_REPORTED","value":null}
    components  longTermBorrowings PRESENT 0 · shortTermBorrowings PRESENT 0 · leaseLiabilities PRESENT 2,657.40m
                currentMaturities MISSING (NOT_REPORTED) · cashAndCashEquivalents PRESENT 3,539.54m
                currentInvestments PRESENT 3,924.22m

`valuation.intrinsic` is null and margin of safety is `NOT_COMPUTABLE` / `POLICY_INPUTS_UNAVAILABLE`, with the price
observation refused as `PRICE_STALE` (`PRICE_PREDATES_KNOWLEDGE_CUTOFF`): the run clock is 2026-11-07 and the most
recent eligible market observation is the 2026-11-06 NSE close, because the run date is a non-trading day. **This is a
clock effect, not an effect of the nil**, and the work item does not claim otherwise.

## 6. Comparison with Infosys (WI-3)

| Dimension | Infosys (WI-3) | eClerx (WI-5) |
| --- | --- | --- |
| Identity resolution | CIN + ISIN, `RESOLVED via ISIN` | CIN + ISIN, `RESOLVED via ISIN` |
| Three-period coverage | FY2024, FY2023, FY2022 (two filings) | FY2024, FY2023, FY2022 (two filings) |
| Nil declarations | 4 (three borrowings captions + preference capital), FY2024 row | 1 (preference capital), FY2024 row |
| Nil provenance | quoted sentence + filing ref + period | quoted sentence + note/page/locator + filing ref + period |
| Debt treatment | declared nils only; `grossDebt` **DERIVED PRESENT**, `netDebt` **DERIVED PRESENT** (−₹19,342 crore, net cash) | filed dash + real balances in prior years; `currentMaturities` absent; `grossDebt`/`netDebt` **NOT_REPORTED** |
| Cash treatment | cash + current investments both present | same |
| Filed vs derived vs unavailable | debt derived from declared nils | debt unavailable; borrowings observed as numbers (0 / 6.77 / 3.08 · 0.50 / 0.91) |
| Valuation availability | intrinsic low/mid/high present; MoS −8.4187%, band computed | intrinsic null; MoS `NOT_COMPUTABLE` (stale price) |
| Confidence | 0.6736 | 0.3210 |
| Persistence / reproducibility | CREATED → v1, replayed into an empty store with an identical digest | CREATED → v1, re-read in a separate process with an identical digest |

**Genuine cross-issuer finding (behaviour, not a defect to patch in WI-5).** The same governed field set produces a
usable debt position for the issuer that *declares* nil and no debt position at all for the issuer that merely *files a
dash* and presents no current-maturities caption. The refusal to treat an unreported component as zero is correct
under D-2 — the alternative is exactly the inferred zero the platform forbids — but it means a materially debt-free
issuer can score *worse* on debt analysis than a debt-free issuer that happened to write the sentence. Recording the
finding is the scope of WI-5; changing the aggregation contract is not authorised here, and nothing in the dataset,
policy, confidence or valuation arithmetic was altered.

## 7. Limitation register

`§17.10` records this work item. `L-036` stays **`PARTIALLY RESOLVED`**, `L-035` stays **`OPEN`**; nothing was closed,
renumbered or reinterpreted, and the 180-day control remains due. WI-5 demonstrates that the nil path works for a
second issuer on **one** line item — it does not resolve the borrowings-nil question for this issuer or any other.

## 8. Verification actually run

| Check | Result |
| --- | --- |
| `npx tsx --test tests/investment/wi5PreferenceCapitalNil.test.ts` | 8 / 8 pass (`runs/03-guard-test.txt`) |
| `npx tsc --noEmit` (iips-platform) | clean, exit 0 (`runs/04-typecheck.txt`) |
| ingest `issues.json` | `[]` |
| generate / persist / verify | `CREATED (wrote)` · chain valid · 1 version · head v1 |
| separate-process readback | digest match, `runs/06-payload-verify.json` |

No full-backend regression was run: the work item authorises targeted tests only.

## 9. Limitations this work item records (bundle-local, not product register entries)

1. **ISIN is not evidence from the audited statements.** It is corroborated from three independent market-data
   references and used only as the security key; the CIN, which *is* printed in the audited statements, is the issuer
   key.
2. **One-day-stale price.** The market observation is the 2026-11-06 NSE close obtained from a public quote endpoint
   (`YAHOO-FINANCE:…ECLERX.NS`), not from a committed exchange file as in WI-3; the run clock is 2026-11-07, a
   non-trading day, so the price-freshness policy refuses it and margin of safety is unavailable for this run.
3. **Only one nil.** The work item's title line is nil-by-disclosure, not borrowings-nil: the borrowings columns of
   this issuer are numbers in every period, and the absence of a borrowings sentence in the audited notes is recorded
   as evidence (`source/consol-fy24-note-40-financial-risk-management.txt`) rather than worked around.
4. **Two older candidate companies were not exhausted.** Birlasoft, Zensar, Newgen and Sasken were shortlisted but
   their audited consolidated notes were not read in full in this pass; no conclusion is drawn about them.
