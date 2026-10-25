# IIPS v3.0 CAP-03 DQ-4 Pin Reconciliation and Freeze-Readiness Record

**Record ID:** `IIPS-V3-CAP03-DQ4-PIN-RECONCILIATION-AND-FREEZE-READINESS-2026-10-25-01`  
**Date:** 2026-10-25  
**Repository locus:** IRR — `ramkivs/iips-review-recovered`  
**Tracker locus:** §16.119 (`CV-CORR-99`, `CHG-2026-10-25-24`)  
**Status:** IRR-side execution/readiness record. **This is not a PA freeze act and does not establish the DQ-4 final QE freeze.**

## 1. Outcome

This pass completes the repository-side pin reconciliation that can be established from the verified
remote state and the effective CAP-03 record:

1. The **primary** IPD package pin is advanced from
   `2d9130e76bb0dc89daeefabaf297e27bdaa84250` to the verified IPD commit
   `8eec74ae27cda09f3c368b9c299895eae41554db`.
2. The **broker-import alias** remains deliberately distinct at
   `70b24f029842a7e9b7f615e4d9df7376fd4ff817`. A simple re-pin to modern IPD is not merely
   unverified: it is technically incompatible with IRR's required raw-source broker build because
   modern IPD packages publish only `dist/package`.
3. A package-consumer guard now protects both exact pins and the fourteen raw source files
   required from the alias by `frontend/tsconfig.broker-import.json`.
4. A new cross-repository harness run against the actual merged-main IRR adapter source and the
   actual IPD provider source at the commits below passes **15/15**. The earlier IPD PR #89
   15/15 harness remains accurately characterized as pre-merge evidence; it is no longer the only
   harness basis.
5. **The DQ-4 final QE freeze is not established.** The candidate inputs are identified and
   Linux-qualified, but the exact final repository-pin designation, the general DQ-6b alias
   disposition, the alias-modernization/split-baseline question, exact-freeze H-12
   regeneration/validation/adoption, native-Windows canonical evidence, and the Gate 4/CAP-03
   freeze sequence remain unresolved as specified in §8.

## 2. Authority, scope, and non-decisions

The governing effective CAP-03 record is
`docs/integration/IIPS_v3.0_CAP03_ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md`,
especially DQ-4 §5. It deferred final QE pin designation until the authorized DR-2 and DR-4r
implementation commits had landed in both repository loci. That implementation prerequisite is now
satisfied. This pass was executed under the 2026-10-25 one-pass DQ-4 pin-reconciliation directive.

The proposed DQ1–DQ7 packet remains a proposal, not an effective PA act. In particular, this
record does **not** invent or render a general DQ-6b decision. Preserving the alias in this pass is
an evidence-based preservation of the presently admissible baseline because the alternative
simple re-pin demonstrably breaks the broker build. Whether a final QE freeze may permanently
use that split baseline, or whether the alias must first be modernized through an authorized IPD
package-surface change or an IRR broker-build redesign, remains the exact unresolved DQ-6b
question.

This is IRR-owned work. No IPD file was modified. No IPD branch, pull request, package, manifest,
schema, migration, protocol, route, or source was changed by this pass.

## 3. Independently revalidated bases

| Repository | Verified remote `main` | Tree | Open PRs | Latest relevant CI |
|---|---|---|---:|---|
| IRR `ramkivs/iips-review-recovered` | `445f0f5813040ef5641af0f7e0556713629ce67a` | `c5be92d1ceef72a94b3b13b4de615fa44ff33654` | 0 | run `40200132115`, success |
| IPD `ramkivs/iips-production-market-data` | `8eec74ae27cda09f3c368b9c299895eae41554db` | `4eba29029f8d95cfe483e615a7047426b298ce50` | 0 | run `40196407747`, success |

The IPD DR-2 provider implementation merge is PR #89 merge commit
`79d06e3c5da60da2a234b7ac18c35df848bf9d11`, tree
`e8d361c97ba4fc24f18ecc0245f81332cc31ec92`. The four intervening commits to current IPD `main`
change only tracker/evidence paths. The package manifest, provider store, Q1 conformance test,
IPC, and contract blobs are identical at `79d06e3c…` and `8eec74ae…` (see evidence `47`).

## 4. Pin semantics and reconciliation

### 4.1 Primary pin — advanced

