# Windows Personal Portfolio — Operator-Reported Test Report (14 Steps)

- **Record type:** DOCUMENTATION-ONLY operator-reported test report
- **Date recorded:** 2026-11-08
- **IRR repository:** `ramkivs/iips-review-recovered`
- **IPD repository:** `ramkivs/iips-production-market-data`
- **Authority:** none claimed or exercised. This record renders no new authority, changes no
  runtime code, admits no route, and moves no gate.
- **Acceptance state:** **OPERATOR-REPORTED ONLY — NOT ACCEPTED.** See §1 and §9.

## 1. Provenance limit (read this first)

The results in §3 were **reported by the operator** as having been executed on their own Windows
machine. **Arena did not access that host, did not observe any step, and did not rerun any step** in
producing this record. Nothing here is an independent Arena verification claim.

Every result below is transcribed as the operator stated it. Where Arena could check a claim against
repository source or tests, the check and its outcome are recorded in §4. Where Arena could not check
it, the item is recorded as **UNVERIFIED — operator-attested** and left that way.

**No failed, partial or unverified result has been converted into a PASS in this record.** The
operator's summary of **10 PASS / 1 FAIL / 2 PARTIAL / 1 NOT PASSED** is preserved exactly.

### 1.1 There is no committed 14-step checklist

A search of the IRR tree found **no committed definition** of this 14-step sequence. The step names
(`REPLACE operation`, `Stale revision conflict`, `Named pipe verification`, `Personal Portfolio`,
`Preview only — not saved`) do not appear together in any document, and no file enumerates 14
acceptance steps of this shape. The checklist therefore exists **only in the operator's report**, and
is reproduced in §3 as supplied. This is recorded as a limitation of the run, not as a defect of the
product: the run has no version-controlled definition of what it was testing.

### 1.2 Baseline context, recorded rather than assumed

| Item | Observed at record time |
|---|---|
| IRR authoritative `main` | `820e7efced6800ec077c021d1c7fafaeb093e1fc` |
| IPD authoritative `main` | `de8756de1d7d4082e8e144dadf3fb53373b711c6` |
| IRR's IPD dependency pin | `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19` |

IPD `main` has advanced past IRR's pin (`de8756de…` vs pinned `59fdfd1…`). The operator run did not
record which coordinates the host was running, so **the exact implementation exercised is not
established**. This record does not attribute the run to a specific commit of either repository.

## 2. What this record is, and is not

**It is:** an operator-reported test report of one acceptance attempt, with provenance limits, the
checklist as supplied, every result verbatim, and the discrepancies found during reconciliation.

**It is not, and must not be read as:**

- product acceptance, or acceptance of any single step;
- Gate 4 QE evidence (Gate 4 remains `AUTHORIZED — NOT STARTED`, **QE 0/11**);
- Gate 5 admission (remains `NOT INITIATED / NOT ADMITTED`);
- any movement of DQ-4 (remains **8/10**), D06 admission, or any other downstream gate;
- evidence that broker holdings were saved, may be saved, or that save is authorized;
- evidence that `/api/user-portfolios` write admission exists or should exist.

## 3. The 14 steps, as supplied and reported

| # | Acceptance check | Operator result | Arena reconciliation |
| :-- | :-- | :-- | :-- |
| 1 | Provider startup | **PARTIAL** — named pipe listening; final startup `ok` outcome not captured | Evidence-capture gap. `/api/health` returns `status:'ok'` (`frontend/server/executive-transport.ts:1058`); a startup marker is a harness concern, not captured. |
| 2 | Named pipe verification | **PASS** | **UNVERIFIED — operator-attested.** Named-pipe verification is IPD-side; not observable from IRR. |
| 3 | IRR transport health | **PASS** — HTTP 200 | Consistent with source at `executive-transport.ts:1058`. |
| 4 | Vite proxy health | **PASS** — HTTP 200 | Consistent with source: `frontend/vite.config.ts` proxies `/api` → `127.0.0.1:8787`. |
| 5 | Personal Portfolio page | **FAIL** — required "Preview only — not saved" copy absent | **FAIL upheld.** See §5. |
| 6 | Create portfolio | **PASS** — revision 1 | **PASS recorded with endpoint UNKNOWN.** See §6. |
| 7 | Retrieve portfolio | **PASS** — HTTP 200, revision 1 | Consistent with admitted read route (`user-portfolio-transport.ts:39,178`). |
| 8 | REPLACE operation | **PASS** — operator confirms successful completion | **PASS recorded with endpoint UNKNOWN.** See §6. |
| 9 | Stale revision conflict | **NOT PASSED** — HTTP 400 `invalid-request`, not expected HTTP 409 | **NOT PASSED upheld.** Genuine defect. See §7. |
| 10 | Dhan CSV preview | **PASS** — 68 native rows, 3 resolved, 65 unresolved, 0 saved | **Divergence preserved as UNRESOLVED.** See §8. |
| 11 | Evidence retention and duplicate submission | **PARTIAL** — first retention confirmed; duplicate conflict test unavailable because the current UI no longer exposes the submission control | **PARTIAL upheld.** Test-design limitation. See §4.3. |
| 12 | Retrieve retained evidence | **PASS** — HTTP 200; retrieved record digest matched receipt digest | Consistent with source (`src/api/brokerEvidenceRetention.ts:58-68`, A-9 GET + digest compare). |
| 13 | Restart durability | **PASS** — after restarting all three services, portfolio retrieval returned HTTP 200, revision 2 intact | **UNVERIFIED — operator-attested**, but consistent with real cross-process restart tests (`server/broker-import/brokerImportLiveEvidence.test.ts`, SIGKILL + two distinct PIDs). Not rerun. |
| 14 | Delete portfolio | **PASS** — deletion completed; subsequent GET returned HTTP 404 | **PASS recorded with endpoint UNKNOWN.** See §6. |

