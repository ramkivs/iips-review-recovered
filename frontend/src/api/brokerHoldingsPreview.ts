/** Read-only broker preview. No PortfolioStore, persistence, identity bypass or network.
 *
 * Native broker evidence is not an authoritative security mapping or a save request.
 *
 * WHAT THE PREVIEW MAY AND MAY NOT CLAIM (WS-A correction, 2026-11-05)
 *   The preview previously handed IPD's ingress an EMPTY `SecurityMaster`, so no row could ever
 *   resolve, and it then reported `Resolved rows 0 / Unresolved rows 68` as though those were
 *   lookup results. It also labelled every row `UNRESOLVED` unconditionally. Two claims were
 *   therefore untrue by construction: (a) that identity had been evaluated, and (b) that the
 *   zero was a property of the broker file rather than of the empty master.
 *
 *   The preview now supplies the IPD-OWNED governed D05 broad-universe security master (identity
 *   authority stays with IPD; IRR never resolves identity itself), and separates what is measured
 *   from what is not:
 *
 *     nativeRows            parsed rows (`parseResult.holdings.length`)
 *     identityAssessedRows  rows for which the pipeline produced an individual identity outcome.
 *                           The pinned IPD mapper refuses the whole file at the FIRST unresolved
 *                           security, so this is 0 whenever the import is refused — an honest
 *                           zero, not a resolution result.
 *     identityResolvedRows  resolved holdings actually returned by the pipeline (0 while refused)
 *     savedRows             always 0: the preview can not save and never calls a store
 *
 *   `PARSED_UNRESOLVED` therefore means "parsed; canonical identity was not established", never
 *   "looked up and unmapped for all 68 rows". Per-row identity evidence requires the IPD
 *   correction `WS-A-DHAN-BROKER-IDENTITY-EVIDENCE-RECORD-2026-11-05` (owner: IPD) to be published
 *   and this dependency pin advanced; until then the preview reports the refusal it actually got
 *   and marks the rows' identity basis as file-level.
 */
import { BrokerImportIngressOrchestrator } from '../../.cache/broker-import/frontend/src/features/portfolio/import/broker-import-ingress.js';
import { getGovernedBroadSecurityMaster } from '../../.cache/broker-import/src/identity/governed_fixture_master.js';

export type BrokerRowIdentityBasis =
  /** The pipeline resolved this row's canonical identity. */
  | 'PIPELINE_RESOLVED'
  /** The pipeline refused the file; this row's individual outcome was not produced. */
  | 'FILE_LEVEL_P04_REFUSAL'
  /** The file itself was rejected/blocked before identity resolution. */
  | 'NOT_EVALUATED';

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
  const resolvedSymbols = new Set((result.userHoldings ?? []).map((h) => h.symbol));
  const identityRefused = result.rejections.some((r) => r.reason === 'UNMAPPED_IDENTITY' || r.reason === 'IDENTITY_AMBIGUITY');
  const pipelineRan = (parsed?.holdings.length ?? 0) > 0;

  const holdings: BrokerPreviewRow[] = (parsed?.holdings ?? []).map((h) => {
    const resolved = resolvedSymbols.has(h.symbol);
    return {
      symbol: h.symbol,
      isin: h.isin ?? null,
      exchange: h.exchange ?? null,
      quantity: h.quantity,
      averagePrice: h.averagePrice,
      currentPrice: h.currentPrice ?? null,
      identityStatus: resolved ? 'RESOLVED' : 'UNRESOLVED',
      identityBasis: resolved
        ? 'PIPELINE_RESOLVED'
        : identityRefused
          ? 'FILE_LEVEL_P04_REFUSAL'
          : pipelineRan
            ? 'NOT_EVALUATED'
            : 'NOT_EVALUATED',
    };
  });

  const identityResolvedRows = holdings.filter((h) => h.identityStatus === 'RESOLVED').length;
  // The pinned IPD mapper publishes no individual outcome when it refuses the file, so a refusal
  // means ZERO rows were individually assessed. Only a completed pipeline assesses every row.
  const identityAssessedRows = result.disposition === 'READY_FOR_PORTFOLIO_SAVE' ? holdings.length : 0;
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
    counts: {
      nativeRows: holdings.length,
      identityAssessedRows,
      identityResolvedRows,
      identityUnresolvedRows: holdings.length - identityResolvedRows,
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
    holdings,
  };
}
