/**
 * W11 — execute qualified issuer engines and publish a reproducible record.
 *
 * The executor is injected. The shipped implementation is the existing certified dispatch adapter
 * (`EngineApiAdapter`), which builds the same deterministic runtime the certification used (fixed clock,
 * deterministic id provider, isolated snapshot store) — so the engine semantics are the frozen ones and are not
 * re-implemented here. Tests inject a stub only to exercise refusals without running an engine.
 *
 * What this layer will not do:
 *   - run an engine for an issuer that W10 did not qualify;
 *   - run an engine for a sector the issuer does not belong to;
 *   - infer an issuer from a symbol, a name or an IPD company reference;
 *   - convert a refusal into a score, rank, verdict or approval;
 *   - re-read or re-stamp the portfolio revision the caller supplied.
 */
import { EngineApiAdapter } from '../../integration/EngineApiAdapter';
import type { DatasetContent } from '../fundamentals/types';
import { TRACKED_ENGINE_PROFILES, canonicalJson } from '../qualification';
import { datasetContentDigest, isValidIsoDate, prepareEngineExecution, sha256 } from './inputs';
import type {
  EngineExecutionOutcome,
  EngineExecutionPlan,
  EngineExecutionRecord,
  EngineExecutor,
  ExecutionRefusal,
  ExecutionRefusalCode,
  HoldingExecutionLineage,
  PortfolioExecutionReport,
  PortfolioExecutionRequest,
  PortfolioHoldingEvidence,
  PortfolioRevisionEvidence,
} from './types';
import { W11_EXECUTION_SCHEMA_VERSION } from './types';
import { ISSUER_QUALIFICATION_MAPPING_VERSION, ISSUER_QUALIFICATION_POLICY_VERSION } from '../qualification/types';

/** The certified dispatch path, adapted to the W11 executor contract. Nothing about it is modified. */
export function certifiedEngineExecutor(): EngineExecutor {
  const adapter = new EngineApiAdapter();
  return Object.freeze({
    execute(request: { engineId: string; requestId: string; inputs: Readonly<Record<string, unknown>> }): EngineExecutionOutcome {
      const response = adapter.execute({
        apiVersion: '1.0',
        engineId: request.engineId,
        requestId: request.requestId,
        inputs: { ...request.inputs },
      });
      return Object.freeze({
        state: response.state,
        ...(response.verdict === undefined ? {} : { verdict: response.verdict }),
        ...(response.composite === undefined ? {} : { composite: response.composite }),
        ...(response.snapshotRef === undefined ? {} : { snapshotRef: response.snapshotRef }),
        ...(response.evidenceRef === undefined ? {} : { evidenceRef: response.evidenceRef }),
        provenance: response.provenance as unknown as Readonly<Record<string, unknown>>,
        ...(response.reason === undefined ? {} : { reason: response.reason }),
      });
    },
  });
}

const EMPTY_FIELDS = Object.freeze([]) as readonly { readonly field: string; readonly outcome: string; readonly codes: readonly string[] }[];

function makeRefusal(
  code: ExecutionRefusalCode,
  detail: string,
  context: { issuerId?: string | null; holdingIndex?: number | null; engineId?: string | null; qualificationState?: string | null; fieldRefusals?: readonly { field: string; outcome: string; codes: readonly string[] }[] } = {},
): ExecutionRefusal {
  return Object.freeze({
    code,
    detail,
    issuerId: context.issuerId ?? null,
    holdingIndex: context.holdingIndex ?? null,
    engineId: context.engineId ?? null,
    qualificationState: context.qualificationState ?? null,
    fieldRefusals: Object.freeze([...(context.fieldRefusals ?? EMPTY_FIELDS)]),
  });
}

