/**
 * IID-5 — semantic comparison of two stored versions (roadmap task 2, obligations O-2/O-7).
 *
 * THE COMPARATOR WALKS THE DECLARED DIMENSION MAP, NOT THE PAYLOAD. Two consequences, both required:
 *
 *   · serialisation-only differences produce ZERO items (AC-5.7), because no dimension changed;
 *   · a dimension that moved is always reported WITH its materiality level, even `IMMATERIAL`, so
 *     `summary.byCategory` reconciles with `items[]` and nothing is silently suppressed (design §A3.3).
 *
 * PAIR CLASSIFICATION IS THREE-WAY AND COMES FIRST (decision §6.5):
 *
 *   GENERATION_METADATA_ONLY  substantive digests equal — nothing substantive moved, whatever the clocks say
 *   FRESHNESS_TRANSITION      the ONLY substantive movement is the freshness verdict and its dependants
 *   SUBSTANTIVE               anything else
 *
 * The third case matters: a clock advance that crosses the freshness window changes quality, confidence and the
 * disposition gates. Calling that "metadata" because a clock caused it would hide a real change in the
 * assessment's stated confidence.
 *
 * PRESENCE IS A FIRST-CLASS CHANGE. `PRESENT → MISSING` is `MATERIAL` and `WORSENED`, and is never rendered as
 * "the value went to zero" (design §A3.3/R-13).
 */
import { ReportValidationError } from '../../reports/artifact.js';
import {
  classifyMagnitude,
  measureDelta,
  mostSevere,
  THRESHOLDS,
  type MaterialityLevel,
} from './materiality.js';
import {
  FRESHNESS_CONSEQUENCE_DIMENSIONS,
  dimensionsFor,
  readDimension,
  type ChangeCategory,
  type DimensionSpec,
  type DimensionType,
} from './dimensionMap.js';

/** Three-way pair classification (decision §6.5). */
export const PAIR_CLASSIFICATIONS = Object.freeze([
  'SUBSTANTIVE',
  'GENERATION_METADATA_ONLY',
  'FRESHNESS_TRANSITION',
] as const);
export type PairClassification = (typeof PAIR_CLASSIFICATIONS)[number];

export type ChangeDirection = 'IMPROVED' | 'WORSENED' | 'INDETERMINATE';

/** `observed` is the real delta between two stored versions and never depends on attribution (R-13). */
export interface ObservedDelta {
  readonly from: number | null;
  readonly to: number | null;
  readonly absolute: number | null;
  readonly relativePct: number | null;
  readonly unit: string;
}

export interface ChangeItemBase {
  readonly dimensionId: string;
  readonly path: string;
  readonly label: string;
  readonly category: ChangeCategory;
  readonly type: DimensionType;
  readonly materiality: MaterialityLevel;
  readonly direction: ChangeDirection;
}

export interface NumericChangeItem extends ChangeItemBase {
  readonly kind: 'NUMERIC';
  readonly observed: ObservedDelta;
}

export interface PresenceChangeItem extends ChangeItemBase {
  readonly kind: 'PRESENCE';
  readonly from: string;
  readonly to: string;
  readonly note: string;
}

export interface CategoricalChangeItem extends ChangeItemBase {
  readonly kind: 'CATEGORICAL';
  readonly from: string | null;
  readonly to: string | null;
  /** Tolerated rename class, when the dimension declares one. Absent means "labels are compared literally". */
  readonly equivalenceClass?: string;
}

export interface SetChangeItem extends ChangeItemBase {
  readonly kind: 'SET';
  readonly added: readonly string[];
  readonly removed: readonly string[];
}

export type ChangeItem = NumericChangeItem | PresenceChangeItem | CategoricalChangeItem | SetChangeItem;

/** A member excluded from substantive identity that nevertheless differs between the two stored payloads. */
export interface MetadataChange {
  readonly member: string;
  readonly from: unknown;
  readonly to: unknown;
  /** Always true: this block is explicitly non-semantic (decision §6.5). */
  readonly excluded: true;
}

export interface ComparisonSummary {
  readonly total: number;
  readonly byCategory: Readonly<Record<ChangeCategory, number>>;
  readonly byMateriality: Readonly<Record<MaterialityLevel, number>>;
  readonly highestMateriality: MaterialityLevel;
}

export interface DepartmentComparison {
  readonly reportType: string;
  readonly classification: PairClassification;
  readonly substantiveIdentityChanged: boolean;
  readonly payloadIdentityChanged: boolean;
  readonly items: readonly ChangeItem[];
  readonly metadata: readonly MetadataChange[];
  readonly summary: ComparisonSummary;
}

const ZERO_CATEGORIES: Record<ChangeCategory, number> = {
  FUNDAMENTAL: 0,
  MARKET_VALUATION: 0,
  RISK_QUALITY: 0,
  DISPOSITION: 0,
  PORTFOLIO: 0,
  DATA_CORRECTION_RESTATEMENT: 0,
  MODEL: 0,
  IDENTITY_MAPPING: 0,
};

