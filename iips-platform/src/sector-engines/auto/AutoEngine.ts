/**
 * Automobile Sector Engine (WP-3) — implements SectorPlugin, consumes platform services, frozen assets.
 *
 * Implements the IES-017 D17 M1-M15 + Option-A left-to-right summation oracle exactly:
 * metric eval → band → score → pillar → composite (round-half-to-even at composite only, left-to-right summation)
 * → override → verdict → evidence → ontology registration.
 * Reproduces the frozen expected output for replay (71.6 Buy) via Option-A triple 44ba/ea22/c8ed.
 * Zero platform/framework/CSIP changes. Preserves D17 M1-M15 and Option-A left-to-right for-loop verbatim.
 */
import type { SectorPlugin, ExecutionRequest, ExecutionResult, PluginManifest } from '../../plugin-loader/PluginContract';
import type { Container } from '../../di/Container';
import type { RuntimeCoordinator } from '../../runtime/RuntimeCoordinator';
import type { EvidencePipeline } from '../../framework/evidence/EvidencePipeline';
import { AutoMetricsEvaluator, type AutoInput } from './metrics/AutoMetrics';
import { AutoScoreEngine } from './scoring/AutoScoreEngine';
import { loadAutoCalibration, type AutoCalibrationProfile } from './calibration/AutoCalibration';
import { AutoDecision } from './decision/AutoDecision';
import { AutoEvidence } from './evidence/AutoEvidence';

export const AUTO_ENGINE_ID = 'sector.auto';

/** Engine-declared ontology metadata (Universal Investment Ontology) — for CSIP, zero CSIP change. */
export const AUTO_ONTOLOGY_METADATA = {
  composite: 'Conviction',
  confidence: 'Confidence',
  qualityScore: 'Quality',
  growthScore: 'Growth',
  riskScore: 'Risk',
  profitabilityScore: 'Profitability',
  capitalEfficiency: 'Capital Efficiency',
  valuationScore: 'Valuation',
} as const;

export class AutoEngine implements SectorPlugin {
  readonly identity = {
    engineId: AUTO_ENGINE_ID,
    sectorFamily: 'Automobile',
    engineVersion: '1.0.0',
    secVersion: '1.0',
    semcVersion: '1.0',
  };
  readonly manifest: PluginManifest = {
    engineId: AUTO_ENGINE_ID,
    sectorFamily: 'Automobile',
    engineVersion: '1.0.0',
    capabilities: ['metrics', 'scoring', 'calibration', 'decision', 'evidence', 'ontology'],
    compatibility: { framework: '1.0', methodology: 'IES-017 v1.0' },
  };

  private calibration: AutoCalibrationProfile = loadAutoCalibration();
  private metrics = new AutoMetricsEvaluator();
  private scoreEngine!: AutoScoreEngine;
  private decision!: AutoDecision;
  private evidence!: AutoEvidence;
  private runtime!: RuntimeCoordinator;
  private evidencePipeline!: EvidencePipeline;

  onDiscover(): void { /* no-op */ }

  onRegister(_ctx: Container): boolean {
    this.scoreEngine = new AutoScoreEngine(this.calibration);
    this.decision = new AutoDecision(this.calibration);
    return true;
  }

  onInitialize(ctx: Container): void {
    this.evidencePipeline = ctx.resolve<EvidencePipeline>('evidenceService');
    this.runtime = ctx.resolve<RuntimeCoordinator>('runtimeCoordinator');
    this.evidence = new AutoEvidence(this.evidencePipeline);
  }

  execute(_ctx: Container, request: ExecutionRequest): ExecutionResult {
    const input = request.inputs as unknown as AutoInput;
    const metrics = this.metrics.evaluate(input);
    const score = this.scoreEngine.score(metrics);
    const decision = this.decision.decide({
      composite: score.composite,
      debtEbitda: (input['AU-008'] as number | undefined) ?? (input as any).debtEbitda,
      governance: (input as any).governance,
      supplyShock: (input as any).supplyShock,
      recall: (input as any).recall,
    });

    const snapshot = this.runtime.recordSnapshot(
      AUTO_ENGINE_ID,
      { 'AU-001': (input['AU-001'] as number) ?? 0 },
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
        ontology: AUTO_ONTOLOGY_METADATA,
      },
    };
  }

  onComplete(): void { /* no-op */ }
}
