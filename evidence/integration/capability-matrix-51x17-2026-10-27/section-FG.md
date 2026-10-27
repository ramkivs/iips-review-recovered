## F. Method

1. **Baseline first, evidence second.** Both repositories were cloned in full (never shallow) and the
   `main` commit, tree, tag objects and branch census were recorded before any statement about them was
   made. Ancestry questions (`470cc698`, `4906a6b`, `6a8afbb`) were answered with
   `git merge-base --is-ancestor` and `git branch -r --contains` on those full clones.
2. **Execution over documentation.** Every `V` in a Validation, Recovery or Wiring cell is backed by a
   command run in this pass — a `vitest`/guarded-runner result, a `tsc`/build exit code, a byte/hash read,
   or an HTTP status captured from the composed transport. Where a dimension could not be executed in this
   environment (Windows host, live MoSPI egress), the cell says so instead of borrowing a prior claim.
3. **Records gate claims, not code.** A capability is `ACCEPTED` only where an effective record names an
   accepting authority; code presence without a record is `IMPLEMENTED`; a dated exclusion outranks
   "not built"; branch-only work is never `main` state; `SOURCE-REPORTED` never counts as verified.
4. **Independent re-derivation.** The 2026-10-23 reconstruction and tracker §18.1 were read as *prior
   records* and every cell re-tested. Where today's evidence differs, §C names the conflict and states
   which record governs and why. No cell is a copy.
5. **Machine-checked output.** The matrix lives in `matrix_data.py`; the CSV, XLSX, §H and §E are
   generated from it by `build_matrix.py` / `sectionE.py`, so the three artefacts cannot diverge. The
   build refuses to emit if the row count, row numbering, header order, per-row arity, cell emptiness or
   `NA` rationale is wrong, and it re-reads the CSV to prove byte-level round-trip equality with the
   source (`00-artefact-checks.json`).
6. **Distinction-preserving vocabulary.** `V` verified-by-execution · `P` present but not verified to the
   full standard · `NI` present but not integrated · `NW` not wired · `NP` not proven · `VP` verified with
   a partial standard · `EP` exercised partially · `EM` empty/absent · `BL` blocked by record ·
   `NA` does not apply (always with an inline reason) · `OOS` out of scope by decision · `DEFERRED` ·
   `BRANCH-ONLY` · `SOURCE-REPORTED` · `NOT SATISFIED` / `NOT AUTHORIZED` / `NOT ACCEPTED`.

---

## G. Limits and non-claims

- **No authority is created here.** This record renders no acceptance, qualification, release or
  admission decision, and cannot be cited as one. Where it says a capability *is* accepted, it is quoting
  the record that accepted it; where no such record exists, the cell says `NOT SATISFIED`.
- **No fence is lifted, no lineage is admitted, nothing is provisioned.** `P-1` remains **UNSPENT**; the
  G24 lineage remains off-`main`; `CV-52` remains blocked; `CV-21` remains deferred.
- **Environment limits are stated, not worked around.** There is no route from this sandbox to
  `desktop-no0nhtp`, no PowerShell, and no MoSPI egress. Consequently O-01, O-08 and O-09 are recorded as
  operator-deferred rather than guessed at.
- **A fail-closed refusal is not a pass.** Every `503 owner-context-unavailable` in §A.5 is recorded as
  correct *wiring*, and simultaneously as proof that a data-backed owner read has never been demonstrated
  (C-03). The two statements are kept separate everywhere.
- **Per-record classification is not an aggregate.** The `52 / 2,198` split is not used as truth anywhere
  in §H; the executed `SMI-01` test establishes that no governed D05 record is `REAL` (C-02).
- **Windows is a separate evidence domain.** Nothing in this record merges a Linux result into a Windows
  claim, or the reverse.
- **The tracker's §18 cells were not edited.** Corrections are published as a dated overlay (§16.150) so
  that the prior text survives verbatim; the §18 row edits themselves remain for a later documentation
  pass (O-07).

---