const LEVELS: readonly MaterialityLevel[] = ['IMMATERIAL', 'NOTABLE', 'MATERIAL', 'CRITICAL'];

function summarise(items: readonly ChangeItem[]): ComparisonSummary {
  const byCategory = { ...ZERO_CATEGORIES };
  const byMateriality: Record<MaterialityLevel, number> = {
    IMMATERIAL: 0,
    NOTABLE: 0,
    MATERIAL: 0,
    CRITICAL: 0,
  };
  let highest: MaterialityLevel = 'IMMATERIAL';
  for (const item of items) {
    byCategory[item.category] += 1;
    byMateriality[item.materiality] += 1;
    highest = mostSevere(highest, item.materiality);
  }
  return { total: items.length, byCategory, byMateriality, highestMateriality: highest };
}

function labelOf(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

/** The `Observation` presence of a resolved value, when the value has one. */
function presenceOf(value: unknown): string | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const presence = (value as Record<string, unknown>).presence;
  return typeof presence === 'string' ? presence : null;
}

function numericValueOf(value: unknown): number | null {
  // A declared PRESENCE dimension may still resolve to a bare number (a coverage percentage is a number, not an
  // Observation). Reading both forms keeps the dimension usable without giving it a second accessor.
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value === null || typeof value !== 'object') return null;
  const observed = value as Record<string, unknown>;
  if (observed.presence !== undefined && observed.presence !== 'PRESENT') return null;
  const numeric = observed.value;
  return typeof numeric === 'number' && Number.isFinite(numeric) ? numeric : null;
}

/* ------------------------------------------------------------------ per-kind comparison ---------------- */

function compareNumeric(spec: Extract<DimensionSpec, { kind: 'NUMERIC' }>, from: unknown, to: unknown): ChangeItem | null {
  const presenceFrom = spec.type === 'PRESENCE' ? presenceOf(from) : null;
  const presenceTo = spec.type === 'PRESENCE' ? presenceOf(to) : null;

  // Presence transitions are their own item kind: they are never rendered as a numeric change.
  if (spec.type === 'PRESENCE' && presenceFrom !== presenceTo) {
    const disappeared = presenceTo !== null && presenceTo !== 'PRESENT';
    return {
      kind: 'PRESENCE',
      dimensionId: spec.id,
      path: spec.path,
      label: spec.label,
      category: spec.category,
      type: 'PRESENCE',
      materiality: disappeared ? 'MATERIAL' : 'NOTABLE',
      // Evidence disappearing is a worsening of what can be claimed, not a change of the underlying fact.
      direction: disappeared ? 'WORSENED' : 'IMPROVED',
      from: presenceFrom ?? 'ABSENT',
      to: presenceTo ?? 'ABSENT',
      note: disappeared
        ? 'the observation that supported this dimension is no longer present; its absence is not a zero value'
        : 'the observation is present in the later version where it was not before',
    };
  }
  if (spec.type === 'PRESENCE' && presenceFrom !== null && presenceFrom !== 'PRESENT') {
    // Same non-PRESENT presence on both sides: nothing to compare, and nothing to claim.
    return null;
  }

  const fromNumber = spec.type === 'PRESENCE' ? numericValueOf(from) : typeof from === 'number' ? from : null;
  const toNumber = spec.type === 'PRESENCE' ? numericValueOf(to) : typeof to === 'number' ? to : null;
  if (fromNumber === null && toNumber === null) return null;
  if (fromNumber !== null && toNumber !== null && fromNumber === toNumber) return null;

  const thresholds = THRESHOLDS[spec.thresholds];
  if (thresholds.mode === 'DECLARED') {
    throw new ReportValidationError('a numeric dimension cannot use declared thresholds', { dimension: spec.id });
  }
  const delta = measureDelta({ from: fromNumber, to: toNumber, mode: thresholds.mode });
  const materiality = classifyMagnitude(delta, thresholds);
  const absolute = fromNumber === null || toNumber === null ? null : toNumber - fromNumber;
  const relativePct =
    fromNumber === null || toNumber === null || fromNumber === 0 ? null : ((toNumber - fromNumber) / fromNumber) * 100;
  return {
    kind: 'NUMERIC',
    dimensionId: spec.id,
    path: spec.path,
    label: spec.label,
    category: spec.category,
    type: spec.type,
    materiality,
    direction: absolute === null ? 'INDETERMINATE' : absolute > 0 ? 'IMPROVED' : absolute < 0 ? 'WORSENED' : 'INDETERMINATE',
    observed: { from: fromNumber, to: toNumber, absolute, relativePct, unit: spec.unit },
  };
}

