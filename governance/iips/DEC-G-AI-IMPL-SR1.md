# DEC-G-AI-IMPL-SR1 — Runtime `engineResultRef` / Snapshot Provenance Review

- **Record ID:** `DEC-G-AI-IMPL-SR1`
- **Title:** SR-1 — Runtime `engineResultRef` and Snapshot Provenance under S3-A
- **Class:** `DECISION`
- **Status:** `RECORDED — SR-1 RESOLVED (SR-1-A FULLY COMPATIBLE)`
- **Date/time:** 2026-08-27
- **Authority relationship:** reviews **SR-1** of `SPEC-G-AI-IMPL` against the S3-A execution path
  recorded in `DEC-G-AI-IMPL-S1-S4`. Resolves the review item that `DEC-G-AI-IMPL-S1-S4` §7 flagged.
  Does **not** modify `SPEC-G-AI-IMPL`, `AUTH-G-AI-IMPL`, or any historical decision record.
- **Scope:** the authoritative meaning and provenance of `AiAdvice.engineResultRef` under S3-A.
  Nothing else. S1–S4 are **not** reopened.
- **Provenance:** all findings verified by object-level inspection of `origin/phase13-next`
  (`85bbd49`). Implementation was consulted **as evidence only**; no implementation behaviour was
  promoted into authority merely because it exists. No baseline transition was performed.
- **Supersession / revision:** supersedes the "SR-1 review outstanding" status recorded in
  `DEC-G-AI-IMPL-S1-S4` §7 and `DEC-G-AI-IMPL-S2` §9. No historical record is modified.

---

## 1. EXACT SR-1 REQUIREMENT (verbatim, not paraphrased)

From `SPEC-G-AI-IMPL` §2:

> | **SR-1** | The synthesized `snap_<sector>` value is a **presentation-level reference** and must
> **not** be presented as a canonical `snapshotRef` |

### What SR-1 actually requires

SR-1 is a **prohibition**, not a production requirement. Read precisely, it has two limbs:

1. it characterises a **synthesized `snap_<sector>` value** as presentation-level; and
2. it **prohibits** presenting that synthesized value **as** a canonical `snapshotRef`.

**SR-1 does not require that `engineResultRef` equal `snap_<sector>`.** It does not mandate any
textual representation. It forbids one specific misrepresentation.

---

## 2. CANONICAL RUNTIME BEHAVIOUR (evidence)

### 2.1 Where `engineResultRef` originates

```ts
executeWithAi(engineId, makeEngine, request) {
  const rt = this.buildRuntime(engineId, makeEngine);
  const engineResult = rt.runtime.execute(engineId, request).result;
  const evidence = { composite: engineResult.metadata.composite, verdict: engineResult.metadata.verdict };
  const advice = this.advisor.advise(engineResult, evidence);
  this.advices.push(Object.freeze(advice));
  return { result: engineResult, advice, engineResultUnchanged: true };
}
```

`AiAdvice.engineResultRef?: string` is documented as "link to the certified engine result this advises
on". Under S1 the advisor populates it from the engine result it is given.

### 2.2 Where `snapshotRef` originates

Every one of the **13** sector engines sets it identically:

```ts
return {
  state: 'COMPLETED',
  snapshotRef: snapshot.snapshotId,
  evidenceRef: evidence.evidenceId,
  metadata: { … }
};
```

Verified for all 13: banking, insurance, capital-markets, healthcare, hospitality, energy, utilities,
consumer, industrials, technology, **telecommunications, automobile, materials-metals**. Each has
exactly one `snapshotRef` reference, and each assigns `snapshot.snapshotId`.

### 2.3 How `snapshotId` is generated

```ts
snapshotId: this.idProvider.generate('SNAP', `${input.engineId}|${this.clock.now()}`)
```

`buildRuntime` constructs `createClock('fixed')` and `createIdProvider('deterministic')`:

- `createClock('fixed')` → `FixedClock`, default `'2026-08-06T00:00:00.000Z'` → **constant** `now()`
- `createIdProvider('deterministic')` → `DeterministicIdProvider`, documented as "**stable opaque IDs
  for identical (prefix, seed)**", FNV-1a over `instanceSeed|PREFIX|clean(seed)`, rendered as
  `SNAP_<8 hex uppercase>`

