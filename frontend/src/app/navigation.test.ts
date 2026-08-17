/**
 * Program v3.0 — Milestone N: navigation honesty model tests.
 * Verifies the presentation-only status classification and role filtering.
 */
import { describe, it, expect } from 'vitest';
import { NAV, NAV_STATUS_LABEL, visibleNav } from './navigation';

describe('navigation model — status classification', () => {
  it('marks fully implemented top-level surfaces as implemented', () => {
    const byLabel = Object.fromEntries(NAV.map((n) => [n.label, n.status]));
    expect(byLabel['Executive']).toBe('implemented');
    expect(byLabel['Portfolio']).toBe('implemented');
    expect(byLabel['Administration']).toBe('implemented');
  });

  it('marks Research / Intelligence / Evidence as partial (module-level scope future)', () => {
    const byLabel = Object.fromEntries(NAV.map((n) => [n.label, n.status]));
    expect(byLabel['Research']).toBe('partial');
    expect(byLabel['Intelligence']).toBe('partial');
    expect(byLabel['Evidence']).toBe('partial');
  });

  it('provides a human-facing label for every status', () => {
    expect(NAV_STATUS_LABEL.implemented).toBe('Implemented');
    expect(NAV_STATUS_LABEL.partial).toBe('Partial');
    expect(NAV_STATUS_LABEL.future).toBe('Future');
  });
});

describe('navigation model — role filtering (unchanged semantics)', () => {
  it('hides Administration for non-admin roles', () => {
    expect(visibleNav('viewer').map((n) => n.label)).not.toContain('Administration');
    expect(visibleNav('analyst').map((n) => n.label)).not.toContain('Administration');
    expect(visibleNav('admin').map((n) => n.label)).toContain('Administration');
  });

  it('keeps viewer surfaces visible to all roles', () => {
    for (const role of ['viewer', 'analyst', 'admin'] as const) {
      const labels = visibleNav(role).map((n) => n.label);
      expect(labels).toContain('Executive');
      expect(labels).toContain('Portfolio');
      expect(labels).toContain('Research');
      expect(labels).toContain('Intelligence');
      expect(labels).toContain('Evidence');
    }
  });
});
