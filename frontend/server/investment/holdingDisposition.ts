/**
 * IID Stage 6 — S6-1b: a disposition for an ACTUAL persisted holding.
 *
 * This module composes existing parts; it introduces no new rule, store, identity or assessment:
 *
 *   holding      the G2 portfolio view read through the existing IPC read channel (`createPortfolioViewProvider`,
 *                the same binding precondition every holdings read uses) — never a literal, never a fixture
 *                described as real;
 *   identity     `resolveHoldingIdentities` over the versioned identity sources (`loadRuntimeIdentitySources`),
 *                exactly as the served `/api/investment/holdings/:portfolioId/identity` route resolves it;
 *   assessment   the LATEST persisted `investment.company-assessment` version for the resolved issuer, read from
 *                the authoritative NP-04 store through `createInvestmentArtifactService` — never minted here;
 *   limits       `loadOperatorLimitsPolicy` (S6-1): the operator's file at the documented path, or labelled
 *                system defaults, or a fail-closed `LimitsPolicyError`;
 *   engine       `buildDispositionPayload` with `buildPortfolioContext` and `heldSubject`, unchanged;
 *   persistence  `createDispositionRecordsService().record()` — the one write path IID-4 has.
 *
 * FAIL-CLOSED. Every precondition that cannot be met stops the run with a named `HoldingDispositionFailure`
 * BEFORE anything is written: no holding, an ambiguous selector, an inactive holding, unavailable identity
 * sources, an unresolved or non-assessable identity, no persisted assessment, an assessment whose issuer or
 * substantive identity does not match what the store recorded, an invalid policy, a payload that does not carry
 * the limits it was given. Nothing is substituted for a missing input.
 *
 * DUPLICATE PROTECTION is NOT re-implemented here: it is the artifact service's substantive idempotency. A
 * re-run with the same holding facts, the same assessment version and the same limits produces the same
 * substantive identity and is answered `UNCHANGED` / `CLOCK_ONLY_UNCHANGED` with `wrote: false`. A changed
 * input (new assessment version, changed caps, changed weights) APPENDS a version to the SAME `hd:` chain —
 * that is versioning, not duplication.
 *
 * The run reports the holding it used, the identity it resolved, the assessment version it rested on, the
 * limits it applied (with `basis` and the exact `policyVersion`), and what persistence did.
 */
import type { CompanyAssessmentPayload } from '../../../iips-platform/src/investment/assessment/types';
import { notComputable, present, valueOrNull } from '../../../iips-platform/src/investment/contracts/observation';
import { companyScopeToken } from '../../../iips-platform/src/investment/artifacts/scopeToken';
import { buildDispositionPayload, type DispositionEngineInput } from '../../../iips-platform/src/investment/disposition/engine';
import { LimitsPolicyError } from '../../../iips-platform/src/investment/disposition/limits';
import { heldSubject, holdingChainScope } from '../../../iips-platform/src/investment/disposition/subject';
import type {
  DispositionAssessmentRef,
  HoldingDispositionPayload,
  ResolvedLimits,
  SecurityState,
} from '../../../iips-platform/src/investment/disposition/types';
import type { PreviousDisposition } from '../../../iips-platform/src/investment/disposition/verbs';
import { DATASET_CLASSES, type DatasetClass } from '../../../iips-platform/src/investment/fundamentals/datasetClass';
import type { SourceLoadResult } from '../../../iips-platform/src/investment/identity/sources';
import type { IdentitySources } from '../../../iips-platform/src/investment/identity/types';
import type { G2HoldingView, G2PortfolioView } from '../user-portfolio/userPortfolioContract.js';
import { ASSESSMENT_REPORT_TYPE } from './assessmentComposition.js';
import { stableDispositionParameters } from './dispositionComposition.js';
import { createDispositionRecordsService, type DispositionReadResult } from './dispositionService.js';
import { resolveHoldingIdentities, type HoldingIdentity } from './holding-identity-transport.js';
import {
  createInvestmentArtifactService,
  InvestmentArtifactError,
  type InvestmentVersionView,
  type RecordOutcome,
} from './investmentArtifacts.js';
import { loadOperatorLimitsPolicy, type LoadedLimitsPolicy } from './limitsPolicySource.js';
import { buildPortfolioContext, type HoldingIdentityResolver } from './portfolioContext.js';
import { assessmentSubstantiveIdentity } from './substantiveIdentity.js';
import { effectiveHoldingIsin } from './sources.js';

