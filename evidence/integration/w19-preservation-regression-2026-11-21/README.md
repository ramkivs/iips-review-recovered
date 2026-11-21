# W-19 preservation and regression — consolidated evidence and review handoff

**Status: OPEN — NOT ACCEPTED.** This is an IRR-owned evidence index, not independent technical review, product acceptance, or an IPD-owned execution record. Independent technical review has not been performed. All times below are UTC unless otherwise stated. W-19 is the current-portfolio Preservation/regression work item, not the separate Dhan roadmap item also named W-19.

## 1. Baselines and authority

Remote main was read on 2026-11-21:

| Repository | Remote main at this handoff's baseline check | Relevant tested commit |
|---|---|---|
| IRR | `5cbfb0360a66ca7d23dff758f7c976d49650a081` | D-5 `4c421b8bbfc26e6fe7f78f5379c48afa034b3e4a`; focused `9d7b4a49ff3f843244c5a3cea1b8e758aecbbdb0`; full `5cbfb0360a66ca7d23dff758f7c976d49650a081` |
| IPD | `e46b56b009f1883414cff1ecbfb93417074179f1` | IPD W-19 was reported at the same D-5 commit. |

The IRR D-5 and focused commits are ancestors of IRR `5cbfb036…`. The entire `9d7b4a49…` to `5cbfb036…` range consists of `406b9414cdc2af977edb4e9677ced1ffcab0d66f` and its merge `5cbfb036…`: four changed documents (the master tracker, IID roadmap, Stage 5 implementation record and Windows execution handoff), with no changes in frontend, platform, tests, dependencies, pins or CI. Baseline remote-main observations are not a claim about a later main.

