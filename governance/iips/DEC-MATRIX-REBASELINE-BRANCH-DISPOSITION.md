# DEC-MATRIX-REBASELINE-BRANCH-DISPOSITION — `program-v3-matrix-rebaseline` Deleted

- **Record ID:** `DEC-MATRIX-REBASELINE-BRANCH-DISPOSITION`
- **Title:** Disposition of `refs/heads/program-v3-matrix-rebaseline` — Option A, Branch Deleted
- **Class:** `DECISION` / `AUTHORITY`
- **Status:** `RECORDED — DISPOSITION = OPTION A (DELETE); BRANCH DELETED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `program-v3-matrix-rebaseline BRANCH DISPOSITION GATE`.
  Options A / B / C / D were presented **without recommendation**, with the evidence and the
  consequences of each. The maintainer explicitly selected **A — delete the branch**, and
  separately and explicitly granted **branch-deletion authority** and **recording authority**
  scoped to `governance/iips/` on `arena`.
- **Scope:** the disposition of one branch ref, and this record. **No matrix, engine,
  implementation, certification, release, tag, P7 or `phase13-next` change.**

---

## 1. DECISION — OPTION A, BRANCH DELETED

`refs/heads/program-v3-matrix-rebaseline` is **deleted** because its content is already
incorporated into `phase13-next`.

### 1.1 The deleted object, recorded so its SHA survives the deletion

```
deleted ref     refs/heads/program-v3-matrix-rebaseline
deleted commit  027c38cc323a8834175edc4cbe8f3b272aed9522
its parent      85bbd49cd31c215a8fd0e7651b718861944dfe45
its subject     "docs(v3.0): re-baseline the Engine Integration Verification Matrix (D3-1..D3-5)"
files changed   1  —  M docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md
matrix blob     2600ebe3249870a512d6d7baf4386d54f0b5ae41  (9,239 -> 11,353 bytes, +47/-17)
```

**`027c38cc323a8834175edc4cbe8f3b272aed9522` is recorded here so that its SHA survives the
deletion**, and so that the object can be recovered from any repository copy that still
holds it before garbage collection.

## 2. EVIDENCE FOR THE DISPOSITION

| Check | Result |
|---|---|
| Content incorporated into `phase13-next`? | **YES.** The amendment reached `phase13-next` by **cherry-pick** `33dc1a7d7feafe13deb02361cde695b7921b652a`. Side-branch matrix `2600ebe32498` → `phase13-next` matrix `cada0451400409b0fe9ff0d62309b756c7b45e43` = **+39 / −3**, where the −3 is the D3-4 forward-reference sentence **intentionally replaced** by the D4 §3.2 subsection as authorized by **D4-C** |
| Was `027c38cc` an ancestor of `phase13-next`? | **NO** — cherry-picked, not merged |
| Reachable from any other ref? | **NO** — `git branch -r --contains 027c38cc` returned only `origin/program-v3-matrix-rebaseline`. Deletion makes the commit object unreachable on GitHub and GC-eligible |
| Product impact of deletion | **NONE** — no product content depends on the branch |
| Decision evidence preserved independently? | **YES** — `governance/iips/DEC-D3-MATRIX-REBASELINE.md` (`20c5c6fe2427`) records D3-1…D3-5 in full |

## 3. OPTIONS CONSIDERED AND NOT SELECTED

| Option | Why not selected |
|---|---|
| **B — retain as historical marker** | Would retain a stale ref permanently. The commit object's provenance value is preserved by this record and by `DEC-D3-MATRIX-REBASELINE.md` |
| **C — retain pending audit** | Would leave an open dependency on an independent audit that is **not currently scheduled**, leaving the item open contrary to the intent of closing it |
| **D — defer** | Would leave the disposition undecided and the stale ref in place |

No option was selected silently; all four were presented with evidence and consequences.

## 4. VERIFICATION AFTER DELETION

| Check | Result |
|---|---|
| `refs/heads/program-v3-matrix-rebaseline` on origin | **ABSENT** |
| Remote ref count | 9 → **8** |
| `phase13-next` | `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` — **UNCHANGED** |
| `gai-impl-canonical` | `f63a9b493118643725568a95b86405a5835a30a0` — **UNCHANGED** |
| `main` | `c65d53373717aacc3a1dce12d47b5aeaf50541a5` — **UNCHANGED** |
| `phase13-hardening-delivery` | `254e47233e639d089c59f07f394e4a6b46d8970f` — **UNCHANGED** |
| tag `v3.0-phase12-certified` | `a975b0dc5d91…` → `7325aeda8c98…` — **UNCHANGED** |
| `arena` | moved by this record only (authority-only commit) |
| Matrix on `phase13-next` | `cada0451400409b0fe9ff0d62309b756c7b45e43` — **UNCHANGED** (14 rows, 7 A1 / 7 A2, Class `{A}`) |

## 5. WHAT THIS RECORD DOES NOT DO

No matrix amendment · no engine or implementation change · no certification change · no
release/version/tag promotion · no P7 reopening · no `phase13-next` change · no restoration of
historical artifacts · no historical governance record amended · no ref other than
`arena` and the deleted `program-v3-matrix-rebaseline` affected · no force used.

## 6. OPEN ITEMS CARRIED FORWARD

| Item | Status |
|---|---|
| `program-v3-matrix-rebaseline` disposition | **CLOSED — Option A, deleted** |
| `D7-TIER3-INDEPENDENCE` | Resolved as a negative — any future verification must be labelled *simulated* |
| `D7-TIER3-PARITY` | **OPEN** — Tier 3 cannot reach A1 on the IES-010 standard without a 19-document engineering set and architecture review per engine, or an explicit methodology redefinition affecting all 14 |
| `D7-TIER2-PROVENANCE` | **OPEN — conclusively negative** |
| Dangling-citation annotation | **OPEN** — per `DEC-D6-DURABLE-RECORDING-POLICY` §3 |
| `AUTH-G-AI-IMPL` §4 referent-less prohibition annotation | **OPEN** — per `DEC-D2-DANGLING-VOCABULARY` |
| H / I / J Option-D validation | **OPEN** — infrastructure, not self-clearing |
| P7 referent | **OPEN** — identify, or record permanently that it has no referent; never claimed as PASS |

## 7. CLASSIFICATION

# **DISPOSITION = OPTION A RECORDED — BRANCH DELETED**

`refs/heads/program-v3-matrix-rebaseline` deleted. Its content is on `phase13-next`; its
commit SHA `027c38cc323a8834175edc4cbe8f3b272aed9522` is recorded here so it survives the
deletion. No product, matrix, certification, release or P7 change.
