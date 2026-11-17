/**
 * IID Stage 4 — the §23 ten-scenario acceptance demo (`S4-R1`).
 *
 * WHY THIS FILE EXISTS
 *   Stage 4's objective is *"issuer coverage, completeness, method usability and sector measurement verified
 *   on installed data, with the 10-scenario demo (§23) passing"*. The first Stage 4 record reported the demo
 *   limb as blocked on an owner **population decision**, on the reasoning that four scenarios "cannot be
 *   demonstrated on the admitted population". That reasoning was wrong, and this file is the correction.
 *
 *   §23 assigns every scenario its own data class in its own preamble:
 *
 *       "(S) = synthetic fixture only; (R) = real evidence bundle; (––) = cannot run today."
 *
 *   Scenarios **2, 3, 4 and 7 are marked (S)** — synthetic fixture is the *designated* medium for them, not a
 *   fallback. Demanding admitted issuers for those four invented a stricter requirement than the baseline
 *   states, and then reported the invented requirement as a blocker. Scenario 8 is marked as *"fully
 *   demonstrable in fixtures; Marico/KEC show the Consumer/Industrials analogue on real data"* — both limbs.
 *   Scenarios 5 and 10 carry their own "Today:" notes naming **IPD binding** as the blocked limb, and
 *   scenario 1's assessment-chain limb needs a minted assessment. Those are Stage 5 dependencies, and Stage 4
 *   is explicitly *"Independent: of IPD"*.
 *
 *   So the residual is not "admit more issuers". It is: four limbs belong to Stage 5 (D5 binding, B-3
 *   observation sources, D2/G-11 minting, G-10 HTML), and one acceptance value the baseline *predicted* is
 *   contradicted by the admitted data (scenario 9's adequacy). Neither is closable by Stage 4 work, and
 *   neither is closed here by weakening anything.
 *
 * LABELLING (§23, line 699 — enforced by the last suite in this file, not just asserted in prose)
 *   "Fixture-vs-real labelling in any demo shown to the owner: fixtures = `SYNTHETIC_FIXTURE` chip; evidence
 *   bundles = `OPERATOR_SUPPLIED` with bundle name. **No synthetic figure is to be cited as coverage.**"
 *
 *   Every scenario below states its labels, and the closing suite proves the coverage figures come only from
 *   the admitted bundles: the installed dataset's issuer set is exactly the three admitted CINs, none of the
 *   synthetic fixture's issuers appears in it, and the two populations declare different source rights.
 *
 * WHAT IS NOT DONE HERE
 *   No issuer is admitted, no identity record or observation is committed, no financial figure is invented,
 *   no resolver rule is widened, and no acceptance value is relaxed. Where a scenario needs a roster or
 *   listing that does not exist, the edit is made **in memory** to the already-committed synthetic fixture —
 *   which is what §23's scenarios 3 and 5 explicitly describe ("roster deliberately lacking one security",
 *   "after roster edit it flips RESOLVED") — and is labelled `SYNTHETIC_FIXTURE`. Where a limb cannot be
 *   demonstrated at all, it is recorded with its exact prerequisite instead of being skipped silently.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { run as ingest } from '../../src/investment/cli/ingest';
import { run as provision } from '../../src/investment/cli/provision-identity';
import { readDataset } from '../../src/investment/ingestion/writer';
import { measureCoverage } from '../../src/investment/coverage/measure';
import { buildInvestmentCoverageReport } from '../../src/investment/coverage/investmentCoverage';
import { assessCompany } from '../../src/investment/assessment/engine';
import { buildCapitalStructure, equityValueFromEnterprise } from '../../src/investment/assessment/capitalStructure';
import { selectSeries } from '../../src/investment/assessment/periods';
import { REQUIRED_ITEMS } from '../../src/investment/assessment/adequacy';
import { DERIVED, present } from '../../src/investment/contracts/observation';
import type { SectorName } from '../../src/investment/contracts/operatingMetrics';
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import type { DatasetContent } from '../../src/investment/fundamentals/types';
import {
  loadIdentitySources,
  loadIdentitySourcesFromDir,
  validateCorporateActionTable,
} from '../../src/investment/identity/sources';
import { buildBinding, identityInputOf, resolveIdentity } from '../../src/investment/identity/resolver';
import type { IdentityObservation, IdentitySources } from '../../src/investment/identity/types';

import { referenceContent, writeTempDataset } from './fixtures';
import { FIXTURE_AS_OF, fixtureObservations, identitySourceTexts, loadFixtureSources } from './identityFixture';

/* -------------------------------------------------------------------------------------------------- *
 * Labels, per §23 line 699.
 * -------------------------------------------------------------------------------------------------- */
const SYNTHETIC = 'SYNTHETIC_FIXTURE';
const operator = (bundle: string): string => `OPERATOR_SUPPLIED ${bundle}`;

const BUNDLE_INFOSYS = 'REL-1-INFOSYS-2026-11-06';
const BUNDLE_MARICO = 'WI7-CONSUMER-MARICO-2026-11-07';
const BUNDLE_KEC = 'WI8-INDUSTRIALS-KEC-2026-11-07';

const AS_OF = '2026-11-14';
const NOW = `${AS_OF}T00:00:00.000Z`;
const REPO_ROOT = join(__dirname, '..', '..', '..');
const EVIDENCE = join(REPO_ROOT, 'evidence', 'real-issuer');

/** The three bundles admitted as operational sources (decision O3). No fourth is admitted anywhere here. */
const ADMITTED_INPUTS = [BUNDLE_INFOSYS, BUNDLE_MARICO, BUNDLE_KEC].map((b) => join(EVIDENCE, b, 'ingest-input'));
/** REL-1 keeps its identity set at the bundle root; WI7/WI8 keep it under `ingest-input`. Not uniform. */
const ADMITTED_IDENTITY = [
  join(EVIDENCE, BUNDLE_INFOSYS, 'identity'),
  join(EVIDENCE, BUNDLE_MARICO, 'ingest-input', 'identity'),
  join(EVIDENCE, BUNDLE_KEC, 'ingest-input', 'identity'),
];
/** The value the Windows host produced at Stage 3; if this moves, the admitted bundles changed. */
const HOST_DATASET_VERSION = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83';

const ADMITTED_CINS = [
  'IN:CIN:L85110KA1981PLC013115',
  'IN:CIN:L15140MH1988PLC049208',
  'IN:CIN:L45200MH2005PLC152061',
] as const;

/* -------------------------------------------------------------------------------------------------- *
 * Installed admitted data — built by the real CLIs, once, for the scenarios §23 marks (R).
 * -------------------------------------------------------------------------------------------------- */
let dataRoot = '';
let installed: ReturnType<typeof readDataset> | null = null;
let published: IdentitySources | null = null;

