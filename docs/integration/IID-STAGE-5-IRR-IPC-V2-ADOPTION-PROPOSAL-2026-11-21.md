# IID Stage 5 — IRR IPC v2 Adoption Proposal (S1→D02 read path)

**Date:** 2026-11-21
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Branch:** `arena/6373b685-iips-review-recovered` (from `main` `6254399`)
**Document type:** Bounded implementation PROPOSAL (investigation + design only). **No code, test, pin, IPC-contract, IPD, mutation-permission or host change is made by this document.**
**Authorizing decision:** PA/PO — IRR must adopt IPC v2 for the Stage 5 S1→D02 integration path; existing v1 behaviour must remain available to existing consumers unless inspection establishes a specific technical dependency requiring change.
**Builds on:** `979c1c6` (IRR-side consumer compatibility record), `d22f156` (IPD-side response-contract record, decision COMPATIBILITY CONFIRMED, findings F-1 / F-2).

> This document does **not** claim IID Stage 5 acceptance, host readiness, or live host operation. It states what IRR must change, what must not change, what evidence already exists, what evidence is still required, and which items are genuine blockers.

---

## Disposition (updated 2026-11-21, after publication at `3719820`)

| Item | Disposition |
| --- | --- |
| B-1 / W-08 | **RESOLVED — R-1 APPROVED by PA/PO** (implementation authorization for R-1 only). |
| W-01..W-06 (v2 wire client, port adapter, three construction sites) | **IMPLEMENTED** as the technical dependency of R-1 — R-1 is defined as "on the v2 path only", which cannot exist without a v2 path; §5 was implemented exactly as written. |
| W-08 (R-1 additive read-only `contributionLedger`, validated mirror of IPD `contributionsValidated`) | **IMPLEMENTED.** |
| W-07, W-09, W-10 (v1 preservation, owner context, fail-closed matrix) | **VERIFIED unchanged** (full IRR suite + real-dispatcher control block). |
| W-11 (IPD `IIPS_LOCAL_PERSONAL_USE`) | **VERIFIED**: v2 reads identical in both IPD env modes; IRR write gate untouched. |
| W-12 (pin) | **NOT ADVANCED** — no technical dependency established (the IPC client imports nothing from the pinned packages). |
| W-13 (real-dispatcher verification) | **EXECUTED** — 13/13 against IPD `main@4716d0bc` dispatcher + store, both env modes, plus the original 6/6 control. |
| W-14 (host verification prerequisites) | **NOT STARTED** (out of scope; prerequisites listed in the implementation record §9). |
| **Merge to `main`** | **DONE** — PR #606, merge commit `a6df94ff18641789f67de662c6fc72d224479869` (2026-11-21T18:42:14Z), both workflows green on the PR head and on `main` after merge; implementation record §7. |

Implementation record: `docs/integration/IID-STAGE-5-IRR-IPC-V2-R1-IMPLEMENTATION-RECORD-2026-11-21.md`. Two test edits beyond §8 were required and are recorded there (§4.3): the pre-existing assertion that a `v: 2` request frame is refused, and the Direct P1 synthetic peer that answered `v: 1` regardless of the request — both described the pre-v2 world the approved decision changed.

---

## 0. Summary of the proposal in one paragraph

Add a second, closed wire version (`v = 2`) to the existing hand-written IRR IPC client, selectable **per call** and **per port instance** (`protocolVersion: 1 | 2`, default `1`), admitting under `v = 2` exactly the three read operations IPD dispatches under D03 (`portfolio.list`, `portfolio.get`, `portfolio.revisions`) and nothing else; construct the two Stage 5 read ports (`user-portfolio-transport.ts` GET route port and `investment/sources.ts` holdings providers) with `protocolVersion: 2`; leave every other port and every `callIpc` caller at `v = 1` unchanged (no auto-negotiation, no fallback, response version must equal request version). The design is implementable as described for `portfolio.list` and `portfolio.revisions` with no semantic decision pending. For `portfolio.get` (and therefore both holdings providers) one genuine decision is pending and is reported as **blocker B-1**: IPD's v2 detail always carries IPD's *validated non-empty contribution rows* and is not affected by `IIPS_LOCAL_PERSONAL_USE`, while IRR's DR-4r rule in `toG2View` refuses any non-empty `contributions`; the two rules are both authorized, both verified by captured frames, and are incompatible on the v2 path. Resolving B-1 requires a rule decision that this proposal is not authorized to make; options are laid out in §6 with a recommendation.

---

## 1. Remote state independently re-established (verified this session)

