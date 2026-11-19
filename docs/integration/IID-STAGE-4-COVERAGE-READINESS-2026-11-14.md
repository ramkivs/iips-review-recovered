# IID Stage 4 — Coverage **Readiness** (assessment and verdict)

**Date of assessment:** 2026-11-14 (UTC)
**Assessed head:** `316da9772c1568c82ceb2e826893c4f8ffed1ef9` on `arena/94a53bb3-iips-review-recovered`
**Publication:** additive. PR #562 remains OPEN and UNMERGED.
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — assessment, implementation and documentation
**Evidence record:** `IID-STAGE4-COVERAGE-MEASUREMENT-EVIDENCE-2026-11-14.md` (published with this one)

> ## What this record is, and what it is not
>
> This is the **readiness** half of IID Stage 4: the verdict, the acceptance-criteria reading, the
> reconciliation of every Stage 4 dependency against actual code, and the remaining-action register. The
> observations it rests on — every count, digest, percentage and served response — are in the companion
> evidence record and are cited here by section rather than repeated.
>
> It **supersedes one thing**: the position of IID Stage 4, which no prior record assessed. It adds to
> everything else. It does not reopen Stage 2 or Stage 3, does not reinterpret any prior finding, and does not
> alter any protected record (§9).
>
> Stage 4 was **performed**, not merely investigated. Where the required implementation was within repository
> authority it was implemented and tested (§5, §6); where it was not, the blocked item is named with its exact
> technical evidence and its owner (§7).

---

## 1. Verdict

**IID Stage 4 is PARTIALLY COMPLETE.**

| Limb | Position |
|---|---|
| **Measurement limb** — issuer coverage, completeness, method usability and sector measurement verified on **installed** data | **MET.** All four verified on a dataset whose `datasetVersion` equals the Windows host's Stage 3 value (evidence §2, §3, §8) |
| **Gap closure G-7** (sector split-brain on the read path) | **CLOSED** on the read side, implemented and tested (evidence §4) |
| **Gap closure G-14** (two sector vocabularies, no lint) | **SUBSTANTIALLY CLOSED** — one vocabulary authority now reaches the read path; a lint over hand-authored rosters is still absent (**S4-R7**) |
| **Gap closure G-4** (zero operating-metric records) | **OPEN — correctly disclosed, and not closable by repository work.** Needs operating-metric data, an operator/owner transcription decision (**S4-R6**) |
| **Gap closure G-6** (no quarterly periods) | **OPEN — correctly disclosed, and not closable by repository work.** Needs quarterly data (**S4-R3**) |
| **Demo limb** — the §23 ten-scenario demo passing | **SUBSTANTIALLY MET — corrected twice at S4-R1.** After the second pass: **8 of 10 DEMONSTRATED** (scenarios 1, 2, 3, 4, 6, 7, 8, 9), **2 of 10 PARTIALLY DEMONSTRATED** (5, 10), **0 undemonstrable**. Both partials are partial for **one** reason owned by **IPD** (D5 binding + D6 IPC). *(First pass read 6/4: scenarios 2, 3, 4, 6, 7, 8 demonstrated; 1, 5, 9, 10 partial.)* Scenarios 1 and 9 moved on executed proof: the chain is minted and served **in-tree** through the product's own composition root (G-11 closed here; the store is a deployment setting, not a missing capability), and scenario 9's adequacy divergence is resolved by evidence — adequacy scores *statement coverage*, while the debt-side incompleteness §23 pointed at is published as `MISSING` net debt, a refused bridge and a withheld EV/EBITDA. **None is a population gap.** The remaining two depend on **D5/D6, which are IPD acts**: IRR has no holdings writer at all. This line previously read "**NOT MET.** 6 of 10 … **4 cannot be**, because they require populations that are not admitted"; that was a misreading of §23's own preamble, which designates a synthetic-fixture medium for scenarios 2, 3, 4 and 7 (evidence §10, §10.1). The accounting is now pinned by a committed executable test, not by prose |


**Overall IID readiness remains NOT READY**, and this record does not claim otherwise. `ready` is computed
from read-critical findings (`frontend/server/investment/runtimeReadiness.ts:489-493`); D2–D6 are all
outstanding (§4), so `ready` stays `false` regardless of anything Stage 4 achieved. Stage 4 was never on the
`ready` path, and closing it would not have flipped that.

