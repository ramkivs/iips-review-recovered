# Technical Appendix to the PA Decision Paper — Workstream A

**Record:** `WS-A-PA-DECISION-PAPER-TECHNICAL-APPENDIX-2026-11-05`
**Companion to:** `WS-A-PA-DECISION-PAPER-PLAIN-ENGLISH-2026-11-05.md` (the decision paper).
**Purpose:** retain the **formal technical wording** corresponding to each plain-English decision, plus
exact coordinates, measurement evidence and verification methods. **This appendix is for the record,
not for the decision-maker to interpret.**
**Status:** **PREPARED — NOT EFFECTIVE.** No Act ID assigned. No pin designated. No route added. No
identity deposited. No pin changed. **Zero IPD writes.**

> **Relationship to already-published packages.** This appendix **does not duplicate** them. The full
> 25-clause drafted amendment lives in
> `WS-A-EVIDENCE-RETRIEVAL-ROUTE-U1-S8-AMENDMENT-PACKAGE-2026-11-05.md` §3. The full findings,
> candidate tables and obligation analysis live in
> `WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md`. The dependency analysis lives in
> `WS-A-DHAN-DETAILED-HOLDINGS-EXTERNAL-DEPENDENCY-2026-11-05.md`. What follows is the **formal
> wording the PA would render**, and the evidence specific to this paper's recommendations.

---

## A-0. Baselines at authoring (re-censused, not recalled)

