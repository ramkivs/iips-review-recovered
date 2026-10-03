/**
 * NP-12 N4-A9 Increment 1 — canonical format writers for `NP12MBR` / `NP12EXE` / `NP12RES`
 * version `01`.
 *
 * Authority: NP-12-N4-A6-CONTRACT-SPECIFICATION.md §§5, 8, 9, 10 (frozen), bounded by
 * NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md §11 (`A9-D01`).
 *
 * The frozen `NP12DEF` elementary vocabulary is reused verbatim (A6 §5): octets, `||`
 * concatenation with no separator, `U32BE`, strict RFC 3629 UTF-8, the `T(s)` length-
 * prefixed text frame, SHA-256, and 64-lowercase-hex digest rendering. No component
 * delimiters, field tags, operator tags, end marker, padding, BOM, trailing newline, or
 * total-message-length prefix is ever emitted, and no preimage contains its own digest.
 *
 * Framing primitives below are the mechanical implementation work delegated by A6 §15.1.
 * No member identity, availability vocabulary, growth evaluation semantics, numeric
 * admission, field order, member order, integer width/signedness/byte order, header or
 * format-version octet, status spelling, population representation, digest membership, or
 * message termination is decided here — all of it is consumed as published.
 */

import { createHash } from 'node:crypto';
import type { AdmittedMember, GrowthAvailability } from './ScreenMemberInput';

/** `H_MBR` — ASCII `NP12MBR` || NUL || format version `01`. */
export const HEADER_MBR = '4e5031324d42520001';
/** `H_EXE` — ASCII `NP12EXE` || NUL || format version `01`. */
export const HEADER_EXE = '4e5031324558450001';
/** `H_RES` — ASCII `NP12RES` || NUL || format version `01`. */
export const HEADER_RES = '4e5031325245530001';

/** The only admitted format-version octet. */
export const FORMAT_VERSION = 1;

/** Availability octets (A6 §8.2). Exactly `00` and `01`; any other octet is invalid. */
export const AVAILABILITY_OCTET_UNAVAILABLE = 0x00;
export const AVAILABILITY_OCTET_AVAILABLE = 0x01;

const MAX_U32 = 4_294_967_295;

/** Exact ASCII execution and member status vocabularies (A6 §10.2) — no numeric tags. */
export const EXECUTION_STATUS_COMPLETED = 'COMPLETED';
export type MemberResultStatus = 'MATCH' | 'NO_MATCH' | 'INVALID_MEMBER';

/** 64 lowercase hexadecimal characters — the only admitted digest rendering. */
const LOWERCASE_HEX_64 = /^[0-9a-f]{64}$/;

export function isLowercaseHex64(value: unknown): value is string {
  return typeof value === 'string' && value.length === 64 && LOWERCASE_HEX_64.test(value);
}

/** SHA-256 over exactly the supplied octets, rendered as 64 lowercase hex characters. */
export function sha256Hex(octets: Buffer): string {
  return createHash('sha256').update(octets).digest('hex');
}

/**
 * `U32BE(n)` — exactly four octets, unsigned big-endian. No varint, no signed form, no
 * little-endian option, no padding (byte grammar §6.2).
 */
export function u32be(value: number): Buffer {
  if (!Number.isInteger(value) || value < 0 || value > MAX_U32) {
    throw new RangeError('Canonical format requires an unsigned 32-bit integer count');
  }
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32BE(value);
  return bytes;
}

/**
 * Strict UTF-8 byte length of a valid Unicode scalar sequence (byte grammar §6.3).
 * Unpaired surrogates are rejected BEFORE any potentially replacement-based encoding,
 * so `Buffer.from` can never silently substitute U+FFFD.
 */
