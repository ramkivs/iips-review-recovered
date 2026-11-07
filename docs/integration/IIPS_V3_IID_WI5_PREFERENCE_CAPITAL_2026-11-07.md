# IIPS v3.0 — WI-5 (reviewed): eClerx Services Limited has no qualifying nil-by-disclosure

**Work item.** Real-Issuer Work Item 5 — second-issuer validation on explicit nil-by-disclosure, Technology only, one
issuer only.
**Status.** Completed as a **negative finding**, after review of the first pass. The bundle's original
`PREFERENCE_CAPITAL` nil declaration has been **withdrawn**; no nil is declared for this issuer.
**Bundle.** `evidence/real-issuer/WI5-PREFERENCE-CAPITAL-2026-11-07/` (`digests.json` covers every file).
**Guard.** `iips-platform/tests/investment/wi5PreferenceCapitalEvidence.test.ts`.

## 1. What was claimed in the first pass, and why it did not hold

The first pass (commits `493b600`, `0d2eaa8`) declared `PREFERENCE_CAPITAL` nil on FY2024, quoting Note 13, p.223:

> The Company has only one class of equity shares having a par value of Rs 10 per share.

It treated that sentence as the exact analogue of the Infosys sentence WI-3 accepted. On review against the filing it
is not the analogue, for two reasons visible in the filing itself:

1. **The sentence is scoped by its own heading.** In the filing it sits under the sub-heading *"Terms / rights attached
   to equity shares"* — the Schedule III disclosure of terms attaching to equity shares. It is a statement about classes
   of **equity** shares.
2. **The wording is narrower than Infosys's.** Infosys's accepted sentence reads *"the Company has only one class of
   **shares** referred to as equity shares having a par value of ₹5/-"* — one class of shares, named. eClerx says *"only
   one class of **equity shares**"*, which leaves the existence of a preference class untouched. Infosys's capital
   management note also states affirmatively *"…and has no debt"*; eClerx's Note 41 has no such sentence.

Nothing else in the filing declares preference share capital nil. The nil was therefore unsupported, and the platform
must not turn an inference into a declaration.

## 2. The search actually performed

`source/preference-capital-investigation.txt` records it page by page. In summary, for the FY2024 audited consolidated
statements (Annual Report 2023-24; auditor S.R. Batliboi & Associates LLP, 2024-05-16):

| Where a preference disclosure would appear | What is there |
| --- | --- |
| Consolidated balance sheet, equity (p.194) | `Equity share capital 482.32`, `Other equity 21,992.69`, total attributable to shareholders `22,475.01`, NCI `19.69`, total equity `22,494.70` — no preference component, and the components sum to the totals exactly |
| Statement of changes in equity (pp.201–203) | columns for equity share capital and other equity only; no preference column |
| Note 13 Share capital (p.223) | authorised `100,000,000` shares of Rs 10 each (Rs 1,000.00m), issued `48,232,242` shares (Rs 482.32m); the class sentence, the bonus/buyback/ESOP/>5% shareholder disclosures — all equity |
| Note 14 Other equity (pp.224–226) | reserves enumerated in full; `Total other equity 21,992.69`; dividends described as "on equity shares" |
| Note 40 risk (pp.245–248) | market/credit/liquidity risk; maturity profile shows `Borrowings - - -` at 2024-03-31 vs `3.08 6.77 9.85` at 2023-03-31 |
| Note 41 capital management (p.247) | *"capital includes issued equity capital, share premium and all other equity reserves attributable to the equity holders of the parent"* — a gearing definition, not an exclusivity statement |
| Note 46 ratios (p.249) | *"Total debt (represents lease liabilities and working capital loan)"* |
| Note 47 group summary (p.249+) | net assets and profit share by entity; no preference capital |

**What that supports:** at both dates the consolidated statements present no preference share capital, and consolidated
equity is fully decomposed. **What it does not support:** a *declaration*. Absence of a caption is presentation; a
scoped sentence is scoped. D-2 records a nil only where the source says so, in words, at the same period.

## 3. The correction applied

| Item | Before | After |
| --- | --- | --- |
| `ingest-input/periods.csv` FY2024 `PREFERENCE_CAPITAL` | `NIL: The Company has only one class of equity shares…` | empty |
| dataset version | `sha256:00db79c1…` | `sha256:7aa6e3f9…` |
| payload digest | `287622ae69fb…` | `e876296ae0fb…` |
| reportId (fresh governed store) | `c6d9d573-…` | `1c50bcbc-1031-4d77-9f1f-6d0ff45c4791` |
| `fundamentals.annual[0].values.PREFERENCE_CAPITAL` | `NIL_BY_DISCLOSURE` / `DECLARED_NIL_IN_SOURCE` | `MISSING` / `NOT_REPORTED` |
| `fundamentals.capitalStructure.preferenceCapital` and its component | same nil | `MISSING` / `NOT_REPORTED`, `value: null` |

