/**
 * IID-6 test fixtures.
 *
 * These are SANITIZED SYNTHETIC payloads shaped exactly like the read models the server sends (they were copied from
 * a recorded run of the M1 fixtures and trimmed), so the surface tests exercise rendering rather than fetch plumbing.
 * No fixture here is a claim about a real issuer: the assessment subject says so, and L-004/L-009 apply.
 */
export const ISSUER = 'IN:EQISIN:IN0000000201';
export const SECURITY = 'IN:ISIN:IN0000000201';
export const PORTFOLIO = 'pf-iid6-demo';

function obs(value: number | null, reason?: string) {
  return value === null
    ? { value: null, presence: 'MISSING' as const, ...(reason === undefined ? {} : { reason }) }
    : { value, presence: 'PRESENT' as const };
}

export function version(reportId: string, artifactVersion: number, overrides: Record<string, unknown> = {}) {
  return {
    reportId,
    artifactVersion,
    supersedesReportId: artifactVersion === 1 ? null : 'r-1',
    generatedAt: `2026-11-0${artifactVersion}T00:00:00.000Z`,
    reportKey: 'a'.repeat(64),
    payloadDigest: `${artifactVersion}`.repeat(64).slice(0, 64),
    inputDigest: `sha256:${'b'.repeat(64)}`,
    dataAsOf: artifactVersion === 1 ? '2026-03-31' : '2026-06-30',
    knownAsOf: artifactVersion === 1 ? '2026-04-20T10:00:00Z' : '2026-07-23T17:44:46Z',
    datasetVersion: 'sha256:' + 'c'.repeat(64),
    contentDigest: 'sha256:' + 'd'.repeat(64),
    modelVersion: artifactVersion === 1 ? 'assessment-engine/1.0.0' : 'assessment-engine/1.1.0',
    policyVersion: 'valuation-policy/1.0.0',
    adequacy: 'PARTIAL',
    qualityVerdict: 'MATERIAL_CONCERNS',
    confidence: 0.5609,
    evidenceCount: 2,
    limitationCount: 1,
    datasetClass: 'SYNTHETIC_REFERENCE',
    ...overrides,
  };
}

