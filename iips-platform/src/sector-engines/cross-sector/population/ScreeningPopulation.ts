/**
 * NP-12 Governed Screening — sector-reference population boundary.
 *
 * Implements the five approved NP-12 requirements at the single orchestration
 * boundary through which every population member passes (`CrossSectorEngine.run()`),
 * BEFORE ontology mapping and therefore before any downstream evaluation:
 *
 *   G1  sector normalization      — canonicalize to the 13 certified sector names
 *   G2  composite uniqueness      — enforce uniqueness on (normalized sector, reference id)
 *   G3  duplicate rejection       — reject a repeated composite (fail-closed)
 *   G5  canonical ordering        — order members by (normalized sector, reference id)
 *   G4  stable population identity— membership-only identity of the canonical member set
 *
 * Governed semantics (NP-12 SECTOR-REFERENCE POPULATION SEMANTICS DEFINITION, K-1…K-5):
 *   - a member is identified by the composite `(normalized sector, reference identifier)`;
 *   - the reference identifier is OPAQUE — compared byte-for-byte, never case-folded,
 *     trimmed, aliased, or reinterpreted as company identity;
 *   - sector normalization precedes identity comparison and the normalized value is
 *     what participates in identity;
 *   - population identity is MEMBERSHIP ONLY — never member values, caller/portfolioId,
 *     scenario, strategy, criteria, timestamp, snapshot context, or input ordering.
 *
 * The canonical vocabulary is sourced from the governed 13-name certified sector list,
 * verified identical as a set and in order across `EngineRegistry.CERTIFIED_ENGINES[].sectorFamily`
 * and `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json`. It is deliberately NOT
 * sourced from `ONTOLOGY_METADATA` (a 4-of-13 dimension-key mapping with a permissive fallback)
 * and does NOT inherit `TAXONOMY_RESOLVED` engine-admission alias behaviour.
 */
import { createHash } from 'node:crypto';
import type { EngineOutput } from '../ontology/OntologyMapper';

/** The 13 certified sector display names — the governed canonical vocabulary (K-4). */
export const CANONICAL_SECTORS = [
  'Banking',
  'Insurance',
  'Capital Markets',
  'Healthcare',
  'Hospitality',
  'Energy',
  'Utilities',
  'Consumer',
  'Industrials',
  'Technology',
  'Telecommunications',
  'Automobile',
  'Materials & Metals',
] as const;

export type CanonicalSector = (typeof CANONICAL_SECTORS)[number];

/**
 * Aliases that MUST be rejected rather than mapped (K-4). They are engine-admission
 * taxonomy keys, not Screening sector names, and `TAXONOMY_RESOLVED` alias behaviour is
 * explicitly not inherited. Listed here only to produce a precise rejection message.
 */
const REJECTED_ALIASES = ['IT', 'Chemicals', 'Realty', 'Real Estate'];

/** Failure codes for the governed population boundary. */
export type ScreeningPopulationErrorCode = 'INVALID_SECTOR' | 'DUPLICATE_MEMBER';

/**
 * Fail-closed population violation. Follows the existing certified platform convention
 * of a small `Error` subclass carrying a machine-readable code (cf. `ApiValidationError`).
 */
export class ScreeningPopulationError extends Error {
  readonly code: ScreeningPopulationErrorCode;

  constructor(code: ScreeningPopulationErrorCode, message: string) {
    super(message);
    this.name = 'ScreeningPopulationError';
    this.code = code;
  }
}

/** A governed population member — the composite discriminator. */
export interface PopulationMember {
  /** Normalized sector — one of the 13 certified names. */
  readonly sector: CanonicalSector;
  /** Opaque reference identifier, compared exactly as supplied. */
  readonly referenceId: string;
}

/** The governed Screening population: canonical members plus membership-only identity. */
export interface ScreeningPopulation {
  /** Canonically ordered unique members (G5). */
  readonly members: readonly PopulationMember[];
  /** Membership-only population identity (G4). */
  readonly identity: string;
  /**
   * The caller-supplied outputs in ORIGINAL input order with the sector replaced by its
   * canonical spelling (G1). Input order is preserved deliberately: canonical ordering is a
   * population-identity concern (G5) and is NOT the RankingEngine presentation order.
   */
  readonly normalizedOutputs: readonly EngineOutput[];
}

