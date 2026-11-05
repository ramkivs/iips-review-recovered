# IID-4 — how the carried-forward limitations bear on dispositions

This is not a restatement of the register. It records what each carried-forward entry means **for a disposition**, and
it states `L-014`'s impact in full, because that entry constrains what IID-5 may do next.

The register itself (`docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md`) keeps `L-001` …
`L-016` untouched and adds `L-017` … `L-027`. Nothing below changes a status.

## Carry-forward, entry by entry

| Entry | Effect on a disposition | Enforced where |
|---|---|---|
| `L-001` (3 of 13 sectors measured) | a subject in an unmeasured sector gets no sector reference; its sector exposure is computed from holdings whose sectors are known, and the block says how much weight that covers | `sectorMeasuredWeightPct` + `notes` (`portfolioContext.ts`) |
| `L-002` (20 XBRL tags) | the assessment may be `PARTIAL` for a compliant filer, which removes ACCUMULATE and INITIATE entirely | G-3 + the verb selector |
| `L-003` (8 derivations) | a missing derived ratio can withhold a method, which withholds the valuation, which withholds the verb (`valuation_unavailable`) | G-4, `no_verb_conditions_met` |
| `L-004` (synthetic data) | `datasetClass` travels in the assessment ref, in disposition provenance and on every response | `dispositionComposition.ts`, transport disclosures |
| `L-005` / `L-006` (withheld dividend inputs) | a withheld dividend verdict is `INSUFFICIENT_EVIDENCE` and contributes no dividend rationale direction; it is never read as "no dividend" | `rationale.ts` (dividend entry) |
| `L-007` / `L-008` (dilution proxy, no SOTP) | the valuation that the MoS rests on is the engine's, with its own limitations; the disposition inherits them by referencing the assessment, not by restating it | `companyAssessmentRef` |
| `L-009` (no real issuer) | **no real company has been dispositioned.** Every demonstration is `SYNTHETIC_REFERENCE` | demonstration record, transport disclosures |
| `L-010` (bounded head scan) | locating an `hd:`/`hc:` chain is a bounded scan; hitting the bound fails closed | inherited from `investmentArtifacts.ts` |
| `L-011` (two namespaces) | the payload's `subjectScope` (`hdp:`/`hcp:`) is a LABEL; the chain scope is `hd:`/`hc:`. They are deliberately different strings and the tests assert it | `subject.ts`, `disposition-subject.test.ts` |
| `L-012` (no `chainId`) | the chain root `reportId` is the surrogate identifier for a disposition chain too | inherited |
| `L-013` (head-only idempotency) | re-recording a disposition differs from the HEAD, never from an older version | `disposition-records.test.ts` |
| `L-014` (clock inside content identity) | see below | `dispositionComposition.ts`, `disposition-records.test.ts` |
| `L-015` (duplicate heads refused) | two `hd:` heads for one position are refused rather than merged — the position becomes unreadable until repaired, as with assessments | inherited |
| `L-016` (pin prose drift) | no pin was changed by IID-4; the disposition surface resolves the same boundary the assessment surface does | unchanged dependency declarations |

## `L-014` in full, for dispositions

**What happens.** A disposition payload contains `artifact.generatedAt`. `payloadDigest` is SHA-256 over the stored
canonical payload, so a re-run at a **new clock** produces a different payload digest, and the records service appends
a new version in the same chain. That is the `L-014` consequence, inherited, not introduced.

**What IID-4 added, and what it did not.** The disposition **input digest** is computed over the engine's input
members and deliberately **excludes the clock**. So a clock-only re-run is visible as the pair:

```
outcome = APPENDED
head.inputDigest == previous.inputDigest     (the inputs did not change)
head.payloadDigest != previous.payloadDigest (the generation metadata did)
```

That pair is asserted by a test ("a re-run at a new clock is a new version whose recorded input digest did not
change"). It is a **disclosure, not a resolution**: the history still grows, and `INPUT_CHANGED_CONTENT_IDENTICAL`
still occurs only when inputs change and content does not.

**What was deliberately not done.** `payloadDigest` was not narrowed to exclude `generatedAt`. The digest must remain
recomputable from the stored bytes alone — that is what makes a post-hoc store edit detectable, and it is the property
`investment-artifacts.test.ts` tamper tests rely on. Narrowing it would trade a real integrity guarantee for a
smaller history.

**What must happen before IID-5.** IID-5 compares successive versions and reports what changed. If a scheduled
refresh appends a version whose only difference is its timestamp, IID-5's change report must either (a) not treat it
as change, or (b) label it as a generation-metadata-only version. That requires an explicit decision — a second
content digest excluding generation metadata, or an operator decision that refreshes are versions — recorded before
IID-5's scheduled-refresh and historical-comparison work starts. IID-4 could proceed under `L-014` unchanged, and
says so rather than quietly working around it.

## IID-4's own new entries, in one line each

`L-017` context is a snapshot, not a risk model · `L-018` unresolved holdings understate exposures · `L-019` the
default caps are placeholders · `L-020` non-equity and unresolvable subjects get no verb · `L-021` thin evidence gets
no conclusion · `L-022` sector exposure depends on a sector reference · `L-023` a citation is resolved or refused ·
`L-024` hysteresis can hold a verb briefly · `L-025` no history beyond the chain · `L-026` the IID-3 chain constraints
apply unchanged · `L-027` no diversification band or correlation.

## What was never done to a limitation

No entry was closed. No status was improved. No number was moved. No description was softened. In particular `L-004`
and `L-009` were **enforced more visibly**, not resolved: synthetic stays labelled, and no real issuer was assessed.
