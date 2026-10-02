/**
 * Program v3.0 — NP-06 Reports: Reports → NP-04 persistence binding tests.
 *
 * HOW THIS IS TESTED.
 * The dependency boundary is RESOLVED: `frontend/package.json` pins the published NP-04 commit
 * `2e11fa3b`, which exports the `./persistence` subpath, so the authoritative module now resolves in
 * this environment and the descriptor's claims about it are asserted against reality rather than
 * restated (see the boundary-descriptor test at the end of this file, and 15c).
 *
 * The binding contract itself is still exercised against a TEST-ONLY port double that reproduces
 * NP-04's observable semantics, because the suite must not depend on a live database. Executing the
 * real foundation stays OUT of this suite, two ways (both reported):
 *   - NP-04's own dedicated 22-test suite, executed separately;
 *   - an end-to-end run of THIS binding against the authoritative NP-04 module, including a real
 *     cross-process restart.
 *
 * The resolver is additionally gated on a SERVER-OWNED database path, because NP-04 owns the schema
 * and migrations and must open its own handle: with no path configured it fails closed (see 15c/15e).
 *
 * What lives here is the binding contract. It is exercised against a TEST-ONLY port double that
 * reproduces NP-04's observable semantics (owner scoping, minted instance ids, version increment,
 * head-only supersession, chain addressing, durable write-through to a shared backing store).
 * The double is defined IN THIS TEST FILE and is never imported by production code — there is no
 * Reports-local persistence implementation.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { ReportingEngine } from '../../../iips-platform/src/sector-engines/cross-sector/reporting/ReportingEngine';
import type { Principal } from '../../../iips-platform/src/distributed/EnterpriseRuntime';
import { ReportsPersistence, ReportPersistenceError, toNp04Content, recomputeReportKey } from './persistence';
import { assertNp04PersistencePort, loadAuthoritativeNp04Persistence, NP04_BOUNDARY, NP04_DATABASE_PATH_ENV, PersistenceBoundaryError } from './persistence-port';
import { adaptNp04Store, resolveAuthoritativeNp04Port } from './np04-adapter';
import { deriveReportKey } from './canonical';
import type {
  Np04ArtifactContent,
  Np04GovernedArtifact,
  Np04QueryOptions,
  Np04QueryPage,
  Np04SupersessionView,
  ReportsPersistencePort,
} from './persistence-port';

/* ------------------------------------------------------------------------------------------------
 * TEST-ONLY port double.
 *
 * Reproduces NP-04's observable contract. Instance ids are minted here exactly as the foundation
 * mints them (UUIDv4), which is what lets the tests prove Reports takes identity FROM persistence.
 * ---------------------------------------------------------------------------------------------- */
interface Row {
  reportId: string;
  chainId: string;
  tenantId: string;
  userId: string;
  reportKey: string;
  reportType: string;
  portfolioId: string;
  scenario: string | null;
  parameters: Record<string, string | number | boolean | null> | null;
  schemaVersion: number;
  artifactVersion: number;
  supersedesReportId: string | null;
  generatedAt: string;
  canonicalPayload: string;
  provenance: Record<string, unknown>;
  createdAt: string;
  seq: number;
}

/** Shared backing store — models the durable substrate. Reopening it models a restart. */
class BackingStore {
  readonly rows: Row[] = [];
  private seq = 0;
  nextSeq(): number {
    this.seq += 1;
    return this.seq;
  }
  mintId(): string {
    // Deterministic-but-unique stand-in for UUIDv4: uniqueness and content-independence are what
    // the contract requires, and both hold.
    this.seq += 1;
    return `00000000-0000-4000-8000-${String(this.seq).padStart(12, '0')}`;
  }
}

function ownerOf(authenticated: unknown): { tenantId: string; userId: string } {
  const o = authenticated as { tenantId?: unknown; userId?: unknown } | null;
  if (o === null || typeof o !== 'object' || typeof o.tenantId !== 'string' || typeof o.userId !== 'string') {
    throw new Error('owner must be an object with tenantId and userId');
  }
  return { tenantId: o.tenantId, userId: o.userId };
}

function rowFor(store: BackingStore, owner: { tenantId: string; userId: string }, reportId: string): Row | undefined {
  return store.rows.find(
    (r) => r.reportId === reportId && r.tenantId === owner.tenantId && r.userId === owner.userId,
  );
}

function toArtifact(r: Row): Np04GovernedArtifact {
  return {
    reportId: r.reportId,
    chainId: r.chainId,
    tenantId: r.tenantId,
    userId: r.userId,
    reportKey: r.reportKey,
    reportType: r.reportType,
    portfolioId: r.portfolioId,
    scenario: r.scenario,
    parameters: r.parameters,
    schemaVersion: r.schemaVersion,
    artifactVersion: r.artifactVersion,
    supersedesReportId: r.supersedesReportId,
    generatedAt: r.generatedAt,
    canonicalPayload: r.canonicalPayload,
    provenance: r.provenance,
    createdAt: r.createdAt,
  };
}

