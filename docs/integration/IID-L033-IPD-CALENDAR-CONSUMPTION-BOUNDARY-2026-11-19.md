# G-9 / L-033 — IPD calendar consumption in IRR: boundary, implementation and remaining evidence limit

**Record date:** 2026-11-19 (UTC).
**Repository / branch:** `ramkivs/iips-review-recovered` / `arena/fe76d26e-iips-review-recovered` (base `1a0e3fc7a843b199c3baecb4f4e617172d802d58`).
**Workstream:** IID Stage 4, G-9 / L-033. **Disposition: L-033 remains `OPEN` — the five-trading-session rule is
implemented and fail-closed, but the exact IPD artifact bytes have not been verified from this session, so the
limitation is not closed.**

## 1. Dependency named by the owner (not re-requested)

The owner identifies an already-implemented, already-merged exchange-calendar capability in the *other*
repository `ramkivs/iips-production-market-data`:

- authoritative branch `main`, merge commit `6b50f0686e033e3d03cb8995d137e862cbf9068c`;
- calendar artifact `calendars/ipd-equity-2026.v2026-11-19.2.json`.

IPD was not modified and is not to be modified. The calendar content was subsequently made available in-session
as an owner-supplied extract, and that extract is the semantic basis for the implementation below. This record
does **not** ask the owner to supply the calendar again.

## 2. What could and could not be verified

Read-only access to IPD from this session failed on every route attempted (git clone/smart-HTTP 403, GitHub API
403 "Resource not accessible by integration", TLS resets on raw hosts, 404s on codeload/npm mirrors). Those
failures are access limits of this session, not evidence about IPD.

