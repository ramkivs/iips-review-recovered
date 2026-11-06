# WI-2 — Infosys market-price observation (2026-11-06)

**Work item:** IIPS v3.0 Work Item 2 — obtain a properly sourced market-price observation for Infosys Limited and
put it through the assessment contract **only if the contract is satisfied**.

**Issuer:** Infosys Limited · CIN `L85110KA1981PLC013115` · ISIN `INE009A01021` · NSE `INFY` · BSE `500209`.
**Baseline:** `main` @ `41c4498` (the post-D-3 head, payload `8e23f025527e…`).
**Result in one sentence:** the price is **accepted**; the valuation and the margin of safety are **still not
computable**; the blocker moved from *the price* to *the intrinsic*, which is withheld because the issuer's
borrowings are `NOT_REPORTED`.

---

## 1. What this bundle is

A second, distinct evidence bundle beside `REL-1-INFOSYS-2026-11-06` (Work Item 1) and
`D3-RISK-REASON-SEMANTICS-2026-11-06` (D-3). It adds **one dataset record** — a BSE end-of-day close — to the same
roster and the same three filed annual periods, and records the assessment payload that results.

Nothing in `REL-1-…`, `D2-…`, `D3-…` or `evidence/iid` was modified: those bundles are historical evidence and this
work item may not rewrite them. The Work Item 1 dataset version (`sha256:ca29c835…`) remains the identity of the
input without a price, and it is reproducible from the committed Work Item 1 inputs on this branch
(`runs/04-baseline-d3-reconstruction.json` regenerates payload `8e23f025527e…` from them).

---

## 2. The observation

