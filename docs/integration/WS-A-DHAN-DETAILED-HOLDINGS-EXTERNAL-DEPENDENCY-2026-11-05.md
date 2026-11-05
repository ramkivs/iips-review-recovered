# WS-A A-5 / A-6 — External identity-data dependency: exact required input and D05 deposition prerequisites

**Record:** `WS-A-DHAN-DETAILED-HOLDINGS-EXTERNAL-DEPENDENCY-2026-11-05`
**Type:** EXTERNAL DEPENDENCY DETERMINATION AND PREPARED PREREQUISITE PACKAGE. Investigation and
documentation only.
**Status:** **`BLOCKED-EXTERNAL` for A-5; `NOT STARTED / PENDING AUTHORITY` for A-6.**
**Nothing was fabricated, reconstructed, synthesized, guessed or deposited.** No identity, ISIN,
symbol, alias or mapping was invented. **The master revision is UNCHANGED.**
**Owner repositories:** A-5 input is **operator-owned**; A-6 deposition is **IPD-owned**
(`ramkivs/iips-production-market-data`). This record is published in IRR and **writes nothing to
IPD**.
**Governing IPD sources (read-only):**
`BLOCK-3L-BROKER-CSV-FULL-RESOLUTION-AUDIT.md` (audit baseline
`d6cb663f37c547bcb7bb42db7a701621ceaa95aa`, `2026-09-22T08:45:00.000Z`, `READ-ONLY AUDIT / NO CODE
CHANGE / NO COMMIT / NO PUSH`) and `evidence/bi04/dhan-web-ui-summary-v1-schema.md` — both verified
present and read at the live pin `7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`.

---

## 1. The dependency, stated exactly

Workstream A's identity spine is blocked on **one external input that does not exist in either
repository and that IRR cannot lawfully produce**:

> **A genuine Dhan *Detailed Holdings* report CSV export from the operator's own account, in the
> governed `DHAN_DETAILED_HOLDINGS_V1` format.**

### 1.1 Exact input specification

| Property | Required value | Source |
| :--- | :--- | :--- |
| Variant identifier | **`DHAN_DETAILED_HOLDINGS_V1`** | `evidence/bi04/dhan-web-ui-summary-v1-schema.md` §2.1 |
| Exact header signature (11 columns, in order) | `Trading Symbol, ISIN, Exchange, Total Qty, DP Qty, Available Qty, Average Buy Price, Last Traded Price, Current Value, Profit / Loss, P&L %` | schema doc §2.1; confirmed identically by BLOCK-3L TASK A row 3 |
| **ISIN column** | **PRESENT** — this is the load-bearing property | BLOCK-3L TASK A: *"**YES** (`ISIN`)"* |
| **Exchange column** | **PRESENT** | BLOCK-3L TASK A: *"**YES** (`Exchange`)"* |
| Characteristics | *"Contains explicit ISIN, Exchange, and full breakdown of depository / trading quantities."* | schema doc §2.1 |
| Provenance | The **operator's own** account export. Not a sample, not a template, not a third-party file, not a reconstruction. | standing instruction; BLOCK-3L recommendation 1 |
| Delivery path | **Browser-local file selection only** — `File.text()` read, **1 MiB cap**, never uploaded to any server, never transmitted to any third party. | merged IRR behaviour |
| Integrity | Ingested **as-is**. No editing, re-ordering, de-duplication, anonymisation, or column addition. The SHA-256 content digest is computed over the **raw CSV bytes**. | schema doc §5 |
| Format exclusions | **XLSX remains explicitly blocked**, deferred to milestone BI-06. **Live providers: 0 active** — offline local fixture execution only. | schema doc §6 |

### 1.2 What IRR will do with it, and what it will NOT do

**Will:** detect the variant; parse deterministically and fail closed; run per-row identity
assessment against the governed D05 master; publish per-row identity evidence; report exact
resolved / unresolved / saved counts and refusal codes.

**Will NOT:** save any row (`W-1` intact — `evaluatePortSaveGuard()` false → `WRITE_NOT_AUTHORIZED`,
`storeEffect 'NONE'`, `savedRows` **0**); relax the P04 quarantine; alter DP-2 Option 2F; change the
dependency pin; write to IPD; or deposit any identity.

