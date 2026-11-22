# IID Stage 6 — S6-1: operator limits policy runtime integration (implementation record)

**Work item:** S6-1 — connect the existing fail-closed operator-limits parser to the documented policy path and to
the disposition-generation path (decision record `IID-STAGE-5-PA-PO-ACCEPTANCE-DECISION-2026-11-22.md` §4.2–§4.3;
roadmap §C.11 "first actionable step")
**Authority:** owner instruction 2026-11-22 — implementation, targeted tests, documentation and publication through
an IRR PR. **Not authorised, not done:** choosing or writing the owner's limits values; a populated
`limits-policy.json`; IPD files or behaviour; other Stage 6 work; production/hosted/multi-user/commercial scope;
any change to the owner's Windows checkout.
**Repository:** `ramkivs/iips-review-recovered` (IRR). Base `main@58270c822d611b0e847182f463dea61b862a70f3` (PR #621 merge)
**Date:** 2026-11-22 (UTC)
**Status:** **IMPLEMENTED AND VERIFIED IN THE SANDBOX — S6-1 NOT COMPLETE** (§7: host verification with the
owner's own file is pending and the owner's values do not exist yet; and §3 names an architectural gap that this
work item was not authorised to close).

---

## 1. What was inspected first (current branch, not the earlier static search)

| Item | Found on `main@58270c82` |
|---|---|
| Decision record §4.3 blocker | "no runtime reader bound to the documented path; no caller of `resolveDispositionLimits` outside its module" |
| Re-verified | **Still true.** `resolveDispositionLimits` (`frontend/server/investment/dispositionService.ts`) had no caller in `frontend/server`, `frontend/src` or `iips-platform/src` other than its own tests; no reference to `investment/policies` or `limits-policy.json` existed outside `docs/OPERATOR_RUNBOOK.md` §15.3 and roadmap B.H |
| Parser / schema | `iips-platform/src/investment/disposition/limits.ts` — `parseLimitsPolicyText` → `parseLimitsPolicy` (closed key set, typed rejections `LIMITS_REJECTIONS`), `resolveLimits` (effective dating; `basis` `SYSTEM_DEFAULT` ↔ `OPERATOR_CONFIG`; future-dated policy ⇒ defaults + note). `resolveDispositionLimits` wraps them fail-closed for text input. **Unchanged by this work** |
| Existing tests | `frontend/server/investment/disposition-records.test.ts` "limits policy resolution" (defaults / operator text / unreadable text fails closed); `iips-platform/tests/investment/disposition-limits.test.ts` |
| Data-root convention | explicit root > `IIPS_DATA_DIR` > `<cwd>/.iips-data`, then `investment/<subdir>` — `resolveIdentityDir` (identity), `localSnapshotStore` (dataset), `resolveDataDir` (persistence) |
| **Actual runtime disposition-generation path and its callers** | The engine is `buildDispositionPayload` (`iips-platform/src/investment/disposition/engine.ts`), which takes `limits: ResolvedLimits` as an input; recording is `createDispositionRecordsService().record()`. **The only caller of either in IRR is `frontend/server/investment/cli/disposition-demonstration.ts`** — the operator CLI named by runbook §15.1 — and it passed `resolveLimits({ policy: null, asOf })`, i.e. a literal "no policy". The read transport (`disposition-transport.ts`, GET/HEAD only) produces nothing; it serves recorded chains. **There is no operator CLI that mints a disposition for a real holding against the live NP-04 store** (§3) |

## 2. What was implemented (narrow)

### 2.1 `frontend/server/investment/limitsPolicySource.ts` — new

- `resolveLimitsPolicyDir(dataRoot?, env?)` / `resolveLimitsPolicyPath(dataRoot?, env?)` — the documented path
  under the application's data-root precedence. The file name (`limits-policy.json`) is a constant; nothing can point
  the loader at another file, so `OPERATOR_CONFIG` has exactly one possible provenance.
- `loadOperatorLimitsPolicy({ asOf, dataRoot?, env? })` → `{ limits: ResolvedLimits, source: { kind, path } }`:
  - **no file** → `resolveDispositionLimits({ policyText: null })` (labelled defaults), `source.kind = 'ABSENT'`, the
    path it looked at;
  - **file present** → bytes read → `resolveDispositionLimits({ policyText })` — the **existing** parser and
    resolver, no parallel logic — `source.kind = 'OPERATOR_FILE'`; a valid in-force policy yields `OPERATOR_CONFIG`
    with the file's `policyVersion`; a future-dated one yields defaults with the note (that is `resolveLimits`'
    decision, preserved);
  - **file present but empty, a directory, unreadable, not JSON, not an object, unknown key, missing/invalid/
    out-of-range value** → throws `LimitsPolicyError(<reason>)`. The defaults are never substituted. (A blank *file*
    is treated as invalid rather than as "no policy": the operator wrote something, and it is not a policy.)
