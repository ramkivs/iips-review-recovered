# IIPS v3.0 — IID Work Item 13: a real issuer re-validated at the current head

**Record ID:** `IIPS-V3-IID-WI13-HEAD-REVALIDATION-2026-11-12`
**Work item:** WI-13 — head re-validation of a real issuer (IRR scope only)
**Date:** 2026-11-12
**Baseline:** `a835d4af019ab4f677ab238ec42d44326f06a771` (the authoritative head; equal to `origin/main` at run time)
**Sector:** Technology · **Issuer:** Infosys Limited (the WI-1/WI-2/WI-3 issuer) · **Outcome:** reproduced end to
end — **14 changed paths, 0 unattributed** against the WI-3 recorded payload; intrinsic value and margin of safety
byte-identical; confidence drift fully attributable to `L-034`; **two new limitations (`L-041`, `L-042`), both
`OPEN`**; **one reader-facing count corrected (defect A), digest-neutral**; no valuation, debt figure, nil or policy
parameter changed.

---

## 1. What was asked, and what is claimed

Every prior real-issuer work item assessed an issuer at the head that was current when it ran and recorded the
payload digest it produced. None asked the question this one asks: *does the same issuer, on the same committed
dataset, still reproduce — and does the product's own self-description still match its code — now that the head has
moved on?* WI-13 re-ran Infosys Limited at head `a835d4a` and read the result three ways: at the run clock, at a
pinned same-instant clock, and against the WI-3 recorded payload, with an independent recomputation from the
committed CSVs run **outside** the assessment engine.

**Claimed.** The arithmetic reproduces. An independent recomputation regenerates the intrinsic-value triad
**875.34 / 1088.97 / 1399.81** byte-identically and the margin of safety **−0.08418738213693565** (band `FAIR`);
the persisted head payload (`sha256:18f5ccb6…`, 55,573 bytes) is read back by a separate process and recomputes to
the same digest. The diff against the WI-3 recorded payload is **14 changed paths, 0 unattributed** — every change
is explained by the run clock, the `a54591e` listing-narrowing, the authorised `L-034` policy, or the `L-036`
associates/JV disclosure. The confidence move 0.6736 → 0.4378 is the `L-034` aggregate reduction (×0.65), **not**
issuer drift. Against that clean reproduction, the work item found **three defects in how the product describes
itself**: one narrow, digest-neutral correction (defect A) and two contract decisions recorded as new limitations
(`L-041`, `L-042`) rather than fixed here.

**Not claimed.** No CI result is asserted that a real run did not produce; no valuation, MoS, debt value, nil
declaration or policy parameter is invented or changed; no earlier bundle, validator or persistence mechanism is
altered; the substantive-identity decision (`L-014` C1–C5) and the AC-L14 idempotency contract are **not**
re-baselined. The two new limitations are recorded `OPEN` precisely because closing them is a decision this work
item does not own.

## 2. Why a head re-validation, and why this issuer

### 2.1 Why re-validate at all

A digest recorded at one head is a claim about that head. Between WI-3 (`accf9c1`) and the current head the product
acquired the `a54591e` listing-narrowing, the `8603138` coverage work, the XBRL/mapping changes, and the IX
authorised-policy application (`L-034`). Each of those can move a payload digest, change a binding, or — the part
that matters here — change what the product *says about itself* without anyone re-reading the saying against the
code. WI-13 is the re-read.

### 2.2 Why Infosys

Infosys is the issuer with the longest committed history (WI-1 dataset, WI-2 price observation, WI-3 borrowings
nil), so it is the only issuer whose recorded payload can be diffed against a re-run at head and have every
difference attributable to a *known* intervening change rather than to issuer drift. Re-validating a fresh issuer
would confound "did the head move the result" with "is this a different company". Technology is also the sector
whose matrix excludes `PB_RELATIVE` and withholds `EV_REVENUE` on a missing mandatory metric, which keeps the
method set small enough to read path by path.

## 3. Identity — reproduced, with the narrowing made explicit