export function utf8ByteLength(value: string): number {
  let byteLength = 0;
  for (let i = 0; i < value.length; i += 1) {
    let scalar = value.charCodeAt(i);
    if (scalar >= 0xd800 && scalar <= 0xdbff) {
      const low = value.charCodeAt(i + 1);
      if (!(low >= 0xdc00 && low <= 0xdfff)) {
        throw new RangeError('Unpaired high surrogate has no strict UTF-8 encoding');
      }
      scalar = 0x10000 + (scalar - 0xd800) * 0x400 + (low - 0xdc00);
      i += 1;
    } else if (scalar >= 0xdc00 && scalar <= 0xdfff) {
      throw new RangeError('Unpaired low surrogate has no strict UTF-8 encoding');
    }
    byteLength += scalar <= 0x7f ? 1 : scalar <= 0x7ff ? 2 : scalar <= 0xffff ? 3 : 4;
    if (!Number.isSafeInteger(byteLength) || byteLength > MAX_U32) {
      throw new RangeError('Text has no format-1 U32 byte-length encoding');
    }
  }
  return byteLength;
}

/**
 * `T(s)` — `U32BE(utf8ByteLength(s)) || UTF8(s)`, the length-prefixed text frame.
 * The length prefix is a BYTE count, never a UTF-16 code-unit count.
 */
export function text(value: string): Buffer {
  const byteLength = utf8ByteLength(value);
  return Buffer.concat([u32be(byteLength), Buffer.from(value, 'utf8')], 4 + byteLength);
}

function concatOctets(parts: readonly Buffer[]): Buffer {
  let totalLength = 0;
  for (const part of parts) {
    totalLength += part.length;
    if (!Number.isSafeInteger(totalLength)) {
      throw new RangeError('Message length cannot be represented with exact arithmetic');
    }
  }
  return Buffer.concat(parts, totalLength);
}

/* ------------------------------------------------------------------ *
 * NP12MBR v01 — Screen Member Evaluation Input and inputHash (A6 §8)
 * ------------------------------------------------------------------ */

/**
 * `GROWTH(member)` (A6 §8.2):
 *   `00`                                        when availability = UNAVAILABLE
 *   `01 || T(canonical decimal text of growth)`  when availability = AVAILABLE
 * The `00` form is complete in itself: no value frame follows it.
 */
export function growthComponent(availability: GrowthAvailability, growthText: string | undefined): Buffer {
  if (availability === 'UNAVAILABLE') {
    return Buffer.from([AVAILABILITY_OCTET_UNAVAILABLE]);
  }
  if (availability !== 'AVAILABLE') {
    throw new RangeError('Growth availability octet admits exactly 00 and 01');
  }
  if (growthText === undefined) {
    throw new RangeError('An AVAILABLE growth member must carry growth text');
  }
  return Buffer.concat(
    [Buffer.from([AVAILABILITY_OCTET_AVAILABLE]), text(growthText)],
    1 + 4 + utf8ByteLength(growthText),
  );
}

/**
 * The exact `NP12MBR` v01 `inputHash` preimage (A6 §8.3), in the fixed positional order.
 * Field order is never object-property order, never locale collation, never alphabetical,
 * and never caller-supplied (A6 §8.4).
 */
export function memberPreimage(member: AdmittedMember, populationIdentity: string): Buffer {
  if (!isLowercaseHex64(populationIdentity)) {
    throw new RangeError('Population identity must be 64 lowercase hexadecimal text octets');
  }
  return concatOctets([
    Buffer.from(HEADER_MBR, 'hex'),
    text(member.sector),
    text(member.referenceId),
    text(populationIdentity),
    text(member.convictionText),
    text(member.qualityText),
    growthComponent(member.growthAvailability, member.growthText),
    text(member.engineId),
    text(member.engineVersion),
    text(member.calibrationVersion),
    text(member.snapshotId),
    text(member.evidenceId),
  ]);
}

/** `inputHash` = lowercase-hex(SHA-256(memberPreimage)) — per-member only (A6-DR-04). */
export function memberInputHash(member: AdmittedMember, populationIdentity: string): string {
  return sha256Hex(memberPreimage(member, populationIdentity));
}

/* ------------------------------------------------------------------ *
 * NP12EXE v01 — ScreenExecution identity (A6 §9)
 * ------------------------------------------------------------------ */

/** One G5-ordered member binding of the hash-of-hashes construction. */
export interface ExecutionMemberBinding {
  readonly sector: string;
  readonly referenceId: string;
  readonly inputHash: string;
}

