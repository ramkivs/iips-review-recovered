# IIPS v3.0 — Owner Context F-3 Implementation Record & Per-Capability Qualification

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-OWNER-CONTEXT-F3-IMPLEMENTATION-AND-QUALIFICATION-RECORD-01` |
| Record type | Implementation record + **independent per-capability qualification determination** for NP-09, NP-10 and NP-11 against the F-7 five-part bar |
| Authority | `IIPS-V3-OWNER-CONTEXT-F3-MECHANISM-AND-IMPLEMENTATION-PA-DECISION-01` §4 (bounded, per-capability implementation authorization) and §8 (qualification recorded separately) |
| Status | **AS AT PREPARATION: IMPLEMENTED — VERIFIED — QUALIFICATION RECORDED. NOT PUBLISHED — NOT EFFECTIVE.** Publication status is superseded post-publication; see the closure note at the end of this record. |
| Date | 2026-10-12 |
| Baseline | `main` = `709b27d63161d7f0df840218ad5156b86ea49b97` (unchanged; 0 open pull requests) |
| Values | `owner-7f3a91c2`, `irr-domain-4b82d6e1` — **preserved unchanged** |
| Carrier digest | `d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4` (363 canonical bytes) |

---

## 1. What was implemented

The smallest sufficient server-owned owner-context mechanism plus the valid paths of the three authorized capabilities. **No service logic, journal format, schema or persistence semantic was changed** (§5).

### 1.1 New files

| Path | Role |
|---|---|
| `frontend/server/owner-context-carrier.ts` | Approved literals; canonical carrier text; pinned SHA-256; deterministic materialisation (refuses any target inside a Git working tree) |
| `frontend/server/owner-context-resolver.ts` | The seam read, the two validation gates, the failure taxonomy, `resolveOwnerContext()` |
| `frontend/server/owner-scoped-http.ts` | Bounded body reading, JSON serialisation, composition-failure response (no ownership semantics) |
| `frontend/server/owner-context-restart-harness.ts` | Separate-process evidence harness (test tooling; not a test file) |

### 1.2 Modified files

| Path | Change |
|---|---|
| `frontend/server/watchlists/watchlists-transport.ts` | Resolver wiring; governed-universe integration; full route dispatch |
| `frontend/server/collaboration/collaboration-transport.ts` | Resolver wiring; `buildCollaborationResolversFor` + governed reference/vintage integration; full route dispatch |
| `frontend/server/settings/settings-transport.ts` | Resolver wiring; full route dispatch |
| `frontend/server/executive-transport.ts` | Composition passes the governed providers at the three existing route branches (**5 hunks, lines 759–787 only**) |
| `frontend/server/{watchlists, collaboration, settings}/*-service.ts` | **Documentation-only** (the F1/F2/F3 §5.2(9) reconciliation). Verified: every changed line is a comment line; zero code lines changed (§5) |
| `.gitignore` | Explicitly authorized `.iips-data/` addition (mechanism record §3.4) |

### 1.3 New test files (7)

`owner-context-carrier.test.ts`, `owner-context-resolver.test.ts`, `watchlists/watchlists-transport-owner-context.test.ts`, `collaboration/collaboration-transport-owner-context.test.ts`, `settings/settings-transport-owner-context.test.ts`, `owner-context-integration.test.ts`, `owner-context-restart.test.ts`.

**No pre-existing test file was modified, and no pre-existing assertion was weakened or deleted.**

---

## 2. Contract decisions taken under the delegated authority (mechanism record §4.6)

Recorded explicitly rather than invented silently. Each is the smallest coherent contract consistent with the existing client contracts (`frontend/src/api/*.ts`) and the existing service APIs.

1. **Envelope.** Collection reads answer `200` with `{ data, provenance }`; single-resource reads answer `200` with `{ data, provenance }`; creates answer `201` with `{ data }`; deletes answer `200` with `{ data: { …, deleted: true } }`.
2. **Provenance.** `{ dataSource, asOf, dataVersion, mode, freshness: 'SNAPSHOT', authority: 'PLATFORM', transportSemantics }`. Watchlists takes `dataSource`/`asOf`/`dataVersion`/`mode` from the governed universe's `vintage()`; Collaboration from the governed reference provider's `vintage()`; Settings is the settings-journal provenance (`asOf: null`).
3. **Dispositions.** Watchlists `UI07`/`NEW`; Collaboration `UI10`/`NEW`; Settings `UI12`/`ADAPT`. Grounded in the existing client contracts and the service headers (`collaboration-service.ts` L6 "disposition NEW"; `settings-service.ts` L6 `"Settings (UI12) — ADAPT"`).
4. **Settings `source`.** `GOVERNED_DEFAULT` exactly when the owner has **no durable revision** (`revisionCount === 0`), else `USER_REVISION` — the documented meaning in `frontend/src/api/settings.ts`. `lastRevisionKind` separately discloses a reset, so the two fields are not redundant.
5. **Validation → status.** Watchlists: `watchlist-exists` → `409`; `*-not-found` → `404`; otherwise `400`. Collaboration: `unsupported-reference-kind` → `404`; `*-not-found` → `404`; otherwise `400` (the service contract requires the first two as 404). Settings: `SettingsValidationError` → `400`; `SettingsSchemaVersionError` → `422`; `SettingsCorruptionError` → `500`.
6. **Composition failure is not an owner-context failure.** If the owner context resolves but a required governed provider was not composed, the response is `500 { error: 'governed-dependency-unavailable' }` — deliberately distinct from the owner-context `503`. It is unreachable in the composed server, which always supplies both providers.
7. **An unselected governed row is never fabricated.** A `canonicalSecurityId` that is not in the governed universe is `404 governed-row-not-found`.
8. **The owner identity is never disclosed.** Responses project only the declared client-contract fields; neither `ownerUserId` (Watchlists/Settings) nor `authorUserId` (Collaboration) is emitted, and no response body contains the approved owner value. Verified by explicit test.
9. **Unknown routes and methods keep their pre-existing behaviour**, including Watchlists' prefix-dispatch-then-exact-namespace `404` and Collaboration's/Settings' exact-namespace `404`.
10. **Request bodies are bounded** at 65536 bytes (`413`) and refused if not valid JSON (`400`); a malformed percent-encoded path segment addresses no resource (`404`).
11. **Per-request uncached resolution** (mechanism record §3.5(1)) — tampering and recovery both take effect on the next request with no restart.

---

## 3. Test evidence — actual results

All figures below are from executed runs, not inspection.

### 3.1 Full repository suite

| Measurement | Command | Result |
|---|---|---|
| Pre-existing tests (new files excluded) | `npx vitest run --exclude '**/*owner-context*'` | **59 files, 719 tests — 719 passed, 0 failed** |
| Full suite after implementation | `npx vitest run` | **66 files, 825 tests — 825 passed, 0 failed** |
| Delta | — | **7 new files, 106 new tests**; zero pre-existing test files modified |

