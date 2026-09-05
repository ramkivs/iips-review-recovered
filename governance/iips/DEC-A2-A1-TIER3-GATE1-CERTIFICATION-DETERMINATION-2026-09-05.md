# DEC-A2-A1-TIER3-GATE1-CERTIFICATION-DETERMINATION — 2026-09-05

- **Record ID:** `DEC-A2-A1-TIER3-GATE1-CERTIFICATION-DETERMINATION`
- **Class:** CERTIFICATION DETERMINATION + MAINTAINER ISSUANCE — **Gate 1 execution** under `DEC-A2-A1-TIER3-COMPOSITE-CLOSURE-AUTHORITY` (D1), recorded at this commit
- **Date:** 2026-09-05
- **Executing authority:** composite authority `73fb9183704ad983595051ed894c92370fd45265` (A1/B1/C1/D1/S2), NOT exercised beyond Gate 1 herein
- **Product HEAD (certification object baseline):** `c2dda91de8bd362d4766ed19d777a80e6976c9b5` (`phase13-next`, clean, remote identical — **unmutated by this gate**)
- **Governance parent:** `73fb9183704ad983595051ed894c92370fd45265`
- **IVM mutation in this gate:** **NONE** — IVM remains **A / A2 ×3**; the A2→A1 transition is reserved exclusively to Gate 2 under C1, only for engines that pass herein
- **External-lineage context:** the `main`/`program-v1.2.0` certification programme is genuine but applies to **different implementation objects** (distinct engineIds `sector.telecom/auto/materials`, distinct frozen assets, root-disjoint history); per the external-lineage reconciliation it is **historical/external context only**, satisfies nothing herein, and no historical evidence, authority, commit, or artifact was imported, revived, merged, or cherry-picked.

## 1. Determination standard (D1 prerequisites)

An engine passes D1 only if **all** of the following are established from authoritative **phase13-next** evidence: (i) current IVM row = Class A / A2 with stable engine identity; (ii) implementation object present and integrity-pinned; (iii) Tier-3 execution evidence (framework-integration + reuse-verification regression, executed and recorded); (iv) D7-TIER3 parity verdict inherited with all qualifications preserved; (v) final-readiness evidence present; (vi) frozen/replay evidence present and hash-pinned; (vii) provenance integrity (pack copies identical to source copies); (viii) governing D16/D17/D20 methodology authority; (ix) Option-C closure recorded (decision A1); (x) no blocking qualification after fresh per-engine classification. **D25 basis:** evidence maturity ≠ certification authority; rank-5 readiness evidence ≠ maintainer-issued A1 certification — the deficiency D25 identifies is the absence of a **maintainer-level A1 issuance act**, which this gate now performs explicitly. **B1 basis:** determinism, hash-pinned artifacts, role separation, clean-workspace methodology, recorded evidence, independent re-derivation — accepted for this determination only.

## 2. Per-engine determinations

### IES-016 — Telecommunications — **D1 PASS — A1 CERTIFICATION DETERMINATION AUTHORIZED**

- **Object identity:** `sector.telecommunications` · `TelecommunicationsEngine.ts` + calibration/decision/evidence/metrics/scoring · `ies-016-telecommunications/` (34 files) · calibration blob `178160fcbe0a30975c6796ac22c73a9bd03ab91a`, expected-outputs blob `0d45ffc44df6d61a6f95dac15a12cb6f88be3155` — **identical** in pack dir and `iips-platform/src/sector-engines/telecommunications/` (provenance integrity).
- **Evidence set:** IVM A/A2 row; regression suite incl. `telecommunications-{framework-integration,reuse-verification}.test.ts` (Tier-3 execution: 87/87 subtests, exit 0 @ `ff1c90e`, recorded `3dbc5bc5`); IV report refreshed @ `245be839` (role-separated); `IES016_FINAL_READINESS_CERTIFICATE.md` (@ `f8aa038`, "FINAL-READINESS EVIDENCE COMPLETE UNDER ROLE-SEPARATED VERIFICATION — NOT AN A1 PROMOTION"); rank-5 `IES-016_IMPLEMENTATION_READINESS_CERTIFICATE.md`; frozen 4-JSON set; 33/33 freeze-pin set; re-derivation anchor TC-001 77.8 Buy.
- **Fresh qualification classification (certification criterion):** Q5 ontology compatibility = **OUTSIDE CERTIFICATION CRITERION**; DF-1 = **NON-BLOCKING**; 33/33 manifest qualification = **NON-BLOCKING**; raw-pipe source observation = **NO EFFECT**. **No blocking qualification.**

### IES-017 — Automobile — **D1 PASS — A1 CERTIFICATION DETERMINATION AUTHORIZED**

- **Object identity:** `sector.automobile` · `AutomobileEngine.ts` + support modules · `ies-017-automobile/` (34 files) · calibration blob `e3f84ede6f5e89580aa451a689c0b5689cf8674e`, expected-outputs blob `b9982d744d92d592714dcc5b1e8599bed63752f2` — identical in both locations.
- **Evidence set:** IVM A/A2 row; `automobile-{framework-integration,reuse-verification}.test.ts` (same Tier-3 execution record); IV report refreshed @ `245be839`; `IES017_FINAL_READINESS_CERTIFICATE.md` (@ `f8aa038`, same non-promotion status); rank-5 implementation-readiness certificate; frozen 4-JSON set; re-derivation anchor AB-001 71.3 Buy.
- **Fresh qualification classification:** Q5 = **OUTSIDE CERTIFICATION CRITERION**; DF-1 = **NON-BLOCKING**; 33/33 = **NON-BLOCKING**; stale-pack discrepancy (frozen 71.8 vs pack 71.9 class-4 rounding presentation) = **NON-BLOCKING**; raw-pipe = **NO EFFECT**. **No blocking qualification.**

