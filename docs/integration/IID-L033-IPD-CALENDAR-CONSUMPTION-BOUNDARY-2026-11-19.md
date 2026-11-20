# G-9 / L-033 — IPD calendar consumption in IRR: boundary, implementation and remaining evidence limit

**Record date:** 2026-11-19 (UTC).
**Repository / branch:** `ramkivs/iips-review-recovered` / `arena/fe76d26e-iips-review-recovered` (base `1a0e3fc7a843b199c3baecb4f4e617172d802d58`).
**Workstream:** IID Stage 4, G-9 / L-033. **Disposition: L-033 remains `OPEN` — the five-trading-session rule is
implemented and fail-closed, but the exact IPD artifact bytes have not been verified from this session, so the
limitation is not closed.**

## 1. Dependency named by the owner (not re-requested)

The owner identifies an already-implemented, already-merged exchange-calendar capability in the *other*
repository `ramkivs/iips-production-market-data`:

- authoritative branch `main`, merge commit `6b50f0686e033e3d03cb8995d137e862cbf9068c`;
- calendar artifact `calendars/ipd-equity-2026.v2026-11-19.2.json`.

IPD was not modified and is not to be modified. The calendar content was subsequently made available in-session
as an owner-supplied extract, and that extract is the semantic basis for the implementation below. This record
does **not** ask the owner to supply the calendar again.

## 2. What could and could not be verified

Read-only access to IPD from this session failed on every route attempted (git clone/smart-HTTP 403, GitHub API
403 "Resource not accessible by integration", TLS resets on raw hosts, 404s on codeload/npm mirrors). Those
failures are access limits of this session, not evidence about IPD. Consequently:

- **Verified from the owner-supplied extract:** artifact identity `IPD-EQUITY-2026-BOUNDED`, version
  `2026-11-19.2`, schema 1; continuous coverage only for `NSE_EQ` and `BSE_EQ`, `2026-11-01`–`2026-11-19`;
  explicit day rows including the exceptional OPEN Sunday session `2026-11-08` (Diwali Muhurat), the CLOSED
  holiday `2026-11-10` (Diwali-Balipratipada), ordinary weekend closures, and November 7/14 mock sessions that
  are **not** live trading; sparse annual-holiday evidence that explicitly does not extend continuous coverage;
  outside explicit rows, coverage is `UNKNOWN/UNAVAILABLE` with no weekday inference, no elapsed-time fallback
  and no cross-venue fallback.
- **Not verified:** the exact artifact bytes at commit `6b50f068…` and their SHA-256. Pasted text is not treated
  as verified bytes. The digest the IRR code computes is the canonical digest of the calendar object a caller
  supplies; it is evidence of *which object was consumed*, not proof of the IPD file's byte identity.

## 3. The consumption boundary now implemented in IRR

`iips-platform/src/investment/assessment/exchangeCalendar.ts` is the seam. The engine stays pure (no I/O): the
caller supplies the calendar artifact it has pinned, plus an explicit `PriceCalendarBinding`
(security, exchange, segment, optional listing). Before any session is counted, the module validates:

- schema version 1 and non-empty calendar id/version, plus any caller-pinned expected id/version
  (`PRICE_CALENDAR_IDENTITY_MISMATCH` on mismatch);
- optional provenance shape (repository, artifact path, 40-hex commit, `sha256:` digest when asserted);
- exactly one continuous-coverage interval for the bound exchange/segment, with a usable source list;
- every date inside that interval has exactly one explicit day row for the bound exchange; OPEN rows carry
  valid same-day sessions, CLOSED rows carry none; duplicate/malformed rows refuse. Sparse rows outside the
  interval never extend coverage.

Mapping is deterministic and never inferred: the segment must belong to the exchange (`NSE→NSE_EQ`,
`BSE→BSE_EQ`); when dataset listings are supplied, the binding must match an active `EQ`/`EQUITY` listing of
the assessed security at the observation date (a dual-listed security such as Infosys has both an NSE and a BSE
listing, so listings alone cannot choose the calendar — the caller that sourced the price must say which
exchange segment the observation belongs to). Exchange identity is never derived from a price `sourceRef`.

Counting convention: price and assessment timestamps convert to Asia/Kolkata calendar dates; the observation
date itself is not counted; each OPEN date after it through and including the assessment date counts once;
the maximum is **five** trading sessions (`VALUATION_POLICY.freshness.priceMaxAgeTradingSessions = 5`,
`mos-policy/1.1.0`). An exceptional OPEN row counts; weekends, mock-only days and holidays do not.

