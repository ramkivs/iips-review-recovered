/**
 * NP-12 N4-A9 Increment 1 — Screen Member Evaluation Input and member admission.
 *
 * Authority: NP-12-N4-A6-CONTRACT-SPECIFICATION.md §§6–8 (frozen), bounded by
 * NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md §11 (`A9-D01`).
 *
 * This module is the A5-D05 Screen-input composition boundary (`A6-U-06`). It owns:
 *   - the Screen Member Evaluation Input field disposition (A6 §7.2);
 *   - the explicit growth-availability vocabulary (A6-DR-01 Option C, A6 §7.3);
 *   - the Screen-side canonical decimal capability (A6 §6), implemented independently
 *     of the frozen N4-SD private `decimal()` under the approved zero-touch rule
 *     (`A9-D02` — N4-SD is NOT modified, exported, re-exported, or relocated);
 *   - governed member validation and the §7.4 member error codes.
 *
 * ZERO-TOUCH NOTE (A9-D02): the routine below is an independent implementation of the
 * governed A6 §6 semantics. It is not copied from, shared with, or derived from the
 * frozen N4-SD surface. Equivalence is established by differential/parity evidence in
 * `iips-platform/tests/regression/np12-n4-a9-screen-runtime.test.ts`, which drives the
 * frozen public N4-SD surface and this module over the same governed inputs.
 *
 * Nothing here calls a sector engine, reads a fixture as a production value, synthesizes
 * a `companyId`, repairs producer data, or infers growth availability from a numeric zero.
 */

/** The two-value availability vocabulary. No third state and no second sentinel (A6 §7.3). */
export type GrowthAvailability = 'AVAILABLE' | 'UNAVAILABLE';

/** Governed member-level error codes (A6 §7.4). Exactly these six, no additions. */
export type MemberErrorCode =
  | 'MEMBER_VALUE_MISSING'
  | 'MEMBER_VALUE_NON_NUMERIC'
  | 'MEMBER_VALUE_OVER_PRECISION'
  | 'MEMBER_VALUE_OUT_OF_RANGE'
  | 'MEMBER_VALUE_NON_FINITE'
  | 'MEMBER_GROWTH_INVALID';

/** Member-level validation status (A6 §10.2). */
export type MemberValidationStatus = 'VALID' | 'INVALID_MEMBER';

/**
 * The supplied Screen Member Evaluation Input (A6 §7.2).
 *
 * Every field crossing the Screen boundary is supplied by the producer-side composition
 * boundary. `conviction`, `quality` and `growth` MUST cross as canonical decimal text
 * (A6 §6.5): a binary `number` cannot carry a canonical decimal representation.
 *
 * `timestamp` and `requestId` are execution-level provenance and are deliberately NOT
 * member fields here: they are EXCLUDED from every identity preimage (A6-DR-03,
 * A6-DR-02) and are carried by the execution envelope instead.
 */
export interface ScreenMemberInput {
  /** Exact canonical sector name — one of the 13 governed G1-normalized names. */
  readonly sector: string;
  /** Opaque reference identifier, used verbatim (A6 §7.1). */
  readonly referenceId: string;
  /** Canonical decimal text of the conviction pillar. Absent → invalid member. */
  readonly conviction: string;
  /** Canonical decimal text of the quality pillar. Absent → invalid member. */
  readonly quality: string;
  /** Explicit availability state. Never reconstructed from the numeric value. */
  readonly growthAvailability: GrowthAvailability;
  /** Canonical decimal text of growth. Present iff `growthAvailability` is AVAILABLE. */
  readonly growth?: string;
  readonly engineId: string;
  readonly engineVersion: string;
  readonly calibrationVersion: string;
  readonly snapshotId: string;
  readonly evidenceId: string;
}

/* ------------------------------------------------------------------ *
 * Screen-side canonical decimal (A6 §6) — zero-touch, independently
 * implemented. No N4-SD file is read, imported, or modified.
 * ------------------------------------------------------------------ */

