/**
 * IID-0 — canonical serialisation and content digests.
 *
 * Deterministic by construction: object keys sorted by code point, arrays in order, no undefined, no
 * non-finite numbers. The digest of a dataset is therefore a function of its content only — never of
 * import order, file mtimes or when it was imported (design of record Part II §R-7).
 */
import { createHash } from 'node:crypto';

export class CanonicalError extends Error {
  constructor(message: string, readonly path: string) {
    super(message);
    this.name = 'CanonicalError';
  }
}

function canonicalValue(value: unknown, path: string, seen: Set<object>): string {
  if (value === null) return 'null';
  const type = typeof value;
  if (type === 'boolean') return value === true ? 'true' : 'false';
  if (type === 'string') return JSON.stringify(value);
  if (type === 'number') {
    if (!Number.isFinite(value as number)) throw new CanonicalError('non-finite number', path);
    return JSON.stringify(value);
  }
  if (type === 'undefined') throw new CanonicalError('undefined has no canonical form', path);
  if (type === 'object') {
    const object = value as object;
    if (seen.has(object)) throw new CanonicalError('cyclic value', path);
    seen.add(object);
    try {
      if (Array.isArray(value)) {
        return `[${value.map((entry, index) => canonicalValue(entry, `${path}[${index}]`, seen)).join(',')}]`;
      }
      const record = value as Record<string, unknown>;
      const keys = Object.keys(record).sort();
      const body = keys
        .filter((key) => record[key] !== undefined)
        .map((key) => `${JSON.stringify(key)}:${canonicalValue(record[key], `${path}.${key}`, seen)}`);
      return `{${body.join(',')}}`;
    } finally {
      seen.delete(object);
    }
  }
  throw new CanonicalError(`unsupported value type ${type}`, path);
}

export function canonicalize(value: unknown): string {
  return canonicalValue(value, '$', new Set<object>());
}

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** `sha256:<hex>` — the form used in manifests, provenance and reproduction records. */
export function digestOf(value: unknown): string {
  return `sha256:${sha256Hex(canonicalize(value))}`;
}