before(() => {
  dataRoot = mkdtempSync(join(tmpdir(), 'iid-s4-matrix-'));
  const ingestCode = ingest([
    ...ADMITTED_INPUTS.flatMap((dir) => ['--input', dir]),
    '--dataset-dir',
    join(dataRoot, 'investment', 'dataset'),
    '--now',
    NOW,
  ]);
  assert.equal(ingestCode, 0, 'the real ingestion CLI must install the three admitted bundles');
  const provisionCode = provision([
    ...ADMITTED_IDENTITY.flatMap((dir) => ['--source', dir]),
    '--data-root',
    dataRoot,
    '--execute',
  ]);
  assert.equal(provisionCode, 0, 'the real provisioner must publish the admitted identity set');
  installed = readDataset(join(dataRoot, 'investment', 'dataset'));
  const identity = loadIdentitySourcesFromDir(join(dataRoot, 'investment', 'identity'));
  assert.equal(identity.available, true, 'the published identity set must load');
  if (identity.available) published = identity.sources;
});

after(() => {
  if (dataRoot !== '') rmSync(dataRoot, { recursive: true, force: true });
});

/* -------------------------------------------------------------------------------------------------- *
 * Synthetic fixture side — the already-committed IID-1 fixture, labelled and never cited as coverage.
 * -------------------------------------------------------------------------------------------------- */
const fixtureTexts = identitySourceTexts();
/** `loadFixtureSources()` already unwraps the load result and throws if the fixture does not load. */
const fixtureSources: IdentitySources = loadFixtureSources();
const fixtureContext = { sources: fixtureSources, asOf: FIXTURE_AS_OF };
const fixtureContent: DatasetContent = referenceContent();
const fixtureObservation = (id: string): IdentityObservation =>
  fixtureObservations().find((observation) => observation.observationId === id)!;
const resolveFixture = (id: string) => resolveIdentity(identityInputOf(fixtureObservation(id)), fixtureContext);
const bindingOf = (id: string) => {
  const observation = fixtureObservation(id);
  return buildBinding(observation, resolveIdentity(identityInputOf(observation), fixtureContext), fixtureContext);
};

/** Load a variant of the synthetic fixture sources. In memory only; nothing is written or committed. */
function variantSources(edit: (texts: { roster: string; listingMap: string; corporateActions: string }) => void): IdentitySources {
  const texts = { ...fixtureTexts };
  edit(texts);
  const result = loadIdentitySources(texts);
  assert.equal(result.available, true, `a fixture variant must still load: ${JSON.stringify(result.available ? [] : result.issues)}`);
  return result.available ? result.sources : (null as never);
}

function assessFixture(issuerId: string) {
  const issuer = fixtureContent.issuers.find((entry) => entry.issuerId === issuerId)!;
  const security = fixtureContent.securities.find((entry) => entry.issuerId === issuerId)!;
  return assessCompany({
    issuerId,
    legalName: issuer.legalName,
    sector: issuer.sector as SectorName,
    sectorSubsegment: issuer.subSegment,
    securityId: security.securityId,
    dataset: fixtureContent,
    datasetVersion: 'sha256:synthetic-fixture',
    contentDigest: 'sha256:synthetic-fixture',
    provider: 'synthetic-fixture',
    identity: {
      bindingRef: `fixture:${issuerId}`,
      rosterVersion: 'sha256:synthetic-fixture',
      listingMapVersion: 'sha256:synthetic-fixture',
      corporateActionTableVersion: 'sha256:synthetic-fixture',
    },
    generatedAt: NOW,
    knownAsOf: AS_OF,
  });
}

function assessAdmitted(issuerId: string) {
  assert.ok(installed !== null && published !== null);
  const issuer = installed.content.issuers.find((entry) => entry.issuerId === issuerId)!;
  const security = installed.content.securities.find((entry) => entry.issuerId === issuerId)!;
  return assessCompany({
    issuerId,
    legalName: issuer.legalName,
    sector: issuer.sector as SectorName,
    sectorSubsegment: issuer.subSegment,
    securityId: security.securityId,
    dataset: installed.content,
    datasetVersion: installed.manifest.datasetVersion,
    contentDigest: installed.manifest.contentDigest,
    provider: installed.manifest.provider,
    identity: {
      bindingRef: `identity:${issuerId}`,
      rosterVersion: String(published.versions.rosterVersion),
      listingMapVersion: String(published.versions.listingMapVersion),
      corporateActionTableVersion: String(published.versions.corporateActionTableVersion),
    },
    generatedAt: NOW,
    knownAsOf: AS_OF,
  });
}

/** `manifest` decides `dataset.datasetClass`; null means there is no installed dataset to classify. */
const coverageOf = (content: DatasetContent, manifest: Parameters<typeof buildInvestmentCoverageReport>[0]['manifest'] = null) =>
  buildInvestmentCoverageReport({
    asOf: AS_OF,
    generatedAt: NOW,
    manifest,
    issuers: content.issuers,
    securities: content.securities,
    periods: content.periods,
    prices: content.prices,
    operatingMetrics: content.operatingMetrics,
    issues: content.issues,
    identitySourcesAvailable: true,
    identitySourceDetail: null,
  });

const STATUSES = ['COVERED', 'NO_FINANCIALS', 'SECTOR_NOT_MEASURED', 'ISSUED_DATA'] as const;

/* -------------------------------------------------------------------------------------------------- *
 * Scenario 1 — (R, Infosys). Normal equity holding, valid identity, complete history.
 * §23: "observation resolves RESOLVED; dataset reports 1 issuer COVERED; assessment endpoint returns the
 *       chain once minted."  Today: "cannot run — no files/dataset installed (Stages 2–3)."
 * The Stages 2–3 obstacle is gone. What remains is the minted chain, which needs D2.
 * -------------------------------------------------------------------------------------------------- */
