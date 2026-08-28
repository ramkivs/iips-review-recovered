# DEC-D13-HIJ-EXECUTION-AUTHORITY — H/I/J Execution Authority: Dormant

- **Record ID:** `DEC-D13-HIJ-EXECUTION-AUTHORITY`
- **Title:** D13 — H/I/J Execution Authority Determination, Six-Way Precondition Distinction, and Authority Separation
- **Class:** `DECISION`
- **Status:** `RECORDED — §2 = A (KEEP DORMANT). NO EXECUTION AUTHORITY GRANTED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D13 — H/I/J EXECUTION-AUTHORITY GATE`. The maintainer was
  presented with options A / B / C / D and selected **A — keep H/I/J dormant**. Durable
  recording authority was granted separately and explicitly, scoped to
  `governance/iips/DEC-D13-HIJ-EXECUTION-AUTHORITY.md` on `arena` only. **No execution,
  preparation, certification, matrix or product-branch authority was granted or inferred.**
- **Scope:** determination of H/I/J execution authority, an explicit six-way precondition
  distinction, an explicit authority separation, and identification of the single next gate.
  **No live validation, no environment preparation, no test execution, no evidence creation, no
  certification change, no matrix change, no engine or implementation change, no release or tag
  change, no Tier-3 activity, no P7 reopening.**
- **Provenance:** read-only discovery against `origin` in the same turn. Every premise was
  re-measured; every feasibility claim carries the probe that produced it. **Nothing was
  installed, downloaded, started or executed.**
- **Supersession / revision relationship:** amends nothing. Confirms and carries forward
  `DEC-D8-HIJ-VALIDATION-PLAN` (unexecuted) and the Option-D limitation recorded in
  `DEC-G-AI-IMPL-CERTIFICATION` §5. Adds a new verified finding on **obtainability**, which
  extends rather than contradicts the D8 finding on **availability**.

---

## 1. SELECTION

| Section | Question | Selected |
|---|---|---|
| **§2** | What authority for H/I/J | **A — keep H/I/J dormant** |
| **§5** | Durable recording authority | **GRANTED** — this record, on `arena` only |

Options **B** (execution preparation), **C** (conditional live validation) and **D** (defer) were
presented and **not** selected.

---

## 2. PRECHECK STATE

**No re-provision this turn.** `git ls-remote origin` → **8 refs**, identical to the D12
end-state: `arena` `be463b7ef110a048c4fa51bbf813d1580b985558` · `phase13-next`
`357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` · `main` `c65d533…` · `gai-impl-canonical`
`f63a9b49…` · `phase13-hardening-delivery` `254e4723…` · tag pair `a975b0dc…` / `7325aeda…`.
`governance/iips/` = **39 records** before this commit. Matrix =
`cada0451400409b0fe9ff0d62309b756c7b45e43`.

---

## 3. §1 — ALL TEN PREMISES VERIFIED THIS TURN

| # | Premise | Verified result |
|---|---|---|
| 1 | H/I/J remain `NOT PERFORMED` | **CONFIRMED** — parsed from durable `DEC-G-AI-IMPL-CERTIFICATION`: `H → NOT PERFORMED`, `I → NOT PERFORMED`, `J → NOT PERFORMED` |
| 2 | No H/I/J result is PASS | **CONFIRMED** — the PASS set parses to exactly `A B C D E F G K L M1 M2 M3`; **H, I and J are absent** |
| 3 | Limitation is not self-clearing | **CONFIRMED** |
| 4 | The D8 validation plan exists and is unexecuted | **CONFIRMED** — blob `083d225dc343404e617d9b0079a532057b292d28`, status `PLAN ONLY. NO VALIDATION PERFORMED. EXECUTION NOT AUTHORIZED` |
| 5 | `keycloak-provision.mjs` and tracked OIDC/IdP configuration exist | **CONFIRMED** — harness blob `c4e5705812b90423c815735e067211d8e9e75454`; 9 documents in `docs/v3.0/g3-build/` including `keycloak-configuration.md`; `keycloakAdapter.ts`; `real-oidc-verifier.ts` `4a937ce81c82a3bf114755dedd2dd124310d88d8` |
| 6 | Working `skipIf` exemplars exist | **CONFIRMED** — `admin-live-certification.test.ts:42` and `live-tenant-engine.test.ts:72`, both `describe.skipIf(!kcUp)` |
| 7 | No container runtime | **CONFIRMED** — `docker`, `podman`, `podman-remote`, `docker-compose`, `nerdctl` all `NOT FOUND`; no `/dev/kvm`, no `/var/run/docker.sock`, no `/run/containerd` |
| 8 | No reachable Keycloak | **CONFIRMED** |
| 9 | No browser execution environment | **CONFIRMED** — `chromium`, `chromium-browser`, `google-chrome`, `firefox` all `NOT FOUND` |
| 10 | `:8080` unreachable | **CONFIRMED** — `000` |

