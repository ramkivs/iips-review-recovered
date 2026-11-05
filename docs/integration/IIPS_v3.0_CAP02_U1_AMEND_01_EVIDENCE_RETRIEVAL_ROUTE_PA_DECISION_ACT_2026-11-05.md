# IIPS v3.0 — CAP-02 U1 AMEND-01 — Evidence-Retrieval Route: PA Decision Act and Additive Amendment

**Act ID:** `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`

| Field | Value |
| :--- | :--- |
| **Instrument** | Additive amendment to `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01`, rendered as a **separate instrument** (§6) |
| **Amendment model** | **Additive, by separate instrument.** The U1 act file is preserved **byte-identical** at blob **`a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9`** (13,357 bytes) and is **not modified** by this act |
| **Authority** | Standing PA grant (F-3 §1.2, blob `c4c9f7d7…`) as construed by **DEC-06 R-1/R-2/R-3/R-5/R-6/R-7**, plus the **PA direction of `2026-11-05`** rendering decisions **5**, **6** and **7** on the A-8 evidence-retrieval authorization |
| **Rendered** | `2026-11-05` |
| **Baselines (re-censused, not recalled)** | IRR `main@d7cd3b658bdcd9e59c7888e8b6a37af7e4646232` (PR #446); IPD `main@07e86a4f2c105651f3097a96cb519f8611945e30` (PR #128). Open PRs at authoring: **0** IRR, **0** IPD |
| **Prepared against** | `WS-A-EVIDENCE-RETRIEVAL-ROUTE-U1-S8-AMENDMENT-PACKAGE-2026-11-05.md` (blob `8a6eed7e…`), `WS-A-PA-DECISION-PAPER-PLAIN-ENGLISH-2026-11-05.md` (blob `fa134b93…`), `WS-A-PA-DECISION-PAPER-TECHNICAL-APPENDIX-2026-11-05.md` (blob `9d6f8949…`), `WS-A-EVIDENCE-RETRIEVAL-ROUTE-AUTHORITY-GAP-2026-11-05.md` |
| **STATUS** | **RENDERED BY THE PA'S DECISIONS 5/6/7 OF `2026-11-05` — EFFECTIVENESS CONDITIONAL ON §10 — PUBLICATION VERIFICATION PENDING — NOT YET EFFECTIVE — IMPLEMENTATION NOT AUTHORIZED** |

> **Read this first.** The PA has decided items 5, 6 and 7. Those decisions are recorded here **in the
> PA's own words** (§2–§4) and are **not reopened for confirmation**. What this act additionally does is
> **reconcile** them against the published A-8 proposal and existing U1 / DEC-06 authority, **fill** the
> three `TBD-PA` placeholder sets, **remove** multi-tenant and production-oriented assumptions that the
> drafted text carried, and **preserve** every existing authority boundary.
>
> **This act does not implement anything.** No route, handler, carrier module, test, endpoint, schema,
> pin or fence is created or changed by it. Effectiveness is conditional (§10) and **implementation
> remains NOT AUTHORIZED** until §10's conditions are discharged and recorded in a post-merge receipt
> (§12). Three genuine remaining items are reported precisely at **§11** — they are **not** routine
> confirmations of decisions 5, 6 or 7.

---

## 1. Rendering form and non-fabrication

This act is rendered in the **established form** used for `GC-D3`, `GC-D4`, `NP-18`, `D-06`, `Q1`,
`G3-AMEND-01` and the CAP-02 U0/U1/U7 renderings: the PA's decisions were given **directly and
explicitly in the operating session on `2026-11-05`** and are recorded on that date.

**Explicitly not asserted and not fabricated:** no signature, no signed instrument, no approval ID, no
approval timestamp, no third-party confirmation, and no agent-held jurisdiction. **Publication of this
act is not itself the PA's decision** — the decision precedes and authorizes this record. Equally,
**publication is not effectiveness**: §10 states the conditions, and §12 records that they are
**PENDING**.

**Additive discipline.** No previously published prose is rewritten to reflect this later state. The
A-8 amendment package, the decision paper, the technical appendix, the gap record, the NP-06 R1 act, the
F-1/F-2 value act, the U1 act and PF-1 are all **preserved**; each receives a **dated additive note**
where a pointer is useful. Where this act **corrects** an earlier statement, the correction is recorded
**here**, with the earlier wording left intact in its own document.

---

## 2. The PA's application context (recorded verbatim)

> - Personal, single-user application.
> - No production deployment or multi-tenant concept.
> - Personal application principal remains owned by Ramki.
> - No second-user access or shared-account authorization is implied.

**Effect on this instrument.** This context is **binding on the construction of every clause** adopted
by §7. It removes the multi-tenant and production framing that the drafted text carried as a
precautionary default (§8 enumerates each removal). It does **not** remove any **protection**: the
fail-closed, non-disclosure, non-enumeration and partition-isolation properties are **retained**, and
are re-expressed as **single-owner personal-application protections** rather than as multi-tenant
semantics. Where a mechanical requirement survives — notably PF-1's two-key API (§3.9) — it is fixed to
a **single permanent personal value** and stripped of multi-tenant meaning.

---

## 3. Decision 5 as rendered — owner identity

### 3.1 The PA's words

> **DECISION 5 — OWNER IDENTITY**
>
> Adopt `SAIRAM` as the permanent personal owner identity.
>
> Requirements:
> - Use one stable, application-generated canonical owner ID.
> - Use `SAIRAM` as its human-readable identity label.
> - Bind personal holdings and associated evidence to this owner.
> - Resolve ownership through the trusted application context.
> - Do not introduce multi-tenant or enterprise identity infrastructure.
> - Do not interpret the name as granting another person independent access or ownership authority.

### 3.2 Reconciliation — the PA's two-part structure is **required**, not merely preferred

The PA's separation of an **application-generated canonical owner ID** from a **human-readable label**
turns out to be **mandatory** under existing authority, and this act records why.

**Finding R5-1 — the established conformance rule prohibits a personal name as a partition key.**
`IIPS_v3.0_OWNER_CONTEXT_F1_F2_VALUE_ACT.md` §4.1 validates the F-1/F-2 pair against a conformance
table whose sixth row is:

> | Opaque: no personal, username, email, or company identity; no `@` or identity token | PASS | PASS |

`SAIRAM` **is** a personal identity. Used directly as `ownerUserId`, it would **FAIL** that check. The
PA's structure — generated ID as the key, `SAIRAM` as the label — **satisfies** the rule while giving
full effect to the PA's naming intent. **∴ `SAIRAM` is adopted as the identity label and is excluded
from both partition keys.**

**Finding R5-2 — the name is already present in the repository as an identity token, which confirms the
finding rather than weakening it.** A case-insensitive census found `sairam` in **11 IRR files** and **2
IPD files**, and **every one** is the repository owner's e-mail address in commit-author or
package-author metadata — for example `author=Ramaki <sairam260573@gmail.com>` in
`evidence/integration/cap03-s2-a891802e-publication-verification-2026-10-28/01-remote-publication-verification.txt`,
`"author": "Ramki / Sai <sairam260573@gmail.com>"` in IPD `package.json`, and `ramkivs
<sairam260573@gmail.com>` in the tracker's own preserved provenance line. **This is exactly the
"personal, username, email … identity token" class that F-1/F-2 §4.1 excludes from a partition key.**
It also independently corroborates the PA's context that the personal application principal is owned by
Ramki.

**Finding R5-3 — case-sensitive uniqueness is nevertheless clean.** `SAIRAM` occurs **0** times in the
IRR working tree, **0** times across **all IRR history**, and **0** times at IPD `main`. So the label
could have been used without a literal collision; it is excluded on **conformance** grounds, not
collision grounds. Both facts are recorded so the reasoning is not mistaken for one another.

**Finding R5-4 — a distinct pair is required, and F-3 aliasing is prohibited.**
`IIPS_v3.0_REPORTS_NP06_R1_OWNERSHIP_DECLARATION_PA_DECISION_ACT_2026-10-25.md` §1(2) records that
*"F-3 value reuse or aliasing `(irr-domain-4b82d6e1, owner-7f3a91c2)` for Reports is **explicitly
prohibited**. Reports maintains its own distinct ownership declaration and partition boundary."* The
established principle is **one distinct pair, and one distinct carrier, per route family**. Broker-import
evidence therefore receives its **own** pair and its **own** carrier (§3.7), preserving partition
isolation from both the F-3 user-portfolio domain and the Reports domain.

**Finding R5-5 — the two scope keys remain mechanically unavoidable.** `brokerImportEvidenceStore.ts`
declares `exists(tenantId, ownerUserId, importId)` (line 225), `read(tenantId, ownerUserId, recordId)`
(line 229) and `list(tenantId, ownerUserId)` (line 235), and `BrokerImportEvidenceRecord` carries
`readonly tenantId: string` and `readonly ownerUserId: string` (lines 63–64, 132–133). PF-1 states it is
*"a library authority, not an HTTP identity or access-control boundary"*. `ownerContextFromBinding.ts`
supplies **no** owner fields — *"IRR does not resolve an owner, does not hold one, and cannot supply
one"*. **∴ both values must be act-established; the PA's context removes their multi-tenant *meaning*,
not their mechanical *presence*.**

### 3.3 The canonical derivation rule and the generated values

The PA requires **one stable, application-generated canonical owner ID**. "Application-generated" is
given effect by a **deterministic, documented, reproducible derivation** rather than by an arbitrary
choice, because F-3's recovery model depends on determinism: *"re-materialisation from the governing PA
declaration is **deterministic**"* (F-3 property 4). A random value could not be re-materialised after
loss; a derived value can.

```text
RULE (fixed by this act; any change requires a new dated PA act)

  ownerUserId = "owner-"        || lowercase_hex( SHA-256( "IIPS-V3-PERSONAL-OWNER:SAIRAM"   ) )[0:8]
  tenantId    = "irr-personal-" || lowercase_hex( SHA-256( "IIPS-V3-PERSONAL-TENANT:SAIRAM" ) )[0:8]

  where || is string concatenation and [0:8] is the first eight hexadecimal characters.
```

| Quantity | Value |
| :--- | :--- |
| Derivation input (owner) | `IIPS-V3-PERSONAL-OWNER:SAIRAM` |
| SHA-256 (owner input) | `4dc756b3a14f885e345e246e3c1f0b5c1668a464f69f0ba4ae271faaa15bf745` |
| **Canonical owner ID (`ownerUserId`)** | **`owner-4dc756b3`** — 14 characters |
| Derivation input (tenant) | `IIPS-V3-PERSONAL-TENANT:SAIRAM` |
| SHA-256 (tenant input) | `073dd1c8ff72cf3277dec04294f6ea65a2e2a56926ff81cb1874bff6cd7c3a93` |
| **Personal tenant scope key (`tenantId`)** | **`irr-personal-073dd1c8`** — 21 characters |
| **Human-readable identity label** | **`SAIRAM`** — **NOT a partition key; never used for resolution** |

**Note on shape.** `owner-4dc756b3` is **14 characters**, the same length and the same
`owner-` + 8-hex shape as the PA-approved F-1 value `owner-7f3a91c2`; `irr-personal-073dd1c8` follows
the F-2 rule that the tenant value be *"explicitly domain-scoped (names the IRR domain)"*. The generated
values are **new and distinct** from both the F-3 pair and the Reports pair.

**Note on derivability — not a vulnerability.** Because the inputs are documented, the IDs are
recomputable. This is **immaterial to security**: per NP-06 R1 §2 disposition 9 and the F-1/F-2 act's
own semantics line, these values are **`EQUALITY_PARTITION_ONLY; NOT_AUTHENTICATION_OR_AUTHORIZATION_CREDENTIALS`**
— *"governed partition keys, not authenticated identities or principals"*, conferring **no** roles,
permissions or privilege escalation (disposition 10). Deriving them grants nothing.

### 3.4 Conformance validation (performed at rendering, mirroring F-1/F-2 §4.1)

| Check | `owner-4dc756b3` | `irr-personal-073dd1c8` |
| :--- | :--- | :--- |
| Single non-empty string | **PASS** | **PASS** |
| Contains no NUL character | **PASS** | **PASS** |
| ASCII (⇒ UTF-8 byte length equals character length) | **PASS** (14 = 14) | **PASS** (21 = 21) |
| JSON-stable / persisted verbatim (no escapes required) | **PASS** | **PASS** |
| Deterministic and exact-equality stable | **PASS** — reproducible from §3.3's rule | **PASS** — reproducible from §3.3's rule |
| **Opaque: no personal, username, email, or company identity; no `@` or identity token** | **PASS** | **PASS** |
| Not a removed-fixture value (`admin-a` / `tenant-A` era) | **PASS** | **PASS** |
| Tenant explicitly domain-scoped, names the IRR domain | n/a | **PASS** |
| Distinct from the F-3 pair and from the Reports pair | **PASS** | **PASS** |
| **The label `SAIRAM` is excluded from the value** | **PASS** | **PASS** |

### 3.5 Collision verification — the NP-06 R1 §1(3) uniqueness test

NP-06 R1 §1(3) requires *"Literal uniqueness confirmed: 0 collisions across repository history, F-3
records, and IPD corpus."* Performed at the §-header baselines, **after** PR #446 merged:

| Literal | IRR working tree | IRR **full history** (`git log --all -S`) | IPD `main@07e86a4f` (`git grep`) |
| :--- | :--- | :--- | :--- |
| `owner-4dc756b3` | **0** | **0** | **0** |
| `irr-personal-073dd1c8` | **0** | **0** | **0** |
| `IIPS_BROKER_EVIDENCE_OWNER_PATH` | **0** foreign — the 3 hits are this pass's own proposal documents | **0** foreign | **0** |
| `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` | **0** foreign — the 3 hits are this pass's own proposal documents, all in *proposed* context | **0** foreign | **0** |
| `IIPS-V3-PERSONAL-OWNER:SAIRAM` | **0** | **0** | **0** |
| `SAIRAM` (case-sensitive) | **0** | **0** | **0** |

**∴ No collision. No existing ID is reused and none is invented: the Act ID is derived from the surveyed
house convention (§5.1) and verified unassigned; the partition keys are derived by the documented rule
and verified unused.**

### 3.6 Status of the label `SAIRAM`, and the PA's express prohibition

1. `SAIRAM` is the **permanent personal owner identity label**, bound by this act to the canonical owner
   ID `owner-4dc756b3`. **This act is the authoritative binding**; the label is not stored in the
   carrier bytes (§3.7) and is not a field of any partition key.
2. The label is **never** used to resolve, look up, filter, partition, authorize or authenticate
   anything. Resolution is by **exact equality** on the canonical ID only.
3. The label **may** be surfaced for human display by a later implementation step. Any such display is
   **non-authoritative**: it confers nothing and its absence or alteration changes no behaviour.
4. **Per the PA's express requirement, the name does not grant any other person independent access or
   ownership authority.** `SAIRAM` denotes the **single personal application principal owned by Ramki**.
   It creates **no** second user, **no** shared account, **no** delegation, **no** role and **no**
   additional principal. Nothing in this act admits, contemplates or provisions access for any person
   other than the application owner.
5. Changing the label, or the canonical ID, requires a **new dated PA act** and a **new carrier digest**.
   Neither the carrier module nor any code may ever be the origin of a value change.

### 3.7 Carrier mechanism (NP-06 R1 §3 shape)

1. **Carrier:** a **separate server-owned carrier file** named by environment variable
   **`IIPS_BROKER_EVIDENCE_OWNER_PATH`** — distinct from `IIPS_OWNER_CONTEXT_PATH` (F-3) and from
   `IIPS_REPORTS_OWNER_PATH` (NP-06 R1). The carrier lives **outside any Git working tree**, in the
   server-owned filesystem; materialisation must refuse a target inside a repository, exactly as
   `materialiseOwnerContextCarrier` does.
2. **Canonical carrier bytes** — UTF-8, no BOM, two-space indentation, this exact key order, exactly one
   trailing LF. Any deviation changes the digest and fails closed. No normalisation, no leniency.

   ```json
   {
     "carrierSchemaVersion": 1,
     "ownerUserId": "owner-4dc756b3",
     "tenantId": "irr-personal-073dd1c8",
     "governedBy": {
       "recordId": "IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01",
       "recordPath": "docs/integration/IIPS_v3.0_CAP02_U1_AMEND_01_EVIDENCE_RETRIEVAL_ROUTE_PA_DECISION_ACT_2026-11-05.md",
       "decisionDate": "2026-11-05"
     }
   }
   ```

3. **Integrity pin (SHA-256):** **`27e70c10be68f42a7dc90e5d07669b2a4201c3b807ee0b9fb14e9247b06f8b2c`**;
   exact byte length **367**. Any carrier whose bytes do not match this digest fails closed with
   `503 owner-context-unavailable`. **The carrier may never be the origin of a value change**: a change
   requires a new governed PA act and a new digest.
4. **Operating properties** (as NP-06 R1 §3(4)): **uncached per-request evaluation** — read per request,
   so removing or restoring the carrier takes effect immediately without restart; **operator control** —
   the carrier lives outside the Git working tree in the server-owned filesystem; **change authority** —
   any change of values requires a new dated PA act; **restart stability** — already proven for the
   journal across separate OS processes; **fail-closed** — an absent, malformed, invalid or
   digest-mismatched carrier yields a null context and HTTP `503`.
5. **Not created by this act.** No carrier module, constant, test or file is written here. §3.7 fixes the
   **specification** that implementation must materialise later, under §12.

### 3.8 The fifteen NP-06 R1 §2 dispositions, carried forward and adapted

The PA's Decision 5 adopts the NP-06 R1 precedent; its fifteen dispositions are carried forward with the
route family, the values and the PA's single-user context substituted. **No disposition is weakened.**

| # | Element | Disposition for broker-import evidence |
| :-- | :--- | :--- |
| 1 | **Source Authority** | **This act** (`IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`) is the authoritative source for the broker-import evidence ownership declaration. |
| 2 | **Target Authority** | The PF-1 broker-import evidence journal as implemented and merged (IRR PR #434), at the **unchanged** NP-04 persistence lineage `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`, for **bounded non-production personal use only**. |
| 3 | **Source Identifier** | The pair **(`irr-personal-073dd1c8`, `owner-4dc756b3`)** declared at §3.3, with the human-readable label **`SAIRAM`** recorded at §3.6 and **excluded** from both keys. |
| 4 | **Target Identifier** | Exact **1:1** correspondence to the source pair `(tenantId, ownerUserId)`. **Implicit aliasing or translation is prohibited** — in particular, aliasing to the F-3 pair or to the Reports pair is prohibited. |
| 5 | **Mapping Lifecycle** | **Fixed 1:1 static mapping.** No dynamic mapping table, no translation engine, no lifecycle states. |
| 6 | **Provisioning Authority** | **Owner/operator-only** provisioning through the designated server-side process (`IIPS_BROKER_EVIDENCE_OWNER_PATH`). **Client-controlled provisioning is prohibited.** |
| 7 | **Revocation Authority** | The **Program Authority** governs the declaration. Removing or unsetting the carrier **disables the evidence route immediately**, failing closed with `503 owner-context-unavailable`. |
| 8 | **Tenant Boundary** | **Exactly one** declared personal tenant (`irr-personal-073dd1c8`). **No guessing, no ambient fallback, no client-selected tenant, no tenant enumeration, no tenant management.** |
| 9 | **Ownership Semantics** | Owner and tenant values are **governed partition keys**, not authenticated identities or principals. |
| 10 | **Authorization Boundary** | Ownership values confer **no** roles, permissions or privilege escalation. The label `SAIRAM` confers **nothing** and grants **no** person access (§3.6(4)). |
| 11 | **Audit Requirements** | Durable evidence of establishment, replacement and revocation preserved in the git repository and in test evidence. |
| 12 | **Failure Behaviour** | `503 owner-context-unavailable`. **No data is read or changed**; no fallback identity or substitute store is constructed. |
| 13 | **Trust Model** | **No credential, authenticated principal, or client-supplied identity is authoritative.** Ownership is resolved **only** through the trusted application context — the act-fixed carrier plus the server-owned local binding precondition — **never** from a request header, cookie, token, query value or body field. |
| 14 | **Durable Storage** | The **server-owned local data directory** (`IIPS_DATA_DIR`, PF-1 TD-7a) holding the append-only evidence journal. Never client-supplied; fail-closed when unset. |
| 15 | **Package / API Contract** | The evidence journal is consumed through the **existing** PF-1 library surface at the **unchanged** broker-import pin. **No new IPC operation, no new listener, no contract change.** |

### 3.9 The tenant key — a mechanical necessity, not multi-tenant infrastructure

The PA's context states there is **no multi-tenant concept**. This act gives that effect **without**
misrepresenting the code:

1. PF-1's journal API **requires** a `tenantId` argument on every operation (§3.2, finding R5-5). It is a
   **mandatory parameter of an existing merged library surface**, not a feature this act introduces.
   Removing it would require changing PF-1 — which is **not authorized** by this act and would be an
   unbounded change to merged persistence code.
2. `tenantId` is therefore fixed to **exactly one permanent personal value**, `irr-personal-073dd1c8`,
   denoting **the single personal application instance**. It is a **scope constant**, not a tenant in any
   multi-tenant sense.
3. **What is expressly NOT introduced:** no tenant registry, catalogue, enumeration, selection,
   switching, provisioning UI or API; no tenant-scoped configuration; no per-tenant policy; no
   second tenant; no enterprise or federated identity provider; no directory, no roles, no groups, no
   claims, no scopes, no OAuth/OIDC/SAML/LDAP surface; no multi-tenant data model, no tenant column
   semantics beyond the existing equality partition key.
4. **Consequence for the route:** the tenant is **never** taken from a request, never inferred, never
   defaulted from an ambient source, and never varied. A request cannot select it. Disposition 8 above is
   the enforcement statement.

---

## 4. Decision 6 as rendered — evidence retention

### 4.1 The PA's words

> **DECISION 6 — EVIDENCE RETENTION**
>
> Adopt indefinite retention until explicit deletion by the application owner.
>
> Requirements:
> - No automatic expiry or deletion.
> - No automatic purge or destructive compaction.
> - Explicit owner-controlled deletion only.
> - Preserve evidence integrity, import history and associated audit metadata.
> - Provide storage-usage visibility and appropriate backup/recovery safeguards.
> - The 50 MB threshold, if retained, is a warning/review threshold only, never an automatic deletion trigger.

### 4.2 The three `TBD-PA` blanks of drafted §8.3(16), now filled

| Blank | Filled value |
| :--- | :--- |
| **(a) Retention period** | **INDEFINITE** — no expiry, until explicit deletion by the application owner. No time-based limit of any duration. |
| **(b) Purge rule** | **Explicit owner-controlled deletion ONLY.** No automatic purge. No destructive compaction. No scheduled job. No size-triggered deletion. No count-triggered deletion. No deletion on import, on restart, on error, on quota, or on any lifecycle event. |
| **(c) Purge basis** | **EXPLICIT-ONLY.** Expressly **not** time-based and **not** count-based. |

The drafted clause's own gate — *"Until (a)–(c) are filled, no HTTP surface may serve indefinite
accumulation of parsed personal financial evidence, and this section is not effective"* — is thereby
**satisfied as to content**, and remains subject to §10's publication conditions.

### 4.3 The two obligations Decision 6 adds, and how each is discharged **without** expanding the HTTP surface

Decision 6 adds two requirements the drafted text did not contain. Both are recorded as **binding
obligations on the eventual implementation**. Neither is discharged by this act, and **neither may be
discharged by adding an endpoint**, because §7 admits exactly one read-only route and no more.

**O-1 — Storage-usage visibility.**

| Property | Requirement |
| :--- | :--- |
| What must be visible | The **count** of retained evidence records in the owner's scope, the **approximate on-disk bytes** they occupy, the data-directory **location**, and whether the **review threshold** (§4.4) is exceeded |
| Permitted means — **no new endpoint** | (i) inclusion in the **already-admitted** import response's limitations block; (ii) inclusion in the **already-admitted** evidence record's own limitations payload (§7 clause 14 requires the retention limitation to be carried in the response); (iii) a documented **operator runbook** procedure reading the server-owned data directory directly; (iv) server-side logging at import |
| Expressly prohibited means | Any new HTTP route, collection endpoint, metrics endpoint, admin surface or enumeration API. Any route that lists `importId` values. **§7 clause 1's non-enumeration guarantee is not relaxed to provide visibility** |
| Status | **OBLIGATION — NOT DISCHARGED.** Discharge belongs to implementation under §12 |

**O-2 — Backup and recovery safeguards.**

| Property | Requirement |
| :--- | :--- |
| Recovery | Already **partly** in hand and **proven**: the journal is append-only, tamper-evident (`recordDigest` re-verified on every read, failing closed `EVIDENCE_TAMPERED`), and **restart-proven across separate OS processes**. Carrier re-materialisation is **deterministic** from this act (§3.3, §3.7), so the owner scope survives loss of the carrier file |
| Backup | A documented **owner-operated file-copy procedure** for the server-owned data directory, recorded in the operator runbook. **No automated backup service, no cloud sync, no third-party transmission** — §7 clause 11's locality rule and clause 24's third-party prohibition are unchanged |
| Integrity preservation | Evidence integrity, **import history** and **associated audit metadata** are preserved by the append-only model: no record is rewritten, no history is truncated, and no compaction rewrites the journal. Decision 6's prohibition on destructive compaction **aligns with** PF-1's state — compaction is **NOT built** in v1 (**TD-3**), so nothing needs to be disabled in code |
| Expressly prohibited | Any backup path that transmits personal financial evidence outside the server-owned local filesystem. Any "recovery" that reconstructs a record from a digest or from a re-import in place of the retained original |
| Status | **OBLIGATION — NOT DISCHARGED.** Discharge belongs to implementation under §12 |

### 4.4 The 50 MB threshold — warning and review only

Arena's earlier recommendation proposed a documented review point at **50 MB**. The PA's Decision 6
retains it **only** as a warning/review threshold. Accordingly:

- **Value:** **50 MB** of retained parsed evidence in the owner's scope, **PA-settable** by a later act.
- **Effect when crossed:** a **warning** surfaced through O-1's permitted means, and a **recorded review**
  by the application owner. **Nothing else.**
- **Expressly NOT an effect:** no deletion, no purge, no compaction, no refusal of new imports, no
  truncation, no read-only degradation, no automatic act of any kind. **Crossing the threshold changes
  no behaviour and destroys no data.**
- The threshold is **not** a quota. There is **no** quota.

### 4.5 The deletion-surface boundary — a genuine reconciliation, reported at §11(1)

Decision 6 requires **explicit owner-controlled deletion**. Drafted §8.3(16) requires that **purge never
be reachable from the HTTP surface**, that the admitted route be **read-only**, and that **no `DELETE` be
admitted anywhere in the namespace**. These are reconciled as follows, and the reconciliation **preserves
the boundary rather than relaxing it**:

1. **Owner-controlled deletion is authorized in principle by Decision 6** and is **not** admitted on any
   HTTP surface **by this act**.
2. The means of exercise permitted **without** a further act are **outside** the admitted route: an
   explicit owner action on the **server-owned local data directory**, documented in the operator
   runbook. This is consistent with the existing locality rule and with provisioning being owner-only.
3. **Admitting any deletion endpoint, any `DELETE` method, or any destructive HTTP operation would
   require a further PA act.** This act does **not** admit one, and §7 clause 24 continues to prohibit it.
4. Any such future deletion path must preserve: append-only audit history for the **fact** of deletion,
   non-disclosure on refusal, exact owner scoping, fail-closed behaviour, and non-enumeration.
5. **∴ No conflict is resolved by weakening either requirement.** Deletion remains owner-controlled and
   explicit; the HTTP surface remains read-only.

### 4.6 Why automatic purge remains technically rejected

Recorded because Decision 6's prohibition is **not** only a policy preference — it protects an existing
guarantee. **The first retention is authoritative and a duplicate import returns it unchanged**
(drafted §8.3(14); PF-1's idempotency on `importId = sha256(broker ‖ contentDigest ‖ readAt)`).
Automatically deleting a first-retained record would **silently change what a duplicate import returns**,
breaking that guarantee and destroying the **only row-level record** of the 67
`NO_AUTHORITATIVE_IDENTIFIER_MATCH` refusals. **Indefinite retention with explicit-only deletion is
therefore the technically correct choice, not merely the PA's preference.**

Mitigating facts, each verified, which make indefinite retention proportionate: locality is the
server-owned local disk only — never a Git tree, network store, third party or browser store; **raw CSV
bytes are never retained**, so the footprint is the parsed summary; records are tamper-evident and fail
closed; foreign scope is invisible by test; and **no third-party transmission path exists**.

---

## 5. Decision 7 as rendered — Act ID

### 5.1 The PA's words, and the convention surveyed

> **DECISION 7 — ACT ID**
>
> Assign the formal authorization Act ID using the existing governance register and numbering
> convention. Check for collisions before assignment. Do not invent or reuse an existing ID.

The existing CAP-02 amendment convention, censused from the repository rather than recalled:

| Existing instrument ID | Shape |
| :--- | :--- |
| `IIPS-V3-CAP02-G4-AMEND-01-H12-MEMBERSHIP-2026-10-23` | `IIPS-V3-CAP02-<unit>-AMEND-<nn>-<SUBJECT>-<date>` |
| `IIPS-V3-CAP02-G4-AMEND-01-H12-MEMBERSHIP-2026-10-24` | as above, later date |
| `IIPS-V3-CAP02-GATE-A-PRIME-AMEND-01-DESIGNATED-BLOBS-2026-10-28-01` | `…-AMEND-<nn>-<SUBJECT>-<date>-<seq>` |
| `IIPS-V3-CAP02-G3-AMEND-02-U2` | `IIPS-V3-CAP02-<unit>-AMEND-<nn>-<subject>` |
| `IIPS-V3-G3-AMEND-01-2026-10-22-01` | `IIPS-V3-<unit>-AMEND-<nn>-<date>-<seq>` |

**Derived shape:** `IIPS-V3-CAP02-U1-AMEND-<nn>-<SUBJECT>-<date>-<seq>`.

`<nn>` = **`01`**: the U1 act's own §7 additive amendment was rendered **as a section of the act with no
separate Act ID** (companion to composition act `-04`), so **no** separately identified U1 amendment
exists yet. **`AMEND-01` is therefore the first**, and `01` is correct rather than `02`.

### 5.2 Collision verification, performed before assignment

Per §3.5's table: the candidate ID occurs **0** times at IPD `main`, and its **only** occurrences in the
IRR tree and history are in **this pass's own proposal documents**, in every case explicitly in a
*proposed* context — the tracker's *"Proposed form"*, the decision paper's *"Arena proposes"* and its
blank decision-record cell, and the appendix's proposed-form line. **No instrument has ever been issued
under it.** It is therefore neither an existing ID being reused nor an invented one: it is **derived from
the surveyed convention and verified unassigned**.

### 5.3 Assignment

**ASSIGNED:** **`IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`**

Assigned **under the PA's Decision 7 direction of `2026-11-05`**, which expressly delegates this
clerical assignment subject to the convention and collision constraints. It is **not self-assigned**: the
authority to assign comes from the PA's direction, and the value comes from the surveyed convention. The
ID identifies **this instrument**. Publication coordinates are recorded **exclusively** in the post-merge
tracker receipt and are **never self-embedded** in this act.

---

## 6. Amendment-form correction — separate instrument, **not** an appended U1 §8

**This is a correction to the published A-8 proposal, recorded here additively.**

The A-8 package §6 specified the outstanding authority as *"an additive amendment to the U1 act …
preserving §§1–7 verbatim, adopting §3 above as §8"*, and the drafted text was written to be *"appended
to the U1 act as §8"*. That form **cannot be used**, for a concrete verified reason:

**Finding F-1 — the U1 act's blob is a published, remotely-verified anchor.** The blob of
`IIPS_v3.0_CAP02_U1_BROKER_IMPORT_TRANSPORT_AUTHORITY_ACT_EFFECTIVE_2026-10-23.md` is
**`a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9`**, and that exact value is cited as an anchor in:

| Location | Citation |
| :--- | :--- |
| Tracker, `CHG-2026-10-23-18` record | *"Companion addenda: `-03` §14 (`8684a5fd99de2b72d9b4d075acb40313279f8f57`), **U1 §7 (`a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9`)**"* |
| Tracker verification ledger `V425` | the same publication/read-back record |
| `IIPS_v3.0_CAP02_BROKER_IMPORT_MODAL_PORT_COMPOSITION_ACT_EFFECTIVE_2026-10-23.md:207` | *"Remote `origin/main` blob read-back (**4/4 MATCH**): this act `c6463fec…` …"* — a completed remote read-back receipt naming the U1 act's blob |

Appending §8 to that file would **change its blob** and thereby **invalidate a recorded remote read-back
anchor inside an effective composition act and two tracker records**. That is precisely the class of
damage additive discipline exists to prevent.

**∴ Amendment model adopted: ADDITIVE, BY SEPARATE INSTRUMENT** — the model the repository already
established for `G3-AMEND-01`: *"Amendment model: additive, by separate instrument; the governing act
remains **byte-identical** and unamended, with the amendment governing only the **application** of the
act."*

**Consequences, stated exactly:**

1. `IIPS_v3.0_CAP02_U1_BROKER_IMPORT_TRANSPORT_AUTHORITY_ACT_EFFECTIVE_2026-10-23.md` is **NOT
   modified**. Its blob remains **`a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9`** and its size **13,357**
   bytes. **This act asserts that invariant and the post-merge receipt verifies it.**
2. The prepared-act anchor is likewise intact: `…ACT_PREPARED_2026-10-23.md` remains blob
   **`966891d4c7016a5e993e609a03488c8719499e3e`**, re-verified at authoring.
3. **§7 of this act is the amendment of record.** It is to be read as **U1 §8**, governing the
   **application** of U1 §§1–7 to the evidence-retrieval route, and is **numbered clause-for-clause
   identically** to the drafted §8 so that every existing cross-reference (for example *"§8.2(7)"*,
   *"§8.3(16)"*, *"§7.1(1) closure"*) continues to resolve. Where this act says *"§8.2(7)"* it means
   **§7 clause 7 below**.
4. U1 §§1–7 remain **in force, verbatim and unamended**, except that this act **adds** one route to the
   admitted set and **corrects one stale factual premise** about the fence baseline (§9(3)).
5. Any future consolidation of §7 into the U1 act file requires a **separate governed act** that first
   re-anchors or supersedes the three citations above. **This act does not perform that consolidation.**

---

## 7. The adopted amendment text — U1 §8 as amended by this instrument

> **STATUS OF THIS SECTION: RENDERED — EFFECTIVENESS CONDITIONAL ON §10 — NOT YET EFFECTIVE. NO
> IMPLEMENTATION IS AUTHORIZED BY IT (§12).** Clause numbering is **identical** to the drafted §8 so
> that all existing cross-references resolve. **Amended text is marked ◆.** Text carried forward
> unchanged from the published proposal is unmarked.

### 8. Additive evidence-retrieval route admission (`2026-11-05`)

This section is an **additive amendment under DEC-06 R-2/R-5**: U1 §§1–7 and §7.1 are **preserved
verbatim and byte-identical in their own instrument** (§6). Now that the PF-1 broker-import evidence
journal is implemented and merged (IRR PR #434), restart-proven across separate OS processes, idempotent
on `importId = sha256(broker ‖ contentDigest ‖ readAt)` and tamper-fail-closed on `recordDigest`; and now
that the read-only owner-scoped admission pattern is established and effective on the same IRR Node host
by the Direct P1 integration (IRR `9202e7a`, `2026-11-01`); the narrow evidence read anticipated by the
WS-A gap determination `WS-A-EVIDENCE-RETRIEVAL-ROUTE-AUTHORITY-GAP-2026-11-05` §4.1 is **admitted on
the existing IRR Node host**:

```text
GET /api/broker-import/:portfolioId/evidence/:importId
```

#### 8.1 Transport admission

1. **Exactly one route is admitted.** `GET /api/broker-import/:portfolioId/evidence/:importId`.
   **No list-and-enumerate variant is admitted.** A route that enumerates `importId` values for a
   portfolio, or that returns more than one record, is **not** authorized by this section and requires a
   further act.
2. **Route/method discipline.** Only `GET` is permitted on this path (other methods → `405 Allow: GET`).
   Any query string is refused (`400 invalid-request` **before** any socket). §7.1(1)'s closure is
   **preserved and extended, not relaxed**: `POST` remains the only method on `…/holdings`, `GET` the only
   method on `…/revision`, and **every other path under `/api/broker-import/` remains `404 not found`**,
   including `…/preview`.
3. **Handler order is identical to U1 §2.2 and §7.1(2)–(3).** C9 first-party signal is checked **first**
   (cross-site → `403 cross-site-request-refused`); `IIPS_G3_IPC_BINDING_PROVISIONED` is checked **next**
   (absent → `503 owner-context-unavailable` **before** any adapter or socket is constructed); the opaque
   `portfolioId` is validated via `validatePortfolioIdParam` **before any I/O**; then one scoped journal
   read. **No step may be reordered, skipped or made lazy.**
4. **Network invariant is preserved verbatim.** **No new HTTP/TCP listener. No new IPC operation.** The
   route is served by the **existing** IRR Node host and the **existing** Vite `/api` proxy.
5. ◆ **Non-disclosure on every refusal.** No stack, provider detail, owner, tenant, socket path, row
   value or identifier is echoed on any refusal. **Static reason only.** An `importId` that is absent,
   malformed, tombstoned, or **outside the single personal owner scope** is **indistinguishable** from one
   that is valid but not retained: **`404`** — never an enumeration signal, never `403`, never a partial
   record. *(Amended: the drafted wording "foreign … valid-but-unowned" presumed multiple owners. The
   **protection is retained in full** and re-expressed for a single-owner personal application: any
   `importId` not present in the owner's own scope yields the same opaque `404`.)*
6. **Response surface.** The retained record's **evidence fields only**: the parsed row inventory, the
   content and record digests, the per-row identity evidence, and the refusal details. **No canonical
   `companyId`**, consistent with U1 §2.3 and with the preview boundary. **No raw CSV bytes** — none are
   retained (P-4).

#### 8.2 Owner-context carrier and digest binding

7. ◆ **The carrier is established by this act, never by code.** Following the NP-06 R1 Option B shape,
   the scope literals for this route are **fixed here**:
   - **Personal tenant scope key (`tenantId`):** **`irr-personal-073dd1c8`**
   - **Canonical owner ID (`ownerUserId`):** **`owner-4dc756b3`**
   - **Carrier environment variable:** **`IIPS_BROKER_EVIDENCE_OWNER_PATH`** — a **separate** server-owned
     carrier file, distinct from `IIPS_OWNER_CONTEXT_PATH` (F-3) and `IIPS_REPORTS_OWNER_PATH` (NP-06 R1)
   - **Human-readable identity label:** **`SAIRAM`** — recorded at §3.6, **excluded from both partition
     keys**, never used for resolution, conferring no access on any person
   - **Derivation rule and integrity pin:** §3.3 and §3.7(2)–(3); carrier SHA-256
     **`27e70c10be68f42a7dc90e5d07669b2a4201c3b807ee0b9fb14e9247b06f8b2c`**, **367** bytes

   **These values are established by the PA's Decision 5 of `2026-11-05` and are recorded here as
   rendered.** IRR did not invent, infer or default them: the label and the requirement for an
   application-generated canonical ID are the PA's; the values follow deterministically from the rule the
   PA's requirement specifies. **No placeholder remains unfilled.**
   *(Amended: the drafted clause required two human-readable literals. The PA's Decision 5 requires a
   generated canonical ID plus a separate label, which also satisfies the F-1/F-2 §4.1 opacity rule that
   a personal name would fail — see §3.2.)*
8. **Digest binding.** The carrier's canonical bytes are bound by SHA-256 (§3.7(3)), recorded in the
   adopting act's post-merge receipt. The carrier **may never be the origin of a value change**: a change
   requires a **new governed PA act**.
9. **PF-1's boundary is respected, not crossed.** PF-1 `PersistenceService` remains *"a library authority,
   not an HTTP identity or access-control boundary"*. This section supplies the missing HTTP owner scope
   **from the act**; it does not convert PF-1 into an access-control boundary, and it does not mount PF-1
   on HTTP.
10. ◆ **No identity is read from the request.** The route reads **no** header, cookie, token, credential
    or query value as an identity source. Owner scope comes **only** from the act-fixed carrier plus the
    server-owned local binding precondition — **the trusted application context**, per the PA's Decision 5
    — exactly as the Direct P1 reads do. *(Amended: the phrase "trusted application context" is the PA's
    and is adopted as the normative description; it changes no mechanism.)*

#### 8.3 Retention and purge

11. **Locality.** Server-owned local data directory only (`IIPS_DATA_DIR`, TD-7a). **Never** a Git working
    tree, **never** a network store, **never** a third party, **never** a browser store.
12. ◆ **Scope.** One record per `importId`, within the **single personal owner scope**
    (`irr-personal-073dd1c8`, `owner-4dc756b3`); **append-only**; duplicate retention is a **no-op
    returning the first record unchanged**. *(Amended: "per tenant+owner" re-expressed as the single
    personal scope. The mechanical two-key equality partition is unchanged; no second scope exists.)*
13. **Raw bytes remain not retained.** Any change is a **separate act**, not an accommodation.
14. **Volatile fields.** P04 quarantine record ids are process-specific; the **first** retention is
    authoritative and a repeated import returns it unchanged. This limitation is carried inside every
    record and **must be carried in the route's response**.
15. **Integrity.** `recordDigest` is re-verified on **every** read. Tamper fails closed with
    `EVIDENCE_TAMPERED`. A storage failure propagates; **retention is never reported when the write
    failed.**
16. ◆ **Retention period and purge rule — FIXED BY THIS ACT.** Compaction is **not** built in v1 (PF-1
    TD-3), so no period may be inferred from code. The PA's Decision 6 of `2026-11-05` fixes:
    - **(a) Retention period: INDEFINITE** — no expiry, until explicit deletion by the application owner.
    - **(b) Purge rule: EXPLICIT OWNER-CONTROLLED DELETION ONLY.** No automatic expiry or deletion; no
      automatic purge; **no destructive compaction**; no scheduled, size-triggered, count-triggered,
      import-triggered, restart-triggered, error-triggered or quota-triggered deletion.
    - **(c) Purge basis: EXPLICIT-ONLY** — expressly **not** time-based and **not** count-based.
    - **(d) Integrity, history and audit metadata are preserved.** Append-only; no record rewritten; no
      history truncated.
    - **(e) Storage-usage visibility — OBLIGATION O-1 (§4.3).** Count, approximate bytes, location and
      threshold status must be visible to the owner **without any new endpoint**.
    - **(f) Backup and recovery safeguards — OBLIGATION O-2 (§4.3).** Owner-operated file-copy backup of
      the server-owned data directory, documented in the runbook; deterministic carrier
      re-materialisation; **no cloud sync and no third-party transmission**.
    - **(g) The 50 MB threshold is a WARNING/REVIEW threshold only** (§4.4), PA-settable, and is **never**
      an automatic deletion trigger. Crossing it changes no behaviour and destroys no data. **There is no
      quota.**
    - **(h) Purge is never reachable from the HTTP surface.** The admitted route is **read-only**, and
      **no `DELETE` is admitted anywhere in this namespace**. Owner-controlled deletion is exercised
      **outside** the HTTP surface, or by a **further act** (§4.5).

    **The drafted gate — "until (a)–(c) are filled … this section is not effective" — is satisfied as to
    content.** Effectiveness remains subject to §10.
17. **Restart.** Already proven across separate OS processes. **This section adds no new durability
    claim.**

#### 8.4 Reconciled consent

18. The adopting act must re-declare, **in the product's own words and in the UI copy**, all four of the
    following, and IRR must not implement the route until the copy is reconciled:
    1. that parsed broker-import evidence **is** retained locally in the owner's data directory — already
       true and already disclosed in the record's limitations, but the current page copy still says files
       are *"not uploaded or stored"*, and the two **must be reconciled**, not left to an implementation
       choice;
    2. that the **raw CSV bytes are not retained**, and that the retained equivalent is the parsed row
       inventory, the digests, the per-row identity evidence and the refusal details;
    3. ◆ that the retained evidence is **served only within the single personal owner scope of this
       application**, is **never transmitted to any third party**, and that **no route enumerates
       evidence records**; *(Amended: "another owner's records" presumed multiple owners. The
       non-enumeration guarantee is retained in full.)*
    4. that retention of evidence is **not** a save, **not** a validation, **not** an authorization and
       **not** durability of holdings — `savedRows` stays **0** and `WRITE_NOT_AUTHORIZED` is unchanged.

    ◆ **Additionally, per Decision 6:** 5. that retention is **indefinite until the owner explicitly
    deletes it**, that **no automatic deletion or purge occurs**, and that the **50 MB figure is a
    warning only**. *(New sub-item added by the PA's Decision 6; it is a disclosure obligation, and it is
    **not discharged by this act** — §12.)*

#### 8.5 Compatibility with the closed route boundary

19. **The closure is extended by exactly one leaf and is otherwise untouched.** `matchRoute()` currently
    admits `holdings` and `revision`; this amendment would admit `evidence` **only in the five-segment
    form** `api/broker-import/:portfolioId/evidence/:importId`. Four-segment
    `api/broker-import/:portfolioId/evidence` remains **`404`** — **no collection endpoint, no
    enumeration.**
20. ◆ **The `/api/user-portfolios*` write fence is unaffected.** Writes and context discovery on
    `/api/user-portfolios*` remain **`503 operation-not-admitted` even with a binding assertion**. This
    section admits **no** write anywhere. *(Amended: the drafted text recited a superseded "twelve-pair"
    baseline. The **current** baseline is **six admitted read-only pairs plus six still-fenced
    write/context pairs**, arising from the authorized Direct P1 read integration at IRR `9202e7a`. The
    **write fence is intact**; the correction is factual and weakens nothing — see §9(3).)*
21. **`owner-context-unavailable.ts` blob `cb8db45d668d28cee7e0a52721001d579a872733` stays
    byte-identical**, frozen and non-disclosing.
22. **Import safety is re-asserted.** `brokerImportImportSafety` must continue to hold: importing the
    route modules **listens, connects, writes and registers nothing**.
23. **`/api/evidence/:id` is untouched.** It remains a credential-free read of certified reference screen
    evidence. It is **not** reused, widened, repurposed or made to serve broker-import evidence.

#### 8.6 What this section does NOT authorize

24. ◆ Any write, any durable-success claim, any `durable: true`, any commit receipt, any fabricated
    `PortfolioRecord`. Any `W-1` change or relaxation. Any Gate 4 or Gate 5 movement. Any fence lift. Any
    P04 quarantine change. Any DP-2 Option 2F change. Any real-user durable save. **Any production
    deployment, production scope or production admission.** Any change to IPD. Any new HTTP/TCP listener.
    Any new IPC operation. Any enumeration of evidence records. Any raw-byte retention or retrieval. Any
    third-party transmission. Any change to a dependency pin. Any D05 deposition. Any automatic deletion,
    purge or destructive compaction. Any `DELETE` method or destructive HTTP operation anywhere in this
    namespace. Any new endpoint for storage visibility or backup. **Any second user, shared account,
    delegated access, role, group, tenant selection or enterprise identity surface.** Any use of the label
    `SAIRAM` as a partition key, credential or authorization input. **Retention of evidence is not a save,
    not a validation and not durability of holdings.** *(Amended: the prohibitions on automatic deletion,
    `DELETE`, visibility/backup endpoints, second-user and enterprise-identity surfaces, and on using the
    label as a key are **added** by the PA's Decisions 5 and 6. Production scope remains prohibited, per
    the PA's context that there is no production deployment.)*

#### 8.7 Publication and effectiveness

25. ◆ This section becomes effective **only** upon **all** of: **(i)** the PA's adopting act with an
    assigned Act ID and the §8.2(7) scope literals and §8.3(16) retention values filled — **DISCHARGED by
    this instrument** (§3, §4, §5); **(ii)** publication to IRR `main`; **(iii)** green **exact-head** and
    **post-merge `main`** CI; and **(iv)** independent remote read-back, including verification that the
    U1 act file remains **byte-identical** at blob `a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9`.
    Publication coordinates are recorded **exclusively** in the post-merge tracker receipt and are
    **never self-embedded** in this act. **(ii)–(iv) are PENDING — see §10.**

---

## 8. Multi-tenant and production-oriented assumptions removed

Each removal is enumerated with the clause it affects and the protection retained, so that "removing an
assumption" is never confused with "removing a safeguard". **No protection is weakened by any removal.**

| # | Assumption removed | Where | What is retained |
| :-- | :--- | :--- | :--- |
| 1 | That the tenant key denotes one tenant among many | §7 cl. 7, 12 | The **two-key equality partition** PF-1 requires; fixed to **one** permanent personal value; **no** tenant selection, enumeration or management (§3.9(3)) |
| 2 | "foreign … valid-but-unowned" framing, presuming multiple owners | §7 cl. 5 | The **full indistinguishability protection**: any `importId` outside the owner's scope yields the same opaque `404`, never `403`, never a partial record, never an enumeration signal |
| 3 | "no route enumerates **another owner's** records" | §7 cl. 18(3) | The **stronger** single-scope statement: **no route enumerates evidence records at all**; no collection endpoint; four-segment `…/evidence` stays `404` |
| 4 | Partition-isolation language implying cross-tenant leakage risk | §3.8 dispositions 4, 8 | Isolation **from the F-3 and Reports route families** is retained and is a real protection; aliasing remains **prohibited** |
| 5 | Precautionary production-deployment framing | §7 cl. 24 | **Production scope remains expressly prohibited** — the PA's context confirms there is no production deployment, so the prohibition is **strengthened**, not relaxed |
| 6 | Any implication of roles, permissions, groups or claims | §3.8 dispositions 9, 10 | Values remain **partition keys only**, `EQUALITY_PARTITION_ONLY`, conferring **no** role, permission or privilege |
| 7 | Any implication that the owner label identifies a person who may access the system | §3.6(4) | The label confers **nothing**; **no second user, no shared account, no delegation** |
| 8 | The drafted requirement for two **human-readable** literals | §7 cl. 7 | Replaced by a **generated canonical ID** plus a separate label — which additionally **satisfies** the F-1/F-2 §4.1 opacity rule the drafted form would have **failed** (§3.2) |
| 9 | The superseded "twelve-pair" fence baseline | §7 cl. 20 | The **write fence is intact**; the baseline is corrected to **six admitted read-only + six still-fenced** pairs (§9(3)) |

**Not removed, because they are not multi-tenant assumptions but verified mechanical or protective
facts:** PF-1's two-key API (§3.2 R5-5); the `503 owner-context-unavailable` fail-closed behaviour; the
carrier-outside-Git rule; the per-request uncached evaluation; digest binding; tamper fail-closed;
import safety; the network invariant.

---

## 9. Preserved authority boundaries

1. **U1 act byte-identity.** `…ACT_EFFECTIVE_2026-10-23.md` remains blob
   **`a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9`**, **13,357** bytes, **unmodified** (§6). The prepared
   act remains blob **`966891d4c7016a5e993e609a03488c8719499e3e`**.
2. **No write authority.** `W-1(3)`/`W-1(4)` remain false → `evaluatePortSaveGuard()` false →
   `WRITE_NOT_AUTHORIZED`, `storeEffect 'NONE'`, **zero rows saved**. `savedRows` stays **0**.
3. **Fence baseline, corrected factually and weakened not at all.** The current state is **six admitted
   read-only pairs** (GET/HEAD on `/api/user-portfolios`, `/:portfolioId`, `/:portfolioId/revisions`) plus
   **six still-fenced write/context pairs** returning `503 operation-not-admitted` **even with** a binding
   assertion (`POST /api/user-portfolios`, `DELETE /:portfolioId`, `PUT /:portfolioId/holdings`,
   `POST /:portfolioId/reset`, `GET /:portfolioId/context`). This arises from the **authorized** Direct P1
   read integration at IRR `9202e7a` (`2026-11-01`) — another session's completed work, **preserved, not
   questioned, not reverted**. `owner-context-unavailable.ts` blob `cb8db45d…` remains frozen.
4. **P04 quarantine IN FORCE.** Unchanged. **DP-2 Option 2F** unchanged.
5. **Gate 4** remains **AUTHORIZED — NOT STARTED**, **QE 0/11**, **Gate C and U4 NOT RENDERED**, **PA-09
   OPEN**, P-1 **AUTHORIZED — ONE ATTEMPT — UNSPENT**, P1-F **NOT RECONCILED / `RETRY_BLOCKED`**, host
   `desktop-no0nhtp` **unreachable**. **Gate 5 NOT INITIATED / NOT ADMITTED.** **DQ-4 8/10.**
6. **No pin change by this act.** Verified at the authoring baseline: broker-import
   **`#07e86a4f2c105651f3097a96cb519f8611945e30`** (advanced by the **concurrent, separately authorized**
   PR #446 — **not by this act**), np04 **`#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`**,
   production-market-data **`#279d1eed184f5e23bbabe5c6411085e120ce9e41`**. Clause 24 continues to prohibit
   any pin change **by this amendment**.
7. **No IPD change. Zero IPD writes.** IPD was read by anonymous HTTPS only.
8. **No real-user save authorized, implied or advanced.** No D05 deposition. No fabricated ISIN or D05
   row. D05 master revision `BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001` /
   `fileChecksumSha256 7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5` /
   `recordCount 2250` / `operatorId OPERATOR_ADMIN_GOVERNED_01` — **UNCHANGED**.
9. **`IIPS_BROKER_IMPORT_EVIDENCE_V1` unchanged.** `brokerImportHttp.ts` remains at **exactly two**
   admitted routes and is **not modified** by this act.
10. **`U-5` remains NOT RUN.** No QE execution, no native Windows run, no PowerShell parse, no
    current-dist check, no S2 rerun.

---

## 10. Publication and effectiveness

**Model.** U1 §6 provides: *"Rendered …; effective on rendering; proven from `main` only by the merge
commit and remote blob read-back … If publication fails, the route stays unregistered and this record may
not be cited as admission authority."* Drafted §8.7(25) makes the conditions explicit and conjunctive.
This act adopts the **conjunctive** form, because it is the stricter and the more recently drafted rule.

| Condition | State at authoring |
| :--- | :--- |
| **(i)** PA adopting act, Act ID assigned, §8.2(7) and §8.3(16) filled | **DISCHARGED** — this instrument; Act ID §5.3; scope literals §3.3/§3.7; retention §4.2 |
| **(ii)** Publication to IRR `main` | **PENDING** — performed by the PR carrying this act |
| **(iii)** Green **exact-head** CI **and** green **post-merge `main`** CI | **PENDING** |
| **(iv)** Independent remote read-back, including U1 blob `a3ae368d…` byte-identity | **PENDING** |

**∴ STATUS: RENDERED — EFFECTIVENESS CONDITIONAL — (ii)–(iv) PENDING.** Until all four are discharged
**and recorded in a post-merge receipt**, this act **may not be cited as admission authority**, the route
**stays unregistered**, and blocker `WS-A-EV-ROUTE-1` **remains open**. A receipt **cannot** be part of
the commit it verifies, so the discharge is recorded by a **follow-up** instrument (§12).

```text
U1 AMEND-01: RENDERED — EFFECTIVENESS CONDITIONAL — PUBLICATION VERIFICATION PENDING
Route admitted by text: GET /api/broker-import/:portfolioId/evidence/:importId
Route registered in code: NO — NOT IMPLEMENTED, NOT AUTHORIZED YET
Owner scope: (irr-personal-073dd1c8, owner-4dc756b3); label SAIRAM (not a key)
Retention: INDEFINITE; deletion EXPLICIT-OWNER-ONLY; automatic purge PROHIBITED
Write scope: NOT AUTHORIZED (W-1 unmet; savedRows 0)
Fences: UNCHANGED (six admitted read-only pairs; six write/context pairs still 503)
Pins: UNCHANGED BY THIS ACT
IPD writes: ZERO
```

---

## 11. Remaining PA decisions and technical blockers — reported precisely

These are **genuine** remaining items. **None** of them reopens decisions 5, 6 or 7.

**(1) The deletion surface — a PA decision is required if deletion is to be reachable in-product.**
Decision 6 requires *explicit owner-controlled deletion*; clause 16(h) and clause 24 prohibit any
`DELETE` or destructive operation on the admitted HTTP surface, and this act preserves that prohibition
(§4.5). **As rendered, owner-controlled deletion is exercisable only outside the HTTP surface** — an
explicit owner action on the server-owned data directory, documented in the runbook. **If the PA wants
deletion available in the product's own UI or API, that requires a further act**, and the PA must decide
whether to seek one. **This act does not decide it, and does not admit it.**

**(2) Obligations O-1 and O-2 are not dischargable by the evidence route alone.** Storage-usage
visibility and backup/recovery safeguards (§4.3) are **new implementation scope** created by Decision 6.
They **cannot** be discharged by adding an endpoint, because clause 1's non-enumeration guarantee and
clause 24's prohibitions forbid one. They must be discharged through the already-admitted response
surfaces, server-side logging, and runbook documentation. **This is a technical constraint on
implementation, not a PA decision** — but the PA should know that Decision 6 **widens** the eventual
implementation beyond the single read route originally scoped, and that **A-9's completion criteria now
include O-1 and O-2**.

**(3) "Bind personal holdings … to this owner" reaches beyond A-8's evidence scope.** Decision 5's third
requirement mentions **personal holdings** as well as evidence. This act gives effect to it **for the
broker-import evidence journal**, which is what A-8 concerns. **Durable holdings persistence is a
different domain**, governed by F-3 / NP-06 / the NP-04 lineage, and is **fenced**: `W-1` is ON, writes
terminate in `WRITE_NOT_AUTHORIZED`, and `savedRows` is 0. **Extending the canonical owner identity
`owner-4dc756b3` to durable holdings persistence is NOT authorized by this act** and would require its
own governed decision, because it would touch a fenced domain and a different carrier. **If the PA
intends that extension, it is a separate decision — reported here, not assumed.**

**(4) Decisions 1–4 (A-10) remain PENDING, and Decision 3's coordinate has moved.** The PA has not
rendered the four Gate 4 decisions. **Additionally, a material change of fact occurred during this pass:**
concurrent **PR #446 merged at `d7cd3b65`** (`2026-11-05T13:35:06Z`) and advanced the broker-import pin
from **`7bcae35`** to **`07e86a4f`** (IPD PR #128). **∴ the alias coordinate that Decision 3 would
ratify is no longer `7bcae35`; it is now `07e86a4f`.** Decision 3's *substance* — ratify the alias at
whatever the live authorized coordinate is, moving no pin — is unchanged, but **its named coordinate must
be re-censused before the PA signs**. Decision 1's substance is likewise unchanged, but its mandatory
statement that the Gate 4 content pin is *"not the broker-import consumption pin"* now refers to
`07e86a4f`. **The published decision paper is not rewritten**; this act records the change of fact, and
the tracker carries it forward.

**(5) Consent-copy reconciliation (clause 18) is an implementation precondition, still outstanding.** The
product's page copy still says files are *"not uploaded or stored"* while parsed evidence **is** retained
locally. Clause 18 requires reconciliation **before** implementation. **Not discharged by this act**; it
is a UI-copy change and therefore implementation.

**(6) No technical blocker remains to effectiveness.** Conditions (ii)–(iv) are ordinary publication and
verification steps, executable now under the standing grant (DEC-06 R-1). **Blocker `WS-A-EV-ROUTE-1`
closes on their discharge**, not on any further PA decision — subject to items (1)–(5) above, which are
**scope** items, not effectiveness blockers for the read route itself.

---

## 12. Implementation NOT authorized by this act

**Nothing is implemented here.** Recorded so that no ambiguity survives:

| Step | File | Status |
| :--- | :--- | :--- |
| Extend `matchRoute()` to the five-segment `evidence` form only | `frontend/server/broker-import/brokerImportHttp.ts` | **NOT WRITTEN** — file unmodified by this act |
| Owner-carrier module for the route | new file, NP-06 R1 shape, per §3.7 | **NOT WRITTEN** |
| Scoped read handler with the clause-3 order | `frontend/server/broker-import/` | **NOT WRITTEN** |
| Route-surface tests (`405`, `400` on query string, `404` non-enumeration, non-disclosure, tamper fail-closed) | new tests | **NOT WRITTEN** |
| Fence re-assertion at the **current** baseline (§9(3)) | `frontend/server/user-portfolio/fenceUnchanged.test.ts` | **NOT MODIFIED** |
| Import-safety re-assertion | `brokerImportImportSafety` | **NOT MODIFIED** |
| Consent-copy reconciliation (clause 18) | UI copy | **NOT MODIFIED** |
| O-1 storage-usage visibility | response surfaces / logging / runbook | **NOT IMPLEMENTED** |
| O-2 backup/recovery safeguards | runbook documentation | **NOT IMPLEMENTED** |
| Owner-controlled deletion outside HTTP (§4.5) | runbook documentation | **NOT IMPLEMENTED** |
| Vite `/api` proxy | `frontend/vite.config.ts` | **No change required** — clause 4 admits no new listener |

**Implementation of A-9 becomes authorized only after** §10's conditions (ii)–(iv) are discharged and
recorded in a post-merge receipt. At that point A-9 is authorized **with** the clause-3 handler order, the
current fence baseline re-asserted byte-stable, import safety re-asserted, consent copy reconciled per
clause 18, and obligations O-1 and O-2 discharged — and **targeted tests only**, for files actually
changed.

---

## 13. Scope and non-claims

This act renders the PA's decisions 5, 6 and 7 and adopts the reconciled amendment text. It does **not**:

- implement, register, mount, expose or test any route, handler, carrier module or endpoint;
- represent the amendment as **effective** — §10's conditions (ii)–(iv) are **PENDING**;
- modify the U1 act, the prepared U1 act, the A-8 package, the gap record, the NP-06 R1 act, the F-1/F-2
  value act, PF-1, any fence test, any schema, any pin, any lockfile or any workflow;
- admit any `DELETE`, any destructive operation, any enumeration, any collection endpoint, any new
  listener, any new IPC operation, or any second user;
- authorize any write, any durable-success claim, any real-user save, any production scope, any Gate 4 or
  Gate 5 movement, any fence lift, any P04 or DP-2 change, any D05 deposition, or any IPD change;
- extend the canonical owner identity to durable holdings persistence (§11(3));
- decide the deletion surface (§11(1));
- reopen decisions 5, 6 or 7, or reopen A-1…A-4, A-16 or A-17;
- claim that any test, typecheck, build, server or runtime probe was run for this act — **no code
  changed**, so none was needed;
- claim that runtime persistence, global uniqueness or restart stability of the **new** pair has been
  tested or demonstrated. Mirroring the F-1/F-2 act's own non-claims: those matters belong to the
  implementation gate. **What is claimed** is conformance (§3.4), uniqueness (§3.5) and deterministic
  reproducibility (§3.3) — all verified at authoring.

---

*Program Authority: Ramki. Personal, single-user application. Personal owner identity label: `SAIRAM`.
Canonical owner ID: `owner-4dc756b3`. Personal tenant scope: `irr-personal-073dd1c8`.*

***Status: RENDERED BY PA DECISIONS 5/6/7 OF `2026-11-05` — EFFECTIVENESS CONDITIONAL ON §10 —
(ii)–(iv) PENDING — NOT YET EFFECTIVE — IMPLEMENTATION NOT AUTHORIZED.***
