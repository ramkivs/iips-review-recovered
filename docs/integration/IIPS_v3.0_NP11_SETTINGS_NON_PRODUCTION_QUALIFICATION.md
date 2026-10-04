# IIPS v3.0 — NP-11 Settings / Configuration Non-Production Qualification Record

## Executed Qualification & Durability Reconciliation

**Program:** IIPS Engineering Standards — Program v3.0
**Workstream:** NP-11 — Settings / Configuration
**Record Identifier:** `NP-11-QUAL-01` — Settings / Configuration Non-Production Qualification (executed)
**Document Type:** QUALIFICATION RECORD — non-production qualification, executed and durably recorded
**Version:** 1.0 — Qualification Decision
**Date:** 2026-10-04
**Gate:** `GATE-NP11-CONTROLLED-QUALIFICATION-DURABILITY-R3`
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Branch:** `arena/01a0f351-iips-review-recovered`
**Status:** **QUALIFIED — NON-PRODUCTION**

> **This record grants QUALIFICATION only.**
> **CERTIFICATION IS NOT GRANTED by this record.** Certification requires a separate certification authority/act.
> **ACCEPTANCE IS NOT GRANTED by this record.** Acceptance requires a separate explicit acceptance act.
> **PROMOTION IS NOT GRANTED by this record.** Promotion to `main` or into the active non-production feature baseline requires separate authority; none was established and none was exercised.
> **PRODUCTION READINESS IS NOT GRANTED by this record.**

---

## 1. NP-11 Identity and Qualified Coordinates

