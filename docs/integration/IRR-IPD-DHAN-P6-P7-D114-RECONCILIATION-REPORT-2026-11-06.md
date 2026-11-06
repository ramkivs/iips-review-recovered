# IRR ↔ IPD Dhan P6/P7 D114 Reconciliation Report

**Date:** 2026-11-06

**Scope:** IRR consumer only; IPD source was inspected read-only. No production acceptance or live Dhan qualification is claimed.

## 1. Verified source and dependency refs

The current IPD remote was checked directly before pinning:

| Item | Verified ref / SHA |
|---|---|
| IPD P7 branch | `refs/heads/arena/aeea3efb-iips-production-market-data` |
| IPD P7 branch tip | `f2bb47dc50fc8f16ee8d3354f6f4e8bf995e4bbc` |
| P7 commit parent | `a8019f12cb41f69b911f425d2f557edfa18cb1d6` |
| IPD `main` at inspection | `1cde2324ed4b4d636248af9ea3d87b10cac3d031` |

The P7 target is a feature-branch commit, not IPD `main`; the refs remain separate. The branch was independently rechecked with `git ls-remote` after implementation. No IPD branch, file, commit, or PR was changed.

| IRR dependency | Before | After |
|---|---|---|
| `iips-production-market-data` | `6004ff81dd1064c5b69b15fde1f3a6c4f44981a0` | `f2bb47dc50fc8f16ee8d3354f6f4e8bf995e4bbc` |
| `iips-broker-import` | `07e86a4f2c105651f3097a96cb519f8611945e30` | unchanged |
| `iips-np04-governed-persistence` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | unchanged |

The independent broker-import and NP04 aliases were not collapsed or repinned. The package manifest and lockfile resolve the same P7 commit.

## 2. Contract findings

### G-2 persisted holding identity

At the verified P7 source:

- Migration `src/persistence/migrations/005_holding_security_identity.ts` adds nullable `security_identity` without an identity backfill. A missing value remains unresolved.
- `HoldingInput` accepts an explicit canonical D114 identity or `null`. Store validation rejects malformed/inconsistent D114 values and prevents silent replacement or drop of an existing series identity.
- `portfolio.get` selects the persisted field and projects each holding's `securityIdentity`; the value comes from the durable row, not a symbol, company name, or inferred exchange series.
- The store's holding shape does **not** persist a separate `exchange`/`exchangeSegment`. IRR preserves an explicit exchange only if a valid read source supplies one; it does not derive a segment from a symbol or D114 series. If omitted, the pinned IPD service applies its documented `NSE_EQ` default; BSE-only resolution consequently remains blocked unless the exact request can resolve under the actual IPD contract.

### P6/P7 exact Dhan request and failure behavior

- The exported `QuoteRequest` requires `companyId` plus full `securityIdentity: D114SecurityIdentity`; `exchangeSegment` is optional. The service validates D114 before provider access and calls IPD's exact registry resolver with company, segment, ISIN, and series. It never falls back to company-only or ISIN-only matching.
- P7 contributes a qualified exact registry. An unresolved registry result is `UNRESOLVED_INSTRUMENT`; ambiguous company/listing identity is distinguished by the safe reason prefix `AMBIGUOUS_MAPPING`. IRR maps these to `NO_QUALIFIED_DHAN_MAPPING` or `IDENTITY_AMBIGUOUS` without returning raw upstream messages.
- The exported authenticated HTTP client transmits `{ companyId, securityId: "ISIN:<isin>:<series>", exchangeSegment? }`. The server reconstructs and validates D114 before invoking the service. Provider Dhan instrument IDs remain internal to IPD and are not part of the transport request.
- D01 normalization does not echo D114 identity. IRR therefore accepts an omitted response identity only after the exact D114 request has been sent to IPD; if the response does provide an identity, IRR requires it to match the complete request (including series), and allowlists only canonical response fields for the browser.
- D02 historical request/response remains a separate path. Its request has interval/date bounds and optional segment/ISIN but no D114 series; IRR's current valuation does not request historical data.

### P7 qualification limits

The P7 qualification manifest records two snapshots of 217,104 rows each; 23,764 equity candidates reconciled 23,764/23,764. It reports 96 exact qualified mappings; 193,340 non-equity rejections, 24 invalid-field rejections, 23,644 no-P04-correspondence rejections, and zero schema, ambiguous-identity, duplicate, or conflicting-provider-ID rejections. Coverage is BSE:A 47, BSE:B 1, and NSE:EQ 48.

The qualification uses exact ISIN plus an active same-exchange P04 listing. D114 series is sourced from the Dhan `SERIES` field, which P04 does not independently validate. The manifest's `QUALIFIED` status is a static mapping qualification only; it does not prove live Dhan quote access, current tradability, credentials, or production readiness.

## 3. IRR changes

