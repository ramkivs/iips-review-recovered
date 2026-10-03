# NP-13 — D2-A BASELINE NATURE SELECTION: EXPLICIT PA DECISION

> **Record identifier:** `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01`
>
> **Gate:** NP-13 D2-A — Baseline Nature Selection
>
> **Decision date:** 2026-10-03
>
> **Program Authority:** Ramki (Ramakrishnan)
>
> **Decision:** **A — SELECT M1**
>
> **Durability status:** **NOT DURABLE — publication pending separate authorization**

## 1. Explicit decision

Ramki, as Program Authority, explicitly selected:

> **D2-A option A — SELECT M1**

This is a narrowly scoped D2-A baseline-nature selection. It is an explicit Program Authority choice, not an inference from repository history, current branch state, implementation convenience, or another workstream.

## 2. Option definitions preserved

The authoritative NP-13 corpus defines the alternatives as follows (`NP-13-D0-01 §4.3`; `NP-13-D1-01 §7.6`; `NP-13-D2-01-DEFINITION-01 §4.3`):

- **M1 — single repository/ref:** baseline anchored to a single operational ref. **Selected.**
- **M2 — multi-ref composition:** baseline composed across multiple refs. **Not selected.**
- **M3 — ref-independent governed artifact set:** baseline defined independently of any ref. **Not selected.**

M2’s operational mapping to G-O-3(b), and M3’s operational relationship to G-O-3(b), remain as previously identified: **underspecified**. They are not resolved or reinterpreted by this decision. No additional comparative rationale for their non-selection is asserted beyond Ramki’s explicit selection of M1.

## 3. Consistency and scope of M1

M1 selects the **structural nature** of the baseline: one repository/ref. It does **not** name or bind the specific repository or ref.

The selection preserves D1 and G-O-3(b):

- Governed-object identity remains distinct from repository, ref, commit, tree, implementation, runtime realization, and evidence realization.
- Repository/ref binding remains a separate governance relationship, not governed-object identity.
- The repository, mutable operational ref, and immutable evidence coordinate remain distinct.
- The selection does not establish a particular binding or evidence coordinate.

Accordingly, M1 does not designate `origin/main`—or any other ref—as the NP-13 baseline.

## 4. Required follow-on boundaries

- **D2-B remains not decided and not performed.** A later, separately authorized E-3 act must bind the specific repository/ref, verify its target, and designate initial authoritative evidence. Under F-3, the Git tree is primary evidence and the commit is supporting provenance.
- **D2-C remains not decided and not performed.** It retains responsibility for realization semantics and C-1/C-2 durability reconciliation.
- No composition, membership, workstream, divergence, or NP-09 special-case determination is made; those matters remain outside D2-A.
- No D3 work or implementation authority is granted.

## 5. Explicit non-actions

This decision does **not**:

- bind a repository or ref;
- designate or refresh an evidence coordinate;
- determine membership or compose the baseline;
- decide realization semantics or reconcile C-1/C-2;
- execute D2-B or D2-C, complete D2, or perform D3;
- authorize implementation, runtime, production, certification, or release activity; or
- amend, reinterpret, or supersede any predecessor NP-13 record.

## 6. Resulting disposition

```text
D2-A = M1 SELECTED — DECISION ACT RENDERED
D2-A DURABILITY = NOT YET DURABLE
D2-B = DEFINED / NOT DECIDED
D2-C = DEFINED / NOT DECIDED
D2 = NOT COMPLETE
IMPLEMENTATION AUTHORITY = NOT GRANTED
D3 = NOT ELIGIBLE / NOT DEFINED
```

Under `NP-13-D2-01-DEFINITION-01 §8.1`, the D2-A completion condition requiring a durable D2-A decision record remains unsatisfied until publication and independent remote verification.

## 7. Durability and publication boundary

Observed IRR `origin/main` during preparation: `59adbfd22df3f582fb7d1b399797f14a7e111f4d`. This is repository-state provenance only and is **not** a baseline binding.

This draft is not authoritative or durable. Publication to IRR `refs/heads/main` and independent remote verification are still required for durability. **No publication authorization is granted or inferred by Ramki’s M1 selection.**
