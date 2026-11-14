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
| **Demo limb** — the §23 ten-scenario demo passing | **SUBSTANTIALLY MET — corrected at S4-R1.** **6 of 10 DEMONSTRATED** (scenarios 2, 3, 4, 6, 7, 8), **4 of 10 PARTIALLY DEMONSTRATED** (1, 5, 9, 10), **0 undemonstrable**. Every residual limb is a **Stage 5 dependency** — D2 (minted assessment chain) with G-10/G-11 for scenario 1, D5/D6 (IPD binding + IPC endpoint) for scenarios 5 and 10 — or, for scenario 9, a **measured divergence** from a value §23 itself predicted. **None is a population gap.** This line previously read "**NOT MET.** 6 of 10 … **4 cannot be**, because they require populations that are not admitted"; that was a misreading of §23's own preamble, which designates a synthetic-fixture medium for scenarios 2, 3, 4 and 7 (evidence §10, §10.1). The accounting is now pinned by a committed executable test, not by prose |


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
| The §23 ten-scenario demo passing | **SUBSTANTIALLY MET** — 6 demonstrated, 4 partially demonstrated, 0 undemonstrable; the four residuals are Stage 5 dependencies or one recorded divergence, **not** population gaps | evidence §10 |
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
| **S4-R1** | Close the §23 **demo limb** | **IRR** (demonstration) — **re-classified from OWNER/OPERATOR: no population decision was ever needed** | **SUBSTANTIALLY DISCHARGED.** The corrected accounting is **6 demonstrated / 4 partially demonstrated / 0 undemonstrable**, pinned by a committed executable matrix test (`iips-platform/tests/investment/iidStage4ScenarioMatrix.test.ts`, **39 tests / 11 suites**) rather than by prose (evidence §10.1–§10.4). This row was opened as an owner population decision on the finding that "scenarios 2, 3, 4, 6 and 8 need populations that are not admitted". That was wrong twice over: §23's preamble marks **2, 3, 4 and 7** as *"(S) = synthetic fixture only"* — a designated medium, not a fallback — and scenario 8 says outright *"fully demonstrable in fixtures; Marico/KEC show the Consumer/Industrials analogue on real data"*, which is exactly what was measured. **The register's own second option has now been executed:** *"record … that the demo limb is discharged on `SYNTHETIC_FIXTURE` data, naming the test that demonstrates each scenario."* Each of the ten scenarios is named, with its label and its acceptance condition. | Nothing further from an owner. What remains is **Stage 5 work under different register names**: D2 + G-10/G-11 close scenario 1's minted chain; D5/D6 close scenarios 5 and 10's holding persistence; scenario 9's divergence is closed by disclosure (evidence §10.3) and adding debt-side items to `REQUIRED_ITEMS` would be a **valuation-policy** decision, not a demonstration act, so it was not taken. | **Stage 4's demo limb is no longer the binding reason the verdict is partial.** The verdict stays partial because four scenarios have Stage-5-owned residual limbs and because G-4/G-6 remain open as data acts |