describe('§23 scenario 1 — (R) normal equity holding, valid identity, complete history', () => {
  it('resolves the real admitted Infosys ISIN through the real published identity set', () => {
    assert.ok(published !== null);
    const security = published.roster.securities.find((entry) => entry.securityId === 'IN:ISIN:INE009A01021')!;
    const listing = published.listingMap.entries.find((entry) => entry.securityId === security.securityId)!;
    /*
     * The observation ROW is test-constructed and labelled as such: the lanes that supply real observation
     * rows (holdings, broker, watchlist) are G-3/D5-blocked, which is Stage 5. The identifiers it carries are
     * the admitted ones, read out of the published roster rather than written down here.
     */
    const observation = {
      observationId: 'S1-INFOSYS',
      source: 'HOLDING',
      portfolioId: 'portfolio-primary',
      isin: security.isin,
      symbol: listing.symbol,
      exchange: listing.exchange,
      series: listing.series,
      cin: null,
      companyIdHint: null,
      displayName: null,
      quantity: null,
      observedAt: AS_OF,
    } as unknown as IdentityObservation;
    const resolution = resolveIdentity(identityInputOf(observation), { sources: published, asOf: AS_OF });
    assert.equal(resolution.state, 'RESOLVED');
    assert.equal(resolution.resolutionBasis, 'ISIN');
    assert.equal(resolution.issuerId, ADMITTED_CINS[0], 'it resolves to the admitted Infosys issuer');
    assert.equal(buildBinding(observation, resolution, { sources: published, asOf: AS_OF }).assessable, true);
  });

  it('reports that issuer COVERED on the admitted dataset, with its sector measured', () => {
    assert.ok(installed !== null);
    assert.equal(installed.manifest.datasetVersion, HOST_DATASET_VERSION, 'this is the host-verified dataset, not a variant');
    const report = coverageOf(installed.content);
    const row = report.issuers.find((entry) => entry.issuerId === ADMITTED_CINS[0])!;
    assert.equal(row.state, 'COVERED');
    assert.equal(row.sector, 'Technology');
    assert.equal(row.annualPeriods, 3, 'complete history: three annual periods');
    const technology = measureCoverage(installed.content, { datasetVersion: installed.manifest.datasetVersion, generatedAt: NOW })
      .sectors.find((sector) => sector.sector === 'Technology')!;
    assert.equal(technology.measured, true, '§23 asks for "Technology measured"');
  });

  it('records the two limbs it cannot demonstrate, with their exact prerequisites', () => {
    /*
     * NOT DEMONSTRATED, and not papered over:
     *   - "assessment endpoint returns the chain once minted" — no assessment version exists anywhere
     *     operational (G-11); minting needs the NP-04 store, which is D2 and unconfigured.
     *   - the UI limbs: `/investment/coverage` HTML still renders the identity-unavailable page (G-10), and
     *     `/investment/company/:issuerId` has never served a real chain (G-11).
     * Both are Stage 5 / D2 territory. Stage 4 is independent of IPD and does not mint.
     */
    const prerequisites = ['D2 np04-assessment-store (minting)', 'G-11 no served chain', 'G-10 HTML identity page'];
    assert.equal(prerequisites.length, 3);
    assert.ok(prerequisites.every((entry) => typeof entry === 'string' && entry.length > 0));
  });
});

/* -------------------------------------------------------------------------------------------------- *
 * Scenario 2 — (S or any 2-period issuer). Valid identity, insufficient history.
 * §23: "adequacy PARTIAL/INSUFFICIENT, NO_FINANCIALS excluded states only when truly empty; per-row reason
 *       visible."  Today: "mechanics testable in fixtures."
 * -------------------------------------------------------------------------------------------------- */
describe('§23 scenario 2 — (S) valid identity, insufficient history', () => {
  it('gives a 2-period issuer PARTIAL with the reason named', () => {
    const aarav = fixtureContent.issuers.find((issuer) => issuer.legalName.startsWith('Aarav'))!;
    const result = assessFixture(aarav.issuerId);
    assert.equal(result.payload.completeness.adequacy, 'PARTIAL');
    assert.deepEqual(result.payload.completeness.adequacyBasis, ['ANNUAL_PERIODS_2_LT_3'], 'the per-row reason is visible');
  });

  it('gives a 1-period issuer INSUFFICIENT, and lists its missing fields', () => {
    const bodhi = fixtureContent.issuers.find((issuer) => issuer.legalName.startsWith('Bodhi'))!;
    const result = assessFixture(bodhi.issuerId);
    assert.equal(result.payload.completeness.adequacy, 'INSUFFICIENT');
    assert.deepEqual(result.payload.completeness.adequacyBasis, ['ANNUAL_PERIODS_1_LT_3']);
    assert.ok(result.payload.completeness.missingFields.length > 0, 'gaps are listed, not summarised away');
    for (const field of result.payload.completeness.missingFields) {
      assert.ok(field.reason !== undefined && field.reason !== null, 'every gap carries a reason');
    }
  });

  it('reserves NO_FINANCIALS for a truly empty issuer, and never for a sparse one', () => {
    const report = coverageOf(fixtureContent);
    const eesha = report.issuers.find((row) => row.legalName.startsWith('Eesha'))!;
    const bodhi = report.issuers.find((row) => row.legalName.startsWith('Bodhi'))!;
    assert.equal(eesha.annualPeriods, 0);
    assert.equal(eesha.state, 'NO_FINANCIALS', 'truly empty ⇒ NO_FINANCIALS');
    assert.equal(bodhi.annualPeriods, 1);
    assert.equal(bodhi.state, 'COVERED', 'sparse but present ⇒ COVERED, with adequacy INSUFFICIENT, not NO_FINANCIALS');
    assert.equal(assessFixture(fixtureContent.issuers.find((i) => i.legalName.startsWith('Eesha'))!.issuerId)
      .payload.completeness.adequacyBasis[0], 'NO_ANNUAL_PERIOD');
  });
});

/* -------------------------------------------------------------------------------------------------- *
 * Scenario 3 — (S). Financially covered issuer, unresolved security.
 * §23: "dataset COVERED; identity row UNMATCHED/ISIN_NOT_IN_ROSTER (roster deliberately lacking one
 *       security); no assessment link."  Today: "constructible in fixture-land."
 * -------------------------------------------------------------------------------------------------- */
describe('§23 scenario 3 — (S) financially covered issuer, unresolved security', () => {
  it('names ISIN_NOT_IN_ROSTER for the committed fixture observation that carries an unrostered ISIN', () => {
    const resolution = resolveFixture('B-03');
    assert.equal(resolution.state, 'UNMATCHED');
    assert.equal(resolution.failure?.reason, 'ISIN_NOT_IN_ROSTER');
    assert.equal(bindingOf('B-03').assessable, false, 'no assessment link');
  });

  it('shows the same company COVERED in the dataset and UNMATCHED in identity, side by side', () => {
    /*
     * The committed fixture already carries the case §23 describes: B-03 holds ISIN `IN0000000029`, which the
     * roster deliberately lacks, together with the symbol `AARAV` — a company the fixture dataset DOES cover
     * financially. Both positions are therefore shown side by side from committed data, with no edit.
     *
     * The resolver must not fall back to the symbol: doing so would attribute the holding to Aarav on the
     * strength of a ticker alone, which is the misattribution `ISIN_NOT_IN_ROSTER` exists to prevent.
     */
    const observation = fixtureObservation('B-03');
    const resolution = resolveFixture('B-03');
    const aarav = coverageOf(fixtureContent).issuers.find((entry) => entry.legalName.startsWith('Aarav'))!;

    assert.equal(observation.symbol, 'AARAV', 'the observation carries a symbol that WOULD resolve on its own');
    assert.equal(resolution.state, 'UNMATCHED', 'identity: unresolved');
    assert.equal(resolution.failure?.reason, 'ISIN_NOT_IN_ROSTER');
    assert.equal(resolution.issuerId, null, 'no issuer is attributed, so there is no assessment link');
    assert.equal(buildBinding(observation, resolution, fixtureContext).assessable, false);
    assert.equal(aarav.state, 'COVERED', 'dataset: the company behind that symbol IS financially covered');
    assert.equal(aarav.annualPeriods, 2);
  });

  it('cannot be manufactured by deleting a security from a roster, because loading is fail-closed', () => {
    /*
     * Measured while building this suite. Removing the security whose ISIN an issuer declares as its
     * `equityIsin` does not yield a roster "lacking one security" — it rejects the ENTIRE source set with
     * `ISSUER_KEY_CONFLICT`. That is why the fixture carries a deliberately unrostered ISIN instead, and it is
     * pinned here so nobody "simplifies" this scenario later by editing a roster.
     */
    const roster = JSON.parse(fixtureTexts.roster) as { securities: { isin?: string }[] };
    roster.securities = roster.securities.filter((security) => security.isin !== 'IN0000000029');
    const result = loadIdentitySources({ ...fixtureTexts, roster: JSON.stringify(roster) });
    assert.equal(result.available, false, 'the whole set is rejected, not silently narrowed');
    if (!result.available) {
      assert.ok(result.issues.some((issue) => issue.code === 'ISSUER_KEY_CONFLICT'));
      assert.match(result.issues.find((issue) => issue.code === 'ISSUER_KEY_CONFLICT')!.detail, /IN0000000029/);
    }
  });
});

