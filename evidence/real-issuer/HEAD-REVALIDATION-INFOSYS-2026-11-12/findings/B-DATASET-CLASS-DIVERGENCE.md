# Defect B — two dataset classifiers disagree on the same committed real-issuer manifests

**Status:** OPEN — recorded as **`L-041`**, deliberately **not** corrected inside this validation work item.
**Found by:** classifying every committed real-issuer manifest two ways — through the assessment path and through
the investment-coverage read model — and comparing. Machine-readable evidence: `verification/dataset-class-divergence.json`.

## The disagreement

Three committed manifests for this issuer (`REL-1-INFOSYS-2026-11-06`, `WI2-PRICE-OBSERVATION-2026-11-06`,
`WI3-BORROWINGS-NIL-2026-11-06`) were all written before the `sourceRights` field existed, so their rights
evidence is genuinely absent (`sourceRightsDeclared: false`). The two code paths classify them differently:

| Path | File | Rule | Answer for these manifests |
|---|---|---|---|
| Assessment | `iips-platform/src/investment/fundamentals/datasetClass.ts` → `classifyDataset` | the **declared rights evidence**, fail-closed | `UNKNOWN` |
| Investment coverage | `iips-platform/src/investment/coverage/investmentCoverage.ts` → `financialClass()` | a **substring test** on `manifest.provider` and `manifest.licence` | `OPERATOR_SUPPLIED` |

The assessment path is the correct one: absent rights evidence, it refuses to assert a class and says `UNKNOWN`.
The coverage path infers `OPERATOR_SUPPLIED` from the mere fact that the provider/licence strings do not contain
`synthetic`/`fixture` — it has no fail-closed `UNKNOWN` answer at all.

## Why this is a defect, and why it is the coverage path that is wrong

`datasetClass.ts` (commit `a54591e`, 2026-11-10) **documents that exact substring test under a heading "WHAT WAS
WRONG" and removes it**, replacing it with the rights-evidence rule and deleting `APPROVED_LOCAL_INGESTION` as a
name for an approval no review ever produced. `investmentCoverage.ts` was last touched by `8603138`
(2026-11-10) — **after** `a54591e` — and reintroduces the repudiated substring test on the read side. So the
product now contains, side by side, a rule and the rule that rule was written to replace.

The consequence is reader-visible: the assessment surface says a dataset of unknown rights is `UNKNOWN`, while the
coverage surface says the same dataset is `OPERATOR_SUPPLIED` — a stronger claim than the evidence supports, and
exactly the claim `datasetClass.ts` was changed to stop making.

## Why it was NOT corrected here

This is a **contract decision**, not a narrow IRR correction:

- The coverage report's class vocabulary is `SYNTHETIC_FIXTURE | OPERATOR_SUPPLIED | NONE`, and `NONE` drives a
  "no dataset is installed" UI state (`InvestmentCoveragePage.tsx` `datasetAbsent`). There is no member that means
  "a manifest is present but its rights are unknown".
- A fail-closed answer therefore needs either a **fourth vocabulary member** (a new `datasetClass` value the read
  model, the transport and the page must all learn) or **routing the coverage path through `classifyDataset`** and
  mapping `UNKNOWN` onto the existing vocabulary without losing the fail-closed meaning.
- Both are changes to a published read-model contract that other surfaces consume. Choosing between them is the
  register owner's / read-model owner's call, and making it silently inside a validation work item is exactly what
  the work item's own constraints forbid.

So the divergence is **recorded and pinned, not fixed**. `rivHeadRevalidation.test.ts` asserts that all three
manifests still classify two different ways: if someone corrects one path without the other, or corrects both
without updating `L-041` deliberately, the test fails loudly rather than letting the change pass unnoticed.

## Relation to the register

Recorded as **`L-041`** in the append-only overlay (§17.x). No entry in `L-001`…`L-040` was modified, closed,
renumbered or reinterpreted. `L-041` is a new entry describing a live disagreement between two shipped rules.

## Reproduction

    cd frontend && npx vitest run server/investment/cli/rivHeadRevalidation.test.ts
    #   "L-041: the two dataset classifiers disagree on the committed real-issuer manifests" — 3 rows, agree=false
    # verification/dataset-class-divergence.json → rows[*].assessmentPathClass=UNKNOWN, coveragePathClass=OPERATOR_SUPPLIED
