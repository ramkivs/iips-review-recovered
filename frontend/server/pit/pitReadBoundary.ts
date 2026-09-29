/**
 * Gate 43 — First non-production IRR <-> IPD integration vertical slice.
 *
 * PIT READ BOUNDARY (IRR side).
 *
 * This is the single choke point through which every IRR PIT read passes.
 * It performs three jobs and nothing else:
 *
 *   1. validate the request, fail-closed, before anything is delegated;
 *   2. delegate to the PitReadPort (IPD remains the PIT authority);
 *   3. re-check the resolved vintage against the requested asOf so that no
 *      future record can be returned even if an upstream misbehaves.
 *
 * It contains NO PIT store, NO key grammar, NO series defaulting, NO
 * companyId/tenantId/userId handling and NO inference from an IRR sector or
 * company identifier.
 */
import type { PitReadPort } from './pitReadPort.js';
import {
  ambiguous,
  invalidAsOf,
  invalidDomain,
  invalidIdentity,
  isValidAsOf,
  isValidSecurityId,
  isNonBlankString,
  isNotFutureLeakage,
  isPitReadDomain,
  type PitReadRequest,
  type PitReadResult,
} from './pitReadContract.js';

/**
 * Fail-closed request validation.
 *
 * Order is deliberate and every branch returns explicitly; there is no
 * fallthrough, no default and no inference. A request that fails any check
 * never reaches the port.
 */
export function validatePitReadRequest(request: unknown): PitReadResult | null {
  if (request === null || typeof request !== 'object') return invalidIdentity();

  const candidate = request as Partial<PitReadRequest>;

  if (!isValidSecurityId(candidate.securityId)) return invalidIdentity();
  if (!isNonBlankString(candidate.domain) || !isPitReadDomain(candidate.domain)) return invalidDomain();
  if (!isValidAsOf(candidate.asOf)) return invalidAsOf();

  return null;
}

/**
 * The boundary itself: validate, then delegate, then guard the vintage.
 *
 * A port that throws is treated as AMBIGUOUS rather than being allowed to
 * surface an untyped error or a partial record.
 *
 * IU-5 / D2 — the vintage guard is evaluated against `request.asOf`, the
 * value THIS boundary received and validated, and never against `result.asOf`.
 *
 * `result.asOf` is data returned by the adapter. Treating it as the reference
 * instant lets an adapter weaken its own boundary: by echoing a LATER `asOf`
 * than was requested, a future-dated record becomes "not in the future"
 * relative to the value the adapter itself supplied, and the guard passes. The
 * request boundary must be anchored to a value the boundary controls.
 */
export async function queryPitAsOf(port: PitReadPort, request: PitReadRequest): Promise<PitReadResult> {
  const rejection = validatePitReadRequest(request);
  if (rejection !== null) return rejection;

  const requestedAsOf = request.asOf;

  let result: PitReadResult;
  try {
    result = await port.queryAsOf(request);
  } catch {
    return ambiguous();
  }

  if (!result.found) return result;

  // Belt-and-braces vintage guard: never return a record newer than the
  // ORIGINAL request. A port that reports a hit for an identity or domain it
  // was not asked about is likewise not admissible.
  if (result.securityId !== request.securityId) return ambiguous();
  if (result.domain !== request.domain) return ambiguous();
  if (!isNotFutureLeakage(requestedAsOf, result.resolvedAsOf)) return ambiguous();

  return result;
}