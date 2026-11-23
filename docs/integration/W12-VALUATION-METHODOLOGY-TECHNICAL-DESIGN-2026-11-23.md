# W12 — Valuation methodology: technical design (2026-11-23)

**Status: TECHNICAL DESIGN ONLY. The three methodology decisions — coverage denominator policy, stale-observation
concession, value-versus-count weighting threshold — remain UNDECIDED. Nothing in this document is an approved policy;
final selection requires actual W05/W06 evidence (B02) and an authorised decision, per the roadmap acceptance clause
("final choices reflect actual data") and GD-4 ("exact thresholds/rounding are technical design choices under the grant,
not preselected facts").**

**Baseline:** readiness record tracker §16.329; W13 mechanism `frontend/server/investment/positionValuation.ts`
(PR #634, tracker §16.328); GD-4 (roadmap decision table): *distinguish count from money; use transparent per-position
value weighting where valid values/coverage permit, document denominator, currencies, time and exclusion rules; withhold
when inputs cannot support it.* Reproducibility vectors: `frontend/server/investment/w12ValuationDesignVectors.test.ts`
(18 deterministic synthetic vectors, all passing against the current W13 implementation — see §8).

---

## 1. Position valuation formula and value-weighting

**Current W13 behaviour (baseline):** `observedMarketValue = round2(quantity × ltp)` per position, from a qualified
observation only (resolved D114 identity + quote present + freshness verdict `GOOD` + `eligibleForUse`).
Position weight (value-weighted) = `observedMarketValue / portfolioObservedTotal`, computable only when a single
currency spans all valued positions.

| Alt | Formula | Advantages | Limitations | W13 impact |
|---|---|---|---|---|
| A (baseline) | `qty × ltp` | independent arithmetic, auditable, matches roadmap "independent arithmetic" | ltp is a point observation; ignores intraday range | none — already implemented |
| B | stored `marketValue` as fallback | always present | **REJECTED**: stored price is a revision fact, not an observed quote (roadmap W13 status line); would fabricate coverage | would break W13's stored-vs-observed distinction |
| C | mid = (bid+ask)/2 or vwap | uses more of the quote | bid/ask are `null` when unavailable (never zero, W-13 dhan rule); vwap optional | would need quote-field policy; defer |
| D | value-weight vs count-weight switch at coverage θ | count weights are computable even with no quotes (CSIP baseline is count-based) | θ is the UNDECIDED threshold; switching silently changes meaning | needs a decision + code; vectors V13–V14 record both computations |

**Design proposal (not approved):** keep A for valuation; compute value-weights only when coverage against the chosen
denominator is known, and always publish the count-based weight alongside (W13 already carries `storedWeightPercentage`
separately). θ remains undecided.

## 2. Coverage denominator and inclusion/exclusion

| Alt | Denominator | Advantages | Limitations | W13 impact |
|---|---|---|---|---|
| A (baseline) | stored active total market value (labelled revision fact) | always defined; ties coverage to the captured revision | stored prices may themselves be stale broker facts | already implemented as `observedCoverageOfStored`, explicitly labelled reference only |
| B | observed valued total | self-consistent with observed values | self-referential: partial coverage looks like 100 %; **rejected as sole denominator** | not implemented, by design |
| C | quantity sum | unit-free | mixes units across securities; meaningless for money | rejected |
| D | total including inactive positions | matches broker statements | inactive rows are excluded from the active portfolio view | not implemented; inactive counted separately (`totals.inactive`) |

**Inclusion/exclusion:** active positions only are valued; inactive are counted and excluded (current). Unresolved
identity → excluded from valuation, counted as `IDENTITY_UNRESOLVED`, never inferred from symbol (W08 rule preserved).
Corporate actions/pending settlements: out of W13 scope, withheld.

## 3. Currency handling and portfolio aggregation

| Alt | Rule | Verdict |
|---|---|---|
| A (baseline) | per-currency totals; single portfolio total only if all valued positions share one currency; mixed → `mixedCurrencies: true`, `observedMarketValueTotal: null` | **keep** — never sums unlike units |
| B | FX conversion to a base currency | **REJECTED for now**: no qualified FX observation source exists (would fabricate); revisit only if W06 qualifies an FX observation |

## 4. Valuation timestamp and time alignment

Current W13 carries three timestamps per observation — provider `asOf`, `receivedAt`, and the read's `evaluatedAt` —
plus the capture's `capturedAt` and revision binding. No cross-position "latest" or "as-of portfolio" alignment is
computed.

| Alt | Rule | Verdict |
|---|---|---|
| A (baseline) | per-position observation timestamps retained verbatim; report `evaluatedAt` is the read time | keep — no silent time mixing |
| B | align all positions to the oldest/newest `asOf` in the revision | rejected: hides skew; the freshness verdict per identity is IPD-owned and already decides usability |

Freshness threshold itself is IPD-owned (DHAN-P5 verdicts GOOD/STALE/UNAVAILABLE/UNKNOWN); IRR consumes the verdict
verbatim and never upgrades it.

## 5. Partial, missing, stale and unknown observations

Current W13 closed vocabulary: `OBSERVATION_MISSING` (quote absent), `OBSERVATION_UNREADABLE`, `NOT_VALUED_STALE`,
`NOT_VALUED_UNAVAILABLE`, `NOT_VALUED_UNKNOWN` (= no observation exists, distinct from stale), `NOT_VALUED_STATUS_UNREADABLE`
(never treated as fresh), `IDENTITY_UNRESOLVED`, `POSITION_INACTIVE`, `VALUED`.

| Decision point | Options | Status |
|---|---|---|
| Stale concession | value nothing on STALE (baseline) vs value STALE with a disclosed haircut/discount | **UNDECIDED** — no concession is implemented; IPD's `staleConcessionActive` is echoed, never acted on |
| Unknown vs unavailable | kept distinct (current) | keep |
| Partial coverage | report `observedTotalIsPartial: true` and never present the observed total as the portfolio total | keep |

## 6. Explicit withheld and unvalued outcomes

Unvalued active positions contribute `null` (unknown), never zero (GD-4 "withhold when inputs cannot support it";
roadmap "no fabricated zero"). Every report carries `openMethodologyDecisions` naming the three undecided areas, so no
reader can mistake the provisional denominator for policy.

## 7. W13 compatibility summary

- Already supported by `positionValuation.ts`: A-formula, stored-labelled denominator (Alt 2-A), per-currency no-sum,
  timestamp retention, full partial/stale/unknown vocabulary, null-not-zero, revision-bound fail-closed reads,
  deterministic clock-injected reports.
- Requires change only after a decision: θ threshold switch (1-D), any stale concession (5), FX base conversion (3-B).
- Dependent on actual evidence (W05/W06/B02): any final threshold, any claim of live coverage, W13 acceptance.

## 8. Synthetic reproducibility vectors

`frontend/server/investment/w12ValuationDesignVectors.test.ts` — 18 deterministic vectors (injected fake readers,
fixed clock `2026-11-23T10:00:00Z`, capture `DHAN_PORTFOLIO` rev 1 digest `17b2b283…`): V1 fully qualified single position
(10 × 250.5 = 2505, divergence vs stored 2400 = 105); V2 two positions one identity (one read pair per identity);
V3 unresolved identity (no reads); V4 quote missing (stored not promoted); V5 STALE; V6 UNKNOWN; V7 unreadable status;
V8 read error code carried; V9 inactive counted/excluded; V10 partial portfolio (coverage 3505/4800 = 73.02 % vs stored,
partial flag); V11 nothing valued → null totals; V12 mixed currencies → per-currency totals, null total; V13 zero quantity
→ true zero valued; V14 negative quantity → negative observed value (documented short-position behaviour, inclusion rule
undecided); V15 distinct asOf per position retained; V16 byte-identical reruns; V17 malformed input refused;
V18 alternatives table (count-weight vs value-weight computed side-by-side as data, not behavior). All 18 pass against the
current implementation (run 2026-11-23, offline vitest harness; full targeted cluster 17 files / 355+18 = 373 tests pass).

## 9. Boundaries observed

IRR-only, additive; no IPD change; no live vendor request; no host access; synthetic fixtures only, labelled synthetic;
the three decisions stay UNDECIDED; no W13 acceptance is claimed; W05/W06/B05 statuses unchanged (§16.329).
