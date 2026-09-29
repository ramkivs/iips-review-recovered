/**
 * Gate 43 — First non-production IRR <-> IPD integration vertical slice.
 *
 * IU-5 — IPD-BACKED PIT READ ADAPTER (IRR side).
 *
 * This is the concrete implementation of the `PitReadPort` interface. It is
 * the ONLY place in IRR that references the IPD package, and it exists purely
 * to bridge IRR's request/result contract onto the IPD capability.
 *
 * It contains no PIT logic of its own. It does not resolve vintages, does not
 * select a series, does not decide "latest wins", and does not hold any store
 * state. Every such decision belongs to IPD:
 *
 *     PitReadPort  ->  IPD PitReadService  ->  IPD PointInTimeStore
 *
 * The store is INJECTED. This adapter never constructs, seeds or mutates one:
 * the authoritative store and the population of it are IPD's business, and IRR
 * must not manufacture PIT records. Whatever store it is handed is the store
 * whose answers are returned, verbatim.
 *
 * The dependency is the authorized IU-5A package boundary, pinned to IPD
 * `0dab1221fb0f89e2e0601ea905d642bfe72d5f9c` and consumed through its public
 * `iips-production-market-data/pit` subpath. No deep import into IPD's source
 * tree and no second transport.
 */
import { PitReadService } from 'iips-production-market-data/pit';
import type { DataProvenanceDTO, PointInTimeStore } from 'iips-production-market-data/pit';
import type { PitReadPort } from './pitReadPort.js';
import type {
  PitReadDomain,
  PitReadProvenance,
  PitReadRequest,
  PitReadResult,
} from './pitReadContract.js';

/** The authoritative IPD store this adapter reads through. */
export type IpdPitStore = PointInTimeStore<unknown>;

/**
 * Map an IPD provenance block onto the IRR provenance contract.
 *
 * IPD's `DataProvenanceDTO` is a superset of the six fields IRR carries. Only
 * those six are projected; the value is copied, never recomputed, re-stamped
 * or reinterpreted. IRR's PIT `asOf` and IRR's live-snapshot `asOf` occupy
 * different semantic spaces and are never conflated here.
 */
function toIrrProvenance(provenance: DataProvenanceDTO): PitReadProvenance {
  return {
    asOf: provenance.asOf,
    receivedAt: provenance.receivedAt,
    evaluatedAt: provenance.evaluatedAt,
    dataVersion: provenance.dataVersion,
    lineageHash: provenance.lineageHash,
    qualityState: provenance.qualityState,
  };
}

/**
 * Build the IRR `PitReadPort` backed by the real IPD PIT capability.
 *
 * The returned port is fail-closed by construction: it only ever yields what
 * IPD returned. IPD's typed miss reasons are surfaced unchanged, so an absent
 * record stays an absent record and is never turned into a substitute value.
 */
export function createIpdPitReadPort(store: IpdPitStore): PitReadPort {
  // The real IPD read service, over the injected authoritative store.
  const service = new PitReadService<unknown>(store);

  return {
    async queryAsOf(request: PitReadRequest): Promise<PitReadResult> {
      const result = service.queryAsOf({
        securityId: request.securityId,
        // IPD validates the domain against its own full domain set. IRR's
        // narrower D01/D02 limit is enforced upstream at the boundary, so this
        // value has already passed the IRR contract before it reaches here.
        domain: request.domain as never,
        asOf: request.asOf,
      });

      if (!result.found) {
        return { found: false, reason: result.reason };
      }

      return {
        found: true,
        securityId: result.securityId,
        domain: result.domain as PitReadDomain,
        asOf: result.asOf,
        resolvedAsOf: result.resolvedAsOf,
        payload: result.payload,
        provenance: toIrrProvenance(result.provenance),
      };
    },
  };
}
