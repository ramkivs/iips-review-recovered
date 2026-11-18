# S4-R6 / G-4 FY26 reconciliation — metadata receipt

Read [the reconciliation report](../../../docs/integration/IID-S4-R6-FY26-RECONCILIATION-2026-11-18.md) for exact original-source locators, independent-review limits, three-metric results, authority/rights and closure requirements.

**S4-R6 OPEN; G-4 OPEN.** This is not owner-runtime deployment or accepted-limitation closure. Actual local KEC ingestion passes, but actual EV_REVENUE remains withheld (net debt unavailable); field qualification emits FIELD_STALE. Infosys metrics remain missing; its actual dataset is FY24.

## Contents

- `assessment-verification.json`: metadata-only successful canonical read-back and actual-assessment receipt, including separate field qualification and target-only projection of the normal CLI input-coverage report. Not full datasets/payloads.
- `verify-ingested-assessment.ts`: post-ingestion verification against the real ignored local snapshot. Does not mint or install data, fetch filings, create a candidate record, change policies or rerun the census. Writes full assessment payloads **only to the ignored local root**, stdout is metadata. A fresh clone without private local inputs cannot reproduce that execution from this metadata alone.
- `execution.json`: exact CLI invocation, input-preservation hashes and admission boundary; no canonical data rows.
- `source-binding.json`: source identity/locator metadata. The audited **PDF byte digest** and the existing **page-extract digest** are deliberately distinct.
- `infosys-bundle-lookup.json`: targeted lookup of tracked statement CSVs for Infosys FY26, not a broad operating-metric census.
- `requirement-matrix-update.json`: additive overlay referencing the original unchanged 14/38 matrix and its exact metric definitions. Twelve unmeasured slots unchanged.
- `preservation.json`: baseline identities of historical evidence, source files and production inputs/code. Not a dataset-install receipt.
- `test_reconciliation.py`: new standard-library checks of this update, including the actual receipt, overlay, dates, preserved identities and publication boundary. Does not rerun the old25 tests/probes/census.
- `validation.txt`, `SHA256SUMS`: validation outcome and checksums. Git commit/remote tree and CI read-back are posted on PR597 after publication; a green existing static CI does not claim to have rerun the private data execution.

## Commands

Actual **one** CLI ingestion used three private copies, without `--allow-errors` (see `execution.json`):

```sh
iips-platform/node_modules/.bin/tsx iips-platform/src/investment/cli/ingest.ts \
  --input LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-reconciliation/input/infosys \
  --input LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-reconciliation/input/marico \
  --input LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-reconciliation/input/kec \
  --dataset-dir LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-reconciliation/dataset \
  --now 2026-11-18T00:00:00.000Z
```

Verify, if the authorized private local directory exists:

```sh
iips-platform/node_modules/.bin/tsx evidence/iid/S4-R6-FY26-RECONCILIATION-2026-11-18/verify-ingested-assessment.ts
```

Metadata checks (no private data/dependencies required):

```sh
python evidence/iid/S4-R6-FY26-RECONCILIATION-2026-11-18/test_reconciliation.py -v
```

No source PDF, page text, canonical CSV/new full metric record, full dataset or full assessment payload is added to Git by this update. Calculation assertions/operand discussion are not a redistributed canonical record. Existing historical source extracts are read without modification. Personal-use operator assertion is not a redistribution licence. No merge or host installation was performed.