/** Exact fixed-point scale: q = 1,000,000 × x. */
export const DECIMAL_SCALE = 1_000_000n;
/** Inclusive upper bound of the governed domain: 100 × 1,000,000. */
export const DECIMAL_MAX_Q = 100_000_000n;
/** Maximum admitted fractional digit count. */
export const MAX_FRACTION_DIGITS = 6;

/** Why a supplied value is not admissible canonical decimal text. */
export type CanonicalDecimalRejection =
  | 'NOT_TEXT'
  | 'NON_FINITE'
  | 'NON_NUMERIC'
  | 'OVER_PRECISION'
  | 'OUT_OF_RANGE';

/** Outcome of inspecting a supplied value against the governed A6 §6 representation. */
export type CanonicalDecimalResult =
  | { readonly admitted: true; readonly q: bigint; readonly text: string }
  | { readonly admitted: false; readonly rejection: CanonicalDecimalRejection };

const ASCII_MINUS = 0x2d;
const ASCII_DOT = 0x2e;
const ASCII_ZERO = 0x30;
const ASCII_NINE = 0x39;

/**
 * The exact non-finite spellings named by A6 §6.4 / §7.4. Everything else that is not
 * admissible canonical decimal text is `NON_NUMERIC`; only these tokens are non-finite.
 */
const NON_FINITE_TOKENS: ReadonlySet<string> = new Set([
  'NaN',
  'Infinity',
  '+Infinity',
  '-Infinity',
]);

function isAsciiDigit(code: number): boolean {
  return code >= ASCII_ZERO && code <= ASCII_NINE;
}

/**
 * Inspect a supplied value against the governed representation
 * `("0" | [1-9][0-9]*) [ "." [0-9]{1,6} ]` with `q ∈ [0, 100,000,000]`.
 *
 * Implemented as an explicit left-to-right scan over UTF-16 code units so that no
 * regular-expression engine, locale table, or coercion is involved. Admission is total:
 * every input yields either an exact `(q, text)` pair or a single rejection reason.
 * There is no rounding, no quantization, and no binary floating-point expansion.
 */
export function inspectCanonicalDecimal(value: unknown): CanonicalDecimalResult {
  // A6 §6.5: a value typed as a binary number cannot carry a canonical decimal
  // representation, so it is never admitted — not even a finite one.
  if (typeof value !== 'string') {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      return { admitted: false, rejection: 'NON_FINITE' };
    }
    return { admitted: false, rejection: 'NOT_TEXT' };
  }
  if (NON_FINITE_TOKENS.has(value)) {
    return { admitted: false, rejection: 'NON_FINITE' };
  }

  let index = 0;
  // A leading '-' is admitted only so that the governed negative-zero canonicalization
  // of A6 §6.4 can be applied; any negative non-zero value is rejected as out of range.
  const negative = value.charCodeAt(index) === ASCII_MINUS;
  if (negative) index += 1;

  const integerStart = index;
  while (index < value.length && isAsciiDigit(value.charCodeAt(index))) index += 1;
  const integer = value.slice(integerStart, index);

  if (integer.length === 0) return { admitted: false, rejection: 'NON_NUMERIC' };
  // Leading zeroes are rejected other than the single integer "0".
  if (integer.length > 1 && integer.charCodeAt(0) === ASCII_ZERO) {
    return { admitted: false, rejection: 'NON_NUMERIC' };
  }
  // Reject before converting an arbitrarily long integer run to BigInt.
  if (integer.length > 3) return { admitted: false, rejection: 'OUT_OF_RANGE' };

  let fraction = '';
  if (index < value.length) {
    if (value.charCodeAt(index) !== ASCII_DOT) {
      return { admitted: false, rejection: 'NON_NUMERIC' };
    }
    index += 1;
    const fractionStart = index;
    while (index < value.length && isAsciiDigit(value.charCodeAt(index))) index += 1;
    fraction = value.slice(fractionStart, index);
    // A bare '.' with no fractional digits is not an admissible spelling.
    if (fraction.length === 0) return { admitted: false, rejection: 'NON_NUMERIC' };
    // More than six fractional digits are rejected BEFORE any trailing-zero removal.
    if (fraction.length > MAX_FRACTION_DIGITS) {
      return { admitted: false, rejection: 'OVER_PRECISION' };
    }
  }

  // No exponent notation, no whitespace, no non-ASCII digit, no trailer of any kind.
  if (index !== value.length) return { admitted: false, rejection: 'NON_NUMERIC' };

  const q = BigInt(integer) * DECIMAL_SCALE + BigInt(fraction.padEnd(MAX_FRACTION_DIGITS, '0'));
  if (q > DECIMAL_MAX_Q || (negative && q !== 0n)) {
    return { admitted: false, rejection: 'OUT_OF_RANGE' };
  }
  return { admitted: true, q, text: canonicalDecimalText(q) };
}

