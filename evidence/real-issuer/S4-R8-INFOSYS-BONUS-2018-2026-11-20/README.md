# S4-R8 First Real Corporate Action — Infosys 1:1 Bonus Issue (2018)

*IID Stage 4 — `S4-R8` / corporate-actions `G-8` / `L-031` (Data Supply + Proof).
Append-only event bundle; no historical evidence bundle is modified. This bundle
admits the first real corporate action in the repository — Infosys Limited's 1:1
bonus issue of 2018 — transcribes it into the existing canonical contract,
verifies the resulting candidate, and demonstrates the assessment guard and the
declared factor on the real record. It does not install, operate, or accept
anything, and it does not close `L-031`.*

## 0. Boundaries

- **No canonical schema extension, validator or tolerance change, and no
  freshness, valuation, price or calendar behaviour change.** The event mapped
  unambiguously onto the existing contract.
- Candidate verification is **not** installation, live verification, or
  acceptance. The successor candidate was built under `/tmp` outside the
  repository and is **not installed** on any host.
- The 2026-11-17 investigation (`IID-S4-R8-CORPORATE-ACTIONS-2026-11-17.md`,
  Determination C) is **not repeated and not revised**: none of its 13 discovery
  candidates is admitted, relabelled or upgraded here. This event is a newly
  supplied, event-specific record assessed fresh.
- No IPD repository file was created, edited, moved, or deleted; no pull
  request was merged.

## 1. The event and its establishment (work-item step 2)

Operator-supplied documented record, preserved **verbatim** at
`source/operator-supplied-event-2026-11-20.json` (SHA-256
`ab1e2600201d8503a4ed2d789184cfa64c56ec0e101a393be585ebd9ae1bbef2`) before
transcription:

- **Issuer/security at the event date:** Infosys Limited (CIN
  `L85110KA1981PLC013115`), fully paid-up equity shares of ₹5 face value,
  ISIN `INE009A01021`. A bonus issue changes neither ISIN nor face value, so
  the historical instrument is exactly the admitted security
  `IN:ISIN:INE009A01021`. The parallel NYSE ADS stock dividend is not an
  admitted security and is not transcribed.
- **Type:** `BONUS` — unambiguous mapping from the declared terms.
- **Official sources (locators preserved; PDFs not retrieved in this
  session):** NSE record-date intimation filed 2018-08-24 (SEBI LODR) and the
  FY2018-19 annual report; operator-declared public statutory record.
  Independent PDF verification is **NOT_CLAIMED**.
- **Dates:** board announcement 2018-07-13; shareholder approval 2018-08-22;
  intimation filed 2018-08-24; ex-bonus 2018-09-04; record date 2018-09-05;
  **allotment/effective 2018-09-06** (the canonical `effectiveDate`).
- **Terms:** 1 new ₹5 share for every 1 held; shares
  2,184,127,091 → 4,368,254,182; ₹1,092 crore capitalized from reserves.
  The treasury-trust exclusion note is preserved in the source as stated; no
  trust allocation was inferred (no contract semantics exist for it).

## 2. Canonical transcription (step 3)

`probe/build_infosys_bonus_event.py` (re-running reproduces the input
byte-for-byte) copies the admitted Infosys financial input byte-for-byte and
adds `corporate-actions.json` with one record: `CA-INFY-BONUS-2018-09-06`,
`BONUS`, effective 2018-09-06, `perShareComparable: false`,
**`adjustmentFactor: 0.5` — derived, not guessed**: the contract's
pre→post per-share multiplier equals pre/post share count under the declared
1:1 ratio, and the supplied counts double exactly (paid-up capital at ₹5
face value and the ₹1,092 crore capitalization reconcile to the rupee;
`runs/03-derived-handchecks.json`). Announcement/approval/ex/record dates
have no canonical fields and remain in the source evidence; `successors` is
empty (no successor mapping exists or was inferred).

Successor input digest:
`sha256:aa414045de21c6833aa57035768da14f92a302bfaaaac48767a28647e8954c52`.

## 3. Candidate and real demonstration (step 4)

- **Before/after:** candidate `sha256:3e42d98d…` (`corporateActions: 0`) →
  **`sha256:a7638c6b8f23b067ab84f580805b918aea4b902c8e324026c7c7c942c09f5ab5`**
  (**`corporateActions: 1`**, 13 annual + 4 quarterly periods, 0 issues),
  built by the authoritative CLI and read back with `readDataset`; the action
  reads back byte-faithful (`runs/01`, `runs/02`).
- **Guard fires on the real record:** a calendar-valid demonstration price
  with `adjustment: null` is **refused
  `UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`**, the note naming
  `CA-INFY-BONUS-2018-09-06`; the same price carrying
  `{factor: 0.5, corporateActionId: CA-INFY-BONUS-2018-09-06}` is **accepted**.
  The price leg is a labelled demonstration input; the action is the real
  admitted record.
- **Factor applied:** `adjustPerShareSeries` restates the pre-action point
  100 → **50 (ADJUSTED)** and leaves the post-action point unchanged;
  price/EPS consistency at factor 0.5 is exact.
- **Successor weights:** not applicable (BONUS); **invalid evidence:**
  corrupted variants (negative/zero factor, unknown issuer, invalid date,
  unsupported `DIVIDEND`, duplicate id) are rejected, and the dataset path
  withholds a rejected action file in full. All of this is pinned in
  `iips-platform/tests/investment/s4r8InfosysBonusEvent.test.ts` (9 tests).
  Synthetic suites remain supplementary mechanism evidence, unchanged.

## 4. Status disposition

- **`S4-R8` / `G-8`: CLOSED (2026-11-20)** — roadmap evidence
  (`corporateActions > 0`, real event recorded, candidate re-published and
  read back) is demonstrated. O3 successor admission:
  `docs/integration/IID-O3-S4-R8-INFOSYS-BONUS-SUCCESSOR-ADMISSION-2026-11-20.md`;
  register §17.43.
- **`L-031`: OPEN, narrowed.** Its acceptance limb (guard fires on a real
  declared action; factor applied, not guessed) is now demonstrated. Its
  coverage limb is not met: an operator-declared table covering the Infosys
  window **2024-03-31 → present** (events, or an explicit declaration that no
  per-share-affecting action occurred in that window) is still required — a
  2018 event establishes nothing about that window.
- **Marico / KEC governance: untouched.** Stage 4 remains PARTIALLY COMPLETE;
  IID NOT READY.

## 5. Artifact digests

See `digests.json` (beside this README) for the SHA-256 digest of every file
in this bundle. Candidate bytes live outside the repository and are exactly
reproducible from the three committed inputs via the authoritative CLI at
the pinned clock — reproducibility, not the sandbox path, is the evidence.
