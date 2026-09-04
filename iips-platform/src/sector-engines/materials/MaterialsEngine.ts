/**
 * Materials & Metals Sector Engine (WP-3) — implements SectorPlugin, consumes platform services, frozen assets.
 *
 * Implements the IES-020 D20 M1-M15 + G1-G6 contract exactly:
 * G1 subsegment, G2 archetype, G3 metric direction/units, G4 scoring band (lower-inclusive/upper-exclusive, round-half-to-even),
 * G5 calibration horizon 1.0.0, G6 ontology binding 8 dimensions (sector-neutral CSIP) — all preserved verbatim.
 * Metric eval → band → score → pillar → subsegment/archetype calibration → composite → override → verdict → evidence → ontology.
 * Reproduces the frozen expected output for replay (74.9 Buy) via deterministic regeneration (9d92/56a6).
 * Zero platform/framework/CSIP changes.
 */
import type { SectorPlugin, ExecutionRequest, ExecutionResult, PluginManifest } from '../../plugin-loader/PluginContract';
import type { Container } from '../../di/Container';
import type { RuntimeCoordinator } from '../../runtime/RuntimeCoordinator';
import type { EvidencePipeline } from '../../framework/evidence/EvidencePipeline';
import { MaterialsMetricsEvaluator, type MaterialsInput } from './metrics/MaterialsMetrics';
import { MaterialsScoreEngine } from './scoring/MaterialsScoreEngine';
import { loadMaterialsCalibration, type MaterialsCalibrationProfile } from './calibration/MaterialsCalibration';
import { MaterialsDecision } from './decision/MaterialsDecision';
import { MaterialsEvidence } from './evidence/MaterialsEvidence';

export const MATERIALS_ENGINE_ID = 'sector.materials';

/** Engine-declared ontology metadata (Universal Investment Ontology) — for CSIP, zero CSIP change. G6 preserved. */
export const MATERIALS_ONTOLOGY_METADATA = {
  composite: 'Conviction',
  confidence: 'Confidence',
  qualityScore: 'Quality',
  growthScore: 'Growth',
  riskScore: 'Risk',
  profitabilityScore: 'Profitability',
  capitalEfficiency: 'Capital Efficiency',
  valuationScore: 'Valuation',
} as const;

export class MaterialsEngine implements SectorPlugin {
  readonly identity = {
    engineId: MATERIALS_ENGINE_ID,
    sectorFamily: 'Materials & Metals',
    engineVersion: '1.0.0',
    secVersion: '1.0',
    semcVersion: '1.0',
  };
  readonly manifest: PluginManifest = {
    engineId: MATERIALS_ENGINE_ID,
    sectorFamily: 'Materials & Metals',
    engineVersion: '1.0.0',
    capabilities: ['metrics', 'scoring', 'calibration', 'decision', 'evidence', 'ontology'],
    compatibility: { framework: '1.0', methodology: 'IES-020 v1.0' },
  };

  private calibration: MaterialsCalibrationProfile = loadMaterialsCalibration();
  private metrics = new MaterialsMetricsEvaluator();
  private scoreEngine!: MaterialsScoreEngine;
  private decision!: MaterialsDecision;
  private evidence!: MaterialsEvidence;
  private runtime!: RuntimeCoordinator;
  private evidencePipeline!: EvidencePipeline;

  onDiscover(): void { /* no-op */ }

  onRegister(_ctx: Container): boolean {
    this.scoreEngine = new MaterialsScoreEngine(this.calibration);
    this.decision = new MaterialsDecision(this.calibration);
    return true;
  }

  onInitialize(ctx: Container): void {
    this.evidencePipeline = ctx.resolve<EvidencePipeline>('evidenceService');
    this.runtime = ctx.resolve<RuntimeCoordinator>('runtimeCoordinator');
    this.evidence = new MaterialsEvidence(this.evidencePipeline);
  }

  execute(_ctx: Container, request: ExecutionRequest): ExecutionResult {
    const input = request.inputs as unknown as MaterialsInput;
    const metrics = this.metrics.evaluate(input);
    const score = this.scoreEngine.score(metrics);
    const decision = this.decision.decide({
      composite: score.composite,
      subsegment: (input.subsegment as string | undefined),
      debtEbitda: (input['MM-005'] as number | undefined) ?? (input as any).debtEbitda,
      governance: (input as any).governance,
      commodityShock: (input as any).commodityShock,
      operationalDisruption: (input as any).operationalDisruption,
    });

    const snapshot = this.runtime.recordSnapshot(
      MATERIALS_ENGINE_ID,
      { 'MM-001': (input['MM-001'] as number) ?? 0 },
      score.pillars as unknown as Record<string, number>,
      decision.verdict,
    );
    const evidence = this.evidence.build({
      decision,
      score,
      calibrationVersion: this.calibration.version,
      snapshotId: snapshot.snapshotId,
    });

    return {
      state: 'COMPLETED',
      snapshotRef: snapshot.snapshotId,
      evidenceRef: evidence.evidenceId,
      metadata: {
        verdict: decision.verdict,
        composite: score.composite,
        overridesApplied: decision.overridesApplied,
        pillars: {
          quality: score.pillars.quality,
          growth: score.pillars.growth,
          risk: score.pillars.risk,
          profitability: score.pillars.profitability,
          capitalEfficiency: score.pillars.capitalEfficiency,
          valuation: score.pillars.valuation,
        },
        calibrationVersion: this.calibration.version,
        ontology: MATERIALS_ONTOLOGY_METADATA,
      },
    };
  }

  onComplete(): void { /* no-op */ }
}
