# DEC-A2-A1-TIER3-CREATION-AUTHORITY â€” Tier-3 Evidence Creation: Requirements Confirmed, Creation NOT Authorized

- **Record ID:** `DEC-A2-A1-TIER3-CREATION-AUTHORITY`
- **Title:** A2 â†’ A1 Tier-3 Evidence Creation â€” Requirements Confirmed, A1-Parity Obstacle Recorded, Creation Not Authorized
- **Class:** `DECISION` / `AUTHORITY`
- **Status:** `RECORDED â€” TIER 3 = OPTION C (EVIDENCE-DEBT REMAINS OPEN); NO EVIDENCE ARTIFACT AUTHORIZED OR CREATED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `PROGRAM v3.0 / IES CAPABILITY RE-BASELINE â€” A2 â†’ A1
  EVIDENCE-ARTIFACT CREATION AUTHORITY GATE â€” TIER 3 FIRST`. Options A / B / C / D were
  presented **without recommendation**, with the evidence for each. The maintainer explicitly
  selected **C â€” keep Tier-3 evidence-debt open**. Recording authority was granted separately
  and explicitly, scoped to `governance/iips/` on `arena` only.
- **Scope:** confirming **what** Tier-3 A1 closure requires, and recording two findings that
  constrain it. **This record authorizes no verifier engagement, creates no evidence
  artifact, amends no matrix, changes no Class A status, and closes no capability.**

**Provenance:** pre-existing governance record; provenance reconstructed from the authoritative governance record and execution lineage available at the time of D33-C1 amendment. This metadata amendment records provenance only and does not alter the record's substantive decision, authorization, scope, or evidentiary determination.

---

## 1. DECISION â€” OPTION C

Tier-3 A1 closure requirements are **confirmed and recorded**. **Neither verifier engagement
nor evidence-artifact creation is authorized.** The seven A2 capabilities remain **A2**, and
all **14 capabilities remain Class A**.

Two findings are recorded as **explicit constraints** on any future Tier-3 closure, so that
no later gate can absorb them silently.

## 2. TIER 3 EVIDENCE PACKAGE â€” CONFIRMED REQUIREMENTS

For **IES-016 telecommunications**, **IES-017 automobile** and **IES-020 materials-metals**:

| # | Required item | Status | Recoverable? |
|---|---|---|---|
| 1 | framework-integration regression test | **MISSING â€” must be newly authored** | No â€” never existed |
| 2 | reuse-verification regression test | **MISSING â€” must be newly authored** | No â€” never existed |
| 3 | independent verification | **MISSING â€” must be newly authored**, and per Â§3 **only as *simulated* independent verification** | No |
| 4 | final-readiness evidence (`IES0xx_FINAL_READINESS_CERTIFICATE.md`) | **MISSING â€” must be newly authored** | No |
| 5 | freeze/provenance manifest | **MISSING â€” must be newly authored**, and per Â§4 **cannot replicate the A1 structure** | No |

**Already present and must NOT be duplicated, rewritten or relabelled:**

| Item | Status |
|---|---|
| acceptance regression test | **PRESENT** for all three |
| wp4-validation regression test | **PRESENT** for all three |
| implementation / source | **11 source files each â€” no implementation gap** |
| frozen-asset set | **4 JSONs each** (calibration, golden-reference, expected-outputs, validation-fixtures) |
| pack documents | **5 each**: `IES-0xx_IMPLEMENTATION_READINESS_CERTIFICATE.md`, `RELEASE_NOTES_IES-0xx_v1.0.0.md`, `*_DISCOVERY_PACK.md`, `*_ENGINE_ACCEPTANCE_MATRIX.md`, `*_IMPLEMENTATION_RISK_REGISTER.md` |

**Note:** the existing `IES-0xx_IMPLEMENTATION_READINESS_CERTIFICATE.md` is **not** the A1
"final readiness certificate" (`IES0xx_FINAL_READINESS_CERTIFICATE.md`, held by IES-010â€¦015
and CSIP) and **must not be relabelled as such**.

## 3. FINDING 1 â€” NO GENUINELY INDEPENDENT VERIFIER EXISTS (`D7-TIER3-INDEPENDENCE`, resolved as a negative)

All **11** existing independent-verification reports were examined. Verbatim reviewer-role
statements:

> `iips-platform/reports/INDEPENDENT_VERIFICATION_REPORT.md` (banking):
> **"Reviewer role:** Independent verification (**Arena acting as reviewer, not implementer**)"
> **"## 1. Methodology (**simulated independent engineer**)"** â€” *"From a clean workspace with
> no pre-existing `node_modules`, no build artifacts, and no test state: obtain the two
> repositories; build the implementation from scratch; run the complete regression suite;
> confirm every frozen output is reproduced from the fresh build; produce this report."*

> `iips-platform/reports-insurance/INDEPENDENT_VERIFICATION_REPORT.md`:
> **"Reviewer role:** Independent verification (**Arena as reviewer**)"

The IES010/011/012/013/014/015 and CSIP reports state only *"INDEPENDENT VERIFICATION
PASSED"* with a date and no reviewer role.

A search of all 11 reports for `third-party`, `external organization / auditor / reviewer`,
`certification body`, `accredited`, `third-party audit` returns **zero matches**.

> **RECORDED FINDING: no genuinely independent verifier can be established from durable
> evidence.** No external organization, third-party auditor, certification body or accredited
> reviewer is named or claimed anywhere in the program's evidence. The program's own
> established convention is that **the same party acts as reviewer rather than implementer**,
> and its own banking report labels that methodology **"simulated independent engineer"**. The
> "independence" is **role separation plus a clean-workspace reproducibility methodology**,
> **not organizational independence**.
>
> **No organization, reviewer, certification body, role, person or independence relationship
> is invented by this record.**

**Constraint established:**

> Any future Tier-3 independent verification **must be explicitly labelled as *simulated*
> independent verification** performed by the same party acting in a reviewer role, and
> **must make no claim of organizational independence**. Authorizing or producing
> "independent verification" without that label would misrepresent the evidence and would
> contradict the program's own existing reports.

## 4. FINDING 2 â€” TIER 3 CANNOT REACH A1 ON THE IES-010 STANDARD (`D7-TIER3-PARITY`, new)

The A1 reference freeze manifest (`ies-010-hospitality/IES-010_FREEZE_MANIFEST.json`)
requires:

```
"engineeringDocs": "IES-010-D01..D19 (19 documents)"
"reviewArtifacts": [ business-model consistency matrix, override-precedence matrix,
                    decision-trace examples, ontology-registration review,
                    architecture review ]
