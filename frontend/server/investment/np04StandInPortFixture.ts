/**
 * TEST STAND-IN for the five-operation NP-04 port. Never imported by production code.
 *
 * Why it exists: the S6-1b fixture tests must be executable where the pinned `iips-np04-governed-persistence`
 * package cannot be installed (a sandbox without access to the private IPD repository). The stand-in keeps the
 * port CONTRACT the IRR artifact service depends on — store-assigned `reportId`, `reportKey` derived by the
 * canonical grammar, contiguous single-parent supersession, `queryByOwner` returning chain HEADS only, owner
 * partitioning — and nothing else. It is in-memory, unpersisted, and unauthoritative.
 *
 * It is NOT a persistence mechanism and NOT evidence of persistence: the S6-1b suite also runs against the real
 * governed store wherever the package is installed (CI), and only that run proves durability. Idempotency and
 * duplicate protection live in `investmentArtifacts.ts` on top of the port and are exercised either way.
 */
import { randomUUID } from 'node:crypto';

import { deriveReportKey } from '../reports/canonical.js';
import type {
  Np04ArtifactContent,
  Np04GovernedArtifact,
  Np04QueryOptions,
  Np04QueryPage,
  Np04SupersessionView,
  ReportsPersistencePort,
} from '../reports/persistence-port.js';

interface OwnerPair {
  readonly tenantId: string;
  readonly userId: string;
}

function ownerOf(authenticated: unknown): OwnerPair {
  const pair = authenticated as Partial<OwnerPair> | null;
  if (pair === null || typeof pair !== 'object' || typeof pair.tenantId !== 'string' || typeof pair.userId !== 'string') {
    throw new Error('stand-in port: an owner pair is required');
  }
  return { tenantId: pair.tenantId, userId: pair.userId };
}

export interface StandInPortOptions {
  /** When set, every write throws with this message — for the "persistence failure is reported" case. */
  readonly failWrites?: string;
}

export class Np04StandInPort implements ReportsPersistencePort {
  private readonly artifacts = new Map<string, Np04GovernedArtifact>();
  private readonly supersededIds = new Set<string>();
  private clock = 0;

  constructor(private readonly options: StandInPortOptions = {}) {}

  /** Every artifact ever written, in write order. Test inspection only. */
  all(): readonly Np04GovernedArtifact[] {
    return [...this.artifacts.values()];
  }

  private nextCreatedAt(): string {
    this.clock += 1;
    return new Date(Date.UTC(2026, 10, 22, 0, 0, this.clock)).toISOString();
  }

  private materialise(owner: OwnerPair, content: Np04ArtifactContent, previous: Np04GovernedArtifact | null): Np04GovernedArtifact {
    if (this.options.failWrites !== undefined) throw new Error(this.options.failWrites);
    const scenario = content.scenario ?? null;
    const parameters = content.parameters ?? null;
    const artifact: Np04GovernedArtifact = {
      reportId: randomUUID(),
      chainId: previous === null ? randomUUID() : previous.chainId,
      tenantId: owner.tenantId,
      userId: owner.userId,
      reportKey: deriveReportKey({ reportType: content.reportType, portfolioId: content.portfolioId, scenario, parameters }),
      reportType: content.reportType,
      portfolioId: content.portfolioId,
      scenario,
      parameters,
      schemaVersion: content.schemaVersion ?? 1,
      artifactVersion: previous === null ? 1 : previous.artifactVersion + 1,
      supersedesReportId: previous === null ? null : previous.reportId,
      generatedAt: content.generatedAt ?? this.nextCreatedAt(),
      canonicalPayload: content.canonicalPayload,
      provenance: content.provenance,
      createdAt: this.nextCreatedAt(),
    };
    this.artifacts.set(artifact.reportId, artifact);
    if (previous !== null) this.supersededIds.add(previous.reportId);
    return artifact;
  }

  createInstance(authenticated: unknown, content: Np04ArtifactContent): Np04GovernedArtifact {
    return this.materialise(ownerOf(authenticated), content, null);
  }

  appendVersion(authenticated: unknown, supersedesReportId: string, content: Np04ArtifactContent): Np04GovernedArtifact {
    const owner = ownerOf(authenticated);
    const previous = this.resolveById(owner, supersedesReportId);
    if (this.supersededIds.has(previous.reportId)) throw new Error('stand-in port: that version is already superseded');
    const nextKey = deriveReportKey({
      reportType: content.reportType,
      portfolioId: content.portfolioId,
      scenario: content.scenario ?? null,
      parameters: content.parameters ?? null,
    });
    if (nextKey !== previous.reportKey) {
      // Chain identity is `reportKey`; a version that would carry another key is not a version of this chain.
      throw new Error('stand-in port: a version must keep its chain identity (reportKey)');
    }
    return this.materialise(owner, content, previous);
  }

  resolveById(authenticated: unknown, reportId: string): Np04GovernedArtifact {
    const owner = ownerOf(authenticated);
    const artifact = this.artifacts.get(reportId);
    if (artifact === undefined || artifact.tenantId !== owner.tenantId || artifact.userId !== owner.userId) {
      throw new Error(`stand-in port: not found: ${reportId}`);
    }
    return artifact;
  }

  queryByOwner(authenticated: unknown, options: Np04QueryOptions = {}): Np04QueryPage {
    const owner = ownerOf(authenticated);
    const heads = this.all().filter(
      (artifact) => artifact.tenantId === owner.tenantId && artifact.userId === owner.userId && !this.supersededIds.has(artifact.reportId),
    );
    const start = options.cursor === undefined ? 0 : heads.findIndex((artifact) => artifact.reportId === options.cursor) + 1;
    const limit = options.limit ?? heads.length;
    const items = heads.slice(start, start + limit);
    const last = items[items.length - 1];
    const nextCursor = last !== undefined && start + limit < heads.length ? last.reportId : null;
    return { items, nextCursor };
  }

  listSupersededBy(authenticated: unknown, reportId: string): Np04SupersessionView {
    const owner = ownerOf(authenticated);
    const current = this.resolveById(owner, reportId);
    const versions: Np04GovernedArtifact[] = [];
    let cursor = current.supersedesReportId;
    while (cursor !== null) {
      const previous = this.resolveById(owner, cursor);
      versions.push(previous);
      cursor = previous.supersedesReportId;
    }
    return { current, versions };
  }
}
