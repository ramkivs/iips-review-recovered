# CV-51 Browser Qualification Evidence — Manifest (`2026-10-25`)

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-CV51-QUALIFICATION-2026-10-25-01` ([`docs/integration/IIPS_v3.0_REPORTS_NP06_CV51_QUALIFICATION_RECORD_2026-10-25.md`](../../../docs/integration/IIPS_v3.0_REPORTS_NP06_CV51_QUALIFICATION_RECORD_2026-10-25.md)) |
| **Authority** | `IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01` (`Option CV51-A` APPROVED; IRR PR #268, merge `50a67cd495cb97e1ac8b94ad75f1ce51df57ec6b`) |
| **Executed** | `2026-10-25` — real headless Chromium 153 (Playwright-core + `@sparticuz/chromium` from an ephemeral `/tmp` tool directory) against Vite `127.0.0.1:5173` → executive transport `127.0.0.1:8787` |
| **Runtime Material** | Carrier (384 bytes, SHA-256 `b1b78809d1c8d05800b338f73082b4269e6c9fa65b8f35192f4736d6f1a98640`) + NP-04 SQLite under ephemeral `/tmp/iips-cv51-qual-*` outside any Git worktree; **deleted after capture**; seeded chain `v1 89f528b1-7f02-4127-bf64-9c0707d361dd` → `v2 957fe9f7-e808-49b1-baad-e8d6155089c9` via the governed backend write path (setup only, never the browser) |
| **Result** | **92 browser checks PASS / 0 FAIL** (`B-1`–`B-6` complete); runtime cleaned; ports released |

## Files

| File | Content |
|---|---|
| `browser-results.json` | Structured per-check results (92 checks), observed request sample, keyboard traversal, seed identifiers, carrier digest, cleanup proof |
| `browser-transcript.log` | Console transcript of the executed qualification run (`PASS`/`FAIL` per check, final `FAILURES: 0`) |
| `cv51-browser-qualification.mjs` | The exact executed harness (spawns the real loopback stack per phase; asserts DOM, network, console, keyboard, and overflow conditions) |
| `B-1-carrier-absent-503.png` | Missing carrier → sanitized owner-context 503 state |
| `B-1-recovered-after-retry.png` | Recovery after `Retry` once the carrier is established |
| `B-2-persistence-absent-503.png` | Carrier valid / DB absent → persistence-unavailable state |
| `B-3-empty-store.png` | Configured empty store empty state via sidebar navigation |
| `B-4-head-list.png` | Populated current-head list (v2 only) |
| `B-4-detail-v2-four-levels.png` | v2 detail — four D8 disclosure levels |
| `B-4-detail-v1-superseded.png` | v1 detail — `SUPERSEDED` posture + current-head link |
| `B-5-unknown-report-404.png` | Unknown UUID → indistinguishable 404 state |
| `B-6-list-1280px.png` / `B-6-list-640px.png` / `B-6-list-320px.png` | List layout at 1280 / 640 / 320 (no page overflow) |
| `B-6-detail-1280px.png` / `B-6-detail-640px.png` / `B-6-detail-320px.png` | Detail layout at 1280 / 640 / 320 (no page overflow) |

*This evidence records qualification only. `CV-51` product acceptance remains `PENDING` its separate post-qualification PA act; production remains `NOT ADMITTED`.*