The IPD [current-portfolio execution roadmap](https://github.com/ramkivs/iips-production-market-data/blob/e46b56b009f1883414cff1ecbfb93417074179f1/docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md) identifies W19 as P2 preservation/regression and maps RA-14 and RA-15 to it. Its bytes read at that commit had SHA-256 `df5e9f6924db79febebe07dd0bc901e854b594bbec1bca6df04e40ea7ab221f9`. The associated [consolidated architectural audit](https://github.com/ramkivs/iips-production-market-data/blob/e46b56b009f1883414cff1ecbfb93417074179f1/docs/integration/IIPS-CONSOLIDATED-SNAPSHOT-TO-CURRENT-ARCHITECTURAL-AUDIT.md) had SHA-256 `2d15cbdf2f08967b0dea2e2013d35a22166b929d0d4efd7572e46b0105a03ea0`; it distinguishes aliases from retained evidence and IPD freshness from other domains. These IPD documents are referenced, not republished here.

## 2. Test-to-commit matrix

| Owner and scope | Commit / execution date | Command or evidence | Result |
|---|---|---|---|
| IPD preservation regression | `e46b56b009f1883414cff1ecbfb93417074179f1` / execution date not supplied | User-reported IPD verification; underlying W-19 run log and commands not available to this handoff | **PASS, reported**, not independently re-executed or independently log-verified here |
| IPD RA-15 | Same IPD commit / date not supplied | Seven suites, reported | **52/52**, reported |
| IPD owner isolation | Same IPD commit / date not supplied | Reported | **14/14**, reported |
| IPD PIT durable readback | Same IPD commit / date not supplied | Reported | **34/34**, reported |
| IPD full guarded regression | Same IPD commit / date not supplied | Reported; original command and TAP unavailable | **2,084 passed, 0 failed, 4 skipped; 2,088 total reported.** The handoff described 2,088 as executed, but 2,084 passed plus 4 skipped leaves 2,084 actually executed under the usual definition; original TAP is needed to resolve terminology. Counts may overlap focused suites and must not be added to them. |
| IRR frontend persistence/restart | `9d7b4a49ff3f843244c5a3cea1b8e758aecbbdb0` / 2026-11-21 | Focused 13-file Vitest command in §3 | **134 passed, 0 failed, 0 skipped**, exit 0; [log](focused/frontend-vitest.log), [JSON](focused/frontend-vitest.json) |
| IRR S4-R3 | Same IRR focused commit / 2026-11-21 | `cd iips-platform && ../frontend/node_modules/.bin/tsx --test tests/investment/s4R3CandidateBuild.test.ts` in canonical-path namespace | **10 passed, 0 failed, 0 skipped**, exit 0; [TAP](focused/s4-r3-rerun.tap) |
| IRR frontend full guarded | `5cbfb0360a66ca7d23dff758f7c976d49650a081` / 2026-11-21 | `cd frontend && npm run test:ci` then `node .ci/assert-tests.js .vitest-report.json` | **3,315 passed, 0 failed, 1 skipped**, suite exit 0; guard PASS, exit 0. [log](advanced-main/frontend-full.log), [JSON](advanced-main/frontend-full.json), [guard](advanced-main/frontend-guard.log) |
| IRR platform regression | Same advanced-main commit / 2026-11-21 | `cd iips-platform && npm test` | **678 passed, 0 failed, 0 skipped**, exit 0; [TAP](advanced-main/platform-regression.tap) |
| IRR platform IID | Same advanced-main commit / 2026-11-21 | `cd iips-platform && npm run test:iid` | **1,685 passed, 0 failed, 0 skipped**, exit 0; [TAP](advanced-main/platform-iid.tap). Includes the unchanged S4-R3 suite, **10/10**, no recurrence of the canonical-path failure. |

The three final IRR suites discovered **5,679**, with **5,678 passed, 0 failed, 1 skipped**. The 134 focused frontend tests are included in the full frontend result and the 10 S4-R3 tests in platform IID; neither subset is added again. The one skip is `src/features/reports/ReportsRealData.test.tsx` — `NP-06 Reports — live persisted data renders the actual persisted report artifacts returned by the Reports API`; `IIPS_REPORTS_API_URL` was unset, so its existing `describe.skipIf` applied. No live persisted-data browser test is claimed.

### IPD evidence boundary and outstanding details

The requester supplied the IPD results above and reported D02 freshness preservation and four protected-file hash comparisons. This IRR handoff did not rerun IPD tests, does not contain the IPD test output, and cannot independently verify those reported results, the four file names, comparison endpoints or hash values. No execution date, per-suite command, W-19 log path, or independently inspectable four-file hash ledger was supplied or located in the IPD commit tree. The IPD source tree and [test directory at the tested commit](https://github.com/ramkivs/iips-production-market-data/tree/e46b56b009f1883414cff1ecbfb93417074179f1/tests) are reference locations, **not** the missing run evidence. Obtain the IPD-owned execution record and its four named before/after hashes for review; do not mistake this attribution for independently reproduced evidence. No IPD-owned implementation evidence is copied into this bundle.

## 3. IRR focused execution and dependency integrity

For the 134-test run, after `npm run build:broker-import`, the focused command was:

```sh
cd frontend
./node_modules/.bin/vitest run --reporter=default --reporter=json \
  --outputFile.json=/tmp/w19-execute-logs/frontend-vitest.json \
  server/persistence/persistence-service.test.ts \
  server/persistence/persistence-restart-proof.test.ts \
  server/persistence/consumer-restart-read.test.ts \
  server/owner-context-restart.test.ts server/owner-context-integration.test.ts \
  server/reports/persistence-port.test.ts \
  server/reports/reports-persistence-integration.test.ts \
  server/reports/real-report-persistence.test.ts \
  server/reports-restart.test.ts server/reports-transport.test.ts \
  server/investment/investment-transport.test.ts \
  server/investment/iidG11ServedChainTransport.test.ts \
  server/broker-import/brokerImportEvidenceRestart.test.ts
```

The three existing IPD dependency pins were `12a3d625d0ad603cb0bd9cea46bae314942ee40f` (broker import), `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (NP-04) and `1ce6a829a7ce65550356a0071c108a60f2d813be` (market data). Each exact public HTTPS tarball returned 200. `npm ci --no-audit --no-fund` succeeded at both IRR targets using the system CA bundle and command-scoped SSH-to-HTTPS Git rewrite, with Git global/system configuration disabled and no credentials. npm warned that integrity checks for Git dependencies were skipped; installed lock metadata matching a pin is not an independent package-byte attestation. The focused first attempt failed on certificate verification (exit 1); the successful retry used the system CA bundle, without disabling TLS verification. See [failed](focused/npm-ci.log) and [successful](focused/npm-ci-ca.log) logs.

At both targets the frontend manifest and lockfile remained byte-identical to their main versions: `frontend/package.json` SHA-256 `8041df1f49a30eda84619510fa4c55241ed20c9425fbb4a48cf7a25137f0f926`; `frontend/package-lock.json` SHA-256 `12088a54c95fb36544f3f8bec5731aba468d40980f8eced6a480711588816ac5`. At advanced main the platform manifest and lockfile likewise matched HEAD: `7933b393ef448b4c9eb7e112d0d21cde7b4896d3a6bf06074aa5daa746798026` and `20e626b90a3e89be58eb1df0b958b6c9a030dafdba39bcf684840db459a48a79`, respectively. Manifest, root lock declarations and installed lock metadata retained all three pins.

S4-R3 derives its root from the test file and compares a manifest containing absolute input paths against a committed manifest naming `/home/user/iips-review-recovered`. At D-5 the earlier off-canonical broad run recorded **1,728 passed, 1 failed, 0 skipped** out of 1,729, exit nonzero; the failed subtest was the manifest byte comparison ([TAP](d5/platform-tests.tap)). At `9d7b4a49…`, the initial namespace setup exited 2 before the test because `TMPDIR` was unset ([setup log](focused/s4-r3.tap)); the corrected canonical-path run passed 10/10. Disposable candidate data was removed. Neither historical failure is erased by the subsequent targeted pass.

## 4. Advanced-main environment, initial failure and cleanup

The full run used a disposable worktree and a private mount/network namespace with the checkout mounted at `/home/user/iips-review-recovered`, loopback enabled, Git metadata mounted read-only, a clean environment and test processes running as the normal user. Public HTTPS dependency installation was the only IPD retrieval involved in execution; test processes had no external network. `npm run test:ci` invokes the existing broker materialization/typecheck pretest and full Vitest suite. The platform commands above are the package's existing scripts, not reduced substitutes.

The **first full frontend run failed**: 3,297 passed, 18 failed and 1 skipped out of 3,316; suite and guard each exited 1. The 18 failures were in `server/broker-import/ownerEvidenceReset.test.ts` (AC1, AC2, AC3, AC5, AC6, AC7/8/9, seven AC10 fault cases, and AC11–AC15): root-owned filesystem ancestors appeared as unmapped UID 65534 in the initial user namespace, leading to `UNTRUSTED_ANCESTOR_OWNER` or a mismatch with the expected refusal. Exact test names and messages are in [initial log](advanced-main/frontend-full-first.log) and [JSON](advanced-main/frontend-full-first.json); [initial guard](advanced-main/frontend-guard-first.log) also records failure. The corrected private mount/network namespace preserved normal filesystem ownership and dropped to the regular user before running tests; the full suite and guard then passed as above, without changing assertions.

The full frontend tests rewrote two existing `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/zero-socket-{control,test}.json` output files inside the disposable worktree. Their committed bytes were restored before the platform runs. Final worktree status showed no tracked or untracked changes. Namespace mounts ceased when their processes exited; disposable worktree, temporary candidate/test data and install caches were removed. The real checkout and Windows host databases were not touched.

## 5. Preservation evidence — qualifications remain

- **IID / REL-1:** 37/37 entries in the committed `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/digests.json` matched independently checked sizes and hashes at `a6df94ff…`; no relevant evidence bytes changed through `5cbfb036…`. Its ephemeral database was not retained. This does not independently establish a Windows-host database state.
- **NP-06:** all 10 files in `evidence/integration/np06-reports-baseline-revalidation-2026-10-29/SHA256SUMS.txt` matched at `a6df94ff…`; the historical sandbox readback and owner-isolation records are not fresh Windows-host proof. F-7 C4-2 remains qualified: ambient authorization headers were ignored, not shown rejected. The current synthetic, disposable separate-process tests do not upgrade historical host evidence.
- **Windows:** the distinct Infosys persistence and readback observations in `docs/integration/IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md` are operator-reported; underlying host database and payload bytes were not independently inspected.
- **Frozen 13 engines:** prior D-5 checks compared 13 HTTP responses to a re-executed reconstructed historic baseline; 26 frozen input/expected files and oracle matched. The historic serialized response archive was unavailable. This is **QUALIFIED**, not comparison to independently archived original API bytes. The oracle SHA-256 is `07bc0bce425d150c2da299ae73bc22c751ebf9a29cf521a91bea1f64c5c915f1`.
- **RA-14:** prior D-5 evidence/replay route observations used `ev_<sector>` and `snap_<sector>` reference-only aliases and reported `NOT_PERFORMED`; they do not prove owner-linked retained artifacts or completed replay. They are not relabeled as current-main durable-replay evidence.
- **Independent technical review:** not performed. Do not promote these qualifications or declare W-19 accepted.

## 6. Supporting files and reproducibility boundaries

[SHA256SUMS](SHA256SUMS) covers every supporting file in this bundle, including the preserved original session checksum manifest. It is generated from the copied bytes; `README.md` and `SHA256SUMS` are not self-listed. All copied supporting files were checked against their previously reported hashes or the previously reported original manifest before inclusion. The original session manifest's SHA-256 is `bef05563ee67aa19a8da10902949d500cb080ade90d68d469571b8de661c7634` and lists additional session files that were not copied (exit markers, setup/debug logs and diff-stat scratch files); it is a preserved provenance record, **not** a claim that every one of its paths is present here. The new `SHA256SUMS` is the bundle inventory to verify from this directory.

The specified `/tmp/w19-final-logs/`, `/tmp/w19-final-SHA256SUMS` and `/tmp/w19-execute-logs/` were present during preparation. Relevant IRR logs and reports were copied; caches, dependencies, databases, candidate bundles and unrelated runtime files were not. The original IPD W-19 logs, execution date, commands and four protected-file hash ledger were not provided or located; no hashes for those missing bytes are known, and none were invented. Earlier RA-14 HTTP run output and the 44-test D-5 focused replay/integration log were not located among the supplied temporary logs; their prior reported results remain historical observations, not independently verifiable copied logs.

The prior focused artifacts originally reported these hashes: `frontend-vitest.log` `bc5fc4dc5aaa7e788c3de37f3c84abbbe57948c2b16928e1f48264ed9344a083`; `frontend-vitest.json` `768c8fa4b4d4e89b1296d6e8aadb11c260853a12982e218ba8d8cc349d73b291`; `s4-r3-rerun.tap` `1a5775423b7df4150c444f0f8de0f76c37f46fc2b58cccd86a2a09087e1fb8ff`. The D-5 failure TAP was `95eeb8b1a7fd276ac1c28163c0c8996593033cca5b5a27dec8d9784b1f4aa4d0`.

## 7. Review handoff

Request the missing IPD-owned W-19 run record, exact protected-file identities and before/after SHA-256 pairs; reconcile its reported executed/total terminology; preserve the skipped live-data test and all qualifications above; and arrange independent technical review. Any later main must be assessed separately from these commit-bounded results. **W-19 remains OPEN — NOT ACCEPTED.**
