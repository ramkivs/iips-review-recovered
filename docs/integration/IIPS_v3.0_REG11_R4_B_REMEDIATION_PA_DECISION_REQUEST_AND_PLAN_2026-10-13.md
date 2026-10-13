# IIPS v3.0 — REG-11 R4: `R4-B` Remediation PA Decision Request and Minimum-Scope Remediation Plan (`2026-10-13`)

> **Record ID:** `REG11-R4-B-REMEDIATION-PA-DECISION-REQUEST-2026-10-13-01`
> **Record type:** PA decision request + evidence-backed remediation plan — documentation only;
> **non-executable**. **PA choice PENDING.** Nothing in this record selects the disposition,
> authorizes implementation, or performs remediation.
> **Date:** 2026-10-13 (UTC)
> **Authority context:** Prepared within the existing documentation-publication authority only.
> The deciding authority is Ramki (Program Authority).
> **Recording agent:** Arena Agent Mode — investigation, verification and preparation only; no
> authority is rendered by the agent.
> **Authoritative repository / ref:** `ramkivs/iips-review-recovered` / `refs/heads/main`
> **Basis record (reused, not re-derived):**
> [`IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md`](IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md)
> — R4 evidence question **RESOLVED — Outcome B (existing authority conflict ESTABLISHED)**.

---

## 1. Verified baseline for this packet (re-verified this session; not assumed)

| Item | Verified value |
|---|---|
| IRR `refs/heads/main` | `721520cc059cd80ad16bd7fb68da5cd6ecbadd9b` — **unchanged** since the R4 reconciliation |
| Session branch / PR #81 | `arena/54c0eee2-iips-review-recovered` @ `a7ce7d9b9915a87642a80601b38aae25eea39843`; PR #81 **OPEN**, unmerged, 0 reviews, 0 comments |
| PR #80 (Option C publication) | `MERGED` (Option C durable; its boundaries in force) |
| Fence blob identities at `main` | `frontend/server/reports-transport.ts` `981470541812a64c733309f1debec75455d85bee`; `frontend/server/user-portfolio-transport.ts` `51704c12a467cd2f718a030b5036bc55c9afa73f`; `frontend/server/owner-context-unavailable.ts` `cb8db45d668d28cee7e0a52721001d579a872733` — **identical to the Option C-recorded identities** |
| Material changes since the reconciliation baseline | **None** (no `main` movement; no new governance records; no new refs) |

The completed historical search (reconciliation §4–§5) is **reused in full and not repeated**: no
act `EXPLICITLY COVERS` the PR #42 merge; no promotion-execution act has ever existed on any
searched ref; no IPD commit exists on or after 2026-10-06.

---

## 2. The historical authority conflict (restated; settled — not reopened)

