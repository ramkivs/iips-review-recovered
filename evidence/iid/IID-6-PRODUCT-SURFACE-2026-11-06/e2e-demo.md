# IID-6 — the end-to-end workflow, as it exists after this phase

This is the demonstration the surface supports **today**, in this repository, with the fixtures that exist. It is
written so that a reader can reproduce it and can see exactly where it stops. Every step below is a **read**: the
data was produced by the operator CLIs in earlier phases, and no step in this list writes anything.

> Synthetic data only. The demonstration issuer is a synthetic reference company (`L-004`), no real issuer has been
> assessed (`L-009`), and the sector engines cover 3 of 13 sectors (`L-001`, hence R-16 still open).

## 0. Produce the stored artifacts (operator, outside the browser)

```bash
cd frontend
npm run build:broker-import          # alias materialisation the app needs before typecheck/tests
npx vitest run server/investment     # 199 tests: the store, the transports, the change engine
npx tsx server/investment/cli/m1-demonstration.ts            # IID-3 assessment chain (v1, v2)
npx tsx server/investment/cli/disposition-demonstration.ts   # IID-4 held + candidate dispositions
```

The first two commands are the phase's own regression gate. The last two write into the governed store through the
existing NP-04 record path; they are operator tools and are **not** reachable from the browser.

## 1. Portfolio → holding (G-2 surface, extended)

Open `/user-portfolios`, choose the demonstration portfolio
(`src/features/user-portfolios/UserPortfolioDetail.tsx`).

For each holding:

- **Resolved** (`identityStatus: RESOLVED` with an ISIN): the row shows the portfolio facts it always showed, plus
  *Disposition* (verb, confidence, withheld flag) and *Company, candidate and history* (three links).
- **Unresolved / no ISIN**: the disposition cell reads
  `not available — identity unresolved, so no disposition is keyed`, and the link cell reads
  `not available — no resolved identity to link`. No identity is derived from a company id or a symbol.
- **Dispositions unreadable** (503): every row reads `not available — disposition read unavailable`, and the rest of
  the page is unaffected.

## 2. Holding → company (`/investment/company/:issuerId?portfolioId=…&securityId=…`)

The company page renders, in order:

1. **Identity banner** — issuer id, sector and subsegment, reporting currency, fiscal year end, scope token, chain
   root, model/policy versions, `dataAsOf` and `knownAsOf`, dataset version and class, staleness in days, identity
   binding references, adequacy and quality badges. The four badges are words, not colours.
2. **Version history** — every stored version with its `dataAsOf` and payload digest; selecting `v1` issues
   `GET /api/investment/company/…/versions/r-1` and re-renders exactly that version.
3. **Fundamentals and periods** — reported and derived values per period, each with its basis, and each absent value
   with its reason (`NOT_REPORTED`, `NOT_COMPUTABLE`).
4. **Assessment adequacy** — the basis bullets and the table of missing required fields with reasons.
5. **Valuation** — intrinsic range per share, spread, methods considered with the withheld ones named, margin of
   safety (price, as-of, vs mid, vs low, band, or the refusal reason), and the sensitivity grid.
6. **Confidence components and caps** — data, model, combined, the cap list, and the formula in force.
7. **Risk, dividends and moat** — the taxonomy grouped by category with counts and highest severity, the material
   factors, the dividend verdict with its withheld inputs, and the moat classification with its spread.
8. **Assumptions and consumed inputs** — discount rate and its components, terminal growth, horizon, policy version,
   and the method-specific assumptions.
9. **Evidence and provenance** — evidence entries with sources and filing dates, plus the freshness statement.
10. **Sector-level reference intelligence** — the `aside`, with the sector engine's verdict and composite, the
    statement that it is not company-specific and not an input, and the link to `/research/company/<sector>`.
11. **Disposition** — the held panel when the URL carries portfolio + security context; otherwise an explicit
    statement that no context was supplied, with links to the portfolios and coverage pages.
12. **Change history** — the timeline (below).
13. **Limitations and disclosures** — the limitation identifiers carried by the envelope, the payload's own
    limitation prose, and the read-only disclosure.

## 3. Disposition (inside step 2, or `/investment/candidate/:securityId`)

Held: verb badge, definition, confidence, horizon, rationale table with `SUPPORTS`/`COUNTERS` per row, falsifiers,
the gates evaluated, the limits in force (policy, basis, digest, caps, and each applied limit with measured /
projected / breached), the portfolio context it was measured against, the implication with its band basis, the review
date and armed triggers, evidence, and the not-an-instruction line.

Withheld: "Withheld — no verb was produced", the reasons, and the unmet inputs. No verb is inferred.

Candidate: `CANDIDATE — no position`; no quantity, no current weight, no projected weight; the payload's
`NOT_APPLICABLE` / `POLICY_INPUTS_UNAVAILABLE` reasons instead; a list of what the page cannot do, including that
insufficient evidence is never a default `AVOID_CANDIDATE`.

## 4. Change history

The timeline lists consecutive pairs newest first. Selecting a pair shows:

- the classification in words, and what it does **not** mean (a `FRESHNESS_TRANSITION` is explicitly "not a change in
  the underlying business or in the reported figures"; a `GENERATION_METADATA_ONLY` pair is "nothing here is an
  investment change");
- **both versions side by side**: version, recorded at, `dataAsOf`, `knownAsOf`, model, policy, dataset, substantive
  digest, payload digest;
- the materiality summary and the eight category groups (empty ones say so);
- review: required/priority, each trigger with `fired` / `did not fire` and its reason, and the focus questions;
- attribution, with `UNAVAILABLE` stated and the cause named rather than estimated;
- generation metadata that differs, separated from the investment diff;
- boundary coverage: versions, pairs, stored boundary reports, explained and missing counts; each missing pair named;
  and the operator reconciliation action described — with no control to invoke it.

## 5. Coverage (`/investment/coverage`; `/identity-coverage` remains as an alias)

Counts, by-source, every observed row with its state, reason text and raw observation, corporate-action successor
reconciliation, financial coverage (3 of 13 sectors, methods usable/withheld, XBRL tags, derivation items), then the
two sections this phase adds: **dataset freshness** (as-of, generated-at, roster/listing/action versions, dataset
class, and the statement that per-security statement freshness belongs to each company page) and **boundary coverage
and missing explanations** (per chain, why no cross-issuer total is claimed, and the operator remedy).

Rows whose identity is known link to the company assessment and the candidate view; rows whose identity is unknown
link nowhere.

## 6. Where the demonstration stops

- It cannot show a real issuer, a real filing, or a fourth sector.
- It cannot show a scheduled review, a backfilled boundary explanation, or an attribution split — none exists.
- It cannot show a holding's disposition if the operator never recorded one: the page says
  `No stored disposition exists for this holding or candidate. Dispositions are produced by the operator CLI.` (exact
  copy from `DISPOSITION_UNAVAILABLE_COPY['not-recorded']`).
- It cannot show a portfolio implication band for a `AVOID`/`AVOID_CANDIDATE` verb: the payload asserts none, and the
  page prints `not available — no target band is asserted for this verb`.
