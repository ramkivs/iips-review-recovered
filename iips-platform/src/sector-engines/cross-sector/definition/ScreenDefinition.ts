/**
 * NP-12 N4 — Screen Definition, bounded by N4-SD-IMPLEMENTATION.
 *
 * Authority: NP-12-N4-IMPLEMENTATION-AUTHORITY-DECISION-RECORD.md.
 * Format 1: NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD.md, §§5–10.
 * This module implements content only, not registration, persistence, or evaluation.
 * Identity remains the exact (definitionId, version) pair, never the content digest.
 */
import { createHash } from 'node:crypto';
import type { ScreeningPopulation } from '../population/ScreeningPopulation';

export type ScreeningField = 'conviction' | 'quality' | 'growth';
export type ScreeningOperator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq';

/** Lossless decimal source text; a binary number cannot retain source precision/notation. */
export interface ScreeningPredicate {
  readonly field: ScreeningField;
  readonly operator: ScreeningOperator;
  readonly operand: string;
}

export interface ScreenDefinitionInput {
  readonly definitionId: string;
  readonly version: string;
  readonly populationIdentity: string;
  /** Explicit finite flat AND collection, including an explicitly supplied empty array. */
  readonly predicates: readonly ScreeningPredicate[];
}

export type ScreenDefinitionErrorCode =
  | 'INVALID_DEFINITION'
  | 'INVALID_IDENTIFIER'
  | 'INVALID_POPULATION_BINDING'
  | 'INVALID_PREDICATE'
  | 'INVALID_OPERAND'
  | 'ENCODING_CAPACITY';

export class ScreenDefinitionError extends Error {
  constructor(readonly code: ScreenDefinitionErrorCode, message: string) {
    super(message);
    this.name = 'ScreenDefinitionError';
  }
}

const HEADER_HEX = '4e5031324445460001';
const MAX_U32 = 4_294_967_295;
const MAX_CANONICAL_PREDICATES = 1_500_000_015;
const SCALE = 1_000_000n;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** The fixed §6.4 White_Space set, not trim(), \s, or a runtime Unicode table. */
function isBlankScalar(scalar: number): boolean {
  return (scalar >= 0x0009 && scalar <= 0x000d)
    || scalar === 0x0020 || scalar === 0x0085 || scalar === 0x00a0
    || scalar === 0x1680 || (scalar >= 0x2000 && scalar <= 0x200a)
    || scalar === 0x2028 || scalar === 0x2029 || scalar === 0x202f
    || scalar === 0x205f || scalar === 0x3000;
}

/** Validate UTF-16 scalar structure BEFORE any potentially replacement-based encoding. */
function inspectText(text: string): { byteLength: number; nonBlank: boolean } {
  let byteLength = 0;
  let nonBlank = false;
  for (let i = 0; i < text.length; i++) {
    let scalar = text.charCodeAt(i);
    if (scalar >= 0xd800 && scalar <= 0xdbff) {
      const low = text.charCodeAt(i + 1);
      if (!(low >= 0xdc00 && low <= 0xdfff)) {
        throw new ScreenDefinitionError('INVALID_IDENTIFIER', 'Unpaired high surrogate is rejected');
      }
      scalar = 0x10000 + (scalar - 0xd800) * 0x400 + (low - 0xdc00);
      i++;
    } else if (scalar >= 0xdc00 && scalar <= 0xdfff) {
      throw new ScreenDefinitionError('INVALID_IDENTIFIER', 'Unpaired low surrogate is rejected');
    }
    if (!isBlankScalar(scalar)) nonBlank = true;
    byteLength += scalar <= 0x7f ? 1 : scalar <= 0x7ff ? 2 : scalar <= 0xffff ? 3 : 4;
    if (!Number.isSafeInteger(byteLength) || byteLength > MAX_U32) {
      throw new ScreenDefinitionError('ENCODING_CAPACITY', 'Text has no format-1 U32 byte-length encoding');
    }
  }
  return { byteLength, nonBlank };
}

