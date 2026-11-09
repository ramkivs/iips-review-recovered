# WS-A — 68-row Dhan identity-assessment reconciliation (Items 4 and 7)

**Date:** 2026-11-09. **Type:** read-only reconciliation and IRR-owned correction. Not a qualification, not an admission, not a PA act.
**IRR baseline:** `main` @ `7a330588df8e4ef3dc6ef5d948366bd101931d39` (includes PRs #535, #536). PR #537 is **OPEN and unmerged** at this baseline.
**Authoritative IPD `main`:** `709fd13c77e90df05900859d23ba57d1004197a0` (merge commit of IPD PR #145).
**IPD was inspected read-only. No IPD writes, no PR merges, no production work, no acceptance claim.**

---

## 1. Item 4 — the three distinct results, established and separated

Three different numbers have circulated for the same 68 positions. They are **not** three
measurements of one thing, and none supersedes another. Each is a different
`(master revision × supplied-identifier set)` pair evaluated by the **same, unchanged** governed
resolution path.

| # | Master | Identifiers supplied | Resolved | Unresolved | Authority |
|---|---|---|---|---|---|
| R1 | **Empty** `SecurityMaster` (misconfiguration) | name only | 0 | 68 | IPD `identity-outcomes-authenticated-2026-11-08.json`, run `EMPTY_SECURITY_MASTER` |
| R2 | **Legacy Wave-1** (2,250 records, `AUTH-D05-BROAD-UNIVERSE-MASTER-EXPANSION-ACT-2026-09-22-001`) | name only | **1** | **67** | same artifact, run `GOVERNED_B_06_WAVE1_MASTER` |
| R3 | **D05 authenticated** (2,390 records, `AUTH-D05-REPLACEMENT-AUTHENTICATED-UNIVERSE-ACT-2026-11-08-001`) | name only | **3** | **65** | same artifact, run `GOVERNED_AUTHENTICATED_MASTER_2026-11-08` |
| R4 | D05 authenticated (2,390 records) | **ISIN**, from the B-04 companion export | **65** | **3** | IPD `identity-outcomes-reassessment-2026-11-08.json`, §9-A execution |

R1–R3 are **three runs inside one authoritative IPD artifact**, over the same reconstructed
68-row surface, whose own `scope` field states:

> *"The reconstruction built from rows.json (name surface verbatim; **no ISIN/exchange supplied**)
> is re-assessed through the unchanged pipeline. Wave-1 outcomes archived at
> identity-outcomes.json are untouched."*

### 1.1 The identifiers that separate R3 from R4

`DHAN_WEB_UI_SUMMARY_V1` carries **no ISIN and no exchange column**. This is recorded in IRR's own
committed evidence (`evidence/integration/ws-a-dhan-68-row/rows.json`, every row carries
`sourceIsin: null` and `sourceExchange: null`) and is visible in the fixture itself
(`frontend/server/broker-import/__fixtures__/dhan-web-ui-summary-68.csv`, columns:
`Name,Quantity,Avg Price,Last Traded,Investment,Current Value,P&L,P&L %`).

With no ISIN and no exchange, the governed path can only attempt exact-key lookups in the
`NSE_SYMBOL` and `BSE_SYMBOL` namespaces against the plain-English display name. IPD's own
root-cause investigation states this plainly:

> *"It queried `NSE_SYMBOL:=sourceName` then `BSE_SYMBOL:=sourceName` (both `UNMAPPED_IDENTIFIER`)
> because `suppliedIsin=null` and `suppliedExchange=null` in every row. Under the UNSCOPED
> exact-key discipline this is the **correct, governed outcome**, not an implementation failure. No
> lookup was *attempted* against the ISIN namespace because the input contract never carried one."*
> — IPD `IIPS_V3_D05_B06_ROOT_CAUSE_INVESTIGATION_2026-11-08.md`, §F-5

**R4 is therefore NOT a result obtained from the Web UI Summary CSV.** It is a §9-A reassessment
of *committed evidence already in the IPD repository*: the B-04 companion broker export
`evidence/operator_drop/wave2-2026-11-06/source.csv` (SHA-256
`2dc1d1fba6e183cfa657652d0dab98daac570df6e3ef3adbbc8f2a397fcabd0d`), which carries an ISIN column
for all 68 positions, joined 1:1 to the observed surface by case-insensitive normalized display
name (IPD F-2: *"ALL 68 rows joined 1:1, zero unmatched, zero duplicate ISINs"*).

### 1.2 Why R3 is 3 and not 1

The three rows that resolve under R3 resolve because their **display name coincides with a
verbatim governed key or a governed effective-dated alias** — a namespace-equality accident the
fail-closed path correctly exploits, exactly as IPD records:

> *"The three currently-RESOLVED rows (1 AGI GREENPAC, 21 GHCL, 40 KROSS) resolved only because
> their supplied identifiers … coincide with a verbatim governed key or a governed effective-dated
> alias. They are not evidence that the rest were 'almost resolvable'; they are evidence of a
> namespace-equality accident the fail-closed path correctly exploits."*
> — IPD root-cause investigation §6

Under the **Wave-1** corpus (R2) only `AGI GREENPAC` resolves (via the governed AGI alias);
`GHCL` and `KROSS` are not carried. The **authenticated** corpus (R3) carries all three natively.
No row was resolved by name similarity, and no alias, mapping or corpus entry was added by IRR.

### 1.3 The three rows that remain unresolved under R4 — dispositions preserved

R4's three residual rows are **universe-scope exclusions**, not identity failures. IPD's
disposition is recorded and is reproduced here verbatim:

| Row | Position | ISIN | Why it fails closed | Disposition |
|---|---|---|---|---|
| 44 | NATIONAL STOCK EXCHANGE OF INDIA | `INE721I01024` | BSE-only ACTIVE group A equity `544937`; NSE of India has no NSE CM EQ listing | `UNMAPPED_IDENTIFIER`; requires a new governance decision (universe scope), not a technical fix |
| 51 | RADHIKA JEWELTECH | `INE583V01021` | NSE series **BE**, BSE group **T**/SME — outside the authorized NSE CM EQ scope | `UNMAPPED_IDENTIFIER`; same |
| 63 | UNIVASTU | `INE562X01013` | NSE series **BE**, absent from BSE active-equity | `UNMAPPED_IDENTIFIER`; same |

All three fail closed with `UNMAPPED_IDENTIFIER`. IPD's own record states the disposition
unchanged: *"the universe retained at 2,390 NSE CM EQ securities; **no aliases/exceptions/
alternative mappings**; `saveable=false`; zero persisted."* **No identity was invented, no mapping
was added, no qualification was bypassed, and no corpus was altered.** The three rows remain
visible, refused and quantifiable.

### 1.4 The 62-row reconciliation, preserved

R4's 65 = the 62 in-scope rows newly resolvable once an ISIN is supplied, **plus the 3 rows already
resolved under R3** (whose canonical identities `EQ_AGI_IN`, `EQ_GHCL_IN`, `EQ_KROSS_IN` are
preserved). IPD records the per-row verification: *"All 62 in-scope positions resolved using exact
ISIN against `GOVERNED_AUTHENTICATED_MASTER_2026-11-08` … per-row outcomes verified row-by-row
against investigation Appendix A, 62/62."*

**R4 did not change the corpus, did not add an alias, and did not make any row resolvable by name.**
It supplied the identifier the original surface lacked, through the pre-existing ISIN-first lookup
path, under a PA-authorized one-time act.

---

## 2. The IRR-owned defect this reconciliation corrects

### 2.1 An unexplained divergence was on record

`docs/integration/WINDOWS-PERSONAL-PORTFOLIO-OPERATOR-TEST-REPORT-2026-11-08.md` §8 recorded the
Windows operator's result — **68 native rows, 3 resolved, 65 unresolved, 0 saved** — against IRR
`main`'s committed test assertion of 1/67, and preserved it as:

> *"a real, unexplained difference of **+2 resolved / −2 unresolved** against committed evidence,
> on the same declared input format. … **This record preserves the discrepancy as UNRESOLVED. It
> is not reconciled, not averaged, and not attributed to a benign cause.**"*

### 2.2 The cause is now established

The same report records the operator host's dependency state: IRR's IPD pin was
`59fdfd157632dbdbc220ae03d9d0b8e047d4ef19` and IPD `main` was at `de8756de`. That IPD revision
**contains the D05 authenticated universe**:

| Fact | Verification |
|---|---|
| `de8756de1d7d4082e8e144dadf3fb53373b711c6` contains `src/identity/d05_authenticated_universe_data.ts` | `git ls-tree -r de8756de` → present |
| `de8756de` is a descendant of the authenticated-universe commit `60cad83f227d7d3728d03ba5617e38d34b87c8c0` | `git merge-base --is-ancestor` → yes |
| IPD's authenticated corpus carries `GHCL` and `KROSS` natively | IPD `60cad83` commit message: *"resolves AGI GREENPAC (governed alias) + GHCL + KROSS; 65 stay UNRESOLVED"* |
| The operator's **+2 / −2** delta is exactly `GHCL` + `KROSS` | The operator's 3 resolved rows are AGI GREENPAC, GHCL, KROSS |

**The divergence was not a defect, a misconfiguration, a format difference, or an unexplained
phenomenon. It was a different governed master revision on the operator's host** — the
authenticated corpus (2,390) against IRR `main`'s Wave-1 corpus (2,250). The operator's result was
correct for the master they were running; IRR's committed assertion was correct for the master
IRR was pinned to. Both numbers are now explained and neither is wrong.

### 2.3 What is corrected in IRR

IRR-owned material corrected in this work item — **and nothing else**:

1. **The IRR test/assertion layer** now asserts the counts that correspond to the **pinned** master
   (3/65 at the authenticated pin `709fd13`, carried by PR #537), and the per-row expectations name
   the three resolved positions explicitly so a future corpus change cannot silently alter the
   meaning of the assertion. Focused regression coverage is added for exactly this.
2. **The IRR documentation layer** now records all four results with their
   `(master × identifiers)` coordinates, so the §9-A 65/3 result can no longer be misread as the
   outcome of the Web UI Summary CSV, and the 3/65 result can no longer be read as superseded.
3. **The operator report's §8 UNRESOLVED divergence** is annotated (additively) with this
   reconciliation and its cause, so the historical record is preserved and the open finding is
   closed with its evidence rather than left unexplained.

**Not changed:** the 68-row CSV fixture (byte-identical), any identity mapping, any governance
disposition, the three unresolved rows' refusals, the authenticated master, IPD, the W-1
authorization surface, or any Gate 4 / Gate 5 material. IRR resolves no identity itself; it
publishes IPD's outcomes verbatim.

---

## 3. Item 7 — actual Broker Import evidence retention

### 3.1 What the implementation does (traced and verified)

| Property | Finding | Evidence |
|---|---|---|
| Import identifier derivation | Client and server compute it **identically**: `sha256(broker ‖ 0x00 ‖ contentDigest ‖ 0x00 ‖ readAt)`. Client: `frontend/src/api/brokerEvidenceRetention.ts` `evidenceImportId()`. Server: `frontend/server/broker-import/brokerImportEvidenceStore.ts` `computeImportId()`. | Direct source comparison |
| Evidence reference used by the UI | The UI recomputes the import ID **from the same frozen snapshot** (`asOf` + `contentDigest` + `broker` are frozen by value in `freezeEvidenceSubmission`) and GETs `/api/broker-import/:portfolioId/evidence/:importId`. It does **not** guess, enumerate, or use a stale ID. | `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx`, `brokerEvidenceRetention.ts` |
| Owner scope | Both POST and GET resolve the owner through the **same** act-fixed carrier (`resolveBrokerEvidenceOwnerContext(env)`) and the same `resolveDataDir(env)`. Scope is never taken from a header, cookie, token or query value. | `brokerImportEvidenceSubmission.ts:47`, `brokerImportHttp.ts:449,458` |
| Digest integrity | The record digest is re-verified server-side on **every** read; a tampered record is refused, never served and never silently reported absent. | `brokerImportHttp.ts` clause 15; `BrokerImportEvidenceError` → 503 |
| UI state fidelity | Seven distinct states; `ACKNOWLEDGED_UNVERIFIED` ("retention acknowledged; retrieval not verified") is correctly separated from `UNCONFIRMED` ("retention unconfirmed"). | `BrokerHoldingsPreview.tsx:120-124` |

### 3.2 Retention that is genuinely demonstrated

`frontend/server/broker-import/brokerImportLiveEvidence.test.ts` performs a **real HTTP** POST of
the **real 68-row CSV**, SIGKILLs the serving process, starts a **second OS process**, and GETs the
record by import ID. Observed proof from this work item:

```
LIVE_HTTP_RESTART_PROOF {"importId":"d3097726b7d55b6b58ec894e06dbe2c29f716073c07b2d351e4bb904d8624191",
 "contentDigest":"c44e3cdb06e2d49f88c46d61867444f8a301cdf71a068b0e3aa1d748e6d52f31",
 "recordDigest":"ff3bbdb9d28189378531de5776edde7f1d69e7ebed156059a583718d539fa8e2",
 "readAt":"2026-11-05T07:50:49.090Z","rows":68,"ownerUserId":"owner-4dc756b3",
 "firstPid":10756,"secondPid":10768,"firstExitSignal":"SIGKILL","journalBytes":26214,
 "retryJournalUnchanged":true,"retrieval":"VERIFIED"}
```

This is a **synthetic, temporary** store (`mkdtemp`) with a generated owner scope. It proves the
**mechanism**; it is **not** the previously discussed import.

IRR also retains a **real** evidence record from its own 2026-11-05 run, committed at
`evidence/integration/ws-a-dhan-68-row/evidence-record.sample.json`:

| Field | Value |
|---|---|
| `importId` | `d3097726b7d55b6b58ec894e06dbe2c29f716073c07b2d351e4bb904d8624191` |
| `recordDigest` | `3090e61f057b112673991b2c6ec56b1adba5b77bd4d1aa8edd752b08a11cd545` |
| `contentDigest` | `c44e3cdb06e2d49f88c46d61867444f8a301cdf71a068b0e3aa1d748e6d52f31` |
| `readAt` | `2026-11-05T07:50:49.090Z` |
| rows | 68 |
| counts | 68 native / **0 resolved** / 68 unresolved / 0 saved (pre-fix pass) |

The digest was **independently recomputed** from the record's own fields using IRR's canonical JSON
scheme and **matches exactly** (`3090e61f…`). The record is internally consistent and verifiable
from the repository. Its originating store (`/tmp/ws-a-evidence-sample-NwJvVT`) was temporary and
**no longer exists**, so it is a **committed evidence sample**, not a live retained record.

### 3.3 The specific import from the prior discussion — NOT verifiable, and not claimed

The operator's import is identified in
`docs/integration/WINDOWS-PERSONAL-PORTFOLIO-OPERATOR-TEST-REPORT-2026-11-08.md` §4:

| Item | Value |
|---|---|
| Retained Dhan import ID | `87abe0fe3db23b6bbdb19898bb939eebdcc2393c0cdd3bcecd86ad11896a22f0` |
| Receipt / record digest | `61d9c8b4aa5e3fd8145f328e1f50550cd3428daff8c93430e6c0aa9c34d20803` |

That report already records these as **operator-supplied and UNVERIFIED**, and states that
*"None of these values is committed anywhere in the repository … they are operator-supplied and
UNVERIFIED."* Re-verified in this work item: the import ID occurs **exactly once** in the whole
tree (that report row) and the digest **not at all**.

**Actual retention of that import cannot be confirmed from this repository or this host.** The
exact missing artifacts and identifiers are:

| # | Missing artifact | Why it is required | Why it is unavailable |
|---|---|---|---|
| M1 | The operator's **original CSV bytes** (or their SHA-256) | `contentDigest` is `sha256(raw bytes)`; the import ID is derived from it | The raw file is never retained by design (`docs/OPERATOR_RUNBOOK.md` §10.2: *"The **raw CSV bytes are not retained**"*). IRR holds only a **reconstructed** fixture whose digest (`c44e3cdb…`) **differs** from the operator's observed digest (`468441df…`) — recorded in IRR's own evidence README: *"no artefact here claims it equals the observed digest."* |
| M2 | The operator's **`readAt` wall-clock timestamp** | It is the third input to the import ID and is not derivable | It is the browser clock at file selection. Recomputing with the IPD `asOf` (`2026-11-08T05:49:40.000Z`) or the fixture `asOf` (`2026-11-05T07:50:49.090Z`) yields `2a6a84c5…` / `d3097726…` / `79695627…` / `5f4adb0e…` — **none** equals `87abe0fe…` |
| M3 | The operator host's **`journal.ndjson`** (or the retained record) | It is the artifact whose digest `61d9c8b4…` was computed over | Lives on the operator's machine only; no copy is in the repository |
| M4 | The operator host's **owner carrier** and **IPD binding** | Owner scope is required to read the record at all | Host-local; the runbook's §3.3 re-materialisation is deterministic but was not performed here |
| M5 | The **responding endpoint** for the run | Whether the operator's UI talked to IRR or to IPD is recorded as **UNKNOWN** | The operator did not capture it; the report declines to infer it |

**Consequence, stated plainly:** whether the original import evidence was retained, whether it can
be retrieved, and whether its digest matches **cannot be established from the available evidence**.
The `61d9c8b4…` receipt digest is **operator-attested, unverified**, and no independent
read-back exists.

### 3.4 The UI's earlier "Evidence retention unconfirmed" status

The UI string *"Evidence retention unconfirmed. Check retained evidence or explicitly retry the
original snapshot."* is the `UNCONFIRMED` state: **no outcome was established** — it is explicitly
**not** proof that no append occurred, because an append may have succeeded before an
acknowledgement was lost. `docs/OPERATOR_RUNBOOK.md` §11.2 states this verbatim.

**Is that status now resolved?** The *status* is a correct, truthful rendering of its own state
machine, and the implementation behind it is verified working (§3.1, §3.2). What is **not**
resolved is the *specific operator import*: the UI's "Check retained evidence" button recomputes
the import ID from the **in-memory snapshot of the current selection**, so it can only re-check
the import it just made in the same browser session. Recovering a **known** import ID from a
previous session is not reachable through the UI — the runbook documents this: *"The mounted page
retains that snapshot in memory, not browser durable storage … Copy the displayed import ID if
recovery after browser loss is needed. A restarted host can retrieve by known import ID; there is
no enumeration endpoint."*

So the accurate disposition is:

- **Implementation and test coverage: verified.** Real HTTP POST → SIGKILL → separate-process GET,
  with matching digests and an unchanged journal on retry.
- **Actual retention of the specific prior import: NOT established.** The artifacts required
  (M1–M5) are unavailable, and no substitute evidence was created.
- **The UI status wording: correct as written** — no correction is warranted. What it says is
  exactly what it means.

### 3.5 No defect found in the Item 7 implementation

The trace found **no IRR-owned defect** in the evidence-retention implementation: the import-ID
derivation matches on both sides, the owner scope is identical on POST and GET, the digest is
re-verified on every read, the UI's state machine distinguishes acknowledgement from verification,
and the documented recovery path matches the implemented one. The only Item 7 outcome is a
**reporting limitation** (M1–M5), which this record states rather than papers over.

---

## 4. Focused regression coverage added

| Test | Asserts | Why |
|---|---|---|
| `frontend/src/api/brokerHoldingsPreview.test.ts` — "resolves GHCL and KROSS natively under IPD's authenticated universe" | Both rows resolve via `NSE_SYMBOL`, with the BSE lookup correctly *not* queried, no quarantine IDs and no refusal code | Pins **which** three rows resolve under the authenticated corpus, so the 3/65 number cannot be satisfied by a different set of three rows |
| `frontend/src/api/brokerHoldingsPreview.test.ts` — "keeps the other 65 rows at NO_AUTHORITATIVE_IDENTIFIER_MATCH…" | Exactly 65 rows unresolved, each with both namespaces queried verbatim and two P04 quarantine IDs; aggregate `refusalCodes` = `{NO_AUTHORITATIVE_IDENTIFIER_MATCH: 65}` | Pins the unresolved population and the refusal, so a corpus change cannot silently alter it |
| `frontend/src/api/brokerHoldingsPreview.test.ts` — the Web UI Summary surface carries no ISIN and no exchange | `isin === null` and `exchange === null` on every row | Makes the **identifier precondition** of R3 an executable assertion, so R3 can never be conflated with the ISIN-based R4 |
| `frontend/server/broker-import/brokerImportEvidenceStore.test.ts` / `…Restart.test.ts` | Retained counts = 3 resolved / 65 unresolved, and the quarantine inventory = 130 records | The **retained evidence** carries IPD's per-row outcomes verbatim, and the count is checked at the retention boundary, not only in the preview |

---

## 5. Boundaries honoured

IRR writes only. IPD inspected read-only (`git ls-remote`, `git log`, `git show`, `git ls-tree`,
`git diff`, `git merge-base`); its working tree is unmodified and its `main` is unchanged at
`709fd13…`. No Dhan API, live market data, authentication or trading work. No identity invented, no
mapping added, no corpus altered, no qualification bypassed. No W-1 authorization change; Gate E
W-1(3)/W-1(4) remain hard-false and `saveable` remains false. No Gate 4 / Gate 5 work. No
production work and no production acceptance claim. No PR merged. No browser-to-IPD durable-save
E2E was started — the retention verification used the existing server-side HTTP surface against a
temporary local store only, which is the AMEND-02 A-9 route exercised in the pre-existing
`brokerImportLiveEvidence.test.ts`, not a durable holdings save.

## 6. Authoritative SHAs cited

| Repository | SHA | Role |
|---|---|---|
| IPD | `709fd13c77e90df05900859d23ba57d1004197a0` | IPD `main`; merge commit of PR #145 |
| IPD | `60cad83f227d7d3728d03ba5617e38d34b87c8c0` | D05 authenticated universe activation (2,390 records) |
| IPD | `73768fa83c331de1bd9f51af0a6b26e5ad489ba2` | PR #145 head; DHAN-P5 freshness |
| IPD | `9fac0051b5003be4dfeb4c973eebfb65d1234361` | PR #145 head; P4 identity HTTP |
| IPD | `b269bfb6bfb607222f1ca82f5a8914de8469b4b2` | Stage 4 identity-qualification implementation |
| IPD | `074b8549b3b5b527d9e62e87b1924b7463cbfc7c` | B-06 root-cause investigation (65 UNRESOLVED rows) |
| IPD | `80ad6d346901c936f1fb3ee98e692ec72851a309` | §9-A ISIN-scoped reassessment execution |
| IPD | `3ac6a5bdfa833360882e4d85f6c0ea5c981160cf` | PA review disposition (append-only) |
| IPD | `de8756de1d7d4082e8e144dadf3fb53373b711c6` | IPD PR #143 merge — the operator host's `main`; contains the authenticated corpus |
| IRR | `7a330588df8e4ef3dc6ef5d948366bd101931d39` | IRR `main` baseline for this work item |
| IRR | `01f9f4d56f5d5a2316ceac07f16d4db9c6061b53` | PR #537 head (dependency alignment) — OPEN, unmerged |