- `isLimitsDisclosureConsistent(loaded)` — the invariant "`OPERATOR_CONFIG` only when `source.kind === 'OPERATOR_FILE'`;
  otherwise the version ends `+system-default`", exported so producers and tests can assert it.

### 2.2 `frontend/server/investment/cli/disposition-demonstration.ts` — the one producer, now wired

- Caps come from `loadOperatorLimitsPolicy({ asOf: CLOCK, dataRoot: options.limitsPolicyRoot ?? env.root })`,
  loaded **before any store is opened**; a `LimitsPolicyError` cleans up the temporary root and propagates.
- Default behaviour unchanged: the demonstration's own fresh root has no policy ⇒ `ABSENT` / `SYSTEM_DEFAULT`,
  identical verbs and chain mechanics to before.
- New optional `--limits-policy-root <dir>` (programmatic `{ limitsPolicyRoot }`) so an operator can prove, on a
  synthetic subject and a throwaway store, that **the file at `<dir>/investment/policies/limits-policy.json`** loads
  and is applied. Only the root is configurable, never the file name.
- Evidence JSON gains `limits { source, basis, policyVersion, effectiveFrom, notes, recordedHeld, recordedCandidate }`
  and **verification point 9**: disclosure consistent, and both recorded payloads carry exactly the loaded `basis`
  and `policyVersion`.
- CLI exit codes: `0` all points pass; `1` a point fails; **`2` the operator policy was rejected** — the reason and
  "defaults NOT substituted" are printed; no evidence file is written.

### 2.3 Not changed

`limits.ts`, `engine.ts`, `dispositionService.ts`, `dispositionComposition.ts`, the read transport, any scoring,
assessment, portfolio or verb logic, any UI, any IPD file. No new dependency. No settings UI. No new route.

## 3. Architectural gap recorded — not closed here (requires separate authority)

The decision record's S6-1 acceptance reads *"a disposition computed after the policy is in place reports
`limits.basis = OPERATOR_CONFIG` with the owner's `policyVersion`"*. After this work that is true for every
disposition IRR can produce — but the only producer is the **synthetic demonstration**. IRR has **no operator CLI
that mints a disposition for a real holding** (real portfolio read → real assessment chain → `buildDispositionPayload`
→ `record()` on the live NP-04 store). The runbook's §15.1 "and the same `record()` path in any operator script"
describes a path that no script yet walks.

Consequences, stated plainly:

- The owner's policy, once authored, will be **loaded, validated and applied** by the disposition path that exists,
  and its basis/version will be **disclosed truthfully** — verifiable on the host with the §5 command.
- A disposition **on a real holding** carrying `OPERATOR_CONFIG` cannot be produced until a real-holding disposition
  mint exists. Building one is a new capability (portfolio read via IPC, identity resolution, assessment lookup,
  subject/portfolio-context assembly, write to the live store) — **outside S6-1's authorisation**. It is recorded as
  **S6-1b — real-holding disposition mint CLI — OPEN, IRR-owned, awaiting authority**, and it is the natural next
  design item once the owner's policy exists.
- This work did **not** silently widen into S6-1b.

## 4. Tests added and results (sandbox, Node 22 / vitest 2.1.9)

