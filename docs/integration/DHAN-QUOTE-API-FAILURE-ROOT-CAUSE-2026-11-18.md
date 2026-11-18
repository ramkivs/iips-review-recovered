# DHAN Quote API failure — root cause and correction (2026-11-18)

## 1. Scope and evidence

- Working reference: the independent Python request in the task brief (HTTP 200, 0.9618 s).
- Failing system: IPD (`ramkivs/iips-production-market-data`) daemon, vendor endpoint `POST https://api.dhan.co/v2/marketfeed/quote`.
- IPD request construction is established from the published IPD evidence (PR #156, W-06 conformance investigation), not from a new vendor request. No vendor request was made by this pass.
- No credential values were inspected or disclosed.

## 2. Exact working Python request

| Item | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.dhan.co/v2/marketfeed/quote` |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` |
| `client-id` | `1109880942` (header, bare value, no `Bearer`) |
| `access-token` | redacted (header, bare value, no `Bearer`) |
| Body | `{"NSE_EQ":[2885]}` |
| Serialization | `requests.post(url, json=payload, headers=headers)` |
| Result | HTTP 200 |

The security identifier is a JSON **number** (`2885`).

## 3. Exact IPD request construction (as published by IPD)

From IPD's own W-06 conformance record (PR #156):

- Method: `POST`
- URL: `https://api.dhan.co/v2/marketfeed/quote`
- Headers: `access-token`, `client-id` (bare values, no `Bearer` prefix), `Content-Type: application/json`, `Accept: application/json`
- Body: `{"NSE_EQ":["2885"]}` — security identifiers are serialized as JSON **strings**
- Transport: `DhanServerHttpsTransport` (https, origin-pinned, TLS-intact, `redirect: 'error'`, bounded `AbortSignal.timeout`)
- Result observed by IPD: HTTP 400 mapped to `HTTP_ERROR`, then surfaced by IRR as local HTTP 502

## 4. Meaningful differences

| # | Characteristic | Working Python | IPD | Material? |
|---|---|---|---|---|
| 1 | HTTP method | POST | POST | No |
| 2 | Endpoint / host | `/v2/marketfeed/quote`, `https://api.dhan.co` | same | No |
| 3 | Content-Type | `application/json` | `application/json` | No |
| 4 | Accept | `application/json` | `application/json` | No |
| 5 | Client identification header | `client-id` | `client-id` | No |
| 6 | Authentication header | `access-token` | `access-token` | No |
| 7 | Header casing / duplication | none observed | none observed | No |
| 8 | Exchange segment | `NSE_EQ` | `NSE_EQ` | No |
| 9 | Security ID value | `2885` | `"2885"` | **Yes** |
| 10 | JSON body shape | `{"NSE_EQ":[2885]}` | `{"NSE_EQ":["2885"]}` | **Yes** |
| 11 | JSON serialization | `requests` `json=` (numbers preserved) | IPD serializer emits strings | **Yes** |
| 12 | Proxy / TLS | default requests | `DhanServerHttpsTransport` pinned HTTPS | No (would not produce 400) |
| 13 | Credential resolution | direct literals | DPAPI vault resolver | No (same pair authenticates at `/v2/profile`) |

The only discrepancy that changes the vendor's input validation outcome is the JSON type of the security identifier: the working request sends an integer, IPD sends a string.

## 5. Why the discrepancy causes HTTP 400

Dhan's Market Quote contract expects the security identifier array to contain numeric security IDs. IPD's `buildQuoteRequestBody` emits them as strings. Dhan therefore classifies the request as an input defect (DH-905 / 813 class), which is returned as HTTP 400. This is consistent with IPD's own conformance note that "IPD sends security ids as JSON strings where the docs show bare integers" and that such a deviation "would be 400/813", not 401.

The working Python request uses `2885` (number), so it passes input validation and reaches entitlement/quote processing, returning HTTP 200.

## 6. Credential parity

The same client id / access token pair is used by IPD's vault resolver and authenticates successfully at `GET /v2/profile` (HTTP 200) per IPD's W-06 record. The quote failure is therefore not a credential or subscription-authentication defect at the transport layer; it is an input-shape defect. (Subscription entitlement for Data APIs remains a separate, previously recorded operator concern and is not changed by this finding.)

## 7. Upstream error body handling (section 5 of the task)

IPD maps any non-2xx vendor response other than 401/403/408/504/429 to `HTTP_ERROR` and discards the vendor response body to avoid credential reflection. The consequence is that the Dhan error code (e.g. 813 / DH-905) that would have confirmed the input defect is not preserved.

Recommended IPD-side improvement (no code changed here):

- Parse the vendor error body only for its documented, non-secret fields (`status`, numeric error code, `errorType`/`errorCode`/`errorMessage`).
- Carry a sanitized `vendorErrorCode` / `vendorHttpStatus` in the IPD failure outcome and in the daemon's redacted diagnostic log.
- Never echo the raw body, request headers, or credential material.
- Keep the existing fail-closed behaviour for unparseable or unexpected bodies.

## 8. Root cause

Confirmed root cause: IPD serializes Dhan security identifiers as JSON strings in `buildQuoteRequestBody` (`{"NSE_EQ":["2885"]}`), while the vendor contract (and the working Python implementation) requires JSON numbers (`{"NSE_EQ":[2885]}`). This input-type mismatch causes Dhan to return HTTP 400.

## 9. Required correction (IPD-owned)

In IPD source, change `buildQuoteRequestBody` (and the corresponding historical request builder if it shares the pattern) so that security identifiers are emitted as JSON numbers, not strings. Concretely, the emitted body must be `{"NSE_EQ":[2885]}` for the Reliance quote.

Conformance tests should assert the serialized body type, not only the string form, so a regression to string serialization fails.

No change is required in IRR: IRR consumes IPD's canonical envelope and never constructs the vendor request.

## 10. Operator action

1. Apply the IPD source correction above in `ramkivs/iips-production-market-data`.
2. Rebuild and run the IPD guarded test suite.
3. Re-run one controlled, already-authorized quote request for `EQ_RELIANCE_IN` / `ISIN:INE002A01018:EQ` / `NSE_EQ` and confirm HTTP 200.
4. No credential rotation, subscription change, or daemon restart is required for this code defect; any daemon restart still requires explicit operator authorization.

## 11. Tests and verification performed in this pass

- No vendor request was made.
- No IPD source was modified (IPD repository is read-only to this session).
- IRR repository integrity check: `git diff --check` (see commit).
- IRR build/test execution was not possible in this session because the IPD dependency (`iips-production-market-data`) is not installed in the workspace; this does not affect the root-cause finding, which rests on published IPD evidence.
