/**
 * IID-0 — runtime validation of the issuer→sector assignment, at the point input is read (`S3-D1`).
 *
 * THE DEFECT THIS CLOSES. `IssuerRecord.sector` is typed as the closed `SectorName` union, but a
 * TypeScript type is erased at runtime and the ingestion CLI read its roster with an unchecked cast
 * (`JSON.parse(...) as { issuers: IssuerRecord[] }`). Nothing between the file on disk and the written
 * dataset ever tested the sector string, and `measureCoverage` selects issuers by string equality, so a
 * sector value that is not exactly one of the thirteen canonical names matched no sector at all. The
 * observed failure was total and silent: one character of case (`"Consumer"` → `"consumer"`) produced an
 * ingestion that exited `0`, printed no `ERROR` and no `WARN`, wrote `issues.json` as `[]`, persisted the
 * invalid string verbatim, and reported **0 of 13 sectors measured**. The resulting
 * `Consumer UNMEASURED … stmt 0%` row was indistinguishable from a sector that legitimately has no
 * issuers — a misleading zero in the direction that looks like success.
 *
 * THE RULE. Sector membership is now tested against the runtime vocabulary (`SECTOR_NAMES`) immediately
 * after the roster is parsed and **before** any dataset content is constructed or written. A value that
 * is missing, null, not a string, empty, whitespace-padded, differently cased, or simply outside the
 * vocabulary is rejected with an error naming the issuer and the offending value.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO:
 *
 * - It never **normalises**. A value that would become valid after trimming or case-folding is rejected,
 *   not repaired, and the error says what the exact value should have been. Silently rewriting operator
 *   input would hide the transcription mistake that caused it and would make the written dataset differ
 *   from the evidence it claims to represent.
 * - It is not bypassable by `--allow-errors`. That flag accepts *ingestion issues* discovered while
 *   constructing content; it has never meant "write a dataset built from input this build cannot
 *   interpret", and a sector it cannot place would be recorded as a measurement of nothing.
 * - It reports **every** offending issuer, not just the first, so one run surfaces the whole problem.
 */
import { SECTOR_NAMES, isSectorName } from '../contracts/operatingMetrics';

/**
 * The shape this guard needs from a roster entry.
 *
 * Deliberately `unknown` rather than `IssuerRecord`: the whole point is that the value has come out of
 * `JSON.parse` and has not been validated yet, so typing it as the record it is supposed to be would
 * repeat the original defect.
 */
export interface UnvalidatedIssuer {
  readonly issuerId?: unknown;
  readonly legalName?: unknown;
  readonly sector?: unknown;
}

/**
 * Why a sector value was rejected. Exhaustive over the ways untrusted JSON can fail the vocabulary.
 *
 * Where a value is wrong in more than one way the reason names the outermost fixable problem, per the
 * precedence documented on `classifySector`; the accompanying suggestion then states every correction
 * needed, so a compound error is never described as a simple one.
 */
export type InvalidSectorReason =
  /** The `sector` key is absent, or present with the value `undefined`. */
  | 'MISSING'
  /** Present and explicitly `null`. */
  | 'NULL'
  /** Present but not a string at all (number, boolean, array, object). */
  | 'NOT_A_STRING'
  /** The empty string. */
  | 'EMPTY'
  /** Only whitespace. */
  | 'WHITESPACE_ONLY'
  /** Leading or trailing whitespace is present, and removing it is at least part of the fix. */
  | 'WHITESPACE'
  /** Correctly padded but differently cased — sector names are case-sensitive. */
  | 'CASE'
  /** A string that is not a sector name under any transformation. */
  | 'NOT_IN_VOCABULARY';

export interface InvalidIssuerSector {
  /** Position in the roster, for locating the entry when the identifier is itself unusable. */
  readonly index: number;
  readonly issuerId: string;
  readonly legalName: string;
  /** The offending value rendered so `null`, padding and non-strings are unambiguous. */
  readonly received: string;
  readonly reason: InvalidSectorReason;
  /** Present when a canonical sector name is close enough to be worth naming. */
  readonly suggestion: SectorSuggestion | null;
}

export interface SectorSuggestion {
  readonly sector: string;
  readonly correction: 'remove whitespace' | 'match case exactly' | 'remove whitespace and match case exactly';
}

/** Renders a value for an error message: `JSON.stringify` for scalars, a type name otherwise. */
function describe(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return `${JSON.stringify(String(value))} (a ${typeof value})`;
  }
  if (Array.isArray(value)) return `an array of length ${value.length}`;
  return `a ${typeof value}`;
}

function labelOf(issuer: UnvalidatedIssuer, index: number): { issuerId: string; legalName: string } {
  const issuerId = typeof issuer.issuerId === 'string' && issuer.issuerId.length > 0
    ? issuer.issuerId
    : `<no usable issuerId at roster index ${index}>`;
  const legalName = typeof issuer.legalName === 'string' && issuer.legalName.length > 0
    ? issuer.legalName
    : '<no legalName>';
  return { issuerId, legalName };
}

