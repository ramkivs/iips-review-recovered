# IIPS v3.0 — NP-06 Reports R1 (D-1): Ownership Declaration Program Authority Decision Act

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01` |
| **Record type** | **PROGRAM AUTHORITY DECISION ACT — OPERATIVE UPON PUBLICATION.** |
| **Authority** | Program Authority (PA) — Ramki |
| **Decision date** | `2026-10-25` (Asia/Calcutta) — PA explicit approval of 2026-10-25 ("NP-06 REPORTS — PA APPROVAL AND ONE-PASS EXECUTION") |
| **Decisions rendered** | `D-1` (`R1` Reports ownership source), resolving fields `U-1` through `U-5` under `R1-Option B` |
| **Effectiveness** | **EFFECTIVE.** Operative as an authoritative instrument upon publication to `refs/heads/main` and independent remote read-back. Supersedes the operative deferral of `REG-11` Option C as applied to Reports for the non-auth baseline. |
| **Governing locus** | IRR `ramkivs/iips-review-recovered`. Zero IPD mutations. |
| **Preserved** | A2 (`IIPS-V3-REPORTS-CV21-DQ7A-A2-PA-DISPOSITION-2026-10-25-01`); `CV-23`; `CV-43` (closed, retained unwired); `R3-Option B` (`IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01`); primary pin `#2d9130e7…`; broker pin `#70b24f02…`; second specifier `iips-np04-governed-persistence#2e11fa3b…`; Gate 3 `src/persistence/*`. |

---

## 1. Declarations Rendered (`U-1`, `U-2`, `U-3`)

1. **`U-1` — Reports Tenant Partition Identifier:**
   - Approved value: **`irr-reports-personal`**
   - Serves as the Reports-specific tenant partition identifier in the common governed persistence foundation (`NP-04`).
   - Carries partition semantics only; never an authentication credential or principal.

2. **`U-2` / `U-3` — Reports Owner Partition Identifier & F-3 Boundary:**
   - Approved value: **`owner-irr-reports-personal`**
   - Serves as the Reports-specific owner partition identifier (`userId`).
   - F-3 value reuse or aliasing `(irr-domain-4b82d6e1, owner-7f3a91c2)` for Reports is **explicitly prohibited**. Reports maintains its own distinct ownership declaration and partition boundary.

3. **Collision & Compatibility Verification:**
   - Literal uniqueness confirmed: 0 collisions across repository history, F-3 records, and IPD corpus.
   - Compatibility confirmed: Compatible with `GovernedArtifactStore` partition constraints and `ReportsPersistence` contract.

---

## 2. The Fifteen `D-2` §8 Dispositions for Reports (`U-4`)

| # | Element | Decided Disposition |
|---|---|---|
| 1 | **Source Authority** | This PA Decision Act (`IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01`) is the authoritative source for Reports ownership declarations. |
| 2 | **Target Authority** | The NP-04 persistence lineage `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` is designated as the Reports target authority for bounded non-production use only, consistent with the effective R3 act. |
| 3 | **Source Identifier** | The pair `(irr-reports-personal, owner-irr-reports-personal)` declared in §1. |
| 4 | **Target Identifier** | Exact 1:1 correspondence to the source pair `(tenantId, userId)`: `(irr-reports-personal, owner-irr-reports-personal)`. Implicit aliasing or translation is prohibited. |
| 5 | **Mapping Lifecycle** | Fixed 1:1 static mapping. No dynamic mapping table, translation engine, or lifecycle states. |
| 6 | **Provisioning Authority** | Operator-only provisioning through designated server-side deployment process (`IIPS_REPORTS_OWNER_PATH`). Client-controlled provisioning is prohibited. |
| 7 | **Revocation Authority** | Program Authority governs the declaration. Operator removal or unsetting of the carrier disables Reports immediately, failing closed with `503 owner-context-unavailable`. |
| 8 | **Tenant Boundary** | Exactly one declared Reports tenant (`irr-reports-personal`). No guessing, ambient fallback, or client-selected tenant. |
| 9 | **Ownership Semantics** | Owner and tenant values are governed partition keys, not authenticated identities or principals. |
| 10 | **Authorization Boundary** | Ownership values confer no roles, permissions, or privilege escalation (affirmative statement; linked to `C-3` / `P-1`). |
| 11 | **Audit Requirements** | Durable evidence of establishment, replacement, and revocation preserved in git repository and test evidence. Request-time audit handled per `C-7` / `A-2`. |
| 12 | **Failure Behaviour** | `503 owner-context-unavailable`. No data is read or changed; no fallback identity or substitute store is constructed. |
| 13 | **Trust Model** | No credential, authenticated principal, or client-supplied identity is authoritative. |
| 14 | **Durable Storage** | Server-owned `IIPS_NP04_DATABASE_PATH` naming the SQLite database file for NP-04 governed persistence. Distinct from Gate 3 store, never client-supplied, fail-closed when unset. |
| 15 | **Package / API Contract** | Second specifier `iips-np04-governed-persistence#2e11fa3b…` consuming `…/persistence`. HTTP API contract governed by `R2`. |

---

## 3. Carrier Mechanism & Value-Act Property Set (`U-5`)

1. **Carrier Mechanism:**
   - **Carrier (a)**: A separate server-owned carrier file named by environment variable **`IIPS_REPORTS_OWNER_PATH`**.
   - Distinct from `IIPS_OWNER_CONTEXT_PATH` (F-3).

2. **Canonical Carrier Bytes:**
   ```json
   {
     "carrierSchemaVersion": 1,
     "ownerUserId": "owner-irr-reports-personal",
     "tenantId": "irr-reports-personal",
     "governedBy": {
       "recordId": "IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01",
       "recordPath": "docs/integration/IIPS_v3.0_REPORTS_NP06_R1_OWNERSHIP_DECLARATION_PA_DECISION_ACT_2026-10-25.md",
       "decisionDate": "2026-10-25"
     }
   }
   ```

3. **Integrity Pin (SHA-256):**
   - Canonical text UTF-8 SHA-256: **`b1b78809d1c8d05800b338f73082b4269e6c9fa65b8f35192f4736d6f1a98640`**
   - Exact byte length: **384** bytes.
   - Any carrier whose bytes do not match this digest fails closed (`503 owner-context-unavailable`).

4. **Operating Properties:**
   - **Uncached per-request evaluation:** Read per request; removing or restoring carrier takes effect immediately without restart.
   - **Operator control:** Carrier lives outside Git working tree in server-owned filesystem.
   - **Change authority:** Any change of values requires a new dated PA act and updated repository pin.
   - **Restart stability:** Proven across separate operating system processes when same carrier is provisioned.
   - **Fail-closed:** Absent, malformed, invalid, or mismatched carrier yields null context and HTTP 503.

---

## 4. Scope and Non-Claims

This act establishes `R1` effectiveness for NP-06 Reports. It does **not**:
- Introduce routes, navigation entries, or UI exposure.
- Wire `D115`/`CV-43`.
- Grant capability acceptance or production admission.
- Modify IPD or dependency pins.

*Program Authority: Ramki. **Status: EFFECTIVE. `R1` ESTABLISHED.***
