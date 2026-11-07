# WI-9 / `L-036` — Infosys associates/JV carrying value and the 180-day `POLICY_ZERO` review control

**Date:** 2026-11-07 · **Issuer:** Infosys Limited (`IN:CIN:L85110KA1981PLC013115`, `IN:ISIN:INE009A01021`) ·
**Baseline:** `c95c0480c96a6e88129785bcf14405a12462ade9` · **Scope:** IRR only, local/single-user, non-production ·
**Outcome:** `L-036` stays **`PARTIALLY RESOLVED`** — and the qualifier is now precise.

## The answer, up front

**No associates/JV carrying value exists to report, and none was invented.** In the audited consolidated Ind AS
statements for FY2024, FY2023 and FY2022 the issuer recognises **no equity-accounted interest in an associate or joint
venture at all**: there is no balance-sheet caption of the Ind AS 1 para 54(e) form, no equity-method row in Note 2.5 or
Note 2.5.1, and no share-of-associates line in profit or loss or in OCI. The Note 2.5 decomposition ties to the filed
investment totals **to the rupee** in every period, which is the arithmetic that rules out a hidden component:

| period end | non-current | current | total (filed) | ties |
|---|---:|---:|---:|:--|
| 2024-03-31 | 11,708 | 12,915 | 24,623 | ✔ |
| 2023-03-31 | 12,569 | 6,909 | 19,478 | ✔ |
| 2022-03-31 | 13,651 | 6,673 | 20,324 | ✔ |

So the earlier reading — "unreported, ingestion not performed" — is too weak. The asset is **not recognised**, which
means the criterion cannot be met by a number for this issuer. The treatment is `POLICY_ZERO_UNAVAILABLE` under
`associates-treatment/1.0.0`, and the review control is in force and correctly dated.

## The four findings

### 1. Primary evidence: no carrying value (determination `answers.carryingValueEstablished: false`)

Read in the filed text of all sixteen committed extracts, with the recurring **"associated enterprises"** phrase
accounted for: it appears once, in Note 2.24.1, and it is **income-tax transfer-pricing language** — it names no entity,
asserts no relationship and carries no balance. Notes 2.19 (other income) and 2.25 (related parties, with the
group-structure annexure) are the only notes capable of carrying an associates/JV disclosure; both were read in full and
neither contains one.

Refused by name, because each looks plausible for a second and none is evidence:

| candidate | amount | why refused |
|---|---:|---|
| non-current `Investments` FY2024 | 11,708 | treasury and minority holdings, fully decomposed into Ind AS 109 categories; no equity-accounted component |
| total investments (3 periods) | 24,623 / 19,478 / 20,324 | treasury portfolio totals including current instruments |
| named holdings | 404 / 365 / 377 | minority stakes and fund interests at fair value; fair value is incompatible with the equity method |
| Ideaforge | 113 | a listed minority holding at FVOCI; no significant influence asserted |
| Form AOC-1 | — | an annexure to the **standalone** statements, absent from the audited consolidated set |
| ownership % × associate results | — | forbidden by the work item and by D-2; nothing was inferred |
| a nil from the omission | — | the nil grammar needs the filer's own wording, a filing reference and a period; no sentence declares this balance nil |

### 2. The 180-day control: verified in force, and inert

| member | value |
|---|---|
| `reviewPolicyVersion` | `associates-review/1.0.0` |
| `clockStart` / `clockStartBasis` | **2024-03-31** / `DATASET_PERIOD_END` (the evidence date, never the run clock) |
| `reviewAgeDays` | **180** |
| `reviewDueOn` | **2024-09-27** — 2024-03-31 + 180 calendar days, checked as arithmetic |
| assessment clock | 2026-11-06T14:05:00.000Z → **950 days** elapsed (the payload publishes 950 as `stalenessDays`) |
| `status` / `reviewRequired` | **`REVIEW_DUE`** / `true` |
| `treatment` / policy | `POLICY_ZERO` / `associates-treatment/1.0.0` |

The persisted block is **clock-free** — it carries no `elapsedDays` and no `asOf` — so a later re-run cannot mint a
version by waiting; the age is derived at render time. It is inert where it counts: `valuation.intrinsic` and
`valuation.marginOfSafety` are **byte-identical** to the Work Item 3 artifact. The boundary is pinned by the existing
suite (179 days not due, exactly 180 due, 181 due). **No window, anchor, threshold or flag semantic was moved.**

### 3. A product defect found and corrected: the declared remedy was unreachable

The dataset schema V2 that IX declared as the remedy for `L-036` could not be exercised by an operator. Three links, each
verified by running the product rather than reading it:

1. the ingest CLI never passed a `datasetSchema`, so every ingest produced V1;
2. `writeDataset` never recorded the content's grammar, so a V2 build was written to disk under the V1 identifier;
3. `readDataset` never restored it, so a dataset written as V2 was read back as V1 — the one case that **refuses** the
   line item.

