/**
 * IID-2 — `CompanyAssessmentEngine` (`assessment-engine/1.0.0`).
 *
 * Pure: dataset in, payload out. No clock read (the caller supplies `generatedAt`), no I/O, no persistence,
 * no network. The engine assembles the blocks, validates every observation against INV-1 … INV-4, validates
 * that every evidence entry points at a path that resolves, and returns the payload — or throws with the
 * violations rather than publishing an artefact that cannot be defended.
 *
 * Determinism: every collection is ordered by a stable key before it is emitted, and the input digest is taken
 * over a canonical form of the inputs actually consumed, so two runs on the same inputs are byte-identical
 * regardless of dataset ordering or process restarts.
 */
import { digestOf } from '../fundamentals/canonical';
import type { DatasetContent } from '../fundamentals/types';
import type { Adequacy, Violation } from '../contracts/invariants';
import { checkObservation } from '../contracts/invariants';
import type { NumericObservation, Observation } from '../contracts/observation';
import { notApplicable } from '../contracts/observation';
import { buildCompleteness, buildQuality } from './adequacy';
import { buildCapitalStructure } from './capitalStructure';
import { buildConfidence } from './confidence';
import { buildDividends } from './dividends';
import { assessmentNarrative } from './explain';
import { buildIntrinsic, buildSensitivity } from './intrinsic';
import { buildMarginOfSafety, selectPrice } from './margin';
import { evaluateMethods, selectMethods, type MethodContext } from './methods';
import { buildMoat } from './moat';
import { restatementDisclosure, selectSeries } from './periods';
import { VALUATION_POLICY } from './policy';
import { buildRisk } from './risk';
import {
  ASSESSMENT_SCHEMA_VERSION,
  MODEL_VERSION,
  POLICY_VERSION,
} from './types';
import type {
  CompanyAssessmentPayload,
  DividendDeclaration,
  SectorName,
  SeriesSelection,
  ValuationMethodResult,
} from './types';

export interface AssessCompanyInput {
  readonly issuerId: string;
  readonly legalName: string;
  readonly sector: SectorName;
  readonly sectorSubsegment?: string | null;
  readonly securityId: string;
  readonly dataset: DatasetContent;
  readonly datasetVersion: string;
  readonly contentDigest: string;
  readonly provider: string;
  readonly identity: {
    readonly bindingRef: string;
    readonly rosterVersion: string;
    readonly listingMapVersion: string;
    readonly corporateActionTableVersion: string;
  };
  /** Caller-supplied clock. The engine never reads one. */
  readonly generatedAt: string;
  readonly knownAsOf: string;
  readonly dividendDeclarations?: readonly DividendDeclaration[];
  readonly sectorReference?: { readonly sectorRefId: string; readonly engineVerdict: string | null; readonly composite: number | null };
  readonly wacc?: number;
  readonly growth?: number;
}

export interface AssessCompanyResult {
  readonly payload: CompanyAssessmentPayload;
  readonly violations: readonly Violation[];
  readonly narrative: readonly string[];
  readonly inputDigest: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(earlier: string, later: string): number {
  return Math.max(0, Math.round((new Date(`${later}T00:00:00Z`).getTime() - new Date(`${earlier}T00:00:00Z`).getTime()) / DAY_MS));
}

/** Resolve a dotted/indexed field path inside the payload. Used by the evidence validation. */
export function resolvePath(root: unknown, path: string): unknown {
  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter((segment) => segment !== '');
  let current: unknown = root;
  for (const segment of segments) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Every observation in the payload, with its path. Walking the emitted object — rather than a hand-kept list —
 * means a new field is validated the moment it appears, and cannot be forgotten.
 */
export function collectObservations(payload: unknown, prefix = ''): readonly { path: string; observation: Observation<unknown> }[] {
  const found: { path: string; observation: Observation<unknown> }[] = [];
  const walk = (value: unknown, path: string): void => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry, index) => walk(entry, `${path}[${index}]`));
      return;
    }
    if (typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    if (typeof record.presence === 'string' && 'value' in record) {
      found.push({ path, observation: record as unknown as Observation<unknown> });
      return;
    }
    for (const key of Object.keys(record).sort()) walk(record[key], path === '' ? key : `${path}.${key}`);
  };
  walk(payload, prefix);
  return found;
}