/** A fresh port over a given backing store. A new port over the same store models a restart. */
function np04Double(store = new BackingStore()): ReportsPersistencePort & { __store: BackingStore } {
  const insert = (
    owner: { tenantId: string; userId: string },
    content: Np04ArtifactContent,
    version: number,
    chainId: string,
    supersedes: string | null,
  ): Np04GovernedArtifact => {
    if (typeof content?.canonicalPayload !== 'string') throw new Error('canonicalPayload must be a string');
    // The foundation derives content identity itself; Reports' declared key is not trusted.
    const reportKey = deriveReportKey({
      reportType: content.reportType,
      portfolioId: content.portfolioId,
      scenario: content.scenario ?? null,
      parameters: content.parameters ?? null,
    });
    const row: Row = {
      reportId: store.mintId(),
      chainId,
      tenantId: owner.tenantId,
      userId: owner.userId,
      reportKey,
      reportType: content.reportType,
      portfolioId: content.portfolioId,
      scenario: content.scenario ?? null,
      parameters: content.parameters ?? null,
      schemaVersion: content.schemaVersion ?? 1,
      artifactVersion: version,
      supersedesReportId: supersedes,
      generatedAt: content.generatedAt ?? '1970-01-01T00:00:00.000Z',
      canonicalPayload: content.canonicalPayload,
      provenance: content.provenance,
      createdAt: content.generatedAt ?? '1970-01-01T00:00:00.000Z',
      seq: store.nextSeq(),
    };
    store.rows.push(row);
    return toArtifact(row);
  };

  return {
    __store: store,
    createInstance(authenticated, content) {
      const owner = ownerOf(authenticated);
      // NP-04: the root of a chain is its own report_id, so the chain is addressable by instance
      // identity. The same minted id is both reportId and chainId.
      const id = store.mintId();
      const inserted = insert(owner, content, 1, id, null);
      const row = store.rows[store.rows.length - 1]!;
      row.reportId = id;
      return { ...inserted, reportId: id, chainId: id };
    },
    appendVersion(authenticated, supersedesReportId, content) {
      const owner = ownerOf(authenticated);
      const parent = rowFor(store, owner, supersedesReportId);
      if (!parent) throw new Error('artifact to supersede not found for this owner');
      const head = store.rows
        .filter((r) => r.chainId === parent.chainId && r.tenantId === owner.tenantId && r.userId === owner.userId)
        .sort((a, b) => b.artifactVersion - a.artifactVersion)[0];
      if (!head || head.reportId !== supersedesReportId) {
        throw new Error('only the current head of an instance chain may be superseded');
      }
      return insert(owner, content, head.artifactVersion + 1, parent.chainId, supersedesReportId);
    },
    resolveById(authenticated, reportId) {
      const owner = ownerOf(authenticated);
      const row = rowFor(store, owner, reportId);
      if (!row) throw new Error('artifact not found for this owner');
      return toArtifact(row);
    },
    queryByOwner(authenticated, options: Np04QueryOptions = {}): Np04QueryPage {
      const owner = ownerOf(authenticated);
      const limit = options.limit ?? 20;
      const mine = store.rows.filter((r) => r.tenantId === owner.tenantId && r.userId === owner.userId);
      const heads = mine
        .filter((r) => !mine.some((o) => o.chainId === r.chainId && o.artifactVersion > r.artifactVersion))
        .sort((a, b) => (a.generatedAt < b.generatedAt ? -1 : a.generatedAt > b.generatedAt ? 1 : a.seq - b.seq));
      const items = heads.slice(0, limit).map(toArtifact);
      return { items, nextCursor: heads.length > limit ? (items[items.length - 1]?.reportId ?? null) : null };
    },
    listSupersededBy(authenticated, reportId): Np04SupersessionView {
      const owner = ownerOf(authenticated);
      const current = rowFor(store, owner, reportId);
      if (!current) throw new Error('artifact not found for this owner');
      const versions: Np04GovernedArtifact[] = [];
      let cursor = current.supersedesReportId;
      while (cursor !== null) {
        const row = rowFor(store, owner, cursor);
        if (!row) throw new Error('supersession chain is broken');
        versions.push(toArtifact(row));
        cursor = row.supersedesReportId;
      }
      return { current: toArtifact(current), versions };
    },
  };
}

/* ------------------------------------------------------------------------------------------------
 * Fixtures
 * ---------------------------------------------------------------------------------------------- */
const PRINCIPAL: Principal = { userId: 'user-a', tenantId: 'tenant-A', roles: ['analyst'] };
const OTHER_PRINCIPAL: Principal = { userId: 'user-b', tenantId: 'tenant-A', roles: ['analyst'] };
const FOREIGN_PRINCIPAL: Principal = { userId: 'user-a', tenantId: 'tenant-B', roles: ['analyst'] };
const GENERATED_AT = '2026-10-02T09:00:00.000Z';

