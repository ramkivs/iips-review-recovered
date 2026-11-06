# IID-6 — keyboard and assistive-technology pass (AC-6.6 / AC-U6)

## What the surface uses

- **Native elements only.** `button` for state-changing-which-version reads, `a`/`Link` for navigation, `table` with
  `caption`, `thead`, `th[scope]` for every tabular value, `section` with `aria-labelledby` for every panel,
  `aside` with `aria-labelledby` for the sector disclosure. No `div` with a click handler, no custom combobox, no
  focus trap, no `tabIndex` other than the defaults.
- **`aria-pressed` on both selectors.** The version buttons and the timeline pair buttons are toggle-style: they
  report which stored version is currently being read, so a screen-reader user can tell what the last click did
  without re-reading the page.
- **`role="status"` for in-flight reads, `role="alert"` for failures.** `UnavailableNotice` takes its role from the
  tone: a failed or unavailable read is `alert`, an in-progress read is `status`. The tests assert on the role, not
  the styling.
- **`role="note"` on the two blocks a reader must not skim:** the change classification explanation
  (`data-classification` attribute carries the machine value) and the withheld-disposition block. The boundary-gap
  block is also a `note`.
- **`aria-hidden` on decorative symbols.** Materiality and direction badges print both a word and a symbol
  (`▲`, `▼`, `•`); the symbol is `aria-hidden`, so the accessible name is the word. The visual text is the same word,
  which is what makes the surface non-colour-only rather than colour-plus-aria.

## Colour is never the only channel

| Meaning | Channels |
|---|---|
| Materiality | the word (`IMMATERIAL` / `NOTABLE` / `MATERIAL` / `CRITICAL`) in the cell, a tone class for colour, a symbol (decorative) |
| Direction | the word (`IMPROVED` / `WORSENED` / `UNCHANGED` / `APPEARED` / `DISAPPEARED` / `NOT_COMPARABLE`) |
| Coverage state | the state string itself (`UNMATCHED`, `AMBIGUOUS`, `INELIGIBLE`, `STALE_REFERENCE`, `OUT_OF_SCOPE_SECURITY`, `REJECTED_MALFORMED_ISIN`, `RESOLVED`) plus its reason text |
| Withheld vs missing | "Withheld — no verb was produced" (with reasons and unmet inputs) versus
  `not available — <reason>` |
| Review required | "Review is required — priority HIGH" (words) before the badge |

Assertion: `iid6ChangeTimeline.test.tsx` › "renders numeric and categorical values with direction in words, never by
colour alone" asserts the words are present in the rendered cell text.

## Keyboard reachability

- Every link and button is in the natural tab order; there are no custom key handlers and no keyboard traps.
- On the company surface the tab order is: shell navigation → version buttons (`v1`, `v2`) → sector reference link →
  disposition links → timeline pair buttons. Because the evidence list and the tables contain real links, they are
  reachable without JavaScript-specific focus management.
- The pair selector keeps focus on the clicked button after the active comparison changes (no re-mount of the control,
  because `selected` is state and the buttons key off the pair ids), so a keyboard user does not lose their place.
- No control is disabled without an explanation; the surfaces simply do not render a control for something they
  cannot do (for example: there is no "reconcile" button, so nothing to disable).

## Reading order and structure

- One `h1` per page; `h2` per `SurfaceSection`; `h3`/`h4` inside. The coverage page keeps `h1` → `h2` sections and its
  tables carry `caption`s that name what they contain ("Both versions side by side — clocks and model identity",
  "Portfolio context the disposition was measured against").
- The sector disclosure is an `aside` **after** the assessment sections in document order, which is what makes the
  "not an input to the assessment" claim true structurally as well as textually.
- Numeric tables use `<th scope="row">` for the measure and `<th scope="col">` for the columns, so a screen reader
  announces "Position weight, 40%" rather than an unlabelled number.

## Known gaps (stated, not hidden)

- The surface has not been exercised with a real screen reader in this sandbox; the claims above are structural
  (roles, names, text content) and are asserted in tests, not by an assistive-technology audit. A manual NVDA/VoiceOver
  pass remains worthwhile before any production claim — and production is out of scope for this phase.
- Long digests (64-hex) are rendered inside `<code>` with truncation in prose but full value in the version line. A
  screen reader will read the full string; that is intended (a digest is a fact, not decoration), but it is verbose.
- The `en-IN` number grouping (`6,12,00,00,000`) is correct for the locale but unusual to a non-Indian reader; it is
  used consistently and never for a value that was absent.
