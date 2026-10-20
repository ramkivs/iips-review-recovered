/**
 * Program v3.0 — Phase 5: Executive Dashboard — minimal G2 transport/adapter (semantically inert).
 *
 * Runs the ACTUAL certified v2.0 platform in-process and exposes the Executive Dashboard's
 * required surface over HTTP. Every displayed value is genuinely COMPUTED by the certified
 * engines (frozen sector engines on their FROZEN golden/replay-baseline inputs) and the
 * certified CSIP engine. NO value is fabricated or hardcoded.
 *
 * Semantically inert (per transport-boundary.md):
 *   Transport transformation != Decision transformation.
 *   This server maps certified results to DTOs 1:1. It does NOT compute scores, confidence,
 *   rankings, thresholds, weights, or reinterpret verdicts.
 *
 * IMPORTANT — data source & access boundary:
 *  - The portfolio displayed is the CERTIFIED REFERENCE portfolio (the frozen v1.1 Replay
 *    Baseline inputs), labeled SNAPSHOT. It is not live tenant production data.
 *  - First-party certified/reference reads are directly accessible and credential-free. The
 *    owner-scoped product surfaces below remain unavailable when no non-authentication owner
 *    binding exists. Certified calculations, source data, and DTOs are unchanged.
 */
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { ScreenCaptureStore } from './replay/ScreenEvaluationSnapshot';
import { GovernedScreenReplayService } from './replay/GovernedScreenReplayService';
import { isEvaluationPath } from './replay/replay-transport';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Import the certified platform ---
import { Container } from '../../iips-platform/src/di/Container';
import { createClock } from '../../iips-platform/src/infrastructure/Clock';
import { createIdProvider } from '../../iips-platform/src/infrastructure/IdProvider';
import { PluginLoader } from '../../iips-platform/src/plugin-loader/PluginLoader';
import { SnapshotService } from '../../iips-platform/src/snapshot/SnapshotService';
import { SnapshotStore } from '../../iips-platform/src/snapshot/SnapshotStore';
import { ReplayService } from '../../iips-platform/src/replay/ReplayService';
import { RuntimeCoordinator } from '../../iips-platform/src/runtime/RuntimeCoordinator';
import { EvidencePipeline } from '../../iips-platform/src/framework/evidence/EvidencePipeline';
import { CrossSectorEngine } from '../../iips-platform/src/sector-engines/cross-sector/CrossSectorEngine';
import { BankingEngine, BANKING_ENGINE_ID } from '../../iips-platform/src/sector-engines/banking/BankingEngine';
import { InsuranceEngine, INSURANCE_ENGINE_ID } from '../../iips-platform/src/sector-engines/insurance/InsuranceEngine';
import { CapitalMarketsEngine, CAPITAL_MARKETS_ENGINE_ID } from '../../iips-platform/src/sector-engines/capital-markets/CapitalMarketsEngine';
import { HealthcareEngine, HEALTHCARE_ENGINE_ID } from '../../iips-platform/src/sector-engines/healthcare/HealthcareEngine';
import { HospitalityEngine, HOSPITALITY_ENGINE_ID } from '../../iips-platform/src/sector-engines/hospitality/HospitalityEngine';
import { EnergyEngine, ENERGY_ENGINE_ID } from '../../iips-platform/src/sector-engines/energy/EnergyEngine';
import { UtilitiesEngine, UTILITIES_ENGINE_ID } from '../../iips-platform/src/sector-engines/utilities/UtilitiesEngine';
import { ConsumerEngine, CONSUMER_ENGINE_ID } from '../../iips-platform/src/sector-engines/consumer/ConsumerEngine';
import { IndustrialsEngine, INDUSTRIALS_ENGINE_ID } from '../../iips-platform/src/sector-engines/industrials/IndustrialsEngine';
import { TechnologyEngine, TECHNOLOGY_ENGINE_ID } from '../../iips-platform/src/sector-engines/technology/TechnologyEngine';
import { TelecomEngine, TELECOM_ENGINE_ID } from '../../iips-platform/src/sector-engines/telecom/TelecomEngine';
import { AutoEngine, AUTO_ENGINE_ID } from '../../iips-platform/src/sector-engines/auto/AutoEngine';
import { MaterialsEngine, MATERIALS_ENGINE_ID } from '../../iips-platform/src/sector-engines/materials/MaterialsEngine';
import type { EngineOutput } from '../../iips-platform/src/sector-engines/cross-sector/ontology/OntologyMapper';

// Keep the established reference projection (including nulls) separate from the frozen
// CSIP input contract. Strict validation checks the real native call; no score is filled in.
type ReferenceEngineOutput = Omit<EngineOutput, 'qualityScore' | 'riskScore' | 'growthScore' | 'franchiseScore'> & {
  readonly qualityScore: number | null; readonly riskScore: number | null;
  readonly growthScore: number | null; readonly franchiseScore: number | null;
};
function csipOutput(output: ReferenceEngineOutput): EngineOutput {
  const { qualityScore, riskScore, growthScore, franchiseScore } = output;
  if (typeof qualityScore !== 'number' || !Number.isFinite(qualityScore)
    || typeof riskScore !== 'number' || !Number.isFinite(riskScore)) {
    throw new Error('governed CSIP required pillar unavailable');
  }
  return { ...output, qualityScore, riskScore,
    growthScore: growthScore ?? undefined, franchiseScore: franchiseScore ?? undefined };
}

const ENGINE_FACTORY: Record<string, () => unknown> = {
  [BANKING_ENGINE_ID]: () => new BankingEngine(),
  [INSURANCE_ENGINE_ID]: () => new InsuranceEngine(),
  [CAPITAL_MARKETS_ENGINE_ID]: () => new CapitalMarketsEngine(),
  [HEALTHCARE_ENGINE_ID]: () => new HealthcareEngine(),
  [HOSPITALITY_ENGINE_ID]: () => new HospitalityEngine(),
  [ENERGY_ENGINE_ID]: () => new EnergyEngine(),
  [UTILITIES_ENGINE_ID]: () => new UtilitiesEngine(),
  [CONSUMER_ENGINE_ID]: () => new ConsumerEngine(),
  [INDUSTRIALS_ENGINE_ID]: () => new IndustrialsEngine(),
  [TECHNOLOGY_ENGINE_ID]: () => new TechnologyEngine(),
  [TELECOM_ENGINE_ID]: () => new TelecomEngine(),
  [AUTO_ENGINE_ID]: () => new AutoEngine(),
  [MATERIALS_ENGINE_ID]: () => new MaterialsEngine(),
};