function engineOutput(scenario = 'Base') {
  const intelligence = {
    scenario,
    sectorExposure: { Technology: 0.4 },
    concentration: { hhi: 0.31 },
    diversificationScore: 0.72,
    avgConviction: 0.66,
    avgQuality: 0.71,
    avgRisk: 0.22,
  };
  const ranking = [{ companyId: 'TECH-1', sector: 'Technology', conviction: 0.8 }];
  const allocation = { recommendation: { Technology: 0.4 }, rulesApplied: ['cap-40'] };
  const diversification = { diversificationBand: 'MODERATE', flags: [] };
  const opportunity = { top: [{ companyId: 'TECH-1', sector: 'Technology', conviction: 0.8 }], rationale: 'reasons' };
  const correlation = { flags: [] };
  return new ReportingEngine().build(
    'Portfolio Summary',
    'P-1',
    intelligence as never,
    ranking as never,
    allocation as never,
    diversification as never,
    opportunity as never,
    correlation as never,
  );
}

function input(overrides: Partial<Parameters<ReportsPersistence['persistNew']>[1]> = {}) {
  return { engineOutput: engineOutput(), generatedAt: GENERATED_AT, parameters: { horizon: '12m' }, ...overrides };
}

/* ------------------------------------------------------------------------------------------------
 * Tests
 * ---------------------------------------------------------------------------------------------- */
describe('Reports -> NP-04 binding — createInstance', () => {
  it('1. valid artifact is persisted via createInstance', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const artifact = svc.persistNew(PRINCIPAL, input());

    expect(artifact.artifactVersion).toBe(1);
    expect(artifact.supersedesReportId).toBeNull();
    expect(artifact.reportType).toBe('Portfolio Summary');
    expect(port.__store.rows).toHaveLength(1);
  });

  it('2. the durable reportId comes from persistence, not from content', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const artifact = svc.persistNew(PRINCIPAL, input());

    expect(artifact.reportId).toBe(port.__store.rows[0]!.reportId);
    // Not the engine's content-derived id, and not derived from the reportKey.
    expect(artifact.reportId).not.toBe(engineOutput().reportId);
    expect(artifact.reportId).not.toBe(artifact.reportKey);
    expect(artifact.reportId).not.toContain('portfolio-summary');
  });

  it('3. persisted ownership equals the authenticated principal', () => {
    const svc = new ReportsPersistence(np04Double());
    expect(svc.persistNew(PRINCIPAL, input()).ownership).toEqual({ tenantId: 'tenant-A', userId: 'user-a' });
  });

  it('3b. ownership cannot be supplied by the caller', () => {
    const svc = new ReportsPersistence(np04Double());
    // The compose input has no ownership field; a smuggled one cannot influence the result.
    const artifact = svc.persistNew(PRINCIPAL, {
      ...input(),
      ownership: { tenantId: 'tenant-B', userId: 'attacker' },
    } as never);
    expect(artifact.ownership).toEqual({ tenantId: 'tenant-A', userId: 'user-a' });
  });

  it('13. identical content yields distinct durable instance ids and an identical reportKey', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const one = svc.persistNew(PRINCIPAL, input());
    const two = svc.persistNew(PRINCIPAL, input());

    expect(one.reportKey).toBe(two.reportKey); // content identity is equal
    expect(one.reportId).not.toBe(two.reportId); // instance identity is not
    expect(one.chainId).toBeUndefined(); // Reports does not expose chain internals as identity
    expect(port.__store.rows).toHaveLength(2);
  });

  it('13b. Reports mints no identity of its own', () => {
    // The production module must not import an id generator: identity is only ever read back
    // from the foundation. (Behavioural proxy: two services over one port agree on ids.)
    const port = np04Double();
    const a = new ReportsPersistence(port).persistNew(PRINCIPAL, input());
    const b = new ReportsPersistence(port).resolve(PRINCIPAL, a.reportId);
    expect(b.reportId).toBe(a.reportId);
  });

  it('4. a persisted reportKey that does not recompute is rejected on the way out (§5.3)', () => {
    const port = np04Double();
    const tampered: ReportsPersistencePort = {
      ...port,
      createInstance: (auth, content) => ({ ...port.createInstance(auth, content), reportKey: 'f'.repeat(64) }),
    };
    const svc = new ReportsPersistence(tampered);
    expect(() => svc.persistNew(PRINCIPAL, input())).toThrow(
      /persisted artifact violates the NP-06 §5.3 contract/,
    );
  });

  it('4a. a SELF-CONSISTENT persisted artifact for different content is rejected by the integrity link', () => {
    // Every field agrees with itself, so §5.3 revalidation passes — but the content is not the
    // content that was submitted. Only the submitted/persisted cross-check can catch this.
    const port = np04Double();
    const tampered: ReportsPersistencePort = {
      ...port,
      createInstance: (auth, content) => {
        const real = port.createInstance(auth, content);
        const reportType = 'Executive';
        return {
          ...real,
          reportType,
          reportKey: deriveReportKey({ reportType, portfolioId: real.portfolioId, scenario: real.scenario, parameters: real.parameters }),
        };
      },
    };
    expect(() => new ReportsPersistence(tampered).persistNew(PRINCIPAL, input())).toThrow(
      /reportKey differs from the validated content identity/,
    );
  });

  it('4b. a persisted canonicalPayload that differs from the validated payload is rejected', () => {
    const port = np04Double();
    const tampered: ReportsPersistencePort = {
      ...port,
      createInstance: (auth, content) => ({ ...port.createInstance(auth, content), canonicalPayload: '{"x":1}' }),
    };
    expect(() => new ReportsPersistence(tampered).persistNew(PRINCIPAL, input())).toThrow(
      /canonicalPayload differs from the validated canonical payload/,
    );
  });

  it('4c. persisted ownership that differs from the principal is rejected', () => {
    const port = np04Double();
    const tampered: ReportsPersistencePort = {
      ...port,
      createInstance: (auth, content) => ({ ...port.createInstance(auth, content), tenantId: 'tenant-B' }),
    };
    expect(() => new ReportsPersistence(tampered).persistNew(PRINCIPAL, input())).toThrow(
      /persisted artifact violates the NP-06 §5.3 contract/,
    );
  });

  it('5. invalid artifacts are rejected before persistence is reached', () => {
    const port = np04Double();
    const spy = vi.spyOn(port, 'createInstance');
    const svc = new ReportsPersistence(port);

    // Malformed generatedAt.
    expect(() => svc.persistNew(PRINCIPAL, { ...input(), generatedAt: '2026-10-02T09:00:00' })).toThrow();
    // Non-canonicalizable payload.
    const bad = { ...engineOutput(), payload: { n: Infinity } };
    expect(() => svc.persistNew(PRINCIPAL, { ...input(), engineOutput: bad })).toThrow();
    // Inconsistent engine output.
    const bogus = { ...engineOutput(), reportId: 'report-made-up' };
    expect(() => svc.persistNew(PRINCIPAL, { ...input(), engineOutput: bogus })).toThrow();

    expect(spy).not.toHaveBeenCalled();
  });

  it('5b. an unusable principal is rejected before persistence', () => {
    const port = np04Double();
    const spy = vi.spyOn(port, 'createInstance');
    const svc = new ReportsPersistence(port);
    expect(() => svc.persistNew({ tenantId: '', userId: 'u', roles: [] } as never, input())).toThrow();
    expect(spy).not.toHaveBeenCalled();
  });

  it('14. persistence failure is fail-closed (no artifact reported as created)', () => {
    const port = np04Double();
    port.createInstance = () => {
      throw new Error('disk full');
    };
    const svc = new ReportsPersistence(port);
    expect(() => svc.persistNew(PRINCIPAL, input())).toThrow(ReportPersistenceError);
    expect(() => svc.persistNew(PRINCIPAL, input())).toThrow(/createInstance failed/);
  });
});

