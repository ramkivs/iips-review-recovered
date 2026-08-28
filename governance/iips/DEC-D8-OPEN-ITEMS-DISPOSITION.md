# DEC-D8-OPEN-ITEMS-DISPOSITION — D8 Open Items Disposition

- **Record ID:** `DEC-D8-OPEN-ITEMS-DISPOSITION`
- **Title:** D8 — Disposition of Remaining Governance References and Open Items
- **Class:** `DECISION`
- **Status:** `RECORDED — §1=A, §2=A, §3=A, §4=B, §5=A`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D8 — REMAINING GOVERNANCE REFERENCES / OPEN ITEMS
  DISPOSITION AUTHORITY GATE`. The maintainer was presented with options A / B / C for each of
  §1–§5 and selected explicitly per section. Governance recording authority was granted
  separately and explicitly, scoped to `governance/iips/` on `arena` only.
- **Scope:** disposition of five carried-forward open items, plus one newly discovered defect.
  **No product-branch mutation, no matrix amendment, no `AUTH-G-AI-IMPL` amendment, no
  evidence-artifact creation, no verifier engagement, no methodology change, no certification,
  no release/promotion, no P7 reopening.**
- **Provenance:** read-only discovery against `origin` (never local refs) in the same turn.
  Every fact below carries the command that produced it.
- **Supersession / revision relationship:** amends nothing. Closes five items carried forward by
  `DEC-A2-A1-TIER3-CREATION-AUTHORITY` §10. Companion records:
  `DEC-D8-HIJ-CONFIG-DEFECT`, `DEC-D8-HIJ-VALIDATION-PLAN`.

---

## 1. STATE VERIFIED AT GATE ENTRY

`git ls-remote origin` → **8 refs**, identical to the recorded D7 end-state:

| Ref | SHA |
|---|---|
| `HEAD` / `refs/heads/main` | `c65d53373717aacc3a1dce12d47b5aeaf50541a5` |
| `refs/heads/arena/01a03e3b-iips-review-recovered` | `bbd2f9c69137a22d5b55febd12f60d149532bef6` |
| `refs/heads/gai-impl-canonical` | `f63a9b493118643725568a95b86405a5835a30a0` |
| `refs/heads/phase13-hardening-delivery` | `254e47233e639d089c59f07f394e4a6b46d8970f` |
| `refs/heads/phase13-next` | `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` |
| `refs/tags/v3.0-phase12-certified` | `a975b0dc5d91422a0fd4b24030fa4905712f82e4` |
| `refs/tags/v3.0-phase12-certified^{}` | `7325aeda8c9881ebdf2b96f64323998f1c46ba26` |

| Item | Verified value | Command |
|---|---|---|
| `program-v3-matrix-rebaseline` | **ABSENT** — D7 deletion holds | `git ls-remote origin` (8 refs, none matching) |
| Durable store | **32 records** in `governance/iips/` on `arena` | `git ls-tree -r origin/arena/… -- governance/iips/` |
| Matrix blob | **`cada0451400409b0fe9ff0d62309b756c7b45e43`** — unchanged since D4 | `git rev-parse origin/phase13-next:docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` |
| Cross-lineage | `merge-base(phase13-next, arena)` → **exit 1, NONE** | `git merge-base` |
| Matrix rows | **14 engine rows; class A = 14; A1 = 7; A2 = 7** | field-wise parse of §3 table |
| §3.2 AI Advisory row | Class **A**, maturity **A2** — explicitly **not** one of the 14 | matrix §3.2 |

**Sandbox note (disclosure):** this turn the sandbox did **not** re-provision. The gov2–gov8
clones and the out-of-repo reports survived. This is a deviation from the ~8 prior
re-provisions and is recorded so the durability conclusion is not mistaken for a change in
policy — D6 stands unchanged.

### 1.1 Local working-tree divergence (disclosed, non-authoritative)

`/home/user/iips-review-recovered/governance/iips/` holds **16** files against 32 durable:

| Class | Count | Detail |
|---|---|---|
| **SAME** as durable | 14 | blob-identical |
| **DIFF** from durable | 2 | `AUTH-G-AI-IMPL.md` local `081c4f930409` vs durable `5f8582a1ce7b`; `SPEC-G-AI-IMPL.md` local `b7b2054b7123` vs durable `c574ab731a99` — both are **pre-amendment** copies |
| **MISSING locally** | 16 | includes all D2–D7 records |

Per D6 the durable store is `origin/arena`. **The local copies are non-authoritative and were
not used as a source for any finding in this record.** No action taken on them.

---

## 2. CORRECTIONS TO THE GATE'S OWN PREMISES

Three premises did not survive verification. They are recorded here so no future gate inherits
them.

### 2.1 §2's term list is wrong about `AUTH-G-AI-IMPL`

The gate prompt placed `TRIM-S`, `TRIM-V`, `HARVEST` and `NO-DECISION` in `AUTH-G-AI-IMPL` §4.
Whole-file grep: **all four = 0 occurrences**. They are not in that document at all; per
`DEC-D2-DANGLING-VOCABULARY` §4 they originate in `DEC-G-AI-IMPL-CERT-CRITERIA`.

`AUTH-G-AI-IMPL` §4's referent-less prohibition is **exactly one clause, at line 103**:

```
- Any change to PC-4, N+5, E2E-017, or the Engine Master Matrix
```

| Term | Occurrences in `AUTH-G-AI-IMPL` | In §4? | Referent (per D2) |
|---|---|---|---|
| `PC-4` | 1 | yes | **NONE** |
| `N+5` | 1 | yes | **YES** — 4 files at `phase13-next` |
| `E2E-017` | 1 | yes | **NONE** |
| `Engine Master Matrix` | 1 | yes | **NONE** |
| `P7` | 1 | yes — but in certification-amendment prose (*"**P7 was not reopened**"*), **not** a prohibition | **NONE** |
| `TRIM-S`, `TRIM-V`, `HARVEST`, `NO-DECISION` | **0** | no | NONE |

**Consequence:** the annotation contemplated by §2 Option B would touch **one clause naming
three referent-less terms**, not the seven-item list the prompt implied.

### 2.2 New defect — `D-HIJ-CONFIG`

`DEC-G-AI-IMPL-CERTIFICATION` §5 records *"no compose or IdP configuration is tracked in the
repository."* The **IdP half is false**, and was false at the time of writing. Full detail and
evidence in the companion record **`DEC-D8-HIJ-CONFIG-DEFECT`**. The H/I/J **outcome is
unchanged**; only the recorded **reason** is corrected. The historical record itself is **not**
amended — amendment was not within the authority granted at this gate.

### 2.3 §5 Option B was substantively empty as scoped

The gate's §5 Option B proposed to *"investigate the simulated-independence and A1-parity
questions."* Both are **already resolved durably** in `DEC-A2-A1-TIER3-CREATION-AUTHORITY` §10:

- `D7-TIER3-INDEPENDENCE` → **"RESOLVED AS A NEGATIVE"**
- `D7-TIER3-PARITY` → **OPEN but conclusively characterized**

What remains is a **decision**, not a discovery gap. This was disclosed before selection; the
maintainer selected **A**.

---

## 3. DECISIONS

### §1 — Dangling-citation disposition = **A**

**Leave as accepted cross-lineage references. No matrix amendment.**

Verified basis: the matrix on `phase13-next` carries **4 distinct dangling citations** at 6 line
positions —

| Citation | Lines |
|---|---|
| `governance/iips/DEC-D5-EVIDENCE-MATURITY.md` | 55, 89 |
| `governance/iips/DEC-D3-MATRIX-REBASELINE.md` | 56 |
| `governance/iips/DEC-G-AI-IMPL-CERTIFICATION.md` | 83, 109 |
| `governance/iips/DEC-G-AI-IMPL-CERT-CRITERIA.md` | 110 |

`governance/iips/` does not exist on `phase13-next` (that tree holds only 4 pre-existing
top-level `governance/*.md` files). `merge-base(phase13-next, arena)` = **NONE**, so they are
unresolvable by traversal.

**Effect of A:** `DEC-D6-DURABLE-RECORDING-POLICY` §3 already records this as an **accepted
consequence**, already fixes the resolution rule (*"they resolve against
`origin/arena/01a03e3b-iips-review-recovered`, path `governance/iips/<name>`"*), and already
states that any future resolution **must be an annotation, not a duplication**. Selecting A
**closes the open item** by adopting that recorded interpretation as the standing disposition.
The matrix blob remains `cada0451400409b0fe9ff0d62309b756c7b45e43`.

**Not done:** no matrix amendment. A cross-ref annotation remains **available** at any future
gate under its own matrix-amendment authority.

### §2 — `AUTH-G-AI-IMPL` §4 referent-less prohibitions = **A**

**Leave unchanged and rely on the D2 record. No authority-document mutation.**

`DEC-D2-DANGLING-VOCABULARY` §5.5 already records the prohibition as **3-of-4 unenforceable as
written**, keeps it **in force for `N+5`**, and states that the text is not amended by that
record. Selecting A adopts that as the standing disposition. `AUTH-G-AI-IMPL.md` remains at
durable blob `5f8582a1ce7b19ca64cf80cf996ad4c9c529b7da`.

**Recorded residual risk (accepted, not remediated):** the unenforceable clause stays in the
authority document. A reader of `AUTH-G-AI-IMPL` alone, without D2, will read three
nonexistent artifacts as protected. The propagation D2 §4 describes is **terminated by D2's
disposition**, not by this record.

### §3 — P7 disposition = **A**

**Permanently record P7 as an unresolved / no-referent item. No PASS claim. No reopening.**

Verified basis: `git grep -w -I -e P7 <ref> -- ':!*lock*'` → **0 files** at `origin/main`,
`origin/phase13-next`, `origin/gai-impl-canonical`, `origin/phase13-hardening-delivery`.
**51 occurrences** inside the `arena` governance records — consistent with D2 §4's finding that
the term is **self-propagating through this session's own records**.

**Standing status, permanent:**

| Property | Value |
|---|---|
| Authoritative referent | **NONE — in any product ref, at any commit inspected** |
| Artifact | **NONE** |
| Baseline | **NONE** |
| Certification status | **NEVER CLAIMED — not PASS, not FAIL, not SKIPPED. No status exists** |
| Reopening | **NOT AUTHORIZED by this record, and not proposed** |

This **closes** the item carried as *"P7 referent — OPEN"* in `DEC-A2-A1-TIER3-CREATION-AUTHORITY`
§10. It is closed **as no-referent**, not as resolved. Should a genuine referent ever be
produced from outside this session's records, that is **new information requiring a new gate**;
nothing here precludes it, and nothing here anticipates it.

### §4 — H/I/J disposition = **B**

**Authorize future validation planning only. No live validation performed now.**

The H/I/J status is **unchanged**: `NOT PERFORMED`, recorded as an **Option-D limitation, not a
failure**, and **not self-clearing** (`DEC-G-AI-IMPL-CERTIFICATION` lines 70–72, 79, 186–190).
Infrastructure re-verified at this gate:

```
docker             NOT FOUND      google-chrome      NOT FOUND
podman             NOT FOUND      firefox            NOT FOUND
docker-compose     NOT FOUND      127.0.0.1:8080  -> 000
nerdctl            NOT FOUND
chromium           NOT FOUND
```

**What B authorizes, exactly:** production of a **written validation plan**. That plan is
recorded in the companion record **`DEC-D8-HIJ-VALIDATION-PLAN`**.

**What B does NOT authorize** — and none of it was done:

- no live validation of any kind;
- no test executed, no server started, no Keycloak contacted;
- no new test path or file created anywhere in the repository;
- no import, restoration, copying or derivation from the recovered live-certification test
  (`frontend/server/live/ai-advisory-live-certification.test.ts`, blob `2bcaac3329de`), which
  **remains recovery evidence only** — verified still **absent** from `phase13-next`
  (`git ls-tree … -- frontend/server/live/ | grep -c ai-advisory` → **0**);
- no withdrawal of the H/I/J limitation. **The limitation stands and remains not self-clearing.**

Executing the plan requires **its own separate authority**, granted only when the infrastructure
exists.

### §5 — Tier-3 future pathway = **A**

**Leave dormant pending prerequisites.**

No evidence creation, no verifier engagement, no methodology change. The two constraints from
`DEC-A2-A1-TIER3-CREATION-AUTHORITY` §12 stand unchanged:

1. any future Tier-3 independent verification **must be labelled *simulated*** — no genuinely
   independent verifier exists (`D7-TIER3-INDEPENDENCE`, resolved as a negative);
2. Tier 3 **cannot reach A1** on the IES-010 evidentiary standard without a major documentation
   programme **or** an explicit methodology redefinition affecting all 14 — and `D7-3 = A`
   **forbids** a Tier-3 exception to the A1 definition.

`D7-TIER3-PARITY` remains **OPEN as characterized**, now explicitly **dormant** rather than
merely un-actioned. All 14 capabilities remain **Class A**; the 7 A2 capabilities remain **A2**.

---

## 4. OPEN ITEMS AFTER D8

| Item | Status after D8 |
|---|---|
| Dangling-citation annotation | **CLOSED — §1 = A**, accepted cross-lineage; annotation remains available under separate authority |
| `AUTH-G-AI-IMPL` §4 annotation | **CLOSED — §2 = A**, relies on D2 |
| P7 referent | **CLOSED — §3 = A**, permanently no-referent, never PASS, not reopened |
| H/I/J Option-D validation | **PLAN AUTHORIZED, EXECUTION NOT AUTHORIZED — §4 = B.** Limitation stands, not self-clearing |
| Tier-3 A1 pathway | **DORMANT — §5 = A**, prerequisites unchanged |
| `D-HIJ-CONFIG` | **NEW — REPORTED, NOT REMEDIATED.** Correction of `DEC-G-AI-IMPL-CERTIFICATION` §5 requires separate authority |
| `D-README-STALE` | **NEW — REPORTED, NOT REMEDIATED.** See §5 |

---

## 5. NEW FINDING — `D-README-STALE` (reported, not remediated)

`governance/iips/README.md` (durable blob `70939d79d7153eea893592e8e0c952803dcbfa95`) carries a
**"Current state"** table that is contradicted by the durable record chain:

| README says | Durable record chain says |
|---|---|
| `G-AI-IMPL authorization` — **NOT ESTABLISHED** | `AUTH-G-AI-IMPL` exists and is `ACTIVE`, with §4 amendments |
| `G-AI-IMPL implementation specification` — **NOT ESTABLISHED** | `SPEC-G-AI-IMPL` exists, amended to 13 paths |
| `Decisions B1–B4, S1–S4` — **UNRESOLVED** | resolved across `DEC-G-AI-IMPL-B1*`, `-B2-B4`, `-S1-S4`, `-S2`, `-S4`, `-SR1` |
| `G-AI-IMPL implementation` — **BLOCKED** | implemented at `e5d59981…`, tested at `f63a9b49…`, certified per `DEC-G-AI-IMPL-CERTIFICATION` |

The README is an **index/convention document, not a decision record**; its staleness does not
change any authority, because authority lives in the named `DEC-*` / `AUTH-*` / `SPEC-*` records.
It is **reported exactly and not corrected**: amending an existing record was outside the
`DEC-D8-*` recording authority granted at this gate.

---

## 6. WHAT THIS RECORD DOES NOT DO

No matrix amendment · no `AUTH-G-AI-IMPL` or `SPEC-G-AI-IMPL` amendment · no amendment of any
historical record, including `DEC-G-AI-IMPL-CERTIFICATION` · no `README.md` update · no evidence
artifact created · no independent-verification report authored · no verifier engaged or invented ·
no A2 → A1 transition · no engine or implementation change · no Class A capability status change ·
no certification change · no H/I/J limitation withdrawn · no live validation performed · no test
executed · no server started · no release/version/tag promotion · no P7 reopening and no P7 status
claim · no restoration of historical artifacts · no D5-S1 threshold change · no branch merged,
rebased, created, moved or deleted · no ref other than `arena` moved · no force-push.

## 7. CLASSIFICATION

# **D8 RECORDED — §1=A · §2=A · §3=A · §4=B · §5=A**

Four open items **closed**; one **authorized for planning only**; two new defects
(`D-HIJ-CONFIG`, `D-README-STALE`) **reported and not remediated**. All 14 capabilities remain
**Class A**, **7 A1 / 7 A2**. The matrix on `phase13-next` is **unchanged** at
`cada0451400409b0fe9ff0d62309b756c7b45e43`. No product branch moved. **STOP after recording —
no further authority is held or inferred.**