export const HOLDING_DISPOSITION_REPORT_SCHEMA = 'iid-stage6/holding-disposition-run/1' as const;

/** Closed set of reasons this run can stop for. Each names the input that was missing or wrong, never a guess. */
export type HoldingDispositionFailureCode =
  | 'PORTFOLIO_UNAVAILABLE'
  | 'HOLDING_NOT_FOUND'
  | 'HOLDING_AMBIGUOUS'
  | 'HOLDING_INACTIVE'
  | 'IDENTITY_SOURCES_UNAVAILABLE'
  | 'IDENTITY_UNRESOLVED'
  | 'ASSESSMENT_UNAVAILABLE'
  | 'ASSESSMENT_INCONSISTENT'
  | 'POLICY_INVALID'
  | 'DISPOSITION_INCONSISTENT'
  | 'CHAIN_PARAMETERS_DRIFT'
  | 'PERSISTENCE_FAILED';

export class HoldingDispositionFailure extends Error {
  declare readonly cause?: unknown;

  constructor(
    readonly code: HoldingDispositionFailureCode,
    message: string,
    readonly detail: Readonly<Record<string, unknown>> = {},
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = 'HoldingDispositionFailure';
    if (options && 'cause' in options) {
      Object.defineProperty(this, 'cause', { value: options.cause, enumerable: false, writable: true, configurable: true });
    }
  }
}

/**
 * How the operator names the holding. `symbol:` and `isin:` prefixes are explicit; `index:` addresses the row
 * position in the portfolio view; a bare value is tried as a symbol, then as an ISIN. A selector that matches
 * more than one ACTIVE row is ambiguous and stops the run — the operator names one position, not a group.
 */
export type HoldingSelector =
  | { readonly kind: 'SYMBOL'; readonly value: string }
  | { readonly kind: 'ISIN'; readonly value: string }
  | { readonly kind: 'INDEX'; readonly value: number }
  | { readonly kind: 'ANY'; readonly value: string };

export function parseHoldingSelector(text: string): HoldingSelector {
  const trimmed = text.trim();
  if (trimmed.length === 0) throw new HoldingDispositionFailure('HOLDING_NOT_FOUND', 'an empty holding selector names nothing');
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('symbol:')) return { kind: 'SYMBOL', value: trimmed.slice(7).trim().toUpperCase() };
  if (lower.startsWith('isin:')) return { kind: 'ISIN', value: trimmed.slice(5).trim().toUpperCase() };
  if (lower.startsWith('index:')) {
    const index = Number(trimmed.slice(6).trim());
    if (!Number.isInteger(index) || index < 0) {
      throw new HoldingDispositionFailure('HOLDING_NOT_FOUND', `holding index must be a non-negative integer, got ${trimmed}`);
    }
    return { kind: 'INDEX', value: index };
  }
  return { kind: 'ANY', value: trimmed.toUpperCase() };
}

function normalisedIsin(holding: G2HoldingView): string | null {
  const isin = effectiveHoldingIsin(holding);
  if (isin === null) return null;
  const upper = isin.trim().toUpperCase();
  return upper.startsWith('IN:ISIN:') ? upper.slice('IN:ISIN:'.length) : upper;
}

function selectorMatches(holding: G2HoldingView, index: number, selector: HoldingSelector): boolean {
  switch (selector.kind) {
    case 'INDEX':
      return index === selector.value;
    case 'SYMBOL':
      return holding.symbol.trim().toUpperCase() === selector.value;
    case 'ISIN': {
      const isin = normalisedIsin(holding);
      return isin !== null && (isin === selector.value || `IN:ISIN:${isin}` === selector.value);
    }
    case 'ANY': {
      if (holding.symbol.trim().toUpperCase() === selector.value) return true;
      const isin = normalisedIsin(holding);
      return isin !== null && (isin === selector.value || `IN:ISIN:${isin}` === selector.value);
    }
  }
}