| Coordinate | Value |
| --- | --- |
| **Governance commit** (NP-11-AUTH-01) | **`a75b346375e13e3c01a3d41a8bd8ef74567580f3`** (`a75b346`) — 2026-09-30T20:16:39Z |
| **Governance artifact** | `docs/integration/IIPS_v3.0_NP11_SETTINGS_PRODUCT_CONTRACT_AND_PERSISTENCE_OWNER_DESIGNATION.md` |
| **Qualified implementation commit** | **`0feceafdd9d948fc9b3c78edb075ccf52b254254`** (`0feceafd`) — 2026-09-30T20:27:28Z |
| **Governance → implementation ancestry** | `a75b3463…` is the **direct parent** of `0feceafd…` (verified by `git rev-parse 0feceafd…^`) |
| **Qualification baseline (pre-implementation)** | `a75b346375e13e3c01a3d41a8bd8ef74567580f3` — 0 settings paths present |
| **Qualified branch / ref** | **IRR `refs/heads/arena/01a0f351-iips-review-recovered`** |
| **Reachability** | `0feceafd…` is an ancestor of the branch tip (`compare` → ahead 5 / behind 0) |
| **Later NP-11 implementation commits** | **None.** The commits above `0feceafd…` are NP-13 (`7a871fb2`, `034384fb`, `f87d16ab`, `5fde821b`) and the NP-10 qualification record (`689d5c8f`); none touches a settings path |
| **Implementation paths on `main`** | **0** — implementation remains branch-only |
| **IPD status** | Read-only reference baseline `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — **0 mutations**, **0 NP-11 references** |

### What NP-11-AUTH-01 authorizes, and what it does not

Read as written, not reinterpreted:

* **Authorizes:** the NP-11 Product Contract — private, user-owned, tenant-scoped personal configuration; ownership key `(tenantId, userId)` server-derived; D3 persistence authority (IRR Server Tier, Gate-P Class C, distinct consumer boundary, foundation unmodified); the twelve decisions D1–D12.
* **Records as excluded:** D4 data-mode / PIT preference; new identity mechanisms; import/export; sharing; 27 further authoritative exclusions.
* **States explicitly:** *"G3 / M-5 remain **OPEN**. This record does not remediate, close, or claim them."*
* **Does NOT contain:** any qualification authority, acceptance authority, certification authority, or promotion authority. Those are separate acts. This record therefore does not derive its authority from NP-11-AUTH-01; it derives from `GATE-NP11-CONTROLLED-QUALIFICATION-DURABILITY-R3`.

**The governance → implementation chain is valid. Qualification is NOT inferred from it** — it is established independently by execution (§3).

---

## 2. Qualification Scope (bounded, D1–D12)

| ID | Scope element | Verified |
| --- | --- | --- |
| **D1** | Product contract — closed preference set (theme: light \| dark only); private, user-owned, tenant-scoped personal configuration | ✅ |
| **D2** | Ownership — `(tenantId, userId)`, server-derived; private; no cross-user / cross-tenant | ✅ |
| **D3** | Persistence — IRR Server Tier; Gate-P Class C; **distinct** consumer boundary `IIPS_DATA_DIR/settings/journal.ndjson`; foundation unmodified | ✅ |
| **D4** | Data-mode / PIT preference — **EXCLUDED** | ✅ |
| **D5** | Identity / browser auth — consume existing boundary; no new mechanism; G3 remains a separate open dependency | ✅ |
| **D6** | Lifecycle / reset / retention — revision-oriented; reset = new default revision; no invented erasure | ✅ |
| **D7** | Versioning / migration — settings schema version distinct from journal format version; fail-closed on unsupported | ✅ |
| **D8** | Reproducibility — deterministic reconstruction; append-only revisions | ✅ |
| **D9** | Privacy / defaults — system-defined governed defaults; no sharing, no tenant/admin-defined personal settings; no browser storage | ✅ |
| **D10** | Repository integrity — IRR only; exact implementation and qualification baseline | ✅ |
| **D11** | Historical donor — **PARKED**; no donor code, dependency or data-mode preference imported | ✅ |
| **D12** | Import / export — **EXCLUDED**; no import/export surface | ✅ |

---

## 3. Verified Test Population and Executed Results

### 3.1 Population reconciliation — exact match

| Category | Reported | Current repository | Status |
| --- | ---: | ---: | --- |
| Route integration | 5 | **5** (`settings-route-integration.test.ts`) | ✅ MATCH |
| Service | 28 | **28** (`settings-service.test.ts`) | ✅ MATCH |
| Transport | 31 | **31** (`settings-transport.test.ts`) | ✅ MATCH |
| UI | 17 | **17** (`Settings.test.tsx`) | ✅ MATCH |
| **Total focused** | **81** | **81** | ✅ **MATCH** |
| HTTP security subset | 36 | **36** (5 route-integration + 31 transport) | ✅ MATCH |
| UI subset | 17 | **17** | ✅ MATCH |

Unlike NP-10, NP-11 added **no** cases to any pre-existing test file — all 81 cases are in four new dedicated files. The population is unambiguous.

### 3.2 Execution environment

| Item | Value |
| --- | --- |
| Node | `v22.22.3` |
| npm | `10.9.8` |
| Test runner | `vitest 2.1.9` (`linux-x64`, `node-v22.22.3`) |
| TypeScript | `5.9.3` |
| OS | `Linux 6.1.158+ x86_64` |
| Commit under test | `0feceafdd9d948fc9b3c78edb075ccf52b254254` |
| Executed at | 2026-10-04T06:43Z–06:45Z UTC |

### 3.3 RUN 1 — NP-11 focused qualification suite

```
npx vitest run \
  server/settings/settings-route-integration.test.ts \
  server/settings/settings-service.test.ts \
  server/settings/settings-transport.test.ts \
  src/features/settings/Settings.test.tsx