---

## 2. Verified current evidence

### 2.1 No such artefact exists, and no acquisition path exists

| Check | Result |
| :--- | :--- |
| `DHAN_DETAILED_HOLDINGS_V1` **data artefact** in IPD | **ABSENT.** The token appears only in **governance/schema/audit prose** (8 files at the live pin: `evidence/bi04/dhan-web-ui-summary-v1-schema.md`, `BLOCK-3L-BROKER-CSV-FULL-RESOLUTION-AUDIT.md`, and related records). **No CSV, fixture or corpus of that variant is present.** |
| `DHAN_DETAILED_HOLDINGS_V1` artefact in IRR | **ABSENT.** The token appears only in the tracker, the WS-A reports and this record — all prose. |
| Dhan **API / login / token / credential** path anywhere in IRR | **NONE.** The only occurrence of the word "Dhan" near any connectivity term is the UI copy that **denies** it: `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx:50` — *"Dhan (Detailed and Web UI), Zerodha and Groww CSV preview. **No broker login or live API connection**."* |
| Authorized acquisition path | **NONE.** There is no server-side fetch, no OAuth flow, no scraper, and no broker session. Acquisition is **operator-mediated by design**. |

**The parser already supports the variant.** The gap is **data**, not capability: the preview UI
advertises *"Dhan (Detailed and Web UI)"*, the schema document governs both variants, and BLOCK-3L
TASK D proves the Detailed path works end-to-end — *"`TCS` (`EQ_TCS_IN`)` … Ingress with Dhan
Detailed (`ISIN: INE467B01029`) → queries `ISIN:INE467B01029` → Returns `EQ_TCS_IN`. Disposition:
**PASS (100% deterministic)**."*

### 2.2 The observed run and its measured result

The run actually observed used the **other** governed variant, `DHAN_WEB_UI_SUMMARY_V1`, whose
canonical header is `Name, Quantity, Avg Price, Last Traded, Investment, Current Value, P&L, P&L %`
and which **omits both ISIN and Exchange** (BLOCK-3L TASK A row 1: ISIN *"**NO** (Omitted)"*,
Exchange *"**NO** (Omitted)"*).

Measured result at the live pin (fixture
`frontend/server/broker-import/__fixtures__/dhan-web-ui-summary-68.csv`,
`asOf 2026-11-05T07:50:49.090Z`):

```
disposition                  PARSED_UNRESOLVED
nativeRows                   68
identityAssessedRows         68
identityResolvedRows          1     (row 1: AGI GREENPAC → EQ_AGI_IN, via governed alias)
identityUnresolvedRows       67
savedRows                     0     (W-1 intact)
saveable                   false
refusalCodes                 { NO_AUTHORITATIVE_IDENTIFIER_MATCH: 67 }
perRowIdentityEvidencePublished  true
warnings                      0
masterRevision  BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001:7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5
authority       IPD_GOVERNED_D05_SECURITY_MASTER  (2,250 entities; operatorId OPERATOR_ADMIN_GOVERNED_01)
```

Exchange scoping was proven correct and non-speculative: `BSE → ['BSE_SYMBOL']`,
`NSE → ['NSE_SYMBOL']`, ISIN → `['ISIN']`, with **no speculative fallback**; join by 1-based
`rowIndex`; `companyId` not exposed; record digest `3f519e1c…30f4` stable across 3 processes. The
whole-import refusal names row 2 (`ASK AUTOMOTIVE`, `UNMAPPED_IDENTIFIER … BSE_SYMBOL`) — the same
security BLOCK-3L audited as its first failure case.

### 2.3 The governed master's composition — why 67 of 68 failed

From BLOCK-3L's Failure Classification Matrix and Definitive Finding, at baseline `d6cb663f…`:

| Universe segment | Records | Resolution rate | Failure mode |
| :--- | :--- | :--- | :--- |
| Governed Nifty Top-50 equities | 50 | **100.0% (50/50)** | none |
| Governed SteerCo equities (`AIIL`, index 20) | 1 | **100.0% (1/1)** | none |
| Governed alias equities (`AGI`, index 21) | 1 | **100.0% (1/1)** | none |
| Governed synthetic Tier-2 equities (`IT0001`…`CON2198`, indices 52–2249) | 2,198 | **100.0% (2198/2198)** | none |
| **Total governed D05 master universe** | **2,250** | **100.0% (2250/2250)** | **zero defects** |
| **Non-D05 equities** (`ASK AUTOMOTIVE`, `AMBUJACEM`, `HCLTECH`, …) | real market equities | **0.0% (0 resolved)** | **`D05_ABSENT` (P04 fail-closed)** |

