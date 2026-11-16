/**
 * W11 — compatible issuer-engine execution.
 *
 * Two evidence classes are kept apart on purpose:
 *
 *   ACTUAL EVIDENCE — the persisted Infosys dataset and identity files under `evidence/real-issuer/…`, read through
 *   the verified fundamentals boundary and the governed identity resolver. These tests show what the real chain does:
 *   identity resolves, qualification refuses, and nothing executes.
 *
 *   SYNTHETIC CONTRACT TESTS — the W10 banking fixture, used only to prove the adapter's mechanics (compatible engine
 *   selection, deterministic execution, revision binding, refusal paths). They are labelled as such and are never
 *   presented as issuer evidence.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve as resolvePath } from 'node:path';

import { EngineApiAdapter } from '../../src/integration/EngineApiAdapter';
import { loadIdentitySourcesFromDir } from '../../src/investment/identity/sources';
import { resolveIdentity } from '../../src/investment/identity/resolver';
import type { IdentitySources } from '../../src/investment/identity/types';
import { openLocalSnapshot } from '../../src/investment/port/localSnapshotStore';
import type { DatasetContent } from '../../src/investment/fundamentals/types';
import { canonicalJson } from '../../src/investment/qualification';
import {
  certifiedEngineExecutor,
  executeIssuerEngine,
  executePortfolioEngines,
  prepareEngineExecution,
  W11_EXECUTION_SCHEMA_VERSION,
  type EngineExecutor,
  type PortfolioExecutionReport,
  type PortfolioHoldingEvidence,
  type PortfolioRevisionEvidence,
} from '../../src/investment/execution';

import { AS_OF, BANK, BANK_METRICS, BANK_PERIODS, FY26, bankDataset, dataset, filed, issuer, metricRecord, period } from './w10Fixtures';

const ROOT = resolvePath(__dirname, '..', '..', '..');
const INFOSYS_DATASET = resolvePath(ROOT, 'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/dataset');
const INFOSYS_IDENTITY = resolvePath(ROOT, 'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/identity');
const INFOSYS_ISSUER = 'IN:CIN:L85110KA1981PLC013115';
const INFOSYS_ISIN = 'INE009A01021';

/** Read a verified dataset directory through the existing fundamentals boundary. */
function contentFromDir(dir: string): DatasetContent {
  const port = openLocalSnapshot({ dataDir: dir });
  const manifest = port.manifest();
  const issuers = port.listIssuers();
  return {
    ...(manifest.datasetSchema === undefined ? {} : { datasetSchema: manifest.datasetSchema }),
    issuers,
    securities: issuers.flatMap((entry) => port.securitiesFor(entry.issuerId)),
    listings: issuers.flatMap((entry) => port.listingsFor(entry.issuerId)),
    periods: issuers.flatMap((entry) => port.periodsFor(entry.issuerId)),
    prices: [],
    corporateActions: issuers.flatMap((entry) => port.corporateActionsFor(entry.issuerId)),
    operatingMetrics: issuers.flatMap((entry) => port.operatingMetricsFor(entry.issuerId)),
    issues: port.issues(),
  };
}

const BANK_SECURITY = 'IN:ISIN:IN0000000037';

function bankHolding(overrides: Partial<PortfolioHoldingEvidence> = {}): PortfolioHoldingEvidence {
  return {
    holdingIndex: 0,
    securityId: BANK_SECURITY,
    isin: 'IN0000000037',
    series: 'EQ',
    issuerId: BANK,
    identityState: 'RESOLVED',
    resolutionBasis: 'ISIN',
    assessable: true,
    reason: null,
    weightPercentage: 12.5,
    ...overrides,
  };
}

function bankPortfolio(holdings: readonly PortfolioHoldingEvidence[], overrides: Partial<PortfolioRevisionEvidence> = {}): PortfolioRevisionEvidence {
  return {
    portfolioId: 'pf-w11-contract',
    revision: 7,
    readSource: 'IPD_G2_IPC:v1',
    observedAt: '2026-09-30T10:00:00Z',
    ownerBindingRef: 'owner-binding:test',
    holdings,
    ...overrides,
  };
}