function identityRefusalCode(holding: PortfolioHoldingEvidence): ExecutionRefusalCode | null {
  if (holding.issuerId !== null && holding.identityState === 'RESOLVED' && holding.securityId !== null && holding.assessable) return null;
  if (holding.identityState === 'RESOLVED' && !holding.assessable) return 'HOLDING_NOT_ASSESSABLE';
  if (holding.identityState.startsWith('AMBIGUOUS') || holding.identityState === 'ISSUER_KEY_CONFLICT') return 'HOLDING_IDENTITY_AMBIGUOUS';
  if (holding.identityState.startsWith('REJECTED')) return 'HOLDING_IDENTITY_REJECTED';
  return 'HOLDING_IDENTITY_UNRESOLVED';
}

function securityBinding(
  content: DatasetContent,
  issuerId: string,
  securityId: string,
): { readonly ok: true; readonly listingId: string | null; readonly declared: boolean } | { readonly ok: false; readonly code: ExecutionRefusalCode; readonly detail: string } {
  const security = content.securities.find((candidate) => candidate.securityId === securityId);
  if (security === undefined) {
    if (content.securities.length === 0) {
      // An issuer-scoped dataset may carry no security rows at all; the governed resolver's identity is then the
      // only binding evidence, and the record states that the dataset did not corroborate it.
      return { ok: true, listingId: null, declared: false };
    }
    return {
      ok: false,
      code: 'SECURITY_NOT_IN_DATASET',
      detail: `Security '${securityId}' is not declared by this dataset, so no financial evidence is bound to the holding.`,
    };
  }
  if (security.issuerId !== issuerId) {
    return {
      ok: false,
      code: 'SECURITY_ISSUER_MISMATCH',
      detail: `Security '${securityId}' belongs to '${security.issuerId}' in the dataset, not to '${issuerId}'.`,
    };
  }
  const listing = content.listings.find((candidate) => candidate.issuerId === issuerId && candidate.securityId === securityId);
  return { ok: true, listingId: listing?.listingId ?? null, declared: true };
}

function outputDigestOf(outcome: EngineExecutionOutcome): string {
  return `sha256:${sha256(
    canonicalJson({
      state: outcome.state,
      verdict: outcome.verdict ?? null,
      composite: outcome.composite ?? null,
      snapshotRef: outcome.snapshotRef ?? null,
      evidenceRef: outcome.evidenceRef ?? null,
    }),
  )}`;
}

function executionRecord(
  plan: Extract<EngineExecutionPlan, { kind: 'PREPARED' }>,
  context: {
    readonly content: DatasetContent;
    readonly issuerId: string;
    readonly legalName: string;
    readonly sector: string;
    readonly portfolio: PortfolioRevisionEvidence;
    readonly holding: PortfolioHoldingEvidence;
    readonly listingId: string | null;
    readonly asOf: string;
    readonly datasetVersion: string | null;
    readonly contentDigest: string;
  },
  outcome: EngineExecutionOutcome,
): EngineExecutionRecord {
  return Object.freeze({
    schemaVersion: W11_EXECUTION_SCHEMA_VERSION,
    issuerId: context.issuerId,
    legalName: context.legalName,
    sector: context.sector,
    portfolioId: context.portfolio.portfolioId,
    portfolioRevision: context.portfolio.revision,
    portfolioReadSource: context.portfolio.readSource,
    portfolioObservedAt: context.portfolio.observedAt,
    holdingIndex: context.holding.holdingIndex,
    weightPercentage: context.holding.weightPercentage ?? null,
    securityId: context.holding.securityId,
    listingId: context.listingId,
    resolutionBasis: context.holding.resolutionBasis,
    engineId: plan.engineId,
    ies: plan.ies,
    engineVersion: plan.engineVersion,
    calibrationVersion: plan.calibrationVersion,
    asOf: context.asOf,
    periodEnd: plan.periodEnd,
    statementScope: plan.statementScope,
    datasetVersion: context.datasetVersion,
    contentDigest: context.contentDigest,
    mappingDigest: plan.mappingDigest,
    mappingVersion: plan.mappingVersion,
    policyVersion: plan.policyVersion,
    qualificationDigest: plan.qualificationDigest,
    inputDigest: plan.inputDigest,
    requestId: plan.requestId,
    inputs: plan.inputs,
    inputLineage: plan.inputLineage,
    omittedInputs: plan.omittedInputs,
    output: Object.freeze({
      state: outcome.state,
      verdict: outcome.verdict ?? null,
      composite: outcome.composite ?? null,
      snapshotRef: outcome.snapshotRef ?? null,
      evidenceRef: outcome.evidenceRef ?? null,
      outputDigest: outputDigestOf(outcome),
      provenance: outcome.provenance ?? null,
    }),
    deterministic: true,
  });
}

