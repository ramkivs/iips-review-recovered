/**
 * Program v3.0 — Milestone N (+N+1): navigation honesty model tests.
 * Verifies the presentation-only status classification, child-level reconciliation,
 * and role filtering.
 */
import { describe, it, expect } from 'vitest';
import { NAV, NAV_STATUS_LABEL, visibleNav, type NavItem } from './navigation';
import { ROUTES } from './routes';

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
    expect(statusOf('Research', 'Sector')).toBe('future');
    expect(statusOf('Intelligence', 'Opportunities')).toBe('future');
    expect(statusOf('Intelligence', 'Risks')).toBe('future');
    expect(statusOf('Intelligence', 'Rankings')).toBe('future');
  });

  it('N+16: removes the dead Portfolio Holdings child (no dedicated surface)', () => {
    expect(childrenOf('Portfolio').map((c) => c.label)).not.toContain('Holdings');
    expect(childrenOf('Portfolio').map((c) => c.path)).not.toContain('/portfolio/:id/holdings');
  });

  it('N+17: removes the dead Evidence Replay child (route-template, no concrete sector)', () => {
    const evidence = childrenOf('Evidence');
    expect(evidence.map((c) => c.label)).not.toContain('Replay');
    expect(evidence.map((c) => c.path)).not.toContain('/evidence/replay/:id');
    expect(evidence.map((c) => c.label)).toEqual(['Decision Evidence']);
    expect(evidence.map((c) => c.path)).toEqual(['/evidence']);
  });

  it('N+17: no navigable (implemented/partial) entry exposes a route template (:id)', () => {
    const walk = (items: NavItem[], acc: NavItem[] = []): NavItem[] => {
      for (const item of items) {
        acc.push(item);
        if (item.children) walk(item.children, acc);
      }
      return acc;
    };
    const navigable = walk(NAV).filter((n) => n.status !== 'future');
    expect(navigable.length).toBeGreaterThan(0);
    for (const n of navigable) {
      expect(n.path).not.toContain(':id');
    }
  });

  it('marks implemented children as implemented', () => {
    const statusOf = (group: string, label: string) =>
      childrenOf(group).find((c) => c.label === label)?.status;
    expect(statusOf('Portfolio', 'Overview')).toBe('implemented');
    expect(statusOf('Research', 'Company')).toBe('implemented');
    expect(statusOf('Research', 'Cross-Sector')).toBe('implemented');
    expect(statusOf('Intelligence', 'Decision Matrix')).toBe('implemented');
    expect(statusOf('Evidence', 'Decision Evidence')).toBe('implemented');
  });

  it('N+7: the Company entry resolves to a concrete route, not the literal :id template', () => {
    const company = childrenOf('Research').find((c) => c.label === 'Company');
    expect(company?.path).toBe('/research/company/Banking');
    expect(company?.path).not.toContain(':id');
    // The route declaration itself remains a valid sector-template for concrete values.
    expect(ROUTES.researchCompany).toBe('/research/company/:id');
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
