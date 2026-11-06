# IID-5 — evidence bundle

**Record:** `IIPS-V3-IID5-HISTORICAL-CHANGE-INTELLIGENCE`
**Date:** 2026-11-06
**Starting commit:** `ffb80ce` (PR #478 merge on `main`)
**Branch under test:** `arena/d36d8749-iips-review-recovered`

This directory holds the reproducible evidence for IID-5, in the order a reader should check it:

| File | What it proves |
|---|---|
| `typecheck.txt` | `tsc -p tsconfig.investment-server.json --noEmit` is clean (0 bytes of output, exit 0) |
| `test-run.txt` | the whole investment server area: **189 passed / 13 files** |
| `iid5-suites.txt` | the four new suites in verbose form: **77 passed**, test names visible |
| `digests.json` | the reference digests, grammars, exclusion lists and the behaviour each suite pins |

## Commands, exactly as run

```bash
cd frontend
npx tsc -p tsconfig.investment-server.json --noEmit                     # exit 0, no output
./node_modules/.bin/vitest run server/investment                        # 189 passed (13 files)
./node_modules/.bin/vitest run \
  server/investment/substantive-identity.test.ts \
  server/investment/change/comparison.test.ts \
  server/investment/change/store.test.ts \
  server/investment/change/transport.test.ts --reporter=verbose        # 77 passed (4 files)
```

`node_modules` was installed with `npm ci --no-audit --no-fund --strict-ssl=false` (the sandbox has no system CA
bundle for the pinned GitHub tarballs); the install is not part of the repository.

## The reference digests reproduce

The L-014 decision published five reference digests for its minimal projection. Three of them are asserted as
**constants** in `server/investment/substantive-identity.test.ts`, so the implementation is pinned to the decision
rather than to itself:

| Fixture | Digest | Meaning |
|---|---|---|
| C1 — M1 assessment, baseline clock | `08ea8d4ae1732b5a23de17017aad07cd006ba4d8dcf9f4abc032d016ee3f10e1` | the published baseline |
| C4 — same assessment, later clock, larger staleness | `08ea8d4ae1732b5a23de17017aad07cd006ba4d8dcf9f4abc032d016ee3f10e1` | identical: the clock is outside identity, while the **byte** digest differs |
| C5 — dataset v2 | `34240407c627d631e2166d0ce4c209d7ee119a17e9593d3b62cc54afdf1a5346` | different: data is inside identity |

The two input identities the phase records in provenance are also pinned, and demonstrate the same split:
`bea2c9b8…` for the baseline assessment, `e2f4af33…` for dataset v2 — same clock invariance, same dataset
sensitivity.

## What the store suite demonstrates (not mocked)

1. Record the M1 assessment → `CREATED`.
2. Re-run at a later clock (bytes differ, meaning does not) → **`CLOCK_ONLY_UNCHANGED`**, `wrote: false`, chain still
   one version, head byte-identical, and the unpersisted byte digest reported.
3. Record a +12 % intrinsic-value variant → `APPENDED` (v2), same `reportKey`; version 1 still reads byte-for-byte.
4. Record a quality downgrade → `APPENDED` (v3).
5. Compare every adjacent pair → `[SUBSTANTIVE, SUBSTANTIVE]`; attribution `EXACT`/`DATA`; reproduction `EXACT` on
   both legs; source references equal to the stored views' digests.
6. Write the 1→2 boundary → change report `CREATED` on `icr:co:…`; write it again → `UNCHANGED`, same report id.
7. Reconcile → 2 boundaries, coverage complete; reconcile again → 0 created, still 2 stored.
8. Force an append failure on the 2→3 pair → 1 created, 1 gap, `complete: false`; then fill only that gap.
9. Tamper with a stored payload → both the comparison and the chain read refuse.
10. Strip the substantive members from a stored row → served `DERIVED`, compared correctly, and the row **still**
    contains no digest (the derivation is retroactive, never persisted).
11. Record two dispositions differing only by clock → `CLOCK_ONLY_UNCHANGED`; then move the verb to `AVOID` →
    `APPENDED`, `CRITICAL`, review priority `HIGH`.

## What is deliberately absent from this evidence

- No claim that an old model was re-executed: `modelBuildDigest` and `platformCommit` are `null`, and the reason is
  recorded in the reproduction record.
- No claim that a change report improves an investment decision: every response carries
  `decisionSupportOnly`/`noTradeExecution` and states that the comparison is not an instruction.
- No claim about a real issuer: the fixtures are the synthetic M1 reference dataset, so `L-004`/`L-009` apply
  unchanged.
- **IID-6 is NOT STARTED.** No product UI exists, and none is implied by these two GET/HEAD routes.
