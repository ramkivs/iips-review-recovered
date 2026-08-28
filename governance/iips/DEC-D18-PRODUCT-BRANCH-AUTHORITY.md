# DEC-D18-PRODUCT-BRANCH-AUTHORITY — Programme Concludes at the Governance Boundary

- **Record ID:** `DEC-D18-PRODUCT-BRANCH-AUTHORITY`
- **Title:** D18 — Product-Branch Authority Boundary: No Product-Branch Authority Granted; Verified Unreachable from This Session
- **Class:** `DECISION`
- **Status:** `RECORDED — §1 = B · §2 = E · §3 = A · §4 = A. NO PRODUCT-BRANCH AUTHORITY GRANTED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D18 — PRODUCT-BRANCH AUTHORITY BOUNDARY GATE`. The maintainer
  selected **§1 = B** (keep at the governance boundary), **§2 = E** (no product-branch work),
  **§3 = A** (preserve the A1/certification boundary), **§4 = A** (all fences intact), and
  granted **durable recording authority on `arena`** separately. **No product-branch,
  fence-relief, evidence-creation, A1-transition, matrix, certification, release or execution
  authority was granted or inferred.**
- **Scope:** determination of the product-branch authority boundary, recording of the verified
  topology and reachability findings, and a consolidated statement of what remains blocked. **No
  product-branch mutation, no artifact created, no fence relieved, no A1/A2 change, no matrix
  change.**
- **Provenance:** read-only discovery against `origin` in the same turn. Every topology figure
  comes from `git ls-tree` / `git merge-base` / `git cat-file`.
- **Supersession / revision relationship:** amends nothing. Concludes the authority chain begun at
  `AUTH-G-AI-IMPL` and carried through D8–D17.

---

## 1. SELECTIONS

| Section | Question | Selected |
|---|---|---|
| **§1** | Cross the arena-only governance boundary? | **B — keep the programme at the governance boundary** |
| **§2** | Which product-branch work? | **E — none** |
| **§3** | A1 / certification boundary | **A — preserve the current boundary** |
| **§4** | Fence-8 treatment | **A — keep all fences intact** |
| **§5** | Execution boundary | **Confirmed — see §8** |
| **§6** | Recording authority | **A — granted, on `arena` only** |

---

## 2. PRECHECK STATE

**No re-provision this turn.** `git ls-remote origin` → **8 refs**, identical to the D17
end-state: `arena` `3eed79c868829378409f5809f7a660fdc836754a` · `phase13-next`
`357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` · `main` `c65d533…` · `gai-impl-canonical`
`f63a9b49…` · `phase13-hardening-delivery` `254e4723…` · tag pair `a975b0dc…` / `7325aeda…`.
`governance/iips/` = **44 records** before this commit. Matrix =
`cada0451400409b0fe9ff0d62309b756c7b45e43`.

---

## 3. THE DECISIVE FINDING — THE SUBJECT MATTER IS NOT ON `arena`, AND `phase13-next` IS OUT OF REACH

### 3.1 Topology

| | `origin/arena` | `origin/phase13-next` |
|---|---|---|
| Total files | **950** | **1005** |
| `merge-base` | **NONE (exit 1)** — unrelated histories | |
| `ies-016-telecommunications/` | **0** | 12 |
| `ies-017-automobile/` | **0** | 12 |
| `ies-020-materials-metals/` | **0** | 12 |
| The three Tier-3 discovery packs | **ABSENT** | present |
| `iips-platform/` | **359** | **398** |
| `frontend/` | 89 | 144 |
| `docs/v3.0/` | 96 | 65 |

Shared paths carry **identical blobs** (verified on a sample), so this is not divergence through
corruption — `arena` is the **recovery lineage** and simply does not contain the Tier-3 work.

### 3.2 The 39 absent files are exactly the Tier-3 subject matter

Present on `phase13-next`, absent from `arena`:

```
iips-platform/src/sector-engines/telecommunications/  TelecommunicationsEngine.ts
  + calibration/ decision/ evidence/ metrics/ scoring/ + 4 data files
iips-platform/src/sector-engines/automobile/          AutomobileEngine.ts
  + calibration/ decision/ evidence/ metrics/ scoring/ + 4 data files
iips-platform/src/sector-engines/materials-metals/    MaterialsMetalsEngine.ts
  + calibration/ decision/ evidence/ metrics/ scoring/ + 4 data files
iips-platform/tests/regression/
  {telecommunications,automobile,materials-metals}-{acceptance,wp4-validation}.test.ts
```

**`arena` predates the Tier-3 engines entirely.**

### 3.3 Two independent consequences

