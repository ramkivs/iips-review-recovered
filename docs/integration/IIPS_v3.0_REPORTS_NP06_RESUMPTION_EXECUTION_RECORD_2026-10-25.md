# IIPS v3.0 — NP-06 Reports Resumption Execution Record

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-RESUMPTION-EXECUTION-2026-10-25-01` |
| **Authority** | [`IIPS_v3.0_REPORTS_NP06_RESUMPTION_COMMISSIONING_PA_DECISION_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_RESUMPTION_COMMISSIONING_PA_DECISION_2026-10-25.md) (`IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01`). This record executes that act. It does not render a further decision. |
| **Date** | `2026-10-25` (Asia/Calcutta) |
| **Repository** | IRR `ramkivs/iips-review-recovered`, branch `arena/46addf6b-iips-review-recovered` only. No other branch was created or checked out. |
| **Baseline re-verified before execution** | `origin/main` = local `HEAD` = `00eda5b390f18408689bf9cb632ce76a02093ac8`, tree `4aa8fa7426b1368dabdb2b196771a321d415b6e8`. **0** open IRR PRs. IPD `main` `4b5c65a731a66a6fa1260146a55df9ed772953a5`, tree `cf5e85856009360de3ffb9614970c383a26d73ba`, **0** open IPD PRs. IPD was not written. |
| **Historical objects re-fetched and used as sources, not as a merge** | `39dd43ebbd54767c4258513a5dfc2d9c1b861d28` (tree `3fdc29d6775022c8ea586c58cf9a6f0e613911d6`); tip `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b`. The clone was not unshallowed. |
| **Evidence, not authority** | [`NP06-REPORTS-HISTORICAL-COMPLETION-AND-DEFERRAL-RECONCILIATION-2026-10-25.md`](NP06-REPORTS-HISTORICAL-COMPLETION-AND-DEFERRAL-RECONCILIATION-2026-10-25.md). Findings below that were re-checked this pass are marked as such. Findings carried from that report and not re-opened are marked carried. |

---

## 1. What was reused, and what was refused

Restored **byte-identical** from `39dd43ebbd54767c4258513a5dfc2d9c1b861d28`. Worktree `git hash-object` equals the qualified blob. No edit after checkout.

| Path | Blob |
|---|---|
| `frontend/server/reports/canonical.ts` | `f57fa6a6a57fc1ab74a178babb8aa378cb82778a` |
| `frontend/server/reports/artifact.ts` | `1da89bd46d39ff4e0a2ae124ea5f770a4032e48e` |
| `frontend/server/reports/composition.ts` | `fc9a8fbbdd66bfaf0fa3e9b72c38faa3eca6a647` |
| `frontend/server/reports/reports-canonical.test.ts` | `b411310a4ae62e12573857db62abb7538811f244` |
| `frontend/server/reports/reports-artifact.test.ts` | `cbe6496c18c80071dbdfe323a22c536407f6b8f8` |

These modules import `node:crypto`, each other, and — in the artifact test only — the frozen `ReportingEngine`. They do not import persistence, the transport, or a route. Header comments inside `canonical.ts` describe the historical published package surface. They were not edited, because editing them would break byte-identity. They are not a statement about the current pin.

**Not restored, and not rebuilt:**

| Refused path | Why |
|---|---|
| `frontend/server/reports/index.ts` | Re-exports persistence. Restoring it would surface an unadmitted binding. |
| `persistence.ts`, `persistence-port.ts`, `np04-adapter.ts`, `reports-persistence.test.ts` | The historical boundary test requires pin `#2e11fa3b…` and `import('iips-production-market-data/persistence')`. Current pin `#2d9130e7…` exports `./portfolio-ui`, `./pit`, and `./d114-non-production`, and does not export `./persistence`. Restoring the suite unchanged would fail, and changing the pin or the specifier would be the contract change §3 withholds. |
| Historical authenticated transport | Requires the auth-era principal stack, which is absent on current `main`. `R2` is unbound. |
| Reports UI, navigation, projections | `CV-51` is not authorized. D8 UI work on the qualified tip is not permitted until `F-7` and acceptance. |
| `frontend/server/reports-transport.ts` | Fence blob `981470541812a64c733309f1debec75455d85bee` left byte-identical to `HEAD`. `executive-transport.ts` was not edited. |
| `frontend/package.json`, `frontend/package-lock.json` | Unchanged. Primary pin remains `github:ramkivs/iips-production-market-data#2d9130e76bb0dc89daeefabaf297e27bdaa84250`. Package blob `6274537a81e1496189e629c7e8f371f80144dfec` equals `HEAD`. |