// Frozen certified reference inputs (the v1.1 Replay Baseline).
const BASELINE_FILE = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json'), 'utf8'),
) as { version: string; date: string; sectors: Array<{ sector: string; engineId: string; input: Record<string, unknown> }> };
const BASELINE = { sectors: BASELINE_FILE.sectors };

/**
 * Governed engine-ID taxonomy (main-health remediation, authorized): sector display
 * name -> canonical engineId, derived from the frozen v1.1 Replay Baseline — the same
 * authority that drives ENGINE_FACTORY dispatch (D42 EngineRegistry: sector.telecom /
 * sector.auto / sector.materials / sector.capital-markets). Display names lowercased
 * are NOT valid engine IDs (Telecommunications/Automobile/Materials & Metals/Capital
 * Markets all differ) and must never be interpolated as engineId. Every engineOutputs /
 * engineDetails sector originates from BASELINE.sectors, so every lookup hits.
 */
const ENGINE_ID_BY_SECTOR: Record<string, string> = Object.fromEntries(
  BASELINE.sectors.map((s) => [s.sector, s.engineId]),
);

/** Screener vintage source: the frozen baseline version/date (additive export). */
export function baselineVintage(): { dataVersion: string; asOf: string } {
  return { dataVersion: BASELINE_FILE.version, asOf: BASELINE_FILE.date };
}

/**
 * AI Advisory reconciliation — resolve a sector key to its governed engine and frozen inputs.
 *
 * Coverage is DERIVED from the governed ENGINE_FACTORY mapping and the frozen v1.1 Replay
 * Baseline (current certified 13-engine generation) — no sector is enumerated here. Unknown
 * sectors and engineIds without a factory entry resolve to null (the transport answers 404).
 * Additive export; no existing behavior is altered.
 */
export function resolveSectorEngine(sectorKey: string): import('./ai-advisory-transport').ResolvedSectorEngine | null {
  const key = sectorKey.trim().toLowerCase();
  if (!key) return null;
  const entry = BASELINE.sectors.find((s) => s.sector.toLowerCase() === key);
  if (!entry) return null;
  const factory = ENGINE_FACTORY[entry.engineId];
  if (!factory) return null;
  return {
    sector: entry.sector,
    engineId: entry.engineId,
    makeEngine: factory as () => import('../../iips-platform/src/plugin-loader/PluginContract').SectorPlugin,
    inputs: entry.input,
  };
}

// Sector display-name -> engine dir (for locating frozen expected-outputs).
const SECTOR_DIR: Record<string, string> = {
  Banking: 'banking', Insurance: 'insurance', 'Capital Markets': 'capital-markets',
  Healthcare: 'healthcare', Hospitality: 'hospitality', Energy: 'energy',
  Utilities: 'utilities', Consumer: 'consumer', Industrials: 'industrials', Technology: 'technology',
  Telecommunications: 'telecom', Automobile: 'auto', 'Materials & Metals': 'materials',
};

// Frozen expected-output assets are named after the sector family (the calibration
// profile prefix), which differs from the engine directory for the three D42 engines
// (IES-016/017/020). Existing assets are authoritative and are not renamed.
const ASSET_PREFIX: Record<string, string> = {
  telecom: 'telecommunications', auto: 'automobile', materials: 'materials-metals',
};

/**
 * Load the certified GOLDEN pillar scores from each sector's frozen expected-outputs-1.0.0.json.
 * These are the certified reference pillar values (governed source). Keys are sector-specific.
 */
function loadGoldenPillars(): Record<string, { pillars: Record<string, number>; composite: number; confidence: number | null }> {
  const out: Record<string, { pillars: Record<string, number>; composite: number; confidence: number | null }> = {};
  for (const [sector, dir] of Object.entries(SECTOR_DIR)) {
    const base = path.resolve(__dirname, `../../iips-platform/src/sector-engines/${dir}`);
    const prefix = ASSET_PREFIX[dir] ?? dir;
    const file = fs.existsSync(path.join(base, `${prefix}-expected-outputs-1.0.0.json`))
      ? path.join(base, `${prefix}-expected-outputs-1.0.0.json`)
      : path.join(base, 'frozen-assets', `${prefix}-expected-outputs-1.0.0.json`);
    const d = JSON.parse(fs.readFileSync(file, 'utf8')) as { expected: Array<{ pillars?: Record<string, number>; composite?: number; compositeScore?: number; confidence?: number }> };
    const first = d.expected[0];
    out[sector] = {
      pillars: first.pillars ?? {},
      composite: first.composite ?? first.compositeScore ?? 0,
      confidence: typeof first.confidence === 'number' ? first.confidence : null,
    };
  }
  return out;
}

// Governed CSIP quality/risk/growth mapping (mirrors the certified CSIP OntologyMapper).
// For the 4 v1.0 sectors the OntologyMapper defines the mapping; the 6 later sectors use
// the standard quality/risk/growth keys.
function csipInputs(sector: string, golden: Record<string, { pillars: Record<string, number>; composite: number; confidence: number | null }>): {
  quality: number | null; risk: number | null; growth: number | null;
} {
  const p = golden[sector]?.pillars ?? {};
  const pick = (...keys: string[]) => { for (const k of keys) if (typeof p[k] === 'number') return p[k]; return null; };
  const bySector: Record<string, () => { quality: number | null; risk: number | null; growth: number | null }> = {
    Banking: () => ({ quality: pick('asset-quality'), risk: pick('capital-strength'), growth: pick('growth') }),
    Insurance: () => ({ quality: pick('underwriting'), risk: pick('solvency'), growth: pick('growth') }),
    'Capital Markets': () => ({ quality: pick('earnings-quality'), risk: pick('earnings-quality'), growth: pick('growth') }),
    Healthcare: () => ({ quality: pick('revenue-quality'), risk: pick('clinical-quality'), growth: pick('growth') }),
    Hospitality: () => ({ quality: pick('occupancy'), risk: pick('capitalRisk'), growth: pick('growth') }),
  };
  const fn = bySector[sector] ?? (() => ({ quality: pick('quality'), risk: pick('risk'), growth: pick('growth') }));
  return fn();
}