Pre-change baseline measured on the eight in-scope suites: **8 files / 114 tests, all passing**. After the change those same eight files still contain exactly **114** tests and pass.

### 3.2 Build and type checks

| Check | Command | Result |
|---|---|---|
| Project type check | `npm run typecheck` | exit 0 |
| Production build | `npm run build` | exit 0 (`tsc -b && vite build`, 84 modules) |
| Strict type check of every new/changed server file | `npx tsc --noEmit --strict …` | **0 errors in every file authored or modified by this work** |

The four diagnostics reported in `executive-transport.ts` (lines 229–234) are **pre-existing and unrelated**: the identical diagnostics were reproduced against the unmodified `HEAD` version of that file, and this work's hunks in that file are at lines 759–787 only.

### 3.3 Per-suite results

| Suite | Tests | Covers |
|---|---|---|
| `owner-context-carrier.test.ts` | 8 | Canonical bytes, byte length, single trailing LF, no BOM, digest self-consistency, approved literals, materialisation, Git-tree refusal |
| `owner-context-resolver.test.ts` | 26 | Every failure reason; both gates; uncached tamper/recovery; cannot return a foreign pair |
| `watchlists-transport-owner-context.test.ts` | 18 | List lifecycle, governed-row resolution, deltas, triggers, isolation, fail-closed |
| `collaboration-transport-owner-context.test.ts` | 19 | Thread/comment lifecycle, closed reference set, watchlist refs, vintage STALE disclosure, isolation, fail-closed |
| `settings-transport-owner-context.test.ts` | 13 | Read/write/reset, rejection, isolation, fail-closed and immediate recovery |
| `owner-context-integration.test.ts` | 14 | The **real composed server** and real certified providers, end to end |
| `owner-context-restart.test.ts` | 8 | **Separate operating-system processes** (see §4.4) |

### 3.4 Fail-closed evidence, per capability

With the carrier absent, removed, or integrity-mismatched (including a single trailing space), **every known route of all three transports** returns `503 owner-context-unavailable`, while unknown routes keep `404` and non-owner routes keep serving (`/api/company/Banking` → `200`, `/api/executive` → `200`). Restoring the authorised carrier restores service **immediately, with no restart**. The `owner-context-unavailable` helper, its body and its reason string were **not modified**.

