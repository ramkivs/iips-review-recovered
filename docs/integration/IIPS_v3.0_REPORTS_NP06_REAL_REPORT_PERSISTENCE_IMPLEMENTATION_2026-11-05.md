# IIPS v3.0 — NP-06 Reports: Real Report Persistence Implementation Record

| Field | Value |
|---|---|
| Record | `IIPS-V3-REPORTS-NP06-REAL-REPORT-PERSISTENCE-IMPLEMENTATION-2026-11-05-01` |
| Record type | **IMPLEMENTATION AND VERIFICATION RECORD** |
| Authority | **PA IMPLEMENTATION AUTHORIZATION — NP-06 REAL REPORT PERSISTENCE (2026-11-05)** |
| Date | `2026-11-05` (Asia/Calcutta) |
| Governing acts | `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01`; `IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01`; `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (R3-Option B); `IIPS-V3-REPORTS-NP06-F7-QUALIFICATION-AND-ACCEPTANCE-2026-10-25-01` |
| Scope | Bounded non-production producer-to-persistence invocation for **genuine certified `CrossSectorEngine` reports** |
| Production admission | **NOT ADMITTED / NOT PRODUCTION-READY** |
| UI write capability | **NONE** — the Reports UI remains read-only |
| Persistence authority | **NP-04 only** — no Reports-local store |

---

## 1. Authorized scope (verbatim)

> **PA IMPLEMENTATION AUTHORIZATION — NP-06 REAL REPORT PERSISTENCE**
>
> I explicitly authorize implementation and verification of the missing producer-to-persistence invocation identified in your NP-06 end-to-end investigation.
>
> Proceed in one pass.
>
> Scope
>
> 1. Reuse the existing certified `CrossSectorEngine` execution and its genuine `pr.reports` output.
> 2. Reuse `composeReportContent` for report-content composition.
> 3. Persist genuine reports through the existing NP-06 persistence adapter and NP-04 governed `createInstance` boundary.
> 4. Reuse the existing certified inputs and execution semantics. Do not introduce duplicate engine logic.
> 5. Prefer the smallest safe operator-controlled invocation. Do not introduce a new public write route or UI write capability unless technically indispensable and separately justified.
>
> Mandatory constraints
>
> - NP-04 retains exclusive persistence ownership.
> - NP-06 Reports UI remains read-only.
> - No synthetic, fabricated, manually reconstructed, or dummy report content.
> - No Reports-local persistence.
> - No production operations.
> - Preserve existing governance, carrier identity, audit and durability semantics.
> - Do not repeat completed investigations or existing qualification work.
> - Use targeted tests; no unnecessary full backend regression suite.
>
> Execution and verification
>
> Implement, test, document, commit and publish the narrowly scoped change.
>
> Verify:
>
> 1. Genuine `CrossSectorEngine` reports reach NP-04 persistence.
> 2. Reports API retrieves the persisted artifacts.
> 3. Artifacts survive a separate-process restart.
> 4. Reports UI displays the actual persisted reports.
> 5. Existing targeted composition and persistence tests pass.
> 6. Repository and remote commit evidence are independently verified.
>
> Record this PA authorization in the appropriate governance evidence.
>
> Do not stop at a proposed design or implementation report. Complete the authorized work and publication workflow. Do not merge without the repository's required review process.

---

## 2. Implementation

### 2.1 Smallest safe invocation — no new public write route

`frontend/server/reports/persist-real-reports.ts` is a one-off, operator-run script. It is **not** an HTTP route and adds **no** UI write control. It is invoked from `frontend/` with `tsx`:

```bash
npx tsx server/reports/persist-real-reports.ts                 # dry run (no writes)
npx tsx server/reports/persist-real-reports.ts --commit        # persist the genuine reports
npx tsx server/reports/persist-real-reports.ts --verify        # read back in a new process
npx tsx server/reports/persist-real-reports.ts --verify --api http://127.0.0.1:8787
```

### 2.2 What it reuses (no duplicate engine logic)

| Existing component | Role in the invocation |
|---|---|
| `computeCertifiedPlatform()` in `frontend/server/executive-transport.ts` | The certified frozen sector-engine execution and the genuine `CrossSectorEngine` output (`pr.reports`). This is the same function the certified read routes call. |
| `composeReportContent()` in `frontend/server/reports/composition.ts` | The existing NP-06 composition stage. The script does not re-derive canonicalization, `reportKey`, or provenance. |
| `ReportsPersistence.persistNew()` in `frontend/server/reports/persistence.ts` | The existing NP-06 persistence adapter. It validates the composed artifact and calls the NP-04 port. |
| `resolveAuthoritativeNp04Port()` in `frontend/server/reports/np04-adapter.ts` | The existing NP-04 governed `createInstance` boundary. No substitute store is constructed. |
| `resolveReportsOwnerContext()` in `frontend/server/reports-owner-resolver.ts` | The approved owner pair, resolved from the server-owned carrier (`IIPS_REPORTS_OWNER_PATH`). The script does not change the carrier or the pair. |

### 2.3 Safety properties

- **Genuine content only.** The only report input is `pr.reports` from the certified `CrossSectorEngine`. There is no fixture, reconstruction, or manual body in the script.
- **NP-04 exclusive ownership.** The script calls `ReportsPersistence.persistNew()` → `createInstance`; it never constructs a Reports-local store.
- **Read-only UI.** No UI component, route, or client method was changed to add a write capability.
- **Duplicate refusal.** Before writing, the script queries the owner's existing artifacts and refuses any report whose `reportKey` is already persisted, unless `--force` is supplied. This prevents accidental duplicate instances.
- **New-process read-back.** `--verify` opens a fresh NP-04 store handle in a new process and reads the artifacts back. With `--api`, it also checks that the running Reports API returns the same artifact count.
- **No production operation.** The script is a local operator procedure. It does not deploy, promote, or admit anything to production.

### 2.4 Files changed

| Path | Change |
|---|---|
| `frontend/server/reports/persist-real-reports.ts` | **NEW** — operator-controlled producer-to-persistence invocation. |
| `frontend/server/reports/real-report-persistence.test.ts` | **NEW** — targeted real-producer → NP-04 persistence and store-reopen test. |
| `frontend/src/features/reports/ReportsRealData.test.tsx` | **NEW** — targeted live UI test against the actual persisted artifacts (skipped unless `IIPS_REPORTS_API_URL` is set). |
| `frontend/tsconfig.replay-server.json` | Include the new server script and test in the Stage A replay-server typecheck. |
| `docs/OPERATOR_RUNBOOK.md` | Operator note for the new invocation; no database location prescribed. |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | Governance record §16.250 (`CV-CORR-230`, `V2040`–`V2045`). |
| This record | Implementation and verification evidence. |

No Reports implementation, NP-04 implementation, route table, UI write path, carrier, owner pair, or governance decision was changed.

---

## 3. Verification evidence

All verification used a **temporary** NP-04 database (`/tmp/np06-real-verify/reports.db`) and a temporary server-owned carrier. The Windows runtime path `H:\IIPS\runtime\np04\reports.sqlite` was **not** accessed; the Windows host was **not** inspected. The operator can run the same script on Windows with the runtime path.

### 3.1 Genuine producer output (dry run)

The dry run computed the certified platform and produced exactly two genuine reports:

| Engine output ID | Report type | Portfolio ID | Report key |
|---|---|---|---|
| `report-executive-PF-REAL` | `Executive` | `PF-REAL` | `b409cc1a586c68d053ffc54d44cb62bcb0c661e63b12f6be18680a368e51bceb` |
| `report-portfolio-summary-PF-REAL` | `Portfolio Summary` | `PF-REAL` | `3070dc50751d350b7972d1353c0106bffbc0e83472255b6945c326af0899ad2e` |

`existingArtifactCount: 0`; `duplicateReportKeys: []`; no records were written.

### 3.2 Commit — genuine reports reach NP-04

`--commit` persisted both reports through the existing adapter and NP-04 `createInstance`:

| NP-04 `reportId` | Report type | Report key | Version | `supersedesReportId` | Engine output |
|---|---|---|---|---|---|
| `2dbf7a94-5b55-4cb6-9bba-5a13e5d9b472` | `Executive` | `b409cc1a…bceb` | 1 | `null` | `report-executive-PF-REAL` |
| `6edc63b3-b0bc-4bbe-bda6-819ee6610428` | `Portfolio Summary` | `3070dc50…ad2e` | 1 | `null` | `report-portfolio-summary-PF-REAL` |

`persistedCount: 2`. The durable `reportId` is NP-04-minted and distinct from the engine content identifier. The `generatedAt` was the actual invocation instant (`2026-11-05T10:25:39.278Z`).

### 3.3 Separate-process restart — read-back

`--verify` ran as a **new OS process** and opened a fresh NP-04 store handle on the same durable file. It returned `artifactCount: 2` with the same `reportId`, `reportKey`, `reportType`, `portfolioId`, `artifactVersion`, and `engineOutputId` values. This is the new-process durability evidence for the real producer output.

### 3.4 Reports API retrieval

With the transport started on `127.0.0.1:8788` using the same carrier and NP-04 database:

| Request | Result |
|---|---|
| `GET /api/reports/context` | `200` — `{ surfaceName: "NP-06", disposition: "ESTABLISHED", tenantId: "irr-reports-personal", ownerUserId: "owner-irr-reports-personal" }` |
| `GET /api/reports/artifacts?limit=25` | `200` — `data` length `2`, `nextCursor: null` |
| `GET /api/reports/artifacts/2dbf7a94-…` | `200` — the persisted Executive artifact |
| `GET /api/reports/artifacts/2dbf7a94-…/supersession` | `200` |
| `--verify --api http://127.0.0.1:8788` | `status: 200`, `artifactCount: 2`, `note: "API artifact count matches the store read-back."` |

