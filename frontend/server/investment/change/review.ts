/**
 * IID-5 — review triggers and focus questions (roadmap task 5, design §A3.5).
 *
 * A TRIGGER IS A QUESTION, NEVER AN ACTION. `suggestedFocus` lists what a human should look into ("was the margin
 * decline volume-led or price-led?"). It never says buy, sell, increase or reduce: this capability is decision
 * support, and the disposition vocabulary is the only place a conservative verb is expressed — with its own
 * gates, caps and refusals.
 *
 * `required` and `priority` are computed from the CLOSED trigger list, so a reader can always answer "why was
 * this flagged?" by reading the fired triggers, and cannot be surprised by a flag with no stated cause.
 */
import { atLeast, type MaterialityLevel } from './materiality.js';
import type { ChangeItem, DepartmentComparison } from './compare.js';

export const REVIEW_TRIGGER_IDS = Object.freeze([
  'VERB_CHANGE',
  'ADEQUACY_DOWNGRADE',
  'MOS_BAND_CROSSING',
  'INTRINSIC_CHANGE_MATERIAL',
  'RESTATEMENT_PRESENT',
  'IDENTITY_CHANGE',
  'MODEL_OR_POLICY_CHANGE',
  'NEW_HIGH_SEVERITY_RISK',
  'FRESHNESS_TRANSITION',
  'MATERIAL_CHANGE',
] as const);
export type ReviewTriggerId = (typeof REVIEW_TRIGGER_IDS)[number];

export const REVIEW_PRIORITIES = Object.freeze(['NONE', 'LOW', 'MEDIUM', 'HIGH'] as const);
export type ReviewPriority = (typeof REVIEW_PRIORITIES)[number];

export interface ReviewTrigger {
  readonly triggerId: ReviewTriggerId;
  readonly fired: boolean;
  readonly reason: string;
}

export interface ReviewBlock {
  readonly required: boolean;
  readonly priority: ReviewPriority;
  readonly triggers: readonly ReviewTrigger[];
  /** Questions to answer. Never actions to take. */
  readonly suggestedFocus: readonly string[];
}

const FOCUS: Readonly<Record<ReviewTriggerId, string>> = Object.freeze({
  VERB_CHANGE: 'Did the change in evidence justify moving the disposition verb, or did the verb move with the data?',
  ADEQUACY_DOWNGRADE: 'Which required input became unavailable, and can it be restored before the next review?',
  MOS_BAND_CROSSING: 'Is the band change driven by the price, the intrinsic value, or both?',
  INTRINSIC_CHANGE_MATERIAL: 'Which valuation method moved the intrinsic value, and was its evidence restated?',
  RESTATEMENT_PRESENT: 'Which prior-period figures were restated, and does the restatement change the trend?',
  IDENTITY_CHANGE: 'Did the security identity change (symbol, listing, corporate action) rather than the business?',
  MODEL_OR_POLICY_CHANGE: 'Was the change produced by a different model or policy rather than by different data?',
  NEW_HIGH_SEVERITY_RISK: 'What evidence produced the new high-severity risk factor, and is it one-off or recurring?',
  FRESHNESS_TRANSITION: 'Do the underlying statements need refreshing before this assessment is relied on?',
  MATERIAL_CHANGE:
    'Which material dimension moved without a domain-specific trigger, and is that movement supported by the prior version evidence?',
});

function fired(triggerId: ReviewTriggerId, condition: boolean, reason: string): ReviewTrigger {
  return { triggerId, fired: condition, reason };
}

function has(items: readonly ChangeItem[], dimensionId: string, minimum: MaterialityLevel): boolean {
  return items.some((item) => item.dimensionId === dimensionId && atLeast(item.materiality, minimum));
}

/**
 * Compute the review block.
 *
 * Priority follows design §A3.5: `HIGH` for any CRITICAL item or a verb moving to a do-not-hold verb, `MEDIUM`
 * for two or more MATERIAL items, `LOW` for a single MATERIAL item, `NONE` otherwise. `required` is true as soon
 * as any trigger fires — including an `IMMATERIAL` verb change, because a verb is never cosmetic.
 */
export function reviewFor(comparison: DepartmentComparison): ReviewBlock {
  const items = comparison.items;
  const verbChange = items.find((item) => item.dimensionId === 'disposition.verb');
  const triggers: ReviewTrigger[] = [
    fired('VERB_CHANGE', verbChange !== undefined, verbChange ? `disposition verb ${verbChange.kind === 'CATEGORICAL' ? `${String(verbChange.from)} → ${String(verbChange.to)}` : 'changed'}` : 'the disposition verb did not change'),
    fired('ADEQUACY_DOWNGRADE', has(items, 'completeness.adequacy', 'MATERIAL') || has(items, 'disposition.adequacy', 'MATERIAL'), 'evidence adequacy was downgraded'),
    fired('MOS_BAND_CROSSING', items.some((item) => item.dimensionId === 'valuation.mosBand'), 'the margin-of-safety band crossed'),
    fired('INTRINSIC_CHANGE_MATERIAL', has(items, 'valuation.intrinsicMid', 'MATERIAL'), 'intrinsic value moved by a material amount'),
    fired('RESTATEMENT_PRESENT', items.some((item) => item.dimensionId === 'data.restatements'), 'a prior-period figure was restated'),
    fired('IDENTITY_CHANGE', items.some((item) => item.category === 'IDENTITY_MAPPING' && atLeast(item.materiality, 'MATERIAL')), 'the subject identity mapping changed'),
    fired('MODEL_OR_POLICY_CHANGE', items.some((item) => item.category === 'MODEL'), 'the model or policy identity changed'),
    fired('NEW_HIGH_SEVERITY_RISK', items.some((item) => item.dimensionId === 'risk.factors' && item.kind === 'SET' && item.added.length > 0 && atLeast(item.materiality, 'MATERIAL')), 'a new high-severity risk factor appeared'),
    fired('FRESHNESS_TRANSITION', comparison.classification === 'FRESHNESS_TRANSITION', 'the pair is a freshness transition'),
    // A material movement with no named trigger would otherwise produce `required: false` alongside a HIGH
    // priority, which is the one combination a reader cannot act on consistently.
    fired(
      'MATERIAL_CHANGE',
      items.some((item) => atLeast(item.materiality, 'MATERIAL')),
      'at least one dimension moved by a material amount',
    ),
  ];

  const firedIds = triggers.filter((trigger) => trigger.fired).map((trigger) => trigger.triggerId);
  const critical = items.some((item) => item.materiality === 'CRITICAL');
  const materialCount = items.filter((item) => atLeast(item.materiality, 'MATERIAL')).length;
  const verbToAvoid = verbChange?.kind === 'CATEGORICAL' && (verbChange.to === 'AVOID' || verbChange.to === 'AVOID_CANDIDATE');

  let priority: ReviewPriority = 'NONE';
  if (critical || verbToAvoid) priority = 'HIGH';
  else if (materialCount >= 2) priority = 'MEDIUM';
  else if (materialCount === 1) priority = 'LOW';

  // A model/policy-only pair is never HIGH on the data's account, but it is always worth a look: it means the
  // answer changed while the world may not have.
  if (priority === 'NONE' && firedIds.length > 0) priority = 'LOW';

  return {
    required: firedIds.length > 0,
    priority,
    triggers,
    suggestedFocus: firedIds.map((id) => FOCUS[id]),
  };
}
