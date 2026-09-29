/**
 * Gate 43 — First non-production IRR <-> IPD integration vertical slice.
 *
 * PIT READ PORT (IRR side).
 *
 * The port is the ONLY thing the IRR application depends on. It is an
 * interface, not an implementation: it carries no store, no journal, no
 * persistence and no key grammar. Whatever sits behind it (an in-process
 * adapter today, a local non-production transport later) is IPD's business.
 *
 * IPD remains the sole PIT authority. IRR consumes that capability through
 * this port and never re-implements or duplicates it.
 */
import type { PitReadRequest, PitReadResult } from './pitReadContract.js';

/**
 * The read capability IRR is authorised to consume in this first slice.
 *
 * `queryAsOf` is deliberately the only operation: the first slice is a
 * point-in-time read, and `queryRange` is intentionally NOT exposed until a
 * later seam demonstrates it can be added without expanding scope.
 */
export interface PitReadPort {
  queryAsOf(request: PitReadRequest): Promise<PitReadResult>;
}