### 3.5 Reports UI displays the actual persisted reports

`frontend/src/features/reports/ReportsRealData.test.tsx` fetched the live context and artifact page from the running API, mounted the real `ReportsWorkspace` with that exact response, and asserted:

- the head table is rendered;
- the empty state is absent;
- each persisted `reportId` has its `report-link-<reportId>` row;
- each row displays the persisted `reportType`;
- every persisted row has `portfolioId === "PF-REAL"`;
- the partition literals `irr-reports-personal` / `owner-irr-reports-personal` are absent from the DOM.

Result: **1/1 passed**. The UI test is skipped when `IIPS_REPORTS_API_URL` is unset, so it does not affect the default suite.

### 3.6 Targeted tests

| Test | Result |
|---|---|
| `server/reports/real-report-persistence.test.ts` (new) | **1/1 passed** — real `CrossSectorEngine` reports → `persistNew` → NP-04; read back after a fresh store handle on the same durable file. |
| `server/reports/reports-artifact.test.ts` (existing) | **56/56 passed** — composition and artifact validation, including the real frozen `ReportingEngine`. |
| `server/reports/reports-persistence-integration.test.ts` (existing) | **5/5 passed** — five-operation NP-04 contract. |
| `server/reports-api.test.ts` (existing) | **3/3 passed** — composed route dispatch and fail-closed behaviour. |

