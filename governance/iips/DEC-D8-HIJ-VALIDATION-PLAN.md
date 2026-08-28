# DEC-D8-HIJ-VALIDATION-PLAN — H/I/J Validation Plan (Planning Only)

- **Record ID:** `DEC-D8-HIJ-VALIDATION-PLAN`
- **Title:** D8 §4 = B — Written Validation Plan for Criteria H, I and J
- **Class:** `DECISION`
- **Status:** `RECORDED — PLAN ONLY. NO VALIDATION PERFORMED. EXECUTION NOT AUTHORIZED`
- **Date:** 2026-08-28
- **Authority relationship:** produced under **§4 Option B** of gate
  `D8 — REMAINING GOVERNANCE REFERENCES / OPEN ITEMS DISPOSITION AUTHORITY GATE`, which the
  maintainer selected explicitly: *"Authorize future validation planning only. No live validation
  performed now."*
- **Scope:** a **written plan**. Nothing else. It creates no file, path, test, service or
  configuration anywhere in the repository, and executes nothing.
- **Provenance:** every fact below was read from tracked blobs at `origin/phase13-next`
  (`357b34dac1bd…`) in the same turn. **No test was executed, no server was started, no Keycloak
  was contacted, no browser was launched.** Where a behaviour is asserted from reading source
  rather than from execution, that is stated explicitly.
- **Supersession / revision relationship:** none. Companion to `DEC-D8-OPEN-ITEMS-DISPOSITION`
  and `DEC-D8-HIJ-CONFIG-DEFECT`.

---

## 1. WHAT THIS RECORD IS NOT

This is **not** an authorization to validate. It is not a test. It is not a schedule commitment.
It does not withdraw the H/I/J limitation. **Executing any step in §4 requires its own separate,
explicit authority**, granted only once the infrastructure in §2 exists.

| Explicitly NOT done by this record | Verified |
|---|---|
| No new file or test path created in the repository | `git status` clean in the recording clone; no product-branch mutation |
| No import, restoration, copying or derivation from the recovered live test | `frontend/server/live/` at `phase13-next` contains **0** `ai-advisory` paths |
| No live validation performed | no binary invoked; no port contacted |
| No H/I/J limitation withdrawn | `DEC-G-AI-IMPL-CERTIFICATION` §5 untouched |

## 2. PRECONDITIONS — NONE PRESENT TODAY

Re-verified at D8:

```
docker  podman  docker-compose  nerdctl  chromium  google-chrome  firefox   ->  all NOT FOUND
curl http://127.0.0.1:8080/                                                 ->  000
compose files tracked at phase13-next                                       ->  0
```

**Minimum infrastructure for execution** (each independently absent):

| # | Precondition | Needed for |
|---|---|---|
| P-1 | A reachable Keycloak serving `$KEYCLOAK_URL` (default `http://localhost:8080`), with admin API credentials | **I**, and therefore **H** |
| P-2 | A way to run it — a container runtime, or an externally hosted realm | **I**, **H** |
| P-3 | A browser capable of rendering the SPA and being inspected | **J** |
| P-4 | Network reachability between the test process, the IdP and the app server | **H**, **I**, **J** |

**Until all four exist, the limitation stands and is not self-clearing.**

## 3. WHAT ALREADY EXISTS TO PLAN AGAINST

This is **not** a greenfield exercise. Tracked material at `phase13-next`:

| Asset | Blob | What it supplies |
|---|---|---|
| `frontend/server/live/keycloak-provision.mjs` | `c4e5705812b9` | Provisions realm `iips`, client `iips-spa`, 3 roles, audience + `tenant`-claim mappers, 5 users. Env: `KEYCLOAK_URL`, `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`, `IIPS_TEST_PASSWORD` |
| `frontend/server/live/real-oidc-verifier.ts` | `4a937ce81c82` | `RealKeycloakVerifier` — real OIDC discovery + real JWKS RS256 signature verification via WebCrypto |
| `frontend/server/live/live-tenant-engine.test.ts` | `5dd1eedab0eb` | Working exemplar: `describe.skipIf(!kcUp)` (line 72), real password-grant token acquisition, real HTTP server on an ephemeral port |
| `frontend/server/live/admin-live-certification.test.ts` | `c02c19e2d980` | Second exemplar: `describe.skipIf(!kcUp)` (line 42) |
| `docs/v3.0/g3-build/keycloak-configuration.md` | — | Authoritative realm/client/role/identity configuration |

