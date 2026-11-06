/**
 * IID-4 — the disposition RECORDS service.
 *
 * A thin arrangement over the existing IID-3 artifact service, not a second persistence mechanism. Recording a
 * disposition goes through `recordDisposition`, which is `recordAssessment`'s write path with a different
 * closed set of admissible scope kinds; reading goes through the same chain reads, so integrity validation,
 * bounded scanning and the read-back verification are shared rather than re-implemented.
 *
 * TWO INDEPENDENT CHAINS PER ISSUER. A held position's dispositions live on `hd:<portfolio>/<security>` and a
 * candidate's on `hc:<ctx|none>/<security>`. They never share a chain: the scope token is what NP-04 derives
 * `reportKey` from, and R-8 makes the subject — not the issuer — the chain subject. That is also why a
 * candidate cannot "graduate" into a holding by appending: it becomes a holding by getting a position chain.
 *
 * WHAT THIS MODULE DOES NOT DO. It does not write to IPD, open a store, construct a governance object, or hold
 * any state. Every call is one operation against the injected port.
 */
import type { HoldingDispositionPayload } from '../../../iips-platform/src/investment/disposition/types';
import {
  candidateChainScope,
  holdingChainScope,
} from '../../../iips-platform/src/investment/disposition/subject';
import {
  LimitsPolicyError,
  parseLimitsPolicyText,
  resolveLimits,
} from '../../../iips-platform/src/investment/disposition/limits';
import type { ResolvedLimits } from '../../../iips-platform/src/investment/disposition/types';
import {
  DISPOSITION_REPORT_TYPE,
  composeDispositionArtifact,
  dispositionInputDigest,
  dispositionInputMembers,
  dispositionPayloadDigest,
  type ComposedDisposition,
  type DatasetClass,
} from './dispositionComposition.js';
import {
  createInvestmentArtifactService,
  InvestmentArtifactError,
  type InvestmentChainView,
  type InvestmentVersionView,
  type RecordResult,
} from './investmentArtifacts.js';

export interface DispositionServiceOptions {
  /** The authorized NP-04 boundary. Validated by the artifact service; nothing is constructed from it. */
  readonly port: unknown;
  readonly owner: { readonly tenantId: string; readonly userId: string };
  /** Resolved limits policy. Defaults to the system defaults, which say so in their own provenance. */
  readonly limits?: ResolvedLimits;
}

export interface DispositionReadResult {
  readonly chain: InvestmentChainView;
  readonly version: InvestmentVersionView;
  readonly payload: HoldingDispositionPayload;
}

export interface DispositionListEntry {
  readonly portfolioId: string;
  readonly securityId: string;
  readonly scopeToken: string;
  readonly reportKey: string;
  readonly chainRootReportId: string;
  readonly versionCount: number;
  readonly headReportId: string;
  readonly artifactVersion: number;
  readonly generatedAt: string;
  readonly verb: string | null;
  /**
   * IID-6 read-model extension: the facts a portfolio surface needs to answer "what does this holding say?"
   * without a second request per row. Read from the SAME head payload `verb` already required, so the list
   * costs exactly what it cost before. Nulls mean "the head payload could not be read", and render as
   * not available — never as a verb or a zero confidence.
   */
  readonly confidence: number | null;
  readonly horizon: string | null;
  readonly withheld: boolean | null;
  readonly issuerId: string | null;
}

export interface DispositionRecordsService {
  record(
    payload: HoldingDispositionPayload,
    context: {
      readonly assessmentPayloadDigest: string;
      readonly assessmentInputDigest: string;
      /**
       * IID-5 / O-5: the assessment's clock-free identity. Required at the composition boundary, because it is
       * what the disposition input identity must cite; without it the tainted engine digest would propagate again.
       */
      readonly assessmentSubstantiveDigest: string;
      readonly assessmentSubstantiveInputDigest: string;
      readonly generatedAt: string;
      readonly datasetClass?: DatasetClass;
    },
  ): RecordResult & { readonly composed: ComposedDisposition };
  readHolding(portfolioId: string, securityId: string): DispositionReadResult;
  readCandidate(contextPortfolioId: string | null, securityId: string): DispositionReadResult;
  listPortfolio(portfolioId: string): readonly DispositionListEntry[];
}

/**
 * Resolve the limits policy from operator text.
 *
 * Fail-closed: unreadable operator policy is an ERROR (`policy_inputs_unavailable`), never a silent fallback to
 * the defaults. A disposition computed against the wrong caps is worse than no disposition, because the caps
 * are what make ACCUMULATE and INITIATE safe.
 */
