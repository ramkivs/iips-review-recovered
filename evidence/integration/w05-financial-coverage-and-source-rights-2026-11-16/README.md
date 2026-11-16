# W05 — financial coverage and source rights: evidence of the status record of 2026-11-16

Evidence for [`docs/integration/W05-FINANCIAL-COVERAGE-AND-SOURCE-RIGHTS-STATUS-2026-11-16.md`](../../../docs/integration/W05-FINANCIAL-COVERAGE-AND-SOURCE-RIGHTS-STATUS-2026-11-16.md).

Everything here was produced from repository content. Nothing was run on the Windows host, nothing was
downloaded, no dataset was installed or changed, and no rights declaration was written.

| File | What it is | How it was produced |
|---|---|---|
| `build-dossier.mts` | Read-only script. It reads `evidence/real-issuer` in the checked-out tree and classifies every committed dataset with the product's own code (`readDataset`, `sourceRightsOf`, `classifyDataset`, `buildInvestmentCoverageReport`) | Written for this record |
| `dossier.json` | Output of the script on IRR `main` `064195397dfdb32bf0f34a461b02fd6b9f9a8df0`: five dataset manifests, eight ingest inputs, the source-material census and the product schema counts | `tsx build-dossier.mts` |
| `unmerged-rights-records-readback-2026-11-16.json` | Identity (ref, commit, Git blob, SHA-256, size) of the rights records that exist only on unmerged refs, the classifier those refs carry, and the result of a trial merge into `main` | `git show`, `git rev-parse`, `git merge-tree --write-tree` in a scratch clone. No ref was written |

## Reproduce

From the repository root, after `npm ci` in `frontend` (the script uses its `tsx`):

```bash
PATH="$PWD/frontend/node_modules/.bin:$PATH" tsx evidence/integration/w05-financial-coverage-and-source-rights-2026-11-16/build-dossier.mts --check
```

`--check` writes nothing. It exits 0 when `dossier.json` equals a fresh build of the tree and 1 when it
does not. A difference after a later commit is expected when that commit adds or changes a bundle under
`evidence/real-issuer`: the dossier is a dated record of `main` at the commit named above, not a gate.

## Reading the dossier

- `rights.declarationInManifest` is `ABSENT` when the manifest has no `sourceRights` field. `rights.state`
  and `rights.datasetClass` are what the product resolves from it. `rights.classOnCoverageSurface` is what
  the investment-coverage read model reports for the same manifest.
- `clocks` keeps the statement period (`latestPeriodEnd`, `dataAsOf`) apart from the import clock
  (`knownAsOf`, `lastImportAt`).
- `observations` counts filed observations by presence. `NIL_BY_DISCLOSURE` is a nil stated by the source;
  `MISSING` is an absent value with its reason. Neither is a zero.
- `ingestInputs` are operator-file inputs. The input format has no rights field; a dataset gets its rights
  declaration from the writer that builds it.
- Issuer names and identifiers in the dossier are those of the public companies of the evidence bundles.
  No holding of any portfolio is read or named.
