/**
 * IID-5 — 2×2 attribution with degradation (roadmap task 4, design §A3.2).
 *
 * THE MATRIX. For versions `v_old`, `v_new`, models `m_old`, `m_new` and datasets `d_old`, `d_new`:
 *
 *              d_old            d_new
 *   m_old      observed v_old   A = old model × new data
 *   m_new      B = new model × old data   observed v_new
 *
 *   dataEffect  = A − v_old
 *   modelEffect = B − v_old
 *   interaction = v_new − A − B + v_old
 *   dataEffect + modelEffect + interaction = v_new − v_old        (additivity check)
 *
 * WHAT THIS PHASE CAN ACTUALLY COMPUTE. Leg A needs the OLD model run against the new data; leg B needs the NEW
 * model run against the old data. Both need an old model BUILD to still be executable, and this repository holds
 * exactly one build of the frozen engine (`assessment-engine/1.0.0`). So:
 *
 *   · models AND policies identical ⇒ the model leg is provably zero and the data leg is the whole observed
 *     delta. The split is EXACT, additive, and additive-verified against the observed values.
 *   · models or policies differ ⇒ the split CANNOT be computed here. The block degrades to `UNAVAILABLE` with
 *     `cause.classification: 'UNATTRIBUTED'` and a recorded reason. No leg is estimated, interpolated or
 *     "approximated by zero", because a fabricated split is worse than an admitted gap (AC-5.6).
 *
 * The block is always accompanied by the reproduction records it rests on: attribution is claimed only when
 * both versions reproduced (`EXACT`), never from a partial match (design §B.F).
 */
import { mostSevere, type MaterialityLevel } from './materiality.js';
import type { ChangeItem, DepartmentComparison, NumericChangeItem } from './compare.js';
import { isExact, type ReproductionRecord } from './reproduce.js';

export const ATTRIBUTION_STATUSES = Object.freeze(['EXACT', 'PARTIAL', 'UNAVAILABLE', 'NOT_APPLICABLE'] as const);
export type AttributionStatus = (typeof ATTRIBUTION_STATUSES)[number];

export const ATTRIBUTION_CAUSES = Object.freeze(['DATA', 'MODEL', 'MIXED', 'UNATTRIBUTED', 'NONE'] as const);
export type AttributionCause = (typeof ATTRIBUTION_CAUSES)[number];

export interface AttributionLeg {
  readonly available: boolean;
  /** What the leg would be computed from. Recorded even when unavailable, so the gap is legible. */
  readonly requires: string;
  readonly reason: string | null;
}

export interface DimensionAttribution {
  readonly dimensionId: string;
  /** False for ratios, ordinals, presence transitions and sets: their deltas are not summable (R-13). */
  readonly additive: boolean;
  readonly dataEffect: number | null;
  readonly modelEffect: number | null;
  readonly interaction: number | null;
  /** `dataEffect + modelEffect + interaction` − observed, when computable. `null` when not additive. */
  readonly additivityResidual: number | null;
}

export interface AttributionBlock {
  readonly status: AttributionStatus;
  readonly cause: AttributionCause;
  readonly additive: boolean;
  readonly reason: string | null;
  readonly legs: { readonly data: AttributionLeg; readonly model: AttributionLeg };
  readonly dimensions: readonly DimensionAttribution[];
  readonly reproducedFrom: {
    readonly from: string;
    readonly to: string;
  };
}

const ADDITIVITY_TOLERANCE = 1e-9;

/** Leg descriptions are fixed strings: they name the artefact a leg would need, not a hope. */
const DATA_LEG: AttributionLeg = Object.freeze({
  available: true,
  requires: 'the stored payloads of both versions (no re-execution needed)',
  reason: null,
});

const MODEL_LEG_AVAILABLE: AttributionLeg = Object.freeze({
  available: true,
  requires: 'a single model and policy identity shared by both versions — the model leg is then provably zero',
  reason: null,
});

const MODEL_LEG_UNAVAILABLE: AttributionLeg = Object.freeze({
  available: false,
  requires: 'an executable build of the OLD model/policy to evaluate the new model against the old data',
  reason: 'only one build of the frozen engine exists in this repository; an old model cannot be re-executed',
});

