/** Materials Evidence (WP-3) — evidence packages per D11. Reuses EvidencePipeline. G6 ontology binding preserved. */
import type { EvidencePipeline, EvidencePackage } from '../../../framework/evidence/EvidencePipeline';
import type { MaterialsScoreResult } from '../scoring/MaterialsScoreEngine';
import type { DecisionResult } from '../decision/MaterialsDecision';

export interface MaterialsEvidenceInput {
  decision: DecisionResult;
  score: MaterialsScoreResult;
  calibrationVersion: string;
  snapshotId: string;
  subsegment?: string;
}

export class MaterialsEvidence {
  constructor(private readonly pipeline: EvidencePipeline) {}

  build(input: MaterialsEvidenceInput): Readonly<EvidencePackage> {
    return this.pipeline.build({
      engineId: 'sector.materials',
      recommendation: input.decision.verdict,
      compositeScore: input.score.composite,
      confidence: 0.8,
      supportingScores: [
        { id: 'quality', name: 'Quality', value: input.score.pillars.quality },
        { id: 'growth', name: 'Growth', value: input.score.pillars.growth },
        { id: 'risk', name: 'Risk', value: input.score.pillars.risk },
        { id: 'profitability', name: 'Profitability', value: input.score.pillars.profitability },
      ],
      decisionRulesApplied: input.decision.overridesApplied,
      calibrationVersion: input.calibrationVersion,
      replayReference: input.snapshotId,
      provenance: {
        frameworkVersion: '1.0',
        engineVersion: '1.0.0',
        methodologyVersion: 'IES-020 v1.0 (D20 M1-M15 + G1-G6)',
        snapshotId: input.snapshotId,
      },
    });
  }
}