| Provenance field | Value |
|---|---|
| Issuer | `IN:CIN:L85110KA1981PLC013115` — Infosys Limited (CIN `L85110KA1981PLC013115`) |
| Instrument | `IN:ISIN:INE009A01021` — equity shares, ISIN `INE009A01021` |
| Exchange / listing | **BSE** — listing `IN:BSE:500209:EQ:EQUITY` (scrip code `500209`, ISIN `INE009A01021`, BSE group `A`) |
| Trading date | **2026-11-06** (`TradDt` = `BizDt` = `2026-11-06`) |
| Price field | `ClsPric` — the exchange's closing price |
| Basis | `CLOSE` · statutory end-of-day close, unadjusted, in the security's trading currency |
| Price / currency | **₹1,180.65** · `INR` |
| Cross-field context from the same row | open 1,184.00 · high 1,199.00 · low 1,163.00 · last 1,180.65 · previous close 1,166.10 · volume 637,877 · turnover ₹751,753,580.00 · 17,440 trades |
| Source | BSE end-of-day bhavcopy, `BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV`, segment `CM`, file source `BSE` |
| Original reference | `https://www.bseindia.com/download/BhavCopy/Equity/BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV` (full-file URL; the extract and its anchors are in `source/`) |
| `sourceRef` carried in the dataset | `BSE:BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV:2026-11-06:500209:INE009A01021:ClsPric` |
| Retrieval timestamp | bounded interval **2026-11-06T13:42:45Z → 2026-11-06T13:44:25Z** (`date -u` reads immediately before the first exchange fetch and immediately after the last one; the fetch tool reports no per-request timestamp, so the interval is recorded rather than an invented instant) |
| Publication timestamp | not stamped on the file by the exchange; availability at 2026-11-06T13:42:45Z bounds publication from above (the 2026-11-06 session's end-of-day file already existed then) |
| Corporate-action adjustment | `adjustment: null` — **no per-share-affecting action is recorded between the price date and the period end, because the dataset's corporate-action table is empty.** This is a dataset fact, not a verified market fact; see §7 and register entry `L-031` |
| Raw source evidence | `source/bse-bhavcopy-2026-11-06-INFY-extract.csv` — the exchange header line and the INFY row, byte-for-byte, plus the previous/next rows as position anchors in `source/retrieval.json` |
| Content digest | extract file `sha256:35886caa8b64aacff0fce69a75c0a0cc353087f30af2957a517cd460916814aa` · raw row `sha256:5b35ec46252ea93e44af664c1bde6a873b5da2c2439f51195354838f64ee31ae` · header `sha256:ec79fe2b3450a97e32b52a6b80c0260159acd8503211d32b7089d70ed04f6349` |
| Validation outcome | **ACCEPTED by the dataset contract, and ACCEPTED by the assessment's alignment rule** (see §5 and §7) |

The dataset record (`ingest-input/prices.json`, reproduced verbatim in `dataset/prices.json`):

```json
{ "securityId": "IN:ISIN:INE009A01021", "value": 1180.65, "currency": "INR", "asOf": "2026-11-06",
  "kind": "CLOSE", "source": "DATASET_EOD",
  "sourceRef": "BSE:BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV:2026-11-06:500209:INE009A01021:ClsPric",
  "adjustment": null }
```

`source: DATASET_EOD` is the honest label: the price comes from an exchange end-of-day dataset file supplied to the
ingestion CLI. It does **not** come from the IPD point-in-time store, so `PIT_D01` would be a false claim and was not
used.

---

## 3. Why this date, and why this exchange

**The observation date is dictated by the contract, not chosen.** `mos-policy/1.0.0` (design §R-6.4) admits a price
only when

```
knownAsOf ≤ price.asOf ≤ generatedAt
```

and the implementation refuses anything else by name (`assessment/margin.ts`): a price dated before the dataset's
knowledge cutoff returns `PRICE_PREDATES_KNOWLEDGE_CUTOFF`, a price older than the freshness window returns
`PRICE_OUTSIDE_POLICY_WINDOW`, and a price straddling an unadjusted per-share action returns
`UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`. All four refusals, plus the "no price" case, are pinned by
`iips-platform/tests/investment/assessment-price.test.ts` (10 tests, run in `runs/05-verification.txt`).

Two consequences follow, and both are recorded rather than worked around:

1. **A historical price from the statement period is not admissible.** A FY2024 close (or any close before the
   dataset's knowledge cutoff) is refused by the engine. A margin of safety is a *contemporary* comparison — today's
   price against a value derived from the last filed statements — so the observation has to be the current close, and
   the statements' age is handled by the separate staleness policy (`asOf.staleBeyondPolicy`, 950 days here), not by
   back-dating the price. This is register entry `L-032`.
2. **The knowledge cutoff had to move by fourteen hours to be truthful.** The Work Item 1 dataset declared
   `knownAsOf = 2026-11-06T00:00:00.000Z`. A close that is published after the 15:30 IST session ends cannot sit
   inside data known at 00:00Z that day without claiming foresight, so this dataset declares
   `knownAsOf = 2026-11-06T13:45:00.000Z` — after the retrieval interval in §2, before the run. The date is unchanged,
   so day-count staleness is identical (950 days); only the instant on that date moved.

**The exchange is the listing the platform already bound.** Identity resolution on this issuer returns
`IN:BSE:500209:EQ:EQUITY` (unchanged from Work Item 1 and D-3), so the BSE close is the price of the **bound listing**,
not a substitute for another listing. The roster carries both listings for the same ISIN
(`IN:NSE:INFY:EQ:EQUITY` and `IN:BSE:500209:EQ:EQUITY`); the NSE row was attempted first and could not be obtained:

| Attempted NSE source | Result |
|---|---|
| `https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_06112026.csv` | HTTP 500 from this environment; no row obtained |
| `https://www.nseindia.com/api/quote-equity?symbol=INFY` | HTTP 500 from this environment; no quote obtained |

No indicative quote, no cached price, no "last known" figure and no other instrument's price was used to fill that
gap. The consequence — a **single-exchange** observation with no second-feed corroboration — is register entry `L-030`.

---

## 4. The run

Working directory `frontend/` unless stated; `iips-platform/` for the ingestion CLI. Nothing below touches the network.

```bash
# 1. ingest: the Work Item 1 inputs plus one price record
cd iips-platform
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06/ingest-input \
  --dataset-dir /tmp/wi2/data/investment/dataset \
  --now 2026-11-06T13:45:00.000Z
#   datasetVersion sha256:0ef4299dde504a202b96bce06183b91f38081e0f83f7d9a2d64ec7fc204d0579
#   issues.json = []            coverage.prices = 1

# 2. identity: byte-identical to the Work Item 1 identity directory
cp evidence/real-issuer/REL-1-INFOSYS-2026-11-06/identity/*.json /tmp/wi2/data/investment/identity/

# 3. assess → compose → validate → persist → verify
cd ../frontend
IIPS_NP04_DATABASE_PATH=/tmp/wi2/data/investment/investment.db \
npx tsx server/investment/cli/generate-investment-artifacts.ts \
  --issuer IN:CIN:L85110KA1981PLC013115 \
  --data-dir /tmp/wi2/data/investment/dataset \
  --identity-dir /tmp/wi2/data/investment/identity \
  --db /tmp/wi2/data/investment/investment.db \
  --owner-carrier /tmp/wi2/reports-owner-context.json \
  --generated-at 2026-11-06T13:45:00.000Z \
  --out .../runs/cli-wi2-created.json
#   snapshot OK · identity RESOLVED via ISIN · assessment SUFFICIENT / MATERIAL_CONCERNS / confidence 0.4939
#   compose payloadDigest 06be8f6680ec… · persist CREATED · verify chain valid: 1 version(s), head v1
```

| | Work Item 1 + D-3 (baseline) | Work Item 2 (this bundle) |
|---|---|---|
| dataset version | `sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e` | `sha256:0ef4299dde504a202b96bce06183b91f38081e0f83f7d9a2d64ec7fc204d0579` |
| `knownAsOf` | `2026-11-06T00:00:00.000Z` | `2026-11-06T13:45:00.000Z` |
| prices in dataset | 0 | 1 |
| reportKey | `ed1e54b03e5e…` | `ed1e54b03e5e…` (unchanged — the key is the subject) |
| payload digest | `8e23f025527e998a735175ea1991b8784a486e91853ff6aa1d3fbe31cfae7978` | `06be8f6680ec70caeb73bb83788d730127018076bb39f1a17e43c2c425a04a8f` |
| payload size | 45,129 B | 45,302 B |
| input digest | `sha256:799b7203…` | `sha256:4235c11b6bd8e68896fa330795062f1cd29b711974bb4cdf63d2e7304c57e7c6` |
| adequacy / quality / confidence | `SUFFICIENT` / `MATERIAL_CONCERNS` / `0.4939` | identical |

The committed payload hashes to the chain head's recorded digest
(`sha256sum artifact/assessment-payload-wi2.json` = `06be8f6680ec…`, checked in `runs/06-payload-verify.json`), and the
run was replayed into a second, empty store to prove determinism (`runs/cli-wi2-created.replay.json`,
`runs/02-generate.txt`): same steps, same digests.

---

## 5. What the assessment says now — reported separately, as asked

### 5.1 Price accepted? **Yes.**

`valuation.marginOfSafety.price` is `PRESENT` with `value: 1180.65`, `priceAsOf: "2026-11-06"`, source
`MARKET_PRICE / BSE:BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV:…:ClsPric`, and `basis: AS_FILED`. The alignment rule
did not fire: the date equals the knowledge cutoff, the age is 0 days against a 7-day window, and no
per-share-affecting corporate action exists in the dataset to straddle.

### 5.2 Valuation computable? **No.**

`valuation.intrinsic` is still `null`. Every intrinsic path bottoms out in the capital structure: gross debt and net
debt are `MISSING / NOT_REPORTED`, because the FY2024 consolidated statements present no borrowings line at all
(D-2's finding, unchanged). Methods still blocked or partial: `DCF_FCFF` blocked, `EV_EBITDA`
`CAPITAL_STRUCTURE_INCOMPLETE`, `EV_REVENUE` `MANDATORY_METRIC_MISSING`; `PE_RELATIVE` still resolves at 1,270.43 as a
multiple-derived reference, which is not a valuation of the business.

### 5.3 Margin of safety computable? **No — but no longer because of the price.**

`valuation.marginOfSafety.refusal` moves from `NO_PRICE_OBSERVATION` to **`INTRINSIC_WITHHELD`**, and `mosVsMid` /
`mosVsLow` stay `NOT_COMPUTABLE / POLICY_INPUTS_UNAVAILABLE`, `band: null`. The price limb of the blocker is closed;
the value limb is not. This is exactly the sequencing the design describes: a margin of safety needs both a price and
a value, and this work item could only supply the price.

### 5.4 What still blocks

| Blocker | State after WI-2 | Owner |
|---|---|---|
| Borrowings / gross debt / net debt absent from the FY2024 filing | unchanged, `NOT_REPORTED`, no nil invented | D-2 (representation) — open |
| Intrinsic range | withheld because capital structure is incomplete | valuation policy — unchanged |
| Margin of safety | refused `INTRINSIC_WITHHELD` | follows from the two above |
| Statement staleness (950 days) | unchanged, `staleBeyondPolicy: true`, confidence capped | freshness policy |
| Risk evaluation | unchanged `PARTIAL / INDETERMINATE`, leverage dimension `NOT_EVALUABLE` | D-3 — recorded, not corrected here |
| Corporate-action table empty | unchanged, so adjustment status is a dataset claim | `L-031` |

---

## 6. Payload diff against the D-3 baseline

Full machine-readable record: `artifact/payload-diff-vs-d3-baseline.json`. **13 paths changed, all attributable**, and
nothing else in a 45 KB payload moved:

| Attribution | Paths |
|---|---|
| `RUN_CLOCK` (3) | `artifact.generatedAt`, `asOf.generatedAt`, `asOf.knownAsOf` |
| `DATASET_IDENTITY` (2) | `data.contentDigest`, `data.datasetVersion` (the price is inside the content digest — design §R-7) |
| `PRICE_OBSERVATION` (8) | inside `valuation.marginOfSafety`: `price.presence`, `price.value`, `price.reason`, `price.basis`, `price.periodEnd`, `price.source`, `priceAsOf`, `refusal` |

Deep-equal and untouched: `risk` (all of it, including the D-3 `evaluation` block), `quality`, `confidence`,
`valuation.methods`, `valuation.intrinsic`, `valuation.sensitivity`, `fundamentals` (borrowings `NOT_REPORTED`, leases
`PRESENT` at ₹8,359 crore, gross/net debt `NOT_REPORTED`), `moat`, `dividends`, `evidence`, `disclosure`,
`limitations`, `sectorReferenceView`.

`frontend/server/investment/cli/wi2PriceObservation.test.ts` asserts that invariant directly, including that the two
payloads are equal once the margin block and the dataset identity are removed.

---

## 7. Validation — what was checked, and what was not

**Checked, mechanically** (`source/retrieval.json`, `internalConsistency[]`, all pass):

1. the close sits inside the session's own range: 1,163.00 ≤ 1,180.65 ≤ 1,199.00;
2. `ClsPric` equals `LastPric` (1,180.65) — the row is internally consistent about what closed;
3. turnover ÷ volume = ₹1,178.52, inside the same range — the implied session VWAP does not contradict the close;
4. the day's move against `PrvsClsgPric` is +1.25 %, an ordinary session (the check refuses absurd ratios);
5. the row's identity matches the roster listing: ISIN `INE009A01021`, scrip `500209`, row symbol `INFY`, BSE group `A`
   ↔ `IN:BSE:500209:EQ:EQUITY` (the roster normalises the group to series `EQ`; the label difference is BSE's
   vocabulary, not a second instrument).

**Checked by the product** (`runs/05-verification.txt`): the dataset contract (`issues.json = []`), the alignment rule
(the four refusals are pinned by 10 unit tests and none of them fired for this observation), the payload's invariant
checks (the engine returns no `violations`), the chain (read back and revalidated, `1 version(s), head v1`), and the
read path (payload re-read through the service hashes to the chain head's digest).

**Not checked — recorded, not glossed.** There is no second source: NSE was unreachable (§3), so no cross-feed
agreement test was performed, and the possibility of a transcription-class error is bounded only by the five
internal-consistency checks above plus the fact that the row was quoted byte-for-byte rather than re-typed. The
corporate-action status is a statement about an **empty dataset table**, not about Infosys's action history; the
engine's guard would refuse the price if the table carried an unpaid per-share action, but nothing here proves the
table is complete.

---

## 8. What this bundle does not claim

- **No verdict, and no completed valuation.** A price observation is not a valuation; the intrinsic is still withheld.
- **No production readiness.** The source was read by an operator-side fetch and transcribed into an ingest file; no
  market-data provider is wired into the runtime, and no scheduled refresh exists.
- **No second issuer, no sector expansion, no new provider.** One issuer, one observation, the existing ingest path.
- **No IPD implementation change.** The IPD package is untouched; the price is `DATASET_EOD`, not `PIT_D01`.
- **No rewritten history.** `REL-1-…`, `D2-…`, `D3-…` and `evidence/iid` are byte-identical to their state on `main`.
- **No change to any formula, threshold, weight, confidence cap, risk policy or limitation status.** The register gains
  entries; it loses none and re-statuses none.

---

## 9. Reproducing this bundle

1. Fetch the exchange file in §2 (the row is in the `CM` segment; the file is ordered by scrip code, so the anchors in
   `source/retrieval.json` locate the INFY row), and confirm the two digests in §2 match the extract.
2. Run §4's two commands verbatim. The dataset version and payload digest must come out as
   `0ef4299d…` and `06be8f66…`; a different value means the inputs or the code moved.
3. Re-run §4's ingest against the **Work Item 1** inputs (`REL-1-…/ingest-input`) and the artifact CLI with
   `--generated-at 2026-11-06T00:00:00.000Z`; the payload must come out as `8e23f025…`, which is the D-3 baseline
   (`runs/04-baseline-d3-reconstruction.json`).
4. `npx vitest run server/investment/cli/wi2PriceObservation.test.ts` must pass 6/6.

## 10. File inventory

| Path | What it is |
|---|---|
| `ingest-input/roster.json`, `ingest-input/periods.csv` | byte-identical copies of the Work Item 1 inputs (same sha256; digests in `digests.json`) |
| `ingest-input/prices.json` | the one-record price input described in §2 |
| `source/bse-bhavcopy-2026-11-06-INFY-extract.csv` | the exchange header line and the INFY row, verbatim |
| `source/retrieval.json` | URL, retrieval interval, chunk position, anchors, field mapping, digests, consistency checks, NSE attempts |
| `dataset/` | the IID-0 dataset the run consumed (10 files, including `prices.json` and `manifest.json`) |
| `artifact/assessment-payload-wi2.json` | the full assessment payload, hash-verified against the chain head |
| `artifact/payload-diff-vs-d3-baseline.json` | the 13-path diff against the reconstructed D-3 baseline, with attribution |
| `runs/01-ingest.txt` | ingest stdout (dataset version, coverage) |
| `runs/commands.txt` | every command actually run, in order, with the observed result of each |
| `runs/02-generate.txt`, `runs/cli-wi2-created.json` | the artifact CLI run and its machine-readable summary |
| `runs/cli-wi2-created.replay.json` | the same run into a second empty store — determinism, not a second result |
| `runs/03-baseline-ingest.txt`, `runs/04-baseline-d3-reconstruction.{json,txt}` | the D-3 baseline reconstructed from the committed Work Item 1 inputs |
| `runs/05-verification.txt` | targeted suites and typechecks (10 + 6 + 14 tests, two typechecks) |
| `runs/06-payload-verify.json` | payload sha256 vs chain head, and the diff-path census |