/** A dataset whose securities are declared, so security→issuer binding can be checked. */
function bankDatasetWithSecurities(securities: DatasetContent['securities']): DatasetContent {
  return { ...bankDataset(), securities };
}

const CLOSING = { allowClosingBalanceRatioDerivations: true } as const;

function codesOf(report: PortfolioExecutionReport): string[] {
  return report.refusals.map((refusal) => refusal.code);
}

/* ------------------------------------------------------------------ ACTUAL EVIDENCE */

describe('W11 — actual issuer evidence (Infosys dataset and identity files)', () => {
  test('the governed resolver resolves the actual holding, and the actual issuer is refused by W10 rather than executed', () => {
    const content = contentFromDir(INFOSYS_DATASET);
    const loaded = loadIdentitySourcesFromDir(INFOSYS_IDENTITY);
    assert.equal(loaded.available, true, 'the real identity files must load');

    const resolution = resolveIdentity(
      { observationId: 'holding-0', source: 'HOLDING', isin: INFOSYS_ISIN, symbol: 'INFY', exchange: 'NSE', series: 'EQ', cin: null, companyIdHint: null },
      { sources: (loaded as { sources: IdentitySources }).sources, asOf: '2024-06-30' },
    );
    assert.equal(resolution.state, 'RESOLVED');
    assert.equal(resolution.issuerId, INFOSYS_ISSUER);
    assert.equal(resolution.resolutionBasis, 'ISIN');
    assert.equal(resolution.listingId, 'IN:NSE:INFY:EQ:EQUITY');

    const holding: PortfolioHoldingEvidence = {
      holdingIndex: 0,
      securityId: resolution.securityId,
      isin: INFOSYS_ISIN,
      series: 'EQ',
      issuerId: resolution.issuerId,
      identityState: resolution.state,
      resolutionBasis: resolution.resolutionBasis,
      assessable: resolution.state === 'RESOLVED' && resolution.listingId !== null,
      reason: resolution.failure?.reason ?? null,
      weightPercentage: 100,
    };

    const report = executePortfolioEngines({
      content,
      portfolio: bankPortfolio([holding], { readSource: 'IPD_G2_IPC:v1 — actual identity + actual dataset, captured read shape' }),
      asOf: '2024-06-30',
      datasetVersion: 'sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e',
      policy: CLOSING,
    });

    assert.equal(report.executions.length, 0, 'no engine may execute on evidence that does not qualify');
    assert.deepEqual(codesOf(report), ['QUALIFICATION_NOT_QUALIFIED']);
    const refusal = report.refusals[0]!;
    assert.equal(refusal.issuerId, INFOSYS_ISSUER);
    assert.equal(refusal.engineId, 'sector.technology');
    assert.equal(refusal.qualificationState, 'NOT_QUALIFIED');

    // The exact structural blockers W10 published, on actual data.
    const blockers = new Map(refusal.fieldRefusals.map((field) => [field.field, field]));
    for (const field of ['archetype', 'evRevenue', 'fcfYield', 'grossMargin', 'rdIntensity', 'customerConcentration', 'usageGrowth']) {
      assert.equal(blockers.get(field)?.outcome, 'UNSUPPORTED', `${field} must remain unsupported`);
    }
    assert.equal(blockers.get('subsegment')?.outcome, 'SELECTOR_UNRESOLVED');
    assert.equal(blockers.get('recurringRevenuePct')?.outcome, 'MISSING');
    assert.equal(refusal.fieldRefusals.length, 11);

    // The actual dataset provenance is preserved in the report.
    assert.match(report.contentDigest, /^sha256:[0-9a-f]{64}$/);
    assert.equal(report.portfolioRevision, 7);
    assert.equal(report.holdings[0]!.outcome, 'REFUSED');
    assert.equal(report.holdings[0]!.issuerId, INFOSYS_ISSUER);
    assert.equal(report.summary.enginesExecuted.length, 0);
  });

  test('the same actual issuer is refused for staleness at a current evaluation date, not silently executed', () => {
    const content = contentFromDir(INFOSYS_DATASET);
    const report = executePortfolioEngines({
      content,
      portfolio: bankPortfolio([
        { ...bankHolding(), securityId: `IN:ISIN:${INFOSYS_ISIN}`, isin: INFOSYS_ISIN, issuerId: INFOSYS_ISSUER },
      ]),
      asOf: '2026-11-12',
      policy: CLOSING,
    });
    assert.equal(report.executions.length, 0);
    assert.deepEqual(codesOf(report), ['QUALIFICATION_NOT_QUALIFIED']);
    const stale = report.refusals[0]!.fieldRefusals.filter((field) => field.outcome === 'STALE');
    assert.ok(stale.length >= 4, 'the actual FY2024 statements are stale at 2026-11-12');
    assert.ok(stale.every((field) => field.codes.includes('FIELD_STALE')));
  });

  test('an actual-shaped unresolved holding never reaches an engine, and the stub executor proves it', () => {
    const content = contentFromDir(INFOSYS_DATASET);
    const calls: string[] = [];
    const executor: EngineExecutor = {
      execute(request) {
        calls.push(request.engineId);
        throw new Error('an engine must not run for an unresolved holding');
      },
    };
    const loaded = loadIdentitySourcesFromDir(INFOSYS_IDENTITY);
    const resolution = resolveIdentity(
      { observationId: 'holding-0', source: 'HOLDING', isin: 'INE000000000', symbol: 'NOPE', exchange: 'NSE', series: 'EQ', cin: null, companyIdHint: null },
      { sources: (loaded as { sources: IdentitySources }).sources, asOf: '2024-06-30' },
    );
    assert.notEqual(resolution.state, 'RESOLVED');

    const report = executePortfolioEngines({
      content,
      portfolio: bankPortfolio([
        {
          holdingIndex: 0,
          securityId: resolution.securityId,
          isin: 'INE000000000',
          series: 'EQ',
          issuerId: resolution.issuerId,
          identityState: resolution.state,
          resolutionBasis: resolution.resolutionBasis,
          assessable: false,
          reason: resolution.failure?.reason ?? null,
        },
      ]),
      asOf: '2024-06-30',
      executor,
    });

    assert.deepEqual(calls, []);
    assert.equal(report.executions.length, 0);
    assert.equal(report.refusals.length, 1);
    assert.equal(report.refusals[0]!.code, 'HOLDING_IDENTITY_REJECTED');
    assert.match(report.refusals[0]!.detail, /ISIN_CHECK_DIGIT_FAILED/);
  });
});