/**
 * Canonical text derivation (A6 §6.3): `a = floor(q / 1,000,000)`,
 * `r = q − 1,000,000 × a`; `a` is written without leading zeroes (integer zero is "0");
 * when `r = 0` that integer text is complete, otherwise `r` is written as exactly six
 * zero-padded digits with trailing zeroes removed, appended after ".".
 */
export function canonicalDecimalText(q: bigint): string {
  if (q < 0n || q > DECIMAL_MAX_Q) {
    throw new RangeError('Canonical decimal key q is outside the governed domain [0, 100000000]');
  }
  const whole = q / DECIMAL_SCALE;
  const remainder = q % DECIMAL_SCALE;
  if (remainder === 0n) return whole.toString();
  const digits = remainder.toString().padStart(MAX_FRACTION_DIGITS, '0');
  let end = digits.length;
  while (end > 0 && digits.charCodeAt(end - 1) === ASCII_ZERO) end -= 1;
  return `${whole.toString()}.${digits.slice(0, end)}`;
}

/** Admitted canonical decimal, or a thrown member error. Convenience for internal callers. */
export function requireCanonicalDecimal(value: unknown): CanonicalDecimalResult & { admitted: true } {
  const result = inspectCanonicalDecimal(value);
  if (!result.admitted) {
    throw new ScreenMemberValueError(
      memberErrorCodeFor(result.rejection),
      `Value is not admissible canonical decimal text (${result.rejection})`,
    );
  }
  return result;
}

/** Map a decimal rejection reason onto the governed §7.4 member error code. */
export function memberErrorCodeFor(rejection: CanonicalDecimalRejection): MemberErrorCode {
  switch (rejection) {
    case 'NOT_TEXT':
      return 'MEMBER_VALUE_NON_NUMERIC';
    case 'NON_FINITE':
      return 'MEMBER_VALUE_NON_FINITE';
    case 'OVER_PRECISION':
      return 'MEMBER_VALUE_OVER_PRECISION';
    case 'OUT_OF_RANGE':
      return 'MEMBER_VALUE_OUT_OF_RANGE';
    default:
      return 'MEMBER_VALUE_NON_NUMERIC';
  }
}

/* ------------------------------------------------------------------ *
 * Member admission
 * ------------------------------------------------------------------ */

/**
 * A member after admission: the exact text frames that enter the `NP12MBR` preimage,
 * the exact fixed-point keys used for comparison, and the governed member status.
 *
 * For a VALID member the framed value text is exactly the canonical decimal text of
 * A6 §6.3. For an INVALID_MEMBER the supplied text is framed verbatim so that the
 * execution identity remains sensitive to the actual supplied input (A5-D04 requires
 * the preimage to reproduce that member's Screen input). A VALID member's `inputHash`
 * is unaffected by this rule, which is proven by test.
 */
export interface AdmittedMember {
  readonly sector: string;
  readonly referenceId: string;
  readonly convictionText: string;
  readonly qualityText: string;
  readonly growthAvailability: GrowthAvailability;
  /** Present iff `growthAvailability` is AVAILABLE. */
  readonly growthText?: string;
  readonly engineId: string;
  readonly engineVersion: string;
  readonly calibrationVersion: string;
  readonly snapshotId: string;
  readonly evidenceId: string;
  /** Exact fixed-point key, or `null` when the value is not admissible. */
  readonly convictionQ: bigint | null;
  readonly qualityQ: bigint | null;
  readonly growthQ: bigint | null;
  readonly status: MemberValidationStatus;
  /** Governed §7.4 error code, or `''` when the member is VALID. */
  readonly errorCode: MemberErrorCode | '';
}

