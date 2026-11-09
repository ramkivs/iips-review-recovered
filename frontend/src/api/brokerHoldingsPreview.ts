/** Read-only broker preview. No PortfolioStore, persistence, identity bypass or network.
 *
 * Native broker evidence is not an authoritative security mapping or a save request.
 *
 * WHAT THE PREVIEW MAY AND MAY NOT CLAIM (WS-A correction, 2026-11-05; pin advance to IPD PR #127)
 *   The preview previously handed IPD's ingress an EMPTY `SecurityMaster`, so no row could ever
 *   resolve, and it then reported `Resolved rows 0 / Unresolved rows 68` as though those were
 *   lookup results. It also labelled every row `UNRESOLVED` unconditionally, and — because the
 *   alias pin `70b24f0` predated per-row identity evidence — it could only report a FILE-LEVEL
 *   identity basis with `identityAssessedRows: 0`.
 *
 *   The `iips-broker-import` alias is now pinned to IPD PR #146's merge commit
 *   `d5e20c15059267a3f824b015e37d652084de5a01` (the alias was aligned to the IPD PR #145 merge
 *   `709fd13`, which PR #146 supersedes with a byte-identical published `dist/package` tree), whose
 *   mapper assesses EVERY native row before it
 *   raises the single whole-import P04 refusal, and publishes that evidence as
 *   `identityAssessments` / `identitySummary` on both the success and the refusal result. This
 *   module consumes that published evidence verbatim. Identity authority stays with IPD: IRR never
 *   resolves identity, never ranks a candidate, never widens a namespace, never infers a mapping
 *   from company-name similarity and never fabricates an identifier.
 *
 *   The counters now state what the pipeline actually measured:
 *
 *     nativeRows            parsed native broker rows (`parseResult.holdings.length`)
 *     identityAssessedRows  rows for which the pipeline produced an INDIVIDUAL identity outcome
 *     identityResolvedRows  rows the governed master resolved to a canonical identity
 *     identityUnresolvedRows rows individually assessed and left unresolved or ambiguous
 *     savedRows             always 0: the preview can not save and never calls a store
 *
 *   `PARSED_UNRESOLVED` still means "parsed; canonical identity was not established for every
 *   row". It never means "not assessed": with the current pin the assessment vector is published
 *   even on refusal, so the per-row evidence is reported instead of being masked by the file-level
 *   refusal. If a future or foreign pin publishes no assessment vector, the preview degrades to
 *   `FILE_LEVEL_P04_REFUSAL` / `NOT_EVALUATED` and says so, rather than claiming per-row results
 *   it did not receive.
 */
import { BrokerImportIngressOrchestrator } from '../../.cache/broker-import/frontend/src/features/portfolio/import/broker-import-ingress.js';
import { getGovernedBroadSecurityMaster } from '../../.cache/broker-import/src/identity/governed_fixture_master.js';

export type BrokerRowIdentityBasis =
  /** The pipeline resolved this row's canonical identity through the governed master. */
  | 'PIPELINE_RESOLVED'
  /** The pipeline published an individual assessment for this row that did not resolve. */
  | 'PIPELINE_ASSESSED_UNRESOLVED'
  /** The pipeline published an individual assessment whose status is AMBIGUOUS. */
  | 'PIPELINE_ASSESSED_AMBIGUOUS'
  /** The pipeline assessed this row but excluded it by row-level validation (not an identity result). */
  | 'PIPELINE_ASSESSED_EXCLUDED'
  /** The pipeline refused the file and published NO individual outcome for this row. */
  | 'FILE_LEVEL_P04_REFUSAL'
  /** The file itself was rejected/blocked before identity resolution. */
  | 'NOT_EVALUATED';

/** One authoritative lookup exactly as the IPD pipeline recorded it. Never re-derived here. */
export interface BrokerPreviewIdentityLookup {
  readonly identifierType: string;
  readonly identifierValue: string;
  readonly outcome: string;
  readonly quarantineRecordId?: string;
  readonly details?: string;
}

