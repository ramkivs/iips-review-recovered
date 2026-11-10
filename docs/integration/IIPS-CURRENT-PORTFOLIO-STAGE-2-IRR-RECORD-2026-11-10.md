# IIPS current-portfolio execution roadmap — Stage 2, IRR-owned work item record

**Record ID:** `IIPS-CURRENT-PORTFOLIO-STAGE-2-IRR-RECORD-2026-11-10`
**Roadmap (source of truth):** IPD `main` `f4e3de3a8fb3c4d78620674c32d5e334fc142aa5`,
`docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`, read in full before any change.
**Audit (controlling technical findings):** IPD `main`, `docs/integration/IIPS-CONSOLIDATED-SNAPSHOT-TO-CURRENT-ARCHITECTURAL-AUDIT.md`.
**IRR base:** remote `main` `513d2d20b57607e3102815c9c024bfa4e0a2b54a` (PR #547 merged).
**Repository:** `ramkivs/iips-review-recovered` (IRR only). No IPD write, no cross-repository change.
**Date:** 2026-11-10.

**Scope executed:** Stage 2 IRR-owned items W03, W05, W07, W08, W09 — repository-only investigation, plus
implementation where an implementation gap was demonstrated and its prerequisites were satisfied.

**No personal portfolio data, credentials, production, Broker Import, Dhan or IPD was accessed or modified.**
**Stage 3 was not started.**

---

## 1. Summary

| Item | Roadmap type | Finding | Change made | Status |
|---|---|---|---|---|
| **W03** | external / investigation | Artifact/report inventory mechanism EXISTS and is inventoried below. Actual counts need host access. | None (investigation only) | **PARTIAL — repository-only inventory delivered; actual inventory blocked (B02)** |
| **W05** | external / source verification | **GAP DEMONSTRATED**: the dataset class asserted RIGHTS from a provider-substring test. | Rights declaration added; class derived from declared evidence | **GAP CLOSED (repository-only). Actual per-issuer coverage and third-party rights still blocked (B02/B03)** |
| **W07** | source analysis | **NO GAP.** L-040 `RESOLVED`; L-038/L-039 `OPEN` on evidence. Semantics already correct. | None — status preserved deliberately | **CLOSED as investigated. L-038/L-039 remain OPEN by the register's own rule** |
| **W08** | investigation / implementation | **GAP DEMONSTRATED AND REPRODUCED**: the ISIN path discarded the observed `series`. | Series and symbol/exchange now constrain the ISIN path | **GAP CLOSED (repository-only). W08 ACCEPTANCE still depends on W04/host evidence** |
| **W09** | implementation / test | **NO IRR-SIDE GAP.** IRR already captures one revision per read. The blocking fix is **NOT in IPD main**. | None (investigation only) | **NOT ACCEPTED — IPD-side fix not merged; cross-portfolio limitation disclosed** |

**Overall Stage 2: PARTIAL.** Two of five items had a demonstrable, repository-only implementation gap and
those are closed. W03's actual evidence and W07's/W08's/W09's final acceptance all depend on external
evidence that is not available under this instruction.

---

## 2. W03 — Actual portfolio and report inventory

**Status: PARTIAL. Actual inventory NOT obtained — blocked by absent authorized host access (B02).**

No personal data was accessed. What CAN be inventoried without personal data is the mechanism, and it exists:

| Mechanism | Location | What it does |
|---|---|---|
| NP-06 canonical artifact | `frontend/server/reports/canonical.ts`, `artifact.ts` | Canonical content, `reportKey` derived from chain-identifying members, `reportId` as a distinct persisted instance. |
| NP-06 → NP-04 delegation | `frontend/server/reports/persistence.ts:98-145` | `toNp04Content` / `toCanonicalArtifact`; delegates to the separately pinned NP-04 port. It does **not** create a Reports database or mint NP-04 instance IDs. |
| Persistence port | `frontend/server/reports/persistence-port.ts:150-295` | `assertNp04PersistencePort`, `loadAuthoritativeNp04Persistence` — the owner-scoped carrier. |
| Transport | `frontend/server/reports-transport.ts` | List / create / detail / append / supersession, with owner resolution and fail-closed persistence. The Reports **UI** is read-only; the server has guarded POST routes. |
| IID chain | `frontend/server/investment/investmentArtifacts.ts:524-815` | Chain head, stored version readback, substantive identity (clock-only vs content change), chain membership validation. |

**What is inventoried (repository-only):** the artifact types, the canonical shape, the persistence and
supersession semantics, the owner boundary, the digest/provenance fields, and the fact that two identical
`persistNew` calls can produce separate instances (an append is not a new store).

**What is NOT, and cannot be, inventoried here:** sanitized revision/holding counts, actual artifact instance
counts, per-portfolio read times, and the reconciliation of artifacts to a captured revision. The roadmap's
acceptance for W03 is *"counts reconcile to captured revision, empty/unavailable/unknown distinguished"* —
that requires a captured revision, which requires host access. **No count, count proxy or readiness claim is made.**

**Dependency:** B02 — usable non-production host access under its owner controls. This record does not assume
the host is absent or that startup has failed.

---

## 3. W05 — Financial coverage and source rights

**Status: an implementation gap WAS demonstrated and IS closed. Actual coverage and third-party rights remain blocked.**

### 3.1 The defect

`frontend/server/investment/cli/generate-investment-artifacts.ts` classified a dataset by a substring test on
the manifest's free-text `provider` field:

```ts
manifest.provider.includes('synthetic') || manifest.provider.includes('fixture')
  ? 'SYNTHETIC_REFERENCE'
  : 'APPROVED_LOCAL_INGESTION';
```

Two unsupported claims were made at once. The class asserted a **rights** state — the word "approved" claims a
review that no review performed — and it did so from a label the same operator wrote. `DatasetManifest` had no
rights field at all (`iips-platform/src/investment/fundamentals/manifest.ts`: only a free-text `licence`).

This is what the roadmap forbids: *"Do not assume a source is permitted merely because it exists locally"*;
*"no provider label as proof"* (audit B); GD-3; blocker B03.

It was also **reader-visible**: `frontend/server/investment/assessmentComposition.ts:281` writes the class into
`provenance.datasetClass`, and `frontend/src/features/investment/CompanyAssessmentPage.tsx:606` renders it
beside the dataset version. A reader was told the data was "approved" on the strength of a substring test.

The same test existed at `frontend/server/investment/demo/m1Pipeline.ts:133`.

### 3.2 The change

1. **`iips-platform/src/investment/fundamentals/manifest.ts`** — a `sourceRights` declaration on the manifest:
   `SYNTHETIC` | `OPERATOR_ASSERTED` | `UNKNOWN`, with a required `basis` for `OPERATOR_ASSERTED`.
   `assertSourceRights` **refuses** a malformed declaration rather than downgrading it, and an absent
   declaration is `UNKNOWN`. The field is optional on the wire, so a dataset written before it existed still
   reads — and carries no rights evidence.
2. **`iips-platform/src/investment/fundamentals/datasetClass.ts`** (new) — the single source of truth for the
   class. `classifyDataset` derives it from the **declared rights evidence and nothing else**; `provider` and
   `licence` are not consulted. `datasetClassStatement` gives a reader-facing account of what each class does
   and does not assert.
3. **`iips-platform/src/investment/ingestion/writer.ts`** — `writeDataset` accepts and writes the declaration.
4. **`frontend/server/investment/assessmentComposition.ts` / `dispositionComposition.ts`** — the duplicated
   `DatasetClass` enums are replaced by the platform's, so the assessment path, the disposition path and the
   ingestion path cannot disagree about what a class MEANS.
5. **Every dataset writer now declares its rights honestly**: the M1 shipped dataset and the test fixture
   declare `SYNTHETIC`; the ingest CLI and the real-issuer regression declare `OPERATOR_ASSERTED` with the
   operator's own input files as the basis.
6. **The vocabulary changed deliberately.** `APPROVED_LOCAL_INGESTION` is gone; it named an approval no review
   produced. `OPERATOR_SUPPLIED` names what actually happened — the operator supplied the data — and the rights
   question it used to answer is now answered separately and explicitly.

### 3.3 The reader-visible consequence

`UNKNOWN` is the fail-closed default. A dataset whose rights evidence was not supplied is now classified
`UNKNOWN`, and the CLI's L-004/L-009 lines say so instead of asserting operator-supplied real data. The
`OPERATOR_SUPPLIED` statement reads *"operator attestation … not an independent verification of any third
party's rights"*.

### 3.4 What was NOT changed, and why

- **No historical evidence artifact was rewritten.** `evidence/real-issuer/**/runs/*.json` still contain
  `APPROVED_LOCAL_INGESTION`; those are immutable records of past runs and the roadmap forbids rewriting them.
- **No licence text was reinterpreted.** `manifest.licence` is unchanged; it remains free text.
- **No third-party rights were asserted, granted or denied.** The declaration records the operator's own
  attestation and its basis, and says nothing about any other rights-holder.
- **No D-2, IX, valuation, capital-structure or IID policy rule was touched.**

### 3.5 Remaining dependency

**Actual per-issuer coverage, period/basis, and third-party rights remain unverified (B02/B03).** The
`OPERATOR_ASSERTED` state is an operator attestation, deliberately named so that it cannot be read as a
verification. If a chosen source requires a rights-holder's permission, that permission must be obtained and
recorded as the basis instead — the standing grant does not confer another party's rights.

---

## 4. W07 — Issuer limitation semantics

**Status: NO GAP. Investigated; nothing changed, deliberately. L-038 and L-039 remain OPEN.**

### 4.1 L-040 — `RESOLVED`, correction preserved

`docs/integration/IIPS_V3_IID_L040_VALUATION_OUTPUT_CORRECTION_2026-11-07.md`. The WI-8 payload published a
per-share value (₹488.34) produced by treating four missing bridge terms as nil. Root cause: `buildSensitivity()`
in `iips-platform/src/investment/assessment/intrinsic.ts` re-implemented the enterprise-to-equity bridge
inline with nullish-coalescing defaults instead of calling the governed `equityValueFromEnterprise()` /
`perShare()`. Secondary cause: `buildEvidence()` composed the `EV-DCF_FCFF` claim from applicability and a
present-input count rather than from the output.

The correction is in place and regression-guarded by
`iips-platform/tests/investment/l040ValuationZeroSubstitution.test.ts` (17 tests), and `wi8IndustrialsKec.test.ts`
pins the historical payload byte-identical as superseded/non-authoritative and pins the corrected readback
digest and the 20-path diff. The original payload digest `4f89f0ec…e351` and the corrected
`fc50c53e…f370` are both retained.

**Preserved and unchanged by this work item.** No valuation formula, policy or parameter was touched.

### 4.2 L-038 — `OPEN` (preference capital, Marico consolidated)

`evidence/real-issuer/WI12-L038-PREFERENCE-CAPITAL-2026-11-08/README.md`. Three consecutive audited
consolidated reports were read; **no mapping was accepted**. Eight candidate mappings were each rejected with
a stated reason. The determination stands on *"a silence in the source"*, not on a missing rule or an unread
document.

**Status stays `OPEN`.** It is blocked by the absence of a qualifying source disclosure, and no such
disclosure exists in the repository.

### 4.3 L-039 — `OPEN` (current investments, KEC)

`evidence/real-issuer/WI12-L039-CURRENT-INVESTMENTS-2026-11-05/README.md`. The hash-matched March-2026 XBRL
fact was recovered: `<in-capmkt:CurrentInvestments contextRef="OneI" decimals="-7" unitRef="INR">0</…>`, with
`OneI` identifying `532714` under the SEBI `ScripCode`, instant `2026-03-31`, no segment/scenario/typed
dimensions, nil and precision absent. `decimals="-7"` gives accuracy to ₹1 crore — **not** an exact economic
zero. The taxonomy definition, schema-default dimensions and presentation linkbase could not be verified.

The determination is **outcome C — indeterminate**: neither an issuer economic zero nor template defaulting is
established. `CURRENT_INVESTMENTS` remains `MISSING / NOT_REPORTED` and **L-039 stays `OPEN`**.

### 4.4 Why no status was changed

The register's own rule (`docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md`) is that
`PARTIALLY RESOLVED`/`RESOLVED` require (a) an implementation addressing the entry, (b) an acceptance test that
would fail on regression, and (c) an evidence pointer — and that **"no status improves without evidence"**.

L-038 and L-039 have (c) but not (a) or (b), because there is no qualifying source disclosure to implement
from. Closing either would be fabrication. The register's carry-forward rule and the audit's B08 both stand:
**missing/not-reported semantics are retained where evidence is insufficient**, and unaffected valid methods
proceed.

**The L-040 correction cannot be used to close anything else** — `wi8IndustrialsKec.test.ts` explicitly pins
"L-040 is `RESOLVED` **and** L-039 is still `OPEN`".

---

## 5. W08 — Exact security-to-issuer bridge

**Status: an implementation gap WAS demonstrated, REPRODUCED, and closed. W08 ACCEPTANCE is still blocked on W04.**

### 5.1 The contract mismatch (confirmed from source)

| Contract | Form | Carries |
|---|---|---|
| IRR (`iips-platform/src/investment/contracts/ids.ts:144-145`) | `IN:ISIN:<isin>` / `IN:EQISIN:<isin>` | ISIN |
| IPD D114 (`src/contracts/types.ts:73-87`) | `ISIN:<isin>:<series>` | ISIN **and series** |

IRR's `G2HoldingView` (`frontend/server/user-portfolio/userPortfolioContract.ts:264-279`) carries `isin?` and
`exchange?` but **no `series` field**, and IRR never receives the D114 `securityIdentity` object.

### 5.2 The defect, reproduced against the repository's own fixture

`iips-platform/src/investment/identity/resolver.ts` consulted `input.series` **only on the symbol path**
(line 362). On the ISIN path it never read the series at all; `preferListing(active)` sorted `EQ` first and
then by earliest `effectiveFrom`.

The repository's own listing map contains a multi-series security, `IN:ISIN:IN0000000029`, with three
listings: `IN:NSE:TWINS:BE:EQUITY` (issuer B's duplicate active symbol, from 2021-01-01),
`IN:NSE:BODHI:EQ:EQUITY` (from 2021-02-15) and `IN:NSE:BODHI:BE:EQUITY` (from 2022-03-01).

Observed behaviour before the fix:

```
isin=IN0000000029, symbol=BODHI, exchange=NSE, series=BE
  -> RESOLVED, listing IN:NSE:BODHI:EQ:EQUITY     (the EQ listing; the series was discarded)
```

and with `series=EQ` the **same** listing was returned — the signature of a series that is never read.

### 5.3 The change

`iips-platform/src/investment/identity/resolver.ts`, ISIN path only:

1. The candidate set is narrowed by an explicitly supplied **series**. If the security is listed and active but
   not in the declared series, that is **reported** (`AMBIGUOUS_LISTING` / `MULTIPLE_SECURITIES_SHARE_LISTING`)
   rather than resolved to a listing the observation did not name.
2. The candidate set is then narrowed by the observed **symbol and exchange**. If the security is not listed
   under the observed symbol, that is reported rather than substituted. This closes the second defect, where
   narrowing by series alone still let `IN:NSE:TWINS:BE:EQUITY` win on the earliest `effectiveFrom`.
3. The reused-symbol diagnosis keeps **precedence**, because *"this symbol now belongs to a different
   security"* is the more specific finding and names a different remedy. This ordering was chosen so that
   `SYMBOL_REUSED_BY_OTHER_SECURITY` — an existing, separately-evidenced state — is not obscured.

The symbol path is unchanged. The resolver was already fail-closed elsewhere: exact ISIN precedes
exchange+symbol; a valid-but-absent ISIN is `UNMATCHED` with **no symbol fallback**; dated listing windows
produce `LISTING_WINDOW_EXPIRED` / `LISTING_NOT_YET_EFFECTIVE`; reused symbols are `AMBIGUOUS`; two securities
sharing a listing are `AMBIGUOUS_LISTING`; sector references are rejected as identity; and the issuer key is
never resolved by picking one side of a conflict.

**No issuer identity is inferred from a symbol.** The ISIN path still requires a roster ISIN; the symbol path
still requires the listing map.

### 5.4 Verification

`iips-platform/tests/investment/w08SecurityToIssuerBridge.test.ts` — 11 tests covering ISIN/series,
multi-series, the observed symbol, a series the security does not have, a symbol it is not listed under, the
preserved reused-symbol / not-in-roster / malformed-ISIN diagnoses, and determinism.

**5 of the 11 fail against the pre-fix resolver** (verified by reverting the resolver and re-running), so they
are genuine regression guards rather than tautologies.

### 5.5 What W08 acceptance still requires

The roadmap's acceptance asks for ISIN/series **and separately evidenced** exchange/listing→issuer, against
W04 results and actual source evidence. The **bridge mechanics** are now correct and tested; the **per-row
mapping for the actual portfolio** is W04 and is not verified, because it needs host data. **W08 acceptance is
therefore NOT claimed.**

---

## 6. W09 — Revision-aware portfolio consumer

**Status: NO IRR-SIDE GAP FOUND. W09 acceptance NOT claimed — the IPD-side fix is not in IPD main.**

### 6.1 What IRR already does

- `frontend/server/user-portfolio/ipcPortAdapter.ts:252-253` — `portfolio.get` is **one IPC call** returning one
  `G2PortfolioView` with **one** `revision` (line 502) and one `provenanceDigest`. It is not a composition of a
  list read and a detail read.
- `frontend/server/investment/portfolioContext.ts:139` — the disposition's `portfolioRevision` is that view's
  revision, or `null` when absent (absent evidence, never revision zero).
- Owner isolation is preserved: an unestablished owner context throws before the port is constructed, and the
  scope stays empty so IPD resolves the owner from its own active binding.

So the consumer already captures a revision vector per read. There is no duplicate store and no cross-service
atomicity assertion to remove.

### 6.2 The remaining IRR-side limitation, disclosed

`frontend/server/investment/sources.ts:128-140` — the coverage holdings provider does list-then-get per
portfolio, so **different portfolios can be at different revisions**. This is a real cross-portfolio
limitation. It is **not** fixed into atomicity, because the roadmap forbids asserting cross-service atomicity
without proof, and no cross-service snapshot exists. It remains disclosed.

### 6.3 The IPD W02 fix status — the decisive finding

The roadmap names `29caac3134ec1fb12e4d822c31a806d782cc3e1b` as the IPD W02 fix ("Keep portfolio read
projections on a consistent SQLite snapshot"). Verified:

| Check | Result |
|---|---|
| `git merge-base --is-ancestor 29caac3 f4e3de3` | **NO** — the commit is not an ancestor of IPD main |
| `git branch -a --contains 29caac3` | **no branch contains it** |
| `gh pr list` (IPD, all states, 15 most recent) | **no PR for it** — latest is #149, the audit/roadmap merge |
| GitHub contents API on IPD main `src/persistence/portfolio_store.ts` | `withReadSnapshot` count = **0**; only `BEGIN IMMEDIATE` **write** transactions |

The fix adds `withReadSnapshot` / `getSnapshot` / `revisionsSnapshot` — exactly the read-snapshot wrapper that
would address the audit's "detail holdings + contributions under an external write — NOT VERIFIED" finding.
**It is not in the main the consumer would read, so it does not yet resolve the identified consumer risk.**

### 6.4 Conclusion

IRR's revision capture is already in place and correct. The residual risk is IPD-side and its remedy is
pending merge into IPD main. **W09 acceptance is NOT claimed.** W02's multi-binding concurrency coverage also
remains incomplete, and W03's actual revision evidence is still blocked (B02).

---

## 7. Verification

All checks run on IRR `arena/1128ed65-iips-review-recovered` at base `513d2d2`.

| Gate | Result |
|---|---|
| Frontend Vitest (full) | 188 files passed, 1 skipped — **2693 passed, 1 skipped** |
| Frontend typecheck | exit 0 |
| Frontend replay-server typecheck | exit 0 |
| Frontend investment-server typecheck | exit 0 |
| Frontend production build | exit 0 |
| Platform typecheck | exit 0 |
| Platform `test:iid` | **806/806** (777 before this work item, +29 new) |
| Platform `src` + `regression` suite | 648 pass / 30 fail — **the 30 failures are byte-identical to pristine upstream `513d2d2`** (verified in a detached pristine worktree; A13 git-control tests that inspect the working tree, not defects introduced here) |

**Pre-fix regression proof.** `iips-platform/tests/investment/w08SecurityToIssuerBridge.test.ts`: 5 of 11 fail
against the pre-fix resolver. `frontend/server/investment/cli/w05SourceRightsClassification.test.ts`: 4 of 5
fail against the pre-fix classifier. Both were verified by reverting the implementation and re-running.

**No browser/E2E verification was performed.** The evidence above is unit/integration level.

---

## 8. Dependencies, exactly

| Dependency | Affects | State |
|---|---|---|
| B02 — actual host access | W03 actual inventory; W04; W05 actual coverage; W09 final acceptance | **Not available.** No access was attempted; no proxy for it exists. |
| B03 — external source rights | W05 third-party rights; W07 source-holder rights | **Unknown.** Not denied. The W05 declaration now records the operator's attestation, not a rights-holder's permission. |
| B04 — revision and identity | W08/W09 | **Partially addressed**: the W02 fix is not in IPD main; the W08 bridge mechanics are closed in IRR. |
| B08 — unresolved source semantics | W07 | **Unchanged and correctly so.** L-038/L-039 remain OPEN on evidence. |
| W02 multi-binding concurrency coverage | W09 | **Incomplete.** |
| W04 actual identity coverage | W08 acceptance | **Unknown.** |
| IPD `29caac3` merged into IPD main | W09 | **Not merged.** |

---

## 9. Boundary

- IRR repository only. **No IPD write.** No cross-repository change. The IPD clone was read-only.
- **No personal portfolio data, credentials, production, Broker Import or Dhan work.**
- **No IID policy, D-2, IX valuation, capital-structure, disposition-generation or identity-governance rule was
  changed.** Existing IID policies and NP-04/NP-06 mechanisms are preserved.
- **No historical evidence artifact was rewritten.** Historical runs still say `APPROVED_LOCAL_INGESTION`,
  because they are immutable records of what those runs produced.
- The historical 13-engine v1.2 certification is untouched and is **not** recertified or extended by this work.
- **Stage 3 was not started.**
- No browser/E2E verification was performed; no actual host evidence was obtained; no W08 or W09 acceptance is
  claimed.