export interface ExecuteIssuerResult {
  readonly record: EngineExecutionRecord | null;
  readonly refusal: ExecutionRefusal | null;
}

/**
 * Execute one issuer against its certified engine, for one portfolio holding.
 *
 * Order of refusals is deliberate: identity, then dataset binding, then qualification, then execution. Nothing is
 * attempted before the previous step is evidenced.
 */
export function executeIssuerEngine(request: {
  readonly content: DatasetContent;
  readonly issuerId: string;
  readonly asOf: string;
  readonly portfolio: Pick<PortfolioRevisionEvidence, 'portfolioId' | 'revision' | 'readSource' | 'observedAt'>;
  readonly holding: PortfolioHoldingEvidence;
  readonly datasetVersion?: string | null;
  readonly expectedDatasetDigest?: string | null;
  readonly policy?: PortfolioExecutionRequest['policy'];
  readonly executor?: EngineExecutor;
}): ExecuteIssuerResult {
  const { content, issuerId, asOf, portfolio, holding } = request;

  const plan = prepareEngineExecution({
    content,
    issuerId,
    asOf,
    ...(request.expectedDatasetDigest === undefined ? {} : { expectedDatasetDigest: request.expectedDatasetDigest }),
    ...(request.policy === undefined ? {} : { policy: request.policy }),
  });
  if (plan.kind === 'REFUSED') {
    return { record: null, refusal: makeRefusal(plan.refusal.code, plan.refusal.detail, { ...plan.refusal, holdingIndex: holding.holdingIndex }) };
  }

  const issuer = content.issuers.find((candidate) => candidate.issuerId === issuerId)!;
  const binding = securityBinding(content, issuerId, holding.securityId!);
  if (!binding.ok) {
    return { record: null, refusal: makeRefusal(binding.code, binding.detail, { issuerId, holdingIndex: holding.holdingIndex, engineId: plan.engineId }) };
  }

  const executor = request.executor ?? certifiedEngineExecutor();
  let outcome: EngineExecutionOutcome;
  try {
    outcome = executor.execute({ engineId: plan.engineId, requestId: plan.requestId, inputs: plan.inputs });
  } catch (error) {
    return {
      record: null,
      refusal: makeRefusal('ENGINE_EXECUTION_FAILED', `The certified dispatch path threw: ${error instanceof Error ? error.message : String(error)}`, {
        issuerId,
        holdingIndex: holding.holdingIndex,
        engineId: plan.engineId,
      }),
    };
  }

  if (outcome.state !== 'COMPLETED') {
    return {
      record: null,
      refusal: makeRefusal('ENGINE_EXECUTION_FAILED', `The engine returned ${outcome.state}${outcome.reason === undefined ? '' : `: ${outcome.reason}`}; no output is published.`, {
        issuerId,
        holdingIndex: holding.holdingIndex,
        engineId: plan.engineId,
      }),
    };
  }

  const record = executionRecord(plan, {
    content,
    issuerId,
    legalName: issuer.legalName,
    sector: issuer.sector,
    portfolio: { ...portfolio, holdings: [] },
    holding,
    listingId: binding.listingId,
    asOf,
    datasetVersion: request.datasetVersion ?? null,
    contentDigest: datasetContentDigest(content),
  }, outcome);

  return { record, refusal: null };
}