The 2026-10-06T21:09:33Z merge of PR #42 (`47edf6f3…`) into IRR `main` — 23 paths, including 13
Reports paths and the `frontend/package.json` re-pin `0dab1221…→2e11fa3b…` — was performed while
three operative PA records, all ancestors of the merge commit, expressly withheld exactly those
operations: D-1 §11/§12/§15, D-3 §11 ("Promotion executed: NO"), and the Promotion-Scope Decision
(merged 20 minutes earlier as the merge's own first parent; fail-closed bar: "the separate
promotion execution act does not exist … NO promotion"). The merge remains in authoritative
history; no retroactive authorization exists or is created here.

---

## 3. Authority determination for this fast-track (the hard stop)

**Question:** does any existing explicit authority instrument permit (a) selection of the `R4-B`
disposition, and (b) implementation of the remediation scope in §5?

**Answer: NO — verified, not assumed.**

| Instrument examined | Why it does not grant this |
|---|---|
| Option C disposition (`§11`, durable via PR #80) | Expressly: "No implementation, package admission, route/UI activation, runtime-configuration change, or production behaviour is authorized"; retains R4 as a separate open gate |
| R4 reconciliation record (PR #81) | Documentation-only by its own terms; §10: R4 remains OPEN pending a PA disposition; §11 pre-selects nothing |
| G2-2 R2 record (operative constraints) | Expressly lists among blocked scopes: "removal, disablement, revert or other remediation of the live wiring … any revert, remediation or retrospective promotion of PR #42" absent PA direction |
| D-1 / D-3 / Promotion-Scope Decision | Withhold authority; they do not direct remediation |
| AD-02 / AD-20 / REG reconciliations | Scoped elsewhere; none addresses an R4 disposition |
| The present task instruction | **Not treated as PA approval** (its own hard-stop term; no inference of authority from a task, an investigation, PR #81, or historical records) |

**Consequently:** this run prepares the complete decision packet and remediation plan, publishes
them through the authorized documentation process, and **stops at this boundary. No remediation is
performed in this run.** The exact missing approval is stated verbatim in §8.

---

## 4. Current-state effects of PR #42 at `main@721520cc…` (new evidence of this packet)

Entanglement trace, derived from full-history evidence this session (`git rev-list --count
47edf6f3..main -- <path>` per path; blob comparisons; repository-wide import greps):

### 4.1 Still byte-identical to the unauthorized merge (0 subsequent commits)

| Paths | Current state | Live consumers |
|---|---|---|
| `frontend/server/reports/` — **10 files**: `artifact.ts`, `canonical.ts`, `composition.ts`, `index.ts`, `np04-adapter.ts`, `persistence-port.ts`, `persistence.ts`, `reports-artifact.test.ts`, `reports-canonical.test.ts`, `reports-persistence.test.ts` | **Byte-identical** to the PR #42 merge (`git ls-tree` blob-set identical between `47edf6f3` and `main`); never reviewed, never authorized | **ZERO imports from outside the directory** (repository-wide grep). The current fence `reports-transport.ts` imports only `node:http` and `./owner-context-unavailable` and "deliberately" never invokes domain/persistence code. The **only** `./persistence` package-subpath edge in the entire codebase is the runtime-computed dynamic import inside `persistence-port.ts` `loadAuthoritativeNp04Persistence()` (fail-closed on unavailability), called only from within this directory and its tests |
| `frontend/package.json` (line 15) + `frontend/package-lock.json` | Re-pin `2e11fa3b…` untouched since the merge | All **live static imports** of the package are `./pit` and `./d114-non-production` only (8 import statements across 6 `frontend/server/pit/*` files) — exactly the AD-02-admitted scope, which is recorded **at this exact pin** |
| `frontend/server/pit/ipdPitReadAdapter.ts` | The unreviewed `K2` `+6/−4` change untouched | Comment-only text describing the re-pin; no behavioural content |

### 4.2 Superseded by subsequently authorized work (current content is NOT PR #42 content)

| Paths | Superseding authorized work |
|---|---|
| `frontend/server/reports-transport.ts`, `reports-api.test.ts`, `reports-transport.test.ts` | Rewritten by the no-auth baseline commit `1f7997e…` (2026-10-12, "Remove authentication flow for single-user IIPS" — GLOBAL-NO-AUTH/H18 program decisions). Current `reports-transport.ts` is the 73-line **fail-closed fence** whose blob `98147054…` is the Option C-recorded baseline |
| `frontend/server/secured-executor.ts`, `tenant-membership-store.ts`, `tenant-directory.test.ts`, `admin-transport.ts`, `admin-transport.test.ts`, `admin-live-composition.test.ts` | Rewritten by `1f7997e…` (no-auth baseline); `admin-transport.ts` also by the 2026-10-07 family merge |
| `frontend/server/executive-transport.ts` | **8** subsequent commits, including the authorized F-3 owner-context mechanism (`6729a26…`, PRs #68–#70 lineage) and multiple 2026-10-07 reconciliations |

**Distinction preserved:** Git ancestry of `47edf6f3…` is permanent history (no history rewriting
is proposed or permitted). The *functional* footprint of PR #42 at today's tip reduces to §4.1:
ten dead, consumer-less, never-authorized Reports domain files carrying the only `./persistence`
consumer edge; one pin line whose live use is AD-02-scoped; one comment-only diff.

---

## 5. Proposed disposition `R4-B` — consequences and MINIMUM remediation scope

### 5.1 Precise consequences of selecting R4-B

1. The unauthorized Reports domain admission is removed from the authoritative tip
   **prospectively** (a normal forward commit through PR review — no revert of history, no
   force-push; `47edf6f3…` remains an ancestor forever and remains recorded as the P1 conflict).
2. The D-1 §15 / D-3 §11 / Promotion-Scope Decision boundaries are restored at current state: no
   Reports implementation or `./persistence` consumer edge remains admitted on `main`.
3. Reports returns fully to its lawful governance posture: ACCEPTED at qualified branch scope
   (D-3), promotable **only** through the Promotion-Scope Decision's bar including the separate
   promotion execution act.
4. No retroactive authorization is created, and no finding about any individual's conduct is made.

### 5.2 Minimum remediation scope (the smallest correction restoring the authority boundaries)

**REMOVE (exactly 10 paths — delete, no replacements):**

```
frontend/server/reports/artifact.ts
frontend/server/reports/canonical.ts
frontend/server/reports/composition.ts
frontend/server/reports/index.ts
frontend/server/reports/np04-adapter.ts
frontend/server/reports/persistence-port.ts
frontend/server/reports/persistence.ts
frontend/server/reports/reports-artifact.test.ts
frontend/server/reports/reports-canonical.test.ts
frontend/server/reports/reports-persistence.test.ts
```

Basis: byte-identical unauthorized content (§4.1); zero consumers outside the directory; removal
eliminates the only `./persistence` subpath edge in the codebase; **zero behaviour change at the
HTTP boundary** (the fence never invokes this code). Full revert of PR #42 is expressly **not**
correct: it would destroy the later authorized no-auth baseline, F-3 mechanism, and family-merge
states (§4.2) and would break the operative AD-02 admission basis.

**RETAIN (expressly, with recorded rationale — not silent):**

| Item | Rationale |
|---|---|
| `frontend/server/reports-transport.ts` + its two server-level tests | Current content is the **authorized fail-closed fence** (Option C-recorded blob `98147054…`). Removing or altering it would change the recorded fail-closed baseline — prohibited absent an independently authorized decision |
| Pin `2e11fa3b…` in `package.json`/lockfile | Live use is exactly the AD-02-admitted `./pit` + `./d114-non-production` scope, recorded **at this pin**; reversion to `0dab1221…` would break AD-02's operative basis while changing nothing functional (the five `./pit` sources are byte-identical across the two commits, per the recorded K2 evidence). After removal of the 10 paths, the `./persistence` exposure has **zero** consumers; any future Reports consumer requires **R3** plus the Promotion-Scope Decision bar |
| `ipdPitReadAdapter.ts` `K2` comment (+6/−4) | Comment-only; accurately describes the retained pin; reverting it would make the source text false. Recorded here as retained-unreviewed-comment |
| All §4.2 paths | Current content is the product of subsequently authorized work; not PR #42 content |

**No change to:** IPD (any ref, file, or record); the NP-04 artifact/report lineage or the G24
portfolio lineage; identity/security mappings; any route/UI/runtime configuration; any other gate.

### 5.3 Required verification and durable-publication criteria (bar for executed remediation)

1. Diff contains **exactly** the 10 deletions and the additive governance/tracker updates —
   nothing else (`git diff --name-status` proof).
2. `tsc --noEmit` exit 0; frontend test suite passes with the 3 removed domain-test files absent
   and **no other test regressions** (exact counts reported).
3. Repository-wide grep proves 0 remaining `./persistence` package-subpath references in live
   code.
4. Fence blob identities unchanged (`98147054…`, `51704c12…`, `cb8db45d…`); valid `/api/reports*`
   and `/api/user-portfolios*` operations remain source-level fail-closed (`503
   owner-context-unavailable`). No runtime/production claim from source inspection alone.
5. Publication via normal PR to `refs/heads/main`; merge is the PA's act; post-merge independent
   remote verification of the resulting `main` commit, tree, and record blobs.
6. Tracker updated additively in the same publication; R4 recorded `REMEDIATED (R4-B)` only after
   the remote verification in (5).

### 5.4 Decisions that must remain separate (not decided by R4-B)

| Item | Status preserved |
|---|---|
| **Gate B / R1–R2** | Option C deferral **unchanged**; Reports ownership binding remains deferred |
| **R3** (Reports pin/consumer admission) | **OPEN and separate** — removal of the consumer edge does not decide any future admission |
| **Gate A** (persistence convergence), **Gate C** (portfolio identity/security contract) | Separate, untouched |
| AD-01 operative effect; P4 route activation; IU-6 repin rationale | Unchanged (`NOT ESTABLISHED` / not admitted / `UNPROVEN`) |
| Fail-closed baseline | Preserved at source level |

---

## 6. Alternatives (stated for completeness; not re-argued)

`R4-A` (prospective regularization of the current state) and `R4-C` (recorded standing
without regularization) remain available as defined in the reconciliation record §11. This packet
prepares `R4-B` as proposed for fast-track; **the selection itself is the PA's act.**

---

## 7. What this record does NOT do

Select any disposition; authorize or perform any removal, revert, or other remediation; create or
imply retroactive authorization for PR #42; modify any IPD state; reopen R1/R2 or settled evidence
questions; alter the fail-closed baseline; rewrite history or bypass review controls.

---

## 8. Exact approval required (verbatim decision input for the PA)

A Program Authority disposition, rendered on its actual date and recorded through the normal
publication process, stating:

> **R4 disposition: `R4-B — REMEDIATION` is SELECTED.** Remediation scope is approved exactly as
> §5.2 of `REG11-R4-B-REMEDIATION-PA-DECISION-REQUEST-2026-10-13-01`: removal of the 10 named
> `frontend/server/reports/` paths from `ramkivs/iips-review-recovered` `refs/heads/main`
> (baseline `721520cc…` or its verified successor), with the §5.2 retention items retained as
> stated. **Implementation is authorized on these exact terms and no others**, subject to the
> §5.3 verification and durable-publication criteria. This disposition is prospective only and
> does not retroactively authorize the 2026-10-06 merge of PR #42.

Anything narrower, broader, or different requires its own statement. Absent this instrument,
remediation remains prohibited and the current fenced state persists.

---

*End of record `REG11-R4-B-REMEDIATION-PA-DECISION-REQUEST-2026-10-13-01`. PA choice PENDING.*
