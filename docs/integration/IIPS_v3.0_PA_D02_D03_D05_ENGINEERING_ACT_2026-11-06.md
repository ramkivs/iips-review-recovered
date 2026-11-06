# PA adoption and bounded engineering authority — D02 / D03 / D05

**Act ID:** `IIPS-V3-PA-D02-D03-D05-ENGINEERING-2026-11-06-01`. **PA:** Ramki, express current instruction. **Approval date:** 2026-11-06 (Asia/Calcutta).
**Rendered:** APPROVED / ADOPTED. **Effective date:** 2026-11-06 on governing IRR main publication, exact-head/main green required CI and independent remote byte readback; final authority-PR comment discharges effectiveness. NO IMPLEMENTATION BEFORE DISCHARGE. No further PA assent inferred or required for exact scope below.

## 1. Immutable authority and precedence

Source Prompt 8: [docs/integration/DURABLE-HOLDINGS-CONTRACT-AND-QUALIFICATION-SPEC-v1-2026-11-06.md](https://github.com/ramkivs/iips-review-recovered/blob/2721da162e28cc2c34d27b24f2733919f7628a3c/docs/integration/DURABLE-HOLDINGS-CONTRACT-AND-QUALIFICATION-SPEC-v1-2026-11-06.md), blob `38c435995fe4b3d9e434ec02432c59f944c49a7a`, SHA-256 `4f478ebd8158c0032b1041afca9cfae5e9dec7036eed067b8169cf6697e7ee40`. Published #476.
Current explicit session PA direction is captured as an **operative transcript, not a verbatim full-message copy**, at `evidence/integration/d02-d03-d05-engineering-2026-11-06/PA-INSTRUCTION-OPERATIVE-TRANSCRIPT.txt`, blob `920c4dcff0a2488eca3ddf02ec147d00e01b811b`, SHA-256 `c14d862198bf56281e7c5470d5a15a70d67559724ff4feec649c408b5adcdb6d`. No message ID/signature/external identity attestation fabricated. Exact approved decision statements and exclusions are rendered below; the transcript is immutable on publication by Git identity.

**Explicit precedence:** current PA says FOUR-REVISION CAP. This overrides Prompt 8's proposed cap removal. Cap stays 4; v2 duplicate no-op is checked before cap rejection (but after stale revision). v1 existing behavior stays unchanged. Current instruction says implementation exclusively in IPD: IRR runtime/pins are NOT changed; its current v1 consumer remains intact. These are deliberate narrowing corrections, not silent deviations.
Baseline IRR `2721da162e28cc2c34d27b24f2733919f7628a3c`, canonical IPD `07e86a4f2c105651f3097a96cb519f8611945e30`; G4-2/D01/D04 effectiveness from #474 preserved. Unique-ID baseline census: all four IDs absent before this record.


## 2. Operative decisions and authority IDs

### D02 — `IIPS-V3-G2-HOLDINGS-OWNER-BINDING-2026-11-06-01` — ADOPTED

Extend canonical owner `owner-4dc756b3` prospectively to holdings, retaining technical IPD tenant `ipd-personal-local` as specified in Prompt 8. SAIRAM is display-only; IRR evidence tenant/carrier is not holdings authority. IPD resolves sole ACTIVE local binding/membership afresh and within the protected mutation transaction; request-supplied owner/tenant/canonical identity is rejected, not stripped into authority. No cache/default/rebinding; absent/multiple/revoked/malformed binding fails closed, foreign/missing/tombstoned indistinguishable. No automatic existing-data reassignment or operational provisioning/migration. Synthetic disposable fixture binding creation is authorized for tests only.

### D03 — `IIPS-V3-G2-SNAPSHOT-CONTRACT-V2-2026-11-06-01` — ADOPTED

Adopt consumer contract 2.0.0/frame v=2 as specified, with current override **cap=4**, duplicate-before-cap/no-op semantics and v1 preservation. Complete observed snapshots, contribution lineage (not summed positions/accounting); empty INITIAL revision 1, stable ID, subsequent revision n+1, retained immutable history. Stale revision first; duplicate at current revision returns original revision/lineage without writes even at cap; new mutation at cap refuses. No automatic retry; requestId correlation only; timeout/uncertain acknowledgement remains UNKNOWN until exact authorized readback. Dedicated minimal receipt with actual non-empty nullable contribution projection, no invented generic success/timestamps/durability. Preserve detail-field durability absence, C7 and owner isolation, no REPLACE/RESET/DELETE activation. Four-revision-cap and duplicate ordering tests supersede Prompt 8 beyond-four vectors. v1 request parsing/results/refusals remain byte-compatible; v2 is explicitly separate.

### D05 — `IIPS-V3-G2-BOUNDED-SNAPSHOT-ENGINEERING-2026-11-06-01` — ADOPTED / BOUNDED IMPLEMENTATION GRANTED

After this act's effectiveness verification, authorize local non-production IPD engineering and isolated synthetic testing of the approved v2/owner/snapshot contract. File envelope: `src/ipc/protocol.ts`, `src/ipc/dispatch.ts`, `src/persistence/binding.ts`, `src/persistence/portfolio_store.ts`, `src/persistence/brokerImportPersistence.ts`; new isolated tests `tests/durable_holdings_contract_v1.test.ts`, `tests/durable_holdings_recovery_v1.test.ts`, targeted documentation/evidence. Reuse existing runtime/connection/migrations/security-master/guard unchanged. Schema/migration DESIGN and testing in disposable environments permitted, no operational provisioning or migration and no prior migration rewrite. IRR changes are authority/tracker/evidence documentation ONLY.

All live write paths MUST remain hard-false/refused. Isolated tests may call the existing low-level fixture store/service explicitly against newly created temporary synthetic databases; no request/env/test switch may enable product writes or bypass W-1 through the IPC endpoint. No new live raw-store path. Production dispatch may expose v2 read/refusal behavior only, while mutation algorithms are exercised in isolated fixtures under this act.

## 3. Acceptance, qualification and exclusions

Required evidence: exact request/schema and v1/v2 conformance; canonical owner/tenant and forged/revoked/foreign refusal; empty-create/non-empty snapshot/nullable contribution projection; cap=4, stale/concurrent and duplicate-at-cap; atomic mutation/failure/commit-unknown/restart; isolated consistent backup/hash/restore/integrity and refusal of unsafe recovery. Report each H01–H12 separately: actual isolated result versus host/real-data/acceptance gaps. Synthetic PASS does not qualify native Windows, power-loss, operational backups or genuine broker holdings. D06 remains CONDITIONAL / NOT ADMITTED; QE 0/11 and Gate C/U4 NOT RENDERED.

Excluded: all operational/live holdings writes or DB access/modification; operational inventory/provisioning/migration; production activation/deployment; D06 operation admission; Gate 4 acceptance/content or QE execution pin; A-6 D05-master expansion; retention/owner-clearing/PF-1/frozen-control changes; trade/cash/tax-lot accounting; multiuser/tenant expansion; ownership transfer; guard/owner-isolation relaxation. No guessed identities or synthetic-real conflation. Existing retained recovery-copy/restore-resurrection and OS/filesystem limits preserved.

## 4. Publication sequence

1. Publish this IRR authority and transcript, required CI green, independent API readback; record immutable effectiveness receipt BEFORE any IPD implementation edits/tests.
2. Reference/mirror this effective instrument in IPD's implementation publication; the governing grant is IRR-locus effective authority, not an unrendered proposal. No new IPD decision is manufactured.
3. Publish bounded IPD source/tests/evidence on branch `arena/f839befc-iips-review-recovered`; exact-head/main CI and independent source/authority/evidence readback, with no runtime changes to IRR.
4. Append IRR actual H01–H12/evidence/trackers and cross-repo receipt. No claim of operation admission or Gate 4 acceptance. Each publication receipt compares actual first parent and preserves concurrent work.
