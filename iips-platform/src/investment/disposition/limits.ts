/**
 * IID-4 — `limits-policy` (R-11): source, precedence, effective dating, and the caps actually applied.
 *
 * WHY THIS MODULE EXISTS AT ALL. A concentration decision is an investment judgement, and the caps that
 * bound it must be attributable. NP-04, CSIP and the sector engines all publish *analytics*; none of them
 * publishes a policy. So the caps live in one versioned, dated, digest-recorded document, and every
 * disposition records the exact caps it applied — a later limits change therefore cannot retroactively
 * change what a stored assessment meant.
 *
 * PRECEDENCE (R-11 §2), and one deliberate addition:
 *   1. an operator policy file that is in force at the assessment instant;
 *   2. otherwise the SYSTEM DEFAULTS, recorded with `basis: SYSTEM_DEFAULT`;
 *   3. if the operator file exists but cannot be read as a policy, the gates FAIL (`policy_inputs_unavailable`).
 * Step 3 is stricter than "unreadable ⇒ defaults" on purpose: a typo in a cap must not silently become a
 * different risk limit. Absence is not the same thing as invalid.
 *
 * A SYSTEM DEFAULT IS NOT THE OPERATOR'S RISK TOLERANCE. `basis` travels with every cap, every
 * disposition and every response so that "10 % because the product said so" can never be read as
 * "10 % because you chose it".
 */
import { createHash } from 'node:crypto';

import type { AppliedLimit, LimitsBasis, ResolvedLimits } from './types';
import { LIMITS_POLICY_VERSION } from './types';

/** System defaults. Single-name 10 %, sector 30 % (R-11 §2). Never presented as an operator choice. */
export const SYSTEM_DEFAULT_LIMITS = Object.freeze({
  singleNameMaxPct: 10,
  sectorMaxPct: 30,
});

export const LIMITS_POLICY_KEYS = Object.freeze([
  'policyVersion',
  'effectiveFrom',
  'singleNameMaxPct',
  'sectorMaxPct',
  'notes',
] as const);

export const LIMITS_REJECTIONS = Object.freeze([
  'NOT_AN_OBJECT',
  'UNKNOWN_KEY',
  'MISSING_POLICY_VERSION',
  'MISSING_EFFECTIVE_FROM',
  'INVALID_EFFECTIVE_FROM',
  'INVALID_SINGLE_NAME_CAP',
  'INVALID_SECTOR_CAP',
  'INVALID_SECTOR_MAP',
  'OUT_OF_RANGE',
] as const);

export type LimitsRejection = (typeof LIMITS_REJECTIONS)[number];

export class LimitsPolicyError extends Error {
  constructor(message: string, readonly reason: LimitsRejection, readonly detail: Readonly<Record<string, unknown>> = {}) {
    super(message);
    this.name = 'LimitsPolicyError';
  }
}

export interface LimitsPolicyDocument {
  readonly policyVersion: string;
  readonly effectiveFrom: string;
  readonly singleNameMaxPct: number;
  readonly sectorMaxPct: Readonly<Record<string, number>>;
  readonly notes: string | null;
}

function isFinitePercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 100;
}

function isIsoInstantOrDate(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 10) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

/**
 * Parse an operator limits policy.
 *
 * Unknown top-level keys are rejected rather than ignored: a misspelled `sectorMaxPcts` would otherwise
 * silently disable every sector cap, which is exactly the kind of quiet default this programme forbids.
 */
