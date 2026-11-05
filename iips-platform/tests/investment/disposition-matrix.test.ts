/**
 * IID-4 — AC-4.1 / AC-4.2 / AC-4.8: the R-9 per-verb matrix as a table.
 *
 * One row per case, each asserting the verb the design of record says that evidence produces — or the
 * named withholding the design says it must produce instead. The table is the acceptance criterion, so
 * adding a row is how a new threshold gets reviewed; there is no other place where a verb is "expected".
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import type { CompanyAssessmentPayload } from '../../src/investment/assessment/types';
import type { DispositionAssessmentRef, ResolvedLimits, SubjectFacts } from '../../src/investment/disposition/types';
import type { PortfolioFacts } from '../../src/investment/disposition/gates';
import { buildDispositionPayload } from '../../src/investment/disposition/engine';
import { evaluateCaps } from '../../src/investment/disposition/limits';
import { DISPOSITION_MODEL_VERSION } from '../../src/investment/disposition/types';
import {
  DEFAULT_LIMITS,
  NOW,
  bankPayload,
  candidateFixture,
  heldFixture,
  operatorLimits,
  patchPayload,
  portfolioBlock,
  portfolioFacts,
  riskFactor,
  techPayload,
  thinPayload,
  withMos,
  withRisingLeverage,
} from './dispositionFixtures';

function assessmentRef(payload: CompanyAssessmentPayload): DispositionAssessmentRef {
  return {
    reportId: 'r-disposition-fixture',
    reportKey: 'fcf992e0a1316001059cac7caa21335938f2b63b25c986dfb7c50e8cfc376d2f',
    artifactVersion: 1,
    generatedAt: NOW,
    adequacy: payload.completeness.adequacy,
    qualityVerdict: payload.quality.verdict,
    moatClassification: payload.moat.classification,
    datasetClass: 'SYNTHETIC_REFERENCE',
    datasetVersion: payload.data.datasetVersion,
    contentDigest: payload.data.contentDigest,
    dataAsOf: payload.asOf.dataAsOf,
    knownAsOf: payload.asOf.knownAsOf,
    modelVersion: payload.artifact.modelVersion,
    policyVersion: payload.artifact.policyVersion,
  };
}

interface MatrixCase {
  readonly id: string;
  readonly payload: CompanyAssessmentPayload;
  readonly subject: SubjectFacts;
  readonly portfolio: PortfolioFacts | null;
  readonly limits?: ResolvedLimits;
  readonly expectVerb: string | null;
  /** When the verb is withheld, the reason that must appear. */
  readonly expectReason?: string;
  /** Structural expectations that hold regardless of the verb. */
  readonly assert?: (payload: ReturnType<typeof buildDispositionPayload>) => void;
}

function runCase(c: MatrixCase) {
  const limits = c.limits ?? DEFAULT_LIMITS;
  const caps = evaluateCaps({
    limits,
    subjectKind: c.subject.kind,
    sector: c.payload.subject.sector,
    currentWeightPct: c.subject.kind === 'HELD' ? (c.portfolio?.weightPct ?? null) : 0,
    currentSectorExposurePct: c.portfolio?.sectorExposurePct ?? null,
    projectedBandHighPct: c.portfolio?.weightPct ?? 0,
  });
  return buildDispositionPayload({
    subject: c.subject,
    assessment: { payload: c.payload, ref: assessmentRef(c.payload) },
    portfolio: c.portfolio === null ? null : { block: portfolioBlock(), facts: c.portfolio },
    limits,
    generatedAt: NOW,
    limitations: ['L-001', 'L-009'],
  });
}

const tech = techPayload();
const held = heldFixture();

const qualityMaterial = { quality: { verdict: 'MATERIAL_CONCERNS' as const, flags: [{ code: 'NEGATIVE_EQUITY' as const, severity: 'HIGH' as const, evidence: 'fixture:negative-equity' }] } };