| Identifier | Value | Note |
|---|---|---|
| CIN | `L85110KA1981PLC013115` | scope `co:IN:CIN:L85110KA1981PLC013115` (ISSUER) |
| ISIN | `INE009A01021` | `securityId IN:ISIN:INE009A01021`; `resolutionBasis ISIN` |
| listingId (head + sameclock) | `IN:NSE:INFY:EQ:EQUITY` | the `a54591e` narrowing resolves Infosys to the NSE leg |
| listingId (WI-3 recorded) | `IN:BSE:500209:EQ:EQUITY` | WI-3 resolved to the BSE leg before the narrowing |
| bindingId (head clock) | `sha256:63180b5983b320b3a656f003b31465f7…` | differs from sameclock **only** by the run clock |
| bindingId (same instant) | `sha256:e6f80fa2aced01c1efaae36285e730c4…` | differs from WI-3 **only** by the listing-narrowing |
| bindingId (WI-3 recorded) | `sha256:865fab31da57638feb2c1f5571d2f7ec…` | BSE leg, pre-narrowing |
| rosterVersion | `sha256:ccabcc87cd85ab9fa1455bdfe29b2f22e4aaf40abd79711778c0ebe480a77a97` | unchanged |
| listingMapVersion | `sha256:7b458fb9f5a456a59b256f61c53f7f9bf38aecfe158b2e8b8a0538f96fce3d6d` | unchanged |
| corporateActionTableVersion | `sha256:0b1d3cbfe52c62afbfabffe2a8ed66dd4a0812ca712f05e1ed9a58caa4b75819` | unchanged (`L-031`: the table is empty) |

The three bindingIds isolate the two things that moved: **head vs same-instant differ only by the run clock**, and
**same-instant vs WI-3 differ only by the listing-narrowing**. That is the whole point of running the same-instant
clock — it removes the clock as a variable so the narrowing is the only remaining difference, and the diff confirms
it.

## 4. Coverage and provenance — the committed dataset, unchanged

| Property | Value |
|---|---|
| datasetVersion | `sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847` (reproduced: **true**) |
| provider | `operator-file-input` |
| datasetClass — assessment path (`classifyDataset`) | `UNKNOWN` (rights evidence absent; fail-closed) |
| datasetClass — coverage path (`financialClass()`) | `OPERATOR_SUPPLIED` (substring test) — **the `L-041` divergence** |
| dataAsOf | `2024-03-31` (staleness 956 days at the head clock → `STALE_STATEMENTS` HIGH) |
| Technology stage | `G2_PARTIAL` — usable 2, withheld 2, statement coverage 87.5 %, metric coverage 0 % |
| sectors measured | 1 of 13 (this dataset spans Technology only) |
| adequacy / quality | `SUFFICIENT` (required-field coverage 100 %, missingFields []) / `MATERIAL_CONCERNS` |

The dataset is the committed WI-3 dataset, re-ingested; its `datasetVersion` reproduces exactly. No cell was added,
removed or back-solved. The two dataset-class answers above are the same manifest read through two code paths, and
their disagreement is `L-041` (§7.2).

## 5. D-2 and the mapping census — what the head actually maps

The independent census (`verification/mapping-census.json`) counts the product's own vocabulary at this head:

| Counted at head | Value |
|---|---|
| `LINE_ITEM_IDS` (closed vocabulary) | 53 |
| `XBRL_TAG_MAP` keys | **22** → 21 distinct line items carrying a tag |
| derivations in the closed set | 8 |
| CSV columns in the committed dataset | 48 |
| columns unreachable from the vocabulary | 16 |
| line items with no XBRL tag | 32 |
| `xbrlPath.exercisedByThisIssuer` | **false** — this issuer's data arrives as operator CSV, not XBRL |
| measured sectors | 1 of 13 |

`xbrlPath.exercisedByThisIssuer: false` is why `L-002` stands: the 22 mapped tags are a vocabulary property, not a
claim that this issuer's figures travelled the XBRL path. The count **22** is the figure defect A corrects the
reader-facing notice to (§7.1); the register's §2 prose still says 20 and is flagged for the owner, not edited.

## 6. The governed runs

```
datasetVersion  sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847   (reproduced: true)
identity        RESOLVED via ISIN     scope co:IN:CIN:L85110KA1981PLC013115     listingId IN:NSE:INFY:EQ:EQUITY

run                     clock                    bindingId      conf     lims   payloadDigest
head-clock              2026-11-12T09:00:00Z     63180b59…      0.4378   8      18f5ccb60533…  (55,573 B)
same-instant            2026-11-06T14:05:00Z     e6f80fa2…      0.4378   8      c7ae0ba3741f…
WI-3 recorded (accf9c1) —                        865fab31…      0.6736   5      83644bc68e3d…  (51,196 B)

head run        reportKey ed1e54b03e5e…   reportId d9e2212a-ae7e-4df4-a47c-cf8c54aa82b0   head v1
                inputDigest sha256:db46d36c5b0ef92717d35118b4003e7e43fa55267808d41cf006193d20e9a4ef
                methodCount 4   withheldMethodCount 1   evidenceCount 5   missingFieldCount 0
persist         CREATED (wrote)            verify  chain valid: 1 version(s), head v1
read-back       separate process: recomputed digest == recorded == 18f5ccb6…   versionCount 1
```