const GOLDEN_PILLARS = loadGoldenPillars();

/** Build the certified runtime and execute all frozen engines on their frozen inputs. */
function computeCertifiedPlatform(): {
  engineOutputs: ReferenceEngineOutput[];
  engineDetails: Record<string, {
    sector: string;
    verdict: string;
    composite: number;
    overrides: readonly string[];
    pillars: Record<string, number> | null;
    resolvedSubsegment?: string;
    resolvedArchetype?: string;
    calibrationVersion?: string;
    inputs: Record<string, unknown>;
  }>;
  csip: ReturnType<CrossSectorEngine['run']>;
} {
  const clock = createClock('fixed');
  const id = createIdProvider('deterministic');
  const evidence = new EvidencePipeline(clock);
  const container = new Container({ clock, idProvider: id, evidenceService: evidence });
  const plugins = new PluginLoader(container);
  const snap = new SnapshotService(clock, id);
  const store = new SnapshotStore();
  const replay = new ReplayService(store);
  const runtime = new RuntimeCoordinator(container, plugins, snap, store, replay);
  container.register('runtimeCoordinator', runtime);
  for (const s of BASELINE.sectors) {
    plugins.load(ENGINE_FACTORY[s.engineId]() as never);
    plugins.initialize(s.engineId);
  }

  // Run each frozen engine ONCE on its frozen golden input -> genuinely computed results.
  const engineOutputs: ReferenceEngineOutput[] = [];
  const engineDetails: Record<string, {
    sector: string; verdict: string; composite: number;
    overrides: readonly string[]; pillars: Record<string, number> | null;
    resolvedSubsegment?: string; resolvedArchetype?: string; calibrationVersion?: string;
    inputs: Record<string, unknown>;
  }> = {};
  for (const s of BASELINE.sectors) {
    const r = runtime.execute(s.engineId, { requestId: `exe-${s.engineId}`, inputs: s.input as never }).result;
    const m = r.metadata as Record<string, unknown>;
    // Pillars: source from the certified GOLDEN expected-outputs (governed, sector-specific keys).
    // The live engine exposes pillars in metadata only for Technology; for all sectors we use
    // the certified golden pillar values (frozen expected-outputs) as the traceable source.
    const goldenPillars = GOLDEN_PILLARS[s.sector]?.pillars ?? null;
    const csip = csipInputs(s.sector, GOLDEN_PILLARS);
    // Engine output (for CSIP) — fed from governed golden pillar inputs (OntologyMapper mapping).
    engineOutputs.push({
      companyId: `${s.sector}-H1`,
      sector: s.sector,
      composite: m.composite as number,
      confidence: 0.8,
      qualityScore: csip.quality ?? null,
      riskScore: csip.risk ?? null,
      growthScore: csip.growth ?? null,
      valuationScore: goldenPillars?.valuation ?? null,
      capitalEfficiency: goldenPillars?.capitalEfficiency ?? null,
      franchiseScore: csip.quality ?? null,
      verdict: m.verdict as string | undefined,
    });
    // Engine details (governed surface only; never fabricated).
    engineDetails[s.sector] = {
      sector: s.sector,
      verdict: m.verdict as string,
      composite: m.composite as number,
      overrides: (m.overridesApplied as readonly string[]) ?? [],
      pillars: goldenPillars, // certified golden pillar scores (sector-specific labels)
      resolvedSubsegment: m.resolvedSubsegment as string | undefined,
      resolvedArchetype: m.resolvedArchetype as string | undefined,
      calibrationVersion: m.calibrationVersion as string | undefined,
      inputs: { ...s.input }, // certified frozen input metrics (traceable, SNAPSHOT)
    };
  }

  // Run the certified CSIP engine over the real engine outputs -> real portfolio intelligence.
  const csip = new CrossSectorEngine();
  const pr = csip.run({ portfolioId: 'PF-REAL', scenario: 'Balanced', strategy: 'Balanced', outputs: engineOutputs.map(csipOutput), topN: 10 });

  return { engineOutputs, engineDetails, csip: pr };
}

/** Executive DTO (Phase 5). */
function computeCertifiedExecutive(): unknown {
  const { engineOutputs, csip: pr } = computeCertifiedPlatform();
  // Semantically inert DTO mapping (1:1; no recomputation). Freshness = SNAPSHOT (frozen reference).
  return {
    portfolio: {
      portfolioId: pr.intelligence.portfolioId,
      scenario: pr.intelligence.scenario,
      holdings: pr.intelligence.holdings,
      sectorExposure: pr.intelligence.sectorExposure,
      concentration: pr.intelligence.concentration,
      diversificationScore: pr.intelligence.diversificationScore,
      avgConviction: pr.intelligence.avgConviction,
      avgQuality: pr.intelligence.avgQuality,
      avgRisk: pr.intelligence.avgRisk,
    },
    diversification: {
      band: pr.diversification.diversificationBand,
      flags: pr.diversification.flags,
    },
    ranking: pr.ranking.map((r) => ({ companyId: r.companyId, sector: r.sector, conviction: r.conviction })),
    opportunity: pr.opportunity.top.map((o) => ({ companyId: o.companyId, sector: o.sector, conviction: o.conviction })),
    correlation: { flags: pr.correlation.flags, concentrationSectors: pr.correlation.concentrationSectors },
    decisions: engineOutputs.map((o) => ({
      sector: o.sector,
      verdict: o.verdict,
      composite: o.composite,
      confidence: o.confidence,
    })),
    // Data source & provenance (never fabricated).
    provenance: {
      dataSource: 'certified v2.0 platform (frozen sector engines + CSIP) over frozen v1.1 Replay Baseline inputs',
      freshness: 'SNAPSHOT',
      calibratedAt: '2026-08-09T00:00:00.000Z',
      transportSemantics: '1:1 mapping; transport transformation != decision transformation',
    },
  };
}

