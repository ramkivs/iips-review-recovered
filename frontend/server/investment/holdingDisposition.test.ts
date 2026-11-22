/**
 * IID Stage 6 — S6-1b: a disposition for an ACTUAL persisted holding, exercised on FIXTURES.
 *
 * What these tests are, and are not. The portfolio view here is a FIXTURE that stands where the IPC read channel
 * delivers the real view; the assessment is the REAL M-1 assembly persisted through the REAL artifact service; the
 * identity sources are the M-1 identity files; the engine, the limits loader, the portfolio context and the
 * record path are the production code. None of this is a verification against the operator's own persisted
 * holdings — that is host-side work the S6-1b record lists as outstanding.
 *
 * The suite runs against every port available in the process:
 *   · the in-memory stand-in (`np04StandInPortFixture.ts`) — always, so the suite executes where the pinned
 *     NP-04 package is not installable;
 *   · the REAL governed store (`iips-np04-governed-persistence`) — whenever the package resolves (CI). Only
 *     this run is evidence that persistence and duplicate protection hold on the authoritative store.
 *
 * Required cases (S6-1b authorisation §6):
 *   1 a persisted holding is selectable and processed        7 an invalid policy fails closed, nothing written
 *   2 issuer/security identity is preserved                   8 missing assessment / unresolved identity block it
 *   3 the actual path receives the resolved limits            9 a persistence failure is reported accurately
 *   4 OPERATOR_CONFIG is recorded                            10 repeated execution creates no duplicate version
 *   5 the exact policyVersion is recorded                    11 the synthetic demonstration is untouched
 *   6 a missing policy yields SYSTEM_DEFAULT                     (its own suite, unchanged by this work)
 *
 * @vitest-environment node
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loadIdentitySourcesFromDir } from '../../../iips-platform/src/investment/identity/sources';
import { LIMITS_POLICY_VERSION } from '../../../iips-platform/src/investment/disposition/types';
import { REPORTS_OWNER_PATH_ENV, resolveReportsOwnerContext } from '../reports-owner-resolver';
import type { G2HoldingView, G2PortfolioView } from '../user-portfolio/userPortfolioContract';
import { M1_NOW, assembleAssessment, prepareM1Environment } from './demo/m1Pipeline';
import { M1_ISIN, M1_ISSUER_ID, M1_SECURITY_ID, M1_SYMBOL, writeM1IdentityDir } from './demo/m1Data';
import { createDispositionRecordsService } from './dispositionService';
import {
  HoldingDispositionFailure,
  detectHardTrigger,
  generateHoldingDisposition,
  parseHoldingSelector,
  securityStateFromListing,
  selectHolding,
  type GenerateHoldingDispositionDeps,
} from './holdingDisposition';
import { createInvestmentArtifactService } from './investmentArtifacts';
import { loadOperatorLimitsPolicy, resolveLimitsPolicyPath } from './limitsPolicySource';
import { Np04StandInPort } from './np04StandInPortFixture';
import { runCli, summaryLines } from './cli/generate-holding-disposition';

// ---------------------------------------------------------------------------------------------------------------
// Shared fixtures: one M-1 environment, one assessment assembly per dataset version, one owner.
// ---------------------------------------------------------------------------------------------------------------
const env = prepareM1Environment();
const V1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const V2 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV2Dir, generatedAt: '2026-11-07T00:00:00.000Z' });
const ownerContext = resolveReportsOwnerContext({ [REPORTS_OWNER_PATH_ENV]: env.carrierPath });
if (ownerContext === null) throw new Error('fixture carrier did not resolve an owner context');
const OWNER = { tenantId: ownerContext.tenantId, userId: ownerContext.ownerUserId } as const;
const PORTFOLIO_ID = 'pf-s6-1b-fixture';
const RUN_AT = '2026-11-22T06:00:00.000Z';

const loadIdentitySources = () => loadIdentitySourcesFromDir(env.identityDir);

/** A data root laid out as the runtime expects (`investment/identity`, `investment/policies`). */
function dataRoot(name: string, policy: string | null): string {
  const root = join(env.root, 'roots', name);
  writeM1IdentityDir(join(root, 'investment', 'identity'));
  if (policy !== null) {
    const path = resolveLimitsPolicyPath(root, {});
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, policy, 'utf8');
  }
  return root;
}

