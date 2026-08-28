# DEC-D12-CLASSIFICATION-CONVENTION — D-CLASS-DUAL Resolved by Convention Amendment

- **Record ID:** `DEC-D12-CLASSIFICATION-CONVENTION`
- **Title:** D12 — Classification-Metadata Disposition: the Class Convention Amended to Recognize a Primary Class plus an Optional Descriptive Qualifier
- **Class:** `DECISION` / `CONVENTION AMENDMENT`
- **Status:** `RECORDED — §1 = D, §2 = B. CONVENTION AMENDED; NO RECORD EDITED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D12 — D-CLASS-DUAL CLASSIFICATION-METADATA DISPOSITION`. The
  maintainer selected **§1 = D** (amend the class convention rather than edit an individual
  record) and **§2 = B**, granting **two separate authorities**: (a) **narrowly scoped amendment
  authority** for **exactly one file**, `governance/iips/README.md`, and (b) separate
  **governance recording authority** on `arena`. §1 = D is expressly a
  **methodology/convention** authority, as the gate itself characterized it — not cleanup
  authority. Neither grant was inferred from configured credentials, from write capability, or
  from any prior GO.
- **Scope:** amendment of the **class convention** in `governance/iips/README.md` only, plus this
  record. **No product-branch mutation, no matrix change, no engine or implementation change, no
  certification-result change, no evidence creation, no H/I/J execution, no Tier-3 activity, no
  P7 reopening, and no editing of any dated record.**
- **Provenance:** read-only discovery against `origin` in the same turn. Every count below was
  produced by parsing the `Class:` line of all 38 files programmatically.
- **Supersession / revision relationship:** amends two passages of `README.md` — the *Record
  classes* section and the closing sentence of *Limits* — **preserving the original text** via the
  established `~~original~~ — **AMENDED by …**` convention. Closes `D-CLASS-DUAL`. **Corrects the
  scope statement made in `DEC-D11-STANDING-CONSISTENCY` §6**, which is a dated record and is
  therefore **not** edited; the correction is made here instead.

---

## 1. SELECTIONS

| Section | Question | Selected |
|---|---|---|
| **§1** | D-CLASS-DUAL disposition | **D — amend the convention: primary class + optional qualifier** |
| **§2** | Recording authority | **B — recording + narrowly scoped amendment authority** |

Options **A**, **A-as-literally-worded**, **B1**, **B2** and **C** were presented and **not**
selected. Option **D** was **not in the gate as drafted**; it was surfaced by discovery because
the offered set contained no complete remedy.

---

## 2. PRECHECK STATE

**No re-provision this turn.** `git ls-remote origin` → **8 refs**, identical to the D11
end-state: `arena` `972c6f8b8a27f17977a524b299e3c25e3008822d` · `phase13-next`
`357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` · `main` `c65d533…` · `gai-impl-canonical`
`f63a9b49…` · `phase13-hardening-delivery` `254e4723…` · tag pair `a975b0dc…` / `7325aeda…`.
`governance/iips/` = **38 records** before this commit. Matrix =
`cada0451400409b0fe9ff0d62309b756c7b45e43`.

---

## 3. THE FINDING — SYSTEMIC, NOT A SINGLE DEFECT

The gate's premise described one defect at `DEC-G-AI-IMPL-CERTIFICATION:5`. Parsing the `Class:`
line of **all 38** files gives a different picture:

| Metric | Value |
|---|---|
| Files in `governance/iips/` | 38 |
| Records with a `Class:` line | **37** (`README.md` has none — it *is* the convention document) |
| **Single-class — compliant with the old rule** | **22** |
| **Dual-class — violating "exactly one class"** | **15** (**40.5 %** of classified records) |
| Records with 3+ classes | 0 |
| Distinct **undeclared** class tokens | **7** |

`README` declared exactly four classes: `AUTHORIZATION`, `SPECIFICATION`, `DECISION`, `GATE`.

### 3.1 The 15 records and their undeclared tokens