function compareDeclared(spec: Extract<DimensionSpec, { kind: 'DECLARED' }>, from: unknown, to: unknown): ChangeItem | null {
  const fromLabel = labelOf(from);
  const toLabel = labelOf(to);
  if (fromLabel === toLabel) return null;
  const level = spec.transition(fromLabel, toLabel) as MaterialityLevel;
  let direction: ChangeDirection = spec.directionOf ? spec.directionOf(fromLabel, toLabel) : 'INDETERMINATE';
  if (!spec.directionOf && spec.type === 'ORDINAL' && spec.scale !== undefined) {
    const fromIndex = fromLabel === null ? -1 : spec.scale.indexOf(fromLabel);
    const toIndex = toLabel === null ? -1 : spec.scale.indexOf(toLabel);
    if (fromIndex >= 0 && toIndex >= 0) direction = toIndex > fromIndex ? 'IMPROVED' : 'WORSENED';
  }
  return {
    kind: 'CATEGORICAL',
    dimensionId: spec.id,
    path: spec.path,
    label: spec.label,
    category: spec.category,
    type: spec.type,
    materiality: level,
    direction,
    from: fromLabel,
    to: toLabel,
  };
}

function compareSet(spec: Extract<DimensionSpec, { kind: 'SET' }>, from: unknown, to: unknown): ChangeItem | null {
  const fromEntries = spec.keyOf(from);
  const toEntries = spec.keyOf(to);
  const fromMap = new Map(fromEntries.map((entry) => [entry.key, entry.severity]));
  const toMap = new Map(toEntries.map((entry) => [entry.key, entry.severity]));
  const added = [...toMap.keys()].filter((key) => !fromMap.has(key)).sort();
  const removed = [...fromMap.keys()].filter((key) => !toMap.has(key)).sort();
  if (added.length === 0 && removed.length === 0) return null;

  let level: MaterialityLevel = 'NOTABLE';
  for (const key of added) {
    const severity = toMap.get(key) ?? null;
    if (severity !== null && severity >= 5) level = mostSevere(level, 'CRITICAL');
    else if (severity !== null && severity >= 4) level = mostSevere(level, 'MATERIAL');
  }
  for (const key of removed) {
    const severity = fromMap.get(key) ?? null;
    if (severity !== null && severity >= 4) level = mostSevere(level, 'MATERIAL');
  }
  const direction: ChangeDirection = added.length > 0 && removed.length === 0 ? 'WORSENED' : removed.length > 0 && added.length === 0 ? 'IMPROVED' : 'INDETERMINATE';
  return {
    kind: 'SET',
    dimensionId: spec.id,
    path: spec.path,
    label: spec.label,
    category: spec.category,
    type: 'SET',
    materiality: level,
    direction,
    added,
    removed,
  };
}

/* ------------------------------------------------------------------ the comparison --------------------- */

export interface CompareInput {
  readonly reportType: string;
  readonly fromPayload: unknown;
  readonly toPayload: unknown;
  /** Substantive digests, computed by the caller from the STORED bytes. */
  readonly fromSubstantiveDigest: string;
  readonly toSubstantiveDigest: string;
  /** Byte-identity digests, for the record. */
  readonly fromPayloadDigest: string;
  readonly toPayloadDigest: string;
  /** Excluded members whose stored values differ; reported as a non-semantic block. */
  readonly metadata: readonly MetadataChange[];
}

/**
 * Classify and compare one version pair.
 *
 * The classification is decided BEFORE the items are built, from the substantive digests, and it is then
 * confirmed against the item set: a pair whose digests differ but whose declared dimensions do not change is
 * still `SUBSTANTIVE` (something the map does not name moved) — the report says so rather than pretending
 * nothing happened.
 */
export function compareVersions(input: CompareInput): DepartmentComparison {
  const substantiveChanged = input.fromSubstantiveDigest !== input.toSubstantiveDigest;
  const payloadChanged = input.fromPayloadDigest !== input.toPayloadDigest;

  const items: ChangeItem[] = [];
  for (const spec of dimensionsFor(input.reportType)) {
    const from = readDimension(input.fromPayload, spec);
    const to = readDimension(input.toPayload, spec);
    let item: ChangeItem | null = null;
    if (spec.kind === 'NUMERIC') item = compareNumeric(spec, from, to);
    else if (spec.kind === 'DECLARED') item = compareDeclared(spec, from, to);
    else item = compareSet(spec, from, to);
    if (item !== null) items.push(item);
  }

  let classification: PairClassification;
  if (!substantiveChanged) {
    classification = 'GENERATION_METADATA_ONLY';
  } else if (
    items.length > 0 &&
    items.some((item) => item.dimensionId === 'asOf.staleBeyondPolicy') &&
    items.every((item) => FRESHNESS_CONSEQUENCE_DIMENSIONS.has(item.dimensionId))
  ) {
    classification = 'FRESHNESS_TRANSITION';
  } else {
    classification = 'SUBSTANTIVE';
  }

  return {
    reportType: input.reportType,
    classification,
    substantiveIdentityChanged: substantiveChanged,
    payloadIdentityChanged: payloadChanged,
    items,
    metadata: [...input.metadata],
    summary: summarise(items),
  };
}

/** True when any item is at or above the given level. */
export function hasAtLeast(items: readonly ChangeItem[], level: MaterialityLevel): boolean {
  const rank = (value: MaterialityLevel): number => LEVELS.indexOf(value);
  return items.some((item) => rank(item.materiality) >= rank(level));
}