/** Fail-closed member-level validation error (A6 §7.4, D-A2-4, A5-D08). */
export class ScreenMemberValueError extends Error {
  constructor(readonly code: MemberErrorCode, message: string) {
    super(message);
    this.name = 'ScreenMemberValueError';
  }
}

/** Required member text fields and their governed labels. */
const REQUIRED_MEMBER_TEXT: readonly (readonly [keyof ScreenMemberInput, string])[] = [
  ['referenceId', 'referenceId'],
  ['engineId', 'engineId'],
  ['engineVersion', 'engineVersion'],
  ['calibrationVersion', 'calibrationVersion'],
  ['snapshotId', 'snapshotId'],
  ['evidenceId', 'evidenceId'],
];

/**
 * The 13 governed canonical sector names. Imported verbatim from the frozen population
 * boundary so that the Screen vocabulary can never drift from the G1 vocabulary.
 */
export const CANONICAL_SCREEN_SECTORS: readonly string[] = [
  'Banking',
  'Insurance',
  'Capital Markets',
  'Healthcare',
  'Hospitality',
  'Energy',
  'Utilities',
  'Consumer',
  'Industrials',
  'Technology',
  'Telecommunications',
  'Automobile',
  'Materials & Metals',
];

function isNonBlankText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/** A supplied value that was never supplied at all (A6 §7.4 `MEMBER_VALUE_MISSING`). */
function isAbsent(value: unknown): boolean {
  return value === undefined || value === null;
}

function frameableText(value: unknown): string {
  // Present text is framed verbatim; an absent value frames as the empty text frame.
  return typeof value === 'string' ? value : '';
}

/**
 * Admit one supplied Screen member.
 *
 * Structural (execution-level) violations — a non-canonical sector, a non-text or blank
 * required identity/provenance field — are reported through `structural` so the caller
 * can fail the whole execution (D-A2-5). Member-*value* violations are reported through
 * `status`/`errorCode` and never fail an otherwise structurally valid execution
 * (A5-D08). The two responsibilities never merge.
 */
