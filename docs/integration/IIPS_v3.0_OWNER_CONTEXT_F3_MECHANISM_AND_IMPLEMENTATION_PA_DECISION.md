# IIPS v3.0 — Owner Context F-3 Mechanism Decisions & Per-Capability Implementation Authorization

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-OWNER-CONTEXT-F3-MECHANISM-AND-IMPLEMENTATION-PA-DECISION-01` |
| Record type | Formal Program Authority decision record: (a) resolves the F-3 mechanism determinations left OPEN by `IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PA-DECISION-01` §5.2; (b) grants the implementation authorization required by that record's §9(2); (c) grants **separate, explicit per-capability implementation authorizations** for NP-09, NP-10 and NP-11 as §9(4) requires |
| Status | **AS AT PREPARATION: DECIDED — RECORDED. NOT PUBLISHED — NOT EFFECTIVE.** Publication status is superseded post-publication; see the closure note at the end of this record. |
| Decision date | 2026-10-12 |
| Prepared against baseline | `ramkivs/iips-review-recovered` `refs/heads/main` = `709b27d63161d7f0df840218ad5156b86ea49b97` — re-verified live at preparation; **`main` had not moved** (no commits after it, no open pull requests) |
| Governing records | `IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PA-DECISION-01`; `IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01` (effective); `IIPS-V3-OWNER-CONTEXT-PA-DECISION-FINAL-01`; `IIPS-V3-GLOBAL-NO-AUTH-PA-DECISION`; D-1, D-1 ext, D-2, G-2, AD-05, NP-08-D115 |
| Value-selection authority | **NOT EXERCISED.** `owner-7f3a91c2` and `irr-domain-4b82d6e1` are consumed as already-established effective values and are **preserved unchanged**. |
| Implementation authority | **GRANTED — see §4** (narrowly bounded; separate per capability) |
| Qualification | **NOT GRANTED BY THIS RECORD** — see §8 |
| F-6 inventory | **REMAINS UNDECIDED** — see §9 |

---

## 1. Purpose and authority

### 1.1 Purpose

`IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PA-DECISION-01` approved the F-3 **design direction** (Option B carrier bound to Option A authority under Option C's fail-closed discipline) and preserved ten binding, unresolved requirements (§5.2). Its §9 sequence required, in order: the value act ✓ (effective), the **implementation gate** (§9(2)) — this record — and per-capability gates (§9(4)).

This record closes §9(2) and grants the §9(4) authorizations without creating sequential governance cycles, by resolving every mechanism determination in one decision and recording a **separate, explicit implementation authorization for each capability**.

### 1.2 Authority provenance

The Program Authority is the single user of this single-user application. On 2026-10-12 the Program Authority granted standing authorization for this workstream, recorded here transcribed **without addition, narrowing or reinterpretation**:

> "The single user is the Program Authority and has explicitly granted global decision and execution authority for this project. This standing authorization covers the necessary decisions, governance records, implementation, testing, corrections, and publication within the established scope. Do not request repeated approval for individual decisions or routine implementation steps. The authorization does not permit fabricated evidence, weakened safeguards, unrelated scope expansion, or claims of success without verification."

**Limits carried into every disposition below.** The authorization does **not** permit: fabricated evidence; weakened safeguards; unrelated scope expansion; claims of success without verification. This record therefore grants **no** authority beyond §4, and every disposition in §3 is constrained by §5.

**Values are not reopened.** The authorization for this workstream is an implementation/mechanism authorization. It is **not** a value-selection act, and it expressly preserves the established values (§5.1). No value is selected, changed, regenerated, reformatted or reinterpreted by this record.

---

## 2. Baseline

| Item | Verified value |
|---|---|
| Repository / ref | `ramkivs/iips-review-recovered` / `refs/heads/main` |
| Baseline commit | `709b27d63161d7f0df840218ad5156b86ea49b97` (merge of PR #67) |
| Baseline tree | `942343c4861656e28fcb01c4627aac2d0ed95044` |
| Freshness check at preparation | `main` **unchanged**; 0 commits after the baseline; 0 open pull requests |
| Product-state assessment, prior proposal | The predecessor proposal (`/home/user/F-3-CONSOLIDATED-PA-ACT-PROPOSAL-DRAFT.md`, prepared outside the repository) is **non-durable lineage evidence** and is superseded by this record. Its findings were re-verified against source before being relied upon here; where this record's §3 differs from that proposal's non-binding recommendations, **this record governs**. |

---

## 3. Resolved mechanism determinations (F1/F2/F3 §5.2 closure)

Every determination below resolves an item that F1/F2/F3 §5.2 recorded as **OPEN**. Each is a decision of the Program Authority, not a recommendation.

### 3.1 M-1 — Carrier grammar, format, schema version and canonical byte representation

**Resolved.**

1. **Format:** a single JSON document, UTF-8, **no BOM**, no comments, no trailing content.
2. **Schema version:** `carrierSchemaVersion: 1`. A grammar change requires a new governed act and a new integrity digest; the reader fails closed on any other value.
3. **Exact key set (order significant, no extras):** `carrierSchemaVersion`, `ownerUserId`, `tenantId`, `governedBy`.
4. **`governedBy` block (F-3 property 6 audit/evidence trail), exact key set:** `recordId`, `recordPath`, `recordBlob`, `decisionDate`.
5. **Canonical byte representation (binding):** UTF-8 without BOM; two-space indentation; the key order of (3)/(4); no trailing whitespace on any line; **exactly one trailing LF**. Canonicalisation is **not** performed by the reader — the file must *be* the canonical form. Any deviation is an integrity mismatch and fails closed.
6. **The carrier is NOT journal data.** It is never written through `PersistenceService`, carries no `JOURNAL_FORMAT_VERSION`, and no TD-2/TD-3 semantics attach to it. `JOURNAL_FORMAT_VERSION` remains `1`, unchanged.
7. **The exact canonical content is normative and is recorded verbatim in §3.7.** The carrier is its materialisation and nothing else.

*Basis:* F1/F2/F3 §4.3(1)–(3); §5.2(1), (6); the repository's treatment of canonical byte form as a governance matter (`NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD.md`; `.gitattributes`). `.gitattributes` cannot serve this file (it lives outside version control), so canonical form is fixed by the grammar itself.

### 3.2 M-2 — Server-owned path seam and carrier location

**Resolved.**

1. **Seam:** the server-owned environment variable **`IIPS_OWNER_CONTEXT_PATH`**, naming the carrier file. It mirrors `serverOwnedDatabasePath()` / `IIPS_NP04_DATABASE_PATH` (`frontend/server/reports/persistence-port.ts`): read from the process environment, **never** from a request; a non-empty string yields the path, anything else (absent, empty, non-string) yields no owner context.
2. **Filename:** `owner-context.json`.
3. **Location:** the TD-7a server-owned local-development data domain, **outside the repository working tree**. The carrier is **never** committed, staged or tracked, and materialisation **refuses** any target inside a Git working tree.
4. **TD-7b (production data-dir/deployment regime) remains deferred** and is untouched by this record.

### 3.3 M-3 — Integrity binding and authorised-change detection

**Resolved.** The carrier is bound to its governing declaration by the **SHA-256 of its canonical bytes**, pinned as a repository-visible constant (`OWNER_CONTEXT_CARRIER_SHA256`) in the resolver module.

**Why this design, and why it is coherent with the carrier's location.** The carrier must live outside version control (§3.2), so version control cannot supply its integrity. Pinning the expected digest in **repository-visible, reviewed, merged code** supplies it instead: the local carrier cannot become effective unless it is byte-identical to the materialisation of the governing act, and any change to the pair requires a governed change to merged repository code. This is what keeps **change authority with the PA act** and changes **repository-visible** (F1/F2/F3 §5.2(4)) even though the carrier itself is local.

**Two independent gates, both fail closed:**

- **Gate 1 — integrity.** The bytes must hash to the pinned digest. Unrecognised bytes are never parsed as governance input.
- **Gate 2 — grammar, audit trail and value.** The document must be exactly the authorised grammar and must carry exactly the approved pair.

**Authorised-change detection (stated exactly).** Detected: any local edit to the carrier — including a value edit, a reformat, added or removed keys, whitespace changes, and a doubled trailing newline — because each changes the bytes and therefore the digest. **Not detected by digest alone**, and therefore governed by a different control: an unauthorised change to the *pinned digest constant itself*, which is a change to reviewed repository code and is caught by ordinary code review and by the record/hash lineage in §3.7 and the implementation record. No secret, key or signature surface exists or is introduced (Option H-4 was excluded: it would require its own key-custody governance and the global no-auth decision forecloses identity machinery).

*Basis:* F1/F2/F3 §4.3(2), §5.2(1), (4), (5); global no-auth decision.

### 3.4 M-4 — Resolution of the `.gitignore` / TD-7a discrepancy

**Resolved — the discrepancy is REMEDIED by this act, explicitly and as an enumerated change.**

**Verified state at baseline.** The TD-7a doc comments in `frontend/server/persistence/persistence-service.ts` describe the data directory as *"gitignored"* (L31–L33, L107). `.gitignore` contained **no** `.iips-data` entry: `git check-ignore -v .iips-data` returned exit 1 (not ignored) and `grep -i iips .gitignore` matched nothing. The claim was therefore **false as written**. `IIPS-V3-OWNER-CONTEXT-PA-DECISION-FINAL-01` §7(6) recorded it as a *"separate data-safety finding (recorded, not fixed here)"* and §9 withheld authority to change `.gitignore`; F1/F2/F3 §5.2(8)/§9(2) required it resolved before the implementation gate.

**Decision.** Add **`.iips-data/`** to `.gitignore`, as a **separately enumerated, explicitly authorised** one-line change (§4.1(5)) — never as an implied consequence of another change.

**Consequences, stated:** the TD-7a contract statement becomes true as written (so no comment edit is required and the governed contract file's prose is left intact); owner-scoped local data can no longer be committed by an ordinary `git add -A`; and — recorded honestly — **the carrier remains non-repository-visible either way**, because a gitignored file is not under version control. Carrier-change detection therefore rests on §3.3, which is why M-3 is recorded as the load-bearing control for that property.

### 3.5 M-5 — Resolver lifecycle, validation and failure behaviour

**Resolved.**

1. **Lifecycle: per request, uncached.** Resolution re-reads the carrier on every owner-scoped request. Rationale: the file is small; and per-request resolution removes every stale-cache failure mode — tampering takes effect on the next request, and recovery takes effect immediately **with no restart**. This is the NP-04 per-request pattern that F1/F2/F3 §4.5(2) records as acceptable and thereby resolves that implementation-gate choice.
2. **Input surface: none.** The resolver accepts no request argument. It consults exactly one thing: the server-owned seam (§3.2). It never reads a body, query, header, cookie, browser state, session or principal; it never infers, generates, defaults or substitutes an identity.
3. **Failure taxonomy (all fail closed to `null`):** `path-not-configured`, `carrier-unreadable` (absent, directory, permission failure, dangling path), `carrier-empty`, `carrier-too-large`, `integrity-mismatch`, `malformed-json`, `malformed-grammar`, `invalid-value`. A failure reason exists for server-side operators, evidence and tests only and is **never disclosed over HTTP**.
4. **Only output:** the frozen approved pair, or `null`. The resolver **cannot** return any pair other than the approved one: after both gates pass, the parsed values are compared against the approved literals and any other pair yields `null`.
5. **Recovery (F-3 property 4, now defined):** re-materialisation from this record's canonical content (§3.7). Deterministic, reproducible, and materialisation writes nothing but those bytes.
6. **Wiring:** `null` is consumed by the owner-scoped transports as the existing HTTP **`503 owner-context-unavailable`**, which is **preserved verbatim and unmodified** (the helper, its body and its reason string are untouched).

### 3.6 M-6 — Malformed-input and length limits

**Resolved.**

| Limit | Value |
|---|---|
| Maximum carrier file size | **4096 bytes** (exceeded ⇒ fail closed) |
| Maximum governed partition value length | **128 characters** (exceeded ⇒ fail closed) |
| Partition values must contain no NUL | enforced (compound dedup-key component) |
| Maximum request body accepted by the three transports | **65536 bytes** (exceeded ⇒ HTTP `413`) |
| Non-JSON request body | HTTP `400` (`invalid-json`) |

*Note:* the approved values are 14 and 19 characters, so the length bound is a format guard and not a constraint on them.

### 3.7 M-7 — The canonical carrier content (normative)

363 bytes, SHA-256 `d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4`:

```json
{
  "carrierSchemaVersion": 1,
  "ownerUserId": "owner-7f3a91c2",
  "tenantId": "irr-domain-4b82d6e1",
  "governedBy": {
    "recordId": "IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01",
    "recordPath": "docs/integration/IIPS_v3.0_OWNER_CONTEXT_F1_F2_VALUE_ACT.md",
    "recordBlob": "f90c9325f49d33f378f3fc0936c28f4979164b2e",
    "decisionDate": "2026-10-12"
  }
}
```

(with exactly one trailing LF, which is not visible above). This content is a **materialisation of the effective value act**, not a new value act. `recordBlob` is the blob of the effective governing record at the verified baseline.

---

## 4. IMPLEMENTATION AUTHORIZATION (bounded)

**Granted by the Program Authority, limited to the enumerated items below and to nothing else.** Authorization is recorded **separately for each capability**, satisfying F1/F2/F3 §9(4) without sequential governance cycles.

### 4.1 Shared mechanism authorization (all three capabilities)

1. **Owner-context resolver module** — a new server-owned module implementing §3.5 exactly. It reads only the §3.2 seam; it infers nothing; its only output is the approved pair or `null`.
2. **Carrier definition module** — a new module holding the approved literals, the canonical content of §3.7, the pinned digest of §3.3, and the deterministic materialisation function.
3. **Server-owned carrier file** — created in the TD-7a data domain, **outside the repository working tree**, byte-identical to §3.7. It may not be created inside the repository and may not be committed.
4. **Shared owner-scoped HTTP helpers** — bounded body reading, JSON response serialisation, and the composition-failure response. No ownership semantics.
5. **`.gitignore`** — the single enumerated addition decided at §3.4.
6. **Historical doc-comment reconciliation** — F1/F2/F3 §5.2(9) requires the consumer headers that still describe supply *"from the authenticated principal"* to be reconciled, documentation-only. Authorized for the two files named by that record and for the same-class sentence in the Settings service header.

### 4.2 NP-09 Watchlists — separate implementation authorization

Authorized: wiring the resolver into `frontend/server/watchlists/watchlists-transport.ts`; completing the **governed-universe integration** the existing `addItem` / governed-row behaviour requires (the composition supplying a `GovernedUniverseProvider`); and serving the existing `watchlists-service.ts` commands on the valid path. Service semantics, journal format, schema and validation are unchanged.

### 4.3 NP-10 Collaboration — separate implementation authorization

Authorized: wiring the resolver into `frontend/server/collaboration/collaboration-transport.ts`; completing the **governed-reference integration** the existing service and resolver design requires — `buildCollaborationResolversFor(tenantId, ownerUserId, provider)` over a composition-supplied `GovernedReferenceProvider`, including governed-vintage pinning and disclosure; and serving the existing `collaboration-service.ts` commands on the valid path. Service semantics, journal format, schema, validation and the closed reference set are unchanged.

### 4.4 NP-11 Settings — separate implementation authorization

Authorized: wiring the resolver into `frontend/server/settings/settings-transport.ts` and serving the existing `settings-service.ts` commands (read, update, reset) on the valid path. No governed provider dependency is required. Service semantics, journal format and schema are unchanged.

### 4.5 Composition authorization

Authorized: passing the composition-supplied governed providers from `frontend/server/executive-transport.ts` at the three existing route branches. **This explicitly includes modifying the composition file**, which the prior proposal had flagged as unresolved (its DEC-7/DEC-8). No route, prefix, ordering or dispatch condition of any other route is changed.

### 4.6 Authorized contract decisions (delegated)

The Program Authority delegates to the implementation the smallest coherent HTTP contract consistent with the existing client contracts (`frontend/src/api/*.ts`) and service APIs, to be **documented** in the implementation record and not invented silently. That delegation is exercised in the implementation record §3.

---

## 5. Binding invariants

1. **Preserve the approved F-1 value `owner-7f3a91c2`.** No change, regeneration, re-derivation, reformatting, substitution or reinterpretation. A change requires a new PA governed decision **plus** a separately governed data-reconciliation decision (value act §5(3)).
2. **Preserve the approved F-2 value `irr-domain-4b82d6e1`.** Same rule; the pair changes together or not at all.
3. **Do not infer an owner or tenant identity** — from any request, header, cookie, browser state, session, principal, company identifier, IPD `applicationUserId`, G24/Reports `userId`, or any other domain's identifier. No defaulting. No fallback identity. No synthetic principal.
4. **Preserve HTTP `503 owner-context-unavailable`** whenever valid owner context cannot be established — absent seam, absent file, unreadable file, empty or oversize file, malformed content, invalid value, integrity mismatch, or any partially valid pair. **The safeguard's code, body and reason string are unchanged.** Failure remains per-route, never process-fatal.
5. **Preserve existing service logic, journal formats, schemas and persistence semantics** except where a separately identified decision explicitly authorises a change. Concretely: `JOURNAL_FORMAT_VERSION` unchanged; TD-2 signatures unchanged; `persistence-service.ts` semantics unchanged; per-capability journal subdirectories unchanged; the pair continues to flow through the existing leading `(tenantId, ownerUserId)` parameters.
6. **No authentication, OIDC, session, token, principal, RBAC or multi-user identity mechanism.** The pair carries partition semantics only and is not an authorization credential.
7. **No IPD change, no IRR↔IPD mapping or equivalence.** Any future cross-domain binding requires a governed D-2 §8 translation contract.
8. **No F-6 inventory, inspection, migration, reconciliation, reassignment, partition rewrite, deletion or exposure of user data.** `F6_INVENTORY_AUTHORIZED` remains UNDECIDED.
9. **Reports (NP-06) and Portfolios (G-2) remain deferred** and must keep their unconditional owner-context unavailability.
10. **No capability is admitted or qualified by this record** (§8).
11. **The carrier and all owner-scoped local data remain outside version control** and are never committed.

---

## 6. Explicit non-authorizations

This record does **not** authorize, and nothing in it may be read as authorizing:

1. Any change to the approved F-1 or F-2 value, or to any journal written under them.
2. Any weakening, bypass or relaxation of the `503 owner-context-unavailable` safeguard, or any success path that does not require an established valid owner context.
3. Any inference, defaulting, generation or fallback of an owner or tenant identity.
4. Any authentication, session, token, RBAC, multi-user or identity-provider mechanism.
5. Any IPD change, IRR↔IPD mapping or equivalence, or any cross-domain translation.
6. Any journal migration, reconciliation, partition rewrite, deletion, schema change, or `JOURNAL_FORMAT_VERSION` change; any change to `persistence-service.ts` semantics.
7. Any F-6 inventory, inspection, listing, scan or access to user data or runtime journals.
8. Any Reports (NP-06) or Portfolios (G-2) implementation, admission or enablement.
9. Any capability qualification (see §8).
10. The TD-7b production data-dir or deployment regime; production activity of any kind.
11. Any change to `.gitattributes`, to the canonical byte grammar decision, or to the repository line-ending policy.
12. Any reopening of D-1, D-1 ext, D-2, AD-05, G-2, NP-08-D115, the global no-auth decision, or any accepted governance decision.
13. Unrelated product work of any kind; scope expansion beyond §4.

---

## 7. Required implementation evidence

Produced by the implementation gate and recorded in the implementation record, with **actual** results — never inferred, never a plan:

1. Valid owner-context behaviour for each of the three capabilities through its intended HTTP interface.
2. Fail-closed behaviour for **absent**, **malformed**, **invalid** and **integrity-mismatched** carrier content, for every in-scope transport.
3. HTTP `503` for every known route of every in-scope transport, and preservation of `404` for unknown routes and methods.
4. **Restart stability and durability evidenced across a genuinely separate operating-system process** (F-7(4) / D-1 ext §6 — not an in-process module re-use), plus recovery behaviour.
5. Actual test results, including that the pre-existing fail-closed assertions still pass **unmodified**.
6. Proof that no unintended change was made to services, journal formats or schemas, and that the carrier and owner-scoped data are not committed.

---

## 8. Qualification is separate and is NOT granted here

F-7 requires the five-part qualification bar **independently for each capability**: positive ownership-boundary tests; negative ownership-boundary tests; failure-mode tests; durability/restart evidence to the D-1 ext §6 standard in a **separate process**; and no cross-domain equivalence without a governed D-2 §8 contract.

**This record grants no qualification.** That the mechanism works is not qualification of a capability, and F-7(2) is explicit that passing fail-closed tests does **not** independently qualify anything. Qualification determinations, with their evidence, are recorded separately in `IIPS-V3-OWNER-CONTEXT-F3-IMPLEMENTATION-AND-QUALIFICATION-RECORD-01`.

---

## 9. Matters left undecided

| Item | Status |
|---|---|
| `F6_INVENTORY_AUTHORIZED` | **UNDECIDED** — unchanged; no inventory is authorized or performed |
| TD-7b (production data-dir / deployment regime) | **DEFERRED** — unchanged |
| Reports NP-06, Portfolios G-2 | **DEFERRED** — unchanged |
| Cross-domain translation contracts (D-2 §8) | **NOT CREATED** — unchanged |
| `recordBlob` re-binding after a future amendment of the value act | Recorded as a governance consequence: amending the effective value act changes its blob, so the carrier must be re-materialised under a new governed act with a new digest. No such amendment is contemplated. |

---

## 10. Decision status summary

```text
BASELINE=709b27d63161d7f0df840218ad5156b86ea49b97; FRESHNESS=UNCHANGED; OPEN_PRS=0
AUTHORITY=STANDING PA AUTHORIZATION (2026-10-12), TRANSCRIBED VERBATIM (§1.2)
M-1 CARRIER GRAMMAR/FORMAT/SCHEMA/CANONICAL BYTES=RESOLVED (§3.1, §3.7)
M-2 PATH SEAM=IIPS_OWNER_CONTEXT_PATH; FILENAME=owner-context.json; OUTSIDE WORKING TREE (§3.2)
M-3 INTEGRITY BINDING=PINNED SHA-256 OF CANONICAL BYTES IN REPOSITORY-VISIBLE CODE (§3.3)
M-4 GITIGNORE/TD-7A DISCREPANCY=REMEDIED EXPLICITLY (.iips-data/ ADDED, §3.4)
M-5 RESOLVER LIFECYCLE=PER REQUEST, UNCACHED; NO REQUEST INPUT; FAIL CLOSED (§3.5)
M-6 LIMITS=CARRIER 4096B; VALUE 128 CHARS; BODY 65536B (§3.6)
IMPLEMENTATION_AUTHORITY=GRANTED, BOUNDED (§4); SEPARATE PER CAPABILITY (NP-09, NP-10, NP-11)
COMPOSITION_FILE_EDIT=AUTHORIZED (§4.5)
CONTRACT_DECISIONS=DELEGATED TO IMPLEMENTATION, TO BE DOCUMENTED (§4.6)
F1_OWNER_USER_ID_VALUE=owner-7f3a91c2 — PRESERVED, UNCHANGED
F2_TENANT_VALUE=irr-domain-4b82d6e1 — PRESERVED, UNCHANGED
FAIL_CLOSED=HTTP_503_OWNER_CONTEXT_UNAVAILABLE (helper, body and reason string unchanged)
QUALIFICATION=NOT GRANTED BY THIS RECORD (§8)
F6_INVENTORY_AUTHORIZED=UNDECIDED; TD-7B=DEFERRED; REPORTS/PORTFOLIOS=DEFERRED (§9)
IPD_CHANGES=NONE; IRR_IPD_MAPPING_EQUIVALENCE=NONE
STATUS=DECIDED — RECORDED — NOT PUBLISHED — NOT EFFECTIVE (as at preparation)
```

*End of decision record. It resolves the F-3 mechanism determinations, grants a bounded implementation authorization separately per capability, preserves every established value and safeguard, grants no qualification, and authorizes no inventory, IPD change, capability admission or authentication mechanism.*

---

## 11. Publication closure (post-preparation addendum)

The status banner in this record's header and the line `STATUS=… NOT PUBLISHED — NOT EFFECTIVE` in §10 state the position **as at preparation**. This addendum records the subsequent publication act, so the record is no longer superseded by events.

| Item | Value |
|---|---|
| Publication act | Pull request **#68**, merged into `main` of `ramkivs/iips-review-recovered` |
| Merge commit | `a95949571ebec598d941edd13f26f6726dc1dc59` |
| Merged tree | `fe3d6bc37a49ec51e1d5eccec71f4440bc553cb4` |
| Parents | `709b27d63161d7f0df840218ad5156b86ea49b97` (baseline `main`), `6729a268cdb9ff846444cd01c3c8d1694863ad02` (this work) |
| Merged at | 2026-10-12T18:18:17Z |
| Effective from | 2026-10-12 |

Verification of the publication (performed read-only against the authoritative remote):

1. The merged tree `fe3d6bc3…` is **identical** to the tree of the exact commit whose contents were tested (`6729a268…`) ⇒ **the published bytes are the tested bytes**; no post-test edit was introduced by the merge.
2. All 21 changed paths are present in the merged tree.
3. No carrier file, no `.iips-data` path and no journal file exists anywhere in the merged tree; `.iips-data/` is ignored at `.gitignore:149` (`git check-ignore -v`).
4. `main` advanced from `709b27d…` to `a959495…` by this merge alone; the baseline commit remains an ancestor.

**Effect of this addendum:** the determinations of §3 (`M-1`…`M-7`), the bounded implementation authorizations of §4, the invariants of §5 and the non-authorizations of §6 are **effective** from the date above. This addendum **grants nothing new**: it does not qualify any capability (§8 stands — qualification is recorded separately in `IIPS-V3-OWNER-CONTEXT-F3-IMPLEMENTATION-AND-QUALIFICATION-RECORD-01`), it does not authorize F-6 inventory, TD-7b, Reports or Portfolios (§9 stands), and it changes no value, safeguard or scope limit.
