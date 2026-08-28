# DEC-D9-RECORD-CORRECTION — Governance Record Correction / Open-Item Disposition

- **Record ID:** `DEC-D9-RECORD-CORRECTION`
- **Title:** D9 — Correction of Two Governance Records, Correction of Two Stale Standing-Status Statements, and Disposition of the Remaining Open Items
- **Class:** `DECISION`
- **Status:** `RECORDED — §1 = B1, §2 = B2, §3 = A, §4 = A. CORRECTIONS EXECUTED UNDER SEPARATE AUTHORITY`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D9 — GOVERNANCE RECORD CORRECTION / OPEN-ITEM AUTHORITY
  GATE`. The maintainer selected explicitly per section, then granted **two separate
  authorities**: (a) explicit **mutation authority** to amend the four named governance records
  only, and (b) separate **governance recording authority** on `arena`. Neither was inferred
  from configured credentials, from write capability, or from any prior GO.
- **Scope:** correction of one factual defect appearing in **two** records, correction of
  **two** stale standing-status statements, and disposition of two open items as dormant.
  **No product-branch mutation, no matrix amendment, no evidence creation, no verifier
  engagement, no methodology change, no implementation, no certification, no release or
  promotion, no live H/I/J execution.**
- **Provenance:** read-only discovery against `origin` in the same turn; every asserted fact
  carries the command that produced it.
- **Supersession / revision relationship:** amends `DEC-G-AI-IMPL-CERTIFICATION` §5,
  `DEC-G-AI-IMPL-CERT-CRITERIA` consequence 1, `governance/iips/README.md` "Current state" and
  `AUTH-G-AI-IMPL` §5 — **in each case preserving the original text** by the programme's
  established `~~original~~ — **AMENDED by …**` convention. Supersedes no record. Companion to
  `DEC-D8-HIJ-CONFIG-DEFECT` and `DEC-D8-OPEN-ITEMS-DISPOSITION`.

---

## 1. SELECTIONS

| Section | Question | Selected |
|---|---|---|
| **§1** | D-HIJ-CONFIG correction | **B1 — correct BOTH records (origin + propagation)** |
| **§2** | Stale standing-status text | **B2 — correct `governance/iips/README.md` AND `AUTH-G-AI-IMPL` §5** |
| **§3** | H/I/J future validation | **A — keep validation planning dormant** |
| **§4** | Tier-3 pathway | **A — keep dormant** |
| **§5** | Authority | **BOTH grants made** — separate mutation authority and separate recording authority |

---

## 2. PRECHECK STATE (verified at gate entry)

`git ls-remote origin` → **8 refs**, identical to the D8 end-state: `arena`
`7241ecfabe3111fdd7384f8557517b31aea94ace` · `phase13-next` `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`
· `main` `c65d533…` · `gai-impl-canonical` `f63a9b49…` · `phase13-hardening-delivery`
`254e4723…` · tag pair `a975b0dc…` / `7325aeda…`. `governance/iips/` = **35 records**. Matrix
blob = **`cada0451400409b0fe9ff0d62309b756c7b45e43`**. H/I/J infrastructure re-measured:
`docker`, `podman`, `docker-compose`, `nerdctl`, `chromium`, `google-chrome`, `firefox` all
**NOT FOUND**; `127.0.0.1:8080` → **`000`**; **5** Keycloak artifacts tracked; **0** compose
files tracked.

---

## 3. FINDINGS THAT CHANGED THE SCOPE OF THE GATE'S OWN OPTIONS

### 3.1 The D-HIJ-CONFIG error exists in TWO records, not one

`git grep -n -I -e 'no compose or IdP configuration'` across all 35 records returned **3 files** —
two asserting the claim, one (this session's `DEC-D8-HIJ-CONFIG-DEFECT`) quoting it as a defect:

| Record | Line | Role |
|---|---|---|
| `DEC-G-AI-IMPL-CERT-CRITERIA.md` | **73** | **ORIGIN** — labelled *"measured this gate"* |
| `DEC-G-AI-IMPL-CERTIFICATION.md` | **135** | **PROPAGATION** — inside the §5 "recorded verbatim" blockquote |

D9 §1 Option B named only the certification record. Executing it literally would have left the
**originating** statement intact — the same self-propagation pattern recorded in
`DEC-D2-DANGLING-VOCABULARY` §4, running in the opposite direction. This was disclosed before
selection, and **B1 (correct both)** was chosen.

### 3.2 No matrix amendment is required

`grep -ic -e 'configuration is tracked' -e 'no compose'` on
`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` → **0**. The matrix says *"no container runtime,
no Keycloak IdP and no browser were **available**"* — an **availability** claim, which is
**true**. The matrix therefore does **not** repeat the defect and was **not** touched.

### 3.3 Every other `no IdP` mention in the store is accurate

`DEC-E2E-013-BASELINE:150` (*"No container runtime, no IdP, no browser"*),
`DEC-G-AI-IMPL-IMPL-COMMIT-PUSH:97` (*"no IdP available"*),
`DEC-G-AI-IMPL-CERT-CRITERIA:120` (*"External infrastructure required: NONE"* — scoped to the
test-only dispatch-coverage work). All are **availability** claims and all are **true**. **No
correction was made to any of them.**

### 3.4 The staleness was not confined to README, and there are two different `README.md` files

| File | Blob | Status |
|---|---|---|
| `governance/iips/README.md` | `70939d79d715…` (pre-amendment) | governance index — **stale, corrected** |
| **root `README.md`** | `0d759fbdd751a30a108deebe505a559912a9b6d8` at `85bbd49` and `phase13-next` | **product file and a recorded fence** — **NOT touched** |

`IMPLEMENTATION: BLOCKED` occurs in **11** records. **10** of them are dated
`DEC-G-AI-IMPL-*` decision records whose statements were **true when written**; those are
**history and were not amended**. Only the **two standing present-tense** statements — README
"Current state" and `AUTH-G-AI-IMPL` §5 "Current status" — are false *now*, and only those two
were corrected.

---

## 4. CORRECTIONS EXECUTED

Each amendment **preserves the original text** via `~~original~~ — **AMENDED by
`DEC-D9-RECORD-CORRECTION`**`, matching the convention already used in `AUTH-G-AI-IMPL` §4.
Each replacement was verified to match **exactly one** occurrence before being applied.

| # | Record | Region | Correction |
|---|---|---|---|
| 1 | `DEC-G-AI-IMPL-CERTIFICATION.md` | §5 blockquote, line 135 | Struck the false clause; added a verdict table (compose **correct**, IdP **incorrect**), the 5 tracked artifacts, the corrected reason, and an explicit **STATUS UNCHANGED** statement |
| 2 | `DEC-G-AI-IMPL-CERT-CRITERIA.md` | consequence 1, line 73 | Struck the **originating** false clause; added the same corrected reason and the same status guarantee |
| 3 | `governance/iips/README.md` | "Current state", 4 rows | `NOT ESTABLISHED`/`NOT ESTABLISHED`/`UNRESOLVED`/`BLOCKED` → `ESTABLISHED`/`ESTABLISHED`/`RESOLVED`/`IMPLEMENTED + TESTED + CERTIFIED`, with the superseded values recorded and a governance-only caveat |
| 4 | `AUTH-G-AI-IMPL.md` | §5 "Current status" | Struck both stale statements; recorded that the implementation gate returned GO and the §6.3 transition occurred, with the "amending this record does not execute a transition" rule **explicitly preserved** |

**Facts asserted in the amendments, each verified in this turn:**

| Assertion | Verification |
|---|---|
| Implementation commit is `e5d59981c10578db0bf7a5b656acccb9450f45e0` | `git log -1 --format=%H` |
| Its parent is `85bbd49cd31c215a8fd0e7651b718861944dfe45` | `git log -1 --format=%P` |
| It changed **13** paths | `git diff-tree --no-commit-id --name-only -r … \| wc -l` → **13** |
| The §6.3 baseline transition occurred | `git merge-base --is-ancestor 85bbd49 f63a9b49` → **exit 0** |
| 5 Keycloak artifacts tracked at `85bbd49`, `f63a9b49`, `phase13-next` | `git ls-tree -r --name-only <ref> \| grep -ic keycloak` → **5** at each |
| 0 compose files tracked | same, `grep -ic compose` → **0** at each |
| `keycloak-provision.mjs` blob | `c4e5705812b90423c815735e067211d8e9e75454` via `git ls-tree -r --long` |

---

## 5. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| **H, I and J remain `NOT PERFORMED`** | **PRESERVED** — the criterion table, §5's *"not self-clearing"* bullet, and the "not performed" summary table are all untouched |
| **No unavailable test converted to PASS** | **PRESERVED** — no `PASS` token added anywhere in relation to H, I or J |
| **A–F, K, L, M1–M3 remain PASSED** | **PRESERVED — unchanged** |
| **Limitation remains not self-clearing** | **PRESERVED** |
| **Original wording retained for history** | **PRESERVED** — strikethrough, not deletion, in all four records |
| **Root `README.md` (fence, `0d759fbdd751…`)** | **UNTOUCHED** |
| **The 10 dated `DEC-G-AI-IMPL-*` records** | **UNTOUCHED** |
| **Matrix `cada04514004…` and `phase13-next`** | **UNTOUCHED — no product-branch mutation** |
| **All ten fences** | **UNTOUCHED** |

---

## 6. DISPOSITIONS

### §3 — H/I/J future validation = **A (dormant)**

`DEC-D8-HIJ-VALIDATION-PLAN` remains on the record and **unexecuted**. All four execution
preconditions (reachable Keycloak, a way to run it, a browser, network reachability) are
**absent**. **No execution authority is created by this record, and no execution occurred.**
The limitation remains **not self-clearing**.

### §4 — Tier-3 pathway = **A (dormant)**

No evidence creation, no verifier engagement, no methodology change. Both D7 constraints stand:
any future Tier-3 independent verification **must be labelled *simulated***
(`D7-TIER3-INDEPENDENCE`, resolved as a negative), and **D7-3 forbids a Tier-3 exception** to
the A1 definition. `D7-TIER3-PARITY` remains **OPEN as characterized, dormant**. All 14
capabilities remain **Class A**, **7 A1 / 7 A2**.

---

## 7. NEW FINDING — `D-AUTH-11PATH` (reported, NOT remediated)

`AUTH-G-AI-IMPL` contains an **internal inconsistency** left over from the D-11V13 path-count
correction:

| Line | Text | Count |
|---|---|---|
| 10 | *"…SR-1…SR-5, T1…T10, **13 paths**, 10 fences…"* | 13 |
| 55 | *"**5 new files + 8 modified files = 13 paths** *(count corrected by `DEC-G-AI-IMPL-PATH-COUNT` / D-11V13 …)*"* | 13 |
| **69** | *"re-verify the exact **11-path** delta against the then-current baseline"* | **11 — STALE** |
| 88, 97, 104 | *"the **13-path** delta"*, *"(13 paths, parent `85bbd49`)"*, *"beyond the **13** authorized paths"* | 13 |

Line 69 sits in **§3**, outside the §5 scope authorized at this gate, so it was **reported and
not corrected**. The D-11V13 correction was applied to §4 and to `SPEC-G-AI-IMPL` but did not
propagate to §3. Remediating it requires its own amendment authority. **This record does not
grant that authority and does not perform that amendment.**

Note also line 73, *"Until that gate returns **IMPLEMENTATION GO**, implementation remains
**BLOCKED**"* — a conditional inside §3's procedural description. It is **not** amended: it
states a rule that was correct when written, and the §5 amendment above now records that the
gate did return GO.

---

## 8. OPEN ITEMS AFTER D9

| Item | Status after D9 |
|---|---|
| `D-HIJ-CONFIG` | **CLOSED — corrected in both records** (§1 = B1). H/I/J status unchanged |
| `D-README-STALE` | **CLOSED — corrected in both standing-status statements** (§2 = B2) |
| `D-AUTH-11PATH` | **NEW — REPORTED, NOT REMEDIATED.** `AUTH-G-AI-IMPL:69` still says 11 paths |
| H/I/J execution | **DORMANT** — plan recorded, execution not authorized (§3 = A) |
| Tier-3 A1 pathway | **DORMANT** — prerequisites unchanged (§4 = A) |
| `governance/iips/README.md` record count in `DEC-D6:61` | Historical snapshot (**26** at that date); **not** stale, **not** amended |

---

## 9. WHAT THIS RECORD DOES NOT DO

No product-branch mutation · no matrix amendment · no change to `ROADMAP.md`, the root
`README.md`, or any fenced file · no amendment of the 10 dated `DEC-G-AI-IMPL-*` records · no
amendment of `AUTH-G-AI-IMPL` §3 or §4 · no evidence artifact created · no
independent-verification report authored · no verifier engaged or invented · no A2 → A1
transition · no engine or implementation change · no Class A capability status change · no
certification change and no H/I/J limitation withdrawn · no live validation performed · no test
executed · no server started · no release/version/tag promotion · no P7 reopening and no P7
status claim · no restoration of historical artifacts · no D5-S1 threshold change · no branch
merged, rebased, created, moved or deleted · no ref other than `arena` moved · no force-push.

## 10. CLASSIFICATION

# **D9 EXECUTED — §1 = B1 · §2 = B2 · §3 = A · §4 = A**

Four governance records corrected with original text preserved. **H, I and J remain
`NOT PERFORMED`; no result converted to PASS; the Option-D limitation remains in force and not
self-clearing.** Two open items closed; two held dormant; one new defect (`D-AUTH-11PATH`)
reported and not remediated. All 14 capabilities remain **Class A**, **7 A1 / 7 A2**.
`phase13-next` and the matrix are **unchanged**. **STOP after recording — no further authority
is held or inferred.**
