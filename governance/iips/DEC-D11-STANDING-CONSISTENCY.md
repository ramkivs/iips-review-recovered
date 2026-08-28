# DEC-D11-STANDING-CONSISTENCY — Standing Governance-Consistency Cleanup

- **Record ID:** `DEC-D11-STANDING-CONSISTENCY`
- **Title:** D11 — D-HIJ-CONFIG Closure, H/I/J Status Confirmation, and Standing-Status Consistency Cleanup
- **Class:** `DECISION`
- **Status:** `RECORDED — §1 = A, §2 = A, §3 = B, D-CLASS-DUAL = A, §4 = B. ONE STANDING STATEMENT CORRECTED UNDER SEPARATE AUTHORITY`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D11 — D-HIJ-CONFIG / STANDING GOVERNANCE-CONSISTENCY
  CLEANUP`. The maintainer selected explicitly per section, then granted **two separate
  authorities** (§4 = B): (a) **narrowly scoped amendment authority** for **exactly one named
  location**, and (b) separate **governance recording authority** on `arena`. Neither was
  inferred from configured credentials, from write capability, or from any prior GO.
- **Scope:** closure of one item, confirmation of one status, correction of **one** stale
  present-tense standing statement, and reporting of one new convention defect. **No H/I/J
  execution, no browser or runtime setup, no evidence creation, no matrix change, no engine or
  implementation change, no certification promotion, no release or tag change, no P7 reopening,
  and no rewriting of any dated historical record.**
- **Provenance:** read-only discovery against `origin` in the same turn. Every record was
  classified standing-vs-historical **from its own declared metadata**, not by assumption.
- **Supersession / revision relationship:** amends `AUTH-G-AI-IMPL` §3's closing status sentence,
  **preserving the original text** via the programme's established `~~original~~ — **AMENDED by
  …**` convention. Supersedes no record. Closes the item recorded as `D-HIJ-CONFIG`. Companion to
  `DEC-D8-HIJ-CONFIG-DEFECT`, `DEC-D9-RECORD-CORRECTION` and `DEC-D10-PATH-COUNT-CONSISTENCY`.

---

## 1. SELECTIONS

| Section | Question | Selected |
|---|---|---|
| **§1** | D-HIJ-CONFIG residual | **A — consider fully closed** |
| **§2** | H/I/J current status | **A — keep dormant with corrected rationale** |
| **§3** | Standing-status consistency | **B — treat `AUTH:78` as stale standing status** |
| **Extra** | `D-CLASS-DUAL` (surfaced by discovery) | **A — record as a defect, no amendment** |
| **§4** | Recording authority | **B — recording + narrowly scoped amendment authority** |

---

## 2. PRECHECK STATE

**No re-provision this turn.** `git ls-remote origin` → **8 refs**, identical to the D10
end-state: `arena` `5366b1356752dc10fdc03e10143c1fecd73eed7e` · `phase13-next`
`357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` · `main` `c65d533…` · `gai-impl-canonical`
`f63a9b49…` · `phase13-hardening-delivery` `254e4723…` · tag pair `a975b0dc…` / `7325aeda…`.
`governance/iips/` = **37 records** before this commit. Matrix =
`cada0451400409b0fe9ff0d62309b756c7b45e43`.

### 2.1 Standing-versus-historical classification (from declared metadata)

| Kind | Count | Members |
|---|---|---|
| **STANDING** | **3** | `AUTH-G-AI-IMPL` (`AUTHORIZATION`, `ACTIVE`) · `SPEC-G-AI-IMPL` (`SPECIFICATION`, `ACTIVE`) · `README` (index) |
| Dated `GATE` | 1 | `GATE-G1-M` |
| Dated `DECISION` / `CERTIFICATION` | 33 | all `DEC-*` records |

---

## 3. §1 = A — `D-HIJ-CONFIG` IS FULLY CLOSED

Six occurrences of the false premise exist in the store. Each classified:

| Location | Form | Defect? |
|---|---|---|
| `DEC-G-AI-IMPL-CERTIFICATION.md:135` | **`~~struck~~`** — corrected at D9 | **No** |
| `DEC-G-AI-IMPL-CERT-CRITERIA.md:73` | **`~~struck~~`** — corrected at D9 | **No** |
| `DEC-D8-HIJ-CONFIG-DEFECT.md:27` | blockquote quoting the defect text | **No** — protected quotation |
| `DEC-D8-HIJ-CONFIG-DEFECT.md:112` | quoted as the text to be replaced | **No** — protected quotation |
| `DEC-D8-OPEN-ITEMS-DISPOSITION.md:98` | quoted as what §5 recorded | **No** — protected quotation |
| `DEC-D9-RECORD-CORRECTION.md:57` | quoted as the grep pattern used | **No** — protected quotation |

**Decisive check — occurrences in the three standing documents:**

| Standing document | Occurrences |
|---|---|
| `AUTH-G-AI-IMPL.md` | **0** |
| `SPEC-G-AI-IMPL.md` | **0** |
| `README.md` | **0** |

**No standing record materially asserts the false premise.** The two live statements are struck
(preserved text, not live assertion); the other four are protected quotations inside dated
records. `D-HIJ-CONFIG` is therefore **closed**.

**Note on §1 Option B:** the historical-record consistency review it contemplated was
**performed as part of this discovery** and found nothing further. No separate review gate is
required.

---

## 4. §2 = A — H/I/J REMAIN NOT PERFORMED

Infrastructure re-measured this turn:

```
docker  podman  docker-compose  nerdctl  chromium  google-chrome  firefox   ->  all NOT FOUND
127.0.0.1:8080                                                              ->  000 / unreachable
Keycloak artifacts tracked at phase13-next                                  ->  5
compose files tracked                                                       ->  0
```

Durable certification record, parsed post-D9:

| Criterion | Status |
|---|---|
| **H** — authenticated live HTTP 200 | **`NOT PERFORMED`** |
| **I** — real Keycloak authentication | **`NOT PERFORMED`** |
| **J** — live browser rendering | **`NOT PERFORMED`** |

**No PASS claim exists for H, I or J anywhere in the store.** The limitation remains **not
self-clearing**. `DEC-D8-HIJ-VALIDATION-PLAN` remains recorded and **unexecuted**; all four of its
execution preconditions remain absent. **No execution authority is created by this record, and no
execution, browser setup or runtime setup occurred.**

---

## 5. §3 = B — STANDING-STATUS CONSISTENCY INVENTORY AND THE ONE CORRECTION

### 5.1 Inventory result

All present-tense status markers in the three standing documents were enumerated and evaluated:

| Location | Text | Verdict |
|---|---|---|
| `AUTH:35` | *"Technical evidence remains evidence."* | **TRUE** — principle |
| `AUTH:96` | *"Live-Keycloak certification remains NOT PERFORMED"* | **TRUE** |
| `AUTH:113,119,124,129` | the D9 amendments | **correct** |
| `AUTH:161,190` | constraint remains in force / store remains reachable | **TRUE** |
| `SPEC:130,151` | 13-path surface remains authoritative / tenant validation remains in force | **TRUE** |
| `README:77,83,84` | D9 amendment + H/I/J limitation remains | **correct / TRUE** |
| **`AUTH:78`** | *"Until that gate returns **IMPLEMENTATION GO**, implementation remains **BLOCKED**."* | **STALE — CORRECTED** |

**Exactly one** stale present-tense standing statement exists. All dated `DEC-*` records saying
`IMPLEMENTATION: BLOCKED` remain **untouched as history**.

### 5.2 The correction, and a disclosure

`AUTH-G-AI-IMPL:78` carries **the same claim D9 struck at §5**, and sits in the **same section
D10 amended at line 69**.

**Disclosure:** this line was seen during D10 discovery (then line 73) and deliberately **not**
amended; `DEC-D10-PATH-COUNT-CONSISTENCY` §6 records the reasoning that it is *"a conditional
inside §3's procedural description … a rule that was correct when written."* That judgment was
within D10's scope and was disclosed at the time. D11 §3 asks this precise question, and the
maintainer selected **B**, so the earlier judgment is **superseded** — not silently, but by this
record.

### 5.3 What the amendment does — and a fact it does **not** assert

The amendment strikes the **present-tense status** while **explicitly preserving the dependency
rule**. Critically, it does **not** claim that a gate record exists:

> **No `GATE` record asserting `IMPLEMENTATION GO` exists in this store, and none is created or
> implied by this amendment.**

**Why this matters, verified this turn:** `git grep 'IMPLEMENTATION GO' governance/iips/` returns
only **3** hits — `AUTH:78` (the conditional itself), `SPEC:10` (the binding conditional) and
`DEC-D9-RECORD-CORRECTION:179` (a quotation). **No `GATE` record declares that outcome.** What the
store *does* record, in `DEC-G-AI-IMPL-IMPL-COMMIT-PUSH`, is that the grants *"were issued by the
maintainer **in-session**, at two separate gates"*, that *"**This record fabricates no earlier
durable authorization. None existed.**"*, and that asserting a prior durable authorization is
expressly **"NO — it did not"** exist.

The amendment therefore states only what is evidenced: implementation was authorized in-session
and was performed (commit `e5d59981c10578db0bf7a5b656acccb9450f45e0`, parent `85bbd49`, **13
paths**, re-verified this turn; then `f63a9b493118643725568a95b86405a5835a30a0`). **No gate
outcome is invented.**

---

## 6. NEW FINDING — `D-CLASS-DUAL` (recorded, NOT remediated — D11 extra = A)

`DEC-G-AI-IMPL-CERTIFICATION.md:5` declares:

```
- **Class:** `CERTIFICATION` / `DECISION`
```

`README` requires *"Every record declares **exactly one** class"* from a four-class table
(`AUTHORIZATION`, `SPECIFICATION`, `DECISION`, `GATE`), and its Limits clause requires that *"New
record classes or metadata fields are added only by a `DECISION` record."* **Two deviations in one
line:**

1. it declares **two** classes, where exactly one is required;
2. `CERTIFICATION` is **not** a declared class, and grepping the entire store the
   `CERTIFICATION` class token appears **exactly once — on that line**. **No `DECISION` record
   ever established it.**

**Effect is benign:** the record also declares `DECISION`, which is valid, so the record is
properly classified through its second class. No authority, decision or certification outcome
depends on the class label.

**Recorded and not remediated**, per D11 extra = A. Two remediation paths remain available under
separate authority: (B1) reduce the Class line to a single declared class, or (B2) add
`CERTIFICATION` to `README`'s class table by a `DECISION` record, as README's own Limits clause
requires. **This record grants neither and performs neither.**

**Measurement error disclosed:** an initial grep for README's class rule returned no match and
nearly produced a false report that the rule was missing. The rule **is** present — the sentence
wraps as *"New record\nclasses…"*, so the pattern was line-break-blind. **The repository was
correct; the pattern was wrong.**

---

## 7. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| H / I / J remain `NOT PERFORMED` | **PRESERVED** |
| No PASS claim created | **PRESERVED** |
| Limitation remains not self-clearing | **PRESERVED** |
| The §3 dependency **rule** (items 1–5 re-verification) | **PRESERVED and expressly restated** |
| Original wording of `AUTH:78` | **PRESERVED** by strikethrough |
| All dated `DEC-*` records, incl. the historical `BLOCKED` occurrences | **UNTOUCHED** |
| `DEC-G-AI-IMPL-CERTIFICATION` Class line (`D-CLASS-DUAL`) | **UNTOUCHED** |
| Protected quotations of the false premise | **UNTOUCHED** |
| Root `README.md` (fence `0d759fbdd751…`) | **UNTOUCHED** |
| `phase13-next` and the matrix | **UNTOUCHED — no product-branch mutation** |
| Engines, implementation, certification, release, tag | **UNTOUCHED** |
| Evidence artifacts | **NONE created** |
| P7 | **NOT reopened, no status claimed** |
| Tier 3 | **NO activity** |

---

## 8. OPEN ITEMS AFTER D11

| Item | Status after D11 |
|---|---|
| `D-HIJ-CONFIG` | **CLOSED — §1 = A.** No standing record asserts the false premise |
| `D-AUTH-11PATH` | **CLOSED at D10** |
| `D-README-STALE` | **CLOSED at D9**, and now complete: the last stale standing status (`AUTH:78`) is corrected |
| `D-CLASS-DUAL` | **NEW — RECORDED, NOT REMEDIATED.** Two remediation paths available under separate authority |
| H/I/J execution | **DORMANT — §2 = A.** Plan recorded, unexecuted; limitation stands, not self-clearing |
| Tier-3 A1 pathway | **DORMANT** — prerequisites unchanged |
| P7 | **CLOSED as no-referent** at D8 — never PASS, not reopened |
| Sandbox volatility | **ONGOING** — 9 re-provisions observed to date; D6 remains the operative mitigation |

---

## 9. WHAT THIS RECORD DOES NOT DO

No H/I/J execution · no browser, container runtime or Keycloak setup · no server started · no test
executed · no live validation performed · no H/I/J limitation withdrawn · no evidence artifact
created · no independent-verification report authored · no verifier engaged or invented · no
product-branch mutation · no matrix amendment · no engine or implementation change · no change to
the authorized path set · no certification promotion · no release, version or tag change · no P7
reopening and no P7 status claim · no Tier-3 activity and no A2 → A1 transition · no Class A
capability status change · no restoration of historical artifacts · no D5-S1 threshold change · no
amendment of any dated `DEC-*` record · no amendment of the `DEC-G-AI-IMPL-CERTIFICATION` Class
line · no branch merged, rebased, created, moved or deleted · no ref other than `arena` moved · no
force-push.

## 10. CLASSIFICATION

# **D11 EXECUTED — §1 = A · §2 = A · §3 = B · D-CLASS-DUAL = A · §4 = B**

`D-HIJ-CONFIG` **closed** — zero occurrences of the false premise in any standing document.
H/I/J confirmed **`NOT PERFORMED`**, no PASS, limitation not self-clearing. The **last** stale
present-tense standing status (`AUTH-G-AI-IMPL:78`) corrected with original text preserved and the
dependency rule expressly retained; **no gate outcome invented**. One new convention defect
(`D-CLASS-DUAL`) recorded and not remediated. `phase13-next` and the matrix are **unchanged**. All
14 capabilities remain **Class A**, **7 A1 / 7 A2**. **STOP after recording — no further authority
is held or inferred.**