Deferred capabilities were re-verified as still unavailable: `/api/reports/artifacts`, `/api/user-portfolios`, `/api/user-portfolios/p-1` all return `503` (never `200`), `/api/user-portfolios/p-1` POST returns `405`, `/api/reports` returns `404`.

---

## 4. Per-capability qualification (F-7 five-part bar)

Qualification is per capability and independent. The following is **not** derived from the consolidated authorization; it rests on the executed evidence in §3.

### 4.1 NP-09 Watchlists — **QUALIFIED (non-production / TD-7a regime)**

| F-7 part | Determination | Evidence |
|---|---|---|
| 1. Positive ownership-boundary | **PASS** | List create/read/list/delete and item add/remove through HTTP under the approved pair; item baseline = real governed row; deltas over the three tracked fields; triggers evaluated |
| 2. Negative ownership-boundary | **PASS** | A partition written under a *different* `(tenantId, ownerUserId)` is invisible in list and unaddressable by exact id; unknown list/item → `404`; unknown governed row → `404 governed-row-not-found` (never fabricated); injected identity headers have no effect |
| 3. Failure mode | **PASS** | All six known routes ⇒ `503` on absent/tampered/oversized/malformed carrier; `404` preserved for unknown routes; recovery immediate |
| 4. Durability / restart (separate process) | **PASS** | §4.4 — the list, its membership and the persisted baseline were written by one process and read back by a separate one, with identical baseline value |
| 5. No cross-domain equivalence | **PASS** | No IPD/G24/Reports identifier is consumed or emitted; no translation contract is created or implied |

### 4.2 NP-10 Collaboration — **QUALIFIED (non-production / TD-7a regime)**

| F-7 part | Determination | Evidence |
|---|---|---|
| 1. Positive ownership-boundary | **PASS** | Thread create/read/list/delete and comment add/delete through HTTP; governed references resolved for a certified company (`Banking` sector-keyed **and** `Banking-H1` companyId forms) and certified evidence (`ev_Banking`); vintage pinned at authoring time |
| 2. Negative ownership-boundary | **PASS** | Threads written under a different pair are invisible; unknown thread/comment → `404`; a watchlist citation the owner does not hold → `404 governed-reference-not-found`; a kind outside the closed set → `404 unsupported-reference-kind`; unresolvable citations write nothing |
| 3. Failure mode | **PASS** | All six known routes ⇒ `503` on tampered carrier; malformed body → `400`; oversized body → `413` |
| 4. Durability / restart (separate process) | **PASS** | §4.4 — the thread created by one process is listed by a separate one |
| 5. No cross-domain equivalence | **PASS** | The closed set remains `company | evidence | watchlist`; no IPD/report/provider kind; no cross-domain identity equivalence introduced |

### 4.3 NP-11 Settings — **QUALIFIED (non-production / TD-7a regime)**

| F-7 part | Determination | Evidence |
|---|---|---|
| 1. Positive ownership-boundary | **PASS** | Read (`GOVERNED_DEFAULT`, theme `light`), write (theme `dark`, `USER_REVISION`, revision 1) and reset (theme `light`, revision 2, `settings-reset`) through HTTP |
| 2. Negative ownership-boundary | **PASS** | Unauthorized keys — including the identity fields `tenantId` / `ownerUserId` — are rejected `400`; injected identity headers do not alter the owner or the state; unknown paths/methods keep `404` |
| 3. Failure mode | **PASS** | All three known routes ⇒ `503` on tampered, removed or unset carrier; malformed body → `400`; oversized body → `413`; rejected payloads leave persisted state untouched |
| 4. Durability / restart (separate process) | **PASS** | §4.4 — the theme written by one process is the effective theme in a separate one |
| 5. No cross-domain equivalence | **PASS** | Only `(tenantId, userId)` derived from the owner context; no cross-domain identifier |

### 4.4 Separate-process restart evidence (F-7(4) / D-1 ext §6)

The D-1 ext §6 standard requires **separate-process** evidence. It was produced by running the **real composed server** under `vite-node` in child operating-system processes and comparing results:

| Step | Observation |
|---|---|
| Process 1 (`write`) | Owner context served (`settingsTenantId = irr-domain-4b82d6e1`); watchlist create `201`; item add `201`; settings `PUT` `200` (theme `dark`, revision 1); thread create `201` |
| Process 2 (`read`, **different pid and port**) | Same owner context; settings theme `dark`; watchlist `restart-wl-1` with 1 item; baseline composite identical to the value captured by process 1; deltas over `composite`, `qualityAxis`, `valuation`; trigger `fired: true`; thread title present |
| Journals | Exactly three per-capability journal directories in the data domain, each with the version-1 header `{"journalFormatVersion":1}` |
| Tampered carrier | A restarted process serves **no** owner context: settings/list/thread all `503` |
| Absent carrier | A restarted process serves **no** owner context: `503` |
| Restored carrier | A further process serves the owner context again, with **all previously written data intact** |

### 4.5 Qualification scope — stated honestly

1. **Scope of these determinations:** the HTTP/API boundary, the service and persistence layers, the mechanism, and separate-process durability — all in the **TD-7a local-development regime**. Production (TD-7b) remains deferred, so no production qualification is claimed.
2. **Not verified:** the browser UI was not exercised end-to-end against a live server in this work. The client API modules (`frontend/src/api/*.ts`) remain typed to the contract the server now emits, and the existing component tests still pass, but **live browser wiring was not re-verified**. This is recorded as a limitation, not as a pass.
3. **Pre-existing characteristic observed (not introduced here):** `buildGovernedUniverseProvider()` supplies the same certified reference universe for any tenant argument (it calls its own screener universe with a fixed `'default'`). Correct for a single-user application and unchanged by this work; recorded so it is not mistaken for a tenancy mechanism.
4. **Qualification is not admission into production, certification or release.** The designation records remain as published; publication of a designation is not qualification and this record changes no designation.

---

## 5. Proof of non-interference

| Claim | How it was verified |
|---|---|
| No service logic changed | The three service files' diffs contain **only comment lines**; verified mechanically by filtering every changed line for comment status — no non-comment line changed |
| No journal-format change | `JOURNAL_FORMAT_VERSION` untouched; a real journal's first line is `{"journalFormatVersion":1}` after the change |
| No schema change | `SETTINGS_SCHEMA_VERSION` untouched; collaboration/watchlists event grammars untouched |
| `persistence-service.ts` unchanged | Not present in the change set |
| The 503 safeguard unchanged | `owner-context-unavailable.ts` not present in the change set; its body and reason string asserted unchanged by the pre-existing tests, which pass unmodified |
| Existing fail-closed assertions intact | The eight pre-existing in-scope suites retain **114 tests** and pass; no pre-existing test file modified |
| Nothing owner-scoped was committed | `.iips-data/` now ignored (`git check-ignore` matches `.iips-data/`); no `.iips-data` path and no `owner-context.json` exists anywhere in the repository tree |
| No user data accessed | No inventory was performed; no pre-existing journal was read. `.iips-data` did not exist in the tree at any point; all test journals were created in temporary directories outside the repository |
| No IPD change | The IPD repository was not accessed or modified |

---

## 6. Environment constraints encountered (external, reported honestly)

1. **`npm ci` requires `--strict-ssl=false` in this sandbox.** The install of the pinned git dependency `iips-production-market-data` (via `codeload.github.com`) fails certificate verification because the sandbox proxies egress. The workaround was applied to the **install only**; it changed no repository file (the tracked `frontend/package-lock.json` is unmodified). This is an environment characteristic, not a product defect.
2. **The inspection clone is shallow (`depth 1`)**; history/graph facts were obtained from the authoritative remote's read-only API.
3. **No other external blocker remains.** The mechanism, all three capability paths, the qualification evidence and the separate-process durability evidence were all executed successfully in this environment.

---

## 7. Confirmed-functional product operations

Through their intended HTTP interfaces, under the approved owner context, with values preserved:

- **Watchlists (UI07):** list, create, read, delete; add governed item; remove governed item; baseline-vs-current deltas; trigger evaluation; governed-universe provenance.
- **Collaboration (UI10):** list, create, read, delete threads; add and delete comments; governed reference resolution (company / evidence / watchlist); vintage pinning and STALE disclosure; governed-reference provenance.
- **Settings (UI12):** read effective state; update the authorized `theme` preference; reset to governed defaults; revision disclosure.

And, unconditionally preserved: `503 owner-context-unavailable` for every owner-scoped route whenever valid owner context cannot be established; `404` for unknown routes and methods; unconditional unavailability of Reports and Portfolios; no owner identity inferred, defaulted or disclosed; the carrier and all owner-scoped data outside version control.

