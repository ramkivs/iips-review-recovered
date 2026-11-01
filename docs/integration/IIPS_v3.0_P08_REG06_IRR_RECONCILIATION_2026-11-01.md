# P-08 / REG-06 — IRR reconciliation and dated technical correction

> **Superseded as current state (`2026-11-01`, `CV-CORR-222`):** this document remains the accurate historical PR #115 / continued-deferral assessment. IPD PR #117 merge `eb9289222e2bdfd0e79381d4d81f7f81715e019b` subsequently completed REG-06 admission and implementation. Current IRR reconciliation: [`IIPS_v3.0_REG06_OPERATOR_DROP_IMPLEMENTATION_IRR_RECONCILIATION_2026-11-01.md`](IIPS_v3.0_REG06_OPERATOR_DROP_IMPLEMENTATION_IRR_RECONCILIATION_2026-11-01.md). The historical text below is preserved.

**Record:** `IIPS-V3-P08-REG06-IRR-RECONCILIATION-2026-11-01-01`
**Tracker:** §16.238 / `CV-CORR-218` / `CHG-2026-11-01-17` / `V1888`–`V1899`
**Date:** 2026-11-01 (Asia/Calcutta)
**Outcome:** **RESOLVED — CONTINUED DEFERRAL (REG-06)**
**Scope:** IRR documentation, matrix and register reconciliation only. IPD read-only.

## 1. Decision and non-claims

The P-08 assessment and the IRR-side documentation discrepancies are resolved. Operator Drop remains an **internal IPD library primitive**. Product admission remains **DEFERRED, fail-closed**, exactly as decided by PA on 2026-10-13.

This is **not** product admission, implementation completion, qualification, acceptance, export exposure, runtime registration, a package-pin change or production authorization. No new PA decision is rendered. PA retains authority over any future manual-ingestion product requirement and REG-06 admission; IPD owns implementation/integration only if subsequently authorized.

The assessment is closed, but the governance deferral remains visible. P-08 is therefore classified as a **resolved governance deferral**, not an active IPD documentation conflict and not an authorized implementation task.

## 2. Independently verified IPD publication

| Field | Verified value |
|---|---|
| Repository | `ramkivs/iips-production-market-data` |
| Remote `main` / merge | `e9c2eef6c82ba51814a72ce962cf227e9fd89d56` |
| PR | #115 — `docs(cap-02): P-08 — Operator Drop / REG-06 product admission: continued deferral on verified evidence` |
| PR head | `7cf9afc957170319c0c69b3e60d01a388045207f` |
| Merge parents | `527f811b17edb02caa665b345d9f36102435e1e8` + PR head |
| Merged | `2026-11-01T09:08:24Z` |
| Changed path | `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md` only; +133/−0 |
| Tracker blob | `efa804097d51263ce91dff4ac7201fb572ef1d8a` |
| Tracker bytes / SHA-256 | 267,714 / `6241aa2b591ec3cf4673b954b39df32180910afd9d24dea7fec78f8a101849fa` |
| Read-back | GitHub raw/blob bytes equal the Git object at the merge; P-08 section explicitly records continued deferral |
| PR-head CI | `41287463022` — success |
| Post-merge CI | `41287576987` — success |
| Executed-count check | `124792149559` — 941 executed / 940 passed / 0 failed |
| Open IPD PRs at verification | 0 |

The IPD record's investigation baseline was `527f811b…`; its publication merge is `e9c2eef6…`. The IRR investigation baseline was `ad7d2362532c146aa023229bae48342eeab646fb`. These are distinct coordinates, not interchangeable pins.

## 3. Dated correction to the PA record

Authoritative instrument: `IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md`, original blob `b13b1fc3029f70d61a06d1f2bb0c2b6fce02cc98`. Its §§5.1–5.4 and historical §5.2 observations are preserved. New §5.5 supplies the dated correction and a visible pointer is added at §5.2.

