# IPD — Investigate Duplicate Detection (whole-import dedup / `ALREADY_IMPORTED_NO_OP`)

**Date:** 2026-11-19. **Type:** investigation/documentation receipt — no code change in this
document's scope. Source read directly from IPD's authoritative repository at the pinned commit
`9d03a35b4d4d79972c466c2c8e45e8c9270524d4` (`src/persistence/brokerImportPersistence.ts`,
`src/persistence/portfolio_store.ts`, `src/persistence/daily_snapshot_import.ts`,
`src/persistence/daily_snapshot_reconciliation.ts`), cross-checked against what IRR actually
consumes (`frontend/server/broker-import/brokerImportStage4.ts`,
`frontend/src/api/brokerImportStage4.ts`, `frontend/src/features/broker-holdings/*`).

## 1. Question asked

How does IPD decide that a resubmitted broker import is a duplicate of one already committed, and
why does it return `ALREADY_IMPORTED_NO_OP` (write nothing, same revision) instead of writing a
second time?

## 2. Short answer

**Duplicate detection is entirely IPD's server-side responsibility.** IRR supplies a content digest
of the raw file bytes and (for the daily-snapshot path) an optional durable operation id; it never
decides duplication itself, never second-guesses IPD's decision, and the UI/client/server layers in
this repository all relay IPD's `disposition`/`noOp`/`storeEffect` fields verbatim rather than
re-deriving them. IPD runs **two independent checks**, not one, and they key off different
identities for different reasons.

## 3. The two mechanisms, read directly from IPD's source

### 3a. The plain (all-or-nothing) import path — `persistBrokerImport` / `PortfolioStore.save`

`persistBrokerImport` (`brokerImportPersistence.ts`) calls `writer.save(...)`, which is
`PortfolioStore.save` in `portfolio_store.ts`. Inside one serialized transaction, `save` runs:

1. **Ledger-keyed check (checks every past contribution, not just the latest revision).**
   ```
   contributionId = request.importId ?? request.contentDigest ?? <locally computed digest>
   SELECT 1 FROM portfolio_contributions
     WHERE canonical_owner_id = ? AND portfolio_id = ?
       AND (import_id = ? [if importId supplied] OR contribution_id = ? [otherwise])
   ```
   A hit returns `expectedRevision` unchanged (no new row written at all) — the caller's own
   `save()` wrapper in `persistBrokerImport` then sees `revision === request.expectedRevision` and
   reports `disposition: 'ALREADY_IMPORTED_NO_OP'`. Because this reads the **entire contribution
   ledger for the portfolio**, re-submitting an *older* file a second time (not just the most
   recent one) is also caught.
2. **Semantic last-revision check (fallback, only when no `importId` is supplied).**
   ```
   lastRevision = SELECT content_digest FROM portfolio_revisions ... ORDER BY revision DESC LIMIT 1
   if (lastRevision.content_digest === contentDigestOf(request)) → no-op
   ```
   `contentDigestOf(request)` is **not** the caller's file digest — it's IPD's own hash over the
   *resolved, persisted* holdings plus the provenance digest
   (`sha256(JSON.stringify({ holdings, provenance: provenanceDigest }))`). This check exists to
   catch a case the ledger check does not: two **different source files** (different bytes,
   different `contentDigest`) that nonetheless resolve to byte-identical persisted holdings against
   the current revision — e.g. the broker re-exported the same book with a different file name or
   a cosmetic formatting change. It only compares against the *single most recent* revision, not
   the whole ledger.

Both checks run **before** any row is inserted, inside the same transaction as the write, so there
is no window where a duplicate could race past the check.

### 3b. The daily-snapshot path — `persistDailySnapshot` (IPD PR #177/#178)

`persistDailySnapshot` (`daily_snapshot_import.ts`) is the newer sibling path this round's
`full_integration` work wires into. It reuses `PortfolioStore.save` for the underlying write (same
ledger-keyed check as §3a), but adds a durable, **deterministic operation identity** specifically
for this path:

```ts
deriveImportId(contentDigest, observationTime, operator) =
  sha256(['import.v1', contentDigest, observationTime, operator].join('\n'))
```

- If the caller supplies a well-shaped 64-hex `importId`, it is trusted as-is (used, for example,
  when echoing the same digest back on a partial-acceptance resubmission).
- Otherwise IPD derives it itself from `(contentDigest, observationTime, operator)`.

This makes the contribution-ledger check in §3a's step 1 exact and **operator-scoped**: the same
bytes, re-submitted by the same operator on the same observation date, reproduce the identical
`importId` and are caught as a no-op; the same bytes submitted again on a *different* day, or by a
*different* operator, derive a *different* `importId` and are treated as a genuinely new snapshot
(not a duplicate) — this is a deliberate design choice (documented directly in IPD's source,
`daily_snapshot_import.ts` module header, §1 "IMPORT IDENTITY"), not an oversight.

A no-op here returns the same shape as §3a plus the additive fields:
`{ disposition: 'ALREADY_IMPORTED_NO_OP', noOp: true, storeEffect: 'NONE', importId, snapshotState,
unresolvedCount }`.

### 3c. Row-level duplicate detection — a different, narrower mechanism

