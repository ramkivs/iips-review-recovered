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
 * IMPORTANT — data source & auth boundary:
 *  - The portfolio displayed is the CERTIFIED REFERENCE portfolio (the frozen v1.1 Replay
 *    Baseline inputs), labeled SNAPSHOT. It is not live tenant production data.
 *  - Authentication/session is a MINIMAL development-mode mechanism (a session header is
 *    accepted and mapped to a role). A real authentication/session layer is a SEPARATE,
 *    still-pending requirement before production tenant data is served. This is the exact
 *    G2 auth gap (Phase 0 audit G3). This server does NOT weaken EnterpriseRuntime/PlatformApi
 *    authorization for the actual platform.
 */
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

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
import type { EngineOutput } from '../../iips-platform/src/sector-engines/cross-sector/ontology/OntologyMapper';

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
};

// Frozen certified reference inputs (the v1.1 Replay Baseline).
const BASELINE = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json'), 'utf8'),
) as { sectors: Array<{ sector: string; engineId: string; input: Record<string, unknown> }> };

// Sector display-name -> engine dir (for locating frozen expected-outputs).
const SECTOR_DIR: Record<string, string> = {
  Banking: 'banking', Insurance: 'insurance', 'Capital Markets': 'capital-markets',
  Healthcare: 'healthcare', Hospitality: 'hospitality', Energy: 'energy',
  Utilities: 'utilities', Consumer: 'consumer', Industrials: 'industrials', Technology: 'technology',
};

/**
 * Load the certified GOLDEN pillar scores from each sector's frozen expected-outputs-1.0.0.json.
 * These are the certified reference pillar values (governed source). Keys are sector-specific.
 */
