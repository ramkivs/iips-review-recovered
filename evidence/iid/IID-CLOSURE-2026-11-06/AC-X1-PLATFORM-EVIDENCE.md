# AC-X1 — platform test evidence (reconciled)

**Determination:** **PASS — satisfied by explicitly referenced prior evidence**, qualified (Q-1 … Q-4).
**Nothing in this file is a new measurement.** Every number is quoted from a committed artefact, with the commit it
was measured at. No platform suite was re-run during IID-6 or during this reconciliation.

Authoritative closure text: `docs/integration/IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md` §5.

---

## 1. Gate text

| Source | Text |
|---|---|
| Design §6.8 | `npm test` in `frontend` and `iips-platform` pass with the new suites; `npm run typecheck` clean. |
| Roadmap §3 | `npm test` (frontend, `iips-platform`) green; `npm run typecheck` clean. |

## 2. The commands the platform actually defines

`iips-platform/package.json`:

```json
"typecheck": "tsc --noEmit",
"test":      "tsx --test src/**/*.test.ts tests/regression/*.test.ts",
"test:iid":  "tsx --test tests/investment/*.test.ts"
```

`npm test` therefore covers the 13 in-src test files and the 69 regression test files, and **not** the 28
`tests/investment/*` files — those are `npm run test:iid`. Any reconciliation that treats "the investment suite" as
"`npm test`" is wrong, which is why the components are separated below.

## 3. Recorded results, by component

| Component | Files | Recorded result | Measured at | Evidence path |
|---|---|---|---|---|
| `frontend` suites | 57 (src) + 14 (server/investment) | 546 passed / 1 skipped; 199 passed | `14de785` (PR #481 merge), fresh clone | `evidence/iid/IID-6-PRODUCT-SURFACE-2026-11-06/test-run.txt`, `fresh-clone-verification.md` |
| `frontend` typecheck | — | clean (`tsc --noEmit`) | same | same |
| `iips-platform` investment suite | 28 | **377 / 377 pass, 0 fail** | `bc0de0e` (PR #471 merge), fresh clone | `evidence/iid/IID-4-HOLDING-DISPOSITION-2026-11-06/POST-MERGE-VERIFICATION-2026-11-06.md` §2 |
| `iips-platform` typecheck | — | **exit 0, no diagnostics** | `bc0de0e` | same |
| `iips-platform` regression suite | 69 | **651 / 651 pass** | `f08da40` (PR #464 merge), fresh clone | `evidence/iid/IID-3-PERSISTENCE-READ-TRANSPORT-2026-11-06/INDEPENDENT-VERIFICATION.md` §3, §6 |
| `iips-platform` in-src tests | 13 | standard command **648 / 648 pass** (not itemised per subset) | `7524f18` (Oct 2026) | `docs/integration/IIPS_v3.0_E2E-030_D42_DELTA_GOVERNANCE_DECISION.md`; `evidence/integration/e2e-030-replay-remediation-2026-10-11/E2E-030_REPLAY_REMEDIATION_VALIDATION_REPORT.md` |

Earlier IID-era platform figures: IID-3 recorded **286 / 286** for the investment suite at `f08da40`
(`INDEPENDENT-VERIFICATION.md` §3). Those 286 are **superseded** by IID-4's 377, because IID-4 added 91 net investment
tests and changed `src/investment/artifacts/scopeToken.ts` — the platform changed after IID-3 measured it.

## 4. Why the older records still describe the IID-6 head (file identity, not assumption)

```
$ git diff --stat bc0de0e..HEAD -- iips-platform/
(no output)                                  # platform tree identical to the IID-4-verified tree

$ git log --oneline f08da40..HEAD -- iips-platform/
3bc70c3 IID-4: holding disposition engine, composition, records, read transport

$ git diff --stat f08da40..HEAD -- iips-platform/tests/regression/
(no output)                                  # regression suite unchanged since the 651/651 run

$ git diff --stat f08da40..HEAD -- 'iips-platform/src/**/*.test.ts'
(no output)                                  # in-src test files unchanged since the IID-3 merge

$ git diff --stat 7524f18..HEAD -- iips-platform/src ':!iips-platform/src/investment'
(no output)                                  # non-investment platform src untouched since the 648/648 record

$ grep -rn "investment" iips-platform/tests/regression/
(no matches)                                 # regression closure excludes investment code
$ grep -rn "investment" iips-platform/src --include=*.test.ts
(no matches)                                 # in-src test closure excludes investment code
```

`7524f18` is confirmed an ancestor of the head (`git merge-base --is-ancestor 7524f18 HEAD` → true).

## 5. Did IID-6 require additional platform verification? **No**

- IID-6's only server-side change is `frontend/server/investment/dispositionService.ts` (+40/−4) and its two test files
  — `git diff --stat 83f4511..HEAD -- frontend/server/` lists exactly those three files.
- IID-6 touched **zero** files under `iips-platform/` (PR #481's 38-file list contains no `iips-platform/` path).
- IID-5 likewise changed no platform file; the platform has been unchanged since `bc0de0e`.

Because the verified platform tree and the head platform tree are byte-identical, a re-run could only reproduce the
recorded result unless the environment differs — an environment question, not a code question, and out of scope here.

## 6. Qualifications

| ID | Qualification |
|---|---|
| Q-1 | No single `npm test` execution exists at any IID head. Green status is composed from three executed records plus dependency-closure analysis, and is labelled as such. |
| Q-2 | The in-src test component's record is pre-IID (October). Its files and their non-investment imports are unchanged, so it still describes the head — but it is the weakest component, and 648 is not itemised into src + regression subsets. |
| Q-3 | Platform suites were **not** re-run for IID-6 or for this reconciliation. A fresh `npm test` would replace §3–§6, not extend them. |
| Q-4 | CI does not cover any of this: `.github/workflows/ci.yml` is scoped to `frontend/**` and states that standalone `iips-platform` checks "are not run by this workflow". The green PR #481 check is evidence for the `frontend` half only. |
