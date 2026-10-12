# IIPS v3.0 — Owner Context F-1 / F-2 Fixed-Literal Value Act

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01` |
| Record type | PA-governed value-establishing decision (class C1 governed declaration) selecting the exact `F1_OWNER_USER_ID_VALUE` and `F2_TENANT_VALUE` — one act, two fields — per `IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PA-DECISION-01` §5.1 and §9(1) |
| Status | **VALUES SELECTED AND APPROVED BY THE PROGRAM AUTHORITY (2026-10-12) — COMPLETED RECORD — FINAL RECORD ADOPTION PENDING — NOT YET MERGED — NOT PUBLISHED — NOT EFFECTIVE** |
| Decision form | **Fixed literal values** (Program Authority's selection). One governed act; no runtime-generated identifiers; no implicit derivation rules |
| Value selection | 2026-10-12 — the Program Authority selected and approved the exact literals recorded in §4 |
| Record adoption | **PENDING** — formal adoption of this exact completed record is required before merge (§11) |
| Prepared against baseline | `origin/main` = `f3b7a8b3f2e80f5eb075962820a304448457112a` (verified 2026-10-12) |
| Governing decision record | `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F1_F2_F3_PA_DECISION.md` (blob `47b158f694390e3911bb01f841453f128a9215c5` at baseline) — unmodified by this act |
| Value-selection authority | **EXERCISED BY THE PROGRAM AUTHORITY** for the two literals in §4 only |
| Implementation authority | **NOT GRANTED** by this act |
| Publication | PENDING — via a narrowly scoped PR from the session branch to `refs/heads/main`; merge requires final-record adoption and explicit merge authorization (§11) |

---

## 1. Purpose

This act establishes, as fixed literal strings, the concrete owner-context partition pair left `UNDECIDED` at `IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PA-DECISION-01` §5.1 and at `IIPS-V3-OWNER-CONTEXT-PA-DECISION-FINAL-01` §5 (`F1_OWNER_USER_ID_VALUE`, `F2_TENANT_VALUE`). It is the **value act** of `IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PA-DECISION-01` §9(1). It is a value-establishing governance act only.

## 2. Governing authority

- `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F1_F2_F3_PA_DECISION.md` §§4.1, 4.2, 5.1, 9(1) (policy definitions and the value-act requirement).
- `docs/integration/IIPS_v3.0_OWNER_CONTEXT_PA_DECISION_FINAL.md` §§4.1, 4.2, 5, 10(2), 11 (originating items; class C1; accepted-record-lineage and effectiveness requirements).
- `docs/integration/IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md` (D-2) §§4, 5, 7, 8 (domain scope and non-equivalence).
- `docs/integration/IIPS_v3.0_GLOBAL_NO_AUTH_PROGRAM_AUTHORITY_DECISION.md` §§5–6 (no synthetic principal; fail-closed).

## 3. Decision form (selected by the PA; adopted here)

1. Each of the two fields is established as a **fixed literal string** stated in this record.
2. No runtime generation, no implicit derivation rule, no defaulting, no fallback (F1/F2/F3 §4.1(3)).
3. **This is one PA-governed act establishing both values** (F1/F2/F3 §4.2(7): one record, two fields).

## 4. The governed values

| Item | Literal value | Character length | UTF-8 byte length |
|---|---|---|---|
| `F1_OWNER_USER_ID_VALUE` (`ownerUserId`) | `owner-7f3a91c2` | 14 | 14 |
| `F2_TENANT_VALUE` (`tenantId`) | `irr-domain-4b82d6e1` | 19 | 19 |

### 4.1 Conformance validation (performed at record completion, 2026-10-12)

| Check | `owner-7f3a91c2` | `irr-domain-4b82d6e1` |
|---|---|---|
| Single non-empty string | PASS | PASS |
| Contains no NUL character | PASS | PASS |
| ASCII (⇒ UTF-8 byte length equals character length) | PASS (14 = 14) | PASS (19 = 19) |
| JSON-stable / persisted verbatim (ASCII string, no escapes required) | PASS | PASS |
| Deterministic and exact-equality stable (fixed literal) | PASS | PASS |
| Opaque: no personal, username, email, or company identity; no `@` or identity token | PASS | PASS |
| Not a removed-fixture value (`admin-a` / `tenant-A` era, FINAL §4.2(3)) | PASS | PASS |
| F-2 explicitly domain-scoped (names the IRR domain; new value per F1/F2/F3 §4.2(5)) | n/a | PASS |

Literal preservation: the strings in the table above are exactly the strings selected and approved by the Program Authority on 2026-10-12. **Non-claims (explicit):** this act does not claim and does not require that runtime persistence, global uniqueness, restart stability, or any implementation behavior has been tested or demonstrated; those matters belong to the implementation gate and the F-7 qualification evidence suite (F1/F2/F3 §5.2, §9(2), (4)).

## 5. Approved constraints binding on the values (F1/F2/F3 §4.1(2), §4.2(2); FINAL §4.1, §4.2)

1. Each value is a **single non-empty string**.
2. **JSON-stable**, persisted verbatim in journal lines; **MUST NOT contain NUL** (compound dedup-key component).
3. **Deterministic and exact-equality stable**; **immutable once recorded** — change requires a new PA governed decision **plus** a separately governed data-reconciliation decision; no runtime mutation path may exist (§4.1(4)).
4. **Opaque and non-personal**; bounded length (exact bound is an implementation-gate detail; the lengths in §4 are recorded by this act).
5. **Assignment**: established only by this PA-governed declaration (class C1; C2–C4 foreclosed); never generated at runtime; never derived from any request, header, cookie, browser state, authenticated principal, company identifier, or any other domain's identity; never defaulted (§4.1(3)).
6. `ownerUserId` carries **equality/partition semantics only** — no authentication or authorization semantics (§4.1(1)). `tenantId` is a **partition dimension only** — no tenancy, membership, entitlement, RBAC, or administrative semantics; no multi-tenancy implied (§4.2(1), §4.2(4)); one governed partition value is sufficient (§4.2(4)).
7. **Equivalence exclusions**: `ownerUserId` is NOT equivalent to and NOT derived from any authenticated principal, browser/client identity, company identifier (D-2 §5), IPD `applicationUserId`, G24/Reports `userId`, or any other domain's owner identifier (§4.1(6)); `tenantId` is a **new, explicitly identified, domain-scoped partition value** (D-2 §7) and is NOT equivalent to any IPD, G24, Reports, or company tenant identifier (§4.2(5); D-2 §§4, 8).
8. Removed-fixture values (`admin-a`/`tenant-A` era) are not reused by default (FINAL §4.2(3)) — this act reuses none (§4.1).

## 6. Attestations adopted with the Program Authority's value selection (2026-10-12)

1. Each value is one non-empty string. ✔ *(validated, §4.1)*
2. Each value is JSON-stable and is persisted verbatim in journal lines. ✔ *(validated, §4.1)*
3. Neither value contains a NUL character. ✔ *(validated, §4.1)*
4. Each value is deterministic and exact-equality stable. ✔ *(fixed literals, §3)*
5. Each value is opaque and non-personal. ✔ *(attested by the Program Authority; mechanically checked to the extent recorded in §4.1)*
6. Neither value encodes a username, email, company identity, authenticated principal, or any other domain's identifier. ✔ *(attested by the Program Authority)*
7. `F2_TENANT_VALUE` is explicitly domain-scoped to this IRR application's journal-regime data and is not equivalent to any IPD, G24, Reports, or company tenant identifier; any future cross-domain relationship would require a separately governed D-2 §8 translation contract, which this act does not create. ✔
8. Neither value is request-derived or runtime-generated; both are fixed literals adopted in this governed act. ✔
9. The pair is established and changed together: one act, two fields, shared lifecycle — consumed atomically, changed together, failed together (§4.2(6)–(7)). ✔
10. Missing, malformed, inconsistent, or unverifiable owner context continues to fail closed through the existing **HTTP `503 owner-context-unavailable`** safeguard — no inference, no fallback identity, no data read or written (§4.1(5), §4.2(6); approved policy F-5). ✔
11. Neither value reuses a removed-fixture (`admin-a`/`tenant-A`-era) value; no reuse occurs (FINAL §4.2(3)). ✔ *(validated, §4.1)*

## 7. Coordination and shared lifecycle (F1/F2/F3 §4.2(3), (6), (7))

The two fields are established by this **single** PA-governed act, are changed only by the same form of act (a new PA governed decision plus a separately governed data-reconciliation decision, §4.1(4)), are **validated together on every operation**, and **fail together**: any state in which the pair cannot be fully validated — missing, inconsistent, or unverifiable, in whole or in part — is treated as absent ⇒ `503 owner-context-unavailable`. The pair must be **consumed, changed, and validated together**.

## 8. Relationship to the F-3 mechanism (non-closing)

This act is the governing PA declaration whose **sole** legitimacy source is this record. Its materialization into the approved carrier mechanism — the Option B server-local governed declaration file in the TD-7a server-owned data domain (F1/F2/F3 §4.3(1)) — occurs only under a **separately authorized implementation gate**, which approves the carrier grammar, file format, path-seam name, and integrity-binding form (§9(2); §5.2(1), (6)). **This act closes no F-3 implementation prerequisite**: integrity binding, restart-stability demonstration, recovery procedure, change-authority/auditability bindings, failure-mode evidence, carrier grammar/path, TD-7b, the `.gitignore`/TD-7a discrepancy, and doc-comment reconciliation all remain **OPEN** (§5.2(1)–(10)).

## 9. Fail-closed safeguard — preserved unchanged

Missing, malformed, conflicting, or unverifiable owner context continues to fail closed with **HTTP `503 owner-context-unavailable`** through the existing safeguard, which remains in force, unchanged by this act.

## 10. Scope and explicit non-authorizations

This is a **value-establishing governance decision only**. The two values carry **equality/partition semantics only** and are **not authentication or authorization credentials**. This act:

1. grants **no implementation authority** — no resolver, carrier, configuration or path seam, transport rewiring, code, test, schema, journal-format, or runtime-configuration change;
2. **does not close F-3 implementation prerequisites** — they remain OPEN (§8);
3. leaves **`F6_INVENTORY_AUTHORIZED` UNDECIDED** — no inventory, inspection, data access, migration, reconciliation, reassignment, deletion, partition rewrite, or exposure is authorized;
4. confirms **NP-09 qualification remains NOT ESTABLISHED**, and **NP-10 and NP-11 remain unadmitted and unqualified**;
5. authorizes **no IPD change and no IRR↔IPD mapping or equivalence**;
6. introduces **no** authentication, OIDC, session, token, RBAC, or multi-user mechanism;
7. changes **no** existing HTTP 503 safeguard.

## 11. Publication and effectiveness

Preparation of this record is not publication or effectiveness. Publication proceeds through a narrowly scoped PR from the session branch to `refs/heads/main` (no direct push, no force-push). Merge requires the Program Authority's **final-record adoption of this exact record** and **explicit merge authorization**. On merge and independent remote verification, the pair is rendered into the accepted record lineage (FINAL §10(2)) and this act becomes effective per the `IIPS-V3-OWNER-CONTEXT-PA-DECISION-FINAL-01` §11 sequence (final review of the exact record → separate explicit merge authorization → merge → independent remote verification). The implementation gate (F1/F2/F3 §9(2)) and per-capability gates (§9(4)) remain subsequent, separate acts.

## 12. Status summary

```text
DECISION_FORM=FIXED_LITERAL_VALUES; ONE_ACT_TWO_FIELDS; NO_RUNTIME_GENERATION; NO_DERIVATION_RULES
F1_OWNER_USER_ID_VALUE=owner-7f3a91c2 (14 chars, 14 UTF-8 bytes)
F2_TENANT_VALUE=irr-domain-4b82d6e1 (19 chars, 19 UTF-8 bytes)
SEMANTICS=EQUALITY_PARTITION_ONLY; NOT_AUTHENTICATION_OR_AUTHORIZATION_CREDENTIALS
LIFECYCLE=ESTABLISHED_CHANGED_VALIDATED_TOGETHER; IMMUTABLE_ONCE_RECORDED
FAIL_CLOSED=HTTP_503_OWNER_CONTEXT_UNAVAILABLE (unchanged)
CONSTRAINTS=F1F2_RECORD_§4.1(2)/§4.2(2)_+FINAL_§4.1/§4.2 (section 5)
ATTESTATIONS=11 (section 6); CONFORMANCE_VALIDATION=PASS (section 4.1)
IMPLEMENTATION_AUTHORITY=NOT_GRANTED
F3_PREREQUISITES=OPEN (§5.2; not closed by this act)
F6_INVENTORY_AUTHORIZED=UNDECIDED
NP-09_QUALIFICATION=NOT_ESTABLISHED; NP-10_NP-11=UNADMITTED_UNQUALIFIED
IPD_CHANGES=NONE; IRR_IPD_MAPPING_EQUIVALENCE=NONE
CAPABILITIES_ADMITTED=NONE
STATUS=COMPLETED_RECORD — FINAL RECORD ADOPTION PENDING — NOT YET MERGED — NOT EFFECTIVE
NEXT=FINAL_RECORD_ADOPTION_AND_MERGE_AUTHORIZATION (§11)
```

*End of value act. It establishes the two fixed literal partition values in one PA-governed act, grants no implementation authority, closes no F-3 prerequisite, and authorizes no inventory, IPD change, capability admission, or authentication mechanism.*
