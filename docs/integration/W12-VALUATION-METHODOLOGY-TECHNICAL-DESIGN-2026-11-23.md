# W12 — Valuation methodology: technical design (2026-11-23)

**Status: TECHNICAL DESIGN ONLY. The three methodology decisions — coverage denominator policy, stale-observation
concession, value-versus-count weighting threshold — remain UNDECIDED. Nothing in this document is an approved policy;
final selection requires actual W05/W06 evidence (B02) and an authorised decision, per the roadmap acceptance clause
("final choices reflect actual data") and GD-4 ("exact thresholds/rounding are technical design choices under the grant,
not preselected facts").** *Amended 2026-11-24: §10 reconciles this design with the authoritative roadmap's Section K
monetary-coverage requirements (signed value vs gross exposure, unrounded gate arithmetic, `C`/`t`/alignment). The
amendment selects no decision and changes no code; D1–D3 remain UNDECIDED.*

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

---

## 10. Amendment 2026-11-24 — reconciliation with the roadmap's Section K monetary-coverage requirements (design only)

**Status of this section: TECHNICAL DESIGN / DOCUMENTATION ONLY.** It reconciles this design with the authoritative
roadmap's Section K monetary-coverage requirements. It does **not** select D1–D3, does **not** change W13, does **not**
modify IPD or IPD freshness behavior, and claims no acceptance.

**Authoritative source.** IPD `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` — IRR-held read-back blob
`7affba55a5ba568333fdc2961a322c2f76b4c671` (SHA-256 `875938b087bca87415c5215283967049d331d609383095ecc93adfe7e5e98e89`)
at IPD `main` `2685562522f1a2fd1d745a7857f771bf21453315` (recorded in `W05-ROADMAP-RECONCILIATION-2026-11-17.md` §1;
live re-read from this sandbox returns HTTP 403 — single probe, not cached). Line references: **W12 lines 206–207;
W13/W14 lines 209–213; Section K lines 374–380; population and gate requirements lines 364–368.** Corroborating
IRR-held Section K quotes already on record: *"round only for display and evaluate the unrounded ratio"*;
*"`|E| = 0` gives not applicable / W20 blocked, never 100 %"* (eligible population `E`; `W05-ROADMAP-RECONCILIATION-2026-11-17.md` §8);
the roadmap's unestablished thresholds are `θI`, `θF`, `θA`, `θM` (`W05-ACTUAL-FINANCIAL-DATASET-QUALIFICATION-2026-11-12.md`),
with `θF` the portfolio-wide financial ratio that gates W20.

### 10.1 Signed position value is not Section K's monetary-coverage exposure

W13's current `observedMarketValue = round2(quantity × ltp)` (`positionValuation.ts` L315) is a **signed position-value
calculation**: a negative quantity yields a negative observed value (vector V14), so long and short positions net against
each other. Section K's monetary-coverage **exposure** instead requires a **non-negative gross exposure computed from the
absolute quantity** (`|quantity| × price`), and long/short positions must not be netted in a way that hides exposure.

Clarifications recorded here (design only):

- The existing design does **not** yet define the treatment of instrument units or multipliers beyond Section K's
  requirement that applicable units/multipliers be accounted for. No unit/multiplier rule is invented here.
- Unqualified quantity, price, currency, identity, or freshness cannot be silently turned into a qualified exposure.
  Section K keeps **unknown exposure in the denominator population** and **blocks an exact denominator** unless the
  denominator is reliably established — consistent with this design's null-not-zero and withheld-outcome rules (§6),
  but distinct: the population rule is Section K's, not something W13 currently computes.
- **Responsibility boundary:** W12 owns this methodology distinction (this document). W13 may need a **separate
  gross-exposure output or calculation** — only after the W12/W20 data boundary is specified; no such output exists today
  and none is added now. W20 applies and evidences the coverage gate.
- **Test gap:** vector V14 verifies that a negative quantity yields a negative *signed* value; it does **not** verify
  non-negative gross exposure. No vector computes `|quantity|`-based exposure.

### 10.2 Presentation rounding is not gate arithmetic

W13 currently rounds **each position's** `quantity × ltp` to two decimals (`round2`, `positionValuation.ts` L171–172, L315)
and then aggregates the **rounded** per-position values (L337 sums rounded entries; L341–342 round totals again).
Section K requires **unrounded** values for monetary coverage-gate evaluation, with rounding applied **only for
presentation** (roadmap quote above).

Clarifications recorded here (design only):

- Existing vector V1 checks a simple per-position arithmetic result (`round2(quantity × ltp)`); **no vector tests
  aggregate/gate behavior where per-position rounding changes `N`, `D`, or `N / D`** — i.e. the precision boundary's
  effect on the gate is unverified.
- W12 should specify the **precision boundary**: which values are retained unrounded, which are rounded for display.
  W13 may need to retain or expose unrounded inputs/results if the gate consumes them. **W20 must evaluate the gate using
  unrounded values.** If W20 computes its own gate input, the interface must be defined so the same exposure is not
  calculated inconsistently in two places (one computation, one owner per value; the other side consumes it verbatim).
- No additional precision, scale, or rounding rules are invented beyond the requirement: **unrounded gate values, rounding
  for presentation only.**

### 10.3 Reporting currency `C`, valuation instant `t`, and alignment — without taking IPD freshness ownership

Section K requires choosing and **recording** the reporting currency `C` and the valuation instant `t`, and establishing a
**documented alignment/freshness policy**, including acceptable quote/FX observation ages and time zones.

Clarifications recorded here (design only):

- W13 currently retains per-position timestamps (`asOf`, `receivedAt`, read `evaluatedAt`) and consumes IPD freshness
  verdicts verbatim (this design §4), but it does **not** establish an as-of portfolio and does **not** align observations to
  a selected `t`. Vector V15 verifies timestamp **retention** only; it does not demonstrate compliance with a chosen
  alignment policy.
- **Responsibility boundary:** W12 owns the methodology for choosing and documenting `C`, `t`, and the alignment policy.
  W13 may implement the chosen consumer behavior (only after a recorded decision). W20 records and verifies its application.
- **IPD continues to own its freshness verdicts and provider-specific semantics.** No IRR rule overrides an IPD verdict;
  nothing here adds or implies one.
- **No observation-age limit or time-zone rule is invented.** These are parameters that require evidence (W05/W06/B02)
  and an explicit methodology decision; they are listed as open parameters, not set.

### 10.4 Interaction with the UNDECIDED decisions D1–D3 (still UNDECIDED)

- **D1 (coverage denominator policy)** intersects the eligible-exposure denominator and unknown exposures: Section K's
  population rule (unknown exposure stays in the denominator population; exact denominator blocked unless reliably
  established) constrains whatever denominator D1 selects. D1 remains UNDECIDED.
- **D2 (stale-observation concession)** intersects whether a STALE observation may contribute to qualified exposure; no
  concession is implemented and `staleConcessionActive` is only echoed. D2 remains UNDECIDED.
- **D3 (value-vs-count weighting threshold θ)** is **separate from the mandatory Section K `θM`**. They are not conflated
  here, and neither threshold is invented or set: `θM` is a roadmap threshold that W20 evidences; D3 is this design's
  undecided presentation/weighting switch. D3 remains UNDECIDED.

### 10.5 What the existing code and vectors do and do not verify

Supported bounded behavior (unchanged by this amendment): per-position signed arithmetic V1; partial-coverage flag V10;
true zero for zero quantity V13; signed negative value V14; per-position timestamp retention V15; byte-identical reruns V16;
side-by-side count/value weights as data V18; `positionValuation.ts` null-not-zero, closed partial/stale/unknown vocabulary,
per-currency no-sum, revision-bound fail-closed reads.

**Not verified by any existing code or vector:** non-negative `|quantity|`-based gross exposure; netting prohibition at
portfolio level; units/multipliers accounting; unrounded aggregate/gate arithmetic (N, D, N/D under per-position rounding);
chosen and recorded `C` and `t`; any alignment/freshness policy application; denominator population including unknown
exposures; the `θM` gate; empty-denominator behavior of the monetary gate (`|E| = 0` → not applicable / W20 blocked).

### 10.6 Responsibility boundary (W12 / W13 / W20 / IPD)

- **W12 (this document):** owns the methodology — signed value vs gross exposure, precision boundary, `C`/`t`/alignment
  policy, denominator population rule interaction with D1–D3. Design only; decisions await W05/W06 evidence and an
  authorised decision.
- **W13 (`positionValuation.ts`):** owns the current mechanism. Any change (gross-exposure output, unrounded-value
  retention/exposure, chosen `C`/`t` consumer behavior) is **conditional on a recorded methodology decision** and, for the
  data boundary, on the specified W12→W13/W20 interface. No W13 change is made by this amendment.
- **W20:** applies and evidences the coverage gate — same eligible population and revision, non-negative gross exposure,
  **unrounded** gate arithmetic, recorded `C`/`t` policy, `|E| = 0` fail-closed.
- **IPD:** owns freshness verdicts and provider-specific semantics. Unchanged; no IRR override.

### 10.7 Boundaries and evidence status (carried from §16.329, unchanged)

Documentation/design only: no D1–D3 selection; no W13 change; no IPD modification and no IPD freshness-behavior change; no
operator-side evidence collection; no live vendor request; no host access; no acceptance claim. Evidence status carried
forward: **W05 IN PROGRESS — NOT COMPLETE, NOT ACCEPTED; W06 PARTIAL — NOT ACCEPTED** (read-only revision-bound mechanism
delivered and synthetic-tested; actual quote/freshness measurement over `DHAN_PORTFOLIO` rev 1 **blocked on B02** host
access, numerator bounded ≤ 1/64 by W04 identity coverage); B05 COMPLETE/VERIFIED at its own scope. These evidence gaps
defer the final methodology decisions; they do **not** mean the technical design or the W13 mechanism is absent — both
exist and are cited above. Tracker record: §16.342.
