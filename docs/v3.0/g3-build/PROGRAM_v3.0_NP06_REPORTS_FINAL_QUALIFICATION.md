# IIPS v3.0 — NP-06 Reports Final Qualification

## Qualification Evidence Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** NP-06-R2 — Final qualification of the NP-06 Reports capability

**Document type:** QUALIFICATION EVIDENCE RECORD — requirement-by-requirement verification of the
delivered Reports capability against its governed contract, with disposition. Not a certification,
release, or production authority.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Qualification authority:** Ramki — explicit authorization of NP-06 Reports Final Qualification,
limited to qualification of the already implemented and runtime-proven Reports capability. It does
not authorize new feature implementation, architecture change, production work, or the reopening of
any closed governance boundary.

**Authoritative repository:** `ramkivs/iips-review-recovered`
**Authoritative remote:** `https://github.com/ramkivs/iips-review-recovered.git`
**Authoritative ref:** `refs/heads/arena/01a0f1b3-iips-review-recovered`

**Qualified implementation commit:** `39dd43ebbd54767c4258513a5dfc2d9c1b861d28`
**Qualified implementation tree:** `3fdc29d6775022c8ea586c58cf9a6f0e613911d6`

**Authoritative IPD dependency:** `ramkivs/iips-production-market-data`
**IPD branch / commit:** `np04-governed-persistence-windows` @ `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`
**IPD tree:** `7c1d516a43153f9c4e1b09bfa259d16da1704bb0` (parent/gate `bd5229d0`)
**IPD modification status:** NOT MODIFIED — no write, no push, no architecture change.

**Authorization basis:** the NP-06 Reports Implementation Authority Activation record
(`PROGRAM_v3.0_NP06_REPORTS_IMPLEMENTATION_AUTHORITY_ACTIVATION.md`, decision NP-06-R1, status
ACTIVATED — NON-PRODUCTION, BOUNDED), which this record does not amend, reinterpret, or reopen.

---

> ## FINAL DISPOSITION
>
> # NP-06 REPORTS FINAL QUALIFICATION = **QUALIFIED**
>
> **Non-production qualification only.** This disposition qualifies the implemented capability
> against its governed contract. It is **not** a production release, not a certification of
> production readiness, and it creates no production deployment authority.

---

## 1. Qualification scope

Verified, by execution, the established and already runtime-proven Reports capability on the
authoritative commit above:

1. product contract — governed L1 capability, cross-sector scope, consumption (not redefinition) of
   the frozen `ReportingEngine`, canonical structured artifact as the authoritative representation;
2. identity and ownership — authenticated principal, `(tenantId,userId)`, server-validated tenant,
   no client-supplied identity authority, no `companyId`/`runtimeCompanyId` dependency;
3. canonical identity — deterministic `reportKey`, unchanged canonicalization behavior, golden-vector
   equivalence with the published NP-04 artifact, accurately recorded export limitation;
4. durable artifact identity — durable UUIDv4 instance identity minted by persistence, caller-supplied
   durable identity rejected, ownership immutable;
5. versioning and supersession — version 1 initial, append creates the next version, single-parent
   append-only supersession, head/history semantics preserved;
6. persistence — the five established NP-04 operations over the authoritative NP-04 store;
7. transport and security — 401 / 403 / 400 / 404 / fail-closed routing, no client identity override;
8. runtime — the already-proven server-owned `IIPS_NP04_DATABASE_PATH`; no new mechanism;
9. durability — separate-process restart recovery and chain continuation.

**Explicitly outside this qualification (recorded, not qualified):**

| Item | Status | Reason |
|---|---|---|
| UI rendering | DEFERRED | downstream projection; not authorized |
| Navigation integration | DEFERRED | not authorized |
| Projections (PDF/CSV/file export) | DEFERRED | R5: projections are never the canonical form |
| Sector-level reporting | DEFERRED | R4: initial scope is cross-sector |
| Production release / deployment | DEFERRED | production is explicitly excluded |
| NP-04 canonicalization export change | DEFERRED | requires an authorized NP-04 change; see §7 |

---

## 2. Requirement-by-requirement qualification matrix