No persistence architecture was added. No IPD object was written. No historical decision record was deleted or amended.

## 2. R1 — ownership source: NOT ESTABLISHED

Re-checked this pass against current `main` documents and the qualified-tip governance record.

- No Reports D-2 §8 contract is on current `main`.
- The Gate B request still records that the cited target-authority instrument is not retrievable. That search was not repeated against the same corpus; no new instrument appeared.
- Qualified-tip governance (`docs/integration/IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md` at `6a8afbb2…`, not on current `main`) records R2/C4 as authenticated `(tenantId, userId)` and withholds implementation authority. It does not supply a no-auth owner source for the F-3 carrier.
- F-3 `OwnerContext` was not mapped to NP-04 `AuthenticatedOwner`. No owner identity, contract, or semantic rule was invented.

**Result: `R1` remains NOT ESTABLISHED. `R1`/`R2` remain DEFERRED as owner-binding requirements.** The further act is the ownership-source act named in the commissioning record §4.

## 3. R2 — transport and NP-04 binding: NOT RECONCILED / NOT RESTORED

The historical authenticated transport cannot be placed on the current no-auth tree without the `R2` contract-shape act. The current dispatch remains `executive-transport.ts` calling the fence. Known Reports routes stay unavailable. The fence was re-executed (see §6). No partial Reports capability was exposed on an active route.

**Result: `R2` remains unbound. No transport replacement is qualified or authorized.**

## 4. R3 — export and pin mismatch: OPEN / NOT ADMITTED

Re-verified this pass:

- IRR pin is `#2d9130e76bb0dc89daeefabaf297e27bdaa84250`. That commit is an ancestor of IPD `main` and declares no `./persistence` export (carried measurement, consistent with the unchanged manifest).
- IPD `main` remains `4b5c65a731a66a6fa1260146a55df9ed772953a5`. **0** open IPD PRs. No IPD export map was edited.
- NP-04 reference commit `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` exports `./persistence` and does not export `./portfolio-ui`, which current IRR consumers require. It is diverged from IPD `main`. It was not pinned.
- `CV-23` (`IIPS-V3-CV23-GATE-A-NOT-REQUIRED-PA-DISPOSITION-2026-10-24-01`) §1(3) and §3 withhold re-pin and package-export addition. Gate A is not a prerequisite for Gate B, and this pass does not reopen it. Discharging `R3` by re-pin or by an IPD export-map edit would be the later express act `CV-23` §5 describes, or the IRR-only adapter act named in the commissioning record §4. Neither was rendered.
- Zero `iips-production-market-data/persistence` imports were added.

**Result: `R3` remains OPEN / NOT ADMITTED.** The mismatch is a governance and package-surface mismatch. It is not treated as proof that the historical store was defective.

## 5. F-7 and CV-51

| Gate | Status after this pass | Evidence |
|---|---|---|
| `F-7` | **NOT SATISFIED** | No committed separate-process restart harness was added or executed. The historical harness was never committed and was not reconstructed. The unit results in §6 are not the five-part F-7 bar and are not claimed as qualification of a Reports capability. |
| `CV-51` | **BLOCKED** | No Reports UI, navigation, or route mount was added. The fence was not replaced. D8 UI work remains outside this pass. |

## 6. Tests, typecheck, and build actually executed

Environment: Node `v22.22.3`, Vitest `2.1.9`. `npm ci` in `frontend/` completed (`189` packages). The sandbox required `NODE_EXTRA_CA_CERTS=/run/e2b/certs/ca-certificates.crt` for the GitHub dependency fetch. That variable is not a repository change and is not part of CI.