`findDuplicateSymbols` (`daily_snapshot_reconciliation.ts`) is unrelated to §3a/§3b: it detects the
same symbol appearing **more than once inside a single submitted file**, by an exact
(case-sensitive) string count over `symbol`, and refuses the whole snapshot
(`REFUSED_DUPLICATE_ROWS`) rather than merging, summing, or averaging the duplicated rows —
"any merge of duplicated broker rows would invent a position the broker never reported" (IPD's own
comment). This is the mechanism IRR wired up this round (see
`WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR178-2026-11-19.md` §2); it is a within-file row integrity
check, not whole-import idempotency, and the two should not be conflated.

## 4. How IRR consumes this (confirmed correct)

- IRR's `brokerImportStage4.ts` (both server validator and client transport) only
  **shape-validates** an incoming `ALREADY_IMPORTED_NO_OP` response — it checks the internal
  consistency IPD's own contract promises (`noOp === (disposition === 'ALREADY_IMPORTED_NO_OP')`,
  `storeEffect === (noOp ? 'NONE' : 'REVISION_COMMITTED')`, `holdingsPersisted > 0` for a real
  write) — it never recomputes or second-guesses whether something *is* a duplicate. That decision
  is IPD's alone.
- The HTTP route (`brokerImportHttp.ts`) relays a duplicate no-op as an ordinary HTTP 200, exactly
  like a real write — correct, since `ALREADY_IMPORTED_NO_OP` is itself an `ok: true` outcome in
  IPD's contract (an idempotent retry is a kind of success, not an error).
  Confirmed by an existing round-trip test:
  `brokerImportStage4Http.test.ts` → *"relays a duplicate no-op as a no-op and never as a new
  save"*.
- The UI (`BrokerImportCommit.tsx`) displays a distinct message for a no-op receipt and is
  confirmed, by an existing test (`BrokerImportCommit.test.tsx` → *"presents a duplicate as a
  no-op and never as a new save"*), never to render it as if a new save had occurred.
- IRR never supplies its own `importId` on an ordinary (non-snapshot) submission — only the
  daily-snapshot resubmission-after-approval flow carries one, and even then IRR does not
  explicitly echo back the `importId` IPD returned in the `PARTIAL_ACCEPTANCE_REQUIRED` summary; it
  relies on IPD's `deriveImportId` being deterministic over the unchanged
  `(contentDigest, importedAt, operator)` triple to reproduce the identical id server-side on
  resubmission. This was verified by reading `BrokerImportCommit.tsx`'s commit payload
  construction: it spreads `activePrepared` (which carries no `importId` field) plus
  `partialAcceptance` only — `Stage4Request.importId` exists in the type for request-shape
  completeness but nothing in the current UI code path ever sets it.

## 5. A naming collision worth flagging (not a functional bug)

This codebase has **two unrelated concepts both called "import id"**:

| | Evidence-retention `importId` | Stage 4 commit `importId` (this document's subject) |
|---|---|---|
| Defined in | `frontend/src/api/brokerEvidenceRetention.ts` (`evidenceImportId`) | IPD's `daily_snapshot_import.ts` (`deriveImportId`) |
| Computed by | IRR, client-side | IPD, server-side |
| Formula | `sha256(broker + '\0' + contentDigest + '\0' + asOf)` | `sha256('import.v1\n' + contentDigest + '\n' + observationTime + '\n' + operator)` |
| Purpose | Key to retrieve the frozen, retained raw CSV evidence record later | Idempotency key so a retried write is a no-op |
| Ever compared to each other? | **No** — confirmed by grep across `frontend/src`; no file reads one to produce or validate the other. |

They are legitimately independent (different inputs, different salts, different subsystems) and
nothing in the current code conflates them, but the shared name is a latent readability/maintenance
risk — a future change that assumes "importId" means the same thing in both places would be wrong.
Recommend renaming one of the two (e.g. `evidenceRecordId`) in a future, separate round; not done
here since it is out of this investigation's scope and touches an unrelated, already-shipped
feature (WS-A live evidence retention).

## 6. Gaps / things NOT covered by IPD's duplicate detection (informational, not necessarily defects)

- **No cross-portfolio dedup.** Both the contribution ledger and the last-revision check are scoped
  to one `(canonical_owner_id, portfolio_id)` pair. The same file imported into two different
  portfolios for the same owner is never flagged as a duplicate — this is almost certainly correct
  (a user may legitimately hold the same security in two separate books), but it means "duplicate"
  here specifically means "already recorded against *this* destination portfolio," not "ever seen
  before."
- **Row-level duplicate detection (`findDuplicateSymbols`) is an exact string match on `symbol`
  only** — it does not normalize exchange suffixes, case, or whitespace, and does not cross-check
  `isin`. Two rows for the same security reported under subtly different symbol strings (unlikely
  for Dhan's own export format, but possible for a hand-edited file) would not be caught as
  duplicates by this check; they would instead reach identity resolution as two separate rows.
- **No time-window or "looks similar" fuzzy duplicate detection.** Both mechanisms are exact-match
  (digest equality or exact id equality) by design — IPD's module comments are explicit that this
  is deliberate ("refuse rather than sum/average/deduplicate: any merge … would invent a position
  the broker never reported").

## 7. Conclusion

Whole-import duplicate detection is implemented and working as designed in the pinned IPD revision,
is exercised by existing passing tests at every IRR layer (server validator, HTTP route, client
transport, UI), and IRR's consumption of it is correct: it is pure relay, with shape
self-consistency checks, and no independent re-derivation of the duplicate decision anywhere in
this repository. No code change is recommended from this investigation; the one follow-up worth
tracking separately is the `importId` naming collision in §5.