/* ------------------------------------------------------------------ SYNTHETIC CONTRACT TESTS */

describe('W11 — synthetic contract tests: compatible execution through the certified path', () => {
  test('a qualified issuer executes its own certified engine, with full lineage', () => {
    const report = executePortfolioEngines({
      content: bankDataset(),
      portfolio: bankPortfolio([bankHolding()]),
      asOf: AS_OF,
      datasetVersion: 'sha256:test-fixture-bank',
      policy: CLOSING,
    });

    assert.equal(report.schemaVersion, W11_EXECUTION_SCHEMA_VERSION);
    assert.equal(report.executions.length, 1);
    assert.equal(report.refusals.length, 0);
    const record = report.executions[0]!;

    assert.equal(record.engineId, 'sector.banking');
    assert.equal(record.ies, 'IES-006');
    assert.equal(record.engineVersion, '1.0.0');
    assert.equal(record.calibrationVersion, 'banking-calibration-1.0.0');
    assert.equal(record.issuerId, BANK);
    assert.equal(record.portfolioId, 'pf-w11-contract');
    assert.equal(record.portfolioRevision, 7);
    assert.equal(record.portfolioReadSource, 'IPD_G2_IPC:v1');
    assert.equal(record.holdingIndex, 0);
    assert.equal(record.securityId, BANK_SECURITY);
    assert.equal(record.periodEnd, FY26.periodEnd);
    assert.equal(record.statementScope, 'CONSOLIDATED');
    assert.match(record.mappingDigest, /^[0-9a-f]{64}$/);
    assert.match(record.qualificationDigest, /^sha256:[0-9a-f]{64}$/);
    assert.match(record.contentDigest, /^sha256:[0-9a-f]{64}$/);
    assert.match(record.inputDigest, /^sha256:[0-9a-f]{64}$/);
    assert.equal(record.requestId, `w11-${record.inputDigest.slice('sha256:'.length, 'sha256:'.length + 24)}`);

    // Only W10-resolved fields reach the engine.
    assert.deepEqual(Object.keys(record.inputs).sort(), ['BM-001', 'BM-002', 'BM-003', 'BM-004', 'BM-005', 'BM-006', 'BM-014', 'BM-015']);
    const nim = record.inputLineage.find((line) => line.field === 'BM-003')!;
    assert.equal(nim.value, 3.2);
    assert.equal(nim.sourceRef, `W10-TEST:BM_NIM:${FY26.periodEnd}`);
    assert.equal(nim.periodEnd, FY26.periodEnd);
    assert.equal(nim.sourceClass, 'OPERATOR_ENTERED');
    assert.equal(nim.mappingStatus, 'MAPPED');
    const roa = record.inputLineage.find((line) => line.field === 'BM-001')!;
    assert.equal(roa.basis, 'DERIVED');
    assert.match(roa.transformation, /NET_PROFIT/);

    // The decision flag has no governed source and is omitted, not fabricated.
    assert.ok(record.omittedInputs.some((omitted) => omitted.field === 'governanceFlag' && omitted.codes.includes('FIELD_DECISION_FLAG_UNSUPPORTED')));
    assert.equal('governanceFlag' in record.inputs, false);

    // Output is the frozen engine's own, produced by the certified dispatch path.
    assert.equal(record.output.state, 'COMPLETED');
    assert.equal(typeof record.output.composite, 'number');
    assert.equal(typeof record.output.verdict, 'string');
    assert.equal(record.output.provenance?.deterministic, true);
    assert.equal(record.deterministic, true);
    assert.equal(report.summary.executed, 1);
    assert.deepEqual(report.summary.enginesExecuted, ['sector.banking']);
  });

  test('the W11 output is exactly what the frozen dispatch path produces for the same inputs — the adapter adds no semantics', () => {
    const report = executePortfolioEngines({ content: bankDataset(), portfolio: bankPortfolio([bankHolding()]), asOf: AS_OF, policy: CLOSING });
    const record = report.executions[0]!;
    const direct = new EngineApiAdapter().execute({
      apiVersion: '1.0',
      engineId: record.engineId,
      requestId: record.requestId,
      inputs: { ...record.inputs },
    });
    assert.equal(record.output.composite, direct.composite);
    assert.equal(record.output.verdict, direct.verdict);
    assert.equal(record.output.snapshotRef, direct.snapshotRef);
    assert.equal(record.output.evidenceRef, direct.evidenceRef);
  });

  test('repeated execution with identical pinned inputs is byte-identical', () => {
    const run = () =>
      executePortfolioEngines({ content: bankDataset(), portfolio: bankPortfolio([bankHolding()]), asOf: AS_OF, datasetVersion: 'sha256:test-fixture-bank', policy: CLOSING });
    const first = run();
    const second = run();
    assert.equal(canonicalJson(first), canonicalJson(second));
    assert.equal(canonicalJson(first.executions[0]!.output), canonicalJson(second.executions[0]!.output));
    assert.equal(first.executions[0]!.requestId, second.executions[0]!.requestId);
  });

  test('a portfolio of two holdings of the same issuer executes both, with distinct holding lineage', () => {
    const report = executePortfolioEngines({
      content: bankDataset(),
      portfolio: bankPortfolio([bankHolding({ holdingIndex: 1 }), bankHolding({ holdingIndex: 0 })]),
      asOf: AS_OF,
      policy: CLOSING,
    });
    assert.equal(report.executions.length, 2);
    assert.deepEqual(report.executions.map((record) => record.holdingIndex), [0, 1]);
    assert.equal(report.executions[0]!.requestId, report.executions[1]!.requestId);
    assert.deepEqual(report.summary.enginesExecuted, ['sector.banking']);
    assert.equal(report.summary.issuersExecuted, 1);
  });

  test('refused holdings and executed holdings are both accounted for', () => {
    const report = executePortfolioEngines({
      content: bankDataset(),
      portfolio: bankPortfolio([
        bankHolding({ holdingIndex: 0 }),
        bankHolding({ holdingIndex: 1, issuerId: null, securityId: null, identityState: 'UNMATCHED', assessable: false, reason: 'ISIN_NOT_IN_ROSTER' }),
      ]),
      asOf: AS_OF,
      policy: CLOSING,
    });
    assert.equal(report.summary.holdings, 2);
    assert.equal(report.summary.executed, 1);
    assert.equal(report.summary.refused, 1);
    assert.deepEqual(report.holdings.map((entry) => entry.outcome), ['EXECUTED', 'REFUSED']);
    assert.deepEqual(report.holdings[1]!.codes, ['HOLDING_IDENTITY_UNRESOLVED']);
  });
});