### 6.1 The independent recomputation (outside the engine)

`scripts/riv-head-revalidation.ts` recomputes the valuation from the committed CSVs without calling the assessment
engine, then diffs its result against the persisted head payload:

```
intrinsic         875.34 / 1088.97 / 1399.81        (byte-identical since WI-3)
margin of safety  -0.08418738213693565 vs mid       band FAIR        price 1180.65
confidence        0.4378  =  0.6736 × 0.65          (aggregateReduction 0.35; the L-034 authorised cap)
diff vs WI-3      14 changed path(s), 0 unattributed
causes            RUN_CLOCK · IDENTITY_LISTING_NARROWING (a54591e) · IX_AUTHORIZED_POLICY (L-034)
                  · ASSOCIATES_JV_DISCLOSURE (L-036) · combinations of the above
XBRL tags mapped  22                                 L-041 manifests classified two ways: 3
```

**0 unattributed** is the substantive result: there is no path in the head payload that differs from WI-3 for a
reason this work item cannot name. The confidence drop is arithmetic, not judgement — `L-034`'s authorised
aggregate reduction of 0.35 applied to the WI-3 confidence.

### 6.2 What computed, and what each refusal says

| Method | Role | Per-share (low / mid / high) | Note |
|---|---|---|---|
| `DCF_FCFF` | PRIMARY | 798.007 / 990.749 / 1345.500 | WACC 10.68 %, g 4.00 %, 5-year horizon |
| `PE_RELATIVE` | SECONDARY | 1016.34 / 1270.43 / 1524.51 | EPS 57.75 × policy multiple 22 |
| `EV_EBITDA` | CROSS_CHECK | 916.325 / 1133.948 / 1351.572 | basis label names only "− net debt" — **`L-042`** |
| `EV_REVENUE` | CROSS_CHECK | withheld | `MANDATORY_METRIC_MISSING` (same label defect as `EV_EBITDA`) |
| `PB_RELATIVE` | — | `NOT_APPLICABLE` | Technology sector exclusion |

`netDebt` is −₹193.42 bn (net cash), `minorityInterest` ₹3.45 bn (PRESENT), `preferenceCapital` NIL_BY_DISCLOSURE,
`associatesAndJV` NOT_COMPUTABLE → `POLICY_ZERO_UNAVAILABLE`; `equityBridge` publishes the full formula
`equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV`. The
`associatesJVReview` control is `REVIEW_DUE` (950 days elapsed). It is the gap between that full bridge and the
`EV_EBITDA` **label** that is `L-042` (§7.3).

## 7. Defects found, and what was done about each

### 7.1 Defect A (`L-002`/`L-003` notice) — a reader-facing count had drifted from the code. **Corrected, narrowly; digest-neutral.**

The IID-3 limitation notice restated, as typed literals, two facts the code can count. The `L-002` literal said
**20**; `Object.keys(XBRL_TAG_MAP).length` is **22** — and the coverage report, which derives the number, already
said 22, so one product told the reader two different numbers for the same fact. The literal went stale when the V2
associates/JV work added two tags.

**Corrected:** `frontend/server/investment/cli/generate-investment-artifacts.ts` now derives both the `L-002` and
`L-003` counts from the code; `frontend/src/api/investment.ts` (presentation-only — it imports nothing from
`iips-platform`, so the number cannot be derived there without breaking that boundary) is corrected to 22 and then
**pinned** by `rivHeadRevalidation.test.ts`, which fails if the stated count and `Object.keys(XBRL_TAG_MAP).length`
(or the `L-003` line and `DERIVATIONS.length`) ever disagree again. Deriving the count makes the drift *impossible*
rather than merely corrected once.

**Digest-neutral:** the notice lives in the CLI **summary** and the client **disclosure**, not the canonical
payload, so the head digest is unchanged (`18f5ccb6…`) — confirmed by `runs/02-generate-head-clock.txt`, whose
header states the expected digest is identical to the pre-correction head. **`L-002` and `L-003` stay `OPEN`**;
nothing about the limitations changed, only the product's restatement of the count. `L-001` *"3 of 13 sectors
measured"* is **correct and untouched** (the frozen R-16 engine-qualification count, not this dataset's
`measuredSectors: 1`); `L-009` is flagged as factually superseded but not restated, because its notice mirrors the
§2 short title and restating that is the owner's act. See `findings/A-STALE-LIMITATION-COUNTS.md`.

### 7.2 `L-041` (`OPEN`) — two dataset classifiers disagree on the same committed manifests. **Recorded, not corrected.**

