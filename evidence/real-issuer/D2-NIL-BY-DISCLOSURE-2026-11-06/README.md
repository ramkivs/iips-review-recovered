# D-2 — Nil-by-Disclosure: evidence bundle

**Work item:** IIPS v3.0 D-2 — a debt-free issuer cannot be valued or graded (representation and one aggregation
contract only).
**Date:** 2026-11-06. **Baseline:** `main` `98f3e45` (PR #486 merged).
**Design and report:** `docs/integration/IIPS_V3_IID_D2_NIL_BY_DISCLOSURE_2026-11-06.md`.

This bundle is **self-contained and additive**. The Work Item 1 bundle
(`evidence/real-issuer/REL-1-INFOSYS-2026-11-06/`) is byte-identical to the merged commit, including its
`README.md` index, which therefore does not list this folder; the D-2 document and the pull request are the entry
points.

## What is here

| Path | What it is |
| --- | --- |
| `input/roster.json` | byte copy of the Work Item 1 roster (the issuer under test is unchanged) |
| `input/periods.csv` | the Work Item 1 facts **plus four nil-declared columns**: `LONG_TERM_BORROWINGS`, `SHORT_TERM_BORROWINGS`, `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`, `PREFERENCE_CAPITAL`, each `NIL: no such line is presented in the consolidated balance sheet` |
| `runs/baseline-unchanged-input.json` | the **pre-fix behaviour**, reproduced with the post-change code on the untouched Work Item 1 input |
| `runs/reassessment-summary.json` | the same issuer after the correction, on `input/periods.csv` |
| `runs/cli-dry-run.txt` | the composed artifact for the corrected dataset (`--dry-run`, nothing persisted) |
| `runs/nil-by-disclosure-tests.txt` | TAP output of the 27 new tests |
| `runs/investment-suite.txt` | tail of the full investment suite |
| `runs/commands.txt` | the exact commands, and the digests they produced |

## Measured result

Same issuer, same filing, same engine, same thresholds; the only difference is that the filer's silence about
borrowings is now stated instead of inferred:

| | baseline (`ca29c835…`) | corrected input (`cdb29d34…`) |
| --- | --- | --- |
| three borrowings components | `MISSING` / `NOT_REPORTED` | `NIL_BY_DISCLOSURE` / `DECLARED_NIL_IN_SOURCE` + source + period |
| gross debt | `MISSING` / `NOT_REPORTED` | `PRESENT` ₹8,359 cr (leases), nil components named in the note |
| net debt | `MISSING` / `NOT_REPORTED` | `PRESENT` −₹19,342 cr |
| `DCF_FCFF` per share | `NOT_COMPUTABLE` | ₹990.75 |
| `EV_EBITDA` | not applicable | ₹1,133.95 |
| `intrinsic` | `null` | ₹875.34 – ₹1,399.81 (mid ₹1,088.97) |
| moat | `INSUFFICIENT_EVIDENCE` | `NARROW` |
| margin of safety | refused `NO_PRICE_OBSERVATION` | refused `NO_PRICE_OBSERVATION` |
| risk aggregate | `POLICY_INPUTS_UNAVAILABLE` | `POLICY_INPUTS_UNAVAILABLE` (D-3, unchanged) |
| confidence | 0.4939 | 0.6736 (bounds unchanged: `STALE_DATA`, `DILUTION_PROXY`) |
| sector coverage | `Technology` `G2_PARTIAL`, usable 2, withheld 2, 87.5% | identical |
| ingestion issues | 0 | 0 |

**What this is not.** Not a valuation of Infosys, not a validation of one, and not a verdict change: no market price
was observed, so no margin of safety exists; the intrinsic band is the already-published policy blend. No artifact
was persisted, the Work Item 1 chain is untouched, and any reassessment or version comparison is a later work item.

**Regression of the baseline.** Re-ingesting the untouched Work Item 1 input with the post-change code reproduces
dataset version `sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e` exactly, and the same
withheld outcomes. Existing data is not reinterpreted by this change.

## Reproduce

```
cd iips-platform
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/D2-NIL-BY-DISCLOSURE-2026-11-06/input \
  --dataset-dir /tmp/d2/data/investment/dataset --now 2026-11-06T00:00:00.000Z
cp -r ../evidence/real-issuer/REL-1-INFOSYS-2026-11-06/identity /tmp/d2/data/investment/identity
cd ../frontend
npx tsx server/investment/cli/generate-investment-artifacts.ts --issuer IN:CIN:L85110KA1981PLC013115 \
  --data-dir /tmp/d2/data/investment/dataset --identity-dir /tmp/d2/data/investment/identity \
  --generated-at 2026-11-06T00:00:00.000Z --dry-run
```

The figures above come from the same dataset through `assessCompany()`, captured verbatim in `runs/`; see
`runs/commands.txt` for the full sequence and digests.