describe('W11 — synthetic contract tests: fail-closed inputs', () => {
  const runWith = (overrides: { metrics?: typeof BANK_METRICS; asOf?: string; holding?: Partial<PortfolioHoldingEvidence>; content?: DatasetContent }) =>
    executePortfolioEngines({
      content: overrides.content ?? bankDataset({ metrics: overrides.metrics }),
      portfolio: bankPortfolio([bankHolding(overrides.holding)]),
      asOf: overrides.asOf ?? AS_OF,
      policy: CLOSING,
    });

  test('a missing required input refuses and the engine never runs', () => {
    const calls: string[] = [];
    const report = executePortfolioEngines({
      content: bankDataset({ metrics: BANK_METRICS.filter((record) => record.metricId !== 'BM_NIM') }),
      portfolio: bankPortfolio([bankHolding()]),
      asOf: AS_OF,
      policy: CLOSING,
      executor: { execute: (request) => { calls.push(request.engineId); throw new Error('must not run'); } },
    });
    assert.deepEqual(calls, []);
    assert.deepEqual(codesOf(report), ['QUALIFICATION_NOT_QUALIFIED']);
    const refusal = report.refusals[0]!;
    assert.equal(refusal.fieldRefusals.length, 1);
    assert.equal(refusal.fieldRefusals[0]!.field, 'BM-003');
    assert.deepEqual(refusal.fieldRefusals[0]!.codes, ['FIELD_METRIC_ABSENT']);
  });

  test('stale statements refuse at a later evaluation date', () => {
    const report = runWith({ asOf: '2026-11-12' });
    assert.equal(report.executions.length, 0);
    assert.deepEqual(codesOf(report), ['QUALIFICATION_NOT_QUALIFIED']);
    assert.ok(report.refusals[0]!.fieldRefusals.every((field) => field.codes.includes('FIELD_STALE')));
  });

  test('partial evidence (two inputs dropped) refuses', () => {
    const report = runWith({ metrics: BANK_METRICS.filter((record) => record.metricId !== 'BM_NIM' && record.metricId !== 'BM_CASA') });
    assert.equal(report.executions.length, 0);
    assert.equal(report.refusals[0]!.fieldRefusals.length, 2);
  });

  test('conflicting evidence (NNPA above GNPA) refuses with the cross-field code', () => {
    const metrics = BANK_METRICS.map((record) =>
      record.metricId === 'BM_NNPA' ? metricRecord({ issuerId: BANK, metricId: 'BM_NNPA', value: 4.2, periodEnd: FY26.periodEnd }) : record,
    );
    const report = runWith({ metrics });
    assert.equal(report.executions.length, 0);
    const refusal = report.refusals[0]!;
    const nnpa = refusal.fieldRefusals.find((field) => field.field === 'BM-006')!;
    assert.ok(nnpa.codes.includes('FIELD_CROSS_FIELD_VIOLATION'));
  });

  test('an invalid input (unit mismatch) refuses with its own code', () => {
    const metrics = BANK_METRICS.map((record) =>
      record.metricId === 'BM_NIM' ? metricRecord({ issuerId: BANK, metricId: 'BM_NIM', value: 3.2, periodEnd: FY26.periodEnd, unit: 'INR_CRORE' as never }) : record,
    );
    const report = runWith({ metrics });
    assert.equal(report.executions.length, 0);
    assert.deepEqual(report.refusals[0]!.fieldRefusals[0]!.codes, ['FIELD_UNIT_MISMATCH']);
  });

  test('an issuer absent from the dataset refuses before qualification', () => {
    const report = runWith({ holding: { issuerId: 'IN:EQISIN:IN0000000099' } });
    assert.deepEqual(codesOf(report), ['ISSUER_NOT_IN_DATASET']);
  });

  test('a holding whose identity is ambiguous is refused, never chosen between', () => {
    const report = runWith({ holding: { identityState: 'AMBIGUOUS_LISTING', issuerId: null, securityId: null, assessable: false } });
    assert.deepEqual(codesOf(report), ['HOLDING_IDENTITY_AMBIGUOUS']);
  });

  test('a holding with resolved identity but no assessable listing is refused', () => {
    const report = runWith({ holding: { assessable: false } });
    assert.deepEqual(codesOf(report), ['HOLDING_NOT_ASSESSABLE']);
  });

  test('a security the dataset does not declare is refused when the dataset declares securities', () => {
    const content = bankDatasetWithSecurities([
      { securityId: 'IN:ISIN:IN0000000011', issuerId: 'IN:EQISIN:IN0000000011', instrumentType: 'EQUITY', status: 'ASSESSABLE', statusReason: null },
    ]);
    const report = runWith({ content });
    assert.deepEqual(codesOf(report), ['SECURITY_NOT_IN_DATASET']);
  });

  test('a security bound to a different issuer is refused', () => {
    const content = bankDatasetWithSecurities([
      { securityId: BANK_SECURITY, issuerId: 'IN:EQISIN:IN0000000011', instrumentType: 'EQUITY', status: 'ASSESSABLE', statusReason: null },
    ]);
    const report = runWith({ content });
    assert.deepEqual(codesOf(report), ['SECURITY_ISSUER_MISMATCH']);
  });

  test('an engine that is not the issuer’s certified engine refuses rather than running', () => {
    const plan = prepareEngineExecution({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, engineId: 'sector.technology', policy: CLOSING });
    assert.equal(plan.kind, 'REFUSED');
    if (plan.kind !== 'REFUSED') return;
    assert.equal(plan.refusal.code, 'ENGINE_NOT_APPLICABLE');
  });

  test('an uncertified engine id refuses', () => {
    const plan = prepareEngineExecution({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, engineId: 'sector.spaceship' });
    assert.equal(plan.kind, 'REFUSED');
    if (plan.kind !== 'REFUSED') return;
    assert.equal(plan.refusal.code, 'ENGINE_NOT_CERTIFIED');
  });

  test('a sector with no certified engine refuses', () => {
    const content = dataset({
      issuers: [issuer({ issuerId: BANK, legalName: 'Unmapped Sector Ltd (synthetic)', sector: 'Telecom', subSegment: null })],
      periods: BANK_PERIODS,
    });
    const report = executePortfolioEngines({ content, portfolio: bankPortfolio([bankHolding({ securityId: BANK_SECURITY })]), asOf: AS_OF });
    assert.equal(report.executions.length, 0);
    assert.equal(report.refusals.length, 1);
    assert.ok(['NO_ENGINE_FOR_SECTOR', 'QUALIFICATION_NOT_QUALIFIED'].includes(report.refusals[0]!.code));
  });
});