BLOCK-3L's definitive answer to its own core question — *"Are the failed securities genuinely absent
from D05, or are securities that ARE present in D05 systematically failing to resolve?"*:

> *"The failed securities are **GENUINELY ABSENT** from the D05 master package. Every security that
> **IS** present in D05 resolves with **100% precision**. There is **ZERO** systematic failure among
> present securities."*

And its Key Insight: *"`AIIL` succeeds not because of any broker-ingress bypass, but because `AIIL`
was explicitly added as Record 20 of the governed D05 master package alongside the SteerCo Ruling 3
dual BSE scrip mappings."*

**So the 67 failures are not an IRR defect, not an IPD defect, and not a resolution bug.** They are
the P04 fail-closed guard working exactly as designed against a master that contains **52 real
Indian equities** (50 Nifty constituents plus `AIIL` and `AGI`) and **2,198 synthetic Tier-2
records**. A genuine 68-row personal portfolio drawn from the wider Indian market is therefore
**expected** to be overwhelmingly absent.

> **Composition caveat — do not over-read "52 real".** The tracker's existing finding **C-02**
> already reconciles this: §18.1 row 25's *"2,250 canonical entities, 52 real + 2,198 synthetic"* is
> an **aggregate** statement, and **no governed D05 record carries a per-record `REAL`
> classification** — all 2,250 are `UNCLASSIFIED` / `UNKNOWN origin`. The aggregate split is not
> per-record truth. This record cites BLOCK-3L's composition as BLOCK-3L states it and adopts C-02's
> qualification without re-litigating it.
>
> **And do not conflate the two classification axes.** The mapper's `sourceClassification`
> (`'REAL'` / `'UNCLASSIFIED'`, the subject of finding I-6 in the A-10 package) classifies the
> **provenance of the imported holdings data**. C-02's classification concerns the **origin of D05
> master records**. They are different axes; a change in one is not evidence about the other, and no
> inference between them is drawn or authorized here.

### 2.4 Precision correction to a previously recorded statement

Earlier WS-A records state that **0 of the 67** unresolved securities exist in the governed D05
corpus, having been probed *"wider than the master"* by normalized company name, listing symbol,
`nseSymbol` and `bseSymbol`. That statement is **correct as to the index space actually probed**, and
it should be qualified as to the space that could not be probed:

| Index space | Probeable from the observed run? | Result |
| :--- | :--- | :--- |
| Normalized company name | **YES** | 0 of 67 |
| Listing symbol | **YES** | 0 of 67 |
| `nseSymbol` | **YES** | 0 of 67 |
| `bseSymbol` | **YES** | 0 of 67 |
| **`isin`** | **NO — structurally impossible.** `DHAN_WEB_UI_SUMMARY_V1` omits the ISIN column, so the 67 rows carry **no ISIN to probe with**. | **UNTESTED, not tested-and-absent** |
| `COMPOSITE_TICKER` | Partially (derivable only where exchange is known; the variant omits `Exchange`) | Not independently established |

`MappingStore` populates four indices — **ISIN, NSE_SYMBOL, BSE_SYMBOL, COMPOSITE_TICKER** (BLOCK-3L
TASK D pipeline). Three of the four were exercised in symbol space. **The ISIN index was never
reachable from this input.**

**This does not weaken the conclusion**, for two independent reasons: (a) BLOCK-3L establishes
**genuine absence** for the specific securities audited, with zero systematic failure among present
entities; and (b) the composition argument makes near-total absence the expected result regardless of
lookup path. But the **evidence class must be stated accurately**: the finding is a **symbol-space
measurement plus a composition inference**, not an ISIN-space measurement. Recording it otherwise
would claim row-level ISIN evidence that does not exist — which the standing instructions forbid.

---

## 3. Why A-5 is strictly required before A-6 — the load-bearing argument

