# S4-R3 — financial-data freshness: the capability, the measurement, and the exact reason the item stays open (2026-11-17)

**Work item:** `S4-R3` — *"Install quarterly periods, or more recent annual filings"* (`G-6`), recorded in
`IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` with the closure condition *"`quarterlyPeriods > 0`, or staleness within
200 days, and `STALE_STATEMENTS` no longer raised"*.

**Disposition:** **the reusable capability is delivered and tested; `S4-R3` remains OPEN, and `S4-R3-Infosys` remains
OPEN**, for a reason that is now measured per issuer rather than asserted: at a newly recorded clock of **2026-11-17**,
every issuer's **valuation basis** — the annual period the valuation actually consumes — is beyond
`freshness-policy/1.0.0`'s 200-day window. KEC has two quarters since its annual period (the newest information is
**48 days** old), and its annual basis is still **231 days** old. No threshold, cap, formula, weight or policy version
was changed, no issuer was admitted, no dataset was installed and no source material was re-downloaded.

---

## 1. The starting position, re-verified at `main` `d71b025` rather than quoted

| Question the work item asks | Answer found in the repository on 2026-11-17 |
|---|---|
| Current periods, per issuer | Infosys FY2022–FY2024 (annual only); Marico FY2022–FY2024 (annual only) in the admitted `WI7` input; KEC FY2024–FY2026 (annual only) in the admitted `WI8` input. The refreshed successors add Marico FY2025–FY2026 and KEC Q1/Q2 FY2027. |
| Reporting-period ends | Infosys 2024-03-31 · Marico 2024-03-31 (admitted) / 2026-03-31 (refresh) · KEC 2026-03-31 (annual) and 2026-06-30, 2026-09-30 (quarters) |
| Filing / publication dates | Captured per row as `filed_at` on every observation, e.g. Infosys FY2024 filed 2024-04-18; KEC FY2026 filed 2026-05-16; KEC Q2 FY2027 filed **2026-11-02**; Marico FY2026 filed 2026-05-05 |
| Age at a newly recorded clock (2026-11-17) | Infosys **961 days** · Marico **231 days** (refresh) / 961 (admitted input) · KEC **231 days** annual basis, **48 days** newest reported |
| Quarterly vs annual availability | Annually only in the admitted dataset (`quarterlyPeriods = 0`); the S4-R3 candidate carries **2 discrete quarters** (KEC) |
| Is `sha256:bdfb2527…` in the authoritative dataset? | **No — and it is not a host artefact either.** It is the O3-admitted *candidate*, reproducible from three committed inputs (§4). It is not installed anywhere, and the host workflow that verified it on 2026-11-15 built a copy at `C:\iips-candidates\S4-R3-preflight-7ef0f10`, which is not the served dataset. |
| Does O3 cover every input in use? | **No — see §7.** The 2026-11-14 re-admission covers `REL-1`'s Infosys input, the refreshed Marico and KEC bundles and the candidate `bdfb2527`. It does **not** cover the `S4-R2` Infosys input (a successor transcription created 2026-11-17), so the dataset `69bbc14e` and the combined candidate `f357f6af…` are **not declared**. |
| Do the installed host dataset and served assessment reflect the candidate? | **Not on any host.** The mechanism was proved on this sandbox: the candidate installs over a prior dataset and the served reads carry freshness from the installed bytes (§6). `C:\iips-data` was not touched. Candidate, admitted, installed and served are kept apart in §1, §5 and §6. |
| Remaining blockers | Newer **annual** filings (all three), and an O3 successor declaration for the `S4-R2` Infosys input. |

## 2. What was wrong with freshness as a capability

Re-read in the code, not inferred:

1. `engine.ts` computed `dataAsOf = series.annual[0]?.periodEnd` and `stalenessDays` from it. For a series with **no
   annual period** that expression is `undefined`, the age became `0`, and the assessment reported a **fresh** company.
   That is a false negative: a quarters-only holding has no annual basis for a valuation at all.
2. Only **one** age was published. The question "how old is the newest information the filer has published?" and the
   question "how old is the period the valuation rests on?" had the same answer — or, for KEC after the refresh, no
   answer for the first at all.
3. `filed_at` was captured at ingestion and never surfaced. A reader could not tell a late filing from an old period.
4. A **gap** in the period sequence (FY2022, FY2023, FY2025; or Q1 and Q3) was invisible: the series was simply
   shorter, and every consumer read it as continuous.