| Field | Before | After |
|---|---|---|
| Location | `frontend/package.json` and `frontend/package-lock.json`, dependency `iips-production-market-data` | Same |
| Commit | `2d9130e76bb0dc89daeefabaf297e27bdaa84250` | `8eec74ae27cda09f3c368b9c299895eae41554db` |
| IPD tree | `4658699180ef161aae3c1b33d3946e918d6fb9b2` | `4eba29029f8d95cfe483e615a7047426b298ce50` |
| Lag to verified IPD `main` | 65 commits behind, ancestor | 0 |
| Contract boundary | Public built package only: `./portfolio-ui`, `./pit`, `./d114-non-production` | Identical |
| IPD `package.json` blob | `51796e63280c1abb368c27bf8811cc6bad46e132` | Identical |
| Published files | `['dist/package']` | Identical |
| Runtime dependency | `react-router-dom ^6.30.6` | Identical |
| Package scripts | Same build/test/package-consumer scripts | Identical |

The primary pin supplies the governed public package surface consumed by IRR's PIT, D114, and
portfolio-UI importers. It is **not** the mechanism by which the IRR DR-2 adapter reaches the IPD
durable provider: the provider store and IPC implementation are IPD server-side/internal, and IRR
consumes them through its local IPC adapter. The re-pin therefore does not activate a route,
admit a durable read, or execute the IPD provider inside the IRR process.

The target was not selected by recency alone. It is the independently verified current IPD remote
state; it contains PR #89 as an ancestor; the post-#89 commits do not alter code, tests, package
configuration, migrations, or contracts; the exported package roots show no diff from the former
pin; and both repositories pass the qualifications in §6. The 62-path repository diff from the
former pin consists of evidence/docs, test-runner support, Gate A′ internal provisioning, the
internal provider store, and tests. None changes the public package export map. Candidate and
actual-branch IRR validation passes, and the production bundle retains the same principal JS asset
name and reported size (`index-D7KYElFH.js`, 1,609.84 kB; gzip 226.69 kB).

The lockfile records the new resolved commit and integrity
`sha512-RlYaRz+MlKA+k5VKGhbLLnvjzOBEPTlfV9KuBLw1b8gj/JEXzQMR/SqqDMsbat2inPvaDbekOW6TjIEFVy46vQ==`.
It also removes a stale `engines.node >=22.5.0` entry from the primary package's lock record; the
IPD package manifest at both the former and target commits declares no `engines` field.

### 4.2 Broker-import alias — preserved as a distinct baseline

| Field | Before | After |
|---|---|---|
| Location | `frontend/package.json` and `frontend/package-lock.json`, dependency `iips-broker-import` | Same |
| Commit | `70b24f029842a7e9b7f615e4d9df7376fd4ff817` | **Unchanged** |
| IPD tree | `cc0f0117822850f9046e9a51bd05c1d45f80cd57` | **Unchanged** |
| Lag to verified IPD `main` | 214 commits behind, ancestor | 214 commits behind, ancestor |
| Role | DB-C1 broker-preview raw-source compatibility baseline | Same |
| IPD `package.json` at pin | No `exports`; no `files` restriction | Same installed baseline |

`frontend/tsconfig.broker-import.json` compiles raw TypeScript out of
`node_modules/iips-broker-import`, including the pinned commit's
`frontend/src/features/portfolio/import/**`, `src/identity/{security_master,mapping_store,quarantine}.ts`,
and `src/contracts/{provenance,types}.ts` layout. Fourteen installed source inputs are required.

At `2d9130e7…`, `79d06e3c…`, and `8eec74ae…`, IPD's package manifest restricts publication to
`files: ['dist/package']`. Installing either modern commit under the `iips-broker-import` alias
therefore provides essentially the package manifest and built `dist/package`, not the raw source
files named by the broker tsconfig. A disposable candidate with **both** pins at `8eec74ae…`
installed successfully but failed before tests in `build:broker-import` with `TS18003: No inputs
were found` (evidence `20`–`21`).

Alias advancement is also not semantically neutral. Between `70b24f02…` and `8eec74ae…`, the
broker mapper's lineage classification changes from `REAL` to `UNCLASSIFIED`, and the
identity/contract source surface changes. A modernization would require either:

- an authorized IPD package change that publishes an admissible broker source or built subpath
  suitable for IRR's broker build; or
- an authorized IRR redesign that stops compiling installed raw IPD sources and instead consumes
  a governed built export,