export function admitMember(supplied: unknown): {
  readonly structural: null | { readonly code: 'MEMBER_CONTRACT_MALFORMED'; readonly message: string };
  readonly member: AdmittedMember | null;
} {
  const malformed = (message: string): { structural: { code: 'MEMBER_CONTRACT_MALFORMED'; message: string }; member: null } =>
    ({ structural: { code: 'MEMBER_CONTRACT_MALFORMED', message }, member: null });

  if (supplied === null || typeof supplied !== 'object' || Array.isArray(supplied)) {
    return malformed('Each Screen member must be a flat record');
  }
  const record = supplied as Record<string, unknown>;

  const { sector } = record;
  if (typeof sector !== 'string' || !CANONICAL_SCREEN_SECTORS.includes(sector)) {
    // A6 §7.4: sector validity is settled earlier by the governed G1–G5 population
    // boundary and fails closed there. A non-canonical sector can never be admitted.
    return malformed(
      `Screen member sector must be one of the 13 canonical sector names (received ${JSON.stringify(sector)})`,
    );
  }
  const { referenceId } = record;
  if (!isNonBlankText(referenceId)) {
    return malformed('Screen member referenceId must be non-empty opaque text');
  }
  for (const [field, label] of REQUIRED_MEMBER_TEXT) {
    if (!isNonBlankText(record[field])) {
      return malformed(`Screen member ${label} must be non-empty text (D-A2-1 provenance set)`);
    }
  }

  const conviction = inspectCanonicalDecimal(record.conviction);
  const quality = inspectCanonicalDecimal(record.quality);

  // A6 §7.4: an absent conviction or quality is MEMBER_VALUE_MISSING, distinct from a
  // present-but-inadmissible value (which is MEMBER_VALUE_NON_NUMERIC).
  const convictionCode: MemberErrorCode | '' = conviction.admitted
    ? ''
    : isAbsent(record.conviction)
      ? 'MEMBER_VALUE_MISSING'
      : memberErrorCodeFor(conviction.rejection);
  const qualityCode: MemberErrorCode | '' = quality.admitted
    ? ''
    : isAbsent(record.quality)
      ? 'MEMBER_VALUE_MISSING'
      : memberErrorCodeFor(quality.rejection);

  const availability = record.growthAvailability;
  let growthAvailability: GrowthAvailability;
  if (availability === 'AVAILABLE' || availability === 'UNAVAILABLE') {
    growthAvailability = availability;
  } else {
    // A6 §7.3 admits exactly two availability values, with no third state and no second
    // sentinel. Anything else is a growth contract violation, not a numeric one.
    growthAvailability = 'AVAILABLE';
    return {
      structural: null,
      member: invalidMember(record, 'AVAILABLE', 'MEMBER_GROWTH_INVALID',
        'growthAvailability must be exactly AVAILABLE or UNAVAILABLE'),
    };
  }

  const suppliedGrowth = record.growth;
  if (growthAvailability === 'UNAVAILABLE') {
    // A6 §7.2: growth is present iff availability is AVAILABLE. A value supplied under
    // UNAVAILABLE contradicts the field disposition; it is fail-closed at member level
    // rather than silently dropped from the preimage.
    if (suppliedGrowth !== undefined && suppliedGrowth !== null) {
      return {
        structural: null,
        member: invalidMember(record, 'UNAVAILABLE', 'MEMBER_GROWTH_INVALID',
          'growth must be absent when growthAvailability is UNAVAILABLE'),
      };
    }
  }

  let growth: CanonicalDecimalResult | null = null;
  if (growthAvailability === 'AVAILABLE') {
    if (isAbsent(suppliedGrowth)) {
      growth = { admitted: false, rejection: 'NOT_TEXT' };
    } else {
      growth = inspectCanonicalDecimal(suppliedGrowth);
    }
  }

  let errorCode: MemberErrorCode | '' = convictionCode || qualityCode;
  if (errorCode === '' && growthAvailability === 'AVAILABLE' && growth !== null && !growth.admitted) {
    errorCode = 'MEMBER_GROWTH_INVALID';
  }

  const member: AdmittedMember = {
    sector,
    referenceId,
    convictionText: frameableText(record.conviction),
    qualityText: frameableText(record.quality),
    growthAvailability,
    ...(growthAvailability === 'AVAILABLE' ? { growthText: frameableText(suppliedGrowth) } : {}),
    engineId: record.engineId as string,
    engineVersion: record.engineVersion as string,
    calibrationVersion: record.calibrationVersion as string,
    snapshotId: record.snapshotId as string,
    evidenceId: record.evidenceId as string,
    convictionQ: conviction.admitted ? conviction.q : null,
    qualityQ: quality.admitted ? quality.q : null,
    // UNAVAILABLE growth carries no exact key at all: there is no value to key.
    growthQ: growth !== null && growth.admitted ? growth.q : null,
    status: errorCode === '' ? 'VALID' : 'INVALID_MEMBER',
    errorCode,
  };
  return { structural: null, member };
}

function invalidMember(
  record: Record<string, unknown>,
  growthAvailability: GrowthAvailability,
  errorCode: MemberErrorCode,
  _message: string,
): AdmittedMember {
  return {
    sector: record.sector as string,
    referenceId: record.referenceId as string,
    convictionText: frameableText(record.conviction),
    qualityText: frameableText(record.quality),
    growthAvailability,
    ...(growthAvailability === 'AVAILABLE' ? { growthText: frameableText(record.growth) } : {}),
    engineId: record.engineId as string,
    engineVersion: record.engineVersion as string,
    calibrationVersion: record.calibrationVersion as string,
    snapshotId: record.snapshotId as string,
    evidenceId: record.evidenceId as string,
    convictionQ: null,
    qualityQ: null,
    growthQ: null,
    status: 'INVALID_MEMBER',
    errorCode,
  };
}
