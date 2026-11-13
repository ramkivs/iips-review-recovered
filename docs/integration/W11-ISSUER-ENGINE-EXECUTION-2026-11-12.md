# W11 — compatible issuer-engine execution (2026-11-12)

**Implementation: COMPLETE. Execution demonstrated: contract level (1 engine, synthetic-labelled dataset) and refused on actual evidence. W11 acceptance: NOT CLAIMED — blocked on actual portfolio evidence (W03/W09) and on W10 qualification coverage.**

This report is deliberately three separate claims rather than one. The adapter and its refusal semantics are implemented and tested. The only engine that can execute today is Banking, and only on evidence that qualifies it; on the actual issuer dataset in this repository the chain resolves identity, runs the qualification and **refuses to execute**. No persisted owner portfolio is reachable from this repository, so *actual portfolio-linked execution* is not demonstrated and is not claimed.

Nothing here is a score, a ranking, a recommendation or an issuer approval.

---

## 1. Repository and roadmap verification (before any edit)

| Check | Result |
|---|---|
| Remote HEAD of `main` (`ramkivs/iips-review-recovered`) | `a835d4af019ab4f677ab238ec42d44326f06a771` |
| W10 publication (PR #563 head) | `b367589b5b0338ea56095ee4f4ce6c3e38dedb69` — 5 commits, 43 files, `MERGEABLE`, checks `Typecheck · Test · Build` = success |
| Branch used for W11 | `arena/fdba9aed-iips-review-recovered`, fast-forwarded to the published W10 commit `b367589` (history preserved; no rebase, no rewrite) |
| Roadmap read | IPD `ramkivs/iips-production-market-data`, branch `arena/4b565ab3-iips-production-market-data`, `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` (read-only; IPD not modified) |
| W11 definition (roadmap §W11) | “request-input execution structurally exists; real portfolio linkage unverified. Execution: IRR engines/consumer. Deliverable: compatible adapters/execution only as necessary. Acceptance/evidence: actual issuer input lineage, bounded reproducible engine output, missing/partial refusal and unchanged frozen golden regressions. Blocker: W08–10.” |
| W10 implementation and matrix read | `iips-platform/src/investment/qualification/*`, `docs/integration/W10-ISSUER-TO-ENGINE-MAPPING-2026-11-12.md` |
| W08 / W09 implementations read | `iips-platform/src/investment/identity/*` (resolver, D114 projection, governed sources), `frontend/server/investment/holding-identity-transport.ts` (W08 bridge), `frontend/server/user-portfolio/userPortfolioPort.ts` + `userPortfolioContract.ts` (W09 revision-bearing read contract) |
| Existing execution path read | `iips-platform/src/integration/EngineApiAdapter.ts` (certified dispatch, deterministic runtime), `EngineRegistry.ts` (`CERTIFIED_ENGINES`) |

The working tree was reconciled to `b367589` before editing; `iips-platform/src/investment/coverage/investmentCoverage.ts` was restored from that commit (the local snapshot held the pre-W05 body). No W05–W10 behaviour was changed.

## 2. The chain, transition by transition

| Transition | Evidence used | Output and provenance | Status |
|---|---|---|---|
| Persisted portfolio → holding rows | `G2PortfolioView` (W09 contract): `portfolioId`, integer `revision`, `readSource`, `observedAt`, optional `ownerBindingRef`, holdings | Copied verbatim into the execution record; IRR never re-reads or re-stamps a revision | **Contract enforced; actual read unavailable** (IPD owns the store; no host access) |
| Holding → security identity | W08 governed resolver (`resolveIdentity`) against the roster/listing-map/corporate-action files; D114 `securityIdentity` validation | `securityId`, `listingId`, `resolutionBasis` (`ISIN`/`EXCHANGE_SYMBOL`), state and reason | **Demonstrated on actual evidence**: `INE009A01021` → `IN:ISIN:INE009A01021` → `IN:NSE:INFY:EQ:EQUITY`, issuer `IN:CIN:L85110KA1981PLC013115` (basis `ISIN`) |
| Security → issuer | Resolver output only. A name, a ticker or an IPD `companyId` is never an identity | Issuer id on every record | **Demonstrated (actual)** |
| Issuer → W10 qualification | `qualifyIssuerToEngines` at the pinned `asOf`, engine restricted to the issuer’s sector | `mappingDigest`, `qualificationDigest` (sha256 over the whole report), engine state, per-field outcomes | **Demonstrated (actual and contract)** |
| Qualification → engine input | Only fields whose outcome is `RESOLVED`; selectors included as strings; decision flags omitted and reported | `inputs`, per-field `inputLineage` (value, unit, transformation, period, scope, basis, presence, source ref, filing ref, source class), `omittedInputs` | **Demonstrated** |
| Input → frozen engine execution | The existing certified dispatch adapter (`EngineApiAdapter`), unmodified: fixed clock, deterministic id provider, isolated snapshot store, all 13 certified engines | `verdict`, `composite`, `snapshotRef`, `evidenceRef`, engine/calibration provenance | **Demonstrated (contract test); cannot be demonstrated on actual evidence — no actual issuer qualifies** |
| Output → reproducibility | `inputDigest` over engine identity + period + inputs; `requestId = w11-<24 hex>`; `outputDigest` over the engine output | Byte-identical repeated runs; same request id and same snapshot reference | **Demonstrated** |

## 3. What was implemented (only what was missing)

Additive module `iips-platform/src/investment/execution/` — outside every A13-protected path, importing the frozen registry and the certified adapter, modifying neither:

| File | Content |
|---|---|
| `types.ts` | `W11_EXECUTION_SCHEMA_VERSION`, 19-code closed refusal vocabulary, portfolio/revision evidence, holding evidence, input lineage, execution record, portfolio report, executor contract |
| `inputs.ts` | `datasetContentDigest`, `prepareEngineExecution`: engine selection by the issuer’s own sector, certification and applicability checks, W10 qualification, resolved-field input construction, input/qualification digests |
| `execute.ts` | `certifiedEngineExecutor` (wraps the certified dispatch adapter), `executeIssuerEngine`, `executePortfolioEngines`, report assembly, limitations |
| `index.ts` | Public surface |

Refusal codes: `EVALUATION_CLOCK_INVALID`, `PORTFOLIO_REVISION_INVALID`, `PORTFOLIO_REVISION_MISMATCH`, `PORTFOLIO_PROVENANCE_UNVERIFIED`, `PORTFOLIO_EMPTY`, `DATASET_DIGEST_MISMATCH`, `ISSUER_NOT_IN_DATASET`, `HOLDING_IDENTITY_UNRESOLVED`, `HOLDING_IDENTITY_AMBIGUOUS`, `HOLDING_IDENTITY_REJECTED`, `HOLDING_NOT_ASSESSABLE`, `SECURITY_NOT_IN_DATASET`, `SECURITY_ISSUER_MISMATCH`, `NO_ENGINE_FOR_SECTOR`, `ENGINE_NOT_CERTIFIED`, `ENGINE_NOT_APPLICABLE`, `QUALIFICATION_NOT_QUALIFIED`, `ENGINE_INPUT_UNAUTHORIZED`, `ENGINE_EXECUTION_FAILED`.

No engine, calibration, threshold, golden value, certified contract, W05/W07/W08/W09/W10 behaviour or IPD-owned contract was changed.

## 4. W11 acceptance tests (roadmap + task criteria)

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Actual portfolio-linked issuer input lineage preserved | **BLOCKED (actual)** / contract proven | No persisted owner portfolio is reachable; the lineage *shape* (revision, read source, observed time, holding index, security, issuer, digests) is proven on the contract test and on the actual identity/dataset chain |
| 2 | Qualified inputs reach only their compatible frozen engine | PASS | Sector-mismatch and uncertified-engine tests; only `sector.banking` executes for a Banking issuer |
| 3 | W10 mapping digest and qualification evidence traceable through execution | PASS | `mappingDigest`, `qualificationDigest`, per-field `inputLineage` on every record |
| 4 | Repeated execution with identical pinned inputs is deterministic | PASS | Two runs are byte-identical; same `requestId`, `snapshotRef`, `outputDigest` |
| 5 | Missing, partial, stale, conflicting, invalid inputs fail closed | PASS | Five dedicated tests; each asserts the refusal code and the exact field codes |
| 6 | Unqualified issuers cannot execute | PASS | Actual Infosys issuer refused (`QUALIFICATION_NOT_QUALIFIED`, 11 blocking fields); stub executor never invoked |
| 7 | Portfolio revision / source-version mismatch cannot silently pass | PASS | Non-integer/zero revision, pinned-revision mismatch, missing read source, bad observed time, dataset digest mismatch |
| 8 | Frozen-engine golden regressions unchanged | PASS | Platform `npm test` 678/678, including every sector acceptance/golden suite and the A13 guard; W11 output compared field-by-field with a direct certified-adapter call |
| 9 | W05/W07/W08/W09/W10 safeguards intact | PASS | W07 9/9; W05+W10+W11 85/85; frontend suite 2,827 pass + 1 skip (W05/W08/W09 consumer tests unchanged) |
| 10 | No score, recommendation or approval fabricated | PASS | Refusals carry no composite/verdict; serialised report contains no `recommendation`/`rank`/`approval`/`targetPrice`; output is attributed to the engine’s own provenance |

## 5. Dependency status

| Dependency | Status | Consequence for W11 |
|---|---|---|
| W08 exact security→issuer bridge | Implemented and used; actual ISIN resolution works on the repository’s real identity files | Not a blocker for identity *mechanics*; actual coverage of a live portfolio depends on W04 |
| W09 revision-aware portfolio consumer | Contract used verbatim (revision + read source + observation time are mandatory); **revision-consistent integrated actual consumption remains unproven** (roadmap W09 blocker: W02/W03) | Blocks acceptance criterion 1 |
| W10 issuer-to-engine mapping/qualification | Complete; **53 of 115 required inputs authorised, 62 not**; only Banking is structurally qualifiable, and only with its declared closing-balance ROA/ROE deviation explicitly enabled | Blocks execution for 12 of 13 engines by design; blocks actual execution even for Banking because no actual banking dataset with the six canonical metrics exists here |

## 6. Exact blocked acceptance conditions (not worked around)

1. **Actual portfolio revision evidence (owner: IPD portfolio domain; consumer: IRR).** W11 needs a `G2PortfolioView` read — with its real revision, read source and observation time — for an owner-scoped portfolio. IRR stores no portfolio and must not provision one; the IPC path requires a live IPD stack and an established owner binding, neither available in this environment. *Remaining action:* an operator read of a real portfolio revision through the governed G2 contract (W03/W09 evidence).
2. **Actual identity coverage for that revision's securities (owner: IPD identity / IRR resolver; W04).** The repository's identity files cover one real issuer; a live portfolio's securities would need roster/listing/corporate-action coverage for the same revision.
3. **Qualified financial evidence for at least one issuer (owner: IRR data + methodology owners; W05/W07/W10).** The only actual issuer dataset in the repository (Infosys, `IIPS_INVESTMENT_FUNDAMENTALS_V1`, FY2022–FY2024) fails qualification structurally: 7 required inputs have no authorised source (`archetype`, `evRevenue`, `fcfYield`, `grossMargin`, `rdIntensity`, `customerConcentration`, `usageGrowth`), the Technology subsegment selector does not resolve from the issuer classification, and 2 canonical metrics are absent. At a current evaluation date its statements are also stale. *Remaining action:* either authorise sources for the 62 unmapped/conflicting inputs (a methodology decision, not a W11 integration task) or supply an actual Banking-sector dataset carrying `BM_NIM`, `BM_CASA`, `BM_GNPA`, `BM_NNPA`, `BM_CET1`, `BM_CAR` plus fresh consolidated statements — the only engine W10 can currently qualify.
4. **Payment/valuation semantics are out of scope (W12/W13).** W11 executes engines; it does not value positions or aggregate portfolios, so no monetary claim is made.

None of these may be satisfied by synthetic fixtures, frozen reference values, name/ticker inference or by relaxing W10. The W10 finding that 62 required inputs lack authorised sources is preserved intact.

## 7. Verification record (this branch, with the W11 files present)

| # | Command | Directory | Exit | Result |
|---|---|---|---:|---|
| 1 | `npm run typecheck` | `iips-platform` | 0 | clean |
| 2 | `npm test` | `iips-platform` | 0 | 678 tests, 678 pass, 0 fail, 0 skipped (includes all sector golden/acceptance regressions and the A13 guard) |
| 3 | `npm run test:iid` | `iips-platform` | 0 | 913 tests, 913 pass, 0 fail (882 pre-W11 + 31 W11) |
| 4 | `npx tsx --test tests/investment/w11IssuerEngineExecution.test.ts` | `iips-platform` | 0 | 31 tests, 31 pass, 0 fail |
| 5 | `npx tsx --test tests/investment/w05CoverageSourceRights.test.ts tests/investment/w10IssuerEngineMapping.test.ts tests/investment/w10IssuerEngineQualification.test.ts tests/investment/w11IssuerEngineExecution.test.ts` | `iips-platform` | 0 | 85 tests, 85 pass, 0 fail |
| 6 | `npx tsx --test tests/investment/w07FinancialLimitationResolution.test.ts` | `iips-platform` | 0 | 9 tests, 9 pass, 0 fail |
| 7 | `npm run typecheck` | `frontend` | 0 | clean |
| 8 | `npm run typecheck:investment-server` | `frontend` | 0 | clean |
| 9 | `npm run typecheck:replay-server` | `frontend` | 0 | clean |
| 10 | `npm test` | `frontend` | 0 | 2,827 pass, 1 skipped (2,828 tests, 200 files: 199 passed, 1 skipped) |
| 11 | `npm run build` | `frontend` | 0 | build succeeds (pre-existing chunk-size warning only) |

Environment notes: the shallow checkout required `git fetch origin 5ca181c7564a063a01265efdfdc5996563888d49 --depth=1` for the A13 guard's historical baseline object (without it, 30 A13 tests fail with an ambiguous-revision error — a clone artefact, not a regression). Frontend `npm ci` required `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt`, as recorded in the W10 handoff. The frontend test run again rewrote the two tracked `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/zero-socket-*.json` fixtures; those local mutations are excluded from the W11 commit.

## 8. What is not claimed

- **Not** that any issuer has been executed on a real portfolio.
- **Not** that any engine is "ready" for an issuer: qualification is readiness of inputs, and only Banking can reach it today.
- **Not** a score, ranking, recommendation, valuation or issuer approval, and not a replacement for W12/W13.
- **Not** that the frozen engines were re-certified. The certified dispatch path is reused unchanged; historical v1.2 certification is not transferred to arbitrary data.
- **Not** that IPD was modified. It is read-only in this work item; any IPD-side defect found is recorded as IPD-owned (none was demonstrated here — the limitation is absence of a reachable persisted portfolio, not an IPD defect).

**Next roadmap step:** W12/W13 remain blocked by W06/W08–09 as recorded in the roadmap; W11's own closure requires the three evidence items in §6, after which this adapter executes without modification.
