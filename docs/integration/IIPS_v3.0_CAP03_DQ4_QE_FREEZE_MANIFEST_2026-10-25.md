# IIPS v3.0 CAP-03 — DQ-4 Final QE Freeze Manifest (interim split baseline)

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-DQ4-QE-FREEZE-MANIFEST-2026-10-25-01` (census before this record: **0**) |
| **Record type** | Freeze **manifest** — the exact artifact a freeze act would bind. **Not** a freeze act |
| **Decision dependency** | `IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01` (**Path A**, interim, guarded) |
| **Governing decision record** | `IIPS-V3-CAP03-DR2-DQ1-PA-DECISION-2026-10-25-01` §5 (freeze sequencing) |
| **Tracker locus** | §16.122 (`CV-CORR-102`, `CHG-2026-10-25-27`) |
| **Status** | **PREPARED AND VALIDATED — NOT ESTABLISHED.** The manifest is now *writable* because the alias disposition is decided. It is not *established* because §7's establishment criteria are not all met |

> **The DQ-4 final QE freeze is NOT established by this record, and must not be cited as if it were.**
> QE remains **0/11**. No qualification credit, acceptance, admission or production eligibility
> attaches to anything here.

---

## 1. Designated final QE pins

These are **designated**, per the Path A determination and the effective CAP-03 record §5 ("at that
later freeze, record the exact commits and trees; no silent re-pin"). Designation is not freeze
establishment (§7).

| Role | Coordinate | Tree | Note |
|---|---|---|---|
| **IPD primary** (qualified tree) | `8eec74ae27cda09f3c368b9c299895eae41554db` | `4eba29029f8d95cfe483e615a7047426b298ce50` | Is IPD `main`; **0 behind**; CI `40196407747` **success** |
| **IPD broker-import alias** (raw-source build) | `70b24f029842a7e9b7f615e4d9df7376fd4ff817` | `cc0f0117822850f9046e9a51bd05c1d45f80cd57` | **214 behind**, ancestor; **interim, guarded**, not modernized |
| **IRR QE consumer** | `ba64b2d5927c2f872560710cf1474c25a5cde0d5` | `5e4262f1cd75bf13b76ced5b45058f31434b5dad` | IRR `main` at preparation; CI `40210071402` **success**; all 24 IRR entries re-verified byte-identical at the freeze-publication merge commit |
| **Reports persistence (separate NP-04 boundary)** | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | `7c1d516a43153f9c4e1b09bfa259d16da1704bb0` | Unchanged; **outside** the CAP-03 QE baseline and not frozen by it |

### 1.1 Exact object identities at the designated IRR coordinate

| Path | Git blob | Bytes |
|---|---|---:|
| `frontend/package.json` | `83058ea202ece8ec60b2674b05b7532ce9a8684b` | 1,888 |
| `frontend/package-lock.json` | `744355e903135fc3ebc0f75b0e122bdf1bbc8358` | 128,442 |
| `frontend/tsconfig.broker-import.json` | `a339c9c4def365f0b80295bb32ad74cf2f95a9bd` | 1,005 |
| `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` | `0a1e58de96fae755a4d054e2aa319ab51e2caba3` | 18,716 |
| `frontend/src/api/brokerHoldingsPreview.ts` | `bf079a1b587cebf582c03a7aa2c99b87cf890f73` | 2,395 |
| `frontend/server/reports/reports-persistence-integration.test.ts` | `4f6024f0ca13f4552507b69e8e1d8224188de6d3` | 8,500 |
| `frontend/server/user-portfolio/ipcPortAdapter.ts` | `1e20e98023f20f80ed61d8d32d070fdde677d3c7` | 27,511 |
| `frontend/server/user-portfolio/userPortfolioContract.ts` (frozen) | `e6b57bb8a021d8eb4b9b7572d12affc7de66be0b` | 31,585 |
| `frontend/server/user-portfolio-transport.ts` (fence) | `51704c12a467cd2f718a030b5036bc55c9afa73f` | 2,716 |
| `frontend/server/owner-context-unavailable.ts` (fence) | `cb8db45d668d28cee7e0a52721001d579a872733` | 684 |
| `.github/workflows/ci.yml` | `b95a502a5056dea49d18a34b67b298181b5b98b6` | 4,338 |

### 1.2 Exact object identities at both IPD coordinates

| Path | Primary `8eec74ae…` | Alias `70b24f02…` |
|---|---|---|
| `package.json` | `51796e63280c1abb368c27bf8811cc6bad46e132` (2,025 B) | `cc5616d30c0179d08abacbc5a2c253cc27d27bfd` (1,001 B) |
| `frontend/src/features/portfolio/import/broker-holdings-mapper.ts` | `297e4a593bb575a5f3f8616788f3aa9e599707a4` (`UNCLASSIFIED`) | `6c8ab71dc9230d22d0d3fe9a13e1809371f396e4` (`REAL`) |
| `src/identity/security_master.ts` | `60030e0c17f8b2a31977ce598c80b18dc52d6727` | `e260fd90d05e5bfcd4bdc037524722c6fccee16d` |
| `src/contracts/types.ts` | `a644c833…` | `11f86dca633bed33da738f525bb8e5c2bb435498` |
| `src/persistence/portfolio_store.ts` | `540d49f2deb2c8d600b5b866675d145cf76a1e46` (34,084 B) | not required by the alias build |
| `tests/g4_run_tests_summary_parsing.test.ts` | `49e901b6ca957a5cc705b42e96cdeaf0365cfbc9` (5,627 B) | absent (pre-Limb A) |
| `scripts/test-summary-parser.mjs` | `15c849fa739765af501182919748e4610acc4157` (682 B) | absent (pre-Limb A) |

---

## 2. Alias disposition — recorded expressly, never as an oversight (condition `C-1`)

> The `iips-broker-import` dependency is a **deliberate, guarded compatibility baseline**, pinned to a
> distinct IPD commit on purpose, and **not** an oversight, a stale pin, or an unmanaged divergence.
>
> It is **interim**. It is not a permanent architecture decision.
>
> It is preserved because (a) it supplies all 14 raw TypeScript sources that
> `frontend/tsconfig.broker-import.json` compiles into `.cache/broker-import`, and (b) that build is
> the sole provider of the live, PO-accepted **DB-C1** `/broker-holdings` preview surface. It cannot be
> re-pinned to the primary coordinate — doing so fails `build:broker-import` with `TS18003` and breaks
> `predev`/`prebuild`/`pretest`/`pretest:ci`/`pretypecheck` for the whole IRR frontend.
>
> Lineage classification is **preserved as-is**: `REAL` at the alias, `UNCLASSIFIED` at the primary.
> No requalification or re-acceptance is performed or implied.

**Divergence is enumerated, not summarised away.** Of the 14 alias raw sources, **10 are byte-identical**
at both coordinates and **4 diverge** — `broker-holdings-mapper.ts`, `broker-import-ingress.ts`,
`src/identity/security_master.ts`, `src/contracts/types.ts`. One diverging path
(`src/identity/security_master.ts`) is **also** a qualified-tree H-12 entry, so the qualified IRR build
contains two distinct `SecurityMaster` byte-sets. This is the strongest single reason the freeze
manifest had to be written against two explicit coordinates rather than one.

---

## 3. Compatibility guard — in force and binding at the freeze (condition `C-2`)

| Guard | Identity | State |
|---|---|---|
| `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` | blob `0a1e58de…` (18,716 B) | **In force.** Asserts `EXPECTED_IPD_PIN_SHA = 8eec74ae…`, `EXPECTED_BROKER_IMPORT_ALIAS_SHA = 70b24f02…`, the distinctness of the two, the 14-entry `REQUIRED_BROKER_IMPORT_SOURCE_FILES` set, and rejection of a `dist/package`-only alias |
| `frontend/server/reports/reports-persistence-integration.test.ts` | blob `4f6024f0…` | **In force.** Asserts the alias specifier at line 84 |
| Guard suite at the designated coordinate | `6 files / 75 tests` | **Green**, exit 0 |

The guard is **extended only by remaining binding at the freeze**. It is not relaxed, narrowed,
skipped or deleted. Any relaxation requires a separate PA act and would void the freeze premise.

---

## 4. Modernization follow-on — a dated, owned state (condition `C-3`)

| Field | Value |
|---|---|
| Tick | `CAP03-DQ6B-FOLLOW-ON-ALIAS-MODERNIZATION` (registered in §16.122) |
| Status | **OPEN — NOT AUTHORIZED — OFF CRITICAL PATH** |
| Scope if ever authorized | Either `B-1` (IPD package-surface change: a governed export or `files` entry admitting the broker sources) or `B-2` (IRR broker-build redesign retiring `tsconfig.broker-import.json`, the `build:broker-import` script, its five `pre`-script wirings, and the `.cache/broker-import` import in `brokerHoldingsPreview.ts`), **plus** the common tail: lineage requalification, DB-C1 preview requalification, guard-test rewrite, toolchain re-validation, bilateral harness re-execution, H-12 re-derivation |
| What it is not | It is not authorized, scheduled, costed or scoped for execution by this record. It creates no expectation of execution |

Until such an act, the split remains **interim but not time-limited**: it is a dated, recorded,
guarded state rather than a permanent default.

---

## 5. H-12 regeneration and validation at the exact candidate commits (condition `C-4`)

| Item | Value |
|---|---|
| Candidate | [`G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json`](G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json) |
| Candidate SHA-256 (exact file bytes) | `d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76` |
| Bytes | 143,813 |
| Structure | **32 IPD + 24 IRR = 56** primary entries; 56/56 **PRESENT**; 0 required-absent |
| Auxiliary sets | 9 criteria references, 10 accepted Gate 3 anchors (preserved at `1cceacff…`) **plus** 10 re-measured at the QE candidate, 17 historical entries, 1 conditional entry (**now present**), 14 alias raw sources |
| Validation | **981 independent checks, 0 failures**, re-derived from the Git object database |
| Validation record | `IIPS-V3-G4-H12-CANDIDATE-VALIDATION-2026-10-25-R5` |
| Adoption | **NOT ADOPTED** — a distinct PA adoption act is required |
| Preserved predecessor | R4 (`G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json`) unmodified, SHA-256 `3eedd70c994271dfc9ac23bd603f7a9e2f273cb1a68d3172cd3a7737344096ae` |

**Two IPD coordinates are enumerated explicitly**, as `C-4` requires: the manifest's
`pinned_bases.IPD_primary_qe_coordinate` and `pinned_bases.IPD_broker_alias_compatibility_coordinate`,
with a `split_baseline` block binding every one of the 14 alias raw sources at the alias coordinate and
recording its identity/divergence against the primary. Path membership of the 56 entries is
**unchanged** from R4; 16 entries carry re-derived bytes at the new coordinates (15 in the 56, plus the
conditional helper transitioning from absent to present). An anchor re-measurement at the QE candidate
is recorded **separately** from the accepted Gate 3 anchor set, which is preserved unmodified — a
measurement, not a silent re-pinning.

**New, material H-12 finding:** the previously blocking mandatory qualified-tree path
`tests/g4_run_tests_summary_parsing.test.ts` is **PRESENT** at the QE candidate (blob `49e901b6…`),
because commit `c62dee81748aaed6416956b2e323ce77d1ff1f3c` ("CAP-02: implement bounded Gate A prime and
Limb A work") is an ancestor of IPD `main@8eec74ae`. R4's "full validation blocked" condition is
therefore **resolved at this candidate** — while the boundary stays intact: presence and digest binding
are content-integrity facts, **not** Limb A acceptance, qualification, Gate 4 credit or QE evidence.

---

## 6. Validation performed this pass

| # | Check | Command / method | Result |
|---|---|---|---|
| 1 | IRR install at the designated coordinate | `npm ci --strict-ssl=false` (sandbox CA workaround, environment only) | exit 0; 190 packages |
| 2 | Broker-import guard suite | `npm test -- server/broker-import` | exit 0; **6 files / 75 tests** |
| 3 | IRR full suite | `npm run test:ci` | exit 0; **106 files / 1,350 tests**, 0 failed |
| 4 | Zero-test guard | `node .ci/assert-tests.js .vitest-report.json` | `OK — 106 test file(s), 1350 test(s), 0 failed` |
| 5 | IRR typecheck | `npm run typecheck` | exit 0 |
| 6 | IRR replay-server typecheck | `npm run typecheck:replay-server` | exit 0 |
| 7 | IRR production build | `npm run build` | exit 0 (138 modules; existing >500 kB chunk warning only) |
| 8 | Strict adapter typecheck | direct `tsc --strict` on adapter + test | exit 0 |
| 9 | IPD typecheck | `npm run build:tsc` at `8eec74ae…` (read-only `/tmp` clone) | exit 0 |
| 10 | IPD suite | `npm test` at `8eec74ae…` | exit 0; `924 tests, 923 pass, 1 skipped, 0 fail` |
| 11 | Bilateral conformance harness | real IRR adapter `ba64b2d…` ↔ real IPD provider `8eec74ae…` over real AF_UNIX IPC | **15/15, exit 0** |
| 12 | H-12 R5 independent validation | 981 checks against the Git object database | **0 failures** |
| 13 | Remote state | `git ls-remote`, `gh run list`, `gh pr list` | IRR `ba64b2d…` CI `40210071402` success, 0 open PRs; IPD `8eec74ae…` CI `40196407747` success, 0 open PRs |

All logs: [`evidence/integration/cap03-dq6b-path-a-2026-10-25/`](../../evidence/integration/cap03-dq6b-path-a-2026-10-25/).
All evidence is **Linux sandbox** evidence.

---

## 7. Establishment criteria — the freeze checklist, item by item

| # | Criterion | State |
|---|---|---|
| 1 | A rendered act answers DQ-6b and states the alias disposition | **MET** — `IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01` (Path A) |
| 2 | The manifest is expressible and states the alias as deliberate and guarded | **MET** — §2 |
| 3 | Exact final pins designated (IPD primary, alias, IRR consumer) | **MET** — §1 |
| 4 | H-12 regenerated and validated against the exact candidate commits, 32 IPD / 24 IRR | **MET** — §5 |
| 5 | Full six-element effectiveness of the DQ-6b decision | **NOT MET** — element 6 (IPD-locus mirror receipt) outstanding |
| 6 | A distinct H-12 **adoption** act | **NOT MET** — candidate only |
| 7 | Host sequence: **S2 → one P-1 provisioning execution → S3 preflight** on the designated native-Windows host | **NOT MET** — not executed; not executable from this sandbox |
| 8 | Native-Windows canonical worktree evidence | **NOT MET** — absent for this chain |
| 9 | Bilateral harness re-execution at the designated pins | **MET** — 15/15 |
| 10 | Remote read-back of everything cited | **MET** for the pre-publication state; post-merge receipt recorded in §16.122 |

**Result: 6 of 10 met. The freeze is NOT ESTABLISHED.** Criteria 5–8 are genuine and none is waived.

---

## 8. Drift rule (DQ-4.4, preserved)

After any freeze act, **drift = STOP and re-designate**. For this interim split baseline the drift
surface is exactly the union of:

1. the 56 H-12 primary entries at their designated coordinates;
2. the 9 criteria references and the 10 accepted Gate 3 anchor identities;
3. all 14 alias raw sources at `70b24f02…`;
4. the two npm specifiers in `frontend/package.json` and `frontend/package-lock.json`;
5. the guard test and the two fence blobs.

Documentation-, tracker- and evidence-only commits that touch **none** of the above are not drift
against the qualified baseline; they are recorded as publication movement. Any change to any item
above — including "harmlessly" advancing the alias — invalidates the freeze and requires a new act.

---

## 9. Non-grants

This manifest **does not**: establish the DQ-4 final QE freeze; adopt H-12; authorize alias
modernization; move or re-pin any dependency; alter lineage classification; relax any guard or fence;
start Gate 4; grant QE credit; initiate or admit Gate 5; lift any `503` fence; claim durable-read
acceptance or production eligibility; initiate any host operation; regenerate or republish the
host-operations package; or write to IPD.

*End of `IIPS-V3-CAP03-DQ4-QE-FREEZE-MANIFEST-2026-10-25-01` — PREPARED AND VALIDATED; NOT ESTABLISHED;
H-12 NOT ADOPTED; QE 0/11.*
