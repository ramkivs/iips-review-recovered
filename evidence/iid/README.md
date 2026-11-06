# `evidence/iid/` — IID phase evidence index

**Status of the programme:** IID-0 … IID-6 are **implementation-complete**, closed by
`docs/integration/IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md`. **AC-X2 is now PASS on runtime evidence** and **AC-X6 PASS
with gap G-8 closed** (addendum at `aaf1f0c`; bundle `IID-AC-X2-ZERO-SOCKET-2026-11-06/`), and AC-X1 remains qualified
(Q-1…Q-4). Completion is not production acceptance and does not close any limitation.

This index exists because the directory previously had none, so a reader had to guess which bundle belonged to which
phase and where IID-5's evidence lived.

| Phase | Bundle | Acceptance record | Merged |
|---|---|---|---|
| IID-0 — foundations | `IID-0-FOUNDATIONS-2026-11-05/` | roadmap §B.J | yes |
| IID-1 — identity coverage | `IID-1-IDENTITY-COVERAGE-2026-11-05/` | roadmap §B.J2 | yes |
| IID-2 — company assessment | `IID-2-COMPANY-ASSESSMENT-2026-11-06/` | `ACCEPTANCE-MATRIX.md`, roadmap §B.J3 | yes |
| IID-3 — persistence + read transport | `IID-3-PERSISTENCE-READ-TRANSPORT-2026-11-06/` | `ACCEPTANCE-MATRIX.md`, `INDEPENDENT-VERIFICATION.md`, roadmap §B.J4 | #464 `f08da40` |
| IID-4 — holding disposition | `IID-4-HOLDING-DISPOSITION-2026-11-06/` | `ACCEPTANCE-MATRIX.md`, `POST-MERGE-VERIFICATION-2026-11-06.md`, roadmap §B.J5 | #471 `bc0de0e` |
| IID-5 — historical change intelligence | **`../integration/iid5-historical-change-intelligence-2026-11-06/`** | `RESULTS.md`, roadmap §B.N | #479, #480 |
| IID-6 — product surface | `IID-6-PRODUCT-SURFACE-2026-11-06/` | `requirement-matrix.md` (+§6 correction), roadmap §B.O | #481 `14de785`, #482 `edddfb0` |
| **Closure** | `IID-CLOSURE-2026-11-06/` | `docs/integration/IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md` | this work item |
| **Remaining acceptance evidence** | `IID-AC-X2-ZERO-SOCKET-2026-11-06/` | `AC-X2-RUNTIME-EVIDENCE.md` (AC-X2 → PASS), `AC-X6-G8-DETERMINATION.md` (AC-X6 → PASS, G-8 closed), `commands-and-outputs.txt` | addendum to the closure, roadmap §B.Q |

Also present: `Q1-NP04-COMPATIBILITY-PROBE-2026-11-05/` — the NP-04 compatibility probe that preceded IID-0's persistence
work; it is not an IID phase and carries no IID acceptance criteria.

**Location note.** IID-5's bundle sits under `evidence/integration/` rather than `evidence/iid/`. It was left where it
was published: moving it would break committed cross-references from the roadmap §B.N, the IID-5 implementation record
and the register §9. The closure record lists this as gap G-4.

**Evidence hygiene.** Each bundle distinguishes what was *executed* from what was *argued*. Where a claim rests on file
identity rather than a fresh run, the file says so. No figure in any bundle should be read as a production, admission or
release result.
