/**
 * Program v3.0 — NP-06 Reports: canonicalization (content identity).
 *
 * Implements the canonicalization contract of NP-06 §5.2 (closed decision C2) and the canonical
 * structured payload representation required by §5.3.
 *
 * AUTHORITY AND EQUIVALENCE
 * -------------------------
 * NP-04 (the common governed persistence foundation) already implements §5.2 for the persistence
 * boundary. This module is NOT a redefinition: it is the Reports-side implementation required by
 * NP-06 §5.3, which makes recomputation of `reportKey` a *Reports* validation obligation
 * ("`reportKey` … recomputes correctly"). Reports cannot discharge that obligation without being
 * able to canonicalize.
 *
 * Because a second implementation of the same contract is a real divergence hazard, equivalence is
 * proven rather than asserted: `reports-canonical.test.ts` pins golden vectors produced by
 * executing the authoritative NP-04 implementation at
 * `iips-production-market-data@bd5229d0:src/persistence/reportKey.ts`, and requires byte-identical
 * canonical output and identical derived keys. Content identity therefore has exactly one meaning
 * across both repositories. See §"Consolidation obligation" in the test file.
 *
 * `reportKey` is deterministic CONTENT identity. It is never instance identity — see artifact.ts.
 */
import { createHash } from 'node:crypto';

/** Schema version of the canonical member set understood by this module. */
export const CANONICAL_SCHEMA_VERSION = 1 as const;

/**
 * A schemaVersion-1 parameter value. Flat primitives only.
 *
 * Nested objects and arrays are deliberately excluded: the canonicalization contract is defined
 * over flat primitives so that ordering is total and unambiguous. A nested value is rejected
 * rather than flattened, because silently flattening would change content identity.
 */
export type CanonicalParameterValue = string | number | boolean | null;

/** The four — and only four — canonical members that constitute content identity. */
export interface CanonicalReportKeyInput {
  readonly reportType: string;
  readonly portfolioId: string;
  /** Optional. An absent scenario is represented as explicit null, never omitted. */
  readonly scenario?: string | null;
  /** Optional. Absent is represented as explicit null, never omitted. */
  readonly parameters?: Readonly<Record<string, CanonicalParameterValue>> | null;
}

/** Raised for any input that cannot be canonicalized. Reports fails closed: reject, never coerce. */
export class CanonicalizationError extends Error {
  constructor(message: string, readonly detail: Record<string, unknown> = {}) {
    super(message);
    this.name = 'CanonicalizationError';
  }
}

function reject(message: string, detail: Record<string, unknown> = {}): never {
  throw new CanonicalizationError(message, detail);
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    reject(`${field} must be a non-empty string`, { field });
  }
  return value;
}

/**
 * Compare two strings by UNICODE CODE POINT.
 *
 * The default Array#sort comparator orders by UTF-16 code unit, which places astral-plane
 * characters (U+10000 and above, encoded as surrogates U+D800..U+DFFF) before U+E000..U+FFFF.
 * Code-point ordering places them last. §5.2 rule 3 requires code-point order, so the distinction
 * is observable and must be implemented explicitly.
 */
export function compareByCodePoint(a: string, b: string): number {
  const left = Array.from(a);
  const right = Array.from(b);
  const shared = Math.min(left.length, right.length);
  for (let i = 0; i < shared; i += 1) {
    const l = left[i]!.codePointAt(0)!;
    const r = right[i]!.codePointAt(0)!;
    if (l !== r) return l < r ? -1 : 1;
  }
  return left.length === right.length ? 0 : left.length < right.length ? -1 : 1;
}

function assertPrimitive(value: unknown, name: string): CanonicalParameterValue {
  if (value === null) return null;
  const t = typeof value;
  if (t === 'string' || t === 'boolean') return value as string | boolean;
  if (t === 'number') {
    const n = value as number;
    // NaN and +/-Infinity have no canonical JSON representation. Reject rather than serialize.
    if (!Number.isFinite(n)) reject(`parameter '${name}' must be a finite number`, { name });
    return n;
  }
  reject(
    `parameter '${name}' must be a schemaVersion-1 flat primitive (string, number, boolean, or null)`,
    { name },
  );
}

/**
 * Produce the canonical UTF-8 JSON text for a report key.
 *
 * Rules applied (NP-06 §5.2):
 *  1. fixed top-level member order: reportType, portfolioId, scenario, parameters
 *  2. parameters sorted by code point of member name
 *  3. absent optional members serialized as explicit null, never omitted
 *  4. numbers use the shortest round-trip decimal representation (JSON.stringify is exactly that)
 *  5. strings escaped per JSON (", \, control characters); no forward-slash escaping
 *  6. no case folding
 *  7. no Unicode normalization — the input is encoded as given
 */
