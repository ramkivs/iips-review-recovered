/**
 * W11 — compatible issuer-engine execution: contracts.
 *
 * The chain this module makes auditable is
 *
 *   persisted portfolio (revision, read source, observed time)
 *     → holding row (security identity as the governed resolver returned it, never a name or a ticker)
 *     → issuer (resolved by W08 evidence; never inferred here)
 *     → W10 qualification of that issuer at a pinned period
 *     → engine input built only from RESOLVED field values, with per-field lineage
 *     → frozen certified engine executed through the existing certified dispatch path
 *     → reproducible, digest-addressed output record.
 *
 * The integration layer adds no scoring, no ranking, no recommendation and no issuer approval. Where any
 * transition cannot be evidenced, execution is refused with a closed code and the refusal carries no score.
 *
 * This module is additive and lives outside every A13-protected path. It imports the frozen registry and the
 * certified dispatch adapter; it does not modify them, and it does not modify any sector engine, calibration,
 * golden value or certified contract.
 */
import type { DatasetContent } from '../fundamentals/types';
import type { QualificationPolicy } from '../qualification/types';

export const W11_EXECUTION_SCHEMA_VERSION = 'w11-issuer-engine-execution/1.0.0';

/** Closed refusal vocabulary. A refusal is an outcome, never a score. */
export const EXECUTION_REFUSAL_CODES = [
  'EVALUATION_CLOCK_INVALID',
  'PORTFOLIO_REVISION_INVALID',
  'PORTFOLIO_REVISION_MISMATCH',
  'PORTFOLIO_PROVENANCE_UNVERIFIED',
  'PORTFOLIO_EMPTY',
  'DATASET_DIGEST_MISMATCH',
  'ISSUER_NOT_IN_DATASET',
  'HOLDING_IDENTITY_UNRESOLVED',
  'HOLDING_IDENTITY_AMBIGUOUS',
  'HOLDING_IDENTITY_REJECTED',
  'HOLDING_NOT_ASSESSABLE',
  'SECURITY_NOT_IN_DATASET',
  'SECURITY_ISSUER_MISMATCH',
  'NO_ENGINE_FOR_SECTOR',
  'ENGINE_NOT_CERTIFIED',
  'ENGINE_NOT_APPLICABLE',
  'QUALIFICATION_NOT_QUALIFIED',
  'ENGINE_INPUT_UNAUTHORIZED',
  'ENGINE_EXECUTION_FAILED',
] as const;
export type ExecutionRefusalCode = (typeof EXECUTION_REFUSAL_CODES)[number];

/**
 * The portfolio revision a caller read, with the provenance needed to prove it.
 *
 * IRR does not own the portfolio and does not re-stamp its revision: the caller passes exactly what the governed
 * read returned (`G2PortfolioView.revision` and the transport it came from). Every execution record carries it.
 */
export interface PortfolioRevisionEvidence {
  readonly portfolioId: string;
  /** The durable revision the holdings were read at. Must be a positive integer. */
  readonly revision: number;
  /** Which governed read produced it (for example the IPD G-2 IPC contract and its version). */
  readonly readSource: string;
  /** When the read was made, from the caller's clock — never the wall clock read here. */
  readonly observedAt: string;
  /** Owner-binding provenance as the read reported it, or null when the read did not carry one. */
  readonly ownerBindingRef?: string | null;
  readonly holdings: readonly PortfolioHoldingEvidence[];
}

/**
 * One holding row, with the identity the governed resolver established for it.
 *
 * `issuerId`/`securityId` come from W08 resolution. This module never derives them from a symbol, a name or an
 * IPD company reference; an unresolved or ambiguous row is refused, not guessed.
 */
export interface PortfolioHoldingEvidence {
  readonly holdingIndex: number;
  readonly securityId: string | null;
  readonly isin: string | null;
  readonly series: string | null;
  readonly issuerId: string | null;
  /** A `ResolutionState` from the identity contract (`RESOLVED`, `AMBIGUOUS`, `UNMATCHED`, …). */
  readonly identityState: string;
  readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null;
  readonly assessable: boolean;
  readonly reason: string | null;
  readonly weightPercentage?: number | null;
}

/** One engine input, republished with the evidence that authorised it. */
export interface EngineInputLine {
  readonly field: string;
  readonly requirement: string;
  readonly mappingStatus: string;
  readonly value: number | string | boolean;
  readonly unit: string | null;
  readonly transformation: string;
  readonly periodEnd: string | null;
  readonly statementScope: string | null;
  readonly basis: string | null;
  readonly presence: string | null;
  readonly sourceRef: string | null;
  readonly filingRef: string | null;
  readonly sourceClass: string | null;
}

/** An input the engine declares but this execution does not supply, with the reason. */
export interface OmittedInput {
  readonly field: string;
  readonly requirement: string;
  readonly mappingStatus: string;
  readonly outcome: string;
  readonly codes: readonly string[];
}

/** The outcome of the certified dispatch path, narrowed to what W11 publishes. */
export interface EngineExecutionOutcome {
  readonly state: 'COMPLETED' | 'FAILED' | 'DENIED';
  readonly verdict?: string;
  readonly composite?: number;
  readonly snapshotRef?: string;
  readonly evidenceRef?: string;
  readonly provenance?: Readonly<Record<string, unknown>>;
  readonly reason?: string;
}

/** Injected so the platform module can be tested with a stub and shipped with the certified adapter. */
export interface EngineExecutor {
  execute(request: {
    readonly engineId: string;
    readonly requestId: string;
    readonly inputs: Readonly<Record<string, unknown>>;
  }): EngineExecutionOutcome;
}