describe('Reports -> NP-04 binding — appendVersion / supersession', () => {
  it('6. appendVersion preserves the version chain', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const v1 = svc.persistNew(PRINCIPAL, input());
    const v2 = svc.appendVersion(PRINCIPAL, v1.reportId, { ...input(), generatedAt: '2026-10-02T10:00:00.000Z' });
    const v3 = svc.appendVersion(PRINCIPAL, v2.reportId, { ...input(), generatedAt: '2026-10-02T11:00:00.000Z' });

    expect([v1.artifactVersion, v2.artifactVersion, v3.artifactVersion]).toEqual([1, 2, 3]);
    expect(v2.supersedesReportId).toBe(v1.reportId);
    expect(v3.supersedesReportId).toBe(v2.reportId);
    expect(v3.ownership).toEqual(v1.ownership);
  });

  it('7. supersession remains single-parent: only the head may be superseded', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const v1 = svc.persistNew(PRINCIPAL, input());
    const v2 = svc.appendVersion(PRINCIPAL, v1.reportId, { ...input(), generatedAt: '2026-10-02T10:00:00.000Z' });
    expect(v2.supersedesReportId).toBe(v1.reportId);

    // Superseding the non-head v1 must fail.
    expect(() => svc.appendVersion(PRINCIPAL, v1.reportId, { ...input(), generatedAt: '2026-10-02T12:00:00.000Z' }))
      .toThrow(/appendVersion failed/);
    expect(port.__store.rows).toHaveLength(2);
  });

  it('7b. a content-derived engine identifier is refused as a supersession target', () => {
    const svc = new ReportsPersistence(np04Double());
    expect(() => svc.appendVersion(PRINCIPAL, engineOutput().reportId, input())).toThrow(
      /durable instance identity, not a content-derived identifier/,
    );
  });

  it('8. immutable ownership is preserved across the chain', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const v1 = svc.persistNew(PRINCIPAL, input());
    const v2 = svc.appendVersion(PRINCIPAL, v1.reportId, { ...input(), generatedAt: '2026-10-02T10:00:00.000Z' });
    expect(v2.ownership).toEqual(v1.ownership);

    // A different principal cannot append to someone else's chain.
    expect(() => svc.appendVersion(OTHER_PRINCIPAL, v1.reportId, input())).toThrow(/appendVersion failed/);
    expect(() => svc.appendVersion(FOREIGN_PRINCIPAL, v1.reportId, input())).toThrow(/appendVersion failed/);
  });

  it('6b. Reports creates no version implicitly — identical content is not versioned by itself', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const v1 = svc.persistNew(PRINCIPAL, input());
    svc.persistNew(PRINCIPAL, input()); // identical content, no append requested
    expect(port.__store.rows.filter((r) => r.chainId === v1.reportId)).toHaveLength(1);
    expect(port.__store.rows).toHaveLength(2); // a separate instance, not a new version
  });
});

