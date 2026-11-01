# IIPS v3.0 CAP-03 — PA authorization for P1-F pre-start retries

- **Decision ID:** `IIPS-V3-CAP03-PA-P1F-PRESTART-RETRY-AUTHORIZATION-2026-11-01-01`
- **Decision date:** 2026-11-01 (Asia/Calcutta)
- **Decision-maker:** Ramki, sole user and Program Authority
- **Scope:** the existing personal, local, single-user Windows laptop and its already-designated P1-F evidence root
- **Status:** **APPROVED by explicit PA direction in this Arena session; operative in the launcher after publication to IRR `main`.**

## 1. Decision and supersession

The PA authorizes repeated P1-F **attempts only when every prior attempt is positively established to have stopped before the Execute marker and before the provisioner process-start request**. This decision supersedes the one-attempt limit in §2 of `IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01` only for that narrowly defined pre-start retry case. It does not alter the marker/process-start commitment rule or authorize another provisioning process-start after a marker or any prior Execute process-start.

This is global standing authority within the scope and condition above; no repeated case-by-case approval is required. It is not an approval to retry after a started or ambiguous Execute, nor to infer a pre-start stop from an operator statement alone when local records can be checked.

## 2. Eligibility test for each retry

Before any retry-side work or new claim is created, the published launcher must read and verify all prior P1-F attempt records in the designated evidence root. This specific authorization also requires the reported original run `p1-exe-20261101T091303265Z-332114a4` and its canonical `execute-claim.json` to remain present and uniquely associated; an empty root or missing anchor is ambiguous and blocks rather than being treated as a fresh first attempt. A retry is eligible only if, for every prior `p1-exe-*` run:

1. the corresponding claim is retained, readable, uniquely associated with that run directory, and its current contents match the sealed summary/run identity and expected act/store fields;
2. the run directory has a complete `SHA256SUMS.txt` seal which verifies every file in the directory;
3. the sealed run summary states `executeMarkerWritten = false`, `executeCalls = 0`, and P1-F consumption `NOT CONSUMED`;
4. `EXECUTE-MARKER.json` is absent, and no contradictory process-start evidence is present; and
5. the attempt directory and claim map are complete, unique, and internally consistent.

Missing, malformed, unsealed, duplicate, mismatched, or ambiguous evidence remains a stop. No user-reported statement substitutes for those checks. The tool must not remove, rename, overwrite, release, or edit an earlier claim, run directory, marker, summary, or seal. The pre-existing claim format does not contain a claim-file digest in its sealed run summary; therefore, this review checks the claim's current bytes/fields against the sealed summary and operation identity, but does not claim a cryptographic proof that the claim file was never replaced before this verifier ran. Any mismatch blocks.

## 3. New-attempt record and stop boundary

Each eligible retry receives a new unique run directory and a new exclusive per-run claim file. The original `execute-claim.json` and every prior attempt record remain byte-preserved. The current run writes its own marker immediately before the provisioner process-start request. If any attempt has a marker or its `executeCalls` is nonzero, the root is spent for further Execute retries under this authority; no retry follows. A process-start failure after the marker is still a started attempt and is not retry-eligible.

No retry reuses a run directory or claim filename. Concurrent attempts are excluded through exclusive claim creation. S00 rechecks the current published PA authority, exact tracker pointer, host, evidence root, identity, pin, data-integrity and execution preconditions before the new attempt.

## 4. Scope and exclusions

This authorization applies only to P1-F on the existing personal Windows laptop, existing designated evidence root, existing pinned checkout/tree, and existing personal single-user store. It does not authorize S2 recovery/build, Node installation, Preflight, another host/root, IPD Git writes, production or multi-user operation, or any retry after a marker/process-start. Existing evidence is preserved. Technical controls remain where they establish scope, identity, evidence integrity, exclusive claims, and the no-retry-after-process-start boundary.

## 5. Operative status

The PA's explicit direction in this session approves this decision without another approval request. The launcher may use this authority only after this record and its exact current tracker pointer are published to IRR `main`. Arena must not access or modify the Windows checkout, evidence root, or retained claim and must not perform P1-F execution. The designated Windows operator remains responsible for running the published launcher locally; the launcher's evidence-based eligibility checks decide whether a retry can proceed.