It would be a mistake to treat A-5 as "just another file that might resolve the rows". Measured
against BLOCK-3L, its role is different and more specific:

1. **A-5 will NOT, by itself, resolve the 67 rows.** Switching from `DHAN_WEB_UI_SUMMARY_V1` to
   `DHAN_DETAILED_HOLDINGS_V1` changes the **mapper path** from `SYM → NSE → BSE` to the `ISIN`
   lookup. It does **not** create presence in the master. Since BLOCK-3L establishes that the
   failures are **genuine D05 absence** and that **every** present entity already resolves at 100%,
   a Detailed export of the same portfolio would be expected to fail on the same securities — by
   `ISIN` instead of by `BSE_SYMBOL`.
2. **What A-5 uniquely supplies is authoritative ISINs.** The Detailed variant's ISIN and Exchange
   columns are the **only** lawful source of the identifiers that an A-6 deposition must carry. The
   D05 record shape requires `companyId`, `isin`, `nseSymbol`, `bseSymbol` and (where applicable)
   `bseScripCode` — BLOCK-3L TASK D records them explicitly, e.g. *"`RELIANCE` … D05 Record: Index 0,
   `companyId: EQ_RELIANCE_IN`, `isin: INE002A01018`, `nseSymbol: RELIANCE`, `bseSymbol: RELIANCE`,
   `bseScripCode: 500325`"*.
3. **Without A-5, any A-6 deposition would have to invent ISINs.** That is forbidden three times
   over: by the standing instruction (*"no name similarity, guessed ISINs, inferred symbols,
   synthetic mappings or unsupported aliases"*); by the schema doc §4 (*"Under NO circumstances is a
   `companyId` fabricated from the raw `Name` string, nor is any non-deterministic guessing
   permitted"*); and by BLOCK-3L recommendation 1 (*"Do not disable P04 identity resolution, **do not
   add ad-hoc un-governed aliases, and do not fabricate raw symbols**"*).
4. **Therefore `A-5 → A-6` is a strict sequence, and A-6 is provably required.** A-5 converts an
   unresolvable name-only input into a set of **authoritative ISIN identifiers**; A-6 is the only
   lawful route by which those identifiers can enter the governed master. Neither can be skipped,
   reordered, or substituted by inference.

**Corollary, stated so it is not mistaken for progress:** obtaining A-5 will most likely **not**
raise the resolved count materially. Its value is that it makes A-6 **possible and non-fabricated**.
Any expectation that a Detailed export alone resolves the 67 rows is **not supported by the
evidence** and should not be recorded as a plan.

---

## 4. A-6 — IPD-owned D05 deposition prerequisites

**A-6 is IPD-owned. IRR has no write authority in `ramkivs/iips-production-market-data`** (prior HTTP
403 confirmed; the boundary is respected). Everything below is a **prepared prerequisite package for
IPD and the PA**, published in IRR. **No deposition was performed, attempted, simulated or
drafted as data.**

### 4.1 The instrument IPD's own audit already names

BLOCK-3L's *"Recommended Next Diagnostic & Operational Action"* item 3 is the precedent, verbatim:

> **"Future Tier-2 Master Expansion:** If real mid-cap/small-cap equities (such as `ASK AUTOMOTIVE`,
> `AMBUJACEM`, `HCLTECH`, `M&M`, `ZOMATO`) are required for institutional coverage, they should be
> **formally deposited and governed under a future authorized Security Master Expansion Act**
> (e.g. `AUTH-D05-EXPANSION-ACT-WAVE2`)."

The governing precedent already executed is
**`AUTH-D05-BROAD-UNIVERSE-MASTER-EXPANSION-ACT-2026-09-22-001`**, which produced the current master
revision **`BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001`** (file checksum SHA-256
`7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5`, `recordCount` **2250**,
`operatorId` **`OPERATOR_ADMIN_GOVERNED_01`**), verified at the live pin.

**A-6 therefore requires a NEW authorization act of the same class — a Wave-2 expansion act.** The
existing act is spent: it authorized the 2026-09-22 batch, not a future one. **No Act ID is assigned
or claimed by this record.**

### 4.2 Prerequisites, in order

