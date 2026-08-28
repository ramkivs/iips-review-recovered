# DEC-D8-HIJ-CONFIG-DEFECT — Defect D-HIJ-CONFIG

- **Record ID:** `DEC-D8-HIJ-CONFIG-DEFECT`
- **Title:** D-HIJ-CONFIG — Incorrect Recorded Reason for the H/I/J Limitation
- **Class:** `DECISION`
- **Status:** `RECORDED — DEFECT CONFIRMED, NOT REMEDIATED`
- **Date:** 2026-08-28
- **Authority relationship:** discovered during read-only discovery at gate
  `D8 — REMAINING GOVERNANCE REFERENCES / OPEN ITEMS DISPOSITION AUTHORITY GATE`; recorded under
  the governance recording authority granted at that gate, scoped to `governance/iips/` on
  `arena`.
- **Scope:** reports one factual defect in `DEC-G-AI-IMPL-CERTIFICATION` §5 and states the
  corrected reason. **Remediates nothing.** Does not amend the certification record. Does not
  change any H/I/J status.
- **Provenance:** `git ls-tree` / `git show` against `85bbd49…`, `f63a9b49…` and
  `origin/phase13-next` in the same turn. No test executed; no server started.
- **Supersession / revision relationship:** none. `DEC-G-AI-IMPL-CERTIFICATION` remains in force
  and **unamended**; this record is a companion correction-of-record, not a supersession.

---

## 1. THE DEFECT

`DEC-G-AI-IMPL-CERTIFICATION` §5 records, verbatim:

> `docker`, `podman`, `docker-compose`, `nerdctl`, `chromium`, `google-chrome` and `firefox` were
> all **NOT FOUND**; nothing answered on `127.0.0.1:8080`; **no compose or IdP configuration is
> tracked in the repository.**

The sentence makes two claims. One is true, one is false.

| Claim | Verdict |
|---|---|
| No container runtime and no browser available; nothing on `:8080` | **TRUE** — re-verified at D8: all 7 binaries `NOT FOUND`, `:8080` → `000` |
| No **compose** configuration tracked | **TRUE** — `git ls-tree -r --name-only <ref> \| grep -ic compose` → **0** at `85bbd49`, `f63a9b49` and `origin/phase13-next` |
| No **IdP** configuration tracked | **FALSE** — **5 Keycloak artifacts are tracked at all three commits** |

## 2. EVIDENCE

`git ls-tree -r --name-only <ref> | grep -i keycloak` returns the same **5** paths at
`85bbd49cd31c215a8fd0e7651b718861944dfe45` (canonical baseline), at
`f63a9b493118643725568a95b86405a5835a30a0` (**the certification commit itself**) and at
`origin/phase13-next` (`357b34dac1bd…`):

| Path | At `f63a9b49` | Nature |
|---|---|---|
| `docs/v3.0/g3-build/keycloak-architecture.md` | yes | documentation |
| `docs/v3.0/g3-build/keycloak-configuration.md` | yes | **configuration** — realm `iips`, client `iips-spa` (public SPA, auth-code + PKCE, redirect `http://localhost:5173`), roles `iips-admin`/`iips-analyst`/`iips-viewer`, 4 test identities |
| `frontend/server/live/keycloak-provision.mjs` | yes, blob `c4e5705812b90423c815735e067211d8e9e75454` | **executable provisioning harness** |
| `frontend/src/core/auth/keycloakAdapter.ts` | yes | implementation |
| `frontend/src/core/auth/keycloakAdapter.test.ts` | yes | test |

Adjacent tracked live-path material at `phase13-next`:

