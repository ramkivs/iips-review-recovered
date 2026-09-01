# DEC-D2-DANGLING-VOCABULARY â€” D2 Vocabulary Disposition

- **Record ID:** `DEC-D2-DANGLING-VOCABULARY`
- **Title:** D2 â€” Disposition of Program Vocabulary Terms With and Without Authoritative Referents
- **Class:** `DECISION` / `AUTHORITY`
- **Status:** `RECORDED â€” D2 = OPTION A`
- **Date:** 2026-08-28
- **Authority relationship:** gate `PROGRAM v3.0 / IES CAPABILITY RE-BASELINE â€” D2 + D5-S3
  AUTHORITY GATE`. The maintainer was presented with options A / B / C / D and explicitly
  selected **A â€” record only evidenced referents and mark the rest as
  inherited-with-no-referent**. Governance recording authority was granted separately and
  explicitly, scoped to `governance/iips/` on `arena` only.
- **Scope:** vocabulary disposition only. **No meaning is invented for any term.** No
  matrix, engine, implementation, certification, release or P7 change.

**Provenance:** pre-existing governance record; provenance reconstructed from the authoritative governance record and execution lineage available at the time of D33-C1 amendment. This metadata amendment records provenance only and does not alter the record's substantive decision, authorization, scope, or evidentiary determination.

---

## 1. THE PROBLEM

Several program terms appear in this governance store as **prohibitions** â€” most prominently
`AUTH-G-AI-IMPL` Â§4: *"Any change to PC-4, N+5, E2E-017, or the Engine Master Matrix"*. A
prohibition that names a nonexistent artifact is **unenforceable**. This record determines,
term by term, which terms have an authoritative referent in the actual repository and which
do not.

## 2. METHOD

Exhaustive `git grep` across **all five product refs** â€”
`origin/main`, `origin/phase13-next` (`357b34dac1bdâ€¦`), `origin/gai-impl-canonical`,
`origin/phase13-hardening-delivery`, `origin/program-v3-matrix-rebaseline` â€” excluding
`package-lock.json`, plus `origin/arena/01a03e3b-iips-review-recovered` for comparison.
Case and near-variants searched (`PC-4`/`PC4`/`PC-04`, `TRIM-S`/`TRIMS`, `TRIM-V`/`TRIMV`,
`NO-DECISION`/`NO_DECISION`/`NODECISION`). **No meaning was inferred from any name.**

## 3. FINDINGS

| Term | Authoritative referent? | Evidence | Disposition |
|---|---|---|---|
| **`N+5`** | **YES** | 4 files at `phase13-next`: `frontend/src/features/company/CompanyIntelligence.tsx` (*"N+5: composes the THREE guarded read endpoints client-side"*), `CompanyIntelligence.test.tsx` (*"N+5 vertical slice (preserved behavior)"*), `CompanyTrustChain.tsx` (*"the reusable vertical-slice reference pattern"*), `CompanyTrustChain.test.tsx` | **RETAINED AS VALID** |
| **`N+3`** | **YES** | `docs/v3.0/phase13-hardening/PHASE13_N3_READ_AUTHORIZATION_CERTIFICATION.md` â€” an actual certification record certifying the governed READ authorization boundary | **RETAINED AS VALID** (not previously flagged) |
| **`N+*` series** | **YES â€” extensive** | Present at `phase13-next`: **N+1, N+2, N+3, N+5, N+6, N+7, N+8, N+9, N+10, N+11, N+12, N+13, N+14, N+15, N+16, N+17, N+18, N+20, N+21, N+22**. Absent: **N+4** and **N+19** | **REAL Program v3.0 milestone vocabulary** |
| **`N+4`** | **NO** | 0 occurrences in all five product refs; 1 occurrence, inside this session's own governance record | **INHERITED-WITH-NO-REFERENT** â€” a gap in an otherwise continuous series |
| **`PC-4`** | **NO** | 0 in all five product refs (all variants); 6 occurrences, **all inside this session's governance records** | **INHERITED-WITH-NO-REFERENT** |
| **`TRIM-S`** | **NO** | 0 in all five product refs (all variants); 4 occurrences, all in this session's records | **INHERITED-WITH-NO-REFERENT** |
| **`TRIM-V`** | **NO** | 0 in all five product refs (all variants); 4 occurrences, all in this session's records | **INHERITED-WITH-NO-REFERENT** |
| **`HARVEST`** | **NO** | 0 in all five product refs; 4 occurrences, all in this session's records | **INHERITED-WITH-NO-REFERENT** |
| **`NO-DECISION`** | **NO** | 0 in all five product refs (all variants); 4 occurrences, all in this session's records | **INHERITED-WITH-NO-REFERENT** |
| **`EXIT`** | **NO** (as a program term) | 59 files contain the case-insensitive string, but **all 66 matched tokens are the lowercase word `exit`** â€” `exit 0` in certification result tables. Filtering `exit N`, `exit code`, `process.exit`, `exited`, `exiting` leaves **zero** standalone occurrences | **FALSE POSITIVE â€” not program vocabulary** |
| **`P7`** | **NO** | 0 occurrences in tracked non-lockfile files at every product ref; 10 occurrences, all in this session's records | **INHERITED-WITH-NO-REFERENT** â€” consistent with the standing P7 finding: no artifact, no baseline, never claimed as PASS |
| **`E2E-001` / `E2E-013` / `E2E-014` / `E2E-017` / `E2E-018`** | **NO** | 0 in all five product refs; 1â€“4 occurrences, all in this session's records | **INHERITED-WITH-NO-REFERENT** â€” see `DEC-E2E-013-BASELINE` |
| **`Engine Master Matrix`** | **NO** | 0 in all five product refs; 5 occurrences, all in this session's records | **INHERITED-WITH-NO-REFERENT** â€” the actual capability matrix is `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`, which is a **different artifact and must not be conflated with it** |
| **`Capital Steward`** | **NO** | 0 occurrences **anywhere**, including the governance store | Never entered the record chain; no action |

