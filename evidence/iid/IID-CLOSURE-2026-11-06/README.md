# IID formal closure — evidence bundle (2026-11-06)

Documentation and evidence reconciliation for **IID-0 … IID-6**. This bundle contains the reconciliation *evidence*;
the authoritative narrative is `docs/integration/IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md`.

**Nothing in this bundle is a new measurement of the product.** No `frontend` suite, no `iips-platform` suite, no
typecheck and no demonstration was re-run for the closure. Every figure is quoted from a committed artefact with the
commit it was measured at; where a claim rests on file identity rather than execution, it says so.

| File | Contents |
|---|---|
| `README.md` | This index. |
| `commands-and-outputs.txt` | Verbatim commands and output used for the reconciliation: history, platform diffs by range, `package.json` scripts, test-file counts, the socket search, the network-import search, and the dependency-closure greps. |
| `AC-X1-PLATFORM-EVIDENCE.md` | AC-X1 determination: component table with recorded results and commits, the file-identity argument, the four qualifications (Q-1…Q-4). |
| `AC-X2-ZERO-SOCKET-EVIDENCE.md` | AC-X2 determination: **OPEN** when written (now superseded — see the banner in that file). What existed, why architectural evidence is not the criterion, and the exact artefact that would close it. That artefact now exists: `../IID-AC-X2-ZERO-SOCKET-2026-11-06/`. |

## The two determinations, in one line each

- **AC-X1 — PASS, satisfied by explicitly referenced prior evidence (qualified).** `frontend` is direct
  (`14de785`: typecheck clean, 546 passed / 1 skipped + 199 server tests, fresh clone; CI pass on PR #481). The platform
  half is composed from `tests/investment` 377/377 and clean `tsc` at `bc0de0e` (IID-4 post-merge; platform tree
  byte-identical at head), the regression suite 651/651 at `f08da40` (unchanged files, investment-free closure) and the
  in-src tests' 648/648 standard-command record at `7524f18` (unchanged files and imports). **No platform suite was
  re-run**; the literal `npm test` command has never been executed at an IID head (Q-1).
- **AC-X2 — OPEN when written (now PASS on runtime evidence — see the banner in `AC-X2-ZERO-SOCKET-EVIDENCE.md`).** No test, trace or recorded counter anywhere asserts zero sockets for an assess → persist → read
  cycle. The investment code paths contain no socket construction and no runtime network import, and IID-6 added no
  network path — that is architectural evidence, and the gate asks for a measurement. Missing artefact specified in
  `AC-X2-ZERO-SOCKET-EVIDENCE.md` §6.

## Phase bundles (index)

| Phase | Bundle | Note |
|---|---|---|
| IID-0 | `evidence/iid/IID-0-FOUNDATIONS-2026-11-05/` | |
| IID-1 | `evidence/iid/IID-1-IDENTITY-COVERAGE-2026-11-05/` | includes platform typecheck + NP-12 logs |
| IID-2 | `evidence/iid/IID-2-COMPANY-ASSESSMENT-2026-11-06/` | `ACCEPTANCE-MATRIX.md`, golden payloads |
| IID-3 | `evidence/iid/IID-3-PERSISTENCE-READ-TRANSPORT-2026-11-06/` | acceptance matrix, independent verification, M-1 record, `runs/` |
| IID-4 | `evidence/iid/IID-4-HOLDING-DISPOSITION-2026-11-06/` | acceptance matrix, test run, independent + post-merge verification, demo |
| IID-5 | **`evidence/integration/iid5-historical-change-intelligence-2026-11-06/`** | historically located outside `evidence/iid/`; not moved (see closure §8 G-4) |
| IID-6 | `evidence/iid/IID-6-PRODUCT-SURFACE-2026-11-06/` | requirement matrix (+§6 correction), read-only proof, accessibility, e2e, corrections, fresh-clone verification |
| Closure | `evidence/iid/IID-CLOSURE-2026-11-06/` | this bundle |

## What this bundle does not claim

No production acceptance, no admission, no release, no real-issuer validation, no Windows host evidence, no trade
execution, no brokerage integration, no multi-user/auth scope, and no closure of any limitation (`L-001` … `L-029` are
unchanged). R-16 remains 3 of 13 sectors.
