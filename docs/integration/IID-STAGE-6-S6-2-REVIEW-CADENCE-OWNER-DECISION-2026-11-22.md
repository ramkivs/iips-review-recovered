# IID Stage 6 — S6-2 review cadence: owner decision (WEEKLY / FRIDAY) and the weekly review procedure

**Date:** 2026-11-22 · **Decision owner:** Ramki (PA/PO, PA-01 G-8: one authority) · **Scope:** IRR documentation only.
**Stage 6 item:** S6-2 "review cadence chosen and recorded" (baseline 2026-11-11 §21, adopted by the Stage 5 PA/PO
acceptance decision §4.1–4.2; roadmap §C.11). **Status:** S6-2 **RECORDED** — the cadence is decided; the review loop
starts on the first Friday after this record.

This record changes no code, policy, scoring, screening, valuation, disposition or monitoring behaviour, and
authorises none. A runner, scheduler, alert or breach ledger is **not** authorised by it (gap assessment §1-E, D-10).

---

## 1. The decision (owner's words, recorded verbatim)

| Item | Decision |
|---|---|
| Review frequency | **WEEKLY** |
| Review day | **FRIDAY** |

Recorded as an explicit owner decision on 2026-11-22. Nothing else in this record is a decision of the owner's:
§3–§6 are the procedure and evidence plan derived from existing capabilities, recorded so the loop has a definition;
the owner may amend any of it.

---

## 2. Why this is the next item, and what it rests on

- **S6-1 COMPLETE** (operator limits policy `limits-policy/2026-11` in force; S6-1 record §10.3).
- **S6-1b COMPLETE** (one real holding dispositioned, persisted once, read back, re-run without duplication; S6-1
  record §10.6).
- The Stage 6 objective is *routine use*: "weekly review loop, change detection, dispositions on real holdings,
  persisted comparable reports" (decision record §4.1). A cadence is the prerequisite that gives the acceptance test —
  "a quarter of review notes referencing ≥ 2 assessment versions per holding" — a start date and a unit of count.

---

## 3. What one weekly review consists of (existing capabilities only)

Every step below is a **read** of something that already exists, or a command already documented in the runbook.
No step trades, orders, or sizes anything; every output is decision support (runbook §15.5).

| # | Step | How (existing surface / command) | What to note |
|---|---|---|---|
| 1 | Readiness | `npx tsx server/investment/cli/iid-readiness.ts` (runbook §16) | any outstanding dependency — if the store or identity sources are unavailable, the review is "not performed" and says why |
| 2 | Holdings as of today | UI `Personal portfolio` / `/broker-holdings`; API `GET /api/investment/portfolio/DHAN_PORTFOLIO/identities` | portfolio revision; count of holdings `RESOLVED` vs `UNRESOLVED`; any new or removed holding |
| 3 | Coverage | UI `/investment/coverage`; `GET /api/investment/coverage` | which held issuers have an assessment at all (today: the governed issuers only) |
| 4 | Latest dispositions | UI `/investment/holding-decisions`; `GET /api/investment/portfolio/DHAN_PORTFOLIO/dispositions` | per holding with a chain: verb, `limits.basis` / `policyVersion`, caps applied, `withheld` reasons, head `reportId` / `artifactVersion`, `generatedAt` |
| 5 | Re-run dispositions for covered holdings | `generate-holding-disposition.ts --portfolio DHAN_PORTFOLIO --holding symbol:<SYMBOL> --db … --owner-carrier … --data-root C:\iips-data` (runbook §15.6; `--dry-run` first if in doubt) | `UNCHANGED` / `CLOCK_ONLY_UNCHANGED` ⇒ nothing moved; `APPENDED` ⇒ a new version exists — read its `hardTrigger` reasons and `previous` verb; `CHAIN_PARAMETERS_DRIFT` ⇒ **stop** (F-1, FAIL CLOSED) |
| 6 | What changed since last review | UI `/investment/change-intelligence` and `/investment/company/<issuerId>` change timeline; API `GET /api/investment/company/<issuerId>/changes` and `/changes/boundaries` | the comparison's `pairClassification` (`GENERATION_METADATA_ONLY` / `FRESHNESS_TRANSITION` / `SUBSTANTIVE`), materiality levels, review triggers fired (`VERB_CHANGE`, `ADEQUACY_DOWNGRADE`, `MOS_BAND_CROSSING`, …) and their focus questions |
| 7 | Evidence behind any change | `GET /api/investment/company/<issuerId>/versions/<reportId>`; `show-investment-chain.ts --issuer <issuerId>` (runbook §14) | the assessment version a verb rests on; `datasetClass`, `dataAsOf`, quality verdict, adequacy |
| 8 | Limits in force | the `limits` block of any disposition read in step 4 | `OPERATOR_CONFIG`, `limits-policy/2026-11`, digest `bf8dd114…`; if `SYSTEM_DEFAULT` appears, the policy file was not read — investigate before anything else |
| 9 | Write the review note | §4 | — |