"documentHashes": { calibration, goldenDataset, expectedOutputs, replayDataset,
                    validationFixtures, normativeCalculationAppendix, decisionEngine,
                    businessModelConsistencyMatrix, overridePrecedenceMatrix, â€¦ }
```

Verified against the Tier-3 packs:

| | IES-010 (A1 reference) | IES-016 / 017 / 020 |
|---|---|---|
| `docs/` engineering document set | **19 documents (D01â€¦D19)** | **0** |
| `ARCHITECTURE_REVIEW` | **1** | **0** |
| Review matrices (business-model consistency, override precedence, decision-trace, ontology-registration review) | present | **0** |
| Documents available to reference | 19 docs + 5 review artifacts | **5 documents only** |

> **RECORDED FINDING: a Tier-3 freeze manifest could only honestly reference the five
> documents that exist.** It could **not** carry `engineeringDocs: D01..D19`, an architecture
> review, or the review matrices, because those documents **do not exist**. Producing a
> manifest referencing them would be **fabrication**.
>
> **Therefore Tier 3 cannot reach A1 on the same evidentiary standard as IES-010â€¦015 by
> authoring the five items in Â§2 alone.** Closing that gap would require producing a
> 19-document engineering set and an architecture review per engine â€” a **major
> documentation programme**, not evidence closure.
>
> **Constraint established:** any future decision to move a Tier-3 capability to A1 must
> first decide explicitly **either** (a) to produce the missing engineering documentation
> set, **or** (b) to redefine what A1 requires â€” which would be a **methodology change
> affecting all 14 capabilities**, not a Tier-3 exception. **Neither is decided here, and
> neither may be absorbed silently.**

## 5. IMPLEMENTATION BOUNDARY â€” VERIFIED, NO IMPLEMENTATION CHANGE REQUIRED

| Check | Result |
|---|---|
| Framework services required by a framework-integration test | **All PRESENT** â€” `ManifestLoader`, `Transport`, `DiagnosticsService`, `QualificationService`, `ActivationService`, `PluginLoader`, `RuntimeCoordinator`, `EvidencePipeline` |
| Do Tier-3 engines already load through the framework? | **YES** â€” `telecommunications-acceptance.test.ts` already imports `Container`, `createClock`, `createIdProvider`, `PluginLoader`, `SnapshotService`, `SnapshotStore`, `ReplayService`, `RuntimeCoordinator`, `EvidencePipeline` |
| Would items 1â€“2 modify production implementation, engine behaviour, runtime registration or protected platform files? | **NO** â€” pure test authoring against framework services already exercised |
| Would items 3â€“5 modify any implementation? | **NO** â€” documentation artifacts |
| Would any item touch the certified AI Advisory surface? | **NO** |

**All Tier-3 evidence work is test/documentation work only. No implementation mutation is
required, and none was proposed or authorized.**

## 6. AUTHORITIES KEPT SEPARATE â€” NONE COLLAPSED

| | Authority | Status |
|---|---|---|
| **A** | Define / require the evidence package | **Established** by D5 / D5-S3 / D5-S1, confirmed here |
| **B** | Create new evidence artifacts | **NOT GRANTED** |
| **C** | Perform independent verification | **NOT GRANTED** â€” and per Â§3 could only be *simulated*, explicitly labelled |
| **D** | Amend the matrix A2 â†’ A1 | **NOT GRANTED** |
| **E** | Execute evidence production | **NOT AUTHORIZED** |

## 7. MATRIX BOUNDARY â€” NOT AMENDED

The Integration Verification Matrix was **not** amended. **No A2 â†’ A1 cell change occurred.**
Matrix remains `cada0451400409b0fe9ff0d62309b756c7b45e43` with **14 rows, 7 A1 / 7 A2,
Class `{A}` only**. A matrix transition remains a separate authority action.

## 8. TIER 2 â€” UNCHANGED, NOT EXECUTED

`D7-TIER2-PROVENANCE` remains conclusively negative (archive, pre-prune tag
`prune-pre-v3-phase12/option-a` and commit `a838bd5` all unavailable; no alternative
pre-prune branch). The existing rule stands: **Tier-2 historical artifacts must never be
fabricated or represented as recovered historical evidence.** Any later re-verification must
be explicitly dated and labelled as new work. **Tier-2 closure was not decided here.**

## 9. NEXT GATE IDENTIFIED

Per the recording grant, the next gate is named here. **It is not executed by this record and
requires its own authority.**

# Next: **`program-v3-matrix-rebaseline` BRANCH DISPOSITION GATE**

**Why this one.** Under Option C no Tier-3 creation gate follows, so the next **independent**
open item is the disposition of `refs/heads/program-v3-matrix-rebaseline`
(`027c38cc323a8834175edc4cbe8f3b272aed9522`), whose single commit's content is already on
`phase13-next` via `33dc1a7d7feaâ€¦`.

**What it must decide.** Delete the branch, retain it as a historical marker, or retain it
pending audit. Deletion would require **branch-deletion authority**, granted separately.

**Explicitly not pre-selected:** no Tier-2 re-verification gate, no matrix-amendment gate and
no Tier-3 creation gate is pre-selected; each remains an independent decision.

## 10. OPEN ITEMS CARRIED FORWARD

| Item | Status |
|---|---|
| **D7-TIER3-INDEPENDENCE** | **RESOLVED AS A NEGATIVE** â€” no genuinely independent verifier exists; any future verification must be labelled *simulated* |
| **D7-TIER3-PARITY** (new) | **OPEN** â€” Tier 3 cannot reach A1 on the IES-010 standard without a 19-document engineering set and architecture review per engine, or an explicit methodology redefinition affecting all 14 |
| **D7-TIER2-PROVENANCE** | **OPEN â€” conclusively negative** |
| `program-v3-matrix-rebaseline` disposition | **OPEN â€” identified as the next gate** |
| Dangling-citation annotation | **OPEN** â€” per `DEC-D6-DURABLE-RECORDING-POLICY` Â§3 |
| `AUTH-G-AI-IMPL` Â§4 referent-less prohibition annotation | **OPEN** â€” per `DEC-D2-DANGLING-VOCABULARY` |
| H / I / J Option-D validation | **OPEN** â€” infrastructure, not self-clearing |
| P7 referent | **OPEN** â€” identify, or record permanently that it has no referent; never claimed as PASS |

## 11. WHAT THIS RECORD DOES NOT DO

No evidence artifact created Â· no independent-verification report authored Â· no verifier
engaged or invented Â· no matrix amendment Â· no A2 â†’ A1 transition Â· no engine or
implementation change Â· no Class A capability status change Â· no certification change Â· no
release/version/tag promotion Â· no P7 reopening Â· no restoration of historical artifacts Â· no
threshold change (D5-S1 kind-set unchanged) Â· no branch merged, rebased or deleted Â· no
historical record amended Â· no ref other than `arena` moved.

## 12. CLASSIFICATION

# **TIER 3 = OPTION C RECORDED**

Requirements confirmed; creation **not** authorized. Two constraints recorded: any future
independent verification must be labelled **simulated**, and Tier 3 **cannot reach A1 on the
IES-010 evidentiary standard** without a major documentation programme or an explicit
methodology redefinition affecting all 14 capabilities. All 14 capabilities remain Class A;
the seven A2 capabilities remain A2.
