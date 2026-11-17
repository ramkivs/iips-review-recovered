# W05 — IID reconciliation and the authorization reference: evidence of the record of 2026-11-17

Evidence for [`docs/integration/W05-IID-RECONCILIATION-AND-AUTHORIZATION-REFERENCE-2026-11-17.md`](../../../docs/integration/W05-IID-RECONCILIATION-AND-AUTHORIZATION-REFERENCE-2026-11-17.md).

Everything here was produced from repository content. Nothing was run on the Windows host, nothing was
downloaded, no dataset was installed or changed, and no rights declaration was written to any committed
file.

| File | What it is | How it was produced |
|---|---|---|
| `build-citation-matrix.mts` | Read-only script. For every directory under `evidence/real-issuer` that holds a `roster.json`, it computes the input digest and the dataset version the input produces alone, and asks the check behind `ingest.ts --authorization-record` whether the input can name each listed decision record. It uses the product's own code (`loadInputBundle`, `computeInputDigest`, `buildDatasetContent`, `computeContentDigest`, `citeAuthorizationRecords`). It builds content in memory and writes no dataset | Written for the record of 2026-11-17 |
| `citation-matrix.json` | Output of the script: the two listed records as committed (SHA-256, Git blob, size, what each admits) and eleven input directories with the answer for each record | `build-citation-matrix.mts`, on the tree that carries this folder |

## Reproduce

From the repository root, after `npm ci` in `frontend` (the script uses its `tsx`):

```bash
PATH="$PWD/frontend/node_modules/.bin:$PATH" tsx evidence/integration/w05-iid-reconciliation-and-authorization-reference-2026-11-17/build-citation-matrix.mts --check
```

`--check` writes nothing. It exits 0 when `citation-matrix.json` equals a fresh build of the tree and 1 when
it does not. A difference after a later commit is expected when that commit adds or changes an input under
`evidence/real-issuer`, or adds a decision record to the list: the matrix is a dated record, not a gate.

## Reading the matrix

- `records[].committedFileIsTheListedRecord` is `true` when the file in the tree has the SHA-256 the list
  pins. The ingestion CLI refuses a record file for which it would be `false`.
- `records[].admittedInputs[].establishedBy` is `STATED` when the record states the input digest itself and
  `LEDGER` when the record names the bundle's `digests.json` by Git blob and that ledger gives the SHA-256 of
  each input file.
- `inputs[].citation[].result` is `ADMITTED` when the input, alone, can name that record and `REFUSED`
  otherwise, with the refusal `code`. `datasetAloneStatedByRecord` says whether the record states the dataset
  this input produces alone; where the record states one, the build must reproduce it.
- `inputs[].canNameARecord` is `true` for six directories. One of them,
  `D2-NIL-BY-DISCLOSURE-2026-11-06/input`, is a byte-identical copy of the `REL-1` Infosys input, so it has
  the same input digest. An input is identified by its bytes, not by its directory.

## What this evidence does not show

It does not show that any dataset is installed on the host, or what the installed manifest says. It does
not show that any third party's terms were reviewed; the listed records say they were not. It does not
change which bundles are admitted: the list is a transcription of the two `O3` records, and the tests in
`iips-platform/tests/investment/authorizationRecords.test.ts` compare it with them.
