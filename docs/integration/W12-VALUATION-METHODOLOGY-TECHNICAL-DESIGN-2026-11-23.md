# W12 — Valuation methodology: technical design (2026-11-23)

**Status: TECHNICAL DESIGN ONLY. The three methodology decisions — coverage denominator policy, stale-observation
concession, value-versus-count weighting threshold — remain UNDECIDED. Nothing in this document is an approved policy;
final selection requires actual W05/W06 evidence (B02) and an authorised decision, per the roadmap acceptance clause
("final choices reflect actual data") and GD-4 ("exact thresholds/rounding are technical design choices under the grant,
not preselected facts").** *Amended 2026-11-24: §10 reconciles this design with the authoritative roadmap's Section K
monetary-coverage requirements (signed value vs gross exposure, unrounded gate arithmetic, `C`/`t`/alignment); §11
completes the evidence-independent methodology work (D1–D3 examined alongside Section K; new test specs V19–V24).
The amendments select no decision and change no code; D1–D3 remain UNDECIDED. §12 defines the W12–W20 valuation
interface contract (W13 report → W20 Section K gate).*

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

---

## 11. Evidence-independent methodology completion (2026-11-24) — D1–D3 examined alongside the Section K reconciliations

**Status: TECHNICAL DESIGN / DOCUMENTATION ONLY, completed to the extent possible without new W05/W06 portfolio
evidence.** No code is changed by this section; it specifies methodology and test specifications. Every choice that
genuinely requires evidence or an owner decision is left open with its exact dependency recorded. Authoritative basis:
the W12 roadmap row (IPD `84e988b…`, quoted in tracker §16.329: deliverable = *"practical value-weighting formula,
denominator, inclusion, currency, time alignment and partial/stale policy plus vectors, within GD-4"*; acceptance =
*"reproducible arithmetic, clear distinction count/monetary weighting and honest withheld cases; final choices reflect
actual data"*; *"Ready: technical design now; final feasibility depends on W05/W06. No new approval cycle."*), GD-4, and
Section K (roadmap L364–368 population/gate, L374–380 monetary coverage; IRR-held blob `7affba55…` at IPD `26855625…`).

**Classification legend used below:** **[R]** already explicitly established by the authoritative roadmap (W12 may
restate it as methodology now) · **[S]** specifiable now from existing repository evidence, no new portfolio evidence
needed · **[E]** genuinely requires W05/W06 actual evidence (B02) · **[O]** genuinely requires an explicit owner/PA
decision · **[W13]** conditional W13 implementation implication (only after a recorded decision).

### 11.1 Gross exposure (Section K) — non-negative, |quantity|-based, no long/short netting

| # | Statement | Class |
|---|---|---|
| 1 | Monetary-coverage exposure is **non-negative gross exposure computed from absolute quantity**: `grossExposure = \|quantity\| × price`, per position, per currency. Long and short positions must **not** net. | [R] Section K L374–380 |
| 2 | The signed position value (`quantity × ltp`, V14) and the gross exposure are **two distinct outputs computed from the same qualified observation** (resolved identity + quote present + freshness `GOOD` + `eligibleForUse`); neither substitutes for the other. | [S] — follows from [R] + the existing W13 qualification gate |
| 3 | An unqualified position (any non-`VALUED` status) has **unknown** exposure: `null`, never `0`; it **remains in the denominator population** `E` (counted), and an exact denominator is **blocked unless reliably established**. | [R] Section K L364–368 |
| 4 | Instrument units/multipliers: applicable units/multipliers **must be accounted for** in exposure; no multiplier source exists in the repository today, so the specified treatment is: **no multiplier is applied; any future multiplier must come from a governed reference source and be recorded** — the parameter itself is open. | [R] requirement + [E] the actual unit/multiplier values (need W04 identity + reference data) |
| 5 | **Specifiable now (no W13 change needed for the gate):** `ValuedPosition` already carries `quantity` and `observation.ltp`, so W20 can compute `\|quantity\| × ltp` and the unrounded products **from the existing report fields** — one computation owner (W20 for the gate; W13 stays the producer of the qualified observation). A W13-side `grossExposure` presentation field is optional and conditional. | [S] + [W13] |
| 6 | Test specs: **V19, V20** below. Existing coverage: V14 covers the signed negative value only; it does not test gross exposure (no duplication). | [S] |

### 11.2 Unrounded monetary gate arithmetic (Section K) — rounding is presentation-only

| # | Statement | Class |
|---|---|---|
| 1 | Gate evaluation uses **unrounded** values; rounding applies **only for presentation** (roadmap quote: *"round only for display and evaluate the unrounded ratio"*). | [R] Section K; IRR-held quote in `W05-ROADMAP-RECONCILIATION-2026-11-17.md` §8 |
| 2 | **Precision boundary (specified now):** W13's `round2` at `positionValuation.ts` L315/L337 is **presentation rounding**. The gate inputs are the unrounded per-position products `quantity × ltp` and their unrounded sums (`N`, `D`, `N / D`). Presentation values remain `round2` of the unrounded aggregates. No additional precision/scale rules are introduced. | [S] |
| 3 | `\|E\| = 0` → gate result **not applicable / W20 blocked, never 100 %** (roadmap quote). | [R] |
| 4 | Denominator population `E` for the monetary gate = **all active positions of the captured revision** bound to the report (unknown-exposure positions included, counted — see 11.1 #3). The observed-value sum is **never** the gate denominator (self-referential; already rejected as sole denominator in §2 Alt B). | [S] from [R] Section K population rules |
| 5 | The **value of `θM`** is unestablished (`θI/θF/θA/θM` are the roadmap's unestablished thresholds; `θF` precedent: set from observed evidence under the standing grant, gates W20, fail-closed until then). | [E] W05/W06 actual evidence; no value asserted |
| 6 | W20 must evaluate the gate on the unrounded sums of the **same eligible population and same captured revision** as the report, and must not compute exposure inconsistently with the producer (single-computation rule from §10.2: W20 consumes the report's `quantity`/`ltp` or a W13-exposed unrounded field verbatim — never a second rounding path). | [R]+[S]; [W13] only if an unrounded field is exposed |
| 7 | Test specs: **V21, V22** below. Existing coverage: V1 checks per-position `round2` presentation arithmetic only; no vector tests aggregate/gate behavior under rounding (no duplication). | [S] |

### 11.3 Reporting currency `C`, valuation instant `t`, alignment (Section K) — IPD freshness ownership unchanged

| # | Statement | Class |
|---|---|---|
| 1 | The report must **record** a reporting currency `C` and a valuation instant `t`, and the alignment/freshness policy must be documented, including acceptable quote/FX observation ages and time zones. | [R] Section K L374–380 |
| 2 | **Specifiable now:** `C` = the single currency of all valued positions when exactly one currency spans them; when mixed, `C` is recorded as **not singular** (null/multi) with the per-currency breakdown — never a fabricated converted total (consistent with §3 Alt A/B and V12). All timestamps are recorded in UTC (ISO-8601 `Z`), which is the specified time-zone convention. | [S] from existing repo behavior |
| 3 | **Specifiable now:** `t` (valuation instant) is recorded on the report; the baseline candidate is the report's own read time `evaluatedAt` (the captured revision's read). **Alignment** means: each position's observation `asOf` is retained verbatim (retention — already V15) **and** the report states each observation's age relative to `t` (`t − asOf`); no observation is re-timestamped and no cross-position "latest asOf" portfolio timestamp is invented. Retention ≠ alignment: V15 proves retention only. | [S] from [R]; the choice of `t` among candidates (read time vs aligned observation time) is [O] |
| 4 | Acceptable quote/FX observation ages (max age at which an observation may contribute to the gate at `t`) and any FX conversion for mixed `C`: **open parameters** — they require W06 actual freshness/observation evidence and (for FX) a qualified FX source (none exists; §3-B rejected until W06 qualifies one). No age limit or conversion is invented. | [E] W06/B02 |
| 5 | IPD continues to own freshness verdicts and provider-specific semantics; IRR consumes verdicts verbatim and never upgrades. Nothing in this section adds an IRR freshness rule. | [R] boundary, unchanged |
| 6 | Test specs: **V23, V24** below (V15 already covers retention — V23 adds only the alignment metadata; V12 already covers mixed-currency aggregation — V24 adds only the `C` recording). | [S] |

### 11.4 D1 — coverage denominator policy: interaction with Section K (remains UNDECIDED)

- [R] GD-4/roadmap: document the denominator; distinguish count from money; withhold when inputs cannot support it. Section K fixes the **gate** denominator rule (population `E`, unknowns included, unrounded, `|E|=0` → N/A) — see 11.2 #3–#4; the observed-total sole denominator is rejected (self-referential, §2 Alt B).
- [S] The W13 **presentation** denominator alternatives are already enumerated (§2 A–D) with the stored-active reference implemented and labelled.
- [E][O] The **final** D1 choice "reflects actual data" (roadmap acceptance clause) → requires W05/W06 actual evidence (B02) and an authorised decision. **D1 remains UNDECIDED**; exact dependency: W05 source-rights completion + W06 actual qualified observations over `DHAN_PORTFOLIO` rev 1 (B02 host access), then owner decision.
- [W13] Any denominator change is a W13 report-shape change, only after that decision.

### 11.5 D2 — stale-observation concession: interaction with Section K (remains UNDECIDED)

- [R]+[S] Specifiable now without evidence: a STALE observation contributes **nothing to the qualified numerator** (current baseline, V5) **but the position stays in the denominator population `E`** (Section K: unqualified/unknown stays in the population). No stale concession is implemented; `staleConcessionActive` is echoed only.
- [E][O] Whether any concession (discount/haircut) may ever apply to qualified exposure: requires W06 actual staleness evidence and an explicit owner decision. **D2 remains UNDECIDED**; dependency recorded as above.
- [W13] None now; any concession needs code + vectors after the decision.

### 11.6 D3 — value-vs-count weighting threshold θ: separate from Section K `θM` (remains UNDECIDED)

- [R] GD-4/roadmap acceptance: **clear distinction count vs monetary weighting** — settled methodology: count weights and value weights are always published side-by-side as data (V18 does this); no silent switch.
- [S] The switch **mechanism** (value weights when coverage against the chosen denominator is known; count weights always alongside) is already the design proposal of §1.
- [E][O] The threshold **value** θ (coverage at which count-based presentation replaces/joins value-based) "reflects actual data" → needs W05/W06 evidence + owner decision. **D3 remains UNDECIDED.** `θM` (Section K's mandatory monetary-coverage threshold, gates W20) is **not** D3 and is not set either (11.2 #5) — the two are never conflated.
- [W13] V18 already records both weightings as data; a θ-driven behavior change is conditional on the D3 decision.

### 11.7 New test specifications for Section K-established requirements (specs only — not implemented in this pass)

Each spec is deterministic against the existing `measurePositionValuation` harness (injected fake readers, fixed clock
`2026-11-23T10:00:00.000Z`, capture `DHAN_PORTFOLIO` rev 1 digest `17b2b283…`). "Expected" is given wherever the
authoritative requirements determine it; "cannot yet be specified" is stated where they do not.

- **V19 — gross exposure without long/short netting [R]:** positions qty `+10` ltp `250.5` (stored 2400) and qty `−2` ltp `100`
  (stored −200), same currency, both `VALUED`. Expected (determined): signed value total = `2505 − 200 = 2305`; gross exposure
  per position = `2505` and `200`; **gross exposure total = 2705**; `grossTotal ≥ \|signedTotal\|`; no netting. Computed by
  W20 from report `quantity`/`observation.ltp` (11.1 #5) — expected gate numerator (unrounded) = `2705`.
- **V20 — unqualified position stays in denominator population [R]:** one `VALUED` position (+10 × 250.5) and one `NOT_VALUED_STALE`
  position. Expected (determined): qualified gross numerator `N = 2505`; population `E = 2` (the STALE position is counted,
  contributes `null` exposure — never 0); ratio is partial-flagged, **not 100 %**; STALE is not in `N` (11.5 baseline).
- **V21 — unrounded gate arithmetic vs presentation rounding [R]:** three `VALUED` positions, qty `1` × ltp `0.125` each
  (per-position product `0.125`; `round2(0.125) = 0.13`). Expected (determined): gate inputs unrounded — `N = 0.375`;
  sum-of-rounded would be `0.39` and must **not** be used; presentation total = `round2(0.375) = 0.38`. The three values
  (`0.375` gate, `0.38` presentation, `0.39` naive) must be distinguishable in the report/gate path.
- **V22 — empty denominator population [R]:** zero active positions on the captured revision. Expected (determined): `|E| = 0` →
  gate result **not applicable / W20 blocked, never 100 %**.
- **V23 — alignment metadata distinct from retention [R]+[S]:** two `VALUED` positions with different `asOf` (as in V15) and
  recorded `t = evaluatedAt = 2026-11-23T10:00:00.000Z`. Expected (determined): each `asOf` retained verbatim (retention —
  already V15, not duplicated); report additionally records `t` and per-position age `t − asOf` (`120 min`, `30 min`) in UTC;
  no observation re-timestamped; no invented portfolio-level "as-of" price time. *Not yet specifiable:* whether an observation
  older than the (unset) maximum age may contribute at `t` — depends on 11.3 #4 [E].
- **V24 — reporting currency `C` recorded [R]+[S]:** single-currency report → `C = 'INR'` recorded on the report; mixed-currency
  report → `C` recorded as not singular with per-currency breakdown (aggregation behavior already V12; V24 adds only the
  explicit `C` field). Expected (determined) for the single-currency case; for mixed, no converted total is fabricated.
  *Not yet specifiable:* FX conversion to a single `C` for mixed portfolios — needs a qualified FX observation [E] (§3-B).
- **Cannot-yet-specified expected outcomes (recorded, not guessed):** the W20 gate open/closed verdict at `θM` (θM unestablished,
  11.2 #5 [E]); any stale-concession effect (D2 [E][O]); the final D1 denominator choice [E][O]; the alignment max age and
  `t` choice among candidates [E]/[O]; instrument multipliers [E].

### 11.8 Existing vectors V1–V18 — coverage map (no duplication)

V1 per-position presentation arithmetic · V2 one read pair per identity · V3 unresolved identity · V4 stored not promoted ·
V5 STALE not valued (D2 baseline) · V6 UNKNOWN distinct · V7 unreadable never fresh · V8 read error carried · V9 inactive
excluded/counted · V10 partial coverage flag + `observedCoverageOfStored` · V11 null-not-zero totals · V12 mixed currency
per-currency · V13 true zero · V14 **signed** negative value (gross exposure covered only by new V19/V20) · V15 timestamp
**retention** (alignment metadata covered only by new V23) · V16 reproducibility · V17 fail-closed malformed input ·
V18 count/value weights as data (D3 disclosure rule). New specs V19–V24 add only the Section K-determined behaviors above.

### 11.9 Responsibility separation (W12 / W13 / W20 / IPD) — consolidated

- **W12 (this document):** owns the methodology — gross-exposure definition, precision boundary, population rule `E`,
  `C`/`t` recording and alignment policy, D1–D3 framing. Settled here: everything marked [R]/[S]. Open here: everything
  marked [E]/[O], with exact dependencies recorded (11.4–11.6).
- **W13 (`positionValuation.ts`, PR #634):** unchanged in this pass. Conditional future changes, each only after a recorded
  decision: a presentation `grossExposure` field (else W20 computes from existing fields — 11.1 #5); exposure of unrounded
  per-position products (else W20 computes from `quantity` × `observation.ltp` — 11.2 #6); explicit `C`/`t`/age fields
  (11.3 #2–#3); any D1/D2/D3-driven behavior.
- **W20:** acceptance — evaluates the monetary gate on **unrounded** `N`/`D`/`N/D` over the **same eligible population `E` and
  same captured revision**, non-negative gross exposure, `|E| = 0` fail-closed, recorded `C`/`t` policy applied, `θM` set from
  observed evidence under the standing grant (fail-closed until then).
- **IPD:** freshness verdicts and provider semantics — unchanged, never overridden by IRR.

### 11.10 Boundaries

Documentation/design only: no code or test file changed in this pass; no D1–D3 selection; no W13 change; no IPD change
or freshness-behavior change; no operator-side evidence collection; no live vendor request; no host access; no acceptance
claim. Evidence status carried unchanged from §16.329/§16.342: W05 IN PROGRESS — NOT ACCEPTED; W06 PARTIAL — NOT ACCEPTED
(mechanism delivered + synthetic-tested; actual measurement blocked on B02, numerator bounded ≤ 1/64 by W04); B05
COMPLETE/VERIFIED at its own scope. Tracker record: §16.343.

---

## 12. W12–W20 valuation interface contract (design, 2026-11-24) — W13 report → W20 Section K monetary-coverage acceptance

**Status: INTERFACE CONTRACT DESIGN ONLY.** This section defines the consumption contract between the existing W13
producer (`frontend/server/investment/positionValuation.ts`, PR #634, schema `iips.w13.position-valuation/v1`) and the
W20 acceptance gate, per Section K (roadmap L364–368 population/gate, L374–380 monetary coverage; IRR-held blob
`7affba55…` at IPD `26855625…`) and §10–§11 of this document. **No code changes; no decisions selected; no acceptance
claimed.** W20 remains `BLOCKED / NOT ACCEPTED` (`θF`/`θM` unestablished, B02).

### 12.1 Input contract — the exact W13 report fields W20 consumes

W20 consumes `PositionValuationReport` (and refuses the fail-closed outcome `{ ok: false, code, message }` —
`MALFORMED_POSITIONS`, `TOO_MANY_ROWS`, invalid `CapturedRevisionRef` — with the W13 refusal code carried verbatim):

| Field | Shape | W20 use |
|---|---|---|
| `schema` | `'iips.w13.position-valuation/v1'` | version check; any other schema → refuse, never adapt silently |
| `capture` | `CapturedRevisionRef` = `{ portfolioId, revision: integer, provenanceDigest, capturedAt (UTC ISO-8601) }` | **binds acceptance to this exact captured revision** (same-population/same-revision rule); echoed on every output |
| `evaluatedAt` | UTC ISO-8601 read time of this report | baseline candidate for valuation instant `t` (§12.5) |
| `positions[]` | `PositionValuationEntry[]` | per-holding audit source (§12.6) |
| `positions[i].rowId` | opaque row label | audit key |
| `positions[i].securityId` | `string \| null` (stored D114 identity) | resolved-identity flag; `null` → `IDENTITY_UNRESOLVED`, no observation exists |
| `positions[i].status` | closed vocabulary: `VALUED`, `IDENTITY_UNRESOLVED`, `OBSERVATION_UNREADABLE`, `OBSERVATION_MISSING`, `NOT_VALUED_STALE`, `NOT_VALUED_UNAVAILABLE`, `NOT_VALUED_UNKNOWN`, `NOT_VALUED_STATUS_UNREADABLE`, `POSITION_INACTIVE` | qualified vs unknown-exposure classification (§12.2); consumed verbatim, never re-derived |
| `positions[i].quantity` | signed number (instrument units as stored in the revision) | gross-exposure input: `\|quantity\|` |
| `VALUED` only: `observedMarketValue` | `round2(quantity × ltp)` — **presentation** value | signed value for divergence/P&L-style display only; never a gate input |
| `VALUED` only: `currency` / `observation.quoteCurrency` | currency code | `C` determination (§12.5) |
| `VALUED` only: `observation` | `QualifiedObservation` = `{ securityId, quoteCurrency, ltp, asOf, receivedAt, evaluatedAt, freshnessVerdict, providerQualification, lineageHash, sourceClassification }` | **gate price input `ltp`**; timestamps and **IPD freshness verdict consumed verbatim** (§12.5); provenance echoed on the audit record |
| unvalued: `observedMarketValue: null`, `currency: null`, `observation: QualifiedObservation \| null`, `readError` | | unknown exposure = `null`, never `0` |
| every entry: `storedCurrentPrice`, `storedMarketValue`, `storedWeightPercentage`, (`storedDivergence` when valued) | revision facts | labelled reference only; never promoted to observed |
| `totals` | `{ positions, active, inactive, valued, unvaluedActive, identityUnresolved, observedMarketValueTotal (null unless single currency), perCurrency[], mixedCurrencies, storedActiveMarketValue, storedActiveWeightPct, observedCoverageOfStored (labelled reference only), observedTotalIsPartial }` | population `E` = `active` count; cross-checks only — **W20 recomputes gate arithmetic from per-position fields, never from these presentation totals** |
| `openMethodologyDecisions` | readonly string[] (D1/D2/D3) | echoed on W20 output; W20 never resolves them |

Producer-side input (for completeness): `PositionValuationInput` = `{ rowId, companyId, exchangeSegment?, securityId?, quantity, storedCurrentPrice, storedMarketValue, storedWeightPercentage, active }` — one row per holding of the captured revision. One quote + one freshness read per resolved identity, shared across positions of the same security.

### 12.2 Gross exposure derivation (Section K)

- **Qualified position** (`status === 'VALUED'`): `grossExposure_i = \|quantity_i\| × observation.ltp_i`, **unrounded**, in `observation.quoteCurrency`. Long and short positions both contribute positively — **no netting**; the signed `observedMarketValue` is retained separately and is never netted into exposure. (`ltp < 0` would be malformed → refuse the report, fail-closed.)
- **Unqualified active position** (any status other than `VALUED`, incl. `IDENTITY_UNRESOLVED`, `OBSERVATION_MISSING/UNREADABLE`, `NOT_VALUED_STALE/UNAVAILABLE/UNKNOWN/STATUS_UNREADABLE`): exposure is **unknown** — represented `null` with the status as reason; **never `0`**; the position **remains in population `E`**.
- **`POSITION_INACTIVE`**: excluded from the active population `E` (counted separately, per V9 / `totals.inactive`); not in `N`, not in `D`.
- **Aggregation:** `N = Σ grossExposure_i` over VALUED positions, **per currency only**; if `totals.mixedCurrencies` is true there is **no single `N`/`D`** — per-currency results only, no fabricated converted total.

### 12.3 Precision — unrounded gate inputs, presentation rounding kept separate

- Gate inputs are the **unrounded** per-position products: signed `p_i = quantity_i × ltp_i`; gross `g_i = \|quantity_i\| × ltp_i`. `N = Σ g_i`, `D = Σ_{i ∈ E} g_i` (exact only when every active position is valued — see §12.6), ratio `N / D` — **all unrounded** (Section K: "round only for display and evaluate the unrounded ratio").
- W13's `round2` outputs (`observedMarketValue`, `observedMarketValueTotal`, `observedCoverageOfStored`, …) are **presentation**; W20 does not consume them for the gate.
- **Single-computation rule:** W13 owns observation qualification and produces `ltp`/`quantity`; W20 owns gate arithmetic and computes `g_i`, `N`, `D`, ratio unrounded from those report fields. Exposure is never computed in two places with different rounding. Presentation values shown to users = `round2` of the unrounded aggregates (V21 distinguishes gate `0.375` / presentation `0.38` / naive `0.39`).
- `\|E\| = 0` → gate result **NOT_APPLICABLE** (W20 blocked), never 100 %.

### 12.4 Units and multipliers

- The existing data model supports **quantity in stored instrument units** and **price per unit** (`ltp`, in `quoteCurrency`). There is **no unit/multiplier factor field** in `PositionValuationInput`, `QualifiedObservation`, or the report.
- Specified now: no multiplier is applied by default; exposure is `\|quantity\| × ltp` as stored.
- Still required (precise gap): a governed **instrument unit/multiplier factor** keyed by resolved `securityId`, with source and asOf — e.g. `instrumentUnitMultiplier(securityId) → { factor, source, asOf } \| null`. Until such a source exists, any position whose instrument unit ≠ 1 cannot be exactly exposed: its exposure is **unknown (unit/multiplier not established)**, it stays in `E` with `null` exposure, and an exact denominator is blocked — consistent with Section K's unknown-in-population rule. The multiplier source itself is [E] (needs W04 identity + reference data) and its use policy is [O].

### 12.5 Valuation context — `C`, `t`, timestamps, alignment policy; IPD freshness stays authoritative

- **`C` (reporting currency):** if all VALUED positions share one `quoteCurrency`, `C` = that currency and is recorded on the W20 output; if `mixedCurrencies`, `C` is recorded as **not singular** and results are per-currency — no FX conversion (none qualified; §3-B rejected until W06 qualifies an FX observation).
- **`t` (valuation instant):** recorded on every W20 output; baseline candidate = report `evaluatedAt` (the captured revision's read time). Final choice among candidates is [O]; until decided, `t = evaluatedAt` is the documented default.
- **Timestamps:** per position, `observation.asOf` (IPD provider), `receivedAt`, `evaluatedAt`, plus capture `capturedAt` and report `evaluatedAt` — all retained verbatim, UTC ISO-8601 `Z`. **Alignment** = recording `t` and each position's age `age_i = t − asOf_i` (computed in UTC); observations are **never re-timestamped** and no portfolio-level "as-of price time" is invented. Retention (V15) ≠ alignment (V23).
- **Alignment/freshness policy parameters:** acceptable maximum observation age at `t`, and any FX observation age — **open parameters [E]**, requiring W06 actual freshness evidence; not set here.
- **IPD freshness verdicts are authoritative inputs:** W20 consumes `observation.freshnessVerdict` (`GOOD`/`STALE`/`UNAVAILABLE`/`UNKNOWN`/unreadable) and the W13 status verbatim; only `VALUED` (which requires verdict `GOOD` + `eligibleForUse`) contributes to `N`. W20 **never re-derives freshness, never upgrades a verdict, and adds no IRR freshness rule** — IPD owns verdicts and provider-specific semantics.

### 12.6 Acceptance output — W20 per-holding audit record, aggregates, coverage result

- **Per-holding audit record:** `{ rowId, securityId, status, quantity, grossExposure (unrounded number) | null, unknownReason (status/unit-multiplier), signedObservedValue (round2 presentation), currency, observation: { asOf, receivedAt, evaluatedAt, freshnessVerdict, providerQualification, lineageHash, sourceClassification } | null, ageAtT (t − asOf, UTC) | null, inPopulationE (bool), unitMultiplier: { factor, source, asOf } | 'NOT_ESTABLISHED' }` — plus the bound `capture` (`portfolioId`, `revision`, `provenanceDigest`, `capturedAt`) on the report-level output.
- **Aggregates (per currency `C` when singular; else per-currency list):** `|E|` (active population), `valuedCount`, `unknownExposureCount`, `N` (unrounded Σ gross), `D` (exact unrounded Σ over `E` **only if every active position is valued and no unit/multiplier is missing**, else `null`), ratio `N / D` unrounded when `D` exact, presentation `round2(ratio)`, `mixedCurrencies` flag, `t`, `C`, `θM` status (`UNESTABLISHED` until set from observed evidence).
- **Coverage result vocabulary (closed):** `PASS` / `FAIL` against `θM` **only** when `θM` is established AND `D` is exact AND `|E| > 0`; otherwise **`BLOCKED`** with explicit reason codes — `EMPTY_POPULATION` (`|E| = 0` → not applicable, never 100 %), `DENOMINATOR_INDETERMINATE` (unknown exposure or missing multiplier in `E`), `THETA_M_UNESTABLISHED`, `NO_SINGLE_CURRENCY`, `SCHEMA_OR_REFUSAL` (W13 refusal code carried). Unavailable or indeterminate results are **never** presented as a percentage or as 100 %; `openMethodologyDecisions` (D1–D3) are echoed on the output.

### 12.7 Test readiness — V19–V24 against this interface

All six specs from §11.7 are **implementable now** as pure functions over the existing `PositionValuationReport` (synthetic fixtures via the existing `measurePositionValuation` harness; no W13 change needed because `quantity` and `observation.ltp` are already report fields):

| Spec | Interface fields used | Implementable now? |
|---|---|---|
| V19 gross no-netting (+10×250.5, −2×100 → signed 2305 vs gross 2705) | `quantity`, `observation.ltp`, `status` | **yes** |
| V20 unknown stays in `E` (STALE counted, null exposure, N=2505, not 100 %) | `status`, `totals.active` | **yes** |
| V21 unrounded gate (0.375) vs presentation (0.38) vs naive (0.39) | `quantity`, `observation.ltp` (unrounded) | **yes** — needs the W20-side unrounded path per §12.3 |
| V22 `\|E\| = 0` → NOT_APPLICABLE, never 100 % | `totals.active` | **yes** |
| V23 alignment metadata: `t = evaluatedAt`, ages 120/30 min, `asOf` verbatim | `evaluatedAt`, `observation.asOf` | **yes** (default-`t` rule §12.5); max-age enforcement **no** [E] |
| V24 `C` recorded (single 'INR'; mixed → not singular) | `observation.quoteCurrency`, `totals.mixedCurrencies` | **yes**; FX conversion **no** [E] |

**Not implementable yet (exact blockers):** gate PASS/FAIL at `θM` (θM unestablished [E]); stale-concession effect (D2 [E][O]); final D1 denominator (W13 presentation denominator [E][O]; note the **gate** denominator rule is already fixed by §12.3/§12.6); max observation age (W06 [E]); `t` final choice ([O]; default specified); instrument multipliers (reference source [E], policy [O]); W20 acceptance itself (B02 actual revision + θM/θF evidence).

### 12.8 Responsibility separation (consolidated, unchanged in substance)

**W12** owns methodology and this interface contract. **W13** owns the producer: observation qualification, the report schema, fail-closed refusals — unchanged by this contract; optional future presentation fields (`grossExposure`, unrounded value, explicit `C`/`t`/age fields) only after a recorded decision, and never required for the gate because the raw fields suffice. **W20** owns acceptance: gate arithmetic per §12.3–§12.6, the audit output, θM/θF application from observed evidence. **IPD** owns freshness verdicts and provider semantics — authoritative inputs, never overridden.

### 12.9 Boundaries

Documentation/design only: no code or test file changed; no D1–D3/θM decision; no W13 change; no IPD or freshness-behavior change; no operator-side evidence collection; no live vendor request; no acceptance claim. Evidence status unchanged (§16.329/§16.343): W05 IN PROGRESS — NOT ACCEPTED; W06 PARTIAL — NOT ACCEPTED (B02-blocked, ≤ 1/64 via W04); B05 COMPLETE/VERIFIED at its own scope. Tracker record: §16.344.

### 12.10 Implementation note (2026-11-24)

The contract above is now implemented W20-side as the pure function
`evaluateMonetaryCoverageGate` in `frontend/server/investment/w20MonetaryCoverageGate.ts` (+ 17 synthetic tests,
V19–V24 and boundary cases — record: `docs/integration/W20-MONETARY-COVERAGE-GATE-SYNTHETIC-IMPLEMENTATION-2026-11-24.md`).
The implementation reads only existing W13 report fields — **no W13 change was needed**, confirming §12.7. The
implementation is synthetic-verified only; it is not W20 acceptance, sets no θM, and decides nothing. D1–D3, θM,
max-age, `t` choice and multipliers remain open exactly as recorded in §11/§12. Tracker: §16.345.