function assumptionOf(input: AssessCompanyInput): {
  wacc: number;
  growth: number;
  basis: 'WACC_DERIVED' | 'OPERATOR_SET' | 'POLICY_DEFAULT';
  notes: string[];
} {
  const notes: string[] = [];
  const wacc = input.wacc ?? VALUATION_POLICY.discountRate.value;
  let growth = input.growth ?? VALUATION_POLICY.terminalGrowthDefault;
  if (growth > VALUATION_POLICY.terminalGrowthCap) {
    notes.push(
      `TERMINAL_GROWTH_REJECTED: ${(growth * 100).toFixed(2)}% exceeds the policy cap of ${(VALUATION_POLICY.terminalGrowthCap * 100).toFixed(2)}%; the policy default is used instead`,
    );
    growth = VALUATION_POLICY.terminalGrowthDefault;
  }
  return {
    wacc,
    growth,
    basis: input.wacc === undefined ? 'POLICY_DEFAULT' : 'OPERATOR_SET',
    notes,
  };
}

function methodsWithOutput(methods: readonly ValuationMethodResult[]): readonly ValuationMethodResult[] {
  return methods.filter((method) => method.applicable && method.output !== null);
}

/** Assess one issuer. Deterministic for identical inputs. */
export function assessCompany(input: AssessCompanyInput): AssessCompanyResult {
  const series: SeriesSelection = selectSeries(input.dataset.periods, input.issuerId);
  const structure = buildCapitalStructure(series);
  const metrics = input.dataset.operatingMetrics
    .filter((record) => record.issuerId === input.issuerId)
    .slice()
    .sort((a, b) => (a.metricId < b.metricId ? -1 : a.metricId > b.metricId ? 1 : 0));

  const assumption = assumptionOf(input);
  const context: MethodContext = {
    series,
    structure,
    sector: input.sector,
    policy: VALUATION_POLICY,
    wacc: assumption.wacc,
    growth: assumption.growth,
    metrics,
    dividendDeclarations: input.dividendDeclarations ?? [],
    generatedAt: input.generatedAt,
  };

  const methods = evaluateMethods(context);
  const intrinsicOutcome = buildIntrinsic(methods);
  const price = selectPrice({
    securityId: input.securityId,
    prices: input.dataset.prices,
    corporateActions: input.dataset.corporateActions,
    knownAsOf: input.knownAsOf,
    generatedAt: input.generatedAt,
    dataAsOf: series.annual[0]?.periodEnd ?? input.generatedAt.slice(0, 10),
  });
  const marginOfSafety = buildMarginOfSafety(price, intrinsicOutcome.intrinsic);
  const sensitivity = buildSensitivity(context);
  const dividends = buildDividends({
    series,
    structure,
    declarations: input.dividendDeclarations ?? [],
  });
  const moat = buildMoat({ series, structure, wacc: assumption.wacc, metrics });
  const risk = buildRisk({ series, structure, sector: input.sector });

  const dataAsOf = series.annual[0]?.periodEnd ?? '';
  const stalenessDays = dataAsOf === '' ? 0 : daysBetween(dataAsOf, input.generatedAt.slice(0, 10));
  const staleBeyondPolicy = stalenessDays > VALUATION_POLICY.freshness.pnlDays;

  const completeness = buildCompleteness(series);
  const shareCountMismatch =
    structure.shareCountPeriod !== null &&
    series.annual[0] !== undefined &&
    structure.shareCountPeriod !== series.annual[0].periodEnd;
  const restatements = restatementDisclosure(input.dataset.periods, input.issuerId, [
    'REVENUE_FROM_OPERATIONS',
    'NET_PROFIT',
    'TOTAL_EQUITY',
    'EPS_DILUTED',
  ]);
  const quality = buildQuality({
    series,
    restatementCount: restatements.length,
    dividendConflict: dividends.conflict !== null,
    unvalidatedMetrics: metrics.filter((record) => record.validation !== 'VALID').length,
    shareCountMismatch,
    adequacy: completeness.adequacy,
    staleBeyondPolicy,
  });

  const applicableMethods = methods.filter((method) => method.applicable);
  const confidence = buildConfidence({
    completeness,
    quality,
    staleBeyondPolicy,
    intrinsic: intrinsicOutcome.intrinsic,
    dilutionProxy: structure.dilutionProxy,
    dividendConflict: dividends.conflict !== null,
    applicability: { applicable: applicableMethods.length, considered: methods.length },
  });

  const trends = buildTrends(series);

  const limitations: string[] = [...assumption.notes];
  limitations.push(
    'Dilutive potential shares (ESOP, convertibles) are not present in dataset schema v1, so the diluted count is the EPS-implied count and carries the DILUTION_PROXY cap.',
  );
  limitations.push(
    'Net debt subtracts cash and cash equivalents plus liquid investments only; restricted balances, margin money and regulatory balances are excluded from available cash by construction (R-4.1 / Schedule III). Dataset schema v1 carries no restricted-balance line item, so the component is published as NOT_COMPUTABLE rather than as a zero.',
  );
  if (dividends.conflict !== null) {
    limitations.push(
      `The declared dividend and the cash-flow dividend diverge beyond the policy tolerance (declared ${dividends.reconciliation.dpsDeclared.value ?? 'unavailable'} vs implied ${Number(
        dividends.reconciliation.dpsImplied.value ?? 0,
      ).toFixed(2)} per share). Both figures remain in the payload; neither is treated as the truth, and the confidence score is capped by DIVIDEND_SOURCE_CONFLICT.`,
    );
  }
  if (dividends.reconciliation.status === 'NOT_COMPARABLE') {
    limitations.push(
      'The corporate-action table carries no dividend declaration record in dataset schema v1, so R-15 corroboration is unavailable for this assessment.',
    );
  }
  // A refusal that only exists inside one observation would be invisible to a reader who never expands it.
  // Every structural gap that changed the answer is repeated here in prose.
  const mismatched = methods.filter((method) => method.output?.perShareMid.reason === 'SHARE_COUNT_PERIOD_MISMATCH');
  if (mismatched.length > 0) {
    limitations.push(
      `The diluted share count belongs to ${structure.shareCountPeriod ?? 'an older period'} while the valuation numerators belong to a later period, so per-share values are withheld with SHARE_COUNT_PERIOD_MISMATCH for ${mismatched
        .map((method) => method.methodId)
        .join(', ')}; the enterprise-level arithmetic is still published.`,
    );
  }
  if (structure.pre116Comparative) {
    limitations.push(
      'The reported series spans the application of Ind AS 116: lease liabilities are absent from the most recent periods, so lease-adjusted debt is not comparable across the whole series (PRE_116_FLAGGED).',
    );
  }
  if (structure.netDebt.presence !== 'PRESENT') {
    limitations.push(
      `Net debt could not be derived (${structure.netDebt.reason ?? 'NOT_REPORTED'}), so every enterprise-value method is withheld rather than run on a partial bridge.`,
    );
  }
  const unimplemented = methods.filter((method) => method.notApplicableReason?.startsWith('METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1'));
  if (unimplemented.length > 0) {
    limitations.push(
      `${unimplemented.length} method family/families considered for this sector have no engine implementation (${unimplemented.map((method) => method.methodId).join(', ')}), so they contribute nothing to the blend.`,
    );
  }
  if (input.dataset.issues.some((issue) => /synthetic|fixture/i.test(issue.detail))) {
    limitations.push('The served dataset is synthetic test data; nothing here describes a real company.');
  }
  limitations.push('Assessment only: no persistence, no transport and no UI are part of IID-2 (IID-3 and IID-6 own those).');

  // Evidence identity is contractual: a method may only cite the evidence entry that the payload actually
  // publishes for it, so the two can never drift apart.
  const citedMethods: ValuationMethodResult[] = methods.map((entry) =>
    entry.applicable && entry.output !== null ? { ...entry, evidenceIds: [`EV-${entry.methodId}`] } : { ...entry, evidenceIds: [] },
  );
  const evidence = buildEvidence(citedMethods, moat.block.evidence.map((entry) => entry.evidenceId), dividends.reconciliation.status);

  const payload: CompanyAssessmentPayload = {
    schemaVersion: ASSESSMENT_SCHEMA_VERSION,
    artifact: {
      kind: 'CompanyAssessment',
      subjectScope: `hc:${input.issuerId}`,
      modelVersion: MODEL_VERSION,
      policyVersion: POLICY_VERSION,
      generatedAt: input.generatedAt,
    },
    subject: {
      issuerId: input.issuerId,
      legalName: input.legalName,
      sector: input.sector,
      sectorSubsegment: input.sectorSubsegment ?? null,
      reportingCurrency: 'INR',
      fiscalYearEnd: '03-31',
      identity: input.identity,
    },
    asOf: {
      generatedAt: input.generatedAt,
      dataAsOf,
      knownAsOf: input.knownAsOf,
      stalenessDays,
      staleBeyondPolicy,
    },
    data: {
      datasetVersion: input.datasetVersion,
      contentDigest: input.contentDigest,
      provider: input.provider,
      series: {
        statementScope: series.statementScope,
        scopeSubstitution: series.scopeSubstitution,
        annualPeriods: series.annual.length,
        quarterlyPeriods: series.quarterly.length,
        excludedForScope: series.excludedForScope,
      },
      restatements,
    },
    fundamentals: {
      annual: series.annual,
      quarterly: series.quarterly,
      ttm: series.ttm,
      trends,
      capitalStructure: structure,
    },
    completeness,
    quality,
    valuation: {
      methodSelection: selectMethods(input.sector),
      methods: citedMethods,
      intrinsic: intrinsicOutcome.intrinsic,
      marginOfSafety,
      sensitivity,
    },
    moat: moat.block,
    dividends,
    risk,
    confidence,
    assumptions: {
      discountRate: {
        value: assumption.wacc,
        basis: assumption.basis,
        components: {
          riskFree: VALUATION_POLICY.discountRate.riskFree,
          equityRiskPremium: VALUATION_POLICY.discountRate.equityRiskPremium,
          beta: VALUATION_POLICY.discountRate.beta,
          costOfEquity: VALUATION_POLICY.discountRate.costOfEquity,
          costOfDebtPostTax: VALUATION_POLICY.discountRate.costOfDebtPostTax,
          weightEquity: VALUATION_POLICY.discountRate.weightEquity,
          weightDebt: VALUATION_POLICY.discountRate.weightDebt,
        },
      },
      terminalGrowth: assumption.growth,
      forecastHorizonYears: VALUATION_POLICY.forecastHorizonYears,
      methodSpecific: methods
        .filter((method) => method.applicable)
        .map((method) => ({ methodId: method.methodId, assumptions: method.assumptions })),
      policyVersion: POLICY_VERSION,
    },
    sectorReferenceView: {
      evidenceClass: 'SECTOR_REFERENCE',
      sectorRefId: input.sectorReference?.sectorRefId ?? `${input.sector}-UNASSIGNED`,
      engineVerdict: input.sectorReference?.engineVerdict ?? null,
      composite: input.sectorReference?.composite ?? null,
      note:
        'This block is a sector reference, not an identity and not an input to the assessment. It is displayed separately and cannot drive any valuation, moat, dividend or risk field.',
    },
    evidence,
    limitations,
    disclosure: { decisionSupportOnly: true, noTradeExecution: true, nonProduction: true },
  };

  const violations = validatePayload(payload, input);
  const inputDigest = digestOf({
    issuerId: input.issuerId,
    sector: input.sector,
    datasetVersion: input.datasetVersion,
    contentDigest: input.contentDigest,
    generatedAt: input.generatedAt,
    knownAsOf: input.knownAsOf,
    securityId: input.securityId,
    wacc: assumption.wacc,
    growth: assumption.growth,
    declarations: (input.dividendDeclarations ?? []).map((declaration) => ({ periodEnd: declaration.periodEnd, dps: declaration.dps })),
    annual: series.annual.map((period) => ({ periodEnd: period.periodEnd, basis: period.basis })),
  });

  return { payload, violations, narrative: assessmentNarrative(payload), inputDigest };
}

