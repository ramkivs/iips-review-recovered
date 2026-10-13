# IIPS v3.0 — REG-11 R4: `R4-B` Program Authority Disposition and Remediation Execution Record (`2026-10-13`)

> **Record ID:** `REG11-R4-B-PA-DISPOSITION-AND-REMEDIATION-2026-10-13-01`
> **Record type:** PA disposition transcription + remediation execution evidence.
> **Date:** 2026-10-13 (actual date; not backdated)
> **Deciding authority:** Ramki — Program Authority. The recording agent rendered no authority;
> it transcribed the disposition without addition, narrowing, or reinterpretation, and executed
> only the approved scope.
> **Authoritative repository / ref:** `ramkivs/iips-review-recovered` / `refs/heads/main`
> **Effectiveness:** Recorded — effective upon durable publication to `refs/heads/main` plus
> independent remote verification there (same convention as the Option C disposition).
> **Basis records (unchanged, reused):**
> [`IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md`](IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md) (Outcome B) and
> [`IIPS_v3.0_REG11_R4_B_REMEDIATION_PA_DECISION_REQUEST_AND_PLAN_2026-10-13.md`](IIPS_v3.0_REG11_R4_B_REMEDIATION_PA_DECISION_REQUEST_AND_PLAN_2026-10-13.md) (decision packet; §5.2 scope, §5.3 bar, §8 instrument).

---

## 1. The disposition (transcribed)

On 2026-10-13, in the working session, the Program Authority was presented with the §8 instrument
of `REG11-R4-B-REMEDIATION-PA-DECISION-REQUEST-2026-10-13-01` — verbatim, including the exact
scope (§5.2), the verification bar (§5.3), and the prospective-only / non-retroactive term — and
responded:

> "consider this as PA' approval and it is granted"

This is recorded as the Program Authority's explicit selection and grant of:

```text
R4 DISPOSITION          = R4-B — REMEDIATION (SELECTED)
APPROVED SCOPE          = exactly §5.2 of the decision packet:
                          removal of the 10 named frontend/server/reports/ paths
                          from refs/heads/main (baseline 721520cc… verified unmoved);
                          §5.2 retention items retained as stated
IMPLEMENTATION          = AUTHORIZED on these exact terms and no others,
                          subject to the §5.3 verification and durable-publication criteria
NATURE                  = PROSPECTIVE ONLY — does NOT retroactively authorize the
                          2026-10-06 merge of PR #42 (47edf6f3…)
```

No broader authority is inferred. The disposition does not touch R1/R2 (Option C), R3, Gate A,
Gate C, either IPD persistence lineage, the NP-04 pin, or the fail-closed baseline.

## 2. Remediation executed (the approved scope, exactly)

Target state re-verified immediately before execution: `refs/heads/main` =
`721520cc059cd80ad16bd7fb68da5cd6ecbadd9b` (unmoved since the plan); working tree clean; fence
blob `frontend/server/reports-transport.ts` = `981470541812a64c733309f1debec75455d85bee`
(Option C-recorded identity).

**Removed (10 paths — deletions only; nothing else):**

```
frontend/server/reports/artifact.ts
frontend/server/reports/canonical.ts
frontend/server/reports/composition.ts
frontend/server/reports/index.ts
frontend/server/reports/np04-adapter.ts
frontend/server/reports/persistence-port.ts
frontend/server/reports/persistence.ts
frontend/server/reports/reports-artifact.test.ts
frontend/server/reports/reports-canonical.test.ts
frontend/server/reports/reports-persistence.test.ts
```

**Retained exactly as approved (§5.2):** the fail-closed fence
(`reports-transport.ts` + its two server-level tests, blob identities unchanged); the package pin
`iips-production-market-data#2e11fa3b…` and lockfile (AD-02 basis at that exact pin); the
`ipdPitReadAdapter.ts` `K2` comment (retained-unreviewed-comment, recorded); every path superseded
by later authorized work (no-auth baseline `1f7997e…`, F-3 `6729a26…`, 2026-10-07 family merges).
**No IPD change of any kind; no identity/security mapping; no route/UI/runtime change.**

Effect: the only `./persistence` package-subpath consumer edge in the codebase is removed; the
D-1 §15 / D-3 §11 / Promotion-Scope-Decision boundaries are restored at the authoritative tip;
`47edf6f3…` remains in history (no rewrite, no force-push) and remains recorded as the P1
historical conflict — remediated prospectively, never retroactively authorized.

## 3. §5.3 verification results (executed pre-publication)

The exact results are recorded in the canonical tracker §14 alongside this record's publication
coordinates (diff manifest check; TypeScript `tsc --noEmit`; frontend test suite; repository-wide
`./persistence` reference census; fence blob identity; documentation/deletion-only scope check).
Post-publication, the resulting `main` commit and the absence of the 10 paths are independently
verified against the remote. **No runtime or production behaviour is claimed proven by these
checks.**

## 4. Resulting gate state

| Item | State upon this record's durable publication |
|---|---|
| **R4 (`P1`)** | **REMEDIATED (`R4-B`) — CLOSED as a gate.** The historical conflict remains a recorded fact; the unauthorized admission no longer exists at the authoritative tip. |
| R1/R2 (Gate B) | Option C deferral — unchanged |
| **R3** | OPEN as a future gate; currently has **no live subject** (no Reports consumer edge exists). Any future Reports consumer requires R3 plus the Promotion-Scope Decision bar, including the separate promotion execution act. |
| Gate A / Gate C | Separate, untouched |
| Reports / User Portfolios | Fail-closed at source level (`503 owner-context-unavailable`); fence blobs unchanged |
| IPD lineages (`2e11fa3b…` artifact/report; `6828155e…` G24 portfolio) | Preserved, untouched |

---

*End of record `REG11-R4-B-PA-DISPOSITION-AND-REMEDIATION-2026-10-13-01`.*
