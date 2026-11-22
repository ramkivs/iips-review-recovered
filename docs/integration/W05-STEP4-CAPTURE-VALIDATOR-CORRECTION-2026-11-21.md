# W05 Step 4 — host coverage capture validator correction (2026-11-21)

Scope: `tools/windows/W05-STEP4-CAPTURE-HOST-COVERAGE.ps1` and its targeted tests only.
W05 remains **IN PROGRESS — NOT ACCEPTED**.

## The correction

The capture validator applied the identity report shape (`identitySources` + `items`) to
**both** coverage routes, so a valid `InvestmentCoverageReport` from
`/api/investment/coverage/investment` was classified `unknown-json-shape`. Each route is now
validated against its own report contract:

| Route | Contract | Structural markers | Source |
|---|---|---|---|
| `/api/investment/coverage/investment` | `InvestmentCoverageReport` | `reportVersion`, `dataset`, `issuers`, `identitySourcesAvailable` | `iips-platform/src/investment/coverage/investmentCoverage.ts` |
| `/api/investment/coverage` | `IdentityCoverageReport` | `identitySources`, `items` | `iips-platform/src/investment/identity/coverage.ts` |

Preserved unchanged: the documented error shapes (`error`, `asOf`, `issues`) are recognised on
either route; the shape vocabulary (`report`, `documented-error-payload`, `not-json`,
`unknown-json-shape`, `unreadable`); and every capture artifact field (route, requestUri,
status, bodyFile, bodySha256, shape, capturedAt, errorText) — bodies, statuses, timestamps
and hashes are published verbatim exactly as before. A report shape is now recognised **only
on HTTP 200**, so a 503 body is captured as evidence and is never a successful report capture
(run `ok` still requires both routes 200).

Classification moved into one shared helper, `Get-W05ResponseShape` in
`tools/windows/W05-SCRIPT-HELPERS.psm1`, so the rule is testable without HTTP.

## Verification evidence (operator Windows console output, 2026-11-21; operator-reported)

The read-only diagnosis re-check on the captured bytes confirmed: `identitySources`/`items`
absent and all twelve `InvestmentCoverageReport` keys present on the investment body
(`identitySourceDetail` present with null value); `error` absent; capture record shape
`unknown-json-shape`; and the identity body carrying `observation-sources-unavailable`
(`OBSERVATION_SOURCE_UNAVAILABLE | holdings/broker-preview/watchlist`). The console output
ends `DIAGNOSIS CONFIRMED: investment response does not match the identity report shape or
error shape. The capture validator contract mismatch is confirmed for these captured bytes.`
That output is the verification evidence for this correction and is not reproduced further.

## Tests

- `tools/windows/W05-SCRIPTS.Tests.ps1` — new Describe
  `W05 STEP4 — capture shape classification honours each route contract` (9 It blocks):
  both valid report shapes, route-contract separation (each cross shape), documented errors
  on both contracts (503 and 400), malformed responses (not-json, shapeless JSON, top-level
  array), 503 never a report capture, `identitySourcesAvailable: false` as a valid marker
  value, and an end-to-end capture-script run against an unreachable host (FAILED-VALIDATION,
  artifact schema preserved). Runs on the Windows host (Pester 5).
- `iips-platform/tests/investment/w05Step4CaptureShapeContract.test.ts` — derives both
  marker sets from the endpoint types and pins the route table, the HTTP-200 gate and the
  capture artifact schema. Runs in-repo: `npx tsx --test tests/investment/*.test.ts` (targeted
  run of this file with `w05PowerShellRules.test.ts` on 2026-11-21: **12 passed, 0 failed**;
  the mandatory PowerShell rule scan over the three modified sources passes).

## Outstanding — recorded for separate investigation (not addressed here)

1. **Identity coverage 503 `observation-sources-unavailable` (owner-context).** The identity
   route fails closed before reading any surface when the owner context is not established:
   `frontend/server/investment/sources.ts:168,198,212` throw
   `owner context not established: the server-owned binding carrier is not configured`;
   `frontend/server/investment/coverage-transport.ts:83-105` aggregates the surface failures
   and is deliberately fatal; `iips-platform/src/investment/identity/coverageEndpoint.ts:152-166`
   renders the 503. The precondition is the server-owned setting
   `IIPS_G3_IPC_BINDING_PROVISIONED` (`frontend/server/user-portfolio/ownerContextFromBinding.ts:225`),
   fail-closed by default. Not modified here.
   **Resolved 2026-11-22 — external prerequisite, not an implementation gap:** the "binding carrier" is
   the IRR process-environment declaration (plus `IIPS_G2_IPC_ENDPOINT`, and the F-3 carrier at
   `IIPS_OWNER_CONTEXT_PATH` for the watchlist surface, `sources.ts:213-215`); `OwnerContext` carries no
   identity field and IPD resolves the S1 binding per request. With those set, the identity route
   answered **200** on the host — `IID-STAGE-5-D5-D6-WINDOWS-EXECUTION-EVIDENCE-2026-11-22.md` §3.1.
   No code change was made.
2. **Investment-report identity disclosure inconsistency.** The captured investment response
   carries `identitySourcesAvailable: true` and `identitySourceDetail: null` at top level,
   while each issuer row carries `identityDependency: null` with
   `identityDependencyDetail: "The identity sources could not be loaded, so no identity
   binding could be evaluated for this issuer."` The row sentence contradicts the top-level
   flag when the identity files load. Origins (established, not reconciled):
   `iips-platform/src/investment/identity/runtime.ts:136-143` passes
   `issuerIdentityState: null` unconditionally while passing the real load result as
   `identitySourcesAvailable`; `iips-platform/src/investment/coverage/investmentCoverage.ts:543-580`
   maps a null state to `identityDependency: null` ("not evaluated" per its own contract at
   `:151-162`) and attaches the fixed "could not be loaded" sentence, whose cause claim is
   only true when `identitySourcesAvailable` is false. The mixed case (sources available +
   no identity state) is what the runtime provider deterministically produces and has no
   test. Left untouched for a separate investigation and decision.

## Scope preserved

No change to identity observation providers, owner-context configuration, endpoint
behaviour, W05 Steps 1-3, D1 evidence, Marico or KEC. No Windows capture was rerun; no host
was accessed; repository synchronisation to any Windows checkout remains manual.
