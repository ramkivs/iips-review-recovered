/**
 * W17 — mode indicator rendering tests (jsdom).
 *
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PortfolioModeIndicator } from './PortfolioModeIndicator';
import { selectPortfolioMode } from './portfolioMode';

const base = { readPresent: true, revision: 7, provenanceDigest: 'ab'.repeat(32), observedAt: '2026-11-22T10:16:40Z' };

describe('W17 PortfolioModeIndicator', () => {
  it('renders ACTUAL with revision, digest, source date and full coverage', () => {
    const decision = selectPortfolioMode({
      ...base,
      coverage: { activePositions: 2, valuedPositions: 2, unresolvedIdentity: 0, staleObservations: 0, unavailableObservations: 0, unknownObservations: 0, unreadableStatus: 0 },
    });
    render(<PortfolioModeIndicator decision={decision} revision={7} provenanceDigest={'ab'.repeat(32)} observedAt="2026-11-22T10:16:40Z" coverage={{ activePositions: 2, valuedPositions: 2 }} />);
    expect(screen.getByTestId('portfolio-mode')).toHaveTextContent('ACTUAL');
    const details = screen.getByTestId('portfolio-mode-details').textContent ?? '';
    expect(details).toContain('revision 7');
    expect(details).toContain('read at 2026-11-22T10:16:40Z');
    expect(details).toContain('coverage 2/2 valued');
    expect(details).not.toContain('missing:');
  });

  it('renders REFERENCE for persisted data without observation evidence, labelled as not actual', () => {
    const decision = selectPortfolioMode({ ...base, coverage: null });
    render(<PortfolioModeIndicator decision={decision} revision={1} provenanceDigest={'cd'.repeat(32)} observedAt="2026-11-22T10:16:40Z" />);
    expect(screen.getByTestId('portfolio-mode')).toHaveTextContent('REFERENCE');
    expect(screen.getByTestId('portfolio-mode-details').textContent).toContain('missing: qualified observations');
    expect(screen.getByTestId('portfolio-mode-details').textContent).toContain('coverage unavailable');
  });

  it('renders DEGRADED with the explicit missing list (partial coverage, UNKNOWN distinct from STALE)', () => {
    const decision = selectPortfolioMode({
      ...base,
      coverage: { activePositions: 3, valuedPositions: 1, unresolvedIdentity: 1, staleObservations: 0, unavailableObservations: 0, unknownObservations: 1, unreadableStatus: 0 },
    });
    render(<PortfolioModeIndicator decision={decision} revision={7} provenanceDigest={'ab'.repeat(32)} observedAt="2026-11-22T10:16:40Z" coverage={{ activePositions: 3, valuedPositions: 1 }} />);
    expect(screen.getByTestId('portfolio-mode')).toHaveTextContent('DEGRADED');
    const details = screen.getByTestId('portfolio-mode-details').textContent ?? '';
    expect(details).toContain('coverage 1/3 valued');
    expect(details).toContain('UNKNOWN');
    expect(details).toContain('unresolved');
    expect(details).not.toContain('stale'); // zero stale observations are not listed
  });

  it('never fabricates: unavailable revision/digest/date render as unavailable, never as values', () => {
    const decision = selectPortfolioMode({ readPresent: false, revision: null, provenanceDigest: null, observedAt: null, coverage: null });
    render(<PortfolioModeIndicator decision={decision} revision={null} provenanceDigest={null} observedAt={null} />);
    expect(screen.getByTestId('portfolio-mode')).toHaveTextContent('DEGRADED');
    const details = screen.getByTestId('portfolio-mode-details').textContent ?? '';
    expect(details).toContain('revision unavailable');
    expect(details).toContain('source digest unavailable');
    expect(details).toContain('time unavailable');
  });
});