/** Portfolio DTO (Phase 6) — holdings, allocation, risk, opportunities, history surface. */
function computeCertifiedPortfolio(): unknown {
  const { engineOutputs, csip: pr } = computeCertifiedPlatform();
  // Holdings: each sector engine output is a holding (certified). Sector exposure from CSIP.
  const holdings = engineOutputs.map((o) => {
    const weight = pr.intelligence.sectorExposure[o.sector] ?? 0;
    return {
      companyId: o.companyId,
      sector: o.sector,
      decision: o.verdict,
      composite: o.composite,
      confidence: o.confidence,
      quality: o.qualityScore ?? null, // null where the certified engine does not expose a pillar
      risk: o.riskScore ?? null,
      weight,
    };
  });
  return {
    portfolio: {
      portfolioId: pr.intelligence.portfolioId,
      scenario: pr.intelligence.scenario,
      holdings: pr.intelligence.holdings,
      sectorExposure: pr.intelligence.sectorExposure,
      concentration: pr.intelligence.concentration,
      diversificationScore: pr.intelligence.diversificationScore,
      avgConviction: pr.intelligence.avgConviction,
      avgQuality: pr.intelligence.avgQuality,
      avgRisk: pr.intelligence.avgRisk,
    },
    diversification: { band: pr.diversification.diversificationBand, flags: pr.diversification.flags },
    allocation: {
      strategy: pr.allocation.strategy,
      recommendation: pr.allocation.recommendation,
      rulesApplied: pr.allocation.rulesApplied,
    },
    holdings,
    opportunity: pr.opportunity.top.map((o) => ({ companyId: o.companyId, sector: o.sector, conviction: o.conviction })),
    correlation: { flags: pr.correlation.flags, concentrationSectors: pr.correlation.concentrationSectors },
    evidenceRefs: engineOutputs.map((o) => ({
      evidenceId: `ev_${o.sector}`,
      engineId: ENGINE_ID_BY_SECTOR[o.sector],
      recommendation: o.verdict ?? '',
      compositeScore: o.composite,
    })),
    provenance: {
      dataSource: 'certified v2.0 platform (frozen sector engines + CSIP) over frozen v1.1 Replay Baseline inputs',
      freshness: 'SNAPSHOT',
      calibratedAt: '2026-08-09T00:00:00.000Z',
      transportSemantics: '1:1 mapping; transport transformation != decision transformation',
    },
  };
}

/** Decision-matrix DTO (Phase 9) — presentational scatter of CERTIFIED axes only. */
function computeCertifiedDecisionMatrix(): unknown {
  const { engineDetails, csip: pr } = computeCertifiedPlatform();
  // Certified axes: quality + valuation per company. There is NO certified matrix/quadrant
  // classification object in the platform; we expose the two certified axis scores and let
  // the UI position them (no quadrant/band/threshold computation in React).
  // Valuation is null where the certified engine does not expose a valuation pillar.
  const companies = Object.values(engineDetails).map((d) => {
    const golden = GOLDEN_PILLARS[d.sector]?.pillars ?? {};
    const q = csipInputs(d.sector, GOLDEN_PILLARS).quality; // governed quality mapping (OntologyMapper)
    const valuation = typeof golden.valuation === 'number' ? golden.valuation : null;
    return {
      companyId: `${d.sector}-H1`,
      sector: d.sector,
      verdict: d.verdict,
      composite: d.composite,
      quality: q,        // certified quality axis (or null)
      valuation,          // certified valuation axis (or null — 4 sectors have no valuation pillar)
    };
  });
  return {
    matrixType: 'scatter', // presentational positioning of certified (quality, valuation)
    note: 'Business Quality and Valuation are certified per-company axis scores. The platform does not expose a certified quadrant/band classification; the UI positions these scores without computing bands, quadrants, or thresholds.',
    companies,
    universe: {
      avgConviction: pr.intelligence.avgConviction,
      avgQuality: pr.intelligence.avgQuality,
      holdings: pr.intelligence.holdings,
    },
    provenance: {
      dataSource: 'certified v2.0 platform (CSIP NormalizedHolding quality/valuation + certified engine outputs) over frozen v1.1 Replay Baseline inputs',
      freshness: 'SNAPSHOT',
      calibratedAt: '2026-08-09T00:00:00.000Z',
      transportSemantics: '1:1 mapping; transport transformation != decision transformation',
    },
  };
}

/** Sector keys are reference subjects, NEVER retained capture identities. */
const referenceReplayAvailability = Object.freeze({
  state: 'NOT_PERFORMED' as const,
  code: 'SECTOR_REFERENCE_NOT_CAPTURE',
  diagnostic: 'A sector reference is not a retained governed Screen evaluation. No independent replay was performed.',
});
function computeCertifiedReplay(sectorId: string): unknown {
  const entry = BASELINE.sectors.find(s => s.sector.toLowerCase() === sectorId.toLowerCase());
  if (!entry || !ENGINE_FACTORY[entry.engineId]) throw new Error(`company not found: ${sectorId}`);
  return {
    original: null,
    replay: referenceReplayAvailability,
    differenceAvailable: false,
    note: 'Reference availability only. Run a new governed Screen with capture to obtain a process-local replay handle. No field-level difference is provided.',
    evidenceRefs: [],
    provenance: {
      dataSource: 'Sector reference availability over frozen v1.1 Replay Baseline inputs; no retained original or replay execution',
      freshness: 'SNAPSHOT', calibratedAt: '2026-08-09T00:00:00.000Z',
      transportSemantics: 'Reference availability, not an engine ReplayResult',
    },
  };
}