```

| Metric | Value |
| --- | --- |
| Test files | **4 passed / 4** |
| Tests discovered | **81** |
| Passed | **81** |
| Failed | **0** |
| Skipped | **0** |
| Duration | 4.87s |
| Exit status | **0** |

### 3.4 RUN 2 — HTTP security subset

```
npx vitest run server/settings/settings-route-integration.test.ts server/settings/settings-transport.test.ts
```
**36 / 36 passed** — 0 failed, exit 0. *(Reported 36/36 — CONFIRMED.)*

### 3.5 RUN 3 — UI subset

```
npx vitest run src/features/settings/Settings.test.tsx
```
**17 / 17 passed** — 0 failed, exit 0. *(Reported 17/17 — CONFIRMED.)*

### 3.6 RUN 4 / RUN 5 — Full-suite baseline comparison

| | Baseline `a75b3463…` (pre-NP-11) | Qualified `0feceafd…` | Delta |
| --- | --- | --- | --- |
| Command | `npm test` (`vitest run`) | `npm test` (`vitest run`) | — |
| **Passed** | **437** | **518** | **+81** |
| **Failed** | **2** | **2** | **0** |
| **Skipped** | **25** | **25** | **0** |
| Total | 464 | 545 | +81 |
| Test files | 42 (37 pass / 2 fail / 3 skip) | 46 (41 pass / 2 fail / 3 skip) | +4 |
| Duration | 37.72s | 41.68s | — |

**New failures introduced by NP-11: 0.** The delta is `+81 passed`, with failed and skipped counts **identical** before and after — matching the 81 NP-11 cases exactly.

The baseline figure `437` independently reproduces the NP-10 qualified figure, confirming the chain NP-10 (`ba8ea1df…`) → NP-11 (`0feceafd…`) is arithmetically continuous.

### 3.7 The 2 pre-existing failures (NOT NP-11-induced)

Both failures are present **identically at the pre-implementation baseline `a75b3463…`**, which contains **zero** settings source or test files. Neither touches a settings path.

| Test | Failure | Classification |
| --- | --- | --- |
| `server/product-transport.test.ts` › *Product responses reject taxonomy-resolved categories while permitting all certified engines* | `AssertionError: expected [ 'sector.banking', …(12) ] to include 'sector.telecom'` | **Pre-existing** — product-transport / taxonomy subject |
| `server/pit/pitRuntimeIntegration.test.ts` › *IU5R-13 the company route is still handled by the company handler* | `AssertionError: expected { companyId: 'Banking-H1', …(10) } to have property "error"` | **Pre-existing** — PIT runtime integration subject (IU-5 / IU-7 lineage) |

---

## 4. Typecheck, Build, Protected Foundations, IPD Isolation

| Check | Command | Result | Exit | Detail |
| --- | --- | --- | --- | --- |
| **Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS** | **0** | 0 errors, 0 warnings |
| **Build** | `npm run build` (`tsc -b && vite build`) | **PASS** | **0** | 85 modules transformed; `dist/assets/index-BANCkL7p.js` 255.45 kB (gzip 72.78 kB); built in 1.82s |

**Protected foundations (D10 / D11) — verified from the change set of `0feceafd…`:**

* `frontend/server/persistence/persistence-service.ts` — **NOT modified** (0 occurrences in the change set). The NP-04 foundation is consumed as-is.
* The 14 changed files are: 6 settings implementation/test files, `frontend/src/api/settings.ts`, `frontend/src/features/settings/themeSync.ts`, and 5 **registration-only** edits (`App.tsx` +2, `navigation.ts` +4, `routes.ts` +1, `main.tsx` +8/−1, `executive-transport.ts` +15).
* Nothing in the change set touches `frontend/server/pit/`, `frontend/server/watchlists/`, `frontend/server/collaboration/`, `SecuredExecutor`, certified engines, or the reference portfolio.
* **Executed corroboration:** *"does not disturb the adjacent governed routes"* (route integration, real composed server) and full-suite **0 new failures**.

**Historical donor (D11) — verified absent:** `authFetch` = 0 occurrences, `showDegradedDetail` = 0 occurrences, `dataMode` = 0 occurrences across the NP-11 implementation. All `LIVE` / `SNAPSHOT` / `PIT` occurrences in NP-11 source are **exclusion documentation or rejection logic**, not capability — corroborated by the executed case *"rejects the EXCLUDED data-mode / PIT / freshness preferences"* and by the transport's own model disclosure string.

**IPD isolation — verified:** IPD `main` remains `4d3e1cdca3a33da0ec3be8b336b17128108a502c`, worktree clean, **0 NP-11 references** (filename and content sweep). No IPD mutation was performed.

---

## 5. Qualification Dimension Evidence (executed cases)

| ID | Dimension | Verified by executed cases |
| --- | --- | --- |
| **D1** | Product contract | *"has a closed, bounded authorized preference set (theme only)"*; *"discloses the authorized (and excluded) model on every response"*; *"exposes no control for any excluded capability"* |
| **D2** | Ownership | *"isolates owners within the same tenant"*; *"isolates tenants across the same user id"*; *"never discloses another owner's settings (same tenant)"*; *"rejects client-supplied identity fields"* |
| **D3** | Persistence | *"persists an authorized update as a new durable revision"*; *"resolves its journal to a DISTINCT settings consumer boundary"*; *"writes ONLY to the distinct settings consumer boundary"*; *"never rewrites or deletes prior revisions (append-only)"* |
| **D4** | Data-mode exclusion | *"rejects the EXCLUDED data-mode preference with 400"*; *"rejects the EXCLUDED data-mode / PIT / freshness preferences"* |
| **D5** | Identity / security | *"rejects an unauthenticated read with 401"* (also write, reset); *"denies a viewer mutation with 403"*; *"rejects a client-supplied identity override with 400"*; *"ignores identity supplied via the query string (server identity is authoritative)"*; *"carries no credential or browser-storage material in any response"* |
| **D6** | Lifecycle / reset | *"establish the governed defaults as a NEW revision"*; *"survives restart and applies only to the owning user"*; *"resets to the governed defaults as a new revision"* |
| **D7** | Schema version | 7 dedicated cases: *"exposes a settings schema version distinct from the journal format version"*; *"fails closed on a persisted revision written under an unsupported schema version"*; *"fails closed on an unrecognized record inside the settings journal"*; *"fails closed on an unsupported whole-journal format version"*; *"fails closed on a malformed non-final journal line"*; and two further malformed-payload cases |
| **D8** | Reproducibility | *"preserves the effective state across a journal reopen (fresh handler instance)"*; *"reconstructs the effective state deterministically from the journal"*; *"creates a distinct revision per update, even for a repeated value"*; *"is deterministic — the same empty configuration always yields the same defaults"* |
| **D9** | Privacy / defaults | *"returns the system-defined governed defaults when no revision exists"*; *"returns the governed defaults for an owner with no revision"*; *"writes nothing to browser storage while loading, updating and resetting"*; *"sends no credential material and supplies no identity on read"* |
| **D10** | Repository integrity | *"does not disturb the adjacent governed routes"*; full-suite **0 new failures**; `persistence-service.ts` unmodified |
| **D11** | Donor exclusion | *"exposes no control for any excluded capability"*; data-mode / PIT / freshness rejected; `authFetch`, `showDegradedDetail`, `dataMode` absent from implementation |
| **D12** | Import / export | No import/export surface exists; *"exposes no control for any excluded capability"* |

---

## 6. Restart Durability Evidence (D8) — executed

Restart durability is proven at the **process-instance / journal-reconstruction** level by executed cases:

* *"preserves the effective state across a journal reopen (fresh handler instance)"* — a fresh handler over the same persisted journal reproduces the identical effective state.
* *"reconstructs the effective state deterministically from the journal"* — deterministic folding in `seq` order.
* *"survives restart and applies only to the owning user"* — restart reconstruction is owner-scoped, not global.
* *"appends without rewriting earlier revisions"* — no rewrite on reopen.

**Limitation preserved:** this is **in-process / journal-reconstruction** evidence with a genuinely fresh handler instance over persisted filesystem storage. **Deployment-tier, out-of-process OS daemon / container lifecycle restart verification is NOT established by this qualification** and is retained as a future operational verification item.

---

## 7. Corruption / Schema Fail-Closed Evidence (D7) — executed

All seven D7 cases pass, plus three additional transport-level fail-closed cases:

* unsupported settings schema version → **422**; unrecognized journal record → **500**; malformed non-final journal line → fail closed; unsupported whole-journal format version → fail closed; persisted revision carrying an unauthorized key → fail closed; malformed persisted payload → fail closed.
* *"fails closed with 422 when the journal holds an unsupported settings schema version"*
* *"fails closed with 500 when the settings journal holds an unrecognized record"*
* *"fails closed on a malformed success envelope instead of presenting it as state"* (UI)

No case silently reinterprets, coerces, or partially applies a malformed or unsupported record.

---

## 8. G3 Boundary — explicit qualification limitation

The previously recorded G3 limitation is **preserved verbatim and verified**, not reinterpreted in either direction.

**Verified state:**

| Check | Result |
| --- | --- |
| Browser credential path availability | **UNAVAILABLE** — no credential or browser-storage material is written or read by NP-11; executed cases *"writes nothing to browser storage while loading, updating and resetting"* and *"sends no credential material and supplies no identity on read"* |
| `/api/settings` without required identity / authentication | **FAIL-CLOSED** — *"rejects an unauthenticated read with 401"*, *"rejects an unauthenticated write with 401"*, *"rejects an unauthenticated reset with 401"*, *"denies a viewer mutation with 403"*, *"denies a viewer reset with 403"* |
| Live IdP / Keycloak / OIDC capability | **NONE.** No live IdP, Keycloak realm, OIDC discovery, client secret, or token-issuance capability exists in NP-11. `AuthError` is imported from the pre-existing `keycloakAdapter` as an error type; the `Authorization` header is read through the existing governed non-production identity path |

**Recorded disposition:**

> **The browser→transport credential-path / G3 dependency remains OPEN.**
> NP-11-AUTH-01 §7 states: *"G3 / M-5 remain **OPEN**. This record does not remediate, close, or claim them."*
> NP-11 operates through server-derived `(tenantId, userId)` scoping via the existing authenticated-principal boundary — the accepted non-production access-control mechanism, consistent with the NP-09 and NP-10 precedents.

**Per §8 of the gate, G3 is recorded as an explicit qualification limitation and is used NEITHER as a reason to invalidate the non-production qualification NOR as a reason to claim G3 is resolved.**

---

## 9. Explicit Exclusions (authoritative set)

The full exclusion set from NP-11-AUTH-01 §15 is preserved and verified by executed cases where applicable:

1. System / platform configuration.
2. Deployment / environment configuration.
3. Provider configuration.
4. Feature flags.
5. Secrets.
6. Authentication configuration.
7. Authorization policy configuration.
8. Identity management.
9. Broker / provider configuration.
10. Production activation / configuration.
11. **LIVE / SNAPSHOT / PIT user-selectable data mode.**
12. PIT addressing.
13. Data provenance manipulation.
14. Settings sharing.
15. Cross-user Settings access.
16. Cross-tenant Settings access.
17. Workspace membership.
18. Collaboration semantics.
19. Watchlist persistence reuse.
20. Collaboration persistence reuse.
21. Browser-local durable Settings persistence.
22. Browser-local credentials.
23. New identity architecture.
24. Import / export.
25. External notification configuration.
26. Any capability not demonstrably belonging to private user-level Settings.
27. Tenant-defined defaults.
28. Administrator-defined personal Settings.

**Additionally excluded from this qualification:** no production certification; no production readiness; no concurrency / load qualification; no live Keycloak / OIDC qualification; no out-of-process OS / container restart qualification.

---

## 10. Known Limitations

1. **G3 / browser→transport credential path remains OPEN** (§8). Explicit qualification limitation.
2. **Restart durability is in-process / journal-reconstruction scope.** Deployment-tier out-of-process restart is not established (§6).
3. **Identity is non-production.** Production Keycloak/OIDC realm activation, certificate provisioning and external IdP cutover are outside this gate's authority.
4. **Two pre-existing full-suite failures remain open** (`product-transport` taxonomy; `pitRuntimeIntegration` IU5R-13). Neither is NP-11-induced; neither is closed by this record.
5. **Branch-only durability.** The implementation and this record exist on `arena/01a0f351-iips-review-recovered`; **0 NP-11 paths exist on `main`**.
6. **Execution environment.** Results were produced on Node `v22.22.3` / npm `10.9.8` / vitest `2.1.9` / TypeScript `5.9.3` on `Linux 6.1.158+ x86_64`, against a clean clone at the exact qualified commit. Reproducible from that coordinate; not re-run on a second machine.

---

## 11. Qualification Decision

The previously supplied formal qualification report was treated as **evidence to verify**, not as durable state. Every material figure in it was re-established against the current repository and re-executed.

All figures reconciled **exactly**: population 81 (5/28/31/17), HTTP security 36/36, UI 17/17, baseline 437/2/25 → qualified 518/2/25 with **0 new failures**, typecheck PASS, build PASS. Governance and implementation coordinates verified byte-for-byte and unchanged. All twelve scope dimensions D1–D12 covered by executed cases. Protected foundations and IPD isolation verified. G3 preserved as an explicit limitation.

> ## **NP-11 SETTINGS / CONFIGURATION — NON-PRODUCTION QUALIFIED**

> **NP-11 is qualified for the verified non-production scope only. This act does not grant certification, acceptance, promotion, or production readiness.**

---

*Recorded under `GATE-NP11-CONTROLLED-QUALIFICATION-DURABILITY-R3`. This record grants qualification only. It creates no certification, no acceptance, no active-baseline promotion, and no production readiness. IPD unmutated at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`.*