**Operator summary, preserved exactly: 10 PASS, 1 FAIL, 2 PARTIAL, 1 NOT PASSED.**

## 4. Additional operator-supplied evidence

Recorded verbatim. **None of these values is committed anywhere in the repository** — Arena grepped
the full tree for both strings and found **zero** occurrences. They are operator-supplied and
**UNVERIFIED**.

| Item | Value |
| :-- | :-- |
| Retained Dhan import ID | `87abe0fe3db23b6bbdb19898bb939eebdcc2393c0cdd3bcecd86ad11896a22f0` |
| Receipt / record digest | `61d9c8b4aa5e3fd8145f328e1f50550cd3428daff8c93430e6c0aa9c34d20803` |

#### 4.1 Addendum (2026-11-09) — retention of THIS import remains UNVERIFIED

Re-verified on 2026-11-09 against the authoritative IPD `main` and the IRR tree. The **status
above is unchanged and is not upgraded**: these two values are still operator-supplied and
unverified. The import ID occurs **exactly once** in the whole repository (the row above) and the
receipt digest occurs **not at all**.

**Actual retention of this specific import cannot be confirmed.** The artifacts required are
unavailable, and each is unavailable for a stated, non-recoverable reason:

| Missing | Why it is required | Why it cannot be recovered here |
| :-- | :-- | :-- |
| The operator's original CSV bytes (or their SHA-256) | `contentDigest` is `sha256(raw bytes)`, and the import ID is derived from it | Raw bytes are never retained by design (`docs/OPERATOR_RUNBOOK.md` §10.2). IRR holds only a **reconstructed** fixture whose digest (`c44e3cdb…`) **differs** from the operator's observed digest (`468441df…`) |
| The operator's `readAt` wall-clock timestamp | Third input to the import ID; not derivable | The browser clock at file selection. Recomputing with the IPD `asOf` (`2026-11-08T05:49:40.000Z`) or the fixture `asOf` (`2026-11-05T07:50:49.090Z`) yields `2a6a84c5…`, `d3097726…`, `79695627…`, `5f4adb0e…` — **none** equals `87abe0fe…` |
| The operator host's `journal.ndjson` (or the retained record) | The artifact the receipt digest `61d9c8b4…` was computed over | Host-local only; no copy is in the repository |
| The operator host's owner carrier and IPD binding | Owner scope is required to read the record at all | Host-local; the runbook's §3.3 re-materialisation is deterministic but was not performed for that host |
| The responding endpoint for the run | Whether the operator's UI reached IRR or IPD is recorded as **UNKNOWN** | The operator did not capture it; this record does not infer it |

**The UI's "Evidence retention unconfirmed" status is NOT a defect and is not resolved by this
addendum.** That string is the `UNCONFIRMED` state — *no outcome was established* — and it is
explicitly **not** proof that no append occurred, because an append may have succeeded before an
acknowledgement was lost. The implementation behind it was traced and verified: the browser and the
server derive the import identifier identically
(`sha256(broker ‖ 0x00 ‖ contentDigest ‖ 0x00 ‖ readAt)`), the POST and GET routes resolve the
owner scope through the same act-fixed carrier, and the record digest is re-verified on every read.
Real cross-process retention is demonstrated by the existing
`server/broker-import/brokerImportLiveEvidence.test.ts` (real HTTP POST → SIGKILL → second OS
process GET, matching digests). **That is proof of the mechanism; it is not proof that THIS
import was retained.** No substitute evidence was created.

