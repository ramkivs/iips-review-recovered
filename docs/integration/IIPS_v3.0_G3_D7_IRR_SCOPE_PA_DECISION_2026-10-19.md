# IIPS v3.0 — G3-D7 IRR Consumer Scope
## Program Authority decision record

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-G3-D7-IRR-SCOPE-PA-DECISION-2026-10-19-01` |
| Decision | `G3-D7` — IRR-side consumer scope, in the IRR capacity |
| Program Authority | Ramki, single owner/user and PA; this line is decided in the IRR capacity |
| Decision date | 2026-10-19 (UTC) |
| PA disposition | **`ACCEPT WITH CHANGES` — APPROVED** |
| Decision source | Direct PA instruction in the execution request for this work; this is a PA decision, not an Arena recommendation |
| Governing request | IPD `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`, §5.1/§6/§9, blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0` |
| IRR baseline inspected | `main` at `f9a9c006230d4bfb6ab68f358eb330e2af53c838` |
| IPD basis inspected | `main` at `be32d8c95a86b3f03bd382ccde5b6398efb351c6` |

## 1. Rendered decision

> **G3-D7 — `ACCEPT WITH CHANGES` — APPROVED.** Authorize only a minimal, additive, explicitly versioned IRR consumer of the IPD-owned portfolio capability, subject to the exact bounded scope and safeguards below. IRR is a governed consumer, not the persistence owner. The certified IRR reference portfolio, scoring and analytics integrations remain outside scope.

This is an IRR-capacity scope decision. It is not a Gate 3 implementation act, an IPD write grant, a Gate 4 result, a Gate 5 admission, or a 503-lift decision.

## 2. Exact bounded changes

### 2.1 C8 remediation — IRR-owned and still not met

The accepted change is limited to the owner-scoped transport/configuration posture required by the request:

- `frontend/server/executive-transport.ts`: remediate the owner-scoped surface from the inspected non-loopback/wildcard-CORS posture to the required loopback-only, no-wildcard-CORS posture;
- `frontend/vite.config.ts`: remove the non-loopback development binding from the owner-scoped path and preserve the preview/host boundary required by the accepted C8 contract; and
- the existing fence files remain protected and are not a route-admission shortcut: `frontend/server/owner-context-unavailable.ts` and `frontend/server/user-portfolio-transport.ts` remain byte-stable until the later Gate 5 admission decision.

Current evidence remains **C8 — NOT MET**. The source/configuration findings at the inspected IRR head are the evidence baseline; this decision does not claim that the remediation has been performed or accepted. No browser, localhost, Windows host or deployment test was run.

### 2.2 Exact bounded IPC client/adapter set

The current request requires an IPC client adapter that re-enforces OC-7/C7 before sending, supplies no principal/owner/tenant/portfolio-scope authority, maps refusals without mutation, and never automatically retries a write. The exact IRR-side bounded set carried forward from the accepted IRR-side Gate B scope is:

**New/changed implementation set (IRR only):**

- `frontend/server/user-portfolio/ipcClient.ts` — same-host IPC framing, caps, timeouts, no authority/scope fields;
- `frontend/server/user-portfolio/ownerContextFromBinding.ts` — binding-sourced owner context with fail-closed tenant hint;
- `frontend/server/user-portfolio/ipcPortAdapter.ts` — existing port-contract adapter and refusal mapping with no mutation on refusal;
- `frontend/server/user-portfolio/firstPartySignal.ts` — C9 cross-site hardening only, never authentication;
- `frontend/server/user-portfolio/ipcClient.test.ts`;
- `frontend/server/user-portfolio/ownerContextFromBinding.test.ts`;
- `frontend/server/user-portfolio/ipcPortAdapter.test.ts`; and
- `frontend/server/user-portfolio/fenceUnchanged.test.ts`.

This names the IRR consumer set; it does not authorize implementation on the current branch. The IPD endpoint/store remains IPD-owned. No TCP/HTTP/URL listener, credential, browser identity, caller-supplied owner, tenant field, scope field, second store, cache of record, fallback surface, or write retry is included.

### 2.3 Contract-version change

The exact existing IRR contract seam is:

- `frontend/server/user-portfolio/userPortfolioContract.ts`;
- current `G2_CONTRACT_VERSION = '2'` (source blob `0dec72eb…` in the request); and
- the IPC-path revision is additive and explicitly versioned, with no silent numeric bump invented by this record.

The accepted consumer contract's IPC path supersedes the historical HTTP wire description only on acceptance of the realized contract. That acceptance has not happened. The contract revision must preserve the existing authority-key refusal and no-identity/scope-wire rules; it must not invent new schema fields or APIs.

### 2.4 Capacity and route fence

- This D7 decision is within IRR capacity for the consumer surface. It does not grant IPD implementation authority or change IPD's ownership boundary.
- **All** `/api/user-portfolios*` routes remain HTTP `503 owner-context-unavailable` until a separate Gate 5 admission act names qualified commits and lifts the fence for named operations.
- The `GET`/`HEAD …/context` route maps to no v1 portfolio operation.
- No user-owned scoring/analytics integration is added. `portfolio.analytics` remains reserved/refused as specified by the accepted contract.
- The UI certified reference portfolio remains unchanged and must not be repurposed as user-owned persistence.

## 3. Exact exclusions and required tests

The D7 consumer may not modify the IPD identity authority, IPD-owned durable boundary, certified reference portfolio, UI session store, `PortfolioStorePort`, or `SESSION_ONLY` labeling. It may not lift the 503, claim durable success, or introduce authentication/multi-user/enterprise behavior.

The named IRR tests must cover framing/caps/timeouts, no authority fields on the wire, binding-derived context and fail-closed hint, refusal/no mutation, C9 hardening, and byte-unchanged 503 fences. The current request's T-J requirement also remains: all six route paths/twelve route-method pairs return 503 and the boundary does not call the port. CI evidence is implementation evidence only, not Gate 4 or Gate 5 evidence.

## 4. Explicit non-effects

No IRR code, CORS setting, listener, route, contract, endpoint, store, dependency or configuration was changed by rendering this decision. C8 is **NOT MET**. The IRR HTTP `503` fence remains. Gate 3 is not granted by this record; Gate A′, Gate 4, separate result acceptance and Gate 5 remain independent. IRR PR #114 is untouched.

The 51-row capability baseline and 13-item inventory remain unchanged.

*Rendered as the PA's IRR-capacity scope decision; implementation and admission remain separately governed.*