/** Pick exactly one holding. Inactive rows are reported, never silently skipped past to another match. */
export function selectHolding(
  view: G2PortfolioView,
  selector: HoldingSelector,
): { readonly holding: G2HoldingView; readonly index: number } {
  const matches = view.holdings
    .map((holding, index) => ({ holding, index }))
    .filter(({ holding, index }) => selectorMatches(holding, index, selector));
  if (matches.length === 0) {
    throw new HoldingDispositionFailure('HOLDING_NOT_FOUND', 'no holding in the portfolio matches the selector', {
      portfolioId: view.portfolioId,
      selector,
      holdingsCount: view.holdings.length,
    });
  }
  const active = matches.filter(({ holding }) => holding.active);
  if (active.length > 1) {
    throw new HoldingDispositionFailure('HOLDING_AMBIGUOUS', 'the selector matches more than one active holding', {
      portfolioId: view.portfolioId,
      selector,
      matches: active.map(({ index, holding }) => ({ index, symbol: holding.symbol, isin: normalisedIsin(holding) })),
    });
  }
  if (active.length === 0) {
    throw new HoldingDispositionFailure('HOLDING_INACTIVE', 'the matched holding is not an active position', {
      portfolioId: view.portfolioId,
      selector,
      matches: matches.map(({ index, holding }) => ({ index, symbol: holding.symbol })),
    });
  }
  return active[0]!;
}

/**
 * The security state the IDENTITY SOURCES establish for a RESOLVED listing at `asOf`: the listing-map window
 * covers the date ⇒ `ACTIVE`. Anything else is `UNKNOWN`, which G-2 withholds on. No other state is inferred;
 * MERGED / DELISTED / SUSPENDED would need a source this run does not have, and it says so instead of guessing.
 */
export function securityStateFromListing(
  sources: IdentitySources,
  listingId: string | null,
  asOf: string,
): { readonly state: SecurityState; readonly exchange: string | null; readonly instrumentType: string | null } {
  if (listingId === null) return { state: 'UNKNOWN', exchange: null, instrumentType: null };
  const entry = sources.listingMap.entries.find((candidate) => candidate.listingId === listingId) ?? null;
  if (entry === null) return { state: 'UNKNOWN', exchange: null, instrumentType: null };
  const inForce = entry.effectiveFrom <= asOf && (entry.effectiveTo === null || entry.effectiveTo >= asOf);
  return { state: inForce ? 'ACTIVE' : 'UNKNOWN', exchange: entry.exchange, instrumentType: entry.instrumentType };
}

/** Sector of an issuer as the eligible roster records it; null when the roster does not carry it. */
function rosterSector(sources: IdentitySources, issuerId: string | null): string | null {
  if (issuerId === null) return null;
  return sources.roster.issuers.find((issuer) => issuer.issuerId === issuerId)?.sector ?? null;
}

function datasetClassOf(version: InvestmentVersionView): DatasetClass {
  const value = version.datasetClass;
  if ((DATASET_CLASSES as readonly string[]).includes(value)) return value as DatasetClass;
  throw new HoldingDispositionFailure('ASSESSMENT_INCONSISTENT', 'the persisted assessment carries a dataset class outside the closed set', {
    reportId: version.reportId,
    datasetClass: value,
  });
}

/**
 * A hard trigger reclassifies immediately, bypassing hysteresis (§A1.4). This run detects the subset that is
 * OBSERVABLE from the previous head and the current assessment: an adequacy change, a quality-verdict change, a
 * moat change, or a change of issuer/security identity. New severity-≥4 risks and restatements are not inferred
 * here; the run reports which comparisons it made so the omission is visible, not hidden.
 */
export function detectHardTrigger(
  previous: HoldingDispositionPayload | null,
  current: { readonly ref: DispositionAssessmentRef; readonly issuerId: string; readonly securityId: string },
): { readonly hardTrigger: boolean; readonly reasons: readonly string[] } {
  if (previous === null) return { hardTrigger: false, reasons: [] };
  const reasons: string[] = [];
  const before = previous.companyAssessmentRef;
  if (before.adequacy !== current.ref.adequacy) reasons.push(`adequacy ${before.adequacy} → ${current.ref.adequacy}`);
  if (before.qualityVerdict !== current.ref.qualityVerdict) {
    reasons.push(`quality ${before.qualityVerdict} → ${current.ref.qualityVerdict}`);
  }
  if (before.moatClassification !== current.ref.moatClassification) {
    reasons.push(`moat ${before.moatClassification} → ${current.ref.moatClassification}`);
  }
  if (previous.subject.issuerId !== current.issuerId || previous.subject.securityId !== current.securityId) {
    reasons.push('subject identity changed');
  }
  return { hardTrigger: reasons.length > 0, reasons };
}