const OPERATOR_POLICY = {
  policyVersion: 'limits-policy/s6-1b-fixture',
  effectiveFrom: '2026-11-01',
  singleNameMaxPct: 8,
  sectorMaxPct: { DEFAULT: 25, Technology: 20 },
};
const OPERATOR_ROOT = dataRoot('operator', JSON.stringify(OPERATOR_POLICY));
const ABSENT_ROOT = dataRoot('absent', null);
const INVALID_ROOT = dataRoot('invalid', '{ "policyVersion": "x", "effectiveFrom": "2026-11-01", "singleNameMaxPct": 8, "sectorMaxPcts": {} }');

function heldRow(overrides: Partial<G2HoldingView> = {}): G2HoldingView {
  return {
    symbol: M1_SYMBOL,
    companyId: 'company-m1',
    isin: M1_ISIN,
    exchange: 'NSE',
    quantity: 250,
    averageBuyPrice: 2000,
    currentPrice: 2500,
    marketValue: 625_000,
    weightPercentage: 25,
    active: true,
    sourceBroker: 'fixture-broker',
    lineageDigest: 'f'.repeat(64),
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    ...overrides,
  };
}

function unresolvedRow(): G2HoldingView {
  return {
    symbol: 'NOWHERE',
    companyId: 'company-unknown',
    exchange: 'NSE',
    quantity: 10,
    averageBuyPrice: 100,
    currentPrice: 110,
    marketValue: 1_100,
    weightPercentage: 75,
    active: true,
    sourceBroker: 'fixture-broker',
    lineageDigest: 'e'.repeat(64),
    identityStatus: 'UNRESOLVED',
  };
}

function viewOf(holdings: readonly G2HoldingView[], revision = 11): G2PortfolioView {
  return {
    portfolioId: PORTFOLIO_ID,
    portfolioName: 'S6-1b fixture portfolio',
    revision,
    holdings,
    totalMarketValue: holdings.reduce((sum, row) => sum + row.marketValue, 0),
    totalHoldingsCount: holdings.length,
    weightSumPercentage: holdings.reduce((sum, row) => sum + row.weightPercentage, 0),
    lastUpdated: '2026-11-21T10:00:00.000Z',
    provenanceDigest: 'd'.repeat(64),
    isSaved: true,
    contributions: [],
  };
}

const STANDARD_VIEW = viewOf([heldRow(), unresolvedRow()]);

// ---------------------------------------------------------------------------------------------------------------
// Ports: the stand-in always; the real governed store when the package resolves.
// ---------------------------------------------------------------------------------------------------------------
interface PortCase {
  readonly label: string;
  readonly open: (name: string) => { readonly port: unknown; readonly close: () => void };
}

const standInCase: PortCase = {
  label: 'in-memory stand-in port',
  open: () => ({ port: new Np04StandInPort(), close: () => undefined }),
};

const realCase: PortCase | null = await (async () => {
  const specifier = ['iips-np04-governed-persistence', 'persistence'].join('/');
  try {
    const mod = (await import(/* @vite-ignore */ specifier)) as {
      openDatabase: (options: { path: string; createDirectory: boolean; migrate: boolean }) => { close?: () => void };
      GovernedArtifactStore: new (database: unknown) => unknown;
    };
    const { adaptNp04Store } = await import('../reports/np04-adapter');
    return {
      label: 'REAL governed store (iips-np04-governed-persistence)',
      open: (name: string) => {
        const database = mod.openDatabase({ path: join(env.root, 'stores', `${name}.db`), createDirectory: true, migrate: true });
        return { port: adaptNp04Store(new mod.GovernedArtifactStore(database)), close: () => database.close?.() };
      },
    };
  } catch {
    return null;
  }
})();

const portCases: readonly PortCase[] = realCase === null ? [standInCase] : [standInCase, realCase];

const opened: { close: () => void }[] = [];
afterAll(() => {
  for (const handle of opened) handle.close();
  rmSync(env.root, { recursive: true, force: true });
});

function openWith(portCase: PortCase, name: string, options: { readonly assessment?: boolean } = {}): unknown {
  const handle = portCase.open(name);
  opened.push(handle);
  if (options.assessment !== false) {
    createInvestmentArtifactService({ port: handle.port, owner: OWNER }).recordAssessment(V1.composed);
  }
  return handle.port;
}