Therefore `snapshotId` is **deterministic and reproducible**: same `engineId` + constant clock ⇒ same
seed ⇒ same opaque identifier. It is **not** random — the `'runtime'` provider that uses
`Date.now()`/`Math.random()` is explicitly **not** the one used here.

---

## 3. DATA FLOW (verified)

```
request
  → sector key                                   (D6, API boundary)
  → engineId                                     (PROGRAM_v1.1_REPLAY_BASELINE.json, 13 verified pairs)
  → frozen baseline inputs                       (BASELINE s.input / engineDetails[sector].inputs)
  → executeWithAi(engineId, makeEngine, {requestId, inputs})     (S3-A)
  → buildRuntime: FixedClock + DeterministicIdProvider
  → runtime.execute(engineId, request) → ExecutionResult          (engine sets snapshotRef = snapshotId)
  → evidence = {composite, verdict}                               (platform-constructed)
  → COMPLETED-state check                                         (S4, before advice)
  → advisor.advise(engineResult, evidence) → AiAdvice             (S1 deterministic)
  → advice.engineResultRef = engineResult.snapshotRef             (governed, optional)
  → advices.push(Object.freeze(advice)) → adviceLog() lineage
  → transport response (200 + 12-field governed DTO)
```

| Property | Verified |
|---|---|
| Deterministic | **YES** — FixedClock + DeterministicIdProvider |
| Tied to the actual runtime result | **YES** — it *is* `engineResult.snapshotRef` |
| Tied to the snapshot used by the result | **YES** — the engine sets it from the snapshot it recorded |
| Reproducible | **YES** — stable for identical `(engineId, clock)` |
| Provenance-safe | **YES** — opaque `SNAP_<hex>`; no embedded facts |
| Tenant-safe | **YES** — see §6 |
| Compatible with `freshness = 'SNAPSHOT'` | **YES** — see §5 |

---

## 4. A===B ANALYSIS

| Check | Result |
|---|---|
| `runtime.execute()` invocations inside `executeWithAi` | **1** |
| `advisor.advise()` invocations | **1** |
| Same `engineResult` passed to `advise()` | **YES** — a single local `const`, not re-derived |
| Advice frozen and recorded | **YES** — `advices.push(Object.freeze(advice))` |
| `adviceLog()` lineage | **PASS** — the log records the advice generated from that result |
| `engineResultUnchanged` | **`true`**, returned to the caller |
| Second, unrelated engine result represented as the advisory source | **IMPOSSIBLE** — only one result exists in scope |

**A===B: PASS.** Not asserted from the shared `engineId` alone: the single-execution, single-advise
structure and the frozen `adviceLog()` entry establish that the advisory is generated from, and refers
to, the same runtime result that is returned.

---

## 5. FRESHNESS ANALYSIS

| Check | Result |
|---|---|
| `Freshness` type | `'LIVE' \| 'SNAPSHOT' \| 'STALE' \| 'UNAVAILABLE' \| 'REPLAY'` |
| `freshness: 'SNAPSHOT'` conventions in `executive-transport.ts` | **7 — unchanged** |
| Does `engineResultRef` identify the snapshot associated with the runtime result? | **YES** |
| Consistency with `freshness = 'SNAPSHOT'` (SR-2) | **PASS** — the advisory is derived from a frozen, snapshot-backed result, and its reference identifies exactly that snapshot |

**FRESHNESS: PASS.** No existing SNAPSHOT convention is changed.

---

## 6. SECURITY / TENANT / PROVENANCE