**No live validation has been performed. None is performed by this record.**

---

## 4. NEW VERIFIED FINDING — THE PRECONDITIONS ARE **UNOBTAINABLE**, NOT MERELY ABSENT

D8 recorded preconditions P-1…P-4 as **absent**. This gate probed whether they could be
**obtained** in this environment. They cannot. Every route was tested read-only; **nothing was
installed or downloaded.**

| Route attempted (read-only probe) | Result | Blocks |
|---|---|---|
| Container runtime present | none | **I**, **H** |
| Native Keycloak (it is a Java application) | `java` **NOT FOUND**, `javac` **NOT FOUND**, `/usr/lib/jvm` absent | **I**, **H** |
| Install a JRE via the system package manager | `deb.debian.org` → **`000`**; `apt-get update` → *"List directory /var/lib/apt/lists/partial is missing. - Acquire (13: Permission denied)"* — **apt is unusable; the process is not root** | **I**, **H** |
| Download a browser binary | `cdn.playwright.dev` → **`000`** · `playwright.azureedge.net` → **`000`** · `storage.googleapis.com` → **`000`** | **J** |
| Browser shared libraries already present | `libnss3.so` **0** · `libatk-1.0.so.0` **0** · `libgbm.so.1` **0** · `libasound.so.2` **0**; and apt is unusable | **J** |
| npm registry reachable | **`200`** | — the only working route |

### 4.1 The one working route does not unblock H

`npm install`, a build, and starting the application server are plausibly achievable because the
npm registry is reachable. **That satisfies precondition 4 only.** It does **not** produce an
authenticated endpoint: per `DEC-D8-HIJ-VALIDATION-PLAN` §3's hard constraint, carried from
certification, the advisory dispatch returns
`401 {"error":"authentication unavailable (no IdP configured)"}` whenever `getReadExecutor()`
yields no executor. **An application server without a real IdP cannot produce an authenticated
200, regardless of test quality.**

### 4.2 A second, independent obstacle

The sandbox has re-provisioned **9 times** during this programme, each time destroying everything
outside the repository. **Anything installed would be destroyed at the next wipe**, so even a
successful preparation could not be made durable. This is the same condition that produced
`DEC-D6-DURABLE-RECORDING-POLICY`.

### 4.3 Bearing on the unselected options

| Option | Feasibility, as verified |
|---|---|
| **B** — execution preparation | **Not achievable.** Nothing to install, nothing to download, no working package manager, no durability |
| **C** — conditional live validation | **Could never fire here.** The preconditions cannot be satisfied in this environment |

Stating this is a fact about the environment, **not** a recommendation. The maintainer selected
**A** independently.

---

## 5. §3 — THE SIX PRECONDITIONS, DISTINGUISHED AND SEPARATELY VERIFIED