/** A refusal: the closed code, the exact reasons, and no score of any kind. */
export interface ExecutionRefusal {
  readonly code: ExecutionRefusalCode;
  readonly detail: string;
  readonly issuerId: string | null;
  readonly holdingIndex: number | null;
  readonly engineId: string | null;
  readonly qualificationState: string | null;
  /** Blocking qualification fields, when the refusal came from qualification. */
  readonly fieldRefusals: readonly {
    readonly field: string;
    readonly outcome: string;
    readonly codes: readonly string[];
  }[];
}

/** One executed engine, fully traceable to the portfolio row and to the qualification that authorised it. */
export interface EngineExecutionRecord {
  readonly schemaVersion: string;
  readonly issuerId: string;
  readonly legalName: string;
  readonly sector: string;
  readonly portfolioId: string;
  readonly portfolioRevision: number;
  readonly portfolioReadSource: string;
  readonly portfolioObservedAt: string;
  readonly holdingIndex: number;
  readonly weightPercentage: number | null;
  readonly securityId: string | null;
  readonly listingId: string | null;
  readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null;
  readonly engineId: string;
  readonly ies: string;
  readonly engineVersion: string;
  readonly calibrationVersion: string;
  readonly asOf: string;
  readonly periodEnd: string | null;
  readonly statementScope: string | null;
  /** Governed dataset digest as declared by the caller/manifest. */
  readonly datasetVersion: string | null;
  /** Digest over the exact content this module read and qualified. */
  readonly contentDigest: string;
  readonly mappingDigest: string;
  readonly mappingVersion: string;
  readonly policyVersion: string;
  /** Digest over the whole W10 qualification report used for this execution. */
  readonly qualificationDigest: string;
  /** Digest over engine identity + period + inputs; also the deterministic request id seed. */
  readonly inputDigest: string;
  readonly requestId: string;
  readonly inputs: Readonly<Record<string, number | string | boolean>>;
  readonly inputLineage: readonly EngineInputLine[];
  readonly omittedInputs: readonly OmittedInput[];
  readonly output: {
    readonly state: string;
    readonly verdict: string | null;
    readonly composite: number | null;
    readonly snapshotRef: string | null;
    readonly evidenceRef: string | null;
    readonly outputDigest: string;
    readonly provenance: Readonly<Record<string, unknown>> | null;
  };
  /** True when the runtime clock and id provider are deterministic (the certified dispatch path is). */
  readonly deterministic: boolean;
}

/** Portfolio-level account: every holding row, executed or refused. */
export interface HoldingExecutionLineage {
  readonly holdingIndex: number;
  readonly securityId: string | null;
  readonly isin: string | null;
  readonly series: string | null;
  readonly issuerId: string | null;
  readonly identityState: string;
  readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null;
  readonly outcome: 'EXECUTED' | 'REFUSED';
  readonly engineId: string | null;
  readonly codes: readonly string[];
}

export interface PortfolioExecutionReport {
  readonly schemaVersion: string;
  readonly portfolioId: string;
  readonly portfolioRevision: number;
  readonly portfolioReadSource: string;
  readonly portfolioObservedAt: string;
  readonly ownerBindingRef: string | null;
  readonly expectedRevision: number | null;
  readonly asOf: string;
  readonly datasetVersion: string | null;
  readonly contentDigest: string;
  readonly mappingVersion: string;
  readonly policyVersion: string;
  readonly holdings: readonly HoldingExecutionLineage[];
  readonly executions: readonly EngineExecutionRecord[];
  readonly refusals: readonly ExecutionRefusal[];
  readonly summary: {
    readonly holdings: number;
    readonly executed: number;
    readonly refused: number;
    readonly issuersExecuted: number;
    readonly enginesExecuted: readonly string[];
    readonly enginesRefused: readonly string[];
  };
  readonly limitations: readonly string[];
  readonly note: string;
}

export interface PortfolioExecutionRequest {
  readonly content: DatasetContent;
  readonly portfolio: PortfolioRevisionEvidence;
  /** Evaluation clock for qualification (the period must be fresh as of this date). Never the wall clock. */
  readonly asOf: string;
  /** The revision the caller believes it read; a mismatch is refused rather than re-read. */
  readonly expectedRevision?: number | null;
  /** The dataset digest the caller pinned; a mismatch with the content read is refused. */
  readonly expectedDatasetDigest?: string | null;
  /** Governed dataset digest from the manifest, recorded verbatim. */
  readonly datasetVersion?: string | null;
  /** Qualification policy overrides (for example enabling the declared closing-balance ratio deviation). */
  readonly policy?: Partial<QualificationPolicy>;
  readonly executor?: EngineExecutor;
}

/** The single-issuer preparation result: a plan that may execute, or a refusal that may not. */
export type EngineExecutionPlan =
  | {
      readonly kind: 'PREPARED';
      readonly engineId: string;
      readonly ies: string;
      readonly sectorFamily: string;
      readonly engineVersion: string;
      readonly calibrationVersion: string;
      readonly periodEnd: string | null;
      readonly statementScope: string | null;
      readonly mappingDigest: string;
      readonly mappingVersion: string;
      readonly policyVersion: string;
      readonly qualificationDigest: string;
      readonly qualificationState: string;
      readonly inputDigest: string;
      readonly requestId: string;
      readonly inputs: Readonly<Record<string, number | string | boolean>>;
      readonly inputLineage: readonly EngineInputLine[];
      readonly omittedInputs: readonly OmittedInput[];
    }
  | { readonly kind: 'REFUSED'; readonly refusal: ExecutionRefusal };