| # | Prerequisite | Owner | State |
| :--- | :--- | :--- | :--- |
| **PR-1** | A genuine `DHAN_DETAILED_HOLDINGS_V1` export exists (= **A-5**) and has been ingested as-is, with its raw-byte SHA-256 recorded. | **Operator** | **NOT MET — the blocking external dependency.** |
| **PR-2** | Per-row identity assessment run at the live pin; the **exact residual set** of unresolved rows published row-by-row with `rowIndex`, `Trading Symbol`, **`ISIN`**, `Exchange` and refusal code. | IRR | Cannot start before PR-1. The machinery exists and is proven (`perRowIdentityEvidencePublished: true`). |
| **PR-3** | Each residual identity **independently corroborated** against an authoritative external source before deposition. An ISIN appearing in a broker export is **necessary but not sufficient**; the deposit must not rest on the export alone. | IPD / operator | Cannot start before PR-2. |
| **PR-4** | A **new** Wave-2 Security Master Expansion Act, PA-rendered, naming the Act ID, the batch id, the exact record set, the operator id and the effective date. | **PA (Ramki)** | **NOT RENDERED. Act ID PENDING ASSIGNMENT.** |
| **PR-5** | IPD-side deposition into the governed corpus: `evidence/operator_drop/d05_security_master_broad_universe.json` (or a new Wave-2 corpus file) plus `d05_security_master_manifest.json`, producing a **new master revision** with a new `batchId` and new `fileChecksumSha256`. | **IPD** | **NOT STARTED. IRR must not and cannot perform this.** |
| **PR-6** | A new governed **manifest** recording `recordCount`, `operatorId`, checksum and provenance — the same shape as the current manifest. | **IPD** | Not started. |
| **PR-7** | Re-run of the 68-row (or Detailed-variant) assessment at the **new** master revision, with exact before/after resolved counts published. | IRR | Cannot start before PR-5. |
| **PR-8** | **A-7** — downstream consumption of the newly resolved identities. | IRR | Blocked by A-6. |

### 4.3 What must NOT be deposited

Restating the standing constraints as explicit deposition exclusions, so the IPD-side act can adopt
them verbatim:

1. **No guessed ISINs.** An ISIN not present in a genuine broker export and independently
   corroborated must not be deposited.
2. **No inferred symbols.** `nseSymbol` / `bseSymbol` must not be derived from a company `Name`
   string by similarity, abbreviation, tokenisation or any heuristic.
3. **No synthetic mappings.** No `companyId` may be minted to make a row resolve. Schema doc §4
   forbids it in terms.
4. **No unsupported aliases.** The `AGI GREENPAC` alias that resolves row 1 exists because it was
   **explicitly governed** (BLOCK-3L Key Insight, SteerCo Ruling 3). An alias is admissible only by
   act, never by convenience.
5. **No `bseScripCode` invention.** Where a scrip code is not authoritatively known, the field must
   be omitted, not populated.
6. **No back-filling of the 67 from the observed run.** The `DHAN_WEB_UI_SUMMARY_V1` rows carry **no
   ISIN**; depositing identities derived from their `Name` column alone is exactly the fabrication the
   guards exist to prevent.
7. **No P04 relaxation, no fail-closed weakening, no quarantine bypass** to make rows resolve.
8. **Rows that cannot be authoritatively established stay UNRESOLVED, and the gap is stated.** That is
   the correct governed outcome, not a failure.

### 4.4 The master revision is UNCHANGED

Current master revision, verified at the live pin `7bcae35` and unchanged by this record:

```
BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001
fileChecksumSha256  7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5
recordCount         2250
operatorId          OPERATOR_ADMIN_GOVERNED_01
act                 AUTH-D05-BROAD-UNIVERSE-MASTER-EXPANSION-ACT-2026-09-22-001
```

**No change to the master revision is authorized or performed here.** A new revision requires PR-4
and PR-5.

---

## 5. A-6 validation plan

Prepared so that deposition, once authorized, can be validated without further design. **Nothing
below has been executed.** Staged, fail-closed, and each stage gateable.

