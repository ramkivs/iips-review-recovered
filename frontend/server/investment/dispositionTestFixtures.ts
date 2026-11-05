/**
 * IID-4 — shared fixtures for the server-side disposition tests.
 *
 * Everything here is derived from the REAL M-1 assembly (`assembleAssessment` over the committed synthetic
 * datasets) and the REAL IID-4 engine. Nothing is a hand-written payload literal: a literal would keep passing
 * after the engine changed shape, which is the one thing these tests exist to catch.
 */
import type { CompanyAssessmentPayload } from '../../../iips-platform/src/investment/assessment/types';
import {
  buildDispositionPayload,
  heldSubject,
  candidateSubject,
  type DispositionEngineInput,
  type DispositionAssessmentRef,
  type HeldSubjectFacts,
  type CandidateSubjectFacts,
  type HoldingDispositionPayload,
} from '../../../iips-platform/src/investment/disposition/index';
import type { PortfolioFacts } from '../../../iips-platform/src/investment/disposition/gates';
import { resolveLimits } from '../../../iips-platform/src/investment/disposition/limits';
import { present } from '../../../iips-platform/src/investment/contracts/observation';
import type { G2HoldingView, G2PortfolioView } from '../user-portfolio/userPortfolioContract.js';
import type { M1Assembly } from './demo/m1Pipeline.js';

export const PORTFOLIO_ID = 'pf-iid4-service';
export const OTHER_PORTFOLIO_ID = 'pf-iid4-other';

export function assessmentPayloadOf(assembly: M1Assembly): CompanyAssessmentPayload {
  return JSON.parse(assembly.composed.content.canonicalPayload) as CompanyAssessmentPayload;
}

export function assessmentRefOf(
  assembly: M1Assembly,
  reportId: string,
  payload: CompanyAssessmentPayload,
  artifactVersion = 1,
): DispositionAssessmentRef {
  return {
    reportId,
    reportKey: assembly.composed.content.reportKey,
    artifactVersion,
    generatedAt: assembly.composed.content.generatedAt,
    adequacy: payload.completeness.adequacy,
    qualityVerdict: payload.quality.verdict,
    moatClassification: payload.moat.classification,
    datasetClass: assembly.datasetClass,
    datasetVersion: payload.data.datasetVersion,
    contentDigest: payload.data.contentDigest,
    dataAsOf: payload.asOf.dataAsOf,
    knownAsOf: payload.asOf.knownAsOf,
    modelVersion: payload.artifact.modelVersion,
    policyVersion: payload.artifact.policyVersion,
  };
}

export function holdingOf(securityId: string, overrides: Partial<G2HoldingView> = {}): G2HoldingView {
  return {
    symbol: 'AARAVSYN',
    companyId: 'company-aarav',
    isin: securityId,
    exchange: 'NSE',
    quantity: 1000,
    averageBuyPrice: 2400,
    currentPrice: 2640,
    marketValue: 2_640_000,
    weightPercentage: 40,
    active: true,
    sourceBroker: 'ZERODHA',
    lineageDigest: 'a'.repeat(64),
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    ...overrides,
  };
}

export function portfolioView(holdings: readonly G2HoldingView[], revision = 7): G2PortfolioView {
  const totalMarketValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  return {
    portfolioId: PORTFOLIO_ID,
    portfolioName: 'IID-4 fixture portfolio',
    revision,
    holdings,
    totalMarketValue,
    totalHoldingsCount: holdings.length,
    weightSumPercentage: Math.round(holdings.reduce((sum, h) => sum + h.weightPercentage, 0) * 100) / 100,
    lastUpdated: '2026-11-06T05:00:00.000Z',
    provenanceDigest: 'b'.repeat(64),
    isSaved: true,
    contributions: [],
  };
}