followed by broker-preview/lineage requalification. Neither change is authorized or implemented
by this IRR pin-reconciliation pass.

The new `brokerImportPackageConsumer.test.ts` guard asserts the exact alias commit in the manifest
and lockfile, verifies that it remains distinct from the primary, checks that the installed alias
is not restricted to `dist/package`, and verifies all fourteen required raw sources exist.

### 4.3 Separate Reports persistence specifier — unchanged and out of DQ-4 pin scope

`iips-np04-governed-persistence` remains at
`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`. It is the separately decided Reports/NP-04
dependency, not a CAP-03 QE pin. Only the Reports integration test's exact primary-pin expectation
and current-state descriptions in the NP-04 boundary record were updated so they do not continue
to identify the superseded primary coordinate. No Reports behavior, owner rule, route, store, or
NP-04 specifier changed.

## 5. IRR changes in this pass

Modified tracked files:

- `frontend/package.json` — primary pin only.
- `frontend/package-lock.json` — primary resolved commit/integrity and stale lock `engines`
  metadata correction generated by `npm install`.
- `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` — primary expectation,
  explicit distinct-alias guard, and fourteen-source guard.
- `frontend/server/reports/reports-persistence-integration.test.ts` — current primary expectation;
  exact NP-04 and broker expectations retained.
- `frontend/server/reports/persistence-port.ts` — current-state primary-pin descriptions only.
- `frontend/src/api/brokerImport.ts` — dependency-note current-pin description only.
- `docs/OPERATOR_RUNBOOK.md` — primary pin and freshly measured local verification figures.
- `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` — §16.119.

Added:

- this record; and
- the DQ-4 evidence annex at
  `evidence/integration/cap03-dq4-pin-reconciliation-2026-10-25/` (logs `00`–`50`, with no
  `09`; preserved failures and correction notes included).

No IRR adapter, G2 contract, IPC client, port interface, route, transport, owner-context fence,
schema, migration, broker tsconfig, or runtime behavior file was changed.

## 6. Qualification evidence

### 6.1 Baselines

On IRR `445f0f58…` before the re-pin (evidence `00`–`08`):

- `npm ci`, both typechecks, production build, and direct strict adapter `tsc` exited `0`;
- focused user-portfolio: **173/173** passed;
- package/broker/PIT/Reports subset: **204/204** passed;
- full `npm run test:ci`: **106 files / 1,349 tests** passed; report guard confirmed 0 failed.

On IPD `8eec74ae…` in the read-only clone (evidence `10`–`15`):

- `npm ci`, `npx tsc --noEmit`, `npm run build`, and `npm run test:package-consumer` exited `0`;
- Q1 Node test run: **30/30** passed;
- full `npm test`: **924 executed, 923 passed, 0 failed, 1 skipped**.

### 6.2 Candidate experiments (disposable worktree)

- Both pins at `8eec74ae…`: `npm install` exited `0`, but the focused command failed in
  `build:broker-import` with `TS18003` before tests (evidence `20`–`21`).
- Primary only at `8eec74ae…`, alias retained: before updating obsolete guard constants, the
  focused run passed **375/377** tests; the only two failures were exact old-primary assertions
  (evidence `22`–`23`).
- After candidate guard updates, focused tests passed **377/377**; typechecks and build exited
  `0`; full suite passed **106 files / 1,349 tests**; report guard and direct strict adapter
  `tsc` exited `0` (evidence `24`–`30`).

### 6.3 Actual IRR branch

The first actual-branch attempt (evidence `32`, `36`–`37`) exposed two branch test-authoring
omissions: the Reports exact-primary expectation had not yet been updated, and the new alias
source list initially used modern rather than pinned-commit paths. Those failures are preserved;
the correction is documented in evidence `39`. No assertion was weakened.

Corrected actual-branch results (evidence `40`–`46`, plus post-comment checks `49`–`50`):

- focused package/broker/PIT/Reports/user-portfolio run: **21 files / 378 tests** passed;
- `npm run typecheck`: exit `0`;
- `npm run typecheck:replay-server`: exit `0`;
- `npm run build`: exit `0`, 142 modules, existing non-fatal >500 kB chunk warning;
- full `npm run test:ci`: **106 files / 1,350 tests** passed (one more test than baseline because
  of the new alias guard);
- `node .ci/assert-tests.js .vitest-report.json`: **106 files / 1,350 tests / 0 failed**;
- direct strict adapter/test `tsc`: exit `0`;
- post-comment package/Reports focus: **2 files / 11 tests** passed; typecheck exit `0`.