function identifier(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new ScreenDefinitionError('INVALID_IDENTIFIER', `${label} must be text without coercion`);
  }
  if (!inspectText(value).nonBlank) {
    throw new ScreenDefinitionError('INVALID_IDENTIFIER', `${label} must be non-empty and non-blank`);
  }
  return value;
}

function isPopulationIdentity(value: unknown): value is string {
  // The length check also prevents JavaScript's $ anchor from accepting a terminal newline.
  return typeof value === 'string' && value.length === 64 && /^[0-9a-fA-F]{64}$/.test(value);
}

/** Admission precedes normalization. No decimal value is parsed as binary floating point. */
function decimal(value: unknown): { q: bigint; text: string } {
  if (typeof value !== 'string') {
    throw new ScreenDefinitionError('INVALID_OPERAND', 'Operand must be lossless fixed-point decimal text');
  }
  const match = /^(-?)(0|[1-9][0-9]*)(?:\.([0-9]{1,6}))?$/.exec(value);
  if (!match || match[0] !== value) {
    throw new ScreenDefinitionError('INVALID_OPERAND', 'Invalid decimal spelling or excess fractional precision');
  }
  const [, sign, integer, fraction = ''] = match;
  // Range rejection before converting an arbitrarily long integer to BigInt.
  if (integer.length > 3) {
    throw new ScreenDefinitionError('INVALID_OPERAND', 'Operand is outside 0–100 inclusive');
  }
  const q = BigInt(integer) * SCALE + BigInt(fraction.padEnd(6, '0'));
  if (q > 100n * SCALE || (sign === '-' && q !== 0n)) {
    throw new ScreenDefinitionError('INVALID_OPERAND', 'Operand is outside 0–100 inclusive');
  }
  const whole = (q / SCALE).toString();
  const remainder = q % SCALE;
  const text = remainder === 0n
    ? whole
    : `${whole}.${remainder.toString().padStart(6, '0').replace(/0+$/, '')}`;
  return { q, text };
}

function isField(value: unknown): value is ScreeningField {
  return value === 'conviction' || value === 'quality' || value === 'growth';
}

function isOperator(value: unknown): value is ScreeningOperator {
  return value === 'lt' || value === 'lte' || value === 'gt' || value === 'gte' || value === 'eq';
}

interface KeyedPredicate {
  readonly predicate: ScreeningPredicate;
  readonly q: bigint;
}

function comparePredicates(a: KeyedPredicate, b: KeyedPredicate): number {
  // These exact tokens are ASCII: string comparison is the specified unsigned ASCII order.
  if (a.predicate.field !== b.predicate.field) return a.predicate.field < b.predicate.field ? -1 : 1;
  if (a.predicate.operator !== b.predicate.operator) return a.predicate.operator < b.predicate.operator ? -1 : 1;
  return a.q === b.q ? 0 : a.q < b.q ? -1 : 1;
}

function canonicalPredicates(value: unknown): readonly ScreeningPredicate[] {
  if (!Array.isArray(value)) {
    throw new ScreenDefinitionError('INVALID_PREDICATE', 'Predicates must be an explicit flat array');
  }
  const unique = new Map<string, KeyedPredicate>();
  for (const entry of value) {
    if (!isRecord(entry)) {
      throw new ScreenDefinitionError('INVALID_PREDICATE', 'Each predicate must be a flat field/operator/operand record');
    }
    const keys = Reflect.ownKeys(entry);
    if (keys.length !== 3 || !keys.every((key) => key === 'field' || key === 'operator' || key === 'operand')) {
      throw new ScreenDefinitionError('INVALID_PREDICATE', 'Predicate shape is exactly field/operator/operand, without nested or Boolean extensions');
    }
    const { field, operator, operand } = entry;
    if (!isField(field) || !isOperator(operator)) {
      throw new ScreenDefinitionError('INVALID_PREDICATE', 'Unknown field or operator; aliases and compound expressions are rejected');
    }
    const { q, text } = decimal(operand);
    // Only governed tokens and integer digits enter this key; none can contain ':'.
    const key = `${field}:${operator}:${q}`;
    if (!unique.has(key)) {
      unique.set(key, { predicate: Object.freeze({ field, operator, operand: text }), q });
    }
  }
  if (unique.size > MAX_CANONICAL_PREDICATES) {
    throw new ScreenDefinitionError('ENCODING_CAPACITY', 'Canonical predicate count exceeds the format-1 domain');
  }
  return Object.freeze([...unique.values()].sort(comparePredicates).map((entry) => entry.predicate));
}