Evidence classes are kept distinct as required: **UNIT** (suite-level), **INT** (integration through
real components), **LIVE** (real HTTP over the real governed store), **PERS** (persistence
substrate), **RESTART** (separate process), **SEC** (security), **REPO** (repository/durability).

| # | Requirement | Status | Evidence (class) |
|---|---|---|---|
| 1 | Reports is a governed L1 product capability | PASS | Activation record NP-06-R1 (authority); capability implemented under `frontend/server/reports*` and reachable only through the governed executor; Reports suites 228/228 (UNIT/INT) |
| 2 | Cross-sector reporting is the current scope | PASS | Artifacts composed from the cross-sector `ReportingEngine` output; live artifacts `reportType='Portfolio Summary'` (LIVE); R4 recorded in the governance decisions |
| 3 | Consumes the frozen ReportingEngine output, does not redefine it | PASS | `reports-artifact.test.ts` engine-boundary block (6 tests, incl. read-only/no-mutation); `ReportingEngine` has **0** changes at the qualified commit (REPO) |
| 4 | Canonical structured artifact is the authoritative representation | PASS | `canonical.ts` + `artifact.ts`; 46 canonical tests + 56 artifact tests (UNIT/INT); live artifacts carry a canonical `canonicalPayload` persisted verbatim (LIVE/PERS) |
| 5 | Authenticated principal supplies identity | PASS | 401 without/with expired credential (SEC, LIVE); ownership in every live artifact equals the principal |
| 6 | Ownership is `(tenantId,userId)` | PASS | Live `ownership={tenantId:'tenant-A',userId:'analyst-a'}` on v1/v2/v3 (LIVE); persistence tests 3, 10, 10b (INT) |
| 7 | Tenant is server-validated | PASS | Unknown principal → 401 live; foreign-tenant claim → 403 live; directory-based resolution, no client tenant authority (SEC/LIVE) |
| 8 | Client-supplied identity cannot override the principal | PASS | Live 400 for `userId`/`tenant` claims; response never echoes the claim; returned ownership is the principal (SEC/LIVE) |
| 9 | No `companyId` / `runtimeCompanyId` dependency | PASS | Reports code and the qualified diff contain **0** occurrences; transport refuses prohibited keys (REPO/SEC) |
| 10 | `reportKey` remains deterministic | PASS | Byte-stability and permutation tests (UNIT); repeated live derivation identical; 14/14 pinned keys reproduced (LIVE/UNIT) |
| 11 | Canonicalization behavior remains unchanged | PASS | Comment-stripped executable code of `canonical.ts` is byte-identical to the pre-qualification baseline (`ea50c4c`), hash `c9d21e5df595a42b…` (REPO) |
| 12 | 14 golden entries remain equivalent to the published NP-04 artifact | PASS | 14/14 pinned keys reproduced by the installed published `reportKey.js`, 0 mismatches; side-by-side IRR vs published: IDENTICAL on all 14 (UNIT/LIVE) |
| 13 | NP-04 export limitation accurately recorded | PASS | Recorded in `canonical.ts` and `reports-canonical.test.ts`; re-verified: the published boundary exports **no** canonicalization symbol (REPO) |
| 14 | `reportId` is durable and instance-specific | PASS | Live/independent substrate read: distinct UUIDs per instance, chain link `supersedes_report_id` (LIVE/PERS) |
| 15 | UUIDv4 identity generated by the persistence layer | PASS | Live reportIds match UUIDv4 form and are minted by NP-04 (no Reports-side minting; 13b "Reports mints no identity of its own") (LIVE/INT) |
| 16 | Caller-supplied durable identity is rejected | PASS | Live 400 `durable-identity-forbidden` for `reportId`, `reportKey`, `artifactVersion`, `supersedesReportId`, `schemaVersion`; content-derived engine id → 400 (SEC/LIVE) |
| 17 | Ownership is immutable | PASS | Chain tests reject ownership change (UNIT, 56-test artifact suite); live v1/v2/v3 share identical ownership (LIVE) |
| 18 | Initial artifact is version 1 | PASS | Live v1: `artifactVersion=1`, `supersedesReportId=null` (LIVE); contiguity tests (UNIT) |
| 19 | Append creates the next version | PASS | Live v1→v2 (+1) then, across a process boundary, v2→v3 (LIVE/RESTART); persistence test 9 (INT) |
| 20 | Supersession is single-parent and append-only | PASS | Live single-parent links; branching rejected by the artifact suite; non-head supersession refused live (UNIT/LIVE) |
| 21 | Current head/history semantics preserved | PASS | Live heads-only query (v1 absent while v2 is head) and `{current,history}` chain; after restart, history `[v2,v1]` from v3 (LIVE/RESTART) |
| 22 | `createInstance` / `appendVersion` / `resolveById` / `queryByOwner` / `listSupersededBy` | PASS | All five exercised live over the real store; port validator requires exactly these five (PORT, tests 15b/15e) (LIVE/UNIT) |
| 23 | Durable storage is the authoritative NP-04 store | PASS | Live composition resolves the real published module (`openDatabase` + `GovernedArtifactStore`); independent substrate read shows NP-04's own schema (`governed_artifacts`) (LIVE/PERS) |
| 24 | Unauthenticated → 401 | PASS | Live: no credential, expired credential, unresolvable tenant; authentication precedes routing (SEC/LIVE) |
| 25 | Unauthorized / cross-tenant → 403 | PASS | Live: foreign-tenant claim via query and via body → 403; non-Reports resource/action/role denied at the gate; the default admin gate denies a Reports read (SEC/LIVE) |
| 26 | Client identity override → 400 | PASS | Live: `userId` claim → 400, no echo (SEC/LIVE) |
| 27 | Caller-supplied durable identity → 400 | PASS | Live: 5 forbidden keys, engine-identifier form (SEC/LIVE) |
| 28 | Cross-owner resource access → 404 | PASS | Live: another principal resolving the artifact → 404 `not found`, no data leak; still 404 after restart; other owner's query returns `[]` (SEC/LIVE/RESTART) |
| 29 | Unsupported route / method stays fail-closed | PASS | Live: unknown path 404 (authorized caller), one-segment lookalike `/api/reportsEVIL` 404, `DELETE` → 405 with exact `Allow: GET, HEAD, POST` (SEC/LIVE) |
| 30 | No client identity field overrides the authenticated principal | PASS | Live `ownership` always equals the principal; forged-claim responses never reflect the claim (SEC/LIVE) |
| 31 | Server-owned `IIPS_NP04_DATABASE_PATH`, no new runtime mechanism | PASS | The only configuration used in every live run; **0** hardcoded database literals in Reports source; **0** new runtime files (REPO/LIVE) |
| 32 | Separate-process restart durability (not in-process reopen) | PASS | Process A (10/10) → Process B as its own OS process (6/6): byte-identical recovery of v1/v2, heads-only set, history, chain continuation to v3, cross-owner 404 (RESTART) |

