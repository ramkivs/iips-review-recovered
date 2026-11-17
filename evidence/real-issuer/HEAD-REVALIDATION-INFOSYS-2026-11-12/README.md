# WI-13 — head re-validation: the same issuer, the same committed dataset, re-run at the current head (2026-11-12)

**Issuer:** Infosys Limited · CIN `L85110KA1981PLC013115` · ISIN `INE009A01021` (the WI-1/WI-2/WI-3 issuer).
**Baseline:** `a835d4af019ab4f677ab238ec42d44326f06a771` (the authoritative head; == `origin/main` at run time).
**Question every earlier real-issuer bundle left open:** a digest recorded at one head is a claim about *that* head.
Between WI-3 (`accf9c1`) and now the product acquired the `a54591e` listing-narrowing, the `8603138` coverage work,
the XBRL/mapping changes and the IX authorised policy (`L-034`). Does the same issuer on the same committed dataset
still reproduce — and does the product's own self-description still match its code?

**Answer in one sentence:** the arithmetic reproduces exactly — an out-of-engine recomputation regenerates the
intrinsic triad **875.34 / 1088.97 / 1399.81** byte-identically and the margin of safety **−8.42 %** (band `FAIR`),
the persisted head payload (`18f5ccb6…`, 55,573 B) reads back to the same digest, and the diff against WI-3 is
**14 changed paths, 0 unattributed** — but re-reading the product's *self-description* against its code surfaced
**three defects**, of which one was a narrow digest-neutral correction (defect A) and two are contract decisions
recorded as new limitations **`L-041`** and **`L-042`** rather than fixed inside a validation work item.

| Re-validated at head | WI-3 recorded (`accf9c1`) | Head re-validation (`a835d4a`) |
|---|---|---|
| datasetVersion | `sha256:21cf2522…` | **`sha256:21cf2522…` — reproduced, unchanged** |
| listingId | `IN:BSE:500209:EQ:EQUITY` | `IN:NSE:INFY:EQ:EQUITY` (the `a54591e` narrowing) |
| confidence | 0.6736 | **0.4378** = 0.6736 × 0.65 (the authorised `L-034` cap, **not** issuer drift) |
| intrinsic (low/mid/high) | 875.34 / 1088.97 / 1399.81 | **byte-identical** |
| margin of safety | −8.42 %, band `FAIR` | **−8.42 %, band `FAIR`** |
| payloadDigest | `83644bc6…` (51,196 B) | `18f5ccb6…` (55,573 B) — **14 paths differ, all attributed** |
| limitations published | 5 | 8 |

---

## 1. What was run, and what is claimed

WI-13 re-ran Infosys at head and read the result three ways — at the run clock, at a pinned same-instant clock, and
against the WI-3 recorded payload — with an independent recomputation from the committed CSVs run **outside** the
assessment engine (`iips-platform/scripts/riv-head-revalidation.ts`).

**Claimed.** The valuation reproduces; every difference from WI-3 is attributable to a known intervening change
(`RUN_CLOCK`, `IDENTITY_LISTING_NARROWING`, `IX_AUTHORIZED_POLICY`/`L-034`, `ASSOCIATES_JV_DISCLOSURE`/`L-036`);
**0 paths are unattributed**. Against that clean reproduction the work item found three defects in how the product
describes itself and dispositioned each (§4).

**Not claimed.** No CI result a real run did not produce; no valuation, MoS, debt value, nil or policy parameter
invented or changed; no earlier bundle, validator or persistence mechanism altered; the `L-014` substantive-identity
decision (C1–C5) and the AC-L14 idempotency contract are **not** re-baselined. `L-041` and `L-042` are recorded
`OPEN` precisely because closing them is a decision this work item does not own.

## 2. The three-run table (why the same-instant clock matters)

```
run                     clock                    bindingId      conf     lims   payloadDigest
head-clock              2026-11-12T09:00:00Z     63180b59…      0.4378   8      18f5ccb60533…  (55,573 B)
same-instant            2026-11-06T14:05:00Z     e6f80fa2…      0.4378   8      c7ae0ba3741f…
WI-3 recorded (accf9c1) —                        865fab31…      0.6736   5      83644bc68e3d…  (51,196 B)
```

All three share `datasetVersion 21cf2522…`, `securityId IN:ISIN:INE009A01021`, `resolutionBasis ISIN`,
`rosterVersion ccabcc87…`, `listingMapVersion 7b458fb9…`, `corporateActionTableVersion 0b1d3cbf…`, adequacy
`SUFFICIENT`, quality `MATERIAL_CONCERNS`. The `bindingId` isolates exactly two variables: **head vs same-instant
differ only by the run clock**, and **same-instant vs WI-3 differ only by the `a54591e` listing-narrowing** (BSE leg
→ NSE leg). Running the pinned clock removes the clock as a variable so the narrowing is the only remaining
difference — and the attributed diff confirms it. Detail: `runs/03-generate-sameclock.txt`.