function u32be(value: number): Buffer {
  if (!Number.isInteger(value) || value < 0 || value > MAX_U32) {
    throw new ScreenDefinitionError('ENCODING_CAPACITY', 'Invalid format-1 unsigned 32-bit length/count');
  }
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32BE(value);
  return bytes;
}

/**
 * Immutable canonical semantic content. No execution, result, registration, or lifecycle API.
 * The digest is deliberately a method, not a replacement for (definitionId, version).
 */
export class ScreenDefinition implements ScreenDefinitionInput {
  private constructor(
    readonly definitionId: string,
    readonly version: string,
    readonly populationIdentity: string,
    readonly predicates: readonly ScreeningPredicate[],
  ) {
    Object.freeze(this);
  }

  /**
   * `verifiedPopulation` MUST come from the independently verified established G1–G5
   * population boundary (ScreeningPopulationGuard.fromOutputs(), or its verified result).
   * This argument is an explicit trust boundary, not a population verifier/registry:
   * lexical hex shape alone does not establish a binding. Match exact identity text;
   * do not derive another population identity, embed members, or create case aliases.
   */
  static create(
    input: unknown,
    verifiedPopulation: Pick<ScreeningPopulation, 'identity'>,
  ): ScreenDefinition {
    if (!isRecord(input)) {
      throw new ScreenDefinitionError('INVALID_DEFINITION', 'Screen Definition content must be a record');
    }
    const definitionId = identifier(input.definitionId, 'definitionId');
    const version = identifier(input.version, 'version');
    const populationIdentity = input.populationIdentity;
    if (!isPopulationIdentity(populationIdentity)
      || !isRecord(verifiedPopulation)
      || !isPopulationIdentity(verifiedPopulation.identity)
      || populationIdentity !== verifiedPopulation.identity) {
      throw new ScreenDefinitionError('INVALID_POPULATION_BINDING', 'Exact independently verified population identity is required');
    }
    return new ScreenDefinition(definitionId, version, populationIdentity, canonicalPredicates(input.predicates));
  }

  /** H || T(id) || T(version) || T(populationIdentity) || count || the three frames per predicate. */
  canonicalBytes(): Buffer {
    const parts: Buffer[] = [Buffer.from(HEADER_HEX, 'hex')];
    const text = (value: string): void => {
      const { byteLength } = inspectText(value);
      // Unicode scalar validity was checked before Buffer.from can replace malformed text.
      const payload = Buffer.from(value, 'utf8');
      parts.push(u32be(byteLength), payload);
    };
    text(this.definitionId);
    text(this.version);
    text(this.populationIdentity); // 64 literal hex-text octets, NOT 32 decoded digest octets.
    parts.push(u32be(this.predicates.length));
    for (const predicate of this.predicates) {
      text(predicate.field);
      text(predicate.operator);
      text(predicate.operand);
    }
    let totalLength = 0;
    for (const part of parts) {
      totalLength += part.length;
      if (!Number.isSafeInteger(totalLength)) {
        throw new ScreenDefinitionError('ENCODING_CAPACITY', 'Message length cannot be represented with exact arithmetic');
      }
    }
    // Total length is not restricted to U32. Allocation/resource failures propagate;
    // no lower semantic capacity, truncated output, trailer, or alternative bytes exist.
    return Buffer.concat(parts, totalLength);
  }

  /** SHA-256 of all and only canonical preimage octets, as 64 lowercase hexadecimal characters. */
  sha256(): string {
    return createHash('sha256').update(this.canonicalBytes()).digest('hex');
  }
}