| Check | Result |
|---|---|
| Exposes tenant-sensitive information | **NO** — the seed is `engineId \| clock.now()`; `tenant` occurs **0** times in `SnapshotService.ts` and **0** times in `AiAssistedRuntime.ts` |
| Contains raw inputs | **NO** — the identifier is an FNV-1a hash rendered as `SNAP_<8 hex>`; inputs are not embedded |
| Permits cross-tenant lookup | **NO** — it is an opaque identifier, not a query key; authorization remains via `guardRead` (B4) |
| Implies external AI provenance | **NO** — consistent with **S1**, which prohibits AI invocation and requires that `model`/`modelVersion` not imply an external model |
| Compatible with S1 deterministic advisor | **YES** — both are deterministic; the reference is reproducible |
| Compatible with S2 fixed text | **YES** — the reference is a separate field; the fixed `text` is unaffected |
| Compatible with S4 failure semantics | **YES** — under S4 a non-`COMPLETED` result never reaches `advise()`, so no reference is produced for a failed result; advisory failure yields `503 advisory-unavailable` with no DTO |

**TENANT/SECURITY: PASS · PROVENANCE: PASS.**

---

## 7. REPRESENTATION CONFLICT

### **NONE.**

The distinction required by §7 of the gate is decisive:

| | |
|---|---|
| "must identify the engine result / snapshot" | The runtime reference **does** — it is the snapshot's own `snapshotId` |
| "must literally equal `snap_<sector>`" | SR-1 **never requires this**. SR-1 only prohibits presenting a *synthesized* `snap_<sector>` as canonical |

Under S3-A there is **no synthesized `snap_<sector>` value at all**. `engineResultRef` is a **genuine
canonical `snapshotRef`** produced by the platform's own `SnapshotService`. SR-1's prohibited
misrepresentation therefore **cannot occur**, and SR-1's actual requirement — that a presentation-level
synthesis not masquerade as canonical provenance — is **satisfied**.

No textual representation requirement was invented in order to manufacture a conflict, and SR-1 was
not silently reinterpreted: its verbatim text is reproduced in §1 and applied as written.

---

## 8. CLASSIFICATION

# **SR-1-A — FULLY COMPATIBLE**

The canonical runtime-generated `engineResultRef` satisfies SR-1.

| Alternative | Why not selected |
|---|---|
| **SR-1-B — semantically compatible, representation different** | Not selected because there is **no** representation difference to accept. SR-1 mandates no textual form, so the runtime reference does not merely satisfy SR-1's *purpose* — it satisfies SR-1 as written. Selecting B would imply a deviation that does not exist |
| **SR-1-C — specification amendment required** | Not selected: SR-1 is neither ambiguous nor inconsistent with S3-A once read as the prohibition it is. No amendment is needed |
| **SR-1-D — incompatible** | Not selected: the runtime reference violates no SR-1 limb. It is not a synthesized presentation-level value, and it is not presented as something it is not |

---

## 9. SPECIFICATION AMENDMENT

### **NOT REQUIRED**

`SPEC-G-AI-IMPL` has **not** been edited; its SR-1 clause stands verbatim and is satisfied by the
canonical runtime behaviour under S3-A. `AUTH-G-AI-IMPL` is likewise unmodified.

---

## 10. NO IMPLEMENTATION PERFORMED

| Check | Result |
|---|---|
| Implementation file created or modified | **NONE** |
| Test file created or modified | **NONE** |
| Runtime altered to force the old `snap_<sector>` representation | **NO** — expressly not done |
| Frontend, engine, route, navigation, policy or schema change | **NONE** |
| `SPEC-G-AI-IMPL` / `AUTH-G-AI-IMPL` / historical decision records | **NOT MODIFIED** |
| Recovery file restored or copied | **NONE** |
| Baseline transition performed | **NO** — canonical inspected by object reference only |
| Certification | **NOT PERFORMED** |
| Repository mutation in this gate | this decision record only, under `governance/iips/` |

**IMPLEMENTATION: BLOCKED.**

---

## 11. CONSEQUENCE

With SR-1 resolved, the complete authority set is in place:

| Item | Status |
|---|---|
| B1 | canonical baseline operational |
| B2 | resolved |
| B3 | resolved |
| B4 | resolved through canonical `guardRead` |
| S1 | deterministic in-process advisor |
| S2 | fixed exact advisory text |
| S3 | `executeWithAi` authoritative |
| S4 | failure / fallback / error semantics resolved |
| SR-1 | **resolved — SR-1-A** |
| SR-2 … SR-5 | unchanged and satisfied |

The next gate is the **final G-AI-IMPL controlled implementation authorization gate**. This record does
**not** authorize implementation.
