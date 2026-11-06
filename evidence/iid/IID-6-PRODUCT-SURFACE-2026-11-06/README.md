# IID-6 — Product surface (evidence bundle)

**Work item.** IID-6, issued 2026-11-06. Delivers the read-only IIPS v3.0 Investment Intelligence interface that makes
IID-2 (company assessment), IID-4 (holding/candidate disposition) and IID-5 (historical change intelligence) usable in
one workflow:

> portfolio → holding → company → fundamentals → valuation → risk → disposition → portfolio implication → change history

**Baseline.** `main` at `83f4511e2ebac9d42c7f30f5798e8356c7b23edf` (PR #480, the IID-5 merge). Branch
`arena/8bb7c3e6-iips-review-recovered`.

**Scope boundary, stated once and applied throughout.** This phase adds **no backend contract, no persistence, no
engine and no route handler**. It promotes the surfaces that already existed (`CompanyAssessmentPage`,
`InvestmentCoveragePage`, the IID-2/IID-3/IID-4/IID-5 read transports and their read models), adds two GET-only
client modules and five components, and extends the portfolio detail page with investment entry points. The only
server edit is four **facts** added to an existing list projection, because the portfolio page cannot render a
disposition without them.

## Contents of this bundle

| File | What it holds |
|---|---|
| `README.md` | This index, plus the honest list of what is *not* claimed. |
| `requirement-matrix.md` | Every required surface and every AC (AC-6.1…AC-6.7, AC-U1…AC-U6, AC-X1…AC-X7) → implementation → the test that fails if it regresses. |
| `read-only-proof.md` | The read-only argument: what was grepped, what the tests assert, and the one pre-existing POST that is documented rather than hidden. |
| `accessibility.md` | The keyboard/screen-reader pass: focus order, the `aria-pressed` selectors, why direction and materiality are textual, and the semantics each region carries. |
| `e2e-demo.md` | The end-to-end walkthrough the surface supports today, on synthetic data, start to finish — including what it cannot show. |
| `test-run.txt` | Captured output: `npm run typecheck`, `vitest run src`, `vitest run server/investment`. |
| `changed-files.txt` | `git diff --stat` plus the untracked list at the time the bundle was written. |
| `corrections.md` | The defects found while building the surface and what was done about each (including the coverage `assertReport` recursion). |
| `fresh-clone-verification.md` | The post-merge verification from a clean clone of `main`: install, typecheck, and both targeted suites. |

## What is delivered

1. **`/investment/company/:issuerId`** — the full assessment surface: identity and listing context, identity binding
   and adequacy, fundamentals with periods and per-value absence reasons, valuation methods / intrinsic range / margin
   of safety / sensitivity, confidence components and applied caps, risk taxonomy with material factors, dividend
   sustainability, moat evidence and classification, assumptions with discount-rate components and method-specific
   assumptions, evidence/provenance/freshness, version history, and the disposition and change panels below.
2. **Disposition panel** (`DispositionPanel`) — verb, its definition, confidence, horizon, rationale for *and*
   against, falsifiers, gates evaluated, limits and policy in force with breaches, portfolio context, portfolio
   implication with the band basis, review triggers, evidence, and the withheld state with its reasons and unmet
   inputs. `HELD` and `CANDIDATE` are different subject models, not two labels on one.
3. **Change timeline** (`ChangeTimeline`) — consecutive version pairs, both versions' `dataAsOf` / `knownAsOf` /
   model / policy / dataset / digests side by side, all eight categories grouped, numeric and categorical rendering
   with direction, materiality badges, review triggers and focus questions, attribution status, generation-metadata
   separation, and boundary coverage with the reconciliation affordance named as an **operator** action.
4. **`/investment/coverage`** — the IID-1 coverage read model at its IID-6 path (`/identity-coverage` is retained as
   an alias), now with a dataset-freshness table, a boundary-coverage explanation, and per-row links to the company
   and candidate surfaces where an identity is known.
5. **Candidate flow** — `/investment/candidate/:securityId`, reachable with no portfolio, with no position row, no
   quantity, no current or projected weight, and an explicit statement of what the page cannot do.
6. **Portfolio integration** — `UserPortfolioDetail` gains a disposition column (verb, confidence, withheld) and
   investment links per eligible holding, all carrying portfolio + security context; unresolved holdings say so.
7. **Sector-reference disclosure** — `SectorReferenceDisclosure`, an `aside` outside the assessment sections, labelled
   *sector-level reference intelligence*, linking to the existing `/research/company/:id`, never consumed by the
   assessment or the disposition.
8. **Degraded states and absent values** — eleven named failure reasons, all rendered with fixed client-side copy;
   every absent value as `not available — <reason>`.

## What this bundle does NOT claim

- **No real issuer has been assessed, dispositioned or compared.** Every figure in the tests is a sanitized synthetic
  fixture, and the surface says so where the payload says so (L-004, L-009).
- **R-16 is still 3 of 13 sectors.** The coverage panel shows that number; the surface does not improve it.
- **No scheduler exists.** Change history and dispositions are read on demand; reconciliation is an operator CLI
  operation against the governed store, and the browser has no control that could invoke it.
- **No production, multi-user or auth scope.** Ownership is the single-user IRR identity the existing transport uses.
- **No trade execution of any kind.** There is no order, no quantity-to-trade, no price, no broker, no venue.