| Coordinate | Value |
| :--- | :--- |
| IRR `main` | `2b4a2cee032609805d76298cf33bb66ddd82e96a` (PR #443) |
| IPD `main` | `6df748d397daf965bd5b6e6e35df5043f7fa8c4d`, tree `1c3872bfe368e17245678d15daf1a241aa3602d3` |
| IRR broker-import pin | `7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`, tree `37d3b4f3a567368df785ddf454740fae4a173446` |
| IRR np04 pin | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` |
| IRR production-market-data pin | `279d1eed184f5e23bbabe5c6411085e120ce9e41` |
| Retired broker alias | `70b24f029842a7e9b7f615e4d9df7376fd4ff817` — ancestor, 295 behind IPD `main` |
| Open PRs | **0** IRR, **0** IPD |
| `frontend/package.json` lines 24–26 | **Verified byte-unchanged** at IRR `main` |

---

## A-1. Formal wording for the four Gate 4 decisions

### A-1.1 Decision 1 — PA-09 content-pin designation

The consolidated packet's unfilled wording is reproduced first, then Arena's **extended** form. The
extension is required by finding **I-3**: the adopted H-12 R5 manifest is a **three-coordinate**
instrument, so a single commit/tree/blobs triple cannot discharge §4.6 obligation 6.

**Packet's original wording (unfilled, unmodified):**

> "PA-09: The Gate 4 QE and H-12 content pin is [G4P-1 `a891802e` / G4P-2 / G4P-3 / deferred]. Commit
> `[ ]`, tree `[ ]`, blobs `[ ]`, purpose: Gate 4 Limb A, QE and H-12 content. Non-Limb-A content in
> scope: [accepted / not accepted]. Designation is not Gate 4 execution."

**Arena's proposed extended form (PROPOSED — NOT EFFECTIVE):**

> **PA-09 (RENDERED):** The Gate 4 QE and H-12 **content** pin is **G4P-1**.
>
> **Coordinate 1 — IPD primary QE coordinate:** commit `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`,
> tree `76f083d7058e170d8212455c03bad1033136ee68`.
> **Coordinate 2 — IPD broker-alias compatibility coordinate:** as rendered by Decision 3 below
> (required, because the DQ-6b Path A interim disposition is spent — finding **I-4**).
> **Coordinate 3 — IRR QE consumer coordinate:** IRR `main` at the time of the designation act,
> recorded verbatim by commit and tree in that act. **No future SHA is asserted, guessed or inferred.**
>
> **Purpose:** Gate 4 Limb A, QE and H-12 **content** only.
>
> **Non-Limb-A content in scope: ACCEPTED**, expressly, per Decision 2 (C-1). The out-of-scope paths
> are **named in the designation act** so the reach of the qualification is permanently knowable.
>
> **Express non-coverage statement (mandatory).** The Gate 4 content pin and the IRR broker-import
> consumption pin are **deliberately distinct objects**. Gate 4 qualification makes **no claim** to
> cover the broker-import feature, which is a separate track with its own verified evidence.
>
> **Two-pin distinction (mandatory).** This designation fixes the **content** pin under PA-09. It does
> **not** produce the **QE execution pin** defined by Gate 4 act §3.2(2) as *"the final post-merge
> Limb A commit"*, which per §3.2's Limitation *"cannot exist until Limb A is implemented and
> merged."* Limb A is not implemented. **Designation is not Gate 4 execution.**
>
> **Obligation 5 is a CONDITION SUBSEQUENT** (finding **I-2**): fresh L2a S2 evidence and L2c H-12
> regeneration with full validation are to be produced **at** the designated coordinates **after**
> designation and **before** QE may start. They are not pre-conditions to designation, because they are
> logically impossible before it. PA-10a's T-3 artifact requirement survives the PA-19/PA-20 waivers.
>
> **§3.2(4) discharge.** This designation is the **explicit PA re-designation** required by Gate 4 act
> §3.2(4) on account of measured non-documentary drift in both pinned repositories.
>
> **Not authorized by this designation:** Gate 4 execution; any QE item starting; QE 0/11 → 11/11;
> Gate C or U4 rendering; result acceptance; Gate 5 initiation or admission; any W-1 relaxation; any
> fence lift; any P04 change; any DP-2 Option 2F change; any real-user durable save; any production
> scope; any IPD write; any dependency-pin change; any D05 deposition.

**Measured support for coordinate 1** (see A-4 for method):

| Property | Value |
| :--- | :--- |
| First-parent of IPD `main` | **YES** (merge, PR #100) |
| Check-runs at exact SHA | `executed test count=success ; typecheck · build · test=success` |
| Workflow run at exact SHA | `40640127958` — CI/**push** — success |
| Distance behind IPD `main` | **61** commits |
| Non-evidence delta from live consumption pin `7bcae35` | **34 paths** |
| Non-evidence delta from Limb A pre-binding `a52b47b0` | **7 paths** (all `M`) — the C-1 scope-acceptance set |

### A-1.2 Decision 2 — §4.5 choice: C-1, paired with G4P-1

> **§4.5 (RENDERED): C-1.** The post-binding commit **G4P-1 `a891802e…`** is accepted as the content
> pin **with express scope acceptance of non-Limb-A content**, and H-12 is to be regenerated there.
>
> **Mandatory exclusion (finding I-1).** C-1's **alternative** candidate
> `001c3c80618f2ee1d40e9a90912237e1a06e7b58` is **NOT** designated. Measured: it is **not** a
> first-parent commit of IPD `main` (single parent `8eec74ae`; brought in by merge `1e76f4cf`,
> PR #96); its only workflow run at that exact SHA is `40305148754`, event **`pull_request`**. **No
> post-merge run exists at `001c3c80` itself.** §4.6 obligation 1 requires exact-head **and**
> post-merge green, and Gate 4 act §3.2's Rationale warns that *"a stale pin severs the identity
> between what is tested and what runs."*
>
> **C-2 is NOT selected**: it requires new IPD implementation authority, which is not granted.
> **C-3 is NOT selected**: nothing is scheduled to produce `C′`.
>
> **The Limb A boundary is NOT widened** by this choice for any purpose other than the content-pin
> scope acceptance recorded here.

**The 7 out-of-scope paths to be named in the designation act** (measured, `a52b47b0` → `a891802e`,
`evidence/` and `docs/` filtered):

```
scripts/verify-public-package.mjs
src/persistence/gateAPrimeProvisioning.ts
src/persistence/gateAPrimeValidation.ts
src/persistence/portfolio_store.ts
tests/g3_gate_a_prime_successor_provisioning.test.ts
tests/portfolio_ui_package.test.ts
tests/q1_ipc_read_contract_conformance.test.ts
```

Classification per §4.5's recorded conflict: `portfolio_store.ts` and
`q1_ipc_read_contract_conformance.test.ts` are **DR-2 Option A**; `verify-public-package.mjs` and
`portfolio_ui_package.test.ts` are the **PR #96 (A-Q4)** paths — all outside the Gate 4 §4.2 Limb A
boundary. This **confirms §4.5's recorded conflict by measurement** rather than by assertion.

### A-1.3 Decision 3 — DQ-6b-class alias-coordinate re-render

> **DQ-6b SUCCESSOR (RENDERED): the interim Path A disposition is SUPERSEDED PROSPECTIVELY.** The
> broker-import alias compatibility coordinate of the H-12 qualified baseline now stands at
> **`7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`**, tree
> `37d3b4f3a567368df785ddf454740fae4a173446` — **ratifying the state produced by the PA-commissioned
> advance executed as IRR PR #436, merged `51fdcd9567407db88626b3d5ae87e642f869205a`.**
>
> **This is a RATIFICATION. No coordinate is moved by this act.** The alias already stands at
> `7bcae35`; the IRR dependency pin already names it; no code, version or behaviour changes.
>
> **Findings of fact on which the supersession rests:**
> 1. The alias **was** moved — **with** express PA authority. DQ-6b Path A §3.1(5)'s literal STOP
>    trigger (*"moved **without** authority"*) is therefore **NOT met**.
> 2. The guards were **not relaxed** but **strengthened**: the raw-source presence assertion was
>    replaced by a raw-source **absence** assertion, an 18-published-module identity requirement, and a
>    manifest/lock/resolved triple pin.
> 3. **Option (i), which Path A §3.1(1) declared "technically impossible", was executed successfully.**
>    `TS18003` was resolved IRR-side by materializing the pinned package's published `dist/package`
>    into `.cache/broker-import` and repointing `frontend/tsconfig.broker-import.json`.
> 4. Path A's effectiveness was scoped *"for the interim period only, and only while the guards hold."*
>    Guards V692–V695 no longer hold as recorded (table below). **The interim period is spent.**
>
> **Guard currency, measured:**
>
> | Guard | Currency |
> | :--- | :--- |
> | V692 | **SUPERSEDED** — the 14 alias raw-source paths are present in-tree at `70b24f02` **14/14**, `8eec74ae` **14/14** and `7bcae35` **14/14**, but at `7bcae35` only `dist/package` is published, so they are unreachable via npm. Presence holds; the load-bearing characterization does not. |
> | V693/V694 | **PARTLY RESOLVED** — `src/identity/security_master.ts` (`60030e0c…`) and `src/contracts/types.ts` (`a644c833…`) are **byte-identical at `8eec74ae` and `7bcae35`**. Two of the four divergences are eliminated; the *"two distinct `SecurityMaster` byte-sets"* condition no longer holds for these paths. |
> | V693 residual (**I-5**) | **OPEN** — `broker-holdings-mapper.ts` (`4d0e757b39e3776ad3701e50053696bc52b07b11`) and `broker-import-ingress.ts` (`c8ea9d8fa92b9f8a0ec3d67fbc5fa700e4080899`) carry a **third** distinct byte-set at `7bcae35`, matching neither `70b24f02` nor `8eec74ae`, and are bound by **no** adopted manifest. **Their disposition must be named in the designation act.** |
> | V695 | **CHANGED** — see Decision 4. |
>
> **DQ-6b Path A (`IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01`) is an EFFECTIVE act and is NOT
> rewritten, edited or repealed.** It is superseded **prospectively** by this successor decision, and
> the change of circumstances is recorded **additively**.
>
> **Not authorized:** any further alias movement; any reversion to `70b24f02` (which would break the
> live broker-import feature, since the raw sources are unreachable through modern packaging); any
> dependency-pin change; any IPD write.

### A-1.4 Decision 4 — lineage-classification disposition

> **LINEAGE DISPOSITION (RENDERED).** The authoritative QE lineage classification is
> **`sourceClassification: 'UNCLASSIFIED'`**, at all three mapper sites, as carried by IPD blob
> `4d0e757b39e3776ad3701e50053696bc52b07b11` at the live consumption coordinate `7bcae35`.
>
> **Findings of fact:**
> 1. DQ-6b Path A expressly preserved `'REAL'` ×3 at the alias and recorded *"No reclassification, no
>    re-acceptance, no requalification is authorized or performed."* The R5 `lineage_note` recorded
>    *"REAL is therefore the lineage classification that the DB-C1 preview exhibits."*
> 2. Measured: `'REAL'` ×3 at `70b24f02` (mapper lines 262, 337, 360, blob `6c8ab71dc9230d22d0d3fe9a13e1809371f396e4`);
>    `'UNCLASSIFIED'` ×3 at `8eec74ae` (blob `297e4a593bb575a5f3f8616788f3aa9e599707a4`);
>    **`'UNCLASSIFIED'` ×3 at `7bcae35`** (mapper lines 348, 425, 448, blob `4d0e757b…`).
> 3. **The value is an argument to `computeLineageHash(...)` at all three sites**, so it determines the
>    empty-provenance digest, the per-holding `lineageDigest`, and the final digest.
> 4. **Consequence:** lineage digests recorded from the DB-C1 preview at `70b24f02` are **NOT
>    reproducible** at `7bcae35`. The underlying data is unchanged; the fingerprint ingredient is not.
> 5. **The change was undocumented and undetected.** Verified: the R2 report contains **0** occurrences
>    of `sourceClassification`; `frontend/broker-import-package-profile.json` records no lineage or
>    classification field; **no IRR test asserts the value** — the sole occurrence under `frontend/` is
>    the unrelated `frontend/server/pit/nonProductionPitStore.ts:67` (`'DERIVED'`). It passed PR #436's
>    full validation (`test:ci` **111 files / 1,386 tests / 0 failed**) silently.
> 6. `'UNCLASSIFIED'` is **IPD's own current authoritative value**, merged and CI-green in IPD before
>    the advance. IRR inherited it by consuming the modern published package; IRR did not select it.
>
> **Disposition: ACCEPT `'UNCLASSIFIED'`.** Recorded expressly with all four of the following:
> 1. Pre-advance lineage digests at `70b24f02` are **not reproducible**, and the reason is stated.
> 2. This is **NOT** a re-acceptance of DB-C1.
> 3. This is **NOT** a re-qualification and **NOT** a re-acceptance of any result.
> 4. **No code was changed** to bring this about, and **none is authorized** by this disposition.
>
> **Rejected alternatives.** Restoring `'REAL'` would require modifying **IPD source**, for which no
> authority exists, and would contradict a change IPD already merged. Re-accepting DB-C1 would reopen
> completed work, contrary to the standing instruction.
>
> **Non-conflation clause (mandatory).** The mapper's `sourceClassification` classifies the
> **provenance of imported holdings data**. The existing tracker finding **C-02** concerns the **origin
> of D05 master records** (§18.1 row 25's *"2,250 canonical entities, 52 real + 2,198 synthetic"* is an
> aggregate statement; no governed D05 record carries a per-record `REAL` classification). **These are
> distinct axes. No inference between them is drawn or authorized.**

---

## A-2. Formal wording for the three evidence-route blanks

The full 25-clause drafted amendment is at
`WS-A-EVIDENCE-RETRIEVAL-ROUTE-U1-S8-AMENDMENT-PACKAGE-2026-11-05.md` §3, where the three blanks read
`TBD-PA`. Below is the **formal text that would replace each blank** on the PA's decisions.

### A-2.1 Decision 5 — replaces §8.2(7): owner-context carrier

**The technical necessity, established by measurement** (this is why a new pair is required rather than
reused):

1. `brokerImportEvidenceStore.ts` exposes `read(tenantId, ownerUserId, recordId)`,
   `list(tenantId, ownerUserId)` and `exists(tenantId, ownerUserId, importId)`. **The caller must supply
   both scope keys.** Its governing authority is PF-1 (`IIPS-V3-PF1`, Class C filesystem journal,
   TD-2/TD-3/TD-7a), which states: *"A trusted CALLER is responsible for supplying tenant/owner scope;
   this service is a **library authority, not an HTTP identity or access-control boundary**."*
2. The existing two routes in the namespace resolve owner context via
   `ownerContextFromBinding(readBindingPrecondition(env), env)` requiring `IPD_BINDING_RESOLVED`. That
   module's governing authority is `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §5.1 item 2
   (wire contract v1 OC-1…OC-7), and its provenance rule is: *"The owner … is resolved **by IPD**, per
   request … **IRR does not resolve an owner, does not hold one, and cannot supply one.**"* Its
   `OwnerContext` type carries **no** `applicationUserId`, **no** `tenantId`, no principal, no
   credential and no scope — *"so 'no caller substitution' holds **by construction** rather than by
   validation."*
3. Obtaining the keys from IPD per request would require a **new IPC operation**, forbidden by the U1
   network invariant, and an **IPD change**, for which no authority exists.

**∴ There is no existing source for the two scope-key strings. They must be act-established.**

**Constraint from precedent.** `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01`
§1(2) records: *"F-3 value reuse or aliasing `(irr-domain-4b82d6e1, owner-7f3a91c2)` for Reports is
**explicitly prohibited**. Reports maintains its own distinct ownership declaration and partition
boundary."* §3 establishes a **separate** carrier file named by `IIPS_REPORTS_OWNER_PATH`, *"distinct
from `IIPS_OWNER_CONTEXT_PATH` (F-3)."* **The established principle is one distinct pair, and one
distinct carrier, per route family.**

**Proposed formal text (PROPOSED — NOT EFFECTIVE; values are PA-renderable, not established):**

> **§8.2(7) — Owner-context carrier.** Following the NP-06 R1 Option B carrier shape, the tenant and
> owner literals for this route are **fixed by this act**:
> tenant **`[ irr-broker-evidence-personal ]`**, owner **`[ owner-irr-broker-evidence-personal ]`**.
> The carrier is a **separate** server-owned file named by environment variable
> **`[ IIPS_BROKER_EVIDENCE_OWNER_PATH ]`**, **distinct from** `IIPS_OWNER_CONTEXT_PATH` (F-3) and from
> `IIPS_REPORTS_OWNER_PATH` (NP-06 R1). Reuse or aliasing of either existing pair for this route is
> **prohibited**, on the NP-06 R1 §1(2) principle that each route family maintains its own distinct
> ownership declaration and partition boundary.
>
> **The fifteen NP-06 R1 §2 dispositions apply verbatim to this carrier**, and in particular:
> (3) source identifier is the declared pair; (4) exact 1:1 correspondence, **implicit aliasing or
> translation prohibited**; (5) **fixed 1:1 static mapping**, no dynamic table, no translation engine,
> no lifecycle states; (6) **operator-only** provisioning, client-controlled provisioning prohibited;
> (7) the **Program Authority governs** the declaration, and operator removal or unsetting of the
> carrier **disables the route immediately, failing closed with `503 owner-context-unavailable`**;
> (8) **exactly one** declared tenant, **no guessing, no ambient fallback, no client-selected tenant**;
> (9) owner and tenant values are **governed partition keys, not authenticated identities or
> principals**; (10) they confer **no roles, permissions or privilege escalation**; (11) durable audit
> evidence of establishment, replacement and revocation preserved in the repository and test evidence;
> (12) failure behaviour `503 owner-context-unavailable`, **no data read or changed**, no fallback
> identity, no substitute store; (13) **no credential, authenticated principal or client-supplied
> identity is authoritative**.
>
> **§8.2(8) — Digest binding.** The carrier's canonical bytes are bound by SHA-256, recorded in the
> adopting act's post-merge receipt. The carrier **may never be the origin of a value change**: a change
> requires a **new governed PA act**.
>
> **§8.2(9) — Scope resolution at read time.** The route resolves the binding precondition per
> §8.1(3), then queries the journal **only** with the act-fixed pair. A record whose retained
> `(tenantId, ownerUserId)` does not equal the act-fixed pair is **not returned** and is
> **indistinguishable from absent** (`404`). Foreign-scope invisibility is already asserted by the
> journal's own evidence (`foreignScopeInvisible`) and must be re-asserted for the route.

**Collision verification performed on the proposed literals** (satisfying NP-06 R1 §1(3): *"Literal
uniqueness confirmed: 0 collisions across repository history, F-3 records, and IPD corpus"*):

| Proposed literal | IRR working tree | IRR **full history** (`git log --all -S`) | IPD `main` (`git grep`) |
| :--- | :--- | :--- | :--- |
| `irr-broker-evidence-personal` | **0** | **0** | **0** |
| `owner-irr-broker-evidence-personal` | **0** | **0** | **0** |
| `IIPS_BROKER_EVIDENCE_OWNER_PATH` | **0** | — | **0** |

**For reference — the existing pairs that must NOT be aliased:**

| Family | Tenant | Owner | Carrier setting | Governing act |
| :--- | :--- | :--- | :--- | :--- |
| Platform-wide (F-3) | `irr-domain-4b82d6e1` | `owner-7f3a91c2` | `IIPS_OWNER_CONTEXT_PATH` | `IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01` §4 (blob `f90c9325f49d33f378f3fc0936c28f4979164b2e`, `2026-10-12`); carrier SHA-256 `d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4` |
| Reports (NP-06 R1) | `irr-reports-personal` | `owner-irr-reports-personal` | `IIPS_REPORTS_OWNER_PATH` | `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01` §1 |
| **Broker evidence (PROPOSED)** | **`irr-broker-evidence-personal`** | **`owner-irr-broker-evidence-personal`** | **`IIPS_BROKER_EVIDENCE_OWNER_PATH`** | **NONE — PENDING PA RENDERING** |

### A-2.2 Decision 6 — replaces §8.3(16): retention period and purge rule

> **§8.3(16) — Retention period and purge rule, FIXED BY THIS ACT.** Compaction is **not** built in v1
> (PF-1 **TD-3**), so no period may be inferred from code. This act fixes:
>
> (a) **Retention period: INDEFINITE**, within the server-owned local data directory only
> (`IIPS_DATA_DIR`, TD-7a). Never a Git working tree, never a network store, never a third party, never
> a browser store.
> (b) **Purge rule: EXPLICIT-OPERATOR-ONLY.** No time-based purge. No count-based purge. No automatic
> purge of any kind. Purge occurs **only** on an explicit operator instruction issued outside the HTTP
> surface.
> (c) **Purge basis: NOT APPLICABLE**, no automatic basis being admitted.
> (d) **Purge is NOT reachable from the HTTP surface.** The admitted route is **read-only**; **no
> `DELETE`** is admitted anywhere in the `/api/broker-import/` namespace, and §7.1(1)'s closure is
> preserved.
> (e) **Documented review point.** When the journal exceeds **`[ 50 MB ]`** (value PA-settable), a
> review is recorded in the tracker. **A review is a recorded PA determination, not an automatic
> deletion.**
> (f) **Raw CSV bytes remain NOT retained**, as merged. Any change is a **separate act**, not an
> accommodation.
> (g) **First-retention authority is preserved.** P04 quarantine record ids are process-specific; the
> **first** retention is authoritative and a repeated import returns it unchanged. **This is the reason
> automatic purge is rejected**: deleting a first-retained record would change the value a duplicate
> import returns, silently altering an existing guarantee.

**Rationale recorded in formal terms.** The two competing risks are unbounded local accumulation of
parsed personal financial evidence, versus destruction of the only row-level record of the 67
`NO_AUTHORITATIVE_IDENTIFIER_MATCH` refusals. Mitigating facts, each verified: locality is
server-owned local disk only; **raw bytes are never retained**, so the footprint is the parsed summary;
records are tamper-evident and fail closed with `EVIDENCE_TAMPERED`; foreign scope is already invisible
by test; and no third-party transmission path exists. **In the absence of any third-party exposure, the
audit value of the evidence outweighs the accumulation risk, and accumulation is bounded by review
rather than by silent deletion.**

### A-2.3 Decision 7 — replaces the Act ID

> **Act ID: `[ PA-ASSIGNED ]`.** Proposed form, derived from the conventions surveyed at A-4:
> **`IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`**.
>
> **This is a PROPOSAL for PA assignment. It is NOT assigned, NOT self-assigned and NOT effective.**
> Every occurrence in the drafted amendment reads `PENDING ASSIGNMENT` until the PA renders it.
> Publication coordinates are recorded **exclusively** in the post-merge tracker receipt and are
> **never self-embedded** in the act (§8.7(25)).

**Convention survey** (existing amendment Act IDs, from which the proposed form is derived):

```
IIPS-V3-CAP02-G4-AMEND-01-H12-MEMBERSHIP-2026-10-23
IIPS-V3-CAP02-GATE-A-PRIME-AMEND-01-DESIGNATED-BLOBS-2026-10-28-01
IIPS-V3-G3-AMEND-01-2026-10-22-01
IIPS-V3-G2-IRR-DP1-IDENTITY-CREDENTIAL-TRUST-AMENDMENT-2026-10-16-01
IIPS-V3-CAP03-G4-H12-R5-AMENDED-S8-SUPPLEMENT-2026-10-25-01
```

The U1 act itself is `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01`.
Its §7 additive amendment carried **no separate Act ID** (it was rendered as a section of the act,
companion to composition act `-04`). **`AMEND-01` is therefore the first separately identified
amendment to the U1 act**, which is why the proposed form uses `01` rather than `02`.

### A-2.4 Plain-English ↔ formal wording concordance

| Decision paper (plain English) | Formal instrument |
| :--- | :--- |
| §8.5 "What is being permitted" | Drafted §8 preamble + §8.1(1)–(2) |
| §8.5 "How a request is handled, in order" | Drafted §8.1(3) — C9 first-party signal → `IIPS_G3_IPC_BINDING_PROVISIONED` → `validatePortfolioIdParam` → one scoped journal read |
| §8.5 "What is never revealed" | Drafted §8.1(5) non-disclosure; §8.1(6) `404` indistinguishability |
| §8.5 "What is returned" | Drafted §8.1(6) response surface — evidence fields only, **no canonical `companyId`**, **no raw bytes** |
| §8.5 "What is unchanged" | Drafted §8.1(4) network invariant; §8.5(19)–(23) |
| §8.5 "What this permission explicitly does not allow" | Drafted §8.6(24) |
| §8.5 "When it takes effect" | Drafted §8.7(25) |
| Decision 5 labels | A-2.1 → replaces drafted §8.2(7)–(9) |
| Decision 6 retention | A-2.2 → replaces drafted §8.3(16) |
| Decision 7 reference number | A-2.3 → replaces the Act ID field |

---

## A-3. Findings I-1 … I-8, condensed

Full analysis at `WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md` §7.

| # | Finding | Disposition | Where addressed in the paper |
| :--- | :--- | :--- | :--- |
| **I-1** | `001c3c80` has no post-merge CI run at its own SHA (not first-parent; only `40305148754` CI/`pull_request`; merged via `1e76f4cf`, PR #96). Obligation 1 requires exact-head **and** post-merge green. | Designate a first-parent post-merge coordinate, or expressly waive the literal reading. | Decision 2 §5.5 — **resolved by pairing C-1 with G4P-1 and expressly excluding `001c3c80`** |
| **I-2** | Obligation 5 (L2a/L2c **at** the designated commit) is impossible before designation, yet §4.6 says all six precede it. PA-10a NOT ADVANCED; **T-3 survives the PA-19/PA-20 waivers.** | Confirm obligation 5 is a **condition subsequent**. | Decision 1 §4.3 — **built into the proposed wording** |
| **I-3** | PA-09's single commit/tree/blobs triple cannot designate a **three-coordinate** manifest. **F3** already records an identity split (R5 binds `8eec74ae`/`ba64b2d5`; G4P-1 names `a891802e`). | The act must name **all three** coordinates. | Decision 1 §4.3 — **proposed wording names all three** |
| **I-4** | DQ-6b Path A's interim scope is exhausted; option (i) declared "technically impossible" was executed. | Re-render the alias coordinate — a fresh DQ-6b-class decision, **separate from PA-09**. | Decision 3 §6 — **the whole decision** |
| **I-5** | `broker-holdings-mapper.ts` (`4d0e757b…`) and `broker-import-ingress.ts` (`c8ea9d8f…`) carry a **third** byte-set at the live pin, bound by **no** adopted manifest. | Name the two blobs' disposition in the act. | Decision 3 §6.2, Decision 1 §4.3 |
| **I-6** | Lineage `'REAL'` ×3 → `'UNCLASSIFIED'` ×3 at the live pin, feeding `computeLineageHash` at three sites; **0** occurrences in R2, no profile field, **no test asserts it**. | PA to decide; **not remediable by IRR**. | Decision 4 §7 — **the whole decision** |
| **I-7** | G4P-1 is **61** behind IPD `main` and **34** non-evidence paths from IRR's live pin; the packet's option set predates the advance. | Decide whether the content pin and consumption pin are the same object or deliberately different. | Decision 1 §4.4–4.5 — **resolved by the express non-coverage statement**; option **D (G4P-4)** developed as the alternative the packet lacks |
| **I-8** | Obligation 3 has no artifact: QE **0/11**; the QE matrix is a prepared reference, not a result; no native Windows run; host `desktop-no0nhtp` **unreachable**. | Record designation and execution-readiness as **separate** states. | Decision 1 §4.2, §10.3 |

---

## A-4. Verification methods

No claim in the paper or this appendix rests on recollection. Methods:

| Class | Method |
| :--- | :--- |
| Remote refs | `git ls-remote` on both repositories, re-run at authoring. |
| Commit / tree / ancestry / distance | Blobless bare clone of IPD; `git fetch origin '+refs/heads/*:refs/remotes/origin/*'`; `git rev-parse --disambiguate=<short>` (**never** a guessed SHA tail); `git rev-parse <sha>^{tree}`; `git merge-base --is-ancestor`; `git rev-list --count`; `git rev-list --first-parent origin/main`. |
| CI at exact SHAs | `gh api repos/<owner>/<repo>/commits/<sha>/check-runs` and `…/actions/runs?head_sha=<sha>`. (`gh run list --commit` is unsupported in this `gh` version.) |
| Non-evidence delta classification | `git diff --name-status <from> <to>` with `evidence/` and `docs/` filtered. |
| Blob identity across coordinates | `git rev-parse <sha>:<path>`. |
| `sourceClassification` values | `git show <sha>:frontend/src/features/portfolio/import/broker-holdings-mapper.ts` → `grep -o "sourceClassification: *'[A-Z]*'"` with counts; call-site context via `grep -n -B3 -A2`. |
| Gate 4 act text and blob stability | `git show <sha>:evidence/cross-repository/IIPS_V3_CAP02_GATE4_TARGET_HOST_QUALIFICATION_ACT_EFFECTIVE_2026-10-23.md` at `a891802e`, `7bcae35`, `6df748d3` — blob `66b56fd1584890525a7250aadd7da449def621e5` **identical at all three**. |
| IRR drift and fence attribution | Blobless clone of IRR; `git rev-list --count`; `git diff --name-status`; `git log --format -- <path>` attributing the fence rewrite to `9202e7a` and `e9df332`. |
| Fence current state | Read from `fenceUnchanged.test.ts` and `user-portfolio-transport.ts` at IRR `main` — **authoritative test assertions, not arithmetic**. |
| Drift absence instead of test re-run | `gh api …/compare/51fdcd95…4162a9ea` → **7 files, 0 under `frontend/`**; `git diff --name-status 4162a9ea…bcf0670 -- frontend/` → **4 files**, all NP-06 Reports. PR #436's validation evidence therefore carries forward. |
| Literal collision check | IRR working tree `grep -rl`; IRR full history `git log --all -S<literal>`; IPD `main` `git grep -l -- <literal> origin/main`. |
| Owner-context mechanism | Read `frontend/server/user-portfolio/ownerContextFromBinding.ts` (258 lines) header and constants; `frontend/server/owner-context-carrier.ts` constants; `frontend/server/broker-import/brokerImportHttp.ts` gate; `brokerImportEvidenceStore.ts` / `brokerImportEvidenceWriter.ts` / `brokerImportEvidenceRecoverer.ts` signatures. |
| Recognised-list facts | IPD `BLOCK-3L-BROKER-CSV-FULL-RESOLUTION-AUDIT.md` and `evidence/bi04/dhan-web-ui-summary-v1-schema.md` read at the live pin; `evidence/operator_drop/d05_security_master_manifest.json` parsed for `batchId`, `fileChecksumSha256`, `recordCount`, `operatorId`. |
| Tracker hygiene | Tail assertion before splice; head-30 window compared before/after; `git diff --numstat` and `-U0` deleted-line count; ledger-row uniqueness; merge-marker, CR-byte and trailing-whitespace scans; `git diff --check`; `validate_windows10_host_profile.py` exit code on both baseline and edit. |

**Deliberate non-method.** No broad regression suite was run. No already-passing test was repeated.
Where the absence of change was the relevant fact, drift was measured instead — a stronger and cheaper
claim than a re-run.

---

## A-5. Limits of this appendix

1. **PREPARED — NOT EFFECTIVE.** No Act ID assigned; every drafted field still reads `PENDING
   ASSIGNMENT` or `TBD-PA`.
2. **No pin designated.** Every coordinate is a **measured candidate**, not a designation.
3. **No owner or tenant identity established.** The proposed literals are collision-verified
   **proposals** with no effect. Arena will not invent an owner identity for a personal-financial-
   evidence read path.
4. **No retention period established.** The proposed terms are recommendations.
5. **No route added, exposed, registered or mounted.** No listener created; no IPC operation added.
   `brokerImportHttp.ts` blob `cd0b42d1c7803f9451586194e42c0357135271d2` verified byte-identical from
   `ba64b2d5` to IRR `main` — **unchanged across 456 commits**.
6. **No identity fabricated, guessed or deposited.** The D05 master revision
   `BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001` / `fileChecksumSha256`
   `7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5` / `recordCount 2250` /
   `operatorId OPERATOR_ADMIN_GOVERNED_01` is **UNCHANGED**.
7. **No dependency pin changed.** `frontend/package.json` lines 24–26 verified byte-unchanged.
8. **Zero IPD writes.** All IPD facts obtained read-only.
9. **No earlier record modified.** DQ-6b Path A, the R5 manifest and adoption act, the Gate 4 act, the
   U1 act, the NP-06 R1 act, the gap record, BLOCK-3L and the BI-04 schema are all preserved. Currency
   findings are recorded **additively**.
10. **No completed work reopened.** A-1…A-4, A-16, A-17 untouched. PR #438 (merged `bcf0670`) and the
    Direct P1 integration at `9202e7a` are **preserved, not questioned, not reverted**.
11. **Nothing weakened.** The write fence, W-1, the P04 quarantine, DP-2 Option 2F, Gate 4 and Gate 5
    are unchanged. No production work, no real-user save, no Gate 4/5 acceptance.
12. **Workstream A and milestone WS-A-DM remain NOT COMPLETE**, with three independent outstanding
    dependencies.

---

## A-6. Dated additive note — the PA rendered decisions 5, 6 and 7 (`2026-11-05`)

> **Additive. A-0 … A-5 above are preserved VERBATIM and are NOT amended.** In particular **A-2.1**,
> **A-2.2** and **A-2.3** — the formal wording Arena proposed for the three `TBD-PA` /
> `PENDING ASSIGNMENT` blanks — remain exactly as written, including every proposed literal and the
> statement that each occurrence reads `PENDING ASSIGNMENT` until the PA renders it. That was true when
> written. **What follows records the later state.**

**Instrument of record:**
`docs/integration/IIPS_v3.0_CAP02_U1_AMEND_01_EVIDENCE_RETRIEVAL_ROUTE_PA_DECISION_ACT_2026-11-05.md`,
Act ID **`IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`**.

### A-6.1 Supersession map

| Appendix section | Arena's proposed formal wording | Disposition by the PA's rendering |
| :--- | :--- | :--- |
| **A-2.1** — replaces §8.2(7): owner-context carrier | Tenant `irr-broker-evidence-personal`; owner `owner-irr-broker-evidence-personal`; carrier `IIPS_BROKER_EVIDENCE_OWNER_PATH` | **SUPERSEDED as to the two partition-key values.** The PA required *one stable, application-generated canonical owner ID* with *`SAIRAM`* as its human-readable label, so the values are **`irr-personal-073dd1c8`** and **`owner-4dc756b3`**, derived by a documented deterministic rule. **The carrier environment variable `IIPS_BROKER_EVIDENCE_OWNER_PATH` is ADOPTED unchanged.** The fifteen NP-06 R1 §2 dispositions are adopted, adapted to the single-user context. Act §3. |
| **A-2.2** — replaces §8.3(16): retention and purge | Indefinite; explicit-operator-only purge; never automatic; never HTTP-reachable; raw bytes never retained; documented review at 50 MB | **ADOPTED IN SUBSTANCE AND EXTENDED.** All six elements are carried into the act. Decision 6 **adds** two obligations the proposal did not contain — **storage-usage visibility (O-1)** and **backup/recovery safeguards (O-2)** — and fixes 50 MB as a **warning/review threshold only, never an automatic deletion trigger**, with **no quota**. Act §4. |
| **A-2.3** — replaces the Act ID | Proposed form `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` | **ADOPTED AS PROPOSED.** The PA's Decision 7 directed assignment from the existing convention with a collision check and no invention or reuse; the proposed form was verified to satisfy all three and is **assigned**. Act §5. |
| **A-2.4** — plain-English ↔ formal concordance | — | **Unchanged in structure**; the formal column now resolves to the act rather than to a drafted placeholder. |
| **A-1.1 … A-1.4** — the four Gate 4 decisions | G4P-1 content pin; C-1; alias ratification at `7bcae35`; `'UNCLASSIFIED'` | **NOT RENDERED — still PENDING.** Additionally **a change of fact**: concurrent PR #446 merged at `d7cd3b65` and advanced the broker-import pin from `7bcae35` to **`07e86a4f`** (IPD PR #128), so **A-1.3's named coordinate is stale and must be re-censused before the PA signs**. A-0's recorded baselines are preserved as at authoring and are **not rewritten**. Act §11(4). |

### A-6.2 Two findings the appendix did not contain, now recorded

**Finding A-6-A — the amendment form had to change from "appended §8" to "separate instrument".**
A-2 and the A-8 package both assumed the adopted text would be appended to the U1 act file as §8. **It
cannot be.** The U1 act's blob **`a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9`** is a published,
remotely-verified anchor, cited in the effective composition act's **4/4 remote read-back receipt**
(`IIPS_v3.0_CAP02_BROKER_IMPORT_MODAL_PORT_COMPOSITION_ACT_EFFECTIVE_2026-10-23.md:207`) and in tracker
`CHG-2026-10-23-18` and verification row `V425`. Appending would change the blob and invalidate those
anchors. **∴ additive, by separate instrument** — the `G3-AMEND-01` model — with the U1 act preserved
byte-identical and the amending instrument's §7 numbered clause-for-clause identically to the drafted §8
so every cross-reference still resolves. Both U1 blobs were re-verified unchanged at authoring:
effective **`a3ae368d…`** / 13,357 B; prepared **`966891d4c7016a5e993e609a03488c8719499e3e`**.

**Finding A-6-B — the PA's structure is required by an existing conformance rule, not merely preferable.**
`IIPS_v3.0_OWNER_CONTEXT_F1_F2_VALUE_ACT.md` §4.1 validates partition keys against
*"Opaque: no personal, username, email, or company identity; no `@` or identity token"*. **`SAIRAM` used
as `ownerUserId` would FAIL that check.** A case-insensitive census independently found `sairam` in **11
IRR** and **2 IPD** files, and **every occurrence is the repository owner's e-mail address** in
commit-author or package-author metadata (`Ramaki <sairam260573@gmail.com>`;
`"author": "Ramki / Sai <sairam260573@gmail.com>"`; `ramkivs <sairam260573@gmail.com>`) — exactly the
excluded identity-token class. **∴ the PA's separation of a generated canonical ID from a
human-readable label satisfies the rule while giving full effect to the naming intent.** Case-sensitive
uniqueness was nevertheless clean: `SAIRAM` occurs **0** times in the IRR tree, **0** across all IRR
history, and **0** at IPD `main` — so the exclusion rests on **conformance**, not collision.

### A-6.3 Collision verification actually performed (NP-06 R1 §1(3) test, at the current baselines)

| Literal | IRR tree | IRR full history | IPD `main@07e86a4f` |
| :--- | :--- | :--- | :--- |
| `owner-4dc756b3` | **0** | **0** | **0** |
| `irr-personal-073dd1c8` | **0** | **0** | **0** |
| `IIPS-V3-PERSONAL-OWNER:SAIRAM` | **0** | **0** | **0** |
| `SAIRAM` (case-sensitive) | **0** | **0** | **0** |
| `IIPS_BROKER_EVIDENCE_OWNER_PATH` | 3 — **all this pass's own documents** | 0 foreign | **0** |
| `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` | 3 — **all this pass's own documents, in *proposed* context** | 0 foreign | **0** |

**A-4's verification methods were used, with two additions:** `git grep -I -i` for the case-insensitive
identity-token census, and a blob-anchor census (`git grep -F a3ae368d`) that produced finding A-6-A.

### A-6.4 A-5's limits, restated for this note

This note claims **no** implementation, **no** effectiveness, **no** runtime test of the new pair, and
**no** demonstration of restart stability or global uniqueness for it — mirroring the F-1/F-2 act's own
non-claims. What **is** claimed, and was verified at authoring: conformance to the §4.1 table, literal
uniqueness across both repositories and all IRR history, deterministic reproducibility from the published
rule, a valid canonical carrier JSON of **367** bytes hashing to
**`27e70c10be68f42a7dc90e5d07669b2a4201c3b807ee0b9fb14e9247b06f8b2c`**, and byte-identity of both U1 act
files. **A-1 … A-4 Gate 4 matters remain PENDING. Workstream A and milestone WS-A-DM remain NOT
COMPLETE.**
