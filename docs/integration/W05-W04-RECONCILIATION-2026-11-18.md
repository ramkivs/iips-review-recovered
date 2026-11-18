# W05 × W04 reconciliation — harness, procedure, and the revision-1 run that is still blocked

**Date:** 2026-11-18 (UTC)
**Branch:** `arena/9852cfbf-iips-review-recovered` (from `main` `a55ce12f`, the merge of IRR PR #598)
**Status:** W05 **IN PROGRESS — NOT ACCEPTED**. This record delivers the review's item-2 machinery
(the reconciliation harness, its tests, and the operator input-bundle specification). **No W04
revision-1 reconciliation figure exists or is claimed here**, because the revision-1 per-holding
rows are not obtainable — see §3.

---

## 1. What this record delivers

| Deliverable | Where | State |
|---|---|---|
| Reconciliation harness | `iips-platform/src/investment/lifecycle/censusReconciliation.ts` | **done** — standalone module beside the merged lifecycle; no merged file's behaviour changed by it |
| Harness tests | `iips-platform/tests/investment/w05CensusReconciliation.test.ts` | **done** — 4 tests, synthetic declared rows, all passing |
| Operator input-bundle specification | §4 below | **done** — what must be supplied before the actual run can happen |
| Run procedure | §5 below | **done** |
| The actual revision-1 run and its holding-by-holding reconciliation | — | **BLOCKED**: the rows are in no repository and IPD is read-only to this session (§3) |

Any demonstration of the harness over the 68-row published Dhan CSV census
(`evidence/broker-import/operator-supplied/dhan-holdings*.csv`, assessed in
`docs/integration/B04-DHAN-68-ISIN-NSE-REASSESSMENT-2026-11-06.md`) is a run over **the CSV census
only** and is never evidence about revision 1. D1 keeps the two censuses apart
(`W05-ROADMAP-RECONCILIATION-2026-11-17.md` §4: no record maps the rows of one onto the holdings of
the other).

## 2. What the harness is

`runCensusReconciliation` takes a persisted holdings census as rows — `CensusHoldingRow`: holding id,
portfolio id/revision, symbol, ISIN, exchange, quantity, **the security identity the census stored
(or its absence)**, and the W04 five-category census disposition (`QUALIFIED`, `AMBIGUOUS`,
`MISSING_OR_UNRESOLVED`, `EXPIRED_OR_INELIGIBLE`, `UNAVAILABLE`) — and:

1. converts the rows to lifecycle observations **verbatim** (`observationsFromCensusRows`: no field
   is normalised, guessed or filled in; the stored identity and category travel in `raw` and
   `upstreamStatus`);
2. runs them through the shipped lifecycle (`buildIssuerLifecycle`) with the caller's identity
   sources, dataset catalog and — when supplied — the roadmap eligible-set designation (the same
   `EligibleSetDesignation` the lifecycle now accepts; exclusions are itemised and never enter rows
   or unresolved);
3. reconciles **holding by holding**: each entry carries the census story (category, stored
   identity) beside the run story (disposition `RESOLVED` / `UNRESOLVED` / `EXCLUDED_FROM_E`,
   resolution basis, issuer, coverage states, whether it contributes to the financial-ratio
   numerator) and an explicit identity-agreement verdict;
4. summarises category × disposition counts and agreement counts, with a headline that refuses to
   present a revision-1 figure from rows that are not the revision-1 rows.

**The D2 nuance is pinned.** Lifecycle `RESOLVED` is not W04 identity-passed: the resolver also
resolves on exchange+symbol. Where the census stored **no** security identity and the run
`RESOLVED` on `EXCHANGE_SYMBOL`, the entry records `RUN_ONLY`, `agrees: false`, and a note reading
it as a **disclosed disagreement** — the run reports what the census does not support — never a
reconciliation win. The converse split (`CENSUS_ONLY`) is likewise a disclosed disagreement;
`BOTH_IDENTIFIED` records only that both sides identify the holding (identity-content equality is
not asserted without comparable identifiers), and `BOTH_UNIDENTIFIED` is the agreeing case.

## 3. Why no revision-1 run happened here

- The W04 acceptance record (tracker `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`
  §16.286) limits itself: the identities-route response carrying revision 1's 64 holdings — each
  with its stored security identity or its absence — is **in no repository**, and the one qualified
  holding's security identity/issuer "never supplied to a record".
- IPD (`ramkivs/iips-production-market-data`) is read-only to this session: every standard access
  path fails with 403/404 (git smart HTTP, REST, GraphQL, installation APIs). The contents API was
  retested once on 2026-11-18 for the W04 evidence file and returned **403 again**. Do not retry
  from here; the operator has access.
- No DHAN/B04/B06/BROKER-IMPORT document in IRR maps the 68-row CSV census onto revision 1's 64
  holdings (reconfirmed 2026-11-18). The CSVs cannot stand in for the rows.

Therefore: **"0 of 64" is not a measurement** and no revision-1 coverage figure exists. The W04
record's own bounds (1 stored security identity, 63 none; at most 1 of 64 can count) are properties
of that record, not results of this harness.

## 4. Operator input-bundle specification (what the actual run needs)

The operator (with IPD/repository access) assembles one bundle, by hand under D3 (no automated
retrieval), containing:

1. **The revision-1 holdings rows** — the identities-route response for `DHAN_PORTFOLIO` revision 1
   (64 holdings, all active), as `CensusHoldingRow[]`:
   - `holdingId`, `portfolioId` (`DHAN_PORTFOLIO`), `portfolioRevision` (`1`) exactly as stored;
   - `symbol`, `isin`, `exchange`, `quantity` exactly as stored (nulls preserved — never filled in);
   - `storedSecurityIdentity` — the security identity the census stored, or `null` for the 63 rows
     with none (W04: "1 stored security identity, 63 none");
   - `category` — the W04 five-category census disposition per row (qualified 1 / ambiguous 0 /
     missing-or-unresolved 63 / expired-or-ineligible 0 / unavailable 0).
2. **The installed identity sources** — the identity source texts (`eligible-roster.json`,
   `listing-map.json`, `corporate-actions.json`) at their recorded versions.
3. **The dataset catalog** — catalog entries for any candidate issuer datasets to be considered
   (rights records attached; unknown/unsupported rights fail closed).
4. **The eligible-set designation (optional but recommended)** — `EligibleSetDesignation`: the
   documented product-scope basis and every excluded holding with its reason, if the roadmap's
   eligible set `E` is to be applied on this run. Without it, `E` equals every supplied holding and
   the result says so (`designated: false`).
5. **Provenance note** for the bundle: where each file came from, when, and its digest. Source
   documents and filing text stay out of commits; metadata, references and digests only.

If any row cannot be supplied in this shape, the run does not happen — a partial census would
produce a partial "reconciliation" that must not be presented as one.

## 5. Run procedure (when the bundle exists)

1. Verify the bundle's digests against its provenance note.
2. Load the rows as `CensusHoldingRow[]`; confirm 64 rows and the five-category counts against the
   W04 record before running. Any mismatch stops the run and is itself a reconciliation finding.
3. Call `runCensusReconciliation({ asOf, rows, identitySources, datasets, eligibleSet?, policy? })`
   (from `iips-platform/src/investment/lifecycle/censusReconciliation.ts`).
4. Read the output holding by holding:
   - every row appears exactly once in `entries` (5 = 64 expected);
   - `identityAgreement` flags every split between the census's stored-identity story and the run's
     resolution story — each `agrees: false` entry is a finding to record, not to smooth over (D2);
   - `summary.categoryByDisposition` is the reconciliation table against the W04 census;
   - `eligibleSet.exclusions` itemises anything outside `E`.
5. Record the result in a new evidence record (per-row table + summary + the harness/test versions
   and digests). Only after that record exists may a **revision-1** coverage figure be stated, and
   it must name its denominators (64 = W04 revision 1; `|E|` if designated) and its identity basis.
6. Cross-check the run's per-row dispositions against the W04 categories; explain every
   disagreement (in both directions) in the record. "0 of 64"-style statements remain prohibited
   until this procedure completes.

## 6. Boundaries

- IPD remains untouched and read-only; no cross-repository writes; no automated retrieval (D3
  stands); no bulk acquisition; source documents/filing text stay out of commits.
- The harness is standalone in `src/investment/lifecycle/` and does not change any merged module's
  behaviour; the frozen files (`rightsRecord.ts`, `w05LifecycleFixture.ts`,
  `w05RightsRecord.test.ts`, the `THETA_F` block of `threshold.ts`) are unchanged.
- W05 remains **IN PROGRESS — NOT ACCEPTED**; this machinery produces evidence only when the
  operator supplies the actual rows.
