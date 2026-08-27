# AUTH-G-AI-IMPL — G-AI-IMPL Implementation Authorization (RECONSTITUTED)

- **Record ID:** `AUTH-G-AI-IMPL`
- **Title:** G-AI-IMPL — AI Advisory Implementation Authorization
- **Class:** `AUTHORIZATION`
- **Status:** `ACTIVE (RECONSTITUTED)`
- **Date/time:** 2026-08-27
- **Authority relationship:** issued originally at gate **G-AI-IMPL** as outcome **A — AUTHORIZE
  IMPLEMENTATION**; reconstituted here. Binds the implementation scope only. It does **not** bind the
  controlled-change gate, which must separately re-verify this record before any implementation
  mutation.
- **Scope:** the AI Advisory embedded-surface delta defined in `SPEC-G-AI-IMPL`. Expressly excludes
  baseline transition, recovery-evidence replacement, canonical-content import, certification, and
  every item listed under "Not authorized" below.
- **Provenance:** see the provenance note below.
- **Supersession / revision:** supersedes no record. The original out-of-repo authorization artifact
  was destroyed; this record re-establishes its content.

---

## PROVENANCE NOTE — RECONSTITUTED AUTHORITY

**This is a reconstituted authority record. Uninterrupted artifact continuity is NOT claimed.**

- The original out-of-repo records (G-AI-IMPL authorization, implementation specification, G-AI scope
  and confirmation, G-A, G-B, R3, R6) were **destroyed by repeated sandbox re-clones** and are absent
  from the filesystem.
- This record is reconstructed from the **previously issued authoritative content available in the
  session**, not from a surviving artifact.
- It is established in the **newly durable IIPS authority store** (`governance/iips/`, established by
  commit `191d595c63836083d0e1ada379bc83be3629418f`) so that it survives future re-clones.
- **Technical evidence remains evidence.** Nothing has been silently promoted into authority: the
  recovered implementation files, the recovered Phase 13 certification claims, and prior gate
  *findings* are all evidence, and none of them is the source of this authorization.
- No requirement has been added that was absent from the previously issued authorization.

---

## 1. Authorization

**G-AI-IMPL = A — IMPLEMENTATION AUTHORIZED.**

Authorized: the exact specification-derived delta and test contract recorded in `SPEC-G-AI-IMPL` —
**SR-1…SR-5** and **T1…T10**.

## 2. Authorized scope

| Element | Value |
|---|---|
| Specification requirements | **SR-1 … SR-5** |
| Test obligations | **T1 … T10** |
| Change surface | **5 new files + 6 modified files = 11 paths** |
| Must-not-touch boundaries | **10** |
| Scope constraints | **D1 … D8**, incorporated by reference |

The full text of each is in `SPEC-G-AI-IMPL`. This record does not restate or alter it.

## 3. Explicit separation: authorization ≠ controlled-change gate

This authorization **permits** the delta. It does **not** open repository mutation.

A separate **controlled implementation gate** must, before any implementation mutation:

1. re-verify this record and `SPEC-G-AI-IMPL` from the durable store;
2. re-verify the decisions `DEC-G-AI-IMPL-BS`;
3. re-verify the exact 11-path delta against the then-current baseline;
4. re-verify all 10 fences;
5. confirm the executable baseline decision **B1**.

Until that gate returns **IMPLEMENTATION GO**, implementation remains **BLOCKED**.

## 4. Not authorized by this record

- Baseline transition, branch switch, or checkout of `85bbd49`
- Restoration or copying of canonical files into the recovery checkout
- Replacement, modification or deletion of the recovery-only AI files
- Creation of the two MODIFY targets absent from the recovery baseline
- Implementation of `guardRead` or introduction of a second read-authorization model
- Route or navigation creation
- Certification, or any attempt at live-Keycloak certification
- Commit or push of implementation work
- Any change to PC-4, N+5, E2E-017, or the Engine Master Matrix
- Any expansion beyond the 11 authorized paths

## 5. Current status

**IMPLEMENTATION: BLOCKED.** See `DEC-G-AI-IMPL-BS` for the decision state of B1–B4 and S1–S4.
