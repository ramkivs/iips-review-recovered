# CAP-03 — PF-15 Authority Determination and Independent S3/QE Readiness Reconciliation (`2026-10-26`)

> ## DISPOSITION: PF-15 **REMAINS NOT DESIGNATED — A PRECISE PA RESPONSE IS REQUIRED**.
>
> The existing standing authority authorizes preparation and decisions only within the values and
> scope actually established by governing acts. It does not supply an IPC endpoint string or a
> local-state path. The governing CAP-03 records reserve those operational values to a specific
> Program Authority option A/B act. No such value-bearing act exists in either current mainline.
> The exact endpoint and, for option B, local-state path cannot be inferred without inventing an
> operational fact. This record therefore resolves the authority question, republishes the precise
> PA response instrument by reference, and records PF-15 as awaiting that PA act; it does not
> designate a value or claim effectiveness.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-PF15-AUTHORITY-READINESS-RECONCILIATION-2026-10-26-01` |
| Record type | Authority-boundary determination, PA decision-packet routing, and host-independent readiness audit; **not** an authority act, designation, execution receipt, qualification, acceptance, or admission |
| Recorded (UTC) | `2026-10-26` |
| IRR baseline | `ramkivs/iips-review-recovered` `main@3cd61bcec11beaa96fafa351f8ca557bbfd41b22`, tree `0ff4e15c4cee0c9fbb48d3dfb659caacee7cb860` |
| IPD baseline | `ramkivs/iips-production-market-data` `main@f5eddbc20b944a098a9060a8e3349c6d10b7843e`, tree `5c93f1d1e6c4919fa632ff107569ac955f5e052e` (read-only; zero IPD writes) |
| S2 designated pin | IPD `8eec74ae27cda09f3c368b9c299895eae41554db`, tree `4eba29029f8d95cfe483e615a7047426b298ce50`; preserved unchanged |
| Governing tracker allocation | Master tracker §16.129; `CV-CORR-109`; `CHG-2026-10-26-05`; verification rows `V779`–`V787` |
| Evidence | `evidence/integration/cap03-pf15-readiness-reconciliation-2026-10-26/` |

## 1. Baseline and authority determination

The remote IRR and IPD `main` refs were read directly from GitHub after fetching IRR `origin/main`.
The governing baseline includes the CAP-03 S2 runbook and current host blocker, PF-01…PF-17 S3
preflight, the S3/QE readiness matrix, H-12 R5 manifest and its effective adoption act, and the
existing PF-15 decision request. Remote `main` CI was successful for both baselines at this check:
IRR run `40280401460` at `3cd61bce…`; IPD run `40230772869` at `f5eddbc…`. The source and tree
identities, run IDs, and content-integrity results are retained in the evidence folder and tracker.

The authority sources agree on the following:

1. The PF-15 request, `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-DECISION-REQUEST-2026-10-26-01`, is explicitly **PROPOSED — NOT EFFECTIVE** and reports an exhaustive negative authority search. It supplies no endpoint or state-directory candidate.
2. CAP-03 PA decision packet DQ-5 reserves endpoint/local-state naming to a separate PA option A/B determination. The effective DQ-5 confirmation established host/operator logistics and the P-1 store-path *selection process*; it did not render an endpoint or local-state value.
3. H-12 R5 adoption and the IPD host-readiness packet both leave PF-15 **NOT DESIGNATED**. Technical resolver compatibility is not value-selection authority.
4. The standing grant is not evidence of a particular value. No source-verified operational endpoint or `IIPS_G3_LOCAL_STATE_DIR` exists in the inspected governing records. Selecting either exact string here would violate the explicit no-invention rule.

**Conclusion:** The current instruction authorizes completing and publishing this reconciliation and the PA response packet. It does not identify an exact operational endpoint or state directory, nor does the standing record itself select one. PF-15 therefore remains **awaiting Program Authority**. It becomes effective only when a PA designation record is rendered with the required exact values and is published/read back in the governing locus. Do not treat this packet or the existing request as that act.

### 1.1 Precise PA response required (all seven contents)

The existing decision request is the decision packet; this reconciliation makes the exact response
contents explicit for PA disposition. The PA must choose one of the already-presented options and
supply/confirm the facts below. There are no candidate strings in this record.

| # | Required PA response content | Existing constraint / permissible response |
|---|---|---|
| 1 | Endpoint form and exact `IIPS_G2_IPC_ENDPOINT` value | Option A: absolute Windows named-pipe path under `\\.\pipe\`; or option B: bare endpoint name matching `[A-Za-z0-9._-]+`, with no `..`. Exact string must be PA-supplied, verbatim. URLs, `host:port`, relative paths, and inferred defaults are invalid. |
| 2 | `IIPS_G3_LOCAL_STATE_DIR`, if option B or otherwise required | Exact absolute path must be PA-supplied and meet local fixed-NTFS, outside-worktree, non-synced, non-elevated-writable requirements. Option A does not require a state directory for endpoint resolution. |
| 3 | Relation to `IIPS_G3_DATABASE_PATH` / P-1 store | State explicitly that the server opens the single P-1-provisioned store, or defer the database path entirely to the P-1 record. Do not preselect or create a store path. |
| 4 | Evidence treatment | Specify verbatim recording and QE deposit treatment for the rendered values and on-host pipe existence, default DACL observation, collision refusal, one-connection cap, same-host-only refusal, and clean-shutdown disappearance. |
| 5 | Relation to external evidence root | State that exact endpoint/state/database path values are recorded in `MANIFEST.json`; host path values are operational facts, not credentials. No credentials or real portfolio data may enter the deposit. |
| 6 | Host verification instructions | Require QE evidence for first-instance collision fail-closed behavior, default DACL, one-connection capacity, no network target, clean-shutdown disappearance, and per-call client configuration resolution. Windows behavior requires designated-host evidence. |
| 7 | Locus and effectiveness | Render as a distinct PA act, publish in IRR through the normal PR/green exact-head CI/merge/post-merge CI/independent remote read-back process. State effective only after the authorized act is recorded and read back; later value changes require a new act and drift is STOP. |

**Available options, unchanged from the decision request:** (A) absolute named pipe; no local-state
setting required for endpoint resolution; or (B) bare endpoint name plus an absolute designated
local-state directory. Both resolver forms already exist; neither is preferred or selected by this
reconciliation. The PA response must include the seven contents above and may not delegate value
inference to the operator or agent.

## 2. Sequence and preserved boundaries

The required sequence remains **`S2 passes → single bounded P-1 succeeds → PF-15 effective → S3 →
QE-1…QE-11 → separate applicable acceptance acts`**. The governance question is not mechanically
dependent on S2; however, the designation cannot make S3 executable before S2/P-1. S2 itself needs
no endpoint, store path, PF-15 designation, write flag, or P-1 consumption.

No S2 or P-1 attempt is made here. No endpoint is opened; no store or local-state directory is
created; no write fence is lifted; no IPD file/ref is changed. QE remains **NOT RUN, 0/11** until
native-Windows evidence exists. All user-portfolio write-denial behavior and the twelve `503`
fences remain in force; no production eligibility or acceptance is claimed.

## 3. Independent S3/QE readiness audit

Host-independent audit results are in `evidence/integration/cap03-pf15-readiness-reconciliation-2026-10-26/03-readiness-audit.json`.

- The S3 procedure and every preflight row **PF-01…PF-17** were checked for coverage. PF-15 is the explicit outstanding designation gate; PF-01…PF-14 and PF-16…PF-17 require the specified host/runtime, path, authority and one-use P-1 evidence. The exact criteria and run sequence are in the existing matrix and operator runbook; no host preflight is claimed here.
- The QE matrix covers **QE-1…QE-11**, preserves each item’s evidence ceiling while W-1 refuses writes, and keeps every QE item `NOT RUN`. Tier 1 uses the real IPC endpoint/dispatcher with fences on; Tier 2 uses disposable store copies; Tier 3 exercises session-port identity refusal.
- Q11 digest bookends remain mandatory: capture `Q11-BEFORE.json` before the first item and `Q11-AFTER.json` after the last. Any drift/missing/unverified entry is `INVALID`; raw bytes are hashed without normalization.
- QE-9 requires **N ≥ 10 cold and N ≥ 10 warm** C5.1 measurements, with class-correct refusal outcomes and zero store effect. POSIX/CI results cannot establish native-Windows pipe/DACL behavior or any QE credit.
- Evidence classifications remain exactly `PASS`, `FAIL`, `INCONCLUSIVE`, `NOT EXECUTED — <reason>`, and `INVALID`. Limitation findings are not passes. QE-4, QE-8 and QE-10 ceilings remain explicit; QE-11’s acceptance limb requires its separate Gate C act.
- The adopted H-12 R5 identity was re-hashed and its manifest parsed: SHA-256 `d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76`; manifest blob `f4649e36a81c7013287810cd3202b99586dbd951`; adoption act is already effective. H-12 adoption does not equal QE execution or acceptance.

The repository’s independent host-side validation battery (`typecheck`, strict replay-server
`typecheck`, guarded full tests and non-zero test-count assertion, and production build) passed on
the IRR baseline. These are **IRR repository CI checks only**, not S2, S3, host evidence, or QE
credit. The first `npm ci` attempt failed TLS verification against the sandbox-intercepted GitHub
certificate; retry used the sandbox-provided CA via `NODE_EXTRA_CA_CERTS` (no TLS verification
disabled, lockfile or manifest changed). The successful verification completed **106 test files /
1,350 tests, zero failures**.

## 4. Host-specific checks still required

Every native-Windows check remains outstanding: PF-01 host identity; PF-02 OS edition; PF-03
non-elevated operator/account SID; PF-04 Windows platform and approved Node range; PF-05 flag-free
`node:sqlite` and full warning capture; PF-06 runtime path/no switch; PF-07 exact clean full-history
IPD commit/tree; PF-08 exact clean full-history IRR consumer pin; PF-09 non-shallow history; PF-10
absence of enabling flags; PF-11…PF-14 store/evidence path and filesystem characteristics; PF-15
effective endpoint/state act read verbatim; PF-16 exact authority/pins/digests; PF-17 unspent
single-use P-1 receipt. In addition, S2’s five canonical commands must pass on `desktop-no0nhtp`
with raw evidence outside all worktrees before P-1; P-1 then has one bounded attempt only. No
alternate host, Linux execution, retry, or substitute transcript is authorized.

Windows-only QE evidence includes actual named-pipe behavior, default DACL observation, collision
refusal, one-connection cap, same-host-only refusal, clean-shutdown disappearance, and all accepted
host executions at the adopted pins. QE-9 cold/warm timing and zero-effect proof, Q11 digests, and
every item's applicable raw evidence must be captured on the designated host. Separate Gate C,
result-acceptance, Gate 5/admission and write-authority decisions remain separate.

## 5. Next executable action and non-grants

**Current S2 blocker:** designated workstation `desktop-no0nhtp` is unavailable from this Linux
sandbox. Fresh environment identification is Linux `e2b.local`, Debian 12, Node `v22.22.3`,
`process.platform=linux`; Windows shells are absent and the host name does not resolve. The S2
sequence was not dispatched here. Operator Ramki must physically/directly access the designated
host in the normal non-elevated Windows account and follow
`IIPS-V3-CAP03-S2-OPERATOR-RUNBOOK-2026-10-26-01`, using the exact IPD pin/tree and external raw
evidence root. Stop on any failed precondition or command; no retry without fresh authority.

This record changes no source, test, package, lockfile, pin, manifest, route, fence, store, endpoint,
local-state value, or IPD artifact. It grants no provisioning, endpoint opening, S3/QE execution,
acceptance, admission, write, or production authority.

*End of `IIPS-V3-CAP03-PF15-AUTHORITY-READINESS-RECONCILIATION-2026-10-26-01` — PF-15 remains NOT DESIGNATED and awaiting the exact PA act; S2 NOT EXECUTED; P-1 unspent; S3 NOT REACHED; QE 0/11.*