/** Collapse internal whitespace, trim, and lower-case — the governed matching key. */
function canonicalKey(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

const CANONICAL_LOOKUP: ReadonlyMap<string, CanonicalSector> = new Map(
  CANONICAL_SECTORS.map((s) => [canonicalKey(s), s]),
);

const REJECTED_ALIAS_LOOKUP: ReadonlySet<string> = new Set(REJECTED_ALIASES.map(canonicalKey));

/**
 * G1 — normalize a raw sector value to one of the 13 certified names.
 *
 * Case-insensitive; surrounding whitespace removed; internal whitespace collapsed to
 * single spaces; canonical spelling emitted. Blank, unknown, and alias values are
 * REJECTED — the Screening population boundary fails closed and never falls back to a
 * permissive default.
 */
export function normalizeSector(raw: string): CanonicalSector {
  if (typeof raw !== 'string') {
    throw new ScreeningPopulationError(
      'INVALID_SECTOR',
      `NP-12 sector normalization: sector must be a string (received ${typeof raw})`,
    );
  }

  const key = canonicalKey(raw);

  if (key.length === 0) {
    throw new ScreeningPopulationError(
      'INVALID_SECTOR',
      `NP-12 sector normalization: blank sector is rejected (received ${JSON.stringify(raw)})`,
    );
  }

  const canonical = CANONICAL_LOOKUP.get(key);
  if (canonical) return canonical;

  if (REJECTED_ALIAS_LOOKUP.has(key)) {
    throw new ScreeningPopulationError(
      'INVALID_SECTOR',
      `NP-12 sector normalization: alias ${JSON.stringify(raw)} is rejected — ` +
        `the certified Screening vocabulary accepts only the 13 canonical sector names`,
    );
  }

  throw new ScreeningPopulationError(
    'INVALID_SECTOR',
    `NP-12 sector normalization: unknown sector ${JSON.stringify(raw)} is rejected — ` +
      `the certified Screening vocabulary accepts only the 13 canonical sector names`,
  );
}

/** Deterministic member comparison — normalized sector ASC, then reference identifier ASC (G5). */
export function compareMembers(a: PopulationMember, b: PopulationMember): number {
  if (a.sector !== b.sector) return a.sector < b.sector ? -1 : 1;
  if (a.referenceId !== b.referenceId) return a.referenceId < b.referenceId ? -1 : 1;
  return 0;
}

/**
 * Unambiguous, length-prefixed serialization of the canonical member sequence.
 * Length prefixing is required because the reference identifier is opaque and may itself
 * contain the delimiter, so a naive join could make two different member sets collide.
 */
function serializeMembers(members: readonly PopulationMember[]): string {
  let payload = `${members.length}:`;
  for (const m of members) {
    payload += `${m.sector.length}:${m.sector}${m.referenceId.length}:${m.referenceId}`;
  }
  return payload;
}

/**
 * G4 — membership-only population identity.
 *
 * A deterministic digest over the canonically ordered, post-rejection set of unique
 * `(normalized sector, reference identifier)` members. By construction it incorporates
 * governed membership and nothing else: not member values, not caller/portfolioId, not
 * scenario/strategy, not criteria, not timestamps, not snapshot context, and not the
 * caller-supplied array order (canonical ordering is applied first).
 */
export function populationIdentity(members: readonly PopulationMember[]): string {
  return createHash('sha256').update(serializeMembers(members), 'utf8').digest('hex');
}

/**
 * The governed Screening population boundary (G1 → G2 → G3 → G5 → G4).
 *
 * Reads the caller-supplied population, normalizes every sector, enforces uniqueness on
 * the composite, rejects duplicates, and derives the canonical member set and its
 * membership-only identity. Throws `ScreeningPopulationError` on the first violation —
 * a duplicate or invalid member can never reach downstream evaluation.
 */
export class ScreeningPopulationGuard {
  static fromOutputs(outputs: readonly EngineOutput[]): ScreeningPopulation {
    // G2 — uniqueness is enforced on the normalized composite. Keying by sector and then
    // holding a Set of opaque reference ids avoids any separator-collision hazard, since
    // the reference identifier may contain arbitrary characters.
    const bySector = new Map<CanonicalSector, Set<string>>();
    const members: PopulationMember[] = [];
    const normalizedOutputs: EngineOutput[] = [];

    for (const output of outputs) {
      // G1 — normalize the sector BEFORE any identity comparison.
      const sector = normalizeSector(output.sector);
      // The reference identifier is opaque: used exactly as supplied.
      const referenceId = output.companyId;

      let seen = bySector.get(sector);
      if (!seen) {
        seen = new Set<string>();
        bySector.set(sector, seen);
      }

      // G3 — a repeated composite is a governed violation and is REJECTED, never retained,
      // merged, averaged, silently deduplicated, or allowed to affect aggregates.
      if (seen.has(referenceId)) {
        throw new ScreeningPopulationError(
          'DUPLICATE_MEMBER',
          `NP-12 duplicate population member rejected: (${sector}, ${referenceId}) ` +
            `already present in the population`,
        );
      }
      seen.add(referenceId);

      members.push({ sector, referenceId });
      // G1 — emit canonical spelling downstream, preserving the original input order.
      normalizedOutputs.push({ ...output, sector });
    }

    // G5 — canonical ordering by (normalized sector, reference identifier). Rejection has
    // already occurred, so this orders a set of unique members and is deterministic.
    const canonicalMembers = [...members].sort(compareMembers);

    return {
      members: canonicalMembers,
      identity: populationIdentity(canonicalMembers),
      normalizedOutputs,
    };
  }
}