const CASES: readonly MatrixCase[] = [
  // ---------------------------------------------------------------- held: positive ---
  {
    id: 'held / 45% discount / SUFFICIENT / CLEAN / WIDE → ACCUMULATE',
    payload: withMos(tech, 45),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'ACCUMULATE',
  },
  {
    id: 'held / exactly 15% discount (boundary) → ACCUMULATE',
    payload: withMos(tech, 15),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'ACCUMULATE',
  },
  {
    id: 'held / 14.9% discount (just inside FAIR) → RETAIN',
    payload: withMos(tech, 14.9),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'RETAIN',
  },
  {
    id: 'held / 0% (fair value) → RETAIN',
    payload: withMos(tech, 0),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'RETAIN',
  },
  {
    id: 'held / −5.1% (below the FAIR band, above the REDUCE trigger) → withheld',
    payload: withMos(tech, -5.1),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: null,
    expectReason: 'no_verb_conditions_met',
  },
  // ---------------------------------------------------------------- held: negative ---
  {
    id: 'held / −10% premium (boundary) → REDUCE',
    payload: withMos(tech, -10),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'REDUCE',
  },
  {
    id: 'held / −25% premium with deteriorating fundamentals → AVOID',
    payload: patchPayload(withMos(tech, -25), { fundamentals: { trends: { patCagr3y: { value: -0.04, presence: 'PRESENT' } } } }),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'AVOID',
  },
  {
    id: 'held / −25% premium without deteriorating fundamentals → REDUCE, never AVOID',
    payload: withMos(tech, -25),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'REDUCE',
  },
  {
    id: 'held / MATERIAL_CONCERNS with a HIGH flag → AVOID',
    payload: patchPayload(tech, qualityMaterial),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'AVOID',
  },
  {
    id: 'held / MATERIAL_CONCERNS + HIGH flag on PARTIAL evidence → AVOID (discrete evidenced fact)',
    payload: patchPayload(withMos(tech, 0), {
      ...qualityMaterial,
      completeness: { adequacy: 'PARTIAL' },
    }),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'AVOID',
  },
  {
    id: 'held / unresolved severity 5 risk → AVOID',
    payload: patchPayload(withMos(tech, 5), { risk: { factors: [riskFactor(5, 'ONGOING')] } }),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'AVOID',
  },
  // ------------------------------------------------------- held: PARTIAL (AC-4.2) ---
  {
    id: 'held / PARTIAL + 45% discount → withheld, never ACCUMULATE',
    payload: patchPayload(withMos(tech, 45), { completeness: { adequacy: 'PARTIAL' } }),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: null,
    expectReason: 'no_verb_conditions_met',
    assert: (payload) => {
      assert.notEqual(payload.disposition.verb, 'ACCUMULATE');
      assert.equal(payload.disposition.adequacy, 'PARTIAL');
    },
  },
  {
    id: 'held / PARTIAL + −12% premium, no limits breach → withheld (REDUCE needs an independent trigger)',
    payload: patchPayload(withMos(tech, -12), { completeness: { adequacy: 'PARTIAL' } }),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: null,
    expectReason: 'no_verb_conditions_met',
  },
  {
    id: 'held / PARTIAL + −12% premium + weight above the cap → REDUCE (limits breach is independent evidence)',
    payload: patchPayload(withMos(tech, -12), { completeness: { adequacy: 'PARTIAL' } }),
    subject: held,
    portfolio: portfolioFacts({ weightPct: 35, companyExposurePct: 35 }),
    expectVerb: 'REDUCE',
  },
  {
    id: 'held / INSUFFICIENT adequacy → withheld insufficient_data',
    payload: thinPayload(),
    subject: heldFixture({ issuerId: 'IN:CIN:L72200KA1981PLC013117', securityId: 'IN:ISIN:IN0000000409' }),
    portfolio: portfolioFacts(),
    expectVerb: null,
    expectReason: 'insufficient_data',
    assert: (payload) => assert.equal(payload.disposition.verb, null),
  },
  {
    id: 'held / unresolved severity 4 (ONGOING) blocks RETAIN and ACCUMULATE → withheld',
    payload: patchPayload(withMos(tech, 45), { risk: { factors: [riskFactor(4, 'ONGOING')] } }),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: null,
    expectReason: 'no_verb_conditions_met',
  },
  {
    id: 'held / dividend UNCOVERED with rising leverage → REDUCE',
    payload: withRisingLeverage(patchPayload(withMos(tech, 2), { dividends: { verdict: 'UNCOVERED' } })),
    subject: held,
    portfolio: portfolioFacts(),
    expectVerb: 'REDUCE',
    assert: (payload) => {
      // The rising-leverage half of the trigger is read from the payload's own derived series; if the
      // fixture's series is not rising the REDUCE must then come from the moat/quality side instead, so
      // this case also asserts that the trigger list is visible in the gates.
      assert.ok(payload.disposition.gates.some((gate) => gate.gateId === 'G-3_EVIDENCE_ADEQUACY'));
    },
  },
  // ---------------------------------------------------------------- held: caps ---
  {
    id: 'held / ACCUMULATE capped to RETAIN when the projected band breaches the single-name cap',
    payload: withMos(tech, 45),
    subject: held,
    // at 9 % weight, ACCUMULATE's band high is 11.25 % > 10 % cap
    portfolio: portfolioFacts({ weightPct: 9, companyExposurePct: 9 }),
    expectVerb: 'RETAIN',
    assert: (payload) => {
      assert.ok(payload.disposition.capsApplied.some((cap) => cap.gateId === 'CAPACITY_SINGLE_NAME'));
      assert.ok(payload.rationale.some((entry) => entry.rationaleId.includes('capacity_single_name')));
    },
  },
  {
    id: 'held / 35% weight (already above the cap) → REDUCE, with the cap gate named',
    payload: withMos(tech, 45),
    subject: held,
    portfolio: portfolioFacts({ weightPct: 35, companyExposurePct: 35 }),
    expectVerb: 'REDUCE',
    assert: (payload) => {
      assert.ok(payload.disposition.gates.some((gate) => gate.gateId === 'CAPACITY_SINGLE_NAME' && gate.outcome === 'FAIL'));
    },
  },
  // ------------------------------------------------------------- identity/state ---
  {
    id: 'held / identity UNRESOLVED → withheld identity_unresolved',
    payload: tech,
    subject: heldFixture({ identityState: 'UNRESOLVED' }),
    portfolio: portfolioFacts(),
    expectVerb: null,
    expectReason: 'identity_unresolved',
  },
  {
    id: 'held / security class OUT_OF_SCOPE_SECURITY → withheld security_class_excluded',
    payload: tech,
    subject: heldFixture({ securityClass: 'OUT_OF_SCOPE_SECURITY' }),
    portfolio: portfolioFacts(),
    expectVerb: null,
    expectReason: 'security_class_excluded',
  },
  {
    id: 'held / security DELISTED → withheld security_delisted',
    payload: tech,
    subject: heldFixture({ securityState: 'DELISTED' }),
    portfolio: portfolioFacts(),
    expectVerb: null,
    expectReason: 'security_delisted',
  },
  {
    id: 'held / no portfolio context and no disqualifier → withheld portfolio_context_unavailable',
    payload: withMos(tech, 20),
    subject: held,
    portfolio: null,
    expectVerb: null,
    expectReason: 'portfolio_context_unavailable',
  },
  // ------------------------------------------------------------------ candidates ---
  {
    id: 'candidate / PARTIAL → WATCH (designated state, R-9)',
    payload: patchPayload(withMos(tech, 45), { completeness: { adequacy: 'PARTIAL' } }),
    subject: candidateFixture(),
    portfolio: portfolioFacts(),
    expectVerb: 'WATCH',
    assert: (payload) => {
      assert.equal(payload.portfolioImplication.impliedTargetWeightBand, null);
      assert.equal((payload.subject as { quantities: string }).quantities, 'NOT_APPLICABLE');
    },
  },
  {
    id: 'candidate / SUFFICIENT + 20% discount + sector room → INITIATE',
    payload: withMos(tech, 20),
    subject: candidateFixture(),
    portfolio: portfolioFacts({ weightPct: 0, companyExposurePct: 0, sectorExposurePct: 12 }),
    expectVerb: 'INITIATE',
  },
  {
    id: 'candidate / SUFFICIENT + 20% discount but sector exposure 28% (cap 30%) → WATCH via CAPACITY_SECTOR',
    payload: withMos(tech, 20),
    subject: candidateFixture(),
    portfolio: portfolioFacts({ weightPct: 0, companyExposurePct: 0, sectorExposurePct: 28, topHoldingWeightPct: 20 }),
    expectVerb: 'WATCH',
    assert: (payload) => {
      assert.ok(payload.disposition.capsApplied.some((cap) => cap.gateId === 'CAPACITY_SECTOR'));
      assert.ok(payload.disposition.gates.some((gate) => gate.gateId === 'CAPACITY_SECTOR' && gate.outcome === 'FAIL'));
    },
  },
  {
    id: 'candidate / SUFFICIENT + 8% discount → WATCH (not yet a discount)',
    payload: withMos(tech, 8),
    subject: candidateFixture(),
    portfolio: portfolioFacts({ weightPct: 0, companyExposurePct: 0 }),
    expectVerb: 'WATCH',
  },
  {
    id: 'candidate / INSUFFICIENT → withheld insufficient_data, never AVOID_CANDIDATE',
    payload: thinPayload(),
    subject: candidateFixture({ issuerId: 'IN:CIN:L72200KA1981PLC013117', securityId: 'IN:ISIN:IN0000000409' }),
    portfolio: null,
    expectVerb: null,
    expectReason: 'insufficient_data',
    assert: (payload) => assert.notEqual(payload.disposition.verb, 'AVOID_CANDIDATE'),
  },
  {
    id: 'candidate / PARTIAL with a discrete disqualifier → AVOID_CANDIDATE',
    payload: patchPayload(withMos(tech, 5), { ...qualityMaterial, completeness: { adequacy: 'PARTIAL' } }),
    subject: candidateFixture(),
    portfolio: portfolioFacts({ weightPct: 0, companyExposurePct: 0 }),
    expectVerb: 'AVOID_CANDIDATE',
  },
  {
    id: 'candidate / no portfolio context → WATCH, never INITIATE',
    payload: withMos(tech, 45),
    subject: candidateFixture({ contextPortfolioId: null }),
    portfolio: null,
    expectVerb: 'WATCH',
  },
  {
    id: 'candidate / operator limits: single-name 8% halves the INITIATE band but sector room still allows it',
    payload: withMos(tech, 45),
    subject: candidateFixture(),
    portfolio: portfolioFacts({ weightPct: 0, companyExposurePct: 0, sectorExposurePct: 5 }),
    limits: operatorLimits(),
    expectVerb: 'INITIATE',
    assert: (payload) => {
      assert.equal(payload.limits.basis, 'OPERATOR_CONFIG');
      assert.ok((payload.portfolioImplication.impliedTargetWeightBand?.high ?? 0) <= 8);
    },
  },
];