const LIMITATIONS: readonly string[] = Object.freeze([
  'An executed engine produces the frozen engine’s own verdict and composite. IRR adds no score, rank, recommendation or issuer approval, and a refusal never carries one.',
  'Only fields whose W10 qualification outcome is RESOLVED reach an engine. Unmapped, conflicting, missing, stale, invalid and unauthorised inputs are omitted and reported, never substituted.',
  'The W10 finding that 62 required inputs lack authorised sources is preserved: twelve of the thirteen engines cannot be qualified today, so they cannot execute.',
  'The portfolio revision, read source and observation time are the caller’s governed read. This module does not re-read, re-stamp or repair them.',
  'The content digest is computed over the dataset actually read; the governed manifest digest is recorded separately and is not recomputed here.',
  'No engine is executed for an issuer whose identity was not resolved from governed evidence. A symbol, a company name or an IPD company reference is never an identity.',
]);

/** Execute every holding of a portfolio against the engine certified for its issuer’s sector. */
export function executePortfolioEngines(request: PortfolioExecutionRequest): PortfolioExecutionReport {
  const { content, portfolio, asOf } = request;
  const refusals: ExecutionRefusal[] = [];
  const executions: EngineExecutionRecord[] = [];
  const holdings: HoldingExecutionLineage[] = [];
  const contentDigest = datasetContentDigest(content);
  const executor = request.executor ?? certifiedEngineExecutor();

  const portfolioRefusal = (code: ExecutionRefusalCode, detail: string): PortfolioExecutionReport => {
    refusals.push(makeRefusal(code, detail));
    return buildReport(request, contentDigest, holdings, executions, refusals);
  };

  if (!isValidIsoDate(asOf)) {
    return portfolioRefusal('EVALUATION_CLOCK_INVALID', `asOf must be an ISO date/timestamp; received ${String(asOf)}`);
  }
  if (typeof portfolio.portfolioId !== 'string' || portfolio.portfolioId.trim() === '') {
    return portfolioRefusal('PORTFOLIO_PROVENANCE_UNVERIFIED', 'The portfolio id is empty; a revision cannot be attributed to a portfolio.');
  }
  if (!Number.isInteger(portfolio.revision) || portfolio.revision < 1) {
    return portfolioRefusal('PORTFOLIO_REVISION_INVALID', `The portfolio revision must be a positive integer; received ${String(portfolio.revision)}.`);
  }
  if (typeof portfolio.readSource !== 'string' || portfolio.readSource.trim() === '') {
    return portfolioRefusal('PORTFOLIO_PROVENANCE_UNVERIFIED', 'The governed read source is not stated; the revision cannot be attributed.');
  }
  if (!isValidIsoDate(portfolio.observedAt)) {
    return portfolioRefusal('PORTFOLIO_PROVENANCE_UNVERIFIED', `The observation time must be ISO; received ${String(portfolio.observedAt)}.`);
  }
  if (request.expectedRevision !== undefined && request.expectedRevision !== null && request.expectedRevision !== portfolio.revision) {
    return portfolioRefusal(
      'PORTFOLIO_REVISION_MISMATCH',
      `The caller is pinned to revision ${request.expectedRevision} but the supplied read is revision ${portfolio.revision}; executing would silently analyse a different revision.`,
    );
  }
  if (request.expectedDatasetDigest !== undefined && request.expectedDatasetDigest !== null && request.expectedDatasetDigest !== contentDigest) {
    return portfolioRefusal('DATASET_DIGEST_MISMATCH', `The dataset content read hashes to ${contentDigest}, not the pinned ${request.expectedDatasetDigest}.`);
  }
  if (portfolio.holdings.length === 0) {
    return portfolioRefusal('PORTFOLIO_EMPTY', 'The portfolio revision carries no holdings, so there is nothing to execute.');
  }

  const ordered = [...portfolio.holdings].sort((a, b) => a.holdingIndex - b.holdingIndex);
  for (const holding of ordered) {
    const identityCode = identityRefusalCode(holding);
    if (identityCode !== null) {
      const detail = holdingDetail(holding, identityCode);
      refusals.push(makeRefusal(identityCode, detail, { issuerId: holding.issuerId, holdingIndex: holding.holdingIndex }));
      holdings.push(lineageOf(holding, null, 'REFUSED', [identityCode]));
      continue;
    }

    const result = executeIssuerEngine({
      content,
      issuerId: holding.issuerId!,
      asOf,
      portfolio,
      holding,
      executor,
      ...(request.datasetVersion === undefined ? {} : { datasetVersion: request.datasetVersion }),
      ...(request.policy === undefined ? {} : { policy: request.policy }),
    });

    if (result.record === null) {
      refusals.push(result.refusal!);
      holdings.push(lineageOf(holding, result.refusal!.engineId, 'REFUSED', [result.refusal!.code]));
      continue;
    }
    executions.push(result.record);
    holdings.push(lineageOf(holding, result.record.engineId, 'EXECUTED', []));
  }

  return buildReport(request, contentDigest, holdings, executions, refusals);
}

