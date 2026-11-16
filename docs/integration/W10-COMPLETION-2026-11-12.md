# W10 completion — issuer-to-engine mapping and qualification (2026-11-12)

**Status: COMPLETE.** The field-level mapping matrix for all thirteen certified sector engines and the integrated issuer-to-engine qualification capability are implemented, tested and published. This record states exactly what was verified, on which commit, with which exit codes and counts. It supersedes the INCOMPLETE status in `W10-HANDOFF-2026-11-12.md`; the handoff's constraints and investigation notes remain binding and are preserved there.

## What W10 delivered

| Artefact | Path | Purpose |
|---|---|---|
| Mapping registry | `iips-platform/src/investment/qualification/mapping.ts` | One record per declared engine input (192 across 13 engines): meaning, authorized source, mapping status, transformation, period, basis, scope, units/currency/scaling, missing/zero/invalid semantics, freshness, data quality, confidence and calibration implication; seven declared derivations; engine metadata mirrored from `CERTIFIED_ENGINES`. |
| Qualification contracts | `…/qualification/types.ts` | Closed vocabularies (mapping status, requirement, field outcome, 30 qualification codes with severities, 7 derivation ids), evidence/qualification/report/request types and the qualification policy. |
| Evidence handling | `…/qualification/evidence.ts` | Observation snapshots, freshness arithmetic and numeric guards. |
| Resolution | `…/qualification/resolve.ts` | Field resolution for operating metrics, sector selectors and declared derivations; freshness, scope, period, validation, unit, range, source-class, imputation, nil, ambiguity and cross-field checks; W07 capital-structure consumption. |
| Evaluation | `…/qualification/qualify.ts` | `qualifyIssuerToEngines`: all thirteen engines per issuer, requirement aggregation, cross-field failure propagation, engine state, summary, mapping digest, limitations. |
| Documentation renderer | `…/qualification/render.ts` + `iips-platform/scripts/generate-w10-mapping-doc.ts` | Deterministic generation of the published matrix from the executing registry. |
| Published matrix | `docs/integration/W10-ISSUER-TO-ENGINE-MAPPING-2026-11-12.md` | Status COMPLETE; generated matrix pinned byte-for-byte by the suite. |
| W10 suite | `iips-platform/tests/investment/w10IssuerEngineMapping.test.ts`, `w10IssuerEngineQualification.test.ts`, `w10Fixtures.ts` | 50 tests over contracts, dispositions, failure modes and documentation freshness. |

All code is additive and lives under `iips-platform/src/investment/qualification` and `iips-platform/tests/investment`. Nothing under `iips-platform/src/sector-engines` or `iips-platform/src/integration` was modified, and the A13 protected-surface guard in `tests/regression/np12-n4-screen-producer.test.ts` passes unchanged (678/678).

## Field-level determination

13 engines · 192 declared inputs · 115 required · 31 mapped · 31 derived · 112 unmapped · 18 conflict. Of the 115 required inputs, 53 have an authorized source and 62 do not. Only Banking has no structural blocker in the registry.

That asymmetry is the substantive W10 finding, and it is published rather than worked around: twelve of the thirteen frozen engines declare required inputs that no governed IID contract can supply — because the quantity is not in the dataset at all, because the canonical metric is declared but never read, or because the frozen path applies an undeclared transform (a doubling, an inversion, a hard-coded USD level, a band scale) that the canonical quantity does not carry. Mapping those inputs from a superficially similar field would have silently changed an engine's output, so they are published as `UNMAPPED` or `CONFLICT` and the qualification fails closed on them.

Consequences for qualification, verified in the suite:

- A fully evidenced banking issuer qualifies **only** when the caller explicitly enables the declared closing-balance ROA/ROE deviation (`BM-001`, `BM-002`). Under the default policy those two inputs refuse with `FIELD_DERIVATION_NOT_PERMITTED` and the engine is `NOT_QUALIFIED`. No other engine is qualifiable today, because each has at least one structurally blocked required input; the suite proves this for all twelve by attempting qualification and asserting refusal.
- Nothing in the qualification produces a score, verdict, rank, target price or recommendation, and no engine is executed. The suite asserts the serialized report contains none of those keys.