describe('W11 — synthetic contract tests: portfolio revision and provenance binding', () => {
  const base = () => ({ content: bankDataset(), asOf: AS_OF, policy: CLOSING });

  test('a non-positive or non-integer revision refuses', () => {
    for (const revision of [0, -1, 1.5, Number.NaN]) {
      const report = executePortfolioEngines({ ...base(), portfolio: bankPortfolio([bankHolding()], { revision }) });
      assert.deepEqual(codesOf(report), ['PORTFOLIO_REVISION_INVALID'], `revision ${revision}`);
      assert.equal(report.executions.length, 0);
    }
  });

  test('a caller pinned to another revision is refused rather than silently analysing a different one', () => {
    const report = executePortfolioEngines({ ...base(), portfolio: bankPortfolio([bankHolding()], { revision: 8 }), expectedRevision: 7 });
    assert.deepEqual(codesOf(report), ['PORTFOLIO_REVISION_MISMATCH']);
    assert.equal(report.executions.length, 0);
  });

  test('a matching expectedRevision executes and is recorded', () => {
    const report = executePortfolioEngines({ ...base(), portfolio: bankPortfolio([bankHolding()]), expectedRevision: 7 });
    assert.equal(report.executions.length, 1);
    assert.equal(report.expectedRevision, 7);
    assert.equal(report.portfolioRevision, 7);
  });

  test('a missing read source or observation time refuses', () => {
    for (const portfolio of [
      bankPortfolio([bankHolding()], { readSource: '  ' }),
      bankPortfolio([bankHolding()], { observedAt: 'yesterday' }),
      bankPortfolio([bankHolding()], { portfolioId: '' }),
    ]) {
      const report = executePortfolioEngines({ ...base(), portfolio });
      assert.deepEqual(codesOf(report), ['PORTFOLIO_PROVENANCE_UNVERIFIED']);
    }
  });

  test('a pinned dataset digest that does not match the content read refuses', () => {
    const report = executePortfolioEngines({ ...base(), portfolio: bankPortfolio([bankHolding()]), expectedDatasetDigest: 'sha256:' + '0'.repeat(64) });
    assert.deepEqual(codesOf(report), ['DATASET_DIGEST_MISMATCH']);
  });

  test('an empty portfolio revision refuses explicitly', () => {
    const report = executePortfolioEngines({ ...base(), portfolio: bankPortfolio([]) });
    assert.deepEqual(codesOf(report), ['PORTFOLIO_EMPTY']);
    assert.equal(report.summary.holdings, 0);
  });

  test('the report records the revision it actually executed against', () => {
    const report = executePortfolioEngines({ ...base(), portfolio: bankPortfolio([bankHolding()], { revision: 12, observedAt: '2026-09-30T09:15:00Z' }) });
    assert.equal(report.portfolioRevision, 12);
    assert.equal(report.portfolioObservedAt, '2026-09-30T09:15:00Z');
    assert.equal(report.executions[0]!.portfolioRevision, 12);
    assert.equal(report.executions[0]!.portfolioObservedAt, '2026-09-30T09:15:00Z');
  });
});