export function resolveDispositionLimits(input: {
  readonly policyText: string | null | undefined;
  readonly asOf: string;
}): ResolvedLimits {
  const text = input.policyText;
  if (text === null || text === undefined || text.trim().length === 0) {
    return resolveLimits({ policy: null, asOf: input.asOf });
  }
  let document;
  try {
    document = parseLimitsPolicyText(text);
  } catch (cause) {
    if (cause instanceof LimitsPolicyError) throw cause;
    throw new LimitsPolicyError('operator limits policy could not be parsed', 'NOT_AN_OBJECT', {});
  }
  return resolveLimits({ policy: document, asOf: input.asOf });
}

function parsePayload(payloadText: string): HoldingDispositionPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadText);
  } catch (cause) {
    throw new InvestmentArtifactError('CHAIN_INVALID', 'stored disposition payload is not JSON', {}, { cause });
  }
  const payload = parsed as HoldingDispositionPayload;
  if (payload === null || typeof payload !== 'object' || payload.artifact?.kind !== 'HoldingDisposition') {
    throw new InvestmentArtifactError('CHAIN_INVALID', 'stored artifact is not a HoldingDisposition');
  }
  // Integrity was already proven upstream: `readVersionWithPayload` recomputes the stored payload digest and
  // compares it with provenance before returning, and the whole chain is revalidated on every read. What is
  // checked here is only that the bytes ARE a disposition — a chain that validated structurally can still hold
  // another report type's payload if a write went wrong, and that must not be served as a disposition.
  if (payload.interpretation?.noExecutionPath !== true) {
    throw new InvestmentArtifactError('CHAIN_INVALID', 'stored disposition does not carry its no-execution-path interpretation');
  }
  return payload;
}

export function createDispositionRecordsService(options: DispositionServiceOptions): DispositionRecordsService {
  const artifacts = createInvestmentArtifactService({ port: options.port, owner: options.owner });

  /**
   * The head facts of one chain, or nulls when the head payload cannot be read.
   *
   * A list is a discovery surface: one unreadable chain must not hide the rest of the portfolio. The entry stays
   * in the list and its fields are null, which the UI renders as `not available — <reason>` rather than as a
   * verb inferred from anything else.
   */
  const headFacts = (
    scopeToken: string,
  ): {
    readonly verb: string | null;
    readonly confidence: number | null;
    readonly horizon: string | null;
    readonly withheld: boolean | null;
    readonly issuerId: string | null;
  } => {
    try {
      const { payload } = read(scopeToken);
      return {
        verb: payload.disposition.verb,
        confidence: payload.disposition.confidence,
        horizon: payload.disposition.horizon,
        withheld: payload.disposition.withheld !== null && payload.disposition.withheld !== undefined,
        issuerId: payload.subject.issuerId,
      };
    } catch {
      return { verb: null, confidence: null, horizon: null, withheld: null, issuerId: null };
    }
  };

  const read = (scopeToken: string): DispositionReadResult => {
    const chain = artifacts.readChain(scopeToken, DISPOSITION_REPORT_TYPE);
    const { version, payload } = artifacts.readVersionWithPayload(
      scopeToken,
      chain.head.reportId,
      DISPOSITION_REPORT_TYPE,
    );
    return { chain, version, payload: parsePayload(payload) };
  };

  return {
    record(payload, context) {
      const members = dispositionInputMembers({
        payload,
        assessmentPayloadDigest: context.assessmentPayloadDigest,
        assessmentInputDigest: context.assessmentInputDigest,
      });
      const composed = composeDispositionArtifact({
        payload,
        inputDigest: dispositionInputDigest(members),
        generatedAt: context.generatedAt,
        assessmentSubstantiveDigest: context.assessmentSubstantiveDigest,
        assessmentSubstantiveInputDigest: context.assessmentSubstantiveInputDigest,
        ...(context.datasetClass === undefined ? {} : { datasetClass: context.datasetClass }),
      });
      const result = artifacts.recordDisposition(composed);
      return { ...result, composed };
    },

    readHolding(portfolioId, securityId) {
      return read(holdingChainScope(portfolioId, securityId));
    },

    readCandidate(contextPortfolioId, securityId) {
      return read(candidateChainScope(contextPortfolioId, securityId));
    },

    listPortfolio(portfolioId) {
      const prefix = `hd:${portfolioId.trim()}/`;
      return artifacts
        .inventory(DISPOSITION_REPORT_TYPE)
        .filter((entry) => entry.scopeToken.startsWith(prefix))
        .map((entry) => ({
          portfolioId: portfolioId.trim(),
          securityId: entry.scopeToken.slice(prefix.length),
          scopeToken: entry.scopeToken,
          reportKey: entry.reportKey,
          chainRootReportId: entry.headReportId,
          versionCount: entry.versionCount,
          headReportId: entry.headReportId,
          artifactVersion: entry.headArtifactVersion,
          generatedAt: entry.generatedAt,
          ...headFacts(entry.scopeToken),
        }));
    },
  };
}