| Record | Declared | Undeclared token | Position |
|---|---|---|---|
| `DEC-A2-A1-CLOSURE-STRATEGY` | `DECISION / AUTHORITY` | `AUTHORITY` | 2 |
| `DEC-A2-A1-TIER3-CREATION-AUTHORITY` | `DECISION / AUTHORITY` | `AUTHORITY` | 2 |
| `DEC-D2-DANGLING-VOCABULARY` | `DECISION / AUTHORITY` | `AUTHORITY` | 2 |
| `DEC-D3-MATRIX-REBASELINE` | `DECISION / AUTHORITY` | `AUTHORITY` | 2 |
| `DEC-D4-AI-ADVISORY-INTEGRATION` | `DECISION / EXECUTION RECORD` | `EXECUTION RECORD` | 2 |
| `DEC-D5-EVIDENCE-MATURITY` | `DECISION / METHODOLOGY AUTHORITY` | `METHODOLOGY AUTHORITY` | 2 |
| `DEC-D5-S1-REGRESSION-EVIDENCE` | `DECISION / METHODOLOGY AUTHORITY` | `METHODOLOGY AUTHORITY` | 2 |
| `DEC-D5-S3-EVIDENCE-DEBT` | `DECISION / AUTHORITY` | `AUTHORITY` | 2 |
| `DEC-D6-DURABLE-RECORDING-POLICY` | `DECISION / POLICY` | `POLICY` | 2 |
| `DEC-D7-EVIDENCE-DEBT-DISPOSITION` | `DECISION / AUTHORITY` | `AUTHORITY` | 2 |
| `DEC-E2E-013-BASELINE` | `DECISION / AUTHORITY` | `AUTHORITY` | 2 |
| **`DEC-G-AI-IMPL-CERTIFICATION`** | **`CERTIFICATION / DECISION`** | **`CERTIFICATION`** | **1** |
| `DEC-G-AI-IMPL-IMPL-COMMIT-PUSH` | `DECISION / AUTHORITY RECONCILIATION` | `AUTHORITY RECONCILIATION` | 2 |
| `DEC-G-AI-IMPL-PATH-COUNT` | `DECISION / DOCUMENTATION CORRECTION` | `DOCUMENTATION CORRECTION` | 2 |
| `DEC-MATRIX-REBASELINE-BRANCH-DISPOSITION` | `DECISION / AUTHORITY` | `AUTHORITY` | 2 |

**`CERTIFICATION` is 1 of 7 undeclared tokens, and its record is 1 of 15 violators.** It is also
the **only** one of the 15 with the undeclared token at **position 1**.

**In all 15 the declared class is `DECISION`.**

---

## 4. SELF-CORRECTION — `DEC-D11-STANDING-CONSISTENCY` §6 UNDERSTATED THE SCOPE

`DEC-D11-STANDING-CONSISTENCY` §6 described `D-CLASS-DUAL` as a single-line problem in one record.
**That scope statement was wrong, by a factor of 15.** The D11 discovery grepped for the
`CERTIFICATION` token specifically and **never tested README's general *"exactly one class"* rule
across the store**.

The defect reported was real; only its **scope** was understated. `DEC-D11-STANDING-CONSISTENCY`
is a **dated record** and is therefore **not edited**. **This record is the correction.**

---

## 5. CHRONOLOGY — THESE WERE VIOLATIONS FROM INCEPTION

`README`'s class table was committed at **`191d595`** (*"governance(iips): establish durable IIPS
authority record store"*, 2026-08-27). Verified by `git merge-base --is-ancestor 191d595 <c>`:

| Record creation commit | `191d595` is an ancestor? |
|---|---|
| `ff9c750` — `DEC-G-AI-IMPL-BS` | **YES** |
| `79b0437` — `DEC-G-AI-IMPL-CERTIFICATION` | **YES** |
| `3425604` — `DEC-G-AI-IMPL-PATH-COUNT` | **YES** |
| `abfbcda` — `DEC-D2-DANGLING-VOCABULARY` | **YES** |

**This distinction is material.** The corrections at D9, D10 and D11 addressed statements that
were **true when written** and later became stale. These class lines were **never valid** — each
broke a convention already in force. The argument that protected the dated `BLOCKED` occurrences
from amendment therefore **does not apply here**.

**Practice drifted over time:** `DEC-D8-HIJ-CONFIG-DEFECT`, `DEC-D8-HIJ-VALIDATION-PLAN`,
`DEC-D8-OPEN-ITEMS-DISPOSITION`, `DEC-D9-RECORD-CORRECTION`, `DEC-D10-PATH-COUNT-CONSISTENCY` and
`DEC-D11-STANDING-CONSISTENCY` all declare a **single** class. The dual-class pattern belongs
entirely to the earlier records.

---

## 6. §1 = D — THE CONVENTION AMENDMENT

Two passages of `governance/iips/README.md` were amended. **Both are part of the class
convention**; amending the second is a **necessary consequence** of the first, because without it
the *Limits* sentence would leave the qualifiers already in use non-compliant. Original text is
preserved in both places.

### 6.1 *Record classes* section

`Every record declares exactly one class.` is **struck** and replaced by the rule that a record
declares **exactly one *primary* class** from the four-class table and **may** carry **at most one
optional descriptive qualifier**. The four declared classes are **unchanged**. A new subsection
fixes the semantics:

| Rule | Statement |
|---|---|
| **Primary class** | Exactly one, always one of the four declared. It is **the declared class, wherever it appears** — **position does not matter** |
| **Qualifier** | Optional; at most one; a **descriptive label only** |
| **A qualifier is not a class** | Not added to the table; confers **no** authority; never changes what the record may establish |
| **Authority derives from the primary class alone** | A qualifier such as `AUTHORITY`, `POLICY` or `METHODOLOGY AUTHORITY` **does not** make a record an `AUTHORIZATION` and **must never be read as doing so** |

**The last rule is the safety-critical one.** Eight records carry the qualifier `AUTHORITY`. Had
`AUTHORITY` been promoted to a class, those eight `DECISION` records could have been misread as
`AUTHORIZATION` records — that is, as **grants of permission**. The amendment forecloses that
reading explicitly, and leaves README's existing *AUTHORITY vs EVIDENCE vs REFERENCE vs
IMPLEMENTATION* rule untouched and controlling.

