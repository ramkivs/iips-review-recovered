# S4-R3 filing refresh — additive candidate evidence

**Date:** 2026-11-14 (UTC)  
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — candidate data/evidence, not a host installation  
**Design record:** `docs/integration/IID-STAGE4-S4-R3-REFRESH-DESIGN-2026-11-14.md`

## What this bundle is

This bundle adds the newer filings that are actually supported by bytes already committed in this repository:

- **Marico:** FY2025 and FY2026 consolidated annual periods, transcribed from the verbatim annual-report page extracts in `WI12-L038-PREFERENCE-CAPITAL-2026-11-08/runs/02` and `runs/03`.
- **KEC:** Q1 FY27 and Q2 FY27 discrete consolidated quarterly periods. Q1 P&L comes from the verbatim page extract in `WI12-L039-CURRENT-INVESTMENTS-2026-11-05/runs/decisive-report.txt` §D; Q2 P&L comes from the committed September XBRL `OneD` context, and Q2 balance-sheet items come from the printed balance sheet in §E cross-checked against `OneI`.
- **Infosys:** no newer source is committed. S4-R3 remains open for Infosys; nothing is inferred.

The candidate dataset built from the original Infosys input plus the two refreshed issuer directories has:

```text
datasetVersion sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
issuers        3
annual         11
quarterly      2
issues         0
measured       3/13 sectors
```

The historical admitted inputs are untouched and still reproduce:

```text
sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83
```

## What this bundle is not

- It is **not** an installation over `C:\iips-data` or any other host dataset.
- It is **not** an O3 admission decision for the refreshed content. The admitted population remains the three historical bundles until the owner accepts a refresh.
- It is **not** a freshness-policy or assessment-engine change. At as-of 2026-11-14, Infosys remains 958 days stale, Marico improves to 228 days but remains stale, and KEC remains 228 annual days stale while gaining quarterly coverage. `STALE_STATEMENTS` and `STALE_DATA` are not lifted.
- It is **not** independent source-rights verification. `L-041` remains open; the PDFs themselves are not committed, so the verified chain is committed extract/XBRL → transcription → dataset → derivation.

## Input shape

The existing multi-input merger refuses two bundles that claim the same issuer. The refreshed directories are therefore complete replacement inputs for their issuer:

```text
ingest-input/marico/roster.json   byte-for-byte copy of WI7 roster
ingest-input/marico/periods.csv   WI7 historical periods + FY2025/FY2026 annuals
ingest-input/kec/roster.json      byte-for-byte copy of WI8 roster
ingest-input/kec/periods.csv      WI8 historical periods + Q1/Q2 FY27 discrete quarters
```

A candidate build supplies each issuer exactly once:

```bash
cd iips-platform
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input \
  --input ../evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico \
  --input ../evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec \
  --dataset-dir /tmp/iid-s4-r3-candidate/investment/dataset \
  --now 2026-11-14T00:00:00.000Z
```

On Windows, use a **new candidate directory**, not the installed Stage 3 dataset, unless a separate operator acceptance act authorises replacement. The equivalent runner is `node iips-platform/node_modules/tsx/dist/cli.mjs iips-platform/src/investment/cli/ingest.ts` with the same arguments.

## Transcription safeguards

- 105 new populated cells: 100 reported values and 5 operator sums; 15 explicit not-reported reasons. See `runs/03-source-census.json`.
- Marico FY2025 is kept as filed in the FY2025 report. The FY2026 comparative column differs (for example total assets 8,332 vs 8,338; trade-payable sum 1,306 vs 1,363) and is recorded as a cross-check, not an overwrite.
- KEC Q2 PPE uses the printed balance-sheet split: PPE 1,270.63 crore and right-of-use assets 310.32 crore. The XBRL `PropertyPlantAndEquipment` fact is 1,580.95 crore because it aggregates them; that difference is recorded.
- KEC Q2 cash-flow facts in the committed XBRL are `FourD` half-year YTD, not discrete Q2. They are retained as source evidence but not assigned to the quarter.
- KEC current investments, lease liabilities, current maturities, NCI, and owners’ profit remain `NOT_REPORTED` where the committed source does not support a governed value. The L-039 `CurrentInvestments = 0` machine fact is not promoted to a disclosed zero.

## Reproducibility and verification

- `probe/build_refresh.py` regenerates the source excerpts, selected XBRL facts, extraction map, and candidate CSVs from committed evidence only. It performs no network access and writes no historical bundle.
- `iips-platform/tests/investment/iidStage4FilingRefresh.test.ts` verifies the source locators, historical preservation, candidate digest/counts, coverage read path, freshness non-closure, derivations, and refusals.
- `runs/01-candidate-ingest-provision.txt` records a real temporary-root CLI build and read-only assessment measurement.
- `runs/02-refresh-test.txt`, `runs/05-gates.txt`, and `runs/06-targeted-final.txt` record the test/gate results.
- `runs/candidate-manifest.json`, `runs/candidate-coverage.json`, and `runs/candidate-assessments-readonly.json` are the measured candidate outputs. The assessment file is a read-only measurement, not a minted NP-04 artefact.

## Remaining acts

1. Owner/operator acceptance of the refreshed content as operational input, if desired.
2. Separate host installation/verification into a designated dataset location, with a new expected digest and host captures.
3. Infosys newer filing acquisition/transcription, or an explicit record that Infosys remains stale.
4. Any freshness-policy/engine decision remains outside this bundle and is not implied by it.