export const ASSESSMENT_ENVELOPE = {
  status: 'OK',
  reportType: 'investment.company-assessment',
  scope: { scopeToken: `co:${ISSUER}`, reportKey: 'a'.repeat(64), chainRootReportId: 'r-1', versionCount: 2 },
  version: version('r-2', 2),
  versions: [version('r-1', 1), version('r-2', 2)],
  assessment: {
    schemaVersion: 1,
    artifact: {
      kind: 'CompanyAssessment',
      subjectScope: `co:${ISSUER}`,
      modelVersion: 'assessment-engine/1.1.0',
      policyVersion: 'valuation-policy/1.0.0',
      generatedAt: '2026-11-06T00:00:00.000Z',
    },
    subject: {
      issuerId: ISSUER,
      legalName: 'Aarav Systems Limited (synthetic IID-6 demonstration)',
      sector: 'Technology',
      sectorSubsegment: 'IT services',
      reportingCurrency: 'INR',
      fiscalYearEnd: '03-31',
      identity: {
        bindingRef: 'sha256:a7fc075f',
        rosterVersion: 'sha256:7610c190e0f65b05',
        listingMapVersion: 'sha256:a03fa817a597f419',
        corporateActionTableVersion: 'sha256:0b1d3cbfe52c62af',
      },
    },
    asOf: {
      generatedAt: '2026-11-06T00:00:00.000Z',
      dataAsOf: '2026-06-30',
      knownAsOf: '2026-07-23T17:44:46Z',
      stalenessDays: 220,
      staleBeyondPolicy: true,
    },
    data: {
      datasetVersion: 'sha256:' + 'c'.repeat(64),
      contentDigest: 'sha256:' + 'd'.repeat(64),
      provider: 'iid3-m1-synthetic-reference',
      series: { statementScope: 'CONSOLIDATED', annualPeriods: 2 },
    },
    fundamentals: {
      annual: [
        {
          periodEnd: '2026-03-31',
          basis: 'AS_FILED',
          values: {
            REVENUE_FROM_OPERATIONS: obs(6120000000),
            NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: obs(2113000000),
            CASH_FROM_OPERATIONS: obs(null, 'NOT_REPORTED'),
          },
          derived: {
            EBIT: obs(2790000000),
            BOOK_VALUE_PER_SHARE: obs(144.2965),
          },
        },
      ],
      trends: { revenueCagr3y: obs(0.1412), patCagr3y: obs(null, 'NOT_COMPUTABLE') },
      capitalStructure: {
        // `L-036` — the associates/JV term is a named policy zero, and the fixture says so exactly as the payload
        // does, so the page test proves the disclosure is rendered rather than that it exists.
        associatesAndJV: { value: null, presence: 'NOT_COMPUTABLE' as const, reason: 'NOT_REPORTED' },
        equityBridge: {
          formula: 'equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV',
          policyVersion: 'associates-treatment/1.0.0',
          treatment: 'POLICY_ZERO_UNAVAILABLE',
          substitutedInputs: [
            { input: 'associatesAndJV', presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED', treatment: 'POLICY_ZERO' },
          ],
          note: 'Associates/JV carrying value is not recorded in dataset schema v1 (NOT_COMPUTABLE: NOT_REPORTED), so the enterprise-to-equity bridge substitutes zero for that term under policy associates-treatment/1.0.0. This is a policy substitution, not an issuer-reported nil: equity value is understated by any associates/JV carrying value the issuer reports.',
        },
      },
    },
    completeness: {
      requiredFieldCoveragePct: 82.5,
      adequacy: 'PARTIAL',
      adequacyBasis: ['cash-flow coverage below the required threshold'],
      missingFields: [{ field: 'CASH_FROM_OPERATIONS', reason: 'NOT_REPORTED', periodEnd: '2026-03-31' }],
    },
    quality: { verdict: 'MATERIAL_CONCERNS', flags: [{ code: 'STALE_DATA', detail: 'beyond policy' }] },
    valuation: {
      methodSelection: {
        sector: 'Technology',
        considered: [{ methodId: 'DCF_FCFF', role: 'PRIMARY', reason: 'Free cash flow to firm' }],
      },
      methods: [
        { methodId: 'DCF_FCFF', role: 'PRIMARY', applicable: true, notApplicableReason: null, output: { perShare: 2640 } },
        {
          methodId: 'EV_EBITDA',
          role: 'CROSS_CHECK',
          applicable: true,
          notApplicableReason: null,
          output: null,
        },
      ],
      intrinsic: {
        currency: 'INR',
        perShare: { low: obs(2380), mid: obs(2640), high: obs(2900) },
        spreadPct: obs(19.7),
        withheld: null,
      },
      marginOfSafety: {
        price: obs(2450),
        priceAsOf: '2026-11-05',
        mosVsMid: obs(-7.2),
        mosVsLow: obs(-2.9),
        band: 'FAIR',
        refusal: null,
      },
      sensitivity: [
        {
          methodId: 'DCF_FCFF',
          baseWaccBps: 1068,
          baseGrowthBps: 400,
          points: [{ waccBps: 1000, growthBps: 400, value: obs(2790) }],
        },
      ],
    },
    risk: {
      factors: [
        {
          riskId: 'risk-1',
          category: 'EARNINGS_QUALITY',
          severity: 3,
          likelihood: 2,
          status: 'ONGOING',
          statement: 'Receivables growth outpaced revenue growth',
        },
      ],
      aggregate: obs(3.1),
    },
    dividends: {
      verdict: 'MAINTAINED',
      payoutRatio: obs(0.32),
      fcfCoverage: obs(null, 'NOT_COMPUTABLE'),
      netDebtToEbitda: obs(null, 'NOT_APPLICABLE'),
      consecutiveYearsPaid: 4,
      conflict: null,
      withheld: null,
    },
    moat: { classification: 'WIDE', roicWaccSpread: { spread: obs(0.1996), consecutiveYearsPositive: 3 }, withheld: null },
    confidence: {
      dataConfidence: 0.85,
      modelConfidence: 0.6355,
      combined: 0.674,
      caps: ['STALE_DATA', 'DILUTION_PROXY'],
      // `L-034` — declared for the policy-default rate and multiple, and not applied: the design fixes no factor.
      assumptionCaps: [
        {
          cap: 'POLICY_DEFAULT_WACC',
          basis: 'POLICY_DEFAULT',
          applied: false,
          factor: null,
          triggers: [{ methodId: 'DCF_FCFF', assumption: 'discountRate' }],
          reason: 'CAP_FACTOR_NOT_SET_IN_POLICY: R-4.3 requires this cap and specifies no magnitude',
        },
        {
          cap: 'POLICY_DEFAULT_MULTIPLE',
          basis: 'POLICY_DEFAULT',
          applied: false,
          factor: null,
          triggers: [{ methodId: 'PE_RELATIVE', assumption: 'targetMultiple' }],
          reason: 'CAP_FACTOR_NOT_SET_IN_POLICY: R-4.3 requires this cap and specifies no magnitude',
        },
      ],
      formula: 'combined = 0.6 × dataConfidence + 0.4 × modelConfidence, then multiplied by each cap factor',
    },
    assumptions: {
      discountRate: {
        value: 0.10677961,
        basis: 'POLICY_DEFAULT',
        components: { riskFree: 0.069, equityRiskPremium: 0.055, beta: 1, weightEquity: 0.7 },
      },
      terminalGrowth: 0.04,
      forecastHorizonYears: 5,
      policyVersion: 'valuation-policy/1.0.0',
      methodSpecific: [{ methodId: 'DCF_FCFF', assumptions: { wacc: 0.10677961, terminalGrowth: 0.04, horizon: 5 } }],
    },
    sectorReferenceView: {
      evidenceClass: 'SECTOR_REFERENCE',
      sectorRefId: 'Technology-S1',
      engineVerdict: 'NEUTRAL',
      composite: 61.4,
      note: 'sector context only; it cannot drive the figures above',
    },
    evidence: [
      {
        evidenceId: 'EV-1',
        claim: 'Revenue from operations as filed',
        supports: ['fundamentals.annual.0'],
        source: { kind: 'FILING', ref: 'filing-1' },
        observationRefs: ['obs-1'],
      },
    ],
    limitations: ['Synthetic reference dataset (L-004).'],
    disclosure: { decisionSupportOnly: true, noTradeExecution: true, nonProduction: true },
  },
  disclosures: {
    decisionSupportOnly: true,
    noTradeExecution: true,
    nonProduction: true,
    datasetNotice: 'Assessment inputs are operator-supplied.',
  },
  limitations: ['L-001', 'L-004', 'L-009'],
};

export const DISPOSITION_ENVELOPE = {
  status: 'OK',
  reportType: 'investment.holding-disposition',
  scope: {
    scopeToken: `hd:${PORTFOLIO}/${SECURITY}`,
    reportKey: 'e'.repeat(64),
    chainRootReportId: 'd-1',
    versionCount: 1,
  },
  version: {
    reportId: 'd-1',
    artifactVersion: 1,
    generatedAt: '2026-11-06T06:00:00.000Z',
    reportKey: 'e'.repeat(64),
    payloadDigest: 'f'.repeat(64),
    inputDigest: 'sha256:' + '1'.repeat(64),
    modelVersion: 'disposition-engine/1.0.0',
    policyVersion: 'disposition-policy/1.0.0',
    dataAsOf: '2026-06-30',
    knownAsOf: '2026-07-23T17:44:46Z',
    datasetVersion: 'sha256:' + 'c'.repeat(64),
    adequacy: 'SUFFICIENT',
    confidence: 0.674,
  },
  versions: [
    {
      reportId: 'd-1',
      artifactVersion: 1,
      generatedAt: '2026-11-06T06:00:00.000Z',
      reportKey: 'e'.repeat(64),
      payloadDigest: 'f'.repeat(64),
      inputDigest: 'sha256:' + '1'.repeat(64),
      modelVersion: 'disposition-engine/1.0.0',
      policyVersion: 'disposition-policy/1.0.0',
      dataAsOf: '2026-06-30',
      knownAsOf: '2026-07-23T17:44:46Z',
      datasetVersion: 'sha256:' + 'c'.repeat(64),
      adequacy: 'SUFFICIENT',
      confidence: 0.674,
    },
  ],
  disposition: {
    schemaVersion: 1,
    artifact: {
      kind: 'HoldingDisposition',
      subjectScope: `hd:${PORTFOLIO}/${SECURITY}`,
      modelVersion: 'disposition-engine/1.0.0',
      policyVersion: 'disposition-policy/1.0.0',
      generatedAt: '2026-11-06T06:00:00.000Z',
    },
    subject: {
      kind: 'HELD',
      portfolioId: PORTFOLIO,
      positionKey: `${PORTFOLIO}#${SECURITY}`,
      securityId: SECURITY,
      issuerId: ISSUER,
      symbol: 'AARAV SYSTEM',
      exchange: 'NSE',
      securityClass: 'EQUITY',
      identityState: 'RESOLVED',
      securityState: 'ACTIVE',
      heldAsOf: '2026-11-06T05:00:00.000Z',
      quantities: { quantity: obs(1000), averageCost: obs(2400), marketValue: obs(2640000) },
    },
    companyAssessmentRef: {
      reportId: 'r-2',
      reportKey: 'a'.repeat(64),
      artifactVersion: 2,
      generatedAt: '2026-11-06T00:00:00.000Z',
      adequacy: 'PARTIAL',
      qualityVerdict: 'MATERIAL_CONCERNS',
      dataAsOf: '2026-06-30',
      knownAsOf: '2026-07-23T17:44:46Z',
      modelVersion: 'assessment-engine/1.1.0',
    },
    portfolioContext: {
      portfolioRevision: 7,
      asOf: '2026-11-06T05:00:00.000Z',
      holdingsMeasured: 1,
      holdingsUnresolved: 0,
      holdingsOutOfScope: 0,
      measuredWeightPct: 40,
      unmeasuredWeightPct: obs(60),
      weightPct: obs(40),
      companyExposurePct: obs(40),
      sectorExposurePct: obs(40),
      concentrationBand: obs(null, 'NOT_COMPUTABLE'),
    },
    disposition: {
      verb: 'AVOID',
      confidence: 0.674,
      horizon: 'SHORT_TERM',
      adequacy: 'SUFFICIENT',
      withheld: null,
      gates: [{ gateId: 'G-1_IDENTITY', outcome: 'PASS', detail: 'RESOLVED + EQUITY' }],
      capsApplied: [],
      policyVersion: 'disposition-policy/1.0.0',
      definitionApplied:
        'The evidence no longer supports continued ownership. This is not an instruction to sell, and implies no timing, price or quantity.',
    },
    interpretation: {
      nature: 'INVESTMENT_ASSESSMENT',
      notAnInstruction: 'This is an investment assessment, not a trade instruction, order, or recommendation.',
      noExecutionPath: true,
    },
    limits: {
      policyVersion: 'limits-policy/1.0.0+system-default',
      basis: 'SYSTEM_DEFAULT',
      effectiveFrom: '1970-01-01T00:00:00.000Z',
      singleNameMaxPct: 10,
      defaultSectorMaxPct: 30,
      digest: '0'.repeat(64),
      applied: [
        {
          limitId: 'SINGLE_NAME_MAX',
          scope: 'SINGLE_SECURITY',
          capPct: 10,
          basis: 'SYSTEM_DEFAULT',
          measuredPct: 40,
          projectedPct: null,
          breached: true,
        },
      ],
      notes: ['no operator limits policy is configured; system defaults applied and labelled as such'],
    },
    rationale: [
      {
        rationaleId: 'rat-quality',
        claim: 'Quality verdict is MATERIAL_CONCERNS with 1 HIGH-severity flag',
        direction: 'COUNTERS',
        category: 'QUALITY',
        weight: 0.8,
        evidenceIds: ['assessment:quality'],
        observationRefs: ['quality.verdict'],
      },
      {
        rationaleId: 'rat-moat',
        claim: 'Moat classification is WIDE with a positive spread',
        direction: 'SUPPORTS',
        category: 'MOAT',
        weight: 0.6,
        evidenceIds: ['MOAT-PRICING-POWER'],
        observationRefs: ['MOAT-PRICING-POWER'],
      },
    ],
    falsifiers: [
      {
        statement: 'A margin-of-safety move across the policy threshold would change this view',
        trigger: 'mosVsMid crosses 15% or -10%',
        observation: 'assessment.valuation.marginOfSafety.mosVsMid',
      },
    ],
    portfolioImplication: {
      kind: 'TARGET_WEIGHT_BAND',
      currentWeightPct: obs(40),
      impliedTargetWeightBand: null,
      bandBasis: 'AVOID: the evidence does not support continued ownership, so no target exposure is asserted',
      projectedSectorExposurePct: obs(null, 'POLICY_INPUTS_UNAVAILABLE'),
      projectedSingleNamePct: obs(null, 'POLICY_INPUTS_UNAVAILABLE'),
      projectedTopHoldingPct: obs(null, 'POLICY_INPUTS_UNAVAILABLE'),
      deltaNotes: ['limits in force: single-name 10% (SYSTEM_DEFAULT)'],
    },
    review: {
      nextReviewOn: '2027-02-02',
      triggers: [
        { triggerId: 'TRG-NEXT-DATASET', condition: 're-evaluated at the next dataset version', armed: true },
      ],
    },
    evidence: [
      { evidenceId: 'assessment:quality', claim: 'Quality verdict and flags', source: { kind: 'ASSESSMENT', ref: 'r-2' } },
    ],
    limitations: ['Synthetic reference dataset (L-004).'],
    disclosure: {
      decisionSupportOnly: true,
      noTradeExecution: true,
      nonProduction: true,
      notAnInstruction: 'This is a decision-support implication, not an order or a trade instruction.',
    },
  },
  disclosures: { decisionSupportOnly: true, noTradeExecution: true },
  limitations: ['L-004', 'L-009', 'L-014'],
};

export const CANDIDATE_DISPOSITION_ENVELOPE = {
  ...DISPOSITION_ENVELOPE,
  scope: { ...DISPOSITION_ENVELOPE.scope, scopeToken: `hc:${SECURITY}` },
  disposition: {
    ...DISPOSITION_ENVELOPE.disposition,
    subject: {
      kind: 'CANDIDATE',
      contextPortfolioId: PORTFOLIO,
      origin: 'WATCHLIST',
      securityId: SECURITY,
      issuerId: ISSUER,
      symbol: 'AARAV SYSTEM',
      exchange: 'NSE',
      securityClass: 'EQUITY',
      identityState: 'RESOLVED',
      securityState: 'ACTIVE',
      quantities: 'NOT_APPLICABLE',
    },
    disposition: {
      ...DISPOSITION_ENVELOPE.disposition.disposition,
      verb: 'AVOID_CANDIDATE',
      horizon: 'MEDIUM_TERM',
    },
    portfolioContext: null,
    portfolioImplication: {
      kind: 'TARGET_WEIGHT_BAND',
      currentWeightPct: obs(null, 'NOT_APPLICABLE'),
      impliedTargetWeightBand: null,
      bandBasis: 'AVOID_CANDIDATE: the evidence does not support initiating a position',
      projectedSectorExposurePct: obs(null, 'POLICY_INPUTS_UNAVAILABLE'),
      projectedSingleNamePct: obs(null, 'POLICY_INPUTS_UNAVAILABLE'),
      projectedTopHoldingPct: obs(null, 'POLICY_INPUTS_UNAVAILABLE'),
      deltaNotes: [],
    },
  },
};

export const WITHHELD_DISPOSITION_ENVELOPE = {
  ...DISPOSITION_ENVELOPE,
  disposition: {
    ...DISPOSITION_ENVELOPE.disposition,
    disposition: {
      ...DISPOSITION_ENVELOPE.disposition.disposition,
      verb: null,
      confidence: null,
      adequacy: 'INSUFFICIENT',
      withheld: {
        reasons: ['INSUFFICIENT_EVIDENCE'],
        unmetInputs: ['CASH_FROM_OPERATIONS', 'NET_DEBT_TO_EBITDA'],
      },
    },
  },
};

const fromRef = {
  reportId: 'r-1',
  artifactVersion: 1,
  generatedAt: '2026-11-01T00:00:00.000Z',
  payloadDigest: '1'.repeat(64),
  substantiveDigest: '08ea8d4a',
  substantiveDigestSource: 'RECORDED',
  substantiveIdentityGrammar: 'assessment-substantive-identity/1',
  modelVersion: 'assessment-engine/1.0.0',
  policyVersion: 'valuation-policy/1.0.0',
  datasetVersion: 'sha256:' + 'c'.repeat(64),
  contentDigest: 'sha256:' + 'd'.repeat(64),
};

const toRef = {
  ...fromRef,
  reportId: 'r-2',
  artifactVersion: 2,
  generatedAt: '2026-11-02T00:00:00.000Z',
  payloadDigest: '2'.repeat(64),
  substantiveDigest: 'fd9589e4',
  modelVersion: 'assessment-engine/1.1.0',
};

const REVIEW_BASE = {
  required: true,
  priority: 'HIGH',
  triggers: [
    { triggerId: 'FRESHNESS_TRANSITION', fired: true, reason: 'the pair is a freshness transition' },
    { triggerId: 'MODEL_OR_POLICY_CHANGE', fired: false, reason: 'the model or policy identity did not change' },
  ],
  suggestedFocus: ['Do the underlying statements need refreshing before this assessment is relied on?'],
};

const ATTRIBUTION_BASE = {
  status: 'UNAVAILABLE',
  cause: 'UNATTRIBUTED',
  additive: false,
  reason: 'the model identity differs between the two versions and only one build exists',
  legs: {
    data: { available: true, requires: 'the stored payloads of both versions (no re-execution needed)', reason: null },
    model: { available: false, requires: 'an executable build of assessment-engine/1.0.0', reason: 'only one build exists' },
  },
  reproducedFrom: { from: 'EXACT', to: 'EXACT' },
};

export function comparison(overrides: Record<string, unknown>) {
  return {
    from: fromRef,
    to: toRef,
    classification: 'FRESHNESS_TRANSITION',
    substantiveIdentityChanged: true,
    payloadIdentityChanged: true,
    summary: {
      total: 2,
      byCategory: {
        FUNDAMENTAL: 0,
        MARKET_VALUATION: 0,
        RISK_QUALITY: 2,
        DISPOSITION: 0,
        PORTFOLIO: 0,
        DATA_CORRECTION_RESTATEMENT: 0,
        MODEL: 0,
        IDENTITY_MAPPING: 0,
      },
      byMateriality: { IMMATERIAL: 0, NOTABLE: 0, MATERIAL: 1, CRITICAL: 1 },
      highestMateriality: 'CRITICAL',
    },
    changes: [
      {
        kind: 'CATEGORICAL',
        dimensionId: 'quality.verdict',
        path: 'quality.verdict',
        label: 'Quality verdict',
        category: 'RISK_QUALITY',
        type: 'ORDINAL',
        materiality: 'MATERIAL',
        direction: 'WORSENED',
        from: 'CLEAN',
        to: 'MATERIAL_CONCERNS',
      },
      {
        kind: 'NUMERIC',
        dimensionId: 'confidence.combined',
        path: 'confidence.combined',
        label: 'Combined confidence',
        category: 'RISK_QUALITY',
        type: 'RATIO',
        materiality: 'CRITICAL',
        direction: 'WORSENED',
        observed: { from: 0.8371, to: 0.674, absolute: -0.1631, relativePct: -19.48, unit: 'ratio' },
      },
    ],
    metadata: [{ member: 'artifact.generatedAt', from: '2026-11-01T00:00:00.000Z', to: '2026-11-02T00:00:00.000Z', excluded: true }],
    attribution: ATTRIBUTION_BASE,
    review: REVIEW_BASE,
    reproduction: { from: { source: 'EXACT' }, to: { source: 'EXACT' } },
    persisted: false,
    ...overrides,
  };
}

export const CHANGES_ENVELOPE = {
  status: 'OK',
  reportType: 'investment.company-assessment',
  subjectScope: `co:${ISSUER}`,
  pairCount: 1,
  returned: 1,
  truncated: false,
  comparisons: [comparison({})],
  limitations: ['L-004', 'L-014'],
};

export const BOUNDARIES_ENVELOPE = {
  status: 'OK',
  changeReportType: 'investment.change-report',
  subjectScope: `co:${ISSUER}`,
  coverage: {
    subjectScope: `co:${ISSUER}`,
    reportType: 'investment.company-assessment',
    versionCount: 2,
    boundaryCount: 0,
    pairCount: 1,
    explainedPairs: [],
    unexplainedPairs: [{ fromReportId: 'r-1', toReportId: 'r-2' }],
    complete: false,
  },
  count: 0,
  boundaries: [],
  limitations: ['L-004', 'L-014'],
};

export const COVERAGE_REPORT = {
  reportVersion: 1,
  asOf: '2026-11-06',
  generatedAt: '2026-11-06T00:00:00.000Z',
  counts: {
    RESOLVED: 1,
    AMBIGUOUS: 1,
    UNMATCHED: 1,
    INELIGIBLE: 1,
    OUT_OF_SCOPE_SECURITY: 1,
    STALE_REFERENCE: 1,
    REJECTED_MALFORMED_ISIN: 1,
    ISSUER_KEY_CONFLICT: 0,
    AMBIGUOUS_LISTING: 0,
    observed: 7,
    assessable: 1,
  },
  bySource: {
    HOLDING: { observed: 7, resolved: 1, unresolved: 6, assessable: 1 },
    BROKER_PREVIEW: { observed: 0, resolved: 0, unresolved: 0, assessable: 0 },
    WATCHLIST: { observed: 0, resolved: 0, unresolved: 0, assessable: 0 },
  },
  items: [
    {
      observationId: 'o-resolved',
      source: 'HOLDING',
      portfolioId: PORTFOLIO,
      state: 'RESOLVED',
      reason: null,
      reasonText: null,
      detail: null,
      candidates: [],
      displayName: 'AARAV SYSTEM',
      upstreamStatus: null,
      raw: { symbol: 'AARAVSYN' },
      binding: {
        bindingId: 'sha256:a7fc075f',
        issuerId: ISSUER,
        securityId: SECURITY,
        listingId: 'NSE:AARAVSYN',
        resolutionBasis: 'ISIN',
        effectiveFrom: '2026-04-01',
        effectiveTo: null,
        assessable: true,
      },
    },
    {
      observationId: 'o-unresolved',
      source: 'HOLDING',
      portfolioId: PORTFOLIO,
      state: 'UNMATCHED',
      reason: 'NO_ROSTER_MATCH',
      reasonText: 'The ISIN is not present in the eligible roster',
      detail: null,
      candidates: [],
      displayName: 'UNKNOWN SECURITY',
      upstreamStatus: null,
      raw: { isin: 'INE999X01011' },
      binding: {
        bindingId: 'b-unresolved',
        issuerId: null,
        securityId: null,
        listingId: null,
        resolutionBasis: null,
        effectiveFrom: null,
        effectiveTo: null,
        assessable: false,
      },
    },
    {
      observationId: 'o-out-of-scope',
      source: 'HOLDING',
      portfolioId: PORTFOLIO,
      state: 'OUT_OF_SCOPE_SECURITY',
      reason: 'ETF_UNIT',
      reasonText: 'An ETF unit is out of scope for equity assessment',
      detail: null,
      candidates: [],
      displayName: 'INDEX ETF',
      upstreamStatus: null,
      raw: { isin: 'INF204KB14I2' },
      binding: {
        bindingId: 'b-oos',
        issuerId: 'IN:EQISIN:INF204KB14I2',
        securityId: 'IN:ISIN:INF204KB14I2',
        listingId: 'NSE:ETF',
        resolutionBasis: 'ISIN',
        effectiveFrom: '2026-04-01',
        effectiveTo: null,
        assessable: false,
      },
    },
  ],
  unresolved: [],
  successorReconciliations: [],
  financialCoverage: {
    measuredSectors: 3,
    totalSectors: 13,
    outstandingSectors: ['Banking', 'Energy'],
    usableMethods: 12,
    withheldMethods: 26,
    xbrlMappedTags: 20,
    derivationItems: 8,
    unmappedTagsObserved: [],
    datasetClass: 'SYNTHETIC_FIXTURE',
    note: 'Financial coverage is not identity coverage.',
  },
  statusLine: '7 rows observed · 1 assessable · 6 unresolved',
  notes: ['Coverage is a classification of observed rows, not an assessment of them.'],
  identitySources: {
    rosterVersion: 'sha256:7610c190e0f65b05',
    listingMapVersion: 'sha256:a03fa817a597f419',
    corporateActionTableVersion: 'sha256:0b1d3cbfe52c62af',
    rosterLabel: 'synthetic eligible roster',
    rosterDataClass: 'SYNTHETIC_FIXTURE',
  },
};