### 6.2 *Limits* section

The sentence *"New record classes or metadata fields are added only by a `DECISION` record"* is
**preserved** and clarified: *"classes"* there means **primary classes**. A new **primary class**
still requires a `DECISION` record, exactly as before. A **descriptive qualifier is not a class**,
requires no separate record, and **confers no authority**.

### 6.3 Why no record was edited

The primary class is identified by **declaration, not position**. Every one of the 15 already
contains exactly one declared class — `DECISION` — so **all 15 become valid as written**,
including `DEC-G-AI-IMPL-CERTIFICATION` despite its inverted order. **Editing 15 dated records
was therefore unnecessary**, and none was edited.

---

## 7. VERIFICATION — THE AMENDMENT ACTUALLY WORKS

A validator implementing the amended rule (exactly one declared class as primary; at most one
qualifier; position ignored) was run over all 38 files:

```
records validated against the AMENDED convention : 37
records failing                                  : 0
primary-class distribution: DECISION 34 · AUTHORIZATION 1 · GATE 1 · SPECIFICATION 1
```

| Check | Result |
|---|---|
| All 37 classified records valid under the amended convention | **YES — 37/37, 0 failures** |
| Primary-class total reconciles | **34 + 1 + 1 + 1 = 37** ✓ |
| `README.md` excluded as the convention document, not a record | **YES — stated explicitly** |
| Number of records edited by the amendment | **0** |

---

## 8. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| The four declared classes | **UNCHANGED** |
| Every record's own `Class:` line | **UNCHANGED — 0 records edited** |
| `DEC-G-AI-IMPL-CERTIFICATION` (incl. its certification result) | **UNTOUCHED** |
| All dated `DEC-*` records, incl. `DEC-D11-STANDING-CONSISTENCY` §6 | **UNTOUCHED** |
| `README`'s *AUTHORITY vs EVIDENCE vs REFERENCE vs IMPLEMENTATION* rule | **UNTOUCHED and controlling** |
| `README`'s *Current state* table (corrected at D9) | **UNTOUCHED** |
| Original wording of both amended passages | **PRESERVED** by strikethrough |
| Root `README.md` (fence `0d759fbdd751…`) | **UNTOUCHED** |
| `phase13-next` and the matrix | **UNTOUCHED — no product-branch mutation** |
| Certification results, H/I/J, releases, tags | **UNTOUCHED — no result changed** |
| Evidence artifacts | **NONE created** |
| P7 · Tier 3 · H/I/J execution | **NOT reopened · NO activity · NOT executed** |

**No capability, implementation, certification result or release status is affected by this
record.** A class label is metadata about a record; it establishes nothing.

---

## 9. OPEN ITEMS AFTER D12

| Item | Status after D12 |
|---|---|
| `D-CLASS-DUAL` | **CLOSED — §1 = D.** Convention amended; all 37 records valid; 0 records edited |
| `DEC-D11` §6 scope error | **CORRECTED BY THIS RECORD** (§4). The dated record itself not edited |
| `D-HIJ-CONFIG` | **CLOSED at D11** |
| `D-AUTH-11PATH` | **CLOSED at D10** |
| `D-README-STALE` | **CLOSED at D9/D11** |
| H/I/J execution | **DORMANT** — plan recorded at D8, unexecuted; limitation stands, not self-clearing |
| Tier-3 A1 pathway | **DORMANT** — prerequisites unchanged |
| P7 | **CLOSED as no-referent** at D8 — never PASS, not reopened |

**No identified standing-governance defect remains open.**

---

## 10. WHAT THIS RECORD DOES NOT DO

No product-branch mutation · no matrix amendment · no engine or implementation change · no change
to the authorized path set · no certification-result change · no promotion of any certification,
release, version or tag · no H/I/J execution and no browser, container or Keycloak setup · no
evidence artifact created · no independent-verification report authored · no verifier engaged or
invented · no A2 → A1 transition · no Class A capability status change · no P7 reopening and no P7
status claim · no Tier-3 activity · no restoration of historical artifacts · no D5-S1 threshold
change · no editing of any dated `DEC-*` record · no change to any record's `Class:` line · no
addition of a new primary class · no branch merged, rebased, created, moved or deleted · no ref
other than `arena` moved · no force-push.

## 11. CLASSIFICATION

# **D12 EXECUTED — §1 = D · §2 = B**

`D-CLASS-DUAL` **closed by convention amendment**, not by editing records. The premise was
corrected: the defect was **systemic — 15 of 37 classified records, 7 undeclared tokens** — and
`DEC-D11` §6's narrower scope is corrected here. The amended convention validates **37/37
records with 0 failures**, edits **0 records**, leaves the four declared classes unchanged, and
**expressly forbids** reading a qualifier such as `AUTHORITY` as a grant of permission.
`phase13-next` and the matrix are **unchanged**. All 14 capabilities remain **Class A**,
**7 A1 / 7 A2**. **STOP after recording — no further authority is held or inferred.**
