/**
 * Program v3.0 — Milestone N (+N+1): navigation honesty model tests.
 * Verifies the presentation-only status classification, child-level reconciliation,
 * and role filtering.
 */
import { describe, it, expect } from 'vitest';
import { NAV, NAV_STATUS_LABEL, visibleNav } from './navigation';

const byLabel = Object.fromEntries(NAV.map((n) => [n.label, n]));

function childrenOf(label: string) {
  return byLabel[label]?.children ?? [];
}

describe('navigation model — status classification (top level)', () => {
  it('marks fully implemented top-level surfaces as implemented', () => {
    expect(byLabel['Executive'].status).toBe('implemented');
    expect(byLabel['Portfolio'].status).toBe('implemented');
    expect(byLabel['Administration'].status).toBe('implemented');
  });

  it('marks Research / Intelligence / Evidence as partial (module-level scope future)', () => {
    expect(byLabel['Research'].status).toBe('partial');
    expect(byLabel['Intelligence'].status).toBe('partial');
    expect(byLabel['Evidence'].status).toBe('partial');
  });

  it('provides a human-facing label for every status', () => {
    expect(NAV_STATUS_LABEL.implemented).toBe('Implemented');
    expect(NAV_STATUS_LABEL.partial).toBe('Partial');
    expect(NAV_STATUS_LABEL.future).toBe('Future');
  });
});

describe('navigation model — Milestone N+1 child reconciliation', () => {
  it('Administration children match the 8 governed read-only tabs', () => {
    const labels = childrenOf('Administration').map((c) => c.label);
    expect(labels).toEqual([
      'Overview',
      'Identity & Access',
      'Tenants',
      'Engines & Certification',
      'Platform Operations',
      'Audit',
      'Live Data & Governance',
      'Migration / Workflow / Marketplace',
    ]);
  });

  it('Administration children deep-link to their tab ids under /admin/*', () => {
    const paths = childrenOf('Administration').map((c) => c.path);
    expect(paths).toEqual([
      '/admin/overview',
      '/admin/identity',
      '/admin/tenancy',
      '/admin/engines',
      '/admin/platform',
      '/admin/audit',
      '/admin/data',
      '/admin/operations',
    ]);
  });

  it('removes the dead /evidence/snapshots child', () => {
    const paths = childrenOf('Evidence').map((c) => c.path);
    expect(paths).not.toContain('/evidence/snapshots');
    expect(paths).not.toContain('/evidence/snapshots/');
  });

  it('marks future-only children as future (never implemented)', () => {
    const statusOf = (group: string, label: string) =>
      childrenOf(group).find((c) => c.label === label)?.status;
    expect(statusOf('Portfolio', 'Holdings')).toBe('future');
    expect(statusOf('Research', 'Sector')).toBe('future');
    expect(statusOf('Intelligence', 'Opportunities')).toBe('future');
    expect(statusOf('Intelligence', 'Risks')).toBe('future');
    expect(statusOf('Intelligence', 'Rankings')).toBe('future');
    expect(statusOf('Evidence', 'Decision Evidence')).toBe('future');
  });

  it('marks implemented children as implemented', () => {
    const statusOf = (group: string, label: string) =>
      childrenOf(group).find((c) => c.label === label)?.status;
    expect(statusOf('Portfolio', 'Overview')).toBe('implemented');
    expect(statusOf('Research', 'Company')).toBe('implemented');
    expect(statusOf('Research', 'Cross-Sector')).toBe('implemented');
    expect(statusOf('Intelligence', 'Decision Matrix')).toBe('implemented');
    expect(statusOf('Evidence', 'Replay')).toBe('implemented');
  });

  it('marks all Administration children as implemented', () => {
    for (const c of childrenOf('Administration')) {
      expect(c.status).toBe('implemented');
    }
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