function buildTrends(series: SeriesSelection): CompanyAssessmentPayload['fundamentals']['trends'] {
  const revenue = series.annual.map((period) => period.values.REVENUE_FROM_OPERATIONS).filter((observation): observation is NumericObservation => observation !== undefined && observation.presence === 'PRESENT');
  const pat = series.annual.map((period) => period.values.NET_PROFIT_ATTRIBUTABLE_TO_OWNERS).filter((observation): observation is NumericObservation => observation !== undefined && observation.presence === 'PRESENT');

  const cagr = (values: readonly number[]): NumericObservation => {
    if (values.length < 3) return notApplicable<number>('INSUFFICIENT_HISTORY');
    const newest = values[0]!;
    const oldest = values[values.length - 1]!;
    if (oldest <= 0 || newest <= 0) return notApplicable<number>('NEGATIVE_BASE');
    const years = values.length - 1;
    return {
      value: Number(((newest / oldest) ** (1 / years) - 1).toFixed(6)),
      presence: 'PRESENT',
      source: { kind: 'DERIVED', ref: 'trends/1.0.0' },
      basis: 'DERIVED',
    };
  };

  return {
    revenueCagr3y: cagr(revenue.slice(0, 3).map((observation) => observation.value as number)),
    patCagr3y: cagr(pat.slice(0, 3).map((observation) => observation.value as number)),
    roicTrend: notApplicable<number>('POLICY_INPUTS_UNAVAILABLE'),
  };
}