## 4. STRUCTURAL FINDING â€” THE TERMS ARE SELF-PROPAGATING

The inherited terms do not originate in the repository. They entered through gate prompts and
were then **recorded and re-quoted by each successive governance record**:

- `PC-4` first appears in `AUTH-G-AI-IMPL.md`, `SPEC-G-AI-IMPL.md` and `DEC-G-AI-IMPL-B1.md`,
  then propagates into `DEC-G-AI-IMPL-CERTIFICATION.md`, `DEC-E2E-013-BASELINE.md` and
  `DEC-D4-AI-ADVISORY-INTEGRATION.md`.
- `TRIM-S`, `TRIM-V`, `HARVEST`, `NO-DECISION` first appear in
  `DEC-G-AI-IMPL-CERT-CRITERIA.md`, then propagate into `DEC-G-AI-IMPL-CERTIFICATION.md`,
  `DEC-E2E-013-BASELINE.md` and `DEC-D4-AI-ADVISORY-INTEGRATION.md`.

**Consequence:** absent a disposition, the chain continues indefinitely â€” each new record
inherits prohibitions protecting artifacts that do not exist. This record terminates that
propagation for the terms listed above.

## 5. DECISION â€” OPTION A

1. **Only evidenced referents are recorded as valid.** `N+5` and `N+3` are retained as valid
   Program v3.0 referents, with the file evidence above.
2. **The `N+*` series is recorded as real**, with `N+4` and `N+19` explicitly identified as
   the absent members. No meaning is supplied for either.
3. **`PC-4`, `TRIM-S`, `TRIM-V`, `HARVEST`, `NO-DECISION`, `P7`, `E2E-001`, `E2E-013`,
   `E2E-014`, `E2E-017`, `E2E-018` and `Engine Master Matrix` are recorded as
   INHERITED-WITH-NO-REFERENT** in this repository. **No meaning is invented for any of them.**
4. **`EXIT` is recorded as an `exit 0` false positive**, not program vocabulary.
5. **`AUTH-G-AI-IMPL` Â§4's prohibition is recorded as 3-of-4 unenforceable as written**: of
   `PC-4`, `N+5`, `E2E-017` and `Engine Master Matrix`, only **`N+5`** has a referent. The
   prohibition **remains in force for `N+5`**. For the other three it is recorded as having
   no referent, so it cannot be violated and cannot be relied upon. The text itself is **not
   amended by this record**; amending it requires separate authority.
6. **`Engine Master Matrix` must not be conflated with
   `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`.** The latter is a real, existing,
   separately-authorized artifact (`DEC-D3-MATRIX-REBASELINE`, `DEC-D4-AI-ADVISORY-INTEGRATION`).

## 6. WHAT THIS RECORD DOES NOT DO

| Item | Status |
|---|---|
| Invent a meaning for any term | **NOT DONE** |
| Amend `AUTH-G-AI-IMPL` or `SPEC-G-AI-IMPL` | **NOT DONE** â€” requires separate authority |
| Rewrite any historical record | **NOT DONE** |
| Modify the Integration Verification Matrix | **NOT DONE** |
| Modify any engine, `iips-platform/**`, or the AI Advisory implementation | **NOT DONE** |
| Reopen P7 or claim it as PASS | **NOT DONE** â€” no artifact exists |
| Alter certification, release or tag state | **NOT DONE** |
| Resolve D5-S1, D5-S3 or D6 | **NOT DONE** â€” D5-S3 is decided in `DEC-D5-S3-EVIDENCE-DEBT`; D5-S1 and D6 remain open |

## 7. CLASSIFICATION

# **D2 â€” OPTION A RECORDED**

Evidenced referents retained (`N+5`, `N+3`, the `N+*` series). Twelve terms recorded as
inherited-with-no-referent, and `EXIT` as a false positive. No meaning invented. The
self-propagating prohibition chain is terminated for the listed terms.
