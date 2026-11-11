# Dhan Live Integration — Implementation Roadmap and Dependency Plan

**Document ID:** `DHAN-LIVE-ROADMAP-2026-11-11`
**Revision:** v1.1 — corrected and finalised (see Appendix B, revision history)
**Date:** 2026-11-11
**Type:** Planning and technical analysis only. **No source code, configuration, test, launcher script, local database or runtime data was modified. No live Dhan call was made and no credential was requested, generated or used.**
**Baseline:** `docs/integration/DHAN-LIVE-MARKET-DATA-CURRENT-STATE-INVESTIGATION-2026-11-11.md` (IRR `9e957ad`, IPD `main` `a624d06`, consumed pin `1aee57f`).
**Operating model:** personal, single-user, local Windows application. No multi-user, tenancy, cloud or enterprise infrastructure is introduced.

**Scale of this roadmap:** **9 phases** (Phase 0 through Phase 8), **7 decision records** (D-1…D-7), **38 work items** (W-01…W-15, W-17…W-39; the identifier W-16 was never allocated), **8 milestones** (M1, M2a, M2, M3a, M3, M4, M5, M6).

---

## 1. Executive summary and current readiness assessment

The Dhan integration is **architecturally complete and operationally blocked**. Every layer required for live market data exists and is exercised: canonical contracts, provider-neutral SPI, exact-identity instrument mapping, vendor client, normalization, cache, rate limiting, freshness evaluation, an authenticated loopback transport, and five working IRR screens. One link is deliberately unconnected: **IPD's only credential resolver is bound to a backend that reports `liveResolutionSupported: false`**.

The consequence is precise and important: **valid Dhan credentials will not enable live operation.** Every quote and historical request resolves to `CREDENTIALS_UNAVAILABLE` before a socket is opened. Credentials are *necessary but not sufficient*; four code changes, two decisions and one operator procedure stand between the current state and the first live quote.

A second point deserves emphasis up front, because it is the most common way this integration will be misread: **a successful authentication is not a working Quotes capability.** This roadmap therefore separates *first live authentication* (M1), *first live quote response* (M2a) and *first qualified live quote* (M2), and keeps live vendor qualification a distinct acceptance gate (§8, §10).

| Capability | State | Blocking dependency |
|---|---|---|
| **Status** | Implemented + verified, but **cannot express a live provider** | Live-capable `ServiceHealth` (W-07) + IPD-authoritative readiness (W-10) |
| **Quotes** | All upstream stages implemented and synthetically verified; **end-to-end blocked** | Credential resolution (W-01…W-04) |
| **History** | Adapter + D02 normalization implemented and synthetically verified; **blocked**; vendor wire shape PROVISIONAL | Credential resolution, then wire qualification (W-17) |
| **Freshness (D01)** | Implemented + verified; read-only and correct | Nothing to unblock; needs session awareness + persistence for operational quality |
| **Freshness (D02)** | **Not implemented** — composed service never wires the historical cache | W-19 |
| **Instrument mapping** | Implemented + verified; **coverage 48 companies / 96 rows** | Expansion + measurement (W-27, W-28) |
| **Consumers** | Only the five Dhan screens consume market data | Track 2 (W-29 → W-35, W-39) |

### 1.1 Status classification (no synthetic result is described as live qualification)

**Implemented and verified** (reproduced at runtime or in executed tests during the investigation): canonical contracts and SPI; daemon startup/shutdown/loopback/token/production-refusal invariants; the authenticated Layer-B HTTP surface; exact-identity resolution and its failure modes; the 1,825-day request guard; P7 load of 96 mappings; read-only freshness semantics; 160 IPD Dhan test cases passing.

**Implemented, synthetically verified only:** quote parse/normalize; historical parse/normalize; cache, rate limit, concurrency, coalescing, bounded retry; credential expiry/revocation/version handling; all five IRR Dhan screens (tests not executed in this environment).

**Partially implemented:** Status diagnostics (no last-success time, no last provider failure reason, no latency over HTTP); D02 freshness; transport-layer provider neutrality (payloads neutral, daemon composition Dhan-specific); IRR quote identity entry (manual).

**Not implemented:** Windows secret-store backend; backend selection; token acquisition/renewal; configurable freshness thresholds; market-session awareness; cache/freshness persistence; trace correlation; IRR bundle-leak gate; daemon integration in the existing Windows launcher; mapping expansion pipeline; every consumer integration.

**Blocked by technical dependency:** live quotes and history (disabled resolver); live provider qualification (no live harness, and `providerQualification` is a hard-coded literal with no path to any other value).

**Unresolved (evidence required, not assumed):** every Dhan vendor-side fact — payload shapes, `last_trade_time` format, `net_change` presence, historical depth/adjustment/earliest date, rate-limit headers; whether the 96 `dhanSecurityId` values remain live; whether IRR's suite passes in this environment. Two further unresolved points arising from this revision are recorded in Appendix C.

---

## 2. Confirmed technical blockers

Only blockers established from repository evidence. Each is a **technical** dependency; governance approval is settled and is not reopened.

