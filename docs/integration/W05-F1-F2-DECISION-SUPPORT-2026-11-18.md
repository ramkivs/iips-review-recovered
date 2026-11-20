# W05 — Principal decision support: F1 (repository publication) and F2 (statement source)

**Status:** IN PROGRESS — NOT ACCEPTED. Decision support only: this document assembles the
exact evidence and the decision fields. It records no decision; the Principal decides.
**Date:** 2026-11-18. **Companion:** `W05-SCRIPTED-EXECUTION-RUNBOOK-2026-11-18.md` step 6.

Both decisions were open at the 2026-11-17 W05 handoff and remain open here. Until each is
recorded (or explicitly risk-accepted), the W05 acceptance conditions stay unsatisfied in the
review package.

---

## Decision fields (both records)

| field | required | content |
|---|---|---|
| `id` | yes | `F1` or `F2` |
| `decision` | yes | one of the options listed for that decision below (or an explicitly named alternative) |
| `decidedBy` | yes | the Principal (a decision is never inferred from availability, silence or an operator action) |
| `decidedAt` | yes | date of the decision |
| `basis` | yes | the evidence and reasoning relied on, citing the records below |

Record as `decisions/F1-repository-publication.json` and
`decisions/F2-statement-source.json` in the runbook evidence root (step 6/7).

---

## F1 — repository publication of the W05 source material

**Question.** May the not-freely-redistributable material gathered in the statements packaging
remain published in the (currently public) `iips-review-recovered` repository, or must the
repository become private / the material be removed / permission be obtained?

**Exact evidence (established, not re-verified here):**

* The statements packaging of 2026-11-12 gathered **135 files (71 + 12 + 52) of ≈1.6 MB**
  (DD/LLM/regex raw copies, raw pages and a raw export) from sources that are
  **not freely redistributable** (`W05-FINANCIAL-COVERAGE-2026-11-16.md`, §1 opening).
* Source groups include **investor decks / annual reports / press releases**; acquisition used
  the `W05-DEEP-PAGE-RETRIEVAL` guidance and confirmed reproduction conditions where those
  conditions were present (same record, §1).
* The material is **broader than the statements themselves** — it contains the **first
  financial pages** of the issuers (e.g. raw financial pages, raw exports) — and this is
  governed by the same source terms as the statements (§1).
* Prior agreements held **that materials are kept in private repositories only** (§1); the
  record states that **a decision is required** on whether to keep `iips-review-recovered`
  private, quarantine/remove the material, or obtain publication permission (§1).
* Removal by automated rebuild/patch was **not approved** (`ISSUES-NOT-YET-FIXED.md`); any
  removal/rebuild is a separate, Principal-governed change (`CONSEQUENCES-2026-11-18.md`;
  inventory maintained per `REPOSITORY-OWNERSHIP-2026-11-17.md`).
* The repository-ownership rules restrict push/merge/PR creation to the designated workflow and
  retain additions with the named owner (`REPOSITORY-OWNERSHIP-2026-11-17.md`).

**Options and their consequences:**

| option | consequence |
|---|---|
| `REPOSITORY_BECOMES_PRIVATE` | prior agreement respected; external access to the material stops; links/previews from public workflows break |
| `MATERIAL_QUARANTINED_OR_REMOVED` | requires the separate governed rebuild/patch process (not automated, not approved to date) with a maintained inventory |
| `PUBLICATION_PERMISSION_OBTAINED` | permission per source group, recorded in the rights evidence before publication continues |
| `PUBLICATION_RISK_ACCEPTED_WITH_RECORD` | the Principal explicitly accepts redistribution exposure on the record; no source terms are overridden by this — it is an acceptance, not an authorization |

## F2 — financial-statement source selection (and its permission gate)

**Question.** Which statement source does the repository select for the W08 statement work, and
how is the observed-reproduction permission requirement handled?

**Exact evidence (established, not re-verified here):**

* Roadmap standing decision (W05 section): **investor-hosted issuer-material reproduction only**
  (`Nse/Bse` archived investor relations) is source option **#1**; **issuer official investor
  relations only** is **#2**; **third-party provider only if the selected source requires one**;
  **no combined sources** (`IIPS_v3_IID_IMPLEMENTATION_ROADMAP-2026-11-05.md`, pinned extract).
* A **source selection is required before W08 statement-source selections** (same section).
* The reproduction capability of provider-hosted issuer materials was **observed but requires
  formal permission**; the arrangement/status is being established
  (`W05-FINANCIAL-COVERAGE-2026-11-16.md`, §7; `DECISION-REGISTER-3-2026-11-17.md`).
* The reproduction use case is described as central to “demo/analysis/commercial use”; provider
  arrangements will be required (same register) — an arrangement, once recorded, is part of the
  rights evidence, not a substitute for it.
* F2 is one of the two **open finance decisions** (`DECISION-REGISTER-3-2026-11-17.md`): the
  statement source + the permission gate. It remains open as of the 2026-11-17 handoff.
* Entitlement basis without written permission is limited to **manual local retrieval for
  personal analysis**; local retention is judgeable per source from terms; **redistribution is
  not authorized** (`W05-D1-D2-DECISION-IMPLEMENTATION-REGISTER-2026-11-17.md`).
* Source availability, retrieval success and full text access are **not** authorization
  (`W05-D1-D2…`, sources policy; `CONSEQUENCES-2026-11-18.md`).

**Options and their consequences:**

| option | consequence |
|---|---|
| `INVESTOR_HOSTED_NSE_BSE` | roadmap option #1; the observed reproduction still gates use behind formal permission unless provider terms cover it; record the arrangement status in the rights evidence |
| `ISSUER_OFFICIAL_IR` | roadmap option #2; no third-party permission needed; material availability varies per issuer |
| `THIRD_PARTY_WITH_PERMISSION` | allowed only if the selected source requires one; permission must be obtained and recorded first — never inferred |

Selecting an option does not itself authorize reproduction or redistribution: the permission
gate (where the selected source requires it) and the D1 entitlement/retention verdicts remain
independent conditions in the review package.

---

## Record templates

```json
{
  "id": "F1",
  "decision": "<REPOSITORY_BECOMES_PRIVATE | MATERIAL_QUARANTINED_OR_REMOVED | PUBLICATION_PERMISSION_OBTAINED | PUBLICATION_RISK_ACCEPTED_WITH_RECORD>",
  "decidedBy": "<Principal>",
  "decidedAt": "<YYYY-MM-DD>",
  "basis": "<evidence cited from the F1 evidence list above>"
}
```

```json
{
  "id": "F2",
  "decision": "<INVESTOR_HOSTED_NSE_BSE | ISSUER_OFFICIAL_IR | THIRD_PARTY_WITH_PERMISSION>",
  "decidedBy": "<Principal>",
  "decidedAt": "<YYYY-MM-DD>",
  "basis": "<evidence cited from the F2 evidence list above; include the permission-gate handling>"
}
```

Neither record may be created by an operator or an automated process; both are Principal acts.