## 3. What the capability is now

`iips-platform/src/investment/assessment/freshness.ts` — one pure module, no I/O, no wall clock, no issuer:

| Rule | Behaviour |
|---|---|
| **Basis** | `valuationBasis` is the newest **annual** period, else TTM, else the newest quarter, else none — with `valuationBasisKind` publishing which. A fallback is never presented as an annual basis; `NO_ANNUAL_PERIOD_FOR_VALUATION` says so. |
| **Age** | Measured from the **period end** to the caller's clock, never from the filing date. `pnlDays` / `balanceSheetDays` are read from `VALUATION_POLICY.freshness`; no threshold lives in the module. |
| **Publication** | `filedAt`, `daysSinceFiling` and the policy windows are published **beside** the period age, so a late filing cannot be mistaken for a current period. |
| **Two facts** | `latestReported` (newest period of any type) and `valuationBasis` (the period that would be valued) are separate members with separate ages. |
| **Verdict** | `STALE` / `FRESH` / `UNKNOWN` — `UNKNOWN` when there is no period at all **or** when the basis ends after the clock (contradictory data, previously clamped to an age of zero days and read as maximally fresh), and never `FRESH`. The engine's `staleBeyondPolicy` is `status !== 'FRESH'`, so neither an absent basis nor an impossible one can pass as freshness. |
| **Gaps** | `periodSequenceGaps` reports a skipped fiscal year (annual) or a skipped quarter inside a fiscal year (grouped by the fiscal year's **start**, so an April–March year is not split in two). Nothing is interpolated. |
| **Payload** | `quality.flags` gains `PERIOD_SEQUENCE_GAP` (MEDIUM) when a gap exists. Nothing else in the payload changed — deliberately: see §6. |
| **Coverage** | Each issuer row of the investment-coverage read model now carries `freshness` (status, reasons, basis, latest reported, windows, gap count), computed by the same module at the report's own `asOf`. |

The engine's own arithmetic was **replaced** by a call to this module rather than duplicated beside it, which is what
makes "freshness means one thing across assessment, coverage and reporting" true rather than aspirational.

## 4. The data limbs — what could be refreshed, and what could not

**Rebuilt and verified, not re-admitted.** The O3-admitted candidate rebuilds **byte-identically** from the three
committed inputs at this head:

```text
inputs  REL-1-INFOSYS-2026-11-06/ingest-input
        S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico
        S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec
result  datasetVersion sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
        11 annual + 2 QUARTER periods, 3 issuers, 0 issues
```

That is also the proof that `S4-R2`'s `FISCAL_YEAR_PERIOD_MISMATCH` guard does not disturb an April–March quarter
labelled `fiscal_year 2027` for a period ending 2026-09-30: the guard admits `periodEndYear + 1` for a quarterly row and
the digest is unchanged.

**Digests, at both clocks (a dataset digest is clock-invariant; the ages are not):**

| Dataset | Version | Periods | At 2026-11-14 | At 2026-11-17 |
|---|---|---|---|---|
| `S4-R2` repository dataset of record | `sha256:69bbc14e99cea0e24be568fa923971e7c0536009ab19056f09bf272d437c6fe2` | 9 annual, 0 quarter | same | same |
| `S4-R3` **O3-admitted** candidate | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` | 11 annual, 2 quarter | same | same |
| `S4-R2` + `S4-R3` **combined** (construction only) | `sha256:f357f6afafc3b50387ebc013c0dc857285871d183ccc7d828e8b2fc4c740798d` | 11 annual, 2 quarter | same | same |

The combined candidate exists so the operator can see what the two lines of work would produce together. It is
**explicitly not admitted**: it mixes a successor input that no O3 declaration covers (§8) with two that the
2026-11-14 re-admission covers. It is recorded, not served.

**Infosys — no newer source, and nothing manufactured.** The repository holds `INFY-INDAS-CONSOL-FY24` (filed
2024-04-18) and `INFY-INDAS-CONSOL-FY23` as its newest Infosys filings; there is no FY2025/FY2026 annual report, no
quarterly result and no XBRL extract for a later period. No quarterly data was invented, no annual figure was
extrapolated, no older period was re-dated, and the stale-data limitation is preserved exactly as it was:

> `S4-R3-Infosys` **OPEN**. Required operator action: obtain and transcribe an **authorised** Infosys filing with a
> period end on or after **2026-05-01** — for the 200-day window at a 2026-11-17 clock — into a complete successor
> input for the issuer, then record its O3 declaration and install it. Until then Infosys' valuation basis is
> 2024-03-31, **961 days** old, and every assessment of it carries `STALE_STATEMENTS` and the `STALE_DATA` cap. This is
> a source dependency, not an engineering one.

## 5. Freshness, measured per issuer, at the newly recorded clock 2026-11-17

**On the `S4-R3` admitted candidate** (`bdfb2527…`) — the dataset that carries the refresh:

| Issuer | Valuation basis | Age | Newest reported | Age | Filing date of the newest | Status | Gaps |
|---|---|---|---|---|---|---|---|
| Infosys Limited | FY2024 annual, 2024-03-31 | **961 d** | same | 961 d | 2024-04-18 | `STALE` | 0 |
| Marico Limited | FY2026 annual, 2026-03-31 | **231 d** | same | 231 d | 2026-05-05 | `STALE` | 0 |
| KEC International | FY2026 annual, 2026-03-31 | **231 d** | FY2027 Q2, 2026-09-30 | **48 d** | 2026-11-02 | `STALE` | 0 |

**Before / after the refresh** (same clocks, `S4-R2` dataset → `S4-R3` candidate):

| Issuer | Basis before | Basis after | `STALE_STATEMENTS` | Quality verdict | Confidence |
|---|---|---|---|---|---|
| Infosys | 2024-03-31 (961 d) | 2024-03-31 (961 d) — unchanged | raised both | `MATERIAL_CONCERNS` both | 0.4378 · 0.321 |
| Marico | 2024-03-31 (**961 d**) | 2026-03-31 (**231 d**) | raised both | `MATERIAL_CONCERNS` both | 0.3306 · 0.3306 |
| KEC | 2026-03-31 (231 d) | 2026-03-31 (231 d) + **Q1/Q2 FY2027** | raised both | `MATERIAL_CONCERNS` both | 0.3199 · 0.3199 |

*(Infosys' confidence differs between the two datasets because `S4-R2` corrects its borrowings — `EV_EBITDA` becomes
applicable and the method-applicability ratio rises — not because of anything in this work item.)*

The freshness **verdict did not move for any issuer**, and that is the point: 961 → 231 days is a real 730-day
improvement in Marico's data and KEC's two quarters are a real 183-day improvement in the newest information
available, and neither is enough to clear a 200-day window measured on the annual basis the valuation consumes. The
capability reports the improvement precisely instead of rounding it into a pass.

## 6. Installed and served — the drill, and what it does not prove

The owner's documented installation procedure (`IID-INSTALL-VERIFIED-DATASET-WINDOWS-PROCEDURE-2026-11-15.md`) was
executed end to end on this sandbox in an isolated temp root: a prior dataset (`69bbc14e…`) in the live directory, the
candidate built separately (`bdfb2527…`), then `install-verified-dataset`, then `verify-installed-dataset`, then the
product's own coverage and assessment reads over the **installed** bytes. Full transcript:
`runs/06-install-and-serve-drill.txt`.

```text
install-verified-dataset   RESULT INSTALLED — 15 passed, 0 failed
  candidate-coverage-consistent · published · installed-reader-verifies
  installed-digest-matches-expected · provenance-preserved
verify-installed-dataset   RESULT PASS — 25 passed, 0 failed
  reader-verifies · file-digests-recomputed · dataset-files-exact
  annual-periods 11 · quarterly-periods 2 · provenance-input-digests
  coverage-api-reads · read-only-attestation (nothing created, removed or modified)

served coverage read, from the installed bytes, at 2026-11-17
  Marico       basis ANNUAL 2026-03-31 (231d, filed 2026-05-05) · newest ANNUAL 2026-03-31 (231d)      STALE
  KEC          basis ANNUAL 2026-03-31 (231d, filed 2026-05-16) · newest QUARTER 2026-09-30 (48d)       STALE
  Infosys      basis ANNUAL 2024-03-31 (961d, filed 2024-04-18) · newest ANNUAL 2024-03-31 (961d)       STALE
```

**What it does not prove.** That the operator's Windows host holds these bytes. `C:\iips-data` was not touched, no
host verifier ran, and the temp root was deleted. The evidence is that the **mechanism** publishes the admitted
candidate and that the **served reads carry freshness from installed bytes**; the host limb (`S4-R3` installation and
post-installation host verification) remains an operator action, with `runs/06` as the exact command sequence to run
there — `--expect-version sha256:bdfb2527…`, `--expect-quarterly-periods 2`, `--as-of <clock>`.


## 7. The payload was deliberately left byte-identical

The freshness decomposition is **clock-derived**, and the assessment payload's *substantive identity* is deliberately
clock-free: `substantiveIdentity.ts` deletes a **closed** list of members (`artifact.generatedAt`, `asOf.generatedAt`,
`asOf.stalenessDays`, `subject.identity.bindingRef`) before hashing, and its own comment records that widening that list
"is exactly what the register forbids". A day-count inside the payload would have changed every stored report's
substantive digest **every day**. So the block lives where a clock-derived view belongs — the coverage read model and
the engine's own verdict — and not inside the hashed artefact.

The regression proof is a pinned digest, not a promise:

```text
Infosys, S4-R2 dataset, clock 2026-11-14, identity block as recorded
  assessment payload SHA-256 = 925b403622c9b667152effa64539036a8cbcea40229ef2b36c7f148c210e471e
  assessCompany inputDigest  = sha256:9a2b0fd24d734d955a0f6d37dd421d2ef77609bbb8610e4055ab556172b5f46a
```

Both are exactly the values `S4-R2` recorded on 2026-11-17, reproduced by `s4r3Freshness.test.ts`. The only payload
change is `quality.flags`, and it can only appear for a series with a gap — which none of the three admitted issuers
has.

## 8. Finding: the O3 re-admission does not cover every input in use

This is what §1 asked for, and the answer is **no**.

- O3 §8.4 (original decision, preserved byte-identical): *"If any admitted bundle is restated, re-transcribed,
  re-digested or otherwise superseded, this admission does not automatically extend to the successor. A fresh operator
  declaration is required, recording the new bundle identity and its new digests."*
- The 2026-11-14 re-admission (`IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md`) is that declaration for
  `REL-1`'s Infosys input (`inputDigest sha256:da0253c8…`), the refreshed Marico (`31d8e503…`) and KEC (`22ea5018…`)
  bundles, and the candidate `bdfb2527…`.
- `S4-R2` (2026-11-17) created a **successor transcription** of the Infosys input at
  `evidence/real-issuer/S4-R2-INFOSYS-BORROWINGS-2026-11-17/ingest-input`. No O3 declaration records it, and the
  `S4-R2` record described it as "the same admitted issuer" rather than as a successor bundle. Under §8.4 that is
  an understatement.

**Consequence, stated exactly.** Dataset `69bbc14e…` (the `S4-R2` dataset the Stage 4 served-surface tests pin) and the
combined candidate `f357f6af…` are **constructed from declared and undeclared inputs mixed together**; neither is
O3-admitted, and neither may be described as admitted or installed. The admitted dataset remains `bdfb2527…`, which
still reproduces and is the dataset this record measures against.

**Operator action (one declaration, no code):** record an O3 successor declaration naming
`S4-R2-INFOSYS-BORROWINGS-2026-11-17/ingest-input` and its two file digests
(`periods.csv` `97d7cf7ca366a049832756b59c6c5396f5166b10ed6ba5f54e88fe2f5260fc83`,
`roster.json` `426e8478bca1ffc3fd47a6a24995230cfbfc05ccd1df4b92fa774ba15c60f8b4`), and — if the combined candidate is
wanted as the dataset of record — the four digests above. Until that exists, `S4-R2`'s dataset is a candidate and this
record says so.

## 9. Why `S4-R3` stays OPEN — the exact condition

At a 2026-11-17 clock the 200-day window admits a period end on or after **2026-05-01**. No issuer in the admitted
population has one:

- **Infosys** 2024-03-31 — needs a newer **annual** filing (none in the repository). `S4-R3-Infosys` OPEN.
- **Marico** 2026-03-31 — needs FY2027 annual accounts (available from ~May 2027) or a quarterly period.
- **KEC** 2026-03-31 annual basis, with Q2 FY2027 (2026-09-30) already reported — the quarterly limb of the register's
  clause is **met** (`quarterlyPeriods = 2`), the flag limb is **not**.

That second limb cannot be met by quarterly data at all under the current policy: `STALE_STATEMENTS` is raised from
the **valuation basis**, and making a quarterly period carry it would change what the freshness verdict means. That is
a valuation-policy decision (owner), not an implementation choice, and taking it here would be exactly the
"weaken the threshold so the issuer looks current" that this work item forbids. It is recorded as a decision
available to the owner, with its consequence: the annual statements a DCF consumes are still 231 days old whatever a
quarter shows.

So: **`S4-R3` OPEN**, with the closure evidence now being (i) a newer annual period end on or after the window for each
issuer, or (ii) an explicit policy decision that quarterly periods carry the freshness verdict for an issuer whose
annual data is older — recorded as a decision, not applied as an implementation.

## 10. Tests (23 new, and what each proves)

`iips-platform/tests/investment/s4r3Freshness.test.ts` — **23 tests, 23 pass**:

| Property the work item requires | Test |
|---|---|
| a new issuer with valid **quarterly** data, no issuer-specific code | synthetic `IN:CIN:U74999TN2019PLC000123`, ingested through the real CLI; annual + 2 quarters, coverage row carries the same block |
| **annual-only** data processed correctly | the same issuer with no quarter rows: 0 quarterly periods, no gap, basis = annual |
| a **newer filing updates** the applicable period without corrupting older ones | the refresh itself: Marico 2024-03-31 → 2026-03-31 with FY2022–FY2025 preserved; restatement test keeps as-filed **and** restated |
| missing **quarters are not fabricated** | Q1 + Q3 → one gap (`FY2027-Q2`), `PERIOD_SEQUENCE_GAP` flag, and no `2026-09-30` anywhere in the quarter list |
| stale data triggers the **correct limitation** | `STALE_STATEMENTS` + `STALE_DATA` cap; `UNKNOWN` for a series with no period |
| **filing dates and period dates stay distinct** | same period end, two filing dates 300 days apart, identical ages; `daysSinceFiling` differs |
| invalid or contradictory periods **rejected or withheld** | a quarter labelled `fiscal_year 2029` for a 2026-09-30 period end → exit 1, nothing published; a period ending after the clock → `UNKNOWN` + `FUTURE_PERIOD_END`, never `FRESH`, while a period ending *on* the clock is fresh |
| **revised filings** keep their version/provenance distinction | as-filed and restated both stored, series prefers `RESTATED`, freshness names the restating filing's date, `data.restatements` discloses the as-filed figure |
| a future holding with **no new filing** stays stale | the same synthetic issuer shifted three years back: both limbs outside the window |
| existing assessments **preserved** | the `S4-R2` payload digest reproduces byte-for-byte (§7); no gap for any admitted issuer; the admitted candidate reproduces `bdfb2527…` |

## 11. Reproduction

```bash
cd iips-platform

# the freshness suite alone
npx tsx --test tests/investment/s4r3Freshness.test.ts

# the whole IID suite
npx tsx --test tests/investment/*.test.ts

# the admitted candidate, rebuilt from committed inputs
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input \
  --input ../evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico \
  --input ../evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec \
  --dataset-dir <tmp>/dataset --now 2026-11-17T00:00:00.000Z
#   ⇒ sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
```

`digests.json` records every input digest, every dataset version at both clocks and the per-issuer payload digests;
`runs/02-freshness-per-issuer.json` is the full `FreshnessBlock` per issuer per dataset per clock;
`runs/03-assessment-slices.json` is the assessment outcome; `runs/05-coverage-freshness.json` is the coverage row as
served.

## 12. Governance

| Item | State |
|---|---|
| O3 admission | unchanged. No issuer admitted, no dataset declared. §8 records the successor gap rather than papering over it. |
| Source rights | unchanged. Nothing was downloaded, re-transcribed or admitted; every input used was already committed. |
| Policy | `freshness-policy/1.0.0` unchanged — same `pnlDays`, `balanceSheetDays`, `priceMaxAgeDays`; no confidence cap, threshold, weight, formula or policy version touched. |
| Payload | byte-identical for every existing issuer (§7). |
| Host | **no host installation, no host claim.** The install-and-serve drill ran in an isolated sandbox temp root (§6); `C:\iips-data` was never touched and the temp root was removed. Candidate ≠ admitted ≠ installed ≠ served, kept apart in §1, §5 and §6. |
| IPD | not read, not written. |
| Evidence | additive. Historical Stage 4 and S4-R3 records are appended to, never rewritten. |