describe('Reports -> NP-04 binding — resolve / query / supersession', () => {
  it('9. resolveById returns the durable artifact', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const created = svc.persistNew(PRINCIPAL, input());
    const resolved = svc.resolve(PRINCIPAL, created.reportId);

    expect(resolved.reportId).toBe(created.reportId);
    expect(resolved.reportKey).toBe(created.reportKey);
    expect(resolved.canonicalPayload).toBe(created.canonicalPayload);
    expect(resolved.ownership).toEqual({ tenantId: 'tenant-A', userId: 'user-a' });
  });

  it('9b. resolve is ownership-scoped: another principal cannot read it', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const created = svc.persistNew(PRINCIPAL, input());
    expect(() => svc.resolve(OTHER_PRINCIPAL, created.reportId)).toThrow(/resolveById failed/);
    expect(() => svc.resolve(FOREIGN_PRINCIPAL, created.reportId)).toThrow(/resolveById failed/);
  });

  it('10. queryByOwner respects (tenantId, userId)', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    svc.persistNew(PRINCIPAL, input({ parameters: { owner: 'a' } }));
    svc.persistNew(OTHER_PRINCIPAL, input({ parameters: { owner: 'b' } }));
    svc.persistNew(FOREIGN_PRINCIPAL, input({ parameters: { owner: 'c' } }));

    const mine = svc.queryByOwner(PRINCIPAL);
    expect(mine.items).toHaveLength(1);
    expect(mine.items.every((i) => i.ownership.userId === 'user-a' && i.ownership.tenantId === 'tenant-A')).toBe(true);

    const theirs = svc.queryByOwner(OTHER_PRINCIPAL);
    expect(theirs.items).toHaveLength(1);
    expect(theirs.items[0]!.ownership.userId).toBe('user-b');
  });

  it('10b. queryByOwner returns heads only and pages deterministically', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const v1 = svc.persistNew(PRINCIPAL, input({ parameters: { k: '1' } }));
    const v2 = svc.appendVersion(PRINCIPAL, v1.reportId, { ...input({ parameters: { k: '1' } }), generatedAt: '2026-10-02T10:00:00.000Z' });
    svc.persistNew(PRINCIPAL, input({ parameters: { k: '2' } }));

    const page = svc.queryByOwner(PRINCIPAL, { limit: 2 });
    expect(page.items).toHaveLength(2);
    // The chain head (v2) is present; the superseded v1 is not.
    expect(page.items.map((i) => i.reportId)).toContain(v2.reportId);
    expect(page.items.map((i) => i.reportId)).not.toContain(v1.reportId);
  });

  it('11. listSupersededBy returns the expected chain', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const v1 = svc.persistNew(PRINCIPAL, input());
    const v2 = svc.appendVersion(PRINCIPAL, v1.reportId, { ...input(), generatedAt: '2026-10-02T10:00:00.000Z' });
    const v3 = svc.appendVersion(PRINCIPAL, v2.reportId, { ...input(), generatedAt: '2026-10-02T11:00:00.000Z' });

    const view = svc.supersessionChain(PRINCIPAL, v3.reportId);
    expect(view.current.reportId).toBe(v3.reportId);
    expect(view.history.map((h) => h.reportId)).toEqual([v2.reportId, v1.reportId]);
    expect(view.history.map((h) => h.artifactVersion)).toEqual([2, 1]);
    expect(view.history[1]!.supersedesReportId).toBeNull();
  });

  it('11b. a non-single-parent or non-contiguous chain is rejected', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const v1 = svc.persistNew(PRINCIPAL, input());
    const v2 = svc.appendVersion(PRINCIPAL, v1.reportId, { ...input(), generatedAt: '2026-10-02T10:00:00.000Z' });
    const v3 = svc.appendVersion(PRINCIPAL, v2.reportId, { ...input(), generatedAt: '2026-10-02T11:00:00.000Z' });

    const broken: ReportsPersistencePort = {
      ...port,
      listSupersededBy: () => {
        const view = port.listSupersededBy(PRINCIPAL, v3.reportId);
        return { current: view.current, versions: [view.versions[1]!, view.versions[0]!] };
      },
    };
    expect(() => new ReportsPersistence(broken).supersessionChain(PRINCIPAL, v3.reportId)).toThrow(
      /not single-parent/,
    );
  });

  it('11c. a chain terminating above version 1 is rejected', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const v1 = svc.persistNew(PRINCIPAL, input());
    const v2 = svc.appendVersion(PRINCIPAL, v1.reportId, { ...input(), generatedAt: '2026-10-02T10:00:00.000Z' });

    const truncated: ReportsPersistencePort = {
      ...port,
      listSupersededBy: (auth, id) => {
        const view = port.listSupersededBy(auth, id);
        if (id !== v2.reportId) return view;
        // Claim a version-2 artifact with no history.
        return { current: view.current, versions: [] };
      },
    };
    expect(() => new ReportsPersistence(truncated).supersessionChain(PRINCIPAL, v2.reportId)).toThrow(
      /must have supersession history/,
    );
  });

  it('11d. non-empty reportId is required for resolve and supersession', () => {
    const svc = new ReportsPersistence(np04Double());
    expect(() => svc.resolve(PRINCIPAL, '')).toThrow(/reportId must be a non-empty durable identity/);
    expect(() => svc.supersessionChain(PRINCIPAL, '')).toThrow(/reportId must be a non-empty durable identity/);
  });

  it('12. reopening over the same durable store preserves created artifacts', () => {
    const store = new BackingStore();
    const first = new ReportsPersistence(np04Double(store));
    const created = first.persistNew(PRINCIPAL, input());
    const v2 = first.appendVersion(PRINCIPAL, created.reportId, { ...input(), generatedAt: '2026-10-02T10:00:00.000Z' });

    // Reopen: a NEW port and a NEW service over the SAME backing store (models process restart;
    // the service holds no state of its own).
    const second = new ReportsPersistence(np04Double(store));
    const resolved = second.resolve(PRINCIPAL, created.reportId);
    expect(resolved.reportId).toBe(created.reportId);
    expect(resolved.reportKey).toBe(created.reportKey);
    expect(second.supersessionChain(PRINCIPAL, v2.reportId).history.map((h) => h.reportId)).toEqual([created.reportId]);
    expect(second.queryByOwner(PRINCIPAL).items.map((i) => i.reportId)).toContain(v2.reportId);
  });

  it('12b. the service holds no artifact state between calls', () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const created = svc.persistNew(PRINCIPAL, input());
    // Wipe the backing store; the service must now fail rather than serve cached state.
    store.rows.length = 0;
    expect(() => svc.resolve(PRINCIPAL, created.reportId)).toThrow(/resolveById failed/);
  });
});