Classifying the three committed Infosys manifests (`REL-1`, `WI2`, `WI3`) two ways exposes a live contradiction:

| Path | File | Rule | Answer |
|---|---|---|---|
| Assessment | `fundamentals/datasetClass.ts` → `classifyDataset` | declared rights evidence, fail-closed | `UNKNOWN` |
| Investment coverage | `coverage/investmentCoverage.ts` → `financialClass()` | substring test on `provider`/`licence` | `OPERATOR_SUPPLIED` |

`datasetClass.ts` (commit `a54591e`) **documents that exact substring test under a heading "WHAT WAS WRONG" and
removes it**; `investmentCoverage.ts` was touched later (`8603138`) and reintroduces it on the read side, so the
product ships a rule and the rule that rule was written to replace. The assessment path is correct — absent rights
evidence it refuses to assert a class. The coverage path has **no fail-closed answer at all**: its vocabulary is
`SYNTHETIC_FIXTURE | OPERATOR_SUPPLIED | NONE`, and `NONE` drives a "no dataset installed" UI state, so a
fail-closed `UNKNOWN` needs either a fourth vocabulary member or routing the read model through `classifyDataset`.
Both are changes to a published read-model contract other surfaces consume — a register-owner / read-model-owner
decision, not a narrow IRR correction. **Recorded as `L-041`, `OPEN`, and pinned** by `rivHeadRevalidation.test.ts`
(all three manifests must still classify two ways, so a one-sided fix fails loudly). See
`findings/B-DATASET-CLASS-DIVERGENCE.md` and `verification/dataset-class-divergence.json`.

### 7.3 `L-042` (`OPEN`) — the EV method basis label names only the dominant bridge term. **Demonstrated, reverted, recorded.**

`EV_EBITDA` publishes `basis: "mid-cycle EBITDA 375843333333 × 12 − net debt"`, but the per-share figure it
publishes (`1133.9484469942438`) was produced by `equityValueFromEnterprise`, which applies the **whole** bridge.
For this issuer `minorityInterest` is ₹3.45 bn (PRESENT), so reading the label as the equation it appears to be:

```
EV                = 375,843,333,333 × 12      = 4,510,119,999,996
label as equation = EV − netDebt              → per share 1134.780797467872
full bridge       = EV − netDebt − minorityInterest (+0 preference +0 associates)
                                              → per share 1133.9484469932788  == published 1133.9484469942438
gap               = minorityInterest / dilutedShares = ₹0.8323504745930698/share
```

`EV_REVENUE` carries the same label and the same defect (withheld here). The **complete authoritative bridge is
published beside the label** in `capitalStructure.equityBridge`, pinned by `assessment-valuation-integrity.test.ts`,
so the payload as a whole is not misleading — the defect is that the method-level label, read alone, is incomplete.

A one-line correction was **demonstrated and then reverted**: because `basis` is valuation output inside the
substantive projection, changing it moves the substantive digest of *every* EV-publishing assessment, which broke
**16 tests across `substantive-identity.test.ts` (the `L-014` C1–C5 pinned reference digests) and `ac-l14.test.ts`
(idempotency)**, and moved the two `structuralDigest` values in the committed IX closure artifact. There is no
digest-neutral fix — the string cannot leave the projection, and a separate faithful field trips the O-9
member-inventory guard. Correcting it therefore means **re-baselining the `L-014` substantive-identity decision and
the AC-L14 idempotency contract** — a coordinated disclosure-contract change owned by the register owner and the
identity-contract owner. **Recorded as `L-042`, `OPEN`.**

What WI-13 did instead: a **comment-only** annotation at both methods in `methods.ts` (13 lines added, 0 removed —
the basis strings are byte-identical to the pre-work-item head), and a characterization test in
`assessment-valuation.test.ts` that pins the full bridge formula staying published while the short label still names
net debt, so a future fix must be a deliberate act that also re-baselines `L-014`. See
`findings/C-EV-BASIS-BRIDGE.md`.

## 8. Statuses after WI-13

**`L-041` and `L-042` are added by this work item, both `OPEN`.** **`L-002` and `L-003` stay `OPEN`** — defect A
corrected the product's *restatement* of the count (and made it derive from code), not the limitations; the §2
`L-002` prose ("20") is flagged for the owner, not edited. **`L-001` is correct and untouched**; **`L-009`** is
flagged as factually superseded but not restated. **`L-034` `RESOLVED`, `L-035` `RESOLVED`, `L-036`
`PARTIALLY RESOLVED`, `L-037` `PARTIALLY RESOLVED`, `L-038` `OPEN`, `L-039` `OPEN`, `L-040` `RESOLVED`,
`L-004` … `L-033` untouched.** No entry in `L-001` … `L-040` was modified, closed, renumbered or reinterpreted; no
D-2 policy, IX policy, valuation formula, capital-structure rule or WI-11 same-instant safeguard was changed. The
register movement is recorded in §17.26 of
`docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md`.