function holdingDetail(holding: PortfolioHoldingEvidence, code: ExecutionRefusalCode): string {
  const reason = holding.reason === null ? 'no further reason was published' : holding.reason;
  switch (code) {
    case 'HOLDING_NOT_ASSESSABLE':
      return `Holding ${holding.holdingIndex} resolved to an issuer but carries no assessable listing (${reason}).`;
    case 'HOLDING_IDENTITY_AMBIGUOUS':
      return `Holding ${holding.holdingIndex} is ambiguous under the identity contract (${reason}); the execution path refuses to choose.`;
    case 'HOLDING_IDENTITY_REJECTED':
      return `Holding ${holding.holdingIndex} was rejected by the identity contract (${reason}).`;
    default:
      return `Holding ${holding.holdingIndex} did not resolve to an issuer (${holding.identityState}; ${reason}).`;
  }
}

function lineageOf(
  holding: PortfolioHoldingEvidence,
  engineId: string | null,
  outcome: 'EXECUTED' | 'REFUSED',
  codes: readonly string[],
): HoldingExecutionLineage {
  return Object.freeze({
    holdingIndex: holding.holdingIndex,
    securityId: holding.securityId,
    isin: holding.isin,
    series: holding.series,
    issuerId: holding.issuerId,
    identityState: holding.identityState,
    resolutionBasis: holding.resolutionBasis,
    outcome,
    engineId,
    codes: Object.freeze([...codes]),
  });
}

function buildReport(
  request: PortfolioExecutionRequest,
  contentDigest: string,
  holdings: readonly HoldingExecutionLineage[],
  executions: readonly EngineExecutionRecord[],
  refusals: readonly ExecutionRefusal[],
): PortfolioExecutionReport {
  const enginesExecuted = [...new Set(executions.map((record) => record.engineId))].sort();
  const enginesRefused = [...new Set(refusals.map((refusal) => refusal.engineId).filter((id): id is string => id !== null))].sort();
  const issuers = new Set(executions.map((record) => record.issuerId));
  return Object.freeze({
    schemaVersion: W11_EXECUTION_SCHEMA_VERSION,
    portfolioId: request.portfolio.portfolioId,
    portfolioRevision: request.portfolio.revision,
    portfolioReadSource: request.portfolio.readSource,
    portfolioObservedAt: request.portfolio.observedAt,
    ownerBindingRef: request.portfolio.ownerBindingRef ?? null,
    expectedRevision: request.expectedRevision ?? null,
    asOf: request.asOf,
    datasetVersion: request.datasetVersion ?? null,
    contentDigest,
    mappingVersion: ISSUER_QUALIFICATION_MAPPING_VERSION,
    policyVersion: ISSUER_QUALIFICATION_POLICY_VERSION,
    holdings: Object.freeze([...holdings]),
    executions: Object.freeze([...executions]),
    refusals: Object.freeze([...refusals]),
    summary: Object.freeze({
      holdings: holdings.length,
      executed: executions.length,
      refused: refusals.length,
      issuersExecuted: issuers.size,
      enginesExecuted: Object.freeze(enginesExecuted),
      enginesRefused: Object.freeze(enginesRefused),
    }),
    limitations: LIMITATIONS,
    note:
      'Compatible execution only: a holding executes when its governed identity resolves, its issuer is in the dataset, and W10 qualifies that issuer’s own certified engine at the pinned period. Every other holding is refused with a code and no score.',
  });
}