function depsFor(port: unknown, root: string, view: G2PortfolioView = STANDARD_VIEW): GenerateHoldingDispositionDeps {
  return {
    loadPortfolioView: async (portfolioId) => {
      if (portfolioId !== view.portfolioId) throw new Error(`fixture: unknown portfolio ${portfolioId}`);
      return view;
    },
    loadIdentitySources,
    loadLimitsPolicy: (asOf) => loadOperatorLimitsPolicy({ asOf, dataRoot: root }),
    port,
    owner: OWNER,
  };
}

async function failureOf(run: Promise<unknown>): Promise<HoldingDispositionFailure> {
  try {
    await run;
  } catch (error) {
    if (error instanceof HoldingDispositionFailure) return error;
    throw error;
  }
  throw new Error('expected the run to stop');
}

// ---------------------------------------------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------------------------------------------
describe('S6-1b — holding selection', () => {
  it('parses the selector forms and rejects an empty or malformed one', () => {
    expect(parseHoldingSelector('symbol:infy')).toEqual({ kind: 'SYMBOL', value: 'INFY' });
    expect(parseHoldingSelector('isin:ine009a01021')).toEqual({ kind: 'ISIN', value: 'INE009A01021' });
    expect(parseHoldingSelector('index:2')).toEqual({ kind: 'INDEX', value: 2 });
    expect(parseHoldingSelector(M1_SYMBOL)).toEqual({ kind: 'ANY', value: M1_SYMBOL });
    expect(() => parseHoldingSelector('  ')).toThrow(HoldingDispositionFailure);
    expect(() => parseHoldingSelector('index:-1')).toThrow(HoldingDispositionFailure);
  });

  it('selects exactly one active holding by symbol, ISIN, prefixed ISIN or index', () => {
    expect(selectHolding(STANDARD_VIEW, parseHoldingSelector(`symbol:${M1_SYMBOL}`)).index).toBe(0);
    expect(selectHolding(STANDARD_VIEW, parseHoldingSelector(`isin:${M1_ISIN}`)).index).toBe(0);
    expect(selectHolding(STANDARD_VIEW, parseHoldingSelector(`isin:${M1_SECURITY_ID}`)).index).toBe(0);
    expect(selectHolding(STANDARD_VIEW, parseHoldingSelector('index:1')).holding.symbol).toBe('NOWHERE');
  });

  it('stops on no match, on an inactive match, and on an ambiguous match — never picks for the operator', () => {
    expect(() => selectHolding(STANDARD_VIEW, parseHoldingSelector('symbol:ABSENT'))).toThrow(/no holding/);
    const inactive = viewOf([heldRow({ active: false })]);
    const inactiveFailure = (() => {
      try {
        selectHolding(inactive, parseHoldingSelector(M1_SYMBOL));
      } catch (error) {
        return error as HoldingDispositionFailure;
      }
      return null;
    })();
    expect(inactiveFailure?.code).toBe('HOLDING_INACTIVE');
    const twice = viewOf([heldRow(), heldRow({ sourceBroker: 'second-broker' })]);
    expect(() => selectHolding(twice, parseHoldingSelector(M1_SYMBOL))).toThrow(/more than one/);
  });

  it('derives ACTIVE only from a listing window that covers asOf; otherwise UNKNOWN', () => {
    const loaded = loadIdentitySources();
    if (!loaded.available) throw new Error('fixture identity sources unavailable');
    expect(securityStateFromListing(loaded.sources, 'IN:NSE:AARAVSYN:EQ:EQUITY', '2026-11-22')).toMatchObject({ state: 'ACTIVE', exchange: 'NSE', instrumentType: 'EQUITY' });
    expect(securityStateFromListing(loaded.sources, 'IN:NSE:AARAVSYN:EQ:EQUITY', '2019-01-01').state).toBe('UNKNOWN');
    expect(securityStateFromListing(loaded.sources, 'IN:NSE:NOPE:EQ:EQUITY', '2026-11-22').state).toBe('UNKNOWN');
    expect(securityStateFromListing(loaded.sources, null, '2026-11-22').state).toBe('UNKNOWN');
  });

  it('hard trigger: no previous ⇒ false; an adequacy, quality, moat or identity change ⇒ true with the reason named', () => {
    const ref = (overrides: Record<string, string>) =>
      ({ adequacy: 'SUFFICIENT', qualityVerdict: 'ACCEPTABLE', moatClassification: 'NARROW', ...overrides }) as never;
    const previous = (overrides: Record<string, string> = {}, subject = { issuerId: 'a', securityId: 'b' }) =>
      ({ companyAssessmentRef: ref(overrides), subject }) as never;
    expect(detectHardTrigger(null, { ref: ref({}), issuerId: 'a', securityId: 'b' })).toEqual({ hardTrigger: false, reasons: [] });
    expect(detectHardTrigger(previous(), { ref: ref({}), issuerId: 'a', securityId: 'b' })).toEqual({ hardTrigger: false, reasons: [] });
    expect(detectHardTrigger(previous(), { ref: ref({ adequacy: 'PARTIAL' }), issuerId: 'a', securityId: 'b' })).toEqual({
      hardTrigger: true,
      reasons: ['adequacy SUFFICIENT → PARTIAL'],
    });
    expect(detectHardTrigger(previous(), { ref: ref({ qualityVerdict: 'WEAK' }), issuerId: 'a', securityId: 'b' }).reasons).toEqual(['quality ACCEPTABLE → WEAK']);
    expect(detectHardTrigger(previous(), { ref: ref({ moatClassification: 'NONE' }), issuerId: 'a', securityId: 'b' }).reasons).toEqual(['moat NARROW → NONE']);
    expect(detectHardTrigger(previous({}, { issuerId: 'other', securityId: 'b' }), { ref: ref({}), issuerId: 'a', securityId: 'b' }).reasons).toEqual(['subject identity changed']);
  });
});