| Path | Blob | Relevance |
|---|---|---|
| `frontend/server/live/real-oidc-verifier.ts` | `4a937ce81c82a3bf114755dedd2dd124310d88d8` | `RealKeycloakVerifier` — real OIDC discovery, real JWKS RS256 verification via WebCrypto |
| `frontend/server/live/admin-live-certification.test.ts` | `c02c19e2d98097df2d280c749b1881b20ed533e8` | `describe.skipIf(!kcUp)` at **line 42** |
| `frontend/server/live/live-tenant-engine.test.ts` | `5dd1eedab0eb2d7da38e1eae7b50e89a0e0afe2c` | `describe.skipIf(!kcUp)` at **line 72** |

The harness targets `process.env.KEYCLOAK_URL || 'http://localhost:8080'` and provisions realm
`iips`, client `iips-spa` (public, `directAccessGrantsEnabled`), the three realm roles, an
audience mapper, a `tenant` user-attribute → access-token-claim mapper, and users `admin-a`,
`analyst-a`, `viewer-a` (tenant-A), `admin-b`, `analyst-b` (tenant-B). It prints
`PROVISION OK: …` on success and exits non-zero on failure.

**The 5 artifacts were present in the tree at the exact commit against which the certification
claim was made.** The claim was therefore incorrect when written, not invalidated later.

## 3. THE CORRECTED REASON

| | As recorded | Correct |
|---|---|---|
| Blocker for **I** (real Keycloak authentication) | no IdP configuration tracked | **IdP configuration and a provisioning harness ARE tracked. No Keycloak *server* is reachable and no container runtime exists to start one** |
| Blocker for **H** (authenticated live 200) | no IdP configured | unchanged and independently sufficient: the dispatch branch returns `401 {"error":"authentication unavailable (no IdP configured)"}` with no executor — unreachable **by construction**, not by test omission |
| Blocker for **J** (live browser rendering) | no browser | **unchanged** — all 3 browsers `NOT FOUND` |

**The correction narrows the blocker; it does not remove it.** The repository supplies
everything except a running IdP and a browser.

## 4. EFFECT ON STATUS — NONE

| Criterion | Status before | Status after this record |
|---|---|---|
| **H** | `NOT PERFORMED` | **`NOT PERFORMED` — unchanged** |
| **I** | `NOT PERFORMED` | **`NOT PERFORMED` — unchanged** |
| **J** | `NOT PERFORMED` | **`NOT PERFORMED` — unchanged** |
| Self-clearing? | No | **No — unchanged** |
| Recorded as PASS? | No | **No** |
| A–F, K, L, M1–M3 | `PASSED` | **`PASSED` — unchanged** |

**No unavailable test is converted to PASS by this record. No limitation is withdrawn.**
Withdrawal still requires H, I and J to be actually performed, under separate authority, and a
further record.

## 5. SECONDARY OBSERVATION (not a defect claim)

`docs/v3.0/g3-build/keycloak-configuration.md` §4 and the `live-tenant-engine.test.ts` tenant
directory each list **4** test identities (`admin-a`, `analyst-a`, `viewer-a`, `analyst-b`), while
`keycloak-provision.mjs` provisions **5** (adding `admin-b`). The harness's own header comment
also omits `admin-b`. Nothing observed depends on `admin-b`. Recorded as an **observation only** —
no platform defect is asserted, and no document is amended.

## 6. WHY NOT REMEDIATED

Amending `DEC-G-AI-IMPL-CERTIFICATION` would modify a **historical decision record**. The
authority granted at D8 was scoped to **writing `DEC-D8-*` records**. Silent correction of a
prior record is precisely the behaviour this programme forbids, so the defect is **reported
exactly and left in place**.

**To remediate:** separate authority to amend `DEC-G-AI-IMPL-CERTIFICATION` §5, replacing
*"no compose or IdP configuration is tracked in the repository"* with the corrected reason in §3
above, preserving the original text for history in the established strikethrough-plus-note style.
**This record does not grant that authority and does not perform that amendment.**

## 7. CLASSIFICATION

# **D-HIJ-CONFIG — CONFIRMED, REPORTED, NOT REMEDIATED**

H, I and J remain **NOT PERFORMED** and **not self-clearing**. No certification status changed.
