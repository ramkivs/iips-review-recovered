# PROGRAM v3.0 — PHASE 14 — GOVERNED WORKFLOW DEFINITION & ADMINISTRATION HARDENING

**Status:** IMPLEMENTED (frontend/ only) · **iips-platform/ verify-only (untouched)**
**Certified base:** `7325aeda8c9881ebdf2b96f64323998f1c46ba26` (tag `v3.0-phase12-certified`)
**Phase 13-Hardening head:** `254e472` (preserved)
**Phase 14 implementation commit:** `6f7ab8a` — feat: harden governed workflow administration
**Phase 14 documentation commit:** `be41d88` — docs: record Phase 14 workflow administration

> Note on naming: this is the **authoritative certified lineage**
> (`7325aeda → 29a92a7 → c784e44 → 6ef9487 → 36ff73c → 254e472 → 6f7ab8a → be41d88`).
> `docs/v3.0/phase14/` did not exist on this lineage and is created here. A separate, divergent
> recovered history (`main` @ `c65d533`) also carries a `docs/v3.0/phase14/` directory describing a
> different (contract-inspection / standalone workflow-endpoint) workstream; that is a distinct body
> of work and is not superseded or overwritten by this document.

---

## A. Implementation summary

**What changed**
- Added `frontend/src/features/admin/WorkflowDefinitionPanel.tsx` — a governed, read-only
  workflow-definition inspection panel used by the existing Administration surface.
- Wired it into `AdminOperations.tsx` (the "Migration / Workflow / Marketplace" tab), replacing the
  previous flat 3-column workflow table.
- Added `WorkflowDefinitionPanel.test.tsx` (10 tests) and `AdminOperations.test.tsx` (4 tests);
  extended `Administration.test.tsx` with one tab-level integration test.

**Why**
The prior workflow view showed only `id / version / "id:type"` and offered no way to inspect the
declared execution order, per-node metadata, or provenance. Phase 14 hardens that surface into a
production-grade read-only inspection experience without touching the governed contract.

**What was deliberately NOT changed**
- `adminApi.workflow()` / `GET /api/admin/workflow` — unchanged (no API contract changes).
- `WorkflowNodeRef` / `WorkflowRef` / `AdminWorkflow` types — unchanged.
- `server/admin-transport.ts` (server-side `guardAdmin` enforcement) — unchanged.
- `iips-platform/` — zero modifications.
- `package.json` / `package-lock.json` — zero modifications (no dependency changes).
- No workflow mutation, execution, approval, publish, clone, enable/disable, or configuration.
- No inferred node relationships (declared `order` rendered exactly as supplied).

## B. Files changed

```
M frontend/src/features/admin/AdminOperations.tsx        (wire in WorkflowDefinitionPanel)
M frontend/src/features/admin/Administration.test.tsx     (+1 tab-level integration test)
A frontend/src/features/admin/WorkflowDefinitionPanel.tsx (new inspection panel)
A frontend/src/features/admin/WorkflowDefinitionPanel.test.tsx (10 tests)
A frontend/src/features/admin/AdminOperations.test.tsx    (4 state tests)
```

## C. API impact

**No API contract changes.** The existing `GET /api/admin/workflow` DTO (`workflowId`, `version`,
`nodes[]` with `id/type/capability`, `order[]`, `provenance`) is consumed 1:1.

## D. Test results

| Command | Result |
|---|---|
| `npx vitest run …WorkflowDefinitionPanel.test.tsx …AdminOperations.test.tsx` | **14/14 PASS** |
| `npm test` (full offline suite) | **173 passed / 21 skipped / 0 failed** (25 files passed / 2 skipped) |

## E. Build results

| Command | Result |
|---|---|
| `npm run typecheck` | PASS (exit 0) |
| `npm run typecheck:server` | PASS (exit 0) |
| `npm run build` | PASS (1.78 s; Administration chunk 25.87 kB incl. workflow panel; shell 176.57 kB unchanged) |

## F. Git result

```
branch:      phase13-next
HEAD:        be41d88 (docs: record Phase 14 workflow administration)
parent:      6f7ab8a (feat: harden governed workflow administration)
certified:   7325aeda (v3.0-phase12-certified — intact)
working tree: clean
```

## G. Acceptance matrix

| Gate | Result | Evidence |
|---|---|---|
| Discovery (D1–D5) | PASS | `git status` clean; HEAD `254e472`; contract inspected |
| Workflow API unchanged | PASS | `git diff 254e472..HEAD -- src/api/admin.ts` = empty |
| Read-only boundary | PASS | panel test asserts no create/edit/delete/execute/approve/publish/clone controls |
| Loading state | PASS | `AdminOperations.test.tsx` loading-state test |
| Error state | PASS | `AdminOperations.test.tsx` error-state test (no stack/URL leak) |
| Empty state | PASS | panel empty test + operations empty test |
| Expansion | PASS | click expand/collapse + independence tests |
| Keyboard | PASS | `{Enter}` activation test |
| Accessibility | PASS | real `<button>` controls, accessible names, `aria-expanded`/`aria-controls`, `role="region"` |
| Responsive | PASS | reuses `DataTable` `.table-scroll`; no fixed-width containers introduced |
| Provenance | PASS | panel provenance test (source/freshness/authority/semantics) |
| Typecheck | PASS | `npm run typecheck` exit 0 |
| Server typecheck | PASS | `npm run typecheck:server` exit 0 |
| Build | PASS | `npm run build` 1.78 s |
| Test suite | PASS | 173/21/0 |
| Diff hygiene | PASS | `git diff --check` clean |
| Lockfile unchanged | PASS | `git diff -- package.json package-lock.json` empty |
| Phase 12 baseline intact | PASS | tag → `7325aeda` unchanged |
| Phase 13 ancestry intact | PASS | `6f7ab8a` parent = `254e472`, linear history, no rebase/force |

## H. Known limitations

- **No real-browser visual/zoom testing** — no browser available in this environment; responsive
  behavior is covered by structural reuse (`.table-scroll`) and non-regression of the existing suite.
- **Workflow ID used in DOM `id`/`aria-controls`** — IDs with characters unsafe for HTML ids would
  need sanitization; the governed dataset uses safe identifiers (`wf-certified-review`, etc.).
- **No G3 LIVE re-run** — requires the real Keycloak environment; the previously certified G3 LIVE
  (8/8) remains the authoritative evidence (server-side workflow endpoint already `guardAdmin`-protected).
- **Provenance is per-surface** (single `AdminWorkflow.provenance`), not per-workflow — matches the
  governed DTO exactly.