## 3. Inputs: committed elsewhere, referenced not duplicated

This is a **re-validation, not a re-acquisition**. `runs/01-ingest.txt` ingests directly from the committed
`evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/ingest-input`, and the identity/owner carrier are copied from
the committed WI-3 and REL-1 bundles (`runs/commands.txt` §2). The re-ingested dataset is **byte-identical** to
WI-3's committed dataset for all nine content files; only `manifest.json` differs, by an out-of-`digestScope`
`sourceRights` block whose `basis` carries this run's absolute sandbox path — so `datasetVersion 21cf2522…` is
unchanged and the difference is not a dataset difference at all.

The bundle therefore **references** those inputs and pins each by sha256 (`runs/07-input-integrity.txt`) rather than
duplicating ~140 KB of identical, already-committed, git-tracked evidence that could only drift. Every referenced
file is verified `tracked` at the base commit. The primary statement extracts behind the WI-3 nil declarations live
in `WI3-BORROWINGS-NIL-2026-11-06/source/` and are not re-read here.

## 4. The three defects, and what was done about each

| | Defect | Disposition | Why |
|---|---|---|---|
| **A** | the reader-facing `L-002`/`L-003` limitation notice restated, as typed literals, counts the code can compute — `L-002` said **20**, `Object.keys(XBRL_TAG_MAP).length` is **22**, and the coverage report already said 22, so one product told the reader two numbers for one fact | **CORRECTED, narrowly; digest-neutral** | the notice lives in the CLI summary and client disclosure, not the canonical payload, so the head digest is unchanged. Both counts now derive from code and are pinned by `rivHeadRevalidation.test.ts`. `L-002`/`L-003` stay `OPEN` — the *restatement* was wrong, not the limitation. → `findings/A-STALE-LIMITATION-COUNTS.md` |
| **B** | two dataset classifiers disagree on the same committed manifests: `classifyDataset` (rights evidence, fail-closed) says `UNKNOWN`, `investmentCoverage.financialClass()` (substring test) says `OPERATOR_SUPPLIED` | **RECORDED `OPEN` as `L-041`, not corrected** | `datasetClass.ts` (`a54591e`) documents that substring test under "WHAT WAS WRONG" and removes it; the coverage read model reintroduces it. A fail-closed answer needs a fourth vocabulary member or routing through `classifyDataset` — a published read-model contract change owned by the register/read-model owner. Pinned so a one-sided fix fails loudly. → `findings/B-DATASET-CLASS-DIVERGENCE.md` |
| **C** | the `EV_EBITDA`/`EV_REVENUE` basis label names only "− net debt", while the published per-share figure applies the full bridge (also − minorityInterest − preferenceCapital + associatesAndJV); for this issuer the label, read as an equation, misses the published figure by `minorityInterest/shares` = **₹0.8324/share** | **DEMONSTRATED, REVERTED, RECORDED `OPEN` as `L-042`** | `basis` is valuation output inside the substantive projection, so correcting it moves the substantive digest of *every* EV-publishing assessment — it broke 16 tests across `substantive-identity.test.ts` (the `L-014` C1–C5 pinned digests) and `ac-l14.test.ts`, and moved the IX closure artifact's `structuralDigest`. No digest-neutral fix exists. The full authoritative bridge stays published in `capitalStructure.equityBridge`; a comment-only annotation (13+/0−) and a characterization test record the defect. → `findings/C-EV-BASIS-BRIDGE.md` |

## 5. What the head payload publishes (unchanged arithmetic)

`DCF_FCFF` PRIMARY 798.007/990.749/1345.500 (WACC 10.68 %, g 4.00 %, 5 y) · `PE_RELATIVE` SECONDARY
1016.34/1270.43/1524.51 (EPS 57.75 × 22) · `EV_EBITDA` CROSS_CHECK 916.325/1133.948/1351.572 (basis label — `L-042`)
· `EV_REVENUE` withheld (`MANDATORY_METRIC_MISSING`) · `PB_RELATIVE` `NOT_APPLICABLE` (Technology exclusion).
`netDebt` −₹193.42 bn (net cash), `minorityInterest` ₹3.45 bn, `preferenceCapital` NIL_BY_DISCLOSURE,
`associatesAndJV` NOT_COMPUTABLE → `POLICY_ZERO_UNAVAILABLE`; `equityBridge` publishes the full formula
`equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV`;
`associatesJVReview` `REVIEW_DUE` (950 d); completeness `SUFFICIENT` (coverage 1.0); quality `MATERIAL_CONCERNS`
with `STALE_STATEMENTS` HIGH (956 d, dataAsOf 2024-03-31). Mapping census (`verification/mapping-census.json`):
53 line items, **22** XBRL tags → 21 items, 8 derivations, 48 CSV columns, 16 unreachable, 32 line items with no
tag, `xbrlPath.exercisedByThisIssuer: false` (why `L-002` stands), measuredSectors 1/13.