---

## 3. Test results (executed at the qualified commit)

| Suite | Result |
|---|---|
| `server/reports/reports-canonical.test.ts` | **46 passed** |
| `server/reports/reports-artifact.test.ts` | **56 passed** |
| `server/reports/reports-persistence.test.ts` | **38 passed** |
| `server/reports-api.test.ts` | **44 passed** |
| `server/reports-transport.test.ts` | **44 passed** |
| **Reports total** | **228 passed (5/5 files)** |
| Typecheck (`tsc --noEmit`) | **exit 0** (0 diagnostics emitted) |
| Golden-vector equivalence (published artifact) | **14/14 pinned keys, 0 mismatches** |
| Side-by-side IRR vs published module | **IDENTICAL ×14** |
| Full regression | **2 failed | 543 passed | 25 skipped (570)** — files 2 | 36 | 3 (41) |

### Known pre-existing regression baseline (unchanged)

The two full-suite failures are **pre-existing and unrelated** to Reports; they reproduce
byte-identically at the earlier baseline and on the pre-qualification commit, and their behavior did
not change:

* `server/product-transport.test.ts:275` — certified engine list lacks `sector.telecom`;
* `server/pit/pitRuntimeIntegration.test.ts:361` — IU5R-13 company-route body lacks `error`.