| # | Precondition | Status at this gate | Evidence |
|---|---|---|---|
| **1** | Environment / runtime availability | **ABSENT — UNOBTAINABLE** | no container runtime, no JVM, apt unusable, Debian mirror unreachable |
| **2** | Keycloak/IdP reachability and provisioning | **ABSENT** | configuration and harness are **tracked but have never been run**; `:8080` → `000`; no server is obtainable |
| **3** | Browser availability | **ABSENT — UNOBTAINABLE** | no binary, three download CDNs unreachable, four required shared libraries absent |
| **4** | Application availability on the required endpoint | **NOT ESTABLISHED** *(potentially achievable)* | npm registry `200`; but yields **no** authenticated endpoint without (2) |
| **5** | Test / evidence execution | **NOT PERFORMED** | no test executed, no server started, no evidence produced |
| **6** | Certification or matrix amendment | **NOT AUTHORIZED — NOT PERFORMED** | matrix `cada04514004…` unchanged; no certification record changed |

### 5.1 The distinction this gate exists to preserve

**The availability of configuration files or of a provisioning harness is NOT evidence that live
validation has occurred.** They are **configuration and tooling**. Treating them as evidence is
precisely the error recorded as `D-HIJ-CONFIG`, corrected at D9 and closed at D11.

The six preconditions are **independent and cumulative**. Satisfying any one — including the one
that is achievable, (4) — does **not** satisfy any other, and does **not** produce evidence for
H, I or J.

---

## 6. §2 = A — DECISION: H/I/J REMAIN DORMANT

| Property | Value |
|---|---|
| Execution authority | **NOT GRANTED** |
| Preparation authority | **NOT GRANTED** |
| H, I, J status | **`NOT PERFORMED` — unchanged** |
| Any PASS determination | **NONE — unchanged** |
| Option-D limitation | **STANDS — not withdrawn, not self-clearing** |
| `DEC-D8-HIJ-VALIDATION-PLAN` | **PRESERVED and unexecuted** |
| Revisit condition | Only when runtime infrastructure **exists** — and, per §4, it is not obtainable in this environment |

**No PASS claim is created, implied or enabled by this record. No unavailable test is converted
to PASS.** If the infrastructure ever becomes available, H, I and J must be **performed** and the
limitation withdrawn **by a further record** under its own authority — exactly as
`DEC-G-AI-IMPL-CERTIFICATION` §5 and `DEC-D8-HIJ-VALIDATION-PLAN` Stage 4 already require.

---

## 7. §4 — AUTHORITY SEPARATION

Stated separately and explicitly. **Nothing below is authorized by this gate.**

| Authority | Granted by D13? |
|---|---|
| Environment preparation | **NO** |
| Live test execution | **NO** |
| Evidence-artifact creation | **NO** |
| Independent or simulated verification | **NO** |
| Certification-result change | **NO** |
| Matrix amendment | **NO** |

**No authority not explicitly granted has been inferred** — not from configured credentials, not
from write capability, not from technical convenience, and not from any prior GO. The only
authority exercised at this gate is the **separately granted** authority to write this record.

---

## 8. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| H / I / J remain `NOT PERFORMED` | **PRESERVED** |
| PASS set remains `A B C D E F G K L M1 M2 M3` | **PRESERVED — H, I, J absent** |
| Option-D limitation not self-clearing | **PRESERVED** |
| `DEC-D8-HIJ-VALIDATION-PLAN` unexecuted | **PRESERVED** |
| Recovered live-certification test (`2bcaac3329de`) | **RECOVERY EVIDENCE ONLY — not imported, restored, copied or derived from** |
| Matrix `cada04514004…` and `phase13-next` | **UNTOUCHED — no product-branch mutation** |
| Engines, implementation, certification records, releases, tags | **UNTOUCHED** |
| Tier 3 · P7 | **NO activity · NOT reopened** |
| All dated `DEC-*` records | **UNTOUCHED** |
| Root `README.md` fence `0d759fbdd751…` | **UNTOUCHED** |

---

## 9. §6 — THE SINGLE NEXT GATE

