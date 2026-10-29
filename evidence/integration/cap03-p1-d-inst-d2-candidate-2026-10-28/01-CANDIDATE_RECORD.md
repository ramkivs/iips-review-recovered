# D-INST candidate — D-2 effective-write check (CAP-03 P-1), 2026-10-28

**Status: CANDIDATE. Not parsed, not run, not adopted. No host action performed.**

- **Authority for authoring:** PA ruling D-Q = D-2 (with D-1 supporting), recorded in `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` §6. D-INST register row: "IRR revises and publishes after D-Q ruling".
- **Not granted by this record:** adoption of the new instrument identity under DB-B1 (E4: any change needs PA adoption); A6 runtime on the designated host (required before use); any capture; any P-1 action.
- **Identity:** SHA-256 of `02-p1-d2-effective-write-check-CANDIDATE.ps1` is listed in `SHA256SUMS.txt`. The current v2 identity (`191f5828…`, SHA-256 `13783385…`) is unchanged.
- **Object:** store parent (per D-Q). The check reads the parent DACL and the attempt token; it confirms the store path and sidecars are absent before evaluating.
- **Method:** D-2 with raw ACE dump verbatim. Effective mask = union(allow matching token SIDs) AND NOT union(deny matching token SIDs). Order-independent approximation; limitation stated in the script header and reported for PA review.
- **Verification performed (static only):** brace, parenthesis and bracket balance; no file-writing cmdlets; required checks present. **Not performed:** PowerShell parse or run (standing boundary), any host run, any comparison against a real DACL.
- **Next gated steps (not executed):** (1) PA adoption of the new identity, (2) A6 runtime on the designated host, (3) D-1 ACL dump as supporting evidence, (4) instrument identity recorded in the procedure revision once adopted.