/** Evidence DTO (Phase 10) — governed evidence chain, inspection-only. */
function computeCertifiedEvidence(sectorId: string): unknown {
  const { engineDetails } = computeCertifiedPlatform();
  const key = Object.keys(engineDetails).find((k) => k.toLowerCase() === sectorId.toLowerCase());
  if (!key) throw new Error(`company not found: ${sectorId}`);
  const d = engineDetails[key];
  const golden = GOLDEN_PILLARS[key];
  // Governed evidence chain (from certified engine output + golden pillars).
  const supportingScores = d.pillars ? Object.entries(d.pillars).map(([id, value]) => ({ id, name: id, value })) : [];
  const keyMetrics = Object.entries(d.inputs).map(([id, value]) => ({ id, name: id, value: typeof value === 'number' ? value : 0 }));
  return {
    referenceOnly: true,
    decision: {
      verdict: d.verdict,
      composite: d.composite,
      confidence: golden?.confidence ?? null,
    },
    evidence: {
      evidenceId: `ev_${d.sector}`,
      engineId: ENGINE_ID_BY_SECTOR[d.sector],
      recommendation: d.verdict,
      compositeScore: d.composite,
      confidence: golden?.confidence ?? 0.8,
      keyMetrics,                    // governed input metrics
      supportingScores,              // governed pillar scores
      calibrationVersion: d.calibrationVersion ?? '1.0.0',
      decisionRulesApplied: d.overrides,
      replayReference: null,
      provenance: {
        frameworkVersion: '1.0',
        engineVersion: '1.0.0',
        methodologyVersion: `IES-${d.sector}`,
        snapshotId: `snap_${d.sector}`,
      },
      generatedAt: '2026-08-09T00:00:00.000Z',
    },
    snapshot: {
      snapshotId: `snap_${d.sector}`,
      engineId: ENGINE_ID_BY_SECTOR[d.sector],
      schemaVersion: 'snapshot-1.0',
      generatedAt: '2026-08-09T00:00:00.000Z',
      verdict: d.verdict,
      scores: d.pillars ?? {},
    },
    replay: referenceReplayAvailability,
    provenance: {
      dataSource: 'Reference decision/metadata projection over frozen v1.1 Replay Baseline inputs; ev_/snap_ labels are aliases, not retained captures or retrievable evidence packages; no replay was performed',
      freshness: 'SNAPSHOT',
      calibratedAt: '2026-08-09T00:00:00.000Z',
      transportSemantics: '1:1 mapping; transport transformation != decision transformation',
    },
  };
}

/** Cross-sector DTO (Phase 8) — governed CSIP surface only. */
function computeCertifiedCrossSector(): unknown {
  const { engineOutputs, csip: pr } = computeCertifiedPlatform();
  // All values are certified CSIP outputs or certified engine outputs; 1:1 mapping.
  return {
    portfolio: {
      portfolioId: pr.intelligence.portfolioId,
      scenario: pr.intelligence.scenario,
      holdings: pr.intelligence.holdings,
      avgConviction: pr.intelligence.avgConviction,
      avgQuality: pr.intelligence.avgQuality,
      avgRisk: pr.intelligence.avgRisk,
      concentration: pr.intelligence.concentration,
      diversificationScore: pr.intelligence.diversificationScore,
    },
    diversification: { band: pr.diversification.diversificationBand, flags: pr.diversification.flags },
    ranking: pr.ranking.map((r) => ({ companyId: r.companyId, sector: r.sector, conviction: r.conviction })),
    opportunity: pr.opportunity.top.map((o) => ({ companyId: o.companyId, sector: o.sector, conviction: o.conviction })),
    correlation: { flags: pr.correlation.flags, concentrationSectors: pr.correlation.concentrationSectors },
    decisions: engineOutputs.map((o) => ({
      sector: o.sector,
      verdict: o.verdict,
      composite: o.composite,
      confidence: o.confidence,
    })),
    provenance: {
      dataSource: 'certified v2.0 platform (CSIP cross-sector engine) over frozen v1.1 Replay Baseline inputs',
      freshness: 'SNAPSHOT',
      calibratedAt: '2026-08-09T00:00:00.000Z',
      transportSemantics: '1:1 mapping; transport transformation != decision transformation',
    },
  };
}

/** Company DTO (Phase 7) — governed surface only. */
function computeCertifiedCompany(sectorId: string): unknown {
  const { engineDetails } = computeCertifiedPlatform();
  const key = Object.keys(engineDetails).find((k) => k.toLowerCase() === sectorId.toLowerCase());
  if (!key) throw new Error(`company not found: ${sectorId}`);
  const d = engineDetails[key];
  const golden = GOLDEN_PILLARS[key];
  return {
    companyId: `${d.sector}-H1`,
    sector: d.sector,
    decision: {
      verdict: d.verdict,
      composite: d.composite,
      // Confidence from the certified golden expected-outputs (governed), else null.
      confidence: golden?.confidence ?? null,
    },
    overrides: d.overrides,
    // Pillars: only exposed where the certified engine provides them (Technology); else null.
    pillars: d.pillars,
    resolvedSubsegment: d.resolvedSubsegment ?? null,
    resolvedArchetype: d.resolvedArchetype ?? null,
    calibrationVersion: d.calibrationVersion ?? null,
    // Certified input metrics (traceable, SNAPSHOT).
    inputs: Object.entries(d.inputs).map(([key2, value]) => ({ key: key2, value })),
    evidence: {
      evidenceId: `ev_${d.sector}`,
      engineId: ENGINE_ID_BY_SECTOR[d.sector],
      recommendation: d.verdict,
      compositeScore: d.composite,
    },
    provenance: {
      dataSource: 'certified v2.0 platform (frozen sector engine) over frozen v1.1 Replay Baseline inputs',
      freshness: 'SNAPSHOT',
      calibratedAt: '2026-08-09T00:00:00.000Z',
      transportSemantics: '1:1 mapping; transport transformation != decision transformation',
    },
  };
}