export function parseLimitsPolicy(document: unknown): LimitsPolicyDocument {
  if (document === null || typeof document !== 'object' || Array.isArray(document)) {
    throw new LimitsPolicyError('limits policy must be a JSON object', 'NOT_AN_OBJECT');
  }
  const record = document as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!(LIMITS_POLICY_KEYS as readonly string[]).includes(key)) {
      throw new LimitsPolicyError(`unknown limits-policy key "${key}"`, 'UNKNOWN_KEY', { key });
    }
  }
  if (typeof record.policyVersion !== 'string' || record.policyVersion.length === 0) {
    throw new LimitsPolicyError('policyVersion is required', 'MISSING_POLICY_VERSION');
  }
  if (!isIsoInstantOrDate(record.effectiveFrom)) {
    if (record.effectiveFrom === undefined) {
      throw new LimitsPolicyError('effectiveFrom is required', 'MISSING_EFFECTIVE_FROM');
    }
    throw new LimitsPolicyError('effectiveFrom must be an ISO date or instant', 'INVALID_EFFECTIVE_FROM', {
      effectiveFrom: record.effectiveFrom,
    });
  }
  if (!isFinitePercent(record.singleNameMaxPct)) {
    if (record.singleNameMaxPct === undefined) {
      throw new LimitsPolicyError('singleNameMaxPct is required', 'INVALID_SINGLE_NAME_CAP');
    }
    throw new LimitsPolicyError(
      'singleNameMaxPct must be a finite percentage in (0, 100]',
      record.singleNameMaxPct === 0 || (typeof record.singleNameMaxPct === 'number' && Math.abs(record.singleNameMaxPct) > 100)
        ? 'OUT_OF_RANGE'
        : 'INVALID_SINGLE_NAME_CAP',
      { singleNameMaxPct: record.singleNameMaxPct },
    );
  }
  const sectorMaxPctRaw = record.sectorMaxPct;
  if (sectorMaxPctRaw === undefined) {
    throw new LimitsPolicyError('sectorMaxPct is required', 'INVALID_SECTOR_CAP');
  }
  if (sectorMaxPctRaw === null || typeof sectorMaxPctRaw !== 'object' || Array.isArray(sectorMaxPctRaw)) {
    throw new LimitsPolicyError('sectorMaxPct must be an object of sector → percentage', 'INVALID_SECTOR_MAP');
  }
  const sectorMaxPct: Record<string, number> = {};
  for (const [sector, cap] of Object.entries(sectorMaxPctRaw as Record<string, unknown>)) {
    if (sector === 'DEFAULT') {
      if (!isFinitePercent(cap)) {
        throw new LimitsPolicyError('sectorMaxPct.DEFAULT must be a finite percentage in (0, 100]', 'INVALID_SECTOR_CAP');
      }
      sectorMaxPct.DEFAULT = cap;
      continue;
    }
    if (!isFinitePercent(cap)) {
      throw new LimitsPolicyError(`sectorMaxPct["${sector}"] must be a finite percentage in (0, 100]`, 'INVALID_SECTOR_CAP', {
        sector,
        cap,
      });
    }
    sectorMaxPct[sector] = cap;
  }
  if (typeof record.notes !== 'undefined' && typeof record.notes !== 'string') {
    throw new LimitsPolicyError('notes must be a string when present', 'NOT_AN_OBJECT', { notes: record.notes });
  }
  return {
    policyVersion: record.policyVersion,
    effectiveFrom: record.effectiveFrom,
    singleNameMaxPct: record.singleNameMaxPct,
    sectorMaxPct: Object.freeze(sectorMaxPct),
    notes: typeof record.notes === 'string' ? record.notes : null,
  };
}

/** Parse from JSON text. Invalid JSON is a policy failure, never an excuse to fall back to defaults. */
export function parseLimitsPolicyText(text: string): LimitsPolicyDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (cause) {
    throw new LimitsPolicyError('limits policy is not valid JSON', 'NOT_AN_OBJECT', { cause: String(cause) });
  }
  return parseLimitsPolicy(parsed);
}