| File | Covers | Result |
|---|---|---|
| `frontend/server/investment/limitsPolicySource.test.ts` (24 tests) | documented path under explicit root / `IIPS_DATA_DIR` / cwd fallback / blank env; valid policy → `OPERATOR_CONFIG` + exact `policyVersion` + caps + `effectiveFrom`; found through `IIPS_DATA_DIR`; future-dated → defaults with note, not `OPERATOR_CONFIG`; absent → explicit `ABSENT`, labelled defaults, never `OPERATOR_CONFIG`; 12 invalid-file cases each mapped to its `LimitsPolicyError.reason` (malformed JSON, array, empty, whitespace, unknown key, missing version, missing/invalid `effectiveFrom`, out-of-range cap, non-numeric cap, non-object sector map, non-percentage sector cap); directory at the path; unparseable `asOf`; forged disclosure rejected | **24/24 pass** |
| `frontend/server/investment/cli/disposition-demonstration.test.ts` (3 tests) | default run: 9 points hold, `ABSENT`/`SYSTEM_DEFAULT`, written payload default, `noExecutionPath` true; valid root: 9 points hold, `OPERATOR_FILE`, `OPERATOR_CONFIG`, `policyVersion` `limits-policy/s6-1-test` on loaded limits, both recorded payloads and every `limits.applied` entry; caps 7 / {DEFAULT 22, Technology 18} in the written payload; **verbs identical to the default run** (decision logic untouched); invalid root: rejects with `LimitsPolicyError(UNKNOWN_KEY)` before any store, no evidence written | **3/3 pass** |
| `frontend/server/investment/disposition-records.test.ts` (existing, 17 tests) | unchanged behaviour of the records service and `resolveDispositionLimits` | **17/17 pass** |

Type checks: `tsc --noEmit` (frontend main project) **clean**; `tsc -p tsconfig.investment-server.json` reports only
the two pre-existing errors in `g10JsFreeCoverage.test.ts` / `iidInvestmentCoverageTransport.test.ts` (untouched,
present on `main` before this work; not introduced here). No broad suite run.

## 5. Runtime verification performed (sandbox; operator-style invocation)

```text
npx tsx server/investment/cli/disposition-demonstration.ts --out <dir>
  PASS  9. … source ABSENT, basis SYSTEM_DEFAULT, policyVersion limits-policy/1.0.0+system-default; held …; candidate …   exit 0

npx tsx server/investment/cli/disposition-demonstration.ts --out <dir> --limits-policy-root <root with a valid file>
  PASS  9. … source OPERATOR_FILE, basis OPERATOR_CONFIG, policyVersion limits-policy/cli-check; held OPERATOR_CONFIG/limits-policy/cli-check; candidate OPERATOR_CONFIG/limits-policy/cli-check   exit 0
  evidence.limits = { source.kind OPERATOR_FILE, basis OPERATOR_CONFIG, policyVersion limits-policy/cli-check, effectiveFrom 2026-11-01T00:00:00.000Z, recordedHeld/recordedCandidate OPERATOR_CONFIG }

npx tsx server/investment/cli/disposition-demonstration.ts --out <dir> --limits-policy-root <root with an unknown key>
  FAIL  limits policy (UNKNOWN_KEY): unknown limits-policy key "singleNameMaxPercent" — policy_inputs_unavailable; defaults NOT substituted   exit 2   (no output directory created)

IIPS_DATA_DIR=<root> → loadOperatorLimitsPolicy({ asOf }) → OPERATOR_FILE OPERATOR_CONFIG limits-policy/cli-check <root>/investment/policies/limits-policy.json
```

The policy files used were throwaway test values in a sandbox temp directory, deleted afterwards. **No file was
written to the owner's data root; no owner values exist or were invented.**

## 6. Documentation

- `docs/OPERATOR_RUNBOOK.md` §15.3 — how the file is found, the outcome table, the host verification command, and
  the explicit "what this does not yet give you" (no real-holding mint).
- Roadmap §C.12; tracker §16.316; this record.

## 7. Status and what remains

| Item | Status | Owner |
|---|---|---|
| Loader at the documented path, existing parser, fail-closed, truthful disclosure | **IMPLEMENTED; verified by tests and by sandbox runtime invocation** | IRR (this PR) |
| Wired into the disposition-generation path | **IMPLEMENTED** for the only producer that exists (demonstration CLI) | IRR (this PR) |
| Host verification with the owner's own file (`--limits-policy-root %IIPS_DATA_DIR%`, point 9 `OPERATOR_CONFIG` + the owner's `policyVersion`) | **PENDING** — needs (a) this PR delivered to the host by the owner's manual, controlled synchronisation and (b) the owner's policy file, which does not exist yet | owner |
| Owner's limits values | **not authored** (reserved to the owner; next action) | owner |
| S6-1b real-holding disposition mint | **OPEN — awaiting authority** (§3) | IRR, on owner instruction |
| **S6-1** | **NOT COMPLETE** — code delivered and verified in the sandbox; completion requires the host verification above with the owner's values | — |

No IPD write. No change to the owner's Windows checkout. No fetch/pull/checkout/merge/rebase/reset in the owner's
environment. Stage 6 remains **IN PROGRESS**; nothing else in Stage 6 was started.