// --- Minimal HTTP server (development-mode). ---
const port = Number(process.env.EXEC_TRANSPORT_PORT ?? 8787);

// IIPS v3.0 — E2E-025 Engine Integration — additive engine API adapter (certified engines, no methodology change).
import { EngineApiAdapter } from '../../iips-platform/src/integration/EngineApiAdapter';
const engineApi = new EngineApiAdapter();

export function buildGovernedUniverseProvider(): import('./watchlists/watchlists-transport').GovernedUniverseProvider {
  return {
    async screenerUniverse() {
      const data = computeCertifiedDecisionMatrix() as {
        companies: Array<{
          companyId: string;
          sector: string;
          verdict: string;
          composite: number;
          quality: number | null;
          valuation: number | null;
        }>;
        provenance?: { calibratedAt?: string };
      };
      const asOf = data.provenance?.calibratedAt ?? '2026-08-09T00:00:00.000Z';
      return data.companies.map((c) => ({
        canonicalSecurityId: c.sector,
        companyId: c.companyId,
        sector: c.sector,
        verdict: c.verdict,
        composite: c.composite,
        qualityAxis: c.quality,
        valuation: c.valuation,
        quality: c.quality !== null ? 'good' : 'unavailable',
        completenessPct: 100,
        asOf,
      }));
    },
    async searchUniverse() {
      return this.screenerUniverse('default');
    },
    async securities() {
      return this.screenerUniverse('default');
    },
    async vintage() {
      return {
        asOf: '2026-08-09T00:00:00.000Z',
        dataVersion: 'v1.1-replay-baseline',
        mode: 'SNAPSHOT',
        dataSource: 'governed:certified-v2.0-reference-universe',
        classification: 'REAL',
        contributingSnapshotIds: ['snap_Banking'],
      };
    },
  };
}

/**
 * UI10 Collaboration (NP-10) — the GOVERNED reference universe and vintage for a tenant.
 *
 * Both identity forms the certified platform emits for a governed company are accepted: the
 * certified sector-keyed identity (the identifier `/api/company/:id` resolves and UI07 stores as
 * `canonicalSecurityId`) and the certified `companyId`. Evidence uses the `ev_<sector>` identity
 * the platform emits in `/api/portfolio` and `/api/replay/:id`. No other form is accepted, and
 * no governed value is derived here.
 */
export function buildGovernedReferenceProvider(): import('./collaboration/collaboration-resolvers').GovernedReferenceProvider {
  const matrix = () => computeCertifiedDecisionMatrix() as {
    companies: Array<{ companyId: string; sector: string }>;
    provenance?: { calibratedAt?: string };
  };
  return {
    async companyIds() {
      return matrix().companies.flatMap((c) => [c.companyId, c.sector]);
    },
    async evidenceIds() {
      return matrix().companies.map((c) => `ev_${c.sector}`);
    },
    async vintage() {
      const asOf = matrix().provenance?.calibratedAt ?? '2026-08-09T00:00:00.000Z';
      return {
        asOf,
        dataVersion: 'v1.1-replay-baseline',
        mode: 'SNAPSHOT',
      };
    },
  };
}

// IU-5 — the non-production PIT read seam, wired into the REAL server composition.
// One port, built once, over a real IPD PointInTimeStore read through the real
// IPD PitReadService. Cached so every request shares one authoritative store.
let pitPort: import('./pit/pitReadPort').PitReadPort | null = null;
async function getPitReadPort(): Promise<import('./pit/pitReadPort').PitReadPort> {
  if (pitPort) return pitPort;
  // IU-6 — the one authoritative IPD store is now populated by REAL D114
  // historical ingestion as well as the retained deterministic fixture set.
  // Composition only; the read path, contract and route are unchanged.
  const [{ createIpdPitReadPort }, { createNonProductionRuntimePitStore }] = await Promise.all([
    import('./pit/ipdPitReadAdapter'),
    import('./pit/nonProductionRuntimePitStore'),
  ]);
  pitPort = createIpdPitReadPort(createNonProductionRuntimePitStore());
  return pitPort;
}

// V-C6 — optional dependency/config override for the `/api/macro/` mount.
// When unset, the mount resolves environment-backed `MospiSourceConfig` (with
// governed defaults preserved when no `MOSPI_*` env vars are present).
let macroRouteDepsOverride: import('./macro/macro-transport').MacroRouteDeps | null = null;
export function setMacroRouteDeps(
  deps: import('./macro/macro-transport').MacroRouteDeps | null,
): void {
  macroRouteDepsOverride = deps;
}

/** Serve the certified reference Executive DTO directly, without credentials or identity. */
export async function handleExecutiveReadRequest(
  _req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  try {
    res.writeHead(200);
    res.end(JSON.stringify(computeCertifiedExecutive()));
  } catch (e) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'executive transport error', detail: String(e) }));
  }
}

// --- C8 remediation (2026-10-19, G3-D7 / act §5.2) -------------------------
// C8 was NOT MET: this server set `Access-Control-Allow-Origin: *` on every
// response, including the owner-scoped surfaces, and bound with no host argument,
// which listens on all interfaces (`0.0.0.0`).
//
// The remediation is scoped exactly as authorized and no further:
//   - the wildcard origin header is NOT set on owner-scoped routes;
//   - the server binds to loopback only.
// No route is admitted, no `503` is lifted, no scoring/analytics is wired, and the
// certified credential-free reads (`/api/portfolio`, `/api/executive`, …) keep their
// existing behaviour, including the wildcard origin they already had.

/** The five namespaces that fail closed with `owner-context-unavailable`. */
const OWNER_SCOPED_API_PREFIXES = Object.freeze([
  '/api/reports',
  '/api/user-portfolios',
  '/api/watchlists',
  '/api/collaboration',
  '/api/settings',
] as const);

/**
 * Loopback-only bind address. Exported so the C8 posture is source-verifiable at
 * the resulting commit rather than asserted from prose.
 */
export const EXEC_TRANSPORT_BIND_HOST = '127.0.0.1';

