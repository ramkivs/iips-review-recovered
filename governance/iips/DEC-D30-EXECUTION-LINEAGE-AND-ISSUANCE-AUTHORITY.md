# DEC-D30-EXECUTION-LINEAGE-AND-ISSUANCE-AUTHORITY — Execution Lineage and Maintainer-Issuance Determination

- **Record ID:** `DEC-D30-EXECUTION-LINEAGE-AND-ISSUANCE-AUTHORITY`
- **Title:** D30 — Authorized Execution Lineage for the D28 Relief, and the Maintainer-Issuance Mechanism
- **Class:** `DECISION`
- **Status:** `RECORDED — EXECUTION LINEAGE = phase13-next (D29's two execution-lineage restrictions superseded, bounded to the 15 §5.2 paths). MAINTAINER ISSUANCE = EXPLICIT MAINTAINER ACTION REQUIRED. **NO RELIEF EXECUTED BY THIS RECORD.**`
- **Date:** 2026-08-29
- **Authority relationship:** gate `D30 — Execution-Lineage and Maintainer-Issuance Authority
  Determination`, conducted **governance-only**. The maintainer selected, per matter: **execution
  lineage = authorize execution on `phase13-next`**; **maintainer issuance = explicit maintainer
  action required**; **`releaseTag` = record as an open gap**; and granted recording authority with
  commit and push on `arena`. **This record grants no A2 → A1 promotion, no fence-9 authority, no
  certification authority, and no release/tag authority.**
- **Scope:** determination of **where** the already-authorized D28 relief may be executed, and **how**
  the six required maintainer issuance acts may legitimately be performed. **The substantive D28
  scope is unchanged.** This record **executes nothing**.
- **Provenance:** every lineage and mechanism finding was measured this turn from `origin` — path
  presence by ref, `merge-base`, `git ls-remote --tags`, and a search of the repository for any
  issuance mechanism. No finding is inferred.
- **Supersession / revision relationship:** **supersedes exactly two restrictions in the D29
  execution gate** — *"Do not modify `phase13-next`"* and *"no push to `phase13-next`"* — **and only
  for the 15 paths enumerated in `SPEC-G-AI-IMPL` §5.2.** Nothing else in D29 is superseded; **D29's
  STOP before mutation remains correct history and is preserved.** **`DEC-D28-FENCE-RELIEF-AUTHORIZATION`
  is preserved unchanged**, as is its `§5.2` amendment. No other record is amended.

---

## 1. DECISIONS

| Matter | Decision |
|---|---|
| **A. Execution lineage** | **AUTHORIZE execution on `phase13-next`** — expressly superseding D29's two execution-lineage restrictions, **bounded to the 15 `§5.2` paths**. D28's substantive scope is unchanged; only the execution **location** is established |
| **B. Maintainer issuance** | **EXPLICIT MAINTAINER ACTION REQUIRED.** No standalone repository mechanism exists. The legitimate mechanism is the programme's established gate pattern |
| **`releaseTag` gap** | **RECORDED AS AN OPEN GAP** for the execution gate to resolve |
| **Recording** | Granted — this record, committed and pushed to `arena` |

---

## 2. WHY D29 COULD NOT EXECUTE — PRESERVED AS CORRECT HISTORY

`D29` correctly stopped before mutation, creating **0 authorized artifacts** and exercising **0
relief**. Its reasoning is confirmed and preserved:

1. All **15** authorized paths exist only within the `phase13-next` product lineage.
2. `arena` and `phase13-next` have **unrelated histories** — `merge-base` = **NONE**.
3. D29 prohibited modification and push of `phase13-next`.
4. The Arena session is constrained to the `arena` lineage.
5. Creating the artifacts on `arena` would produce evidence for engines **absent from that tree**,
   and 6 test files that cannot resolve a single import — i.e. **fabricated evidence**.

**D29 did not fail. It correctly refused to solve an authorization problem by expanding scope.**

---

## 3. LINEAGE ANALYSIS

### 3.1 Where each authorized path exists

| Authorized path group | `arena` | `phase13-next` |
|---|---|---|
| 3 independent-verification reports (`iips-platform/IES01x_…`) | parent dir present, but **no Tier-3 engine source** | parent dir present **with** engine source |
| 6 regression tests (`iips-platform/tests/regression/…`) | parent dir present, **0 Tier-3 tests** | present, with the 2 existing kinds per engine |
| Tier-3 engine implementations (`iips-platform/src/sector-engines/{telecommunications,automobile,materials-metals}/`) | **0 files each** | **11 files each** |
| 3 freeze manifests (`ies-0xx-*/IES-0xx_FREEZE_MANIFEST.json`) | parent dir **does not exist (0 files)** | parent dir present (12 files) |
| 3 readiness certificates (amend targets) | **ABSENT** | **present** |
| `iips-platform/` total | **359** | **398** |

### 3.2 Findings