/**
 * Classifies one sector value, and names the canonical sector when the value is a near miss.
 *
 * PRECEDENCE, so a value that is wrong in two ways is never described as wrong in only one:
 *
 * 1. trimming alone would fix it              → `WHITESPACE`
 * 2. case alone would fix it                  → `CASE`
 * 3. both are needed                          → `WHITESPACE`, with a correction naming both
 * 4. neither would fix it                     → `NOT_IN_VOCABULARY` — the padding is incidental, and
 *    calling it a whitespace problem would send the operator to fix the wrong thing
 *
 * Non-strings and blank strings are classified before this, since there is nothing to compare.
 */
function classifySector(value: unknown): { reason: InvalidSectorReason; suggestion: SectorSuggestion | null } {
  if (value === undefined) return { reason: 'MISSING', suggestion: null };
  if (value === null) return { reason: 'NULL', suggestion: null };
  if (typeof value !== 'string') return { reason: 'NOT_A_STRING', suggestion: null };
  if (value.length === 0) return { reason: 'EMPTY', suggestion: null };
  if (value.trim().length === 0) return { reason: 'WHITESPACE_ONLY', suggestion: null };

  const trimmed = value.trim();
  const padded = trimmed !== value;
  const exactAfterTrim = isSectorName(trimmed) ? trimmed : null;
  const caseMatch = exactAfterTrim
    ?? (SECTOR_NAMES as readonly string[]).find((sector) => sector.toLowerCase() === trimmed.toLowerCase())
    ?? null;

  // A near miss is worth naming precisely, because "the canonical value is X" is actionable and "not in
  // vocabulary" is not. Every branch below is still a rejection: nothing here rewrites the value.
  if (exactAfterTrim !== null) {
    return { reason: 'WHITESPACE', suggestion: { sector: exactAfterTrim, correction: 'remove whitespace' } };
  }
  if (caseMatch !== null) {
    return {
      reason: padded ? 'WHITESPACE' : 'CASE',
      suggestion: {
        sector: caseMatch,
        correction: padded ? 'remove whitespace and match case exactly' : 'match case exactly',
      },
    };
  }
  // Neither trimming nor case-folding would produce a sector: the padding is incidental, and reporting
  // it as a whitespace problem would send the operator to fix the wrong thing.
  return { reason: 'NOT_IN_VOCABULARY', suggestion: null };
}

/**
 * Every roster entry whose `sector` is not exactly a canonical `SectorName`.
 *
 * Pure: it reads and classifies, and never mutates the roster or repairs a value.
 */
export function findInvalidIssuerSectors(issuers: readonly UnvalidatedIssuer[]): readonly InvalidIssuerSector[] {
  const invalid: InvalidIssuerSector[] = [];
  issuers.forEach((issuer, index) => {
    const value = issuer === null || typeof issuer !== 'object' ? undefined : (issuer as UnvalidatedIssuer).sector;
    if (isSectorName(value)) return;
    const { reason, suggestion } = classifySector(value);
    const { issuerId, legalName } = issuer !== null && typeof issuer === 'object'
      ? labelOf(issuer as UnvalidatedIssuer, index)
      : labelOf({}, index);
    invalid.push({ index, issuerId, legalName, received: describe(value), reason, suggestion });
  });
  return invalid;
}

function renderInvalid(entry: InvalidIssuerSector): string {
  const hint = entry.suggestion === null
    ? ''
    : ` — ${entry.suggestion.correction}: the canonical value is ${JSON.stringify(entry.suggestion.sector)}`;
  return `  [${entry.index}] ${entry.issuerId} (${entry.legalName}): sector is ${entry.received} — ${entry.reason}${hint}`;
}

/**
 * Throws unless every roster entry carries an exactly canonical sector.
 *
 * Call this immediately after parsing untrusted input and **before** constructing or writing any
 * dataset, so a rejected roster cannot partially overwrite a dataset that is already valid: the writer
 * replaces a dataset directory file by file, so reaching it with unusable input is what would destroy
 * good data. Throwing first is what makes the failure non-destructive.
 *
 * @param issuers the parsed roster's `issuers` array (unvalidated — anything `JSON.parse` produced)
 * @param source  where the roster came from, named in the error so the operator knows which file to fix
 */
export function assertValidIssuerSectors(issuers: unknown, source: string): void {
  if (!Array.isArray(issuers)) {
    throw new Error(
      `invalid roster in ${source}: "issuers" must be an array, received ${describe(issuers)}. ` +
      'No dataset was written.',
    );
  }
  const invalid = findInvalidIssuerSectors(issuers as readonly UnvalidatedIssuer[]);
  if (invalid.length === 0) return;

  const lines = invalid.map(renderInvalid).join('\n');
  throw new Error(
    `invalid sector in ${source}: ${invalid.length} of ${issuers.length} issuer(s) do not carry a canonical sector.\n` +
    `${lines}\n` +
    `Sector names are exact and case-sensitive, and are never trimmed, case-folded or otherwise normalised. ` +
    `The ${SECTOR_NAMES.length} valid values are:\n` +
    `  ${SECTOR_NAMES.join(', ')}\n` +
    `An issuer whose sector is not one of these matches no sector in coverage measurement, which would ` +
    `silently report that sector as unmeasured rather than fail. No dataset was written.`,
  );
}