They are **not** qualification failures and were not modified.

---

## 4. Live runtime evidence

Harness: a real `http.Server` driving the real `handleReportsRequest`, the real `SecuredExecutor`,
and the **real production composition path** `createLiveReportsPersistence()` →
`loadAuthoritativeNp04Persistence()` → NP-04's own `openDatabase` + `GovernedArtifactStore` over a
real SQLite database file. The only stand-in is the OIDC verifier (deterministic token→claims map),
because no Keycloak instance exists in the qualification environment; **no persistence double was
used anywhere in the qualification runs**.

**Live persistence-store resolution:** the store resolved through the production composition path and
the authenticated `context` surface reported `BOUND`. The published package's boundary exports
exactly `openDatabase`, `GovernedArtifactStore` and the `PersistenceError` hierarchy, and
**no** canonicalization symbol — re-confirmed at qualification time.

**Process A — live HTTP over the governed store (10/10):**

| Result | Value |
|---|---|
| create | **201** |
| durable instance identity (v1) | `e3be2653-1e18-49e7-842e-e4f29c40ffdf` (UUIDv4) |
| content identity (v1) | `879c6ccff4201aef5e9dc4f239c5d0230441ba23f7e20f935a2e6d4f67b1c35b` |
| append | **201**, version 2, `supersedesReportId` = v1 |
| durable instance identity (v2) | `969244c7-8112-4bc2-8e4a-a53fc6645931` |
| resolve v1 after append | **200**, `artifactVersion=1` |
| query (heads-only) | **200**, contains v2, excludes v1 |
| supersession | **200**, `current`=v2, `history`=[v1] |

Content identity was cross-checked against **both** implementations: the server-computed
`reportKey` equals `deriveReportKey` from the IRR module **and** from the published NP-04 module.

**Independent persistence evidence:** a direct `node:sqlite` read of the database file (not through
the application) shows NP-04's own schema and the chain on disk —
`governed_artifacts`: v1 `e3be2653…` (root, `supersedes = NULL`, chain `e3be2653…`) → v2
`969244c7…` → v3 `a1702730-d2d8-4b17-ae3e-fd72d13cf9ad`, all owned by `tenant-A/analyst-a`,
payloads 532 B.

**Corroborating prior evidence:** the earlier live runtime activation run at `ea50c4c` (whose
executable code is identical to the qualified commit) recorded Process A 48/48 and Process B 24/24
with the same observable contract.

---

## 5. Security evidence

All of the following were exercised over real HTTP against the live governed store:

| Case | Result |
|---|---|
| No credential | **401** |
| Expired credential | **401** |
| Credential whose tenant cannot be authoritatively resolved | **401** |
| Unknown Reports path, *without* credential | **401** (authentication precedes routing) |
| Foreign-tenant claim in query string | **403** |
| Foreign-tenant claim in POST body | **403** |
| Resource/action outside the Reports namespace, role outside the closed reader set | **403** (gate) |
| Default admin gate used for a Reports read | **403** |
| Client `userId` / `tenantId` claim | **400**, claim never echoed |
| `reportId` / `reportKey` / `artifactVersion` / `supersedesReportId` / `schemaVersion` supplied by caller | **400** |
| Content-derived engine identifier addressed as an instance id | **400** |
| Unknown path / lookalike `/api/reportsEVIL` (authorized caller) | **404** |
| Cross-owner resource access (another principal) | **404**, no data or existence leak |
| Unsupported method (`DELETE`) | **405**, `Allow: GET, HEAD, POST` |
| No authoritative store reachable | **503**, fail-closed, never a substitute |
| Reader roles | `viewer`, `analyst`, `admin` reach the surface; no role widens the namespace |

---

## 6. Restart durability evidence

Process **A** created v1 and appended v2 through HTTP and exited. A **separate OS process**
(Process **B**, its own `npx vitest run`) re-resolved the same server-owned database path and:

1. recovered v1 and v2 **byte-identically** across `reportId`, `reportKey`, `canonicalPayload`,
   `artifactVersion`, `supersedesReportId`, `generatedAt`, `reportType`, `portfolioId`, `ownership`;
