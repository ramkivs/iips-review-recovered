/**
 * IID-5 — the change-intelligence service over the EXISTING persistence paths (roadmap task 7).
 *
 * READ-ONLY OVER STORED ARTIFACTS, WRITE-ONLY THROUGH THE SHARED RECORD PATH. Nothing here constructs a store,
 * a table, a journal or a cache: subject chains are read with `InvestmentArtifactService.readChainWithPayloads`,
 * and boundary reports are recorded with `recordChangeReport` on the `icr:` chain the closed registry already
 * reserves. A reconciliation run therefore leaves exactly one durable trace — ordinary artifacts — and can be
 * audited with the same read path as everything else.
 *
 * IDEMPOTENT BY CONSTRUCTION. A boundary's `generatedAt` is the explained version's `generatedAt`, and its
 * content is a pure function of the two stored payloads. Reconciliation over an already-explained chain
 * therefore recomputes the same bytes, the record path reports `UNCHANGED`, and nothing is written. Re-running
 * it a hundred times is the same as running it once — which is what makes it safe to run on a schedule.
 *
 * COVERAGE IS EXPLICIT. `coverage()` reports which consecutive boundaries are explained by a stored report and
 * which are not. A gap is a fact about the history, not an error to be hidden: it means those two versions were
 * compared by nobody, and `reconcile()` can fill it — labelled `VERSION_BOUNDARY_RECONSTRUCTED`.
 */
import { ReportValidationError } from '../reports/artifact.js';
import {
  InvestmentArtifactService,
  InvestmentArtifactError,
  createInvestmentArtifactService,
  type InvestmentArtifactServiceOptions,
  type InvestmentChainView,
  type InvestmentVersionView,
  type RecordResult,
} from './investmentArtifacts.js';
import { excludedMembersFor } from './substantiveIdentity.js';
import { compareVersions, type DepartmentComparison, type MetadataChange } from './change/compare.js';
import { attributeComparison, type AttributionBlock } from './change/attribute.js';
import { reproduceVersion, type ReproductionRecord } from './change/reproduce.js';
import { reviewFor, type ReviewBlock } from './change/review.js';
import {
  CHANGE_REPORT_TYPE,
  changeScopeFor,
  composeChangeReport,
  kindFor,
  type ChangeReportPayload,
  type ComposedChangeReport,
  type VersionReference,
} from './changeComposition.js';

export const CHANGE_LIMITATIONS = Object.freeze([
  'A change report explains what moved between two stored versions. It is decision support, not investment advice, and never an instruction to trade.',
  'Attribution is EXACT only when both versions reproduce and share one model/policy identity; otherwise it is UNATTRIBUTED and no split is estimated.',
  'Model build digest and platform commit are not recorded by IID-3/IID-4 and are reported as unavailable rather than reconstructed.',
  'Change reports have no substantive-identity grammar in the L-014 decision: their identity is their bytes.',
] as const);

/**
 * Either an already-constructed artifact service (tests, and any caller that already holds one) or the governed
 * boundary plus an explicit owner. There is no third form: the service will not invent an owner or a store.
 */
export interface ChangeServiceOptions {
  readonly artifacts?: InvestmentArtifactService;
  readonly port?: unknown;
  readonly owner?: { readonly tenantId: string; readonly userId: string };
  readonly maxArtifactsScanned?: number;
  readonly maxChainLength?: number;
}

/** One adjacent pair, compared read-only. */
export interface PairComparison {
  readonly from: VersionReference;
  readonly to: VersionReference;
  readonly comparison: DepartmentComparison;
  readonly attribution: AttributionBlock;
  readonly review: ReviewBlock;
  readonly reproduction: { readonly from: ReproductionRecord; readonly to: ReproductionRecord };
  readonly persisted: false;
}

export interface BoundarySummary {
  readonly changeReportId: string;
  readonly artifactVersion: number;
  readonly kind: ChangeReportPayload['comparison']['kind'];
  readonly classification: DepartmentComparison['classification'];
  readonly fromReportId: string;
  readonly toReportId: string;
  readonly fromArtifactVersion: number;
  readonly toArtifactVersion: number;
  readonly highestMateriality: string;
  readonly reviewRequired: boolean;
  readonly reviewPriority: string;
  readonly attributionStatus: string;
  readonly generatedAt: string;
  readonly payloadDigest: string;
}