**Stage 2 remains open** on S2-R1 (the owner's O1 decision) and **Stage 3 remains READY** with R-1/R-2
captures outstanding. Neither status is changed here.

---

## 2. Scope and baseline

### 2.1 What Stage 4 is, from the authoritative sequence

The authoritative sequence is the primary baseline's §21 stages, adopted by reference in `CPII-01` §10.1. It
is **not** re-sequenced here. `CPII-01` §10.1 assigns Stage 4 the activity **B-1** and the gap closures
**G-4**, **G-6** and **G-7**; it assigns **B-4 through B-7 to Stage 5**.

One correction to the framing this stage was given, recorded so it is not repeated: **`CPII-01` §12 contains no
Stage 4 sequencing.** §12.2 mandates one operational check (`measuredSectors > 0` rather than
`datasetClass !== 'NONE'`), and evidence §4.2 shows that check is necessary but not sufficient. The
authoritative Stage 4 requirements are the baseline's §21 acceptance text, §23 demo and §24 gap list, reachable
only through the blob digest pinned in `CPII-01` §13.2. That blob was fetched and its digest verified before
any requirement in this record was relied on.

### 2.2 The baseline given at the start of this stage

* investment route returns **200** with `identitySourcesAvailable true`, `identitySourceDetail null`, and the
  missing-identity disclosure gone;
* the Identity Coverage route still returns **503** `observation-sources-unavailable`.

Both were **re-measured and confirmed** (evidence §6) — and treated as a starting baseline, not as proof of
Stage 4 completion. Neither was altered: the identity route still answers 503 for its own reason, no resolver
rule was widened, and no source observation was fabricated to force a 200.

### 2.3 What was deliberately not in scope

No organisational governance or committee approval, no multi-user or SaaS construct, no production deployment
requirement, no unrequested identity or issuer population, no unrelated IPO Screening Engine concept, and no
new architecture outside Stage 4. Where a document said "owner context", the actual runtime requirement was
determined instead (§4, D3/D4) and left with its owner rather than turned into an approval process. This is a
local, single-user, non-production personal investment application, and the required outcome is working
technical coverage readiness.

---

## 3. §21's acceptance text, clause by clause

| Clause | Position | Evidence |
|---|---|---|
| Per-sector `measured: true` for Technology, Consumer and Industrials | **MET exactly** — those three and only those three; the other ten are `UNMEASURED` and listed in `outstandingSectors` | evidence §3 |
| Unavailable methods carry reasons | **MET** — no withheld method anywhere carries a null reason or an empty `missing` list, at either layer | evidence §3.1, §8.2 |
| Completeness and adequacy per issuer | **MET** — all three `SUFFICIENT`, required-field coverage 100%, zero missing fields, all three statements PRESENT, zero violations, with quality verdicts and flags recorded | evidence §8 |
| **Zero fabricated figures** (hand-check five derived values) | **MET and exceeded** — all 49 derived values recomputed exactly from their own inputs (0 mismatches) and all 304 as-filed figures checked cell by cell against the committed transcription (0 mismatches). **With one stated limitation: the filing PDFs are not committed, so this verifies transcription → dataset → derivation, not PDF → transcription** | evidence §7, and §7.4 for the limitation |
| Run measurement on installed data | **MET** — `datasetVersion sha256:3ad82918…76de2d83`, equal to the host's Stage 3 value | evidence §2 |
| Reconcile against bundle expectations | **MET, with one divergence found and explained** — Marico `G1_ENABLED` and KEC `G2_PARTIAL` agree exactly; Technology is measured with `EV_REVENUE` withheld naming `TM_NRR`/`TM_RECURRING_REVENUE_PCT` as expected, **plus a second withholding the expectation did not name** (`EV_EBITDA` on `NET_DEBT`), traced to an untranscribed input and correctly refused | evidence §3.2 |
| Decide on operating metrics to unlock `TM_*`/`IN_*`/`BM_*` | **NOT DECIDED** — an owner/operator act, recorded as **S4-R6** | evidence §9 |
| Fill corporate actions as events occur | **NOT DONE** — event-driven by definition, recorded as **S4-R8**; `merge.actions 0` | evidence §2, §9 |
| Extend the tag map only with golden-fixture discipline (`L-002`) | **NOT TRIGGERED, and nothing was extended** — the installed dataset carries **0** ingestion issues, so no `UNMAPPED_XBRL_TAG` exists to map | evidence §9 |
| The §23 ten-scenario demo passing | **SUBSTANTIALLY MET** — **8 demonstrated, 2 partially demonstrated, 0 undemonstrable** after the S4-R1 second pass (was 6/4). The two residuals are one IPD-owned dependency (D5/D6); scenario 9's divergence is resolved by evidence and scenario 1's chain is served in-tree. Neither is a population gap | evidence §10; `IID-S4-R1-SCENARIOS-1-5-9-10-EVIDENCE-2026-11-16.md` |
| Independent of IPD | **CONFIRMED** — no IPD binding, no IPC peer, and neither D5 nor D6 was asserted or worked around | §4, §9 |

---

## 4. Every Stage 4 dependency reconciled against actual code

The Stage 2 reassessment's D1–D8 table (`IID-STAGE-2-READINESS-REASSESSMENT-2026-11-14.md:324-331`) is the
dependency set. D2–D6 were each reconciled against the code that implements them —
`frontend/server/investment/runtimeReadiness.ts` — rather than against the table's prose. **None of them gates
the investment coverage route**, which is served from the local dataset plus the published identity set; that
is a measured fact (evidence §6), not an inference.

| ID | Technical meaning, as implemented | Setting | Reason when unmet | `actionOwner` | Position after Stage 4 |
|---|---|---|---|---|---|
| **D2** `np04-assessment-store` | NP-04 governed persistence holding assessment artefact chains and version history | `NP04_DATABASE_PATH_ENV` — must be an **absolute, server-owned path outside any Git working tree, distinct from the Gate 3 store and from `IIPS_DATA_DIR`**, then the transport must be restarted | `irr-owned-not-configured` / `DATABASE_PATH_NOT_CONFIGURED` | `USER_HOST` | **OUTSTANDING, unchanged.** Not touched: no store was created, opened for write, or named as a chosen technology (§9.4) |
| **D3** `reports-owner-context` | Establishes which governed Reports partition serves assessment reads; required before any artefact read | `REPORTS_OWNER_PATH_ENV`, evaluated by `evaluateReportsOwnerContext(env)` | `user-host-provisioning-required` / `REPORTS_OWNER_CONTEXT_UNAVAILABLE (<reason>)`; when satisfied, `REPORTS_OWNER_CONTEXT_ESTABLISHED` with evidence `configured-runtime` | `USER_HOST` | **OUTSTANDING, unchanged.** This is a runtime provisioning requirement, not an approval process |
| **D4** `owner-context-carrier` | Scopes watchlist and collaboration reads to the local user; **a missing carrier must not widen access** | `OWNER_CONTEXT_PATH_ENV`, evaluated by `evaluateOwnerContext(env)` | `user-host-provisioning-required` / `OWNER_CONTEXT_UNAVAILABLE (<reason>)`; when satisfied, `OWNER_CONTEXT_ESTABLISHED` | `USER_HOST` | **OUTSTANDING, unchanged** |
| **D5** `ipd-binding-precondition` | A **server-owned declaration** that IPD provisioned the active owner binding used by portfolio reads. IRR cannot establish it and must not assert it; a declaration is not a verified binding, so `readable` stays unproven | `BINDING_PRECONDITION_SETTING = true`, gated by `readBindingPrecondition` **and** `isOwnerContextEstablished(ownerContextFromBinding(…))` | `ipd-owned-unavailable` / `BINDING_NOT_PROVISIONED` | **IPD** | **OUTSTANDING, and out of reach by design.** Stage 4 is explicitly independent of IPD |
| **D6** `ipc-endpoint` | The same-host IPC target for read-only portfolio/holding retrieval from IPD. **No connection is attempted** — a POSIX socket is statable, a Windows named pipe is not, so `readable` is `null` and the reason states *"Peer liveness not probed"*; socket presence is not a successful IPC call | `IPC_ENDPOINT_SETTING`, resolved by `resolveIpcEndpoint(env, platform)` | `ENDPOINT_RESOLVED_PEER_ABSENT` when a statable socket is missing | **IPD** | **OUTSTANDING, and out of reach by design** |

Capability tags, unchanged: D2/D3 ⇒ `IID-01, IID-03`; D4/D5/D6 ⇒ `IID-02`.

**D1 `identity-files` and D8 `fundamentals-dataset` are RESOLVED** and were relied on, not re-derived: the
identity set was published by the real provisioner (`RESULT PASS`, three digests matching the values predicted
before any host run), and the dataset was ingested from the three admitted bundles to the host's own
`datasetVersion`. D7 is operator-declared and excluded from the `ready` rule.

**Required resolution sequence, and why Stage 4 did not wait for it.** D2, D3 and D4 are host environment
provisioning; D5 and D6 are IPD-owned. None is within repository authority, and none gates the served
investment coverage route. Stage 4 therefore proceeded on its own dependencies — which the baseline states as
*"needs Stages 2–3"*, both satisfied in substance — and did **not** wait for an unrelated item the roadmap does
not require. **The specific trap this avoids:** D1's identity publication does *not* by itself make the
coverage surface available, and the coverage surface does not depend on D2–D6 at all. Assuming either would
have produced a false blocked-claim or a false readiness-claim.

One consequence stated plainly: because D2–D6 are outstanding, `ready` remains `false`, and **no Stage 4 result
changes that**. The §8 adequacy computation was performed read-only through the pure engine precisely so that
it did not require D2's store or D5's binding (evidence §8).

---

## 5. Technical implementation completed

The smallest complete change the roadmap requires. Full detail, with every line number, is in evidence §4.3.

**The defect (`G-7`, and `G-14`'s re-entry path).** Sector membership is decided by string equality, the sector
list comes from a compile-time cast, and a TypeScript type is erased at runtime. An issuer whose sector is not
exactly one of the thirteen canonical names matches no sector — and before this change **nothing anywhere said
an issuer had been dropped**, while the route still answered 200. The existing guard
(`assertValidIssuerSectors`) has exactly **one call site repo-wide**, `cli/ingest.ts:180`, so it protects one
path into a dataset and none of the ways an already-written dataset can be wrong. Demonstrated: a dataset
written directly by `writeDataset` with a respelled sector is digest-consistent and **ACCEPTED** by
`readDataset`.

**The fix.** Make the read path — the one place every consumer passes through — classify each issuer's sector
with **the same pure classifier the ingestion guard already uses** (`findInvalidIssuerSectors`), and disclose
the result. Two files changed:

* `iips-platform/src/investment/coverage/measure.ts` (+72/−1) — `CoverageReport` gains a **required**
  `offVocabularyIssuers`, computed before the sector loop because it is a fact about the dataset; a new
  exported `sectorVocabularyLines(report)` is appended to the summary **unconditionally**, so a clean dataset
  states that the vocabulary was actually tested rather than merely printing nothing.
* `iips-platform/src/investment/coverage/investmentCoverage.ts` (+55/−1) — a new exported
  `OffVocabularySectorIssuer` (the roster `index` deliberately dropped: it is a position in an input file), a
  required `offVocabularyIssuers` on the served report, **one** extra note and **one** extra status-line clause,
  both **only when non-empty**, and deliberately **not** routed through `issues` — which would have flipped the
  row to `ISSUED_DATA` and hidden a vocabulary defect inside a generic per-issuer count.

**Three design decisions, each of which is a refusal to do something easier:**

1. **Disclosure, not repair.** The measurement does not move: the defective dataset reads 2/13 measured before
   and after, and the Technology row is byte-identical. No sector was widened, no value normalised, no
   observation fabricated.
2. **One vocabulary authority.** The read path imports the ingestion guard's classifier rather than adding a
   second opinion about what the vocabulary is — which is what `G-14` actually complains about.
3. **A clean result is affirmative.** The summary line prints in the clean case too, because a line that
   appears only when something is wrong cannot distinguish "checked and clean" from "not checked".

**A second gap closed: `G3_WITHHELD` had zero tests.** §23 scenario 8 *is* that stage, and a repo-wide search
found the literal in two source files and **no test file**. It is now exercised: the stage is reached, the
missing Banking metrics are named, `UNMEASURED` is held distinct from it, nothing is approximated, and the
scenario-10 counts still partition exactly (evidence §5).

**One asymmetry was pinned rather than smoothed over.** `measuredSectors` still counts a `G3_WITHHELD` sector
while that sector's issuers are `SECTOR_NOT_MEASURED`. Both are correct statements about different things —
a completed *measurement* versus *usability* for one issuer. Adjusting `measuredSectors` would have invalidated
the host-verified Stage 3 figure of "3 of 13 sectors", so neither number was changed and the pair is now pinned
together in one test (evidence §5).

---

## 6. Served-surface results, before and after

Measured through the **real composition root** over real HTTP —
`executive-transport.ts:827-845` → `handleInvestmentCoverageRequest` →
`createCoverageProviders({ dataRoot })` → `investmentCoverageFromLocalDataset` — not through an isolated helper.

| | BEFORE (`316da977`) | AFTER (this change) |
|---|---|---|
| Canonical dataset, `GET /api/investment/coverage/investment?asOf=2026-11-14` | **200**, 3/13 sectors, `identitySourcesAvailable true`, `identitySourceDetail null`, all rows `COVERED`, `notes.length 2`, no vocabulary statement anywhere | **200**, identical, **plus** `offVocabularyIssuers: []` and an affirmative summary line stating the vocabulary was tested |
| One sector respelled off-vocabulary | **200**, 2/13 sectors, **and nothing indicated an issuer had been dropped** — the summary did not mention the bad value and did not name the issuer | **200**, 2/13 sectors (**measurement unchanged**), `offVocabularyIssuers` names the issuer, the value as written, the reason, and the correction; the status line gains one clause; one note is added |
| A near miss (`"consumer"`) | silently dropped | **200**, `reason CASE`, `canonicalSector "Consumer"`, `correction "match case exactly"` — named, and still **not** normalised |
| `GET /api/investment/coverage` (identity route) | **503** `observation-sources-unavailable` | **503**, unchanged — correct, and Stage 5's |

Three properties that make this disclosure rather than a gate: `observed` and `issuers.length` **never change**
across all four states; the route **never fails**; and serving performs **no writes** (the identity directory
snapshot and the dataset manifest bytes are identical across three consecutive requests).

**Both R-2 captures now have their expected content measured in this sandbox** — capture (a) with 3 issuers,
`datasetClass OPERATOR_SUPPLIED`, all rows `COVERED`, 3/13 sectors, ten outstanding sectors named, usable
methods > 0, `identitySourcesAvailable: true` and `identitySourceDetail: null`; capture (b) as 503 with
`observation-sources-unavailable` and **not** `identity-sources-unavailable`. R-2 nonetheless remains **OPEN**:
it requires the **host** capture, and a sandbox measurement is not a host artefact (§7).

---

## 7. Remaining-action register

R-1…R-4 and S2-R1/S2-R2 are the existing identifiers, **re-evaluated here and preserved at their actual
status**. None is renamed, none is auto-closed, and none is reclassified. New Stage 4 items carry their own
prefix so they cannot be confused with Stage 2's or Stage 3's.

| ID | Action | Owner | Status after Stage 4 | Exact act | Exact evidence that closes it | Blocks what? |
|---|---|---|---|---|---|---|
| **R-1** | Capture the readiness diagnostic from the host process | **OPERATOR** (`USER_HOST`) | **OPEN — unchanged.** Stage 4 supplied no host capture; it ran in this sandbox. D1's flip remains derived, not captured | On the host, in the server process carrying `IIPS_DATA_DIR=C:\iips-data`, run the existing `iid-readiness` diagnostic. No new tooling | Its stdout showing `identity-files` as `irr-owned-operational` with reason `IDENTITY_SOURCES_VALID`, alongside `fundamentals-dataset` operational, `ready: false`, `--strict` exit **1**, and **D2–D6 outstanding** | Baseline acceptance clause 4 **as a capture**. Not the installed fact, which the host verified twice |
| **R-2** | Capture the served coverage surface | **OPERATOR** | **OPEN — re-scoped by Stage 2, and now with its expected content measured (evidence §6), but still not captured on the host.** One expectation changed again: the investment response now also carries `offVocabularyIssuers` and, for a canonical dataset, an affirmative vocabulary line | Two captures, each naming its route. **(a)** `GET /api/investment/coverage/investment?asOf=…`. **(b)** `GET /api/investment/coverage?asOf=…` | **(a)** 3 issuers, `datasetClass OPERATOR_SUPPLIED`, all rows `COVERED`, **3/13** sectors, ten outstanding named, usable methods > 0, `identitySourcesAvailable: true`, `identitySourceDetail: null`, **`offVocabularyIssuers: []`**. **(b)** 503 with error `observation-sources-unavailable`, subject `holdings/broker-preview/watchlist`, and **not** `identity-sources-unavailable` | Baseline acceptance clause 1 and the "page capture (host)" evidence item. Not the substance, verified here |
| **R-3** | Record the installation invocation's stdout | **OPERATOR** (optional; superseded in substance) | **OPEN — unchanged.** Stage 4 does not bear on it. Reinstallation remains **prohibited** | None required | As the Stage 3 record states | Nothing |
| **R-4** | Adjudicate `L-041` and `L-042` | **OWNER** (register act) | **OPEN — unchanged.** Both remain OPEN and neither was adjudicated here (§8) | An owner decision in the limitation register | An owner decision recorded in the register | Nothing in Stage 4 |
| **S2-R1** | Record the owner's **O1** decision | **OWNER** (register act) | **OPEN — unchanged, and now with a concrete Stage 4 consequence.** Stage 4's substance did not wait for it, exactly as the Stage 2 record predicted; but O1 also settles whether the admitted population is the intended one, which is now visibly load-bearing for the demo limb (**S4-R1**) | A decision recorded as O3's was: the intended population, the eligibility rule (or explicit adoption of source-supplied `status`), and who may edit the published set | An O1 decision record | **Stage 2's closure**, and the framing of **S4-R1**. Not Stage 4's measurement |
| **S2-R2** | Supply the host transcript detail that was not captured | **OPERATOR** (optional) | **OPEN — unchanged.** Stage 4 added no host transcript | Re-run `-VerifyOnly` (read-only, safe to repeat, must not re-publish) with `-Report <path.json>`, or supply the full stdout of any one run | `$PSVersionTable.PSVersion` and `node --version`; the `asOf` used; per-check detail lines; `published.digest` and `verification.*` as **host-observed** rather than predicted | Nothing |
| **S4-R1** | Close the §23 **demo limb** | **IRR** (demonstration) — **re-classified from OWNER/OPERATOR: no population decision was ever needed** | **SUBSTANTIALLY DISCHARGED — second pass, 8 / 2.** The accounting is **8 demonstrated / 2 partially demonstrated / 0 undemonstrable**, pinned by a committed executable matrix test (`iips-platform/tests/investment/iidStage4ScenarioMatrix.test.ts`, **39 tests / 11 suites**, 39 pass) together with the scenario-closure suite (`frontend/server/investment/iidStage4S4R1Scenarios.test.ts`, **22 tests**, 22 pass) which runs the **product's own composition root** over a real NP-04 store. Two corrections since the first pass, both from evidence and neither from relaxing a criterion: **(a)** the first pass charged scenario 1 to "D2 unconfigured", but the store is a **pinned dependency** and `IIPS_NP04_DATABASE_PATH` is a **deployment setting** — given a real store the shipped mint CLI and read route both work, so the chain is now minted, served `200`, independently re-read by a second reader, idempotent on repeat, and `404` when absent, closing **G-11 in-tree**; **(b)** scenario 9's `PARTIAL`-vs-`SUFFICIENT` gap is a **domain mismatch, not a defect**: adequacy scores nine statement items over three periods (1.0 coverage, 0 missing), while the debt-side incompleteness §23 pointed at is real and published elsewhere in the same payload — net debt `MISSING`/`NOT_REPORTED`, bridge `NOT_COMPUTABLE`, `EV_EBITDA` withheld, intrinsic and MoS null, `STALE_DATA` cap, combined confidence 0.3199. `REQUIRED_ITEMS` and every threshold are **unchanged**; the expectation is explained, not overridden. Scenario 10's mixture is demonstrated on the three real admitted issuers through the served preview lane (`observed 4 / RESOLVED 3 / UNMATCHED 1`, counts reconciled, nothing promoted), but its *persisted-holdings page* clause keeps it partial. | Nothing further from an **owner** for the demonstration. What remains is one **IPD-owned** dependency, not Stage 5 work: **D5** (active owner binding) and **D6** (listening IPC peer). IRR has **no holdings writer anywhere** — the holdings lane is an IPC *consumer*, so the `503 holdings-unavailable` is the correct served evidence, not a gap IRR can fill. Two non-demonstration questions stay open and are **not** charged to this row: `G-10`'s raw-HTML `/investment/coverage` (owner decision **O9**, a new surface) and adding debt-side items to `REQUIRED_ITEMS` (a **valuation-policy** decision under R-13). | **Stage 4's demo limb is discharged to the limit of IRR's authority**: 8 of 10 scenarios no longer constrain the verdict. The verdict stays partial because scenarios 5 and 10 need an IPD act and because G-4/G-6 remain open as data acts |

| **S4-R2** | Transcribe Infosys' missing borrowings lines | **OPERATOR** (transcription) | **NEW.** `LONG_TERM_BORROWINGS` and `SHORT_TERM_BORROWINGS` were **never transcribed** for Infosys in any of the three periods, so `NET_DEBT` is not derivable and Technology's `EV_EBITDA` is withheld `STATEMENT_INPUT_MISSING`. This is a transcription-completeness gap, **not** a measurement, derivation or policy defect — `derive.ts` correctly refuses, because "an unreported input is never silently zero" | Transcribe both lines for the three periods from the filing and re-ingest. **Do not** widen the derivation | Technology's `EV_EBITDA` `AVAILABLE`, or a `NOT_REPORTED` recorded at source with its reason | One withheld method. Nothing structural |
| **S4-R3** | Install quarterly periods, or more recent annual filings | **OPERATOR** (data) — this is `G-6` | **NEW.** All three issuers exceed the freshness window at the assessment clock: 958, 958 and 228 days against `VALUATION_POLICY.freshness.pnlDays = 200`. All three therefore carry `STALE_STATEMENTS` (HIGH) and a `MATERIAL_CONCERNS` quality verdict | Install quarterly data (`quarterlyPeriods` is 0 today) or newer annual filings | `quarterlyPeriods > 0`, or staleness within 200 days, and `STALE_STATEMENTS` no longer raised | **G-6**, and the currency of any valuation claim on this data. Not Stage 4's measurement |
| **S4-R4** | Document that coverage "usable" does not mean "a valuation would be produced" | **IRR** (documentation) | **NEW — partially discharged.** The two layers answer different questions by design: coverage asks whether a method is computable for **any** issuer-period, assessment resolves **one latest instant** with a stricter input set. Both are correct; a reader could infer a valuation from a coverage row. Recorded in evidence §8.2 rather than in source, to keep the Stage 4 diff minimal and the validator's line pins stable | A source-level note in the coverage module stating the window difference | The note committed | Nothing. This is a misreading risk, not a defect |
| **S4-R5** | Decide whether coverage availability should remain existential over annual periods | **OWNER** — **DECIDED 2026-11-17: retained** | **DISCHARGED.** `measureCoverage` declares a method `AVAILABLE` if **at least one** issuer-period has all its inputs. Consumer's `EV_EBITDA` therefore rests on **FY2023 alone** — the single year Marico's `LONG_TERM_BORROWINGS` was transcribed — while FY2022 and FY2024 do not support it. The owner **retained** those existential semantics and required **historical availability** and **latest-per-issuer-period readiness** to be kept distinct in what is served and displayed. Recorded, with evidence and the issuer-neutral reporting correction, in `IID-COVERAGE-AVAILABILITY-SEMANTICS-2026-11-17.md`; addendum at the foot of this table | Keep existential availability (a dataset-capability statement) and disclose readiness separately, or require the latest period | A recorded decision, and the code or the record amended to match | **Decision recorded and the reporting gap closed**: decision text, the shared `qualificationOf` predicate, the per-issuer `methodAvailability` block, relabelled counters on all four surfaces, and **10** new platform tests plus **7** new SPA tests. Measurement unchanged (digests identical); no formula, threshold, window, eligibility or withholding rule touched; nothing substitutes a zero or an older value |
| **S4-R6** | Decide on operating metrics to unlock `TM_*`/`IN_*`/`BM_*` | **OWNER** with **OPERATOR** — this is `G-4`. **Investigated 2026-11-18; decision still OPEN** | **INVESTIGATED — `G-4` remains OPEN, owner decision outstanding.** `operatingMetricRecords` is **0** on both served datasets and no real-issuer bundle in this repository carries a metric row (the only committed metric file is a **synthetic** 7-row fixture), so **14 of 38** method slots are metric-gated; **two** of them are live — Technology `EV_REVENUE` (`TM_NRR` + `TM_RECURRING_REVENUE_PCT`) and Industrials `EV_REVENUE` (`IN_BOOK_TO_BILL`), both `WITHHELD` `MANDATORY_METRIC_MISSING`; the other **twelve** are `UNMEASURED` for want of an admitted issuer. Consumer declares no mandatory metric and is unaffected. The generic ingestion/validation/gating path was **verified, not changed** — 25 new tests plus 12 capability probes; **no defect prevents any required behaviour**, so the source diff of this item is empty. Source evidence: Infosys does not disclose NRR/recurring-revenue share in a carryable form (`REL-1` §operating metrics), and KEC prints order intake/order book but **not** a book-to-bill ratio, which the record forbids deriving by division (`WI8` §7) | Supply validated operating-metric records, or record that these methods stay withheld for this population | `operatingMetricRecords > 0` with `validation VALID`, and the named methods `AVAILABLE` | **`G-4` stays OPEN**: option B alone satisfies neither clause of the stated closure evidence and would record a **controlled limitation**, not a closure. The repository states the `S4-R6` closure test **two ways** (this row's numeric evidence vs `S4-R3` reassessment §4's "…or a recorded decision to keep methods withheld"); which governs is itself an owner decision and is **not** resolved here. See `IID-S4-R6-OPERATING-METRICS-2026-11-18.md` §7 |
| **S4-R7** | Add a lint over hand-authored rosters | **IRR** — this is the remainder of `G-14` | **NEW.** The read path now catches the defect class at runtime, which is the stronger position, but `G-14`'s literal complaint (*"no lint"*) is not yet answered statically | A repository validator that rejects an off-vocabulary `sector` in any committed roster, using the same `findInvalidIssuerSectors` authority | The lint failing on a deliberately respelled fixture roster | Nothing. `G-14` is substantially closed by the read path |
| **S4-R8** | Fill corporate actions as events occur | **OPERATOR** — event-driven | **NEW, and named by §21 itself.** `merge.actions 0`, `corporateActions 0` | Record actions as they occur and re-publish | `corporateActions > 0` | Nothing today |

**Addendum — S4-R3 host candidate build and dataset verification recorded (host report date 2026-11-15).**
The `S4-R3` row above is **not closed**, and no other row changed. The operator has since built the exact
O3-admitted candidate on the Windows host at `7ef0f10` through the authoritative ingestion pipeline, outside the
repository: driver `BUILD-VERIFY-PASS; 75 passed, 0 failed; ExitCode=0`, wrapper **PASS** 16/16, authoritative
`verify-installed-dataset` **PASS** 31/0 exit 0, actual digest equal to
`sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b`. This discharges the candidate-build and
candidate-verification limbs only. `S4-R3` stays OPEN because `STALE_STATEMENTS`/`STALE_DATA` persist for all three
issuers; `G-6` remains partially discharged in candidate; `G-4`, `S4-R6`, `S4-R7`, `R-1`, `R-2`, `R-4`, `S2-R1`,
`S2-R2` and `D2`–`D6` are unchanged. **Runtime installation is not authorized and was not performed**; the active
dataset, identity directory and portfolio database were protected and the portfolio database was not accessed.
Stage 4 remains **PARTIALLY COMPLETE** and overall IID readiness remains **NOT READY**. Full host evidence:
`IID-S4-R3-WINDOWS-HOST-BUILD-AND-VERIFICATION-EVIDENCE-2026-11-15.md`; current S4-R3 position:
`IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md` §6.

**Addendum — S4-R7 static roster vocabulary lint COMPLETE (2026-11-15).** The `S4-R7` row above is now
**DISCHARGED**; no other row changed. IRR added `iips-platform/scripts/lint-roster-sectors.ts`
(`npm run lint:rosters`, or `tsx scripts/lint-roster-sectors.ts [--root <dir>] [--json]`). It discovers the
committed hand-authored roster population by walking the checkout for `roster.json` and
`eligible-roster.json` — not by naming bundles — and classifies every sector with `findInvalidIssuerSectors`,
the same authority the ingestion guard and the read path use. **18 rosters checked (11 ingestion + 7
identity), 0 failed**; the discovered set equals the published tree's roster set exactly. A synthetic
respelled fixture under `iips-platform/tests/investment/fixtures/roster-lint/` **exits 1**, naming the file,
issuer and offending value, with both offenders reported. The lint is read-only: every roster's bytes and
mtime are unchanged, and all 18 roster blobs are identical to the published ones. New suite **19 tests /
4 suites / 0 fail**; platform typecheck **0**; explicit script+test typecheck **0**. Implementation commit
`3a3521a9a3497607911cf790a53a4f61b3d2cd0a` on `arena/53ff9276-iips-review-recovered`, independently verified
(5 changed paths, every blob byte-identical, all evidence/docs/runtime trees unchanged). **This closes the
literal `G-14` "no lint" complaint only.** `G-4`, `G-6`, `S4-R3`, `S4-R6`, `R-1`, `R-2`, `R-4`, `S2-R1`,
`S2-R2` and `D2`–`D6` are unchanged; Stage 4 remains **PARTIALLY COMPLETE**, Stage 5 is **not** declared
ready, and overall IID readiness remains **NOT READY**. Full record:
`IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md` §7.

**Addendum — S4-R3 Windows read-only candidate verification recorded (recorded 2026-11-15).** The `S4-R3` row
above is **not closed**, and no other row changed. The operator ran
`IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1 -VerifyOnly` on the Windows PowerShell 5.1 host against the existing
candidate at `C:\iips-candidates\S4-R3-preflight-7ef0f10`, baseline `7ef0f10`:
**`VERIFY-PASS; 46 passed, 0 failed; ExitCode=0`**, pinned wrapper **PASS** `checks=16` with
`comparable-manifest matches=1`, authoritative `verify-installed-dataset` **PASS** `checks=31`, `failed=0`,
exit 0, read-only attestation `1`, digest
`sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b`; all three admitted issuer input
digests matched. **No build was started; nothing was written.** This discharges the Windows read-only
candidate-verification limb only. **Installation/replacement was not performed** and needs separate owner
authorization plus a governed replacement procedure. `S4-R3` stays OPEN because `STALE_STATEMENTS`/`STALE_DATA`
persist for all three issuers; `G-6` remains partially discharged in candidate; `G-4`, `S4-R6`, `R-1`, `R-2`,
`R-4`, `S2-R1`, `S2-R2` and `D2`–`D6` are unchanged; `S4-R7` remains DISCHARGED per the addendum above. The raw
manifest-byte diagnostic stays distinct from the passed authoritative comparable-fields identity check. Two
transcript anomalies (a 68-character hex copy artefact and one missing diagnostic line) are disclosed, not
silently corrected. `L-041`/`L-042` remain **OPEN**, source rights remain `OPERATOR_ASSERTED`, identity sources
remain `IDENTITY_SOURCE_MISSING`, 3 of 13 sectors are measured. The active dataset, identity directory and
portfolio database were protected and the portfolio database was not accessed. Stage 4 remains
**PARTIALLY COMPLETE** and overall IID readiness remains **NOT READY**. Full record with the verbatim transcript:
`IID-S4-R3-WINDOWS-READONLY-VERIFICATION-EVIDENCE-2026-11-15.md`; current S4-R3 position:
`IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md` §8.

**Addendum — PA-01 operating-authority amendment IN FORCE (2026-11-15).**
`IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md` is now the governing operating policy for the IID
personal-use path and **wins over the approval language in this register**. The owner is the sole operational
authority for this personal, single-user, non-production application. Effect on the rows above, applied
prospectively without rewriting any historical statement: **R-4** (formal adjudication of `L-041`/`L-042`) is
**removed as a ceremony** — both stay listed as known technical disclosure defects that block nothing;
**S2-R1** (record owner decision O1) is **removed as a gate** — the owner selects their population by authoring
the roster, and Stage 2 is not held open for a decision record; **S4-R5** and **S4-R6** become ordinary
maintenance choices the owner makes directly, keeping their technical content; **S4-R3** installation is an
**ordinary owner-directed local dataset replacement**, no longer "NOT AUTHORIZED"; and the §11/§12 prohibition on
reinstalling the dataset or republishing identity is **withdrawn**. **R-1**/**R-2** remain real work — they are
host captures, i.e. verification steps, not approvals. **S4-R7** stays DISCHARGED. What replaces approval is
PA-01 §4: preserve data, verify the backup, verify candidate digests, use supported mechanisms, verify through
the product's own readers, roll back on failure, record concisely. **Untouched:** IRR/IPD write boundaries,
provenance and missing-value refusal, digest and identity integrity, backup/recovery, honest evidence, and the
exclusion of production/SaaS/multi-user/commercial use. PR #562 is **not** merged. This addendum closes no
technical finding: `G-4`, `G-6`, freshness, `L-041`, `L-042` and the IPD-owned Stage 5 dependencies are unchanged,
Stage 4 remains **PARTIALLY COMPLETE**, and overall IID readiness remains **NOT READY** as an accurate
description of an incomplete integration — not as a release gate.

**Explicitly not remaining actions**, because naming them would reorder the roadmap, reopen closed work, or
exceed this stage's authority: merging PR #562 (an owner act); repeating the identity publication or
reinstalling the Stage 3 dataset (both prohibited — both are evidence); re-running `-Execute` (the set is
published and verified); anything in D2–D7 (separate dependencies, separate owners, §4); adjudicating source
rights; Win32 interrupted-publication recovery fault-injection (never authorised); Stage 5 work (B-4/B-5/B-6/
B-7, and B-3's observation sources — which is why the identity route stays 503 *regardless of B-3*).

**Stage 4 did not wait for an unrelated item.** R-1, R-2, S2-R1, S2-R2, D2–D6, `L-041` and `L-042` are all
still open, and none of them blocked the measurement limb — which is why it was performed rather than deferred.

---

## 8. Disclosures and limitations, retained in full

1. **`L-041` (source-rights verification) remains OPEN, and Stage 4 did not narrow it.** The installed
   dataset's `sourceRights.state` is `OPERATOR_ASSERTED`. Stage 4's zero-fabrication verification
   (evidence §7) proves *transcription → dataset → derivation*; it does **not** verify *PDF → transcription*,
   because the filing PDFs are not committed to the repository and were not fetched. The bundle READMEs'
   page locators and their own attestation are the only support for that step, and `L-041` is exactly the
   limitation that says an operator assertion is not independent legal verification.
2. **`L-042` (valuation limitation) remains OPEN and unrelated.** No valuation was produced, attempted or
   implied: no intrinsic value and no margin of safety was computed for any issuer, and every non-applicable
   method carries its reason at both layers (evidence §8.2).
3. **Three issuers in three sectors is not investment-universe coverage.** Ten of the thirteen canonical
   sectors are `UNMEASURED` and are reported as outstanding, never as passed.
4. **Annual-only evidence is not quarterly or complete financial coverage.** `quarterlyPeriods 0`, `prices 0`,
   `operatingMetricRecords 0`, `corporateActions 0` — each disclosed on the served surface (evidence §9).
5. **No Windows-host execution is claimed anywhere in this record.** Every measurement was performed in this
   sandbox. The host facts remain those recorded at Stage 2 and Stage 3, and R-1/R-2 remain open because a
   sandbox measurement is not a host artefact.
6. **A sandbox-verified fact is still a verified fact about the code.** The served-route results were produced
   through the real composition root over real HTTP with `dataRoot` as an explicit option, and are pinned by a
   committed test — so they are reproducible by anyone, on any host, without this sandbox.
7. **The assessment-layer computation was read-only.** No assessment artefact was minted, persisted or
   published; D2's store was not created and D5's binding was neither asserted nor required.
8. **Volatile values are bound to their instant.** Every count, digest, percentage and PR field is stated as of
   2026-11-14 at head `316da977…`.

---

## 9. Boundary confirmations

1. **No prior record was modified.** `git diff --quiet HEAD -- docs/integration` is clean for every tracked
   file; this record and its companion are additions.
2. **No evidence bundle was modified.** `evidence/real-issuer/**` is untouched.
3. **One pre-existing test side effect was detected and reverted.** The frontend suite rewrites
   `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/zero-socket-{control,test}.json` (fresh `generatedAt`,
   `pid`, ports). It was caught by `git status --porcelain` after the run and reverted with
   `git checkout -- evidence/`; it recurred on the re-run and was reverted again. The committed tree contains
   **no evidence modification**. This is a property of that pre-existing suite, not of this change
   (evidence §11.4).
4. **No SQLite database was created, opened for write, or named as a chosen technology.** IID-0 forbids even
   naming a persistence technology, and its 6 constraints still pass.
5. **The Stage 3 published dataset was not reinstalled and the identity publication was not repeated** against
   any host artefact. The publication measured here went into a fresh sandbox root.
6. **No resolver rule was widened and no source observation was fabricated** to force a 200.
7. **Existing repository ownership and boundaries are preserved.** The change is confined to the two files of
   the existing coverage module plus their tests; no new module, layer or architecture was introduced.
8. **Every scratch harness was deleted and its absence verified** (`find . -name "__*.ts"` returns nothing).
   The end-to-end proof it produced was replaced by a committed test rather than left as an unrepeatable
   observation (evidence §11.3).

---

## 10. Validation performed for this change, and its platform

All gates were run, not sampled. Exact counts and the commands that produced them are in evidence §11; the
headline numbers:

| Gate | Result |
|---|---|
| Platform IID suite (`npm run test:iid`) | **1142 tests / 252 suites / 0 fail** (baseline 1061 / 233; 1103 / 241 before the S4-R1 matrix suite) |
| Platform full suite (`npm test`) | **678 / 678 / 0 fail** |
| Platform typecheck | **exit 0** |
| IID-0 constraints | **6 / 6 / 0 fail** |
| **NEW** `iidStage4ScenarioMatrix.test.ts` — the §23 matrix | **39 tests / 11 suites / 0 fail** |
| **NEW** `sectorVocabularyReadPath.test.ts` | **42 tests / 8 suites / 0 fail** |
| **NEW** `iidStage4ServedCoverageRoute.test.ts` | **11 tests / 0 fail** |
| Frontend typecheck (`npx tsc --noEmit`) | **exit 0** |
| Frontend full suite (`npx vitest run`) | **2847 passed \| 1 skipped (2848), 199 files passed \| 1 skipped (200)** — +11 / +1 over baseline |
| PowerShell conformance, four governed `IID-STAGE*` scripts | **PASS — 0 rule failures across 4 files** |
| Document-evidence validator | **PASS (0 failures), 234 assertions** |

**Platform:** Linux sandbox, Node 22.22.3. No PowerShell engine is obtainable here, so the PowerShell result
is **structural conformance**, not a host execution — the distinction Stage 2's record already draws, and it is
not weakened here.

**One validator repair was required and is disclosed.** The document-evidence validator pins evidence to exact
source lines; adding the new field and its documentation block shifted four pins and the validator correctly
**failed**. The four pins were updated to the newly measured lines and each was re-read from the file to
confirm it still holds what the pin claims; no assertion was weakened or deleted to obtain a pass
(evidence §11.2).

---

## 11. Next IID roadmap step — exact, from the authoritative sequence, and **not started here**

| Baseline stage | Objective | Independence, as the baseline states it | Position after this record |
|---|---|---|---|
| Stage 1 — runtime and source discovery | deterministic per-host truth about what the runtime needs, who owns it, what is missing | independent; no prerequisite | Prior work |
| Stage 2 — identity readiness | an installed, validated identity reference set for the intended population | independent of Stage 3 and of IPD; **gated on owner decision O1** | Objective MET and host-verified; **O1 outstanding (S2-R1)** — unchanged |
| Stage 3 — investment dataset readiness | ≥1 real, digest-verified dataset installed, plus the ingestion habit | independent of Stage 2 and of IPD; gated on **O3** | **READY**; R-1/R-2 captures open — unchanged |
| **Stage 4 — coverage readiness** | coverage, completeness, method usability and sector measurement verified on **installed** data; the §23 ten-scenario demo passing | **needs Stages 2–3**; independent of IPD | **This record. PARTIALLY COMPLETE** — measurement limb MET, G-7 closed, G-14 substantially closed; demo limb **SUBSTANTIALLY MET** after the **S4-R1** second-pass correction (**8 demonstrated, 2 partially, 0 undemonstrable** — scenarios 5 and 10, residual IPD-owned via D5/D6); G-4 and G-6 open as data acts (**S4-R6**, **S4-R3**) |
| **Stage 5 — end-to-end integration** | holdings → identity → dataset → assessment → disposition as one loop on the host | needs Stages 2–4 **plus IPD binding + IPC peer** | **The next stage.** Blocked on IC-1: B-4 (IPD), B-5 (IPD + setting), B-6 (operator carrier); and it owns B-3, which is why the identity route stays 503 |
| Stage 6 — investment intelligence | routine use: review loop, change detection, dispositions, persisted comparable reports | needs Stage 5 + operator limits policy (**O5**) | Blocked behind Stage 5 |

**The next roadmap step is Stage 5 — end-to-end integration**, per the baseline's own dependency statement
(*"needs Stages 2–4"*). Stage 4's **substance** exists: the measurement is performed on installed data, the
coverage surface serves it, and the read-path defect that could have silently understated it is closed. What
Stage 4 does not yet have is **closure** — and the S4-R1 correction shows closure was never blocked on an owner
decision. It is blocked on **Stage 5 itself**: six of the ten §23 scenarios are demonstrated outright, and the
four that are not each wait on D2, D5, D6, G-10 or G-11 — the minted assessment chain and the IPD binding —
which is precisely Stage 5's *"holdings → identity → dataset → assessment → disposition as one loop"* work.
**The demo limb is therefore not a gate Stage 5 must first clear; it is a preview of what Stage 5 will finish.**

**Two qualifications on starting Stage 5, stated so that neither is discovered mid-stage:**

1. **Stage 5 needs D5 and D6, which are IPD-owned and cannot be substituted.** `CPII-01` records this as *"not
   on this side of the fence — no amount of IRR work substitutes for it."* Stage 4 was explicitly independent of
   IPD; Stage 5 is not, and no repository work closes that.
2. **S4-R1 has now been recorded** (evidence §10, this record §7), so this qualification is discharged — and it
   changed shape in the discharge. It is **not** "Stage 4 needs an owner decision before Stage 5 can start"; it
   is "Stage 4's four partial scenarios are closed *by* Stage 5". Stage 5's "needs Stages 2–4" is still a
   statement about stage closure, and Stage 4 is still **not closed** — its measurement limb is met, its demo
   limb substantially met. Starting Stage 5's *substance* remains defensible on the same reasoning Stage 2 used
   for Stage 4 (§12 of that record); claiming Stage 4 is complete is not.

**Explicitly not the next step:** Stage 6 (needs Stage 5 plus O5); any of D2–D7 (separate dependencies,
separate owners, separate decisions); merging PR #562 (an owner act); adjudicating `L-041`/`L-042` (a register
act); recording O1 (an owner act — S2-R1); **admitting new issuers to make the demo pass — which the S4-R1
correction shows is not needed at all**, since §23 designates a fixture medium for the four scenarios the
admitted population cannot cover, and which the scope ban on unrequested populations independently forbids an
assessor from doing; repeating the identity publication or reinstalling the dataset (both prohibited — both are evidence);
Win32 recovery fault-injection (never authorised).

---

## 12. What this record does **not** say

1. It does **not** say Stage 4 is complete. It says **partially complete** and separates the limbs that are met
   from those that are not (§1). **Correction:** it originally named "one binding reason (S4-R1, the demo
   limb)". After S4-R1 the binding reasons are different and more precise — four §23 scenarios have residual
   limbs owned by **Stage 5** (D2, D5, D6, G-10, G-11), and **G-4**/**G-6** remain open as data acts. The demo
   limb itself is substantially met (§1, evidence §10).
2. It does **not** say the IID programme is complete, or that overall IID readiness is READY. `ready` stays
   `false` because D2–D6 are outstanding (§4), and no Stage 4 result changes that.
3. It does **not** say Stage 2 is closed (S2-R1 is open), and it does **not** re-open Stage 3 (it is READY,
   with R-1/R-2 open).
4. It does **not** claim a PDF-to-transcription verification. The filing PDFs are not committed; the
   zero-fabrication limb verifies transcription → dataset → derivation and says so (§8.1, evidence §7.4).
5. It does **not** treat `OPERATOR_ASSERTED` source rights as independent legal verification, and does not
   adjudicate `L-041` or `L-042`.
6. It does **not** claim any Windows-host execution, and does not present sandbox measurements as host
   artefacts. R-1 and R-2 stay open for exactly that reason.
7. It does **not** present three issuers in three sectors as universe coverage, nor annual-only evidence as
   quarterly, priced or complete financial coverage.
8. It does **not** treat a coverage report's "usable method" as a produced valuation, and records the
   difference between the two layers rather than reconciling them by changing either (S4-R4, S4-R5).
9. It does **not** claim `G3_WITHHELD` was demonstrated on installed data. The four sectors scenario 8 names
   have no admitted issuers and are `UNMEASURED`; the stage was demonstrated on the reference fixture, which
   §23's own labelling rule labels `SYNTHETIC_FIXTURE` (evidence §5, §10).
10. It does **not** mint an owner decision. S4-R5, S4-R6 and S2-R1 are all decisions, and an assessor may not
    record one on the owner's behalf. **Correction:** this item originally listed **S4-R1** among them, and
    S4-R1 has been re-classified from an OWNER population decision to an IRR demonstration act. That is the
    opposite of minting a decision — it *withdraws* a claim that one was needed. The basis is a fact about the
    baseline's own text, not a judgement about the owner's intent: §23's preamble designates scenarios 2, 3, 4
    and 7 as *"(S) = synthetic fixture only"*, so no additional issuer is required for them, and scenario 8
    names its fixture limb outright. Correcting a misreading of a pinned requirement is an assessor's duty;
    choosing a population for the owner would not have been. **No owner decision was recorded, and none is
    claimed** — S4-R5, S4-R6 and S2-R1 were all open and unrecorded *when this assessment was written*; the owner
    has since decided S4-R5 itself (see the addendum at the foot of this document), which this assessment did not
    record and does not claim.
11. It does **not** supersede, correct or reinterpret any protected record, the O3 decision, or any prior
    governance decision. It supersedes **one position** — Stage 4's, which nothing previously assessed — says
    so in the header, and adds to everything else.
12. It does **not** state any volatile value as a standing fact. Every count, digest, percentage and PR field
    is bound to a dated head: the measurement and coverage findings to 2026-11-14 at `316da977…`, and the
    S4-R1 scenario accounting and its gate numbers (evidence §11.2) to the corrected head that follows
    `a771290d…`.

---

*End of readiness record. Published additively; the records it assesses are unchanged, byte for byte.*


---

## 13. Addendum (2026-11-16) — `S2-R1` satisfied; the Stage 4 verdict is unchanged

Appended forward. **§1–§12 above are unchanged, byte for byte.** The register row for `S2-R1` stays exactly
as it was written at its own baseline, including its `OPEN` status statement; this addendum records the
later act rather than editing the row.

| Item | Status after 2026-11-16 |
|---|---|
| **`S2-R1`** — record the owner's O1 decision | **SATISFIED.** `IID-O1-IDENTITY-GOVERNANCE-PA-DECISION-2026-11-16.md`; tracker §16.287 (§16.285 on the IID branch; renumbered at the reconciliation with `main`, 2026-11-17). It is the “O1 decision record” this register named as the exact closing evidence |
| **`S2-R2`** | **OPEN — unchanged.** Optional host transcript detail; still not captured |
| **`R-1`, `R-2`** | **OPEN — unchanged.** No host readiness or served-surface capture was made by the O1 record |
| **`R-3`**, **`R-4`** | **OPEN — unchanged.** `L-041`/`L-042` still await the owner in the ordinary course |
| **`S4-R1`…`S4-R8`** | **Unchanged.** Nothing was re-scored, re-classified or closed |
| Stage 4 verdict | **PARTIALLY COMPLETE** — unchanged. The four Stage-5-owned residual limbs and the `G-4`/`G-6` data acts are untouched |
| Stage 5 | **Not started, not declared.** Its IPD binding/IPC prerequisite is unaffected |
| Overall IID readiness | **NOT READY** |

One point of substance, because §7 attached a consequence to `S2-R1`: the row noted that O1 also settles
whether the admitted population is the intended one, which it called *“visibly load-bearing for the demo
limb (S4-R1)”*. The O1 record answers that — three issuers **is** the intended initial population. That
does not reopen `S4-R1`, whose accounting §7 already recorded as substantiated on labelled fixture data.
It simply removes the population question from behind it.

---

*End of addendum. §1–§12 remain as published on 2026-11-14.*

---

## 14. Addendum (2026-11-17) — `G-10` corrected: each capability now has its own JS-free page

Appended forward. **§1–§13 above are unchanged, byte for byte** — including §7's `G-10` row, which still reads
*"Open, unchanged"* exactly as written on 2026-11-14, and §13's `S2-R1` disposition. This addendum records the
later act and the disposition it supports: **`G-10` is RESOLVED**, and the completion standard was met rather
than waived.

### 14.1 The finding, restated in its own terms

`G-10` recorded one fact: `COVERAGE_ROUTES.html = '/investment/coverage'` served the **identity** capability's
HTML view, and `frontend/server/investment/coverage-transport.ts` fell through to the identity binder for that
path, so a reader with scripts disabled — or one addressing the transport directly — was told *"Investment
identity coverage unavailable"* on the path the SPA uses for **investment** coverage, while
`/api/investment/coverage/investment` answered `200` from the dataset. The register charged it to owner
decision **O9** and characterised it as *"a new surface"*, not a defect repair.

### 14.2 Reproduction, on the delivered surface rather than in source

Both observations are of the **product's own executive transport** (`frontend/server/executive-transport.ts`),
started with `npx tsx server/executive-transport.ts`, with the identity sources **absent** — the precondition
`G-10` names.

| Head | Request | Delivered | Body |
|---|---|---|---|
| `a45c9f7` (pre-fix, detached worktree, port 8788) | `GET /investment/coverage?asOf=2026-11-10` | **`503 text/html; charset=utf-8`** | `<h1>Identity coverage is unavailable</h1>` |
| `a45c9f7` (pre-fix) | `GET /api/investment/coverage/investment?asOf=2026-11-10` | `200 application/json` | investment report |
| this branch (post-fix, port 8787) | `GET /investment/coverage?asOf=2026-11-10` | **`200 text/html; charset=utf-8`** | `<h1>Investment coverage</h1>`, 6,033 bytes, **0** `<script` occurrences |
| this branch (post-fix) | `GET /identity-coverage?asOf=2026-11-10` | `503 text/html; charset=utf-8` | `<h1>Identity coverage is unavailable</h1>` — fail-closed, preserved |
| this branch (post-fix) | `GET /api/investment/coverage/investment` | `200 application/json` | unchanged |
| this branch (post-fix) | `GET /api/investment/coverage` | `503 application/json` — `identity-sources-unavailable` | unchanged |
| this branch (post-fix) | `HEAD /investment/coverage` | `200`, `content-type: text/html; charset=utf-8`, CSP `default-src 'none'; style-src 'unsafe-inline'`, `x-content-type-options: nosniff`, empty body | — |
| this branch (post-fix) | `POST /investment/coverage` / `GET …?asOf=12-11-2026` | `405` / `400` | unchanged contract |

The local data root has no installed dataset, so the post-fix page reports the disclosed `NONE` position
(`No investment dataset is installed: no issuer is covered.`) with the identity absence disclosed beneath it.
That is the honest state of *this* machine; the dataset-populated output is what the Windows captures in
`IID-STAGE4-WINDOWS-VERIFICATION-PROCEDURE-2026-11-16.md` §7.4/§7.5 record.

### 14.3 Root cause, and the correction

| Element | Was | Now |
|---|---|---|
| `COVERAGE_ROUTES.html` (identity, `coverageEndpoint.ts`) | `/investment/coverage` | **`/identity-coverage`** — the SPA's own identity route |
| `INVESTMENT_COVERAGE_ROUTES.html` (investment, `investmentCoverageEndpoint.ts`) | did not exist | **`/investment/coverage`** |
| `/investment/coverage` renderer | identity `renderUnavailableHtml` via the transport fall-through | `iips-platform/src/investment/coverage/investmentCoverageView.ts` — new, script-free, server-rendered |
| Identity HTML contract | shared with the investment path | unchanged content, own path; still `503` fail-closed with `issues[].code` per file |

The investment view is rendered from the **same read model the JSON route publishes** — dataset disclosure,
counts, sector measurement, issuer rows, ingestion issues, the IID-0 financial-coverage disclosure and the
notes — with the same three-state identity disclosure per row (`resolved` / `unresolved` / *not evaluated*).
Every interpolated value is escaped, the page loads nothing (no script, stylesheet, font or image), and a
genuine investment read failure answers `503` in **investment** words naming the dataset. The identity view is
not weakened: it keeps its fail-closed form, its file-level issues and its content, and it is now reachable at
the path the SPA already uses for that capability.

The separation record's §5 sentence — that the server-rendered `/investment/coverage` *"still renders the
identity unavailable page … the same identity report rendered without JavaScript"* — is **superseded by this
act** and is marked so, additively, in
`IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10.md` §7.

### 14.4 Tests that now pin both halves (JS-free and JS-enabled)

| Test | Tests | What it pins |
|---|---|---|
| `iips-platform/tests/investment/investment-coverage-html.test.ts` (**new**) | 8 | route ownership; `200 text/html` from the dataset with identity sources absent; identity absence disclosed, never fatal; a real read failure is investment-worded `503`; no script, no subresource, no inline handler; escaping; `HEAD`; JSON route unchanged |
| `frontend/server/investment/g10JsFreeCoverage.test.ts` (**new**) | 8 | the same over **real HTTP** through the transport seam: JS-free investment path `200`; identity path `503`; the old collision gone; **parity** of every headline figure with the JSON the SPA reads; the investment page performs **zero** identity-source reads; JS-enabled routes unchanged |
| `iips-platform/tests/investment/identity-endpoint.test.ts` | 19 (1 new) | identity HTML path is `/identity-coverage`, not `/investment/coverage`; the identity view's content assertions are unchanged |
| `frontend/server/investment/iidStage2ServedIdentityRoute.test.ts` | 9 | re-pointed to `/identity-coverage`; **assertions unchanged**, only the path |
| `frontend/server/investment/iidInvestmentCoverageTransport.test.ts`, `iidStage4ServedCoverageRoute.test.ts`, `w05CoverageTransportRights.test.ts` | 5 / 11 / 3 | untouched and passing — the JSON contracts and the §23 scenario route did not move |
| `frontend/src/features/investment/iid6Coverage.test.tsx`, `iidCoverageSeparation.test.tsx` | 8 / 14 | untouched and passing — the SPA surfaces are unchanged |

Executed: `iips-platform` `npm run test:iid` → **1,468 pass / 0 fail** (305 suites); `npx tsc --noEmit` → 0
errors. `frontend` affected suites → **58 tests / 7 files, all pass**; `tsc -p tsconfig.investment-server.json`
and `tsc --noEmit` are clean apart from the pre-existing private-dependency errors (`iips-broker-import`,
`iips-np04-governed-persistence`, `iips-production-market-data`, and the `.cache/broker-import` path they
materialise). `frontend/src/app/iid6Routes.test.tsx` cannot load locally for that same reason (its `pretest`
materialises the alias); its assertions read only route constants, which are unchanged.

### 14.5 Consumers corrected with the route

| Consumer | Was | Now |
|---|---|---|
| `iips-platform/scripts/iid1-coverage-report.ts` (IID-1 evidence emitter) | captured HTML from a literal `/investment/coverage` | captures from `COVERAGE_ROUTES.html`; re-run produces the identity view at `200`, no script |
| `frontend/src/features/investment/CompanyAssessmentPage.tsx` | link **labelled** "Identity coverage" pointing at `/investment/coverage` | points at `/identity-coverage` |
| `frontend/src/features/investment/InvestmentLandingPage.tsx` | investment link whose description described identity resolution | investment link described as the investment position, plus a separate identity-coverage entry |
| `frontend/src/app/routes.ts` | identity doc comment claiming the server renders it at `/investment/coverage` | states `/identity-coverage` |
| `frontend/server/executive-transport.ts` | dispatched `/investment/coverage` only | dispatches `/identity-coverage` too |

### 14.6 What authorised the act, and what is *not* claimed

- **Authorisation.** O9 existed because building a JS-free investment surface was judged *"a new surface, not a
  defect repair"*, with the recommendation *"leave as-is and document"*. The instruction under which this work
  was performed directed that the exception be corrected **without making JavaScript mandatory**, with the
  delivered HTML verified rather than asserted. That instruction is the decision O9 named; the recommendation
  to leave the divergence in place is therefore **superseded, not ignored**, and this record says so instead of
  pretending the owner had already decided.
- **`G-10` is `RESOLVED`** on the register's own standard: the defect no longer reproduces on the delivered
  surface, the correction is pinned by committed tests on both halves, the historical evidence is preserved
  (this addendum is appended; no prior record was rewritten), and the identity capability's fail-closed
  contract is intact at its own path.
- **The Stage 4 verdict is unchanged: PARTIALLY COMPLETE.** `S4-R1`'s 8/2 accounting, `S2-R1`'s satisfaction,
  `S2-R2`/`R-1`/`R-2`/`R-3`/`R-4`, and the `G-4`/`G-6` data acts are untouched. `G-10` was never one of the
  demo limb's constraints — §7 charges it to a *non-demonstration* question — so closing it moves no verdict.
- **`L-041`/`L-042` are not reopened**, and no valuation, rights or permission calculation is touched.
- **One adjacent observation, recorded and deliberately not fixed.** `InvestmentCoveragePage.tsx:313` reads
  `sector.issuerCount`, and the client type declares it (`frontend/src/api/investmentCoverageInvestment.ts:56`),
  but the served `SectorMeasurement` (`iips-platform/src/investment/coverage/measure.ts:38-49`) publishes
  `issuersConsidered: string[]` and no `issuerCount`. The client field was declared at separation time
  (`8603138`) and never existed on the server; `issuersConsidered` arrived with `d1134bc` and the SPA was not
  updated to derive from it. The SPA's sector table therefore renders an empty issuer count against a served dataset. The JS-free
  page renders `issuersConsidered.length`, which is the true figure. Fixing the SPA is a JS-enabled-surface
  change outside this act's authority (the instruction was to preserve JS-enabled behaviour); it is recorded
  here so the register owner can number and charge it.

---

## 15. Addendum (2026-11-17) — `G-11`: no served-chain limb was missing; what was and was not verified

Appended forward. **§1–§14 above are unchanged, byte for byte.** This addendum answers one question — *what
served assessment-chain functionality is still outstanding?* — and answers it with evidence rather than with a
code change: **none was outstanding.** It also records exactly what this pass could verify, what it could not,
and why, so that the register's own status is not advanced on inspection.

### 15.1 The finding, and its two limbs

`G-11` (baseline §24, quoted by `CPII-01` §8.3 B-7) recorded that no assessment version had ever been stored and
that `GET /investment/company/:issuerId` *"has never served a real chain and returns 404 everywhere"*.

| Limb | Completed | Evidence | Reopened here? |
|---|---|---|---|
| **Storage** — no assessment version exists anywhere operational | 2026-11-15 | `IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md` §7.1, operator-reported on the Windows store, with CLI read-back in a separate process | **No.** Read only |
| **Served** — the chain has never been served | 2026-11-16 | `IID-S4-R1-SCENARIOS-1-5-9-10-EVIDENCE-2026-11-16.md` §5, scenario 1: minted through the shipped CLI against the admitted dataset, served `200` over the product's own composition root, re-read identically by a second reader, `UNCHANGED` on a repeat mint, `404` for an issuer with no chain | **No.** Re-exercised, not re-scored |

### 15.2 The served path, end to end, and where a gap could have been

Traced in `frontend/server/investment/investment-transport.ts` and its collaborators — and found complete at every
step: route parse (`/company/:issuerId`, `/company/:issuerId/versions/:reportId`, split-then-decode, no second
`versions` marker) → issuer identity parse + scope-token derivation (`co:<issuerId>`) → method gate → **owner
context** (`resolveReportsOwnerContext`, the server-owned carrier seam shared with Reports) → **governed
persistence boundary** (`loadAuthoritativeNp04Persistence`, fail-closed, no substitute store) → chain read filtered
by scope (`findChainArtifacts`: `portfolioId === scopeToken && reportType === HEAD`, refusing to choose between two
heads) → chain validation (`assertChainOfScope`, provenance issuer check, report-key recomputation, scope-drift
rejection) → version read inside the validated chain → response envelope (payload verbatim) → fixed error mapping
(`400` scope, `404` absent chain/version, `405` method, `503` owner-context / persistence / integrity).

The **portfolio** dimension of an assessment chain is the scope token itself (`co:<issuerId>`): a company
assessment is not filed under a portfolio, and the disposition surface that *is* portfolio-keyed
(`hd:<portfolioId>:<securityId>`) is a different capability on different paths. So "correct portfolio association"
here means exactly one thing — **a client-supplied portfolio cannot select the chain**, because the chain is chosen
by the path's issuer and the server-owned owner and by nothing else. That is now asserted (15.3), not assumed.

Where a substitution could still occur, and does not: the store scan is owner-scoped (`queryByOwner(this.ownerPair)`),
so another owner's chain is not merely filtered out of the response — it is never listed; and every chain member is
re-checked against the requested scope on read, so a store edit that moved an artifact between scopes is a
`CHAIN_SCOPE_DRIFT` refusal rather than a plausible answer. Both properties are pinned by
`frontend/server/investment/investment-artifacts.test.ts` (including *"keeps one scope per issuer and does not see
another scope"* and *"treats a different issuer as a different chain, even with identical content"*).

### 15.3 What this pass verified, on the delivered transport

**New suite: `frontend/server/investment/iidG11ServedChainTransport.test.ts` — 23 tests, 23 pass.** It imports the
**executive transport's own server** (`server` from `executive-transport.ts`, `listen()` suppressed under
`NODE_ENV=test` and bound by the test) and issues real HTTP requests at the chain paths, the version path and the
four coverage/identity paths:

| Property asserted | Result |
|---|---|
| `POST`/`PUT`/`PATCH`/`DELETE` → `405` + `Allow: GET, HEAD` + `no-store`, before any owner or store work | pass |
| `OPTIONS` → the transport-wide preflight (`204`, empty), so the chain cannot be reached through it either | pass |
| A symbol, a sector reference, a portfolio id, an empty version segment, a stray segment, a bare company path → `400 investment-scope-invalid`, with no echo of the rejected value, and **no owner resolved / no store opened** | pass |
| No carrier; a changed owner; a changed tenant; an extra key; a non-JSON carrier → `503 owner-context-unavailable` in the fixed refusal shape, with no path, carrier value or owner pair in the body | pass |
| `HEAD` answers the same status as `GET` with an empty body, on both chain paths | pass |
| `?portfolio=`, `?portfolioId=`, `?securityId=`, `?asOf=`, `?reportId=` change **nothing** — byte-identical answer with and without them | pass |
| No coverage/identity response is a chain envelope (`scopeToken`, `versionCount` absent), and no chain response carries a dataset field; the `/changes` path under the same issuer is a different surface | pass |

Executed in this environment: the new suite **23/23**; `iips-platform` `npm run test:iid` **1,468/1,468**;
`npx tsc --noEmit` clean in `iips-platform`; `tsc -p tsconfig.investment-server.json --noEmit` clean in `frontend`
apart from the private-dependency resolution errors named in 15.4.

### 15.4 What this pass could **not** reproduce, and the exact blocker

The `200`/`404` chain and the store-level isolation properties are asserted by suites that import
`iips-np04-governed-persistence/persistence` — the second-specifier pin
`github:ramkivs/iips-production-market-data#2e11fa3b…` (R3-Option B). In this environment that repository is
**unreachable**:

```
git ls-remote https://github.com/ramkivs/iips-production-market-data.git
  remote: Write access to repository not granted.
  fatal: ... The requested URL returned error: 403
```

Consequences, stated exactly rather than worked around:

- `investment-transport.test.ts`, `investment-artifacts.test.ts` and `iidStage4S4R1Scenarios.test.ts` cannot be
  **loaded** here (unresolved module), so the served `200`, the `404` for an absent chain and the service-level
  isolation cases were **not** re-executed at this head.
- On the live transport the chain paths answer only their fail-closed limbs — `503 investment-persistence-unavailable`
  with a valid carrier and no boundary, `503 owner-context-unavailable` with a tampered carrier, `400`/`405` as above
  — which is what a correct refusal looks like, not a served chain.
- `ci.yml` runs on `pull_request` and on `push` to `main` only, so a branch commit alone produces **no run** to cite.

### 15.5 Status, and why it does not move

**`G-11` stays exactly as the register has it: closed in-tree at `S4-R1`'s head, with the host/browser limbs
(`R-1`, `R-2`, D10) owned by the operator and unchanged by this pass.** It is **not** re-promoted here, because the
repository's completion standard is evidence *at the head being claimed*, and the finding's substance — a chain
served `200` — cannot be reproduced at this head from this environment (15.4). The in-tree closure is neither
weakened nor re-scored; nothing in §7's `S4-R1` row was edited.

This is a "no code limb was missing" outcome, not a repair: the investigation found the chain complete, added the
served-layer regression coverage that was genuinely absent, and recorded the two properties it declined to change:

1. **`respondOwnerContextUnavailable` sets no `Cache-Control: no-store`.** It is the only refusal in the served
   chain surface without it; every neighbouring refusal sets it. The helper is shared by the Reports, broker-import,
   disposition and investment surfaces (ten call sites), so a change is a cross-surface response-contract edit, not a
   `G-11` repair. **Recorded, not changed.**
2. **The shared boundary opens the store with `createDirectory: true, migrate: true`** (`persistence-port.ts:321-325`).
   That is what lets the shipped mint CLI initialise a store, and it means a misconfigured *read* path can create an
   empty database and answer `404` rather than a diagnosable failure. Splitting a read-only opener from the write
   opener would change the persistence boundary that `S4-R1`'s mint proof depends on — expressly outside this act's
   authority. **Recorded, not changed.**

### 15.6 Resolution (same day) — the CI run that 15.4 said was missing, and `G-11` **RESOLVED**

§15.4 recorded one reason not to advance the status: no run existed at this head, because `ci.yml` triggers only on
a pull request or a push to `main`. That reason is now discharged by evidence, not by argument. A **draft** pull
request (#584) was opened from this branch for the express purpose of obtaining the run — **not** as a merge
request, and nothing was merged or pushed to `main` — and CI executed the dependency-complete suite at the exact
code head:

| Field | Value |
|---|---|
| Workflow | `CI` (`ci.yml`), run **`44128048813`** |
| Head | **`329336118a03be9cf30d9a9edac4f4f2f9e7f45c`** |
| Result | **`completed` / `success`**, job *Typecheck · Test · Build* — every step `success` |
| Steps that matter here | *Install dependencies from the committed lockfile* → *Verify all private dependencies resolve to their committed pins* → *Typecheck* → *Strict governed Screen replay server import closure* → **Run the full Vitest suite** → *Assert a non-zero, fully passing test run* → *Production build* |

`npm run test:ci` (`vitest run`) is the suite in which the store-dependent chain proofs execute, with the three
private pins installed and their commits verified: `investment-transport.test.ts` (16 tests — ordering, `400`/`405`/
`404`/`503`, the served chain and each stored version), `investment-artifacts.test.ts` (including *"keeps one scope
per issuer and does not see another scope"*, *"treats a different issuer as a different chain, even with identical
content"*, and the scope-drift refusals), `iidStage4S4R1Scenarios.test.ts` (22 tests — scenario 1: minted through the
shipped CLI, served `200`, second independent reader, `UNCHANGED` on repeat, `404` when absent) and the new
`iidG11ServedChainTransport.test.ts` (23 tests). The zero-test guard excludes the false-green class, and the
production build succeeded.

**Disposition: `G-11` is `RESOLVED`.** The finding was that no chain had ever been stored or served; at head
`3293361` both limbs are evidenced — storage on the Windows store (2026-11-15, operator-reported, §15.1) and HTTP
service to a real stored chain, reproduced `200`/`404` at this head by CI run `44128048813`. §15.5's
"does not move" is superseded by this paragraph and is left as written because it was true when written, hours
earlier, before the run existed.

What `RESOLVED` does **not** mean, stated so the entry cannot be read as more than it is:

- **No browser or host journey was performed.** D10 (real-issuer browser acceptance) and `R-1`/`R-2` (host readiness
  and served-surface captures) remain the operator's, unchanged and untouched by this pass.
- **No Windows observation is claimed.** The storage limb is operator-reported evidence from 2026-11-15; this pass
  read it and did not re-execute it.
- **§7's `S4-R1` row, §13, and every prior addendum are unchanged.** Nothing was re-scored; `G-11` was never a
  constraint on the Stage 4 verdict (§7 charges it to a non-demonstration question), so closing it moves no verdict.
- **The two recorded properties in 15.5 are still unchanged** — the owner-context refusal's missing
  `Cache-Control: no-store`, and the shared boundary's `createDirectory: true, migrate: true` opener. Both remain
  register-owner questions, deliberately not answered by a `G-11` act.

The draft pull request that produced the run carries the code head `3293361`; this paragraph is documentation only,
and `ci.yml`'s path filter (`frontend/**`, `.ci/**`) therefore does not re-run it — by design, not by omission.

## 16. `G-11` hardening — the owner-context refusal and the read-path open (2026-11-17)

§15.5 recorded two properties and deliberately did not change them: `respondOwnerContextUnavailable` set no
`Cache-Control`, and the shared persistence boundary opened every store with `createDirectory: true, migrate: true`.
This section closes both. It does not reopen `G-11`: §15.6's `RESOLVED` disposition, its evidence and its non-claims
stand exactly as written, and nothing was pushed to `main`.

### 16.1 Root cause 1 — an owner-context failure could be cached

`owner-context-unavailable.ts` responded `503` with `Content-Type: application/json` and **no** caching directive. An
owner context that is absent, invalid, tampered or carries a foreign owner is a *transient* condition — it changes
when the server-owned carrier is provisioned or corrected — yet the refusal was cacheable, so a browser or an
intermediary could replay it after the condition was fixed, or pin it as this deployment's standing answer on a
surface whose only failure mode is that refusal.

**Call-site census (production code, before the change): 19 calls in 9 modules, reaching 6 served surfaces.**
`broker-import/brokerImportHttp.ts` ×10 (commit, legacy commit, revision read, evidence admission ×2, the three
Class-P/config-error mappings, the two precondition refusals); `broker-import/brokerImportEvidenceSubmission.ts` ×2;
`collaboration/collaboration-transport.ts` ×1; `reports-transport.ts` ×1; `settings/settings-transport.ts` ×1;
`watchlists/watchlists-transport.ts` ×1; `investment/investment-transport.ts` ×1;
`investment/disposition-transport.ts` ×1; `investment/change-transport.ts` ×1. (`holding-identity-transport.ts`
defines its own `owner-context-unavailable` body but already set `no-store` on every response, so it needed no
change; it is untouched.)

**Why the obvious fix was not available.** AMEND-01 §8.5(21) pins `owner-context-unavailable.ts` to git blob
`cb8db45d668d28cee7e0a52721001d579a872733` (`brokerImportEvidenceRoute.test.ts:917–920`). Editing the responder
fails a fence by design, so the header is enforced one layer out rather than by re-pinning a frozen artefact.

**Correction.** `owner-scoped-http.ts` — the shared helper module for the owner-scoped transports — gained
`respondOwnerContextUnavailableUncached(res)`: it sets `Cache-Control: no-store` (only when the head is not already
flushed), then delegates to the frozen responder. Status, body, content type and the non-disclosure properties are
the frozen ones; the caching policy is additive and exists in exactly one place. All 19 call sites now call the
wrapper, and a source fence fails the build's test run if any production module calls the frozen responder directly.

**Evidence (executable).** `server/owner-context-uncached.test.ts`, 11 tests: the frozen responder alone reproduces
the defect (`503`, `application/json`, `cache-control` absent — the control); the wrapper yields `503` with
`cache-control: no-store`, the same content type and a byte-identical body, and the body still deep-equals the frozen
`OWNER_CONTEXT_UNAVAILABLE` constant; a flushed head does not throw; and each of the six served surfaces
(broker-import, watchlists, settings, reports, collaboration, investment) is driven through its **real HTTP handler**
and asserted `503` + `owner-context-unavailable` + `no-store`. The two source fences (only the wrapper calls the
frozen responder; the frozen file still contains no `Cache-Control`) are part of the same suite. `brokerImportHttp.test.ts`
additionally asserts the header at all five existing owner-context assertions (direct handler and the real composed
host), and `iidG11ServedChainTransport.test.ts` — whose note previously read *"recorded, not asserted"* — now asserts
`no-store` on the missing/tampered/foreign-carrier refusals and on the no-carrier refusal.

**Preserved.** Status codes, bodies, content types, the operator-diagnosis log lines, the Class-P/config-error
indistinguishability and the `HEAD` path are unchanged; no information was added to any refusal, and no authority,
owner or carrier detail is disclosed by a header that only says "do not store".

### 16.2 Root cause 2 — a read could provision the store

`reports/persistence-port.ts` opened the database the one way that writes: `{ createDirectory: true, migrate: true }`,
for every caller. A `GET`, a CLI read-back or a readiness-style probe could therefore create the database directory,
create the database file and run schema migrations simply by asking a question. §15.5 recorded it; the NP-04
preparation record already noted the consequence (`show-investment-chain` "is read-only with respect to artifact rows,
not a non-mutating database probe").

**Caller census and the intent each one now states** (the API makes intent mandatory and defaults it to `READ`, so an
omitted intent can never acquire write powers):

| Caller | Kind | Intent |
|---|---|---|
| `investment/cli/generate-investment-artifacts.ts` (default and `--dbPath` paths) | mint CLI — writes artifacts | `INITIALISE` (unchanged behaviour) |
| `reports/persist-real-reports.ts` | script — writes real reports | `INITIALISE` |
| `reports-transport.ts` `POST` (artifact create/append) | served write | `INITIALISE` (unchanged behaviour) |
| `reports-transport.ts` `GET`/`HEAD` | served read | `READ` |
| `investment/investment-transport.ts`, `disposition-transport.ts`, `change-transport.ts`, `discovery-transport.ts` | served assessment/chain reads | `READ` |
| `investment/cli/show-investment-chain.ts` (×2), `cli/read-investment-payload.ts` | read CLIs | `READ` |
| `reports/np04-adapter.ts` (`resolveAuthoritativeNp04Port`) | composition point | caller states it; default `READ` |

**Correction.** `persistence-port.ts` gained `Np04OpenIntent` (`'READ' | 'INITIALISE'`), `np04OpenOptions(intent)`
(READ → `{createDirectory:false, migrate:false}`, INITIALISE → `{createDirectory:true, migrate:true}`), a
`loadReadOnlyNp04Persistence()` alias, and an optional module-resolution seam (`Np04LoaderOverrides`) used only by
tests. `loadAuthoritativeNp04Persistence(intent = 'READ')` now (1) fails closed — `null` → `503` on every transport —
when a `READ` is pointed at a path that is not an existing regular file, **before** the module is imported or any
handle is taken, and (2) passes the intent-derived options to NP-04's own `openDatabase`. This is
operation-specific configuration, not a global disable: the mint CLI and the reports write path keep their
create-and-migrate capability verbatim, and the two-flag read shape is the one `m1-demonstration.ts` already used for
its read-only inspection.

**Evidence (executable).** `server/reports/persistence-port.test.ts`, 11 tests: the intent mapping (including that
both option objects are frozen); `READ` on an absent path fails closed **without importing the module** and creates no
directory; the default call behaves as `READ`; a directory path is refused; `READ` on an existing store passes exactly
`{path, createDirectory:false, migrate:false}` and leaves the file's bytes, size and mtime unchanged; `INITIALISE`
passes exactly `{path, createDirectory:true, migrate:true}`, accepts the store the open created, and closes a
half-constructed handle when store construction fails; plus a source fence that no production module calls the loader
without stating an intent. Because the loader takes the test seam, these assertions run **without** the private
package — which matters, since this environment cannot resolve it.

**Preserved.** Mint CLI initialisation: `generate-investment-artifacts` keeps its owner-before-port ordering (a run
about to abort still cannot create a store) and both of its resolution paths state `INITIALISE`; its suite's
read-back now states `READ` against a store the CLI created, which is a real read-only re-open. Reports create/append
(`POST`) still provisions on first use, so the reports surface's documented write contract and its acceptance tests
are unchanged.

**Deliberate behaviour change.** A `GET`/`HEAD` on a reports path when the configured store does not yet exist now
answers `503 persistence-unavailable` instead of silently creating the database. Provisioning is an operator act
(mint CLI) or a write act (`POST`), never a read side effect.

### 16.3 What this section does not claim

- **No claim about NP-04's internals.** These tests prove which options *this repository* passes and that it never
  reaches the module on a read that has no store. They do not assert that NP-04's own `openDatabase` ignores the
  flags; that is NP-04's contract, and the dependency-complete run exercises the real package.
- **Local execution is dependency-incomplete.** The three private pins cannot be resolved in this environment
  (`Write access to repository not granted`, HTTP 403), so store-dependent suites cannot load here, and the local
  `tsc --noEmit` reports the same 24 pre-existing module-resolution errors before and after this change. The
  authoritative execution is the CI run recorded in §16.4, not a local one.
- **No browser or host journey was performed**, and no Windows observation is claimed. `D10`, `R-1`/`R-2` are
  untouched.
- **No re-scoring.** §§7, 13 and 15 are unchanged; `G-11` stays `RESOLVED`.

**Historical statements this section makes operation-dependent.** `docs/OPERATOR_RUNBOOK.md` (the two
create-and-migrate notes) and `docs/integration/IID-NP04-PERSISTENCE-PREPARATION-2026-11-15.md` (lines 41 and 51)
describe the pre-change opener; both carry an appended note pointing here. `docs/integration/CPII-01-…-2026-11-13.md`
and `docs/integration/IID-P6A-…-2026-11-09.md` are dated records and are left as written; where they describe the
opener, this section supersedes them.

### 16.4 Execution evidence, commit and remote verification

**Local (dependency-incomplete).** With only the dev toolchain present: `vitest run` over the affected suites —
17 files, **253 tests, all passing** (the two new suites: 11 + 11; broker-import `brokerImportHttp.test.ts` 27;
served chain `iidG11ServedChainTransport.test.ts` 23; watchlists/settings/collaboration transports and owner-context
suites; `fenceUnchanged.test.ts` 13). A whole-`server/` run before and after the change differs only in that the two
new suites go from failing-to-load to passing and in shifted line numbers; the same three pre-existing
`reports-transport.test.ts` failures appear on both sides (they need the private package). `tsc --noEmit` on
`frontend/tsconfig.json` reports the **same 24 pre-existing module-resolution errors before and after** — no error is
introduced by this change. This environment cannot resolve the three private pins (HTTP 403), so no store-dependent
suite could execute here; that is why the run below, not a local one, is the authority.

| Field | Value |
|---|---|
| Workflow | `CI` (`ci.yml`), run **`44137325510`** |
| Code head | **`6a1f3217d7a37d4b4a14fc758787c04a5e35bd01`** |
| Result | **`completed` / `success`**, job *Typecheck · Test · Build* — all 17 steps `success` |
| Steps that matter here | *Verify the scoped token can read the private IPD repository* → *Install dependencies from the committed lockfile* → *Verify all private dependencies resolve to their committed pins* → *Typecheck* → *Strict governed Screen replay server import closure* → **Run the full Vitest suite** → *Assert a non-zero, fully passing test run* → *Production build* |

This is the dependency-complete execution in which `reports-transport.test.ts` (the surface whose `POST` keeps the
provisioning intent and whose `GET`/`HEAD` no longer does), `reports-api.test.ts`, `reports-restart.test.ts` (three
distinct OS processes), `investment-transport.test.ts`, `investment-artifacts.test.ts`,
`iidStage4S4R1Scenarios.test.ts`, `brokerImportEvidenceRoute.test.ts` (the §8.5(21) blob pin) and
`reports-persistence-integration.test.ts` all ran against the real pinned package. Their passing is what turns the
`INITIALISE`/`READ` split from an assertion into evidence, and it also re-establishes that the frozen responder is
still frozen: at the code head, `git rev-parse HEAD:frontend/server/owner-context-unavailable.ts` is
**`cb8db45d668d28cee7e0a52721001d579a872733`** — the pinned value, unchanged.

**Published state (verified against the remote, not from the local tree).**

| Field | Value |
|---|---|
| Branch | `arena/e760fb87-iips-review-recovered` |
| Head before this doc-only addendum | **`6a1f3217d7a37d4b4a14fc758787c04a5e35bd01`** (`6a1f321`) |
| Tree at that head | **`ea12432f71ec17aab25fa2b3f32c3ae50365e63b`** — identical to `origin`'s tree for the branch |
| `origin/main` | **`a45c9f7d7c961b42911903300f8599c824e855f8`** — unchanged, nothing merged |
| New test blobs | `owner-context-uncached.test.ts` `8e41d53d…`; `reports/persistence-port.test.ts` `71066f6a…` |
| Changed blobs | `owner-scoped-http.ts` `fc4e9aef…`; `reports/persistence-port.ts` `a2687e73…` |

The push was `59454f0..6a1f321`; `git fetch` then `git rev-parse` showed local and remote heads and trees equal.
Pull request **#584** remains a **draft**, opened only to obtain `pull_request` CI runs, and is neither merged nor
closed; `main` was not touched. Because `ci.yml` filters on `frontend/**` and `.ci/**`, this documentation-only
addendum does not re-run the workflow — by design, not by omission; the code head it describes is `6a1f321`.

## 17. Investment Coverage SPA — the sector issuer count (2026-11-17)

Recorded during `G-10` (§14, unchanged by this section): the Investment Coverage page read a field the server does
not send, so the "Issuers" column of its Sector measurement table could render nothing. This section is the separate
evidence entry for that defect. It does not reopen `G-10` (§14 stands as written) or `G-11` (§15, §16 stand as
written), and it changes no server measurement logic, no `SectorMeasurement` field, no dataset classification, no
valuation, no identity and no persistence.

### 17.1 The finding, confirmed against the actual served JSON

The page read `sector.issuerCount`; the server's `SectorMeasurement`
(`iips-platform/src/investment/coverage/measure.ts`) has no such field. Confirmed by executing the composition, not
by reading it: a dataset was built from `referenceContent()` (the IID fixtures), the report was composed with
`buildInvestmentCoverageReport`, and served through the real handler
`handleInvestmentCoverageRequest({ method: 'GET', url: '/api/investment/coverage/investment?asOf=…' })`. The served
body (HTTP `200`, `application/json; charset=utf-8`) reported:

- `sectors` — **13** rows, one per canonical sector;
- the keys of a sector row — `sector, issuersConsidered, annualPeriodsConsidered, statementCoveragePct,
  operatingMetricCoveragePct, stage, measured, usableMethods, withheldMethods, methods`;
- `issuerCount` present on a sector row — **`false`**;
- membership as served — `Banking[1] Hospitality[1] Technology[2]`, and an empty sector (`Auto`) with
  `issuersConsidered: []`.

So the recorded finding was exact, not approximate: the field the page read is absent, and the authoritative count
source is the length of the membership list. Two details are worth recording because they make the wrong fix easy:
the count is *membership*, not a measurement total (an empty sector reports `0`, not "unmeasured" as a number), and
the payload also nests a **numeric** `issuersConsidered` inside `methods[]` — a different field at a different depth.

### 17.2 Root cause

The SPA's declared contract, not the server, was wrong. `frontend/src/api/investmentCoverageInvestment.ts` declared
`InvestmentCoverageSectorRow { sector; stage; issuerCount: number }`, and the page rendered that field. Because the
type was declared rather than imported, nothing compared it with the served JSON; and because the page's own fixture
(`iidInvestmentCoverageFixtures.ts`) was authored to the same wrong type, the tests agreed with the page and never
with the server. `undefined` renders as an empty cell in React, which is why the defect was silent: the table
appeared, the rows were there, one column was blank.

The server's own HTML view of the same report already derived the count correctly
(`investmentCoverageView.ts`: `<td>${sector.issuersConsidered.length}</td>`), so the JS-free and JS-enabled surfaces
of one capability disagreed with each other — the same class of divergence `G-10` was.

### 17.3 Correction

- **`frontend/src/api/investmentCoverageInvestment.ts`** — `InvestmentCoverageSectorRow` now describes the served
  row as a documented projection of `SectorMeasurement`: `sector`, `stage`, `measured`, `issuersConsidered`
  (the membership list), `annualPeriodsConsidered`, `statementCoveragePct`, `operatingMetricCoveragePct`. The
  phantom `issuerCount` is gone, and the interface states that the count is `issuersConsidered.length`.
- **The same module's payload validation** now requires every sector row to carry a string `sector`, a string
  `stage` and a `issuersConsidered` list of strings. A row that cannot be counted is refused with a named error
  (`investment coverage sector rows do not carry issuersConsidered`) instead of rendering an empty cell — the
  defect's own shape (a scalar `issuerCount`) and a numeric `issuersConsidered` are both refused.
- **`frontend/src/features/investment/InvestmentCoveragePage.tsx`** — the "Issuers" cell renders
  `sector.issuersConsidered.length`. Nothing else on the page changed: the sector name, the stage, the counts table,
  the measured/total line, the issuer table and every identity disclosure are untouched.
- **`frontend/src/features/investment/iidInvestmentCoverageFixtures.ts`** — the fixture's sector rows were not in the
  server's shape (they carried `issuerCount`); they now carry `issuersConsidered` and the rest of the served row, so
  the fixture can no longer make a wrong page look right.

No server file was modified: the contract was not defective, the consumer was.

### 17.4 Tests

New suite `frontend/src/features/investment/investmentCoverageSectorCount.test.tsx` — **8 tests**:

1. a single-issuer sector renders `1` and a two-issuer sector renders `2`, each on **its own** row (a one-row test
   would pass a per-row mapping defect), and the cell is not empty;
2. a three-issuer sector renders `3` — and does so from the sector's membership list, not from the numeric
   `methods[].issuersConsidered` the same payload carries;
3. a sector that considered no issuer renders `0`, not a blank cell (and its stage stays `UNMEASURED`);
4. the exact served row shape — every key the endpoint sends, including `usableMethods`, `withheldMethods` and
   `methods` — is accepted and counted;
5. the other displayed values are preserved: sector name, stage, and the measured/total line;
6. the recorded defect shape (a scalar `issuerCount` row) is refused with the named error and no sector table is
   rendered;
7. a numeric `issuersConsidered` is refused;
8. a membership list with a non-string entry is refused.

**Red → green, demonstrated.** Against the pre-correction page the four count assertions fail with
`expected '' to be '2'` / `'3'` / `'0'` — the empty cell, exactly as recorded; with the correction all 8 pass. The
pre-existing separation suite (`iidCoverageSeparation.test.tsx`, 14 tests) also passes against the corrected fixture.

**Runs.** Targeted: 22 tests across the two suites, all passing. Whole `frontend` vitest run: **2353 passed, 12
failed, 1 skipped (2366)**, 57 files failing to load — and a before/after run of the same command differs by exactly
one line, the new suite going from absent to passing: every failure is pre-existing and caused by the three private
pins being unresolvable in this environment (HTTP 403). `tsc --noEmit` on `frontend/tsconfig.json` reports the same
24 pre-existing module-resolution errors as the baseline and **none** in any file this section touches.

### 17.5 What this section does not claim

- **No server behaviour changed**, and no claim is made that the measurement semantics changed: `issuersConsidered`
  was already the membership list, and `0` still means "this sector considered no issuer", not "unmeasured".
- **`issuerCount` was not removed from the codebase.** It remains a legitimate field elsewhere — the identity
  coverage report's `identitySources.issuerCount`, the company directory and the roster linter — and none of those
  was touched. What was removed is its use for a report that never sends it.
- **No browser journey is claimed.** The evidence is the rendered component under jsdom plus the served JSON from the
  real handler; `D10`/`R-1`/`R-2` remain the operator's.
- **No Windows observation, no re-scoring.** §§7, 13, 14, 15 and 16 are unchanged.

### 17.6 Commit, remote verification and execution evidence

| Field | Value |
|---|---|
| Commit | **`b4950b2ef8accc5ace9e15644138aeed056dc77a`** |
| Branch | `arena/e760fb87-iips-review-recovered` (pushed `3aee6aa..b4950b2`) |
| Tree | **`ffb27b68245dcfccbf621f3eb05b5f052c4e40e4`** — identical to the remote branch's tree after `git fetch` |
| `origin/main` | **`a45c9f7d7c961b42911903300f8599c824e855f8`** — unchanged; nothing merged |
| CI | workflow `CI`, run **`44141129756`**, head `b4950b2` — **`completed` / `success`**, all 17 steps, including *Run the full Vitest suite*, *Assert a non-zero, fully passing test run* and *Production build* |
| PR #584 | still a **draft**, head `b4950b2`, neither merged nor closed; it exists only to obtain `pull_request` runs |

**Changed-file set (exactly five, verified on the remote commit):**

| Path | Blob | Change |
|---|---|---|
| `frontend/src/api/investmentCoverageInvestment.ts` | `7fc26957…` | sector row typed to the served contract; phantom `issuerCount` removed; sector-row validation added |
| `frontend/src/features/investment/InvestmentCoveragePage.tsx` | `8db0a2e3…` | the "Issuers" cell renders `issuersConsidered.length`; nothing else changed |
| `frontend/src/features/investment/iidInvestmentCoverageFixtures.ts` | `4292c101…` | fixture sector rows put in the served shape |
| `frontend/src/features/investment/investmentCoverageSectorCount.test.tsx` | `9474a2db…` | new suite, 8 tests |
| `docs/integration/IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` | — | this section |

**No server file was touched by this commit** (`git show --name-only` reports only `frontend/src/**` and this record),
so the `SectorMeasurement` contract, the measurement logic, dataset classification, valuation, identity and
persistence are unchanged by construction, not merely by intention.

The CI run is the dependency-complete execution: with the three private pins installed and verified, the full Vitest
suite (which includes `iidCoverageSeparation.test.tsx` against the corrected fixture) and the production build both
passed at this head.

> **Note on the `origin/main` row above (recorded after the fact, same session).** When this addendum was verified,
> `origin/main` was `a45c9f7d7c961b42911903300f8599c824e855f8`. It has since advanced to
> `71306f276817890d76e7bfba2d349c7c38e17015` through **pull request #585** from an independent branch
> (`arena/b63d36c5-iips-review-recovered`, *"Record AGI manual source provenance"* and its two predecessors) — not
> through this branch. This task pushed only to `arena/e760fb87-iips-review-recovered`, whose head is **not** an
> ancestor of `main`; PR #584 remains a draft and was neither merged nor closed. The correction described in §17.1–17.5
> therefore reaches `main` only when that branch is separately reviewed and merged.

## Addendum (2026-11-17) — `S4-R2` is CLOSED on the assessment path, with one named remainder

Appended forward; **nothing above is changed, byte for byte**, including the `S4-R2` row of the remaining-actions
table. That row's statements were true when they were written — the two borrowing components *were* absent from all
three periods, `NET_DEBT` *was* underivable, and `Technology.EV_EBITDA` *was* withheld `STATEMENT_INPUT_MISSING` — and
they remain true as a statement of the state at that date. This section records what changed afterwards.

**What was done.** The borrowings block was transcribed for the already-admitted issuer Infosys Limited from the
authorised consolidated filings, and ingested as a complete replacement input for that issuer
(`evidence/real-issuer/S4-R2-INFOSYS-BORROWINGS-2026-11-17/`). `REL-1-INFOSYS-2026-11-06` is byte-identical to its
state on `main`; nothing was rewritten.

| Period | `LONG_TERM_BORROWINGS` | `SHORT_TERM_BORROWINGS` | `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | `PREFERENCE_CAPITAL` |
|---|---|---|---|---|
| FY2024 | `NIL_BY_DISCLOSURE` — "The Group has no outstanding borrowings." | same | same | `NIL_BY_DISCLOSURE` — the single-share-class sentence, cross-scope, `acceptedBy` recorded |
| FY2023 | `MISSING / NOT_REPORTED` | same | same | same |
| FY2022 | `MISSING / NOT_REPORTED` | same | same | same |

The FY2024 nil is the filer's own sentence about borrowings as a class, already quoted, hashed and located in
`WI3-BORROWINGS-NIL-2026-11-06/source/`; the FY2023/FY2022 cells are **blank**, because no disclosure for those
balance-sheet dates was transcribed and the FY2024 sentence is not projected backwards onto them. Nothing was
transcribed as a number, and no zero was substituted anywhere.

**The acceptance criterion, measured at this head.**

| | before | after |
|---|---|---|
| dataset version | `sha256:3ad82918…` | `sha256:69bbc14e99cea0e24be568fa923971e7c0536009ab19056f09bf272d437c6fe2` |
| `capitalStructure.netDebt` | `MISSING` | **`PRESENT` = −₹19,342 crore** |
| `Technology.EV_EBITDA` | withheld — `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable` | **applied; mid ₹1,133.95 per share** |
| `valuation.intrinsic` | `null` | 875.34 / **1,088.97** / 1,399.81 |
| `EV_REVENUE` | withheld — `MANDATORY_METRIC_MISSING` | **unchanged** — still withheld, for its own reason |

Both the net-debt figure and the intrinsic range reproduce what `IIPS_V3_IID_WI3_BORROWINGS_NIL_2026-11-06.md`
published on 2026-11-06 from the same filing, through a different dataset assembly. No formula, threshold, weight,
confidence cap, policy constant or policy version changed, and `sectorReferenceView`, dataset classification and
identity are untouched.

**Reusability — the half of the item that is not about this issuer.** The transcription is issuer data; the capability
is the grammar and the aggregation, and it was verified against issuers that do not exist:
`iips-platform/tests/investment/s4r2BorrowingsReuse.test.ts` proves complete data consumed, a missing long-term and a
missing short-term component each staying `NOT_REPORTED`, a missing value never read as zero, an older-period component
refused as `PERIOD_MISMATCH` rather than silently mixed, invalid units and invalid periods refused before publication,
two synthetic issuers using the mechanism with no issuer-specific code (asserted by source inspection of the six
modules involved), and Marico's and KEC's assessment blocks deep-equal before and after the correction.

One generic product change was required and is in scope of "period-aware ingestion and validation":
`FISCAL_YEAR_PERIOD_MISMATCH` in `iips-platform/src/investment/ingestion/builder.ts`. A row whose `fiscal_year`
contradicts its own `period_end` was previously accepted and stored as a period that is two years at once — the exact
slip a hand transcription makes. An annual row must now end inside its labelled year, and a quarterly or TTM row must
be labelled by the year the period-end year or the year after it (KEC's Q1 FY27 ending 2026-06-30 is the real
instance). All 41 committed period rows pass, so no admitted dataset moves.

**Remainder — the coverage row still withholds.** `coverage-report.json` continues to report Technology `G2_PARTIAL`
with `EV_EBITDA WITHHELD / STATEMENT_INPUT_MISSING: [NET_DEBT]`. Coverage asks whether the **line-item derivation set**
can produce `NET_DEBT`, and `derive.ts` accepts `PRESENT` inputs only (a declared nil is not a number); the
**assessment** resolves net debt through the capital-structure aggregation, which admits a declared nil under D-2. The
two answers differ because the two questions differ, and the coverage figure understates the capability rather than
overstating it. Teaching `derive.ts` to treat `NIL_BY_DISCLOSURE` as zero would change derivation semantics that reach
`NET_DEBT`'s consumers — a **measurement-semantics decision**, recorded with `S4-R4`/`S4-R5` rather than taken here.

**Still open, unchanged by this section:** `S4-R3` (staleness — the statements remain 958 days old at the assessment
clock; Infosys still has no newer filing in the repository), `S4-R4`, `S4-R5`, `S4-R6`, `S4-R7`, `S4-R8`; `L-001`
(3 of 13 sectors) and `G-6`. **Host installation of the new dataset version is an operator step and was not
performed** — the candidate is repository-side, exactly as `S4-R3`'s candidate was. The next Stage 4 roadmap item after
this one is **`S4-R3`** (freshness: quarterly periods or newer annual filings), whose Infosys leg remains blocked on
source material that is not in the repository.

## Addendum (2026-11-17) — `S4-R3` executed as a capability: freshness is measured per issuer, and the item stays OPEN

**Scope.** IRR-only, additive. This addendum records that `S4-R3` (the freshness work item) was implemented as a
reusable capability and measured against the admitted population. It revises nothing above; §16's measured coverage
figures are unaffected — no period, no issuer and no dataset class changed. Full record:
`IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md` §12 and
`evidence/real-issuer/S4-R3-FRESHNESS-EVIDENCE-2026-11-17/`.

**What changed in this document's own subject matter.** The investment-coverage read model now carries, on every issuer
row, a `freshness` block computed by `assessment/freshness.ts` at the report's `asOf`: `status`
(`FRESH`/`STALE`/`UNKNOWN`), `reasons`, `valuationBasis` (the period a valuation would consume, its age **and its
filing date**), `latestReported` (the newest period of any type, with its own age), the policy windows and a
`sequenceGapCount`. The row's `latestPeriodEnd` is unchanged in meaning; the age of the **basis** is now published
beside it, so the §17.6 distinction between "how fresh is the newest filing" and "how old is the statement the
valuation uses" is visible in the served read rather than inferred.

**Measured at the newly recorded clock 2026-11-17** (admitted candidate `bdfb2527…`): Infosys basis 2024-03-31,
**961 d**; Marico 2026-03-31, **231 d**; KEC 2026-03-31, **231 d**, with newest reported quarter 2026-09-30, **48 d**.
All three `STALE` with `VALUATION_BASIS_BEYOND_PNL_WINDOW`.

**Not claimed.** That coverage improved: `measuredSectors` is still 3 of 13 and the staleness finding stands. That
`S4-R3` is closed: it is **OPEN**, and `S4-R3-Infosys` is **OPEN** on a source dependency that is not in this
repository. That any host holds the refreshed dataset: the install-and-serve drill ran in an isolated sandbox temp
root. `L-001`, `G-6`, `L-041`, `L-042` are unchanged; Stage 4 remains **PARTIALLY COMPLETE** and overall IID
readiness **NOT READY**. Next Stage 4 roadmap item: **`S4-R4`** (documentation), then **`S4-R5`**.

## Addendum (2026-11-17) — `S4-R4` is CLOSED: the source-level note is committed

**Scope.** IRR-only, additive. **The `S4-R4` row above is unchanged, byte for byte**, as are the `S4-R1`, `S4-R2` and
`S4-R3` rows and their addenda: this section records what was committed afterwards. No coverage algorithm, derivation,
assessment, valuation, freshness or confidence rule changed, no issuer was admitted, no dataset was built for
admission and no host was touched.

**The registered criterion, and its discharge.** `S4-R4` required *"a source-level note in the coverage module stating
the window difference"* and its closure evidence was *"the note committed"*. Both are now true:

| Where | What it says |
|---|---|
| `iips-platform/src/investment/coverage/measure.ts` — module header | the module separates **three** questions, the third being *whether a valuation would be produced*, **which it does not answer** |
| `iips-platform/src/investment/coverage/measure.ts` — contract note after the last declaration | the window difference in full: this module is **existential** (one annual period with all declared inputs is enough); the assessment resolves **one series, one issuer, one clock** with a same-instant invariant, per-method history requirements, a bridge that can refuse, and an INV-5 blend. Plus six consequences, a-f |
| `iips-platform/src/investment/coverage/investmentCoverage.ts` — note | what the served coverage fields do and do not say, and that `derivationItems`/`xbrlMappedTags` are code-vocabulary sizes rather than dataset facts |
| `iips-platform/src/investment/identity/coverage.ts` — comment | the `usableMethods` counter is a dataset statement, never a valuation statement |
| `docs/integration/IID-COVERAGE-USABLE-VERSUS-VALUATION-2026-11-17.md` | the long-form, issuer-neutral contract: the divergence catalogue, the measured examples, the reason vocabularies, the general rules, and what a reader should infer when the two layers differ |

**Why a comment-only change is not an implementation change, and how that was checked.** The three files are
identical to their committed predecessors once comments are stripped (266 / 437 / 270 code lines before and after);
and the coverage report, the rendered coverage summary and **all six** assessment payloads hash identically before and
after, over both datasets. Both checks reproduce; the digests are in
`evidence/real-issuer/S4-R4-COVERAGE-VERSUS-VALUATION-2026-11-17/`.

**The complete scope of the distinction, established rather than assumed.** The prior record named one example (the
`NET_DEBT` derivation versus the capital-structure aggregation). Investigation found **six** rule differences, two of
which are live in the current population and four of which are not:

| # | Class | Live instance |
|---|---|---|
| D1 | existential window vs latest instant | **live** — Consumer `EV_EBITDA` available on FY2023 while the assessment refuses on FY2024 |
| D2 | numeric derivation vs declared-nil aggregation | **live** — Technology withholds `EV_EBITDA` while the assessment applies it on a −₹19,342 cr net debt |
| D3 | three-input derivation vs six-component aggregation with leases and one instant | **live** — two issuers whose derivation triple is complete and whose cash side is not |
| D4 | operating metric at any period vs latest period plus source-class floor | not live (`operatingMetricRecords` 0, `G-4`/`S4-R6`) |
| D5 | method `applicable` vs a produced per-share figure | **live** — `DCF_FCFF` applicable, per-share `NOT_COMPUTABLE`, no intrinsic |
| D6 | six matrix method families with no engine-v1 implementation | not live for the three measured sectors |

**Measured, and the sentence the register can now rely on.** On the O3-admitted dataset `sha256:bdfb2527…` at clock
2026-11-17, coverage reports **seven usable method slots** across three measured sectors, Consumer is **`G1_ENABLED`**,
and the assessment produces **no intrinsic range for any issuer**. On the repository dataset of record
`sha256:69bbc14e…`, the *only* intrinsic produced belongs to the issuer whose coverage row **withholds** the method
that contributed to it (Infosys, mid ₹1,088.97, `EV_EBITDA` at weight 0.1, coverage `STATEMENT_INPUT_MISSING
["NET_DEBT"]`).

**One wording imprecision, recorded and deliberately not fixed.** `assessment/engine.ts:327-330` says, when net debt is
absent, *"…so every enterprise-value method is withheld rather than run on a partial bridge."* That is substantively
true and literally imprecise for a method that is `applicable: true` with a `NOT_COMPUTABLE` per-share leg (D5). It is
**not a behaviour defect** — nothing is overstated, zeroed or approximated — and repairing the sentence would be a
production-source change with its own record, which `S4-R4`'s authority does not include. Recorded here so the next
reader does not rediscover it as a defect.

**Nothing decided, as at this addendum's date.** `S4-R5` was **OPEN** when this section was written (whether
availability should remain existential over annual periods) and the document is written so that either answer leaves
its contract true — the owner has **since decided it**: see the `S4-R5` addendum at the foot of this document. The
measurement-semantics question (whether `derive.ts` should admit a declared nil for `NET_DEBT`) remains reserved.
`S4-R2` stays **CLOSED**; `S4-R3` and `S4-R3-Infosys` stay **OPEN**; `L-001` (3 of 13 sectors), `G-6`, `L-041`,
`L-042` are unchanged. Stage 4 remains **PARTIALLY COMPLETE** and overall IID readiness remains **NOT READY**. The
next Stage 4 roadmap item was **`S4-R5`**, which the addendum below now discharges.

## Addendum (2026-11-17) — `S4-R5` is DECIDED (retained) and DISCHARGED: historical availability ≠ latest readiness

**Scope.** IRR-only. **The `S4-R5` row above is replaced by its discharge record; the `S4-R1`, `S4-R2`, `S4-R3` and
`S4-R4` rows and addenda are unchanged**, and no closure condition of theirs was relaxed. No coverage algorithm,
derivation, assessment, valuation, freshness or confidence rule changed; no issuer was admitted, no dataset was built,
no source was fetched and no host was touched.

**The decision (owner, 2026-11-17).** *Retain existential annual-period coverage semantics.* A method is **historically
`AVAILABLE`** when **at least one** eligible (issuer, annual period) pair satisfies the inputs it declares. That does
**not** guarantee a valuation on the latest applicable data, and **historical method availability** and **latest
assessment readiness** are kept **distinct** in what is computed, served and displayed. Missing, stale, incomplete or
invalid *latest* inputs keep producing withholding/blocking outcomes: no zero substitution, no silent reuse of an older
value, no weakened validation. Record:
`docs/integration/IID-COVERAGE-AVAILABILITY-SEMANTICS-2026-11-17.md`; evidence:
`evidence/real-issuer/S4-R5-HISTORICAL-VERSUS-LATEST-2026-11-17/`.

**The measurement already implemented it, and that was verified rather than assumed.** `measureMethod`
(`coverage/measure.ts:111-175`) was already existential — one qualifying pair is enough (`:146`, `:166`) — so the
decision required **no** change to the algorithm. The measurement's output hashes **identically** before and after the
edits on both served datasets: `84869d96…` / `b92ea944…` for `sha256:69bbc14e…` and `3a1142b2…` / `7f5dec15…` for
`sha256:bdfb2527…`, and the first value of each pair reproduces the `S4-R4` record's digest exactly. Both declarations
this item added were appended **below** every existing line of `measure.ts`, so this document's and `S4-R4`'s line
references still resolve.

**The gap it found, and the issuer-neutral correction.** The served report disclosed *counts* (`usableMethods`,
`withheldMethods`, sector `stage`) and per-issuer *data* counts, but nothing joined them: no surface said that a usable
method may rest on an **earlier** period, and the SPA label read "Methods usable / withheld". The correction is
disclosure only, computed from fields that already existed:

| Where | What it now says |
|---|---|
| `coverage/measure.ts` (`missingInputsFor` `:365`, `qualificationOf` `:407`) | one shared qualification predicate; the qualifying (issuer, period) pairs newest-first, the newest period, and whether that period itself qualifies — so the measurement and the disclosure cannot drift |
| `coverage/investmentCoverage.ts` (row block `:133`, computed `:361`, attached `:566`; report marker `:216`/`:665`) | per issuer: `basis`, `latestPeriodEnd`, `annualPeriodsConsidered`, `primaryMethod` (**both** verdicts), and three disjoint lists — `latestPeriodAvailable`, `earlierPeriodsOnly`, `neverAvailable`; the report declares `availabilitySemantics: 'EXISTENTIAL_ANNUAL_PERIOD'` and appends one note stating the reading rule and the non-substitution prohibition |
| `frontend/src/features/investment/InvestmentCoveragePage.tsx` | the Sector measurement section states that availability is historical; the issuer table gains *Method availability (historical vs latest period)* rendering *N at latest (period) · M earlier only · K never available* with the earlier-only ids listed; the counter is relabelled *Methods historically **available** / withheld*; an absent block renders `not reported`, never `0` |
| `frontend/src/features/investment/IdentityCoveragePage.tsx`, `coverage/investmentCoverageView.ts`, `identity/coverageView.ts` | the **same** relabelled counter, and the coverage HTML view states the same reading rule — one label must not mean two things on two surfaces |

**Regression.** `iips-platform/tests/investment/s4r5-availability-semantics.test.ts` — **10 tests**, all passing: the
existential verdict is the live one; the same method is withheld (and the input named) once no period carries it; an
earlier-only method is reported as earlier-only with the latest period named; latest-period readiness is independent of
the historical verdict in the same issuer and sector; the primary method is stated both ways; the qualifying periods are
named newest-first; a second issuer in a different sector takes the same generic path; an issuer with no annual period
says so; the report declares its semantics and re-states the measurement unchanged; every issuer row carries the
disclosure. SPA: `frontend/src/features/investment/investmentCoverageAvailability.test.tsx` — **7 tests**, plus the
served-route suite updated for the appended note (`notes.length` 3 → 4, with the new note asserted). Full IID suite
**1526/1526**; `iips-platform` `tsc --noEmit` clean; frontend `tsc --noEmit` reports no error in any file this item
touched.

**Measured on the served datasets.** On `sha256:69bbc14e…` Consumer's counter reads **3 usable / 0 withheld** while
Marico is `latestPeriodAvailable: [DCF_FCFF, PE_RELATIVE]`, `earlierPeriodsOnly: [EV_EBITDA]` — the D1 example stated
per issuer instead of implied. After the `S4-R3` refresh (`sha256:bdfb2527…`) Marico is latest-ready for all three: the
same code, a different dataset, and the distinction legible in both directions. Infosys stays `neverAvailable:
[EV_EBITDA, EV_REVENUE]` on both.

**Statuses.** `S4-R2` **CLOSED**; `S4-R3`/`S4-R3-Infosys` **OPEN** (unchanged conditions); `S4-R4` **CLOSED** and its
contract unchanged; `S4-R5` **DECIDED — DISCHARGED**; `L-001`, `G-6`, `L-041`, `L-042` unchanged; Stage 4
**PARTIALLY COMPLETE**; IID readiness **NOT READY**. The next Stage 4 roadmap item is **`S4-R6`** (`G-4`, operating
metrics).

## Addendum (2026-11-18) — `S4-R6` investigated: the 14-slot matrix is fixed, the capability is proven, the source evidence is absent, the owner decision is OUTSTANDING (`G-4` stays OPEN)

**Scope.** IRR-only. **The `S4-R6` row above is updated in place only to record its investigation; the `S4-R1`,
`S4-R2`, `S4-R3`, `S4-R4` and `S4-R5` rows and their addenda are unchanged**, and no closure condition of theirs was
relaxed. No issuer was admitted, no dataset built, no source fetched, **no operating metric was entered**, no host was
touched, and no valuation formula, weight, threshold, cap, freshness rule or method requirement changed.

**Baseline.** `f1bd346c22ff7e9ad44f83b097f4bcbf5d7b196e` (`main` = merge of PR #590 / `S4-R5`), clean worktree.
**Record:** `IID-S4-R6-OPERATING-METRICS-2026-11-18.md`. **Evidence:**
`evidence/real-issuer/S4-R6-OPERATING-METRICS-2026-11-18/` (`metric-requirement-matrix.json`, `metric-census.json`,
`capability-probes.json`).

**The requirement set, derived rather than quoted (`V2190`).** The register's "14 of 38" is confirmed from
`SECTOR_METHODS` and the exact slots listed: Technology `EV_REVENUE`; Industrials `EV_REVENUE`; Materials
`NAV_RESERVES`; Utilities `REGULATED_ASSET_BASE`; Auto `EV_REVENUE`; Energy `EV_EBITDAX` and `NAV_RESERVES`;
Healthcare `EV_EBITDA`; Hospitality `EV_EBITDA`; Banking `RESIDUAL_INCOME` and `PB_RELATIVE`; Insurance
`P_EMBEDDED_VALUE`; Capital Markets `P_AUM`; Telecom `EV_SUBSCRIBER`. **24** of the **33** vocabulary ids are required;
**nine** are required by no method. Every declared metric carries `minimumSourceClass: 'OPERATOR_ENTERED'`; the
requirement is **mandatory** with no conditional construct, the unit and range come from the metric definition, and the
period must be an **annual** period end the dataset carries for that issuer.

**The census (`V2191`).** Both served datasets re-ingested at clock 2026-11-18: **0** operating-metric records, no
`VENDOR`, no metric-related ingestion issue. `git ls-files` finds **one** metric file in the whole repository — the
synthetic 7-row test fixture (2 synthetic issuers, a deliberate GNPA/NNPA inconsistency). So the recorded zero is a
fact about the repository, not a reporting artefact. A **Consumer 100 %** metric coverage means *nothing was required*
(`coverage/measure.ts:250`), and is recorded as such rather than as evidence of data.

**Source and rights (`V2192`).** No admissible source-backed metric exists in this repository for any of the 14 slots.
Technology: `REL-1` states the issuer does not disclose `TM_NRR`/`TM_RECURRING_REVENUE_PCT` "in a form this dataset can
carry" and that neither is imputed from a segment note. Industrials: `WI8` §7 states the FY2025-26 report prints order
intake ₹25,280 crore and order book ₹36,267 crore but **no book-to-bill ratio** and **no prior-year intake**, and that
division is forbidden ("D-2 forbids arithmetic invention of a metric, and one year's intake is not a ratio"). The other
twelve slots have **no admitted issuer** in this repository, so no issuer source for them is committed either. This is a
statement about the repository's evidence, not proof that the values do not exist publicly. No provider was admitted,
`O3` is untouched, the source-rights records are unchanged, and **no web-derived figure was used**.

**Capability, verified and unchanged (`V2193`).** Twelve deterministic probes plus a **25-test** issuer-neutral suite
(`iips-platform/tests/investment/s4r6-operating-metric-gating.test.ts`) establish: a well-formed `OPERATOR_ENTERED` row
is ingested `VALID` with lineage; `UNKNOWN_METRIC`, `UNKNOWN_ISSUER`, `SOURCE_REF_REQUIRED`, `INVALID_SOURCE_CLASS` are
errors and never become availability; `UNIT_MISMATCH`/`OUT_OF_RANGE`/missing value/conflict/cross-field each withhold the
method with a named reason and never a zero; a metric at a period the dataset does not carry is retained, warned about and
gates nothing; a two-metric method needs both; a `VENDOR` observation is retained and coverage-counted yet **never opens
the assessment** (the source floor is applied there and the refusal names the metric) and a metric from another sector's
vocabulary is retained but inert at both layers; and a **previously unseen issuer** satisfies the same declaration through
the same code path, with `issuersAvailable` naming exactly who qualified. **No defect was found that prevents any
required behaviour, so no production source changed** — the item's source diff is empty.

**Two observations, recorded and not "fixed" (`V2194`).** (a) There is no metric/issuer-sector consistency check: a
`TM_NRR` entered for a Hospitality issuer is accepted `VALID`, silently inert (it can never unlock anything), and adding
a warning would flip that issuer's served row to `ISSUED_DATA` through `issuerIdOfIssue` — a behaviour change outside
this item's need. (b) `period_end` is not format-validated; a malformed end simply never matches a period, so it is
fail-safe and gates nothing. Both are detection gaps, neither blocks a required behaviour.

**The two layers stay distinct (`V2195`).** `layerProbes` demonstrates `S4-R4`'s D4 live: for the same synthetic
observation, coverage reports `AVAILABLE` for all three source classes while the assessment refuses `VENDOR` as
`MANDATORY_METRIC_MISSING: HM_REVPAR (source class too weak)` (`assessment/methods.ts:147`). A `VENDOR` metric would
therefore not unlock the assessment even if it unlocked coverage. `S4-R4`'s contract is unchanged and not reopened.

**`G-4` determination (`V2196`).** **`G-4` remains OPEN.** The register's closure evidence — `operatingMetricRecords > 0`
with `validation VALID` **and** the named methods `AVAILABLE` — is unmet on both clauses, and there is no partial metric
set to be partially closed by. **Option B (keep withheld) cannot close `G-4` against that test**: it produces no valid
record and leaves every named method `WITHHELD`, so it would record a **controlled limitation**. The repository states
the test **two ways** — the register's numeric evidence and `S4-R3` reassessment §4's "validated metric records **or** a
recorded decision to keep methods withheld" — and this item does **not** choose between them, because choosing would
redefine acceptance on the owner's behalf. Until the owner decides both the disposition (A/B) **and** which closure test
governs, `G-4` stays OPEN with the ambiguity recorded. Nothing here claims closure because the system can withhold
safely.

**Statuses.** `S4-R1` substantially discharged; `S4-R2` **CLOSED**; `S4-R3`/`S4-R3-Infosys` **OPEN**; `S4-R4` **CLOSED**;
`S4-R5` **DECIDED — DISCHARGED**; **`S4-R6` INVESTIGATED, decision OUTSTANDING, `G-4` OPEN**; `S4-R7` complete;
`S4-R8` open (event-driven); `L-001`, `G-6`, `L-041`, `L-042` unchanged. Stage 4 remains **PARTIALLY COMPLETE**; overall
IID readiness **NOT READY**. The next Stage 4 roadmap item is **`S4-R7`** (already discharged) and then **`S4-R8`**
(corporate actions), with `S4-R6`'s owner decision outstanding in parallel.


## Addendum (2026-11-17) — S4-R8 corporate-actions G-8 investigated; OPEN/event-driven

This addendum updates the **status of S4-R8 only**; the historical registration row and its criterion are preserved.
Record: `IID-S4-R8-CORPORATE-ACTIONS-2026-11-17.md` (§§1–10). Evidence:
`evidence/real-issuer/S4-R8-CORPORATE-ACTIONS-2026-11-17/`. Tracker §16.298 / `CV-CORR-263` / `V2197`–`V2204`.
Baseline: remote main at PR #591 merge (exact commit in the record and machine-generated census).

| Item | Current finding | Literal criterion | Determination |
|---|---|---|---|
| S4-R8 / corporate-actions G-8 | **INVESTIGATED — OPEN/event-driven**. 597-file evidence census, 13 discovery candidate/group rows, zero admissible canonical events. Both temporary real-input dataset read-backs contain 0 actions. | **`corporateActions > 0`**, record as events occur and re-publish; L-031 additionally needs a real declared-action guard/factor demonstration. | **C**, not A: sources reference historical buybacks/bonuses/split/redemption and other distributions/issues, but event-level evidence/admission/schema support is insufficient. No global non-occurrence claim. |

**Synthetic result unchanged:** scenario 7 remains DEMONSTRATED on **SYNTHETIC_FIXTURE**, with its three original
tests untouched and reused. Never counted as real issuer coverage. The real-event limb is **NOT DEMONSTRATED**.

**Safe issuer-neutral correction:** dataset assembly now reuses the identity record validator instead of bypassing
it, withholds the whole action file on any error even for explicit partial dataset publication, and verifies supplied
subject security ownership. Canonical dataset fields must be explicit, so legacy identity defaults cannot let a
missing boolean bypass the comparability guard. Shared validation rejects non-positive ratios and duplicate successor issuer ids.
Valid originals/provenance retained; **22 new tests**, existing corporate-action/source/scenario run **77/77**,
full IID **1573/1573**, platform typecheck and CAP-03 static validation pass. Original/corrected production replay
returns identical digests for both real-input datasets; no real input or historical evidence changed.

**Not claimed:** successor-security exchange/fraction processing, independent source rights, a real guard firing,
complete action history or acceptance of the supplemental refresh as new O3 authority. No synthetic event entered,
no new provider, rights expansion, valuation/freshness/portfolio change, host operation, IPD write or cross-repo sync.
L-031 **OPEN**; G-8 **OPEN**; S4-R2 through S4-R7 not reopened. Stage 4 **PARTIALLY COMPLETE**, IID **NOT READY**.

**Next action:** owner/operator obtains event-specific source/locator, exact dates/historical identity/terms and
applicable rights/admission, then transcribes, validates, publishes, independently reads back and demonstrates the
real criterion with before/after digests. Unsupported schema semantics require a governed decision, not a guessed
mapping. S4-R8 is the last numbered Stage 4 roadmap row: **no next numbered item is registered**; remaining work is
the existing residual/event-driven/operator/owner actions, including the outstanding S4-R6 decision.
