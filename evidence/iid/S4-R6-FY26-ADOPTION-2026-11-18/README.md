# FY26 evidence adoption — supported partial execution

**S4-R6 OPEN; G-4 OPEN.** Read the [full reconciliation report](../../../docs/integration/IID-S4-R6-FY26-ADOPTION-2026-11-18.md), especially residual FY24 component references and rejected KEC aggregate candidates. Local FY26 annual-anchor selection is not owner-runtime installation or formal closure.

## Published files

- `supplied-infosys-payload.json`: user's complete intended semantic JSON, **supplied assertions**, including exhaustive-review claim. Not a canonical schema or independent full-filing certificate.
- `supplied-review-and-mapping.md`: all supplied coverage entries/figures/identifiers/findings/prohibitions and KEC candidates, plus exact semantic-to-existing-contract mapping. No hidden schema fields.
- `audit-binding.json`: SHA-256 binding from the canonical metric source_ref to complete supplied/verified audit and field-map sidecars; not a parser-controlled audit certificate.
- `source-review.json`: newly inspected original-artifact locators and remaining limits; previous independently reviewed sections referenced unchanged.
- `infosys-field-map.json`: source/normalization mapping for every transcribed FY26 statement field; unfilled fields and supplemental restricted-balance evidence explicit. No canonical statement rows published.
- `kec-components.json`: supplied-versus-verified components, contract treatment, residual calculations and exact admission blockers. Neither aggregate candidate admitted.
- `execution.json`: actual CLI command, input identities, historical-row preservation and local-only scope; predecessor private snapshot absent after recovery.
- `assessment-verification.json`: metadata-only successful canonical read-back, actual issuer methods/confidence/field qualification and issuer-specific certified readiness. Not full assessment/qualification payloads.
- `verify-adoption.ts`: post-ingestion verifier using real readDataset/openLocalSnapshot/assessCompany/qualification paths. Does not create inputs or override data/policies. Writes full payloads only to ignored local directory.
- `requirement-matrix-update.json`: second additive evidence-state overlay pinned to original matrix digest;14/38,12unmeasured unchanged, no new census.
- `preservation.json`:389baseline production/historical input/evidence-file hashes; no dataset deployment claim.
- `test_adoption.py`:9new focused metadata/provenance regressions, runnable without private data. Runtime/data assertions live in the post-ingestion verifier.
- `validation.txt`, `SHA256SUMS`: exact validation outcomes/checksums. Final remote commit/tree/CI read-back posted to PR597 after push.

## Reproduction boundary

Private canonical inputs/full datasets/source copies/full computed results are not redistributed. After recovery the previous private snapshot was absent; one successor CLI ingestion necessarily reconstructed the established KEC metric plus new Infosys FY26 inputs. No claim a fresh clone can reconstruct authorized full inputs from these metadata-only receipts.

With the actual authorized private input directory present:

```sh
iips-platform/node_modules/.bin/tsx iips-platform/src/investment/cli/ingest.ts \
 --input LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-adoption/input/infosys \
 --input LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-adoption/input/marico \
 --input LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-adoption/input/kec \
 --dataset-dir LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-adoption/dataset \
 --now 2026-11-18T00:00:00.000Z

iips-platform/node_modules/.bin/tsx evidence/iid/S4-R6-FY26-ADOPTION-2026-11-18/verify-adoption.ts
```

Metadata-only regressions:

```sh
python evidence/iid/S4-R6-FY26-ADOPTION-2026-11-18/test_adoption.py -v
```

Read-back verifies actual FY26 Infosys statement plus **two null MISSING/NOT_REPORTED, UNVALIDATED** metric records, not fabricated VALID numbers. FY24 retained and selected backward by some component lookups, never relabelled. The issuer's annual/valuation-basis anchor is now FY26. KEC positive existing components/Book-to-Bill preserved; current investments missing, no new capital candidate admitted. Both actual EV_REVENUE methods still withhold, both certified sector profiles NOT_QUALIFIED, zero invariants each. No scoring verdict, publication freshness anchor, override or Windows/production installation.