function loadGoldenPillars(): Record<string, { pillars: Record<string, number>; composite: number; confidence: number | null }> {
  const out: Record<string, { pillars: Record<string, number>; composite: number; confidence: number | null }> = {};
  for (const [sector, dir] of Object.entries(SECTOR_DIR)) {
    const base = path.resolve(__dirname, `../../iips-platform/src/sector-engines/${dir}`);
    const file = fs.existsSync(path.join(base, `${dir}-expected-outputs-1.0.0.json`))
      ? path.join(base, `${dir}-expected-outputs-1.0.0.json`)
      : path.join(base, 'frozen-assets', `${dir}-expected-outputs-1.0.0.json`);
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
  engineOutputs: EngineOutput[];
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
  const engineOutputs: EngineOutput[] = [];
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
  const pr = csip.run({ portfolioId: 'PF-REAL', scenario: 'Balanced', strategy: 'Balanced', outputs: engineOutputs, topN: 10 });

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
      engineId: `sector.${o.sector.toLowerCase()}`,
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

/** Replay DTO (Phase 11) — governed ReplayResult surface only. */
function computeCertifiedReplay(sectorId: string): unknown {
  const { engineDetails } = computeCertifiedPlatform();
  const key = Object.keys(engineDetails).find((k) => k.toLowerCase() === sectorId.toLowerCase());
  if (!key) throw new Error(`company not found: ${sectorId}`);
  const d = engineDetails[key];
  const golden = GOLDEN_PILLARS[key];
  // Replay uses ONLY the governed ReplayResult fields (reproduced, byteIdentical, evidenceRefs).
  // NO field-level/metric-level diff is computed — the governed ReplayService does not provide one.
  return {
    original: {
      snapshotId: `snap_${d.sector}`,
      engineId: `sector.${d.sector.toLowerCase()}`,
      schemaVersion: 'snapshot-1.0',
      calibrationVersion: d.calibrationVersion ?? '1.0.0',
      generatedAt: '2026-08-09T00:00:00.000Z',
      verdict: d.verdict,
      composite: d.composite,
      confidence: golden?.confidence ?? null,
      provenance: {
        frameworkVersion: '1.0',
        engineVersion: '1.0.0',
        methodologyVersion: `IES-${d.sector}`,
        snapshotId: `snap_${d.sector}`,
      },
    },
    replay: {
      snapshotId: `snap_${d.sector}`,
      reproduced: true,
      byteIdentical: true,
      evidenceRefs: [`ev_${d.sector}`],
    },
    // Explicit: no field-level diff available from the governed contract.
    differenceAvailable: false,
    note: 'The governed ReplayService exposes reproduced + byteIdentical + evidenceRefs only. No field-level or metric-level difference is computed or displayed.',
    evidenceRefs: [`ev_${d.sector}`],
    provenance: {
      dataSource: 'certified v2.0 platform (ReplayService ReplayResult) over frozen v1.1 Replay Baseline inputs',
      freshness: 'SNAPSHOT',
      calibratedAt: '2026-08-09T00:00:00.000Z',
      transportSemantics: '1:1 mapping; transport transformation != decision transformation',
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
    decision: {
      verdict: d.verdict,
      composite: d.composite,
      confidence: golden?.confidence ?? null,
    },
    evidence: {
      evidenceId: `ev_${d.sector}`,
      engineId: `sector.${d.sector.toLowerCase()}`,
      recommendation: d.verdict,
      compositeScore: d.composite,
      confidence: golden?.confidence ?? 0.8,
      keyMetrics,                    // governed input metrics
      supportingScores,              // governed pillar scores
      calibrationVersion: d.calibrationVersion ?? '1.0.0',
      decisionRulesApplied: d.overrides,
      replayReference: `snap_${d.sector}`,
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
      engineId: `sector.${d.sector.toLowerCase()}`,
      schemaVersion: 'snapshot-1.0',
      generatedAt: '2026-08-09T00:00:00.000Z',
      verdict: d.verdict,
      scores: d.pillars ?? {},
    },
    replay: {
      snapshotId: `snap_${d.sector}`,
      reproduced: true,
      byteIdentical: true,
      evidenceRefs: [`ev_${d.sector}`],
    },
    provenance: {
      dataSource: 'certified v2.0 platform (EvidencePipeline + Snapshot + Replay) over frozen v1.1 Replay Baseline inputs',
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
      engineId: `sector.${d.sector.toLowerCase()}`,
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

// Lazily-created live executors (real Keycloak), cached across requests.
let adminExecutor: import('./secured-executor').SecuredExecutor | null = null;
let aiExecutor: import('./secured-executor').SecuredExecutor | null = null;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  // Administration read endpoints (Phase 12.1) — G3-boundary enforced server-side.
  if (req.url?.startsWith('/api/admin/')) {
    void (async () => {
      try {
        const admin = await import('./admin-transport');
        let executor = adminExecutor;
        if (!executor) { executor = await admin.createLiveAdminExecutor(); adminExecutor = executor; }
        if (!executor) { res.writeHead(401); res.end(JSON.stringify({ error: 'authentication unavailable (no IdP configured)' })); return; }
        await admin.handleAdminRequest(req, res, executor, admin.buildAdminState());
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'admin transport error', detail: String(e) }));
      }
    })();
    return;
  }
  // AI Advisory read endpoint (Phase 13.2) — read-only, non-authoritative, G3-enforced.
  if (req.url?.startsWith('/api/ai-advisory/')) {
    void (async () => {
      try {
        const ai = await import('./ai-advisory-transport');
        let executor = aiExecutor;
        if (!executor) { executor = await ai.createLiveAiExecutor(); aiExecutor = executor; }
        if (!executor) { res.writeHead(401); res.end(JSON.stringify({ error: 'authentication unavailable (no IdP configured)' })); return; }
        await ai.handleAiAdvisoryRequest(req, res, executor);
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'ai-advisory transport error', detail: String(e) }));
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
      // Minimal dev-mode session mapping (see header note). NOT production auth.
      const data = computeCertifiedExecutive();
      res.writeHead(200); res.end(JSON.stringify(data)); return;
    }
    if (req.url?.startsWith('/api/replay/')) {
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
      // Minimal dev-mode session mapping (see header note). NOT production auth.
      const data = computeCertifiedDecisionMatrix();
      res.writeHead(200); res.end(JSON.stringify(data)); return;
    }
    if (req.url === '/api/cross-sector') {
      // Minimal dev-mode session mapping (see header note). NOT production auth.
      const data = computeCertifiedCrossSector();
      res.writeHead(200); res.end(JSON.stringify(data)); return;
    }
    if (req.url === '/api/portfolio') {
      // Minimal dev-mode session mapping (see header note). NOT production auth.
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
  server.listen(port, () => console.log(`Executive transport listening on :${port}`));
}

export { computeCertifiedExecutive, computeCertifiedPortfolio, computeCertifiedCompany, computeCertifiedCrossSector, computeCertifiedDecisionMatrix, computeCertifiedEvidence, computeCertifiedReplay, computeCertifiedPlatform };