describe('W11 — no fabricated score, verdict or approval', () => {
  test('a refusal carries no composite, verdict or recommendation, and a refusal is never converted into one', () => {
    const report = executePortfolioEngines({
      content: bankDataset({ metrics: BANK_METRICS.filter((record) => record.metricId !== 'BM_NIM') }),
      portfolio: bankPortfolio([bankHolding()]),
      asOf: AS_OF,
      policy: CLOSING,
    });
    const refusal = report.refusals[0]!;
    assert.equal('composite' in refusal, false);
    assert.equal('verdict' in refusal, false);
    const serialised = canonicalJson(report);
    assert.equal(serialised.includes('"recommendation"'), false);
    assert.equal(serialised.includes('"rank"'), false);
    assert.equal(serialised.includes('"approval"'), false);
    assert.equal(serialised.includes('"targetPrice"'), false);
    assert.equal(report.executions.length, 0);
  });

  test('an executed record attributes its output to the frozen engine, not to IRR', () => {
    const report = executePortfolioEngines({ content: bankDataset(), portfolio: bankPortfolio([bankHolding()]), asOf: AS_OF, policy: CLOSING });
    const record = report.executions[0]!;
    assert.equal(record.output.provenance?.engineId, 'sector.banking');
    assert.equal(record.output.provenance?.calibrationProfile, 'banking-calibration-1.0.0');
    assert.equal(report.note.includes('Compatible execution only'), true);
    assert.ok(report.limitations.some((line) => /adds no score, rank, recommendation or issuer approval/.test(line)));
    assert.ok(report.limitations.some((line) => /62 required inputs lack authorised sources/.test(line)));
  });

  test('the shipped executor is the certified dispatch adapter, not a W11 reimplementation', () => {
    const executor = certifiedEngineExecutor();
    const out = executor.execute({
      engineId: 'sector.banking',
      requestId: 'w11-direct-executor-check',
      inputs: { 'BM-001': 1, 'BM-002': 12, 'BM-003': 3.2, 'BM-004': 40, 'BM-005': 2.5, 'BM-006': 0.8, 'BM-014': 12, 'BM-015': 16 },
    });
    assert.equal(out.state, 'COMPLETED');
    assert.equal(out.provenance?.deterministic, true);
  });
});
