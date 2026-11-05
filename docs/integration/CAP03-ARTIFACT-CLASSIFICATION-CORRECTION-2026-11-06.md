# CAP-03 artifact classification correction and receipt closure — 2026-11-06

## Reproduction and scope

Starting authoritative remote main: `a9329dd509be8051f82780059646c0f179d42b74` (#462).
PR #463 exact head `60fcd4d04cfda084a5d150e2fab3ce747d7850c3` was OPEN/UNSTABLE;
static run 42094336586 failed at source/evidence/tracker validation. Local reproduction with full
history failed with exactly:

`PR adds P-1-named paths missing from the freshness allowlist: evidence/iid/IID-1-IDENTITY-COVERAGE-2026-11-05/test-log-np12-regression.txt`

The existing IID-1 README explicitly records this file as the 42/42 TAP transcript for
`tests/regression/np12-sector-reference-population.test.ts`. Its location, content and authoritative
artifact inventory identify IID-1/NP12, not P-1. No existing evidence file is renamed, moved or edited.

## Narrow correction

Only the validator's artifact classification predicate changes. It recognizes delimited P1/P1F
identity or namespace tokens anywhere in the full repository-relative location, plus the established
PascalCase `DirectP1Integration` convention. It does not treat the P1 substring inside NP12, NP1 or
WP1 family identities as P-1. P11-style legacy matches remain strict. Other historical identity aliases
(P-1, GATE_A_PRIME, PF15, PA_RULING) are unchanged. A P1 namespace still classifies all its children,
even when the basename is `test-log-np12-regression.txt`.

Classification is not admission: the exact existing runtime freshness allowlist and separately
required/disjoint Direct P1 artifact gates are untouched. Unknown/misplaced P-1 paths are still
rejected. No runtime allowlist, PowerShell script, frozen authority, journal/tool, PF-1, W-1 or IPD
change. Existing CAP-03 requirements remain enforced by the full unchanged validation body.

Seven standard-library regression tests cover exact provenance/filename, unrelated names/locations,
genuine identity families, misplaced/unknown artifacts, execution of the actual admission rejection
AST, historical comparison (only the reported IID-1 path changes classification among paths examined
by the existing validator), and retention of existing gates. The existing CAP-03 static workflow now
runs these tests before full validation and triggers on their test file. No check is disabled or
relaxed. Product code did not change; the prior 1,512-test deletion regression is not repeated.

Local evidence: `evidence/integration/cap03-classifier-closure-2026-11-06/tests.txt` (7 PASS),
`static.txt` (full validator PASS). Python compilation and whitespace checks PASS.

## Publication sequence

Dedicated correction PR from fixed session branch `arena/fb319972-iips-review-recovered`, based on
current main. Merge only after applicable static CI succeeds, then independent API blob readback.
Next, update existing #463 with corrected main using GitHub's safe update-branch operation with its
expected head; no local checkout/push to its historical branch, no receipt changes to bypass CI.
Re-run applicable checks, merge #463 only on success, and independently verify its original receipt
and tracker additions. Later additive reconciliation will supersede historical blocker wording,
without erasing the original blocked-state record or repeating PA adoption.