2. preserved the heads-only query set and the supersession chain;
3. **continued the chain**: appending to v2 produced **201** with `artifactVersion=3` and
   whole-chain history `[v2, v1]`;
4. preserved cross-owner isolation (**404**).

Durability is therefore established across a real process boundary and independently confirmed by
reading the substrate file directly — **not** from an in-process close/reopen.

---

## 7. Residual architecture limitation (recorded, not solved)

The authoritative canonicalization function is **shipped but not published** by NP-04's export
surface: the `./persistence` boundary exports only `openDatabase`, `GovernedArtifactStore` and the
error hierarchy; the `exports` map declares exactly three subpaths with no wildcard; deep-importing
the shipped `reportKey.js` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`; no source or declaration maps
are published. Consequently `frontend/server/reports/canonical.ts` remains a proven-equivalent
implementation rather than a re-export.

This limitation is **documented in place** and was deliberately **not** solved during qualification.
Closing it requires NP-04 to publish the symbol under its own authority. Equivalence is held by
proof against the published artifact: the installed `reportKey.js` reproduces all 14 golden vectors
byte-for-byte with identical derived keys (re-verified at qualification time).

---

## 8. Boundary verification (no changes introduced by qualification)

| Boundary | Result |
|---|---|
| Tracked working-tree changes | **0** (only untracked handoff/evidence material) |
| New Reports features | none |
| UI / navigation / projections / export | none |
| Production work | none |
| IPD modifications | none (dependency read-only; pin `2e11fa3b`) |
| `ReportingEngine` modifications | none |
| NP-04 architecture modifications | none |
| D115 changes | none |
| IU-7 / IU-8 reopened | no |
| New canonicalization algorithm | none — exactly **1** module exports `deriveReportKey` |
| Second persistence implementation | none — **0** files in Reports source open a database |
| Hardcoded database path literals | none |

Qualification mutated nothing: it ran the existing implementation and recorded the outcome.

---

## 9. Production exclusion

This record qualifies a **non-production** capability against its governed contract. It does not:

* authorize production deployment or operation;
* certify production readiness, load behavior, or operational support;
* extend or reopen any governance boundary;
* constitute a release of any kind.

Authority remains the bounded, non-production NP-06 Reports implementation authority recorded by
NP-06-R1.

---

## 10. Disposition

**NP-06 Reports Final Qualification = QUALIFIED.**

Every mandatory requirement in §2 is proven with concrete, classified evidence. No requirement was
upgraded from the mere existence of an implementation: each was executed against the real governed
store at the qualified commit, and the security and durability claims rest on live HTTP over a real
database file across a real process boundary, independently corroborated at the substrate level. No
mandatory requirement is unproven.

**Known residual (non-blocking, recorded):** the NP-04 canonicalization export limitation of §7.
It is an architectural surface limitation of the dependency, not a defect of the Reports capability:
content identity is proven equivalent, and the limitation is documented rather than worked around.

---

## Appendix — evidence equipment and reproduction

Verification equipment (never committed; retained untracked in the workspace) lives at
`docs/handoff/qualification-evidence/`:

* `harness/` — `runtime.ts`, `phase-a.test.ts`, `phase-b.test.ts` (live HTTP over the real store);
* `equiv/` — `equiv.mjs`, `equiv.test.ts` (golden-vector / side-by-side equivalence);
* `div.py` — divergence proof used before any commit-level reset.

Reproduction, from `frontend/`:

    rm -rf /tmp/np06-qual && mkdir -p /tmp/np06-qual
    export IIPS_NP04_DATABASE_PATH=/tmp/np06-qual/reports-governed.sqlite NP06_QUAL_DIR=/tmp/np06-qual
    npx vitest run np06-qual/phase-a.test.ts      # process A
    npx vitest run np06-qual/phase-b.test.ts      # process B — separate OS process
    node np06-d/equiv.mjs && npx vitest run np06-d/equiv.test.ts
    npx vitest run server/reports server/reports-api.test.ts server/reports-transport.test.ts
    npx tsc --noEmit
    npx vitest run                                 # full regression, harness removed from the tree