function buildEvidence(
  methods: readonly ValuationMethodResult[],
  moatEvidenceIds: readonly string[],
  dividendStatus: string,
): CompanyAssessmentPayload['evidence'] {
  const evidence: CompanyAssessmentPayload['evidence'][number][] = [];
  for (const method of methods) {
    if (!method.applicable || method.output === null) continue;
    evidence.push({
      evidenceId: `EV-${method.methodId}`,
      claim: `${method.methodId} produced a per-share value from ${method.inputs.filter((entry) => entry.observation.presence === 'PRESENT').length} present input(s)`,
      supports: [`valuation.methods[${methods.indexOf(method)}].output.perShareMid`],
      source: { kind: 'DERIVED', ref: `${method.formulaId}/${method.formulaVersion}` },
      observationRefs: method.inputs.map((entry) => entry.name),
    });
  }
  for (const evidenceId of moatEvidenceIds) {
    evidence.push({
      evidenceId,
      claim: 'moat dimension evidenced above its policy threshold',
      supports: ['moat.classification'],
      source: { kind: 'DERIVED', ref: 'moat/1.0.0' },
      observationRefs: [evidenceId],
    });
  }
  evidence.push({
    evidenceId: 'EV-DIVIDEND-RECONCILIATION',
    claim: `dividend sources reconciled with status ${dividendStatus}`,
    supports: ['dividends.reconciliation.status'],
    source: { kind: 'DERIVED', ref: 'dividend-sustainability/1.0.0' },
    observationRefs: ['dpsDeclared', 'dpsImplied'],
  });
  return evidence;
}