- Pinned only the general market-data package and lockfile to the verified P7 commit; the independent dependency aliases above remain unchanged.
- Added the nullable D114 field to the read-only G-2 holding view and browser DTO. G-2 read projection is now explicit allowlist-based; unknown provider-only holding fields and nested mapping identifiers are stripped.
- Updated the read adapter to preserve exact valid D114 identity and `null`. Malformed identity is retained only as a safe invalid marker for reason coding; its source values are not forwarded. No holdings, snapshots, cost basis, quantities, transactions, or revisions are written or modified.
- Quote preflight is per holding. Missing, malformed, or non-canonical identity is not requested; exact valid holdings proceed independently through the exported authenticated IPD transport. Dhan mapping resolution and provider behavior are not duplicated in IRR.
- Added the reason-coded disposition to read-only valuation results and UI: `QUOTE_ELIGIBLE`, `IDENTITY_MISSING`, `IDENTITY_INVALID`, `IDENTITY_AMBIGUOUS`, `NO_QUALIFIED_DHAN_MAPPING`, `TRANSPORT_UNAVAILABLE`, or `OTHER_BLOCKED`. A blocked holding does not suppress an independently valid neighbor. Partial value is labeled a subtotal, never a portfolio total.
- Quote envelopes are projected from an allowlist; transport credentials, Dhan provider DTOs, and provider-specific IDs are not included in browser-facing results. Quote-derived prices/values remain transient and are not persisted.
- The G-2 IRR read-contract version is now 3 for the additive nullable identity field. Broker import remains a separate workflow.

## 4. Holdings audit and fixture separation

### Actual persisted/read-side holdings

No actual G-2 database, configured read-side portfolio service, or persisted user holding rows were available in this workspace. A filename-only search found no SQLite/database files or local environment configuration. Therefore **actual holdings inspected: 0**. This is an evidence limitation, not a claim that unresolved/blocked holdings do not exist.

| Actual-row disposition | Count |
|---|---:|
| `QUOTE_ELIGIBLE` | 0 |
| `IDENTITY_MISSING` | 0 |
| `IDENTITY_INVALID` | 0 |
| `IDENTITY_AMBIGUOUS` | 0 |
| `NO_QUALIFIED_DHAN_MAPPING` | 0 |
| `TRANSPORT_UNAVAILABLE` | 0 |
| `OTHER_BLOCKED` | 0 |
| **Actual persisted rows observed** | **0** |

No persisted identity was inferred, changed, backfilled, or dispositioned as though real.

### Synthetic-only validation data

- IPD's in-memory SQLite G-2 security-identity test constructs 11 initial synthetic holding rows: 7 with explicit synthetic D114 values and 4 with `null`. It tests persistence, legacy null preservation, refusal to replace/drop identity, and read projection. These are not IRR user holdings and were not treated as P7 matches.
- The IRR consumer test matrix has six synthetic rows, one for each of `QUOTE_ELIGIBLE`, `IDENTITY_MISSING`, `IDENTITY_INVALID`, `IDENTITY_AMBIGUOUS`, `NO_QUALIFIED_DHAN_MAPPING`, and `OTHER_BLOCKED`; a separate synthetic case covers `TRANSPORT_UNAVAILABLE`. The test quote is mocked and is not an observed market quote.
- A read-only check registered the 96 `QUALIFIED` mappings from the P7 manifest into IPD's own exported registry, then resolved the exact manifest TCS/NSE/D114 identity (`EQ_TCS_IN`, `ISIN:INE467B01029:EQ`) as `RESOLVED`; the wrong series failed as `UNMAPPED_COMPANY_ID`. No provider request or quote was made. The IRR TCS HTTP fixture uses that same exact manifest identity but a synthetic response, so it proves consumer compatibility—not a live quote or production mapping deployment.
- The workspace's cross-sector golden/replay portfolio datasets are explicitly synthetic analytics fixtures, not G-2 persisted holdings; the 14-entry cited-source manifest contains repository/blob/path/hash references, not holding rows. They were excluded from the holdings audit.

## 5. Validation performed

- IRR focused Vitest: `marketDataValuation`, `ipcPortAdapter`, `userPortfolioContract`, `option2F`, `user-portfolio-transport`, and `UserPortfolioDetail` — **6 files, 107 tests passed**.
- Targeted TypeScript check for the modified G-2 contract/adapter/valuation and focused tests — passed.
- Frontend consumer build: `npm run build` — passed (`tsc -b` and Vite build); Vite emitted only the existing large-chunk advisory.
- In a temporary extraction of the exact read-only IPD P7 archive: `npm run build:tsc` passed; targeted compiled suites for P5 transport, P6 exact identity, P7 qualification, and G-2 identity — **34 tests passed**. The P7 suite's fixtures are synthetic; the separate manifest-backed registry check above is static mapping evidence. No IPD checkout or branch was edited.
- `git diff --check` passed for the reconciliation changes.

## 6. Limitations and publication boundary

There was no actual persisted portfolio data or configured authenticated IPD endpoint to audit, and no live Dhan credential/access was used. Consequently, no real holding is claimed quote-eligible and no live provider connectivity/tradability is claimed. P7 static qualification does not confer live qualification. D02 is not consumed. No production acceptance, IPD `main` change, or IPD write is included.

This report and the consumer reconciliation are published only on the existing IRR Arena branch. Remote branch SHA verification is recorded with the publication result; no other branch is changed.
