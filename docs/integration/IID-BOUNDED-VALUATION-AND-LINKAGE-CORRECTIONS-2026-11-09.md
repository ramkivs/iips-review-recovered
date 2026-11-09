# IID — Bounded Valuation Contract and Disposition Linkage Corrections

**Date:** 2026-11-09
**Repository:** `ramkivs/iips-review-recovered` (IRR only)
**Baseline:** `30510080d95f5396eca6747b484019a4da1d9d1f` (authoritative remote `main`, re-fetched before execution)
**Source of the separated corrections:** draft PR #515, head `008dfe67d740e91c1691a6512e16af26c9e00104`
**Implementation branch:** `arena/1a3f1157-iips-review-recovered`

## 1. Purpose and explicit non-purpose

This record covers **only** the independent frontend/backend integration corrections that are separately verifiable and independently mergeable. It is a bounded correction record, not an IID-P02 acceptance record.

**Overall IID-P02 remains PARTIALLY COMPLETE.** Merging this bounded correction does not constitute IID-P02 completion or acceptance, and does not alter that programme status.

Draft PR #515 is preserved unchanged: it was not merged, closed, re-based, or converted from draft, and its history was not rewritten. All outstanding IID-P02 integration findings, dependencies and acceptance requirements remain in PR #515.

## 2. Corrections separated

| # | Correction | Files |
| :-- | :-- | :-- |
| 1 | Valuation response-contract alignment with the actual producer | `frontend/src/api/investment.ts` |
| 2 | Correct low/mid/high observation rendering, numeric sensitivity cells, and undefined-value guard | `frontend/src/features/investment/CompanyAssessmentPage.tsx` |
| 3 | Withheld valuation outputs stay withheld; diagnostic enterprise value is never presented as a per-share value (L-040) | `frontend/src/features/investment/CompanyAssessmentPage.tsx` |
| 4 | Disposition-to-assessment issuer/report linkage warning, plus accurate candidate-link copy | `frontend/src/features/investment/DispositionPanel.tsx`, `frontend/src/features/investment/CompanyAssessmentPage.tsx` |
| 5 | Malformed or unreadable successful portfolio list response fails closed instead of fabricating an empty list | `frontend/src/api/userPortfolios.ts` |

Supporting test/fixture changes, required by the corrections above:

- `frontend/src/features/investment/iid6Fixtures.ts` — assessment fixture expressed in the real producer contract
- `frontend/src/features/investment/CompanyAssessmentPage.test.tsx` — page fixture expressed in the real producer contract
- `frontend/src/features/investment/iid6CompanyAssessment.test.tsx` — valuation rendering and withheld-grid suppression tests
- `frontend/src/features/investment/iid6Disposition.test.tsx` — linkage warning tests (report mismatch, issuer mismatch, no false warning)
- `frontend/src/features/user-portfolios/UserPortfolioList.test.tsx` — malformed and unreadable envelope tests

Total: **9 files**, all within `frontend/src`. The extracted diff is byte-identical to the corresponding subset of PR #515 (verified by diff comparison), so no editorial drift and no duplicated functionality was introduced.

## 3. Producer/consumer contract compatibility

The corrected client read model was checked against the authoritative producer types in `iips-platform/src/investment/assessment/types.ts`:

| Producer declaration | Corrected client declaration | Previous (incorrect) client declaration |
| :-- | :-- | :-- |
| `MethodOutput` = `perShareLow`, `perShareMid`, `perShareHigh` (`NumericObservation`) + `basis` | same | `output: { perShare: number \| null }` — field does not exist in the producer |
| `SensitivityPoint.value: number \| null` | same | `value: NumericObservationView` |
| `SensitivityPoint.enterpriseValue?: number \| null`, published only on a withheld grid | same (declared, never rendered as a per-share value) | absent |
| `SensitivityWithheld` = `presence`, `reason`, `note` | `withheld?: { presence, reason, note }` | absent |

