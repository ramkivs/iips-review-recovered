# DEC-A2-A1-TIER3-COMPOSITE-CLOSURE-AUTHORITY — 2026-09-05

- **Record ID:** `DEC-A2-A1-TIER3-COMPOSITE-CLOSURE-AUTHORITY`
- **Class:** `DECISION` / `AUTHORITY` (composite closure-determination authority; recording only — **AUTHORITY RECORDED, NOT EXERCISED**)
- **Date:** 2026-09-05
- **Source decision:** TIER-3 A2→A1 COMPOSITE AUTHORITY DECISION GATE (immediately preceding), decision set **A1 / B1 / C1 / D1 / S2**, preserved exactly.
- **Recording:** single governance add at this commit; parent `22f3e91ff716b295447c7fbc56fd42905d2ac3fd` (final D7 adjudication evidence recording).

## A. Scope — exactly three engines

- **IES-016 — Telecommunications**
- **IES-017 — Automobile**
- **IES-020 — Materials & Metals**

No wildcard, no future-engine expansion, no repository-wide authority. Any act outside these three engines under this authority is void and must fail closed.

## B. Decision A — **A1 — CLOSE OPTION-C CONDITIONS**

- Option-C debt **items 1–5 were individually verified as discharged** by later separately-authorized recorded work: (1) framework-integration and (2) reuse-verification regression tests (authored and executed under `DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY` at `ff1c90e`; 12 files, 87/87 subtests, 29/engine, exit 0; durably recorded at `9da792517410a24bf885ce5a224a99e4834de5ac`); (3) independent verification — three role-separated IV reports (refreshed under `DEC-A2-A1-TIER3-EXECUTION-EVIDENCE-AND-IV-REFRESH`, committed at `245be839`), *simulated* per the Option-C constraint; (4) **final-readiness evidence present for all three engines** — `iips-platform/IES016/IES017/IES020_FINAL_READINESS_CERTIFICATE.md` (added at product `f8aa038`, 2026-09-03, self-labelled "Evidence maturity: A2 (unchanged)" and "NOT AN A1 PROMOTION"; the existing `IES-0xx_IMPLEMENTATION_READINESS_CERTIFICATE.md` was NOT relabelled, per the Option-C prohibition); (5) freeze/provenance manifests refreshed at `ff1c90e`, 33/33 pinned and unchanged through `c2dda91d`.
- **Finding 2** (Tier-3 cannot reach A1 — the documentation-parity obstacle) **is discharged by D7-TIER3**: the durably recorded adjudication `D7-TIER3-PARITY: SATISFIED WITH RECORDED QUALIFICATIONS` (evidence record at `22f3e91f…`, report digest `2296764a…`).
- **Finding 1 is NOT closed.** No genuinely independent verifier exists; this remains the standing independence negative.
- The independence limitation remains under **Decision B1** (below).
- **No silent absorption occurred** — every disposition is itemized in this record.

## C. Decision B — **B1 — ACCEPT RECORDED REPRODUCIBILITY AS SUFFICIENT FOR THIS A2→A1 DETERMINATION**

Basis preserved: **determinism; hash-pinned artifacts; role separation; clean-workspace methodology; recorded evidence; independent re-derivation mechanics.** This is the programme-wide convention on which the six existing A1 certifications also rest.

- **D7-TIER3-INDEPENDENCE remains OPEN / NEGATIVE.**
- **No independence claim is being made**; **script variation is not being used as the basis for independence.**
- The limitation MUST be carried explicitly in every subsequent instrument issued under this authority.

## D. Decision C — **C1 — AUTHORIZE A SUBSEQUENT A2→A1 IVM TRANSITION EXECUTION GATE**

- **No IVM mutation occurs in this recording gate.**
- IVM remains **A2** (`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`, A/A2 ×3) until a later authorized execution gate.
- IVM transition is **conditional on the certification determination passing for the relevant engine** (Gate 2 below).

## E. Decision D — **D1 — AUTHORIZE A SUBSEQUENT FORMAL A1 CERTIFICATION-DETERMINATION GATE**

- Certification determination occurs **later**; nothing is determined or issued in this recording gate.
- Formal maintainer-level issuance may occur **only** through that later authorized certification gate, via explicit maintainer issuance acts.
- **Rank-5 readiness evidence remains distinct from maintainer-issued A1 certification** (DEC-D25 §classification: rank-5 certificates establish test evidence and a recorded confidence decision; they cannot establish acceptance; not maintainer-issued).
- **Existing readiness artifacts are NOT retroactively upgraded** by this authority.

## F. Decision S — **S2 — ENGINE-SPECIFIC**