/**
 * A native broker row plus the pipeline's OWN published identity evidence for it. The canonical
 * company identity the governed master resolved is deliberately NOT re-exposed here: the preview's
 * admitted boundary is native evidence, and a canonical identity must never be embedded in or
 * echoed back through a broker CSV surface.
 */
export interface BrokerPreviewRow {
  readonly symbol: string;
  readonly isin: string | null;
  readonly exchange: string | null;
  readonly quantity: number;
  readonly averagePrice: number;
  readonly currentPrice: number | null;
  /** Never `RESOLVED` unless the pipeline returned that row as a resolved holding. */
  readonly identityStatus: 'RESOLVED' | 'UNRESOLVED';
  readonly identityBasis: BrokerRowIdentityBasis;
  /** Pipeline assessment status, or null when no individual assessment was published. */
  readonly pipelineIdentityStatus: string | null;
  /** Closed-vocabulary refusal code published by the pipeline, or null. */
  readonly identityRefusalCode: string | null;
  /** Identifier class the pipeline assigned from what the broker actually supplied. */
  readonly identifierClass: string | null;
  /** P04 quarantine record ids produced by this row's lookups, in attempt order. */
  readonly quarantineIds: readonly string[];
  /** Every authoritative lookup attempted for this row, in the order attempted. */
  readonly lookups: readonly BrokerPreviewIdentityLookup[];
  /** The precise identifier evidence the broker export must supply, or null. */
  readonly missingEvidence: string | null;
}

/** The pipeline's own aggregate. Passed through; never recomputed by IRR. */
export interface BrokerPreviewIdentitySummary {
  readonly evaluated: number;
  readonly resolved: number;
  readonly unresolved: number;
  readonly ambiguous: number;
  readonly notEvaluated: number;
  readonly excluded: number;
  readonly identitySource: string;
  readonly masterRevision: string | null;
  /** True only when EVERY assessed row resolved — the P04 whole-import saveability condition. */
  readonly saveable: boolean;
  readonly refusalCodes: Readonly<Record<string, number>>;
}

export interface BrokerHoldingsPreview {
  readonly mode: 'NATIVE_BROKER_PREVIEW';
  readonly persisted: false;
  readonly canSave: false;
  readonly broker: string;
  readonly variant?: string;
  readonly status: 'PARSED_UNRESOLVED' | 'PARSED_IDENTITIES_RESOLVED' | 'REJECTED' | 'BLOCKED';
  readonly contentDigest: string;
  readonly asOf: string;
  /** Which identity authority the pipeline queried. Identity remains IPD-owned. */
  readonly identityAuthority: { readonly source: 'IPD_GOVERNED_D05_SECURITY_MASTER'; readonly entities: number };
  /** The pipeline's published per-row aggregate, or null when it published none. */
  readonly identitySummary: BrokerPreviewIdentitySummary | null;
  readonly counts: {
    readonly nativeRows: number;
    readonly identityAssessedRows: number;
    readonly identityResolvedRows: number;
    readonly identityUnresolvedRows: number;
    readonly savedRows: 0;
  };
  /** What the preview did NOT do. Parsing implies none of these. */
  readonly notPerformed: {
    readonly validation: 'NOT_PERFORMED';
    readonly saveAuthorization: 'NOT_PERFORMED';
    readonly persistence: 'NOT_PERFORMED';
    readonly reason: string;
  };
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly rejections: readonly { recordIndex?: number; rawIdentifier?: string; reason: string; details: string; stage: string }[];
  /** True when the pipeline published a per-row assessment vector for this run. */
  readonly perRowIdentityEvidencePublished: boolean;
  readonly holdings: readonly BrokerPreviewRow[];
}

let cachedAuthority: { source: 'IPD_GOVERNED_D05_SECURITY_MASTER'; entities: number } | null = null;

function identityAuthority() {
  if (!cachedAuthority) {
    // The governed master fails closed if its own corpus is missing or corrupt.
    cachedAuthority = { source: 'IPD_GOVERNED_D05_SECURITY_MASTER', entities: getGovernedBroadSecurityMaster().listAllCompanyIds().length };
  }
  return cachedAuthority;
}