| Subject | Historical finding | Current verified position |
|---|---|---|
| Export map | At IPD `4d3e1cd…` on 2026-10-13, `package.json` had no `exports` or `main`. This was true at that historical ref but is stale as a current statement. | At `e9c2eef6…`, `package.json` blob `51796e63280c1abb368c27bf8811cc6bad46e132` has `exports` for exactly `./portfolio-ui`, `./pit`, `./d114-non-production`. `main`, `module` and top-level `types` are unset. Operator Drop has no export subpath. |
| Published build | No export map at the historical ref. | Clean exported-source package builds emit no `dist/package/src/operator_drop`. A dry-run pack contains 121 entries and zero Operator Drop entries. The root `src/index.ts` barrel is not an export-map admission. |
| Identifier | The tracker cited a nonexistent record-type symbol for the drop path. | Parser blob `c9950cd08f9cf9acc0b7e6a44789e76c57b1c971` reads `record.companyId` at line 95 and passes it at line 99. No series-qualified ISIN resolution exists in `operator_drop`. The original technical conclusion is retained. |

The substantive REG-06 decision is unchanged. The correction strengthens its evidence; it does not convert implementation presence into admission.

## 4. E018 / E026 and admission prerequisites

- **E018:** current manifest/export/build inspection confirms an export map exists, excludes Operator Drop, and the published build does not emit it.
- **E026:** current source inspection confirms the root barrel and internal OQ synthetic-failover harness (`synthetic_failover.ts`, called by `oq_suite_runner.ts`) only. There is no product runtime caller or product end-to-end qualification.
- **PIT write integration:** absent; the drop path returns envelopes/reports and does not integrate a PIT write path.
- **Series-qualified ISIN resolution:** absent; the implemented identifier is `record.companyId`.
- **Explicit package-export admission:** absent.
- **Product callers and end-to-end qualification:** absent; internal primitive tests are not product qualification.
- **Approved manual-ingestion requirement / express admission act:** not found in the authoritative evidence. The non-production identity-bypass record is not a product requirement or admission.

Precision note on the IRR consumer census: at the IRR investigation baseline there were zero executable `.ts`/`.tsx`/`.js`/`.mjs` Operator Drop consumers. Three JSON evidence/inventory files mention the term; they are documentation/evidence, not runtime consumers. This does not change E026's conclusion.

## 5. Register and matrix treatment

The living 51×17 bundle remains 51 rows × 17 columns. Row 29 now records the assessment as **RESOLVED — CONTINUED DEFERRAL**, while its product acceptance/admission dimension remains **DEFERRED**. Its anchor names the actual IPD merge, PR #115 and tracker blob, `record.companyId`, and the export/build exclusion.

The register retains 40 entries, now explicitly including one **resolved governance deferral**. It is not a claim of 40 active implementation tasks. P-08's row states:

- no active correction or implementation action;
- future product requirement/admission owner: **PA**;
- subsequently authorized implementation owner: **IPD**;
- future promotion requires an approved requirement, explicit PA act, PIT writes, series-qualified ISIN resolution, explicit export admission, product callers/E2E qualification and separate acceptance.

The original baseline and pre-correction P-08/row-29 values are preserved in Git history and `raw/pre-correction-state.json`. Other historical reassessment pins and unrelated pending items are not rewritten. `CV-39` remains distinct: REG-06 governs Operator Drop, not broker/Dhan ingestion.

## 6. Validation and publication

Validation is documentation/evidence-specific: workbook/CSV round-trip and P-08 assertions, checksum verification, reference consistency, Python compilation, the existing IRR-only static validator and `git diff --check`. IPD package-consumer and typecheck were also run from a clean exported snapshot of the verified merge; the IPD checkout remained clean. No frontend product source changed, so frontend CI is not applicable to the correction itself. Hosted IRR static checks apply because the authoritative tracker changed.

Evidence: `evidence/integration/p08-reg06-irr-reconciliation-2026-11-01/`. Published: IRR PR #410 merged `2026-11-01T09:46:19Z` as `e7473d5200ec690bc0b317ba75eaf5b2e3e62697`. Exact-head static run `41290160356` and post-merge run `41290247669` passed. Eight decisive artifacts were independently read back from remote main and byte-matched; full coordinates/hashes are in `evidence/integration/p08-reg06-irr-reconciliation-2026-11-01/publication-readback.json`. IPD main remained unchanged.

**Allocation boundary:** unrelated IRR PR #409 merged during this pass as `c9e725f66b1cb15b3059bf3f5f5041be56d80270`, consuming §16.237/CV-CORR-217/V1881–V1887. That authoritative-main section is preserved intact. This correction consumes §16.238/CV-CORR-218/V1888–V1899. Next free: §16.239/CV-CORR-219/CHG-2026-11-01-18/V1900.