function policyDigest(document: LimitsPolicyDocument): string {
  const canonical = JSON.stringify({
    policyVersion: document.policyVersion,
    effectiveFrom: new Date(document.effectiveFrom).toISOString(),
    singleNameMaxPct: document.singleNameMaxPct,
    sectorMaxPct: Object.fromEntries(Object.entries(document.sectorMaxPct).sort(([a], [b]) => a.localeCompare(b))),
    notes: document.notes,
  });
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

export interface ResolveLimitsInput {
  /** The operator policy, already parsed, or `null` when no policy file exists. */
  readonly policy?: LimitsPolicyDocument | null;
  /** The instant the disposition is generated for. Effective dating is decided against this. */
  readonly asOf: string;
}

/**
 * Resolve the caps in force.
 *
 * A policy whose `effectiveFrom` is in the future is not in force: the defaults apply and the fact is
 * recorded as a note, so a pre-published policy cannot silently change today's assessment.
 */
export function resolveLimits(input: ResolveLimitsInput): ResolvedLimits {
  const asOfMs = Date.parse(input.asOf);
  if (!Number.isFinite(asOfMs)) {
    throw new LimitsPolicyError('asOf must be a parseable instant', 'INVALID_EFFECTIVE_FROM', { asOf: input.asOf });
  }
  const policy = input.policy ?? null;
  const notes: string[] = [];
  let basis: LimitsBasis = 'SYSTEM_DEFAULT';
  let singleNameMaxPct: number = SYSTEM_DEFAULT_LIMITS.singleNameMaxPct;
  let sectorMaxPct: Readonly<Record<string, number>> = Object.freeze({ DEFAULT: SYSTEM_DEFAULT_LIMITS.sectorMaxPct });
  let policyVersion = `${LIMITS_POLICY_VERSION}+system-default`;
  let effectiveFrom = '1970-01-01T00:00:00.000Z';

  if (policy !== null) {
    const effectiveMs = Date.parse(policy.effectiveFrom);
    if (effectiveMs <= asOfMs) {
      basis = 'OPERATOR_CONFIG';
      singleNameMaxPct = policy.singleNameMaxPct;
      sectorMaxPct = Object.freeze({ DEFAULT: SYSTEM_DEFAULT_LIMITS.sectorMaxPct, ...policy.sectorMaxPct });
      policyVersion = policy.policyVersion;
      effectiveFrom = new Date(effectiveMs).toISOString();
    } else {
      notes.push('operator limits policy exists but is not yet in force at the assessment instant; defaults applied');
    }
  } else {
    notes.push('no operator limits policy is configured; system defaults applied and labelled as such');
  }

  return Object.freeze({
    policyVersion,
    effectiveFrom,
    basis,
    singleNameMaxPct,
    sectorMaxPct,
    defaultSectorMaxPct: sectorMaxPct.DEFAULT ?? SYSTEM_DEFAULT_LIMITS.sectorMaxPct,
    digest: policyDigest({
      policyVersion,
      effectiveFrom,
      singleNameMaxPct,
      sectorMaxPct,
      notes: notes.join(' | ') || null,
    }),
    applied: Object.freeze([]),
    notes: Object.freeze(notes),
  });
}

/** The sector cap that applies to a sector, falling back to the policy's DEFAULT and then the system default. */
export function sectorCapFor(limits: ResolvedLimits, sector: string | null): number {
  if (sector !== null && Object.prototype.hasOwnProperty.call(limits.sectorMaxPct, sector)) {
    return limits.sectorMaxPct[sector] as number;
  }
  return limits.sectorMaxPct.DEFAULT ?? limits.defaultSectorMaxPct ?? SYSTEM_DEFAULT_LIMITS.sectorMaxPct;
}

export interface CapEvaluationInput {
  readonly limits: ResolvedLimits;
  readonly subjectKind: 'HELD' | 'CANDIDATE';
  readonly sector: string | null;
  /** Observed value-weighted single-name weight. `null` when not measurable. */
  readonly currentWeightPct: number | null;
  /** Observed value-weighted sector exposure, including the subject's own weight. `null` when not measurable. */
  readonly currentSectorExposurePct: number | null;
  /** The band under consideration, at its high end, as a percentage of portfolio value. */
  readonly projectedBandHighPct: number | null;
}

export interface CapEvaluation {
  readonly applied: readonly AppliedLimit[];
  readonly singleNameBreached: boolean;
  readonly sectorBreached: boolean;
  /** True when the caps could not be evaluated at all (missing measurements, not zeroes). */
  readonly evaluable: boolean;
  readonly unmet: readonly string[];
}

/**
 * Evaluate the two caps for one subject at a projected band high.
 *
 * A missing measurement makes the cap NOT EVALUABLE rather than zero: `null` weights never become 0 %,
 * because 0 % would pass every cap and turn a missing portfolio into a compliant one.
 */
export function evaluateCaps(input: CapEvaluationInput): CapEvaluation {
  const applied: AppliedLimit[] = [];
  const unmet: string[] = [];
  const cap = input.limits.singleNameMaxPct;
  const sectorCap = sectorCapFor(input.limits, input.sector);

  const measuredSingle = input.currentWeightPct;
  const projectedSingle = input.projectedBandHighPct;
  if (measuredSingle === null || projectedSingle === null) {
    unmet.push('portfolio.weightPct');
  } else {
    applied.push({
      limitId: 'SINGLE_NAME_MAX',
      scope: 'SINGLE_SECURITY',
      capPct: cap,
      basis: input.limits.basis,
      policyVersion: input.limits.policyVersion,
      effectiveFrom: input.limits.effectiveFrom,
      measuredPct: measuredSingle,
      projectedPct: projectedSingle,
      breached: projectedSingle > cap,
    });
  }

  const measuredSector = input.currentSectorExposurePct;
  if (measuredSector === null || projectedSingle === null) {
    unmet.push('portfolio.sectorExposurePct');
  } else {
    // For a held subject the projected sector exposure is today's sector exposure minus the current
    // weight plus the projected weight; for a candidate the sector exposure does not include it yet.
    const projectedSector =
      input.subjectKind === 'HELD' ? measuredSector - (measuredSingle ?? 0) + projectedSingle : measuredSector + projectedSingle;
    applied.push({
      limitId: 'SECTOR_MAX',
      scope: input.sector ?? 'UNKNOWN_SECTOR',
      capPct: sectorCap,
      basis: input.limits.basis,
      policyVersion: input.limits.policyVersion,
      effectiveFrom: input.limits.effectiveFrom,
      measuredPct: measuredSector,
      projectedPct: Math.round(projectedSector * 100) / 100,
      breached: projectedSector > sectorCap,
    });
  }

  const singleNameBreached = applied.find((entry) => entry.limitId === 'SINGLE_NAME_MAX')?.breached ?? false;
  const sectorBreached = applied.find((entry) => entry.limitId === 'SECTOR_MAX')?.breached ?? false;
  return {
    applied: Object.freeze(applied),
    singleNameBreached,
    sectorBreached,
    evaluable: unmet.length === 0,
    unmet: Object.freeze(unmet),
  };
}

/** The resolved limits with the caps this disposition actually applied recorded on them (AC-4.9). */
export function withAppliedLimits(limits: ResolvedLimits, applied: readonly AppliedLimit[]): ResolvedLimits {
  return Object.freeze({ ...limits, applied: Object.freeze([...applied]) });
}