**Remaining blocker: none technical.** The two items that remain are governance/product-scheduled, not blocking: TD-7b production data-dir/deployment remains deferred by prior decision, and `F6_INVENTORY_AUTHORIZED` remains UNDECIDED with no evidence requiring it.

---

## 8. Status summary

```text
IMPLEMENTATION=COMPLETE (mechanism + NP-09 + NP-10 + NP-11 valid paths)
FILES=4 NEW MODULES + 7 NEW TEST FILES + 5 MODIFIED (3 comment-only) + .gitignore
TESTS_PRE_EXISTING=59 FILES / 719 TESTS PASSED
TESTS_FULL_SUITE=66 FILES / 825 TESTS PASSED (0 FAILED)
TESTS_ADDED=106 ACROSS 7 NEW FILES; NO PRE-EXISTING TEST FILE MODIFIED
BUILD=npm run build EXIT 0; TYPECHECK=npm run typecheck EXIT 0
RESTART_DURABILITY=EVIDENCED ACROSS SEPARATE OPERATING-SYSTEM PROCESSES
NP-09_QUALIFICATION=QUALIFIED (TD-7a non-production; per §4.1)
NP-10_QUALIFICATION=QUALIFIED (TD-7a non-production; per §4.2)
NP-11_QUALIFICATION=QUALIFIED (TD-7a non-production; per §4.3)
F1_OWNER_USER_ID_VALUE=owner-7f3a91c2 — UNCHANGED
F2_TENANT_VALUE=irr-domain-4b82d6e1 — UNCHANGED
FAIL_CLOSED=HTTP_503_OWNER_CONTEXT_UNAVAILABLE (unchanged)
CARRIER_COMMITTED=NO; OWNER_SCOPED_DATA_COMMITTED=NO; USER_DATA_ACCESSED=NO
IPD_CHANGES=NONE; IRR_IPD_MAPPING_EQUIVALENCE=NONE; F6_INVENTORY_AUTHORIZED=UNDECIDED
REMAINING_BLOCKER=NONE TECHNICAL; TD-7B AND F-6 REMAIN BY PRIOR GOVERNANCE
STATUS=IMPLEMENTED — VERIFIED — QUALIFIED — NOT PUBLISHED — NOT EFFECTIVE (as at preparation)
```

*End of implementation and qualification record. It records what was built, the actual executed results, and an independent per-capability qualification determination for NP-09, NP-10 and NP-11 in the TD-7a non-production regime; it grants no production, certification or release authority.*

---

## 9. Publication closure (post-preparation addendum)

The status banner and §8 state the position **as at preparation**, when this record was not yet published and therefore not yet effective as a durable act. This addendum records the publication.

| Item | Value |
|---|---|
| Publication act | Pull request **#68**, merged into `main` of `ramkivs/iips-review-recovered` |
| Merge commit | `a95949571ebec598d941edd13f26f6726dc1dc59` |
| Published (merged) tree | `fe3d6bc37a49ec51e1d5eccec71f4440bc553cb4` |
| Tree of the tested commit | `fe3d6bc37a49ec51e1d5eccec71f4440bc553cb4` — **identical** |
| Merged at | 2026-10-12T18:18:17Z |
| Effective from | 2026-10-12 |

Because the published tree is byte-identical to the tree that was tested, every executed result recorded in §3 and §4 — the 66-file / 825-test full suite, the 59-file / 719-test pre-existing run, the typecheck and build, the integration run against the real composed server, and the separate-process restart evidence — describes **exactly the published artifact**.

```text
PUBLICATION=MERGED (PR #68; merge commit a95949571ebec598d941edd13f26f6726dc1dc59)
PUBLISHED_TREE=fe3d6bc37a49ec51e1d5eccec71f4440bc553cb4; TESTED_TREE=IDENTICAL
REMOTE_TREE_VERIFIED=YES (all 21 paths present; no carrier/journal artifacts present)
EFFECTIVE=2026-10-12
NP-09_QUALIFICATION=QUALIFIED (TD-7a non-production; §4.1)
NP-10_QUALIFICATION=QUALIFIED (TD-7a non-production; §4.2)
NP-11_QUALIFICATION=QUALIFIED (TD-7a non-production; §4.3)
PRODUCTION_QUALIFICATION=NOT CLAIMED (TD-7b deferred); F6_INVENTORY_AUTHORIZED=UNDECIDED
REMAINING_BLOCKER=NONE TECHNICAL
```

*End of implementation and qualification record. It records what was built, the actual executed results, and an independent per-capability qualification determination for NP-09, NP-10 and NP-11 in the TD-7a non-production regime; it grants no production, certification or release authority.*