Fail-closed behaviour — no weekday inference and no seven-calendar-day fallback survives anywhere:

| Condition | Refusal |
|---|---|
| no calendar binding supplied | `PRICE_CALENDAR_UNAVAILABLE` |
| pinned id/version mismatch | `PRICE_CALENDAR_IDENTITY_MISMATCH` |
| invalid artifact/provenance | `PRICE_CALENDAR_INVALID` / `PRICE_CALENDAR_PROVENANCE_INVALID` |
| observation or assessment date outside continuous coverage | `PRICE_CALENDAR_COVERAGE_UNAVAILABLE` |
| wrong security, wrong segment, unverifiable listing | `PRICE_CALENDAR_MAPPING_UNAVAILABLE` |
| price dated on a non-session date | `PRICE_ON_NON_SESSION_DATE` |
| more than five sessions elapsed | `PRICE_OUTSIDE_POLICY_WINDOW` (`PRICE_STALE`) |

The pre-existing guards are unchanged: knowledge-cutoff (`PRICE_PREDATES_KNOWLEDGE_CUTOFF`) and
unadjusted-price-across-corporate-action refusals still apply, and statement freshness
(`freshness-policy/1.0.0`, P&L/balance-sheet day windows) is a separate mechanism that was not touched.
Every `MarginOfSafetyBlock` emitted under `mos-policy/1.1.0` carries the `priceFreshness` evaluation
(calendar id/version/digest, mapping, both exchange-local dates, counted sessions), and the assessment
records a limitation whenever freshness is unavailable for a reason other than having no price at all.
`PriceRecord` was deliberately not given an exchange field: that would have changed canonical dataset
content/digests across ingestion for a fact the caller already knows.

Callers that do not supply a binding — today that includes the frontend artifact generator and the demo
pipeline — now have their prices refused fail-closed. Wiring a pinned IPD calendar into those callers is
deliberate follow-on work, not something this change smuggles in.

## 4. Tests and validation (2026-11-19)

- New `iips-platform/tests/investment/assessment-calendar.test.ts` (14 tests) pins the boundary on the
  bounded IPD-shaped fixture: exactly five sessions accepted; the sixth refused across the 2026-11-10 holiday
  and the 14–15 weekend; the exceptional Sunday 2026-11-08 session counts; mock Saturdays do not; holiday and
  weekend price dates refuse; an assessment on a closed date counts zero; `2026-11-18T19:30:00Z` ages as
  Asia/Kolkata date 2026-11-19; NSE and BSE bindings count independently; and the fail-closed cases (no
  binding, identity mismatch, outside coverage, sparse rows not extending coverage, segment/security
  mismatch, listing verification, digest stability).
- `assessment-price.test.ts` now asserts `mos-policy/1.1.0`, the five-session stale boundary
  (2026-11-09 → 2026-11-18 = 6 sessions) and `priceFreshness` evidence on accepted prices.
- Two historical regression controls were rebaselined for exactly this policy change and say so in place:
  the S4-R3 payload digest (the only movement is the emitted `priceFreshness` block) and the IX
  authorized-policy package comparison (L-034/L-036 reproduce member-for-member; only the MoS-derived V2
  fields and structural digests differ, and the IX generator no longer substitutes a zero price when
  computing a band).
- Full IID suite: `npm run test:iid` — **1665/1665 passing**. TypeScript: `tsc --noEmit` — clean.
  `git diff --check` — clean.

## 5. Disposition

- Option A (five trading days) remains the settled owner choice; it is not reopened.
- The runtime is now compliant with R-6.4's five-trading-session rule **when a caller supplies a valid,
  in-coverage calendar binding**, and refuses the price otherwise. The seven-calendar-day rule is gone.
- L-033 stays **`OPEN`** for one exact, repository-evidenced reason: the consumed calendar's identity rests
  on the owner-supplied extract, not on verified IPD bytes. Closing L-033 requires (a) byte-level
  verification of `calendars/ipd-equity-2026.v2026-11-19.2.json` at `6b50f068…` (SHA-256 against the pinned
  commit) through an authorised IRR supply route, and (b) a production caller actually wiring that pinned
  artifact as a binding. Neither is claimed here.
- PR #597 remains open and unmerged; nothing in this work modifies or merges it. No change was made in IPD.
  No duplicate calendar was created in IRR — the only calendar-shaped data in this repository is test
  fixtures, labelled as such.