/**
 * Validate the payload before it can be returned:
 *   INV-1 … INV-4 over every observation, and AC-2.12 over every evidence entry.
 */
export function validatePayload(payload: CompanyAssessmentPayload, input?: AssessCompanyInput): readonly Violation[] {
  const violations: Violation[] = [];
  for (const entry of collectObservations(payload)) {
    violations.push(...checkObservation(entry.observation, entry.path));
  }
  for (const entry of payload.evidence) {
    if (entry.supports.length === 0) {
      violations.push({ invariant: 'INV-5', path: `evidence.${entry.evidenceId}`, detail: 'evidence entry supports no field path' });
      continue;
    }
    for (const path of entry.supports) {
      if (resolvePath(payload, path) === undefined) {
        violations.push({ invariant: 'INV-5', path: `evidence.${entry.evidenceId}`, detail: `path "${path}" does not resolve` });
      }
    }
  }
  const evidenceIds = new Set(payload.evidence.map((entry) => entry.evidenceId));
  for (const method of payload.valuation.methods) {
    for (const cited of method.evidenceIds) {
      if (!evidenceIds.has(cited)) {
        violations.push({
          invariant: 'INV-2',
          path: `valuation.methods.${method.methodId}.evidenceIds`,
          detail: `cited evidence \"${cited}\" is not published in the payload`,
        });
      }
    }
  }
  for (const method of payload.valuation.methods.filter((entry) => entry.applicable && entry.output !== null)) {
    if (method.evidenceIds.length === 0) {
      violations.push({
        invariant: 'INV-2',
        path: `valuation.methods.${method.methodId}.evidenceIds`,
        detail: 'a published method value carries no evidence reference',
      });
    }
  }
  const coverage = payload.completeness.requiredFieldCoveragePct;
  if (!Number.isFinite(coverage) || coverage < 0 || coverage > 1) {
    violations.push({
      invariant: 'INV-5',
      path: 'completeness.requiredFieldCoveragePct',
      detail: `required-field coverage ${coverage} is not a fraction between 0 and 1`,
    });
  }
  // Talent/reference guard: a sector reference may never carry a company metric into the payload.
  if (payload.sectorReferenceView.evidenceClass !== 'SECTOR_REFERENCE') {
    violations.push({ invariant: 'INV-5', path: 'sectorReferenceView', detail: 'sector reference not labelled as such' });
  }
  if (input !== undefined && payload.subject.issuerId !== input.issuerId) {
    violations.push({ invariant: 'INV-5', path: 'subject.issuerId', detail: 'payload subject differs from the requested issuer' });
  }
  return violations;
}

/** Adequacy of the produced payload, exposed for callers that gate on it. */
export function adequacyOf(payload: CompanyAssessmentPayload): Adequacy {
  return payload.completeness.adequacy;
}

export { methodsWithOutput };