The previous shape was a genuine defect, not a cosmetic mismatch: `numeric()` received a bare number where an observation object was declared and threw on real payloads. The producer emits `value` explicitly at every cell (`iips-platform/src/investment/assessment/intrinsic.ts`), so the corrected rendering path matches actual output.

## 4. Preserved boundaries

- **L-040 zero substitution:** a withheld grid renders `not available — withheld — <reason>` at every cell, names the blocking reason and component in the caption, and never renders the diagnostic enterprise value. A test asserts both the suppressed per-share number and the suppressed enterprise value are absent from the DOM.
- **Missing-value semantics:** a missing number is still `not available — <reason>`, never `0`, never blank.
- **Read-only surfaces:** the linkage warning compares the displayed issuer and cited `reportId` and renders an alert. It creates, infers, selects or writes no disposition, and does not change which assessment version is read.
- **Fail-closed portfolio reads:** an invalid or unreadable HTTP 200 list envelope now raises an error rendered as an error state, instead of silently presenting "no durable portfolios". The route remains read-only; no create/write control was added.
- No change to write admission, ownership provisioning, W-1 predicates, fences, persistence, schema, routes, dependencies, lockfiles, workflows, or IPD.

## 5. Deliberately excluded — retained in PR #515

These were **not** separated, because they belong to the unresolved IID-P02 findings and acceptance work:

- `frontend/src/features/investment/InvestmentCoveragePage.tsx` and `frontend/src/features/investment/iid6Coverage.test.tsx` — identity/coverage failure copy tied to the open identity-source findings.
- `docs/integration/IIPS_V3_IID_P02_INTEGRATION_VERIFICATION_2026-11-08.md` — the IID-P02 integration matrix, dependencies and acceptance blockers.
- `evidence/iid/IID-P02-IDENTITY-OWNERSHIP-2026-11-08/` (`README.md`, `assessment-check.mjs`, `browser-check.mjs`) — identity, ownership and end-to-end browser probe evidence.

Separation was verified to be dependency-free: `iid6Coverage.test.tsx` imports only `COVERAGE_REPORT`, `ISSUER` and `SECURITY` from the shared fixture module, not the assessment envelope, so the valuation fixture correction does not require the coverage change. The unchanged coverage suite passes.

**Still OPEN, unchanged by this record:** identity source provisioning, portfolio creation admission, runtime ownership provisioning (IPD active A-2 binding, live IPC, F-3 owner carrier), and the complete real-issuer end-to-end holding → assessment → disposition → history journey.

## 6. Verification performed

| Check | Result |
| :-- | :-- |
| Targeted suites (valuation, withheld, linkage, portfolio envelope, coverage, routes, clients, timeline, portfolio integration) | **10 files, 119 passed** |
| Producer-side safeguards: L-040 zero substitution, valuation integrity, valuation, L-038 alignment/completeness, L-039 | **109 passed, 0 failed** |
| `npm run typecheck` | PASS |
| `npm run typecheck:replay-server` | PASS |
| `npm run typecheck:investment-server` | PASS |
| Full frontend suite `npm run test:ci` | **1966 passed, 1 pre-existing skip, 0 failed** (149 files) |
| Zero-test / false-green guard | PASS |
| `npm run build` (production) | PASS (pre-existing chunk-size warning only) |

The full-suite delta against the baseline is exactly **+7 tests**, matching the seven tests added here (2 valuation, 3 linkage, 2 portfolio envelope). No unrelated test changed. Test-generated zero-socket evidence artifacts were reverted and are not part of this change.

The producer-side safeguard run used the existing `tsx` binary; no dependency was installed into `iips-platform` and no platform file was modified.

## 7. Status

| Dimension | Status |
| :-- | :-- |
| Bounded corrections in this record | Implemented and independently verified |
| Draft PR #515 | **OPEN / DRAFT — unchanged**, findings and acceptance requirements retained |
| Overall IID-P02 | **PARTIALLY COMPLETE** — unchanged |
| Identity / portfolio creation / ownership provisioning / complete E2E | **OPEN** |
| Production acceptance | None implied |