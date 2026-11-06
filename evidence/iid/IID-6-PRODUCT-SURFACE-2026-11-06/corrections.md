# IID-6 — corrections made while building the surface

The rule for this repository is that an implementation that reveals a defect records it, fixes it, and says so —
never quietly improves something and moves on. Each entry below names the defect, how it was found, what changed, and
what would fail now if the fix were reverted.

## C-1 — `assertReport` recursed forever, so the coverage page could never render a valid report

**Where.** `frontend/src/api/investmentCoverage.ts` (IID-1 code).

**Defect.** `assertReport(payload)` validated the shape and then ended with `return assertReport(payload)` — an
unconditional call to itself. `fetchInvestmentCoverage` never called `assertReport` at all, so the main read path
returned `payload as InvestmentCoverageReport` unvalidated while `evaluateBrokerPreview` (the unused preview path)
called it and would have recursed. Net effect: a valid report rendered as a client error (`Maximum call stack size
exceeded`) on the preview path, and was silently unvalidated on the main path.

**Found by.** Building the IID-6 coverage tests: a fixture shaped exactly like the server's report was the first
payload ever fed to that page in a test.

**Fix.** The terminal line is `return payload as InvestmentCoverageReport` after the shape check, and
`fetchInvestmentCoverage` now applies `assertReport` before returning — which is what its own doc comment had always
claimed.

**Pinned by.** `frontend/src/features/investment/iid6Coverage.test.tsx` › "renders the counts, the status line and the
rows from the report it received" (fails with a stack overflow on the old code) and › "refuses a payload that is not a
report rather than rendering a partial one" (fails on the old main path, which accepted anything).

**Bookkeeping.** Recorded in the limitation register's IID-6 overlay (§ IID-6 below the L-001…L-029 table). No
limitation identifier was added, removed, renumbered or re-statused: this is a fixed defect, not a new limitation.

## C-2 — two bare-dash placeholders in absent-value positions

**Where.** `frontend/src/features/investment/ChangeTimeline.tsx` (per-dimension detail cell) and
`frontend/src/features/investment/CompanyAssessmentPage.tsx` (derived-value note cell), both written in this phase.

**Defect.** Both rendered `—` when the payload had no value for the field. That is exactly the ambiguous dash AC-6.3
forbids: a reader cannot tell "no detail" from "zero detail" from "not read".

**Fix.** Both render `<AbsentValue reason="…" />`, which prints `not available — <reason>`.

**Pinned by.** `iid6CompanyAssessment.test.tsx` › "prints every absent value as `not available — <reason>`", which
iterates every cell of the fundamentals table and fails on a bare `—` or `-`.

## C-3 — the IID-3 "no decision affordance" test banned the substring `dispos`

**Where.** `frontend/src/features/investment/CompanyAssessmentPage.test.tsx`.

**What happened.** The IID-3 test asserted the rendered company page contained none of
`buy, sell, order, trade now, dispos, recommend`. IID-6 exists to render a disposition panel on that page and a
disclosure sentence containing the word *order* ("no order, quantity or price is published here"), so the old
assertion would have had to be deleted or satisfied by hiding a required surface.

**What was done instead.** The test was rewritten to assert what it was actually protecting: no form control, no
button other than the version selector, no generate/create/append/publish/save/record/submit affordance in any
accessible name, and none of `buy`, `sell`, `place order`, `trade now`, `recommend`, `add to portfolio` in the text —
plus the positive assertion that the negative disclosure *is* present. The comment in the test states why the change
was made, so a later reader does not read it as weakened coverage.

**Pinned by.** `iid6CompanyAssessment.test.tsx` › "renders no write control and no execution language" in the
rewritten file, and the new route-level tests in `src/app/iid6Routes.test.tsx`.

## C-4 — the disposition list carried no facts a portfolio page could render

**Where.** `frontend/server/investment/dispositionService.ts`.

**Defect (a gap, not a bug).** `DispositionListEntry` carried `verb` and identity/chain facts only. The IID-6
portfolio integration requires the current verb *with confidence and withheld status*, and a link to the company the
holding is about. The client must not derive `issuerId` from `ISIN` (that is an invented mapping, forbidden by this
phase), so the facts had to come from the read model that already had them.

**Fix.** `headVerb()` became `headFacts()` returning `{verb, confidence, horizon, withheld, issuerId}` from the same
head payload, spread into the same list projection. No route, handler, status code, error code or existing field
changed; no new query or store access. `null` still means "head unreadable", and a withheld head reports
`withheld: true` with `verb: null`.

**Pinned by.** `frontend/server/investment/disposition-records.test.ts` › "carries the facts the portfolio surface
needs, so it never has to guess one" and › "reports a withheld head as withheld, with no verb and no confidence";
`frontend/server/investment/disposition-transport.test.ts` › "lists the portfolio dispositions with their verbs"
(extended with wire-shape assertions on the four fields).

## C-5 — `npm ci` and `build:broker-import` are prerequisites, not optional

Not a product defect, but a reproducibility trap worth recording: the frontend tests import
`src/api/brokerHoldingsPreview.ts`, which resolves modules from `.cache/broker-import`, a build artifact that is not
in the workspace snapshot. A fresh checkout therefore needs

```bash
cd frontend
npm ci --no-audit --no-fund --strict-ssl=false
npm run build:broker-import      # or `npm run typecheck`, which runs it as a pretypecheck step
```

before `vitest run src` will even collect. This is pre-existing CI behaviour (the pipeline runs the pretypecheck step)
and is recorded here because it is the one thing that makes a local run look broken.

## Not a correction — the unused broker-preview POST

`evaluateBrokerPreview()` in `investmentCoverage.ts` issues a `POST` to `/api/investment/coverage/preview`. It
predates this phase, stores nothing, and is imported by no surface. IID-6 neither uses it nor removes it; it is
documented in `read-only-proof.md` §4 and in the register overlay so that the "no investment POST" invariant is
stated precisely rather than silently averaged.
