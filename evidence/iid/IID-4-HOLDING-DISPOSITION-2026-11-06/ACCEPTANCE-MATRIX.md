# IID-4 — acceptance matrix

Every row names the criterion, the concrete thing that was verified, and the file that would fail if the behaviour
regressed. "PASS" means the test named in the row ran green in this evidence package's own logs.

## 1. The ten acceptance criteria

| ID | Criterion (roadmap §IID-4) | What was verified | Status | Carried by |
|---|---|---|---|---|
| AC-4.1 | A defensible verb for every assessable subject, from a table-driven matrix | 31 table rows: held positives/negatives, both boundaries of each threshold, PARTIAL, INSUFFICIENT, identity/state exclusions, caps, and six candidate rows. Boundaries: +15 % (ACCUMULATE), +14.9 % (RETAIN), −5.1 % (withheld), −10 % (REDUCE), −25 % (REDUCE, or AVOID with deterioration) | **PASS** | `disposition-matrix.test.ts` |
| AC-4.2 | No exposure-increasing verb on PARTIAL; WATCH is the PARTIAL candidate state | asserted twice: over every PARTIAL row in the table, and on a 60 %-discount PARTIAL payload that still cannot ACCUMULATE. A PARTIAL candidate is WATCH; a PARTIAL held position with a limits breach may REDUCE | **PASS** | `disposition-matrix.test.ts` (suite "AC-4.2") |
| AC-4.3 | Corrected subject model (R-8) | `HELD` derives its `positionKey` and cannot be constructed without position observations; `CANDIDATE` refuses a position key and refuses numeric `quantities` (including `0`); chain scopes are `hd:<portfolio>/<security>` and `hc:<ctx\|none>/<security>`; composition refuses a caller-supplied scope that does not name the subject | **PASS** | `disposition-subject.test.ts`, `disposition-composition.test.ts` |
| AC-4.4 | Portfolio context reused, labelled, non-governing | the published block is carried unaltered; the weight observation keeps the read model's source; unmeasured weight is `100 − publishedWeightSum` and never zero; a missing weight is `MISSING` and fails G-5; sector coverage is published as `sectorMeasuredWeightPct` with a note; the sector reference is `SECTOR_REFERENCE`-labelled with `normalizedHolding: null` and changes no verb; correlation flags can only ever `COUNTERS` | **PASS** | `disposition-portfolio.test.ts`, `portfolio-context.test.ts` |
| AC-4.5 | Versioned, effective-dated limits; named caps | defaults are `SYSTEM_DEFAULT` with a `+system-default` version; an operator policy is `OPERATOR_CONFIG` with per-sector caps; a future-dated policy does not apply and says so; unreadable/invalid policy fails closed; ACCUMULATE→RETAIN on a single-name breach and INITIATE→WATCH on a sector breach, both named in `capsApplied`, `limits.applied` and the rationale; no cap path produces ACCUMULATE or INITIATE | **PASS** | `disposition-limits.test.ts` |
| AC-4.6 | Evidence-backed rationale, counter-arguments, falsifiers | every entry cites ≥1 evidence id and ≥1 observation ref; every cited id resolves (enforced by the engine: synthesised-and-labelled, or refused with `RATIONALE_CITATION_UNRESOLVED`); a verdict always has ≥1 `COUNTERS` entry; ≥2 falsifiers per verb, each naming a payload path | **PASS** | `disposition-rationale.test.ts` |
| AC-4.7 | No order, quantity, price, timing or brokerage | a structural walk of keys and prose over a candidate and a held payload; the only exception is `subject.quantities` (a held position's own facts) and the two disclosure flags that state the opposite | **PASS** | `disposition-rationale.test.ts`, demonstration point 7 |
| AC-4.8 | `INVESTMENT_ASSESSMENT` semantics and `notAnInstruction` | `interpretation.nature`, `noExecutionPath`, the verb dictionary (all seven verbs), `definitionApplied`, and `impliedTargetWeightBand === null` for AVOID and WATCH, with the band basis saying why | **PASS** | `disposition-matrix.test.ts`, `disposition-rationale.test.ts` |
| AC-4.9 | Limits provenance and fail-closed resolution | basis, version, effective date and the caps actually applied travel on the payload; the digest is stable for identical content and changes with the caps; the service's `resolveDispositionLimits` fails closed on unparseable or invalid operator policy | **PASS** | `disposition-limits.test.ts`, `disposition-records.test.ts` |
| AC-4.10 | Determinism, stable identity, composer-side idempotency | identical inputs ⇒ byte-identical payload; a different clock changes only the timestamps; identical content writes nothing (`UNCHANGED`); changed content appends to the SAME `reportKey`; parameters exclude the clock, digests and the verb | **PASS** | `disposition-rationale.test.ts`, `disposition-composition.test.ts`, `disposition-records.test.ts` |

## 2. The ten additional scenarios

| # | Scenario | Result | Carried by |
|---|---|---|---|
| 1 | Multi-security issuer: two securities of one issuer share issuer exposure but keep distinct chains | issuer exposure 9 % (4 % + 5 %) measured against the single-name cap while the two position keys and chains differ | `disposition-behaviour.test.ts` |
| 2 | Missing or stale assessment | an assessment from another issuer is refused (`SUBJECT_ASSESSMENT_MISMATCH`); a payload that violates its own invariants is refused (`ASSESSMENT_INVALID`); a reference that disagrees with its payload is refused | `disposition-behaviour.test.ts` |
| 3 | Unresolved and out-of-scope holdings | unresolved holdings become unmeasured weight with a note; the subject's own weight goes `MISSING` when it is not an active holding; `holdingsOutOfScope` is 0 **and says that the read model does not publish security class** | `portfolio-context.test.ts` |
| 4 | G-1 vs G-3 ordering | a broken identity reports `identity_unresolved` first and later gates are `SKIP`; an out-of-scope class reports `security_class_excluded` before adequacy | `disposition-portfolio.test.ts` |
| 5 | G-1 vs G-3 sector differences | the sector reference block is labelled and inert: identical verbs with and without it | `disposition-portfolio.test.ts` |
| 6 | Synthetic or unavailable evidence | `SYNTHETIC_REFERENCE` travels in the assessment ref and in provenance; `INSUFFICIENT` yields no confidence, no definition and no band | `disposition-behaviour.test.ts` |
| 7 | Limits-policy version change | the same evidence ACCUMULATEs under a 20 % cap and RETIs under the 10 % default; the policy version and digest change with it | `disposition-behaviour.test.ts` |
| 8 | Idempotency | `CREATED` → `UNCHANGED` → `APPENDED` with a stable `reportKey`; `listPortfolio` reports the head's verb | `disposition-records.test.ts`, demonstration points 1–4 |
| 9 | Chain integrity | a tampered stored payload is refused on read (no partial history); a chain that does not exist is `CHAIN_NOT_FOUND`, not an empty result | `disposition-records.test.ts`, `disposition-transport.test.ts` |
| 10 | `L-010`/`L-012`/`L-013`/`L-015` constraints, `L-014` preservation | bounded scan and head-only idempotency are exercised (not assumed); two chains for one scope are refused by the existing mechanism; a clock-only re-run **appends** with an **unchanged input digest** — the `L-014` consequence, pinned | `disposition-records.test.ts` (suite "L-014"), `investment-artifacts.test.ts` (unchanged IID-3 suites) |

## 3. Transport and persistence surface

| Aspect | Verified | Carried by |
|---|---|---|
| Route table read-only | three routes, all `GET`/`HEAD`, `mutating: false`; no pattern can carry a quantity, price, order or trade | `disposition-transport.test.ts` |
| 405 before anything | POST/PUT/PATCH/DELETE answer 405 with `Allow: GET, HEAD` even with no owner and a port loader that throws | `disposition-transport.test.ts` |
| Identity before store | a symbol in the security position is 400; an inadmissible portfolio id is 400 | `disposition-transport.test.ts` |
| Fail-closed | 404 for an absent chain, 503 for no owner, 503 for no boundary, 400 for a malformed route; every body sanitized | `disposition-transport.test.ts` |
| Persistence reuses NP-04 | the real governed store, the real adapter, an `hd:` chain and an `hc:` chain written and read back | `disposition-records.test.ts`, demonstration |

## 4. What this matrix does **not** claim

- It does not claim any real company was assessed or dispositioned (`L-004`, `L-009`).
- It does not claim a portfolio risk model: there is no volatility, beta, drawdown or correlation (`L-017`, `L-027`).
- It does not claim `L-014` is resolved — it is pinned and disclosed, and IID-5 must decide it (`L-026`).
- It does not claim IID-5 or IID-6 have started. They have not.