export interface BoundaryCoverage {
  readonly subjectScope: string;
  readonly reportType: string;
  readonly versionCount: number;
  readonly boundaryCount: number;
  /** Every consecutive pair: `versionCount - 1`, or 0 for a single-version chain. */
  readonly pairCount: number;
  readonly explainedPairs: readonly { readonly fromReportId: string; readonly toReportId: string }[];
  readonly unexplainedPairs: readonly { readonly fromReportId: string; readonly toReportId: string }[];
  readonly complete: boolean;
}

export interface ChangeService {
  /** Compare two stored versions of one subject chain (read-only). */
  compareVersions(input: {
    readonly subjectScope: string;
    readonly reportType: string;
    readonly fromReportId: string;
    readonly toReportId: string;
  }): PairComparison;
  /** Every adjacent pair of a chain, oldest first. */
  adjacentComparisons(input: { readonly subjectScope: string; readonly reportType: string }): readonly PairComparison[];
  /** Compose and record the boundary report for one pair. Idempotent. */
  writeBoundary(input: {
    readonly subjectScope: string;
    readonly reportType: string;
    readonly fromReportId: string;
    readonly toReportId: string;
  }): { readonly composed: ComposedChangeReport; readonly result: RecordResult };
  /** Stored boundary reports for a subject chain, oldest first. */
  boundaries(input: { readonly subjectScope: string; readonly reportType: string }): readonly BoundarySummary[];
  /** Which consecutive pairs are explained by a stored boundary report. */
  coverage(input: { readonly subjectScope: string; readonly reportType: string }): BoundaryCoverage;
  /**
   * Fill every unexplained pair. `failOn` lets a test simulate an append failure for one pair, which is how the
   * partial-reconciliation case is demonstrated rather than asserted.
   */
  reconcile(input: {
    readonly subjectScope: string;
    readonly reportType: string;
    readonly stopAfter?: number;
    readonly failOn?: (toReportId: string) => boolean;
  }): { readonly created: readonly BoundarySummary[]; readonly gaps: readonly BoundarySummary['toReportId'][]; readonly coverage: BoundaryCoverage };
}

function parseJson(text: string): Record<string, any> {
  try {
    const parsed = JSON.parse(text);
    if (parsed === null || typeof parsed !== 'object') throw new Error('payload is not an object');
    return parsed as Record<string, any>;
  } catch (cause) {
    throw new ReportValidationError('stored payload is not readable JSON', {
      detail: cause instanceof Error ? cause.message : 'unreadable',
    });
  }
}

function metadataOf(reportType: string, fromPayload: unknown, toPayload: unknown): readonly MetadataChange[] {
  const out: MetadataChange[] = [];
  for (const path of excludedMembersFor(reportType)) {
    const conditional = path[path.length - 1] === null;
    const members = (conditional ? path.slice(0, -1) : path) as string[];
    let a: unknown = fromPayload;
    let b: unknown = toPayload;
    for (const member of members) {
      a = a !== null && typeof a === 'object' ? (a as Record<string, unknown>)[member] : undefined;
      b = b !== null && typeof b === 'object' ? (b as Record<string, unknown>)[member] : undefined;
    }
    if (conditional && (a === null || b === null)) continue;
    if (JSON.stringify(a) === JSON.stringify(b)) continue;
    out.push({ member: members.join('.'), from: a ?? null, to: b ?? null, excluded: true });
  }
  return out;
}

function versionReference(view: InvestmentVersionView, payload: Record<string, any>): VersionReference {
  const datasetVersion =
    view.datasetVersion ||
    String(payload?.data?.datasetVersion ?? payload?.companyAssessmentRef?.datasetVersion ?? '');
  const contentDigest = view.contentDigest || String(payload?.data?.contentDigest ?? '');
  return {
    reportId: view.reportId,
    artifactVersion: view.artifactVersion,
    generatedAt: view.generatedAt,
    payloadDigest: view.payloadDigest,
    substantiveDigest: view.substantiveDigest,
    substantiveDigestSource: view.substantiveDigestSource,
    substantiveIdentityGrammar: view.substantiveIdentityGrammar,
    modelVersion: view.modelVersion,
    policyVersion: view.policyVersion,
    datasetVersion,
    contentDigest,
  };
}