**1. Creating anything on `arena` would be orphaning, not product-branch mutation.** The engine
directories do not exist there. Authoring acceptance records or 60 engineering documents on
`arena` would produce files on an **unrelated lineage**, documenting engines **absent from that
tree** — a divergent parallel copy, not a change to `phase13-next`.

**2. Changing `phase13-next` is outside this session's reach.** This session is fixed to
`arena/01a03e3b-iips-review-recovered`; every push in this programme used the single refspec
`arenawork:refs/heads/arena/01a03e3b-iips-review-recovered`. Pushing to `phase13-next`, or
creating any other branch to open a pull request from, is **not something this session may do**.
**That is an operative constraint on the executing agent, not a governance question that a grant
can resolve.**

### 3.4 Therefore §2 A/B/C/D were not executable regardless of grant

| §2 option | Executable from this session? | Reason |
|---|---|---|
| **A** — acceptance-record creation | **NO** | engine dirs absent from `arena`; `phase13-next` out of reach |
| **B** — correct `D-AUTHCLAIM-UNSUPPORTED` | **NO** | both packs absent from `arena` |
| **C** — 60-artifact programme | **NO** | the 39 files being documented are absent from `arena`; fence-8 relief also ungranted |
| **D** — all of the above | **NO** | as above |
| **E** — none | **YES** | — |

**§1 = A would have created an unfulfillable commitment in the durable store** — an open grant no
future gate in this session could discharge. §1 = B records the boundary accurately instead.

---

## 4. §1 = B AND §2 = E — THE PROGRAMME CONCLUDES AT THE GOVERNANCE BOUNDARY

| Property | Value |
|---|---|
| Product-branch authority | **NOT GRANTED** |
| Product-branch mutation performed | **NONE** |
| Artifacts created | **NONE** |
| Fences relieved | **NONE — all ten intact** |
| A1 / A2 status | **UNCHANGED — 7 A1 / 7 A2** |
| Matrix | **UNCHANGED — `cada04514004…`** |

All unresolved product-branch items are recorded as **blocked**, not as unfulfilled grants.

---

## 5. §3 = A — THE A1 / CERTIFICATION BOUNDARY IS PRESERVED

**No authority granted at any point in D8–D18 has altered, or may alter:** Class A status ·
A1/A2 evidence maturity · certification results · release or tag state · the Integration
Verification Matrix. **D7-3 = A remains in force** — the A1 standard is not lowered and no Tier-3
exception exists.

---

## 6. §4 = A — ALL FENCES INTACT

**All ten must-not-touch boundaries remain in force**, including **fence 8** (`ies-010 … ies-020`,
`iips-cross-sector` — certification baselines) and **fence 4** (`iips-platform/**`, 398 files at
`phase13-next`). No relief is granted. Any future documentation execution must return to a
**separate** fence-relief decision.

---

## 7. CONSOLIDATED STATE OF THE PROGRAMME

### 7.1 Closed

| Item | Closed at |
|---|---|
| `D-HIJ-CONFIG` — false "no IdP config tracked" premise | D9 (both records) · verified closed D11 |
| `D-AUTH-11PATH` — 11 vs 13 path count | D10 |
| `D-README-STALE` — stale standing-status text | D9 / D11 |
| `D-CLASS-DUAL` — classification metadata | D12 (convention amended; 0 records edited) |
| Verification methodology | D15 — role separation + clean-workspace reproducibility |
| P7 | D8 — closed as no-referent; never PASS; not reopened |
| Vocabulary dangling references | D2 |
| Matrix re-baseline and AI Advisory integration | D3 / D4 |

### 7.2 Blocked, with the reason recorded

| Item | Blocked by | What it would require |
|---|---|---|
| Tier-3 methodology acceptance (`D16 v1.0` / `D17 v1.0` / `D20 v1.0`) | **Deferred at D17** — the four cited acceptance records are absent from all five refs and `arena` | Creation of those records **on a product branch** |
| `D-AUTHCLAIM-UNSUPPORTED` — IES-017/020 assert ACCEPTED and PROPOSED simultaneously | Recorded at D17, not remediated | Product-branch mutation |
| Documentation-parity programme (60 artifacts) | **Blocked at D16** — prerequisite unmet | Product-branch mutation **+ fence-8 relief** |
| Any A2 → A1 transition | Never authorized | Matrix amendment **+ certification authority** |
| H/I/J live validation | **Dormant at D13** — preconditions **unobtainable** (no JVM, no container runtime, apt unusable, 3 browser CDNs unreachable, 4 shared libs absent) | Infrastructure that does not exist here |

### 7.3 Environmental condition

