# WI-7 / `L-038` residual — two decisions and one absence

**Issuer.** Marico Limited — CIN `L15140MH1988PLC049208`, consolidated statements, FY2022-23 and FY2023-24 reports
(the same filings the WI-7 and §17.18 bundles carry).

**The three questions this bundle answers.** §17.18 left `L-038` `OPEN` with two named blockers and one undecided
finding: `DEBT-COMPONENT-PERIOD-ALIGNMENT`, `CASH-SIDE-PERIOD-ALIGNMENT` and `PREFERENCE_CAPITAL`
(`MISSING / NOT_REPORTED`). This work item asked one thing of each: **can it be closed by evidence and existing
authority, or does it need a decision?** It re-ran nothing that was already established — the caption search, the
Note 13(a) recovery, the one-cell dataset correction and the §17.15 arithmetic correction are cited, not repeated —
and it changed no code, dataset, payload, policy or manifest.

**Answers, in one line each.**

| residual | what it is | closed here? |
| --- | --- | --- |
| `DEBT-COMPONENT-PERIOD-ALIGNMENT` | **not an evidence question.** The same-instant rule is an essential, documented invariant and stays strict. The *anchor* is the open question: driven with only 2023-03-31 — the one instant at which all six inputs carry a filed number — the unmodified contract computes gross debt 608, cash 785 and net debt −177 crore. Publishing that is a period-anchoring decision, not a data one, and it would still not close `L-038` because preference capital remains absent. | no — register-owner decision |
| `CASH-SIDE-PERIOD-ALIGNMENT` | **a real contract gap, latent today.** The same-instant rule covers the four debt components only; the cash side is summed and subtracted with no period comparison, and a synthetic two-instant fixture publishes net debt −257 crore across two balance sheets. No committed dataset is in that state (0 of 9). Fixing it is a contract change. | no — contract authority required |
| `PREFERENCE_CAPITAL` | **an evidence question whose answer is still "absent".** Note 12(a) prints a preference class only in *authorised* capital; issued capital is equity-only, 129 / 129; the rights paragraph enumerates the equity classes and does not mention the preference class the table above it prints. No wording declares it nil, and the two governed precedents (WI-5's withdrawal, `L-035`'s accepted cross-scope nil) both require wording Marico does not have. | no — nothing new to read |

**What this bundle is not.** It is not a new argument that the numbers should be published, not a policy change, and not
a re-opening of `L-038`. The limitation stays `OPEN`; §17.22 records why, in terms a reader can act on: one decision
about anchoring, one decision about the cash side, one missing disclosure.

## Contents

| path | what it is |
| --- | --- |
| `determination-l038-residual.json` | the machine-readable determination: each residual, its evidence, the exact decision required, the consequences and the owner |
| `probe/probe.ts` | the probe behind `runs/01`. Drives the **unmodified** `capitalStructure.ts` with the **committed** dataset input of the §17.18 bundle |
| `probe/cash-side-scan.py` | the reachability scan behind `runs/03`, over every committed dataset |
| `probe/preference-re-read.py` | the restricted re-read behind `runs/04`: the one extracted share-capital page and the two governed precedents, with hashes |
| `runs/01-probe.txt` | A-1 as published (`PERIOD_MISMATCH`, cash 487); A-2 anchored at 2023-03-31 (608 / 785 / −177, preference still `MISSING`); B-1 the synthetic cross-period fixture (528 / 785 / −257) |
| `runs/02-published-payload-block.txt` | the capital-structure block exactly as the published payload carries it, with its artifact sha256 and `datasetVersion` |
| `runs/03-cash-side-corpus-scan.txt` | the nine committed datasets, side by side: 2 same-instant, 5 debt-blocked, 2 cash-incomplete, **0** that would publish cross-period net debt |
| `runs/04-preference-capital-re-read.txt` | the p.189 cells (left column only), the completed search's result, and the two precedents with their sha256 |
| `runs/05-targeted-tests.txt` | `l038MaricoDebtCompleteness.test.ts` + `assessment-capital.test.ts` — **34/34** |
| `runs/06-typecheck.txt` | `tsc --noEmit`, exit 0 |
| `runs/07-manifest-and-payload-verification.txt` | all 18 committed `digests.json` manifests verify (0 mismatches); both Marico payloads byte-identical; the dataset input unchanged |
| `runs/08-clean-clone.txt` | the same checks re-run from a fresh clone of the published branch |
| `runs/commands.txt` | every command, in order |
| `digests.json` | this bundle's own manifest |

## Reproducing it

```bash
# the probe (from iips-platform/, so the platform's own dependencies resolve)
cd iips-platform && npx tsx ../evidence/real-issuer/WI7-L038-RESIDUAL-2026-11-08/probe/probe.ts

# the two scans (from the repository root)
python3 evidence/real-issuer/WI7-L038-RESIDUAL-2026-11-08/probe/cash-side-scan.py
python3 evidence/real-issuer/WI7-L038-RESIDUAL-2026-11-08/probe/preference-re-read.py
```

Nothing in the probe writes; it reads `../WI7-L038-DEBT-COMPLETENESS-2026-11-07/ingest-input/periods.csv`
(sha256 `7ce8844f…a6f9`), and every cell it feeds the contract is that file's own value scaled from crore to rupees.

## A pointer this bundle corrects

§17.18's evidence paragraph names `ingest-input/corrections.json` as the file carrying the single corrected cell.
**No such file exists**: the corrections manifest is the `corrections` object inside
`ingest-input/data-extraction.json` (`supersedes`, `supersededStatement`, `whatIsWrong`, `whatChanges`,
`whatDoesNotChange`). The pointer is corrected in §17.22; no finding, figure or status changes.