function issuerOf(payload: Record<string, any>): string {
  const candidate = payload?.subject?.issuerId ?? payload?.artifact?.subjectScope ?? '';
  return typeof candidate === 'string' ? candidate : '';
}

function reproductionOf(reportType: string, view: InvestmentVersionView, text: string): ReproductionRecord {
  return reproduceVersion({
    reportType,
    reportId: view.reportId,
    artifactVersion: view.artifactVersion,
    generatedAt: view.generatedAt,
    payloadDigest: view.payloadDigest,
    // Only a RECORDED digest is passed as recorded. A derived one is passed as `null`, so the reproduction record
    // can say "this was derived now" rather than claiming the version stored it.
    substantiveDigest: view.substantiveDigestSource === 'RECORDED' ? view.substantiveDigest : null,
    substantiveIdentityGrammar: view.substantiveIdentityGrammar,
    modelVersion: view.modelVersion,
    policyVersion: view.policyVersion,
    datasetVersion: view.datasetVersion,
    contentDigest: view.contentDigest,
    canonicalPayload: text,
  });
}

export function createChangeService(options: ChangeServiceOptions): ChangeService {
  if (options.artifacts === undefined && (options.port === undefined || options.owner === undefined)) {
    throw new ReportValidationError('a change service needs either an artifact service or a governed boundary and owner', {});
  }
  const artifacts =
    options.artifacts ??
    createInvestmentArtifactService({
      port: options.port,
      owner: options.owner as { tenantId: string; userId: string },
      ...(options.maxArtifactsScanned === undefined ? {} : { maxArtifactsScanned: options.maxArtifactsScanned }),
      ...(options.maxChainLength === undefined ? {} : { maxChainLength: options.maxChainLength }),
    });

  const load = (subjectScope: string, reportType: string) => {
    const { chain, payloads } = artifacts.readChainWithPayloads(subjectScope, reportType);
    return { chain, payloads };
  };

  const comparePair = (
    subjectScope: string,
    reportType: string,
    chain: InvestmentChainView,
    payloads: ReadonlyMap<string, string>,
    fromIndex: number,
    toIndex: number,
  ): PairComparison => {
    const fromView = chain.versions[fromIndex];
    const toView = chain.versions[toIndex];
    if (fromView === undefined || toView === undefined) {
      throw new InvestmentArtifactError('VERSION_NOT_FOUND', 'requested version is not in this chain', {
        fromIndex,
        toIndex,
        versionCount: chain.versionCount,
      });
    }
    const fromText = payloads.get(fromView.reportId);
    const toText = payloads.get(toView.reportId);
    if (fromText === undefined || toText === undefined) {
      throw new InvestmentArtifactError('VERSION_NOT_FOUND', 'stored payload is missing for a chain version', {
        fromReportId: fromView.reportId,
        toReportId: toView.reportId,
      });
    }
    const fromPayload = parseJson(fromText);
    const toPayload = parseJson(toText);

    const reproduction = {
      from: reproductionOf(reportType, fromView, fromText),
      to: reproductionOf(reportType, toView, toText),
    };

    // A version whose substantive digest cannot be recomputed cannot be compared: refuse instead of guessing.
    if (fromView.substantiveDigest === null || toView.substantiveDigest === null) {
      throw new InvestmentArtifactError('CONTENT_DIGEST_MISMATCH', 'a chain version carries no substantive identity', {
        fromReportId: fromView.reportId,
        toReportId: toView.reportId,
      });
    }

    const comparison = compareVersions({
      reportType,
      fromPayload,
      toPayload,
      fromSubstantiveDigest: fromView.substantiveDigest,
      toSubstantiveDigest: toView.substantiveDigest,
      fromPayloadDigest: fromView.payloadDigest,
      toPayloadDigest: toView.payloadDigest,
      metadata: metadataOf(reportType, fromPayload, toPayload),
    });

    const attribution = attributeComparison({
      comparison,
      fromReproduction: reproduction.from,
      toReproduction: reproduction.to,
      fromModelVersion: fromView.modelVersion,
      toModelVersion: toView.modelVersion,
      fromPolicyVersion: fromView.policyVersion,
      toPolicyVersion: toView.policyVersion,
    });

    return {
      from: versionReference(fromView, fromPayload),
      to: versionReference(toView, toPayload),
      comparison,
      attribution,
      review: reviewFor(comparison),
      reproduction,
      persisted: false,
    };
  };

  const compareIndexes = (subjectScope: string, reportType: string, fromIndex: number, toIndex: number): PairComparison => {
    const { chain, payloads } = load(subjectScope, reportType);
    return comparePair(subjectScope, reportType, chain, payloads, fromIndex, toIndex);
  };

  const indexOfReportIds = (chain: InvestmentChainView, fromReportId: string, toReportId: string) => {
    const fromIndex = chain.versions.findIndex((version) => version.reportId === fromReportId);
    const toIndex = chain.versions.findIndex((version) => version.reportId === toReportId);
    if (fromIndex < 0 || toIndex < 0) {
      throw new InvestmentArtifactError('VERSION_NOT_FOUND', 'report id is not a version of this chain', {
        fromReportId,
        toReportId,
      });
    }
    if (toIndex <= fromIndex) {
      throw new ReportValidationError('a comparison must move forward in version order', { fromIndex, toIndex });
    }
    return { fromIndex, toIndex };
  };

  const boundariesFor = (subjectScope: string, reportType: string): readonly BoundarySummary[] => {
    const changeScope = changeScopeFor(subjectScope);
    let chain: InvestmentChainView;
    let payloads: ReadonlyMap<string, string>;
    try {
      const loaded = artifacts.readChainWithPayloads(changeScope, CHANGE_REPORT_TYPE);
      chain = loaded.chain;
      payloads = loaded.payloads;
    } catch (cause) {
      if (cause instanceof InvestmentArtifactError && cause.code === 'CHAIN_NOT_FOUND') return [];
      throw cause;
    }
    const out: BoundarySummary[] = [];
    for (const view of chain.versions) {
      const text = payloads.get(view.reportId);
      if (text === undefined) continue;
      const payload = parseJson(text) as unknown as ChangeReportPayload;
      if (payload?.subject?.subjectScope !== subjectScope || payload?.subject?.reportType !== reportType) {
        // A change chain is per subject; a report about another subject on this chain would corrupt coverage.
        throw new InvestmentArtifactError('CHAIN_INVALID', 'stored change report names a different subject', {
          changeReportId: view.reportId,
        });
      }
      out.push({
        changeReportId: view.reportId,
        artifactVersion: view.artifactVersion,
        kind: payload.comparison.kind,
        classification: payload.comparison.classification,
        fromReportId: payload.comparison.from.reportId,
        toReportId: payload.comparison.to.reportId,
        fromArtifactVersion: payload.comparison.from.artifactVersion,
        toArtifactVersion: payload.comparison.to.artifactVersion,
        highestMateriality: String(payload.summary?.highestMateriality ?? 'IMMATERIAL'),
        reviewRequired: payload.review.required,
        reviewPriority: payload.review.priority,
        attributionStatus: payload.attribution.status,
        generatedAt: view.generatedAt,
        payloadDigest: view.payloadDigest,
      });
    }
    return out;
  };

  const coverageOf = (subjectScope: string, reportType: string): BoundaryCoverage => {
    const { chain } = load(subjectScope, reportType);
    const stored = boundariesFor(subjectScope, reportType);
    const explainedKeys = new Set(stored.map((boundary) => `${boundary.fromReportId}->${boundary.toReportId}`));
    const explainedPairs: { fromReportId: string; toReportId: string }[] = [];
    const unexplainedPairs: { fromReportId: string; toReportId: string }[] = [];
    for (let index = 1; index < chain.versions.length; index += 1) {
      const from = chain.versions[index - 1]!;
      const to = chain.versions[index]!;
      const pair = { fromReportId: from.reportId, toReportId: to.reportId };
      if (explainedKeys.has(`${from.reportId}->${to.reportId}`)) explainedPairs.push(pair);
      else unexplainedPairs.push(pair);
    }
    return {
      subjectScope,
      reportType,
      versionCount: chain.versionCount,
      boundaryCount: stored.length,
      pairCount: Math.max(0, chain.versionCount - 1),
      explainedPairs,
      unexplainedPairs,
      complete: unexplainedPairs.length === 0,
    };
  };

  const writeBoundary = (input: {
    readonly subjectScope: string;
    readonly reportId?: string;
    readonly reportType: string;
    readonly fromReportId: string;
    readonly toReportId: string;
    readonly pair?: PairComparison;
    readonly issuerId?: string;
  }) => {
    const pair =
      input.pair ??
      (() => {
        const { chain, payloads } = load(input.subjectScope, input.reportType);
        const { fromIndex, toIndex } = indexOfReportIds(chain, input.fromReportId, input.toReportId);
        return comparePair(input.subjectScope, input.reportType, chain, payloads, fromIndex, toIndex);
      })();

    const toPayload = parseJson(payloadTextOf(input.subjectScope, input.reportType, pair.to.reportId));
    const composed = composeChangeReport({
      subjectScope: input.subjectScope,
      subjectReportType: input.reportType,
      reportKey: reportKeyOf(input.subjectScope, input.reportType),
      issuerId: input.issuerId ?? issuerOf(toPayload),
      kind: kindFor(pair.reproduction),
      comparison: pair.comparison,
      attribution: pair.attribution,
      review: pair.review,
      from: pair.from,
      to: pair.to,
      reproduction: pair.reproduction,
      limitations: CHANGE_LIMITATIONS,
    });

    const result = artifacts.recordChangeReport({
      reportType: composed.reportType,
      scopeToken: composed.scopeToken,
      content: composed.content,
      payloadDigest: composed.payloadDigest,
      inputDigest: composed.inputDigest,
    });

    return { composed, result };
  };

  const payloadTextOf = (subjectScope: string, reportType: string, reportId: string): string => {
    const { payloads } = load(subjectScope, reportType);
    const text = payloads.get(reportId);
    if (text === undefined) {
      throw new InvestmentArtifactError('VERSION_NOT_FOUND', 'stored payload is missing for a chain version', { reportId });
    }
    return text;
  };

  const reportKeyOf = (subjectScope: string, reportType: string): string => {
    const { chain } = load(subjectScope, reportType);
    return chain.reportKey;
  };

  return {
    compareVersions({ subjectScope, reportType, fromReportId, toReportId }) {
      const { chain } = load(subjectScope, reportType);
      const { fromIndex, toIndex } = indexOfReportIds(chain, fromReportId, toReportId);
      return compareIndexes(subjectScope, reportType, fromIndex, toIndex);
    },

    adjacentComparisons({ subjectScope, reportType }) {
      const { chain, payloads } = load(subjectScope, reportType);
      const out: PairComparison[] = [];
      for (let index = 1; index < chain.versions.length; index += 1) {
        out.push(comparePair(subjectScope, reportType, chain, payloads, index - 1, index));
      }
      return out;
    },

    writeBoundary(input) {
      return writeBoundary(input);
    },

    boundaries({ subjectScope, reportType }) {
      return boundariesFor(subjectScope, reportType);
    },

    coverage({ subjectScope, reportType }) {
      return coverageOf(subjectScope, reportType);
    },

    reconcile({ subjectScope, reportType, stopAfter, failOn }) {
      const before = new Set(boundariesFor(subjectScope, reportType).map((boundary) => boundary.changeReportId));
      const created: BoundarySummary[] = [];
      let gate = stopAfter ?? Number.POSITIVE_INFINITY;
      const pending = coverageOf(subjectScope, reportType).unexplainedPairs;
      for (const pair of pending) {
        if (gate <= 0) break;
        if (failOn?.(pair.toReportId)) continue;
        const { chain, payloads } = load(subjectScope, reportType);
        const { fromIndex, toIndex } = indexOfReportIds(chain, pair.fromReportId, pair.toReportId);
        const comparison = comparePair(subjectScope, reportType, chain, payloads, fromIndex, toIndex);
        writeBoundary({
          subjectScope,
          reportType,
          fromReportId: pair.fromReportId,
          toReportId: pair.toReportId,
          pair: comparison,
        });
        gate -= 1;
      }
      const after = coverageOf(subjectScope, reportType);
      const byKey = new Map(
        boundariesFor(subjectScope, reportType).map((boundary) => [
          `${boundary.fromReportId}->${boundary.toReportId}`,
          boundary,
        ]),
      );
      for (const pair of after.explainedPairs) {
        const boundary = byKey.get(`${pair.fromReportId}->${pair.toReportId}`);
        // Only reports that did not exist before this run are reported as created: a re-run creates nothing.
        if (boundary !== undefined && !before.has(boundary.changeReportId)) created.push(boundary);
      }
      return { created, gaps: after.unexplainedPairs.map((pair) => pair.toReportId), coverage: after };
    },
  };
}