// ---------------------------------------------------------------------------------------------------------------
// The run, per port
// ---------------------------------------------------------------------------------------------------------------
describe.each(portCases)('S6-1b — generateHoldingDisposition over the $label', (portCase) => {
  it('[1][2] processes the selected persisted holding and preserves its resolved issuer/security identity', async () => {
    const port = openWith(portCase, 'select');
    const report = await generateHoldingDisposition(
      { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(`symbol:${M1_SYMBOL}`), generatedAt: RUN_AT },
      depsFor(port, ABSENT_ROOT),
    );
    expect(report.status).toBe('RECORDED');
    expect(report.holding).toMatchObject({ index: 0, symbol: M1_SYMBOL, isin: M1_ISIN, exchange: 'NSE', quantity: 250, weightPercentage: 25, sourceBroker: 'fixture-broker' });
    expect(report.identity).toMatchObject({ state: 'RESOLVED', issuerId: M1_ISSUER_ID, securityId: M1_SECURITY_ID, listingId: 'IN:NSE:AARAVSYN:EQ:EQUITY', securityState: 'ACTIVE' });
    // The payload cites the holding's identity and the persisted assessment it rested on — nothing else.
    expect(report.payload.subject).toMatchObject({ kind: 'HELD', issuerId: M1_ISSUER_ID, securityId: M1_SECURITY_ID, symbol: M1_SYMBOL, exchange: 'NSE', securityState: 'ACTIVE' });
    expect(report.disposition.scopeToken).toBe(`hd:${PORTFOLIO_ID}/${M1_SECURITY_ID}`);
    expect(report.disposition.subjectScope).toBe(report.payload.artifact.subjectScope);
    expect(report.assessment.reportId).toBe(report.payload.companyAssessmentRef.reportId);
    expect(report.assessment.artifactVersion).toBe(1);
    expect(report.assessment.datasetClass).toBe('SYNTHETIC_REFERENCE');
    // Position facts are the row's, with their source named; nothing was imputed.
    expect(report.payload.subject.kind === 'HELD' && report.payload.subject.quantities.quantity.value).toBe(250);
    expect(report.payload.subject.kind === 'HELD' && report.payload.subject.quantities.unrealisedGainPct.value).toBe(25);
    expect(report.payload.portfolioContext?.weightPct.value).toBe(25);
    expect(report.payload.portfolioContext?.holdingsUnresolved).toBe(1);
    // Persistence through the one existing write path.
    expect(report.persistence).toMatchObject({ outcome: 'CREATED', wrote: true, headArtifactVersion: 1, versionCount: 1 });
    const stored = createDispositionRecordsService({ port, owner: OWNER }).readHolding(PORTFOLIO_ID, M1_SECURITY_ID);
    expect(stored.version.reportId).toBe(report.persistence?.headReportId);
    expect(stored.payload.subject.issuerId).toBe(M1_ISSUER_ID);
    expect(stored.payload.interpretation.noExecutionPath).toBe(true);
  });

  it('[3][4][5] the resolved operator limits reach the actual path and are recorded with basis OPERATOR_CONFIG and the exact policyVersion', async () => {
    const port = openWith(portCase, 'operator');
    const report = await generateHoldingDisposition(
      { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(`isin:${M1_ISIN}`), generatedAt: RUN_AT },
      depsFor(port, OPERATOR_ROOT),
    );
    expect(report.limits).toMatchObject({ basis: 'OPERATOR_CONFIG', policyVersion: OPERATOR_POLICY.policyVersion, singleNameMaxPct: 8, defaultSectorMaxPct: 25 });
    expect(report.limits.source).toEqual({ kind: 'OPERATOR_FILE', path: resolveLimitsPolicyPath(OPERATOR_ROOT, {}) });
    // What the ENGINE carried, and what the STORE holds, both say the same.
    expect(report.payload.limits).toMatchObject({ basis: 'OPERATOR_CONFIG', policyVersion: OPERATOR_POLICY.policyVersion, singleNameMaxPct: 8 });
    expect(report.payload.limits.sectorMaxPct).toMatchObject({ Technology: 20 });
    expect(report.disposition).toMatchObject({ limitsBasis: 'OPERATOR_CONFIG', limitsPolicyVersion: OPERATOR_POLICY.policyVersion });
    const stored = createDispositionRecordsService({ port, owner: OWNER }).readHolding(PORTFOLIO_ID, M1_SECURITY_ID);
    expect(stored.payload.limits.basis).toBe('OPERATOR_CONFIG');
    expect(stored.payload.limits.policyVersion).toBe(OPERATOR_POLICY.policyVersion);
    // A 25% position against an 8% operator cap is a named single-name breach in the payload's limit record.
    expect(stored.payload.limits.applied.some((entry) => entry.limitId === 'SINGLE_NAME_MAX' && entry.capPct === 8 && entry.basis === 'OPERATOR_CONFIG')).toBe(true);
  });

  it('[6] with no policy at the documented path the run proceeds on labelled system defaults', async () => {
    const port = openWith(portCase, 'defaults');
    const report = await generateHoldingDisposition(
      { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector('index:0'), generatedAt: RUN_AT },
      depsFor(port, ABSENT_ROOT),
    );
    expect(report.limits.basis).toBe('SYSTEM_DEFAULT');
    expect(report.limits.policyVersion).toBe(`${LIMITS_POLICY_VERSION}+system-default`);
    expect(report.limits.source.kind).toBe('ABSENT');
    expect(report.payload.limits.basis).toBe('SYSTEM_DEFAULT');
    expect(report.payload.limits.notes.join(' ')).toMatch(/no operator limits policy is configured/);
  });

  it('[7] an invalid policy stops the run before the portfolio or the store is consulted, and nothing is written', async () => {
    const port = openWith(portCase, 'invalid');
    let portfolioReads = 0;
    const deps = depsFor(port, INVALID_ROOT);
    const failure = await failureOf(
      generateHoldingDisposition(
        { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(M1_SYMBOL), generatedAt: RUN_AT },
        { ...deps, loadPortfolioView: async (id) => { portfolioReads += 1; return deps.loadPortfolioView(id); } },
      ),
    );
    expect(failure.code).toBe('POLICY_INVALID');
    expect(failure.detail.reason).toBe('UNKNOWN_KEY');
    expect(portfolioReads).toBe(0);
    expect(() => createDispositionRecordsService({ port, owner: OWNER }).readHolding(PORTFOLIO_ID, M1_SECURITY_ID)).toThrow(/no artifact chain/);
  });

  it('[8a] a holding whose identity does not resolve blocks generation; no substitute identity is used', async () => {
    const port = openWith(portCase, 'unresolved');
    const failure = await failureOf(
      generateHoldingDisposition(
        { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector('symbol:NOWHERE'), generatedAt: RUN_AT },
        depsFor(port, ABSENT_ROOT),
      ),
    );
    expect(failure.code).toBe('IDENTITY_UNRESOLVED');
    expect(failure.detail.state).not.toBe('RESOLVED');
    expect(failure.detail.symbol).toBe('NOWHERE');
  });

  it('[8b] a resolved holding with no persisted assessment blocks generation; no assessment is created', async () => {
    const port = openWith(portCase, 'no-assessment', { assessment: false });
    const failure = await failureOf(
      generateHoldingDisposition(
        { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(M1_SYMBOL), generatedAt: RUN_AT },
        depsFor(port, OPERATOR_ROOT),
      ),
    );
    expect(failure.code).toBe('ASSESSMENT_UNAVAILABLE');
    expect(failure.detail).toMatchObject({ issuerId: M1_ISSUER_ID, scopeToken: `co:${M1_ISSUER_ID}` });
    const artifacts = createInvestmentArtifactService({ port, owner: OWNER });
    expect(artifacts.inventory('investment.company-assessment')).toHaveLength(0);
    expect(artifacts.inventory('investment.holding-disposition')).toHaveLength(0);
  });

  it('[8c] an unreadable portfolio and an unknown portfolio id both stop the run before any write', async () => {
    const port = openWith(portCase, 'portfolio-unavailable');
    const deps = depsFor(port, ABSENT_ROOT);
    const unavailable = await failureOf(
      generateHoldingDisposition(
        { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(M1_SYMBOL), generatedAt: RUN_AT },
        { ...deps, loadPortfolioView: async () => { throw new Error('socket refused'); } },
      ),
    );
    expect(unavailable.code).toBe('PORTFOLIO_UNAVAILABLE');
    const unknown = await failureOf(
      generateHoldingDisposition({ portfolioId: 'pf-other', holding: parseHoldingSelector(M1_SYMBOL), generatedAt: RUN_AT }, deps),
    );
    expect(unknown.code).toBe('PORTFOLIO_UNAVAILABLE');
    expect(createInvestmentArtifactService({ port, owner: OWNER }).inventory('investment.holding-disposition')).toHaveLength(0);
  });

  it('[10] repeated execution writes no second version; a NEW assessment version appends to the SAME chain', async () => {
    const port = openWith(portCase, 'repeat');
    const first = await generateHoldingDisposition(
      { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(M1_SYMBOL), generatedAt: RUN_AT },
      depsFor(port, OPERATOR_ROOT),
    );
    expect(first.persistence).toMatchObject({ outcome: 'CREATED', wrote: true, versionCount: 1 });

    // Same holding, same assessment, same limits, LATER clock: substantive identity is unchanged ⇒ no write.
    const again = await generateHoldingDisposition(
      { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(M1_SYMBOL), generatedAt: '2026-11-23T06:00:00.000Z' },
      depsFor(port, OPERATOR_ROOT),
    );
    expect(again.status).toBe('UNCHANGED');
    expect(again.persistence?.wrote).toBe(false);
    expect(['UNCHANGED', 'CLOCK_ONLY_UNCHANGED']).toContain(again.persistence?.outcome);
    expect(again.persistence).toMatchObject({ versionCount: 1, headReportId: first.persistence?.headReportId, writtenReportId: null });
    expect(again.previous).toMatchObject({ reportId: first.persistence?.headReportId, artifactVersion: 1 });

    // A second ASSESSMENT version (v2 dataset) is a changed input: the disposition appends, on the same chain.
    createInvestmentArtifactService({ port, owner: OWNER }).recordAssessment(V2.composed);
    const afterV2 = await generateHoldingDisposition(
      { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(M1_SYMBOL), generatedAt: '2026-11-24T06:00:00.000Z' },
      depsFor(port, OPERATOR_ROOT),
    );
    expect(afterV2.assessment.artifactVersion).toBe(2);
    expect(afterV2.assessment.versionCount).toBe(2);
    expect(afterV2.persistence?.reportKey).toBe(first.persistence?.reportKey);
    expect(afterV2.persistence).toMatchObject({ outcome: 'APPENDED', wrote: true, versionCount: 2, headArtifactVersion: 2 });
    expect(createDispositionRecordsService({ port, owner: OWNER }).listPortfolio(PORTFOLIO_ID)).toHaveLength(1);
  });

  it('[3′] FINDING — a changed limits policy changes the chain identity: the run stops with CHAIN_PARAMETERS_DRIFT and writes nothing', async () => {
    // IID-4 makes `limitsPolicyVersion` and `limitsBasis` STABLE PARAMETERS of the disposition chain (part of its
    // reportKey). A head recorded on system defaults therefore cannot be superseded under an operator policy on the
    // same chain. S6-1b detects that before any write; the resolution is an IID-4 design decision, not this command's.
    const port = openWith(portCase, 'policy-change');
    const onDefaults = await generateHoldingDisposition(
      { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(M1_SYMBOL), generatedAt: RUN_AT },
      depsFor(port, ABSENT_ROOT),
    );
    expect(onDefaults.payload.limits.basis).toBe('SYSTEM_DEFAULT');
    const failure = await failureOf(
      generateHoldingDisposition(
        { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(M1_SYMBOL), generatedAt: '2026-11-23T06:00:00.000Z' },
        depsFor(port, OPERATOR_ROOT),
      ),
    );
    expect(failure.code).toBe('CHAIN_PARAMETERS_DRIFT');
    expect(failure.detail.headReportId).toBe(onDefaults.persistence?.headReportId);
    expect(failure.detail.drifted).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ parameter: 'limitsPolicyVersion', next: OPERATOR_POLICY.policyVersion }),
        expect.objectContaining({ parameter: 'limitsBasis', head: 'SYSTEM_DEFAULT', next: 'OPERATOR_CONFIG' }),
      ]),
    );
    const stored = createDispositionRecordsService({ port, owner: OWNER }).readHolding(PORTFOLIO_ID, M1_SECURITY_ID);
    expect(stored.chain.versionCount).toBe(1);
    expect(stored.payload.limits.basis).toBe('SYSTEM_DEFAULT');
  });

  it('dry run builds and reports the disposition and records nothing', async () => {
    const port = openWith(portCase, 'dry-run');
    const report = await generateHoldingDisposition(
      { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(M1_SYMBOL), generatedAt: RUN_AT, dryRun: true },
      depsFor(port, OPERATOR_ROOT),
    );
    expect(report.status).toBe('DRY_RUN');
    expect(report.persistence).toBeNull();
    expect(report.payload.limits.policyVersion).toBe(OPERATOR_POLICY.policyVersion);
    expect(createInvestmentArtifactService({ port, owner: OWNER }).inventory('investment.holding-disposition')).toHaveLength(0);
  });
});