export function heldSubjectOf(
  payload: CompanyAssessmentPayload,
  securityId: string,
  portfolioId = PORTFOLIO_ID,
): HeldSubjectFacts {
  return heldSubject({
    portfolioId,
    securityId,
    issuerId: payload.subject.issuerId,
    symbol: payload.subject.legalName.slice(0, 12).toUpperCase(),
    exchange: 'NSE',
    securityClass: 'EQUITY',
    heldAsOf: '2026-11-06T05:00:00.000Z',
    identityState: 'RESOLVED',
    securityState: 'ACTIVE',
    quantities: {
      quantity: present(1000, { kind: 'OPERATOR_ENTRY', ref: 'portfolio-snapshot', locator: 'row:1' }),
      averageCost: present(2400, { kind: 'OPERATOR_ENTRY', ref: 'portfolio-snapshot', locator: 'row:1' }),
      marketValue: present(2_640_000, { kind: 'DATASET', ref: 'user-portfolio:view' }),
      unrealisedGainPct: present(10, { kind: 'DERIVED', ref: 'snapshot/unrealised' }),
    },
  });
}

export function candidateSubjectOf(
  payload: CompanyAssessmentPayload,
  securityId: string,
  contextPortfolioId: string | null = PORTFOLIO_ID,
): CandidateSubjectFacts {
  return candidateSubject({
    issuerId: payload.subject.issuerId,
    securityId,
    contextPortfolioId,
    origin: 'WATCHLIST',
    symbol: payload.subject.legalName.slice(0, 12).toUpperCase(),
    exchange: 'NSE',
    securityClass: 'EQUITY',
    identityState: 'RESOLVED',
    securityState: 'ACTIVE',
  });
}

export function portfolioFactsFor(overrides: Partial<PortfolioFacts> = {}): PortfolioFacts {
  return {
    present: true,
    weightPct: 40,
    companyExposurePct: 40,
    sectorExposurePct: 40,
    topHoldingWeightPct: 40,
    ...overrides,
  };
}

export function defaultLimits() {
  return resolveLimits({ policy: null, asOf: '2026-11-06T06:00:00.000Z' });
}

export function buildPayload(input: {
  payload: CompanyAssessmentPayload;
  assembly: M1Assembly;
  reportId: string;
  securityId: string;
  artifactVersion?: number;
  subject?: HeldSubjectFacts | CandidateSubjectFacts;
  portfolioFacts?: PortfolioFacts | null;
  generatedAt?: string;
}): HoldingDispositionPayload {
  const subject = input.subject ?? heldSubjectOf(input.payload, input.securityId);
  const engineInput: DispositionEngineInput = {
    subject,
    assessment: {
      payload: input.payload,
      ref: assessmentRefOf(input.assembly, input.reportId, input.payload, input.artifactVersion ?? 1),
    },
    portfolio:
      input.portfolioFacts === null
        ? null
        : {
            block: {
              portfolioRevision: 7,
              asOf: '2026-11-06T05:00:00.000Z',
              holdingsMeasured: 1,
              holdingsUnresolved: 0,
              holdingsOutOfScope: 0,
              measuredWeightPct: 40,
              unmeasuredWeightPct: present(60, { kind: 'DERIVED', ref: 'fixture' }),
              weightPct: present(40, { kind: 'DATASET', ref: 'user-portfolio:view' }),
              companyExposurePct: present(40, { kind: 'DATASET', ref: 'user-portfolio:view' }),
              sectorExposurePct: present(40, { kind: 'DATASET', ref: 'user-portfolio:view' }),
              sectorMeasuredWeightPct: present(40, { kind: 'DERIVED', ref: 'fixture' }),
              topHoldingWeightPct: present(40, { kind: 'DERIVED', ref: 'fixture' }),
              concentrationBand: present('High', { kind: 'DERIVED', ref: 'fixture' }),
              countBasedSectorExposure: { Technology: 100 },
              countBasedConcentrationPct: 100,
              diversificationBand: null,
              correlationFlags: [],
              sectorReferenceContext: {
                evidenceClass: 'SECTOR_REFERENCE',
                sector: (input.payload.subject.sector ?? null) as never,
                normalizedHolding: null,
                note: 'fixture',
              },
              notes: ['fixture'],
            },
            facts: input.portfolioFacts ?? portfolioFactsFor(),
          },
    limits: defaultLimits(),
    generatedAt: input.generatedAt ?? '2026-11-06T06:00:00.000Z',
    limitations: ['L-001', 'L-009'],
  };
  return buildDispositionPayload(engineInput);
}
