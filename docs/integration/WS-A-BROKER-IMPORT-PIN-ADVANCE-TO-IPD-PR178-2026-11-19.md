# IRR Broker Import — IPD PR #178 full partial-acceptance integration (`9d03a35b`)

**Date:** 2026-11-19. **Type:** implementation receipt (additive feature on top of an
already-completed, already-verified dependency pin advance), not a PA act.
**Pinned IPD commit (unchanged this round):** `9d03a35b4d4d79972c466c2c8e45e8c9270524d4` — the
`iips-broker-import` alias, pinned and CI-verified in a prior round (see
`.ci/verify-ipd-pins.mjs`). This document covers the **implementation built on top of that pin**:
the full "daily snapshot / partial acceptance" submission workflow IPD PR #177/#178 publishes.

User direction for this round: **`full_integration`** — implement the complete partial-acceptance
workflow now (an opt-in "full daily snapshot" submission mode, identity-resolution strictness
relaxed only for that mode, and an approval UI bound to IPD's exact `summaryDigest`), rather than
stopping at wiring or at the pin advance alone.

## 1. What this adds

A second, **opt-in** submission mode alongside the existing all-or-nothing broker import:

- **Ordinary mode** (unchanged): every row must resolve identity or the whole import is refused.
  Nothing about this path's code, types, or behaviour changed.
- **Full daily snapshot mode** (new, opt-in): the operator declares the file is a complete daily
  book. IRR relaxes its own *client-side* identity-resolution strictness so every row-level-valid
  holding (not every identity-resolved one) reaches the prepared payload; **IPD independently
  re-resolves identity for every row server-side regardless of what IRR's client-side pipeline
  believed**, and decides authoritatively whether the import can proceed, partially proceed, or
  must be refused. If some rows do not resolve, IPD refuses to write anything and returns a
  `PARTIAL_ACCEPTANCE_REQUIRED` summary (counts, the exact unresolved rows with their reasons, and
  a `summaryDigest`); the operator must see that summary and explicitly approve it before a
  resubmission carrying that exact digest can proceed. The wire holding shape has no identity
  field at all, so nothing IRR's client-side pipeline privately believed about a row ever reaches
  the wire or influences IPD's decision.

## 2. Files changed or added

| File | Change |
|---|---|
| `frontend/server/broker-import/brokerImportStage4.ts` | Rewritten: shape-validates the additive request fields (`importId`, `fullSnapshot`, `partialAcceptance`), the additive holding fields (`dpQty`, `availableQty`, `profitLoss`, `pnlPercentage`), the new refusal codes, and the new `PARTIAL_ACCEPTANCE_REQUIRED` transport outcome. The ordinary (non-snapshot) validation and interpretation paths are byte-for-byte unchanged in behaviour. |
| `frontend/server/broker-import/brokerPartialAcceptanceContract.ts` | **New.** Hand-declared local mirror of the additive wire types (see §3 for why). |
| `frontend/server/broker-import/brokerImportHttp.ts` | `respondToStage4Outcome` extended: `PARTIAL_ACCEPTANCE_REQUIRED` → HTTP 428 with the summary relayed verbatim; new refusal-code→status entries (`REFUSED_DUPLICATE_ROWS`/`REFUSED_EMPTY_SNAPSHOT` → 422, `REFUSED_INVALID_SOURCE_DIGEST` → 400, `REFUSED_APPROVAL_MISMATCH` → 409). These HTTP mappings are IRR-authored (IPD has no HTTP layer to mirror). |
| `frontend/src/api/brokerImportStage4.ts` | `commitBrokerImport` widened to accept the additive request fields (`Stage4Request`); new `Stage4ClientOutcome` variant for `partial-acceptance-required`; new `buildPartialAcceptanceApproval()` helper that round-trips IPD's own `summaryDigest` verbatim — it is never recomputed client-side; client-side shape re-validation of the untrusted HTTP body, mirroring the server. |
| `frontend/src/api/brokerFullSnapshotImport.ts` | **New.** Builds the `fullSnapshot: true` request from raw CSV: runs the same BI-03 ingress pipeline with `failOnUnmappedIdentity: false`, surfaces a non-authoritative local identity estimate for operator information only, and refuses preparation entirely on any row-level (not identity) rejection. |
| `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx` | Prepares a `fullSnapshotPrepared` payload alongside the ordinary one on every file selection (same source bytes, independent ingress pass); passes it to `BrokerImportCommit`. |
| `frontend/src/features/broker-holdings/BrokerImportCommit.tsx` | New "Submit as a full daily snapshot" toggle (disabled unless a full-snapshot payload was preparable); new partial-acceptance panel showing the exact resolved/unresolved counts and rows IPD returned, with explicit **Approve** (resubmits with `buildPartialAcceptanceApproval`) and **Cancel** (writes nothing) actions; approval is disabled outright when IPD reports duplicate symbol rows; the snapshot-specific success fields (`snapshotState`, `unresolvedCount`, `reconciliation`) are displayed when IPD returns them. |

## 3. A load-bearing discovery: two aliases, one declared identity, one TypeScript bug

Investigating how to type the new wire fields surfaced a fact not visible from the pin-advance
work alone: **this project depends on the same upstream repository under two different npm
aliases pinned at two different commits**, and the wire-contract types the broker-import feature
already imports (`BrokerImportHolding`, `BrokerImportRequest`, `BrokerImportSuccess`, …) come from
`iips-production-market-data` — pinned at `1ce6a829a7ce65550356a0071c108a60f2d813be`, an **older**
commit, separately governed by `.ci/verify-ipd-pins.mjs` — not from `iips-broker-import`, the alias
actually advanced to the PR #178 commit in the prior round.

Both packages' own `package.json` declare the identical `name`/`version`
(`iips-production-market-data@1.0.0`), because they really are two checkouts of the same published
package. TypeScript's module resolution computes a "Package ID" from that `name@version` alone (not
from the npm alias directory), so when a file imports a type from `iips-broker-import/portfolio-ui`
in the same compilation unit as a type from `iips-production-market-data/portfolio-ui`, TypeScript
treats them as the same package and **non-deterministically coalesces the resolution**, silently
serving the OLD package's (pre-#178) declaration file even for an import explicitly written
against the new alias. This was confirmed directly:

```
$ npx tsc --traceResolution …
Module name 'iips-broker-import/portfolio-ui' was successfully resolved to
'…/node_modules/iips-broker-import/dist/package/src/ui/portfolio_ui_package.d.ts'
with Package ID 'iips-production-market-data/dist/package/src/ui/portfolio_ui_package.d.ts@1.0.0'.
```

**Resolution chosen:** rather than importing the additive types from `iips-broker-import` (unsafe,
per above) or advancing `iips-production-market-data`'s own separately-governed pin to match (a
materially larger, separate decision — that package is consumed far more broadly than this one
feature, and its pin is independently verified by name in `.ci/verify-ipd-pins.mjs`), the five
additive types (`BrokerPartialAcceptanceApproval`, `BrokerPartialAcceptanceSummary`,
`BrokerSnapshotUnresolvedRow`, `BrokerSnapshotReconciliation`, `BrokerSnapshotState`, plus the
helper `BrokerDailyFields`/`BrokerImportSuccessWithSnapshot`) are **hand-declared locally** in
`frontend/server/broker-import/brokerPartialAcceptanceContract.ts`, copied verbatim from IPD's
published `broker_import_ipc.d.ts` at the pinned PR #178 commit, each documented with full
provenance. This was diff-verified field-for-field against both the pinned
`iips-production-market-data` package (confirms the base contract — `BrokerImportHolding`,
`BrokerImportRequest`, `BrokerImportSuccess`, etc. — is otherwise **byte-identical** between the
two commits) and the new `iips-broker-import` package (confirms every additive field matches
exactly). This confers no authority and skips no validation: every shape is still independently
re-checked at the untrusted IPC/HTTP boundary by `brokerImportStage4.ts`'s own validators, exactly
as for any other externally-sourced type in this codebase.

**This is a decision made without a prior explicit sign-off round and should be reviewed:** it
avoids touching `.ci/verify-ipd-pins.mjs` or `iips-production-market-data`'s pin at all (zero
blast radius beyond the three/four files that needed the additive types), at the cost of owning a
second, hand-maintained copy of these five types that must be kept in sync if IPD revises this
contract again. The alternative — advancing `iips-production-market-data`'s pin to the same
commit — remains available and was deliberately not taken this round; see §6.