describe('S6-1b — persistence failure reporting (stand-in port, writes refused)', () => {
  it('[9] a write that fails is reported as PERSISTENCE_FAILED with the store message, not as a recorded disposition', async () => {
    // Reads succeed (the assessment was recorded before the write path was disabled); the disposition write is refused.
    class WriteRefusingPort extends Np04StandInPort {
      refuse = false;
      override createInstance(authenticated: unknown, content: Parameters<Np04StandInPort['createInstance']>[1]) {
        if (this.refuse) throw new Error('disk full');
        return super.createInstance(authenticated, content);
      }
    }
    const port = new WriteRefusingPort();
    createInvestmentArtifactService({ port, owner: OWNER }).recordAssessment(V1.composed);
    port.refuse = true;
    const failure = await failureOf(
      generateHoldingDisposition(
        { portfolioId: PORTFOLIO_ID, holding: parseHoldingSelector(M1_SYMBOL), generatedAt: RUN_AT },
        depsFor(port, OPERATOR_ROOT),
      ),
    );
    expect(failure.code).toBe('PERSISTENCE_FAILED');
    expect(failure.detail.code).toBe('PERSISTENCE_UNAVAILABLE');
    expect(failure.detail.storeMessage).toBe('disk full');
    expect(port.all().filter((artifact) => artifact.reportType === 'investment.holding-disposition')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------------------------------------------
// The CLI wrapper, with the store and the portfolio view injected
// ---------------------------------------------------------------------------------------------------------------
describe('S6-1b — generate-holding-disposition CLI', () => {
  const cliEnv = (): NodeJS.ProcessEnv => ({});

  it('stops with OWNER_CONTEXT_UNAVAILABLE when no carrier is configured, and reads nothing', async () => {
    let portLoads = 0;
    const outcome = await runCli(['--portfolio', PORTFOLIO_ID, '--holding', M1_SYMBOL], {
      env: cliEnv(),
      now: () => RUN_AT,
      loadPort: async () => { portLoads += 1; return new Np04StandInPort(); },
      loadPortfolioView: async () => STANDARD_VIEW,
    });
    expect(outcome.exitCode).toBe(2);
    expect(outcome.exitCode === 2 && outcome.report.failure.code).toBe('OWNER_CONTEXT_UNAVAILABLE');
    expect(portLoads).toBe(0);
  });

  it('stops with PERSISTENCE_UNAVAILABLE when the store cannot be resolved (READ intent never creates one)', async () => {
    const outcome = await runCli(['--portfolio', PORTFOLIO_ID, '--holding', M1_SYMBOL, '--owner-carrier', env.carrierPath], {
      env: cliEnv(),
      now: () => RUN_AT,
      loadPort: async () => null,
      loadPortfolioView: async () => STANDARD_VIEW,
    });
    expect(outcome.exitCode).toBe(2);
    expect(outcome.exitCode === 2 && outcome.report.failure.code).toBe('PERSISTENCE_UNAVAILABLE');
    expect(summaryLines(outcome)[1]).toBe('wrote: nothing');
  });

  it('records a disposition for the selected holding with the operator limits from --data-root, then reports UNCHANGED on re-run', async () => {
    const port = new Np04StandInPort();
    createInvestmentArtifactService({ port, owner: OWNER }).recordAssessment(V1.composed);
    const argv = ['--portfolio', PORTFOLIO_ID, '--holding', `isin:${M1_ISIN}`, '--owner-carrier', env.carrierPath, '--data-root', OPERATOR_ROOT];
    const deps = { env: cliEnv(), now: () => RUN_AT, loadPort: async () => port, loadPortfolioView: async () => STANDARD_VIEW };

    const first = await runCli(argv, deps);
    expect(first.exitCode).toBe(0);
    if (first.exitCode !== 0) return;
    expect(first.report.status).toBe('RECORDED');
    expect(first.report.limits).toMatchObject({ basis: 'OPERATOR_CONFIG', policyVersion: OPERATOR_POLICY.policyVersion });
    expect(first.report.identity.issuerId).toBe(M1_ISSUER_ID);
    expect(summaryLines(first).join('\n')).toContain(`basis=OPERATOR_CONFIG policyVersion=${OPERATOR_POLICY.policyVersion} source=OPERATOR_FILE`);

    const second = await runCli(argv, { ...deps, now: () => '2026-11-23T06:00:00.000Z' });
    expect(second.exitCode).toBe(0);
    if (second.exitCode !== 0) return;
    expect(second.report.status).toBe('UNCHANGED');
    expect(second.report.persistence?.wrote).toBe(false);
    expect(second.report.persistence?.versionCount).toBe(1);
  });

  it('--dry-run reports the disposition and writes nothing; an invalid policy under --data-root exits 2 naming the key', async () => {
    const port = new Np04StandInPort();
    createInvestmentArtifactService({ port, owner: OWNER }).recordAssessment(V1.composed);
    const base = { env: cliEnv(), now: () => RUN_AT, loadPort: async () => port, loadPortfolioView: async () => STANDARD_VIEW };

    const dry = await runCli(['--portfolio', PORTFOLIO_ID, '--holding', 'index:0', '--owner-carrier', env.carrierPath, '--data-root', OPERATOR_ROOT, '--dry-run'], base);
    expect(dry.exitCode).toBe(0);
    expect(dry.exitCode === 0 && dry.report.status).toBe('DRY_RUN');
    expect(port.all().filter((artifact) => artifact.reportType === 'investment.holding-disposition')).toHaveLength(0);

    const invalid = await runCli(['--portfolio', PORTFOLIO_ID, '--holding', 'index:0', '--owner-carrier', env.carrierPath, '--data-root', INVALID_ROOT], base);
    expect(invalid.exitCode).toBe(2);
    if (invalid.exitCode !== 2) return;
    expect(invalid.report.failure.code).toBe('POLICY_INVALID');
    expect(invalid.report.failure.detail.limitsPolicyPath).toBe(resolveLimitsPolicyPath(INVALID_ROOT, {}));
    expect(port.all().filter((artifact) => artifact.reportType === 'investment.holding-disposition')).toHaveLength(0);
  });

  it('refuses a malformed invocation before touching anything', async () => {
    await expect(runCli(['--portfolio', PORTFOLIO_ID], { env: cliEnv() })).rejects.toThrow(/usage/);
    await expect(runCli(['--portfolio', PORTFOLIO_ID, '--holding', 'X', '--as-of', '22-11-2026'], { env: cliEnv() })).rejects.toThrow(/--as-of/);
  });
});