/**
 * The exact `NP12EXE` v01 preimage (A6 §9.2) — the authorized hash-of-hashes construction
 * (`A6-DR-05`). `timestamp` and `requestId` never appear (A6-DR-03, A6-DR-02).
 *
 * The caller MUST supply bindings already in canonical G5 order; this writer never sorts
 * and never re-derives an order (A6 §12 normative, `A6-IMPL-09`).
 */
export function executionPreimage(
  header: Buffer,
  fields: {
    readonly definitionId: string;
    readonly version: string;
    readonly definitionDigest: string;
    readonly populationIdentity: string;
    readonly evaluatorId: string;
    readonly evaluatorVersion: string;
    readonly executionSemanticsVersion: string;
  },
  bindings: readonly ExecutionMemberBinding[],
): Buffer {
  if (!isLowercaseHex64(fields.definitionDigest)) {
    throw new RangeError('Definition digest must be 64 lowercase hexadecimal characters');
  }
  if (!isLowercaseHex64(fields.populationIdentity)) {
    throw new RangeError('Population identity must be 64 lowercase hexadecimal text octets');
  }
  for (const binding of bindings) {
    if (!isLowercaseHex64(binding.inputHash)) {
      throw new RangeError('Member inputHash must be 64 lowercase hexadecimal characters');
    }
  }
  const parts: Buffer[] = [
    header,
    text(fields.definitionId),
    text(fields.version),
    text(fields.definitionDigest),
    text(fields.populationIdentity),
    text(fields.evaluatorId),
    text(fields.evaluatorVersion),
    text(fields.executionSemanticsVersion),
    u32be(bindings.length),
  ];
  for (const binding of bindings) {
    parts.push(text(binding.sector), text(binding.referenceId), text(binding.inputHash));
  }
  return concatOctets(parts);
}

/** `executionId` = lowercase-hex(SHA-256(executionPreimage)). */
export function executionIdFrom(
  fields: Parameters<typeof executionPreimage>[1],
  bindings: readonly ExecutionMemberBinding[],
): string {
  return sha256Hex(executionPreimage(Buffer.from(HEADER_EXE, 'hex'), fields, bindings));
}

/* ------------------------------------------------------------------ *
 * NP12RES v01 — ScreenResult identity (A6 §10)
 * ------------------------------------------------------------------ */

/** One G5-ordered member result frame. */
export interface ResultMemberBinding {
  readonly sector: string;
  readonly referenceId: string;
  readonly memberResultStatus: MemberResultStatus;
  /** The §7.4 member error code, or `''` when status ≠ INVALID_MEMBER (A6 §10.2). */
  readonly memberErrorCode: string;
}

/**
 * The exact `NP12RES` v01 preimage (A6 §10.3).
 *
 * COMPLETED branch only (A9 §11.6): `executionStatus` is admitted here solely as the
 * governed `COMPLETED` token. No `FAILED` result is emitted, defined, or hashed, because
 * `A8-S-03` is an unresolved governance gap and Increment 1 must not resolve it.
 */
export function resultPreimage(
  fields: {
    readonly executionId: string;
    readonly totalPopulationCount: number;
    readonly matchedCount: number;
  },
  bindings: readonly ResultMemberBinding[],
): Buffer {
  if (!isLowercaseHex64(fields.executionId)) {
    throw new RangeError('Execution identity must be 64 lowercase hexadecimal characters');
  }
  const parts: Buffer[] = [
    Buffer.from(HEADER_RES, 'hex'),
    text(fields.executionId),
    text(EXECUTION_STATUS_COMPLETED),
    u32be(fields.totalPopulationCount),
    u32be(fields.matchedCount),
    u32be(bindings.length),
  ];
  for (const binding of bindings) {
    parts.push(
      text(binding.sector),
      text(binding.referenceId),
      text(binding.memberResultStatus),
      text(binding.memberErrorCode),
    );
  }
  return concatOctets(parts);
}

/** `resultId` = lowercase-hex(SHA-256(resultPreimage)). */
export function resultIdFrom(
  fields: Parameters<typeof resultPreimage>[0],
  bindings: readonly ResultMemberBinding[],
): string {
  return sha256Hex(resultPreimage(fields, bindings));
}