| Command | Result |
|---|---|
| `npx vitest run server/reports/reports-canonical.test.ts` | **46 passed / 0 failed** |
| `npx vitest run server/reports/reports-artifact.test.ts` | **56 passed / 0 failed** |
| `npx vitest run server/reports-transport.test.ts` | **2 passed / 0 failed** (fence: known routes stay unavailable; unknown-route and method validation preserved) |
| `npx tsc --noEmit --strict --target ES2020 --module ESNext --moduleResolution bundler --esModuleInterop --skipLibCheck --types node` on the three restored modules | **exit 0** |
| `npm run typecheck` (`tsc --noEmit` after broker-import pretypecheck) | **exit 0**. This project typecheck does not include `server/reports/`; that is why the direct `tsc` invocation above was also run. |
| `npm run typecheck:replay-server` | **exit 0** |
| `npm run build` (`tsc -b && vite build`) | **exit 0**. 138 modules. Main chunk `dist/assets/index-Bh4vcGJI.js` `1,590.96 kB` / gzip `222.05 kB`. The production bundle does not include the restored server modules. The existing chunk-size warning is unchanged in substance and is not a Reports result. |

**Not claimed.** Historical 32/32, 228/228, and 14/14 were **not** re-executed. They remain source-reported for `39dd43eb…` / tip `6a8afbb2…`. The 14 golden vectors are present in the restored canonical test and were exercised as part of the 46 passing canonical tests; that is a fresh run of the restored file, not a re-certification of the historical 228-test suite.

| `npm run test:ci` (full Vitest suite, JSON report, then `node .ci/assert-tests.js .vitest-report.json`) | **100 files / 1,299 passed / 0 failed**. `assert-tests` exit 0. Delta from the recorded `main` baseline of 98 files / 1,197 passed is the two restored files (46 + 56). The fence file remained 2 passed inside that suite. |

The full-suite result is a current-tree result. It is not F-7 and not production qualification. The JSON report is a local CI artifact and is not part of the publication.

## 7. Separate statuses after this pass

| Status | Result |
|---|---|
| Historical implementation | **IMPLEMENTED and D-3-accepted, branch-only**, at `39dd43eb…` / tip `6a8afbb2…`. Not admitted by this pass. |
| Current implementation | **PARTIAL — non-production domain modules only.** Canonicalization, artifact validation, and composition are restored and byte-identical. Persistence, authenticated transport, route replacement, and UI are absent. The fence is the only HTTP behavior. |
| Dependency integration | **NOT INTEGRATED.** No NP-04 binding. No `./persistence` import. Pin unchanged. |
| Qualification | **NOT QUALIFIED** as a Reports capability. Focused unit and fence tests passed, and the full current-tree suite passed **100 files / 1,299 / 0 failed**, as recorded in §6. `F-7` **NOT SATISFIED**. |
| Governance authorization | **COMMISSIONED — bounded non-production only** (`IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01`). Durable on `main` only after publication and remote read-back. |
| Capability acceptance | **NOT ACCEPTED** on current `main`. D-3 acceptance stays branch-only. |
| Production admission | **NOT ADMITTED. NOT PRODUCTION-READY.** No deployment was performed or authorized. |

## 8. Remaining blockers and the authority each one needs

1. **R1 ownership source — NOT ESTABLISHED.** Needs the ownership-source PA act in the commissioning record §4. No owner was invented.
2. **R2 contract shape — unbound.** Needs the contract-shape PA act after R1. The fence stays until a replacement has passed authorization and qualification.
3. **R3 pin/export admission — OPEN / NOT ADMITTED.** Needs the IRR-adapter act or the IPD package act named in the commissioning record §4. `CV-23` still withholds re-pin and export-map change. This pass did not supply that act.
4. **F-7 — NOT SATISFIED.** Needs a committed, reproducible, separate-process restart harness executed against the then-current owner contract and admitted persistence binding. Unit results do not discharge it.
5. **CV-51 — BLOCKED.** Needs F-7 and acceptance, then a separate route/UI authorization. No UI work was done.
6. **Acceptance and production admission — not granted.** Need their own acts after the gates above. This commissioning is neither act.

---

*Execution support: Arena Agent Mode. No further authority rendered. Reports is commissioned for bounded non-production work, partially implemented as un-wired domain modules, not qualified, not accepted, not admitted, and not production-ready.*