Warnings are limited to the existing non-fatal bundle-size warning and test-environment warnings
recorded in the logs (including Node's SQLite experimental warning and React Router future-flag
notices). No test was skipped in the IRR Vitest totals above.

### 6.4 Current bilateral harness

Evidence `16`–`19` contains a newly executed cross-repository harness using the unmodified IRR
adapter modules at merged IRR `main@445f0f58…` against the IPD provider built from
`8eec74ae…`. Result: **15/15 PASS**, exit `0`. The preserved harness script has SHA-256
`f077e6b470d44e83495f8233cd88616182502952b4cedd0298726de065727002` and git blob
`5a898d369a039e093ebccbf251bfe11cd214b70b` in this evidence annex.

The first attempted invocation did not start because of a relative evidence-path error after a
working-directory change; it is preserved as evidence `17`. The corrected absolute-path rerun is
evidence `18`.

This current-source harness is stronger provenance than relying solely on the earlier PR #89
harness, which was executed before IRR PR #265 merged. It remains Linux/source-level conformance
evidence, not native-Windows host qualification, Gate 4 execution, QE credit, or operational
admission.

## 7. Frozen-boundary read-back

The DQ-4 branch does not alter these IRR blobs from `445f0f58…`:

| IRR path | Git blob |
|---|---|
| `frontend/server/user-portfolio/ipcPortAdapter.ts` | `1e20e98023f20f80ed61d8d32d070fdde677d3c7` |
| `frontend/server/user-portfolio/ipcPortAdapter.test.ts` | `46243a7a79ba3b19cd4d2b8a56df8905aba220f8` |
| `frontend/server/user-portfolio/userPortfolioContract.ts` | `e6b57bb8a021d8eb4b9b7572d12affc7de66be0b` |
| `frontend/server/user-portfolio/ipcClient.ts` | `c1b885e3173132685090bcd2cbfa4aa8c87fa4ca` |
| `frontend/server/user-portfolio/userPortfolioPort.ts` | `ba0001e88c83b070e4f16a3cdb35d34c82ec0200` |
| `frontend/server/user-portfolio-transport.ts` | `51704c12a467cd2f718a030b5036bc55c9afa73f` |
| `frontend/server/owner-context-unavailable.ts` | `cb8db45d668d28cee7e0a52721001d579a872733` |
| `frontend/tsconfig.broker-import.json` | `a339c9c4def365f0b80295bb32ad74cf2f95a9bd` |

Key IPD blobs at `8eec74ae…`:

| IPD path | Git blob |
|---|---|
| `package.json` | `51796e63280c1abb368c27bf8811cc6bad46e132` |
| `src/persistence/portfolio_store.ts` | `540d49f2deb2c8d600b5b866675d145cf76a1e46` |
| `tests/q1_ipc_read_contract_conformance.test.ts` | `eddedd56449d6d0ac27dd394bd2a7262d0cb0c24` |
| `src/ipc/entrypoint.ts` | `ae3edd12e1199845f6b5fe059fa79fed6245ae32` |
| `src/ipc/dispatch.ts` | `27becc76749f5b11a37ca4e6254d58132620f57f` |
| `src/ipc/protocol.ts` | `f4dc72b12ed9d618d1cfde836160f992ff1be9a5` |
| `src/ipc/endpoint.ts` | `e565aa5b343266f62ffd411d17d74c89b9f29324` |
| `src/contracts/types.ts` | `a644c83351b030b0e76d76642475420ea7ef07c0` |
| `src/persistence/migrations/001_initial_schema.ts` | `f594a18264c45ccdcbfa2381592820a72d3c453b` |
| `src/persistence/migrations/002_audit_event_sequence.ts` | `932af8e603c4be41c9f0d8a6b051f41836c1fee8` |
| `src/persistence/migrations/003_local_principal_bindings.ts` | `32b125bf962bb76a6ae59d3b262203dbbb988197` |
| `src/persistence/migrations/004_portfolio_contribution_provenance.ts` | `6bad5a5095b6bb94ce91a86a4b65f7ab915c516c` |

DR-4r/DQ-3 Option B remains in force exactly: empty contribution sets may pass the admitted read
path; non-empty contribution sets refuse. No contribution projection or QE-6 admission is granted.
No production fence, route, schema, migration, protocol, or durability claim was changed.

