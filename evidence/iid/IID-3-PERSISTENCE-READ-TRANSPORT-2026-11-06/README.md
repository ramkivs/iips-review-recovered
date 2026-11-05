# IID-3 — Persistence, Read Transport and Thin Slice (milestone M-1)

**Date:** 2026-11-06
**Branch:** `arena/e56fe593-iips-review-recovered`
**Predecessor:** IID-0 (`cad6371`), IID-1 (`792b805`), IID-2 (`34c8b39`, PR #461)
**Published:** PR [#464](https://github.com/ramkivs/iips-review-recovered/pull/464) — **merged** as `f08da40`
(2026-11-06; branch head at merge `120b8a9`, feature commit `e627727`, twice merged with `origin/main`).
CI on the PR head: `42096525519` (`8fd1c2b`), `42097430354` (`b23089d`), `42098111372` (`120b8a9`) — all pass.
Independently re-verified from fresh clones of the branch **and of the merged `main`**:
`INDEPENDENT-VERIFICATION.md`.
**Scope:** compose → validate → persist (injected NP-04 port) → read (GET/HEAD only) → thin view, for one issuer,
in a **new isolated investment-artifact scope**.

---

## 1. What was built

| File | Role |
|------|------|
| `iips-platform/src/investment/artifacts/scopeToken.ts` | `ScopeToken` validation (closed prefix set `co:`,`hd:`,`hc:`,`icr:`; `^[a-z]{2,4}:[A-Za-z0-9:+._/-]{1,120}$`), closed `ReportTypeRegistry`, `companyScopeToken`, report-type↔prefix binding. |
| `iips-platform/src/investment/artifacts/index.ts` | Re-export surface for the two contracts above. |
| `frontend/server/investment/assessmentComposition.ts` | IID-2 payload → canonical `ReportContent`. Stable-only `parameters`; content/input digests recorded in **provenance**, never in the canonical members; refuses a payload whose own invariants already failed. |
| `frontend/server/investment/investmentArtifacts.ts` | Chain persistence over an **injected** `ReportsPersistencePort`: create / append / `UNCHANGED` / `INPUT_CHANGED_CONTENT_IDENTICAL`, whole-chain validation on every read, stored-digest recomputation, scope-drift refusal. No store construction, no SQL, no filesystem. |
| `frontend/server/investment/investment-transport.ts` | `GET`/`HEAD` only: `/api/investment/company/:issuerId`, `/api/investment/company/:issuerId/versions/:reportId`. Static sanitized failure bodies; 405 before any owner/store resolution. |
| `frontend/server/investment/cli/generate-investment-artifacts.ts` | Operator CLI: snapshot → identity → assess → compose → validate → chain head → compare → persist → verify, with a machine-readable summary. |
| `frontend/server/investment/cli/show-investment-chain.ts` | Read-only CLI used to prove durability from a **separate process**. |
| `frontend/server/investment/cli/m1-demonstration.ts` | The M-1 demonstration, which generates this evidence. |
| `frontend/server/investment/demo/{m1Data,m1Pipeline}.ts` | Synthetic demonstration data (IID-2 reference company re-keyed to an IID-1-resolvable issuer) and the environment builder. |
| `frontend/src/api/investment.ts` | Read-only client; closed failure vocabulary with fixed copy; limitation disclosures. |
| `frontend/src/features/investment/CompanyAssessmentPage.tsx` | Thin assessment view. |
| `frontend/server/executive-transport.ts` | Mounts the investment namespace; `/api/investment` added to the owner-scoped prefix list (no wildcard CORS). |
| `docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` | The cumulative limitation register (`L-001` … `L-016`). |

## 2. Reproduce

```bash
cd frontend

# M-1 demonstration (writes evidence to the directory given; never touches an existing store)
./node_modules/.bin/tsx server/investment/cli/m1-demonstration.ts --out <dir>

# The operator CLI against a dataset and a governed database
./node_modules/.bin/tsx server/investment/cli/generate-investment-artifacts.ts \
  --issuer IN:EQISIN:IN0000000201 --data-dir <datasetDir> --identity-dir <identityDir> \
  --db <dbPath> --owner-carrier <carrierPath> --generated-at 2026-11-06T00:00:00.000Z

# Read it back in another process
./node_modules/.bin/tsx server/investment/cli/show-investment-chain.ts \
  --issuer IN:EQISIN:IN0000000201 --db <dbPath> --owner-carrier <carrierPath>
```

Tests (all IID-3 suites):

```bash
cd frontend && ./node_modules/.bin/vitest run server/investment src/api/investment.test.ts src/features/investment
cd frontend && ./node_modules/.bin/tsc -p tsconfig.investment-server.json
cd iips-platform && ./node_modules/.bin/tsx --test tests/investment/*.test.ts
```

**Prerequisites for a fresh clone.** `frontend/node_modules` and `frontend/np04-shim` are both gitignored build
artefacts, and `node_modules/iips-np04-governed-persistence` must be a **real directory** (a copy of `np04-shim`),
not a symlink to it: as a symlink, Vite resolves it outside `node_modules`, transforms its
`import { DatabaseSync } from 'node:sqlite'`, and every suite that reaches the store fails to load with
`Failed to load url sqlite`. The platform regression suite additionally needs pinned commit `5ca181c7…` present in
the local clone. Both were hit and resolved during independent verification
(`INDEPENDENT-VERIFICATION.md` §5); neither is a product defect.

## 3. Files in this directory

| File | Contents |
|------|----------|
| `m1-demonstration.json` | The ten verification points, both independent-read records, the corruption and 503 probes, the mutating-route sweep, the sanitization sweep, and the limitations confirmed. |
| `runs/create-v1.json` | CLI summary of the creating run (`CREATED`, version 1). |
| `runs/rerun-identical.json` | CLI summary of the idempotent re-run (`UNCHANGED`, no write). |
| `runs/changed-input-v2.json` | CLI summary of the changed-input run (`APPENDED`, version 2). |
| `ACCEPTANCE-MATRIX.md` | `AC-3.1` … `AC-3.8` and the ten M-1 points, each mapped to the test that would fail. |
| `readiness.txt` | Counts and identities for this commit. |
| `INDEPENDENT-VERIFICATION.md` | Merge resolution with `origin/main`, CI run `42096525519`, the fresh-clone counts and the reproduced M-1 identities (only the store-assigned `reportId` differs), the environment facts, and what this record does not claim. |

## 4. What this evidence proves — and what it does not

**Proved.** One synthetic issuer is assessed, composed into a canonical artifact, durably persisted in a new
isolated scope, read back **from a separate process**, re-run with no write, versioned when its input changed, with
version 1 byte-identical afterwards; the chain validates as a whole on every read; a tampered store is refused; an
unavailable boundary yields the documented static 503; and no mutating route exists.

**Not proved.** No real issuer was assessed (`L-009`); the data is synthetic (`L-004`); bank dividends remain
withheld (`L-005`); restricted cash is not computable (`L-006`); dilution is a capped proxy (`L-007`); SOTP is not
implemented (`L-008`); 3 of 13 sectors are measured (`L-001`); 20 XBRL tags are mapped (`L-002`); 8 derivations
exist (`L-003`). Those nine limitations are unchanged by this milestone and every response carries them.
