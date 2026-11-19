# G-9 / L-033 — Option A selected; implementation blocked by calendar evidence

**Record date:** 2026-11-17 (UTC).  
**Application owner:** Ramki.  
**Repository / branch:** `ramkivs/iips-review-recovered` / `arena/5461e5b5-iips-review-recovered`.  
**Verified remote baseline:** `fdd31f67c49f456cccbf1de7f1c24db7de9f6c65`, tree `6a7ede7c3d3fb40d0d8fa69f8ee8b3b1379e857a`; PR #597 OPEN.  
**Outcome:** owner policy choice recorded; runtime implementation STOPPED at the explicit calendar prerequisite. **L-033 remains OPEN.**

## 1. Owner instruction and scope

The application owner explicitly instructed in this task:

> Ramki has explicitly selected Option A: retain the five-trading-day price-freshness rule specified in design R-6.4.

The same instruction requires an authoritative calendar/counting mechanism, forbids a fabricated calendar or a calendar-day approximation, and directs stopping the affected implementation if that mechanism cannot be established. This record implements the documentary part of that instruction, not the runtime rule. The five-trading-day choice is settled; asking the owner to choose A/B again is unnecessary.

G-9 stays a baseline crosswalk to existing L-033, not a new backlog item. R3 statement-age capability, its 200/250-day policies, unrelated limitations and Stage-4 acceptance are unchanged. This does not authorize changes in IPD or the Dhan workstream.

## 2. Recheck and exact blocker

The remote branch and PR head were rechecked at the baseline above. All **4,080 remote blobs** matched the recovered working files; none were missing or mismatched. With no staged work, the local branch/index was advanced to that fetched baseline without changing working-file content. No unrelated recovered work was discarded.

Read together:

- [Original L-033, register §16.4](IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md#164-l-033--freshness-window-design-says-five-trading-days-code-uses-seven-calendar-days), introduced in `accf9c1055d5aa301ecae93f075f8c4c9676ca7e`, lines 1163–1180 at baseline.
- [Design R-6.4](IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md#r-6-data-freshness-and-price-alignment), baseline lines 1661–1678: five trading days, but no named exchange calendar, coverage/version contract, session exceptions or counting convention.
- `iips-platform/src/investment/assessment/policy.ts:212–217`: seven calendar days; `assessment/margin.ts:23–85`: no calendar input and UTC calendar-date subtraction; `assessment/types.ts:24–28`: `mos-policy/1.0.0`.
- `iips-platform/src/investment/fundamentals/types.ts`, `PriceRecord`: security and source reference, but no exchange-calendar identifier; `assessment/engine.ts:213–220`: no calendar supplied to `selectPrice`.
- `iips-platform/tests/investment/assessment-price.test.ts:35–73`: current refusal/guard tests; the age test asserts a seven-day window, not trading sessions.
- [Dhan roadmap D-3](DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md#d-3--decide-freshness-semantics-for-market-closed-periods), baseline lines 148–155: calendar source and ageing rule are decision work. W-22, lines 472–479, proposes introducing a versioned local calendar input; it is not delivered calendar evidence.
- [Dhan progression assessment](DHAN-W06-ROADMAP-PROGRESSION-ASSESSMENT-2026-11-15.md), baseline line 57: no accepted calendar/ageing rule established in that inspected scope. This is corroborating context, not a newly imposed dependency on completing Dhan/IPD work.

**Blocker:** no authoritative exchange-session calendar or trading-day counting mechanism was established in the current remote repository. Recursive remote-tree inspection found no calendar/holiday-named artifacts; content inspection of platform, frontend server, tools, design/decision records and relevant evidence found calendar-date helpers and future calendar proposals, not a sourced exchange calendar. Path-name absence alone is not the basis of the finding. No external exchange calendar was acquired or independently authenticated in this task; no claim of nonexistence outside the repository is made.

A generic weekday counter, an unsourced holiday list, a package's built-in calendar or the observed price dates alone would not establish the missing authority and completeness. No such substitute was introduced.

## 3. Counting specification and evidence needed before runtime work can resume

No new production counting convention is adopted without the calendar prerequisite. The resumption package must establish:

1. The authoritative exchange/market-segment session source and a retained, identifiable version with provenance and coverage dates, including holidays, exceptional closures and special weekend sessions.
2. Deterministic mapping from the selected security/price observation to that calendar. Do not assume all NSE/BSE observations share a calendar or infer an exchange from an arbitrary sourceRef.
3. Explicit observation-date and assessment-date treatment: market timezone, whether observation day is excluded, whether an assessment-day session counts before/after close, and how date-only observations and timestamped assessments are handled.
4. Exact five-session boundary inclusivity and handling of non-session observation dates, missing/out-of-range calendar coverage and unknown calendar identity. Unknown calendar coverage must not silently become weekday arithmetic or seven calendar days.
5. Reproducible calendar identity/provenance sufficient to re-evaluate the same assessment later without a changing live holiday lookup.

The threshold remains the owner's **five trading days**; the items above operationalize it rather than reopen Option A. A supplied authoritative versioned calendar, or an existing authoritative mechanism with demonstrable coverage and semantics, can unblock this work. No new committee or approval ceremony is required.

Once established, implement the rule and reconcile R-6.4 with the exact counting convention; version the changed MoS policy semantics; test within/exactly five/over five sessions, weekends, exchange holidays, exceptional sessions, future observations, knowledge cutoff, security selection and corporate-action safeguards. No such implementation or new-rule acceptance claim is made now.

## 4. Validation actually performed

- `npm ci --ignore-scripts --prefix iips-platform`: PASS, six packages, zero vulnerabilities; dependency definitions/lockfile unchanged.
- From `iips-platform`: `node_modules/.bin/tsx --test tests/investment/assessment-price.test.ts tests/investment/assessment-view.test.ts`: **17 tests PASS**, zero failed/skipped. These are regressions for the unchanged runtime, not proof of five-trading-day behavior. No exchange-holiday, exact-five-session or new future-price acceptance tests were fabricated while the prerequisite is missing.
- Publication preflight verifies relative document links, preserved original L-033 text, unchanged design/source/tests/lockfiles, and `git diff --check`. Exact commit/tree/changed remote blobs and CI result are to be reported in the existing PR after publication.

## 5. Disposition

- **Owner choice:** Option A — retain design R-6.4's five-trading-day rule — explicitly selected.
- **Runtime:** unchanged and still uses seven calendar days; it is **not compliant with the selected rule**. This is an openly recorded implementation blocker, not an approved fallback.
- **Policy version:** remains `mos-policy/1.0.0` only because no runtime semantics changed; a future implementation must version the changed semantics.
- **L-033:** **OPEN — owner choice settled, implementation blocked by authoritative calendar/counting prerequisite**.
- **G-9:** same baseline crosswalk, not a new numbered task. R3, other limitations and Stage-4 acceptance unchanged. No resolution or owner acceptance of the divergence is inferred.
