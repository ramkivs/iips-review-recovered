/**
 * UI10 — server-side governed-reference resolvers for Collaboration.
 *
 * Authority: `docs/integration/IIPS_v3.0_NP10_COLLABORATION_GOVERNANCE_AND_PERSISTENCE_OWNER_DESIGNATION.md`
 * (NP-10-AUTH-01), decision 3 (closed governed object reference set) and decision 4 (persistence).
 *
 * INT-013 requires collaboration to reference **governed IIPS objects, never raw provider
 * records**. This module is the enforcement point: it answers "does this governed object exist
 * for THIS principal in THIS tenant?" using the platform's own authorities.
 *
 * ⚠ Answers are computed SERVER-SIDE from the authenticated principal. Nothing here trusts a
 *   client-supplied identity, and a failed resolution makes the caller fail closed (404) rather
 *   than store a free-text or dangling reference.
 *
 * ⚠ CLOSED SET: `company` | `evidence` | `watchlist`. `report` is NOT resolvable (Reports is not
 *   established in IRR) and no provider kind exists, so a raw provider record is structurally
 *   unreferenceable.
 *
 * ⚠ M-5 / G3 boundary: no identity, directory or session semantics are introduced. Watchlists
 *   are consumed READ-ONLY through their existing authorized interface (`readWatchlist`), scoped
 *   to the authenticated principal — a principal can cite only their OWN watchlists. The
 *   watchlists module is NOT modified.
 */
import { PersistenceService } from '../persistence/persistence-service';
import { getWatchlistsPersistence, readWatchlist } from '../watchlists/watchlists-service';
import type { GovernedRef, ReferenceResolver, VintagePin } from './collaboration-service';

/**
 * Supplies the GOVERNED identities available to a tenant, plus the current governed vintage.
 *
 * Implemented by the transport composition over the certified platform. This module never
 * invents an identity and never derives a governed value of its own.
 */
export interface GovernedReferenceProvider {
  /** Certified governed company identities (the identifiers `/api/company/:id` resolves). */
  companyIds(tenantId: string): Promise<readonly string[]>;
  /** Certified governed evidence identities (the `ev_*` references emitted by the platform). */
  evidenceIds(tenantId: string): Promise<readonly string[]>;
  /** Current governed vintage — pinned onto threads and comments at authoring time (NS-5). */
  vintage(tenantId: string): Promise<VintagePin>;
}

export interface CollaborationResolvers {
  /** Resolves one governed reference for the bound principal. False → fail closed (404). */
  readonly resolve: ReferenceResolver;
  /** Current governed vintage for the bound principal. */
  readonly vintage: () => Promise<VintagePin>;
}

/**
 * Build the resolvers for ONE authenticated principal.
 *
 * `watchlistsStore` is injectable so tests need no shared data directory; the default is the
 * existing UI07 persistence handle, so collaboration cites the SAME journal the Watchlists
 * surface owns.
 */
export function buildCollaborationResolversFor(
  tenantId: string,
  ownerUserId: string,
  provider: GovernedReferenceProvider,
  deps: { readonly watchlistsStore?: PersistenceService } = {},
): CollaborationResolvers {
  return {
    async resolve(ref: GovernedRef): Promise<boolean> {
      if (ref.kind === 'company') {
        // Governed company identities from the certified universe — never a provider record.
        return (await provider.companyIds(tenantId)).includes(ref.id);
      }
      if (ref.kind === 'evidence') {
        // Governed evidence identities from the certified universe.
        return (await provider.evidenceIds(tenantId)).includes(ref.id);
      }
      if (ref.kind === 'watchlist') {
        // Owner-scoped: resolved against the principal's OWN watchlists journal only.
        const store = deps.watchlistsStore ?? getWatchlistsPersistence();
        return readWatchlist(tenantId, ownerUserId, ref.id, store) !== undefined;
      }
      // Unreachable for the closed enum. Kept as an explicit fail-closed default so a future
      // widened type can never silently resolve.
      return false;
    },

    vintage(): Promise<VintagePin> {
      return provider.vintage(tenantId);
    },
  };
}