## 6. Baselines at head `a835d4a` (all green, defect C reverted)

| # | Check | Result |
|---|---|---|
| 1 | `iips-platform` `tsc --noEmit` | 0 errors |
| 2 | `iips-platform` `npm run test:iid` | **807/807** (190 suites) |
| 3 | `frontend` `npm run typecheck` | 0 errors |
| 4 | `frontend` `npm run typecheck:investment-server` | 0 errors |
| 5 | `frontend` `npx vitest run server/investment` | **359/359** (26 files; AC-X2 zero-socket **0 attempts**, fd 4→4, new 0) |

Captured verbatim in `runs/06-baselines.txt`. The vitest run rewrites two committed AC-X2 evidence files in volatile
fields only (`generatedAt`/loopback port/pid); these were restored with `git checkout` so the bundle carries no
incidental churn on IID closure evidence (`runs/commands.txt` §7).

## 7. Verification

| Check | Result |
|---|---|
| dataset re-ingest from committed WI-3 input | `datasetVersion 21cf2522…` reproduced, `issues []` |
| head-clock generate → persist → verify | `18f5ccb6…`, persist CREATED, chain valid head v1 |
| same-instant generate | `c7ae0ba3…`, bindingId differs from head only by clock |
| separate-process read-back | recomputed == recorded == `18f5ccb6…`, 55,573 B, versionCount 1 |
| out-of-engine recomputation | intrinsic 875.34/1088.97/1399.81 byte-identical; MoS −0.08418738213693565 `FAIR` |
| attributed diff vs WI-3 | **14 changed paths, 0 unattributed** |
| input integrity | every referenced WI-3/REL-1 input `tracked` and digest-pinned (`runs/07`) |
| bundle cleanliness | 0 scratch/db/node_modules inside the bundle (`runs/07`) |
| guard | `rivHeadRevalidation.test.ts` **11 passed**; `assessment-valuation.test.ts` `L-042` bridge-formula test passes |

Reproduction: `runs/commands.txt` (§0–§8). Re-running §1 and §3 must reproduce `21cf2522…` and `18f5ccb6…`.
`payloadDigest` is content-derived and reproduces byte-exactly; `reportId` (`d9e2212a…` here) is a UUID minted per
persist and is **not** content-derived — it differs on every write and nothing here compares it. `node_modules` is
not committed: `npm install` (frontend needs `--strict-ssl=false --fetch-retries=5`) must precede any generate or
persist step, or the fail-closed NP-04 loader returns `PERSISTENCE_UNAVAILABLE`.

## 8. File inventory

| Path | What it is |
|---|---|
| `README.md` | this overview |
| `digests.json` | sha256 + byte count over every file in this bundle (schemaVersion 2), the head chain entry, and an `inputs` block pinning the referenced WI-3/REL-1 bytes |
| `runs/01-ingest.txt` | dataset re-ingestion → `21cf2522…`, Technology `G2_PARTIAL`, 1/13 sectors |
| `runs/02-generate-head-clock.txt` | head-clock governed cycle → `18f5ccb6…`, persist CREATED, head v1 |
| `runs/03-generate-sameclock.txt` | same-instant cycle → `c7ae0ba3…`; the three-run binding/digest table |
| `runs/04-read-back-head.txt` | separate-process read-back → recomputed == recorded == `18f5ccb6…` |
| `runs/05-riv-generator.txt` | out-of-engine recomputation + attributed diff + census + class divergence |
| `runs/06-baselines.txt` | the five baselines, verbatim, all exit 0 |
| `runs/07-input-integrity.txt` | sha256 of every referenced committed input + bundle-cleanliness check |
| `runs/commands.txt` | the exact commands, in order, that regenerate the bundle |
| `runs/cli-head.json`, `runs/cli-head-sameclock.json` | the two CLI step outputs |
| `artifact/assessment-payload-head.json` | the persisted head payload (`18f5ccb6…`, 55,573 B) |
| `artifact/payload-diff-vs-wi3.json` | the 14-path attributed diff (`a24be947…`) |
| `verification/independent-recomputation.json` | the out-of-engine recomputation (`ca6a1e8d…`) |
| `verification/mapping-census.json` | the head mapping census (`c084c30a…`) |
| `verification/dataset-class-divergence.json` | the `L-041` two-way classification (`ae45717f…`) |
| `findings/A-STALE-LIMITATION-COUNTS.md` | defect A (corrected) |
| `findings/B-DATASET-CLASS-DIVERGENCE.md` | defect B → `L-041` (open) |
| `findings/C-EV-BASIS-BRIDGE.md` | defect C → `L-042` (open) |

**Register:** §17.26 of `docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` records
`L-041` and `L-042` and flags the `L-002` 20-vs-22 prose discrepancy for the register owner. **Work-item record:**
`docs/integration/IIPS_V3_IID_WI13_HEAD_REVALIDATION_2026-11-12.md`.