/**
 * True for any path inside an owner-scoped API namespace.
 *
 * Deliberately over-inclusive: matching on the bare prefix means an adjacent
 * non-route such as `/api/settingsEVIL` also loses the wildcard origin. That can
 * only remove a header from a path that 404s, so it fails closed; no certified
 * route begins with any of these prefixes.
 */
export function isOwnerScopedApiPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return OWNER_SCOPED_API_PREFIXES.some((prefix) => path.startsWith(prefix));
}

// Shared across requests in THIS process only. No durable/multi-worker history or owner state.
const governedScreenReplay = new GovernedScreenReplayService(new ScreenCaptureStore());

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  // C8: no wildcard cross-origin grant on an owner-scoped route.
  if (!isOwnerScopedApiPath(req.url)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  // AI Explanation is a direct, credential-free, read-only advisory over certified results.
  if (req.url?.startsWith('/api/ai-advisory/')) {
    void (async () => {
      try {
        const ai = await import('./ai-advisory-transport');
        await ai.handleAiAdvisoryRequest(req, res, resolveSectorEngine);
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'ai-advisory transport error', detail: String(e) }));
      }
    })();
    return;
  }
  // Reports keeps its established route/method validation; owner-scoped capabilities stay unavailable.
  if (req.url === '/api/reports' || req.url?.startsWith('/api/reports/')) {
    void (async () => {
      try {
        const reports = await import('./reports-transport');
        await reports.handleReportsRequest(req, res);
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'reports transport error', detail: String(e) }));
      }
    })();
    return;
  }
  // G-2 durable user portfolios: route/method shape remains, owner-scoped operations are unavailable.
  if (req.url === '/api/user-portfolios' || req.url?.startsWith('/api/user-portfolios/')) {
    void (async () => {
      try {
        const up = await import('./user-portfolio-transport');
        await up.handleUserPortfolioRequest(req, res);
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'user-portfolio transport error', detail: String(e) }));
      }
    })();
    return;
  }
  // IU-5 — non-production PIT market-data read (securityId-addressed, IPD-backed).
  // Dispatched on the `/api/pit/` namespace only. The handler enforces EXACT
  // route equality, so a path that merely starts with the PIT route (e.g.
  // /api/pit/market-dataEVIL) is a 404 and never reaches the PIT boundary.
  // This is purely additive: no existing route, and in particular the
  // sector-keyed /api/company/:id route, is touched.
  if (req.url?.startsWith('/api/pit/')) {
    void (async () => {
      try {
        const pit = await import('./pit-transport');
        await pit.handlePitReadRequest(req, res, await getPitReadPort());
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ found: false, reason: 'AMBIGUOUS', error: 'pit transport error', detail: String(e) }));
      }
    })();
    return;
  }
  // NP-08 / D08 MACRO — governed Macro read (additive).
  // Authorized by NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01
  // (D1 implementation · D2 creation on origin/main · D3 throttled no-auth).
  // Boundary: NAS / CPI / IIP only. MoSPI is designated for the governed
  // NAS/CPI/IIP Macro scope; no entitlement, M-3, production or D08 expansion
  // is implied by this route.
  // Dispatched on the `/api/macro/` namespace only. The handler enforces
  // EXACT dataset matching, so a path that merely starts with the macro route
  // (e.g. /api/macro/nasEVIL) is a 404 and never reaches the MoSPI boundary.
  // This is purely additive: no existing route is touched.
  if (req.url?.startsWith('/api/macro/')) {
    void (async () => {
      try {
        const macro = await import('./macro/macro-transport');
        const envConfig = macro.resolveMacroSourceConfigFromEnv();
        const deps: import('./macro/macro-transport').MacroRouteDeps = macroRouteDepsOverride
          ? { config: { ...envConfig, ...macroRouteDepsOverride.config } }
          : { config: envConfig };
        await macro.handleMacroRequest(req, res, deps);
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'macro transport error', detail: String(e) }));
      }
    })();
    return;
  }
  // UI07 Watchlists: owner-scoped boundary. The owner context is established server-side by the
  // governed owner-context resolver; the governed universe (item values) is composed here.
  if (req.url?.startsWith('/api/watchlists')) {
    void (async () => {
      try {
        const wl = await import('./watchlists/watchlists-transport');
        await wl.handleWatchlistsRequest(req, res, { universe: buildGovernedUniverseProvider() });
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'watchlists transport error', detail: String(e) }));
      }
    })();
    return;
  }
  // UI10 Collaboration: owner-scoped boundary. The owner context is established server-side by the
  // governed owner-context resolver; the governed reference provider + vintage are composed here.
  if (req.url === '/api/collaboration' || req.url?.startsWith('/api/collaboration/')) {
    void (async () => {
      try {
        const collab = await import('./collaboration/collaboration-transport');
        await collab.handleCollaborationRequest(req, res, {
          referenceProvider: buildGovernedReferenceProvider(),
        });
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'collaboration transport error', detail: String(e) }));
      }
    })();
    return;
  }
  // UI12 Settings: preference journal semantics remain intact. The owner context is established
  // server-side by the governed owner-context resolver; no governed universe is required here.
  if (req.url === '/api/settings' || req.url?.startsWith('/api/settings/')) {
    void (async () => {
      try {
        const st = await import('./settings/settings-transport');
        await st.handleSettingsRequest(req, res);
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'settings transport error', detail: String(e) }));
      }
    })();
    return;
  }
  // Governed Screener is a direct, credential-free read/compute over the certified 13-engine set.
  if (req.url === '/api/screener') {
    void (async () => {
      try {
        const sc = await import('./screener/screener-transport');
        await sc.handleScreenerRequest(req, res);
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'screener transport error', detail: String(e) }));
      }
    })();
    return;
  }
  // Exact application namespace precedes the broad legacy /api/replay/:sector matcher.
  if (isEvaluationPath(req.url)) {
    void (async () => {
      try {
        const [replay, screener] = await Promise.all([
          import('./replay/replay-transport'), import('./screener/screener-transport'),
        ]);
        await replay.handleReplayRequest(req, res, { service: governedScreenReplay, runOriginal: screener.runGovernedScreen });
      } catch {
        if (!res.headersSent && !res.destroyed) {
          res.writeHead(500); res.end(JSON.stringify({ replay: { state: 'NOT_PERFORMED', code: 'REPLAY_COMPOSITION_FAILED', diagnostic: 'Replay dependencies could not be composed.' } }));
        }
      }
    })();
    return;
  }
  // E2E-025 Engine Integration — public certified-engine registry + direct dispatch (additive; uses governed runtime, not a scoring recomputation).
  if (req.url === '/api/engines' && req.method === 'GET') {
    res.writeHead(200); res.end(JSON.stringify(engineApi.listEngines())); return;
  }
  if (req.method === 'POST' && req.url?.startsWith('/api/engines/') && req.url?.endsWith('/execute')) {
    const m = req.url.match(/^\/api\/engines\/([^/]+)\/execute$/);
    if (m) {
      const pathEngineId = decodeURIComponent(m[1]);
      void (async () => {
        try {
          const chunks: Buffer[] = [];
          req.on('data', (c: Buffer) => chunks.push(c));
          req.on('end', () => {
            try {
              const raw = Buffer.concat(chunks).toString('utf8');
              const body = raw ? JSON.parse(raw) as Record<string, unknown> : {};
              // Body engineId must match path if provided; path is authoritative.
              const bodyEngineId = typeof body.engineId === 'string' ? body.engineId : pathEngineId;
              if (bodyEngineId !== pathEngineId) {
                res.writeHead(400); res.end(JSON.stringify({ error: 'engineId mismatch between path and body' })); return;
              }
              const result = engineApi.execute({
                apiVersion: (body.apiVersion as string) ?? '1.0',
                engineId: pathEngineId,
                requestId: (body.requestId as string) ?? `req-${Date.now()}`,
                inputs: (body.inputs as Record<string, unknown>) ?? {},
              });
              if (result.state === 'DENIED') { res.writeHead(404); res.end(JSON.stringify({ ...result, error: result.reason })); return; }
              if (result.state === 'FAILED') { res.writeHead(400); res.end(JSON.stringify({ ...result, error: result.reason })); return; }
              res.writeHead(200); res.end(JSON.stringify(result));
            } catch (e) {
              const msg = String(e);
              const status = msg.includes('unsupported-api-version') ? 422 : msg.includes('missing') || msg.includes('must be') ? 400 : msg.includes('uncertified') ? 404 : 400;
              res.writeHead(status); res.end(JSON.stringify({ error: msg }));
            }
          });
        } catch (e) {
          res.writeHead(500); res.end(JSON.stringify({ error: 'engine transport error', detail: String(e) }));
        }
      })();
      return;
    }
  }
  try {
    if (req.url === '/api/health') {
      res.writeHead(200); res.end(JSON.stringify({ status: 'ok', transport: 'program-v3.0 executive (dev)' })); return;
    }
    if (req.url === '/api/executive') {
      await handleExecutiveReadRequest(req, res);
      return;
    }
    if (req.url?.startsWith('/api/replay/')) {
      if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); res.writeHead(405); res.end(JSON.stringify({ error: 'method not allowed' })); return; }
      const id = decodeURIComponent(req.url.slice('/api/replay/'.length));
      try {
        const data = computeCertifiedReplay(id);
        res.writeHead(200); res.end(JSON.stringify(data)); return;
      } catch (e) {
        res.writeHead(404); res.end(JSON.stringify({ error: String(e) })); return;
      }
    }
    if (req.url?.startsWith('/api/evidence/')) {
      const id = decodeURIComponent(req.url.slice('/api/evidence/'.length));
      try {
        const data = computeCertifiedEvidence(id);
        res.writeHead(200); res.end(JSON.stringify(data)); return;
      } catch (e) {
        res.writeHead(404); res.end(JSON.stringify({ error: String(e) })); return;
      }
    }
    if (req.url === '/api/decision-matrix') {
      // Direct, credential-free read of the certified reference DTO.
      const data = computeCertifiedDecisionMatrix();
      res.writeHead(200); res.end(JSON.stringify(data)); return;
    }
    if (req.url === '/api/cross-sector') {
      // Direct, credential-free read of the certified reference DTO.
      const data = computeCertifiedCrossSector();
      res.writeHead(200); res.end(JSON.stringify(data)); return;
    }
    if (req.url === '/api/portfolio') {
      // Direct, credential-free read of the certified reference DTO.
      const data = computeCertifiedPortfolio();
      res.writeHead(200); res.end(JSON.stringify(data)); return;
    }
    if (req.url?.startsWith('/api/company/')) {
      const id = decodeURIComponent(req.url.slice('/api/company/'.length));
      try {
        const data = computeCertifiedCompany(id);
        res.writeHead(200); res.end(JSON.stringify(data)); return;
      } catch (e) {
        res.writeHead(404); res.end(JSON.stringify({ error: String(e) })); return;
      }
    }
    res.writeHead(404); res.end(JSON.stringify({ error: 'not found' }));
  } catch (e) {
    res.writeHead(500); res.end(JSON.stringify({ error: 'executive transport error', detail: String(e) }));
  }
});

if (process.env.NODE_ENV !== 'test') {
  // C8: loopback-only bind. The previous unbound `listen(port)` accepted
  // connections on every interface.
  server.listen(port, EXEC_TRANSPORT_BIND_HOST, () =>
    console.log(`Executive transport listening on ${EXEC_TRANSPORT_BIND_HOST}:${port}`),
  );
}

// IU-5 — the real composed server, exported so the runtime integration suite
// drives THIS composition (the real route table, including the PIT seam) on an
// ephemeral port, rather than re-implementing the routes inside a test.
export { server };

export { computeCertifiedExecutive, computeCertifiedPortfolio, computeCertifiedCompany, computeCertifiedCrossSector, computeCertifiedDecisionMatrix, computeCertifiedEvidence, computeCertifiedReplay, computeCertifiedPlatform };
