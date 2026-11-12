# Defect A — reader-visible limitation counts had drifted from the code

**Status:** CORRECTED (narrowly), with one register-prose item flagged for the register owner.
**Found by:** re-validating a real issuer (Infosys Limited) at the current authoritative head and counting the
product's own mappings, then comparing the count with every place the product states it to a reader.

## What a reader was told, and what the code says

The IID-3 assessment surface publishes a short limitation notice beside every assessment, in two places that must
agree:

| Where | File | What it said | What the code says |
|---|---|---|---|
| CLI run summary | `frontend/server/investment/cli/generate-investment-artifacts.ts` → `limitationsForDatasetClass` | `L-002 20 XBRL tags mapped` | `Object.keys(XBRL_TAG_MAP).length` = **22** |
| Client disclosure | `frontend/src/api/investment.ts` → `LIMITATION_DISCLOSURES` | `L-002 … "20 XBRL tags are mapped"` | **22** |
| Coverage report | `iips-platform/src/investment/identity/coverage.ts` → `buildFinancialCoverageDisclosure` | `xbrlMappedTags` = **22** (already derived from code) | 22 |

So one product told the reader **two different numbers** for the same fact: the coverage page said 22 (it reads
`XBRL_TAG_MAP` directly), while the assessment notice said 20 (a typed literal). The literal went stale when the
V2 associates/JV work added two tags to `XBRL_TAG_MAP` (20 → 22) and the notice was not updated with it.

The independent census in `verification/mapping-census.json` records the truth at this head:
`xbrlTagsMapped: 22`, mapping `distinctLineItemsWithAnXbrlTag: 21`, over a closed vocabulary of
`lineItemsInClosedVocabulary: 53`, with `derivationsInClosedSet: 8`.

`L-003` ("closed derivation set = 8 items") was **already correct** — `DERIVATIONS.length` is 8 — but it was a
typed literal too, so it was one un-remembered edit away from the same drift.

## What was corrected, and how narrowly

Both notices now **read the count from the code** instead of restating it:

- `limitationsForDatasetClass` builds the `L-002` and `L-003` lines from `Object.keys(XBRL_TAG_MAP).length` and
  `DERIVATIONS.length`.
- `LIMITATION_DISCLOSURES` (presentation-only; it imports nothing from `iips-platform`, so the number cannot be
  derived there without breaking that boundary) is corrected to `22` and then **pinned**:
  `frontend/server/investment/cli/rivHeadRevalidation.test.ts` reads the file back and fails if the stated count
  and `Object.keys(XBRL_TAG_MAP).length` disagree, and if the `L-003` line and `DERIVATIONS.length` disagree.

Deriving the count makes the drift *impossible* rather than merely corrected once. This is digest-neutral: the
notice lives in the CLI **summary** and the client **disclosure**, not in the canonical assessment payload, so the
head payload digest is unchanged (`18f5ccb6…`) — see `runs/02-generate-head-clock.txt`.

## What was deliberately NOT changed

- **`L-001` "3 of 13 sectors measured" is correct and was left alone.** That count is the frozen sector-analytics
  *engine qualification* coverage (R-16), a standing product property; the notice's own parenthetical says
  "sector-analytics coverage, not this milestone". It is a different notion from this single-issuer dataset's
  coverage-report `measuredSectors: 1` (Infosys spans Technology only). Changing 3 → 1 would have *misstated* the
  engine-qualification count. Verified against the register's `L-001` entry and the ingest CLI's per-sector table
  (`runs/01-ingest.txt`: Technology `G2_PARTIAL`, the other twelve `UNMEASURED` for this dataset).
- **`L-009` "no real issuer has been assessed" is factually superseded** by this and the earlier real-issuer work
  items, but its notice text mirrors the register's §2 short title. Restating it means restating the register,
  which is the register owner's act, not a validation work item's. It is flagged in the register overlay (§17.x)
  and left verbatim.
- **The register's own `L-002` prose still reads "20 XBRL tags".** §2 of the register is append-only; this work
  item does not edit it. The overlay records that the code count is now 22 and that the reader-visible notices
  were corrected to derive it, so the register owner can reconcile the §2 prose deliberately.

## Relation to the register

`L-002` and `L-003` stay **OPEN** with their identifiers, subjects and direction unchanged. Nothing was closed,
renumbered or reinterpreted. The correction is to the *product's restatement* of the count, not to the limitation:
unmapped tags remain visible gaps (`L-002`), and the derivation set remains closed at 8 (`L-003`). The overlay
notes the 20-vs-22 prose discrepancy for the register owner.

## Reproduction

    cd iips-platform && npx tsx --test tests/investment/identity-coverage.test.ts   # coverage path derives 22
    cd frontend && npx vitest run server/investment/cli/rivHeadRevalidation.test.ts # both notices pinned to the code
    # verification/mapping-census.json → countedAtHead.xbrlTagsMapped = 22