The sandbox has **re-provisioned 10 times** during this programme, each time destroying
everything outside the repository. `DEC-D6-DURABLE-RECORDING-POLICY` (D6 = A) is the operative
mitigation and has been validated empirically at every wipe: the durable store on `origin/arena`
survived all 10; no out-of-repo artifact ever did.

---

## 8. §5 — EXECUTION BOUNDARY, CONFIRMED

**D18 authorizes none of the following**, and none was performed:

- methodology acceptance where acceptance prerequisites remain unmet — **NOT AUTHORIZED**
- evidence creation — **NOT AUTHORIZED** (§2 = E)
- independent or simulated verification — **NOT AUTHORIZED**
- A2 → A1 transition — **NOT AUTHORIZED**
- matrix amendment — **NOT AUTHORIZED**
- certification-result change — **NOT AUTHORIZED**
- release / tag promotion — **NOT AUTHORIZED**
- H/I/J execution — **NOT AUTHORIZED**
- P7 reopening — **NOT AUTHORIZED**

---

## 9. NO FURTHER GATE IS ACTIONABLE WITHIN THIS ENVELOPE

Stated plainly rather than manufacturing a successor. After D18 every remaining item is blocked by
something **outside** the granted authority envelope:

| Remaining item | Blocked by |
|---|---|
| Methodology acceptance records | product-branch reach — **declined at D18** |
| `D-AUTHCLAIM-UNSUPPORTED` correction | product-branch reach — **declined at D18** |
| Documentation-parity programme | product-branch reach **+ fence-8 relief** — **declined at D18** |
| A1 transition / matrix amendment | separate certification and matrix authority — **never granted** |
| H/I/J live validation | infrastructure **unobtainable** in this environment (D13) |

**Accordingly this record identifies no `D19`.** Any resumption requires a change of circumstance
outside this session — product-branch reach, or the missing infrastructure — not a further
governance decision inside it. **Inventing a successor gate would misrepresent the state.**

---

## 10. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| Product-branch mutation | **NONE — no ref other than `arena` moved** |
| All ten fences, including 4 and 8 | **INTACT — no relief** |
| `ies-016/017/020` on every ref | **UNTOUCHED — 12 files each on product refs, 0 on `arena`** |
| A1 / A2 status of all 14 capabilities | **UNCHANGED — 7 A1 / 7 A2** |
| All capabilities Class A | **UNCHANGED** |
| **D7-3 = A** | **PRESERVED** |
| Matrix `cada04514004…` and `phase13-next` | **UNTOUCHED** |
| All dated `DEC-*` records | **UNTOUCHED** |
| Root `README.md` fence `0d759fbdd751…` | **UNTOUCHED** |
| Evidence artifacts | **NONE created** |
| H/I/J · P7 | **NOT executed · NOT reopened** |

---

## 11. WHAT THIS RECORD DOES NOT DO

No product-branch mutation · no push to any ref other than `arena` · no branch created, switched
to, merged, rebased, moved or deleted · no acceptance record created · no documentation authored ·
no artifact created · no evidence created · no fence relief and no relaxation of any fence · no A1
transition · no evidence-maturity change · no matrix amendment · no engine or implementation change
· no certification-result change · no release, version or tag change · no correction of
`D-AUTHCLAIM-UNSUPPORTED` · no methodology accepted, rejected or altered · no verifier engaged,
invented or simulated · no Tier-3 exception created · no Class A capability status change · no P7
reopening and no P7 status claim · no H/I/J execution and no browser, container or Keycloak setup ·
no amendment of any existing record · no restoration of historical artifacts · no D5-S1 threshold
change · no force-push.

## 12. CLASSIFICATION

# **D18 RECORDED — §1 = B · §2 = E · §3 = A · §4 = A**

**No product-branch authority is granted and none was exercised.** The boundary is not merely a
policy choice: `arena` (950 files) and `phase13-next` (1005 files) have **no merge-base**, the
Tier-3 engine directories are **0 / 0 / 0** on `arena`, and the **39** absent `iips-platform`
files are precisely the three Tier-3 engine implementations and their six regression tests.
Creating anything on `arena` would **orphan** it; changing `phase13-next` is outside this
session's fixed-branch reach. **§2 A/B/C/D were therefore not executable regardless of grant**, and
§1 = A would have left an unfulfillable commitment in the durable store. All ten fences remain
intact; the A1/certification boundary is preserved; **D7-3 = A** stands. **No `D19` is
identified** — every remaining item is blocked by product-branch reach (declined here) or by
infrastructure that is unobtainable (D13), and inventing a successor gate would misrepresent the
state. `phase13-next` and the matrix are **unchanged**. All 14 capabilities remain **Class A**,
**7 A1 / 7 A2**. **STOP after recording — no further authority is held or inferred.**
