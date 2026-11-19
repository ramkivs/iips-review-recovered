# G-9 / L-033 — IPD calendar dependency: IRR consumption boundary assessment

**Record date:** 2026-11-19 (UTC).
**Repository / branch:** `ramkivs/iips-review-recovered` / `arena/fe76d26e-iips-review-recovered` (base `1a0e3fc7a843b199c3baecb4f4e617172d802d58`).
**Workstream:** IID Stage 4, G-9 / L-033. **Disposition: L-033 remains `OPEN`; no status, policy or runtime change.**

## 1. Dependency named by the owner (not re-requested)

The owner identifies an already-implemented, already-merged exchange-calendar capability in the *other* repository
`ramkivs/iips-production-market-data`:

- authoritative branch `main`, merge commit `6b50f0686e033e3d03cb8995d137e862cbf9068c`;
- calendar artifact `calendars/ipd-equity-2026.v2026-11-19.2.json`.

This record does **not** ask the owner to supply that calendar again. It records what can and cannot be established
from this repository and this session before any IRR runtime change. IPD was not modified and is not to be modified.

## 2. Read-only verification attempted, and its exact limit

The following read-only attempts were made against the named commit/artifact; none produced the artifact bytes:

| Attempt | Result |
|---|---|
| `git clone https://github.com/ramkivs/iips-production-market-data.git` | HTTP 403, `Write access to repository not granted` |
| `gh api repos/ramkivs/iips-production-market-data/commits/6b50f068…` | HTTP 403, `Resource not accessible by integration` |
| `curl https://api.github.com/repos/ramkivs/iips-production-market-data/commits/6b50f068…` | HTTP 403, same message (session `GH_TOKEN` is scoped to `iips-review-recovered`) |
| GitHub commit page and raw artifact page (page fetcher) | fetch failed; anonymous `curl` of the commit page returned HTTP 404 |
| `codeload.github.com/ramkivs/iips-production-market-data/tar.gz/6b50f068…` | HTTP 404 |
| npm registry lookups for the project/package names | HTTP 404; no published copy found |
| Local workspace, git objects on all refs, and the published L-033 PR branch tree | no copy of `ipd-equity-2026.v2026-11-19.2.json` or any calendar artifact |

Consequently the artifact's **identity bytes, SHA-256, schema/exports, exchange and segment coverage, session dates,
holidays, exceptional closures, special sessions and version/provenance metadata cannot be inspected or verified here**.
This is an access limitation of this session, **not** a claim that the IPD capability is absent, incomplete or invalid.
No calendar content was inferred from the file name, and no substitute calendar was constructed.

## 3. Why the artifact alone would not establish IRR consumption

Independent of access, the current IRR assessment path has no calendar seam:

- `iips-platform/src/investment/assessment/margin.ts` — `PriceAlignmentInput` has no calendar/identity field;
  `selectPrice()` subtracts UTC calendar dates via `daysBetween()`, and `priceMaxAgeDays` is a plain number.
- `iips-platform/src/investment/fundamentals/types.ts` — `PriceRecord` carries `securityId`, `asOf`,
  `source: 'PIT_D01' | 'DATASET_EOD'` and `sourceRef`, but **no exchange/market segment or calendar identity**.
  A `sourceRef` cannot be used to infer a calendar (the owner decision forbids it).
- `iips-platform/src/investment/assessment/engine.ts` — the only production call to `selectPrice()` (line ~213)
  supplies no calendar; `iips-platform/tests/investment/assessment-price.test.ts` pins a seven-calendar-day age test.
- The base tree contains no calendar artifact and no IRR calendar input contract; the only IPD package pins in
  `frontend/package.json` / `frontend/package-lock.json` point to the **older** commit `1ce6a829…`, are scoped to
  the frontend transport, and are not an input to `assessCompany()`.
- The existing L-033 record (`docs/integration/IID-L033-FIVE-TRADING-DAYS-OWNER-DECISION-2026-11-17.md`, published on
  PR #597 at `45dea1c`, not on this branch) sets the five resumption items: authoritative versioned session source with
  coverage; deterministic security/observation → calendar mapping; observation/assessment date and timezone convention;
  exact five-session inclusivity plus fail-closed handling of non-sessions, missing coverage and unknown identity;
  reproducible identity/provenance. None of those items is satisfied by an unreadable artifact.

Therefore the previous "no authoritative calendar was established *in the inspected repository*" finding is **not
overturned** by an unverifiable external reference; it is refined to "a calendar is asserted to exist in IPD, but no
authorised, reproducible IRR consumption boundary has been verified".

## 4. Smallest necessary dependency, and the stop boundary

The smallest dependency that would permit the five-trading-session rule to be implemented in IRR is:

1. An authorised, reproducible supply of the **exact bytes** of
   `calendars/ipd-equity-2026.v2026-11-19.2.json` at IPD `6b50f0686e033e3d03cb8995d137e862cbf9068c`, pinned by
   source commit plus SHA-256 and provenance metadata, made available to IRR without a runtime network lookup
   (a digest-pinned local copy or an equivalent declared read boundary). The artifact must be inspected before it is
   trusted: identity, exchange/segment coverage, coverage dates, holidays, exceptional closures, special sessions.
2. An explicit security/price-observation → calendar mapping carried as data in the IRR assessment input, with
   fail-closed behaviour for absent/unknown calendar identity or out-of-coverage dates. No `sourceRef` inference.
3. The exact counting convention recording observation-day and assessment-day treatment, market timezone, close
   handling, boundary inclusivity and date-only/timestamped cases, reconciled with IPD's own semantics.

Until those are available, implementing session counting, bumping `mos-policy/1.0.0`, or adding five-session acceptance
tests would require inventing either calendar data or its semantics. Per the owner's stop instruction, **runtime work
stops here**. The unchanged runtime still uses seven calendar days; that is an openly recorded non-compliant state,
not an approved fallback.

## 5. Disposition of this record

- Option A (five trading days) remains the settled owner choice; it is not reopened.
- L-033 stays **`OPEN`**: choice settled, implementation blocked at the verified IRR consumption boundary.
- G-9 stays the baseline crosswalk; no new backlog item, no R3/R-6.4/Dhan re-adjudication.
- No product code, tests, config, dependencies, dataset, policy version or limitation status were changed by this
  assessment. No calendar was duplicated, fabricated, or approximated with weekdays or seven calendar days.
- PR #597 remains open and unmerged; this record does not modify or merge it. No change was made in IPD.