/* -------------------------------------------------------------------------------------------------- *
 * Scenario 4 — (S). Unmatched/ambiguous security.
 * §23: "UNMATCHED or AMBIGUOUS with candidates listed; totals exclude it from assessable."
 * -------------------------------------------------------------------------------------------------- */
describe('§23 scenario 4 — (S) unmatched/ambiguous security with candidates listed', () => {
  it('lists candidates for a duplicated active symbol and refuses to classify', () => {
    const resolution = resolveFixture('H-04');
    assert.equal(resolution.state, 'AMBIGUOUS');
    assert.equal(resolution.failure?.reason, 'DUPLICATE_ACTIVE_SYMBOL');
    const candidates = (resolution.failure as unknown as { candidates?: readonly unknown[] }).candidates;
    assert.equal(candidates?.length, 2, 'both candidates are listed');
    assert.equal(resolution.issuerId, null, 'nothing is classified');
    assert.equal(bindingOf('H-04').assessable, false);
  });

  it('lists candidates for a listing shared by two securities, too', () => {
    const resolution = resolveFixture('B-04');
    assert.equal(resolution.state, 'AMBIGUOUS_LISTING');
    assert.equal(resolution.failure?.reason, 'MULTIPLE_SECURITIES_SHARE_LISTING');
    assert.equal((resolution.failure as unknown as { candidates?: readonly unknown[] }).candidates?.length, 2);
    assert.equal(bindingOf('B-04').assessable, false);
  });

  it('excludes every unresolved observation from the assessable total', () => {
    const bindings = fixtureObservations().map((observation) =>
      buildBinding(observation, resolveIdentity(identityInputOf(observation), fixtureContext), fixtureContext),
    );
    const assessable = bindings.filter((binding) => binding.assessable);
    assert.equal(bindings.length, 18);
    assert.equal(assessable.length, 4, 'only the four RESOLVED observations are assessable');
    assert.deepEqual(assessable.map((binding) => binding.observationId), ['H-01', 'H-02', 'B-02', 'W-01']);
    assert.deepEqual(assessable.map((binding) => binding.status), ['RESOLVED', 'RESOLVED', 'RESOLVED', 'RESOLVED']);
    for (const binding of bindings.filter((entry) => !entry.assessable)) {
      assert.notEqual(binding.status, 'RESOLVED');
      assert.ok(binding.reason !== null, 'every excluded observation carries a reason');
    }
  });
});

/* -------------------------------------------------------------------------------------------------- *
 * Scenario 5 — newly imported holding.
 * §23: "pre-provisioning it is UNMATCHED (roster lacks issuer); after roster edit it flips RESOLVED with
 *       zero code change."  Today: "preview path works; portfolio path blocked on IPD binding."
 * -------------------------------------------------------------------------------------------------- */
describe('§23 scenario 5 — newly imported holding flips on a roster edit, with zero code change', () => {
  const imported = {
    observationId: 'S5-IMPORT-01',
    source: 'BROKER_PREVIEW',
    portfolioId: null,
    isin: 'IN0000000201',
    symbol: 'NEWCO',
    exchange: 'NSE',
    series: 'EQ',
    cin: null,
    companyIdHint: null,
    displayName: null,
    quantity: null,
    observedAt: FIXTURE_AS_OF,
  } as unknown as IdentityObservation;

  it('is UNMATCHED before the roster carries it, and RESOLVED after — same code, different source text', () => {
    const before = resolveIdentity(identityInputOf(imported), fixtureContext);
    assert.equal(before.state, 'UNMATCHED');
    assert.equal(before.failure?.reason, 'ISIN_NOT_IN_ROSTER');

    const sources = variantSources((texts) => {
      const roster = JSON.parse(texts.roster) as { issuers: { issuerId: string }[]; securities: Record<string, unknown>[] };
      const template = roster.securities.find((security) => (security as { securityId: string }).securityId === 'IN:ISIN:IN0000000011')!;
      roster.securities.push({ ...template, securityId: 'IN:ISIN:IN0000000201', isin: 'IN0000000201', issuerId: roster.issuers[0]!.issuerId });
      const listingMap = JSON.parse(texts.listingMap) as { entries: Record<string, unknown>[] };
      const listingTemplate = listingMap.entries.find((entry) => (entry as { listingId: string }).listingId === 'IN:NSE:AARAV:EQ:EQUITY')!;
      listingMap.entries.push({ ...listingTemplate, listingId: 'IN:NSE:NEWCO:EQ:EQUITY', securityId: 'IN:ISIN:IN0000000201', symbol: 'NEWCO' });
      texts.roster = JSON.stringify(roster);
      texts.listingMap = JSON.stringify(listingMap);
    });

    const after = resolveIdentity(identityInputOf(imported), { sources, asOf: FIXTURE_AS_OF });
    assert.equal(after.state, 'RESOLVED');
    assert.equal(after.resolutionBasis, 'ISIN');
    assert.equal(buildBinding(imported, after, { sources, asOf: FIXTURE_AS_OF }).assessable, true);
  });

  it('does not promote a mismatched symbol just because the ISIN was added', () => {
    /*
     * Measured, not assumed: adding the security while the observation keeps another security's symbol does
     * NOT resolve. The resolver refuses the mismatch instead — so "flips to RESOLVED" is a property of a
     * consistent roster edit, not of any edit.
     */
    const sources = variantSources((texts) => {
      const roster = JSON.parse(texts.roster) as { issuers: { issuerId: string }[]; securities: Record<string, unknown>[] };
      const template = roster.securities.find((security) => (security as { securityId: string }).securityId === 'IN:ISIN:IN0000000011')!;
      roster.securities.push({ ...template, securityId: 'IN:ISIN:IN0000000201', isin: 'IN0000000201', issuerId: roster.issuers[0]!.issuerId });
      const listingMap = JSON.parse(texts.listingMap) as { entries: Record<string, unknown>[] };
      const listingTemplate = listingMap.entries.find((entry) => (entry as { listingId: string }).listingId === 'IN:NSE:AARAV:EQ:EQUITY')!;
      listingMap.entries.push({ ...listingTemplate, listingId: 'IN:NSE:AARAVNEW:EQ:EQUITY', securityId: 'IN:ISIN:IN0000000201', symbol: 'AARAVNEW' });
      texts.roster = JSON.stringify(roster);
      texts.listingMap = JSON.stringify(listingMap);
    });
    const observation = { ...imported, symbol: 'AARAV' } as unknown as IdentityObservation;
    const resolution = resolveIdentity(identityInputOf(observation), { sources, asOf: FIXTURE_AS_OF });
    assert.equal(resolution.state, 'AMBIGUOUS');
    assert.equal(resolution.failure?.reason, 'SYMBOL_REUSED_BY_OTHER_SECURITY');
    assert.equal(resolution.issuerId, null);
  });

  it('records the portfolio limb as Stage 5, blocked on the IPD binding', () => {
    /*
     * NOT DEMONSTRATED: §23's own note is "portfolio path blocked on IPD binding". Persistence of an imported
     * holding needs D5 (`ipd-binding-precondition`, IPD-owned) and D6 (`ipc-endpoint`, IPD-owned). Stage 4 is
     * explicitly independent of IPD, so this limb is recorded, not forced.
     */
    assert.ok(['D5 ipd-binding-precondition', 'D6 ipc-endpoint'].length === 2);
  });
});