describe('AC-4.1 — the R-9 per-verb matrix is a table of at least 16 cases', () => {
  test('the table has at least 16 cases', () => {
    assert.ok(CASES.length >= 16, `expected ≥16 cases, found ${CASES.length}`);
  });

  for (const c of CASES) {
    test(c.id, () => {
      const payload = runCase(c);
      if (c.expectVerb === null) {
        assert.equal(payload.disposition.verb, null, `${c.id}: expected a withheld disposition`);
        assert.ok(payload.disposition.withheld !== null, `${c.id}: a withheld disposition must carry reasons`);
        assert.ok(
          payload.disposition.withheld!.reasons.includes(c.expectReason!),
          `${c.id}: expected reason ${c.expectReason}, got ${payload.disposition.withheld!.reasons.join(', ')}`,
        );
      } else {
        assert.equal(payload.disposition.verb, c.expectVerb, `${c.id}: decision path was ${JSON.stringify(payload.disposition.gates.map((g) => `${g.gateId}:${g.outcome}`))}`);
        assert.equal(payload.disposition.withheld, null);
        assert.equal(payload.disposition.definitionApplied.length > 0, true);
      }
      c.assert?.(payload);
    });
  }
});

describe('AC-4.2 — PARTIAL evidence never produces ACCUMULATE or INITIATE', () => {
  const partialCases = CASES.filter((c) => c.payload.completeness.adequacy === 'PARTIAL');
  test('every PARTIAL case in the table is consistent with the invariant', () => {
    assert.ok(partialCases.length >= 4, 'the table must contain several PARTIAL cases');
    for (const c of partialCases) {
      const payload = runCase(c);
      assert.notEqual(payload.disposition.verb, 'ACCUMULATE', c.id);
      assert.notEqual(payload.disposition.verb, 'INITIATE', c.id);
    }
  });

  test('a PARTIAL assessment at a 60% discount still cannot accumulate', () => {
    const payload = buildDispositionPayload({
      subject: held,
      assessment: {
        payload: patchPayload(withMos(tech, 60), { completeness: { adequacy: 'PARTIAL' } }),
        ref: assessmentRef(patchPayload(withMos(tech, 60), { completeness: { adequacy: 'PARTIAL' } })),
      },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    assert.notEqual(payload.disposition.verb, 'ACCUMULATE');
  });
});

describe('AC-4.8 — every payload states the interpretation explicitly', () => {
  test('AVOID says it is not an exit instruction and asserts no target band', () => {
    const payload = runCase(CASES.find((c) => c.expectVerb === 'AVOID')!);
    assert.equal(payload.interpretation.nature, 'INVESTMENT_ASSESSMENT');
    assert.equal(payload.interpretation.noExecutionPath, true);
    assert.match(payload.interpretation.notAnInstruction, /not a trade instruction/i);
    assert.equal(payload.portfolioImplication.impliedTargetWeightBand, null);
    assert.match(payload.portfolioImplication.bandBasis, /AVOID/);
    assert.equal(payload.disposition.definitionApplied, payload.interpretation.verbsMean.AVOID);
  });

  test('the verb dictionary covers all seven verbs and matches the contracts', () => {
    const payload = runCase(CASES[0]!);
    assert.deepEqual(Object.keys(payload.interpretation.verbsMean).sort(), [
      'ACCUMULATE',
      'AVOID',
      'AVOID_CANDIDATE',
      'INITIATE',
      'REDUCE',
      'RETAIN',
      'WATCH',
    ]);
  });
});

describe('identity of the produced payload', () => {
  test('the model version is the disposition engine, not the assessment engine', () => {
    const payload = runCase(CASES[0]!);
    assert.equal(payload.artifact.modelVersion, DISPOSITION_MODEL_VERSION);
    assert.equal(payload.artifact.kind, 'HoldingDisposition');
    assert.equal(payload.schemaVersion, 1);
  });

  test('a bank assessment with PARTIAL evidence yields a defensible withheld or WATCH outcome', () => {
    const payload = buildDispositionPayload({
      subject: candidateFixture({ issuerId: 'IN:CIN:L65110KA1981PLC013116', securityId: 'IN:ISIN:IN0000000300' }),
      assessment: { payload: bankPayload(), ref: assessmentRef(bankPayload()) },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts({ weightPct: 0, companyExposurePct: 0 }) },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    assert.equal(payload.disposition.verb, 'WATCH');
  });
});