| Stage | Validation | Pass criterion | Owner |
| :--- | :--- | :--- | :--- |
| **V-1** | **Input authenticity.** Verify the supplied file's header signature byte-for-byte against the governed 11-column layout; verify variant detection returns `DHAN_DETAILED_HOLDINGS_V1`; record raw-byte SHA-256. | Exact header match; detection unambiguous (not `UNKNOWN`); digest recorded. | IRR |
| **V-2** | **No-fabrication gate.** Assert that every ISIN and Exchange value in the residual set originates from a parsed CSV cell, and that no value was defaulted, inferred or synthesized. | 100% of deposited identifiers traceable to a cell coordinate (`rowIndex`, column). Any untraceable value **fails the stage**. | IRR |
| **V-3** | **Independent corroboration.** Each residual identity corroborated against an authoritative external source, with the source and retrieval coordinate recorded per row. | Every row corroborated, or **explicitly left unresolved with the gap stated**. No row passes on broker export alone. | IPD / operator |
| **V-4** | **Act conformance.** The Wave-2 act names the Act ID, batch id, exact record set, operator id and effective date; the deposited set equals the named set. | Set equality between act and corpus; zero unnamed records; zero unacted records. | PA / IPD |
| **V-5** | **Manifest integrity.** New `d05_security_master_manifest.json` carries a new `batchId`, new `fileChecksumSha256`, correct `recordCount` and `operatorId`. | Checksum recomputes over the corpus bytes; count equals the record count; revision string well-formed. | IPD |
| **V-6** | **No-regression on the existing 2,250.** Re-run BLOCK-3L's control set (`RELIANCE`, `TCS`, `INFY`, `HDFCBANK`, `AIIL`, `AGI GREENPAC`, plus the synthetic universe sample) at the new revision. | **2,250/2,250 still resolve at 100%.** Any regression **fails the deposition**. | IPD |
| **V-7** | **No-collision gate.** Assert no new record collides with an existing `companyId`, `isin`, `nseSymbol`, `bseSymbol` or `COMPOSITE_TICKER`. | Zero collisions. A collision must raise `AMBIGUOUS_COLLISION`, never silent overwrite. | IPD |
| **V-8** | **Fail-closed preserved.** Assert `UNMAPPED_IDENTIFIER` and `AMBIGUOUS_COLLISION` still halt ingress with `REJECTED`, and that P04 quarantine behaviour is byte-unchanged. | Guards intact; no new bypass path. | IPD / IRR |
| **V-9** | **End-to-end re-run at the new revision.** Re-ingest the operator's export at the new master revision; publish exact before/after resolved counts and per-row evidence. | Counts published; **`savedRows` remains 0** unless a separate write authority exists (it does not). | IRR |
| **V-10** | **Remote read-back.** The merged IPD state read back independently by byte identity; the IRR consumption decision recorded separately. | Read-back matches. **Note: read-back is not authorization to advance the IRR pin** — that is a separate decision (see §6). | IRR |

**Targeted tests only**, and only for files actually changed. No broad regression suite is run
without a specific gate requirement; V-6 reuses BLOCK-3L's already-established control set rather
than inventing a new one.

---

## 6. Dependency consequences and boundaries

### 6.1 The spine

```
A-5  operator supplies a genuine DHAN_DETAILED_HOLDINGS_V1 export      BLOCKED-EXTERNAL
 └─▶ A-6  new Wave-2 D05 deposition under a new PA authorization act    NOT STARTED / PENDING AUTHORITY
      └─▶ A-7  downstream consumption of newly resolved identities      BLOCKED by A-6
```

The recorded spine **stands unchanged**. §3 refines the *reason* it is strict — A-5 supplies
authoritative ISINs rather than resolutions — but does not alter the order, and no re-ordering is
proposed or authorized.

### 6.2 Independence from A-10 and A-8

This spine is **independent** of both other outstanding authorities:

- **A-10** (PA-09 Gate 4 pin designation) does not unblock A-5/A-6. No pin designation creates the
  missing export or authorizes a deposition. See
  `WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md` §9.
- **A-8** (U1 §8 evidence-route amendment) does not unblock A-5/A-6 either. See
  `WS-A-EVIDENCE-RETRIEVAL-ROUTE-U1-S8-AMENDMENT-PACKAGE-2026-11-05.md` §8.

**WS-A-DM therefore has three independent outstanding dependencies**, of which this is the only one
whose head is **outside the PA and outside both repositories** — it requires the operator.