**Established repository convention, verified by reading source (not by execution):** live tests
probe Keycloak once and **skip the whole suite** when it is unreachable, so the default regression
gate is unaffected. Any H/I/J test **must** follow this pattern.

**Hard constraint carried from certification:** criterion **H** is unreachable **by construction**
without an executor — the advisory dispatch returns
`401 {"error":"authentication unavailable (no IdP configured)"}`. A plan that does not supply a
real executor backed by a real IdP **cannot** produce an authenticated 200, regardless of test
quality.

## 4. THE PLAN

### Stage 0 — Infrastructure bring-up *(no repository change)*

1. Provide a Keycloak reachable at `$KEYCLOAK_URL`, with `$KEYCLOAK_ADMIN` /
   `$KEYCLOAK_ADMIN_PASSWORD`.
2. Run the **existing, tracked** harness `frontend/server/live/keycloak-provision.mjs`.
3. **Gate:** accept only on literal stdout `PROVISION OK: realm iips | client iips-spa | …`.
   Any `PROVISION FAIL` halts the plan.
4. Confirm the two pre-existing live suites (`admin-live-certification`, `live-tenant-engine`)
   now **run rather than skip**. **This is the plan's control experiment**: if the repository's
   own already-certified live tests cannot pass, the environment is not adequate and no advisory
   claim may be made from it.

### Stage 1 — Criterion **I** — real Keycloak authentication

Prove the advisory path authenticates against a **real** realm using
`RealKeycloakVerifier` (real discovery, real JWKS RS256), following the
`describe.skipIf(!kcUp)` convention. **Success =** a Keycloak-issued token is cryptographically
verified and yields a governed read executor. **No mock, no stub, no hand-written claim.**

### Stage 2 — Criterion **H** — authenticated live HTTP 200

With Stage 1's executor wired into the real dispatch path, issue an authenticated advisory request
over a real socket. **Success = HTTP `200`** with the supplementary advisory explanation, and the
certified result **unchanged**. **A `401 authentication unavailable` is a FAIL of the environment,
not a pass of the criterion.**

### Stage 3 — Criterion **J** — live browser rendering

Render the three embedded surfaces — Company Intelligence, Sector Intelligence, Decision Matrix —
in a real browser. **Success =** the advisory explanation renders; the `AI EXPLANATION` badge is
present; and the mandated distinction
**`AI EXPLANATION ≠ CERTIFIED RESULT`** is visibly preserved on every surface.

### Stage 4 — Limitation withdrawal *(requires its own authority)*

Only if Stages 1–3 all pass: a **new** record withdraws the H/I/J limitation from
`DEC-G-AI-IMPL-CERTIFICATION` §5, and a **separately authorized** matrix amendment updates
`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` §3.2. **Neither happens automatically.**

## 5. INVARIANTS THAT BIND EVERY STAGE

1. **No unavailable test is ever recorded as PASS.** An unrun stage is `NOT PERFORMED`.
2. The recovered test `frontend/server/live/ai-advisory-live-certification.test.ts` (blob
   `2bcaac3329de`) **remains recovery evidence only** — never imported, restored, copied or derived
   from. A new test is authored from the specification if one is ever authorized.
3. Any new test path requires **its own explicit authority**. The 13-path certified delta does not
   expand to accommodate it.
4. The advisory remains **non-authoritative**. No stage may alter a certified engine result.
5. The ten fences continue to apply in every tree.
6. Live evidence produced under this plan is **new evidence, dated as new work**. It is **never**
   represented as recovered historical evidence (D7-1).

## 6. CLASSIFICATION

# **PLAN RECORDED — NO VALIDATION PERFORMED**

Criteria **H, I and J remain `NOT PERFORMED`** and the Option-D limitation **remains in force and
not self-clearing**. All four execution preconditions are **absent today**. Execution requires
separate authority. **No file, path, test, service or configuration was created by this record.**