Nothing else moved. A field-level diff of the two payloads is **six paths**: the dataset digest, and the
`preferenceCapital` observation in three places (annual series, capital-structure component, capital-structure summary).
Adequacy `SUFFICIENT` (100% required-field coverage), quality `MATERIAL_CONCERNS` (`STALE_STATEMENTS`), combined
confidence **0.3210**, `grossDebt`/`netDebt` `NOT_REPORTED`, dividends `INSUFFICIENT_EVIDENCE`, risk
`NOT_COMPUTABLE`/`RISK_EVALUATION_PARTIAL`, valuation `intrinsic: null` with margin of safety `NOT_COMPUTABLE`
(`PRICE_STALE`) — all identical before and after.

**Preserved refusals.** The borrowings captions are unchanged: the 2024-03-31 dash stays an explicitly reported
**zero**, 2023-03-31 stays 6.77/3.08 and 2022-03-31 0.50/0.91; `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` stays empty in all
three periods. No nil, no inferred zero, nothing mapped elsewhere.

## 4. Persistence and readback

Fresh governed store (`IIPS_NP04_DATABASE_PATH=/tmp/wi5b/data/investment/investment.db`):
`CREATED (wrote)`, chain valid, 1 version, head v1. The corrected payload was then re-read **in a separate process**
(`loadAuthoritativeNp04Persistence → createInvestmentArtifactService → readVersionWithPayload`): the read
`payloadDigest` equals the chain head digest `e876296ae0fb4ee7733f1e674d5c21ae9667a647590c1b73fa0142b7833dbe60`, and
`sha256` of the read payload text equals it too (`runs/06-payload-verify.json`). The withdrawn payload and its run
records are kept under `artifact/superseded/` and `runs/superseded/` so the retraction is auditable rather than erased.

Infosys / WI-3 evidence, the WI-4 bundle and every historical artifact are untouched.

## 5. What this means for the work item's objective

WI-5 was commissioned as a **second issuer** for the nil path. It does not deliver that: this issuer has no qualifying
nil, so the objective "two issuers with an explicit nil-by-disclosure" remains **unmet**. What it does deliver is the
other half of the control — a real issuer, a real three-period consolidated dataset, and a sentence that superficially
resembles a nil declaration, resolved correctly to `NOT_REPORTED` by the pipeline. The comparison WI-3 established
(declared nils → `grossDebt`/`netDebt` `DERIVED`, net cash ₹19,342 crore) has no counterpart here; eClerx has no debt
aggregate at all because `currentMaturities` is unreported, and that was true before and after the correction.

Register statuses are unchanged: **`L-036` `PARTIALLY RESOLVED`**, **`L-035` `OPEN`**. Neither was affected by this
work item, and the withdrawal gives no reason to move either.

## 6. Verification run

| Check | Result |
| --- | --- |
| `npx tsx --test tests/investment/wi5PreferenceCapitalEvidence.test.ts` | see `runs/03-guard-test.txt` |
| `npx tsc --noEmit` (iips-platform) | see `runs/04-typecheck.txt` |
| ingest `issues.json` | `[]` |
| generate / persist / verify | `CREATED (wrote)` · chain valid · 1 version · head v1 |
| separate-process readback | digest match (`runs/06-payload-verify.json`) |
| clean clone | bundle digests + guard test (`runs/07-clean-clone.txt`) |

No full-backend regression suite was run; the work item authorises targeted tests only.

## 7. Bundle-local limitations

1. ISIN is not printed in the audited statements — corroborated from market-data references, used only as the security
   key; the CIN is the issuer key.
2. The market observation is the 2026-11-06 close; the run clock (2026-11-07) is a non-trading day, so the price is
   refused as `PRICE_STALE` and margin of safety is unavailable. A clock effect, not an effect of the correction.
3. The search covered the balance sheet, the statement of changes in equity and Notes 13, 14, 40, 41, 46, 47; Notes
   15–39 were not swept page by page and the standalone statements were not re-read. No claim is made beyond those
   pages.
4. The filing PDFs are not committed; extracts are page-anchored and each quote records its URL, auditor and date.
