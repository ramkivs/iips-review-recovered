# W-11 — IRR execution and verification

**Status: PARTIAL.** IRR documentation and the browser-output gate are implemented; the IPD-owned alignment is pending separate execution and the roadmap's running-daemon, four-capability dry-run has not been performed. Neither configuration parsing nor the build proves live vendor connectivity or entitlement. No Dhan vendor request, credential operation, portfolio modification or Windows synchronization was performed.

## Findings and IRR work

- The identity and quote/history/health/freshness URL variables are separate readers, not aliases. Identity requires its URL; the latter defaults to loopback port 8791. Both are documented without changing runtime semantics. The market-data timeout is 10,000 ms by default and applies only to the latter reader; identity's default is independently fixed at 10,000 ms. The provider's separate timeout defaults to 5,000 ms.
- The primary IRR pin and the three separately consumed package identities were checked against `frontend/package.json`; the stale runbook header was corrected. The daemon is separately operated and cannot be presumed to match the IRR package pin. Both the pinned IPD daemon source and the inspected IPD main source independently specify port 8791. The IPD handoff records their material selector and expiry-validation differences.
- `.env.example` now documents the correct port and separate settings. `docs/OPERATOR_RUNBOOK.md` §3.3a documents configuration, startup order, safe local health verification and stop/restart limitations. The existing Vite bind description in §4 was corrected to match the current config.
- The build now scans all emitted browser files, including source maps, for prohibited configuration names, provider symbols, secret-reference patterns, selected credential-bearing patterns and server-only runtime details. Two server-configuration references found in a browser source-map comment were removed at source. The gate follows applicable IPD package-closure rules; `WRITE_NOT_AUTHORIZED` is deliberately not forbidden because it is an existing legitimate browser refusal contract, not a provider implementation symbol. The gate does not inspect dynamic API responses or prove the absence of all secrets; response-disclosure and provider-state authority remain W-10 concerns.

## Verification

- Targeted synthetic/offline configuration, identity, quote, health, freshness and UI regressions: **160 passed** across eight files. This includes missing/invalid settings, defaults and separate reader behavior.
- Browser gate synthetic fixtures: **3 passed**. The negative case injects every covered class into a source-map asset and verifies a nonzero CLI exit without echoing matched data; clean output passes. Missing JavaScript and symlinks fail closed.
- Production build, replay-server typecheck and the post-build browser gate passed; four emitted files were scanned. Vite reported a non-fatal chunk-size warning.
- A read-only comparison with immutable IPD source at the primary pin and with the inspected IPD main revision confirmed both daemon port defaults equal the `.env.example` values. No IPD checkout or mutation was used.
- Operational dry-run: **not attempted**. The required IRR transport settings and local configuration files were absent in this sandbox, and no listener was observed on the default daemon port. This does not establish whether a daemon exists on another host or port. No environment values were printed.

## Remaining

The actionable IPD-owned work and publication boundary are in `docs/integration/DHAN-W11-IPD-CONFIGURATION-HANDOFF-2026-11-15.md`. It has not been implemented or accepted in IPD. Final W-11 acceptance also needs the authorized version-specific connected-daemon procedure covering all four capabilities; quote/history actions require separate authorization and budget review. Next requested roadmap item: **W-07**; keep W-11's unresolved dependencies visible.