### 6.3 Effect on the milestone

WS-A-DM **pillar 1** criterion **1.7** requires the A-5 → A-6 chain and is **`BLOCKED-EXTERNAL`**.
Pillar 1 cannot be satisfied by any IRR or IPD action alone. **WS-A-DM is NOT COMPLETE**, and per its
own non-completion rule, fixture-scoped persistence and journal restart recovery — both in hand — are
**necessary and not sufficient**.

### 6.4 The IRR pin is deliberately NOT advanced

IPD `main` has moved to `6df748d397daf965bd5b6e6e35df5043f7fa8c4d` (PR #126, merged
`2026-11-05T08:49:54Z`, ~6 minutes after PR #127). The measured movement is **5 commits, 16 files,
+4,740 / −0, all additions**, entirely `windows-setup/` plus root report and manifest files; the
restricted diff over `package.json`, `frontend/src/features/portfolio/import`, `src/identity` and
`src/contracts` is **empty**; the publish profile is identical; and the blob ids of all six consumed
modules are identical (`broker-identity-assessment.ts` = `401af803…` at both).

**The pin at `7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc` is valid, unaffected and UNCHANGED.** No
advance is required by A-5/A-6, and none is performed. Any future advance is a **separately
authorized and evidenced** change, not a consequence of this record.

---

## 7. What this record does not do

1. It **does not fabricate or reconstruct** a genuine Dhan detailed holdings export. No CSV was
   written, generated, templated, sampled or approximated.
2. It **does not deposit** guessed identities, synthetic mappings, unsupported aliases, inferred
   symbols or guessed ISINs. **Nothing was deposited anywhere.**
3. It **does not change the master revision.** `BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001` /
   checksum `7f53540b…74b5` / `recordCount 2250` stands.
4. It **does not claim the 67 identities are resolved**, resolvable, or that their ISINs are known.
   §2.4 records precisely which index space was tested and which was **not**.
5. It **does not write to IPD.** All IPD facts were obtained read-only. The prior HTTP 403 boundary is
   respected.
6. It **does not relax** P04, `W-1`, Gate 4, Gate 5 or DP-2 Option 2F, and does not assign or claim
   an Act ID for the Wave-2 expansion.
7. It **does not modify** BLOCK-3L, the BI-04 schema document, the D05 corpus or manifest, or any
   prior WS-A record. All are preserved; the precision correction at §2.4 is recorded **additively
   here**.
8. It **does not advance** the dependency pin, reopen A-1…A-4 / A-16 / A-17, or touch IRR PR **#438**.
9. It **does not initiate** production work, a real-user save, an HTTP route implementation, or any
   live broker connectivity. **No Dhan API, login or token path exists, and none was created.**

---

## 8. Action-register effect

| Action | Status before | Status after this record | Blocking on |
| :--- | :--- | :--- | :--- |
| **A-5** | `BLOCKED — operator export required` | **`BLOCKED-EXTERNAL — INPUT SPECIFICATION COMPLETE AND PUBLISHED`**. Exact variant, header signature, provenance, delivery path and integrity requirements specified (§1.1); absence of artefact and of any acquisition path verified (§2.1); the strict A-5 → A-6 argument established from IPD's own audit (§3). | **The operator (Ramki).** No IRR or IPD action can substitute. |
| **A-6** | `NOT STARTED / PENDING AUTHORITY` | **`PREPARED — PREREQUISITES AND VALIDATION PLAN COMPLETE; PENDING AUTHORITY`**. Eight prerequisites PR-1…PR-8 rendered with owners (§4.2); the required instrument identified from BLOCK-3L recommendation 3 as a **new Wave-2 Security Master Expansion Act** (§4.1); eight deposition exclusions stated (§4.3); ten-stage validation plan prepared (§5). | **PR-1 (= A-5), then PA (Ramki) for PR-4, then IPD for PR-5/PR-6.** |
| **A-7** | `BLOCKED by A-6` | **Unchanged — still BLOCKED by A-6.** | A-6. |

**Neither A-5 nor A-6 is closed.** WS-A-DM pillar 1 criterion 1.7 remains **`BLOCKED-EXTERNAL`**.
**Workstream A and milestone WS-A-DM are NOT COMPLETE.**
