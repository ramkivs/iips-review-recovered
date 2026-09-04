/**
 * Telecommunications Sector Engine (WP-3) — implements SectorPlugin, consumes platform services, frozen assets.
 *
 * Implements the IES-016 D16 M1-M15 contract exactly: metric eval → band → score → pillar → composite
 * (round-half-to-even at composite only) → override → verdict → evidence → ontology registration.
 * Reproduces the frozen expected output for replay (68.4 Accumulate). Zero platform/framework/CSIP changes.
 * Preserves D16 M1-M15 verbatim.
 */
import type { SectorPlugin, ExecutionRequest, ExecutionResult, PluginManifest } from '../../plugin-loader/PluginContract';
import type { Container } from '../../di/Container';
import type { RuntimeCoordinator } from '../../runtime/RuntimeCoordinator';
import type { EvidencePipeline } from '../../framework/evidence/EvidencePipeline';
import { TelecomMetricsEvaluator, type TelecomInput } from './metrics/TelecomMetrics';
import { TelecomScoreEngine } from './scoring/TelecomScoreEngine';
import { loadTelecomCalibration, type TelecomCalibrationProfile } from './calibration/TelecomCalibration';
import { TelecomDecision } from './decision/TelecomDecision';
import { TelecomEvidence } from './evidence/TelecomEvidence';

export const TELECOM_ENGINE_ID = 'sector.telecom';

/** Engine-declared ontology metadata (Universal Investment Ontology) — for CSIP, zero CSIP change. */
export const TELECOM_ONTOLOGY_METADATA = {
  composite: 'Conviction',
  confidence: 'Confidence',
  qualityScore: 'Quality',
  growthScore: 'Growth',
  riskScore: 'Risk',
  profitabilityScore: 'Profitability',
  capitalEfficiency: 'Capital Efficiency',
  valuationScore: 'Valuation',
} as const;

export class TelecomEngine implements SectorPlugin {
  readonly identity = {
    engineId: TELECOM_ENGINE_ID,
    sectorFamily: 'Telecommunications',
    engineVersion: '1.0.0',
    secVersion: '1.0',
    semcVersion: '1.0',
  };
  readonly manifest: PluginManifest = {
    engineId: TELECOM_ENGINE_ID,
    sectorFamily: 'Telecommunications',
    engineVersion: '1.0.0',
    capabilities: ['metrics', 'scoring', 'calibration', 'decision', 'evidence', 'ontology'],
    compatibility: { framework: '1.0', methodology: 'IES-016 v1.0' },
  };

  private calibration: TelecomCalibrationProfile = loadTelecomCalibration();
  private metrics = new TelecomMetricsEvaluator();
  private scoreEngine!: TelecomScoreEngine;
  private decision!: TelecomDecision;
  private evidence!: TelecomEvidence;
  private runtime!: RuntimeCoordinator;
  private evidencePipeline!: EvidencePipeline;

  onDiscover(): void { /* no-op */ }

  onRegister(_ctx: Container): boolean {
    this.scoreEngine = new TelecomScoreEngine(this.calibration);
    this.decision = new TelecomDecision(this.calibration);
    return true;
  }

  onInitialize(ctx: Container): void {
    this.evidencePipeline = ctx.resolve<EvidencePipeline>('evidenceService');
    this.runtime = ctx.resolve<RuntimeCoordinator>('runtimeCoordinator');
    this.evidence = new TelecomEvidence(this.evidencePipeline);
  }

  execute(_ctx: Container, request: ExecutionRequest): ExecutionResult {
    const input = request.inputs as unknown as TelecomInput;
    const metrics = this.metrics.evaluate(input);
    const score = this.scoreEngine.score(metrics);
    const decision = this.decision.decide({
      composite: score.composite,
      debtEbitda: (input['TL-005'] as number | undefined) ?? (input as any).debtEbitda,
      governance: (input as any).governance,
      regulatoryShock: (input as any).regulatoryShock,
      networkOutage: (input as any).networkOutage,
    });

    const snapshot = this.runtime.recordSnapshot(
      TELECOM_ENGINE_ID,
      { 'TL-001': (input['TL-001'] as number) ?? 0 },
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
        ontology: TELECOM_ONTOLOGY_METADATA,
      },
    };
  }

  onComplete(): void { /* no-op */ }
}