| Question | Finding |
|---|---|
| Where do the authorized paths exist? | **Only within the `phase13-next` lineage** |
| Can D28 be executed on `arena`? | **NO** — unrelated histories; 0 Tier-3 engine files; 0 `ies-0xx-*` files. Execution there would be orphaned, non-compiling, fabricated evidence |
| Can D28 be executed on `phase13-next`? | **YES, technically** — verified at D29: `npm install` succeeds (6 packages), `tsx` available, the existing Tier-3 regression suite executes **54 tests / 54 pass / 0 fail** |
| Does changing the target ref expand D28? | **NO** — it changes only the execution **location**. The path set remains byte-for-byte the 15 paths in `SPEC-G-AI-IMPL` §5.2 |

### 3.3 Product-lineage integrity

Executing on `phase13-next` is **preferable to importing** the Tier-3 tree into `arena`. Importing
would add **39 product-code files** (3 engines × 11, plus 6 regression tests) that D28 does **not**
authorize, onto a lineage with unrelated history — altering product scope and creating a **second,
divergent source of truth** for the same three engines.

---

## 4. THE D29 RESTRICTIONS SUPERSEDED — EXACTLY TWO

| D29 restriction | Disposition |
|---|---|
| *"Do not modify `phase13-next`"* | **SUPERSEDED — for the 15 `§5.2` paths only** |
| *"no push to `phase13-next`"* | **SUPERSEDED — for commits containing only those 15 paths** |

**Not superseded, and still in force:**

- every D29 **exclusion** (the 60-artifact documentation programme; IES-016 factual/boilerplate
  corrections; IES-020 aluminium placement; dangling-citation corrections;
  `D-AUTHCLAIM-UNSUPPORTED`; unrelated methodology content; fence-9 matrix; A2/A1 status;
  certification beyond the authorized readiness evidence; any path outside D28);
- D29's **failure/stop rules**;
- D29's requirement to **stop and report** rather than modify unauthorized product code if a test
  exposes a genuine implementation defect;
- the prohibition on fabricating an issuer, date, signature or authorization.

**Any commit under this authority must contain only the 15 enumerated paths.** A commit touching any
other path exceeds this authorization.

---

## 5. SESSION-CAPABILITY CAVEAT — RECORDED SO IT IS NOT LATER ASSUMED AWAY

**A governance decision does not by itself make the work executable by this Arena session.** This
session is constrained to the `arena/01a03e3b-iips-review-recovered` lineage and **cannot push to
`phase13-next`**. Accordingly:

- This record establishes **where** the authorized relief belongs.
- It does **not** confer on this session the ability to write there.
- Execution requires **a session or mechanism with `phase13-next` write access**.

**This record does not treat the lineage authorization as overriding the session constraint, and no
push to `phase13-next` is made or implied by it.**

---

## 6. MAINTAINER ISSUANCE — MECHANISM DETERMINATION

### 6.1 Search result: no standalone repository mechanism exists

Verified **ABSENT**: `CODEOWNERS` · `.github/CODEOWNERS` · `.github/PULL_REQUEST_TEMPLATE.md` ·
`SECURITY.md` · any signature or approval-token convention. `CONTRIBUTING.md` exists but defines
contribution **principles** only, not an issuance mechanism.

### 6.2 The A1 form, measured

| Field | A1 value |
|---|---|
| `**Issuer:**` | `IIPS Engineering Standards Maintainer` |
| `**Issued:**` | a date (e.g. `2026-08-08`) |
| `**Status:**` | `AUTHORIZED — implementation may begin against the frozen baseline` |
| manifest `approver` | `IIPS Engineering Standards Maintainer` |
| freeze report `**Approver:**` | `IIPS Engineering Standards Maintainer` |

### 6.3 Determination

**EXPLICIT MAINTAINER ACTION REQUIRED.** The legitimate mechanism is the programme's **established
gate pattern**: an explicit maintainer act at a gate, recorded verbatim in a `DECISION`, which then
supplies the `Issuer` / `Issued` / `Status` / `approver` values. This is the mechanism used for
COL-1 … COL-5 and for every authority act from D10 through D28.

| Act | Existing mechanism? | Who must perform it? | Can Arena legitimately perform it? |
|---|---|---|---|
| IES-016 readiness issuance | Gate pattern only — no repository mechanism | **The maintainer** | **NO** — cannot self-issue |
| IES-017 readiness issuance | Same | **The maintainer** | **NO** |
| IES-020 readiness issuance | Same | **The maintainer** | **NO** |
| IES-016 manifest `approver` | Same | **The maintainer** | **NO** |
| IES-017 manifest `approver` | Same | **The maintainer** | **NO** |
| IES-020 manifest `approver` | Same | **The maintainer** | **NO** |

**Arena must not invent an issuer identity, an issued date, an approval identity, a signature or an
authorization.** Until the maintainer performs these six acts, **limb 2 (final readiness) and the
`approver` field of limb 3 (freeze/provenance) cannot be legitimately satisfied.**

---

## 7. NEW FINDING — THE `releaseTag` GAP