Each of IES-016/017/020 must **independently** satisfy the later certification gate. D7 documentation-parity classifications are **not** transferred automatically into certification. The later certification gate MUST freshly classify, per engine: **Q5; DF-1; the 33/33 manifest qualification; IES-020 §28 Q1–Q5 where applicable; the IES-017 stale-pack discrepancy; and all other certification-specific prerequisites.**

## 4. Authorized sequence (binding order)

1. **Gate 1 — Certification determination:** for each engine independently — execute the authorized certification-determination gate; evaluate certification prerequisites; perform the required fresh per-engine qualification classification; if and only if all requirements pass, perform explicit maintainer issuance acts under D1.
2. **Gate 2 — IVM transition:** only for engines that pass Gate 1 — execute the authorized IVM/maturity mutation; transition A2 → A1 under C1; verify the resulting IVM state.

**Gate 2 MUST NOT precede Gate 1.** No A2→A1 IVM transition is authorized merely from D7 documentation parity.

## 5. Exclusions (no permission granted or implied)

This authority does NOT authorize: any product mutation outside the later explicitly scoped IVM transition; methodology changes; scoring/ranking changes; D36 mutation; E2E-018 mutation; P3 implementation; promotion; release; live/UI parity certification; silent closure of the independence limitation; automatic certification of all three engines; automatic A1 transition of all three engines. Certification and IVM changes are **conditional and engine-specific**. Exclusions are not implicit permissions.

## 6. Fail-closed rules

The authority becomes unusable for execution if a later gate would: (1) treat D7 documentation parity as automatic certification; (2) treat rank-5 evidence as an A1 certificate; (3) omit the B1 OPEN/NEGATIVE independence disclosure; (4) skip the certification gate; (5) perform IVM transition before certification determination; (6) extend scope beyond IES-016/017/020; (7) silently resolve a certification qualification; (8) revive expired historical authority; (9) modify methodology; (10) grant P3/promotion/release authority. Any later execution must fail closed if these conditions cannot be satisfied.

## 7. Lineage (reconciled; historical authorities consumed and NOT revived)

- Option-C creation authority `3ae0c48d4b5d9f64e77f7805f27e7fbffba297a3` — consumed 2026-08-28 (disposition recorded in Decision A).
- Tier-3 test-execution authority `3dbc5bc55e029325024d4a82d38ed48835ee6db3` — consumed at `ff1c90e`.
- Execution-evidence / IV-refresh `9da792517410a24bf885ce5a224a99e4834de5ac` — consumed (`ff1c90e`→`245be839`).
- Final-readiness issuance authority `037c9ba19522bb1f1c8c0cab2709fc9c6cd0e240` — consumed at `245be839` (issuance acts only; no flip).
- DEC-D25 evidentiary standard `3617ac593069c78ebbd9254c4bdcb1927a9c3142` — standing classification (rank-5 ≠ certificate).
- D7-TIER3 programme: Decision C disposition `2590fc052ef6b1d116275dbe6ee00094e4464d37`; substantive parity-programme authority `a98a5da478a9a0b0d492a777ea3dbe8c8768a62a`; P2 authority `7fa0664f46149cdb75ce60e511c2b5345755926b`; P2 reviews `81e1b51563c8f82e40e2464545cce7e30ba8fb3d`; discovery `e3145c7e5de9214f175deaa2161268a17731e291`; plan `71693115a9d3f6721a4c1be85a5967dd06d4586a`; D36-successor authority `73e7f668e91a909a9dfdcfdc0ec041fd85f74c33` (expired upon completion); remediation recording `0b5007c64a3cf7ed7057970feba0aad8fcb051f7`; RR-F1 authority `3d09ad73e68d5ec47f91bc871e2f05564bc6c8b0` (expired); repair `c2dda91de8bd362d4766ed19d777a80e6976c9b5`; RR-F1 evidence `e43b6d074f860d8418719ea17fc608ef18e6d814`; fresh re-review evidence `b0112f4191c24a2b893b9fbb2cd448c6ed0faf58`; Decision B parity-adjudication authority `6b3ed7c0fb0cae4d70027178d9202c2723fa0251` (expired upon adjudication recording); final adjudication evidence recording `22f3e91ff716b295447c7fbc56fd42905d2ac3fd`.
- Current product tip: `c2dda91de8bd362d4766ed19d777a80e6976c9b5` (`phase13-next`). Current governance tip at recording: `22f3e91ff716b295447c7fbc56fd42905d2ac3fd`.
- All historical authorities above are **consumed/expired**; none is revived by this record. This authority is the sole live instrument for the Tier-3 A2→A1 pathway and expires when Gate 2 completes and is durably recorded, or upon recorded abandonment.
