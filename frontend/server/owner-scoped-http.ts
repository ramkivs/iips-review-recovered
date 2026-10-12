/**
 * Shared HTTP helpers for the owner-scoped transports (NP-09 / NP-10 / NP-11).
 *
 * These helpers carry no ownership semantics of their own: they only bound and parse the request
 * body and serialise a response. In particular nothing here reads an identity, a tenant, an owner
 * or a principal from the request — the owner context is established exclusively by the
 * server-owned resolver (`owner-context-resolver.ts`).
 */
import type http from 'node:http';

/**
 * Maximum accepted request body size in bytes (malformed-input limit).
 *
 * Every opaque input this boundary accepts is a small JSON object (an identifier, a name, a title,
 * a bounded preference patch, a bounded reference list). 64 KiB is far above any authorised payload
 * and far below anything that would let a client influence server memory or parsing cost.
 */
export const MAX_REQUEST_BODY_BYTES = 64 * 1024;

export type JsonBodyResult =
  | { readonly ok: true; readonly value: unknown }
  | { readonly ok: false; readonly status: 400 | 413; readonly error: string };

/**
 * Read and parse a JSON request body.
 *
 * An empty body resolves to `ok` with `undefined`: absent input is not a transport error, it is
 * simply input the service validation must reject with its own stable code. A body larger than the
 * limit is refused with 413 and a body that is not valid JSON with 400 — neither is ever partially
 * parsed, coerced or repaired.
 */
export function readJsonBody(
  req: http.IncomingMessage,
  maxBytes: number = MAX_REQUEST_BODY_BYTES,
): Promise<JsonBodyResult> {
  return new Promise<JsonBodyResult>((resolve) => {
    const chunks: Buffer[] = [];
    let total = 0;
    let settled = false;

    const finish = (result: JsonBodyResult): void => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    req.on('data', (chunk: Buffer) => {
      if (settled) return;
      total += chunk.length;
      if (total > maxBytes) {
        finish({ ok: false, status: 413, error: 'request-body-too-large' });
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (settled) return;
      const text = Buffer.concat(chunks).toString('utf8');
      if (text.trim().length === 0) {
        finish({ ok: true, value: undefined });
        return;
      }
      try {
        finish({ ok: true, value: JSON.parse(text) as unknown });
      } catch {
        finish({ ok: false, status: 400, error: 'invalid-json' });
      }
    });

    req.on('error', () => finish({ ok: false, status: 400, error: 'invalid-request-body' }));
  });
}

/** Serialise a JSON response with an explicit status. */
export function sendJson(res: http.ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

/**
 * The composed server failed to supply a governed dependency the capability's valid path requires.
 *
 * This is an INFRASTRUCTURE failure, not an owner-context failure: the owner context resolved
 * successfully, but no governed universe / reference provider was composed, so no governed value
 * can be established. It is deliberately distinct from `503 owner-context-unavailable` and is
 * unreachable in the composed server, which always supplies both providers.
 */
export function sendGovernedDependencyUnavailable(res: http.ServerResponse): void {
  sendJson(res, 500, { error: 'governed-dependency-unavailable' });
}