/* -------------------------------------------------------------------------------------------------- *
 * Scenario 6 — watchlist-only security.
 * §23: "resolves SECTOR_REFERENCE_NOT_AN_IDENTITY (current) — *not* 'unresolved security'."
 * -------------------------------------------------------------------------------------------------- */
describe('§23 scenario 6 — (S) watchlist-only security is a sector reference, not an unresolved security', () => {
  it('names the sector-reference class for a watchlist row', () => {
    const observation = fixtureObservation('W-03');
    assert.equal(observation.source, 'WATCHLIST');
    const resolution = resolveIdentity(identityInputOf(observation), fixtureContext);
    assert.equal(resolution.state, 'UNMATCHED');
    assert.equal(resolution.failure?.reason, 'SECTOR_REFERENCE_NOT_AN_IDENTITY');
  });

  it('does not report it as a generic unresolved security', () => {
    for (const id of ['W-03', 'H-05']) {
      const reason = resolveFixture(id).failure?.reason;
      assert.equal(reason, 'SECTOR_REFERENCE_NOT_AN_IDENTITY');
      assert.notEqual(reason, 'ISIN_NOT_IN_ROSTER');
      assert.notEqual(reason, 'NO_LISTING_FOR_SECURITY');
      assert.notEqual(reason, 'SECURITY_NOT_LISTED');
    }
  });

  it('carries no company link, because a sector reference does not parse to an issuer', () => {
    for (const id of ['W-03', 'H-05']) {
      const resolution = resolveFixture(id);
      assert.equal(resolution.issuerId, null);
      assert.equal(resolution.securityId, null);
      assert.equal(resolution.listingId, null);
      assert.equal(bindingOf(id).assessable, false);
    }
  });
});

/* -------------------------------------------------------------------------------------------------- *
 * Scenario 7 — (S). Company affected by a corporate action.
 * §23: "MERGER/DEMERGER row yields successor reconciliation; ratios reconcile to 1 or the file is rejected
 *       wholesale (SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE)."
 *       Today: "validator + tests cover; data absent in all committed bundles (L-031)."
 * -------------------------------------------------------------------------------------------------- */
describe('§23 scenario 7 — (S) successor weights reconcile to 1, or the whole file is rejected', () => {
  it('accepts the committed fixture table, whose DEMERGER and MERGER weights reconcile', () => {
    const table = JSON.parse(fixtureTexts.corporateActions) as {
      actions: { type: string; actionId: string; successors: { issuerId: string; ratio: number }[] }[];
    };
    const demerger = table.actions.find((action) => action.type === 'DEMERGER')!;
    const merger = table.actions.find((action) => action.type === 'MERGER')!;
    assert.deepEqual(demerger.successors.map((successor) => successor.ratio), [0.6, 0.4]);
    assert.equal(demerger.successors.reduce((sum, successor) => sum + successor.ratio, 0), 1);
    assert.deepEqual(merger.successors.map((successor) => successor.ratio), [1]);

    const result = validateCorporateActionTable(fixtureTexts.corporateActions, fixtureSources.roster);
    assert.notEqual(result.table, null, 'the reconciling table is accepted');
    assert.deepEqual(result.issues.map((issue) => issue.code), []);
  });

  it('rejects the WHOLE file when one weight is perturbed, and says why', () => {
    const table = JSON.parse(fixtureTexts.corporateActions) as { actions: { type: string; successors: { ratio: number }[] }[] };
    table.actions.find((action) => action.type === 'DEMERGER')!.successors[1]!.ratio = 0.3;
    const result = validateCorporateActionTable(JSON.stringify(table), fixtureSources.roster);
    assert.equal(result.table, null, 'wholesale rejection — not a filtered table with the bad row dropped');
    const codes = result.issues.map((issue) => issue.code);
    assert.ok(codes.includes('SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE'));
    const issue = result.issues.find((entry) => entry.code === 'SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE')!;
    // 0.6 + 0.3 is 0.8999999999999999 in binary floating point; the detail prints the sum it actually found.
    assert.match(issue.detail, /ratios sum to 0\.89/, 'the detail names the sum it found');
    assert.match(issue.detail, /expected 1/);
  });

  it('records that a real demonstration needs a transcribed corporate action', () => {
    /*
     * NOT DEMONSTRATED on admitted data, and correctly so: `corporateActions` is 0 in the installed dataset
     * and `merge.actions` was 0 at publication. G-8 and L-031 both record that corporate actions are empty
     * everywhere. Filling them is event-driven operator work (S4-R8) and is out of scope for this item.
     */
    assert.ok(installed !== null);
    assert.equal(installed.content.corporateActions.length, 0);
  });
});

/* -------------------------------------------------------------------------------------------------- *
 * Scenario 8 — specialised-measurement sector.
 * §23: "methods WITHHELD with the specific missing metrics (e.g. BM_NIM/GNPA/CET1) even with full
 *       statements; sector stage G3_WITHHELD if statements present but metrics absent; never approximated.
 *       No borrowed Banking verdicts from Technology."
 *       Today: "fully demonstrable in fixtures; Marico/KEC show the Consumer/Industrials analogue on real data."
 * -------------------------------------------------------------------------------------------------- */
