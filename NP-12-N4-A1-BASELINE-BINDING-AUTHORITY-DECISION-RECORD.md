# NP-12 N4-A1 — Baseline-Binding Authority Decision Record

**Record type:** Governance authority and baseline-binding act
**Status:** **PREPARED — NOT EFFECTIVE UNTIL AUTHORITATIVE IRR `main` PUBLICATION**
**Workstream:** NP-12 — Governed Screener
**Gate:** N4-A1 — CSIP Ontology Applicability & Producer-Boundary Authority Determination
**Prepared:** 2026-10-02

## 1. Authority

**Authority holder:** Ramki (Ramakrishnan)
**Authority role:** IIPS Program Authority
**Authority basis:** The explicit, narrowly scoped Program Authority authorization supplied for N4-A1-B5. This act records and exercises that authorization; it does not infer additional authority from the role title.

**Authority granted and exercised by this act:** For the single N4-A1 investigation, designate and bind an immutable IRR repository/ref/commit/tree snapshot; prescribe the treatment of ref movement and rebinding; define the binding duration; and require durable publication and independent verification.

This authority is specific to N4-A1 and does not confer authority to select baselines for other investigations or workstreams.

## 2. Scope and exclusions

This act applies only to:

> **NP-12 → N4-A1 — CSIP Ontology Applicability & Producer-Boundary Authority Determination**

It grants no authority for implementation, CSIP → EngineOutput implementation, EngineOutput → Screen implementation, producer ownership, CSIP ontology extension, provenance-policy changes, Screen evaluator implementation, persistence, production, certification, acceptance, or reopening N4-SD. IPD remains reference-only and production remains out of scope.

## 3. Baseline binding

Under the authority above, the N4-A1 investigation baseline is bound to:

| Component | Selected value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Ref at selection | `refs/heads/main` |
| Commit | `f2886a5af43ad8df8676589daef86836039150f5` |
| Tree | `46c1a15bbcd1291701484457d1fe9815d8538888` |

The **commit and tree**, not the moving branch name, identify the immutable investigation snapshot. This binding is specific to N4-A1 and does not select or designate any other repository snapshot.

## 4. Selection evidence

At preparation, a read-only query of authoritative IRR `main` reported commit `f2886a5af43ad8df8676589daef86836039150f5` and tree `46c1a15bbcd1291701484457d1fe9815d8538888`.

Comparison with the prior N4 execution baseline `5ad7812bbe11acfc66e0b0e50c041fddaa63c20f` / tree `c44960185e1d7be7b67a6e6198bec3346fb53dfc` showed five intervening commits:

| Commit | Change |
|---|---|
| `72bc2b09b699718e502a045a1cb70cdf8ccdf355` | Adds NP-13 D0 bounded feature-baseline jurisdiction decision |
| `0d87d6a36d6f22ba7a12eddc8a5d87441f795b9f` | Adds NP-13 D1 governed-object definition record |
| `6831d1929258538930d07c444a767d882536f683` | Merges PR #12 containing NP-13 D0 and D1 |
| `fc86eed349f52c63b1534527174c7db118f7ebc5` | Adds NP-13 D1-C hybrid identity-boundary decision |
| `f2886a5af43ad8df8676589daef86836039150f5` | Merges PR #14 containing NP-13 D1-C; current selected snapshot |

The only added paths are `docs/integration/NP-13-D0-01.md`, `docs/integration/NP-13-D1-01.md`, and `docs/integration/NP-13-D1-C-01.md`. No N4 or CSIP source files changed in that comparison. These additions are NP-13 governance records; they do not bind the NP-12 N4-A1 investigation baseline. Selecting the verified current IRR `main` snapshot therefore includes the current authoritative governance context without assuming that branch advancement itself selects a baseline. The earlier `5ad7812…` and `6831d192…` snapshots are not selected.

## 5. Moving-ref and rebinding rule

After publication makes this act effective, the N4-A1 baseline remains the exact commit/tree in §3 even if `refs/heads/main` advances. A later branch tip does not silently update or replace this baseline.

Rebinding requires a separate, explicit Program Authority act that identifies the replacement repository/ref/commit/tree and its scope. No automatic rebinding or delegation is authorized by this record.

## 6. Duration

This binding applies only to the single N4-A1 investigation and remains in force until N4-A1 is formally closed. On closure, it remains as historical provenance but authorizes no new run, reopening, or other workstream. Any reopening or repeat investigation requires a separately authorized baseline-binding act.

## 7. Durability and effectiveness

This prepared copy is not itself authoritative while it exists only on an Arena/session branch or in an unmerged pull request. **This act becomes effective only when this exact artifact is durably published on authoritative IRR `refs/heads/main` and its publication is independently verified.**

Required authoritative verification after publication:

1. Confirm this artifact exists on remote IRR `main` and its contents match this prepared record.
2. Confirm the publishing commit is reachable from remote `main`.
3. Confirm the recorded repository, ref, commit, and tree values are intact.
4. Confirm the authoritative checkout is clean.

## 8. Next gate and non-actions

Once authoritative publication and verification are complete, the next gate is:

> **N4-A1 — CSIP Ontology Applicability & Producer-Boundary Authority Determination**

This record does not perform that investigation, decide its applicability or producer-boundary findings, reopen N4-SD, or authorize implementation.

**End of prepared baseline-binding decision record.**