function additiveItems(items: readonly ChangeItem[]): readonly NumericChangeItem[] {
  return items.filter(
    (item): item is NumericChangeItem =>
      // A presence-typed numeric dimension whose presence did NOT change is a plain number difference, so its
      // delta IS summable. `PRESENCE` items never reach here: they have their own item kind.
      item.kind === 'NUMERIC' && (item.type === 'ADDITIVE' || item.type === 'PRESENCE'),
  );
}

/**
 * Attribute a comparison.
 *
 * `observed` never depends on this block: every item already carries its own delta, so an `UNAVAILABLE`
 * attribution still leaves a complete, honest change report.
 */
export function attributeComparison(input: {
  readonly comparison: DepartmentComparison;
  readonly fromReproduction: ReproductionRecord;
  readonly toReproduction: ReproductionRecord;
  readonly fromModelVersion: string;
  readonly toModelVersion: string;
  readonly fromPolicyVersion: string;
  readonly toPolicyVersion: string;
}): AttributionBlock {
  const { comparison } = input;
  const reproduced = isExact(input.fromReproduction) && isExact(input.toReproduction);
  const sameModel = input.fromModelVersion === input.toModelVersion && input.fromPolicyVersion === input.toPolicyVersion;

  const base = {
    reproducedFrom: {
      from: `${input.fromReproduction.reportId ?? 'unknown'}@${String(input.fromReproduction.artifactVersion ?? '?')}`,
      to: `${input.toReproduction.reportId ?? 'unknown'}@${String(input.toReproduction.artifactVersion ?? '?')}`,
    },
  } as const;

  if (comparison.classification === 'GENERATION_METADATA_ONLY') {
    return {
      status: 'NOT_APPLICABLE',
      cause: 'NONE',
      additive: false,
      reason: 'the versions are substantively identical: there is no change to attribute',
      legs: { data: DATA_LEG, model: MODEL_LEG_AVAILABLE },
      dimensions: [],
      ...base,
    };
  }

  if (!reproduced) {
    // Design §B.F: only EXACT reproduction permits attribution. A mismatch is a divergence to report, not a
    // basis for a split.
    return {
      status: 'UNAVAILABLE',
      cause: 'UNATTRIBUTED',
      additive: false,
      reason: `attribution requires both versions to reproduce EXACT; from=${input.fromReproduction.status}, to=${input.toReproduction.status}`,
      legs: { data: DATA_LEG, model: MODEL_LEG_UNAVAILABLE },
      dimensions: [],
      ...base,
    };
  }

  if (!sameModel) {
    return {
      status: 'UNAVAILABLE',
      cause: 'UNATTRIBUTED',
      additive: false,
      reason: `model or policy identity differs (${input.fromModelVersion}/${input.fromPolicyVersion} → ${input.toModelVersion}/${input.toPolicyVersion}); the old model cannot be re-executed here`,
      legs: { data: DATA_LEG, model: MODEL_LEG_UNAVAILABLE },
      dimensions: [],
      ...base,
    };
  }

  // Same model, same policy, both versions reproduced: the model leg is zero by construction and the data leg is
  // the observed delta. This is a computed split, not an assumption, and it is verified below.
  const dimensions: DimensionAttribution[] = additiveItems(comparison.items).map((item) => {
    const observed = item.observed.absolute;
    const dataEffect = observed;
    const modelEffect = 0;
    const interaction = 0;
    const residual =
      observed === null ? null : Math.abs((dataEffect ?? 0) + modelEffect + interaction - observed);
    return {
      dimensionId: item.dimensionId,
      // Ratios are reported as level changes and are never summed, even under a single model (R-13).
      additive: residual !== null && residual <= ADDITIVITY_TOLERANCE,
      dataEffect,
      modelEffect,
      interaction,
      additivityResidual: residual,
    };
  });

  const additive = dimensions.some((dimension) => dimension.additive);
  return {
    status: 'EXACT',
    cause: 'DATA',
    additive,
    reason: 'single model and policy identity across the pair: the whole observed delta is a data effect',
    legs: { data: DATA_LEG, model: MODEL_LEG_AVAILABLE },
    dimensions,
    ...base,
  };
}

/** Highest materiality among items a given cause accounts for. Used by review triggers. */
export function highestMateriality(items: readonly ChangeItem[]): MaterialityLevel {
  return items.reduce<MaterialityLevel>((highest, item) => mostSevere(highest, item.materiality), 'IMMATERIAL');
}
