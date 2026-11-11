import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  BrokerChip,
  BrokerDisclosure,
  BrokerNotice,
  BrokerPanel,
  BrokerSpinner,
  BrokerSummary,
  BrokerSummaryItem,
} from './BrokerWorkspace';

/**
 * Guards for the shared broker-workspace presentation layer.
 *
 * These pin the two properties the redesign depends on and that a later edit could silently
 * undo: meaning is never carried by colour alone, and the live-region/alert roles stay
 * opt-in so a repeated decorative chip cannot flood a screen reader or break the single
 * status assertions the behaviour tests make.
 */
describe('Broker workspace primitives', () => {
  it('carries chip meaning in text, not only in colour', () => {
    const { rerender } = render(<BrokerChip label="VERIFIED" tone="positive" glyph="✓" />);
    // The tone is expressed through a modifier class; the word itself stays in the text.
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
    const chip = screen.getByText('VERIFIED').closest('.bw-chip');
    expect(chip).not.toBeNull();
    expect(chip?.className).toContain('bw-chip--positive');

    rerender(<BrokerChip label="REFUSED" tone="critical" glyph="✕" />);
    expect(screen.getByText('REFUSED')).toBeInTheDocument();
    const critical = screen.getByText('REFUSED').closest('.bw-chip');
    expect(critical?.className).toContain('bw-chip--critical');
  });

  it('does not give a chip a live-region role, so repeated chips cannot flood a screen reader', () => {
    const { container } = render(<div>
      <BrokerChip label="VERIFIED" tone="positive" />
      <BrokerChip label="VERIFIED" tone="positive" />
    </div>);
    const chips = container.querySelectorAll('.bw-chip');
    expect(chips).toHaveLength(2);
    for (const chip of chips) {
      expect(chip).not.toHaveAttribute('role');
      expect(chip).not.toHaveAttribute('aria-live');
    }
  });

  it('makes the notice an alert only when explicitly asked', () => {
    const { rerender } = render(<BrokerNotice tone="informational" title="Standing condition">Explanatory copy.</BrokerNotice>);
    // A standing condition must not interrupt; only an actionable failure may.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<BrokerNotice tone="critical" alert title="This file was not previewed">Actionable copy.</BrokerNotice>);
    expect(screen.getByRole('alert')).toHaveTextContent('This file was not previewed');
  });

  it('renders an operational disclosure open by default, so a warning is never hidden', () => {
    render(<BrokerDisclosure summary="Storage and integrity limits" open>
      <p>Raw content digests cannot be rechecked without the raw file.</p>
    </BrokerDisclosure>);
    const details = document.querySelector('details.bw-disclosure');
    expect(details).not.toBeNull();
    expect(details).toHaveAttribute('open');
    expect(screen.getByText(/cannot be rechecked without the raw file/)).toBeInTheDocument();
  });

  it('renders summary figures with a label and an optional sub-line', () => {
    render(<BrokerSummary>
      <BrokerSummaryItem label="Resolved" value={47} sub="canonical identity" />
      <BrokerSummaryItem label="Unresolved" value={21} />
    </BrokerSummary>);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByText('canonical identity')).toBeInTheDocument();
    expect(screen.getByText('Unresolved')).toBeInTheDocument();
  });

  it('keeps the spinner decorative so it cannot masquerade as a status', () => {
    const { container } = render(<BrokerSpinner label="Verifying retained evidence…" />);
    expect(screen.getByText('Verifying retained evidence…')).toBeInTheDocument();
    const spinner = container.querySelector('.bw-spinner');
    expect(spinner).not.toBeNull();
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('renders a panel with its heading and optional eyebrow and aside', () => {
    render(<BrokerPanel eyebrow="Step 2 of 3" title="Retained evidence" aside={<span>aside</span>}>
      <p>Body copy.</p>
    </BrokerPanel>);
    expect(screen.getByRole('heading', { name: 'Retained evidence' })).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Body copy.')).toBeInTheDocument();
  });
});

/**
 * The stylesheet must stay on the frozen semantic tokens. A literal colour would drift from
 * the governed palette and would silently break the dark theme.
 */
describe('BrokerWorkspace.css stays on the design tokens', () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const css = readFileSync(path.join(here, 'BrokerWorkspace.css'), 'utf8');
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Keyframe steps (from/to/percentages) are not selectors; drop the whole at-rule body
  // before collecting selectors so they are not mistaken for unscoped rules.
  const withoutKeyframes = withoutComments.replace(/@keyframes[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, '');

  it('uses no literal colour other than the one documented token gap', () => {
    const literals = [...withoutComments.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m => m[0]);
    // --color-on-accent does not exist in the frozen token set; #ffffff on --color-focus is
    // the only value clearing AA in both themes. Every other colour must come from a token.
    const undocumented = literals.filter(v => v.toLowerCase() !== '#ffffff');
    expect(undocumented).toEqual([]);
  });

  it('uses no rgb()/hsl() literal, so every colour resolves through a token', () => {
    const fnColours = [...withoutComments.matchAll(/\b(?:rgba?|hsla?)\([^)]*\)/g)].map(m => m[0]);
    expect(fnColours).toEqual([]);
  });

  it('scopes every rule to the bw- namespace', () => {
    const selectors = [...withoutKeyframes.matchAll(/([^{}]+)\{/g)]
      .map(m => m[1].trim())
      .filter(s => s.length > 0 && !s.startsWith('@'))
      // A comma list is in scope when every one of its parts carries the prefix.
      .flatMap(s => s.split(',').map(p => p.trim()))
      .filter(s => s.length > 0);
    // A rule is in scope when every part of its selector list is anchored to a bw- class.
    const unscoped = selectors.filter(s => !s.includes('.bw-'));
    expect(unscoped).toEqual([]);
  });
});
