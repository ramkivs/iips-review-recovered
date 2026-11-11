/**
 * Contract tests for `DhanInstrumentSearch.css`.
 *
 * WHY A TEST ON A STYLESHEET
 *   The screen's presentation lives in a co-located stylesheet, so a broken or
 *   drifting selector silently degrades the UI with no test failure anywhere
 *   else: the component still renders and every behaviour test still passes.
 *   These tests pin the invariants that keep the screen inside the existing
 *   design system and inside its own scope.
 *
 * WHAT IS DELIBERATELY NOT ASSERTED
 *   jsdom does not apply stylesheets, so nothing here claims a visual result.
 *   Computed-style and geometry verification is performed in a real browser
 *   (see the report's layout-audit evidence); this file guards the contract the
 *   browser audit depends on.
 *
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RAW = readFileSync(path.join(HERE, 'DhanInstrumentSearch.css'), 'utf8');
/** Comments are prose and must not be mistaken for declarations or selectors. */
const CSS = RAW.replace(/\/\*[\s\S]*?\*\//g, '');
const LINES = CSS.split(/\r?\n/);

/** Colour literals that are NOT semantic tokens. */
function rawColourLiterals(source: string): readonly string[] {
  const hex = source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  const rgb = source.match(/\brgba?\([^)]*\)/g) ?? [];
  return [...hex, ...rgb];
}

describe('the screen does not introduce a parallel design system', () => {
  it('resolves every colour through a semantic token, except the one documented gap', () => {
    // The frozen token set in src/core/tokens defines no "text on a filled accent
    // surface" token. #ffffff on --color-focus is the only value that clears AA in
    // both themes, and it is documented in place. Anything else is a regression.
    const literals = rawColourLiterals(CSS).filter((value) => value !== '#ffffff');
    expect(literals).toEqual([]);
  });

  it('uses the shared radius and elevation tokens rather than hard-coded shadows', () => {
    // A literal px shadow would be a new elevation ramp.
    const shadows = CSS.match(/box-shadow:\s*[^;]+;/g) ?? [];
    const nonToken = shadows.filter((s) => !/var\(--elev-\d\)/.test(s) && !/box-shadow:\s*none/.test(s));
    expect(nonToken).toEqual([]);
  });

  it('uses the frozen control-height tokens for fields and buttons', () => {
    // control.md = 32px, control.lg = 40px (src/core/tokens).
    expect(CSS).toMatch(/height:\s*32px/);
    expect(CSS).toMatch(/height:\s*40px/);
  });

  it('inherits the application font family on every form control', () => {
    // Without this, inputs fall back to the UA font (measured as Arial before the
    // correction) while the rest of the page uses the application's system-ui.
    expect(CSS).toMatch(/font-family:\s*inherit/);
  });
});

describe('the stylesheet cannot leak into another screen', () => {
  it('namespaces every selector with dhanid-', () => {
    const selectors = LINES.flatMap((line) => {
      const matches = line.match(/^\s*\.([a-zA-Z][\w-]*)?/g) ?? [];
      return matches.map((m) => m.trim());
    });
    const stray = selectors.filter((s) => s.startsWith('.') && !s.startsWith('.dhanid'));
    expect(stray).toEqual([]);
  });

  it('never uses an element selector, an id selector or a universal selector', () => {
    // Keyframe steps (`from {` / `to {`) are not selectors; everything else that
    // opens a bare block would be able to restyle markup outside this screen.
    const outsideKeyframes = CSS.replace(/@keyframes[\s\S]*?\n\}/g, '');
    const stray = outsideKeyframes
      .split(/\r?\n/)
      .filter((line) => /^\s*(?:[a-z]+\s*,?\s*\{|#|\*)/.test(line.trim() === '' ? '' : line));
    expect(stray).toEqual([]);
  });
});

describe('the stylesheet declares the states a stylesheet is there to provide', () => {
  it('declares hover, focus-visible and disabled states for controls', () => {
    expect(CSS).toMatch(/:hover/);
    expect(CSS).toMatch(/:focus-visible/);
    expect(CSS).toMatch(/:disabled/);
  });

  it('declares a loading indicator that is animated', () => {
    expect(CSS).toMatch(/@keyframes\s+dhanid-spin/);
    expect(CSS).toMatch(/animation:\s*dhanid-spin/);
  });

  it('declares responsive breakpoints for narrow viewports', () => {
    const queries = CSS.match(/@media[^{]+/g) ?? [];
    expect(queries.length).toBeGreaterThanOrEqual(2);
    expect(queries.map((q) => q.trim())).toEqual([
      '@media (max-width: 720px)',
      '@media (max-width: 420px)',
    ]);
  });

  it('collapses the two-column layout and the results grid on narrow viewports', () => {
    const narrow = CSS.slice(CSS.indexOf('@media (max-width: 720px)'));
    expect(narrow).toMatch(/\.dhanid-columns\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    expect(narrow).toMatch(/\.dhanid-results[^{]*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  });

  it('uses fluid auto-fit grids so the layout reflows without a media query', () => {
    // This is what prevents horizontal scrolling between the breakpoints.
    expect(CSS).toMatch(/repeat\(auto-fit,\s*minmax\(/);
    expect(CSS).toMatch(/repeat\(auto-fill,\s*minmax\(/);
  });
});

describe('the governance panel is informational, never an error', () => {
  it('accents the panel with the informational token, not a negative one', () => {
    const panel = CSS.slice(CSS.indexOf('.dhanid-governance {'));
    const block = panel.slice(0, panel.indexOf('}') + 1);
    expect(block).toContain('var(--color-status-informational)');
    expect(block).not.toContain('var(--color-status-negative)');
    expect(block).not.toContain('var(--color-status-critical)');
    expect(block).not.toContain('var(--color-status-warning)');
  });
});
