# IIPS v3.0 — G-2 Durable User Portfolio Implementation Record

**Program:** IIPS Engineering Standards — Program v3.0

**Record type:** IMPLEMENTATION RECORD — non-production only (not certification,
release, promotion, deployment, migration, or production authority)

**Date:** 2026-10-07

**Authority:** Ramki / Program Authority — explicit G-2 implementation authorization
(2026-10-07): non-production durable user portfolio (IPD-side capability +
IRR-side interface/adapter); SQLite via verified G24 reuse; G-2 §5 consumption
contract creation incl. governed identity/ownership translation; G24
reuse/extension evaluation with minimum lineage/pinning. No production authority
of any kind. Fail-closed execution required.

**Execution method:** INVESTIGATE → VERIFY → RE-VERIFY → RECTIFY → ACT → PROVE.

---

## 1. Re-verification (before mutation)

| # | Item | Result |
|---|---|---|
| 1 | G-2 decision (`IIPS_v3.0_G2_…_DECISION.md`) | Blob `7e83946b470bcc6f4751fb1a67e832ac66128c5c`; commit `b7ed35e` ancestor of IRR main; §9 withhold noted and superseded ONLY by the 2026-10-07 authorization for this non-production scope |
| 2 | IRR main baseline | `29a43e5bae76530db970c231e0bf05b471b024b3` / tree `834c11ff096fba38a765ae7601d417eadf67cc16` |
| 3 | D-1 (`PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`) | G24 lineage recognized as the portfolio persistence lineage; main admission prohibited (standing preserved) |
| 4 | D-2 (`IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md`) | Domain-scoped authorities; no identifier equivalence; §8 translation minimum adopted verbatim in `translationBoundary.ts` |
| 5 | IPD main | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — UNCHANGED by this act (verified after) |
| 6 | G24 tip | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` / tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`; lineage `0dab1221 → 8c99627 → d4fdb33 → 6828155`; acceptance `12c480b5` SHA/tree-bound |
| 7 | G24 blobs | durable-store `1c23f259…`, governance `45d016e8…`, http-server `17f9cb8a…`, service `80563c79…` (= D-2 citation), 001 `48fcf4d9…` (= D-2 citation), 002 `dfe9f027…`, + 11 further blobs — all verified (full table in the §5 contract header) |
| 8 | G-2 IPD baseline `0dab1221` | Tree `e754acff…`, confirmed ancestor of the G24 tip |

## 2. G24 suitability determination (SQLite authorization condition)

The authorization conditions SQLite on verifying G24 suitable for reuse/extension.
Determination: **SUITABLE FOR REUSE — no extension required.**

Evidence (all at the pinned tip `6828155e`):

- **Live execution: G24 suite 84/84 PASS, 0 fail** (`g24_a`…`g24_h`: persistence
  foundation, migrations, portfolio durability, identity mapping, authorization,
  OIDC security, recovery, HTTP boundary).
- **Typecheck: zero errors in G24 scope** (`src/portfolio`, `src/persistence`,
  `src/app_identity`, `src/server`, `src/auth`, `tests/g24_*`); the only 4 errors
  sit in PIT tests untouched by the G24 delta (definitionally pre-existing).
- **G24 delta exactly 42 files**, all additive in the durable-portfolio scope
  (+ `better-sqlite3` dependency + governance record); nothing else touched.
- **Requirement coverage (G-2 §3):** explicit owner identity (`applicationUserId`),
  tenant context (memberships), stable durable identity (UUIDs), restart-durable
  SQLite (rollback-journal, FULL sync, FK-enforced), migration ledger (001–002,
  checksummed, append-only), lifecycle (revisions + tombstones, resurrection
  impossible), reset/deletion semantics, optimistic concurrency (`expectedRevision`),
  server-side authorization (membership authority), tenant/owner isolation with
  existence-hiding, governed auditability (mapping audit seq + portfolio events),
  contribution/lineage/idempotency preservation (parity with the certified store).
- **Wire contract cross-checked three ways:** G24 source, G24 `g24_h` test
  expectations, and the new IRR conformance suites — identical routes/statuses.
- IPD-side mutation is additionally **technically impossible** from this
  environment (`git push` → 403) and **unnecessary**: reuse-as-is is the minimum
  mechanism, so **zero IPD commits, zero IPD branches, zero IPD mutations**.

## 3. Minimum persistence contract (established, not invented)

The G-2 persistence contract IS the pinned G24 behavior, cited — not copied:

- Technology: file-backed SQLite via `better-sqlite3`; rollback journal; FULL
  synchronous; FK enforcement; IMMEDIATE transactions per mutation.