Identified from the resulting state. **Not pre-authorized and not executed by this record.**

### 9.1 Resulting state

Every named standing-governance defect is **closed**: `D-HIJ-CONFIG` (D11), `D-AUTH-11PATH`
(D10), `D-README-STALE` (D9/D11), `D-CLASS-DUAL` (D12). Two items remain **dormant**, and they
differ in the **nature of their blocker**:

| Dormant item | Blocked by | Can a decision unblock it here? |
|---|---|---|
| **H/I/J execution** | **Environment** — verified unobtainable (§4) | **NO** |
| **Tier-3 A1 pathway** | **Decision** | **YES** |

### 9.2 Therefore the single next gate is

# **`D14 — TIER-3 A1 PREREQUISITE-RESOLUTION GATE`**

It is the only remaining item whose blocker is a **decision** rather than an **environment**, and
so the only one that can progress.

**What it would have to resolve** (recorded here for continuity, **not** pre-authorized):

1. whether any future Tier-3 independent verification is acceptable when it must be labelled
   **`SIMULATED`** — `D7-TIER3-INDEPENDENCE` is resolved as a **negative**: no genuinely
   independent verifier exists;
2. whether Tier 3 (IES-016, IES-017, IES-020) reaches A1 by a **documentation programme** (the
   19-document engineering set plus architecture review held by each A1 engine) or by an
   **explicit methodology redefinition affecting all 14 capabilities** — `D7-TIER3-PARITY`;
3. and subject throughout to **D7-3 = A**, which **forbids** a Tier-3 exception to the A1
   definition.

**This record pre-authorizes nothing in D14.** It does not select an outcome, does not create
evidence, does not engage or invent a verifier, and does not change any capability class or
maturity. All 14 capabilities remain **Class A**, **7 A1 / 7 A2**.

### 9.3 Items that are **not** the next gate

- **H/I/J execution** — cannot be the next gate; its blocker is environmental and verified
  unobtainable. It remains dormant until the infrastructure exists.
- **P7** — closed as no-referent at D8; never PASS; not reopened and not proposed.
- **Sandbox volatility** — an environmental condition, not a governance item; `D6` is its
  standing mitigation.

---

## 10. WHAT THIS RECORD DOES NOT DO

No live H/I/J validation · no environment preparation · no package, runtime or browser installed
or downloaded · no server started · no test executed · no `keycloak-provision.mjs` invocation · no
evidence artifact created · no independent or simulated verification performed or authored · no
verifier engaged or invented · no PASS determination · no certification-result change · no
limitation withdrawn · no matrix amendment · no product-branch mutation · no engine or
implementation change · no change to the authorized path set · no release, version or tag change ·
no Tier-3 activity and no A2 → A1 transition · no Class A capability status change · no P7
reopening and no P7 status claim · no import, restoration or derivation from recovered evidence ·
no D5-S1 threshold change · no amendment of any existing record · no branch merged, rebased,
created, moved or deleted · no ref other than `arena` moved · no force-push.

## 11. CLASSIFICATION

# **D13 RECORDED — §2 = A · H/I/J DORMANT · NO EXECUTION AUTHORITY**

All ten premises confirmed. New verified finding: the preconditions are **unobtainable** in this
environment, not merely absent — no JVM, no container runtime, apt unusable, three browser CDNs
unreachable, four required shared libraries absent. The six preconditions are recorded as
**independent and cumulative**, and the one achievable route (application availability) **does
not** unblock H. **H, I and J remain `NOT PERFORMED`; no PASS; the limitation stands and is not
self-clearing.** No execution, preparation, evidence, verification, certification or matrix
authority is granted or inferred. Next gate identified as
**`D14 — TIER-3 A1 PREREQUISITE-RESOLUTION GATE`** and **not** pre-authorized. `phase13-next`
and the matrix are **unchanged**. All 14 capabilities remain **Class A**, **7 A1 / 7 A2**.
**STOP after recording — no further authority is held or inferred.**
