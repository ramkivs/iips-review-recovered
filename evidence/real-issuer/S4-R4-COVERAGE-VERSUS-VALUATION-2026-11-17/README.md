# `S4-R4` — coverage `usable` vs a valuation: the measured evidence (2026-11-17)

**Work item:** `S4-R4` — *"Document that coverage 'usable' does not mean that a valuation would be produced"*
(`IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md`, remaining-actions table; criterion: *"a source-level note in the
coverage module stating the window difference"* → *"the note committed"*).

**Disposition:** **CLOSED** — the note is committed in `coverage/measure.ts` (with a pointer in
`coverage/investmentCoverage.ts` and `identity/coverage.ts`), and the long-form contract is
`docs/integration/IID-COVERAGE-USABLE-VERSUS-VALUATION-2026-11-17.md`. No behaviour changed: the three files are
**identical to their committed predecessors once comments are stripped** (§1).

This bundle holds the two datasets' coverage summaries and the machine-readable coverage-versus-assessment paper the
document's tables are drawn from. Nothing here is a new dataset, an admission, an installation or a served claim.

---

## 1. The edits are documentation-only, and that is checked rather than asserted

Three files were touched, all **comments only** — no statement, no expression, no type and no string constant changed:

| File | Change |
|---|---|
| `iips-platform/src/investment/coverage/measure.ts` | the module header gained the `S4-R4` clause (same line count, so the historical line references to this file still resolve), and a contract note was appended after the last declaration |
| `iips-platform/src/investment/coverage/investmentCoverage.ts` | a note appended after the last declaration, saying what the served coverage fields do and do not say |
| `iips-platform/src/investment/identity/coverage.ts` | a comment above the `usableMethods` counter, saying the count is a dataset statement, not a valuation one |

Two independent checks, both reproducible:

1. **Comment-stripping identity.** Each file's `HEAD` blob and its working-tree content are passed through a
   block-comment remover and whole-line `//` remover, then blank lines are dropped. The results are byte-identical
   (266 / 437 / 270 code lines before and after, in that order). A production behaviour change would have to survive
   that comparison.
2. **Output identity.** The coverage report, the rendered summary and **all six** assessment payloads were hashed
   before and after the edits, over both datasets. Every digest is unchanged:

```text
dataset 69bbc14e…  coverage report  84869d96486c64293b08dc2a8139ada3f8e87832aaa1bb5475c209d30d9a6091
                   rendered summary b3d5145fc089a685470cfbd78ba98d09d0e1bda0f83c157dae2b70b5931f816c
dataset bdfb2527…  coverage report  3a1142b2da3248c8be76ed3ca7cfd4fe05ff516d580af82142c7ad240bd19412
                   rendered summary 68bc0a36d7a2cca855b9f8b5998d04e043686e57d85443741e79dc5d47b095ed
assessment payloads (both datasets, three issuers) — unchanged before/after
```

The per-issuer payload digests are recorded in `runs/coverage-versus-assessment.json` (`issuers[].assessment.payloadSha256`).

## 2. What the two datasets show

Both built from committed inputs at clock **2026-11-17**; both measure **3 of 13** sectors and serve
`usableMethods 7 / withheldMethods 31` — the counter that most invites the misreading this item is about.

### (a) `S4R2-69bbc14e` — the repository dataset of record

| Issuer | Coverage says | Assessment says | Divergence |
|---|---|---|---|
| Infosys (Technology) | `EV_EBITDA` **WITHHELD** — `STATEMENT_INPUT_MISSING ["NET_DEBT"]` | **applied**; net debt `PRESENT` −₹19,342 cr; intrinsic **1,088.97** mid | **D2** — coverage withholds, assessment values |
| Marico (Consumer) | `G1_ENABLED`; `EV_EBITDA` **AVAILABLE** (FY2023) | **withheld** `CAPITAL_STRUCTURE_INCOMPLETE`; intrinsic `null` | **D1** — coverage available, assessment refuses |
| KEC (Industrials) | `EV_EBITDA` **AVAILABLE** | **withheld** `CAPITAL_STRUCTURE_INCOMPLETE`; intrinsic `null` | **D1/D3** |

### (b) `ADMITTED-bdfb2527` — the `S4-R3` O3-admitted dataset

| Issuer | Coverage says | Assessment says | Divergence |
|---|---|---|---|
| Infosys | `EV_EBITDA` withheld (`REL-1` carries no borrowing rows at all) | withheld for the same reason; intrinsic `null` | agreement |
| Marico | `G1_ENABLED`; `EV_EBITDA` **AVAILABLE** (FY2023 and FY2026) | **withheld** — `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` `NOT_REPORTED` at FY2026; `DCF_FCFF` applicable but per-share `NOT_COMPUTABLE`; intrinsic `null` | **D3/D5** |
| KEC | `EV_EBITDA` **AVAILABLE** | **withheld** — `CURRENT_INVESTMENTS` `NOT_REPORTED`; intrinsic `null` | **D3/D5** |

**Seven usable method slots, one `G1_ENABLED` sector, zero intrinsic ranges.** That is the item in one line.

## 3. Files

| Path | What it is |
|---|---|
| `runs/S4R2-69bbc14e-coverage-summary.txt` | `renderCoverageSummary` output for dataset (a) |
| `runs/ADMITTED-bdfb2527-coverage-summary.txt` | `renderCoverageSummary` output for dataset (b) |
| `runs/coverage-versus-assessment.json` | per dataset: version/digest, input paths, coverage report and summary digests, the served `financialCoverage` disclosure, every measured sector's method states and reasons, every issuer's derivation inputs across its annual periods, and its assessment block (net debt, gross debt, cash side, bridge treatment, per method applicability/output/reason, intrinsic and weighting, quality flags, confidence and caps) |

## 4. Reproduction

```bash
cd iips-platform

# dataset (a) — the repository dataset of record
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/S4-R2-INFOSYS-BORROWINGS-2026-11-17/ingest-input \
  --input ../evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/ingest-input \
  --input ../evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input \
  --dataset-dir <tmp>/dataset --now 2026-11-17T00:00:00.000Z
#   ⇒ sha256:69bbc14e99cea0e24be568fa923971e7c0536009ab19056f09bf272d437c6fe2

# dataset (b) — the S4-R3 O3-admitted dataset
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input \
  --input ../evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico \
  --input ../evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec \
  --dataset-dir <tmp>/dataset --now 2026-11-17T00:00:00.000Z
#   ⇒ sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
```

`ingest.ts` prints the coverage summary; the assessment blocks come from `assessCompany` over the same dataset at the
same clock. Both dataset versions are asserted by the generator before it writes this bundle.

## 5. What this bundle does not claim

That `S4-R5` is decided (it is **OPEN**: whether coverage availability should remain existential over annual periods).
That any valuation is current (`S4-R3` is **OPEN**; every issuer is `STALE` on its valuation basis at this clock).
That a divergence is a defect — the six classes are two correct answers to two different questions. That any host holds
either dataset — nothing was installed; the admitted dataset remains a candidate published through the O3 process.