export interface GenerateHoldingDispositionInput {
  readonly portfolioId: string;
  readonly holding: HoldingSelector;
  /** The run clock, recorded as the disposition's `generatedAt`. Supplied by the caller; this module reads none. */
  readonly generatedAt: string;
  /** Identity-resolution date (YYYY-MM-DD). Defaults to the date part of `generatedAt`. */
  readonly asOf?: string;
  /** When true, everything up to and including the payload is built and reported; `record()` is not called. */
  readonly dryRun?: boolean;
}

export interface GenerateHoldingDispositionDeps {
  /** The real portfolio view (production: `createPortfolioViewProvider`). */
  readonly loadPortfolioView: (portfolioId: string) => Promise<G2PortfolioView>;
  /** The versioned identity sources (production: `loadRuntimeIdentitySources(dataRoot)`). */
  readonly loadIdentitySources: () => SourceLoadResult;
  /** S6-1 loader. Defaults to `loadOperatorLimitsPolicy` over `dataRoot`. */
  readonly loadLimitsPolicy?: (asOf: string) => LoadedLimitsPolicy;
  /** Data-domain root for the default limits loader. Ignored when `loadLimitsPolicy` is supplied. */
  readonly dataRoot?: string;
  /** The authoritative NP-04 port and the owner it is scoped to. Validated by the artifact service. */
  readonly port: unknown;
  readonly owner: { readonly tenantId: string; readonly userId: string };
}

export interface HoldingDispositionRunReport {
  readonly schemaVersion: typeof HOLDING_DISPOSITION_REPORT_SCHEMA;
  readonly status: 'RECORDED' | 'UNCHANGED' | 'DRY_RUN';
  readonly generatedAt: string;
  readonly asOf: string;
  readonly portfolio: {
    readonly portfolioId: string;
    readonly revision: number;
    readonly lastUpdated: string;
    readonly holdingsCount: number;
    readonly activeHoldingsCount: number;
  };
  readonly holding: {
    readonly index: number;
    readonly symbol: string;
    readonly isin: string | null;
    readonly exchange: string | null;
    readonly sourceBroker: string;
    readonly quantity: number;
    readonly averageBuyPrice: number;
    readonly marketValue: number;
    readonly weightPercentage: number;
    readonly identityStatus: string | null;
    readonly resolutionDisposition: string | null;
  };
  readonly identity: {
    readonly state: string;
    readonly issuerId: string;
    readonly securityId: string;
    readonly listingId: string;
    readonly resolutionBasis: string | null;
    readonly securityState: SecurityState;
    readonly rosterDataClass: IdentitySources['rosterDataClass'];
  };
  readonly assessment: {
    readonly scopeToken: string;
    readonly reportId: string;
    readonly reportKey: string;
    readonly artifactVersion: number;
    readonly versionCount: number;
    readonly generatedAt: string;
    readonly adequacy: string;
    readonly qualityVerdict: string;
    readonly datasetClass: DatasetClass;
    readonly substantiveDigest: string;
  };
  readonly limits: {
    readonly basis: ResolvedLimits['basis'];
    readonly policyVersion: string;
    readonly effectiveFrom: string;
    readonly singleNameMaxPct: number;
    readonly defaultSectorMaxPct: number;
    readonly source: LoadedLimitsPolicy['source'];
    readonly notes: readonly string[];
  };
  readonly previous: { readonly reportId: string; readonly artifactVersion: number; readonly verb: string | null } | null;
  readonly hardTrigger: { readonly hardTrigger: boolean; readonly reasons: readonly string[] };
  readonly disposition: {
    /** The chain this disposition is filed under (`hd:<portfolio>/<security>`). */
    readonly scopeToken: string;
    /** The payload's own subject scope (position key form). */
    readonly subjectScope: string;
    readonly verb: string | null;
    readonly withheld: HoldingDispositionPayload['disposition']['withheld'];
    readonly capsApplied: HoldingDispositionPayload['disposition']['capsApplied'];
    readonly limitsBasis: ResolvedLimits['basis'];
    readonly limitsPolicyVersion: string;
  };
  readonly persistence: {
    readonly outcome: RecordOutcome;
    readonly wrote: boolean;
    readonly reportKey: string;
    readonly headReportId: string;
    readonly headArtifactVersion: number;
    readonly versionCount: number;
    readonly writtenReportId: string | null;
  } | null;
  /** The payload as built — returned so a caller can inspect it; the persisted bytes are the composition's. */
  readonly payload: HoldingDispositionPayload;
}