`.ci/verify-ipd-pins.mjs` was run after every change in this round and **passes unchanged**:
all three pins (`iips-broker-import`, `iips-np04-governed-persistence`,
`iips-production-market-data`) are exactly as a prior round left them.

## 4. Verification performed this round

| Check | Result |
|---|---|
| `tsc --noEmit` (main `tsconfig.json`, all of `src`) | **clean** |
| `tsc -p tsconfig.replay-server.json --noEmit` (covers `server/broker-import/*` via the dynamic import from `executive-transport.ts`) | **clean** |
| `tsc -p tsconfig.broker-import.json --noEmit` | **clean** |
| `node .ci/verify-ipd-pins.mjs` | **all three pins verified unchanged** |
| `vitest run` (full suite) | **3219 passed, 1 skipped, 0 failed** (up from 3180 passed before this round's new tests; one pre-existing test updated — see §5) |

New or extended test files this round:
- `frontend/server/broker-import/brokerImportStage4.test.ts` — added coverage for the additive
  request/holding field shapes, and a new `describe` block covering `PARTIAL_ACCEPTANCE_REQUIRED`
  interpretation and the daily-snapshot additive success fields (self-consistency checks:
  `PARTIALLY_ACCEPTED` requires a positive `unresolvedCount`; `refusedHoldings.length` must match
  `unresolvedCount`; malformed reconciliation/snapshotState/digest shapes are rejected).
- `frontend/server/broker-import/brokerImportStage4Http.test.ts` — new `describe` block for the
  428 mapping, the new refusal-code→status entries, and a full resubmission-with-approval
  round-trip through the real composed HTTP handler.
- `frontend/src/api/brokerImportStage4.test.ts` — new tests for the 428 client outcome (valid and
  malformed bodies), the daily-snapshot additive success fields, the new refusal codes, and
  `buildPartialAcceptanceApproval`'s digest round-trip.
- `frontend/src/api/brokerFullSnapshotImport.test.ts` — **new file.** Exercises the real ingress
  pipeline against a mixed resolvable/unresolvable CSV; asserts no canonical identity ever reaches
  the wire shape, the local identity estimate is informational only, and row-level (not identity)
  rejections still refuse preparation.
- `frontend/src/features/broker-holdings/BrokerImportCommit.test.tsx` — new `describe` block:
  toggle disabled without a full-snapshot payload, the partial-acceptance panel's content and the
  approve/decline actions, the duplicate-symbol approval block, and that switching modes clears
  stale state from the other mode.

## 5. One pre-existing test corrected, not weakened

`brokerImportStage4.test.ts`'s `'refuses unknown request keys and unknown holding keys...'` test
previously asserted that `importId` was an **unknown, categorically refused** key — true before
this round, false after it (PR #177/#178 makes `importId` a legitimate, shape-checked field). The
assertion was updated to use a key that remains genuinely unknown (`notAKnownRequestKey`), and two
new tests were added immediately after it to cover exactly what changed: the additive fields are
now **admitted when well-shaped** and **refused when malformed** (non-boolean `fullSnapshot`,
non-literal-`true` `approved`, missing `summaryDigest`, an extra key inside `partialAcceptance`,
non-numeric `dpQty`). No assertion was loosened — the previously-tested refusal behaviour (unknown
keys, unknown holding keys, malformed approval shapes) is still fully covered.

## 6. Remaining open items (not yet done; flagged for the user)

- **Identity-resolution strictness relaxation point.** `brokerFullSnapshotImport.ts` calls the
  ingress orchestrator directly with `failOnUnmappedIdentity: false`, independent of the ordinary
  `previewBrokerHoldings` → `prepareBrokerImport` path (which still requires `saveable: true`).
  This is a deliberate, narrow choice — only the new opt-in module relaxes strictness, and only
  for its own, separate preparation pass — but it has not been separately reviewed against the
  original Gate E W-1 / P04 whole-import refusal policy documented elsewhere in this repository.
- **The `iips-production-market-data` vs `iips-broker-import` pin split (§3)** is a standing
  architectural fact this round discovered rather than created. Whether to eventually converge the
  two pins (so this feature's hand-maintained local type mirror in
  `brokerPartialAcceptanceContract.ts` can be retired) is a decision for a future round, not taken
  here.
- **Spec 1** ("IPD — Investigate Duplicate Detection") remains unaddressed, as in the prior round.
- No commit, push, or merge has been made for this round's work; it awaits explicit review.