export function canonicalizeReportKey(input: CanonicalReportKeyInput): string {
  if (input === null || typeof input !== 'object') {
    reject('report key input must be an object', { field: 'input' });
  }

  const reportType = requireNonEmptyString(input.reportType, 'reportType');
  const portfolioId = requireNonEmptyString(input.portfolioId, 'portfolioId');

  const scenario =
    input.scenario === undefined || input.scenario === null
      ? null
      : requireNonEmptyString(input.scenario, 'scenario');

  let parameters: string;
  if (input.parameters === undefined || input.parameters === null) {
    parameters = 'null';
  } else {
    if (typeof input.parameters !== 'object' || Array.isArray(input.parameters)) {
      reject('parameters must be a flat object of primitives', { field: 'parameters' });
    }
    const entries = Object.entries(input.parameters);
    entries.forEach(([name]) => requireNonEmptyString(name, 'parameter name'));
    const values = new Map(entries.map(([name, value]) => [name, assertPrimitive(value, name)]));
    const sortedNames = [...values.keys()].sort(compareByCodePoint);
    if (sortedNames.length === 0) {
      // An empty parameter set carries exactly as much meaning as an absent one, so both
      // canonicalize to explicit null. Otherwise two consumers building the same report with `{}`
      // and with no parameters at all would compute different content identity.
      parameters = 'null';
    } else {
      const body = sortedNames.map((name) => `${JSON.stringify(name)}:${JSON.stringify(values.get(name))}`);
      parameters = `{${body.join(',')}}`;
    }
  }

  // Fixed order. No case folding, no Unicode normalization.
  return (
    `{"reportType":${JSON.stringify(reportType)},` +
    `"portfolioId":${JSON.stringify(portfolioId)},` +
    `"scenario":${JSON.stringify(scenario)},` +
    `"parameters":${parameters}}`
  );
}

/**
 * Derive deterministic content identity: lowercase hex SHA-256 over the canonical UTF-8 bytes.
 * Deterministic across processes, machines, and insertion order.
 */
export function deriveReportKey(input: CanonicalReportKeyInput): string {
  return createHash('sha256').update(canonicalizeReportKey(input), 'utf8').digest('hex');
}

/** A JSON value that can appear in a canonical payload. */
export type CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalJsonValue[]
  | { readonly [key: string]: CanonicalJsonValue };

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value) as object | null;
  return proto === Object.prototype || proto === null;
}

function canonicalizeValue(value: unknown, path: string, seen: Set<object>): string {
  if (value === null) return 'null';

  const t = typeof value;
  if (t === 'boolean') return value ? 'true' : 'false';
  if (t === 'string') return JSON.stringify(value);
  if (t === 'number') {
    const n = value as number;
    if (!Number.isFinite(n)) reject(`number at ${path} must be finite`, { path });
    // JSON.stringify emits the shortest round-trip decimal form. Matches §5.2 rule 4.
    return JSON.stringify(n);
  }
  if (t === 'bigint') reject(`bigint at ${path} has no canonical JSON form`, { path });
  if (t === 'undefined') reject(`undefined at ${path} has no canonical JSON form`, { path });
  if (t === 'function' || t === 'symbol') reject(`unsupported ${t} at ${path}`, { path });

  if (typeof value === 'object') {
    const obj = value as object;
    // Cycle detection. A cyclic payload has no canonical form; reject rather than hang.
    if (seen.has(obj)) reject(`cyclic value at ${path} has no canonical form`, { path });
    seen.add(obj);
    try {
      if (Array.isArray(value)) {
        const items = value.map((item, i) => canonicalizeValue(item, `${path}[${i}]`, seen));
        return `[${items.join(',')}]`;
      }
      // Reject non-plain objects (Date, Map, class instances): their JSON shape is lossy or
      // implementation-defined, so accepting them would make content identity unstable.
      if (!isPlainObject(obj)) {
        reject(`non-plain object at ${path} has no canonical JSON form`, { path });
      }
      const record = value as Record<string, unknown>;
      const names = Object.keys(record).sort(compareByCodePoint);
      const body = names.map((name) => `${JSON.stringify(name)}:${canonicalizeValue(record[name], `${path}.${name}`, seen)}`);
      return `{${body.join(',')}}`;
    } finally {
      seen.delete(obj);
    }
  }

  reject(`unsupported value at ${path}`, { path });
}

/**
 * Produce the canonical UTF-8 JSON text for a structured report payload.
 *
 * Object members are ordered by code point (recursively), so the canonical text is byte-stable
 * regardless of construction order. This is what makes NP-06 §5.3's requirement that
 * `canonicalPayload` "re-canonicalizes byte-identically" checkable.
 */
export function canonicalizePayload(value: unknown): string {
  return canonicalizeValue(value, '$', new Set<object>());
}