function previousHeadOf(
  dispositions: ReturnType<typeof createDispositionRecordsService>,
  portfolioId: string,
  securityId: string,
): DispositionReadResult | null {
  try {
    return dispositions.readHolding(portfolioId, securityId);
  } catch (cause) {
    if (cause instanceof InvestmentArtifactError && cause.code === 'CHAIN_NOT_FOUND') return null;
    // Any other failure on the existing chain is an integrity problem; a new version must not be stacked on it.
    throw new HoldingDispositionFailure('PERSISTENCE_FAILED', 'the existing disposition chain could not be read', {
      portfolioId,
      securityId,
      code: cause instanceof InvestmentArtifactError ? cause.code : null,
    }, { cause });
  }
}

/** The deepest `cause` message, so a store's own words survive the artifact service's wrapping. */
function innermostMessage(error: unknown): string {
  let current: unknown = error;
  let message = error instanceof Error ? error.message : String(error);
  for (let depth = 0; depth < 8 && current instanceof Error && (current as { cause?: unknown }).cause !== undefined; depth += 1) {
    current = (current as { cause?: unknown }).cause;
    if (current instanceof Error) message = current.message;
    else if (current !== undefined) message = String(current);
  }
  return message;
}

export async function generateHoldingDisposition(
  input: GenerateHoldingDispositionInput,
  deps: GenerateHoldingDispositionDeps,
): Promise<HoldingDispositionRunReport> {
  const generatedAt = input.generatedAt;
  const asOf = input.asOf ?? generatedAt.slice(0, 10);

  // ---- 1 limits FIRST: an invalid operator policy stops the run before any store or socket is touched --------
  let loadedLimits: LoadedLimitsPolicy;
  try {
    loadedLimits = (deps.loadLimitsPolicy ?? ((at: string) => loadOperatorLimitsPolicy({ asOf: at, dataRoot: deps.dataRoot })))(
      generatedAt,
    );
  } catch (cause) {
    if (cause instanceof LimitsPolicyError) {
      throw new HoldingDispositionFailure('POLICY_INVALID', `the operator limits policy was rejected: ${cause.message}`, {
        reason: cause.reason,
        detail: cause.detail,
      }, { cause });
    }
    throw cause;
  }
  const limits = loadedLimits.limits;

  // ---- 2 identity sources --------------------------------------------------------------------------------
  const loadedSources = deps.loadIdentitySources();
  if (!loadedSources.available) {
    throw new HoldingDispositionFailure('IDENTITY_SOURCES_UNAVAILABLE', 'the versioned identity sources could not be loaded', {
      issues: loadedSources.issues.map((issue) => ({ file: issue.file, code: issue.code, subject: issue.subject })),
    });
  }
  const sources = loadedSources.sources;

  // ---- 3 the real portfolio view -------------------------------------------------------------------------
  let view: G2PortfolioView;
  try {
    view = await deps.loadPortfolioView(input.portfolioId);
  } catch (cause) {
    throw new HoldingDispositionFailure('PORTFOLIO_UNAVAILABLE', 'the portfolio could not be read through the IPC read channel', {
      portfolioId: input.portfolioId,
      message: cause instanceof Error ? cause.message : String(cause),
    }, { cause });
  }
  if (view.portfolioId !== input.portfolioId) {
    throw new HoldingDispositionFailure('PORTFOLIO_UNAVAILABLE', 'the read channel returned a different portfolio than requested', {
      requested: input.portfolioId,
      returned: view.portfolioId,
    });
  }
  const { holding, index } = selectHolding(view, input.holding);

  // ---- 4 identity, resolved exactly as the served identity route resolves it ------------------------------
  const identities = resolveHoldingIdentities(view.portfolioId, view.holdings, sources, asOf);
  const identity: HoldingIdentity = identities[index]!;
  if (identity.state !== 'RESOLVED' || !identity.assessable || identity.issuerId === null || identity.securityId === null || identity.listingId === null) {
    throw new HoldingDispositionFailure('IDENTITY_UNRESOLVED', 'the holding does not resolve to an assessable listed security', {
      symbol: holding.symbol,
      isin: identity.isin,
      state: identity.state,
      reason: identity.reason,
      reasonText: identity.reasonText,
      assessable: identity.assessable,
    });
  }
  const issuerId = identity.issuerId;
  const securityId = identity.securityId;
  const listing = securityStateFromListing(sources, identity.listingId, asOf);
  if (listing.instrumentType !== 'EQUITY') {
    throw new HoldingDispositionFailure('IDENTITY_UNRESOLVED', 'only a listed EQUITY instrument can be given a held disposition in v1', {
      listingId: identity.listingId,
      instrumentType: listing.instrumentType,
    });
  }
  const exchange = listing.exchange ?? holding.exchange ?? null;
  if (exchange !== 'NSE' && exchange !== 'BSE') {
    throw new HoldingDispositionFailure('IDENTITY_UNRESOLVED', 'the listing exchange is not in the closed set', {
      listingId: identity.listingId,
      exchange,
    });
  }

  // ---- 5 the latest persisted assessment for the issuer ----------------------------------------------------
  const artifacts = createInvestmentArtifactService({ port: deps.port, owner: deps.owner });
  const assessmentScope = companyScopeToken(issuerId);
  let chain;
  try {
    chain = artifacts.readChain(assessmentScope, ASSESSMENT_REPORT_TYPE);
  } catch (cause) {
    if (cause instanceof InvestmentArtifactError && cause.code === 'CHAIN_NOT_FOUND') {
      throw new HoldingDispositionFailure('ASSESSMENT_UNAVAILABLE', 'no company assessment is persisted for the resolved issuer; none is created here', {
        issuerId,
        scopeToken: assessmentScope,
      }, { cause });
    }
    throw new HoldingDispositionFailure('ASSESSMENT_UNAVAILABLE', 'the assessment chain could not be read', {
      issuerId,
      code: cause instanceof InvestmentArtifactError ? cause.code : null,
    }, { cause });
  }
  if (chain.versions.length === 0) {
    throw new HoldingDispositionFailure('ASSESSMENT_UNAVAILABLE', 'the assessment chain has no versions', { issuerId });
  }
  const headVersion = chain.head;
  const { version, payload: assessmentText } = artifacts.readVersionWithPayload(assessmentScope, headVersion.reportId, ASSESSMENT_REPORT_TYPE);
  let assessment: CompanyAssessmentPayload;
  try {
    assessment = JSON.parse(assessmentText) as CompanyAssessmentPayload;
  } catch (cause) {
    throw new HoldingDispositionFailure('ASSESSMENT_INCONSISTENT', 'the persisted assessment payload is not JSON', { reportId: version.reportId }, { cause });
  }
  if (assessment?.subject?.issuerId !== issuerId) {
    throw new HoldingDispositionFailure('ASSESSMENT_INCONSISTENT', 'the persisted assessment is not about the resolved issuer', {
      reportId: version.reportId,
      expectedIssuerId: issuerId,
      assessmentIssuerId: assessment?.subject?.issuerId ?? null,
    });
  }
  const assessmentIdentity = assessmentSubstantiveIdentity(assessment);
  if (version.substantiveDigest !== null && version.substantiveDigest !== assessmentIdentity.substantiveDigest) {
    throw new HoldingDispositionFailure('ASSESSMENT_INCONSISTENT', 'the persisted assessment no longer hashes to its recorded substantive identity', {
      reportId: version.reportId,
      recorded: version.substantiveDigest,
      computed: assessmentIdentity.substantiveDigest,
    });
  }
  const datasetClass = datasetClassOf(version);
  const assessmentRef: DispositionAssessmentRef = {
    reportId: version.reportId,
    reportKey: version.reportKey,
    artifactVersion: version.artifactVersion,
    generatedAt: version.generatedAt,
    adequacy: assessment.completeness.adequacy,
    qualityVerdict: assessment.quality.verdict,
    moatClassification: assessment.moat.classification,
    datasetClass,
    datasetVersion: assessment.data.datasetVersion,
    contentDigest: assessment.data.contentDigest,
    dataAsOf: assessment.asOf.dataAsOf,
    knownAsOf: assessment.asOf.knownAsOf,
    modelVersion: assessment.artifact.modelVersion,
    policyVersion: assessment.artifact.policyVersion,
  };

  // ---- 6 portfolio context over the REAL view; other holdings resolve through the same sources ------------
  const resolveIdentity: HoldingIdentityResolver = (row) => {
    const rowIndex = view.holdings.indexOf(row);
    const resolved = rowIndex === -1 ? null : identities[rowIndex] ?? null;
    const rowIssuer = resolved !== null && resolved.state === 'RESOLVED' ? resolved.issuerId : null;
    return { issuerId: rowIssuer, sector: rosterSector(sources, rowIssuer) };
  };
  const subjectSector = assessment.subject.sector ?? null;
  const portfolio = buildPortfolioContext({
    view,
    subjectSecurityId: securityId,
    subjectIssuerId: issuerId,
    subjectSector,
    asOf: view.lastUpdated,
    resolveIdentity,
  });

  // ---- 7 the held subject, from the holding row as the read channel delivered it -------------------------
  const rowSource = { kind: 'DATASET' as const, ref: 'user-portfolio:view', locator: `portfolio:${view.portfolioId}/revision:${view.revision}/holding:${index}` };
  const unrealisedGainPct =
    Number.isFinite(holding.averageBuyPrice) && holding.averageBuyPrice > 0 && Number.isFinite(holding.currentPrice)
      ? present(Math.round(((holding.currentPrice - holding.averageBuyPrice) / holding.averageBuyPrice) * 10_000) / 100, {
          kind: 'DERIVED',
          ref: 'holding-disposition/unrealised-gain',
          locator: rowSource.locator,
        })
      : notComputable('DIVISION_BY_ZERO');
  const subject = heldSubject({
    portfolioId: view.portfolioId,
    securityId,
    issuerId,
    symbol: holding.symbol,
    exchange,
    securityClass: 'EQUITY',
    heldAsOf: view.lastUpdated,
    identityState: 'RESOLVED',
    securityState: listing.state,
    quantities: {
      quantity: present(holding.quantity, rowSource),
      averageCost: present(holding.averageBuyPrice, rowSource),
      marketValue: present(holding.marketValue, rowSource),
      unrealisedGainPct,
    },
  });

  // ---- 8 previous head on the SAME chain (hysteresis + hard trigger), through the existing read ---------
  const dispositions = createDispositionRecordsService({ port: deps.port, owner: deps.owner });
  const previousHead = previousHeadOf(dispositions, view.portfolioId, securityId);
  const previous: PreviousDisposition | null =
    previousHead === null
      ? null
      : {
          verb: previousHead.payload.disposition.verb ?? 'WITHHELD',
          mosVsMidPct: null,
          weightPct: previousHead.payload.portfolioContext === null ? null : valueOrNull(previousHead.payload.portfolioContext.weightPct),
        };
  const hardTrigger = detectHardTrigger(previousHead?.payload ?? null, { ref: assessmentRef, issuerId, securityId });

  // ---- 9 the engine, unchanged -------------------------------------------------------------------------
  const engineInput: DispositionEngineInput = {
    subject,
    assessment: { payload: assessment, ref: assessmentRef },
    portfolio,
    limits,
    previous,
    hardTrigger: hardTrigger.hardTrigger,
    generatedAt,
  };
  const payload = buildDispositionPayload(engineInput);

  // The payload must carry the limits it was given — basis and exact policyVersion — or it is not recorded.
  if (payload.limits.basis !== limits.basis || payload.limits.policyVersion !== limits.policyVersion || payload.limits.digest !== limits.digest) {
    throw new HoldingDispositionFailure('DISPOSITION_INCONSISTENT', 'the built disposition does not carry the resolved limits', {
      given: { basis: limits.basis, policyVersion: limits.policyVersion },
      carried: { basis: payload.limits.basis, policyVersion: payload.limits.policyVersion },
    });
  }
  if (payload.subject.issuerId !== issuerId || payload.subject.securityId !== securityId || payload.companyAssessmentRef.reportId !== version.reportId) {
    throw new HoldingDispositionFailure('DISPOSITION_INCONSISTENT', 'the built disposition does not cite the holding identity and assessment it was given', {
      subject: { issuerId: payload.subject.issuerId, securityId: payload.subject.securityId },
      assessmentReportId: payload.companyAssessmentRef.reportId,
    });
  }

  // IID-4 chain rule (`stableDispositionParameters`): the limits policy version and basis are STABLE PARAMETERS of
  // the disposition chain, i.e. part of its `reportKey`. A head recorded under one policy cannot be superseded by a
  // version under another without changing the chain identity, which the artifact service refuses as scope drift.
  // Detected HERE, before any write, so the store is never asked to do something it must reject half-way.
  if (previousHead !== null) {
    const headParameters = stableDispositionParameters(previousHead.payload);
    const nextParameters = stableDispositionParameters(payload);
    const drifted = Object.keys({ ...headParameters, ...nextParameters }).filter(
      (key) => headParameters[key] !== nextParameters[key],
    );
    if (drifted.length > 0) {
      throw new HoldingDispositionFailure(
        'CHAIN_PARAMETERS_DRIFT',
        'the existing disposition chain was recorded under different stable parameters; appending would change the chain identity, so nothing is written',
        {
          scopeToken: holdingChainScope(view.portfolioId, securityId),
          headReportId: previousHead.version.reportId,
          drifted: drifted.map((key) => ({ parameter: key, head: headParameters[key] ?? null, next: nextParameters[key] ?? null })),
        },
      );
    }
  }

  const base = {
    schemaVersion: HOLDING_DISPOSITION_REPORT_SCHEMA,
    generatedAt,
    asOf,
    portfolio: {
      portfolioId: view.portfolioId,
      revision: view.revision,
      lastUpdated: view.lastUpdated,
      holdingsCount: view.holdings.length,
      activeHoldingsCount: view.holdings.filter((row) => row.active).length,
    },
    holding: {
      index,
      symbol: holding.symbol,
      isin: normalisedIsin(holding),
      exchange,
      sourceBroker: holding.sourceBroker,
      quantity: holding.quantity,
      averageBuyPrice: holding.averageBuyPrice,
      marketValue: holding.marketValue,
      weightPercentage: holding.weightPercentage,
      identityStatus: holding.identityStatus ?? null,
      resolutionDisposition: holding.resolutionDisposition ?? null,
    },
    identity: {
      state: identity.state,
      issuerId,
      securityId,
      listingId: identity.listingId,
      resolutionBasis: identity.resolutionBasis,
      securityState: listing.state,
      rosterDataClass: sources.rosterDataClass,
    },
    assessment: {
      scopeToken: assessmentScope,
      reportId: version.reportId,
      reportKey: version.reportKey,
      artifactVersion: version.artifactVersion,
      versionCount: chain.versions.length,
      generatedAt: version.generatedAt,
      adequacy: assessment.completeness.adequacy,
      qualityVerdict: assessment.quality.verdict,
      datasetClass,
      substantiveDigest: assessmentIdentity.substantiveDigest,
    },
    limits: {
      basis: limits.basis,
      policyVersion: limits.policyVersion,
      effectiveFrom: limits.effectiveFrom,
      singleNameMaxPct: limits.singleNameMaxPct,
      defaultSectorMaxPct: limits.defaultSectorMaxPct,
      source: loadedLimits.source,
      notes: limits.notes,
    },
    previous:
      previousHead === null
        ? null
        : {
            reportId: previousHead.version.reportId,
            artifactVersion: previousHead.version.artifactVersion,
            verb: previousHead.payload.disposition.verb,
          },
    hardTrigger,
    disposition: {
      scopeToken: holdingChainScope(view.portfolioId, securityId),
      subjectScope: payload.artifact.subjectScope,
      verb: payload.disposition.verb,
      withheld: payload.disposition.withheld,
      capsApplied: payload.disposition.capsApplied,
      limitsBasis: payload.limits.basis,
      limitsPolicyVersion: payload.limits.policyVersion,
    },
    payload,
  } as const;

  if (input.dryRun === true) {
    return { ...base, status: 'DRY_RUN', persistence: null };
  }

  // ---- 10 persistence through the one existing write path ------------------------------------------------
  let result: ReturnType<typeof dispositions.record>;
  try {
    result = dispositions.record(payload, {
      assessmentPayloadDigest: version.payloadDigest,
      assessmentInputDigest: version.inputDigest,
      assessmentSubstantiveDigest: assessmentIdentity.substantiveDigest,
      assessmentSubstantiveInputDigest: assessmentIdentity.substantiveInputDigest,
      generatedAt,
      datasetClass,
    });
  } catch (cause) {
    throw new HoldingDispositionFailure('PERSISTENCE_FAILED', 'the disposition could not be recorded; the store reports no write', {
      code: cause instanceof InvestmentArtifactError ? cause.code : null,
      message: cause instanceof Error ? cause.message : String(cause),
      storeMessage: innermostMessage(cause),
    }, { cause });
  }

  return {
    ...base,
    status: result.wrote ? 'RECORDED' : 'UNCHANGED',
    persistence: {
      outcome: result.outcome,
      wrote: result.wrote,
      reportKey: result.reportKey,
      headReportId: result.head.reportId,
      headArtifactVersion: result.head.artifactVersion,
      versionCount: result.chain.versionCount,
      writtenReportId: result.written?.reportId ?? null,
    },
  };
}
