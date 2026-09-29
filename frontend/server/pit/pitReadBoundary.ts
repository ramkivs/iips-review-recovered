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
 */
export async function queryPitAsOf(port: PitReadPort, request: PitReadRequest): Promise<PitReadResult> {
  const rejection = validatePitReadRequest(request);
  if (rejection !== null) return rejection;

  let result: PitReadResult;
  try {
    result = await port.queryAsOf(request);
  } catch {
    return ambiguous();
  }

  if (!result.found) return result;

  // Belt-and-braces vintage guard: never return a record newer than the query.
  if (!isNotFutureLeakage(result.asOf, result.resolvedAsOf)) return ambiguous();

  return result;
}