## 8. Candidate freeze-input register — not a final freeze manifest

| Candidate input | Exact qualified value | Status |
|---|---|---|
| IPD repository candidate | `8eec74ae27cda09f3c368b9c299895eae41554db`, tree `4eba29029f8d95cfe483e615a7047426b298ce50` | Qualified source candidate; **not designated final QE pin by a freeze act** |
| IPD implementation merge | PR #89, `79d06e3c5da60da2a234b7ac18c35df848bf9d11`, tree `e8d361c97ba4fc24f18ecc0245f81332cc31ec92` | Ancestor of candidate; code/test/package blobs carry forward |
| IRR pre-DQ-4 base | `445f0f5813040ef5641af0f7e0556713629ce67a`, tree `c5be92d1ceef72a94b3b13b4de615fa44ff33654` | Verified merged-main source for the current harness |
| IRR candidate after this pass | The resulting merge commit/tree of the DQ-4 PR, to be recorded exactly in tracker §16.120 | **Not a final QE designation** |
| Primary npm pin | `8eec74ae27cda09f3c368b9c299895eae41554db` | Reconciled and guarded |
| Broker alias npm pin | `70b24f029842a7e9b7f615e4d9df7376fd4ff817` | Preserved distinct baseline; guarded |
| Reports NP-04 specifier | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | Separate boundary; unchanged |
| Linux evidence | Annex `00`–`50` as described above | Qualified; not native-Windows evidence |

### Remaining exact blockers to a DQ-4 final QE freeze

1. **No effective exact freeze designation.** No governing act yet designates the candidate IRR
   and IPD commits/trees as the final QE repository pins. Repository execution pins must not be
   conflated with the npm dependency pins.
2. **DQ-6b remains unanswered as a general disposition.** A final freeze must either expressly
   admit the split primary/alias baseline for QE or require alias modernization first.
3. **Alias modernization is technically unresolved if required.** It needs an authorized IPD
   package-surface change or IRR broker-build redesign, plus lineage/preview requalification.
4. **H-12 is not adopted for the exact resulting freeze.** The mandatory 32 IPD + 24 IRR = 56
   structure must be regenerated/validated against the exact post-DQ-4 IRR commit (whose
   manifest/lock blobs changed) and the designated IPD commit, then adopted through the proper
   sequence.
5. **Native-Windows canonical evidence is absent.** All new execution in this pass is Linux
   sandbox evidence.
6. **Gate 4/CAP-03 sequencing is not reconciled by this record.** Gate 4 remains authorized but
   not started; host S2 and related sequence steps have not been executed. This record does not
   decide whether the final freeze precedes, accompanies, or follows those steps.
7. **No bilateral IPD-locus freeze mirroring exists.** This IRR record cannot by itself freeze
   IPD. The resulting IRR merge identity also can only be recorded after publication, in §16.120.

Accordingly, the accurate status is: **repository-side freeze inputs are qualified, but DQ-4
final QE freeze readiness in the operative/freeze-established sense remains blocked by items
1–7 above.** No final QE freeze manifest is published by this record.

## 9. Boundary status after this pass

| Boundary | Status |
|---|---|
| DR-2/DQ-1 Option A bilateral source/test conformance | Published in both loci; current-source harness 15/15 |
| DR-4r/DQ-3 Option B | Unchanged — empty contributions pass; non-empty refuse |
| DQ-4 primary pin | Reconciled to `8eec74ae…` |
| DQ-4 broker alias | Preserved at `70b24f02…`; modernization unresolved |
| DQ-4 final QE freeze | **NOT ESTABLISHED** |
| H-12 | **NOT ADOPTED** for an exact final freeze |
| Gate 4 | **AUTHORIZED — NOT STARTED** |
| QE count | **0/11** |
| Gate 5 | **NOT INITIATED / NOT ADMITTED** |
| Durable-read acceptance / production eligibility | **NOT ESTABLISHED** |
| Host operations | Not begun; host package not regenerated, repackaged, or republished |

## 10. Next dependency-respecting action

Render and record the authoritative **DQ-6b/freeze disposition**: decide whether final QE may
freeze the qualified split primary/alias baseline, or whether alias modernization must first occur
through an authorized IPD package-surface change or IRR broker-build redesign. Only after that
disposition should the exact candidate repository commits be designated and H-12 be regenerated,
validated, and put forward for adoption in the Gate 4 sequence.