One boundary is worth stating for the operator: the UI's "Check retained evidence" control
recomputes the import identifier from the **in-memory snapshot of the current selection**, so it can
re-check only an import made in the same browser session. Recovering a **known** import identifier
after browser loss is not reachable through the UI — `docs/OPERATOR_RUNBOOK.md` §11.2 states this
("Copy the displayed import ID if recovery after browser loss is needed … there is no enumeration
endpoint"). The operator's Step 11 ambiguity in §4.3 above is therefore structural, not a defect,
and its disposition there is unchanged.

Other operator statements, recorded as supplied:

- Portfolio **revision 2** survived a restart of all three services and was then deleted as Step 14 requires.
- The Dhan import **remained evidence only; no broker holdings were saved.**
- **No database, carrier, or persistence repair was performed.**

### 4.3 Note on Step 11 (retention / duplicate submission)

The operator's stated cause is confirmed by source: retention is **automatic on file selection**
(`src/features/broker-holdings/BrokerHoldingsPreview.tsx:52-62` calls `retain(...)` inside
`select()`), and the two manual controls render only while `retention.state !== 'VERIFIED'`
(`:126`), so they disappear once the first retention auto-verifies. A *manual* duplicate submission
is therefore not reachable through the UI as written, by design (the retention design record
specifies explicit lookup/retry with no automatic retry loop).

The duplicate/conflict semantics themselves **are** implemented and covered at the HTTP layer
(`server/broker-import/brokerImportEvidenceSubmission.ts:67` → `409 EVIDENCE_CONFLICT`;
`brokerImportHttp.ts:223` → `409 REVISION_CONFLICT`;
`brokerImportLiveEvidence.test.ts:87-102` asserts 409 on changed filename, changed row values and
changed portfolio). The **capability is implemented; the acceptance step is not executable through
the UI as written.** PARTIAL is the correct disposition and is not raised.

## 5. Step 5 — FAIL upheld, with the ambiguity stated

The exact required string exists at `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx:80`:

> `<strong>Preview only — not saved.</strong> Durable portfolio saving remains unavailable.`

It is the **only** occurrence in `src/`, and **no test asserts it**. The other portfolio surfaces do
not carry it — `UserPortfolioList.tsx:96` and `UserPortfolioDetail.tsx` use different, read-only
wording. There is **no "Personal Portfolio" page, route or label** in the repository; the navigation
labels are "Portfolio" (`src/app/navigation.ts:24`), "Broker Holdings" (`:35`) and
"User Portfolios" (`:36`).

Two readings remain possible and the record does not choose between them:

1. If Step 5 targeted the **broker preview**, the copy is present and the FAIL is a page misidentification.
2. If Step 5 targeted a **"Personal Portfolio"** page, the FAIL is correct and reflects **missing UI wiring**, since no such surface exists.

The operator clarified the Step 10 surface but **not** the Step 5 surface. **FAIL is upheld and is
not reclassified.**

## 6. Steps 6, 8, 14 — PASS recorded with the responding endpoint UNKNOWN

Per the operator's clarification, **the responding write-service endpoint was not captured during
the run.** It is recorded as **UNKNOWN**, and this record **does not infer** whether it was IRR or IPD.

This matters because the value is genuinely undetermined from the evidence, and the source makes it
non-obvious:

- IRR's transport **admits no write**. `frontend/server/user-portfolio-transport.ts:145-148` refuses
  `context`, `write`, and any non-`GET`/`HEAD` method with **503 `operation-not-admitted`**. `POST`
  create, `PUT` holdings (REPLACE), `DELETE` and `POST` reset are all refused.
- `frontend/vite.config.ts` proxies **all** `/api` to IRR's transport on `127.0.0.1:8787`.

So these three steps **cannot** have been served by IRR at that port, but **this record does not
conclude they were served by IPD either** — that is an inference the evidence does not license, and
the operator explicitly declined to make it. The originating service for Steps 6, 8 and 14 is
**UNKNOWN** and is recorded as an open evidence gap.

## 7. Step 9 — NOT PASSED upheld; a genuine defect, cause recorded

Expected HTTP 409, observed **HTTP 400 `invalid-request`**. Two independent candidate causes were
identified in source and recorded. This record does **not** claim which one occurred, because the
request body was not captured.

**(a) Validation-ordering / range mismatch.** IPD's v2 framing requires `expectedRevision ≥ 1` and
validates it *before* any conflict comparison:

```ts
// IPD src/ipc/protocol.ts:387
if (typeof expectedRevision !== 'number' || !Number.isSafeInteger(expectedRevision)
    || expectedRevision < 1 || expectedRevision > V2_MAX_SAFE_INTEGER) {
  refuseV2('payload.expectedRevision must be a safe integer within 1..9007199254740991');
}
```

IRR's validator is more permissive and **admits 0**:

```ts
// IRR frontend/server/user-portfolio/userPortfolioContract.ts:422-424
export function isValidExpectedRevision(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}
```

**(b) Save-mode mismatch.** IPD v2 rejects any mode other than `MERGE`
(`src/ipc/protocol.ts:391`), while IRR's contract lists both `MERGE` and `REPLACE`
(`userPortfolioContract.ts:181`) and its header comment claims v2 (`:87`).

Either path produces a **400 domain/framing refusal before the conflict comparison** at
`portfolio_store.ts:1087` can yield a 409. This is a **genuine implementation defect** — a contract
and validation skew between IRR and its pinned dependency — recorded so it can be fixed under its own
authorization. No fix is made by this record.

## 8. Step 10 — discrepancy preserved as an UNRESOLVED finding

**Operator (clarified): the run used `DHAN_WEB_UI_SUMMARY_V1`, and the retained evidence confirms
68 rows, 3 resolved, 65 unresolved, 0 saved.**

Committed evidence says something different:

| Source | Native | Resolved | Unresolved | Saved |
| :-- | --: | --: | --: | --: |
| `src/api/brokerHoldingsPreview.test.ts:226-228` | 68 | **1** | **67** | 0 |
| `evidence/integration/ws-a-dhan-68-row/preview-outcome.json` (pre-fix run) | 68 | 0 | 68 | 0 |
| **Operator run (this record)** | **68** | **3** | **65** | **0** |

The committed test fixture is **byte-identical** to
`evidence/integration/ws-a-dhan-68-row/dhan-web-ui-summary-68-reconstructed.csv` (verified: 69 lines,
identical content), and the UI does display these counters
(`BrokerHoldingsPreview.tsx:135-137`), so 3/65 was genuinely rendered.

Because the surface format is now confirmed as identical to the committed fixture, the earlier
"different CSV variant" explanation is **excluded**. The divergence is therefore a real, unexplained
difference of **+2 resolved / −2 unresolved** against committed evidence, on the same declared input
format.

Possible causes not established by evidence — recorded as hypotheses only, not conclusions: a
different governed security master or master revision, a different IPD pin, or an uncommitted
difference in the host's working tree.

**This record preserves the discrepancy as UNRESOLVED. It is not reconciled, not averaged, and not
attributed to a benign cause.** Step 10's operator PASS is recorded as the operator's result on their
own host; it does **not** reproduce against committed evidence, and that tension is the finding.

### 8.1 Addendum (2026-11-09) — the discrepancy is now reconciled; the text above is preserved verbatim

**The finding above was correct to leave the cause open at the time, and the cause is now
established.** The reconciliation is recorded in full in
`docs/integration/WS-A-68-ROW-IDENTITY-ASSESSMENT-RECONCILIATION-2026-11-09.md`; this addendum
records only the closure and does not alter any statement above.

The cause is the **governed master revision on the operator's host**, and nothing else:

| | IRR `main` at the time | Operator host |
|---|---|---|
| IRR's IPD pin | `58fc8fb7…` (Wave-1 corpus) | `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19` |
| IPD revision observed | — | `de8756de1d7d4082e8e144dadf3fb53373b711c6` |
| D05 corpus carried | Wave-1, **2,250** records | **authenticated**, 2,390 records |
| 68-row result | 1 resolved / 67 unresolved | **3 resolved / 65 unresolved** |

`de8756de…` contains `src/identity/d05_authenticated_universe_data.ts` — the D05 authenticated
universe — and is a descendant of IPD commit `60cad83` ("D05 one-time replacement: authenticated
runtime activation + full test re-pin"). The authenticated corpus carries **GHCL** and **KROSS**
natively in addition to the governed **AGI GREENPAC** alias, which is exactly the operator's
**+2 resolved / −2 unresolved** delta. IPD's own commit message records the same outcome: *"68-row
Dhan intake: resolves AGI GREENPAC (governed alias) + GHCL + KROSS; 65 stay UNRESOLVED."*

**Therefore the operator's 3/65 was correct for the master their host was running, and IRR `main`'s
1/67 was correct for the master IRR was pinned to. Neither number was wrong, and no defect,
malconfiguration, format difference or working-tree difference is involved.** The divergence was
**not** benign by assumption — it is benign by identified cause.

The three results for these 68 positions are now separated by their
`(master revision × supplied-identifier set)` coordinates. In particular, the separate
PA-authorised **§9-A ISIN-scoped reassessment (65 resolved / 3 unresolved)** is **not** an outcome of
this CSV: `DHAN_WEB_UI_SUMMARY_V1` supplies no ISIN and no exchange, so the ISIN namespace is never
queried on this surface. That result comes from the B-04 companion export and is recorded by IPD
in `evidence/integration/ws-a-dhan-68-row/identity-outcomes-reassessment-2026-11-08.json`.

**Closure:** the discrepancy is **RECONCILED** with its cause identified. The three residual rows
unresolved under the §9-A reassessment (rows 44 `INE721I01024`, 51 `INE583V01021`, 63
`INE562X01013`) are **universe-scope exclusions** that correctly fail closed `UNMAPPED_IDENTIFIER`;
their governance dispositions are unchanged and no identity was invented, mapped or bypassed.

## 9. Launcher identity — recorded, not adopted

Operator-supplied identity:

```
G:\iips-review-recovered-e0cc7bd\scripts\start-personal-portfolio.ps1
```

The operator corrected **one unmatched closing brace locally** to allow PowerShell parsing, and this
correction **was not committed or published**.

Arena verified the following about this artefact:

- `scripts/start-personal-portfolio.ps1` **does not exist at IRR `main`**, and no file with that name
  has **ever** existed in IRR history (`git log --all --diff-filter=A` → zero matches).
- No `scripts/` directory exists at `HEAD`.
- The commit fragment `e0cc7bd` is **not an object in IRR** (0 of all objects, 0 of all commits) and
  is **absent from all 11 `ramkivs` repositories** via the GitHub API (HTTP 422 on every one).
- Therefore the working tree named in the path **cannot be identified** from this repository.

**Consequence, recorded as a finding:** a required acceptance precondition (the three-service
launcher) exists only on the operator's machine, at an unidentifiable commit, and required a local
hand-patch to parse. It is an **uncontrolled artefact**. This record records it and does **not**
adopt it, reconstruct it, or commit a replacement.

## 10. Disposition

| Question | Answer |
| :-- | :-- |
| Is this a valid operator-reported test report? | **Yes**, for documentation purposes only, subject to §1 and §11. |
| Is any step accepted? | **No.** No step is accepted, closed or converted to PASS. |
| Are the FAIL / PARTIAL / NOT PASSED results preserved? | **Yes**, all four, verbatim. |
| Does this move any gate? | **No.** Gate 4 (QE 0/11), Gate 5, DQ-4 (8/10), D06 admission all unchanged. |
| Does this authorize broker save? | **No.** The P04 whole-import refusal and the write fence are untouched. |
| Was any repository outside IRR modified? | **No.** Zero IPD writes. |

## 11. Open items this record does NOT close

Each requires its own separately authorized work item. None is actioned here.

1. **Step 5 target surface is undetermined** — broker preview vs a non-existent "Personal Portfolio"
   page. Needs an operator clarification or a corrected checklist (§5).
2. **Steps 6/8/14 responding endpoint is UNKNOWN** — needs capture of the responding service and
   port on the next run (§6).
3. **Step 9 validation/contract skew** — IRR `expectedRevision >= 0` vs IPD `>= 1`; IRR advertises
   `REPLACE` against a `MERGE`-only v2 frame. A genuine code defect requiring its own authorization (§7).
4. **Step 10 divergence (+2 resolved / −2 unresolved)** — unexplained against committed evidence on
   the same declared surface; needs the host's master revision and IPD pin captured (§8).
5. **Step 11 not executable through the UI** — either an acceptance-harness affordance or a rewritten
   step testing the conflict path where it already works (§4.3).
6. **Launcher artefact uncontrolled** — needs committing (or its identity captured) before any repeat (§9).
7. **No committed 14-step checklist** — the next run needs a versioned definition (§1.1).
8. **Run coordinates not captured** — IPD `main` (`de8756de…`) has moved past IRR's pin
   (`59fdfd1…`); the host's exact commits were not recorded (§1.2).

## 12. Boundaries honoured

Documentation only. No runtime code, test, route, fixture, manifest, lockfile or pin changed. No
route admitted, no fence relaxed, no gate advanced, no broker-save authorization created or implied.
No database, carrier, journal or persistence repair. No acceptance step rerun. No successful write
repeated. No data deleted or recreated. Zero IPD writes. PR #515 and PR #516 untouched.
