# NP-18 — PA-authorized isolated main integration

| Field | Decision |
|---|---|
| Record | `NP-18-ISOLATED-MAIN-MERGE-AUTHORIZATION-2026-10-16` |
| Date / class | 2026-10-16; explicit PA authorization for one isolated NP-18 integration and its post-merge reconciliation |
| Authority holder | Ramki, Program Authority |
| Recorder | Arena records the user's explicit instruction; no independent agent authority, signature, or personally spoken option is claimed |
| Status | **AUTHORIZED FOR THE BOUNDED NP-18-ONLY PR AND MERGE AFTER ITS EXACT-HEAD CHECKS PASS**; no whole-PR #114 merge |
| Target | `ramkivs/iips-review-recovered`, `refs/heads/main@98c21768f77061a68470e4b4f6750d38abeec594` at authorization verification |
| Existing qualified implementation | `3c64d69c148d01081b2ba9b8f76fa58c21ed2b99` |
| Approved source patch | `904f5d99f9e6468fb4805c96a78c16c70a08395e` → `3c64d69c148d01081b2ba9b8f76fa58c21ed2b99`; SHA-256 `67719c4b44218b42d3fc9d3290e1d657d01e9945b25e59fb54588e7f2b91522f` |
| Execution ref | Fixed Arena session branch `arena/f83d4f83-iips-review-recovered`; publish through an NP-18-only PR from that ref |
| PR #114 | Remains open and unchanged for the independently bounded broker-preview work |

## 1. Explicit PA authorization and effect

The current user instruction, issued by Ramki in the capacity of Program Authority, expressly states:

> “Ramki, acting as Program Authority (PA), authorizes Arena to isolate the approved NP-18 increment, publish an NP-18-only PR, satisfy its required checks, merge that bounded increment into authoritative `main`, and complete post-merge verification and repository-tracker updates in this execution.”

This is a separate, affirmative merge authorization for the isolated NP-18 increment. It is not inferred from the earlier qualification, admission decision, CI, technical mergeability, or standing authorization. It supersedes only the earlier pending integration boundary for this exact NP-18-only route. It does not amend or rewrite the qualification/admission records, authorize the combined PR #114, or confer any authority over DB-C1.

## 2. Exact authorized product scope

The authorized product diff is the exact nine-path NP-18 patch identified in the published admission decision and direct assessment evidence:

```text
frontend/src/features/intelligence/IntelligenceOpportunities.tsx
frontend/src/features/intelligence/IntelligenceOpportunities.test.tsx
frontend/src/features/intelligence/IntelligenceRisks.tsx
frontend/src/features/intelligence/IntelligenceRisks.test.tsx
frontend/src/features/intelligence/IntelligenceRankings.tsx
frontend/src/features/intelligence/IntelligenceRankings.test.tsx
frontend/src/app/App.tsx
frontend/src/app/navigation.ts
frontend/src/app/App.test.tsx
```

For `App.tsx`, only the three Intelligence-view imports and route mounts are authorized. For `navigation.ts`, only the three existing Intelligence children and the bounded group-only comment correction are authorized; the Intelligence parent remains group-only. `App.test.tsx` carries the approved direct-route/navigation/no-credential assertions.

The exact patch is separately checked against the verified target base before publication. This authorization is hunk-scoped for the shared files, not a whole-blob approval of any prior broker-preview change.

## 3. Explicit exclusions and preservation

The following eight broker-preview product paths are excluded from this authorization:

```text
frontend/package-lock.json
frontend/package.json
frontend/src/api/brokerHoldingsPreview.test.ts
frontend/src/api/brokerHoldingsPreview.ts
frontend/src/app/routes.ts
frontend/src/features/broker-holdings/BrokerHoldingsPreview.test.tsx
frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx
frontend/tsconfig.broker-import.json
```

Also excluded are the broker-specific `App.tsx` import and `/broker-holdings` route, the Broker Holdings navigation item, every unrelated branch commit, any IPD mutation, and all changes to reports, portfolios, identity, authentication, server, engine, DTO, API, lockfile, package or configuration paths. PR #114 remains open; no broker-preview work is discarded, rewritten, admitted, or merged by this decision.

## 4. Directly necessary records and verification

The isolated PR may carry the already-published NP-18 R3 target/implementation record, target-authority determination, qualification record, admission decision, their direct evidence, the NP-18/Group 6 tracker history, and this authorization record. These records retain their actual historical branch/commit provenance. The isolated candidate must additionally establish:

1. its base is the freshly verified authoritative `main`;
2. its product diff is exactly the nine approved paths and shared-file hunks above;
3. the eight broker paths and broker hunks are absent;
4. the patch applies cleanly to that base;
5. the required hosted checks pass on the isolated PR's exact head (combined-PR CI is not substituted);
6. after merge, remote `main` contains the exact merge commit and authorized NP-18 product changes, broker-preview code is absent from the merge delta, and applicable post-merge CI succeeds; and
7. the existing authoritative tracker is updated with the actual main commit, changed paths, CI/evidence, and remaining lifecycle boundaries, then independently verified remotely.

## 5. Remaining lifecycle limits

The earlier qualification remains **QUALIFIED FOR BOUNDED NON-PRODUCTION USE** and the earlier admission remains **APPROVED FOR MAIN ADMISSION** for this pinned scope. This authorization permits only its isolated integration and post-merge recording. It grants no release, production activation, live data, expanded capability, new risk methodology, wider population, or other workstream authority. Release and production remain separate and are not started here.