**Baselines at head `a835d4a` (all green, defect C reverted):**

| # | Check | Result |
|---|---|---|
| 1 | `iips-platform` `tsc` | 0 errors |
| 2 | `iips-platform` `test:iid` | **807/807** (190 suites) |
| 3 | `frontend` `typecheck` | 0 errors |
| 4 | `frontend` `typecheck:investment-server` | 0 errors |
| 5 | `frontend` `vitest server/investment` | **359/359** (26 files) |

The vitest run includes the AC-X2 zero-socket control: **0 socket attempts**, fd census before 4 / after 4 / new 0.
Captured verbatim in `runs/06-baselines.txt`. (The vitest run rewrites two committed AC-X2 evidence files in their
volatile fields only — `generatedAt`, loopback port, pid; these were restored with `git checkout` so the bundle
carries no incidental churn on IID closure evidence.)

## 9. Evidence and guard

**Bundle:** `evidence/real-issuer/HEAD-REVALIDATION-INFOSYS-2026-11-12/`

| Path | What it holds |
|---|---|
| `README.md` | bundle overview, the three-run table, reproduction order |
| `digests.json` | sha256 + byte count over every bundle file (schemaVersion 2) |
| `runs/01-ingest.txt` | dataset re-ingestion → `datasetVersion 21cf2522…`, Technology `G2_PARTIAL`, 1/13 sectors |
| `runs/02-generate-head-clock.txt` | head-clock governed cycle → `18f5ccb6…`, persist CREATED, head v1 |
| `runs/03-generate-sameclock.txt` | same-instant cycle → `c7ae0ba3…`; the three-run binding/digest table |
| `runs/04-read-back-head.txt` | separate-process read-back → recomputed == recorded == `18f5ccb6…` |
| `runs/05-riv-generator.txt` | independent recomputation + attributed diff + census + class divergence |
| `runs/06-baselines.txt` | the five baselines, verbatim, all exit 0 |
| `runs/commands.txt` | the exact commands, in order, that regenerate the bundle |
| `runs/cli-head.json`, `runs/cli-head-sameclock.json` | the two CLI step outputs |
| `artifact/assessment-payload-head.json` | the persisted head payload (`18f5ccb6…`, 55,573 B) |
| `artifact/payload-diff-vs-wi3.json` | the 14-path attributed diff (`a24be947…`) |
| `verification/independent-recomputation.json` | the out-of-engine recomputation (`ca6a1e8d…`) |
| `verification/mapping-census.json` | the head mapping census (`c084c30a…`) |
| `verification/dataset-class-divergence.json` | the `L-041` two-way classification (`ae45717f…`) |
| `findings/A-STALE-LIMITATION-COUNTS.md` | defect A |
| `findings/B-DATASET-CLASS-DIVERGENCE.md` | defect B → `L-041` |
| `findings/C-EV-BASIS-BRIDGE.md` | defect C → `L-042` |

**Guards:**

| Guard | What it pins |
|---|---|
| `frontend/server/investment/cli/rivHeadRevalidation.test.ts` (11 tests) | the head digest reproduces; the diff stays 0-unattributed; the `L-002`/`L-003` notices match the code counts; all three manifests still classify two ways (`L-041`) |
| `iips-platform/tests/investment/assessment-valuation.test.ts` | the authoritative full bridge formula stays published in `capitalStructure.equityBridge` while the short label still names net debt (`L-042`) |
| `iips-platform/tests/investment/assessment-valuation-integrity.test.ts` | `bridge.formula` is the full enterprise-to-equity conversion |
| `iips-platform/scripts/riv-head-revalidation.ts` | the generator itself: 5 attributions, scratch dataset in `mkdtempSync` (never inside the bundle), stdout records defect C `OPEN (L-042)` |

**Reproduction order** (see `runs/commands.txt` for the exact commands): re-ingest the dataset → generate at the
head clock → generate at the pinned same-instant clock → read the head payload back in a separate process → run the
independent recomputation and attributed diff → run the five baselines. `frontend/node_modules` and
`iips-platform/node_modules` are not committed; `npm install` (frontend needs `--strict-ssl=false
--fetch-retries=5`) must precede any generate or persist step, or the fail-closed NP-04 loader returns
`PERSISTENCE_UNAVAILABLE`.
