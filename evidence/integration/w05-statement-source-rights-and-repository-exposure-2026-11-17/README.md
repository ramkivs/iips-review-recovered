# W05 — statement source, source rights and repository exposure: evidence

Evidence for [`docs/integration/W05-STATEMENT-SOURCE-RIGHTS-AND-REPOSITORY-EXPOSURE-ASSESSMENT-2026-11-17.md`](../../../docs/integration/W05-STATEMENT-SOURCE-RIGHTS-AND-REPOSITORY-EXPOSURE-ASSESSMENT-2026-11-17.md).

Read-only. Nothing here changes a dataset, a manifest, a rights declaration, an authorization record or an evidence bundle. No filing, dataset or market-data file was downloaded, and no file here contains filing text, holdings, quantities or values.

| File | What it is |
|---|---|
| [`build_inventory.py`](build_inventory.py) | Classifies every tracked file under `evidence/real-issuer/` as source data, derived data, metadata or evidence, and measures where filing text is reproduced. The rules are the function `classify` and the table `SOURCE_DIR_NOTES` |
| [`inventory.json`](inventory.json) | Its output: a summary and one entry per file with path, bundle, class, bytes and Git blob. Paths and measurements only |
| [`portfolio_source_gap.py`](portfolio_source_gap.py) | Compares the ISIN column of the committed 68-row holdings surface with every ISIN named in the bundles, and records the digests of the two `O3` records, `PA-01` and the limitation register |
| [`portfolio-source-gap.json`](portfolio-source-gap.json) | Its output: counts, the bundle-side identifiers and the record digests. No identifier of a holding |
| [`external-sources.json`](external-sources.json) | The fourteen external sources: address requested, address reported, how each was read, the passages relied on, and what was not read |
| [`check_record.py`](check_record.py) | Checks the figures of the record against the two outputs, the links of the record and of this file, and that no existing file is modified |

## Reproduce

```
python3 evidence/integration/w05-statement-source-rights-and-repository-exposure-2026-11-17/build_inventory.py --check
python3 evidence/integration/w05-statement-source-rights-and-repository-exposure-2026-11-17/portfolio_source_gap.py --check
python3 evidence/integration/w05-statement-source-rights-and-repository-exposure-2026-11-17/check_record.py
```

All three need only Python 3 and Git, read the working tree, and contact no network host.

## Classification rules in short

| Class | Rule |
|---|---|
| Source data | A file in a `source` directory that reproduces a third party's document or file: the text of a filing page or note, quotations from a filing, an exchange-hosted XBRL or rendered filing file, a row of an exchange price file |
| Derived data | Figures transcribed or selected from filings (`ingest-input`, `input`, the selected XBRL facts) and the datasets built from them (`dataset`, `dataset-v1`) |
| Metadata | Describes a source without reproducing it: digest ledgers, page maps, document digests, identity files, retrieval and search logs |
| Evidence | Everything else: run output, assessment payloads, findings, determinations, READMEs |

Eleven files in `source` directories are not copies of a filing; each was read and is named in `SOURCE_DIR_NOTES`. Filing text outside the source files is measured in two ways: text between the page markers that run reports print (`=== ... PAGE n ... ===` to `=== END ... ===`), and lines of 50 characters or more that also stand in a source text file.

## Limits

- The classes are this assessment's reading of each file's role. They are not a legal classification.
- The page-marker measure counts the five run reports that use such markers. A report that printed filing text without a marker would be found only by the second measure.
- Clone and view counts of the repository were not available to the session (the traffic API answered 403).
- The external pages were read on 2026-11-17. NSE states that its terms change without notice.
