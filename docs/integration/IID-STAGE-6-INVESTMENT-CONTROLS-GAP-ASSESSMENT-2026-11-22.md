# IID Stage 6 — Investment Controls and Architecture Gap Assessment

**Date:** 2026-11-22 · **Scope:** read-only inspection of IRR (`ramkivs/iips-review-recovered`, branch
`arena/9804a6ad-iips-review-recovered`, HEAD `8364270` = PR #622 head; this record is a documentation-only
architecture record carried in PR #622 and changes no implementation) with read-only references to the IPO Screening Engine surfaces that IRR already imports. **No code, policy, scoring,
screening, disposition, IPD or IPO Screening Engine change was made.** This document is the only output.

**Status of this document:** inspection findings. "Implementation evidence" means a file and line that was
read in this session. "Documentation claim" means a statement found in a doc that was not confirmed in code.
Nothing here was run against the owner's host data; host verification remains the owner's.

---

## 0. One-paragraph summary

IRR already computes a solid **company-quality and valuation** layer (leverage, cash conversion, capex
intensity, ROIC−WACC spread, intrinsic range, margin-of-safety bands, multiples, quality flags, freshness,
dividend cover, confidence) and a **disposition** layer that turns that evidence plus two **exposure caps**
(`singleNameMaxPct`, `sectorMaxPct`) into a conservative verb. Several existing controls already
**enforce automatically** (they change or withhold the verb, or stop the run): the quality-based disqualifier
(`MATERIAL_CONCERNS` + HIGH flag → AVOID), the valuation/MoS-driven verb rules (REDUCE at a ≤ −10 % premium,
AVOID at ≤ −25 % with deteriorating fundamentals, ACCUMULATE/INITIATE only at ≥ 15 % discount), the risk
triggers (severity-5 disqualifier, new severity ≥ 4 REDUCE trigger), the identity and security-state gates
(G-1, G-2), the evidence-adequacy gate (G-3), the portfolio-context gate for the subject (G-5), and the two
exposure caps (G-6 / capacity gates). The two exposure caps are the only **operator-configurable portfolio
exposure limits currently supported by the S6-1 limits policy**; every other automatic control carries
thresholds fixed in code (`assessment/policy.ts`, `disposition/policy.ts`), not in the policy file. Controls
that are **warn-only** today (flags, notes, review triggers) or **absent** are marked as such row by row in §1.
The main gaps are: interest coverage, ROE/ROCE/debt-to-equity as
explicit controls; top-five, minimum-holdings and market-cap allocation controls; unmeasured-weight limits;
all liquidity and promoter-pledge controls; a governance dimension; and **scheduled** monitoring (today change
detection is on-demand and compares two stored versions). The sector taxonomy is split in three runtime
vocabularies that are **not identical** (IRR canonical `SectorName`, IPO Screening Engine display names,
engine-admission aliases). The supported `sectorMaxPct` keys are the **IRR canonical `SectorName`** values,
matched exactly (case-sensitive) against the subject's resolved roster sector, e.g. `Technology` — not
`Information Technology`, not `IT`. Neither the policy parser nor the runtime roster loader validates sector
strings against that vocabulary, so an unsupported key may silently fail to match; the host roster's actual
values were not inspected here (see §2).

---

## 1. Capability matrix

Classification key: **1** implemented + verified (tests/CI seen) · **2** implemented, not integrated into the
disposition path · **3** partial · **4** not implemented · **5** belongs to another engine / repo · **6** needs a
governance decision before implementation. "Auto" = changes the verb or stops the run; "Warn" = recorded
text/flag only; "—" = nothing.

### A. Company quality

| Control | Existing capability | Owning component | Current evidence | Gap | Recommendation |
|---|---|---|---|---|---|
| Financial health (overall) | Quality verdict `CLEAN / MINOR_CONCERNS / MATERIAL_CONCERNS / UNVERIFIED`; flags `RESTATEMENT_PRESENT, CASH_FLOW_EARNINGS_DIVERGENCE, OPERATING_METRIC_UNVALIDATED, STALE_STATEMENTS, NEGATIVE_EQUITY, SHARE_COUNT_PERIOD_MISMATCH, DIVIDEND_SOURCE_CONFLICT, PERIOD_SEQUENCE_GAP`; evidence adequacy `SUFFICIENT/PARTIAL/INSUFFICIENT` | IRR `iips-platform/src/investment/assessment/{adequacy,freshness}.ts` (`buildQuality` lives in `adequacy.ts` L140) | `assessment/types.ts` L497–520; disposition `findDisqualifier` uses `MATERIAL_CONCERNS` + HIGH flag → AVOID (`disposition/engine.ts` L213–218). Enforced: **Auto** (AVOID / gate G-3) | No single "financial health score"; that is by design (no invented composite) | **Class 1.** Keep. Do not add a composite score without authority. |
| Debt / leverage | Net debt / EBITDA dimension, threshold 3×; `netDebtToEbitdaRising` trend; capital structure block (gross/net debt, cash, leases, minority, preference) | IRR `assessment/risk.ts` (FINANCIAL_LEVERAGE), `assessment/capitalStructure.ts`, `fundamentals/derive.ts` (NET_DEBT) | `risk.ts` dimension FINANCIAL_LEVERAGE; REDUCE trigger `dividend:UNCOVERED with net debt / EBITDA rising` (`disposition/engine.ts` L293) | **Debt-to-equity is not computed** as a metric or a control; leverage breaches alone (without dividend condition) are not a REDUCE trigger — they feed risk severity only | **Class 3.** Add debt-to-equity as a derived item in `fundamentals/derive.ts` (owner approves threshold). Keep enforcement in disposition via risk severity, not a new verb rule, unless owner authorises. |
| Profitability | Margins and trends in `fundamentals.trends`; EBITDA/EBIT derived; sector engines score margin pillars separately | IRR `fundamentals/derive.ts`, `assessment/engine.ts`; IPO Screening Engine sector engines (margin inputs) | `derive.ts` EBITDA/EBIT; `trends.roicTrend` | No explicit ROE/ROCE line item (`LineItemId` has none); profitability deterioration enters only via `deterioratingFundamentals` in disqualifier | **Class 3.** ROE/ROCE as derived items (IRR). Thresholds, if any, are an owner decision (class 6 for enforcement). |
| Cash flow | FREE_CASH_FLOW derived; EARNINGS_QUALITY_CASH_CONVERSION risk dimension; `CASH_FLOW_EARNINGS_DIVERGENCE` quality flag; FCF/dividend cover | IRR `fundamentals/derive.ts`, `assessment/risk.ts`, `assessment/dividends.ts` | `dividends.ts` L125–164; `risk.ts` cash-conversion dimension. Enforced: **Warn** (flag/severity) + **Auto** when it produces a HIGH flag with MATERIAL_CONCERNS | None material | **Class 1.** Keep. |
| Interest coverage | **Not computed.** No `INTEREST_COVERAGE` line item, no derived ratio, no risk dimension | — (would be IRR `fundamentals/derive.ts` + `assessment/risk.ts`) | `contracts/lineItems.ts` has no interest-expense ratio; grep of `assessment/` shows no coverage ratio | Whole control missing | **Class 4.** Requires an `INTEREST_EXPENSE` (or finance-cost) line item in the dataset first; then EBIT / interest as a derived item; then a risk dimension. Owner sets the threshold (class 6 for the number). |
| Return on capital | ROIC computed per year **inside moat only** (`roicSpreadByYear`, spread vs WACC, threshold 0.02); `trends.roicTrend` | IRR `assessment/moat.ts` | `moat.ts`; REDUCE trigger `moat:NONE/INSUFFICIENT_EVIDENCE with negative ROIC−WACC spread` (`disposition/engine.ts` L296) | ROIC is not exposed as a standalone fundamentals metric; ROCE absent; no explicit "return on capital below hurdle" control outside the moat/REDUCE path | **Class 3.** Surface ROIC as a derived item (no new calculation — reuse moat's); add ROCE only if the owner wants it. |

### B. Valuation

| Control | Existing capability | Owning component | Current evidence | Gap | Recommendation |
|---|---|---|---|---|---|
| Intrinsic value | Intrinsic range (low/mid/high per share), method blend with per-sector method exclusions, sensitivity | IRR `assessment/intrinsic.ts`, `assessment/policy.ts` (`SECTOR_EXCLUSIONS`, `ROLE_WEIGHTS`) | `policy.ts`; `engine.ts` L373 (unimplemented method families disclosed) | Some method families are declared but have no engine implementation (disclosed in limitations) | **Class 1** for what exists; the unimplemented families are **class 3** and stay disclosed. |
| Margin of safety | `mosVsMid` and bands `DEEP_DISCOUNT ≥ 40 % / DISCOUNT ≥ 15 % / FAIR ≥ −15 % / PREMIUM ≥ −40 % / SIGNIFICANT_PREMIUM`; disposition thresholds accumulate ≥ 15 %, reduce ≤ −10 %, avoid ≤ −25 % with deterioration, fair band low −5 % | IRR `assessment/margin.ts`, `disposition/policy.ts` `MOS_THRESHOLDS` | `disposition/policy.ts` L25–33; `verbs.ts` selection. Enforced: **Auto** (verb) | Two threshold tables (assessment bands vs disposition thresholds) are related but not identical — this is intentional separation, but should be stated once in the runbook | **Class 1.** Keep; document the two tables side by side (docs only). |
| Multiples | PE 22 / EV-EBITDA 12 / EV-Revenue 4 / PB 0.6–6 reference multiples; sector exclusions | IRR `assessment/policy.ts` | `policy.ts` multiples block | Multiples are global, not per sector; IPO Screening Engine sector inputs (`evEbitda`, `evRevenue`) are not consumed | **Class 3.** Per-sector multiples need owner-approved numbers (class 6). Do not import sector-engine valuation pillars into IRR (keeps engines separate). |
| Over-valuation warning | REDUCE trigger at ≤ −10 % MoS; AVOID disqualifier at ≤ −25 % with deteriorating fundamentals; `MOS_BAND_CROSSING` and `INTRINSIC_CHANGE_MATERIAL` review triggers | IRR `disposition/engine.ts`, `frontend/server/investment/change/review.ts` | `engine.ts` L273, L222; `review.ts` trigger list. Enforced: **Auto** (verb) + **Warn** (review trigger) | Warning exists only when a disposition or a comparison is generated — nothing watches prices between runs | **Class 1** (control) / **class 4** (scheduled watch — see E). |

### C. Portfolio structure

| Control | Existing capability | Owning component | Current evidence | Gap | Recommendation |
|---|---|---|---|---|---|
| Single-company limit | `singleNameMaxPct` (default 10 %); applied to current weight (REDUCE trigger), issuer exposure across securities (REDUCE trigger), and projected weight (ACCUMULATE→RETAIN, INITIATE→WATCH) | IRR `disposition/limits.ts`, `disposition/engine.ts`, `disposition/verbs.ts`; policy file via `frontend/server/investment/limitsPolicySource.ts` (S6-1) | `limits.ts` L26–29, L271–293; `engine.ts` L276–283; `verbs.ts` cap block; S6-1/S6-1b tests, CI green on `8364270`. Enforced: **Auto** | Verified in CI with stand-in/real store; **not yet verified on owner's host holdings** | **Class 1** (code) — host verification pending (runbook §15.6). |
| Sector limit | `sectorMaxPct` map with `DEFAULT` (default 30 %); projected sector exposure (HELD: current − weight + projected; CANDIDATE: current + projected) | same as above | `limits.ts` L237–242, L294–312; `engine.ts` L285–289. Enforced: **Auto** | Sector key must match the subject's roster sector string exactly (see §2); exposure covers only holdings whose sector is known | **Class 1** (code) with the §2 caveat. |
| Top-five concentration | `topHoldingWeightPct` only (largest single holding); IPO Screening Engine CSIP `concentration` = max **count-based** sector share | IRR `frontend/server/investment/portfolioContext.ts` L175, L200; IPO Screening Engine `cross-sector/portfolio/PortfolioIntelligence.ts` L39–46 | read in session | **No top-five (or top-N) sum is computed anywhere**; CSIP concentration is count-based and runs on the frozen baseline, not the user's portfolio | **Class 4.** Add `topFiveWeightPct` to `portfolioContext.ts` (one read of existing weights). Whether it caps a verb is an owner decision (class 6). |
| Minimum holdings | `holdingsMeasured`, `holdingsUnresolved`, `holdingsOutOfScope` counts; `concentrationBand`/`diversificationBand` deliberately `notComputable` | IRR `portfolioContext.ts` L135–180 | read in session | No minimum-holdings rule; CSIP diversification band is not applied to user portfolios (stated in code note) | **Class 4** (rule) + **class 6** (the number). Trivial to measure from existing counts. |
| Market-cap allocation | **Not present.** No market-cap field on `G2HoldingView`, no cap buckets in IRR | — (would need market-cap from a market-data source → IPD boundary) | `userPortfolioContract.ts` L326–348 has no marketCap | Whole control missing; depends on a data source that IRR does not own | **Class 5/4.** Market-cap must come from IPD (production market data) or an operator-entered dataset; IRR would only consume it. Owner decision on buckets (class 6). |
| Unresolved holdings | Excluded from measured weight; counted (`holdingsUnresolved`); their weight reported as `unmeasuredWeightPct` with a note; G-5 gate FAILs for the **subject** if its own weight/sector exposure is null | IRR `portfolioContext.ts` L59, L82, L140–160; `gates.ts` L184–192 | read in session. Enforced: **Warn** (notes) for other holdings; **Auto** (G-5 FAIL / INITIATE→WATCH) only for the subject | A portfolio that is 40 % unresolved still yields a verb for a resolved subject, with exposure measured on the 60 % | **Class 3 → 6.** Owner decides whether an unmeasured-weight ceiling (e.g. "no ACCUMULATE/INITIATE if unmeasured > X %") should exist. Implementation would be one gate in `gates.ts`. |
| Unmeasured holdings (sector unknown) | `sectorMeasuredWeightPct` disclosed; sector exposure computed over known-sector holdings only | `portfolioContext.ts` L101–118 | read in session. Enforced: **Warn** | Same as above: a sector cap can be "passed" while most weight has no sector | **Class 3 → 6** (same decision). |

### D. Liquidity and governance

| Control | Existing capability | Owning component | Current evidence | Gap | Recommendation |
|---|---|---|---|---|---|
| Minimum traded value | **None.** No traded-value/turnover field anywhere in IRR investment code | — | grep `traded` / `turnover` / `liquidity` over `iips-platform/src/investment`, `frontend/server`, `frontend/src`: only `lastTradedPrice` in PIT fixtures | Whole control missing; data not available in IRR | **Class 5/4.** Data must come from IPD market data (daily turnover) — IRR does not own it. New control would live in a new "suitability" block, not in company assessment. |
| Trading liquidity (bid-ask, impact) | None | — | as above | Missing | **Class 5.** Same as above; low priority for a single-user decision-support tool. |
| Promoter pledge | **None.** No field, no flag | — | grep `pledge` / `promoter`: zero hits in code | Missing; needs a shareholding-pattern source | **Class 4 + 6.** Needs a dataset line (operator entry or IPD). Would be a GOVERNANCE risk factor in `assessment/risk.ts`. Threshold is an owner decision. |
| Governance concerns | `RiskFactor.category` includes `GOVERNANCE`, but **no governance dimension is computed**; only `RESTATEMENT_PRESENT` and `DIVIDEND_SOURCE_CONFLICT` flags approximate it | IRR `assessment/risk.ts` (category exists), `assessment/adequacy.ts` (`buildQuality`) | `risk.ts` dimensions: FINANCIAL_LEVERAGE, EARNINGS_QUALITY_CASH_CONVERSION, CAPITAL_ALLOCATION_CAPEX_INTENSITY, REGULATORY_FRAMEWORK, CYCLICALITY only | No auditor-change, related-party, board or pledge inputs | **Class 3 + 6.** Type exists; inputs and rules do not. Owner must define what counts as a governance concern before any code. |
| Regulatory / exclusion list | REGULATORY_FRAMEWORK standing concern by sector (`RISK-REGULATORY-SECTOR`); no exclusion list | IRR `assessment/risk.ts` L316–340 | read in session. Enforced: **Warn** (severity) | No operator exclusion list ("never hold X") | **Class 4 + 6.** An exclusion list is owner policy; could be a second policy file beside `limits-policy.json` — **not** an extension of the current schema (unknown keys are rejected by design). |

### E. Monitoring

| Control | Existing capability | Owning component | Current evidence | Gap | Recommendation |
|---|---|---|---|---|---|
| Limit breaches | Breach is recorded in `limits.applied[].breached` at disposition time; REDUCE trigger strings start with `limits:` / `concentration:` | IRR disposition | `limits.ts` L291, L310; `verbs.ts` limitsBreach check | Only at generation time; no standing breach list | **Class 3.** A "current breaches" read over the latest disposition per holding would need a small read-only report (IRR). |
| Concentration changes | Change comparison dimensions `portfolio.weightPct`, `portfolio.sectorExposurePct`, `portfolio.companyExposurePct`, `portfolio.concentrationBand`, `portfolio.revision` between two stored dispositions | IRR `frontend/server/investment/change/{compare,dimensionMap,materiality}.ts` | dimension ids read from `dimensionMap.ts` | Compares two versions on demand; nothing schedules it | **Class 2/3.** Capability exists; integration into a cadence (S6-2) is missing. |
| Quality deterioration | Hard triggers in S6-1b (`adequacy`, `quality`, `moat`, identity change) force a new disposition version; review triggers `ADEQUACY_DOWNGRADE`, `NEW_HIGH_SEVERITY_RISK`, `RESTATEMENT_PRESENT`, `FRESHNESS_TRANSITION` | IRR `holdingDisposition.ts` `detectHardTrigger`; `change/review.ts` | S6-1b tests (21/21, CI green) | Requires a new assessment version to exist first | **Class 1** (given a new assessment). |
| Valuation changes | `MOS_BAND_CROSSING`, `INTRINSIC_CHANGE_MATERIAL`, `valuation.*` dimensions | `change/review.ts`, `dimensionMap.ts` | read in session | Same: on demand | **Class 2/3.** |
| Review alerts / breach history | Review triggers produce `required`/`priority` and focus questions; persisted versions form history per `reportKey`; **no alert delivery, no schedule, no breach ledger** | IRR change module + reports persistence | `review.ts` header ("a trigger is a question, never an action") | No cadence runner, no inbox | **Class 4** (runner) — this is S6-2's subject. Owner decides cadence (class 6). |

---

## 2. Sector taxonomy — verified reference

Three runtime vocabularies exist. They overlap but are **not** the same set of strings.

| # | Canonical IRR `SectorName` (`iips-platform/src/investment/contracts/operatingMetrics.ts` `SECTOR_NAMES`) | IPO Screening Engine display name / `sectorFamily` (`program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json`, `integration/EngineRegistry.ts`, `cross-sector/population/ScreeningPopulation.ts` `CANONICAL_SECTORS`) | Engine id | Same string? |
|---|---|---|---|---|
| 1 | `Banking` | `Banking` | `sector.banking` | yes |
| 2 | `Insurance` | `Insurance` | `sector.insurance` | yes |
| 3 | `Capital Markets` | `Capital Markets` | `sector.capital-markets` | yes |
| 4 | `Healthcare` | `Healthcare` | `sector.healthcare` | yes |
| 5 | `Hospitality` | `Hospitality` | `sector.hospitality` | yes |
| 6 | `Energy` | `Energy` | `sector.energy` | yes |
| 7 | `Utilities` | `Utilities` | `sector.utilities` | yes |
| 8 | `Consumer` | `Consumer` | `sector.consumer` | yes |
| 9 | `Industrials` | `Industrials` | `sector.industrials` | yes |
| 10 | `Technology` | `Technology` | `sector.technology` | yes |
| 11 | `Telecom` | `Telecommunications` | `sector.telecom` | **no** |
| 12 | `Auto` | `Automobile` | `sector.auto` | **no** |
| 13 | `Materials` | `Materials & Metals` | `sector.materials` | **no** |

**Aliases.** `integration/EngineRegistry.ts` `TAXONOMY_RESOLVED` maps `IT`, `Realty`, `Real Estate` → Technology
engine and `Chemicals` → Industrials engine, but only to **refuse creating a new engine**; the Screening
population (`ScreeningPopulation.ts` `REJECTED_ALIASES`) explicitly **rejects** `IT`, `Chemicals`, `Realty`,
`Real Estate`. **IRR has no alias table at all**: `ingestion/sectorValidation.ts` rejects anything that is not
an exact `SectorName` (it names the correction but never applies it). `Information Technology` appears
**nowhere** in code. So: `Technology ≠ Information Technology ≠ IT` in this system; only `Technology` is valid.

**Unclassified.** The runtime roster loader `identity/sources.ts` L342 substitutes `'UNCLASSIFIED'` when a
roster row has no `sector`, and does **not** validate the value against `SECTOR_NAMES` (only the ingestion CLI
does). A subject with sector `UNCLASSIFIED` therefore gets the `DEFAULT` sector cap, and its exposure is summed
with any other `UNCLASSIFIED` holdings as if that were a sector.

**Runtime labels in portfolio analytics.**
- `frontend/src/features/portfolio/PortfolioWorkspace.tsx` (`/api/portfolio`) shows **CSIP output over the frozen
  v1.1 baseline** (`PF-REAL`, one synthetic company per sector, IDs like `Technology-H1`) — labels are the IPO
  Screening Engine names (`Telecommunications`, `Automobile`, `Materials & Metals`); concentration is
  count-based. **This is not the owner's portfolio** (implementation evidence: `executive-transport.ts` L230–290).
- The owner's portfolio read model (`G2PortfolioView`/`G2HoldingView`) carries **no sector field**. Sector
  for a real holding is resolved only in the disposition path, from the issuer roster via `rosterSector()`
  (`holdingDisposition.ts` L202) and `assessment.subject.sector`.
- `DispositionPanel.tsx` shows the sector exposure the disposition measured; labels are whatever the roster said.

**Supported keys for `sectorMaxPct`** — the canonical IRR sector names:
`Banking`, `Insurance`, `Capital Markets`, `Healthcare`, `Hospitality`, `Energy`, `Utilities`, `Consumer`,
`Industrials`, `Technology`, `Telecom`, `Auto`, `Materials`, plus `DEFAULT`.

How matching actually works, and what this assessment can and cannot say about it (implementation evidence):
- The cap is looked up with `hasOwnProperty(limits.sectorMaxPct, sector)` (`limits.ts` L238), where `sector` is
  the subject's **resolved sector value** (`assessment.subject.sector`, originating from the issuer roster).
  Exact spelling and case matter; there is no normalisation.
- `parseLimitsPolicy` (`limits.ts` L118–140) does **not** validate `sectorMaxPct` keys against `SECTOR_NAMES`;
  any string key with a valid percentage is accepted.
- The runtime roster loader (`identity/sources.ts` L342) does **not** validate roster sector values against
  `SECTOR_NAMES` either (only the ingestion CLI's `sectorValidation.ts` does, at write time).
- Consequence: a key outside the canonical list **may fail to match** any subject without any error being
  raised. Whether a given non-canonical key matches on the owner's host depends on what the host roster
  actually contains, which this assessment did **not** inspect. It is therefore **not** claimed that every
  non-canonical key is guaranteed to be a no-op — only that canonical names are the supported ones, and that
  nothing in the current code would warn if a key and a roster value disagree.

Recommendation (class 6 → then IRR): validate `sectorMaxPct` keys against `SECTOR_NAMES` and warn/fail on
unknown keys. This is a schema-behaviour change, is **not** done here, and remains decision D-3.

---

## 3. Ownership map (which component owns which calculation)

| Layer | Owns | Must not do |
|---|---|---|
| **Company assessment** (IRR `iips-platform/src/investment/assessment/*`, `fundamentals/derive.ts`) | Every per-company number: leverage, cash conversion, capex, ROIC/ROCE/ROE (when added), interest coverage (when added), quality flags, risk factors, governance factors (when defined), dividends, freshness, adequacy | Portfolio weights, caps, verbs, trade sizing |
| **Sector screening engines** (IPO Screening Engine, read-only from IRR: `sector-engines/*`, `cross-sector/*`) | Sector-relative scoring (pillars, verdicts, composite), screening population, frozen baseline analytics | Owner-portfolio exposure, IRR verbs, IRR valuation; must not be modified |
| **Valuation** (IRR `assessment/{intrinsic,margin,policy}.ts`) | Intrinsic range, MoS bands, multiples, method selection | Verb thresholds (those live in `disposition/policy.ts`) |
| **Portfolio analytics / exposure measurement** (IRR `frontend/server/investment/portfolioContext.ts`) | Weight, issuer exposure, sector exposure, top holding, top-five (when added), counts, unmeasured weight, sector-measured weight | Caps, verbs, any score |
| **S6 exposure policy** (IRR `disposition/limits.ts` + `limitsPolicySource.ts`, file `limits-policy.json`) | Cap values and their basis/version/digest; exclusion list (if a second file is authorised) | Measuring anything |
| **Disposition** (IRR `disposition/{engine,gates,verbs,portfolioImplication}.ts`) | Consumes: assessment facts, portfolio facts, resolved limits → gates G-1…G-6, disqualifier, reduction triggers, verb, caps applied, implied band | Re-computing any fundamental or exposure |
| **Monitoring** (IRR `frontend/server/investment/change/*`, S6-1b `detectHardTrigger`, S6-2 cadence — not built) | Comparison, materiality, review triggers, hard triggers, (future) cadence runner and breach ledger | New verbs |
| **Governance & liquidity** (not built; would be a new IRR block, data from IPD/operator) | Pledge, traded value, exclusion checks → feed risk factors / a suitability gate | Valuation or exposure |
| **Trade execution** | **Does not exist and must not** (standing constraint) | — |

What the disposition engine consumes today (implementation evidence `disposition/engine.ts`,
`gates.ts`): `AssessmentFacts` (adequacy, quality verdict, HIGH flags, unresolved max severity, mosVsMid,
deteriorating fundamentals, dividend verdict, netDebtToEbitdaRising, moat class, ROIC spread, new severity ≥ 4
count, sector), `PortfolioFacts` (weightPct, companyExposurePct, sectorExposurePct, topHoldingWeightPct,
revision), `ResolvedLimits` (singleNameMaxPct, sectorMaxPct map, basis, policyVersion, effectiveFrom, digest).
No duplicate calculation was found between assessment and disposition; the only overlapping numbers are
the two MoS threshold tables noted in §1-B (intentional, documented separately).

---

## 4. Missing capabilities and their dependencies

| Missing capability | Depends on | Owning repo | Separate authority needed? |
|---|---|---|---|
| Interest coverage | New line item (finance cost) in dataset schema + ingestion; derived ratio; risk dimension; threshold | IRR | Yes — threshold and schema change |
| Debt-to-equity, ROE, ROCE as explicit items | Existing line items (equity, debt, EBIT) — no new data | IRR | Only for thresholds; computation itself is additive |
| Top-five weight, min-holdings count | Existing `G2PortfolioView` weights | IRR (`portfolioContext.ts`) | Measurement: no; enforcement: yes |
| Unmeasured-weight ceiling | Existing `unmeasuredWeightPct` | IRR (`gates.ts`) | Yes (new gate) |
| Market-cap buckets | Market-cap per security — **IPD** market data or operator dataset | IPD (source) + IRR (consumer) | Yes (IPD boundary + bucket definition) |
| Traded value / liquidity | Daily turnover — **IPD** | IPD + IRR | Yes |
| Promoter pledge | Shareholding pattern — new dataset line or IPD | IPD or operator entry + IRR | Yes |
| Governance dimension | Owner's definition of governance concerns; inputs | IRR | Yes |
| Exclusion list | Second policy document | IRR (new file, new parser; **not** `limits-policy.json`) | Yes |
| `sectorMaxPct` key validation | `SECTOR_NAMES` | IRR (`limits.ts`) | Yes (changes accept/reject behaviour of the policy file) |
| Scheduled review / breach ledger | S6-2 cadence decision; persisted versions | IRR | Yes (cadence is owner's) |
| Per-sector multiples | Owner-approved numbers | IRR `assessment/policy.ts` | Yes |
| Sector-engine verdict inside company assessment | `sectorReference` input exists (`engine.ts` L68) but **nothing populates it** at runtime (`sectorRefId` = `<sector>-UNASSIGNED`) | IRR (consumer only; IPO Screening Engine unchanged) | Design decision: keeping engines separate argues for leaving it unpopulated |

---

## 5. Priorities (recommendation only)

1. **Host-verify S6-1/S6-1b** (PR #622) and decide **F-1** (`CHAIN_PARAMETERS_DRIFT`) — nothing below is
   meaningful until the owner has seen a real disposition with the real policy.
2. **`sectorMaxPct` key safety** — document the 13 exact keys (done in §2; runbook §15.3 example already uses
   `Technology`), then decide D-3 (key validation). Lowest cost; today a key/roster mismatch would raise no
   warning.
3. **Cheap measurement additions with no new data**: `topFiveWeightPct`, debt-to-equity, ROE/ROCE, ROIC
   surfaced from moat. Measurement only; no verb effect until the owner sets numbers.
4. **Unmeasured-weight ceiling** (one gate) — owner decision first.
5. **Interest coverage** — needs a schema line; worth doing in the next dataset revision.
6. **S6-2 cadence + breach/review ledger** — turns existing comparison into monitoring.
7. **Governance / pledge / liquidity / market-cap** — all blocked on data sources outside IRR; schedule after
   IPD can supply them. Do not approximate them from what IRR has.

---

## 6. Stage 6 roadmap — suggested sequence (fits the baseline order; each an owner election)

| Step | Item | Status (evidence) |
|---|---|---|
| S6-1 | Operator limits policy runtime | Code in #622, CI green `8364270`; **host verification pending** |
| S6-1b | Disposition for a real holding | Code in #622, CI green; **host verification pending**; F-1 open |
| S6-1c (new, proposed) | `sectorMaxPct` key validation + runbook table of the 13 keys | Not started; needs authority (schema behaviour) |
| S6-2 | Review cadence recorded; then a read-only "latest disposition + breaches per holding" view | Not started |
| S6-3 | Marico / KEC v1 mints | Not started |
| S6-4 | Second version + first persisted comparison (exercises E-row capabilities) | Not started |
| S6-5 | Operating-metric entry per sector | Not started |
| S6-6 (new, proposed) | Measurement-only additions (top-five, D/E, ROE/ROCE, ROIC surfaced) | Not started; additive |
| S6-7 (new, proposed) | Interest coverage (schema + derive + risk dimension) | Not started; needs schema authority |
| Post-S6 | Governance / pledge / liquidity / market-cap (IPD-dependent) | Blocked on data |

---

## 7. Decisions needed from the owner

| # | Decision | Why it is yours |
|---|---|---|
| D-1 | **F-1**: when the limits policy changes, should an existing `hd:` chain be refused (current behaviour, `CHAIN_PARAMETERS_DRIFT`) or should a new chain / a policy-change version be minted? | Changes chain semantics (IID-4 stable parameters). |
| D-2 | Merge PR #622 after host verification (`runbook §15.6`). | Owner's call per standing instruction. |
| D-3 | Authorise `sectorMaxPct` key validation against the 13 canonical names (fail-closed or warn). | Changes what a policy file is allowed to contain. |
| D-4 | Should `UNCLASSIFIED` be treated as a sector for cap purposes (today: yes, with the DEFAULT cap) or block capped verbs? | Policy meaning. |
| D-5 | Unmeasured-weight ceiling: should ACCUMULATE/INITIATE be unavailable when `unmeasuredWeightPct` > X %? Value of X. | New gate. |
| D-6 | Top-five and minimum-holdings: measure only, or cap verbs? Values. | New controls. |
| D-7 | Thresholds for interest coverage, debt-to-equity, ROE/ROCE (if any enforcement). | Risk appetite. |
| D-8 | Definition of a governance concern and of a pledge threshold; data source (operator entry vs IPD). | Needs data outside IRR. |
| D-9 | Exclusion list: wanted? If yes, as a separate policy document. | Policy. |
| D-10 | Review cadence (S6-2) and whether a breach/review ledger should be persisted. | Routine-use design. |
| D-11 | Should the company assessment ever consume a sector-engine verdict (`sectorReference`), or stay separate? | Engine-separation principle. |

---

## 8. Evidence index (files read in this session)

`iips-platform/src/investment/assessment/{engine,types,policy,risk,moat,margin,intrinsic,dividends,adequacy}.ts`;
`iips-platform/src/investment/fundamentals/derive.ts`; `iips-platform/src/investment/contracts/{lineItems,operatingMetrics,ids}.ts`;
`iips-platform/src/investment/ingestion/sectorValidation.ts`; `iips-platform/src/investment/identity/sources.ts`;
`iips-platform/src/investment/disposition/{engine,gates,verbs,limits,policy,portfolioImplication}.ts`;
`frontend/server/investment/{portfolioContext,holdingDisposition,limitsPolicySource,assessmentComposition,companyDirectory}.ts`;
`frontend/server/investment/change/{compare,dimensionMap,materiality,review}.ts`;
`frontend/server/user-portfolio/userPortfolioContract.ts`; `frontend/server/executive-transport.ts`;
`frontend/server/screener/screener-transport.ts`; `frontend/src/api/{engines,portfolio}.ts`;
`frontend/src/features/portfolio/PortfolioWorkspace.tsx`; `frontend/src/features/investment/DispositionPanel.tsx`;
`iips-platform/src/integration/EngineRegistry.ts`; `iips-platform/src/sector-engines/cross-sector/{population/ScreeningPopulation,portfolio/PortfolioIntelligence,correlation/CorrelationEngine,diversification/DiversificationAnalyzer}.ts`;
`program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json`; `docs/OPERATOR_RUNBOOK.md` §15;
`docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` (Stage 6 definition, §C.13).

**Not inspected / not verifiable here:** the owner's actual roster sector values on the host, the owner's
`limits-policy.json`, IPD internals, `iips-production-market-data` (not readable from this sandbox).