**Root cause, established 2026-11-19 with control requests.** The sandbox egress proxy presents an Arena
GitHub App installation credential for requests to the session owner's GitHub resources, and that installation
is granted only to `iips-review-recovered`. Evidence: the session `GH_TOKEN` is an opaque Arena token
(`aren…`, 24 chars) exchanged by the proxy; an unrelated public repository (`octocat/Hello-World`) reads
anonymously with HTTP 200 while `ramkivs/iips-production-market-data` returns GitHub's 403 "Resource not
accessible by integration" **even with no client credential sent**; the same repo returns 404 over HTML and
codeload (GitHub hides repositories the presented credential cannot see) while codeload for
`iips-review-recovered` returns 200; git smart-HTTP is refused by the proxy itself ("Write access to
repository not granted"); SSH (port 22) and the git protocol (port 9418) are closed/reset at egress. This is
an administrator-side session permission scope — the Arena GitHub App is not installed on, or the session is
not allowlisted for, `ramkivs/iips-production-market-data`. It is **not** a statement about the repository's
visibility (public, per the owner) and **not** an IRR runtime limitation. The administrator change that
unblocks byte verification is any one of: install/grant the Arena GitHub App on
`ramkivs/iips-production-market-data` with read-only Contents permission; add that repository to this
session's repository allowlist; or supply the artifact through an owner-controlled channel reachable from
IRR (for example the owner committing the digest-pinned artifact into IRR, or a registry publication). The
work below therefore completes everything that does not depend on that grant, and stops exactly there.
Consequently:

- **Verified from the owner-supplied extract:** artifact identity `IPD-EQUITY-2026-BOUNDED`, version
  `2026-11-19.2`, schema 1; continuous coverage only for `NSE_EQ` and `BSE_EQ`, `2026-11-01`–`2026-11-19`;
  explicit day rows including the exceptional OPEN Sunday session `2026-11-08` (Diwali Muhurat), the CLOSED
  holiday `2026-11-10` (Diwali-Balipratipada), ordinary weekend closures, and November 7/14 mock sessions that
  are **not** live trading; sparse annual-holiday evidence that explicitly does not extend continuous coverage;
  outside explicit rows, coverage is `UNKNOWN/UNAVAILABLE` with no weekday inference, no elapsed-time fallback
  and no cross-venue fallback.
- **Not verified:** the exact artifact bytes at commit `6b50f068…` and their SHA-256. Pasted text is not treated
  as verified bytes. The digest the IRR code computes is the canonical digest of the calendar object a caller
  supplies; it is evidence of *which object was consumed*, not proof of the IPD file's byte identity.

## 3. The consumption boundary now implemented in IRR

`iips-platform/src/investment/assessment/exchangeCalendar.ts` is the seam. The engine stays pure (no I/O): the
caller supplies the calendar artifact it has pinned, plus an explicit `PriceCalendarBinding`
(security, exchange, segment, optional listing). Before any session is counted, the module validates:

- schema version 1 and non-empty calendar id/version, plus any caller-pinned expected id/version
  (`PRICE_CALENDAR_IDENTITY_MISMATCH` on mismatch);
- optional provenance shape (repository, artifact path, 40-hex commit, `sha256:` digest when asserted);
- exactly one continuous-coverage interval for the bound exchange/segment, with a usable source list;
- every date inside that interval has exactly one explicit day row for the bound exchange; OPEN rows carry
  valid same-day sessions, CLOSED rows carry none; duplicate/malformed rows refuse. Sparse rows outside the
  interval never extend coverage.

Mapping is deterministic and never inferred: the segment must belong to the exchange (`NSE→NSE_EQ`,
`BSE→BSE_EQ`); when dataset listings are supplied, the binding must match an active `EQ`/`EQUITY` listing of
the assessed security at the observation date (a dual-listed security such as Infosys has both an NSE and a BSE
listing, so listings alone cannot choose the calendar — the caller that sourced the price must say which
exchange segment the observation belongs to). Exchange identity is never derived from a price `sourceRef`.

Counting convention: price and assessment timestamps convert to Asia/Kolkata calendar dates; the observation
date itself is not counted; each OPEN date after it through and including the assessment date counts once;
the maximum is **five** trading sessions (`VALUATION_POLICY.freshness.priceMaxAgeTradingSessions = 5`,
`mos-policy/1.1.0`). An exceptional OPEN row counts; weekends, mock-only days and holidays do not.

Fail-closed behaviour — no weekday inference and no seven-calendar-day fallback survives anywhere:

| Condition | Refusal |
|---|---|
| no calendar binding supplied | `PRICE_CALENDAR_UNAVAILABLE` |
| pinned id/version mismatch | `PRICE_CALENDAR_IDENTITY_MISMATCH` |
| invalid artifact/provenance | `PRICE_CALENDAR_INVALID` / `PRICE_CALENDAR_PROVENANCE_INVALID` |
| observation or assessment date outside continuous coverage | `PRICE_CALENDAR_COVERAGE_UNAVAILABLE` |
| wrong security, wrong segment, unverifiable listing | `PRICE_CALENDAR_MAPPING_UNAVAILABLE` |
| price dated on a non-session date | `PRICE_ON_NON_SESSION_DATE` |
| more than five sessions elapsed | `PRICE_OUTSIDE_POLICY_WINDOW` (`PRICE_STALE`) |

The pre-existing guards are unchanged: knowledge-cutoff (`PRICE_PREDATES_KNOWLEDGE_CUTOFF`) and
unadjusted-price-across-corporate-action refusals still apply, and statement freshness
(`freshness-policy/1.0.0`, P&L/balance-sheet day windows) is a separate mechanism that was not touched.
Every `MarginOfSafetyBlock` emitted under `mos-policy/1.1.0` carries the `priceFreshness` evaluation
(calendar id/version/digest, mapping, both exchange-local dates, counted sessions), and the assessment
records a limitation whenever freshness is unavailable for a reason other than having no price at all.
`PriceRecord` was deliberately not given an exchange field: that would have changed canonical dataset
content/digests across ingestion for a fact the caller already knows.

Callers that do not supply a binding — today that includes the frontend artifact generator and the demo
pipeline — now have their prices refused fail-closed. Wiring a pinned IPD calendar into those callers is
deliberate follow-on work, not something this change smuggles in.

**Caller integration completed 2026-11-19 (supply mechanism; the artifact itself remains to be supplied).**
`bindingFromVerifiedCalendarBytes()` in `exchangeCalendar.ts` is the single verified-supply route: the
caller provides the exact artifact bytes obtained through its own authorised channel plus the SHA-256 it
pinned for those bytes; the digest is computed over the bytes and must match before the JSON is parsed, and
the artifact must pass the same preparation validation used at assessment time, with the verified digest
recorded into the binding's provenance. The production artifact generator
(`frontend/server/investment/cli/generate-investment-artifacts.ts`) now accepts `--price-calendar`,
`--price-calendar-sha256`, `--price-calendar-commit` (plus `--price-calendar-id`/`--price-calendar-version`
overrides defaulting to the IPD `2026-11-19.2` identity): it verifies the supplied bytes, binds them to the
identity-resolved listing (its exchange and listing id from the dataset — the caller's explicit mapping
assertion), records a `price-calendar` step, and passes the binding into `assessCompany()`. With no
`--price-calendar` flag nothing changes in shape: no binding is supplied and prices refuse fail-closed.
There is no direct IPD runtime dependency and no network access at runtime; once an administrator grants
one of the access routes in §2, supplying the verified artifact to production is a command-line act, not a
code change. The demo pipeline was deliberately left unbound (it runs synthetic fixtures).

## 4. Tests and validation (2026-11-19)

- New `iips-platform/tests/investment/assessment-calendar.test.ts` (14 tests) pins the boundary on the
  bounded IPD-shaped fixture: exactly five sessions accepted; the sixth refused across the 2026-11-10 holiday
  and the 14–15 weekend; the exceptional Sunday 2026-11-08 session counts; mock Saturdays do not; holiday and
  weekend price dates refuse; an assessment on a closed date counts zero; `2026-11-18T19:30:00Z` ages as
  Asia/Kolkata date 2026-11-19; NSE and BSE bindings count independently; and the fail-closed cases (no
  binding, identity mismatch, outside coverage, sparse rows not extending coverage, segment/security
  mismatch, listing verification, digest stability).
- `assessment-price.test.ts` now asserts `mos-policy/1.1.0`, the five-session stale boundary
  (2026-11-09 → 2026-11-18 = 6 sessions) and `priceFreshness` evidence on accepted prices.
- Two historical regression controls were rebaselined for exactly this policy change and say so in place:
  the S4-R3 payload digest (the only movement is the emitted `priceFreshness` block) and the IX
  authorized-policy package comparison (L-034/L-036 reproduce member-for-member; only the MoS-derived V2
  fields and structural digests differ, and the IX generator no longer substitutes a zero price when
  computing a band).
- Full IID suite: `npm run test:iid` — **1665/1665 passing**. TypeScript: `tsc --noEmit` — clean.
  `git diff --check` — clean.
- Caller-integration follow-on (2026-11-19): three supply-mechanism tests added to
  `assessment-calendar.test.ts` (pinned-digest bytes become a working binding; tampered bytes refuse with
  `PRICE_CALENDAR_DIGEST_MISMATCH`; malformed pin and non-calendar bytes refuse at supply time). Full IID
  suite now **1668/1668**; platform `tsc --noEmit` clean. The edited frontend CLI file parses cleanly; the
  frontend's own typecheck/test suites cannot run in this sandbox because its dependencies include the
  IPD-pinned private packages that the same access restriction makes uninstallable here — that is recorded,
  not silently skipped, and the platform-typed helper carries the verified logic those suites would exercise.

## 5. Disposition

- Option A (five trading days) remains the settled owner choice; it is not reopened.
- The runtime is now compliant with R-6.4's five-trading-session rule **when a caller supplies a valid,
  in-coverage calendar binding**, and refuses the price otherwise. The seven-calendar-day rule is gone.
- L-033 stays **`OPEN`** for one exact, evidenced reason: the consumed calendar's identity rests on the
  owner-supplied extract, not on verified IPD bytes. Condition (b) from the original disposition — a
  production caller wiring the pinned artifact as a binding — is now implemented as a mechanism (§3); what
  remains is condition (a): byte-level verification of `calendars/ipd-equity-2026.v2026-11-19.2.json` at
  `6b50f068…` (SHA-256 against the pinned commit), which requires exactly one administrator action from
  §2 (Arena GitHub App grant on the IPD repository, session allowlist addition, or an owner-controlled
  supply of the artifact into IRR). Once those bytes are in hand, closure is: compute the SHA-256, run the
  production caller with `--price-calendar`/`--price-calendar-sha256`/`--price-calendar-commit`, and record
  the verified digest in this document and the register. None of that is claimed yet.
- PR #597 remains open and unmerged; nothing in this work modifies or merges it. No change was made in IPD.
  No duplicate calendar was created in IRR — the only calendar-shaped data in this repository is test
  fixtures, labelled as such.

## 6. Addendum (2026-11-19): anonymous-access investigation — no in-session bypass exists

At the owner's direction, genuinely anonymous access was attempted before concluding that administrator
action is required. Findings, in the order attempted:

1. **No client-side configuration exists to disable the injection.** The sandbox exports no
   `HTTP(S)_PROXY` variables, has no `~/.curlrc`, no `gh` hosts file and no credential helpers; the only
   GitHub configuration is the opaque session token. The credential handling therefore happens in the
   transparent network egress, not in any inspectable client configuration.
2. **Clean-client anonymous access changes nothing.** With a completely empty environment (`env -i`), no
   token, no credential helper and `--noproxy '*'`, two independent HTTP clients (curl and Python
   `http.client` over direct TLS) both receive GitHub 403 "Resource not accessible by integration" for
   `ramkivs/iips-production-market-data`, while `octocat/Hello-World` and `ramkivs/iips-review-recovered`
   return 200 in the same runs.
3. **Client credentials never reach GitHub.** Sending a deliberately bogus `Authorization: Bearer` header
   still returns 200 for `iips-review-recovered` and 403-by-integration for the IPD repository; GitHub
   would have answered 401 "Bad credentials" had it seen the client's header. The proxy strips/replaces
   client credentials and presents the Arena GitHub App installation credential for the owner's namespace.
4. **No alternate public-read route bypasses it.** jsDelivr and Statically (public GitHub file CDNs),
   githack and Sourcegraph raw mirrors all fail — sandbox egress refuses non-allowlisted hosts at TLS and
   the page fetcher cannot retrieve them; npm carries no IPD package; SSH and git-protocol egress are
   closed. Repeating the earlier git/API/raw attempts would meet the same proxy, so they were not repeated.

**Exact unavailable capability:** making any GitHub request — anonymous or otherwise — under an identity
other than the Arena GitHub App installation for repositories in the session owner's namespace, and egress
to any host outside the session allowlist. Both are proxy/session properties; neither is changeable from
inside this session, and this record does not pretend otherwise. The unblocking action remains exactly one
of §2's administrator options. Everything on the IRR side is ready for the moment one is granted:
`--price-calendar` supply, digest verification, binding and five-session assessment are implemented and
tested (1668/1668).

## 7. Addendum (2026-11-19): full artifact content supplied by the owner — semantic verification

The owner has now supplied the complete content of `calendars/ipd-equity-2026.v2026-11-19.2.json` in-session.
It was verified field by field against the consumption boundary of §3:

- **Identity:** `schemaVersion: 1`, `id: "IPD-EQUITY-2026-BOUNDED"`, `version: "2026-11-19.2"` — exactly the
  identity the IRR caller pins by default. `reviewedBy` and the `boundedModel` authority (owner instruction
  continuing IPD commit `618f5459…`) are present as provenance narrative.
- **Coverage:** `qualification.continuousCoverage` declares exactly one interval per segment — `NSE_EQ` and
  `BSE_EQ`, both `2026-11-01`–`2026-11-19`. `annualHolidayEvidence` is explicitly `closureDatesOnly` with
  `doesNotEstablishContinuousCoverage`; `outsideCoverage` is `UNKNOWN/UNAVAILABLE` with no weekday,
  elapsed-time or cross-venue fallback. Sparse closure rows (2026-01-15 … 2026-12-25, including 2026-11-24)
  sit outside the interval and, under the implemented validation, do not extend coverage.
- **November rows (both exchanges, identical):** 01 CLOSED weekend; 02–06 OPEN; 07 CLOSED (mock-only, not
  live); **08 OPEN `EXCEPTIONAL_LIVE_SESSION`** (Sunday Muhurat, 14:20–15:35 + post-close 15:50–16:00);
  09 OPEN; **10 CLOSED `EXCHANGE_HOLIDAY`** (Diwali-Balipratipada); 11–13 OPEN; 14–15 CLOSED (14 mock-only);
  16–19 OPEN. Ordinary sessions 09:15–15:35 + 15:50–16:00. Every date in the coverage interval has exactly
  one explicit row per exchange; OPEN rows carry same-day sessions, CLOSED rows carry none; 19 sourced
  references are declared. This is precisely the session map the L-033 tests pin, so the counting results
  (five-session boundary, sixth-session refusal, Sunday counted, mocks excluded) hold for the real content.
- **Validator compatibility:** the artifact's extra qualification fields are structurally additive and are
  ignored by the runtime checks; the content as supplied would pass `prepareCalendar` validation and the
  verified-supply route unchanged.

**Remaining limit, stated exactly:** chat transport renders the content (whitespace, `\_` escapes, markdown
link wrapping, `&amp;`), so no byte-exact reconstruction exists here and **no SHA-256 of the original IPD
file can be computed from this supply** — a digest over a reconstruction would attest the reconstruction,
not the artifact, and none is recorded. Closure requires the original bytes (or their owner-computed
SHA-256) through any workable channel, e.g. the file committed into this repository. At that point:
`bindingFromVerifiedCalendarBytes` pins the digest, the production caller runs with `--price-calendar`,
and this record gains the verified digest line. Until then L-033 remains `OPEN` on that single point.

## 8. Addendum (2026-11-19): owner CheckResult — pinned digest recorded; L-033 RESOLVED

The owner supplied the CheckResult for the original artifact file (IPD @ `6b50f068…`,
`calendars/ipd-equity-2026.v2026-11-19.2.json`):

| Check | Result |
|---|---|
| File size | 55,065 bytes |
| JSON parsing | PASS |
| Calendar identity | `IPD-EQUITY-2026-BOUNDED` |
| Version | `2026-11-19.2` |
| Explicit calendar rows | 68 |
| **SHA-256** | **`906dff760fd8043f72f2f2989f869fbd7f9a5a31e72a10ea986acac75467112e`** |

The row count independently matches the verified content (34 per exchange: 13 annual closure rows, the 19
November coverage rows, plus the sparse 2026-11-24 and 2026-12-25 rows). This digest is now the **pinned
supply digest** for the artifact: `sha256:906dff760fd8043f72f2f2989f869fbd7f9a5a31e72a10ea986acac75467112e`.
Any bytes presented to `bindingFromVerifiedCalendarBytes` / the production caller's `--price-calendar`
route must hash to exactly this value or supply refuses (`PRICE_CALENDAR_DIGEST_MISMATCH`) — so the pin is
enforced by code at first production use, not by trust in a narrative.

Attestation basis, recorded honestly: this session still has no byte route to IPD (§6), so the digest is
**owner-attested** (owner-run CheckResult over the original file) rather than independently recomputed
here. Semantic verification of the full content (§7), the implemented five-session rule and its test
evidence (1668/1668), and this pin together satisfy the closure conditions set at §5. The first production
run supplying the file remains an operational act; the pin guarantees that whatever bytes are supplied are
the attested artifact or are refused.

**Disposition: L-033 is `RESOLVED`** (register §17.36; summary status cell updated, historical text
unaltered). IPD untouched; PR #597 unmerged.