No full backend regression suite was run.

### 3.7 Typechecks

| Check | Result |
|---|---|
| `npm run typecheck` (includes `pretypecheck` broker-import build) | exit `0` |
| `npm run typecheck:replay-server` (now includes the new server script and test) | exit `0` |

---

## 4. Boundaries preserved

- **NP-04 exclusive persistence ownership.** The store is the authoritative `iips-np04-governed-persistence` `GovernedArtifactStore`; the script never constructs a Reports-local store.
- **NP-06 read-only UI.** No UI write capability, route, or client method was added. The persisted reports appear through the existing read-only `/reports` surface.
- **No synthetic or fabricated content.** The only report input is the genuine certified `CrossSectorEngine` output.
- **Governance and carrier identity.** The owner pair is resolved from the server-owned carrier; the carrier and approved pair are unchanged.
- **Durability and audit.** NP-04 continues to assign `reportId`, `artifactVersion`, supersession, and durability. The adapter's validation and provenance checks are unchanged.
- **No production operation.** The verification used a temporary database and a temporary carrier on the build host. The Windows runtime and its database were not accessed or changed.
- **No authority beyond the PA act.** This record does not grant production admission, change the NP-06 capability acceptance, or authorize a public write route. Production admission remains **NOT ADMITTED**.

---

