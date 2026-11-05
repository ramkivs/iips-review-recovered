# IID-4 — Holding Disposition: evidence package

**Phase:** IID-4 (holding disposition / IID-02) · **Date:** 2026-11-06 · **Branch:**
`arena/c39a5d68-iips-review-recovered` · **Base:** `origin/main` at the time of writing (see the completion report for
the exact commit).

This folder is the phase's evidence. It contains what was run, what it produced, and what it does **not** claim.

## What is in here

| File | What it is |
|---|---|
| `README.md` | this index |
| `ACCEPTANCE-MATRIX.md` | AC-4.1 … AC-4.10, the ten additional scenarios, and the exact test that carries each one |
| `TEST-RUN.md` | the commands, in order, with their exit codes and result counts |
| `logs/typecheck-platform.txt` | `tsc --noEmit` over `iips-platform` |
| `logs/platform-tests.txt` | `tsx --test tests/investment/*.test.ts` over the platform suite |
| `logs/typecheck-frontend-server.txt` | `tsc -p tsconfig.investment-server.json --noEmit` |
| `logs/frontend-tests.txt` | `vitest run server/investment` |
| `logs/demonstration.txt` | the disposition CLI demonstration, eight verification points |
| `demo/iid4-disposition-demonstration.json` | the machine-readable demonstration record |
| `demo/held-payload.json`, `demo/candidate-payload.json` | the two payloads the demonstration produced, verbatim |
| `LIMITATION-IMPACT.md` | how `L-001` … `L-016` bear on dispositions, with `L-014`'s impact stated in full |
| `INDEPENDENT-VERIFICATION.md` | the fresh-clone verification and what it did and did not prove |
| `IID-4-COMPLETION-REPORT.md` | the eleven-section completion report (identifiers live here, not in the documents above) |

## The one-paragraph summary

A held position gets a verb (RETAIN / ACCUMULATE / REDUCE / AVOID) and a candidate gets one (INITIATE / WATCH /
AVOID_CANDIDATE), from a table-driven evidence matrix whose gates are recorded in order and whose caps can only ever
move a verb down. Evidence that cannot support a verb produces a **withheld** disposition with named reasons rather
than a weak verdict. Every payload says what it is not. Persistence reuses the existing NP-04 mechanism through the
existing adapter; the read surface is GET/HEAD only; nothing here can produce an order.

## The data

Synthetic. The only company dispositioned in the demonstration is the IID-2 synthetic reference company, labelled
`SYNTHETIC_REFERENCE` in provenance and on every response. **No real issuer has been dispositioned** (`L-004`,
`L-009`).