| # | Blocker | Repo | Evidence | Unblocked by |
|---|---|---|---|---|
| B-1 | No concrete `LocalHostVaultSecretBackend` exists. `DisabledWindowsHostVaultBackend` reports `liveResolutionSupported: false` and `readSecret()` returns `null`. | IPD | `src/providers/dhan/dhan_local_vault_resolver.ts` | W-02 |
| B-2 | The daemon gates vendor egress on `liveResolutionSupported && configOk`; otherwise it substitutes `PreAccessNoNetworkTransport`. | IPD | `dhan_local_daemon.ts` transport selection | W-02 (indirect) |
| B-3 | No way to select a vault backend at runtime — only a programmatic `options.vaultBackend` seam; no env var, no config file. | IPD | `StartMarketDataDaemonOptions` | W-03 |
| B-4 | `SecretRef.vaultProvider` has no Windows member (`LOCAL_MOCK_VAULT`, `AWS_SECRETS_MANAGER`, `HASHICORP_VAULT`, `AZURE_KEY_VAULT`, `TEST_ENCLAVE`). | IPD | `src/security/secret_ref.ts` | W-01 |
| B-5 | `ServiceHealth.liveProviderConnectivity` and `.providerQualification` are **literal types**; IRR needs `CONNECTED_LIVE`/`LIVE_QUALIFIED`; and `MarketDataTransportClient.health()` *rejects* those values as `MALFORMED_RESPONSE`. Two independent locks. | IPD + IRR | `dhan_market_data_service.ts:61-70`; `dhan_market_data_http.ts:627-628`; IRR `dhanHealthState.ts` | W-07, W-10 |
| B-6 | IRR's Status screen derives readiness from **IRR's own `IIPS_DHAN_*` environment**, not from IPD — two sources of truth. | IRR | `dhanHealthTransport.ts` → `describeDhanProviderReadiness(env)` | W-10 |
| B-7 | No token acquisition or renewal path exists anywhere (only `/marketfeed/quote` and `/charts/historical`). Dhan's 24-hour token is a manual operator concern. | IPD | no `/token` call in either repo | D-6 (manual, documented) |
| B-8 | D02 freshness is structurally empty: `getHistorical` calls the adapter directly, bypassing `DhanHistoricalCache` and the refresh orchestrator. | IPD | `dhan_market_data_service.ts` `getHistorical`, `getFreshness` | W-19 |
| B-9 | Freshness has **no market-session awareness**; the 900 s D01 threshold applies 24/7. | IPD | `src/quality/freshness_evaluator.ts` | W-22 |
| B-10 | Absent order-book depth is normalized to `bid = ask = 0`, which passes canonical validation and is indistinguishable from real zeros. | IPD | `dhan_normalizer.ts` `topOfBook`; `d01_quotes.ts` | W-13 |
| B-11 | Configuration surface is inconsistent: two base-URL names (`IIPS_MARKET_DATA_TRANSPORT_URL` for identity, `IIPS_MARKET_DATA_BASE_URL` for quotes/history/health/freshness, the latter undocumented); `.env.example` example port `8790` ≠ daemon default `8791` (8790 is IRR's own port). | IRR | `.env.example:67`; `dhanMarketDataTransport.ts:48`; `marketDataTransportConfig.ts:19` | W-11 |
| B-12 | The existing Windows launcher does **not** manage the daemon: `03-Start-IipsServers.ps1` starts `ipd-ipc`, `irr-transport`, `irr-frontend`, `ipd-shell` and nothing else; the recorded port plan has no entry for 8791. See §7.1 for the inspected evidence. | IPD | `windows-setup/03-Start-IipsServers.ps1:283,317,338,364`; `MANIFEST.txt` | W-36 |
| B-13 | No trace correlation, no persistent log, no last-success/latency diagnostics over HTTP. | IPD + IRR | console/stderr only; `ProviderHealth` unrouted | W-09, W-24 |
| B-14 | Mapping coverage is 48 companies / 96 rows out of 23,764 equity candidates, bounded by P04 population (23,644 rejected for no P04 correspondence). | IPD | `evidence/dhan-p7/` | W-27 |
| B-15 | Existing diagnostics **do** publish secret-reference key paths (`describeDhanConfig` renders `accessTokenKeyPath`/`clientIdKeyPath`; IRR's health report carries `secretRefPointers`). Under the disclosure policy in D-7 this is too much. | IPD + IRR | `dhan_config.ts` `describeDhanConfig`; IRR `dhanHealthTransport.ts` `secretRefPointersOf` | W-03, W-09, W-10 |

---

## 3. Existing capabilities that must be retained

These are working and should not be redesigned. The roadmap adds to them.

1. **Canonical contracts** — `CanonicalEnvelope<T>`, `MarketQuotePayload` (D01), `OHLCVCandle` (D02), `DataProvenanceDTO`. Single definition, no duplicates in IRR.
2. **Provider-neutral SPI and route** — `MarketDataSource<T>`, `ProviderMarketDataRoute`, `deriveMarketDataState`, `MarketDataDTO`.
3. **Exact-identity mapping governance** — `DhanInstrumentRegistry` security-level keys, conflict detection, provenance tags, qualified-only loading, no runtime download, no identifier synthesis.
4. **Fail-closed normalization** — `previousClose` from `net_change` only; non-finite guards; per-candle D02 validation; batch-fail on duplicate/out-of-order; empty-series-is-valid.
5. **Single-owner freshness evaluation** — `evaluateFreshness` with GOOD / STALE (concession) / UNAVAILABLE (suppressed); `cache.peek()` read-only status.
6. **Operational controls** — bounded LRU cache keyed at security level with freshness from `provenance.asOf`, token-bucket limiter, concurrency limiter, request coalescer, transient-only bounded retry, prior-observation preservation.
7. **Two-layer transport separation** — vendor egress withheld from the published package; loopback-only Layer B with constant-time bearer compare; `DhanServerHttpsTransport` hardening (HTTPS-only, origin-pinned, TLS-intact, `redirect: 'error'`).
8. **Zero-plaintext discipline** — per-request credential material, no instance storage, no logging, no error reflection, `SecretScanner` gate.
9. **IRR presentation neutrality** — `noAuthFetch`, conservative freshness mapping (`CURRENT`→`SNAPSHOT`, never `LIVE`), explicit not-attempted-vs-disconnected distinction, no IRR-side cache or normalizer.
10. **The existing Windows launcher pattern** — `Start-IipsService` with per-service environment injection, log directory, and a "never kills a process it did not start" invariant. W-36 extends this; it does not replace it.
11. **The executed test corpus** — 160 IPD Dhan cases (verified passing) and ~263 IRR declarations (not executed here) encode most of the above.

---

## 4. Dependency-ordered implementation phases

**Nine phases** (Phase 0 through Phase 8). Phase 0 is decision-only and costs nothing but unblocks everything.

| Phase | Theme | Track | Gate to leave the phase |
|---|---|---|---|
| 0 | Decisions (no code) | Shared | D-1…D-7 recorded; two blocking items acceptance-signed before Phase 1 starts |
| 1 | Credential resolution unblock | 1 | **M1** first live authentication |
| 2 | Status truth | 1 | Status reports observed provider state (M4 ingredient) |
| 3 | Live quotes qualification | 1 | **M2a** first live quote response, then **M2** first qualified live quote |
| 4 | Historical qualification | 1 | **M3a** first live historical response, then **M3** first qualified historical response |
| 5 | Freshness and diagnostics completion | Shared | **M4** all four capabilities operational |
| 6 | Consumer adoption foundation | 2 | **M5** measured coverage + one shared quote-consumption boundary |
| 7 | Consumer integrations | 2 | **M6** consumers adopted, each with agreed exclusions |
| 8 | Windows operational readiness | Shared | Owner can configure, start, verify, recover and restart |

Sequencing rules that fall out of the dependencies:

* Phase 1 is the **only** phase that gates first live data. Phases 2, 5 (most of it), 6 and 8 can be developed **in parallel** with Phase 1 because they need no Dhan credentials.
* Phase 3 and Phase 4 are independent of each other and of Phase 2; both need Phase 1 first.
* **Phase 6 does not need Phase 4.** The mapping pipeline (W-27) needs no live evidence at all, and the shared consumption boundary (W-29) is quote-only. Historical consumption is a separate extension (W-39) gated on Phase 4 and D-4.
* Phase 7 items are individually optional and independently deliverable; none blocks a Dhan menu capability.
* Phase 8's launcher work (W-36) depends only on agreed configuration names (W-11) and the backend selector (W-03), not on any credential work.

---

## 5. Track 1 — Dhan capability readiness

Work items required to make Status, Quotes, History and Freshness work reliably.

### Phase 0 — Decisions

#### D-1 · Select the Windows secret-store mechanism, admit its `SecretRef` provider, and fix the carrier specification
| Field | Content |
|---|---|
| Objective | Choose the concrete store and specify it precisely enough that W-02 and W-04 have no open design questions |
| Repository owner | IPD (decision record), owner (acceptance) |
| Prerequisites | None |
| Scope | **Store choice.** Recommended: **Windows DPAPI, user scope**, storing each secret in a carrier file under a local runtime directory outside Git. Alternative: Windows Credential Manager (requires a PowerShell module). Rejected: a Node native DPAPI addon (new binary dependency). **Two separate carriers, never one blob:** `dhan-client-id` and `dhan-access-token` are distinct secrets with distinct lifecycles (the client id is stable, the token is 24-hour) and must be independently rotatable and independently diagnosable. **Access restriction.** The carrier directory is owner-only: inheritance disabled and an explicit DACL granting the owner and SYSTEM and nothing else; a carrier readable by another principal is treated as unusable. **Carrier format.** A versioned envelope with `schemaVersion`, `secretId`, `vaultProvider`, `version`, `createdAtUtc`, `rotatedAtUtc`, `expiresAtUtc` (token only), and the DPAPI-protected ciphertext blob; any unknown `schemaVersion` is refused rather than guessed. **Atomicity.** Rotation writes a new carrier beside the old, verifies it by read-back, and only then replaces it; an interrupted rotation must leave either the previous valid carrier or a clearly invalid one that fails closed — never a half-written carrier that reads as success. **Threat model, stated explicitly:** DPAPI user scope protects the secret **at rest** against other users, offline disk inspection and file copying. It does **not** protect against another process running as the same Windows user, and the design must not claim otherwise. **Provider admission.** Name the new `VaultProvider` member and the `vault://` key-path convention for both secrets. Covers B-1, B-4 |
| Verification | Decision record names: store, carrier paths, DACL requirement, envelope schema, atomicity rule, the admitted provider member, both key paths, and the explicit at-rest-only limitation |
| Exit criteria | W-02 and W-04 have no remaining design question; schema is written down |
| Enables | W-01, W-02, W-04 |
| Priority | **Critical** |

#### D-2 · Decide credential-read posture and the bounded re-read policy
| Field | Content |
|---|---|
| Objective | Resolve the conflict between per-request resolution and the cost of a Windows vault read, and fix exactly when credentials may be re-read |
| Repository owner | IPD |
| Prerequisites | D-1 |
| Scope | A DPAPI read costs a process spawn (~200–500 ms), which is unacceptable per quote. **Posture.** Resolve at daemon start after config validation; hold the material only in IPD process memory; clear on shutdown. **Permitted re-read triggers (exhaustive):** (a) daemon start; (b) crossing the token `expiresAt` boundary; (c) exactly **one** bounded re-read following an HTTP 401/403 on a request; (d) explicit operator restart. **Prohibited:** re-read on any other event; any loop; any re-read keyed on a transient failure code. **Expired vs invalid.** `CREDENTIALS_EXPIRED` is a *local, pre-flight* determination (known expiry or REVOKED/EXPIRED status) and results in **no vendor call**. `AUTHENTICATION_FAILURE` is a *vendor* determination (401/403) and implies the material is present but not accepted. **After the single re-read.** If the replacement material is also rejected, the daemon latches a failed-auth state, performs **no further re-reads**, stops attempting to recover automatically, and surfaces the condition per D-7; only operator intervention (re-provision plus restart) clears it. **Rationale to record:** retrying the same expired token can never recover authentication, so no retry budget is allocated to auth codes. Covers the AD-17 tension implemented by W-05 |
| Verification | Decision record states the initial resolution point, the four permitted triggers, the prohibited cases, the expired-vs-invalid distinction, the latch behaviour, and the operator-intervention boundary |
| Exit criteria | W-05 scope is unambiguous; no unbounded path remains |
| Enables | W-02, W-05 |
| Priority | **Critical** |

#### D-3 · Decide freshness semantics for market-closed periods
| Field | Content |
|---|---|
| Objective | Stop out-of-market data being reported stale |
| Repository owner | IPD |
| Prerequisites | None |
| Scope | Decision only: trading-session model (NSE/BSE 09:15–15:30 IST), weekend/holiday source (a governed local calendar file is the low-cost option), and the rule for ageing the last close once the session ends. Covers B-9 |
| Verification | Decision record states the calendar source of truth and the exact ageing rule, including the first session after a holiday |
| Exit criteria | Rule recorded with worked examples |
| Enables | W-22 |
| Priority | **High** |

#### D-4 · Decide D02 (Dhan) vs D114/PIT historical precedence
| Field | Content |
|---|---|
| Objective | Prevent two historical authorities from coexisting silently |
| Repository owner | IPD + IRR |
| Prerequisites | None |
| Scope | Decision only: which source answers "what was the price history for instrument X", under what conditions the other may be used, and that no consumer may blend them without labelling provenance |
| Verification | Decision record names the authoritative source per use case (charting/valuation/backtest) and forbids silent fallback |
| Exit criteria | Precedence table recorded and accepted |
| Enables | W-20, W-39, W-32, W-33 |
| Priority | **High** |

#### D-5 · Decide the canonical representation of unavailable bid/ask
| Field | Content |
|---|---|
| Objective | Make "no order-book depth" distinguishable from "a real zero" |
| Repository owner | IPD |
| Prerequisites | None |
| Scope | Decision only, with two candidate shapes: (a) make `bid`/`ask` optional in `MarketQuotePayload` and omit when absent (additive, contract-compatible), or (b) add an explicit `depthAvailable: boolean`. Recommendation: (a) plus a provenance note. Covers B-10 |
| Verification | Decision record states the chosen shape and its effect on `validateMarketQuotePayload` and IRR rendering |
| Exit criteria | Shape recorded |
| Enables | W-13, W-15 |
| Priority | **High** |

#### D-6 · Record the Dhan token issuance and replacement procedure
| Field | Content |
|---|---|
| Objective | Make the 24-hour token lifecycle explicit and reproducible by the owner |
| Repository owner | Operator (procedure) + IPD (docs) |
| Prerequisites | None (uses the owner's Dhan account out-of-band) |
| Scope | Procedure only: how the owner generates an access token in Dhan's own web console, how often, and how it is placed into the store from D-1 using W-04. **Automated token acquisition remains deferred** and is explicitly out of scope unless a separate decision changes it; this roadmap assumes manual replacement for the token's whole 24-hour life |
| Verification | A dry-run of the procedure by the owner, with the token value never written to a document or a log |
| Exit criteria | Procedure documented and rehearsed once with a throwaway value |
| Enables | W-06; all live qualification |
| Priority | **Critical** |

#### D-7 · Define the provider state model, the meaning of "verify connection", and the diagnostics disclosure policy
| Field | Content |
|---|---|
| Objective | Fix the vocabulary before changing the contract, and fix once what diagnostics may and may not say |
| Repository owner | IPD + IRR |
| Prerequisites | None |
| Scope | **States.** `UNCONFIGURED` → `CONFIGURED` → `CREDENTIALS_RESOLVED` → `AUTHENTICATED` → `OPERATIONAL`, plus `EXPIRED`, `DEGRADED`, `UNAVAILABLE`. **Rule.** Status **reads the last observed state** and never calls the vendor on screen open; a distinct, operator-initiated **"Verify connection"** action may perform exactly one authenticated probe and record its outcome. **Disclosure policy (normative for startup diagnostics, HTTP health, `/v1/diagnostics`, logs and error handling alike).** MAY expose: backend identifier; backend readiness (supported/not supported); credential-resolution outcome as an enumerated code; provider connectivity and qualification state; last successful interaction timestamp; last failure *category*; latency; request counters; mapping count. MUST NOT expose: secret values or tokens in any form or prefix; `vault://` references; carrier-file paths or directories; any secret-store metadata from which a local sensitive location can be derived; raw child-process output that could contain credential material. This supersedes the current behaviour where `describeDhanConfig` renders key paths and IRR publishes `secretRefPointers` (B-15). Covers B-5, B-6, B-15 |
| Verification | State model documented with, for each state, the exact evidence that justifies it and the transition that leaves it; disclosure policy written as two explicit lists with the superseded behaviours named |
| Exit criteria | Model and disclosure policy accepted by both repos; W-03, W-09 and W-10 can be implemented without further judgement calls |
| Enables | W-03, W-07, W-08, W-09, W-10 |
| Priority | **High** |

---

### Phase 1 — Credential resolution unblock (critical path to M1)

#### W-01 · Admit a Windows `VaultProvider` and define the secret-path convention
| Field | Content |
|---|---|
| Objective | Make a DPAPI-backed `SecretRef` a first-class, validated value |
| Repository owner | IPD |
| Prerequisites | D-1 |
| Scope | Add one member to the `VaultProvider` union and its validation array in `src/security/secret_ref.ts`; extend the P03 test's accepted-provider set; implement the two-key-path convention from D-1 (one path per secret, never one path for both). Purely additive: no existing switch is exhaustive over providers |
| Verification | Targeted: `tests/wsa_p03_secret_ref.test.ts` extended for the new member; `tests/dhan_d1_provider_foundation.test.ts` still green; a ref carrying the new provider validates and an unknown one is still rejected |
| Exit criteria | A `SecretRef` with the Windows provider validates; no behavioural change for existing providers |
| Enables | W-02, W-04 |
| Priority | **Critical** |

#### W-02 · Implement the Windows DPAPI secret-store backend
| Field | Content |
|---|---|
| Objective | Replace the disabled backend with a real, fail-closed one |
| Repository owner | IPD |
| Prerequisites | W-01, D-1, D-2 |
| Scope | New `LocalHostVaultSecretBackend` implementation (e.g. `WindowsDpapiHostVaultBackend`) exporting `backendId`, `describeReadiness()`, `readSecret(ref, asOfUtc)`. **Readiness.** `liveResolutionSupported: true` only when both carriers exist, satisfy the D-1 DACL requirement, parse against a known `schemaVersion`, and the requested one passes a probe read; otherwise `false` with a non-locating prerequisite summary. **Metadata validation.** `secretId`, `vaultProvider`, envelope version against `SecretRef.version` (mismatch → fail closed as a version error), `expiresAtUtc` parsed as ISO-8601 or rejected, and `rotatedAtUtc` sanity. **Distinct, scrubbed outcomes** for: carrier missing, carrier present but unreadable or wrong principal, corrupt or unknown schema, expired, version mismatch, and child-process failure — each a `DhanVaultResolutionError` with its own `reason`, never the underlying message. **In-process handling.** The decrypted value lives in a single short-lived binding, is never copied into a field, log record, diagnostic object or error, and is released as soon as the caller has used it. **Child-process communication.** Data is passed on **stdin** and read from **stdout only**; never on argv, never via a temporary file, never via a shell string that lands in history; the invocation must not echo the value; stderr is captured only to classify failure and is never surfaced verbatim. **Atomicity awareness.** A carrier that fails validation is reported as invalid, not silently repaired. `DisabledWindowsHostVaultBackend` remains the default and is not deleted. Covers B-1 |
| Verification | Targeted, **no Dhan credentials needed**: unit tests with an injected process runner for every failure path above (missing / unreadable / corrupt / wrong-user / expired / version-mismatch / non-zero exit / empty output / stderr-with-material); plus one real Windows round trip using a **generated throwaway secret** proving store→read→compare and proving the value never appears in argv, stdout of the test, any log, or any error |
| Exit criteria | Backend resolves a synthetic secret on Windows; every failure path is distinct and fail-closed; no secret in test output; existing Dhan suites green |
| Enables | W-03, W-04, W-05 |
| Priority | **Critical** |

#### W-03 · Add daemon backend selection and honest egress diagnostics
| Field | Content |
|---|---|
| Objective | Let the operator select the real backend without code edits, and show the selection without revealing locations |
| Repository owner | IPD |
| Prerequisites | W-02, D-7 |
| Scope | An allow-listed selector (e.g. `IIPS_DHAN_VAULT_BACKEND=disabled/windows-dpapi`, default `disabled`) threaded into `startMarketDataDaemon`; unknown values refuse startup. Extend `MarketDataDaemonDiagnostics` and the startup line with backend id, backend readiness, egress mode and credential-readiness code — **and remove the key-path material currently derivable from `describeDhanConfig` output**, per D-7. Covers B-3, B-15 |
| Verification | Targeted: unknown selector refused; `disabled` still yields `vendorEgress=DISABLED_PRE_ACCESS`; `windows-dpapi` with a fake backend yields `IPD_SERVER_HTTPS`; an assertion that the diagnostics object and startup line contain no `vault://` string, no path, and no secret |
| Exit criteria | Operator can switch backends by environment; startup line states which egress is active and reveals no location |
| Enables | W-06, W-36 |
| Priority | **Critical** |

#### W-04 · Credential provisioning and rotation utility
| Field | Content |
|---|---|
| Objective | Give the owner a safe, repeatable, interruption-tolerant way to place and replace credentials |
| Repository owner | IPD |
| Prerequisites | W-01, W-02, D-1 |
| Scope | A local script that accepts a secret **interactively or on stdin** — never argv, never a pipe that lands in history — DPAPI-protects it into the D-1 carrier with the full metadata envelope, then **re-reads it to prove the round trip before replacing anything**, and prints only a non-reversible fingerprint (algorithm tag + truncated digest) plus envelope metadata (version, created/rotated timestamps, expiry) and never the value. Atomic replace per D-1: write-beside, verify, then swap; on any failure the previous carrier remains authoritative. Independent subcommands per secret (client id and access token rotate separately). A `--verify` mode reports presence, readability, DACL conformity, schema validity and expiry **without** revealing content or location. No network, no cloud |
| Verification | Targeted: synthetic round trip; failure-path tests for missing carrier, corrupt carrier, wrong-user carrier, interrupted write (simulate a crash between write and swap, assert the old carrier survives), expired envelope; a grep of script output, transcript and any log for the value |
| Exit criteria | Owner can provision, verify and rotate each secret independently; output never contains a secret, a `vault://` path or a carrier path |
| Enables | W-06 |
| Priority | **Critical** |

#### W-05 · Implement the credential read posture and bounded re-read from D-2
| Field | Content |
|---|---|
| Objective | Make per-quote credential cost acceptable without weakening zero-plaintext discipline and without any unbounded retry path |
| Repository owner | IPD |
| Prerequisites | D-2, W-02 |
| Scope | A session holder inside the resolver: resolve once at start, re-read **only** on the four triggers D-2 permits, hold material in the IPD process only, clear on shutdown. After HTTP 401/403: exactly **one** re-read and one retry with the new material; if that is rejected, latch a failed-auth state, perform no further re-reads, and surface per D-7 until an operator restarts after re-provisioning. Distinguish `CREDENTIALS_EXPIRED` (local pre-flight, no vendor call, no recovery attempt) from `AUTHENTICATION_FAILURE` (vendor rejection). Document the deviation from strict per-request resolution in the module header. **Not a prerequisite for M1** — a bounded initial verification tolerates one vault read per call (§10.2) |
| Verification | Targeted: exactly one re-read on 401/403 and zero on success; a second consecutive 401 performs no third read and latches; expired pre-flight issues no vendor call; no material in any error, log or serialized diagnostic; a latency assertion that repeated quotes do not each pay a vault read |
| Exit criteria | Bounded, proven, and latch-safe; no code path can loop |
| Enables | M4 (operational performance) |
| Priority | **High** |

#### W-06 · Provision real credentials and prove first live authentication
| Field | Content |
|---|---|
| Objective | Convert "blocked by code" into "authenticated" — and nothing more |
| Repository owner | Operator (execution) + IPD (evidence capture) |
| Prerequisites | W-03, W-04, D-6 (W-05 **not** required) |
| Scope | Operator follows D-6 to obtain a Dhan access token and client id, provisions them with W-04, starts the daemon on loopback with the real backend, and issues **one** controlled authenticated request. Record: startup diagnostics line, selector and backend readiness, credential-resolution outcome, request outcome, HTTP status class, and a full grep of daemon stdout/stderr and the response for both secret values and for any location string. Closes milestone **M1** only |
| Verification | The previously observed `CREDENTIALS_UNAVAILABLE` no longer occurs; the outcome is a structural success or a typed auth failure; zero occurrences of either secret, any `vault://` string and any carrier path in all captured output |
| Exit criteria | One authenticated vendor interaction completes; the secret and its location are absent from every artefact. **This does not qualify Quotes** |
| Enables | W-12, W-14, W-17; M2a, M3a |
| Priority | **Critical** |

---

### Phase 2 — Status truth

#### W-07 · Make `ServiceHealth` live-capable (additive, versioned)
| Field | Content |
|---|---|
| Objective | Let IPD be able to state what it has actually established |
| Repository owner | IPD |
| Prerequisites | D-7 |
| Scope | Widen `ServiceHealth.liveProviderConnectivity` and `.providerQualification` from literal types to the D-7 vocabulary; keep old values valid and add new ones; add a contract version marker. Update the mirror types in the transport client and IRR's server boundary **in the same change set** so the pinned consumer never sees an unexpected value. Must remain additive — old payloads stay parseable. Covers B-5 |
| Verification | Targeted: contract-drift test (`dhan_d3d_contract_drift.test.ts`) extended; a health payload with each new value round-trips through `MarketDataTransportClient.health()`; an unexpected value is still rejected fail-closed |
| Exit criteria | Client accepts all D-7 values; unknown values still rejected; no consumer breaks |
| Enables | W-08, W-10 |
| Priority | **High** |

#### W-08 · Record observed provider state (last success/failure, latency, auth outcome)
| Field | Content |
|---|---|
| Objective | Give Status real evidence to report instead of inference |
| Repository owner | IPD |
| Prerequisites | W-07 |
| Scope | A bounded in-process state recorder updated by real provider interactions: `lastSuccessAt`, `lastFailure{category, at}`, `lastAuthOutcome`, `lastLatencyMs`, `consecutiveAuthFailures`, `authLatched`. **Status reads it; it never triggers a call.** A separate explicit verify action (D-7) performs at most one probe and records the result. Categories only — never provider messages, never paths. Covers B-13 |
| Verification | Targeted: transitions recorded across success, `AUTHENTICATION_FAILURE`, `CREDENTIALS_EXPIRED`, timeout; a health read does not mutate the recorder; zero transport invocations on health read; serialized recorder contains no path or secret |
| Exit criteria | Health reflects the last observed interaction; observation-only behaviour proven by test |
| Enables | W-09, W-10, W-24 |
| Priority | **High** |

#### W-09 · Add `/v1/diagnostics`
| Field | Content |
|---|---|
| Objective | Surface the operational facts an owner needs, on the existing authenticated loopback boundary |
| Repository owner | IPD |
| Prerequisites | W-08, D-7 |
| Scope | Read-only route returning the D-7 **MAY** list only: backend id and readiness, credential-resolution outcome code, provider connectivity and qualification state, last success timestamp, last failure category, latency, request counters, mapping count, cache size/state. Enforces the D-7 **MUST NOT** list by construction — no secret material, no `vault://` strings, no carrier paths, no child-process output |
| Verification | Targeted: unauthenticated call refused (401); serialized body asserted free of `vault://`, path separators resembling a carrier location, and both secret values; values match the recorder |
| Exit criteria | One authenticated read answers "is Dhan working, and if not, in what category" without revealing any location |
| Enables | W-10, W-37, W-38 |
| Priority | **Medium** |

#### W-10 · IRR Status consumes IPD authority only
| Field | Content |
|---|---|
| Objective | Remove the second source of truth and stop publishing secret-reference pointers |
| Repository owner | IRR |
| Prerequisites | W-07, W-08, D-7 |
| Scope | Replace `describeDhanProviderReadiness(process.env)` with a read of IPD's health/diagnostics over the existing transport; delete IRR's dependence on `IIPS_DHAN_*`; **remove `secretRefPointers` from the IRR health report** per D-7 (B-15); map the D-7 vocabulary onto IRR's states; add the explicit "Verify connection" affordance; keep `noAuthFetch` and credential-free rendering. Covers B-6, B-15 |
| Verification | Targeted IRR tests: states rendered from injected IPD payloads; no `IIPS_DHAN_*` read anywhere in IRR (grep assertion); no `vault://` or pointer field in any response (assertion); verify action issues exactly one request; browser payload contains no secret |
| Exit criteria | Status is truthful from IPD evidence alone; IRR holds no Dhan configuration and publishes no pointer |
| Enables | M4 |
| Priority | **High** |

#### W-11 · Reconcile configuration names, ports and environment documentation; add an IRR leak gate
| Field | Content |
|---|---|
| Objective | Make the documented setup actually produce a working configuration |
| Repository owner | IRR (docs + one env read) + IPD (its own env docs) |
| Prerequisites | None |
| Scope | Choose **one** base-URL variable and support it on both paths (or document both unambiguously); correct `.env.example`'s port to the daemon default; document `IIPS_MARKET_DATA_BASE_URL`/timeout and the daemon's `IIPS_DHAN_*`/daemon/transport variables in the runbook; remove the stale pin reference in the runbook header; add an IRR server-bundle gate asserting no provider symbols or `IIPS_MARKET_DATA_*`/`IIPS_DHAN_*` names reach browser output. Covers B-11 |
| Verification | Targeted: config tests assert the documented names resolve; the new bundle gate fails when a forbidden token is injected into a fixture bundle; a manual dry-run of the documented procedure against a running daemon |
| Exit criteria | Following the documentation verbatim yields a connected daemon for all four capabilities |
| Enables | W-15, W-21, W-29, W-36, W-37 |
| Priority | **High** |

---

### Phase 3 — Live quotes qualification

#### W-12 · Qualify the Dhan quote request/response against the live vendor
| Field | Content |
|---|---|
| Objective | Replace documented assumptions with observed facts |
| Repository owner | IPD |
| Prerequisites | W-06 |
| Scope | Capture one real `/marketfeed/quote` request/response for a known mapped instrument; compare against `dhan_dto.ts` and `dhan_normalizer.ts` assumptions — field names, `last_trade_time` format, `net_change` presence/sign, `ohlc.close` semantics, depth arrays, `volume` integrality. Adjust DTO parsing and normalization where observation differs; keep `previousClose` from `net_change` only. Record the captured shape (redacted) as qualification evidence |
| Verification | Targeted: normalization tests updated from the observed payload; a regression fixture built from the redacted capture; live re-run confirms identical parsing. Evidence class **E4** only (§8) |
| Exit criteria | Real payload parses to a valid canonical D01 envelope with plausible, cross-checked values |
| Enables | M2, W-13, W-14 |
| Priority | **Critical** |

#### W-13 · Represent unavailable bid/ask honestly
| Field | Content |
|---|---|
| Objective | Stop manufacturing zeros where the vendor supplied nothing |
| Repository owner | IPD (+ IRR rendering) |
| Prerequisites | D-5 (no live evidence required); W-12 only as an **edit-sequencing** constraint, because both change `dhan_normalizer.ts` |
| Scope | Implement the D-5 decision in `MarketQuotePayload`, `validateMarketQuotePayload`, `dhan_normalizer.ts` and the IRR DTO/rendering; absent depth normalizes to "unavailable", not `0`. Update `EngineApiAdapter.createMarketDataDTO` and any consumer of `bid`/`ask` accordingly. Covers B-10 |
| Verification | Targeted: absent-depth fixture produces unavailable, not zeros; present-depth unchanged; canonical validator rejects a malformed value while accepting absence; IRR renders "unavailable" |
| Exit criteria | No consumer can mistake missing depth for a real zero |
| Enables | M4, W-29 |
| Priority | **High** |

#### W-14 · Live qualification of instrument mappings
| Field | Content |
|---|---|
| Objective | Prove that mapping rows are correct **against the vendor**, for existing rows and for any rows added by W-27 |
| Repository owner | IPD |
| Prerequisites | W-06 (W-12 recommended first); W-27 for rows added later |
| Scope | For each instrument in the qualification sample — the 96 existing rows, sampled across NSE and BSE, plus every row added by W-27 that matters to the owner — confirm the vendor returns the expected instrument for that `(exchangeSegment, dhanSecurityId)`, and record per-instrument evidence. Identify the failure signature of a stale `dhanSecurityId` so it can be recognised later. **This is the only item that establishes live mapping correctness**; W-27 establishes construction correctness, W-28 establishes measured coverage, and neither substitutes for this |
| Verification | Targeted + **E4**: sample confirms against the vendor; a deliberately wrong `dhanSecurityId` produces `UNRESOLVED_INSTRUMENT` or an obvious mismatch rather than silent wrong data |
| Exit criteria | Mapping correctness evidenced for the sample; mismatch signature documented; newly added rows either qualified or explicitly withheld |
| Enables | M2 declaration, W-27 promotion of new rows, W-30/W-33 |
| Priority | **High** |

#### W-15 · Quotes screen: identity picker and honest field rendering
| Field | Content |
|---|---|
| Objective | Remove manual ISIN typing and render absence truthfully |
| Repository owner | IRR |
| Prerequisites | W-11, W-13, and IPD's identity search (already working) |
| Scope | Populate `companyId`/`securityId` from the existing `/api/dhan/instruments/search` result rather than free text; keep exact-identity validation; render bid/ask as unavailable when absent; keep the conservative freshness mapping. No provider client, no cache |
| Verification | Targeted IRR tests: selecting a search result issues a well-formed quote request; absent-depth renders "unavailable"; `STALE` never renders as current |
| Exit criteria | An operator can request a quote without knowing an ISIN by heart |
| Enables | M4, and W-30/W-31 by precedent |
| Priority | **Medium** |

---

### Phase 4 — Historical qualification

#### W-17 · Qualify the Dhan historical request/response
| Field | Content |
|---|---|
| Objective | Replace the PROVISIONAL wire shape with observed fact |
| Repository owner | IPD |
| Prerequisites | W-06 |
| Scope | One real `/charts/historical` call per supported interval (`1m`, `5m`, `15m`, `1h`, `1D`); confirm request fields, columnar keys and ordering, epoch units and whether daily timestamps are IST-midnight or UTC-midnight; confirm adjustment signalling; update `dhan_historical_dto.ts` and the adapter to match. Record the observed shapes (redacted) as evidence |
| Verification | Targeted + **E4**: parser tests rebuilt from observed payloads; one regression fixture per interval; live re-run matches |
| Exit criteria | Each supported interval normalizes to a valid D02 series with correct candle boundaries |
| Enables | M3, W-18, W-19 |
| Priority | **Critical** |

#### W-18 · Reconcile the 1,825-day cap and define chunking/limits
| Field | Content |
|---|---|
| Objective | Align the internal guard with real provider constraints |
| Repository owner | IPD |
| Prerequisites | W-17 |
| Scope | Establish the vendor's actual per-request limit and maximum depth (intraday and daily); decide whether the current inclusive-day guard (effective 1,824-day difference) is retained, raised or lowered; implement bounded chunking only **if** the vendor requires it — with merge, de-duplication and ordering guarantees preserved and failures still fail-closed. Note: today there is no pagination at all |
| Verification | Targeted: boundary tests around the final limit; if chunking is added, a multi-chunk merge test proving no duplicates, correct order and correct overall requested-range echo; partial-chunk failure behaviour asserted |
| Exit criteria | Documented limit matches observed provider behaviour; a full-range request either succeeds or fails with a pre-validated, explained reason |
| Enables | M3, W-21 |
| Priority | **High** |

#### W-19 · Wire D02 cache and D02 freshness evidence
| Field | Content |
|---|---|
| Objective | Give historical data the same freshness footing as quotes |
| Repository owner | IPD |
| Prerequisites | W-17 |
| Scope | Route `DhanMarketDataService.getHistorical` through the existing `DhanHistoricalCache` (keyed on the complete request identity) and record a per-request refresh/observation state so `getFreshness({domain:'D02_OHLCV'})` can report a real `cacheState`/`asOf`/verdict instead of `NOT_AVAILABLE`/`UNKNOWN`. Do **not** invent an `asOf` from the newest candle without stating the rule — the D-3/observation model must justify it. Covers B-8 |
| Verification | Targeted: a served request populates the cache; a repeat request hits it; freshness reports a real state; an empty result is still cached and still distinguished from failure; D01 behaviour unchanged |
| Exit criteria | D02 freshness reports real evidence; IRR renders it without its "not available" caveat |
| Enables | M4, W-39 |
| Priority | **High** |

#### W-20 · Implement the D02 / D114-PIT precedence boundary
| Field | Content |
|---|---|
| Objective | One answer to "which history is authoritative" |
| Repository owner | IPD + IRR |
| Prerequisites | D-4 |
| Scope | Implement only what D-4 decides: route consumers to the authoritative source, label provenance, and make any fallback explicit in the response rather than silent. Typically a thin selection boundary plus documentation; no data migration |
| Verification | Targeted: a test that the chosen precedence is enforced and that a blended/mislabelled response is impossible; provenance label present in output |
| Exit criteria | No consumer can receive unlabelled history from a non-authoritative source |
| Enables | W-39, W-32, W-33 |
| Priority | **Medium** |

#### W-21 · History screen: range affordance and truthful gaps
| Field | Content |
|---|---|
| Objective | Make the screen teach the real limits |
| Repository owner | IRR |
| Prerequisites | W-11, W-18 |
| Scope | Constrain the date picker to the qualified limit, explain empty ranges and non-trading days, show `coverageClaim` and `providerQualification` verbatim, and stop implying the series is complete. Keep `SNAPSHOT` semantics |
| Verification | Targeted IRR tests: out-of-range input refused client-side and server-verified; empty result explained; coverage claim rendered |
| Exit criteria | An operator cannot mistake an empty or partial series for full coverage |
| Enables | M4 |
| Priority | **Medium** |

---

### Phase 5 — Freshness and diagnostics completion

#### W-22 · Session-aware freshness
| Field | Content |
|---|---|
| Objective | Stop labelling valid out-of-market data as stale |
| Repository owner | IPD |
| Prerequisites | D-3 |
| Scope | Introduce a governed trading-calendar input (local file, versioned, no network) and a session-aware ageing rule for D01 (and the D02 daily rule); keep `evaluateFreshness` the single owner. Behaviour must be deterministic and testable at explicit instants. Covers B-9 |
| Verification | Targeted: tests at pre-open, in-session, post-close, weekend, holiday and first-session-after-holiday instants; D02 daily rule unchanged where not applicable; no consumer-visible verdict flips unexpectedly mid-session |
| Exit criteria | A last-close quote after hours is not reported stale; the rule is documented with worked examples |
| Enables | M4 |
| Priority | **High** |

#### W-23 · Persist cache and freshness state across restarts
| Field | Content |
|---|---|
| Objective | Keep evidence across a daemon restart |
| Repository owner | IPD |
| Prerequisites | W-08, W-19 |
| Scope | Persist the quote cache, refresh state and observed provider state to a local file under the existing runtime/state directory, loaded at start. **Constraint:** `src/providers/dhan/**` currently imports nothing from `src/persistence/**` or `src/ipc/**`; preserve that by defining a small storage port injected by the daemon (or a self-contained local store inside the provider package). Bounded, single-user, no cloud |
| Verification | **Three distinct acceptances, which must not be conflated (§7.3):** (a) *restart* — the daemon stops and restarts successfully and serves a request; (b) *cold-cache restart* — with the persistence store absent, the daemon restarts successfully, reports `MISS`/`UNKNOWN` honestly and serves cold; (c) *persistence* — a cache entry and freshness evidence written before the restart are readable, correct and freshness-consistent after it. Plus: a corrupt store file degrades safely to a cold start without failing boot or reporting invented evidence. (a) and (b) alone are **not** proof of (c) |
| Exit criteria | All three acceptances evidenced separately; corrupt/absent state degrades safely; no persistence coupling introduced into the provider modules (grep assertion) |
| Enables | Operational recovery requirements (§7) |
| Priority | **Medium** |

#### W-24 · Traceable diagnostics across IRR → IPD → Dhan
| Field | Content |
|---|---|
| Objective | Correlate a screen action to a vendor interaction |
| Repository owner | IPD + IRR |
| Prerequisites | W-08, W-09 |
| Scope | A request/correlation id created in IRR's server boundary, propagated on the transport call, carried into the daemon's log line and the canonical envelope's provenance, and written to a bounded local log ring (no external sink). Deliberately excludes any credential, vendor DTO and any path per D-7 |
| Verification | Targeted: one id appears in the IRR log, the daemon log and the response provenance; log lines contain no secret and no `vault://` string (assertion); ring is bounded |
| Exit criteria | A failed screen action can be traced end-to-end from local logs |
| Enables | W-34, §7 diagnosis requirements |
| Priority | **Medium** |

#### W-25 · Configurable freshness thresholds
| Field | Content |
|---|---|
| Objective | Let the owner tune thresholds without a rebuild |
| Repository owner | IPD |
| Prerequisites | None |
| Scope | Allow per-domain threshold overrides from a local configuration source with safe defaults, validated and bounded, surfaced in diagnostics so the effective value is never a guess. Keep `evaluateFreshness` the owner of the arithmetic |
| Verification | Targeted: override applied and reported; invalid/negative override rejected and falls back to default; defaults unchanged when unset |
| Exit criteria | Effective thresholds are visible and adjustable; defaults preserved |
| Enables | §7 operational tuning |
| Priority | **Low** |

#### W-26 · Close the transport-contract gap: `getFreshness` on the client
| Field | Content |
|---|---|
| Objective | Remove IRR's hand-rolled duplicate of IPD's freshness boundary checks |
| Repository owner | IPD (+ IRR adoption) |
| Prerequisites | W-19 |
| Scope | Add `getFreshness` to `MarketDataTransportClient` with the same guards the client already applies elsewhere, then switch IRR's `readIpdFreshnessStatus` to it and delete the duplicated loopback/token/timeout logic. Do **not** change the freshness semantics |
| Verification | Targeted: parity test that both paths return identical results for the same payloads; IRR's duplicated guard code removed and its tests re-pointed |
| Exit criteria | One implementation of the freshness client boundary |
| Enables | Reduced divergence risk for all later work |
| Priority | **Low** |

---

## 6. Track 2 — IIPS-wide consumer adoption

### Phase 6 — Shared foundation

#### W-27 · Build the repeatable mapping expansion pipeline (construction; no live evidence)
| Field | Content |
|---|---|
| Objective | Grow coverage from 48 companies toward the owner's actual universe, repeatably and deterministically |
| Repository owner | IPD |
| Prerequisites | **None.** Requires only evidence already in the repository: the P04 `SecurityMaster` and the public Dhan scrip-master CSVs. **No Dhan credential, no vendor call, no live response** |
| Scope | Turn the one-off P7 qualification into a documented, re-runnable pipeline: ingest the public scrip-master snapshots, reconcile against the current P04 `SecurityMaster`, and emit a manifest with SHA-256 provenance, per-row dispositions and coverage counts. Runtime access stays local-file-only (the daemon still reads a manifest, never the network). **Identity rule (normative):** matching is by **exact canonical identity** — ISIN plus exchange series bound to a companyId — through the same governed path as P7. Symbol-name or token matching is **never** authoritative identity evidence and must not be used to create a mapping; the indicative name-based comparison in the investigation (68-row fixture, 1 plausible match) is a *planning signal only* and is explicitly not an identity method. Newly produced rows are **proposed**, not qualified, until W-14 accepts them. Covers B-14 |
| Verification | Targeted, **E1/E2**: pipeline re-run from identical inputs reproduces a byte-identical manifest; every row carries provenance; disposition counts reconcile with input counts; an injected near-miss (same company, wrong series) is rejected rather than matched; `tests/dhan_p7_instrument_master.test.ts` extended; daemon still loads qualified-only rows and ignores proposed ones |
| Exit criteria | An operator can refresh coverage on demand and see exactly what was gained, rejected and why — with no live call and no guessed identity |
| Enables | W-28, W-14 (for new rows), W-30, W-33 |
| Priority | **Critical** (Track 2) |

#### W-28 · Measure mapping coverage against the owner's real holdings
| Field | Content |
|---|---|
| Objective | Replace guesswork with a measured number |
| Repository owner | IRR (measurement) + IPD (registry) |
| Prerequisites | W-27. **No live evidence required** |
| Scope | Read persisted holdings identity (the existing G-2 holding view carries `isin`, `exchange`, `identityStatus`, `resolutionDisposition`) and report, per holding, whether an **exact** Dhan mapping exists — by ISIN through the persisted security identity, never by name. Produce a report, not a new authority, listing resolved/unresolved and the reason for each miss (`MISSING_P04_CORRESPONDENCE`, `NO_PROVIDER_ROW`, …). **Planning context (indicative only, not an identity method):** the retained 68-row Dhan holdings fixture shares at most one plausible company with the 48 mapped ones, so coverage is likely very low; this item is what converts that suspicion into a number |
| Verification | A coverage report with counts and a prioritised gap list; the measurement path uses only persisted identity fields, never symbol strings |
| Exit criteria | A measured coverage number exists for the owner's actual holdings |
| Enables | W-29 acceptance scope, W-30, W-33 |
| Priority | **Critical** (Track 2) |

#### W-29 · Shared IRR quote-consumption boundary
| Field | Content |
|---|---|
| Objective | Ensure quote consumers adopt market data once, not once each — **without** waiting for historical qualification |
| Repository owner | IRR |
| Prerequisites | **Build:** W-11 (documented transport config), W-13 (canonical bid/ask), and a healthy identity path. **Acceptance for live use:** M2. **Not dependent on W-19, W-17 or Phase 4** — quote consumption is verifiable end to end with synthetic fixtures and, once M2 exists, with live quotes |
| Scope | One IRR server module that: takes a set of canonical identities, fetches quotes through IPD's transport (bounded concurrency), joins freshness per scope, and returns a uniform projection carrying value + `asOf` + freshness verdict + `providerQualification` + explicit unmapped/unavailable states. No caching, no normalization, no provider client — those stay in IPD. **Historical consumption is explicitly out of scope and is specified separately in W-39** |
| Verification | Targeted, **E2** with synthetic fixtures: mixed outcomes (current / stale / unavailable / unmapped / malformed identity) in one batch; bounded concurrency and rate-limit behaviour; assertion that no other IRR module imports the transport directly; assertion that no browser bundle contains the transport. Then **E4** for live acceptance at M2 |
| Exit criteria | Exactly one place in IRR talks to IPD for quotes; every quote consumer uses it and nothing else |
| Enables | W-30, W-31, W-32, W-33, W-34, W-35 |
| Priority | **High** (Track 2) |

#### W-39 · Historical-data consumption extension
| Field | Content |
|---|---|
| Objective | Extend the shared boundary to historical data **only once** the D02 authority and freshness questions are settled |
| Repository owner | IRR |
| Prerequisites | W-29, W-19 (D02 cache/freshness), and D-4 with W-20 (authority and precedence). Live acceptance additionally requires M3 |
| Scope | Add to the W-29 boundary a historical projection: authoritative source per D-4, provenance and `coverageClaim` carried verbatim, freshness from D02 evidence, explicit empty/missing-day states, and **no silent fallback** between Dhan D02 and the D114/PIT dataset. Consumers must be unable to blend the two |
| Verification | Targeted, **E2**: projection built from synthetic D02 payloads; a D114-only instrument renders as unavailable rather than substituting; provenance and coverage claim present; a deliberate attempt to blend is rejected. **E4** at M3 for live acceptance |
| Exit criteria | Historical consumers receive one labelled, authoritative series with freshness, or an explicit unavailability |
| Enables | W-32, W-33 |
| Priority | **Medium** (Track 2) |

### Phase 7 — Consumer integrations

All are IRR-owned, all consume W-29 (and W-39 where historical data is involved), none is a prerequisite for a Dhan menu capability. Priorities reflect actual product functionality today.

| ID | Consumer | Current market data | Needs | Prerequisites | Acceptance evidence | Priority |
|---|---|---|---|---|---|---|
| **W-30** | **Personal Portfolio** | `averageBuyPrice` and `currentPrice` are **operator-entered stored fields**; "Total value" computed from them with no provenance | Live LTP per held security, `asOf`, freshness verdict, per-row unmapped/unavailable state, portfolio-level as-of and worst-case freshness. Manual entry retained as an explicit, labelled fallback | W-29, W-27, W-28 | Every holding shows a sourced price with a freshness badge **or** an explicit unmapped/unavailable state; the total is labelled with its as-of and worst freshness; a stale price is never rendered as current; no credential in the browser | **High** |
| **W-31** | **Watchlists** | None (names/membership only) | LTP + change + freshness badge per item; unresolved items rendered as unresolved, not zero | W-29 | A mixed-resolution watchlist renders three distinct states correctly; batch fetch bounded and rate-limit-aware (no per-item storm) | Medium |
| **W-32** | **Company Intelligence / stock-level analysis** | Identity/coverage observations only; no price | Quote and, optionally, a short D02 series from the authoritative source | W-29, W-39 | Price and (if shown) history carry provenance and coverage claim; nothing is inferred where the source is unavailable | Medium |
| **W-33** | **Valuation (IID)** | Fixture prices (`price: obs(2450)`, `priceAsOf: '2026-11-05'`) | A canonical quote with explicit `asOf`; margin-of-safety refuses to publish on a stale or unresolved price | W-29, W-39, W-28 | A valuation run records the price's provenance and as-of; a stale price blocks or explicitly degrades the verdict; no fixture price can be mistaken for live | Medium |
| **W-34** | **Reports / decision support** | No price reference | `asOf` + freshness on any price-derived figure; refusal to publish from suppressed data; traceable id | W-29, W-24 | A report generated from stale data is refused or explicitly marked; every price figure traces to an IPD observation | Low |
| **W-35** | **Broker Holdings** | None — the preview explicitly publishes no market value or weight | After commit (not in preview), the W-30 treatment; preview keeps its disclaimers | W-30 | Preview disclaimers unchanged; committed holdings show sourced prices with freshness | Low |

**Ownership note.** IPD owns provider access, credentials, mapping, normalization, canonical contracts, caching, freshness and provider diagnostics. IRR consumes and presents through IPD only. **No work item in this roadmap introduces direct Dhan API access from IRR**, and none may.

---

## 7. Shared — Phase 8: Windows operational readiness

### 7.1 What the existing launcher actually does (inspected, not assumed)

The brief for this revision stated that the existing IIPS local startup workflow already manages the Dhan market-data daemon. **That is not supported by the repository evidence at the inspected commit**, and is recorded as unresolved (Appendix C-1) rather than assumed. The inspected facts:

| Fact | Evidence |
|---|---|
| `03-Start-IipsServers.ps1` starts exactly four services via the shared `Start-IipsService` helper: `ipd-ipc`, `irr-transport`, `irr-frontend`, `ipd-shell` | `windows-setup/03-Start-IipsServers.ps1:283, 317, 338, 364` |
| It contains **no** reference to the market-data daemon, `dhan_local_daemon`, `start:market-data-daemon`, or port 8791 | grep of `windows-setup/*.ps1` (only `$ipdRoot` matches) |
| Precedent for per-service environment injection: a hashtable (`$ipcEnv` = `IIPS_G2_IPC_ENDPOINT`, `IIPS_G3_DATABASE_PATH`, `IIPS_G3_LOCAL_STATE_DIR`) passed as `-Environment` | `:283` |
| Precedent for readiness verification: poll the service's **stderr log** for a bound-marker with a 60 s deadline and an explicit refusal match | `:289-296` |
| Invariant: "This script never kills a process it did not start"; a named-pipe presence check refuses to double-start | `:273` |
| Working directory for the IPD service is the IPD checkout root (`$ipdRoot`) — which is also what the daemon's P7 manifest resolution expects | `:283`, `:211` |
| Recorded port plan: 8787 transport, 5176 IRR frontend, 5174 IPD shell, 5173 ArthaVault — **no 8791** | `windows-setup/MANIFEST.txt` |

W-36 is therefore specified as an **extension of this launcher**, reusing its helpers and invariants, and explicitly forbids creating a second startup mechanism.

### 7.2 Launcher extension and operator tooling

#### W-36 · Extend the existing IIPS launcher for the market-data daemon

| Field | Content |
|---|---|
| Objective | Make the daemon a first-class part of the existing local startup workflow — without a competing launcher |
| Repository owner | IPD |
| Prerequisites | W-03 (backend selector), W-11 (agreed configuration names), D-7 (diagnostics disclosure) |
| Scope | Extend the existing scripts, not replace them: (1) add a `-StartMarketDataDaemon` switch alongside the existing switches, starting the daemon through the **existing** `Start-IipsService` helper with `-WorkingDirectory $ipdRoot`, the existing log directory, and an environment hashtable in the `$ipcEnv` style carrying `IIPS_MARKET_DATA_TRANSPORT_TOKEN`, `IIPS_DHAN_VAULT_BACKEND` and the daemon port — sourced from an uncommitted local carrier, never from argv or shell history; (2) add a **port-8791 ownership guard** mirroring the existing named-pipe guard, so a second launch refuses rather than conflicting, and the "never kill a process it did not start" invariant is preserved; (3) verify readiness using the existing model — poll the daemon's stderr for the startup line and confirm `GET /v1/health` over loopback with the bearer token, with an explicit refusal path and a bounded deadline; (4) register the daemon in the port plan; (5) add the corresponding stop and restart handling to `06-Stop-IipsServers.ps1` and the health checks to `04-Validate-BackendEndpoints.ps1`; (6) leave `ipd-ipc`, `irr-transport`, `irr-frontend` and `ipd-shell` startup behaviour untouched. **This roadmap does not modify the launcher**; W-36 is the work item that would |
| Verification | **E3**: a full start → verify → stop → restart sequence on Windows covering all five services, evidencing that the four pre-existing services behave exactly as before, that a second daemon launch is refused, that health verification distinguishes not-configured / not-running / unauthenticated / ready, and that no secret, path or `vault://` string appears in any log the launcher writes |
| Exit criteria | One documented command starts and verifies the whole local stack; no duplicate startup path exists; existing services unaffected |
| Enables | Owner self-service; §7.4 recovery |
| Priority | **High** |

#### W-37 · Operator runbook: live Dhan operation and recovery
| Field | Content |
|---|---|
| Objective | Make the owner able to run and recover the integration unaided |
| Repository owner | IRR (runbook) + IPD (provider docs) |
| Prerequisites | W-09, W-11, W-36 |
| Scope | New runbook sections: credential provisioning and rotation (W-04, including the interrupted-rotation recovery case), daemon start/stop/verify inside the existing launcher, expected outcomes for Status/Quotes/History/Freshness, and a symptom→cause table covering `CREDENTIALS_UNAVAILABLE`, `CREDENTIALS_EXPIRED`, `AUTHENTICATION_FAILURE` (including the latched state after a failed re-read), `RATE_LIMITED`, `UNRESOLVED_INSTRUMENT`, `TRANSPORT_FAILURE`, `TRANSPORT_NOT_CONFIGURED` and empty historical results. Include the 24-hour token replacement routine and state explicitly that allowing the token to expire is recoverable only by re-provisioning |
| Verification | A dry-run by the owner following the document only, ending in a successful quote and a successful simulated expiry recovery |
| Exit criteria | The document is sufficient on its own |
| Priority | **High** |

#### W-38 · Startup readiness preflight
| Field | Content |
|---|---|
| Objective | One command answers "is this installation ready?" |
| Repository owner | IRR |
| Prerequisites | W-09, W-11 |
| Scope | A local preflight that checks: transport env present and loopback, daemon reachable, token accepted, backend active and ready, mapping count > 0, provider state, and token expiry proximity — reporting each as pass/fail/config-missing with no secret, path or `vault://` output |
| Verification | Targeted: runs green on a configured machine and reports precise, distinguishing failures on each of five deliberately broken configurations |
| Exit criteria | Owner diagnoses a broken setup in one step |
| Priority | **Medium** |

### 7.3 What a single user must be able to do

| Requirement | Current state | Delivered by |
|---|---|---|
| Configure Dhan credentials securely | **Not possible** — no store, no utility, no documented procedure | D-1, D-2, W-01, W-02, W-04, W-37 |
| Start the required services | Daemon start undocumented and absent from the launcher; port plan omits 8791 | W-36, W-11 |
| Verify provider readiness | Only a startup line; Status cannot express a live provider | W-07, W-08, W-09, W-10, W-38 |
| Use Quotes and History | Blocked; Quotes needs a hand-typed ISIN | Phase 1 + W-12/W-15, W-17/W-21 |
| Inspect freshness and provider failures | D01 works and is read-only; D02 empty; no failure-category surface | W-19, W-09, W-24 |
| Recover from expired credentials | Manual only; no documented route; no preflight | D-6, W-04, W-05, W-37, W-38 |
| Restart without losing required state | Cache and freshness die with the process | W-23 |

**Restart versus persistence — three separate acceptances, never conflated:**
1. **Restart** — the daemon stops cleanly and starts again, serving requests. (E3.)
2. **Cold-cache restart** — with no persistence store present, the daemon starts, reports `MISS`/`UNKNOWN` honestly, and serves cold. (E3.)
3. **Persistence** — previously valid cache and freshness evidence survive the restart and remain freshness-consistent. (E3 with W-23.)

A successful restart (1) is **not** evidence of persistence (3). Only W-23's third acceptance closes persistence, and a corrupt or missing store must degrade to (2).

### 7.4 Design bounds (deliberate)

Local files under an existing runtime/state directory; DPAPI user scope; no cloud secret manager; no service mesh, container, reverse proxy, multi-user identity or background daemon manager. The daemon stays loopback-only and refuses production mode. Starting, stopping and restarting must remain one documented command each.

---

## 8. Evidence ladder and live-qualification discipline

This section is normative for the whole roadmap. Five evidence classes, strictly ordered. **A claim may only be made at the class actually evidenced.**

| Class | Meaning | Examples | May it be described as live qualification? |
|---|---|---|---|
| **E0** | Source implementation | Code exists and compiles | **No** |
| **E1** | Unit and contract verification | Deterministic assertions on parsing, freshness arithmetic, contracts, export surface | **No** |
| **E2** | Synthetic end-to-end | Local daemon + transport + fixtures or an injected fake provider transport | **No** |
| **E3** | Local Windows operational verification | Launcher start/stop/restart, health checks, DPAPI round trip with a throwaway secret, credential rotation, persistence across restart | **No** |
| **E4** | **Live Dhan qualification** | Real authenticated vendor request and response, captured (redacted) and compared | **Yes — only this** |

**Prohibited claims, stated explicitly:**
* Successful **credential decryption** (E3) proves the store works. It says nothing about Dhan authentication.
* Successful **live authentication** (M1, E4) proves the vendor accepts the credential. It says nothing about whether any quote is correct, normalized or usable.
* A **live quote response** (M2a, E4) proves the vendor answered. It is not a qualified quote until payload, identity, timestamps, values and normalization are verified (M2).
* **Local daemon startup**, a **synthetic fixture** and a **mocked provider response** are E2/E3 and may never be recorded as live qualification.
* A **passing test suite** is E1/E2 and may never close an M2, M3 or M4 gate on its own.

Each milestone's required evidence class is stated in §10.1 (table column *Evidence class*). Real-vendor evidence (E4) is mandatory for M1, M2a, M2, M3a, M3 and for M4's provider-state element.

---

## 9. Testing and live qualification strategy

### 9.1 Layering, and the credentials split

| Layer | Evidence class | Runs without Dhan credentials? | Scope |
|---|---|---|---|
| L1 Unit | E1 | **Yes** | SecretRef validation, config resolution, DTO parsing, normalization, freshness arithmetic, cache/LRU, limiter, retry classification, calendar rules, carrier envelope validation |
| L2 Contract/drift | E1 | **Yes** | Canonical envelope/D01/D02 shapes; `ServiceHealth` vocabulary; `./dhan-server` export surface; transport client ↔ daemon parity |
| L3 Credential-resolution and auth | E1 + E3 | **Yes** (synthetic/injected runner; throwaway secret on Windows) | Backend success and every failure path, expiry/revocation/version mismatch, bounded re-read and latch, scrubbing, DACL and envelope validation |
| L4 Synthetic end-to-end | E2 | **Yes** | Daemon + transport + injected fake provider transport; all four capabilities with fixtures; failure modes |
| L5 IRR↔IPD integration | E2 | **Yes** | IRR routes against a locally running daemon and against injected fixtures; unavailable/stale/unmapped rendering |
| L6 Windows startup/restart | E3 | **Yes** | Launcher start/verify/stop/restart, cold-cache restart, persistence, credential rotation and interrupted rotation |
| L7 **Live Dhan qualification** | **E4** | **No — requires real credentials** | Authenticated call, qualified quote, qualified series per interval, expiry rehearsal, rate-limit observation, secrecy grep |
| L8 Consumer acceptance | E2 then E4 | Mixed | Each consumer renders sourced / stale / unavailable / unmapped correctly; live acceptance per consumer after the relevant milestone |

### 9.2 Gates and closing evidence

| Gate | Requires | Evidence that closes it |
|---|---|---|
| **G-M1** credential resolution + vendor auth | L1–L4 + **L7 (auth only)** | `CREDENTIALS_UNAVAILABLE` no longer occurs; outcome is a structural success or a typed auth failure; zero secret occurrences and zero location strings in logs |
| **G-M2a** first live quote response | L7 | One real quote response received and parsed into a canonical D01 envelope — no correctness claim yet |
| **G-M2** qualified live quote | L7 | Payload, identity mapping, timestamps and values cross-checked against an independent source; normalization verified; `bid`/`ask` absence handled per D-5; unresolved/malformed still fail closed |
| **G-M3a** first live historical response | L7 | One real response parsed for one interval — no coverage claim |
| **G-M3** qualified historical | L7 | One series per supported interval; boundaries, ordering, duplicates and empty ranges handled; effective limit documented from observation |
| **G-M4** four capabilities operational | G-M2 ∧ G-M3 ∧ L5 ∧ L6 | Status reports observed provider state; freshness correct in and out of session; D02 freshness non-empty; one end-to-end trace id; Windows start/stop/restart transcript. Persistence is **not** part of M4 (§10.3) |
| **G-M5** Track 2 foundation | G-M2 + L1/L2 | Coverage measured against real holdings; pipeline reproducible; one quote-consumption boundary is the sole market-data caller |
| **G-M6** consumers adopted | G-M5 (+ G-M3 where historical) | Per-consumer acceptance note with sourced/stale/unavailable/unmapped evidence |

### 9.3 Full-suite policy

Targeted suites only, by default. A **full IPD suite run** is justified at exactly two gates, because both touch governed contracts where a regression would be invisible in a targeted run: **after W-07** (contract widening) and **after W-13** (canonical D01 change). Everything else — credential backend, transport, screens, consumers — is verifiable with the named targeted suites. IRR runs targeted `vitest` files per changed area; no IRR full-suite mandate in this roadmap.

### 9.4 Credential handling in test evidence

* Live qualification uses the owner's real credentials but records **no secret and no location**: only timings, status classes, decision codes, redacted response excerpts, and the result of a grep proving absence.
* Synthetic tests use obviously fake values (e.g. the `synthetic-server-only-token` already used in IRR tests).
* The Windows round-trip tests in W-02/W-04 use a **generated throwaway string**, never a Dhan credential.
* Every gate's evidence step greps the daemon log, the IRR log, HTTP bodies and built bundles for both secret values, `vault://`, and carrier path fragments.
* Real Dhan credentials are not used for any documentation or planning task, including this one.

---

## 10. Milestones, critical path and exit criteria

### 10.1 Milestone definitions

| Milestone | Definition | Evidence class |
|---|---|---|
| **M1** | **First live authentication** — one real authenticated interaction with Dhan succeeds | E4 (auth only) |
| **M2a** | **First live quote response** — a real quote is received and normalized into a canonical D01 envelope | E4 |
| **M2** | **First qualified live quote** — the quote's vendor payload, identity mapping, timestamps, values and canonical normalization are verified against observed live evidence | E4 |
| **M3a** | **First live historical response** — a real series is received and normalized for one interval | E4 |
| **M3** | **First qualified historical response** — every supported interval verified for boundaries, ordering, gaps and limits | E4 |
| **M4** | **All four menu capabilities operational** — Status, Quotes, History and Freshness | E4 + E2 + E3 |
| **M5** | **Track 2 foundation** — measured coverage plus one shared quote-consumption boundary | E2 + measured report (+ E4 for live acceptance) |
| **M6** | **Consumers adopted** — each with agreed scope and exclusions | E2 + E4 |

### 10.2 Critical path

```
M1   first live authentication
     D-1 → D-2 → W-01 → W-02 → W-03 → W-04 → [D-6 operator step] → W-06
     (W-05 is NOT on this path: one vault read per call is acceptable for a bounded verification)

M2a  first live quote response
     M1 → one controlled quote request        (W-12 only if the payload does not parse)

M2   first qualified live quote
     M2a → W-12 → W-13 → W-14 (live mapping evidence)

M3a  first live historical response
     M1 → W-17

M3   first qualified historical response
     M3a → W-18

M4   all four capabilities operational
     M2 ∧ M3 ∧ W-05 ∧ W-07 → W-08 → W-10 ∧ W-11 ∧ W-19 ∧ W-21 ∧ W-22

M5   Track 2 foundation            (does NOT wait for M3/M4)
     M2 ∧ W-27 ∧ W-28 ∧ W-29

M6   consumers adopted
     M5 ∧ W-39 (for historical consumers) ∧ the individually scoped consumer items
```

**Longest chain:** `D-1 → D-2 → W-01 → W-02 → W-03 → W-04 → D-6 → W-06`. Short in effort, but it holds two decisions and one operator procedure, and it gates all live data. Everything else can be built while it runs.

**Parallelism that this revision unlocks:** W-27 and W-28 no longer wait for live vendor evidence; W-29 no longer waits for historical qualification. Track 2 can reach M5 as soon as M2 exists, without M3 or M4.

### 10.3 Exit criteria

| Milestone | Exit criteria |
|---|---|
| **M1** | One authenticated vendor interaction completes; daemon startup line shows the live backend, readiness and `IPD_SERVER_HTTPS`; both secrets and all location strings absent from every artefact. **Quotes is not qualified by this** |
| **M2a** | A real quote response parses into a valid D01 envelope. Explicitly **not** a qualification |
| **M2** | Values and identity cross-checked independently; timestamp correct; normalization verified against the observed payload; unresolved/malformed still fail closed; absent depth reported as unavailable; mapping evidence recorded for the sample |
| **M3a** | One real historical response parses into valid D02 candles. No coverage claim |
| **M3** | Each supported interval normalizes with correct boundaries and ordering; empty ranges handled; the effective limit documented from observation; chunking behaviour (if any) proven |
| **M4** | Status reports observed provider state and can reach an authenticated/operational state without opening the screen triggering a vendor call; freshness correct in-session and out-of-session; D02 freshness non-empty; one trace id spans IRR → IPD → Dhan; a Windows start/health/stop/restart transcript exists (E3). **Persistence is not part of M4** |
| **M5** | Coverage measured against the owner's actual holdings by exact identity; the pipeline re-run is byte-reproducible; one IRR quote-consumption boundary is the sole market-data caller |
| **M6** | Each adopted consumer renders sourced / stale / unavailable / unmapped distinctly, with provenance and as-of, and no credential reaches the browser |

---

## 11. Recommended first implementation work item

### W-02 · Implement the Windows DPAPI secret-store backend (bounded, executable as a standalone task)

**Why this one first.** It is the first *code* item on the critical path, it attacks the single blocker that credentials cannot fix (B-1), and — decisively — **it is fully verifiable without any Dhan credential** (E1 + E3), so it can be completed and accepted before the owner has provisioned anything.

**Precise scope**

1. New `LocalHostVaultSecretBackend` implementation in IPD (suggested: `src/providers/dhan/windows_dpapi_vault_backend.ts`), exporting `backendId`, `describeReadiness()`, `readSecret(ref, asOfUtc)`.
2. Two independent carriers (client id, access token) per D-1, each a versioned envelope with the metadata of D-1; unknown schema refused.
3. `describeReadiness()` returns `liveResolutionSupported: true` only when both carriers exist, satisfy the owner-only DACL requirement, parse against a known schema, and a probe read succeeds; otherwise `false` with a **non-locating** prerequisite summary.
4. `readSecret()` performs one DPAPI unprotect via a single `powershell -NoProfile -NonInteractive` invocation, passing the request on stdin and reading the secret from stdout only; it returns `LocalHostVaultSecretRecord{secretValue, status, expiresAt?, version?}`.
5. Distinct scrubbed failures for: missing carrier, unreadable/wrong principal, corrupt or unknown schema, expired, version mismatch, child-process failure, empty output.
6. No secret in argv, temp file, log, error, diagnostic or serialisation. The PowerShell invocation must not echo the value.
7. Unit tests with an injected process runner for every failure path, plus one real Windows round trip using a **generated throwaway string**.

**Prerequisites (must be settled before coding starts)**
* **D-1** — store selection, carrier/envelope spec, DACL requirement, admitted `VaultProvider` member.
* **D-2** — read posture (determines whether this module also owns the session holder, or W-05 does).
* **W-01** — the provider value and the two-key-path convention must exist first.

**Explicitly out of scope:** backend selection wiring (W-03), the provisioning utility (W-04), real credentials, any vendor call, any change to `ServiceHealth`, any IRR change, any change to `DhanApiClient`, any launcher change.

**Definition of done:** the backend resolves a synthetic secret it stored itself on Windows; every failure path is distinct and fail-closed; no secret or carrier path appears in test output or logs; existing Dhan suites remain green; `DisabledWindowsHostVaultBackend` is still the default.

---

## 12. Direct answers

### What is the minimum work required to obtain the first successful live Dhan quote?

**Two decisions, four code items and one operator procedure**, and note that "first successful live quote" is *not* the same as a qualified quote:

1. **D-1** — choose the Windows store, specify the carriers, admit its `SecretRef` provider.
2. **D-2** — decide the read posture and the bounded re-read policy.
3. **W-01** — add the `VaultProvider` member and the two key paths (additive: one union, one validation array, one test).
4. **W-02** — implement the DPAPI backend (the actual removal of the blocker).
5. **W-03** — let the daemon select it so the egress gate opens.
6. **W-04** — a safe way to place the two secrets.
7. **W-06** — provision the owner's real client-id and 24-hour token and make one authenticated call.

**W-05 is not required for this.** A bounded initial verification tolerates one vault read per call; W-05 exists for normal operational performance and is required by M4, not by M1.

What is also **not** required: mapping expansion. The existing 96-row registry resolves 48 companies exactly, so a first quote needs only a valid ISIN for one of them. W-12 is required to *trust* the values (M2), not to receive a response (M2a).

### What additional work is required to make all four Dhan menu capabilities operational?

* **Status:** W-07 (live-capable contract — without it the screen can never say "authenticated"), W-08, W-10, plus W-09 and the D-7 disclosure policy that now also removes the published secret-reference pointers.
* **Quotes (qualified, not merely succeeding):** W-12, W-13, W-14, W-15, and W-05 for operational latency.
* **History:** W-17, W-18, W-19, W-21; W-20/W-39 only when history is exposed to consumers.
* **Freshness:** W-19 (D02 non-empty), W-22 (session awareness — otherwise after-hours data reads stale), optionally W-25 and W-26.
* **Cross-cutting:** W-11 (without it the documented setup does not work), W-24 (traceability), W-36/W-37/W-38 (operability). W-23 is **not** required for M4 but is required for the "restart without losing state" operational acceptance.

### What additional work is required for broader IIPS market-data adoption?

* **Coverage first, consumers second.** W-27 (pipeline construction) needs **no credentials or vendor evidence** and can start immediately; W-28 (measurement against the owner's real holdings, by exact identity) is what turns the coverage question into a number. Both are independent of Track 1's live work.
* **One shared boundary:** W-29, quote-only, verifiable with fixtures before any live historical capability exists.
* **Then historical consumers:** W-39, gated on W-19 and D-4/W-20.
* **Then consumers by priority:** W-30 (Personal Portfolio — the only consumer whose current behaviour is actively misleading, because a hand-typed `currentPrice` drives a "Total value"), W-31, W-32, W-33 (removes fixture prices), W-34, W-35.

### Which activities can proceed independently, and which must wait?

**Can proceed immediately, in parallel, with no Dhan credentials and no live evidence:**

* All decisions: D-1, D-2, D-3, D-4, D-5, D-7 (D-6 is the owner's own procedure).
* W-01, W-02, W-04 (E1 + E3 with throwaway secrets).
* W-07, W-08, W-09 (contract and state recording — no vendor call).
* W-10 (IRR Status re-pointing, tested against injected payloads).
* W-11 (configuration/documentation reconciliation and the IRR leak gate).
* W-13 (bid/ask absence — buildable from D-5 alone; it edits the same normalizer as W-12, so sequence those two edits instead of parallelising them), W-19 (D02 cache/freshness), W-22 (calendar rules), W-23, W-24, W-25, W-26.
* **W-27 and W-28** (mapping pipeline construction and coverage measurement — the correction this revision makes explicit).
* **W-29** (shared quote-consumption boundary, fixtures).
* W-36 and W-37 (after W-03/W-11 fix names and the selector).
* All IRR screen work and all consumer work, verified against fixtures.

**Must wait:**

* **W-06** and everything requiring E4: W-12, W-14, W-17, W-18.
* **W-39** — needs W-19 and D-4/W-20, and live acceptance needs M3.
* **W-03** follows W-02 in sequence but needs no credential to build.
* **Consumer live acceptance** (W-30…W-35) needs M2, or M3/W-39 for their historical elements; the code can be written earlier against fixtures and should be, to keep the critical path short.
* **W-01 must precede W-03**: without an admitted `VaultProvider` member, a real `SecretRef` fails `validateSecretRef`, so selection would open nothing.

---

## Appendix A · Dependency index

| ID | Title | Repo | Prerequisites | Phase | Priority |
|---|---|---|---|---|---|
| D-1 | Windows secret-store selection, provider admission, carrier spec | IPD | — | 0 | Critical |
| D-2 | Credential read posture + bounded re-read policy | IPD | D-1 | 0 | Critical |
| D-3 | Freshness semantics out of market | IPD | — | 0 | High |
| D-4 | D02 vs D114/PIT precedence | IPD+IRR | — | 0 | High |
| D-5 | Unavailable bid/ask representation | IPD | — | 0 | High |
| D-6 | Token issuance/replacement procedure | Operator | — | 0 | Critical |
| D-7 | Provider state model, verify semantics, diagnostics disclosure policy | IPD+IRR | — | 0 | High |
| W-01 | Windows `VaultProvider` + two-key-path convention | IPD | D-1 | 1 | Critical |
| W-02 | DPAPI secret-store backend | IPD | W-01, D-1, D-2 | 1 | Critical |
| W-03 | Daemon backend selection + honest diagnostics | IPD | W-02, D-7 | 1 | Critical |
| W-04 | Credential provisioning/rotation utility | IPD | W-01, W-02, D-1 | 1 | Critical |
| W-05 | Read posture + bounded re-read (operational, not M1) | IPD | D-2, W-02 | 1 | High |
| W-06 | Provision credentials, prove first live auth (M1) | Operator+IPD | W-03, W-04, D-6 | 1 | Critical |
| W-07 | Live-capable `ServiceHealth` | IPD | D-7 | 2 | High |
| W-08 | Observed provider-state recorder | IPD | W-07 | 2 | High |
| W-09 | `/v1/diagnostics` | IPD | W-08, D-7 | 2 | Medium |
| W-10 | IRR Status from IPD authority only | IRR | W-07, W-08, D-7 | 2 | High |
| W-11 | Config/doc reconciliation + IRR leak gate | IRR+IPD | — | 2 | High |
| W-12 | Quote wire qualification | IPD | W-06 | 3 | Critical |
| W-13 | Honest bid/ask absence | IPD+IRR | D-5 (W-12 = edit-sequencing only) | 3 | High |
| W-14 | Live qualification of instrument mappings | IPD | W-06 (W-12 recommended); W-27 for new rows | 3 | High |
| W-15 | Quotes screen identity picker | IRR | W-11, W-13 | 3 | Medium |
| W-17 | Historical wire qualification | IPD | W-06 | 4 | Critical |
| W-18 | Range limit / chunking reconciliation | IPD | W-17 | 4 | High |
| W-19 | D02 cache + freshness wiring | IPD | W-17 | 4 | High |
| W-20 | D02/PIT precedence implementation | IPD+IRR | D-4 | 4 | Medium |
| W-21 | History screen affordances | IRR | W-11, W-18 | 4 | Medium |
| W-22 | Session-aware freshness | IPD | D-3 | 5 | High |
| W-23 | Cache/freshness persistence (3 acceptances) | IPD | W-08, W-19 | 5 | Medium |
| W-24 | Trace correlation + local log ring | IPD+IRR | W-08, W-09 | 5 | Medium |
| W-25 | Configurable thresholds | IPD | — | 5 | Low |
| W-26 | `getFreshness` on the transport client | IPD+IRR | W-19 | 5 | Low |
| W-27 | Repeatable mapping expansion pipeline (**no live**) | IPD | — | 6 | Critical (T2) |
| W-28 | Coverage measured against real holdings (**no live**) | IRR+IPD | W-27 | 6 | Critical (T2) |
| W-29 | Shared IRR **quote**-consumption boundary | IRR | W-11, W-13 (build); M2 (live acceptance) | 6 | High (T2) |
| W-39 | Historical-data consumption extension | IRR | W-29, W-19, W-20 | 6 | Medium (T2) |
| W-30 | Personal Portfolio live valuation | IRR | W-29, W-27, W-28 | 7 | High |
| W-31 | Watchlists prices | IRR | W-29 | 7 | Medium |
| W-32 | Company Intelligence price context | IRR | W-29, W-39 | 7 | Medium |
| W-33 | Valuation on canonical prices | IRR | W-29, W-39, W-28 | 7 | Medium |
| W-34 | Reports as-of + freshness gating | IRR | W-29, W-24 | 7 | Low |
| W-35 | Broker Holdings live alignment | IRR | W-30 | 7 | Low |
| W-36 | Extend the existing IIPS launcher for the daemon | IPD | W-03, W-11, D-7 | 8 | High |
| W-37 | Runbook: operation and recovery | IRR+IPD | W-09, W-11, W-36 | 8 | High |
| W-38 | Startup readiness preflight | IRR | W-09, W-11 | 8 | Medium |

**Shared prerequisites between the two tracks** (implement once, never twice): D-7 (state vocabulary and disclosure policy), W-07/W-08/W-09 (provider state and diagnostics), W-11 (configuration names and documentation), W-13 (canonical bid/ask), W-22 (session-aware freshness), W-24 (traceability), and the whole of Phase 1. Track 2 adds **no** provider-side capability beyond mapping construction (W-27) and correctness evidence (W-14); it reuses Track 1's foundation unchanged — which is what the provider-neutral architecture was built to allow.

---

## Appendix B · Revision history

**v1.0 — 2026-11-11.** Initial roadmap: 37 work items in phases 0–8, 7 decisions, milestones M1–M6. (The v1.0 count of "38" was off by one: identifiers ran W-01…W-15 and W-17…W-38.)

**v1.1 — 2026-11-11 (this revision).** Corrections applied after independent review:

| # | Correction | Where |
|---|---|---|
| 1 | Phase count corrected from "eleven" to **nine** (Phase 0–8); §6/§7 split so Phase 8 (shared) is no longer presented as Track 2; all section and phase cross-references renumbered | §1, §4, §7, Appendix A |
| 2 | Milestones split: **M1** (authentication), **M2a** (first live quote response), **M2** (qualified live quote), **M3a**/**M3** likewise; explicit statements that authentication or a received quote do not qualify Quotes; W-05 clarified as operational (M4) and **not** an M1 prerequisite | §1, §8, §10, §11, §12 |
| 3 | W-27 no longer depends on W-14. Construction and synthetic validation of the mapping pipeline require **no** live evidence; W-14 is now explicitly the live-qualification item, for existing **and** newly added rows; W-28 depends only on W-27; exact-identity rule stated normatively with name matching prohibited | §6, §10, Appendix A |
| 4 | W-29 decoupled from W-19 and Phase 4: it is now the shared **quote**-consumption boundary; historical consumption split into new **W-39**, gated on W-19 and D-4/W-20 | §6, §10, Appendix A |
| 5 | D-1, D-2, W-02, W-04 strengthened: two separate carriers, DPAPI user scope, owner-only DACL, versioned envelope and metadata validation, atomic rotation and interrupted-write handling, expiry/version validation, distinct failure outcomes, in-memory and child-process handling, and the explicit at-rest-only limitation | §5 |
| 6 | Bounded credential re-read and retry defined: initial resolution point, four permitted re-read triggers, one bounded re-read after 401/403, expired-versus-invalid distinction, latch after a rejected replacement, surfacing to Status, operator-intervention boundary, unbounded loops prohibited, automated acquisition still deferred | D-2, W-05, D-6 |
| 7 | Diagnostics disclosure policy added as normative (D-7) and applied to W-03, W-09, W-10; `vault://` references, carrier paths and store metadata are now prohibited outputs — recorded as blocker B-15 because current behaviour publishes key paths | §2, D-7, W-03, W-09, W-10 |
| 8 | W-36 rewritten to **extend** the existing `03/04/06` launcher rather than create a competing one, reusing `Start-IipsService`, per-service environment injection, stderr-marker readiness polling, the never-kill invariant and a new port-8791 guard. The inspected launcher behaviour is recorded (§7.1) and the brief's premise is marked unresolved (Appendix C-1) | §2, §7.1, W-36 |
| 9 | Restart and persistence separated into three distinct acceptances (restart / cold-cache restart / persistence), plus corrupt-store degradation; M4 no longer requires persistence | W-23, §7.3, §10.3 |
| 10 | New normative **evidence ladder** (E0–E4) with an explicit prohibited-claims list; every milestone annotated with its required evidence class | §8, §9, §10 |

**Identifier changes:** new **W-39** (historical consumer extension). No other identifiers added, removed or renumbered, and **no identifier was skipped in this revision**: the sequence is continuous across W-01…W-15, W-17…W-39. The pre-existing gap at **W-16** is inherited from v1.0, where that number was deliberately left unallocated; it is preserved rather than back-filled so that identifiers referenced by earlier reviews stay stable. Totals in v1.1 are therefore **38 work items** (not 39). No duplicate or obsolete work-item definitions remain: W-29's former "shared market-data adapter including history" scope is now W-29 (quotes) plus W-39 (history); W-14's former mixed live/synthetic scope is now W-14 (live only) with mapping-status exposure handled by W-27/W-28/W-09.

---

## Appendix C · Unresolved points in this revision

Recorded rather than invented, per the constraint that unsupported premises must be marked unresolved.

**C-1 — The existing launcher's management of the Dhan daemon is not evidenced.** The review brief stated the existing IIPS local startup workflow already manages the Dhan market-data daemon alongside IPD IPC, IRR transport and frontend services. At the inspected IPD commit (`a624d06`), `windows-setup/03-Start-IipsServers.ps1` starts four services (`ipd-ipc`, `irr-transport`, `irr-frontend`, `ipd-shell`) and contains no reference to the daemon, `start:market-data-daemon`, or port 8791; the recorded port plan omits 8791. W-36 is therefore written as an extension of the inspected launcher (which is the correct intent either way), and the mitigation is explicit: **no competing startup mechanism**. *Evidence that would resolve this:* the launcher actually deployed on the owner's Windows machine, if it differs from this commit (for example a newer bundle), or a branch containing a daemon step.

**C-2 — No IPD branch has been designated for this roadmap.** The instruction for this revision was to publish to "the authoritative IPD repository and branch already designated for this roadmap". No such designation exists in either repository: enumeration of IPD's 145 remote branches shows only `arena/*-iips-production-market-data` session branches plus topical branches (`g3/*`, `d114-*`, `gate-*`, …), with none named for a roadmap; grep for `roadmap`/`dhan-road` returns nothing relevant; and no DHAN-LIVE-ROADMAP document exists anywhere in IPD (the only roadmap document there is `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`). This roadmap's existing history is in **IRR** at `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md`, and the "preserve history / do not create a competing document" instruction is satisfiable only by updating it in place. Publication therefore stayed in place on the session branch; see the completion report for the exact commit and remote verification. *Evidence needed to move it:* an explicit designation of an IPD branch, and authority to push to it.

---

**End of roadmap.** Planning only; no repository source, configuration, test, launcher script or runtime data was modified. Execution of any work item above is a separate, bounded task, beginning with W-02 as scoped in §11.