## 5. Operator procedure

From `frontend/`, with `IIPS_REPORTS_OWNER_PATH` and `IIPS_NP04_DATABASE_PATH` set as documented in `docs/OPERATOR_RUNBOOK.md` §3.2:

```bash
npx tsx server/reports/persist-real-reports.ts                 # dry run
npx tsx server/reports/persist-real-reports.ts --commit        # persist once
npx tsx server/reports/persist-real-reports.ts --verify        # new-process read-back
npx tsx server/reports/persist-real-reports.ts --verify --api http://127.0.0.1:8787
```

The script refuses duplicate `reportKey`s unless `--force` is supplied. The `--commit` run is intended to be executed once; a second run creates a new NP-04 instance for identical content, which is why the duplicate refusal exists.

---

## 6. Publication

This record is published on branch `arena/64350977-iips-review-recovered` in PR #438. Final remote head `fc66ec22762924e0b7b24f72bdfd2cac70f0820f` (merge of `origin/main` into the branch). The implementation head `46d0d15ae3b90e2c1c6940148d0eb3b17ed9a0f2` is the implementation commit in that merge. All seven changed paths were read back from the remote at the implementation head and matched the local Git blob IDs byte-for-byte:

| Path | Remote Git blob ID |
|---|---|
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | `b3eac4c1714e676aee12317924802f1977eeccf8` |
| `docs/OPERATOR_RUNBOOK.md` | `27d07ff33f28a01233a84df7a311ab5ea403c30e` |
| `docs/integration/IIPS_v3.0_REPORTS_NP06_REAL_REPORT_PERSISTENCE_IMPLEMENTATION_2026-11-05.md` | `c29a13d8efdb640fff85ad51bfd2670bbcfbcc60` |
| `frontend/server/reports/persist-real-reports.ts` | `291319b78623199c86cccf161441d7ce604493a5` |
| `frontend/server/reports/real-report-persistence.test.ts` | `490adbd61f63b5ee280eda3e26123e641797217d` |
| `frontend/src/features/reports/ReportsRealData.test.tsx` | `1b496c41df67b2545b6bf8529f20169fae1c1dd6` |
| `frontend/tsconfig.replay-server.json` | `b6c882fd2acd33b763c2e2b5e926b3f70e00c4b2` |

The merge brought in `origin/main`, including its §16.249. The tracker conflict was resolved by preserving main's §16.249 verbatim and renumbering this record's section to §16.250 (`CV-CORR-230`, `V2040`–`V2045`). An initial merge-resolution truncation of the tracker was corrected by restoring the full 19,960-line tracker from `origin/main` and re-inserting the renumbered section; the IRR-only static validator passes on the final head.

CI at the final head: `Typecheck · Test · Build` **pass** (2m1s); `Python compile · source/evidence/tracker validation` **pass** (34s). PR state: **OPEN**, `MERGEABLE`, `CLEAN`. The PR is not merged without the repository's required review process.
