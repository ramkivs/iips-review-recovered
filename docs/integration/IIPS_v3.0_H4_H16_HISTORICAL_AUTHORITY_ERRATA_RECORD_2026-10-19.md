# IIPS v3.0 — H-4 / H-16 Historical-Authority Errata Record (`2026-10-19`)

> **Record ID:** `G2-2-H4-H16-HISTORICAL-AUTHORITY-ERRATA-2026-10-19-01`
> **Record type:** Additive documentation errata — documentary correction of two decision records;
> **non-executable**. This record grants, creates, ratifies, revokes, and retroactively authorizes
> **nothing**. It closes the two PA-directed errata follow-ups H-4 and H-16 from the G2-2 follow-on table
> and records exactly what remains.
> **Date:** 2026-10-19 (UTC; actual date, not backdated)
> **Authority context:** PA-directed errata (G2-2 §8 rows H-4 and H-16: "Additive D-3 errata,
> PA-directed" / "Additive D-1 or D-3 clarifying errata, PA-directed"), executed under the standing
> documentation-publication authority on the Program Authority's 2026-10-19 instruction to resolve the
> outstanding H-4/H-16 errata. No implementation, admission, qualification, promotion, or product-scope
> authority is used or implied.
> **Recording agent:** Arena Agent Mode — investigation, verification and transcription only.
> **Authoritative repository / ref:** `ramkivs/iips-review-recovered` (IRR) / `refs/heads/main`
> **Baseline:** remote `refs/heads/main` = `00e67133088f8371a39863a3ffd928804e96b155` (merge of PR #153),
> read at the start of this workstream and re-read before publication.
> **Explicitly out of scope:** master-tracker reconciliation (CV-21/CV-51 statuses, totals, row
> classification) — the tracker is **not modified** by this change set; PKG-03 (not reopened); Reports
> implementation/qualification/admission; portfolio persistence/scoring/Gate 3; PR #114.

---

## 1. The two errata and their authoritative sources

| Erratum | Source artifact (current `main` state before this change) | Statement at issue | Inconsistency |
|---|---|---|---|
| **H-4** | D-3, `docs/integration/GOVERNED-REPORTS-ACCEPTANCE-DECISION.md`, blob `3b24b9c93821dca9cabb6ae81505eacb39f19aae` (unchanged since PR #40, record commit `cade02dc…`) | §10: "Current IRR main does NOT contain the Reports implementation" | True when published (20:31:38Z, 2026-10-06); false from the PR #42 merge (21:09:33Z) until R4-B removal (2026-10-13T13:39:38Z); true again today as to the domain implementation. No published note in D-3 recorded this chronology or the retained PR #42-originated fence paths. |
| **H-16** | D-1, `docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`, blob `0c4f27b365c47839ec66f4ec6b34ec1c0f72ad2a` (unchanged since PR #38, record commit `80a4dc9…`) | §11/§12/§15: no promotion, no main admission, no merge of implementation branches | The PR #42 merge performed the withheld operations 72 minutes after D-1 was published. No note in D-1 recorded the conflict, the R4 Outcome B finding, the R4-B prospective remediation, or D-1's relationship (coexistence, not supersession) to those events. |

Closely related rows read for the correction surface: **H-11** (D-3 §11 "Promotion executed: NO" vs the
merge) — the same sentence set as H-4's artifact, clarified in the same D-3 erratum; **H-5/H-12**
(G1 record) — not in scope, not changed.

## 2. Factual chronology and authority at each point (verified this session)

All timestamps UTC; all `main` commits verified as ancestors of `00e67133…` by `git merge-base
--is-ancestor` on an unshallowed clone; PR metadata re-read via `gh pr view`.

| Time | Event | Authority state established by the operative records |
|---|---|---|
| 2026-10-06 19:57:09 | D-1 → `main` (PR #38, `561cc85f…`) | No promotion / main admission / implementation-branch merge for either persistence lineage. |
| 2026-10-06 20:31:38 | D-3 → `main` (PR #40, `e13e543a…`) | Reports ACCEPTED / BRANCH-ONLY; promotion NOT GRANTED, executed NO; main admission NOT GRANTED. |
| 2026-10-06 20:49:21 | Promotion-Scope Decision → `main` (PR #41, `0b961fec…`) | Promotion NOT EXECUTED; separate promotion execution act required; absence of that act → "NO promotion" (fail-closed §10). |
| 2026-10-06 21:09:33 | **PR #42 merged** (`47edf6f3…`; head `4906a6b7…`; title "DO NOT MERGE without promotion act"; body "NOT authorized for merge"; 0 reviews / 0 comments; 23 paths) | **No covering act.** Operative records withheld the operation. The merge is a Git event, not a promotion act. |
| 2026-10-13 (same PR #81) | R4 evidence record published: **Outcome B — authority conflict established** | No promotion execution act ever existed on any searched ref; no later act ratifies the merge. PA decision required (R4-A/B/C). |
| 2026-10-13 13:39:38 | **R4-B rendered and executed** (PR #81, `4b3d5866…`): 10 `frontend/server/reports/` paths removed; fence/pin/superseded paths retained | Prospective only; "does NOT retroactively authorize the 2026-10-06 merge". R4 CLOSED as a gate; the historical conflict remains a recorded fact. |
| 2026-10-19 07:47 / 07:51 | PKG-03 record published (PR #150, `573a3dd7…`; #153, `00e67133…`) | Records facts/lineage; states the H-4/H-16 errata remain PA-directed follow-up and are not made by that record. |

**Lineage distinctions preserved:** `4906a6b7…` (PR #42 head) is an ancestor of `main` (0 commits
ahead); `6a8afbb2…` (`arena/01a0f1b3-iips-review-recovered`) is **not** an ancestor of `main` (28 ahead /
443 behind at `00e67133…`) and is historical branch evidence only; `frontend/server/reports/` is absent at
`main`; the `./persistence` import census at `main` is 0; fence blob `reports-transport.ts` =
`981470541812a64c733309f1debec75455d85bee`, unchanged.

**Superseded characterizations noted, not edited:** the frozen evidence package
`evidence/integration/convergence/2026-10-07/P1-repository-convergence.md` describes Governed Reports as
"promoted via PR #42". That is an event-time evidence artifact, not an authority record; the authoritative
characterization is R4 Outcome B (merge without authority), and it is not rewritten here.

## 3. Disposition of each erratum

### H-4 — CLOSED (documentary correction applied)

- **Correction type:** additive erratum inside the affected record (same convention as G1 record §10).
- **Destination:** D-3 — inline marker on the §10 bullet and §11 first bullet; new §13 with E-1
  (chronology, corrected present-day reading, retained fence paths, explicit non-authorization) and E-2
  (clarification that "Promotion executed: NO" stands; H-11's sentence set). A note records that §12's
  `PENDING` fields are placeholders outside this set.
- **Acceptance condition / evidence:** D-3 on `main` carries §13; original §10/§11 text preserved verbatim;
  the erratum states the merge was not a promotion act and R4-B did not cure the original defect.

### H-16 — CLOSED (documentary correction applied)

- **Correction type:** additive erratum inside the affected record.
- **Destination:** D-1 — inline marker on §12; new §18 with E-1 (standing as written; the later event;
  reconciliation via R4 Outcome B and R4-B; explicit coexistence/non-supersession relationship; status of
  the `6a8afbb` branch reference in §3; explicit non-authorization).
- **Acceptance condition / evidence:** D-1 on `main` carries §18; original text preserved verbatim; the
  record states D-1 is in force unchanged and that the 2026-10-06 merge was never ratified.

### What is — and is not — resolved

- **Resolved by these errata:** the documentary inconsistencies H-4 and H-16 (and H-11's sentence set).
  Readers of D-1 and D-3 on `main` now see the chronology, the authority that existed at each point, and
  the relationship between the records and the PR #42 / R4 / R4-B events.
- **Not converted into authorization:** the 2026-10-06 PR #42 merge remains an unauthorized historical
  event (R4 Outcome B). No record — including this one — declares it authorized, ratifies it, or treats
  R4-B's prospective remediation as curing its authority defect.
- **No remaining substantive PA decision was found for H-4/H-16.** The forward-looking treatment of the
  PR #42 state was decided by the PA on 2026-10-13 (R4-B, prospective); the historical event is
  disposed as "recorded conflict, never ratified, remediated prospectively". The errata therefore needed
  no new decision and manufacture none. Any future attempt to admit Reports to `main` must pass the
  Promotion-Scope Decision bar, including a separate promotion execution act, plus REG-11 R1/R2 (Option
  C re-entry), R3 and F-7 — all unchanged and all outside this record.

## 4. Correction surface inspected

Searched `main` for `H-4`, `H-16`, `H-11`, `D-1`, `PR #42`, `4906a6b`, `6a8afbb`, `47edf6f3`, `R4-B`,
`PR #81`, "promotion act", "promotion execution act", and claims that the conflict is resolved/ratified.

| Artifact | Finding | Action |
|---|---|---|
| D-3 `GOVERNED-REPORTS-ACCEPTANCE-DECISION.md` | H-4 / H-11 statements | **Corrected additively (§13)** |
| D-1 `PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md` | H-16 standing vs merge | **Corrected additively (§18)** |
| `GOVERNED-REPORTS-PROMOTION-SCOPE-DECISION.md` | "Promotion status: NOT EXECUTED" — accurate (no execution act exists) | Preserved |
| `IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md` §8 | Event-time follow-on table naming H-4/H-16 as PA-directed | Preserved (historical; closure recorded here) |
| REG-11 R4 / R4-B records (3 files) | Accurate; the basis for these errata | Preserved |
| `2026-10-19/PKG-03-REPORTS-SEQUENTIAL-EXECUTION-RECORD.md` | Accurate as of its date ("errata … not made by this record") | Preserved; not reopened |
| `2026-10-18/PKG-03-REPORTS-CV21-DECISION-PACKET.md` | Lists H-4/H-16 resolution among retained-Reports boundaries | Preserved (preparatory packet) |
| `IIPS_v3.0_AD20_…_2026-10-13.md` row 12 "D-1 vs PR #42 conflict — CONFLICTING (unresolved)" | Event-time (pre-R4-B) | Preserved |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (§11 "which only PA errata can settle"; §18 row 36 "errata only") | Consulted as evidence only | **Not modified — excluded by task** |
| `evidence/integration/convergence/2026-10-07/P1-repository-convergence.md` | "promoted via PR #42" wording | Frozen evidence; noted in §2, not edited |

No authoritative record on `main` claims the historical authority conflict was resolved by
authorization; none required correction beyond D-1 and D-3.

## 5. Boundaries preserved

- Tracker: byte-identical to baseline (verified by blob comparison in the publication diff).
- No change under `frontend/`, `iips-platform/`, `evidence/`, or any IPD reference; no pin, route, fence,
  persistence, scoring, Gate 3, Gate 5, authentication, ownership or product-scope change.
- `/api/user-portfolios*` and `/api/reports*` remain source-level `503 owner-context-unavailable`.
- Reports: not implemented, qualified, admitted, or un-fenced; Option C deferral, R3 OPEN, R4-B CLOSED,
  CV-21/CV-51 statuses — all untouched.
- PR #114 untouched. No Windows, localhost, browser, or live-deployment verification is claimed.
- Documentation publication is not implementation authority, qualification, admission, or readiness.

## 6. Publication

Published from branch `arena/5c5f9499-iips-review-recovered` (from `main@00e67133…`) through a single PR.
The merge commit, final `main` SHA, CI results, and independent post-merge read-back are recorded in the
PR's verification comment and the completion report, not self-embedded here.

---

*End of record `G2-2-H4-H16-HISTORICAL-AUTHORITY-ERRATA-2026-10-19-01`. It corrects two records
additively and decides nothing.*
