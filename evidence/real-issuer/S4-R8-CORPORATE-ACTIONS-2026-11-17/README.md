# S4-R8 corporate-actions evidence — investigation, not a real action admission

Governing record: `docs/integration/IID-S4-R8-CORPORATE-ACTIONS-2026-11-17.md` (§§1–10).
**G-8 OPEN/event-driven; L-031 OPEN. Determination C.** No real action transcribed; no source rights/O3 change.

- `census.json`: exact baseline, all 597 real-issuer evidence file paths/Git blobs and discovery hit line locators,
  all 13 repository action tables (11 evidence tables empty; two synthetic tables with 3/9 records), separate
  production CLI/readDataset results for historical admitted inputs and the unadmitted refresh candidate.
  Search-hit whitespace is collapsed; original files, not discovery text, govern transcription. A hit is not
  an admitted event. Search/control/Zensar evidence is not admitted issuer coverage.
- `candidate-events.json`: 13 **candidate/group rows**, not 13 validated events; source terms/locators,
  identity, available dates, unknown fields, blockers, window relevance, rights/admission and operator actions.
  Categories 1–5 count 0/2/6/0/5, with zero admissible records. Category 5 includes unsupported/ambiguous schema
  mappings, not fictitious submissions or fabricated validator failures.
- `digest-comparison.json`: production-computed baseline/corrected replay digests; both real-input datasets
  unchanged. Temporary local replays only, no production/host install. No manually authored digest.
- `validation.txt`: commands and captured summaries for tests/typecheck/static validation.

Reproduce the census from `iips-platform/` with `npx tsx scripts/s4r8-corporate-action-census.ts`.
The generator finds the immutable PR #591 merge on main's first-parent history, checks baseline evidence blobs,
uses production ingestion/read-back/digest paths, and cleans temporary datasets. Primary PDFs are not committed;
no web source was retrieved or admitted. This finite search does not prove no corporate actions occurred.

Existing scenario 7 synthetic demonstration is reused unchanged as regression evidence. All new valid/invalid
records in `s4r8-corporate-action-ingestion.test.ts` are **SYNTHETIC_FIXTURE**, never real issuer coverage.
Publication and independent remote verification are reported after the PR checks/merge, not pre-claimed here.
