# MoSPI live verification results — operator-transferred Windows evidence (2026-10-15)

| Field | Value |
|---|---|
| Record | `MOSPI-LIVE-VERIFICATION-RESULTS-01` |
| Date recorded | `2026-10-15` (UTC) |
| Evidence class | **Operator-transferred external evidence.** Captured on the operator's Windows machine and reproduced in the session handoff. Arena did **not** open, copy or re-run the Windows capture files; nothing in this record was observed from Arena. |
| Verified execution domain | Windows working copy `E:\IIPS-MAIN-20261013\iips-review-recovered`; script `verify_live_mospi_cpi_iip.ps1` (isolated port `8788`) |
| Arena domain | Arena cannot reach the provider (egress resets the socket before the TLS handshake) and cannot read the Windows filesystem, so no live claim is made from Arena. |
| Governing record | Tracker `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.29 (`CV-CORR-17`) |
| Reconciliation step already executed | The five Arena files were hash-verified against the manifest below **before** being copied into the Windows tree, so the verified binary content and Arena's content are the same bytes (`§4`). |

## 1. CPI — live retrieval through the application route

| Field | Observed value |
|---|---|
| HTTP status | `200 OK` |
| Content type | `application/json` |
| Response date | `Thu, 15 Oct 2026 13:42:17 GMT` |
| Response body size | `5,428,261 bytes` |
| Response body SHA-256 | `d1049f399f07c64e65b2155add4829bc4659e5db0c360d9a5d93a10407829a22` |
| Dataset / source | `CPI` / `MoSPI` |
| CPI year / base year / series | `2025` / `2012` / `Current` |
| API contract version | `mospi-esankhiki-rest-d08-2026-10` |
| Pages fetched / expected | `259` / `259` |
| Expected records | `25,884` |
| Actual records | `25,884` |
| Records retained | `25,884` |
| Raw rows received | `25,884` |
| Duplicates suppressed | `0` |
| Retrieval completeness | `COMPLETE` |

Coverage: all 12 months of 2025, **2,157 records per month**. An independent inspection of the returned records found **152 groups of exactly repeated JSON rows (152 extra repeated rows)**, which were **retained rather than discarded** — the intended CPI row-preservation behaviour.

**Result: PASS** — HTTP `200`, every expected page retrieved, every expected row retained, retrieval declared complete, no `INCOMPLETE_PAGINATION`.

## 2. IIP — regression route

| Field | Observed value |
|---|---|
| HTTP status | `200` |
| Records returned | `3/3` |
| Completeness | `COMPLETE` |
| Direct MoSPI CPI control (outside the application) | HTTP `200` |

The combined verification script completed and printed: `PASS: Reconciliation and all verification commands completed.`

IIP deduplication behaviour is unchanged (still enabled), and the IIP leg passing under the new shared pagination code is the regression evidence for that path.

## 3. What this evidence establishes — and what it does not

**Establishes:** the CPI read path returns the complete provider-declared result set through the application route on a machine with provider egress, with identical rows preserved and strict completeness validated against the provider-declared count; the IIP read path still passes; the TLS remediation allows the request to reach the provider at all.

**Does not establish:** anything about the **NAS** leg (no live path exists from either tested network — the documented NAS server is a private address, `10.24.89.9:5000`, and is absent from the repository); any governance movement (qualification, admission, entitlement, licensing, attribution, `M-3`, production); or the validity of unrelated working-tree changes.

## 4. Reconciliation of the verified content to Arena

The Windows reconciliation verified these SHA-256 digests against Arena's published manifest before copying, and Arena re-verified its own files against the same manifest afterwards — all five matched:

```text
frontend/server/macro/mospi-source.ts          5ff267ba0b0d6b3012f2b7bd1d7da605bf6c192260772a33e8f89a225354efcb
frontend/server/macro/mospi-source.test.ts     f251bc110b24863653be15ea40636204d4bbe94b7f07987cea821f0eae62676a
frontend/server/macro/macro-transport.ts       d381bc9dd3e4a7162ed4e88cb38704265b37a309fd418555a874bd1b63fe50da
frontend/server/macro/macro-transport.test.ts  62f403b5872190e8119fd636c291d5b0a8affe00561218e973308cd3bbdddff6
frontend/src/api/macro.ts                      5adc94c3b4b23d7df5c9ce59f09c0dbd1b72726401fd512aa89af9f484c2ad9c
```

The Windows tree also carries the origin-scoped TLS remediation (`frontend/server/macro/mospi-tls.ts`, `mospi-tls.test.ts`) and the one added dependency (`undici`) that the live path requires. The Windows backup of the pre-reconciliation source is `C:\Users\USER\AppData\Local\Temp\iips-cpi-reconcile-20261015-191142` (Windows-only; not accessible from Arena).

## 5. Separate data-quality observation (recorded, not actioned)

An inspection of the same live response found **996 of the 25,884 CPI records carry no `index` value** (≈3.8 %).

* This is **not** a pagination or row-preservation defect: all 25,884 rows were received, retained and counted, and completeness was declared `COMPLETE`. It is an observation about the **provider payload**.
* It was **not** silently addressed by the remediation and must not be. No code change was made for it.
* The application contract already types the field as optional (`readonly index?: string`), the mapper carries through what the provider sent without inventing a value, and the mounted CPI panel renders an absent cell value as an explicit `—` rather than a blank, a zero or a synthetic number.
* No existing contract or work item covers provider-side field absence: a search of the tracker, `docs/integration/**` and the register found **no** data-quality item, and the `DT-1…DT-15` disclosure criteria do not address absent *values* (they govern disclosure wording, placement, granularity and honesty of provenance).
* **Scope:** data quality of the CPI dataset as published by MoSPI; affects presentation of the `Index` column for those rows only.
* **Smallest next action:** the Program Authority decides whether this is (a) accepted as a provider data characteristic with the existing `—` rendering recorded as sufficient, or (b) raised with MoSPI as a data-quality query, or (c) recorded as a new register item with its own acceptance criteria. Until then it stays a recorded finding and is not scheduled.

## 6. Limits of this record

1. Arena did not execute any part of the Windows verification and cannot inspect its raw captures; the figures above are transcribed from the operator's handoff, not re-observed.
2. The response-body digest is the operator's; Arena has no copy of the body and does not claim to.
3. Arena-side checks on the same content (focused suites, typecheck, build, a full-scale local reconstruction of the live shape) are recorded separately in tracker §16.29 and are **local**, not provider evidence.
4. No qualification, admission, entitlement, licensing, attribution, `M-3` or production state is created or moved by this record.