### IES-020 — Materials & Metals — **D1 PASS — A1 CERTIFICATION DETERMINATION AUTHORIZED**

- **Object identity:** `sector.materials-metals` · `MaterialsMetalsEngine.ts` + support modules · `ies-020-materials-metals/` (34 files) · calibration blob `ceea1d5fe7c9e4c56f76f6d34efcbbfef311cccf`, expected-outputs blob `3e67cb6f01fdc7a2459d6f4376e54cfa4b89cf2e` — identical in both locations.
- **Evidence set:** IVM A/A2 row; `materials-metals-{framework-integration,reuse-verification}.test.ts` (same Tier-3 execution record); IV report refreshed @ `245be839`; `IES020_FINAL_READINESS_CERTIFICATE.md` (@ `f8aa038`, same non-promotion status); rank-5 implementation-readiness certificate; frozen 4-JSON set; re-derivation anchor MM-001 82.5 Strong Buy.
- **Fresh qualification classification:** §28 Q1/Q2/Q3/Q5 = **OUTSIDE CERTIFICATION CRITERION**; §28 Q4 = **NON-BLOCKING**; Q5 ontology = **OUTSIDE**; DF-1 = **NON-BLOCKING**; 33/33 = **NON-BLOCKING**; raw-pipe = **NO EFFECT**. **No blocking qualification.**

## 3. Maintainer issuance acts (D1 — engine-specific)

Under Decision D1 of the composite authority, the **IIPS Engineering Standards Maintainer** hereby performs the formal A1 certification-determination issuance for each passing engine, **against the phase13-next implementation object at `c2dda91de8bd362d4766ed19d777a80e6976c9b5`**:

- **Certificate `IES-016-A1-2026-09-05`** — IES-016 Telecommunications (`sector.telecommunications`): the evidence of record satisfies the **A1 full-evidence maturity standard** (DEC-D5 §3.1); A1 certification is **ISSUED**.
- **Certificate `IES-017-A1-2026-09-05`** — IES-017 Automobile (`sector.automobile`): A1 full-evidence standard satisfied; A1 certification is **ISSUED**.
- **Certificate `IES-020-A1-2026-09-05`** — IES-020 Materials & Metals (`sector.materials-metals`): A1 full-evidence standard satisfied; A1 certification is **ISSUED**.

**Issuance boundary:** these certificates are recorded **in governance only**; no product artifact was created or modified (the product-resident final-readiness certificates of `f8aa038` remain verbatim, self-described as Tier-3 A2-gate evidence, and are **not retroactively relabelled** — this record is their successor authority act). The certificates certify the **evidence-maturity standard only**: Class A capability status is untouched, **no IVM transition occurs herein** (IVM remains A/A2 ×3 until Gate 2), **no production, promotion, or release authority** is granted, and **no independent verification is claimed** — `D7-TIER3-INDEPENDENCE remains OPEN / NEGATIVE` (no organizational, external, third-party, or accredited independence exists).

## 4. D7 qualification inheritance (preserved verbatim; none converted)

`D7-TIER3-PARITY = SATISFIED WITH RECORDED QUALIFICATIONS` — Q5 ontology compatibility = OUTSIDE CERTIFICATION CRITERION; DF-1 = NON-BLOCKING; 33/33 manifest qualification = NON-BLOCKING; IES-020 §28 Q1/Q2/Q3/Q5 = OUTSIDE CERTIFICATION CRITERION, §28 Q4 = NON-BLOCKING; IES-017 stale-pack = NON-BLOCKING; raw-pipe source observation = NO EFFECT ON PARITY; `D7-TIER3-INDEPENDENCE` = OPEN / NEGATIVE. OUTSIDE items are not converted to RESOLVED; NON-BLOCKING items are not converted to CLOSED; no item becomes an independence claim.

## 5. D25 evidentiary classification basis

The prior readiness artifacts are **rank-5 evidence records** ("not maintainer-issued, unlike all six A1 certificates"; cannot establish acceptance). This gate does not upgrade those artifacts; it performs the **new maintainer-level A1 issuance act** that D25 identifies as the only path to A1 certification. Upgrading an artifact's claim without such an act would remain `D-AUTHCLAIM-UNSUPPORTED`.

## 6. Exclusions and boundaries

No product mutation; **no IVM mutation** (A2 stands; Gate 2 = the only authorized transition path, per-engine, only for the three engines certified herein); no methodology, scoring, or ranking change; no D36 or E2E-018 change; no live/UI parity certification; no P3; no promotion; no release; no revival of expired or historical (main-lineage) authority; scope confined to IES-016/017/020. Fail-closed rules 1–10 of the composite authority remain binding on Gate 2.

## 7. Integrity proof

Product HEAD `c2dda91de8bd362d4766ed19d777a80e6976c9b5` before and after this gate (worktree clean; remote identical; zero product commits). Governance: this record is the sole staged delta (**1 added / 0 modified / 0 deleted**, append-only, parent `73fb9183…`). No protected ref other than the governance branch tip advanced by exactly this commit.
