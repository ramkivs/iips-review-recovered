# DEC-A2-A1-CLOSURE-STRATEGY — A2 → A1 Evidence-Debt Closure Strategy

- **Record ID:** `DEC-A2-A1-CLOSURE-STRATEGY`
- **Title:** A2 → A1 Evidence-Debt Closure — Tiered Strategy, and Verified Provenance of the Tier-2 Pruned Artifacts
- **Class:** `DECISION` / `AUTHORITY`
- **Status:** `RECORDED — CLOSURE STRATEGY = OPTION B (TIERED); NO EVIDENCE ARTIFACT AUTHORIZED OR CREATED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `PROGRAM v3.0 / IES CAPABILITY RE-BASELINE — A2 → A1
  EVIDENCE-DEBT CLOSURE AUTHORITY GATE`. Closure-strategy options A / B / C / D were
  presented **without recommendation**; the maintainer explicitly selected **B (tiered
  closure)**, separately authorized a **read-only search** for the Tier-2 pruned artifacts,
  and separately granted recording authority scoped to `governance/iips/` on `arena` only.
- **Scope:** deciding **what** evidence closure requires, per tier. **This record authorizes
  no evidence-artifact creation, amends no matrix, changes no Class A status, and performs no
  closure.**

---

## 1. DECISION — OPTION B, TIERED CLOSURE

A2 → A1 closure is to be pursued **differently for Tier 2 and Tier 3**, on the ground of
**artifact provenance**, which is verified below and is **not** an assumption about
historical age.

| Tier | Capabilities | Route to A1 |
|---|---|---|
| **Tier 2** | IES-006.2A banking, IES-007 insurance, IES-008 capital-markets, IES-009 healthcare | **Restoration** of the pruned artifacts — **now established as unavailable** (§3) — **or** an explicit **re-verification performed now and dated as new work**. **Never** by authoring replacement documents presented as the original historical evidence |
| **Tier 3** | IES-016 telecommunications, IES-017 automobile, IES-020 materials-metals | **Genuine new evidence production** — the artifacts never existed, so producing them is new certification work, honestly dated as such |

**All 14 capabilities remain Class A.** Nothing in this record downgrades, de-certifies or
evidence-blocks any capability.

## 2. EVIDENCE INVENTORY (read-only, at `origin/phase13-next` `357b34dac1bd…`)

| Capability | Src files | acceptance | framework-integration | reuse-verification | wp4-validation | Independent verification | Final readiness | Freeze manifest | Pack |
|---|---|---|---|---|---|---|---|---|---|
| IES-006.2A banking | 11 | ✓ | ✗ | ✗ | ✗ | ✓ `iips-platform/reports/` | ✗ | ✗ | **ABSENT (pruned)** |
| IES-007 insurance | 11 | ✓ | ✓ | ✓ | ✗ | ✓ `reports-insurance/` | ✗ | ✗ | **ABSENT (pruned)** |
| IES-008 capital-markets | 10 | ✓ | ✓ | ✓ | ✗ | ✓ `reports-capital-markets/` | ✗ | ✗ | **ABSENT (pruned)** |
| IES-009 healthcare | 10 | ✓ | ✓ | ✓ | ✗ | ✓ `reports-healthcare/` | ✗ | ✗ | **ABSENT (pruned)** |
| IES-016 telecommunications | 11 | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | **PRESENT (12)** |
| IES-017 automobile | 11 | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | **PRESENT (12)** |
| IES-020 materials-metals | 11 | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | **PRESENT (12)** |

All seven hold 4 frozen-asset JSONs (calibration, golden-reference, expected-outputs,
validation-fixtures) and 10–11 source files. **All 14 capabilities' implementations are
intact — no capability gap and no implementation gap.** `*-helpers.ts` modules are not test
files and satisfy no regression kind.

## 3. TIER-2 PROVENANCE SEARCH — CONCLUSIVE NEGATIVE

A read-only search was explicitly authorized and performed. Every recovery route claimed by
`docs/v3.0/housekeeping-option-a-prune.md` (2026-08-11) was tested.

| Claimed route | Search performed | Result |
|---|---|---|
| External archive `/home/user/historical-reference-archive/iips-historical-reference_20260811_190608.tar.gz` | Filesystem search for `*historical-reference*` across `/` (maxdepth 6); search for any `*.tar.gz` / `*.tar` / `*.zip` under `/home/user`; search for any `*archive*` directory | **NOT FOUND.** No `historical-reference` path anywhere; **zero** archive files under `/home/user`; the only `*archive*` directory on the system is `/var/cache/apt/archives` (unrelated) |
| `CHECKSUM.txt` + `RESTORE_INSTRUCTIONS.md` "alongside" | Filesystem search for both filenames | **NOT FOUND** anywhere |
| Annotated tag `prune-pre-v3-phase12/option-a` | `git ls-remote origin` filtered for `prune`; `git ls-remote --tags origin`; GitHub API `repos/.../tags` | **ABSENT.** The only tag in the repository, locally and on GitHub, is `v3.0-phase12-certified` |
| Pre-prune commit `a838bd5` | `git cat-file -t a838bd5`; GitHub API `repos/.../commits/a838bd5` | **`fatal: Not a valid object name a838bd5`** locally; GitHub API returns **HTTP 422 "No commit found for SHA: a838bd5"** |
| Any other branch holding pre-prune history | GitHub API `repos/.../branches` | 6 branches — `arena/01a03e3b-…`, `gai-impl-canonical`, `main`, `phase13-hardening-delivery`, `phase13-next`, `program-v3-matrix-rebaseline`. **None is a pre-prune branch** |

### Conclusion — recorded as a new open item

> **The Tier-2 pruned artifacts are definitively unrecoverable in this environment.** The
> archive, the pre-prune tag and the pre-prune commit are all absent from both the
> filesystem and the repository, locally and on GitHub. Tier-2 A1 closure is therefore
> **blocked on provenance, not merely on authority.** Its only honest route is an explicit
> **re-verification performed now and dated as new work** — which is **new certification
> activity**, not closure of the original debt, and must be recorded as such whenever it is
> undertaken.

**Recorded as open item `D7-TIER2-PROVENANCE`.** No restoration was attempted, and none is
possible.

### Integrity rule established by this record

> **A newly authored document must never be presented as the original historical
> independent-verification report, final-readiness certificate or freeze manifest for
> IES-006.2A, IES-007, IES-008 or IES-009.** Those artifacts were produced in 2026-08 and
> destroyed. Any replacement must be dated as new work and labelled as a re-verification.

## 4. TIER-3 METHODOLOGICAL BLOCKER — IDENTIFIED, NOT RESOLVED

Tier 3's missing limbs are: `framework-integration` and `reuse-verification` regression kinds,
plus independent verification, final readiness and freeze manifest.

The regression kinds and the two documents are ordinary evidence production. **One limb is
not clerical and is not resolved here:**

> **An "independent verification report" cannot honestly be authored by the party that
> performed the implementation and testing.** A report produced by the same actor is **not
> independent**, and labelling it as independent verification would misrepresent the
> evidence. Closing Tier 3's independent-verification limb therefore requires an explicit
> decision about **who performs the verification**.

**Recorded as open item `D7-TIER3-INDEPENDENCE`.** Not resolved by this record and not
authorized implicitly.

## 5. WHAT CLOSURE WOULD REQUIRE, PER CAPABILITY (defined, NOT authorized)

| Capability | Missing regression kind(s) | Missing documents | Route |
|---|---|---|---|
| IES-007 insurance | wp4-validation | final readiness, freeze manifest | Re-verification (originals pruned, unrecoverable) |
| IES-008 capital-markets | wp4-validation | final readiness, freeze manifest | Re-verification |
| IES-009 healthcare | wp4-validation | final readiness, freeze manifest | Re-verification |
| IES-006.2A banking | framework-integration, reuse-verification, wp4-validation | final readiness, freeze manifest | Re-verification |
| IES-016 telecommunications | framework-integration, reuse-verification | independent verification, final readiness, freeze manifest | New evidence production (+ independence decision) |
| IES-017 automobile | framework-integration, reuse-verification | independent verification, final readiness, freeze manifest | New evidence production (+ independence decision) |
| IES-020 materials-metals | framework-integration, reuse-verification | independent verification, final readiness, freeze manifest | New evidence production (+ independence decision) |

**No implementation change is required for any of it.** Every missing item is an evidence,
documentation or test artifact; all 14 implementations are intact.

## 6. BOUNDARY — FOUR SEPARATE AUTHORITY ACTIONS

| # | Action | Status |
|---|---|---|
| 1 | Deciding **what** evidence closure requires | **DONE — this record** |
| 2 | Authorizing **creation** of that evidence | **NOT DONE** |
| 3 | Actually **creating** the evidence | **NOT DONE** — and for Tier 3's independence limb requires a decision on who performs it |
| 4 | Updating the matrix from **A2 → A1** | **NOT DONE** — requires separate matrix-amendment authority |

**No independent-verification report, final-readiness certificate, freeze manifest or
regression test was created. The Integration Verification Matrix was not modified. No engine
or implementation was changed. No Class A capability status was changed.**

## 7. NEXT GATE IDENTIFIED

Per the recording grant, the next gate is named here. **It is not executed by this record and
requires its own authority.**

# Next: **A2 → A1 EVIDENCE-ARTIFACT CREATION AUTHORITY GATE (TIER 3 FIRST)**

**Why Tier 3 first.** Tier 3's route is genuine new evidence production and does not depend
on any unavailable source. Tier 2's route depends on `D7-TIER2-PROVENANCE`, which is now
**conclusively negative**, so Tier 2 cannot proceed until a re-verification is explicitly
authorized and dated as new work.

**What it must decide.**
1. Whether to authorize creation of the Tier-3 artifacts (2 regression test kinds each +
   final readiness + freeze manifest).
2. **Who performs the Tier-3 independent verification** (`D7-TIER3-INDEPENDENCE`) — the
   integrity rule in §3 applies equally here: a report by the implementing party is not
   independent.
3. Whether to authorize a **Tier-2 re-verification** explicitly dated as new work
   (`D7-TIER2-PROVENANCE`), or leave Tier 2 as permanent A2.
4. Sequencing, and whether any capability is closed before others.

**Authority needed.** **Evidence-artifact creation authority**, plus **matrix-amendment
authority** to update A1/A2 as each capability closes. **None is granted here.**

**Explicitly not pre-decided.** This record authorizes no artifact, selects no verifier,
does not schedule closure, does not authorize a Tier-2 re-verification, and does not decide
whether any capability remains permanently A2.

## 8. OPEN ITEMS CARRIED FORWARD

| Item | Status |
|---|---|
| **D7-TIER2-PROVENANCE** (new) | **OPEN — conclusively negative.** Archive, pre-prune tag and pre-prune commit all absent locally and on GitHub. Tier-2 closure requires an explicitly dated re-verification |
| **D7-TIER3-INDEPENDENCE** (new) | **OPEN.** Who performs Tier-3 independent verification is undecided |
| `program-v3-matrix-rebaseline` disposition | **OPEN** — content already on `phase13-next` via `33dc1a7d…` |
| Dangling-citation annotation | **OPEN** — per `DEC-D6-DURABLE-RECORDING-POLICY` §3 |
| `AUTH-G-AI-IMPL` §4 referent-less prohibition annotation | **OPEN** — per `DEC-D2-DANGLING-VOCABULARY` |
| H / I / J Option-D validation | **OPEN** — infrastructure, not self-clearing |
| P7 referent | **OPEN** — identify, or record permanently that it has no referent; never claimed as PASS |

## 9. WHAT THIS RECORD DOES NOT DO

No evidence artifact created · no matrix amendment · no engine or implementation change · no
Class A capability status change · no certification change · no release/version/tag promotion
· no P7 reopening · no threshold change (D5-S1 kind-set unchanged) · no restoration attempted
· no branch merged or rebased · no historical record amended · no ref other than `arena`
moved.

## 10. CLASSIFICATION

# **CLOSURE STRATEGY = OPTION B (TIERED) RECORDED**

Tier 2 routes to restoration (**unavailable**) or explicitly dated re-verification; Tier 3
routes to genuine new evidence production with an unresolved independence question. No
evidence artifact is authorized or created. All 14 capabilities remain Class A. Two new open
items recorded: `D7-TIER2-PROVENANCE` and `D7-TIER3-INDEPENDENCE`.