describe('Reports -> NP-04 binding — no Reports-specific storage', () => {
  it('15. construction fails closed without a valid NP-04 port', () => {
    expect(() => new ReportsPersistence({} as never)).toThrow(PersistenceBoundaryError);
    expect(() => new ReportsPersistence(null as never)).toThrow(/persistence port must be an object/);
    expect(() => new ReportsPersistence({ createInstance: () => {} } as never)).toThrow(/does not implement/);
  });

  it('15b. the port validator requires all five NP-04 operations', () => {
    const complete = np04Double();
    expect(() => assertNp04PersistencePort(complete)).not.toThrow();
    for (const op of ['createInstance', 'appendVersion', 'resolveById', 'queryByOwner', 'listSupersededBy']) {
      const partial = { ...complete } as Record<string, unknown>;
      delete partial[op];
      expect(() => assertNp04PersistencePort(partial)).toThrow(/does not implement/);
    }
  });

  it('15c. with no server-owned database path the resolver still fails closed, and states why', async () => {
    // Precondition made explicit: the resolver composes only when this process has a server-owned
    // database path. With none configured it must fail closed whatever the module state.
    //
    // The dependency boundary is now RESOLVED, so this is the fail-closed proof that matters: the
    // published subpath being consumable must NOT cause the resolver to invent a store when the
    // deployment has supplied no path.
    const saved = process.env[NP04_DATABASE_PATH_ENV];
    delete process.env[NP04_DATABASE_PATH_ENV];
    try {
      const port = await loadAuthoritativeNp04Persistence();
      expect(port).toBeNull(); // no substitute is returned
      const resolution = await resolveAuthoritativeNp04Port();
      expect(resolution.available).toBe(false);
      if (!resolution.available) {
        // The published boundary: the subpath IS exported and IS consumable.
        expect(resolution.boundary.persistedSubpathExported).toBe(true);
        expect(resolution.boundary.directlyConsumable).toBe(true);
        // So the reported reason must no longer claim a dependency blocker. It has to name the
        // residual, deployment-side condition instead — and it must be the descriptor's own text,
        // not a second hand-written opinion that could drift from it.
        expect(resolution.reason).not.toMatch(/does not export a persistence subpath/);
        expect(resolution.reason).not.toMatch(/requiresAuthorizedChange|not yet authorized/i);
        expect(resolution.reason).toMatch(/server-owned database path/);
        expect(resolution.reason).toMatch(/fail(s)? closed/);
        expect(resolution.reason).toBe(NP04_BOUNDARY.blocker);
      }
    } finally {
      if (saved === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
      else process.env[NP04_DATABASE_PATH_ENV] = saved;
    }
  });

  it('15d-1. the resolver fails closed unless a server-owned database path is configured', async () => {
    const saved = process.env[NP04_DATABASE_PATH_ENV];
    try {
      // Absent, empty and non-absolute are all refused. Each of these is deterministic regardless
      // of whether the authoritative package happens to be installed: NP-04 itself rejects a
      // non-absolute path, so a relative value can never yield a store either way.
      for (const value of [undefined, '', 'relative/not-absolute.sqlite']) {
        if (value === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
        else process.env[NP04_DATABASE_PATH_ENV] = value;
        expect(await loadAuthoritativeNp04Persistence(), String(value)).toBeNull();
      }
    } finally {
      if (saved === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
      else process.env[NP04_DATABASE_PATH_ENV] = saved;
    }
  });

  it('15d-2. the resolver returns only null or a complete five-operation port — never a substitute', async () => {
    const saved = process.env[NP04_DATABASE_PATH_ENV];
    process.env[NP04_DATABASE_PATH_ENV] = `${process.env.TMPDIR ?? '/tmp'}/np06-resolver-invariant.sqlite`;
    try {
      // Whether the authoritative package is installed in this environment or not, the contract is
      // the same: a store, or null. A partial or foreign object is never handed back.
      const port = await loadAuthoritativeNp04Persistence();
      if (port !== null) {
        for (const op of ['createInstance', 'appendVersion', 'resolveById', 'queryByOwner', 'listSupersededBy']) {
          expect(typeof port[op as keyof typeof port]).toBe('function');
        }
      } else {
        expect(port).toBeNull();
      }
    } finally {
      if (saved === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
      else process.env[NP04_DATABASE_PATH_ENV] = saved;
    }
  });

  it('15d. adaptNp04Store binds an injected store without translating anything away', () => {
    const store = np04Double();
    const port = adaptNp04Store(store);
    expect(port.createInstance).toBe(store.createInstance);
    expect(port.listSupersededBy).toBe(store.listSupersededBy);
  });

  it('15e. only the five NP-04 operations are consumed', () => {
    const port = np04Double();
    const used: string[] = [];
    const spied = new Proxy(port, {
      get(target, prop, receiver) {
        if (typeof prop === 'string') used.push(prop);
        return Reflect.get(target, prop, receiver);
      },
    });
    const svc = new ReportsPersistence(spied);
    const v1 = svc.persistNew(PRINCIPAL, input());
    const v2 = svc.appendVersion(PRINCIPAL, v1.reportId, { ...input(), generatedAt: '2026-10-02T10:00:00.000Z' });
    svc.resolve(PRINCIPAL, v2.reportId);
    svc.queryByOwner(PRINCIPAL);
    svc.supersessionChain(PRINCIPAL, v2.reportId);
    const operations = used.filter((u) => u !== '__store' && !u.startsWith('Symbol('));
    expect(new Set(operations)).toEqual(
      new Set(['createInstance', 'appendVersion', 'resolveById', 'queryByOwner', 'listSupersededBy']),
    );
  });
});

describe('Reports -> NP-04 binding — content mapping and canonicalization authority', () => {
  it('maps validated content onto exactly the fields NP-04 reads', () => {
    const svc = new ReportsPersistence(np04Double());
    const artifact = svc.persistNew(PRINCIPAL, input());
    const mapped = toNp04Content({
      reportKey: artifact.reportKey,
      reportId: artifact.reportId,
      reportType: artifact.reportType,
      portfolioId: artifact.portfolioId,
      scenario: artifact.scenario,
      parameters: artifact.parameters,
      schemaVersion: artifact.schemaVersion,
      artifactVersion: artifact.artifactVersion,
      supersedesReportId: artifact.supersedesReportId,
      generatedAt: artifact.generatedAt,
      canonicalPayload: artifact.canonicalPayload,
      ownership: artifact.ownership,
      provenance: artifact.provenance,
    });
    // NP-04 reads only the four canonical members plus payload/provenance/schema/generatedAt.
    expect(Object.keys(mapped).sort()).toEqual(
      ['canonicalPayload', 'generatedAt', 'parameters', 'portfolioId', 'provenance', 'reportType', 'scenario', 'schemaVersion'],
    );
    // Ownership is deliberately absent: the foundation reads it from the principal only.
    expect('ownership' in mapped).toBe(false);
    expect('tenantId' in mapped).toBe(false);
  });

  it('the Reports-side content identity agrees with what the foundation derives', () => {
    const port = np04Double();
    const svc = new ReportsPersistence(port);
    const artifact = svc.persistNew(PRINCIPAL, input());
    // The double derives the key independently (as NP-04 does) and the binding cross-checks it.
    expect(artifact.reportKey).toBe(
      deriveReportKey({
        reportType: artifact.reportType,
        portfolioId: artifact.portfolioId,
        scenario: artifact.scenario,
        parameters: artifact.parameters,
      }),
    );
    expect(recomputeReportKey({
      reportType: artifact.reportType,
      portfolioId: artifact.portfolioId,
      scenario: artifact.scenario,
      parameters: artifact.parameters,
    })).toBe(artifact.reportKey);
  });

  it('the boundary descriptor states the published dependency truth coherently', async () => {
    // --- the published half ----------------------------------------------------------------
    expect(NP04_BOUNDARY.authoritativeBranch).toBe('np04-governed-persistence-windows');
    expect(NP04_BOUNDARY.authoritativeCommit).toBe('2e11fa3b689d1a3674a5e4ba1f1de9a559e20494');
    expect(NP04_BOUNDARY.pinnedDependency).toBe('iips-production-market-data');
    expect(NP04_BOUNDARY.pinnedCommit).toBe('2e11fa3b689d1a3674a5e4ba1f1de9a559e20494');

    // --- coherence with the REAL manifest, not with a second copy of the constant ----------
    // Read the specifier this repository actually declares. A descriptor that has drifted from the
    // manifest is precisely the failure this test must catch, so it must not be self-referential.
    // Vitest's `import.meta.url` is not a `file:` URL, so resolve from the suite root explicitly
    // and self-check that the manifest read is really this package's.
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
    ) as { name: string; dependencies: Record<string, string> };
    expect(manifest.name).toBe('@iips/v3-frontend');
    expect(manifest.dependencies[NP04_BOUNDARY.pinnedDependency]).toBe(
      `github:ramkivs/iips-production-market-data#${NP04_BOUNDARY.pinnedCommit}`,
    );
    // The pin must track the published NP-04 commit — never a different commit, `main`, another
    // branch, a `file:`/local path, or an Arena scratch package.
    expect(NP04_BOUNDARY.pinnedCommit).toBe(NP04_BOUNDARY.authoritativeCommit);

    // --- the consumability claims must be TRUE of reality, not merely asserted -------------
    expect(NP04_BOUNDARY.persistedSubpathExported).toBe(true);
    expect(NP04_BOUNDARY.directlyConsumable).toBe(true);
    const mod = (await import(
      /* @vite-ignore */ ['iips-production-market-data', 'persistence'].join('/')
    )) as Record<string, unknown>;
    // The subpath the descriptor says is exported really does resolve, and exposes exactly the
    // authoritative members the resolver composes from: the descriptor is not overclaiming.
    expect(typeof mod.openDatabase).toBe('function');
    expect(typeof mod.GovernedArtifactStore).toBe('function');
    const storePrototype = (mod.GovernedArtifactStore as { prototype: Record<string, unknown> })
      .prototype;
    for (const op of ['createInstance', 'appendVersion', 'resolveById', 'queryByOwner', 'listSupersededBy']) {
      expect(typeof storePrototype[op], op).toBe('function');
    }

    // --- the resolved boundary must no longer require any authorization change -------------
    expect(NP04_BOUNDARY.requiresAuthorizedChange).toEqual([]);
    // No stale blocker text may survive the reconciliation.
    expect(NP04_BOUNDARY.blocker).not.toMatch(/does not export a persistence subpath/);
    expect(NP04_BOUNDARY.blocker).not.toMatch(/requires both|has diverged/);
    expect(NP04_BOUNDARY.blocker).toMatch(/No dependency-boundary blocker remains/);

    // --- the runtime half is unchanged, still server-owned, still deployment-scoped --------
    // A server-owned path is deployment configuration, not a change to the published boundary.
    expect(NP04_BOUNDARY.runtimeDatabasePathEnv).toBe('IIPS_NP04_DATABASE_PATH');
    expect(NP04_BOUNDARY.runtimeComposition).toMatch(/absolute path/);
    expect(NP04_BOUNDARY.runtimeComposition).toMatch(/server-owned/);
    // The deployment variable stays single-sourced between the descriptor and the resolver.
    expect(NP04_BOUNDARY.runtimeDatabasePathEnv).toBe(NP04_DATABASE_PATH_ENV);
  });
});