| **S4-R2** | Transcribe Infosys' missing borrowings lines | **OPERATOR** (transcription) | **NEW.** `LONG_TERM_BORROWINGS` and `SHORT_TERM_BORROWINGS` were **never transcribed** for Infosys in any of the three periods, so `NET_DEBT` is not derivable and Technology's `EV_EBITDA` is withheld `STATEMENT_INPUT_MISSING`. This is a transcription-completeness gap, **not** a measurement, derivation or policy defect — `derive.ts` correctly refuses, because "an unreported input is never silently zero" | Transcribe both lines for the three periods from the filing and re-ingest. **Do not** widen the derivation | Technology's `EV_EBITDA` `AVAILABLE`, or a `NOT_REPORTED` recorded at source with its reason | One withheld method. Nothing structural |
| **S4-R3** | Install quarterly periods, or more recent annual filings | **OPERATOR** (data) — this is `G-6` | **NEW.** All three issuers exceed the freshness window at the assessment clock: 958, 958 and 228 days against `VALUATION_POLICY.freshness.pnlDays = 200`. All three therefore carry `STALE_STATEMENTS` (HIGH) and a `MATERIAL_CONCERNS` quality verdict | Install quarterly data (`quarterlyPeriods` is 0 today) or newer annual filings | `quarterlyPeriods > 0`, or staleness within 200 days, and `STALE_STATEMENTS` no longer raised | **G-6**, and the currency of any valuation claim on this data. Not Stage 4's measurement |
| **S4-R4** | Document that coverage "usable" does not mean "a valuation would be produced" | **IRR** (documentation) | **NEW — partially discharged.** The two layers answer different questions by design: coverage asks whether a method is computable for **any** issuer-period, assessment resolves **one latest instant** with a stricter input set. Both are correct; a reader could infer a valuation from a coverage row. Recorded in evidence §8.2 rather than in source, to keep the Stage 4 diff minimal and the validator's line pins stable | A source-level note in the coverage module stating the window difference | The note committed | Nothing. This is a misreading risk, not a defect |
| **S4-R5** | Decide whether coverage availability should remain existential over annual periods | **OWNER** (measurement-policy decision) | **NEW.** `measureCoverage` declares a method `AVAILABLE` if **at least one** issuer-period has all its inputs. Consumer's `EV_EBITDA` therefore rests on **FY2023 alone** — the single year Marico's `LONG_TERM_BORROWINGS` was transcribed — while FY2022 and FY2024 do not support it. Same class as evidence §4.2's shape (b), on the method axis | A policy decision: keep existential availability (a dataset-capability statement) or require the latest period (a usability statement) | A recorded decision, and the code or the record amended to match | Nothing today. It is a semantics risk, and changing it silently would understate dataset capability |
| **S4-R6** | Decide on operating metrics to unlock `TM_*`/`IN_*`/`BM_*` | **OWNER** with **OPERATOR** — this is `G-4` | **NEW, and named by §21 itself as a Stage 4 remaining item.** `operatingMetricRecords` is 0, so 14 of 38 method slots are withheld; Technology needs `TM_NRR`/`TM_RECURRING_REVENUE_PCT`, Industrials needs `IN_BOOK_TO_BILL`. Consumer declares no mandatory metrics and is unaffected | Supply validated operating-metric records, or record that these methods stay withheld for this population | `operatingMetricRecords > 0` with `validation VALID`, and the named methods `AVAILABLE` | **G-4**, and two withheld methods |
| **S4-R7** | Add a lint over hand-authored rosters | **IRR** — this is the remainder of `G-14` | **NEW.** The read path now catches the defect class at runtime, which is the stronger position, but `G-14`'s literal complaint (*"no lint"*) is not yet answered statically | A repository validator that rejects an off-vocabulary `sector` in any committed roster, using the same `findInvalidIssuerSectors` authority | The lint failing on a deliberately respelled fixture roster | Nothing. `G-14` is substantially closed by the read path |
| **S4-R8** | Fill corporate actions as events occur | **OPERATOR** — event-driven | **NEW, and named by §21 itself.** `merge.actions 0`, `corporateActions 0` | Record actions as they occur and re-publish | `corporateActions > 0` | Nothing today |

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
| **Stage 4 — coverage readiness** | coverage, completeness, method usability and sector measurement verified on **installed** data; the §23 ten-scenario demo passing | **needs Stages 2–3**; independent of IPD | **This record. PARTIALLY COMPLETE** — measurement limb MET, G-7 closed, G-14 substantially closed; demo limb **SUBSTANTIALLY MET** after the **S4-R1** correction (6 demonstrated, 4 partially, 0 undemonstrable — the four residuals Stage-5-owned); G-4 and G-6 open as data acts (**S4-R6**, **S4-R3**) |
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
    claimed** — S4-R5, S4-R6 and S2-R1 all remain open and unrecorded.
11. It does **not** supersede, correct or reinterpret any protected record, the O3 decision, or any prior
    governance decision. It supersedes **one position** — Stage 4's, which nothing previously assessed — says
    so in the header, and adds to everything else.
12. It does **not** state any volatile value as a standing fact. Every count, digest, percentage and PR field
    is bound to a dated head: the measurement and coverage findings to 2026-11-14 at `316da977…`, and the
    S4-R1 scenario accounting and its gate numbers (evidence §11.2) to the corrected head that follows
    `a771290d…`.

---

*End of readiness record. Published additively; the records it assesses are unchanged, byte for byte.*