describe('§23 scenario 8 — specialised sector withheld on both media, never approximated, never borrowed', () => {
  /** Banking with every BM_* metric removed and `DIVIDEND_DISCOUNT`'s two inputs removed. */
  function fullyWithheldBanking(): DatasetContent {
    const banking = fixtureContent.issuers.find((issuer) => issuer.sector === 'Banking')!;
    const drop: LineItemId[] = ['DIVIDENDS_PAID', 'EPS_DILUTED'];
    const strip = <T,>(record: Readonly<Partial<Record<LineItemId, T>>>): Partial<Record<LineItemId, T>> => {
      const copy: Partial<Record<LineItemId, T>> = { ...record };
      for (const item of drop) delete copy[item];
      return copy;
    };
    return {
      ...fixtureContent,
      periods: fixtureContent.periods.map((period) =>
        period.issuerId === banking.issuerId ? { ...period, values: strip(period.values), derived: strip(period.derived) } : period,
      ),
      operatingMetrics: fixtureContent.operatingMetrics.filter(
        (metric) => !(metric.issuerId === banking.issuerId && metric.metricId.startsWith('BM_')),
      ),
    };
  }

  it('reaches G3_WITHHELD with full statements but no Banking metrics, naming them', () => {
    const content = fullyWithheldBanking();
    const banking = measureCoverage(content, { datasetVersion: 'sha256:synthetic-fixture', generatedAt: NOW })
      .sectors.find((sector) => sector.sector === 'Banking')!;
    assert.equal(banking.stage, 'G3_WITHHELD');
    assert.equal(banking.measured, true, 'statements ARE present — this is not UNMEASURED');
    assert.equal(banking.annualPeriodsConsidered, 1);
    assert.deepEqual(banking.usableMethods, []);
    const residual = banking.methods.find((method) => method.methodId === 'RESIDUAL_INCOME')!;
    assert.equal(residual.state, 'WITHHELD');
    assert.equal(residual.reason, 'MANDATORY_METRIC_MISSING');
    for (const metric of ['BM_CET1', 'BM_GNPA', 'BM_NIM']) {
      assert.ok(residual.missing.includes(metric), `the specific missing metric ${metric} is named`);
    }
    for (const method of banking.methods) {
      assert.equal(method.state, 'WITHHELD', 'never approximated: no method is silently usable');
      assert.ok(method.reason !== null);
    }
  });

  it('shows the Consumer/Industrials analogue on the admitted bundles', () => {
    assert.ok(installed !== null);
    const report = measureCoverage(installed.content, { datasetVersion: installed.manifest.datasetVersion, generatedAt: NOW });
    const consumer = report.sectors.find((sector) => sector.sector === 'Consumer')!;
    const industrials = report.sectors.find((sector) => sector.sector === 'Industrials')!;
    assert.equal(consumer.stage, 'G1_ENABLED');
    assert.deepEqual(consumer.withheldMethods, []);
    assert.equal(industrials.stage, 'G2_PARTIAL');
    const evRevenue = industrials.methods.find((method) => method.methodId === 'EV_REVENUE')!;
    assert.equal(evRevenue.state, 'WITHHELD');
    assert.deepEqual(evRevenue.missing, ['IN_BOOK_TO_BILL'], 'the specific missing metric is named');
  });

  it('never borrows one sector\'s verdict or metrics for another', () => {
    assert.ok(installed !== null);
    const report = measureCoverage(installed.content, { datasetVersion: installed.manifest.datasetVersion, generatedAt: NOW });
    const prefixes: Record<string, string> = { Banking: 'BM_', Insurance: 'IM_', 'Capital Markets': 'CM_', Telecom: 'TL_', Technology: 'TM_', Industrials: 'IN_' };
    for (const sector of report.sectors) {
      for (const method of sector.methods) {
        for (const missing of method.missing) {
          const prefix = prefixes[sector.sector];
          if (prefix === undefined || !missing.startsWith('BM_') && !missing.startsWith('TM_') && !missing.startsWith('IN_') && !missing.startsWith('IM_') && !missing.startsWith('CM_') && !missing.startsWith('TL_')) {
            continue; // a line item, not a metric — no sector prefix applies
          }
          assert.equal(missing.startsWith(prefix), true, `${sector.sector} must never be withheld on another sector's metric (found ${missing})`);
        }
      }
    }
    const technology = report.sectors.find((sector) => sector.sector === 'Technology')!;
    const banking = report.sectors.find((sector) => sector.sector === 'Banking')!;
    assert.deepEqual(banking.usableMethods, [], 'Banking has no issuers, so it has no verdict at all');
    assert.equal(banking.stage, 'UNMEASURED');
    assert.notEqual(technology.stage, banking.stage, 'and Technology\'s G2_PARTIAL is not lent to it');
  });
});

/* -------------------------------------------------------------------------------------------------- *
 * Scenario 9 — (R, KEC debt-side). Stale/incomplete company.
 * §23: "NOT_REPORTED/NOT_COMPUTABLE components; net debt unresolved ⇒ bridge refuses; adequacy PARTIAL;
 *       confidence caps (STALE_DATA)."
 * -------------------------------------------------------------------------------------------------- */