## Failure modes covered by the suite

Absent metric; unvalidated metric; contested (`CONFLICT`) metric validation; unit mismatch; out-of-range value; wrong statement scope; wrong period; nil-by-disclosure (never zero); imputed observation; stale statement with the frozen window quoted (200/250 days); no consolidated period; cross-field contradictions (NNPA > GNPA, CET1 > CAR); blocked derivation (missing input, zero denominator, negative base); cross-year leverage substitution refused; selector outside the engine vocabulary; unmapped required input; declared conflict; decision-flag absence; declared-but-unread input; sector mismatch; request validation (unknown issuer, malformed `asOf`, unknown engine id, unevidenced pinned period); determinism and ordering independence; frozen report; minimal caller-supplied profile.

W07 interplay is asserted, not assumed: the leverage input consumes the W07 `capital-structure/1.0.0` gross-debt aggregate, never substitutes net debt, and refuses the multiple when the debt instant is not the pinned period — which is exactly what W07's fallback to the last reporting year would otherwise produce. The unresolved Marico `PREFERENCE_CAPITAL` (`L-038`) and KEC `CURRENT_INVESTMENTS` (`L-039`) remain unresolved and unvalued; neither is mapped to any engine input, and neither becomes a zero.

## Verification record

Run on this branch after the implementation, with the W10 changes present in the working tree. Exit codes are the process exit codes (not `tail`-masked).

| # | Command | Working directory | Exit code | Result |
|---|---|---|---:|---|
| 1 | `npm run typecheck` | `iips-platform` | 0 | clean |
| 2 | `npm test` | `iips-platform` | 0 | 678 tests, 678 pass, 0 fail, 0 skipped |
| 3 | `npm run test:iid` | `iips-platform` | 0 | 882 tests, 882 pass, 0 fail, 0 skipped (832 pre-W10 + 50 W10) |
| 4 | `npx tsx --test tests/investment/w10IssuerEngineMapping.test.ts tests/investment/w10IssuerEngineQualification.test.ts` | `iips-platform` | 0 | 50 tests, 50 pass, 0 fail |
| 5 | `npx tsx --test tests/investment/w07FinancialLimitationResolution.test.ts` | `iips-platform` | 0 | 9 tests, 9 pass, 0 fail |
| 6 | `npm run typecheck` | `frontend` | 0 | clean |
| 7 | `npm run typecheck:investment-server` | `frontend` | 0 | clean |
| 8 | `npm run typecheck:replay-server` | `frontend` | 0 | clean |
| 9 | `npm test` | `frontend` | 0 | 2,827 tests pass, 1 skipped (2,828 across 200 files; 199 passed, 1 skipped) |
| 10 | `npm run build` | `frontend` | 0 | build succeeds (pre-existing chunk-size warning only) |

Pre-W10 baselines were re-confirmed before implementation in this session: platform typecheck 0, platform tests 678/678, IID tests 832/832, W07 9/9. The `npm test` count is unchanged because the W10 suite lives under `tests/investment` and runs under `test:iid`; W10 adds 50 tests there (832 → 882).

Environment note: the shallow checkout needed `git fetch origin 5ca181c7564a063a01265efdfdc5996563888d49 --depth=1` for the A13 guard's historical baseline object; without it, 30 A13 tests fail with an ambiguous-revision error. This is an artefact of the shallow clone, not a W10 regression.

The frontend test run rewrote the two tracked fixtures `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/zero-socket-control.json` and `zero-socket-test.json`. Those generated local changes are excluded from the W10 commit; they were not used as evidence anywhere in this work.

## What this does not claim

- No issuer has been "approved", rated or recommended. Qualification is readiness of inputs only.
- No calibration or scoring defect inside a frozen engine was fixed, and none was worked around silently. Where a band table is inconsistent or a field is reused from the wrong table, the fact is recorded on the field and the input is refused only where it cannot be evidenced.
- The 62 structurally blocked required inputs are a methodology backlog for their owners, not an authorization to map them later without a decision.
- W05, W07 and the frozen sector methodology remain exactly as they were; their records and safeguards are untouched.