interface PipelineAssessment {
  readonly rowIndex: number;
  readonly status: string;
  readonly refusalCode?: string;
  readonly identifierClass?: string;
  readonly companyId?: string;
  readonly missingEvidence?: string;
  readonly lookups?: readonly {
    readonly identifierType: string;
    readonly identifierValue: string;
    readonly outcome: string;
    readonly companyId?: string;
    readonly quarantineRecordId?: string;
    readonly details?: string;
  }[];
  readonly quarantineRecords?: readonly { readonly quarantineId: string }[];
}

export function previewBrokerHoldings(content: string, fileName: string, asOf: string): BrokerHoldingsPreview {
  if (typeof content !== 'string' || typeof fileName !== 'string' || typeof asOf !== 'string'
      || !Number.isFinite(Date.parse(asOf))) {
    throw new Error('Preview requires CSV text, a filename and a valid observation timestamp.');
  }
  if (new TextEncoder().encode(content).byteLength > 1_048_576 || fileName.length > 256) {
    throw new Error('Preview is limited to 1 MiB of CSV and a 256-character filename.');
  }
  const authority = identityAuthority();
  const result = BrokerImportIngressOrchestrator.executeIngress({
    content, fileName, asOf,
    // IPD-owned governed identity authority. IRR never resolves, ranks or bypasses identity.
    securityMaster: getGovernedBroadSecurityMaster(),
    failOnUnmappedIdentity: true,
    allowNonProductionBypass: false,
    allowPartialRejection: false,
    executionEnvironment: 'NON_PRODUCTION',
  });
  const parsed = result.parseResult;
  const nativeRows = parsed?.holdings ?? [];

  // The pipeline's own per-row evidence, joined on its 1-based native row index. The assessment
  // vector is not in row order (excluded rows are recorded during the exclusion pass), so it must
  // be indexed by `rowIndex`, never by array position.
  const publishedAssessments = (result.identityAssessments ?? []) as readonly PipelineAssessment[];
  const perRowIdentityEvidencePublished = publishedAssessments.length > 0;
  const assessmentByRowIndex = new Map<number, PipelineAssessment>();
  for (const assessment of publishedAssessments) {
    if (Number.isInteger(assessment.rowIndex) && !assessmentByRowIndex.has(assessment.rowIndex)) {
      assessmentByRowIndex.set(assessment.rowIndex, assessment);
    }
  }

  // Fallback for a run that published no assessment vector (e.g. a pre-mapping rejection): the
  // resolved holdings the pipeline actually returned are the only identity evidence available.
  const resolvedSymbols = new Set((result.userHoldings ?? []).map((h) => h.symbol));
  const identityRefused = result.rejections.some((r) => r.reason === 'UNMAPPED_IDENTITY' || r.reason === 'IDENTITY_AMBIGUITY');

  const holdings: BrokerPreviewRow[] = nativeRows.map((h, index) => {
    const assessment = assessmentByRowIndex.get(index + 1);
    const pipelineStatus = assessment?.status ?? null;
    const resolved = assessment
      ? assessment.status === 'RESOLVED'
      : resolvedSymbols.has(h.symbol);
    const basis: BrokerRowIdentityBasis = assessment
      ? (assessment.status === 'RESOLVED'
        ? 'PIPELINE_RESOLVED'
        : assessment.status === 'AMBIGUOUS'
          ? 'PIPELINE_ASSESSED_AMBIGUOUS'
          : assessment.status === 'EXCLUDED'
            ? 'PIPELINE_ASSESSED_EXCLUDED'
            : assessment.status === 'NOT_EVALUATED'
              ? 'NOT_EVALUATED'
              : 'PIPELINE_ASSESSED_UNRESOLVED')
      : identityRefused
        ? 'FILE_LEVEL_P04_REFUSAL'
        : 'NOT_EVALUATED';
    return {
      symbol: h.symbol,
      isin: h.isin ?? null,
      exchange: h.exchange ?? null,
      quantity: h.quantity,
      averagePrice: h.averagePrice,
      currentPrice: h.currentPrice ?? null,
      identityStatus: resolved ? 'RESOLVED' : 'UNRESOLVED',
      identityBasis: basis,
      pipelineIdentityStatus: pipelineStatus,
      identityRefusalCode: assessment?.refusalCode ?? null,
      identifierClass: assessment?.identifierClass ?? null,
      quarantineIds: (assessment?.quarantineRecords ?? []).map((q) => q.quarantineId),
      lookups: (assessment?.lookups ?? []).map((l) => ({
        identifierType: l.identifierType,
        identifierValue: l.identifierValue,
        outcome: l.outcome,
        ...(l.quarantineRecordId ? { quarantineRecordId: l.quarantineRecordId } : {}),
        ...(l.details ? { details: l.details } : {}),
      })),
      missingEvidence: assessment?.missingEvidence ?? null,
    };
  });

  const assessedRows = holdings.filter((h) => h.pipelineIdentityStatus !== null).length;
  const identityResolvedRows = holdings.filter((h) => h.identityStatus === 'RESOLVED').length;
  const identityUnresolvedRows = holdings.filter(
    (h) => h.pipelineIdentityStatus === 'UNRESOLVED' || h.pipelineIdentityStatus === 'AMBIGUOUS',
  ).length;

  const publishedSummary = result.identitySummary as
    | {
        readonly evaluated: number;
        readonly resolved: number;
        readonly unresolved: number;
        readonly ambiguous: number;
        readonly notEvaluated: number;
        readonly excluded: number;
        readonly identitySource: string;
        readonly masterRevision?: string;
        readonly saveable: boolean;
        readonly refusalCodes: Readonly<Record<string, number>>;
      }
    | undefined;
  const identitySummary: BrokerPreviewIdentitySummary | null = publishedSummary
    ? {
        evaluated: publishedSummary.evaluated,
        resolved: publishedSummary.resolved,
        unresolved: publishedSummary.unresolved,
        ambiguous: publishedSummary.ambiguous,
        notEvaluated: publishedSummary.notEvaluated,
        excluded: publishedSummary.excluded,
        identitySource: publishedSummary.identitySource,
        masterRevision: publishedSummary.masterRevision ?? null,
        saveable: publishedSummary.saveable,
        refusalCodes: { ...publishedSummary.refusalCodes },
      }
    : null;

  const status: BrokerHoldingsPreview['status'] = result.disposition === 'BLOCKED'
    ? 'BLOCKED'
    : holdings.length === 0
      ? 'REJECTED'
      : identityResolvedRows === holdings.length && holdings.length > 0
        ? 'PARSED_IDENTITIES_RESOLVED'
        : 'PARSED_UNRESOLVED';

  return {
    mode: 'NATIVE_BROKER_PREVIEW',
    persisted: false,
    canSave: false,
    broker: result.detection.brokerType,
    variant: typeof parsed?.metadata?.dhanVariant === 'string' ? parsed.metadata.dhanVariant : undefined,
    status,
    contentDigest: result.provenance.contentDigest,
    asOf,
    identityAuthority: authority,
    identitySummary,
    counts: {
      nativeRows: holdings.length,
      identityAssessedRows: assessedRows,
      identityResolvedRows,
      identityUnresolvedRows,
      savedRows: 0,
    },
    notPerformed: {
      validation: 'NOT_PERFORMED',
      saveAuthorization: 'NOT_PERFORMED',
      persistence: 'NOT_PERFORMED',
      reason: 'A preview parses broker evidence only. It does not validate values, does not authorize a save and never writes holdings.',
    },
    warnings: result.warnings,
    errors: result.errors,
    rejections: result.rejections.map((r) => ({
      recordIndex: r.recordIndex,
      rawIdentifier: r.rawIdentifier,
      reason: r.reason,
      details: r.details,
      stage: r.stage,
    })),
    perRowIdentityEvidencePublished,
    holdings,
  };
}