describe('§23 scenario 9 — (R) KEC debt-side: components reasoned, bridge refuses, confidence capped', () => {
  const kec = ADMITTED_CINS[2];

  it('reports the missing debt-side components as NOT_REPORTED, never as zero', () => {
    assert.ok(installed !== null);
    const latest = installed.content.periods
      .filter((period) => period.issuerId === kec)
      .map((period) => period.period.periodEnd)
      .sort()
      .pop()!;
    const period = installed.content.periods.find((entry) => entry.issuerId === kec && entry.period.periodEnd === latest)!;
    const investments = period.values.CURRENT_INVESTMENTS!;
    assert.equal(investments.presence, 'MISSING');
    assert.equal(investments.reason, 'NOT_REPORTED');
    assert.equal(investments.value, null, 'a missing component is null, never 0');

    const structure = buildCapitalStructure(selectSeries(installed.content.periods, kec), {
      asOf: AS_OF,
      datasetSchema: installed.manifest.datasetSchema,
    });
    assert.equal(structure.netDebt.presence, 'MISSING');
    assert.equal((structure.netDebt as { reason?: string }).reason, 'NOT_REPORTED');
  });

  it('refuses the enterprise-to-equity bridge, and says which input blocked it', () => {
    assert.ok(installed !== null);
    const structure = buildCapitalStructure(selectSeries(installed.content.periods, kec), {
      asOf: AS_OF,
      datasetSchema: installed.manifest.datasetSchema,
    });
    const bridged = equityValueFromEnterprise(present(1_000_000_000_000, DERIVED, { basis: 'DERIVED' }), structure);
    assert.equal(bridged.presence, 'NOT_COMPUTABLE');
    assert.equal((bridged as { note?: string }).note, 'enterprise-to-equity conversion blocked by netDebt');
    assert.equal(bridged.value, null, 'the bridge produces no number');
  });

  it('caps confidence with STALE_DATA', () => {
    const result = assessAdmitted(kec);
    assert.ok(result.payload.confidence.caps.includes('STALE_DATA'));
    assert.ok(result.payload.confidence.combined < 1, 'the cap actually reduces confidence');
    assert.ok(
      result.payload.quality.flags.some((flag) => flag.code === 'STALE_STATEMENTS'),
      'and the quality block carries the matching flag',
    );
  });

  it('records the one acceptance value the admitted data contradicts, instead of relaxing it', () => {
    /*
     * §23 predicts "adequacy PARTIAL" for KEC. MEASURED: SUFFICIENT. The cause is exact and is not a defect in
     * either layer — `REQUIRED_ITEMS` is nine statement fields and does not include borrowings or current
     * investments, so KEC's required-field coverage is 100% while its capital structure is incomplete. The
     * incompleteness §23 was pointing at is real and is demonstrated above (NOT_REPORTED components, refused
     * bridge, STALE_DATA cap); it simply does not reach the adequacy ladder.
     *
     * This test pins the divergence so it cannot be quietly "fixed" by redefining adequacy to suit a
     * prediction, nor quietly forgotten. Changing `REQUIRED_ITEMS` is a valuation-policy decision, not a
     * Stage 4 demonstration act.
     */
    const result = assessAdmitted(kec);
    assert.equal(result.payload.completeness.adequacy, 'SUFFICIENT', '§23 predicted PARTIAL; the admitted data says SUFFICIENT');
    assert.equal(result.payload.completeness.requiredFieldCoveragePct, 1);
    assert.deepEqual(result.payload.completeness.missingFields, []);
    for (const item of ['SHORT_TERM_BORROWINGS', 'LONG_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'CURRENT_INVESTMENTS'] as LineItemId[]) {
      assert.ok(!REQUIRED_ITEMS.includes(item), `${item} is not a required item, which is why adequacy does not see the debt-side gap`);
    }
  });
});

/* -------------------------------------------------------------------------------------------------- *
 * Scenario 10 — mixed portfolio (covered + uncovered).
 * §23: "counts split COVERED/NO_FINANCIALS/SECTOR_NOT_MEASURED; identity report counts separately;
 *       watchlist rows disclosed as sector refs; totals add up; nothing is promoted."
 * -------------------------------------------------------------------------------------------------- */
describe('§23 scenario 10 — mixed population: every state at once, totals exact, nothing promoted', () => {
  it('renders all three coverage states simultaneously on the synthetic fixture, and totals add up', () => {
    const banking = fixtureContent.issuers.find((issuer) => issuer.sector === 'Banking')!;
    const withheld: DatasetContent = {
      ...fixtureContent,
      periods: fixtureContent.periods.map((period) =>
        period.issuerId === banking.issuerId
          ? { ...period, values: {}, derived: {} }
          : period,
      ),
      operatingMetrics: fixtureContent.operatingMetrics.filter((metric) => metric.issuerId !== banking.issuerId),
    };
    const report = coverageOf(withheld);
    assert.equal(report.counts.observed, report.issuers.length);
    assert.ok(report.counts.COVERED > 0, 'covered');
    assert.equal(report.counts.NO_FINANCIALS, 1, 'truly empty');
    assert.equal(report.counts.SECTOR_NOT_MEASURED, 1, 'in an unmeasured/withheld sector');
    assert.equal(
      STATUSES.reduce((sum, state) => sum + report.counts[state], 0),
      report.counts.observed,
      'the four states partition the population exactly',
    );
    for (const state of STATUSES) {
      assert.equal(report.issuers.filter((row) => row.state === state).length, report.counts[state]);
    }
  });

  it('does the same on the admitted dataset, where every issuer is covered', () => {
    assert.ok(installed !== null);
    const report = coverageOf(installed.content, installed.manifest);
    assert.equal(report.counts.observed, 3);
    assert.equal(report.counts.COVERED, 3);
    assert.equal(report.counts.NO_FINANCIALS, 0);
    assert.equal(report.counts.SECTOR_NOT_MEASURED, 0);
    assert.equal(report.counts.ISSUED_DATA, 0);
    assert.equal(STATUSES.reduce((sum, state) => sum + report.counts[state], 0), report.counts.observed);
    assert.equal(report.dataset.datasetClass, 'OPERATOR_SUPPLIED', 'the admitted population is labelled as operator-supplied');
  });

  it('counts identity separately per source, and discloses watchlist sector refs as such', () => {
    const bindings = fixtureObservations().map((observation) =>
      buildBinding(observation, resolveIdentity(identityInputOf(observation), fixtureContext), fixtureContext),
    );
    const bySource = new Map<string, { total: number; assessable: number; sectorRefs: number }>();
    for (const binding of bindings) {
      const entry = bySource.get(binding.source) ?? { total: 0, assessable: 0, sectorRefs: 0 };
      entry.total += 1;
      entry.assessable += binding.assessable ? 1 : 0;
      entry.sectorRefs += binding.reason === 'SECTOR_REFERENCE_NOT_AN_IDENTITY' ? 1 : 0;
      bySource.set(binding.source, entry);
    }
    assert.deepEqual([...bySource.keys()].sort(), ['BROKER_PREVIEW', 'HOLDING', 'WATCHLIST'], 'counted separately per source');
    assert.equal(bySource.get('WATCHLIST')!.sectorRefs, 1, 'the watchlist sector reference is disclosed as a sector reference');
    assert.equal(bySource.get('HOLDING')!.sectorRefs, 1, 'and so is the holding-side one');
    assert.equal(bySource.get('BROKER_PREVIEW')!.assessable, 1);
    assert.equal(bindings.filter((binding) => binding.assessable).length, 4, 'nothing is promoted into the assessable total');
  });

  it('records the real-holdings limb as Stage 5', () => {
    /*
     * NOT DEMONSTRATED: §23's note is "needs Stages 2–3 + binding for real holdings". Stages 2–3 are done;
     * the binding is D5/D6, IPD-owned. A real portfolio page therefore belongs to Stage 5.
     */
    assert.ok(['D5 ipd-binding-precondition', 'D6 ipc-endpoint'].length === 2);
  });
});

/* -------------------------------------------------------------------------------------------------- *
 * The matrix itself: the accounting, the labels, and §23's rule that no synthetic figure is cited as
 * coverage. This is the suite that makes the counts a checked fact rather than a sentence in a record —
 * the first Stage 4 record stated three mutually inconsistent counts for this demo.
 * -------------------------------------------------------------------------------------------------- */
type Verdict = 'DEMONSTRATED' | 'PARTIALLY_DEMONSTRATED';

interface ScenarioRow {
  readonly id: number;
  readonly marker: string;
  readonly labels: readonly string[];
  readonly verdict: Verdict;
  /** The exact prerequisite for the limb that is not demonstrated; null when everything is. */
  readonly residual: string | null;
}

const MATRIX: readonly ScenarioRow[] = [
  { id: 1, marker: '(R, Infosys)', labels: [operator(BUNDLE_INFOSYS)], verdict: 'PARTIALLY_DEMONSTRATED',
    residual: 'minted assessment chain — needs D2 (NP-04 store) and G-11; UI limbs need G-10/G-11' },
  { id: 2, marker: '(S or any 2-period issuer)', labels: [SYNTHETIC], verdict: 'DEMONSTRATED', residual: null },
  { id: 3, marker: '(S)', labels: [SYNTHETIC], verdict: 'DEMONSTRATED', residual: null },
  { id: 4, marker: '(S)', labels: [SYNTHETIC], verdict: 'DEMONSTRATED', residual: null },
  { id: 5, marker: 'unmarked; §23 "preview path works; portfolio path blocked on IPD binding"', labels: [SYNTHETIC],
    verdict: 'PARTIALLY_DEMONSTRATED', residual: 'holding persistence — needs D5 (IPD binding) and D6 (IPC endpoint)' },
  { id: 6, marker: 'unmarked', labels: [SYNTHETIC], verdict: 'DEMONSTRATED', residual: null },
  { id: 7, marker: '(S)', labels: [SYNTHETIC], verdict: 'DEMONSTRATED', residual: null },
  { id: 8, marker: 'unmarked; §23 "fully demonstrable in fixtures; Marico/KEC ... on real data"',
    labels: [SYNTHETIC, operator(BUNDLE_MARICO), operator(BUNDLE_KEC)], verdict: 'DEMONSTRATED', residual: null },
  { id: 9, marker: '(R, KEC debt-side)', labels: [operator(BUNDLE_KEC)], verdict: 'PARTIALLY_DEMONSTRATED',
    residual: '§23 predicts adequacy PARTIAL; measured SUFFICIENT — REQUIRED_ITEMS excludes the debt-side items (a recorded divergence, not a missing input)' },
  { id: 10, marker: 'unmarked; §23 "needs Stages 2–3 + binding for real holdings"',
    labels: [SYNTHETIC, operator(BUNDLE_INFOSYS), operator(BUNDLE_MARICO), operator(BUNDLE_KEC)],
    verdict: 'PARTIALLY_DEMONSTRATED', residual: 'real-holdings portfolio page — needs D5 (IPD binding) and D6 (IPC endpoint)' },
];

describe('§23 matrix accounting — the counts are a checked fact, and the labels are enforced', () => {
  it('accounts for all ten scenarios exactly once', () => {
    assert.equal(MATRIX.length, 10);
    assert.deepEqual(MATRIX.map((row) => row.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('reports 6 demonstrated, 4 partially demonstrated, 0 undemonstrable — and the parts sum to ten', () => {
    const demonstrated = MATRIX.filter((row) => row.verdict === 'DEMONSTRATED');
    const partial = MATRIX.filter((row) => row.verdict === 'PARTIALLY_DEMONSTRATED');
    assert.deepEqual(demonstrated.map((row) => row.id), [2, 3, 4, 6, 7, 8]);
    assert.deepEqual(partial.map((row) => row.id), [1, 5, 9, 10]);
    assert.equal(demonstrated.length + partial.length, MATRIX.length, 'no scenario is unaccounted for');
    assert.equal(MATRIX.filter((row) => row.residual === null).length, demonstrated.length);
  });

  it('attributes every residual limb to a Stage 5 dependency or a recorded divergence — never to the population', () => {
    /*
     * This is the correction S4-R1 exists to make. The first Stage 4 record claimed four scenarios needed an
     * owner population decision. None does: §23 designates four of them synthetic-fixture-only, and every
     * residual limb below is an IPD/D2 dependency or a measured divergence from a baseline prediction.
     */
    for (const row of MATRIX.filter((entry) => entry.residual !== null)) {
      const residual = row.residual!;
      const stage5 = /D2|D5|D6|G-10|G-11/.test(residual);
      const divergence = /divergence/.test(residual);
      assert.ok(stage5 || divergence, `scenario ${row.id}: residual must be a Stage 5 dependency or a recorded divergence — got "${residual}"`);
      assert.ok(!/admit|population|more issuers|new issuer/i.test(residual), `scenario ${row.id}: the residual must NOT be a population decision`);
    }
  });

  it('labels every scenario with exactly the classes §23 permits', () => {
    for (const row of MATRIX) {
      assert.ok(row.labels.length > 0, `scenario ${row.id} must be labelled`);
      for (const label of row.labels) {
        assert.ok(
          label === SYNTHETIC || /^OPERATOR_SUPPLIED (REL-1-INFOSYS|WI7-CONSUMER-MARICO|WI8-INDUSTRIALS-KEC)-2026-11-0[67]$/.test(label),
          `scenario ${row.id}: "${label}" is not a permitted label form`,
        );
      }
      if (row.marker.startsWith('(')) {
        const markerClass = row.marker.startsWith('(S') ? 'S' : 'R';
        if (markerClass === 'S') {
          assert.deepEqual([...row.labels], [SYNTHETIC], `scenario ${row.id} is (S): synthetic fixture only`);
        } else {
          assert.ok(row.labels.every((label) => label.startsWith('OPERATOR_SUPPLIED')), `scenario ${row.id} is (R): real bundle only`);
        }
      }
    }
  });

  it('cites no synthetic figure as coverage: the coverage population is exactly the three admitted issuers', () => {
    assert.ok(installed !== null);
    const ids = installed.content.issuers.map((issuer) => issuer.issuerId).sort();
    assert.deepEqual(ids, [...ADMITTED_CINS].sort(), 'the coverage figures come only from admitted bundles');
    for (const id of ids) {
      assert.ok(!fixtureContent.issuers.some((issuer) => issuer.issuerId === id), 'no synthetic fixture issuer is in the cited population');
    }
    assert.equal(installed.content.issuers.length, 3);
    assert.equal(installed.manifest.datasetVersion, HOST_DATASET_VERSION);
    assert.equal(installed.manifest.sourceRights.state, 'OPERATOR_ASSERTED', 'the cited dataset declares operator-supplied rights');
  });

  it('labels the served report itself, so the data class is a checked fact and not a prose claim', () => {
    assert.ok(installed !== null);
    const admitted = coverageOf(installed.content, installed.manifest);
    assert.equal(admitted.dataset.datasetClass, 'OPERATOR_SUPPLIED', 'the admitted dataset labels itself');

    const temp = writeTempDataset(fixtureContent);
    try {
      assert.equal(coverageOf(temp.content, temp.written.manifest).dataset.datasetClass, 'SYNTHETIC_FIXTURE',
        'and the fixture labels itself differently, on the strength of its own declaration');
    } finally {
      temp.cleanup();
    }
    assert.equal(coverageOf(fixtureContent).dataset.datasetClass, 'NONE',
      'with no manifest at all the class is NONE — never guessed, and never OPERATOR_SUPPLIED');
  });

  it('keeps the two populations visibly distinct, so a fixture figure can never be mistaken for a real one', () => {
    for (const issuer of fixtureContent.issuers) {
      assert.match(issuer.legalName, /\(synthetic\)$/, 'every fixture issuer name carries the synthetic marker');
      assert.ok(!ADMITTED_CINS.includes(issuer.issuerId as (typeof ADMITTED_CINS)[number]));
    }
    for (const issuer of installed!.content.issuers) {
      assert.ok(!/\(synthetic\)/.test(issuer.legalName), 'no admitted issuer is labelled synthetic');
    }
  });
});