- Schema: migration-ledger versions `001_initial_schema` + `002_audit_event_sequence`.
- Entities: application users, external-identity mappings (PENDING→APPROVED→
  ACTIVE→RETIRED, audited), tenant memberships (ACTIVE/REVOKED), user portfolios,
  immutable revisions (INITIAL/MERGE/REPLACE/RESET/DELETE), holdings, contributions,
  events. Tombstones retained; history immutable.
- Retention posture (explicit): **indefinite preservation; no automatic purge.**
  A purge/retention policy is NOT silently invented — it is deferred to future
  governance (same posture as the D-1 journal extension's lifecycle gaps).
- Serialization posture (explicit): durable form = SQLite rows under ledgered
  schema versions; wire form = HTTP contract v1 (this record's §4).

## 4. G-2 §5 consumption contract (created)

`frontend/server/user-portfolio/userPortfolioContract.ts` (contract v1):

- **Data/interface contract:** `G2HoldingInput` (symbol-required passthrough),
  `G2SaveOptions`, `G2PortfolioView` (eleven `presentPortfolio` fields),
  `G2PortfolioSummary` (nine-field list projection), `G2RevisionEntry`,
  `G2SaveResult`, `G2DeleteResult`, `G2Health`; frozen lineage pin + audience +
  tenant-header + route constants.
- **Request/response semantics:** seven operations, one HTTP request each, verbs
  and envelopes mirroring G24 exactly (201 = created/new revision; 200 =
  read/reset/delete/duplicate-no-op distinguished by `isDuplicate`).
- **Authorization boundary:** two independent gates, both enforced, neither
  trusting the other — IRR `SecuredExecutor` (authenticate → RBAC read/execute →
  surface gate → tenant gate) AND G24 membership authority (403 on any denial).
- **Error semantics:** closed `G2FailureReason` set (9 reasons); upstream detail
  never echoed; 404 existence-hiding preserved; 409 conflict preserved.
- **Transaction boundary:** one port operation = one HTTP request = one G24
  IMMEDIATE transaction (or single authorized read). No batch, no
  read-modify-write, no distributed transactions — excluded by construction.
- **Concurrency/version semantics:** `expectedRevision` passthrough; stale guard
  → 409 end to end (proven by test G2H-32).
- **Idempotency semantics:** `contentDigest` passthrough; duplicate no-op honored
  (`ALREADY_IMPORTED_NO_OP` → 200 + `isDuplicate`, proven by test G2H-31).
  Digests are opaque to IRR — never computed, parsed, or compared here.
- **Ownership rules:** IRR validates transport SHAPE only; IPD owns ALL value
  semantics; IRR stores no portfolio state of any kind.

## 5. Identity/ownership translation boundary (created)

`frontend/server/user-portfolio/translationBoundary.ts` — the D-2 §8 minimum in
executable form (15 items: source/target authorities, source/target identifiers,
lifecycle, provisioning authority, revocation authority, tenant/ownership/
authorization boundaries, audit, failure behavior, trust model, durable storage,
package/API contract). Enforced in code:

- `deriveTenantHint(principal)` is the ONLY tenant source; blank → deny (no
  default, no substitution).
- Client-supplied identity/tenant/durable-identity fields are classified for
  refusal (400; foreign tenant → 403 audited DENY). `companyId` /
  `runtimeCompanyId` prohibited outright; no CompanyId binding of any kind.
- No trust propagation: the adapter presents the USER's OWN bearer; G24 validates
  it itself (issuer, distinct `ipd-user-portfolio-api` audience, JWKS, expiry)
  and trusts nothing IRR asserts. No static/service credential exists (it would
  collapse per-user ownership — explicitly unsupported).
- No mapping store in IRR: the registry lives in G24's SQLite alone (single
  authority, nothing to synchronize). The `G2ProvisioningRecord` is an OFFLINE
  attestation shape for the governed provisioning acts — never a runtime input.
- Provisioning is operator-only via G24 `IdentityService`
  (provision → approve → activate → membership); never at request time, never
  implicit. The port offers no provisioning operation.

## 6. Files added / modified (exact)

Added (11, all additive under existing seams):

- `frontend/server/user-portfolio/userPortfolioContract.ts` — §5 contract v1
- `frontend/server/user-portfolio/userPortfolioPort.ts` — port (7 ops, 1 txn each)
- `frontend/server/user-portfolio/translationBoundary.ts` — D-2 §8 boundary
- `frontend/server/user-portfolio/ipdUserPortfolioAdapter.ts` — the ONLY G24-wire module
- `frontend/server/user-portfolio/userPortfolioBoundary.ts` — validate→scope→delegate→guard
- `frontend/server/user-portfolio/contractStub.ts` — scripted wire stub (tests only)
- `frontend/server/user-portfolio-transport.ts` — `/api/user-portfolios/*` (G3-bound)
- `frontend/server/user-portfolio/userPortfolioContract.test.ts` — 19 tests (G2C)
- `frontend/server/user-portfolio/translationBoundary.test.ts` — 6 tests (G2T)
- `frontend/server/user-portfolio/ipdUserPortfolioAdapter.test.ts` — 12 tests (G2A)
- `frontend/server/user-portfolio/userPortfolioBoundary.test.ts` — 8 tests (G2B)
- `frontend/server/user-portfolio-transport.test.ts` — 14 tests (G2H)
- `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md` — this record

Modified (1, purely additive):

- `frontend/server/executive-transport.ts` — `+31/−0`: G-2 `userPortfolioExecutor`/
  `userPortfolioConfig` cache declarations + the `/api/user-portfolios` namespace
  dispatch branch (mirrors the Reports/PIT precedent; exact-match inside).

NOT modified (verified by diff): certified `/api/portfolio` + handler, reference
PortfolioWorkspace, engines, PIT, Reports, Watchlists, Collaboration, Settings,
Screener, AI Advisory, Executive, Evidence Landing, D-1/D-2/IPD records,
`package.json` (no new dependencies — the adapter uses global fetch), IPD
repository (zero mutations — reuse-as-is).

## 7. Validation

- Targeted suites: **59/59 PASS** (G2C 19 + G2T 6 + G2A 12 + G2B 8 + G2H 14).
- Full IRR suite: **971 passed / 2 failed / 25 skipped (998)** = baseline
  (912 passed / 2 failed / 25 skipped) + 59 new passes, **zero new failures**.
  The 2 failures are byte-identical to the pristine-tree baseline (same files,
  lines, assertions): `server/product-transport.test.ts:275` (telecom taxonomy
  expectation) and `server/pit/pitRuntimeIntegration.test.ts:361` (IU5R-13
  company-handler shape) — both unrelated to portfolios.
- Typecheck (`tsc --noEmit`, repo gate): 0 errors before and after.
- Server-graph typecheck (new files + test files + reachable graph, strict):
  0 errors.
- Build (`tsc -b && vite build`): PASS (exit 0).
- G24 live suite at the pinned tip: 84/84 PASS (suitability proof).
- Remote verification (independent fresh-clone re-fetch, 2026-10-07) of the
  implementation commit:
  - implementation commit `470cc698924ebecf8ce51cf7291b48f3fc1c7da7` / tree
    `319cb5376a5855c3e8f0bdc482c40beec35d4c81` — MATCHED remotely;
  - record blob `ffb239a7ac0130882f9e9bc299476813ebb6d89f`; contract blob
    `511ff9a2d2a41fbbd0ed32afe4c943a86ec0ad55`; transport blob
    `9bfdecd8ae4329057e08c9cc9d1c77d9f305ea6b`;
  - IRR main `29a43e5bae76530db970c231e0bf05b471b024b3` — UNMOVED;
  - IPD main `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — UNMOVED;
  - IPD G24 `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` — UNMOVED;
  - diff vs IRR main = 2 prior E2E-015 records + 13 G-2 files, exec `+31/−0`;
  - workspaces clean; no production repository or environment modified.

## 8. Explicit deferrals (fail-closed, each needs future governance)

1. Live-IdP certification (multi-audience issuance + end-to-end user-delegated
   proof) — DEFERRED; until then the live seam answers 503.
2. Per-user credential acquisition mechanism beyond bearer presentation — DEFERRED.
3. Retention/purge policy (posture: indefinite preservation) — DEFERRED.
4. Certified-analytics integration (G-2 §7 exclusion stands) — NOT AUTHORIZED.
5. Main admission of this implementation — NOT AUTHORIZED by this act (session
   branch only); G24 main admission remains PROHIBITED per D-1 standing.
6. No production-readiness, deployment, activation, or migration claim — NONE MADE.

## 9. Disposition

**G-2 IMPLEMENTATION COMPLETE — DURABLE / REMOTELY VERIFIED.**

No production-readiness claim is made. No production authority was exercised.

## 10. Finalization

This record's §7 coordinates were stamped in a follow-up commit on the same
session branch after the implementation commit was independently re-fetched and
verified. The implementation commit (`470cc69…`, tree `319cb537…`) is immutable
in branch history; the branch tip carries only this record's coordinate stamp
(no code change). Verify the tip remotely; the full coordinate chain is in §7
and in the commit footers.
