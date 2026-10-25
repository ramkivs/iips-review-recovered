# NP-06 Reports — Historical Completion and Deferral Reconciliation

| Field | Value |
|---|---|
| Record type | Read-only investigation report. **Renders no decision, grants no authority, and does not amend any operative disposition.** Not a tracker movement. Not a substitute for `IIPS-V3-REPORTS-CV21-DQ7A-A2-PA-DISPOSITION-2026-10-25-01`. **Publication overlay (`2026-10-25`): this file is evidence, not an authority instrument.** Durable publication was directed by commissioning `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01`. The read-only constraint below applied to the investigation that produced this report. It is not a standing bar on that later commissioning. No finding in this report is altered by the overlay. |
| Prepared | 2026-10-25 (UTC). Object verification time `2026-10-25T07:30:48Z`. |
| Investigator | Arena Agent Mode — evidence collection only. |
| Mission | One-pass reconciliation of what NP-06 Reports actually completed, what current `main` contains, which admission requirements remain unsatisfied, and whether those gaps are technical defects, missing evidence, or the operative deferral. |
| What this pass did not do | No Reports engineering. No UI, route, API, dependency, pin, export-map, or D115 change. The `/api/reports*` fence was not edited. A2, REG-11 Option C, and the tracker were not modified. Closed decisions were not reopened. No test suite, build, server, database, or live HTTP probe was executed. |
| IRR authoritative tip verified | `ramkivs/iips-review-recovered` `refs/heads/main` @ `00eda5b390f18408689bf9cb632ce76a02093ac8`, tree `4aa8fa7426b1368dabdb2b196771a321d415b6e8` (merge of PR #253, `2026-10-25T06:26:02Z`). Local `HEAD` equals `origin/main`. |
| IPD authoritative tip verified (read-only) | `ramkivs/iips-production-market-data` `refs/heads/main` @ `4b5c65a731a66a6fa1260146a55df9ed772953a5`, tree `cf5e85856009360de3ffb9614970c383a26d73ba` (PR #88, `2026-10-24T17:53:33Z`). Repository `pushed_at` `2026-10-24T17:53:35Z`. **0** open IPD PRs observed via the PR #42 view (state `CLOSED`, `mergedAt` null). |

**Labels used below:** `VF` verified fact, observed this pass in the named object or API result. `SR` historical claim recorded in a committed document and **not** re-executed this pass. `INF` analysis / inference. `GR` governance restriction. `REC` recommendation. `UQ` unverified.

This pass treats the published 2026-10-24 reconciliation (`docs/integration/NP06-REPORTS-CROSS-REPOSITORY-RECONCILIATION-2026-10-24.md`) and the tracker as claims to check, not as proof.

---

## 1. Executive verdict

NP-06 Reports was **substantially implemented, branch-qualified, and branch-accepted**. It was **not lawfully admitted** to authoritative `main`, and it is **not an active capability** today. The current label is not “never built.” It is also not “complete and waiting only for a merge.”

Three states must stay separate:

1. **Historically completed, at branch scope, under a since-removed security model.** On `arena/01a0f1b3-iips-review-recovered`, commit `39dd43ebbd54767c4258513a5dfc2d9c1b861d28` (tree `3fdc29d6775022c8ea586c58cf9a6f0e613911d6`, `2026-10-02T16:06:33Z`) contains the Reports domain, NP-04 binding, and authenticated transport. Tip `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b` (`2026-10-02T16:26:45Z`) adds only the qualification record. D-3 (IRR PR #40, merged `2026-10-06T20:31:38Z`) records **ACCEPTED / BRANCH-ONLY** and withholds implementation, promotion, main admission, and production. (`VF` for coordinates, file presence, and D-3 text. `SR` for executed 32/32 and 228/228 results.)
2. **Briefly present on `main`, then deliberately removed.** IRR PR #42 was merged `2026-10-06T21:09:33Z` as `47edf6f3db79c6c443caed148121406f33a158b7` under an express “NOT authorized for merge” body and with **0** reviews. That merge **is** an ancestor of current `main`. The PA-approved R4-B removal (`20511502f5559847d110d5323a911e2a9f8bdabd`, PR #81, merged `2026-10-13T13:39:38Z`) deleted the 10 `frontend/server/reports/` paths and is also an ancestor of current `main`. (`VF`)
3. **Operatively deferred, and not admitted, on current `main`.** What `main` carries is a fail-closed fence, not a Reports capability. `REG-11` Option C remains effective. A2 (`IIPS-V3-REPORTS-CV21-DQ7A-A2-PA-DISPOSITION-2026-10-25-01`, IRR PR #251, merge `8470c8ae9ea315851c4a57d6de6e2763716e58fa`, `2026-10-25T05:27:56Z`) **reaffirms** that deferral. A2 is a disposition closure of `CV-21` / `DQ-7a`. It is not capability completion, qualification, acceptance, or admission. (`VF` / `GR`)

**How much was completed.** The auth-era product contract was implemented as retrievable modules: canonical artifact, `reportKey`, composition from the frozen `ReportingEngine`, a five-operation NP-04 port, and an authenticated `/api/reports/*` transport. The committed test files structurally expand to the recorded **228** vitest cases, and **14** golden vectors are committed in source. UI, navigation, projections, production, and live-IdP were never in the qualified scope. Separate-process restart was **reported** PASS and **acceptance-fenced** as unproven because the harness was never committed. (`VF` / `SR`)

**What remains, and why it is blocked.** Current `main` cannot lawfully run that implementation. The authenticated stack it imported is gone. The carried IPD pin does not export `./persistence` and does not contain `GovernedArtifactStore`. `R1` and `R2` are deferred. `R3` is open against a re-derived object that the carried pin cannot supply. Current no-auth `F-7` is not satisfied. `CV-51` is blocked. Implementation authority is not granted. Those are not findings that the historical modules are defective relative to their own contract. They are the security-model break plus unsatisfied admission gates, held shut by A2. (`VF` / `INF` / `GR`)

**Recommendation.** Continue deferral. Do not resume Reports engineering. The evidence does **not** support overturning A2, and it does **not** support describing the historical work as incomplete merely because it is not on `main`. The next legitimate milestone, if Reports is ever to move, is a **separate PA commissioning decision**. Until that act exists, the minimum remaining engineering list is empty. (`REC`)

---

## 2. Historical implementation inventory

States used here are distinct: **implemented**, **tested**, **qualified**, **authorized**, **merged**, **admitted**.

### 2.1 Qualified implementation (implemented; branch-scoped)

| Item | State | Coordinates (`VF` unless noted) |
|---|---|---|
| Qualified implementation commit | Implemented | IRR `39dd43ebbd54767c4258513a5dfc2d9c1b861d28` / tree `3fdc29d6775022c8ea586c58cf9a6f0e613911d6`, subject “NP-06 Reports: resolve canonicalization consolidation (Requirement D)”, `2026-10-02T16:06:33Z`. Branch `arena/01a0f1b3-iips-review-recovered`. |
| Qualification-record tip | Record added; code unchanged | `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b` / tree `0e25371229eff5cb8ae4e6bdc2615260ddf0629c`, `2026-10-02T16:26:45Z`. `git diff --stat` against the qualified commit is **one file**, `PROGRAM_v3.0_NP06_REPORTS_FINAL_QUALIFICATION.md`, +325 lines. Remote branch tip today is still `6a8afbb2…` (`git ls-remote`). |
| Relationship to current `main` | Not an ancestor | GitHub compare `6a8afbb2…...00eda5b…`: **diverged**, qualified tip **28 ahead / 669 behind**, merge-base `19b42e7145eda89206a2a36b19e656b6e41b35d3`. |
| Dependency pin at the qualified commit | Historical pin, not the current pin | `frontend/package.json` pins `iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`. |

Domain and server-root files at the qualified tree, blobs identical at the tip:

| Path | Blob | Role |
|---|---|---|
| `frontend/server/reports/canonical.ts` | `f57fa6a6a57fc1ab74a178babb8aa378cb82778a` | §5.2 `reportKey` canonicalization. Imports `node` crypto path only via its own module; no transport dependency. |
| `frontend/server/reports/artifact.ts` | `1da89bd46d39ff4e0a2ae124ea5f770a4032e48e` | §5.3 validation. Does not mint `reportId` and does not reach NP-04. |
| `frontend/server/reports/composition.ts` | `fc9a8fbbdd66bfaf0fa3e9b72c38faa3eca6a647` | Read-only composition from frozen `ReportingEngine` output into `ReportContent`. |
| `frontend/server/reports/persistence-port.ts` | `16d787ea77fab1b2d1d2826b9077d17eebd2fd93` | Declared five-operation consumer contract against pin `2e11fa3b…`. |
| `frontend/server/reports/np04-adapter.ts` | `7f7b80a53416224638dbb8b82d95497bda6d8a88` | Fail-closed narrowing onto that port. No local store. |
| `frontend/server/reports/persistence.ts` | `49f203069bac5aed726a1483317ca4afa2963991` | Binding. Ownership from authenticated `Principal`. No Reports-owned database. |
| `frontend/server/reports/index.ts` | `0e3024d253f6bf26c1055a5936482a45942fe5ee` | Public surface. Header states transport, UI, navigation, and projections are deliberately not this module. |
| `frontend/server/reports-transport.ts` | `cdee7ed16b461b058f6ed117c41380b497a6a9d6` | 540-line authenticated HTTP boundary. |
| `frontend/server/reports/reports-canonical.test.ts` | `b411310a4ae62e12573857db62abb7538811f244` | Committed golden-vector and rejection suite. |
| `frontend/server/reports/reports-artifact.test.ts` | `cbe6496c18c80071dbdfe323a22c536407f6b8f8` | Artifact / chain suite. |
| `frontend/server/reports/reports-persistence.test.ts` | `45f0be0805984b1be072a2cf399ea5ba0fda8e09` | Persistence-binding suite. |
| `frontend/server/reports-api.test.ts` | `9cc52dc6dd1824738e553727b22284c59af45847` | 805-line API suite (historical blob, not the current fence test). |
| `frontend/server/reports-transport.test.ts` | `4ae07780541a03a94fac01ef0e38380eb652919e` | Historical transport suite. |

Historical transport imports, read from the qualified blob (`VF`): `keycloakAdapter.AuthError`, `EnterpriseRuntime.Principal`, `admin-transport.TransportError`, `SecuredExecutor`, plus the domain modules above. Route table preserved in that file, and still mirrored by the current fence:

- `GET`/`HEAD` `/api/reports/context`
- `GET`/`HEAD`/`POST` `/api/reports/artifacts`
- `GET`/`HEAD` `/api/reports/artifacts/:reportId`
- `POST` `/api/reports/artifacts/:reportId/versions`
- `GET`/`HEAD` `/api/reports/artifacts/:reportId/supersession`

Unknown path and `/api/reportsEVIL` are specified as 404; wrong method as 405. (`VF` source text)

**UI.** No `frontend/src` path matching Reports, and no `Reports.tsx` / reports page, at the qualified tip. (`VF`) UI rendering, navigation, projections, and export are recorded **DEFERRED** in NP-06-R2 §1. (`SR`)

**Not the same thing:** `iips-platform/reports/`, `reports-capital-markets/`, `reports-healthcare/`, and `reports-insurance/` are sector-engine freeze/verification artifacts. They exist on both the qualified tree and current `main`. They are not the NP-06 governed Reports capability. (`VF`)

### 2.2 Tests and qualification evidence

**Structural case inventory (`VF`, not an execution).** Expanding `it.each` rows in the five committed files at `39dd43eb…` accounts exactly for the recorded split:

| File | Plain `it(` | `it.each` expansion | Structural total | Recorded (`SR`) |
|---|---:|---:|---:|---:|
| `reports-canonical.test.ts` | 12 | 14 golden + 13 reject-key + 7 reject-payload | **46** | 46 passed |
| `reports-artifact.test.ts` | 42 | 4 UTC timestamps + 10 invalid timestamps | **56** | 56 passed |
| `reports-persistence.test.ts` | 38 | — | **38** | 38 passed |
| `reports-api.test.ts` | 44 | — | **44** | 44 passed |
| `reports-transport.test.ts` | 25 | 3 roles + 8 forged × 2 | **44** | 44 passed |
| **Total** | | | **228** | **228 passed** |

The 14 golden vectors are committed as `GOLDEN` in `reports-canonical.test.ts`, with pinned SHA-256 keys. The file header says those expected values were produced by executing NP-04 `reportKey.ts` at `bd5229d0…` and re-checked against the published `reportKey.js` of the pinned commit. **That execution was not repeated this pass.** (`SR`)

NP-06-R2 (`36fdf6d82a958c8e44eaf7695e8f08573498e33b` at the tip) records **QUALIFIED (non-production)**, **32/32** requirements PASS, typecheck exit 0, full regression **543 passed / 2 pre-existing unrelated failures / 25 skipped**, live Process A **10/10**, and separate-process Process B **6/6**. (`SR`)

**Restart harness (`VF` absence; `SR` result).** The qualification appendix says equipment under `docs/handoff/qualification-evidence/` was “never committed; retained untracked.” That path does not exist at `6a8afbb2…`. D-3 §9 therefore keeps separate-process restart and live-IdP as **CONDITIONAL / UNPROVEN**. Both statements stand. The PASS is report-grade. It is not a committed reproducible proof, and it cannot discharge current F-7(4). (`VF` / `SR` / `INF`)

**Live-IdP (`SR`).** NP-06-R2 states the OIDC verifier was a deterministic token→claims stand-in because no Keycloak instance existed in the qualification environment. Live-IdP was not evidenced.

### 2.3 What was authorized, merged, and admitted

| Instrument | What it did | What it did not do | Current effect |
|---|---|---|---|
| NP-06 governance record, blob `15a6fe88…` at the tip | Recorded product contract R1–R5, C1–C4, D3/D8/G11 | Initially withheld implementation | Historical contract reference. (`SR` for the withholding text; file present `VF`) |
| NP-06-R1, blob `b5302c5b…`, activation language at the tip | **ACTIVATED** bounded **non-production** implementation authority for the then-named branch/baselines | Production; auth-architecture replacement; `ReportingEngine` changes; D115 changes | **Spent and branch-scoped.** Not current authority. (`VF` text / `GR`) |
| NP-06-R2 | Recorded QUALIFIED for that tree against that contract | Certification, production, deployment, new features | Branch-scoped evidence of record. (`SR`) |
| D-1 PR #38 merge `561cc85f…`; D-2 PR #39 merge `f89f1904…` | Domain-scoped persistence ownership; domain-scoped identity/tenant authorities | Universal identity; cross-domain equivalence without a §8 contract | Effective on `main`. (`VF` via D-3 citations and current records) |
| D-3, PR #40, merge `e13e543abcfb72ff7a1d36801becbbf2dc1ff7a2`, `2026-10-06T20:31:38Z` | **ACCEPTED / BRANCH-ONLY** at the coordinates above | Implementation, promotion, main admission, production. Restart and live-IdP not upgraded | Acceptance of record **for that scope only**. (`VF`) |
| Promotion-scope decision, PR #41, merge `0b961fecbe29ed643c86c1a223fc22ac6d30a115`, `2026-10-06T20:49:21Z` | Future bar only. Text: “Promotion status: NOT EXECUTED.” | Promotion execution | Bar, not an execution. (`VF`) |
| IRR PR #42 | Merged the candidate onto `main` | Nothing lawful. Title: “DO NOT MERGE without promotion act.” Body: “NOT authorized for merge.” Reviews: empty. Head `4906a6b71f5133d714f0f4c29c89dba22ded37f5`, merge `47edf6f3…` | Unauthorized historical event. **Not ratified.** Domain blobs at the merge are byte-identical to the qualified tree for the 10 domain paths and the historical transport. (`VF`) |
| No-auth transition, commit `1f7997e5e325d94124f39f7458e27957197cbfb2` inside PR #61 merge `139c5b8d…`, `2026-10-12T10:43:21Z`; F-3 mechanism PR #68 merge `a95949571ebec598d941edd13f26f6726dc1dc59`, `2026-10-12T18:18:17Z` | Replaced Reports transport with fence blob `98147054…`. Removed the auth stack from `main` | Did not admit Reports. PR #68 scope is NP-09/10/11; Reports kept deferred | **Security-model break.** (`VF`) |
| R4-B, commit `20511502…`, PR #81 merge `4b3d5866b9e8a8dcbfda18d8dcdef7e700e6ceeb`, `2026-10-13T13:39:38Z` | Removed exactly the 10 domain/test paths (−3,240 lines). Commit message: no retroactive authorization of PR #42. Recorded verification `tsc` 0 and 688/688 (`SR`) | Did not authorize the earlier merge | Domain absent from `main` from this commit forward. (`VF` deletion; `SR` test count) |
| REG-11 Option C, `IIPS-V3-REG11-GATE-B-R1-R2-OPTION-C-PA-DECISION-2026-10-13-01` | Decision to **retain deferral** | Owner-binding contract, F-3 aliasing, R3 admission, implementation, route/UI | **Effective.** (`VF` / `GR`) |
| A2, 2026-10-25 | Answered `DQ-7a` by reaffirming Option C. Closed `CV-21` **by disposition** | Commissioning, admission, waiver of R1/R2/R3/F-7/CV-51 | **Effective.** (`VF` / `GR`) |

**Promotion history (`VF` within searched refs; `UQ` for deleted refs).** No promotion-execution record was located on the refs examined this pass. The only presence of the domain on `main` history is the PR #42 merge, later removed. Compare API: `47edf6f3…` and `20511502…` and promotion head `4906a6b7…` are ancestors of current `main` (`behind_by` 0). The qualified tip is not.

**IPD PR #42 is a different object (`VF`).** `ramkivs/iips-production-market-data` PR #42, “Gate 3: act-conformant IPC candidate…”, is `CLOSED`, draft, `mergedAt` null, closed `2026-10-24T12:47:36Z`. It is not the Reports promotion candidate. The two must not be cited interchangeably.

### 2.4 Historical NP-04 supplier (implemented on its own branch; not on IPD `main`)

IPD `np04-governed-persistence-windows` tip is `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (`2026-10-02T12:50:01Z`). Annotated tag `iips-pin-np04-2e11fa3b` (tag object `8e91cc70…`) targets that same commit. (`VF`)

At that commit (`VF`, GitHub Contents API):

- `package.json` exports exactly `./pit`, `./d114-non-production`, `./persistence`.
- `src/persistence/` contains `db.ts`, `errors.ts`, `identity.ts`, `index.ts`, `package.ts`, `reportKey.ts`, `schema.ts`, `store.ts`.
- `store.ts` defines `GovernedArtifactStore` with `createInstance` (line 268), `appendVersion` (288), `resolveById` (330), `queryByOwner` (345), `listSupersededBy` (381).
- `package.ts` re-exports `openDatabase`, `GovernedArtifactStore`, the error hierarchy, and `AuthenticatedOwner` / `ReportId`. It does **not** export a canonicalization symbol.
- `tsconfig.pit-package.json` `files` includes `src/persistence/package.ts`.

Compare against IPD `main@4b5c65a7…`: **diverged**, NP-04 is **26 ahead / 210 behind**, merge-base `4d3e1cdca3a33da0ec3be8b336b17128108a502c`. Not an ancestor. (`VF`)

---

## 3. Historical-versus-main comparison

Baseline: IRR `main@00eda5b390f18408689bf9cb632ce76a02093ac8`, tree `4aa8fa7426b1368dabdb2b196771a321d415b6e8`.

| Component | Historical qualified tree | Current `main` | Classification |
|---|---|---|---|
| `frontend/server/reports/` (7 modules + 3 domain tests) | Present, blobs above | **Absent.** `git cat-file -e HEAD:frontend/server/reports` fails | Historical branch-only, after a since-removed unauthorized presence on `main` history. Not on current `main` |
| Authenticated `reports-transport.ts` `cdee7ed1…` | Present, 540 lines, imports `SecuredExecutor` / `admin-transport` / `keycloakAdapter` | **Absent.** Replaced | Superseded by the fence. Not admitted |
| Fence `reports-transport.ts` | Not this file | Present, blob `981470541812a64c733309f1debec75455d85bee`, 73 lines. Same blob at no-auth commit `1f7997e5…` and at `HEAD` | Present and operationally admitted **as a refusal**, not as a capability |
| Dispatch | Executor-gated Reports handler | `executive-transport.ts` lines 755–759 import `./reports-transport` and call `handleReportsRequest` for `/api/reports` and `/api/reports/*` | Present. Routed to refusal |
| Fence behavior (source) | n/a | Known route + allowed method → `respondOwnerContextUnavailable` (`owner-context-unavailable.ts` blob `cb8db45d668d28cee7e0a52721001d579a872733`, `writeHead(503)`). Unknown path, including bare `/api/reports`, → 404. Wrong method → 405 + `Allow`. No domain import | Admitted refusal surface. **Not a live-deployment claim** — source and test-definition only |
| Current fence tests | n/a | `reports-api.test.ts` blob `0f250b2d…` (40 lines, 2 tests) and `reports-transport.test.ts` blob `63488ade…` (44 lines, 2 tests). They assert 503 / 404 / 405 and that `/api/portfolio` still returns 200 | Present. They are not the historical 44+44 suites |
| Reports UI / `/reports` route / API client | Absent | Absent. `frontend/src/app/routes.ts` has no Reports mount. Navigation mention is an owner-context comment, not a Reports page | Missing from `main`. Also never built on the qualified branch |
| `ReportingEngine.ts` | blob `1149864a8c43e8b885eee2c4a9a1ce869dd8f338` | **Same blob** | Present. Upstream engine unchanged |
| `EnterpriseRuntime.ts` (`Principal` type) | blob `7a4d69992bd41e88bc0d36af209c2a062ee423ce` | **Same blob** at `iips-platform/src/distributed/EnterpriseRuntime.ts` | Present. The type survived; the auth enforcement stack did not |
| `secured-executor.ts`, `admin-transport.ts`, `tenant-membership-store.ts`, `frontend/src/core/auth/keycloakAdapter.ts` | Present at qualified tip | **Absent** on `main` | Removed by the no-auth transition. Historical transport cannot resolve its imports on current `main` |
| Owner-context infrastructure | Not the F-3 mechanism | Present for other capabilities (`owner-context-*`, admitted NP-09/10/11-type surfaces) | Present but **not bound to Reports**. Option C §2(2) prohibits aliasing the F-3 pair into Reports without an authorized contract (`GR`) |
| IPD pin | `#2e11fa3b…` with `./persistence` | Manifest blob `6274537a81e1496189e629c7e8f371f80144dfec` and lockfile blob `05ade78c40ac40626c678f3531266049a0e83555` both pin `#2d9130e76bb0dc89daeefabaf297e27bdaa84250` and alias `iips-broker-import#70b24f029842a7e9b7f615e4d9df7376fd4ff817`. No manifest/lockfile divergence | Current pin is IPD-`main`-line, **59 behind** IPD `main`, ancestor (`behind_by` 0). It is not the historical Reports pin |
| `./persistence` consumer | Dynamic import of `iips-production-market-data/persistence` in the historical port | **0** imports of that specifier under `frontend/` on `main`. Consumed subpaths observed: `./pit`, `./d114-non-production`, `./portfolio-ui` | Historical consumer not admitted |
| NP-04 store | On the historical pin | Not on the carried pin and not on IPD `main` | Historical branch-only supplier |
| D115 | Not a Reports dependency. Historical req 9 excludes `companyId` | `d115-runtime.ts` `d9b546c941b17b3c4a34b68724bf89e6da821f91`, test `51bd4f68203e53163c41830d9a966a01bb1d2f4d`. CV-43 closed retained-unwired | Unchanged prohibition. Not a Reports gap to “fix” |
| Other fence blobs cited as protected | n/a | `user-portfolio-transport.ts` `51704c12a467cd2f718a030b5036bc55c9afa73f`; `user-portfolio/userPortfolioContract.ts` `e6b57bb8a021d8eb4b9b7572d12affc7de66be0b`; owner-context unavailable `cb8db45d…`; Reports fence `98147054…` | Unchanged this pass. Not Reports capability |
| NP-06-R1 / NP-06-R2 program records | On the qualified tip | **Absent** from `main` except as cited by later governance documents. The 2026-10-24 reconciliation is on `main` | Historical records remain on the branch; the reconciliation summary is published |
| Qualification record | On the tip only | Not the implementation | Branch-only evidence, citable |

**What changed between the historical implementation and current `main`, exactly (`VF` / `INF`):**

1. The 10 domain paths were placed on `main` by PR #42 and removed by R4-B. They are not in the current tree.
2. The transport file was replaced, at `1f7997e5…`, by a different blob that refuses instead of executing. That fence blob is unchanged through current `HEAD`.
3. The auth enforcement files the historical transport imported were removed and are still absent.
4. The dependency pin moved off `2e11fa3b…` onto `2d9130e7…` (CAP-02 re-pin, recorded in tracker §16.105 / PR #227 lineage). That move was not a Reports admission decision. It removed the only carried `./persistence` export.
5. F-1…F-7 and Option C added an ownership-source gate the historical qualification never answered, because that qualification proved an authenticated principal, not an F-3 declaration.
6. A2 closed the “is deferral still the disposition?” question. It did not restore any of the above.

**Not claimed.** No second Reports implementation lineage was re-swept across all remote heads this pass. The 2026-10-24 reconciliation’s “41 of 203 tips, identical blob `1da89bd4…`” census is `SR` from that pass, not re-executed here. The material refs named in this report were inspected directly. Absence of a deleted branch cannot be proven. (`UQ`)

**Documentary imprecision left in place (`INF`, not amended).** Tracker §18 row 35 still compresses route behavior to “`/api/reports*` → 503”. Source shows known allowed routes → 503, bare and unknown → 404, wrong method → 405. §18 row 36’s geometry “28 ahead / 272 behind” is stale against this pass’s measurement of **28 ahead / 669 behind** at `main@00eda5b…`. PR #253 corrected the file-count and authority wording; it did not refresh that distance. Neither imprecision is a capability defect, and this pass does not edit the tracker.

---

## 4. Qualification gap matrix

Requirements below are only those already named by Option C, F-7 §4.7, D-3, the R3 re-derivation (§16.105), CV-51, and A2. None are newly invented.

| Requirement | Existing evidence | Actual gap | Gap classification | Required action | Authority required |
|---|---|---|---|---|---|
| Hist. NP-06 contract (capability, canonical artifact, `reportKey`, five-op port, append-only lifecycle) | Modules and 14 golden vectors present at `39dd43eb…`. NP-06-R2 records 32/32. D-3 accepts that scope with two evidence fences | No demonstrated defect in those modules relative to their own contract. Execution results not re-run | No demonstrated gap for the historical contract. Execution remains `SR` | Do not rebuild. Do not blanket-rerun to reproduce recorded results | None for preservation. A future commissioning act would be required before any restore |
| Hist. authenticated security matrix (401/403/400/404/405) | Historical transport and its tests exist. NP-06-R2 records PASS (`SR`). Auth files absent on `main` (`VF`) | Those suites cannot execute on the current baseline. Their PASSes do not describe the no-auth product | Integration / baseline-change gap. Not a defect in the historical tests | None while deferred. If ever commissioned, re-express the case inventory under the selected owner contract. Do not restore `SecuredExecutor` / Keycloak | PA commissioning, then R2, then a new implementation act — not now |
| Separate-process restart (hist. req 32 / F-7 part 4) | NP-06-R2 records Process A 10/10 and Process B 6/6 (`SR`). D-3 §9: harness not committed, claim CONDITIONAL / UNPROVEN (`VF`). Path absent at tip (`VF`) | No committed reproducible harness. Historical PASS is not current proof | Missing evidence. Conflicting historical presentation, preserved, not resolved by calling either side false | None while deferred. A future F-7(4) claim needs a committed harness on the then-current baseline and owner contract | Determination act after implementation authority. Not granted |
| Live-IdP | Qualification used a verifier stand-in (`SR`). D-3 fences it unproven (`VF`) | Never evidenced | Missing evidence for a condition the current no-auth product may not even have. Not a current-main defect | Do not chase a live IdP under the no-auth baseline unless a future contract requires one | PA, only if a future contract says so |
| UI / D8 / CV-51 | Placement direction recorded historically (`SR`). No UI component on the qualified tip or on `main` (`VF`) | UI was never implemented. CV-51 remains blocked | Explicitly deferred scope, plus governance restriction | Do not build. Route/UI only after a future commissioning act, implementation, F-7, and acceptance | PA (`CV-51`), and not now |
| `R1` ownership-source authority | Option C: R1.1 **NOT ESTABLISHED**; R1.2 not resolved; R1.3 no F-2 extension; R1.4 deferral retained (`VF` text) | No nameable instrument that establishes a non-auth source for Reports `AuthenticatedOwner` | Governance / admission restriction. Not a coding defect | An instrument that exists and can be named, then an R1 determination. Analysis cannot substitute | PA |
| `R2` contract shape | Option C selected shape **C — retain deferral**. Shapes A and B not approved (`VF`) | No approved declaration, value act, or D-2 §8 contract | Explicitly deferred scope | Selection of a shape, after or with R1 | PA |
| `R3` pin / consumer admission | Historical pin has `./persistence` and `GovernedArtifactStore` (`VF`). Carried pin `2d9130e7…` exports only `./portfolio-ui`, `./pit`, `./d114-non-production` (`VF`). Its `src/persistence/` is the Gate-3 portfolio/IPC set (`audit.ts`, `binding.ts`, `brokerImportPersistence.ts`, `connection.ts`, `durablePortfolioStorePort.ts`, `migration_ledger.ts`, `migrations`, `portfolio_store.ts`, `provisioning.ts`) — no `reportKey.ts`, no `GovernedArtifactStore`, no `package.ts`. `tsconfig.pit-package.json` `files` are only `src/pit/package.ts` and `src/d114/non_production_package.ts`. IRR imports of `…/persistence`: 0. IPD `main` package.json blob is the **same** `51796e63…` as the pin, still with no `./persistence` export; IPD `main` adds Gate A′ persistence files, still not the NP-04 store | The gate as originally worded (“`./persistence` subpath of pin `2e11fa3b…`”) cannot be discharged against the carried dependency. §16.105 re-derivation is confirmed | Integration / dependency gap, and admission not authorized. Not an IRR-only code defect | A PA decision on the re-derived object, then an expressly authorized IPD package act and/or re-pin, then consumer admission. CV-23 says Gate A convergence is **not required**; do not reintroduce it as a prerequisite | PA, then an IPD-locus dependency act. Not authorized |
| `F-7(1)` positive ownership-boundary tests | No current Reports operation uses an authorized owner pair. Fence returns 503 before any domain call (`VF` source) | Unproven for any current contract | Failed or missing validation **for a capability that is not admitted**. Not a defect in the fence | None under deferral | Determination after a commissioned implementation |
| `F-7(2)` negative ownership-boundary tests | Historical negative tests are auth-era (`SR`). They do not exercise an F-3 binding | Unproven for the current contract | Missing validation for the current contract | Same as F-7(1) | Same |
| `F-7(3)` failure-mode → F-5 `503` | Fence source and current tests specify 503 `owner-context-unavailable` for known routes (`VF` source). Not executed this pass | No demonstrated gap in the prohibition. Insufficient, by F-7’s own text, to qualify a capability | No demonstrated gap for the refusal. Not qualification | Keep the fence. Do not treat fence tests as F-7 completion | None to preserve |
| `F-7(5)` no cross-domain equivalence without D-2 §8 | No Reports §8 contract found. Option C prohibits F-3 aliasing (`VF` / `GR`) | The prohibition is intact | Governance restriction. Not a defect | None unless a future act creates the contract | PA |
| Implementation authority | NP-06-R1 spent (`VF` text). Option C §§5–6 and A2 withhold current authority (`GR`) | No current authority | Governance / admission restriction | A new bounded act, only after commissioning and R1/R2 and a suppliable R3 object | PA |
| `CV-21` / `DQ-7a` | A2 answered: reaffirm deferral. Closed by dated disposition, not by capability completion (`VF` / `GR`) | None as a decision item. The capability question is intentionally unanswered in the commissioning sense | Governance restriction, now rendered | None. Re-entry is a separate act | PA, only to commission |
| `CV-51` | Blocked behind the deferral. No route object (`VF`) | Enablement not authorized | Governance restriction | Do not build | PA, last, and only after the earlier gates |
| `CV-43` / D115 | Closed retained-unwired (`GR`). Historical Reports req 9 already excludes `companyId` | None on the Reports path | No demonstrated gap. Wiring remains prohibited | Do not wire | None |
| IRR PR #42 ratification | Merge happened; R4-B and the H-4/H-16 errata (PR #154) document it and do not authorize it (`VF` / `SR` for the errata classification) | None open. The unauthorized character is settled | Governance restriction, already executed as removal | Do not re-investigate as if undecided. Do not treat the merge as admission | None |
| IPD PR #42 | Closed unmerged, Gate 3 IPC, unrelated (`VF`) | None for Reports | No demonstrated gap | Do not conflate with IRR PR #42 | None |
| Production / live deployment | No record grants it. This pass did not probe a live system | Not claimed, and not evidenced | Missing evidence only if someone were claiming production readiness. Nobody authorized that claim | Do not claim it | n/a |

**Are R1/R2/R3, F-7, and CV-51 blocked by implementation deficiencies, missing evidence, the deferral, or a combination?**

- **`R1` / `R2`:** the operative deferral. Option C already found no established ownership-source instrument and selected “retain deferral.” That is not an unimplemented function in the historical modules. (`GR`)
- **`R3`:** a combination. The historical supplier is real and still on `np04-governed-persistence-windows`. The **carried** pin cannot supply it. Admission of either a new export or a re-pin is not authorized. That is an integration gap **and** a governance restriction. It is not proof that the historical port was unfinished. (`VF` / `GR`)
- **`F-7`:** a combination, and not a single failed test. Parts 1 and 2 are unproven because no current owner contract exists to test. Part 3 is specified at source level and is explicitly insufficient. Part 4 is missing committed evidence even for the historical claim, and would have to be re-earned under any new contract. Part 5 is a standing prohibition. The deferral means there is no admitted capability for F-7 to qualify. (`SR` / `VF` / `GR`)
- **`CV-51`:** the deferral, plus the fact that UI was never in the qualified implementation. Blocking it is not evidence that a UI was built and rejected. (`GR` / `VF`)

---

## 5. A2 justification assessment

A2 remains an **operative governance restriction**. That conclusion does not depend on whether the 2026-10-02 implementation was technically substantial. A2 says the deferral is reaffirmed, Reports stays outside the admitted product capability, and outstanding requirements are not waived. This pass does not overturn it, does not read `CV-21` closure as capability completion, and does not authorize implementation.

### 5.1 Does the existing evidence demonstrate substantial completed Reports implementation?

**Yes, at historical branch scope. No, as an admitted current capability.** (`VF` / `SR`)

Completed, in the sense of “the code and its contract exist and were accepted for that tree”: domain modules, NP-04 binding, authenticated transport, committed tests whose case inventory matches 228, 14 committed golden vectors, NP-06-R2 qualification record, and D-3 branch-only acceptance.

Not completed, in the sense the current register uses: no domain on `main`, no current owner contract, no admitted supplier, no current F-7, no UI, no implementation authority, no promotion act.

### 5.2 Which historical deliverables remain valid and reusable?

Valid **as historical evidence of their own tree, pin, and security model** (`INF`, bounded by `VF` file identity):

- Product-contract text and the canonical artifact / `reportKey` / composition modules. `ReportingEngine.ts` and `EnterpriseRuntime.ts` are byte-identical to current `main`, so those modules’ upstream inputs have not drifted.
- The 14 golden vectors and the canonical/artifact suites, as regression material **if** a future act authorizes a restore. Not as current-main qualification.
- The five-operation port and adapter, as the contract of the NP-04 store at `2e11fa3b…`. Not as proof about any other store, and not as a right to import `./persistence` today.
- The route-shape table, which the fence still preserves.
- The authorization **case inventory** (forged identity, cross-owner, lookalike paths, method matrix). Expected statuses are auth-era and do not transfer.
- The restart **protocol description** in NP-06-R2. The result does not transfer.
- D-3, as acceptance of that branch scope only.
- The qualified branch itself, still at `6a8afbb2…`. A2 says it is not deleted and not admitted.

Not reusable as-is: the historical transport, its auth imports, NP-06-R1 as live authority, NP-06-R2 or D-3 as current-main acceptance, the uncommitted harness, and the pin `2e11fa3b…` as a carried dependency.

### 5.3 What specific technical or qualification gaps are proven?

Proven (`VF`), and only these:

1. The qualified tip is not an ancestor of `main` (28 ahead / 669 behind).
2. The domain directory is absent from current `main`.
3. The historical transport’s auth dependencies are absent from current `main`.
4. The carried pin and IPD `main` declare no `./persistence` export and do not contain the NP-04 artifact store. The conforming store exists only on the diverged NP-04 line.
5. IRR does not import `iips-production-market-data/persistence`.
6. The restart harness path is absent at the qualified tip.
7. No Reports UI exists on the qualified tip or on `main`.
8. Current fence tests are a 4-test refusal suite, not the historical 228.

Not proven: any functional defect inside `canonical.ts`, `artifact.ts`, `composition.ts`, or the NP-04 store relative to the 2026-10-02 contract. This pass did not execute them, and it does not invent a failure from non-execution. (`UQ` as to a fresh run; `SR` that the qualification record says they passed.)

### 5.4 Which restrictions exist solely because of A2?

A2’s **own** incremental effect, beyond Option C which already deferred R1/R2, is narrow and real (`GR` / `INF`):

- `DQ-7a` is answered “reaffirm deferral,” rather than left blank.
- `CV-21` is closed as a disposition item. The PKG-03 “closed as a disposition task” claim is superseded as the operative basis and preserved as provenance.
- Re-entry is expressly reserved to a **separate** PA commissioning decision. A2 does not pre-approve that decision.
- The published reconciliation’s reuse policy (do not rebuild; do not treat historical results as current admission or as F-7) is registered.

Restrictions that **pre-exist** A2 and that A2 preserves rather than creates: Option C itself; R1/R2 deferred; R3 not admitted; F-7 not satisfied; implementation authority not granted; CV-51 blocked; the 503 fence; the prohibition on F-3 aliasing; CV-43 unwired; no UI. Those would still bind if A2 had not been rendered, because Option C and the no-auth baseline already bound them. A2 stops them from being reopened by implication from historical completeness.

### 5.5 Does the evidence establish that further engineering is necessary, or only that admission has not been authorized?

**Only that admission has not been authorized — plus a short list of proofs that cannot be copied forward even after authorization.** (`INF`)

Further engineering is **not** necessary to explain the current state, and it is **not** authorized. The historical implementation is close enough that “rebuild Reports” would duplicate completed work.

If a future commissioning act existed, engineering would then be necessary only for the delta the baseline change created: a transport/composition binding under the newly selected owner contract, a committed restart harness, and whatever dependency act R3 required. That is not a finding that the 2026-10-02 domain was unfinished. It is also not permission to start that delta now.

### 5.6 What is the minimum remaining work to the next legitimate milestone?

The next legitimate milestone is **not an engineering milestone**. It is a separate PA decision to commission Reports, or a continued decision not to. (`GR` / `REC`)

Under A2, the minimum remaining work is **none**. Tracker §19, as annotated by PR #253, already says the current next action is none under A2. This pass agrees.

There is no hidden compile error, missing module, or failed current-main test that a coding pass could close without first violating A2, Option C, and the fence rule.

### 5.7 What separate PA decision would be required before resuming deferred work?

A new explicit commissioning act. A2 names the order that would then apply, and this report does not shorten it (`GR`, quoting A2 §1(4), not adding gates):

1. Commissioning act (not implementation authority).
2. `R1` ownership-source determination, which needs a nameable instrument.
3. `R2` contract-shape selection.
4. `R3` dependency and consumer admission, including any IPD-side act.
5. A new bounded implementation-authority act.
6. Only then implementation, `F-7`, acceptance, and — last — `CV-51` route/UI authorization.

A1 (exclude from v1) was not selected. Selecting it later would also be a separate PA act. This report does not recommend either A1 or commissioning.

---

## 6. Minimum remaining-work list

Only proven, already-named requirements. “Required action” is the gate, not an implementation procedure. **None of these actions are authorized by this report.**

| # | Proven requirement still open | Why it is still open | Action that would be required | Authority | Do this now? |
|---|---|---|---|---|---|
| 1 | A2 deferral | Operative PA act of 2026-10-25 | Leave it. Resumption requires a separate commissioning act | PA | No engineering |
| 2 | `R1` not established | Option C finding, preserved by A2 | Name an ownership-source instrument and determine R1 against it | PA | No |
| 3 | `R2` shape unselected | Shape C stands | Select a shape only inside or after a commissioning act | PA | No |
| 4 | `R3` not suppliable at the carried pin | `2d9130e7…` has no `./persistence` and no NP-04 store; NP-04 line is diverged and reference-only under CV-23 | Decide the re-derived object; authorize any IPD export and/or re-pin; admit the consumer | PA, then IPD-locus act | No |
| 5 | No current implementation authority | NP-06-R1 spent; A2 withholds a new grant | New bounded act after 1–4 | PA | No |
| 6 | `F-7` not satisfied for any current contract | Parts 1, 2, and 4 unproven for current baseline; part 4 also lacks a committed harness historically | Evidence after an authorized implementation, then a determination. Fence tests do not finish this | Determination act | No |
| 7 | `CV-51` blocked | No UI was qualified; enablement prohibited | Separate route/UI act after acceptance | PA | No |
| 8 | Restart / live-IdP not reproducibly proven | Harness absent; D-3 fence | Do not cite req 32 as F-7(4). A committed harness belongs only to item 6, if commissioning happens | n/a until then | No |

Items that are **not** remaining work: rebuilding canonicalization; redesigning `reportId` / `reportKey`; writing a second Reports store in IRR; re-accepting the historical branch; re-litigating IRR PR #42; merging IPD PR #42; converging Gate A; wiring D115; editing the fence “so the comment matches”; rerunning the 228 tests solely to reproduce a recorded historical result.

---

## 7. Recommended next disposition

**Continue deferral under A2 / REG-11 Option C.** (`REC`)

Do not seek a commissioning decision as an output of this investigation. The evidence would support the PA **considering** one later, because the historical implementation is real and largely reusable as a design baseline. It does not compel one. A2 already reserved that choice and refused to make it.

Do not adopt any of these readings:

- “DEFERRED — NOT IMPLEMENTED.” False. It was implemented and branch-qualified.
- “Reports is admitted” or “production-ready.” False. Admission was withheld, the `main` copy was removed, and the current security model and pin do not carry the qualified capability.
- “CV-21 closure means Reports is done.” False. A2 is a disposition closure. The capability remains outside the admitted product.
- “The remaining gap is a technical defect in the 2026-10-02 code.” Not demonstrated. The remaining block is governance, plus proofs and a supplier that the current baseline does not have.
- “Therefore engineering should resume to close the delta.” Not authorized. The delta is real only after a commissioning act. Starting it now would violate A2.

If the PA later wants a decision packet, the honest choice set remains the one A2 already named and did not reopen: keep this deferral (already selected), exclude Reports from v1 by a new act, or commission it by a new act and then walk R1 → R2 → R3 → implementation authority → F-7 → acceptance → CV-51. This report selects none of those.

---

## 8. Evidence index

Verification time: `2026-10-25T07:30:48Z`. Methods: `git fetch` of named commits and branches; `git ls-tree` / `git diff` / `git rev-parse` / `git show`; `gh pr view`; GitHub compare API; GitHub Contents API for IPD `package.json`, `src/persistence/`, `store.ts`, `package.ts`, and `tsconfig.pit-package.json`; direct reads of current `main` sources. Not performed: test execution, build, live HTTP, database, Windows/PowerShell, IPD write, tracker edit.

### 8.1 IRR

| Object | SHA / ref | URL |
|---|---|---|
| Authoritative `main` | `00eda5b390f18408689bf9cb632ce76a02093ac8`, tree `4aa8fa7426b1368dabdb2b196771a321d415b6e8` | https://github.com/ramkivs/iips-review-recovered/commit/00eda5b390f18408689bf9cb632ce76a02093ac8 |
| Qualified implementation | `39dd43ebbd54767c4258513a5dfc2d9c1b861d28`, tree `3fdc29d6775022c8ea586c58cf9a6f0e613911d6` | https://github.com/ramkivs/iips-review-recovered/commit/39dd43ebbd54767c4258513a5dfc2d9c1b861d28 |
| Qualification tip / branch tip | `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b`, tree `0e25371229eff5cb8ae4e6bdc2615260ddf0629c`, ref `refs/heads/arena/01a0f1b3-iips-review-recovered` | https://github.com/ramkivs/iips-review-recovered/commit/6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b |
| Promotion candidate | `4906a6b71f5133d714f0f4c29c89dba22ded37f5`, tree `774f16b986e7e47aa74c92e7bdd477cc6a5cf6bb`, ref `promotion/governed-reports-candidate` | https://github.com/ramkivs/iips-review-recovered/commit/4906a6b71f5133d714f0f4c29c89dba22ded37f5 |
| Unauthorized merge | `47edf6f3db79c6c443caed148121406f33a158b7` — ancestor of `main` | https://github.com/ramkivs/iips-review-recovered/commit/47edf6f3db79c6c443caed148121406f33a158b7 |
| R4-B removal | `20511502f5559847d110d5323a911e2a9f8bdabd`, tree `c2fa64cf3735737216669916dd192b504e933de4` — ancestor of `main` | https://github.com/ramkivs/iips-review-recovered/commit/20511502f5559847d110d5323a911e2a9f8bdabd |
| Fence introduction | `1f7997e5e325d94124f39f7458e27957197cbfb2` — `reports-transport.ts` blob `98147054…` | https://github.com/ramkivs/iips-review-recovered/commit/1f7997e5e325d94124f39f7458e27957197cbfb2 |
| PR #40 D-3 | merged `2026-10-06T20:31:38Z`, merge `e13e543abcfb72ff7a1d36801becbbf2dc1ff7a2` | https://github.com/ramkivs/iips-review-recovered/pull/40 |
| PR #41 promotion scope | merged `2026-10-06T20:49:21Z`, merge `0b961fecbe29ed643c86c1a223fc22ac6d30a115` | https://github.com/ramkivs/iips-review-recovered/pull/41 |
| PR #42 Reports candidate | merged `2026-10-06T21:09:33Z`, 0 reviews, body “NOT authorized for merge” | https://github.com/ramkivs/iips-review-recovered/pull/42 |
| PR #61 no-auth | merged `2026-10-12T10:43:21Z`, merge `139c5b8d24b3a21ba4db4ded044feadfb2ac582b` | https://github.com/ramkivs/iips-review-recovered/pull/61 |
| PR #68 F-3 mechanism | merged `2026-10-12T18:18:17Z`, merge `a95949571ebec598d941edd13f26f6726dc1dc59` | https://github.com/ramkivs/iips-review-recovered/pull/68 |
| PR #81 R4-B | merged `2026-10-13T13:39:38Z`, merge `4b3d5866b9e8a8dcbfda18d8dcdef7e700e6ceeb` | https://github.com/ramkivs/iips-review-recovered/pull/81 |
| PR #251 A2 publication | merged `2026-10-25T05:27:56Z`, merge `8470c8ae9ea315851c4a57d6de6e2763716e58fa` | https://github.com/ramkivs/iips-review-recovered/pull/251 |
| PR #252 A2 receipt | merged `2026-10-25T05:31:14Z`, merge `8d715f5b24fa04f6a9e28cb5e4f769c7fd5007fd` | https://github.com/ramkivs/iips-review-recovered/pull/252 |
| PR #253 residual cells T-1..T-4 | merged `2026-10-25T06:26:02Z`, merge `00eda5b…` | https://github.com/ramkivs/iips-review-recovered/pull/253 |

Current `main` paths read: `frontend/server/reports-transport.ts`, `frontend/server/reports-api.test.ts`, `frontend/server/reports-transport.test.ts`, `frontend/server/executive-transport.ts` (dispatch at 755–759), `frontend/server/owner-context-unavailable.ts`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/src/app/routes.ts`, `frontend/src/app/navigation.ts`.

Governance texts read on `main`: A2 disposition; Option C decision; D-3 acceptance §§1–11; promotion-scope status line; Gate B investigation §6.3; F-7 §4.7 of `IIPS_v3.0_OWNER_CONTEXT_PA_DECISION_FINAL.md` (policy text; Gate B investigation notes that file still carries a preparation-time “NOT EFFECTIVE” banner and relies on the PR #68 mechanism record for operative Reports limits — preserved, not settled here); tracker header, §8.4, §16.4.2 CV-21 row, §16.4.4 CV-51 row, §16.106, and the PR #253 §18/§19 annotations.

### 8.2 IPD

| Object | SHA / ref | URL |
|---|---|---|
| IPD `main` | `4b5c65a731a66a6fa1260146a55df9ed772953a5`, tree `cf5e85856009360de3ffb9614970c383a26d73ba` | https://github.com/ramkivs/iips-production-market-data/commit/4b5c65a731a66a6fa1260146a55df9ed772953a5 |
| Carried pin | `2d9130e76bb0dc89daeefabaf297e27bdaa84250`, ancestor of IPD `main`, 59 behind. `package.json` blob `51796e63280c1abb368c27bf8811cc6bad46e132` (identical blob on IPD `main`) | https://github.com/ramkivs/iips-production-market-data/commit/2d9130e76bb0dc89daeefabaf297e27bdaa84250 |
| Alias pin | `70b24f029842a7e9b7f615e4d9df7376fd4ff817`, ancestor, 208 behind | https://github.com/ramkivs/iips-production-market-data/commit/70b24f029842a7e9b7f615e4d9df7376fd4ff817 |
| NP-04 line | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`, branch `np04-governed-persistence-windows`, tag target of `iips-pin-np04-2e11fa3b`. Diverged: 26 ahead / 210 behind, merge-base `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | https://github.com/ramkivs/iips-production-market-data/commit/2e11fa3b689d1a3674a5e4ba1f1de9a559e20494 |
| IPD PR #42 | CLOSED unmerged `2026-10-24T12:47:36Z`. Not a Reports PR | https://github.com/ramkivs/iips-production-market-data/pull/42 |

### 8.3 Compare results this pass

| Comparison | Result |
|---|---|
| `6a8afbb2…` vs IRR `main@00eda5b…` | diverged; 28 ahead / 669 behind; merge-base `19b42e71…` |
| `47edf6f3…` vs IRR `main` | ahead (main contains it); behind 0 |
| `20511502…` vs IRR `main` | ahead; behind 0 |
| `4906a6b7…` vs IRR `main` | ahead; behind 0 |
| `2e11fa3b…` vs IPD `main@4b5c65a7…` | diverged; 26 ahead / 210 behind; merge-base `4d3e1cdc…` |
| `2d9130e7…` vs IPD `main` | ahead; behind 0; main is 59 ahead |
| `70b24f02…` vs IPD `main` | ahead; behind 0; main is 208 ahead |

### 8.4 Claims not independently verified this pass

1. **Executed results (`SR`).** 32/32 PASS, 228/228 executed passes, 14/14 equivalence against published `reportKey.js`, Process A/B counts, typecheck exit 0, full-regression 543/2, R4-B 688/688, and any cited CI run. This pass verified that the code, the 228-case inventory, the 14 vectors, and the records exist and agree with each other. It did not run them.
2. **All-branch census (`SR`).** The prior reconciliation’s 41-of-203 identical-blob sweep was not repeated. Material named refs were.
3. **Deleted refs (`UQ`).** A promotion act that existed only on a since-deleted ref cannot be proven absent.
4. **Build emission at `2e11fa3b…` (`INF` from config only).** `prepare` is configured to compile `src/persistence/package.ts`. This pass did not run the build. `dist/` absence in the git tree is expected for a `prepare` artifact and proves nothing by itself.
5. **Who merged IRR PR #42, and why (`UQ`).** Metadata shows a merge with 0 reviews under a do-not-merge condition. Motive is not in the objects examined and is not needed for any open gate.
6. **Live deployment behavior (`UQ`).** No server was probed. Route statements are source and test-definition level.
7. **F-record banner (`UQ` as a banner question).** `OWNER_CONTEXT_PA_DECISION_FINAL.md` still carries its preparation-time not-effective banner. Operative Reports limits used here are Option C, the PR #68 mechanism as relied on by the Gate B investigation, and A2. This pass does not settle the banner.
8. **Prior geometry figures.** “663 behind” in the 2026-10-24 reconciliation was measured at `main@c0fbfb7c…`. This pass re-measured at `00eda5b…` and records **669 behind**. The increase is consistent with later documentation merges; it does not change the ancestor finding.

---

*End of investigation. No authority rendered. A2 remains operative: Reports deferral reaffirmed; REG-11 Option C retained; historical NP-06 work preserved as branch-scoped evidence; current `main` admits a refusal fence, not a Reports capability.*