Corrected in three contained changes (`runs/04-v2-operator-path.txt`): an optional `--dataset-schema <id>` resolved
through `assertSupportedDatasetSchema` (absent = V1, unknown = fail closed **before anything is read**); grammar recorded
in the manifest; grammar restored by the reader. The V1 path is provably untouched — the Work Item 3 dataset re-ingests
to **ten byte-identical files**, manifest included (`runs/01-ingest-rerun.txt`).

| | dataset version | payload digest | `associatesAndJV` | treatment | review |
|---|---|---|---|---|---|
| V1 (default) | `sha256:21cf2522…` | `9e7f621d7737…1cb518` | `NOT_COMPUTABLE` / `NOT_REPORTED` / `null` | `POLICY_ZERO_UNAVAILABLE` | `REVIEW_DUE` |
| V2 (declared) | `sha256:21cf2522…` | `11be57e03ead…e783d0` | `MISSING` / `NOT_REPORTED` / `null` | `POLICY_ZERO_UNAVAILABLE` | `REVIEW_DUE` |

The grammar is a manifest member, not a content member: a V2 dataset that actually **carries** the item gets a different
content digest, while a V2 dataset that carries nothing keeps the version of the same periods under V1. Declaring V2 here
changed only how the absence is described — **no value was supplied, and none was available.**

### 4. What did not change, measured

- **Dataset:** `sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847`, all ten files byte-identical
  to `WI3-BORROWINGS-NIL-2026-11-06/dataset/`. No corrections manifest was needed, because nothing was corrected.
- **Payload:** the V1 digest is unchanged at `9e7f621d7737146245bb7a027fe4388e9023e34660ebf6ad26054f25311cb518`
  (55,573 bytes, `reportId` `430c6c1f-fed1-4437-8ebb-c814aaf02a9a`), recomputed by a separate process from the store.
- **WI-3 history:** the committed artifact is untouched — still `confidence.combined` 0.6736 with `caps`
  `['STALE_DATA','DILUTION_PROXY']`. The live 0.4378 differs only because the authorized IX assumption caps now apply
  (additive by category, 0.20 + 0.15, ceiling 0.35, `confidenceFloor: null`): IX's change, register §17.7, not this work
  item's.
- **Valuation:** unchanged (`FAIR`, `mos-policy/1.0.0`); the review flag changes no value, no nil and no confidence.
- **Out of scope, untouched:** D-2 nil semantics, the ledgers/persistence, every other limitation, every other issuer and
  sector, and IPD.

## Why the status stays `PARTIALLY RESOLVED`

The two acceptance criteria have different shapes:

- **review control** — *satisfied*: correct window, correct anchor, correct arithmetic, `REVIEW_DUE` at the assessment
  clock, clock-free, and inert. Left in force.
- **carrying value** — *not satisfied, and not satisfiable by a number for this issuer*: the statements recognise no such
  asset. The representational half is now demonstrably reachable end to end, but reachability is not evidence.

What would resolve it: an issuer that files an equity-accounted carrying value (V2 now carries one through ingestion,
assessment, valuation refusal and readback — asserted in the guard), an issuer sentence declaring the balance nil, or a
register-owner decision to grade an absent caption. None of those exists today, so claiming resolution would be a claim
about plumbing dressed as a claim about a filing.

## Files

| path | what it is |
|---|---|
| `determination-l036.json` | the machine-readable determination: answers, periods, refused candidates, the control, the defect, the boundaries |
| `source/source-map.json` | the sixteen WI-4 extracts with recomputed digests, the filed-text caption scan, the Note 2.5 tie-outs |
| `source/verification-greps.txt` | the same checks as text, incl. the annotation/filed-text split |
| `runs/01-ingest-rerun.txt` | re-ingest of the committed WI-3 input, per-file byte identity |
| `runs/02-generate-persist.txt` | assessment, compose, validate, persist, verify |
| `runs/03-readback.json` | separate-process readback: stored vs recomputed digest, the associates block, the clock-free review |
| `runs/04-v2-operator-path.txt` | the defect, the correction, and the V1/V2 comparison |
| `runs/05-review-control.txt` | the review arithmetic, the boundary, the inertness measurement |
| `runs/06-tests.txt`, `runs/07-typecheck.txt`, `runs/08-post-manifest-verification.txt`, `runs/09-clean-clone.txt` | verification |
| `runs/commands.txt` | every command, in order |
| `artifact/assessment-payload-l036.json` | the canonical payload for the **unchanged** dataset (readback evidence only; supersedes nothing) |
| `digests.json` | the manifest for this bundle |

Guard: `iips-platform/tests/investment/wi9AssociatesResolution.test.ts` (17 tests) plus the new CLI case in
`iips-platform/tests/investment/cli.test.ts` (6/6). Full suite 698/698 in 161 suites; `tsc --noEmit` exits 0.

## Reproduce

```bash
cd iips-platform
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/ingest-input \
  --dataset-dir /tmp/l036/data/investment/dataset --now 2026-11-06T14:05:00.000Z
npx tsx --test tests/investment/wi9AssociatesResolution.test.ts
```

Then generate and read back with the frontend generator (`server/investment/cli/generate-investment-artifacts.ts`), which
needs `IIPS_NP04_DATABASE_PATH` set even when `--db` is passed. Exact invocations and outputs are in `runs/`.