The A1 freeze manifests carry `releaseTag: ies-010-v1.0.0` / `ies-015-v1.0.0`, and the A1 freeze
reports carry `**Release Tag:** ies-0xx-v1.0.0`.

**`git ls-remote --tags origin` returns only `v3.0-phase12-certified`.** No `ies-016-v1.0.0`,
`ies-017-v1.0.0` or `ies-020-v1.0.0` tag exists.

Because D28 **excludes release/tag changes** and **forbids inventing values**, the Tier-3 manifests'
`releaseTag` field **cannot be populated from existing authoritative data**.

**Recorded as an OPEN GAP** for the execution gate to resolve — either by an explicit maintainer
decision on the field's value, or by recording it as null/deferred. **This record does not resolve
it and creates no tag.**

---

## 8. WHAT THIS RECORD DOES **NOT** GRANT

| Authority | Granted by D30? |
|---|---|
| **A2 → A1 promotion** | **NO** |
| **Fence-9 / matrix amendment** | **NO** |
| Certification | **NO** |
| Release or tag creation | **NO** |
| Any expansion of the D28 path scope | **NO** |
| Any relief beyond the 15 `§5.2` paths | **NO** |
| The six maintainer issuance acts | **NO — they remain the maintainer's to perform** |
| Execution of the relief by this Arena session | **NO — see §5** |
| Any change to methodology acceptance (`D25`) | **NO** |
| Any change to A1/A2 authority | **NO — remains 7 / 7** |

**This is a lineage and mechanism determination. It executes nothing.**

---

## 9. PARALLELISM

Once execution-lineage authority is in force and a mechanism with `phase13-next` write access
exists, **IES-016, IES-017 and IES-020 may execute fully in parallel**: their scopes are
structurally identical (3 created files each, plus 1 amended), with no cross-engine dependency.
Within an engine, the freeze manifest precedes the readiness-certificate amendment, because the A1
certificate certifies *"reference assets frozen"*. **D28's exact scope is preserved throughout.**

---

## 10. AUTHORITY REQUIRED TO UNBLOCK EXECUTION

| # | Requirement | Status after D30 |
|---|---|---|
| 1 | Execution-lineage authority for `phase13-next`, bounded to the 15 `§5.2` paths | **GRANTED by this record** |
| 2 | A session or mechanism with `phase13-next` write access | **NOT SUPPLIED** — see §5 |
| 3 | Six explicit maintainer issuance acts (3 certificates + 3 `approver` values) | **NOT PERFORMED** — the maintainer's to perform |
| 4 | Resolution of the `releaseTag` gap | **OPEN** |

---

## 11. RECOMMENDED SUCCESSOR

**A gate at which the maintainer performs the six issuance acts and resolves the `releaseTag`
field.** This is the smallest executable successor because it requires **no new artifact, no
lineage change and no product mutation**, and it is a prerequisite for limbs 2 and 3 regardless of
where execution occurs. **It is not pre-authorized and not executed by this record.**

---

## 12. WHAT THIS RECORD DOES NOT DO

No relief executed · no product / source / test / schema / persistence / parser / UI file created or
modified · no test created or executed · no independent verification performed · no freeze manifest
created · no readiness certificate issued or amended · no issuer, date, approver, signature or
authorization invented · no tag created · no A2 → A1 promotion · no matrix amendment · no fence-9
change · no certification · no expansion of the D28 scope · no relief for any path outside
`SPEC-G-AI-IMPL` §5.2 · no amendment of `DEC-D28-FENCE-RELIEF-AUTHORIZATION` or of any other prior
record · no push to `phase13-next` · no change to methodology acceptance · no change to A1/A2
authority · no P7 reopening · no H/I/J execution · no branch merged, rebased, created, moved or
deleted other than the single named `arena` refspec · no force-push.

## 13. CLASSIFICATION

# **D30 RECORDED — EXECUTION LINEAGE = `phase13-next` · ISSUANCE = EXPLICIT MAINTAINER ACTION**

The already-authorized D28 relief may be executed **only within the `phase13-next` lineage**, which
is the only lineage containing the Tier-3 implementations and the 15 authorized paths. **Exactly two
D29 restrictions are superseded** — *"do not modify `phase13-next`"* and *"no push to
`phase13-next`"* — **bounded to the 15 `§5.2` paths**; every D29 exclusion and stop rule remains in
force, and **D29's STOP is preserved as correct history**. **D28's substantive scope is unchanged —
only the execution location is established.** **No standalone maintainer-issuance mechanism exists**
in the repository; the legitimate mechanism is the established gate pattern, so the **six issuance
acts remain the maintainer's to perform** and Arena must not fabricate them. The **`releaseTag` gap
is recorded as open**. **A governance decision does not confer on this Arena session the ability to
write to `phase13-next`** — execution additionally requires a mechanism with that access. **No
relief is executed by this record. No A2 → A1 promotion. No fence-9 authority. A1/A2 remains 7 / 7.**
**STOP.**