| Repository | Ref | Commit | Status |
| --- | --- | --- | --- |
| IRR `origin/main` | `main` | `6254399777b1877bfb3634bf8d4ba2769678d002` | unchanged since `d22f156` record |
| IRR working branch | `arena/6373b685-iips-review-recovered` | `d22f156` (docs-only; `979c1c6` → `ad58043` → `d22f156`) | clean before this document |
| IRR pin | `frontend/package.json` L32, `package-lock.json` (3 `resolved` entries), `.ci/verify-ipd-pins.mjs` L13–17 | `iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be` | **not advanced** |
| IPD `origin/main` | `main` | `4716d0bc` | unchanged; ancestry `e7ded933` (implementation) → `2dec7261` (PR #184 merge) → `4716d0bc` (PR #185 docs-only) re-confirmed |
| IPD working branch | `arena/d1c19f24-…` | `ecfda9a5` | not relevant to this proposal |

Local IPD source inspected at `4716d0bc` (`/tmp/ipd`, built `dist/`), the same checkout used to capture the 12 frames in `docs/integration/artifacts/iid-s5-real-ipd-captured-frames-2026-11-21.json`.

---

## 2. Evidence reused (not repeated)

| Evidence | Where | What it establishes | Used in this proposal for |
| --- | --- | --- | --- |
| Four wire conditions WC-1..WC-4 | `979c1c6` §6; `d22f156` §5 | IRR v1 consumer behaviour on real framing | baseline that v2 must preserve |
| Real-IPD ↔ real-IRR probe, 6/6 in both IPD env modes | `docs/integration/artifacts/iid-s5-real-ipd-consumer-probe-2026-11-21.mts` | IRR v1 reads work end-to-end against the merged IPD; PUT holdings → 503 `operation-not-admitted` with zero frames | v1 preservation baseline; harness to be re-used in v2 mode (§9) |
| 12 captured frames | `…captured-frames-2026-11-21.json` | envelope keys exactly `[ok,op,requestId,result,v]`; 0 of 29 reserved keys present; v2 bodies for list/revisions identical to v1; v2 `portfolio.get` carries `contributions.length === 1` in **both** env modes; v1 governed `get` carries 1 row; v1 personal `get` carries `contributions: []` + `importEvidence[1]` | §4, §6 (B-1) |
| F-1 | `d22f156` §6 | S1→D02 relationship is reached **only** when `envelope.v === 2` (`dispatch.ts` L440) | why v2 is required at all |
| F-2 | `d22f156` §6 | DR-4r contributions refusal vs personal-use projection | elevated here to B-1 |
| IPD unit suites 6/6 + 174/174 at `4716d0bc` | `d22f156` §3 | IPD side tested | not re-run |

---

## 3. Verified existing IRR implementation (facts, with locations)

All statements in this section were read from the working tree at `d22f156` this session. They are **existing behaviour**, not proposals.

### 3.1 Wire client — `frontend/server/user-portfolio/ipcClient.ts`
- `IPC_PROTOCOL_VERSION = 1` (L65). `IpcRequestEnvelope.v: 1`, `IpcResponseFrame*.v: 1` (L420, L472, L480).
- `IPC_READ_OPERATIONS = ['portfolio.list','portfolio.get','portfolio.revisions']` (L103); `IPC_WRITE_OPERATIONS` = create/save/reset/delete/importBroker (L114); `IPC_OPERATIONS` = union (L122); `IPC_RESERVED_OPERATIONS = ['portfolio.analytics']` (L131).
- `encodeRequestFrame` (L433): order of checks is (1) `findRefusedWireKeys` → `IpcWireAuthorityError`; (2) closed envelope key set `{v, op, payload, requestId}` → `MALFORMED_ENVELOPE`; (3) `record.v !== IPC_PROTOCOL_VERSION` → `MALFORMED_ENVELOPE` "only wire protocol version 1 may be sent" (**L448**); (4) op ∉ `IPC_OPERATIONS` or reserved → `UNKNOWN_OPERATION`; (5) 64 KiB cap → `REQUEST_OVERSIZE`. Nothing reaches a socket if any check fails.
- `parseResponseFrame` (L497): `frame.v !== IPC_PROTOCOL_VERSION` → `TRANSPORT_FAULT` "unsupported protocol version" (**L502**); then op string check, closed key set per `ok`, OC-6 `findResponseDisclosedKeys` scan, then typed frame with `v: IPC_PROTOCOL_VERSION` hard-coded (L524, L535).
- `callIpc(op, payload, options)` (L593): builds `{ v: IPC_PROTOCOL_VERSION, op, payload?, requestId? }` (L598–603), encodes first, then opens the socket. `IpcCallOptions` = `{ target?, timeoutMs?, requestId? }` (L578–582). Class P / outcome-unknown / Class A handling is version-agnostic.
- IRR's `IpcClassAOutcome` vocabulary (L154–161) is identical, token for token, to IPD's `ClassAOutcome` (`src/ipc/protocol.ts` L84–91).
- The IPC client imports nothing from the pinned IPD packages (`grep from 'iips-` → no match in `ipcClient.ts`, `ipcPortAdapter.ts`, `investment/sources.ts`).

### 3.2 Port adapter — `frontend/server/user-portfolio/ipcPortAdapter.ts`
- `IpcPortAdapterOptions` = `{ target?, timeoutMs?, precondition?, env?, transport?(op, payload?) }` (L197–214). `IpcUserPortfolioPort` (L224) implements `UserPortfolioPort` (list/get/create/save/reset/delete/revisionHistory).
- `listPortfolios` sends `payload === undefined` (L235); `getPortfolio` / `revisionHistory` send exactly `{ portfolioId }` (L243, L251). This already matches IPD's v2 grammar (§4.2) with no payload change.
- `call()` (L361): fail-closed `ownerContextFromBinding(precondition)` **before any I/O**; `assertHintNotOnWire`; then `transport(op, payload)` if seam set, else `callIpc(op, payload, { target, timeoutMs })` (L386–389).
- `requireSuccess` (L397): Class A → `mapClassAToG2Reason` (`RESOURCE_UNAVAILABLE`→`NOT_FOUND`, `WRITE_NOT_AUTHORIZED`/`UNAVAILABLE`/unknown→`UPSTREAM_UNAVAILABLE`); Class P and outcome-unknown → `UPSTREAM_UNAVAILABLE`.
- `toG2View` (L470 ff.): requires arrays `holdings`, `contributions`; refuses `durability`/`durable` (DR-3); **refuses any `contributions.length !== 0`** with `UPSTREAM_UNAVAILABLE` "outside the authorized DR-4r mapping scope" (L493–499). Holdings are passed through as `G2HoldingView[]`.

### 3.3 Construction sites (who gets which port)
| Site | Operations issued | Role | Current version |
| --- | --- | --- | --- |
| `server/user-portfolio-transport.ts` L456 | `portfolio.list` / `get` / `revisions` (route ops `list`/`detail`/`revisions`, L462–475) | **Stage 5 GET read route** | v1 |
| `server/investment/sources.ts` L170 `createHoldingsProvider` | `list` then `get` per summary | coverage holdings (IdentityObservation[]) | v1 |
| `server/investment/sources.ts` L200 `createPortfolioHoldingsProvider` | `get` for one portfolio | holding identity route (`executive-transport.ts` L942 → `holding-identity-transport.ts` L197) | v1 |
| `server/user-portfolio-transport.ts` L310 | personal write routes (`readJsonBody` follows) | **writes**, gated by IRR `IIPS_LOCAL_PERSONAL_USE` (L62) | v1 — must stay |
| `server/broker-import/brokerImportV1SaveAdapter.ts` L154 (`portfolio.save`), L262 (`portfolio.list` inside the save flow) | write flow | v1 — must stay |
| `server/user-portfolio/capture/ownerBoundPortfolioCapture.ts` L288 (recording `callIpc` wrapper), L795 (port) | W11 operator read capture, read-only | v1 — stays (not the Stage 5 path; see §5.7) |

### 3.4 IRR-side `IIPS_LOCAL_PERSONAL_USE`
Read server-side only (`user-portfolio-transport.ts` L61–62; `investment/runtimeReadiness.ts` L113, reported as "a condition, never authority"). It gates **write routes only**; the GET route port (L456) is constructed regardless of the setting. Nothing in the read path depends on it.

### 3.5 Tests that pin `v = 1` today (impact inventory, not a change)
`ipcClient.test.ts` ("fixes the wire version…", L219; "refuses … a wrong version…", L290; 28 `v: 1` sites), `ipcContractAlignment.test.ts` (L69 `expect(IPC_PROTOCOL_VERSION).toBe(1)`, peers at L229/L283), `ipcPortAdapter.test.ts` (L618 DR-4r refusal of a non-empty contribution), `ipcPortAdapterIntegration.test.ts` (contract-v1 unix peer, L263–467 incl. the 7-missing + 3-rename matrix), `userPortfolioDirectP1Integration.test.ts` (L111 peer frames `v: IPC_PROTOCOL_VERSION`), `investment/phase1D114WireToResolverInput.test.ts` (L185 peer frames `v: IPC_PROTOCOL_VERSION`). None of these need to be *weakened*; they continue to describe v1 (§8).

---

## 4. Verified IPD v2 facts the design depends on (`4716d0bc`)

### 4.1 Dispatch
- `src/ipc/dispatch.ts` L440: `holdingsRead = envelope.v === 2 && IPC_V2_READ_OPERATIONS.includes(envelope.op)`; for such requests owner resolution is deferred into `store.readHoldingsPortfolio(op, portfolioId?)` (`portfolio_store.ts` L756–766), which resolves `resolveHoldingsReadContextInCurrentTransaction` in the same snapshot → `NATIVE_D02_READ` or `S1_D02_PERSONAL_READ`. Invalid/incomplete binding → `BindingInvalidError` → Class P zero bytes.
- L536–566: `v === 2` branch serves only list/get/revisions; v2 `create`/`save` → Class A `WRITE_NOT_AUTHORIZED` **before** any store access; any other op → Class P `UNKNOWN_OPERATION`. Response frames carry `v: 2`.
- `personalUse` (L382, `isLocalPersonalUseEnabled(env)`) is consulted **only in the v1 branch** (L596–598 `personalGet`). `getV2` (`portfolio_store.ts` L1052) = `getSnapshot` + `contributionsValidated` — identical to v1 governed `get` except rows are validated (HEX_64 `contributionId`, finite non-negative `amount`, nullable non-blank strings) and a malformed row refuses the whole read. **Therefore v2 detail is independent of `IIPS_LOCAL_PERSONAL_USE` and always carries the full contribution ledger** (confirmed by captured frames: `contribs=1` in both env modes).

### 4.2 Request grammar (`src/ipc/protocol.ts` `validateV2Envelope` L362–407)
- Envelope keys closed to `{ v, op, payload?, requestId? }`; any other key → `MALFORMED_FRAME`; any reserved authority key → `CALLER_SUPPLIED_AUTHORITY`.
- `v ∉ {1, 2}` → `PROTOCOL_VERSION_UNSUPPORTED`.
- v2 ops closed set: `portfolio.list | get | revisions | create | save` (else `UNKNOWN_OPERATION`).
- `portfolio.list` **must** have `payload === undefined` ("takes no payload in v2"); `get`/`revisions` payload must be exactly `{ portfolioId: non-blank string }`.
- Caps unchanged: request 64 KiB, response 256 KiB, scan depth 12.

### 4.3 Response bodies
Captured: v2 `portfolio.list` and `portfolio.revisions` bodies byte-identical in shape to v1; v2 `portfolio.get` identical to v1 governed `get` (same holdings, `isSaved`, `provenanceDigest`, no `durable`/`durability`, no `importEvidence`), with `contributions` as validated rows `{contributionId, amount, contributedAt, createdAt, fileName|null, sourceBroker|null, contentDigest, lineageDigest, importedAt, semantics, importId?, snapshotState?, unresolvedCount?}`.

---

## 5. Proposed change — smallest correct implementation

### 5.1 Routing rule (the only policy decision taken here)
"v2 for the Stage 5 S1→D02 **read** path, v1 for everything else" is implemented as **explicit construction-site selection**, not as a global switch and not as negotiation:

- v2: `user-portfolio-transport.ts` L456 port; `investment/sources.ts` L170 and L200 ports.
- v1 (unchanged): `user-portfolio-transport.ts` L310 (writes), `brokerImportV1SaveAdapter.ts` (both calls), `ownerBoundPortfolioCapture.ts`, every test peer not explicitly migrated.

No inspected consumer has a technical dependency that forces it off v1; therefore no v1 consumer changes (satisfies the PA/PO preservation clause).

### 5.2 `ipcClient.ts` (proposed, additive)
1. `export const IPC_PROTOCOL_VERSION_V2 = 2 as const; export type IpcProtocolVersion = 1 | 2;` — `IPC_PROTOCOL_VERSION` stays `1` (so `ipcContractAlignment.test.ts` L69 remains true).
2. `export const IPC_V2_READ_OPERATIONS: readonly IpcOperation[] = ['portfolio.list','portfolio.get','portfolio.revisions']` — a **separate** closed constant (do not alias `IPC_READ_OPERATIONS`, so that a future v1 read addition cannot silently become a v2 op).
3. `IpcRequestEnvelope.v: IpcProtocolVersion`; `IpcResponseFrame*.v: IpcProtocolVersion`.
4. `encodeRequestFrame(envelope)`: replace the L448 check with
   - `v === 1` → existing rules unchanged;
   - `v === 2` → op ∈ `IPC_V2_READ_OPERATIONS` else `UNKNOWN_OPERATION` ("outside the closed v2 read set"); if `op === 'portfolio.list'` and `'payload' in record` → `MALFORMED_ENVELOPE` ("v2 portfolio.list takes no payload"); for `get`/`revisions`, payload key set must be exactly `['portfolioId']` with a non-blank string else `MALFORMED_ENVELOPE`;
   - any other `v` → `MALFORMED_ENVELOPE` (unchanged message class).
   Check order is unchanged: authority-key scan first, closed envelope keys second, version/op third, cap last. v2 **writes are refused client-side before any socket** — this is what keeps mutation permissions unchanged on the IRR side (IPD independently refuses them with `WRITE_NOT_AUTHORIZED`).
5. `parseResponseFrame(body, expectedVersion: IpcProtocolVersion = 1)`: L502 becomes `frame.v !== expectedVersion` → `TRANSPORT_FAULT` ("response protocol version differs from the request"). Returned frames carry `v: expectedVersion`. **No acceptance of the other version, no downgrade, no retry.** OC-6 disclosed-key scan and the closed response key set are unchanged and run for both versions.
6. `IpcCallOptions.protocolVersion?: IpcProtocolVersion` (default `1`); `callIpc` sets `v: options.protocolVersion ?? IPC_PROTOCOL_VERSION` and passes the same value to `parseResponseFrame`. `IpcCallResult` shape unchanged (frames now expose the actual version).
7. `IPC_CALLER_IDENTITY_KEYS` (29 keys), `findRefusedWireKeys`, `findResponseDisclosedKeys`, size caps, Class P / outcome-unknown semantics: **untouched**.

### 5.3 `ipcPortAdapter.ts` (proposed, additive)
1. `IpcPortAdapterOptions.protocolVersion?: 1 | 2` (default `1`); expose `public readonly protocolVersion`.
2. `transport?` seam signature becomes `(op, payload?, protocolVersion?) => Promise<IpcCallResult>` — third argument optional so every existing seam user compiles unchanged.
3. `call()`: before the owner-context check, if `this.protocolVersion === 2 && !IPC_V2_READ_OPERATIONS.includes(op)` → `throw new G2Error('UPSTREAM_UNAVAILABLE', 'The v2 port admits read operations only; the call was not made.')`. Rationale: identical G2 reason to what IPD's `WRITE_NOT_AUTHORIZED` would map to (`mapClassAToG2Reason` L113), so a v2 port's write methods fail in exactly the same vocabulary whether refused locally or upstream — and never put a v2 write on the wire. Then pass `protocolVersion` to `callIpc` / `transport`.
4. `requireSuccess`, `mapClassAToG2Reason`, `mapClassPToG2Reason`, `assertScopeNotTransmitted`: **unchanged** (vocabularies are identical across versions, §3.1).
5. `toG2View`: **unchanged in this proposal** — see §6. The DR-3 durability refusal and the 7-missing-field / 3-rename matrix apply to v2 views unchanged because the bodies are shape-identical (§4.3).

### 5.4 Construction sites (proposed one-line changes)
- `user-portfolio-transport.ts` L456: `new IpcUserPortfolioPort({ precondition, env, protocolVersion: 2 })`. L310 unchanged.
- `investment/sources.ts` L170 and L200: `new IpcUserPortfolioPort({ precondition, protocolVersion: 2 })`. The `portFactory` test seam is unchanged.
- No other site changes.

### 5.5 Owner context and projection
- IRR's local precondition (`IIPS_G3_IPC_BINDING_PROVISIONED` via `ownerContextFromBinding`) stays the fail-closed gate before any v2 I/O, exactly as for v1. IRR still transmits **no** owner/tenant/principal data; the S1-authenticated / D02-authorized relationship is resolved entirely inside IPD's snapshot (§4.1). "Read historical S1-owned data without changing ownership" is therefore satisfied by construction: IRR has no field to express ownership and IPD's `readHoldingsPortfolio` exposes no owner to the dispatcher.
- Union/fallback: none. A v2 request that reaches `NATIVE_D02_READ` returns native D02 data; one that reaches `S1_D02_PERSONAL_READ` returns S1 storage; IRR cannot distinguish them and does not need to. A refused binding is Class P → `UPSTREAM_UNAVAILABLE` → HTTP 503, never a v1 retry.
- Holdings projection (`G2HoldingView`, `resolutionDisposition`, D114 identity passthrough) unchanged.

### 5.6 Error handling / fail-closed matrix (v2 port)
| Condition | Where it stops | Result (G2 → HTTP) | Same as v1? |
| --- | --- | --- | --- |
| Binding precondition not set in IRR | `call()` before I/O | `UPSTREAM_UNAVAILABLE` → 503 | yes |
| Caller-supplied authority key / tenant hint | `assertScopeNotTransmitted` / `encodeRequestFrame` | `INVALID_REQUEST` / `IpcWireAuthorityError` (never sent) | yes |
| Write method on a v2 port | `call()` (new) / `encodeRequestFrame` (new) | `UPSTREAM_UNAVAILABLE` (never sent) | n/a (new, stricter) |
| IPD binding absent/invalid, `UNKNOWN_OPERATION`, frame malformed | IPD Class P zero bytes | `UPSTREAM_UNAVAILABLE` → 503 | yes |
| Foreign / absent portfolio | IPD Class A `RESOURCE_UNAVAILABLE` | `NOT_FOUND` → 404 | yes (captured: `D02_ONLY`, `FOREIGN`) |
| Response `v` ≠ 2 | `parseResponseFrame` | `TRANSPORT_FAULT` → `UPSTREAM_UNAVAILABLE` → 503 | symmetric with v1 |
| Response discloses reserved key | OC-6 scan | `TRANSPORT_FAULT` → 503 | yes |
| Empty holdings (`holdings: []`, `holdingsCount: 0`) | passes `toG2View` | 200 with empty list; providers yield `[]` observations | yes |
| Non-empty `contributions` in v2 detail | `toG2View` DR-4r (L493) | `UPSTREAM_UNAVAILABLE` → 503 | **yes — and this is B-1 (§6)** |

### 5.7 Things that must NOT change (explicit)
`IPC_PROTOCOL_VERSION` value; the 29-key reserved list; response disclosed-key scan; `IPC_WRITE_OPERATIONS`; the personal write routes and their `IIPS_LOCAL_PERSONAL_USE` gate; `brokerImportV1SaveAdapter`; `ownerBoundPortfolioCapture` (its recording wrapper at L288 refuses any op outside `IPC_READ_OPERATIONS` and documents itself as the v1 operator capture; migrating it is a separate W11 decision, not a Stage 5 dependency); `G2_LINEAGE`, `G2_CONTRACT_VERSION`; the npm pin (§7); IPD.

---

## 6. B-1 — the v2 `portfolio.get` contributions rule (genuine unresolved decision)

**Verified conflict.** IPD v2 detail: `contributions` = validated non-empty ledger rows, always (§4.1, frames). IRR `toG2View`: non-empty `contributions` → refuse (§3.2). Consequence if §5 is implemented verbatim: the Stage 5 GET `detail` route, `createHoldingsProvider` and `createPortfolioHoldingsProvider` return 503 for **every portfolio that has at least one committed contribution — i.e. every real portfolio** (the INITIAL revision writes one row: captured `contribs=1` on a freshly created `SHARED`). This would be a regression relative to today's v1 + IPD `IIPS_LOCAL_PERSONAL_USE=1` configuration (captured: 200). `list` and `revisions` are unaffected.

**Why no honest in-scope mapping exists.** `G2Contribution` (`userPortfolioContract.ts` L305) requires non-null `fileName`, `sourceBroker` and a per-batch `holdingsCount`/`totalMarketValue`; IPD rows carry `fileName|null`, `sourceBroker|null`, `amount` and no per-batch holdings count. IPD's own `personalGet` comment (`dispatch.ts` L158–162) records the same conclusion. Coercing nulls, defaulting counts, dropping rows or substituting `[]` are each explicitly forbidden by the DR-4r comment at L493–495.

**Options (decision needed; owner in brackets):**

| Option | Change | Owner | In current scope? | Assessment |
| --- | --- | --- | --- | --- |
| R-1 Additive IRR read-only field | On the v2 path only, `toG2View` validates each row against the IPD v2 validated shape (closed key set, HEX_64 id, finite `amount`, nullable non-blank strings — mirror of `contributionsValidated`) and carries them on a **new** G2 field (e.g. `contributionLedger`), leaving `contributions: []`-only semantics for v1 untouched and refusing any row outside the shape | IRR, PA/PO approval of a DR-4r scope extension | **No** (IRR G2 contract additive change; precedent: `resolutionDisposition` additive mirror 2026-11-10) | Recommended. Smallest honest change; nothing synthesized; v1 unchanged; fail-closed on malformed rows preserved. |
| R-2 IPD personal projection on v2 | `getV2` honours `IIPS_LOCAL_PERSONAL_USE` like v1 (`contributions: []` + `importEvidence`) | IPD | **No** (IPD change) | Re-couples v2 reads to IPD env; contradicts D03's "validated nullable projection" intent; not recommended. |
| R-3 v2 for list/revisions only, v1 for detail | Mixed-version read route | IRR | Yes technically | Defeats the purpose: F-1 shows the S1→D02 relationship is only on v2, so detail/holdings would not exercise it. Rejected. |
| R-4 Implement §5 verbatim and accept 503 on detail | — | IRR | Yes | Not acceptable as a Stage 5 path; recorded only to show the consequence. |

**Interaction with item (10) of the task (IPD `IIPS_LOCAL_PERSONAL_USE=1` precondition).** Under v2 the precondition disappears for **reads** (v2 ignores it, §4.1): the Stage 5 read path no longer depends on an IPD-side environment setting, which strengthens rather than weakens the safeguard posture (one fewer runtime condition that could be set to widen behaviour). The IRR-side setting continues to gate **writes only** and is untouched. B-1 is therefore not an environment problem; it is a projection-rule problem to be decided once, independent of host configuration.

---

## 7. Pin implications (no action in this proposal)

- The v2 read path **does not require** advancing the pin: the IPC client is hand-written and imports nothing from the pinned packages (§3.1). Wire compatibility is a runtime-host property verified against the IPD service build, not against the npm dependency.
- The exact later pin action, when separately authorized, is: `frontend/package.json` L32 `iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be` → `#4716d0bc…`; `frontend/package-lock.json` the matching `resolved` entry (`git+ssh://git@github.com/ramkivs/iips-production-market-data.git#…`) plus `node_modules/.package-lock.json` regenerated by `npm ci`; `.ci/verify-ipd-pins.mjs` L16. The two sibling pins (`iips-broker-import#12a3d625`, `iips-np04-governed-persistence#2e11fa3b`) are separate decisions (`12a3d625` is an ancestor of `main`; `2e11fa3b` lives on `np04-governed-persistence-windows`, not on `main`).
- Risk to note for that later action: between `1ce6a829` and `4716d0bc` IPD's `package.json` gained `prebuild`/`prepare` steps calling `scripts/clean-dist.mjs` and `src/contracts/broker_import_ipc.ts` grew by 249 lines; an IRR `npm ci` against the new pin will execute the new `prepare` script and may surface package-consumer differences unrelated to IPC v2. Out of scope here; listed so the pin advance is not mistaken for a trivial edit.

---

## 8. Targeted tests (to be written when implementation is authorized)

### 8.1 New / extended unit tests
| Test | File | Asserts |
| --- | --- | --- |
| v2 encode admits exactly list/get/revisions; refuses create/save/reset/delete/importBroker/analytics with `UNKNOWN_OPERATION` before encoding | `ipcClient.test.ts` | §5.2 (4) |
| v2 `portfolio.list` with any `payload` (even `{}`) → `MALFORMED_ENVELOPE`; v2 `get`/`revisions` payload ≠ exactly `{portfolioId}` → `MALFORMED_ENVELOPE` | `ipcClient.test.ts` | IPD grammar mirror |
| authority-key scan still runs first under v2 (same 29 keys) | `ipcClient.test.ts` | OC-7 preserved |
| `parseResponseFrame(body, 2)` refuses `v: 1`; `parseResponseFrame(body, 1)` refuses `v: 2` (symmetry; no fallback) | `ipcClient.test.ts` | §5.2 (5) |
| `callIpc` default is still `v: 1` byte-for-byte (snapshot of the encoded frame) | `ipcClient.test.ts` | v1 preservation |
| v2 port: `createPortfolio`/`saveHoldings`/`resetPortfolio`/`deletePortfolio` throw `UPSTREAM_UNAVAILABLE` with **zero** transport invocations | `ipcPortAdapter.test.ts` | §5.3 (3) |
| v2 port threads `protocolVersion` to the transport seam; v1 port passes `1`/undefined | `ipcPortAdapter.test.ts` | seam compatibility |
| `ipcContractAlignment.test.ts`: add `expect(IPC_PROTOCOL_VERSION_V2).toBe(2)` and `IPC_V2_READ_OPERATIONS` closed-set pin; keep L69 unchanged | | constants |

### 8.2 Integration (real framing, synthetic peer — existing harness style)
- Extend `ipcPortAdapterIntegration.test.ts` with a peer that echoes the request `v` and serves the captured v2 bodies: list/get/revisions map through a v2 port; a peer answering `v: 1` to a v2 request → `UPSTREAM_UNAVAILABLE`; 7-missing + 3-rename matrix re-run once on a v2 view (bodies identical, so the matrix is the same data).
- `user-portfolio-transport.test.ts`: GET list/detail/revisions through a v2 `portFactory`; PUT holdings still 503 `operation-not-admitted` with IRR personal-use off and still v1 with it on.
- `investment` providers: `createHoldingsProvider` / `createPortfolioHoldingsProvider` with a recording `portFactory` prove `protocolVersion === 2` and no write method invoked.
- Existing v1 tests (§3.5): **no edits** except where a test asserted the exact *message* "only wire protocol version 1 may be sent" (L290 family) — the message changes shape; the refusal and code stay.

### 8.3 Tests for B-1 (only after a decision)
R-1 would add: row-shape validation (closed keys; `fileName: null` admitted; `fileName: ''` refused; non-HEX id refused; negative `amount` refused), and a snapshot proving the G2 view under v1 is byte-identical to today.

---

## 9. Verification with the real IPD dispatcher + store (planned, not run)

Re-use `docs/integration/artifacts/iid-s5-real-ipd-consumer-probe-2026-11-21.mts` in the `/tmp/harness` layout (IPD `dist/` at `4716d0bc`, `tsx --test`, `node:sqlite`), adding a `protocolVersion: 2` port in the "IRR consumer" block and leaving the v1 block as the control:

1. v2 list/revisions through `IpcUserPortfolioPort` → bodies equal the already-captured v2 frames (frame-level `deepEqual` against the JSON artifact, so the earlier capture is reused rather than re-derived).
2. v2 detail → expected outcome depends on B-1: today `UPSTREAM_UNAVAILABLE` (DR-4r). Record it as such; do not mask.
3. `D02_ONLY` / `FOREIGN` under v2 → `NOT_FOUND` (Class A `RESOURCE_UNAVAILABLE`), matching captured v1.
4. Binding components deliberately mismatched (one of the five S1 components altered) → zero bytes → `UPSTREAM_UNAVAILABLE`; confirms Class P on `BindingInvalidError` as seen from IRR.
5. v2 port write methods → zero frames on the socket (recorder count 0).
6. Run with IPD env `{}` and `IIPS_LOCAL_PERSONAL_USE=1` → identical v2 results (proves independence from the env precondition).
7. Reserved-key scan: all v2 frames 0/29 (expected from capture).

This is **test-level evidence against the real dispatcher and store**, not live-runtime evidence.

---

## 10. Evidence required before a controlled Windows host verification can even be scheduled

1. B-1 decision recorded (PA/PO) and, if R-1, its implementation merged with §8.3 tests.
2. §5 implementation merged to IRR `main` with §8.1–8.2 green (full `npm test`, baseline 262 → 262 + new).
3. §9 harness run recorded as an evidence document on the owning repo (IRR) with frame captures, in the same style as `d22f156`.
4. IPD service build identity (`dist/` hashes recorded in `d22f156` §3) matched against the host-installed service, by an operator.
5. IPD binding state on the host: all five S1 components present (operator-owned; IRR cannot inspect it).
6. A statement of which Stage 5 routes are in scope for the host run (GET list/detail/revisions, holdings identity) and that no write route is exercised.
None of items 4–6 is IRR code; items 1–3 are prerequisites, not acceptance.

---

## 11. Risks and unresolved assumptions

| ID | Item | Type | Consequence if wrong |
| --- | --- | --- | --- |
| B-1 | v2 detail contributions vs DR-4r | **Blocker** (decision) | Stage 5 detail/holdings 503 under v2 |
| A-1 | IPD will not add keys to v2 success frames beyond `[v,ok,op,requestId,result]` | assumption from `4716d0bc` source + capture | closed-key check would refuse → 503, fail-closed (safe) |
| A-2 | The IPD service deployed on the host is built from `4716d0bc` (or a descendant that preserves `validateV2Envelope`) | operator-verified later | `PROTOCOL_VERSION_UNSUPPORTED` Class P → 503 (safe) |
| A-3 | The five S1 binding components are present on the host | operator | Class P → 503 (safe); IRR cannot detect which component is missing — no diagnostic widening is proposed |
| A-4 | `ownerBoundPortfolioCapture` remaining v1 is acceptable for W11 | separate decision | none for Stage 5 |
| R-a | Mixed versions on one host (writes v1, reads v2) | design | intentional; both branches are in one dispatcher; no shared state between branches except the store |
| R-b | Message-text changes in `encodeRequestFrame` refusals break tests asserting exact strings | implementation | fix tests, not messages |
| R-c | Later pin advance pulls new `prepare` scripts (§7) | later work | unrelated CI breakage mis-attributed to v2 |

---

## 12. Acceptance criteria for the implementation (when authorized)

1. `git grep "v: 1"`-equivalent evidence: default `callIpc` frame unchanged byte-for-byte; all §3.5 tests pass without weakening.
2. Under `protocolVersion: 2`, exactly three ops can be encoded; every other op refused before any socket; proven by test.
3. Response version must equal request version in both directions; proven by test.
4. OC-6/OC-7 scans run under v2 with the same 29-key list; proven by test.
5. Stage 5 GET list/revisions and both holdings providers issue `v: 2` and nothing else; write routes and `brokerImportV1SaveAdapter` issue `v: 1`; proven by recording seams.
6. §9 harness: items 1, 3–7 as stated; item 2 per B-1 decision.
7. No change to `IPC_PROTOCOL_VERSION`, reserved keys, `IPC_WRITE_OPERATIONS`, personal-use write gate, pins, IPD.

---

## 13. Decision table

| Work item | Category | Owner | Existing implementation / evidence | Proposed change | Verification required | Remaining dependency |
| --- | --- | --- | --- | --- | --- | --- |
| W-01 Wire version constants and types | IRR code (additive) | IRR | `IPC_PROTOCOL_VERSION = 1` L65; `v: 1` types L420/472/480 | add `IPC_PROTOCOL_VERSION_V2 = 2`, `IpcProtocolVersion`, `IPC_V2_READ_OPERATIONS`; widen `v` types | `ipcContractAlignment.test.ts` pins both constants; L69 unchanged | none |
| W-02 Request encoding under v2 | IRR code | IRR | `encodeRequestFrame` L433–467 (version pin L448) | version-conditional op set + v2 payload grammar (list: no payload; get/revisions: exactly `{portfolioId}`); v2 writes refused pre-socket | §8.1 rows 1–3, 5 | none |
| W-03 Response parsing under v2 | IRR code | IRR | `parseResponseFrame` L497–546 (pin L502) | `expectedVersion` parameter; equality required; no fallback | §8.1 row 4; §8.2 peer answering wrong version | none |
| W-04 `callIpc` option | IRR code | IRR | `IpcCallOptions` L578–582; envelope L598–603 | `protocolVersion?` default 1 threaded to encode+parse | §8.1 row 5 snapshot | none |
| W-05 Port adapter option + write guard | IRR code | IRR | `IpcPortAdapterOptions` L197–214; `call()` L361–390 | `protocolVersion?`; v2 port refuses non-read ops before I/O; seam gains optional 3rd arg | §8.1 rows 6–7 | none |
| W-06 Stage 5 read port construction | IRR code (3 lines) | IRR | `user-portfolio-transport.ts` L456; `sources.ts` L170, L200 | `protocolVersion: 2` | §8.2 transport + provider recording seams | W-01..W-05 |
| W-07 v1 consumers preserved | IRR (no change) | IRR | L310 writes; `brokerImportV1SaveAdapter` L154/L262; `ownerBoundPortfolioCapture` L288/L795; `d22f156` probe v1 6/6 | none | existing suites unchanged; §9 v1 control block | none |
| W-08 v2 detail contributions projection | Rule decision | **BOTH** (PA/PO decide; IRR implements if R-1) | `toG2View` L493–499 refuses; IPD `getV2` L1052 always emits validated rows; frames show `contribs=1` both env modes | R-1 recommended (additive G2 read-only field, v2 path only, validated mirror, nothing synthesized) | §8.3; §9 item 2 | **B-1 — blocker for detail/holdings** |
| W-09 Owner context / projection semantics | IRR (no change) | IRR | `ownerContextFromBinding` gate; scope never transmitted; IPD snapshot resolution (`readHoldingsPortfolio`) | none | §9 items 3–4 | A-3 host binding |
| W-10 Fail-closed / error matrix | IRR (no change beyond W-02/03/05) | IRR | Class A/P mapping L99–120, L397–420; HTTP mapping transport L477–492 | none | §5.6 matrix rows via §8.2 | none |
| W-11 IPD `IIPS_LOCAL_PERSONAL_USE` precondition | Runtime condition | operator (IPD env) / IRR (write gate) | v1 detail requires it for 200 (F-2); v2 ignores it (§4.1) | none; v2 removes the read-side dependency; IRR write gate untouched | §9 item 6 (both env modes identical) | B-1 (the remaining 503 cause is DR-4r, not env) |
| W-12 Pin `1ce6a829` → `4716d0bc` | Dependency | IRR | `package.json` L32, lock (3 entries), `.ci/verify-ipd-pins.mjs` L16; IPC client imports no pinned package | **none now**; exact later edit in §7 | `node .ci/verify-ipd-pins.mjs`, `npm ci` with new `prepare` script, full suite | separate authorization; R-c |
| W-13 Real-dispatcher verification | Evidence | IRR | probe `.mts` + 12 frames (`d22f156`) | add v2 block to the same harness; reuse captured frames as expected values | §9 | W-01..W-06; W-08 for item 2 |
| W-14 Host verification prerequisites | Evidence / operations | operator + IRR | `d22f156` §3 dist hashes | none here | §10 items 1–6 | all of the above; **not started** |

---

## 14. Conclusions

1. **Is v2 adoption implementable within the current scope?** For `portfolio.list` and `portfolio.revisions`: yes, fully, with additive changes to two IRR files plus three construction-site lines, and no change to IPC contract, IPD, pins or mutation permissions. For `portfolio.get` (and both holdings providers that depend on it): the wire/parsing side is implementable identically, but the resulting view is refused by IRR's own DR-4r rule for every real portfolio — a rule decision (B-1) is required before the detail path is usable under v2.
2. **Exact implementation boundary.** `frontend/server/user-portfolio/ipcClient.ts` (constants, `encodeRequestFrame`, `parseResponseFrame`, `callIpc` option), `frontend/server/user-portfolio/ipcPortAdapter.ts` (option, write guard, seam arg), `frontend/server/user-portfolio-transport.ts` L456, `frontend/server/investment/sources.ts` L170/L200, plus tests in §8. Nothing else.
3. **Is v1 compatibility preserved?** Yes by construction: `IPC_PROTOCOL_VERSION` stays 1, the default path is unchanged byte-for-byte, and no inspected consumer has a technical dependency forcing migration; the write routes, `brokerImportV1SaveAdapter` and the W11 capture remain v1.
4. **Exact later pin action.** None required for v2 reads. When separately authorized: `frontend/package.json` L32, the matching `package-lock.json` `resolved` entry (regenerate `node_modules/.package-lock.json` via `npm ci`), `.ci/verify-ipd-pins.mjs` L16 — `1ce6a829a7ce65550356a0071c108a60f2d813be` → `4716d0bc…`, then `node .ci/verify-ipd-pins.mjs` and the full suite, with §7's `prepare`-script risk noted.
5. **Targeted tests and acceptance evidence.** §8.1–8.2 (unit + synthetic-peer integration over real framing), §9 (real IPD dispatcher + store, reusing the `d22f156` harness and captured frames as expected values), recorded as an evidence document on IRR. §10 lists what must exist before a host run can be scheduled.
6. **Genuine blockers.** One: **B-1** (v2 detail contributions vs DR-4r), requiring a PA/PO decision among R-1 (recommended, IRR additive read-only field with validated mirror) / R-2 (IPD change) / R-3 / R-4. Everything else is implementation work with no pending decision. No Stage 5 acceptance or host readiness is claimed.