**What a review does not do.** It does not mint assessments (that is `generate-investment-artifacts.ts`, runbook §14,
run when new source data exists — S6-4), does not change the policy, does not act on a verb, and does not open a
second chain for a holding.

---

## 4. Where review notes live (authoritative location)

**Finding first.** The in-app Collaboration threads (`$IIPS_DATA_DIR/collaboration/`, NP-10) are owner-scoped research
notes, but their anchor set is closed to `company | evidence | watchlist` resolved against the **certified CSIP
universe** (`/api/company/:id`), not IID issuer ids (`frontend/server/collaboration/collaboration-resolvers.ts` L15,
L65–67). A note about `IN:CIN:L85110KA1981PLC013115` cannot be anchored there without an application change, which
is not authorised. So no in-app location exists for IID review notes today.

**Location of record (existing convention, no new kind of place):** the repository's IID evidence bundles under
`evidence/iid/` (index: `evidence/iid/README.md`; convention: one bundle per work item, each file distinguishes what
was *executed* from what was *argued*, operator-reported content is sanitised). Stage 6 reviews use **one bundle per
quarter**:

```text
evidence/iid/STAGE-6-WEEKLY-REVIEW-2026Q4/
  README.md                 bundle index: quarter, cadence decision reference, table of reviews (date · performed? · holdings reviewed · versions cited)
  REVIEW-2026-11-27.md      one file per Friday
  REVIEW-2026-12-04.md
  …
```

A review file is short and structured (template in §7). Host-local scratch (CLI `--out` JSON, readback JSON) stays on
the host; only sanitised facts (ids, verbs, versions, digests, counts) go into the file. A missed Friday is recorded
as a one-line "not performed — <reason>" entry in the README table, never silently skipped: a quarter with gaps is
still a quarter, but the count must be honest.

---

## 5. How the Stage 6 acceptance will be evidenced

Acceptance text (decision record §4.1): *"a quarter of review notes referencing ≥ 2 assessment versions per holding;
disposition rationale citations resolve (L-023); the user can answer 'what changed since last review and what do we do
about it' from the surfaces alone."* Evidence: *persisted report comparison outputs; disposition records with resolved
citations.*

| Requirement | How it accumulates | Where it is counted |
|---|---|---|
| A quarter of review notes | one `REVIEW-<Friday>.md` per week; a quarter = 13 consecutive Fridays — if the first review is **2026-11-27**, the 13th is **2027-02-19** (projection, not a commitment) | bundle `README.md` table |
| ≥ 2 assessment versions per holding referenced | requires **S6-4** (a second genuine assessment version per covered issuer, minted from newer source data) — until then every note will cite v1 only, and the README says so per holding | each review's "versions cited" column |
| Persisted report comparison outputs | once v2 exists, `GET /api/investment/company/<issuerId>/changes` returns a comparison with content; the review cites its `pairClassification` and triggers | review file §"Changes since last review" |
| L-023 citations resolve | at the first review, read the INFY disposition's `rationale[]` / `evidence[]` and record whether every cited id resolves (not yet checked on the host record — S6-1 record §10.4 item 5) | review file §"Evidence checks" |
| "What changed and what do we do about it" from the surfaces alone | each review answers both questions in one sentence each, citing only surfaces/ids from §3 | review file §"Answer" |

Dependencies that limit what the loop can show now: covered population = the governed issuers (Infosys; Marico / KEC
once S6-3 is done); sector references cover 2.29 % of weight (S6-1 record §10.4); assessment data is FY2024 until S6-4.

---

## 6. Boundaries

- Not authorised here: a scheduler/runner, notifications, a breach ledger, batch dispositions over all holdings, any
  change to `limits-policy.json`, any new anchor kind for Collaboration, any IPD or IPO Screening Engine change.
- The cadence is the owner's; a change of day or frequency is a one-line amendment to §1 by the owner.
- Production, hosting and multi-user use remain NOT ADMITTED.

---

## 7. Review file template (`REVIEW-YYYY-MM-DD.md`)

```markdown
# Weekly review — <YYYY-MM-DD> (Friday)   performed: yes | no — <reason>
IRR head on host: <sha>  · data root: C:\iips-data · policy: limits-policy/2026-11 (digest bf8dd114…)

## Holdings
portfolio DHAN_PORTFOLIO revision <n> · holdings <count> · RESOLVED <n> / UNRESOLVED <n> · new/removed: <symbols or none>

## Dispositions (covered holdings)
| holding | chain head (reportId vN) | verb | caps | limits.basis / policyVersion | run result (UNCHANGED / APPENDED / stopped:<code>) |

## Changes since last review
| issuer | pairClassification | materiality (max) | triggers fired | focus questions |

## Evidence checks
assessment versions cited: <issuer → v1 [, v2]> · L-023: all citations resolve? <yes/no + detail>

## Answer
What changed: <one sentence, citing ids>.  What we do about it: <one sentence; decision support, not an order>.
```

---

## 8. Records

Roadmap §C.16 · tracker §16.320 · runbook §15.7 · S6-1 record §10.5 (pointer). Register: no status change (L-023 is
checked by the first review, not by this record).
