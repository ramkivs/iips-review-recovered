# WS-A — Live Evidence Retention implementation publication receipt

Date: 2026-11-05. Effective authority:
**`IIPS-V3-CAP02-U1-AMEND-02-IMPORT-EVIDENCE-RETENTION-2026-11-05-01`** (PR #452 / PR #453).

**Implementation: MERGED AND INDEPENDENTLY REMOTELY VERIFIED.**
**End-to-end capability: VERIFIED IN ISOLATED INTEGRATION ENVIRONMENTS**, including rendered UI file
selection, real HTTP POST/GET, real journal, and separate OS-process recovery. **Not user-host
operational acceptance, production activation/deployment, holdings persistence or WS-A-DM completion.**

This additive receipt completes the publication pending in
`WS-A-LIVE-EVIDENCE-RETENTION-IMPLEMENTATION-2026-11-05.md`, tracker §16.257 and R2 §20.
It renders no new authority and changes no runtime code.

## 1. Exact publication coordinates

| Item | Independently observed |
|---|---|
| Authoritative start | IRR main `9d3f668e457a33afc8ce67f60b2b28d71f1b08a3` |
| Implementation PR | **[#454](https://github.com/ramkivs/iips-review-recovered/pull/454)**, MERGED |
| Exact accepted head | **`61d36e367beb3555c00486a60fb228fc1a57c3b0`** |
| Implementation merge | **`bf252e83d57d0322f9b5938f154ea025978c48ba`**, independently matched against live remote main |
| PR product CI | **42084604002 SUCCESS**, exact accepted head |
| PR IRR-static CI | **42084603957 SUCCESS**, exact accepted head |
| Merged-main product CI | **42085226452 SUCCESS**, exact implementation merge |
| Merged-main IRR-static CI | **42085226551 SUCCESS**, exact implementation merge |
| Independent remote content read-back | **24/24 changed paths MATCH**, GitHub contents/blob API byte read-back, SHA-256/blob manifest recorded |
| Frozen boundary remote comparison | **28/28 unchanged blobs**, baseline/merged recursive GitHub tree comparison: PF-1/workflows/authority/reference files, evidence store/schema/digest code, pins/lockfile, holdings adapter and user-portfolio transport |
| Local source-level preservation | All four authority/reference artifacts hash-identical; A-9 handler and response projection byte-identical; historical tracker/R2 content retained as prefix |

Supporting evidence: `evidence/integration/ws-a-live-retention-implementation-2026-11-05/implementation-remote-readback.json`
and `implementation-ci.json`. CI JSON includes successful job steps for the configured full-suite run,
nonzero/fully-passing test guard, typechecks and build. Hosted full log download is blocked by this
sandbox's egress boundary; no aggregate hosted test count is invented. Run/job success is observed
through the GitHub API. Product CI and workflows were not modified.

The initial implementation head had a whitespace-only IRR-static failure from two extra transcript
EOF blank lines. Commit `61d36e3` removed only those blank lines; all checks above are at the corrected
exact head, not the superseded head. No test result content was removed and no failing check was waived.

## 2. End-to-end evidence is separate from the merge

Final local live-flow run: **4 files / 33 tests PASS**. The test transcript includes a real 68-row
HTTP/restart proof: original timestamp `2026-11-05T07:50:49.090Z`, opaque owner `owner-4dc756b3`,
68 retained rows, distinct host PIDs, **SIGKILL** of host A after verified commit, original record
retrieved by A-9 from fresh host B, unchanged journal on retry, and recomputed stored record digest
matching. ImportId is `d3097726b7d55b6b58ec894e06dbe2c29f716073c07b2d351e4bb904d8624191` for that
synthetic fixture and timestamp. Quarantine IDs/recordDigest are per-run; the transcript records the
actual run, not a falsely universal digest.

The UI integration test uses a real `File` selection in the rendered component (jsdom), the real
pinned preview pipeline, real Node HTTP handler/socket and real filesystem. It deliberately holds
A-9 GET until after the append acknowledgement: **success is absent while GET is pending**, then
appears only after matching read-back. Clearing the UI does not delete evidence. This is not only a
seeded-store or mocked-reader unit test, nor is it claimed to be a manual browser/user-host run.

The same live suite proves owner-gated refusals before storage, foreign-scope non-disclosure,
unknown-key and size/shape/count rejection, simultaneous retry serialization, stable conflict/volatile
quarantine duplicate behavior, payload tamper refusal, directory/header/record append failure, fresh
read-back failure, actual HTTP append with dropped acknowledgement, explicit lookup/retry recovery,
truncated-final-line recovery and malformed-interior refusal. Client tests prove original frozen
snapshot/timestamp reuse, no automatic retries, and failure on missing/mismatched A-9 read-back.

The preceding targeted regression run passed **198 cases**, including 166 affected existing regression
cases and the earlier 32 live/UI/client cases. Final live run adds the lost-ack HTTP case and reruns
all 33 changed cases: **199 distinct local covered cases**, not a fabricated single 199-case command.
Typecheck, strict actual server closure, explicit strict server-test typecheck and build pass.
No unrelated full suite was run locally; the existing hosted CI ran its unchanged configured suite.

## 3. Current capability and limitations

The one new admitted route is **POST `/api/broker-import/:portfolioId/evidence`**. The existing A-9 GET
is unchanged. The client now composes parse → immutable parsed snapshot POST → trusted owner-scoped
journal append/fresh read-back → A-9 retrieval/digest and snapshot comparison → final retention
success. No collection GET exists (405 on the POST path), no route enumerates records.

Same-attempt retries preserve original timestamp and byte-identical frozen snapshot. First retained
record remains authoritative. Stable conflicts return 409 with no overwrite; only documented per-row
quarantineIds and derived recordDigest are excluded from stable duplicate comparison. Unknown outcomes
are recovered by A-9 lookup and explicit original-snapshot retry, never rollback/replacement or a new
timestamp disguised as recovery. Retention acknowledgement and retrieval verification remain distinct.

**Mandatory limitation:** exactly one OS writer per directory. In-process serialization is not an OS
lock; PF-1 has no explicit fsync, power-loss or hardware durability guarantee. Raw-file content digest
and browser identity results remain reported snapshot provenance, not independent origin verification.
The stored record digest is verified server-side; A-9's scope-withheld projection cannot be fully
rehashed in the browser. No browser durable snapshot storage or post-loss enumeration was added.

All exclusions preserved: **no PF-1 modification, holdings/transaction write, raw CSV upload, DELETE
or per-record deletion, automatic expiry/purge/compaction, W-1 change, frozen A-8/A-9 authority edit,
IPD/Market Data mutation, pin change, multi-user architecture or production activation/deployment.**
Indefinite retention and explicit-owner deletion policy remain; 50 MiB threshold is review-only.

## 4. Receipt publication

This receipt's own merge hash cannot be embedded in itself. Its new PR is static-only, with final
tracker/R2 current-state addenda and the two supporting JSON receipts. The publishing session verifies
that PR's exact-head and merged-main static checks, independently reads final remote contents and
records its final main/PR/hash coordinates in the PR publication comment and final report. No runtime
rerun is required for the receipt; the implementation's exact-head and merged-main CI above stand.
